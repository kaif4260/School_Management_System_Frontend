import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import PasswordInput from "../../components/PasswordInput";

import {
    searchTeachers,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    updateTeacherStatus
} from "../../services/teacherService";

import "./teachers.css";

function Teachers() {

    const [teachers, setTeachers] = useState([]);

    // SEARCH / FILTER / PAGINATION
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [activeTeachers, setActiveTeachers] = useState(0);

    // FORM
    const [showForm, setShowForm] = useState(false);
    const [editingTeacherId, setEditingTeacherId] = useState(null);

    // LOADING
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        employeeId: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        qualification: "",
        specialization: "",
        joiningDate: ""
    });

    /*
     * SEARCH / FILTER / PAGINATION
     *
     * Debounced by 400ms so the backend is not called
     * for every single character immediately.
     */
    useEffect(() => {

        const timer = setTimeout(() => {
            fetchTeachers();
        }, 400);

        return () => clearTimeout(timer);

    }, [searchTerm, statusFilter, currentPage, pageSize]);


    const fetchTeachers = async () => {

        try {

            setLoading(true);
            setError("");

            const [teacherData, activeData] =
                await Promise.all([
                    searchTeachers({
                        keyword: searchTerm,
                        status: statusFilter,
                        page: currentPage,
                        size: pageSize
                    }),

                    // Get total active teachers independently
                    searchTeachers({
                        keyword: "",
                        status: "ACTIVE",
                        page: 0,
                        size: 1
                    })
                ]);

            setTeachers(teacherData.content || []);

            setTotalElements(
                teacherData.totalElements || 0
            );

            setTotalPages(
                teacherData.totalPages || 0
            );

            setActiveTeachers(
                activeData.totalElements || 0
            );

        } catch (error) {

            console.error(
                "Failed to fetch teachers:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to load teachers. Please try again."
            );

        } finally {

            setLoading(false);
        }
    };


    const handleSearchChange = (e) => {

        setSearchTerm(e.target.value);

        // Always return to first page when searching
        setCurrentPage(0);
    };


    const handleStatusFilterChange = (e) => {

        setStatusFilter(e.target.value);

        // Always return to first page when filtering
        setCurrentPage(0);
    };


    const handlePageSizeChange = (e) => {

        setPageSize(Number(e.target.value));

        // Return to first page when page size changes
        setCurrentPage(0);
    };


    const clearSearch = () => {

        setSearchTerm("");
        setStatusFilter("");
        setCurrentPage(0);
    };


    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };


    const resetForm = () => {

        setFormData({
            employeeId: "",
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            phone: "",
            qualification: "",
            specialization: "",
            joiningDate: ""
        });

        setEditingTeacherId(null);
        setShowForm(false);
        setError("");
    };


    const handleAddTeacher = () => {

        resetForm();
        setShowForm(true);
    };


    const handleEdit = (teacher) => {

        setEditingTeacherId(teacher.id);

        setFormData({
            employeeId: teacher.employeeId,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email: teacher.email,
            password: "",
            phone: teacher.phone,
            qualification: teacher.qualification,
            specialization: teacher.specialization || "",
            joiningDate: teacher.joiningDate
        });

        setShowForm(true);
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };


    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);
            setError("");

            const teacherData = {
                employeeId: formData.employeeId,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                qualification: formData.qualification,
                specialization: formData.specialization,
                joiningDate: formData.joiningDate
            };

            if (formData.password.trim() !== "") {

                teacherData.password =
                    formData.password;
            }

            if (editingTeacherId) {

                await updateTeacher(
                    editingTeacherId,
                    teacherData
                );

            } else {

                await createTeacher({
                    ...teacherData,
                    password: formData.password
                });
            }

            resetForm();

            /*
             * Return to first page after creating/updating
             * so the user gets predictable results.
             */
            setCurrentPage(0);

            await fetchTeachers();

        } catch (error) {

            console.error(
                "Failed to save teacher:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to save teacher. Please check the information and try again."
            );

        } finally {

            setSaving(false);
        }
    };


    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this teacher? This will also remove their login account."
        );

        if (!confirmed) {
            return;
        }

        try {

            setError("");

            await deleteTeacher(id);

            /*
             * If deleting the last item on a page,
             * move back one page if necessary.
             */
            if (
                teachers.length === 1 &&
                currentPage > 0
            ) {
                setCurrentPage(
                    currentPage - 1
                );
            } else {
                await fetchTeachers();
            }

        } catch (error) {

            console.error(
                "Failed to delete teacher:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to delete teacher."
            );
        }
    };


    const handleStatusChange = async (id, status) => {

        try {

            setError("");

            await updateTeacherStatus(
                id,
                status
            );

            await fetchTeachers();

        } catch (error) {

            console.error(
                "Failed to update teacher status:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to update teacher status."
            );
        }
    };


    return (
        <div className="admin-page">

            <Navbar />

            <div className="admin-content">

                <Sidebar />

                <main className="teachers-main">

                    {/* =========================
                        HEADER
                    ========================= */}

                    <div className="teachers-header">

                        <div>
                            <h1>Teachers</h1>

                            <p>
                                Manage teacher profiles,
                                qualifications and accounts.
                            </p>
                        </div>

                        <button
                            className="add-teacher-btn"
                            onClick={handleAddTeacher}
                        >
                            <span className="plus-icon">
                                +
                            </span>

                            Add Teacher
                        </button>

                    </div>


                    {/* =========================
                        STAT CARDS
                    ========================= */}

                    <div className="teacher-stats">

                        <div className="teacher-stat-card">

                            <div className="stat-icon">
                                👨‍🏫
                            </div>

                            <div>
                                <span>
                                    Total Teachers
                                </span>

                                <strong>
                                    {totalElements}
                                </strong>
                            </div>

                        </div>


                        <div className="teacher-stat-card">

                            <div className="stat-icon">
                                ✓
                            </div>

                            <div>
                                <span>
                                    Active Teachers
                                </span>

                                <strong>
                                    {activeTeachers}
                                </strong>
                            </div>

                        </div>

                    </div>


                    {/* =========================
                        ERROR
                    ========================= */}

                    {error && (
                        <div className="error-message">

                            <span>⚠</span>

                            {error}

                        </div>
                    )}


                    {/* =========================
                        FORM
                    ========================= */}

                    {showForm && (

                        <div className="teacher-form-card">

                            <div className="form-header">

                                <div>

                                    <h2>
                                        {editingTeacherId
                                            ? "Edit Teacher"
                                            : "Add New Teacher"}
                                    </h2>

                                    <p>
                                        {editingTeacherId
                                            ? "Update the teacher's information below."
                                            : "Enter the teacher's details to create a new record."}
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

                                    {/* EMPLOYEE ID */}

                                    <div className="form-group">

                                        <label>
                                            Employee ID
                                        </label>

                                        <input
                                            type="text"
                                            name="employeeId"
                                            value={
                                                formData.employeeId
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="e.g. EMP001"
                                            maxLength="20"
                                            required
                                        />

                                    </div>


                                    {/* FIRST NAME */}

                                    <div className="form-group">

                                        <label>
                                            First Name
                                        </label>

                                        <input
                                            type="text"
                                            name="firstName"
                                            value={
                                                formData.firstName
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter first name"
                                            required
                                        />

                                    </div>


                                    {/* LAST NAME */}

                                    <div className="form-group">

                                        <label>
                                            Last Name
                                        </label>

                                        <input
                                            type="text"
                                            name="lastName"
                                            value={
                                                formData.lastName
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter last name"
                                            required
                                        />

                                    </div>


                                    {/* EMAIL */}

                                    <div className="form-group">

                                        <label>
                                            Email Address
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            value={
                                                formData.email
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="teacher@example.com"
                                            required
                                        />

                                    </div>


                                    {/* PHONE */}

                                    <div className="form-group">

                                        <label>
                                            Phone Number
                                        </label>

                                        <input
                                            type="text"
                                            name="phone"
                                            value={
                                                formData.phone
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="10-digit phone number"
                                            maxLength="10"
                                            required
                                        />

                                    </div>


                                    {/* PASSWORD */}

                                    <div className="form-group">

                                        <label>
                                            Password

                                            {editingTeacherId && (
                                                <span className="optional">
                                                    Optional
                                                </span>
                                            )}
                                        </label>

                                        <PasswordInput
                                            id="teacher-password"
                                            name="password"
                                            value={
                                                formData.password
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder={
                                                editingTeacherId
                                                    ? "Leave blank to keep current password"
                                                    : "Minimum 8 characters"
                                            }
                                            minLength={8}
                                            required={
                                                !editingTeacherId
                                            }
                                        />

                                    </div>


                                    {/* QUALIFICATION */}

                                    <div className="form-group">

                                        <label>
                                            Qualification
                                        </label>

                                        <input
                                            type="text"
                                            name="qualification"
                                            value={
                                                formData.qualification
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="e.g. M.Sc Mathematics"
                                            maxLength="100"
                                            required
                                        />

                                    </div>


                                    {/* SPECIALIZATION */}

                                    <div className="form-group">

                                        <label>
                                            Specialization

                                            <span className="optional">
                                                Optional
                                            </span>
                                        </label>

                                        <input
                                            type="text"
                                            name="specialization"
                                            value={
                                                formData.specialization
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="e.g. Algebra"
                                            maxLength="100"
                                        />

                                    </div>


                                    {/* JOINING DATE */}

                                    <div className="form-group">

                                        <label>
                                            Joining Date
                                        </label>

                                        <input
                                            type="date"
                                            name="joiningDate"
                                            value={
                                                formData.joiningDate
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            max={
                                                new Date()
                                                    .toISOString()
                                                    .split("T")[0]
                                            }
                                            required
                                        />

                                    </div>

                                </div>


                                {/* FORM ACTIONS */}

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
                                            : editingTeacherId
                                                ? "Update Teacher"
                                                : "Save Teacher"}
                                    </button>

                                </div>

                            </form>

                        </div>
                    )}


                    {/* =========================
                        TEACHERS TABLE CARD
                    ========================= */}

                    <div className="teachers-table-card">

                        <div className="table-header">

                            <div>

                                <h2>
                                    All Teachers
                                </h2>

                                <p>
                                    {totalElements} teacher
                                    {totalElements !== 1
                                        ? "s"
                                        : ""}{" "}
                                    registered
                                </p>

                            </div>


                            {/* =========================
                                SEARCH / FILTER TOOLBAR
                            ========================= */}

                            <div className="teachers-toolbar">

                                {/* SEARCH */}

                                <div className="teacher-search-box">

                                    <span className="search-icon">
                                        🔍
                                    </span>

                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={
                                            handleSearchChange
                                        }
                                        placeholder="Search by name, employee ID, email or phone..."
                                    />

                                    {searchTerm && (
                                        <button
                                            type="button"
                                            className="clear-search"
                                            onClick={() =>
                                                setSearchTerm("")
                                            }
                                        >
                                            ×
                                        </button>
                                    )}

                                </div>


                                {/* STATUS FILTER */}

                                <select
                                    className="status-filter-select"
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

                                    <option value="ON_LEAVE">
                                        On Leave
                                    </option>

                                    <option value="RESIGNED">
                                        Resigned
                                    </option>

                                </select>


                                {/* PAGE SIZE */}

                                <select
                                    className="page-size-select"
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


                        {/* =========================
                            LOADING
                        ========================= */}

                        {loading ? (

                            <div className="table-state">

                                <div className="spinner"></div>

                                <p>
                                    Loading teachers...
                                </p>

                            </div>


                        ) : teachers.length === 0 ? (

                            /* =========================
                               EMPTY / NO SEARCH RESULTS
                            ========================= */

                            <div className="table-state">

                                <div className="empty-icon">
                                    👨‍🏫
                                </div>

                                <h3>
                                    {
                                        searchTerm ||
                                        statusFilter
                                            ? "No teachers found"
                                            : "No teachers found"
                                    }
                                </h3>

                                <p>
                                    {
                                        searchTerm ||
                                        statusFilter
                                            ? "Try changing your search or filter."
                                            : "Start by adding your first teacher."
                                    }
                                </p>

                                {
                                    (searchTerm ||
                                        statusFilter) ? (

                                        <button
                                            className="clear-search-btn"
                                            onClick={
                                                clearSearch
                                            }
                                        >
                                            Clear Search & Filters
                                        </button>

                                    ) : (

                                        <button
                                            className="add-teacher-btn"
                                            onClick={
                                                handleAddTeacher
                                            }
                                        >
                                            + Add Teacher
                                        </button>
                                    )}

                            </div>


                        ) : (

                            /* =========================
                               TABLE
                            ========================= */

                            <>

                                <div className="table-wrapper">

                                    <table className="teachers-table">

                                        <thead>

                                            <tr>

                                                <th>
                                                    ID
                                                </th>

                                                <th>
                                                    Teacher
                                                </th>

                                                <th>
                                                    Employee ID
                                                </th>

                                                <th>
                                                    Qualification
                                                </th>

                                                <th>
                                                    Contact
                                                </th>

                                                <th>
                                                    Joining Date
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

                                            {teachers.map(
                                                (teacher) => (

                                                    <tr
                                                        key={
                                                            teacher.id
                                                        }
                                                    >

                                                        <td>

                                                            <span className="teacher-id">
                                                                #
                                                                {
                                                                    teacher.id
                                                                }
                                                            </span>

                                                        </td>


                                                        {/* TEACHER */}

                                                        <td>

                                                            <div className="teacher-info">

                                                                <div className="teacher-avatar">

                                                                    {
                                                                        teacher.firstName
                                                                            ?.charAt(
                                                                                0
                                                                            )
                                                                            .toUpperCase()
                                                                    }

                                                                    {
                                                                        teacher.lastName
                                                                            ?.charAt(
                                                                                0
                                                                            )
                                                                            .toUpperCase()
                                                                    }

                                                                </div>

                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            teacher.firstName
                                                                        }{" "}
                                                                        {
                                                                            teacher.lastName
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            teacher.specialization ||
                                                                            teacher.qualification
                                                                        }
                                                                    </span>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        {/* EMPLOYEE ID */}

                                                        <td>

                                                            {
                                                                teacher.employeeId
                                                            }

                                                        </td>


                                                        {/* QUALIFICATION */}

                                                        <td>

                                                            {
                                                                teacher.qualification
                                                            }

                                                        </td>


                                                        {/* CONTACT */}

                                                        <td>

                                                            <div className="contact-info">

                                                                <span>
                                                                    {
                                                                        teacher.email
                                                                    }
                                                                </span>

                                                                <span>
                                                                    {
                                                                        teacher.phone
                                                                    }
                                                                </span>

                                                            </div>

                                                        </td>


                                                        {/* JOINING DATE */}

                                                        <td>

                                                            {
                                                                teacher.joiningDate
                                                            }

                                                        </td>


                                                        {/* STATUS */}

                                                        <td>

                                                            <select
                                                                className={`status-select status-${teacher.status?.toLowerCase()}`}
                                                                value={
                                                                    teacher.status
                                                                }
                                                                onChange={
                                                                    (e) =>
                                                                        handleStatusChange(
                                                                            teacher.id,
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

                                                                <option value="ON_LEAVE">
                                                                    On Leave
                                                                </option>

                                                                <option value="RESIGNED">
                                                                    Resigned
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
                                                                            teacher
                                                                        )
                                                                    }
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    className="delete-btn"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            teacher.id
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
                                ========================= */}

                                {totalPages > 0 && (
                                    <div className="teachers-pagination">

                                        <div className="pagination-info">

                                            Showing{" "}

                                            <strong>
                                                {
                                                    currentPage *
                                                    pageSize +
                                                    1
                                                }
                                            </strong>

                                            {" "}to{" "}

                                            <strong>
                                                {Math.min(
                                                    (currentPage + 1) *
                                                        pageSize,
                                                    totalElements
                                                )}
                                            </strong>

                                            {" "}of{" "}

                                            <strong>
                                                {totalElements}
                                            </strong>

                                            {" "}teachers

                                        </div>


                                        <div className="pagination-controls">

                                            <button
                                                disabled={
                                                    currentPage === 0
                                                }
                                                onClick={() =>
                                                    setCurrentPage(
                                                        currentPage - 1
                                                    )
                                                }
                                            >
                                                ← Previous
                                            </button>


                                            {Array.from(
                                                {
                                                    length: totalPages
                                                },
                                                (_, index) => index
                                            ).map((page) => (

                                                <button
                                                    key={page}
                                                    className={
                                                        currentPage ===
                                                        page
                                                            ? "active"
                                                            : ""
                                                    }
                                                    onClick={() =>
                                                        setCurrentPage(
                                                            page
                                                        )
                                                    }
                                                >
                                                    {page + 1}
                                                </button>

                                            ))}


                                            <button
                                                disabled={
                                                    currentPage >=
                                                    totalPages - 1
                                                }
                                                onClick={() =>
                                                    setCurrentPage(
                                                        currentPage + 1
                                                    )
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

export default Teachers;