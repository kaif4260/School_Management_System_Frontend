import api from "./api";

// GET ALL ENROLLMENTS
export const getAllEnrollments = async () => {
    const response = await api.get("/api/enrollments");
    return response.data;
};

// GET ALL STUDENTS
export const getAllStudents = async () => {
    const response = await api.get("/api/students");
    return response.data;
};

// GET ALL CLASSES
export const getAllClasses = async () => {
    const response = await api.get("/api/classes");
    return response.data;
};

// GET ALL SECTIONS
export const getAllSections = async () => {
    const response = await api.get("/api/sections");
    return response.data;
};

// GET ALL EXAMINATIONS
export const getAllExaminations = async () => {
    const response = await api.get("/api/examinations");
    return response.data;
};

// GET RESULT
export const getStudentResult = async (
    enrollmentId,
    examinationId
) => {
    const response = await api.get(
        `/api/results/enrollment/${enrollmentId}/examination/${examinationId}`
    );

    return response.data;
};

// PUBLISH A STUDENT'S RESULT - ADMIN ONLY
export const publishStudentResult = async (enrollmentId, examinationId) => {
    const response = await api.post(
        `/api/results/enrollment/${enrollmentId}/examination/${examinationId}/publish`
    );

    return response.data;
};

// GET LOGGED-IN STUDENT'S ENROLLMENTS
export const getMyEnrollments = async () => {
    const response = await api.get("/api/enrollments/me");
    return response.data;
};