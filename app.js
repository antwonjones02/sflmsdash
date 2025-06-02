// SuccessFactors Learning Release Dashboard
class DashboardApp {
    constructor() {
        this.data = {
            features: [],
            issues: [],
            patches: [],
            futureReleases: []
        };
        
        this.filters = {
            search: '',
            version: '',
            lifecycle: '',
            enablementStatus: ''
        };
        
        this.sortConfig = {
            key: null,
            direction: 'asc'
        };
        
        this.init();
    }

    init() {
        this.loadSampleData();
        this.setupEventListeners();
        this.renderFeatures();
        this.renderIssues();
        this.renderPatches();
        this.renderFutureReleases();
        this.updateStats();
        this.populateFilterOptions();
    }

    loadSampleData() {
        // Load sample data from the provided JSON
        const sampleData = {
            "sampleFeatureReleases": [
                {
                    "title": "Joule Available in SAP SuccessFactors Mobile",
                    "description": "You can now use Joule, SAP's AI copilot, in SAP SuccessFactors Mobile apps.",
                    "product": "Learning",
                    "module": "Mobile Applications",
                    "lifecycle": "General Availability",
                    "enablement": "Contact Product Support",
                    "softwareVersion": "1H 2025",
                    "validAsOf": "2025-05-16",
                    "enablementStatus": "Not Yet Evaluated",
                    "lastUpdated": "",
                    "referenceNumber": "MOB-88140",
                    "seeMore": "https://help.sap.com/docs/PRODUCTS/e9989dc2e5b046ec929e2ad5e8305d24/de22c78b4cfd41a2ab16236b7c41365d.html"
                },
                {
                    "title": "AI-Assisted Image Generation in Learning",
                    "description": "You can now use AI-assisted capabilities to generate images for content in Learning Administration.",
                    "product": "Learning",
                    "module": "SAP Business AI",
                    "lifecycle": "General Availability",
                    "enablement": "Contact Customer Engagement Executive or Account Manager",
                    "softwareVersion": "1H 2025",
                    "validAsOf": "2025-05-16",
                    "enablementStatus": "Under Evaluation",
                    "lastUpdated": "2025-06-01",
                    "referenceNumber": "LRN-159091",
                    "seeMore": "https://help.sap.com/docs/PRODUCTS/8e0d540f96474717bbf18df51e54e522/e9878193546043bf8a3414853b1864a8.html"
                }
            ],
            "sampleKnownIssues": [
                {
                    "id": 1,
                    "title": "Learning History page loads slowly with large datasets",
                    "description": "Users with extensive learning history (>500 completed items) experience slow page load times",
                    "affectedReleases": ["1H 2025", "2H 2024"],
                    "status": "Investigating",
                    "severity": "Medium",
                    "kbaLink": "https://launchpad.support.sap.com/services/odata/svt/knowledgebasearticles/3456789",
                    "dateAdded": "2025-05-15",
                    "lastUpdated": "2025-05-20"
                },
                {
                    "id": 2,
                    "title": "CSV import fails for files larger than 50MB",
                    "description": "Large CSV imports from What's New Viewer timeout after 30 seconds",
                    "affectedReleases": ["1H 2025"],
                    "status": "Workaround Provided",
                    "severity": "High",
                    "kbaLink": "https://launchpad.support.sap.com/services/odata/svt/knowledgebasearticles/3456790",
                    "dateAdded": "2025-04-22",
                    "lastUpdated": "2025-05-01"
                }
            ],
            "samplePatches": [
                {
                    "id": 1,
                    "patchId": "LRN-2024-P001",
                    "releaseDate": "2025-01-15",
                    "description": "Fixed issue with course completion tracking not updating correctly for SCORM content",
                    "patchNotesLink": "https://help.sap.com/docs/patches/LRN-2024-P001",
                    "affectedVersions": ["2H 2024"],
                    "dateAdded": "2025-01-16"
                },
                {
                    "id": 2,
                    "patchId": "LRN-2025-P002",
                    "releaseDate": "2025-03-10",
                    "description": "Performance improvements for enhanced search functionality with large course catalogs",
                    "patchNotesLink": "https://help.sap.com/docs/patches/LRN-2025-P002",
                    "affectedVersions": ["1H 2025"],
                    "dateAdded": "2025-03-11"
                }
            ],
            "sampleFutureReleases": [
                {
                    "id": 1,
                    "releaseTarget": "2H 2025",
                    "featureName": "Enhanced AI-powered learning recommendations",
                    "description": "Improved machine learning algorithms for personalized course suggestions based on skills gaps and career goals",
                    "sourceLink": "https://roadmaps.sap.com/board/RM-LRN-2025",
                    "confidenceLevel": "High",
                    "dateAdded": "2025-04-01"
                },
                {
                    "id": 2,
                    "releaseTarget": "1H 2026",
                    "featureName": "Virtual Reality learning content support",
                    "description": "Native support for VR-based training modules and immersive learning experiences",
                    "sourceLink": "https://roadmaps.sap.com/board/RM-LRN-2026",
                    "confidenceLevel": "Medium",
                    "dateAdded": "2025-03-15"
                }
            ]
        };

        // Load existing data from localStorage or use sample data
        this.data.features = this.loadFromStorage('features') || sampleData.sampleFeatureReleases;
        this.data.issues = this.loadFromStorage('issues') || sampleData.sampleKnownIssues;
        this.data.patches = this.loadFromStorage('patches') || sampleData.samplePatches;
        this.data.futureReleases = this.loadFromStorage('futureReleases') || sampleData.sampleFutureReleases;
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // CSV Import
        document.getElementById('csvImportBtn').addEventListener('click', () => this.openCSVModal());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal('csvImportModal'));
        document.getElementById('csvFileInput').addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Upload area
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));
        uploadArea.addEventListener('click', () => document.getElementById('csvFileInput').click());

        // Filters
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('versionFilter').addEventListener('change', (e) => this.handleFilter('version', e.target.value));
        document.getElementById('lifecycleFilter').addEventListener('change', (e) => this.handleFilter('lifecycle', e.target.value));
        document.getElementById('enablementStatusFilter').addEventListener('change', (e) => this.handleFilter('enablementStatus', e.target.value));

        // Export buttons
        document.getElementById('exportCsvBtn').addEventListener('click', () => this.exportCSV());
        document.getElementById('exportPdfBtn').addEventListener('click', () => this.exportPDF());

        // Add buttons
        document.getElementById('addIssueBtn').addEventListener('click', () => this.openAddIssueModal());
        document.getElementById('addPatchBtn').addEventListener('click', () => this.openAddPatchModal());
        document.getElementById('addFutureReleaseBtn').addEventListener('click', () => this.openAddFutureReleaseModal());

        // Generic modal close
        document.getElementById('closeGenericModal').addEventListener('click', () => this.closeModal('genericModal'));

        // Table sorting
        document.querySelectorAll('#featuresTable th[data-sort]').forEach(th => {
            th.addEventListener('click', () => this.handleSort(th.dataset.sort));
        });
    }

    switchTab(tabName) {
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
    }

    openCSVModal() {
        document.getElementById('csvImportModal').classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        if (modalId === 'csvImportModal') {
            document.getElementById('importProgress').style.display = 'none';
            document.getElementById('uploadArea').style.display = 'block';
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.target.closest('.upload-area').classList.add('dragover');
    }

    handleFileDrop(e) {
        e.preventDefault();
        e.target.closest('.upload-area').classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processCSVFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processCSVFile(file);
        }
    }

    processCSVFile(file) {
        if (!file.name.toLowerCase().endsWith('.csv')) {
            this.showNotification('Please select a valid CSV file', 'error');
            return;
        }

        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('importProgress').style.display = 'block';

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.parseCSVData(e.target.result);
            } catch (error) {
                this.showNotification('Error parsing CSV file: ' + error.message, 'error');
                this.closeModal('csvImportModal');
            }
        };
        reader.readAsText(file);
    }

    parseCSVData(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        let newFeatures = 0;
        let updatedFeatures = 0;
        
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            if (values.length < headers.length) continue;

            const feature = {};
            headers.forEach((header, index) => {
                feature[this.mapHeaderToProperty(header)] = values[index] || '';
            });

            // Add default values
            feature.enablementStatus = feature.enablementStatus || 'Not Yet Evaluated';
            feature.lastUpdated = feature.lastUpdated || '';

            // Check if feature already exists (by title or reference number)
            const existingIndex = this.data.features.findIndex(f => 
                f.title === feature.title || 
                (f.referenceNumber && feature.referenceNumber && f.referenceNumber === feature.referenceNumber)
            );

            if (existingIndex >= 0) {
                // Preserve enablement status if it was manually set
                if (this.data.features[existingIndex].enablementStatus !== 'Not Yet Evaluated') {
                    feature.enablementStatus = this.data.features[existingIndex].enablementStatus;
                    feature.lastUpdated = this.data.features[existingIndex].lastUpdated;
                }
                this.data.features[existingIndex] = feature;
                updatedFeatures++;
            } else {
                this.data.features.push(feature);
                newFeatures++;
            }

            // Update progress
            const progress = (i / (lines.length - 1)) * 100;
            document.getElementById('progressFill').style.width = progress + '%';
            document.getElementById('progressText').textContent = `Processing... ${i}/${lines.length - 1}`;
        }

        // Save to storage
        this.saveToStorage('features', this.data.features);

        // Update UI
        this.renderFeatures();
        this.updateStats();
        this.populateFilterOptions();

        // Show success notification
        setTimeout(() => {
            this.closeModal('csvImportModal');
            this.showNotification(
                `Import completed! ${newFeatures} new features added, ${updatedFeatures} features updated.`,
                'success'
            );
        }, 500);
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        
        return result.map(value => value.replace(/"/g, ''));
    }

    mapHeaderToProperty(header) {
        const mapping = {
            'Title': 'title',
            'Description': 'description',
            'Product': 'product',
            'Module': 'module',
            'Feature': 'feature',
            'Lifecycle': 'lifecycle',
            'Action': 'action',
            'Enablement': 'enablement',
            'Reference Number': 'referenceNumber',
            'Demo': 'demo',
            'Software Version': 'softwareVersion',
            'Valid as Of': 'validAsOf',
            'See More': 'seeMore'
        };
        return mapping[header] || header.toLowerCase().replace(/\s+/g, '');
    }

    handleSearch(value) {
        this.filters.search = value.toLowerCase();
        this.renderFeatures();
    }

    handleFilter(type, value) {
        this.filters[type] = value;
        this.renderFeatures();
    }

    handleSort(key) {
        if (this.sortConfig.key === key) {
            this.sortConfig.direction = this.sortConfig.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortConfig.key = key;
            this.sortConfig.direction = 'asc';
        }

        // Update sort indicators
        document.querySelectorAll('#featuresTable th').forEach(th => {
            th.classList.remove('sort-asc', 'sort-desc');
        });
        
        const sortedTh = document.querySelector(`#featuresTable th[data-sort="${key}"]`);
        sortedTh.classList.add(`sort-${this.sortConfig.direction}`);

        this.renderFeatures();
    }

    getFilteredFeatures() {
        let filtered = [...this.data.features];

        // Apply search filter
        if (this.filters.search) {
            filtered = filtered.filter(feature => 
                feature.title.toLowerCase().includes(this.filters.search) ||
                feature.description.toLowerCase().includes(this.filters.search)
            );
        }

        // Apply other filters
        if (this.filters.version) {
            filtered = filtered.filter(feature => feature.softwareVersion === this.filters.version);
        }
        if (this.filters.lifecycle) {
            filtered = filtered.filter(feature => feature.lifecycle === this.filters.lifecycle);
        }
        if (this.filters.enablementStatus) {
            filtered = filtered.filter(feature => feature.enablementStatus === this.filters.enablementStatus);
        }

        // Apply sorting
        if (this.sortConfig.key) {
            filtered.sort((a, b) => {
                const aVal = a[this.sortConfig.key] || '';
                const bVal = b[this.sortConfig.key] || '';
                const result = aVal.localeCompare(bVal);
                return this.sortConfig.direction === 'asc' ? result : -result;
            });
        }

        return filtered;
    }

    renderFeatures() {
        const tbody = document.getElementById('featuresTableBody');
        const filtered = this.getFilteredFeatures();

        if (filtered.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="empty-state">
                        <div class="empty-state-icon">📄</div>
                        <p>No features found. Import a CSV file to get started.</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = filtered.map(feature => `
            <tr>
                <td class="title-cell">
                    ${feature.seeMore ? 
                        `<a href="${feature.seeMore}" target="_blank" class="title-link">${feature.title}</a>` :
                        feature.title
                    }
                </td>
                <td class="description-cell">
                    <div class="description-content">
                        <div class="description-truncated" id="desc-${this.generateId(feature.title)}">
                            ${feature.description}
                        </div>
                        ${feature.description.length > 100 ? 
                            `<button class="read-more-btn" onclick="app.toggleDescription('${this.generateId(feature.title)}')">Read More</button>` : 
                            ''
                        }
                    </div>
                </td>
                <td>${feature.product}</td>
                <td>${feature.module}</td>
                <td>
                    <span class="lifecycle-badge">${feature.lifecycle}</span>
                </td>
                <td>${feature.enablement}</td>
                <td>${feature.softwareVersion}</td>
                <td>
                    <select class="status-select" onchange="app.updateEnablementStatus('${this.generateId(feature.title)}', this.value)">
                        <option value="Not Yet Evaluated" ${feature.enablementStatus === 'Not Yet Evaluated' ? 'selected' : ''}>Not Yet Evaluated</option>
                        <option value="Enabled in Our Environment" ${feature.enablementStatus === 'Enabled in Our Environment' ? 'selected' : ''}>Enabled in Our Environment</option>
                        <option value="Not Enabled (Decision Made)" ${feature.enablementStatus === 'Not Enabled (Decision Made)' ? 'selected' : ''}>Not Enabled (Decision Made)</option>
                        <option value="Under Evaluation" ${feature.enablementStatus === 'Under Evaluation' ? 'selected' : ''}>Under Evaluation</option>
                        <option value="Not Applicable to Us" ${feature.enablementStatus === 'Not Applicable to Us' ? 'selected' : ''}>Not Applicable to Us</option>
                    </select>
                </td>
                <td>${feature.lastUpdated || '-'}</td>
            </tr>
        `).join('');
    }

    generateId(title) {
        return title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    }

    toggleDescription(id) {
        const element = document.getElementById(`desc-${id}`);
        const button = element.nextElementSibling;
        
        if (element.classList.contains('description-truncated')) {
            element.classList.remove('description-truncated');
            button.textContent = 'Read Less';
        } else {
            element.classList.add('description-truncated');
            button.textContent = 'Read More';
        }
    }

    updateEnablementStatus(featureId, status) {
        const feature = this.data.features.find(f => this.generateId(f.title) === featureId);
        if (feature) {
            feature.enablementStatus = status;
            feature.lastUpdated = new Date().toISOString().split('T')[0];
            this.saveToStorage('features', this.data.features);
            this.updateStats();
            this.renderFeatures();
        }
    }

    populateFilterOptions() {
        const versions = [...new Set(this.data.features.map(f => f.softwareVersion))].filter(Boolean);
        const lifecycles = [...new Set(this.data.features.map(f => f.lifecycle))].filter(Boolean);

        const versionSelect = document.getElementById('versionFilter');
        const lifecycleSelect = document.getElementById('lifecycleFilter');

        versionSelect.innerHTML = '<option value="">All Versions</option>' + 
            versions.map(v => `<option value="${v}">${v}</option>`).join('');

        lifecycleSelect.innerHTML = '<option value="">All Lifecycle</option>' + 
            lifecycles.map(l => `<option value="${l}">${l}</option>`).join('');
    }

    updateStats() {
        const total = this.data.features.length;
        const enabled = this.data.features.filter(f => f.enablementStatus === 'Enabled in Our Environment').length;
        const underEvaluation = this.data.features.filter(f => f.enablementStatus === 'Under Evaluation').length;

        document.getElementById('totalFeaturesCount').textContent = total;
        document.getElementById('enabledFeaturesCount').textContent = enabled;
        document.getElementById('underEvaluationCount').textContent = underEvaluation;
    }

    renderIssues() {
        const tbody = document.getElementById('issuesTableBody');
        tbody.innerHTML = this.data.issues.map(issue => `
            <tr>
                <td>${issue.title}</td>
                <td>${issue.description}</td>
                <td><span class="status-badge status-badge--${issue.status.toLowerCase().replace(/\s+/g, '')}">${issue.status}</span></td>
                <td><span class="status-badge status-badge--${issue.severity.toLowerCase()}">${issue.severity}</span></td>
                <td>${Array.isArray(issue.affectedReleases) ? issue.affectedReleases.join(', ') : issue.affectedReleases}</td>
                <td>${issue.dateAdded}</td>
                <td>
                    <button class="action-btn" onclick="app.editIssue(${issue.id})">Edit</button>
                    <button class="action-btn action-btn--danger" onclick="app.deleteIssue(${issue.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    renderPatches() {
        const tbody = document.getElementById('patchesTableBody');
        tbody.innerHTML = this.data.patches.map(patch => `
            <tr>
                <td>${patch.patchId}</td>
                <td>${patch.releaseDate}</td>
                <td>${patch.description}</td>
                <td>${Array.isArray(patch.affectedVersions) ? patch.affectedVersions.join(', ') : patch.affectedVersions}</td>
                <td>
                    <button class="action-btn" onclick="app.editPatch(${patch.id})">Edit</button>
                    <button class="action-btn action-btn--danger" onclick="app.deletePatch(${patch.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    renderFutureReleases() {
        const tbody = document.getElementById('futureReleasesTableBody');
        tbody.innerHTML = this.data.futureReleases.map(release => `
            <tr>
                <td>${release.releaseTarget}</td>
                <td>${release.featureName}</td>
                <td>${release.description}</td>
                <td><span class="status-badge status-badge--${release.confidenceLevel.toLowerCase()}">${release.confidenceLevel}</span></td>
                <td>${release.dateAdded}</td>
                <td>
                    <button class="action-btn" onclick="app.editFutureRelease(${release.id})">Edit</button>
                    <button class="action-btn action-btn--danger" onclick="app.deleteFutureRelease(${release.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    // Modal management for adding/editing items
    openAddIssueModal() {
        this.openGenericModal('Add New Issue', this.getIssueForm());
    }

    openAddPatchModal() {
        this.openGenericModal('Add New Patch', this.getPatchForm());
    }

    openAddFutureReleaseModal() {
        this.openGenericModal('Add Future Release', this.getFutureReleaseForm());
    }

    openGenericModal(title, content) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBodyContent').innerHTML = content;
        document.getElementById('genericModal').classList.add('active');
    }

    getIssueForm(issue = {}) {
        return `
            <form class="modal-form" id="issueForm">
                <div class="form-group">
                    <label class="form-label">Title</label>
                    <input type="text" class="form-control" name="title" value="${issue.title || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" name="description" required>${issue.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Status</label>
                    <select class="form-control" name="status">
                        <option value="Open" ${issue.status === 'Open' ? 'selected' : ''}>Open</option>
                        <option value="Investigating" ${issue.status === 'Investigating' ? 'selected' : ''}>Investigating</option>
                        <option value="Resolved" ${issue.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                        <option value="Workaround Provided" ${issue.status === 'Workaround Provided' ? 'selected' : ''}>Workaround Provided</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Severity</label>
                    <select class="form-control" name="severity">
                        <option value="Low" ${issue.severity === 'Low' ? 'selected' : ''}>Low</option>
                        <option value="Medium" ${issue.severity === 'Medium' ? 'selected' : ''}>Medium</option>
                        <option value="High" ${issue.severity === 'High' ? 'selected' : ''}>High</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">KBA Link</label>
                    <input type="url" class="form-control" name="kbaLink" value="${issue.kbaLink || ''}">
                </div>
                <div class="modal-form-actions">
                    <button type="button" class="btn btn--outline" onclick="app.closeModal('genericModal')">Cancel</button>
                    <button type="submit" class="btn btn--primary">Save Issue</button>
                </div>
            </form>
        `;
    }

    getPatchForm(patch = {}) {
        return `
            <form class="modal-form" id="patchForm">
                <div class="form-group">
                    <label class="form-label">Patch ID</label>
                    <input type="text" class="form-control" name="patchId" value="${patch.patchId || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Release Date</label>
                    <input type="date" class="form-control" name="releaseDate" value="${patch.releaseDate || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" name="description" required>${patch.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Patch Notes Link</label>
                    <input type="url" class="form-control" name="patchNotesLink" value="${patch.patchNotesLink || ''}">
                </div>
                <div class="modal-form-actions">
                    <button type="button" class="btn btn--outline" onclick="app.closeModal('genericModal')">Cancel</button>
                    <button type="submit" class="btn btn--primary">Save Patch</button>
                </div>
            </form>
        `;
    }

    getFutureReleaseForm(release = {}) {
        return `
            <form class="modal-form" id="futureReleaseForm">
                <div class="form-group">
                    <label class="form-label">Release Target</label>
                    <input type="text" class="form-control" name="releaseTarget" value="${release.releaseTarget || ''}" placeholder="e.g., 2H 2025" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Feature Name</label>
                    <input type="text" class="form-control" name="featureName" value="${release.featureName || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" name="description" required>${release.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label">Source Link</label>
                    <input type="url" class="form-control" name="sourceLink" value="${release.sourceLink || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Confidence Level</label>
                    <select class="form-control" name="confidenceLevel">
                        <option value="High" ${release.confidenceLevel === 'High' ? 'selected' : ''}>High</option>
                        <option value="Medium" ${release.confidenceLevel === 'Medium' ? 'selected' : ''}>Medium</option>
                        <option value="Low" ${release.confidenceLevel === 'Low' ? 'selected' : ''}>Low</option>
                    </select>
                </div>
                <div class="modal-form-actions">
                    <button type="button" class="btn btn--outline" onclick="app.closeModal('genericModal')">Cancel</button>
                    <button type="submit" class="btn btn--primary">Save Release</button>
                </div>
            </form>
        `;
    }

    // CRUD operations
    editIssue(id) {
        const issue = this.data.issues.find(i => i.id === id);
        this.openGenericModal('Edit Issue', this.getIssueForm(issue));
    }

    deleteIssue(id) {
        if (confirm('Are you sure you want to delete this issue?')) {
            this.data.issues = this.data.issues.filter(i => i.id !== id);
            this.saveToStorage('issues', this.data.issues);
            this.renderIssues();
            this.showNotification('Issue deleted successfully', 'success');
        }
    }

    editPatch(id) {
        const patch = this.data.patches.find(p => p.id === id);
        this.openGenericModal('Edit Patch', this.getPatchForm(patch));
    }

    deletePatch(id) {
        if (confirm('Are you sure you want to delete this patch?')) {
            this.data.patches = this.data.patches.filter(p => p.id !== id);
            this.saveToStorage('patches', this.data.patches);
            this.renderPatches();
            this.showNotification('Patch deleted successfully', 'success');
        }
    }

    editFutureRelease(id) {
        const release = this.data.futureReleases.find(r => r.id === id);
        this.openGenericModal('Edit Future Release', this.getFutureReleaseForm(release));
    }

    deleteFutureRelease(id) {
        if (confirm('Are you sure you want to delete this future release?')) {
            this.data.futureReleases = this.data.futureReleases.filter(r => r.id !== id);
            this.saveToStorage('futureReleases', this.data.futureReleases);
            this.renderFutureReleases();
            this.showNotification('Future release deleted successfully', 'success');
        }
    }

    // Export functionality
    exportCSV() {
        const filtered = this.getFilteredFeatures();
        const headers = ['Title', 'Description', 'Product', 'Module', 'Lifecycle', 'Enablement', 'Software Version', 'Enablement Status', 'Last Updated'];
        const csvContent = [
            headers.join(','),
            ...filtered.map(feature => [
                `"${feature.title}"`,
                `"${feature.description}"`,
                `"${feature.product}"`,
                `"${feature.module}"`,
                `"${feature.lifecycle}"`,
                `"${feature.enablement}"`,
                `"${feature.softwareVersion}"`,
                `"${feature.enablementStatus}"`,
                `"${feature.lastUpdated}"`
            ].join(','))
        ].join('\n');

        this.downloadFile(csvContent, 'features-export.csv', 'text/csv');
        this.showNotification('CSV export completed', 'success');
    }

    exportPDF() {
        // Simple PDF export using print functionality
        const filtered = this.getFilteredFeatures();
        const printWindow = window.open('', '_blank');
        
        const htmlContent = `
            <html>
                <head>
                    <title>SuccessFactors Learning Release Dashboard</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #21808d; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; }
                        .stats { margin: 20px 0; }
                        .stat { display: inline-block; margin-right: 30px; }
                    </style>
                </head>
                <body>
                    <h1>SuccessFactors Learning Release Dashboard</h1>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                    
                    <div class="stats">
                        <div class="stat"><strong>Total Features:</strong> ${filtered.length}</div>
                        <div class="stat"><strong>Enabled:</strong> ${filtered.filter(f => f.enablementStatus === 'Enabled in Our Environment').length}</div>
                        <div class="stat"><strong>Under Evaluation:</strong> ${filtered.filter(f => f.enablementStatus === 'Under Evaluation').length}</div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Product</th>
                                <th>Module</th>
                                <th>Version</th>
                                <th>Lifecycle</th>
                                <th>Our Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.map(feature => `
                                <tr>
                                    <td>${feature.title}</td>
                                    <td>${feature.product}</td>
                                    <td>${feature.module}</td>
                                    <td>${feature.softwareVersion}</td>
                                    <td>${feature.lifecycle}</td>
                                    <td>${feature.enablementStatus}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </body>
            </html>
        `;

        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.print();
        
        this.showNotification('PDF export initiated', 'success');
    }

    downloadFile(content, fileName, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        
        const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ⓘ';
        
        notification.innerHTML = `
            <div class="notification-icon">${icon}</div>
            <div class="notification-content">
                <div class="notification-message">${message}</div>
            </div>
        `;

        document.getElementById('notifications').appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    // Storage methods
    saveToStorage(key, data) {
        try {
            localStorage.setItem(`dashboard_${key}`, JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(`dashboard_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
            return null;
        }
    }
}

// Form submission handlers
document.addEventListener('submit', function(e) {
    if (e.target.id === 'issueForm') {
        e.preventDefault();
        const formData = new FormData(e.target);
        const issue = {
            id: Date.now(),
            title: formData.get('title'),
            description: formData.get('description'),
            status: formData.get('status'),
            severity: formData.get('severity'),
            kbaLink: formData.get('kbaLink'),
            affectedReleases: ['1H 2025'], // Default for demo
            dateAdded: new Date().toISOString().split('T')[0],
            lastUpdated: new Date().toISOString().split('T')[0]
        };
        
        app.data.issues.push(issue);
        app.saveToStorage('issues', app.data.issues);
        app.renderIssues();
        app.closeModal('genericModal');
        app.showNotification('Issue added successfully', 'success');
    }
    
    if (e.target.id === 'patchForm') {
        e.preventDefault();
        const formData = new FormData(e.target);
        const patch = {
            id: Date.now(),
            patchId: formData.get('patchId'),
            releaseDate: formData.get('releaseDate'),
            description: formData.get('description'),
            patchNotesLink: formData.get('patchNotesLink'),
            affectedVersions: ['1H 2025'], // Default for demo
            dateAdded: new Date().toISOString().split('T')[0]
        };
        
        app.data.patches.push(patch);
        app.saveToStorage('patches', app.data.patches);
        app.renderPatches();
        app.closeModal('genericModal');
        app.showNotification('Patch added successfully', 'success');
    }
    
    if (e.target.id === 'futureReleaseForm') {
        e.preventDefault();
        const formData = new FormData(e.target);
        const release = {
            id: Date.now(),
            releaseTarget: formData.get('releaseTarget'),
            featureName: formData.get('featureName'),
            description: formData.get('description'),
            sourceLink: formData.get('sourceLink'),
            confidenceLevel: formData.get('confidenceLevel'),
            dateAdded: new Date().toISOString().split('T')[0]
        };
        
        app.data.futureReleases.push(release);
        app.saveToStorage('futureReleases', app.data.futureReleases);
        app.renderFutureReleases();
        app.closeModal('genericModal');
        app.showNotification('Future release added successfully', 'success');
    }
});

// Initialize the application
const app = new DashboardApp();