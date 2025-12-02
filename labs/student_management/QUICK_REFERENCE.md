# Quick Reference Guide - Student Management UI/UX Features

## ?? Key Features by View

### ?? Index (Danh sách sinh viên)
```
New Features:
? Live search (tên, email, SÐT)
? B? l?c theo gi?i tính & khu v?c
? S?p x?p A-Z, Z-A, ngày sinh
? Hi?n th? s? lý?ng b?n ghi
? Responsive table
? Quick action buttons
? Empty state v?i hý?ng d?n
? Tooltip trên các nút
? Sticky table header
```

### ? Create (Thêm sinh viên)
```
New Features:
? Progress bar hi?n th? ti?n ð?
? Live preview ?nh ð?i di?n
? T? ð?ng tính tu?i
? Validation th?i gian th?c
? G?i ? khu v?c (datalist)
? Auto-format s? ði?n tho?i
? T? ð?ng vi?t hoa tên
? Enter ð? chuy?n field ti?p theo
? Reset có xác nh?n
? Help card v?i hý?ng d?n
```

### ?? Edit (Ch?nh s?a)
```
New Features:
? Change tracking (theo d?i thay ð?i)
? Highlight field ð? thay ð?i
? Tóm t?t các thay ð?i
? So sánh ?nh c?/m?i
? Warning khi r?i trang chýa lýu
? Xác nh?n trý?c khi lýu
? Nút hoàn tác v? giá tr? c?
? Disable nút lýu n?u không có thay ð?i
```

### ??? Details (Chi ti?t)
```
New Features:
? Layout 2 c?t responsive
? Quick actions (email, phone)
? Copy to clipboard cho email, SÐT, URL
? Toast notification khi copy
? Card phân lo?i thông tin
? Hi?n th? tu?i tính toán
? Format ngày theo ti?ng Vi?t
? Metadata (ID, tr?ng thái)
```

### ??? Delete (Xóa)
```
New Features:
? Multi-level confirmation
? Required checkbox ð? enable nút xóa
? Hi?n th? ?nh grayscale v?i icon X
? Li?t kê ð?y ð? thông tin s? xóa
? Warning animation
? Ð? xu?t hành ð?ng thay th?
? Final confirmation dialog
? Disable t?t c? nút sau khi submit
```

---

## ?? CSS Classes M?i

### Animation Classes
```css
.spin-animation          /* Xoay 360° */
.pulse-danger           /* Pulse effect màu ð? */
.btn-danger-pulse       /* Button v?i pulse */
.fadeIn                 /* Fade in animation */
.fadeInUp               /* Fade in t? dý?i lên */
```

### State Classes
```css
.border-warning         /* Border vàng cho field ð? thay ð?i */
.table-row-hover        /* Hover state cho table row */
.detail-item            /* Card cho detail information */
```

### Loading States
```css
#loadingOverlay         /* Full screen loading */
.btn-spinner            /* Loading spinner trong button */
.spinner-border         /* Bootstrap spinner */
```

---

## ?? JavaScript Functions

### Index.cshtml
```javascript
filterTable()           // L?c table theo search & filters
sortTable(sortBy)       // S?p x?p table
updateVisibleCount()    // C?p nh?t s? lý?ng hi?n th?
```

### Create.cshtml
```javascript
updateProgress()        // C?p nh?t progress bar
isValidUrl(url)        // Validate URL
calculateAge()         // Tính tu?i t? ngày sinh
```

### Edit.cshtml
```javascript
trackChanges()         // Theo d?i thay ð?i
resetToOriginal()      // Hoàn tác v? giá tr? c?
warnBeforeLeave()      // C?nh báo trý?c khi r?i trang
```

### Details.cshtml
```javascript
copyToClipboard(text)  // Copy text vào clipboard
showToast()            // Hi?n th? toast notification
```

---

## ?? Responsive Breakpoints

```
Desktop:  > 1200px  (Full features)
Laptop:   992-1199px (Adapted)
Tablet:   768-991px  (Simplified)
Mobile:   < 768px    (Touch-optimized)
```

---

## ?? User Interaction Patterns

### Search & Filter
1. Nh?p text vào ô search
2. Ch?n filters (gi?i tính, khu v?c)
3. Ch?n cách s?p x?p
4. K?t qu? update real-time
5. Xóa filter b?ng nút "Xóa b? l?c"

