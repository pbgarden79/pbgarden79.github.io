// Màn hình NÂNG CAO: đã kích hoạt, còn hạn. Đếm ngày còn lại, nhắc lịch, gửi ảnh nhờ khám.
function manHinhNangCao(nd, ma, han) {
  const cay = nd.cay[nd.combo[ma].cay];
  const conLai = soNgayConLai(han);
  return h('section', { class: 'the nang-cao' },
    h('h3', {}, '⭐ Phần nâng cao'),
    h('p', { class: 'han' }, 'Còn ' + conLai + ' ngày · dùng đến hết ' + ngayVN(han)),
    h('h3', {}, '📅 Nhắc kiểm tra nước'),
    h('p', {}, 'Thêm lịch nhắc ' + cay.kiem_tra_ngay + ' ngày một lần vào điện thoại. Lịch nằm trên máy của anh/chị.'),
    h('button', { class: 'nut', onclick: () => taiLichNhac(cay, ma) }, '📅 Thêm vào lịch điện thoại'),
    h('a', { class: 'nut phu', href: linkGoogleLich(cay, ma), target: '_blank', rel: 'noopener' }, 'Hoặc thêm vào Google Lịch'),
    h('h3', {}, '🩺 Nhờ shop khám cây'),
    h('p', {}, 'Chụp 3 ảnh: cả cây, cận chỗ lạ, mặt dưới lá. Gửi cho shop kèm mã ' + ma + '.'),
    h('a', { class: 'nut phu', href: nd.lienHe.messenger, target: '_blank', rel: 'noopener' }, '💬 Gửi ảnh cho shop'));
}

function soNgayConLai(han) {
  return Math.max(0, Math.round((Date.parse(han + 'T00:00:00+07:00') - Date.parse(homNay() + 'T00:00:00+07:00')) / 864e5));
}

function ngayVN(iso) { const [y, m, d] = String(iso).split('-'); return d + '/' + m + '/' + y; }

function nhacText(cay, ma) {
  return { tieuDe: '🌿 Kiểm tra nước bể – ' + cay.ten,
    moTa: 'Nhìn mực nước bể chậu, cạn mới đổ. Mùa mưa chỉ đổ nửa bể. ' + location.origin + '/c/' + ma };
}

// Ngày mai theo giờ VN, dạng yyyymmdd (tính trên mốc 12:00 UTC để không lệch ngày)
function ngayMai() { return new Date(Date.parse(homNay() + 'T12:00:00Z') + 864e5).toISOString().slice(0, 10).replace(/-/g, ''); }

function taiLichNhac(cay, ma) {
  const t = nhacText(cay, ma), ngay = ngayMai();
  const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Pb Garden 79//App cham cay//VI', 'BEGIN:VEVENT',
    'UID:' + ma + '-' + Date.now() + '@pbgarden79', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z',
    'DTSTART;TZID=Asia/Ho_Chi_Minh:' + ngay + 'T080000', 'DURATION:PT10M', 'RRULE:FREQ=DAILY;INTERVAL=' + cay.kiem_tra_ngay,
    'SUMMARY:' + t.tieuDe.replace(/[,;]/g, ' '), 'DESCRIPTION:' + t.moTa.replace(/,/g, '\\,'),
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Kiểm tra nước bể cây', 'TRIGGER:PT0M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = h('a', { href: URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })), download: 'PbGarden79-' + ma + '.ics' });
  document.body.appendChild(a); a.click(); a.remove();
}

function linkGoogleLich(cay, ma) {
  const t = nhacText(cay, ma), ngay = ngayMai();
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(t.tieuDe) +
    '&details=' + encodeURIComponent(t.moTa) + '&dates=' + ngay + 'T010000Z/' + ngay + 'T011000Z' +
    '&recur=' + encodeURIComponent('RRULE:FREQ=DAILY;INTERVAL=' + cay.kiem_tra_ngay);
}
