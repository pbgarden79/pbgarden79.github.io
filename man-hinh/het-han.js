// Màn hình HẾT HẠN: hết thời gian miễn phí, chưa có gói. Hai cách gia hạn: mua cây mới (mã mới) hoặc gói tháng/năm.
function manHinhHetHan(nd, han, moKichHoat) {
  const g = nd.goi;
  const goi = x => h('div', { class: 'goi' + (x.nhan ? ' noi-bat' : '') },
    x.nhan ? h('span', { class: 'nhan' }, x.nhan) : '',
    h('strong', {}, x.ten), h('div', { class: 'gia' }, x.gia), h('div', { class: 'nho' }, x.moi_ngay));
  return h('section', { class: 'the' },
    h('h3', {}, '⏳ Phần nâng cao đã hết hạn' + (han ? ' (' + ngayVN(han) + ')' : '')),
    h('p', {}, 'Cách chăm cơ bản ở trên vẫn dùng miễn phí. Muốn dùng tiếp phần nâng cao, anh/chị chọn:'),
    h('h3', {}, '🪴 Mua cây mới'),
    h('p', {}, 'Mỗi cây mới kèm mã kích hoạt mới, thêm ' + g.mien_phi_ngay + ' ngày miễn phí.'),
    h('button', { class: 'nut phu', onclick: moKichHoat }, 'Nhập mã của cây mới'),
    h('h3', {}, '⭐ Đăng ký gói'),
    h('div', { class: 'cac-goi' }, goi(g.thang), goi(g.nam)),
    h('p', { class: 'nho' }, g.thanh_toan),
    h('a', { class: 'nut', href: nd.lienHe.messenger, target: '_blank', rel: 'noopener' }, '💬 Nhắn shop đăng ký gói'));
}
