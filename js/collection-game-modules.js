const SHEJI_GAME_COLORS = {
  yellow: "#ffd014",
  yellowLight: "#ffe478",
  green: "#62dc11",
  pink: "#f61da0",
  black: "#000000",
  white: "#ffffff",
};

function clampGameValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createGameCanvas(stageEl, className) {
  stageEl.innerHTML = "";

  const canvas = document.createElement("canvas");
  canvas.className = `collection-game__canvas collection-game__canvas--${className}`;
  stageEl.append(canvas);

  const context = canvas.getContext("2d");
  const size = {
    width: 0,
    height: 0,
    dpr: 1,
  };

  const resize = () => {
    const rect = stageEl.getBoundingClientRect();
    size.width = Math.max(320, Math.floor(rect.width || stageEl.clientWidth || 320));
    size.height = Math.max(320, Math.floor(rect.height || stageEl.clientHeight || 320));
    size.dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(size.width * size.dpr);
    canvas.height = Math.floor(size.height * size.dpr);
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    context.setTransform(size.dpr, 0, 0, size.dpr, 0, 0);
  };

  resize();

  return {
    canvas,
    context,
    size,
    resize,
    destroy() {
      canvas.remove();
    },
  };
}

function drawGameText(ctx, text, x, y, size = 22, color = SHEJI_GAME_COLORS.black, align = "left") {
  ctx.fillStyle = color;
  ctx.font = `${size}px Oswald, Arial, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x, y);
}

function drawOutlinedRect(ctx, x, y, width, height, fill, stroke = SHEJI_GAME_COLORS.black, lineWidth = 4) {
  ctx.fillStyle = fill;
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lineWidth;
  ctx.fillRect(x, y, width, height);
  ctx.strokeRect(x, y, width, height);
}

function drawStickerBackground(ctx, width, height, labels) {
  ctx.fillStyle = SHEJI_GAME_COLORS.yellow;
  ctx.fillRect(0, 0, width, height);

  labels.forEach((label, index) => {
    const x = (index * 97) % Math.max(width, 1);
    const y = 36 + ((index * 61) % Math.max(height - 72, 1));
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(index % 2 === 0 ? -0.08 : 0.08);
    drawOutlinedRect(ctx, -28, -14, 56, 28, index % 3 === 0 ? SHEJI_GAME_COLORS.white : SHEJI_GAME_COLORS.green, SHEJI_GAME_COLORS.black, 2);
    drawGameText(ctx, label, 0, 1, 14, SHEJI_GAME_COLORS.black, "center");
    ctx.restore();
  });
}

function createLoopController(update, draw) {
  let frame = 0;
  let running = false;
  let lastTime = 0;

  const tick = (time) => {
    if (!running) {
      return;
    }

    const delta = Math.min(0.04, Math.max(0.001, (time - lastTime) / 1000 || 0.016));
    lastTime = time;
    update(delta);
    draw();
    frame = window.requestAnimationFrame(tick);
  };

  return {
    start() {
      if (running) {
        return;
      }

      running = true;
      lastTime = window.performance.now();
      frame = window.requestAnimationFrame(tick);
    },
    stop() {
      running = false;
      window.cancelAnimationFrame(frame);
      frame = 0;
    },
    isRunning() {
      return running;
    },
  };
}

function createLabelBirdGame() {
  let surface = null;
  let context = null;
  let loop = null;
  let player = null;
  let gates = [];
  let score = 0;
  let spawnTimer = 0;
  let ended = false;

  const reset = () => {
    const { width, height } = surface.size;
    player = {
      x: width * 0.24,
      y: height * 0.42,
      radius: 19,
      vy: 0,
    };
    gates = [];
    score = 0;
    spawnTimer = 0.8;
    ended = false;
    context.setScore(0);
  };

  const flap = () => {
    if (ended || !player) {
      return;
    }

    player.vy = -390;
  };

  const spawnGate = () => {
    const { width, height } = surface.size;
    const gap = clampGameValue(height * 0.33, 112, 172);
    const top = 72 + Math.random() * Math.max(24, height - gap - 154);
    gates.push({
      x: width + 36,
      width: 72,
      top,
      gap,
      passed: false,
    });
  };

  const finish = () => {
    if (ended) {
      return;
    }

    ended = true;
    loop.stop();
    context.endGame({ score });
  };

  const update = (delta) => {
    const { width, height } = surface.size;
    player.vy += 940 * delta;
    player.y += player.vy * delta;

    spawnTimer -= delta;
    if (spawnTimer <= 0) {
      spawnGate();
      spawnTimer = 1.42;
    }

    gates.forEach((gate) => {
      gate.x -= 172 * delta;
      if (!gate.passed && gate.x + gate.width < player.x) {
        gate.passed = true;
        score += 1;
        context.setScore(score);
      }
    });

    gates = gates.filter((gate) => gate.x + gate.width > -48);

    if (player.y - player.radius < 0 || player.y + player.radius > height) {
      finish();
      return;
    }

    const birdLeft = player.x - player.radius;
    const birdRight = player.x + player.radius;
    const birdTop = player.y - player.radius;
    const birdBottom = player.y + player.radius;

    const hitGate = gates.some((gate) => {
      const overlapsX = birdRight > gate.x && birdLeft < gate.x + gate.width;
      if (!overlapsX) {
        return false;
      }

      return birdTop < gate.top || birdBottom > gate.top + gate.gap;
    });

    if (hitGate) {
      finish();
    }
  };

  const draw = () => {
    const { context: ctx, size } = surface;
    const { width, height } = size;
    drawStickerBackground(ctx, width, height, ["FRUIT", "LOOK", "404", "PLU"]);

    gates.forEach((gate) => {
      drawOutlinedRect(ctx, gate.x, -4, gate.width, gate.top, SHEJI_GAME_COLORS.pink);
      drawOutlinedRect(
        ctx,
        gate.x,
        gate.top + gate.gap,
        gate.width,
        height - gate.top - gate.gap + 4,
        SHEJI_GAME_COLORS.pink,
      );

      for (let offset = 10; offset < gate.width - 8; offset += 12) {
        ctx.fillStyle = SHEJI_GAME_COLORS.black;
        ctx.fillRect(gate.x + offset, gate.top + gate.gap - 32, 4, 22);
      }
    });

    ctx.save();
    ctx.translate(player.x, player.y);
    drawOutlinedRect(ctx, -24, -14, 48, 28, SHEJI_GAME_COLORS.green);
    ctx.beginPath();
    ctx.arc(15, -8, 15, 0, Math.PI * 2);
    ctx.fillStyle = SHEJI_GAME_COLORS.white;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = SHEJI_GAME_COLORS.black;
    ctx.stroke();
    drawGameText(ctx, "PLU", 15, -8, 13, SHEJI_GAME_COLORS.black, "center");
    ctx.fillStyle = SHEJI_GAME_COLORS.black;
    ctx.fillRect(-12, 12, 25, 4);
    ctx.restore();

    drawGameText(ctx, "CARE LABEL BIRD", 16, height - 24, 20);
  };

  return {
    id: "fruity-label-bird",
    init(stageEl, gameContext) {
      context = gameContext;
      surface = createGameCanvas(stageEl, "label-bird");
      loop = createLoopController(update, draw);
      reset();
      draw();
    },
    start() {
      loop.start();
    },
    pause() {
      loop.stop();
    },
    resume() {
      if (!ended) {
        loop.start();
      }
    },
    destroy() {
      loop?.stop();
      surface?.destroy();
      surface = null;
    },
    resize() {
      surface?.resize();
      draw();
    },
    handleInput(event) {
      if (event.action === "action" || event.action === "up" || event.type === "pointer") {
        flap();
      }
    },
  };
}

function createErosionPongGame() {
  let surface = null;
  let context = null;
  let loop = null;
  let paddle = null;
  let ball = null;
  let blocks = [];
  let score = 0;
  let ended = false;

  const buildBlocks = () => {
    const { width } = surface.size;
    const columns = width < 420 ? 4 : 5;
    const blockWidth = (width - 48) / columns;
    blocks = [];
    for (let row = 0; row < 3; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        blocks.push({
          x: 24 + column * blockWidth,
          y: 34 + row * 40,
          width: blockWidth - 8,
          height: 30,
          hits: row === 0 ? 2 : 1,
        });
      }
    }
  };

  const reset = () => {
    const { width, height } = surface.size;
    paddle = {
      x: width * 0.5,
      y: height - 36,
      width: clampGameValue(width * 0.28, 88, 140),
      height: 18,
    };
    ball = {
      x: width * 0.5,
      y: height * 0.58,
      vx: 160,
      vy: -210,
      radius: 10,
    };
    score = 0;
    ended = false;
    buildBlocks();
    context.setScore(0);
  };

  const end = (resultText) => {
    if (ended) {
      return;
    }

    ended = true;
    loop.stop();
    context.endGame({ score, resultText });
  };

  const movePaddleTo = (x) => {
    const { width } = surface.size;
    paddle.x = clampGameValue(x, paddle.width / 2 + 8, width - paddle.width / 2 - 8);
  };

  const update = (delta) => {
    const { width, height } = surface.size;
    ball.x += ball.vx * delta;
    ball.y += ball.vy * delta;

    if (ball.x - ball.radius < 0 || ball.x + ball.radius > width) {
      ball.vx *= -1;
      ball.x = clampGameValue(ball.x, ball.radius, width - ball.radius);
    }

    if (ball.y - ball.radius < 0) {
      ball.vy = Math.abs(ball.vy);
      ball.y = ball.radius;
    }

    const paddleLeft = paddle.x - paddle.width / 2;
    const paddleRight = paddle.x + paddle.width / 2;
    const paddleTop = paddle.y - paddle.height / 2;
    if (
      ball.y + ball.radius >= paddleTop &&
      ball.y < paddle.y &&
      ball.x >= paddleLeft &&
      ball.x <= paddleRight
    ) {
      const offset = (ball.x - paddle.x) / (paddle.width / 2);
      ball.vx = offset * 230;
      ball.vy = -Math.abs(ball.vy) - 8;
    }

    blocks.forEach((block) => {
      if (block.hits <= 0) {
        return;
      }

      const hit =
        ball.x + ball.radius > block.x &&
        ball.x - ball.radius < block.x + block.width &&
        ball.y + ball.radius > block.y &&
        ball.y - ball.radius < block.y + block.height;

      if (hit) {
        block.hits -= 1;
        ball.vy *= -1;
        score += 1;
        context.setScore(score);
      }
    });

    if (blocks.every((block) => block.hits <= 0)) {
      end("SLAB CLEARED");
    }

    if (ball.y - ball.radius > height + 12) {
      end();
    }
  };

  const draw = () => {
    const { context: ctx, size } = surface;
    const { width, height } = size;
    ctx.fillStyle = SHEJI_GAME_COLORS.yellow;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = SHEJI_GAME_COLORS.black;
    ctx.lineWidth = 2;
    for (let y = 22; y < height; y += 42) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y + 20);
      ctx.stroke();
    }

    blocks.forEach((block) => {
      if (block.hits <= 0) {
        return;
      }

      drawOutlinedRect(ctx, block.x, block.y, block.width, block.height, block.hits > 1 ? SHEJI_GAME_COLORS.white : SHEJI_GAME_COLORS.yellowLight);
      if (block.hits === 1) {
        ctx.beginPath();
        ctx.moveTo(block.x + 8, block.y + 8);
        ctx.lineTo(block.x + block.width - 8, block.y + block.height - 6);
        ctx.strokeStyle = SHEJI_GAME_COLORS.black;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });

    drawOutlinedRect(ctx, paddle.x - paddle.width / 2, paddle.y - paddle.height / 2, paddle.width, paddle.height, SHEJI_GAME_COLORS.black, SHEJI_GAME_COLORS.black);
    drawGameText(ctx, "FOLDED SLAB", paddle.x, paddle.y + 1, 14, SHEJI_GAME_COLORS.yellow, "center");

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = SHEJI_GAME_COLORS.black;
    ctx.fill();
    ctx.strokeStyle = SHEJI_GAME_COLORS.white;
    ctx.lineWidth = 3;
    ctx.stroke();
  };

  return {
    id: "stone-erosion-pong",
    init(stageEl, gameContext) {
      context = gameContext;
      surface = createGameCanvas(stageEl, "erosion-pong");
      loop = createLoopController(update, draw);
      reset();
      draw();
    },
    start() {
      loop.start();
    },
    pause() {
      loop.stop();
    },
    resume() {
      if (!ended) {
        loop.start();
      }
    },
    destroy() {
      loop?.stop();
      surface?.destroy();
      surface = null;
    },
    resize() {
      surface?.resize();
      buildBlocks();
      movePaddleTo(paddle?.x || surface.size.width / 2);
      draw();
    },
    handleInput(event) {
      if (event.type === "pointer") {
        movePaddleTo(event.x);
      } else if (event.action === "left") {
        movePaddleTo(paddle.x - 38);
      } else if (event.action === "right") {
        movePaddleTo(paddle.x + 38);
      } else if (event.action === "action" || event.action === "up") {
        ball.vy = -Math.abs(ball.vy);
      }
    },
  };
}

function createDripRunnerGame() {
  let surface = null;
  let context = null;
  let loop = null;
  let player = null;
  let obstacles = [];
  let collectibles = [];
  let score = 0;
  let spawnTimer = 0;
  let ringTimer = 0.8;
  let ended = false;

  const groundY = () => surface.size.height - 46;

  const reset = () => {
    player = {
      x: 74,
      y: groundY(),
      width: 34,
      height: 52,
      vy: 0,
      duckTimer: 0,
      onGround: true,
    };
    obstacles = [];
    collectibles = [];
    score = 0;
    spawnTimer = 1;
    ringTimer = 0.55;
    ended = false;
    context.setScore(0);
  };

  const jump = () => {
    if (player.onGround && !ended) {
      player.vy = -480;
      player.onGround = false;
    }
  };

  const duck = () => {
    player.duckTimer = 0.42;
  };

  const spawnObstacle = () => {
    const high = Math.random() > 0.55;
    obstacles.push({
      x: surface.size.width + 24,
      y: high ? groundY() - 94 : groundY() - 28,
      width: high ? 42 : 56,
      height: high ? 44 : 28,
      high,
    });
  };

  const spawnRing = () => {
    collectibles.push({
      x: surface.size.width + 24,
      y: groundY() - 86 - Math.random() * 90,
      radius: 12,
      collected: false,
    });
  };

  const end = () => {
    if (ended) {
      return;
    }

    ended = true;
    loop.stop();
    context.endGame({ score });
  };

  const update = (delta) => {
    const speed = 190 + Math.min(130, score * 4);
    player.duckTimer = Math.max(0, player.duckTimer - delta);
    player.vy += 980 * delta;
    player.y += player.vy * delta;

    if (player.y >= groundY()) {
      player.y = groundY();
      player.vy = 0;
      player.onGround = true;
    }

    spawnTimer -= delta;
    ringTimer -= delta;
    if (spawnTimer <= 0) {
      spawnObstacle();
      spawnTimer = 1.1 + Math.random() * 0.55;
    }
    if (ringTimer <= 0) {
      spawnRing();
      ringTimer = 1.35 + Math.random() * 0.65;
    }

    obstacles.forEach((obstacle) => {
      obstacle.x -= speed * delta;
    });
    collectibles.forEach((ring) => {
      ring.x -= speed * delta;
    });

    obstacles = obstacles.filter((obstacle) => obstacle.x + obstacle.width > -40);
    collectibles = collectibles.filter((ring) => ring.x + ring.radius > -40 && !ring.collected);

    const playerHeight = player.duckTimer > 0 ? 30 : player.height;
    const playerBox = {
      x: player.x - player.width / 2,
      y: player.y - playerHeight,
      width: player.width,
      height: playerHeight,
    };

    const hitObstacle = obstacles.some((obstacle) =>
      playerBox.x < obstacle.x + obstacle.width &&
      playerBox.x + playerBox.width > obstacle.x &&
      playerBox.y < obstacle.y + obstacle.height &&
      playerBox.y + playerBox.height > obstacle.y,
    );

    if (hitObstacle) {
      end();
      return;
    }

    collectibles.forEach((ring) => {
      const dx = player.x - ring.x;
      const dy = (playerBox.y + playerBox.height / 2) - ring.y;
      if (Math.hypot(dx, dy) < ring.radius + 22) {
        ring.collected = true;
        score += 1;
        context.setScore(score);
      }
    });
  };

  const draw = () => {
    const { context: ctx, size } = surface;
    const { width, height } = size;
    ctx.fillStyle = SHEJI_GAME_COLORS.yellow;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = SHEJI_GAME_COLORS.black;
    ctx.lineWidth = 3;
    for (let y = 42; y < height - 38; y += 44) {
      ctx.beginPath();
      for (let x = 0; x <= width; x += 20) {
        const waveY = y + Math.sin((x + score * 8) / 30) * 7;
        if (x === 0) {
          ctx.moveTo(x, waveY);
        } else {
          ctx.lineTo(x, waveY);
        }
      }
      ctx.stroke();
    }

    drawOutlinedRect(ctx, 0, groundY(), width, 18, SHEJI_GAME_COLORS.black, SHEJI_GAME_COLORS.black);

    obstacles.forEach((obstacle) => {
      drawOutlinedRect(ctx, obstacle.x, obstacle.y, obstacle.width, obstacle.height, SHEJI_GAME_COLORS.pink);
      drawGameText(ctx, obstacle.high ? "HEAT" : "CRACK", obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, 14, SHEJI_GAME_COLORS.black, "center");
    });

    collectibles.forEach((ring) => {
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
      ctx.fillStyle = SHEJI_GAME_COLORS.green;
      ctx.fill();
      ctx.strokeStyle = SHEJI_GAME_COLORS.black;
      ctx.lineWidth = 4;
      ctx.stroke();
    });

    const playerHeight = player.duckTimer > 0 ? 30 : player.height;
    ctx.beginPath();
    ctx.ellipse(player.x, player.y - playerHeight / 2, 18, playerHeight / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = SHEJI_GAME_COLORS.white;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = SHEJI_GAME_COLORS.black;
    ctx.stroke();
    drawGameText(ctx, "DRIP", player.x, player.y - playerHeight / 2, 14, SHEJI_GAME_COLORS.black, "center");
  };

  return {
    id: "water-drip-runner",
    init(stageEl, gameContext) {
      context = gameContext;
      surface = createGameCanvas(stageEl, "drip-runner");
      loop = createLoopController(update, draw);
      reset();
      draw();
    },
    start() {
      loop.start();
    },
    pause() {
      loop.stop();
    },
    resume() {
      if (!ended) {
        loop.start();
      }
    },
    destroy() {
      loop?.stop();
      surface?.destroy();
      surface = null;
    },
    resize() {
      surface?.resize();
      if (player) {
        player.y = Math.min(player.y, groundY());
      }
      draw();
    },
    handleInput(event) {
      if (event.action === "down") {
        duck();
      } else if (event.action || event.type === "pointer") {
        jump();
      }
    },
  };
}

function createPetalTennisGame() {
  let surface = null;
  let context = null;
  let loop = null;
  let player = null;
  let opponent = null;
  let ball = null;
  let score = 0;
  let ended = false;

  const reset = () => {
    const { width, height } = surface.size;
    player = {
      x: 32,
      y: height * 0.5,
      width: 22,
      height: 94,
    };
    opponent = {
      x: width - 36,
      y: height * 0.5,
      width: 26,
      height: 118,
      vy: 95,
    };
    ball = {
      x: width * 0.5,
      y: height * 0.5,
      vx: -210,
      vy: 135,
      radius: 11,
    };
    score = 0;
    ended = false;
    context.setScore(0);
  };

  const movePlayer = (y) => {
    player.y = clampGameValue(y, player.height / 2 + 8, surface.size.height - player.height / 2 - 8);
  };

  const end = () => {
    if (ended) {
      return;
    }

    ended = true;
    loop.stop();
    context.endGame({ score });
  };

  const update = (delta) => {
    const { width, height } = surface.size;
    opponent.y += opponent.vy * delta;
    if (opponent.y < opponent.height / 2 + 8 || opponent.y > height - opponent.height / 2 - 8) {
      opponent.vy *= -1;
    }

    ball.x += ball.vx * delta;
    ball.y += ball.vy * delta;

    if (ball.y - ball.radius < 0 || ball.y + ball.radius > height) {
      ball.vy *= -1;
      ball.y = clampGameValue(ball.y, ball.radius, height - ball.radius);
    }

    const hitPaddle = (paddle) =>
      ball.x + ball.radius > paddle.x - paddle.width / 2 &&
      ball.x - ball.radius < paddle.x + paddle.width / 2 &&
      ball.y + ball.radius > paddle.y - paddle.height / 2 &&
      ball.y - ball.radius < paddle.y + paddle.height / 2;

    if (ball.vx < 0 && hitPaddle(player)) {
      ball.vx = Math.abs(ball.vx) + 10;
      ball.vy += (ball.y - player.y) * 3;
      score += 1;
      context.setScore(score);
    }

    if (ball.vx > 0 && hitPaddle(opponent)) {
      ball.vx = -Math.abs(ball.vx) - 6;
      ball.vy += (ball.y - opponent.y) * 1.6;
    }

    if (ball.x < -20) {
      end();
      return;
    }

    if (ball.x > width + 24) {
      ball.vx = -Math.abs(ball.vx);
      score += 1;
      context.setScore(score);
    }
  };

  const drawPetal = (ctx, paddle, fill, label) => {
    ctx.save();
    ctx.translate(paddle.x, paddle.y);
    ctx.beginPath();
    ctx.ellipse(0, 0, paddle.width / 2, paddle.height / 2, 0, 0, Math.PI * 2);
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.strokeStyle = SHEJI_GAME_COLORS.black;
    ctx.lineWidth = 4;
    ctx.stroke();
    drawGameText(ctx, label, 0, 0, 13, SHEJI_GAME_COLORS.black, "center");
    ctx.restore();
  };

  const draw = () => {
    const { context: ctx, size } = surface;
    const { width, height } = size;
    ctx.fillStyle = SHEJI_GAME_COLORS.yellow;
    ctx.fillRect(0, 0, width, height);

    ctx.strokeStyle = SHEJI_GAME_COLORS.black;
    ctx.lineWidth = 4;
    ctx.strokeRect(14, 14, width - 28, height - 28);
    ctx.beginPath();
    ctx.moveTo(width / 2, 14);
    ctx.lineTo(width / 2, height - 14);
    ctx.stroke();

    for (let i = 0; i < 5; i += 1) {
      drawGameText(ctx, "BLOOM", 56 + i * 86, 36 + (i % 2) * 54, 17, SHEJI_GAME_COLORS.pink, "center");
    }

    drawPetal(ctx, player, SHEJI_GAME_COLORS.green, "PETAL");
    drawPetal(ctx, opponent, SHEJI_GAME_COLORS.white, "TAGS");

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = SHEJI_GAME_COLORS.pink;
    ctx.fill();
    ctx.strokeStyle = SHEJI_GAME_COLORS.black;
    ctx.lineWidth = 4;
    ctx.stroke();
  };

  return {
    id: "bloom-petal-tennis",
    init(stageEl, gameContext) {
      context = gameContext;
      surface = createGameCanvas(stageEl, "petal-tennis");
      loop = createLoopController(update, draw);
      reset();
      draw();
    },
    start() {
      loop.start();
    },
    pause() {
      loop.stop();
    },
    resume() {
      if (!ended) {
        loop.start();
      }
    },
    destroy() {
      loop?.stop();
      surface?.destroy();
      surface = null;
    },
    resize() {
      surface?.resize();
      movePlayer(player?.y || surface.size.height / 2);
      draw();
    },
    handleInput(event) {
      if (event.type === "pointer") {
        movePlayer(event.y);
      } else if (event.action === "up") {
        movePlayer(player.y - 36);
      } else if (event.action === "down") {
        movePlayer(player.y + 36);
      } else if (event.action === "action") {
        movePlayer(surface.size.height * 0.5);
      }
    },
  };
}

function createMirrorLaneGame() {
  let surface = null;
  let context = null;
  let loop = null;
  let playerLane = 1;
  let obstacles = [];
  let shines = [];
  let score = 0;
  let spawnTimer = 0.7;
  let shineTimer = 1.2;
  let ended = false;

  const laneX = (lane) => {
    const { width } = surface.size;
    const laneWidth = width / 3;
    return laneWidth * lane + laneWidth / 2;
  };

  const reset = () => {
    playerLane = 1;
    obstacles = [];
    shines = [];
    score = 0;
    spawnTimer = 0.7;
    shineTimer = 1;
    ended = false;
    context.setScore(0);
  };

  const end = () => {
    if (ended) {
      return;
    }

    ended = true;
    loop.stop();
    context.endGame({ score });
  };

  const spawnObstacle = () => {
    obstacles.push({
      lane: Math.floor(Math.random() * 3),
      y: -48,
      height: 44,
    });
  };

  const spawnShine = () => {
    shines.push({
      lane: Math.floor(Math.random() * 3),
      y: -70,
      radius: 12,
      collected: false,
    });
  };

  const switchLane = (direction) => {
    playerLane = clampGameValue(playerLane + direction, 0, 2);
  };

  const update = (delta) => {
    const { height } = surface.size;
    const speed = 210 + Math.floor(score / 10) * 34;
    spawnTimer -= delta;
    shineTimer -= delta;
    if (spawnTimer <= 0) {
      spawnObstacle();
      spawnTimer = 0.74 + Math.random() * 0.34;
    }
    if (shineTimer <= 0) {
      spawnShine();
      shineTimer = 1.1 + Math.random() * 0.5;
    }

    obstacles.forEach((obstacle) => {
      obstacle.y += speed * delta;
    });
    shines.forEach((shine) => {
      shine.y += speed * delta;
    });

    const playerY = height - 66;
    obstacles.forEach((obstacle) => {
      if (
        obstacle.lane === playerLane &&
        obstacle.y + obstacle.height > playerY - 26 &&
        obstacle.y < playerY + 26
      ) {
        end();
      }
    });

    shines.forEach((shine) => {
      if (!shine.collected && shine.lane === playerLane && Math.abs(shine.y - playerY) < 36) {
        shine.collected = true;
        score += 1;
        context.setScore(score);
      }
    });

    obstacles = obstacles.filter((obstacle) => obstacle.y < height + 60);
    shines = shines.filter((shine) => shine.y < height + 60 && !shine.collected);
  };

  const draw = () => {
    const { context: ctx, size } = surface;
    const { width, height } = size;
    ctx.fillStyle = SHEJI_GAME_COLORS.black;
    ctx.fillRect(0, 0, width, height);

    const laneWidth = width / 3;
    for (let lane = 0; lane < 3; lane += 1) {
      ctx.fillStyle = lane % 2 === 0 ? SHEJI_GAME_COLORS.yellow : SHEJI_GAME_COLORS.yellowLight;
      ctx.fillRect(lane * laneWidth + 4, 0, laneWidth - 8, height);
      ctx.strokeStyle = SHEJI_GAME_COLORS.black;
      ctx.lineWidth = 4;
      ctx.strokeRect(lane * laneWidth + 4, 0, laneWidth - 8, height);
    }

    obstacles.forEach((obstacle) => {
      const x = laneX(obstacle.lane);
      drawOutlinedRect(ctx, x - laneWidth * 0.31, obstacle.y, laneWidth * 0.62, obstacle.height, SHEJI_GAME_COLORS.pink);
      drawGameText(ctx, "WARN", x, obstacle.y + obstacle.height / 2, 15, SHEJI_GAME_COLORS.black, "center");
    });

    shines.forEach((shine) => {
      ctx.beginPath();
      ctx.arc(laneX(shine.lane), shine.y, shine.radius, 0, Math.PI * 2);
      ctx.fillStyle = SHEJI_GAME_COLORS.green;
      ctx.fill();
      ctx.strokeStyle = SHEJI_GAME_COLORS.black;
      ctx.lineWidth = 4;
      ctx.stroke();
    });

    const playerX = laneX(playerLane);
    const playerY = height - 66;
    drawOutlinedRect(ctx, playerX - 28, playerY - 24, 56, 48, SHEJI_GAME_COLORS.white);
    ctx.fillStyle = SHEJI_GAME_COLORS.black;
    ctx.fillRect(playerX - 16, playerY - 14, 32, 7);
    ctx.fillRect(playerX + 4, playerY + 2, 18, 6);
    drawGameText(ctx, `NOA-${String(score).padStart(3, "0")}`, width / 2, 26, 20, SHEJI_GAME_COLORS.black, "center");
  };

  return {
    id: "chrome-mirror-lane",
    init(stageEl, gameContext) {
      context = gameContext;
      surface = createGameCanvas(stageEl, "mirror-lane");
      loop = createLoopController(update, draw);
      reset();
      draw();
    },
    start() {
      loop.start();
    },
    pause() {
      loop.stop();
    },
    resume() {
      if (!ended) {
        loop.start();
      }
    },
    destroy() {
      loop?.stop();
      surface?.destroy();
      surface = null;
    },
    resize() {
      surface?.resize();
      draw();
    },
    handleInput(event) {
      if (event.type === "pointer") {
        playerLane = clampGameValue(Math.floor(event.x / (surface.size.width / 3)), 0, 2);
      } else if (event.action === "left") {
        switchLane(-1);
      } else if (event.action === "right") {
        switchLane(1);
      } else if (event.action === "action") {
        switchLane(1);
      }
    },
  };
}

window.ShejiCollectionGameModules = {
  labelBird: createLabelBirdGame,
  erosionPong: createErosionPongGame,
  dripRunner: createDripRunnerGame,
  petalTennis: createPetalTennisGame,
  mirrorLane: createMirrorLaneGame,
};
