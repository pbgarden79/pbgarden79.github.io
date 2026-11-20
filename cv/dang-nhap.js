// ĐĂNG NHẬP bảng điều hành PKD (/cv/): dùng chung tài khoản + xác minh 2 bước với /bdk/.
// Cùng storageKey 'pb_bdk_phien' nên đã đăng nhập ở /bdk/ thì vào /cv/ không phải đăng nhập lại (cùng trang pbgarden79.github.io).
// Khóa công khai (publishable) được phép nằm trên trang; dữ liệu do RLS khóa: chỉ tài khoản trong chu_shop + aal2 đọc được.
const SB = supabase.createClient('https://pkxxneeonhvoratigpye.supabase.co', 'sb_publishable_FTv3P9BqWo1kcDoLWKFIdg_Gk5BXlsJ',
  { auth: { storageKey: 'pb_bdk_phien', persistSession: true, autoRefreshToken: true } });

/** Tạo phần tử an toàn (không innerHTML). */
function hn(tag, attrs, ...con) {
  const e = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => { if (k.startsWith('on')) e[k] = v; else e.setAttribute(k, v); });
  con.flat().forEach(c => { if (c != null) e.append(c.nodeType ? c : String(c)); });
  return e;
}
function oDangNhap(...con) {
  document.getElementById('cv-app').hidden = true;
  const el = document.getElementById('dang-nhap');
  el.hidden = false;
  el.replaceChildren(hn('div', { class: 'dn' }, hn('h1', {}, 'PKD Hyundai Nha Trang'), hn('p', { class: 'nhan' }, 'Bảng điều hành – đăng nhập'), ...con));
}
function baoLoi(chu) { const c = document.querySelector('.dn .loi'); if (c) c.remove(); document.querySelector('.dn').append(hn('div', { class: 'loi' }, chu)); }
function oNhap(nhanChu, attrs) { return [hn('label', {}, nhanChu), hn('input', attrs)]; }

async function batDauDangNhap(xong) {
  const { data: { session } } = await SB.auth.getSession();
  if (!session || session.user.is_anonymous) return manMatKhau(xong);
  const { data: aal } = await SB.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal.currentLevel === 'aal2') return xong();
  if (aal.nextLevel === 'aal2') return manMa2Buoc(xong);
  return oDangNhap(hn('div', { class: 'loi' }, 'Tài khoản chưa bật xác minh 2 bước. Bật ở trang /bdk/ trước, rồi quay lại trang này.'));
}

function manMatKhau(xong) {
  const [lE, email] = oNhap('Email', { type: 'email', autocomplete: 'username' });
  const [lM, mk] = oNhap('Mật khẩu', { type: 'password', autocomplete: 'current-password' });
  const nut = hn('button', {}, 'Đăng nhập');
  const f = hn('form', {}, lE, email, lM, mk, nut);
  oDangNhap(f);
  f.onsubmit = async ev => {
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
  const fa = (data.totp || []).find(x => x.status === 'verified');
  if (!fa) return oDangNhap(hn('div', { class: 'loi' }, 'Chưa có xác minh 2 bước. Bật ở trang /bdk/ trước.'));
  const [lC, ma] = oNhap('Mã 6 số trong Google Authenticator (mục Pb Garden)', { inputmode: 'numeric', autocomplete: 'one-time-code', maxlength: '6' });
  const nut = hn('button', {}, 'Xác minh');
  const f = hn('form', {}, lC, ma, nut);
  oDangNhap(f, hn('button', { class: 'phu-nut', onclick: () => SB.auth.signOut().then(() => manMatKhau(xong)) }, 'Đăng nhập tài khoản khác'));
  ma.focus();
  f.onsubmit = async ev => {
    ev.preventDefault();
    const { error } = await SB.auth.mfa.challengeAndVerify({ factorId: fa.id, code: ma.value.replace(/\D/g, '') });
    if (error) return baoLoi('Mã chưa đúng hoặc đã hết hạn, thử mã mới.');
    xong();
  };
}

/** Đọc bản tóm tắt Dashboard từ Supabase rồi vẽ bằng hàm render() của trang. */
async function moBangCV() {
  document.getElementById('dang-nhap').hidden = true;
  document.getElementById('cv-app').hidden = false;
  const { data, error } = await SB.from('cv_ban_tom_tat').select('du_lieu,luc').eq('man', 'dashboard').maybeSingle();
  const app = document.getElementById('app');
  if (error || !data) {
    document.getElementById('stamp').textContent = '';
    app.append(hn('div', { class: 'err' }, error ? 'Không đọc được số liệu: ' + error.message : 'Chưa có số liệu, hoặc tài khoản này chưa được cấp quyền.'));
    return;
  }
  try { render(data.du_lieu); } catch (e) { app.append(hn('div', { class: 'err' }, 'Lỗi hiển thị: ' + e.message)); }
}

batDauDangNhap(moBangCV);
