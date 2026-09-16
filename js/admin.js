let currentApplications = [];
let selectedApp = null;
let reviewModalInstance = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Auth Check
    if (typeof checkAuth === 'function') {
        checkAuth(USER_ROLES.BANK_EMPLOYEE);
    } else if (typeof requireAuth === 'function') {
        requireAuth(USER_ROLES.BANK_EMPLOYEE);
    }

    const user = getCurrentUser();
    if (user && document.getElementById('empDisplay')) {
        document.getElementById('empDisplay').innerText = user.userName || 'Officer';
    }

    const modalEl = document.getElementById('reviewModal');
    if (modalEl && window.bootstrap) {
        reviewModalInstance = new bootstrap.Modal(modalEl);
    }

    await loadAllApplications();
});

async function loadAllApplications() {
    setActiveTab('btnAll');
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">Fetching all bank applications...</td></tr>';

    const res = await BankLoanAPI.getAllApplications();
    currentApplications = res.data || [];
    renderTable(currentApplications);
}

async function loadAssignedApplications() {
    setActiveTab('btnAssigned');
    const user = getCurrentUser();
    const empId = user.userId || user.id;
    const tbody = document.getElementById('adminTableBody');
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4">Fetching assigned applications...</td></tr>';

    const res = await BankLoanAPI.getAssignedApplications(empId);
    currentApplications = res.data || [];
    renderTable(currentApplications);
}

function setActiveTab(activeId) {
    document.getElementById('btnAll').classList.toggle('active', activeId === 'btnAll');
    document.getElementById('btnAssigned').classList.toggle('active', activeId === 'btnAssigned');
}

