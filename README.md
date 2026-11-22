# Image Pixel Coords

An image viewer for VS Code that shows the **pixel coordinates under your cursor**.

Handy when you need exact positions in screenshots, maps, sprites or masks — without leaving the editor.

## Features

- **Cursor coordinates** in the status bar: `📍 1856, 791 px`
- **Image size and zoom** always visible: `2482×1755  31%`
- Pixels stay sharp (no smoothing) when zoomed in, so you can point at a single pixel
- **Auto reload** when the image file changes on disk
- Supports PNG, JPEG, GIF, BMP and WebP
- English and Japanese UI

## Usage

Open an image with this viewer in one of these ways:

- Right-click an image in the Explorer → **Open with Pixel Coordinates Viewer**
- With an image open, run **Reopen Editor With…** → **Image Pixel Coords**
- Command Palette → **Image Pixel Coords: Open with Pixel Coordinates Viewer**

| Action | Result |
|---|---|
| Move the mouse | Show coordinates |
| Click / Alt+click | Zoom in / out |
| Ctrl+mouse wheel | Zoom around the cursor |
| Shift+click | Copy `x,y` to the clipboard |
| `0` | Fit to window |
| `1` | Actual size (100%) |

### Make it the default image viewer

Add this to your `settings.json` to open images with this viewer by default:

```json
"workbench.editorAssociations": {
  "*.png": "imagePixelCoords.viewer",
  "*.jpg": "imagePixelCoords.viewer",
  "*.jpeg": "imagePixelCoords.viewer",
  "*.gif": "imagePixelCoords.viewer",
  "*.bmp": "imagePixelCoords.viewer",
  "*.webp": "imagePixelCoords.viewer"
}
```

You can always switch back with **Reopen Editor With…** → **Image Preview**.

## Notes

- Coordinates are zero-based, with `(0, 0)` at the top-left pixel.
- The viewer is read-only; it never modifies your images.

## License

MIT — see the LICENSE file included with this extension.

---

## 日本語

画像を開いているとき、カーソル位置のピクセル座標をステータスバーに表示する VS Code 拡張機能です。

- 座標（`📍 x, y px`）、画像サイズと倍率を表示
- クリックで拡大、Alt+クリックで縮小、Ctrl+ホイールでカーソル位置を中心に拡大縮小
- Shift+クリックで座標 `x,y` をコピー、`0` で画面に合わせる、`1` で等倍
- 画像ファイルが書き換わると自動で再読み込み

開き方: エクスプローラーで画像を右クリック →「ピクセル座標ビューアで開く」、または「Reopen Editor With…」→「Image Pixel Coords」。
既定のビューアにする方法は上の「Make it the default image viewer」を参照してください。
