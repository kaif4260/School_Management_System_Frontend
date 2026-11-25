import api from "./api";

// GET ALL
export const getClasses = async () => {
    const response = await api.get("/api/classes");
    return response.data;
};

// SEARCH + PAGINATION + FILTER
export const searchClasses = async ({
    name = "",
    status = "",
    page = 0,
    size = 10
}) => {

    const params = {
        name,
        page,
        size
    };

    if (status) {
        params.status = status;
    }

    const response = await api.get(
        "/api/classes/search",
        { params }
    );

    return response.data;
};

// CREATE
export const createClass = async (classData) => {
    const response = await api.post(
        "/api/classes",
        classData
    );

    return response.data;
};

// UPDATE
export const updateClass = async (id, classData) => {
    const response = await api.put(
        `/api/classes/${id}`,
        classData
    );

    return response.data;
};

// DELETE
export const deleteClass = async (id) => {
    await api.delete(`/api/classes/${id}`);
};

// UPDATE STATUS
export const updateClassStatus = async (id, status) => {
    const response = await api.patch(
        `/api/classes/${id}/status`,
        null,
        {
            params: {
                status: status
            }
        }
    );

    return response.data;
};