function renderTable(apps) {
    const tbody = document.getElementById('adminTableBody');
    if (!apps || apps.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">No records found.</td></tr>';
        return;
    }

    const user = getCurrentUser();
    const currentOfficerId = Number(user ? (user.userId || user.id) : 0);

    tbody.innerHTML = apps.map(app => {
        const appId = app.applicationId || app.id;
        const status = app.applicationStatus || app.status || 'Pending';
        const isPending = status.toLowerCase() === 'pending';
        const isAssignedToMe = Number(app.assignedEmployeeId) === currentOfficerId;

        return `
            <tr>
                <td>#${appId}</td>
                <td>${app.fullName || '-'}</td>
                <td><code>${app.panCard || '-'}</code></td>
                <td>${app.employmentStatus || '-'}</td>
                <td><span class="badge bg-dark border border-secondary">${app.creditScore || 'N/A'}</span></td>
                <td class="fw-bold text-success">LKR ${Number(app.annualIncome || 0).toLocaleString()}</td>
                <td><span class="badge ${getStatusBadge(status)}">${status}</span></td>
                <td class="text-center">
                    <div class="d-flex justify-content-center gap-1">
                        <button class="btn btn-primary btn-sm" onclick="openReviewModal(${appId})" title="Inspect Details">
                            <i class="bi bi-eye"></i> Review
                        </button>
                        ${isPending && !isAssignedToMe ? `
                            <button class="btn btn-outline-info btn-sm" onclick="claimApplication(${appId})" title="Assign to Myself">
                                <i class="bi bi-pin-angle"></i> Claim
                            </button>
                        ` : ''}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openReviewModal(appId) {
    selectedApp = currentApplications.find(a => (a.applicationId || a.id) === Number(appId));
    if (!selectedApp) return;

    document.getElementById('modalTitle').innerText = `Application #${appId} - ${selectedApp.fullName}`;

    // Underwriting Rule Engine
    const issues = [];
    const merits = [];

    if (selectedApp.creditScore < 600) {
        issues.push(`Low Credit / CRIB Score (${selectedApp.creditScore}). High risk profile.`);
    } else {
        merits.push(`Reliable Credit Score (${selectedApp.creditScore}).`);
    }

    if (selectedApp.annualIncome < 600000) {
        issues.push(`Annual income is low (LKR ${Number(selectedApp.annualIncome).toLocaleString()}). Minimum threshold: LKR 600,000.`);
    } else {
        merits.push(`Sufficient income: LKR ${Number(selectedApp.annualIncome).toLocaleString()}`);
    }

    if (selectedApp.employmentStatus === 'Unemployed') {
        issues.push(`Applicant is unemployed.`);
    }

    const isPassed = issues.length === 0;

    document.getElementById('modalBody').innerHTML = `
        <div class="alert ${isPassed ? 'alert-success' : 'alert-warning'} py-2 mb-3 bg-opacity-25 border">
            <h6 class="fw-bold mb-1"><i class="bi ${isPassed ? 'bi-shield-check' : 'bi-exclamation-triangle'} me-1"></i> Loan Eligibility Assessment</h6>
            ${issues.length > 0 ? `
                <ul class="mb-0 text-danger small ps-3">
                    ${issues.map(i => `<li><strong>Risk Factor:</strong> ${i}</li>`).join('')}
                </ul>
            ` : `
                <div class="text-success small"><i class="bi bi-check-circle me-1"></i> Applicant meets all minimum loan risk guidelines.</div>
            `}
        </div>

        <div class="row g-3 small">
            <div class="col-md-6"><strong>PAN / NIC:</strong> <code>${selectedApp.panCard}</code></div>
            <div class="col-md-6"><strong>Email:</strong> ${selectedApp.email || 'N/A'}</div>
            <div class="col-md-6"><strong>Phone:</strong> ${selectedApp.phone || 'N/A'}</div>
            <div class="col-md-6"><strong>DOB:</strong> ${selectedApp.dateOfBirth ? new Date(selectedApp.dateOfBirth).toLocaleDateString() : 'N/A'}</div>
            <div class="col-12"><strong>Address:</strong> ${selectedApp.address || ''}, ${selectedApp.city || ''}, ${selectedApp.state || ''}</div>
            <div class="col-md-6"><strong>Employment:</strong> ${selectedApp.employmentStatus}</div>
            <div class="col-md-6"><strong>Assets / Collateral:</strong> ${selectedApp.assets || 'None'}</div>
        </div>

        <div class="mt-3 pt-3 border-top border-secondary">
            <label class="form-label small fw-bold">Officer Remarks / Rejection Reason:</label>
            <textarea id="officerRemarks" class="form-control form-control-sm" rows="2" placeholder="Explain why if rejecting..."></textarea>
        </div>
    `;

    const btnApprove = document.getElementById('btnModalApprove');
    const btnReject = document.getElementById('btnModalReject');
    const isPending = (selectedApp.applicationStatus || selectedApp.status || '').toLowerCase() === 'pending';

    btnApprove.style.display = isPending ? 'inline-block' : 'none';
    btnReject.style.display = isPending ? 'inline-block' : 'none';

    btnApprove.onclick = () => confirmDecision(selectedApp.applicationId || selectedApp.id, 'Approved');
    btnReject.onclick = () => confirmDecision(selectedApp.applicationId || selectedApp.id, 'Rejected');

    if (reviewModalInstance) {
        reviewModalInstance.show();
    }
}

async function confirmDecision(appId, newStatus) {
    const remarks = document.getElementById('officerRemarks').value.trim();
    if (newStatus === 'Rejected' && !remarks) {
        alert('Please state a reason in the remarks field before rejecting.');
        return;
    }

    if (!confirm(`Are you sure you want to mark Application #${appId} as ${newStatus}?`)) {
        return;
    }

    const res = await BankLoanAPI.updateApplicationStatus(appId, newStatus);
    if (res.result) {
        if (reviewModalInstance) reviewModalInstance.hide();
        alert(res.message);
        if (document.getElementById('btnAssigned').classList.contains('active')) {
            await loadAssignedApplications();
        } else {
            await loadAllApplications();
        }
    }
}

async function claimApplication(appId) {
    const user = getCurrentUser();
    const empId = user.userId || user.id;

    const res = await BankLoanAPI.assignToOfficer(appId, empId);
    if (res.result) {
        alert(`Application #${appId} assigned to you successfully.`);
        await loadAllApplications();
    }
}

function getStatusBadge(status) {
    switch ((status || '').toLowerCase()) {
        case 'approved': return 'badge-approved';
        case 'rejected': return 'badge-rejected';
        case 'pending': return 'badge-pending';
        default: return 'bg-secondary text-white';
    }
}