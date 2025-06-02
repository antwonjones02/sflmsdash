// Dashboard Data
const dashboardData = {
  features: [
    {
      feature_id: "LMS-2025-001",
      name: "AI-Powered Learning Recommendations", 
      release: "1H 2025",
      module: "Learning Management",
      status: "Preview",
      enablement: "Opt-in",
      action_required: "Recommended",
      description: "Enhanced AI capabilities for personalized learning paths",
      enabled_in_environment: false,
      impact_level: "Medium",
      documentation_link: "https://help.sap.com/lms-ai-recommendations"
    },
    {
      feature_id: "LMS-2025-002",
      name: "Enhanced Mobile Learning Experience",
      release: "1H 2025", 
      module: "Learning Management",
      status: "Production Ready",
      enablement: "Universal",
      action_required: "Required",
      description: "Improved mobile interface with offline capabilities",
      enabled_in_environment: true,
      impact_level: "High",
      documentation_link: "https://help.sap.com/mobile-learning"
    },
    {
      feature_id: "LMS-2024-045",
      name: "Advanced Reporting Dashboard",
      release: "2H 2024",
      module: "Analytics & Reporting",
      status: "Production", 
      enablement: "Opt-in",
      action_required: "Info Only",
      description: "New analytics dashboard with customizable widgets",
      enabled_in_environment: true,
      impact_level: "Medium",
      documentation_link: "https://help.sap.com/analytics-dashboard"
    },
    {
      feature_id: "LMS-2025-003",
      name: "Compliance Training Automation",
      release: "1H 2025",
      module: "Compliance Management",
      status: "Preview",
      enablement: "Opt-in", 
      action_required: "Recommended",
      description: "Automated compliance training assignments based on role changes",
      enabled_in_environment: false,
      impact_level: "High",
      documentation_link: "https://help.sap.com/compliance-automation"
    },
    {
      feature_id: "LMS-2025-004",
      name: "Social Learning Communities",
      release: "1H 2025",
      module: "Learning Management",
      status: "Beta",
      enablement: "Opt-in",
      action_required: "Info Only",
      description: "Collaborative learning spaces with discussion forums",
      enabled_in_environment: false,
      impact_level: "Low",
      documentation_link: "https://help.sap.com/social-learning"
    }
  ],
  issues: [
    {
      issue_id: "KI-2025-001",
      title: "Learning Assignment Synchronization Delay",
      severity: "Medium", 
      status: "Investigating",
      affected_modules: ["Learning Management"],
      workaround: "Manual sync available through admin tools",
      estimated_fix: "1H 2025 Patch 2",
      description: "Delays in assignment synchronization between EC and LMS"
    },
    {
      issue_id: "KI-2025-002", 
      title: "Mobile App Performance Issues",
      severity: "High",
      status: "Fix Available",
      affected_modules: ["Mobile Learning"],
      workaround: "Use web browser on mobile devices",
      estimated_fix: "Resolved in 1H 2025",
      description: "Performance degradation on iOS devices"
    },
    {
      issue_id: "KI-2025-003",
      title: "Report Generation Timeout",
      severity: "Low",
      status: "Resolved", 
      affected_modules: ["Analytics & Reporting"],
      workaround: "Use smaller date ranges for reports",
      estimated_fix: "Fixed in SF-2025-P04",
      description: "Large reports timing out during generation"
    }
  ],
  patches: [
    {
      patch_id: "SF-2025-P04",
      release_date: "2025-06-02",
      fixes_included: 15,
      modules_affected: ["Learning Management", "Employee Central", "Performance Management"],
      critical_fixes: 3,
      enhancement_fixes: 12,
      status: "Released"
    },
    {
      patch_id: "SF-2025-P03",
      release_date: "2025-05-19",
      fixes_included: 22, 
      modules_affected: ["Learning Management", "Recruiting", "Analytics"],
      critical_fixes: 5,
      enhancement_fixes: 17,
      status: "Released"
    },
    {
      patch_id: "SF-2025-P02",
      release_date: "2025-05-05",
      fixes_included: 18,
      modules_affected: ["Learning Management", "Compensation", "Succession"],
      critical_fixes: 2,
      enhancement_fixes: 16,
      status: "Released"
    }
  ]
};

