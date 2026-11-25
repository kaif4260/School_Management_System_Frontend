import { useEffect, useState } from "react";

import Navbar from "../../components/Navbar";
import TeacherSidebar from "../../components/TeacherSidebar";
import api from "../../services/api";

import "./TeacherDashboard.css";

function getList(data) {
if (Array.isArray(data)) return data;
if (Array.isArray(data?.content)) return data.content;
if (Array.isArray(data?.data)) return data.data;
return [];
}

function getName(item, type, id) {
if (!item) return `${type} ${id}`;

const name =
    item.name ||
    item.className ||
    item.subjectName ||
    item.sectionName ||
    item.title;

if (name) return name;

if (item.firstName || item.lastName) {
    return `${item.firstName || ""} ${item.lastName || ""}`.trim();
}

return `${type} ${id}`;

}

function TeacherDashboard() {
const [teacher, setTeacher] = useState(null);
const [assignments, setAssignments] = useState([]);
const [classes, setClasses] = useState([]);
const [subjects, setSubjects] = useState([]);
const [sections, setSections] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
        setLoading(true);
        setError("");

        try {
            const profileResponse = await api.get("/api/auth/me");
            const profile = profileResponse.data;

            if (profile.role !== "TEACHER") {
                throw new Error(
                    "This dashboard is available to teacher accounts only."
                );
            }

            const teacherResponse = await api.get(
                `/api/teachers/email/${encodeURIComponent(profile.email)}`
            );

            const teacherData = teacherResponse.data;

            if (cancelled) return;

            setTeacher(teacherData);

            const results = await Promise.allSettled([
                api.get(
                    `/api/teaching-assignments/teacher/${teacherData.id}`
                ),
                api.get("/api/classes"),
                api.get("/api/subjects"),
                api.get("/api/sections"),
            ]);

            if (cancelled) return;

            const [
                assignmentResult,
                classResult,
                subjectResult,
                sectionResult,
            ] = results;

            if (assignmentResult.status === "fulfilled") {
                setAssignments(getList(assignmentResult.value.data));
            }

            if (classResult.status === "fulfilled") {
                setClasses(getList(classResult.value.data));
            }

            if (subjectResult.status === "fulfilled") {
                setSubjects(getList(subjectResult.value.data));
            }

            if (sectionResult.status === "fulfilled") {
                setSections(getList(sectionResult.value.data));
            }

            if (assignmentResult.status === "rejected") {
                setError(
                    "Your profile loaded, but assignments could not be retrieved. Check teacher permissions and try again."
                );
            }
        } catch (err) {
            if (!cancelled) {
                setError(
                    err.response?.data?.message ||
                        (typeof err.response?.data === "string"
                            ? err.response.data
                            : "") ||
                        err.message ||
                        "Unable to load your dashboard. Please try again."
                );
            }
        } finally {
            if (!cancelled) setLoading(false);
        }
    }

    loadDashboard();

    return () => {
        cancelled = true;
    };
}, []);

const activeAssignments = assignments.filter(
    (assignment) => assignment.status === "ACTIVE"
);

const uniqueClassCount = new Set(
    activeAssignments.map((item) => item.classId)
).size;

const uniqueSubjectCount = new Set(
    activeAssignments.map((item) => item.subjectId)
).size;

function findById(items, id) {
    return items.find((item) => String(item.id) === String(id));
}

