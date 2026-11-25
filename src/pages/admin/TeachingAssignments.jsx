import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../services/api";
import "./TeachingAssignments.css";

function getList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.data)) return getList(data.data);
    return [];
}

function TeachingAssignments() {
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [assignments, setAssignments] = useState([]);

    const [form, setForm] = useState({
        teacherId: "",
        subjectId: "",
        classId: "",
        sectionId: "",
    });

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadData() {
        setLoading(true);
        setError("");

        try {
            const results = await Promise.all([
                api.get("/api/teachers"),
                api.get("/api/subjects"),
                api.get("/api/classes"),
                api.get("/api/sections"),
                api.get("/api/teaching-assignments"),
            ]);

            setTeachers(getList(results[0].data));
            setSubjects(getList(results[1].data));
            setClasses(getList(results[2].data));
            setSections(getList(results[3].data));
            setAssignments(getList(results[4].data));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                (typeof err.response?.data === "string"
                    ? err.response.data
                    : "") ||
                "Unable to load teaching assignments. Please check the backend and try again."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    }

    function findById(items, id) {
        return items.find(
            (item) => String(item.id) === String(id)
        );
    }

    function teacherName(id) {
        const teacher = findById(teachers, id);

        return teacher
            ? `${teacher.firstName || ""} ${teacher.lastName || ""}`.trim()
            : `Teacher #${id}`;
    }

    function subjectName(id) {
        const subject = findById(subjects, id);

        return subject
            ? subject.subjectName || subject.name || subject.title || `Subject #${id}`
            : `Subject #${id}`;
    }

    function className(id) {
        const item = findById(classes, id);

        return item
            ? item.className || item.name || item.nameOfClass || `Class #${id}`
            : `Class #${id}`;
    }

    function sectionName(id) {
        const item = findById(sections, id);

        return item
            ? item.sectionName || item.name || item.section || `Section #${id}`
            : `Section #${id}`;
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (
            !form.teacherId ||
            !form.subjectId ||
            !form.classId ||
            !form.sectionId
        ) {
            setError("Please select a teacher, subject, class, and section.");
            return;
        }

        setSaving(true);

        try {
            await api.post("/api/teaching-assignments", {
                teacherId: Number(form.teacherId),
                subjectId: Number(form.subjectId),
                classId: Number(form.classId),
                sectionId: Number(form.sectionId),
            });

            setForm({
                teacherId: "",
                subjectId: "",
                classId: "",
                sectionId: "",
            });

            setSuccess("Teaching assignment created successfully.");
            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                (typeof err.response?.data === "string"
                    ? err.response.data
                    : "") ||
                "Unable to create assignment. Please verify the selected records."
            );
        } finally {
            setSaving(false);
        }
    }

    async function handleStatusChange(assignment) {
        const nextStatus =
            assignment.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

        setError("");
        setSuccess("");

        try {
            await api.patch(
                `/api/teaching-assignments/${assignment.id}/status`,
                null,
                { params: { status: nextStatus } }
            );

            setSuccess(`Assignment marked ${nextStatus.toLowerCase()}.`);
            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to update assignment status."
            );
        }
    }

    async function handleDelete(assignment) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this teaching assignment?"
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            await api.delete(
                `/api/teaching-assignments/${assignment.id}`
            );

            setSuccess("Teaching assignment deleted successfully.");
            await loadData();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to delete this assignment."
            );
        }
    }

    const filteredAssignments = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return assignments.filter((item) => {
            const matchesStatus =
                statusFilter === "ALL" ||
                item.status === statusFilter;

            const searchableText = [
                teacherName(item.teacherId),
                subjectName(item.subjectId),
                className(item.classId),
                sectionName(item.sectionId),
            ]
                .join(" ")
                .toLowerCase();

            return (
                matchesStatus &&
                (!keyword || searchableText.includes(keyword))
            );
        });
    }, [
        assignments,
        teachers,
        subjects,
        classes,
        sections,
        search,
        statusFilter,
    ]);

    const activeCount = assignments.filter(
        (item) => item.status === "ACTIVE"
    ).length;

    return (
        <div className="admin-page">
            <Navbar />

            <div className="admin-content">
                <Sidebar />

                <main className="assignments-main">
                    <div className="assignments-heading">
                        <div>
                            <span className="assignments-eyebrow">
                                ACADEMIC MANAGEMENT
                            </span>
                            <h1>Teaching Assignments</h1>
                            <p>
                                Assign teachers to subjects, classes, and
                                sections.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="assignment-refresh"
                            onClick={loadData}
                            disabled={loading}
                        >
                            Refresh
                        </button>
                    </div>

                    {error && (
                        <div className="assignment-alert error" role="alert">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="assignment-alert success" role="status">
                            {success}
                        </div>
                    )}

                    <section className="assignment-stats">
                        <article className="assignment-stat-card">
                            <span>Total Assignments</span>
                            <strong>{assignments.length}</strong>
                        </article>

                        <article className="assignment-stat-card">
                            <span>Active Assignments</span>
                            <strong>{activeCount}</strong>
                        </article>

                        <article className="assignment-stat-card">
                            <span>Teachers</span>
                            <strong>{teachers.length}</strong>
                        </article>
                    </section>

                    <section className="assignment-panel">
                        <div className="assignment-panel-heading">
                            <div>
                                <h2>Create Assignment</h2>
                                <p>
                                    Choose all four fields to link a teacher
                                    with a class, section, and subject.
                                </p>
                            </div>
                        </div>

                        <form
                            className="assignment-form"
                            onSubmit={handleSubmit}
                        >
                            <div className="assignment-field">
                                <label htmlFor="teacherId">Teacher *</label>
                                <select
                                    id="teacherId"
                                    name="teacherId"
                                    value={form.teacherId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select teacher</option>
                                    {teachers.map((teacher) => (
                                        <option
                                            key={teacher.id}
                                            value={teacher.id}
                                        >
                                            {teacher.firstName} {teacher.lastName}
                                            {" — "}
                                            {teacher.employeeId || teacher.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="assignment-field">
                                <label htmlFor="subjectId">Subject *</label>
                                <select
                                    id="subjectId"
                                    name="subjectId"
                                    value={form.subjectId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select subject</option>
                                    {subjects.map((subject) => (
                                        <option
                                            key={subject.id}
                                            value={subject.id}
                                        >
                                            {subject.subjectName ||
                                                subject.name ||
                                                subject.title ||
                                                `Subject #${subject.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="assignment-field">
                                <label htmlFor="classId">Class *</label>
                                <select
                                    id="classId"
                                    name="classId"
                                    value={form.classId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select class</option>
                                    {classes.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.className ||
                                                item.name ||
                                                item.nameOfClass ||
                                                `Class #${item.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="assignment-field">
                                <label htmlFor="sectionId">Section *</label>
                                <select
                                    id="sectionId"
                                    name="sectionId"
                                    value={form.sectionId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select section</option>
                                    {sections.map((section) => (
                                        <option
                                            key={section.id}
                                            value={section.id}
                                        >
                                            {section.sectionName ||
                                                section.name ||
                                                section.section ||
                                                `Section #${section.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="assignment-form-actions">
                                <button
                                    type="submit"
                                    className="assignment-primary"
                                    disabled={saving || loading}
                                >
                                    {saving ? "Creating..." : "Create Assignment"}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="assignment-panel">
                        <div className="assignment-panel-heading list-heading">
                            <div>
                                <h2>All Assignments</h2>
                                <p>
                                    Search, filter, activate, deactivate, or
                                    remove assignments.
                                </p>
                            </div>

                            <span className="assignment-total">
                                {filteredAssignments.length} shown
                            </span>
                        </div>

                        <div className="assignment-toolbar">
                            <input
                                type="search"
                                placeholder="Search teacher, subject, class..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                aria-label="Search teaching assignments"
                            />

                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                                aria-label="Filter by assignment status"
                            >
                                <option value="ALL">All statuses</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>

                        {loading ? (
                            <div className="assignment-state">
                                Loading assignments...
                            </div>
                        ) : filteredAssignments.length === 0 ? (
                            <div className="assignment-state">
                                <h3>No assignments found</h3>
                                <p>
                                    Create an assignment above or change your
                                    search and filters.
                                </p>
                            </div>
                        ) : (
                            <div className="assignment-table-wrapper">
                                <table className="assignment-table">
                                    <thead>
                                        <tr>
                                            <th>Teacher</th>
                                            <th>Subject</th>
                                            <th>Class</th>
                                            <th>Section</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredAssignments.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    {teacherName(item.teacherId)}
                                                </td>
                                                <td>
                                                    {subjectName(item.subjectId)}
                                                </td>
                                                <td>
                                                    {className(item.classId)}
                                                </td>
                                                <td>
                                                    {sectionName(item.sectionId)}
                                                </td>
                                                <td>
                                                    <span
                                                        className={`assignment-status ${
                                                            item.status === "ACTIVE"
                                                                ? "is-active"
                                                                : "is-inactive"
                                                        }`}
                                                    >
                                                        {item.status || "UNKNOWN"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="assignment-actions">
                                                        <button
                                                            type="button"
                                                            className="assignment-action"
                                                            onClick={() =>
                                                                handleStatusChange(item)
                                                            }
                                                        >
                                                            {item.status === "ACTIVE"
                                                                ? "Deactivate"
                                                                : "Activate"}
                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="assignment-action danger"
                                                            onClick={() =>
                                                                handleDelete(item)
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
                    </section>
                </main>
            </div>
        </div>
    );
}

export default TeachingAssignments;
