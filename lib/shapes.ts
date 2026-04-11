export type ShapeFn = (nx: number, ny: number, t: number) => number;

export const shapes: Record<string, ShapeFn> = {
  jellyfish: (nx, ny, t) => {
    const cx = 0.5;
    const cy = 0.28 + Math.sin(t * 0.6) * 0.04;
    const dx = nx - cx;
    const dy = ny - cy;

    // breathing dome
    const breath = Math.sin(t * 0.8);
    const domeW = 0.3 + breath * 0.05;
    const domeH = 0.2 + breath * 0.03;
    const dome = 1 - Math.sqrt((dx / domeW) ** 2 + (dy / domeH) ** 2);

    // inner dome glow ring
    const ring = Math.abs(dome - 0.3) < 0.08 ? 0.6 : 0;

    // organic tendrils
    let tendrils = 0;
    if (ny > cy + domeH * 0.2) {
      const ty = (ny - cy - domeH * 0.2) / 0.6;
      const sway = Math.sin(t * 1.5 + ty * 3) * 0.08 * ty;
      const tendrilCount = 7;
      for (let i = 0; i < tendrilCount; i++) {
        const tendrilX = cx - 0.25 + (i / (tendrilCount - 1)) * 0.5 + sway;
        const tdx = nx - tendrilX;
        const width = 0.015 + Math.sin(ty * 8 + t * 2 + i) * 0.008;
        const fade = Math.max(0, 1 - ty * ty);
        const wave = Math.sin(ty * 12 + t * 3 + i * 2) * 0.5 + 0.5;
        if (Math.abs(tdx) < width) {
          tendrils += fade * wave * 0.8;
        }
      }
      // particles drifting off tendrils
      const particle = Math.sin(nx * 40 + t * 2) * Math.sin(ny * 30 - t * 1.5);
      const nearCenter = Math.max(0, 1 - Math.abs(dx) / 0.35);
      const fade = Math.max(0, 1 - ty);
      tendrils += Math.max(0, particle) * nearCenter * fade * 0.3;
    }

    return Math.min(1, Math.max(0, dome) * 1.2 + ring + tendrils);
  },

  wave: (nx, ny, t) => {
    let val = 0;
    // multiple overlapping waves like a waveform display
    for (let layer = 0; layer < 5; layer++) {
      const freq = 4 + layer * 3;
      const amp = 0.12 - layer * 0.015;
      const speed = 1 + layer * 0.3;
      const phase = layer * 1.7;
      const centerY =
        0.5 +
        Math.sin(nx * freq + t * speed + phase) * amp +
        Math.sin(nx * freq * 0.5 - t * speed * 0.7 + phase) * amp * 0.6;
      const dist = Math.abs(ny - centerY);
      const thickness = 0.015 + Math.sin(nx * 8 + t + layer) * 0.005;
      const intensity = Math.max(0, 1 - dist / thickness);
      // fill underneath the top wave
      const fill =
        layer === 0 && ny > centerY
          ? Math.max(0, 1 - (ny - centerY) / 0.3) * 0.15
          : 0;
      val += intensity * (0.8 - layer * 0.1) + fill;
    }
    return Math.min(1, val);
  },

  network: (nx, ny, t) => {
    let val = 0;
    const nodeCount = 8;
    const nodes: [number, number][] = [];

    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2 + t * 0.3;
      const radius = 0.2 + Math.sin(t * 0.5 + i * 1.5) * 0.1;
      const nodex = 0.5 + Math.cos(angle) * radius;
      const nodey = 0.5 + Math.sin(angle) * radius;
      nodes.push([nodex, nodey]);

      const dx = nx - nodex;
      const dy = ny - nodey;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // pulsing node
      const pulse = Math.sin(t * 2 + i * 1.3) * 0.5 + 0.5;
      const nodeRadius = 0.03 + pulse * 0.02;
      if (dist < nodeRadius) {
        val += (1 - dist / nodeRadius) * 0.9;
      }
      // outer ring
      if (Math.abs(dist - nodeRadius * 1.8) < 0.005) {
        val += 0.4;
      }
    }

    // connections with data flow pulses
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const [ax, ay] = nodes[i];
        const [bx, by] = nodes[j];
        const edgeDist = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
        if (edgeDist > 0.45) continue;

        // project point onto line
        const ex = bx - ax;
        const ey = by - ay;
        const len = Math.sqrt(ex * ex + ey * ey);
        const proj = ((nx - ax) * ex + (ny - ay) * ey) / (len * len);
        if (proj < 0 || proj > 1) continue;
        const closestX = ax + ex * proj;
        const closestY = ay + ey * proj;
        const lineDist = Math.sqrt((nx - closestX) ** 2 + (ny - closestY) ** 2);

        if (lineDist < 0.008) {
          val += 0.3;
          // data pulse traveling along edge
          const pulsePos = (t * 0.5 + i * 0.7 + j * 0.3) % 1;
          if (Math.abs(proj - pulsePos) < 0.08) {
            val += 0.5;
          }
        }
      }
    }

    return Math.min(1, val);
  },

  spiral: (nx, ny, t) => {
    const cx = 0.5;
    const cy = 0.5;
    const dx = nx - cx;
    const dy = ny - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    let val = 0;
    // multiple spiral arms
    for (let arm = 0; arm < 3; arm++) {
      const armAngle = angle + (arm / 3) * Math.PI * 2;
      const spiral = Math.sin(armAngle * 2 + dist * 25 - t * 2) * 0.5 + 0.5;
      const fade = Math.max(0, 1 - dist / 0.42);
      const width = spiral > 0.7 ? (spiral - 0.7) / 0.3 : 0;
      val += width * fade;
    }

    // center glow
    const center = Math.max(0, 1 - dist / 0.06);
    val += center * 0.8;

    // orbiting particles
    for (let p = 0; p < 4; p++) {
      const pAngle = t * 1.5 + (p / 4) * Math.PI * 2;
      const pDist = 0.15 + p * 0.06;
      const px = cx + Math.cos(pAngle) * pDist;
      const py = cy + Math.sin(pAngle) * pDist;
      const pdist = Math.sqrt((nx - px) ** 2 + (ny - py) ** 2);
      if (pdist < 0.02) val += (1 - pdist / 0.02) * 0.7;
    }

    return Math.min(1, val);
  },

  matrix: (nx, ny, t) => {
    // falling columns of characters — matrix rain style
    const colWidth = 1 / 14;
    const col = Math.floor(nx / colWidth);
    const colPhase = col * 2.7 + Math.sin(col * 0.5) * 3;

    // each column has a falling head
    const headY = ((t * 0.4 + colPhase) % 1.6) - 0.3;
    const distFromHead = ny - headY;

    let val = 0;

    // bright head
    if (distFromHead > -0.02 && distFromHead < 0.02) {
      val = 1;
    }
    // fading trail above
    else if (distFromHead < 0 && distFromHead > -0.5) {
      const trailFade = 1 + distFromHead / 0.5;
      // discretize into rows
      const rowHeight = 1 / 20;
      const row = Math.floor(ny / rowHeight);
      const rowPhase = Math.sin(row * 3.7 + col * 2.3);
      // some cells lit, some not
      val = trailFade * (rowPhase > -0.3 ? 0.6 : 0);
    }

    // random background flickers
    const flicker =
      Math.sin(nx * 80 + ny * 60 + t * 4) * Math.sin(nx * 30 - t * 2);
    if (flicker > 0.95) val += 0.15;

    return Math.min(1, val);
  },

  blob: (nx, ny, t) => {
    // morphing metaball cluster
    let val = 0;
    const blobs = [
      { x: 0.5 + Math.sin(t * 0.7) * 0.15, y: 0.5 + Math.cos(t * 0.9) * 0.12 },
      {
        x: 0.35 + Math.sin(t * 1.1 + 2) * 0.1,
        y: 0.4 + Math.cos(t * 0.8 + 1) * 0.15,
      },
      {
        x: 0.65 + Math.sin(t * 0.9 + 4) * 0.12,
        y: 0.6 + Math.cos(t * 1.2 + 3) * 0.1,
      },
      {
        x: 0.45 + Math.sin(t * 1.3 + 1) * 0.08,
        y: 0.55 + Math.cos(t * 0.6 + 5) * 0.13,
      },
    ];

    for (const b of blobs) {
      const dx = nx - b.x;
      const dy = ny - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      val += 0.06 / (dist * dist + 0.01);
    }

    // threshold to create organic boundary
    const edge = val > 3 ? Math.min(1, (val - 3) / 4) : 0;
    // surface detail
    const detail = Math.sin(nx * 30 + t) * Math.sin(ny * 25 - t * 0.7) * 0.15;

    return Math.min(
      1,
      edge + (val > 2.8 && val < 3.2 ? 0.6 : 0) + (edge > 0 ? detail : 0),
    );
  },

  floorplan: (nx, ny, t) => {
    const wallW = 0.035;
    const b = Math.sin(t * 0.3) * 0.015;

    const hWall = (x: number, y: number, x1: number, x2: number, yw: number) =>
      x >= x1 && x <= x2 && Math.abs(y - yw) < wallW ? 1 : 0;
    const vWall = (x: number, y: number, xw: number, y1: number, y2: number) =>
      y >= y1 && y <= y2 && Math.abs(x - xw) < wallW ? 1 : 0;

    // door gap check
    const gap = (pos: number, center: number, width: number) =>
      Math.abs(pos - center) < width;

    // bounds
    const L = 0.08;
    const R = 0.92;
    const T = 0.06;
    const B = 0.94;

    // main dividers
    const midY = 0.42 + b;
    const midX = 0.5 + b * 0.5;
    const lowY = 0.72 + b;

    let val = 0;

    // outer walls
    val += hWall(nx, ny, L, R, T);
    val += hWall(nx, ny, L, R, B);
    val += vWall(nx, ny, L, T, B);
    val += vWall(nx, ny, R, T, B);

    // main horizontal split
    val += hWall(nx, ny, L, R, midY);
    // vertical split — top half
    val += vWall(nx, ny, midX, T, midY);
    // vertical split — bottom left
    const blDiv = 0.35 + b;
    val += vWall(nx, ny, blDiv, midY, B);
    // lower horizontal — right side
    val += hWall(nx, ny, blDiv, R, lowY);
    // small room — bottom right
    const brDiv = 0.7 - b;
    val += vWall(nx, ny, brDiv, lowY, B);

    // hallway horizontal
    const hallY = 0.56 + b;
    val += hWall(nx, ny, blDiv, midX + 0.08, hallY);

    // closet wall top-left
    const closetX = 0.28;
    val += vWall(nx, ny, closetX, T, 0.22);
    val += hWall(nx, ny, closetX, midX, 0.22);

    // door gaps — carve openings
    const doors: [number, number, boolean][] = [
      [0.3, midY, true], // top-left to bottom
      [0.7, midY, true], // top-right to bottom
      [midX, 0.25, false], // between top rooms
      [blDiv, 0.58, false], // hallway to left room
      [blDiv, 0.82, false], // bottom-left entry
      [0.52, lowY, true], // into bottom-mid room
      [brDiv, 0.83, false], // bottom-right entry
      [0.48, hallY, true], // hallway door
      [closetX, 0.12, false], // closet door
    ];

    for (const [dx, dy, horiz] of doors) {
      if (horiz) {
        if (gap(nx, dx, 0.05) && Math.abs(ny - dy) < wallW * 1.8) val = 0;
      } else {
        if (gap(ny, dy, 0.05) && Math.abs(nx - dx) < wallW * 1.8) val = 0;
      }
    }

    // door swing arcs — quarter circle hints
    const arcIntensity = 0.3;
    for (const [dx, dy] of doors) {
      const dist = Math.sqrt((nx - dx) ** 2 + (ny - dy) ** 2);
      if (dist > 0.04 && dist < 0.06 && Math.abs(dist - 0.05) < 0.004) {
        val = Math.max(val, arcIntensity);
      }
    }

    return Math.min(1, val);
  },
};
