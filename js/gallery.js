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
  resetDelete();
}

// dataURL -> Blob, so we can offer a real file (iOS Safari ignores <a download> for data: URLs)
function dataUrlToBlob(dataUrl) {
  const parts = dataUrl.split(',');
  const mime = (parts[0].match(/:(.*?);/) || [])[1] || 'image/png';
  const bin = atob(parts[1]);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

function downloadCurrent() {
  if (!_current) return;
  const filename = 'kawaii-painting-' + _current.id + '.png';
  const blob = dataUrlToBlob(_current.dataUrl);
  // On iOS the reliable way to save to Photos/Files is the Web Share sheet
  if (navigator.canShare) {
    const file = new File([blob], filename, { type: blob.type });
    if (navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: 'My painting' })
        .then(() => toast('📥 Saved!'))
        .catch(() => {}); // user cancelled the share sheet — no toast
      return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('📥 Picture saved!');
}

// two-tap delete (no confirm() — blocked on mobile; and one mis-tap shouldn't lose art)
let _delArmed = false, _delTimer = null;
function resetDelete() {
  _delArmed = false;
  if (_delTimer) { clearTimeout(_delTimer); _delTimer = null; }
  const btn = document.getElementById('lbDelete');
  if (btn) { btn.textContent = '🗑️ Delete'; btn.classList.remove('armed'); }
}
function deleteCurrent() {
  if (!_current) return;
  const btn = document.getElementById('lbDelete');
  if (!_delArmed) {
    _delArmed = true;
    if (btn) { btn.textContent = '⚠️ Tap again to delete'; btn.classList.add('armed'); }
    _delTimer = setTimeout(resetDelete, 3000);
    return;
  }
  resetDelete();
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
