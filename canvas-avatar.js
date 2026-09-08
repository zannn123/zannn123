// ============================================================================
// RETRO PIXEL ART HERO & AI DRONE ENGINE (HTML5 Pixel Canvas)
// ============================================================================

(function () {
  const canvas = document.getElementById("avatar-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Disable smoothing for razor-sharp retro pixel art
  ctx.imageSmoothingEnabled = false;

  const VIRTUAL_W = 128;
  const VIRTUAL_H = 128;

  // Offscreen buffer for crisp pixel scaling
  const buffer = document.createElement("canvas");
  buffer.width = VIRTUAL_W;
  buffer.height = VIRTUAL_H;
  const bctx = buffer.getContext("2d");
  bctx.imageSmoothingEnabled = false;

  let tick = 0;
  let mouseX = VIRTUAL_W / 2;
  let mouseY = VIRTUAL_H / 2;
  let isHovered = false;
  let jumpY = 0;
  let jumpVelocity = 0;
  let activeEmote = null;
  let emoteTimer = 0;

  // Particles (Matrix sparks / data embers)
  const particles = [];
  for (let i = 0; i < 30; i++) {
    particles.push({
      x: Math.random() * VIRTUAL_W,
      y: Math.random() * VIRTUAL_H,
      speed: 0.3 + Math.random() * 0.7,
      size: Math.random() > 0.7 ? 2 : 1,
      color: Math.random() > 0.5 ? "#00f0ff" : (Math.random() > 0.5 ? "#39ff14" : "#ff007f"),
      alpha: Math.random() * 0.8 + 0.2
    });
  }

  // Draw pixel helper
  function p(bx, by, color, w = 1, h = 1) {
    bctx.fillStyle = color;
    bctx.fillRect(Math.floor(bx), Math.floor(by), w, h);
  }

  // Draw pixel line
  function pLine(x, y, w, color) {
    bctx.fillStyle = color;
    bctx.fillRect(Math.floor(x), Math.floor(y), w, 1);
  }

  // Trigger jump & emote
  window.triggerAvatarInteract = function (customEmote = null) {
    if (jumpVelocity === 0 && jumpY === 0) {
      jumpVelocity = -4.5;
      if (window.pixelAudio) window.pixelAudio.playPowerUp();
    }
    const emotes = ["⚡", "!", "AI", "♥", "99", "OK"];
    activeEmote = customEmote || emotes[Math.floor(Math.random() * emotes.length)];
    emoteTimer = 80;
  };

  canvas.addEventListener("click", () => window.triggerAvatarInteract());
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = ((e.clientX - rect.left) / rect.width) * VIRTUAL_W;
    mouseY = ((e.clientY - rect.top) / rect.height) * VIRTUAL_H;
    isHovered = true;
  });
  canvas.addEventListener("mouseleave", () => {
    mouseX = VIRTUAL_W / 2;
    mouseY = VIRTUAL_H / 2;
    isHovered = false;
  });

  // Main Render Loop
  function render() {
    tick++;

    // Clear buffer
    bctx.fillStyle = "#0c0d18";
    bctx.fillRect(0, 0, VIRTUAL_W, VIRTUAL_H);

    // Subtle background grid
    bctx.fillStyle = "rgba(0, 240, 255, 0.04)";
    for (let gx = 0; gx < VIRTUAL_W; gx += 8) {
      bctx.fillRect(gx, 0, 1, VIRTUAL_H);
    }
    for (let gy = 0; gy < VIRTUAL_H; gy += 8) {
      bctx.fillRect(0, gy, VIRTUAL_W, 1);
    }

    // Update & draw cyber particles
    particles.forEach((pt) => {
      pt.y -= pt.speed;
      if (pt.y < 0) {
        pt.y = VIRTUAL_H;
        pt.x = Math.random() * VIRTUAL_W;
      }
      bctx.fillStyle = pt.color;
      bctx.globalAlpha = pt.alpha * (0.6 + 0.4 * Math.sin(tick * 0.05 + pt.x));
      bctx.fillRect(Math.floor(pt.x), Math.floor(pt.y), pt.size, pt.size);
    });
    bctx.globalAlpha = 1.0;

    // Physics for jump
    if (jumpVelocity !== 0 || jumpY < 0) {
      jumpY += jumpVelocity;
      jumpVelocity += 0.35; // gravity
      if (jumpY >= 0) {
        jumpY = 0;
        jumpVelocity = 0;
      }
    }

    // Breathing idle animation
    const breath = Math.sin(tick * 0.08) * 1.2;
    const bodyY = 62 + jumpY + Math.round(breath);
    const bodyX = 42;

    // ------------------------------------------------------------------------
    // SHADOW
    // ------------------------------------------------------------------------
    const shadowW = Math.max(16, 28 - Math.abs(jumpY) * 0.8);
    bctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    bctx.fillRect(Math.floor(bodyX + 16 - shadowW / 2), 110, Math.floor(shadowW), 3);

    // ------------------------------------------------------------------------
    // CHARACTER SPRITE (Cyber AI Bot / Operator)
    // ------------------------------------------------------------------------
    // Cape / Cyber Cloak (Behind body)
    const capeFlutter = Math.sin(tick * 0.12) * 2;
    for (let cy = 0; cy < 26; cy++) {
      const cw = 20 + Math.floor(cy * 0.35);
      const cx = bodyX + 6 + (cy > 10 ? capeFlutter * 0.4 : 0);
      pLine(cx, bodyY + 16 + cy, cw, "#1a1236");
      p(cx + cw - 1, bodyY + 16 + cy, "#ff007f"); // glowing trim
    }

    // Torso / Cyber Armor
    bctx.fillStyle = "#222744";
    bctx.fillRect(bodyX + 8, bodyY + 16, 18, 20); // Jacket base
    bctx.fillStyle = "#161828";
    bctx.fillRect(bodyX + 11, bodyY + 17, 12, 18); // Inner shirt

    // Cyber Circuit on chest (pulses neon cyan)
    const circuitGlow = Math.sin(tick * 0.1) > 0 ? "#00f0ff" : "#0088aa";
    p(bodyX + 16, bodyY + 20, circuitGlow, 2, 8);
    p(bodyX + 14, bodyY + 23, circuitGlow, 6, 2);
    p(bodyX + 17, bodyY + 23, "#ffbe0b", 1, 2); // Core crystal

    // Belt & Pouch
    pLine(bodyX + 9, bodyY + 34, 16, "#ffbe0b");
    p(bodyX + 11, bodyY + 33, "#39ff14", 3, 3); // Gadget pouch

    // Legs
    bctx.fillStyle = "#1e2238";
    bctx.fillRect(bodyX + 10, bodyY + 36, 5, 12);
    bctx.fillRect(bodyX + 19, bodyY + 36, 5, 12);

    // Cyber Boots (with cyan soles)
    bctx.fillStyle = "#0c0e18";
    bctx.fillRect(bodyX + 9, bodyY + 44, 7, 5);
    bctx.fillRect(bodyX + 18, bodyY + 44, 7, 5);
    pLine(bodyX + 9, bodyY + 48, 7, "#00f0ff");
    pLine(bodyX + 18, bodyY + 48, 7, "#00f0ff");

    // Arms & Hands
    bctx.fillStyle = "#2b3155";
    bctx.fillRect(bodyX + 4, bodyY + 18, 4, 14); // Left arm
    bctx.fillRect(bodyX + 26, bodyY + 18, 4, 14); // Right arm
    p(bodyX + 4, bodyY + 30, "#ffcf99", 4, 4); // Hand L
    p(bodyX + 26, bodyY + 30, "#ffcf99", 4, 4); // Hand R
    p(bodyX + 4, bodyY + 22, "#39ff14", 4, 1); // LED armband

    // Neck
    p(bodyX + 15, bodyY + 13, "#e6b080", 4, 3);

    // Head / Cyber Helmet / Face
    bctx.fillStyle = "#1c1e30"; // Helmet back
    bctx.fillRect(bodyX + 7, bodyY - 4, 20, 18);
    bctx.fillStyle = "#fed19c"; // Face skin
    bctx.fillRect(bodyX + 9, bodyY, 16, 12);

    // Cyber Hair (Neon Dark Violet with pixel highlights)
    bctx.fillStyle = "#4a2d6b";
    bctx.fillRect(bodyX + 6, bodyY - 6, 22, 7);
    bctx.fillRect(bodyX + 5, bodyY - 3, 4, 10);
    p(bodyX + 8, bodyY - 7, "#9d4edd", 16, 2);
    p(bodyX + 10, bodyY - 1, "#9d4edd", 4, 2); // Bangs

    // Headset Antenna & Status LED
    p(bodyX + 6, bodyY + 3, "#555b7c", 2, 5);
    p(bodyX + 5, bodyY - 2, "#555b7c", 1, 6);
    const ledColor = Math.floor(tick / 20) % 2 === 0 ? "#39ff14" : "#00f0ff";
    p(bodyX + 4, bodyY - 3, ledColor, 3, 2);

    // Interactive Visor (Tracks mouse slightly or sweeps left to right)
    const visorY = bodyY + 3;
    const visorBaseX = bodyX + 11;
    const sweep = Math.floor((Math.sin(tick * 0.15) + 1) * 4); // 0 to 8
    bctx.fillStyle = "#0a0a14";
    bctx.fillRect(visorBaseX, visorY, 13, 5); // Visor frame

    // Glowing Neon Visor bar
    bctx.fillStyle = "#00f0ff";
    bctx.fillRect(visorBaseX + 1, visorY + 1, 11, 3);
    // Scanning high-intensity pixel beam
    bctx.fillStyle = "#ffffff";
    bctx.fillRect(visorBaseX + 2 + sweep, visorY + 1, 2, 3);

    // Mouth / Expression
    if (jumpY < 0) {
      // Surprised / excited open mouth :D
      p(bodyX + 16, bodyY + 9, "#331111", 3, 2);
    } else {
      // Neutral smirking line
      pLine(bodyX + 15, bodyY + 9, 4, "#995544");
    }

    // ------------------------------------------------------------------------
    // FLOATING AI DRONE COMPANION (Orbiting Pet)
    // ------------------------------------------------------------------------
    const droneOrbitAngle = tick * 0.04;
    const droneHover = Math.sin(tick * 0.09) * 4;
    const droneX = bodyX + 48 + Math.cos(droneOrbitAngle) * 6;
    const droneY = bodyY - 6 + Math.sin(droneOrbitAngle) * 3 + droneHover;

    // Drone Outer Shell (Rounded pixel pod)
    bctx.fillStyle = "#1e2238";
    bctx.fillRect(droneX - 6, droneY - 6, 13, 13);
    bctx.fillStyle = "#2d345a";
    bctx.fillRect(droneX - 5, droneY - 5, 11, 11);

    // Drone Pulsing Core (AI Eye)
    const dronePulse = (Math.sin(tick * 0.18) + 1) / 2;
    const coreColor = dronePulse > 0.6 ? "#ff007f" : (dronePulse > 0.3 ? "#00f0ff" : "#39ff14");
    p(droneX - 2, droneY - 2, "#ffffff", 5, 5);
    p(droneX - 1, droneY - 1, coreColor, 3, 3);

    // Orbital satellite bits
    const sat1Angle = tick * 0.1;
    const sat1X = droneX + Math.cos(sat1Angle) * 11;
    const sat1Y = droneY + Math.sin(sat1Angle) * 11;
    p(sat1X, sat1Y, "#00f0ff", 2, 2);

    const sat2Angle = sat1Angle + Math.PI;
    const sat2X = droneX + Math.cos(sat2Angle) * 11;
    const sat2Y = droneY + Math.sin(sat2Angle) * 11;
    p(sat2X, sat2Y, "#ffbe0b", 2, 2);

    // Laser data tether from drone to player headset
    bctx.strokeStyle = "rgba(0, 240, 255, 0.18)";
    bctx.setLineDash([2, 2]);
    bctx.beginPath();
    bctx.moveTo(droneX, droneY);
    bctx.lineTo(bodyX + 7, bodyY - 1);
    bctx.stroke();
    bctx.setLineDash([]);

    // ------------------------------------------------------------------------
    // EMOTE SPEECH BUBBLE
    // ------------------------------------------------------------------------
    if (emoteTimer > 0) {
      emoteTimer--;
      const bubbleX = bodyX + 22;
      const bubbleY = bodyY - 22;

      // Pixel speech bubble frame
      bctx.fillStyle = "#ffffff";
      bctx.fillRect(bubbleX - 10, bubbleY - 8, 22, 14);
      bctx.fillStyle = "#0c0d18";
      bctx.fillRect(bubbleX - 9, bubbleY - 7, 20, 12);
      // Arrow
      p(bubbleX - 3, bubbleY + 6, "#ffffff", 4, 1);
      p(bubbleX - 2, bubbleY + 7, "#0c0d18", 2, 1);

      // Emote text
      bctx.font = "8px 'Press Start 2P', monospace";
      bctx.fillStyle = "#00f0ff";
      bctx.textAlign = "center";
      bctx.fillText(activeEmote, bubbleX + 1, bubbleY + 2);
    }

    // ------------------------------------------------------------------------
    // FLIP BUFFER ONTO MAIN CANVAS (Retain crisp pixels)
    // ------------------------------------------------------------------------
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(buffer, 0, 0, canvas.width, canvas.height);

    requestAnimationFrame(render);
  }

  // Adjust canvas resolution dynamically
  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);
    ctx.imageSmoothingEnabled = false;
  }
  window.addEventListener("resize", resize);
  resize();

  render();
})();
