// Database de conteúdo com suporte a PT-BR e múltiplos servidores
const CONTENT_DATABASE = {
    movies: [
        {
            id: 110518,
            title: 'Maçãs Podres',
            titleEn: 'Bad Apples',
            year: 2026,
            rating: 7.0,
            genres: ['Comédia', 'Thriller'],
            overview: 'Uma professora de ensino fundamental em dificuldades é forçada a confrontar um segredo que poderia destruir sua vida.',
            backdrop: 'https://image.tmdb.org/t/p/original/ldeiBXtVM12oDUVSiJtwjESLSOc.jpg',
            poster: 'https://image.tmdb.org/t/p/w342/pcPLnxCThCIo9JFQIMFX4kAE5Yz.jpg',
            duration: 102,
            language: 'pt-BR',
            dubbing: ['pt-BR', 'en-US'],
            subtitles: ['pt-BR', 'en-US', 'es-ES'],
            streams: [
                { server: 'vidsrc', id: '110518', type: 'movie' },
                { server: 'multiembed', id: '110518', type: 'movie' },
                { server: 'myembed', id: '110518', type: 'movie' }
            ]
        },
        {
            id: 112897,
            title: 'Plano Mestre',
            titleEn: 'Masterplan',
            year: 2026,
            rating: 7.2,
            genres: ['Ação', 'Thriller'],
            overview: 'Quando um lendário ladrão coloca seus olhos na Monalisa, ele planeja o roubo perfeito.',
            backdrop: 'https://image.tmdb.org/t/p/original/dgUDj84BWtW6EZzee8BkgKnjDhh.jpg',
            poster: 'https://image.tmdb.org/t/p/w342/5xmXVd7nCK3tAo34XkO58SxUCip.jpg',
            duration: 118,
            language: 'pt-BR',
            dubbing: ['pt-BR', 'en-US'],
            subtitles: ['pt-BR', 'en-US', 'es-ES'],
            streams: [
                { server: 'vidsrc', id: '112897', type: 'movie' },
                { server: 'multiembed', id: '112897', type: 'movie' },
                { server: 'myembed', id: '112897', type: 'movie' }
            ]
        },
        {
            id: 112903,
            title: 'Tenzing',
            titleEn: 'Tenzing',
            year: 2026,
            rating: 8.3,
            genres: ['Drama', 'História'],
            overview: 'Um homem determinado embarca em uma missão de alto risco — uma expedição para conquistar o Monte Everest.',
            backdrop: 'https://image.tmdb.org/t/p/original/6GXqVvL20Y0MpyVP30WoI2NPK69.jpg',
            poster: 'https://image.tmdb.org/t/p/w342/eI0QW02PYqhnmIvLRdn9vrfVVP7.jpg',
            duration: 125,
            language: 'pt-BR',
            dubbing: ['pt-BR', 'en-US'],
            subtitles: ['pt-BR', 'en-US', 'es-ES'],
            streams: [
                { server: 'vidsrc', id: '112903', type: 'movie' },
                { server: 'multiembed', id: '112903', type: 'movie' },
                { server: 'myembed', id: '112903', type: 'movie' }
            ]
        },
        {
            id: 69372,
            title: 'Presa',
            titleEn: 'Prey',
            year: 2022,
            rating: 7.6,
            genres: ['Ação', 'Ficção Científica', 'Thriller'],
            overview: 'Quando o perigo ameaça seu acampamento, a feroz e altamente habilidosa guerreira Comanche Naru se propõe a proteger seu povo.',
            backdrop: 'https://image.tmdb.org/t/p/original/7ZO9yoEU2fAHKhmJWfAc2QIPWJg.jpg',
            poster: 'https://image.tmdb.org/t/p/w342/2FKjLRt7oK1bRRIrxgWmthbBdFh.jpg',
            duration: 100,
            language: 'pt-BR',
            dubbing: ['pt-BR', 'en-US'],
            subtitles: ['pt-BR', 'en-US', 'es-ES', 'fr-FR'],
            streams: [
                { server: 'vidsrc', id: '69372', type: 'movie' },
                { server: 'multiembed', id: '69372', type: 'movie' },
                { server: 'myembed', id: '69372', type: 'movie' }
            ]
        },
        {
            id: 76600,
            title: 'Homem-Aranha: Novo Universo',
            titleEn: 'Spider-Man: Across the Spider-Verse',
            year: 2023,
            rating: 8.4,
            genres: ['Animação', 'Ação', 'Aventura'],
            overview: 'Miles Morales se une com Gwen Verse e novos heróis em uma jornada épica para salvar todos os multiversos.',
            backdrop: 'https://image.tmdb.org/t/p/original/4i6wXGG85X0Y8wqKF9A9YeqLUCx.jpg',
            poster: 'https://image.tmdb.org/t/p/w342/xDFxnd46s9qC3V4wGKg6XsrAwK8.jpg',
            duration: 140,
            language: 'pt-BR',
            dubbing: ['pt-BR', 'en-US'],
            subtitles: ['pt-BR', 'en-US', 'es-ES'],
            streams: [
                { server: 'vidsrc', id: '76600', type: 'movie' },
                { server: 'multiembed', id: '76600', type: 'movie' },
                { server: 'myembed', id: '76600', type: 'movie' }
            ]
        }
    ],
    series: [
        {
            id: 108978,
            title: 'Reacher',
            titleEn: 'Reacher',
            year: 2022,
            rating: 8.2,
            genres: ['Drama', 'Crime', 'Ação'],
            overview: 'Um veterano da polícia militar investe uma conspiração mortal em uma pequena cidade da Geórgia.',
            backdrop: 'https://image.tmdb.org/t/p/original/qLJJg8qiMVAhMz6LYICk7bM7DgR.jpg',
            poster: 'https://image.tmdb.org/t/p/w342/vO5G8OMfb0NU31OYR3fkOBhO1Rm.jpg',
            seasons: 2,
            episodes: 16,
            language: 'pt-BR',
            dubbing: ['pt-BR', 'en-US'],
            subtitles: ['pt-BR', 'en-US', 'es-ES'],
            streams: [
                { server: 'vidsrc', id: '120461', type: 'tv', season: 1, episode: 1 },
                { server: 'multiembed', id: '120461', type: 'tv', season: 1, episode: 1 },
                { server: 'myembed', id: '120461', type: 'tv', season: 1, episode: 1 }
            ]
        },
        {
            id: 95557,
            title: 'A Casa do Dragão',
            titleEn: 'House of the Dragon',
            year: 2022,
            rating: 8.3,
            genres: ['Drama', 'Ficção', 'Fantasia'],
            overview: 'A história da Casa Targaryen descida de Westeros começa dez dias antes de sua eventual queda.',
            backdrop: 'https://image.tmdb.org/t/p/original/8KR4w7D8fVzpOPvT7Wt4HUmvXJO.jpg',
            poster: 'https://image.tmdb.org/t/p/w342/fz59JK0XVLm8sJx5cFBK0g6YILP.jpg',
            seasons: 2,
            episodes: 18,
            language: 'pt-BR',
            dubbing: ['pt-BR', 'en-US'],
            subtitles: ['pt-BR', 'en-US', 'es-ES'],
            streams: [
                { server: 'vidsrc', id: '95557', type: 'tv', season: 1, episode: 1 },
                { server: 'multiembed', id: '95557', type: 'tv', season: 1, episode: 1 },
                { server: 'myembed', id: '95557', type: 'tv', season: 1, episode: 1 }
            ]
        },
        {
            id: 100088,
            title: 'The Last of Us',
            titleEn: 'The Last of Us',
            year: 2023,
            rating: 8.7,
            genres: ['Drama', 'Ficção', 'Aventura'],
            overview: 'Vinte anos após a destruição da civilização, Joel é contratado para contrabandear Ellie, uma menina de 14 anos, para fora de uma zona de quarentena opressiva.',
            backdrop: 'https://image.tmdb.org/t/p/original/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg',
            poster: 'https://image.tmdb.org/t/p/w342/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg',
            seasons: 2,
            episodes: 16,
            language: 'pt-BR',
            dubbing: ['pt-BR', 'en-US'],
            subtitles: ['pt-BR', 'en-US', 'es-ES'],
            streams: [
                { server: 'vidsrc', id: '100088', type: 'tv', season: 1, episode: 1 },
                { server: 'multiembed', id: '100088', type: 'tv', season: 1, episode: 1 },
                { server: 'myembed', id: '100088', type: 'tv', season: 1, episode: 1 }
            ]
        }
    ]
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
    return { movies, series };
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
