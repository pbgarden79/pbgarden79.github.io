// Kết nối Supabase (dự án pb-garden-79-app, Singapore).
// Khóa "publishable" được phép công khai: quyền thật do RLS và hàm máy chủ quyết định.
// TUYỆT ĐỐI không đặt khóa bí mật (secret / service_role) vào bất kỳ file nào của trang.
const SB = {
  url: 'https://pkxxneeonhvoratigpye.supabase.co',
  key: 'sb_publishable_FTv3P9BqWo1kcDoLWKFIdg_Gk5BXlsJ',
};

/** Gọi API Supabase. token = phiên của khách (nếu có). Trả { ok, status, data }.
 *  Dự phòng 2 (27/11): chờ tối đa 12 giây (Supabase treo → trả lỗi thay vì trang đứng mãi); lỗi máy chủ báo về shop (bao-loi.js). */
async function sbFetch(path, { method = 'GET', body, token } = {}) {
  const ac = typeof AbortController === 'function' ? new AbortController() : null;
  const hen = ac && setTimeout(() => ac.abort(), 12000);
  const ten = path.replace(/\?.*$/, ''); // chỉ tên hàm, không tham số
  try {
    const r = await fetch(SB.url + path, {
      method,
      headers: { apikey: SB.key, 'Content-Type': 'application/json', Authorization: 'Bearer ' + (token || SB.key) },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: ac ? ac.signal : undefined,
    });
    const text = await r.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
    if (r.status >= 500 && window.pbBaoLoi) pbBaoLoi('supabase_' + r.status, ten);
    return { ok: r.ok, status: r.status, data };
  } catch (e) {
    const hetGio = e && e.name === 'AbortError';
    if (window.pbBaoLoi && navigator.onLine !== false) pbBaoLoi(hetGio ? 'supabase_het_gio' : 'supabase_mang', ten);
    return { ok: false, status: 0, data: { loi: hetGio ? 'het_gio' : 'loi_mang' } };
  } finally { if (hen) clearTimeout(hen); }
}
