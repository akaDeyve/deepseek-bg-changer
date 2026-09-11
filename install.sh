#!/usr/bin/env bash
# One-shot installer for dsh-chat-background — a permanent DeepSeek Harness
# (DSH) deployment plugin: chat wallpaper + translucent UI surfaces.
#
# What it does:
#   1. Copies the package into $DSH_HOME/profiles/node_modules/dsh-chat-background
#   2. Adds the composition row to the profile's cordis.patch.yml (id: chat-bg)
#   3. Prints the restart + reload step (a restart loads the new row reliably)
#
# Env overrides: DSH_HOME (default ~/.dsh), PROFILE (default web)
set -euo pipefail

DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
PROFILE="${PROFILE:-web}"
SRC_DIR="$(cd "$(dirname "$0")" && pwd)"
PKG_DIR="$DSH_HOME/profiles/node_modules/dsh-chat-background"
PATCH="$DSH_HOME/profiles/$PROFILE/cordis.patch.yml"

echo "==> dsh-chat-background installer"
echo "    DSH_HOME : $DSH_HOME"
echo "    PROFILE  : $PROFILE"

[ -d "$DSH_HOME/profiles" ] || { echo "ERROR: $DSH_HOME/profiles not found. Set DSH_HOME to your harness home."; exit 1; }
[ -f "$DSH_HOME/profiles/$PROFILE/package.json" ] || { echo "ERROR: profile '$PROFILE' not found under $DSH_HOME/profiles."; exit 1; }

mkdir -p "$PKG_DIR/lib"
cp "$SRC_DIR/package.json"  "$PKG_DIR/package.json"
cp "$SRC_DIR/lib/index.js"  "$PKG_DIR/lib/index.js"
cp "$SRC_DIR/lib/client.js" "$PKG_DIR/lib/client.js"
echo "==> Package files copied to $PKG_DIR"

if [ -f "$PATCH" ] && grep -q "dsh-chat-background" "$PATCH"; then
  echo "==> Composition row already present in $PATCH (left unchanged)"
else
  if [ ! -f "$PATCH" ] || [ "$(tr -d '[:space:]' < "$PATCH" 2>/dev/null)" = "[]" ]; then
    cat > "$PATCH" <<'PATCH'
# User patch layer: applied after every bundle layer.
# Deployment-local plugin: chat background wallpaper with translucent UI
# surfaces. The package lives in this profile's node_modules; its browser
# half is served through the client module system (dsh.client declaration).
- insert:
    - id: chat-bg
      name: dsh-chat-background
PATCH
    echo "==> Wrote fresh patch file $PATCH"
  else
    cat >> "$PATCH" <<'PATCH'

# Deployment-local plugin: chat background wallpaper with translucent UI
# surfaces. The package lives in this profile's node_modules; its browser
# half is served through the client module system (dsh.client declaration).
- insert:
    - id: chat-bg
      name: dsh-chat-background
PATCH
    echo "==> Appended composition row to $PATCH"
  fi
fi

cat <<'NEXT'

==> Installed. Next steps:
    1. Restart the DSH web process (any of):
       - the deployment manager's restart endpoint (POST /__admin/api/restart)
       - or stop and relaunch `dsh web`
       (With `patchReload: live` a patch-file event may already hot-apply the
        row; a restart is the reliable path.)
    2. Reload the browser page.
    3. Open Settings -> Chat Background.

    The wallpaper is enabled by default: without a chosen image it renders a
    built-in gradient that follows the light/dark color scheme. Settings
    persist in the browser (localStorage) and survive DSH restarts.

==> Uninstall:
    rm -rf "$PKG_DIR"
    and remove the `chat-bg` row from $PATCH, then restart.
NEXT