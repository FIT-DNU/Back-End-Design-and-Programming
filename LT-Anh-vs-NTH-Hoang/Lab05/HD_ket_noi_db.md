# HƯỚNG DẪN KẾT NỐI ASP.NET CORE 8 MVC VỚI SQL SERVER 2022

Tài liệu này hướng dẫn chi tiết cách thiết lập kết nối Database sử dụng **Entity Framework Core 8** (phương pháp Code First).

---

## 1. Cài đặt các thư viện (NuGet Packages)

Bạn cần cài đặt các gói sau thông qua **Package Manager Console** trong Visual Studio. Mở Tools > NuGet Package Manager > Package Manager Console và chạy các lệnh sau:

```powershell
Install-Package Microsoft.EntityFrameworkCore.SqlServer -Version 8.0.11
Install-Package Microsoft.EntityFrameworkCore.Tools -Version 8.0.11
Install-Package Microsoft.EntityFrameworkCore.Design -Version 8.0.11
```

## 2. Cấu hình Chuỗi kết nối (Connection String)
Mở file **`appsettings.json`** và thêm đoạn mã sau vào phía trên cùng:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER_NAME;Database=MyDatabaseName;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
  }
}
```
- YOUR_SERVER_NAME: Thay bằng tên SQL Server của bạn (ví dụ: .\SQLEXPRESS hoặc tên máy tính).

- TrustServerCertificate=True: Cần thiết cho các phiên bản SQL Server mới để tránh lỗi bảo mật SSL.


## 3. Tạo lớp DbContext

Tạo thư mục `Data` ở thư mục gốc của dự án, sau đó tạo file **`ApplicationDbContext.cs`**:

```csharp
using Microsoft.EntityFrameworkCore;

namespace YourProject.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // Khai báo các bảng dữ liệu (Entities) tại đây
        // Ví dụ: public DbSet<User> Users { get; set; }
    }
}
```

## 4. Cấu hình trong Program.cs

Mở file **`Program.cs`** (nằm ở thư mục gốc của dự án ASP.NET Core 8) và thực hiện đăng ký dịch vụ kết nối Database:

```csharp
using Microsoft.EntityFrameworkCore;
using YourProject.Data; // Thay bằng namespace thực tế của bạn

var builder = WebApplication.CreateBuilder(args);

// 1. Lấy Connection String từ tệp appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// 2. Cấu hình DbContext để sử dụng SQL Server
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

// 3. Thêm các dịch vụ MVC (mặc định đã có)
builder.Services.AddControllersWithViews();

var app = builder.Build();

// Các cấu hình Middleware phía dưới giữ nguyên...

```

## 5. Thực hiện Migration để tạo Database

Sau khi đã hoàn tất cấu hình Code, bạn cần chạy lệnh Migration để Entity Framework tự động tạo bảng trong SQL Server.

### Các bước thực hiện:

1. Mở **Package Manager Console** (Vào menu `Tools` > `NuGet Package Manager` > `Package Manager Console`).

2. **Tạo bản ghi thay đổi (Migration):**
   Nhập lệnh sau và nhấn Enter:
   ```powershell
   Add-Migration InitialCreate

3. **Update thay đổi**
    ```powershell
    Update-Database

## Các lỗi thường gặp và Cách khắc phục

Dưới đây là các lỗi phổ biến khi kết nối ASP.NET Core 8 với SQL Server 2022:

### 1. Lỗi Chứng chỉ SSL (Certificate Error)
**Thông báo:** *"A connection was successfully established with the server, but then an error occurred during the login process."*
* **Nguyên nhân:** SQL Server 2022 yêu cầu kết nối mã hóa mặc định.
* **Cách sửa:** Thêm `TrustServerCertificate=True;` vào cuối chuỗi Connection String trong file `appsettings.json`.

### 2. Lỗi Không tìm thấy Server (Network-related or Instance-specific)
**Thông báo:** *"A network-related or instance-specific error occurred while establishing a connection to SQL Server."*
* **Nguyên nhân:** Tên Server sai hoặc SQL Service chưa được khởi động.
* **Cách sửa:** * Kiểm tra lại tên Server (ví dụ: `.\SQLEXPRESS` hoặc `(localdb)\MSSQLLocalDB`).
    * Mở **Services.msc** và đảm bảo dịch vụ `SQL Server (MSSQLSERVER)` hoặc `SQL Server (SQLEXPRESS)` đang ở trạng thái **Running**.

### 3. Lỗi thiếu lệnh UseSqlServer
**Thông báo:** *"'DbContextOptionsBuilder' does not contain a definition for 'UseSqlServer'"*
* **Nguyên nhân:** Chưa cài đặt thư viện SQL Server cho EF Core.
* **Cách sửa:** Chạy lệnh `Install-Package Microsoft.EntityFrameworkCore.SqlServer` trong NuGet Package Manager Console.

### 4. Lỗi khi chạy Update-Database
**Thông báo:** *"The term 'Update-Database' is not recognized..."*
* **Nguyên nhân:** Chưa cài đặt thư viện Tools của EF Core.
* **Cách sửa:** Chạy lệnh `Install-Package Microsoft.EntityFrameworkCore.Tools`.

---
> **Mẹo nhỏ:** Luôn kiểm tra kỹ dấu phẩy (`,`) và dấu ngoặc nháy (`"`) trong file `appsettings.json` vì chỉ cần sai một ký tự nhỏ cũng khiến ứng dụng không thể đọc được chuỗi kết nối.