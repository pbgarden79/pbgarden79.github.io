// MÀN "HÔM NAY" (bước 2 giao diện chuyên nghiệp, 27/11/2026) – tab đầu tiên khi máy đã kích hoạt (app.js → veTrangTab).
// Gồm: lời chào · thẻ thời tiết Nha Trang (MET Norway, miễn phí, không khóa) · "Việc hôm nay" (cây tới/quá hạn kiểm tra nước,
// nút "Đã kiểm tra nước" gọi ghi_cham) · thanh tiến độ "Cây về nhà X ngày". Câu chữ: noi-dung/hom-nay.json.
// Dữ liệu vườn: layVuon() + trangThaiCham() ở man-hinh/vuon.js. Không gửi dữ liệu khách ra ngoài (thời tiết chỉ gửi tọa độ Nha Trang).

const HN_TOA_DO = { lat: 12.24, lon: 109.19 }; // Nha Trang (giống Apps Script 00_Config.gs)
let _hnChu = null;
function hnChu() {
  if (!_hnChu) _hnChu = fetch('/noi-dung/hom-nay.json', { cache: 'no-cache' }).then(r => r.json());
  return _hnChu;
}
const hnThay = (s, o) => String(s || '').replace(/\{(\w+)\}/g, (_, k) => (o[k] !== undefined ? o[k] : ''));
const hnSoNgay = (tu, den) => Math.round((Date.parse(den + 'T12:00:00Z') - Date.parse(tu + 'T12:00:00Z')) / 864e5);

/** Màn Hôm nay. ma = mã cây đang mở (?c=) hoặc ''. conHan = còn hạn nâng cao/gói. */
function manHinhHomNay(nd, ma, conHan) {
  hnKieu();
  const vung = h('div', { class: 'hom-nay' });
  const chao = h('div', { class: 'hn-chao' });
  const tt = h('section', { class: 'the hn-tt' }, h('p', { class: 'nho' }, 'Đang tải thời tiết…'));
  const viec = h('div', {}), tienDo = h('div', {});
  vung.append(chao, tt, viec, tienDo);
  hnChu().then(chu => {
    const gio = +new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour: 'numeric', hourCycle: 'h23' }).format(new Date());
    chao.append(h('h2', {}, gio < 11 ? chu.chao.sang : gio < 18 ? chu.chao.chieu : chu.chao.toi),
      h('p', { class: 'nho' }, hnThu(homNay()) + ', ' + ngayVN(homNay())));
    theThoiTiet(chu, tt);
    const ve = () => (vung.isConnected || !viec.firstChild ? layVuon() : Promise.reject(document.removeEventListener('vuon-doi', ve))).then(ds => {
      ds = ds.filter(c => nd.cay[c.cay]);
      // chủ shop xem thử loại cây chưa có combo → thẻ giả (không ghi gì), giống manHinhCham
      if (ma && !ds.some(c => c.ma === ma) && typeof laMaXem === 'function' && laMaXem(ma))
        ds.push({ ma, cay: nd.combo[ma].cay, kich_hoat: homNay(), ngay_cham: [] });
      viec.replaceChildren(theViecHomNay(nd, chu, ds, conHan));
      tienDo.replaceChildren(theTienDo(nd, chu, ma ? ds.filter(c => c.ma === ma) : ds, !ma));
    }).catch(() => {}); // màn đã bị thay (vẽ lại khung tab) → thôi nghe
    ve();
    document.addEventListener('vuon-doi', ve); // vừa bấm "Đã kiểm tra nước" ở đâu đó → vẽ lại
  }).catch(() => { tt.remove(); });
  return vung;
}

/** Trạng thái 1 cây cho Hôm nay: số ngày tới hạn (âm = trễ), màu ok/sap/tre. */
function hnTrangThai(c, cay) {
  const t = trangThaiCham(c, cay), con = hnSoNgay(homNay(), t.toi);
  return { t, con, mau: con < 0 ? 'tre' : con <= 1 ? 'sap' : 'ok', veNha: Math.max(0, hnSoNgay(c.kich_hoat, homNay())) };
}

/** Ô đếm ngày (xanh/cam/đỏ). */
function oDemNgay(chu, s) {
  return h('div', { class: 'hn-o ' + s.mau },
    h('b', {}, s.con === 0 ? '💧' : String(Math.abs(s.con))),
    h('span', {}, s.con === 0 ? chu.viec.o_nay : s.con < 0 ? chu.viec.o_tre : chu.viec.o_con));
}

