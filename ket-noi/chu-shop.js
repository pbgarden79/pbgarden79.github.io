// CHẾ ĐỘ CHỦ SHOP (anh duyệt Cách A, 27/11/2026). Lối vào kín: gõ pbgarden79.github.io/chu (404.html → /?chu=1), không có nút nào cho khách thấy.
// Đăng nhập bằng CÙNG tài khoản trang quản trị /bdk/: email + mật khẩu → mã 6 số Google Authenticator (bắt buộc, chưa cài thì cài ở /bdk/ trước).
// Xong → phiên chủ (aal2) lưu vào 'pb_phien' (ghi đè phiên ẩn danh của máy này); máy chủ thấy la_chu_shop() → mở mọi mã cây, không hết hạn
// (supabase/15_che_do_chu_shop.sql). Thanh nhỏ đầu trang: "Xem như khách mới" (chỉ tab này) · "Đăng xuất". Không lưu email/mật khẩu.

function chuShopLoi(loi) {
  return { xem_thu: 'Đang xem như khách mới bằng tài khoản chủ shop — không kích hoạt thật được. Bấm "Về chế độ chủ shop" ở đầu trang.',
    chu_shop: 'Tài khoản chủ shop không dùng để kích hoạt combo của khách.' }[loi] || '';
}

const _diaChiKhongChu = () => { const u = new URL(location.href); u.searchParams.delete('chu'); return u.pathname + u.search + u.hash; };
const _taiLai = url => location.replace(url || _diaChiKhongChu());

function _xemKhach(bat) {
  try { bat ? sessionStorage.setItem(XEM_KHACH_KHOA, '1') : sessionStorage.removeItem(XEM_KHACH_KHOA); } catch (e) { /* bỏ qua */ }
  _taiLai();
}

async function _dangXuatChu() {
  const p = docPhienGoc();
  if (p && p.access_token) await sbFetch('/auth/v1/logout?scope=local', { method: 'POST', token: p.access_token });
  try { localStorage.removeItem(PHIEN_KHOA); sessionStorage.removeItem(XEM_KHACH_KHOA); } catch (e) { /* bỏ qua */ }
  _taiLai();
}

/** Thanh nhỏ dưới đầu trang khi máy đang có phiên chủ shop. */
function _thanhChu() {
  const xem = xemNhuKhach();
  const thanh = h('div', { class: 'thanh-chu' + (xem ? ' xem' : '') },
    h('span', {}, xem ? '👀 Đang xem như khách mới' : '👑 Chế độ chủ shop'),
    xem ? h('button', { type: 'button', onclick: () => _xemKhach(false) }, 'Về chế độ chủ shop')
        : h('button', { type: 'button', onclick: () => _xemKhach(true) }, 'Xem như khách mới'),
    h('button', { type: 'button', onclick: _dangXuatChu }, 'Đăng xuất'));
  document.querySelector('header').after(thanh);
}

