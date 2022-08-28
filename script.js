let playSound = (soundId, loop) => {
  var audio = document.getElementById(soundId);
  if (loop) {
    audio.style.loop = "loop";
  }
  audio.play();
};

let pauseSound = (soundId) => {
  var audio = document.getElementById(soundId);
  audio.pause();
  audio.style.loop = "";
  audio.currentTime = 0;
};

// need to setup audio so it checks to see if they've loaded before trying to play
// need to make audio files shorter and loop friendly
// need to have start and end drawing functions on each tool
// need to figure out how to have audio start playing as soon as it ends
// the end drawing functions should pause the sound
//

let tools = {
  pencil: {
    name: "pencil",
    button: document.getElementById("pencil"),
    drawsImmediately: false,
    selectable: true,
    onclick: (e) => {
      playSound("clickSound");
      drawHorse.showColorSelectors();
      drawHorse.hideStampSelectors();
    },
    settings: {
      width: 5,
      controls: [
        {
          id: "increase",
          name: "+",
          icon: "",
          onclick: (e) => {
            tools.pencil.settings.width--;
          },
        },
        {
          id: "decrease",
          name: "+",
          icon: "",
          onclick: (e) => {
            tools.pencil.settings.width++;
          },
        },
      ],
    },
    draw: (e) => {
      playSound("pencilSound");
      drawHorse.ctx.beginPath(); // begin

      drawHorse.ctx.lineWidth = 5;
      drawHorse.ctx.lineCap = "round";
      drawHorse.ctx.strokeStyle = drawHorse.selectedColor;

      drawHorse.ctx.moveTo(drawHorse.pos.x, drawHorse.pos.y); // from
      drawHorse.setPosition(e);
      drawHorse.ctx.lineTo(drawHorse.pos.x, drawHorse.pos.y); // to

      drawHorse.ctx.stroke(); // draw it!
    },
    stopDrawing: (e) => {
      pauseSound("pencilSound");
    },
  },
  drips: {
    name: "drips",
    drawsImmediately: false,
    selectable: true,
    button: document.getElementById("drips"),
    settings: {
      width: 5,
      controls: [
        {
          id: "increase",
          name: "+",
          icon: "",
          onclick: (e) => {
            tools.pencil.settings.width--;
          },
        },
        {
          id: "decrease",
          name: "+",
          icon: "",
          onclick: (e) => {
            tools.pencil.settings.width++;
          },
        },
      ],
    },
    onclick: (e) => {
      playSound("clickSound");
      drawHorse.showColorSelectors();
      drawHorse.hideStampSelectors();
    },
    getDripSize: () => {
      var size = 0;
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
    },
    draw: (e) => {
      playSound("drippingSound");
      drawHorse.setPosition(e);
      drawHorse.ctx.fillStyle = drawHorse.selectedColor;

      // Draw a filled circle
      drawHorse.ctx.beginPath();
      drawHorse.ctx.arc(
        drawHorse.pos.x,
        drawHorse.pos.y,
        tools.drips.getDripSize(),
        0,
        Math.PI * 2,
        true
      );
      drawHorse.ctx.closePath();
      drawHorse.ctx.fill();
    },
    stopDrawing: (e) => {
      pauseSound("drippingSound");
    },
  },
  stamp: {
    name: "stamp",
    drawsImmediately: true,
    selectable: true,
    settings: {
      width: 5,
      controls: [
        {
          id: "increase",
          name: "+",
          icon: "",
          onclick: (e) => {
            tools.pencil.settings.width--;
          },
        },
        {
          id: "decrease",
          name: "+",
          icon: "",
          onclick: (e) => {
            tools.pencil.settings.width++;
          },
        },
      ],
    },
    onclick: (e) => {
      playSound("clickSound");
      drawHorse.showStampSelectors();
      drawHorse.showColorSelectors();

    },
    button: document.getElementById("stamp"),
    draw: (e) => {
     // var e1 = document.createElementNS("http://www.w3.org/2000/svg", 'path'); //Create a path in SVG's namespace
      playSound("stampSound");
      let img = new Image(50, 50);
      img.src = "data:image/svg+xml;base64," + window.btoa(window.atob(drawHorse.selectedStamp.url).replaceAll("%%%%", " style='fill:" + drawHorse.selectedColor + ";stroke:" + drawHorse.selectedColor + ";' "));
      img.onload = function () {
        drawHorse.ctx.drawImage(
          img,
          drawHorse.pos.x - 25,
          drawHorse.pos.y - 25,
          50,
          50
        );
      };
    },
    stopDrawing: (e) => {},
  },
  bubbles: {
    name: "bubbles",
    button: document.getElementById("bubbles"),
    drawsImmediately: true,
    selectable: true,
    settings: {
      size: 35,
      sizeVariation: 15,
      maxNumberBubbles: 30,
    },
    onclick: (e) => {
      playSound("clickSound");
      drawHorse.showColorSelectors();
      drawHorse.hideStampSelectors();
    },
    draw: (e) => {
              
      let bubbleUrl1 = "https://cdn.glitch.global/ecc7c6c7-2450-49b5-b5e7-94175cb9ac28/bubble.svg?v=1652888646403";
      let bubbleUrl2 = "https://cdn.glitch.global/ecc7c6c7-2450-49b5-b5e7-94175cb9ac28/bubble2.svg?v=1652888650037";
      let bubbleUrl3 = "https://cdn.glitch.global/ecc7c6c7-2450-49b5-b5e7-94175cb9ac28/bubble3.svg?v=1652888653363";
      let totalBubbles = Math.floor(Math.random() * tools.bubbles.settings.maxNumberBubbles);
      
      for (var i = 0; i < totalBubbles; i++) {

        let img = new Image(tools.bubbles.settings.size, tools.bubbles.settings.size);
        let bubbleChoice = Math.random();
        var bubbleUrl = bubbleUrl1
        if(bubbleChoice < .33) {
          bubbleUrl = bubbleUrl1;
        } else if (bubbleChoice >= .33 && bubbleChoice < .5) {
          bubbleUrl = bubbleUrl2;
        } else {
          bubbleUrl = bubbleUrl3;
        }
        img.src = bubbleUrl;
        let positive = Math.floor(Math.random() * 2) % 2 == 0 ? -1 : 1;
        let xOffset = positive * Math.floor(Math.random() * (i * tools.bubbles.settings.size))
        let yOffset = Math.floor(Math.random() * (i * tools.bubbles.settings.size))
        let bubbleSizeSign = Math.floor(Math.random() * 2) % 2 == 0 ? -1 : 1;
        let bubbleSize = Math.floor(tools.bubbles.settings.size + bubbleSizeSign * Math.floor(Math.random() * tools.bubbles.settings.sizeVariation))
        img.onload = function() {
          drawHorse.ctx.drawImage(
            img,
            (drawHorse.pos.x - tools.bubbles.settings.size / 2) + xOffset, 
            (drawHorse.pos.y - tools.bubbles.settings.size /2) - yOffset,
            bubbleSize,
            bubbleSize
          )
        }
      }
    },
    stopDrawing: (e) => {},
  },
  eraser: {
    name: "eraser",
    button: document.getElementById("eraser"),
    drawsImmediately: false,
    selectable: true,
    settings: {
      width: 5,
      controls: [
        {
          id: "increase",
          name: "+",
          icon: "",
          onclick: (e) => {
            tools.pencil.settings.width--;
          },
        },
        {
          id: "decrease",
          name: "+",
          icon: "",
          onclick: (e) => {
            tools.pencil.settings.width++;
          },
        },
      ],
    },
    onclick: (e) => {
      playSound("clickSound");
      drawHorse.showColorSelectors();
      drawHorse.hideStampSelectors();
    },
    draw: (e) => {
      playSound("eraserSound");
      drawHorse.ctx.beginPath(); // begin

      drawHorse.ctx.lineWidth = 5;
      drawHorse.ctx.lineCap = "round";
      drawHorse.ctx.strokeStyle = "white";

      drawHorse.ctx.moveTo(drawHorse.pos.x, drawHorse.pos.y); // from
      drawHorse.setPosition(e);
      drawHorse.ctx.lineTo(drawHorse.pos.x, drawHorse.pos.y); // to

      drawHorse.ctx.stroke(); // draw it!
      console.log(drawHorse.ctx);
    },
    stopDrawing: (e) => {
      pauseSound("eraserSound");
    },
  },
  oops: {
    name: "oops",
    drawsImmediately: false,
    selectable: false,
    button: document.getElementById("oops"),
    draw: (e) => {},
    stopDrawing: (e) => {},
    onclick: (e) => {
      playSound("oopsSound");
      let imageData = drawHorse.undoStack.pop();
      if (imageData) {
        drawHorse.ctx.putImageData(imageData, 0, 0);
      }
    },
  },
  nuke: {
    name: "nuke",
    drawsImmediately: false,
    selectable: false,
    button: document.getElementById("nuke"),
    draw: (e) => {},
    stopDrawing: (e) => {},
    onclick: (e) => {
      playSound("tornadoSound");
      drawHorse.ctx.clearRect(
        0,
        0,
        drawHorse.ctx.canvas.width,
        drawHorse.ctx.canvas.height
      );
    },
  },
  bucket: {
    onclick: (e) => {
      playSound("clickSound");
      drawHorse.showColorSelectors();
      drawHorse.hideStampSelectors();
    },
    drawsImmediately: true,
    selectable: true,
    button: document.getElementById("bucket"),
    matchStartColor: (pixelPos, colorLayer, startColor) => {
      var r = colorLayer.data[pixelPos];
      var g = colorLayer.data[pixelPos + 1];
      var b = colorLayer.data[pixelPos + 2];
      return r === startColor[0] && g === startColor[1] && b === startColor[2];
    },
    colorPixel: (pixelPos, colorLayer, fillColor) => {
      //let color = standardizeColor(fillColor);
      let color = [100, 1, 2];
      //console.log("colorin " + JSON.stringify(pixelPos) + " " + JSON.stringify(color))
      //console.log(colorLayer);
      colorLayer.data[pixelPos] = color[0];
      colorLayer.data[pixelPos + 1] = color[1];
      colorLayer.data[pixelPos + 2] = color[2];
      colorLayer.data[pixelPos + 3] = 255;
    },
    standardizeColor: (str) => {
      var colorctx = document.createElement("canvas").getContext("2d");
      colorctx.fillStyle = str;
      //console.log("standardize")
      //console.log(colorctx);
      return tools.bucket.hexToRgb(colorctx.fillStyle);
    },
    hexToRgb: (hex) => {
      var aRgbHex = hex.substring(1).match(/.{1,2}/g);
      var aRgb = [
        parseInt(aRgbHex[0], 16),
        parseInt(aRgbHex[1], 16),
        parseInt(aRgbHex[2], 16),
      ];
      return aRgb;
    },
    rgbToHex: (r, g, b) => {
      if (r > 255 || g > 255 || b > 255) throw "Invalid color component";
      return ((r << 16) | (g << 8) | b).toString(16);
    },
    stopDrawing: (e) => {},
    draw: (e) => {
      console.log("start");
      var outlineData = drawHorse.ctx.getImageData(
        0,
        0,
        drawHorse.ctx.canvas.width,
        drawHorse.ctx.canvas.height
      );
      drawHorse.ctx.clearRect(
        0,
        0,
        drawHorse.ctx.canvas.width,
        drawHorse.ctx.canvas.height
      );
      var imageData = drawHorse.ctx.getImageData(
        0,
        0,
        drawHorse.ctx.canvas.width,
        drawHorse.ctx.canvas.height
      );
      drawHorse.setPosition(e);
      let startColor = [
        outlineData.data[0],
        outlineData.data[1],
        outlineData.data[2],
      ];
      let startColorHex =
        "#" +
        (
          "000000" +
          tools.bucket.rgbToHex(
            outlineData.data[0],
            outlineData.data[1],
            outlineData.data[2]
          )
        ).slice(-6);
      //console.log(JSON.stringify(startColor));
      let pixelStack = [[drawHorse.pos.x, drawHorse.pos.y]];
      while (pixelStack.length) {
        let newPos = pixelStack.pop();
        let x = newPos[0];
        let y = newPos[1];
        let pixelPos = (y * drawHorse.ctx.canvas.width + x) * 4;
        //console.log(JSON.stringify(pixelPos) + " " + JSON.stringify(imageData) + " " + JSON.stringify(startColor));
        while (
          y-- >= 0 &&
          tools.bucket.matchStartColor(pixelPos, outlineData, startColor)
        ) {
          pixelPos -= drawHorse.ctx.canvas.width * 4;
        }
        pixelPos += drawHorse.ctx.canvas.width * 4;
        ++y;
        let reachLeft = false;
        let reachRight = false;
        // console.log("doin more")
        while (
          y++ < drawHorse.ctx.canvas.height - 1 &&
          tools.bucket.matchStartColor(pixelPos, outlineData, startColor)
        ) {
          tools.bucket.colorPixel(pixelPos, imageData, drawHorse.selectedColor);

          if (x > 0) {
            if (
              tools.bucket.matchStartColor(
                pixelPos - 4,
                outlineData,
                startColor
              )
            ) {
              if (!reachLeft) {
                pixelStack.push([x - 1, y]);
                reachLeft = true;
              }
            } else if (reachLeft) {
              reachLeft = false;
            }
          }

          if (x < drawHorse.ctx.canvas.width - 1) {
            if (
              tools.bucket.matchStartColor(pixelPos + 4, imageData, startColor)
            ) {
              if (!reachRight) {
                pixelStack.push([x + 1, y]);
                reachRight = true;
              }
            } else if (reachRight) {
              reachRight = false;
            }
          }

          pixelPos += drawHorse.ctx.canvas.width * 4;
        }
      }
      drawHorse.ctx.putImageData(imageData);
      drawHorse.ctx.putImageData(outlineData);
      console.log("finis");
    },
  },
};

