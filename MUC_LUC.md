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

## Dữ liệu thử

Combo C001 · SĐT 0888200077 · mã thử TEST2026 · đã kích hoạt 19/11, hạn 26/11. Xóa trước khi mở cho khách thật.
