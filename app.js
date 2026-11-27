// ĐIỀU HƯỚNG: đọc mã cây trên QR → nạp nội dung → chọn màn hình. Không chứa nội dung chữ (xem noi-dung/).
// Địa chỉ QR: https://pbgarden79.github.io/c/C001  (404.html chuyển thành /?c=C001)

/** Tạo phần tử an toàn: chữ luôn qua textContent, không chèn HTML thô. */
function h(tag, attrs, ...con) {
  const el = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (k === 'onclick') el.onclick = v; else if (v !== undefined && v !== null) el.setAttribute(k, v);
  });
  con.flat().forEach(c => { if (c === '' || c === null || c === undefined) return; el.append(typeof c === 'string' ? document.createTextNode(c) : c); });
  return el;
}

function homNay() { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date()); }

async function napNoiDung() {
  const lay = f => fetch('noi-dung/' + f, { cache: 'no-cache' }).then(r => (f.endsWith('.json') ? r.json() : r.text()));
  const [cay, combo, goi, loiNhan, lienHe, dongY, sauBan] = await Promise.all(
    ['cay.json', 'combo.json', 'goi.json', 'loi-nhan.json', 'lien-he.json', 'dong-y.md', 'sau-ban.json'].map(lay));
  return { cay, combo, goi, loiNhan, lienHe, dongY: dongY.trim(), sauBan };
}

/** Thẻ nhập mã cây in trên thẻ chăm (trang chủ, và tab Thêm). */
function theNhapMa(nd, tieuDe) {
  const o = h('input', { type: 'text', placeholder: 'Ví dụ: C001', maxlength: '10', autocapitalize: 'characters' });
  const di = () => { const v = o.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); if (v) location.href = '/?c=' + v; };
  o.onkeydown = e => { if (e.key === 'Enter') di(); };
  return h('section', { class: 'the' }, h('h2', {}, tieuDe || '🌿 Cây của bạn'),
    h('p', {}, 'Quét mã QR trên thẻ chăm, hoặc nhập mã cây in trên thẻ:'),
    h('label', {}, 'Mã cây', o), h('button', { class: 'nut', onclick: di }, 'Xem cách chăm'), tieuDe ? '' : nutLienHe(nd.lienHe));
}

