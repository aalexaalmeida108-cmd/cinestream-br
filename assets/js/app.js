// CineStream - Aplicação principal (catálogo dinâmico via CatalogDB)
// Estado global
const AppState = {
    currentPage: 'home',
    currentContent: null,
    currentServer: 'vidsrc',
    currentSeason: 1,
    currentEpisode: 1,
    favorites: JSON.parse(localStorage.getItem('cs:favorites') || '[]'),
    settings: JSON.parse(localStorage.getItem('cs:settings') || JSON.stringify(USER_PREFS))
};

const SERVERS = ['vidsrc', 'multembed', 'vidsrc-to'];
const SERVER_LABELS = { 'vidsrc': 'VidSrc', 'multembed': 'MultiEmbed', 'vidsrc-to': 'VidSrc.to' };

// ============================================
// NAVEGAÇÃO
// ============================================

function navigateTo(page, contentData = null) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    const targetPage = document.getElementById(`${page}-page`);
    if (targetPage) targetPage.classList.add('active');

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) link.classList.add('active');
    });

    AppState.currentPage = page;
    window.scrollTo(0, 0);

    switch(page) {
        case 'home': loadHomePage(); break;
        case 'movies': loadMoviesPage(); break;
        case 'series': loadSeriesPage(); break;
        case 'calendar': loadCalendarPage(); break;
        case 'explore': loadExplorePage(); break;
        case 'favorites': loadFavoritesPage(); break;
        case 'player':
            if (contentData) loadPlayer(contentData);
            break;
    }
}

// ============================================
// HELPERS DE CATÁLOGO
// ============================================

function contentById(id, type) {
    return CatalogDB.items[`${type}:${id}`] || null;
}

function sortItems(items, sort) {
    const arr = [...items];
    if (sort === 'newest') arr.sort((a, b) => (b.year || 0) - (a.year || 0));
    else if (sort === 'rating') arr.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else arr.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    return arr;
}

function allGenres(type) {
    const counts = {};
    CatalogDB.all(type).forEach(i => i.genres.forEach(g => { counts[g] = (counts[g] || 0) + 1; }));
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
}

