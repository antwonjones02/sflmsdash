// Global variables
let csvData = [];
let filteredData = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentSort = { column: null, direction: 'asc' };

// Custom color palette for charts using the specified colors
const chartColors = [
    '#003366', // Primary dark blue
    '#E01933', // Accent red
    '#991933', // Dark red
    '#FFFFFF', // White
    '#4a6fa5', // Lighter blue
    '#ff4d6b', // Lighter red
    '#cc3d5c', // Medium red
    '#667fa8', // Medium blue
    '#b32d4a', // Darker red
    '#1a4a7a'  // Darker blue
];

// Sample data from application_data_json
const sampleData = {
    totalFeatures: 101,
    lifecycleDistribution: {
        "General Availability": 89,
        "Deleted": 6,
        "Deprecated": 5,
        "Restricted Availability": 1
    },
    actionDistribution: {
        "Info only": 78,
        "Recommended": 18,
        "Required": 3,
        "Not applicable": 2
    },
    enablementDistribution: {
        "Automatically on": 72,
        "Customer configured": 22,
        "Contact Customer Engagement Executive or Account Manager": 5,
        "Contact Product Support": 2
    },
    versionDistribution: {
        "2H 2024": 31,
        "1H 2025": 28,
        "1H 2024": 26,
        "Other": 16
    },
    sampleFeatures: [
        {
            title: "Joule Available in SAP SuccessFactors Mobile",
            description: "You can now use Joule, SAP's AI copilot, in SAP SuccessFactors Mobile apps.",
            product: "Career and Talent Development,Compensation,Employee Central,Employee Central Payroll,Learning,Onboarding,Opportunity Marketplace,Performance & Goals,Platform,Recruiting,Succession & Development,Time Tracking",
            module: "Mobile Applications,SAP Business AI",
            feature: "Joule",
            lifecycle: "General Availability",
            action: "Info only",
            enablement: "Contact Product Support",
            referenceNumber: "MOB-88140",
            demo: "Joule Available in SAP SuccessFactors Mobile",
            softwareVersion: "1H 2025",
            validAsOf: "2025-05-16",
            seeMore: "https://help.sap.com/docs/PRODUCTS/e9989dc2e5b046ec929e2ad5e8305d24/de22c78b4cfd41a2ab16236b7c41365d.html?locale=en-US&version=cloud"
        },
        {
            title: "Minor Visual Changes in 1H 2025",
            description: "SAP SuccessFactors made numerous minor visual enhancements in 1H 2025.",
            product: "Career and Talent Development,Compensation,Employee Central,Learning,Onboarding,Opportunity Marketplace,People Analytics,Performance & Goals,Platform,Recruiting,Succession & Development,Time Tracking",
            module: "Analytics,Applicant Management,Candidate Experience,Company Organization,Content Access,Content Management,Continuous Performance Management,Documents and Storage,Employee Data,Identity and Access Management,Integration and Extension,Localization,Onboarding,Opportunity Marketplace,Security and Compliance,Succession Planning,System Management,Time Management,User Experience",
            feature: "Applicable to All",
            lifecycle: "General Availability",
            action: "Info only",
            enablement: "Automatically on",
            referenceNumber: "KM-19826",
            demo: "",
            softwareVersion: "1H 2025",
            validAsOf: "2025-05-16",
            seeMore: "https://help.sap.com/docs/PRODUCTS/8e0d540f96474717bbf18df51e54e522/644bd213913e40ac867dc120ec6c5f2e.html?locale=en-US&version=cloud"
        },
        {
            title: "AI-Assisted Image Generation in Learning",
            description: "You can now use AI-assisted capabilities to generate images for content in Learning Administration.",
            product: "Learning",
            module: "Learning,SAP Business AI",
            feature: "Generative AI,Home Page",
            lifecycle: "General Availability",
            action: "Info only",
            enablement: "Contact Customer Engagement Executive or Account Manager",
            referenceNumber: "LRN-159091",
            demo: "AI-Assisted Image Generation",
            softwareVersion: "1H 2025",
            validAsOf: "2025-05-16",
            seeMore: "https://help.sap.com/docs/PRODUCTS/8e0d540f96474717bbf18df51e54e522/e9878193546043bf8a3414853b1864a8.html?locale=en-US&version=cloud"
        }
    ]
};