return (
    <div className="teacher-page">
        <Navbar />

        <div className="teacher-content">
            <TeacherSidebar />

            <main className="teacher-main">
                <section className="teacher-welcome">
                    <div>
                        <span className="teacher-eyebrow">
                            TEACHER PORTAL
                        </span>

                        <h1>
                            {teacher
                                ? `Welcome, ${teacher.firstName}!`
                                : "Teacher Dashboard"}
                        </h1>

                        <p>
                            Manage your teaching assignments and stay
                            up to date with your school activities.
                        </p>
                    </div>

                    {teacher && (
                        <div className="teacher-avatar">
                            {teacher.firstName?.charAt(0)?.toUpperCase()}
                        </div>
                    )}
                </section>

                {error && (
                    <div className="teacher-alert" role="alert">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                        >
                            Retry
                        </button>
                    </div>
                )}

                {loading ? (
                    <div className="teacher-state">
                        <div className="teacher-spinner" />
                        <p>Loading your dashboard...</p>
                    </div>
                ) : (
                    <>
                        <section className="teacher-stats">
                            <article className="teacher-stat-card">
                                <div className="teacher-stat-icon">
                                    <span>▦</span>
                                </div>
                                <div>
                                    <p>Active Assignments</p>
                                    <h2>{activeAssignments.length}</h2>
                                </div>
                            </article>

                            <article className="teacher-stat-card">
                                <div className="teacher-stat-icon">
                                    <span>▤</span>
                                </div>
                                <div>
                                    <p>Assigned Classes</p>
                                    <h2>{uniqueClassCount}</h2>
                                </div>
                            </article>

                            <article className="teacher-stat-card">
                                <div className="teacher-stat-icon">
                                    <span>◈</span>
                                </div>
                                <div>
                                    <p>Assigned Subjects</p>
                                    <h2>{uniqueSubjectCount}</h2>
                                </div>
                            </article>
                        </section>

                        {teacher && (
                            <section className="teacher-panel">
                                <div className="teacher-panel-heading">
                                    <div>
                                        <h2>My Profile</h2>
                                        <p>
                                            Your registered teacher
                                            information
                                        </p>
                                    </div>

                                    <span
                                        className={`teacher-status ${
                                            teacher.status === "ACTIVE"
                                                ? "status-active"
                                                : "status-inactive"
                                        }`}
                                    >
                                        {teacher.status || "UNKNOWN"}
                                    </span>
                                </div>

                                <div className="teacher-profile-grid">
                                    <div>
                                        <span>Full Name</span>
                                        <strong>
                                            {teacher.firstName}{" "}
                                            {teacher.lastName}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Employee ID</span>
                                        <strong>
                                            {teacher.employeeId || "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Email Address</span>
                                        <strong>{teacher.email}</strong>
                                    </div>

                                    <div>
                                        <span>Phone</span>
                                        <strong>
                                            {teacher.phone || "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Qualification</span>
                                        <strong>
                                            {teacher.qualification || "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Specialization</span>
                                        <strong>
                                            {teacher.specialization || "—"}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Joining Date</span>
                                        <strong>
                                            {teacher.joiningDate || "—"}
                                        </strong>
                                    </div>
                                </div>
                            </section>
                        )}

                        <section className="teacher-panel">
                            <div className="teacher-panel-heading">
                                <div>
                                    <h2>My Teaching Assignments</h2>
                                    <p>
                                        Classes, sections and subjects
                                        assigned to you
                                    </p>
                                </div>

                                <span className="teacher-count">
                                    {assignments.length} total
                                </span>
                            </div>

                            {assignments.length === 0 ? (
                                <div className="teacher-empty">
                                    <span>▤</span>
                                    <h3>No assignments found</h3>
                                    <p>
                                        Your teaching assignments will
                                        appear here once they are assigned.
                                    </p>
                                </div>
                            ) : (
                                <div className="teacher-table-wrapper">
                                    <table className="teacher-table">
                                        <thead>
                                            <tr>
                                                <th>Subject</th>
                                                <th>Class</th>
                                                <th>Section</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {assignments.map((item) => (
                                                <tr key={item.id}>
                                                    <td>
                                                        {getName(
                                                            findById(
                                                                subjects,
                                                                item.subjectId
                                                            ),
                                                            "Subject",
                                                            item.subjectId
                                                        )}
                                                    </td>

                                                    <td>
                                                        {getName(
                                                            findById(
                                                                classes,
                                                                item.classId
                                                            ),
                                                            "Class",
                                                            item.classId
                                                        )}
                                                    </td>

                                                    <td>
                                                        {getName(
                                                            findById(
                                                                sections,
                                                                item.sectionId
                                                            ),
                                                            "Section",
                                                            item.sectionId
                                                        )}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`teacher-status ${
                                                                item.status ===
                                                                "ACTIVE"
                                                                    ? "status-active"
                                                                    : "status-inactive"
                                                            }`}
                                                        >
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    </div>
);

}

export default TeacherDashboard;