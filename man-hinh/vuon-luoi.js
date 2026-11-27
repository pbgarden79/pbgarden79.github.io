// TAB VƯỜN (bước 3 giao diện chuyên nghiệp, 27/11/2026): lưới thẻ cây có chấm màu sức khỏe + màn CHI TIẾT CÂY.
// Gắn ở app.js → veTrangTab (chỉ máy đã kích hoạt). Kệ cũ manHinhVuon (vuon.js) vẫn dùng cho máy chưa kích hoạt.
// Màu xanh/cam/đỏ = hnTrangThai() + ô đếm oDemNgay() của màn Hôm nay (hom-nay.js) → hai màn luôn khớp nhau.
// Dữ liệu: layVuon() (vuon.js). Câu chữ: noi-dung/vuon.json (+ nút/câu đã ghi dùng chung noi-dung/hom-nay.json).
// Chi tiết cây mở bằng địa chỉ #vuon/<mã> → nút Quay lại của điện thoại trở về lưới.
let _vlChu = null;
function vlChu() {
  if (!_vlChu) _vlChu = fetch('/noi-dung/vuon.json', { cache: 'no-cache' }).then(r => r.json());
  return _vlChu;
}
const vlTen = cay => cay.ten.replace(/\s*\(.*\)$/, '');

/** Ảnh loại cây (mục "anh" trong cay.json); không có / lỗi tải → biểu tượng trên nền xanh. */
function vlAnhNho(cay) {
  const o = h('div', { class: 'vl-anh' }, h('span', {}, cay.bieu_tuong || '🌿'));
  const a = cay.anh;
  if (a && /^https:\/\//.test(a.link || '')) {
    const img = h('img', { src: a.link, alt: '', loading: 'lazy', decoding: 'async' });
    img.onerror = () => img.remove();
    o.append(img);
  }
  return o;
}

