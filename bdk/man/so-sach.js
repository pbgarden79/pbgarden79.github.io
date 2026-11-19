// Màn SỔ SÁCH — dữ liệu từ bdkSoSach_() (tab Thu_Chi). Ghi khoản chi: gửi ảnh hóa đơn kèm /chi cho bot Telegram.
MAN.so_sach = {
  tieuDe: '📒 Sổ sách',
  ve(d, el) {
    const tien = n => Math.round(n).toLocaleString('vi-VN') + 'đ';
    const nay = d.thang[0] || { thang: '—', thu: 0, chi: 0 };
    const tongChi = d.hangMuc.reduce((s, x) => s + x.tien, 0);
    el.append(h('div', { class: 'luoi' },
      the('Chi tháng ' + nay.thang, h('div', { class: 'so' }, tien(nay.chi)), h('div', { class: 'nhan' }, 'Thu ' + tien(nay.thu))),
      the('Tổng chi từ đầu', h('div', { class: 'so' }, tien(tongChi)), h('div', { class: 'nhan' }, d.hangMuc.length + ' hạng mục'))));
    el.append(h('div', { class: 'luoi2' },
      the('Theo tháng', d.thang.length ? d.thang.map(t => dong(t.thang, h('span', {}, 'chi ' + tien(t.chi) + (t.thu ? ' · thu ' + tien(t.thu) : '')))) : trong('Chưa có khoản nào.')),
      the('Chi theo hạng mục', d.hangMuc.length ? d.hangMuc.map(x => h('div', {},
        dong(x.ten, h('b', {}, tien(x.tien))),
        h('div', { class: 'thanh' }, h('i', { style: 'width:' + Math.round(x.tien / (tongChi || 1) * 100) + '%' })))) : trong('Chưa có.'))));
    el.append(the('Khoản mới nhất', d.moiNhat.map(r => h('div', { class: 'dong' },
      h('span', {}, r.mon || r.hangMuc, h('div', { class: 'nho' }, [r.ngay, r.hangMuc, r.tt].filter(Boolean).join(' · '))),
      h('b', { style: r.loai === 'Thu' ? 'color:var(--xanh)' : '' }, (r.loai === 'Thu' ? '+' : '−') + tien(r.tien))))));
  },
};
