// TAB "CÂY CÓ VẤN ĐỀ?" (bước 4 giao diện chuyên nghiệp, 27/11/2026) – chỉ máy đã kích hoạt (app.js → veTrangTab).
// Luồng: (1) chọn cây trong vườn (thẻ nhỏ có ảnh + chấm màu, dùng lại vlAnhNho của vuon-luoi.js, hnTrangThai của hom-nay.js;
//        vườn 1 cây / mở bằng ?c= → chọn sẵn) → (2) lưới thẻ dấu hiệu → (3) kết quả: nguyên nhân + việc nên làm + nguồn + Hỏi shop kèm mã.
// Địa chỉ: #van-de · #van-de/<mã cây> · #van-de/<mã cây>/<mã dấu hiệu> → nút Quay lại của điện thoại đi lùi từng bước.
// Nội dung chăm cây: noi-dung/van-de.json (DÙNG CHUNG với man-hinh/van-de.js của trang cũ; anh duyệt 26/11). Chữ riêng của tab: cau_chu.tab.
// Không khuyên thuốc. Dấu hiệu khóa (hết hạn): hiện 🔒, bấm vào → lời mời gia hạn (câu "khoa" đã duyệt).
let _vdtChu = null;
function vdtChu() {
  if (!_vdtChu) _vdtChu = fetch('/noi-dung/van-de.json', { cache: 'no-cache' }).then(r => r.json());
  return _vdtChu;
}

