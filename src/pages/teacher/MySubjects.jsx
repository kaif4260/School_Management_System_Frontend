import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import TeacherSidebar from "../../components/TeacherSidebar";
import api from "../../services/api";
import "./MySubjects.css";

function getList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.data)) return getList(data.data);
    return [];
}

function MySubjects() {
    const [assignments, setAssignments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadSubjects() {
            setLoading(true);
            setError("");

            try {
                const profileResponse = await api.get("/api/auth/me");
                const profile = profileResponse.data;

                if (profile.role !== "TEACHER") {
                    throw new Error(
                        "This page is available to teacher accounts only."
                    );
                }

                const teacherResponse = await api.get(
                    `/api/teachers/email/${encodeURIComponent(profile.email)}`
                );

                const teacher = teacherResponse.data;

                const results = await Promise.allSettled([
                    api.get(
                        `/api/teaching-assignments/teacher/${teacher.id}`
                    ),
                    api.get("/api/subjects"),
                    api.get("/api/classes"),
                    api.get("/api/sections"),
                ]);

                if (cancelled) return;

                const [
                    assignmentResult,
                    subjectResult,
                    classResult,
                    sectionResult,
                ] = results;

                if (assignmentResult.status === "rejected") {
                    throw assignmentResult.reason;
                }

                setAssignments(getList(assignmentResult.value.data));

                setSubjects(
                    subjectResult.status === "fulfilled"
                        ? getList(subjectResult.value.data)
                        : []
                );

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
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                            (typeof err.response?.data === "string"
                                ? err.response.data
                                : "") ||
                            err.message ||
                            "Unable to load your subjects."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadSubjects();

        return () => {
            cancelled = true;
        };
    }, []);

    function findById(items, id) {
        return items.find(
            (item) => String(item.id) === String(id)
        );
    }

    function getSubjectName(id) {
        const subject = findById(subjects, id);

        return subject
            ? subject.subjectName ||
                  subject.name ||
                  subject.title ||
                  `Subject #${id}`
            : `Subject #${id}`;
    }

    function getClassName(id) {
        const item = findById(classes, id);

        return item
            ? item.className ||
                  item.name ||
                  item.nameOfClass ||
                  `Class #${id}`
            : `Class #${id}`;
    }

    function getSectionName(id) {
        const item = findById(sections, id);

        return item
            ? item.sectionName ||
                  item.name ||
                  item.section ||
                  `Section #${id}`
            : `Section #${id}`;
    }

    const activeAssignments = assignments.filter(
        (item) => item.status === "ACTIVE"
    );

    const uniqueSubjectCount = new Set(
        activeAssignments.map((item) => item.subjectId)
    ).size;

    const uniqueClassCount = new Set(
        activeAssignments.map((item) => item.classId)
    ).size;

    const filteredAssignments = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return assignments.filter((item) => {
            const matchesStatus =
                statusFilter === "ALL" ||
                item.status === statusFilter;

            const searchableText = [
                getSubjectName(item.subjectId),
                getClassName(item.classId),
                getSectionName(item.sectionId),
                item.status || "",
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
        subjects,
        classes,
        sections,
        search,
        statusFilter,
    ]);

    return (
        <div className="teacher-page">
            <Navbar />

            <div className="teacher-content">
                <TeacherSidebar />

                <main className="my-subjects-main">
                    <header className="my-subjects-heading">
                        <div>
                            <span className="my-subjects-eyebrow">
                                TEACHER PORTAL
                            </span>

                            <h1>My Subjects</h1>

                            <p>
                                View the subjects assigned to you across
                                your classes and sections.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="my-subjects-refresh"
                            onClick={() => window.location.reload()}
                            disabled={loading}
                        >
                            Refresh
                        </button>
                    </header>

                    {error && (
                        <div className="my-subjects-error" role="alert">
                            <span>{error}</span>

                            <button
                                type="button"
                                onClick={() => window.location.reload()}
                            >
                                Retry
                            </button>
                        </div>
                    )}

                    <section className="my-subjects-stats">
                        <article className="my-subjects-stat-card">
                            <span>Total Assignments</span>
                            <strong>{assignments.length}</strong>
                        </article>

                        <article className="my-subjects-stat-card">
                            <span>Active Subjects</span>
                            <strong>{uniqueSubjectCount}</strong>
                        </article>

                        <article className="my-subjects-stat-card">
                            <span>Assigned Classes</span>
                            <strong>{uniqueClassCount}</strong>
                        </article>
                    </section>

                    <section className="my-subjects-panel">
                        <div className="my-subjects-panel-heading">
                            <div>
                                <h2>Assigned Subjects</h2>
                                <p>
                                    Find your subjects and see which classes
                                    and sections they belong to.
                                </p>
                            </div>

                            <span className="my-subjects-count">
                                {filteredAssignments.length} shown
                            </span>
                        </div>

                        <div className="my-subjects-toolbar">
                            <input
                                type="search"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search subject, class, or section..."
                                aria-label="Search assigned subjects"
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
                            <div className="my-subjects-state">
                                Loading your subjects...
                            </div>
                        ) : filteredAssignments.length === 0 ? (
                            <div className="my-subjects-state">
                                <div className="my-subjects-empty-icon">
                                    ◈
                                </div>

                                <h3>No subjects found</h3>

                                <p>
                                    Your assigned subjects will appear here
                                    when an administrator creates a teaching
                                    assignment.
                                </p>
                            </div>
                        ) : (
                            <div className="my-subjects-table-wrapper">
                                <table className="my-subjects-table">
                                    <thead>
                                        <tr>
                                            <th>Subject</th>
                                            <th>Class</th>
                                            <th>Section</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredAssignments.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="my-subjects-name">
                                                        <span className="my-subjects-subject-icon">
                                                            ◈
                                                        </span>

                                                        <strong>
                                                            {getSubjectName(
                                                                item.subjectId
                                                            )}
                                                        </strong>
                                                    </div>
                                                </td>

                                                <td>
                                                    {getClassName(item.classId)}
                                                </td>

                                                <td>
                                                    {getSectionName(
                                                        item.sectionId
                                                    )}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`my-subjects-status ${
                                                            item.status ===
                                                            "ACTIVE"
                                                                ? "active"
                                                                : "inactive"
                                                        }`}
                                                    >
                                                        {item.status ||
                                                            "UNKNOWN"}
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

export default MySubjects;
