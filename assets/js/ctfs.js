document.addEventListener('DOMContentLoaded', () => {
    // The writeupCatalog array is loaded securely from data.js
    const ITEMS_PER_PAGE = 48; // 3 columns x 16 rows

    let currentPlatform = 'all';
    let currentQuery = '';
    let currentPage = 1;

    const gridElement = document.getElementById('ctfTabbedGrid');
    const searchInput = document.getElementById('ctfTitleSearch');
    const clearBtn = document.getElementById('ctfClearSearch');
    const tabButtons = document.querySelectorAll('.plat-tab-btn');
    const countBadge = document.getElementById('ctfCountBadge');
    const rangeHint = document.getElementById('rangeHint');
    const paginationElement = document.getElementById('ctfTabbedPagination');
    const emptyState = document.getElementById('ctfEmptyState');
    const gridContainer = document.querySelector('.ctf-grid-container');

    const rangeDescriptions = {
        'all': 'All CTFs',
        'HackTheBox': 'HackTheBox CTFs',
        'TryHackMe': 'TryHackMe CTFs',
        'OffSec': 'OffSec CTFs'
    };

    function updateTabCounts() {
        // Tally all platforms in a single pass
        const counts = writeupCatalog.reduce((acc, item) => {
            acc.all++;
            if (acc[item.platform] !== undefined) {
                acc[item.platform]++;
            }
            return acc;
        }, { 'all': 0, 'HackTheBox': 0, 'TryHackMe': 0, 'OffSec': 0 });

        // Inject the counts into the DOM while preserving the Bootstrap icons
        tabButtons.forEach(btn => {
            const platform = btn.getAttribute('data-platform');
            const iconHTML = btn.querySelector('i').outerHTML;
            const label = platform === 'all' ? 'All Targets' : platform;
            
            btn.innerHTML = `${iconHTML} ${label} (${counts[platform]})`;
        });
    }

    function filterCatalog() {
        const q = currentQuery.trim().toLowerCase();
        return writeupCatalog.filter(item => {
            const matchPlatform = (currentPlatform === 'all') || (item.platform === currentPlatform);
            const matchQuery = (q === '') || item.name.toLowerCase().includes(q);
            return matchPlatform && matchQuery;
        });
    }

    function renderGrid() {
        const filtered = filterCatalog();
        const total = filtered.length;
        const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;

        if (currentPage > totalPages) currentPage = 1;

        if (total === 0) {
            gridContainer.style.display = 'none';
            paginationElement.style.display = 'none';
            countBadge.textContent = 'Showing 0 targets';
            emptyState.style.display = 'block';
            return;
        } else {
            gridContainer.style.display = 'block';
            paginationElement.style.display = 'flex';
            emptyState.style.display = 'none';
        }

        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = Math.min(start + ITEMS_PER_PAGE, total);
        const visibleSlice = filtered.slice(start, end);

        countBadge.textContent = `Showing ${start + 1}-${end} of ${total} targets`;

        gridElement.innerHTML = visibleSlice.map((item, idx) => {
            let badgeClass = 'htb';
            let badgeText = 'HTB';
            if (item.platform === 'TryHackMe') {
                badgeClass = 'thm';
                badgeText = 'THM';
            } else if (item.platform === 'OffSec') {
                badgeClass = 'offsec';
                badgeText = 'OffSec';
            }

            return `
            <li class="ctf-grid-item">
              <span class="ctf-item-index">${String(start + idx + 1).padStart(2, '0')}</span>
              <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.name}</a>
              <span class="platform-badge ${badgeClass}">${badgeText}</span>
            </li>
          `;
        }).join('');

        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        if (totalPages <= 1) {
            paginationElement.innerHTML = '';
            return;
        }

        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        paginationElement.innerHTML = html;

        paginationElement.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentPage = parseInt(btn.getAttribute('data-page'));
                renderGrid();
                gridContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            });
        });
    }

    // Tab switcher
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentPlatform = btn.getAttribute('data-platform');
            rangeHint.textContent = rangeDescriptions[currentPlatform] || 'Network Range: Custom';
            currentPage = 1;
            renderGrid();
        });
    });

    // Instant title search
    searchInput.addEventListener('input', (e) => {
        currentQuery = e.target.value;
        clearBtn.style.display = currentQuery.length > 0 ? 'block' : 'none';
        currentPage = 1;
        renderGrid();
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        currentQuery = '';
        clearBtn.style.display = 'none';
        currentPage = 1;
        renderGrid();
        searchInput.focus();
    });

    // Initial render
    updateTabCounts();
    renderGrid();
});