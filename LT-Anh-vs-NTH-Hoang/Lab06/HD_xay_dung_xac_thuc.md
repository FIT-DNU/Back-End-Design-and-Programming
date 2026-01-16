# Xây dựng Chức năng Đăng nhập, Đăng ký và Đăng xuất trong ASP.NET Core MVC

---

## Mục đích của chức năng xác thực:
* Xác định danh tính người dùng truy cập hệ thống
* Phân quyền truy cập dựa trên vai trò (Role-based Authorization)
* Bảo vệ tài nguyên và dữ liệu nhạy cảm

---

Tài liệu này hướng dẫn chi tiết cách xây dựng hệ thống xác thực người dùng với đăng ký, đăng nhập và đăng xuất sử dụng Cookie Authentication trong dự án **LabToChucWebsite**.

---

## 1. Cấu trúc thư mục dự án

```plaintext
LabToChucWebsite/
├─ Controllers/
│  ├─ AccountController.cs         ← Xử lý đăng nhập, đăng ký, đăng xuất
│  ├─ HomeController.cs
│  ├─ AdminController.cs
│  ├─ SinhVienController.cs
│  ├─ HocPhanController.cs
│  └─ DiemHocPhanController.cs
│
├─ Models/
│  ├─ User.cs                       ← Model người dùng
│  ├─ SinhVien.cs
│  ├─ HocPhan.cs
│  ├─ DiemHocPhan.cs
│  └─ ViewModels/
│     ├─ LoginViewModel.cs         ← ViewModel đăng nhập
│     └─ RegisterViewModel.cs      ← ViewModel đăng ký
│
├─ Views/
│  ├─ Account/
│  │  ├─ Login.cshtml              ← Form đăng nhập
│  │  └─ Register.cshtml           ← Form đăng ký
│  ├─ Shared/
│  │  ├─ _ClientLayout.cshtml      ← Layout cho User
│  │  ├─ _AdminLayout.cshtml       ← Layout cho Admin
│  │  └─ _ValidationScriptsPartial.cshtml
│  └─ _ViewStart.cshtml
│
├─ Data/
│  └─ ApplicationDbContext.cs      ← DbContext chứa Users
│
└─ Program.cs                       ← Cấu hình Authentication
```

---

## 2. Model User

**File:** `LabToChucWebsite/Models/User.cs`

```csharp
using System.ComponentModel.DataAnnotations;

namespace LabToChucWebsite.Models
{
    public class User
    {
        public int Id { get; set; }              // Khóa chính
        
        [Required]
        public string UserName { get; set; }     // Tên đăng nhập duy nhất
        
        [Required]
        public string PasswordHash { get; set; } // Mật khẩu đã mã hóa
        
        public string Role { get; set; }         // Vai trò (User, Admin)
    }
}
```

**Đặc điểm:**
* Khóa chính là `Id` (không phải `UserId`)
* `UserName` và `PasswordHash` có `[Required]`
* `PasswordHash` lưu chuỗi đã hash, **không bao giờ** lưu plain text
* `Role` xác định quyền: "User" hoặc "Admin"

## Đăng ký DBSet<User> trong Data/ApplicationDbContext.cs

```csharp
        public DbSet<User> Users { get; set; }

```

---

## 3. ViewModel cho Đăng ký và Đăng nhập

### 3.1. LoginViewModel

**File:** `LabToChucWebsite/Models/ViewModels/LoginViewModel.cs`

```csharp
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace LabToChucWebsite.Models.ViewModels
{
    public class LoginViewModel
    {
        [Required]
        [DisplayName("Tài khoản")]
        public string UserName { get; set; }

        [DisplayName("Mật khẩu")]
        [Required, DataType(DataType.Password)]
        public string Password { get; set; }
    }
}
```

---

### 3.2. RegisterViewModel

**File:** `LabToChucWebsite/Models/ViewModels/RegisterViewModel.cs`

```csharp
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace LabToChucWebsite.Models.ViewModels
{
    public class RegisterViewModel
    {
        [Required]
        [DisplayName("Tài khoản")]
        public string UserName { get; set; }
        
        [DisplayName("Mật khẩu")]
        [Required, DataType(DataType.Password)]
        public string Password { get; set; }

        [Required]
        [DisplayName("Xác nhận mật khẩu")]
        [DataType(DataType.Password)]
        [Compare("Password", ErrorMessage = "Mật khẩu không khớp")]
        public string ConfirmPassword { get; set; }
    }
}
```
---

