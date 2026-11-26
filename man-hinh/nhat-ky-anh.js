// NHẬT KÝ ẢNH từng cây (mục 9 khung sườn). Ảnh thu nhỏ rồi lưu TRÊN MÁY KHÁCH (IndexedDB), KHÔNG tải lên máy chủ.
// Chỉ hiện khi còn hạn nâng cao/gói: được gọi từ manHinhCham (vuon.js). Câu chữ ở CHU_NKA bên dưới.
const CHU_NKA = {
  tieu_de: '📸 Nhật ký ảnh',
  gioi_thieu: 'Dạ, mỗi tuần anh/chị chụp cây một tấm để xem cây lớn lên từng ngày nha ạ.',
  rieng_tu: '🔒 Ảnh chỉ lưu trên điện thoại này, không gửi về shop và không tải lên mạng ạ. Nếu xóa dữ liệu trình duyệt hoặc đổi máy thì ảnh sẽ mất; anh/chị cài app ra màn hình chính để ảnh được giữ lâu hơn ạ.',
  nut_chup: '📷 Chụp / chọn ảnh cây',
  dang_luu: 'Dạ, đang lưu ảnh…',
  chua_co: 'Dạ, anh/chị chụp tấm đầu tiên làm mốc nha ạ 🌱',
  den_tuan: n => 'Dạ, đã ' + n + ' ngày chưa chụp rồi ạ, anh/chị chụp thêm một tấm cho cây nha 🌿',
  tuan_toi: d => 'Tấm kế tiếp anh/chị chụp khoảng ngày ' + d + ' nha ạ.',
  so_sanh: '🌱 Mốc đầu → Mới nhất',
  moc_dau: 'Mốc đầu',
  sau_ngay: n => '+' + n + ' ngày',
  xoa: '🗑 Xóa ảnh này',
  hoi_xoa: d => 'Xóa ảnh ngày ' + d + '? Ảnh xóa rồi không lấy lại được ạ.',
  dong: 'Đóng',
  loi_may: 'Dạ, máy này chưa lưu được ảnh (có thể đang mở ở chế độ ẩn danh) ạ.',
  loi_anh: 'Dạ, ảnh này chưa đọc được, anh/chị thử ảnh khác giúp shop nha ạ.',
  loi_day: 'Dạ, bộ nhớ máy gần đầy nên chưa lưu được ảnh ạ.'
};

const NKA_CANH = 1080, NKA_CHAT = 0.8; // cạnh dài tối đa (px), chất lượng JPEG → mỗi ảnh khoảng 100–250 KB

