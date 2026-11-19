// Màn PHUN VƯỜN — dữ liệu từ bdkPhun_() trong B1_BangDieuKhien.gs, gửi lên Supabase (luật phun: CONFIG.CLIMATE.VUON trong 00_Config.gs)
MAN.phun = {
  tieuDe: '💧 Phun vườn',
  ve(d, el) {
    const v = d.homNay, L = d.luat, pt = v.toiDa ? Math.min(100, Math.round(v.phut / v.toiDa * 100)) : 0;
    el.append(h('div', { class: 'luoi' },
      the('Hôm nay', h('div', { class: 'so' }, v.phut + ' / ' + v.toiDa + ' phút'), h('div', { class: 'thanh' }, h('i', { style: 'width:' + pt + '%' })),
        h('div', { class: 'nhan' }, v.lan + ' lượt phun'), h('div', { style: 'margin-top:6px' }, v.bat ? nhan(v.dangPhun ? 'Đang phun' : 'Đang nghỉ', v.dangPhun ? 'xanh' : 'xam') : nhan('Đã tắt phần vườn', 'do'))),
      the('Luật phun', dong('Khung giờ', L.gio), dong('Nhịp', 'phun ' + L.phun + "' · nghỉ " + L.nghi + "'"),
        dong('Chỉ phun khi', '≥ ' + L.nhietTu + '°C hoặc ẩm < ' + L.amDuoi + '%'), dong('Không phun khi', 'ẩm ≥ ' + L.amDung + '% hoặc sắp mưa'))));
    const kh = d.khiHau, gio = kh.map(r => r.gio);
    el.append(h('div', { class: 'luoi2' },
      the('Độ ẩm ngoài vườn 24 giờ', bieuDo([{ ten: 'Ẩm vườn', mau: '#2f6fa8', giaTri: kh.map(r => r.amVuon) }], gio, '%',
        [{ gt: L.amDuoi, ten: 'phun khi dưới ' + L.amDuoi + '%' }, { gt: L.amDung, ten: 'ngưng khi từ ' + L.amDung + '%' }])),
      the('Nhiệt độ ngoài vườn 24 giờ', bieuDo([{ ten: 'Nhiệt vườn', mau: '#c0602a', giaTri: kh.map(r => r.nhietVuon) }], gio, '°',
        [{ gt: L.nhietTu, ten: 'phun khi từ ' + L.nhietTu + '°C' }]))));
    el.append(h('div', { style: 'height:12px' }));
    el.append(the('Nhật ký phun hôm nay', d.nhatKy.length ? d.nhatKy.map(n => dong(n.nd, nhan(n.gio, n.loai === 'LOI' ? 'do' : 'xam'))) : trong('Hôm nay chưa có ghi chép phun.')));
  },
};
