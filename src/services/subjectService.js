import api from "./api";

export const getSubjects = async () => {
    const response = await api.get("/api/subjects");
    return response.data;
};

export const searchSubjects = async ({
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

    const response = await api.get("/api/subjects/search", {
        params
    });

    return response.data;
};

export const createSubject = async (subjectData) => {
    const response = await api.post(
        "/api/subjects",
        subjectData
    );

    return response.data;
};

export const updateSubject = async (id, subjectData) => {
    const response = await api.put(
        `/api/subjects/${id}`,
        subjectData
    );

    return response.data;
};

export const deleteSubject = async (id) => {
    await api.delete(`/api/subjects/${id}`);
};

export const updateSubjectStatus = async (id, status) => {
    const response = await api.patch(
        `/api/subjects/${id}/status`,
        null,
        {
            params: { status }
        }
    );

    return response.data;
};

export const getSubjectById = async (id) => {
    const response = await api.get(
        `/api/subjects/${id}`
    );

    return response.data;
};

export const getSubjectByCode = async (code) => {
    const response = await api.get(
        `/api/subjects/code/${code}`
    );

    return response.data;
};

export const getSubjectByName = async (name) => {
    const response = await api.get(
        `/api/subjects/name/${name}`
    );

    return response.data;
};