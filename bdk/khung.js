// KHUNG bảng điều khiển: đọc bản tóm tắt từ Supabase (bdk_ban_tom_tat) một lần, chuyển màn không cần tải lại.
let manDang = 'trang_chu', duLieu = {};

async function taiDuLieu() {
  const { data, error } = await SB.from('bdk_ban_tom_tat').select('man,du_lieu');
  if (error) throw error;
  duLieu = {};
  (data || []).forEach(r => { duLieu[r.man] = r.du_lieu; });
  if (!data || !data.length) throw new Error('Chưa có số liệu, hoặc tài khoản này chưa được cấp quyền chủ shop.');
}

async function moMan(ten) {
  manDang = ten;
  document.querySelectorAll('#menu button[data-man]').forEach(b => b.classList.toggle('dang', b.dataset.man === ten));
  const m = MAN[ten], nd = document.getElementById('noi-dung');
  document.getElementById('tieu-de').textContent = m.tieuDe;
  // Màn có hàm tai() (vd Combo) đọc sống từ Supabase; các màn khác dùng bản tóm tắt 15 phút
  if (m.tai) {
    nd.replaceChildren(trong('Đang đọc dữ liệu…'));
    try { duLieu[ten] = await m.tai(); } catch (e) { return nd.replaceChildren(h('div', { class: 'loi' }, e.message || String(e))); }
    if (manDang !== ten) return;
  }
  const d = duLieu[ten];
  if (!d) return nd.replaceChildren(trong('Chưa có số liệu cho màn này. Hệ thống gửi số liệu mỗi 15 phút.'));
  document.getElementById('luc').textContent = 'Số liệu lúc ' + d.luc;
  nd.replaceChildren();
  if (d.loiDoc) return nd.append(h('div', { class: 'loi' }, 'Hệ thống chưa đọc được số liệu: ' + d.loiDoc));
  try { m.ve(d, nd); } catch (e) { nd.replaceChildren(h('div', { class: 'loi' }, 'Lỗi hiển thị: ' + e.message)); }
}

// ── GIAI ĐOẠN 3: nút thao tác. Lệnh ghi vào Supabase bdk_lenh; Apps Script làm trong ≤ 5 phút, báo lại Telegram + khung "Lệnh gần đây".
const TEN_TB = { hum: 'Quạt hơi nước (tạo ẩm)', light: 'Đèn trồng cây', fan: 'Quạt thông gió', tat_ca: 'Tất cả thiết bị' };
function moTaLenh(l) {
  const p = l.tham_so || {};
  if (l.loai === 'thiet_bi') return (TEN_TB[p.tb] || p.tb) + ' → ' + ({ on: 'BẬT', off: 'TẮT', auto: 'tự động' })[p.che_do];
  if (l.loai === 'xong_viec') return 'Xong việc ' + p.ma;
  if (l.loai === 'hoan_viec') return 'Dời việc ' + p.ma + ' +' + (p.ngay || 1) + ' ngày';
  if (l.loai === 'tao_combo') return 'Tạo combo ' + p.loai + ' · SĐT …' + String(p.sdt || '').slice(-3);
  return l.loai;
}

async function guiLenh(loai, thamSo, cauHoi) {
  if (!confirm(cauHoi + '\n\nHệ thống làm trong khoảng 5 phút và báo lại trên Telegram.')) return false;
  const { error } = await SB.from('bdk_lenh').insert({ loai, tham_so: thamSo });
  if (error) { alert(/qua_nhieu_lenh/.test(error.message) ? 'Anh bấm hơi nhiều, chờ vài phút rồi thử lại.' : 'Chưa gửi được lệnh: ' + error.message); return false; }
  hienLenhGanDay();
  return true;
}

/** Khung "Lệnh gần đây" — đặt cuối các màn có nút. */
function oLenhGanDay() {
  const el = the('🖥️ Lệnh gần đây từ bảng', h('div', { id: 'lenh-gan-day' }, trong('Đang đọc…')));
  setTimeout(hienLenhGanDay, 0);
  return el;
}
async function hienLenhGanDay() {
  const el = document.getElementById('lenh-gan-day');
  if (!el) return;
  const { data, error } = await SB.from('bdk_lenh').select('loai,tham_so,trang_thai,ket_qua,tao_luc').order('id', { ascending: false }).limit(8);
  if (error) return el.replaceChildren(trong('Chưa đọc được lệnh: ' + error.message));
  const MAU = { cho: ['chờ ≤ 5 phút', 'cam'], dang: ['đang làm', 'cam'], xong: ['xong', 'xanh'], loi: ['lỗi', 'do'], het_han: ['bỏ (quá 30 phút)', 'xam'] };
  el.replaceChildren(...(data && data.length ? data.map(l => h('div', { class: 'dong' },
    h('span', {}, moTaLenh(l), h('div', { class: 'nho' }, new Date(l.tao_luc).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) +
      (l.ket_qua && l.trang_thai !== 'cho' ? ' · ' + l.ket_qua.split('\n')[0] : ''))),
    nhan(...(MAU[l.trang_thai] || [l.trang_thai, 'xam'])))) : [trong('Chưa có lệnh nào.')]));
}
/** Nút thao tác: bấm xong khóa lại "⏳ đã gửi" để không gửi trùng (20/11: bấm 2 lần → việc bị dời 2 ngày). */
function nutNho(chu, onclick, chinh) {
  const b = h('button', { class: 'nut-nho' + (chinh ? ' chinh' : '') }, chu);
  b.onclick = async () => {
    if (b.disabled) return;
    b.disabled = true;
    let ok = false;
    try { ok = await onclick(); } finally {
      if (ok) { b.textContent = '⏳ đã gửi'; b.classList.remove('chinh'); } else b.disabled = false;
    }
  };
  return b;
}

async function moBang() {
  document.getElementById('dang-nhap').hidden = true;
  document.getElementById('bang').hidden = false;
  const nd = document.getElementById('noi-dung');
  nd.replaceChildren(trong('Đang đọc dữ liệu…'));
  try { await taiDuLieu(); moMan(manDang); } catch (e) { nd.replaceChildren(h('div', { class: 'loi' }, e.message || String(e))); }
}

document.querySelectorAll('#menu button[data-man]').forEach(b => b.onclick = () => moMan(b.dataset.man));
document.getElementById('tai-lai').onclick = () => moBang();
document.getElementById('thoat').onclick = async () => { await SB.auth.signOut(); batDauDangNhap(moBang); };
batDauDangNhap(moBang);
