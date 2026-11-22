// Messages exchanged between the extension (src/extension.ts) and the webview (src/webview/viewer.ts).
// Type-only module: it is used for type checking and emits no runtime code that either side loads.

/** Extension -> webview */
export type ToWebviewMessage = {
  type: 'image';
  /** data URL of the image file */
  src: string;
};

/** Webview -> extension */
export type FromWebviewMessage =
  | { type: 'ready' }
  | { type: 'size'; w: number; h: number; zoom: number }
  | { type: 'pos'; x: number; y: number }
  | { type: 'leave' }
  | { type: 'copied'; text: string }
  | { type: 'error'; message: string };
