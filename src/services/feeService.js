import api from "./api";

// ===============================
// FEE ASSIGNMENTS
// ===============================

export const getFeeAssignments = async () => {
    const response = await api.get("/api/fees");
    return response.data;
};

export const getFeeAssignmentById = async (id) => {
    const response = await api.get(`/api/fees/${id}`);
    return response.data;
};

export const getFeesByEnrollment = async (enrollmentId) => {
    const response = await api.get(
        `/api/fees/enrollment/${enrollmentId}`
    );
    return response.data;
};

export const getFeesByType = async (feeType) => {
    const response = await api.get(
        `/api/fees/type/${feeType}`
    );
    return response.data;
};

export const getFeeSummary = async (enrollmentId) => {
    const response = await api.get(
        `/api/fees/summary/enrollment/${enrollmentId}`
    );
    return response.data;
};

export const createFeeAssignment = async (feeData) => {
    const response = await api.post(
        "/api/fees",
        feeData
    );
    return response.data;
};


// ===============================
// FEE PAYMENTS
// ===============================

export const getFeePayments = async () => {
    const response = await api.get("/api/fee-payments");
    return response.data;
};

export const getFeePaymentById = async (id) => {
    const response = await api.get(
        `/api/fee-payments/${id}`
    );
    return response.data;
};

export const getPaymentsByAssignment = async (
    feeAssignmentId
) => {
    const response = await api.get(
        `/api/fee-payments/assignment/${feeAssignmentId}`
    );
    return response.data;
};

export const createFeePayment = async (paymentData) => {
    const response = await api.post(
        "/api/fee-payments",
        paymentData
    );
    return response.data;
};