## 4. Cấu hình Cookie Authentication (Xác thực bằng Cookie)

**File:** `LabToChucWebsite/Program.cs`

```csharp
using LabToChucWebsite.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Thêm services
builder.Services.AddControllersWithViews();
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Sao chép phần này vào cấu hình Program.cs
// Cấu hình Cookie Authentication -> Nếu không có Cookie xác thực
// --> Chuyển sang đường dẫn đăng nhập --> /Account/Login
builder.Services.AddAuthentication("MyCookie")
    .AddCookie("MyCookie", options =>
    {
        options.LoginPath = "/Account/Login";
        // Không có AccessDeniedPath trong dự án này
    });

var app = builder.Build();

// Middleware pipeline
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

// Copy phần này
// Đăng ký sử dụng xác thực
// Thứ tự quan trọng: Authentication → Authorization
app.UseAuthentication();    
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
```

---

## 5. AccountController - Thực tế trong dự án

**File:** `LabToChucWebsite/Controllers/AccountController.cs`

### 5.1. Cấu trúc Controller

```csharp
using LabToChucWebsite.Data;
using LabToChucWebsite.Models;
using LabToChucWebsite.Models.ViewModels;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LabToChucWebsite.Controllers
{
    // Xác thực controller
    [Authorize]
    public class AccountController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AccountController(ApplicationDbContext context)
        {
            _context = context;
        }
        
        // Các action đăng nhập, đăng ký, đăng xuất
    }
}
```

---

### 5.2. Action Đăng ký (AccountController.cs)

```csharp
// AllowAnonymous là cho phép truy cập cho người dùng không xác định
[AllowAnonymous]
public IActionResult Register()
{
    return View();
}
// Xử lý phương thức đăng ký
[HttpPost]
[AllowAnonymous]
public IActionResult Register(RegisterViewModel model)
{
    if (!ModelState.IsValid) return View(model);

    var hasher = new PasswordHasher<User>();

    var user = new User
    {
        UserName = model.UserName,
        Role = "User"  // Mặc định là User
    };

    user.PasswordHash = hasher.HashPassword(user, model.Password);

    _context.Users.Add(user);
    _context.SaveChanges();

    return RedirectToAction("Login");
}
```

**Luồng xử lý:**
1. Validate ModelState
2. Tạo `PasswordHasher<User>`
3. Tạo đối tượng User với Role = "User"
4. Hash password và gán vào `PasswordHash`
5. Lưu vào database
6. Redirect đến Login

---

### 5.3. Action Đăng nhập (AccountController.cs)

```csharp
[AllowAnonymous]
public IActionResult Login()
{
    return View();
}

// Xử lý phương thức đăng nhập
[HttpPost]
[AllowAnonymous]
public async Task<IActionResult> Login(LoginViewModel model)
{
    if (!ModelState.IsValid) return View(model);

    var user = _context.Users
        .FirstOrDefault(u => u.UserName == model.UserName);

    if (user == null)
    {
        ModelState.AddModelError("", "Sai tài khoản");
        return View(model);
    }

    var hasher = new PasswordHasher<User>();
    var result = hasher.VerifyHashedPassword(
        user, user.PasswordHash, model.Password);

    if (result != PasswordVerificationResult.Success)
    {
        ModelState.AddModelError("", "Sai mật khẩu");
        return View(model);
    }

    // Tạo cookie
    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.Name, user.UserName),
        new Claim(ClaimTypes.Role, user.Role)
    };

    var identity = new ClaimsIdentity(claims, "MyCookie");
    var principal = new ClaimsPrincipal(identity);

    await HttpContext.SignInAsync("MyCookie", principal);

    if (user.Role == "Admin")
        return RedirectToAction("Index", "Admin");

    return RedirectToAction("Index", "Home");
}
```

**Luồng xử lý:**
1. Validate ModelState
2. Tìm user theo username
3. Kiểm tra user tồn tại → nếu không: "Sai tài khoản"
4. Verify password bằng `VerifyHashedPassword`
5. Nếu sai: "Sai mật khẩu"
6. Tạo Claims (Name, Role)
7. Tạo ClaimsIdentity với scheme "MyCookie"
8. SignInAsync để tạo cookie
9. Redirect: Admin → `/Admin/Index`, User → `/Home/Index`

---

### 5.4. Action Đăng xuất (AccountController.cs)

```csharp
// Đăng xuất
[Authorize]
public async Task<IActionResult> Logout()
{
    await HttpContext.SignOutAsync("MyCookie");
    return RedirectToAction("Login");
}
```

