// Màn COMBO + APP — đọc SỐNG từ Supabase (rpc bdk_combo, supabase/04_bdk_combo.sql), không qua Apps Script.
// SĐT khách chỉ có 3 số cuối. Tạo combo mới vẫn bằng /combo trên Telegram.
MAN.combo = {
  tieuDe: '🪴 Combo + app chăm cây',
  async tai() {
    const { data, error } = await SB.rpc('bdk_combo');
    if (error) throw new Error('Chưa đọc được combo: ' + error.message);
    return data;
  },
  ve(d, el) {
    const kh = d.combo.filter(c => c.kich_hoat), sapHet = kh.filter(c => c.con_ngay !== null && c.con_ngay >= 0 && c.con_ngay <= 3);
    el.append(h('div', { class: 'luoi' },
      the('Combo đã tạo', h('div', { class: 'so' }, String(d.combo.length)), h('div', { class: 'nhan' }, kh.length + ' đã kích hoạt')),
      the('Khách đã lưu', h('div', { class: 'so' }, String(d.so_khach)), h('div', { class: 'nhan' }, d.so_dong_y_uu_dai + ' đồng ý nhận ưu đãi')),
      the('Gói trả phí đang chạy', h('div', { class: 'so' }, String(d.goi_dang_chay)), h('div', { class: 'nhan' }, d.goi_thang + ' tháng · ' + d.goi_nam + ' năm')),
      the('Sắp hết miễn phí', h('div', { class: 'so', style: sapHet.length ? 'color:var(--cam)' : '' }, String(sapHet.length)), h('div', { class: 'nhan' }, 'Còn ≤ 3 ngày → mời mua gói'))));
    const nhanCb = c => !c.kich_hoat ? nhan('chưa kích hoạt', 'xam') : c.con_ngay === null ? nhan('đã kích hoạt', 'xanh')
      : c.con_ngay < 0 ? nhan('hết miễn phí ' + c.han, 'do') : c.con_ngay <= 3 ? nhan('còn ' + c.con_ngay + ' ngày', 'cam') : nhan('còn ' + c.con_ngay + ' ngày', 'xanh');
    // Giai đoạn 3 (20/11): tạo combo ngay trên bảng → lệnh tao_combo; mã kích hoạt + ảnh QR chỉ gửi về Telegram của anh
    const sdt = h('input', { inputmode: 'numeric', placeholder: '0901234567', maxlength: '11' });
    const loai = h('select', {}, h('option', { value: '' }, 'Đang tải loại cây…'));
    const goi = h('input', { value: 'A – Cơ bản', maxlength: '40' });
    fetch('/noi-dung/cay.json').then(r => r.json()).then(j => { delete j._ghi_chu; loai.replaceChildren(...Object.keys(j).map(k => h('option', { value: k }, j[k].ten))); })
      .catch(() => loai.replaceChildren(h('option', { value: '' }, 'Không tải được danh sách cây')));
    const tao = async () => {
      const so = sdt.value.replace(/\D/g, '');
      if (!/^0\d{9}$/.test(so)) return alert('Số điện thoại chưa đúng (10 số, bắt đầu bằng 0).');
      if (!loai.value) return alert('Chọn loại cây.');
      const ok = await guiLenh('tao_combo', { sdt: so, loai: loai.value, goi: goi.value.trim() },
        'Tạo combo ' + loai.options[loai.selectedIndex].text + ' cho SĐT ' + so + '?\nMã kích hoạt và ảnh QR sẽ gửi về Telegram của anh.');
      if (ok) sdt.value = '';
      return ok; // nút khóa "⏳ đã gửi" (nutNho) để không tạo 2 combo
    };
    el.append(the('➕ Tạo combo mới', h('div', { class: 'form-cb' },
      h('div', {}, h('label', {}, 'SĐT khách (anh đã duyệt)'), sdt), h('div', {}, h('label', {}, 'Loại cây'), loai),
      h('div', {}, h('label', {}, 'Gói'), goi), h('div', {}, nutNho('Tạo combo', tao, true))),
      h('div', { class: 'nho', style: 'margin-top:6px' }, 'Chỉ nhập SĐT anh đã duyệt trước khi khách đặt đơn. Mã kích hoạt KHÔNG hiện trên trang này.')));
    el.append(h('div', { style: 'height:12px' }));
    el.append(the('Danh sách combo', d.combo.length ? d.combo.map(c => h('div', { class: 'dong' },
      h('span', {}, h('b', {}, c.ma), ' · ', c.ten_cay, h('div', { class: 'nho' }, ['SĐT ' + c.sdt, 'tạo ' + c.tao, c.kich_hoat && 'kích hoạt ' + c.kich_hoat, c.goi].filter(Boolean).join(' · '))),
      nhanCb(c))) : trong('Chưa có combo nào.'),
      h('div', { class: 'nho', style: 'margin-top:6px' }, 'Vẫn tạo được bằng /combo trên Telegram. C001–C004 là dữ liệu thử, xóa trước khi bán thật.')));
    el.append(h('div', { style: 'height:12px' }));
    el.append(oLenhGanDay());
  },
};
