
import { useEffect, useMemo, useState } from "react";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import TeacherSidebar from "../../components/TeacherSidebar";

import api from "../../services/api";

import {
    getExaminationOptions,
    getExaminationSubjectOptions,
    getClassOptions,
} from "../../services/examinationSubjectService";

import { getMarksStatus } from "../../services/marksStatusService";

import "./marksStatus.css";

function getList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.data)) return getList(data.data);
    return [];
}

function MarksStatus() {
    const [role, setRole] = useState("");
    const [examinations, setExaminations] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [students, setStudents] = useState([]);

    const [examinationId, setExaminationId] = useState("");
    const [classId, setClassId] = useState("");
    const [sectionId, setSectionId] = useState("");
    const [examinationSubjectId, setExaminationSubjectId] =
        useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [loadingOptions, setLoadingOptions] = useState(true);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [refreshVersion, setRefreshVersion] = useState(0);

    const [error, setError] = useState("");

    const isTeacher = role === "TEACHER";

    // Load common options and the logged-in user's role.
    useEffect(() => {
        let cancelled = false;

        async function loadOptions() {
            setLoadingOptions(true);
            setError("");

            try {
                const profileResponse = await api.get("/api/auth/me");
                const profile = profileResponse.data;

                if (
                    profile.role !== "ADMIN" &&
                    profile.role !== "TEACHER"
                ) {
                    throw new Error(
                        "Marks Status is available to administrators and teachers only."
                    );
                }

                let assignmentData = [];

                if (profile.role === "TEACHER") {
                    const teacherResponse = await api.get(
                        `/api/teachers/email/${encodeURIComponent(
                            profile.email
                        )}`
                    );

                    const teacher = teacherResponse.data;

                    const assignmentResponse = await api.get(
                        `/api/teaching-assignments/teacher/${teacher.id}`
                    );

                    assignmentData = getList(assignmentResponse.data);
                }

                const [
                    examinationData,
                    classData,
                    sectionResponse,
                    subjectResponse,
                ] = await Promise.all([
                    getExaminationOptions(),
                    getClassOptions(),
                    api.get("/api/sections"),
                    api.get("/api/subjects"),
                ]);

                if (cancelled) return;

                setRole(profile.role);
                setAssignments(assignmentData);

                setExaminations(getList(examinationData));
                setClasses(getList(classData));
                setSections(getList(sectionResponse.data));
                setSubjects(getList(subjectResponse.data));
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                            err.message ||
                            "Unable to load Marks Status options."
                    );
                }
            } finally {
                if (!cancelled) setLoadingOptions(false);
            }
        }

        loadOptions();

        return () => {
            cancelled = true;
        };
    }, []);

    const activeAssignments = useMemo(
        () => assignments.filter(
            (assignment) => assignment.status === "ACTIVE"
        ),
        [assignments]
    );

    // Teachers can only select classes from their active assignments.
    const availableClasses = useMemo(() => {
        if (!isTeacher) return classes;

        const assignedClassIds = new Set(
            activeAssignments.map((item) => String(item.classId))
        );

        return classes.filter(
            (item) => assignedClassIds.has(String(item.id))
        );
    }, [isTeacher, classes, activeAssignments]);

    // Load examination subjects for the selected examination and class.
    // For teachers, filter them to subjects in their active assignments.
    useEffect(() => {
        let cancelled = false;

        async function loadSubjects() {
            setSubjectsForExamination([]);
            setExaminationSubjectId("");
            setSectionId("");
            setStudents([]);

            if (!examinationId || !classId) {
                setLoadingSubjects(false);
                return;
            }

            setLoadingSubjects(true);
            setError("");

            try {
                const data = await getExaminationSubjectOptions(
                    examinationId,
                    classId
                );

                if (cancelled) return;

                let options = getList(data);

                if (isTeacher) {
                    const assignedSubjectIds = new Set(
                        activeAssignments
                            .filter(
                                (item) =>
                                    String(item.classId) === String(classId)
                            )
                            .map((item) => String(item.subjectId))
                    );

                    options = options.filter((item) => {
                        const subjectId =
                            item.subjectId ??
                            item.subject?.id ??
                            item.subject?.subjectId;

                        return (
                            subjectId != null &&
                            assignedSubjectIds.has(String(subjectId))
                        );
                    });
                }

                setSubjectsForExamination(options);
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                            "Unable to load examination subjects."
                    );
                }
            } finally {
                if (!cancelled) setLoadingSubjects(false);
            }
        }

        loadSubjects();

        return () => {
            cancelled = true;
        };
    }, [examinationId, classId, isTeacher, activeAssignments]);

    // Separate state for examination subjects so the general subject list
    // remains available for displaying names from teaching assignments.
    const [subjectsForExamination, setSubjectsForExamination] = useState([]);

    const selectedExamSubject = subjectsForExamination.find(
        (item) =>
            String(item.id ?? item.examinationSubjectId) ===
            String(examinationSubjectId)
    );

    const selectedSubjectId =
        selectedExamSubject?.subjectId ??
        selectedExamSubject?.subject?.id ??
        selectedExamSubject?.subject?.subjectId;

    // Only show sections assigned for the selected class and subject.
    const availableSections = useMemo(() => {
        if (!isTeacher) {
            return sections;
        }

        const relevantAssignments = activeAssignments.filter(
            (item) =>
                String(item.classId) === String(classId) &&
                (
                    !selectedSubjectId ||
                    String(item.subjectId) === String(selectedSubjectId)
                )
        );

        const assignedSectionIds = new Set(
            relevantAssignments.map((item) => String(item.sectionId))
        );

        return sections.filter(
            (item) => assignedSectionIds.has(String(item.id))
        );
    }, [
        isTeacher,
        sections,
        activeAssignments,
        classId,
        selectedSubjectId,
    ]);

    // Fetch status through the appropriate role-specific endpoint.
    useEffect(() => {
        let cancelled = false;

        async function loadStatus() {
            setStudents([]);

            if (!examinationSubjectId || !role) {
                setLoadingStudents(false);
                return;
            }

            setLoadingStudents(true);
            setError("");

            try {
                let data;

                if (isTeacher) {
                    const params = { examinationSubjectId };

                    if (sectionId) {
                        params.sectionId = sectionId;
                    }

                    const response = await api.get(
                        "/api/student-marks/status/teacher",
                        { params }
                    );

                    data = response.data;
                } else {
                    data = await getMarksStatus(
                        examinationSubjectId,
                        sectionId
                    );
                }

                if (!cancelled) {
                    setStudents(getList(data));
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err.response?.data?.message ||
                            "Unable to load marks assignment status."
                    );
                }
            } finally {
                if (!cancelled) setLoadingStudents(false);
            }
        }

        loadStatus();

        return () => {
            cancelled = true;
        };
    }, [
        examinationSubjectId,
        sectionId,
        role,
        isTeacher,
        refreshVersion,
    ]);

    const selectedSubject = subjectsForExamination.find(
        (item) =>
            String(item.id ?? item.examinationSubjectId) ===
            String(examinationSubjectId)
    );

    const filteredStudents = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return students.filter((student) => {
            const matchesSearch =
                !keyword ||
                student.studentName?.toLowerCase().includes(keyword) ||
                String(student.studentId).includes(keyword);

            const matchesStatus =
                statusFilter === "ALL" ||
                student.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [students, search, statusFilter]);

    const assignedCount = students.filter(
        (student) => student.status === "ASSIGNED"
    ).length;

    const pendingCount = students.filter(
        (student) => student.status === "PENDING"
    ).length;

    const formatMarks = (student) =>
        student.obtainedMarks == null
            ? "—"
            : `${student.obtainedMarks} / ${student.maxMarks}`;

    function getSubjectName(item) {
        return (
            item.subjectName ??
            item.subject?.name ??
            item.name ??
            `Subject ${item.id}`
        );
    }

    return (
        <div className="marks-status-page">
            <Navbar />

            <div className="marks-status-layout">
                {isTeacher ? <TeacherSidebar /> : <Sidebar />}

                <main className="marks-status-content">
                    <div className="marks-status-heading">
                        <div>
                            <span className="marks-status-eyebrow">
                                {isTeacher
                                    ? "TEACHER PORTAL"
                                    : "ACADEMIC MANAGEMENT"}
                            </span>

                            <h1>Marks Status</h1>

                            <p>
                                {isTeacher
                                    ? "Track marks entry for your assigned subjects, classes, and sections."
                                    : "Check whether marks have been entered for each student and examination subject."}
                            </p>
                        </div>

                        <button
                            type="button"
                            className="marks-status-refresh"
                            onClick={() =>
                                setRefreshVersion((version) => version + 1)
                            }
                            disabled={
                                loadingOptions ||
                                loadingSubjects ||
                                loadingStudents ||
                                !examinationSubjectId
                            }
                        >
                            ↻ Refresh
                        </button>
                    </div>

                    {error && (
                        <div className="marks-status-error" role="alert">
                            {error}
                        </div>
                    )}

                    <section className="marks-status-filter-card">
                        <div className="marks-status-section-heading">
                            <div>
                                <h2>Find Student Marks</h2>
                                <p>
                                    {isTeacher
                                        ? "Choose an examination and one of your assigned subjects."
                                        : "Select examination details to view marks status."}
                                </p>
                            </div>
                        </div>

                        <div className="marks-status-filters">
                            <div className="marks-status-field">
                                <label htmlFor="marks-examination">
                                    Examination
                                </label>

                                <select
                                    id="marks-examination"
                                    value={examinationId}
                                    onChange={(event) => {
                                        setExaminationId(event.target.value);
                                        setExaminationSubjectId("");
                                        setSectionId("");
                                    }}
                                    disabled={loadingOptions}
                                >
                                    <option value="">
                                        Select examination
                                    </option>

                                    {examinations.map((exam) => (
                                        <option key={exam.id} value={exam.id}>
                                            {exam.name}
                                            {exam.academicYear
                                                ? ` (${exam.academicYear})`
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="marks-status-field">
                                <label htmlFor="marks-class">Class</label>

                                <select
                                    id="marks-class"
                                    value={classId}
                                    onChange={(event) => {
                                        setClassId(event.target.value);
                                        setSectionId("");
                                        setExaminationSubjectId("");
                                    }}
                                    disabled={loadingOptions}
                                >
                                    <option value="">Select class</option>

                                    {availableClasses.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name ??
                                                item.className ??
                                                `Class ${item.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="marks-status-field">
                                <label htmlFor="marks-subject">
                                    Examination Subject
                                </label>

                                <select
                                    id="marks-subject"
                                    value={examinationSubjectId}
                                    onChange={(event) => {
                                        setExaminationSubjectId(
                                            event.target.value
                                        );
                                        setSectionId("");
                                    }}
                                    disabled={
                                        !examinationId ||
                                        !classId ||
                                        loadingSubjects
                                    }
                                >
                                    <option value="">
                                        {loadingSubjects
                                            ? "Loading subjects..."
                                            : "Select subject"}
                                    </option>

                                    {subjectsForExamination.map((item) => (
                                        <option
                                            key={
                                                item.id ??
                                                item.examinationSubjectId
                                            }
                                            value={
                                                item.id ??
                                                item.examinationSubjectId
                                            }
                                        >
                                            {getSubjectName(item)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="marks-status-field">
                                <label htmlFor="marks-section">Section</label>

                                <select
                                    id="marks-section"
                                    value={sectionId}
                                    onChange={(event) =>
                                        setSectionId(event.target.value)
                                    }
                                    disabled={
                                        !classId ||
                                        loadingOptions ||
                                        (isTeacher && !examinationSubjectId)
                                    }
                                >
                                    <option value="">
                                        {isTeacher
                                            ? "All assigned sections"
                                            : "All sections"}
                                    </option>

                                    {availableSections.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name ??
                                                item.sectionName ??
                                                `Section ${item.id}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="marks-status-summary">
                        <div className="marks-status-stat">
                            <div className="marks-status-stat-icon total">
                                <span>◎</span>
                            </div>
                            <div>
                                <p>Total Students</p>
                                <h3>{students.length}</h3>
                            </div>
                        </div>

                        <div className="marks-status-stat">
                            <div className="marks-status-stat-icon assigned">
                                <span>✓</span>
                            </div>
                            <div>
                                <p>Marks Assigned</p>
                                <h3>{assignedCount}</h3>
                            </div>
                        </div>

                        <div className="marks-status-stat">
                            <div className="marks-status-stat-icon pending">
                                <span>◷</span>
                            </div>
                            <div>
                                <p>Pending</p>
                                <h3>{pendingCount}</h3>
                            </div>
                        </div>
                    </section>

                    <section className="marks-status-table-card">
                        <div className="marks-status-table-heading">
                            <div>
                                <h2>Student Records</h2>
                                <p>
                                    {selectedSubject
                                        ? getSubjectName(selectedSubject)
                                        : "Choose a subject to view student records"}
                                </p>
                            </div>

                            <span className="marks-status-record-count">
                                {filteredStudents.length} records
                            </span>
                        </div>

                        <div className="marks-status-toolbar">
                            <div className="marks-status-search">
                                <span aria-hidden="true">⌕</span>
                                <input
                                    type="search"
                                    placeholder="Search by student name or ID..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    disabled={!examinationSubjectId}
                                />
                            </div>

                            <select
                                aria-label="Filter by marks status"
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(event.target.value)
                                }
                            >
                                <option value="ALL">All statuses</option>
                                <option value="ASSIGNED">Assigned</option>
                                <option value="PENDING">Pending</option>
                            </select>
                        </div>

                        <div className="marks-status-table-wrapper">
                            <table className="marks-status-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Class / Section</th>
                                        <th>Academic Year</th>
                                        <th>Marks</th>
                                        <th>Percentage</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {loadingOptions ||
                                    loadingSubjects ||
                                    loadingStudents ? (
                                        <tr>
                                            <td colSpan="6" className="marks-status-empty">
                                                Loading student records...
                                            </td>
                                        </tr>
                                    ) : !examinationSubjectId ? (
                                        <tr>
                                            <td colSpan="6" className="marks-status-empty">
                                                Select an examination, class, and subject to view marks status.
                                            </td>
                                        </tr>
                                    ) : filteredStudents.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="marks-status-empty">
                                                No student records match your selection.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredStudents.map((student) => (
                                            <tr key={student.enrollmentId}>
                                                <td>
                                                    <div className="marks-status-student">
                                                        <div className="marks-status-avatar">
                                                            {student.studentName
                                                                ?.charAt(0)
                                                                ?.toUpperCase() ?? "S"}
                                                        </div>
                                                        <div>
                                                            <strong>{student.studentName}</strong>
                                                            <span>ID: {student.studentId}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <strong>{student.className}</strong>
                                                    <span className="marks-status-secondary">
                                                        {student.sectionName}
                                                    </span>
                                                </td>

                                                <td>{student.academicYear}</td>
                                                <td><strong>{formatMarks(student)}</strong></td>
                                                <td>
                                                    {student.percentage == null
                                                        ? "—"
                                                        : `${student.percentage}%`}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`marks-status-badge ${
                                                            student.status === "ASSIGNED"
                                                                ? "is-assigned"
                                                                : "is-pending"
                                                        }`}
                                                    >
                                                        <span className="marks-status-dot" />
                                                        {student.status === "ASSIGNED"
                                                            ? "Assigned"
                                                            : "Pending"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="marks-status-table-footer">
                            Showing {filteredStudents.length} of {students.length} students
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default MarksStatus;