# deepseek-bg-changer

A permanent wallpaper plugin for the DeepSeek Harness (DSH) web GUI. It adds a background image or gradient to the chat area and makes the UI surfaces translucent. Once installed, it stays active across DSH restarts.

**License:** [MIT](LICENSE)

## Features

- **Enabled by default** – Loads automatically on page load
- **Background image or gradient** – Image URL or local file, with Cover/Stretch/Zoom fit and custom positioning
- **Darken overlay** – 0–80% dim layer, with optional fade-to-bottom gradient
- **Translucent UI** – Sidebar, chat bubbles, input field, and other elements become transparent below 100% opacity
- **Accent color** – Color picker for buttons, links, and highlights
- **Optional blur** – Adjustable backdrop blur for sidebar and message box
- **Persistent settings** – Saved in browser localStorage, survives DSH restarts

## Installation

Two recommended methods to install the plugin:

### Method 1: One-shot script

```sh
git clone https://github.com/akaDeyve/deepseek-bg-changer.git
cd deepseek-bg-changer
chmod +x install.sh
./install.sh
```

Then restart the DSH web process and reload the page.

### Method 2: Manual install

1. Copy the plugin to your DSH profile:

   ```sh
   DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
   mkdir -p "$DSH_HOME/profiles/node_modules/dsh-chat-background/lib"
   cp package.json "$DSH_HOME/profiles/node_modules/dsh-chat-background/"
   cp lib/index.js lib/client.js "$DSH_HOME/profiles/node_modules/dsh-chat-background/lib/"
   ```

2. Add the row to `$DSH_HOME/profiles/web/cordis.patch.yml`:

   ```yaml
   - insert:
       - id: chat-bg
         name: dsh-chat-background
   ```

3. Restart DSH and reload the page.

## Uninstall

```sh
rm -rf "$DSH_HOME/profiles/node_modules/dsh-chat-background"
```

And remove the `chat-bg` entry from `$DSH_HOME/profiles/web/cordis.patch.yml`.

## Settings

In DSH, go to **Settings → Chat Background** for all options:

- **Enabled** – Toggle plugin on/off
- **Image source** – URL or local file
- **Fit** – Cover, Stretch, or Zoom
- **Position** – Presets or custom X/Y
- **Darken** – 0–80% overlay
- **Fade to bottom** – Gradient that goes dark toward page bottom
- **UI opacity** – 20–100%, controls transparency of UI elements
- **Accent color** – Color for buttons and links
- **Sidebar blur** – 0–30px backdrop blur
- **Message box blur** – 0–30px backdrop blur

Settings are stored in browser `localStorage`.

## How it works

The plugin has two parts:

- **Host side** (`lib/index.js`) – A simple placeholder required for registration
- **Client side** (`lib/client.js`) – Runs in the browser, adds the background and settings

Registration in `cordis.patch.yml` loads the plugin automatically. In the browser, it applies the background and overrides theme colors to make the UI translucent.

## Version history

- **v1.1.1** – Performance fix: theme tokens only update on actual changes
- **v1.1** – Accent color, fade-to-bottom, optional blur for sidebar and message box
- **v1.0** – Static plugin: enabled by default, survives restarts, browser storage for settings
- **v0 (legacy)** – Dynamic plugin (obsolete), had to be recreated on each start
