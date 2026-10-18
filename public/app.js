// language: JavaScript, file: public/app.js, target: Browser Client
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('catalogGrid');
    const modal = document.getElementById('playerModal');
    const videoFrame = document.getElementById('videoPlayerFrame');
    const playerTitle = document.getElementById('playerTitle');
    const serverSelect = document.getElementById('serverSelect');
    const seasonEpisodeContainer = document.getElementById('seasonEpisodeContainer');
    const seasonSelect = document.getElementById('seasonSelect');
    const episodeSelect = document.getElementById('episodeSelect');
    const closeBtn = document.getElementById('closeModal');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('searchInput');
    const heroSection = document.getElementById('heroSection');
    const heroTitle = document.getElementById('heroTitle');
    const heroOverview = document.getElementById('heroOverview');
    const heroPlayBtn = document.getElementById('heroPlayBtn');

    let allItems = [];
    let currentItem = null;
    let featuredItem = null;

    async function loadCatalog() {
        try {
            const res = await fetch('/api/catalog');
            allItems = await res.json();
            if (allItems.length > 0) {
                featuredItem = allItems[0];
                setupHero(featuredItem);
            }
            renderGrid(allItems);
        } catch (err) {
            console.error('Failed to load catalog:', err);
        }
    }

    function setupHero(item) {
        heroTitle.textContent = item.title;
        heroOverview.textContent = item.overview;
        if (item.backdrop) {
            heroSection.style.backgroundImage = `linear-gradient(0deg, #000000 0%, rgba(0,0,0,0.6) 50%, transparent 100%), url('${item.backdrop}')`;
        }
        heroPlayBtn.onclick = () => openPlayer(item.id);
    }

    function renderGrid(items) {
        if (items.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 40px;">Nenhum título encontrado.</p>';
            return;
        }

        grid.innerHTML = items.map(item => `
            <div class="card" data-id="${item.id}">
                <img src="${item.poster}" alt="${item.title}" loading="lazy">
                <div class="card-info">
                    <div class="card-title">${item.title}</div>
                    <div class="card-meta"><span>${item.year}</span><span>★ ${item.rating}</span></div>
                </div>
            </div>
        `).join('');

        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.getAttribute('data-id');
                openPlayer(id);
            });
        });
    }

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            applyFilters(filter, searchInput.value);
        });
    });

    searchInput.addEventListener('input', (e) => {
        const activeBtn = document.querySelector('.filter-btn.active');
        const filter = activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
        applyFilters(filter, e.target.value);
    });

    function applyFilters(filter, query) {
        let filtered = allItems;
        if (filter !== 'all') {
            filtered = filtered.filter(i => i.type === filter);
        }
        if (query.trim() !== '') {
            const q = query.toLowerCase();
            filtered = filtered.filter(i => i.title.toLowerCase().includes(q) || i.overview.toLowerCase().includes(q));
        }
        renderGrid(filtered);
    }

    async function openPlayer(id) {
        try {
            const res = await fetch(`/api/title/${id}`);
            currentItem = await res.json();

            playerTitle.textContent = `Reproduzindo: ${currentItem.title}`;

            if (currentItem.type === 'series') {
                seasonEpisodeContainer.style.display = 'flex';
                seasonSelect.value = "1";
                episodeSelect.value = "1";
            } else {
                seasonEpisodeContainer.style.display = 'none';
            }

            updatePlayerUrl();

            serverSelect.innerHTML = currentItem.servers.map((srv, index) => `
                <option value="${index}">${srv.name}</option>
            `).join('');

            modal.classList.add('active');
        } catch (err) {
            console.error('Failed to load title details:', err);
        }
    }

    function updatePlayerUrl() {
        if (!currentItem) return;
        const serverIndex = parseInt(serverSelect.value || 0, 10);
        const server = currentItem.servers[serverIndex];
        if (!server) return;

        let url = server.url;
        if (currentItem.type === 'series') {
            const season = seasonSelect.value;
            const episode = episodeSelect.value;

            if (server.name.includes('VidSrc XYZ')) {
                url = `https://vidsrc.xyz/embed/tv?tmdb=${currentItem.tmdbId}&season=${season}&episode=${episode}`;
            } else if (server.name.includes('MultEmbed')) {
                url = `https://multembed.mov/?video_id=${currentItem.tmdbId}&tmdb=1&s=${season}&e=${episode}`;
            } else if (server.name.includes('VidSrc TO')) {
                url = `https://vidsrc.to/embed/tv/${currentItem.tmdbId}/${season}/${episode}`;
            }
        }
        videoFrame.src = url;
    }

    serverSelect.addEventListener('change', updatePlayerUrl);
    seasonSelect.addEventListener('change', updatePlayerUrl);
    episodeSelect.addEventListener('change', updatePlayerUrl);

    closeBtn.addEventListener('click', () => {
        videoFrame.src = '';
        modal.classList.remove('active');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            videoFrame.src = '';
            modal.classList.remove('active');
        }
    });

    loadCatalog();
});
