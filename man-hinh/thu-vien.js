// THƯ VIỆN HƯỚNG DẪN: bài ngắn trong noi-dung/huong-dan.json (sửa chữ ở đó, không cần đụng code).
// Bài "mien_phi": true → ai cũng đọc. Bài khác → mở khi còn hạn nâng cao 7 ngày hoặc gói; chưa mở thì chỉ hiện tên + 🔒,
// bấm vào mới hiện 1 dòng nhắc nhẹ (không bật cửa sổ, không làm phiền).
// Lối vào: app.js gọi theThuVien(conHan) ở trang chủ và cuối trang cây.
//   conHan = true/false nếu đã biết hạn; bỏ trống = tự hỏi máy chủ (chỉ khi máy đã có phiên).
function theThuVien(conHan) {
  thuVienKieu();
  const the = h('section', { class: 'the thu-vien' }, h('h3', {}, '📚 Thư viện hướng dẫn'), h('p', { class: 'nho' }, 'Đang tải…'));
  const hoiHan = conHan !== undefined ? Promise.resolve(!!conHan)
    : docPhien() ? goiHam('han_su_dung', {}, false).then(r => !!(r.ok && r.data && r.data >= homNay())).catch(() => false)
    : Promise.resolve(false);
  Promise.all([fetch('/noi-dung/huong-dan.json', { cache: 'no-cache' }).then(r => r.json()), hoiHan]).then(([hd, mo]) => {
    const cc = hd.cau_chu || {};
    the.textContent = '';
    the.append(h('h3', {}, cc.tieu_de || '📚 Thư viện hướng dẫn'), cc.gioi_thieu ? h('p', { class: 'nho' }, cc.gioi_thieu) : '',
      ...(hd.bai || []).map(b => baiHuongDan(b, mo || b.mien_phi, cc)));
  }).catch(() => the.remove());
  return the;
}

/** Một bài: bấm tên để mở/đóng. Bài khóa chỉ hiện dòng nhắc nhẹ. */
function baiHuongDan(b, duocDoc, cc) {
  const ten = h('summary', {}, (b.bieu_tuong ? b.bieu_tuong + ' ' : '') + b.tieu_de, duocDoc ? '' : h('span', { class: 'khoa', 'aria-label': 'Phần nâng cao' }, '🔒'));
  if (!duocDoc) return h('details', { class: 'bai bi-khoa' }, ten, h('p', { class: 'nho' }, cc.khoa || ''));
  return h('details', { class: 'bai' }, ten,
    b.gioi_thieu ? h('p', {}, b.gioi_thieu) : '',
    h('ol', { class: 'buoc-hd' }, ...(b.buoc || []).map(s => h('li', {}, s))),
    b.nguon ? h('p', { class: 'nho' }, 'Nguồn: ', ...b.nguon.flatMap((n, i) => [
      i ? ' · ' : '', h('a', { href: n.link, target: '_blank', rel: 'noopener' }, n.ten)])) : '');
}

/** Kiểu riêng của thư viện (để ở đây cho khỏi sửa giao-dien.css dùng chung). Màu lấy biến xanh lá thương hiệu. */
function thuVienKieu() {
  if (document.getElementById('kieu-thu-vien')) return;
  const s = document.createElement('style');
  s.id = 'kieu-thu-vien';
  s.textContent = '.thu-vien details.bai{border-top:1px solid var(--vien)}'
    + '.thu-vien details.bai:last-child{border-bottom:0}'
    + '.thu-vien summary{padding:11px 0;font-weight:600;cursor:pointer;list-style:none;display:flex;align-items:center;gap:8px;color:var(--xanh-dam)}'
    + '.thu-vien summary::-webkit-details-marker{display:none}'
    + '.thu-vien summary::after{content:"›";margin-left:auto;font-size:20px;line-height:1;transition:transform .2s;color:var(--nhat)}'
    + '.thu-vien details[open] summary::after{transform:rotate(90deg)}'
    + '.thu-vien .bi-khoa summary{color:var(--nhat);font-weight:500}'
    + '.thu-vien .khoa{font-size:13px;opacity:.7}'
    + '.thu-vien ol.buoc-hd{margin:4px 0 8px;padding-left:22px;line-height:1.5}'
    + '.thu-vien ol.buoc-hd li{margin:4px 0}'
    + '.thu-vien details.bai>p{margin:4px 0 8px}';
  document.head.append(s);
}
