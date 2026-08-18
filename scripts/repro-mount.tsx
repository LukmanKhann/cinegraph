import React, { act } from "react";
import { createRoot } from "react-dom/client";
import AsyncPicker from "../src/components/AsyncPicker";

export default function mount() {
  const container = document.getElementById("root")!;
  const root = createRoot(container);
  let done: () => void;
  const pending = new Promise<void>((resolve) => (done = resolve));
  act(() => {
    root.render(
      React.createElement(AsyncPicker, {
        kind: "movie",
        placeholder: "Try “The Matrix”, “Inception”, “Toy Story”…",
      }),
    );
    done();
  });
  return pending;
}

export async function typeInto() {
  const input = document.querySelector("input") as HTMLInputElement;
  if (!input) throw new Error("no input found");
  await act(async () => {
    input.focus();
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!;
    setter.call(input, "mat");
    input.dispatchEvent(
      new window.Event("input", { bubbles: true, composed: true }),
    );
  });
  await new Promise((resolve) => setTimeout(resolve, 4000));
  await act(async () => {});
  return document.querySelectorAll('[role="option"]').length;
}