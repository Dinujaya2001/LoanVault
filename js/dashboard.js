document.addEventListener('DOMContentLoaded', async () => {
    checkAuth(USER_ROLES.CUSTOMER);
    const user = getCurrentUser();

    document.getElementById('navUserName').innerText = user.userName || 'User';
    document.getElementById('userName').innerText = user.userName || 'User';

    await loadSummary(user.userId || user.customerId || user.id);
});

async function loadSummary(customerId) {
    if (!customerId) return;
    const res = await BankLoanAPI.getMyApplications(customerId);

    if (res.result && Array.isArray(res.data)) {
        const apps = res.data;
        document.getElementById('totalApps').innerText = apps.length;

        const pending = apps.filter(a => a.applicationStatus === LOAN_STATUS.PENDING || a.status === LOAN_STATUS.PENDING).length;
        const approved = apps.filter(a => a.applicationStatus === LOAN_STATUS.APPROVED || a.status === LOAN_STATUS.APPROVED).length;

        document.getElementById('pendingApps').innerText = pending;
        document.getElementById('approvedApps').innerText = approved;
    }
}