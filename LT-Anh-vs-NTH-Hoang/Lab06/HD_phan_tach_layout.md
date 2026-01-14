# Tách Layout Client và Admin trong ASP.NET Core MVC

---
Mục đích của phân tách Layout:
# Phân tách rõ chức năng cho từng tác nhân
# Tái sử dụng layout cho các chức năng phù hợp

---
Tài liệu này hướng dẫn chi tiết cách phân tách bố cục cho hai tác nhân Admin và User tương ứng với _AdminLayout.cshtml và _ClientLayout.cshtml.

---

## 1. Cấu trúc thư mục đề xuất

```text
/Views
 ├─ /Shared
 │   ├─ _ClientLayout.cshtml
 │   ├─ _AdminLayout.cshtml
 │   └─ _ViewImports.cshtml
 │
 ├─ /Client
 │   ├─ Home
 │   │   └─ Index.cshtml
 │
 ├─ /Admin
 │   ├─ Dashboard
 │   │   └─ Index.cshtml
 │
 └─ _ViewStart.cshtml
```

---

## 2. Tạo Client Layout

**File:** `/Views/Shared/_ClientLayout.cshtml`

Mục đích:

* Giao diện cho người dùng cuối
* Menu đơn giản, không chứa chức năng quản trị

Ví dụ nội dung chính:

* Header / Navbar người dùng
* `@RenderBody()`
* Footer

---

## 3. Tạo Admin Layout

**File:** `/Views/Shared/_AdminLayout.cshtml`

Mục đích:

* Giao diện cho quản trị viên
* Sidebar, menu quản lý, thống kê, cấu hình hệ thống

Ví dụ nội dung chính:

* Sidebar quản trị
* Topbar (User, Logout)
* `@RenderBody()`

---

## 4. Cấu hình ViewStart để gán layout mặc định

**File:** `/Views/_ViewStart.cshtml`

```csharp
@{
    Layout = "~/Views/Shared/_ClientLayout.cshtml";
}
```

→ Mặc định toàn bộ view sử dụng **ClientLayout**.

---

## 5. Gán AdminLayout cho khu vực Admin

### Cách 1: Gán trực tiếp trong View

```csharp
@{
    Layout = "~/Views/Shared/_AdminLayout.cshtml";
}
```

Áp dụng cho các view thuộc Admin.

---

### Cách 2 (Khuyến nghị): Dùng thư mục riêng + _ViewStart

**Tạo file:** `/Views/Admin/_ViewStart.cshtml`

```csharp
@{
    Layout = "~/Views/Shared/_AdminLayout.cshtml";
}
```

→ Toàn bộ view trong thư mục `Admin` tự động dùng **AdminLayout**.

---

## 6. Kết hợp phân quyền (Sau khi hệ thống đã có chức năng xác thực)

Ví dụ gán quyền cho Controller Admin:

```csharp
[Authorize(Roles = "Admin")]
public class DashboardController : Controller
{
    public IActionResult Index()
    {
        return View();
    }
}
```

→ Đảm bảo:

* **AdminLayout** chỉ hiển thị cho đúng vai trò
* Không chỉ tách giao diện, mà còn tách **nghiệp vụ và bảo mật**

---

## Các lỗi thường gặp và Cách khắc phục

### Lỗi 1: View Admin vẫn dùng ClientLayout

**Nguyên nhân:**

* Không có `_ViewStart.cshtml` trong thư mục `Views/Admin`
* Hoặc gán sai đường dẫn layout

**Khắc phục:**

* Tạo file `Views/Admin/_ViewStart.cshtml`
* Gán đúng layout:

```csharp
@{
    Layout = "~/Views/Shared/_AdminLayout.cshtml";
}
```

---

### Lỗi 2: Đã phân quyền Admin nhưng vẫn truy cập được URL

**Nguyên nhân:**

* Chỉ kiểm soát giao diện, chưa kiểm soát Controller
* Thiếu `[Authorize]`

**Khắc phục:**

* Bắt buộc gắn `[Authorize(Roles = "Admin")]` cho controller hoặc action Admin
* Không dựa vào việc ẩn menu để bảo mật

---

### Lỗi 3: Sai đường dẫn layout (`Layout not found`)

**Nguyên nhân:**

* Sai đường dẫn tuyệt đối
* Đổi tên file layout nhưng không cập nhật lại

**Khắc phục:**

* Luôn dùng đường dẫn tuyệt đối:

```csharp
Layout = "~/Views/Shared/_AdminLayout.cshtml";
```

* Kiểm tra đúng tên file và thư mục

---

### Lỗi 4: Layout Admin bị áp dụng cho toàn hệ thống

**Nguyên nhân:**

* Gán `AdminLayout` trong `Views/_ViewStart.cshtml`

**Khắc phục:**

* `Views/_ViewStart.cshtml` **chỉ** dùng ClientLayout
* AdminLayout chỉ đặt trong `Views/Admin/_ViewStart.cshtml`

---

### Lỗi 5: Menu Admin hiển thị với User thường

**Nguyên nhân:**

* Dùng chung layout và render menu theo điều kiện `User.IsInRole`

**Khắc phục:**

* Tách layout vật lý (2 file riêng biệt)
* Không xử lý phân quyền menu trong ClientLayout

---

### Lỗi 6: View dùng layout sai khi return từ Controller khác thư mục

**Nguyên nhân:**

* Return view không đúng đường dẫn

**Ví dụ sai:**

```csharp
return View("Index");
```

**Khắc phục:**

```csharp
return View("~/Views/Admin/Dashboard/Index.cshtml");
```

## Các mẹo (Nên áp dụng)
* Luôn tách thư mục Admin riêng (/Views/Admin) thay vì nhét chung rồi xử lý bằng if (User.IsInRole) trong layout.
* Đặt tên layout rõ nghĩa: _ClientLayout.cshtml, _AdminLayout.cshtml – tránh dùng _Layout1, _LayoutAdminNew.
* Kiểm tra bằng URL trực tiếp (/Admin/Dashboard) thay vì chỉ click menu.
---