### Creating Student
1. Nh?p URL ?nh (optional) ? Xem preview
2. Ði?n thông tin b?t bu?c ? Progress bar tãng
3. Ch?n ngày sinh ? Tu?i t? ð?ng tính
4. Form validate real-time
5. Submit ho?c Reset

### Editing Student
1. Thay ð?i thông tin ? Field highlight vàng
2. Xem tóm t?t thay ð?i
3. Xác nh?n lýu ? List thay ð?i hi?n th?
4. Hoàn tác n?u c?n
5. Warning n?u r?i trang

### Viewing Details
1. Xem thông tin chi ti?t
2. Click email/phone ð? liên h?
3. Copy thông tin b?ng nút clipboard
4. Toast hi?n th? khi copy thành công
5. Navigate ð?n Edit ho?c Delete

### Deleting Student
1. Xem warning và thông tin
2. Ð?c k? c?nh báo
3. Check vào checkbox xác nh?n
4. Nút Delete ðý?c enable
5. Final confirmation
6. Submit v?i loading state

---

## ?? Color Scheme

```
Primary:   #667eea (Purple gradient)
Success:   #28a745 (Green)
Warning:   #ffc107 (Yellow)
Danger:    #dc3545 (Red)
Info:      #17a2b8 (Cyan)
Light:     #f8f9fa (Background)
Dark:      #212529 (Text)
```

---

## ?? Keyboard Shortcuts

```
Tab           ? Di chuy?n gi?a các field
Enter         ? Chuy?n field ti?p theo (trong form)
Shift + Tab   ? Quay l?i field trý?c
Escape        ? Ðóng modal/dialog (n?u có)
Ctrl + Enter  ? Submit form (có th? implement)
```

---

## ?? Validation Rules

### Name
- Required
- Min length: 2 characters
- Auto-capitalize

### Email
- Required
- Valid email format
- Contains @

### Phone
- Required
- 10-11 digits only
- Auto-format (remove non-digits)

### Date of Birth
- Required
- Not future date
- Age between 16-100 (warning if outside)

### Gender
- Required
- Select from options

### Region
- Required
- Free text with suggestions

### Image URL
- Optional
- Valid URL format
- Auto-validate and preview

---

## ?? Performance Tips

1. **Images**: S? d?ng CDN cho ?nh external
2. **Search**: Debounce time 300ms
3. **Table**: Lazy load n?u > 100 rows
4. **Forms**: Validate on blur, not on input
5. **Animations**: Use CSS instead of JS

---

## ?? Common Issues & Solutions

### Issue: ?nh không load
**Solution**: Check URL, fallback avatar s? hi?n th?

### Issue: Form không submit
**Solution**: Check validation, các field b?t bu?c

### Issue: Search không ho?t ð?ng
**Solution**: Clear cache, reload trang

### Issue: Change tracking không chính xác
**Solution**: Original values ðý?c lýu trong data-attribute

### Issue: Mobile layout l?i
**Solution**: Check viewport meta tag, responsive classes

---

## ?? Support & Maintenance

### Files to Monitor:
- `/Views/Students/*.cshtml` - View files
- `/wwwroot/css/site.css` - Styles
- Browser console - JavaScript errors

### Regular Tasks:
- Clear browser cache after updates
- Test on different devices
- Monitor performance
- Update dependencies

---

## ? Testing Checklist

**Desktop (Chrome, Edge, Firefox):**
- [ ] All CRUD operations
- [ ] Filtering và search
- [ ] Form validation
- [ ] Image preview
- [ ] Change tracking
- [ ] Clipboard copy

**Mobile (iOS Safari, Chrome Android):**
- [ ] Responsive layout
- [ ] Touch targets
- [ ] Form usability
- [ ] Navigation
- [ ] Performance

**Edge Cases:**
- [ ] Empty data
- [ ] Invalid URLs
- [ ] Very long text
- [ ] Special characters
- [ ] Network errors

---

## ?? Additional Resources

- Bootstrap 5 Docs: https://getbootstrap.com
- Bootstrap Icons: https://icons.getbootstrap.com
- jQuery Docs: https://jquery.com
- ASP.NET Core Docs: https://docs.microsoft.com/aspnet/core

---

**Last Updated**: @DateTime.Now.ToString("dd/MM/yyyy HH:mm")
**Version**: 1.0.0
**Status**: Production Ready ?
