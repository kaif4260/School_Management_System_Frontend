import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
    searchStudents,
    createStudent,
    updateStudent,
    deleteStudent
} from "../../services/studentService";

import PasswordInput from "../../components/PasswordInput";

import "./students.css";

function Students() {

    const [students, setStudents] = useState([]);

    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [showForm, setShowForm] = useState(false);
    const [editingStudentId, setEditingStudentId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        address: ""
    });

    useEffect(() => {

        const timer = setTimeout(() => {
            fetchStudents();
        }, 400);

        return () => clearTimeout(timer);

    }, [searchTerm, currentPage, pageSize]);

    const fetchStudents = async () => {

        try {

            setLoading(true);
            setError("");

            const data = await searchStudents({
                keyword: searchTerm,
                page: currentPage,
                size: pageSize
            });

            setStudents(data.content);

            setTotalElements(data.totalElements);
            setTotalPages(data.totalPages);

        } catch (error) {

            console.error(
                "Failed to fetch students:",
                error
            );

            setError(
                "Unable to load students. Please try again."
            );

        } finally {

            setLoading(false);
        }
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
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            phone: "",
            address: ""
        });

        setEditingStudentId(null);
        setShowForm(false);
        setError("");
    };

    const handleAddStudent = () => {

        resetForm();
        setShowForm(true);
    };

    const handleEdit = (student) => {

        setEditingStudentId(student.id);

        setFormData({
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            password: "",
            phone: student.phone,
            address: student.address
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

            const studentData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                address: formData.address
            };

            if (formData.password.trim() !== "") {
                studentData.password = formData.password;
            }

            if (editingStudentId) {

                await updateStudent(
                    editingStudentId,
                    studentData
                );

            } else {

                await createStudent({
                    ...studentData,
                    password: formData.password
                });
            }

            resetForm();

            await fetchStudents();

        } catch (error) {

            console.error(
                "Failed to save student:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to save student. Please check the information and try again."
            );

        } finally {

            setSaving(false);
        }
    };

    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this student? This will also remove their login account."
        );

        if (!confirmed) {
            return;
        }

        try {

            setError("");

            await deleteStudent(id);

            await fetchStudents();

        } catch (error) {

            console.error(
                "Failed to delete student:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to delete student."
            );
        }
    };

    return (
        <div className="admin-page">

            <Navbar />

            <div className="admin-content">

                <Sidebar />

                <main className="students-main">

                    {/* PAGE HEADER */}

                    <div className="students-header">

                        <div>
                            <h1>Students</h1>

                            <p>
                                Manage student profiles, contact
                                information and accounts.
                            </p>
                        </div>

                        <button
                            className="add-student-btn"
                            onClick={handleAddStudent}
                        >
                            <span className="plus-icon">+</span>
                            Add Student
                        </button>

                    </div>


                    {/* STAT CARDS */}

                    <div className="student-stats">

                        <div className="student-stat-card">

                            <div className="stat-icon">
                                👨‍🎓
                            </div>

                            <div>
                                <span>Total Students</span>
                                <strong>{totalElements}</strong>
                            </div>

                        </div>

                        <div className="student-stat-card">

                            <div className="stat-icon">
                                ✓
                            </div>

                            <div>
                                <span>Active Records</span>
                                <strong>{totalElements}</strong>
                            </div>

                        </div>

                    </div>


                    {/* ERROR */}

                    {error && (
                        <div className="error-message">
                            <span>⚠</span>
                            {error}
                        </div>
                    )}


                    {/* ADD / EDIT FORM */}

                    {showForm && (

                        <div className="student-form-card">

                            <div className="form-header">

                                <div>
                                    <h2>
                                        {editingStudentId
                                            ? "Edit Student"
                                            : "Add New Student"}
                                    </h2>

                                    <p>
                                        {editingStudentId
                                            ? "Update the student's information below."
                                            : "Enter the student's details to create a new record."}
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

                                    <div className="form-group">
                                        <label>
                                            First Name
                                        </label>

                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="Enter first name"
                                            required
                                        />
                                    </div>


                                    <div className="form-group">
                                        <label>
                                            Last Name
                                        </label>

                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            placeholder="Enter last name"
                                            required
                                        />
                                    </div>


                                    <div className="form-group">
                                        <label>
                                            Email Address
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="student@example.com"
                                            required
                                        />
                                    </div>


                                    <div className="form-group">
                                        <label>
                                            Phone Number
                                        </label>

                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="10-digit phone number"
                                            maxLength="10"
                                            required
                                        />
                                    </div>


                                    <div className="form-group">
                                        <label>
                                            Password
                                            {editingStudentId && (
                                                <span className="optional">
                                                    Optional
                                                </span>
                                            )}
                                        </label>

                                        <PasswordInput
                                            id="student-password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder={
                                                editingStudentId
                                                    ? "Leave blank to keep current password"
                                                    : "Minimum 8 characters"
                                            }
                                            minLength={8}
                                            required={!editingStudentId}
                                        />
                                    </div>


                                    <div className="form-group full-width">
                                        <label>
                                            Address
                                        </label>

                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="Enter complete address"
                                            rows="3"
                                            required
                                        />
                                    </div>

                                </div>


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
                                            : editingStudentId
                                                ? "Update Student"
                                                : "Save Student"}
                                    </button>

                                </div>

                            </form>

                        </div>
                    )}


                    {/* STUDENTS TABLE */}

                    <div className="students-table-card">

                        <div className="table-header">

                            <div>
                                <h2>All Students</h2>

                                <p>
                                    {totalElements} student
                                    {totalElements !== 1
                                        ? "s"
                                        : ""}{" "}
                                    registered
                                </p>
                            </div>

                            <div className="students-toolbar">

                                <div className="student-search-box">

                                    <span className="search-icon">
                                        🔍
                                    </span>

                                    <input
                                        type="text"
                                        placeholder="Search by name, email or phone..."
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setCurrentPage(0);
                                        }}
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

                                <select
                                    className="page-size-select"
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(0);
                                    }}
                                >
                                    <option value={5}>5 / page</option>
                                    <option value={10}>10 / page</option>
                                    <option value={20}>20 / page</option>
                                    <option value={50}>50 / page</option>
                                </select>

                            </div>

                        </div>


                        {loading ? (

                            <div className="table-state">
                                <div className="spinner"></div>
                                <p>Loading students...</p>
                            </div>

                        ) : students.length === 0 ? (

                            <div className="table-state">

                                <div className="empty-icon">
                                    👨‍🎓
                                </div>

                                <h3>
                                    {searchTerm
                                        ? "No students found"
                                        : "No students yet"}
                                </h3>

                                <p>
                                    {searchTerm
                                        ? `No students match "${searchTerm}".`
                                        : "Start by adding your first student."}
                                </p>

                                {searchTerm ? (

                                    <button
                                        className="clear-search-btn"
                                        onClick={() => {
                                            setSearchTerm("");
                                            setCurrentPage(0);
                                        }}
                                    >
                                        Clear Search
                                    </button>

                                ) : (

                                    <button
                                        className="add-student-btn"
                                        onClick={handleAddStudent}
                                    >
                                        + Add Student
                                    </button>

                                )}

                            </div>

                        ) : (

                            <div className="table-wrapper">

                                <table className="students-table">

                                    <thead>

                                        <tr>
                                            <th>ID</th>
                                            <th>Student</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Address</th>
                                            <th>Actions</th>
                                        </tr>

                                    </thead>

                                    <tbody>

                                        {students.map((student) => (

                                            <tr key={student.id}>

                                                <td>
                                                    <span className="student-id">
                                                        #{student.id}
                                                    </span>
                                                </td>

                                                <td>

                                                    <div className="student-info">

                                                        <div className="student-avatar">
                                                            {student.firstName
                                                                ?.charAt(0)
                                                                .toUpperCase()}
                                                            {student.lastName
                                                                ?.charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <strong>
                                                                {student.firstName}{" "}
                                                                {student.lastName}
                                                            </strong>

                                                            <span>
                                                                Student
                                                            </span>
                                                        </div>

                                                    </div>

                                                </td>

                                                <td>
                                                    {student.email}
                                                </td>

                                                <td>
                                                    {student.phone}
                                                </td>

                                                <td className="address-cell">
                                                    {student.address}
                                                </td>

                                                <td>

                                                    <div className="action-buttons">

                                                        <button
                                                            className="edit-btn"
                                                            onClick={() =>
                                                                handleEdit(student)
                                                            }
                                                        >
                                                            Edit
                                                        </button>

                                                        <button
                                                            className="delete-btn"
                                                            onClick={() =>
                                                                handleDelete(
                                                                    student.id
                                                                )
                                                            }
                                                        >
                                                            Delete
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                        {!loading && students.length > 0 && totalPages > 0 && (

                            <div className="students-pagination">

                                <div className="pagination-info">

                                    Showing{" "}
                                    <strong>
                                        {currentPage * pageSize + 1}
                                    </strong>
                                    {" "}to{" "}
                                    <strong>
                                        {Math.min(
                                            (currentPage + 1) * pageSize,
                                            totalElements
                                        )}
                                    </strong>
                                    {" "}of{" "}
                                    <strong>{totalElements}</strong>
                                    {" "}students

                                </div>


                                <div className="pagination-controls">

                                    <button
                                        disabled={currentPage === 0}
                                        onClick={() =>
                                            setCurrentPage(
                                                currentPage - 1
                                            )
                                        }
                                    >
                                        ← Previous
                                    </button>


                                    {Array.from(
                                        { length: totalPages },
                                        (_, index) => index
                                    ).map((page) => (

                                        <button
                                            key={page}
                                            className={
                                                currentPage === page
                                                    ? "active"
                                                    : ""
                                            }
                                            onClick={() =>
                                                setCurrentPage(page)
                                            }
                                        >
                                            {page + 1}
                                        </button>

                                    ))}


                                    <button
                                        disabled={
                                            currentPage >= totalPages - 1
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

                    </div>

                </main>

            </div>

        </div>
    );
}

export default Students;