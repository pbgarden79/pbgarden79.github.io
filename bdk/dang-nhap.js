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

const KHOA_CAI = 'pb_bdk_cai_2buoc';
function docCaiDo() { try { return JSON.parse(sessionStorage.getItem(KHOA_CAI) || 'null'); } catch (e) { return null; } }
function ghiCaiDo(v) { try { v ? sessionStorage.setItem(KHOA_CAI, JSON.stringify(v)) : sessionStorage.removeItem(KHOA_CAI); } catch (e) { /* trình duyệt chặn bộ nhớ */ } }

async function manCaiDat2Buoc(xong, taoMoi) {
  // iPhone hay tải lại trang khi chuyển qua app Authenticator rồi quay về → giữ nguyên mã QR đang cài dở (trong tab này),
  // nếu không sẽ sinh mã mới và mã 6 số anh vừa quét bị báo sai. "Tạo mã QR mới" thì bỏ hết bản cài dở.
  const { data: ds } = await SB.auth.mfa.listFactors();
  const doDang = (ds && ds.all || []).filter(x => x.status !== 'verified');
  const cu = docCaiDo();
  let data = !taoMoi && cu && doDang.some(f => f.id === cu.id) ? cu : null;
  if (!data) {
    for (const f of doDang) await SB.auth.mfa.unenroll({ factorId: f.id });
    const kq = await SB.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Google Authenticator ' + Date.now() });
    if (kq.error) return oDangNhap(h('div', { class: 'loi' }, 'Chưa bật được xác minh 2 bước: ' + kq.error.message));
    data = { id: kq.data.id, totp: { qr_code: kq.data.totp.qr_code, secret: kq.data.totp.secret } };
    ghiCaiDo(data);
  }
  const [lC, ma] = oNhap('Nhập mã 6 số đang hiện trong app', { inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: '6' });
  const nut = h('button', {}, 'Bật xác minh 2 bước');
  oDangNhap(h('p', {}, 'Lần đầu: mở app Google Authenticator → dấu + → Quét mã QR. Không quét được thì chọn "Nhập khóa thiết lập" và gõ khóa bên dưới.'),
    h('img', { src: data.totp.qr_code, alt: 'Mã QR xác minh 2 bước' }), h('code', {}, data.totp.secret), h('form', {}, lC, ma, nut),
    h('button', { class: 'phu-nut', onclick: () => manCaiDat2Buoc(xong, true) }, 'Tạo mã QR mới (xóa mục cũ trong app trước)'));
  nut.parentNode.onsubmit = async ev => {
    ev.preventDefault();
    const { error: e2 } = await SB.auth.mfa.challengeAndVerify({ factorId: data.id, code: ma.value.replace(/\D/g, '') });
    if (e2) return baoLoi('Mã chưa đúng. Kiểm tra đúng mục "Pb Garden" mới nhất trong app, chờ mã mới rồi nhập lại.');
    ghiCaiDo(null);
    xong();
  };
}
