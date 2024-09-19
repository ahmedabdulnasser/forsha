import { pickr } from "./ColorPicker.js";
export class Canvas {
  constructor(canvasElement, downloadBtn, strokeBtn, strokeText, colorText) {
    this.canvas = canvasElement;
    this.canvas.style.backgroundColor = "white";
    this.context = this.canvas.getContext("2d");
    this.isDrawing = false;
    this.x = 0;
    this.y = 0;
    this.currentState = this.saveCanvasData();
    this.strokeClickCount = 1;
    // Sets canvas to full screen - do not add settings before
    this.fitCanvasSize();
    // Default Settings
    this.context.lineCap = "round";
    this.context.lineJoin = "round";
    // Events
    this.canvas.addEventListener("mousedown", (e) => this.setCoords(e));
    this.canvas.addEventListener("mousemove", (e) => this.draw(e));
    /**
     *  Restoring the current state then resizing when the window
     *  is resized.
     */

    window.addEventListener("resize", () => {
      this.resizeCanvas(this.currentState);
    });

    /* Marking that I've stopped drawing and saving the current state
     * once the mouse click is up.
     */
    this.canvas.addEventListener("mouseup", () => {
      this.stopDrawing();
      this.currentState = this.saveCanvasData();
    }); // Settings-Relevant events

    downloadBtn.addEventListener("click", () => {
      this.downloadCanvas();
    });
    strokeBtn.addEventListener("click", () => {
      this.strokeClickCount = (this.strokeClickCount + 1) % 11 || 1;
      this.setLineWidth(this.strokeClickCount);
      strokeText.innerText = `${this.currentLineWidth} px`;
    });

    pickr.on("change", (color, instance) => {
      this.setLineColor("#" + color.toHEXA().join(""));
      colorText.innerText = `${this.currentColor}`;
      colorText.style.color = `${this.currentColor}`;
    });
  }

  setCoords(e) {
    this.isDrawing = true;
    this.x = e.offsetX;
    this.y = e.offsetY;
  }
  draw(e) {
    if (!this.isDrawing) return;
    this.context.moveTo(this.x, this.y);
    this.context.lineTo(e.offsetX, e.offsetY);
    this.context.strokeStyle = this.currentColor;
    this.context.lineWidth = this.currentLineWidth;
    this.context.stroke();
    this.x = e.offsetX;
    this.y = e.offsetY;
  }
  stopDrawing() {
    this.isDrawing = false;
  }

  setLineWidth(width) {
    this.currentLineWidth = width;
    this.resizeCanvas(this.currentState);
  }
  setLineColor(color) {
    this.currentColor = color;
    this.resizeCanvas(this.currentState);
  }

  downloadCanvas() {
    const link = document.createElement("a");
    link.download = "new_painting.png";
    link.href = this.canvas.toDataURL();
    link.click();
  }

  //Resizes canvas then restores the saved canvas state.

  resizeCanvas(savedState) {
    this.fitCanvasSize();
    this.restoreCanvasData(savedState);
  }

  /*
   * Helper methods used in the resizeCanvas method *
   */ // Resizes canvas to the full width and height of the window

  fitCanvasSize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight - 100;
  }

  // Sets the current canvas to the saved offscreen canvas.
  restoreCanvasData(savedCanvas) {
    this.context.drawImage(savedCanvas, 0, 0);
    this.context.lineCap = "round";
    this.context.lineJoin = "round";
  }

  // Creates an offscreen canvas that will save my current canvas state.
  saveCanvasData() {
    const offScreenCanvas = document.createElement("canvas");
    offScreenCanvas.width = this.canvas.width;
    offScreenCanvas.height = this.canvas.height;
    offScreenCanvas.getContext("2d").drawImage(this.canvas, 0, 0);
    return offScreenCanvas;
  }
}
