
const defaultHeaders = {
    'Content-Type': 'application/json'
};

async function handleResponse(response) {
    try {
        const data = await response.json();
        return data;
    } catch (err) {
        return {
            result: false,
            message: 'Invalid JSON response from server',
            data: null
        };
    }
}

const BankLoanAPI = {
    
    login: async (userName, password) => {
        const res = await fetch(`${CONFIG.API_URL}/login`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify({ userName, password })
        });
        return handleResponse(res);
    },

    registerCustomer: async (customerData) => {
        const res = await fetch(`${CONFIG.API_URL}/RegisterCustomer`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify(customerData)
        });
        return handleResponse(res);
    },

    registerBankUser: async (employeeData) => {
        const res = await fetch(`${CONFIG.API_URL}/RegisterAsBankUser`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify(employeeData)
        });
        return handleResponse(res);
    },

    getAllUsers: async () => {
        const res = await fetch(`${CONFIG.API_URL}/GetAllUsers`, {
            method: 'GET',
            headers: defaultHeaders
        });
        return handleResponse(res);
    },

    updateUser: async (userData) => {
        const res = await fetch(`${CONFIG.API_URL}/UpdateUser`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify(userData)
        });
        return handleResponse(res);
    },

    deleteUser: async (userId) => {
        const res = await fetch(`${CONFIG.API_URL}/DeleteUserByUserId?userId=${userId}`, {
            method: 'DELETE',
            headers: defaultHeaders
        });
        return handleResponse(res);
    },

    // 2. Loan Applications
    addNewApplication: async (applicationData) => {
        const res = await fetch(`${CONFIG.API_URL}/AddNewApplication`, {
            method: 'POST',
            headers: defaultHeaders,
            body: JSON.stringify(applicationData)
        });
        return handleResponse(res);
    },

    getMyApplications: async (customerId) => {
        const res = await fetch(`${CONFIG.API_URL}/GetMyApplications?customerId=${customerId}`, {
            method: 'GET',
            headers: defaultHeaders
        });
        return handleResponse(res);
    },

    checkApplicationStatus: async (panCard, status) => {
        const res = await fetch(`${CONFIG.API_URL}/CheckApplicationStatus?panCard=${encodeURIComponent(panCard)}&status=${encodeURIComponent(status)}`, {
            method: 'GET',
            headers: defaultHeaders
        });
        return handleResponse(res);
    },

    getAllApplications: async () => {
        const res = await fetch(`${CONFIG.API_URL}/GetAllApplications`, {
            method: 'GET',
            headers: defaultHeaders
        });
        return handleResponse(res);
    },

    
    getAssignedApplications: async (bankEmployeeId) => {
        let res = await fetch(`${CONFIG.API_URL}/GetApplicationAssigneedToMe?bankEmployeeId=${bankEmployeeId}`, {
            method: 'GET',
            headers: defaultHeaders
        });
        if (res.status === 404) {
            res = await fetch(`${CONFIG.API_URL}/GetApplicationAssignedToMe?bankEmployeeId=${bankEmployeeId}`, {
                method: 'GET',
                headers: defaultHeaders
            });
        }
        return handleResponse(res);
    }
};