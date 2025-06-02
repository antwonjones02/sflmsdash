// Application State
let appData = {
    features: [],
    filteredFeatures: [],
    knownIssues: [],
    patchUpdates: [],
    futureReleases: [],
    currentSort: { column: null, direction: 'asc' }
};

// Sample data from the provided JSON

// Supabase Client Initialization
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://zmlnokldugvrijkmfobv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptbG5va2xkdWd2cmlqa21mb2J2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4ODk5ODcsImV4cCI6MjA2NDQ2NTk4N30.ogiBSe0Oy7y13GeXgt0crijNZdGHjGCPgVoqVuf-KVE";
const supabase = createClient(supabaseUrl, supabaseKey);

// Pagination Variables
let currentPage = 1;
const itemsPerPage = 25;

// Fetch data from Supabase with pagination
async function loadFeaturesFromSupabase(page = 1) {
    const from = (page - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    let { data: features, error } = await supabase
        .from("feature_releases")
        .select("*")
        .range(from, to);

    if (error) {
        console.error("Error loading data:", error);
        return;
    }

    appData.features = features;
    console.log(`Loaded features from Supabase (Page: ${page}):`, features);
    renderFeatureTable(); // Call your rendering function here
}

// Call the initial load
loadFeaturesFromSupabase(currentPage);


// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadSampleData();
});

// Initialize Application
function initializeApp() {
    loadFromStorage();
    setupEventListeners();
    renderFeatureTable();
    updateDashboardCounts();
}

// Load sample data on first visit
function loadSampleData() {
    if (appData.features.length === 0) {
        appData.features = sampleData.map(feature => ({
            ...feature,
            enablementStatus: 'Not Yet Evaluated'
        }));
        saveToStorage();
        populateFilterOptions();
        applyFilters();
    }
}

// Event Listeners
function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // CSV Import
    document.getElementById('import-btn').addEventListener('click', handleCSVImport);
    document.getElementById('csv-import').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            document.getElementById('import-btn').disabled = false;
        }
    });

    // Filters
    document.getElementById('version-filter').addEventListener('change', applyFilters);
    document.getElementById('lifecycle-filter').addEventListener('change', applyFilters);
    document.getElementById('enablement-filter').addEventListener('change', applyFilters);
    document.getElementById('module-filter').addEventListener('change', applyFilters);
    document.getElementById('search-filter').addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('clear-filters').addEventListener('click', clearFilters);

    // Export
    document.getElementById('export-btn').addEventListener('click', exportCSV);

    // Table sorting
    document.querySelectorAll('#features-table th[data-sort]').forEach(th => {
        th.addEventListener('click', () => sortTable(th.dataset.sort));
    });

    // Forms for other tabs
    document.getElementById('issue-form').addEventListener('submit', handleIssueSubmit);
    document.getElementById('patch-form').addEventListener('submit', handlePatchSubmit);
    document.getElementById('future-form').addEventListener('submit', handleFutureSubmit);
}

// Tab Switching
function switchTab(tabId) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('tab-btn--active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('tab-btn--active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('tab-content--active');
    });
    document.getElementById(tabId).classList.add('tab-content--active');

    // Render content based on tab
    switch(tabId) {
        case 'known-issues':
            renderKnownIssues();
            break;
        case 'patch-updates':
            renderPatchUpdates();
            break;
        case 'future-releases':
            renderFutureReleases();
            break;
    }
}

// CSV Import
function handleCSVImport() {
    const fileInput = document.getElementById('csv-import');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Please select a CSV file');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csvData = parseCSV(e.target.result);
            appData.features = csvData.map(feature => ({
                ...feature,
                enablementStatus: getStoredStatus(feature['Reference Number']) || 'Not Yet Evaluated'
            }));
            saveToStorage();
            populateFilterOptions();
            applyFilters();
            alert('CSV imported successfully!');
        } catch (error) {
            alert('Error parsing CSV: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// CSV Parser
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());

        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        data.push(row);
    }

    return data;
}