/** Tab Cây có vấn đề?. ma = mã đang mở bằng ?c= hoặc ''. conHan = còn hạn nâng cao/gói (đủ 8 dấu hiệu). */
function manHinhVanDeTab(nd, ma, conHan) {
  vdtKieu();
  if (typeof vlKieu === 'function') vlKieu(); // .vl-anh, .cham-sk
  const vung = h('div', { class: 'vdt' }, h('p', { class: 'nho' }, 'Đang tải…'));
  let vd = null, ds = null;
  const diaChi = () => {
    const p = location.hash.slice(1).split('/');
    return p[0] === 'van-de' ? { cay: decodeURIComponent(p[1] || '').toUpperCase(), dh: decodeURIComponent(p[2] || '') } : null;
  };
  const ve = () => {
    if (!vd || !ds) return;
    const d = diaChi() || { cay: '', dh: '' };
    // cây đang chọn: theo địa chỉ → mã mở bằng ?c= → vườn chỉ 1 cây
    const c = ds.find(x => x.ma.toUpperCase() === d.cay) || ds.find(x => x.ma === ma) || (ds.length === 1 ? ds[0] : null);
    const dh = c && vd.dau_hieu.find(x => x.ma === d.dh);
    vung.replaceChildren(...(dh ? veKetQua(c, dh) : veChon(c)));
  };
  const nap = moi => layVuon(moi).then(d => {
    ds = d.filter(c => nd.cay[c.cay]);
    // mã mở bằng ?c= mà không có trong vườn (xem combo khác, chủ shop xem thử) → vẫn cho chọn, không chấm màu
    if (ma && nd.combo[ma] && nd.cay[nd.combo[ma].cay] && !ds.some(c => c.ma === ma)) ds.unshift({ ma, cay: nd.combo[ma].cay, ngoai: true });
    ve();
  });
  vdtChu().then(j => { vd = j; return nap(); })
    .catch(() => vung.replaceChildren(ma && typeof manHinhVanDe === 'function' ? manHinhVanDe(nd, ma, conHan) : '')); // lỗi → màn cũ
  const doi = () => { if (vung.isConnected) nap(); else document.removeEventListener('vuon-doi', doi); };
  document.addEventListener('vuon-doi', doi); // vừa kiểm tra nước → chấm màu đổi
  const doiDiaChi = () => {
    if (!vung.isConnected) return window.removeEventListener('hashchange', doiDiaChi);
    if (!diaChi()) return;
    ve(); scrollTo(0, 0);
  };
  window.addEventListener('hashchange', doiDiaChi);

  const theCayNho = (c, chon) => { // thẻ nhỏ: ảnh loại cây + chấm sức khỏe + tên + mã
    const cay = nd.cay[c.cay], anh = vlAnhNho(cay);
    if (!c.ngoai && c.kich_hoat) anh.append(h('span', { class: 'cham-sk ' + hnTrangThai(c, cay).mau, 'aria-hidden': 'true' }));
    return h('a', { class: 'vdt-cay' + (chon ? ' chon' : ''), href: '#van-de/' + encodeURIComponent(c.ma), 'aria-current': chon ? 'true' : null },
      anh, h('b', {}, vlTen(cay)), h('span', { class: 'nho' }, c.ma));
  };

  // ───── Bước 1 + 2: chọn cây, chọn dấu hiệu ─────
  function veChon(c) {
    const cc = vd.cau_chu, T = cc.tab || {};
    const b1 = h('section', { class: 'the' }, h('h3', {}, cc.tieu_de));
    if (!ds.length) { b1.append(h('p', { class: 'nho' }, T.vuon_trong), nutLienHe(nd.lienHe)); return [b1]; }
    if (ds.length > 1) {
      b1.append(h('p', { class: 'vdt-buoc' }, T.buoc_cay), !c ? h('p', { class: 'nho' }, T.buoc_cay_nho) : '');
      const hang = h('div', { class: 'vdt-hang' }, ...ds.map(x => theCayNho(x, c && x.ma === c.ma)));
      b1.append(hang);
      if (c) requestAnimationFrame(() => { const el = hang.querySelector('.chon'); if (el) hang.scrollLeft = el.offsetLeft - 12; });
    } else b1.append(h('div', { class: 'vdt-hang mot' }, theCayNho(ds[0], true)));
    if (!c) return [b1];

    const b2 = h('section', { class: 'the' }, h('p', { class: 'vdt-buoc' }, T.buoc_dau_hieu), h('p', { class: 'nho' }, cc.gioi_thieu));
    const luoi = h('div', { class: 'vdt-luoi' });
    let soKhoa = 0;
    vd.dau_hieu.forEach(d => {
      const khoa = !conHan && !d.mien_phi;
      if (khoa) soKhoa++;
      luoi.append(h('a', { class: 'vdt-dh' + (khoa ? ' khoa' : ''), href: '#van-de/' + encodeURIComponent(c.ma) + '/' + d.ma },
        h('i', { 'aria-hidden': 'true' }, d.bieu_tuong), h('span', {}, d.ten), khoa ? h('em', { 'aria-label': T.khoa_nho }, '🔒') : ''));
    });
    b2.append(luoi);
    if (soKhoa) b2.append(h('p', { class: 'nho vd-khoa' }, cc.khoa.replace('{n}', soKhoa)));
    b2.append(h('p', { class: 'nho' }, cc.ghi_chu));
    return [b1, b2];
  }

  // ───── Bước 3: kết quả ─────
  function veKetQua(c, d) {
    const cc = vd.cau_chu, T = cc.tab || {}, cay = nd.cay[c.cay];
    const lui = h('a', { class: 'vl-lui', href: '#van-de/' + encodeURIComponent(c.ma) }, T.quay_lai);
    const anh = vlAnhNho(cay);
    const dau = h('div', { class: 'vdt-kq-dau' }, anh, h('div', {}, h('b', {}, vlTen(cay)), h('span', { class: 'vl-chip' }, 'Mã ' + c.ma)));
    const the = h('section', { class: 'the vdt-kq' }, dau, h('h2', {}, d.bieu_tuong + ' ' + d.ten));
    if (!conHan && !d.mien_phi) { // dấu hiệu khóa → lời mời gia hạn như hiện nay
      the.append(h('p', { class: 'vd-khoa' }, '🔒 ' + cc.khoa.replace('{n}', vd.dau_hieu.filter(x => !x.mien_phi).length)),
        ma ? h('a', { class: 'nut', href: '#hom-nay' }, T.gia_han) : nutLienHe(nd.lienHe, c.ma, c.cay));
      return [lui, the];
    }
    const khoi = (lop, tieuDe, mang) => mang && mang.length
      ? h('div', { class: 'vdt-khoi ' + lop }, h('h3', {}, tieuDe), h('ul', { class: 'cham' }, ...mang.map(x => h('li', {}, x)))) : '';
    the.append(khoi('nn', cc.nguyen_nhan, d.nguyen_nhan), khoi('nl', cc.nen_lam, d.nen_lam),
      d.nguon ? h('p', { class: 'nho' }, 'Nguồn: ', ...d.nguon.flatMap((n, i) => [
        i ? ' · ' : '', h('a', { href: n.link, target: '_blank', rel: 'noopener' }, n.ten)])) : '');
    // BƯỚC 5 (CHƯA LÀM): chỗ này sẽ có nút "📷 Gửi ảnh cho shop xem" – khách chụp ảnh → Supabase lưu tạm (xóa sau 30 ngày)
    // → hệ thống chẩn đoán soạn nháp → anh duyệt trên Telegram → khách nhận trả lời trong app (DE_XUAT_GIAO_DIEN_CHUYEN_NGHIEP.md mục 3).
    // Gắn vào phần tử <div class="vdt-gui-anh"> bên dưới, đặt TRƯỚC câu hoi_shop. Khi đó sửa câu hoi_shop cho hợp (anh duyệt).
    const guiAnh = h('div', { class: 'vdt-gui-anh', hidden: '' });
    the.append(guiAnh, h('p', { class: 'vd-hoi' }, cc.hoi_shop), nutLienHe(nd.lienHe, c.ma, c.cay), h('p', { class: 'nho' }, cc.ghi_chu));
    return [lui, the];
  }

  return vung;
}

