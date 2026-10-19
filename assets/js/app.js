// CineStream - Aplicação principal
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

// ============================================
// NAVEGAÇÃO
// ============================================

function navigateTo(page, contentData = null) {
    // Esconder todas as páginas
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Mostrar a página alvo
    const targetPage = document.getElementById(`${page}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Atualizar nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });
    
    AppState.currentPage = page;
    window.scrollTo(0, 0);
    
    // Carregar conteúdo específico da página
    switch(page) {
        case 'home':
            loadHomePage();
            break;
        case 'movies':
            loadMoviesPage();
            break;
        case 'series':
            loadSeriesPage();
            break;
        case 'calendar':
            loadCalendarPage();
            break;
        case 'explore':
            loadExplorePage();
            break;
        case 'favorites':
            loadFavoritesPage();
            break;
        case 'player':
            if (contentData) {
                loadPlayer(contentData);
            }
            break;
    }
}

// ============================================
// RENDERIZAÇÃO DE CARDS
// ============================================

function createCard(item, type = 'movie') {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = item.id;
    card.dataset.type = type;
    
    const posterUrl = item.poster || 'https://via.placeholder.com/342x513/1a1a1a/e50914?text=Sem+Imagem';
    
    card.innerHTML = `
        <img class="card-poster" src="${posterUrl}" alt="${item.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/342x513/1a1a1a/e50914?text=Erro'">
        <div class="card-info">
            <div class="card-title">${item.title}</div>
            <div class="card-sub">${item.genres.slice(0, 2).join(' · ')} · ${item.year}</div>
            <span class="card-rating">⭐ ${item.rating.toFixed(1)}</span>
            <div class="card-overview">${item.overview}</div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        AppState.currentContent = item;
        AppState.currentContent._type = type;
        navigateTo('player', item);
    });
    
    return card;
}

// ============================================
// HOME PAGE
// ============================================

function loadHomePage() {
    // Carregar carrossel em destaque
    const carousel = document.getElementById('featured-carousel');
    if (carousel) {
        carousel.innerHTML = '';
        const featured = getFeatured();
        featured.forEach(item => {
            const card = createCard(item, item.seasons ? 'tv' : 'movie');
            card.style.minWidth = '180px';
            card.style.flex = '0 0 180px';
            carousel.appendChild(card);
        });
    }
    
    // Filmes populares
    const popularMovies = document.getElementById('popular-movies');
    if (popularMovies) {
        popularMovies.innerHTML = '';
        const movies = getMovies(1, '', 'rating').results.slice(0, 8);
        movies.forEach(m => popularMovies.appendChild(createCard(m, 'movie')));
    }
    
    // Séries em alta
    const popularSeries = document.getElementById('popular-series');
    if (popularSeries) {
        popularSeries.innerHTML = '';
        const series = getSeries(1, '', 'rating').results.slice(0, 8);
        series.forEach(s => popularSeries.appendChild(createCard(s, 'tv')));
    }
}

// ============================================
// MOVIES PAGE
// ============================================

