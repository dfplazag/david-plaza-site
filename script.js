(function () {
  // Footer year
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // Mobile nav
  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });

    links.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Sticky header polish
  const header = document.querySelector(".site-header");
  function onScroll() {
    if (!header) return;
    const sticky = window.scrollY > 10;
    header.classList.toggle("is-sticky", sticky);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Utilities
  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function pubMeta(pub) {
    const bits = [];
    if (pub.year) bits.push(pub.year);
    // Try to show venue (best-effort: part after title)
    // Keep safe: display citation line after title is already in citation; we show full citation in smaller text.
    return bits.join(" · ");
  }

  function buildPubCard(pub, featured=false) {
    const title = escapeHtml(pub.title || "");
    const citation = escapeHtml(pub.citation || "");
    const link = pub.link ? escapeHtml(pub.link) : "";
    const topics = Array.isArray(pub.topics) ? pub.topics : [];
    const badge = pub.type === "preprint" ? `<span class="tag">Preprint</span>` : "";

    const linkHtml = link ? `<a class="pub-link" href="${link}" target="_blank" rel="noopener">Open</a>` : "";
    const topicsHtml = topics.length
      ? `<div class="tags" aria-label="Topics">${topics.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>`
      : "";

    return `
      <article class="pub${featured ? " pub--featured" : ""}" data-id="${pub.id}">
        <div class="pub-top">
          <h3>${title}</h3>
          <div class="pub-actions">${badge}${linkHtml}</div>
        </div>
        ${featured ? `<p class="pub-year">${escapeHtml(pubMeta(pub))}</p>` : ""}
        <p class="pub-meta">${citation}</p>
        ${topicsHtml}
      </article>
    `;
  }

  // Publications rendering
  const pubsContainer = document.getElementById("pubs");
  const featuredContainer = document.getElementById("featured-pubs");
  const countEl = document.getElementById("pub-count");
  const searchEl = document.getElementById("pub-search");
  const sortEl = document.getElementById("pub-sort");
  const pills = Array.from(document.querySelectorAll(".filters .pill"));

  let allPubs = [];
  let featuredIds = [];
  let activeFilter = "all";
  let activeQuery = "";
  let activeSort = "year_desc";

  function applySort(list) {
    const copy = list.slice();
    const byTitle = (a,b) => (a.title || "").localeCompare(b.title || "");
    const byYear = (a,b) => (a.year || 0) - (b.year || 0);

    if (activeSort === "year_asc") copy.sort(byYear);
    else if (activeSort === "title_asc") copy.sort(byTitle);
    else copy.sort((a,b) => byYear(b,a)); // year_desc default
    return copy;
  }

  function matches(pub) {
    const q = activeQuery.trim().toLowerCase();
    const inQuery = !q || (pub.title || "").toLowerCase().includes(q) || (pub.citation || "").toLowerCase().includes(q);

    const inFilter = activeFilter === "all" || (Array.isArray(pub.topics) && pub.topics.includes(activeFilter));
    return inQuery && inFilter;
  }

  function renderFeatured() {
    if (!featuredContainer) return;
    const featured = allPubs.filter(p => featuredIds.includes(p.id));
    featuredContainer.innerHTML = featured.map(p => buildPubCard(p, true)).join("");
  }

  function renderList() {
    if (!pubsContainer) return;
    const filtered = applySort(allPubs.filter(matches));
    pubsContainer.innerHTML = filtered.map(p => buildPubCard(p, false)).join("");

    if (countEl) {
      countEl.textContent = `Showing ${filtered.length} of ${allPubs.length} publications`;
    }
  }

  function setActivePill(btn) {
    pills.forEach(p => p.classList.remove("is-active"));
    btn.classList.add("is-active");
  }

  pills.forEach(btn => {
    btn.addEventListener("click", () => {
      activeFilter = btn.getAttribute("data-filter") || "all";
      setActivePill(btn);
      renderList();
    });
  });

  if (searchEl) {
    searchEl.addEventListener("input", () => {
      activeQuery = searchEl.value || "";
      renderList();
    });
  }

  if (sortEl) {
    sortEl.addEventListener("change", () => {
      activeSort = sortEl.value || "year_desc";
      renderList();
    });
  }

  async function loadPublications() {
    try {
      // Prefer inline JSON for local file:// preview (Chrome blocks fetch in many cases)
      const inline = document.getElementById("publications-data");
      const data = inline ? JSON.parse(inline.textContent) : null;

      let payload = data;
      if (!payload) {
        const res = await fetch("data/publications.json", { cache: "no-store" });
        payload = await res.json();
      }

      featuredIds = Array.isArray(payload.featured_ids) ? payload.featured_ids : [];
      allPubs = Array.isArray(payload.publications) ? payload.publications : [];
      renderFeatured();
      renderList();

      // Populate CV publications tab
      const cvList = document.getElementById("cv-pubs-list");
      if (cvList) {
        const sorted = applySort(allPubs); // default year_desc
        cvList.innerHTML = sorted.map(p => `<li>${escapeHtml(p.citation || "")}</li>`).join("");
      }
    } catch (e) {
      console.warn("Could not load publications data", e);
    }
  }

  // Grants and awards list (CV tab)
  async function loadGrants() {
    try {
      const inline = document.getElementById("grants-data");
      const data = inline ? JSON.parse(inline.textContent) : null;

      let payload = data;
      if (!payload) {
        const res = await fetch("data/grants_awards.json", { cache: "no-store" });
        payload = await res.json();
      }

      const list = document.getElementById("grants-list");
      if (list && Array.isArray(payload.grants_awards)) {
        list.innerHTML = payload.grants_awards
          .slice()
          .sort((a,b) => (b.year || 0) - (a.year || 0))
          .map(g => `<li><span class="year">${escapeHtml(g.year)}</span> ${escapeHtml(g.description || "")}</li>`)
          .join("");
      }
    } catch (e) {
      console.warn("Could not load grants data", e);
    }
  }

  // CV tabs

  const tabButtons = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  function activateTab(name) {
    tabButtons.forEach(b => {
      const active = b.getAttribute("data-tab") === name;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", active ? "true" : "false");
    });
    panels.forEach(p => {
      const active = p.getAttribute("data-panel") === name;
      p.classList.toggle("is-active", active);
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-tab");
      activateTab(name);
    });
  });

  // Kick off data loads
  loadPublications();
  loadGrants();
})();