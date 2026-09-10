# Chat Background plugin (dynamic Cordis)

A temporary, session-scoped Cordis plugin that tints the DeepSeek Harness web
GUI chat area with a wallpaper and translucent UI surfaces.

## Files

- `host.js`   — Host half: `chat-bg://load` / `chat-bg://save` RPC that persists
                settings to `<workspace>/chat-bg.json` via the `fs` service.
- `client.js` — Client (browser) half: the settings page (Settings → Chat
                Background) plus the wallpaper/translucency CSS.

## How to re-create it in a new session

Dynamic Cordis plugins do **not** survive a process restart. In a fresh session,
rebuild it from these files:

1. `cordis_define` a **new** plugin — `kind: "new"`, `idPrefix: "chbg"` — with
   `code.host` = the body of `host.js` and `code.client` = the body of
   `client.js` (the `return { ... }` expressions, without the leading comments).

2. `cordis_run` the returned `pluginId` / `packageId` (mode `run`). Approve the
   activation in the UI; the client activates asynchronously.

3. Open **Settings → Chat Background**.

## Important notes

- **Not a durable preset.** A dynamic plugin's code (especially a `code.client`
  browser half) is not a loadable package `name` for a `cordis.yml` row, so it
  cannot be "installed permanently" as a composition row. The only supported
  persistence is re-`cordis_define`/`cordis_run` each session (step 2 above).
- **No blur.** `backdrop-filter` (the only way to frost the UI panels
  themselves) destabilizes the app's fixed-position settings modal regardless of
  where it is applied, so blur was removed. The result is a sharp wallpaper +
  translucent surfaces, which is fully stable.
- **Settings path.** Stored at `chat-bg.json` in the session workspace
  (`C:\Projects\Home` in the current session).
