import api from "./api";

// GET ALL STUDENTS
export const getStudents = async () => {
    const response = await api.get("/api/students");
    return response.data;
};

// SEARCH + PAGINATION
export const searchStudents = async ({
    keyword = "",
    page = 0,
    size = 10
}) => {
    const response = await api.get("/api/students/search", {
        params: {
            keyword,
            page,
            size
        }
    });

    return response.data;
};

// CREATE
export const createStudent = async (studentData) => {
    const response = await api.post(
        "/api/students",
        studentData
    );

    return response.data;
};

// UPDATE
export const updateStudent = async (id, studentData) => {
    const response = await api.put(
        `/api/students/${id}`,
        studentData
    );

    return response.data;
};

// DELETE
export const deleteStudent = async (id) => {
    await api.delete(`/api/students/${id}`);
};