import { useEffect, useMemo, useState } from "react";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";

import "./student-enrollment.css";

const emptyForm = {
studentId: "",
classId: "",
sectionId: "",
academicYear: "2026-27"
};

function StudentEnrollment() {
const [enrollments, setEnrollments] = useState([]);
const [students, setStudents] = useState([]);
const [classes, setClasses] = useState([]);
const [sections, setSections] = useState([]);

const [form, setForm] = useState(emptyForm);
const [showForm, setShowForm] = useState(false);

const [searchTerm, setSearchTerm] = useState("");
const [classFilter, setClassFilter] = useState("");
const [sectionFilter, setSectionFilter] = useState("");
const [yearFilter, setYearFilter] = useState("");
const [statusFilter, setStatusFilter] = useState("");

const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");

const [page, setPage] = useState(0);
const [pageSize, setPageSize] = useState(10);

const loadData = async () => {
    try {
        setLoading(true);
        setError("");

        const [
            enrollmentResponse,
            studentResponse,
            classResponse,
            sectionResponse
        ] = await Promise.all([
            api.get("api/enrollments"),
            api.get("api/students/search", {
                params: { keyword: "", page: 0, size: 1000 }
            }),
            api.get("api/classes"),
            api.get("api/sections")
        ]);

        const studentData = studentResponse.data;
        setEnrollments(enrollmentResponse.data || []);
        setStudents(
            Array.isArray(studentData)
                ? studentData
                : studentData?.content || []
        );
        setClasses(classResponse.data || []);
        setSections(sectionResponse.data || []);
    } catch (err) {
        console.error("Failed to load enrollment data:", err);
        setError(
            err.response?.data?.message ||
            "Unable to load enrollment data. Please refresh and try again."
        );
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    loadData();
}, []);

const activeClasses = useMemo(
    () => classes.filter(item => item.status === "ACTIVE"),
    [classes]
);

const activeSections = useMemo(
    () => sections.filter(item => item.status === "ACTIVE"),
    [sections]
);

const availableSections = useMemo(
    () => activeSections.filter(
        section => String(section.classId) === String(form.classId)
    ),
    [activeSections, form.classId]
);

const studentById = useMemo(
    () => new Map(students.map(student => [String(student.id), student])),
    [students]
);

const classById = useMemo(
    () => new Map(classes.map(item => [String(item.id), item])),
    [classes]
);

const sectionById = useMemo(
    () => new Map(sections.map(item => [String(item.id), item])),
    [sections]
);

const academicYears = useMemo(
    () => [...new Set(enrollments.map(item => item.academicYear))].sort().reverse(),
    [enrollments]
);

const enrolledStudentYearKeys = useMemo(
    () => new Set(
        enrollments.map(item => `${item.studentId}-${item.academicYear}`)
    ),
    [enrollments]
);

const eligibleStudents = useMemo(
    () => students.filter(student =>
        !enrolledStudentYearKeys.has(
            `${student.id}-${form.academicYear}`
        )
    ),
    [students, enrolledStudentYearKeys, form.academicYear]
);

const filteredEnrollments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return enrollments.filter(enrollment => {
        const student = studentById.get(String(enrollment.studentId));
        const classItem = classById.get(String(enrollment.classId));
        const section = sectionById.get(String(enrollment.sectionId));

        const studentName = student
            ? `${student.firstName || ""} ${student.lastName || ""}`.trim()
            : "";

        const matchesSearch =
            !query ||
            studentName.toLowerCase().includes(query) ||
            String(student?.email || "").toLowerCase().includes(query) ||
            String(enrollment.studentId).includes(query);

        return (
            matchesSearch &&
            (!classFilter || String(enrollment.classId) === classFilter) &&
            (!sectionFilter || String(enrollment.sectionId) === sectionFilter) &&
            (!yearFilter || enrollment.academicYear === yearFilter) &&
            (!statusFilter || enrollment.status === statusFilter) &&
            (!classFilter || classItem)
        );
    });
}, [
    enrollments,
    students,
    studentById,
    classById,
    sectionById,
    searchTerm,
    classFilter,
    sectionFilter,
    yearFilter,
    statusFilter
]);

const totalPages = Math.ceil(filteredEnrollments.length / pageSize);

const visibleEnrollments = filteredEnrollments.slice(
    page * pageSize,
    (page + 1) * pageSize
);

const activeCount = enrollments.filter(
    item => item.status === "ACTIVE"
).length;

const completedCount = enrollments.filter(
    item => item.status === "COMPLETED"
).length;

