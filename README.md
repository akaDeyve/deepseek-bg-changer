# deepseek-bg-changer

A plugin for the DeepSeek Harness (DSH) web GUI. It sets a background image or gradient behind the chat area and makes UI surfaces translucent. Settings persist across DSH restarts.

**Status: This project is no longer maintained.** There are no planned updates or bug fixes. The plugin works as published, but the known issues below remain open. Forks are welcome.

**License:** [MIT](LICENSE)

## Features

- Enabled by default, loads on page load
- Background from an image URL, a local file, or a gradient
- Fit modes: Cover, Stretch, Zoom, plus custom position
- Darken overlay from 0 to 80%, optional fade to bottom
- Sidebar, chat bubbles, and input field become translucent below 100% UI opacity
- Accent color for buttons, links, and highlights
- Optional backdrop blur for sidebar and message box
- Settings stored in browser localStorage

## Known issues

- **Performance with high blur:** Large blur values on the sidebar and message box slow down rendering, especially on weaker hardware.
- **No server/client sync:** Settings exist only in the browser's localStorage. They are not shared between browsers or devices and are not stored on the DSH server.
- **UI:** Some interface elements do not match the background well at every opacity level, and a few views may still have layout problems.

## Installation

### Option 1: Install script

```sh
git clone https://github.com/akaDeyve/deepseek-bg-changer.git
cd deepseek-bg-changer
chmod +x install.sh
./install.sh
```

Restart the DSH web process and reload the page.

### Option 2: Manual installation

1. Copy the plugin into your DSH profile:

```sh
   DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
   mkdir -p "$DSH_HOME/profiles/node_modules/dsh-chat-background/lib"
   cp package.json "$DSH_HOME/profiles/node_modules/dsh-chat-background/"
   cp lib/index.js lib/client.js "$DSH_HOME/profiles/node_modules/dsh-chat-background/lib/"
```

2. Add this entry to `$DSH_HOME/profiles/web/cordis.patch.yml`:

```yaml
   - insert:
       - id: chat-bg
         name: dsh-chat-background
```

3. Restart DSH and reload the page.

## Uninstall

Delete the plugin folder and remove the `chat-bg` entry from `cordis.patch.yml`:

```sh
rm -rf "$DSH_HOME/profiles/node_modules/dsh-chat-background"
```

## Settings

Open **Settings → Chat Background** in DSH:

- **Enabled:** Turn the plugin on or off
- **Image source:** URL or local file
- **Fit:** Cover, Stretch, or Zoom
- **Position:** Presets or custom X/Y
- **Darken:** 0 to 80%
- **Fade to bottom:** Darkens the page toward the bottom
- **UI opacity:** 20 to 100%
- **Accent color:** Buttons and links
- **Sidebar blur:** 0 to 30px
- **Message box blur:** 0 to 30px

## How it works

- **Host side (`lib/index.js`):** A minimal stub required for plugin registration.
- **Client side (`lib/client.js`):** Runs in the browser, applies the background, overrides theme colors, and provides the settings panel.

The entry in `cordis.patch.yml` loads the plugin on startup.

## Version history

- **v1.1.1:** Theme tokens update only when values actually change
- **v1.1:** Accent color, fade to bottom, optional blur for sidebar and message box
- **v1.0:** Static plugin, enabled by default, persists across restarts, settings in browser storage
- **v0 (legacy):** Dynamic plugin, obsolete. It had to be recreated on every start