// DOM elements
const uploadSection = document.getElementById('uploadSection');
const loadingSection = document.getElementById('loadingSection');
const dashboardContent = document.getElementById('dashboardContent');
const uploadArea = document.getElementById('uploadArea');
const uploadBtn = document.getElementById('uploadBtn');
const uploadAreaBtn = document.getElementById('uploadAreaBtn');
const csvFileInput = document.getElementById('csvFileInput');
const searchInput = document.getElementById('searchInput');
const lifecycleFilter = document.getElementById('lifecycleFilter');
const actionFilter = document.getElementById('actionFilter');
const enablementFilter = document.getElementById('enablementFilter');
const clearFiltersBtn = document.getElementById('clearFilters');
const exportBtn = document.getElementById('exportBtn');
const featuresTableBody = document.getElementById('featuresTableBody');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageNumbers = document.getElementById('pageNumbers');
const paginationInfo = document.getElementById('paginationInfo');

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    showUploadSection();
});

function initializeEventListeners() {
    // Upload button clicks
    uploadBtn.addEventListener('click', () => csvFileInput.click());
    uploadAreaBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        csvFileInput.click();
    });
    uploadArea.addEventListener('click', () => csvFileInput.click());

    // File input change
    csvFileInput.addEventListener('change', handleFileUpload);

    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // Search and filters
    searchInput.addEventListener('input', debounce(applyFilters, 300));
    lifecycleFilter.addEventListener('change', applyFilters);
    actionFilter.addEventListener('change', applyFilters);
    enablementFilter.addEventListener('change', applyFilters);
    clearFiltersBtn.addEventListener('click', clearFilters);

    // Export
    exportBtn.addEventListener('click', exportToCSV);

    // Pagination
    prevPageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            changePage(currentPage - 1);
        }
    });
    
    nextPageBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const totalPages = Math.ceil(filteredData.length / itemsPerPage);
        if (currentPage < totalPages) {
            changePage(currentPage + 1);
        }
    });

    // Table sorting
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', (e) => {
            e.preventDefault();
            handleSort(th.dataset.sort);
        });
    });

    // Toast close
    document.getElementById('toastClose').addEventListener('click', hideToast);

    // Load sample data button for demo purposes
    const loadSampleBtn = document.createElement('button');
    loadSampleBtn.className = 'btn btn--secondary';
    loadSampleBtn.textContent = 'Load Sample Data for Demo';
    loadSampleBtn.style.marginTop = '16px';
    loadSampleBtn.addEventListener('click', loadSampleData);
    uploadArea.appendChild(loadSampleBtn);
}

function showUploadSection() {
    uploadSection.classList.remove('hidden');
    loadingSection.classList.add('hidden');
    dashboardContent.classList.add('hidden');
}

function loadSampleData() {
    showLoading();
    
    setTimeout(() => {
        csvData = generateSampleDataset();
        filteredData = [...csvData];
        showDashboard();
        showToast(`Sample data loaded: ${csvData.length} features`, 'success');
    }, 1000);
}

