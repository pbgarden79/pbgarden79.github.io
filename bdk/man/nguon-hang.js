// Màn NGUỒN HÀNG — dữ liệu từ bdkNguonHang_() (Nha_Cung_Cap + Bao_Gia). Báo giá mới: gửi ảnh kèm /ncc cho bot Telegram.
MAN.nguon_hang = {
  tieuDe: '🚚 Nguồn hàng',
  ve(d, el) {
    const tien = n => n ? n.toLocaleString('vi-VN') + 'đ' : '';
    el.append(h('div', { class: 'luoi' },
      the('Nhà cung cấp', h('div', { class: 'so' }, String(d.tong)), h('div', { class: 'nhan' }, Object.entries(d.theoTT).map(([k, v]) => v + ' ' + k.toLowerCase()).join(' · '))),
      the('Báo giá đã ghi', h('div', { class: 'so' }, String(d.baoGia.length)), h('div', { class: 'nhan' }, d.baoGia.length ? 'Mới nhất ' + d.baoGia[0].ngay : 'Chưa có báo giá'))));
    const dongNcc = n => h('div', { class: 'dong' },
      h('span', {}, h('b', {}, n.ten), h('div', { class: 'nho' }, [n.tinh, n.loai, n.cachGui].filter(Boolean).join(' · '))),
      nhan(n.tt, n.tt === 'Chưa liên hệ' ? 'xam' : /chờ/i.test(n.tt) ? 'cam' : 'xanh'));
    el.append(h('div', { class: 'luoi2' },
      the('Đang làm việc', d.dangLam.length ? d.dangLam.map(dongNcc) : trong('Chưa liên hệ nơi nào.')),
      the('Báo giá mới nhất', d.baoGia.length ? d.baoGia.map(b => h('div', { class: 'dong' },
        h('span', {}, b.hang, h('div', { class: 'nho' }, [b.ncc, b.quyCach, b.slMin && 'tối thiểu ' + b.slMin, b.ngay].filter(Boolean).join(' · '))),
        h('b', {}, tien(b.gia) + (b.donVi ? '/' + b.donVi : '')))) : trong('Chưa có. Gửi ảnh báo giá kèm /ncc cho bot.'))));
    el.append(the('Chưa liên hệ (' + d.chuaLienHe.length + ')', d.chuaLienHe.map(dongNcc)));
  },
};