async function khoiDong() {
  const goc = document.getElementById('app');
  const nd = await napNoiDung();
  const ts = new URLSearchParams(location.search);
  let ma = (ts.get('c') || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const cayXem = ts.get('cay'); // chủ shop xem thử từng loại cây đang bán (ket-noi/chu-shop.js) → mã ảo XEM-<loại cây>
  if (!ma && cayXem && (docPhienGoc() || {}).chu && nd.cay[cayXem] && nd.cay[cayXem].ten) {
    ma = 'XEM-' + cayXem;
    nd.combo[ma] = { cay: cayXem, goi: '👑 Xem thử (chủ shop)', chau: '', gia_the: '' };
  }
  if (ma && !nd.combo[ma]) { // combo mới tạo từ Telegram: hỏi Supabase mã này là cây gì (chỉ loại cây + gói, không dữ liệu khách)
    const r = await sbFetch('/rest/v1/rpc/combo_cong_khai', { method: 'POST', body: { p_ma: ma } });
    if (r.ok && r.data && r.data.cay) nd.combo[ma] = { cay: r.data.cay, goi: r.data.goi || '', chau: '', gia_the: '' };
    else if (!r.ok && (r.status === 0 || r.status >= 500)) throw new Error('supabase combo_cong_khai ' + r.status); // máy chủ hỏng ≠ mã sai → màn dự phòng
  }
  if (ma && (!nd.combo[ma] || !nd.cay[nd.combo[ma].cay])) {
    goc.textContent = '';
    goc.append(h('section', { class: 'the' }, h('h2', {}, 'Pb Garden 79'), h('p', {}, nd.loiNhan.khong_thay_ma), nutLienHe(nd.lienHe)));
    return;
  }
  // Đã có phiên trên máy này → hỏi hạn dùng. Có hạn (còn hoặc hết) = đã kích hoạt → khung 4 tab; chưa → trang cũ.
  const r = docPhien() ? await goiHam('han_su_dung', {}, false) : null;
  const han = r && r.ok ? r.data : null;
  if (han && typeof khungTab === 'function') return veTrangTab(goc, nd, ma, han);
  veTrangCu(goc, nd, ma, han);
  // Supabase chậm/hỏng khi hỏi hạn dùng → vẫn hiện trang cũ, kèm 1 dòng báo phần nâng cao tạm chưa hiện (Dự phòng 2)
  if (r && !r.ok && (r.status === 0 || r.status >= 500) && nd.loiNhan.he_thong_cham) goc.prepend(h('p', { class: 'bao' }, nd.loiNhan.he_thong_cham));
}

/** Lời chào sau khi kích hoạt (kèm hạn) hoặc khôi phục trên máy này (hạn giữ nguyên, supabase/16). */
function loiChaoKichHoat(nd, han, khoiPhuc) {
  return khoiPhuc && nd.loiNhan.khoi_phuc_xong ? nd.loiNhan.khoi_phuc_xong : nd.loiNhan.kich_hoat_xong + ' ' + ngayVN(han) + '.';
}

/** Máy ĐÃ kích hoạt: khung 4 tab (khung-tab.js). Các tab chưa có màn mới thì dùng tạm màn đang có (bước 2–4 sẽ làm lại). */
function veTrangTab(goc, nd, ma, han, loiChao) {
  const conHan = han >= homNay();
  const t = khungTab(goc).vung;
  const daKichHoat = (hanMoi, khoiPhuc) => { layVuon(true); veTrangTab(goc, nd, ma, hanMoi, loiChaoKichHoat(nd, hanMoi, khoiPhuc)); };
  if (loiChao) t['hom-nay'].append(h('p', { class: 'bao xanh' }, loiChao));
  // Gợi ý cài app ra màn hình chính (ít bị mất phiên): chỉ khi thẻ "Cài app" của cai-app.js đang hiện cuối trang
  if (loiChao && nd.loiNhan.goi_y_cai_app && document.querySelector('.cai-app')) t['hom-nay'].append(h('p', { class: 'bao xanh' }, nd.loiNhan.goi_y_cai_app));

  // HÔM NAY (man-hinh/hom-nay.js: chào + thời tiết + việc hôm nay + tiến độ), rồi nhắc sau bán + trang cây khi mở bằng mã (?c=)
  const coHomNay = typeof manHinhHomNay === 'function';
  if (coHomNay) t['hom-nay'].append(manHinhHomNay(nd, ma, conHan));
  if (ma) {
    const phan = h('div', {});
    const hienKichHoat = () => { phan.textContent = ''; phan.append(manHinhKichHoat(nd, daKichHoat)); };
    phan.append(manHinhSauBan(nd, ma)); // mốc ngày 3/7 + chấm sao: hiện cả khi đã hết hạn
    if (conHan) phan.append(manHinhCham(nd, ma), manHinhNangCao(nd, ma, han));
    else phan.append(manHinhHetHan(nd, han, hienKichHoat));
    if (coHomNay) t['hom-nay'].append(phan.firstChild, manHinhCoBan(nd, ma), phan); // sau bán lên trước trang cây
    else t['hom-nay'].append(manHinhCoBan(nd, ma), phan);
  } else if (!coHomNay) t['hom-nay'].append(manHinhVuon(nd, ''), theNhapMa(nd));

  // VƯỜN (man-hinh/vuon-luoi.js: lưới thẻ cây + Chi tiết cây, cần hom-nay.js; thiếu file thì dùng kệ cũ ở vuon.js)
  t.vuon.append(typeof manHinhVuonLuoi === 'function' && typeof hnTrangThai === 'function' ? manHinhVuonLuoi(nd, ma, conHan) : manHinhVuon(nd, ma));

  // CÂY CÓ VẤN ĐỀ? (man-hinh/van-de.js cần biết cây nào → trang chủ thì nhắc chọn cây trong vườn)
  if (ma && typeof manHinhVanDe === 'function') t['van-de'].append(manHinhVanDe(nd, ma, conHan));
  else t['van-de'].append(h('section', { class: 'the' }, h('h3', {}, '🩺 Cây có vấn đề?'),
    h('p', { class: 'nho' }, 'Dạ anh/chị chọn cây đang gặp vấn đề trong vườn bên dưới để xem dấu hiệu và cách xử lý ạ.')), manHinhVuon(nd, ''));

  // THÊM: gói của tôi, thư viện, hỏi shop, xem cây khác, quyền riêng tư
  const goi = h('section', { class: 'the' }, h('h3', {}, '⭐ Gói của tôi'),
    h('p', { class: 'han' + (conHan ? '' : ' den-han') }, conHan
      ? 'Còn ' + soNgayConLai(han) + ' ngày · dùng đến hết ' + ngayVN(han)
      : 'Đã hết hạn ngày ' + ngayVN(han)));
  if (!conHan && ma) goi.append(h('a', { class: 'nut', href: '#hom-nay' }, 'Xem cách gia hạn'));
  t.them.append(goi);
  if (typeof theThuVien === 'function') t.them.append(theThuVien(conHan));
  t.them.append(h('section', { class: 'the' }, h('h3', {}, '💬 Hỏi shop'), nutLienHe(nd.lienHe, ma, ma && nd.combo[ma].cay)),
    theNhapMa(nd, '🔎 Xem cây khác'),
    h('section', { class: 'the' }, h('details', { class: 'gon' }, h('summary', {}, '🔒 Quyền riêng tư'), h('p', { class: 'nho' }, nd.dongY))));
}

/** Máy CHƯA kích hoạt: giữ nguyên trang cũ (cách chăm cơ bản + nút mở phần nâng cao). */
function veTrangCu(goc, nd, ma, han) {
  goc.textContent = '';
  if (!ma) { // vào thẳng trang chủ (không quét QR) → cho nhập mã cây in trên thẻ
    if (docPhien()) goc.append(manHinhVuon(nd, '')); // có phiên: hiện vườn trước ô nhập mã
    goc.append(theNhapMa(nd));
    if (typeof theThuVien === 'function') goc.append(theThuVien()); // thư viện hướng dẫn (man-hinh/thu-vien.js)
    return;
  }
  if (docPhien()) goc.append(manHinhVuon(nd, ma));
  goc.append(manHinhCoBan(nd, ma));
  const vung = h('div', {});
  goc.append(vung);

  const hienKichHoat = () => { vung.textContent = ''; vung.append(manHinhKichHoat(nd, (hanMoi, khoiPhuc) => {
    layVuon(true); // vừa kích hoạt → đọc lại vườn (bản cũ chưa có cây này)
    if (typeof khungTab === 'function') return veTrangTab(goc, nd, ma, hanMoi, loiChaoKichHoat(nd, hanMoi, khoiPhuc));
    vung.textContent = ''; vung.append(h('p', { class: 'bao xanh' }, loiChaoKichHoat(nd, hanMoi, khoiPhuc)), manHinhSauBan(nd, ma), manHinhCham(nd, ma), manHinhNangCao(nd, ma, hanMoi));
    vung.dispatchEvent(new Event('kich-hoat-xong'));
  })); };

  if (han) vung.append(manHinhSauBan(nd, ma)); // mốc ngày 3/7 + chấm sao: hiện cả khi đã hết hạn
  if (han && han >= homNay()) vung.append(manHinhCham(nd, ma), manHinhNangCao(nd, ma, han));
  else if (han) vung.append(manHinhHetHan(nd, han, hienKichHoat));
  else vung.append(h('section', { class: 'the' },
    h('h3', {}, '⭐ Phần nâng cao – miễn phí ' + nd.goi.mien_phi_ngay + ' ngày'),
    h('p', {}, 'Nhắc lịch kiểm tra nước, gửi ảnh nhờ shop khám bệnh, ưu đãi thành viên.'),
    h('button', { class: 'nut', onclick: hienKichHoat }, '🔓 Kích hoạt bằng mã trên thẻ')));
  if (typeof manHinhVanDe === 'function') { // "Cây có vấn đề?" ngay dưới cách chăm (man-hinh/van-de.js); vừa kích hoạt xong thì hiện đủ
    let vd = manHinhVanDe(nd, ma, !!(han && han >= homNay()));
    vung.before(vd);
    vung.addEventListener('kich-hoat-xong', () => { const moi = manHinhVanDe(nd, ma, true); vd.replaceWith(moi); vd = moi; });
  }
  if (typeof theThuVien === 'function') { // thư viện hướng dẫn: bài khóa mở khi còn hạn; vừa kích hoạt xong thì vẽ lại
    let tv = theThuVien(!!(han && han >= homNay()));
    goc.append(tv);
    vung.addEventListener('kich-hoat-xong', () => { const moi = theThuVien(true); tv.replaceWith(moi); tv = moi; });
  }
}

// Dự phòng 2 (27/11): xong → báo bao-loi.js trang đã hiện; hỏng → màn dự phòng (cách chăm cơ bản / Hỏi shop / Tải lại) + báo lỗi về shop
khoiDong().then(() => { if (window.pbDaVe) pbDaVe(); }, e => {
  if (window.pbDuPhong) return pbDuPhong('khoi_dong', e && (e.message || String(e)));
  document.getElementById('app').textContent = 'Không tải được trang. Anh/chị kiểm tra mạng rồi tải lại.';
});
