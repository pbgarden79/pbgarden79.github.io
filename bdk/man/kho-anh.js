// Màn KHO ẢNH CÂY — dữ liệu từ bdkKhoAnh_() (tab Kho_Anh). Ảnh gốc nằm trên Drive riêng của shop nên trang chỉ hiện số đếm.
MAN.kho_anh = {
  tieuDe: '🖼️ Kho ảnh cây',
  ve(d, el) {
    const mau = { 'đủ': 'xanh', 'nên bổ sung': 'cam', 'thiếu ảnh': 'do' };
    el.append(h('div', { class: 'luoi' },
      the('Tổng ảnh', h('div', { class: 'so' }, String(d.tong)), h('div', { class: 'nhan' }, d.ds.length + ' loại cây')),
      the('Ảnh tốt chưa dùng', h('div', { class: 'so' }, String(d.chuaDung)), h('div', { class: 'nhan' }, 'Còn dùng được cho bài mới'))));
    el.append(h('div', { class: 'luoi' }, d.ds.map(n => {
      const pt = Math.min(100, Math.round(n.chuaDung / 8 * 100));
      return the(n.cay, h('div', { style: 'margin-bottom:6px' }, nhan(n.muc, mau[n.muc])),
        h('div', { class: 'thanh' }, h('i', { style: 'width:' + pt + '%;background:var(--' + (n.muc === 'đủ' ? 'xanh' : n.muc === 'nên bổ sung' ? 'cam' : 'do') + ')' })),
        h('div', { class: 'nhan' }, n.chuaDung + ' ảnh chưa dùng · ' + n.tong + ' ảnh'),
        n.moiNhat ? h('div', { class: 'nho' }, 'Ảnh mới nhất ' + n.moiNhat) : '');
    })));
    el.append(h('p', { class: 'nho' }, 'Mức: từ 8 ảnh tốt chưa dùng = đủ · 4–7 = nên bổ sung · dưới 4 = thiếu ảnh. Thêm ảnh: gửi ảnh kèm /kho cho bot Telegram.'));
  },
};
