// Hàm vẽ dùng chung: h() tạo phần tử an toàn (không innerHTML), the/nhan/dong/trong, bieuDo (SVG)
function h(tag, attrs, ...con) {
  const el = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => { if (k === 'onclick') el.onclick = v; else if (v !== undefined && v !== null && v !== false) el.setAttribute(k, v); });
  con.flat().forEach(c => { if (c === '' || c === null || c === undefined || c === false) return; el.append(typeof c === 'object' ? c : document.createTextNode(String(c))); });
  return el;
}
function the(tieuDe, ...con) { return h('div', { class: 'the' }, tieuDe ? h('h2', {}, tieuDe) : '', ...con); }
function nhan(chu, mau) { return h('span', { class: 'the2 t-' + (mau || 'xam') }, chu); }
function dong(trai, phai) { return h('div', { class: 'dong' }, h('span', {}, trai), h('span', {}, phai)); }
function trong(chu) { return h('div', { class: 'trong' }, chu); }

/** Biểu đồ đường đơn giản (SVG, không cần thư viện). chuoi = [{ten, mau, giaTri:[số|null]}], nhanX = [chữ], vach = [{gt, ten}] vạch ngưỡng đứt nét */
function bieuDo(chuoi, nhanX, donVi, vach) {
  const W = 640, H = 180, L = 34, R = 8, T = 10, B = 22;
  vach = vach || [];
  const tat = chuoi.flatMap(c => c.giaTri).filter(v => v !== null).concat(vach.map(v => v.gt));
  if (!tat.length) return trong('Chưa có số đo trong 24 giờ qua.');
  let lo = Math.min(...tat), hi = Math.max(...tat);
  if (hi - lo < 4) { lo -= 2; hi += 2; }
  const n = nhanX.length, x = i => L + (W - L - R) * (n < 2 ? 0 : i / (n - 1)), y = v => T + (H - T - B) * (1 - (v - lo) / (hi - lo));
  const ns = 'http://www.w3.org/2000/svg', svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.style.width = '100%';
  const ve = (tag, at, chu) => { const e = document.createElementNS(ns, tag); Object.entries(at).forEach(([k, v]) => e.setAttribute(k, v)); if (chu !== undefined) e.textContent = chu; svg.append(e); };
  [lo, (lo + hi) / 2, hi].forEach(v => { ve('line', { x1: L, x2: W - R, y1: y(v), y2: y(v), stroke: '#e2e7dd' }); ve('text', { x: 2, y: y(v) + 4 }, Math.round(v) + (donVi || '')); });
  [0, Math.floor((n - 1) / 2), n - 1].forEach(i => ve('text', { x: Math.min(x(i), W - 34), y: H - 4 }, nhanX[i] || ''));
  vach.forEach(v => { ve('line', { x1: L, x2: W - R, y1: y(v.gt), y2: y(v.gt), stroke: '#a85a12', 'stroke-dasharray': '5 4' }); ve('text', { x: W - R - 4, y: y(v.gt) - 4, 'text-anchor': 'end', style: 'fill:#a85a12' }, v.ten); });
  chuoi.forEach(c => {
    let d = '';
    c.giaTri.forEach((v, i) => { if (v === null) return; d += (d && c.giaTri[i - 1] !== null ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); });
    if (d) ve('path', { d, fill: 'none', stroke: c.mau, 'stroke-width': 2 });
  });
  const chu = h('div', { class: 'nho' }, chuoi.map(c => h('span', { style: 'margin-right:14px;color:' + c.mau }, '━ ' + c.ten)));
  return h('div', {}, svg, chu);
}
