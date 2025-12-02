$(document).ready(function() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    let currentPage = 1;
    let itemsPerPage = 25;
    let allRows = [];
    let filteredRows = [];

    updateRowsList();
    applyFiltersAndSort();
    animateStatsCards();

    // Keyboard shortcuts
    $(document).on('keydown', function(e) {
        if (e.altKey) {
            switch(e.key.toLowerCase()) {
                case 's':
                    e.preventDefault();
                    $('#searchInput').focus();
                    break;
                case 'n':
                    e.preventDefault();
                    window.location.href = document.querySelector('a[asp-action="Create"]').href;
                    break;
                case 'r':
                    e.preventDefault();
                    $('#refreshBtn').click();
                    break;
                case 'c':
                    e.preventDefault();
                    $('#clearFilter').click();
                    break;
                case 'e':
                    e.preventDefault();
                    $('#exportBtn').click();
                    break;
            }
        } else if (e.key === '?') {
            $('#shortcutsModal').modal('show');
        }
    });

    // Search functionality with debounce
    let searchTimeout;
    $('#searchInput').on('input', function() {
        clearTimeout(searchTimeout);
        const value = $(this).val();
        $('#clearSearch').toggle(value.length > 0);
        
        searchTimeout = setTimeout(() => {
            applyFiltersAndSort();
        }, 300);
    });

    $('#clearSearch').on('click', function() {
        $('#searchInput').val('').trigger('input');
    });

    // Filter functionality
    $('#genderFilter, #regionFilter').on('change', function() {
        applyFiltersAndSort();
    });

    // Sort functionality
    $('#sortBy').on('change', function() {
        applyFiltersAndSort();
    });

    // Items per page
    $('#itemsPerPage').on('change', function() {
        itemsPerPage = $(this).val() === 'all' ? filteredRows.length : parseInt($(this).val());
        currentPage = 1;
        updateDisplay();
    });

    // Clear filter
    $('#clearFilter, #clearFilterFromNoResults').on('click', function() {
        $('#searchInput').val('');
        $('#genderFilter').val('');
        $('#regionFilter').val('');
        $('#sortBy').val('name-asc');
        $('#clearSearch').hide();
        applyFiltersAndSort();
    });

    // Refresh button
    $('#refreshBtn').on('click', function() {
        const $icon = $(this).find('i');
        $icon.addClass('spin-animation');
        setTimeout(() => location.reload(), 500);
    });

    // Select all checkbox
    $('#selectAll').on('change', function() {
        const isChecked = $(this).is(':checked');
        $('.student-row:visible .row-checkbox').prop('checked', isChecked);
        updateBulkActionsBar();
    });

    // Row checkbox
    $(document).on('change', '.row-checkbox', function() {
        updateBulkActionsBar();
        const visibleCheckboxes = $('.student-row:visible .row-checkbox');
        const checkedCheckboxes = visibleCheckboxes.filter(':checked');
        $('#selectAll').prop('checked', visibleCheckboxes.length === checkedCheckboxes.length);
    });

    // Clear selection
    $('#clearSelection').on('click', function() {
        $('.row-checkbox, #selectAll').prop('checked', false);
        updateBulkActionsBar();
    });

    // Bulk export
    $('#bulkExport').on('click', function() {
        const selectedIds = $('.row-checkbox:checked').map(function() {
            return $(this).val();
        }).get();
        
        const selectedRows = allRows.filter(row => 
            selectedIds.includes($(row).data('id').toString())
        );
        
        exportToExcel(selectedRows, 'DanhSachSinhVien_DaChon');
    });

    // Export button
    $('#exportBtn').on('click', function() {
        exportToExcel(filteredRows.length > 0 ? filteredRows : allRows, 'DanhSachSinhVien');
    });

    // Pagination click handler
    $(document).on('click', '#pagination a.page-link', function(e) {
        e.preventDefault();
        const page = parseInt($(this).data('page'));
        if (page && page !== currentPage) {
            currentPage = page;
            updateDisplay();
            smoothScrollTop();
        }
    });

    // Functions
    function updateRowsList() {
        allRows = $('.student-row').toArray();
    }

    function applyFiltersAndSort() {
        const searchTerm = $('#searchInput').val().toLowerCase();
        const genderFilter = $('#genderFilter').val();
        const regionFilter = $('#regionFilter').val();
        const sortBy = $('#sortBy').val();
        const hasFilters = searchTerm !== '' || genderFilter !== '' || regionFilter !== '';

        // Filter
        filteredRows = allRows.filter(function(row) {
            const $row = $(row);
            const name = $row.data('name') || '';
            const email = $row.data('email') || '';
            const phone = $row.data('phone') || '';
            const gender = $row.data('gender').toString();
            const region = $row.data('region') || '';

            const matchSearch = searchTerm === '' || 
                              name.includes(searchTerm) || 
                              email.includes(searchTerm) || 
                              phone.includes(searchTerm);
            
            const matchGender = genderFilter === '' || gender === genderFilter;
            const matchRegion = regionFilter === '' || region === regionFilter;

            return matchSearch && matchGender && matchRegion;
        });

        // Sort
        filteredRows.sort(function(a, b) {
            const $a = $(a);
            const $b = $(b);
            let aVal, bVal;
            
            switch(sortBy) {
                case 'name-asc':
                    aVal = $a.data('name');
                    bVal = $b.data('name');
                    return aVal.localeCompare(bVal, 'vi');
                case 'name-desc':
                    aVal = $a.data('name');
                    bVal = $b.data('name');
                    return bVal.localeCompare(aVal, 'vi');
                case 'date-asc':
                    aVal = new Date($a.data('dob'));
                    bVal = new Date($b.data('dob'));
                    return aVal - bVal;
                case 'date-desc':
                    aVal = new Date($a.data('dob'));
                    bVal = new Date($b.data('dob'));
                    return bVal - aVal;
            }
            return 0;
        });

        // Update filter status
        if (hasFilters) {
            const filterParts = [];
            if (searchTerm) filterParts.push(`"${searchTerm}"`);
            if (genderFilter) filterParts.push(genderFilter === '1' ? 'Nam' : 'Nữ');
            if (regionFilter) filterParts.push(regionFilter);
            
            $('#filterMessage')?.text('Đang lọc: ' + filterParts.join(', '));
            $('#filterStatus').fadeIn(200);
        } else {
            $('#filterStatus').fadeOut(200);
        }

        currentPage = 1;
        updateDisplay();
    }

    function updateDisplay() {
        // Hide all rows
        $('.student-row').hide();

        // Show/hide no results state
        if (filteredRows.length === 0) {
            $('#noResultsState').fadeIn(300);
            $('.table-responsive').hide();
            $('#pagination').empty();
            return;
        } else {
            $('#noResultsState').hide();
            $('.table-responsive').show();
        }

        // Calculate pagination
        const totalItems = filteredRows.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

        // Show rows for current page with animation
        const rowsToShow = filteredRows.slice(startIndex, endIndex);
        $('#tableBody').empty();
        rowsToShow.forEach((row, index) => {
            $(row).css('animation-delay', `${index * 30}ms`);
            $('#tableBody').append(row);
            $(row).fadeIn(200);
        });

        // Update counts
        $('#showingFrom').text(totalItems > 0 ? startIndex + 1 : 0);
        $('#showingTo').text(endIndex);
        $('#totalCount').text(totalItems);

        // Generate pagination
        generatePagination(totalPages);

        // Update select all checkbox
        updateSelectAllState();
    }

    function generatePagination(totalPages) {
        const $pagination = $('#pagination');
        $pagination.empty();

        if (totalPages <= 1) return;

        // Previous button
        $pagination.append(`
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">
                    <i class="bi bi-chevron-left"></i>
                </a>
            </li>
        `);

        // Page numbers
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            $pagination.append(`<li class="page-item"><a class="page-link" href="#" data-page="1">1</a></li>`);
            if (startPage > 2) {
                $pagination.append(`<li class="page-item disabled"><span class="page-link">...</span></li>`);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            $pagination.append(`
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `);
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                $pagination.append(`<li class="page-item disabled"><span class="page-link">...</span></li>`);
            }
            $pagination.append(`<li class="page-item"><a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a></li>`);
        }

        // Next button
        $pagination.append(`
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">
                    <i class="bi bi-chevron-right"></i>
                </a>
            </li>
        `);
    }

    function updateSelectAllState() {
        const visibleCheckboxes = $('.student-row:visible .row-checkbox');
        const checkedCheckboxes = visibleCheckboxes.filter(':checked');
        $('#selectAll').prop('checked', visibleCheckboxes.length > 0 && visibleCheckboxes.length === checkedCheckboxes.length);
    }

    function updateBulkActionsBar() {
        const checkedCount = $('.row-checkbox:checked').length;
        $('#selectedCount').text(checkedCount);
        
        if (checkedCount > 0) {
            $('#bulkActionsBar').addClass('show');
        } else {
            $('#bulkActionsBar').removeClass('show');
        }
    }

    function exportToExcel(rows, filename) {
        const data = [];
        
        // Headers
        data.push(['STT', 'Họ và tên', 'Ngày sinh', 'Tuổi', 'Giới tính', 'Email', 'Số điện thoại', 'Khu vực']);
        
        // Data rows
        rows.forEach((row, index) => {
            const $row = $(row);
            const name = $row.find('.student-name').text().trim();
            const dob = $row.data('dob');
            const dobFormatted = new Date(dob).toLocaleDateString('vi-VN');
            const age = $row.find('.dob-age').text().trim();
            const gender = $row.find('.badge-gender').text().trim();
            const email = $row.find('.email-info a').text().trim();
            const phone = $row.find('.phone-info a').text().trim();
            const region = $row.find('.badge-region span').text().trim();
            
            data.push([index + 1, name, dobFormatted, age, gender, email, phone, region]);
        });
        
        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        
        // Set column widths
        ws['!cols'] = [
            { wch: 5 },
            { wch: 25 },
            { wch: 12 },
            { wch: 8 },
            { wch: 10 },
            { wch: 30 },
            { wch: 15 },
            { wch: 15 }
        ];
        
        XLSX.utils.book_append_sheet(wb, ws, 'Danh sách sinh viên');
        
        // Export
        const fileName = `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        // Show success message
        showToast('success', 'Xuất dữ liệu thành công!');
    }

    function showToast(type, message) {
        const toast = $(`
            <div class="custom-toast toast-${type}" role="alert">
                <div class="toast-icon">
                    <i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'exclamation-circle-fill'}"></i>
                </div>
                <div class="toast-message">${message}</div>
                <button type="button" class="toast-close">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        `);
        
        $('body').append(toast);
        
        setTimeout(() => toast.addClass('show'), 10);
        
        setTimeout(() => {
            toast.removeClass('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
        
        toast.find('.toast-close').on('click', function() {
            toast.removeClass('show');
            setTimeout(() => toast.remove(), 300);
        });
    }

    function smoothScrollTop() {
        $('html, body').animate({ scrollTop: 0 }, 400, 'swing');
    }

    function animateStatsCards() {
        $('.stats-card').each(function(index) {
            $(this).css('animation-delay', `${index * 100}ms`);
        });
    }

    // Show keyboard shortcuts hint
    setTimeout(function() {
        if (!localStorage.getItem('shortcutsHintShown')) {
            showToast('success', 'Nhấn "?" để xem các phím tắt hữu ích');
            localStorage.setItem('shortcutsHintShown', 'true');
        }
    }, 2000);
});
