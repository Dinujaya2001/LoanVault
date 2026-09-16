document.addEventListener('DOMContentLoaded', async () => {
    checkAuth(USER_ROLES.CUSTOMER);
    const user = getCurrentUser();
    await loadCustomerApplications(user.userId || user.customerId || user.id);
});

async function loadCustomerApplications(customerId) {
    const tbody = document.getElementById('applicationsTableBody');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Loading your applications...</td></tr>';

    const res = await BankLoanAPI.getMyApplications(customerId);

    if (res.result && Array.isArray(res.data) && res.data.length > 0) {
        tbody.innerHTML = res.data.map(app => `
            <tr>
                <td class="fw-semibold">#${app.applicationId || app.id || '-'}</td>
                <td>${app.fullName || '-'}</td>
                <td>${app.panCard || '-'}</td>
                <td>$${Number(app.annualIncome || 0).toLocaleString()}</td>
                <td><span class="badge ${getStatusBadge(app.applicationStatus || app.status)}">${app.applicationStatus || app.status || 'Pending'}</span></td>
                <td>${app.dateOfBirth ? new Date(app.dateOfBirth).toLocaleDateString() : '-'}</td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No loan applications found.</td></tr>';
    }
}

function getStatusBadge(status) {
    if (!status) return 'bg-secondary';
    switch (status.toLowerCase()) {
        case 'approved': return 'badge-status-approved';
        case 'rejected': return 'badge-status-rejected';
        case 'pending': return 'badge-status-pending';
        default: return 'bg-info text-dark';
    }
}

async function handleCheckStatusByPan(event) {
    event.preventDefault();
    const pan = document.getElementById('searchPan').value.trim();
    const status = document.getElementById('searchStatus').value;
    const resultBox = document.getElementById('searchResultBox');

    resultBox.innerHTML = '<div class="spinner-border spinner-border-sm text-primary"></div> Checking...';

    const res = await BankLoanAPI.checkApplicationStatus(pan, status);
    if (res.result && res.data) {
        resultBox.innerHTML = `
            <div class="alert alert-success mt-2 mb-0">
                <strong>Found:</strong> Status for PAN <code>${pan}</code> is <strong>${status}</strong>.
            </div>
        `;
    } else {
        resultBox.innerHTML = `
            <div class="alert alert-warning mt-2 mb-0">
                ${res.message || 'No matching record found for the provided PAN and Status.'}
            </div>
        `;
    }
}