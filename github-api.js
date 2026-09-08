// ============================================================================
// DYNAMIC GITHUB API FETCHER (Zero Hardcoding - Live Data & Graceful Fallback)
// ============================================================================

(function () {
  // Determine GitHub username dynamically from URL or fallback to repository owner
  const urlParams = new URLSearchParams(window.location.search);
  const hostname = window.location.hostname;
  let defaultUser = "zannn123";

  // If hosted on username.github.io, extract username
  if (hostname.endsWith(".github.io")) {
    const parts = hostname.split(".");
    if (parts.length > 0 && parts[0] !== "www") {
      defaultUser = parts[0];
    }
  }

  const USERNAME = urlParams.get("user") || defaultUser;
  window.CURRENT_GITHUB_USER = USERNAME;

  // Language colors database
  const LANG_COLORS = {
    Python: "#3572A5",
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    "C++": "#f34b7d",
    C: "#555555",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Vue: "#41b883",
    Shell: "#89e051",
    Rust: "#dea584",
    Go: "#00ADD8",
    Java: "#b07219",
    Default: "#58a6ff"
  };

  window.githubData = {
    user: null,
    repos: [],
    languages: {}
  };

  async function fetchGitHubData() {
    try {
      const [userRes, reposRes] = await Promise.all([
        fetch(`https://api.github.com/users/${USERNAME}`),
        fetch(`https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=30`)
      ]);

      if (!userRes.ok || !reposRes.ok) {
        throw new Error(`GitHub API returned status: ${userRes.status}/${reposRes.status}`);
      }

      const user = await userRes.json();
      const repos = await reposRes.json();

      window.githubData.user = user;
      window.githubData.repos = Array.isArray(repos) ? repos : [];

      renderDynamicData();
    } catch (err) {
      console.warn("GitHub API live fetch error (using cached fallback):", err);
      renderFallback();
    }
  }

  function renderDynamicData() {
    const { user, repos } = window.githubData;
    if (!user) return;

    // 1. Update Profile & Avatar
    const avatarEl = document.querySelector(".avatar-inner");
    if (avatarEl && user.avatar_url) {
      avatarEl.innerHTML = `<img src="${user.avatar_url}" alt="${user.login}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />`;
    }

    const nameEl = document.querySelector(".hero-name");
    if (nameEl) {
      nameEl.innerHTML = `${user.name || user.login}<span> // ${user.login}</span>`;
    }

    const bioEl = document.querySelector(".hero-subtitle");
    if (bioEl && user.bio) {
      bioEl.textContent = user.bio;
    }

    // 2. Telemetry Stats
    const repoCountEl = document.getElementById("stat-repos");
    if (repoCountEl) repoCountEl.textContent = user.public_repos || repos.length;

    const followerCountEl = document.getElementById("stat-followers");
    if (followerCountEl) followerCountEl.textContent = user.followers ?? 0;

    // 3. Calculate Languages Dynamically
    const langCounts = {};
    let totalLangs = 0;

    repos.forEach((repo) => {
      const lang = repo.language || "Other";
      langCounts[lang] = (langCounts[lang] || 0) + 1;
      totalLangs++;
    });

    const sortedLangs = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    window.githubData.languages = langCounts;

    // Render Language Bar
    const langBar = document.querySelector(".lang-progress-bar");
    const langLegend = document.querySelector(".lang-legend");

    if (langBar && langLegend && totalLangs > 0) {
      langBar.innerHTML = "";
      langLegend.innerHTML = "";

      sortedLangs.forEach(([lang, count]) => {
        const pct = Math.round((count / totalLangs) * 100);
        const color = LANG_COLORS[lang] || LANG_COLORS.Default;

        const seg = document.createElement("div");
        seg.className = "lang-seg";
        seg.style.width = `${pct}%`;
        seg.style.backgroundColor = color;
        seg.title = `${lang}: ${pct}%`;
        langBar.appendChild(seg);

        const leg = document.createElement("div");
        leg.className = "legend-item";
        leg.innerHTML = `<span class="dot-color" style="background: ${color};"></span> ${lang} (${pct}%)`;
        langLegend.appendChild(leg);
      });
    }

    // 4. Render Dynamic Repositories Grid
    const repoGrid = document.querySelector(".repo-grid");
    if (repoGrid && repos.length > 0) {
      repoGrid.innerHTML = "";

      // Filter out current profile repo or show top 6 updated repos
      const displayRepos = repos.slice(0, 6);

      displayRepos.forEach((repo) => {
        const lang = repo.language || "Text";
        const langColor = LANG_COLORS[lang] || LANG_COLORS.Default;
        const desc = repo.description || "Active production repository.";

        const card = document.createElement("a");
        card.href = repo.html_url;
        card.target = "_blank";
        card.className = "repo-card";
        card.innerHTML = `
          <div class="repo-header">
            <span class="repo-icon">📁</span>
            <span class="repo-name">${escapeHtml(repo.name)}</span>
            <span class="repo-badge">${repo.private ? "Private" : "Public"}</span>
          </div>
          <p class="repo-desc">${escapeHtml(desc)}</p>
          <div class="repo-footer">
            <span class="repo-lang"><span class="dot-color" style="background: ${langColor};"></span> ${escapeHtml(lang)}</span>
            <span>★ ${repo.stargazers_count || 0}</span>
            <span>⑂ ${repo.forks_count || 0}</span>
          </div>
        `;
        repoGrid.appendChild(card);
      });
    }
  }

  function renderFallback() {
    // If offline or rate limited, keep default structure
    const repoCountEl = document.getElementById("stat-repos");
    if (repoCountEl && !repoCountEl.textContent) repoCountEl.textContent = "7+";
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Execute on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fetchGitHubData);
  } else {
    fetchGitHubData();
  }
})();
