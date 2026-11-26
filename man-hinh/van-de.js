// Mục "Cây có vấn đề?" ở trang cây: chọn dấu hiệu → nguyên nhân hay gặp + việc nên làm + nguồn → nút Hỏi shop.
// Nội dung chữ: noi-dung/van-de.json (mỗi dấu hiệu có nguồn uy tín, không khuyên thuốc).
// du = true khi còn hạn nâng cao / gói → thấy đủ dấu hiệu; false → chỉ dấu hiệu có "mien_phi": true.
function manHinhVanDe(nd, ma, du) {
  const khung = h('section', { class: 'the van-de' });
  fetch('noi-dung/van-de.json', { cache: 'no-cache' }).then(r => r.json())
    .then(vd => veVanDe(khung, vd, nd, ma, du)).catch(() => khung.remove());
  return khung;
}

function veVanDe(khung, vd, nd, ma, du) {
  const cc = vd.cau_chu, ds = vd.dau_hieu.filter(d => du || d.mien_phi);
  const conKhoa = vd.dau_hieu.length - ds.length;
  const chiTiet = h('div', { class: 'vd-chi-tiet' });
  const danhSach = (tieuDe, mang) => mang && mang.length ? [h('h3', {}, tieuDe), h('ul', { class: 'cham' }, ...mang.map(x => h('li', {}, x)))] : [];
  const nut = ds.map(d => {
    const b = h('button', { type: 'button', class: 'vd-nut', 'aria-expanded': 'false', onclick: () => chon(d, b) }, d.bieu_tuong + ' ' + d.ten);
    return b;
  });
  function chon(d, b) {
    const mo = b.getAttribute('aria-expanded') !== 'true';
    nut.forEach(x => x.setAttribute('aria-expanded', String(x === b && mo)));
    chiTiet.textContent = '';
    if (!mo) return;
    chiTiet.append(
      ...danhSach(cc.nguyen_nhan, d.nguyen_nhan),
      ...danhSach(cc.nen_lam, d.nen_lam),
      d.nguon ? h('p', { class: 'nho' }, 'Nguồn: ', ...d.nguon.flatMap((n, i) => [
        i ? ' · ' : '', h('a', { href: n.link, target: '_blank', rel: 'noopener' }, n.ten)])) : '',
      h('p', { class: 'vd-hoi' }, cc.hoi_shop),
      nutLienHe(nd.lienHe, ma, nd.combo[ma].cay));
    chiTiet.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  khung.append(
    h('h3', {}, cc.tieu_de),
    h('p', { class: 'nho' }, cc.gioi_thieu),
    h('div', { class: 'vd-ds' }, ...nut),
    chiTiet,
    conKhoa > 0 ? h('p', { class: 'nho vd-khoa' }, cc.khoa.replace('{n}', conKhoa)) : '',
    h('p', { class: 'nho' }, cc.ghi_chu));
}
