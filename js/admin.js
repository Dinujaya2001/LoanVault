document.addEventListener('DOMContentLoaded', async () => {
    checkAuth(USER_ROLES.BANK_EMPLOYEE);
    const user = getCurrentUser();
    document.getElementById('empName').innerText = user.userName || 'Employee';

    await loadAllApplications();
});

async function loadAllApplications() {
    const tbody = document.getElementById('adminAppTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Fetching all bank applications...</td></tr>';

    const res = await BankLoanAPI.getAllApplications();

    if (res.result && Array.isArray(res.data)) {
        renderTable(res.data);
    } else {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">${res.message || 'No applications available.'}</td></tr>`;
    }
}

async function loadAssignedToMe() {
    const user = getCurrentUser();
    const empId = user.userId || user.id;
    const tbody = document.getElementById('adminAppTableBody');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4">Fetching assigned applications...</td></tr>';

    const res = await BankLoanAPI.getAssignedApplications(empId);

    if (res.result && Array.isArray(res.data)) {
        renderTable(res.data);
    } else {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">${res.message || 'No assigned applications found.'}</td></tr>`;
    }
}

function renderTable(apps) {
    const tbody = document.getElementById('adminAppTableBody');
    if (!apps || apps.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No applications to display.</td></tr>';
        return;
    }

    tbody.innerHTML = apps.map(app => `
        <tr>
            <td class="fw-bold">#${app.applicationId || app.id || '-'}</td>
            <td>${app.fullName || '-'}</td>
            <td>${app.panCard || '-'}</td>
            <td>${app.employmentStatus || '-'}</td>
            <td><span class="badge bg-secondary">${app.creditScore || 'N/A'}</span></td>
            <td>$${Number(app.annualIncome || 0).toLocaleString()}</td>
            <td><span class="badge ${getStatusBadge(app.applicationStatus || app.status)}">${app.applicationStatus || app.status || 'Pending'}</span></td>
        </tr>
    `).join('');
}

function getStatusBadge(status) {
    if (!status) return 'bg-secondary';
    switch (status.toLowerCase()) {
        case 'approved': return 'bg-success';
        case 'rejected': return 'bg-danger';
        case 'pending': return 'bg-warning text-dark';
        default: return 'bg-info text-dark';
    }
}