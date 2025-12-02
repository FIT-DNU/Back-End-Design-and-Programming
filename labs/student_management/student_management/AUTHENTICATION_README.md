# H? th?ng xác th?c ð? ðý?c chuy?n ð?i

## Thay ð?i chính

H? th?ng ð? ðý?c chuy?n ð?i t? **Microsoft Identity (Azure AD)** sang **xác th?c ðõn gi?n b?ng Database và Cookie**.

## C?u trúc xác th?c m?i

### 1. Models
- **User.cs**: Model cho ngý?i dùng
- **AccountViewModels.cs**: ViewModels cho Login và Register

### 2. Controller
- **AccountController.cs**: X? l? ðãng nh?p, ðãng k?, ðãng xu?t

### 3. Views
- **Login.cshtml**: Trang ðãng nh?p
- **Register.cshtml**: Trang ðãng k?
- **AccessDenied.cshtml**: Trang t? ch?i truy c?p
- **_LayoutAuth.cshtml**: Layout riêng cho trang authentication (ð?p hõn, không có sidebar/header)

### 4. Styles
- **auth.css**: CSS riêng cho authentication pages v?i:
  - Gradient background ð?p m?t
  - Responsive design
  - Animation effects
  - Split layout (brand + form)

### 5. Authentication
- S? d?ng **Cookie Authentication** thay v? OpenID Connect
- M?t kh?u ðý?c hash b?ng SHA256
- Session timeout: 8 gi? (có th? kéo dài n?u ch?n "Ghi nh? ðãng nh?p")

## Ð?c ði?m Layout Authentication

### Desktop View (>992px)
- Split screen: Brand section (trái) + Form (ph?i)
- Brand section có:
  - Logo và tên h? th?ng
  - 3 features n?i b?t
  - Animated background shapes
  - Gradient purple theme

### Mobile View (<992px)
- Ch? hi?n th? form
- Brand section ?n ði ð? t?i ýu không gian
- Form ð?y màn h?nh v?i padding phù h?p

## Tài kho?n m?c ð?nh

Ð? t?o tài kho?n admin m?c ð?nh, ch?y script `SeedAdminUser.sql`:

```sql
Username: admin
Password: admin123
Email: admin@student.edu.vn
Role: Admin
```

Ho?c ch?y script sau trong SQL Server Management Studio:

```bash
sqlcmd -S localhost,1433 -U SA -P "123456@Aa" -i SeedAdminUser.sql
```

## Cách s? d?ng

### Ðãng k? tài kho?n m?i
1. Truy c?p `/Account/Register`
2. Ði?n thông tin: Tên ðãng nh?p, Email, H? tên, M?t kh?u
3. Nh?n "Ðãng k?"

### Ðãng nh?p
1. Truy c?p `/Account/Login`
2. Nh?p tên ðãng nh?p và m?t kh?u
3. Tùy ch?n: Ch?n "Ghi nh? ðãng nh?p" ð? session kéo dài 30 ngày
4. Nh?n "Ðãng nh?p"

### Ðãng xu?t
- Nh?n nút "Ðãng xu?t" trên thanh menu (khi ð? ðãng nh?p)

## B?o m?t

- M?t kh?u ðý?c hash b?ng SHA256 trý?c khi lýu vào database
- Cookie ðý?c c?u h?nh v?i:
  - HttpOnly = true
  - Secure = true (ch? ho?t ð?ng trên HTTPS)
  - SameSite = Strict
- T?t c? các trang ð?u yêu c?u xác th?c (tr? Login, Register, AccessDenied)

## Migrations

Migration ð? ðý?c t?o và áp d?ng:
- **AddUserAuthentication**: Thêm b?ng User vào database

N?u c?n ch?y l?i migration:
```bash
dotnet ef database update
```

## Packages ð? xóa

Các package Microsoft Identity sau ð? ðý?c xóa kh?i project:
- Microsoft.Identity.Web
- Microsoft.Identity.Web.UI
- Microsoft.Identity.Web.DownstreamApi
- Microsoft.AspNetCore.Authentication.OpenIdConnect
- Microsoft.AspNetCore.Authentication.JwtBearer

## UI/UX Features

### Authentication Pages
- ? Gradient purple background
- ?? Modern split-screen design
- ?? Fully responsive
- ?? Smooth animations
- ?? User-friendly form validation
- ?? Floating shape animations

### Main Layout
- Sidebar navigation v?i icons
- User dropdown menu
- Notification dropdown
- Real-time date display
- Responsive mobile menu

## Lýu ?

1. **M?t kh?u m?c ð?nh**: Sau khi t?o tài kho?n admin, nên ð?i m?t kh?u ngay
2. **B?o m?t nâng cao**: N?u mu?n b?o m?t cao hõn, h?y xem xét s? d?ng bcrypt ho?c PBKDF2 thay v? SHA256
3. **Email verification**: Hi?n t?i chýa có xác th?c email, có th? thêm sau n?u c?n
4. **HTTPS**: Ð?m b?o ch?y trên HTTPS trong production ð? cookie ho?t ð?ng an toàn

## Troubleshooting

### Không ðãng nh?p ðý?c
- Ki?m tra database ð? có b?ng User chýa
- Ki?m tra username và password có ðúng không
- Ki?m tra user.IsActive = true

### Migration error
```bash
dotnet ef migrations remove
dotnet ef migrations add AddUserAuthentication
dotnet ef database update
```

### Cookie không ho?t ð?ng
- Ð?m b?o ðang ch?y trên HTTPS
- Ki?m tra browser không block cookies

### Layout không hi?n th? ðúng
- Clear browser cache
- Ki?m tra file auth.css ð? ðý?c load chýa
- Ki?m tra Console trong DevTools xem có l?i CSS không

## Screenshots

### Login Page
- Split screen v?i brand section và form
- Purple gradient background
- Animated floating shapes

### Register Page
- Týõng t? Login nhýng v?i nhi?u fields hõn
- Form validation real-time
- Success message sau khi ðãng k?

### Main Dashboard
- Sidebar navigation
- User profile dropdown
- Notification center
- Responsive design
