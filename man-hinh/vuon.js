// VƯỜN CỦA TÔI + NHẬT KÝ CHĂM + LỊCH (duyệt 24/11/2026). Dữ liệu: hàm vuon_cua_toi, ghi_cham (supabase/09_nhat_ky_cham.sql).
// Nút là "Đã kiểm tra nước" (không phải "đã tưới"): theo cách chăm có nguồn, kiểm tra rồi mới tưới. Chu kỳ = kiem_tra_ngay trong cay.json.
let _vuon = null;
function layVuon(moi) {
  if (moi || !_vuon) _vuon = goiHam('vuon_cua_toi', {}, false).then(r => (r.ok && Array.isArray(r.data) ? r.data : []));
  return _vuon;
}

const ngayCong = (iso, n) => new Date(Date.parse(iso + 'T12:00:00Z') + n * 864e5).toISOString().slice(0, 10);

/** Trạng thái chăm của 1 combo: lần cuối, lần tới, đến hạn chưa. */
function trangThaiCham(c, cay) {
  const ds = (c.ngay_cham || []).slice().sort(), cuoi = ds[ds.length - 1] || null;
  const toi = ngayCong(cuoi || c.kich_hoat, cay.kiem_tra_ngay);
  return { ds, cuoi, toi, denHan: homNay() >= toi };
}

/** Thẻ cây cho kệ "Vườn của tôi" (trang chủ và đầu trang từng cây). */
function manHinhVuon(nd, maDangXem) {
  const vung = h('div', {});
  layVuon().then(ds => {
    ds = ds.filter(c => nd.cay[c.cay]);
    if (!ds.length) return;
    const the = c => {
      const cay = nd.cay[c.cay], t = trangThaiCham(c, cay);
      return h('a', { class: 'the-cay' + (c.ma === maDangXem ? ' dang-xem' : ''), href: '/?c=' + c.ma },
        h('span', { class: 'bt' }, cay.bieu_tuong || '🌿'), h('b', {}, cay.ten.replace(/\s*\(.*\)$/, '')),
        h('span', { class: 'nho' }, c.ma), h('span', { class: 'nhan-tt' + (t.denHan ? ' han' : '') }, t.denHan ? '💧 Đến hạn' : '🙂 Đã chăm'));
    };
    const soHan = ds.filter(c => trangThaiCham(c, nd.cay[c.cay]).denHan).length;
    vung.append(h('section', { class: 'the' }, h('h3', {}, '🪴 Vườn của tôi'),
      h('p', { class: 'nho' }, soHan ? soHan + ' cây đến hạn kiểm tra nước' : 'Mọi cây đều đã được chăm 🙂'),
      h('div', { class: 'ke-cay' }, ds.map(the),
        h('a', { class: 'the-cay them', href: nd.lienHe.messenger, target: '_blank', rel: 'noopener' },
          h('span', { class: 'bt' }, '＋'), h('b', {}, 'Thêm cây'), h('span', { class: 'nho' }, 'Hỏi shop')))));
  });
  return vung;
}

/** Thẻ "Kiểm tra nước" + lịch tháng cho combo đang xem (phần nâng cao, còn hạn). */
function manHinhCham(nd, ma) {
  const vung = h('div', {});
  const ve = ds => {
    const c = ds.find(x => x.ma === ma) // chủ shop xem thử loại cây chưa có combo → thẻ giả, bấm không ghi gì
      || (typeof laMaXem === 'function' && laMaXem(ma) && { ma, cay: nd.combo[ma].cay, kich_hoat: homNay(), ngay_cham: [] });
    vung.textContent = '';
    if (!c) return;
    const cay = nd.cay[c.cay], t = trangThaiCham(c, cay);
    const bao = h('p', { class: 'bao' }), nut = h('button', { class: 'nut' }, '💧 Đã kiểm tra nước');
    nut.onclick = async () => {
      nut.disabled = true;
      const r = await goiHam('ghi_cham', { p_ma: ma }, false);
      if (r.ok && r.data && r.data.chu_shop) { bao.className = 'bao xanh'; bao.textContent = '👑 Chế độ chủ shop: bấm thử, không ghi vào nhật ký của khách.'; return; }
      if (r.ok && r.data && r.data.ok) ve(await layVuon(true));
      else { nut.disabled = false; bao.textContent = 'Chưa ghi được, anh/chị thử lại sau ít phút.'; }
    };
    vung.append(h('section', { class: 'the' },
      h('h3', {}, '💧 Kiểm tra nước'),
      h('p', { class: 'han' + (t.denHan ? ' den-han' : '') }, t.denHan ? '💧 Đến hạn kiểm tra nước' : '🙂 Đã chăm'),
      h('p', { class: 'nho' }, (t.cuoi ? 'Lần cuối: ' + ngayVN(t.cuoi) : 'Chưa ghi lần kiểm tra nào') + ' · ' + (t.toi < homNay()
        ? 'trễ ' + Math.round((Date.parse(homNay()) - Date.parse(t.toi)) / 864e5) + ' ngày' : 'Lần tới: ' + ngayVN(t.toi))),
      h('p', { class: 'nho' }, 'Nhìn mực nước bể chậu, cạn mới đổ. Kiểm tra xong bấm nút để ghi lại.'),
      t.cuoi === homNay() ? h('p', { class: 'bao xanh' }, '✅ Hôm nay đã ghi.') : nut, bao,
      lichCham(t)));
  };
  layVuon().then(ve);
  // Nhật ký ảnh (man-hinh/nhat-ky-anh.js) đi cùng Kiểm tra nước: cùng điều kiện còn hạn nâng cao/gói.
  return typeof manHinhNhatKyAnh === 'function' ? h('div', {}, vung, manHinhNhatKyAnh(nd, ma)) : vung;
}

/** Lịch tháng: chấm xanh = ngày đã kiểm tra, viền = ngày đến hạn kế tiếp. Tuần bắt đầu thứ Hai. */
function lichCham(t) {
  const daCham = new Set(t.ds), hn = homNay();
  let [y, m] = hn.split('-').map(Number);
  const khung = h('div', { class: 'lich' });
  const ve = () => {
    const dau = new Date(Date.UTC(y, m - 1, 1)), soNgay = new Date(Date.UTC(y, m, 0)).getUTCDate(), lech = (dau.getUTCDay() + 6) % 7;
    const o = [];
    for (let i = 0; i < lech; i++) o.push(h('span', {}));
    for (let d = 1; d <= soNgay; d++) {
      const iso = y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      o.push(h('span', { class: [daCham.has(iso) && 'co', iso === t.toi && 'toi', iso === hn && 'nay'].filter(Boolean).join(' ') }, String(d)));
    }
    const doi = n => () => { m += n; if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; } ve(); };
    khung.replaceChildren(
      h('div', { class: 'lich-dau' }, h('button', { type: 'button', 'aria-label': 'Tháng trước', onclick: doi(-1) }, '‹'),
        h('b', {}, 'Tháng ' + m + '/' + y), h('button', { type: 'button', 'aria-label': 'Tháng sau', onclick: doi(1) }, '›')),
      h('div', { class: 'lich-luoi' }, ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(x => h('i', {}, x)), o),
      h('p', { class: 'nho' }, '🟢 đã kiểm tra · ◯ lần tới'));
  };
  ve();
  return khung;
}
