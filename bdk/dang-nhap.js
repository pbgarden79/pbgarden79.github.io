// ĐĂNG NHẬP chủ shop: email + mật khẩu → xác minh 2 bước (mã 6 số từ app Google Authenticator).
// Lần đầu chưa có xác minh 2 bước → hiện mã QR để anh quét vào Google Authenticator.
// Khóa công khai (publishable) được phép nằm trên trang; dữ liệu được RLS khóa: chỉ tài khoản trong chu_shop + aal2 đọc được.
const SB = supabase.createClient('https://pkxxneeonhvoratigpye.supabase.co', 'sb_publishable_FTv3P9BqWo1kcDoLWKFIdg_Gk5BXlsJ',
  { auth: { storageKey: 'pb_bdk_phien', persistSession: true, autoRefreshToken: true } });

function oDangNhap(...con) {
  const el = document.getElementById('dang-nhap');
  document.getElementById('bang').hidden = true;
  el.hidden = false;
  el.replaceChildren(h('div', { class: 'dn' }, h('h1', {}, '🌿 Pb Garden 79'), h('p', { class: 'nhan' }, 'Bảng điều khiển chủ shop'), ...con));
}
function baoLoi(chu) { const c = document.querySelector('.dn .loi'); if (c) c.remove(); document.querySelector('.dn').append(h('div', { class: 'loi' }, chu)); }
function oNhap(nhanChu, attrs) { const i = h('input', attrs); return [h('label', {}, nhanChu), i]; }

/** Kiểm tra trạng thái đăng nhập → gọi xong() khi đã đủ 2 bước. */
async function batDauDangNhap(xong) {
  const { data: { session } } = await SB.auth.getSession();
  if (!session || session.user.is_anonymous) return manMatKhau(xong);
  const { data: aal } = await SB.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal.currentLevel === 'aal2') return xong();
  if (aal.nextLevel === 'aal2') return manMa2Buoc(xong);
  return manCaiDat2Buoc(xong);
}

function manMatKhau(xong) {
  const [lE, email] = oNhap('Email', { type: 'email', autocomplete: 'username' });
  const [lM, mk] = oNhap('Mật khẩu', { type: 'password', autocomplete: 'current-password' });
  const nut = h('button', {}, 'Đăng nhập');
  oDangNhap(h('form', {}, lE, email, lM, mk, nut));
  nut.parentNode.onsubmit = async ev => {
    ev.preventDefault();
    nut.disabled = true;
    const { error } = await SB.auth.signInWithPassword({ email: email.value.trim(), password: mk.value });
    nut.disabled = false;
    if (error) return baoLoi('Email hoặc mật khẩu chưa đúng.');
    batDauDangNhap(xong);
  };
}

async function manMa2Buoc(xong) {
  const { data } = await SB.auth.mfa.listFactors();
  const f = (data.totp || []).find(x => x.status === 'verified');
  if (!f) return manCaiDat2Buoc(xong);
  const [lC, ma] = oNhap('Mã 6 số trong Google Authenticator', { inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: '6' });
  const nut = h('button', {}, 'Xác minh');
  oDangNhap(h('form', {}, lC, ma, nut), h('button', { class: 'phu-nut', onclick: () => SB.auth.signOut().then(() => manMatKhau(xong)) }, 'Đăng nhập tài khoản khác'));
  ma.focus();
  nut.parentNode.onsubmit = async ev => {
    ev.preventDefault();
    const { error } = await SB.auth.mfa.challengeAndVerify({ factorId: f.id, code: ma.value.trim() });
    if (error) return baoLoi('Mã chưa đúng hoặc đã hết hạn, thử mã mới.');
    xong();
  };
}

async function manCaiDat2Buoc(xong) {
  // Bỏ các lần cài dở trước (chưa xác minh) rồi tạo mới
  const { data: ds } = await SB.auth.mfa.listFactors();
  for (const f of (ds && ds.all || []).filter(x => x.status !== 'verified')) await SB.auth.mfa.unenroll({ factorId: f.id });
  const { data, error } = await SB.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Google Authenticator' });
  if (error) return oDangNhap(h('div', { class: 'loi' }, 'Chưa bật được xác minh 2 bước: ' + error.message));
  const [lC, ma] = oNhap('Nhập mã 6 số đang hiện trong app', { inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: '6' });
  const nut = h('button', {}, 'Bật xác minh 2 bước');
  oDangNhap(h('p', {}, 'Lần đầu: mở app Google Authenticator → dấu + → Quét mã QR. Không quét được thì chọn "Nhập khóa thiết lập" và gõ khóa bên dưới.'),
    h('img', { src: data.totp.qr_code, alt: 'Mã QR xác minh 2 bước' }), h('code', {}, data.totp.secret), h('form', {}, lC, ma, nut));
  nut.parentNode.onsubmit = async ev => {
    ev.preventDefault();
    const { error: e2 } = await SB.auth.mfa.challengeAndVerify({ factorId: data.id, code: ma.value.trim() });
    if (e2) return baoLoi('Mã chưa đúng, chờ mã mới rồi nhập lại.');
    xong();
  };
}