function generateSampleDataset() {
    const features = [];
    const lifecycles = Object.keys(sampleData.lifecycleDistribution);
    const actions = Object.keys(sampleData.actionDistribution);
    const enablements = Object.keys(sampleData.enablementDistribution);
    const versions = Object.keys(sampleData.versionDistribution);

    // Add the provided sample features first
    features.push(...sampleData.sampleFeatures);

    // Generate additional features to match the total count
    const additionalCount = sampleData.totalFeatures - sampleData.sampleFeatures.length;
    
    const featureTitles = [
        "Enhanced Mobile Experience",
        "Advanced Analytics Dashboard",
        "Improved User Interface",
        "Cloud Migration Tools",
        "Security Enhancements",
        "API Integration Updates",
        "Performance Optimizations",
        "Workflow Automation",
        "Data Export Capabilities",
        "Custom Reporting Features",
        "Learning Path Recommendations",
        "Skill Assessment Tools",
        "Certification Management",
        "Content Library Updates",
        "Social Learning Features"
    ];
    
    for (let i = 0; i < additionalCount; i++) {
        const titleBase = featureTitles[i % featureTitles.length];
        features.push({
            title: `${titleBase} ${Math.floor(i / featureTitles.length) + 1}`,
            description: `Detailed description for ${titleBase.toLowerCase()} feature ${i + 4}`,
            lifecycle: getRandomByDistribution(lifecycles, sampleData.lifecycleDistribution),
            action: getRandomByDistribution(actions, sampleData.actionDistribution),
            enablement: getRandomByDistribution(enablements, sampleData.enablementDistribution),
            softwareVersion: getRandomByDistribution(versions, sampleData.versionDistribution),
            referenceNumber: `REF-${String(i + 88141).padStart(5, '0')}`
        });
    }

    return features;
}

function getRandomByDistribution(items, distribution) {
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    let random = Math.random() * total;
    
    for (const item of items) {
        random -= distribution[item];
        if (random <= 0) return item;
    }
    
    return items[0];
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function processFile(file) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showToast('Please select a CSV file.', 'error');
        return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        showToast('File size too large. Please select a file smaller than 10MB.', 'error');
        return;
    }

    showLoading();

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csvText = e.target.result;
            const parsedData = parseCSV(csvText);
            
            if (parsedData.length === 0) {
                throw new Error('No data found in CSV file');
            }

            csvData = parsedData;
            filteredData = [...csvData];
            
            setTimeout(() => {
                showDashboard();
                showToast(`Successfully loaded ${csvData.length} features`, 'success');
            }, 1000);
            
        } catch (error) {
            hideLoading();
            showToast(`Error processing file: ${error.message}`, 'error');
        }
    };

    reader.onerror = function() {
        hideLoading();
        showToast('Error reading file', 'error');
    };

    reader.readAsText(file);
}

function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
        throw new Error('CSV file must have a header row and at least one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length >= headers.length) {
            const row = {};
            headers.forEach((header, index) => {
                const value = values[index] ? values[index].trim().replace(/"/g, '') : '';
                
                // Map CSV headers to our expected format
                switch (header) {
                    case 'title':
                        row.title = value;
                        break;
                    case 'description':
                        row.description = value;
                        break;
                    case 'product':
                        row.product = value;
                        break;
                    case 'module':
                        row.module = value;
                        break;
                    case 'feature':
                        row.feature = value;
                        break;
                    case 'lifecycle':
                        row.lifecycle = value;
                        break;
                    case 'action':
                        row.action = value;
                        break;
                    case 'enablement':
                        row.enablement = value;
                        break;
                    case 'software version':
                    case 'softwareversion':
                        row.softwareVersion = value;
                        break;
                    case 'reference number':
                    case 'referencenumber':
                        row.referenceNumber = value;
                        break;
                    case 'demo':
                        row.demo = value;
                        break;
                    case 'valid as of':
                    case 'validasof':
                        row.validAsOf = value;
                        break;
                    case 'see more':
                    case 'seemore':
                        row.seeMore = value;
                        break;
                    default:
                        row[header] = value;
                }
            });
            
            // Ensure required fields exist
            if (row.title) {
                data.push(row);
            }
        }
    }

    return data;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

function showLoading() {
    uploadSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');
    dashboardContent.classList.add('hidden');
}

function hideLoading() {
    loadingSection.classList.add('hidden');
}

function showDashboard() {
    hideLoading();
    uploadSection.classList.add('hidden');
    dashboardContent.classList.remove('hidden');
    
    updateMetrics();
    updateCharts();
    populateFilters();
    renderTable();
}

function updateMetrics() {
    const stats = calculateStatistics(csvData);
    
    document.getElementById('totalFeatures').textContent = stats.total;
    document.getElementById('generalAvailability').textContent = stats.generalAvailability;
    document.getElementById('recommended').textContent = stats.recommended;
    document.getElementById('autoEnabled').textContent = stats.autoEnabled;
}

