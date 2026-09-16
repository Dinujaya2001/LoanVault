
const API_BASE = 'https://your-api-domain.com/api';
const HEADERS = {
    'Content-Type': 'application/json'
};


async function apiGet(path) {
    try {
        const res = await fetch(API_BASE + path, {
            method: 'GET',
            headers: HEADERS
        });
        return await res.json();
    } catch (err) {
        console.error('GET Error:', err);
        return { result: false, message: 'Network error' };
    }
}

async function apiPost(path, body) {
    try {
        const res = await fetch(API_BASE + path, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(body)
        });
        return await res.json();
    } catch (err) {
        console.error('POST Error:', err);
        return { result: false, message: 'Network error' };
    }
}

async function apiPut(path, body) {
    try {
        const res = await fetch(API_BASE + path, {
            method: 'PUT',
            headers: HEADERS,
            body: JSON.stringify(body)
        });
        return await res.json();
    } catch (err) {
        console.error('PUT Error:', err);
        return { result: false, message: 'Network error' };
    }
}

async function apiDelete(path) {
    try {
        const res = await fetch(API_BASE + path, {
            method: 'DELETE',
            headers: HEADERS
        });
        return await res.json();
    } catch (err) {
        console.error('DELETE Error:', err);
        return { result: false, message: 'Network error' };
    }
}


function showAlert(type, message, containerId = 'alertBox') {
    const box = document.getElementById(containerId);
    if (!box) return;
    box.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;
    setTimeout(() => { box.innerHTML = ''; }, 4000);
}


function getCurrentUser() {
    const user = sessionStorage.getItem('bankUser');
    return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
    sessionStorage.setItem('bankUser', JSON.stringify(user));
}

function logout() {
    sessionStorage.removeItem('bankUser');
    window.location.href = 'login.html';
}

function requireAuth(role = null) {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    if (role && user.role !== role && user.userType !== role) {
        alert('Access denied');
        window.location.href = 'login.html';
        return null;
    }
    return user;
}