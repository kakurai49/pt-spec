"use strict";

const { contextBridge, shell } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  openExternal: (url) => shell.openExternal(url)
});