/** "Việc hôm nay": cây tới hạn hôm nay/ngày mai hoặc đã trễ. */
function theViecHomNay(nd, chu, ds, conHan) {
  const v = chu.viec;
  const can = ds.map(c => ({ c, cay: nd.cay[c.cay], s: hnTrangThai(c, nd.cay[c.cay]) }))
    .filter(x => x.s.con <= 1 && x.s.t.cuoi !== homNay()).sort((a, b) => a.s.con - b.s.con);
  const soCan = can.filter(x => x.s.con <= 0).length;
  const the = h('section', { class: 'the' }, h('h3', {}, v.tieu_de),
    h('p', { class: 'nho' }, soCan ? hnThay(v.co_viec, { so: soCan }) : v.khong_viec));
  if (!can.length) return the;
  if (conHan) the.append(h('p', { class: 'nho' }, v.huong_dan));
  can.forEach(x => {
    const bao = h('p', { class: 'bao' });
    const ten = h('div', { class: 'hn-ten' }, h('b', {}, (x.cay.bieu_tuong || '🌿') + ' ' + x.cay.ten.replace(/\s*\(.*\)$/, '')),
      h('span', { class: 'nho' }, x.c.ma + (x.s.t.cuoi ? ' · lần cuối ' + ngayVN(x.s.t.cuoi) : '')));
    const dong = h('div', { class: 'hn-dong' }, oDemNgay(chu, x.s), ten);
    if (conHan) {
      const nut = h('button', { class: 'nut hn-nut', type: 'button' }, v.nut);
      nut.onclick = async () => {
        nut.disabled = true; bao.className = 'bao'; bao.textContent = '';
        const r = await goiHam('ghi_cham', { p_ma: x.c.ma }, false);
        if (r.ok && r.data && r.data.chu_shop) { bao.className = 'bao xanh'; bao.textContent = '👑 Chế độ chủ shop: bấm thử, không ghi vào nhật ký của khách.'; return; }
        if (r.ok && r.data && r.data.ok) { bao.className = 'bao xanh'; bao.textContent = v.da_ghi; await layVuon(true); setTimeout(() => document.dispatchEvent(new Event('vuon-doi')), 900); }
        else { nut.disabled = false; bao.textContent = v.loi; }
      };
      ten.append(nut);
    }
    the.append(h('div', { class: 'hn-viec' }, dong, bao));
  });
  if (!conHan) the.append(h('p', { class: 'vd-khoa' }, v.het_han));
  return the;
}

/** Thanh tiến độ "Cây về nhà X ngày" + lần kiểm tra nước tới. tatCa = trang chủ (mọi cây, tối đa 6). */
function theTienDo(nd, chu, ds, tatCa) {
  if (!ds.length) return '';
  const td = chu.tien_do, the = h('section', { class: 'the' }, h('h3', {}, td.tieu_de));
  ds.slice(0, 6).forEach(c => {
    const cay = nd.cay[c.cay], s = hnTrangThai(c, cay);
    const daQua = cay.kiem_tra_ngay - Math.max(0, s.con); // số ngày đã qua trong chu kỳ kiểm tra nước
    const phan = Math.min(100, Math.max(4, Math.round(daQua / cay.kiem_tra_ngay * 100)));
    const thanh = h('div', { class: 'hn-thanh ' + s.mau, role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(phan) }, h('i', {}));
    thanh.firstChild.style.width = phan + '%';
    the.append(h('div', { class: 'hn-td' },
      h('div', { class: 'hn-td-dau' }, h('b', {}, (tatCa ? (cay.bieu_tuong || '🌿') + ' ' + c.ma + ' · ' : '') + hnThay(td.dong, { n: s.veNha })),
        h('span', { class: 'cham-sk ' + s.mau })),
      thanh,
      h('p', { class: 'nho' }, s.con === 0 ? td.toi_nay : s.con < 0 ? hnThay(td.toi_tre, { n: -s.con }) : hnThay(td.toi_con, { n: s.con }))));
  });
  if (tatCa && ds.length > 6) the.append(h('a', { href: '#vuon', class: 'nho' }, td.xem_vuon));
  return the;
}

