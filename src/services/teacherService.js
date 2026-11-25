import api from "./api";

// GET ALL TEACHERS
export const getTeachers = async () => {
    const response = await api.get("/api/teachers");
    return response.data;
};

// SEARCH + PAGINATION + STATUS FILTER
export const searchTeachers = async ({
    keyword = "",
    status = "",
    page = 0,
    size = 10
}) => {
    const params = {
        keyword,
        page,
        size
    };

    if (status) {
        params.status = status;
    }

    const response = await api.get("/api/teachers/search", {
        params
    });

    return response.data;
};

// CREATE
export const createTeacher = async (teacherData) => {
    const response = await api.post("/api/teachers", teacherData);
    return response.data;
};

// UPDATE
export const updateTeacher = async (id, teacherData) => {
    const response = await api.put(
        `/api/teachers/${id}`,
        teacherData
    );

    return response.data;
};

// DELETE
export const deleteTeacher = async (id) => {
    await api.delete(`/api/teachers/${id}`);
};

// UPDATE STATUS
export const updateTeacherStatus = async (id, status) => {
    const response = await api.patch(
        `/api/teachers/${id}/status`,
        null,
        {
            params: {
                status
            }
        }
    );

    return response.data;
};

// FIND BY EMPLOYEE ID
export const getTeacherByEmployeeId = async (employeeId) => {
    const response = await api.get(
        `/api/teachers/employee/${employeeId}`
    );

    return response.data;
};

// FIND BY EMAIL
export const getTeacherByEmail = async (email) => {
    const response = await api.get(
        `/api/teachers/email/${email}`
    );

    return response.data;
};

// FIND BY PHONE
export const getTeacherByPhone = async (phone) => {
    const response = await api.get(
        `/api/teachers/phone/${phone}`
    );

    return response.data;
};