let drawHorse = {
  selectedColor: "black",
  header: document.getElementById("header"),
  stretcher: document.getElementById("stretcher"),
  colors: document.getElementById("colors"),
  canvas: document.getElementById("drawHere"),
  currentTool: tools.pencil,
  selectedColor: "black",
  selectedStamp: undefined,
  stamps: {
    horse: {
      id: "horse",
      name: "Horse",
      url: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMjIyLjAzNXB4IiBoZWlnaHQ9IjIyMi4wMzVweCIgdmlld0JveD0iMCAwIDIyMi4wMzUgMjIyLjAzNSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjIyLjAzNSAyMjIuMDM1OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggJSUlJSBkPSJNMjIxLjUyNCwxMjAuNDQ1bC04LjcxMy05LjA4NWMtMC4zMzEtMC4zNTItMC43ODYtMC41NTMtMS4yNzEtMC41NTlsLTI5LjE4OC0wLjYwM2wwLjA4My0zNy45ODMgICBjOC4wNjIsMi4yOTMsMTYuMzg1LTAuMzEzLDE4Ljg3OS0xLjI0MWM1LjkzNSwyLjM3MywxMC40NzksMi40MTIsMTMuNTEyLDAuMTA5YzQuMzc0LTMuMzA0LDMuNjA1LTkuOTkyLDMuNTctMTAuMjc2ICAgYy0wLjA3Ny0wLjU4OC0wLjQyNi0xLjEwMy0wLjk0NS0xLjM4Yy01LjQ3OS0yLjk0Ni0zMi42MzQtMTcuMDg4LTM3Ljk3Ny0xOS44NzJsLTAuODA1LTE0LjQ1OCAgIGMtMC4wNDctMC44MzYtMC42NjEtMS41MzQtMS40ODMtMS42ODVjLTAuODUxLTAuMTUtMS42NDMsMC4yODctMS45ODYsMS4wNDlsLTMuNzI0LDguMzgybC0xLjEzNS05LjM4NiAgIGMtMC4xMDEtMC44MDctMC43MTUtMS40NDgtMS41MTMtMS41ODJjLTAuNzk4LTAuMTA5LTEuNTksMC4yOS0xLjkzMywxLjAxN2wtNy4zMjQsMTUuNTYzYy01LjA0MiwzLjA5Ny03Ljg0MywxMC42MzMtOS43MTcsMTUuNjc1ICAgbC0wLjcwOSwxLjg3NmMtOC43NzgsMjIuNDg0LTkuMjE2LDIyLjU4OC0xNi41MjcsMjQuMzI2Yy0xOS45NTQsNC43MzEtMzIuOTQzLDEuNzkxLTQ2LjY5NC0xLjMxbC0yLjI2NC0wLjUwOCAgIGMtOS4yMTgtMi4wNjktMjQuNTU2LDAuMDc0LTM0LjgxNCw4LjExM2MtMi4xOSwxLjcxMS00LjAzNywzLjY1NS01LjU5Nyw1Ljc1NGMtMC4xMDksMC0wLjE4OS0wLjA4My0wLjI5OS0wLjA1OSAgIGMtMC4yMywwLjA0Mi0yMi44MTIsNC43OTktMjEuNTg5LDI0LjM3NGMxLjQ2LDIzLjUwNy0zLjAzOCwzMi4xNzgtNy4wNjksMzUuMzI4Yy0yLjk4NSwyLjMyOS02Ljg4OSwyLjY2Ni0xMS45MjUsMS4wNjQgICBjLTAuNjQ3LTAuMjEzLTEuMzU5LTAuMDI0LTEuODM4LDAuNDQ5Yy0wLjQ4NSwwLjQ4NC0wLjY0NywxLjE5My0wLjQ0MywxLjg0NGMwLjA1NiwwLjE1Myw0LjY3OCwxMy44MzEsMTkuOTYzLDEzLjgzMSAgIGMxLjg5NSwwLDMuOTU4LTAuMjEzLDYuMTkyLTAuNjg2YzEzLjM1OC0yLjgxMywxNi41NzctMTUuMjMyLDEyLjUyOC00OS4wOTVjMC40NDksMS42MTMsMS4wMjIsMy40NTEsMS43OTcsNS45MjIgICBjMC43ODMsMi40OTUsMS43NjcsNS42MTUsMi45ODUsOS42ODhsLTIuNjgxLDI0LjE0NmMtMC4wMzYsMC4zMjUsMC4wMTIsMC42MzksMC4xMzksMC45MzRsMTYuOTg0LDM4Ljc4ICAgYzAuMjg0LDAuNjM5LDAuOTE5LDEuMDgyLDEuNjM0LDEuMDk0bDkuODA5LDAuMTc4YzAuMDA2LDAsMC4wMTgsMCwwLjAzMiwwYzAuNTgsMCwxLjEyNi0wLjI3MiwxLjQ2OS0wLjc0NSAgIGMwLjM1Mi0wLjQ4NCwwLjQ0My0xLjEwNSwwLjI0OS0xLjY1NWwtMTEuMTkyLTMyLjUzMmMzLjUxMS0yLjY3OCwxNC4yLTExLjc2OSwxOS41NzYtMjUuODk2bC0xLjAxNywyMC43ODIgICBjLTAuMDEyLDAuMjYsMC4wMywwLjUyMSwwLjEyNywwLjc2OWwxNC44OTYsMzcuMDYxYzAuMjcxLDAuNjg2LDAuOTQyLDEuMTM1LDEuNjgyLDEuMTM1aDkuMDc5YzAuNTgzLDAsMS4xMzItMC4yODQsMS40NzItMC43NTcgICBjMC4zMzctMC40NjEsMC40MzQtMS4wNzUsMC4yNTQtMS42MzFsLTExLjAzNS0zMy40NTVsMTAuODQ2LTIyLjQxNGMwLjAzOS0wLjA3LTAuMDEyLTAuMTQyLDAuMDEyLTAuMjE5ICAgYzEwLjYzLDEuMSwyNS41MjMsMC4yMzYsNDYuNTE4LTQuNTU3bDE1LjE4NSwyNC4wMDRsMi41MTIsMzguMDUzYzAuMDY1LDAuOTQsMC44NTcsMS42ODUsMS44MTQsMS42ODVoNy45OTEgICBjMS4wMDUsMCwxLjgyMS0wLjgwNCwxLjgyMS0xLjgwOXYtNjAuOTg3YzguNDIzLTEuNTI0LDE1Ljg5NC00LjU5OSwyMC4xMDMtNi42MmwtNi42MDgsMjcuNTY4ICAgYy0wLjEzLDAuNTIxLTAuMDE4LDEuMDY5LDAuMjg5LDEuNDg5bDQuNzIzLDYuNTM3YzAuMzQzLDAuNDg0LDAuODgxLDAuNzU3LDEuNDY2LDAuNzU3YzAuMDcxLDAsMC4xMzEsMCwwLjIwMS0wLjAxMiAgIGMwLjY0NS0wLjA3MSwxLjIwNi0wLjQ4NSwxLjQ2Ni0xLjA4OGwxOC41My00My4yMzdDMjIyLjE3NSwxMjEuNzM5LDIyMi4wMjYsMTIwLjk3MiwyMjEuNTI0LDEyMC40NDV6IE0yNS40NzksMTY0Ljk2NSAgIGMtMTEuOTU1LDIuNTMtMTcuODM4LTMuNDg3LTIwLjM2My03LjQ5NWM0LjQ4NiwwLjY3NCw4LjI5OS0wLjE3NywxMS4zOTQtMi41ODhjNi44NjItNS4zNTUsOS43MTQtMTguMjc2LDguNDYxLTM4LjQyICAgYy0wLjc3NC0xMi41MDUsMTAuMDA0LTE3LjgwNywxNS41MzctMTkuNjk1Yy0xLjEwMywyLjI1Mi0xLjg3MSw0LjY2Ny0yLjM1NSw3LjE5NmMtNS42NzcsNS4wMDctMy4xODMsMTQuNTQ0LTMuMTE1LDE0LjcwMyAgIEMzOS45MzcsMTU4LjU3NSwzMy42MDEsMTYzLjI1MSwyNS40NzksMTY0Ljk2NXogTTkxLjQzNSwxNjIuMzIzYy0wLjIwNywwLjQyLTAuMjM3LDAuOTA0LTAuMDkyLDEuMzU5bDEwLjQ3MSwzMS43NzZIOTYuNDcgICBsLTE0LjI5Mi0zNS41NDhsMS4zOC0yOC4wNTNjMC44MTMsMC44NCwxLjcyNiwxLjY4LDIuODgxLDIuNTAxYzMuMzE2LDIuMzcsOC4zMjMsNC41ODEsMTUuNzM4LDUuNzc0TDkxLjQzNSwxNjIuMzIzeiAgICBNMTc4LjA4LDE5Ni4xNjhoLTQuNDhsLTIuNDI5LTM2LjgxOGMtMC4wMTktMC4zMDItMC4xMTgtMC41OTEtMC4yNzgtMC44NDVsLTE1LjgxNy0yNC45MjZjMS42NDQsMC45NjksMy4zNCwxLjg1NSw1LjE5LDIuNDk0ICAgYzUuNzU3LDIuMDEsMTEuOTM5LDIuMjI5LDE3LjgxNCwxLjU0M1YxOTYuMTY4eiBNMjAxLjI4NiwxNjEuMjY1bC0yLjM1OC0zLjI1N2w3LjMzNS0zMC42MjNjMC4xNzItMC43MS0wLjA5NS0xLjQ0Mi0wLjY3NC0xLjg4ICAgcy0xLjM2NS0wLjQ3OS0xLjk5Mi0wLjEyNGMtMC4yNDIsMC4xMy0yNC4wNzQsMTMuNTcxLTQyLjE1NSw3LjI1OWMtNy41MTktMi42MTktMTMuMDkyLTguMzY0LTE2LjU1Ni0xNy4wNyAgIGMtMC4zNzMtMC45MjMtMS40MzEtMS4zNzgtMi4zNjQtMS4wMTdjLTAuOTI5LDAuMzc4LTEuMzksMS40My0xLjAxMSwyLjM3MWMyLjY5NSw2Ljc2Miw2LjY1NSwxMS44MzksMTEuNjM4LDE1LjM2NyAgIGMtMC4xODQtMC4wMTItMC4zNzItMC4wNjQtMC41NS0wLjAwNmMtMzguOTEsOS4wMi01Ni4yMTQsNC41NzUtNjMuODY1LTAuNzU2Yy01LjI3LTMuNjcxLTUuODM0LTcuNjk2LTUuODUyLTcuODM4ICAgYy0wLjAxMi0wLjEzNy0wLjE0NS0wLjIxOS0wLjE5NS0wLjM1NWMwLjEwNC01LjA3LTAuNTc5LTEwLjUzMi0yLjQyLTE2LjM1N2MtMC4zMDItMC45NTgtMS4zMy0xLjQ4My0yLjI3Ni0xLjE4NSAgIGMtMC45NTUsMC4zMDEtMS40ODksMS4zMjQtMS4xODUsMi4yNzZjMTAuNzEzLDMzLjg1MS0xOC43MjgsNTQuMTMtMTkuOTg3LDU0Ljk4N2MtMC42NzcsMC40NTUtMC45NjYsMS4zMTgtMC43LDIuMTA0ICAgbDEwLjc3OCwzMS4zMjdsLTYuMDUyLTAuMTEybC0xNi4zMjMtMzcuMjc5bDIuNjY5LTI0LjAzM2MwLjAyMy0wLjI0MiwwLTAuNDkxLTAuMDY4LTAuNzIyYy0xLjI3MS00LjI2Mi0yLjI4Ny03LjUwNi0zLjEwMy0xMC4wODkgICBjLTIuNDk0LTcuOTMzLTIuOTQzLTkuMzU3LTIuODIyLTE0Ljk2OWMwLjE3Ny04LjE1MSwzLjQ5OS0xNC44MTUsOS44OC0xOS44MWM5LjM4LTcuMzQ3LDIzLjM2OC05LjMyMSwzMS43ODItNy40MjdsMi4yNTIsMC41MDIgICBjMTQuMTgsMy4yMDksMjcuNTgsNi4yMzYsNDguMzMzLDEuMzAzYzkuMzgtMi4yMjMsMTAuMjY3LTMuOTksMTkuMDY3LTI2LjUzNmwwLjczMy0xLjkyNGMxLjc1Ni00LjcwOCw0LjQwMy0xMS44MzQsOC41Ny0xNC4wNTYgICBjMC4zNDktMC4xOCwwLjYyNy0wLjQ3NiwwLjc4Ni0wLjgyOGw0Ljg3Ny0xMC4zNTVsMS4xNTgsOS42NTJjMC4xMDEsMC44MTIsMC43MjcsMS40NiwxLjUzMSwxLjU4MSAgIGMwLjgxLDAuMTA5LDEuNjAyLTAuMzE2LDEuOTIxLTEuMDYxbDMuMzUyLTcuNTI3bDAuNDQ5LDcuOTgyYzAuMDM1LDAuNjQxLDAuNDAxLDEuMjE4LDAuOTY5LDEuNTEzICAgYzAsMCwzMC4wOTIsMTUuNjY0LDM3Ljk1MywxOS44NDZjMC4wMTIsMS41MTMtMC4yMjUsNC41NDUtMi4xODcsNi4wNDFjLTIuMDE2LDEuNTMxLTUuNjgxLDEuMjQxLTEwLjYwNC0wLjgzOSAgIGMtMC40NDktMC4xODktMC45NjMtMC4xODktMS40MDYsMGMtMC4xNDcsMC4wNjUtMTUuMTY3LDYuMjQ1LTI0LjE5My0yLjYwOWMtMC43MTUtMC42OTgtMS44NjctMC42ODgtMi41NzEsMC4wMjMgICBjLTAuNjk3LDAuNzE1LTAuNjg2LDEuODY1LDAuMDMsMi41NjhjMS41NTUsMS41MzEsMy4yNTcsMi41ODMsNC45OTQsMy40NTVjLTAuMDA2LDAuMDY0LTAuMDcsMC4xMDktMC4wNywwLjE4bC0wLjEwMSw0MS4wMDkgICBjMCwwLjk5LDAuNzg2LDEuNzk0LDEuNzczLDEuODEybDMwLjIyMSwwLjYyNmw3LjM2NSw3LjY3OUwyMDEuMjg2LDE2MS4yNjV6IE0xODEuOTY0LDUzLjU0NGMwLTEuNTY2LDEuMjcxLTIuODM3LDIuODM3LTIuODM3ICAgYzEuNTcyLDAsMi44NDMsMS4yNzEsMi44NDMsMi44MzdjMCwxLjU2OS0xLjI3MSwyLjg0LTIuODQzLDIuODRDMTgzLjIzNCw1Ni4zODQsMTgxLjk2NCw1NS4xMTksMTgxLjk2NCw1My41NDR6Ii8+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+"
      //url: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iMjIyLjAzNXB4IiBoZWlnaHQ9IjIyMi4wMzVweCIgdmlld0JveD0iMCAwIDIyMi4wMzUgMjIyLjAzNSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjIyLjAzNSAyMjIuMDM1OyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxnPgoJPHBhdGggZD0iTTIyMS41MjQsMTIwLjQ0NWwtOC43MTMtOS4wODVjLTAuMzMxLTAuMzUyLTAuNzg2LTAuNTUzLTEuMjcxLTAuNTU5bC0yOS4xODgtMC42MDNsMC4wODMtMzcuOTgzICAgYzguMDYyLDIuMjkzLDE2LjM4NS0wLjMxMywxOC44NzktMS4yNDFjNS45MzUsMi4zNzMsMTAuNDc5LDIuNDEyLDEzLjUxMiwwLjEwOWM0LjM3NC0zLjMwNCwzLjYwNS05Ljk5MiwzLjU3LTEwLjI3NiAgIGMtMC4wNzctMC41ODgtMC40MjYtMS4xMDMtMC45NDUtMS4zOGMtNS40NzktMi45NDYtMzIuNjM0LTE3LjA4OC0zNy45NzctMTkuODcybC0wLjgwNS0xNC40NTggICBjLTAuMDQ3LTAuODM2LTAuNjYxLTEuNTM0LTEuNDgzLTEuNjg1Yy0wLjg1MS0wLjE1LTEuNjQzLDAuMjg3LTEuOTg2LDEuMDQ5bC0zLjcyNCw4LjM4MmwtMS4xMzUtOS4zODYgICBjLTAuMTAxLTAuODA3LTAuNzE1LTEuNDQ4LTEuNTEzLTEuNTgyYy0wLjc5OC0wLjEwOS0xLjU5LDAuMjktMS45MzMsMS4wMTdsLTcuMzI0LDE1LjU2M2MtNS4wNDIsMy4wOTctNy44NDMsMTAuNjMzLTkuNzE3LDE1LjY3NSAgIGwtMC43MDksMS44NzZjLTguNzc4LDIyLjQ4NC05LjIxNiwyMi41ODgtMTYuNTI3LDI0LjMyNmMtMTkuOTU0LDQuNzMxLTMyLjk0MywxLjc5MS00Ni42OTQtMS4zMWwtMi4yNjQtMC41MDggICBjLTkuMjE4LTIuMDY5LTI0LjU1NiwwLjA3NC0zNC44MTQsOC4xMTNjLTIuMTksMS43MTEtNC4wMzcsMy42NTUtNS41OTcsNS43NTRjLTAuMTA5LDAtMC4xODktMC4wODMtMC4yOTktMC4wNTkgICBjLTAuMjMsMC4wNDItMjIuODEyLDQuNzk5LTIxLjU4OSwyNC4zNzRjMS40NiwyMy41MDctMy4wMzgsMzIuMTc4LTcuMDY5LDM1LjMyOGMtMi45ODUsMi4zMjktNi44ODksMi42NjYtMTEuOTI1LDEuMDY0ICAgYy0wLjY0Ny0wLjIxMy0xLjM1OS0wLjAyNC0xLjgzOCwwLjQ0OWMtMC40ODUsMC40ODQtMC42NDcsMS4xOTMtMC40NDMsMS44NDRjMC4wNTYsMC4xNTMsNC42NzgsMTMuODMxLDE5Ljk2MywxMy44MzEgICBjMS44OTUsMCwzLjk1OC0wLjIxMyw2LjE5Mi0wLjY4NmMxMy4zNTgtMi44MTMsMTYuNTc3LTE1LjIzMiwxMi41MjgtNDkuMDk1YzAuNDQ5LDEuNjEzLDEuMDIyLDMuNDUxLDEuNzk3LDUuOTIyICAgYzAuNzgzLDIuNDk1LDEuNzY3LDUuNjE1LDIuOTg1LDkuNjg4bC0yLjY4MSwyNC4xNDZjLTAuMDM2LDAuMzI1LDAuMDEyLDAuNjM5LDAuMTM5LDAuOTM0bDE2Ljk4NCwzOC43OCAgIGMwLjI4NCwwLjYzOSwwLjkxOSwxLjA4MiwxLjYzNCwxLjA5NGw5LjgwOSwwLjE3OGMwLjAwNiwwLDAuMDE4LDAsMC4wMzIsMGMwLjU4LDAsMS4xMjYtMC4yNzIsMS40NjktMC43NDUgICBjMC4zNTItMC40ODQsMC40NDMtMS4xMDUsMC4yNDktMS42NTVsLTExLjE5Mi0zMi41MzJjMy41MTEtMi42NzgsMTQuMi0xMS43NjksMTkuNTc2LTI1Ljg5NmwtMS4wMTcsMjAuNzgyICAgYy0wLjAxMiwwLjI2LDAuMDMsMC41MjEsMC4xMjcsMC43NjlsMTQuODk2LDM3LjA2MWMwLjI3MSwwLjY4NiwwLjk0MiwxLjEzNSwxLjY4MiwxLjEzNWg5LjA3OWMwLjU4MywwLDEuMTMyLTAuMjg0LDEuNDcyLTAuNzU3ICAgYzAuMzM3LTAuNDYxLDAuNDM0LTEuMDc1LDAuMjU0LTEuNjMxbC0xMS4wMzUtMzMuNDU1bDEwLjg0Ni0yMi40MTRjMC4wMzktMC4wNy0wLjAxMi0wLjE0MiwwLjAxMi0wLjIxOSAgIGMxMC42MywxLjEsMjUuNTIzLDAuMjM2LDQ2LjUxOC00LjU1N2wxNS4xODUsMjQuMDA0bDIuNTEyLDM4LjA1M2MwLjA2NSwwLjk0LDAuODU3LDEuNjg1LDEuODE0LDEuNjg1aDcuOTkxICAgYzEuMDA1LDAsMS44MjEtMC44MDQsMS44MjEtMS44MDl2LTYwLjk4N2M4LjQyMy0xLjUyNCwxNS44OTQtNC41OTksMjAuMTAzLTYuNjJsLTYuNjA4LDI3LjU2OCAgIGMtMC4xMywwLjUyMS0wLjAxOCwxLjA2OSwwLjI4OSwxLjQ4OWw0LjcyMyw2LjUzN2MwLjM0MywwLjQ4NCwwLjg4MSwwLjc1NywxLjQ2NiwwLjc1N2MwLjA3MSwwLDAuMTMxLDAsMC4yMDEtMC4wMTIgICBjMC42NDUtMC4wNzEsMS4yMDYtMC40ODUsMS40NjYtMS4wODhsMTguNTMtNDMuMjM3QzIyMi4xNzUsMTIxLjczOSwyMjIuMDI2LDEyMC45NzIsMjIxLjUyNCwxMjAuNDQ1eiBNMjUuNDc5LDE2NC45NjUgICBjLTExLjk1NSwyLjUzLTE3LjgzOC0zLjQ4Ny0yMC4zNjMtNy40OTVjNC40ODYsMC42NzQsOC4yOTktMC4xNzcsMTEuMzk0LTIuNTg4YzYuODYyLTUuMzU1LDkuNzE0LTE4LjI3Niw4LjQ2MS0zOC40MiAgIGMtMC43NzQtMTIuNTA1LDEwLjAwNC0xNy44MDcsMTUuNTM3LTE5LjY5NWMtMS4xMDMsMi4yNTItMS44NzEsNC42NjctMi4zNTUsNy4xOTZjLTUuNjc3LDUuMDA3LTMuMTgzLDE0LjU0NC0zLjExNSwxNC43MDMgICBDMzkuOTM3LDE1OC41NzUsMzMuNjAxLDE2My4yNTEsMjUuNDc5LDE2NC45NjV6IE05MS40MzUsMTYyLjMyM2MtMC4yMDcsMC40Mi0wLjIzNywwLjkwNC0wLjA5MiwxLjM1OWwxMC40NzEsMzEuNzc2SDk2LjQ3ICAgbC0xNC4yOTItMzUuNTQ4bDEuMzgtMjguMDUzYzAuODEzLDAuODQsMS43MjYsMS42OCwyLjg4MSwyLjUwMWMzLjMxNiwyLjM3LDguMzIzLDQuNTgxLDE1LjczOCw1Ljc3NEw5MS40MzUsMTYyLjMyM3ogICAgTTE3OC4wOCwxOTYuMTY4aC00LjQ4bC0yLjQyOS0zNi44MThjLTAuMDE5LTAuMzAyLTAuMTE4LTAuNTkxLTAuMjc4LTAuODQ1bC0xNS44MTctMjQuOTI2YzEuNjQ0LDAuOTY5LDMuMzQsMS44NTUsNS4xOSwyLjQ5NCAgIGM1Ljc1NywyLjAxLDExLjkzOSwyLjIyOSwxNy44MTQsMS41NDNWMTk2LjE2OHogTTIwMS4yODYsMTYxLjI2NWwtMi4zNTgtMy4yNTdsNy4zMzUtMzAuNjIzYzAuMTcyLTAuNzEtMC4wOTUtMS40NDItMC42NzQtMS44OCAgIHMtMS4zNjUtMC40NzktMS45OTItMC4xMjRjLTAuMjQyLDAuMTMtMjQuMDc0LDEzLjU3MS00Mi4xNTUsNy4yNTljLTcuNTE5LTIuNjE5LTEzLjA5Mi04LjM2NC0xNi41NTYtMTcuMDcgICBjLTAuMzczLTAuOTIzLTEuNDMxLTEuMzc4LTIuMzY0LTEuMDE3Yy0wLjkyOSwwLjM3OC0xLjM5LDEuNDMtMS4wMTEsMi4zNzFjMi42OTUsNi43NjIsNi42NTUsMTEuODM5LDExLjYzOCwxNS4zNjcgICBjLTAuMTg0LTAuMDEyLTAuMzcyLTAuMDY0LTAuNTUtMC4wMDZjLTM4LjkxLDkuMDItNTYuMjE0LDQuNTc1LTYzLjg2NS0wLjc1NmMtNS4yNy0zLjY3MS01LjgzNC03LjY5Ni01Ljg1Mi03LjgzOCAgIGMtMC4wMTItMC4xMzctMC4xNDUtMC4yMTktMC4xOTUtMC4zNTVjMC4xMDQtNS4wNy0wLjU3OS0xMC41MzItMi40Mi0xNi4zNTdjLTAuMzAyLTAuOTU4LTEuMzMtMS40ODMtMi4yNzYtMS4xODUgICBjLTAuOTU1LDAuMzAxLTEuNDg5LDEuMzI0LTEuMTg1LDIuMjc2YzEwLjcxMywzMy44NTEtMTguNzI4LDU0LjEzLTE5Ljk4Nyw1NC45ODdjLTAuNjc3LDAuNDU1LTAuOTY2LDEuMzE4LTAuNywyLjEwNCAgIGwxMC43NzgsMzEuMzI3bC02LjA1Mi0wLjExMmwtMTYuMzIzLTM3LjI3OWwyLjY2OS0yNC4wMzNjMC4wMjMtMC4yNDIsMC0wLjQ5MS0wLjA2OC0wLjcyMmMtMS4yNzEtNC4yNjItMi4yODctNy41MDYtMy4xMDMtMTAuMDg5ICAgYy0yLjQ5NC03LjkzMy0yLjk0My05LjM1Ny0yLjgyMi0xNC45NjljMC4xNzctOC4xNTEsMy40OTktMTQuODE1LDkuODgtMTkuODFjOS4zOC03LjM0NywyMy4zNjgtOS4zMjEsMzEuNzgyLTcuNDI3bDIuMjUyLDAuNTAyICAgYzE0LjE4LDMuMjA5LDI3LjU4LDYuMjM2LDQ4LjMzMywxLjMwM2M5LjM4LTIuMjIzLDEwLjI2Ny0zLjk5LDE5LjA2Ny0yNi41MzZsMC43MzMtMS45MjRjMS43NTYtNC43MDgsNC40MDMtMTEuODM0LDguNTctMTQuMDU2ICAgYzAuMzQ5LTAuMTgsMC42MjctMC40NzYsMC43ODYtMC44MjhsNC44NzctMTAuMzU1bDEuMTU4LDkuNjUyYzAuMTAxLDAuODEyLDAuNzI3LDEuNDYsMS41MzEsMS41ODEgICBjMC44MSwwLjEwOSwxLjYwMi0wLjMxNiwxLjkyMS0xLjA2MWwzLjM1Mi03LjUyN2wwLjQ0OSw3Ljk4MmMwLjAzNSwwLjY0MSwwLjQwMSwxLjIxOCwwLjk2OSwxLjUxMyAgIGMwLDAsMzAuMDkyLDE1LjY2NCwzNy45NTMsMTkuODQ2YzAuMDEyLDEuNTEzLTAuMjI1LDQuNTQ1LTIuMTg3LDYuMDQxYy0yLjAxNiwxLjUzMS01LjY4MSwxLjI0MS0xMC42MDQtMC44MzkgICBjLTAuNDQ5LTAuMTg5LTAuOTYzLTAuMTg5LTEuNDA2LDBjLTAuMTQ3LDAuMDY1LTE1LjE2Nyw2LjI0NS0yNC4xOTMtMi42MDljLTAuNzE1LTAuNjk4LTEuODY3LTAuNjg4LTIuNTcxLDAuMDIzICAgYy0wLjY5NywwLjcxNS0wLjY4NiwxLjg2NSwwLjAzLDIuNTY4YzEuNTU1LDEuNTMxLDMuMjU3LDIuNTgzLDQuOTk0LDMuNDU1Yy0wLjAwNiwwLjA2NC0wLjA3LDAuMTA5LTAuMDcsMC4xOGwtMC4xMDEsNDEuMDA5ICAgYzAsMC45OSwwLjc4NiwxLjc5NCwxLjc3MywxLjgxMmwzMC4yMjEsMC42MjZsNy4zNjUsNy42NzlMMjAxLjI4NiwxNjEuMjY1eiBNMTgxLjk2NCw1My41NDRjMC0xLjU2NiwxLjI3MS0yLjgzNywyLjgzNy0yLjgzNyAgIGMxLjU3MiwwLDIuODQzLDEuMjcxLDIuODQzLDIuODM3YzAsMS41NjktMS4yNzEsMi44NC0yLjg0MywyLjg0QzE4My4yMzQsNTYuMzg0LDE4MS45NjQsNTUuMTE5LDE4MS45NjQsNTMuNTQ0eiIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPg==",
    },
    beetle: {
      id: "beetle",
      name: "Beetle",
      url: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8cGF0aCAlJSUlIGQ9Ik00MzcuNTIzLDMzNy43NzljMCwxMi4yNjMsNC45ODYsMjMuMzg3LDEzLjAzNSwzMS40MzZjOC4wNDksOC4wNDksMTkuMTczLDEzLjAzNSwzMS40MjQsMTMuMDM1ICAgIGM2Ljc3NSwwLDEyLjI1MS01LjQ4OCwxMi4yNTEtMTIuMjUxYzAtNi43NzUtNS40NzYtMTIuMjUxLTEyLjI1MS0xMi4yNTFjLTExLjAwMSwwLTE5Ljk1Ny04Ljk1NS0xOS45NTctMTkuOTY5ICAgIGMwLTE5LjA1LTYuOTk1LTM2LjQ5Ni0xOC41MzYtNDkuOTExYy0xMS41NTMtMTMuNDI3LTI3LjY2My0yMi44MjQtNDUuODkyLTI1Ljc2NHYtNTIuMjE0ICAgIGMzNi40NzEtNS44OCw2NC40MjgtMzcuNTc0LDY0LjQyOC03NS42ODdjMC0xMS4wMTQsOC45NTYtMTkuOTY5LDE5Ljk1Ny0xOS45NjljNi43NzUsMCwxMi4yNTEtNS40NzYsMTIuMjUxLTEyLjI1MSAgICBjMC02Ljc2My01LjQ3Ni0xMi4yNTEtMTIuMjUxLTEyLjI1MWMtMjQuNTE0LDAtNDQuNDU5LDE5Ljk1Ny00NC40NTksNDQuNDcxYzAsMjguNzY1LTIzLjQxMiw1Mi4xNzctNTIuMTc3LDUyLjE3N2gtNS44NjggICAgYy0zLjYzOS0zNi44ODgtMjMuNDk3LTY5LjA4My01Mi4zMjQtODkuMzM0VjgzLjE3OWMwLTEyLjcxNy00Ljk0OS0yNC42ODYtMTMuOTU0LTMzLjY3OGwtMC4wODYtMC4wODYgICAgYzEzLjcyMS02LjQyLDI0LjU4OC0xOC4yNTQsMjkuNTYyLTMzLjMyM2MyLjExOS02LjQzMi0xLjM3Mi0xMy4zNTQtNy44MDQtMTUuNDczYy02LjQxOS0yLjExOS0xMy4zNTQsMS4zNzItMTUuNDczLDcuNzkyICAgIGMtMy44MjIsMTEuNjM4LTEzLjkwNSwxOS44NDctMjUuODAxLDIxLjQ3NmwtMy45MDgtMy45MDhjLTE4LjU3My0xOC41NzItNDguODA4LTE4LjU3Mi02Ny4zOCwwbC0zLjkwOCwzLjkwOCAgICBjLTExLjg5Ni0xLjYyOS0yMS45NzgtOS44MzgtMjUuODAxLTIxLjQ3NmMtMi4xMTktNi40MTktOS4wNTMtOS45MTEtMTUuNDczLTcuNzkyYy02LjQzMiwyLjExOS05LjkyMyw5LjA0MS03LjgwNCwxNS40NzMgICAgYzQuOTc0LDE1LjA4MSwxNS44NTMsMjYuOTAzLDI5LjU2MiwzMy4zMWwtMC4wODYsMC4wOThjLTkuMDA0LDguOTkyLTEzLjk1NCwyMC45NjEtMTMuOTU0LDMzLjY3OHYxMy44NjggICAgYy0yOC44MjcsMjAuMjUxLTQ4LjY4NSw1Mi40NDYtNTIuMzEyLDg5LjMzNGgtNS44OGMtMjguNzY1LDAtNTIuMTc3LTIzLjQxMi01Mi4xNzctNTIuMTc3YzAtMjQuNTE0LTE5Ljk0NS00NC40NzEtNDQuNDU5LTQ0LjQ3MSAgICBjLTYuNzc1LDAtMTIuMjUxLDUuNDg4LTEyLjI1MSwxMi4yNTFjMCw2Ljc3NSw1LjQ3NiwxMi4yNTEsMTIuMjUxLDEyLjI1MWMxMS4wMDEsMCwxOS45NTcsOC45NTUsMTkuOTU3LDE5Ljk2OSAgICBjMCwzOC4xMTMsMjcuOTU3LDY5LjgwNiw2NC40MjgsNzUuNjg3djQzLjcxMWMtMzYuNDcxLDUuODgtNjQuNDI4LDM3LjU3NC02NC40MjgsNzUuNjc0YzAsNS41MDEtMi4yNDIsMTAuNDk5LTUuODU2LDE0LjExMyAgICBjLTMuNjE0LDMuNjE0LTguNiw1Ljg1Ni0xNC4xMDEsNS44NTZjLTYuNzc1LDAtMTIuMjUxLDUuNDg4LTEyLjI1MSwxMi4yNTFzNS40NzYsMTIuMjUxLDEyLjI1MSwxMi4yNTEgICAgYzI0LjUxNCwwLDQ0LjQ1OS0xOS45NDUsNDQuNDU5LTQ0LjQ3MWMwLTEyLjI2Myw0LjI2My0yMy41NTksMTEuMzgxLTMyLjQ5YzcuMTMtOC45MTksMTcuMTAyLTE1LjQ2MSwyOC41NDUtMTguMjI5djg4LjA5NyAgICBjLTM2LjQ3MSw1Ljg4LTY0LjQyOCwzNy41NzQtNjQuNDI4LDc1LjY3NGMwLDUuNTAxLTIuMjQyLDEwLjQ5OS01Ljg1NiwxNC4xMTNjLTMuNjE0LDMuNjE0LTguNiw1Ljg1Ni0xNC4xMDEsNS44NTYgICAgYy02Ljc3NSwwLTEyLjI1MSw1LjQ4OC0xMi4yNTEsMTIuMjUxUzIzLjI0NCw0ODYuOCwzMC4wMTksNDg2LjhjMjQuNTE0LDAsNDQuNDU5LTE5Ljk0NSw0NC40NTktNDQuNDcxICAgIGMwLTEyLjI3NSw0LjI2My0yMy41ODMsMTEuMzkzLTMyLjUwMnMxNy4xMTUtMTUuNDYxLDI4LjU1Ny0xOC4yMTdDMTE1LjY1Myw0NTguMjA2LDE3MC4xOTQsNTEyLDIzNy4wNzIsNTEyaDM3Ljg1NSAgICBjNjYuODc4LDAsMTIxLjQxOS01My43ODIsMTIyLjY0NC0xMjAuMzljMjIuODg1LDUuNTEzLDM5Ljk1LDI2LjE2OCwzOS45NSw1MC43MTljMCwxMi4yNjMsNC45ODYsMjMuMzg3LDEzLjAzNSwzMS40MzYgICAgYzguMDQ5LDguMDQ5LDE5LjE3MywxMy4wMzUsMzEuNDI0LDEzLjAzNWM2Ljc3NSwwLDEyLjI1MS01LjQ4OCwxMi4yNTEtMTIuMjUxcy01LjQ3Ni0xMi4yNTEtMTIuMjUxLTEyLjI1MSAgICBjLTExLjAwMSwwLTE5Ljk1Ny04Ljk1NS0xOS45NTctMTkuOTY5YzAtMTkuMDUtNi45OTUtMzYuNDk2LTE4LjUzNi00OS45MWMtMTEuNTUzLTEzLjQyNy0yNy42NjMtMjIuODI0LTQ1Ljg5Mi0yNS43NjR2LTc5LjU4MiAgICBDNDIwLjQ2OSwyOTIuNTg1LDQzNy41MjMsMzEzLjIyOCw0MzcuNTIzLDMzNy43Nzl6IE0yMDkuMzQ4LDgzLjE3OWMwLTYuMTc0LDIuNDAxLTExLjk4MSw2Ljc3NS0xNi4zNTVsMjMuNTEtMjMuNTIyICAgIGM5LjAyOS05LjAxNywyMy43MDYtOS4wMTcsMzIuNzM1LDBsMjMuNTEsMjMuNTIyYzQuMzc0LDQuMzc0LDYuNzc1LDEwLjE4MSw2Ljc3NSwxNi4zNTV2MC40OSAgICBjLTE0LjQwNy01Ljg2OC0zMC4xNjItOS4xMTUtNDYuNjUyLTkuMTE1cy0zMi4yNDUsMy4yNDctNDYuNjUyLDkuMTE1VjgzLjE3OXogTTI1Niw5OS4wNTZjNTAuNzU2LDAsOTIuNzQsMzguMTg2LDk4Ljc5Miw4Ny4zMjUgICAgaC01MC42N2MtMTkuNjI2LDAtMzcuMDg0LDkuNDIxLTQ4LjEyMiwyMy45NjNjLTExLjAzOC0xNC41NDItMjguNDk2LTIzLjk2My00OC4xMjItMjMuOTYzaC01MC42ODIgICAgQzE2My4yMzYsMTM3LjI0MywyMDUuMjQ0LDk5LjA1NiwyNTYsOTkuMDU2eiBNMzczLjA5NSwzODkuMzMxYzAsNTQuMTM3LTQ0LjA0Miw5OC4xNjctOTguMTY3LDk4LjE2N2gtMzcuODU1ICAgIGMtNTQuMTI1LDAtOTguMTY3LTQ0LjAzLTk4LjE2Ny05OC4xNjdWMjEwLjg4M2g2OC45NzNjMTkuNzczLDAsMzUuODcxLDE2LjA4NiwzNS44NzEsMzUuODcxdjE4OC40ODEgICAgYzAsNi43NjMsNS40ODgsMTIuMjUxLDEyLjI1MSwxMi4yNTFjNi43NjMsMCwxMi4yNTEtNS40ODgsMTIuMjUxLTEyLjI1MVYyNDYuNzU0YzAtMTkuNzg1LDE2LjA5OC0zNS44NzEsMzUuODcxLTM1Ljg3MWg2OC45NzMgICAgVjM4OS4zMzF6Ii8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+"
      //url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDM3LjUyMywzMzcuNzc5YzAsMTIuMjYzLDQuOTg2LDIzLjM4NywxMy4wMzUsMzEuNDM2YzguMDQ5LDguMDQ5LDE5LjE3MywxMy4wMzUsMzEuNDI0LDEzLjAzNSAgICBjNi43NzUsMCwxMi4yNTEtNS40ODgsMTIuMjUxLTEyLjI1MWMwLTYuNzc1LTUuNDc2LTEyLjI1MS0xMi4yNTEtMTIuMjUxYy0xMS4wMDEsMC0xOS45NTctOC45NTUtMTkuOTU3LTE5Ljk2OSAgICBjMC0xOS4wNS02Ljk5NS0zNi40OTYtMTguNTM2LTQ5LjkxMWMtMTEuNTUzLTEzLjQyNy0yNy42NjMtMjIuODI0LTQ1Ljg5Mi0yNS43NjR2LTUyLjIxNCAgICBjMzYuNDcxLTUuODgsNjQuNDI4LTM3LjU3NCw2NC40MjgtNzUuNjg3YzAtMTEuMDE0LDguOTU2LTE5Ljk2OSwxOS45NTctMTkuOTY5YzYuNzc1LDAsMTIuMjUxLTUuNDc2LDEyLjI1MS0xMi4yNTEgICAgYzAtNi43NjMtNS40NzYtMTIuMjUxLTEyLjI1MS0xMi4yNTFjLTI0LjUxNCwwLTQ0LjQ1OSwxOS45NTctNDQuNDU5LDQ0LjQ3MWMwLDI4Ljc2NS0yMy40MTIsNTIuMTc3LTUyLjE3Nyw1Mi4xNzdoLTUuODY4ICAgIGMtMy42MzktMzYuODg4LTIzLjQ5Ny02OS4wODMtNTIuMzI0LTg5LjMzNFY4My4xNzljMC0xMi43MTctNC45NDktMjQuNjg2LTEzLjk1NC0zMy42NzhsLTAuMDg2LTAuMDg2ICAgIGMxMy43MjEtNi40MiwyNC41ODgtMTguMjU0LDI5LjU2Mi0zMy4zMjNjMi4xMTktNi40MzItMS4zNzItMTMuMzU0LTcuODA0LTE1LjQ3M2MtNi40MTktMi4xMTktMTMuMzU0LDEuMzcyLTE1LjQ3Myw3Ljc5MiAgICBjLTMuODIyLDExLjYzOC0xMy45MDUsMTkuODQ3LTI1LjgwMSwyMS40NzZsLTMuOTA4LTMuOTA4Yy0xOC41NzMtMTguNTcyLTQ4LjgwOC0xOC41NzItNjcuMzgsMGwtMy45MDgsMy45MDggICAgYy0xMS44OTYtMS42MjktMjEuOTc4LTkuODM4LTI1LjgwMS0yMS40NzZjLTIuMTE5LTYuNDE5LTkuMDUzLTkuOTExLTE1LjQ3My03Ljc5MmMtNi40MzIsMi4xMTktOS45MjMsOS4wNDEtNy44MDQsMTUuNDczICAgIGM0Ljk3NCwxNS4wODEsMTUuODUzLDI2LjkwMywyOS41NjIsMzMuMzFsLTAuMDg2LDAuMDk4Yy05LjAwNCw4Ljk5Mi0xMy45NTQsMjAuOTYxLTEzLjk1NCwzMy42Nzh2MTMuODY4ICAgIGMtMjguODI3LDIwLjI1MS00OC42ODUsNTIuNDQ2LTUyLjMxMiw4OS4zMzRoLTUuODhjLTI4Ljc2NSwwLTUyLjE3Ny0yMy40MTItNTIuMTc3LTUyLjE3N2MwLTI0LjUxNC0xOS45NDUtNDQuNDcxLTQ0LjQ1OS00NC40NzEgICAgYy02Ljc3NSwwLTEyLjI1MSw1LjQ4OC0xMi4yNTEsMTIuMjUxYzAsNi43NzUsNS40NzYsMTIuMjUxLDEyLjI1MSwxMi4yNTFjMTEuMDAxLDAsMTkuOTU3LDguOTU1LDE5Ljk1NywxOS45NjkgICAgYzAsMzguMTEzLDI3Ljk1Nyw2OS44MDYsNjQuNDI4LDc1LjY4N3Y0My43MTFjLTM2LjQ3MSw1Ljg4LTY0LjQyOCwzNy41NzQtNjQuNDI4LDc1LjY3NGMwLDUuNTAxLTIuMjQyLDEwLjQ5OS01Ljg1NiwxNC4xMTMgICAgYy0zLjYxNCwzLjYxNC04LjYsNS44NTYtMTQuMTAxLDUuODU2Yy02Ljc3NSwwLTEyLjI1MSw1LjQ4OC0xMi4yNTEsMTIuMjUxczUuNDc2LDEyLjI1MSwxMi4yNTEsMTIuMjUxICAgIGMyNC41MTQsMCw0NC40NTktMTkuOTQ1LDQ0LjQ1OS00NC40NzFjMC0xMi4yNjMsNC4yNjMtMjMuNTU5LDExLjM4MS0zMi40OWM3LjEzLTguOTE5LDE3LjEwMi0xNS40NjEsMjguNTQ1LTE4LjIyOXY4OC4wOTcgICAgYy0zNi40NzEsNS44OC02NC40MjgsMzcuNTc0LTY0LjQyOCw3NS42NzRjMCw1LjUwMS0yLjI0MiwxMC40OTktNS44NTYsMTQuMTEzYy0zLjYxNCwzLjYxNC04LjYsNS44NTYtMTQuMTAxLDUuODU2ICAgIGMtNi43NzUsMC0xMi4yNTEsNS40ODgtMTIuMjUxLDEyLjI1MVMyMy4yNDQsNDg2LjgsMzAuMDE5LDQ4Ni44YzI0LjUxNCwwLDQ0LjQ1OS0xOS45NDUsNDQuNDU5LTQ0LjQ3MSAgICBjMC0xMi4yNzUsNC4yNjMtMjMuNTgzLDExLjM5My0zMi41MDJzMTcuMTE1LTE1LjQ2MSwyOC41NTctMTguMjE3QzExNS42NTMsNDU4LjIwNiwxNzAuMTk0LDUxMiwyMzcuMDcyLDUxMmgzNy44NTUgICAgYzY2Ljg3OCwwLDEyMS40MTktNTMuNzgyLDEyMi42NDQtMTIwLjM5YzIyLjg4NSw1LjUxMywzOS45NSwyNi4xNjgsMzkuOTUsNTAuNzE5YzAsMTIuMjYzLDQuOTg2LDIzLjM4NywxMy4wMzUsMzEuNDM2ICAgIGM4LjA0OSw4LjA0OSwxOS4xNzMsMTMuMDM1LDMxLjQyNCwxMy4wMzVjNi43NzUsMCwxMi4yNTEtNS40ODgsMTIuMjUxLTEyLjI1MXMtNS40NzYtMTIuMjUxLTEyLjI1MS0xMi4yNTEgICAgYy0xMS4wMDEsMC0xOS45NTctOC45NTUtMTkuOTU3LTE5Ljk2OWMwLTE5LjA1LTYuOTk1LTM2LjQ5Ni0xOC41MzYtNDkuOTFjLTExLjU1My0xMy40MjctMjcuNjYzLTIyLjgyNC00NS44OTItMjUuNzY0di03OS41ODIgICAgQzQyMC40NjksMjkyLjU4NSw0MzcuNTIzLDMxMy4yMjgsNDM3LjUyMywzMzcuNzc5eiBNMjA5LjM0OCw4My4xNzljMC02LjE3NCwyLjQwMS0xMS45ODEsNi43NzUtMTYuMzU1bDIzLjUxLTIzLjUyMiAgICBjOS4wMjktOS4wMTcsMjMuNzA2LTkuMDE3LDMyLjczNSwwbDIzLjUxLDIzLjUyMmM0LjM3NCw0LjM3NCw2Ljc3NSwxMC4xODEsNi43NzUsMTYuMzU1djAuNDkgICAgYy0xNC40MDctNS44NjgtMzAuMTYyLTkuMTE1LTQ2LjY1Mi05LjExNXMtMzIuMjQ1LDMuMjQ3LTQ2LjY1Miw5LjExNVY4My4xNzl6IE0yNTYsOTkuMDU2YzUwLjc1NiwwLDkyLjc0LDM4LjE4Niw5OC43OTIsODcuMzI1ICAgIGgtNTAuNjdjLTE5LjYyNiwwLTM3LjA4NCw5LjQyMS00OC4xMjIsMjMuOTYzYy0xMS4wMzgtMTQuNTQyLTI4LjQ5Ni0yMy45NjMtNDguMTIyLTIzLjk2M2gtNTAuNjgyICAgIEMxNjMuMjM2LDEzNy4yNDMsMjA1LjI0NCw5OS4wNTYsMjU2LDk5LjA1NnogTTM3My4wOTUsMzg5LjMzMWMwLDU0LjEzNy00NC4wNDIsOTguMTY3LTk4LjE2Nyw5OC4xNjdoLTM3Ljg1NSAgICBjLTU0LjEyNSwwLTk4LjE2Ny00NC4wMy05OC4xNjctOTguMTY3VjIxMC44ODNoNjguOTczYzE5Ljc3MywwLDM1Ljg3MSwxNi4wODYsMzUuODcxLDM1Ljg3MXYxODguNDgxICAgIGMwLDYuNzYzLDUuNDg4LDEyLjI1MSwxMi4yNTEsMTIuMjUxYzYuNzYzLDAsMTIuMjUxLTUuNDg4LDEyLjI1MS0xMi4yNTFWMjQ2Ljc1NGMwLTE5Ljc4NSwxNi4wOTgtMzUuODcxLDM1Ljg3MS0zNS44NzFoNjguOTczICAgIFYzODkuMzMxeiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPg==",
    },
    anteater: {
      id: "anteater",
      name: "Anteater",
      url: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8cGF0aCAlJSUlIGQ9Ik0yMjkuNDE3LDE3My4zNTJoLTEzLjI3OWMtNDMuODcyLDAtNzkuNTcsMzUuNjg4LTc5LjU3LDc5LjU2YzAsNS42MzYsNC41NjUsMTAuMTkxLDEwLjE5MSwxMC4xOTEgICAgczEwLjE5MS00LjU1NSwxMC4xOTEtMTAuMTkxYzAtMzIuNjMxLDI2LjU1Ny01OS4xNzgsNTkuMTg5LTU5LjE3OGgxMy4yNzljNS42MjUsMCwxMC4xOTEtNC41NjUsMTAuMTkxLTEwLjE5MSAgICBDMjM5LjYwOCwxNzcuOTA3LDIzNS4wNDIsMTczLjM1MiwyMjkuNDE3LDE3My4zNTJ6Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCAlJSUlIGQ9Ik0zOTUuNzYzLDIxMS41ODhjLTcuMDIxLDAtMTIuNzA4LDUuNjg3LTEyLjcwOCwxMi42OThjMCw3LjAyMSw1LjY4NywxMi42OTgsMTIuNzA4LDEyLjY5OCAgICBjNy4wMTEsMCwxMi42OTgtNS42NzYsMTIuNjk4LTEyLjY5OEM0MDguNDYxLDIxNy4yNzUsNDAyLjc3NCwyMTEuNTg4LDM5NS43NjMsMjExLjU4OHoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoICUlJSUgZD0iTTUxMS4yNTYsMzIzLjU2NWMtMTUuNDI5LTU0LjM0OC00OC42MjEtMTAzLjQ3OC05My40NzEtMTM4LjM1MWMtNi4yOTgtNC44OTItMTIuODcxLTkuNTI5LTE5LjU4Ny0xMy44NDkgICAgYzAuMDEtMC4zMDYsMC4wMzEtMC42MDEsMC4wNDEtMC45MDdjMC4yNDUtMTAuODc0LTMuOTg1LTIwLjE2OC0xMS41ODctMjUuNDk4Yy03LjYwMi01LjMyLTE3Ljc3My02LjExNS0yNy45MTMtMi4xODEgICAgYy0yLjgyMywxLjEwMS01LjU4NSwyLjUzOC04LjI0NCw0LjI3Yy0yOS43NDctMTEuNTY3LTYxLjExNS0xNy42NjEtOTMuMzA4LTE4LjA5OWMtMC4wNjEsMC0wLjEyMi0wLjAxLTAuMTgzLTAuMDFsLTQwLjg1NS0wLjA0MSAgICBjLTE2LjIwMywwLTMxLjY4MywzLjExOC00NS44NzksOC43OTVjLTguNTYsMy4yNjEtMTcuNTg5LDQuOTQzLTI2Ljg3Myw0Ljk0M0gxMDUuMTdDNDcuMTg0LDE0Mi42MzcsMCwxODkuODEsMCwyNDcuNzk2djI5LjI4OSAgICBjMCwxMy4yNDgsMTAuNzgyLDI0LjAzLDI0LjAzLDI0LjAzYzEyLjA0NiwwLDIyLjA1My04LjkwNywyMy43NzUtMjAuNDg0YzAuNDQ4LTEuNiwwLjY0Mi0yLjMwMywwLjY0Mi0zLjU0NiAgICBjMC0xNy40MTYsMTQuMTc2LTMxLjU5MiwzMS41ODItMzEuNTkySDkyLjM1Yy0wLjE0MywyLjQ1Ni0wLjIyNCwyMi4wMTItMC4yMjQsMjIuMDEyYzAsMC43OTUsMC4wOTIsMS41OSwwLjI3NSwyLjM2NCAgICBjMy44MTEsMTUuOTc5LDcuMTU0LDMyLjc0Myw5Ljk0Niw0OS44MjNjMi44NTMsMTcuNTY5LDUuMTY3LDM1Ljc5LDYuODg5LDU0LjE2NGMwLjQ4OSw1LjIzOCw0Ljg4MSw5LjI0MywxMC4xNCw5LjI0M2g2MC4yNDggICAgYzUuNjI1LDAsMTAuMTkxLTQuNTU1LDEwLjE5MS0xMC4xOTFjMC01LjYyNS00LjU2NS0xMC4xOTEtMTAuMTkxLTEwLjE5MWgtNi44OTlsMi4wNzktMjYuNjkgICAgYzE0LjMwOC00Ljc0OSwyNy4wMTYtMTMuNjU2LDM2LjM5Mi0yNS42NGg2OS45MmM5Ljc5MywxNi4wMiwxNy40MjYsMzQuMzMzLDIyLjI0Nyw1My44MDhjMC44OTcsMy42NTksMS42ODIsNy4yMzYsMi4zMzQsMTAuNjE5ICAgIGMwLjkwNyw0LjgxLDUuMTE2LDguMjg1LDEwLjAwNyw4LjI4NWg1NC4zODljNS42MzYsMCwxMC4xOTEtNC41NjYsMTAuMTkxLTEwLjE5MXMtNC41NTUtMTAuMTkxLTEwLjE5MS0xMC4xOTFoLTUuNTk1ICAgIGMxLjM5Ni05LjI2MywyLjEzLTE4LjgzMywyLjEzLTI4LjYwNmMwLTE3LjAwOS0yLjE2LTM0LjM2NC02LjQxLTUxLjU3NmMtMC4yMzQtMC45MTctMC40NjktMS44MzQtMC43MTMtMi43NTJoMTUuNzE0ICAgIGMzOC40MDksMCw3Mi44NjUsMjEuMzkxLDg5Ljk2NSw1NS44MzZjMC4xNTMsMC4zMTYsMC4zMTYsMC42MzIsMC40OTksMC45MzhjMy4wOTgsNS4yMjgsOC43OTUsOC40NjksMTQuODY4LDguNDY5aDE0Ljg5OSAgICBjOS4xMjEsMCwxNi41NS03LjQyOSwxNi41NS0xNi41NUM1MTIsMzI2LjgxNiw1MTEuNzQ1LDMyNS4xNjUsNTExLjI1NiwzMjMuNTY1eiBNOTUuMjY0LDIyNS4xMTFIODAuMDI5ICAgIGMtMC4wNjEsMC0wLjEyMiwwLjAxLTAuMTgzLDAuMDFjLTI3LjUyNiwwLjA5Mi01MC4wNjgsMjEuNzA3LTUxLjY3OCw0OC44NTVjLTAuMzE2LDAuOTc4LTAuNDc5LDIuMDE4LTAuNDc5LDMuMTA4ICAgIGMwLDIuMDA4LTEuNjQxLDMuNjQ4LTMuNjU5LDMuNjQ4Yy0yLjAwOCwwLTMuNjQ4LTEuNjQxLTMuNjQ4LTMuNjQ4di0yOC45ODNjMC0wLjAxLDAtMC4wMSwwLTAuMDF2LTAuMjk2ICAgIGMwLTQ2Ljc0NiwzOC4wMzItODQuNzc4LDg0Ljc4OC04NC43NzhoMjUuNjJDMTEzLjQyNCwxNzkuNTE3LDEwMC44MTgsMjAwLjk3OSw5NS4yNjQsMjI1LjExMXogTTQ4Mi40NzcsMzI0LjY0NiAgICBjLTkuODU1LTE4Ljk4Ni0yNC41Ni0zNS4wMzYtNDIuNjU5LTQ2LjUyMWMtMTkuMzAyLTEyLjI0OS00MS42NC0xOC43MjEtNjQuNi0xOC43MjFoLTI5LjI5OWMtMS4wNiwwLTIuMTQsMC4xNTMtMy4yLDAuNTEgICAgYy01LjM1LDEuNzUzLTguMjY1LDcuNTExLTYuNTAyLDEyLjg2MWMxLjU1OSw0Ljc0OSwyLjk3Niw5LjY5Miw0LjIwOSwxNC42NjVjMy44NjIsMTUuNjAyLDUuODE5LDMxLjMwNiw1LjgxOSw0Ni42NzQgICAgYzAsOS44MjQtMC44MDUsMTkuNDE0LTIuMzc0LDI4LjYwNmgtMTkuOTAzYy0wLjI2NS0xLjEyMS0wLjUzLTIuMjYyLTAuODE1LTMuNDA0Yy04Ljg4Ni0zNS44OTItMjYuNTE3LTY4LjQ2Mi00OS42NC05MS43MDggICAgYy0zLjk3NC0zLjk5NS0xMC40MjUtNC4wMDUtMTQuNDEtMC4wNDFjLTMuOTk1LDMuOTc0LTQuMDA1LDEwLjQyNS0wLjA0MSwxNC40MmMyLjUzOCwyLjU0OCw0Ljk5NCw1LjIyOCw3LjM3OCw4LjAySDIyMi42MyAgICBjMy43My05Ljk0Niw1LjQwMS0yMC42MzcsNC43OS0zMS40MDhjLTAuMzE2LTUuNjI1LTUuMDk1LTkuOTA2LTEwLjc1MS05LjZjLTUuNjI1LDAuMzI2LTkuOTE2LDUuMTM2LTkuNTksMTAuNzYyICAgIGMxLjU4LDI3Ljc5MS0xNi45MzcsNTIuMzUxLTQ0LjA0NSw1OC40MjRjLTQuMjksMC45MjctNy42MzMsNC41NjYtNy45OSw5LjE2MmwtMi43NzIsMzUuMzcyaC0yMy42NjMgICAgYy0xLjYzLTE1LjY5NC0zLjY5OS0zMS4yMjUtNi4xNDUtNDYuMjk3Yy0yLjgwMi0xNy4xNjEtNi4xNTUtMzQuMDA3LTkuOTU2LTUwLjEwOXYtMTMuNDAxICAgIGMwLTU3LjE0LDQ2LjQ5MS0xMDMuNjMxLDEwMy42MjEtMTAzLjYzMWw0MC42MTEsMC4wNDFjMC4wNTEsMCwwLjA5MiwwLjAxLDAuMTMzLDAuMDFjMjYuNzUxLDAuMzU3LDUyLjg2LDQuOTQzLDc3LjgyOCwxMy42MjUgICAgYy0yLjM5NSw0LjQ4NC0xLjEyMSwxMC4xNCwzLjEzOSwxMy4xMzZjNC42MTcsMy4yMiwxMC45NjUsMi4xMDksMTQuMTk2LTIuNTA3YzMuODcyLTUuNTIzLDkuMDE5LTkuODM0LDE0LjA5NC0xMS44MTEgICAgYzEuNzQzLTAuNjczLDYuMDg0LTIuMDM4LDguODM2LTAuMTIyYzIuNzQxLDEuOTI2LDIuOTM1LDYuNDgxLDIuODk0LDguMzQ2Yy0wLjEyMiw1LjQ1Mi0yLjQxNSwxMS43NS02LjI4OCwxNy4yNzQgICAgYy0zLjIzMSw0LjYxNi0yLjEyLDEwLjk2NSwyLjQ5NywxNC4xOTZjMS43NzMsMS4yNTMsMy44MTEsMS44NDUsNS44MzksMS44NDVjMy4yMSwwLDYuMzY5LTEuNTA4LDguMzQ2LTQuMzQxICAgIGMxLjU4LTIuMjUyLDIuOTg2LTQuNTc2LDQuMjA5LTYuOTZjNC4zNzIsMi45NjYsOC42NjIsNi4wNzQsMTIuODEsOS4yOTRjNDAuMjEzLDMxLjI2Niw3MC4yNzYsNzQuOTIzLDg1LjA1MywxMjMuMzRINDgyLjQ3N3oiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoICUlJSUgZD0iTTIyOS40MTcsMTczLjM1MmgtMTMuMjc5Yy00My44NzIsMC03OS41NywzNS42ODgtNzkuNTcsNzkuNTZjMCw1LjYzNiw0LjU2NSwxMC4xOTEsMTAuMTkxLDEwLjE5MSAgICBzMTAuMTkxLTQuNTU1LDEwLjE5MS0xMC4xOTFjMC0zMi42MzEsMjYuNTU3LTU5LjE3OCw1OS4xODktNTkuMTc4aDEzLjI3OWM1LjYyNSwwLDEwLjE5MS00LjU2NSwxMC4xOTEtMTAuMTkxICAgIEMyMzkuNjA4LDE3Ny45MDcsMjM1LjA0MiwxNzMuMzUyLDIyOS40MTcsMTczLjM1MnoiLz4KCTwvZz4KPC9nPgo8ZyBpZD0iU1ZHQ2xlYW5lcklkXzEiPgoJPGc+CgkJPHBhdGggJSUlJSBkPSJNMzk1Ljc2MywyMTEuNTg4Yy03LjAyMSwwLTEyLjcwOCw1LjY4Ny0xMi43MDgsMTIuNjk4YzAsNy4wMjEsNS42ODcsMTIuNjk4LDEyLjcwOCwxMi42OTggICAgYzcuMDExLDAsMTIuNjk4LTUuNjc2LDEyLjY5OC0xMi42OThDNDA4LjQ2MSwyMTcuMjc1LDQwMi43NzQsMjExLjU4OCwzOTUuNzYzLDIxMS41ODh6Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCAlJSUlIGQ9Ik0zOTUuNzYzLDIxMS41ODhjLTcuMDIxLDAtMTIuNzA4LDUuNjg3LTEyLjcwOCwxMi42OThjMCw3LjAyMSw1LjY4NywxMi42OTgsMTIuNzA4LDEyLjY5OCAgICBjNy4wMTEsMCwxMi42OTgtNS42NzYsMTIuNjk4LTEyLjY5OEM0MDguNDYxLDIxNy4yNzUsNDAyLjc3NCwyMTEuNTg4LDM5NS43NjMsMjExLjU4OHoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoICUlJSUgZD0iTTIyOS40MTcsMTczLjM1MmgtMTMuMjc5Yy00My44NzIsMC03OS41NywzNS42ODgtNzkuNTcsNzkuNTZjMCw1LjYzNiw0LjU2NSwxMC4xOTEsMTAuMTkxLDEwLjE5MSAgICBzMTAuMTkxLTQuNTU1LDEwLjE5MS0xMC4xOTFjMC0zMi42MzEsMjYuNTU3LTU5LjE3OCw1OS4xODktNTkuMTc4aDEzLjI3OWM1LjYyNSwwLDEwLjE5MS00LjU2NSwxMC4xOTEtMTAuMTkxICAgIEMyMzkuNjA4LDE3Ny45MDcsMjM1LjA0MiwxNzMuMzUyLDIyOS40MTcsMTczLjM1MnoiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4="
      //url: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8cGF0aCAlJSUlIGQ9Ik0yMjkuNDE3LDE3My4zNTJoLTEzLjI3OWMtNDMuODcyLDAtNzkuNTcsMzUuNjg4LTc5LjU3LDc5LjU2YzAsNS42MzYsNC41NjUsMTAuMTkxLDEwLjE5MSwxMC4xOTEgICAgczEwLjE5MS00LjU1NSwxMC4xOTEtMTAuMTkxYzAtMzIuNjMxLDI2LjU1Ny01OS4xNzgsNTkuMTg5LTU5LjE3OGgxMy4yNzljNS42MjUsMCwxMC4xOTEtNC41NjUsMTAuMTkxLTEwLjE5MSAgICBDMjM5LjYwOCwxNzcuOTA3LDIzNS4wNDIsMTczLjM1MiwyMjkuNDE3LDE3My4zNTJ6Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNMzk1Ljc2MywyMTEuNTg4Yy03LjAyMSwwLTEyLjcwOCw1LjY4Ny0xMi43MDgsMTIuNjk4YzAsNy4wMjEsNS42ODcsMTIuNjk4LDEyLjcwOCwxMi42OTggICAgYzcuMDExLDAsMTIuNjk4LTUuNjc2LDEyLjY5OC0xMi42OThDNDA4LjQ2MSwyMTcuMjc1LDQwMi43NzQsMjExLjU4OCwzOTUuNzYzLDIxMS41ODh6Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNTExLjI1NiwzMjMuNTY1Yy0xNS40MjktNTQuMzQ4LTQ4LjYyMS0xMDMuNDc4LTkzLjQ3MS0xMzguMzUxYy02LjI5OC00Ljg5Mi0xMi44NzEtOS41MjktMTkuNTg3LTEzLjg0OSAgICBjMC4wMS0wLjMwNiwwLjAzMS0wLjYwMSwwLjA0MS0wLjkwN2MwLjI0NS0xMC44NzQtMy45ODUtMjAuMTY4LTExLjU4Ny0yNS40OThjLTcuNjAyLTUuMzItMTcuNzczLTYuMTE1LTI3LjkxMy0yLjE4MSAgICBjLTIuODIzLDEuMTAxLTUuNTg1LDIuNTM4LTguMjQ0LDQuMjdjLTI5Ljc0Ny0xMS41NjctNjEuMTE1LTE3LjY2MS05My4zMDgtMTguMDk5Yy0wLjA2MSwwLTAuMTIyLTAuMDEtMC4xODMtMC4wMWwtNDAuODU1LTAuMDQxICAgIGMtMTYuMjAzLDAtMzEuNjgzLDMuMTE4LTQ1Ljg3OSw4Ljc5NWMtOC41NiwzLjI2MS0xNy41ODksNC45NDMtMjYuODczLDQuOTQzSDEwNS4xN0M0Ny4xODQsMTQyLjYzNywwLDE4OS44MSwwLDI0Ny43OTZ2MjkuMjg5ICAgIGMwLDEzLjI0OCwxMC43ODIsMjQuMDMsMjQuMDMsMjQuMDNjMTIuMDQ2LDAsMjIuMDUzLTguOTA3LDIzLjc3NS0yMC40ODRjMC40NDgtMS42LDAuNjQyLTIuMzAzLDAuNjQyLTMuNTQ2ICAgIGMwLTE3LjQxNiwxNC4xNzYtMzEuNTkyLDMxLjU4Mi0zMS41OTJIOTIuMzVjLTAuMTQzLDIuNDU2LTAuMjI0LDIyLjAxMi0wLjIyNCwyMi4wMTJjMCwwLjc5NSwwLjA5MiwxLjU5LDAuMjc1LDIuMzY0ICAgIGMzLjgxMSwxNS45NzksNy4xNTQsMzIuNzQzLDkuOTQ2LDQ5LjgyM2MyLjg1MywxNy41NjksNS4xNjcsMzUuNzksNi44ODksNTQuMTY0YzAuNDg5LDUuMjM4LDQuODgxLDkuMjQzLDEwLjE0LDkuMjQzaDYwLjI0OCAgICBjNS42MjUsMCwxMC4xOTEtNC41NTUsMTAuMTkxLTEwLjE5MWMwLTUuNjI1LTQuNTY1LTEwLjE5MS0xMC4xOTEtMTAuMTkxaC02Ljg5OWwyLjA3OS0yNi42OSAgICBjMTQuMzA4LTQuNzQ5LDI3LjAxNi0xMy42NTYsMzYuMzkyLTI1LjY0aDY5LjkyYzkuNzkzLDE2LjAyLDE3LjQyNiwzNC4zMzMsMjIuMjQ3LDUzLjgwOGMwLjg5NywzLjY1OSwxLjY4Miw3LjIzNiwyLjMzNCwxMC42MTkgICAgYzAuOTA3LDQuODEsNS4xMTYsOC4yODUsMTAuMDA3LDguMjg1aDU0LjM4OWM1LjYzNiwwLDEwLjE5MS00LjU2NiwxMC4xOTEtMTAuMTkxcy00LjU1NS0xMC4xOTEtMTAuMTkxLTEwLjE5MWgtNS41OTUgICAgYzEuMzk2LTkuMjYzLDIuMTMtMTguODMzLDIuMTMtMjguNjA2YzAtMTcuMDA5LTIuMTYtMzQuMzY0LTYuNDEtNTEuNTc2Yy0wLjIzNC0wLjkxNy0wLjQ2OS0xLjgzNC0wLjcxMy0yLjc1MmgxNS43MTQgICAgYzM4LjQwOSwwLDcyLjg2NSwyMS4zOTEsODkuOTY1LDU1LjgzNmMwLjE1MywwLjMxNiwwLjMxNiwwLjYzMiwwLjQ5OSwwLjkzOGMzLjA5OCw1LjIyOCw4Ljc5NSw4LjQ2OSwxNC44NjgsOC40NjloMTQuODk5ICAgIGM5LjEyMSwwLDE2LjU1LTcuNDI5LDE2LjU1LTE2LjU1QzUxMiwzMjYuODE2LDUxMS43NDUsMzI1LjE2NSw1MTEuMjU2LDMyMy41NjV6IE05NS4yNjQsMjI1LjExMUg4MC4wMjkgICAgYy0wLjA2MSwwLTAuMTIyLDAuMDEtMC4xODMsMC4wMWMtMjcuNTI2LDAuMDkyLTUwLjA2OCwyMS43MDctNTEuNjc4LDQ4Ljg1NWMtMC4zMTYsMC45NzgtMC40NzksMi4wMTgtMC40NzksMy4xMDggICAgYzAsMi4wMDgtMS42NDEsMy42NDgtMy42NTksMy42NDhjLTIuMDA4LDAtMy42NDgtMS42NDEtMy42NDgtMy42NDh2LTI4Ljk4M2MwLTAuMDEsMC0wLjAxLDAtMC4wMXYtMC4yOTYgICAgYzAtNDYuNzQ2LDM4LjAzMi04NC43NzgsODQuNzg4LTg0Ljc3OGgyNS42MkMxMTMuNDI0LDE3OS41MTcsMTAwLjgxOCwyMDAuOTc5LDk1LjI2NCwyMjUuMTExeiBNNDgyLjQ3NywzMjQuNjQ2ICAgIGMtOS44NTUtMTguOTg2LTI0LjU2LTM1LjAzNi00Mi42NTktNDYuNTIxYy0xOS4zMDItMTIuMjQ5LTQxLjY0LTE4LjcyMS02NC42LTE4LjcyMWgtMjkuMjk5Yy0xLjA2LDAtMi4xNCwwLjE1My0zLjIsMC41MSAgICBjLTUuMzUsMS43NTMtOC4yNjUsNy41MTEtNi41MDIsMTIuODYxYzEuNTU5LDQuNzQ5LDIuOTc2LDkuNjkyLDQuMjA5LDE0LjY2NWMzLjg2MiwxNS42MDIsNS44MTksMzEuMzA2LDUuODE5LDQ2LjY3NCAgICBjMCw5LjgyNC0wLjgwNSwxOS40MTQtMi4zNzQsMjguNjA2aC0xOS45MDNjLTAuMjY1LTEuMTIxLTAuNTMtMi4yNjItMC44MTUtMy40MDRjLTguODg2LTM1Ljg5Mi0yNi41MTctNjguNDYyLTQ5LjY0LTkxLjcwOCAgICBjLTMuOTc0LTMuOTk1LTEwLjQyNS00LjAwNS0xNC40MS0wLjA0MWMtMy45OTUsMy45NzQtNC4wMDUsMTAuNDI1LTAuMDQxLDE0LjQyYzIuNTM4LDIuNTQ4LDQuOTk0LDUuMjI4LDcuMzc4LDguMDJIMjIyLjYzICAgIGMzLjczLTkuOTQ2LDUuNDAxLTIwLjYzNyw0Ljc5LTMxLjQwOGMtMC4zMTYtNS42MjUtNS4wOTUtOS45MDYtMTAuNzUxLTkuNmMtNS42MjUsMC4zMjYtOS45MTYsNS4xMzYtOS41OSwxMC43NjIgICAgYzEuNTgsMjcuNzkxLTE2LjkzNyw1Mi4zNTEtNDQuMDQ1LDU4LjQyNGMtNC4yOSwwLjkyNy03LjYzMyw0LjU2Ni03Ljk5LDkuMTYybC0yLjc3MiwzNS4zNzJoLTIzLjY2MyAgICBjLTEuNjMtMTUuNjk0LTMuNjk5LTMxLjIyNS02LjE0NS00Ni4yOTdjLTIuODAyLTE3LjE2MS02LjE1NS0zNC4wMDctOS45NTYtNTAuMTA5di0xMy40MDEgICAgYzAtNTcuMTQsNDYuNDkxLTEwMy42MzEsMTAzLjYyMS0xMDMuNjMxbDQwLjYxMSwwLjA0MWMwLjA1MSwwLDAuMDkyLDAuMDEsMC4xMzMsMC4wMWMyNi43NTEsMC4zNTcsNTIuODYsNC45NDMsNzcuODI4LDEzLjYyNSAgICBjLTIuMzk1LDQuNDg0LTEuMTIxLDEwLjE0LDMuMTM5LDEzLjEzNmM0LjYxNywzLjIyLDEwLjk2NSwyLjEwOSwxNC4xOTYtMi41MDdjMy44NzItNS41MjMsOS4wMTktOS44MzQsMTQuMDk0LTExLjgxMSAgICBjMS43NDMtMC42NzMsNi4wODQtMi4wMzgsOC44MzYtMC4xMjJjMi43NDEsMS45MjYsMi45MzUsNi40ODEsMi44OTQsOC4zNDZjLTAuMTIyLDUuNDUyLTIuNDE1LDExLjc1LTYuMjg4LDE3LjI3NCAgICBjLTMuMjMxLDQuNjE2LTIuMTIsMTAuOTY1LDIuNDk3LDE0LjE5NmMxLjc3MywxLjI1MywzLjgxMSwxLjg0NSw1LjgzOSwxLjg0NWMzLjIxLDAsNi4zNjktMS41MDgsOC4zNDYtNC4zNDEgICAgYzEuNTgtMi4yNTIsMi45ODYtNC41NzYsNC4yMDktNi45NmM0LjM3MiwyLjk2Niw4LjY2Miw2LjA3NCwxMi44MSw5LjI5NGM0MC4yMTMsMzEuMjY2LDcwLjI3Niw3NC45MjMsODUuMDUzLDEyMy4zNEg0ODIuNDc3eiIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTIyOS40MTcsMTczLjM1MmgtMTMuMjc5Yy00My44NzIsMC03OS41NywzNS42ODgtNzkuNTcsNzkuNTZjMCw1LjYzNiw0LjU2NSwxMC4xOTEsMTAuMTkxLDEwLjE5MSAgICBzMTAuMTkxLTQuNTU1LDEwLjE5MS0xMC4xOTFjMC0zMi42MzEsMjYuNTU3LTU5LjE3OCw1OS4xODktNTkuMTc4aDEzLjI3OWM1LjYyNSwwLDEwLjE5MS00LjU2NSwxMC4xOTEtMTAuMTkxICAgIEMyMzkuNjA4LDE3Ny45MDcsMjM1LjA0MiwxNzMuMzUyLDIyOS40MTcsMTczLjM1MnoiLz4KCTwvZz4KPC9nPgo8ZyBpZD0iU1ZHQ2xlYW5lcklkXzEiPgoJPGc+CgkJPHBhdGggZD0iTTM5NS43NjMsMjExLjU4OGMtNy4wMjEsMC0xMi43MDgsNS42ODctMTIuNzA4LDEyLjY5OGMwLDcuMDIxLDUuNjg3LDEyLjY5OCwxMi43MDgsMTIuNjk4ICAgIGM3LjAxMSwwLDEyLjY5OC01LjY3NiwxMi42OTgtMTIuNjk4QzQwOC40NjEsMjE3LjI3NSw0MDIuNzc0LDIxMS41ODgsMzk1Ljc2MywyMTEuNTg4eiIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTM5NS43NjMsMjExLjU4OGMtNy4wMjEsMC0xMi43MDgsNS42ODctMTIuNzA4LDEyLjY5OGMwLDcuMDIxLDUuNjg3LDEyLjY5OCwxMi43MDgsMTIuNjk4ICAgIGM3LjAxMSwwLDEyLjY5OC01LjY3NiwxMi42OTgtMTIuNjk4QzQwOC40NjEsMjE3LjI3NSw0MDIuNzc0LDIxMS41ODgsMzk1Ljc2MywyMTEuNTg4eiIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTIyOS40MTcsMTczLjM1MmgtMTMuMjc5Yy00My44NzIsMC03OS41NywzNS42ODgtNzkuNTcsNzkuNTZjMCw1LjYzNiw0LjU2NSwxMC4xOTEsMTAuMTkxLDEwLjE5MSAgICBzMTAuMTkxLTQuNTU1LDEwLjE5MS0xMC4xOTFjMC0zMi42MzEsMjYuNTU3LTU5LjE3OCw1OS4xODktNTkuMTc4aDEzLjI3OWM1LjYyNSwwLDEwLjE5MS00LjU2NSwxMC4xOTEtMTAuMTkxICAgIEMyMzkuNjA4LDE3Ny45MDcsMjM1LjA0MiwxNzMuMzUyLDIyOS40MTcsMTczLjM1MnoiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4="
      //url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNMjI5LjQxNywxNzMuMzUyaC0xMy4yNzljLTQzLjg3MiwwLTc5LjU3LDM1LjY4OC03OS41Nyw3OS41NmMwLDUuNjM2LDQuNTY1LDEwLjE5MSwxMC4xOTEsMTAuMTkxICAgIHMxMC4xOTEtNC41NTUsMTAuMTkxLTEwLjE5MWMwLTMyLjYzMSwyNi41NTctNTkuMTc4LDU5LjE4OS01OS4xNzhoMTMuMjc5YzUuNjI1LDAsMTAuMTkxLTQuNTY1LDEwLjE5MS0xMC4xOTEgICAgQzIzOS42MDgsMTc3LjkwNywyMzUuMDQyLDE3My4zNTIsMjI5LjQxNywxNzMuMzUyeiIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTM5NS43NjMsMjExLjU4OGMtNy4wMjEsMC0xMi43MDgsNS42ODctMTIuNzA4LDEyLjY5OGMwLDcuMDIxLDUuNjg3LDEyLjY5OCwxMi43MDgsMTIuNjk4ICAgIGM3LjAxMSwwLDEyLjY5OC01LjY3NiwxMi42OTgtMTIuNjk4QzQwOC40NjEsMjE3LjI3NSw0MDIuNzc0LDIxMS41ODgsMzk1Ljc2MywyMTEuNTg4eiIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTUxMS4yNTYsMzIzLjU2NWMtMTUuNDI5LTU0LjM0OC00OC42MjEtMTAzLjQ3OC05My40NzEtMTM4LjM1MWMtNi4yOTgtNC44OTItMTIuODcxLTkuNTI5LTE5LjU4Ny0xMy44NDkgICAgYzAuMDEtMC4zMDYsMC4wMzEtMC42MDEsMC4wNDEtMC45MDdjMC4yNDUtMTAuODc0LTMuOTg1LTIwLjE2OC0xMS41ODctMjUuNDk4Yy03LjYwMi01LjMyLTE3Ljc3My02LjExNS0yNy45MTMtMi4xODEgICAgYy0yLjgyMywxLjEwMS01LjU4NSwyLjUzOC04LjI0NCw0LjI3Yy0yOS43NDctMTEuNTY3LTYxLjExNS0xNy42NjEtOTMuMzA4LTE4LjA5OWMtMC4wNjEsMC0wLjEyMi0wLjAxLTAuMTgzLTAuMDFsLTQwLjg1NS0wLjA0MSAgICBjLTE2LjIwMywwLTMxLjY4MywzLjExOC00NS44NzksOC43OTVjLTguNTYsMy4yNjEtMTcuNTg5LDQuOTQzLTI2Ljg3Myw0Ljk0M0gxMDUuMTdDNDcuMTg0LDE0Mi42MzcsMCwxODkuODEsMCwyNDcuNzk2djI5LjI4OSAgICBjMCwxMy4yNDgsMTAuNzgyLDI0LjAzLDI0LjAzLDI0LjAzYzEyLjA0NiwwLDIyLjA1My04LjkwNywyMy43NzUtMjAuNDg0YzAuNDQ4LTEuNiwwLjY0Mi0yLjMwMywwLjY0Mi0zLjU0NiAgICBjMC0xNy40MTYsMTQuMTc2LTMxLjU5MiwzMS41ODItMzEuNTkySDkyLjM1Yy0wLjE0MywyLjQ1Ni0wLjIyNCwyMi4wMTItMC4yMjQsMjIuMDEyYzAsMC43OTUsMC4wOTIsMS41OSwwLjI3NSwyLjM2NCAgICBjMy44MTEsMTUuOTc5LDcuMTU0LDMyLjc0Myw5Ljk0Niw0OS44MjNjMi44NTMsMTcuNTY5LDUuMTY3LDM1Ljc5LDYuODg5LDU0LjE2NGMwLjQ4OSw1LjIzOCw0Ljg4MSw5LjI0MywxMC4xNCw5LjI0M2g2MC4yNDggICAgYzUuNjI1LDAsMTAuMTkxLTQuNTU1LDEwLjE5MS0xMC4xOTFjMC01LjYyNS00LjU2NS0xMC4xOTEtMTAuMTkxLTEwLjE5MWgtNi44OTlsMi4wNzktMjYuNjkgICAgYzE0LjMwOC00Ljc0OSwyNy4wMTYtMTMuNjU2LDM2LjM5Mi0yNS42NGg2OS45MmM5Ljc5MywxNi4wMiwxNy40MjYsMzQuMzMzLDIyLjI0Nyw1My44MDhjMC44OTcsMy42NTksMS42ODIsNy4yMzYsMi4zMzQsMTAuNjE5ICAgIGMwLjkwNyw0LjgxLDUuMTE2LDguMjg1LDEwLjAwNyw4LjI4NWg1NC4zODljNS42MzYsMCwxMC4xOTEtNC41NjYsMTAuMTkxLTEwLjE5MXMtNC41NTUtMTAuMTkxLTEwLjE5MS0xMC4xOTFoLTUuNTk1ICAgIGMxLjM5Ni05LjI2MywyLjEzLTE4LjgzMywyLjEzLTI4LjYwNmMwLTE3LjAwOS0yLjE2LTM0LjM2NC02LjQxLTUxLjU3NmMtMC4yMzQtMC45MTctMC40NjktMS44MzQtMC43MTMtMi43NTJoMTUuNzE0ICAgIGMzOC40MDksMCw3Mi44NjUsMjEuMzkxLDg5Ljk2NSw1NS44MzZjMC4xNTMsMC4zMTYsMC4zMTYsMC42MzIsMC40OTksMC45MzhjMy4wOTgsNS4yMjgsOC43OTUsOC40NjksMTQuODY4LDguNDY5aDE0Ljg5OSAgICBjOS4xMjEsMCwxNi41NS03LjQyOSwxNi41NS0xNi41NUM1MTIsMzI2LjgxNiw1MTEuNzQ1LDMyNS4xNjUsNTExLjI1NiwzMjMuNTY1eiBNOTUuMjY0LDIyNS4xMTFIODAuMDI5ICAgIGMtMC4wNjEsMC0wLjEyMiwwLjAxLTAuMTgzLDAuMDFjLTI3LjUyNiwwLjA5Mi01MC4wNjgsMjEuNzA3LTUxLjY3OCw0OC44NTVjLTAuMzE2LDAuOTc4LTAuNDc5LDIuMDE4LTAuNDc5LDMuMTA4ICAgIGMwLDIuMDA4LTEuNjQxLDMuNjQ4LTMuNjU5LDMuNjQ4Yy0yLjAwOCwwLTMuNjQ4LTEuNjQxLTMuNjQ4LTMuNjQ4di0yOC45ODNjMC0wLjAxLDAtMC4wMSwwLTAuMDF2LTAuMjk2ICAgIGMwLTQ2Ljc0NiwzOC4wMzItODQuNzc4LDg0Ljc4OC04NC43NzhoMjUuNjJDMTEzLjQyNCwxNzkuNTE3LDEwMC44MTgsMjAwLjk3OSw5NS4yNjQsMjI1LjExMXogTTQ4Mi40NzcsMzI0LjY0NiAgICBjLTkuODU1LTE4Ljk4Ni0yNC41Ni0zNS4wMzYtNDIuNjU5LTQ2LjUyMWMtMTkuMzAyLTEyLjI0OS00MS42NC0xOC43MjEtNjQuNi0xOC43MjFoLTI5LjI5OWMtMS4wNiwwLTIuMTQsMC4xNTMtMy4yLDAuNTEgICAgYy01LjM1LDEuNzUzLTguMjY1LDcuNTExLTYuNTAyLDEyLjg2MWMxLjU1OSw0Ljc0OSwyLjk3Niw5LjY5Miw0LjIwOSwxNC42NjVjMy44NjIsMTUuNjAyLDUuODE5LDMxLjMwNiw1LjgxOSw0Ni42NzQgICAgYzAsOS44MjQtMC44MDUsMTkuNDE0LTIuMzc0LDI4LjYwNmgtMTkuOTAzYy0wLjI2NS0xLjEyMS0wLjUzLTIuMjYyLTAuODE1LTMuNDA0Yy04Ljg4Ni0zNS44OTItMjYuNTE3LTY4LjQ2Mi00OS42NC05MS43MDggICAgYy0zLjk3NC0zLjk5NS0xMC40MjUtNC4wMDUtMTQuNDEtMC4wNDFjLTMuOTk1LDMuOTc0LTQuMDA1LDEwLjQyNS0wLjA0MSwxNC40MmMyLjUzOCwyLjU0OCw0Ljk5NCw1LjIyOCw3LjM3OCw4LjAySDIyMi42MyAgICBjMy43My05Ljk0Niw1LjQwMS0yMC42MzcsNC43OS0zMS40MDhjLTAuMzE2LTUuNjI1LTUuMDk1LTkuOTA2LTEwLjc1MS05LjZjLTUuNjI1LDAuMzI2LTkuOTE2LDUuMTM2LTkuNTksMTAuNzYyICAgIGMxLjU4LDI3Ljc5MS0xNi45MzcsNTIuMzUxLTQ0LjA0NSw1OC40MjRjLTQuMjksMC45MjctNy42MzMsNC41NjYtNy45OSw5LjE2MmwtMi43NzIsMzUuMzcyaC0yMy42NjMgICAgYy0xLjYzLTE1LjY5NC0zLjY5OS0zMS4yMjUtNi4xNDUtNDYuMjk3Yy0yLjgwMi0xNy4xNjEtNi4xNTUtMzQuMDA3LTkuOTU2LTUwLjEwOXYtMTMuNDAxICAgIGMwLTU3LjE0LDQ2LjQ5MS0xMDMuNjMxLDEwMy42MjEtMTAzLjYzMWw0MC42MTEsMC4wNDFjMC4wNTEsMCwwLjA5MiwwLjAxLDAuMTMzLDAuMDFjMjYuNzUxLDAuMzU3LDUyLjg2LDQuOTQzLDc3LjgyOCwxMy42MjUgICAgYy0yLjM5NSw0LjQ4NC0xLjEyMSwxMC4xNCwzLjEzOSwxMy4xMzZjNC42MTcsMy4yMiwxMC45NjUsMi4xMDksMTQuMTk2LTIuNTA3YzMuODcyLTUuNTIzLDkuMDE5LTkuODM0LDE0LjA5NC0xMS44MTEgICAgYzEuNzQzLTAuNjczLDYuMDg0LTIuMDM4LDguODM2LTAuMTIyYzIuNzQxLDEuOTI2LDIuOTM1LDYuNDgxLDIuODk0LDguMzQ2Yy0wLjEyMiw1LjQ1Mi0yLjQxNSwxMS43NS02LjI4OCwxNy4yNzQgICAgYy0zLjIzMSw0LjYxNi0yLjEyLDEwLjk2NSwyLjQ5NywxNC4xOTZjMS43NzMsMS4yNTMsMy44MTEsMS44NDUsNS44MzksMS44NDVjMy4yMSwwLDYuMzY5LTEuNTA4LDguMzQ2LTQuMzQxICAgIGMxLjU4LTIuMjUyLDIuOTg2LTQuNTc2LDQuMjA5LTYuOTZjNC4zNzIsMi45NjYsOC42NjIsNi4wNzQsMTIuODEsOS4yOTRjNDAuMjEzLDMxLjI2Niw3MC4yNzYsNzQuOTIzLDg1LjA1MywxMjMuMzRINDgyLjQ3N3oiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yMjkuNDE3LDE3My4zNTJoLTEzLjI3OWMtNDMuODcyLDAtNzkuNTcsMzUuNjg4LTc5LjU3LDc5LjU2YzAsNS42MzYsNC41NjUsMTAuMTkxLDEwLjE5MSwxMC4xOTEgICAgczEwLjE5MS00LjU1NSwxMC4xOTEtMTAuMTkxYzAtMzIuNjMxLDI2LjU1Ny01OS4xNzgsNTkuMTg5LTU5LjE3OGgxMy4yNzljNS42MjUsMCwxMC4xOTEtNC41NjUsMTAuMTkxLTEwLjE5MSAgICBDMjM5LjYwOCwxNzcuOTA3LDIzNS4wNDIsMTczLjM1MiwyMjkuNDE3LDE3My4zNTJ6Ii8+Cgk8L2c+CjwvZz4KPGcgaWQ9IlNWR0NsZWFuZXJJZF8xIj4KCTxnPgoJCTxwYXRoIGQ9Ik0zOTUuNzYzLDIxMS41ODhjLTcuMDIxLDAtMTIuNzA4LDUuNjg3LTEyLjcwOCwxMi42OThjMCw3LjAyMSw1LjY4NywxMi42OTgsMTIuNzA4LDEyLjY5OCAgICBjNy4wMTEsMCwxMi42OTgtNS42NzYsMTIuNjk4LTEyLjY5OEM0MDguNDYxLDIxNy4yNzUsNDAyLjc3NCwyMTEuNTg4LDM5NS43NjMsMjExLjU4OHoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0zOTUuNzYzLDIxMS41ODhjLTcuMDIxLDAtMTIuNzA4LDUuNjg3LTEyLjcwOCwxMi42OThjMCw3LjAyMSw1LjY4NywxMi42OTgsMTIuNzA4LDEyLjY5OCAgICBjNy4wMTEsMCwxMi42OTgtNS42NzYsMTIuNjk4LTEyLjY5OEM0MDguNDYxLDIxNy4yNzUsNDAyLjc3NCwyMTEuNTg4LDM5NS43NjMsMjExLjU4OHoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yMjkuNDE3LDE3My4zNTJoLTEzLjI3OWMtNDMuODcyLDAtNzkuNTcsMzUuNjg4LTc5LjU3LDc5LjU2YzAsNS42MzYsNC41NjUsMTAuMTkxLDEwLjE5MSwxMC4xOTEgICAgczEwLjE5MS00LjU1NSwxMC4xOTEtMTAuMTkxYzAtMzIuNjMxLDI2LjU1Ny01OS4xNzgsNTkuMTg5LTU5LjE3OGgxMy4yNzljNS42MjUsMCwxMC4xOTEtNC41NjUsMTAuMTkxLTEwLjE5MSAgICBDMjM5LjYwOCwxNzcuOTA3LDIzNS4wNDIsMTczLjM1MiwyMjkuNDE3LDE3My4zNTJ6Ii8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+",
    },
    kitty: {
      id: "kitty",
      name: "Kitty",
      url: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8Y2lyY2xlICUlJSUgY3g9IjkzLjAwMSIgY3k9IjEyMi4wNjYiIHI9IjExLjQyOSIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggJSUlJSBkPSJNMTk5LjcwNiwxNjYuOTU0Yy0yLjg2My01LjA2LTkuMjkxLTYuODI1LTE0LjMzOS0zLjk1Yy0xLjAxNywwLjU3My0yLjY3NiwxLjE4LTQuNzgsMC43MzYgICAgYy0yLjM4NC0wLjUwMy00LjM0Ny0yLjI1NS01LjA5NS00LjU2OWwtMC4wMTIsMC4wMTJjLTEuMDE3LTMuMDg1LTMuNDEyLTUuNjU2LTYuNzItNi43NDNjLTUuNTI4LTEuOC0xMS40NjUsMS4yMTUtMTMuMjY0LDYuNzMxICAgIGMtMC43NiwyLjMxNC0yLjcxMSw0LjA2Ny01LjEwNyw0LjU2OWMtMi4wOTIsMC40NDQtMy43NTEtMC4xNjQtNC43OC0wLjczNmMtNS4wNDktMi44NzUtMTEuNDY0LTEuMTEtMTQuMzM5LDMuOTUgICAgYy0yLjg2Myw1LjA0OS0xLjA5OSwxMS40NjUsMy45NSwxNC4zMzljNC4yMTksMi4zOTYsOC45NjQsMy42MzUsMTMuNzU1LDMuNjM1YzEuOTA1LDAsMy44MzMtMC4xOTksNS43MzgtMC41OTYgICAgYzMuOTUtMC44Myw3LjYwOC0yLjUxMywxMC43NjMtNC44MzhjMy4xNjcsMi4zMjYsNi44MzcsNC4wMDgsMTAuNzk4LDQuODM4YzEuODkzLDAuMzk3LDMuODIyLDAuNTk2LDUuNzM4LDAuNTk2ICAgIGM0Ljc4LDAsOS41MjUtMS4yMzksMTMuNzQzLTMuNjM1QzIwMC44MDUsMTc4LjQxOSwyMDIuNTgxLDE3Mi4wMDMsMTk5LjcwNiwxNjYuOTU0eiIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPGNpcmNsZSAlJSUlIGN4PSIyMzcuOTg1IiBjeT0iMTIyLjA2NiIgcj0iMTEuNDI5Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggJSUlJSBkPSJNNDIzLjc5MSwzNDQuOTMzYy0wLjcyOS0wLjE5MS0xLjQ4MS0wLjMxMy0yLjI0Ni0wLjM1OWMtMS4xNDctMC4wNjktMi4zMjQsMC4wMzEtMy40OTksMC4zMiAgICAgYy02LjI2NCwxLjU0My0xMC4wOTcsNy44NzctOC41NTUsMTQuMTQxYzQuODUsMTkuNjU3LDEuODU4LDQwLjEyLTguNDE0LDU3LjYwM2MtMy4yNzIsNS41NjMtMS40MTQsMTIuNzI3LDQuMTYsMTUuOTg3ICAgICBjMS44NTgsMS4wOTksMy44OTIsMS42MTMsNS45MDIsMS42MTNjNC4wMDgsMCw3LjkxMi0yLjA1NywxMC4wODYtNS43NjFjMS4yNTQtMi4xMzUsMi40MjYtNC4zMDUsMy41MTMtNi41MDQgICAgIGMxLjA4Ny0yLjE5OSwyLjA5LTQuNDI5LDMuMDA5LTYuNjg0YzAuNjEyLTEuNTAzLDEuMTg3LTMuMDE4LDEuNzI0LTQuNTQ0YzIuNDE3LTYuODY0LDQuMDY4LTEzLjkzNiw0LjkzOS0yMS4xMDkgICAgIGMwLjA5Ny0wLjc5NywwLjE4NC0xLjU5NSwwLjI2MS0yLjM5NGMwLjE1NS0xLjU5OSwwLjI3MS0zLjIwMSwwLjM0OS00LjgwN2MwLjE1NS0zLjIxMiwwLjE1NS02LjQzNi0wLjAwMi05LjY2NCAgICAgYy0wLjA3OC0xLjYxNC0wLjE5Ni0zLjIyOC0wLjM1My00Ljg0MmMtMC4yMzUtMi40MjEtMC41NTktNC44NDEtMC45NzItNy4yNTVjLTAuMjc1LTEuNjEtMC41OS0zLjIxNy0wLjk0NS00LjgyMSAgICAgYy0wLjE3Ny0wLjgwMi0wLjM2NS0xLjYwMy0wLjU2Mi0yLjQwM2MtMC4zMjgtMS4zMzItMC44ODMtMi41NDUtMS41OTgtMy42MjljLTAuMzM2LTAuNTA5LTAuNjk4LTAuOTk2LTEuMTA0LTEuNDQxICAgICBjLTAuMjU0LTAuMjc5LTAuNTIxLTAuNTQ0LTAuNzk5LTAuNzk2Yy0wLjQ0NS0wLjQwMi0wLjkyNi0wLjc1OC0xLjQyNS0xLjA4N0M0MjYuMTk5LDM0NS43OTUsNDI1LjAzMSwzNDUuMjU4LDQyMy43OTEsMzQ0LjkzM3oiLz4KCQkJPHBhdGggJSUlJSBkPSJNNDkwLjAzNiwzNzMuOTdjMC4wMTItMC4yMjIsMC4wMzUtMC40NTYsMC4wMzUtMC42OVYxNDUuODQ4YzAtMTEuODYyLTQuNjE2LTIzLjAxMS0xMi45OTUtMzEuMzY3ICAgICBjLTguMzkxLTguMzY4LTE5LjUxNy0xMi45ODQtMzEuMzU1LTEyLjk4NGMtMjQuNDYsMC00NC4zNTEsMTkuODkxLTQ0LjM1MSw0NC4zNTF2ODguNDMyTDMwMC4xMDYsMTcwLjMyICAgICBjNS44NDMtMTYuNDU1LDguOTUyLTMzLjczOSw4Ljk1Mi01MC45NjVWMjQuMjczQzMwOS4wNTgsMTAuODkyLDI5OC4xNjYsMCwyODQuNzg1LDBjLTYuMTU5LDAtMTIuMDM3LDIuMzE0LTE2LjUzNiw2LjUwOSAgICAgYy0wLjEwNSwwLjA5NC0wLjE5OSwwLjE4Ny0wLjMwNCwwLjI5MmwtNDEuNDA1LDQxLjQwNmMtMTguNjA1LTEwLjQzNi0zOS41MTItMTUuOTE3LTYxLjA1MS0xNS45MTcgICAgIGMtMjEuNTM4LDAtNDIuNDU3LDUuNDgxLTYxLjA1MSwxNS45MTdMNjMuMDMyLDYuODAyYy0wLjEwNS0wLjEwNS0wLjE5OS0wLjE5OS0wLjMwNC0wLjI5MkM1OC4yMjksMi4zMTQsNTIuMzUxLDAsNDYuMTkyLDAgICAgIEMzMi44MTEsMCwyMS45MTksMTAuODkyLDIxLjkxOSwyNC4yNzN2OTUuMDgyYzAsMzguMTMzLDE1LjIwNCw3Ni42MTcsNDEuNjk4LDEwNS41ODhjMTAuNTA2LDExLjQ4OCwyMi4yNTEsMjEuMDAxLDM0Ljg2MSwyOC4zOTggICAgIGMtMC42MTksNy41NzMtMC44MywxNS4yNjMtMC42MTksMjIuOTUyYzAuOTIzLDM0LjQ1MiwxMC4yMDIsNjguMzMxLDI2LjgyMSw5OC4yOTZ2NjYuMzY4aC0wLjQ0NCAgICAgYy0xOS41ODcsMC0zNS41MjcsMTUuOTI5LTM1LjUyNywzNS41MTV2MTMuMDc3YzAsMTIuMzc2LDEwLjA3NCwyMi40NSwyMi40MzgsMjIuNDVoNjAuNDljMTUuMjI4LDAsMjguMjIzLTkuNzcsMzMuMDUtMjMuMzczICAgICBoMTIuMjI0djAuMjU3YzAsMTIuNzM4LDEwLjM2NiwyMy4xMTYsMjMuMTA0LDIzLjExNmgxMzMuNjQ4YzM0LjUyMiwwLDY3LjMxNS0xNi42NTMsODcuNjk2LTQ0LjUyNiAgICAgYzAuMDEyLDAsMC4wMTItMC4wMTIsMC4wMTItMC4wMTJjMi4xODUtMi45NjgsNC4yNTQtNi4xMjQsNi4xNTktOS4zOTZjMC4wMzUtMC4wNDcsMC4wNTgtMC4wOTMsMC4wOTQtMC4xNCAgICAgYzAuMDctMC4xMjgsMC4xNTItMC4yNTcsMC4yMzQtMC4zOTdDNDgzLjU5Niw0MzEuMjkzLDQ5MC43MjUsNDAyLjQxNSw0OTAuMDM2LDM3My45N3ogTTgwLjg1NCwyMDkuMTY2ICAgICBjLTIuNDE5LTIuNjUzLTQuNzIxLTUuMzk5LTYuOTE4LTguMjI3bDguNDQ5LTAuNzEzYzYuNDI4LTAuNTQ5LDExLjIwNy02LjIwNiwxMC42NTgtMTIuNjMzICAgICBjLTAuNTM4LTYuNDM5LTYuMTk0LTExLjIwNy0xMi42MzMtMTAuNjU4bC0yMC42MDMsMS43NDFjLTIuMTE1LTQuMTYtMy45OTctOC40MjYtNS42NjgtMTIuNzYybDI1LjczNCwzLjQxMiAgICAgYzAuNTE0LDAuMDcsMS4wMjgsMC4wOTMsMS41NDMsMC4wOTNjNS43NzMsMCwxMC43OTgtNC4yNjYsMTEuNTctMTAuMTQ0YzAuODUzLTYuNDA0LTMuNjQ2LTEyLjI4My0xMC4wNS0xMy4xMjRsLTM1LjY1Ni00LjczMyAgICAgYy0xLjI5Ny03LjMwNC0xLjk4Ny0xNC42OS0xLjk4Ny0yMi4wNjRWMjQuMjczYzAtMC40OTEsMC40MDktMC45LDAuOS0wLjljMC4wODIsMCwwLjMwNCwwLDAuNTM4LDAuMTc1bDQ3LjY5Myw0Ny43MDUgICAgIGMzLjk1LDMuOTM4LDEwLjEyMSw0LjU0NiwxNC43NiwxLjQ0OWMxNi42ODgtMTEuMTQ5LDM2LjE1OC0xNy4wMzksNTYuMzA2LTE3LjAzOWMyMC4xMzYsMCwzOS42MTcsNS44OSw1Ni4zMDYsMTcuMDM5ICAgICBjNC42NCwzLjA5NywxMC44MSwyLjQ4OSwxNC43Ni0xLjQ0OWw0Ny42OTMtNDcuNzA1YzAuMjM0LTAuMTc1LDAuNDU2LTAuMTc1LDAuNTM4LTAuMTc1YzAuNDkxLDAsMC45LDAuNDA5LDAuOSwwLjl2OTUuMDgyICAgICBjMCw3LjM3NC0wLjY3OCwxNC43Ni0xLjk4NywyMi4wNjRsLTM1LjY2Nyw0LjczM2MtNi4zOTMsMC44NDEtMTAuODkyLDYuNzItMTAuMDUsMTMuMTI0YzAuNzgzLDUuODc4LDUuNzk3LDEwLjE0NCwxMS41NywxMC4xNDQgICAgIGMwLjUxNCwwLDEuMDI4LTAuMDM1LDEuNTU0LTAuMDk0bDI1LjczNC0zLjQxMmMtMS42NTksNC4zMzYtMy41NTMsOC42MDEtNS42NjgsMTIuNzYybC0yMC42MTUtMS43NDEgICAgIGMtNi40MzktMC41NDktMTIuMDg0LDQuMjE5LTEyLjYzMywxMC42NThjLTAuNTM4LDYuNDI4LDQuMjMxLDEyLjA4NCwxMC42NTgsMTIuNjMzbDguNDYxLDAuNzEzICAgICBjLTIuMTk3LDIuODI4LTQuNDk5LDUuNTc0LTYuOTE4LDguMjI3Yy0yMy4xNzQsMjUuMzI1LTUzLjIzMiwzOS4yNjctODQuNjM0LDM5LjI2N1MxMDQuMDI5LDIzNC40OTEsODAuODU0LDIwOS4xNjZ6ICAgICAgTTQ0Ny44NzEsNDQ1LjQxbC01LjUzOSw4LjQ4NGMtMTYuMDIyLDIxLjc0OS00MS42NzQsMzQuNzMyLTY4LjY3LDM0LjczMkgyNDAuMjgyVjQ3NWMwLTcuNTE0LDYuMS0xMy42MjcsMTMuNjE1LTEzLjYyN2gzNC41ODEgICAgIGM0LjEyNSwwLDcuOTM1LTIuMTc0LDEwLjA1LTUuNzI2YzIuMTA0LTMuNTQxLDIuMTg1LTcuOTM1LDAuMjEtMTEuNTU4Yy02Ljc2Ni0xMi40MTEtMTAuMzQzLTI2LjUwNS0xMC4zNDMtNDAuNzM5ICAgICBjMC00Ny4wMjcsMzguMjUtODUuMjc3LDg1LjI2NS04NS4yNzdjNi40NTEsMCwxMS42ODctNS4yMzYsMTEuNjg3LTExLjY4N2MwLTYuNDYzLTUuMjM2LTExLjY4Ny0xMS42ODctMTEuNjg3ICAgICBjLTU5LjkwNSwwLTEwOC42MzgsNDguNzMzLTEwOC42MzgsMTA4LjY1YzAsMTEuODAzLDEuOTI4LDIzLjUyNSw1LjY1NiwzNC42NTFoLTE2Ljc4MmMtMTcuMDI3LDAtMzEuMzksMTEuNTctMzUuNjc5LDI3LjI1MyAgICAgaC0xMS41MjN2LTc0LjcxMmMwLTYuNDYzLTUuMjM2LTExLjY4Ny0xMS42ODctMTEuNjg3Yy02LjQ2MywwLTExLjY4Nyw1LjIyNC0xMS42ODcsMTEuNjg3djg2LjM5OSAgICAgYzAsNi40MzktNS4yNDcsMTEuNjg3LTExLjY4NywxMS42ODdoLTU5LjU1NXYtMTIuMTU0YzAtNi42OTYsNS40NTgtMTIuMTQyLDEyLjE1NC0xMi4xNDJoMTIuMTMxICAgICBjNi40NTEsMCwxMS42ODctNS4yMzYsMTEuNjg3LTExLjY4N3YtNzcuOTQ5YzAuNjMxLTIuNzgxLDAuMjY5LTUuNzk3LTEuMjc0LTguNDYxYy0xNS44Ny0yNy40MDUtMjQuNzA1LTU4LjcyNS0yNS41NDctOTAuNTcxICAgICBjLTAuMTA1LTMuODgtMC4wODItNy43NiwwLjA0Ny0xMS42MTZjMTQuMTY0LDUuMTA3LDI5LjA0MSw3Ljc2LDQ0LjIxLDcuNzZjMzguMDUxLDAsNzQuMjIxLTE2LjY0MiwxMDEuODcyLTQ2Ljg2MyAgICAgYzkuMTUxLTEwLjAwNCwxNi45NDYtMjEuMTI5LDIzLjIzMy0zMi45OTFsMTEwLjgsNjkuOTc5QzQ2NS4wNSwzMDIuMTA5LDQ4NS40MzEsMzgyLjY3Nyw0NDcuODcxLDQ0NS40MXogTTQ2Ni42OTgsMjk1LjQxMyAgICAgTDQ2Ni42OTgsMjk1LjQxM2MtMTAuNi0xNy4yODQtMjQuNjctMzIuODk4LTQxLjk1NS00NS43NjV2LTEwMy44YzAtMTEuNTcsOS40MDgtMjAuOTc3LDIwLjk3Ny0yMC45NzcgICAgIGM1LjU5OCwwLDEwLjg2OCwyLjE4NSwxNC44NDIsNi4xNDdjMy45NSwzLjk1LDYuMTM1LDkuMjIxLDYuMTM1LDE0LjgzVjI5NS40MTN6Ii8+CgkJPC9nPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPGNpcmNsZSAlJSUlIGN4PSI5My4wMDEiIGN5PSIxMjIuMDY2IiByPSIxMS40MjkiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoICUlJSUgZD0iTTE5OS43MDYsMTY2Ljk1NGMtMi44NjMtNS4wNi05LjI5MS02LjgyNS0xNC4zMzktMy45NWMtMS4wMTcsMC41NzMtMi42NzYsMS4xOC00Ljc4LDAuNzM2ICAgIGMtMi4zODQtMC41MDMtNC4zNDctMi4yNTYtNS4wOTUtNC41NjlsLTAuMDEyLDAuMDEyYy0xLjAxNy0zLjA4NS0zLjQxMi01LjY1Ni02LjcyLTYuNzQzYy01LjUyOC0xLjgtMTEuNDY1LDEuMjE1LTEzLjI2NCw2LjczMiAgICBjLTAuNzYsMi4zMTQtMi43MTEsNC4wNjctNS4xMDcsNC41NjljLTIuMDkyLDAuNDQ0LTMuNzUxLTAuMTY0LTQuNzgtMC43MzZjLTUuMDQ5LTIuODc1LTExLjQ2NC0xLjExLTE0LjMzOSwzLjk1ICAgIGMtMi44NjMsNS4wNDktMS4wOTksMTEuNDY1LDMuOTUsMTQuMzM5YzQuMjE5LDIuMzk2LDguOTY0LDMuNjM1LDEzLjc1NSwzLjYzNWMxLjkwNSwwLDMuODMzLTAuMTk5LDUuNzM4LTAuNTk2ICAgIGMzLjk1LTAuODMsNy42MDgtMi41MTMsMTAuNzYzLTQuODM4YzMuMTY3LDIuMzI2LDYuODM3LDQuMDA4LDEwLjc5OCw0LjgzOGMxLjg5MywwLjM5NywzLjgyMiwwLjU5Niw1LjczOCwwLjU5NiAgICBjNC43OCwwLDkuNTI1LTEuMjM5LDEzLjc0My0zLjYzNUMyMDAuODA1LDE3OC40MTksMjAyLjU4MSwxNzIuMDAzLDE5OS43MDYsMTY2Ljk1NHoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxjaXJjbGUgJSUlJSBjeD0iMjM3Ljk4NSIgY3k9IjEyMi4wNjYiIHI9IjExLjQyOSIvPgoJPC9nPgo8L2c+CjxnIGlkPSJTVkdDbGVhbmVySWRfMCI+Cgk8Zz4KCQk8cGF0aCAlJSUlIGQ9Ik00MzIuMTg3LDM1My40NDhjLTEuNTQzLTYuMjY0LTcuODc3LTEwLjA5Ny0xNC4xNDEtOC41NTVjLTYuMjY0LDEuNTQzLTEwLjA5Nyw3Ljg3Ny04LjU1NSwxNC4xNDEgICAgYzQuODUsMTkuNjU3LDEuODU4LDQwLjEyLTguNDE0LDU3LjYwM2MtMy4yNzIsNS41NjMtMS40MTQsMTIuNzI3LDQuMTYsMTUuOTg3YzEuODU4LDEuMDk5LDMuODkyLDEuNjEzLDUuOTAyLDEuNjEzICAgIGM0LjAwOCwwLDcuOTEyLTIuMDU3LDEwLjA4Ni01Ljc2MUM0MzQuNjA2LDQwNS42OTksNDM4LjQ5OCwzNzkuMDU0LDQzMi4xODcsMzUzLjQ0OHoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxjaXJjbGUgJSUlJSBjeD0iOTMuMDAxIiBjeT0iMTIyLjA2NiIgcj0iMTEuNDI5Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlICUlJSUgY3g9IjIzNy45ODUiIGN5PSIxMjIuMDY2IiByPSIxMS40MjkiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoICUlJSUgZD0iTTE5OS43MDYsMTY2Ljk1NGMtMi44NjMtNS4wNi05LjI5MS02LjgyNS0xNC4zMzktMy45NWMtMS4wMTcsMC41NzMtMi42NzYsMS4xOC00Ljc4LDAuNzM2ICAgIGMtMi4zODQtMC41MDMtNC4zNDctMi4yNTYtNS4wOTUtNC41NjlsLTAuMDEyLDAuMDEyYy0xLjAxNy0zLjA4NS0zLjQxMi01LjY1Ni02LjcyLTYuNzQzYy01LjUyOC0xLjgtMTEuNDY1LDEuMjE1LTEzLjI2NCw2LjczMiAgICBjLTAuNzYsMi4zMTQtMi43MTEsNC4wNjctNS4xMDcsNC41NjljLTIuMDkyLDAuNDQ0LTMuNzUxLTAuMTY0LTQuNzgtMC43MzZjLTUuMDQ5LTIuODc1LTExLjQ2NC0xLjExLTE0LjMzOSwzLjk1ICAgIGMtMi44NjMsNS4wNDktMS4wOTksMTEuNDY1LDMuOTUsMTQuMzM5YzQuMjE5LDIuMzk2LDguOTY0LDMuNjM1LDEzLjc1NSwzLjYzNWMxLjkwNSwwLDMuODMzLTAuMTk5LDUuNzM4LTAuNTk2ICAgIGMzLjk1LTAuODMsNy42MDgtMi41MTMsMTAuNzYzLTQuODM4YzMuMTY3LDIuMzI2LDYuODM3LDQuMDA4LDEwLjc5OCw0LjgzOGMxLjg5MywwLjM5NywzLjgyMiwwLjU5Niw1LjczOCwwLjU5NiAgICBjNC43OCwwLDkuNTI1LTEuMjM5LDEzLjc0My0zLjYzNUMyMDAuODA1LDE3OC40MTksMjAyLjU4MSwxNzIuMDAzLDE5OS43MDYsMTY2Ljk1NHoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoICUlJSUgZD0iTTQzMi4xODcsMzUzLjQ0OGMtMS41NDMtNi4yNjQtNy44NzctMTAuMDk3LTE0LjE0MS04LjU1NWMtNi4yNjQsMS41NDMtMTAuMDk3LDcuODc3LTguNTU1LDE0LjE0MSAgICBjNC44NSwxOS42NTcsMS44NTgsNDAuMTItOC40MTQsNTcuNjAzYy0zLjI3Miw1LjU2My0xLjQxNCwxMi43MjcsNC4xNiwxNS45ODdjMS44NTgsMS4wOTksMy44OTIsMS42MTMsNS45MDIsMS42MTMgICAgYzQuMDA4LDAsNy45MTItMi4wNTcsMTAuMDg2LTUuNzYxQzQzNC42MDYsNDA1LjY5OSw0MzguNDk4LDM3OS4wNTQsNDMyLjE4NywzNTMuNDQ4eiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPg=="
      //url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSI5My4wMDEiIGN5PSIxMjIuMDY2IiByPSIxMS40MjkiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0xOTkuNzA2LDE2Ni45NTRjLTIuODYzLTUuMDYtOS4yOTEtNi44MjUtMTQuMzM5LTMuOTVjLTEuMDE3LDAuNTczLTIuNjc2LDEuMTgtNC43OCwwLjczNiAgICBjLTIuMzg0LTAuNTAzLTQuMzQ3LTIuMjU1LTUuMDk1LTQuNTY5bC0wLjAxMiwwLjAxMmMtMS4wMTctMy4wODUtMy40MTItNS42NTYtNi43Mi02Ljc0M2MtNS41MjgtMS44LTExLjQ2NSwxLjIxNS0xMy4yNjQsNi43MzEgICAgYy0wLjc2LDIuMzE0LTIuNzExLDQuMDY3LTUuMTA3LDQuNTY5Yy0yLjA5MiwwLjQ0NC0zLjc1MS0wLjE2NC00Ljc4LTAuNzM2Yy01LjA0OS0yLjg3NS0xMS40NjQtMS4xMS0xNC4zMzksMy45NSAgICBjLTIuODYzLDUuMDQ5LTEuMDk5LDExLjQ2NSwzLjk1LDE0LjMzOWM0LjIxOSwyLjM5Niw4Ljk2NCwzLjYzNSwxMy43NTUsMy42MzVjMS45MDUsMCwzLjgzMy0wLjE5OSw1LjczOC0wLjU5NiAgICBjMy45NS0wLjgzLDcuNjA4LTIuNTEzLDEwLjc2My00LjgzOGMzLjE2NywyLjMyNiw2LjgzNyw0LjAwOCwxMC43OTgsNC44MzhjMS44OTMsMC4zOTcsMy44MjIsMC41OTYsNS43MzgsMC41OTYgICAgYzQuNzgsMCw5LjUyNS0xLjIzOSwxMy43NDMtMy42MzVDMjAwLjgwNSwxNzguNDE5LDIwMi41ODEsMTcyLjAwMywxOTkuNzA2LDE2Ni45NTR6Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSIyMzcuOTg1IiBjeT0iMTIyLjA2NiIgcj0iMTEuNDI5Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Zz4KCQkJPHBhdGggZD0iTTQyMy43OTEsMzQ0LjkzM2MtMC43MjktMC4xOTEtMS40ODEtMC4zMTMtMi4yNDYtMC4zNTljLTEuMTQ3LTAuMDY5LTIuMzI0LDAuMDMxLTMuNDk5LDAuMzIgICAgIGMtNi4yNjQsMS41NDMtMTAuMDk3LDcuODc3LTguNTU1LDE0LjE0MWM0Ljg1LDE5LjY1NywxLjg1OCw0MC4xMi04LjQxNCw1Ny42MDNjLTMuMjcyLDUuNTYzLTEuNDE0LDEyLjcyNyw0LjE2LDE1Ljk4NyAgICAgYzEuODU4LDEuMDk5LDMuODkyLDEuNjEzLDUuOTAyLDEuNjEzYzQuMDA4LDAsNy45MTItMi4wNTcsMTAuMDg2LTUuNzYxYzEuMjU0LTIuMTM1LDIuNDI2LTQuMzA1LDMuNTEzLTYuNTA0ICAgICBjMS4wODctMi4xOTksMi4wOS00LjQyOSwzLjAwOS02LjY4NGMwLjYxMi0xLjUwMywxLjE4Ny0zLjAxOCwxLjcyNC00LjU0NGMyLjQxNy02Ljg2NCw0LjA2OC0xMy45MzYsNC45MzktMjEuMTA5ICAgICBjMC4wOTctMC43OTcsMC4xODQtMS41OTUsMC4yNjEtMi4zOTRjMC4xNTUtMS41OTksMC4yNzEtMy4yMDEsMC4zNDktNC44MDdjMC4xNTUtMy4yMTIsMC4xNTUtNi40MzYtMC4wMDItOS42NjQgICAgIGMtMC4wNzgtMS42MTQtMC4xOTYtMy4yMjgtMC4zNTMtNC44NDJjLTAuMjM1LTIuNDIxLTAuNTU5LTQuODQxLTAuOTcyLTcuMjU1Yy0wLjI3NS0xLjYxLTAuNTktMy4yMTctMC45NDUtNC44MjEgICAgIGMtMC4xNzctMC44MDItMC4zNjUtMS42MDMtMC41NjItMi40MDNjLTAuMzI4LTEuMzMyLTAuODgzLTIuNTQ1LTEuNTk4LTMuNjI5Yy0wLjMzNi0wLjUwOS0wLjY5OC0wLjk5Ni0xLjEwNC0xLjQ0MSAgICAgYy0wLjI1NC0wLjI3OS0wLjUyMS0wLjU0NC0wLjc5OS0wLjc5NmMtMC40NDUtMC40MDItMC45MjYtMC43NTgtMS40MjUtMS4wODdDNDI2LjE5OSwzNDUuNzk1LDQyNS4wMzEsMzQ1LjI1OCw0MjMuNzkxLDM0NC45MzN6Ii8+CgkJCTxwYXRoIGQ9Ik00OTAuMDM2LDM3My45N2MwLjAxMi0wLjIyMiwwLjAzNS0wLjQ1NiwwLjAzNS0wLjY5VjE0NS44NDhjMC0xMS44NjItNC42MTYtMjMuMDExLTEyLjk5NS0zMS4zNjcgICAgIGMtOC4zOTEtOC4zNjgtMTkuNTE3LTEyLjk4NC0zMS4zNTUtMTIuOTg0Yy0yNC40NiwwLTQ0LjM1MSwxOS44OTEtNDQuMzUxLDQ0LjM1MXY4OC40MzJMMzAwLjEwNiwxNzAuMzIgICAgIGM1Ljg0My0xNi40NTUsOC45NTItMzMuNzM5LDguOTUyLTUwLjk2NVYyNC4yNzNDMzA5LjA1OCwxMC44OTIsMjk4LjE2NiwwLDI4NC43ODUsMGMtNi4xNTksMC0xMi4wMzcsMi4zMTQtMTYuNTM2LDYuNTA5ICAgICBjLTAuMTA1LDAuMDk0LTAuMTk5LDAuMTg3LTAuMzA0LDAuMjkybC00MS40MDUsNDEuNDA2Yy0xOC42MDUtMTAuNDM2LTM5LjUxMi0xNS45MTctNjEuMDUxLTE1LjkxNyAgICAgYy0yMS41MzgsMC00Mi40NTcsNS40ODEtNjEuMDUxLDE1LjkxN0w2My4wMzIsNi44MDJjLTAuMTA1LTAuMTA1LTAuMTk5LTAuMTk5LTAuMzA0LTAuMjkyQzU4LjIyOSwyLjMxNCw1Mi4zNTEsMCw0Ni4xOTIsMCAgICAgQzMyLjgxMSwwLDIxLjkxOSwxMC44OTIsMjEuOTE5LDI0LjI3M3Y5NS4wODJjMCwzOC4xMzMsMTUuMjA0LDc2LjYxNyw0MS42OTgsMTA1LjU4OGMxMC41MDYsMTEuNDg4LDIyLjI1MSwyMS4wMDEsMzQuODYxLDI4LjM5OCAgICAgYy0wLjYxOSw3LjU3My0wLjgzLDE1LjI2My0wLjYxOSwyMi45NTJjMC45MjMsMzQuNDUyLDEwLjIwMiw2OC4zMzEsMjYuODIxLDk4LjI5NnY2Ni4zNjhoLTAuNDQ0ICAgICBjLTE5LjU4NywwLTM1LjUyNywxNS45MjktMzUuNTI3LDM1LjUxNXYxMy4wNzdjMCwxMi4zNzYsMTAuMDc0LDIyLjQ1LDIyLjQzOCwyMi40NWg2MC40OWMxNS4yMjgsMCwyOC4yMjMtOS43NywzMy4wNS0yMy4zNzMgICAgIGgxMi4yMjR2MC4yNTdjMCwxMi43MzgsMTAuMzY2LDIzLjExNiwyMy4xMDQsMjMuMTE2aDEzMy42NDhjMzQuNTIyLDAsNjcuMzE1LTE2LjY1Myw4Ny42OTYtNDQuNTI2ICAgICBjMC4wMTIsMCwwLjAxMi0wLjAxMiwwLjAxMi0wLjAxMmMyLjE4NS0yLjk2OCw0LjI1NC02LjEyNCw2LjE1OS05LjM5NmMwLjAzNS0wLjA0NywwLjA1OC0wLjA5MywwLjA5NC0wLjE0ICAgICBjMC4wNy0wLjEyOCwwLjE1Mi0wLjI1NywwLjIzNC0wLjM5N0M0ODMuNTk2LDQzMS4yOTMsNDkwLjcyNSw0MDIuNDE1LDQ5MC4wMzYsMzczLjk3eiBNODAuODU0LDIwOS4xNjYgICAgIGMtMi40MTktMi42NTMtNC43MjEtNS4zOTktNi45MTgtOC4yMjdsOC40NDktMC43MTNjNi40MjgtMC41NDksMTEuMjA3LTYuMjA2LDEwLjY1OC0xMi42MzMgICAgIGMtMC41MzgtNi40MzktNi4xOTQtMTEuMjA3LTEyLjYzMy0xMC42NThsLTIwLjYwMywxLjc0MWMtMi4xMTUtNC4xNi0zLjk5Ny04LjQyNi01LjY2OC0xMi43NjJsMjUuNzM0LDMuNDEyICAgICBjMC41MTQsMC4wNywxLjAyOCwwLjA5MywxLjU0MywwLjA5M2M1Ljc3MywwLDEwLjc5OC00LjI2NiwxMS41Ny0xMC4xNDRjMC44NTMtNi40MDQtMy42NDYtMTIuMjgzLTEwLjA1LTEzLjEyNGwtMzUuNjU2LTQuNzMzICAgICBjLTEuMjk3LTcuMzA0LTEuOTg3LTE0LjY5LTEuOTg3LTIyLjA2NFYyNC4yNzNjMC0wLjQ5MSwwLjQwOS0wLjksMC45LTAuOWMwLjA4MiwwLDAuMzA0LDAsMC41MzgsMC4xNzVsNDcuNjkzLDQ3LjcwNSAgICAgYzMuOTUsMy45MzgsMTAuMTIxLDQuNTQ2LDE0Ljc2LDEuNDQ5YzE2LjY4OC0xMS4xNDksMzYuMTU4LTE3LjAzOSw1Ni4zMDYtMTcuMDM5YzIwLjEzNiwwLDM5LjYxNyw1Ljg5LDU2LjMwNiwxNy4wMzkgICAgIGM0LjY0LDMuMDk3LDEwLjgxLDIuNDg5LDE0Ljc2LTEuNDQ5bDQ3LjY5My00Ny43MDVjMC4yMzQtMC4xNzUsMC40NTYtMC4xNzUsMC41MzgtMC4xNzVjMC40OTEsMCwwLjksMC40MDksMC45LDAuOXY5NS4wODIgICAgIGMwLDcuMzc0LTAuNjc4LDE0Ljc2LTEuOTg3LDIyLjA2NGwtMzUuNjY3LDQuNzMzYy02LjM5MywwLjg0MS0xMC44OTIsNi43Mi0xMC4wNSwxMy4xMjRjMC43ODMsNS44NzgsNS43OTcsMTAuMTQ0LDExLjU3LDEwLjE0NCAgICAgYzAuNTE0LDAsMS4wMjgtMC4wMzUsMS41NTQtMC4wOTRsMjUuNzM0LTMuNDEyYy0xLjY1OSw0LjMzNi0zLjU1Myw4LjYwMS01LjY2OCwxMi43NjJsLTIwLjYxNS0xLjc0MSAgICAgYy02LjQzOS0wLjU0OS0xMi4wODQsNC4yMTktMTIuNjMzLDEwLjY1OGMtMC41MzgsNi40MjgsNC4yMzEsMTIuMDg0LDEwLjY1OCwxMi42MzNsOC40NjEsMC43MTMgICAgIGMtMi4xOTcsMi44MjgtNC40OTksNS41NzQtNi45MTgsOC4yMjdjLTIzLjE3NCwyNS4zMjUtNTMuMjMyLDM5LjI2Ny04NC42MzQsMzkuMjY3UzEwNC4wMjksMjM0LjQ5MSw4MC44NTQsMjA5LjE2NnogICAgICBNNDQ3Ljg3MSw0NDUuNDFsLTUuNTM5LDguNDg0Yy0xNi4wMjIsMjEuNzQ5LTQxLjY3NCwzNC43MzItNjguNjcsMzQuNzMySDI0MC4yODJWNDc1YzAtNy41MTQsNi4xLTEzLjYyNywxMy42MTUtMTMuNjI3aDM0LjU4MSAgICAgYzQuMTI1LDAsNy45MzUtMi4xNzQsMTAuMDUtNS43MjZjMi4xMDQtMy41NDEsMi4xODUtNy45MzUsMC4yMS0xMS41NThjLTYuNzY2LTEyLjQxMS0xMC4zNDMtMjYuNTA1LTEwLjM0My00MC43MzkgICAgIGMwLTQ3LjAyNywzOC4yNS04NS4yNzcsODUuMjY1LTg1LjI3N2M2LjQ1MSwwLDExLjY4Ny01LjIzNiwxMS42ODctMTEuNjg3YzAtNi40NjMtNS4yMzYtMTEuNjg3LTExLjY4Ny0xMS42ODcgICAgIGMtNTkuOTA1LDAtMTA4LjYzOCw0OC43MzMtMTA4LjYzOCwxMDguNjVjMCwxMS44MDMsMS45MjgsMjMuNTI1LDUuNjU2LDM0LjY1MWgtMTYuNzgyYy0xNy4wMjcsMC0zMS4zOSwxMS41Ny0zNS42NzksMjcuMjUzICAgICBoLTExLjUyM3YtNzQuNzEyYzAtNi40NjMtNS4yMzYtMTEuNjg3LTExLjY4Ny0xMS42ODdjLTYuNDYzLDAtMTEuNjg3LDUuMjI0LTExLjY4NywxMS42ODd2ODYuMzk5ICAgICBjMCw2LjQzOS01LjI0NywxMS42ODctMTEuNjg3LDExLjY4N2gtNTkuNTU1di0xMi4xNTRjMC02LjY5Niw1LjQ1OC0xMi4xNDIsMTIuMTU0LTEyLjE0MmgxMi4xMzEgICAgIGM2LjQ1MSwwLDExLjY4Ny01LjIzNiwxMS42ODctMTEuNjg3di03Ny45NDljMC42MzEtMi43ODEsMC4yNjktNS43OTctMS4yNzQtOC40NjFjLTE1Ljg3LTI3LjQwNS0yNC43MDUtNTguNzI1LTI1LjU0Ny05MC41NzEgICAgIGMtMC4xMDUtMy44OC0wLjA4Mi03Ljc2LDAuMDQ3LTExLjYxNmMxNC4xNjQsNS4xMDcsMjkuMDQxLDcuNzYsNDQuMjEsNy43NmMzOC4wNTEsMCw3NC4yMjEtMTYuNjQyLDEwMS44NzItNDYuODYzICAgICBjOS4xNTEtMTAuMDA0LDE2Ljk0Ni0yMS4xMjksMjMuMjMzLTMyLjk5MWwxMTAuOCw2OS45NzlDNDY1LjA1LDMwMi4xMDksNDg1LjQzMSwzODIuNjc3LDQ0Ny44NzEsNDQ1LjQxeiBNNDY2LjY5OCwyOTUuNDEzICAgICBMNDY2LjY5OCwyOTUuNDEzYy0xMC42LTE3LjI4NC0yNC42Ny0zMi44OTgtNDEuOTU1LTQ1Ljc2NXYtMTAzLjhjMC0xMS41Nyw5LjQwOC0yMC45NzcsMjAuOTc3LTIwLjk3NyAgICAgYzUuNTk4LDAsMTAuODY4LDIuMTg1LDE0Ljg0Miw2LjE0N2MzLjk1LDMuOTUsNi4xMzUsOS4yMjEsNi4xMzUsMTQuODNWMjk1LjQxM3oiLz4KCQk8L2c+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSI5My4wMDEiIGN5PSIxMjIuMDY2IiByPSIxMS40MjkiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0xOTkuNzA2LDE2Ni45NTRjLTIuODYzLTUuMDYtOS4yOTEtNi44MjUtMTQuMzM5LTMuOTVjLTEuMDE3LDAuNTczLTIuNjc2LDEuMTgtNC43OCwwLjczNiAgICBjLTIuMzg0LTAuNTAzLTQuMzQ3LTIuMjU2LTUuMDk1LTQuNTY5bC0wLjAxMiwwLjAxMmMtMS4wMTctMy4wODUtMy40MTItNS42NTYtNi43Mi02Ljc0M2MtNS41MjgtMS44LTExLjQ2NSwxLjIxNS0xMy4yNjQsNi43MzIgICAgYy0wLjc2LDIuMzE0LTIuNzExLDQuMDY3LTUuMTA3LDQuNTY5Yy0yLjA5MiwwLjQ0NC0zLjc1MS0wLjE2NC00Ljc4LTAuNzM2Yy01LjA0OS0yLjg3NS0xMS40NjQtMS4xMS0xNC4zMzksMy45NSAgICBjLTIuODYzLDUuMDQ5LTEuMDk5LDExLjQ2NSwzLjk1LDE0LjMzOWM0LjIxOSwyLjM5Niw4Ljk2NCwzLjYzNSwxMy43NTUsMy42MzVjMS45MDUsMCwzLjgzMy0wLjE5OSw1LjczOC0wLjU5NiAgICBjMy45NS0wLjgzLDcuNjA4LTIuNTEzLDEwLjc2My00LjgzOGMzLjE2NywyLjMyNiw2LjgzNyw0LjAwOCwxMC43OTgsNC44MzhjMS44OTMsMC4zOTcsMy44MjIsMC41OTYsNS43MzgsMC41OTYgICAgYzQuNzgsMCw5LjUyNS0xLjIzOSwxMy43NDMtMy42MzVDMjAwLjgwNSwxNzguNDE5LDIwMi41ODEsMTcyLjAwMywxOTkuNzA2LDE2Ni45NTR6Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSIyMzcuOTg1IiBjeT0iMTIyLjA2NiIgcj0iMTEuNDI5Ii8+Cgk8L2c+CjwvZz4KPGcgaWQ9IlNWR0NsZWFuZXJJZF8wIj4KCTxnPgoJCTxwYXRoIGQ9Ik00MzIuMTg3LDM1My40NDhjLTEuNTQzLTYuMjY0LTcuODc3LTEwLjA5Ny0xNC4xNDEtOC41NTVjLTYuMjY0LDEuNTQzLTEwLjA5Nyw3Ljg3Ny04LjU1NSwxNC4xNDEgICAgYzQuODUsMTkuNjU3LDEuODU4LDQwLjEyLTguNDE0LDU3LjYwM2MtMy4yNzIsNS41NjMtMS40MTQsMTIuNzI3LDQuMTYsMTUuOTg3YzEuODU4LDEuMDk5LDMuODkyLDEuNjEzLDUuOTAyLDEuNjEzICAgIGM0LjAwOCwwLDcuOTEyLTIuMDU3LDEwLjA4Ni01Ljc2MUM0MzQuNjA2LDQwNS42OTksNDM4LjQ5OCwzNzkuMDU0LDQzMi4xODcsMzUzLjQ0OHoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxjaXJjbGUgY3g9IjkzLjAwMSIgY3k9IjEyMi4wNjYiIHI9IjExLjQyOSIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPGNpcmNsZSBjeD0iMjM3Ljk4NSIgY3k9IjEyMi4wNjYiIHI9IjExLjQyOSIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTE5OS43MDYsMTY2Ljk1NGMtMi44NjMtNS4wNi05LjI5MS02LjgyNS0xNC4zMzktMy45NWMtMS4wMTcsMC41NzMtMi42NzYsMS4xOC00Ljc4LDAuNzM2ICAgIGMtMi4zODQtMC41MDMtNC4zNDctMi4yNTYtNS4wOTUtNC41NjlsLTAuMDEyLDAuMDEyYy0xLjAxNy0zLjA4NS0zLjQxMi01LjY1Ni02LjcyLTYuNzQzYy01LjUyOC0xLjgtMTEuNDY1LDEuMjE1LTEzLjI2NCw2LjczMiAgICBjLTAuNzYsMi4zMTQtMi43MTEsNC4wNjctNS4xMDcsNC41NjljLTIuMDkyLDAuNDQ0LTMuNzUxLTAuMTY0LTQuNzgtMC43MzZjLTUuMDQ5LTIuODc1LTExLjQ2NC0xLjExLTE0LjMzOSwzLjk1ICAgIGMtMi44NjMsNS4wNDktMS4wOTksMTEuNDY1LDMuOTUsMTQuMzM5YzQuMjE5LDIuMzk2LDguOTY0LDMuNjM1LDEzLjc1NSwzLjYzNWMxLjkwNSwwLDMuODMzLTAuMTk5LDUuNzM4LTAuNTk2ICAgIGMzLjk1LTAuODMsNy42MDgtMi41MTMsMTAuNzYzLTQuODM4YzMuMTY3LDIuMzI2LDYuODM3LDQuMDA4LDEwLjc5OCw0LjgzOGMxLjg5MywwLjM5NywzLjgyMiwwLjU5Niw1LjczOCwwLjU5NiAgICBjNC43OCwwLDkuNTI1LTEuMjM5LDEzLjc0My0zLjYzNUMyMDAuODA1LDE3OC40MTksMjAyLjU4MSwxNzIuMDAzLDE5OS43MDYsMTY2Ljk1NHoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik00MzIuMTg3LDM1My40NDhjLTEuNTQzLTYuMjY0LTcuODc3LTEwLjA5Ny0xNC4xNDEtOC41NTVjLTYuMjY0LDEuNTQzLTEwLjA5Nyw3Ljg3Ny04LjU1NSwxNC4xNDEgICAgYzQuODUsMTkuNjU3LDEuODU4LDQwLjEyLTguNDE0LDU3LjYwM2MtMy4yNzIsNS41NjMtMS40MTQsMTIuNzI3LDQuMTYsMTUuOTg3YzEuODU4LDEuMDk5LDMuODkyLDEuNjEzLDUuOTAyLDEuNjEzICAgIGM0LjAwOCwwLDcuOTEyLTIuMDU3LDEwLjA4Ni01Ljc2MUM0MzQuNjA2LDQwNS42OTksNDM4LjQ5OCwzNzkuMDU0LDQzMi4xODcsMzUzLjQ0OHoiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4=",
    },
    bunny: {
      id: "bunny",
      name: "Bunny",
      url: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8cGF0aCAlJSUlIGQ9Ik00NzIuMzQ1LDM1NS4wODFjLTguNzI5LTY0Ljk5NS02NC41NS0xMTUuMjcyLTEzMS44ODMtMTE1LjI3MmgtMTE0LjMzYzEuODk0LTQuMzQ5LDMuNjE4LTguODAzLDUuMTIxLTEzLjM2MyAgICBjMS45NzktNS45NjcsMi45NzMtMTIuMTk5LDIuOTczLTE4LjUyNmMwLTQuNzkzLTAuNTcxLTkuNTk2LTEuNjkzLTE0LjM0N2MxMy43MTItOS4wNzgsMjcuNzItMjAuNjUzLDQwLjkzNS0zMy44NTcgICAgYzIwLjE1NS0yMC4xNjYsMzYuMzk2LTQyLjA1Nyw0NS43MTctNjEuNjQxYzEzLjk1NS0yOS4zMTgsOC4yMjEtNDQuMTMsMC45NjMtNTEuMzk5Yy03LjI2OS03LjI1OC0yMi4wOTItMTMuMDAzLTUxLjQwOSwwLjk1MiAgICBjLTMuMDM2LDEuNDM5LTYuMTM3LDMuMDY4LTkuMjY4LDQuODQ2Yy0wLjE1OS0yNC4zNTYtNy4zMzItNDAuMDY3LTIwLjkyOC00NS4wMDhjLTI4Ljk2OS0xMC40ODUtNjMuNDgyLDM3LjQyMi04Mi42MTEsOTAuMTg2ICAgIGMtNS4yNjksMTQuNTI3LTkuMzMyLDI5LjMwNy0xMS45MzUsNDMuMjQyYy01OS4xNTQsNy4xNDItMTA3LjUwNiw0NS41MjctMTI2LjEzOCwxMDEuODc3Yy0xLjk3OSw1Ljk2Ny0yLjk3MywxMi4xOTktMi45NzMsMTguNTI2ICAgIGMwLDI2LjkxNiwxNy41MjEsNTEuOTkxLDQyLjM1Myw2Mi43M2MtNi4xNDcsMTUuNS05LjI1OCwzMS44ODktOS4yNTgsNDguODdjMCwyMC4xODcsNC41MTgsMzkuODQ1LDEzLjE2Miw1Ny43NThIMzcuNjY2ICAgIEMxNi44OTcsNDMwLjY1NiwwLDQ0Ny41NTIsMCw0NjguMzIxYzAsMjAuNzU4LDE2Ljg5NywzNy42NTUsMzcuNjY2LDM3LjY1NWwzMDIuNzk3LDAuMDExYzM1LjUzOSwwLDY4Ljk1Mi0xMy44MzksOTQuMTExLTM4Ljk3OCAgICBjNi44ODgtNi44OTgsMTIuOTE5LTE0LjQxLDE4LjA1LTIyLjQyYzQuMzE3LDEuMzEyLDguODI0LDIuMDIxLDEzLjM4NCwyLjAyMWMyNS4zNjEsMCw0NS45OTItMjAuNjMxLDQ1Ljk5Mi00NS45ODIgICAgQzUxMiwzNzcuNDE2LDQ5NC43MTIsMzU4LjE4MSw0NzIuMzQ1LDM1NS4wODF6IE0xNzUuODIzLDEwNC44NjhjMjAuNjQyLTU2LjkzMiw0OC4yNDYtODAuMTM1LDU1LjQ5My03Ny41MTEgICAgYzMuMzY1LDEuMjE3LDguOTkzLDEyLjQ5NSw2LjI2MywzOS40OTZjLTEwLjI1Miw3LjY1LTIwLjU2OCwxNi42LTMwLjQ3MSwyNi41MDRjLTE1LjA4NywxNS4wNzctMjcuODksMzEuMDExLTM3LjM5MSw0Ni40NDcgICAgYy0xLjAxNi0wLjA2My0zLjYxOC0wLjEyNy0zLjkxNS0wLjEyN0MxNjguMTk0LDEyOC4zODgsMTcxLjU4LDExNi41NTksMTc1LjgyMywxMDQuODY4eiBNNDM4LjU1Miw0MjYuODc4ICAgIGMtNS4wMzYsOS4xMi0xMS4zODQsMTcuNTk1LTE4Ljk0OSwyNS4xN2MtMjEuMTUsMjEuMTM5LTQ5LjI1MSwzMi43NzgtNzkuMTQsMzIuNzc4SDIyNC4xNjR2LTAuMDExICAgIGMtOS4wOTksMC0xNi41MDUtNy4zOTYtMTYuNTA1LTE2LjQ5NWMwLTkuMTEsNy40MDYtMTYuNTA1LDE2LjUwNS0xNi41MDVoNDcuODg2YzUuODQsMCwxMC41OC00Ljc0LDEwLjU4LTEwLjU4di0xNy45MjMgICAgYzAtMjkuNTI5LDI0LjAxNy01My41NDcsNTMuNTQ3LTUzLjU0N2gxMy45ODdjNS44NCwwLDEwLjU4LTQuNzQsMTAuNTgtMTAuNThjMC01Ljg1MS00Ljc0LTEwLjU4LTEwLjU4LTEwLjU4aC0xMy45ODcgICAgYy00MS4yLDAtNzQuNzA3LDMzLjUwOC03NC43MDcsNzQuNzA3djcuMzQzaC0zNy4zMDZjLTIwLjc2OSwwLTM3LjY2NiwxNi44OTctMzcuNjY2LDM3LjY2NmMwLDUuOTE0LDEuMzc1LDExLjUxMSwzLjgyLDE2LjQ5NSAgICBIMzcuNjY2Yy05LjA5OSwwLTE2LjUwNS03LjM5Ni0xNi41MDUtMTYuNDk1YzAtOS4xMSw3LjQwNi0xNi41MDUsMTYuNTA1LTE2LjUwNWg0MS43MThjMi4wMzEsMCw0LjA4NC0wLjU4Miw1LjkwNC0xLjgwOSAgICBjNC44NDYtMy4yNTksNi4xMjYtOS44NCwyLjg2Ny0xNC42ODVjLTEyLjQ0Mi0xOC40NjMtMTkuMDEzLTQwLjA1Ny0xOS4wMTMtNjIuNDI0YzAtMTcuNzU0LDQuMDMxLTM0LjczNSwxMS45ODctNTAuNDU3ICAgIGMyLjY0NS01LjIwNiwwLjU1LTExLjU3NS00LjY1NS0xNC4yMmMtMC44MTUtMC40MDItMS42NTEtMC42ODgtMi40OTctMC44NzhjLTEwLjYzMy0yLjM1OS0yMC4xMTMtOC41OTEtMjYuOTM3LTE2Ljg3NiAgICBjLTYuODI0LTguMjg0LTEwLjk5My0xOC42MjEtMTAuOTkzLTI5LjE3YzAtNC4wNjMsMC42MzUtOC4wNzMsMS45MDQtMTEuODkyYzguNzYtMjYuNDgyLDI1LjIwMi00OC43ODYsNDcuNTQ4LTY0LjQ5NyAgICBjMjIuNDItMTUuNzQzLDQ5LjYxMS0yNC4wNyw3OC42NTQtMjQuMDdjMC43NTEsMCw2Ljk0MSwwLjI3NSw5LjMsMC42OThjNC41NSwwLjgwNCw4LjkzLTEuNDI4LDExLjA2Ny01LjIzN2wwLjAxMSwwLjAxMSAgICBjOC42OTctMTUuNDI2LDIyLjAyOC0zMi40NzEsMzcuNTM5LTQ3Ljk5MmMxMC4yODQtMTAuMjg0LDIwLjk1OS0xOS40MDQsMzEuNDEzLTI2LjkwNmMwLjIyMi0wLjE0OCwwLjQzNC0wLjI5NiwwLjYzNS0wLjQ1NSAgICBjOC4xNDctNS44MDksMTYuMTU2LTEwLjYyMywyMy43MjEtMTQuMjJjMTYuMTI0LTcuNjcxLDI1LjE5Mi03LjI1OCwyNy4zMzktNS4xYzIuMTU4LDIuMTU4LDIuNTgyLDExLjIxNS01LjEsMjcuMzUgICAgYy04LjMxNiwxNy40NTctMjMuMDc2LDM3LjI2NC00MS41Nyw1NS43NThjLTEzLjc1NCwxMy43NTQtMjguMzQ1LDI1LjU0MS00Mi4zLDM0LjE2NGwwLjA5NSwwLjE1OSAgICBjLTQuMjIyLDEuNjA4LTYuODE0LDUuNjI5LTYuODE0LDkuODkzYzAsMS4yNDgsMC4yMjIsMi41MTgsMC42ODgsMy43NTZjMS45MTUsNS4wMzYsMi44ODgsMTAuMTQ2LDIuODg4LDE1LjIwNCAgICBjMCw0LjA2My0wLjY0NSw4LjA3My0xLjkwNCwxMS44OTJjLTIuOTQxLDguOTA5LTYuNzcxLDE3LjM4My0xMS4zODQsMjUuMjEzYy0yLjk2Myw1LjAzNi0xLjI4LDExLjUyMiwzLjc1NiwxNC40ODQgICAgYzEuNjgyLDAuOTk1LDMuNTM0LDEuNDYsNS4zNTQsMS40NmgxMzEuNTc2YzYxLjcxNSwwLDExMS45MTgsNTAuMjE0LDExMS45MTgsMTExLjkyOSAgICBDNDUyLjM4LDM5OS4wODQsNDM4LjcxMSw0MjYuNTQsNDM4LjU1Miw0MjYuODc4eiBNNDY2LjAwOCw0MjUuNDVjLTEuMDQ3LDAtMi4wOTUtMC4wNzQtMy4xMzItMC4yMDEgICAgYzYuNDc1LTE1LjEzLDEwLjA5NC0zMS40NDUsMTAuNjAxLTQ4LjMxYzEwLjA1MSwzLjE4NSwxNy4zNjIsMTIuNTkxLDE3LjM2MiwyMy42ODlDNDkwLjgzOSw0MTQuMzIsNDc5LjY5OCw0MjUuNDUsNDY2LjAwOCw0MjUuNDUgICAgeiIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPGNpcmNsZSAlJSUlIGN4PSIxMDIuMzExIiBjeT0iMjIzLjQ5NyIgcj0iMTIuODIzIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCAlJSUlIGQ9Ik0zNDAuNDU3LDI3Ni44NDFjLTUuODQyLDAtMTAuNTgsNC43MzgtMTAuNTgsMTAuNThjMCw1Ljg0Miw0LjczOCwxMC41OCwxMC41OCwxMC41OCAgICBjNDEuMjk3LDAsNzQuODk1LDMzLjU5OCw3NC44OTUsNzQuODk0YzAsNS44NDIsNC43MzgsMTAuNTgsMTAuNTgsMTAuNThzMTAuNTgtNC43MzgsMTAuNTgtMTAuNTggICAgQzQzNi41MTIsMzE5LjkzMSwzOTMuNDIzLDI3Ni44NDEsMzQwLjQ1NywyNzYuODQxeiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPg=="
      //url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDcyLjM0NSwzNTUuMDgxYy04LjcyOS02NC45OTUtNjQuNTUtMTE1LjI3Mi0xMzEuODgzLTExNS4yNzJoLTExNC4zM2MxLjg5NC00LjM0OSwzLjYxOC04LjgwMyw1LjEyMS0xMy4zNjMgICAgYzEuOTc5LTUuOTY3LDIuOTczLTEyLjE5OSwyLjk3My0xOC41MjZjMC00Ljc5My0wLjU3MS05LjU5Ni0xLjY5My0xNC4zNDdjMTMuNzEyLTkuMDc4LDI3LjcyLTIwLjY1Myw0MC45MzUtMzMuODU3ICAgIGMyMC4xNTUtMjAuMTY2LDM2LjM5Ni00Mi4wNTcsNDUuNzE3LTYxLjY0MWMxMy45NTUtMjkuMzE4LDguMjIxLTQ0LjEzLDAuOTYzLTUxLjM5OWMtNy4yNjktNy4yNTgtMjIuMDkyLTEzLjAwMy01MS40MDksMC45NTIgICAgYy0zLjAzNiwxLjQzOS02LjEzNywzLjA2OC05LjI2OCw0Ljg0NmMtMC4xNTktMjQuMzU2LTcuMzMyLTQwLjA2Ny0yMC45MjgtNDUuMDA4Yy0yOC45NjktMTAuNDg1LTYzLjQ4MiwzNy40MjItODIuNjExLDkwLjE4NiAgICBjLTUuMjY5LDE0LjUyNy05LjMzMiwyOS4zMDctMTEuOTM1LDQzLjI0MmMtNTkuMTU0LDcuMTQyLTEwNy41MDYsNDUuNTI3LTEyNi4xMzgsMTAxLjg3N2MtMS45NzksNS45NjctMi45NzMsMTIuMTk5LTIuOTczLDE4LjUyNiAgICBjMCwyNi45MTYsMTcuNTIxLDUxLjk5MSw0Mi4zNTMsNjIuNzNjLTYuMTQ3LDE1LjUtOS4yNTgsMzEuODg5LTkuMjU4LDQ4Ljg3YzAsMjAuMTg3LDQuNTE4LDM5Ljg0NSwxMy4xNjIsNTcuNzU4SDM3LjY2NiAgICBDMTYuODk3LDQzMC42NTYsMCw0NDcuNTUyLDAsNDY4LjMyMWMwLDIwLjc1OCwxNi44OTcsMzcuNjU1LDM3LjY2NiwzNy42NTVsMzAyLjc5NywwLjAxMWMzNS41MzksMCw2OC45NTItMTMuODM5LDk0LjExMS0zOC45NzggICAgYzYuODg4LTYuODk4LDEyLjkxOS0xNC40MSwxOC4wNS0yMi40MmM0LjMxNywxLjMxMiw4LjgyNCwyLjAyMSwxMy4zODQsMi4wMjFjMjUuMzYxLDAsNDUuOTkyLTIwLjYzMSw0NS45OTItNDUuOTgyICAgIEM1MTIsMzc3LjQxNiw0OTQuNzEyLDM1OC4xODEsNDcyLjM0NSwzNTUuMDgxeiBNMTc1LjgyMywxMDQuODY4YzIwLjY0Mi01Ni45MzIsNDguMjQ2LTgwLjEzNSw1NS40OTMtNzcuNTExICAgIGMzLjM2NSwxLjIxNyw4Ljk5MywxMi40OTUsNi4yNjMsMzkuNDk2Yy0xMC4yNTIsNy42NS0yMC41NjgsMTYuNi0zMC40NzEsMjYuNTA0Yy0xNS4wODcsMTUuMDc3LTI3Ljg5LDMxLjAxMS0zNy4zOTEsNDYuNDQ3ICAgIGMtMS4wMTYtMC4wNjMtMy42MTgtMC4xMjctMy45MTUtMC4xMjdDMTY4LjE5NCwxMjguMzg4LDE3MS41OCwxMTYuNTU5LDE3NS44MjMsMTA0Ljg2OHogTTQzOC41NTIsNDI2Ljg3OCAgICBjLTUuMDM2LDkuMTItMTEuMzg0LDE3LjU5NS0xOC45NDksMjUuMTdjLTIxLjE1LDIxLjEzOS00OS4yNTEsMzIuNzc4LTc5LjE0LDMyLjc3OEgyMjQuMTY0di0wLjAxMSAgICBjLTkuMDk5LDAtMTYuNTA1LTcuMzk2LTE2LjUwNS0xNi40OTVjMC05LjExLDcuNDA2LTE2LjUwNSwxNi41MDUtMTYuNTA1aDQ3Ljg4NmM1Ljg0LDAsMTAuNTgtNC43NCwxMC41OC0xMC41OHYtMTcuOTIzICAgIGMwLTI5LjUyOSwyNC4wMTctNTMuNTQ3LDUzLjU0Ny01My41NDdoMTMuOTg3YzUuODQsMCwxMC41OC00Ljc0LDEwLjU4LTEwLjU4YzAtNS44NTEtNC43NC0xMC41OC0xMC41OC0xMC41OGgtMTMuOTg3ICAgIGMtNDEuMiwwLTc0LjcwNywzMy41MDgtNzQuNzA3LDc0LjcwN3Y3LjM0M2gtMzcuMzA2Yy0yMC43NjksMC0zNy42NjYsMTYuODk3LTM3LjY2NiwzNy42NjZjMCw1LjkxNCwxLjM3NSwxMS41MTEsMy44MiwxNi40OTUgICAgSDM3LjY2NmMtOS4wOTksMC0xNi41MDUtNy4zOTYtMTYuNTA1LTE2LjQ5NWMwLTkuMTEsNy40MDYtMTYuNTA1LDE2LjUwNS0xNi41MDVoNDEuNzE4YzIuMDMxLDAsNC4wODQtMC41ODIsNS45MDQtMS44MDkgICAgYzQuODQ2LTMuMjU5LDYuMTI2LTkuODQsMi44NjctMTQuNjg1Yy0xMi40NDItMTguNDYzLTE5LjAxMy00MC4wNTctMTkuMDEzLTYyLjQyNGMwLTE3Ljc1NCw0LjAzMS0zNC43MzUsMTEuOTg3LTUwLjQ1NyAgICBjMi42NDUtNS4yMDYsMC41NS0xMS41NzUtNC42NTUtMTQuMjJjLTAuODE1LTAuNDAyLTEuNjUxLTAuNjg4LTIuNDk3LTAuODc4Yy0xMC42MzMtMi4zNTktMjAuMTEzLTguNTkxLTI2LjkzNy0xNi44NzYgICAgYy02LjgyNC04LjI4NC0xMC45OTMtMTguNjIxLTEwLjk5My0yOS4xN2MwLTQuMDYzLDAuNjM1LTguMDczLDEuOTA0LTExLjg5MmM4Ljc2LTI2LjQ4MiwyNS4yMDItNDguNzg2LDQ3LjU0OC02NC40OTcgICAgYzIyLjQyLTE1Ljc0Myw0OS42MTEtMjQuMDcsNzguNjU0LTI0LjA3YzAuNzUxLDAsNi45NDEsMC4yNzUsOS4zLDAuNjk4YzQuNTUsMC44MDQsOC45My0xLjQyOCwxMS4wNjctNS4yMzdsMC4wMTEsMC4wMTEgICAgYzguNjk3LTE1LjQyNiwyMi4wMjgtMzIuNDcxLDM3LjUzOS00Ny45OTJjMTAuMjg0LTEwLjI4NCwyMC45NTktMTkuNDA0LDMxLjQxMy0yNi45MDZjMC4yMjItMC4xNDgsMC40MzQtMC4yOTYsMC42MzUtMC40NTUgICAgYzguMTQ3LTUuODA5LDE2LjE1Ni0xMC42MjMsMjMuNzIxLTE0LjIyYzE2LjEyNC03LjY3MSwyNS4xOTItNy4yNTgsMjcuMzM5LTUuMWMyLjE1OCwyLjE1OCwyLjU4MiwxMS4yMTUtNS4xLDI3LjM1ICAgIGMtOC4zMTYsMTcuNDU3LTIzLjA3NiwzNy4yNjQtNDEuNTcsNTUuNzU4Yy0xMy43NTQsMTMuNzU0LTI4LjM0NSwyNS41NDEtNDIuMywzNC4xNjRsMC4wOTUsMC4xNTkgICAgYy00LjIyMiwxLjYwOC02LjgxNCw1LjYyOS02LjgxNCw5Ljg5M2MwLDEuMjQ4LDAuMjIyLDIuNTE4LDAuNjg4LDMuNzU2YzEuOTE1LDUuMDM2LDIuODg4LDEwLjE0NiwyLjg4OCwxNS4yMDQgICAgYzAsNC4wNjMtMC42NDUsOC4wNzMtMS45MDQsMTEuODkyYy0yLjk0MSw4LjkwOS02Ljc3MSwxNy4zODMtMTEuMzg0LDI1LjIxM2MtMi45NjMsNS4wMzYtMS4yOCwxMS41MjIsMy43NTYsMTQuNDg0ICAgIGMxLjY4MiwwLjk5NSwzLjUzNCwxLjQ2LDUuMzU0LDEuNDZoMTMxLjU3NmM2MS43MTUsMCwxMTEuOTE4LDUwLjIxNCwxMTEuOTE4LDExMS45MjkgICAgQzQ1Mi4zOCwzOTkuMDg0LDQzOC43MTEsNDI2LjU0LDQzOC41NTIsNDI2Ljg3OHogTTQ2Ni4wMDgsNDI1LjQ1Yy0xLjA0NywwLTIuMDk1LTAuMDc0LTMuMTMyLTAuMjAxICAgIGM2LjQ3NS0xNS4xMywxMC4wOTQtMzEuNDQ1LDEwLjYwMS00OC4zMWMxMC4wNTEsMy4xODUsMTcuMzYyLDEyLjU5MSwxNy4zNjIsMjMuNjg5QzQ5MC44MzksNDE0LjMyLDQ3OS42OTgsNDI1LjQ1LDQ2Ni4wMDgsNDI1LjQ1ICAgIHoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxjaXJjbGUgY3g9IjEwMi4zMTEiIGN5PSIyMjMuNDk3IiByPSIxMi44MjMiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0zNDAuNDU3LDI3Ni44NDFjLTUuODQyLDAtMTAuNTgsNC43MzgtMTAuNTgsMTAuNThjMCw1Ljg0Miw0LjczOCwxMC41OCwxMC41OCwxMC41OCAgICBjNDEuMjk3LDAsNzQuODk1LDMzLjU5OCw3NC44OTUsNzQuODk0YzAsNS44NDIsNC43MzgsMTAuNTgsMTAuNTgsMTAuNThzMTAuNTgtNC43MzgsMTAuNTgtMTAuNTggICAgQzQzNi41MTIsMzE5LjkzMSwzOTMuNDIzLDI3Ni44NDEsMzQwLjQ1NywyNzYuODQxeiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPg==",
    },
    manatee: {
      id: "manatee",
      name: "Manatee",
      url: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8cGF0aCAlJSUlIGQ9Ik01MTEuOTI2LDE4OC44NDljLTAuNjMyLTE3Ljc2Mi04LjAyMy0zNC4zNjUtMjAuODA0LTQ2Ljc2OGMtMTIuODU1LTEyLjQ0NS0yOS43OTYtMTkuMzA5LTQ3LjY5NC0xOS4zMDloLTczLjc3MyAgICBjLTEzLjc5MiwwLTI2Ljk1Myw0LjAzMi0zOC4yODIsMTEuNjk3Yy00Mi44NzIsMC4zNjgtODQuODI4LDcuOTM4LTEyNC43NTIsMjIuNTQxYy0zNS44NzEsMTMuMTI5LTY5LjI3NywzMS42MjgtOTkuNTE1LDU1LjAyMiAgICBjLTExLjU4MS0xNS45OTMtMjcuNzg1LTI1LjI0Ny00NS4wMi0yNS4yNDdjLTE3LjIyNSwwLTMzLjE4Niw4LjkyOC00NC45NTcsMjUuMTMxQzYuMDg1LDIyNy4xMiwwLDI0Ny4xNjcsMCwyNjguMzYxICAgIGMwLDIxLjE4Myw2LjA4NSw0MS4yMjksMTcuMTMsNTYuNDMzYzExLjc3MSwxNi4yMDMsMjcuNzMyLDI1LjEyMSw0NC45NTcsMjUuMTIxYzE4LjEyLDAsMzQuODkxLTEwLjA0NCw0Ni41MzYtMjcuMzg1ICAgIGMyMS4xODMsMTQuMDAzLDQ1LjY1MSwyMS4zNTIsNzEuNDI1LDIxLjM1MmgxMTUuNjQ1YzMuMjk1LDE2LjQ0NSw3LjU1OSwzMS4yOTEsMTkuODU3LDM5LjQ3MSAgICBjNS44ODUsMy45MTcsMTIuOTkyLDUuODc1LDIxLjQ4OSw1Ljg3NWM0LjcyNywwLDkuODg2LTAuNjExLDE1LjQ5OC0xLjgxMWMxNS43My0zLjM1OSwyNi4yMjYtOS41MTgsMzIuMTAxLTE4LjgxNCAgICBjNy40MTItMTEuNzcxLDUuOTE3LTI2LjAxNiwyLjYxMS00MS4zMDNjMjEuODM2LTEyLjUxOCwzOC4xMDMtMzIuMjkxLDQ2LjE1Ny01NS43MTdjOC4zMDcsNi4xMDcsMTguNDY3LDkuNTM5LDI5LjIxNiw5LjUzOSAgICBjMjcuMjI3LDAsNDkuMzc5LTIyLjE1Miw0OS4zNzktNDkuMzc5QzUxMiwyMzEuNzQyLDUxMS45NjgsMTg5LjY3MSw1MTEuOTI2LDE4OC44NDl6IE00NjIuNjIxLDI2MC40MTEgICAgYy05Ljg4NiwwLTE4LjkwOS01LjAzMy0yNC4xNjMtMTMuMjc2Yy0wLjE1OC0wLjI1My00LjI0My0xMS4wNjUtNC4yNDMtMjAuNDE1YzAtNS43MjctMi44NjQtMTAuOTkyLTguNTA3LTExLjkyOSAgICBjLTUuNjQzLTAuOTQ4LTEwLjk4MSwyLjg2NC0xMS45MTgsOC40OTZjLTAuNDUzLDIuNjk1LTAuNjg0LDUuNDY0LTAuNjg0LDguMjEyYzAsNi44NzUsMS40MTEsMTMuNTgyLDQuMTE3LDE5Ljc3MiAgICBjLTMuNjg1LDIyLjQ3OC0xNi4zMyw0Mi4wODItMzQuOTIzLDU0LjY5NWMtMC4xNTgtMC43MDUtMy45OC0yMi41OTQtMTguNDM1LTQ0LjI3MmMtMy4xNjktNC43NTktOS44MzQtNS42NzUtMTQuNDY2LTIuMzI3ICAgIGMtNC42MzMsMy4zNDgtNS42NzUsOS44MzQtMi4zMjcsMTQuNDY2YzYuNTQ5LDkuMDU1LDExLjY5NywyMS4yNTcsMTQuNDk4LDM0LjM2NWMwLjk3OSw0LjU4LDIuMDMyLDguOTYsMy4wNDMsMTMuMjAzICAgIGMzLjczOCwxNS41ODIsNi45NywyOS4wNDgsMi40OTUsMzYuMTQ0Yy0yLjY5NSw0LjI3NS05LjA1NSw3LjUwNy0xOC44OTksOS42MTJjLTkuODQ0LDIuMTA2LTE2Ljk3MiwxLjc0OC0yMS4xODMtMS4wNTMgICAgYy02Ljk4LTQuNjQzLTkuNTM5LTE4LjI1Ni0xMi40OTctMzQuMDA3Yy0wLjgxMS00LjI4NS0xLjY0Mi04LjcxOC0yLjYyMi0xMy4yOTdjLTIuODAxLTEzLjA5Ny0zLjA4NS0yNi4zNDItMC44MTEtMzcuMjgxICAgIGMxLjE1OC01LjYwMS0yLjQzMi0xMS4wODYtOC4wMzMtMTIuMjQ1Yy01LjYwMS0xLjE2OS0xMS4wODYsMi40MzItMTIuMjU1LDguMDMzYy0yLjg4NSwxMy44ODctMi41OSwyOS43MzIsMC44NDIsNDUuODMxICAgIGMwLDAuMDEsMC4wMTEsMC4wMjEsMC4wMTEsMC4wMzJIMTgwLjA0OGMtMjUuMDc5LDAtNDguNjczLTguMjY1LTY4LjIyNS0yMy45Yy0wLjYxMS0wLjQ4NC0xLjI3NC0wLjkxNi0yLjAxMS0xLjI2MyAgICBjLTUuMTU5LTIuNDY0LTExLjM1LTAuMjc0LTEzLjgwMyw0Ljg5NmMtNy44NDQsMTYuNDY3LTIwLjUzMSwyNi4zLTMzLjkyMywyNi4zYy0xMC40MTMsMC0yMC40MjUtNS44OTYtMjguMTk1LTE2LjU4MiAgICBjLTguNDk3LTExLjY5Ny0xMy4xODItMjcuNDE2LTEzLjE4Mi00NC4yNjJjMC0xNi44NTYsNC42ODUtMzIuNTc1LDEzLjE4Mi00NC4yNzJjNy43Ny0xMC42OTcsMTcuNzgzLTE2LjU4MiwyOC4xOTUtMTYuNTgyICAgIGMxMi44NDUsMCwyNS4yMTYsOS4yMTIsMzMuMTAyLDI0LjYzN2MyLjYxMSw1LjA5Niw4Ljg0NCw3LjEwNywxMy45NCw0LjUwNmMwLjY4NC0wLjM0NywxLjg4NS0xLjIzMiwxLjg4NS0xLjIzMiAgICBjMzAuNzk2LTI1LjQ0Nyw2NS4zNjEtNDUuMjcyLDEwMi43MzctNTguOTM4YzM4LjY1LTE0LjE1LDc5LjM1My0yMS4zMzEsMTIwLjk1MS0yMS4zMzFjMi4zMzcsMCw0LjQ4NS0wLjc3OSw2LjIxMi0yLjA4NSAgICBsMC4wMSwwLjAxMWM4LjMzOS02LjI2NCwxOC4yODgtOS41ODEsMjguNzMyLTkuNTgxaDczLjc3M2MyNS45MzIsMCw0Ni45MjUsMjAuMjg4LDQ3LjgxLDQ2LjE4OCAgICBjMCwwLjA5NSwwLjA1Myw0Mi4wNjEsMC4wNTMsNDIuMDYxQzQ5MS4yOTEsMjQ3LjU0Niw0NzguNDM1LDI2MC40MTEsNDYyLjYyMSwyNjAuNDExeiIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPGNpcmNsZSAlJSUlIGN4PSI0MjUuNTYxIiBjeT0iMTY2LjE5MiIgcj0iMTEuODcxIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCAlJSUlIGQ9Ik0yOTguNDM5LDE5Mi45NGMtMC45MDMtNS42NDktNi4yMDMtOS40OTgtMTEuODY1LTguNTkxYy0zNi40NDcsNS44MzQtNzEuMTM0LDE4LjA5LTEwMy4wOTgsMzYuNDMxICAgIGMtNC45NjMsMi44NDgtNi42NzYsOS4xNzgtMy44MjksMTQuMTRjMS45MTUsMy4zMzgsNS40MDQsNS4yMDUsOC45OTUsNS4yMDVjMS43NDgsMCwzLjUyLTAuNDQzLDUuMTQ0LTEuMzc2ICAgIGMyOS43ODEtMTcuMDg4LDYyLjEwMS0yOC41MDgsOTYuMDYyLTMzLjk0NEMyOTUuNDk4LDIwMy45MDEsMjk5LjM0NCwxOTguNTg4LDI5OC40MzksMTkyLjk0eiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPg=="
      //url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNTExLjkyNiwxODguODQ5Yy0wLjYzMi0xNy43NjItOC4wMjMtMzQuMzY1LTIwLjgwNC00Ni43NjhjLTEyLjg1NS0xMi40NDUtMjkuNzk2LTE5LjMwOS00Ny42OTQtMTkuMzA5aC03My43NzMgICAgYy0xMy43OTIsMC0yNi45NTMsNC4wMzItMzguMjgyLDExLjY5N2MtNDIuODcyLDAuMzY4LTg0LjgyOCw3LjkzOC0xMjQuNzUyLDIyLjU0MWMtMzUuODcxLDEzLjEyOS02OS4yNzcsMzEuNjI4LTk5LjUxNSw1NS4wMjIgICAgYy0xMS41ODEtMTUuOTkzLTI3Ljc4NS0yNS4yNDctNDUuMDItMjUuMjQ3Yy0xNy4yMjUsMC0zMy4xODYsOC45MjgtNDQuOTU3LDI1LjEzMUM2LjA4NSwyMjcuMTIsMCwyNDcuMTY3LDAsMjY4LjM2MSAgICBjMCwyMS4xODMsNi4wODUsNDEuMjI5LDE3LjEzLDU2LjQzM2MxMS43NzEsMTYuMjAzLDI3LjczMiwyNS4xMjEsNDQuOTU3LDI1LjEyMWMxOC4xMiwwLDM0Ljg5MS0xMC4wNDQsNDYuNTM2LTI3LjM4NSAgICBjMjEuMTgzLDE0LjAwMyw0NS42NTEsMjEuMzUyLDcxLjQyNSwyMS4zNTJoMTE1LjY0NWMzLjI5NSwxNi40NDUsNy41NTksMzEuMjkxLDE5Ljg1NywzOS40NzEgICAgYzUuODg1LDMuOTE3LDEyLjk5Miw1Ljg3NSwyMS40ODksNS44NzVjNC43MjcsMCw5Ljg4Ni0wLjYxMSwxNS40OTgtMS44MTFjMTUuNzMtMy4zNTksMjYuMjI2LTkuNTE4LDMyLjEwMS0xOC44MTQgICAgYzcuNDEyLTExLjc3MSw1LjkxNy0yNi4wMTYsMi42MTEtNDEuMzAzYzIxLjgzNi0xMi41MTgsMzguMTAzLTMyLjI5MSw0Ni4xNTctNTUuNzE3YzguMzA3LDYuMTA3LDE4LjQ2Nyw5LjUzOSwyOS4yMTYsOS41MzkgICAgYzI3LjIyNywwLDQ5LjM3OS0yMi4xNTIsNDkuMzc5LTQ5LjM3OUM1MTIsMjMxLjc0Miw1MTEuOTY4LDE4OS42NzEsNTExLjkyNiwxODguODQ5eiBNNDYyLjYyMSwyNjAuNDExICAgIGMtOS44ODYsMC0xOC45MDktNS4wMzMtMjQuMTYzLTEzLjI3NmMtMC4xNTgtMC4yNTMtNC4yNDMtMTEuMDY1LTQuMjQzLTIwLjQxNWMwLTUuNzI3LTIuODY0LTEwLjk5Mi04LjUwNy0xMS45MjkgICAgYy01LjY0My0wLjk0OC0xMC45ODEsMi44NjQtMTEuOTE4LDguNDk2Yy0wLjQ1MywyLjY5NS0wLjY4NCw1LjQ2NC0wLjY4NCw4LjIxMmMwLDYuODc1LDEuNDExLDEzLjU4Miw0LjExNywxOS43NzIgICAgYy0zLjY4NSwyMi40NzgtMTYuMzMsNDIuMDgyLTM0LjkyMyw1NC42OTVjLTAuMTU4LTAuNzA1LTMuOTgtMjIuNTk0LTE4LjQzNS00NC4yNzJjLTMuMTY5LTQuNzU5LTkuODM0LTUuNjc1LTE0LjQ2Ni0yLjMyNyAgICBjLTQuNjMzLDMuMzQ4LTUuNjc1LDkuODM0LTIuMzI3LDE0LjQ2NmM2LjU0OSw5LjA1NSwxMS42OTcsMjEuMjU3LDE0LjQ5OCwzNC4zNjVjMC45NzksNC41OCwyLjAzMiw4Ljk2LDMuMDQzLDEzLjIwMyAgICBjMy43MzgsMTUuNTgyLDYuOTcsMjkuMDQ4LDIuNDk1LDM2LjE0NGMtMi42OTUsNC4yNzUtOS4wNTUsNy41MDctMTguODk5LDkuNjEyYy05Ljg0NCwyLjEwNi0xNi45NzIsMS43NDgtMjEuMTgzLTEuMDUzICAgIGMtNi45OC00LjY0My05LjUzOS0xOC4yNTYtMTIuNDk3LTM0LjAwN2MtMC44MTEtNC4yODUtMS42NDItOC43MTgtMi42MjItMTMuMjk3Yy0yLjgwMS0xMy4wOTctMy4wODUtMjYuMzQyLTAuODExLTM3LjI4MSAgICBjMS4xNTgtNS42MDEtMi40MzItMTEuMDg2LTguMDMzLTEyLjI0NWMtNS42MDEtMS4xNjktMTEuMDg2LDIuNDMyLTEyLjI1NSw4LjAzM2MtMi44ODUsMTMuODg3LTIuNTksMjkuNzMyLDAuODQyLDQ1LjgzMSAgICBjMCwwLjAxLDAuMDExLDAuMDIxLDAuMDExLDAuMDMySDE4MC4wNDhjLTI1LjA3OSwwLTQ4LjY3My04LjI2NS02OC4yMjUtMjMuOWMtMC42MTEtMC40ODQtMS4yNzQtMC45MTYtMi4wMTEtMS4yNjMgICAgYy01LjE1OS0yLjQ2NC0xMS4zNS0wLjI3NC0xMy44MDMsNC44OTZjLTcuODQ0LDE2LjQ2Ny0yMC41MzEsMjYuMy0zMy45MjMsMjYuM2MtMTAuNDEzLDAtMjAuNDI1LTUuODk2LTI4LjE5NS0xNi41ODIgICAgYy04LjQ5Ny0xMS42OTctMTMuMTgyLTI3LjQxNi0xMy4xODItNDQuMjYyYzAtMTYuODU2LDQuNjg1LTMyLjU3NSwxMy4xODItNDQuMjcyYzcuNzctMTAuNjk3LDE3Ljc4My0xNi41ODIsMjguMTk1LTE2LjU4MiAgICBjMTIuODQ1LDAsMjUuMjE2LDkuMjEyLDMzLjEwMiwyNC42MzdjMi42MTEsNS4wOTYsOC44NDQsNy4xMDcsMTMuOTQsNC41MDZjMC42ODQtMC4zNDcsMS44ODUtMS4yMzIsMS44ODUtMS4yMzIgICAgYzMwLjc5Ni0yNS40NDcsNjUuMzYxLTQ1LjI3MiwxMDIuNzM3LTU4LjkzOGMzOC42NS0xNC4xNSw3OS4zNTMtMjEuMzMxLDEyMC45NTEtMjEuMzMxYzIuMzM3LDAsNC40ODUtMC43NzksNi4yMTItMi4wODUgICAgbDAuMDEsMC4wMTFjOC4zMzktNi4yNjQsMTguMjg4LTkuNTgxLDI4LjczMi05LjU4MWg3My43NzNjMjUuOTMyLDAsNDYuOTI1LDIwLjI4OCw0Ny44MSw0Ni4xODggICAgYzAsMC4wOTUsMC4wNTMsNDIuMDYxLDAuMDUzLDQyLjA2MUM0OTEuMjkxLDI0Ny41NDYsNDc4LjQzNSwyNjAuNDExLDQ2Mi42MjEsMjYwLjQxMXoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxjaXJjbGUgY3g9IjQyNS41NjEiIGN5PSIxNjYuMTkyIiByPSIxMS44NzEiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yOTguNDM5LDE5Mi45NGMtMC45MDMtNS42NDktNi4yMDMtOS40OTgtMTEuODY1LTguNTkxYy0zNi40NDcsNS44MzQtNzEuMTM0LDE4LjA5LTEwMy4wOTgsMzYuNDMxICAgIGMtNC45NjMsMi44NDgtNi42NzYsOS4xNzgtMy44MjksMTQuMTRjMS45MTUsMy4zMzgsNS40MDQsNS4yMDUsOC45OTUsNS4yMDVjMS43NDgsMCwzLjUyLTAuNDQzLDUuMTQ0LTEuMzc2ICAgIGMyOS43ODEtMTcuMDg4LDYyLjEwMS0yOC41MDgsOTYuMDYyLTMzLjk0NEMyOTUuNDk4LDIwMy45MDEsMjk5LjM0NCwxOTguNTg4LDI5OC40MzksMTkyLjk0eiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPg==",
    },
    whale: {
      id: "whale",
      name: "Whale",
      url: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8Y2lyY2xlICUlJSUgY3g9IjM0Ni4yODUiIGN5PSIyNTcuMDEzIiByPSIxMi42NDEiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoICUlJSUgZD0iTTQzMC40LDkzLjQxOWMtMTIuMDkzLDAtMjIuOTc5LDUuMjUxLTMwLjUxNSwxMy41ODVjLTcuNTM2LTguMzM3LTE4LjQzLTEzLjU4NS0zMC41My0xMy41ODUgICAgYy0yMi42ODcsMC00MS4xNTQsMTguNDU2LTQxLjE1NCw0MS4xNTRjMC4wMDEsNS44NjksNC43NjQsMTAuNjMxLDEwLjYzMiwxMC42MzFjNS44NzksMCwxMC42MzEtNC43NjMsMTAuNjMxLTEwLjYzMSAgICBjMC0xMC45NzIsOC45My0xOS44OTEsMTkuODkxLTE5Ljg5MWMxMC41MjUsMCwxOS4xNTgsOC4xOTcsMTkuODM4LDE4LjU1MmgwLjA3NGwwLjA3NCwwLjAwNSAgICBjLTAuMDU0LDAuNDM3LTAuMDkyLDM3Ljk4Mi0wLjA5MiwzNy45ODJjMCw1Ljg3Miw0Ljc2LDEwLjYzMSwxMC42MzEsMTAuNjMxYzUuODcyLDAsMTAuNjMxLTQuNzYsMTAuNjMxLTEwLjYzMVYxMzQuNTcgICAgYzAtMC4wMTItMC4wMDItMC4wMjMtMC4wMDItMC4wMzVjMC4wMjEtMTAuOTU1LDguOTQxLTE5Ljg1MywxOS44ODktMTkuODUzYzEwLjk3MiwwLDE5Ljg5MSw4LjkyLDE5Ljg5MSwxOS44OTEgICAgYzAsNS44NjksNC43NjMsMTAuNjMxLDEwLjYzMSwxMC42MzFjNS44NzksMCwxMC42MzEtNC43NjMsMTAuNjMxLTEwLjYzMUM0NzEuNTU0LDExMS44NzUsNDUzLjA5OCw5My40MTksNDMwLjQsOTMuNDE5eiIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggJSUlJSBkPSJNNTAzLjc1OCwyMTIuMjM1Yy02LjYyMy03Ljc4Mi0xNi4yNzctMTIuMjM3LTI2LjQ4My0xMi4yMzdIMTk0LjUzM2MtMzIuMTI4LDAtNTkuNzctMjIuODU3LTY1LjcyMy01NC4zNDggICAgYy0wLjEyMy0wLjY1LTAuMjg3LTEuMjgyLTAuNDUyLTEuOTE0aDE2Ljg5OWMzMC4xODIsMCw1NC43My0yNC41NDgsNTQuNzMtNTQuNzNWNzQuMzc4YzAtNS44NjgtNC43NjMtMTAuNjMxLTEwLjYzMS0xMC42MzEgICAgaC0zMS45MzdjLTIzLjQyMSwwLTQ0Ljc5LDExLjk3MS01Ny40MiwzMC41MzNDODcuMzU4LDc1LjcxOCw2Niw2My43NDcsNDIuNTY4LDYzLjc0N0gxMC42MzFDNC43NjMsNjMuNzQ3LDAsNjguNTEsMCw3NC4zNzggICAgdjE0LjYyOWMwLDMwLjE4MywyNC41NDgsNTQuNzMsNTQuNzMsNTQuNzNoMTguNjQyYy0wLjU5NywyLjMxMS0wLjkwOSw0LjcxNC0wLjkwOSw3LjE2NnY1OS43NDggICAgYzAsNDUuOTQ5LDE3LjE4LDg5Ljc3MSw0OC4zNjIsMTIzLjM5OGMyNy42NSwyOS44MTYsNjQuMDgsNDkuMjc0LDEwMy43OTQsNTUuNzA2Yy01LjQyNCwxNi40ODgtNS4xNzYsMzQuOTIsMi4wNzUsNTIuMTMxICAgIGMxLjA5NSwyLjU5OCwzLjE3OCw0LjY1Nyw1Ljc5LDUuNzJjMS4yODUsMC41MjIsNC42NiwxLjE3Miw4LjEzNy0wLjA1MWw5Ni42ODQtNDAuNzYzYzcuNDQyLTMuMTI2LDEzLjM3NS04Ljg1MSwxNi44MTMtMTUuOTcxICAgIGgwLjAwMmM0MC4yMDgtNC44MDUsNzcuODU0LTIzLjA2LDEwNi42NTQtNTEuODcxYzI3LjAwNC0yNi45OTMsNDQuNTU2LTYxLjA4OCw1MC43MzMtOTguNjA2YzAuMDIxLTAuMTA2LDAuMDMyLTAuMjAyLDAuMDQyLTAuMzA4ICAgIHYtMC4wMDJsMC4wMTEsMC4wMDJDNTEzLjE2NiwyMzAuMDc1LDUxMC4zMjgsMjE5Ljk0Myw1MDMuNzU4LDIxMi4yMzV6IE01NC43MywxMjIuNDc0Yy0xOC40NTYsMC0zMy40NjgtMTUuMDExLTMzLjQ2OC0zMy40NjggICAgdi0zLjk5N2gyMS4zMDVjMjIuMzY4LDAsNDIuMDE1LDE1LjcyNCw0Ni45MjcsMzcuNDY1SDU0LjczeiBNMTU3LjQxOSw4NS4wMDloMjEuMzA1djMuOTk3YzAsMTguNDU2LTE1LjAxMiwzMy40NjgtMzMuNDY4LDMzLjQ2OCAgICBoLTM0Ljc2NUMxMTUuMzkzLDEwMC43MzMsMTM1LjA1LDg1LjAwOSwxNTcuNDE5LDg1LjAwOXogTTQ0NS43MzEsMzIzLjkxOGMtMjMuMjgzLDIzLjMwNC01My4xMzYsMzguNzgzLTg1LjI2NCw0NC40ODIgICAgYzE3Ljk1Ni01OS4wMjUsNjYuNjA2LTEwMy43NTIsMTI2LjkwNy0xMTYuNzExQzQ4MC4xOTgsMjc4Ljk0Nyw0NjUuOTg0LDMwMy42ODYsNDQ1LjczMSwzMjMuOTE4eiBNMzM1Ljg4OCwzNzguNzQ0ICAgIGMtMC4wMjksMC4xMjQtMC4wNDgsMC4yNS0wLjA2NywwLjM3NGMtMC44MzEsMy42MjgtMy4zMzMsNi42MzctNi43NjIsOC4wNzdsLTg1LjkxNSwzNi4yMjIgICAgYy00Ljg2OC0yNC4yNzIsNy44MzItNDkuNDk5LDMxLjUwOC01OS40ODZjNS40MS0yLjI4MSw3Ljk0Ni04LjUxOCw1LjY2NC0xMy45MjhjLTIuMjgzLTUuNDA5LTguNTE4LTcuOTQ3LTEzLjkyNy01LjY2MyAgICBjLTEzLjE3LDUuNTU1LTIzLjkwNiwxNC40ODUtMzEuNjQyLDI1LjM1OGMtMzcuNjQ1LTQuNDc3LTcyLjM3Mi0yMi4xMTgtOTguMzI1LTUwLjEwN2MtMjcuNTM1LTI5LjY4My00Mi42OTYtNjguMzctNDIuNjk2LTEwOC45NCAgICB2LTU5Ljc0OGMwLTEuOTI0LDAuNzQ0LTMuNzIxLDIuMDg0LTUuMDYxYzEuMzYxLTEuMzYxLDMuMTU4LTIuMTA1LDUuMDcxLTIuMTA1YzMuNDM0LDAsNi4zODksMi40NjYsNy4wMzgsNS44NzkgICAgYzcuODU3LDQxLjUxNiw0NC4yOCw3MS42NDUsODYuNjE0LDcxLjY0NWgyODIuNzQyYzMuOTY2LDAsNy43MTgsMS43MzMsMTAuMzAyLDQuNzYzYzAuOTI5LDEuMDkxLDEuNjU0LDIuMjg3LDIuMTc4LDMuNTUxICAgIEM0MTMuMTY2LDI0My4xMTksMzUxLjk4NCwzMDEuOTQzLDMzNS44ODgsMzc4Ljc0NHoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoICUlJSUgZD0iTTIxMS43MywzMTIuNTUyYy0xNC43MzUtNi4wOTEtMjcuNzQ5LTE1LjE1NS0zOC42NzgtMjYuOTM5Yy03LjAzNy03LjU4Ny0xMi45NTUtMTYuMDkyLTE3LjU5LTI1LjI4ICAgIGMtMi42NDQtNS4yNDEtOS4wMzgtNy4zNDctMTQuMjgtNC43MDRjLTUuMjQyLDIuNjQ0LTcuMzQ4LDkuMDM4LTQuNzA0LDE0LjI4MWM1LjUzMywxMC45NjcsMTIuNTkzLDIxLjExNywyMC45ODUsMzAuMTYzICAgIGMxMy4wMjksMTQuMDQ4LDI4LjU1NSwyNC44NTgsNDYuMTQ0LDMyLjEyOWMxLjMyOSwwLjU1LDIuNzA0LDAuODEsNC4wNTcsMC44MWM0LjE3NSwwLDguMTM1LTIuNDc1LDkuODMtNi41NzMgICAgQzIxOS43MzcsMzIxLjAxMSwyMTcuMTU3LDMxNC43OTQsMjExLjczLDMxMi41NTJ6Ii8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+"
      //url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8Y2lyY2xlIGN4PSIzNDYuMjg1IiBjeT0iMjU3LjAxMyIgcj0iMTIuNjQxIi8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDMwLjQsOTMuNDE5Yy0xMi4wOTMsMC0yMi45NzksNS4yNTEtMzAuNTE1LDEzLjU4NWMtNy41MzYtOC4zMzctMTguNDMtMTMuNTg1LTMwLjUzLTEzLjU4NSAgICBjLTIyLjY4NywwLTQxLjE1NCwxOC40NTYtNDEuMTU0LDQxLjE1NGMwLjAwMSw1Ljg2OSw0Ljc2NCwxMC42MzEsMTAuNjMyLDEwLjYzMWM1Ljg3OSwwLDEwLjYzMS00Ljc2MywxMC42MzEtMTAuNjMxICAgIGMwLTEwLjk3Miw4LjkzLTE5Ljg5MSwxOS44OTEtMTkuODkxYzEwLjUyNSwwLDE5LjE1OCw4LjE5NywxOS44MzgsMTguNTUyaDAuMDc0bDAuMDc0LDAuMDA1ICAgIGMtMC4wNTQsMC40MzctMC4wOTIsMzcuOTgyLTAuMDkyLDM3Ljk4MmMwLDUuODcyLDQuNzYsMTAuNjMxLDEwLjYzMSwxMC42MzFjNS44NzIsMCwxMC42MzEtNC43NiwxMC42MzEtMTAuNjMxVjEzNC41NyAgICBjMC0wLjAxMi0wLjAwMi0wLjAyMy0wLjAwMi0wLjAzNWMwLjAyMS0xMC45NTUsOC45NDEtMTkuODUzLDE5Ljg4OS0xOS44NTNjMTAuOTcyLDAsMTkuODkxLDguOTIsMTkuODkxLDE5Ljg5MSAgICBjMCw1Ljg2OSw0Ljc2MywxMC42MzEsMTAuNjMxLDEwLjYzMWM1Ljg3OSwwLDEwLjYzMS00Ljc2MywxMC42MzEtMTAuNjMxQzQ3MS41NTQsMTExLjg3NSw0NTMuMDk4LDkzLjQxOSw0MzAuNCw5My40MTl6Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNTAzLjc1OCwyMTIuMjM1Yy02LjYyMy03Ljc4Mi0xNi4yNzctMTIuMjM3LTI2LjQ4My0xMi4yMzdIMTk0LjUzM2MtMzIuMTI4LDAtNTkuNzctMjIuODU3LTY1LjcyMy01NC4zNDggICAgYy0wLjEyMy0wLjY1LTAuMjg3LTEuMjgyLTAuNDUyLTEuOTE0aDE2Ljg5OWMzMC4xODIsMCw1NC43My0yNC41NDgsNTQuNzMtNTQuNzNWNzQuMzc4YzAtNS44NjgtNC43NjMtMTAuNjMxLTEwLjYzMS0xMC42MzEgICAgaC0zMS45MzdjLTIzLjQyMSwwLTQ0Ljc5LDExLjk3MS01Ny40MiwzMC41MzNDODcuMzU4LDc1LjcxOCw2Niw2My43NDcsNDIuNTY4LDYzLjc0N0gxMC42MzFDNC43NjMsNjMuNzQ3LDAsNjguNTEsMCw3NC4zNzggICAgdjE0LjYyOWMwLDMwLjE4MywyNC41NDgsNTQuNzMsNTQuNzMsNTQuNzNoMTguNjQyYy0wLjU5NywyLjMxMS0wLjkwOSw0LjcxNC0wLjkwOSw3LjE2NnY1OS43NDggICAgYzAsNDUuOTQ5LDE3LjE4LDg5Ljc3MSw0OC4zNjIsMTIzLjM5OGMyNy42NSwyOS44MTYsNjQuMDgsNDkuMjc0LDEwMy43OTQsNTUuNzA2Yy01LjQyNCwxNi40ODgtNS4xNzYsMzQuOTIsMi4wNzUsNTIuMTMxICAgIGMxLjA5NSwyLjU5OCwzLjE3OCw0LjY1Nyw1Ljc5LDUuNzJjMS4yODUsMC41MjIsNC42NiwxLjE3Miw4LjEzNy0wLjA1MWw5Ni42ODQtNDAuNzYzYzcuNDQyLTMuMTI2LDEzLjM3NS04Ljg1MSwxNi44MTMtMTUuOTcxICAgIGgwLjAwMmM0MC4yMDgtNC44MDUsNzcuODU0LTIzLjA2LDEwNi42NTQtNTEuODcxYzI3LjAwNC0yNi45OTMsNDQuNTU2LTYxLjA4OCw1MC43MzMtOTguNjA2YzAuMDIxLTAuMTA2LDAuMDMyLTAuMjAyLDAuMDQyLTAuMzA4ICAgIHYtMC4wMDJsMC4wMTEsMC4wMDJDNTEzLjE2NiwyMzAuMDc1LDUxMC4zMjgsMjE5Ljk0Myw1MDMuNzU4LDIxMi4yMzV6IE01NC43MywxMjIuNDc0Yy0xOC40NTYsMC0zMy40NjgtMTUuMDExLTMzLjQ2OC0zMy40NjggICAgdi0zLjk5N2gyMS4zMDVjMjIuMzY4LDAsNDIuMDE1LDE1LjcyNCw0Ni45MjcsMzcuNDY1SDU0LjczeiBNMTU3LjQxOSw4NS4wMDloMjEuMzA1djMuOTk3YzAsMTguNDU2LTE1LjAxMiwzMy40NjgtMzMuNDY4LDMzLjQ2OCAgICBoLTM0Ljc2NUMxMTUuMzkzLDEwMC43MzMsMTM1LjA1LDg1LjAwOSwxNTcuNDE5LDg1LjAwOXogTTQ0NS43MzEsMzIzLjkxOGMtMjMuMjgzLDIzLjMwNC01My4xMzYsMzguNzgzLTg1LjI2NCw0NC40ODIgICAgYzE3Ljk1Ni01OS4wMjUsNjYuNjA2LTEwMy43NTIsMTI2LjkwNy0xMTYuNzExQzQ4MC4xOTgsMjc4Ljk0Nyw0NjUuOTg0LDMwMy42ODYsNDQ1LjczMSwzMjMuOTE4eiBNMzM1Ljg4OCwzNzguNzQ0ICAgIGMtMC4wMjksMC4xMjQtMC4wNDgsMC4yNS0wLjA2NywwLjM3NGMtMC44MzEsMy42MjgtMy4zMzMsNi42MzctNi43NjIsOC4wNzdsLTg1LjkxNSwzNi4yMjIgICAgYy00Ljg2OC0yNC4yNzIsNy44MzItNDkuNDk5LDMxLjUwOC01OS40ODZjNS40MS0yLjI4MSw3Ljk0Ni04LjUxOCw1LjY2NC0xMy45MjhjLTIuMjgzLTUuNDA5LTguNTE4LTcuOTQ3LTEzLjkyNy01LjY2MyAgICBjLTEzLjE3LDUuNTU1LTIzLjkwNiwxNC40ODUtMzEuNjQyLDI1LjM1OGMtMzcuNjQ1LTQuNDc3LTcyLjM3Mi0yMi4xMTgtOTguMzI1LTUwLjEwN2MtMjcuNTM1LTI5LjY4My00Mi42OTYtNjguMzctNDIuNjk2LTEwOC45NCAgICB2LTU5Ljc0OGMwLTEuOTI0LDAuNzQ0LTMuNzIxLDIuMDg0LTUuMDYxYzEuMzYxLTEuMzYxLDMuMTU4LTIuMTA1LDUuMDcxLTIuMTA1YzMuNDM0LDAsNi4zODksMi40NjYsNy4wMzgsNS44NzkgICAgYzcuODU3LDQxLjUxNiw0NC4yOCw3MS42NDUsODYuNjE0LDcxLjY0NWgyODIuNzQyYzMuOTY2LDAsNy43MTgsMS43MzMsMTAuMzAyLDQuNzYzYzAuOTI5LDEuMDkxLDEuNjU0LDIuMjg3LDIuMTc4LDMuNTUxICAgIEM0MTMuMTY2LDI0My4xMTksMzUxLjk4NCwzMDEuOTQzLDMzNS44ODgsMzc4Ljc0NHoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0yMTEuNzMsMzEyLjU1MmMtMTQuNzM1LTYuMDkxLTI3Ljc0OS0xNS4xNTUtMzguNjc4LTI2LjkzOWMtNy4wMzctNy41ODctMTIuOTU1LTE2LjA5Mi0xNy41OS0yNS4yOCAgICBjLTIuNjQ0LTUuMjQxLTkuMDM4LTcuMzQ3LTE0LjI4LTQuNzA0Yy01LjI0MiwyLjY0NC03LjM0OCw5LjAzOC00LjcwNCwxNC4yODFjNS41MzMsMTAuOTY3LDEyLjU5MywyMS4xMTcsMjAuOTg1LDMwLjE2MyAgICBjMTMuMDI5LDE0LjA0OCwyOC41NTUsMjQuODU4LDQ2LjE0NCwzMi4xMjljMS4zMjksMC41NSwyLjcwNCwwLjgxLDQuMDU3LDAuODFjNC4xNzUsMCw4LjEzNS0yLjQ3NSw5LjgzLTYuNTczICAgIEMyMTkuNzM3LDMyMS4wMTEsMjE3LjE1NywzMTQuNzk0LDIxMS43MywzMTIuNTUyeiIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPg==",
    },
    toucan: {
      id: "toucan",
      name: "Toucan",
      url: "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8cGF0aCAlJSUlIGQ9Ik00MTkuMTA1LDMzLjIwOWMtMC45NzYtMC45ODctNS4wODktNC44MTItNi4xNTQtNS43MUMzOTIuMzk0LDkuNzY5LDM2Ni4xMDQsMCwzMzguOTI3LDBIMjM2LjU2MyAgICBjLTI0LjU5MywwLjAxMS00OC40MSw0Ljk3OS03MC44MDgsMTQuNzY5YzAsMC0yNi45MjIsMTEuMjY1LTUxLjIxNiwzNC4wOTZDODkuNjgsNzIuMjE2LDc0LjQzNCwxMDYuMDksNzQuNDM0LDEwNi4wOSAgICBjLTkuNzkxLDIyLjQwOS0xNC43NDcsNDYuMjQ4LTE0Ljc0Nyw3MC44NTJsLTAuMDExLDI4My4xMzJjMCwyOC42MjksMjMuMjg1LDUxLjkyNSw1MS45MjUsNTEuOTI1ICAgIGM2LjEyMSwwLDExLjA4OC00Ljk2NywxMS4wODgtMTEuMDg4di0yOC41NDFjOC40MjcsNS45MSwxOC42ODMsOS40MDMsMjkuNzM4LDkuNDAzYzYuMTIxLDAsMTEuMDg4LTQuOTY3LDExLjA4OC0xMS4wODh2LTI4LjEzICAgIGM4LjQzOCw1LjkxLDE4LjY4Myw5LjQwMywyOS43NDksOS40MDNjNi4xMjEsMCwxMS4wODgtNC45NjcsMTEuMDg4LTExLjA4OHYtNzguODI1bDAuMjMzLTAuMjY2ICAgIGMwLjkzMS0xLjA2NCw0LjE2OS01LjAwMSw0Ljg1Ny01Ljg2NmgxNjUuNDMzYzYuMTIxLDAsMTEuMDg4LTQuOTU2LDExLjA4OC0xMS4wODhjMC02LjEyMS00Ljk2Ny0xMS4wODgtMTEuMDg4LTExLjA4OGgtODYuNDA5ICAgIGwxMC41MTEtMTAuNTExYzIuNDk1LDAuMzQ0LDUuMDAxLDAuNTIxLDcuNDg0LDAuNTIxYzE0LjI3LDAsMjguMjQxLTUuNjExLDM4LjU1My0xNS45MjIgICAgYzEzLjY5NC0xMy42OTQsMTkuMDk0LTMzLjgzLDE0LjA5My01Mi41NTdjLTEuMDMxLTMuODM2LTQuMDI1LTYuODMtNy44NS03Ljg1Yy0xOC43MTctNS4wMDEtMzguODUyLDAuMzk5LTUyLjU1NywxNC4wOTMgICAgYy0xMi4xMDgsMTIuMTE5LTE3LjczLDI5LjI3Mi0xNS4zOSw0Ni4wMjZsLTI2LjIxMiwyNi4yMDFoLTMyLjY0M2MwLjY0My0xLjEzMSw5LjAwMy0xNS4wOTEsMTMuMzE3LTI5LjE1ICAgIGMzLjI3MS0xMC42NTYsNi4zOTgtMjEuNDc3LDguMDM5LTMyLjU3N2MwLjAyMi0wLjA3OCwwLjAzMy0wLjE2NiwwLjA0NC0wLjI1NWMxLjIzMS04LjQ3MSwxLjg2My0xNy4xNDIsMS44NjMtMjUuNzU3VjE3NC4wNiAgICBoMTI4LjMyMmMyMi44NDEsMCw0Mi4wNDYtMTUuOTIyLDQ3LjA2OS0zNy4yNTZoMTguMTI5YzYuMTIxLDAsMTEuMDg4LTQuOTY3LDExLjA4OC0xMS4wODh2LTEyLjMzICAgIEM0NTIuMzI0LDgzLjA4Miw0NDAuNTI3LDU0LjYwOCw0MTkuMTA1LDMzLjIwOXogTTMxNC4zODksMjc3LjE4OWM2LjQ3NS02LjQ3NSwxNS4zOS05LjgwMiwyNC4zNDktOS40MDMgICAgYzAuNDIxLDguOTgxLTIuOTI3LDE3Ljg4NS05LjQwMywyNC4zNmMtNi40NzUsNi40NjQtMTUuMzc5LDkuODI0LTI0LjM0OSw5LjM5MkMzMDQuNTc3LDI5Mi41NjgsMzA3LjkxNCwyODMuNjY1LDMxNC4zODksMjc3LjE4OXogICAgIE0yMjUuNTMsMjIuOTg1bDAuMDExLDE1Ni41ODVjLTM4LjM3Ni01LjQxMS02OC4wMDMtMzguNDUzLTY4LjAwMy03OC4zMDRDMTU3LjUzOCw2MS40MjgsMTg3LjE1NSwyOC4zOTYsMjI1LjUzLDIyLjk4NXogICAgIE0xMDAuNTEzLDM5NS43MDlsLTAuMDExLDkxLjk3NWMtMTAuOTIyLTQuNDEzLTE4LjY1LTE1LjEyNC0xOC42NS0yNy42MDlsMC4wMTEtODAuMzc3YzYuNDA5LTAuNjk5LDEyLjY0LTEuOTg1LDE4LjY1LTMuODAzICAgIFYzOTUuNzA5eiBNMTgyLjE3Niw0MjcuNjQyYy0xMC45MzMtNC40MDItMTguNjYxLTE1LjEyNC0xOC42NjEtMjcuNjA5di0zLjMyNmM2LjUwOS00LjAwMywxMi43NC04LjQzOCwxOC42NjEtMTMuMjVWNDI3LjY0MnogICAgIE0yMjUuNTQxLDI0NS45OTljMCw3LjYxNy0wLjU2NSwxNS4yNzktMS42NjMsMjIuNzUzYy0wLjAxMSwwLjA4OS0wLjAyMiwwLjE2Ni0wLjAzMywwLjI0NCAgICBjLTEuNDQxLDkuNjI0LTMuNzkyLDE5LjEyNy02Ljk5NywyOC4yNjNjMCwwLTUuOTQzLDE2LjI2Ni0xNS4wNjksMzEuMThjLTguNjM4LDE0LjExNS0yMS41NzcsMjYuOTk5LTIxLjU3NywyNi45OTkgICAgYy01LjQxMSw1LjQxMS0xMS4yMSwxMC40MDEtMTcuMzMxLDE0Ljk0N2MtMS41My00LjMwMi01LjYyMi03LjM4NS0xMC40NDUtNy4zODVjLTYuMTIxLDAtMTEuMDg4LDQuOTY3LTExLjA4OCwxMS4wODh2ODMuMzcxICAgIGMtMTAuOTIyLTQuNDEzLTE4LjY1LTE1LjEyNC0xOC42NS0yNy42MDl2LTYzLjcwMWMzMC4yODEtMTcuODUyLDUwLjY1LTUwLjgwNSw1MC42NjEtODguNDM4di0zOS44NSAgICBjMC0zMS4zNDYtMjUuNTAyLTU2LjgzNy01Ni44MzctNTYuODM3Yy02LjEzMiwwLTExLjA4OCw0Ljk2Ny0xMS4wODgsMTEuMDg4YzAsNi4xMjEsNC45NTYsMTEuMDg4LDExLjA4OCwxMS4wODggICAgYzkuMjU4LDAsMTcuOTYzLDMuNjA0LDI0LjUwNSwxMC4xNDZjNi41NDIsNi41NTMsMTAuMTU3LDE1LjI1NywxMC4xNTcsMjQuNTE2djM5Ljg1Yy0wLjAxMSw0MC41NzEtMzAuMjE1LDc0LjIyMy02OS4zMTEsNzkuNjQ1ICAgIFYxNzYuOTQzYzAtMjEuNTMzLDQuMzM1LTQyLjM4OSwxMi44ODQtNjEuOTQ5YzAsMCw3LjE0MS0xNi42ODcsMjIuMjA5LTM2LjIwMmMxNS43NjctMjAuNDI0LDMyLjczMi0yOS45NzEsMzMuMjY0LTMwLjI1OSAgICBjLTkuNDAzLDE1LjM3OS0xNC44NTgsMzMuNDE5LTE0Ljg1OCw1Mi43MzVjMCw1Mi4xMDMsMzkuNTI5LDk1LjEyNCw5MC4xNzksMTAwLjY1N1YyNDUuOTk5eiBNMjQ3LjcxNywyMi4xNzZoOTEuMjEgICAgYzE4LjUxNywwLDM2LjUxMyw1LjYzMyw1MS42NTksMTYuMDQ0Yy0yMS44MSwxOS4zNDktMzQuNzcyLDQ2Ljg4LTM1LjU3LDc2LjQwN0gyNDcuNzE3VjIyLjE3NnogTTM3Ni4wMzksMTUxLjg4NEgyNDcuNzE3di0xNS4wOCAgICBoMTUyLjAyOEMzOTUuNTY1LDE0NS43MDgsMzg2LjUwNiwxNTEuODg0LDM3Ni4wMzksMTUxLjg4NHogTTQzMC4xNDgsMTE0LjYyOGgtNTIuOTU2YzAuODItMjQuMDE3LDExLjgzMS00Ni4zMTUsMzAuMTI2LTYxLjU5NCAgICBjMCwwLDExLjQ5OCwxMi45MjksMTcuMTIsMjguNDUyQzQzMS40NjgsMTAwLjkwMSw0MzAuMTQ4LDExNC42MjgsNDMwLjE0OCwxMTQuNjI4eiIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggJSUlJSBkPSJNMTk0LjI2Miw3MC44NDFjLTcuMDYzLDAtMTIuNzg0LDUuNzIxLTEyLjc4NCwxMi43OTZjMCw3LjA2Myw1LjcyMSwxMi43ODQsMTIuNzg0LDEyLjc4NHMxMi43OTYtNS43MjEsMTIuNzk2LTEyLjc4NCAgICBDMjA3LjA1OCw3Ni41NjMsMjAxLjMyNSw3MC44NDEsMTk0LjI2Miw3MC44NDF6Ii8+Cgk8L2c+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPGc+CjwvZz4KPC9zdmc+"
      //url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNDE5LjEwNSwzMy4yMDljLTAuOTc2LTAuOTg3LTUuMDg5LTQuODEyLTYuMTU0LTUuNzFDMzkyLjM5NCw5Ljc2OSwzNjYuMTA0LDAsMzM4LjkyNywwSDIzNi41NjMgICAgYy0yNC41OTMsMC4wMTEtNDguNDEsNC45NzktNzAuODA4LDE0Ljc2OWMwLDAtMjYuOTIyLDExLjI2NS01MS4yMTYsMzQuMDk2Qzg5LjY4LDcyLjIxNiw3NC40MzQsMTA2LjA5LDc0LjQzNCwxMDYuMDkgICAgYy05Ljc5MSwyMi40MDktMTQuNzQ3LDQ2LjI0OC0xNC43NDcsNzAuODUybC0wLjAxMSwyODMuMTMyYzAsMjguNjI5LDIzLjI4NSw1MS45MjUsNTEuOTI1LDUxLjkyNSAgICBjNi4xMjEsMCwxMS4wODgtNC45NjcsMTEuMDg4LTExLjA4OHYtMjguNTQxYzguNDI3LDUuOTEsMTguNjgzLDkuNDAzLDI5LjczOCw5LjQwM2M2LjEyMSwwLDExLjA4OC00Ljk2NywxMS4wODgtMTEuMDg4di0yOC4xMyAgICBjOC40MzgsNS45MSwxOC42ODMsOS40MDMsMjkuNzQ5LDkuNDAzYzYuMTIxLDAsMTEuMDg4LTQuOTY3LDExLjA4OC0xMS4wODh2LTc4LjgyNWwwLjIzMy0wLjI2NiAgICBjMC45MzEtMS4wNjQsNC4xNjktNS4wMDEsNC44NTctNS44NjZoMTY1LjQzM2M2LjEyMSwwLDExLjA4OC00Ljk1NiwxMS4wODgtMTEuMDg4YzAtNi4xMjEtNC45NjctMTEuMDg4LTExLjA4OC0xMS4wODhoLTg2LjQwOSAgICBsMTAuNTExLTEwLjUxMWMyLjQ5NSwwLjM0NCw1LjAwMSwwLjUyMSw3LjQ4NCwwLjUyMWMxNC4yNywwLDI4LjI0MS01LjYxMSwzOC41NTMtMTUuOTIyICAgIGMxMy42OTQtMTMuNjk0LDE5LjA5NC0zMy44MywxNC4wOTMtNTIuNTU3Yy0xLjAzMS0zLjgzNi00LjAyNS02LjgzLTcuODUtNy44NWMtMTguNzE3LTUuMDAxLTM4Ljg1MiwwLjM5OS01Mi41NTcsMTQuMDkzICAgIGMtMTIuMTA4LDEyLjExOS0xNy43MywyOS4yNzItMTUuMzksNDYuMDI2bC0yNi4yMTIsMjYuMjAxaC0zMi42NDNjMC42NDMtMS4xMzEsOS4wMDMtMTUuMDkxLDEzLjMxNy0yOS4xNSAgICBjMy4yNzEtMTAuNjU2LDYuMzk4LTIxLjQ3Nyw4LjAzOS0zMi41NzdjMC4wMjItMC4wNzgsMC4wMzMtMC4xNjYsMC4wNDQtMC4yNTVjMS4yMzEtOC40NzEsMS44NjMtMTcuMTQyLDEuODYzLTI1Ljc1N1YxNzQuMDYgICAgaDEyOC4zMjJjMjIuODQxLDAsNDIuMDQ2LTE1LjkyMiw0Ny4wNjktMzcuMjU2aDE4LjEyOWM2LjEyMSwwLDExLjA4OC00Ljk2NywxMS4wODgtMTEuMDg4di0xMi4zMyAgICBDNDUyLjMyNCw4My4wODIsNDQwLjUyNyw1NC42MDgsNDE5LjEwNSwzMy4yMDl6IE0zMTQuMzg5LDI3Ny4xODljNi40NzUtNi40NzUsMTUuMzktOS44MDIsMjQuMzQ5LTkuNDAzICAgIGMwLjQyMSw4Ljk4MS0yLjkyNywxNy44ODUtOS40MDMsMjQuMzZjLTYuNDc1LDYuNDY0LTE1LjM3OSw5LjgyNC0yNC4zNDksOS4zOTJDMzA0LjU3NywyOTIuNTY4LDMwNy45MTQsMjgzLjY2NSwzMTQuMzg5LDI3Ny4xODl6ICAgICBNMjI1LjUzLDIyLjk4NWwwLjAxMSwxNTYuNTg1Yy0zOC4zNzYtNS40MTEtNjguMDAzLTM4LjQ1My02OC4wMDMtNzguMzA0QzE1Ny41MzgsNjEuNDI4LDE4Ny4xNTUsMjguMzk2LDIyNS41MywyMi45ODV6ICAgICBNMTAwLjUxMywzOTUuNzA5bC0wLjAxMSw5MS45NzVjLTEwLjkyMi00LjQxMy0xOC42NS0xNS4xMjQtMTguNjUtMjcuNjA5bDAuMDExLTgwLjM3N2M2LjQwOS0wLjY5OSwxMi42NC0xLjk4NSwxOC42NS0zLjgwMyAgICBWMzk1LjcwOXogTTE4Mi4xNzYsNDI3LjY0MmMtMTAuOTMzLTQuNDAyLTE4LjY2MS0xNS4xMjQtMTguNjYxLTI3LjYwOXYtMy4zMjZjNi41MDktNC4wMDMsMTIuNzQtOC40MzgsMTguNjYxLTEzLjI1VjQyNy42NDJ6ICAgICBNMjI1LjU0MSwyNDUuOTk5YzAsNy42MTctMC41NjUsMTUuMjc5LTEuNjYzLDIyLjc1M2MtMC4wMTEsMC4wODktMC4wMjIsMC4xNjYtMC4wMzMsMC4yNDQgICAgYy0xLjQ0MSw5LjYyNC0zLjc5MiwxOS4xMjctNi45OTcsMjguMjYzYzAsMC01Ljk0MywxNi4yNjYtMTUuMDY5LDMxLjE4Yy04LjYzOCwxNC4xMTUtMjEuNTc3LDI2Ljk5OS0yMS41NzcsMjYuOTk5ICAgIGMtNS40MTEsNS40MTEtMTEuMjEsMTAuNDAxLTE3LjMzMSwxNC45NDdjLTEuNTMtNC4zMDItNS42MjItNy4zODUtMTAuNDQ1LTcuMzg1Yy02LjEyMSwwLTExLjA4OCw0Ljk2Ny0xMS4wODgsMTEuMDg4djgzLjM3MSAgICBjLTEwLjkyMi00LjQxMy0xOC42NS0xNS4xMjQtMTguNjUtMjcuNjA5di02My43MDFjMzAuMjgxLTE3Ljg1Miw1MC42NS01MC44MDUsNTAuNjYxLTg4LjQzOHYtMzkuODUgICAgYzAtMzEuMzQ2LTI1LjUwMi01Ni44MzctNTYuODM3LTU2LjgzN2MtNi4xMzIsMC0xMS4wODgsNC45NjctMTEuMDg4LDExLjA4OGMwLDYuMTIxLDQuOTU2LDExLjA4OCwxMS4wODgsMTEuMDg4ICAgIGM5LjI1OCwwLDE3Ljk2MywzLjYwNCwyNC41MDUsMTAuMTQ2YzYuNTQyLDYuNTUzLDEwLjE1NywxNS4yNTcsMTAuMTU3LDI0LjUxNnYzOS44NWMtMC4wMTEsNDAuNTcxLTMwLjIxNSw3NC4yMjMtNjkuMzExLDc5LjY0NSAgICBWMTc2Ljk0M2MwLTIxLjUzMyw0LjMzNS00Mi4zODksMTIuODg0LTYxLjk0OWMwLDAsNy4xNDEtMTYuNjg3LDIyLjIwOS0zNi4yMDJjMTUuNzY3LTIwLjQyNCwzMi43MzItMjkuOTcxLDMzLjI2NC0zMC4yNTkgICAgYy05LjQwMywxNS4zNzktMTQuODU4LDMzLjQxOS0xNC44NTgsNTIuNzM1YzAsNTIuMTAzLDM5LjUyOSw5NS4xMjQsOTAuMTc5LDEwMC42NTdWMjQ1Ljk5OXogTTI0Ny43MTcsMjIuMTc2aDkxLjIxICAgIGMxOC41MTcsMCwzNi41MTMsNS42MzMsNTEuNjU5LDE2LjA0NGMtMjEuODEsMTkuMzQ5LTM0Ljc3Miw0Ni44OC0zNS41Nyw3Ni40MDdIMjQ3LjcxN1YyMi4xNzZ6IE0zNzYuMDM5LDE1MS44ODRIMjQ3LjcxN3YtMTUuMDggICAgaDE1Mi4wMjhDMzk1LjU2NSwxNDUuNzA4LDM4Ni41MDYsMTUxLjg4NCwzNzYuMDM5LDE1MS44ODR6IE00MzAuMTQ4LDExNC42MjhoLTUyLjk1NmMwLjgyLTI0LjAxNywxMS44MzEtNDYuMzE1LDMwLjEyNi02MS41OTQgICAgYzAsMCwxMS40OTgsMTIuOTI5LDE3LjEyLDI4LjQ1MkM0MzEuNDY4LDEwMC45MDEsNDMwLjE0OCwxMTQuNjI4LDQzMC4xNDgsMTE0LjYyOHoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0xOTQuMjYyLDcwLjg0MWMtNy4wNjMsMC0xMi43ODQsNS43MjEtMTIuNzg0LDEyLjc5NmMwLDcuMDYzLDUuNzIxLDEyLjc4NCwxMi43ODQsMTIuNzg0czEyLjc5Ni01LjcyMSwxMi43OTYtMTIuNzg0ICAgIEMyMDcuMDU4LDc2LjU2MywyMDEuMzI1LDcwLjg0MSwxOTQuMjYyLDcwLjg0MXoiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4=",
    },
    // chicken: {
    //   id: "chicken",
    //   name: "Chicken",
    //   url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUxMiA1MTIiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNMTI1Ljg1MSwxMjkuODU5Yy02LjQxNCwwLTExLjYxOSw1LjIwNi0xMS42MTksMTEuNjE5YzAsNi40MjYsNS4yMDYsMTEuNjIsMTEuNjE5LDExLjYyICAgIGM2LjQyNiwwLDExLjYxOS01LjE5NCwxMS42MTktMTEuNjJDMTM3LjQ3LDEzNS4wNjUsMTMyLjI3NiwxMjkuODU5LDEyNS44NTEsMTI5Ljg1OXoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0zNjcuMjIyLDI2MS4wNjZjLTIuNTQ1LTUuODkxLTkuMzc3LTguNTk4LTE1LjI4LTYuMDU0Yy01Ljg3OSwyLjU0NS04LjU5OCw5LjM4OC02LjA1NCwxNS4yOCAgICBjNC42MjUsMTAuNjc4LTAuMzAyLDIzLjEyMy0xMC45OTIsMjcuNzQ3Yy0zLjMsMS40MjktNi43ODYsMS45NjQtMTAuMjM3LDEuNjYyYy0xLjM4My00Ljc2NC01Ljc0LTguMjczLTEwLjk2OS04LjM2NiAgICBjLTYuMzU2LTAuMTA1LTExLjcwMSw1LjAyLTExLjc5NCwxMS40MzRjLTAuNDY1LDI5LjMyOC0yNC40NzEsNTIuODY5LTUzLjY5NCw1Mi44NjljLTAuMjksMCwwLTAuMDkzLTAuMjktMC4xMDUgICAgYy0yOS42MDYtMC40NjUtNTMuMzIyLTI0LjkzNS01Mi44NDUtNTQuNTUzYzAuMTA1LTYuNDE0LTUuMDItMTEuNzAxLTExLjQzNC0xMS43OTRjLTYuMzkxLTAuMTI4LTExLjgwNSw1LjAwOC0xMS44MDUsMTEuNDM0ICAgIGMwLDc5LjMyNiw3NS45NjgsNzguMjU3LDc2LjM3NSw3OC4yNTdjMzUuMDkxLDAsNjQuOTA2LTIzLjY5Miw3NC4wMzktNTYuMDc2YzEuNDE4LDAuMTI4LDIuODQ3LDAuMjA5LDQuMjY0LDAuMjA5ICAgIGM1Ljk5NiwwLDEyLjAwMy0xLjIwOCwxNy42MTUtMy42MzdDMzY2LjU3MSwzMDkuNjU5LDM3Ni45MjQsMjgzLjUxNSwzNjcuMjIyLDI2MS4wNjZ6Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNNTAwLjM4MSwxNTUuMDM5aC0yNy41NjFsMTkuNDUxLTE5LjQ1MWM0LjU0My00LjU0Myw0LjU0My0xMS44OTgsMC0xNi40NDJjLTQuNTMyLTQuNTMyLTExLjg4Ny00LjUzMi0xNi40MywwICAgIGwtMTkuNDYzLDE5LjQ2M3YtMjcuNTI2YzAtNi40MTQtNS4yMDYtMTEuNjItMTEuNjItMTEuNjJjLTYuNDE0LDAtMTEuNjE5LDUuMjA2LTExLjYxOSwxMS42MnY1NS42MjIgICAgYy0wLjAyMywyNi42NjctMzAuODg1LDQ4LjM2LTY4Ljc5OSw0OC4zNmMtMC4wMTIsMC0wLjAxMiwwLTAuMDEyLDBIMjI1LjgwMXYtNTguODQxYzAtMzcuMDg5LTIzLjczOS02OC43MjktNTYuODE5LTgwLjU0NiAgICBjNC45NS03LjA3Niw3Ljg1NS0xNS42MjgsNy44NTUtMjQuNzI2YzAtMjMuODQzLTE5LjQwNS00My4yMzYtNDMuMjM2LTQzLjIzNmMtMTkuMDIxLDAtMzUuMjc3LDEyLjQyMS00MS4wMjgsMjkuNTgzICAgIGMwLDAsMCwwLTAuMDEyLDBjLTIwLjM0NiwwLTM2LjkwMywxNi41NTgtMzYuOTAzLDM2LjkxNWMwLDEyLjcxMiw2LjQ2LDIzLjk1OSwxNi4yNzksMzAuNTk0ICAgIGMtOC40ODIsMTEuMjI0LTE0LjAxMywyNC4yNzMtMTYuMTYzLDM4LjE1OGMtMTguMTg1LDAuNzA5LTM1LjYzNyw3LjMzMi00OS42OTYsMTguOTUxYy0zLjg4MSwzLjIwNy02LjEsNy45MzYtNi4wNzcsMTIuOTc5ICAgIGMwLjAxMiw1LjA3OCwyLjI3Nyw5LjgzLDYuMjE2LDEzLjAzN2M1LjMxLDQuMzM0LDExLjEwOCw3Ljk1OSwxNy4yNDMsMTAuODUzdjM1LjEyNmMwLDAuNDUzLDAuMDM1LDAuOTA2LDAuMDkzLDEuMzQ4ICAgIGMxLjg3MSwxNC4zOTcsMTMuNzY5LDI1LjI2MSwyNy42NzgsMjUuMjYxaDQuNjgzYzkuOTkzLDkzLjQ2Nyw4NC4zODEsMTY3Ljk0OCwxNzcuODAxLDE3OC4xMDN2NDIuNDIzaC0zMi42MTYgICAgYy02LjQxNCwwLTExLjYxOSw1LjIwNi0xMS42MTksMTEuNjJjMCw2LjQyNiw1LjIwNiwxMS42MTksMTEuNjE5LDExLjYxOWgxMTYuMzgxYzYuNDE0LDAsMTEuNjE5LTUuMTk0LDExLjYxOS0xMS42MTkgICAgYzAtNi40MTQtNS4yMDYtMTEuNjItMTEuNjE5LTExLjYyaC0xNS41NDd2LTQ2LjY0MWM4OC40NDctMjAuOTg1LDE1NC40NDYtMTAwLjYyNSwxNTQuNDQ2LTE5NS40MDR2LTYwLjcyM2g0NC4wMDMgICAgYzYuNDE0LDAsMTEuNjE5LTUuMTk0LDExLjYxOS0xMS42MTlDNTEyLDE2MC4yNDQsNTA2Ljc5NSwxNTUuMDM5LDUwMC4zODEsMTU1LjAzOXogTTUxLjIzLDIzOS42MDVMNTEuMjMsMjM5LjYwNSAgICBjLTMuMjE5LDAtNi4xNDctMi44MTItNi44NTUtNi40OTV2LTI3LjU5NmMzLjQxNiwwLjYyNyw2Ljg5LDEuMDQ2LDEwLjM3NiwxLjI0M2MwLDAsMC4wMTIsMzIuNjM5LDAuMDEyLDMyLjg0OEg1MS4yM3ogICAgIE02MC40MjEsMTgzLjY2OWMtMTEuNTYxLDAuMTM5LTIyLjc5Ny0yLjk1MS0zMi41MzQtOC44MzFjOS43MjUtNS45MTQsMjEuMDU0LTguOTcsMzIuNTU4LTguNzAzICAgIGM3Ljg3OCwwLjE4Niw4LjQ0Nyw2LjgyMSw4LjQ0Nyw4Ljg0MkM2OC44NDYsMTgyLjcyOCw2Mi45NTQsMTgzLjYzNCw2MC40MjEsMTgzLjY2OXogTTkyLjU2MSw2MC41MzcgICAgYzEuNzY2LDAsMy40NjMsMC4zMjUsNS4wNTQsMC45NjRjMy41NjcsMS40NDEsNy42MjIsMS4wMzQsMTAuODE4LTEuMTE1YzMuMjA3LTIuMTM4LDUuMTM2LTUuNzE3LDUuMTU5LTkuNTc0ICAgIGMwLjA4MS0xMC45NDYsOS4wNTItMTkuODU4LDIwLjAwOS0xOS44NThjMTEuMDI3LDAsMTkuOTk3LDguOTcsMTkuOTk3LDE5Ljk5N2MwLDkuODUzLTcuMzMyLDE4LjM1OS0xNy4wNTcsMTkuNzg4ICAgIGMtMC4xMDUsMC4wMTItMjMuNDYtMC42NTEtNDcuMTc1LDE2Ljc1NWMtNi4wMDctMS40NTItMTAuNDY5LTYuODQ0LTEwLjQ2OS0xMy4yODFDNzguODk2LDY2LjY3Myw4NS4wMiw2MC41MzcsOTIuNTYxLDYwLjUzN3ogICAgIE0yNzguNjkzLDQ4MS4wNDZoLTIxLjc0di00MS4yNDljNy4zNDQtMC4wNDYsMTQuNjA2LTAuNSwyMS43NC0xLjMyNVY0ODEuMDQ2eiBNNDMzLjEzOSwyMzkuMDAxICAgIGMwLDk3LjkxNy03OS42NjMsMTc3LjU4LTE3Ny41NjksMTc3LjU4Yy05Ni4zNzIsMC0xNzcuNTgtNzkuODk1LTE3Ny41OC0xNzcuNTh2LTAuNjM5aDIxLjg0NWM2LjQyNiwwLDExLjYxOS01LjE5NCwxMS42MTktMTEuNjIgICAgYzAtNi40MTQtNS4xOTQtMTEuNjE5LTExLjYxOS0xMS42MTlINzcuOTl2LTEzLjE0MmM5LjI2MS01Ljk2MSwxNC4wODMtMTYuNDg4LDE0LjE0MS0yNi44NzYgICAgYzAuMDQ3LTEwLjMwNi00LjU2Ni0yMC44MS0xMy42MDYtMjYuODk5YzEuNzMxLTEzLjYwNiw3Ljg2Ni0yNi4xOSwxNy43MDgtMzYuMDJjMTEuNzcxLTExLjc1OSwyNy40MS0xOC4yNDMsNDQuMDM4LTE4LjI0MyAgICBjMzQuMzQ3LDAsNjIuMjkyLDI3LjkzMyw2Mi4yOTIsNjIuMjh2NTguODQxaC00Ni43OTJjLTYuNDE0LDAtMTEuNjE5LDUuMTk0LTExLjYxOSwxMS42MTljMCw2LjQxNCw1LjIwNiwxMS42MiwxMS42MTksMTEuNjIgICAgaDIwOC41ODFjMjMuOTgzLTAuMDEyLDQ2LjY0MS03LjA2NSw2My44MTQtMTkuODgxYzEuNzQzLTEuMzAxLDMuMzgxLTIuNjYxLDQuOTczLTQuMDQ0VjIzOS4wMDF6Ii8+Cgk8L2c+CjwvZz4KPGc+Cgk8Zz4KCQk8cGF0aCBkPSJNMTI1Ljg1MSwxMjkuODU5Yy02LjQxNCwwLTExLjYxOSw1LjIwNi0xMS42MTksMTEuNjE5YzAsNi40MjYsNS4yMDYsMTEuNjIsMTEuNjE5LDExLjYyICAgIGM2LjQyNiwwLDExLjYxOS01LjE5NCwxMS42MTktMTEuNjJDMTM3LjQ3LDEzNS4wNjUsMTMyLjI3NiwxMjkuODU5LDEyNS44NTEsMTI5Ljg1OXoiLz4KCTwvZz4KPC9nPgo8ZyBpZD0iU1ZHQ2xlYW5lcklkXzEiPgoJPGc+CgkJPHBhdGggZD0iTTM2Ny4yMjIsMjYxLjA2NmMtMi41NDUtNS44OTEtOS4zNzctOC41OTgtMTUuMjgtNi4wNTRjLTUuODc5LDIuNTQ1LTguNTk4LDkuMzg4LTYuMDU0LDE1LjI4ICAgIGM0LjYyNSwxMC42NzgtMC4zMDIsMjMuMTIzLTEwLjk5MiwyNy43NDdjLTMuMywxLjQyOS02Ljc4NiwxLjk2NC0xMC4yMzcsMS42NjJjLTEuMzgzLTQuNzY0LTUuNzQtOC4yNzMtMTAuOTY5LTguMzY2ICAgIGMtNi4zNTYtMC4xMDUtMTEuNzAxLDUuMDItMTEuNzk0LDExLjQzNGMtMC40NjUsMjkuMzI4LTI0LjQ3MSw1Mi44NjktNTMuNjk0LDUyLjg2OWMtMC4yOSwwLDAtMC4wOTMtMC4yOS0wLjEwNSAgICBjLTI5LjYwNi0wLjQ2NS01My4zMjItMjQuOTM1LTUyLjg0NS01NC41NTNjMC4xMDUtNi40MTQtNS4wMi0xMS43MDEtMTEuNDM0LTExLjc5NGMtNi4zOTEtMC4xMjgtMTEuODA1LDUuMDA4LTExLjgwNSwxMS40MzQgICAgYzAsNzkuMzI2LDc1Ljk2OCw3OC4yNTcsNzYuMzc1LDc4LjI1N2MzNS4wOTEsMCw2NC45MDYtMjMuNjkyLDc0LjAzOS01Ni4wNzZjMS40MTgsMC4xMjgsMi44NDcsMC4yMDksNC4yNjQsMC4yMDkgICAgYzUuOTk2LDAsMTIuMDAzLTEuMjA4LDE3LjYxNS0zLjYzN0MzNjYuNTcxLDMwOS42NTksMzc2LjkyNCwyODMuNTE1LDM2Ny4yMjIsMjYxLjA2NnoiLz4KCTwvZz4KPC9nPgo8Zz4KCTxnPgoJCTxwYXRoIGQ9Ik0xMjUuODUxLDEyOS44NTljLTYuNDE0LDAtMTEuNjE5LDUuMjA2LTExLjYxOSwxMS42MTljMCw2LjQyNiw1LjIwNiwxMS42MiwxMS42MTksMTEuNjIgICAgYzYuNDI2LDAsMTEuNjE5LTUuMTk0LDExLjYxOS0xMS42MkMxMzcuNDcsMTM1LjA2NSwxMzIuMjc2LDEyOS44NTksMTI1Ljg1MSwxMjkuODU5eiIvPgoJPC9nPgo8L2c+CjxnPgoJPGc+CgkJPHBhdGggZD0iTTM2Ny4yMjIsMjYxLjA2NmMtMi41NDUtNS44OTEtOS4zNzctOC41OTgtMTUuMjgtNi4wNTRjLTUuODc5LDIuNTQ1LTguNTk4LDkuMzg4LTYuMDU0LDE1LjI4ICAgIGM0LjYyNSwxMC42NzgtMC4zMDIsMjMuMTIzLTEwLjk5MiwyNy43NDdjLTMuMywxLjQyOS02Ljc4NiwxLjk2NC0xMC4yMzcsMS42NjJjLTEuMzgzLTQuNzY0LTUuNzQtOC4yNzMtMTAuOTY5LTguMzY2ICAgIGMtNi4zNTYtMC4xMDUtMTEuNzAxLDUuMDItMTEuNzk0LDExLjQzNGMtMC40NjUsMjkuMzI4LTI0LjQ3MSw1Mi44NjktNTMuNjk0LDUyLjg2OWMtMC4yOSwwLDAtMC4wOTMtMC4yOS0wLjEwNSAgICBjLTI5LjYwNi0wLjQ2NS01My4zMjItMjQuOTM1LTUyLjg0NS01NC41NTNjMC4xMDUtNi40MTQtNS4wMi0xMS43MDEtMTEuNDM0LTExLjc5NGMtNi4zOTEtMC4xMjgtMTEuODA1LDUuMDA4LTExLjgwNSwxMS40MzQgICAgYzAsNzkuMzI2LDc1Ljk2OCw3OC4yNTcsNzYuMzc1LDc4LjI1N2MzNS4wOTEsMCw2NC45MDYtMjMuNjkyLDc0LjAzOS01Ni4wNzZjMS40MTgsMC4xMjgsMi44NDcsMC4yMDksNC4yNjQsMC4yMDkgICAgYzUuOTk2LDAsMTIuMDAzLTEuMjA4LDE3LjYxNS0zLjYzN0MzNjYuNTcxLDMwOS42NTksMzc2LjkyNCwyODMuNTE1LDM2Ny4yMjIsMjYxLjA2NnoiLz4KCTwvZz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4=",
    // },
    // tree: {
    //   id: "tree",
    //   name: "Tree",
    //   url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjk3IDI5NyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjk3IDI5NzsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8cGF0aCBkPSJNMjY5LjM5Nyw5My4wMTFDMjU1LjIwMSwzOS41MywyMDYuMzg2LDAsMTQ4LjUsMEM4MC42MDUsMCwyNS4xNzEsNTQuMzc3LDIzLjQ2MiwxMjEuODY3ICBjLTEwLjM4NiwxNC45MTctMTYuNDg2LDMzLjAzMS0xNi40ODYsNTIuNTQ1YzAsNS41MDQsNC40NjMsOS45NjYsOS45NjYsOS45NjZoNjUuMTU1YzUuMjY2LDEwLjUzMSwxNS41NzEsMjQuNDM0LDM0Ljc1MiwzMC44OSAgbC01LjY5Miw3MC45NjhjLTAuMjIzLDIuNzczLDAuNzI0LDUuNTEzLDIuNjEsNy41NTdjMS44ODcsMi4wNDUsNC41NDIsMy4yMDcsNy4zMjQsMy4yMDdoNTQuODE1YzIuNzgsMCw1LjQzNC0xLjE2MSw3LjMyLTMuMjAzICBjMS44ODctMi4wNDIsMi44MzUtNC43NzksMi42MTUtNy41NTFsLTYuODkyLTg2Ljk4YzMxLjQxMy05LjEyNyw0Ni4zMjYtMzIuNjgzLDUyLjg1MS00Ny43NzZoNDguMjU2ICBjNS41MDQsMCw5Ljk2Ni00LjQ2Myw5Ljk2Ni05Ljk2NkMyOTAuMDIzLDEyMi40OTcsMjgyLjEwMSwxMDUuMjk2LDI2OS4zOTcsOTMuMDExeiBNMTQ4LjUsMTkuOTMzICBjNDAuNTk5LDAsNzUuODc3LDIzLjE0Myw5My4zOSw1Ni45MTljLTYuMTQ1LTEuODQ2LTEyLjY1MS0yLjg1MS0xOS4zODktMi44NTFjLTI1LjI2NSwwLTQ3LjMxNiwxMy45NTctNTguODksMzQuNTU4ICBjLTE2LjYzNC0xNi4yODEtMzkuMzg1LTI2LjMzNi02NC40NDQtMjYuMzM2Yy0xOS40NjUsMC0zNy41MzcsNi4wNjktNTIuNDMzLDE2LjQwN0M1OC40OTMsNTMuNDE2LDk5LjY1NiwxOS45MzMsMTQ4LjUsMTkuOTMzeiAgIE05OS4xNjYsMTAyLjE1NmMzNi40NjIsMCw2Ni43MDMsMjcuMTQ2LDcxLjU3Miw2Mi4yOUgyNy41OTVDMzIuNDYzLDEyOS4zMDIsNjIuNzA0LDEwMi4xNTYsOTkuMTY2LDEwMi4xNTZ6IE0xMDUuNzIzLDE4NC4zNzkgIGgxMy42MDVsLTAuODA2LDEwLjA1NkMxMTMuMDU4LDE5MS43NTUsMTA4Ljg4MSwxODguMTI4LDEwNS43MjMsMTg0LjM3OXogTTEzMS44OSwyNzcuMDY3bDcuNDM1LTkyLjY4OGgxOC40NTFsNy4zNDQsOTIuNjg4SDEzMS44OXogICBNMTkxLjMwOCwxNzEuNTY0Yy0wLjIxMS02LjkwNy0xLjE4MS0xMy42MjYtMi44MzctMjAuMDc0aDIxLjA2M0MyMDUuNjIsMTU4LjE3MiwxOTkuNzk1LDE2NS41OTYsMTkxLjMwOCwxNzEuNTY0eiAgIE0xODAuNzY4LDEzMS41NTdjLTEuMDExLTEuOTE3LTIuMDg3LTMuNzk1LTMuMjI2LTUuNjNjNi40NzItMTguNjAzLDI0LjE3OS0zMS45OTMsNDQuOTU5LTMxLjk5MyAgYzIyLjgyNCwwLDQxLjk0NiwxNi4xNTIsNDYuNTQsMzcuNjIzSDE4MC43Njh6Ii8+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPg==",
    // },
    // pine: {
    //   id: "pine",
    //   name: "Pine",
    //   url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjk3IDI5NyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjk3IDI5NzsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8cGF0aCBkPSJNMjY1LjQzNSwyNDQuNDE0bC01NC4zODItNjUuODQzaDMxLjE3NWMzLjc2NywwLDcuMTk1LTIuMTc0LDguOC01LjU4MmMxLjYwNC0zLjQwOCwxLjA5OC03LjQzNi0xLjMtMTAuMzRsLTU0LjM4My02NS44NDMgIGgxNy4wNDJjMy43NjcsMCw3LjE5NS0yLjE3NCw4LjgtNS41ODJjMS42MDQtMy40MDgsMS4wOTgtNy40MzYtMS4zLTEwLjM0TDE1NiwzLjUzM0MxNTQuMTUyLDEuMjk2LDE1MS40MDIsMCwxNDguNSwwICBzLTUuNjUyLDEuMjk2LTcuNSwzLjUzM0w3Ny4xMTIsODAuODg0Yy0yLjM5OSwyLjkwNC0yLjkwNSw2LjkzMi0xLjMsMTAuMzRjMS42MDUsMy40MDgsNS4wMzQsNS41ODIsOC44LDUuNTgyaDE3LjA0MiAgbC01NC4zODMsNjUuODQzYy0yLjM5OSwyLjkwNC0yLjkwNSw2LjkzMi0xLjMsMTAuMzRjMS42MDUsMy40MDgsNS4wMzQsNS41ODIsOC44LDUuNTgyaDMxLjE3NWwtNTQuMzgyLDY1Ljg0MyAgYy0yLjM5OSwyLjkwNC0yLjkwNSw2LjkzMi0xLjMsMTAuMzRjMS42MDUsMy40MDgsNS4wMzQsNS41ODIsOC44LDUuNTgyaDY4LjQ4M3YyNi45MzZjMCw1LjM3Miw0LjM1Niw5LjcyOCw5LjcyOCw5LjcyOGg2Mi40NSAgYzUuMzcyLDAsOS43MjgtNC4zNTYsOS43MjgtOS43Mjh2LTI2LjkzNmg2OC40ODNjMy43NjcsMCw3LjE5NS0yLjE3NCw4LjgtNS41ODJDMjY4LjM0LDI1MS4zNDYsMjY3LjgzNCwyNDcuMzE4LDI2NS40MzUsMjQ0LjQxNHogICBNMTQ4LjUsMjUuMDAzbDQzLjIzNyw1Mi4zNDloLTg2LjQ3M0wxNDguNSwyNS4wMDN6IE0xMjYuODg4LDk2LjgwN2g0My4yMjRsNTEuNDY0LDYyLjMxSDc1LjQyM0wxMjYuODg4LDk2LjgwN3ogTTE2OS45OTgsMjc3LjU0NSAgaC00Mi45OTV2LTE3LjIwOGg0Mi45OTVWMjc3LjU0NXogTTU5LjcxNiwyNDAuODgybDUxLjQ2NC02Mi4zMWg3NC42NGw1MS40NjQsNjIuMzFINTkuNzE2eiIvPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4=",
    // },
    // palm: {
    //   id: "palm",
    //   name: "Palm",
    //   url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjk3IDI5NyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjk3IDI5NzsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8cGF0aCBkPSJNMjc5LjQ5OSwxNTYuNzI1Yy0wLjM2Ny0wLjgzLTkuMjA5LTIwLjQ4NS0yOS4xNTEtMzYuNTc4Yy0xMi4yMzYtOS44NzUtMzAuMjY2LTE5LjYxNi01NC40OC0yMC44MDUgIGMyMS41MzktMTEuNjM4LDMzLjk3Mi0yOC4yOTQsNDEuMDc3LTQyLjY1M2MxMS44MTYtMjMuODc2LDExLjYwMy00Ni4yNjcsMTEuNTg4LTQ3LjIwOGMtMC4wNDctMi45ODUtMS40NzUtNS43NzktMy44NjYtNy41NjUgIGMtMi4zOS0xLjc4Ni01LjQ3Ni0yLjM2Mi04LjM1LTEuNTYzYy00Ny4wOSwxMy4xMTMtNzAuNTg0LDM5Ljk4MS04Mi4wMDIsNjAuMjExYy0zLjY2Miw2LjQ4OC02LjM0MiwxMi43MTYtOC4zMTEsMTguMzA4ICBjLTIuNDItNS40ODYtNS42MjEtMTEuNTc1LTkuODU0LTE3Ljg1MkMxMjMuMTYzLDQxLjc2LDk3LjYwOCwxNi44NDMsNDkuNjI3LDcuNTEyYy0yLjkzLTAuNTY3LTUuOTU4LDAuMjUxLTguMiwyLjIyMiAgYy0yLjI0MSwxLjk3MS0zLjQ0Miw0Ljg2OS0zLjI1Miw3Ljg0N2MwLjA2LDAuOTQsMS42MjUsMjMuMjc3LDE1LjMsNDYuMTRjNy40OTUsMTIuNTMxLDE5LjU1LDI2LjYxNSwzOC41OCwzNi41MDEgIGMtMTkuNjk2LDIuODM4LTM0Ljc1LDExLjMyNi00NS40MDQsMTkuOTI1Yy0xOS45NDIsMTYuMDkzLTI4Ljc4NCwzNS43NDktMjkuMTUxLDM2LjU3OGMtMS4yMDcsMi43MjktMS4wODEsNS44NjQsMC4zNDEsOC40ODggIHMzLjk4MSw0LjQ0LDYuOTI3LDQuOTE3YzkuMDE4LDEuNDYyLDE3LjQ2LDIuMTA5LDI1LjM1NCwyLjEwOWMzMi43LDAsNTUuODc3LTExLjEzLDcwLjQ3My0yMS42NTQgIGM0Ljc5Ni0zLjQ1OCw4LjkzNi03LjAzMywxMi40NzItMTAuNDc3YzkuMjczLDQ5LjM3NCwxLjgwOCw5OS4zNjItMjEuNjUsMTQyLjY3M2MtMS42MTcsMi45ODUtMS41NDMsNi42MDEsMC4xOTQsOS41MTcgIGMxLjczNywyLjkxNyw0Ljg4MSw0LjcwMyw4LjI3Niw0LjcwM2g3MS45ODJjNC44OTUsMCw5LjAxMi0zLjY3MSw5LjU3LTguNTM1YzUuMTg1LTQ1LjE3OS0wLjQ3OC05MC41NjUtMTYuMDI4LTEzMi4wNDIgIGMxNC41MDgsOC40MjgsMzQuODIyLDE1LjgxNSw2MS40NjUsMTUuODE1YzcuODkyLDAsMTYuMzM5LTAuNjQ4LDI1LjM1NC0yLjEwOWMyLjk0Ni0wLjQ3Nyw1LjUwNS0yLjI5Myw2LjkyNy00LjkxNyAgUzI4MC43MDYsMTU5LjQ1MywyNzkuNDk5LDE1Ni43MjV6IE0yMjcuOTA0LDIzLjM3NGMtMy42NTIsMjAuMjM2LTE3LjAwNCw1Ni44OTQtNjUuNjU5LDY4LjAyMSAgQzE2Ny4xOTgsNzMuNTcxLDE4Mi4zMTIsNDAuODIxLDIyNy45MDQsMjMuMzc0eiBNNTkuODM4LDI5Ljc3M2MyNi4xMDYsNy42MDgsNDYuMTg5LDIxLjQ0OSw1OS44MjcsNDEuMjY1ICBjNS40MTQsNy44NjUsOC44NjMsMTUuNDE2LDExLjAxOSwyMS4zNDVDODEuMjkyLDg1LjE1LDY1LjA3OCw0OS42NSw1OS44MzgsMjkuNzczeiBNMTA4LjU4OCwxMzUuNDg2ICBjLTE4LjU2OCwxMy4xMTEtNDAuODcsMTguOS02Ni40NiwxNy4yNTVjMTEuNDAzLTE2LjAyNCwzNy4zMzktNDEuNTMzLDgyLjk1NC0zMi4yNDEgIEMxMjEuMjE0LDEyNS4wMDUsMTE1Ljc2NywxMzAuNDE2LDEwOC41ODgsMTM1LjQ4NnogTTE4My4xNDIsMjc3LjczNWgtNDcuNzA0YzIxLjQzOC00Ny4wNjMsMjYuNDUxLTEwMC4xNiwxNC4yODEtMTUyLjA2MSAgQzE3NS44MjEsMTcwLjk4MiwxODcuNTUxLDIyNC4yODksMTgzLjE0MiwyNzcuNzM1eiBNMTg4LjQxMiwxMzUuNDg2Yy03LjE4MS01LjA3MS0xMi42MjktMTAuNDgzLTE2LjQ5NS0xNC45ODYgIGM0NS42MTItOS4yOTMsNzEuNTUxLDE2LjIxOCw4Mi45NTMsMzIuMjQyQzIyOS4yOTMsMTU0LjM3MywyMDYuOTc4LDE0OC41OTYsMTg4LjQxMiwxMzUuNDg2eiIvPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8Zz4KPC9nPgo8L3N2Zz4=",
    // },
    // cactus: {
    //   id: "cactus",
    //   name: "Cactus",
    //   url: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIGlkPSJDYXBhXzEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMjk3IDI5NyIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjk3IDI5NzsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8cGF0aCBkPSJNMTE0LjEyNiw1MS42ODRoLTExLjM3NmMtMy44MjQsMC02LjkyNCwzLjEtNi45MjQsNi45MjRzMy4xLDYuOTI0LDYuOTI0LDYuOTI0aDExLjM3NnYxOC43OTRoLTExLjM3NiAgYy0zLjgyNCwwLTYuOTI0LDMuMS02LjkyNCw2LjkyNHMzLjEsNi45MjQsNi45MjQsNi45MjRoMTEuMzc2djQ4LjQ3aC0yMS4wMnYtMjIuNzUxYzAtMTQuNDU0LTExLjc1OS0yNi4yMTMtMjYuMjEzLTI2LjIxMyAgUzQwLjY4LDEwOS40NCw0MC42OCwxMjMuODk0djkuMzk3aC02LjQzYy0zLjgyNCwwLTYuOTI0LDMuMS02LjkyNCw2LjkyNHMzLjEsNi45MjQsNi45MjQsNi45MjRoNi40M3YxOC43OTRoLTYuNDMgIGMtMy44MjQsMC02LjkyNCwzLjEtNi45MjQsNi45MjRjMCwzLjgyNCwzLjEsNi45MjQsNi45MjQsNi45MjRoNy43OTZjNS4wMzgsMjAuNDE5LDIzLjUwMSwzNS42MSw0NS40NTQsMzUuNjFoMTguNDY1djcxLjcxNSAgYzAsNS40NjMsNC40MjksOS44OTIsOS44OTIsOS44OTJoNjUuMjg2YzUuNDYzLDAsOS44OTItNC40MjksOS44OTItOS44OTJWMTgyLjc1aDE3Ljg4N2MyMi4wNjgsMCw0MC42Ni0xNS4xNTksNDUuOTE0LTM1LjYxaDcuOTE0ICBjMy44MjQsMCw2LjkyNC0zLjEsNi45MjQtNi45MjRzLTMuMS02LjkyNC02LjkyNC02LjkyNGgtNi40M3YtMTguNzk0aDYuNDNjMy44MjQsMCw2LjkyNC0zLjEsNi45MjQtNi45MjQgIGMwLTMuODI0LTMuMS02LjkyNC02LjkyNC02LjkyNGgtNi40M3YtOS4zOTdjMC0xNC40NTQtMTEuNzU5LTI2LjIxMy0yNi4yMTMtMjYuMjEzcy0yNi4yMTMsMTEuNzU5LTI2LjIxMywyNi4yMTN2MjIuNzUxaC0yMS4wMiAgdi00OC40N2gxMi4zNjVjMy44MjQsMCw2LjkyNC0zLjEsNi45MjQtNi45MjRzLTMuMS02LjkyNC02LjkyNC02LjkyNGgtMTIuMzY1YzAtNS44ODQtMS40ODgtMTIuNjYyLTQuMTA0LTE3LjUwOWw3LjEwNi03LjEwNiAgYzIuNzA0LTIuNzA1LDIuNzA0LTcuMDg4LDAtOS43OTNjLTIuNzA1LTIuNzAzLTcuMDg4LTIuNzAzLTkuNzkzLDBsLTYuMjQ5LDYuMjQ5Yy00LjE0LTMuMjg3LTkuMDQ2LTUuNjQ5LTE0LjQwOS02Ljc1VjYuOTI0ICBjMC0zLjgyNC0zLjEtNi45MjQtNi45MjQtNi45MjRzLTYuOTI0LDMuMS02LjkyNCw2LjkyNHY5Ljg1MWMtNS4zNjQsMS4xMDEtMTAuMjcsMy40NjMtMTQuNDA5LDYuNzVsLTYuMjQ5LTYuMjQ5ICBjLTIuNzA1LTIuNzAzLTcuMDg4LTIuNzAzLTkuNzkzLDBjLTIuNzA0LDIuNzA1LTIuNzA0LDcuMDg4LDAsOS43OTNsNy4xMDYsNy4xMDZDMTE1LjYxNCwzOS4wMjMsMTE0LjEyNiw0NS44MDEsMTE0LjEyNiw1MS42ODR6ICAgTTIzNi41MzcsMTM1LjM1M2MwLDE1LjIyNi0xMi4zODgsMjcuNjE0LTI3LjYxNSwyNy42MTRoLTI3Ljc3OWMtNS40NjMsMC05Ljg5Miw0LjQyOS05Ljg5Miw5Ljg5MnYxMDQuMzU4aC00NS41MDJ2LTcxLjcxNSAgYzAtNS40NjMtNC40MjktOS44OTItOS44OTItOS44OTJIODcuNTAxYy0xNC45MDgsMC0yNy4wMzctMTIuMTI5LTI3LjAzNy0yNy4wMzh2LTQ0LjY3N2MwLTMuNTQ1LDIuODg0LTYuNDMsNi40My02LjQzICBzNi40MywyLjg4NCw2LjQzLDYuNDN2MzIuNjQzYzAsNS40NjMsNC40MjksOS44OTIsOS44OTIsOS44OTJoNDAuODAzYzUuNDYzLDAsOS44OTItNC40MjksOS44OTItOS44OTJWNTAuNDQ4ICBjMC04LjA0NSw2LjU0Ni0xNC41OSwxNC41OS0xNC41OXMxNC41OSw2LjU0NiwxNC41OSwxNC41OXY3My40NDZjMCw1LjQ2Myw0LjQyOSw5Ljg5Miw5Ljg5Miw5Ljg5Mmg0MC44MDMgIGM1LjQ2MywwLDkuODkyLTQuNDI5LDkuODkyLTkuODkyVjkxLjI1MWMwLTMuNTQ1LDIuODg0LTYuNDMsNi40My02LjQzczYuNDMsMi44ODQsNi40Myw2LjQzVjEzNS4zNTN6Ii8+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPg==",
    // },
  },
  colorChoices: [],
  getColorChoiceClickHandler: (cc) => {
    return (e) => {
      drawHorse.selectedColor = cc.id;
      let colorChoiceControls = document.getElementsByClassName("colorChoice");
      for (var i = 0; i < colorChoiceControls.length; i++) {
        colorChoiceControls[i].classList.remove("selectedColorChoice");
      }
      e.target.classList.add("selectedColorChoice");
    };
  },
  undoStack: [],
  ctx: undefined,
  pos: { x: 0, y: 0 },
  beginPosition: (e) => {
    drawHorse.setPosition(e);
    // if (drawHorse.currentTool.drawsImmediately) {
    //   drawHorse.draw(e);
    // }
  },
  endPosition: (e) => {
    drawHorse.currentTool.stopDrawing(e);
    drawHorse.setPosition(e);
    drawHorse.undoStack.push(
      drawHorse.ctx.getImageData(
        0,
        0,
        drawHorse.ctx.canvas.width,
        drawHorse.ctx.canvas.height
      )
    );
  },
  setPosition: (e) => {
    if (e.target === drawHorse.canvas) e.preventDefault();
    var bcr = e.target.getBoundingClientRect();
    if (e.touches) var touch = e.touches[0];
    if (touch) {
      drawHorse.pos.x = touch.clientX - bcr.x;
      drawHorse.pos.y = touch.clientY - bcr.y;
    } else {
      drawHorse.pos.x = e.clientX - bcr.x;
      drawHorse.pos.y = e.clientY - bcr.y;
    }
  },
  resize: () => {
    drawHorse.canvasWidth = drawHorse.stretcher.offsetWidth;
    drawHorse.canvasHeight = Math.floor(
      0.95 *
        (window.innerHeight -
          drawHorse.header.offsetHeight -
          drawHorse.colors.offsetHeight)
    );
    drawHorse.ctx.canvas.width = drawHorse.stretcher.offsetWidth;
    drawHorse.ctx.canvas.height = drawHorse.canvasHeight;
    drawHorse.stretcher.style.height = drawHorse.canvasHeight + "px";
    drawHorse.stretcher.setAttribute(
      "style",
      "width:" +
        drawHorse.canvasWidth +
        "px;height:" +
        drawHorse.canvasHeight +
        "px;"
    );
  },
  draw: (e) => {
    
    if ((e.buttons && e.buttons === 1) || (e.touches && e.touches.length > 0))
      drawHorse.currentTool.draw(e);
  },
  makeStampChoiceHandler: (cc) => {
    return (e) => {
      drawHorse.selectedStamp = drawHorse.stamps[cc.id];
    };
  },
  setupTools: () => {
    var toolButtons = document.getElementsByClassName("tool");
    for (var i = 0; i < toolButtons.length; i++) {
      let toolButton = toolButtons[i];
    }
  },
  setupStamps: () => {
    Object.entries(drawHorse.stamps).forEach(([key, value]) => {
      let stampchooser = document.getElementById("stampchooser");
      stampchooser.innerHTML =
        stampchooser.innerHTML +
        "<button id='" +
        value.id +
        "' class='stampchoice'>" +
        "<img width='30px' max-width='30px' max-height='30px' src='" +
        "data:image/svg+xml;base64," + 
        window.btoa(
          window.atob(value.url)
          .replaceAll(
            "%%%%", 
            " style='fill:" +
              drawHorse.selectedColor + 
              ";stroke:" + 
              drawHorse.selectedColor + 
              ";' "
          )
        ) +
        //value.url +
        "' alt='" +
        value.name +
        "'/>" +
        "</button>";
    });
    var stampChoices = document.getElementsByClassName("stampchoice");

    for (var i = 0; i < stampChoices.length; i++) {
      stampChoices[i].onclick = drawHorse.makeStampChoiceHandler(
        stampChoices[i]
      );
    }
    drawHorse.selectedStamp = drawHorse.stamps["horse"];
  },
  showStampSelectors: () => {
    //let colorchooser = document.getElementById("colorchooser");
    let stampchooser = document.getElementById("stampchooser");
    //colorchooser.style.display = "none";
    stampchooser.style.display = "";
  },
  hideStampSelectors: () => {
    let stampchooser = document.getElementById("stampchooser");
    stampchooser.style.display = "none";

  },
  showColorSelectors: () => {
    let colorchooser = document.getElementById("colorchooser");
    //let stampchooser = document.getElementById("stampchooser");
    colorchooser.style.display = "";
    //stampchooser.style.display = "none";
  },
  addListeners: () => {
    window.addEventListener("resize", drawHorse.resize);
    
    document.addEventListener(
      "click",
      function (e) {
        if (!event.target.closest(".tool")) return;
        // handle tool clicks
        let tool = tools[event.target.closest(".tool").id];
        let toolControls = document.getElementsByClassName("tool");

        if (tool.selectable) {
          for (var i = 0; i < toolControls.length; i++) {
            toolControls[i].classList.remove("selectedControl");
          }
          event.target.closest(".tool").classList.add("selectedControl");
          drawHorse.currentTool = tool;
        }
        tool.onclick(e);
      },
      false
    );
    drawHorse.canvas.addEventListener("mousemove", function(e){if(!drawHorse.currentTool.drawsImmediately)drawHorse.draw(e)});
    drawHorse.canvas.addEventListener("mousedown", function(e){drawHorse.beginPosition(e); drawHorse.draw(e)});
    drawHorse.canvas.addEventListener("mouseup", function(e){drawHorse.endPosition(e);});
    //drawHorse.canvas.addEventListener("mouseenter", drawHorse.endPosition);

    drawHorse.canvas.addEventListener("touchmove", drawHorse.draw);
    drawHorse.canvas.addEventListener("touchstart", function(e){drawHorse.beginPosition(e);drawHorse.draw(e)});
    drawHorse.canvas.addEventListener("touchend", function(e){drawHorse.endPosition(e)});
  },
  setupColorChooser: () => {
    drawHorse.colorChoices = document.getElementsByClassName("colorChoice");
    for (var i = 0; i < drawHorse.colorChoices.length; i++) {
      drawHorse.colorChoices[i].onclick = drawHorse.getColorChoiceClickHandler(
        drawHorse.colorChoices[i]
      );
    }
  },
};
// end defining drawHorse obj

