# Tách Layout Client và Admin trong ASP.NET Core MVC

## Mục tiêu

Tách giao diện (Layout) thành **ClientLayout** và **AdminLayout** nhằm:

* Phân tách rõ ràng chức năng theo **vai trò (Role)** và **quyền (Authorization)**.
* Dễ bảo trì, mở rộng và kiểm soát giao diện.
* Tránh trộn lẫn UI giữa người dùng cuối và quản trị viên.

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

## 6. Kết hợp phân quyền (Authorization)

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

## 7. Nguyên tắc khuyến nghị

* Client và Admin **không dùng chung layout**
* Menu admin không render theo điều kiện role trong ClientLayout
* Admin nên đặt trong thư mục riêng (`/Admin`)
* Layout chỉ lo giao diện, không xử lý nghiệp vụ

---

## 8. Kết luận

Việc tách **ClientLayout** và **AdminLayout** là bắt buộc với dự án MVC nghiêm túc:

* Rõ ràng vai trò
* Dễ kiểm soát quyền
* Dễ mở rộng về sau (CMS, ERP, Dashboard)

---

**Phù hợp cho:**

* Đồ án sinh viên
* Hệ thống quản trị nội bộ
* Ứng dụng ASP.NET Core MVC có phân quyền
