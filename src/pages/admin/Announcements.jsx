import { useCallback, useEffect, useMemo, useState } from "react";

import {
    getAllAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    uploadAnnouncementAttachment,
    publishAnnouncement,
    unpublishAnnouncement,
    deleteAnnouncement
} from "../../services/announcementService";

import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";

import "./Announcements.css";

const INITIAL_FORM = {
    title: "",
    description: "",
    targetAudience: "ALL"
};

const MAX_PDF_SIZE = 5 * 1024 * 1024;

const getErrorMessage = (error, fallback) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        fallback
    );
};

const formatDate = (dateValue) => {
    if (!dateValue) {
        return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

const Announcements = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [form, setForm] = useState(INITIAL_FORM);
    const [editingId, setEditingId] = useState(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [fileInputKey, setFileInputKey] = useState(0);

    const [search, setSearch] = useState("");
    const [audienceFilter, setAudienceFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionId, setActionId] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadAnnouncements = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getAllAnnouncements();
            console.log("Published announcements:", data);
            console.log("First announcement:", data?.[0]);
                        setAnnouncements(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load announcements:", err);

            setError(
                getErrorMessage(
                    err,
                    "Unable to load announcements. Please try again."
                )
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAnnouncements();
    }, [loadAnnouncements]);

    const filteredAnnouncements = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return announcements.filter((announcement) => {
            const matchesSearch =
                !keyword ||
                announcement.title?.toLowerCase().includes(keyword) ||
                announcement.description?.toLowerCase().includes(keyword);

            const matchesAudience =
                audienceFilter === "ALL" ||
                announcement.targetAudience === audienceFilter;

            const isPublished = Boolean(announcement.published);

            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "PUBLISHED" && isPublished) ||
                (statusFilter === "UNPUBLISHED" && !isPublished);

            return (
                matchesSearch &&
                matchesAudience &&
                matchesStatus
            );
        });
    }, [announcements, search, audienceFilter, statusFilter]);

    const resetForm = () => {
        setForm(INITIAL_FORM);
        setEditingId(null);
        setSelectedFile(null);
        setFileInputKey((key) => key + 1);
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;

        setForm((previousForm) => ({
            ...previousForm,
            [name]: value
        }));
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0] || null;

        setError("");
        setSuccess("");

        if (!file) {
            setSelectedFile(null);
            return;
        }

        if (!file.name.toLowerCase().endsWith(".pdf")) {
            setError("Only PDF files are allowed.");
            setSelectedFile(null);
            setFileInputKey((key) => key + 1);
            return;
        }

        if (file.size > MAX_PDF_SIZE) {
            setError("The PDF cannot exceed 5 MB.");
            setSelectedFile(null);
            setFileInputKey((key) => key + 1);
            return;
        }

        setSelectedFile(file);
    };

    const handleEdit = (announcement) => {
        setForm({
            title: announcement.title || "",
            description: announcement.description || "",
            targetAudience: announcement.targetAudience || "ALL"
        });

        setEditingId(announcement.id);
        setSelectedFile(null);
        setFileInputKey((key) => key + 1);

        setError("");
        setSuccess("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const payload = {
            title: form.title.trim(),
            description: form.description.trim(),
            targetAudience: form.targetAudience
        };

        if (!payload.title || !payload.description) {
            setError("Please enter both a title and description.");
            return;
        }

        if (selectedFile) {
            if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
                setError("Only PDF files are allowed.");
                return;
            }

            if (selectedFile.size > MAX_PDF_SIZE) {
                setError("The PDF cannot exceed 5 MB.");
                return;
            }
        }

        setSaving(true);

        try {
            let savedAnnouncement;

            if (editingId !== null) {
                savedAnnouncement = await updateAnnouncement(
                    editingId,
                    payload
                );
            } else {
                savedAnnouncement = await createAnnouncement(payload);
            }

            if (selectedFile) {
                try {
                    await uploadAnnouncementAttachment(
                        savedAnnouncement.id,
                        selectedFile
                    );
                } catch (uploadError) {
                    console.error(
                        "Announcement saved, but PDF upload failed:",
                        uploadError
                    );

                    setEditingId(savedAnnouncement.id);

                    setError(
                        getErrorMessage(
                            uploadError,
                            "The announcement was saved, but the PDF upload failed. Please try again."
                        )
                    );

                    await loadAnnouncements();
                    return;
                }
            }

            setSuccess(
                selectedFile
                    ? "Announcement saved and PDF uploaded successfully."
                    : editingId !== null
                        ? "Announcement updated successfully."
                        : "Announcement created successfully."
            );

            resetForm();
            await loadAnnouncements();
        } catch (err) {
            console.error("Failed to save announcement:", err);

            setError(
                getErrorMessage(
                    err,
                    "Unable to save the announcement. Please try again."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    const handlePublishToggle = async (announcement) => {
        setError("");
        setSuccess("");
        setActionId(announcement.id);

        try {
            if (announcement.published) {
                await unpublishAnnouncement(announcement.id);
                setSuccess("Announcement unpublished successfully.");
            } else {
                await publishAnnouncement(announcement.id);
                setSuccess("Announcement published successfully.");
            }

            await loadAnnouncements();
        } catch (err) {
            console.error("Failed to change announcement status:", err);

            setError(
                getErrorMessage(
                    err,
                    "Unable to update announcement status. Please try again."
                )
            );
        } finally {
            setActionId(null);
        }
    };

    const handleDelete = async (announcement) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${announcement.title}"?`
        );

        if (!confirmed) {
            return;
        }

        setError("");
        setSuccess("");
        setActionId(announcement.id);

        try {
            await deleteAnnouncement(announcement.id);

            if (editingId === announcement.id) {
                resetForm();
            }

            setSuccess("Announcement deleted successfully.");
            await loadAnnouncements();
        } catch (err) {
            console.error("Failed to delete announcement:", err);

            setError(
                getErrorMessage(
                    err,
                    "Unable to delete announcement. Please try again."
                )
            );
        } finally {
            setActionId(null);
        }
    };

    const editingAnnouncement = announcements.find(
        (announcement) => announcement.id === editingId
    );

    return (
        <>
        <Navbar />
        
        <div className="dashboard-layout">
            <Sidebar />

            <div className="dashboard-main">
                <main className="dashboard-content announcements-page">
                    <div className="page-header">
                        <div>
                            <h1>Announcements</h1>
                            <p>
                                Create, manage, and publish school announcements.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="announcement-alert announcement-alert-error">
                            <span>{error}</span>

                            <button
                                type="button"
                                onClick={() => setError("")}
                                aria-label="Dismiss error"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {success && (
                        <div className="announcement-alert announcement-alert-success">
                            <span>{success}</span>

                            <button
                                type="button"
                                onClick={() => setSuccess("")}
                                aria-label="Dismiss success message"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {/* Create / Edit Announcement */}
                    <section className="announcement-form-card">
                        <div className="announcement-section-heading">
                            <div>
                                <h2>
                                    {editingId !== null
                                        ? "Edit Announcement"
                                        : "Create Announcement"}
                                </h2>

                                <p>
                                    Enter the announcement details below.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="announcement-form-grid">
                                <div className="announcement-field">
                                    <label htmlFor="announcement-title">
                                        Title <span>*</span>
                                    </label>

                                    <input
                                        id="announcement-title"
                                        name="title"
                                        type="text"
                                        value={form.title}
                                        onChange={handleFormChange}
                                        placeholder="Enter announcement title"
                                        maxLength={200}
                                        required
                                        disabled={saving}
                                    />
                                </div>

                                <div className="announcement-field">
                                    <label htmlFor="announcement-audience">
                                        Target Audience
                                    </label>

                                    <select
                                        id="announcement-audience"
                                        name="targetAudience"
                                        value={form.targetAudience}
                                        onChange={handleFormChange}
                                        disabled={saving}
                                    >
                                        <option value="ALL">
                                            Everyone
                                        </option>

                                        <option value="STUDENT">
                                            Students
                                        </option>

                                        <option value="TEACHER">
                                            Teachers
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="announcement-field">
                                <label htmlFor="announcement-description">
                                    Description <span>*</span>
                                </label>

                                <textarea
                                    id="announcement-description"
                                    name="description"
                                    value={form.description}
                                    onChange={handleFormChange}
                                    placeholder="Write the announcement details..."
                                    rows={5}
                                    required
                                    disabled={saving}
                                />

                                <span className="announcement-character-count">
                                    {form.description.length} characters
                                </span>
                            </div>

                            {/* Optional PDF Attachment */}
                            <div className="announcement-field announcement-pdf-field">
                                <label htmlFor="announcement-pdf">
                                    PDF Attachment (Optional)
                                </label>

                                <input
                                    key={fileInputKey}
                                    id="announcement-pdf"
                                    type="file"
                                    accept=".pdf,application/pdf"
                                    onChange={handleFileChange}
                                    disabled={saving}
                                />

                                <span className="announcement-character-count">
                                    Select a PDF up to 5 MB.
                                    {selectedFile
                                        ? ` Selected: ${selectedFile.name}`
                                        : ""}
                                </span>

                                {editingId !== null &&
                                    editingAnnouncement?.attachmentUrl && (
                                        <p className="announcement-existing-pdf">
                                            <span>📄</span>
                                            This announcement already has a
                                            PDF attachment. Selecting a new
                                            PDF will replace it.
                                        </p>
                                    )}
                            </div>

                            <div className="announcement-form-actions">
                                <button
                                    type="submit"
                                    className="announcement-primary-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingId !== null
                                            ? "Update Announcement"
                                            : "Create Announcement"}
                                </button>

                                {editingId !== null && (
                                    <button
                                        type="button"
                                        className="announcement-secondary-button"
                                        onClick={resetForm}
                                        disabled={saving}
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </form>
                    </section>

                    {/* Announcement List */}
                    <section className="announcement-list-card">
                        <div className="announcement-section-heading">
                            <div>
                                <h2>All Announcements</h2>
                                <p>
                                    Search, filter, publish, or manage
                                    announcements.
                                </p>
                            </div>

                            <span className="announcement-total">
                                {filteredAnnouncements.length}{" "}
                                {filteredAnnouncements.length === 1
                                    ? "announcement"
                                    : "announcements"}
                            </span>
                        </div>

                        {/* Search and Filters */}
                        <div className="announcement-filters">
                            <div className="announcement-field announcement-search-field">
                                <label htmlFor="announcement-search">
                                    Search
                                </label>

                                <input
                                    id="announcement-search"
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search title or description..."
                                />
                            </div>

                            <div className="announcement-field">
                                <label htmlFor="audience-filter">
                                    Audience
                                </label>

                                <select
                                    id="audience-filter"
                                    value={audienceFilter}
                                    onChange={(event) =>
                                        setAudienceFilter(event.target.value)
                                    }
                                >
                                    <option value="ALL">
                                        All Audiences
                                    </option>

                                    <option value="STUDENT">
                                        Students
                                    </option>

                                    <option value="TEACHER">
                                        Teachers
                                    </option>
                                </select>
                            </div>

                            <div className="announcement-field">
                                <label htmlFor="status-filter">
                                    Status
                                </label>

                                <select
                                    id="status-filter"
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(event.target.value)
                                    }
                                >
                                    <option value="ALL">
                                        All Statuses
                                    </option>

                                    <option value="PUBLISHED">
                                        Published
                                    </option>

                                    <option value="UNPUBLISHED">
                                        Unpublished
                                    </option>
                                </select>
                            </div>
                        </div>

                        {loading ? (
                            <div className="announcement-empty-state">
                                <p>Loading announcements...</p>
                            </div>
                        ) : filteredAnnouncements.length === 0 ? (
                            <div className="announcement-empty-state">
                                <span>📢</span>
                                <h3>No announcements found</h3>
                                <p>
                                    Try changing your search or filters,
                                    or create a new announcement.
                                </p>
                            </div>
                        ) : (
                            <div className="announcement-table-wrapper">
                                <table className="announcement-table">
                                    <thead>
                                        <tr>
                                            <th>Announcement</th>
                                            <th>Audience</th>
                                            <th>Status</th>
                                            <th>Created</th>
                                            <th>Published At</th>
                                            <th>Attachment</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredAnnouncements.map(
                                            (announcement) => (
                                                <tr key={announcement.id}>
                                                    <td>
                                                        <div className="announcement-table-title">
                                                            <strong>
                                                                {announcement.title}
                                                            </strong>

                                                            <p>
                                                                {announcement.description}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        {announcement.targetAudience ===
                                                        "ALL"
                                                            ? "Everyone"
                                                            : announcement.targetAudience ===
                                                                "STUDENT"
                                                              ? "Students"
                                                              : announcement.targetAudience ===
                                                                  "TEACHER"
                                                                ? "Teachers"
                                                                : announcement.targetAudience ||
                                                                  "—"}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={
                                                                announcement.published
                                                                    ? "announcement-status announcement-status-published"
                                                                    : "announcement-status announcement-status-unpublished"
                                                            }
                                                        >
                                                            {announcement.published
                                                                ? "Published"
                                                                : "Unpublished"}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        {formatDate(
                                                            announcement.createdAt
                                                        )}
                                                    </td>

                                                    <td>
                                                        {formatDate(
                                                            announcement.publishedAt
                                                        )}
                                                    </td>

                                                    <td>
                                                        {announcement.attachmentUrl ? (
                                                            <span className="announcement-attachment-indicator">
                                                                📄 PDF attached
                                                            </span>
                                                        ) : (
                                                            <span className="announcement-no-attachment">
                                                                —
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td>
                                                        <div className="announcement-action-buttons">
                                                            <button
                                                                type="button"
                                                                className="announcement-edit-button"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        announcement
                                                                    )
                                                                }
                                                                disabled={
                                                                    saving ||
                                                                    actionId !== null
                                                                }
                                                            >
                                                                Edit
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className={
                                                                    announcement.published
                                                                        ? "announcement-unpublish-button"
                                                                        : "announcement-publish-button"
                                                                }
                                                                onClick={() =>
                                                                    handlePublishToggle(
                                                                        announcement
                                                                    )
                                                                }
                                                                disabled={
                                                                    saving ||
                                                                    actionId !== null
                                                                }
                                                            >
                                                                {actionId ===
                                                                announcement.id
                                                                    ? "Please wait..."
                                                                    : announcement.published
                                                                      ? "Unpublish"
                                                                      : "Publish"}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="announcement-delete-button"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        announcement
                                                                    )
                                                                }
                                                                disabled={
                                                                    saving ||
                                                                    actionId !== null
                                                                }
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
        </>
    );
};

export default Announcements;