# Xây dựng Chức năng Đăng nhập, Đăng ký và Đăng xuất trong ASP.NET Core MVC

---

## Mục đích của chức năng xác thực:
* Xác định danh tính người dùng truy cập hệ thống
* Phân quyền truy cập dựa trên vai trò (Role-based Authorization)
* Bảo vệ tài nguyên và dữ liệu nhạy cảm

---

Tài liệu này hướng dẫn chi tiết cách xây dựng hệ thống xác thực người dùng với đăng ký, đăng nhập và đăng xuất sử dụng Cookie Authentication.

---

## 1. Cấu trúc thư mục đề xuất

```plaintext
/Controllers
 └─ AccountController.cs
 
/Models
 ├─ User.cs
 └─ /ViewModels
     ├─ LoginViewModel.cs
     └─ RegisterViewModel.cs

/Views
 └─ /Account
     ├─ Login.cshtml
     └─ Register.cshtml

/Data
 └─ ApplicationDbContext.cs
```

---

## 2. Tạo Model User

**File:** `/Models/User.cs`

Mục đích:
* Lưu trữ thông tin người dùng
* Chứa tài khoản, mật khẩu đã hash và vai trò

Các thuộc tính chính:

```csharp
public class User
{
    public int UserId { get; set; }           // Khóa chính
    public string UserName { get; set; }      // Tên đăng nhập duy nhất
    public string PasswordHash { get; set; }  // Mật khẩu đã mã hóa
    public string Role { get; set; }          // Vai trò (User, Admin)
}
```

**Lưu ý quan trọng:**
* **Không bao giờ** lưu mật khẩu dạng plain text
* `PasswordHash` chứa chuỗi đã mã hóa bằng `PasswordHasher`
* `Role` xác định quyền truy cập của người dùng

---

## 3. Tạo ViewModel cho Đăng ký và Đăng nhập

### 3.1. LoginViewModel

**File:** `/Models/ViewModels/LoginViewModel.cs`

Mục đích:
* Nhận dữ liệu từ form đăng nhập
* Validate thông tin đầu vào

```csharp
public class LoginViewModel
{
    [Required]
    [DisplayName("Tài khoản")]
    public string UserName { get; set; }

    [DisplayName("Mật khẩu")]
    [Required, DataType(DataType.Password)]
    public string Password { get; set; }
}
```

**Data Annotations:**
* `[Required]`: Bắt buộc nhập
* `[DisplayName]`: Tên hiển thị trên form
* `[DataType(DataType.Password)]`: Ẩn ký tự khi nhập

---

### 3.2. RegisterViewModel

**File:** `/Models/ViewModels/RegisterViewModel.cs`

Mục đích:
* Nhận dữ liệu từ form đăng ký
* Validate và so sánh mật khẩu xác nhận

```csharp
public class RegisterViewModel
{
    [Required]
    [DisplayName("Tài khoản")]
    public string UserName { get; set; }

    [Required]
    [DisplayName("Mật khẩu")]
    [DataType(DataType.Password)]
    public string Password { get; set; }

    [Required]
    [DisplayName("Xác nhận mật khẩu")]
    [DataType(DataType.Password)]
    [Compare("Password", ErrorMessage = "Mật khẩu không khớp")]
    public string ConfirmPassword { get; set; }
}
```

**Data Annotations quan trọng:**
* `[Compare("Password")]`: So sánh với thuộc tính Password
* Tự động báo lỗi nếu hai mật khẩu không giống nhau

---

## 4. Cấu hình Cookie Authentication trong Program.cs

**File:** `/Program.cs`

### Bước 1: Thêm dịch vụ Authentication

```csharp
builder.Services.AddAuthentication("MyCookie")
    .AddCookie("MyCookie", options =>
    {
        options.LoginPath = "/Account/Login";
        options.AccessDeniedPath = "/Account/AccessDenied";
        options.ExpireTimeSpan = TimeSpan.FromHours(24);
    });
```

**Giải thích:**
* `"MyCookie"`: Tên scheme authentication (phải nhất quán trong toàn bộ hệ thống)
* `LoginPath`: Đường dẫn redirect khi chưa đăng nhập
* `AccessDeniedPath`: Đường dẫn khi không có quyền truy cập
* `ExpireTimeSpan`: Thời gian tồn tại của cookie (24 giờ)