// ───────────── Thời tiết (MET Norway locationforecast, lưu tạm trên máy 30 phút để đỡ gọi nhiều) ─────────────
async function layThoiTiet() {
  const KHOA = 'pb_thoi_tiet';
  try { const c = JSON.parse(localStorage.getItem(KHOA) || 'null'); if (c && Date.now() - c.luc < 30 * 60e3) return c.ts; } catch (e) { /* bỏ qua */ }
  const r = await fetch('https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=' + HN_TOA_DO.lat + '&lon=' + HN_TOA_DO.lon,
    { referrerPolicy: 'strict-origin-when-cross-origin' }); // MET nhận diện trang qua địa chỉ gốc (trình duyệt không cho đặt User-Agent)
  if (!r.ok) throw new Error('met ' + r.status);
  const ts = ((await r.json()).properties || {}).timeseries || [];
  try { localStorage.setItem(KHOA, JSON.stringify({ luc: Date.now(), ts })); } catch (e) { /* đầy bộ nhớ: bỏ qua */ }
  return ts;
}

const hnNgayGio = iso => { // giờ UTC của MET → ngày + giờ VN
  const d = new Date(Date.parse(iso) + 7 * 36e5);
  return { ngay: d.toISOString().slice(0, 10), gio: d.getUTCHours() };
};

/** Gom dữ liệu: bây giờ, 12 giờ tới (nóng/mưa), 5 ngày. */
function tomTatThoiTiet(ts, nguong) {
  const bayGio = Date.now() - 36e5;
  const ds = ts.filter(t => Date.parse(t.time) >= bayGio);
  if (!ds.length) return null;
  const ngay = {}, toi = [];
  ds.forEach((t, i) => {
    const { ngay: n, gio } = hnNgayGio(t.time), d = t.data || {}, nhiet = (d.instant || {}).details.air_temperature;
    const sau = ds[i + 1], buoc = sau ? Math.round((Date.parse(sau.time) - Date.parse(t.time)) / 36e5) : 0;
    const mua = buoc === 1 ? ((d.next_1_hours || {}).details || {}).precipitation_amount
      : buoc === 6 ? ((d.next_6_hours || {}).details || {}).precipitation_amount : undefined;
    const o = ngay[n] || (ngay[n] = { ngay: n, max: -99, min: 99, mua: 0, bt: '' });
    o.max = Math.max(o.max, nhiet); o.min = Math.min(o.min, nhiet); if (mua) o.mua += mua;
    const ky = ((d.next_6_hours || d.next_1_hours || {}).summary || {}).symbol_code;
    if (ky && (!o.bt || (gio >= 9 && gio <= 15 && !o.btTrua))) { o.bt = ky; if (gio >= 9 && gio <= 15) o.btTrua = true; }
    if (Date.parse(t.time) < Date.now() + nguong.gio_toi * 36e5 && buoc === 1) toi.push({ nhiet, mua: mua || 0 });
  });
  const dau = ds[0].data, cacNgay = Object.values(ngay).slice(0, 5);
  return {
    nhiet: Math.round(dau.instant.details.air_temperature),
    bt: ((dau.next_1_hours || dau.next_6_hours || {}).summary || {}).symbol_code || '',
    nongMax: toi.length ? Math.round(Math.max(...toi.map(x => x.nhiet))) : null,
    nong: toi.some(x => x.nhiet >= nguong.nong_c),
    mua: toi.some(x => x.mua >= nguong.mua_mm_gio),
    muaToi: Math.round(toi.reduce((s, x) => s + x.mua, 0) * 10) / 10,
    ngay: cacNgay,
  };
}

/** Mã biểu tượng MET (clearsky_day, rainshowers_night…) → hình. */
function hnBieuTuong(k) {
  k = String(k).replace(/_(day|night|polartwilight)$/, '');
  if (/thunder/.test(k)) return '⛈️';
  if (/snow|sleet/.test(k)) return '🌨️';
  if (/showers/.test(k) || k === 'lightrain') return '🌦️';
  if (/rain/.test(k)) return '🌧️';
  if (k === 'fog') return '🌫️';
  if (k === 'cloudy') return '☁️';
  if (k === 'partlycloudy') return '⛅';
  if (k === 'fair') return '🌤️';
  return k ? '☀️' : '🌿';
}

