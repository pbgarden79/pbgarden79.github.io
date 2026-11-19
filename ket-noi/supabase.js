// Kết nối Supabase (dự án pb-garden-79-app, Singapore).
// Khóa "publishable" được phép công khai: quyền thật do RLS và hàm máy chủ quyết định.
// TUYỆT ĐỐI không đặt khóa bí mật (secret / service_role) vào bất kỳ file nào của trang.
const SB = {
  url: 'https://pkxxneeonhvoratigpye.supabase.co',
  key: 'sb_publishable_FTv3P9BqWo1kcDoLWKFIdg_Gk5BXlsJ',
};

/** Gọi API Supabase. token = phiên của khách (nếu có). Trả { ok, status, data }. */
async function sbFetch(path, { method = 'GET', body, token } = {}) {
  try {
    const r = await fetch(SB.url + path, {
      method,
      headers: { apikey: SB.key, 'Content-Type': 'application/json', Authorization: 'Bearer ' + (token || SB.key) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await r.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
    return { ok: r.ok, status: r.status, data };
  } catch (e) {
    return { ok: false, status: 0, data: { loi: 'loi_mang' } };
  }
}