**Xử lý:**
* SignOutAsync với scheme "MyCookie"
* Xóa cookie xác thực
* Redirect về Login

---

## 6. Views - Thực tế trong dự án

### 6.1. View Login - Thực tế

**File:** `LabToChucWebsite/Views/Account/Login.cshtml`

```razor
@using LabToChucWebsite.Models.ViewModels
@model LoginViewModel

@{
    ViewData["Title"] = "Đăng nhập";
    Layout = null;
}

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Đăng nhập</title>
    <link href="~/lib/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet" />
</head>
<body class="bg-light">

    <div class="container">
        <div class="row justify-content-center align-items-center vh-100">
            <div class="col-md-4">
                <div class="card shadow">
                    <div class="card-body">
                        <h4 class="text-center mb-4">Đăng nhập</h4>

                        <form asp-action="Login" method="post">
                            <div class="mb-3">
                                <label asp-for="UserName" class="form-label"></label>
                                <input asp-for="UserName" class="form-control" />
                                <span asp-validation-for="UserName" class="text-danger"></span>
                            </div>

                            <div class="mb-3">
                                <label asp-for="Password" class="form-label"></label>
                                <input asp-for="Password" class="form-control" />
                                <span asp-validation-for="Password" class="text-danger"></span>
                            </div>

                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary">
                                    Đăng nhập
                                </button>
                            </div>
                        </form>

                        <div class="text-center mt-3">
                            <a asp-action="Register">Chưa có tài khoản? Đăng ký</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="~/lib/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
    @section Scripts {
        <partial name="_ValidationScriptsPartial" />
    }
</body>
</html>
```

**Đặc điểm:**
* Bootstrap từ `~/lib/bootstrap` (local, không phải CDN)
* Layout = null (không dùng layout chung)
* Centered vertically với `vh-100` và `align-items-center`
* Validation scripts qua `_ValidationScriptsPartial`
* **Không có** `asp-validation-summary="All"`

---

### 6.2. View Register

**File:** `LabToChucWebsite/Views/Account/Register.cshtml`

```razor
@using LabToChucWebsite.Models.ViewModels
@model RegisterViewModel

@{
    ViewData["Title"] = "Đăng ký";
    Layout = null;
}

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Đăng ký</title>
    <link href="~/lib/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet" />
</head>
<body class="bg-light">

    <div class="container">
        <div class="row justify-content-center align-items-center vh-100">
            <div class="col-md-4">
                <div class="card shadow">
                    <div class="card-body">
                        <h4 class="text-center mb-4">Đăng ký</h4>

                        <form asp-action="Register" method="post">
                            <div class="mb-3">
                                <label asp-for="UserName" class="form-label"></label>
                                <input asp-for="UserName" class="form-control" />
                                <span asp-validation-for="UserName" class="text-danger"></span>
                            </div>

                            <div class="mb-3">
                                <label asp-for="Password" class="form-label"></label>
                                <input asp-for="Password" class="form-control" />
                                <span asp-validation-for="Password" class="text-danger"></span>
                            </div>

                            <div class="d-grid">
                                <button type="submit" class="btn btn-success">
                                    Đăng ký
                                </button>
                            </div>
                        </form>

                        <div class="text-center mt-3">
                            <a asp-action="Login">Đã có tài khoản? Đăng nhập</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="~/lib/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
    @section Scripts {
        <partial name="_ValidationScriptsPartial" />
    }
</body>
</html>
```

**Đặc điểm:**
* Tương tự Login, dùng Bootstrap local
* Chỉ có UserName và Password (không có ConfirmPassword)
* Button màu xanh lá (`btn-success`)

---

## 7. Bảo vệ Controller bằng [Authorize]

### 7.1. HomeController

```csharp
// Tất cả action yêu cầu đăng nhập
[Authorize]
public class HomeController : Controller
{
    // ...
}
```

---

### 7.2. AdminController - Bảo vệ theo Role

```csharp
[Authorize(Roles = "Admin")]
public class AdminController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
```

---

### 7.3. Controllers khác trong dự án

```csharp
[Authorize]
public class SinhVienController : Controller { }

[Authorize]
public class HocPhanController : Controller { }

[Authorize]
public class DiemHocPhanController : Controller { }
```

**Quan trọng:**
* Tất cả controller quản lý có `[Authorize]`
* Admin controller có `[Authorize(Roles = "Admin")]`
* Account controller có `[Authorize]` ở class level, nhưng Login/Register có `[AllowAnonymous]`

