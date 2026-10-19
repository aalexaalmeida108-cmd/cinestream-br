# 🎬 CineStream BR

Streaming de filmes e séries com preferência de dublagem em Português Brasil.

## Funcionalidades
- Catálogo dinâmico (~1700 títulos) sincronizado automaticamente
- Navegação por provedor de streaming (Netflix, Prime Video, Disney+, Max, Apple TV+, Paramount+, Hulu)
- Player integrado com múltiplos servidores (vidsrc, multembed, vidsrc.to)
- Preferência de dublagem PT-BR
- Favoritos (localStorage)
- Busca com ranking, filtros por gênero e ordenação
- Lançamentos (filmes em breve + séries em exibição)
- Tema claro/escuro, layout responsivo

## Arquitetura do catálogo

O catálogo é sincronizado do site `bingebang.st`, que expõe uma API proxy do TMDB
(endpoints públicos, sem chave). O sync roda server-side via GitHub Action:

```
GitHub Action (a cada 6h) → scripts/sync_catalog.py → data/catalog.json → site
```

### API mapeada (bingebang.st)

Listas (`GET /api/list/<nome>?limit=40`, máx ~40 itens):
```
trending_movie_day   trending_movie_week   trending_tv_day   trending_tv_week
movie_popular        tv_popular            movie_top_rated   tv_top_rated
movie_upcoming       movie_now_playing     tv_airing_today   tv_on_the_air
```

Discover paginado (`GET /api/discover/movie|tv?provider=<id>&page=N&sort=popularity.desc`,
48 itens/página, ~87 páginas por provedor):

```
provedores: netflix, prime-video, disney-plus, max, apple-tv-plus, paramount-plus, hulu
sorts:      popularity.desc, vote_average.desc, primary_release_date.desc
```

Outros (não usados no sync):
```
GET /api/search/multi?query=<texto>
GET /api/movie/<tmdb_id>            — detalhe completo (credits, similar, trailer_key, play_url)
GET /api/tv/<tmdb_id>/season/<N>    — episódios da temporada
GET /api/player/{sources,resolve,subtitle,segments} — pipeline do player,
                                                       protegido por ticket + resposta cifrada
```

Itens retornam shape TMDB + campos extras: `url`, `play_url`, `backdrop_titled_path`,
`logo_path`, `certification`, `year`.

> Nota: a API não envia headers CORS, por isso o sync é feito server-side
> (GitHub Action) e servido como JSON estático no mesmo domínio do site.

## Estrutura
```
index.html
assets/css/style.css
assets/js/data.js      — seed local (fallback offline)
assets/js/catalog.js   — loader do catálogo dinâmico + helpers
assets/js/app.js       — aplicação
data/catalog.json      — catálogo sincronizado (gerado pela Action)
scripts/sync_catalog.py
.github/workflows/sync-catalog.yml
```

## Uso local
```bash
python3 -m http.server 8099
# http://127.0.0.1:8099
```

Sync manual:
```bash
python3 scripts/sync_catalog.py
```

## Deploy
GitHub Pages — branch `main`, root. A Action `Sync Catalog` mantém
`data/catalog.json` atualizado automaticamente.
