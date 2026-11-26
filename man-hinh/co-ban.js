// Màn hình CƠ BẢN: luôn miễn phí, không cần đăng nhập. Ai quét QR cũng thấy.
function manHinhCoBan(nd, ma) {
  const combo = nd.combo[ma], cay = nd.cay[combo.cay];
  return h('section', { class: 'the' },
    h('p', { class: 'nho' }, 'Mã ' + ma + ' · ' + combo.goi),
    h('h2', {}, cay.bieu_tuong + ' ' + cay.ten),
    anhCay(cay),
    h('p', {}, [combo.chau, combo.gia_the].filter(Boolean).join(' · ')),
    h('h3', {}, 'Cách chăm cây này'),
    h('ul', { class: 'cham' }, ...cay.cham.map(dong => h('li', {}, dong))),
    cay.nguon ? h('p', { class: 'nho' }, 'Nguồn: ', ...cay.nguon.flatMap((n, i) => [
      i ? ' · ' : '', h('a', { href: n.link, target: '_blank', rel: 'noopener' }, n.ten)])) : '',
    nutLienHe(nd.lienHe, ma, combo.cay));
}

/** Ảnh cây (mục "anh" trong cay.json) + dòng ghi công bắt buộc theo giấy phép CC. Không có ảnh → bỏ qua.
 *  Ảnh lỗi tải → ẩn cả khung, trang vẫn hiện biểu tượng như cũ. */
function anhCay(cay) {
  const a = cay.anh;
  if (!a || !/^https:\/\//.test(a.link || '')) return '';
  const khung = h('figure', { class: 'anh-cay' },
    h('img', { src: a.link, alt: 'Ảnh minh họa ' + cay.ten, loading: 'lazy', decoding: 'async' }),
    h('figcaption', { class: 'nho' }, 'Ảnh: ',
      a.trang ? h('a', { href: a.trang, target: '_blank', rel: 'noopener' },
        [a.tac_gia, a.giay_phep, 'Wikimedia Commons'].filter(Boolean).join(', '))
        : [a.tac_gia, a.giay_phep].filter(Boolean).join(', ')));
  khung.querySelector('img').onerror = () => khung.remove();
  return khung;
}

/** Nút nhắn shop. Có mã combo → link m.me kèm ?ref=<mã combo>_<mã cây> để shop biết khách hỏi cây nào
 *  (CHỈ mã combo + mã cây, không SĐT/tên). Edge Function "messenger" đọc referral.ref. */
function nutLienHe(lh, ma, maCay) {
  const ref = ma ? [ma, maCay].filter(Boolean).join('_').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 200) : '';
  const link = ref ? lh.messenger + (lh.messenger.includes('?') ? '&' : '?') + 'ref=' + encodeURIComponent(ref) : lh.messenger;
  return h('div', { class: 'lien-he' },
    h('a', { class: 'nut phu', href: link, target: '_blank', rel: 'noopener' }, ma ? '💬 Hỏi shop về cây này' : '💬 Nhắn Pb Garden 79'),
    ma ? h('p', { class: 'nho' }, 'Dạ anh/chị nhắn kèm mã ' + ma + ' giúp shop để được hỗ trợ nhanh hơn ạ.') : '',
    h('p', { class: 'nho' },
      h('a', { href: lh.fanpage, target: '_blank', rel: 'noopener' }, 'Fanpage'), ' · ',
      h('a', { href: lh.instagram, target: '_blank', rel: 'noopener' }, 'Instagram')));
}