function loadMoviesPage(genre = '', sort = 'trending') {
    const grid = document.getElementById('movies-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    const data = getMovies(1, genre, sort);
    
    if (data.results.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Nenhum filme encontrado.</p>';
        return;
    }
    
    data.results.forEach(m => grid.appendChild(createCard(m, 'movie')));
}

// ============================================
// SERIES PAGE
// ============================================

function loadSeriesPage(genre = '', sort = 'trending') {
    const grid = document.getElementById('series-grid');
    if (!grid) return;
    
    grid.innerHTML = '';
    const data = getSeries(1, genre, sort);
    
    if (data.results.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Nenhuma série encontrada.</p>';
        return;
    }
    
    data.results.forEach(s => grid.appendChild(createCard(s, 'tv')));
}

// ============================================
// CALENDAR PAGE (Lançamentos)
// ============================================

function loadCalendarPage() {
    const content = document.querySelector('.main-content');
    const page = document.getElementById('calendar-page');
    
    if (!page) {
        // Criar página dinamicamente se não existir
        const newPage = document.createElement('section');
        newPage.id = 'calendar-page';
        newPage.className = 'page active';
        newPage.innerHTML = `
            <div class="page-header">
                <h1>Próximos Lançamentos</h1>
            </div>
            <div class="cards-grid" id="calendar-grid"></div>
        `;
        document.querySelector('.main-content').appendChild(newPage);
    }
    
    const grid = document.getElementById('calendar-grid');
    if (grid) {
        grid.innerHTML = '';
        const all = [...CONTENT_DATABASE.movies, ...CONTENT_DATABASE.series]
            .sort((a, b) => b.year - a.year)
            .slice(0, 12);
        all.forEach(item => grid.appendChild(createCard(item, item.seasons ? 'tv' : 'movie')));
    }
}

// ============================================
// EXPLORE PAGE
// ============================================

function loadExplorePage() {
    const page = document.getElementById('explore-page');
    
    if (!page) {
        const newPage = document.createElement('section');
        newPage.id = 'explore-page';
        newPage.className = 'page active';
        newPage.innerHTML = `
            <div class="page-header">
                <h1>Explorar por Gênero</h1>
            </div>
            <div class="filter-group" style="margin-bottom: 2rem; flex-wrap: wrap;">
                ${Object.entries(GENRES).map(([key, name]) => 
                    `<button class="btn btn-secondary genre-btn" data-genre="${name}">${name}</button>`
                ).join('')}
            </div>
            <div class="cards-grid" id="explore-grid"></div>
        `;
        document.querySelector('.main-content').appendChild(newPage);
        
        // Adicionar event listeners aos botões de gênero
        newPage.querySelectorAll('.genre-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const genreName = btn.dataset.genre;
                const grid = document.getElementById('explore-grid');
                grid.innerHTML = '';
                const movies = CONTENT_DATABASE.movies.filter(m => m.genres.some(g => g.toLowerCase().includes(genreName.toLowerCase())));
                const series = CONTENT_DATABASE.series.filter(s => s.genres.some(g => g.toLowerCase().includes(genreName.toLowerCase())));
                [...movies, ...series].forEach(item => grid.appendChild(createCard(item, item.seasons ? 'tv' : 'movie')));
            });
        });
    }
    
    // Mostrar todos por padrão
    const grid = document.getElementById('explore-grid');
    if (grid && grid.children.length === 0) {
        [...CONTENT_DATABASE.movies, ...CONTENT_DATABASE.series].forEach(item => 
            grid.appendChild(createCard(item, item.seasons ? 'tv' : 'movie'))
        );
    }
}

// ============================================
// FAVORITES PAGE
// ============================================

function loadFavoritesPage() {
    const page = document.getElementById('favorites-page');
    
    if (!page) {
        const newPage = document.createElement('section');
        newPage.id = 'favorites-page';
        newPage.className = 'page active';
        newPage.innerHTML = `
            <div class="page-header">
                <h1>Meus Favoritos</h1>
            </div>
            <div class="cards-grid" id="favorites-grid"></div>
        `;
        document.querySelector('.main-content').appendChild(newPage);
    }
    
    const grid = document.getElementById('favorites-grid');
    if (grid) {
        grid.innerHTML = '';
        if (AppState.favorites.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Nenhum favorito ainda. Clique na estrela em um filme ou série para adicionar.</p>';
        } else {
            AppState.favorites.forEach(fav => {
                const item = getContentById(fav.id, fav.type);
                if (item) grid.appendChild(createCard(item, fav.type));
            });
        }
    }
}

// ============================================
// PLAYER
// ============================================

