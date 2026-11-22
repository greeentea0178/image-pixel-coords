# Image Pixel Coords

A small image viewer that shows the pixel coordinates under the cursor in the status bar.

That is most of what it does. It does not edit images or pick colors.

## Usage

Open an image with the viewer:

- Explorer: right-click an image → **Open with Pixel Coordinates Viewer**
- Editor: **Reopen Editor With…** → **Image Pixel Coords**

Move the mouse over the image. The status bar shows `x, y px` and the image size with the zoom level.

| Action | Result |
|---|---|
| Click / Alt+click | Zoom in / out |
| Ctrl+wheel (Cmd on macOS) | Zoom around the cursor |
| Shift+click | Copy `x,y` |
| `0` / `1` | Fit to window / 100% |

Coordinates start at `(0, 0)` in the top-left corner. The image reloads when the file changes on disk.

Supported formats: PNG, JPEG, GIF, BMP, WebP.

## Use as the default image viewer

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

To go back, use **Reopen Editor With…** → **Image Preview**.

## License

[MIT](LICENSE)

---

## 日本語

画像を開いているとき、カーソル位置のピクセル座標をステータスバーに表示するだけの、小さな画像ビューアです。画像の編集や色の取得はできません。

- 開き方: エクスプローラーで画像を右クリック →「ピクセル座標ビューアで開く」、または「Reopen Editor With…」→「Image Pixel Coords」
- 画像の上でマウスを動かすと、ステータスバーに `x, y px` と画像サイズ・倍率が出ます
- クリックで拡大、Alt+クリックで縮小、Ctrl+ホイールで拡大縮小、Shift+クリックで座標をコピー、`0` で画面に合わせる、`1` で等倍
- 座標は左上が `(0, 0)` です。画像ファイルが書き換わると読み込み直します
