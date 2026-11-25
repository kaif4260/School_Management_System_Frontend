import api from "./api";

export const getMarksStatus = async (
    examinationSubjectId,
    sectionId
) => {
    const params = { examinationSubjectId };

    if (sectionId) {
        params.sectionId = sectionId;
    }

    return (
        await api.get("/api/student-marks/status", { params })
    ).data;
};
