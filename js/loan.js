document.addEventListener('DOMContentLoaded', () => {
    checkAuth(USER_ROLES.CUSTOMER);
    const user = getCurrentUser();
    if (user && user.email) {
        document.getElementById('email').value = user.email;
    }
});

async function submitLoanApplication(event) {
    event.preventDefault();
    const user = getCurrentUser();
    const btn = document.getElementById('submitAppBtn');

    const customerId = user.userId || user.customerId || user.id;

    const payload = {
        fullName: document.getElementById('fullName').value.trim(),
        panCard: document.getElementById('panCard').value.trim().toUpperCase(),
        dateOfBirth: new Date(document.getElementById('dateOfBirth').value).toISOString(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        zipCode: document.getElementById('zipCode').value.trim(),
        annualIncome: parseFloat(document.getElementById('annualIncome').value) || 0,
        employmentStatus: document.getElementById('employmentStatus').value,
        creditScore: parseInt(document.getElementById('creditScore').value, 10) || 300,
        assets: document.getElementById('assets').value.trim(),
        customerId: parseInt(customerId, 10),
        loansApplicantsLoan: []
    };

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Submitting...';

    const res = await BankLoanAPI.addNewApplication(payload);
    btn.disabled = false;
    btn.innerHTML = 'Submit Application';

    if (res.result) {
        displayAlert('Loan Application submitted successfully!', 'success');
        document.getElementById('loanForm').reset();
        setTimeout(() => {
            window.location.href = 'my-applications.html';
        }, 1500);
    } else {
        displayAlert(res.message || 'Error submitting application.');
    }
}