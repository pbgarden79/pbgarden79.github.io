// CÀI APP RA MÀN HÌNH CHÍNH (PWA). Câu chữ ở noi-dung/cai-app.json. Không dùng service worker, không lưu đệm dữ liệu.
// Android (Chrome): trình duyệt báo "có thể cài" → hiện nút "Cài app". iPhone/iPad: hiện hướng dẫn Chia sẻ → Thêm vào MH chính.
// Đã mở bằng app (standalone) hoặc khách bấm "Để sau" (ẩn 30 ngày) → không hiện.
(function () {
  const KHOA = 'pb_cai_app_an_den';
  const daCai = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const anDen = Number(localStorage.getItem(KHOA) || 0);
  if (daCai || anDen > Date.now()) return;

  const trongApp = /FBAN|FBAV|Instagram|Zalo|Line\//i.test(navigator.userAgent); // trình duyệt trong Messenger/Zalo không thêm được ra MH chính
  const laIOS = !trongApp && (/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  let loiMoi = null; // sự kiện beforeinstallprompt (Android/Chrome)
  let chu = null;
  let o = null;

  const tao = (tag, cls, txt) => { const el = document.createElement(tag); if (cls) el.className = cls; if (txt) el.textContent = txt; return el; };

  function hien() {
    if (!chu || o) return;
    if (!loiMoi && !laIOS) return;
    o = tao('section', 'the cai-app');
    o.append(tao('h3', '', chu.tieu_de));
    if (loiMoi) {
      o.append(tao('p', 'nho', chu.android));
      const nut = tao('button', 'nut', chu.nut_cai);
      nut.onclick = async () => {
        loiMoi.prompt();
        const kq = await loiMoi.userChoice.catch(() => null);
        loiMoi = null;
        if (kq && kq.outcome === 'accepted') o.remove();
      };
      o.append(nut);
    } else {
      o.append(tao('p', 'nho', chu.iphone));
      const ol = tao('ol', 'buoc-cai');
      chu.iphone_buoc.forEach(b => ol.append(tao('li', '', b)));
      o.append(ol);
    }
    const sau = tao('button', 'nut phu', chu.de_sau);
    sau.onclick = () => { localStorage.setItem(KHOA, String(Date.now() + 30 * 864e5)); o.remove(); };
    o.append(sau);
    const vo = tao('div', 'vo-cai-app');
    vo.append(o);
    document.querySelector('footer').before(vo);
  }

  addEventListener('beforeinstallprompt', e => { e.preventDefault(); loiMoi = e; hien(); });
  addEventListener('appinstalled', () => { if (o) o.remove(); });
  fetch('/noi-dung/cai-app.json', { cache: 'no-cache' }).then(r => r.json()).then(j => { chu = j; hien(); }).catch(() => {});
})();
