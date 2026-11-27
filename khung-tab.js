// KHUNG TAB DƯỚI ĐÁY (bước 1 giao diện chuyên nghiệp, 27/11/2026): 4 nút Hôm nay · Vườn · Cây có vấn đề? · Thêm.
// Chỉ dùng khi máy đã kích hoạt (app.js → veTrangTab quyết định). Máy chưa kích hoạt: trang cũ, không có thanh tab.
// Mỗi tab là 1 vùng <div id="tab-…">; đổi tab = ẩn/hiện vùng, nhớ trên địa chỉ (#vuon…) để nút Quay lại của điện thoại dùng được.
// Biểu tượng: nét vẽ SVG cố định trong file này (không có dữ liệu khách) → đổi tên/biểu tượng tab sửa ở TAB_DS.
const TAB_DS = [
  { id: 'hom-nay', ten: 'Hôm nay', ve: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M2.5 12h2M19.5 12h2M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>' },
  { id: 'vuon', ten: 'Vườn', ve: '<path d="M6.5 14h11l-1.6 7H8.1z"/><path d="M12 14V9"/><path d="M12 10c0-3.3 2.2-5.5 6.5-5.5 0 3.3-2.2 5.5-6.5 5.5z"/><path d="M12 11.5c0-2.7-1.8-4.5-5.5-4.5 0 2.7 1.8 4.5 5.5 4.5z"/>' },
  { id: 'van-de', ten: 'Cây có vấn đề?', ve: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .8-1 1.5v.5"/><path d="M12 17v.01"/>' },
  { id: 'them', ten: 'Thêm', ve: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.8"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.8"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.8"/>' },
];

/** Dựng khung tab trong `goc`. Trả về { vung: { 'hom-nay': div, vuon: div, 'van-de': div, them: div }, chon(id) }. */
function khungTab(goc) {
  goc.textContent = '';
  const vung = {}, nut = {};
  TAB_DS.forEach(t => {
    vung[t.id] = h('div', { class: 'vung-tab', id: 'tab-' + t.id, role: 'tabpanel', 'aria-label': t.ten, hidden: '' });
    goc.append(vung[t.id]);
  });
  const cu = document.querySelector('nav.thanh-tab');
  if (cu) cu.remove(); // vẽ lại (vd vừa kích hoạt xong) → bỏ thanh cũ
  const thanh = h('nav', { class: 'thanh-tab', role: 'tablist', 'aria-label': 'Chuyển màn' });
  TAB_DS.forEach(t => {
    const b = h('button', { type: 'button', role: 'tab', class: 'nut-tab', 'aria-selected': 'false', onclick: () => { location.hash = t.id; } });
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + t.ve + '</svg>'; // nét vẽ cố định, không có chữ khách
    b.append(h('span', {}, t.ten));
    nut[t.id] = b;
    thanh.append(b);
  });
  document.body.append(thanh);
  document.body.classList.add('co-tab');

  let dang = null;
  const chon = id => {
    if (!vung[id]) id = 'hom-nay';
    if (id === dang) return;
    TAB_DS.forEach(t => { vung[t.id].hidden = t.id !== id; nut[t.id].setAttribute('aria-selected', String(t.id === id)); });
    if (dang) scrollTo(0, 0);
    dang = id;
  };
  window.onhashchange = () => chon(location.hash.slice(1));
  chon(location.hash.slice(1));
  return { vung, chon };
}