let _nkaDb = null;
function nkaMoKho() {
  if (!_nkaDb) _nkaDb = new Promise((ok, loi) => {
    if (!window.indexedDB) return loi(new Error('khong_co_idb'));
    const rq = indexedDB.open('pb_nhat_ky_anh', 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore('anh', { keyPath: 'id', autoIncrement: true }).createIndex('ma', 'ma');
    rq.onsuccess = () => ok(rq.result);
    rq.onerror = () => loi(rq.error);
  }).catch(e => { _nkaDb = null; throw e; });
  return _nkaDb;
}
async function nkaGiaoDich(che, viec) {
  const db = await nkaMoKho();
  return new Promise((ok, loi) => {
    const tx = db.transaction('anh', che), kq = viec(tx.objectStore('anh'));
    tx.oncomplete = () => ok(kq && 'result' in kq ? kq.result : undefined);
    tx.onerror = tx.onabort = () => loi(tx.error);
  });
}
const nkaDanhSach = ma => nkaGiaoDich('readonly', s => s.index('ma').getAll(ma)).then(ds => (ds || []).sort((a, b) => a.luc - b.luc));
const nkaThem = bg => nkaGiaoDich('readwrite', s => s.add(bg));
const nkaXoa = id => nkaGiaoDich('readwrite', s => s.delete(id));

/** Thu nhỏ ảnh về cạnh dài NKA_CANH, xuất JPEG. Trình duyệt mới tự xoay đúng chiều theo EXIF. */
function nkaThuNho(tep) {
  return new Promise((ok, loi) => {
    const url = URL.createObjectURL(tep), img = new Image();
    img.onload = () => {
      const tl = Math.min(1, NKA_CANH / Math.max(img.naturalWidth, img.naturalHeight));
      const cv = document.createElement('canvas');
      cv.width = Math.round(img.naturalWidth * tl); cv.height = Math.round(img.naturalHeight * tl);
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(url);
      cv.toBlob(b => (b ? ok(b) : loi(new Error('khong_xuat'))), 'image/jpeg', NKA_CHAT);
    };
    img.onerror = () => { URL.revokeObjectURL(url); loi(new Error('khong_doc')); };
    img.src = url;
  });
}

const nkaSoNgay = (tu, den) => Math.round((Date.parse(den) - Date.parse(tu)) / 864e5);

/** Thẻ "Nhật ký ảnh" cho combo đang xem. */
function manHinhNhatKyAnh(nd, ma) {
  const vung = h('section', { class: 'the nhat-ky-anh' });
  let urls = [];
  const bao = h('p', { class: 'bao' });
  // Cố ý KHÔNG đặt `capture`: iPhone/Android sẽ hỏi "Chụp ảnh" hoặc "Thư viện" → khách chọn được cả ảnh cũ trong máy.
  const chon = h('input', { type: 'file', accept: 'image/*', hidden: '' });
  const nut = h('button', { class: 'nut', type: 'button', onclick: () => chon.click() }, CHU_NKA.nut_chup);

  const anhUrl = b => { const u = URL.createObjectURL(b); urls.push(u); return u; };

  const xemLon = (a, dau) => {
    const lop = h('div', { class: 'nka-lop', role: 'dialog', 'aria-modal': 'true' });
    const dong = () => lop.remove();
    lop.onclick = e => { if (e.target === lop) dong(); };
    lop.append(h('div', { class: 'nka-hop' },
      h('img', { src: anhUrl(a.blob), alt: 'Ảnh cây ngày ' + ngayVN(a.ngay) }),
      h('p', {}, h('b', {}, ngayVN(a.ngay)), ' · ', a.id === dau.id ? CHU_NKA.moc_dau : CHU_NKA.sau_ngay(nkaSoNgay(dau.ngay, a.ngay))),
      h('button', { class: 'nut phu', type: 'button', onclick: async () => {
        if (!confirm(CHU_NKA.hoi_xoa(ngayVN(a.ngay)))) return;
        await nkaXoa(a.id).catch(() => {}); dong(); ve();
      } }, CHU_NKA.xoa),
      h('button', { class: 'nut', type: 'button', onclick: dong }, CHU_NKA.dong)));
    document.body.append(lop);
  };

  const ve = async () => {
    let ds;
    try { ds = await nkaDanhSach(ma); } catch (e) {
      vung.replaceChildren(h('h3', {}, CHU_NKA.tieu_de), h('p', { class: 'nho' }, CHU_NKA.loi_may));
      return;
    }
    urls.forEach(u => URL.revokeObjectURL(u)); urls = [];
    const dau = ds[0], cuoi = ds[ds.length - 1], hn = homNay();
    const nhac = !cuoi ? CHU_NKA.chua_co
      : nkaSoNgay(cuoi.ngay, hn) >= 7 ? CHU_NKA.den_tuan(nkaSoNgay(cuoi.ngay, hn))
      : CHU_NKA.tuan_toi(ngayVN(ngayCong(cuoi.ngay, 7)));
    const o = a => h('button', { class: 'nka-o', type: 'button', onclick: () => xemLon(a, dau), 'aria-label': 'Xem ảnh ngày ' + ngayVN(a.ngay) },
      h('img', { src: anhUrl(a.blob), alt: '', loading: 'lazy' }),
      h('span', {}, ngayVN(a.ngay).replace(/\/\d{4}$/, '')), h('i', {}, a.id === dau.id ? CHU_NKA.moc_dau : CHU_NKA.sau_ngay(nkaSoNgay(dau.ngay, a.ngay))));
    const day = ds.length ? h('div', { class: 'nka-day' }, ds.map(o)) : '';
    vung.replaceChildren(
      h('h3', {}, CHU_NKA.tieu_de),
      h('p', {}, CHU_NKA.gioi_thieu),
      ds.length >= 2 ? h('div', { class: 'nka-so-sanh' },
        h('p', { class: 'nho' }, CHU_NKA.so_sanh),
        h('div', {}, [dau, cuoi].map(a => h('figure', {}, h('img', { src: anhUrl(a.blob), alt: 'Ảnh ngày ' + ngayVN(a.ngay) }),
          h('figcaption', {}, ngayVN(a.ngay)))))) : '',
      day,
      h('p', { class: 'nka-nhac' + (!cuoi || nkaSoNgay(cuoi.ngay, hn) >= 7 ? ' den' : '') }, nhac),
      nut, chon, bao,
      h('p', { class: 'nho nka-rieng' }, CHU_NKA.rieng_tu));
    if (day) requestAnimationFrame(() => { day.scrollLeft = day.scrollWidth; }); // xem tấm mới nhất trước
  };

  chon.onchange = async () => {
    const tep = chon.files && chon.files[0];
    chon.value = '';
    if (!tep) return;
    nut.disabled = true; bao.className = 'bao xanh'; bao.textContent = CHU_NKA.dang_luu;
    try {
      const blob = await nkaThuNho(tep);
      try { await nkaThem({ ma, ngay: homNay(), luc: Date.now(), blob }); }
      catch (e) { throw new Error(e && e.name === 'QuotaExceededError' ? 'day' : 'may'); }
      if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {}); // xin giữ dữ liệu lâu dài
      bao.textContent = '';
      await ve();
    } catch (e) {
      bao.className = 'bao';
      bao.textContent = e.message === 'day' ? CHU_NKA.loi_day : e.message === 'may' ? CHU_NKA.loi_may : CHU_NKA.loi_anh;
    }
    nut.disabled = false;
  };

  vung.append(h('h3', {}, CHU_NKA.tieu_de));
  ve();
  return vung;
}
