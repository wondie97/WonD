// js/main.js - non-module side-view demo

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const nickname = localStorage.getItem("wondie_nickname");
if (!nickname) {
  window.location.href = "index.html";
}

document.getElementById("hudNickname").textContent = `닉네임: ${nickname}`;
document.getElementById("btnBack").addEventListener("click", () => {
  localStorage.removeItem("wondie_nickname");
  window.location.href = "index.html";
});

const world = {
  width: 2400,
  height: canvas.height,
  groundY: canvas.height - 90,
};

const camera = {
  x: 0,
  y: 0,
  width: canvas.width,
  height: canvas.height,
  follow(player) {
    const targetX = player.x + player.width / 2 - this.width / 2;
    const lerpFactor = 0.12;
    this.x += (targetX - this.x) * lerpFactor;
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > world.width) this.x = world.width - this.width;
  },
};

const player = new window.Player(120, world.groundY - 52, nickname);

const keys = new Set();

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  if (["arrowleft", "arrowright", "arrowup", " ", "a", "d", "w"].includes(key)) {
    e.preventDefault();
  }
  keys.add(key);
});

window.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  keys.delete(key);
});

function handleInput() {
  let movingH = false;

  if (keys.has("arrowleft") || keys.has("a")) {
    player.moveLeft();
    movingH = true;
  }
  if (keys.has("arrowright") || keys.has("d")) {
    player.moveRight();
    movingH = true;
  }
  if (!movingH) {
    player.stopHorizontal();
  }

  if (keys.has("arrowup") || keys.has("w") || keys.has(" ")) {
    player.jump();
  }
}

let lastTime = 0;

function loop(timestamp) {
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  update(dt);
  render();

  requestAnimationFrame(loop);
}

function update(dt) {
  handleInput();
  player.applyPhysics(dt, world.groundY, world.width);
  camera.follow(player);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  drawBackground();
  drawGround();
  drawDecor();

  // debug: draw red box if anything 이상
  // ctx.fillStyle = "red";
  // ctx.fillRect(player.x, player.y, 10, 10);

  player.draw(ctx);

  ctx.restore();
}

function drawBackground() {
  const grad = ctx.createLinearGradient(0, 0, 0, world.height);
  grad.addColorStop(0, "#74b9ff");
  grad.addColorStop(0.4, "#4b7bec");
  grad.addColorStop(1, "#1e272e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, world.width, world.height);

  ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
  for (let i = 0; i < 6; i++) {
    const baseX = i * 420;
    ctx.beginPath();
    ctx.moveTo(baseX - 80, world.groundY);
    ctx.lineTo(baseX + 120, world.groundY - 120);
    ctx.lineTo(baseX + 320, world.groundY);
    ctx.closePath();
    ctx.fill();
  }
}

function drawGround() {
  const gy = world.groundY;
  const h = world.height - gy;

  ctx.fillStyle = "#2d3436";
  ctx.fillRect(0, gy, world.width, h);

  ctx.fillStyle = "#636e72";
  ctx.fillRect(0, gy - 4, world.width, 4);

  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  const tileW = 40;
  for (let x = 0; x < world.width; x += tileW) {
    ctx.fillRect(x + 4, gy - 10, tileW - 8, 6);
  }
}

function drawDecor() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.35)";

  for (let i = 0; i < 8; i++) {
    const baseX = 160 + i * 260;
    ctx.fillRect(baseX, world.groundY - 80, 8, 80);
    ctx.beginPath();
    ctx.arc(baseX + 4, world.groundY - 90, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(world.width / 2 - 100, world.groundY - 110);
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.fillRect(0, 0, 200, 60);
  ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
  ctx.fillRect(8, 8, 184, 44);

  ctx.font = "16px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#f5f6fa";
  ctx.fillText("WonDieWorld Plaza", 100, 30);
  ctx.restore();
}

requestAnimationFrame(loop);
