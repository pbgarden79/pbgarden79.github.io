// Màn hình KÍCH HOẠT: SĐT anh đã duyệt + mã in kín trên thẻ + tích đồng ý. Kiểm tra ở máy chủ (hàm kich_hoat).
// 27/11: thêm chế độ "Khôi phục trên máy này" (hàm khoi_phuc, supabase/16_khoi_phuc_may.sql) cho khách đã kích hoạt
// nhưng máy mất phiên (Safari xóa dữ liệu, đổi máy/trình duyệt). kich_hoat cũng tự khôi phục khi mã đã dùng + đúng SĐT.
// khiXong(han, khoiPhuc): khoiPhuc = true khi máy chủ báo là khôi phục (lời chào khác).
function manHinhKichHoat(nd, khiXong) {
  const sdt = h('input', { type: 'tel', inputmode: 'numeric', autocomplete: 'tel', placeholder: 'Số điện thoại mua hàng', maxlength: '13' });
  const maKH = h('input', { type: 'text', autocomplete: 'one-time-code', placeholder: 'Mã kích hoạt trên thẻ chăm', maxlength: '20' });
  const dongY = h('input', { type: 'checkbox' });
  const uuDai = h('input', { type: 'checkbox' });
  const bao = h('p', { class: 'bao', role: 'alert' });
  const nut = h('button', { class: 'nut' }, 'Mở phần nâng cao');
  const tieuDe = h('h3', {}, '🔓 Mở phần nâng cao – miễn phí ' + nd.goi.mien_phi_ngay + ' ngày');
  const moTa = h('p', { class: 'nho' }, 'Nhắc lịch kiểm tra nước, nhật ký cây, gửi ảnh nhờ shop khám bệnh, ưu đãi thành viên.');
  const oDongY = h('label', { class: 'tich' }, dongY, h('span', {}, nd.dongY));
  const oUuDai = h('label', { class: 'tich' }, uuDai, h('span', {}, 'Nhận ưu đãi và tin chăm cây từ Pb Garden 79 (không bắt buộc).'));
  // nút dạng chữ gạch chân (kiểu nằm luôn ở đây để không phải sửa giao-dien.css)
  const doiChe = h('button', { type: 'button', style: 'background:none;border:0;padding:4px 0;font:inherit;color:var(--xanh-dam);text-decoration:underline;cursor:pointer;text-align:left' });
  let khoiPhuc = false;

  // 0 = +84 (26/11): "+84 888 200 077", "84888200077", "0084…" → "0888200077" trước khi gửi máy chủ
  const chuanSdt = v => { let s = String(v || '').replace(/[^0-9]/g, '').replace(/^00/, ''); if (/^84\d{9}$/.test(s)) s = '0' + s.slice(2); return s; };
  const chuNut = () => (khoiPhuc ? 'Khôi phục' : 'Mở phần nâng cao');

  const veChe = () => {
    bao.textContent = '';
    tieuDe.textContent = khoiPhuc ? '🔁 Khôi phục trên máy này' : '🔓 Mở phần nâng cao – miễn phí ' + nd.goi.mien_phi_ngay + ' ngày';
    moTa.textContent = khoiPhuc
      ? 'Dạ nếu anh/chị đã kích hoạt rồi mà đổi máy, đổi trình duyệt hoặc lâu ngày không mở nên trang hỏi lại, anh/chị nhập đúng số điện thoại và mã trên thẻ để mở lại ạ. Hạn dùng vẫn giữ nguyên.'
      : 'Nhắc lịch kiểm tra nước, nhật ký cây, gửi ảnh nhờ shop khám bệnh, ưu đãi thành viên.';
    oDongY.style.display = oUuDai.style.display = khoiPhuc ? 'none' : ''; // đã đồng ý lúc kích hoạt lần đầu
    nut.textContent = chuNut();
    doiChe.textContent = khoiPhuc ? '← Kích hoạt thẻ mới' : 'Đã kích hoạt trước đây? Khôi phục trên máy này';
  };
  doiChe.onclick = () => { khoiPhuc = !khoiPhuc; veChe(); };

  nut.onclick = async () => {
    bao.textContent = '';
    if (!maKH.value.trim()) { bao.textContent = 'Dạ anh/chị nhập mã kích hoạt in trên thẻ chăm giúp shop ạ.'; maKH.focus(); return; }
    nut.disabled = true; nut.textContent = 'Đang kiểm tra…';
    const r = khoiPhuc
      ? await goiHam('khoi_phuc', { p_sdt: chuanSdt(sdt.value), p_ma: maKH.value }, true)
      : await goiHam('kich_hoat', { p_sdt: chuanSdt(sdt.value), p_ma: maKH.value, p_dong_y: dongY.checked, p_dong_y_uu_dai: uuDai.checked }, true);
    nut.disabled = false; nut.textContent = chuNut();
    const d = r.data || {};
    if (r.ok && d.ok) return khiXong(d.han, !!d.khoi_phuc);
    bao.textContent = nd.loiNhan[d.loi] || (typeof chuShopLoi === 'function' && chuShopLoi(d.loi)) || nd.loiNhan.loi_mang;
  };

  veChe();
  return h('section', { class: 'the' },
    tieuDe, moTa,
    h('label', {}, 'Số điện thoại', h('span', { class: 'nho' }, ' (0… hoặc +84… đều được)'), sdt),
    h('label', {}, 'Mã kích hoạt', maKH),
    oDongY, oUuDai,
    bao, nut, h('p', { class: 'nho' }, doiChe));
}