const handleFormChange = event => {
    const { name, value } = event.target;

    setForm(previous => ({
        ...previous,
        [name]: value,
        ...(name === "classId" ? { sectionId: "" } : {})
    }));

    setError("");
    setSuccess("");
};

const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
    setError("");
};

const handleCreate = async event => {
    event.preventDefault();

    if (!form.studentId || !form.classId || !form.sectionId) {
        setError("Please select a student, class, and section.");
        return;
    }

    try {
        setSaving(true);
        setError("");
        setSuccess("");

        await api.post("api/enrollments", {
            studentId: Number(form.studentId),
            classId: Number(form.classId),
            sectionId: Number(form.sectionId),
            academicYear: form.academicYear.trim()
        });

        setSuccess("Student enrolled successfully.");
        setForm(emptyForm);
        setShowForm(false);
        setPage(0);

        await loadData();
    } catch (err) {
        console.error("Enrollment failed:", err);
        setError(
            err.response?.data?.message ||
            "Failed to enroll student. Check the selected details and academic year."
        );
    } finally {
        setSaving(false);
    }
};

const handleStatusChange = async (enrollment, status) => {
    if (status === enrollment.status) return;

    try {
        setError("");
        setSuccess("");

        await api.patch(
            `/enrollments/${enrollment.id}/status`,
            null,
            { params: { status } }
        );

        setSuccess(`Enrollment #${enrollment.id} status updated.`);
        await loadData();
    } catch (err) {
        console.error("Status update failed:", err);
        setError(
            err.response?.data?.message ||
            "Unable to update enrollment status."
        );
    }
};

const handleDelete = async enrollment => {
    const student = studentById.get(String(enrollment.studentId));
    const studentName = student
        ? `${student.firstName || ""} ${student.lastName || ""}`.trim()
        : `Student #${enrollment.studentId}`;

    if (!window.confirm(
        `Delete the enrollment for ${studentName} in ${enrollment.academicYear}? This cannot be undone.`
    )) {
        return;
    }

    try {
        setError("");
        setSuccess("");

        await api.delete(`/enrollments/${enrollment.id}`);

        setSuccess("Enrollment deleted successfully.");
        await loadData();
    } catch (err) {
        console.error("Enrollment deletion failed:", err);
        setError(
            err.response?.data?.message ||
            "Unable to delete this enrollment."
        );
    }
};

const clearFilters = () => {
    setSearchTerm("");
    setClassFilter("");
    setSectionFilter("");
    setYearFilter("");
    setStatusFilter("");
    setPage(0);
};