---

### Bước 2: Thêm middleware vào pipeline

```csharp
app.UseAuthentication();  // ← Phải đặt trước UseAuthorization
app.UseAuthorization();
```

**⚠️ Cảnh báo:**
* Thứ tự middleware rất quan trọng
* `UseAuthentication()` **bắt buộc** đặt trước `UseAuthorization()`
* Nếu sai thứ tự, hệ thống sẽ không xác thực được người dùng

---

## 5. Tạo AccountController

**File:** `/Controllers/AccountController.cs`

Mục đích:
* Xử lý nghiệp vụ đăng ký, đăng nhập, đăng xuất
* Tạo Cookie xác thực sau khi đăng nhập thành công

### 5.1. Cấu trúc Controller

```csharp
[Authorize]  // Yêu cầu đăng nhập cho toàn bộ controller
public class AccountController : Controller
{
    private readonly ApplicationDbContext _context;

    public AccountController(ApplicationDbContext context)
    {
        _context = context;
    }
    
    // Các action...
}
```

---

### 5.2. Action Đăng ký (Register)

#### HTTP GET - Hiển thị form

```csharp
[AllowAnonymous]  // Cho phép truy cập khi chưa đăng nhập
public IActionResult Register() => View();
```

#### HTTP POST - Xử lý đăng ký

```csharp
[HttpPost]
[AllowAnonymous]
public IActionResult Register(RegisterViewModel model)
{
    if (!ModelState.IsValid) return View(model);

    // 1. Tạo PasswordHasher
    var hasher = new PasswordHasher<User>();

    // 2. Tạo đối tượng User mới
    var user = new User
    {
        UserName = model.UserName,
        Role = "User"  // Mặc định là User
    };

    // 3. Hash mật khẩu
    user.PasswordHash = hasher.HashPassword(user, model.Password);

    // 4. Lưu vào database
    _context.Users.Add(user);
    _context.SaveChanges();

    // 5. Redirect đến trang Login
    return RedirectToAction("Login");
}
```

**Luồng xử lý:**
1. Validate dữ liệu đầu vào
2. Tạo user với role mặc định là "User"
3. Hash mật khẩu bằng `PasswordHasher<User>`
4. Lưu vào database
5. Chuyển hướng đến trang đăng nhập

---

### 5.3. Action Đăng nhập (Login)

#### HTTP GET - Hiển thị form

```csharp
[AllowAnonymous]
public IActionResult Login() => View();
```

#### HTTP POST - Xử lý đăng nhập

```csharp
[HttpPost]
[AllowAnonymous]
public async Task<IActionResult> Login(LoginViewModel model)
{
    if (!ModelState.IsValid) return View(model);

    // 1. Tìm user theo username
    var user = _context.Users
        .FirstOrDefault(u => u.UserName == model.UserName);

    if (user == null)
    {
        ModelState.AddModelError("", "Sai tài khoản");
        return View(model);
    }

    // 2. Verify mật khẩu
    var hasher = new PasswordHasher<User>();
    var result = hasher.VerifyHashedPassword(
        user, user.PasswordHash, model.Password);

    if (result != PasswordVerificationResult.Success)
    {
        ModelState.AddModelError("", "Sai mật khẩu");
        return View(model);
    }

    // 3. Tạo Claims
    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.Name, user.UserName),
        new Claim(ClaimTypes.Role, user.Role)
    };

    // 4. Tạo Identity và Principal
    var identity = new ClaimsIdentity(claims, "MyCookie");
    var principal = new ClaimsPrincipal(identity);

    // 5. Tạo Cookie
    await HttpContext.SignInAsync("MyCookie", principal);

    // 6. Redirect theo Role
    if (user.Role == "Admin")
        return RedirectToAction("Index", "Admin");

    return RedirectToAction("Index", "Home");
}
```

**Luồng xử lý:**
1. Validate ModelState
2. Kiểm tra username tồn tại
3. Xác minh mật khẩu bằng `VerifyHashedPassword`
4. Tạo Claims (Name, Role)
5. Tạo ClaimsIdentity và ClaimsPrincipal
6. Gọi `SignInAsync` để tạo cookie
7. Redirect theo role

