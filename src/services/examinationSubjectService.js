import api from "./api";

export const getExaminationSubjects = async () =>
(await api.get("/api/examination-subjects")).data;

export const getExaminationSubjectOptions = async (examinationId, classId) =>
(
await api.get(
`/api/examination-subjects/examination/${examinationId}/class/${classId}`
)
).data;

export const getExaminationOptions = async () =>
(await api.get("/api/examinations")).data;

export const getSubjectOptions = async () =>
(await api.get("/api/subjects")).data;

export const getClassOptions = async () =>
(await api.get("/api/classes")).data;

export const createExaminationSubject = async (request) =>
(await api.post("/api/examination-subjects", request)).data;

export const deleteExaminationSubject = async (id) =>
(await api.delete(`/api/examination-subjects/${id}`)).data;
