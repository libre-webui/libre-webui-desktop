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

## Release flow

The main repository's release workflow dispatches this repo's Build workflow with the new tag (`repository_dispatch`, type `release`). The workflow builds macOS, Windows, and Linux installers and uploads them onto that tag's release in `libre-webui/libre-webui`, so download URLs and the Homebrew cask stay exactly where they always were. It can also be run by hand from the Actions tab with a tag input.

Two secrets make the hand-off work, both fine-grained PATs:

- `DESKTOP_DISPATCH_TOKEN` in **libre-webui/libre-webui**: contents read/write on this repo, used only to send the dispatch.
- `RELEASE_UPLOAD_TOKEN` in **this repo**: contents read/write on `libre-webui/libre-webui`, used to upload release assets.

Without the tokens nothing breaks: the release workflow prints a warning and you start the build manually; the build keeps its artifacts on the workflow run.

## Development

Run the main libre-webui repo dev servers (`npm run dev`), then:

```bash
npm run dev
```

The window loads the Vite dev server on port 5173.

## License

Apache-2.0. Copyright Kroonen AI, Inc.
