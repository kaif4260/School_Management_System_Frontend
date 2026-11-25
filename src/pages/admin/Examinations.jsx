import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
    searchExaminations,
    createExamination,
    updateExamination,
    updateExaminationStatus,
    deleteExamination
} from "../../services/examinationService";

import "./examinations.css";

const initialFormData = {
    name: "",
    description: "",
    academicYear: "",
    startDate: "",
    endDate: ""
};

function Examinations() {

    const [examinations, setExaminations] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [upcomingCount, setUpcomingCount] = useState(0);

    const [formData, setFormData] = useState(initialFormData);


    /* =========================================
       FETCH EXAMINATIONS
    ========================================= */

    const fetchExaminations = async (
        page = currentPage,
        size = pageSize,
        keyword = search,
        status = statusFilter
    ) => {

        try {

            setLoading(true);
            setError("");

            const data = await searchExaminations({
                keyword,
                status,
                page,
                size
            });

            setExaminations(data.content || []);
            setCurrentPage(data.pageNumber ?? page);
            setPageSize(data.pageSize ?? size);
            setTotalElements(data.totalElements ?? 0);
            setTotalPages(data.totalPages ?? 0);


            // Get upcoming count
            const upcomingData = await searchExaminations({
                keyword: "",
                status: "UPCOMING",
                page: 0,
                size: 1
            });

            setUpcomingCount(upcomingData.totalElements ?? 0);

        } catch (err) {

            console.error(err);

            setError(
                err?.response?.data?.message ||
                "Failed to load examinations."
            );

        } finally {

            setLoading(false);
        }
    };


    /* =========================================
       INITIAL LOAD
    ========================================= */

    useEffect(() => {

        fetchExaminations();

    }, []);


    /* =========================================
       DEBOUNCED SEARCH
    ========================================= */

    useEffect(() => {

        const timer = setTimeout(() => {

            if (currentPage !== 0) {
                setCurrentPage(0);
                fetchExaminations(
                    0,
                    pageSize,
                    search,
                    statusFilter
                );
            } else {
                fetchExaminations(
                    0,
                    pageSize,
                    search,
                    statusFilter
                );
            }

        }, 400);

        return () => clearTimeout(timer);

    }, [search]);


    /* =========================================
       STATUS FILTER
    ========================================= */

    const handleStatusFilter = (value) => {

        setStatusFilter(value);
        setCurrentPage(0);

        fetchExaminations(
            0,
            pageSize,
            search,
            value
        );
    };


    /* =========================================
       FORM INPUT
    ========================================= */

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };


    /* =========================================
       OPEN CREATE FORM
    ========================================= */

    const handleAdd = () => {

        setEditingId(null);
        setFormData(initialFormData);
        setError("");
        setShowForm(true);
    };


    /* =========================================
       OPEN EDIT FORM
    ========================================= */

    const handleEdit = (examination) => {

        setEditingId(examination.id);

        setFormData({
            name: examination.name || "",
            description: examination.description || "",
            academicYear: examination.academicYear || "",
            startDate: examination.startDate || "",
            endDate: examination.endDate || ""
        });

        setError("");
        setShowForm(true);
    };


    /* =========================================
       CLOSE FORM
    ========================================= */

    const handleCloseForm = () => {

        if (saving) {
            return;
        }

        setShowForm(false);
        setEditingId(null);
        setFormData(initialFormData);
        setError("");
    };


    /* =========================================
       SUBMIT FORM
    ========================================= */

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);
            setError("");

            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                academicYear: formData.academicYear.trim(),
                startDate: formData.startDate,
                endDate: formData.endDate
            };

            if (editingId) {

                await updateExamination(
                    editingId,
                    payload
                );

            } else {

                await createExamination(payload);
            }

            handleCloseForm();

            await fetchExaminations(
                editingId ? currentPage : 0,
                pageSize,
                search,
                statusFilter
            );

        } catch (err) {

            console.error(err);

            setError(
                err?.response?.data?.message ||
                "Failed to save examination."
            );

        } finally {

            setSaving(false);
        }
    };


    /* =========================================
       DELETE
    ========================================= */

    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this examination?"
        );

        if (!confirmed) {
            return;
        }

        try {

            setError("");

            await deleteExamination(id);

            let pageToLoad = currentPage;

            if (
                examinations.length === 1 &&
                currentPage > 0
            ) {
                pageToLoad = currentPage - 1;
                setCurrentPage(pageToLoad);
            }

            await fetchExaminations(
                pageToLoad,
                pageSize,
                search,
                statusFilter
            );

        } catch (err) {

            console.error(err);

            setError(
                err?.response?.data?.message ||
                "Failed to delete examination."
            );
        }
    };


    /* =========================================
       STATUS UPDATE
    ========================================= */

    const handleStatusChange = async (id, status) => {

        try {

            setError("");

            await updateExaminationStatus(
                id,
                status
            );

            await fetchExaminations(
                currentPage,
                pageSize,
                search,
                statusFilter
            );

        } catch (err) {

            console.error(err);

            setError(
                err?.response?.data?.message ||
                "Failed to update examination status."
            );
        }
    };


    /* =========================================
       CLEAR SEARCH
    ========================================= */

    const handleClearSearch = () => {

        setSearch("");
        setStatusFilter("");
        setCurrentPage(0);

        fetchExaminations(
            0,
            pageSize,
            "",
            ""
        );
    };


    /* =========================================
       PAGE SIZE
    ========================================= */

    const handlePageSizeChange = (value) => {

        const newSize = Number(value);

        setPageSize(newSize);
        setCurrentPage(0);

        fetchExaminations(
            0,
            newSize,
            search,
            statusFilter
        );
    };


    /* =========================================
       PAGINATION
    ========================================= */

    const handlePageChange = (page) => {

        if (
            page < 0 ||
            page >= totalPages ||
            page === currentPage
        ) {
            return;
        }

        setCurrentPage(page);

        fetchExaminations(
            page,
            pageSize,
            search,
            statusFilter
        );
    };


    /* =========================================
       HELPERS
    ========================================= */

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };


    const getStatusClass = (status) => {

        switch (status) {

            case "UPCOMING":
                return "status-upcoming";

            case "ONGOING":
                return "status-ongoing";

            case "COMPLETED":
                return "status-completed";

            default:
                return "";
        }
    };


    const getInitial = (name) => {

        if (!name) {
            return "E";
        }

        return name
            .trim()
            .charAt(0)
            .toUpperCase();
    };


    const getActiveCount = () => {

        return examinations.filter(
            (exam) => exam.status === "ONGOING"
        ).length;
    };


    const uniqueAcademicYears = new Set(
        examinations.map(
            (exam) => exam.academicYear
        )
    ).size;


    /* =========================================
       PAGINATION NUMBERS
    ========================================= */

    const getPageNumbers = () => {

        const pages = [];

        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {

            for (let i = 0; i < totalPages; i++) {
                pages.push(i);
            }

            return pages;
        }

        let start = Math.max(
            0,
            currentPage - 2
        );

        let end = Math.min(
            totalPages,
            start + maxVisiblePages
        );

        if (end - start < maxVisiblePages) {
            start = Math.max(
                0,
                end - maxVisiblePages
            );
        }

        for (let i = start; i < end; i++) {
            pages.push(i);
        }

        return pages;
    };


    return (
        <div className="admin-page">

            <Navbar />

            <div className="admin-content">

                <Sidebar />

                <main className="examinations-main">

                    {/* =========================================
                        HEADER
                    ========================================= */}

                    <div className="examinations-header">

                        <div>
                            <h1>Examinations</h1>

                            <p>
                                Manage school examinations,
                                schedules and examination status.
                            </p>
                        </div>

                        <button
                            className="add-examination-btn"
                            onClick={handleAdd}
                        >
                            <span className="plus-icon">
                                +
                            </span>

                            Add Examination
                        </button>

                    </div>


                    {/* =========================================
                        ERROR
                    ========================================= */}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}


                    {/* =========================================
                        STATS
                    ========================================= */}

                    <div className="examination-stats">

                        <div className="examination-stat-card">

                            <div className="stat-icon">
                                📋
                            </div>

                            <div>
                                <h3>
                                    {totalElements}
                                </h3>

                                <p>
                                    Total Examinations
                                </p>
                            </div>

                        </div>


                        <div className="examination-stat-card">

                            <div className="stat-icon">
                                📅
                            </div>

                            <div>
                                <h3>
                                    {upcomingCount}
                                </h3>

                                <p>
                                    Upcoming
                                </p>
                            </div>

                        </div>


                        <div className="examination-stat-card">

                            <div className="stat-icon">
                                🎓
                            </div>

                            <div>
                                <h3>
                                    {uniqueAcademicYears}
                                </h3>

                                <p>
                                    Academic Years
                                </p>
                            </div>

                        </div>

                    </div>


                    {/* =========================================
                        FORM
                    ========================================= */}

                    {showForm && (

                        <div className="examination-form-card">

                            <div className="form-header">

                                <h2>
                                    {editingId
                                        ? "Edit Examination"
                                        : "Add Examination"}
                                </h2>

                                <button
                                    type="button"
                                    className="close-form-btn"
                                    onClick={handleCloseForm}
                                    disabled={saving}
                                >
                                    ×
                                </button>

                            </div>


                            <form
                                onSubmit={handleSubmit}
                            >

                                <div className="form-grid">

                                    <div className="form-group">

                                        <label>
                                            Examination Name
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="e.g. Mid Term Examination"
                                            required
                                            minLength={2}
                                            maxLength={100}
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Academic Year
                                        </label>

                                        <input
                                            type="text"
                                            name="academicYear"
                                            value={formData.academicYear}
                                            onChange={handleChange}
                                            placeholder="e.g. 2026-27"
                                            pattern="\d{4}-\d{2}"
                                            required
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Start Date
                                        </label>

                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            required
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            End Date
                                        </label>

                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            required
                                        />

                                    </div>


                                    <div className="form-group full-width">

                                        <label>
                                            Description
                                            <span className="optional">
                                                {" "}
                                                (Optional)
                                            </span>
                                        </label>

                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Enter examination description..."
                                            maxLength={255}
                                        />

                                    </div>

                                </div>


                                <div className="form-actions">

                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={handleCloseForm}
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
                                            : editingId
                                                ? "Update Examination"
                                                : "Create Examination"}
                                    </button>

                                </div>

                            </form>

                        </div>

                    )}


                    {/* =========================================
                        TABLE CARD
                    ========================================= */}

                    <div className="examinations-table-card">

                        <div className="table-header">

                            <h2>
                                Examination List
                            </h2>

                        </div>


                        {/* TOOLBAR */}

                        <div className="examinations-toolbar">

                            <div className="examination-search-box">

                                <span className="search-icon">
                                    🔍
                                </span>

                                <input
                                    type="text"
                                    placeholder="Search examinations, academic year..."
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(e.target.value)
                                    }
                                />

                                {search && (
                                    <button
                                        className="clear-search"
                                        onClick={handleClearSearch}
                                        type="button"
                                    >
                                        ×
                                    </button>
                                )}

                            </div>


                            <select
                                className="status-filter-select"
                                value={statusFilter}
                                onChange={(e) =>
                                    handleStatusFilter(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="">
                                    All Status
                                </option>

                                <option value="UPCOMING">
                                    Upcoming
                                </option>

                                <option value="ONGOING">
                                    Ongoing
                                </option>

                                <option value="COMPLETED">
                                    Completed
                                </option>

                            </select>


                            <select
                                className="page-size-select"
                                value={pageSize}
                                onChange={(e) =>
                                    handlePageSizeChange(
                                        e.target.value
                                    )
                                }
                            >
                                <option value="10">
                                    10 / page
                                </option>

                                <option value="20">
                                    20 / page
                                </option>

                                <option value="50">
                                    50 / page
                                </option>

                            </select>

                        </div>


                        {/* TABLE */}

                        {loading ? (

                            <div className="table-state">

                                <div className="spinner"></div>

                                <p>
                                    Loading examinations...
                                </p>

                            </div>

                        ) : examinations.length === 0 ? (

                            <div className="table-state">

                                <div className="empty-icon">
                                    📋
                                </div>

                                <p>
                                    {search || statusFilter
                                        ? "No examinations found matching your search."
                                        : "No examinations available."}
                                </p>

                                {(search || statusFilter) && (
                                    <button
                                        className="clear-search-btn"
                                        onClick={handleClearSearch}
                                    >
                                        Clear Filters
                                    </button>
                                )}

                            </div>

                        ) : (

                            <div className="table-wrapper">

                                <table className="examinations-table">

                                    <thead>

                                        <tr>

                                            <th>ID</th>

                                            <th>
                                                Examination
                                            </th>

                                            <th>
                                                Academic Year
                                            </th>

                                            <th>
                                                Start Date
                                            </th>

                                            <th>
                                                End Date
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

                                        {examinations.map(
                                            (examination) => (

                                                <tr
                                                    key={
                                                        examination.id
                                                    }
                                                >

                                                    <td>
                                                        <span className="examination-id">
                                                            #
                                                            {
                                                                examination.id
                                                            }
                                                        </span>
                                                    </td>


                                                    <td>

                                                        <div className="examination-info">

                                                            <div className="examination-avatar">
                                                                {
                                                                    getInitial(
                                                                        examination.name
                                                                    )
                                                                }
                                                            </div>

                                                            <div>

                                                                <div className="examination-name">
                                                                    {
                                                                        examination.name
                                                                    }
                                                                </div>

                                                                {examination.description && (

                                                                    <div className="examination-description">
                                                                        {
                                                                            examination.description
                                                                        }
                                                                    </div>

                                                                )}

                                                            </div>

                                                        </div>

                                                    </td>


                                                    <td>

                                                        <span className="academic-year">
                                                            {
                                                                examination.academicYear
                                                            }
                                                        </span>

                                                    </td>


                                                    <td>
                                                        {
                                                            formatDate(
                                                                examination.startDate
                                                            )
                                                        }
                                                    </td>


                                                    <td>
                                                        {
                                                            formatDate(
                                                                examination.endDate
                                                            )
                                                        }
                                                    </td>


                                                    <td>

                                                        <select
                                                            className={`status-select ${getStatusClass(
                                                                examination.status
                                                            )}`}
                                                            value={
                                                                examination.status
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                handleStatusChange(
                                                                    examination.id,
                                                                    e.target.value
                                                                )
                                                            }
                                                        >

                                                            <option value="UPCOMING">
                                                                Upcoming
                                                            </option>

                                                            <option value="ONGOING">
                                                                Ongoing
                                                            </option>

                                                            <option value="COMPLETED">
                                                                Completed
                                                            </option>

                                                        </select>

                                                    </td>


                                                    <td>

                                                        <div className="action-buttons">

                                                            <button
                                                                className="edit-btn"
                                                                onClick={() =>
                                                                    handleEdit(
                                                                        examination
                                                                    )
                                                                }
                                                                title="Edit"
                                                            >
                                                                ✏️
                                                            </button>


                                                            <button
                                                                className="delete-btn"
                                                                onClick={() =>
                                                                    handleDelete(
                                                                        examination.id
                                                                    )
                                                                }
                                                                title="Delete"
                                                            >
                                                                🗑️
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


                        {/* PAGINATION */}

                        {!loading &&
                            totalPages > 0 && (

                                <div className="examinations-pagination">

                                    <div className="pagination-info">

                                        Showing{" "}
                                        {totalElements === 0
                                            ? 0
                                            : currentPage *
                                                pageSize +
                                            1}
                                        {" - "}
                                        {Math.min(
                                            (currentPage + 1) *
                                                pageSize,
                                            totalElements
                                        )}
                                        {" of "}
                                        {totalElements}

                                    </div>


                                    <div className="pagination-controls">

                                        <button
                                            className="page-number"
                                            disabled={
                                                currentPage === 0
                                            }
                                            onClick={() =>
                                                handlePageChange(
                                                    currentPage - 1
                                                )
                                            }
                                        >
                                            ‹
                                        </button>


                                        {getPageNumbers().map(
                                            (page) => (

                                                <button
                                                    key={page}
                                                    className={`page-number ${
                                                        currentPage ===
                                                        page
                                                            ? "active"
                                                            : ""
                                                    }`}
                                                    onClick={() =>
                                                        handlePageChange(
                                                            page
                                                        )
                                                    }
                                                >
                                                    {page + 1}
                                                </button>

                                            )
                                        )}


                                        <button
                                            className="page-number"
                                            disabled={
                                                currentPage ===
                                                totalPages - 1
                                            }
                                            onClick={() =>
                                                handlePageChange(
                                                    currentPage + 1
                                                )
                                            }
                                        >
                                            ›
                                        </button>

                                    </div>

                                </div>

                            )}

                    </div>

                </main>

            </div>

        </div>
    );
}

export default Examinations;