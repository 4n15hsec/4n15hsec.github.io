// Tag classification helper for semantic UI styling
function getTagClass(tag) {
  const lower = tag.toLowerCase();
  if (
    lower.startsWith('cve-') ||
    lower.includes('rce') ||
    lower.includes('injection') ||
    lower.includes('exploit') ||
    lower.includes('shellshock') ||
    lower.includes('heartbleed') ||
    lower.includes('eternalblue')
  ) {
    return 'tag-cve';
  }
  if (
    lower.includes('active directory') ||
    lower.includes('kerberos') ||
    lower.includes('domain') ||
    lower.includes('bloodhound') ||
    lower.includes('dcsync') ||
    lower.includes('as-rep') ||
    lower.includes('kerberoast')
  ) {
    return 'tag-ad';
  }
  if (lower === 'linux' || lower === 'windows' || lower === 'freebsd') {
    return 'tag-os';
  }
  if (
    lower.includes('web') ||
    lower.includes('sqli') ||
    lower.includes('lfi') ||
    lower.includes('rfi') ||
    lower.includes('recon') ||
    lower.includes('wordpress') ||
    lower.includes('fuzzing') ||
    lower.includes('ssrf') ||
    lower.includes('upload') ||
    lower.includes('cms')
  ) {
    return 'tag-web';
  }
  if (
    lower.includes('privesc') ||
    lower.includes('sudo') ||
    lower.includes('suid') ||
    lower.includes('cron') ||
    lower.includes('abuse') ||
    lower.includes('capabilities') ||
    lower.includes('seimpersonate')
  ) {
    return 'tag-privesc';
  }
  return 'tag-default';
}

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("ctfTabbedGrid");
  const searchInput = document.getElementById("ctfTitleSearch");
  const countBadge = document.getElementById("ctfCountBadge");
  const emptyState = document.getElementById("ctfEmptyState");
  const paginationContainer = document.getElementById("ctfTabbedPagination");
  const tabs = document.querySelectorAll(".plat-tab-btn");
  const clearBtn = document.getElementById("ctfClearSearch");
  const toggleAllBtn = document.getElementById("toggleAllSpoilersBtn");

  let currentPlatform = "all";
  let searchQuery = "";
  let currentPage = 1;
  const itemsPerPage = 48;
  let allSpoilersVisible = false;

  function render() {
    // 1. Filter by Platform, Title, AND Tags
    const filtered = writeupCatalog.filter(ctf => {
      const matchPlat = currentPlatform === "all" || ctf.platform === currentPlatform;
      const query = searchQuery.toLowerCase();

      const matchName = ctf.name.toLowerCase().includes(query);
      const matchTags = ctf.tags && ctf.tags.some(tag => tag.toLowerCase().includes(query));

      return matchPlat && (matchName || matchTags);
    });

    // 2. Pagination Logic
    const total = filtered.length;
    const totalPages = Math.ceil(total / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginated = filtered.slice(start, end);

    // 3. Update Status and Empty States
    if (total === 0) {
      grid.innerHTML = "";
      emptyState.style.display = "block";
      countBadge.textContent = `Showing 0 targets`;
      paginationContainer.innerHTML = "";
      return;
    }

    emptyState.style.display = "none";
    countBadge.textContent = `Showing ${start + 1}-${Math.min(end, total)} of ${total} targets`;

    // 4. Render Grid Cards
    grid.innerHTML = paginated.map(ctf => {
      const absoluteIndex = writeupCatalog.indexOf(ctf) + 1;

      let pClass = "htb";
      if (ctf.platform === "TryHackMe") pClass = "thm";
      if (ctf.platform === "OffSec") pClass = "offsec";

      // Tag Clamping: Show top 4, rest tucked behind inline expander
      const maxVisibleTags = 4;
      const allTags = ctf.tags || [];
      let tagsHtml = "";

      if (allTags.length === 0) {
        tagsHtml = '<span class="ctf-tag tag-default" style="opacity: 0.5;">No tags assigned yet</span>';
      } else if (allTags.length <= maxVisibleTags) {
        tagsHtml = allTags.map(tag => `<span class="ctf-tag ${getTagClass(tag)}" title="Filter by: ${tag}">${tag}</span>`).join("");
      } else {
        const visibleTags = allTags.slice(0, maxVisibleTags);
        const hiddenTags = allTags.slice(maxVisibleTags);

        tagsHtml = visibleTags.map(tag => `<span class="ctf-tag ${getTagClass(tag)}" title="Filter by: ${tag}">${tag}</span>`).join("") +
          `<span class="ctf-hidden-wrapper" style="display: none;">` +
            hiddenTags.map(tag => `<span class="ctf-tag ${getTagClass(tag)}" title="Filter by: ${tag}">${tag}</span>`).join("") +
          `</span>` +
          `<span class="ctf-tag-more">+${hiddenTags.length} more</span>`;
      }

      const isDisplayed = allSpoilersVisible;
      const spoilerBtnLabel = isDisplayed
        ? '<i class="bi bi-eye-slash"></i> Tags'
        : '<i class="bi bi-eye"></i> Tags';
      const spoilerActiveClass = isDisplayed ? 'active' : '';
      const tagsDisplayStyle = isDisplayed ? 'display: flex;' : 'display: none;';

      return `
        <li class="ctf-card-item">
          <div class="ctf-card-header">
            <a href="${ctf.url}" target="_blank" rel="noopener noreferrer" class="ctf-card-title">
              <span class="ctf-card-index">${absoluteIndex}.</span> ${ctf.name}
            </a>
            <div class="ctf-header-actions">
              <button type="button" class="ctf-spoiler-btn ${spoilerActiveClass}">
                ${spoilerBtnLabel}
              </button>
              <span class="platform-badge ${pClass}">${ctf.platform}</span>
            </div>
          </div>
          <div class="ctf-tags" style="${tagsDisplayStyle}">
            ${tagsHtml}
          </div>
        </li>
      `;
    }).join("");

    // 5. Render Pagination Controls
    let pageHtml = "";
    for (let i = 1; i <= totalPages; i++) {
      pageHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    paginationContainer.innerHTML = pageHtml;

    document.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        currentPage = parseInt(e.target.getAttribute('data-page'));
        render();
        document.getElementById('ctf').scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  // Unified Event Delegation on Grid Container
  grid.addEventListener("click", (e) => {
    // 1. Toggle Individual Card Tags via Header Button
    const spoilerBtn = e.target.closest(".ctf-spoiler-btn");
    if (spoilerBtn) {
      const card = spoilerBtn.closest(".ctf-card-item");
      const tags = card.querySelector(".ctf-tags");
      if (tags) {
        const isHidden = tags.style.display === "none";
        tags.style.display = isHidden ? "flex" : "none";
        spoilerBtn.classList.toggle("active", isHidden);
        spoilerBtn.innerHTML = isHidden
          ? '<i class="bi bi-eye-slash"></i> Tags'
          : '<i class="bi bi-eye"></i> Tags';
      }
      return;
    }

    // 2. Expand Clamped "+X more" Tags
    const moreBtn = e.target.closest(".ctf-tag-more");
    if (moreBtn) {
      const hiddenWrapper = moreBtn.previousElementSibling;
      if (hiddenWrapper) {
        hiddenWrapper.style.display = "contents";
      }
      moreBtn.remove();
      return;
    }

    // 3. Click Tag to Search
    const tagEl = e.target.closest(".ctf-tag");
    if (tagEl && !tagEl.classList.contains("ctf-tag-more")) {
      const tagText = tagEl.textContent.trim();
      searchInput.value = tagText;
      searchQuery = tagText;
      currentPage = 1;
      clearBtn.style.display = "block";
      render();
      document.getElementById('ctf').scrollIntoView({ behavior: 'smooth' });
    }
  });

  // Global Spoiler Toggle Button
  if (toggleAllBtn) {
    toggleAllBtn.addEventListener("click", () => {
      allSpoilersVisible = !allSpoilersVisible;
      document.querySelectorAll(".ctf-card-item").forEach(card => {
        const btn = card.querySelector(".ctf-spoiler-btn");
        const tags = card.querySelector(".ctf-tags");
        if (tags && btn) {
          tags.style.display = allSpoilersVisible ? "flex" : "none";
          btn.classList.toggle("active", allSpoilersVisible);
          btn.innerHTML = allSpoilersVisible
            ? '<i class="bi bi-eye-slash"></i> Tags'
            : '<i class="bi bi-eye"></i> Tags';
        }
      });
      toggleAllBtn.innerHTML = allSpoilersVisible
        ? '<i class="bi bi-eye-slash"></i> Hide All Tags'
        : '<i class="bi bi-eye"></i> Show All Tags';
    });
  }

  // Live Search Events
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    currentPage = 1;
    clearBtn.style.display = searchQuery.length > 0 ? "block" : "none";
    render();
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    searchQuery = "";
    currentPage = 1;
    clearBtn.style.display = "none";
    render();
  });

  // Platform Filter Tabs
  tabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
      tabs.forEach(t => t.classList.remove("active"));
      const target = e.currentTarget;
      target.classList.add("active");

      currentPlatform = target.getAttribute("data-platform");
      currentPage = 1;
      render();
    });
  });

  // Initial Load
  render();
});