// Global state
let filteredFeatures = [...dashboardData.features];
let filteredIssues = [...dashboardData.issues];

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeMetrics();
    initializeFeatures();
    initializeIssues();
    initializePatches();
    initializeReports();
    initializeEventListeners();
    updateLastUpdated();
});

// Tab Management
function initializeTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.dataset.tab;
            
            // Remove active class from all tabs and contents
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// Metrics Management
function initializeMetrics() {
    const totalFeatures = dashboardData.features.length;
    const enabledFeatures = dashboardData.features.filter(f => f.enabled_in_environment).length;
    const highImpactFeatures = dashboardData.features.filter(f => f.impact_level === 'High').length;
    const actionsRequired = dashboardData.features.filter(f => f.action_required === 'Required' || f.action_required === 'Recommended').length;

    document.getElementById('totalFeatures').textContent = totalFeatures;
    document.getElementById('enabledFeatures').textContent = enabledFeatures;
    document.getElementById('highImpactFeatures').textContent = highImpactFeatures;
    document.getElementById('actionsRequired').textContent = actionsRequired;
}

// Features Management
function initializeFeatures() {
    renderFeaturesTable();
    setupFeatureFilters();
}

function renderFeaturesTable() {
    const tbody = document.getElementById('featuresTableBody');
    tbody.innerHTML = '';

    if (filteredFeatures.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="9" class="empty-state"><h3>No features found</h3><p>Try adjusting your search or filter criteria.</p></td>';
        tbody.appendChild(row);
        return;
    }

    filteredFeatures.forEach(feature => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${feature.feature_id}</td>
            <td>${feature.name}</td>
            <td>${feature.release}</td>
            <td>${feature.module}</td>
            <td><span class="feature-status feature-status--${feature.status.toLowerCase().replace(/\s+/g, '-')}">${feature.status}</span></td>
            <td>
                <div class="env-toggle">
                    <div class="toggle-switch ${feature.enabled_in_environment ? 'enabled' : ''}" 
                         onclick="toggleFeature('${feature.feature_id}')"></div>
                    <span class="toggle-label">${feature.enabled_in_environment ? 'Enabled' : 'Disabled'}</span>
                </div>
            </td>
            <td><span class="impact-level impact-level--${feature.impact_level.toLowerCase()}">${feature.impact_level}</span></td>
            <td>${feature.action_required}</td>
            <td><button class="detail-btn" onclick="showFeatureDetails('${feature.feature_id}')">View</button></td>
        `;
        tbody.appendChild(row);
    });
}

function setupFeatureFilters() {
    const searchInput = document.getElementById('featureSearch');
    const releaseFilter = document.getElementById('releaseFilter');
    const statusFilter = document.getElementById('statusFilter');
    const moduleFilter = document.getElementById('moduleFilter');

    searchInput.addEventListener('input', filterFeatures);
    releaseFilter.addEventListener('change', filterFeatures);
    statusFilter.addEventListener('change', filterFeatures);
    moduleFilter.addEventListener('change', filterFeatures);
}

function filterFeatures() {
    const searchTerm = document.getElementById('featureSearch').value.toLowerCase();
    const releaseFilter = document.getElementById('releaseFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const moduleFilter = document.getElementById('moduleFilter').value;

    filteredFeatures = dashboardData.features.filter(feature => {
        const matchesSearch = feature.name.toLowerCase().includes(searchTerm) || 
                             feature.feature_id.toLowerCase().includes(searchTerm) ||
                             feature.description.toLowerCase().includes(searchTerm);
        const matchesRelease = !releaseFilter || feature.release === releaseFilter;
        const matchesStatus = !statusFilter || feature.status === statusFilter;
        const matchesModule = !moduleFilter || feature.module === moduleFilter;

        return matchesSearch && matchesRelease && matchesStatus && matchesModule;
    });

    renderFeaturesTable();
}

function toggleFeature(featureId) {
    const feature = dashboardData.features.find(f => f.feature_id === featureId);
    if (feature) {
        feature.enabled_in_environment = !feature.enabled_in_environment;
        renderFeaturesTable();
        initializeMetrics();
        showToast('success', `Feature ${feature.enabled_in_environment ? 'enabled' : 'disabled'}: ${feature.name}`);
    }
}

function showFeatureDetails(featureId) {
    const feature = dashboardData.features.find(f => f.feature_id === featureId);
    if (feature) {
        const modal = document.getElementById('featureModal');
        const modalName = document.getElementById('modalFeatureName');
        const modalContent = document.getElementById('modalFeatureContent');

        modalName.textContent = feature.name;
        modalContent.innerHTML = `
            <div class="modal-feature-details">
                <div class="form-group">
                    <strong>Feature ID:</strong> ${feature.feature_id}
                </div>
                <div class="form-group">
                    <strong>Release:</strong> ${feature.release}
                </div>
                <div class="form-group">
                    <strong>Module:</strong> ${feature.module}
                </div>
                <div class="form-group">
                    <strong>Status:</strong> <span class="feature-status feature-status--${feature.status.toLowerCase().replace(/\s+/g, '-')}">${feature.status}</span>
                </div>
                <div class="form-group">
                    <strong>Impact Level:</strong> <span class="impact-level impact-level--${feature.impact_level.toLowerCase()}">${feature.impact_level}</span>
                </div>
                <div class="form-group">
                    <strong>Enablement:</strong> ${feature.enablement}
                </div>
                <div class="form-group">
                    <strong>Action Required:</strong> ${feature.action_required}
                </div>
                <div class="form-group">
                    <strong>Environment Status:</strong> ${feature.enabled_in_environment ? 'Enabled' : 'Disabled'}
                </div>
                <div class="form-group">
                    <strong>Description:</strong>
                    <p>${feature.description}</p>
                </div>
                <div class="form-group">
                    <a href="${feature.documentation_link}" target="_blank" class="btn btn--primary">View Documentation</a>
                </div>
            </div>
        `;

        modal.classList.add('show');
    }
}

// Issues Management
function initializeIssues() {
    renderIssues();
    setupIssueFilters();
}

function renderIssues() {
    const issuesGrid = document.getElementById('issuesGrid');
    issuesGrid.innerHTML = '';

    if (filteredIssues.length === 0) {
        issuesGrid.innerHTML = '<div class="empty-state"><h3>No issues found</h3><p>Try adjusting your search or filter criteria.</p></div>';
        return;
    }

    filteredIssues.forEach(issue => {
        const issueCard = document.createElement('div');
        issueCard.className = 'issue-card';
        issueCard.innerHTML = `
            <div class="issue-card-header">
                <h4 class="issue-title">${issue.title}</h4>
                <span class="severity-${issue.severity.toLowerCase()}">${issue.severity}</span>
            </div>
            <div class="issue-card-body">
                <p class="issue-description">${issue.description}</p>
                <div class="issue-details">
                    <div class="issue-detail">
                        <span class="issue-detail-label">Issue ID:</span>
                        <span class="issue-detail-value">${issue.issue_id}</span>
                    </div>
                    <div class="issue-detail">
                        <span class="issue-detail-label">Status:</span>
                        <span class="issue-detail-value"><span class="status status--${getStatusClass(issue.status)}">${issue.status}</span></span>
                    </div>
                    <div class="issue-detail">
                        <span class="issue-detail-label">Modules:</span>
                        <span class="issue-detail-value">${issue.affected_modules.join(', ')}</span>
                    </div>
                    <div class="issue-detail">
                        <span class="issue-detail-label">Workaround:</span>
                        <span class="issue-detail-value">${issue.workaround}</span>
                    </div>
                    <div class="issue-detail">
                        <span class="issue-detail-label">Est. Fix:</span>
                        <span class="issue-detail-value">${issue.estimated_fix}</span>
                    </div>
                </div>
            </div>
        `;
        issuesGrid.appendChild(issueCard);
    });
}

function setupIssueFilters() {
    const searchInput = document.getElementById('issueSearch');
    const severityFilter = document.getElementById('severityFilter');
    const statusFilter = document.getElementById('issueStatusFilter');

    searchInput.addEventListener('input', filterIssues);
    severityFilter.addEventListener('change', filterIssues);
    statusFilter.addEventListener('change', filterIssues);
}

function filterIssues() {
    const searchTerm = document.getElementById('issueSearch').value.toLowerCase();
    const severityFilter = document.getElementById('severityFilter').value;
    const statusFilter = document.getElementById('issueStatusFilter').value;

    filteredIssues = dashboardData.issues.filter(issue => {
        const matchesSearch = issue.title.toLowerCase().includes(searchTerm) || 
                             issue.description.toLowerCase().includes(searchTerm) ||
                             issue.issue_id.toLowerCase().includes(searchTerm);
        const matchesSeverity = !severityFilter || issue.severity === severityFilter;
        const matchesStatus = !statusFilter || issue.status === statusFilter;

        return matchesSearch && matchesSeverity && matchesStatus;
    });

    renderIssues();
}

function getStatusClass(status) {
    switch (status.toLowerCase()) {
        case 'investigating': return 'warning';
        case 'fix available': return 'info';
        case 'resolved': return 'success';
        default: return 'info';
    }
}

// Patches Management
function initializePatches() {
    renderPatches();
}

function renderPatches() {
    const patchesTimeline = document.getElementById('patchesTimeline');
    patchesTimeline.innerHTML = '';

    // Sort patches by date (newest first)
    const sortedPatches = [...dashboardData.patches].sort((a, b) => new Date(b.release_date) - new Date(a.release_date));

    if (sortedPatches.length === 0) {
        patchesTimeline.innerHTML = '<div class="empty-state"><h3>No patches found</h3><p>No patch information available at this time.</p></div>';
        return;
    }

    sortedPatches.forEach(patch => {
        const patchCard = document.createElement('div');
        patchCard.className = 'patch-card';
        patchCard.innerHTML = `
            <div class="patch-date">
                ${new Date(patch.release_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                })}
            </div>
            <div class="patch-content">
                <h3>${patch.patch_id}</h3>
                <p class="patch-summary">${patch.fixes_included} fixes included</p>
                <div class="patch-stats">
                    <div class="patch-stat">
                        <span class="patch-stat-value">${patch.critical_fixes}</span> Critical Fixes
                    </div>
                    <div class="patch-stat">
                        <span class="patch-stat-value">${patch.enhancement_fixes}</span> Enhancements
                    </div>
                </div>
            </div>
            <div class="patch-modules">
                ${patch.modules_affected.map(module => `<span class="patch-module">${module}</span>`).join('')}
            </div>
        `;
        patchesTimeline.appendChild(patchCard);
    });
}

// Reports Management
function initializeReports() {
    setupReportHandlers();
}

function setupReportHandlers() {
    document.getElementById('generateSummaryBtn').addEventListener('click', generateExecutiveSummary);
    document.getElementById('generateReportBtn').addEventListener('click', generateCustomReport);
}

function generateExecutiveSummary() {
    const reportPreview = document.getElementById('reportPreview');
    const reportContent = document.getElementById('reportContent');

    const totalFeatures = dashboardData.features.length;
    const enabledFeatures = dashboardData.features.filter(f => f.enabled_in_environment).length;
    const highSeverityIssues = dashboardData.issues.filter(i => i.severity === 'High').length;
    const recentPatches = dashboardData.patches.length;

    reportContent.innerHTML = `
        <div class="executive-summary">
            <h2>SuccessFactors Learning Dashboard - Executive Summary</h2>
            <p><em>Generated on: ${new Date().toLocaleDateString()}</em></p>
            
            <h3>Key Metrics</h3>
            <ul>
                <li><strong>Total Features Tracked:</strong> ${totalFeatures}</li>
                <li><strong>Features Enabled in Environment:</strong> ${enabledFeatures} (${Math.round((enabledFeatures/totalFeatures)*100)}%)</li>
                <li><strong>High Severity Issues:</strong> ${highSeverityIssues}</li>
                <li><strong>Recent Patches:</strong> ${recentPatches}</li>
            </ul>

            <h3>Upcoming Releases</h3>
            <ul>
                <li><strong>1H 2025 Release:</strong> Preview April 14, Production May 16-18</li>
                <li><strong>2H 2025 Release:</strong> Preview October 13, Production November 14-16</li>
            </ul>

            <h3>Key Features Status</h3>
            ${dashboardData.features.map(feature => `
                <p><strong>${feature.name}</strong> (${feature.feature_id}): 
                   ${feature.enabled_in_environment ? '✅ Enabled' : '❌ Disabled'} - 
                   ${feature.action_required}</p>
            `).join('')}

            <h3>Action Items</h3>
            <ul>
                ${dashboardData.features
                  .filter(f => f.action_required === 'Required' || f.action_required === 'Recommended')
                  .map(f => `<li>${f.name}: ${f.action_required}</li>`)
                  .join('')}
            </ul>
        </div>
    `;

    reportPreview.style.display = 'block';
    reportPreview.scrollIntoView({ behavior: 'smooth' });
    showToast('success', 'Executive summary generated successfully');
}

function generateCustomReport() {
    const reportType = document.getElementById('reportType').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    const reportPreview = document.getElementById('reportPreview');
    const reportContent = document.getElementById('reportContent');

    let content = '';

    switch (reportType) {
        case 'features':
            content = generateFeaturesReport();
            break;
        case 'issues':
            content = generateIssuesReport();
            break;
        case 'patches':
            content = generatePatchesReport(startDate, endDate);
            break;
        case 'comprehensive':
            content = generateComprehensiveReport(startDate, endDate);
            break;
    }

    reportContent.innerHTML = content;
    reportPreview.style.display = 'block';
    reportPreview.scrollIntoView({ behavior: 'smooth' });
    showToast('success', `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully`);
}

function generateFeaturesReport() {
    return `
        <div class="features-report">
            <h2>Features Report</h2>
            <p><em>Generated on: ${new Date().toLocaleDateString()}</em></p>
            
            <table class="features-table">
                <thead>
                    <tr>
                        <th>Feature ID</th>
                        <th>Name</th>
                        <th>Release</th>
                        <th>Status</th>
                        <th>Environment</th>
                        <th>Impact</th>
                    </tr>
                </thead>
                <tbody>
                    ${dashboardData.features.map(feature => `
                        <tr>
                            <td>${feature.feature_id}</td>
                            <td>${feature.name}</td>
                            <td>${feature.release}</td>
                            <td>${feature.status}</td>
                            <td>${feature.enabled_in_environment ? 'Enabled' : 'Disabled'}</td>
                            <td>${feature.impact_level}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function generateIssuesReport() {
    return `
        <div class="issues-report">
            <h2>Known Issues Report</h2>
            <p><em>Generated on: ${new Date().toLocaleDateString()}</em></p>
            
            ${dashboardData.issues.map(issue => `
                <div class="issue-summary">
                    <h4>${issue.title} (${issue.issue_id})</h4>
                    <p><strong>Severity:</strong> ${issue.severity}</p>
                    <p><strong>Status:</strong> ${issue.status}</p>
                    <p><strong>Description:</strong> ${issue.description}</p>
                    <p><strong>Workaround:</strong> ${issue.workaround}</p>
                    <p><strong>Estimated Fix:</strong> ${issue.estimated_fix}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function generatePatchesReport(startDate, endDate) {
    let filteredPatches = dashboardData.patches;
    
    if (startDate && endDate) {
        filteredPatches = dashboardData.patches.filter(patch => {
            const patchDate = new Date(patch.release_date);
            return patchDate >= new Date(startDate) && patchDate <= new Date(endDate);
        });
    }

    return `
        <div class="patches-report">
            <h2>Patches Report</h2>
            <p><em>Generated on: ${new Date().toLocaleDateString()}</em></p>
            ${startDate && endDate ? `<p><em>Date Range: ${startDate} to ${endDate}</em></p>` : ''}
            
            ${filteredPatches.map(patch => `
                <div class="patch-summary">
                    <h4>${patch.patch_id} - ${new Date(patch.release_date).toLocaleDateString()}</h4>
                    <p><strong>Total Fixes:</strong> ${patch.fixes_included}</p>
                    <p><strong>Critical Fixes:</strong> ${patch.critical_fixes}</p>
                    <p><strong>Enhancement Fixes:</strong> ${patch.enhancement_fixes}</p>
                    <p><strong>Modules Affected:</strong> ${patch.modules_affected.join(', ')}</p>
                </div>
            `).join('')}
        </div>
    `;
}

function generateComprehensiveReport(startDate, endDate) {
    return `
        <div class="comprehensive-report">
            <h2>Comprehensive SuccessFactors Learning Report</h2>
            <p><em>Generated on: ${new Date().toLocaleDateString()}</em></p>
            ${startDate && endDate ? `<p><em>Date Range: ${startDate} to ${endDate}</em></p>` : ''}
            
            ${generateFeaturesReport()}
            ${generateIssuesReport()}
            ${generatePatchesReport(startDate, endDate)}
        </div>
    `;
}

// Enhanced Export Functions with proper CSV generation
function exportData(type) {
    let data = [];
    let filename = '';
    let headers = [];

    switch (type) {
        case 'features':
            headers = ['Feature ID', 'Name', 'Release', 'Module', 'Status', 'Enablement', 'Action Required', 'Description', 'Enabled in Environment', 'Impact Level'];
            data = dashboardData.features.map(feature => [
                feature.feature_id,
                feature.name,
                feature.release,
                feature.module,
                feature.status,
                feature.enablement,
                feature.action_required,
                feature.description,
                feature.enabled_in_environment ? 'Yes' : 'No',
                feature.impact_level
            ]);
            filename = 'sf_features_export.csv';
            break;
        case 'issues':
            headers = ['Issue ID', 'Title', 'Severity', 'Status', 'Affected Modules', 'Description', 'Workaround', 'Estimated Fix'];
            data = dashboardData.issues.map(issue => [
                issue.issue_id,
                issue.title,
                issue.severity,
                issue.status,
                issue.affected_modules.join('; '),
                issue.description,
                issue.workaround,
                issue.estimated_fix
            ]);
            filename = 'sf_known_issues_export.csv';
            break;
        case 'patches':
            headers = ['Patch ID', 'Release Date', 'Fixes Included', 'Critical Fixes', 'Enhancement Fixes', 'Modules Affected', 'Status'];
            data = dashboardData.patches.map(patch => [
                patch.patch_id,
                patch.release_date,
                patch.fixes_included,
                patch.critical_fixes,
                patch.enhancement_fixes,
                patch.modules_affected.join('; '),
                patch.status
            ]);
            filename = 'sf_patches_export.csv';
            break;
    }

    if (data.length > 0) {
        downloadCSV(data, headers, filename);
        showToast('success', `${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully`);
    } else {
        showToast('error', 'No data to export');
    }
}

function downloadCSV(data, headers, filename) {
    // Create CSV content
    const csvContent = [
        headers.join(','),
        ...data.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// Event Listeners
function initializeEventListeners() {
    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', refreshData);

    // Export buttons
    document.getElementById('exportFeaturesBtn').addEventListener('click', () => exportData('features'));
    document.getElementById('exportIssuesBtn').addEventListener('click', () => exportData('issues'));
    document.getElementById('exportPatchesBtn').addEventListener('click', () => exportData('patches'));

    // Modal close
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('featureModal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    });

    // Escape key to close modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function refreshData() {
    showToast('info', 'Refreshing dashboard data...');
    
    // Add loading class to main container
    const mainContainer = document.querySelector('.dashboard-main');
    mainContainer.classList.add('loading');
    
    // Simulate data refresh
    setTimeout(() => {
        mainContainer.classList.remove('loading');
        updateLastUpdated();
        initializeMetrics();
        renderFeaturesTable();
        renderIssues();
        renderPatches();
        showToast('success', 'Dashboard data refreshed successfully');
    }, 1500);
}

function updateLastUpdated() {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('lastUpdated').textContent = formatted;
}

function closeModal() {
    document.getElementById('featureModal').classList.remove('show');
}

// Toast Notifications
function showToast(type, message) {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    
    toast.innerHTML = `
        <p class="toast-message">${message}</p>
    `;
    
    toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toastContainer.contains(toast)) {
                toastContainer.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Utility Functions
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}