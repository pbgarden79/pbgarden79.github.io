// Màn LỊCH ĐĂNG — dữ liệu từ bdkLichDang_() (Y_Tuong + Bai_Dang), Apps Script B1_BangDieuKhien.gs, gửi lên Supabase
// media: video_bs = video Reels anh tự hẹn trên Business Suite (Fanpage + Instagram) · cho_video = chưa có video · anh · khong_can · chua
MAN.lich_dang = {
  tieuDe: '📅 Lịch đăng',
  ve(d, el) {
    const MEDIA = { video_bs: '🎬 video đã hẹn trên Business Suite', cho_video: '🎬 chưa có video', anh: '🖼️ có ảnh', khong_can: 'không cần ảnh', chua: '⚠️ chưa có ảnh' };
    const nhanBai = b => b.media === 'cho_video' ? nhan(b.duyet === 'Chờ duyệt' ? 'chờ duyệt + video' : 'chờ video', 'cam')
      : b.duyet === 'Chờ duyệt' ? nhan('chờ anh duyệt', 'cam') : b.henGio ? nhan('đã hẹn giờ', 'xanh') : nhan(b.tt || 'chưa hẹn giờ', 'xam');
    const dongBai = (b, nhanRieng) => h('div', { class: 'dong' },
      h('span', {}, h('b', {}, 'Bài ' + b.so), ' · ', b.ten,
        h('div', { class: 'nho' }, [b.ngay + (b.gio ? ' ' + b.gio : ''), b.henGio ? b.kenh : '', MEDIA[b.media]].filter(Boolean).join(' · '))),
      nhanRieng || nhanBai(b));
    const canAnh = d.sapToi.filter(b => b.media === 'cho_video' || b.media === 'chua' || b.duyet === 'Chờ duyệt').length;
    el.append(h('div', { class: 'luoi' },
      the('Bài trong kế hoạch', h('div', { class: 'so' }, String(d.tong)), h('div', { class: 'nhan' }, d.soDaDang + ' bài đã ghi nhận đăng')),
      the('Sắp đăng', h('div', { class: 'so' }, String(d.sapToi.length)), h('div', { class: 'nhan' }, d.sapToi.filter(b => b.henGio).length + ' đã hẹn giờ · ' + canAnh + ' cần anh xử lý')),
      the('Quá giờ chưa đăng', h('div', { class: 'so', style: d.choXuLy.length ? 'color:var(--do)' : '' }, String(d.choXuLy.length)), h('div', { class: 'nhan' }, d.choXuLy.length ? 'Bài chưa hẹn giờ đã trễ' : 'Không có'))));
    el.append(the('Sắp đăng', d.sapToi.length ? d.sapToi.map(b => dongBai(b)) : trong('Chưa có bài nào sắp đăng.')));
    if ((d.daQuaGio || []).length) {
      el.append(h('div', { style: 'height:12px' }));
      el.append(the('Đã đến giờ đăng (chờ ghi nhận)', d.daQuaGio.map(b => dongBai(b, nhan('đã lên lịch đăng', 'xanh'))),
        h('div', { class: 'nho', style: 'margin-top:6px' }, 'Video hẹn trên Business Suite tự lên đúng giờ. Hệ thống ghi "Đã đăng" và số lượt xem khi đồng bộ Fanpage lúc 7h sáng.')));
    }
    if (d.choXuLy.length) { el.append(h('div', { style: 'height:12px' })); el.append(the('⚠️ Quá giờ, chưa hẹn giờ', d.choXuLy.map(b => dongBai(b)))); }
    el.append(h('div', { style: 'height:12px' }));
    el.append(the('Bài đã đăng gần đây (Facebook)', d.daDang.length ? d.daDang.map(b => h('div', { class: 'dong' },
      h('span', {}, b.nd, h('div', { class: 'nho' }, b.ngay + ' · ' + b.kenh)),
      h('span', { class: 'nho' }, '👁 ' + b.xem + ' · 👍 ' + b.thich + ' · 💬 ' + b.binhLuan + ' · ✉️ ' + b.tinNhan))) : trong('Chưa có số liệu bài đã đăng.'),
      h('div', { class: 'nho', style: 'margin-top:6px' }, 'Số liệu đồng bộ từ Fanpage mỗi sáng 7h. Instagram chưa có số liệu.')));
  },
};
