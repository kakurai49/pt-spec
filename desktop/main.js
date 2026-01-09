"use strict";

const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

const E2E_FLAG = "--e2e";
const E2E_ENV_VAR = "PT_SPEC_E2E";

const isTruthy = (value) => {
  if (typeof value !== "string") {
    return false;
  }
  const normalized = value.toLowerCase();
  return normalized !== "0" && normalized !== "false" && normalized !== "";
};

const isE2EMode =
  (Array.isArray(process.argv) && process.argv.includes(E2E_FLAG)) ||
  isTruthy(process.env[E2E_ENV_VAR]);

if (isE2EMode) {
  app.commandLine.appendSwitch("force-prefers-reduced-motion");
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 820,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      ...(isE2EMode ? { backgroundThrottling: true } : {})
    }
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.loadFile(path.join(__dirname, "app", "index.html"));
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