---

## 8. Hiển thị thông tin trong Layout

### 8.1. _ClientLayout.cshtml

```razor
@{
    if (User.IsInRole("Admin"))
    {
        <li class="nav-item">
            <a class="nav-link" href="/Admin/Index">
                <i class="fas fa-user-circle"></i> Quản trị hệ thống
            </a>
        </li>
    }
}
<li class="nav-item">
    <a class="nav-link" href="/Account/Logout">
        <i class="bi bi-box-arrow-right"></i> Đăng xuất
    </a>
</li>
```

**Đặc điểm:**
* Kiểm tra `User.IsInRole("Admin")` để hiển thị menu Admin
* Menu Đăng xuất luôn hiển thị khi đã login

---

## 9. Các lỗi thường gặp trong dự án này

### Lỗi 1: Không có ConfirmPassword validation

**Hiện trạng:**
RegisterViewModel không có field ConfirmPassword

**Rủi ro:**
* User có thể nhập nhầm mật khẩu khi đăng ký
* Không có cơ chế xác nhận

**Khắc phục:**
Thêm vào RegisterViewModel:

```csharp
[Required]
[DisplayName("Xác nhận mật khẩu")]
[DataType(DataType.Password)]
[Compare("Password", ErrorMessage = "Mật khẩu không khớp")]
public string ConfirmPassword { get; set; }
```

Và trong View Register:

```razor
<div class="mb-3">
    <label asp-for="ConfirmPassword" class="form-label"></label>
    <input asp-for="ConfirmPassword" class="form-control" />
    <span asp-validation-for="ConfirmPassword" class="text-danger"></span>
</div>
```

---

### Lỗi 2: Cookie không có thời gian hết hạn

**Hiện trạng:**
```csharp
builder.Services.AddAuthentication("MyCookie")
    .AddCookie("MyCookie", options =>
    {
        options.LoginPath = "/Account/Login";
        // Không có ExpireTimeSpan
    });
```

**Rủi ro:**
* Cookie tồn tại theo session browser
* Đóng browser = mất phiên đăng nhập

**Khắc phục:**
```csharp
builder.Services.AddAuthentication("MyCookie")
    .AddCookie("MyCookie", options =>
    {
        options.LoginPath = "/Account/Login";
        options.ExpireTimeSpan = TimeSpan.FromHours(24);
        options.SlidingExpiration = true;  // Tự động gia hạn
    });
```

---

### Lỗi 3: Không có validation summary trong View

**Hiện trạng:**
View không có `asp-validation-summary`, chỉ hiển thị lỗi từng field

**Khắc phục:**
Thêm vào form:

```razor
<form asp-action="Login" method="post">
    <div asp-validation-summary="ModelOnly" class="alert alert-danger"></div>
    <!-- Các field -->
</form>
```

Hoặc hiển thị tất cả lỗi:

```razor
<div asp-validation-summary="All" class="alert alert-danger"></div>
```

---

### Lỗi 4: Kiểm tra username trùng khi đăng ký

**Hiện trạng:**
Action Register không kiểm tra username đã tồn tại

**Rủi ro:**
* Lỗi database khi insert username trùng
* Người dùng không hiểu lỗi gì

**Khắc phục:**
```csharp
[HttpPost]
[AllowAnonymous]
public IActionResult Register(RegisterViewModel model)
{
    if (!ModelState.IsValid) return View(model);

    // Kiểm tra username đã tồn tại
    if (_context.Users.Any(u => u.UserName == model.UserName))
    {
        ModelState.AddModelError("UserName", "Tài khoản đã tồn tại");
        return View(model);
    }

    var hasher = new PasswordHasher<User>();
    var user = new User
    {
        UserName = model.UserName,
        Role = "User"
    };
    user.PasswordHash = hasher.HashPassword(user, model.Password);

    _context.Users.Add(user);
    _context.SaveChanges();

    TempData["Success"] = "Đăng ký thành công! Vui lòng đăng nhập.";
    return RedirectToAction("Login");
}
```

---

### Lỗi 5: Không có TempData thông báo sau Register

**Hiện trạng:**
Sau khi đăng ký thành công, redirect về Login không có thông báo

**Khắc phục:**

```csharp
_context.SaveChanges();

TempData["Success"] = "Đăng ký thành công! Vui lòng đăng nhập.";
return RedirectToAction("Login");
```

Hiển thị trong Login.cshtml:

```razor
@if (TempData["Success"] != null)
{
    <div class="alert alert-success alert-dismissible fade show">
        <i class="fas fa-check-circle"></i> @TempData["Success"]
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
}
```