function calculateStatistics(data) {
    return {
        total: data.length,
        generalAvailability: data.filter(f => f.lifecycle === 'General Availability').length,
        recommended: data.filter(f => f.action === 'Recommended').length,
        autoEnabled: data.filter(f => f.enablement === 'Automatically on').length
    };
}

function updateCharts() {
    createLifecycleChart();
    createVersionChart();
    createActionChart();
    createEnablementChart();
}

function createLifecycleChart() {
    const ctx = document.getElementById('lifecycleChart').getContext('2d');
    const distribution = getDistribution(csvData, 'lifecycle');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(distribution),
            datasets: [{
                data: Object.values(distribution),
                backgroundColor: chartColors.slice(0, Object.keys(distribution).length),
                borderWidth: 2,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

function createVersionChart() {
    const ctx = document.getElementById('versionChart').getContext('2d');
    const distribution = getDistribution(csvData, 'softwareVersion');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(distribution),
            datasets: [{
                label: 'Features',
                data: Object.values(distribution),
                backgroundColor: chartColors[0],
                borderColor: chartColors[0],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45
                    }
                }
            }
        }
    });
}

function createActionChart() {
    const ctx = document.getElementById('actionChart').getContext('2d');
    const distribution = getDistribution(csvData, 'action');
    
    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(distribution),
            datasets: [{
                data: Object.values(distribution),
                backgroundColor: chartColors.slice(0, Object.keys(distribution).length),
                borderWidth: 2,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

function createEnablementChart() {
    const ctx = document.getElementById('enablementChart').getContext('2d');
    const distribution = getDistribution(csvData, 'enablement');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(distribution),
            datasets: [{
                label: 'Features',
                data: Object.values(distribution),
                backgroundColor: chartColors[1],
                borderColor: chartColors[1],
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function getDistribution(data, field) {
    return data.reduce((acc, item) => {
        const value = item[field] || 'Unknown';
        acc[value] = (acc[value] || 0) + 1;
        return acc;
    }, {});
}

function populateFilters() {
    populateFilter(lifecycleFilter, csvData, 'lifecycle');
    populateFilter(actionFilter, csvData, 'action');
    populateFilter(enablementFilter, csvData, 'enablement');
}

function populateFilter(selectElement, data, field) {
    const values = [...new Set(data.map(item => item[field] || 'Unknown'))].sort();
    
    // Clear existing options except "All"
    selectElement.innerHTML = '<option value="">All</option>';
    
    values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        selectElement.appendChild(option);
    });
}

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const lifecycleValue = lifecycleFilter.value;
    const actionValue = actionFilter.value;
    const enablementValue = enablementFilter.value;

    filteredData = csvData.filter(item => {
        const matchesSearch = !searchTerm || 
            (item.title && item.title.toLowerCase().includes(searchTerm)) ||
            (item.description && item.description.toLowerCase().includes(searchTerm)) ||
            (item.referenceNumber && item.referenceNumber.toLowerCase().includes(searchTerm)) ||
            (item.product && item.product.toLowerCase().includes(searchTerm)) ||
            (item.feature && item.feature.toLowerCase().includes(searchTerm));

        const matchesLifecycle = !lifecycleValue || item.lifecycle === lifecycleValue;
        const matchesAction = !actionValue || item.action === actionValue;
        const matchesEnablement = !enablementValue || item.enablement === enablementValue;

        return matchesSearch && matchesLifecycle && matchesAction && matchesEnablement;
    });

    currentPage = 1;
    renderTable();
}

function clearFilters() {
    searchInput.value = '';
    lifecycleFilter.value = '';
    actionFilter.value = '';
    enablementFilter.value = '';
    applyFilters();
}

function handleSort(column) {
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }

    filteredData.sort((a, b) => {
        let aVal = a[column] || '';
        let bVal = b[column] || '';
        
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        let result = 0;
        if (aVal < bVal) result = -1;
        else if (aVal > bVal) result = 1;

        return currentSort.direction === 'desc' ? -result : result;
    });

    updateSortHeaders();
    renderTable();
}

function updateSortHeaders() {
    document.querySelectorAll('th[data-sort]').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
        if (th.dataset.sort === currentSort.column) {
            th.classList.add(`sort-${currentSort.direction}`);
        }
    });
}

