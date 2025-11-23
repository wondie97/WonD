// js/sprite.js - non-module Player

class Player {
  constructor(x, y, nickname) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;

    this.width = 36;
    this.height = 52;

    this.moveSpeed = 260;
    this.jumpPower = 520;
    this.gravity = 1500;
    this.maxFallSpeed = 900;

    this.onGround = false;
    this.facing = 1;

    this.nickname = nickname || "Player";
  }

  moveLeft() {
    this.vx = -this.moveSpeed;
    this.facing = -1;
  }

  moveRight() {
    this.vx = this.moveSpeed;
    this.facing = 1;
  }

  stopHorizontal() {
    this.vx = 0;
  }

  jump() {
    if (this.onGround) {
      this.vy = -this.jumpPower;
      this.onGround = false;
    }
  }

  applyPhysics(dt, groundY, worldWidth) {
    this.vy += this.gravity * dt;
    if (this.vy > this.maxFallSpeed) this.vy = this.maxFallSpeed;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const feet = this.y + this.height;
    if (feet >= groundY) {
      this.y = groundY - this.height;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    if (this.x < 0) this.x = 0;
    if (this.x + this.width > worldWidth) this.x = worldWidth - this.width;
  }

  draw(ctx) {
    const x = this.x;
    const y = this.y;
    const w = this.width;
    const h = this.height;

    // shadow
    ctx.beginPath();
    const shadowY = y + h + 6;
    ctx.ellipse(x + w / 2, shadowY, w * 0.45, 6, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.fill();

    // body
    const grad = ctx.createLinearGradient(x, y, x, y + h);
    grad.addColorStop(0, "#ffd166");
    grad.addColorStop(1, "#fca311");

    const r = 10;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();

    ctx.fillStyle = grad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.55)";
    ctx.stroke();

    // face
    const faceCx = x + w / 2;
    const faceCy = y + h * 0.28;
    ctx.beginPath();
    ctx.arc(faceCx, faceCy, 9, 0, Math.PI * 2);
    ctx.fillStyle = "#ffe6c7";
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.45)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // eye
    const eyeOffset = this.facing === 1 ? 3 : -3;
    ctx.beginPath();
    ctx.arc(faceCx + eyeOffset, faceCy - 1, 1.4, 0, Math.PI * 2);
    ctx.fillStyle = "#222";
    ctx.fill();

    // nickname
    ctx.font = "12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillText(this.nickname, x + w / 2 + 1, y - 10 + 1);
    ctx.fillStyle = "#f8f8f8";
    ctx.fillText(this.nickname, x + w / 2, y - 10);
  }
}

window.Player = Player;
