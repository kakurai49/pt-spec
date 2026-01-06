"use strict";

const { app, BrowserWindow, protocol, session } = require("electron");
const path = require("path");

const APP_PROTOCOL = "app";
const APP_DIR = path.join(__dirname, "app");

protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_PROTOCOL,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      allowServiceWorkers: true,
      stream: true
    }
  }
]);

/**
 * Resolves a local asset path for the custom protocol while preventing directory traversal.
 * @param {string} url
 * @returns {string}
 */
function resolveAssetPath(url) {
  const parsedUrl = new URL(url);
  const normalizedPath = path.normalize(
    path.join(APP_DIR, parsedUrl.hostname, parsedUrl.pathname)
  );

  if (!normalizedPath.startsWith(APP_DIR)) {
    throw new Error("Attempted to access path outside app directory.");
  }

  return normalizedPath;
}

function registerAppProtocol() {
  protocol.registerFileProtocol(APP_PROTOCOL, (request, callback) => {
    try {
      const filePath = resolveAssetPath(request.url);
      callback({ path: filePath });
    } catch (error) {
      console.error("[app-protocol]", error.message);
      callback({ error: -10 }); // ERR_ACCESS_DENIED
    }
  });
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.webContents.setWindowOpenHandler(() => ({
    action: "deny"
  }));

  mainWindow.loadURL(`${APP_PROTOCOL}://index.html`);
}

function setupPermissions() {
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback) => {
      const requestUrl = webContents.getURL();
      const isAppScheme = requestUrl.startsWith(`${APP_PROTOCOL}:`);

      if (!isAppScheme) {
        return callback(false);
      }

      if (["media", "camera", "microphone"].includes(permission)) {
        return callback(true);
      }

      return callback(false);
    }
  );
}

app.whenReady().then(() => {
  registerAppProtocol();
  setupPermissions();
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
