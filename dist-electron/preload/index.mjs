import { contextBridge, ipcRenderer } from "electron";
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
    promise = Promise.allSettled(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
        }
        link.crossOrigin = "";
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
console.log("🔌 Preload script starting...");
console.log("[Preload] Starting preload script");
if (!process.type) {
  console.log("[Preload] Not in a renderer process");
  process.exit(1);
}
const init = async () => {
  try {
    const { IPC_CHANNELS: IPC_CHANNELS2 } = await __vitePreload(async () => {
      const { IPC_CHANNELS: IPC_CHANNELS3 } = await Promise.resolve().then(() => ipc);
      return { IPC_CHANNELS: IPC_CHANNELS3 };
    }, true ? void 0 : void 0);
    contextBridge.exposeInMainWorld(
      "api",
      {
        send: (channel, data) => {
          const validChannels = Object.values(IPC_CHANNELS2);
          if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
          }
        },
        receive: (channel, func) => {
          const validChannels = Object.values(IPC_CHANNELS2);
          if (validChannels.includes(channel)) {
            ipcRenderer.on(channel, (event, ...args) => func(...args));
          }
        },
        invoke: async (channel, data) => {
          const validChannels = Object.values(IPC_CHANNELS2);
          if (validChannels.includes(channel)) {
            return await ipcRenderer.invoke(channel, data);
          }
          return null;
        }
      }
    );
    console.log("[Preload] API exposed successfully");
  } catch (error) {
    console.error("[Preload] Error initializing:", error);
  }
};
init();
const IPC_CHANNELS = {
  FILE_OPEN: "file:open",
  FILE_READ: "file:read",
  FILE_WRITE: "file:write"
};
const ipc = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  IPC_CHANNELS
}, Symbol.toStringTag, { value: "Module" }));
//# sourceMappingURL=index.mjs.map
