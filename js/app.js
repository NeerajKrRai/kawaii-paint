// ── Routing + boot ──
let curScreen = 'sStudio';

function go(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('on'));
  document.getElementById(id).classList.add('on');
  curScreen = id;
  if (id === 'sGallery') renderGallery();
}

let _toastTimer = null;
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('on');
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('on'), 2400);
}

let _resizeTimer = null;
window.addEventListener('resize', () => {
  if (_resizeTimer) clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(() => sizePad(false), 200);
});

window.addEventListener('load', () => {
  initPad();
  buildTools();
  updateGalCount();
});