// Filter Options Population
function populateFilterOptions() {
    const versions = [...new Set(appData.features.map(f => f['Software Version']))].filter(Boolean);
    const modules = [...new Set(appData.features.flatMap(f => f.Module ? f.Module.split(',').map(m => m.trim()) : []))].filter(Boolean);

    const versionSelect = document.getElementById('version-filter');
    const moduleSelect = document.getElementById('module-filter');

    // Clear existing options (except "All")
    versionSelect.innerHTML = '<option value="">All Versions</option>';
    moduleSelect.innerHTML = '<option value="">All Modules</option>';

    versions.forEach(version => {
        const option = document.createElement('option');
        option.value = version;
        option.textContent = version;
        versionSelect.appendChild(option);
    });

    modules.forEach(module => {
        const option = document.createElement('option');
        option.value = module;
        option.textContent = module;
        moduleSelect.appendChild(option);
    });
}

// Apply Filters
function applyFilters() {
    const versionFilter = document.getElementById('version-filter').value;
    const lifecycleFilter = document.getElementById('lifecycle-filter').value;
    const enablementFilter = document.getElementById('enablement-filter').value;
    const moduleFilter = document.getElementById('module-filter').value;
    const searchFilter = document.getElementById('search-filter').value.toLowerCase();

    appData.filteredFeatures = appData.features.filter(feature => {
        if (versionFilter && feature['Software Version'] !== versionFilter) return false;
        if (lifecycleFilter && feature.Lifecycle !== lifecycleFilter) return false;
        if (enablementFilter && feature.Enablement !== enablementFilter) return false;
        if (moduleFilter && !feature.Module.toLowerCase().includes(moduleFilter.toLowerCase())) return false;
        if (searchFilter && !feature.Title.toLowerCase().includes(searchFilter) && !feature.Description.toLowerCase().includes(searchFilter)) return false;
        return true;
    });

    renderFeatureTable();
    updateDashboardCounts();
}

// Clear Filters
function clearFilters() {
    document.getElementById('version-filter').value = '';
    document.getElementById('lifecycle-filter').value = '';
    document.getElementById('enablement-filter').value = '';
    document.getElementById('module-filter').value = '';
    document.getElementById('search-filter').value = '';
    applyFilters();
}

// Update Dashboard Counts
function updateDashboardCounts() {
    const total = appData.filteredFeatures.length;
    const enabled = appData.filteredFeatures.filter(f => f.enablementStatus === 'Enabled in Our Environment').length;
    const evaluation = appData.filteredFeatures.filter(f => f.enablementStatus === 'Under Evaluation').length;
    const pending = appData.filteredFeatures.filter(f => f.enablementStatus === 'Not Yet Evaluated').length;
    const disabled = appData.filteredFeatures.filter(f => f.enablementStatus === 'Not Enabled (Decision Made)').length;
    const na = appData.filteredFeatures.filter(f => f.enablementStatus === 'Not Applicable to Us').length;

    document.getElementById('total-count').textContent = total;
    document.getElementById('enabled-count').textContent = enabled;
    document.getElementById('evaluation-count').textContent = evaluation;
    document.getElementById('pending-count').textContent = pending;
    document.getElementById('disabled-count').textContent = disabled;
    document.getElementById('na-count').textContent = na;
}

