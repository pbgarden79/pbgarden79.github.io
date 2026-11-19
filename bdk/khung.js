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
