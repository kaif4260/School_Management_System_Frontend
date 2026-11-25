import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import TeacherSidebar from "../../components/TeacherSidebar";
import api from "../../services/api";
import "./MyClasses.css";

function getList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.data)) return getList(data.data);
    return [];
}

function MyClasses() {
    const [assignments, setAssignments] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadClasses() {
            setLoading(true);
            setError("");

            try {
                const profileResponse = await api.get("/api/auth/me");
                const profile = profileResponse.data;

                if (profile.role !== "TEACHER") {
                    throw new Error("This page is available to teachers only.");
                }

                const teacherResponse = await api.get(
                    `/api/teachers/email/${encodeURIComponent(profile.email)}`
                );

                const teacher = teacherResponse.data;

                const results = await Promise.allSettled([
                    api.get(`/api/teaching-assignments/teacher/${teacher.id}`),
                    api.get("/api/classes"),
                    api.get("/api/sections"),
                    api.get("/api/subjects"),
                ]);

                if (cancelled) return;

                const [assignmentResult, classResult, sectionResult, subjectResult] =
                    results;

                if (assignmentResult.status === "rejected") {
                    throw assignmentResult.reason;
                }

                setAssignments(getList(assignmentResult.value.data));
                setClasses(
                    classResult.status === "fulfilled"
                        ? getList(classResult.value.data)
                        : []
                );
                setSections(
                    sectionResult.status === "fulfilled"
                        ? getList(sectionResult.value.data)
                        : []
                );
                setSubjects(
                    subjectResult.status === "fulfilled"
                        ? getList(subjectResult.value.data)
                        : []
                );
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                        (typeof err.response?.data === "string"
                            ? err.response.data
                            : "") ||
                        err.message ||
                        "Unable to load your classes."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadClasses();

        return () => {
            cancelled = true;
        };
    }, []);

    function findById(items, id) {
        return items.find((item) => String(item.id) === String(id));
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

    function subjectName(id) {
        const item = findById(subjects, id);
        return item
            ? item.subjectName || item.name || item.title || `Subject #${id}`
            : `Subject #${id}`;
    }

    const filteredAssignments = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return assignments.filter((item) => {
            const statusMatches =
                status === "ALL" || item.status === status;

            const text = [
                className(item.classId),
                sectionName(item.sectionId),
                subjectName(item.subjectId),
                item.status || "",
            ]
                .join(" ")
                .toLowerCase();

            return statusMatches && (!keyword || text.includes(keyword));
        });
    }, [assignments, classes, sections, subjects, search, status]);

    const activeCount = assignments.filter(
        (item) => item.status === "ACTIVE"
    ).length;

    return (
        <div className="teacher-page">
            <Navbar />

            <div className="teacher-content">
                <TeacherSidebar />

                <main className="my-classes-main">
                    <div className="my-classes-heading">
                        <div>
                            <span className="my-classes-eyebrow">
                                TEACHER PORTAL
                            </span>
                            <h1>My Classes</h1>
                            <p>
                                View the classes, sections, and subjects
                                assigned to you.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            disabled={loading}
                            className="my-classes-refresh"
                        >
                            Refresh
                        </button>
                    </div>

                    {error && (
                        <div className="my-classes-error" role="alert">
                            <span>{error}</span>
                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    <div className="my-classes-stats">
                        <article>
                            <span>Total Assignments</span>
                            <strong>{assignments.length}</strong>
                        </article>
                        <article>
                            <span>Active Assignments</span>
                            <strong>{activeCount}</strong>
                        </article>
                        <article>
                            <span>Unique Classes</span>
                            <strong>
                                {
                                    new Set(
                                        assignments.map((item) => item.classId)
                                    ).size
                                }
                            </strong>
                        </article>
                    </div>

                    <section className="my-classes-panel">
                        <div className="my-classes-panel-heading">
                            <div>
                                <h2>Assigned Classes</h2>
                                <p>
                                    Search your teaching assignments or filter
                                    them by status.
                                </p>
                            </div>
                        </div>

                        <div className="my-classes-toolbar">
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search class, section, subject..."
                                aria-label="Search classes"
                            />

                            <select
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                                aria-label="Filter by status"
                            >
                                <option value="ALL">All statuses</option>
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>

                        {loading ? (
                            <div className="my-classes-state">
                                Loading your classes...
                            </div>
                        ) : filteredAssignments.length === 0 ? (
                            <div className="my-classes-state">
                                <h3>No classes found</h3>
                                <p>
                                    Assignments created by your administrator
                                    will appear here.
                                </p>
                            </div>
                        ) : (
                            <div className="my-classes-table-wrapper">
                                <table className="my-classes-table">
                                    <thead>
                                        <tr>
                                            <th>Class</th>
                                            <th>Section</th>
                                            <th>Subject</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAssignments.map((item) => (
                                            <tr key={item.id}>
                                                <td>{className(item.classId)}</td>
                                                <td>{sectionName(item.sectionId)}</td>
                                                <td>{subjectName(item.subjectId)}</td>
                                                <td>
                                                    <span
                                                        className={`my-classes-status ${
                                                            item.status === "ACTIVE"
                                                                ? "active"
                                                                : "inactive"
                                                        }`}
                                                    >
                                                        {item.status || "UNKNOWN"}
                                                    </span>
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

export default MyClasses;
