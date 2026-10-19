// Database de conteúdo com suporte a PT-BR e múltiplos servidores
const CONTENT_DATABASE = {
    movies: [],
    series: []
};

// Funções utilitárias para API
function getMovies(page = 1, genre = '', sort = 'trending') {
    let movies = [...CONTENT_DATABASE.movies];

    if (genre) {
        movies = movies.filter(m => m.genres.some(g => g.toLowerCase().includes(genre.toLowerCase())));
    }

    // Sort
    if (sort === 'newest') {
        movies.sort((a, b) => b.year - a.year);
    } else if (sort === 'rating') {
        movies.sort((a, b) => b.rating - a.rating);
    }

    const pageSize = 20;
    const start = (page - 1) * pageSize;
    return {
        results: movies.slice(start, start + pageSize),
        total_pages: Math.ceil(movies.length / pageSize),
        page: page
    };
}

function getSeries(page = 1, genre = '', sort = 'trending') {
    let series = [...CONTENT_DATABASE.series];

    if (genre) {
        series = series.filter(s => s.genres.some(g => g.toLowerCase().includes(genre.toLowerCase())));
    }

    if (sort === 'newest') {
        series.sort((a, b) => b.year - a.year);
    } else if (sort === 'rating') {
        series.sort((a, b) => b.rating - a.rating);
    }

    const pageSize = 20;
    const start = (page - 1) * pageSize;
    return {
        results: series.slice(start, start + pageSize),
        total_pages: Math.ceil(series.length / pageSize),
        page: page
    };
}

function getContentById(id, type = 'movie') {
    if (type === 'movie') {
        return CONTENT_DATABASE.movies.find(m => m.id === id);
    } else if (type === 'tv') {
        return CONTENT_DATABASE.series.find(s => s.id === id);
    }
}

function getFeatured() {
    const all = [...CONTENT_DATABASE.movies, ...CONTENT_DATABASE.series];
    return all.sort(() => Math.random() - 0.5).slice(0, 8);
}

function search(query) {
    const q = query.toLowerCase();
    const movies = CONTENT_DATABASE.movies.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.titleEn.toLowerCase().includes(q) ||
        m.overview.toLowerCase().includes(q)
    );
    const series = CONTENT_DATABASE.series.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.titleEn.toLowerCase().includes(q) ||
        s.overview.toLowerCase().includes(q)
    );
    return ([], []);
}

// Servidor de streaming URLs
function getStreamUrl(content, server = 'vidsrc', season = null, episode = null) {
    const streamConfig = content.streams.find(s => s.server === server);

    if (!streamConfig) {
        return null;
    }

    if (server === 'vidsrc') {
        if (content.genres[0] === 'Série' || season) {
            return `https://vidsrc.xyz/embed/tv?tmdb=${streamConfig.id}&season=${season || 1}&episode=${episode || 1}`;
        }
        return `https://vidsrc.xyz/embed/movie?tmdb=${streamConfig.id}`;
    } else if (server === 'multembed') {
        if (season) {
            return `https://multembed.mov/?video_id=${streamConfig.id}&tmdb=1&s=${season}&e=${episode || 1}`;
        }
        return `https://multembed.mov/?video_id=${streamConfig.id}&tmdb=1`;
    } else if (server === 'vidsrc-to') {
        if (season) {
            return `https://vidsrc.to/embed/tv/${streamConfig.id}/${season}/${episode || 1}`;
        }
        return `https://vidsrc.to/embed/movie/${streamConfig.id}`;
    } else if (server === 'myembed') {
        if (season) {
            return `https://myembed.biz/filme/${streamConfig.id}?season=${season}&episode=${episode}`;
        }
        return `https://myembed.biz/filme/${streamConfig.id}`;
    }

    return null;
}

// Gêneros disponíveis
const GENRES = {
    action: 'Ação',
    comedy: 'Comédia',
    drama: 'Drama',
    scifi: 'Ficção Científica',
    horror: 'Terror',
    romance: 'Romance',
    animation: 'Animação',
    fantasy: 'Fantasia',
    crime: 'Crime',
    adventure: 'Aventura',
    thriller: 'Suspense'
};

// Preferências do usuário
const USER_PREFS = {
    dubbing: true,  // Preferir dublagem PT-BR
    subtitles: false, // Mostrar legendas
    hd: true,       // Qualidade HD
    theme: 'dark',  // Tema escuro
    language: 'pt-BR'
};
