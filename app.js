// ============================================================================
// RETRO PIXEL PROFILE CONTROLLER (app.js)
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const soundBtn = document.getElementById("sound-toggle-btn");
  const crtBtn = document.getElementById("crt-toggle-btn");
  const crtOverlay = document.getElementById("crt-overlay");
  const terminalBody = document.getElementById("terminal-text");
  const terminalChoices = document.getElementById("terminal-choices");
  const expFill = document.getElementById("exp-fill");
  const expText = document.getElementById("exp-text");
  const levelText = document.getElementById("player-level");
  const itemSlots = document.querySelectorAll(".item-slot");
  const itemDetails = document.getElementById("item-details");

  let currentLevel = 99;
  let currentExp = 88;

  // --------------------------------------------------------------------------
  // AUDIO TOGGLE
  // --------------------------------------------------------------------------
  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      const isEnabled = window.pixelAudio.toggle();
      soundBtn.textContent = isEnabled ? "[SFX: ON]" : "[SFX: OFF]";
      soundBtn.classList.toggle("active", isEnabled);
      if (isEnabled) {
        window.pixelAudio.playClick();
      }
    });
  }

  // --------------------------------------------------------------------------
  // CRT OVERLAY TOGGLE
  // --------------------------------------------------------------------------
  if (crtBtn && crtOverlay) {
    crtBtn.addEventListener("click", () => {
      if (window.pixelAudio) window.pixelAudio.playClick();
      crtOverlay.classList.toggle("disabled");
      const isOn = !crtOverlay.classList.contains("disabled");
      crtBtn.textContent = isOn ? "[CRT: ON]" : "[CRT: OFF]";
      crtBtn.classList.toggle("active", isOn);
    });
  }

  // --------------------------------------------------------------------------
  // UNIVERSAL SFX HOOKS FOR BUTTONS & LINKS
  // --------------------------------------------------------------------------
  document.querySelectorAll("button, a, .interactive").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      if (window.pixelAudio) window.pixelAudio.playBlip(720, 0.03);
    });
    el.addEventListener("click", () => {
      if (window.pixelAudio) window.pixelAudio.playClick();
    });
  });

  // --------------------------------------------------------------------------
  // INVENTORY ITEMS DATA
  // --------------------------------------------------------------------------
  const items = {
    python: {
      name: "PYTHON NEURAL MATRIX",
      rarity: "MYTHIC",
      type: "AI / Core Engine",
      stats: "+50 INT, +40 Deep Learning",
      desc: "An ancient high-level construct capable of breathing cognitive neural networks into cold silicon."
    },
    hardware: {
      name: "BSCPE HARDWARE CHIP",
      rarity: "LEGENDARY",
      type: "Computer Engineering",
      stats: "+45 STR, +35 Circuit Logic",
      desc: "Forged in the labs of Computer Engineering. Interfaces physical pins directly with digital signals."
    },
    js: {
      name: "TYPESCRIPT CYBER-BLADE",
      rarity: "EPIC",
      type: "Full-Stack Weapon",
      stats: "+38 AGI, +25 Type Safety",
      desc: "Slices through undefined bugs and renders real-time reactive user interfaces with zero delay."
    },
    linux: {
      name: "LINUX KERNEL TERMINAL",
      rarity: "RELIC",
      type: "Operating System",
      stats: "+60 DEF, Root Permissions",
      desc: "Grants absolute authority over processes, daemons, containers, and server infrastructure."
    },
    git: {
      name: "CHRONO-GIT DRIVE",
      rarity: "ARTIFACT",
      type: "Time Manipulation",
      stats: "+30 WIS, Infinite Reverts",
      desc: "Allows branching realities, merging feature timelines, and rolling back cataclysmic bugs."
    },
    docker: {
      name: "CONTAINER POD [DOCKER]",
      rarity: "RARE",
      type: "Environment Ward",
      stats: "+32 DEF, Zero Dependency Drift",
      desc: "Encapsulates full operating environments into atomic, portable hyper-cubes."
    }
  };

  itemSlots.forEach((slot) => {
    slot.addEventListener("click", () => {
      const key = slot.getAttribute("data-item");
      const data = items[key];
      if (!data) return;

      itemSlots.forEach((s) => s.classList.remove("selected"));
      slot.classList.add("selected");
      if (window.pixelAudio) window.pixelAudio.playClick();

      itemDetails.innerHTML = `
        <div class="item-card">
          <div class="item-title ${data.rarity.toLowerCase()}">${data.name}</div>
          <div class="item-meta"><span>[${data.rarity}]</span> <span>${data.type}</span></div>
          <div class="item-stats">⚡ STATS: ${data.stats}</div>
          <div class="item-desc">${data.desc}</div>
        </div>
      `;
    });
  });

  // --------------------------------------------------------------------------
  // AI TERMINAL DIALOGUE SYSTEM (TYPEWRITER)
  // --------------------------------------------------------------------------
  let isTyping = false;
  let typeTimeout = null;

  function typewriteText(text, callback) {
    if (typeTimeout) clearTimeout(typeTimeout);
    terminalBody.textContent = "";
    isTyping = true;
    let i = 0;

    function nextChar() {
      if (i < text.length) {
        terminalBody.textContent += text.charAt(i);
        if (i % 2 === 0 && window.pixelAudio) {
          window.pixelAudio.playDialogueBlip();
        }
        i++;
        typeTimeout = setTimeout(nextChar, 18);
      } else {
        isTyping = false;
        if (callback) callback();
      }
    }
    nextChar();
  }

  const dialogueTree = {
    intro: {
      text: "GREETINGS, TRAVELER. I AM ZANNN-01, AN AUTONOMOUS AI CYBER-BOT AND COMPUTER ENGINEERING OPERATOR. SYSTEM DIAGNOSTICS ARE NOMINAL. HOW CAN I ASSIST YOUR JOURNEY?",
      options: [
        { label: "> WHO ARE YOU?", target: "who" },
        { label: "> TECH ARSENAL", target: "skills" },
        { label: "> RUN SELF-DIAGNOSTIC", target: "diagnostics" },
        { label: "> TRANSMIT MESSAGE", target: "contact" }
      ]
    },
    who: {
      text: "IDENTITY: ZANNN123 // CLASS: BSCPE COMPUTER ENGINEER & AI DEVELOPER. SPECIALIZED IN EMBEDDED LOGIC, FULL-STACK SYSTEMS, AND INTELLIGENT NEURAL ASSISTANTS. CURRENTLY LEVEL 99 IN PROBLEM SOLVING.",
      options: [
        { label: "> SHOW ACTIVE QUESTS", target: "quests" },
        { label: "> SUMMON AI DRONE", action: () => window.triggerAvatarInteract("AI") },
        { label: "> BACK TO MAIN MENU", target: "intro" }
      ]
    },
    skills: {
      text: "ARSENAL LOADED: PYTHON, JAVASCRIPT/TYPESCRIPT, C/C++, EMBEDDED ARDUINO/ESP32, LINUX TERMINAL, GIT, SQL/BACKEND ARCHITECTURE, AND NEURAL PIPELINES. READY FOR PRODUCTION DEPLOYMENT.",
      options: [
        { label: "> INSPECT GEAR SLOTS", action: () => {
          document.querySelector(".inventory-grid").scrollIntoView({ behavior: "smooth" });
          window.triggerAvatarInteract("⚡");
        }},
        { label: "> BACK TO MAIN MENU", target: "intro" }
      ]
    },
    diagnostics: {
      text: "RUNNING SYSTEM INTEGRITY SCAN... [████████████████] 100% OK! NEURAL CORES BALANCED. ZERO FATAL MEMORY LEAKS DETECTED. ALL SYSTEMS OPERATING AT PEAK 8-BIT EFFICIENCY!",
      options: [
        { label: "> CELEBRATE (+100 XP)", action: () => boostExp(10) },
        { label: "> BACK TO MAIN MENU", target: "intro" }
      ]
    },
    quests: {
      text: "PRIMARY CAMPAIGN: [R.I.Z.A.L. CAMPUS ASSIST] - AN AI ACADEMIC MATRIX. SECONDARY EXPEDITIONS: [AURA-LANDING], [SYNC BSCPE HUB], AND [DAPITAN HERITAGE PORTAL]. CHECK QUEST BOARD BELOW!",
      options: [
        { label: "> JUMP TO QUEST BOARD", action: () => {
          document.getElementById("quest-board").scrollIntoView({ behavior: "smooth" });
        }},
        { label: "> BACK TO MAIN MENU", target: "intro" }
      ]
    },
    contact: {
      text: "COMMS LINK OPEN! FREQUENCY DIRECTED TO GITHUB @zannn123. READY TO FORGE NEW ALLIANCES, CODEBASES, AND RESEARCH MISSIONS.",
      options: [
        { label: "> TELEPORT TO GITHUB", action: () => window.open("https://github.com/zannn123", "_blank") },
        { label: "> BACK TO MAIN MENU", target: "intro" }
      ]
    }
  };

  function setDialogue(nodeKey) {
    const node = dialogueTree[nodeKey];
    if (!node) return;

    terminalChoices.innerHTML = "";
    typewriteText(node.text, () => {
      node.options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.textContent = opt.label;
        btn.addEventListener("mouseenter", () => {
          if (window.pixelAudio) window.pixelAudio.playBlip(800, 0.02);
        });
        btn.addEventListener("click", () => {
          if (opt.action) opt.action();
          if (opt.target) setDialogue(opt.target);
        });
        terminalChoices.appendChild(btn);
      });
    });
  }

  // --------------------------------------------------------------------------
  // LEVEL UP & EXP BOOSTER (EASTER EGG)
  // --------------------------------------------------------------------------
  function boostExp(amount) {
    currentExp += amount;
    if (currentExp >= 100) {
      currentExp = currentExp - 100;
      currentLevel += 1;
      if (levelText) levelText.textContent = `LVL ${currentLevel}`;
      if (window.pixelAudio) window.pixelAudio.playVictory();
      if (window.triggerAvatarInteract) window.triggerAvatarInteract("LVL UP!");
    } else {
      if (window.pixelAudio) window.pixelAudio.playClick();
      if (window.triggerAvatarInteract) window.triggerAvatarInteract("+XP");
    }
    if (expFill) expFill.style.width = `${currentExp}%`;
    if (expText) expText.textContent = `${currentExp}/100`;
  }

  const expBar = document.getElementById("exp-bar");
  if (expBar) {
    expBar.addEventListener("click", () => boostExp(15));
  }

  // --------------------------------------------------------------------------
  // QUEST BOARD FILTERING
  // --------------------------------------------------------------------------
  const filterBtns = document.querySelectorAll(".filter-btn");
  const questCards = document.querySelectorAll(".quest-card");

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");

      questCards.forEach((card) => {
        if (filter === "all" || card.getAttribute("data-category") === filter) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
      if (window.pixelAudio) window.pixelAudio.playClick();
    });
  });

  // Start with intro
  setDialogue("intro");
});
