#!/usr/bin/env python3
# sync_catalog.py — puxa o catálogo do bingebang.st (endpoints públicos de catalog)
# e escreve data/catalog.json para uso estático (GitHub Pages).
#
# Uso: python3 scripts/sync_catalog.py
# Saída: data/catalog.json
#
# Endpoints (server-side, sem CORS):
#   /api/list/*        — trending/popular/top_rated/upcoming (cap ~40 por lista)
#   /api/discover/{movie,tv}?provider=X&page=N — catálogo paginado por provedor
#   /api/search/multi  — buscador (não usado aqui; site filtra localmente)

import json
import sys
import time
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

BASE = "https://bingebang.st/api"
OUT = Path(__file__).resolve().parent.parent / "data" / "catalog.json"

UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/155 Safari/537.36",
      "Accept": "application/json"}

LISTS = [
    "trending_movie_day", "trending_movie_week",
    "trending_tv_day", "trending_tv_week",
    "movie_popular", "tv_popular",
    "movie_top_rated", "tv_top_rated",
    "movie_upcoming", "movie_now_playing",
    "tv_airing_today", "tv_on_the_air",
]

PROVIDERS = [
    "netflix", "prime-video", "disney-plus", "max",
    "apple-tv-plus", "paramount-plus", "hulu",
]

DISCOVER_PAGES = 3   # 48 itens/página por provedor e por mídia
LIST_LIMIT = 40

GENRES = {
    28: "Ação", 12: "Aventura", 16: "Animação", 35: "Comédia", 80: "Crime",
    99: "Documentário", 18: "Drama", 10751: "Família", 14: "Fantasia",
    36: "História", 27: "Terror", 10402: "Música", 9648: "Mistério",
    10749: "Romance", 878: "Ficção científica", 10770: "Cinema TV",
    53: "Thriller", 10752: "Guerra", 37: "Faroeste",
    10759: "Ação & Aventura", 10762: "Infantil", 10763: "Notícias",
    10764: "Reality", 10765: "Ficção & Fantasia", 10766: "Novela",
    10767: "Talk Show", 10768: "Guerra & Política",
}


def fetch(path: str, retries: int = 3):
    url = f"{BASE}/{path}"
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read().decode("utf-8", "replace"))
        except urllib.error.HTTPError as e:
            if e.code in (429, 503) and attempt < retries - 1:
                time.sleep(2 ** attempt * 2)
                continue
            print(f"  ! {path} -> HTTP {e.code}", file=sys.stderr)
            return None
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(1.5 * (attempt + 1))
                continue
            print(f"  ! {path} -> {e}", file=sys.stderr)
            return None
    return None


def normalize(item: dict) -> dict:
    """Normaliza item TMDB-like para o formato do site."""
    mid = item.get("id")
    mt = item.get("media_type") or ("tv" if item.get("name") else "movie")
    title = item.get("title") or item.get("name") or ""
    date = item.get("release_date") or item.get("first_air_date") or ""
    genres = [GENRES[g] for g in item.get("genre_ids", []) if g in GENRES]
    return {
        "id": mid,
        "media_type": mt,
        "title": title,
        "year": item.get("year") or (int(date[:4]) if date[:4].isdigit() else 0),
        "rating": round(float(item.get("vote_average") or 0), 1),
        "genres": genres or ["—"],
        "overview": (item.get("overview") or "").strip(),
        "poster": f"https://image.tmdb.org/t/p/w342{item['poster_path']}" if item.get("poster_path") else None,
        "backdrop": f"https://image.tmdb.org/t/p/w780{item['backdrop_path']}" if item.get("backdrop_path") else None,
        "url": item.get("url"),
        "play_url": item.get("play_url"),
        "popularity": item.get("popularity") or 0,
    }


def main() -> int:
    items: dict[str, dict] = {}          # "movie:112897" -> item
    lists: dict[str, list[str]] = {}     # nome lista -> [chave, ...]
    discover: dict[str, list[str]] = {}  # "netflix_movie" -> [chave, ...]
    fetched = 0
    failed = 0

    def register(item: dict, bucket: list, seen: set):
        n = normalize(item)
        if not n["id"] or not n["title"]:
            return
        key = f"{n['media_type']}:{n['id']}"
        items[key] = n
        if key not in seen:
            seen.add(key)
            bucket.append(key)

    # ---- 1. listas (paralelo) ----
    print(f"[1/2] listas: {len(LISTS)} endpoints")
    with ThreadPoolExecutor(max_workers=6) as ex:
        results = list(ex.map(lambda ep: (ep, fetch(f"list/{ep}?limit={LIST_LIMIT}")), LISTS))
    for ep, data in results:
        if not data or not data.get("results"):
            failed += 1
            continue
        fetched += 1
        bucket: list[str] = []
        seen: set[str] = set()
        for it in data["results"]:
            register(it, bucket, seen)
        lists[ep] = bucket
        print(f"  {ep}: {len(bucket)} itens")

    # ---- 2. discover por provedor (paralelo controlado) ----
    tasks = []
    for prov in PROVIDERS:
        for media in ("movie", "tv"):
            for page in range(1, DISCOVER_PAGES + 1):
                tasks.append((prov, media, page))

    print(f"[2/2] discover: {len(tasks)} páginas")
    with ThreadPoolExecutor(max_workers=6) as ex:
        dresults = list(ex.map(
            lambda t: (t, fetch(f"discover/{t[1]}?provider={t[0]}&page={t[2]}&sort=popularity.desc")),
            tasks))

    for (prov, media, page), data in dresults:
        if not data or not data.get("results"):
            failed += 1
            continue
        fetched += 1
        name = f"{prov}_{media}"
        bucket = discover.setdefault(name, [])
        seen = set(bucket)
        for it in data["results"]:
            register(it, bucket, seen)

    # resumo discover
    for k, v in sorted(discover.items()):
        print(f"  {k}: {len(v)} itens")

    catalog = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "source": "bingebang.st/api",
        "counts": {"items": len(items), "lists": len(lists), "discover": len(discover),
                   "fetched": fetched, "failed": failed},
        "lists": lists,
        "discover": discover,
        "items": items,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(catalog, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    size_mb = OUT.stat().st_size / 1e6
    print(f"\n✓ {OUT} — {len(items)} itens únicos ({size_mb:.1f} MB), "
          f"{fetched} ok / {failed} falhas")
    return 0 if fetched else 1


if __name__ == "__main__":
    sys.exit(main())
