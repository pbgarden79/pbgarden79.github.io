// Màn hình KÍCH HOẠT: SĐT anh đã duyệt + mã in kín trên thẻ + tích đồng ý. Kiểm tra ở máy chủ (hàm kich_hoat).
function manHinhKichHoat(nd, khiXong) {
  const sdt = h('input', { type: 'tel', inputmode: 'numeric', autocomplete: 'tel', placeholder: 'Số điện thoại mua hàng', maxlength: '13' });
  const maKH = h('input', { type: 'text', autocomplete: 'one-time-code', placeholder: 'Mã kích hoạt trên thẻ chăm', maxlength: '20' });
  const dongY = h('input', { type: 'checkbox' });
  const uuDai = h('input', { type: 'checkbox' });
  const bao = h('p', { class: 'bao', role: 'alert' });
  const nut = h('button', { class: 'nut' }, 'Mở phần nâng cao');

  nut.onclick = async () => {
    bao.textContent = ''; nut.disabled = true; nut.textContent = 'Đang kiểm tra…';
    const r = await goiHam('kich_hoat', { p_sdt: sdt.value, p_ma: maKH.value, p_dong_y: dongY.checked, p_dong_y_uu_dai: uuDai.checked }, true);
    nut.disabled = false; nut.textContent = 'Mở phần nâng cao';
    const d = r.data || {};
    if (r.ok && d.ok) return khiXong(d.han);
    bao.textContent = nd.loiNhan[d.loi] || nd.loiNhan.loi_mang;
  };

  return h('section', { class: 'the' },
    h('h3', {}, '🔓 Mở phần nâng cao – miễn phí ' + nd.goi.mien_phi_ngay + ' ngày'),
    h('p', { class: 'nho' }, 'Nhắc lịch kiểm tra nước, nhật ký cây, gửi ảnh nhờ shop khám bệnh, ưu đãi thành viên.'),
    h('label', {}, 'Số điện thoại', sdt),
    h('label', {}, 'Mã kích hoạt', maKH),
    h('label', { class: 'tich' }, dongY, h('span', {}, nd.dongY)),
    h('label', { class: 'tich' }, uuDai, h('span', {}, 'Nhận ưu đãi và tin chăm cây từ Pb Garden 79 (không bắt buộc).')),
    bao, nut);
}
