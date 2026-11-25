import api from "./api";

// Fetch all enrollments
export const getAllEnrollments = async () => {
const response = await api.get("/enrollments");
return response.data;
};

// Create an enrollment
export const createEnrollment = async (enrollmentData) => {
const response = await api.post("/enrollments", enrollmentData);
return response.data;
};

// Fetch enrollments for a particular student
export const getEnrollmentsByStudent = async (studentId) => {
const response = await api.get(`/enrollments/student/${studentId}`);
return response.data;
};

// Update enrollment status
export const updateEnrollmentStatus = async (id, status) => {
const response = await api.patch(
`/enrollments/${id}/status`,
null,
{ params: { status } }
);

return response.data;

};

// Delete an enrollment
export const deleteEnrollment = async (id) => {
const response = await api.delete(`/enrollments/${id}`);
return response.data;
};
