
function getCurrentUser() {
    const raw = sessionStorage.getItem(STORAGE_KEYS.USER);
    try {
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function saveSession(userData) {
    sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
}

function checkAuth(requiredRole = null) {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    if (requiredRole && user.role !== requiredRole) {
        if (user.role === USER_ROLES.BANK_EMPLOYEE || user.role === USER_ROLES.ADMIN) {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'dashboard.html';
        }
    }
}

function logout() {
    sessionStorage.removeItem(STORAGE_KEYS.USER);
    sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
    window.location.href = 'index.html';
}

function displayAlert(message, type = 'danger') {
    const container = document.getElementById('alertContainer');
    if (!container) {
        alert(message);
        return;
    }
    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
}


async function handleLoginSubmit(event) {
    event.preventDefault();
    const submitBtn = document.getElementById('loginBtn');
    const userName = document.getElementById('userName').value.trim();
    const password = document.getElementById('password').value;

    if (!userName || !password) {
        displayAlert('Please enter your username and password.');
        return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Signing in...';

    const response = await BankLoanAPI.login(userName, password);
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Sign In';

    if (response.result && response.data) {
        saveSession(response.data);
        displayAlert('Login successful! Redirecting...', 'success');

        setTimeout(() => {
            const role = response.data.role;
            if (role === USER_ROLES.BANK_EMPLOYEE || role === USER_ROLES.ADMIN) {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }, 700);
    } else {
        displayAlert(response.message || 'Invalid username or password.');
    }
}

async function handleRegisterCustomerSubmit(event) {
    event.preventDefault();
    const btn = document.getElementById('regBtn');
    const form = event.target;

    const payload = {
        userName: form.userName.value.trim(),
        password: form.password.value,
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        role: USER_ROLES.CUSTOMER
    };

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Registering...';

    const response = await BankLoanAPI.registerCustomer(payload);
    btn.disabled = false;
    btn.innerHTML = 'Register';

    if (response.result) {
        displayAlert('Registration successful! You can now login.', 'success');
        form.reset();
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        displayAlert(response.message || 'Registration failed.');
    }
}