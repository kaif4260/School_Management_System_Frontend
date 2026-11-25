import api from "./api";

// GET ALL TIMETABLES
export const getTimetables = async () => {
    const response = await api.get("/api/timetables");
    return response.data;
};

// GET TIMETABLE BY ID
export const getTimetableById = async (id) => {
    const response = await api.get(`/api/timetables/${id}`);
    return response.data;
};

// GET BY CLASS
export const getTimetablesByClass = async (classId) => {
    const response = await api.get(`/api/timetables/class/${classId}`);
    return response.data;
};

// GET BY SECTION
export const getTimetablesBySection = async (sectionId) => {
    const response = await api.get(`/api/timetables/section/${sectionId}`);
    return response.data;
};

// GET BY TEACHER
export const getTimetablesByTeacher = async (teacherId) => {
    const response = await api.get(`/api/timetables/teacher/${teacherId}`);
    return response.data;
};

// GET BY DAY
export const getTimetablesByDay = async (dayOfWeek) => {
    const response = await api.get(`/api/timetables/day/${dayOfWeek}`);
    return response.data;
};

// GET BY SECTION + DAY
export const getTimetablesBySectionAndDay = async (
    sectionId,
    dayOfWeek
) => {
    const response = await api.get(
        `/api/timetables/section/${sectionId}/day/${dayOfWeek}`
    );

    return response.data;
};

// CREATE TIMETABLE
export const createTimetable = async (data) => {
    const response = await api.post("/api/timetables", data);
    return response.data;
};

// UPDATE TIMETABLE
export const updateTimetable = async (id, data) => {
    const response = await api.put(`/api/timetables/${id}`, data);
    return response.data;
};

// DELETE TIMETABLE
export const deleteTimetable = async (id) => {
    const response = await api.delete(`/api/timetables/${id}`);
    return response.data;
};