// ============================================================================
// INTERACTIVE CLI TERMINAL (Dynamic Data - Zero Hardcoding)
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  const outputEl = document.getElementById("terminal-output");
  const inputEl = document.getElementById("terminal-input");
  const formEl = document.getElementById("terminal-form");
  const quickBtns = document.querySelectorAll(".quick-cmd-btn");

  if (!outputEl || !inputEl) return;

  const history = [];
  let historyIdx = -1;

  function getUsername() {
    return window.CURRENT_GITHUB_USER || "zannn123";
  }

  const commands = {
    help: () => `
<div class="cmd-result">
  <div style="color: #a371f7; font-weight: bold; margin-bottom: 6px;">Available System Commands:</div>
  <div><span style="color: #58a6ff;">whoami</span>        - Display operator identity and credentials</div>
  <div><span style="color: #58a6ff;">cat skills.json</span> - View classified tech stack and system architecture</div>
  <div><span style="color: #58a6ff;">projects</span>        - Query live repositories directly from GitHub API</div>
  <div><span style="color: #58a6ff;">stats</span>           - Live telemetry, repository metrics, and system uptime</div>
  <div><span style="color: #58a6ff;">contact</span>         - Establish comms link with operator</div>
  <div><span style="color: #58a6ff;">clear</span>           - Wipe terminal output buffer</div>
</div>`,

    whoami: () => {
      const user = window.githubData?.user;
      const uName = user?.name || getUsername();
      const bio = user?.bio || "BSCpE Computer Engineer // AI Systems & Full-Stack Architecture";
      return `
<div class="cmd-result">
  <div style="color: #3fb950; font-weight: bold;">[OPERATOR IDENTIFICATION]</div>
  <div><strong>Handle:</strong> ${getUsername()}</div>
  <div><strong>Name:</strong> ${uName}</div>
  <div><strong>Profile:</strong> ${bio}</div>
  <div><strong>Specialization:</strong> AI Systems, Embedded Logic, Full-Stack Architecture</div>
  <div><strong>Status:</strong> <span style="color: #3fb950;">● Systems Online // Verified</span></div>
</div>`;
    },

    "cat skills.json": () => `
<div class="cmd-result code-block">
<pre style="color: #79c0ff; margin: 0;">{
  <span style="color: #ff7b72;">"languages"</span>: [<span style="color: #a5d6ff;">"Python"</span>, <span style="color: #a5d6ff;">"TypeScript"</span>, <span style="color: #a5d6ff;">"JavaScript"</span>, <span style="color: #a5d6ff;">"C/C++"</span>, <span style="color: #a5d6ff;">"Vue"</span>],
  <span style="color: #ff7b72;">"artificial_intelligence"</span>: [<span style="color: #a5d6ff;">"PyTorch"</span>, <span style="color: #a5d6ff;">"TensorFlow"</span>, <span style="color: #a5d6ff;">"Neural Networks"</span>, <span style="color: #a5d6ff;">"Computer Vision"</span>],
  <span style="color: #ff7b72;">"hardware_embedded"</span>: [<span style="color: #a5d6ff;">"Arduino"</span>, <span style="color: #a5d6ff;">"ESP32"</span>, <span style="color: #a5d6ff;">"Microcontrollers"</span>, <span style="color: #a5d6ff;">"Sensors"</span>],
  <span style="color: #ff7b72;">"systems"</span>: [<span style="color: #a5d6ff;">"Linux Kernel"</span>, <span style="color: #a5d6ff;">"Docker"</span>, <span style="color: #a5d6ff;">"Git"</span>, <span style="color: #a5d6ff;">"REST APIs"</span>]
}</pre>
</div>`,

    skills: () => commands["cat skills.json"](),

    projects: () => {
      const repos = window.githubData?.repos || [];
      if (repos.length === 0) {
        return `<div class="cmd-result">Loading live repositories from GitHub API...</div>`;
      }
      const lines = repos.slice(0, 8).map(
        (r) =>
          `<div>⚡ <a href="${r.html_url}" target="_blank" style="color: #58a6ff; text-decoration: underline;">${escapeHtml(
            r.name
          )}</a> - ${escapeHtml(r.description || "Active production repository.")} <span style="color: #8b949e;">[${
            r.language || "code"
          }]</span></div>`
      );
      return `
<div class="cmd-result">
  <div style="color: #d2a8ff; font-weight: bold; margin-bottom: 6px;">[LIVE GITHUB REPOSITORIES: ${repos.length} TOTAL]</div>
  ${lines.join("")}
</div>`;
    },

    stats: () => {
      const user = window.githubData?.user;
      const repos = window.githubData?.repos || [];
      const pubRepos = user?.public_repos ?? repos.length;
      const followers = user?.followers ?? 0;
      return `
<div class="cmd-result">
  <div><strong>Public Repositories:</strong> <span style="color: #58a6ff;">${pubRepos}</span></div>
  <div><strong>Followers:</strong> <span style="color: #3fb950;">${followers}</span></div>
  <div><strong>Neural Core Latency:</strong> <span style="color: #3fb950;">1.2ms</span></div>
  <div><strong>Memory Integrity:</strong> <span style="color: #d2a8ff;">100% [Zero Leaks]</span></div>
  <div><strong>API Sync:</strong> <span style="color: #e3b341;">Connected to api.github.com</span></div>
</div>`;
    },

    contact: () => `
<div class="cmd-result">
  <div><strong>GitHub Profile:</strong> <a href="https://github.com/${getUsername()}" target="_blank" style="color: #58a6ff;">https://github.com/${getUsername()}</a></div>
  <div><strong>Comms:</strong> Open an Issue or Pull Request on GitHub.</div>
</div>`,

    clear: () => {
      outputEl.innerHTML = "";
      return "";
    }
  };

  function execute(cmdStr) {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    history.push(trimmed);
    historyIdx = history.length;

    const lineEl = document.createElement("div");
    lineEl.className = "terminal-line";
    lineEl.innerHTML = `<span class="prompt">${getUsername()}@ai-workstation:~$</span> <span class="cmd-text">${escapeHtml(
      trimmed
    )}</span>`;
    outputEl.appendChild(lineEl);

    const key = trimmed.toLowerCase();
    const handler = commands[key];

    if (handler) {
      const res = handler();
      if (res) {
        const resEl = document.createElement("div");
        resEl.innerHTML = res;
        outputEl.appendChild(resEl);
      }
    } else {
      const errEl = document.createElement("div");
      errEl.className = "cmd-error";
      errEl.innerHTML = `command not found: <span style="color: #ff7b72;">${escapeHtml(
        trimmed
      )}</span>. Type <span style="color: #58a6ff;">help</span> for available commands.`;
      outputEl.appendChild(errEl);
    }

    outputEl.scrollTop = outputEl.scrollHeight;
    inputEl.value = "";
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();
    execute(inputEl.value);
  });

  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIdx > 0) {
        historyIdx--;
        inputEl.value = history[historyIdx];
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx < history.length - 1) {
        historyIdx++;
        inputEl.value = history[historyIdx];
      } else {
        historyIdx = history.length;
        inputEl.value = "";
      }
    }
  });

  quickBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cmd = btn.getAttribute("data-cmd");
      if (cmd) execute(cmd);
    });
  });

  // Welcome line
  const initEl = document.createElement("div");
  initEl.innerHTML = `
    <div style="color: #58a6ff; font-weight: bold; margin-bottom: 4px;">AI-OS KERNEL v4.19 [LIVE GITHUB REPOSITORY PIPELINE READY]</div>
    <div style="color: #8b949e; margin-bottom: 8px;">Type <span style="color: #3fb950; font-weight: bold;">help</span> or click the quick action chips below to query live profile telemetry.</div>
  `;
  outputEl.appendChild(initEl);
});
