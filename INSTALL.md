# Install (permanent, static)

The plugin is now a **deployment-local package** mounted by the host
composition — no `cordis_define` dance, no re-creating per session. Once
installed it is **enabled by default**, survives DSH restarts, and keeps its
settings in the browser.

## Requirements

- A DeepSeek Harness (DSH) deployment with the **web profile** (the standard
  GUI setup, `dsh web`). The plugin rides the shipped client-module roster
  (`dsh.client` scan), so no extra packages are needed.

## Option A — one-shot script

```sh
git clone https://github.com/akaDeyve/deepseek-bg-changer.git
cd deepseek-bg-changer
chmod +x install.sh
./install.sh                     # DSH_HOME=... PROFILE=web are honored
```

Then restart the DSH web process and reload the browser page.

## Option B — manual install

1. Copy the package into the profile tree (adjust `DSH_HOME`):

   ```sh
   DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
   mkdir -p "$DSH_HOME/profiles/node_modules/dsh-chat-background/lib"
   cp package.json "$DSH_HOME/profiles/node_modules/dsh-chat-background/"
   cp lib/index.js lib/client.js "$DSH_HOME/profiles/node_modules/dsh-chat-background/lib/"
   ```

2. Add the row to the profile's patch layer
   (`$DSH_HOME/profiles/web/cordis.patch.yml`) — replace a bare `[]` with
   this, or append it as a further top-level entry:

   ```yaml
   - insert:
       - id: chat-bg
         name: dsh-chat-background
   ```

3. Restart the DSH web process, then reload the page.

> Tip: `dsh --profile web --dump-config` should print the row
> (`# == .../cordis.patch.yml` → `- id: chat-bg / name: dsh-chat-background`).

## Option C — package bundle (alternative)

The package also carries its own patch (`cordis.patch.yml` via the
`dsh.bundle.patch` manifest key). Declare it as a profile bundle instead of
editing the profile patch file:

```sh
cd deepseek-bg-changer
dsh plugin --profile web add "$(pwd)"     # installs into profile node_modules
# add "dsh-chat-background" to dsh.profile.bundles in
# $DSH_HOME/profiles/web/package.json
```

Then restart + reload. **Never run both paths at once:** the bundle patch AND
a manual row in the profile's cordis.patch.yml would register the package
twice — the client module scan rejects that ("resolves from multiple active
Loader sources"). Pick exactly one.

## Verify

- Boot graph: fetch the GUI URL (the token URL printed by `dsh web`) and look
  for `"id":"dsh-chat-background"` inside `window.__DSH_BOOT__`.
- Settings → **Chat Background** shows the section; status reads
  `built-in gradient` until an image is chosen.

## Settings

- **Enabled** — default on. Disabling clears wallpaper and token overrides.
- **Image URL / Local file** — wallpaper source (local files are embedded as
  data URLs).
- **Fit** — Cover (crop) / Stretch / Zoom %, **Position** — presets or custom
  X/Y.
- **Dim (darken)** — 0–80% black layer over the image.
- **Fade to bottom** — replaces the uniform dim with a vertical gradient that
  goes fully dark toward the page bottom (background image only).
- **Surface opacity %** — 20–100; below 100 the UI layers (incl. sidebar,
  input, bubbles) become translucent via theme-token overrides.
- **Accent** — swatch row (presets, custom picker, × to reset); retints
  primary/info buttons, brand color, and links with derived hover/dark
  variants.
- **Extend to sidebar** — with a background image: translucent elevated
  buttons plus an adjustable `backdrop-filter` blur on the sidebar column
  (0–30 px).
- **Blur message box** — with a background image: adjustable blur on the
  composer card (0–30 px).

Storage: `localStorage["dsh.chat-background.settings"]` (per browser).

## Uninstall

```sh
rm -rf "$DSH_HOME/profiles/node_modules/dsh-chat-background"
# remove the chat-bg row from $DSH_HOME/profiles/web/cordis.patch.yml
# restart DSH + reload the page
```

## How it works (short version)

A dual-face package: the host half (`lib/index.js`) is an intentional no-op;
the browser half (`lib/client.js`) registers into the client module system via
the package's `dsh.client` declaration (`platform: web`, injected after the
slots/theme providers). At page load the boot graph (`window.__DSH_BOOT__`)
serves `/plugins/??dsh-chat-background/client.js`; the browser Cordis loader
activates the same composition row in the page, where the plugin applies the
wallpaper `<style>`, overrides the `--dsw-*` theme tokens for translucency,
and registers the `settings.section` slot.

## Legacy (dynamic) variant

The `legacy/dynamic/` folder keeps the original session-scoped plugin
(`host.js` + `client.js` code bodies, re-created per session via
`cordis_define` / `cordis_run`). It is obsolete: dynamic plugins do not
survive a process restart, which is exactly what the static package fixes.
