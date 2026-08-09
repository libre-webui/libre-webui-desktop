# Libre WebUI Desktop

The Electron desktop app for [Libre WebUI](https://github.com/libre-webui/libre-webui). It wraps the web frontend in a native window and connects to a local or remote Libre WebUI server. The landing screen probes for a local server and also accepts any reachable server URL.

## How it builds

The app pins a released libre-webui version in `package.json` under `librewebui.tag`. The prepare step clones that tag, builds the frontend in Electron mode (relative asset paths so `file://` loading works), and stages it under `app/` for electron-builder.

```bash
npm install
npm run build:mac      # dmg + zip for Apple Silicon
npm run build:win      # nsis + portable
npm run build:linux    # AppImage + deb
npm run verify:mac     # checks the packaged dmg
npm test               # packaging and signing guards
```

To ship a new app version: bump `version` and `librewebui.tag` together, then build.

## Development

Run the main libre-webui repo dev servers (`npm run dev`), then:

```bash
npm run dev
```

The window loads the Vite dev server on port 5173.

## License

Apache-2.0. Copyright Kroonen AI, Inc.