// Render Feature Table - Updated with new column order
function renderFeatureTable() {
    const tbody = document.querySelector('#features-table tbody');
    tbody.innerHTML = '';

    if (appData.filteredFeatures.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">No features match the current filters</td></tr>';
        return;
    }

    appData.filteredFeatures.forEach((feature, index) => {
        const row = document.createElement('tr');
        
        // Create reference cell with proper formatting
        const referenceNumber = feature['Reference Number'] || '';
        const seeMoreUrl = feature['See More'] || '';
        const referenceCell = seeMoreUrl ? 
            `<a href="${seeMoreUrl}" target="_blank" class="reference-number reference-clickable">${referenceNumber}</a>` :
            `<span class="reference-number">${referenceNumber}</span>`;
        
        // New column order: Feature Title, Reference, Description, Version, Module, Lifecycle, Enablement Type, Status
        row.innerHTML = `
            <td>${feature.Title}</td>
            <td>${referenceCell}</td>
            <td class="description-cell">
                <div class="description-truncated" id="desc-${index}">
                    ${feature.Description}
                </div>
                ${feature.Description.length > 100 ? `<div class="expand-btn" onclick="toggleDescription(${index})">Show more</div>` : ''}
            </td>
            <td>${feature['Software Version']}</td>
            <td>${feature.Module}</td>
            <td>${feature.Lifecycle}</td>
            <td>${feature.Enablement}</td>
            <td>
                <select class="status-select status-select--${getStatusClass(feature.enablementStatus)}" 
                        onchange="updateEnablementStatus('${feature['Reference Number']}', this.value)">
                    <option value="Not Yet Evaluated" ${feature.enablementStatus === 'Not Yet Evaluated' ? 'selected' : ''}>Not Yet Evaluated</option>
                    <option value="Enabled in Our Environment" ${feature.enablementStatus === 'Enabled in Our Environment' ? 'selected' : ''}>Enabled in Our Environment</option>
                    <option value="Under Evaluation" ${feature.enablementStatus === 'Under Evaluation' ? 'selected' : ''}>Under Evaluation</option>
                    <option value="Not Enabled (Decision Made)" ${feature.enablementStatus === 'Not Enabled (Decision Made)' ? 'selected' : ''}>Not Enabled (Decision Made)</option>
                    <option value="Not Applicable to Us" ${feature.enablementStatus === 'Not Applicable to Us' ? 'selected' : ''}>Not Applicable to Us</option>
                </select>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Toggle Description
function toggleDescription(index) {
    const descElement = document.getElementById(`desc-${index}`);
    const isExpanded = descElement.classList.contains('description-full');
    
    if (isExpanded) {
        descElement.classList.remove('description-full');
        descElement.classList.add('description-truncated');
        descElement.nextElementSibling.textContent = 'Show more';
    } else {
        descElement.classList.remove('description-truncated');
        descElement.classList.add('description-full');
        descElement.nextElementSibling.textContent = 'Show less';
    }
}

// Get Status Class
function getStatusClass(status) {
    switch(status) {
        case 'Enabled in Our Environment': return 'enabled';
        case 'Under Evaluation': return 'evaluation';
        case 'Not Yet Evaluated': return 'pending';
        case 'Not Enabled (Decision Made)': return 'disabled';
        case 'Not Applicable to Us': return 'na';
        default: return 'pending';
    }
}

// Update Enablement Status
function updateEnablementStatus(referenceNumber, status) {
    const feature = appData.features.find(f => f['Reference Number'] === referenceNumber);
    if (feature) {
        feature.enablementStatus = status;
        saveToStorage();
        updateDashboardCounts();
        
        // Update the select styling
        const selectElement = event.target;
        selectElement.className = `status-select status-select--${getStatusClass(status)}`;
    }
}

// Sort Table
function sortTable(column) {
    if (appData.currentSort.column === column) {
        appData.currentSort.direction = appData.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        appData.currentSort.column = column;
        appData.currentSort.direction = 'asc';
    }

    appData.filteredFeatures.sort((a, b) => {
        let aVal = a[column] || '';
        let bVal = b[column] || '';
        
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }

        if (appData.currentSort.direction === 'asc') {
            return aVal > bVal ? 1 : -1;
        } else {
            return aVal < bVal ? 1 : -1;
        }
    });

    renderFeatureTable();
}

// Export CSV - Updated with new column order
function exportCSV() {
    if (appData.filteredFeatures.length === 0) {
        alert('No data to export');
        return;
    }

    // Updated headers to reflect new column order
    const headers = ['Title', 'Reference Number', 'Description', 'Software Version', 'Module', 'Lifecycle', 'Enablement', 'Enablement Status'];
    let csvContent = headers.join(',') + '\n';

    appData.filteredFeatures.forEach(feature => {
        const row = [
            `"${feature.Title}"`,
            `"${feature['Reference Number']}"`,
            `"${feature.Description}"`,
            `"${feature['Software Version']}"`,
            `"${feature.Module}"`,
            `"${feature.Lifecycle}"`,
            `"${feature.Enablement}"`,
            `"${feature.enablementStatus}"`
        ];
        csvContent += row.join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'successfactors-features.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Known Issues Form
function handleIssueSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const issue = {
        id: Date.now(),
        title: form.elements['issue-title'].value,
        description: form.elements['issue-description'].value,
        affectedRelease: form.elements['affected-release'].value,
        status: form.elements['issue-status'].value,
        severity: form.elements['severity'].value,
        kbaLink: form.elements['kba-link'].value,
        createdAt: new Date().toISOString()
    };

    appData.knownIssues.push(issue);
    saveToStorage();
    form.reset();
    renderKnownIssues();
}

function renderKnownIssues() {
    const container = document.getElementById('issues-list');
    container.innerHTML = '';

    if (appData.knownIssues.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state__icon">📋</div><p>No known issues recorded</p></div>';
        return;
    }

    appData.knownIssues.forEach(issue => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item__header">
                <h4 class="list-item__title">${issue.title}</h4>
                <button class="delete-btn" onclick="deleteKnownIssue(${issue.id})">Delete</button>
            </div>
            <div class="list-item__meta">
                <span class="status status--${issue.severity.toLowerCase()}">${issue.severity}</span>
                <span class="status status--info">${issue.status}</span>
                ${issue.affectedRelease ? `<span>Affected: ${issue.affectedRelease}</span>` : ''}
            </div>
            <div class="list-item__description">${issue.description}</div>
            ${issue.kbaLink ? `<div class="list-item__link"><a href="${issue.kbaLink}" target="_blank" class="reference-link">KBA Link</a></div>` : ''}
        `;
        container.appendChild(item);
    });
}

