# deepseek-bg-changer

A permanent, **enabled-by-default** wallpaper plugin for the DeepSeek Harness
(DSH) web GUI: it tints the chat area with a background image and makes the UI
surfaces translucent.

Installed once, it survives DSH restarts — no session-scoped plugin rebuilds.

## Features

- **Default on.** Mounts as a static composition row (`chat-bg` in the
  profile's `cordis.patch.yml`) and applies at page load.
- **Built-in gradient.** Without a chosen image it renders a subtle gradient
  that follows the active light/dark color scheme (listens to `theme/change`).
- **Wallpaper** — image URL or local file (embedded as data URL), with
  Cover / Stretch / Zoom-% fit, position presets or custom X/Y, and a
  0–80 % dim layer.
- **Translucent UI** — below 100 % surface opacity the theme tokens for the
  base layer, sidebar, input, tips, selector, and chat bubbles become
  translucent (`--dsw-alias-*` / `--dsw-specific-*` overrides), so the
  wallpaper shows through the whole interface, sidebar included.
- **Persistence** — settings live in the browser
  (`localStorage["dsh.chat-background.settings"]`); they survive DSH
  restarts without any host-side storage.
- **Settings UI** — a **Chat Background** section in Settings (file pickers,
  sliders, status line), registered through the `settings.section` slot.

## Repo layout

```
package.json        the dual-face package manifest (dsh.client declaration)
lib/index.js        host half — intentional no-op (the row needs a host module)
lib/client.js       browser half: wallpaper + token overrides + settings UI
install.sh          one-shot installer (copies the package + adds the row)
INSTALL.md          install / verify / uninstall guide
legacy/dynamic/     the obsolete session-scoped variant (cordis_define era)
```

## Install

See **[INSTALL.md](INSTALL.md)** — one command with the script, or three
manual steps. Short version:

```sh
./install.sh      # copies package into $DSH_HOME/profiles/node_modules/
                  # and adds the chat-bg row to profiles/web/cordis.patch.yml
# restart the DSH web process, reload the page
```

## How it works

Dual-face plugin package:

1. **Host composition.** The row `- { id: chat-bg, name: dsh-chat-background }`
   sits in `profiles/web/cordis.patch.yml`. The host Loader imports the
   no-op `lib/index.js`; the client-module system scans the package's
   `dsh.client` declaration (`platform: web`, injected after the slots/theme
   providers) and serves the browser bundle at
   `/plugins/??dsh-chat-background/client.js`.
2. **Page load.** The boot graph (`window.__DSH_BOOT__`) carries the entry;
   the browser Cordis loader activates the same composition row in the page.
   The plugin then injects the wallpaper `<style>`, overrides the
   `--dsw-*` theme tokens for translucency, and registers its settings
   section.
3. **Stability note.** No `backdrop-filter` blur: frosted panels destabilize
   the app's fixed-position settings modal regardless of where the filter is
   applied. The result is a sharp wallpaper + translucent surfaces, which is
   fully stable.

## History

- **v1 (legacy/dynamic)** — dynamic Cordis plugin, re-created per session via
  `cordis_define` / `cordis_run`, settings persisted host-side to
  `chat-bg.json`.
- **v2 (current)** — static deployment package: default-on, restart-proof,
  localStorage persistence, theme-aware built-in gradient, one-shot
  installer.