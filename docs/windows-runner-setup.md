# Windows self-hosted runner setup for GUI E2E

## Overview
- Purpose: keep a Windows runner available as a regular user session (not a service) so pywinauto GUI tests can interact with Electron builds.
- Scope: adding the runner via GitHub UI, keeping the desktop unlocked, and basic troubleshooting/operation tips.

## Add a Windows self-hosted runner
1) Sign in to GitHub → repository **Settings → Actions → Runners → New self-hosted runner** (see the [GitHub runner setup guide](https://docs.github.com/en/actions/hosting-your-own-runners/adding-self-hosted-runners)).
2) Choose **Windows** and **x64**, download the runner package, and extract it to a writable path (e.g., `C:\actions-runner`).
3) From an elevated PowerShell (once), run the provided `config.cmd` command with your repository URL and token.
4) **Do not install as a service**. For GUI tests, start the runner with `run.cmd` inside an interactive, logged-in user session and leave the window open.

## Keep the GUI available
- Stay signed in with the runner account; disable lock screen, sleep, and display power-off while tests are expected to run.
- If remote access is needed, keep the session active (e.g., with VNC/remote desktop that preserves the console session). Closing/locking the session causes pywinauto to lose the UI.
- Runner restarts should be manual (double-click `run.cmd` after login) to ensure tests attach to the visible desktop.

## Troubleshooting
- **Runner offline**: verify the `run.cmd` console is open and connected; re-run `run.cmd` after login if the window was closed or the PC rebooted.
- **Tests failing due to locked screen**: unlock the desktop, rerun the workflow, and ensure sleep/lock timers are disabled.
- **Stuck apps**: terminate stray Electron app instances before restarting the runner to avoid window-handle conflicts.

## Running workflows from iPhone
- Use GitHub mobile web/UI to open **Actions → [workflow] → Run workflow**.
- Confirm the self-hosted Windows runner is online before triggering; if not, ask someone to log in and start `run.cmd`.
- Download build artifacts (e.g., `win-unpacked.zip`, `Setup.exe`, UI test logs/screenshots) directly from the Actions run detail page.
