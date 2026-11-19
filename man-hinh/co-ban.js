// Màn hình CƠ BẢN: luôn miễn phí, không cần đăng nhập. Ai quét QR cũng thấy.
function manHinhCoBan(nd, ma) {
  const combo = nd.combo[ma], cay = nd.cay[combo.cay];
  return h('section', { class: 'the' },
    h('p', { class: 'nho' }, 'Mã ' + ma + ' · ' + combo.goi),
    h('h2', {}, cay.bieu_tuong + ' ' + cay.ten),
    h('p', {}, [combo.chau, combo.gia_the].filter(Boolean).join(' · ')),
    h('h3', {}, 'Cách chăm cây này'),
    h('ul', { class: 'cham' }, ...cay.cham.map(dong => h('li', {}, dong))),
    cay.nguon ? h('p', { class: 'nho' }, 'Nguồn: ', ...cay.nguon.flatMap((n, i) => [
      i ? ' · ' : '', h('a', { href: n.link, target: '_blank', rel: 'noopener' }, n.ten)])) : '',
    nutLienHe(nd.lienHe));
}

function nutLienHe(lh) {
  return h('div', { class: 'lien-he' },
    h('a', { class: 'nut phu', href: lh.messenger, target: '_blank', rel: 'noopener' }, '💬 Nhắn Pb Garden 79'),
    h('p', { class: 'nho' },
      h('a', { href: lh.fanpage, target: '_blank', rel: 'noopener' }, 'Fanpage'), ' · ',
      h('a', { href: lh.instagram, target: '_blank', rel: 'noopener' }, 'Instagram')));
}
