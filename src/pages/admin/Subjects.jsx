import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
    searchSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    updateSubjectStatus
} from "../../services/subjectService";
import "./subjects.css";

const Subjects = () => {

    // =====================================================
    // STATE
    // =====================================================

    const [subjects, setSubjects] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingSubject, setEditingSubject] = useState(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [activeSubjects, setActiveSubjects] = useState(0);

    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: ""
    });

    // =====================================================
    // FETCH SUBJECTS
    // =====================================================

    useEffect(() => {

        const timer = setTimeout(() => {
            fetchSubjects();
        }, 400);

        return () => clearTimeout(timer);

    }, [
        searchTerm,
        statusFilter,
        currentPage,
        pageSize
    ]);

    const fetchSubjects = async () => {

        try {

            setLoading(true);
            setError("");

            const [subjectResponse, activeResponse] =
                await Promise.all([

                    searchSubjects({
                        keyword: searchTerm,
                        status: statusFilter,
                        page: currentPage,
                        size: pageSize
                    }),

                    searchSubjects({
                        keyword: "",
                        status: "ACTIVE",
                        page: 0,
                        size: 1
                    })

                ]);

            setSubjects(subjectResponse.content || []);
            setTotalElements(subjectResponse.totalElements || 0);
            setTotalPages(subjectResponse.totalPages || 0);

            setActiveSubjects(
                activeResponse.totalElements || 0
            );

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load subjects."
            );

        } finally {

            setLoading(false);

        }
    };

    // =====================================================
    // FORM HANDLING
    // =====================================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const resetForm = () => {

        setFormData({
            code: "",
            name: "",
            description: ""
        });

        setEditingSubject(null);
        setShowForm(false);
    };

    const handleAddSubject = () => {

        setEditingSubject(null);

        setFormData({
            code: "",
            name: "",
            description: ""
        });

        setError("");
        setShowForm(true);
    };

    const handleEditSubject = (subject) => {

        setEditingSubject(subject);

        setFormData({
            code: subject.code || "",
            name: subject.name || "",
            description: subject.description || ""
        });

        setError("");
        setShowForm(true);
    };

    // =====================================================
    // CREATE / UPDATE
    // =====================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);
            setError("");

            const data = {
                code: formData.code.trim(),
                name: formData.name.trim(),
                description: formData.description.trim()
            };

            if (editingSubject) {

                await updateSubject(
                    editingSubject.id,
                    data
                );

            } else {

                await createSubject(data);
            }

            resetForm();

            setCurrentPage(0);

            await fetchSubjects();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to save subject."
            );

        } finally {

            setSaving(false);
        }
    };

    // =====================================================
    // DELETE
    // =====================================================

    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this subject?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setError("");

            await deleteSubject(id);

            if (
                subjects.length === 1 &&
                currentPage > 0
            ) {
                setCurrentPage((prev) => prev - 1);
            } else {
                await fetchSubjects();
            }

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to delete subject."
            );
        }
    };

    // =====================================================
    // STATUS
    // =====================================================

    const handleStatusChange = async (
        id,
        status
    ) => {

        try {

            setError("");

            await updateSubjectStatus(
                id,
                status
            );

            await fetchSubjects();

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to update subject status."
            );
        }
    };

    // =====================================================
    // SEARCH
    // =====================================================

    const handleSearchChange = (e) => {

        setSearchTerm(e.target.value);
        setCurrentPage(0);
    };

    const handleStatusFilterChange = (e) => {

        setStatusFilter(e.target.value);
        setCurrentPage(0);
    };

    const clearSearch = () => {

        setSearchTerm("");
        setStatusFilter("");
        setCurrentPage(0);
    };

    // =====================================================
    // PAGINATION
    // =====================================================

    const handlePageSizeChange = (e) => {

        setPageSize(Number(e.target.value));
        setCurrentPage(0);
    };

    const goToPage = (page) => {

        if (
            page >= 0 &&
            page < totalPages
        ) {
            setCurrentPage(page);
        }
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="admin-page">
            <Navbar />

            <div className="admin-content">
                <Sidebar />

                <main className="subjects-main">

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="subjects-header">

                        <div>
                            <h1>Subjects</h1>

                            <p>
                                Manage school subjects and their status.
                            </p>
                        </div>

                        <button
                            className="add-subject-btn"
                            onClick={handleAddSubject}
                        >
                            <span className="plus-icon">
                                +
                            </span>

                            Add Subject
                        </button>

                    </div>


                    {/* =================================================
                        STATS
                    ================================================= */}

                    <div className="subject-stats">

                        <div className="subject-stat-card">

                            <div className="stat-icon">
                                📚
                            </div>

                            <div>
                                <h3>Total Subjects</h3>
                                <p>{totalElements}</p>
                            </div>

                        </div>


                        <div className="subject-stat-card">

                            <div className="stat-icon">
                                ✓
                            </div>

                            <div>
                                <h3>Active Subjects</h3>
                                <p>{activeSubjects}</p>
                            </div>

                        </div>

                    </div>


                    {/* =================================================
                        ERROR
                    ================================================= */}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}


                    {/* =================================================
                        FORM
                    ================================================= */}

                    {showForm && (

                        <div className="subject-form-card">

                            <div className="form-header">

                                <h2>
                                    {editingSubject
                                        ? "Edit Subject"
                                        : "Add New Subject"}
                                </h2>

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

                                    {/* CODE */}

                                    <div className="form-group">

                                        <label>
                                            Subject Code
                                        </label>

                                        <input
                                            type="text"
                                            name="code"
                                            value={formData.code}
                                            onChange={handleChange}
                                            placeholder="e.g. MATH101"
                                            required
                                        />

                                    </div>


                                    {/* NAME */}

                                    <div className="form-group">

                                        <label>
                                            Subject Name
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="e.g. Mathematics"
                                            required
                                        />

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
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Enter subject description..."
                                            rows="4"
                                        />

                                    </div>

                                </div>


                                <div className="form-actions">

                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={resetForm}
                                        disabled={saving}
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
                                            : editingSubject
                                                ? "Update Subject"
                                                : "Save Subject"}
                                    </button>

                                </div>

                            </form>

                        </div>
                    )}


                    {/* =================================================
                        TABLE CARD
                    ================================================= */}

                    <div className="subjects-table-card">

                        <div className="table-header">

                            <div>
                                <h2>Subject List</h2>

                                <p>
                                    View and manage all school subjects.
                                </p>
                            </div>

                        </div>


                        {/* =================================================
                            TOOLBAR
                        ================================================= */}

                        <div className="subjects-toolbar">

                            <div className="subject-search-box">

                                <span className="search-icon">
                                    🔍
                                </span>

                                <input
                                    type="text"
                                    placeholder="Search by subject name, code or description..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                />

                                {searchTerm && (
                                    <button
                                        className="clear-search"
                                        onClick={() => {
                                            setSearchTerm("");
                                            setCurrentPage(0);
                                        }}
                                        type="button"
                                    >
                                        ×
                                    </button>
                                )}

                            </div>


                            <select
                                className="status-filter-select"
                                value={statusFilter}
                                onChange={handleStatusFilterChange}
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


                            <select
                                className="page-size-select"
                                value={pageSize}
                                onChange={handlePageSizeChange}
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


                        {/* =================================================
                            LOADING / EMPTY / TABLE
                        ================================================= */}

                        {loading ? (

                            <div className="table-state">

                                <div className="spinner"></div>

                                <p>
                                    Loading subjects...
                                </p>

                            </div>

                        ) : subjects.length === 0 ? (

                            <div className="table-state">

                                <div className="empty-icon">
                                    📚
                                </div>

                                <h3>
                                    {searchTerm || statusFilter
                                        ? "No subjects found"
                                        : "No subjects yet"}
                                </h3>

                                <p>
                                    {searchTerm || statusFilter
                                        ? "Try changing your search or filter."
                                        : "Add your first subject to get started."}
                                </p>

                                {(searchTerm || statusFilter) && (
                                    <button
                                        className="clear-search-btn"
                                        onClick={clearSearch}
                                    >
                                        Clear Filters
                                    </button>
                                )}

                            </div>

                        ) : (

                            <>

                                <div className="table-wrapper">

                                    <table className="subjects-table">

                                        <thead>

                                            <tr>
                                                <th>ID</th>
                                                <th>CODE</th>
                                                <th>SUBJECT</th>
                                                <th>DESCRIPTION</th>
                                                <th>STATUS</th>
                                                <th>ACTIONS</th>
                                            </tr>

                                        </thead>

                                        <tbody>

                                            {subjects.map((subject) => (

                                                <tr key={subject.id}>

                                                    <td className="subject-id">
                                                        #{subject.id}
                                                    </td>

                                                    <td>
                                                        <span className="subject-code">
                                                            {subject.code}
                                                        </span>
                                                    </td>

                                                    <td>

                                                        <div className="subject-info">

                                                            <div className="subject-avatar">
                                                                {subject.name
                                                                    ?.charAt(0)
                                                                    ?.toUpperCase()}
                                                            </div>

                                                            <span className="subject-name">
                                                                {subject.name}
                                                            </span>

                                                        </div>

                                                    </td>

                                                    <td>

                                                        <div className="subject-description">

                                                            {subject.description
                                                                ? subject.description
                                                                : "—"}

                                                        </div>

                                                    </td>

                                                    <td>

                                                        <select
                                                            className={`status-select status-${subject.status?.toLowerCase()}`}
                                                            value={subject.status}
                                                            onChange={(e) =>
                                                                handleStatusChange(
                                                                    subject.id,
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
                                                                    handleEditSubject(
                                                                        subject
                                                                    )
                                                                }
                                                                title="Edit Subject"
                                                            >
                                                                ✏️
                                                            </button>

                                                            <button
                                                                className="delete-btn"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        subject.id
                                                                    )
                                                                }
                                                                title="Delete Subject"
                                                            >
                                                                🗑️
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            ))}

                                        </tbody>

                                    </table>

                                </div>


                                {/* =================================================
                                    PAGINATION
                                ================================================= */}

                                {totalPages > 0 && (

                                    <div className="subjects-pagination">

                                        <div className="pagination-info">

                                            Showing{" "}
                                            <strong>
                                                {currentPage * pageSize + 1}
                                            </strong>

                                            {" - "}

                                            <strong>
                                                {Math.min(
                                                    (currentPage + 1) * pageSize,
                                                    totalElements
                                                )}
                                            </strong>

                                            {" of "}

                                            <strong>
                                                {totalElements}
                                            </strong>

                                        </div>


                                        <div className="pagination-controls">

                                            <button
                                                disabled={
                                                    currentPage === 0
                                                }
                                                onClick={() =>
                                                    goToPage(
                                                        currentPage - 1
                                                    )
                                                }
                                            >
                                                Previous
                                            </button>


                                            {Array.from(
                                                { length: totalPages },
                                                (_, index) => index
                                            ).map((page) => (

                                                <button
                                                    key={page}
                                                    className={`page-number ${
                                                        currentPage === page
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        goToPage(page)
                                                    }
                                                >
                                                    {page + 1}
                                                </button>

                                            ))}


                                            <button
                                                disabled={
                                                    currentPage ===
                                                    totalPages - 1
                                                }
                                                onClick={() =>
                                                    goToPage(
                                                        currentPage + 1
                                                    )
                                                }
                                            >
                                                Next
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
};

export default Subjects;