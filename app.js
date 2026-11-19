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
  const [cay, combo, goi, loiNhan, lienHe, dongY] = await Promise.all(
    ['cay.json', 'combo.json', 'goi.json', 'loi-nhan.json', 'lien-he.json', 'dong-y.md'].map(lay));
  return { cay, combo, goi, loiNhan, lienHe, dongY: dongY.trim() };
}

async function khoiDong() {
  const goc = document.getElementById('app');
  const nd = await napNoiDung();
  const ma = (new URLSearchParams(location.search).get('c') || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  goc.textContent = '';
  if (!ma) { // vào thẳng trang chủ (không quét QR) → cho nhập mã cây in trên thẻ
    const o = h('input', { type: 'text', placeholder: 'Ví dụ: C001', maxlength: '10', autocapitalize: 'characters' });
    const di = () => { const v = o.value.toUpperCase().replace(/[^A-Z0-9]/g, ''); if (v) location.href = '/?c=' + v; };
    o.onkeydown = e => { if (e.key === 'Enter') di(); };
    goc.append(h('section', { class: 'the' }, h('h2', {}, '🌿 Cây của bạn'),
      h('p', {}, 'Quét mã QR trên thẻ chăm, hoặc nhập mã cây in trên thẻ:'),
      h('label', {}, 'Mã cây', o), h('button', { class: 'nut', onclick: di }, 'Xem cách chăm'), nutLienHe(nd.lienHe)));
    return;
  }
  if (!nd.combo[ma]) { // combo mới tạo từ Telegram: hỏi Supabase mã này là cây gì (chỉ loại cây + gói, không dữ liệu khách)
    const r = await sbFetch('/rest/v1/rpc/combo_cong_khai', { method: 'POST', body: { p_ma: ma } });
    if (r.ok && r.data && r.data.cay) nd.combo[ma] = { cay: r.data.cay, goi: r.data.goi || '', chau: '', gia_the: '' };
  }
  if (!nd.combo[ma] || !nd.cay[nd.combo[ma].cay]) {
    goc.append(h('section', { class: 'the' }, h('h2', {}, 'Pb Garden 79'), h('p', {}, nd.loiNhan.khong_thay_ma), nutLienHe(nd.lienHe)));
    return;
  }
  goc.append(manHinhCoBan(nd, ma));
  const vung = h('div', {});
  goc.append(vung);

  const hienKichHoat = () => { vung.textContent = ''; vung.append(manHinhKichHoat(nd, han => {
    vung.textContent = ''; vung.append(h('p', { class: 'bao xanh' }, nd.loiNhan.kich_hoat_xong + ' ' + ngayVN(han) + '.'), manHinhNangCao(nd, ma, han));
  })); };

  // Đã có phiên trên máy này → hỏi hạn dùng; chưa có → nút mở kích hoạt (chưa tạo phiên).
  const r = docPhien() ? await goiHam('han_su_dung', {}, false) : null;
  const han = r && r.ok ? r.data : null;
  if (han && han >= homNay()) vung.append(manHinhNangCao(nd, ma, han));
  else if (han) vung.append(manHinhHetHan(nd, han, hienKichHoat));
  else vung.append(h('section', { class: 'the' },
    h('h3', {}, '⭐ Phần nâng cao – miễn phí ' + nd.goi.mien_phi_ngay + ' ngày'),
    h('p', {}, 'Nhắc lịch kiểm tra nước, gửi ảnh nhờ shop khám bệnh, ưu đãi thành viên.'),
    h('button', { class: 'nut', onclick: hienKichHoat }, '🔓 Kích hoạt bằng mã trên thẻ')));
}

khoiDong().catch(() => { document.getElementById('app').textContent = 'Không tải được trang. Anh/chị kiểm tra mạng rồi tải lại.'; });
