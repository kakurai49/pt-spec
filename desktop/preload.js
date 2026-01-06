"use strict";

if (typeof process === "undefined") {
  return;
}

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

if (!isE2EMode) {
  return;
}

const buildPathLabel = () => `PATH: ${window.location.pathname}${window.location.hash}`;

const createOverlay = () => {
  const overlay = document.createElement("div");
  overlay.id = "e2e-path";
  overlay.textContent = buildPathLabel();

  const style = overlay.style;
  style.position = "fixed";
  style.right = "12px";
  style.bottom = "12px";
  style.padding = "4px 8px";
  style.fontSize = "12px";
  style.fontFamily = "monospace";
  style.backgroundColor = "rgba(0, 0, 0, 0.65)";
  style.color = "#ffffff";
  style.borderRadius = "4px";
  style.zIndex = "2147483647";
  style.pointerEvents = "none";
  style.userSelect = "none";

  return overlay;
};

const attachOverlay = () => {
  const overlay = document.getElementById("e2e-path") ?? createOverlay();
  const updateOverlay = () => {
    overlay.textContent = buildPathLabel();
  };

  updateOverlay();

  if (!overlay.isConnected) {
    document.body.appendChild(overlay);
  }

  window.addEventListener("hashchange", updateOverlay);
  window.addEventListener("popstate", updateOverlay);
  const intervalId = window.setInterval(updateOverlay, 500);
  window.addEventListener("beforeunload", () => {
    window.clearInterval(intervalId);
  });
};

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", attachOverlay, { once: true });
} else {
  attachOverlay();
}
