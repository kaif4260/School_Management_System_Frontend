import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
    createSection,
    updateSection,
    deleteSection,
    updateSectionStatus,
    searchSections
} from "../../services/sectionService";

import { getClasses } from "../../services/classService";

import "./sections.css";

function Sections() {

    const [sections, setSections] = useState([]);
    const [classes, setClasses] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editingSectionId, setEditingSectionId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        classId: ""
    });

    // SEARCH + FILTER + PAGINATION
    const [searchTerm, setSearchTerm] = useState("");
    const [classFilter, setClassFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // =========================
    // FETCH CLASSES
    // =========================

    const fetchClasses = async () => {

        try {

            const classesData = await getClasses();

            setClasses(classesData || []);

        } catch (err) {

            console.error(
                "Failed to fetch classes:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load classes."
            );
        }
    };

    // =========================
    // FETCH SECTIONS
    // =========================

    const fetchSections = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await searchSections({
                name: searchTerm.trim(),
                classId: classFilter,
                status: statusFilter,
                page: currentPage,
                size: pageSize
            });

            setSections(data.content || []);

            setTotalElements(
                data.totalElements || 0
            );

            setTotalPages(
                data.totalPages || 0
            );

        } catch (err) {

            console.error(
                "Failed to fetch sections:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load sections."
            );

            setSections([]);
            setTotalElements(0);
            setTotalPages(0);

        } finally {

            setLoading(false);
        }
    };

    // Load classes once
    useEffect(() => {

        fetchClasses();

    }, []);

    // Search/filter/pagination
    useEffect(() => {

        const timer = setTimeout(() => {

            fetchSections();

        }, 400);

        return () => clearTimeout(timer);

    }, [
        searchTerm,
        classFilter,
        statusFilter,
        currentPage,
        pageSize
    ]);

    // =========================
    // SEARCH / FILTER HANDLERS
    // =========================

    const handleSearchChange = (e) => {

        setSearchTerm(e.target.value);
        setCurrentPage(0);
    };

    const handleClassFilterChange = (e) => {

        setClassFilter(e.target.value);
        setCurrentPage(0);
    };

    const handleStatusFilterChange = (e) => {

        setStatusFilter(e.target.value);
        setCurrentPage(0);
    };

    const handlePageSizeChange = (e) => {

        setPageSize(Number(e.target.value));
        setCurrentPage(0);
    };

    const handlePreviousPage = () => {

        if (currentPage > 0) {

            setCurrentPage(
                currentPage - 1
            );
        }
    };

    const handleNextPage = () => {

        if (
            currentPage <
            totalPages - 1
        ) {

            setCurrentPage(
                currentPage + 1
            );
        }
    };

    // =========================
    // FORM HANDLING
    // =========================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {

        setFormData({
            name: "",
            description: "",
            classId: ""
        });

        setEditingSectionId(null);
        setShowForm(false);
        setError("");
    };

    const handleAdd = () => {

        setFormData({
            name: "",
            description: "",
            classId: ""
        });

        setEditingSectionId(null);
        setError("");
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleEdit = (section) => {

        setFormData({
            name: section.name || "",
            description: section.description || "",
            classId:
                section.classId?.toString() || ""
        });

        setEditingSectionId(section.id);
        setError("");
        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // =========================
    // CREATE / UPDATE
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);
            setError("");

            const sectionData = {
                name: formData.name.trim(),
                description:
                    formData.description.trim(),
                classId:
                    Number(formData.classId)
            };

            if (editingSectionId) {

                await updateSection(
                    editingSectionId,
                    sectionData
                );

            } else {

                await createSection(
                    sectionData
                );
            }

            resetForm();

            setCurrentPage(0);

            await fetchSections();

        } catch (err) {

            console.error(
                "Failed to save section:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to save section. Please check the information and try again."
            );

        } finally {

            setSaving(false);
        }
    };

    // =========================
    // DELETE
    // =========================

    const handleDelete = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this section?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setError("");

            await deleteSection(id);

            if (
                sections.length === 1 &&
                currentPage > 0
            ) {

                setCurrentPage(
                    currentPage - 1
                );

            } else {

                await fetchSections();
            }

        } catch (err) {

            console.error(
                "Failed to delete section:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to delete section."
            );
        }
    };

    // =========================
    // STATUS
    // =========================

    const handleStatusChange = async (
        id,
        status
    ) => {

        try {

            setError("");

            await updateSectionStatus(
                id,
                status
            );

            await fetchSections();

        } catch (err) {

            console.error(
                "Failed to update section status:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to update section status."
            );
        }
    };

    // =========================
    // STATISTICS
    // =========================

    const displayedSections =
        sections.length;

    // =========================
    // UI
    // =========================

    return (
        <div className="admin-page">

            <Navbar />

            <div className="admin-content">

                <Sidebar />

                <main className="sections-main">

                    {/* ================= HEADER ================= */}

                    <div className="sections-header">

                        <div>

                            <h1>Sections</h1>

                            <p>
                                Manage school sections,
                                classes and their status.
                            </p>

                        </div>

                        <button
                            className="add-section-btn"
                            onClick={handleAdd}
                        >
                            <span className="plus-icon">
                                +
                            </span>

                            Add Section

                        </button>

                    </div>

                    {/* ================= STATS ================= */}

                    <div className="section-stats">

                        <div className="section-stat-card">

                            <div className="stat-icon">
                                📋
                            </div>

                            <div>

                                <span>
                                    Total Sections
                                </span>

                                <strong>
                                    {totalElements}
                                </strong>

                            </div>

                        </div>

                        <div className="section-stat-card">

                            <div className="stat-icon">
                                👁
                            </div>

                            <div>

                                <span>
                                    Displayed Sections
                                </span>

                                <strong>
                                    {displayedSections}
                                </strong>

                            </div>

                        </div>

                    </div>

                    {/* ================= ERROR ================= */}

                    {error && (

                        <div className="error-message">

                            <span>⚠</span>

                            {error}

                        </div>

                    )}

                    {/* ================= FORM ================= */}

                    {showForm && (

                        <div className="section-form-card">

                            <div className="form-header">

                                <div>

                                    <h2>
                                        {editingSectionId
                                            ? "Edit Section"
                                            : "Add New Section"}
                                    </h2>

                                    <p>
                                        {editingSectionId
                                            ? "Update the section information below."
                                            : "Enter the section details to create a new record."}
                                    </p>

                                </div>

                                <button
                                    className="close-form-btn"
                                    onClick={resetForm}
                                    type="button"
                                >
                                    ×
                                </button>

                            </div>

                            <form onSubmit={handleSubmit}>

                                <div className="form-grid">

                                    {/* SECTION NAME */}

                                    <div className="form-group">

                                        <label>
                                            Section Name
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            value={
                                                formData.name
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="e.g. A"
                                            minLength={1}
                                            maxLength={20}
                                            required
                                        />

                                    </div>

                                    {/* CLASS */}

                                    <div className="form-group">

                                        <label>
                                            Class
                                        </label>

                                        <select
                                            name="classId"
                                            value={
                                                formData.classId
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            required
                                        >

                                            <option value="">
                                                Select Class
                                            </option>

                                            {classes.map(
                                                (schoolClass) => (

                                                    <option
                                                        key={
                                                            schoolClass.id
                                                        }
                                                        value={
                                                            schoolClass.id
                                                        }
                                                    >
                                                        {
                                                            schoolClass.name
                                                        }
                                                    </option>

                                                )
                                            )}

                                        </select>

                                    </div>

                                    {/* DESCRIPTION */}

                                    <div className="form-group full-width">

                                        <label>

                                            Description

                                            <span className="optional">
                                                Optional
                                            </span>

                                        </label>

                                        <textarea
                                            name="description"
                                            value={
                                                formData.description
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter a short description"
                                            maxLength={255}
                                            rows={4}
                                        />

                                        <small>
                                            {
                                                formData
                                                    .description
                                                    .length
                                            }{" "}
                                            / 255
                                        </small>

                                    </div>

                                </div>

                                {/* FORM BUTTONS */}

                                <div className="form-actions">

                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={resetForm}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="save-btn"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editingSectionId
                                                ? "Update Section"
                                                : "Save Section"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    )}

                    {/* ================= TABLE CARD ================= */}

                    <div className="sections-table-card">

                        {/* ================= TOOLBAR ================= */}

                        <div className="sections-toolbar">

                            <div className="search-box">

                                <span className="search-icon">
                                    🔍
                                </span>

                                <input
                                    type="text"
                                    placeholder="Search sections..."
                                    value={searchTerm}
                                    onChange={
                                        handleSearchChange
                                    }
                                />

                                {searchTerm && (

                                    <button
                                        type="button"
                                        className="clear-search"
                                        onClick={() => {

                                            setSearchTerm("");
                                            setCurrentPage(0);

                                        }}
                                    >
                                        ×
                                    </button>

                                )}

                            </div>

                            <div className="filter-group">

                                {/* CLASS FILTER */}

                                <select
                                    value={classFilter}
                                    onChange={
                                        handleClassFilterChange
                                    }
                                >

                                    <option value="">
                                        All Classes
                                    </option>

                                    {classes.map(
                                        (schoolClass) => (

                                            <option
                                                key={
                                                    schoolClass.id
                                                }
                                                value={
                                                    schoolClass.id
                                                }
                                            >
                                                {
                                                    schoolClass.name
                                                }
                                            </option>

                                        )
                                    )}

                                </select>

                                {/* STATUS FILTER */}

                                <select
                                    value={statusFilter}
                                    onChange={
                                        handleStatusFilterChange
                                    }
                                >

                                    <option value="">
                                        All Status
                                    </option>

                                    <option value="ACTIVE">
                                        Active
                                    </option>

                                    <option value="INACTIVE">
                                        Inactive
                                    </option>

                                </select>

                                {/* PAGE SIZE */}

                                <select
                                    value={pageSize}
                                    onChange={
                                        handlePageSizeChange
                                    }
                                >

                                    <option value={5}>
                                        5 / page
                                    </option>

                                    <option value={10}>
                                        10 / page
                                    </option>

                                    <option value={20}>
                                        20 / page
                                    </option>

                                    <option value={50}>
                                        50 / page
                                    </option>

                                </select>

                            </div>

                        </div>

                        {/* ================= TABLE HEADER ================= */}

                        <div className="table-header">

                            <div>

                                <h2>
                                    All Sections
                                </h2>

                                <p>
                                    {totalElements}{" "}
                                    {totalElements === 1
                                        ? "section"
                                        : "sections"}{" "}
                                    registered
                                </p>

                            </div>

                        </div>

                        {/* ================= LOADING ================= */}

                        {loading ? (

                            <div className="table-state">

                                <div className="spinner"></div>

                                <p>
                                    Loading sections...
                                </p>

                            </div>

                        ) : sections.length === 0 ? (

                            /* ================= EMPTY ================= */

                            <div className="table-state">

                                <div className="empty-icon">

                                    {searchTerm ||
                                    classFilter ||
                                    statusFilter
                                        ? "🔍"
                                        : "📋"}

                                </div>

                                <h3>

                                    {searchTerm ||
                                    classFilter ||
                                    statusFilter
                                        ? "No sections found"
                                        : "No sections yet"}

                                </h3>

                                <p>

                                    {searchTerm ||
                                    classFilter ||
                                    statusFilter
                                        ? "Try changing your search or filters."
                                        : "Start by adding your first section."}

                                </p>

                                {!searchTerm &&
                                    !classFilter &&
                                    !statusFilter && (

                                        <button
                                            className="add-section-btn"
                                            onClick={
                                                handleAdd
                                            }
                                        >
                                            + Add Section
                                        </button>

                                    )}

                            </div>

                        ) : (

                            <>

                                {/* ================= TABLE ================= */}

                                <div className="table-wrapper">

                                    <table className="sections-table">

                                        <thead>

                                            <tr>

                                                <th>
                                                    ID
                                                </th>

                                                <th>
                                                    Section
                                                </th>

                                                <th>
                                                    Class
                                                </th>

                                                <th>
                                                    Description
                                                </th>

                                                <th>
                                                    Status
                                                </th>

                                                <th>
                                                    Actions
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {sections.map(
                                                (section) => (

                                                    <tr
                                                        key={
                                                            section.id
                                                        }
                                                    >

                                                        <td>

                                                            <span className="section-id">
                                                                #
                                                                {
                                                                    section.id
                                                                }
                                                            </span>

                                                        </td>

                                                        <td>

                                                            <div className="section-info">

                                                                <div className="section-avatar">
                                                                    📋
                                                                </div>

                                                                <strong>
                                                                    {
                                                                        section.name
                                                                    }
                                                                </strong>

                                                            </div>

                                                        </td>

                                                        <td>

                                                            <span className="class-badge">
                                                                {
                                                                    section.className
                                                                }
                                                            </span>

                                                        </td>

                                                        <td>

                                                            <span className="description-text">

                                                                {
                                                                    section.description ||
                                                                    "No description"
                                                                }

                                                            </span>

                                                        </td>

                                                        <td>

                                                            <select
                                                                className={`status-select status-${section.status?.toLowerCase()}`}
                                                                value={
                                                                    section.status
                                                                }
                                                                onChange={
                                                                    (e) =>
                                                                        handleStatusChange(
                                                                            section.id,
                                                                            e.target.value
                                                                        )
                                                                }
                                                            >

                                                                <option value="ACTIVE">
                                                                    Active
                                                                </option>

                                                                <option value="INACTIVE">
                                                                    Inactive
                                                                </option>

                                                            </select>

                                                        </td>

                                                        <td>

                                                            <div className="action-buttons">

                                                                <button
                                                                    className="edit-btn"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            section
                                                                        )
                                                                    }
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    className="delete-btn"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            section.id
                                                                        )
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

                                {/* ================= PAGINATION ================= */}

                                {!loading &&
                                    totalElements > 0 && (

                                        <div className="pagination-container">

                                            <div className="pagination-info">

                                                Showing{" "}

                                                <strong>
                                                    {currentPage *
                                                        pageSize +
                                                        1}
                                                </strong>

                                                {" "}to{" "}

                                                <strong>
                                                    {Math.min(
                                                        (currentPage +
                                                            1) *
                                                            pageSize,
                                                        totalElements
                                                    )}
                                                </strong>

                                                {" "}of{" "}

                                                <strong>
                                                    {totalElements}
                                                </strong>

                                                {" "}sections

                                            </div>

                                            <div className="pagination-controls">

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handlePreviousPage
                                                    }
                                                    disabled={
                                                        currentPage ===
                                                        0
                                                    }
                                                >
                                                    ← Previous
                                                </button>

                                                <span className="page-number">

                                                    Page{" "}
                                                    {currentPage + 1}
                                                    {" "}of{" "}
                                                    {totalPages}

                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleNextPage
                                                    }
                                                    disabled={
                                                        currentPage >=
                                                        totalPages - 1
                                                    }
                                                >
                                                    Next →
                                                </button>

                                            </div>

                                        </div>

                                    )}

                            </>

                        )}

                    </div>

                </main>

            </div>

        </div>
    );
}

export default Sections;