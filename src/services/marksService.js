import api from "./api";

// Get enrollments
export const getMarksEnrollments = async () => {
    const response = await api.get("/api/enrollments");
    return response.data;
};

// Get students
export const getMarksStudents = async () => {
    const response = await api.get("/api/students");
    return response.data;
};

// Get classes
export const getMarksClasses = async () => {
    const response = await api.get("/api/classes");
    return response.data;
};

// Get sections
export const getMarksSections = async () => {
    const response = await api.get("/api/sections");
    return response.data;
};

// Get examinations
export const getMarksExaminations = async () => {
    const response = await api.get("/api/examinations");
    return response.data;
};

// Get subjects configured for an examination and class
export const getExaminationSubjects = async (
    examinationId,
    classId
) => {
    const response = await api.get(
        `/api/examination-subjects/examination/${examinationId}/class/${classId}`
    );

    return response.data;
};

// Get existing marks for a selected examination subject
export const getMarksByExaminationSubject = async (
    examinationSubjectId
) => {
    const response = await api.get(
        `/api/student-marks/examination-subject/${examinationSubjectId}`
    );

    return response.data;
};

// Create marks
export const createStudentMarks = async (request) => {
    const response = await api.post(
        "/api/student-marks",
        request
    );

    return response.data;
};

// Update existing marks
export const updateStudentMarks = async (id, request) => {
    const response = await api.put(
        `/api/student-marks/${id}`,
        request
    );

    return response.data;
};