// Màn TRANG CHỦ — dữ liệu từ bdkTrangChu_() trong B1_BangDieuKhien.gs, gửi lên Supabase
MAN.trang_chu = {
  tieuDe: 'Chào anh 👋',
  ve(d, el) {
    const m = d.moi, vuon = d.viTriCamBien === 'vuon';
    const nhiet = m ? (vuon ? m.nhietVuon : m.nhiet) : null, am = m ? (vuon ? m.amVuon : m.am) : null;
    const cu = d.cuMoi === null ? 'chưa có số đo' : d.cuMoi <= 10 ? d.cuMoi + ' phút trước' : '⚠️ ' + d.cuMoi + ' phút chưa có số mới';
    const dangBat = d.thietBi.filter(t => t.bat).map(t => t.ten);
    const v = d.vuon, pt = v.toiDa ? Math.min(100, Math.round(v.phut / v.toiDa * 100)) : 0;
    el.append(h('div', { class: 'luoi' },
      the(vuon ? '🌤️ Cảm biến ngoài vườn' : '🌡️ Phòng trồng',
        h('div', { class: 'so' }, nhiet !== null ? nhiet + '°C' : '—'),
        h('div', { class: 'nhan' }, 'Độ ẩm ' + (am !== null ? am + '%' : '—') + (m && m.nhietNgoai !== null ? ' · trời ' + m.nhietNgoai + '°C, ' + m.amNgoai + '%' : '')),
        h('div', { class: 'nho' }, cu)),
      the('💧 Phun vườn hôm nay',
        h('div', { class: 'so' }, v.phut + ' phút'),
        h('div', { class: 'thanh' }, h('i', { style: 'width:' + pt + '%' })),
        h('div', { class: 'nhan' }, v.lan + ' lượt · tối đa ' + v.toiDa + ' phút' + (v.dangPhun ? ' · đang phun' : ''))),
      the('🔌 Thiết bị đang bật',
        h('div', { class: 'so' }, String(dangBat.length)),
        h('div', { class: 'nhan' }, dangBat.join(', ') || 'Không có thiết bị nào bật')),
      the('⚠️ Lỗi 24 giờ qua',
        h('div', { class: 'so', style: d.soLoi ? 'color:var(--do)' : '' }, String(d.soLoi)),
        h('div', { class: 'nhan' }, d.soLoi ? 'Xem chi tiết bên dưới' : 'Hệ thống chạy ổn'))));

    const viec = d.viec.quaHan.map(r => [r, nhan('quá hạn ' + r.han, 'do')]).concat(d.viec.homNay.map(r => [r, nhan(r.gio || 'hôm nay', 'cam')]));
    el.append(h('div', { class: 'luoi2' },
      the('📋 Việc cần làm',
        viec.length ? viec.slice(0, 8).map(([r, t]) => dong(r.ma + ' · ' + r.viec, t)) : trong('🎉 Không có việc gấp hôm nay.'),
        h('div', { class: 'nho', style: 'margin-top:6px' }, d.viec.soTuanToi + ' việc trong 7 ngày tới' + (d.viec.soNho ? ' · ' + d.viec.soNho + ' việc đang nhờ Claude' : ''))),
      the('📅 Bài đã hẹn giờ',
        d.bai.length ? d.bai.map(b => dong(b.ten, nhan(b.ngay + (b.gio ? ' ' + b.gio : ''), 'xanh'))) : trong('Chưa có bài nào hẹn giờ trong bảng Y_Tuong.'),
        h('div', { class: 'nho', style: 'margin-top:6px' }, 'Bài hẹn trực tiếp trên Business Suite (Instagram) không hiện ở đây.'))));

    if (d.loi.length) el.append(the('Lỗi gần nhất', d.loi.map(l => dong(l.nd, h('span', { class: 'nho' }, l.gio)))));
  },
};
