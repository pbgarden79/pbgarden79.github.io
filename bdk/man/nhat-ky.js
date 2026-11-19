// Màn NHẬT KÝ — 150 dòng mới nhất của tab Nhat_Ky, dữ liệu từ bdkNhatKy_()
MAN.nhat_ky = {
  tieuDe: '📜 Nhật ký',
  ve(d, el) {
    const loais = [...new Set(d.dong.map(r => r.loai))].sort();
    const chon = h('select', { style: 'font:inherit;padding:6px 10px;border-radius:8px;border:1px solid var(--vien);margin-bottom:12px' },
      h('option', { value: '' }, 'Tất cả loại (' + d.dong.length + ')'), loais.map(l => h('option', { value: l }, l)));
    const ds = h('div', { class: 'the' });
    const ve = () => ds.replaceChildren(...d.dong.filter(r => !chon.value || r.loai === chon.value).map(r =>
      h('div', { class: 'dong' }, h('span', {}, nhan(r.loai, r.loai === 'LOI' ? 'do' : 'xam'), ' ', h('span', { class: 'nho' }, r.agent), h('div', {}, r.nd)),
        h('span', { class: 'nho' }, r.luc))));
    chon.onchange = ve;
    ve();
    el.append(chon, ds);
  },
};