**Claims quan trọng:**
* `ClaimTypes.Name`: Dùng cho `User.Identity.Name`
* `ClaimTypes.Role`: Dùng cho `User.IsInRole("Admin")`

---

### 5.4. Action Đăng xuất (Logout)

```csharp
[Authorize]  // Phải đã đăng nhập
public async Task<IActionResult> Logout()
{
    await HttpContext.SignOutAsync("MyCookie");
    return RedirectToAction("Login");
}
```

**Xử lý:**
* Gọi `SignOutAsync` với đúng scheme name
* Xóa cookie xác thực
* Redirect về trang Login

---

## 6. Tạo View cho Account

### 6.1. View Đăng nhập

**File:** `/Views/Account/Login.cshtml`

```razor
@model LoginViewModel
@{
    ViewData["Title"] = "Đăng nhập";
    Layout = null;  // Không dùng layout chung
}

<!DOCTYPE html>
<html>
<head>
    <title>Đăng nhập</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
</head>
<body>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-4">
                <div class="card shadow">
                    <div class="card-body">
                        <h3 class="text-center mb-4">Đăng nhập</h3>
                        
                        <form asp-action="Login" method="post">
                            <div asp-validation-summary="All" class="text-danger"></div>
                            
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
                            
                            <button type="submit" class="btn btn-primary w-100">Đăng nhập</button>
                        </form>
                        
                        <div class="text-center mt-3">
                            <a asp-action="Register">Chưa có tài khoản? Đăng ký</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.5/jquery.validate.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validation-unobtrusive/4.0.0/jquery.validate.unobtrusive.min.js"></script>
</body>
</html>
```

**Các thành phần quan trọng:**
* `asp-validation-summary="All"`: Hiển thị tất cả lỗi
* `asp-for`: Binding với property trong ViewModel
* `asp-validation-for`: Hiển thị lỗi cho từng field
* Client-side validation scripts: jQuery Validate

---

### 6.2. View Đăng ký

**File:** `/Views/Account/Register.cshtml`

```razor
@model RegisterViewModel
@{
    ViewData["Title"] = "Đăng ký";
    Layout = null;
}

<!DOCTYPE html>
<html>
<head>
    <title>Đăng ký</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
</head>
<body>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-4">
                <div class="card shadow">
                    <div class="card-body">
                        <h3 class="text-center mb-4">Đăng ký tài khoản</h3>
                        
                        <form asp-action="Register" method="post">
                            <div asp-validation-summary="All" class="text-danger"></div>
                            
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
                            
                            <div class="mb-3">
                                <label asp-for="ConfirmPassword" class="form-label"></label>
                                <input asp-for="ConfirmPassword" class="form-control" />
                                <span asp-validation-for="ConfirmPassword" class="text-danger"></span>
                            </div>
                            
                            <button type="submit" class="btn btn-success w-100">Đăng ký</button>
                        </form>
                        
                        <div class="text-center mt-3">
                            <a asp-action="Login">Đã có tài khoản? Đăng nhập</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.5/jquery.validate.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validation-unobtrusive/4.0.0/jquery.validate.unobtrusive.min.js"></script>
</body>
</html>
```

**Lưu ý:**
* Cần thêm field `ConfirmPassword`
* Validation tự động kiểm tra hai mật khẩu khớp nhau
* Link chuyển đổi giữa Login và Register

---

## 7. Bảo vệ Controller và Action bằng [Authorize]

### 7.1. Bảo vệ toàn Controller

```csharp
[Authorize]  // Tất cả action yêu cầu đăng nhập
public class HomeController : Controller
{
    // Các action chỉ truy cập khi đã đăng nhập
}
```

---

### 7.2. Bảo vệ theo Role

```csharp
[Authorize(Roles = "Admin")]  // Chỉ Admin truy cập được
public class AdminController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
```

**Quan trọng:**
* Không chỉ ẩn menu trong View
* Phải bảo vệ cả Controller/Action bằng attribute
* User thường không thể truy cập Admin bằng URL trực tiếp

---

### 7.3. Cho phép truy cập ẩn danh

```csharp
[Authorize]
public class AccountController : Controller
{
    [AllowAnonymous]  // Override [Authorize] của controller
    public IActionResult Login()
    {
        return View();
    }
}
```

**Khi nào dùng:**
* Login, Register phải có `[AllowAnonymous]`
* Tránh redirect loop

