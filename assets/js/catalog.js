// catalog.js — Camada de catálogo dinâmico
// Carrega data/catalog.json (sincronizado do catálogo do bingebang.st via GitHub Action)
// com fallback para o seed local em data.js.

const CatalogDB = {
    ready: false,
    items: {},      // "movie:112897" -> item normalizado
    lists: {},      // "trending_movie_day" -> [chave, ...]
    discover: {},   // "netflix_movie" -> [chave, ...]
    generatedAt: null,
    source: 'seed',

    async load() {
        try {
            const res = await fetch('data/catalog.json', { cache: 'no-cache' });
            if (!res.ok) throw new Error('catalog.json não encontrado');
            const data = await res.json();

            this.items = {};
            for (const [key, item] of Object.entries(data.items || {})) {
                this.items[key] = this.normalize(item);
            }
            this.lists = data.lists || {};
            this.discover = data.discover || {};
            this.generatedAt = data.generated_at || null;
            this.source = 'live';
            this.ready = true;
            console.log(`[CatalogDB] ${Object.keys(this.items).length} itens carregados (${this.generatedAt})`);
        } catch (e) {
            console.warn('[CatalogDB] fallback para seed local:', e.message);
            this.loadSeed();
        }
        return this;
    },

    loadSeed() {
        this.items = {};
        this.lists = {};
        this.discover = {};
        const push = (arr, type) => {
            arr.forEach(item => {
                const key = `${type}:${item.id}`;
                this.items[key] = this.normalize({ ...item, media_type: type });
            });
        };
        push(CONTENT_DATABASE.movies, 'movie');
        push(CONTENT_DATABASE.series, 'tv');
        this.lists['movie_popular'] = CONTENT_DATABASE.movies.map(m => `movie:${m.id}`);
        this.lists['tv_popular'] = CONTENT_DATABASE.series.map(s => `tv:${s.id}`);
        this.ready = true;
        this.source = 'seed';
    },

    normalize(item) {
        const type = item.media_type || item.type || 'movie';
        return {
            id: item.id,
            type: type,
            title: item.title,
            year: item.year || 0,
            rating: item.rating || 0,
            genres: Array.isArray(item.genres) ? item.genres : [],
            overview: item.overview || '',
            poster: item.poster || null,
            backdrop: item.backdrop || null,
            popularity: item.popularity || 0,
            seasons: item.seasons || 0,
            episodes: item.episodes || 0
        };
    },

    keyOf(item) { return `${item.type || item.media_type}:${item.id}`; },

    resolveKeys(keys) {
        return (keys || []).map(k => this.items[k]).filter(Boolean);
    },

    list(name) { return this.resolveKeys(this.lists[name]); },

    provider(prov, media) { return this.resolveKeys(this.discover[`${prov}_${media}`]); },

    all(type) {
        return Object.values(this.items).filter(i => i.type === type);
    },

    // Todos os itens, deduplicado, ordenado por popularidade
    allItems() {
        return Object.values(this.items).sort((a, b) => b.popularity - a.popularity);
    },

    search(query, limit = 60) {
        const q = query.toLowerCase().trim();
        if (!q) return [];
        const esc = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const wordRe = new RegExp(`\\b${esc}`, 'i');
        const scored = [];
        for (const i of this.allItems()) {
            const t = i.title.toLowerCase();
            let score = 0;
            if (t === q) score = 100;
            else if (t.startsWith(q)) score = 80;
            else if (t.includes(q)) score = 60;
            else if (wordRe.test(i.overview)) score = 30;
            else if (i.genres.some(g => g.toLowerCase().startsWith(q))) score = 20;
            if (score) scored.push({ i, score });
        }
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, limit).map(s => s.i);
    },

    byGenre(genre, type) {
        return this.all(type || 'movie').filter(i =>
            i.genres.some(g => g.toLowerCase().includes(genre.toLowerCase()))
        );
    }
};

// URL de embed para reprodução (mesmos provedores usados pelo site original)
function embedUrl(item, server = 'vidsrc', season = 1, episode = 1) {
    const id = item.id;
    if (item.type === 'tv') {
        if (server === 'vidsrc') return `https://vidsrc.xyz/embed/tv?tmdb=${id}&season=${season}&episode=${episode}`;
        if (server === 'multembed') return `https://multembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
        if (server === 'vidsrc-to') return `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
    } else {
        if (server === 'vidsrc') return `https://vidsrc.xyz/embed/movie?tmdb=${id}`;
        if (server === 'multembed') return `https://multembed.mov/?video_id=${id}&tmdb=1`;
        if (server === 'vidsrc-to') return `https://vidsrc.to/embed/movie/${id}`;
    }
    return null;
}

const PROVIDERS = {
    'netflix': 'Netflix',
    'prime-video': 'Prime Video',
    'disney-plus': 'Disney+',
    'max': 'Max',
    'apple-tv-plus': 'Apple TV+',
    'paramount-plus': 'Paramount+',
    'hulu': 'Hulu'
};
