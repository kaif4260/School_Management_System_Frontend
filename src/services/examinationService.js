import api from "./api";

// GET ALL
export const getExaminations = async () => {
    const response = await api.get("/api/examinations");
    return response.data;
};

// SEARCH + PAGINATION
export const searchExaminations = async ({
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

    const response = await api.get(
        "/api/examinations/search",
        {
            params
        }
    );

    return response.data;
};

// GET BY ID
export const getExaminationById = async (id) => {
    const response = await api.get(
        `/api/examinations/${id}`
    );

    return response.data;
};

// GET BY ACADEMIC YEAR
export const getExaminationsByAcademicYear = async (
    academicYear
) => {
    const response = await api.get(
        `/api/examinations/academic-year/${academicYear}`
    );

    return response.data;
};

// GET BY STATUS
export const getExaminationsByStatus = async (
    status
) => {
    const response = await api.get(
        `/api/examinations/status/${status}`
    );

    return response.data;
};

// CREATE
export const createExamination = async (
    examinationData
) => {
    const response = await api.post(
        "/api/examinations",
        examinationData
    );

    return response.data;
};

// UPDATE
export const updateExamination = async (
    id,
    examinationData
) => {
    const response = await api.put(
        `/api/examinations/${id}`,
        examinationData
    );

    return response.data;
};

// UPDATE STATUS
export const updateExaminationStatus = async (
    id,
    status
) => {
    const response = await api.patch(
        `/api/examinations/${id}/status`,
        null,
        {
            params: {
                status
            }
        }
    );

    return response.data;
};

// DELETE
export const deleteExamination = async (id) => {
    await api.delete(
        `/api/examinations/${id}`
    );
};