/** Kiểu riêng tab Cây có vấn đề? (để ở đây cho khỏi sửa giao-dien.css). */
function vdtKieu() {
  if (document.getElementById('kieu-van-de-tab')) return;
  const s = document.createElement('style');
  s.id = 'kieu-van-de-tab';
  s.textContent = '.vdt-buoc{font-weight:700;color:var(--xanh-dam);margin:8px 0 2px}'
    + '.vdt-hang{display:flex;gap:10px;overflow-x:auto;padding:6px 2px 8px;margin:4px -2px 0;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch}'
    + '.vdt-cay{flex:none;width:96px;display:flex;flex-direction:column;gap:1px;padding:6px 6px 8px;border:1.5px solid #edf2ea;border-radius:14px;background:#fff;'
    + 'text-decoration:none;color:var(--chu);font-size:12px;scroll-snap-align:start;-webkit-tap-highlight-color:transparent}'
    + '.vdt-cay b{font-size:13px;line-height:1.2;margin-top:4px}.vdt-cay .vl-anh>span:first-child{font-size:34px}'
    + '.vdt-cay .cham-sk{top:6px;right:6px;width:12px;height:12px}'
    + '.vdt-cay.chon{border-color:var(--xanh);box-shadow:0 0 0 2px var(--ok-nen);background:#f6fbf3}'
    + '.vdt-hang.mot .vdt-cay{width:120px}'
    + '.vdt-luoi{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-top:10px}'
    + '.vdt-dh{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;min-height:96px;padding:12px 8px;'
    + 'border:1.5px solid var(--vien);border-radius:16px;background:#fff;box-shadow:var(--bong);text-align:center;text-decoration:none;color:var(--chu);'
    + 'font-size:14px;font-weight:600;line-height:1.25;-webkit-tap-highlight-color:transparent}'
    + '.vdt-dh:active{transform:scale(.98);border-color:var(--xanh)}'
    + '.vdt-dh i{font-style:normal;font-size:32px;line-height:1}'
    + '.vdt-dh.khoa{background:#f7f8f6;color:var(--nhat);box-shadow:none}.vdt-dh.khoa i{filter:grayscale(1);opacity:.55}'
    + '.vdt-dh em{position:absolute;top:6px;right:8px;font-style:normal;font-size:14px}'
    + '.vdt-kq-dau{display:flex;align-items:center;gap:10px}.vdt-kq-dau .vl-anh{width:56px;flex:none;border-radius:12px}'
    + '.vdt-kq-dau .vl-anh>span:first-child{font-size:28px}.vdt-kq-dau>div:last-child{display:flex;flex-direction:column;align-items:flex-start;gap:3px}'
    + '.vdt-kq h2{margin:12px 0 4px;color:var(--xanh-dam)}'
    + '.vdt-khoi{border-radius:14px;padding:2px 12px 4px;margin-top:10px}.vdt-khoi h3{margin:10px 0 4px}'
    + '.vdt-khoi.nn{background:#fdf6e9}.vdt-khoi.nl{background:var(--ok-nen)}';
  document.head.append(s);
}