function renderTable() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);

    featuresTableBody.innerHTML = '';

    if (pageData.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="6" style="text-align: center; padding: 2rem; color: var(--color-text-secondary);">No features found matching your criteria.</td>';
        featuresTableBody.appendChild(row);
    } else {
        pageData.forEach(feature => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="title-cell">${escapeHtml(feature.title || '')}</td>
                <td class="status-cell">${getStatusBadge(feature.lifecycle || '', 'lifecycle')}</td>
                <td class="status-cell">${getStatusBadge(feature.action || '', 'action')}</td>
                <td>${escapeHtml(feature.enablement || '')}</td>
                <td>${escapeHtml(feature.softwareVersion || '')}</td>
                <td>${escapeHtml(feature.referenceNumber || '')}</td>
            `;
            featuresTableBody.appendChild(row);
        });
    }

    updatePagination();
}

function getStatusBadge(value, type) {
    if (!value) return '';
    
    let className = 'status-badge';
    
    if (type === 'lifecycle') {
        if (value === 'General Availability') className += ' status-badge--ga';
        else if (value === 'Deprecated') className += ' status-badge--deprecated';
        else if (value === 'Deleted') className += ' status-badge--deleted';
        else if (value === 'Restricted Availability') className += ' status-badge--restricted';
    } else if (type === 'action') {
        if (value === 'Required') className += ' status-badge--required';
        else if (value === 'Recommended') className += ' status-badge--recommended';
        else className += ' status-badge--info';
    }
    
    return `<span class="${className}">${escapeHtml(value)}</span>`;
}

function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startItem = filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
    const endItem = Math.min(currentPage * itemsPerPage, filteredData.length);

    paginationInfo.textContent = `Showing ${startItem}-${endItem} of ${filteredData.length} features`;

    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

    // Generate page numbers
    pageNumbers.innerHTML = '';
    
    if (totalPages > 0) {
        const maxPages = 5;
        const startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
        const endPage = Math.min(totalPages, startPage + maxPages - 1);

        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', (e) => {
                e.preventDefault();
                changePage(i);
            });
            pageNumbers.appendChild(pageBtn);
        }
    }
}

function changePage(page) {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        renderTable();
        
        // Scroll to top of table
        document.querySelector('.table-section').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

function exportToCSV() {
    if (filteredData.length === 0) {
        showToast('No data to export', 'warning');
        return;
    }

    const headers = ['Title', 'Description', 'Product', 'Module', 'Feature', 'Lifecycle', 'Action', 'Enablement', 'Software Version', 'Reference Number', 'Demo', 'Valid As Of', 'See More'];
    const csvContent = [
        headers.join(','),
        ...filteredData.map(feature => [
            `"${(feature.title || '').replace(/"/g, '""')}"`,
            `"${(feature.description || '').replace(/"/g, '""')}"`,
            `"${(feature.product || '').replace(/"/g, '""')}"`,
            `"${(feature.module || '').replace(/"/g, '""')}"`,
            `"${(feature.feature || '').replace(/"/g, '""')}"`,
            `"${(feature.lifecycle || '').replace(/"/g, '""')}"`,
            `"${(feature.action || '').replace(/"/g, '""')}"`,
            `"${(feature.enablement || '').replace(/"/g, '""')}"`,
            `"${(feature.softwareVersion || '').replace(/"/g, '""')}"`,
            `"${(feature.referenceNumber || '').replace(/"/g, '""')}"`,
            `"${(feature.demo || '').replace(/"/g, '""')}"`,
            `"${(feature.validAsOf || '').replace(/"/g, '""')}"`,
            `"${(feature.seeMore || '').replace(/"/g, '""')}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `successfactors-features-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast(`Exported ${filteredData.length} features to CSV`, 'success');
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        hideToast();
    }, 4000);
}

function hideToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('show');
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}