// language: JavaScript, file: public/app.js, target: Browser Client
document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('catalogGrid');
    const modal = document.getElementById('playerModal');
    const video = document.getElementById('videoPlayer');
    const audioSelect = document.getElementById('audioSelect');
    const closeBtn = document.getElementById('closeModal');
    const filterButtons = document.querySelectorAll('.filter-btn');

    let allItems = [];
    let currentItem = null;

    async function loadCatalog() {
        try {
            const res = await fetch('/api/catalog');
            allItems = await res.json();
            renderGrid(allItems);
        } catch (err) {
            console.error('Failed to load catalog:', err);
        }
    }

    function renderGrid(items) {
        grid.innerHTML = items.map(item => `
            <div class="card" data-id="${item.id}">
                <img src="${item.poster}" alt="${item.title}">
                <div class="card-info">
                    <div class="card-title">${item.title}</div>
                    <div class="card-meta">${item.year} • ★ ${item.rating} • Áudio PT-BR</div>
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
            if (filter === 'all') {
                renderGrid(allItems);
            } else {
                renderGrid(allItems.filter(i => i.type === filter));
            }
        });
    });

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
