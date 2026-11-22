import * as vscode from 'vscode';
import { randomBytes } from 'crypto';
import type { FromWebviewMessage, ToWebviewMessage } from './shared/messages';

const VIEW_TYPE = 'imagePixelCoords.viewer';

const MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  bmp: 'image/bmp',
  webp: 'image/webp',
};

export function activate(context: vscode.ExtensionContext) {
  // Two status bar items: cursor coordinates, and image size + zoom (always shown while the viewer is active).
  const coordsItem = vscode.window.createStatusBarItem('imagePixelCoords.coords', vscode.StatusBarAlignment.Right, 101);
  coordsItem.name = vscode.l10n.t('Image Pixel Coords: Cursor Position');
  const sizeItem = vscode.window.createStatusBarItem('imagePixelCoords.size', vscode.StatusBarAlignment.Right, 100);
  sizeItem.name = vscode.l10n.t('Image Pixel Coords: Image Size');
  context.subscriptions.push(coordsItem, sizeItem);

  const provider = new PixelCoordsEditorProvider(context, coordsItem, sizeItem);
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(VIEW_TYPE, provider, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
  );

  // Open from the Explorer context menu or the Command Palette.
  // From the Explorer, VS Code passes (clicked uri, all selected uris).
  context.subscriptions.push(
    vscode.commands.registerCommand('imagePixelCoords.open', async (uri?: unknown, uris?: unknown) => {
      let targets = (Array.isArray(uris) && uris.length > 0 ? uris : [uri]).filter(isImage);
      if (targets.length === 0) {
        const active = activeTabUri();
        if (isImage(active)) targets = [active];
      }
      if (targets.length === 0) {
        const picked = await vscode.window.showOpenDialog({
          canSelectMany: true,
          filters: { [vscode.l10n.t('Images')]: Object.keys(MIME) },
        });
        targets = (picked ?? []).filter(isImage);
      }
      for (const target of targets) {
        await vscode.commands.executeCommand('vscode.openWith', target, VIEW_TYPE);
      }
    }),
  );
}

function extensionOf(uri: vscode.Uri): string {
  return uri.path.split('.').pop()?.toLowerCase() ?? '';
}

function isImage(value: unknown): value is vscode.Uri {
  return value instanceof vscode.Uri && Object.hasOwn(MIME, extensionOf(value));
}

/** URI of the file in the active tab, whether it is a text editor or a custom editor (e.g. the built-in image preview). */
function activeTabUri(): vscode.Uri | undefined {
  const input = vscode.window.tabGroups.activeTabGroup.activeTab?.input;
  if (input instanceof vscode.TabInputText || input instanceof vscode.TabInputCustom) {
    return input.uri;
  }
  return undefined;
}

export function deactivate() {}

