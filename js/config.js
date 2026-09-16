
const CONFIG = {
    
    BASE_URL: 'https://api.freeapi.app',
    API_PATH: '/api/BankLoan',

    get API_URL() {
        return this.BASE_URL + this.API_PATH;
    }
};

const STORAGE_KEYS = {
    USER: 'bank_loan_user',
    TOKEN: 'bank_loan_token'
};

const USER_ROLES = {
    CUSTOMER: 'Customer',
    BANK_EMPLOYEE: 'BankEmployee',
    ADMIN: 'Admin'
};

const LOAN_STATUS = {
    PENDING: 'Pending',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    UNDER_REVIEW: 'UnderReview'
};