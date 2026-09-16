document.addEventListener('DOMContentLoaded', () => {

    if (typeof requireAuth === 'function') {
        requireAuth(USER_ROLES.CUSTOMER);
    } else if (typeof checkAuth === 'function') {
        checkAuth(USER_ROLES.CUSTOMER);
    }

    const user = getCurrentUser();
    if (user) {
        if (user.email && document.getElementById('email')) {
            document.getElementById('email').value = user.email;
        }
        if (user.phone && document.getElementById('phone')) {
            document.getElementById('phone').value = user.phone;
        }
    }
});

async function handleLoanSubmit(event) {
    event.preventDefault();
    const btn = document.getElementById('submitBtn');
    const user = getCurrentUser();

    if (!user) {
        alert('Your session has expired. Please login again.');
        window.location.href = 'index.html';
        return;
    }

    
    const customerId = user.userId || user.customerId || user.id || 1;

  
    const dobVal = document.getElementById('dateOfBirth').value;
    let formattedDob = new Date().toISOString();
    if (dobVal) {
        formattedDob = new Date(dobVal).toISOString();
    }

    const payload = {
        fullName: document.getElementById('fullName').value.trim(),
        panCard: document.getElementById('panCard').value.trim().toUpperCase(),
        dateOfBirth: formattedDob,
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        city: document.getElementById('city').value.trim(),
        state: document.getElementById('state').value.trim(),
        zipCode: document.getElementById('zipCode').value.trim(),
        annualIncome: parseFloat(document.getElementById('annualIncome').value) || 0,
        employmentStatus: document.getElementById('employmentStatus').value,
        creditScore: parseInt(document.getElementById('creditScore').value, 10) || 700,
        assets: document.getElementById('assets') ? document.getElementById('assets').value.trim() : '',
        customerId: parseInt(customerId, 10),
        loansApplicantsLoan: []
    };

   
    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Submitting...';

    try {
        const res = await BankLoanAPI.addNewApplication(payload);
        btn.disabled = false;
        btn.innerHTML = originalText;

        if (res && res.result) {
            alert('Loan Application submitted successfully! Redirecting to your applications list...');
            document.getElementById('loanForm').reset();
            window.location.href = 'my-applications.html';
        } else {
            alert(res.message || 'Submission failed. Please check all fields.');
        }
    } catch (err) {
        btn.disabled = false;
        btn.innerHTML = originalText;
        alert('An error occurred during submission: ' + err.message);
    }
}