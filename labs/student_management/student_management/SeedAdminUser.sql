-- Script ð? t?o tài kho?n admin m?u
-- Username: admin
-- Password: admin123
-- Email: admin@student.edu.vn

USE StudentDB;
GO

-- Ki?m tra xem user admin ð? t?n t?i chýa
IF NOT EXISTS (SELECT 1 FROM [User] WHERE Username = 'admin')
BEGIN
    -- Password hash c?a 'admin123' (SHA256)
    INSERT INTO [User] (Username, PasswordHash, Email, FullName, Role, CreatedAt, IsActive)
    VALUES (
        'admin',
        'lN3vPKPddPLIaKF2PpCF+dSt7LxUKXGtRBn+9Y4YXaQ=', -- Hash c?a 'admin123'
        'admin@student.edu.vn',
        N'Qu?n tr? viên',
        'Admin',
        GETDATE(),
        1
    );

    PRINT 'Tài kho?n admin ð? ðý?c t?o thành công!';
    PRINT 'Username: admin';
    PRINT 'Password: admin123';
END
ELSE
BEGIN
    PRINT 'Tài kho?n admin ð? t?n t?i!';
END
GO
