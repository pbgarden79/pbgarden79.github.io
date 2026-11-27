// Màn hình KÍCH HOẠT: SĐT anh đã duyệt + mã in kín trên thẻ + tích đồng ý. Kiểm tra ở máy chủ (hàm kich_hoat).
function manHinhKichHoat(nd, khiXong) {
  const sdt = h('input', { type: 'tel', inputmode: 'numeric', autocomplete: 'tel', placeholder: 'Số điện thoại mua hàng', maxlength: '13' });
  const maKH = h('input', { type: 'text', autocomplete: 'one-time-code', placeholder: 'Mã kích hoạt trên thẻ chăm', maxlength: '20' });
  const dongY = h('input', { type: 'checkbox' });
  const uuDai = h('input', { type: 'checkbox' });
  const bao = h('p', { class: 'bao', role: 'alert' });
  const nut = h('button', { class: 'nut' }, 'Mở phần nâng cao');

  // 0 = +84 (26/11): "+84 888 200 077", "84888200077", "0084…" → "0888200077" trước khi gửi máy chủ
  const chuanSdt = v => { let s = String(v || '').replace(/[^0-9]/g, '').replace(/^00/, ''); if (/^84\d{9}$/.test(s)) s = '0' + s.slice(2); return s; };

  nut.onclick = async () => {
    bao.textContent = '';
    if (!maKH.value.trim()) { bao.textContent = 'Dạ anh/chị nhập mã kích hoạt in trên thẻ chăm giúp shop ạ.'; maKH.focus(); return; }
    nut.disabled = true; nut.textContent = 'Đang kiểm tra…';
    const r = await goiHam('kich_hoat', { p_sdt: chuanSdt(sdt.value), p_ma: maKH.value, p_dong_y: dongY.checked, p_dong_y_uu_dai: uuDai.checked }, true);
    nut.disabled = false; nut.textContent = 'Mở phần nâng cao';
    const d = r.data || {};
    if (r.ok && d.ok) return khiXong(d.han);
    bao.textContent = nd.loiNhan[d.loi] || (typeof chuShopLoi === 'function' && chuShopLoi(d.loi)) || nd.loiNhan.loi_mang;
  };

  return h('section', { class: 'the' },
    h('h3', {}, '🔓 Mở phần nâng cao – miễn phí ' + nd.goi.mien_phi_ngay + ' ngày'),
    h('p', { class: 'nho' }, 'Nhắc lịch kiểm tra nước, nhật ký cây, gửi ảnh nhờ shop khám bệnh, ưu đãi thành viên.'),
    h('label', {}, 'Số điện thoại', h('span', { class: 'nho' }, ' (0… hoặc +84… đều được)'), sdt),
    h('label', {}, 'Mã kích hoạt', maKH),
    h('label', { class: 'tich' }, dongY, h('span', {}, nd.dongY)),
    h('label', { class: 'tich' }, uuDai, h('span', {}, 'Nhận ưu đãi và tin chăm cây từ Pb Garden 79 (không bắt buộc).')),
    bao, nut);
}
