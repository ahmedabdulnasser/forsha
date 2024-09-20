import { pickr } from "./ColorPicker.js";
export class Canvas {
  constructor(
    canvasElement,
    downloadBtn,
    strokeBtn,
    strokeText,
    colorText,
    eraseBtn,
    eraseText,
    undoBtn,
    redoBtn
  ) {
    this.canvas = canvasElement;
    this.canvas.style.backgroundColor = "white";
    this.canvas.style.cursor = "crosshair";
    this.context = this.canvas.getContext("2d");
    this.isDrawing = false;
    this.x = 0;
    this.y = 0;
    this.currentState = this.saveCanvasData();
    this.strokeClickCount = 1;
    this.canvasStates = [];
    this.recentlyDeletedStates = [];
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
      if (!this.isErasing) {
        this.prevColor = this.currentColor;
        this.prevLineWidth = this.currentLineWidth;
      }
    }); // Settings-Relevant events

    downloadBtn.addEventListener("click", () => {
      this.downloadCanvas();
    });
    strokeBtn.addEventListener("click", () => {
      this.strokeClickCount = (this.strokeClickCount + 1) % 11 || 1;
      this.setLineWidth(this.strokeClickCount);
      strokeText.innerText = `${this.currentLineWidth} px`;
    });
    eraseBtn.addEventListener("click", () => {
      this.toggleEraser(eraseBtn, eraseText);
    });
    undoBtn.addEventListener("click", () => {
      this.undo();
    });
    redoBtn.addEventListener("click", () => {
      this.redo();
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
    this.context.beginPath();
    this.context.moveTo(this.x, this.y);
    this.context.lineTo(e.offsetX, e.offsetY);
    this.context.strokeStyle = this.currentColor;
    this.context.lineWidth = this.currentLineWidth;
    this.context.stroke();
    this.x = e.offsetX;
    this.y = e.offsetY;
    if (this.currentColor === "white") {
      this.recentlyDeletedStates.push(
        this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
      );
    } else {
      this.canvasStates.push(
        this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
      );
    }
  }

  undo() {
    if (this.canvasStates.length === 0) return;
    console.log(this.canvasStates);
    this.recentlyDeletedStates.push(this.canvasStates.pop());
    const canvasLastState = this.canvasStates.at(-1);
    this.context.putImageData(canvasLastState, 0, 0);
    this.currentState = this.saveCanvasData();
  }
  redo() {
    console.log(this.recentlyDeletedStates);
    if (this.recentlyDeletedStates.length === 0) return;
    const canvasLastState = this.recentlyDeletedStates.at(-1);
    this.context.putImageData(canvasLastState, 0, 0);
    this.currentState = this.saveCanvasData();
    this.canvasStates.push(
      this.context.getImageData(0, 0, this.canvas.width, this.canvas.height)
    );
    this.recentlyDeletedStates.pop();
  }

  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  redraw() {
    this.lines.forEach((line, index) => {
      if (index < this.lines.length - 1) {
        this.context.beginPath();
        this.context.moveTo(line.startX, line.startY);
        this.context.lineTo(line.endX, line.endY);
        this.setLineColor(line.strokeStyle);
        this.setLineWidth(line.lineWidth);
        this.context.stroke();
        line.startX = line.endX;
        line.startY = line.endY;
      }
    });
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

  toggleEraser(eraseBtn, eraseText) {
    if (!this.isErasing) {
      this.isErasing = true;
      this.canvas.style.cursor = "grabbing";
      this.currentColor = "white";
      this.setLineWidth(15);
      eraseBtn.src = "./assets/icons/pencil.svg";
      eraseText.innerText = "Paint";
    } else {
      this.isErasing = false;
      this.canvas.style.cursor = "crosshair";
      this.setLineColor(this.prevColor);
      this.setLineWidth(this.prevLineWidth);
      eraseBtn.src = "./assets/icons/eraser.svg";
      eraseText.innerText = "Erase";
    }
  }

  downloadCanvas() {
    const tempCanvas = document.createElement("canvas");
    const tempContext = tempCanvas.getContext("2d");
    tempCanvas.width = this.canvas.width;
    tempCanvas.height = this.canvas.height;

    tempContext.fillStyle = "#ffffff";
    tempContext.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempContext.drawImage(this.canvas, 0, 0);

    const link = document.createElement("a");
    link.download = "new-sketch.jpg";
    link.href = tempCanvas.toDataURL("image/jpeg");
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
