document.addEventListener('DOMContentLoaded', async () => {
    if (typeof checkAuth === 'function') checkAuth(USER_ROLES.CUSTOMER);
    else if (typeof requireAuth === 'function') requireAuth(USER_ROLES.CUSTOMER);

    const user = getCurrentUser();
    if (user) {
        document.getElementById('navUser').innerText = user.userName || 'Customer';
        document.getElementById('welcomeUser').innerText = user.userName || 'Customer';
        await loadAnalytics(user.userId || user.customerId || user.id);
    }
});

async function loadAnalytics(customerId) {
    const res = await BankLoanAPI.getMyApplications(customerId);
    const apps = res.data || [];

    const pending = apps.filter(a => (a.applicationStatus || a.status || '').toLowerCase() === 'pending').length;
    const approved = apps.filter(a => (a.applicationStatus || a.status || '').toLowerCase() === 'approved').length;
    const rejected = apps.filter(a => (a.applicationStatus || a.status || '').toLowerCase() === 'rejected').length;

    document.getElementById('statTotal').innerText = apps.length;
    document.getElementById('statPending').innerText = pending;
    document.getElementById('statApproved').innerText = approved;

    
    const ctxStatus = document.getElementById('statusChart').getContext('2d');
    new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
            labels: ['Approved', 'Pending', 'Rejected'],
            datasets: [{
                data: [approved, pending, rejected],
                backgroundColor: ['#2dd4bf', '#facc15', '#f87171'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color: '#ffffff' } }
            }
        }
    });

    
    const ctxIncome = document.getElementById('incomeChart').getContext('2d');
    const appLabels = apps.map(a => `#${a.applicationId || a.id}`);
    const incomes = apps.map(a => a.annualIncome || 0);

    new Chart(ctxIncome, {
        type: 'bar',
        data: {
            labels: appLabels.length ? appLabels : ['No Apps'],
            datasets: [{
                label: 'Annual Income (LKR)',
                data: incomes.length ? incomes : [0],
                backgroundColor: '#00897b',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { color: '#ffffff' } },
                y: { ticks: { color: '#ffffff' } }
            },
            plugins: {
                legend: { labels: { color: '#ffffff' } }
            }
        }
    });
}