function deleteKnownIssue(id) {
    appData.knownIssues = appData.knownIssues.filter(issue => issue.id !== id);
    saveToStorage();
    renderKnownIssues();
}

// Patch Updates Form
function handlePatchSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const patch = {
        id: Date.now(),
        patchId: form.elements['patch-id'].value,
        releaseDate: form.elements['release-date'].value,
        description: form.elements['patch-description'].value,
        docLink: form.elements['doc-link'].value,
        createdAt: new Date().toISOString()
    };

    appData.patchUpdates.push(patch);
    saveToStorage();
    form.reset();
    renderPatchUpdates();
}

function renderPatchUpdates() {
    const container = document.getElementById('patches-list');
    container.innerHTML = '';

    if (appData.patchUpdates.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state__icon">🔧</div><p>No patch updates recorded</p></div>';
        return;
    }

    appData.patchUpdates.forEach(patch => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item__header">
                <h4 class="list-item__title">${patch.patchId}</h4>
                <button class="delete-btn" onclick="deletePatch(${patch.id})">Delete</button>
            </div>
            <div class="list-item__meta">Released: ${new Date(patch.releaseDate).toLocaleDateString()}</div>
            <div class="list-item__description">${patch.description}</div>
            ${patch.docLink ? `<div class="list-item__link"><a href="${patch.docLink}" target="_blank" class="reference-link">Documentation</a></div>` : ''}
        `;
        container.appendChild(item);
    });
}

function deletePatch(id) {
    appData.patchUpdates = appData.patchUpdates.filter(patch => patch.id !== id);
    saveToStorage();
    renderPatchUpdates();
}

// Future Releases Form
function handleFutureSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const future = {
        id: Date.now(),
        targetRelease: form.elements['target-release'].value,
        featureName: form.elements['feature-name'].value,
        description: form.elements['future-description'].value,
        sourceLink: form.elements['source-link'].value,
        createdAt: new Date().toISOString()
    };

    appData.futureReleases.push(future);
    saveToStorage();
    form.reset();
    renderFutureReleases();
}

function renderFutureReleases() {
    const container = document.getElementById('future-list');
    container.innerHTML = '';

    if (appData.futureReleases.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state__icon">🚀</div><p>No future releases recorded</p></div>';
        return;
    }

    appData.futureReleases.forEach(future => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item__header">
                <h4 class="list-item__title">${future.featureName}</h4>
                <button class="delete-btn" onclick="deleteFuture(${future.id})">Delete</button>
            </div>
            <div class="list-item__meta">Target: ${future.targetRelease}</div>
            <div class="list-item__description">${future.description}</div>
            ${future.sourceLink ? `<div class="list-item__link"><a href="${future.sourceLink}" target="_blank" class="reference-link">Source</a></div>` : ''}
        `;
        container.appendChild(item);
    });
}

function deleteFuture(id) {
    appData.futureReleases = appData.futureReleases.filter(future => future.id !== id);
    saveToStorage();
    renderFutureReleases();
}

// Storage Functions
function saveToStorage() {
    try {
        localStorage.setItem('successfactors-dashboard', JSON.stringify(appData));
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

function loadFromStorage() {
    try {
        const stored = localStorage.getItem('successfactors-dashboard');
        if (stored) {
            appData = { ...appData, ...JSON.parse(stored) };
            appData.filteredFeatures = appData.features;
            populateFilterOptions();
        }
    } catch (error) {
        console.error('Error loading from localStorage:', error);
    }
}

function getStoredStatus(referenceNumber) {
    const feature = appData.features.find(f => f['Reference Number'] === referenceNumber);
    return feature ? feature.enablementStatus : null;
}

// Utility Functions
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
