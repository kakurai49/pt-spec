# Desktop wrapper

Electron-based Windows desktop packaging for the static web assets in the repository root.

## Prerequisites

- Node.js 20+
- npm

## Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Sync bundled web assets and start Electron:
   ```bash
   npm run start
   ```
   This copies `index.html`, `index2.html`, and the `bt7/`, `bt30/`, and `qr/` directories into `desktop/app/` before launching.

## Packaging

- Build a Windows NSIS installer:
  ```bash
  npm run dist:win
  ```

Artifacts are written to `desktop/dist/`.

## Custom protocol

The app uses the `app://` scheme for a secure context, mapping files under `desktop/app/`. Camera/microphone permission requests are allowed only for this scheme.

## CI

GitHub Actions workflow: `.github/workflows/desktop-windows.yml` builds the Windows installer and uploads the resulting artifacts on pushes and manual dispatch.