---

## 8. Hiển thị thông tin người dùng trong View

### 8.1. Kiểm tra đã đăng nhập

```razor
@if (User.Identity.IsAuthenticated)
{
    <p>Xin chào, @User.Identity.Name</p>
}
else
{
    <a href="/Account/Login">Đăng nhập</a>
}
```

---

### 8.2. Kiểm tra Role

```razor
@if (User.IsInRole("Admin"))
{
    <li class="nav-item">
        <a class="nav-link" href="/Admin/Index">
            <i class="fas fa-user-shield"></i> Quản trị
        </a>
    </li>
}
```

---

### 8.3. Lấy Claims trong Controller

```csharp
public IActionResult Profile()
{
    var userName = User.Identity.Name;
    var role = User.FindFirst(ClaimTypes.Role)?.Value;
    
    ViewBag.UserName = userName;
    ViewBag.Role = role;
    
    return View();
}
```

---

## 9. Các lỗi thường gặp và Cách khắc phục

### Lỗi 1: Redirect loop khi truy cập trang yêu cầu đăng nhập

**Nguyên nhân:**
* LoginPath trỏ đến action có `[Authorize]`
* Login action không có `[AllowAnonymous]`

**Khắc phục:**

```csharp
[AllowAnonymous]  // ← Bắt buộc
public IActionResult Login() => View();
```

---

### Lỗi 2: Sau khi đăng nhập vẫn không được xác thực

**Nguyên nhân:**
* Chưa gọi `UseAuthentication()` trong Program.cs
* Hoặc gọi sau `UseAuthorization()`

**Khắc phục:**

```csharp
app.UseAuthentication();  // ← Phải đặt trước
app.UseAuthorization();
```

---

### Lỗi 3: User.Identity.Name trả về null

**Nguyên nhân:**
* Không thêm Claim `ClaimTypes.Name` khi SignIn

**Khắc phục:**

```csharp
var claims = new List<Claim>
{
    new Claim(ClaimTypes.Name, user.UserName),  // ← Bắt buộc
    new Claim(ClaimTypes.Role, user.Role)
};
```

---

### Lỗi 4: Password luôn sai khi đăng nhập

**Nguyên nhân:**
* Lưu password plain text thay vì hash
* Hash không đúng cách
* Dùng sai phương thức verify

**Khắc phục:**

```csharp
// ĐÚNG: Khi đăng ký
var hasher = new PasswordHasher<User>();
user.PasswordHash = hasher.HashPassword(user, model.Password);

// ĐÚNG: Khi đăng nhập
var result = hasher.VerifyHashedPassword(user, user.PasswordHash, model.Password);
if (result != PasswordVerificationResult.Success)
{
    ModelState.AddModelError("", "Sai mật khẩu");
}

// SAI: Không dùng so sánh trực tiếp
if (user.PasswordHash != model.Password)  // ← SAI!
```

---

### Lỗi 5: ModelState.IsValid luôn trả về false

**Nguyên nhân:**
* Thiếu Data Annotations trong ViewModel
* Dữ liệu form không khớp với property
* Thiếu validation scripts trong View

**Khắc phục:**

1. **Kiểm tra ViewModel:**

```csharp
[Required]  // ← Bắt buộc
[DisplayName("Tài khoản")]
public string UserName { get; set; }
```

2. **Kiểm tra View:**

```razor
@* Phải có asp-for khớp với property *@
<input asp-for="UserName" class="form-control" />
```

3. **Thêm validation scripts:**

```html
<script src="~/lib/jquery-validation/dist/jquery.validate.min.js"></script>
<script src="~/lib/jquery-validation-unobtrusive/jquery.validate.unobtrusive.min.js"></script>
```

---

### Lỗi 6: Logout không xóa được Cookie

**Nguyên nhân:**
* Gọi sai scheme name trong SignOutAsync
* Scheme không khớp với lúc cấu hình

**Khắc phục:**

```csharp
// Program.cs
builder.Services.AddAuthentication("MyCookie")  // ← Tên scheme
    .AddCookie("MyCookie", options => { ... });

// AccountController.cs
await HttpContext.SignOutAsync("MyCookie");  // ← Phải khớp
```

---

### Lỗi 7: Không redirect được sau khi đăng nhập