---

## 10. Code mẫu để cải tiến
---

### 10.1. Register action đầy đủ

```csharp
[HttpPost]
[AllowAnonymous]
public IActionResult Register(RegisterViewModel model)
{
    if (!ModelState.IsValid) return View(model);

    // Kiểm tra username trùng
    if (_context.Users.Any(u => u.UserName == model.UserName))
    {
        ModelState.AddModelError("UserName", "Tài khoản đã tồn tại");
        return View(model);
    }

    var hasher = new PasswordHasher<User>();
    var user = new User
    {
        UserName = model.UserName,
        Role = "User"
    };
    user.PasswordHash = hasher.HashPassword(user, model.Password);

    _context.Users.Add(user);
    _context.SaveChanges();

    TempData["Success"] = "Đăng ký thành công! Vui lòng đăng nhập.";
    return RedirectToAction("Login");
}
```

---

### 10.2. Program.cs đầy đủ

```csharp
builder.Services.AddAuthentication("MyCookie")
    .AddCookie("MyCookie", options =>
    {
        options.LoginPath = "/Account/Login";
        options.AccessDeniedPath = "/Account/AccessDenied";
        options.ExpireTimeSpan = TimeSpan.FromHours(24);
        options.SlidingExpiration = true;
    });
```

---

### 10.3. AccessDenied action và view

**Action:**
```csharp
[AllowAnonymous]
public IActionResult AccessDenied()
{
    return View();
}
```

**View:** `Views/Account/AccessDenied.cshtml`
```razor
@{
    ViewData["Title"] = "Truy cập bị từ chối";
    Layout = null;
}

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Truy cập bị từ chối</title>
    <link href="~/lib/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet" />
</head>
<body class="bg-light">
    <div class="container">
        <div class="row justify-content-center align-items-center vh-100">
            <div class="col-md-6">
                <div class="card shadow">
                    <div class="card-body text-center">
                        <i class="fas fa-exclamation-triangle text-danger" style="font-size: 4rem;"></i>
                        <h3 class="mt-3">Truy cập bị từ chối</h3>
                        <p class="text-muted">Bạn không có quyền truy cập vào trang này.</p>
                        <div class="d-grid gap-2">
                            <a href="/" class="btn btn-primary">Về trang chủ</a>
                            <a asp-action="Logout" class="btn btn-outline-secondary">Đăng xuất</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
```

---

## 11. Mẹo và Best Practices

### 11.1. Bảo mật

* **Đã làm:** Hash password bằng PasswordHasher
* **Đã làm:** Dùng Claims-based authentication
* **Nên thêm:** Kiểm tra username trùng
* **Nên thêm:** Đặt thời gian hết hạn cookie
* **Nên thêm:** Validation phức tạp hơn cho password (độ dài, ký tự đặc biệt)

---

### 11.2. User Experience

* **Đã làm:** Form đơn giản, dễ sử dụng
* **Đã làm:** Link chuyển đổi Login/Register
* **Nên thêm:** TempData thông báo thành công/thất bại
* **Nên thêm:** ConfirmPassword để tránh nhầm lẫn
* **Nên thêm:** Remember Me checkbox
* **Nên thêm:** Loading indicator khi submit

---

### 11.3. Code Quality

* **Đã làm:** Tách ViewModel riêng
* **Đã làm:** Dùng `[Authorize]` attribute đúng cách
* **Đã làm:** Comment code tiếng Việt rõ ràng
* **Nên thêm:** Try-catch xử lý exception
* **Nên thêm:** Logging các sự kiện login/logout

---

## 12. Tài liệu tham khảo

* [ASP.NET Core Authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/)
* [Cookie Authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie)
* [Authorization in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/)
* [PasswordHasher Class](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.identity.passwordhasher-1)
* [Data Annotations](https://learn.microsoft.com/en-us/dotnet/api/system.componentmodel.dataannotations)

---

**Kết luận:**

Dự án **LabToChucWebsite** đã triển khai thành công chức năng xác thực cơ bản với Cookie Authentication. Hệ thống hoạt động ổn định với các tính năng:
- Đăng ký tài khoản mới
- Đăng nhập với xác thực mật khẩu hash
- Phân quyền Admin/User
- Đăng xuất và xóa cookie

**Các cải tiến đề xuất** trong tài liệu sẽ giúp tăng độ an toàn, trải nghiệm người dùng và chất lượng code tốt hơn.
