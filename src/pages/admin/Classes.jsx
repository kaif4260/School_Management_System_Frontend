import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
    createClass,
    updateClass,
    deleteClass,
    updateClassStatus,
    searchClasses
} from "../../services/classService";

import "./classes.css";

function Classes() {

    const [classes, setClasses] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editingClassId, setEditingClassId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        description: ""
    });

    // =========================
    // SEARCH + FILTER
    // =========================

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // =========================
    // PAGINATION
    // =========================

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // =========================
    // FETCH CLASSES
    // =========================

    const fetchClasses = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await searchClasses({
                name: searchTerm.trim(),
                status: statusFilter,
                page: currentPage,
                size: pageSize
            });

            setClasses(data.content || []);

            setTotalElements(
                data.totalElements || 0
            );

            setTotalPages(
                data.totalPages || 0
            );

        } catch (error) {

            console.error(
                "Failed to fetch classes:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load classes. Please try again."
            );

            setClasses([]);
            setTotalElements(0);
            setTotalPages(0);

        } finally {

            setLoading(false);
        }
    };

    // =========================
    // DEBOUNCED FETCH
    // =========================

    useEffect(() => {

        const timer = setTimeout(() => {
            fetchClasses();
        }, 400);

        return () => clearTimeout(timer);

    }, [
        searchTerm,
        statusFilter,
        currentPage,
        pageSize
    ]);

    // =========================
    // SEARCH
    // =========================

    const handleSearchChange = (e) => {

        setSearchTerm(e.target.value);

        setCurrentPage(0);
    };

    // =========================
    // STATUS FILTER
    // =========================

    const handleStatusFilterChange = (e) => {

        setStatusFilter(e.target.value);

        setCurrentPage(0);
    };

    // =========================
    // PAGE SIZE
    // =========================

    const handlePageSizeChange = (e) => {

        setPageSize(
            Number(e.target.value)
        );

        setCurrentPage(0);
    };

    // =========================
    // PAGINATION
    // =========================

    const handlePreviousPage = () => {

        if (currentPage > 0) {

            setCurrentPage(
                currentPage - 1
            );
        }
    };

    const handleNextPage = () => {

        if (currentPage < totalPages - 1) {

            setCurrentPage(
                currentPage + 1
            );
        }
    };

    // =========================
    // FORM CHANGE
    // =========================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    // =========================
    // RESET FORM
    // =========================

    const resetForm = () => {

        setFormData({
            name: "",
            description: ""
        });

        setEditingClassId(null);
        setShowForm(false);
        setError("");
    };

    // =========================
    // ADD CLASS
    // =========================

    const handleAddClass = () => {

        resetForm();

        setShowForm(true);
    };

    // =========================
    // EDIT CLASS
    // =========================

    const handleEdit = (schoolClass) => {

        setEditingClassId(
            schoolClass.id
        );

        setFormData({
            name: schoolClass.name,
            description:
                schoolClass.description || ""
        });

        setShowForm(true);
        setError("");

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

            const classData = {
                name: formData.name.trim(),
                description:
                    formData.description.trim()
            };

            if (editingClassId) {

                await updateClass(
                    editingClassId,
                    classData
                );

            } else {

                await createClass(
                    classData
                );
            }

            resetForm();

            // Go back to first page
            // after creating/updating.
            setCurrentPage(0);

        } catch (error) {

            console.error(
                "Failed to save class:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to save class. Please check the information and try again."
            );

        } finally {

            setSaving(false);
        }
    };

    // =========================
    // DELETE
    // =========================

    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this class?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setError("");

            await deleteClass(id);

            /*
             * If the last item on the current
             * page was deleted, move back
             * one page.
             */
            if (
                classes.length === 1 &&
                currentPage > 0
            ) {

                setCurrentPage(
                    currentPage - 1
                );

            } else {

                await fetchClasses();
            }

        } catch (error) {

            console.error(
                "Failed to delete class:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to delete class."
            );
        }
    };

    // =========================
    // STATUS CHANGE
    // =========================

    const handleStatusChange = async (
        id,
        status
    ) => {

        try {

            setError("");

            await updateClassStatus(
                id,
                status
            );

            await fetchClasses();

        } catch (error) {

            console.error(
                "Failed to update class status:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to update class status."
            );
        }
    };

    // Number of classes currently
    // displayed on this page.
    const displayedClasses =
        classes.length;

    return (

        <div className="admin-page">

            <Navbar />

            <div className="admin-content">

                <Sidebar />

                <main className="classes-main">

                    {/* =========================
                        PAGE HEADER
                    ========================== */}

                    <div className="classes-header">

                        <div>

                            <h1>
                                Classes
                            </h1>

                            <p>
                                Manage school classes and
                                their status.
                            </p>

                        </div>

                        <button
                            className="add-class-btn"
                            onClick={handleAddClass}
                        >

                            <span className="plus-icon">
                                +
                            </span>

                            Add Class

                        </button>

                    </div>

                    {/* =========================
                        STATISTICS
                    ========================== */}

                    <div className="class-stats">

                        <div className="class-stat-card">

                            <div className="stat-icon">
                                📚
                            </div>

                            <div>

                                <span>
                                    Total Classes
                                </span>

                                <strong>
                                    {totalElements}
                                </strong>

                            </div>

                        </div>

                        <div className="class-stat-card">

                            <div className="stat-icon">
                                ✓
                            </div>

                            <div>

                                <span>
                                    Displayed Classes
                                </span>

                                <strong>
                                    {displayedClasses}
                                </strong>

                            </div>

                        </div>

                    </div>

                    {/* =========================
                        ERROR
                    ========================== */}

                    {error && (

                        <div className="error-message">

                            <span>
                                ⚠
                            </span>

                            {error}

                        </div>

                    )}

                    {/* =========================
                        ADD / EDIT FORM
                    ========================== */}

                    {showForm && (

                        <div className="class-form-card">

                            <div className="form-header">

                                <div>

                                    <h2>

                                        {editingClassId
                                            ? "Edit Class"
                                            : "Add New Class"}

                                    </h2>

                                    <p>

                                        {editingClassId
                                            ? "Update the class information below."
                                            : "Enter the class details to create a new record."}

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

                            <form
                                onSubmit={handleSubmit}
                            >

                                <div className="form-grid">

                                    {/* CLASS NAME */}

                                    <div className="form-group">

                                        <label>
                                            Class Name
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
                                            placeholder="e.g. Class 10"
                                            minLength={2}
                                            maxLength={50}
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
                                                formData.description.length
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
                                            : editingClassId
                                                ? "Update Class"
                                                : "Save Class"}

                                    </button>

                                </div>

                            </form>

                        </div>

                    )}

                    {/* =========================
                        TABLE CARD
                    ========================== */}

                    <div className="classes-table-card">

                        {/* SEARCH + FILTER TOOLBAR */}

                        <div className="classes-toolbar">

                            <div className="search-box">

                                <span className="search-icon">
                                    🔍
                                </span>

                                <input
                                    type="text"
                                    placeholder="Search classes..."
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

                                {/* STATUS */}

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

                        {/* TABLE HEADER */}

                        <div className="table-header">

                            <div>

                                <h2>
                                    All Classes
                                </h2>

                                <p>

                                    {totalElements}{" "}
                                    {totalElements === 1
                                        ? "class"
                                        : "classes"}{" "}
                                    registered

                                </p>

                            </div>

                        </div>

                        {/* =========================
                            LOADING
                        ========================== */}

                        {loading ? (

                            <div className="table-state">

                                <div className="spinner"></div>

                                <p>
                                    Loading classes...
                                </p>

                            </div>

                        ) : classes.length === 0 ? (

                            /* =========================
                               EMPTY / NO RESULTS
                            ========================== */

                            <div className="table-state">

                                <div className="empty-icon">

                                    {searchTerm ||
                                    statusFilter
                                        ? "🔍"
                                        : "📚"}

                                </div>

                                <h3>

                                    {searchTerm ||
                                    statusFilter
                                        ? "No classes found"
                                        : "No classes yet"}

                                </h3>

                                <p>

                                    {searchTerm ||
                                    statusFilter
                                        ? "Try changing your search or filter."
                                        : "Start by adding your first class."}

                                </p>

                                {!searchTerm &&
                                    !statusFilter && (

                                        <button
                                            className="add-class-btn"
                                            onClick={
                                                handleAddClass
                                            }
                                        >
                                            + Add Class
                                        </button>

                                    )}

                            </div>

                        ) : (

                            /* =========================
                               TABLE
                            ========================== */

                            <>

                                <div className="table-wrapper">

                                    <table className="classes-table">

                                        <thead>

                                            <tr>

                                                <th>
                                                    ID
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

                                            {classes.map(
                                                (schoolClass) => (

                                                    <tr
                                                        key={
                                                            schoolClass.id
                                                        }
                                                    >

                                                        {/* ID */}

                                                        <td>

                                                            <span className="class-id">

                                                                #

                                                                {
                                                                    schoolClass.id
                                                                }

                                                            </span>

                                                        </td>

                                                        {/* CLASS */}

                                                        <td>

                                                            <div className="class-info">

                                                                <div className="class-avatar">
                                                                    📚
                                                                </div>

                                                                <strong>

                                                                    {
                                                                        schoolClass.name
                                                                    }

                                                                </strong>

                                                            </div>

                                                        </td>

                                                        {/* DESCRIPTION */}

                                                        <td>

                                                            <span className="description-text">

                                                                {
                                                                    schoolClass.description ||
                                                                    "No description"
                                                                }

                                                            </span>

                                                        </td>

                                                        {/* STATUS */}

                                                        <td>

                                                            <select
                                                                className={`status-select status-${schoolClass.status?.toLowerCase()}`}
                                                                value={
                                                                    schoolClass.status
                                                                }
                                                                onChange={
                                                                    (e) =>
                                                                        handleStatusChange(
                                                                            schoolClass.id,
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

                                                        {/* ACTIONS */}

                                                        <td>

                                                            <div className="action-buttons">

                                                                <button
                                                                    className="edit-btn"
                                                                    onClick={() =>
                                                                        handleEdit(
                                                                            schoolClass
                                                                        )
                                                                    }
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    className="delete-btn"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            schoolClass.id
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

                                {/* =========================
                                    PAGINATION
                                ========================== */}

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

                                                {" "}classes

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

export default Classes;