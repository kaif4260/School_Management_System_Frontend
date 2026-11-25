import api from "./api";

// GET ALL
export const getSections = async () => {
    const response = await api.get("/api/sections");
    return response.data;
};

// SEARCH + PAGINATION + FILTERS
export const searchSections = async ({
    name = "",
    classId = "",
    status = "",
    page = 0,
    size = 10
}) => {

    const params = {
        name,
        page,
        size
    };

    if (classId) {
        params.classId = classId;
    }

    if (status) {
        params.status = status;
    }

    const response = await api.get(
        "/api/sections/search",
        { params }
    );

    return response.data;
};

// CREATE
export const createSection = async (sectionData) => {
    const response = await api.post(
        "/api/sections",
        sectionData
    );

    return response.data;
};

// UPDATE
export const updateSection = async (
    id,
    sectionData
) => {
    const response = await api.put(
        `/api/sections/${id}`,
        sectionData
    );

    return response.data;
};

// DELETE
export const deleteSection = async (id) => {
    await api.delete(`/api/sections/${id}`);
};

// UPDATE STATUS
export const updateSectionStatus = async (
    id,
    status
) => {
    const response = await api.patch(
        `/api/sections/${id}/status`,
        null,
        {
            params: {
                status: status
            }
        }
    );

    return response.data;
};

// GET SECTIONS BY CLASS
export const getSectionsByClass = async (
    classId
) => {
    const response = await api.get(
        `/api/sections/class/${classId}`
    );

    return response.data;
};