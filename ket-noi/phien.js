// Phiên đăng nhập ẩn danh: mỗi điện thoại một phiên, lưu trong máy khách (localStorage).
// Chỉ tạo phiên khi khách bấm kích hoạt, không tạo cho mọi người xem trang.
// Chế độ chủ shop (ket-noi/chu-shop.js, 27/11): phiên chủ shop nằm cùng chỗ, có thêm chu: true (ghi đè phiên ẩn danh của máy đó).
const PHIEN_KHOA = 'pb_phien';
const XEM_KHACH_KHOA = 'pb_xem_khach';

function docPhienGoc() {
  try { return JSON.parse(localStorage.getItem(PHIEN_KHOA) || 'null'); } catch (e) { return null; }
}

/** Chủ shop bấm "Xem như khách mới" (chỉ trong tab đang mở) → trang coi như máy chưa có phiên. */
function xemNhuKhach() {
  try { return sessionStorage.getItem(XEM_KHACH_KHOA) === '1' && !!(docPhienGoc() || {}).chu; } catch (e) { return false; }
}

function docPhien() { return xemNhuKhach() ? null : docPhienGoc(); }

/** Mã ảo "XEM-<loại cây>": chủ shop xem thử 1 loại cây chưa có combo (app.js tạo từ /?cay=…, chỉ khi có phiên chủ). */
function laMaXem(ma) { return typeof ma === 'string' && ma.startsWith('XEM-'); }

function luuPhien(d, chu) {
  if (!d || !d.access_token) return null;
  const p = { access_token: d.access_token, refresh_token: d.refresh_token,
    het_luc: d.expires_at ? d.expires_at * 1000 : Date.now() + (d.expires_in || 3600) * 1000 };
  if (chu) p.chu = true;
  try { localStorage.setItem(PHIEN_KHOA, JSON.stringify(p)); } catch (e) { /* trình duyệt chặn lưu → dùng trong lúc mở trang */ }
  return p;
}

/** Trả token còn hạn; hết hạn thì làm mới; chưa có và taoMoi=true thì đăng nhập ẩn danh. */
async function layToken(taoMoi) {
  let p = docPhienGoc();
  if (p && p.het_luc - Date.now() > 60000) return p.access_token;
  if (p && p.refresh_token) {
    const r = await sbFetch('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: p.refresh_token } });
    if (r.ok) return luuPhien(r.data, p.chu).access_token;
    if (p.chu && (r.status === 400 || r.status === 401)) { try { localStorage.removeItem(PHIEN_KHOA); } catch (e) { /* bỏ qua */ } return null; } // phiên chủ hết hạn → đăng nhập lại
  }
  if (!taoMoi) return null;
  const r = await sbFetch('/auth/v1/signup', { method: 'POST', body: {} });
  return r.ok ? luuPhien(r.data).access_token : null;
}

/** Gọi hàm máy chủ (RPC) bằng phiên của khách. Đang "xem như khách mới" thì không gọi (không tạo phiên ẩn danh đè phiên chủ). */
async function goiHam(ten, thamSo, taoMoi) {
  if (xemNhuKhach()) return { ok: false, data: { loi: 'xem_thu' } };
  const token = await layToken(taoMoi);
  if (!token) return { ok: false, data: { loi: taoMoi ? 'chua_dang_nhap' : 'chua_co_phien' } };
  return sbFetch('/rest/v1/rpc/' + ten, { method: 'POST', body: thamSo || {}, token });
}
