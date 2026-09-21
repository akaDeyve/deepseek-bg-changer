# deepseek-bg-changer

Ein Plugin für die DeepSeek Harness (DSH) Web-Oberfläche, das den Chat-Hintergrund mit einem Bild oder Farbverlauf füllt und die UI-Elemente durchscheinend macht. Einmal installiert, bleibt es aktiv – auch nach einem Neustart.

## Features

- **Standardmäßig aktiv** – Wird automatisch geladen und angewendet
- **Farbverlauf oder Hintergrundbild** – Bild-URL oder lokale Datei, mit verschiedenen Anpassungsoptionen (Cover, Stretch, Zoom) und Positionierung
- **Abdunkeln** – 0–80 % dunkle Überlagerung, optional als Verlauf nach unten
- **Durchscheinende UI** – Seitenleiste, Chat-Blasen, Eingabefeld und andere Elemente werden bei <100 % Opazität durchsichtig
- **Akzentfarbe** – Farbauswahl für Buttons, Links und Markierungen
- **Optionale Unschärfe** – Seitenleiste und Eingabefeld können mit einstellbarem Unschärfe-Effekt versehen werden
- **Einstellungen** – Werden im Browser gespeichert und überleben DSH-Neustarts

## Installation

Es gibt zwei gängige Methoden, das Plugin zu installieren:

### Methode 1: Einfache Installation mit Skript

```sh
git clone https://github.com/akaDeyve/deepseek-bg-changer.git
cd deepseek-bg-changer
chmod +x install.sh
./install.sh
```

Danach DSH neu starten und die Seite neu laden.

### Methode 2: Manuelle Installation

1. Kopiere das Plugin in das DSH-Profil:

   ```sh
   DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
   mkdir -p "$DSH_HOME/profiles/node_modules/dsh-chat-background/lib"
   cp package.json "$DSH_HOME/profiles/node_modules/dsh-chat-background/"
   cp lib/index.js lib/client.js "$DSH_HOME/profiles/node_modules/dsh-chat-background/lib/"
   ```

2. Füge die folgende Zeile zu `$DSH_HOME/profiles/web/cordis.patch.yml` hinzu:

   ```yaml
   - insert:
       - id: chat-bg
         name: dsh-chat-background
   ```

3. DSH neu starten und die Seite neu laden.


## Deinstallation

```sh
rm -rf "$DSH_HOME/profiles/node_modules/dsh-chat-background"
```

Und entferne den `chat-bg` Eintrag aus `$DSH_HOME/profiles/web/cordis.patch.yml`.

## Einstellungen

Im DSH unter **Settings → Chat Background** findest du alle Optionen:

- **Aktiviert** – Plugin ein-/ausschalten
- **Bildquelle** – URL oder lokale Datei
- **Anpassung** – Cover, Stretch oder Zoom
- **Position** – Vordefiniert oder benutzerdefiniert
- **Abdunkeln** – 0–80 % dunkle Überlagerung
- **Verlauf nach unten** – Dunkler Verlauf am unteren Bildschirmrand
- **UI-Opazität** – 20–100 %, steuert die Durchsichtigkeit der UI
- **Akzentfarbe** – Farbe für Buttons und Links
- **Unschärfe für Seitenleiste** – 0–30 px
- **Unschärfe für Eingabefeld** – 0–30 px

Die Einstellungen werden im Browser gespeichert (`localStorage`).

## Wie es funktioniert

Das Plugin besteht aus zwei Teilen:

- **Host-Seite** (`lib/index.js`) – Ein einfacher Platzhalter, der für die Registrierung benötigt wird
- **Client-Seite** (`lib/client.js`) – Wird im Browser ausgeführt und fügt den Hintergrund sowie die Einstellungen hinzu

Durch die Eintragung in `cordis.patch.yml` wird das Plugin automatisch geladen. Im Browser wendet es dann den Hintergrund an und überschreibt die Theme-Farben, um die UI durchscheinend zu machen.

## Versionsgeschichte

- **v1.1.1** – Performance-Fix: Theme-Tokens werden nur noch bei tatsächlichen Änderungen aktualisiert
- **v1.1** – Akzentfarbe, Verlauf nach unten, optionale Unschärfe für Seitenleiste und Eingabefeld
- **v1.0** – Statisches Plugin: standardmäßig aktiv, überlebt Neustarts, Browser-Speicher für Einstellungen
- **v0 (legacy)** – Dynamisches Plugin (veraltet), musste bei jedem Start neu erstellt werden
