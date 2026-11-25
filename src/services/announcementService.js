import api from "./api";

// GET ALL ANNOUNCEMENTS — Admin
export const getAllAnnouncements = async () => {
    const response = await api.get("/api/announcements");
    return response.data;
};

// GET ANNOUNCEMENT BY ID
export const getAnnouncementById = async (id) => {
    const response = await api.get(`/api/announcements/${id}`);
    return response.data;
};

// GET PUBLISHED ANNOUNCEMENTS
export const getPublishedAnnouncements = async () => {
    const response = await api.get("/api/announcements/published");
    return response.data;
};

// GET ANNOUNCEMENTS BY AUDIENCE
export const getAnnouncementsByAudience = async (audience) => {
    const response = await api.get(
        `/api/announcements/audience/${audience}`
    );
    return response.data;
};

// GET PUBLISHED ANNOUNCEMENTS BY AUDIENCE
export const getPublishedAnnouncementsByAudience = async (audience) => {
    const response = await api.get(
        `/api/announcements/published/audience/${audience}`
    );
    return response.data;
};

// CREATE ANNOUNCEMENT
export const createAnnouncement = async (announcement) => {
    const response = await api.post(
        "/api/announcements",
        announcement
    );
    return response.data;
};

// UPDATE ANNOUNCEMENT
export const updateAnnouncement = async (id, announcement) => {
    const response = await api.put(
        `/api/announcements/${id}`,
        announcement
    );
    return response.data;
};

// PUBLISH ANNOUNCEMENT
export const publishAnnouncement = async (id) => {
    const response = await api.put(
        `/api/announcements/${id}/publish`
    );
    return response.data;
};

// UNPUBLISH ANNOUNCEMENT
export const unpublishAnnouncement = async (id) => {
    const response = await api.put(
        `/api/announcements/${id}/unpublish`
    );
    return response.data;
};

// DELETE ANNOUNCEMENT
export const deleteAnnouncement = async (id) => {
    const response = await api.delete(
        `/api/announcements/${id}`
    );
    return response.data;
};


export const uploadAnnouncementAttachment = (id, file) => {
    const formData = new FormData();
    formData.append("file", file);

    return api.post(
        `/api/announcements/${id}/attachment`,
        formData,
        {
            headers: {
                "Content-Type": undefined
            }
        }
    );
};