return (
    <div className="admin-page">
        <Navbar />

        <div className="admin-content">
            <Sidebar />

            <main className="enrollment-main">
                <header className="enrollment-header">
                    <div>
                        <h1>Student Enrollment</h1>
                        <p>
                            Assign students to classes and sections for each academic year.
                        </p>
                    </div>

                    <button
                        className="enrollment-primary-btn"
                        onClick={() => {
                            setError("");
                            setSuccess("");
                            setShowForm(value => !value);
                        }}
                    >
                        {showForm ? "× Close Form" : "+ Enroll Student"}
                    </button>
                </header>

                {error && (
                    <div className="enrollment-alert enrollment-alert-error">
                        <span>⚠</span>
                        <span>{error}</span>
                        <button onClick={() => setError("")}>×</button>
                    </div>
                )}

                {success && (
                    <div className="enrollment-alert enrollment-alert-success">
                        <span>✓</span>
                        <span>{success}</span>
                        <button onClick={() => setSuccess("")}>×</button>
                    </div>
                )}

                <section className="enrollment-stats">
                    <div className="enrollment-stat-card">
                        <div className="enrollment-stat-icon">🎓</div>
                        <div>
                            <span>Total Enrollments</span>
                            <strong>{enrollments.length}</strong>
                        </div>
                    </div>

                    <div className="enrollment-stat-card">
                        <div className="enrollment-stat-icon enrollment-green">✓</div>
                        <div>
                            <span>Active</span>
                            <strong>{activeCount}</strong>
                        </div>
                    </div>

                    <div className="enrollment-stat-card">
                        <div className="enrollment-stat-icon enrollment-blue">▣</div>
                        <div>
                            <span>Completed</span>
                            <strong>{completedCount}</strong>
                        </div>
                    </div>
                </section>

                {showForm && (
                    <section className="enrollment-form-card">
                        <div className="enrollment-form-heading">
                            <div>
                                <h2>Enroll a Student</h2>
                                <p>
                                    Choose a student and assign them to a class and section.
                                </p>
                            </div>

                            <button
                                className="enrollment-close-btn"
                                type="button"
                                onClick={resetForm}
                                aria-label="Close form"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleCreate}>
                            <div className="enrollment-form-grid">
                                <div className="enrollment-field">
                                    <label htmlFor="enrollment-student">Student</label>
                                    <select
                                        id="enrollment-student"
                                        name="studentId"
                                        value={form.studentId}
                                        onChange={handleFormChange}
                                        required
                                    >
                                        <option value="">Select student</option>
                                        {eligibleStudents.map(student => (
                                            <option key={student.id} value={student.id}>
                                                {student.firstName} {student.lastName}
                                                {" — "}{student.email}
                                            </option>
                                        ))}
                                    </select>
                                    {eligibleStudents.length === 0 && (
                                        <small>
                                            No students available for this academic year.
                                        </small>
                                    )}
                                </div>

                                <div className="enrollment-field">
                                    <label htmlFor="enrollment-year">Academic Year</label>
                                    <input
                                        id="enrollment-year"
                                        name="academicYear"
                                        value={form.academicYear}
                                        onChange={handleFormChange}
                                        placeholder="2026-27"
                                        pattern="[0-9]{4}-[0-9]{2}"
                                        title="Use the format YYYY-YY, for example 2026-27"
                                        required
                                    />
                                </div>

                                <div className="enrollment-field">
                                    <label htmlFor="enrollment-class">Class</label>
                                    <select
                                        id="enrollment-class"
                                        name="classId"
                                        value={form.classId}
                                        onChange={handleFormChange}
                                        required
                                    >
                                        <option value="">Select class</option>
                                        {activeClasses.map(item => (
                                            <option key={item.id} value={item.id}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="enrollment-field">
                                    <label htmlFor="enrollment-section">Section</label>
                                    <select
                                        id="enrollment-section"
                                        name="sectionId"
                                        value={form.sectionId}
                                        onChange={handleFormChange}
                                        disabled={!form.classId}
                                        required
                                    >
                                        <option value="">
                                            {form.classId
                                                ? "Select section"
                                                : "Select class first"}
                                        </option>
                                        {availableSections.map(section => (
                                            <option key={section.id} value={section.id}>
                                                {section.name}
                                            </option>
                                        ))}
                                    </select>
                                    {form.classId && availableSections.length === 0 && (
                                        <small>
                                            No active sections are available for this class.
                                        </small>
                                    )}
                                </div>
                            </div>

                            <div className="enrollment-form-note">
                                A student can have only one enrollment per academic year.
                            </div>

                            <div className="enrollment-form-actions">
                                <button
                                    type="button"
                                    className="enrollment-secondary-btn"
                                    onClick={resetForm}
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="enrollment-primary-btn"
                                    disabled={
                                        saving ||
                                        eligibleStudents.length === 0 ||
                                        !form.classId ||
                                        !form.sectionId
                                    }
                                >
                                    {saving ? "Enrolling..." : "Create Enrollment"}
                                </button>
                            </div>
                        </form>
                    </section>
                )}

                <section className="enrollment-table-card">
                    <div className="enrollment-table-heading">
                        <div>
                            <h2>All Enrollments</h2>
                            <p>
                                {filteredEnrollments.length} matching enrollment
                                {filteredEnrollments.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>

                    <div className="enrollment-filters">
                        <input
                            type="search"
                            placeholder="Search student name, email or ID..."
                            value={searchTerm}
                            onChange={event => {
                                setSearchTerm(event.target.value);
                                setPage(0);
                            }}
                        />

                        <select
                            aria-label="Filter by class"
                            value={classFilter}
                            onChange={event => {
                                setClassFilter(event.target.value);
                                setSectionFilter("");
                                setPage(0);
                            }}
                        >
                            <option value="">All Classes</option>
                            {classes.map(item => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>

                        <select
                            aria-label="Filter by section"
                            value={sectionFilter}
                            onChange={event => {
                                setSectionFilter(event.target.value);
                                setPage(0);
                            }}
                        >
                            <option value="">All Sections</option>
                            {sections
                                .filter(item =>
                                    !classFilter ||
                                    String(item.classId) === classFilter
                                )
                                .map(item => (
                                    <option key={item.id} value={item.id}>
                                        {item.name}
                                    </option>
                                ))}
                        </select>

                        <select
                            aria-label="Filter by academic year"
                            value={yearFilter}
                            onChange={event => {
                                setYearFilter(event.target.value);
                                setPage(0);
                            }}
                        >
                            <option value="">All Years</option>
                            {academicYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>

                        <select
                            aria-label="Filter by status"
                            value={statusFilter}
                            onChange={event => {
                                setStatusFilter(event.target.value);
                                setPage(0);
                            }}
                        >
                            <option value="">All Statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>

                        <button
                            type="button"
                            className="enrollment-clear-btn"
                            onClick={clearFilters}
                        >
                            Clear
                        </button>
                    </div>

                    {loading ? (
                        <div className="enrollment-table-state">
                            <div className="enrollment-spinner" />
                            <p>Loading enrollments...</p>
                        </div>
                    ) : filteredEnrollments.length === 0 ? (
                        <div className="enrollment-table-state">
                            <div className="enrollment-empty-icon">🎓</div>
                            <h3>No enrollments found</h3>
                            <p>
                                Try changing your filters or create a new enrollment.
                            </p>
                            <button
                                className="enrollment-primary-btn"
                                onClick={() => setShowForm(true)}
                            >
                                + Enroll Student
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="enrollment-table-wrapper">
                                <table className="enrollment-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Student</th>
                                            <th>Class</th>
                                            <th>Section</th>
                                            <th>Academic Year</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {visibleEnrollments.map(enrollment => {
                                            const student = studentById.get(
                                                String(enrollment.studentId)
                                            );
                                            const classItem = classById.get(
                                                String(enrollment.classId)
                                            );
                                            const section = sectionById.get(
                                                String(enrollment.sectionId)
                                            );

                                            const studentName = student
                                                ? `${student.firstName || ""} ${student.lastName || ""}`.trim()
                                                : `Student #${enrollment.studentId}`;

                                            return (
                                                <tr key={enrollment.id}>
                                                    <td>
                                                        <span className="enrollment-id">
                                                            #{enrollment.id}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="enrollment-student-info">
                                                            <div className="enrollment-avatar">
                                                                {student?.firstName?.charAt(0)?.toUpperCase() || "S"}
                                                                {student?.lastName?.charAt(0)?.toUpperCase() || ""}
                                                            </div>
                                                            <div>
                                                                <strong>{studentName}</strong>
                                                                <span>
                                                                    {student?.email || "Student details unavailable"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{classItem?.name || `Class #${enrollment.classId}`}</td>
                                                    <td>{section?.name || `Section #${enrollment.sectionId}`}</td>
                                                    <td>{enrollment.academicYear}</td>
                                                    <td>
                                                        <span
                                                            className={`enrollment-status enrollment-status-${String(enrollment.status).toLowerCase()}`}
                                                        >
                                                            {enrollment.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="enrollment-row-actions">
                                                            <select
                                                                aria-label={`Change status for enrollment ${enrollment.id}`}
                                                                value={enrollment.status}
                                                                onChange={event =>
                                                                    handleStatusChange(
                                                                        enrollment,
                                                                        event.target.value
                                                                    )
                                                                }
                                                            >
                                                                <option value="ACTIVE">Active</option>
                                                                <option value="COMPLETED">Completed</option>
                                                                <option value="INACTIVE">Inactive</option>
                                                            </select>

                                                            <button
                                                                className="enrollment-delete-btn"
                                                                onClick={() => handleDelete(enrollment)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="enrollment-pagination">
                                <span>
                                    Showing {page * pageSize + 1}–{Math.min(
                                        (page + 1) * pageSize,
                                        filteredEnrollments.length
                                    )} of {filteredEnrollments.length}
                                </span>

                                <div>
                                    <select
                                        aria-label="Rows per page"
                                        value={pageSize}
                                        onChange={event => {
                                            setPageSize(Number(event.target.value));
                                            setPage(0);
                                        }}
                                    >
                                        <option value={5}>5 / page</option>
                                        <option value={10}>10 / page</option>
                                        <option value={20}>20 / page</option>
                                        <option value={50}>50 / page</option>
                                    </select>

                                    <button
                                        disabled={page === 0}
                                        onClick={() => setPage(value => value - 1)}
                                    >
                                        ← Previous
                                    </button>

                                    <span>
                                        Page {page + 1} of {Math.max(totalPages, 1)}
                                    </span>

                                    <button
                                        disabled={page >= totalPages - 1}
                                        onClick={() => setPage(value => value + 1)}
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </section>
            </main>
        </div>
    </div>
);

}

export default StudentEnrollment;