**Nguyên nhân:**
* Quên `return` trước `RedirectToAction`

**Khắc phục:**

```csharp
// SAI
if (user.Role == "Admin")
    RedirectToAction("Index", "Admin");  // ← Không có return

// ĐÚNG
if (user.Role == "Admin")
    return RedirectToAction("Index", "Admin");  // ← Có return
```

---

### Lỗi 8: User có thể truy cập Admin bằng URL trực tiếp

**Nguyên nhân:**
* Chỉ ẩn menu trong View
* Không bảo vệ Controller bằng `[Authorize]`

**Khắc phục:**

```csharp
[Authorize(Roles = "Admin")]  // ← Bắt buộc
public class AdminController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
```

**Test:**
* Đăng nhập với User thường
* Thử truy cập trực tiếp `/Admin/Index`
* Phải bị chuyển đến AccessDenied hoặc Login

---

### Lỗi 9: Validation không hoạt động phía client

**Nguyên nhân:**
* Thiếu jQuery Validation scripts
* Script được load sai thứ tự

**Khắc phục:**

```html
<!-- Thứ tự quan trọng -->
<script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.5/jquery.validate.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-validation-unobtrusive/4.0.0/jquery.validate.unobtrusive.min.js"></script>
```

---

### Lỗi 10: PasswordHasher không tìm thấy

**Nguyên nhân:**
* Thiếu using statement

**Khắc phục:**

```csharp
using Microsoft.AspNetCore.Identity;  // ← Bắt buộc
```

---


## 10. Nâng cao (Optional)

### 10.1. Remember Me

Thêm checkbox Remember Me vào LoginViewModel:

```csharp
public class LoginViewModel
{
    // ...existing properties...
    
    [DisplayName("Ghi nhớ đăng nhập")]
    public bool RememberMe { get; set; }
}
```

Sử dụng trong Login action:

```csharp
var authProperties = new AuthenticationProperties
{
    IsPersistent = model.RememberMe,
    ExpiresUtc = model.RememberMe 
        ? DateTimeOffset.UtcNow.AddDays(30) 
        : DateTimeOffset.UtcNow.AddHours(24)
};

await HttpContext.SignInAsync("MyCookie", principal, authProperties);
```

---

### 10.2. Return URL

Lưu URL người dùng muốn truy cập trước khi đăng nhập:

```csharp
[AllowAnonymous]
public IActionResult Login(string returnUrl = null)
{
    ViewData["ReturnUrl"] = returnUrl;
    return View();
}

[HttpPost]
[AllowAnonymous]
public async Task<IActionResult> Login(LoginViewModel model, string returnUrl = null)
{
    // ...xử lý đăng nhập...
    
    if (!string.IsNullOrEmpty(returnUrl) && Url.IsLocalUrl(returnUrl))
        return Redirect(returnUrl);
    
    return RedirectToAction("Index", "Home");
}
```

---

### 10.3. Account Lockout

Khóa tài khoản sau nhiều lần đăng nhập sai:

```csharp
public class User
{
    // ...existing properties...
    
    public int AccessFailedCount { get; set; }
    public DateTime? LockoutEnd { get; set; }
    
    public bool IsLockedOut()
    {
        return LockoutEnd.HasValue && LockoutEnd > DateTime.UtcNow;
    }
}
```

---

### 10.4. Email Confirmation

Yêu cầu xác nhận email trước khi đăng nhập:

```csharp
public class User
{
    // ...existing properties...
    
    public string Email { get; set; }
    public bool EmailConfirmed { get; set; }
}
```

---

### 10.5. Two-Factor Authentication (2FA)

Thêm lớp bảo mật thứ hai với OTP.

---

## 11. Tài liệu tham khảo

* [ASP.NET Core Authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/)
* [Cookie Authentication](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie)
* [Authorization in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/security/authorization/)
* [PasswordHasher Class](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.identity.passwordhasher-1)

---

**Kết luận:**

Hệ thống xác thực Cookie-based là giải pháp đơn giản, hiệu quả và phù hợp cho hầu hết ứng dụng ASP.NET Core MVC. Tài liệu này cung cấp đầy đủ kiến thức từ cơ bản đến nâng cao, giúp bạn xây dựng chức năng đăng nhập, đăng ký và đăng xuất một cách chuyên nghiệp.
