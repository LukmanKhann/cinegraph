import { JSDOM } from "jsdom";

const dom = new JSDOM(
  `<!doctype html><html><body><div id="root"></div></body></html>`,
  { url: "http://localhost:3000", pretendToBeVisual: true },
);

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.navigator = dom.window.navigator;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.HTMLInputElement = dom.window.HTMLInputElement;
globalThis.Element = dom.window.Element;
globalThis.Node = dom.window.Node;
globalThis.localStorage = dom.window.localStorage;
globalThis.getComputedStyle = dom.window.getComputedStyle;
globalThis.MutationObserver = dom.window.MutationObserver;
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
const nativeFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  const absolute = new URL(url, "http://localhost:3000");
  console.log("FETCH:", String(absolute));
  const res = await nativeFetch(absolute, init);
  console.log("FETCH STATUS:", res.status);
  return res;
};
dom.window.fetch = globalThis.fetch;

const mod = await import("./repro-bundle.mjs");
console.log("module keys:", Object.keys(mod));
const mount = mod.default;
const typeInto = mod.typeInto;
const origConsoleError = console.error;
console.error = (...args) => { origConsoleError("CONSOLE.ERROR:", ...args); };
const { root, pending } = mount();
await pending;
console.log("HAS INPUT:", !!document.querySelector("input"));
console.log("BODY HTML:", document.body.innerHTML.slice(0, 2000));

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT:", err.message);
  console.log(String(err.stack).split("\n").slice(0, 10).join("\n"));
  process.exit(2);
});

window.addEventListener("error", (event) => {
  const err = event.error || { message: event.message };
  console.log("WINDOW ERROR:", err.message);
  if (err.stack) console.log(String(err.stack).split("\n").slice(0, 10).join("\n"));
  process.exit(3);
});

typeInto(root)
  .then(() => {
    console.log(
      "TYPED OK — options in DOM:",
      document.querySelectorAll('[role="option"]').length,
    );
    process.exit(0);
  })
  .catch((err) => {
    console.log("REPRO FAILED:", err.message);
    console.log(String(err.stack).split("\n").slice(0, 10).join("\n"));
    process.exit(1);
  });
