document.addEventListener('DOMContentLoaded', async () => {
   
    if (typeof checkAuth === 'function') {
        checkAuth(USER_ROLES.CUSTOMER);
    } else if (typeof requireAuth === 'function') {
        requireAuth(USER_ROLES.CUSTOMER);
    }

    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    const customerId = user.userId || user.customerId || user.id;
    await fetchMyApplications(customerId);
});

function getTableBody() {
    return document.getElementById('appsTableBody') || document.getElementById('applicationsTableBody');
}

async function fetchMyApplications(customerId) {
    const tbody = getTableBody();
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-white">Loading your applications...</td></tr>';

    const res = await BankLoanAPI.getMyApplications(customerId);
    let apps = (res && Array.isArray(res.data)) ? res.data : [];

  
    if (apps.length === 0 && CONFIG.USE_LOCAL_MOCK_API) {
        const allStored = (typeof getStoredApps === 'function') ? getStoredApps() : [];
        if (allStored.length > 0) {
            apps = allStored;
        }
    }

    if (apps.length > 0) {
        tbody.innerHTML = apps.map(app => {
            const appId = app.applicationId || app.id || '-';
            const status = app.applicationStatus || app.status || 'Pending';
            const income = Number(app.annualIncome || 0).toLocaleString();
            const dob = app.dateOfBirth ? new Date(app.dateOfBirth).toLocaleDateString() : '-';

            return `
                <tr>
                    <td class="fw-bold" style="color: #2dd4bf !important;">#${appId}</td>
                    <td class="text-white">${app.fullName || '-'}</td>
                    <td><code>${app.panCard || '-'}</code></td>
                    <td class="fw-bold text-success">LKR ${income}</td>
                    <td><span class="badge ${getStatusBadge(status)}">${status}</span></td>
                    <td class="text-white">${dob}</td>
                </tr>
            `;
        }).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No loan applications found.</td></tr>';
    }
}

function getStatusBadge(status) {
    if (!status) return 'bg-secondary text-white';
    switch (status.toLowerCase()) {
        case 'approved': return 'badge-approved';
        case 'rejected': return 'badge-rejected';
        case 'pending': return 'badge-pending';
        default: return 'bg-secondary text-white';
    }
}

async function handlePanStatusSearch(event) {
    event.preventDefault();
    const pan = document.getElementById('searchPan').value.trim();
    const status = document.getElementById('searchStatus').value;
    const output = document.getElementById('searchOutput');

    if (!output) return;
    output.innerHTML = '<div class="spinner-border spinner-border-sm text-info mt-3"></div> Checking status...';

    const res = await BankLoanAPI.checkApplicationStatus(pan, status);
    if (res.result && res.data) {
        output.innerHTML = `
            <div class="alert alert-success mt-3 mb-0 small bg-opacity-25 border">
                <i class="bi bi-check-circle-fill me-1"></i>
                <strong>Record Verified:</strong> Application with PAN / NIC <code>${pan}</code> holds <strong>${status}</strong> status.
            </div>
        `;
    } else {
        output.innerHTML = `
            <div class="alert alert-warning mt-3 mb-0 small bg-opacity-25 border">
                <i class="bi bi-exclamation-triangle-fill me-1"></i>
                ${res.message || 'No matching application found for provided criteria.'}
            </div>
        `;
    }
}