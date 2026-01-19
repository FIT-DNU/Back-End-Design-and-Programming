# HƯỚNG DẪN NHÚNG SWAGGER CHO ASP.NET CORE 8 MVC API

Tài liệu này hướng dẫn chi tiết cách tích hợp **Swagger (OpenAPI)** vào dự án **ASP.NET Core 8 MVC API** nhằm hỗ trợ kiểm thử và tài liệu hóa API.

---

## 1. Cài đặt thư viện Swagger (NuGet Packages)

Cài đặt gói Swagger qua **Package Manager Console**:

```powershell
Install-Package Swashbuckle.AspNetCore
```

---

## 2. Đăng ký Swagger Service trong Program.cs

Mở file **`Program.cs`** và thêm các cấu hình sau:

```csharp
var builder = WebApplication.CreateBuilder(args);

// 1. Đăng ký Controller (MVC API)
builder.Services.AddControllers();

// 2. Đăng ký Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
```

> `AddEndpointsApiExplorer()` giúp Swagger quét các API Endpoint
> `AddSwaggerGen()` tạo tài liệu OpenAPI

---

## 3. Kích hoạt Swagger Middleware

Trong cùng file **`Program.cs`**, thêm cấu hình Middleware:

```csharp
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
```

Sau đó giữ nguyên các Middleware còn lại:

```csharp
app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();
app.Run();
```

---

## 4. Truy cập Swagger UI

Sau khi chạy project, truy cập:

```
https://localhost:{port}/swagger
```

Swagger UI cho phép:

* Xem danh sách API
* Xem Request / Response
* Gửi request trực tiếp để test API

---

## 5. Yêu cầu bắt buộc để Swagger hiển thị đúng API

### 5.1 Controller phải có `[ApiController]`

```csharp
[ApiController]
[Route("api/[controller]")]
public class SinhVienController : ControllerBase
{
}
```

---

### 5.2 Action phải khai báo HTTP Method

```csharp
[HttpGet]
[HttpPost]
[HttpGet("{id}")]
```

Thiếu HTTP Attribute → Swagger không hiển thị API

---

## 6. Hiển thị mô tả API bằng XML Comment

### 6.1 Bật XML Comment trong file `.csproj`

```xml
<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
</PropertyGroup>
```

---

### 6.2 Cấu hình Swagger đọc XML Comment

Thêm đoạn sau vào `AddSwaggerGen()`:

```csharp
using System.Reflection;

builder.Services.AddSwaggerGen(options =>
{
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    options.IncludeXmlComments(xmlPath);
});
```

---

### 6.3 Viết Comment cho API

```csharp
/// <summary>
/// Lấy danh sách sinh viên
/// </summary>
[HttpGet]
public IActionResult GetAll()
{
    return Ok();
}
```

Swagger sẽ hiển thị mô tả rõ ràng cho từng API.

---

## 7. Các lỗi thường gặp và Cách khắc phục

### 1. Không truy cập được `/swagger`

**Nguyên nhân:** Chưa gọi `UseSwagger()` hoặc `UseSwaggerUI()`
**Cách sửa:** Kiểm tra lại cấu hình Middleware trong `Program.cs`

---

### 2. Swagger không hiển thị API

**Nguyên nhân:**

* Thiếu `[ApiController]`
* Thiếu `[HttpGet]`, `[HttpPost]`, …

**Cách sửa:** Kiểm tra lại Controller và Action

---

### 3. Swagger không hiển thị Model

**Nguyên nhân:** Action không nhận hoặc không trả về model rõ ràng
**Cách sửa:** Khai báo tham số và kiểu trả về cụ thể

---

### 4. Swagger chỉ chạy ở môi trường Development

**Nguyên nhân:** Swagger được đặt trong điều kiện `IsDevelopment()`
**Cách sửa (nếu cần):** Bỏ điều kiện môi trường (không khuyến khích cho production)

---

* Viết README **Swagger + JWT**
* Chuẩn hóa README cho **toàn bộ môn học**
* Hoặc chỉnh lại cho đúng **chuẩn báo cáo sinh viên**

Nói thẳng yêu cầu, tôi làm tiếp.