/** Tab Vườn. ma = mã đang mở bằng ?c= (tô viền thẻ đó) hoặc ''. conHan = còn hạn nâng cao/gói. */
function manHinhVuonLuoi(nd, ma, conHan) {
  vlKieu();
  if (typeof hnKieu === 'function') hnKieu(); // kiểu ô đếm .hn-o
  const vung = h('div', { class: 'vuon-luoi' }, h('p', { class: 'nho' }, 'Đang tải vườn…'));
  let ds = null, chu = null, hn = null, tim = '', moPanel = '';
  const maChiTiet = () => { const m = location.hash.match(/^#vuon\/(.+)$/); return m ? decodeURIComponent(m[1]).toUpperCase() : ''; };
  const ve = () => {
    if (!ds || !chu) return;
    const m = maChiTiet(), c = m && ds.find(x => x.ma.toUpperCase() === m);
    vung.replaceChildren(c ? veChiTiet(c) : veLuoi());
  };
  const nap = moi => layVuon(moi).then(d => {
    ds = d.filter(c => nd.cay[c.cay]);
    // chủ shop xem thử loại cây chưa có combo → thẻ giả (không ghi gì), giống hom-nay.js / manHinhCham
    if (ma && !ds.some(c => c.ma === ma) && typeof laMaXem === 'function' && laMaXem(ma) && nd.combo[ma])
      ds.push({ ma, cay: nd.combo[ma].cay, kich_hoat: homNay(), ngay_cham: [] });
    ve();
  });
  Promise.all([vlChu(), hnChu()]).then(([a, b]) => { chu = a; hn = b; return nap(); })
    .catch(() => vung.replaceChildren(manHinhVuon(nd, ma))); // thiếu câu chữ → kệ cũ
  const doi = () => { if (vung.isConnected) nap(); else document.removeEventListener('vuon-doi', doi); };
  document.addEventListener('vuon-doi', doi); // bấm "Đã kiểm tra nước" ở Hôm nay / chi tiết → vẽ lại
  const doiDiaChi = () => {
    if (!vung.isConnected) return window.removeEventListener('hashchange', doiDiaChi);
    if (!/^#vuon(\/|$)/.test(location.hash)) return;
    moPanel = ''; ve(); scrollTo(0, 0);
  };
  window.addEventListener('hashchange', doiDiaChi);

  // ───── Lưới thẻ cây ─────
  function veLuoi() {
    const L = chu.luoi;
    const muc = ds.map(c => ({ c, cay: nd.cay[c.cay], s: hnTrangThai(c, nd.cay[c.cay]) }));
    const soCan = muc.filter(x => x.s.con <= 0 && x.s.t.cuoi !== homNay()).length;
    const the = h('section', { class: 'the' }, h('h3', {}, L.tieu_de));
    if (!muc.length) {
      the.append(h('p', { class: 'nho' }, L.trong), h('div', { class: 'vl-luoi' }, theThem()));
      return the;
    }
    the.append(h('p', { class: 'nho' }, soCan ? hnThay(L.co_viec, { n: soCan }) : L.tat_ca_on));
    const luoi = h('div', { class: 'vl-luoi' });
    const khongThay = h('p', { class: 'nho', hidden: '' }, L.khong_thay);
    const loc = () => {
      const q = tim.toUpperCase().replace(/[^A-Z0-9]/g, '');
      const so = (q.match(/^C?0*(\d+)$/) || [])[1]; // gõ "3", "C3", "c003" đều ra C003
      let con = 0;
      luoi.querySelectorAll('.vl-the[data-ma]').forEach(el => {
        const hien = !q || el.dataset.tim.includes(q) || (so && (el.dataset.ma.match(/^C0*(\d+)$/i) || [])[1] === so);
        el.hidden = !hien; if (hien) con++;
      });
      khongThay.hidden = con > 0;
    };
    if (muc.length >= 4) { // nhiều cây → ô tìm theo mã (chủ shop xem mọi mã cũng dùng được)
      const o = h('input', { type: 'search', class: 'vl-tim', placeholder: L.tim, 'aria-label': L.tim, autocapitalize: 'characters', value: tim });
      o.oninput = () => { tim = o.value; loc(); };
      the.append(o);
    }
    muc.forEach(x => luoi.append(theCay(x)));
    luoi.append(theThem());
    the.append(luoi, khongThay, h('p', { class: 'nho vl-chu-thich' }, L.chu_thich));
    // Ghi công ảnh (bắt buộc theo giấy phép CC): tác giả + giấy phép từng ảnh loại cây đang hiện
    const anh = [...new Set(muc.map(x => x.c.cay))].map(k => nd.cay[k].anh).filter(a => a && a.tac_gia);
    if (anh.length) the.append(h('p', { class: 'vl-ghi-cong' }, L.ghi_cong_anh + ' – ', ...anh.flatMap((a, i) => [
      i ? ' · ' : '', a.trang ? h('a', { href: a.trang, target: '_blank', rel: 'noopener' }, a.tac_gia + ' (' + a.giay_phep + ')') : a.tac_gia + ' (' + a.giay_phep + ')'])));
    if (tim) loc();
    return the;
  }

  function theCay(x) {
    const L = chu.luoi, s = x.s;
    const nhan = s.t.cuoi === homNay() ? L.the_da : s.con < 0 ? hnThay(L.the_tre, { n: -s.con })
      : s.con === 0 ? L.the_nay : s.con === 1 ? L.the_mai : hnThay(L.the_con, { n: s.con });
    const anh = vlAnhNho(x.cay);
    anh.append(h('span', { class: 'cham-sk ' + s.mau, 'aria-hidden': 'true' }));
    return h('a', { class: 'vl-the' + (x.c.ma === ma ? ' dang-xem' : ''), href: '#vuon/' + encodeURIComponent(x.c.ma),
      'data-ma': x.c.ma, 'data-tim': (x.c.ma + vlTen(x.cay)).toUpperCase().replace(/[^A-Z0-9]/g, '') },
      anh, h('b', {}, vlTen(x.cay)), h('span', { class: 'nho' }, x.c.ma),
      h('span', { class: 'nhan-tt ' + s.mau }, nhan));
  }

  function theThem() {
    const L = chu.luoi;
    return h('a', { class: 'vl-the them', href: nd.lienHe.messenger, target: '_blank', rel: 'noopener' },
      h('div', { class: 'vl-anh' }, h('span', {}, '＋')), h('b', {}, L.them_cay), h('span', { class: 'nho' }, L.them_cay_nho));
  }

  // ───── Chi tiết cây ─────
  function veChiTiet(c) {
    const C = chu.chi_tiet, v = hn.viec, cay = nd.cay[c.cay], s = hnTrangThai(c, cay), t = s.t;
    if (!nd.combo[c.ma]) nd.combo[c.ma] = { cay: c.cay, goi: '', chau: '', gia_the: '' }; // van-de.js cần nd.combo[mã]
    const vo = h('div', { class: 'vl-chi-tiet' }, h('a', { class: 'vl-lui', href: '#vuon' }, C.quay_lai));

    // Đầu: ảnh lớn (kèm ghi công) + tên + mã + sức khỏe
    const anhLon = typeof anhCay === 'function' ? anhCay(cay) : '';
    const dau = h('section', { class: 'the vl-dau' },
      anhLon || h('div', { class: 'vl-anh lon' }, h('span', {}, cay.bieu_tuong || '🌿')),
      h('h2', {}, (cay.bieu_tuong || '🌿') + ' ' + cay.ten),
      h('p', { class: 'vl-ma' }, h('span', { class: 'vl-chip' }, 'Mã ' + c.ma),
        h('span', { class: 'nhan-tt ' + s.mau }, h('span', { class: 'cham-sk ' + s.mau }), ' ', C['tt_' + s.mau])),
      h('p', { class: 'nho' }, hnThay(C.ve_nha, { n: s.veNha, ngay: ngayVN(c.kich_hoat) })));

    // Ô đếm ngày: chỉ những mục có dữ liệu thật (nước = nhật ký chăm; ảnh = nhật ký ảnh trên máy)
    const oAnh = h('div', { class: 'vl-o', hidden: '' }, h('b', {}, '0'), h('span', {}, C.o_anh));
    const hang = h('div', { class: 'vl-hang-o' }, oDemNgay(hn, s),
      h('div', { class: 'vl-o' }, h('b', {}, String(s.veNha)), h('span', {}, C.o_ve_nha)),
      h('div', { class: 'vl-o' }, h('b', {}, String(t.ds.length)), h('span', {}, C.o_lan)), oAnh);
    if (conHan && typeof nkaDanhSach === 'function')
      nkaDanhSach(c.ma).then(a => { if (a.length) { oAnh.firstChild.textContent = String(a.length); oAnh.hidden = false; } }).catch(() => {});
    dau.append(hang);

    // Kiểm tra nước: lần cuối / lần tới + nút (chỉ khi còn hạn) + lịch
    const bao = h('p', { class: 'bao' });
    const nuoc = h('div', { class: 'vl-nuoc' },
      h('p', { class: 'nho' }, (t.cuoi ? hnThay(C.lan_cuoi, { ngay: ngayVN(t.cuoi) }) : C.chua_lan) + ' · ' + hnThay(C.lan_toi, { ngay: ngayVN(t.toi) })));
    if (conHan) {
      if (t.cuoi === homNay()) nuoc.append(h('p', { class: 'bao xanh' }, C.da_hom_nay));
      else {
        const nut = h('button', { class: 'nut', type: 'button' }, v.nut);
        nut.onclick = async () => {
          nut.disabled = true; bao.className = 'bao'; bao.textContent = '';
          const r = await goiHam('ghi_cham', { p_ma: c.ma }, false);
          if (r.ok && r.data && r.data.chu_shop) { bao.className = 'bao xanh'; bao.textContent = '👑 Chế độ chủ shop: bấm thử, không ghi vào nhật ký của khách.'; return; }
          if (r.ok && r.data && r.data.ok) { bao.className = 'bao xanh'; bao.textContent = v.da_ghi; await layVuon(true); setTimeout(() => document.dispatchEvent(new Event('vuon-doi')), 900); }
          else { nut.disabled = false; bao.textContent = v.loi; }
        };
        nuoc.append(h('p', { class: 'nho' }, v.huong_dan), nut, bao);
      }
      if (typeof lichCham === 'function') nuoc.append(h('details', { class: 'gon vl-lich' }, h('summary', {}, C.lich), lichCham(t)));
    } else nuoc.append(h('p', { class: 'vd-khoa' }, v.het_han));
    dau.append(nuoc);
    vo.append(dau);

    // Lối sang: Nhật ký ảnh · Cây có vấn đề? · Hỏi shop (kèm mã cây)
    const panel = h('div', {});
    const lienHe = nutLienHe(nd.lienHe, c.ma, c.cay); // dùng lại link m.me?ref=<mã>_<loại cây> đã duyệt
    const nutPanel = (ten, chu2, ve2) => {
      const b = h('button', { type: 'button', class: 'vl-loi', 'aria-expanded': String(moPanel === ten) }, chu2);
      b.onclick = () => { moPanel = moPanel === ten ? '' : ten; mo(); };
      b._ten = ten; b._ve = ve2;
      return b;
    };
    const cacNut = [];
    if (conHan && typeof manHinhNhatKyAnh === 'function') cacNut.push(nutPanel('nka', C.nut_nka, () => manHinhNhatKyAnh(nd, c.ma)));
    if (typeof manHinhVanDe === 'function') cacNut.push(nutPanel('vd', C.nut_vd, () => manHinhVanDe(nd, c.ma, conHan)));
    const mo = () => {
      cacNut.forEach(b => b.setAttribute('aria-expanded', String(b._ten === moPanel)));
      const b = cacNut.find(x => x._ten === moPanel);
      panel.replaceChildren(b ? b._ve() : '');
      if (b) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    const hoi = h('a', { class: 'vl-loi', href: lienHe.querySelector('a').href, target: '_blank', rel: 'noopener' }, C.nut_hoi);
    // Có tab Cây có vấn đề? mới (van-de-tab.js, bước 4) → nút dẫn sang tab đó, chọn sẵn cây này; không thì mở màn cũ ngay tại đây
    if (typeof manHinhVanDeTab === 'function') {
      const i = cacNut.findIndex(b => b._ten === 'vd');
      if (i >= 0) cacNut[i] = h('a', { class: 'vl-loi', href: '#van-de/' + encodeURIComponent(c.ma) }, C.nut_vd);
    }
    vo.append(h('div', { class: 'vl-cac-loi' }, ...cacNut, hoi),
      h('p', { class: 'nho vl-hoi-nho' }, hnThay(C.hoi_nho, { ma: c.ma })), panel);
    if (moPanel) { const b = cacNut.find(x => x._ten === moPanel); if (b) panel.append(b._ve()); else moPanel = ''; }

    // Cách chăm + nguồn (cay.json, chủ shop đã duyệt)
    vo.append(h('section', { class: 'the' }, h('h3', {}, C.cach_cham),
      h('ul', { class: 'cham' }, ...cay.cham.map(d => h('li', {}, d))),
      cay.nguon ? h('p', { class: 'nho' }, 'Nguồn: ', ...cay.nguon.flatMap((n, i) => [
        i ? ' · ' : '', h('a', { href: n.link, target: '_blank', rel: 'noopener' }, n.ten)])) : ''));
    return vo;
  }

  return vung;
}

/** Kiểu riêng tab Vườn (để ở đây cho khỏi sửa giao-dien.css). Dùng biến màu --ok/--sap/--tre (bước 1). */
function vlKieu() {
  if (document.getElementById('kieu-vuon-luoi')) return;
  const s = document.createElement('style');
  s.id = 'kieu-vuon-luoi';
  s.textContent = '.vl-luoi{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin-top:10px}'
    + '.vl-the{display:flex;flex-direction:column;gap:2px;padding:8px 8px 10px;border:1px solid #edf2ea;border-radius:16px;background:#fff;'
    + 'box-shadow:var(--bong);text-decoration:none;color:var(--chu);font-size:13px;-webkit-tap-highlight-color:transparent}'
    + '.vl-the[hidden]{display:none}.vl-the:active{transform:scale(.98)}'
    + '.vl-the.dang-xem{border-color:var(--xanh);box-shadow:0 0 0 2px var(--ok-nen)}'
    + '.vl-the b{font-size:14px;line-height:1.25;margin-top:6px}.vl-the .nhan-tt{align-self:flex-start;margin-top:4px}'
    + '.vl-the.them{border:1.5px dashed #b9d3ae;box-shadow:none;color:var(--xanh-dam)}'
    + '.vl-anh{position:relative;aspect-ratio:1/1;border-radius:12px;overflow:hidden;background:linear-gradient(160deg,#e5f4e4,#cfe8c6);display:flex;align-items:center;justify-content:center}'
    + '.vl-anh>span:first-child{font-size:44px}.vl-anh img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}'
    + '.vl-anh .cham-sk{position:absolute;top:8px;right:8px;width:14px;height:14px;border:2px solid #fff}'
    + '.vl-the.them .vl-anh{background:#f6faf4}.vl-the.them .vl-anh>span{font-size:34px;color:var(--xanh)}'
    + '.vl-anh.lon{aspect-ratio:4/3;margin:0 0 10px}.vl-anh.lon>span:first-child{font-size:80px}'
    + 'input.vl-tim{display:block;width:100%;margin-top:8px;padding:11px 12px 11px 38px;font:inherit;font-size:16px;border:1px solid #c9d4c4;border-radius:12px;-webkit-appearance:none;'
    + 'background:#f8faf6 url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%235b6b5d%27 stroke-width=%272%27%3E%3Ccircle cx=%2711%27 cy=%2711%27 r=%277%27/%3E%3Cpath d=%27m20 20-4-4%27/%3E%3C/svg%3E") no-repeat 12px center/18px}'
    + '.vl-chu-thich{margin-top:10px}.vl-ghi-cong{font-size:10px;color:var(--nhat);margin:4px 0 0;line-height:1.4}'
    + '.vl-lui{display:inline-block;margin:10px 0 0;font-weight:600;text-decoration:none;padding:6px 0}'
    + '.vl-dau .anh-cay{margin:0 0 10px}.vl-dau h2{margin:4px 0 4px;color:var(--xanh-dam)}'
    + '.vl-ma{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin:4px 0}'
    + '.vl-chip{font-size:12px;font-weight:700;background:#f1f5ef;border-radius:10px;padding:2px 8px}'
    + '.vl-ma .nhan-tt{font-size:12px;padding:2px 10px}.vl-ma .cham-sk{width:8px;height:8px;box-shadow:none}'
    + '.vl-hang-o{display:grid;grid-template-columns:repeat(auto-fit,minmax(68px,1fr));gap:8px;margin:12px 0 4px}'
    + '.vl-hang-o .hn-o,.vl-o{width:auto;height:68px;border-radius:14px}'
    + '.vl-o{display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f4f7f2;color:var(--xanh-dam);text-align:center}'
    + '.vl-o[hidden]{display:none}.vl-o b{font-size:20px;line-height:1.1}.vl-o span{font-size:10px;line-height:1.15;color:var(--nhat)}'
    + '.vl-nuoc{border-top:1px solid var(--vien);margin-top:10px;padding-top:6px}.vl-lich{margin-top:10px}'
    + '.vl-cac-loi{display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:8px;margin-top:12px}'
    + '.vl-loi{display:flex;align-items:center;justify-content:center;text-align:center;min-height:48px;padding:8px 6px;border-radius:14px;'
    + 'border:1.5px solid var(--vien);background:#fff;font:inherit;font-size:14px;font-weight:600;color:var(--xanh-dam);text-decoration:none;cursor:pointer}'
    + '.vl-loi[aria-expanded="true"]{border-color:var(--xanh);background:var(--ok-nen)}'
    + '.vl-hoi-nho{margin:6px 2px 0}';
  document.head.append(s);
}
