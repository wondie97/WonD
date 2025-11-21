/***************************
 * 캐릭터 스프라이트 정보
 ***************************/
const CHARACTER_SPRITES = {
  human: {
    walk: {
      src: "/img/sprites/human_walk.png",
      cols: 4,
      rows: 8,
      fps: 8
    }
  }
};

// 8방향 → 스프라이트 시트 row index
const DIR8 = {
  down: 0,
  downLeft: 1,
  left: 2,
  upLeft: 3,
  up: 4,
  upRight: 5,
  right: 6,
  downRight: 7,
};

/***********************
 *  스프라이트 시트
 ***********************/
class SpriteSheet {
  constructor(img, cols, rows) {
    this.image = img;
    this.cols = cols;
    this.rows = rows;
    this.frameWidth = 0;
    this.frameHeight = 0;
  }

  updateFrameSize() {
    if (!this.image.complete) return;
    if (this.frameWidth === 0) {
      this.frameWidth = this.image.width / this.cols;
      this.frameHeight = this.image.height / this.rows;
    }
  }

  draw(ctx, frame, row, x, y) {
    this.updateFrameSize();
    if (this.frameWidth === 0) return;

    const sx = frame * this.frameWidth;
    const sy = row * this.frameHeight;

    ctx.drawImage(
      this.image,
      sx, sy, this.frameWidth, this.frameHeight,
      x - this.frameWidth / 2,
      y - this.frameHeight / 2,
      this.frameWidth,
      this.frameHeight
    );
  }
}

/***********************
 *  플레이어
 ***********************/
class Player {
  constructor(x, y, spriteSheet) {
    this.x = x;
    this.y = y;
    this.speed = 150;

    this.vx = 0;
    this.vy = 0;

    this.dir = DIR8.down;
    this.frame = 0;
    this.animTimer = 0;
    this.walkFps = 8;

    this.spriteSheet = spriteSheet;
  }

  update(dt, input) {
    let mx = 0, my = 0;
    if (input.left) mx -= 1;
    if (input.right) mx += 1;
    if (input.up) my -= 1;
    if (input.down) my += 1;

    if (mx !== 0 && my !== 0) {
      const inv = 1 / Math.sqrt(2);
      mx *= inv;
      my *= inv;
    }

    this.vx = mx * this.speed;
    this.vy = my * this.speed;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // 방향 계산
    this.dir = this.computeDir(mx, my);

    // 애니메이션
    if (mx !== 0 || my !== 0) {
      this.animTimer += dt;
      if (this.animTimer >= 1 / this.walkFps) {
        this.animTimer -= 1 / this.walkFps;
        this.frame = (this.frame + 1) % 4;
      }
    } else {
      this.frame = 0;
    }
  }

  computeDir(mx, my) {
    if (mx === 0 && my > 0) return DIR8.down;
    if (mx === 0 && my < 0) return DIR8.up;
    if (mx < 0 && my === 0) return DIR8.left;
    if (mx > 0 && my === 0) return DIR8.right;
    if (mx < 0 && my > 0) return DIR8.downLeft;
    if (mx > 0 && my > 0) return DIR8.downRight;
    if (mx < 0 && my < 0) return DIR8.upLeft;
    if (mx > 0 && my < 0) return DIR8.upRight;
    return DIR8.down;
  }

  draw(ctx) {
    this.spriteSheet.draw(ctx, this.frame, this.dir, this.x, this.y);
  }
}

/***********************
 *  입력 핸들러
 ***********************/
class InputManager {
  constructor() {
    this.keys = {
      up: false, down: false, left: false, right: false
    };
    this.bindEvents();
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w') this.keys.up = true;
      if (e.key === 'ArrowDown' || e.key === 's') this.keys.down = true;
      if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = true;
    });

    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w') this.keys.up = false;
      if (e.key === 'ArrowDown' || e.key === 's') this.keys.down = false;
      if (e.key === 'ArrowLeft' || e.key === 'a') this.keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') this.keys.right = false;
    });
  }
}

/***********************
 *  게임 루프
 ***********************/
class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.input = new InputManager();
    this.lastTime = 0;

    this.player = null;

    this.load().then(() => {
      Net.connect();
      requestAnimationFrame(this.loop.bind(this));
    });
  }

  async load() {
    const info = CHARACTER_SPRITES.human.walk;
    const img = await this.loadImg(info.src);
    const sheet = new SpriteSheet(img, info.cols, info.rows);

    this.player = new Player(
      this.canvas.width / 2,
      this.canvas.height / 2,
      sheet
    );
  }

  loadImg(src) {
    return new Promise((res) => {
      const img = new Image();
      img.onload = () => res(img);
      img.src = src;
    });
  }

  loop(t) {
    if (!this.lastTime) this.lastTime = t;
    const dt = (t - this.lastTime) / 1000;
    this.lastTime = t;

    this.update(dt);
    this.render();

    requestAnimationFrame(this.loop.bind(this));
  }

  update(dt) {
    if (this.player) this.player.update(dt, this.input.keys);
  }

  render() {
    const ctx = this.ctx;
    ctx.fillStyle = "#345";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.player) this.player.draw(ctx);
  }
}

window.addEventListener("load", () => {
  new Game(document.getElementById("game-canvas"));
});
