// Màn hình SAU BÁN: theo ngày kể từ lúc kích hoạt → lời nhắc đúng mốc, chấm sao, gợi ý mua thêm. Chữ ở noi-dung/sau-ban.json.
// Chỉ hiện cho máy đã kích hoạt ĐÚNG mã cây này (hàm sau_ban_cua_toi trong supabase/07_sau_ban.sql).
function manHinhSauBan(nd, ma) {
  const vung = h('div', {});
  goiHam('sau_ban_cua_toi', { p_ma: ma }, false).then(r => {
    if (r.ok && r.data && r.data.kich_hoat) vung.append(veSauBan(nd, ma, r.data));
  });
  return vung;
}

function veSauBan(nd, ma, d) {
  const sb = nd.sauBan, ngay = Math.max(0, Math.round(
    (Date.parse(homNay() + 'T00:00:00+07:00') - Date.parse(d.kich_hoat + 'T00:00:00+07:00')) / 864e5));
  const moc = sb.moc.find(m => ngay >= m.tu_ngay && ngay <= m.den_ngay);
  if (!moc) return '';
  const cay = nd.cay[nd.combo[ma].cay];
  const the = h('section', { class: 'the sau-ban' },
    h('h3', {}, moc.tieu_de.replace('{ngay}', ngay)), h('p', {}, moc.loi));
  if (moc.nut === 'kham') the.append(h('a', { class: 'nut phu', href: nd.lienHe.messenger, target: '_blank', rel: 'noopener' }, '💬 Gửi ảnh cho shop'));
  if (moc.nut === 'danh_gia') {
    the.append(oDanhGia(sb.danh_gia, ma, d));
    if (cay.di_kem_duyet && (cay.di_kem || []).length) {
      the.append(h('h3', {}, sb.di_kem_tieu_de),
        h('ul', { class: 'cham' }, cay.di_kem.map(x => h('li', {}, h('strong', {}, x.ten), h('br', {}), h('span', { class: 'nho' }, x.vi_sao)))),
        h('a', { class: 'nut phu', href: nd.lienHe.messenger, target: '_blank', rel: 'noopener' }, '💬 Hỏi shop giá'));
    }
  }
  return the;
}

function oDanhGia(chu, ma, d) {
  let sao = d.so_sao || 0;
  const hang = h('div', { class: 'sao', role: 'radiogroup', 'aria-label': 'Chấm sao' });
  const veSao = () => hang.querySelectorAll('button').forEach((b, i) => { b.textContent = i < sao ? '★' : '☆'; b.setAttribute('aria-checked', i + 1 === sao); });
  for (let i = 1; i <= 5; i++) hang.append(h('button', { type: 'button', role: 'radio', 'aria-label': i + ' sao', onclick: () => { sao = i; veSao(); } }, '☆'));
  veSao();
  const gc = h('textarea', { maxlength: '300', rows: '2', placeholder: chu.ghi_chu_goi_y });
  gc.value = d.ghi_chu || '';
  const bao = h('p', { class: 'bao' }), nut = h('button', { class: 'nut' }, d.so_sao ? 'Sửa đánh giá' : 'Gửi đánh giá');
  nut.onclick = async () => {
    if (!sao) { bao.textContent = 'Anh/chị chọn số sao trước nhé.'; return; }
    nut.disabled = true; bao.className = 'bao'; bao.textContent = '';
    const r = await goiHam('gui_danh_gia', { p_ma: ma, p_sao: sao, p_ghi_chu: gc.value.trim() }, false);
    nut.disabled = false;
    if (r.ok && r.data && r.data.chu_shop) { bao.className = 'bao xanh'; bao.textContent = '👑 Chế độ chủ shop: bấm thử, không ghi đè đánh giá của khách.'; return; }
    if (r.ok && r.data && r.data.ok) { bao.className = 'bao xanh'; bao.textContent = sao <= 3 ? chu.cam_on_thap : chu.cam_on; nut.textContent = 'Sửa đánh giá'; }
    else bao.textContent = 'Chưa gửi được, anh/chị thử lại sau ít phút.';
  };
  return h('div', {}, hang, h('label', {}, gc), nut, bao, h('p', { class: 'nho' }, chu.luu_y));
}
