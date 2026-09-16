
const defaultUsers = [];

const defaultApps = [
    {
        applicationId: 101,
        fullName: "John Doe",
        panCard: "ABCDE1234F",
        dateOfBirth: "1990-05-15T00:00:00",
        email: "john@example.com",
        phone: "9876543210",
        address: "123 Main St",
        city: "Colombo",
        state: "Western",
        zipCode: "00100",
        annualIncome: 750000,
        employmentStatus: "Employed",
        creditScore: 750,
        assets: "Car, Property",
        customerId: 1,
        assignedEmployeeId: 2,
        applicationStatus: "Pending",
        loansApplicantsLoan: []
    }
];

function getStoredUsers() {
    const raw = localStorage.getItem('bank_loan_db_users');
    return raw ? JSON.parse(raw) : defaultUsers;
}

function saveStoredUsers(users) {
    localStorage.setItem('bank_loan_db_users', JSON.stringify(users));
}

function getStoredApps() {
    const raw = localStorage.getItem('bank_loan_db_applications');
    return raw ? JSON.parse(raw) : defaultApps;
}

function saveStoredApps(apps) {
    localStorage.setItem('bank_loan_db_applications', JSON.stringify(apps));
}

if (!localStorage.getItem('bank_loan_db_users')) saveStoredUsers(defaultUsers);
if (!localStorage.getItem('bank_loan_db_applications')) saveStoredApps(defaultApps);


const BankLoanAPI = {
    
    assignToOfficer: async (applicationId, bankEmployeeId) => {
        if (CONFIG.USE_LOCAL_MOCK_API) {
            const apps = getStoredApps();
            const index = apps.findIndex(a => (a.applicationId || a.id) === Number(applicationId));
            if (index !== -1) {
                apps[index].assignedEmployeeId = Number(bankEmployeeId);
                saveStoredApps(apps);
                return { result: true, message: `Application #${applicationId} assigned to you!`, data: apps[index] };
            }
            return { result: false, message: "Application not found.", data: null };
        }

        const res = await fetch(`${CONFIG.API_URL}/AssignApplication`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId, bankEmployeeId })
        });
        return await res.json();
    },
    
    registerCustomer: async (customerData) => {
        if (CONFIG.USE_LOCAL_MOCK_API) {
            const users = getStoredUsers();
            const exists = users.some(u => u.userName.toLowerCase() === customerData.userName.toLowerCase());
            if (exists) {
                return { result: false, message: "Username already exists.", data: null };
            }
            const newUser = {
                userId: Date.now(),
                ...customerData,
                role: "Customer"
            };
            users.push(newUser);
            saveStoredUsers(users);
            return { result: true, message: "Customer registered successfully!", data: newUser };
        }

        const res = await fetch(`${CONFIG.API_URL}/RegisterCustomer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(customerData)
        });
        return await res.json();
    },

   
    registerBankUser: async (employeeData) => {
        if (CONFIG.USE_LOCAL_MOCK_API) {
            const users = getStoredUsers();
            const exists = users.some(u => u.userName.toLowerCase() === employeeData.userName.toLowerCase());
            if (exists) {
                return { result: false, message: "Username already exists.", data: null };
            }
            const newEmp = {
                userId: Date.now(),
                ...employeeData,
                role: "BankEmployee"
            };
            users.push(newEmp);
            saveStoredUsers(users);
            return { result: true, message: "Bank employee registered successfully!", data: newEmp };
        }

        const res = await fetch(`${CONFIG.API_URL}/RegisterAsBankUser`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(employeeData)
        });
        return await res.json();

        
    },

    
    login: async (userName, password) => {
        if (CONFIG.USE_LOCAL_MOCK_API) {
            const users = getStoredUsers();
            const user = users.find(u => u.userName.toLowerCase() === userName.toLowerCase() && u.password === password);
            if (user) {
                const userCopy = { ...user };
                delete userCopy.password;
                return { result: true, message: "Login successful!", data: userCopy };
            }
            return { result: false, message: "Invalid username or password.", data: null };
        }

        const res = await fetch(`${CONFIG.API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName, password })
        });
        return await res.json();
    },

    
    addNewApplication: async (applicationData) => {
        if (CONFIG.USE_LOCAL_MOCK_API) {
            const apps = getStoredApps();
            const newApp = {
                applicationId: Math.floor(100 + Math.random() * 900),
                ...applicationData,
                applicationStatus: "Pending",
                assignedEmployeeId: 2,
                createdAt: new Date().toISOString()
            };
            apps.unshift(newApp);
            saveStoredApps(apps);
            return { result: true, message: "Loan application submitted successfully!", data: newApp };
        }

        const res = await fetch(`${CONFIG.API_URL}/AddNewApplication`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(applicationData)
        });
        return await res.json();
    },

    
    getMyApplications: async (customerId) => {
        if (CONFIG.USE_LOCAL_MOCK_API) {
            const apps = getStoredApps().filter(a => Number(a.customerId) === Number(customerId));
            return { result: true, message: "Applications retrieved", data: apps };
        }

        const res = await fetch(`${CONFIG.API_URL}/GetMyApplications?customerId=${customerId}`);
        return await res.json();
    },

   
    checkApplicationStatus: async (panCard, status) => {
        if (CONFIG.USE_LOCAL_MOCK_API) {
            const apps = getStoredApps();
            const found = apps.find(a => 
                a.panCard.toUpperCase() === panCard.trim().toUpperCase() && 
                (a.applicationStatus || '').toLowerCase() === status.trim().toLowerCase()
            );
            if (found) {
                return { result: true, message: "Matching application found", data: found };
            }
            return { result: false, message: "No matching application found for provided PAN and status.", data: null };
        }

        const res = await fetch(`${CONFIG.API_URL}/CheckApplicationStatus?panCard=${encodeURIComponent(panCard)}&status=${encodeURIComponent(status)}`);
        return await res.json();
    },

    
    getAllApplications: async () => {
        if (CONFIG.USE_LOCAL_MOCK_API) {
            const apps = getStoredApps();
            return { result: true, message: "All applications retrieved", data: apps };
        }

        const res = await fetch(`${CONFIG.API_URL}/GetAllApplications`);
        return await res.json();
    },

    
    getAssignedApplications: async (bankEmployeeId) => {
        if (CONFIG.USE_LOCAL_MOCK_API) {
            const apps = getStoredApps().filter(a => Number(a.assignedEmployeeId) === Number(bankEmployeeId));
            return { result: true, message: "Assigned applications retrieved", data: apps };
        }

        const res = await fetch(`${CONFIG.API_URL}/GetApplicationAssigneedToMe?bankEmployeeId=${bankEmployeeId}`);
        return await res.json();
    },

    
    updateApplicationStatus: async (applicationId, newStatus) => {
        if (CONFIG.USE_LOCAL_MOCK_API) {
            const apps = getStoredApps();
            const index = apps.findIndex(a => (a.applicationId || a.id) === Number(applicationId));
            if (index !== -1) {
                apps[index].applicationStatus = newStatus;
                saveStoredApps(apps);
                return { result: true, message: `Application #${applicationId} marked as ${newStatus}!`, data: apps[index] };
            }
            return { result: false, message: "Application not found.", data: null };
        }

        const res = await fetch(`${CONFIG.API_URL}/UpdateApplicationStatus`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ applicationId, status: newStatus })
        });
        return await res.json();
    }
};