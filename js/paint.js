// ── Canvas drawing engine ──
let pad, ctx, cssW = 0, cssH = 0;
let drawing = false, lastX = 0, lastY = 0;
let color = '#C97B84', size = SIZES[1].r, tool = 'brush', stamp = STAMPS[0];
let history = [];           // dataURL snapshots for undo
const HISTORY_MAX = 20;

function initPad() {
  pad = document.getElementById('pad');
  ctx = pad.getContext('2d');
  sizePad(true);
  // pointer events unify mouse + touch + stylus
  pad.addEventListener('pointerdown', e => { pad.setPointerCapture(e.pointerId); startDraw(posOf(e)); });
  pad.addEventListener('pointermove', e => { if (drawing) moveDraw(posOf(e)); });
  pad.addEventListener('pointerup', endDraw);
  pad.addEventListener('pointercancel', endDraw);
  pad.addEventListener('pointerleave', endDraw);
}

function sizePad(fresh) {
  const stage = document.getElementById('stage');
  const r = stage.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const prev = (!fresh && pad.width) ? pad.toDataURL() : null;
  pad.width = Math.round(r.width * dpr);
  pad.height = Math.round(r.height * dpr);
  pad.style.width = r.width + 'px';
  pad.style.height = r.height + 'px';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  cssW = r.width; cssH = r.height;
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, cssW, cssH);
  if (prev) { const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0, cssW, cssH); img.src = prev; }
}

function posOf(e) {
  const r = pad.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}

function pushHistory() {
  try { history.push(pad.toDataURL()); } catch (e) {}
  if (history.length > HISTORY_MAX) history.shift();
}

function startDraw(p) {
  if (tool === 'stamp') { placeStamp(p); return; }
  pushHistory();
  drawing = true; lastX = p.x; lastY = p.y;
  const paint = (tool === 'erase') ? PAPER : color;
  ctx.strokeStyle = paint; ctx.fillStyle = paint;
  ctx.lineWidth = (tool === 'erase') ? size * 2.2 : size;
  ctx.beginPath();
  ctx.arc(p.x, p.y, Math.max(ctx.lineWidth / 2, 0.6), 0, Math.PI * 2);
  ctx.fill();
}

function moveDraw(p) {
  const mx = (lastX + p.x) / 2, my = (lastY + p.y) / 2;
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.quadraticCurveTo(lastX, lastY, mx, my);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  lastX = p.x; lastY = p.y;
}

function endDraw() { drawing = false; }

function placeStamp(p) {
  pushHistory();
  const px = 26 + size * 2.2;
  ctx.font = px + 'px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(stamp, p.x, p.y);
}

function undo() {
  if (!history.length) return;
  const url = history.pop();
  const img = new Image();
  img.onload = () => { ctx.fillStyle = PAPER; ctx.fillRect(0, 0, cssW, cssH); ctx.drawImage(img, 0, 0, cssW, cssH); };
  img.src = url;
}

function clearPad() {
  pushHistory();
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, cssW, cssH);
}

// ── tools ──
function setTool(t) {
  tool = t;
  document.getElementById('btnBrush').classList.toggle('on', t === 'brush');
  document.getElementById('btnErase').classList.toggle('on', t === 'erase');
  if (t !== 'stamp') document.querySelectorAll('.stamp').forEach(s => s.classList.remove('on'));
}

function setColor(c, el) {
  color = c;
  if (tool === 'erase') setTool('brush');
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('on'));
  if (el) el.classList.add('on');
}

function setSize(r, el) {
  size = r;
  document.querySelectorAll('.size').forEach(s => s.classList.remove('on'));
  if (el) el.classList.add('on');
}

function setStamp(s, el) {
  stamp = s; tool = 'stamp';
  document.getElementById('btnBrush').classList.remove('on');
  document.getElementById('btnErase').classList.remove('on');
  document.querySelectorAll('.stamp').forEach(x => x.classList.remove('on'));
  if (el) el.classList.add('on');
}

function buildTools() {
  const cr = document.getElementById('colorRow');
  PALETTE.forEach((c, i) => {
    const b = document.createElement('button');
    b.className = 'swatch' + (c === color ? ' on' : '');
    b.style.background = c;
    if (c === '#FFFFFF') b.style.boxShadow = '0 0 0 1px rgba(0,0,0,.25), 0 2px 6px rgba(0,0,0,.35)';
    b.onclick = () => setColor(c, b);
    cr.appendChild(b);
  });
  const sr = document.getElementById('sizeRow');
  SIZES.forEach(s => {
    const b = document.createElement('button');
    b.className = 'size' + (s.r === size ? ' on' : '');
    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.style.width = s.d + 'px'; dot.style.height = s.d + 'px';
    b.appendChild(dot);
    b.onclick = () => setSize(s.r, b);
    sr.appendChild(b);
  });
  const st = document.getElementById('stampRow');
  STAMPS.forEach(s => {
    const b = document.createElement('button');
    b.className = 'stamp';
    b.textContent = s;
    b.onclick = () => setStamp(s, b);
    st.appendChild(b);
  });
  setTool('brush');
}

// ── save ──
function saveDrawing() {
  const dataUrl = pad.toDataURL('image/png');
  const rec = {
    id: Date.now(),
    dataUrl,
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
  };
  addDrawing(rec).then(() => {
    toast('✨ Saved to your gallery!');
    updateGalCount();
  }).catch(() => toast('Hmm, could not save 😿'));
}
