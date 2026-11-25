import api from "./api";

export const getStudents = async () => {
    const response = await api.get("/api/students");

    return response.data;
};

export const getTeachers = async () => {

    const response = await api.get("/api/teachers");

    return response.data;
};

export const getClasses = async () => {

    const response = await api.get("/api/classes");

    return response.data;
};

export const getSubjects = async () => {

    const response = await api.get("/api/subjects");

    return response.data;
};