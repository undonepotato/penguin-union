"use strict";
// Still an inconsistent, barely object-oriented mess, but it still works.
const canvas = document.querySelector(".mainGameCanvas");
const highScoreLabel = document.querySelector("#highScoreLabel");
// TODO LIST:
// Feature request point
// Make the canvas a bit smaller than the window height/width
const width = (canvas.width =
  window.innerWidth - Math.floor(window.innerWidth / 10));
const height = (canvas.height =
  window.innerHeight - Math.floor(window.innerHeight / 10));
const ctx = canvas.getContext("2d");
let possibleColors = ["#bebeef", "#8c8cd9", "#50509f"]; // Possible colors for obstacle Circles.
let drawnCircles = []; // A constanly-updating list of obstacle Circles that should be drawn.
let textColor = "#313144";
let textEffectColor = "#e7e788";
let useEffectColor = false;
let textFont = "96px Open Sans";
let playerColor = "#313144";
let playerScore = 1; // This value, multiplied by 3, is the player circle's radius.
let playerAscensions = 1;
let playerRadius = playerScore * 3;
let obstacleGeneration = 8; // Higher numbers are less frequent.
let obstacleGenerationUpdated = false;
let alive = false; // Player is alive. False by default, so you have to click to start.
let curX; // Cursor X pos, relative to the canvas (used for tracking and drawing of player circle)
let curY; // Cursor Y pos, relative to the canvas
let requestID;
ctx.fillStyle = textColor;
ctx.font = textFont;
let gameOverSize = ctx.measureText("Click to start").width;
ctx.fillText("Click to start", width / 2 - gameOverSize / 2, height / 2);
// Update mouse pointer coordinates
canvas.addEventListener("mousemove", (event) => {
  curX = event.offsetX;
  curY = event.offsetY;
});
canvas.removeEventListener("click", restart);
canvas.addEventListener("click", restart);
let retrievedHighScore = localStorage.getItem("highScore");
let retrievedHighAscensions = localStorage.getItem("highAscensions");
if (retrievedHighScore) {
  if (Number(retrievedHighAscensions) > 1) {
    highScoreLabel.textContent = `High Score: A${retrievedHighAscensions} + ${retrievedHighScore}`;
  } else {
    highScoreLabel.textContent = `High Score: ${retrievedHighScore}`;
  }
}
let highScore = Number(retrievedHighScore);
let highAscensions = Number(retrievedHighAscensions);
function draw() {
  if (alive) {
    drawBackground();
    // Create new circles
    if (rand(1, obstacleGeneration) === 1) {
      let newCircleColor = possibleColors[rand(0, 1)];
      let newCircleEatble = !Boolean(rand(0, 2)); // Is the new circle "eatable" by the player?
      let newCircleRadius = newCircleEatble
        ? rand(1, playerRadius)
        : rand(playerRadius + 10, playerRadius + 50);
      let xCircle = Boolean(rand(0, 1)); // Circle will be spawned randomly on the x-axis, with two possible initial y-values.
      // Basically that means it'll start on the top or bottom.
      if (xCircle) {
        var newCircleX = rand(0, width);
        var newCircleY = [-50, height + 50][rand(0, 1)];
        var newCircleXVelocity = rand(-1, 1);
        if (newCircleY === -50) {
          var newCircleYVelocity = rand(1, 4);
        } else {
          var newCircleYVelocity = rand(-1, -4);
        }
      } else {
        var newCircleY = rand(0, height);
        var newCircleX = [-50, width + 50][rand(0, 1)];
        var newCircleYVelocity = rand(-1, 1);
        if (newCircleX === -50) {
          var newCircleXVelocity = rand(1, 4);
        } else {
          var newCircleXVelocity = rand(-1, -4);
        }
      }
      let newCircle = new Circle(
        newCircleX,
        newCircleY,
        newCircleColor,
        newCircleRadius,
        newCircleXVelocity,
        newCircleYVelocity,
      );
      drawnCircles.push(newCircle);
      ctx.fillStyle = newCircle.color;
      ctx.beginPath();
      ctx.arc(
        newCircle.x,
        newCircle.y,
        newCircle.radius,
        degToRad(0),
        degToRad(360),
      );
      ctx.fill();
    }
    // Move already-existing circles and check for collisions
    for (let circle of drawnCircles) {
      // Collision check
      const dx = curX - circle.x;
      const dy = curY - circle.y;
      if (Math.sqrt(dx * dx + dy * dy) < playerRadius + circle.radius) {
        // touching
        if (playerRadius >= circle.radius) {
          playerScore++;
          obstacleGenerationUpdated = false;
          circle.queuedForRemoval = true;
        } else {
          die();
          return;
        }
      }
      // The amount of pixels to wait offscreen before queueing for deletion.
      // Generally, this should be at least the circle's radius plus a good amount of 'grace pixels'
      // to make sure larger circles aren't automatically deleted.
      let offscreenGracePixels = circle.radius + 100;
      if (
        circle.x < 0 - offscreenGracePixels ||
        circle.x > width + offscreenGracePixels ||
        circle.y < 0 - offscreenGracePixels ||
        circle.y > height + offscreenGracePixels
      ) {
        circle.queuedForRemoval = true;
      }
      circle.x += circle.xVelocity;
      circle.y += circle.yVelocity;
      ctx.fillStyle = circle.color;
      ctx.beginPath();
      ctx.arc(circle.x, circle.y, circle.radius, degToRad(0), degToRad(360));
      ctx.fill();
    }
    // Delete obstacle Circles queued for deletion
    drawnCircles = drawnCircles.filter((value) => {
      return !value.queuedForRemoval;
    });
    // Draw player circle
    ctx.fillStyle = playerColor;
    ctx.beginPath();
    ctx.arc(curX, curY, playerRadius, degToRad(0), degToRad(360));
    ctx.fill();
    playerRadius = playerScore * 3;
    // Draw score at top-left
    ctx.fillStyle = textColor;
    ctx.font = textFont;
    let scoretoFill = String(playerScore);
    if (playerAscensions > 1) {
      scoretoFill += "/20";
    }
    ctx.fillText(scoretoFill, 0, 80);
    // Draw ascension score at bottom left (if applicable)
    if (playerAscensions !== 1) {
      if (useEffectColor) {
        ctx.fillStyle = textEffectColor;
      }
      ctx.fillText("A" + playerAscensions, 0, height - 10);
    }
    if (
      !(playerScore % 10) &&
      playerScore !== 0 &&
      !obstacleGenerationUpdated
    ) {
      obstacleGeneration += 4;
      obstacleGenerationUpdated = true;
    }
    // Check if ascension is possible
    if (playerScore >= 20) {
      playerAscend();
    }
    requestID = window.requestAnimationFrame(draw);
  }
}
class Circle {
  x;
  y;
  color;
  radius;
  xVelocity;
  yVelocity;
  queuedForRemoval;
  constructor(x, y, color, radius, xVelocity, yVelocity) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = radius;
    this.xVelocity = xVelocity;
    this.yVelocity = yVelocity;
    this.queuedForRemoval = false;
  }
}
function drawBackground() {
  ctx.fillStyle = "#e6e6fa";
  ctx.fillRect(0, 0, width, height);
}
function degToRad(deg) {
  return (deg * Math.PI) / 100;
}
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function weightedRandom(min, max) {
  return Math.round(max / (Math.random() * max + min));
}
function die() {
  alive = false;
  // Draw player circle
  ctx.fillStyle = playerColor;
  ctx.beginPath();
  ctx.arc(curX, curY, playerRadius, degToRad(0), degToRad(360));
  ctx.fill();
  playerRadius = playerScore * 3;
  // Last circle draw
  for (const circle of drawnCircles) {
    ctx.fillStyle = circle.color;
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, degToRad(0), degToRad(360));
    ctx.fill();
  }
  // Save high scores
  if (
    playerAscensions > highAscensions ||
    (playerAscensions == highAscensions && playerScore > highScore)
  ) {
    highScore = playerScore;
    highAscensions = playerAscensions;
    if (highAscensions > 1) {
      highScoreLabel.textContent = `High Score: A${playerAscensions} + ${playerScore}`;
    } else {
      highScoreLabel.textContent = `High Score: ${playerScore}`;
    }
    localStorage.setItem("highScore", playerScore.toString());
    localStorage.setItem("highAscensions", playerAscensions.toString());
    drawLastMessage(true);
    return;
  }
  drawLastMessage(false);
}
function drawLastMessage(isNewHighScore) {
  // Draw score at top-left
  ctx.fillStyle = textColor;
  ctx.font = textFont;
  let scoretoFill = String(playerScore);
  if (playerAscensions > 1) {
    scoretoFill += "/20";
  }
  ctx.fillText(scoretoFill, 0, 80);
  // Draw ascension score at bottom left (if applicable)
  if (playerAscensions !== 1) {
    if (useEffectColor) {
      ctx.fillStyle = textEffectColor;
    }
    ctx.fillText("A" + playerAscensions, 0, height - 10);
  }
  let displayedText = isNewHighScore ? "New High Score!" : "Game Over!";
  ctx.fillStyle = textColor;
  ctx.font = textFont;
  let displayedTextWidth = ctx.measureText(displayedText).width;
  ctx.fillText(displayedText, width / 2 - displayedTextWidth / 2, height / 2);
  ctx.font = "36px Open Sans";
  let clickToRestartWidth = ctx.measureText("Click to restart").width;
  ctx.fillText(
    "Click to restart",
    width / 2 - clickToRestartWidth / 2,
    height / 2 + 60,
  );
}
function restart() {
  // Can also be used as first start
  drawBackground();
  if (alive) {
    cancelAnimationFrame(requestID);
  }
  playerScore = 1;
  playerRadius = playerScore * 3;
  playerAscensions = 1;
  obstacleGeneration = 8;
  drawnCircles = [];
  alive = true;
  draw();
}
function playerAscend() {
  for (let circle of drawnCircles) {
    circle.radius /= 2;
  }
  playerAscensions++;
  obstacleGeneration = 8;
  playerScore = 3;
  playerRadius = playerScore * 3;
  ctx.font = textFont;
  ctx.fillStyle = textColor;
  useEffectColor = true;
  setTimeout(() => {
    useEffectColor = false;
  }, 2000);
}
