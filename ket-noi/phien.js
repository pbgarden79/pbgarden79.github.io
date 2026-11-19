// Phiên đăng nhập ẩn danh: mỗi điện thoại một phiên, lưu trong máy khách (localStorage).
// Chỉ tạo phiên khi khách bấm kích hoạt, không tạo cho mọi người xem trang.
const PHIEN_KHOA = 'pb_phien';

function docPhien() {
  try { return JSON.parse(localStorage.getItem(PHIEN_KHOA) || 'null'); } catch (e) { return null; }
}

function luuPhien(d) {
  if (!d || !d.access_token) return null;
  const p = { access_token: d.access_token, refresh_token: d.refresh_token,
    het_luc: d.expires_at ? d.expires_at * 1000 : Date.now() + (d.expires_in || 3600) * 1000 };
  try { localStorage.setItem(PHIEN_KHOA, JSON.stringify(p)); } catch (e) { /* trình duyệt chặn lưu → dùng trong lúc mở trang */ }
  return p;
}

/** Trả token còn hạn; hết hạn thì làm mới; chưa có và taoMoi=true thì đăng nhập ẩn danh. */
async function layToken(taoMoi) {
  let p = docPhien();
  if (p && p.het_luc - Date.now() > 60000) return p.access_token;
  if (p && p.refresh_token) {
    const r = await sbFetch('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: p.refresh_token } });
    if (r.ok) return luuPhien(r.data).access_token;
  }
  if (!taoMoi) return null;
  const r = await sbFetch('/auth/v1/signup', { method: 'POST', body: {} });
  return r.ok ? luuPhien(r.data).access_token : null;
}

/** Gọi hàm máy chủ (RPC) bằng phiên của khách. */
async function goiHam(ten, thamSo, taoMoi) {
  const token = await layToken(taoMoi);
  if (!token) return { ok: false, data: { loi: taoMoi ? 'chua_dang_nhap' : 'chua_co_phien' } };
  return sbFetch('/rest/v1/rpc/' + ten, { method: 'POST', body: thamSo || {}, token });
}
