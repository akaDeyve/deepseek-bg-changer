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
  0–80 % dim layer (uniform, or "fade to bottom" — a vertical gradient that
  goes fully dark toward the page bottom).
- **Translucent UI** — below 100 % surface opacity the theme tokens for the
  base layer, sidebar, input, tips, selector, and chat bubbles become
  translucent (`--dsw-alias-*` / `--dsw-specific-*` overrides), so the
  wallpaper shows through the whole interface, sidebar included.
- **Accent color** — optional swatch row (presets + custom picker) that
  retints the primary/info buttons, brand color, and links, with derived
  hover/dark variants (`shade()` helpers adapted from
  [EsshUwU/dsh-theme](https://github.com/EsshUwU/dsh-theme), MIT).
- **Opt-in frosted extensions** — with a background image, "Extend to
  sidebar" and "Blur message box" add adjustable `backdrop-filter` blur to
  the narrow targets `[class*="sidebarCol"]` / `[data-composer-card]` plus
  translucent elevated-button tokens. A blanket blur anywhere destabilizes
  the app's fixed-position settings modal — scoped to these narrow targets
  it is stable (each toggle ships its own cleanup).
- **Persistence** — settings live in the browser
  (`localStorage["dsh.chat-background.settings"]`); they survive DSH
  restarts without any host-side storage.
- **Settings UI** — a **Chat Background** section in Settings (file pickers,
  sliders, status line), registered through the `settings.section` slot.

## Repo layout

```
package.json        the dual-face package manifest (dsh.client + dsh.bundle)
lib/index.js        host half — intentional no-op (the row needs a host module)
lib/client.js       browser half: wallpaper + token overrides + settings UI
cordis.patch.yml    the package's own patch — used by the ALTERNATIVE bundle install
install.sh          one-shot installer (copies the package + adds the row)
INSTALL.md          install / verify / uninstall guide (both paths)
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
3. **Stability note.** No blanket `backdrop-filter`: frosted panels across the
   whole UI destabilize the app's fixed-position settings modal. The opt-in
   "Extend to sidebar" / "Blur message box" toggles scope the blur to two
   narrow targets (`[class*="sidebarCol"]`, `[data-composer-card]`), which is
   stable. The result is a sharp wallpaper + translucent surfaces.

## History

- **v1.0** — static deployment package: default-on, restart-proof,
  localStorage persistence, theme-aware built-in gradient, one-shot
  installer.
- **v1.1** — accent color, fade-to-bottom dim, opt-in sidebar/message-box
  blur (learned from EsshUwU/dsh-theme), `external: ["react"]` manifest
  declaration, package-bundle patch file for the alternative install path.
- **v0 (legacy/dynamic)** — dynamic Cordis plugin, re-created per session via
  `cordis_define` / `cordis_run`, settings persisted host-side to
  `chat-bg.json`.