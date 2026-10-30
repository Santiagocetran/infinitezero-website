// Original ASCII network renderer. No remote assets or rendering dependencies.
// Sprites are cached once; only a bounded set of nodes and links redraw at 30 fps.
const canvas = document.querySelector<HTMLCanvasElement>("#network-canvas");
const button = document.querySelector<HTMLButtonElement>(".motion-toggle");
const ctx = canvas?.getContext("2d", { alpha: true });
if (canvas && ctx && button) {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const pointer = { x: -1000, y: -1000 };
  let width = 0,
    height = 0,
    time = 0,
    last = 0,
    raf = 0,
    paused = false;
  type Node = {
    u: number;
    v: number;
    phase: number;
    x: number;
    y: number;
    ox: number;
    oy: number;
    vx: number;
    vy: number;
    size: number;
    violet: boolean;
  };
  let nodes: Node[] = [];
  let links: [number, number][] = [];
  // A fixed seed keeps the composition stable through resize and reload.
  function random(i: number) {
    const n = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return n - Math.floor(n);
  }
  function sprite(color: string) {
    const image = document.createElement("canvas");
    image.width = 96;
    image.height = 96;
    const pen = image.getContext("2d")!;
    pen.font = "10px monospace";
    pen.textAlign = "center";
    pen.textBaseline = "middle";
    pen.fillStyle = color;
    pen.shadowColor = color;
    pen.shadowBlur = 10;
    const ramp = ".:+*#";
    for (let y = -3; y <= 3; y++)
      for (let x = -3; x <= 3; x++) {
        const d = Math.hypot(x * 0.95, y);
        if (d > 3.2) continue;
        pen.globalAlpha = 0.5 + 0.5 * (1 - d / 4);
        const light = Math.max(
          0,
          Math.min(4, Math.floor((1 - d / 4) * 4 + (x - y) * 0.2)),
        );
        pen.fillText(ramp[light], 48 + x * 9, 48 + y * 10);
      }
    return image;
  }
  const teal = sprite("#a2f5e8"),
    violet = sprite("#cec0ff");
  function resize() {
    width = innerWidth;
    height = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas!.width = Math.round(width * dpr);
    canvas!.height = Math.round(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = width < 600 ? 34 : 64;
    nodes = Array.from({ length: count }, (_, i) => {
      const u = random(i + 1),
        v = random(i + 191);
      return {
        u,
        v,
        phase: random(i + 410) * Math.PI * 2,
        x: u * width,
        y: v * height,
        ox: 0,
        oy: 0,
        vx: 0,
        vy: 0,
        size: 32 + random(i + 80) * 48,
        violet: i % 7 === 0,
      };
    });
    // A few nearest neighbours make a coherent mesh without an all-to-all tangle.
    links = [];
    const seen = new Set<string>();
    nodes.forEach((a, i) => {
      nodes
        .map((b, j) => ({
          j,
          d: Math.hypot((a.u - b.u) * width, (a.v - b.v) * height),
        }))
        .filter((n) => n.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3)
        .forEach(({ j, d }) => {
          const key = [Math.min(i, j), Math.max(i, j)].join(":");
          if (d < width * 0.25 + 50 && !seen.has(key)) {
            links.push([i, j]);
            seen.add(key);
          }
        });
    });
    draw(0);
    schedule();
  }
  function brightness(x: number, y: number) {
    // Leave the reading column quiet; the open right side carries the hero.
    const right = Math.max(0, Math.min(1, (x / width - 0.4) * 2.8));
    const mobile = width < 760;
    const reading = mobile
      ? y < height * 0.6
        ? 0.12
        : 0.55
      : 0.09 + right * 0.8;
    return reading;
  }
  function draw(dt: number) {
    ctx!.clearRect(0, 0, width, height);
    const step = dt * 60;
    for (const n of nodes) {
      const homeX = n.u * width + Math.sin(time * 0.17 + n.phase) * 18;
      const homeY = n.v * height + Math.cos(time * 0.13 + n.phase) * 14;
      if (dt > 0) {
        const dx = homeX + n.ox - pointer.x,
          dy = homeY + n.oy - pointer.y;
        const distance = Math.hypot(dx, dy),
          reach = 150;
        const force = distance < reach ? (1 - distance / reach) * 0.65 : 0;
        n.vx =
          (n.vx + ((dx / (distance || 1)) * force - n.ox * 0.008) * step) *
          Math.pow(0.89, step);
        n.vy =
          (n.vy + ((dy / (distance || 1)) * force - n.oy * 0.008) * step) *
          Math.pow(0.89, step);
        n.ox += n.vx * step;
        n.oy += n.vy * step;
      }
      n.x = homeX + n.ox;
      n.y = homeY + n.oy;
    }
    ctx!.font = "10px monospace";
    ctx!.textAlign = "center";
    ctx!.textBaseline = "middle";
    for (const [a, b] of links) {
      const p = nodes[a],
        q = nodes[b],
        distance = Math.hypot(q.x - p.x, q.y - p.y);
      const count = Math.floor(distance / 13);
      ctx!.fillStyle = p.violet ? "#9b8cd4" : "#4d9e99";
      for (let j = 1; j < count; j++) {
        const t = j / count,
          x = p.x + (q.x - p.x) * t,
          y = p.y + (q.y - p.y) * t;
        ctx!.globalAlpha = brightness(x, y) * 0.6;
        ctx!.fillText(j % 5 === 0 ? "+" : ".", x, y);
      }
    }
    for (const n of nodes) {
      const near = Math.max(
        0,
        1 - Math.hypot(n.x - pointer.x, n.y - pointer.y) / 180,
      );
      ctx!.globalAlpha = Math.min(1, brightness(n.x, n.y) * (1.3 + near * 0.6));
      const size = n.size * (1 + near * 0.12);
      ctx!.drawImage(
        n.violet ? violet : teal,
        n.x - size / 2,
        n.y - size / 2,
        size,
        size,
      );
    }
    ctx!.globalAlpha = 1;
  }
  function frame(now: number) {
    raf = 0;
    if (paused || motion.matches || document.hidden) return;
    if (!last) last = now;
    if (now - last >= 1000 / 30) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      time += dt;
      draw(dt);
    }
    raf = requestAnimationFrame(frame);
  }
  function schedule() {
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
    if (!paused && !motion.matches && !document.hidden)
      raf = requestAnimationFrame(frame);
  }
  function clearPointer() {
    pointer.x = -1000;
    pointer.y = -1000;
  }
  // Content owns the pointer; only open background space repels the network.
  const contentSelector =
    "header, nav, footer, dialog, a, button, details, .hero-copy, .section-heading, .steps li, .path-card, .status, .faq, .statement, .final-cta, .support-links, .privacy-note";
  const overContent = (target: EventTarget | null) =>
    target instanceof Element && !!target.closest(contentSelector);
  document.addEventListener(
    "pointerover",
    (event) => {
      if (overContent(event.target)) clearPointer();
    },
    { passive: true },
  );
  window.addEventListener("scroll", clearPointer, { passive: true });
  window.addEventListener(
    "pointermove",
    (event) => {
      if (overContent(event.target)) {
        clearPointer();
        return;
      }
      if (event.pointerType === "mouse" && !paused && !motion.matches) {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
      }
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", clearPointer);
  window.addEventListener("blur", clearPointer);
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    clearPointer();
    schedule();
  });
  motion.addEventListener("change", () => {
    clearPointer();
    button!.hidden = motion.matches;
    schedule();
    if (motion.matches) {
      nodes.forEach((n) => {
        n.ox = 0;
        n.oy = 0;
      });
      draw(0);
    }
  });
  button.hidden = motion.matches;
  button.addEventListener("click", () => {
    paused = !paused;
    button!.setAttribute("aria-pressed", String(paused));
    button!.textContent = paused ? "Resume background" : "Pause background";
    clearPointer();
    schedule();
  });
  canvas.parentElement!.classList.add("canvas-ready");
  resize();
}
