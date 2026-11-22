// Shows the image and reports cursor position, image size and zoom to the extension.
// Everything is shown in the VS Code status bar; nothing is drawn over the image.
import type { FromWebviewMessage, ToWebviewMessage } from '../shared/messages';

const vscode = acquireVsCodeApi();
const post = (msg: FromWebviewMessage) => vscode.postMessage(msg);

const stage = document.getElementById('stage') as HTMLDivElement;
const image = document.getElementById('image') as HTMLImageElement;

let scale = 1;
let imgW = 0;
let imgH = 0;

window.addEventListener('message', async (e: MessageEvent<ToWebviewMessage>) => {
  const msg = e.data;
  if (msg.type !== 'image') return;
  try {
    image.src = msg.src;
    await image.decode();
  } catch (err) {
    post({ type: 'error', message: String(err) });
    return;
  }
  const first = imgW === 0;
  imgW = image.naturalWidth;
  imgH = image.naturalHeight;
  if (first) fitToWindow();
  else applyScale();
});

function fitToWindow() {
  const s = Math.min((stage.clientWidth - 20) / imgW, (stage.clientHeight - 20) / imgH, 1);
  scale = s > 0 ? s : 1;
  applyScale();
}

function applyScale() {
  image.style.width = `${imgW * scale}px`;
  image.style.height = `${imgH * scale}px`;
  post({ type: 'size', w: imgW, h: imgH, zoom: Math.round(scale * 100) });
}

/** Mouse position -> image pixel coordinates (correct at any zoom level). */
function toPixel(e: MouseEvent) {
  const r = image.getBoundingClientRect();
  const x = Math.floor(((e.clientX - r.left) / r.width) * imgW);
  const y = Math.floor(((e.clientY - r.top) / r.height) * imgH);
  return { x, y, inside: x >= 0 && y >= 0 && x < imgW && y < imgH };
}

image.addEventListener('mousemove', (e) => {
  if (!imgW) return;
  const { x, y, inside } = toPixel(e);
  if (!inside) return;
  post({ type: 'pos', x, y });
});

image.addEventListener('mouseleave', () => {
  if (!imgW) return;
  post({ type: 'leave' });
});

/** Change zoom, keeping the point under the cursor fixed. */
function zoomAt(e: MouseEvent, factor: number) {
  const r = image.getBoundingClientRect();
  const px = (e.clientX - r.left) / scale;
  const py = (e.clientY - r.top) / scale;
  scale = Math.min(Math.max(scale * factor, 0.05), 64);
  applyScale();
  const r2 = image.getBoundingClientRect();
  stage.scrollLeft += r2.left + px * scale - e.clientX;
  stage.scrollTop += r2.top + py * scale - e.clientY;
}

// Same as the built-in preview: click to zoom in, Alt+click to zoom out. Shift+click copies the coordinates.
image.addEventListener('click', (e) => {
  if (!imgW) return;
  if (!e.shiftKey) {
    zoomAt(e, e.altKey ? 0.8 : 1.25);
    return;
  }
  const { x, y, inside } = toPixel(e);
  if (!inside) return;
  const text = `${x},${y}`;
  navigator.clipboard.writeText(text).then(() => post({ type: 'copied', text }));
});

// Ctrl+wheel zooms around the cursor; a plain wheel scrolls.
stage.addEventListener(
  'wheel',
  (e) => {
    if (!imgW) return;
    if (!e.ctrlKey && !e.metaKey && !e.altKey) return;
    e.preventDefault();
    zoomAt(e, e.deltaY < 0 ? 1.25 : 0.8);
  },
  { passive: false },
);

window.addEventListener('keydown', (e) => {
  if (e.key === '0') fitToWindow();
  if (e.key === '1') {
    scale = 1;
    applyScale();
  }
});

post({ type: 'ready' });
