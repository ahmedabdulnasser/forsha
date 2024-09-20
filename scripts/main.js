import { Canvas } from "./Canvas.js";
const newCanvas = new Canvas(
  document.querySelector(".canvas"),
  document.querySelector(".download-btn"),
  document.querySelector(".stroke-btn"),
  document.querySelector(".stroke-text"),
  document.querySelector(".color-text"),
  document.querySelector(".erase-btn"),
  document.querySelector(".erase-text"),
  document.querySelector(".undo-btn"),
  document.querySelector(".redo-btn")
);
