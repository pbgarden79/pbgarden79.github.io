// Màn VIỆC CẦN LÀM — dữ liệu từ bdkViec_() (tab Viec_Can_Lam), Apps Script B1_BangDieuKhien.gs, gửi lên Supabase.
// Giai đoạn 3 (20/11): nút ✅ Xong / ⏰ +1 ngày → lệnh /xong /hoan (01_Core), hỏi lại trước khi gửi.
MAN.viec = {
  tieuDe: '📋 Việc cần làm',
  ve(d, el) {
    const nut = r => h('span', { class: 'cum-nut', style: 'margin-top:6px' },
      nutNho('✅ Xong', () => guiLenh('xong_viec', { ma: r.ma }, 'Đánh dấu XONG việc ' + r.ma + ': ' + r.viec + '?'), true),
      nutNho('⏰ +1 ngày', () => guiLenh('hoan_viec', { ma: r.ma, ngay: 1 }, 'Dời việc ' + r.ma + ' sang ngày mai?')));
    const nhom = (tieu, ds, mau, coNgay) => the(tieu + ' (' + ds.length + ')', ds.length ? ds.map(r =>
      h('div', { class: 'dong' },
        h('span', {}, h('b', {}, r.ma), ' · ', r.viec, h('div', { class: 'nho' }, [r.agent, r.lap && '🔁 ' + r.lap, r.ghiChu].filter(Boolean).join(' · ')), nut(r)),
        nhan(coNgay ? r.han + (r.gio ? ' ' + r.gio : '') : (r.gio || 'cả ngày'), mau))) : trong('Không có.'));
    el.append(h('div', { class: 'luoi2' },
      nhom('⚠️ Quá hạn', d.quaHan, 'do', true),
      nhom('📌 Hôm nay', d.homNay, 'cam', false)));
    el.append(h('div', { class: 'luoi2' },
      nhom('🗓️ 7 ngày tới', d.tuanToi, 'xanh', true),
      nhom('🙋 Đang nhờ Claude', d.nhoClaude, 'xam', true)));
    if (d.sau.length) el.append(nhom('Sau đó', d.sau, 'xam', true));
    el.append(oLenhGanDay());
    el.append(h('p', { class: 'nho' }, 'Bấm nút → hệ thống làm trong khoảng 5 phút, báo lại Telegram và cập nhật danh sách. Vẫn dùng được nút trên tin ghim Telegram như cũ.'));
  },
};
