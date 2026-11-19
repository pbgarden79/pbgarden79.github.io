// Màn PHÒNG TRỒNG — dữ liệu từ bdkPhong_() trong B1_BangDieuKhien.gs, gửi lên Supabase
MAN.phong = {
  tieuDe: '🌡️ Phòng trồng',
  ve(d, el) {
    const kh = d.khiHau, gio = kh.map(r => r.gio), vuon = d.viTriCamBien === 'vuon';
    if (vuon) el.append(h('div', { class: 'the', style: 'margin-bottom:12px;background:var(--cam-nhat);border-color:#f1d9b5' },
      h('div', { class: 'nhan', style: 'color:var(--cam)' }, 'Cảm biến đang đặt NGOÀI VƯỜN (từ 06/11). Phòng chạy không cảm biến: tạo ẩm tắt, đèn theo lịch. Biểu đồ dưới là số đo ngoài vườn.')));
    el.append(h('div', { class: 'luoi2' },
      the('Nhiệt độ 24 giờ', bieuDo([
        { ten: vuon ? 'Vườn' : 'Phòng', mau: '#c0602a', giaTri: kh.map(r => vuon ? r.nhietVuon : r.nhiet) },
        { ten: 'Ngoài trời (dự báo)', mau: '#9aa59a', giaTri: kh.map(r => r.nhietNgoai) }], gio, '°')),
      the('Độ ẩm 24 giờ', bieuDo([
        { ten: vuon ? 'Vườn' : 'Phòng', mau: '#2f6fa8', giaTri: kh.map(r => vuon ? r.amVuon : r.am) },
        { ten: 'Ngoài trời (dự báo)', mau: '#9aa59a', giaTri: kh.map(r => r.amNgoai) }], gio, '%'))));

    const gioBat = k => Math.round(kh.filter(r => r[k]).length * 5 / 60 * 10) / 10;
    el.append(h('div', { class: 'luoi2' },
      the('🔌 Thiết bị', d.thietBi.length ? d.thietBi.map(t => dong(t.ten + (t.tay ? ' (' + t.tay + ')' : ''),
        nhan(t.bat ? 'Đang bật' + (t.tu ? ' từ ' + t.tu : '') : 'Tắt', t.bat ? 'xanh' : 'xam'))) : trong('Chưa khai báo thiết bị.'),
        h('div', { class: 'nho', style: 'margin-top:6px' }, '24 giờ qua: tạo ẩm ' + gioBat('taoAm') + ' giờ · đèn ' + gioBat('den') + ' giờ · quạt ' + gioBat('quat') + ' giờ')),
      the('🎚️ Ngưỡng đang dùng', Object.keys(d.nguong).length ? Object.entries(d.nguong).map(([k, n]) => dong(n.mt || k, h('b', {}, String(n.gt)))) : trong('Chưa có tab Dieu_Khien.'),
        h('div', { class: 'nho', style: 'margin-top:6px' }, 'Báo khẩn khi: nhiệt > ' + d.canhBao.TEMP_MAX + '°C hoặc < ' + d.canhBao.TEMP_MIN + '°C · ẩm < ' + d.canhBao.HUM_MIN + '% hoặc > ' + d.canhBao.HUM_MAX + '%'))));
  },
};