function dedupe(items) {
    const seen = new Set();
    return items.filter(i => {
        const k = `${i.type}:${i.id}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
    });
}

// ============================================
// RENDERIZAÇÃO DE CARDS
// ============================================

function createCard(item, type = null) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = item.id;
    card.dataset.type = type || item.type || 'movie';

    const posterUrl = item.poster || 'https://via.placeholder.com/342x513/1a1a1a/e50914?text=Sem+Imagem';
    const genres = (item.genres || []).slice(0, 2).join(' · ');
    const rating = typeof item.rating === 'number' ? item.rating : parseFloat(item.rating) || 0;

    card.innerHTML = `
        <img class="card-poster" src="${posterUrl}" alt="${item.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/342x513/1a1a1a/e50914?text=Erro'">
        <div class="card-info">
            <div class="card-title">${item.title}</div>
            <div class="card-sub">${genres}${item.year ? ' · ' + item.year : ''}</div>
            ${rating > 0 ? `<span class="card-rating">⭐ ${rating.toFixed(1)}</span>` : ''}
            <div class="card-overview">${item.overview || ''}</div>
        </div>
    `;

    card.addEventListener('click', () => {
        item.type = type || item.type || 'movie';
        AppState.currentContent = item;
        AppState.currentSeason = 1;
        AppState.currentEpisode = 1;
        navigateTo('player', item);
    });

    return card;
}

function fillGrid(el, items) {
    if (!el) return;
    el.innerHTML = '';
    if (!items.length) {
        el.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Nada por aqui ainda.</p>';
        return;
    }
    items.forEach(i => el.appendChild(createCard(i)));
}

// ============================================
// HOME PAGE
// ============================================

function loadHomePage() {
    const carousel = document.getElementById('featured-carousel');
    if (carousel) {
        carousel.innerHTML = '';
        let featured = dedupe([...CatalogDB.list('trending_movie_day'), ...CatalogDB.list('trending_tv_day')]);
        if (!featured.length) featured = CatalogDB.allItems().slice(0, 10);
        featured.slice(0, 10).forEach(item => {
            const card = createCard(item);
            card.style.minWidth = '180px';
            card.style.flex = '0 0 180px';
            carousel.appendChild(card);
        });
    }

    let movies = CatalogDB.list('movie_popular');
    if (!movies.length) movies = sortItems(CatalogDB.all('movie'), 'trending');
    fillGrid(document.getElementById('popular-movies'), movies.slice(0, 12));

    let series = CatalogDB.list('trending_tv_day');
    if (!series.length) series = CatalogDB.list('tv_popular');
    if (!series.length) series = sortItems(CatalogDB.all('tv'), 'trending');
    fillGrid(document.getElementById('popular-series'), series.slice(0, 12));
}

// ============================================
// MOVIES / SERIES PAGES
// ============================================

function fillGenreFilter(select, type) {
    if (!select) return;
    const current = select.value;
    const first = select.options[0]?.outerHTML || '<option value="">Todos os Gêneros</option>';
    select.innerHTML = first + allGenres(type)
        .map(g => `<option value="${g}">${g}</option>`).join('');
    select.value = current || '';
}

function loadMoviesPage() {
    const grid = document.getElementById('movies-grid');
    const genreFilter = document.getElementById('genre-filter');
    const sortFilter = document.getElementById('sort-filter');
    if (!grid) return;

    fillGenreFilter(genreFilter, 'movie');

    const genre = genreFilter?.value || '';
    const sort = sortFilter?.value || 'trending';

    let items = CatalogDB.all('movie');
    if (genre) items = items.filter(i => i.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
    items = sortItems(items, sort);

    fillGrid(grid, items);
}

function loadSeriesPage() {
    const grid = document.getElementById('series-grid');
    const genreFilter = document.getElementById('series-genre-filter');
    if (!grid) return;

    fillGenreFilter(genreFilter, 'tv');

    const genre = genreFilter?.value || '';
    let items = CatalogDB.all('tv');
    if (genre) items = items.filter(i => i.genres.some(g => g.toLowerCase() === genre.toLowerCase()));
    items = sortItems(items, 'trending');

    fillGrid(grid, items);
}

// ============================================
// CALENDAR PAGE (Lançamentos)
// ============================================

function loadCalendarPage() {
    let page = document.getElementById('calendar-page');
    if (!page) {
        page = document.createElement('section');
        page.id = 'calendar-page';
        page.className = 'page active';
        page.innerHTML = `
            <div class="page-header"><h1>Lançamentos</h1></div>
            <div class="section">
                <h2>Filmes — Em Breve nos Cinemas</h2>
                <div class="cards-grid" id="calendar-movies"></div>
            </div>
            <div class="section" style="margin-top:2rem;">
                <h2>Séries — Em Exibição</h2>
                <div class="cards-grid" id="calendar-series"></div>
            </div>
        `;
        document.querySelector('.main-content').appendChild(page);
    }

    let upcoming = CatalogDB.list('movie_upcoming');
    if (!upcoming.length) upcoming = sortItems(CatalogDB.all('movie').filter(m => m.year >= new Date().getFullYear()), 'newest');
    fillGrid(document.getElementById('calendar-movies'), upcoming.slice(0, 24));

    let onAir = CatalogDB.list('tv_on_the_air');
    if (!onAir.length) onAir = CatalogDB.list('tv_airing_today');
    fillGrid(document.getElementById('calendar-series'), onAir.slice(0, 24));
}

// ============================================
// EXPLORE PAGE (Por Provedor + Por Gênero)
// ============================================

function loadExplorePage() {
    let page = document.getElementById('explore-page');
    if (!page) {
        page = document.createElement('section');
        page.id = 'explore-page';
        page.className = 'page active';
        page.innerHTML = `
            <div class="page-header"><h1>Explorar</h1></div>
            <div class="section">
                <h2>Por Provedor</h2>
                <div class="filter-group" style="margin-bottom:1rem; flex-wrap:wrap;">
                    ${Object.entries(PROVIDERS).map(([key, name]) =>
                        `<button class="btn btn-secondary provider-btn" data-provider="${key}">${name}</button>`
                    ).join('')}
                </div>
            </div>
            <div class="section">
                <h2>Por Gênero</h2>
                <div class="filter-group" style="margin-bottom:1rem; flex-wrap:wrap;">
                    ${allGenres('movie').slice(0, 16).map(g =>
                        `<button class="btn btn-secondary genre-btn" data-genre="${g}">${g}</button>`
                    ).join('')}
                </div>
            </div>
            <div class="section">
                <h2 id="explore-label">Tendências</h2>
                <div class="cards-grid" id="explore-grid"></div>
            </div>
        `;
        document.querySelector('.main-content').appendChild(page);

        page.querySelectorAll('.provider-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const prov = btn.dataset.provider;
                const label = PROVIDERS[prov];
                document.getElementById('explore-label').textContent = `${label} — Populares`;
                const items = dedupe([
                    ...CatalogDB.provider(prov, 'movie'),
                    ...CatalogDB.provider(prov, 'tv')
                ]);
                fillGrid(document.getElementById('explore-grid'), items.length ? items : CatalogDB.allItems().slice(0, 60));
            });
        });

        page.querySelectorAll('.genre-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const genre = btn.dataset.genre;
                document.getElementById('explore-label').textContent = `Gênero: ${genre}`;
                const items = dedupe([
                    ...CatalogDB.byGenre(genre, 'movie'),
                    ...CatalogDB.byGenre(genre, 'tv')
                ]);
                fillGrid(document.getElementById('explore-grid'), items);
            });
        });
    }

    const grid = document.getElementById('explore-grid');
    if (grid && grid.children.length === 0) {
        let trending = dedupe([
            ...CatalogDB.list('trending_movie_day'),
            ...CatalogDB.list('trending_tv_day')
        ]);
        if (!trending.length) trending = CatalogDB.allItems().slice(0, 60);
        fillGrid(grid, trending.slice(0, 60));
    }
}

// ============================================
// FAVORITES PAGE
// ============================================

function loadFavoritesPage() {
    let page = document.getElementById('favorites-page');
    if (!page) {
        page = document.createElement('section');
        page.id = 'favorites-page';
        page.className = 'page active';
        page.innerHTML = `
            <div class="page-header"><h1>Meus Favoritos</h1></div>
            <div class="cards-grid" id="favorites-grid"></div>
        `;
        document.querySelector('.main-content').appendChild(page);
    }

    const grid = document.getElementById('favorites-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (AppState.favorites.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Nenhum favorito ainda. Abra um filme ou série e clique em ⭐ Adicionar aos Favoritos.</p>';
        return;
    }

    AppState.favorites.forEach(fav => {
        const item = contentById(fav.id, fav.type) || {
            id: fav.id, type: fav.type, title: fav.title, poster: fav.poster || null,
            year: fav.year || 0, rating: fav.rating || 0, genres: fav.genres || [], overview: ''
        };
        grid.appendChild(createCard(item));
    });
}

// ============================================
// PLAYER
// ============================================

function loadPlayer(content) {
    const iframe = document.getElementById('player-iframe');
    const info = document.getElementById('player-info');
    const type = content.type || 'movie';

    const streamUrl = embedUrl(content, AppState.currentServer, AppState.currentSeason, AppState.currentEpisode);
    if (iframe) iframe.src = streamUrl || 'about:blank';

    if (info) {
        const seasonOptions = Array.from({ length: 20 }, (_, i) => i + 1).map(n =>
            `<option value="${n}" ${n === AppState.currentSeason ? 'selected' : ''}>Temporada ${n}</option>`).join('');
        const episodeOptions = Array.from({ length: 40 }, (_, i) => i + 1).map(n =>
            `<option value="${n}" ${n === AppState.currentEpisode ? 'selected' : ''}>Episódio ${n}</option>`).join('');

        info.innerHTML = `
            <div class="player-info-header">
                <h2>${content.title} ${content.year ? `(${content.year})` : ''}</h2>
                <div class="player-info-meta">
                    ${content.rating ? `<span>⭐ ${(typeof content.rating === 'number' ? content.rating : parseFloat(content.rating) || 0).toFixed(1)}</span>` : ''}
                    ${(content.genres || []).length ? `<span>${content.genres.join(' · ')}</span>` : ''}
                    <span>${type === 'tv' ? 'Série' : 'Filme'}</span>
                    <span style="color: #f5b800;">🔊 Dublagem PT-BR Disponível</span>
                </div>
            </div>

            <p class="player-info-overview">${content.overview || ''}</p>

            <div class="player-controls">
                <div class="control-group">
                    <label>Servidor:</label>
                    <select id="server-select" class="filter-select">
                        ${SERVERS.map(s => `<option value="${s}" ${s === AppState.currentServer ? 'selected' : ''}>${SERVER_LABELS[s]}</option>`).join('')}
                    </select>
                </div>

                ${type === 'tv' ? `
                <div class="control-group">
                    <label>Temporada:</label>
                    <select id="season-select" class="filter-select">${seasonOptions}</select>
                </div>
                <div class="control-group">
                    <label>Episódio:</label>
                    <select id="episode-select" class="filter-select">${episodeOptions}</select>
                </div>
                ` : ''}

                <div class="control-group">
                    <button class="btn btn-secondary" id="favorite-btn">
                        ${AppState.favorites.some(f => f.id === content.id && f.type === type) ? '⭐ Remover dos Favoritos' : '☆ Adicionar aos Favoritos'}
                    </button>
                </div>
            </div>

            <div class="dubbing-notice">
                <p>💡 <strong>Dica:</strong> Para assistir com dublagem em Português Brasil, selecione a faixa de áudio <strong>Português (BR)</strong> no controle do player. A maioria dos servidores oferece múltiplas faixas.</p>
            </div>
        `;

        document.getElementById('server-select')?.addEventListener('change', (e) => {
            AppState.currentServer = e.target.value;
            loadPlayer(content);
        });

        document.getElementById('season-select')?.addEventListener('change', (e) => {
            AppState.currentSeason = parseInt(e.target.value);
            loadPlayer(content);
        });

        document.getElementById('episode-select')?.addEventListener('change', (e) => {
            AppState.currentEpisode = parseInt(e.target.value);
            loadPlayer(content);
        });

        document.getElementById('favorite-btn')?.addEventListener('click', () => {
            toggleFavorite(content, type);
        });
    }
}

// ============================================
// FAVORITES
// ============================================

function toggleFavorite(content, type) {
    const index = AppState.favorites.findIndex(f => f.id === content.id && f.type === type);

    if (index >= 0) {
        AppState.favorites.splice(index, 1);
    } else {
        AppState.favorites.push({
            id: content.id, type: type, title: content.title,
            poster: content.poster || null, year: content.year || 0,
            rating: content.rating || 0, genres: content.genres || []
        });
    }

    localStorage.setItem('cs:favorites', JSON.stringify(AppState.favorites));
    loadPlayer(content);
}

// ============================================
// SEARCH
// ============================================

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const query = e.target.value.trim();

            if (query.length < 2) {
                if (AppState.currentPage === 'movies') loadMoviesPage();
                else if (AppState.currentPage === 'series') loadSeriesPage();
                return;
            }

            const results = CatalogDB.search(query);

            if (AppState.currentPage !== 'movies' && AppState.currentPage !== 'series') {
                navigateTo('movies');
            }

            const grid = document.getElementById('movies-grid') || document.getElementById('series-grid');
            fillGrid(grid, results);
        }, 250);
    });
}

// ============================================
// SETTINGS
// ============================================

function setupSettings() {
    const modal = document.getElementById('settings-modal');
    const settingsBtn = document.getElementById('settings-btn');
    const closeBtn = document.querySelector('.modal-close');

    if (settingsBtn) settingsBtn.addEventListener('click', () => modal.classList.add('active'));
    if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

    const dubbingCheck = document.getElementById('setting-dubbing');
    const subtitlesCheck = document.getElementById('setting-subtitles');
    const hdCheck = document.getElementById('setting-hd');
    const themeSelect = document.getElementById('setting-theme');

    if (dubbingCheck) {
        dubbingCheck.checked = AppState.settings.dubbing;
        dubbingCheck.addEventListener('change', (e) => { AppState.settings.dubbing = e.target.checked; saveSettings(); });
    }
    if (subtitlesCheck) {
        subtitlesCheck.checked = AppState.settings.subtitles;
        subtitlesCheck.addEventListener('change', (e) => { AppState.settings.subtitles = e.target.checked; saveSettings(); });
    }
    if (hdCheck) {
        hdCheck.checked = AppState.settings.hd;
        hdCheck.addEventListener('change', (e) => { AppState.settings.hd = e.target.checked; saveSettings(); });
    }
    if (themeSelect) {
        themeSelect.value = AppState.settings.theme;
        themeSelect.addEventListener('change', (e) => { AppState.settings.theme = e.target.value; saveSettings(); applyTheme(); });
    }

    applyTheme();
}

function saveSettings() {
    localStorage.setItem('cs:settings', JSON.stringify(AppState.settings));
}

function applyTheme() {
    document.body.classList.toggle('light-mode', AppState.settings.theme === 'light');
}

// ============================================
// FILTERS
// ============================================

function setupFilters() {
    const genreFilter = document.getElementById('genre-filter');
    const sortFilter = document.getElementById('sort-filter');
    const seriesGenreFilter = document.getElementById('series-genre-filter');

    if (genreFilter) genreFilter.addEventListener('change', loadMoviesPage);
    if (sortFilter) sortFilter.addEventListener('change', loadMoviesPage);
    if (seriesGenreFilter) seriesGenreFilter.addEventListener('change', loadSeriesPage);
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.dataset.page);
        });
    });

    setupSearch();
    setupSettings();
    setupFilters();

    // Carregar catálogo (dinâmico com fallback para seed)
    await CatalogDB.load();
    console.log(`[app] catálogo: ${CatalogDB.source}, ${Object.keys(CatalogDB.items).length} itens`);

    const statusEl = document.getElementById('catalog-status');
    if (statusEl) {
        statusEl.textContent = CatalogDB.source === 'live'
            ? `${Object.keys(CatalogDB.items).length} títulos no catálogo`
            : 'modo offline (catálogo local)';
    }

    loadHomePage();

    const visits = parseInt(localStorage.getItem('bb:visits') || '0') + 1;
    localStorage.setItem('bb:visits', visits);
});