// handle setting up the canvas and initializing drawHorse

window.onload = (event) => {
  // find all the color choices from the document
  drawHorse.setupColorChooser();
  //setup the document size
  drawHorse.canvasWidth = drawHorse.stretcher.offsetWidth;
  drawHorse.canvasHeight = Math.floor(
    0.95 *
      (window.innerHeight -
        drawHorse.header.offsetHeight -
        drawHorse.colors.offsetHeight)
  );
  document.body.style.margin = 0;
  //drawHorse.canvas.style.position = "fixed";
  drawHorse.canvas.style.width = drawHorse.stretcher.offsetWidth;
  drawHorse.canvas.style.height = drawHorse.canvasHeight;
  drawHorse.stretcher.style.height = drawHorse.canvasHeight + "px";
  drawHorse.stretcher.setAttribute(
    "style",
    "width:" +
      drawHorse.canvasWidth +
      "px;height:" +
      drawHorse.canvasHeight +
      "px;"
  );
  drawHorse.ctx = drawHorse.canvas.getContext("2d");
  drawHorse.resize();
  // add mouse and touch listeners
  drawHorse.addListeners();
  //set up the stamp selection buttons
  drawHorse.setupStamps();

  //setup click handlers for controls
  drawHorse.setupTools();
};
// end onload
