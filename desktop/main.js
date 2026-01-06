"use strict";

const {
  app,
  BrowserWindow,
  shell,
  protocol,
  session,
  net
} = require("electron");
const { pathToFileURL } = require("url");
const path = require("path");

const APP_SCHEME = "app";
const APP_HOST = "bundle";
const APP_ROOT = path.resolve(__dirname, "app");
const APP_ENTRYPOINT = `${APP_SCHEME}://${APP_HOST}/index.html`;

protocol.registerSchemesAsPrivileged([
  {
    scheme: APP_SCHEME,
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true
    }
  }
]);

function isExternalUrl(url) {
  return /^https?:\/\//i.test(url);
}

function resolveAssetPath(requestUrl) {
  if (requestUrl.hostname !== APP_HOST) {
    return null;
  }

  let pathname = decodeURIComponent(requestUrl.pathname);

  if (!pathname || pathname === "/") {
    pathname = "/index.html";
  } else if (pathname.endsWith("/")) {
    pathname += "index.html";
  }

  const sanitizedPath = pathname.replace(/^\/+/, "");
  const absolutePath = path.normalize(path.join(APP_ROOT, sanitizedPath));
  const relativePath = path.relative(APP_ROOT, absolutePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return absolutePath;
}

function registerAppProtocol() {
  protocol.handle(APP_SCHEME, async (request) => {
    const requestUrl = new URL(request.url);
    const assetPath = resolveAssetPath(requestUrl);

    if (!assetPath) {
      return new Response("Not Found", { status: 404 });
    }

    const fileUrl = pathToFileURL(assetPath);
    fileUrl.search = requestUrl.search;

    try {
      return await net.fetch(fileUrl);
    } catch {
      return new Response("Not Found", { status: 404 });
    }
  });
}

function registerPermissionHandler() {
  session.defaultSession.setPermissionRequestHandler(
    (webContents, permission, callback, details) => {
      const requestingUrl = details?.requestingUrl ?? webContents.getURL();
      const originProtocol = requestingUrl ? new URL(requestingUrl).protocol : null;
      const isAllowed = originProtocol === `${APP_SCHEME}:` && permission === "media";

      callback(isAllowed);
    }
  );
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 820,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isExternalUrl(url)) {
      shell.openExternal(url);
      return { action: "deny" };
    }

    mainWindow.loadURL(url);
    return { action: "deny" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (isExternalUrl(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.loadURL(APP_ENTRYPOINT);
}

app.whenReady().then(() => {
  registerAppProtocol();
  registerPermissionHandler();
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
