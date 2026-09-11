// Host half of the chat-background plugin.
//
// The wallpaper, its settings section, and persistence (browser localStorage)
// live entirely in the browser half (./client). This host half is an
// intentional no-op: the Loader row only needs a mountable plugin so the
// client module system scans the package's `dsh.client` declaration and
// serves `lib/client.js` to the browser.

export function apply() {}