class PixelCoordsEditorProvider implements vscode.CustomReadonlyEditorProvider {
  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly coordsItem: vscode.StatusBarItem,
    private readonly sizeItem: vscode.StatusBarItem,
  ) {}

  openCustomDocument(uri: vscode.Uri): vscode.CustomDocument {
    return { uri, dispose() {} };
  }

  async resolveCustomEditor(document: vscode.CustomDocument, panel: vscode.WebviewPanel): Promise<void> {
    const mediaRoot = vscode.Uri.joinPath(this.context.extensionUri, 'media');
    const scriptRoot = vscode.Uri.joinPath(this.context.extensionUri, 'out', 'webview');
    panel.webview.options = { enableScripts: true, localResourceRoots: [mediaRoot, scriptRoot] };
    panel.webview.html = this.getHtml(panel.webview, mediaRoot, scriptRoot);
    const post = (msg: ToWebviewMessage) => panel.webview.postMessage(msg);

    // Incremented on every load; a load that finishes after a newer one has started is discarded,
    // so an older image can never replace a newer one.
    let loadId = 0;
    const sendImage = async () => {
      const id = ++loadId;
      // Send the image as a data URL string. Passing raw bytes (Uint8Array) does not arrive
      // reliably in some remote setups (e.g. WSL).
      const bytes = await vscode.workspace.fs.readFile(document.uri);
      if (id !== loadId) return;
      const mime = MIME[extensionOf(document.uri)] ?? 'application/octet-stream';
      // Wrap the same memory instead of copying it.
      const base64 = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength).toString('base64');
      await post({ type: 'image', src: `data:${mime};base64,${base64}` });
    };

    // Latest state of this panel, restored when switching back to its tab.
    let sizeText = '';
    let coordsText = '';
    const refresh = () => {
      if (!panel.active) return;
      this.sizeItem.text = sizeText;
      this.coordsItem.text = coordsText;
      if (sizeText) {
        this.sizeItem.show();
      } else {
        this.sizeItem.hide();
      }
      if (coordsText) {
        this.coordsItem.show();
      } else {
        this.coordsItem.hide();
      }
    };

    panel.webview.onDidReceiveMessage((msg: FromWebviewMessage) => {
      switch (msg.type) {
        case 'ready':
          sendImage().catch((e) =>
            vscode.window.showErrorMessage(vscode.l10n.t('Could not load the image: {0}', String(e))),
          );
          break;
        case 'size':
          sizeText = `${msg.w}×${msg.h}  ${msg.zoom}%`;
          break;
        case 'pos':
          coordsText = `$(location) ${msg.x}, ${msg.y} px`;
          break;
        case 'leave':
          coordsText = '';
          break;
        case 'copied':
          vscode.window.setStatusBarMessage(`$(copy) ${vscode.l10n.t('Copied {0}', msg.text)}`, 1500);
          break;
        case 'error':
          vscode.window.showErrorMessage(vscode.l10n.t('Could not load the image: {0}', msg.message));
          break;
      }
      refresh();
    });

    panel.onDidChangeViewState(() => {
      if (panel.active) {
        refresh();
      } else {
        this.sizeItem.hide();
        this.coordsItem.hide();
      }
    });

    // Reload when the file changes on disk.
    // Watch the whole folder and compare URIs instead of using the file name as a glob pattern,
    // so names containing glob characters ([ ] { } * ?) still match. Handle onDidCreate too:
    // some tools save by deleting/renaming and re-creating the file. Bursts of events are debounced,
    // so delete + create counts as one save; only a delete that is not followed by a create ends up
    // as a failed reload and a warning.
    const dir = vscode.Uri.joinPath(document.uri, '..');
    const watcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(dir, '*'));
    let reloadTimer: ReturnType<typeof setTimeout> | undefined;
    const onFileEvent = (changed: vscode.Uri) => {
      if (changed.toString() !== document.uri.toString()) return;
      clearTimeout(reloadTimer);
      reloadTimer = setTimeout(() => {
        sendImage().catch((e) => {
          if (e instanceof vscode.FileSystemError && e.code === 'FileNotFound') {
            vscode.window.showWarningMessage(vscode.l10n.t('The image file was deleted: {0}', document.uri.fsPath));
          }
        });
      }, 100);
    };
    watcher.onDidChange(onFileEvent);
    watcher.onDidCreate(onFileEvent);
    watcher.onDidDelete(onFileEvent);

    panel.onDidDispose(() => {
      clearTimeout(reloadTimer);
      watcher.dispose();
      this.sizeItem.hide();
      this.coordsItem.hide();
    });
  }

  private getHtml(webview: vscode.Webview, mediaRoot: vscode.Uri, scriptRoot: vscode.Uri): string {
    const script = webview.asWebviewUri(vscode.Uri.joinPath(scriptRoot, 'viewer.js'));
    const style = webview.asWebviewUri(vscode.Uri.joinPath(mediaRoot, 'viewer.css'));
    const nonce = randomBytes(16).toString('base64');
    return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; img-src ${webview.cspSource} data:; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${style}">
</head>
<body>
  <div id="stage"><img id="image" alt="" draggable="false"></div>
  <script type="module" nonce="${nonce}" src="${script}"></script>
</body>
</html>`;
  }
}
