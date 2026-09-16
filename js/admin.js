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
    const tbody = document.getElementById('adminTableBody');
    if (!apps || apps.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">No records found.</td></tr>';
        return;
    }

    tbody.innerHTML = apps.map(app => {
        const appId = app.applicationId || app.id;
        const status = app.applicationStatus || app.status || 'Pending';
        const isPending = status.toLowerCase() === 'pending';

        return `
            <tr>
                <td class="fw-bold">#${appId}</td>
                <td>${app.fullName}</td>
                <td><code>${app.panCard}</code></td>
                <td>${app.employmentStatus}</td>
                <td><span class="badge bg-secondary">${app.creditScore}</span></td>
                <td>$${Number(app.annualIncome || 0).toLocaleString()}</td>
                <td><span class="badge ${getStatusClass(status)}">${status}</span></td>
                <td class="text-center">
                    ${isPending ? `
                        <button class="btn btn-success btn-sm me-1" onclick="changeStatus(${appId}, 'Approved')">
                            <i class="bi bi-check-lg"></i> Approve
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="changeStatus(${appId}, 'Rejected')">
                            <i class="bi bi-x-lg"></i> Reject
                        </button>
                    ` : `
                        <span class="text-muted small">Decided</span>
                    `}
                </td>
            </tr>
        `;
    }).join('');
}

async function changeStatus(appId, newStatus) {
    if (!confirm(`Are you sure you want to change Application #${appId} to ${newStatus}?`)) {
        return;
    }

    const res = await BankLoanAPI.updateApplicationStatus(appId, newStatus);
    if (res.result) {
        alert(res.message);
        
        if (document.getElementById('btnAssigned').classList.contains('active')) {
            await loadAssignedApplications();
        } else {
            await loadAllApplications();
        }
    } else {
        alert(res.message || 'Error updating status');
    }
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