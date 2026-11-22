# Image Pixel Coords

An image viewer for VS Code that shows the **pixel coordinates under your cursor** in the status bar.

Handy when you need exact positions in screenshots, maps, sprites or masks — without leaving the editor.

## Features

- **Cursor coordinates** in the status bar, e.g. `1856, 791 px`
- **Image size and zoom** always visible, e.g. `2482×1755  31%`
- Pixels stay sharp (no smoothing) when zoomed in, so you can point at a single pixel
- **Auto reload** when the image file changes on disk, with a warning if the file is deleted
- Open several images at once from the Explorer
- Supports PNG, JPEG, GIF (including animated GIFs), BMP and WebP
- English and Japanese UI

## Usage

Open an image with this viewer in one of these ways:

- Right-click one or more images in the Explorer → **Open with Pixel Coordinates Viewer**
- With an image open, run **Reopen Editor With…** → **Image Pixel Coords**
- Command Palette → **Image Pixel Coords: Open with Pixel Coordinates Viewer**
  (opens the image in the active tab, or asks you to pick files)

| Action | Result |
|---|---|
| Move the mouse over the image | Show the coordinates in the status bar |
| Click / Alt+click | Zoom in / out |
| Ctrl+mouse wheel (Cmd on macOS) | Zoom around the cursor |
| Shift+click | Copy `x,y` to the clipboard |
| `0` | Fit to window |
| `1` | Actual size (100%) |

The `0` and `1` keys work while the viewer has keyboard focus.

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

- Coordinates are zero-based, with `(0, 0)` at the top-left pixel. `x` grows to the right and `y` grows downward.
- The viewer is read-only; it never modifies your images.
- Very large images may take a moment to load.

## License

[MIT](LICENSE)

---

## 日本語

画像を開いているとき、カーソル位置のピクセル座標をステータスバーに表示する VS Code 拡張機能です。

- カーソル位置の座標（例: `1856, 791 px`）と、画像サイズ・倍率（例: `2482×1755  31%`）をステータスバーに表示
- 拡大してもぼやけず、1 ピクセル単位で狙える
- 画像ファイルが書き換わると自動で再読み込み（削除されたときは警告）
- PNG / JPEG / GIF（アニメーション GIF も可）/ BMP / WebP に対応

| 操作 | 結果 |
|---|---|
| 画像の上でマウスを動かす | ステータスバーに座標を表示 |
| クリック / Alt+クリック | 拡大 / 縮小 |
| Ctrl+ホイール（macOS は Cmd） | カーソル位置を中心に拡大縮小 |
| Shift+クリック | 座標 `x,y` をクリップボードにコピー |
| `0` | 画面に合わせる |
| `1` | 等倍（100%） |

`0` と `1` のキーは、ビューアにキーボードのフォーカスがあるときに使えます。

開き方: エクスプローラーで画像を右クリック（複数選択可）→「ピクセル座標ビューアで開く」、または「Reopen Editor With…」→「Image Pixel Coords」。
既定のビューアにする方法は、上の「Make it the default image viewer」を参照してください。
