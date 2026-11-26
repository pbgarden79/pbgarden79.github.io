// Màn hình HẾT HẠN: hết thời gian miễn phí, chưa có gói. Hai cách gia hạn: mua cây mới (mã mới) hoặc gói tháng/năm.
// Gói tháng/năm (26/11): chọn gói → mã VietQR (img.vietqr.io) → "Tôi đã chuyển khoản" → shop duyệt trên Telegram
// → hạn mới (Supabase 14_gia_han_goi.sql) → trang tự mở lại phần nâng cao. Câu chữ + tài khoản: noi-dung/goi.json.
function manHinhHetHan(nd, han, moKichHoat) {
  const g = nd.goi, c = g.cau_chu || {}, ck = g.chuyen_khoan || {};
  const maCay = (new URLSearchParams(location.search).get('c') || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const coQR = !!(ck.ngan_hang && ck.so_tai_khoan && ck.chu_tai_khoan);
  const thay = (s, d) => String(s || '').replace(/\{(\w+)\}/g, (m, k) => (d[k] !== undefined ? d[k] : m));
  const tien = n => Number(n).toLocaleString('vi-VN') + 'đ';
  const vung = h('div', {});
  const bao = h('p', { class: 'bao' });
  let hen = null;

  const goi = (loai) => {
    const x = g[loai];
    return h('div', { class: 'goi' + (x.nhan ? ' noi-bat' : ''), role: 'button', tabindex: '0', style: coQR ? 'cursor:pointer' : null,
      onclick: coQR ? () => chonGoi(loai) : null },
      x.nhan ? h('span', { class: 'nhan' }, x.nhan) : '',
      h('strong', {}, x.ten), h('div', { class: 'gia' }, x.gia), h('div', { class: 'nho' }, x.moi_ngay));
  };
  const nutShop = () => h('a', { class: 'nut phu', href: nd.lienHe.messenger, target: '_blank', rel: 'noopener' }, '💬 Nhắn shop');

  // Danh sách gói (bước đầu)
  const veChonGoi = () => {
    vung.textContent = ''; bao.textContent = '';
    vung.append(h('div', { class: 'cac-goi' }, goi('thang'), goi('nam')));
    if (coQR) vung.append(h('p', { class: 'nho' }, c.chon_goi));
    else vung.append(h('p', { class: 'nho' }, g.thanh_toan), nutShop());
  };

  // Bước 2: mã QR + nút "Tôi đã chuyển khoản"
  const chonGoi = async (loai) => {
    bao.textContent = '';
    const r = await goiHam('tao_yeu_cau_gia_han', { p_loai: loai, p_ma: maCay }, false);
    const d = r.data || {};
    if (!r.ok || !d.ok) { bao.textContent = d.loi === 'qua_nhieu' ? c.qua_nhieu : c.loi_mang; return; }
    if (d.trang_thai === 'da_ck') return veDangCho(d);
    const anh = 'https://img.vietqr.io/image/' + encodeURIComponent(ck.ngan_hang) + '-' + encodeURIComponent(ck.so_tai_khoan) + '-' +
      encodeURIComponent(ck.mau_qr || 'compact2') + '.png?amount=' + d.so_tien + '&addInfo=' + encodeURIComponent(d.ma_ck) +
      '&accountName=' + encodeURIComponent(ck.chu_tai_khoan);
    const dong = (nhan, giaTri, chep) => h('div', { style: 'display:flex;justify-content:space-between;gap:8px;align-items:center;margin:4px 0' },
      h('span', { class: 'nho' }, nhan), h('strong', {}, giaTri),
      chep ? h('button', { class: 'nut phu', style: 'width:auto;padding:4px 10px;margin:0;font-size:13px',
        onclick: e => { const n = e.target; Promise.resolve().then(() => navigator.clipboard.writeText(giaTri))
          .then(() => { n.textContent = 'Đã chép'; }, () => { /* máy chặn chép → khách tự gõ */ }); } }, 'Chép') : '');
    const nutDaCk = h('button', { class: 'nut' }, c.nut_da_ck);
    nutDaCk.onclick = async () => {
      nutDaCk.disabled = true;
      const k = await goiHam('bao_da_chuyen_khoan', { p_id: d.id }, false);
      if (!k.ok || !k.data || !k.data.ok) { nutDaCk.disabled = false; bao.textContent = c.loi_mang; return; }
      veDangCho(d, true);
    };
    vung.textContent = '';
    vung.append(
      h('p', {}, c.huong_dan_ck),
      h('img', { src: anh, alt: 'Mã QR chuyển khoản', style: 'display:block;width:100%;max-width:320px;margin:8px auto;border-radius:12px' }),
      dong('Gói', g[loai].ten), dong('Số tiền', tien(d.so_tien)), dong('Nội dung', d.ma_ck, true),
      dong('Số tài khoản', ck.so_tai_khoan, true), dong('Chủ tài khoản', ck.chu_tai_khoan),
      nutDaCk,
      h('button', { class: 'nut phu', onclick: veChonGoi }, c.nut_doi_goi));
  };

  // Bước 3: chờ shop duyệt → hỏi lại hạn mỗi phút (tối đa 30 phút khi đang mở trang)
  const veDangCho = (d, vuaBao) => {
    vung.textContent = '';
    vung.append(h('p', { class: 'bao xanh' }, vuaBao ? c.da_bao : thay(c.dang_cho, { goi: (g[d.loai] || {}).ten || '', ma: d.ma_ck })),
      h('button', { class: 'nut phu', onclick: () => kiemTra(true) }, c.nut_kiem_tra));
    clearInterval(hen);
    let lan = 0;
    hen = setInterval(() => { if (++lan > 30 || !document.body.contains(vung)) clearInterval(hen); else kiemTra(false); }, 60000);
  };

  const kiemTra = async (bam) => {
    const r = await goiHam('han_su_dung', {}, false);
    if (r.ok && r.data && r.data >= homNay()) {
      clearInterval(hen);
      vung.textContent = '';
      vung.append(h('p', { class: 'bao xanh' }, thay(c.xong, { ngay: ngayVN(r.data) })));
      setTimeout(() => location.reload(), 2500);
      return;
    }
    if (bam) bao.textContent = r.ok ? '' : c.loi_mang;
    if (bam && r.ok) { // vẫn chưa có hạn mới → xem shop có báo "chưa thấy tiền" không
      const y = await goiHam('gia_han_cua_toi', {}, false);
      if (y.ok && y.data && y.data.trang_thai === 'tu_choi') veTuChoi(y.data);
    }
  };

  const veTuChoi = (d) => {
    clearInterval(hen);
    vung.textContent = '';
    vung.append(h('p', { class: 'bao' }, thay(c.tu_choi, { ma: d.ma_ck })), nutShop(),
      h('button', { class: 'nut phu', onclick: veChonGoi }, c.nut_doi_goi));
  };

  veChonGoi();
  // Vào lại trang: có yêu cầu đang chờ / bị từ chối gần đây → hiện luôn trạng thái
  if (coQR) goiHam('gia_han_cua_toi', {}, false).then(y => {
    if (!y.ok || !y.data) return;
    if (y.data.trang_thai === 'da_ck') veDangCho(y.data);
    else if (y.data.trang_thai === 'tu_choi') veTuChoi(y.data);
    else if (y.data.trang_thai === 'da_duyet') kiemTra(false);
  });

  return h('section', { class: 'the' },
    h('h3', {}, '⏳ Phần nâng cao đã hết hạn' + (han ? ' (' + ngayVN(han) + ')' : '')),
    h('p', {}, 'Cách chăm cơ bản ở trên vẫn dùng miễn phí. Muốn dùng tiếp phần nâng cao, anh/chị chọn:'),
    h('h3', {}, '🪴 Mua cây mới'),
    h('p', {}, 'Mỗi cây mới kèm mã kích hoạt mới, thêm ' + g.mien_phi_ngay + ' ngày miễn phí.'),
    h('button', { class: 'nut phu', onclick: moKichHoat }, 'Nhập mã của cây mới'),
    h('h3', {}, '⭐ Đăng ký gói'),
    vung, bao);
}
