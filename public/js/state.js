export const SERVER = "http://localhost:3333";

export const state = {
  reportData: [],
  stats: {
    pass: 0,
    fail: 0,
    error: 0,
  },
  scanProgress: {
    total: 0,
    done: 0,
  },
  hitRows: [],
  scanStartedAtMs: null,
  currentScanController: null,
  isScanning: false,
  /** When true, log each SSE payload to the browser console (checkbox or ?debug=1). */
  clientScanDebug: false,
  urlSourceMode: "sitemap",
  parsedUrlList: null,
  urlListParseTimer: null,
};