function loadPlayer(content) {
    const iframe = document.getElementById('player-iframe');
    const info = document.getElementById('player-info');
    const type = content._type || (content.seasons ? 'tv' : 'movie');
    
    // Construir URL do player com base no servidor
    let streamUrl = '';
    
    if (type === 'tv') {
        streamUrl = getStreamUrl(content, AppState.currentServer, AppState.currentSeason, AppState.currentEpisode);
    } else {
        streamUrl = getStreamUrl(content, AppState.currentServer);
    }
    
    if (iframe) {
        iframe.src = streamUrl || 'about:blank';
    }
    
    // Info do player
    if (info) {
        info.innerHTML = `
            <div class="player-info-header">
                <h2>${content.title} ${content.year ? `(${content.year})` : ''}</h2>
                <div class="player-info-meta">
                    <span>⭐ ${content.rating.toFixed(1)}</span>
                    <span>${content.genres.join(' · ')}</span>
                    <span>${content.duration ? content.duration + ' min' : (content.seasons ? content.seasons + ' temporadas' : '')}</span>
                    ${content.dubbing && content.dubbing.includes('pt-BR') ? '<span style="color: #f5b800;">🔊 Dublagem PT-BR Disponível</span>' : ''}
                </div>
            </div>
            
            <p class="player-info-overview">${content.overview}</p>
            
            <div class="player-controls">
                <div class="control-group">
                    <label>Servidor:</label>
                    <select id="server-select" class="filter-select">
                        ${content.streams.map(s => 
                            `<option value="${s.server}" ${s.server === AppState.currentServer ? 'selected' : ''}>${s.server}</option>`
                        ).join('')}
                    </select>
                </div>
                
                ${type === 'tv' ? `
                <div class="control-group">
                    <label>Temporada:</label>
                    <select id="season-select" class="filter-select">
                        ${Array.from({length: content.seasons || 1}, (_, i) => i + 1).map(n => 
                            `<option value="${n}" ${n === AppState.currentSeason ? 'selected' : ''}>Temporada ${n}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="control-group">
                    <label>Episódio:</label>
                    <select id="episode-select" class="filter-select">
                        ${Array.from({length: content.episodes || 10}, (_, i) => i + 1).map(n => 
                            `<option value="${n}" ${n === AppState.currentEpisode ? 'selected' : ''}>Episódio ${n}</option>`
                        ).join('')}
                    </select>
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
        
        // Event listeners
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
        AppState.favorites.push({ id: content.id, type: type, title: content.title });
    }
    
    localStorage.setItem('cs:favorites', JSON.stringify(AppState.favorites));
    loadPlayer(content); // Recarregar para atualizar botão
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
                if (AppState.currentPage === 'movies') {
                    loadMoviesPage();
                } else if (AppState.currentPage === 'series') {
                    loadSeriesPage();
                }
                return;
            }
            
            const results = search(query);
            
            // Mostrar resultados na página atual (ou criar página de busca)
            if (AppState.currentPage !== 'movies' && AppState.currentPage !== 'series') {
                navigateTo('movies');
            }
            
            const grid = document.getElementById('movies-grid') || document.getElementById('series-grid');
            if (grid) {
                grid.innerHTML = '';
                const all = [...results.movies.map(m => ({item: m, type: 'movie'})), 
                             ...results.series.map(s => ({item: s, type: 'tv'}))];
                
                if (all.length === 0) {
                    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">Nenhum resultado encontrado.</p>';
                } else {
                    all.forEach(({item, type}) => grid.appendChild(createCard(item, type)));
                }
            }
        }, 300);
    });
}

// ============================================
// SETTINGS
// ============================================

function setupSettings() {
    const modal = document.getElementById('settings-modal');
    const settingsBtn = document.getElementById('settings-btn');
    const closeBtn = document.querySelector('.modal-close');
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    
    // Fechar modal ao clicar fora
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    // Aplicar preferências salvas
    const dubbingCheck = document.getElementById('setting-dubbing');
    const subtitlesCheck = document.getElementById('setting-subtitles');
    const hdCheck = document.getElementById('setting-hd');
    const themeSelect = document.getElementById('setting-theme');
    
    if (dubbingCheck) {
        dubbingCheck.checked = AppState.settings.dubbing;
        dubbingCheck.addEventListener('change', (e) => {
            AppState.settings.dubbing = e.target.checked;
            saveSettings();
        });
    }
    
    if (subtitlesCheck) {
        subtitlesCheck.checked = AppState.settings.subtitles;
        subtitlesCheck.addEventListener('change', (e) => {
            AppState.settings.subtitles = e.target.checked;
            saveSettings();
        });
    }
    
    if (hdCheck) {
        hdCheck.checked = AppState.settings.hd;
        hdCheck.addEventListener('change', (e) => {
            AppState.settings.hd = e.target.checked;
            saveSettings();
        });
    }
    
    if (themeSelect) {
        themeSelect.value = AppState.settings.theme;
        themeSelect.addEventListener('change', (e) => {
            AppState.settings.theme = e.target.value;
            saveSettings();
            applyTheme();
        });
    }
    
    applyTheme();
}

function saveSettings() {
    localStorage.setItem('cs:settings', JSON.stringify(AppState.settings));
}

function applyTheme() {
    if (AppState.settings.theme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }
}

// ============================================
// FILTERS
// ============================================

function setupFilters() {
    const genreFilter = document.getElementById('genre-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    if (genreFilter) {
        genreFilter.addEventListener('change', () => {
            loadMoviesPage(genreFilter.value, sortFilter?.value || 'trending');
        });
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', () => {
            loadMoviesPage(genreFilter?.value || '', sortFilter.value);
        });
    }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Event listeners de navegação
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.dataset.page);
        });
    });
    
    setupSearch();
    setupSettings();
    setupFilters();
    
    // Carregar página inicial
    loadHomePage();
    
    // Contador de visitas (estilo bingebang)
    const visits = parseInt(localStorage.getItem('bb:visits') || '0') + 1;
    localStorage.setItem('bb:visits', visits);
});