function hnThu(iso) { return ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'][new Date(iso + 'T12:00:00Z').getUTCDay()]; }

function theThoiTiet(chu, the) {
  const c = chu.thoi_tiet;
  layThoiTiet().then(ts => {
    const s = tomTatThoiTiet(ts, chu.nguong);
    if (!s) throw new Error('trong');
    const loi = s.nong ? hnThay(c.nong, { nhiet: s.nongMax }) : s.mua ? c.mua : c.binh_thuong;
    the.replaceChildren(
      h('h3', {}, c.tieu_de),
      h('div', { class: 'hn-tt-dau' }, h('span', { class: 'hn-tt-bt' }, hnBieuTuong(s.bt)), h('b', { class: 'hn-tt-do' }, s.nhiet + '°'),
        h('span', { class: 'nho' }, (s.nongMax !== null ? 'Cao nhất ' + s.nongMax + '°C' : '') + ' · mưa ' + s.muaToi + ' mm (' + chu.nguong.gio_toi + ' giờ tới)')),
      h('p', { class: 'hn-nhac' + (s.nong ? ' nong' : s.mua ? ' mua' : '') }, loi),
      (s.nong || s.mua) && c.xem_them ? h('p', { class: 'nho' }, c.xem_them) : '',
      h('div', { class: 'hn-ngay' }, s.ngay.map(n => h('div', {},
        h('span', { class: 'nho' }, n.ngay === homNay() ? 'Hôm nay' : ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date(n.ngay + 'T12:00:00Z').getUTCDay()]),
        h('i', {}, hnBieuTuong(n.bt)), h('b', {}, Math.round(n.max) + '°'), h('span', { class: 'nho' }, Math.round(n.min) + '°'),
        h('span', { class: 'hn-mm' }, n.mua >= 0.5 ? Math.round(n.mua) + ' mm' : '')))),
      h('p', { class: 'hn-ghi-cong' }, c.ghi_cong));
  }).catch(() => the.replaceChildren(h('h3', {}, c.tieu_de), h('p', { class: 'nho' }, c.loi)));
}

/** Kiểu riêng của màn Hôm nay (để ở đây cho khỏi sửa giao-dien.css). Dùng biến màu trạng thái --ok/--sap/--tre (bước 1). */
function hnKieu() {
  if (document.getElementById('kieu-hom-nay')) return;
  const s = document.createElement('style');
  s.id = 'kieu-hom-nay';
  s.textContent = '.hn-chao h2{margin:10px 0 0;color:var(--xanh-dam)}.hn-chao p{margin:2px 0 0}'
    + '.hn-tt{background:linear-gradient(160deg,#fff 40%,#eef7ea)}'
    + '.hn-tt-dau{display:flex;align-items:center;gap:10px;flex-wrap:wrap}'
    + '.hn-tt-bt{font-size:40px;line-height:1}.hn-tt-do{font-size:40px;line-height:1;color:var(--xanh-dam)}'
    + '.hn-nhac{font-size:14px;background:var(--ok-nen);color:var(--xanh-dam);border-radius:12px;padding:8px 10px;margin-top:10px}'
    + '.hn-nhac.nong{background:var(--sap-nen);color:#8a5a00}.hn-nhac.mua{background:#e6f0fa;color:#1d4f80}'
    + '.hn-ngay{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:10px;text-align:center}'
    + '.hn-ngay>div{display:flex;flex-direction:column;align-items:center;gap:1px;background:#f6faf4;border-radius:12px;padding:6px 2px}'
    + '.hn-ngay i{font-style:normal;font-size:22px;line-height:1.3}.hn-ngay .nho{font-size:11px}'
    + '.hn-mm{font-size:10px;color:#1d4f80;min-height:12px}'
    + '.hn-ghi-cong{font-size:10px;color:var(--nhat);text-align:right;margin:6px 0 0}'
    + '.hn-viec{border-top:1px solid var(--vien);padding-top:8px;margin-top:8px}'
    + '.hn-dong{display:flex;align-items:center;gap:10px;flex-wrap:wrap}'
    + '.hn-ten{flex:1;min-width:120px;display:flex;flex-direction:column}'
    + '.hn-o{flex:none;width:56px;height:56px;border-radius:14px;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--ok-nen);color:var(--ok)}'
    + '.hn-o b{font-size:20px;line-height:1.1}.hn-o span{font-size:10px;line-height:1.1}'
    + '.hn-o.sap{background:var(--sap-nen);color:#8a5a00}.hn-o.tre{background:var(--tre-nen);color:var(--tre)}'
    + '.nut.hn-nut{width:auto;align-self:flex-start;padding:8px 14px;margin-top:6px;font-size:14px}'
    + '.hn-dong{align-items:flex-start}'
    + '.hn-td{margin-top:10px}.hn-td-dau{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:14px}'
    + '.hn-thanh{height:10px;border-radius:6px;background:#eef3eb;overflow:hidden;margin:6px 0 2px}'
    + '.hn-thanh i{display:block;height:100%;border-radius:6px;background:var(--ok)}'
    + '.hn-thanh.sap i{background:var(--sap)}.hn-thanh.tre i{background:var(--tre)}';
  document.head.append(s);
}
