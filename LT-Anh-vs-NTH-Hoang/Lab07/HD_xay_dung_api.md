# HƯỚNG DẪN NHÚNG SWAGGER CHO ASP.NET CORE 8 MVC API

*(Áp dụng cho dự án có sẵn MVC Web và API tách riêng)*

Tài liệu này hướng dẫn cách tích hợp **Swagger (OpenAPI)** cho **ASP.NET Core 8 MVC API**, trong trường hợp dự án **đã có MVC Web (Controller + View)** và cần xây dựng **API riêng để phục vụ client / test / mobile / frontend khác**.

---

## 1. Lưu ý kiến trúc trước khi nhúng Swagger

Trong dự án ASP.NET Core:

* **MVC Web Controller**

  * Kế thừa `Controller`
  * Trả về `View()`
  * Không dùng Swagger

* **MVC API Controller**

  * Kế thừa `ControllerBase`
  * Trả về JSON (`Ok`, `NotFound`, …)
  * Dùng Swagger

**Swagger CHỈ áp dụng cho API Controller**, không áp dụng cho Controller trả View.

---

## 2. Cài đặt thư viện Swagger (NuGet Packages)

Cài đặt gói Swagger qua **Package Manager Console**:

```powershell
Install-Package Swashbuckle.AspNetCore
```

---

## 3. Đăng ký Swagger Service trong Program.cs

Mở file **`Program.cs`** và thêm các cấu hình sau:

```csharp
var builder = WebApplication.CreateBuilder(args);

// 1. Đăng ký Controller cho API
builder.Services.AddControllers();

// 2. Đăng ký Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
```

> `AddEndpointsApiExplorer()` giúp Swagger quét các API Endpoint
> `AddSwaggerGen()` tạo tài liệu OpenAPI

---

## 4. Kích hoạt Swagger Middleware

Trong cùng file **`Program.cs`**, thêm cấu hình Middleware:

```csharp
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
```

Giữ nguyên các Middleware khác:

```csharp
app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();
app.Run();
```

---

## 5. Truy cập Swagger UI

Sau khi chạy project, truy cập:

```
https://localhost:{port}/swagger
```

Swagger UI cho phép:

* Xem danh sách API
* Xem cấu trúc Request / Response
* Gửi request trực tiếp để test API

---

## 6. Yêu cầu bắt buộc để Swagger hiển thị đúng API

### 6.1 API Controller phải có `[ApiController]`

**Ví dụ Controller API đúng chuẩn:**

```csharp
[ApiController]
[Route("api/sinhvien")]
public class SinhVienApiController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SinhVienApiController(ApplicationDbContext context)
    {
        _context = context;
    }

    // GET: api/sinhvien
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var data = await _context.SinhViens.ToListAsync();
        return Ok(data);
    }

    // GET: api/sinhvien/5
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var sv = await _context.SinhViens.FindAsync(id);
        if (sv == null) return NotFound();
        return Ok(sv);
    }

    // POST: api/sinhvien
    [HttpPost]
    public async Task<IActionResult> Create(SinhVien sinhVien)
    {
        _context.SinhViens.Add(sinhVien);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = sinhVien.Id }, sinhVien);
    }

    // PUT: api/sinhvien/5
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, SinhVien sinhVien)
    {
        if (id != sinhVien.Id) return BadRequest();

        _context.Entry(sinhVien).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/sinhvien/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var sv = await _context.SinhViens.FindAsync(id);
        if (sv == null) return NotFound();

        _context.SinhViens.Remove(sv);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
```

**Không dùng `Controller` và không trả `View()`**

---

### 6.2 Action phải khai báo HTTP Method

```csharp
[HttpGet]
[HttpPost]
[HttpGet("{id}")]
```

Thiếu HTTP Attribute → Swagger không hiển thị API

---

## 7. Hiển thị mô tả API bằng XML Comment

### 7.1 Bật XML Comment trong file `.csproj`

```xml
<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
</PropertyGroup>
```

---

### 7.2 Cấu hình Swagger đọc XML Comment

Thêm vào `AddSwaggerGen()`:

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

### 7.3 Viết Comment cho API Method

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

## 8. Các lỗi thường gặp và Cách khắc phục

### 1. Không truy cập được `/swagger`

**Nguyên nhân:**
Chưa gọi `UseSwagger()` hoặc `UseSwaggerUI()`

**Cách sửa:**
Kiểm tra lại Middleware trong `Program.cs`

---

### 2. Swagger không hiển thị API

**Nguyên nhân:**

* Controller kế thừa `Controller` thay vì `ControllerBase`
* Thiếu `[ApiController]`
* Thiếu `[HttpGet]`, `[HttpPost]`, …

**Cách sửa:**
Tách riêng **API Controller** và kiểm tra lại Attribute

---

### 3. Swagger không hiển thị Model

**Nguyên nhân:**
Action không nhận hoặc không trả về model cụ thể

**Cách sửa:**
Khai báo rõ tham số và kiểu trả về

---

### 4. Swagger chỉ chạy ở môi trường Development

**Nguyên nhân:**
Swagger được đặt trong điều kiện `IsDevelopment()`

**Cách sửa (nếu cần):**
Bỏ điều kiện môi trường *(không khuyến khích cho production)*

---
