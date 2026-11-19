// Màn LỊCH ĐĂNG — dữ liệu từ bdkLichDang_() (Y_Tuong + Bai_Dang), Apps Script B1_BangDieuKhien.gs, gửi lên Supabase
MAN.lich_dang = {
  tieuDe: '📅 Lịch đăng',
  ve(d, el) {
    const nhanBai = b => b.tt === 'Đã lên lịch' || b.henGio ? nhan('đã hẹn giờ', 'xanh')
      : b.duyet === 'Chờ duyệt' ? nhan('chờ anh duyệt', 'cam') : b.tt === 'Tạm hoãn' ? nhan('tạm hoãn', 'xam') : nhan(b.tt || '—', 'xam');
    const dongBai = b => h('div', { class: 'dong' },
      h('span', {}, h('b', {}, 'Bài ' + b.so), ' · ', b.ten,
        h('div', { class: 'nho' }, [b.ngay + (b.gio ? ' ' + b.gio : ''), b.choVideo ? '🎬 chờ video' : b.coAnh ? '🖼️ có ảnh' : '⚠️ chưa có ảnh'].join(' · '))),
      nhanBai(b));
    el.append(h('div', { class: 'luoi' },
      the('Bài trong kế hoạch', h('div', { class: 'so' }, String(d.tong)), h('div', { class: 'nhan' }, d.soDaDang + ' bài đã đăng')),
      the('Sắp đăng', h('div', { class: 'so' }, String(d.sapToi.length)), h('div', { class: 'nhan' }, d.sapToi.filter(b => b.duyet === 'Chờ duyệt').length + ' bài chờ anh duyệt')),
      the('Quá ngày chưa đăng', h('div', { class: 'so', style: d.choXuLy.length ? 'color:var(--do)' : '' }, String(d.choXuLy.length)), h('div', { class: 'nhan' }, d.choXuLy.length ? 'Cần xử lý' : 'Không có'))));
    el.append(the('Sắp đăng trên Fanpage', d.sapToi.length ? d.sapToi.map(dongBai) : trong('Chưa có bài nào sắp đăng.'),
      h('div', { class: 'nho', style: 'margin-top:6px' }, 'Bài Instagram hẹn trên Business Suite không có trong Sheets nên không hiện ở đây.')));
    if (d.choXuLy.length) { el.append(h('div', { style: 'height:12px' })); el.append(the('⚠️ Quá ngày nhưng chưa đăng', d.choXuLy.map(dongBai))); }
    el.append(h('div', { style: 'height:12px' }));
    el.append(the('Bài đã đăng gần đây (Facebook)', d.daDang.length ? d.daDang.map(b => h('div', { class: 'dong' },
      h('span', {}, b.nd, h('div', { class: 'nho' }, b.ngay + ' · ' + b.kenh)),
      h('span', { class: 'nho' }, '👁 ' + b.xem + ' · 👍 ' + b.thich + ' · 💬 ' + b.binhLuan + ' · ✉️ ' + b.tinNhan))) : trong('Chưa có số liệu bài đã đăng.')));
  },
};
