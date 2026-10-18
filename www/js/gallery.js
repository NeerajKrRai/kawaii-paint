// ── Gallery + lightbox ──
let _current = null;

function renderGallery() {
  const grid = document.getElementById('galGrid');
  const empty = document.getElementById('galEmpty');
  getAllDrawings().then(list => {
    grid.innerHTML = '';
    if (!list.length) {
      empty.hidden = false;
      grid.hidden = true;
      return;
    }
    empty.hidden = true;
    grid.hidden = false;
    list.forEach(d => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `<img src="${d.dataUrl}" alt="painting"><div class="cd">☀ ${d.date}</div>`;
      card.onclick = () => openLightbox(d.id);
      grid.appendChild(card);
    });
  });
}

function openLightbox(id) {
  getAllDrawings().then(list => {
    _current = list.find(d => d.id === id);
    if (!_current) return;
    document.getElementById('lbImg').src = _current.dataUrl;
    document.getElementById('lbDate').textContent = '☀ ' + _current.date;
    document.getElementById('lightbox').classList.add('on');
  });
}

function closeLightbox(e) {
  if (e && e.target !== document.getElementById('lightbox')) return;
  document.getElementById('lightbox').classList.remove('on');
  _current = null;
}

function downloadCurrent() {
  if (!_current) return;
  const a = document.createElement('a');
  a.href = _current.dataUrl;
  a.download = 'kawaii-painting-' + _current.id + '.png';
  a.click();
  toast('📥 Picture saved!');
}

function deleteCurrent() {
  if (!_current) return;
  const id = _current.id;
  deleteDrawing(id).then(() => {
    document.getElementById('lightbox').classList.remove('on');
    _current = null;
    renderGallery();
    updateGalCount();
    toast('🗑️ Painting deleted');
  });
}

function updateGalCount() {
  countDrawings().then(n => {
    const el = document.getElementById('galCount');
    if (el) el.textContent = n ? '(' + n + ')' : '';
  });
}
