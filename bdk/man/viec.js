// Màn VIỆC CẦN LÀM — dữ liệu từ bdkViec_() (tab Viec_Can_Lam). Giai đoạn 1 chỉ xem; đánh dấu xong vẫn dùng nút ✅ trên Telegram.
MAN.viec = {
  tieuDe: '📋 Việc cần làm',
  ve(d, el) {
    const nhom = (tieu, ds, mau, coNgay) => the(tieu + ' (' + ds.length + ')', ds.length ? ds.map(r =>
      h('div', { class: 'dong' },
        h('span', {}, h('b', {}, r.ma), ' · ', r.viec, h('div', { class: 'nho' }, [r.agent, r.lap && '🔁 ' + r.lap, r.ghiChu].filter(Boolean).join(' · '))),
        nhan(coNgay ? r.han + (r.gio ? ' ' + r.gio : '') : (r.gio || 'cả ngày'), mau))) : trong('Không có.'));
    el.append(h('div', { class: 'luoi2' },
      nhom('⚠️ Quá hạn', d.quaHan, 'do', true),
      nhom('📌 Hôm nay', d.homNay, 'cam', false)));
    el.append(h('div', { class: 'luoi2' },
      nhom('🗓️ 7 ngày tới', d.tuanToi, 'xanh', true),
      nhom('🙋 Đang nhờ Claude', d.nhoClaude, 'xam', true)));
    if (d.sau.length) el.append(nhom('Sau đó', d.sau, 'xam', true));
    el.append(h('p', { class: 'nho' }, 'Đánh dấu xong / dời việc: bấm nút trên tin ghim Telegram hoặc gõ /xong <mã>. Trang tự cập nhật khi bấm ↻ Tải lại.'));
  },
};
