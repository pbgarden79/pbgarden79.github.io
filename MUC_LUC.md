# MỤC LỤC – App chăm cây Pb Garden 79

Đọc file này TRƯỚC khi sửa. Tìm dòng đúng việc cần sửa → chỉ mở file ghi ở cột "File". Không đọc cả dự án.
Bản chạy thật: https://pbgarden79.github.io (kho GitHub pbgarden79/pbgarden79.github.io). Bản gốc ở thư mục này.

## Muốn sửa NỘI DUNG (không cần biết code)

| Muốn sửa | File | Ghi chú |
|---|---|---|
| Cách chăm từng loại cây | `noi-dung/cay.json` | Mỗi cây một mục, tìm theo mã cây |
| Giá gói, chữ "chỉ khoảng … /ngày" | `noi-dung/goi.json` | 29.000đ/tháng, 249.000đ/năm |
| Câu thông báo (sai mã, bị khóa, hết hạn…) | `noi-dung/loi-nhan.json` | Một câu một dòng, tìm theo mã lỗi |
| Lời đồng ý lưu dữ liệu, chính sách riêng tư | `noi-dung/dong-y.md` | Sửa phải báo chủ shop duyệt |
| Link Fanpage, Messenger, Instagram, Zalo | `noi-dung/lien-he.json` | |

## Muốn sửa MÀN HÌNH

| Màn hình | File | Khi nào hiện |
|---|---|---|
| Trang cách chăm cơ bản (miễn phí, không đăng nhập) | `man-hinh/co-ban.js` | Quét QR là thấy |
| Kích hoạt (SĐT + mã + đồng ý) | `man-hinh/kich-hoat.js` | Bấm "Mở phần nâng cao" |
| Phần nâng cao (đếm ngày còn lại, nhắc lịch, nhật ký) | `man-hinh/nang-cao.js` | Đã kích hoạt, còn hạn |
| Hết hạn (mua cây mới / gói tháng, năm) | `man-hinh/het-han.js` | Hết 7 ngày, không có gói |
| Giao diện chung (màu, chữ, đầu trang, chân trang) | `giao-dien.css` | |

## Muốn sửa PHẦN MÁY CHỦ / KẾT NỐI

| Việc | File |
|---|---|
| Kết nối Supabase (địa chỉ dự án, khóa công khai) | `ket-noi/supabase.js` |
| Đăng nhập ẩn danh, giữ phiên trên máy khách | `ket-noi/phien.js` |
| Bảng dữ liệu, quy tắc RLS, hàm kích hoạt, hạn dùng | `supabase/01_cau_truc.sql` (đã chạy 19/11) |
| Sửa cấu trúc sau này | thêm file mới `supabase/02_…sql`, không sửa file đã chạy |

## Mã lỗi hàm kích hoạt (dùng trong `loi-nhan.json`)

`chua_dang_nhap` · `can_dong_y` · `sdt_sai` · `tam_khoa` · `sai_ma`

## Cách cập nhật lên GitHub

Sửa file ở thư mục này → tải đúng file đó lên kho `pbgarden79/pbgarden79.github.io` (trang Upload files của đúng thư mục) → GitHub Pages tự đăng lại sau 1–2 phút.
Thêm combo mới (từ 19/11): anh gõ `/combo <SĐT> <loại cây>` trên Telegram → bấm ✅ → hệ thống tạo mã combo, mã kích hoạt, ảnh QR (Apps Script `A4b_Combo.gs`, Supabase `02_tao_combo.sql`). Không cần sửa `combo.json` – trang tự hỏi Supabase (`combo_cong_khai`). Thêm LOẠI CÂY mới thì mới sửa `noi-dung/cay.json`.

## Dữ liệu thử (xóa trước khi mở cho khách thật)

| Combo | SĐT | Mã thử | Trạng thái |
|---|---|---|---|
| C001 | 0888200077 | TEST2026 | Đã kích hoạt 19/11 (thử bằng API) |
| C002 | 0888200077 | TEST2027 | Đã kích hoạt 19/11 (thử trên trang) |
| C003 | 0888200077 | PB79IPHONE | Chưa dùng – để chủ shop thử trên iPhone |

Hạn chung của số thử: 26/11/2026. C002, C003 chỉ có trong Supabase (trang mở bằng /c/C001, mã kích hoạt nào của số đó cũng nhận).