/** Màn đăng nhập chủ shop (thay chỗ nội dung trang cho tới khi xong hoặc bấm Quay lại). */
function _manDangNhapChu() {
  const main = document.getElementById('app');
  const vo = h('div', { class: 'vo-chu' });
  main.hidden = true;
  main.before(vo);
  const bao = h('p', { class: 'bao', role: 'alert' });
  const quayLai = h('button', { type: 'button', class: 'nut phu', onclick: () => _taiLai() }, 'Quay lại');
  const ve = (...con) => vo.replaceChildren(h('section', { class: 'the' }, h('h3', {}, '👑 Đăng nhập chủ shop'), ...con, bao, quayLai));

  // Bước 1: email + mật khẩu
  const email = h('input', { type: 'email', autocomplete: 'username', autocapitalize: 'none' });
  const mk = h('input', { type: 'password', autocomplete: 'current-password' });
  const nut1 = h('button', { class: 'nut', type: 'submit' }, 'Tiếp tục');
  const form1 = h('form', {}, h('p', { class: 'nho' }, 'Dùng cùng tài khoản trang quản trị.'),
    h('label', {}, 'Email', email), h('label', {}, 'Mật khẩu', mk), nut1);
  form1.onsubmit = async ev => {
    ev.preventDefault();
    bao.textContent = ''; nut1.disabled = true;
    const r = await sbFetch('/auth/v1/token?grant_type=password', { method: 'POST', body: { email: email.value.trim(), password: mk.value } });
    nut1.disabled = false;
    if (!r.ok || !r.data || !r.data.access_token) { bao.textContent = r.status === 0 ? 'Chưa kết nối được, kiểm tra mạng rồi thử lại.' : 'Email hoặc mật khẩu chưa đúng.'; return; }
    mk.value = '';
    const f = ((r.data.user && r.data.user.factors) || []).find(x => x.factor_type === 'totp' && x.status === 'verified');
    if (!f) { bao.textContent = 'Tài khoản chưa bật xác minh 2 bước. Anh mở trang quản trị /bdk/ cài Google Authenticator trước.'; return; }
    buoc2(r.data.access_token, f.id);
  };

  // Bước 2: mã 6 số Google Authenticator → phiên aal2
  const buoc2 = (token1, factorId) => {
    const ma = h('input', { type: 'text', inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: '6' });
    const nut2 = h('button', { class: 'nut', type: 'submit' }, 'Xác minh');
    const form2 = h('form', {}, h('label', {}, 'Mã 6 số trong Google Authenticator', ma), nut2);
    form2.onsubmit = async ev => {
      ev.preventDefault();
      bao.textContent = ''; nut2.disabled = true;
      const c = await sbFetch('/auth/v1/factors/' + factorId + '/challenge', { method: 'POST', body: {}, token: token1 });
      const v = c.ok && c.data && c.data.id ? await sbFetch('/auth/v1/factors/' + factorId + '/verify',
        { method: 'POST', body: { challenge_id: c.data.id, code: ma.value.replace(/\D/g, '') }, token: token1 }) : c;
      nut2.disabled = false;
      if (!v.ok || !v.data || !v.data.access_token) { bao.textContent = 'Mã chưa đúng hoặc đã hết hạn, chờ mã mới rồi nhập lại.'; ma.value = ''; return; }
      const k = await sbFetch('/rest/v1/rpc/la_chu_shop', { method: 'POST', body: {}, token: v.data.access_token });
      if (!(k.ok && k.data === true)) {
        await sbFetch('/auth/v1/logout?scope=local', { method: 'POST', token: v.data.access_token });
        bao.textContent = 'Tài khoản này chưa có quyền chủ shop.'; return;
      }
      luuPhien(v.data, true); // ghi đè phiên ẩn danh của máy này
      try { sessionStorage.removeItem(XEM_KHACH_KHOA); } catch (e) { /* bỏ qua */ }
      _taiLai();
    };
    ve(form2);
    ma.focus();
  };

  ve(form1);
}

(function () {
  const st = document.createElement('style');
  st.textContent = '.thanh-chu{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;max-width:560px;margin:8px auto 0;padding:6px 10px;'
    + 'background:#fff8e1;border:1px solid #f0d58a;border-radius:12px;font-size:13px;color:#6b4e00}'
    + '.thanh-chu span{flex:1 1 auto;font-weight:700}.thanh-chu.xem{background:#e8f1fb;border-color:#b5cdea;color:#1f4a78}'
    + '.thanh-chu button{background:#fff;border:1px solid currentColor;border-radius:9px;padding:4px 9px;font:inherit;font-size:12px;color:inherit;cursor:pointer}'
    + '.vo-chu{max-width:560px;margin:0 auto;padding:8px 16px 24px}'
    + '.vo-chu input[type=email],.vo-chu input[type=password]{display:block;width:100%;margin-top:4px;padding:11px 12px;font-size:16px;border:1px solid #c9d4c4;border-radius:10px}';
  document.head.append(st);
  const p = docPhienGoc();
  if (p && p.chu) _thanhChu();
  if (new URLSearchParams(location.search).has('chu')) {
    if (p && p.chu) history.replaceState(null, '', _diaChiKhongChu()); // đã đăng nhập rồi → bỏ ?chu trên địa chỉ
    else _manDangNhapChu();
  }
})();
