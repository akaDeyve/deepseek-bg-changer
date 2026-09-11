# Legacy: session-scoped dynamic variant

The files here are the **original dynamic Cordis plugin** version:

- `host.js` — Host half (`chat-bg://load` / `chat-bg://save` RPC, persisted to
  `chat-bg.json` via the `fs` service).
- `client.js` — Client half (settings UI + wallpaper CSS, `styles.insert` /
  `host.call` closure symbols).
- `INSTALL.md` — the one-shot paste prompt for `cordis_define` / `cordis_run`.

**Obsolete since the static rewrite.** Dynamic plugins live only in the
running DSH process: they vanish on restart and must be re-defined each
session. The static package at the repo root (`dsh-chat-background`) mounts
permanently through the composition and is enabled by default — use
`INSTALL.md` at the repo root instead.
