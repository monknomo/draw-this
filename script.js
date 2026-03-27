"use strict";
(() => {
  // src/sounds.ts
  function playSound(soundId, loop) {
    const audio = document.getElementById(soundId);
    if (loop) {
      ;
      audio.style.loop = "loop";
    }
    audio.play();
  }
  function pauseSound(soundId) {
    const audio = document.getElementById(soundId);
    audio.pause();
    audio.style.loop = "";
    audio.currentTime = 0;
  }

  // src/tools/pencil.ts
  var settings = {
    width: 5,
    controls: [
      { id: "increase", name: "+", onclick: () => {
        settings.width--;
      } },
      // Known bug preserved: 'decrease' control increments (swapped)
      { id: "decrease", name: "+", onclick: () => {
        settings.width++;
      } }
    ]
  };
  var pencil = {
    name: "pencil",
    button: document.getElementById("pencil"),
    drawsImmediately: false,
    selectable: true,
    settings,
    onclick(_e) {
      playSound("clickSound");
      drawHorse.showColorSelectors();
      drawHorse.hideStampSelectors();
    },
    draw(e) {
      playSound("pencilSound");
      drawHorse.ctx.beginPath();
      drawHorse.ctx.lineWidth = 5;
      drawHorse.ctx.lineCap = "round";
      drawHorse.ctx.strokeStyle = drawHorse.selectedColor;
      drawHorse.ctx.moveTo(drawHorse.pos.x, drawHorse.pos.y);
      drawHorse.setPosition(e);
      drawHorse.ctx.lineTo(drawHorse.pos.x, drawHorse.pos.y);
      drawHorse.ctx.stroke();
    },
    stopDrawing(_e) {
      pauseSound("pencilSound");
    }
  };

  // src/tools/drips.ts
  function getDripSize() {
    let size = 0;
    if (Math.random() < 0.5) {
      if (Math.random() < 0.9) {
        size = Math.floor(Math.random() * 10);
      } else {
        size = Math.floor(Math.random() * 10 + 15);
      }
      if (size < 6) {
        size = 0;
      }
    }
    return size;
  }
  var drips = {
    name: "drips",
    button: document.getElementById("drips"),
    drawsImmediately: false,
    selectable: true,
    settings: { width: 5 },
    onclick(_e) {
      playSound("clickSound");
      drawHorse.showColorSelectors();
      drawHorse.hideStampSelectors();
    },
    draw(e) {
      playSound("drippingSound");
      drawHorse.setPosition(e);
      drawHorse.ctx.fillStyle = drawHorse.selectedColor;
      drawHorse.ctx.beginPath();
      drawHorse.ctx.arc(
        drawHorse.pos.x,
        drawHorse.pos.y,
        this.getDripSize(),
        0,
        Math.PI * 2,
        true
      );
      drawHorse.ctx.closePath();
      drawHorse.ctx.fill();
    },
    stopDrawing(_e) {
      pauseSound("drippingSound");
    },
    getDripSize
  };

  // src/tools/stamp.ts
  var stamp = {
    name: "stamp",
    button: document.getElementById("stamp"),
    drawsImmediately: true,
    selectable: true,
    settings: { width: 5 },
    onclick(_e) {
      playSound("clickSound");
      drawHorse.showStampSelectors();
      drawHorse.showColorSelectors();
    },
    draw(_e) {
      playSound("stampSound");
      const img = new Image(50, 50);
      img.src = "data:image/svg+xml;base64," + window.btoa(
        window.atob(drawHorse.selectedStamp.url).replaceAll(
          "%%%%",
          ` style='fill:${drawHorse.selectedColor};stroke:${drawHorse.selectedColor};' `
        )
      );
      img.onload = function() {
        drawHorse.ctx.drawImage(img, drawHorse.pos.x - 25, drawHorse.pos.y - 25, 50, 50);
      };
    },
    stopDrawing(_e) {
    }
  };

  // src/tools/bubbles.ts
  var BUBBLE_BASE64_1 = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUyIiByPSI0MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIlJSUlIiBzdHJva2Utd2lkdGg9IjUiLz48ZWxsaXBzZSBjeD0iMzYiIGN5PSIyOCIgcng9IjExIiByeT0iNiIgdHJhbnNmb3JtPSJyb3RhdGUoLTM1IDM2IDI4KSIgZmlsbD0iJSUlJSIvPjwvc3ZnPg==";
  var BUBBLE_BASE64_2 = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUyIiByPSI0MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIlJSUlIiBzdHJva2Utd2lkdGg9IjUiLz48ZWxsaXBzZSBjeD0iNjQiIGN5PSIyOCIgcng9IjExIiByeT0iNiIgdHJhbnNmb3JtPSJyb3RhdGUoMzUgNjQgMjgpIiBmaWxsPSIlJSUlIi8+PC9zdmc+";
  var BUBBLE_BASE64_3 = "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUyIiByPSI0MiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIlJSUlIiBzdHJva2Utd2lkdGg9IjUiLz48ZWxsaXBzZSBjeD0iNTAiIGN5PSIyMCIgcng9IjEyIiByeT0iNiIgdHJhbnNmb3JtPSJyb3RhdGUoLTEwIDUwIDIwKSIgZmlsbD0iJSUlJSIvPjwvc3ZnPg==";
  function colorizeBubbleSvg(base64, color) {
    return window.btoa(window.atob(base64).replaceAll("%%%%", color));
  }
  var settings2 = {
    size: 35,
    sizeVariation: 15,
    maxNumberBubbles: 30
  };
  var bubbles = {
    name: "bubbles",
    button: document.getElementById("bubbles"),
    drawsImmediately: true,
    selectable: true,
    settings: settings2,
    onclick(_e) {
      playSound("clickSound");
      drawHorse.showColorSelectors();
      drawHorse.hideStampSelectors();
    },
    draw(_e) {
      const totalBubbles = Math.floor(Math.random() * settings2.maxNumberBubbles);
      for (let i = 0; i < totalBubbles; i++) {
        const img = new Image(settings2.size, settings2.size);
        const bubbleChoice = Math.random();
        const base64 = bubbleChoice < 0.33 ? BUBBLE_BASE64_1 : bubbleChoice < 0.5 ? BUBBLE_BASE64_2 : BUBBLE_BASE64_3;
        img.src = "data:image/svg+xml;base64," + colorizeBubbleSvg(base64, drawHorse.selectedColor);
        const positive = Math.floor(Math.random() * 2) % 2 === 0 ? -1 : 1;
        const xOffset = positive * Math.floor(Math.random() * (i * settings2.size));
        const yOffset = Math.floor(Math.random() * (i * settings2.size));
        const bubbleSizeSign = Math.floor(Math.random() * 2) % 2 === 0 ? -1 : 1;
        const bubbleSize = Math.floor(
          settings2.size + bubbleSizeSign * Math.floor(Math.random() * settings2.sizeVariation)
        );
        img.onload = function() {
          drawHorse.ctx.drawImage(
            img,
            drawHorse.pos.x - settings2.size / 2 + xOffset,
            drawHorse.pos.y - settings2.size / 2 - yOffset,
            bubbleSize,
            bubbleSize
          );
        };
      }
    },
    stopDrawing(_e) {
    }
  };

  // src/tools/eraser.ts
  var settings3 = {
    width: 5,
    controls: [
      { id: "increase", name: "+", onclick: () => {
        settings3.width--;
      } },
      { id: "decrease", name: "+", onclick: () => {
        settings3.width++;
      } }
    ]
  };
  var eraser = {
    name: "eraser",
    button: document.getElementById("eraser"),
    drawsImmediately: false,
    selectable: true,
    settings: settings3,
    onclick(_e) {
      playSound("clickSound");
      drawHorse.showColorSelectors();
      drawHorse.hideStampSelectors();
    },
    draw(e) {
      playSound("eraserSound");
      drawHorse.ctx.beginPath();
      drawHorse.ctx.lineWidth = 5;
      drawHorse.ctx.lineCap = "round";
      drawHorse.ctx.strokeStyle = "white";
      drawHorse.ctx.moveTo(drawHorse.pos.x, drawHorse.pos.y);
      drawHorse.setPosition(e);
      drawHorse.ctx.lineTo(drawHorse.pos.x, drawHorse.pos.y);
      drawHorse.ctx.stroke();
      console.log(drawHorse.ctx);
    },
    stopDrawing(_e) {
      pauseSound("eraserSound");
    }
  };

  // src/tools/oops.ts
  var oops = {
    name: "oops",
    button: document.getElementById("oops"),
    drawsImmediately: false,
    selectable: false,
    onclick(_e) {
      playSound("oopsSound");
      const imageData = drawHorse.undoStack.pop();
      if (imageData) {
        drawHorse.ctx.putImageData(imageData, 0, 0);
      }
    },
    draw(_e) {
    },
    stopDrawing(_e) {
    }
  };

  // src/tools/nuke.ts
  var nuke = {
    name: "nuke",
    button: document.getElementById("nuke"),
    drawsImmediately: false,
    selectable: false,
    onclick(_e) {
      playSound("tornadoSound");
      drawHorse.ctx.clearRect(
        0,
        0,
        drawHorse.ctx.canvas.width,
        drawHorse.ctx.canvas.height
      );
    },
    draw(_e) {
    },
    stopDrawing(_e) {
    }
  };

  // src/tools/bucket-helpers.ts
  function cssColorToRgba(cssColor) {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = cssColor;
    ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2], d[3]];
  }
  function matchStartColorWithTolerance(data, pos, startColor, maxDiff) {
    const a = data[pos + 3];
    if (startColor[3] === 0) return a === 0;
    if (a === 0) return false;
    return Math.abs(data[pos] - startColor[0]) + Math.abs(data[pos + 1] - startColor[1]) + Math.abs(data[pos + 2] - startColor[2]) < maxDiff;
  }
  function colorPixelRgba(data, pos, fillRgba) {
    data[pos] = fillRgba[0];
    data[pos + 1] = fillRgba[1];
    data[pos + 2] = fillRgba[2];
    data[pos + 3] = 255;
  }

  // src/tools/bucket.ts
  var DEFAULT_TOLERANCE = 0.5;
  var MATCH_MAX_DIFF = 255 * 3 * DEFAULT_TOLERANCE;
  var bucket = {
    name: "bucket",
    button: document.getElementById("bucket"),
    drawsImmediately: true,
    selectable: true,
    onclick(_e) {
      playSound("clickSound");
      drawHorse.showColorSelectors();
      drawHorse.hideStampSelectors();
    },
    draw(e) {
      drawHorse.setPosition(e);
      const { ctx } = drawHorse;
      const { width, height } = ctx.canvas;
      const x = Math.floor(drawHorse.pos.x);
      const y = Math.floor(drawHorse.pos.y);
      if (x < 0 || x >= width || y < 0 || y >= height) return;
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      const pixelPos = (y * width + x) * 4;
      const startColor = [
        data[pixelPos],
        data[pixelPos + 1],
        data[pixelPos + 2],
        data[pixelPos + 3]
      ];
      const fillRgba = cssColorToRgba(drawHorse.selectedColor);
      if (matchStartColorWithTolerance(data, pixelPos, fillRgba, 255 * 3 * 0.05)) return;
      const stack = [[x, y]];
      const visited = new Uint8Array(width * height);
      while (stack.length > 0) {
        const [currentX, currentY] = stack.pop();
        const initialIndex = currentY * width + currentX;
        if (visited[initialIndex] || !matchStartColorWithTolerance(data, initialIndex * 4, startColor, MATCH_MAX_DIFF)) continue;
        let leftX = currentX;
        while (leftX > 0 && matchStartColorWithTolerance(data, (currentY * width + leftX - 1) * 4, startColor, MATCH_MAX_DIFF)) {
          leftX--;
        }
        let rightX = currentX;
        while (rightX < width - 1 && matchStartColorWithTolerance(data, (currentY * width + rightX + 1) * 4, startColor, MATCH_MAX_DIFF)) {
          rightX++;
        }
        let spanAddedAbove = false;
        let spanAddedBelow = false;
        const aboveY = currentY - 1;
        const belowY = currentY + 1;
        for (let scanX = leftX; scanX <= rightX; scanX++) {
          const index = currentY * width + scanX;
          colorPixelRgba(data, index * 4, fillRgba);
          visited[index] = 1;
          if (aboveY >= 0) {
            const aboveIndex = aboveY * width + scanX;
            if (!visited[aboveIndex] && matchStartColorWithTolerance(data, aboveIndex * 4, startColor, MATCH_MAX_DIFF)) {
              if (!spanAddedAbove) {
                stack.push([scanX, aboveY]);
                spanAddedAbove = true;
              }
            } else {
              spanAddedAbove = false;
            }
          }
          if (belowY < height) {
            const belowIndex = belowY * width + scanX;
            if (!visited[belowIndex] && matchStartColorWithTolerance(data, belowIndex * 4, startColor, MATCH_MAX_DIFF)) {
              if (!spanAddedBelow) {
                stack.push([scanX, belowY]);
                spanAddedBelow = true;
              }
            } else {
              spanAddedBelow = false;
            }
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
    },
    stopDrawing(_e) {
    }
  };

  // src/tools/index.ts
  var tools = {
    pencil,
    drips,
    stamp,
    bubbles,
    eraser,
    oops,
    nuke,
    bucket
  };

  // src/stamps.ts
  var stamps = {
    horse: {
      id: "horse",
      name: "Horse",
      url: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMjIyLjAzNXB4IiBoZWlnaHQ9IjIyMi4wMzVweCIgdmlld0JveD0iMCAwIDIyMi4wMzUgMjIyLjAzNSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjIyLjAzNSAyMjIuMDM1OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggJSUlJSBkPSJNMjIxLjUyNCwxMjAuNDQ1bC04LjcxMy05LjA4NWMtMC4zMzEtMC4zNTItMC43ODYtMC41NTMtMS4yNzEtMC41NTlsLTI5LjE4OC0wLjYwM2wwLjA4My0zNy45ODMgICBjOC4wNjIsMi4yOTMsMTYuMzg1LTAuMzEzLDE4Ljg3OS0xLjI0MWM1LjkzNSwyLjM3MywxMC40NzksMi40MTIsMTMuNTEyLDAuMTA5YzQuMzc0LTMuMzA0LDMuNjA1LTkuOTkyLDMuNTctMTAuMjc2ICAgYy0wLjA3Ny0wLjU4OC0wLjQyNi0xLjEwMy0wLjk0NS0xLjM4Yy01LjQ3OS0yLjk0Ni0zMi42MzQtMTcuMDg4LTM3Ljk3Ny0xOS44NzJsLTAuODA1LTE0LjQ1OCAgIGMtMC4wNDctMC44MzYtMC42NjEtMS41MzQtMS40ODMtMS42ODVjLTAuODUxLTAuMTUtMS42NDMsMC4yODctMS45ODYsMS4wNDlsLTMuNzI0LDguMzgybC0xLjEzNS05LjM4NiAgIGMtMC4xMDEtMC44MDctMC43MTUtMS40NDgtMS41MTMtMS41ODJjLTAuNzk4LTAuMTA5LTEuNTksMC4yOS0xLjkzMywxLjAxN2wtNy4zMjQsMTUuNTYzYy01LjA0MiwzLjA5Ny03Ljg0MywxMC42MzMtOS43MTcsMTUuNjc1ICAgbC0wLjcwOSwxLjg3NmMtOC43NzgsMjIuNDg0LTkuMjE2LDIyLjU4OC0xNi41MjcsMjQuMzI2Yy0xOS45NTQsNC43MzEtMzIuOTQzLDEuNzkxLTQ2LjY5NC0xLjMxbC0yLjI2NC0wLjUwOCAgIGMtOS4yMTgtMi4wNjktMjQuNTU2LDAuMDc0LTM0LjgxNCw4LjExM2MtMi4xOSwxLjcxMS00LjAzNywzLjY1NS01LjU5Nyw1Ljc1NGMtMC4xMDksMC0wLjE4OS0wLjA4My0wLjI5OS0wLjA1OSAgIGMtMC4yMywwLjA0Mi0yMi44MTIsNC43OTktMjEuNTg5LDI0LjM3NGMxLjQ2LDIzLjUwNy0zLjAzOCwzMi4xNzgtNy4wNjksMzUuMzI4Yy0yLjk4NSwyLjMyOS02Ljg4OSwyLjY2Ni0xMS45MjUsMS4wNjQgICBjLTAuNjQ3LTAuMjEzLTEuMzU5LTAuMDI0LTEuODM4LDAuNDQ5Yy0wLjQ4NSwwLjQ4NC0wLjY0NywxLjE5My0wLjQ0MywxLjg0NGMwLjA1NiwwLjE1Myw0LjY3OCwxMy44MzEsMTkuOTYzLDEzLjgzMSAgIGMxLjg5NSwwLDMuOTU4LTAuMjEzLDYuMTkyLTAuNjg2YzEzLjM1OC0yLjgxMywxNi41NzctMTUuMjMyLDEyLjUyOC00OS4wOTVjMC40NDksMS42MTMsMS4wMjIsMy40NTEsMS43OTcsNS45MjIgICBjMC43ODMsMi40OTUsMS43NjcsNS42MTUsMi45ODUsOS42ODhsLTIuNjgxLDI0LjE0NmMtMC4wMzYsMC4zMjUsMC4wMTIsMC42MzksMC4xMzksMC45MzRsMTYuOTg0LDM4Ljc4ICAgYzAuMjg0LDAuNjM5LDAuOTE5LDEuMDgyLDEuNjM0LDEuMDk0bDkuODA5LDAuMTc4YzAuMDA2LDAsMC4wMTgsMCwwLjAzMiwwYzAuNTgsMCwxLjEyNi0wLjI3MiwxLjQ2OS0wLjc0NSAgIGMwLjM1Mi0wLjQ4NCwwLjQ0My0xLjEwNSwwLjI0OS0xLjY1NWwtMTEuMTkyLTMyLjUzMmMzLjUxMS0yLjY3OCwxNC4yLTExLjc2OSwxOS41NzYtMjUuODk2bC0xLjAxNywyMC43ODIgICBjLTAuMDEyLDAuMjYsMC4wMywwLjUyMSwwLjEyNywwLjc2OWwxNC44OTYsMzcuMDYxYzAuMjcxLDAuNjg2LDAuOTQyLDEuMTM1LDEuNjgyLDEuMTM1aDkuMDc5YzAuNTgzLDAsMS4xMzItMC4yODQsMS40NzItMC43NTcgICBjMC4zMzctMC40NjEsMC40MzQtMS4wNzUsMC4yNTQtMS42MzFsLTExLjAzNS0zMy40NTVsMTAuODQ2LTIyLjQxNGMwLjAzOS0wLjA3LTAuMDEyLTAuMTQyLDAuMDEyLTAuMjE5ICAgYzEwLjYzLDEuMSwyNS41MjMsMC4yMzYsNDYuNTE4LTQuNTU3bDE1LjE4NSwyNC4wMDRsMi41MTIsMzguMDUzYzAuMDY1LDAuOTQsMC44NTcsMS42ODUsMS44MTQsMS42ODVoNy45OTEgICBjMS4wMDUsMCwxLjgyMS0wLjgwNCwxLjgyMS0xLjgwOXYtNjAuOTg3YzguNDIzLTEuNTI0LDE1Ljg5NC00LjU5OSwyMC4xMDMtNi42MmwtNi42MDgsMjcuNTY4ICAgYy0wLjEzLDAuNTIxLTAuMDE4LDEuMDY5LDAuMjg5LDEuNDg5bDQuNzIzLDYuNTM3YzAuMzQzLDAuNDg0LDAuODgxLDAuNzU3LDEuNDY2LDAuNzU3YzAuMDcxLDAsMC4xMzEsMCwwLjIwMS0wLjAxMiAgIGMwLjY0NS0wLjA3MSwxLjIwNi0wLjQ4NSwxLjQ2Ni0xLjA4OGwxOC41My00My4yMzdDMjIyLjE3NSwxMjEuNzM5LDIyMi4wMjYsMTIwLjk3MiwyMjEuNTI0LDEyMC40NDV6IE0yNS40NzksMTY0Ljk2NSAgIGMtMTEuOTU1LDIuNTMtMTcuODM4LTMuNDg3LTIwLjM2My03LjQ5NWM0LjQ4NiwwLjY3NCw4LjI5OS0wLjE3NywxMS4zOTQtMi41ODhjNi44NjItNS4zNTUsOS43MTQtMTguMjc2LDguNDYxLTM4LjQyICAgYy0wLjc3NC0xMi41MDUsMTAuMDA0LTE3LjgwNywxNS41MzctMTkuNjk1Yy0xLjEwMywyLjI1Mi0xLjg3MSw0LjY2Ny0yLjM1NSw3LjE5NmMtNS42NzcsNS4wMDctMy4xODMsMTQuNTQ0LTMuMTE1LDE0LjcwMyAgIEMzOS45MzcsMTU4LjU3NSwzMy42MDEsMTYzLjI1MSwyNS40NzksMTY0Ljk2NXogTTkxLjQzNSwxNjIuMzIzYy0wLjIwNywwLjQyLTAuMjM3LDAuOTA0LTAuMDkyLDEuMzU5bDEwLjQ3MSwzMS43NzZIOTYuNDcgICBsLTE0LjI5Mi0zNS41NDhsMS4zOC0yOC4wNTNjMC44MTMsMC44NCwxLjcyNiwxLjY4LDIuODgxLDIuNTAxYzMuMzE2LDIuMzcsOC4zMjMsNC41ODEsMTUuNzM4LDUuNzc0TDkxLjQzNSwxNjIuMzIzeiAgICBNMTc4LjA4LDE5Ni4xNjhoLTQuNDhsLTIuNDI5LTM2LjgxOGMtMC4wMTktMC4zMDItMC4xMTgtMC41OTEtMC4yNzgtMC44NDVsLTE1LjgxNy0yNC45MjZjMS42NDQsMC45NjksMy4zNCwxLjg1NSw1LjE5LDIuNDk0ICAgYzUuNzU3LDIuMDEsMTEuOTM5LDIuMjI5LDE3LjgxNCwxLjU0M1YxOTYuMTY4eiBNMjAxLjI4NiwxNjEuMjY1bC0yLjM1OC0zLjI1N2w3LjMzNS0zMC42MjNjMC4xNzItMC43MS0wLjA5NS0xLjQ0Mi0wLjY3NC0xLjg4ICAgcy0xLjM2NS0wLjQ3OS0xLjk5Mi0wLjEyNGMtMC4yNDIsMC4xMy0yNC4wNzQsMTMuNTcxLTQyLjE1NSw3LjI1OWMtNy41MTktMi42MTktMTMuMDkyLTguMzY0LTE2LjU1Ni0xNy4wNyAgIGMtMC4zNzMtMC45MjMtMS40MzEtMS4zNzgtMi4zNjQtMS4wMTdjLTAuOTI5LDAuMzc4LTEuMzksMS40My0xLjAxMSwyLjM3MWMyLjY5NSw2Ljc2Miw2LjY1NSwxMS44MzksMTEuNjM4LDE1LjM2NyAgIGMtMC4xODQtMC4wMTItMC4zNzItMC4wNjQtMC41NS0wLjAwNmMtMzguOTEsOS4wMi01Ni4yMTQsNC41NzUtNjMuODY1LTAuNzU2Yy01LjI3LTMuNjcxLTUuODM0LTcuNjk2LTUuODUyLTcuODM4ICAgYy0wLjAxMi0wLjEzNy0wLjE0NS0wLjIxOS0wLjE5NS0wLjM1NWMwLjEwNC01LjA3LTAuNTc5LTEwLjUzMi0yLjQyLTE2LjM1N2MtMC4zMDItMC45NTgtMS4zMy0xLjQ4My0yLjI3Ni0xLjE4NSAgIGMtMC45NTUsMC4zMDEtMS40ODksMS4zMjQtMS4xODUsMi4yNzZjMTAuNzEzLDMzLjg1MS0xOC43MjgsNTQuMTMtMTkuOTg3LDU0Ljk4N2MtMC42NzcsMC40NTUtMC45NjYsMS4zMTgtMC43LDIuMTA0ICAgbDEwLjc3OCwzMS4zMjdsLTYuMDUyLTAuMTEybC0xNi4zMjMtMzcuMjc5bDIuNjY5LTI0LjAzM2MwLjAyMy0wLjI0MiwwLTAuNDkxLTAuMDY4LTAuNzIyYy0xLjI3MS00LjI2Mi0yLjI4Ny03LjUwNi0zLjEwMy0xMC4wODkgICBjLTIuNDk0LTcuOTMzLTIuOTQzLTkuMzU3LTIuODIyLTE0Ljk2OWMwLjE3Ny04LjE1MSwzLjQ5OS0xNC44MTUsOS44OC0xOS44MWM5LjM4LTcuMzQ3LDIzLjM2OC05LjMyMSwzMS43ODItNy40MjdsMi4yNTIsMC41MDIgICBjMTQuMTgsMy4yMDksMjcuNTgsNi4yMzYsNDguMzMzLDEuMzAzYzkuMzgtMi4yMjMsMTAuMjY3LTMuOTksMTkuMDY3LTI2LjUzNmwwLjczMy0xLjkyNGMxLjc1Ni00LjcwOCw0LjQwMy0xMS44MzQsOC41Ny0xNC4wNTYgICBjMC4zNDktMC4xOCwwLjYyNy0wLjQ3NiwwLjc4Ni0wLjgyOGw0Ljg3Ny0xMC4zNTVsMS4xNTgsOS42NTJjMC4xMDEsMC44MTIsMC43MjcsMS40NiwxLjUzMSwxLjU4MSAgIGMwLjgxLDAuMTA5LDEuNjAyLTAuMzE2LDEuOTIxLTEuMDYxbDMuMzUyLTcuNTI3bDAuNDQ5LDcuOTgyYzAuMDM1LDAuNjQxLDAuNDAxLDEuMjE4LDAuOTY5LDEuNTEzICAgYzAsMCwzMC4wOTIsMTUuNjY0LDM3Ljk1MywxOS44NDZjMC4wMTIsMS41MTMtMC4yMjUsNC41NDUtMi4xODcsNi4wNDFjLTIuMDE2LDEuNTMxLTUuNjgxLDEuMjQxLTEwLjYwNC0wLjgzOSAgIGMtMC40NDktMC4xODktMC45NjMtMC4xODktMS40MDYsMGMtMC4xNDcsMC4wNjUtMTUuMTY3LDYuMjQ1LTI0LjE5My0yLjYwOWMtMC43MTUtMC42OTgtMS44NjctMC42ODgtMi41NzEsMC4wMjMgICBjLTAuNjk3LDAuNzE1LTAuNjg2LDEuODY1LDAuMDMsMi41NjhjMS41NTUsMS41MzEsMy4yNTcsMi41ODMsNC45OTQsMy40NTVjLTAuMDA2LDAuMDY0LTAuMDcsMC4xMDktMC4wNywwLjE4bC0wLjEwMSw0MS4wMDkgICBjMCwwLjk5LDAuNzg2LDEuNzk0LDEuNzczLDEuODEybDMwLjIyMSwwLjYyNmw3LjM2NSw3LjY3OUwyMDEuMjg2LDE2MS4yNjV6IE0xODEuOTY0LDUzLjU0NGMwLTEuNTY2LDEuMjcxLTIuODM3LDIuODM3LTIuODM3ICAgYzEuNTcyLDAsMi44NDMsMS4yNzEsMi44NDMsMi44MzdjMCwxLjU2OS0xLjI3MSwyLjg0LTIuODQzLDIuODRDMTgzLjIzNCw1Ni4zODQsMTgxLjk2NCw1NS4xMTksMTgxLjk2NCw1My41NDR6Ii8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+"
    },
    beetle: {
      id: "beetle",
      name: "Beetle",
      url: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8cGF0aCAlJSUlIGQ9Ik00MzcuNTIzLDMzNy43NzljMCwxMi4yNjMsNC45ODYsMjMuMzg3LDEzLjAzNSwzMS40MzZjOC4wNDksOC4wNDksMTkuMTczLDEzLjAzNSwzMS40MjQsMTMuMDM1ICAgIGM2Ljc3NSwwLDEyLjI1MS01LjQ4OCwxMi4yNTEtMTIuMjUxYzAtNi43NzUtNS40NzYtMTIuMjUxLTEyLjI1MS0xMi4yNTFjLTExLjAwMSwwLTE5Ljk1Ny04Ljk1NS0xOS45NTctMTkuOTY5ICAgIGMwLTE5LjA1LTYuOTk1LTM2LjQ5Ni0xOC41MzYtNDkuOTExYy0xMS41NTMtMTMuNDI3LTI3LjY2My0yMi44MjQtNDUuODkyLTI1Ljc2NHYtNTIuMjE0ICAgIGMzNi40NzEtNS44OCw2NC40MjgtMzcuNTc0LDY0LjQyOC03NS42ODdjMC0xMS4wMTQsOC45NTYtMTkuOTY5LDE5Ljk1Ny0xOS45NjljNi43NzUsMCwxMi4yNTEtNS40NzYsMTIuMjUxLTEyLjI1MSAgICBjMC02Ljc2My01LjQ3Ni0xMi4yNTEtMTIuMjUxLTEyLjI1MWMtMjQuNTE0LDAtNDQuNDU5LDE5Ljk1Ny00NC40NTksNDQuNDcxYzAsMjguNzY1LTIzLjQxMiw1Mi4xNzctNTIuMTc3LDUyLjE3N2gtNS44NjggICAgYy0zLjYzOS0zNi44ODgtMjMuNDk3LTY5LjA4My01Mi4zMjQtODkuMzM0VjgzLjE3OWMwLTEyLjcxNy00Ljk0OS0yNC42ODYtMTMuOTU0LTMzLjY3OGwtMC4wODYtMC4wODYgICAgYzEzLjcyMS02LjQyLDI0LjU4OC0xOC4yNTQsMjkuNTYyLTMzLjMyM2MyLjExOS02LjQzMi0xLjM3Mi0xMy4zNTQtNy44MDQtMTUuNDczYy02LjQxOS0yLjExOS0xMy4zNTQsMS4zNzItMTUuNDczLDcuNzkyICAgIGMtMy44MjIsMTEuNjM4LTEzLjkwNSwxOS44NDctMjUuODAxLDIxLjQ3NmwtMy45MDgtMy45MDhjLTE4LjU3My0xOC41NzItNDguODA4LTE4LjU3Mi02Ny4zOCwwbC0zLjkwOCwzLjkwOCAgICBjLTExLjg5Ni0xLjYyOS0yMS45NzgtOS44MzgtMjUuODAxLTIxLjQ3NmMtMi4xMTktNi40MTktOS4wNTMtOS45MTEtMTUuNDczLTcuNzkyYy02LjQzMiwyLjExOS05LjkyMyw5LjA0MS03LjgwNCwxNS40NzMgICAgYzQuOTc0LDE1LjA4MSwxNS44NTMsMjYuOTAzLDI5LjU2MiwzMy4zMWwtMC4wODYsMC4wOThjLTkuMDA0LDguOTkyLTEzLjk1NCwyMC45NjEtMTMuOTU0LDMzLjY3OHYxMy44NjggICAgYy0yOC44MjcsMjAuMjUxLTQ4LjY4NSw1Mi40NDYtNTIuMzEyLDg5LjMzNGgtNS44OGMtMjguNzY1LDAtNTIuMTc3LTIzLjQxMi01Mi4xNzctNTIuMTc3YzAtMjQuNTE0LTE5Ljk0NS00NC40NzEtNDQuNDU5LTQ0LjQ3MSAgICBjLTYuNzc1LDAtMTIuMjUxLDUuNDg4LTEyLjI1MSwxMi4yNTFjMCw2Ljc3NSw1LjQ3NiwxMi4yNTEsMTIuMjUxLDEyLjI1MWMxMS4wMDEsMCwxOS45NTcsOC45NTUsMTkuOTU3LDE5Ljk2OSAgICBjMCwzOC4xMTMsMjcuOTU3LDY5LjgwNiw2NC40MjgsNzUuNjg3djQzLjcxMWMtMzYuNDcxLDUuODgtNjQuNDI4LDM3LjU3NC02NC40MjgsNzUuNjc0YzAsNS41MDEtMi4yNDIsMTAuNDk5LTUuODU2LDE0LjExMyAgICBjLTMuNjE0LDMuNjE0LTguNiw1Ljg1Ni0xNC4xMDEsNS44NTZjLTYuNzc1LDAtMTIuMjUxLDUuNDg4LTEyLjI1MSwxMi4yNTFzNS40NzYsMTIuMjUxLDEyLjI1MSwxMi4yNTEgICAgYzI0LjUxNCwwLDQ0LjQ1OS0xOS45NDUsNDQuNDU5LTQ0LjQ3MWMwLTEyLjI2Myw0LjI2My0yMy41NTksMTEuMzgxLTMyLjQ5YzcuMTMtOC45MTksMTcuMTAyLTE1LjQ2MSwyOC41NDUtMTguMjI5djg4LjA5NyAgICBjLTM2LjQ3MSw1Ljg4LTY0LjQyOCwzNy41NzQtNjQuNDI4LDc1LjY3NGMwLDUuNTAxLTIuMjQyLDEwLjQ5OS01Ljg1NiwxNC4xMTNjLTMuNjE0LDMuNjE0LTguNiw1Ljg1Ni0xNC4xMDEsNS44NTYgICAgYy02Ljc3NSwwLTEyLjI1MSw1LjQ4OC0xMi4yNTEsMTIuMjUxUzIzLjI0NCw0ODYuOCwzMC4wMTksNDg2LjhjMjQuNTE0LDAsNDQuNDU5LTE5Ljk0NSw0NC40NTktNDQuNDcxICAgIGMwLTEyLjI3NSw0LjI2My0yMy41ODMsMTEuMzkzLTMyLjUwMnMxNy4xMTUtMTUuNDYxLDI4LjU1Ny0xOC4yMTdDMTE1LjY1Myw0NTguMjA2LDE3MC4xOTQsNTEyLDIzNy4wNzIsNTEyaDM3Ljg1NSAgICBjNjYuODc4LDAsMTIxLjQxOS01My43ODIsMTIyLjY0NC0xMjAuMzljMjIuODg1LDUuNTEzLDM5Ljk1LDI2LjE2OCwzOS45NSw1MC43MTljMCwxMi4yNjMsNC45ODYsMjMuMzg3LDEzLjAzNSwzMS40MzYgICAgYzguMDQ5LDguMDQ5LDE5LjE3MywxMy4wMzUsMzEuNDI0LDEzLjAzNWM2Ljc3NSwwLDEyLjI1MS01LjQ4OCwxMi4yNTEtMTIuMjUxcy01LjQ3Ni0xMi4yNTEtMTIuMjUxLTEyLjI1MSAgICBjLTExLjAwMSwwLTE5Ljk1Ny04Ljk1NS0xOS45NTctMTkuOTY5YzAtMTkuMDUtNi45OTUtMzYuNDk2LTE4LjUzNi00OS45MWMtMTEuNTUzLTEzLjQyNy0yNy42NjMtMjIuODI0LTQ1Ljg5Mi0yNS43NjR2LTc5LjU4MiAgICBDNDIwLjQ2OSwyOTIuNTg1LDQzNy41MjMsMzEzLjIyOCw0MzcuNTIzLDMzNy43Nzl6IE0yMDkuMzQ4LDgzLjE3OWMwLTYuMTc0LDIuNDAxLTExLjk4MSw2Ljc3NS0xNi4zNTVsMjMuNTEtMjMuNTIyICAgIGM5LjAyOS05LjAxNywyMy43MDYtOS4wMTcsMzIuNzM1LDBsMjMuNTEsMjMuNTIyYzQuMzc0LDQuMzc0LDYuNzc1LDEwLjE4MSw2Ljc3NSwxNi4zNTV2MC40OSAgICBjLTE0LjQwNy01Ljg2OC0zMC4xNjItOS4xMTUtNDYuNjUyLTkuMTE1cy0zMi4yNDUsMy4yNDctNDYuNjUyLDkuMTE1VjgzLjE3OXogTTI1Niw5OS4wNTZjNTAuNzU2LDAsOTIuNzQsMzguMTg2LDk4Ljc5Miw4Ny4zMjUgICAgaC01MC42N2MtMTkuNjI2LDAtMzcuMDg0LDkuNDIxLTQ4LjEyMiwyMy45NjNjLTExLjAzOC0xNC41NDItMjguNDk2LTIzLjk2My00OC4xMjItMjMuOTYzaC01MC42ODIgICAgQzE2My4yMzYsMTM3LjI0MywyMDUuMjQ0LDk5LjA1NiwyNTYsOTkuMDU2eiBNMzczLjA5NSwzODkuMzMxYzAsNTQuMTM3LTQ0LjA0Miw5OC4xNjctOTguMTY3LDk4LjE2N2gtMzcuODU1ICAgIGMtNTQuMTI1LDAtOTguMTY3LTQ0LjAzLTk4LjE2Ny05OC4xNjdWMjEwLjg4M2g2OC45NzNjMTkuNzczLDAsMzUuODcxLDE2LjA4NiwzNS44NzEsMzUuODcxdjE4OC40ODEgICAgYzAsNi43NjMsNS40ODgsMTIuMjUxLDEyLjI1MSwxMi4yNTFjNi43NjMsMCwxMi4yNTEtNS40ODgsMTIuMjUxLTEyLjI1MVYyNDYuNzU0YzAtMTkuNzg1LDE2LjA5OC0zNS44NzEsMzUuODcxLTM1Ljg3MWg2OC45NzMgICAgVjM4OS4zMzF6Ii8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+"
    },
    anteater: {
      id: "anteater",
      name: "Anteater",
      url: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8cGF0aCAlJSUlIGQ9Ik0yMjkuNDE3LDE3My4zNTJoLTEzLjI3OWMtNDMuODcyLDAtNzkuNTcsMzUuNjg4LTc5LjU3LDc5LjU2YzAsNS42MzYsNC41NjUsMTAuMTkxLDEwLjE5MSwxMC4xOTEgICAgczEwLjE5MS00LjU1NSwxMC4xOTEtMTAuMTkxYzAtMzIuNjMxLDI2LjU1Ny01OS4xNzgsNTkuMTg5LTU5LjE3OGgxMy4yNzljNS42MjUsMCwxMC4xOTEtNC41NjUsMTAuMTkxLTEwLjE5MSAgICBDMjM5LjYwOCwxNzcuOTA3LDIzNS4wNDIsMTczLjM1MiwyMjkuNDE3LDE3My4zNTJ6Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCAlJSUlIGQ9Ik0zOTUuNzYzLDIxMS41ODhjLTcuMDIxLDAtMTIuNzA4LDUuNjg3LTEyLjcwOCwxMi42OThjMCw3LjAyMSw1LjY4NywxMi42OTgsMTIuNzA4LDEyLjY5OCAgICBjNy4wMTEsMCwxMi42OTgtNS42NzYsMTIuNjk4LTEyLjY5OEM0MDguNDYxLDIxNy4yNzUsNDAyLjc3NCwyMTEuNTg4LDM5NS43NjMsMjExLjU4OHoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoICUlJSUgZD0iTTUxMS4yNTYsMzIzLjU2NWMtMTUuNDI5LTU0LjM0OC00OC42MjEtMTAzLjQ3OC05My40NzEtMTM4LjM1MWMtNi4yOTgtNC44OTItMTIuODcxLTkuNTI5LTE5LjU4Ny0xMy44NDkgICAgYzAuMDEtMC4zMDYsMC4wMzEtMC42MDEsMC4wNDEtMC45MDdjMC4yNDUtMTAuODc0LTMuOTg1LTIwLjE2OC0xMS41ODctMjUuNDk4Yy03LjYwMi01LjMyLTE3Ljc3My02LjExNS0yNy45MTMtMi4xODEgICAgYy0yLjgyMywxLjEwMS01LjU4NSwyLjUzOC04LjI0NCw0LjI3Yy0yOS43NDctMTEuNTY3LTYxLjExNS0xNy42NjEtOTMuMzA4LTE4LjA5OWMtMC4wNjEsMC0wLjEyMi0wLjAxLTAuMTgzLTAuMDFsLTQwLjg1NS0wLjA0MSAgICBjLTE2LjIwMywwLTMxLjY4MywzLjExOC00NS44NzksOC43OTVjLTguNTYsMy4yNjEtMTcuNTg5LDQuOTQzLTI2Ljg3Myw0Ljk0M0gxMDUuMTdDNDcuMTg0LDE0Mi42MzcsMCwxODkuODEsMCwyNDcuNzk2djI5LjI4OSAgICBjMCwxMy4yNDgsMTAuNzgyLDI0LjAzLDI0LjAzLDI0LjAzYzEyLjA0NiwwLDIyLjA1My04LjkwNywyMy43NzUtMjAuNDg0YzAuNDQ4LTEuNiwwLjY0Mi0yLjMwMywwLjY0Mi0zLjU0NiAgICBjMC0xNy40MTYsMTQuMTc2LTMxLjU5MiwzMS41ODItMzEuNTkySDkyLjM1Yy0wLjE0MywyLjQ1Ni0wLjIyNCwyMi4wMTItMC4yMjQsMjIuMDEyYzAsMC43OTUsMC4wOTIsMS41OSwwLjI3NSwyLjM2NCAgICBjMy44MTEsMTUuOTc5LDcuMTU0LDMyLjc0Myw5Ljk0Niw0OS44MjNjMi44NTMsMTcuNTY5LDUuMTY3LDM1Ljc5LDYuODg5LDU0LjE2NGMwLjQ4OSw1LjIzOCw0Ljg4MSw5LjI0MywxMC4xNCw5LjI0M2g2MC4yNDggICAgYzUuNjI1LDAsMTAuMTkxLTQuNTU1LDEwLjE5MS0xMC4xOTFjMC01LjYyNS00LjU2NS0xMC4xOTEtMTAuMTkxLTEwLjE5MWgtNi44OTlsMi4wNzktMjYuNjkgICAgYzE0LjMwOC00Ljc0OSwyNy4wMTYtMTMuNjU2LDM2LjM5Mi0yNS42NGg2OS45MmM5Ljc5MywxNi4wMiwxNy40MjYsMzQuMzMzLDIyLjI0Nyw1My44MDhjMC44OTcsMy42NTksMS42ODIsNy4yMzYsMi4zMzQsMTAuNjE5ICAgIGMwLjkwNyw0LjgxLDUuMTE2LDguMjg1LDEwLjAwNyw4LjI4NWg1NC4zODljNS42MzYsMCwxMC4xOTEtNC41NjYsMTAuMTkxLTEwLjE5MXMtNC41NTUtMTAuMTkxLTEwLjE5MS0xMC4xOTFoLTUuNTk1ICAgIGMxLjM5Ni05LjI2MywyLjEzLTE4LjgzMywyLjEzLTI4LjYwNmMwLTE3LjAwOS0yLjE2LTM0LjM2NC02LjQxLTUxLjU3NmMtMC4yMzQtMC45MTctMC40NjktMS44MzQtMC43MTMtMi43NTJoMTUuNzE0ICAgIGMzOC40MDksMCw3Mi44NjUsMjEuMzkxLDg5Ljk2NSw1NS44MzZjMC4xNTMsMC4zMTYsMC4zMTYsMC42MzIsMC40OTksMC45MzhjMy4wOTgsNS4yMjgsOC43OTUsOC40NjksMTQuODY4LDguNDY5aDE0Ljg5OSAgICBjOS4xMjEsMCwxNi41NS03LjQyOSwxNi41NS0xNi41NUM1MTIsMzI2LjgxNiw1MTEuNzQ1LDMyNS4xNjUsNTExLjI1NiwzMjMuNTY1eiBNOTUuMjY0LDIyNS4xMTFIODAuMDI5ICAgIGMtMC4wNjEsMC0wLjEyMiwwLjAxLTAuMTgzLDAuMDFjLTI3LjUyNiwwLjA5Mi01MC4wNjgsMjEuNzA3LTUxLjY3OCw0OC44NTVjLTAuMzE2LDAuOTc4LTAuNDc5LDIuMDE4LTAuNDc5LDMuMTA4ICAgIGMwLDIuMDA4LTEuNjQxLDMuNjQ4LTMuNjU5LDMuNjQ4Yy0yLjAwOCwwLTMuNjQ4LTEuNjQxLTMuNjQ4LTMuNjQ4di0yOC45ODNjMC0wLjAxLDAtMC4wMSwwLTAuMDF2LTAuMjk2ICAgIGMwLTQ2Ljc0NiwzOC4wMzItODQuNzc4LDg0Ljc4OC04NC43NzhoMjUuNjJDMTEzLjQyNCwxNzkuNTE3LDEwMC44MTgsMjAwLjk3OSw5NS4yNjQsMjI1LjExMXogTTQ4Mi40NzcsMzI0LjY0NiAgICBjLTkuODU1LTE4Ljk4Ni0yNC41Ni0zNS4wMzYtNDIuNjU5LTQ2LjUyMWMtMTkuMzAyLTEyLjI0OS00MS42NC0xOC43MjEtNjQuNi0xOC43MjFoLTI5LjI5OWMtMS4wNiwwLTIuMTQsMC4xNTMtMy4yLDAuNTEgICAgYy01LjM1LDEuNzUzLTguMjY1LDcuNTExLTYuNTAyLDEyLjg2MWMxLjU1OSw0Ljc0OSwyLjk3Niw5LjY5Miw0LjIwOSwxNC42NjVjMy44NjIsMTUuNjAyLDUuODE5LDMxLjMwNiw1LjgxOSw0Ni42NzQgICAgYzAsOS44MjQtMC44MDUsMTkuNDE0LTIuMzc0LDI4LjYwNmgtMTkuOTAzYy0wLjI2NS0xLjEyMS0wLjUzLTIuMjYyLTAuODE1LTMuNDA0Yy04Ljg4Ni0zNS44OTItMjYuNTE3LTY4LjQ2Mi00OS42NC05MS43MDggICAgYy0zLjk3NC0zLjk5NS0xMC40MjUtNC4wMDUtMTQuNDEtMC4wNDFjLTMuOTk1LDMuOTc0LTQuMDA1LDEwLjQyNS0wLjA0MSwxNC40MmMyLjUzOCwyLjU0OCw0Ljk5NCw1LjIyOCw3LjM3OCw4LjAySDIyMi42MyAgICBjMy43My05Ljk0Niw1LjQwMS0yMC42MzcsNC43OS0zMS40MDhjLTAuMzE2LTUuNjI1LTUuMDk1LTkuOTA2LTEwLjc1MS05LjZjLTUuNjI1LDAuMzI2LTkuOTE2LDUuMTM2LTkuNTksMTAuNzYyICAgIGMxLjU4LDI3Ljc5MS0xNi45MzcsNTIuMzUxLTQ0LjA0NSw1OC40MjRjLTQuMjksMC45MjctNy42MzMsNC41NjYtNy45OSw5LjE2MmwtMi43NzIsMzUuMzcyaC0yMy42NjMgICAgYy0xLjYzLTE1LjY5NC0zLjY5OS0zMS4yMjUtNi4xNDUtNDYuMjk3Yy0yLjgwMi0xNy4xNjEtNi4xNTUtMzQuMDA3LTkuOTU2LTUwLjEwOXYtMTMuNDAxICAgIGMwLTU3LjE0LDQ2LjQ5MS0xMDMuNjMxLDEwMy42MjEtMTAzLjYzMWw0MC42MTEsMC4wNDFjMC4wNTEsMCwwLjA5MiwwLjAxLDAuMTMzLDAuMDFjMjYuNzUxLDAuMzU3LDUyLjg2LDQuOTQzLDc3LjgyOCwxMy42MjUgICAgYy0yLjM5NSw0LjQ4NC0xLjEyMSwxMC4xNCwzLjEzOSwxMy4xMzZjNC42MTcsMy4yMiwxMC45NjUsMi4xMDksMTQuMTk2LTIuNTA3YzMuODcyLTUuNTIzLDkuMDE5LTkuODM0LDE0LjA5NC0xMS44MTEgICAgYzEuNzQzLTAuNjczLDYuMDg0LTIuMDM4LDguODM2LTAuMTIyYzIuNzQxLDEuOTI2LDIuOTM1LDYuNDgxLDIuODk0LDguMzQ2Yy0wLjEyMiw1LjQ1Mi0yLjQxNSwxMS43NS02LjI4OCwxNy4yNzQgICAgYy0zLjIzMSw0LjYxNi0yLjEyLDEwLjk2NSwyLjQ5NywxNC4xOTZjMS43NzMsMS4yNTMsMy44MTEsMS44NDUsNS44MzksMS44NDVjMy4yMSwwLDYuMzY5LTEuNTA4LDguMzQ2LTQuMzQxICAgIGMxLjU4LTIuMjUyLDIuOTg2LTQuNTc2LDQuMjA5LTYuOTZjNC4zNzIsMi45NjYsOC42NjIsNi4wNzQsMTIuODEsOS4yOTRjNDAuMjEzLDMxLjI2Niw3MC4yNzYsNzQuOTIzLDg1LjA1MywxMjMuMzRINDgyLjQ3N3oiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoICUlJSUgZD0iTTIyOS40MTcsMTczLjM1MmgtMTMuMjc5Yy00My44NzIsMC03OS41NywzNS42ODgtNzkuNTcsNzkuNTZjMCw1LjYzNiw0LjU2NSwxMC4xOTEsMTAuMTkxLDEwLjE5MSAgICBzMTAuMTkxLTQuNTU1LDEwLjE5MS0xMC4xOTFjMC0zMi42MzEsMjYuNTU3LTU5LjE3OCw1OS4xODktNTkuMTc4aDEzLjI3OWM1LjYyNSwwLDEwLjE5MS00LjU2NSwxMC4xOTEtMTAuMTkxICAgIEMyMzkuNjA4LDE3Ny45MDcsMjM1LjA0MiwxNzMuMzUyLDIyOS40MTcsMTczLjM1MnoiLz4KCTwvZz4KPC9nPgo8ZyBpZD0iU1ZHQ2xlYW5lcklkXzEiPgoJPGc+CgkJPHBhdGggJSUlJSBkPSJNMzk1Ljc2MywyMTEuNTg4Yy03LjAyMSwwLTEyLjcwOCw1LjY4Ny0xMi43MDgsMTIuNjk4YzAsNy4wMjEsNS42ODcsMTIuNjk4LDEyLjcwOCwxMi42OTggICAgYzcuMDExLDAsMTIuNjk4LTUuNjc2LDEyLjY5OC0xMi42OThDNDA4LjQ2MSwyMTcuMjc1LDQwMi43NzQsMjExLjU4OCwzOTUuNzYzLDIxMS41ODh6Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCAlJSUlIGQ9Ik0zOTUuNzYzLDIxMS41ODhjLTcuMDIxLDAtMTIuNzA4LDUuNjg3LTEyLjcwOCwxMi42OThjMCw3LjAyMSw1LjY4NywxMi42OTgsMTIuNzA4LDEyLjY5OCAgICBjNy4wMTEsMCwxMi42OTgtNS42NzYsMTIuNjk4LTEyLjY5OEM0MDguNDYxLDIxNy4yNzUsNDAyLjc3NCwyMTEuNTg4LDM5NS43NjMsMjExLjU4OHoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoICUlJSUgZD0iTTIyOS40MTcsMTczLjM1MmgtMTMuMjc5Yy00My44NzIsMC03OS41NywzNS42ODgtNzkuNTcsNzkuNTZjMCw1LjYzNiw0LjU2NSwxMC4xOTEsMTAuMTkxLDEwLjE5MSAgICBzMTAuMTkxLTQuNTU1LDEwLjE5MS0xMC4xOTFjMC0zMi42MzEsMjYuNTU3LTU5LjE3OCw1OS4xODktNTkuMTc4aDEzLjI3OWM1LjYyNSwwLDEwLjE5MS00LjU2NSwxMC4xOTEtMTAuMTkxICAgIEMyMzkuNjA4LDE3Ny45MDcsMjM1LjA0MiwxNzMuMzUyLDIyOS40MTcsMTczLjM1MnoiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4="
    },
    kitty: {
      id: "kitty",
      name: "Kitty",
      url: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8Y2lyY2xlICUlJSUgY3g9IjkzLjAwMSIgY3k9IjEyMi4wNjYiIHI9IjExLjQyOSIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggJSUlJSBkPSJNMTk5LjcwNiwxNjYuOTU0Yy0yLjg2My01LjA2LTkuMjkxLTYuODI1LTE0LjMzOS0zLjk1Yy0xLjAxNywwLjU3My0yLjY3NiwxLjE4LTQuNzgsMC43MzYgICAgYy0yLjM4NC0wLjUwMy00LjM0Ny0yLjI1NS01LjA5NS00LjU2OWwtMC4wMTIsMC4wMTJjLTEuMDE3LTMuMDg1LTMuNDEyLTUuNjU2LTYuNzItNi43NDNjLTUuNTI4LTEuOC0xMS40NjUsMS4yMTUtMTMuMjY0LDYuNzMxICAgIGMtMC43NiwyLjMxNC0yLjcxMSw0LjA2Ny01LjEwNyw0LjU2OWMtMi4wOTIsMC40NDQtMy43NTEtMC4xNjQtNC43OC0wLjczNmMtNS4wNDktMi44NzUtMTEuNDY0LTEuMTEtMTQuMzM5LDMuOTUgICAgYy0yLjg2Myw1LjA0OS0xLjA5OSwxMS40NjUsMy45NSwxNC4zMzljNC4yMTksMi4zOTYsOC45NjQsMy42MzUsMTMuNzU1LDMuNjM1YzEuOTA1LDAsMy44MzMtMC4xOTksNS43MzgtMC41OTYgICAgYzMuOTUtMC44Myw3LjYwOC0yLjUxMywxMC43NjMtNC44MzhjMy4xNjcsMi4zMjYsNi44MzcsNC4wMDgsMTAuNzk4LDQuODM4YzEuODkzLDAuMzk3LDMuODIyLDAuNTk2LDUuNzM4LDAuNTk2ICAgIGM0Ljc4LDAsOS41MjUtMS4yMzksMTMuNzQzLTMuNjM1QzIwMC44MDUsMTc4LjQxOSwyMDIuNTgxLDE3Mi4wMDMsMTk5LjcwNiwxNjYuOTU0eiIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPGNpcmNsZSAlJSUlIGN4PSIyMzcuOTg1IiBjeT0iMTIyLjA2NiIgcj0iMTEuNDI5Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggJSUlJSBkPSJNNDIzLjc5MSwzNDQuOTMzYy0wLjcyOS0wLjE5MS0xLjQ4MS0wLjMxMy0yLjI0Ni0wLjM1OWMtMS4xNDctMC4wNjktMi4zMjQsMC4wMzEtMy40OTksMC4zMiAgICAgYy02LjI2NCwxLjU0My0xMC4wOTcsNy44NzctOC41NTUsMTQuMTQxYzQuODUsMTkuNjU3LDEuODU4LDQwLjEyLTguNDE0LDU3LjYwM2MtMy4yNzIsNS41NjMtMS40MTQsMTIuNzI3LDQuMTYsMTUuOTg3ICAgICBjMS44NTgsMS4wOTksMy44OTIsMS42MTMsNS45MDIsMS42MTNjNC4wMDgsMCw3LjkxMi0yLjA1NywxMC4wODYtNS43NjFjMS4yNTQtMi4xMzUsMi40MjYtNC4zMDUsMy41MTMtNi41MDQgICAgIGMxLjA4Ny0yLjE5OSwyLjA5LTQuNDI5LDMuMDA5LTYuNjg0YzAuNjEyLTEuNTAzLDEuMTg3LTMuMDE4LDEuNzI0LTQuNTQ0YzIuNDE3LTYuODY0LDQuMDY4LTEzLjkzNiw0LjkzOS0yMS4xMDkgICAgIGMwLjA5Ny0wLjc5NywwLjE4NC0xLjU5NSwwLjI2MS0yLjM5NGMwLjE1NS0xLjU5OSwwLjI3MS0zLjIwMSwwLjM0OS00LjgwN2MwLjE1NS0zLjIxMiwwLjE1NS02LjQzNi0wLjAwMi05LjY2NCAgICAgYy0wLjA3OC0xLjYxNC0wLjE5Ni0zLjIyOC0wLjM1My00Ljg0MmMtMC4yMzUtMi40MjEtMC41NTktNC44NDEtMC45NzItNy4yNTVjLTAuMjc1LTEuNjEtMC41OS0zLjIxNy0wLjk0NS00LjgyMSAgICAgYy0wLjE3Ny0wLjgwMi0wLjM2NS0xLjYwMy0wLjU2Mi0yLjQwM2MtMC4zMjgtMS4zMzItMC44ODMtMi41NDUtMS41OTgtMy42MjljLTAuMzM2LTAuNTA5LTAuNjk4LTAuOTk2LTEuMTA0LTEuNDQxICAgICBjLTAuMjU0LTAuMjc5LTAuNTIxLTAuNTQ0LTAuNzk5LTAuNzk2Yy0wLjQ0NS0wLjQwMi0wLjkyNi0wLjc1OC0xLjQyNS0xLjA4N0M0MjYuMTk5LDM0NS43OTUsNDI1LjAzMSwzNDUuMjU4LDQyMy43OTEsMzQ0LjkzM3oiLz4KCQkJPHBhdGggJSUlJSBkPSJNNDkwLjAzNiwzNzMuOTdjMC4wMTItMC4yMjIsMC4wMzUtMC40NTYsMC4wMzUtMC42OVYxNDUuODQ4YzAtMTEuODYyLTQuNjE2LTIzLjAxMS0xMi45OTUtMzEuMzY3ICAgICBjLTguMzkxLTguMzY4LTE5LjUxNy0xMi45ODQtMzEuMzU1LTEyLjk4NGMtMjQuNDYsMC00NC4zNTEsMTkuODkxLTQ0LjM1MSw0NC4zNTF2ODguNDMyTDMwMC4xMDYsMTcwLjMyICAgICBjNS44NDMtMTYuNDU1LDguOTUyLTMzLjczOSw4Ljk1Mi01MC45NjVWMjQuMjczQzMwOS4wNTgsMTAuODkyLDI5OC4xNjYsMCwyODQuNzg1LDBjLTYuMTU5LDAtMTIuMDM3LDIuMzE0LTE2LjUzNiw2LjUwOSAgICAgYy0wLjEwNSwwLjA5NC0wLjE5OSwwLjE4Ny0wLjMwNCwwLjI5MmwtNDEuNDA1LDQxLjQwNmMtMTguNjA1LTEwLjQzNi0zOS41MTItMTUuOTE3LTYxLjA1MS0xNS45MTcgICAgIGMtMjEuNTM4LDAtNDIuNDU3LDUuNDgxLTYxLjA1MSwxNS45MTdMNjMuMDMyLDYuODAyYy0wLjEwNS0wLjEwNS0wLjE5OS0wLjE5OS0wLjMwNC0wLjI5MkM1OC4yMjksMi4zMTQsNTIuMzUxLDAsNDYuMTkyLDAgICAgIEMzMi44MTEsMCwyMS45MTksMTAuODkyLDIxLjkxOSwyNC4yNzN2OTUuMDgyYzAsMzguMTMzLDE1LjIwNCw3Ni42MTcsNDEuNjk4LDEwNS41ODhjMTAuNTA2LDExLjQ4OCwyMi4yNTEsMjEuMDAxLDM0Ljg2MSwyOC4zOTggICAgIGMtMC42MTksNy41NzMtMC44MywxNS4yNjMtMC42MTksMjIuOTUyYzAuOTIzLDM0LjQ1MiwxMC4yMDIsNjguMzMxLDI2LjgyMSw5OC4yOTZ2NjYuMzY4aC0wLjQ0NCAgICAgYy0xOS41ODcsMC0zNS41MjcsMTUuOTI5LTM1LjUyNywzNS41MTV2MTMuMDc3YzAsMTIuMzc2LDEwLjA3NCwyMi40NSwyMi40MzgsMjIuNDVoNjAuNDljMTUuMjI4LDAsMjguMjIzLTkuNzcsMzMuMDUtMjMuMzczICAgICBoMTIuMjI0djAuMjU3YzAsMTIuNzM4LDEwLjM2NiwyMy4xMTYsMjMuMTA0LDIzLjExNmgxMzMuNjQ4YzM0LjUyMiwwLDY3LjMxNS0xNi42NTMsODcuNjk2LTQ0LjUyNiAgICAgYzAuMDEyLDAsMC4wMTItMC4wMTIsMC4wMTItMC4wMTJjMi4xODUtMi45NjgsNC4yNTQtNi4xMjQsNi4xNTktOS4zOTZjMC4wMzUtMC4wNDcsMC4wNTgtMC4wOTMsMC4wOTQtMC4xNCAgICAgYzAuMDctMC4xMjgsMC4xNTItMC4yNTcsMC4yMzQtMC4zOTdDNDgzLjU5Niw0MzEuMjkzLDQ5MC43MjUsNDAyLjQxNSw0OTAuMDM2LDM3My45N3ogTTgwLjg1NCwyMDkuMTY2ICAgICBjLTIuNDE5LTIuNjUzLTQuNzIxLTUuMzk5LTYuOTE4LTguMjI3bDguNDQ5LTAuNzEzYzYuNDI4LTAuNTQ5LDExLjIwNy02LjIwNiwxMC42NTgtMTIuNjMzICAgICBjLTAuNTM4LTYuNDM5LTYuMTk0LTExLjIwNy0xMi42MzMtMTAuNjU4bC0yMC42MDMsMS43NDFjLTIuMTE1LTQuMTYtMy45OTctOC40MjYtNS42NjgtMTIuNzYybDI1LjczNCwzLjQxMiAgICAgYzAuNTE0LDAuMDcsMS4wMjgsMC4wOTMsMS41NDMsMC4wOTNjNS43NzMsMCwxMC43OTgtNC4yNjYsMTEuNTctMTAuMTQ0YzAuODUzLTYuNDA0LTMuNjQ2LTEyLjI4My0xMC4wNS0xMy4xMjRsLTM1LjY1Ni00LjczMyAgICAgYy0xLjI5Ny03LjMwNC0xLjk4Ny0xNC42OS0xLjk4Ny0yMi4wNjRWMjQuMjczYzAtMC40OTEsMC40MDktMC45LDAuOS0wLjljMC4wODIsMCwwLjMwNCwwLDAuNTM4LDAuMTc1bDQ3LjY5Myw0Ny43MDUgICAgIGMzLjk1LDMuOTM4LDEwLjEyMSw0LjU0NiwxNC43NiwxLjQ0OWMxNi42ODgtMTEuMTQ5LDM2LjE1OC0xNy4wMzksNTYuMzA2LTE3LjAzOWMyMC4xMzYsMCwzOS42MTcsNS44OSw1Ni4zMDYsMTcuMDM5ICAgICBjNC42NCwzLjA5NywxMC44MSwyLjQ4OSwxNC43Ni0xLjQ0OWw0Ny42OTMtNDcuNzA1YzAuMjM0LTAuMTc1LDAuNDU2LTAuMTc1LDAuNTM4LTAuMTc1YzAuNDkxLDAsMC45LDAuNDA5LDAuOSwwLjl2OTUuMDgyICAgICBjMCw3LjM3NC0wLjY3OCwxNC43Ni0xLjk4NywyMi4wNjRsLTM1LjY2Nyw0LjczM2MtNi4zOTMsMC44NDEtMTAuODkyLDYuNzItMTAuMDUsMTMuMTI0YzAuNzgzLDUuODc4LDUuNzk3LDEwLjE0NCwxMS41NywxMC4xNDQgICAgIGMwLjUxNCwwLDEuMDI4LTAuMDM1LDEuNTU0LTAuMDk0bDI1LjczNC0zLjQxMmMtMS42NTksNC4zMzYtMy41NTMsOC42MDEtNS42NjgsMTIuNzYybC0yMC42MTUtMS43NDEgICAgIGMtNi40MzktMC41NDktMTIuMDg0LDQuMjE5LTEyLjYzMywxMC42NThjLTAuNTM4LDYuNDI4LDQuMjMxLDEyLjA4NCwxMC42NTgsMTIuNjMzbDguNDYxLDAuNzEzICAgICBjLTIuMTk3LDIuODI4LTQuNDk5LDUuNTc0LTYuOTE4LDguMjI3Yy0yMy4xNzQsMjUuMzI1LTUzLjIzMiwzOS4yNjctODQuNjM0LDM5LjI2N1MxMDQuMDI5LDIzNC40OTEsODAuODU0LDIwOS4xNjZ6ICAgICAgTTQ0Ny44NzEsNDQ1LjQxbC01LjUzOSw4LjQ4NGMtMTYuMDIyLDIxLjc0OS00MS42NzQsMzQuNzMyLTY4LjY3LDM0LjczMkgyNDAuMjgyVjQ3NWMwLTcuNTE0LDYuMS0xMy42MjcsMTMuNjE1LTEzLjYyN2gzNC41ODEgICAgIGM0LjEyNSwwLDcuOTM1LTIuMTc0LDEwLjA1LTUuNzI2YzIuMTA0LTMuNTQxLDIuMTg1LTcuOTM1LDAuMjEtMTEuNTU4Yy02Ljc2Ni0xMi40MTEtMTAuMzQzLTI2LjUwNS0xMC4zNDMtNDAuNzM5ICAgICBjMC00Ny4wMjcsMzguMjUtODUuMjc3LDg1LjI2NS04NS4yNzdjNi40NTEsMCwxMS42ODctNS4yMzYsMTEuNjg3LTExLjY4N2MwLTYuNDYzLTUuMjM2LTExLjY4Ny0xMS42ODctMTEuNjg3ICAgICBjLTU5LjkwNSwwLTEwOC42MzgsNDguNzMzLTEwOC42MzgsMTA4LjY1YzAsMTEuODAzLDEuOTI4LDIzLjUyNSw1LjY1NiwzNC42NTFoLTE2Ljc4MmMtMTcuMDI3LDAtMzEuMzksMTEuNTctMzUuNjc5LDI3LjI1MyAgICAgaC0xMS41MjN2LTc0LjcxMmMwLTYuNDYzLTUuMjM2LTExLjY4Ny0xMS42ODctMTEuNjg3Yy02LjQ2MywwLTExLjY4Nyw1LjIyNC0xMS42ODcsMTEuNjg3djg2LjM5OSAgICAgYzAsNi40MzktNS4yNDcsMTEuNjg3LTExLjY4NywxMS42ODdoLTU5LjU1NXYtMTIuMTU0YzAtNi42OTYsNS40NTgtMTIuMTQyLDEyLjE1NC0xMi4xNDJoMTIuMTMxICAgICBjNi40NTEsMCwxMS42ODctNS4yMzYsMTEuNjg3LTExLjY4N3YtNzcuOTQ5YzAuNjMxLTIuNzgxLDAuMjY5LTUuNzk3LTEuMjc0LTguNDYxYy0xNS44Ny0yNy40MDUtMjQuNzA1LTU4LjcyNS0yNS41NDctOTAuNTcxICAgICBjLTAuMTA1LTMuODgtMC4wODItNy43NiwwLjA0Ny0xMS42MTZjMTQuMTY0LDUuMTA3LDI5LjA0MSw3Ljc2LDQ0LjIxLDcuNzZjMzguMDUxLDAsNzQuMjIxLTE2LjY0MiwxMDEuODcyLTQ2Ljg2MyAgICAgYzkuMTUxLTEwLjAwNCwxNi45NDYtMjEuMTI5LDIzLjIzMy0zMi45OTFsMTEwLjgsNjkuOTc5QzQ2NS4wNSwzMDIuMTA5LDQ4NS40MzEsMzgyLjY3Nyw0NDcuODcxLDQ0NS40MXogTTQ2Ni42OTgsMjk1LjQxMyAgICAgTDQ2Ni42OTgsMjk1LjQxM2MtMTAuNi0xNy4yODQtMjQuNjctMzIuODk4LTQxLjk1NS00NS43NjV2LTEwMy44YzAtMTEuNTcsOS40MDgtMjAuOTc3LDIwLjk3Ny0yMC45NzcgICAgIGM1LjU5OCwwLDEwLjg2OCwyLjE4NSwxNC44NDIsNi4xNDdjMy45NSwzLjk1LDYuMTM1LDkuMjIxLDYuMTM1LDE0LjgzVjI5NS40MTN6Ii8+CgkJPC9nPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPGNpcmNsZSAlJSUlIGN4PSI5My4wMDEiIGN5PSIxMjIuMDY2IiByPSIxMS40MjkiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoICUlJSUgZD0iTTE5OS43MDYsMTY2Ljk1NGMtMi44NjMtNS4wNi05LjI5MS02LjgyNS0xNC4zMzktMy45NWMtMS4wMTcsMC41NzMtMi42NzYsMS4xOC00Ljc4LDAuNzM2ICAgIGMtMi4zODQtMC41MDMtNC4zNDctMi4yNTYtNS4wOTUtNC41NjlsLTAuMDEyLDAuMDEyYy0xLjAxNy0zLjA4NS0zLjQxMi01LjY1Ni02LjcyLTYuNzQzYy01LjUyOC0xLjgtMTEuNDY1LDEuMjE1LTEzLjI2NCw2LjczMiAgICBjLTAuNzYsMi4zMTQtMi43MTEsNC4wNjctNS4xMDcsNC41NjljLTIuMDkyLDAuNDQ0LTMuNzUxLTAuMTY0LTQuNzgtMC43MzZjLTUuMDQ5LTIuODc1LTExLjQ2NC0xLjExLTE0LjMzOSwzLjk1ICAgIGMtMi44NjMsNS4wNDktMS4wOTksMTEuNDY1LDMuOTUsMTQuMzM5YzQuMjE5LDIuMzk2LDguOTY0LDMuNjM1LDEzLjc1NSwzLjYzNWMxLjkwNSwwLDMuODMzLTAuMTk5LDUuNzM4LTAuNTk2ICAgIGMzLjk1LTAuODMsNy42MDgtMi41MTMsMTAuNzYzLTQuODM4YzMuMTY3LDIuMzI2LDYuODM3LDQuMDA4LDEwLjc5OCw0LjgzOGMxLjg5MywwLjM5NywzLjgyMiwwLjU5Niw1LjczOCwwLjU5NiAgICBjNC43OCwwLDkuNTI1LTEuMjM5LDEzLjc0My0zLjYzNUMyMDAuODA1LDE3OC40MTksMjAyLjU4MSwxNzIuMDAzLDE5OS43MDYsMTY2Ljk1NHoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxjaXJjbGUgJSUlJSBjeD0iMjM3Ljk4NSIgY3k9IjEyMi4wNjYiIHI9IjExLjQyOSIvPgoJPC9nPgo8L2c+CjxnIGlkPSJTVkdDbGVhbmVySWRfMCI+Cgk8Zz4KCQk8cGF0aCAlJSUlIGQ9Ik00MzIuMTg3LDM1My40NDhjLTEuNTQzLTYuMjY0LTcuODc3LTEwLjA5Ny0xNC4xNDEtOC41NTVjLTYuMjY0LDEuNTQzLTEwLjA5Nyw3Ljg3Ny04LjU1NSwxNC4xNDEgICAgYzQuODUsMTkuNjU3LDEuODU4LDQwLjEyLTguNDE0LDU3LjYwM2MtMy4yNzIsNS41NjMtMS40MTQsMTIuNzI3LDQuMTYsMTUuOTg3YzEuODU4LDEuMDk5LDMuODkyLDEuNjEzLDUuOTAyLDEuNjEzICAgIGM0LjAwOCwwLDcuOTEyLTIuMDU3LDEwLjA4Ni01Ljc2MUM0MzQuNjA2LDQwNS42OTksNDM4LjQ5OCwzNzkuMDU0LDQzMi4xODcsMzUzLjQ0OHoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxjaXJjbGUgJSUlJSBjeD0iOTMuMDAxIiBjeT0iMTIyLjA2NiIgcj0iMTEuNDI5Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlICUlJSUgY3g9IjIzNy45ODUiIGN5PSIxMjIuMDY2IiByPSIxMS40MjkiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoICUlJSUgZD0iTTE5OS43MDYsMTY2Ljk1NGMtMi44NjMtNS4wNi05LjI5MS02LjgyNS0xNC4zMzktMy45NWMtMS4wMTcsMC41NzMtMi42NzYsMS4xOC00Ljc4LDAuNzM2ICAgIGMtMi4zODQtMC41MDMtNC4zNDctMi4yNTYtNS4wOTUtNC41NjlsLTAuMDEyLDAuMDEyYy0xLjAxNy0zLjA4NS0zLjQxMi01LjY1Ni02LjcyLTYuNzQzYy01LjUyOC0xLjgtMTEuNDY1LDEuMjE1LTEzLjI2NCw2LjczMiAgICBjLTAuNzYsMi4zMTQtMi43MTEsNC4wNjctNS4xMDcsNC41NjljLTIuMDkyLDAuNDQ0LTMuNzUxLTAuMTY0LTQuNzgtMC43MzZjLTUuMDQ5LTIuODc1LTExLjQ2NC0xLjExLTE0LjMzOSwzLjk1ICAgIGMtMi44NjMsNS4wNDktMS4wOTksMTEuNDY1LDMuOTUsMTQuMzM5YzQuMjE5LDIuMzk2LDguOTY0LDMuNjM1LDEzLjc1NSwzLjYzNWMxLjkwNSwwLDMuODMzLTAuMTk5LDUuNzM4LTAuNTk2ICAgIGMzLjk1LTAuODMsNy42MDgtMi41MTMsMTAuNzYzLTQuODM4YzMuMTY3LDIuMzI2LDYuODM3LDQuMDA4LDEwLjc5OCw0LjgzOGMxLjg5MywwLjM5NywzLjgyMiwwLjU5Niw1LjczOCwwLjU5NiAgICBjNC43OCwwLDkuNTI1LTEuMjM5LDEzLjc0My0zLjYzNUMyMDAuODA1LDE3OC40MTksMjAyLjU4MSwxNzIuMDAzLDE5OS43MDYsMTY2Ljk1NHoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoICUlJSUgZD0iTTQzMi4xODcsMzUzLjQ0OGMtMS41NDMtNi4yNjQtNy44NzctMTAuMDk3LTE0LjE0MS04LjU1NWMtNi4yNjQsMS41NDMtMTAuMDk3LDcuODc3LTguNTU1LDE0LjE0MSAgICBjNC44NSwxOS42NTcsMS44NTgsNDAuMTItOC40MTQsNTcuNjAzYy0zLjI3Miw1LjU2My0xLjQxNCwxMi43MjcsNC4xNiwxNS45ODdjMS44NTgsMS4wOTksMy44OTIsMS42MTMsNS45MDIsMS42MTMgICAgYzQuMDA4LDAsNy45MTItMi4wNTcsMTAuMDg2LTUuNzYxQzQzNC42MDYsNDA1LjY5OSw0MzguNDk4LDM3OS4wNTQsNDMyLjE4NywzNTMuNDQ4eiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPg=="
    },
    bunny: {
      id: "bunny",
      name: "Bunny",
      url: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8cGF0aCAlJSUlIGQ9Ik00NzIuMzQ1LDM1NS4wODFjLTguNzI5LTY0Ljk5NS02NC41NS0xMTUuMjcyLTEzMS44ODMtMTE1LjI3MmgtMTE0LjMzYzEuODk0LTQuMzQ5LDMuNjE4LTguODAzLDUuMTIxLTEzLjM2MyAgICBjMS45NzktNS45NjcsMi45NzMtMTIuMTk5LDIuOTczLTE4LjUyNmMwLTQuNzkzLTAuNTcxLTkuNTk2LTEuNjkzLTE0LjM0N2MxMy43MTItOS4wNzgsMjcuNzItMjAuNjUzLDQwLjkzNS0zMy44NTcgICAgYzIwLjE1NS0yMC4xNjYsMzYuMzk2LTQyLjA1Nyw0NS43MTctNjEuNjQxYzEzLjk1NS0yOS4zMTgsOC4yMjEtNDQuMTMsMC45NjMtNTEuMzk5Yy03LjI2OS03LjI1OC0yMi4wOTItMTMuMDAzLTUxLjQwOSwwLjk1MiAgICBjLTMuMDM2LDEuNDM5LTYuMTM3LDMuMDY4LTkuMjY4LDQuODQ2Yy0wLjE1OS0yNC4zNTYtNy4zMzItNDAuMDY3LTIwLjkyOC00NS4wMDhjLTI4Ljk2OS0xMC40ODUtNjMuNDgyLDM3LjQyMi04Mi42MTEsOTAuMTg2ICAgIGMtNS4yNjksMTQuNTI3LTkuMzMyLDI5LjMwNy0xMS45MzUsNDMuMjQyYy01OS4xNTQsNy4xNDItMTA3LjUwNiw0NS41MjctMTI2LjEzOCwxMDEuODc3Yy0xLjk3OSw1Ljk2Ny0yLjk3MywxMi4xOTktMi45NzMsMTguNTI2ICAgIGMwLDI2LjkxNiwxNy41MjEsNTEuOTkxLDQyLjM1Myw2Mi43M2MtNi4xNDcsMTUuNS05LjI1OCwzMS44ODktOS4yNTgsNDguODdjMCwyMC4xODcsNC41MTgsMzkuODQ1LDEzLjE2Miw1Ny43NThIMzcuNjY2ICAgIEMxNi44OTcsNDMwLjY1NiwwLDQ0Ny41NTIsMCw0NjguMzIxYzAsMjAuNzU4LDE2Ljg5NywzNy42NTUsMzcuNjY2LDM3LjY1NWwzMDIuNzk3LDAuMDExYzM1LjUzOSwwLDY4Ljk1Mi0xMy44MzksOTQuMTExLTM4Ljk3OCAgICBjNi44ODgtNi44OTgsMTIuOTE5LTE0LjQxLDE4LjA1LTIyLjQyYzQuMzE3LDEuMzEyLDguODI0LDIuMDIxLDEzLjM4NCwyLjAyMWMyNS4zNjEsMCw0NS45OTItMjAuNjMxLDQ1Ljk5Mi00NS45ODIgICAgQzUxMiwzNzcuNDE2LDQ5NC43MTIsMzU4LjE4MSw0NzIuMzQ1LDM1NS4wODF6IE0xNzUuODIzLDEwNC44NjhjMjAuNjQyLTU2LjkzMiw0OC4yNDYtODAuMTM1LDU1LjQ5My03Ny41MTEgICAgYzMuMzY1LDEuMjE3LDguOTkzLDEyLjQ5NSw2LjI2MywzOS40OTZjLTEwLjI1Miw3LjY1LTIwLjU2OCwxNi42LTMwLjQ3MSwyNi41MDRjLTE1LjA4NywxNS4wNzctMjcuODksMzEuMDExLTM3LjM5MSw0Ni40NDcgICAgYy0xLjAxNi0wLjA2My0zLjYxOC0wLjEyNy0zLjkxNS0wLjEyN0MxNjguMTk0LDEyOC4zODgsMTcxLjU4LDExNi41NTksMTc1LjgyMywxMDQuODY4eiBNNDM4LjU1Miw0MjYuODc4ICAgIGMtNS4wMzYsOS4xMi0xMS4zODQsMTcuNTk1LTE4Ljk0OSwyNS4xN2MtMjEuMTUsMjEuMTM5LTQ5LjI1MSwzMi43NzgtNzkuMTQsMzIuNzc4SDIyNC4xNjR2LTAuMDExICAgIGMtOS4wOTksMC0xNi41MDUtNy4zOTYtMTYuNTA1LTE2LjQ5NWMwLTkuMTEsNy40MDYtMTYuNTA1LDE2LjUwNS0xNi41MDVoNDcuODg2YzUuODQsMCwxMC41OC00Ljc0LDEwLjU4LTEwLjU4di0xNy45MjMgICAgYzAtMjkuNTI5LDI0LjAxNy01My41NDcsNTMuNTQ3LTUzLjU0N2gxMy45ODdjNS44NCwwLDEwLjU4LTQuNzQsMTAuNTgtMTAuNThjMC01Ljg1MS00Ljc0LTEwLjU4LTEwLjU4LTEwLjU4aC0xMy45ODcgICAgYy00MS4yLDAtNzQuNzA3LDMzLjUwOC03NC43MDcsNzQuNzA3djcuMzQzaC0zNy4zMDZjLTIwLjc2OSwwLTM3LjY2NiwxNi44OTctMzcuNjY2LDM3LjY2NmMwLDUuOTE0LDEuMzc1LDExLjUxMSwzLjgyLDE2LjQ5NSAgICBIMzcuNjY2Yy05LjA5OSwwLTE2LjUwNS03LjM5Ni0xNi41MDUtMTYuNDk1YzAtOS4xMSw3LjQwNi0xNi41MDUsMTYuNTA1LTE2LjUwNWg0MS43MThjMi4wMzEsMCw0LjA4NC0wLjU4Miw1LjkwNC0xLjgwOSAgICBjNC44NDYtMy4yNTksNi4xMjYtOS44NCwyLjg2Ny0xNC42ODVjLTEyLjQ0Mi0xOC40NjMtMTkuMDEzLTQwLjA1Ny0xOS4wMTMtNjIuNDI0YzAtMTcuNzU0LDQuMDMxLTM0LjczNSwxMS45ODctNTAuNDU3ICAgIGMyLjY0NS01LjIwNiwwLjU1LTExLjU3NS00LjY1NS0xNC4yMmMtMC44MTUtMC40MDItMS42NTEtMC42ODgtMi40OTctMC44NzhjLTEwLjYzMy0yLjM1OS0yMC4xMTMtOC41OTEtMjYuOTM3LTE2Ljg3NiAgICBjLTYuODI0LTguMjg0LTEwLjk5My0xOC42MjEtMTAuOTkzLTI5LjE3YzAtNC4wNjMsMC42MzUtOC4wNzMsMS45MDQtMTEuODkyYzguNzYtMjYuNDgyLDI1LjIwMi00OC43ODYsNDcuNTQ4LTY0LjQ5NyAgICBjMjIuNDItMTUuNzQzLDQ5LjYxMS0yNC4wNyw3OC42NTQtMjQuMDdjMC43NTEsMCw2Ljk0MSwwLjI3NSw5LjMsMC42OThjNC41NSwwLjgwNCw4LjkzLTEuNDI4LDExLjA2Ny01LjIzN2wwLjAxMSwwLjAxMSAgICBjOC42OTctMTUuNDI2LDIyLjAyOC0zMi40NzEsMzcuNTM5LTQ3Ljk5MmMxMC4yODQtMTAuMjg0LDIwLjk1OS0xOS40MDQsMzEuNDEzLTI2LjkwNmMwLjIyMi0wLjE0OCwwLjQzNC0wLjI5NiwwLjYzNS0wLjQ1NSAgICBjOC4xNDctNS44MDksMTYuMTU2LTEwLjYyMywyMy43MjEtMTQuMjJjMTYuMTI0LTcuNjcxLDI1LjE5Mi03LjI1OCwyNy4zMzktNS4xYzIuMTU4LDIuMTU4LDIuNTgyLDExLjIxNS01LjEsMjcuMzUgICAgYy04LjMxNiwxNy40NTctMjMuMDc2LDM3LjI2NC00MS41Nyw1NS43NThjLTEzLjc1NCwxMy43NTQtMjguMzQ1LDI1LjU0MS00Mi4zLDM0LjE2NGwwLjA5NSwwLjE1OSAgICBjLTQuMjIyLDEuNjA4LTYuODE0LDUuNjI5LTYuODE0LDkuODkzYzAsMS4yNDgsMC4yMjIsMi41MTgsMC42ODgsMy43NTZjMS45MTUsNS4wMzYsMi44ODgsMTAuMTQ2LDIuODg4LDE1LjIwNCAgICBjMCw0LjA2My0wLjY0NSw4LjA3My0xLjkwNCwxMS44OTJjLTIuOTQxLDguOTA5LTYuNzcxLDE3LjM4My0xMS4zODQsMjUuMjEzYy0yLjk2Myw1LjAzNi0xLjI4LDExLjUyMiwzLjc1NiwxNC40ODQgICAgYzEuNjgyLDAuOTk1LDMuNTM0LDEuNDYsNS4zNTQsMS40NmgxMzEuNTc2YzYxLjcxNSwwLDExMS45MTgsNTAuMjE0LDExMS45MTgsMTExLjkyOSAgICBDNDUyLjM4LDM5OS4wODQsNDM4LjcxMSw0MjYuNTQsNDM4LjU1Miw0MjYuODc4eiBNNDY2LjAwOCw0MjUuNDVjLTEuMDQ3LDAtMi4wOTUtMC4wNzQtMy4xMzItMC4yMDEgICAgYzYuNDc1LTE1LjEzLDEwLjA5NC0zMS40NDUsMTAuNjAxLTQ4LjMxYzEwLjA1MSwzLjE4NSwxNy4zNjIsMTIuNTkxLDE3LjM2MiwyMy42ODlDNDkwLjgzOSw0MTQuMzIsNDc5LjY5OCw0MjUuNDUsNDY2LjAwOCw0MjUuNDUgICAgeiIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPGNpcmNsZSAlJSUlIGN4PSIxMDIuMzExIiBjeT0iMjIzLjQ5NyIgcj0iMTIuODIzIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCAlJSUlIGQ9Ik0zNDAuNDU3LDI3Ni44NDFjLTUuODQyLDAtMTAuNTgsNC43MzgtMTAuNTgsMTAuNThjMCw1Ljg0Miw0LjczOCwxMC41OCwxMC41OCwxMC41OCAgICBjNDEuMjk3LDAsNzQuODk1LDMzLjU5OCw3NC44OTUsNzQuODk0YzAsNS44NDIsNC43MzgsMTAuNTgsMTAuNTgsMTAuNThzMTAuNTgtNC43MzgsMTAuNTgtMTAuNTggICAgQzQzNi41MTIsMzE5LjkzMSwzOTMuNDIzLDI3Ni44NDEsMzQwLjQ1NywyNzYuODQxeiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPg=="
    },
    manatee: {
      id: "manatee",
      name: "Manatee",
      url: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8cGF0aCAlJSUlIGQ9Ik01MTEuOTI2LDE4OC44NDljLTAuNjMyLTE3Ljc2Mi04LjAyMy0zNC4zNjUtMjAuODA0LTQ2Ljc2OGMtMTIuODU1LTEyLjQ0NS0yOS43OTYtMTkuMzA5LTQ3LjY5NC0xOS4zMDloLTczLjc3MyAgICBjLTEzLjc5MiwwLTI2Ljk1Myw0LjAzMi0zOC4yODIsMTEuNjk3Yy00Mi44NzIsMC4zNjgtODQuODI4LDcuOTM4LTEyNC43NTIsMjIuNTQxYy0zNS44NzEsMTMuMTI5LTY5LjI3NywzMS42MjgtOTkuNTE1LDU1LjAyMiAgICBjLTExLjU4MS0xNS45OTMtMjcuNzg1LTI1LjI0Ny00NS4wMi0yNS4yNDdjLTE3LjIyNSwwLTMzLjE4Niw4LjkyOC00NC45NTcsMjUuMTMxQzYuMDg1LDIyNy4xMiwwLDI0Ny4xNjcsMCwyNjguMzYxICAgIGMwLDIxLjE4Myw2LjA4NSw0MS4yMjksMTcuMTMsNTYuNDMzYzExLjc3MSwxNi4yMDMsMjcuNzMyLDI1LjEyMSw0NC45NTcsMjUuMTIxYzE4LjEyLDAsMzQuODkxLTEwLjA0NCw0Ni41MzYtMjcuMzg1ICAgIGMyMS4xODMsMTQuMDAzLDQ1LjY1MSwyMS4zNTIsNzEuNDI1LDIxLjM1MmgxMTUuNjQ1YzMuMjk1LDE2LjQ0NSw3LjU1OSwzMS4yOTEsMTkuODU3LDM5LjQ3MSAgICBjNS44ODUsMy45MTcsMTIuOTkyLDUuODc1LDIxLjQ4OSw1Ljg3NWM0LjcyNywwLDkuODg2LTAuNjExLDE1LjQ5OC0xLjgxMWMxNS43My0zLjM1OSwyNi4yMjYtOS41MTgsMzIuMTAxLTE4LjgxNCAgICBjNy40MTItMTEuNzcxLDUuOTE3LTI2LjAxNiwyLjYxMS00MS4zMDNjMjEuODM2LTEyLjUxOCwzOC4xMDMtMzIuMjkxLDQ2LjE1Ny01NS43MTdjOC4zMDcsNi4xMDcsMTguNDY3LDkuNTM5LDI5LjIxNiw5LjUzOSAgICBjMjcuMjI3LDAsNDkuMzc5LTIyLjE1Miw0OS4zNzktNDkuMzc5QzUxMiwyMzEuNzQyLDUxMS45NjgsMTg5LjY3MSw1MTEuOTI2LDE4OC44NDl6IE00NjIuNjIxLDI2MC40MTEgICAgYy05Ljg4NiwwLTE4LjkwOS01LjAzMy0yNC4xNjMtMTMuMjc2Yy0wLjE1OC0wLjI1My00LjI0My0xMS4wNjUtNC4yNDMtMjAuNDE1YzAtNS43MjctMi44NjQtMTAuOTkyLTguNTA3LTExLjkyOSAgICBjLTUuNjQzLTAuOTQ4LTEwLjk4MSwyLjg2NC0xMS45MTgsOC40OTZjLTAuNDUzLDIuNjk1LTAuNjg0LDUuNDY0LTAuNjg0LDguMjEyYzAsNi44NzUsMS40MTEsMTMuNTgyLDQuMTE3LDE5Ljc3MiAgICBjLTMuNjg1LDIyLjQ3OC0xNi4zMyw0Mi4wODItMzQuOTIzLDU0LjY5NWMtMC4xNTgtMC43MDUtMy45OC0yMi41OTQtMTguNDM1LTQ0LjI3MmMtMy4xNjktNC43NTktOS44MzQtNS42NzUtMTQuNDY2LTIuMzI3ICAgIGMtNC42MzMsMy4zNDgtNS42NzUsOS44MzQtMi4zMjcsMTQuNDY2YzYuNTQ5LDkuMDU1LDExLjY5NywyMS4yNTcsMTQuNDk4LDM0LjM2NWMwLjk3OSw0LjU4LDIuMDMyLDguOTYsMy4wNDMsMTMuMjAzICAgIGMzLjczOCwxNS41ODIsNi45NywyOS4wNDgsMi40OTUsMzYuMTQ0Yy0yLjY5NSw0LjI3NS05LjA1NSw3LjUwNy0xOC44OTksOS42MTJjLTkuODQ0LDIuMTA2LTE2Ljk3MiwxLjc0OC0yMS4xODMtMS4wNTMgICAgYy02Ljk4LTQuNjQzLTkuNTM5LTE4LjI1Ni0xMi40OTctMzQuMDA3Yy0wLjgxMS00LjI4NS0xLjY0Mi04LjcxOC0yLjYyMi0xMy4yOTdjLTIuODAxLTEzLjA5Ny0zLjA4NS0yNi4zNDItMC44MTEtMzcuMjgxICAgIGMxLjE1OC01LjYwMS0yLjQzMi0xMS4wODYtOC4wMzMtMTIuMjQ1Yy01LjYwMS0xLjE2OS0xMS4wODYsMi40MzItMTIuMjU1LDguMDMzYy0yLjg4NSwxMy44ODctMi41OSwyOS43MzIsMC44NDIsNDUuODMxICAgIGMwLDAuMDEsMC4wMTEsMC4wMjEsMC4wMTEsMC4wMzJIMTgwLjA0OGMtMjUuMDc5LDAtNDguNjczLTguMjY1LTY4LjIyNS0yMy45Yy0wLjYxMS0wLjQ4NC0xLjI3NC0wLjkxNi0yLjAxMS0xLjI2MyAgICBjLTUuMTU5LTIuNDY0LTExLjM1LTAuMjc0LTEzLjgwMyw0Ljg5NmMtNy44NDQsMTYuNDY3LTIwLjUzMSwyNi4zLTMzLjkyMywyNi4zYy0xMC40MTMsMC0yMC40MjUtNS44OTYtMjguMTk1LTE2LjU4MiAgICBjLTguNDk3LTExLjY5Ny0xMy4xODItMjcuNDE2LTEzLjE4Mi00NC4yNjJjMC0xNi44NTYsNC42ODUtMzIuNTc1LDEzLjE4Mi00NC4yNzJjNy43Ny0xMC42OTcsMTcuNzgzLTE2LjU4MiwyOC4xOTUtMTYuNTgyICAgIGMxMi44NDUsMCwyNS4yMTYsOS4yMTIsMzMuMTAyLDI0LjYzN2MyLjYxMSw1LjA5Niw4Ljg0NCw3LjEwNywxMy45NCw0LjUwNmMwLjY4NC0wLjM0NywxLjg4NS0xLjIzMiwxLjg4NS0xLjIzMiAgICBjMzAuNzk2LTI1LjQ0Nyw2NS4zNjEtNDUuMjcyLDEwMi43MzctNTguOTM4YzM4LjY1LTE0LjE1LDc5LjM1My0yMS4zMzEsMTIwLjk1MS0yMS4zMzFjMi4zMzcsMCw0LjQ4NS0wLjc3OSw2LjIxMi0yLjA4NSAgICBsMC4wMSwwLjAxMWM4LjMzOS02LjI2NCwxOC4yODgtOS41ODEsMjguNzMyLTkuNTgxaDczLjc3M2MyNS45MzIsMCw0Ni45MjUsMjAuMjg4LDQ3LjgxLDQ2LjE4OCAgICBjMCwwLjA5NSwwLjA1Myw0Mi4wNjEsMC4wNTMsNDIuMDYxQzQ5MS4yOTEsMjQ3LjU0Niw0NzguNDM1LDI2MC40MTEsNDYyLjYyMSwyNjAuNDExeiIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPGNpcmNsZSAlJSUlIGN4PSI0MjUuNTYxIiBjeT0iMTY2LjE5MiIgcj0iMTEuODcxIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCAlJSUlIGQ9Ik0yOTguNDM5LDE5Mi45NGMtMC45MDMtNS42NDktNi4yMDMtOS40OTgtMTEuODY1LTguNTkxYy0zNi40NDcsNS44MzQtNzEuMTM0LDE4LjA5LTEwMy4wOTgsMzYuNDMxICAgIGMtNC45NjMsMi44NDgtNi42NzYsOS4xNzgtMy44MjksMTQuMTRjMS45MTUsMy4zMzgsNS40MDQsNS4yMDUsOC45OTUsNS4yMDVjMS43NDgsMCwzLjUyLTAuNDQzLDUuMTQ0LTEuMzc2ICAgIGMyOS43ODEtMTcuMDg4LDYyLjEwMS0yOC41MDgsOTYuMDYyLTMzLjk0NEMyOTUuNDk4LDIwMy45MDEsMjk5LjM0NCwxOTguNTg4LDI5OC40MzksMTkyLjk0eiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPg=="
    },
    whale: {
      id: "whale",
      name: "Whale",
      url: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8Y2lyY2xlICUlJSUgY3g9IjM0Ni4yODUiIGN5PSIyNTcuMDEzIiByPSIxMi42NDEiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoICUlJSUgZD0iTTQzMC40LDkzLjQxOWMtMTIuMDkzLDAtMjIuOTc5LDUuMjUxLTMwLjUxNSwxMy41ODVjLTcuNTM2LTguMzM3LTE4LjQzLTEzLjU4NS0zMC41My0xMy41ODUgICAgYy0yMi42ODcsMC00MS4xNTQsMTguNDU2LTQxLjE1NCw0MS4xNTRjMC4wMDEsNS44NjksNC43NjQsMTAuNjMxLDEwLjYzMiwxMC42MzFjNS44NzksMCwxMC42MzEtNC43NjMsMTAuNjMxLTEwLjYzMSAgICBjMC0xMC45NzIsOC45My0xOS44OTEsMTkuODkxLTE5Ljg5MWMxMC41MjUsMCwxOS4xNTgsOC4xOTcsMTkuODM4LDE4LjU1MmgwLjA3NGwwLjA3NCwwLjAwNSAgICBjLTAuMDU0LDAuNDM3LTAuMDkyLDM3Ljk4Mi0wLjA5MiwzNy45ODJjMCw1Ljg3Miw0Ljc2LDEwLjYzMSwxMC42MzEsMTAuNjMxYzUuODcyLDAsMTAuNjMxLTQuNzYsMTAuNjMxLTEwLjYzMVYxMzQuNTcgICAgYzAtMC4wMTItMC4wMDItMC4wMjMtMC4wMDItMC4wMzVjMC4wMjEtMTAuOTU1LDguOTQxLTE5Ljg1MywxOS44ODktMTkuODUzYzEwLjk3MiwwLDE5Ljg5MSw4LjkyLDE5Ljg5MSwxOS44OTEgICAgYzAsNS44NjksNC43NjMsMTAuNjMxLDEwLjYzMSwxMC42MzFjNS44NzksMCwxMC42MzEtNC43NjMsMTAuNjMxLTEwLjYzMUM0NzEuNTU0LDExMS44NzUsNDUzLjA5OCw5My40MTksNDMwLjQsOTMuNDE5eiIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggJSUlJSBkPSJNNTAzLjc1OCwyMTIuMjM1Yy02LjYyMy03Ljc4Mi0xNi4yNzctMTIuMjM3LTI2LjQ4My0xMi4yMzdIMTk0LjUzM2MtMzIuMTI4LDAtNTkuNzctMjIuODU3LTY1LjcyMy01NC4zNDggICAgYy0wLjEyMy0wLjY1LTAuMjg3LTEuMjgyLTAuNDUyLTEuOTE0aDE2Ljg5OWMzMC4xODIsMCw1NC43My0yNC41NDgsNTQuNzMtNTQuNzNWNzQuMzc4YzAtNS44NjgtNC43NjMtMTAuNjMxLTEwLjYzMS0xMC42MzEgICAgaC0zMS45MzdjLTIzLjQyMSwwLTQ0Ljc5LDExLjk3MS01Ny40MiwzMC41MzNDODcuMzU4LDc1LjcxOCw2Niw2My43NDcsNDIuNTY4LDYzLjc0N0gxMC42MzFDNC43NjMsNjMuNzQ3LDAsNjguNTEsMCw3NC4zNzggICAgdjE0LjYyOWMwLDMwLjE4MywyNC41NDgsNTQuNzMsNTQuNzMsNTQuNzNoMTguNjQyYy0wLjU5NywyLjMxMS0wLjkwOSw0LjcxNC0wLjkwOSw3LjE2NnY1OS43NDggICAgYzAsNDUuOTQ5LDE3LjE4LDg5Ljc3MSw0OC4zNjIsMTIzLjM5OGMyNy42NSwyOS44MTYsNjQuMDgsNDkuMjc0LDEwMy43OTQsNTUuNzA2Yy01LjQyNCwxNi40ODgtNS4xNzYsMzQuOTIsMi4wNzUsNTIuMTMxICAgIGMxLjA5NSwyLjU5OCwzLjE3OCw0LjY1Nyw1Ljc5LDUuNzJjMS4yODUsMC41MjIsNC42NiwxLjE3Miw4LjEzNy0wLjA1MWw5Ni42ODQtNDAuNzYzYzcuNDQyLTMuMTI2LDEzLjM3NS04Ljg1MSwxNi44MTMtMTUuOTcxICAgIGgwLjAwMmM0MC4yMDgtNC44MDUsNzcuODU0LTIzLjA2LDEwNi42NTQtNTEuODcxYzI3LjAwNC0yNi45OTMsNDQuNTU2LTYxLjA4OCw1MC43MzMtOTguNjA2YzAuMDIxLTAuMTA2LDAuMDMyLTAuMjAyLDAuMDQyLTAuMzA4ICAgIHYtMC4wMDJsMC4wMTEsMC4wMDJDNTEzLjE2NiwyMzAuMDc1LDUxMC4zMjgsMjE5Ljk0Myw1MDMuNzU4LDIxMi4yMzV6IE01NC43MywxMjIuNDc0Yy0xOC40NTYsMC0zMy40NjgtMTUuMDExLTMzLjQ2OC0zMy40NjggICAgdi0zLjk5N2gyMS4zMDVjMjIuMzY4LDAsNDIuMDE1LDE1LjcyNCw0Ni45MjcsMzcuNDY1SDU0LjczeiBNMTU3LjQxOSw4NS4wMDloMjEuMzA1djMuOTk3YzAsMTguNDU2LTE1LjAxMiwzMy40NjgtMzMuNDY4LDMzLjQ2OCAgICBoLTM0Ljc2NUMxMTUuMzkzLDEwMC43MzMsMTM1LjA1LDg1LjAwOSwxNTcuNDE5LDg1LjAwOXogTTQ0NS43MzEsMzIzLjkxOGMtMjMuMjgzLDIzLjMwNC01My4xMzYsMzguNzgzLTg1LjI2NCw0NC40ODIgICAgYzE3Ljk1Ni01OS4wMjUsNjYuNjA2LTEwMy43NTIsMTI2LjkwNy0xMTYuNzExQzQ4MC4xOTgsMjc4Ljk0Nyw0NjUuOTg0LDMwMy42ODYsNDQ1LjczMSwzMjMuOTE4eiBNMzM1Ljg4OCwzNzguNzQ0ICAgIGMtMC4wMjksMC4xMjQtMC4wNDgsMC4yNS0wLjA2NywwLjM3NGMtMC44MzEsMy42MjgtMy4zMzMsNi42MzctNi43NjIsOC4wNzdsLTg1LjkxNSwzNi4yMjIgICAgYy00Ljg2OC0yNC4yNzIsNy44MzItNDkuNDk5LDMxLjUwOC01OS40ODZjNS40MS0yLjI4MSw3Ljk0Ni04LjUxOCw1LjY2NC0xMy45MjhjLTIuMjgzLTUuNDA5LTguNTE4LTcuOTQ3LTEzLjkyNy01LjY2MyAgICBjLTEzLjE3LDUuNTU1LTIzLjkwNiwxNC40ODUtMzEuNjQyLDI1LjM1OGMtMzcuNjQ1LTQuNDc3LTcyLjM3Mi0yMi4xMTgtOTguMzI1LTUwLjEwN2MtMjcuNTM1LTI5LjY4My00Mi42OTYtNjguMzctNDIuNjk2LTEwOC45NCAgICB2LTU5Ljc0OGMwLTEuOTI0LDAuNzQ0LTMuNzIxLDIuMDg0LTUuMDYxYzEuMzYxLTEuMzYxLDMuMTU4LTIuMTA1LDUuMDcxLTIuMTA1YzMuNDM0LDAsNi4zODksMi40NjYsNy4wMzgsNS44NzkgICAgYzcuODU3LDQxLjUxNiw0NC4yOCw3MS42NDUsODYuNjE0LDcxLjY0NWgyODIuNzQyYzMuOTY2LDAsNy43MTgsMS43MzMsMTAuMzAyLDQuNzYzYzAuOTI5LDEuMDkxLDEuNjU0LDIuMjg3LDIuMTc4LDMuNTUxICAgIEM0MTMuMTY2LDI0My4xMTksMzUxLjk4NCwzMDEuOTQzLDMzNS44ODgsMzc4Ljc0NHoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoICUlJSUgZD0iTTIxMS43MywzMTIuNTUyYy0xNC43MzUtNi4wOTEtMjcuNzQ5LTE1LjE1NS0zOC42NzgtMjYuOTM5Yy03LjAzNy03LjU4Ny0xMi45NTUtMTYuMDkyLTE3LjU5LTI1LjI4ICAgIGMtMi42NDQtNS4yNDEtOS4wMzgtNy4zNDctMTQuMjgtNC43MDRjLTUuMjQyLDIuNjQ0LTcuMzQ4LDkuMDM4LTQuNzA0LDE0LjI4MWM1LjUzMywxMC45NjcsMTIuNTkzLDIxLjExNywyMC45ODUsMzAuMTYzICAgIGMxMy4wMjksMTQuMDQ4LDI4LjU1NSwyNC44NTgsNDYuMTQ0LDMyLjEyOWMxLjMyOSwwLjU1LDIuNzA0LDAuODEsNC4wNTcsMC44MWM0LjE3NSwwLDguMTM1LTIuNDc1LDkuODMtNi41NzMgICAgQzIxOS43MzcsMzIxLjAxMSwyMTcuMTU3LDMxNC43OTQsMjExLjczLDMxMi41NTJ6Ii8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+"
    },
    toucan: {
      id: "toucan",
      name: "Toucan",
      url: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8cGF0aCAlJSUlIGQ9Ik00MTkuMTA1LDMzLjIwOWMtMC45NzYtMC45ODctNS4wODktNC44MTItNi4xNTQtNS43MUMzOTIuMzk0LDkuNzY5LDM2Ni4xMDQsMCwzMzguOTI3LDBIMjM2LjU2MyAgICBjLTI0LjU5MywwLjAxMS00OC40MSw0Ljk3OS03MC44MDgsMTQuNzY5YzAsMC0yNi45MjIsMTEuMjY1LTUxLjIxNiwzNC4wOTZDODkuNjgsNzIuMjE2LDc0LjQzNCwxMDYuMDksNzQuNDM0LDEwNi4wOSAgICBjLTkuNzkxLDIyLjQwOS0xNC43NDcsNDYuMjQ4LTE0Ljc0Nyw3MC44NTJsLTAuMDExLDI4My4xMzJjMCwyOC42MjksMjMuMjg1LDUxLjkyNSw1MS45MjUsNTEuOTI1ICAgIGM2LjEyMSwwLDExLjA4OC00Ljk2NywxMS4wODgtMTEuMDg4di0yOC41NDFjOC40MjcsNS45MSwxOC42ODMsOS40MDMsMjkuNzM4LDkuNDAzYzYuMTIxLDAsMTEuMDg4LTQuOTY3LDExLjA4OC0xMS4wODh2LTI4LjEzICAgIGM4LjQzOCw1LjkxLDE4LjY4Myw5LjQwMywyOS43NDksOS40MDNjNi4xMjEsMCwxMS4wODgtNC45NjcsMTEuMDg4LTExLjA4OHYtNzguODI1bDAuMjMzLTAuMjY2ICAgIGMwLjkzMS0xLjA2NCw0LjE2OS01LjAwMSw0Ljg1Ny01Ljg2NmgxNjUuNDMzYzYuMTIxLDAsMTEuMDg4LTQuOTU2LDExLjA4OC0xMS4wODhjMC02LjEyMS00Ljk2Ny0xMS4wODgtMTEuMDg4LTExLjA4OGgtODYuNDA5ICAgIGwxMC41MTEtMTAuNTExYzIuNDk1LDAuMzQ0LDUuMDAxLDAuNTIxLDcuNDg0LDAuNTIxYzE0LjI3LDAsMjguMjQxLTUuNjExLDM4LjU1My0xNS45MjIgICAgYzEzLjY5NC0xMy42OTQsMTkuMDk0LTMzLjgzLDE0LjA5My01Mi41NTdjLTEuMDMxLTMuODM2LTQuMDI1LTYuODMtNy44NS03Ljg1Yy0xOC43MTctNS4wMDEtMzguODUyLDAuMzk5LTUyLjU1NywxNC4wOTMgICAgYy0xMi4xMDgsMTIuMTE5LTE3LjczLDI5LjI3Mi0xNS4zOSw0Ni4wMjZsLTI2LjIxMiwyNi4yMDFoLTMyLjY0M2MwLjY0My0xLjEzMSw5LjAwMy0xNS4wOTEsMTMuMzE3LTI5LjE1ICAgIGMzLjI3MS0xMC42NTYsNi4zOTgtMjEuNDc3LDguMDM5LTMyLjU3N2MwLjAyMi0wLjA3OCwwLjAzMy0wLjE2NiwwLjA0NC0wLjI1NWMxLjIzMS04LjQ3MSwxLjg2My0xNy4xNDIsMS44NjMtMjUuNzU3VjE3NC4wNiAgICBoMTI4LjMyMmMyMi44NDEsMCw0Mi4wNDYtMTUuOTIyLDQ3LjA2OS0zNy4yNTZoMTguMTI5YzYuMTIxLDAsMTEuMDg4LTQuOTY3LDExLjA4OC0xMS4wODh2LTEyLjMzICAgIEM0NTIuMzI0LDgzLjA4Miw0NDAuNTI3LDU0LjYwOCw0MTkuMTA1LDMzLjIwOXogTTMxNC4zODksMjc3LjE4OWM2LjQ3NS02LjQ3NSwxNS4zOS05LjgwMiwyNC4zNDktOS40MDMgICAgYzAuNDIxLDguOTgxLTIuOTI3LDE3Ljg4NS05LjQwMywyNC4zNmMtNi40NzUsNi40NjQtMTUuMzc5LDkuODI0LTI0LjM0OSw5LjM5MkMzMDQuNTc3LDI5Mi41NjgsMzA3LjkxNCwyODMuNjY1LDMxNC4zODksMjc3LjE4OXogICAgIE0yMjUuNTMsMjIuOTg1bDAuMDExLDE1Ni41ODVjLTM4LjM3Ni01LjQxMS02OC4wMDMtMzguNDUzLTY4LjAwMy03OC4zMDRDMTU3LjUzOCw2MS40MjgsMTg3LjE1NSwyOC4zOTYsMjI1LjUzLDIyLjk4NXogICAgIE0xMDAuNTEzLDM5NS43MDlsLTAuMDExLDkxLjk3NWMtMTAuOTIyLTQuNDEzLTE4LjY1LTE1LjEyNC0xOC42NS0yNy42MDlsMC4wMTEtODAuMzc3YzYuNDA5LTAuNjk5LDEyLjY0LTEuOTg1LDE4LjY1LTMuODAzICAgIFYzOTUuNzA5eiBNMTgyLjE3Niw0MjcuNjQyYy0xMC45MzMtNC40MDItMTguNjYxLTE1LjEyNC0xOC42NjEtMjcuNjA5di0zLjMyNmM2LjUwOS00LjAwMywxMi43NC04LjQzOCwxOC42NjEtMTMuMjVWNDI3LjY0MnogICAgIE0yMjUuNTQxLDI0NS45OTljMCw3LjYxNy0wLjU2NSwxNS4yNzktMS42NjMsMjIuNzUzYy0wLjAxMSwwLjA4OS0wLjAyMiwwLjE2Ni0wLjAzMywwLjI0NCAgICBjLTEuNDQxLDkuNjI0LTMuNzkyLDE5LjEyNy02Ljk5NywyOC4yNjNjMCwwLTUuOTQzLDE2LjI2Ni0xNS4wNjksMzEuMThjLTguNjM4LDE0LjExNS0yMS41NzcsMjYuOTk5LTIxLjU3NywyNi45OTkgICAgYy01LjQxMSw1LjQxMS0xMS4yMSwxMC40MDEtMTcuMzMxLDE0Ljk0N2MtMS41My00LjMwMi01LjYyMi03LjM4NS0xMC40NDUtNy4zODVjLTYuMTIxLDAtMTEuMDg4LDQuOTY3LTExLjA4OCwxMS4wODh2ODMuMzcxICAgIGMtMTAuOTIyLTQuNDEzLTE4LjY1LTE1LjEyNC0xOC42NS0yNy42MDl2LTYzLjcwMWMzMC4yODEtMTcuODUyLDUwLjY1LTUwLjgwNSw1MC42NjEtODguNDM4di0zOS44NSAgICBjMC0zMS4zNDYtMjUuNTAyLTU2LjgzNy01Ni44MzctNTYuODM3Yy02LjEzMiwwLTExLjA4OCw0Ljk2Ny0xMS4wODgsMTEuMDg4YzAsNi4xMjEsNC45NTYsMTEuMDg4LDExLjA4OCwxMS4wODggICAgYzkuMjU4LDAsMTcuOTYzLDMuNjA0LDI0LjUwNSwxMC4xNDZjNi41NDIsNi41NTMsMTAuMTU3LDE1LjI1NywxMC4xNTcsMjQuNTE2djM5Ljg1Yy0wLjAxMSw0MC41NzEtMzAuMjE1LDc0LjIyMy02OS4zMTEsNzkuNjQ1ICAgIFYxNzYuOTQzYzAtMjEuNTMzLDQuMzM1LTQyLjM4OSwxMi44ODQtNjEuOTQ5YzAsMCw3LjE0MS0xNi42ODcsMjIuMjA5LTM2LjIwMmMxNS43NjctMjAuNDI0LDMyLjczMi0yOS45NzEsMzMuMjY0LTMwLjI1OSAgICBjLTkuNDAzLDE1LjM3OS0xNC44NTgsMzMuNDE5LTE0Ljg1OCw1Mi43MzVjMCw1Mi4xMDMsMzkuNTI5LDk1LjEyNCw5MC4xNzksMTAwLjY1N1YyNDUuOTk5eiBNMjQ3LjcxNywyMi4xNzZoOTEuMjEgICAgYzE4LjUxNywwLDM2LjUxMyw1LjYzMyw1MS42NTksMTYuMDQ0Yy0yMS44MSwxOS4zNDktMzQuNzcyLDQ2Ljg4LTM1LjU3LDc2LjQwN0gyNDcuNzE3VjIyLjE3NnogTTM3Ni4wMzksMTUxLjg4NEgyNDcuNzE3di0xNS4wOCAgICBoMTUyLjAyOEMzOTUuNTY1LDE0NS43MDgsMzg2LjUwNiwxNTEuODg0LDM3Ni4wMzksMTUxLjg4NHogTTQzMC4xNDgsMTE0LjYyOGgtNTIuOTU2YzAuODItMjQuMDE3LDExLjgzMS00Ni4zMTUsMzAuMTI2LTYxLjU5NCAgICBjMCwwLDExLjQ5OCwxMi45MjksMTcuMTIsMjguNDUyQzQzMS40NjgsMTAwLjkwMSw0MzAuMTQ4LDExNC42MjgsNDMwLjE0OCwxMTQuNjI4eiIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggJSUlJSBkPSJNMTk0LjI2Miw3MC44NDFjLTcuMDYzLDAtMTIuNzg0LDUuNzIxLTEyLjc4NCwxMi43OTZjMCw3LjA2Myw1LjcyMSwxMi43ODQsMTIuNzg0LDEyLjc4NHMxMi43OTYtNS43MjEsMTIuNzk2LTEyLjc4NCAgICBDMjA3LjA1OCw3Ni41NjMsMjAxLjMyNSw3MC44NDEsMTk0LjI2Miw3MC44NDF6Ii8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+"
    }
  };

  // src/drawHorse.ts
  var drawHorse = {
    header: document.getElementById("header"),
    stretcher: document.getElementById("stretcher"),
    colors: document.getElementById("colors"),
    canvas: document.getElementById("drawHere"),
    // Known bug preserved: selectedColor appears twice in script.js (lines 472 and 478).
    // JavaScript uses the last definition; TypeScript only allows one — behavior is identical.
    selectedColor: "black",
    currentTool: void 0,
    // set to tools.pencil in main.ts during initialization
    selectedStamp: void 0,
    undoStack: [],
    ctx: void 0,
    // set in window.onload
    pos: { x: 0, y: 0 },
    colorChoices: [],
    canvasWidth: 0,
    canvasHeight: 0,
    stamps,
    setPosition(e) {
      if (e.target === drawHorse.canvas) e.preventDefault();
      const bcr = e.target.getBoundingClientRect();
      const touch = e.touches?.[0];
      if (touch) {
        drawHorse.pos.x = touch.clientX - bcr.x;
        drawHorse.pos.y = touch.clientY - bcr.y;
      } else {
        drawHorse.pos.x = e.clientX - bcr.x;
        drawHorse.pos.y = e.clientY - bcr.y;
      }
    },
    beginPosition(e) {
      drawHorse.setPosition(e);
    },
    endPosition(e) {
      drawHorse.currentTool.stopDrawing(e);
      drawHorse.setPosition(e);
      drawHorse.undoStack.push(
        drawHorse.ctx.getImageData(0, 0, drawHorse.ctx.canvas.width, drawHorse.ctx.canvas.height)
      );
    },
    draw(e) {
      const me = e;
      const te = e;
      if (me.buttons && me.buttons === 1 || te.touches && te.touches.length > 0) {
        drawHorse.currentTool.draw(e);
      }
    },
    resize() {
      drawHorse.canvasWidth = drawHorse.stretcher.offsetWidth;
      drawHorse.canvasHeight = Math.floor(
        0.95 * (window.innerHeight - drawHorse.header.offsetHeight - drawHorse.colors.offsetHeight)
      );
      drawHorse.ctx.canvas.width = drawHorse.stretcher.offsetWidth;
      drawHorse.ctx.canvas.height = drawHorse.canvasHeight;
      drawHorse.stretcher.style.height = drawHorse.canvasHeight + "px";
      drawHorse.stretcher.setAttribute(
        "style",
        `width:${drawHorse.canvasWidth}px;height:${drawHorse.canvasHeight}px;`
      );
    },
    addListeners() {
      window.addEventListener("resize", drawHorse.resize);
      document.addEventListener(
        "click",
        function(e) {
          const toolEl = e.target.closest?.(".tool");
          if (!toolEl) return;
          const tool = tools[toolEl.id];
          const toolControls = document.getElementsByClassName("tool");
          if (tool.selectable) {
            for (let i = 0; i < toolControls.length; i++) {
              toolControls[i].classList.remove("selectedControl");
            }
            toolEl.classList.add("selectedControl");
            drawHorse.currentTool = tool;
          }
          tool.onclick(e);
        },
        false
      );
      drawHorse.canvas.addEventListener("mousemove", function(e) {
        if (!drawHorse.currentTool.drawsImmediately) drawHorse.draw(e);
      });
      drawHorse.canvas.addEventListener("mousedown", function(e) {
        drawHorse.beginPosition(e);
        drawHorse.draw(e);
      });
      drawHorse.canvas.addEventListener("mouseup", function(e) {
        drawHorse.endPosition(e);
      });
      drawHorse.canvas.addEventListener("mouseleave", function(e) {
        drawHorse.currentTool.stopDrawing(e);
      });
      drawHorse.canvas.addEventListener("mouseenter", function(e) {
        drawHorse.beginPosition(e);
      });
      drawHorse.canvas.addEventListener("touchmove", drawHorse.draw);
      drawHorse.canvas.addEventListener("touchstart", function(e) {
        drawHorse.beginPosition(e);
        drawHorse.draw(e);
      });
      drawHorse.canvas.addEventListener("touchend", function(e) {
        drawHorse.endPosition(e);
      });
    },
    setupColorChooser() {
      drawHorse.colorChoices = document.getElementsByClassName("colorChoice");
      for (let i = 0; i < drawHorse.colorChoices.length; i++) {
        ;
        drawHorse.colorChoices[i].onclick = drawHorse.getColorChoiceClickHandler(drawHorse.colorChoices[i]);
      }
    },
    getColorChoiceClickHandler(cc) {
      return (e) => {
        drawHorse.selectedColor = cc.id;
        const colorChoiceControls = document.getElementsByClassName("colorChoice");
        for (let i = 0; i < colorChoiceControls.length; i++) {
          colorChoiceControls[i].classList.remove("selectedColorChoice");
        }
        ;
        e.target.classList.add("selectedColorChoice");
      };
    },
    makeStampChoiceHandler(cc) {
      return (_e) => {
        drawHorse.selectedStamp = drawHorse.stamps[cc.id];
      };
    },
    setupStamps() {
      Object.entries(drawHorse.stamps).forEach(([_key, value]) => {
        const stampchooser = document.getElementById("stampchooser");
        const colorized = window.btoa(
          window.atob(value.url).replaceAll(
            "%%%%",
            ` style='fill:${drawHorse.selectedColor};stroke:${drawHorse.selectedColor};' `
          )
        );
        stampchooser.innerHTML += `<button id='${value.id}' class='stampchoice'><img width='30px' max-width='30px' max-height='30px' src='data:image/svg+xml;base64,${colorized}' alt='${value.name}'/></button>`;
      });
      const stampChoices = document.getElementsByClassName("stampchoice");
      for (let i = 0; i < stampChoices.length; i++) {
        ;
        stampChoices[i].onclick = drawHorse.makeStampChoiceHandler(stampChoices[i]);
      }
      drawHorse.selectedStamp = drawHorse.stamps["horse"];
    },
    setupTools() {
      const toolButtons = document.getElementsByClassName("tool");
      for (let i = 0; i < toolButtons.length; i++) {
        const _toolButton = toolButtons[i];
      }
    },
    showStampSelectors() {
      const stampchooser = document.getElementById("stampchooser");
      stampchooser.style.display = "";
    },
    hideStampSelectors() {
      const stampchooser = document.getElementById("stampchooser");
      stampchooser.style.display = "none";
    },
    showColorSelectors() {
      const colorchooser = document.getElementById("colorchooser");
      colorchooser.style.display = "";
    }
  };

  // src/main.ts
  globalThis.tools = tools;
  globalThis.drawHorse = drawHorse;
  globalThis.playSound = playSound;
  globalThis.pauseSound = pauseSound;
  drawHorse.currentTool = tools.pencil;
  window.onload = (_event) => {
    drawHorse.setupColorChooser();
    drawHorse.canvasWidth = drawHorse.stretcher.offsetWidth;
    drawHorse.canvasHeight = Math.floor(
      0.95 * (window.innerHeight - drawHorse.header.offsetHeight - drawHorse.colors.offsetHeight)
    );
    document.body.style.margin = "0";
    drawHorse.canvas.style.width = String(drawHorse.stretcher.offsetWidth);
    drawHorse.canvas.style.height = String(drawHorse.canvasHeight);
    drawHorse.stretcher.style.height = drawHorse.canvasHeight + "px";
    drawHorse.stretcher.setAttribute(
      "style",
      `width:${drawHorse.canvasWidth}px;height:${drawHorse.canvasHeight}px;`
    );
    drawHorse.ctx = drawHorse.canvas.getContext("2d");
    drawHorse.resize();
    drawHorse.addListeners();
    drawHorse.setupStamps();
    drawHorse.setupTools();
  };
})();
