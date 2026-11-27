// BÁO LỖI + MÀN DỰ PHÒNG (Dự phòng 2, anh duyệt 27/11/2026).
// Nạp ĐẦU TIÊN trong index.html và KHÔNG dùng hàm của file nào khác → các file sau hỏng thì file này vẫn chạy.
// • Bắt lỗi chung (lỗi JS, promise lỗi, file .js/.css tải hỏng, quá 20 giây chưa hiện trang) → ghi Supabase
//   hàm ghi_loi_app (supabase/17_loi_app.sql). CHỈ gửi: mã lỗi, màn hình, phiên bản ?v=, trình duyệt (rút gọn),
//   1 dòng lỗi ngắn đã xóa số dài/email/phần sau "?" của link. KHÔNG gửi SĐT, tên, mã combo, dữ liệu khách.
// • App không hiện được → màn dự phòng: cách chăm cơ bản (nếu mở bằng ?c= và tải được cay.json) hoặc lời chào
//   + nút Tải lại + Hỏi shop (Messenger / Zalo theo noi-dung/lien-he.json; tải hỏng thì dùng link Messenger dự phòng).
// Apps Script A4d_SucKhoeApp.gs đọc bảng loi_app và gom báo Telegram.
(function () {
  const SB_URL = 'https://pkxxneeonhvoratigpye.supabase.co';
  const SB_KEY = 'sb_publishable_FTv3P9BqWo1kcDoLWKFIdg_Gk5BXlsJ'; // khóa công khai (giống ket-noi/supabase.js)
  const MESSENGER_DU_PHONG = 'https://m.me/61596198000781';
  const CHO_TOI_DA = 20000; // quá 20 giây chưa hiện trang → màn dự phòng
  // Câu chữ gửi khách — anh DUYỆT nguyên văn 27/11/2026
  const CHU = {
    tieu_de: '🌿 Pb Garden 79',
    xin_loi: 'Dạ trang đang gặp chút trục trặc, anh/chị thông cảm giúp shop ạ. Shop đã nhận được báo lỗi và đang sửa.',
    co_cay: 'Dạ đây là cách chăm cơ bản của cây anh/chị ạ:',
    tai_lai: '🔄 Tải lại trang',
    messenger: '💬 Hỏi shop qua Messenger',
    zalo: '💬 Hỏi shop qua Zalo',
    nho: 'Dạ nếu tải lại vẫn chưa được, anh/chị nhắn shop kèm mã cây trên thẻ (vd C001) để shop hỗ trợ ngay ạ.',
  };

  const V = ((/[?&]v=([\w-]+)/.exec((document.currentScript || {}).src || '') || [])[1] || '?') +
    (location.hostname === 'pbgarden79.github.io' ? '' : '-thu');
  let daVe = false, daDuPhong = false, soLan = 0;
  const daGui = {};

  function trinhDuyet() {
    const u = navigator.userAgent || '';
    const may = /iPhone|iPad|iPod/.test(u) ? 'iOS' : /Android/.test(u) ? 'Android' : /Windows/.test(u) ? 'Windows' : /Mac OS/.test(u) ? 'Mac' : 'Khác';
    const tim = (re, ten) => { const m = re.exec(u); return m ? ten + ' ' + m[1] : ''; };
    const ten = /FBAN|FBAV|FB_IAB/.test(u) ? 'Facebook/Messenger' : /Zalo/i.test(u) ? 'Zalo'
      : tim(/Edg\/(\d+)/, 'Edge') || tim(/CriOS\/(\d+)/, 'Chrome') || tim(/SamsungBrowser\/(\d+)/, 'Samsung') ||
        tim(/Chrome\/(\d+)/, 'Chrome') || tim(/Version\/(\d+)[\d.]* .*Safari/, 'Safari') || tim(/Firefox\/(\d+)/, 'Firefox') || 'Khác';
    const app = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone ? ' · app' : '';
    return (may + ' ' + ten + app).slice(0, 60);
  }

  function manHinh() {
    const q = new URLSearchParams(location.search);
    if (q.get('chu')) return 'chu-shop';
    const tab = (location.hash || '').slice(1).split('/')[0].replace(/[^a-z-]/g, '').slice(0, 20);
    return (q.get('c') ? 'trang-cay' : q.get('cay') ? 'xem-cay' : 'trang-chu') + (tab ? ' #' + tab : '');
  }

  /** Bỏ mọi thứ có thể là dữ liệu khách: số dài (SĐT), email, phần sau ? hoặc # của link, tên miền trang. */
  function sach(s) {
    return String(s == null ? '' : s)
      .replace(/https?:\/\/[^\s)'"]+/g, u => u.replace(/[?#][^\s:)]*/, '').replace(location.origin, ''))
      .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, '@').replace(/\+?\d[\d\s.-]{6,}\d/g, '#').slice(0, 200);
  }

  /** Ghi 1 lỗi về shop. Mỗi lần mở trang tối đa 5 lỗi, cùng lỗi chỉ gửi 1 lần (máy chủ còn giới hạn thêm). */
  function baoLoi(ma, chiTiet) {
    try {
      const ct = sach(chiTiet), khoa = ma + '|' + ct.slice(0, 80);
      console.warn('[Pb báo lỗi]', ma, ct);
      if (daGui[khoa] || soLan >= 5) return;
      daGui[khoa] = 1; soLan++;
      fetch(SB_URL + '/rest/v1/rpc/ghi_loi_app', {
        method: 'POST', keepalive: true,
        headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_ma_loi: String(ma).slice(0, 40), p_man: manHinh(), p_phien_ban: V, p_trinh_duyet: trinhDuyet(), p_chi_tiet: ct }),
      }).catch(() => {});
    } catch (e) { /* báo lỗi không bao giờ được làm hỏng trang */ }
  }

  const tenFile = f => String(f || '').replace(location.origin, '').replace(/\?.*$/, '');

  window.addEventListener('error', e => {
    const t = e.target;
    if (t && t !== window && t.tagName) { // file tải hỏng (bắt ở pha capture)
      if (t.tagName === 'SCRIPT' || t.tagName === 'LINK') baoLoi('tai_file', tenFile(t.src || t.href));
      return; // ảnh minh họa lỗi: co-ban.js đã tự ẩn khung, không báo
    }
    if (!e.message) return;
    baoLoi('js', e.message + ' @' + tenFile(e.filename) + ':' + (e.lineno || 0));
  }, true);

  window.addEventListener('unhandledrejection', e => {
    const r = e.reason;
    baoLoi('promise', (r && r.message) || String(r));
  });

  // app.js không chạy được (file thiếu / lỗi cú pháp) → không có khoiDong → hiện màn dự phòng ngay khi trang tải xong
  window.addEventListener('load', () => { if (!daVe && typeof window.khoiDong !== 'function') hienDuPhong('thieu_app', 'không có khoiDong'); });
  setTimeout(() => { if (!daVe) hienDuPhong('het_gio', 'quá ' + CHO_TOI_DA / 1000 + ' giây chưa hiện trang'); }, CHO_TOI_DA);

  // ───── Màn dự phòng (tự vẽ phần tử, không dùng h() của app.js) ─────
  function el(tag, attrs, ...con) {
    const n = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([k, v]) => { if (k === 'onclick') n.onclick = v; else n.setAttribute(k, v); });
    con.flat().forEach(c => { if (c !== '' && c != null) n.append(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }

  /** Tải JSON tối đa 6 giây; hỏng thì trả null. */
  async function layJson(url, opt) {
    const ac = typeof AbortController === 'function' ? new AbortController() : null;
    const hen = ac && setTimeout(() => ac.abort(), 6000);
    try {
      const r = await fetch(url, Object.assign({ cache: 'no-cache', signal: ac ? ac.signal : undefined }, opt || {}));
      return r.ok ? await r.json() : null;
    } catch (e) { return null; } finally { if (hen) clearTimeout(hen); }
  }

  const linkAnToan = s => typeof s === 'string' && /^https:\/\//.test(s) ? s : '';

  function ve(goc, ma, lh, loai, cay) {
    if (daVe) return; // app đã hiện được trong lúc chờ → không đè
    const ref = ma ? [ma, loai].filter(Boolean).join('_').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 200) : '';
    const m = linkAnToan(lh && lh.messenger) || MESSENGER_DU_PHONG;
    const mLink = ref ? m + (m.includes('?') ? '&' : '?') + 'ref=' + encodeURIComponent(ref) : m;
    const zalo = linkAnToan(lh && lh.zalo);
    const the = el('section', { class: 'the', id: 'man-du-phong' },
      el('h2', {}, CHU.tieu_de),
      el('p', {}, CHU.xin_loi),
      el('button', { class: 'nut', type: 'button', onclick: () => location.reload() }, CHU.tai_lai),
      el('a', { class: 'nut phu', href: mLink, target: '_blank', rel: 'noopener', style: 'margin-top:8px' }, CHU.messenger),
      zalo ? el('a', { class: 'nut phu', href: zalo, target: '_blank', rel: 'noopener', style: 'margin-top:8px' }, CHU.zalo) : '',
      el('p', { class: 'nho' }, CHU.nho));
    const ds = [the];
    if (cay) {
      const nguon = Array.isArray(cay.nguon) ? cay.nguon.filter(n => n && linkAnToan(n.link)) : [];
      ds.unshift(el('section', { class: 'the' },
        ma ? el('p', { class: 'nho' }, 'Mã ' + ma) : '',
        el('h2', {}, (cay.bieu_tuong || '🌿') + ' ' + (cay.ten || '')),
        el('p', {}, CHU.co_cay),
        el('ul', { class: 'cham' }, cay.cham.map(d => el('li', {}, String(d)))),
        nguon.length ? el('p', { class: 'nho' }, 'Nguồn: ', nguon.flatMap((n, i) => [i ? ' · ' : '', el('a', { href: n.link, target: '_blank', rel: 'noopener' }, String(n.ten || 'link'))])) : ''));
    }
    goc.hidden = false;
    goc.replaceChildren(...ds);
  }

  async function hienDuPhong(lyDo, chiTiet) {
    if (daDuPhong || daVe) return;
    daDuPhong = true;
    baoLoi(lyDo, chiTiet);
    const goc = document.getElementById('app');
    if (!goc) return;
    const ma = (new URLSearchParams(location.search).get('c') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    ve(goc, ma, null, '', null); // hiện ngay bản tối thiểu, rồi thử tải thêm liên hệ + cách chăm
    const lh = await layJson('/noi-dung/lien-he.json');
    let loai = '', cay = null;
    if (ma) {
      const [dsCay, combo] = await Promise.all([layJson('/noi-dung/cay.json'), layJson('/noi-dung/combo.json')]);
      loai = (combo && combo[ma] && combo[ma].cay) || '';
      if (!loai && dsCay) {
        const r = await layJson(SB_URL + '/rest/v1/rpc/combo_cong_khai', { method: 'POST',
          headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ p_ma: ma }) });
        loai = (r && typeof r.cay === 'string' && r.cay) || '';
      }
      cay = dsCay && loai && dsCay[loai] && Array.isArray(dsCay[loai].cham) ? dsCay[loai] : null;
    }
    ve(goc, ma, lh, loai, cay);
  }

  // Cho app.js gọi: pbDaVe() khi trang đã hiện xong · pbDuPhong(lý do, chi tiết) khi khởi động hỏng · pbBaoLoi(mã, chi tiết)
  window.pbDaVe = () => { daVe = true; };
  window.pbDuPhong = hienDuPhong;
  window.pbBaoLoi = baoLoi;
})();
