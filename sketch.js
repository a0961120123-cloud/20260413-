// === 遊戲設定 ===
let gridSize = 80; // 再次加大格子，減少數量
let gameTimeLimit = 15; 

// === 狀態變數 ===
let cols, rows, targetX, targetY, playerX, playerY;
let isWon = false;
let isGameOver = false;
let startTime, timeLeft;

// === 特效系統 ===
let waves = []; // 儲存擴散波

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 1); 
  calculateGrid();
  spawnGame();
  noCursor(); 
}

function draw() {
  // 基礎背景：極深綠黑色
  background(150, 100, 5); 

  // 1. 繪製網格
  drawGrid();

  // 2. 邏輯處理
  if (!isWon && !isGameOver) {
    handleTime();
    updatePlayerPosition();
  }

  // 3. 繪製玩家偵測點
  drawPlayerDot();

  // 4. 繪製「往外擴」的渲染特效
  drawWaves();

  // 5. 勝利時的螢幕綠色渲染層
  if (isWon) {
    drawWinOverlay();
  }

  // 6. UI 顯示
  drawUI();
}

// --- 繪圖函式 ---

function drawGrid() {
  stroke(150, 80, 20); // 墨綠色網格
  strokeWeight(1);
  for (let i = 0; i <= cols; i++) line(i * gridSize, 0, i * gridSize, height);
  for (let j = 0; j <= rows; j++) line(0, j * gridSize, width, j * gridSize);
}

function drawPlayerDot() {
  let d = dist(playerX, playerY, targetX, targetY);
  let senseDist = 8;
  let dotSize = map(d, senseDist, 0, 10, gridSize * 0.9, true);
  
  noStroke();
  if (isWon) {
    fill(120, 100, 100); // 亮綠
  } else if (isGameOver) {
    fill(0, 0, 20); // 失敗灰
  } else {
    // 越接近越亮的螢光綠
    let bright = map(d, senseDist, 0, 20, 100, true);
    let sat = map(d, senseDist, 0, 30, 100, true);
    fill(120, sat, bright); 
  }
  
  ellipse(playerX * gridSize + gridSize/2, playerY * gridSize + gridSize/2, dotSize);
}

function drawWinOverlay() {
  // 整個螢幕蓋上一層發光的綠色
  push();
  blendMode(ADD); // 使用濾色模式讓綠光更強
  fill(120, 100, 40, 0.3); 
  rect(0, 0, width, height);
  pop();
}

function drawWaves() {
  for (let i = waves.length - 1; i >= 0; i--) {
    waves[i].update();
    waves[i].display();
    if (waves[i].isDead()) waves.splice(i, 1);
  }
}

// --- 遊戲邏輯 ---

function handleTime() {
  let elapsed = floor((millis() - startTime) / 1000);
  timeLeft = gameTimeLimit - elapsed;
  if (timeLeft <= 0) {
    timeLeft = 0;
    isGameOver = true;
    cursor();
  }
}

function updatePlayerPosition() {
  playerX = constrain(floor(mouseX / gridSize), 0, cols - 1);
  playerY = constrain(floor(mouseY / gridSize), 0, rows - 1);
}

function mousePressed() {
  if (isWon || isGameOver) {
    spawnGame();
  } else if (playerX === targetX && playerY === targetY) {
    isWon = true;
    cursor();
    // 產生多重擴散波
    for (let i = 0; i < 5; i++) {
      waves.push(new Wave(mouseX, mouseY, i * 15));
    }
  }
}

function drawUI() {
  textAlign(CENTER, CENTER);
  if (!isWon && !isGameOver) {
    fill(120, 100, 100);
    textSize(40);
    text(timeLeft, width / 2, 50);
  } else if (isWon) {
    fill(120, 100, 100);
    textSize(60);
    text("MISSION ACCOMPLISHED", width/2, height/2);
    textSize(20);
    text("CLICK TO SCAN AGAIN", width/2, height/2 + 60);
  } else if (isGameOver) {
    fill(0, 100, 100);
    textSize(60);
    text("TIME EXPIRED", width/2, height/2);
    text("RETRY", width/2, height/2 + 60);
  }
}

function spawnGame() {
  calculateGrid();
  targetX = floor(random(cols));
  targetY = floor(random(rows));
  playerX = floor(random(cols));
  playerY = floor(random(rows));
  isWon = false;
  isGameOver = false;
  startTime = millis();
  waves = [];
  noCursor();
}

function calculateGrid() {
  cols = floor(width / gridSize);
  rows = floor(height / gridSize);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateGrid();
}

// === 擴散波類別 ===
class Wave {
  constructor(x, y, delay) {
    this.x = x;
    this.y = y;
    this.r = 0;
    this.delay = delay; // 延遲讓波紋有先後順序
    this.maxR = max(width, height) * 1.2;
    this.alpha = 1;
  }
  
  update() {
    if (this.delay > 0) {
      this.delay--;
    } else {
      this.r += 15; // 擴散速度
      this.alpha -= 0.015;
    }
  }
  
  display() {
    if (this.delay <= 0) {
      noFill();
      stroke(120, 100, 100, this.alpha);
      strokeWeight(4);
      ellipse(this.x, this.y, this.r);
    }
  }
  
  isDead() {
    return this.alpha <= 0;
  }
}