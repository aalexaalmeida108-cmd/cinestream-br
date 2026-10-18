// language: JavaScript, file: public/app.js, target: Browser Client
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('catalogGrid');
    const modal = document.getElementById('playerModal');
    const video = document.getElementById('videoPlayer');
    const audioSelect = document.getElementById('audioSelect');
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
        heroSection.style.backgroundImage = `linear-gradient(to top, var(--bg-primary), transparent), url('${item.backdrop}')`;
        heroPlayBtn.onclick = () => openPlayer(item.id);
    }

    function renderGrid(items) {
        if (items.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1; text-align: center; padding: 40px;">Nenhum título encontrado.</p>';
            return;
        }

        grid.innerHTML = items.map(item => `
            <div class="card" data-id="${item.id}">
                <img src="${item.poster}" alt="${item.title}">
                <div class="card-info">
                    <div class="card-title">${item.title}</div>
                    <div class="card-meta">${item.year} • ★ ${item.rating} • PT-BR</div>
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

            audioSelect.innerHTML = currentItem.audioTracks.map(track => `
                <option value="${track.src}" ${track.lang === 'pt-BR' ? 'selected' : ''}>${track.label}</option>
            `).join('');

            video.src = audioSelect.value;
            modal.classList.add('active');
            video.play().catch(e => console.log('Autoplay prevented:', e));
        } catch (err) {
            console.error('Failed to load title details:', err);
        }
    }

    audioSelect.addEventListener('change', () => {
        const currentTime = video.currentTime;
        video.src = audioSelect.value;
        video.currentTime = currentTime;
        video.play().catch(e => console.log('Playback error:', e));
    });

    closeBtn.addEventListener('click', () => {
        video.pause();
        video.src = '';
        modal.classList.remove('active');
    });

    loadCatalog();
});
