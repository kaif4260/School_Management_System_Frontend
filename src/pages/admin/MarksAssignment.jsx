import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import TeacherSidebar from "../../components/TeacherSidebar";
import {
    getMarksEnrollments,
    getMarksStudents,
    getMarksClasses,
    getMarksSections,
    getMarksExaminations,
    getExaminationSubjects,
    getMarksByExaminationSubject,
    createStudentMarks,
    updateStudentMarks
} from "../../services/marksService";
import "./marksAssignment.css";

const getErrorMessage = (error) => {
    const data = error?.response?.data;

    if (typeof data === "string" && data.trim()) {
        return data;
    }

    return (
        data?.message ||
        data?.detail ||
        data?.error ||
        error?.message ||
        "The request could not be completed."
    );
};

const getArray = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    return [];
};

const MarksAssignment = () => {
    const location = useLocation();
    const isTeacher = location.pathname.startsWith("/teacher");
    const PageSidebar = isTeacher ? TeacherSidebar : Sidebar;

    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [examinations, setExaminations] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [existingMarks, setExistingMarks] = useState([]);

    const [selectedExamination, setSelectedExamination] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [selectedSubject, setSelectedSubject] = useState("");

    const [search, setSearch] = useState("");
    const [markInputs, setMarkInputs] = useState({});
    const [savingEnrollment, setSavingEnrollment] = useState(null);

    const [loading, setLoading] = useState(true);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [loadingMarks, setLoadingMarks] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    enrollmentData,
                    studentData,
                    classData,
                    sectionData,
                    examinationData
                ] = await Promise.all([
                    getMarksEnrollments(),
                    getMarksStudents(),
                    getMarksClasses(),
                    getMarksSections(),
                    getMarksExaminations()
                ]);

                setEnrollments(getArray(enrollmentData));
                setStudents(getArray(studentData));
                setClasses(getArray(classData));
                setSections(getArray(sectionData));
                setExaminations(getArray(examinationData));
            } catch (err) {
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    useEffect(() => {
        setSubjects([]);
        setSelectedSubject("");
        setExistingMarks([]);
        setMarkInputs({});
        setSuccess("");

        if (!selectedExamination || !selectedClass) {
            return;
        }

        let cancelled = false;

        const loadSubjects = async () => {
            try {
                setLoadingSubjects(true);
                setError("");

                const data = await getExaminationSubjects(
                    selectedExamination,
                    selectedClass
                );

                if (!cancelled) {
                    setSubjects(getArray(data));
                }
            } catch (err) {
                if (!cancelled) {
                    setError(getErrorMessage(err));
                }
            } finally {
                if (!cancelled) {
                    setLoadingSubjects(false);
                }
            }
        };

        loadSubjects();

        return () => {
            cancelled = true;
        };
    }, [selectedExamination, selectedClass]);

    useEffect(() => {
        setExistingMarks([]);
        setMarkInputs({});
        setSuccess("");

        if (!selectedSubject) {
            return;
        }

        let cancelled = false;

        const loadMarks = async () => {
            try {
                setLoadingMarks(true);
                setError("");

                const data = await getMarksByExaminationSubject(
                    selectedSubject
                );

                if (cancelled) return;

                const marks = getArray(data);
                setExistingMarks(marks);

                const inputs = {};

                marks.forEach((item) => {
                    inputs[item.enrollmentId] = String(
                        item.obtainedMarks ?? ""
                    );
                });

                setMarkInputs(inputs);
            } catch (err) {
                if (!cancelled) {
                    setError(getErrorMessage(err));
                }
            } finally {
                if (!cancelled) {
                    setLoadingMarks(false);
                }
            }
        };

        loadMarks();

        return () => {
            cancelled = true;
        };
    }, [selectedSubject]);

    const getStudent = (studentId) =>
        students.find(
            (student) => Number(student.id) === Number(studentId)
        );

    const getStudentName = (studentId) => {
        const student = getStudent(studentId);

        if (!student) return `Student #${studentId}`;

        return `${student.firstName || ""} ${
            student.lastName || ""
        }`.trim();
    };

    const getClassName = (classId) =>
        classes.find(
            (item) => Number(item.id) === Number(classId)
        )?.name || `Class #${classId}`;

    const getSectionName = (sectionId) =>
        sections.find(
            (item) => Number(item.id) === Number(sectionId)
        )?.name || `Section #${sectionId}`;

    const selectedSubjectData = subjects.find(
        (subject) => Number(subject.id) === Number(selectedSubject)
    );

    const existingMarksByEnrollment = useMemo(() => {
        const map = new Map();

        existingMarks.forEach((item) => {
            map.set(Number(item.enrollmentId), item);
        });

        return map;
    }, [existingMarks]);

    const enrolledStudents = useMemo(() => {
        return enrollments
            .filter((enrollment) => {
                const classMatches =
                    Number(enrollment.classId) === Number(selectedClass);

                const sectionMatches =
                    Number(enrollment.sectionId) === Number(selectedSection);

                return (
                    classMatches &&
                    sectionMatches &&
                    Boolean(selectedClass) &&
                    Boolean(selectedSection)
                );
            })
            .map((enrollment) => ({
                ...enrollment,
                student: getStudent(enrollment.studentId)
            }))
            .filter((enrollment) => enrollment.student);
    }, [
        enrollments,
        students,
        selectedClass,
        selectedSection
    ]);

    console.log("Selected class ID:", selectedClass);
    console.log("Selected section ID:", selectedSection);
    console.log("Enrollments:", enrollments);
    console.log("Students:", students);
    console.log("Filtered enrollments:", enrolledStudents);

    const filteredStudents = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) return enrolledStudents;

        return enrolledStudents.filter((enrollment) => {
            const name = getStudentName(enrollment.studentId).toLowerCase();

            return (
                name.includes(keyword) ||
                String(enrollment.studentId).includes(keyword) ||
                String(enrollment.id).includes(keyword)
            );
        });
    }, [enrolledStudents, search, students]);

    const handleSelectionChange = (setter) => (event) => {
        setter(event.target.value);
        setError("");
        setSuccess("");
    };

    const handleSaveMarks = async (enrollment) => {
        setError("");
        setSuccess("");

        const enrollmentId = enrollment.id;
        const rawValue = markInputs[enrollmentId];

        if (rawValue === undefined || String(rawValue).trim() === "") {
            setError(
                `Enter marks for ${getStudentName(enrollment.studentId)}.`
            );
            return;
        }

        const obtainedMarks = Number(rawValue);
        const maxMarks = Number(selectedSubjectData?.maxMarks);

        if (!Number.isInteger(obtainedMarks) || obtainedMarks < 0) {
            setError("Marks must be a non-negative whole number.");
            return;
        }

        if (obtainedMarks > maxMarks) {
            setError(`Marks cannot exceed ${maxMarks}.`);
            return;
        }

        const existing = existingMarksByEnrollment.get(
            Number(enrollmentId)
        );

        const request = {
            enrollmentId: Number(enrollmentId),
            examinationSubjectId: Number(selectedSubject),
            obtainedMarks
        };

        try {
            setSavingEnrollment(enrollmentId);

            if (existing) {
                await updateStudentMarks(existing.id, request);
            } else {
                await createStudentMarks(request);
            }

            // Reload marks from the backend to keep IDs and values in sync.
            const refreshed = getArray(
                await getMarksByExaminationSubject(selectedSubject)
            );

            setExistingMarks(refreshed);

            const updatedInputs = {};

            refreshed.forEach((item) => {
                updatedInputs[item.enrollmentId] = String(
                    item.obtainedMarks ?? ""
                );
            });

            setMarkInputs(updatedInputs);

            setSuccess(
                `Marks saved for ${getStudentName(enrollment.studentId)}.`
            );
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSavingEnrollment(null);
        }
    };

    const resetFilters = () => {
        setSelectedExamination("");
        setSelectedClass("");
        setSelectedSection("");
        setSelectedSubject("");
        setSearch("");
        setSubjects([]);
        setExistingMarks([]);
        setMarkInputs({});
        setError("");
        setSuccess("");
    };

    if (loading) {
        return (
            <div className="admin-page">
                <Navbar />
                <div className="admin-content">
                    <PageSidebar />
                    <main className="marks-main">
                        <div className="marks-state">Loading marks assignment...</div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <Navbar />

            <div className="admin-content">
                <PageSidebar />

                <main className="marks-main">
                    <header className="marks-header">
                        <div>
                            <span className="marks-eyebrow">
                                EXAMINATIONS
                            </span>
                            <h1>Marks Assignment</h1>
                            <p>
                                Enter and update student marks for each
                                examination subject.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="marks-reset-btn"
                            onClick={resetFilters}
                        >
                            Reset filters
                        </button>
                    </header>

                    {error && (
                        <div className="marks-alert marks-alert-error" role="alert">
                            <strong>Unable to complete request</strong>
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="marks-alert marks-alert-success" role="status">
                            {success}
                        </div>
                    )}

                    <section className="marks-filter-card">
                        <div className="marks-section-heading">
                            <div>
                                <h2>Select examination details</h2>
                                <p>
                                    Choose the examination, class, section,
                                    and subject before entering marks.
                                </p>
                            </div>
                        </div>

                        <div className="marks-filter-grid">
                            <div className="marks-form-group">
                                <label htmlFor="marks-examination">
                                    Examination
                                </label>
                                <select
                                    id="marks-examination"
                                    value={selectedExamination}
                                    onChange={handleSelectionChange(
                                        setSelectedExamination
                                    )}
                                >
                                    <option value="">Select examination</option>
                                    {examinations.map((exam) => (
                                        <option key={exam.id} value={exam.id}>
                                            {exam.name}
                                            {exam.academicYear
                                                ? ` - ${exam.academicYear}`
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="marks-form-group">
                                <label htmlFor="marks-class">Class</label>
                                <select
                                    id="marks-class"
                                    value={selectedClass}
                                    onChange={handleSelectionChange(
                                        setSelectedClass
                                    )}
                                >
                                    <option value="">Select class</option>
                                    {classes.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="marks-form-group">
                                <label htmlFor="marks-section">Section</label>
                                <select
                                    id="marks-section"
                                    value={selectedSection}
                                    onChange={handleSelectionChange(
                                        setSelectedSection
                                    )}
                                >
                                    <option value="">Select section</option>
                                    {sections.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="marks-form-group">
                                <label htmlFor="marks-subject">Subject</label>
                                <select
                                    id="marks-subject"
                                    value={selectedSubject}
                                    onChange={handleSelectionChange(
                                        setSelectedSubject
                                    )}
                                    disabled={
                                        !selectedExamination ||
                                        !selectedClass ||
                                        loadingSubjects
                                    }
                                >
                                    <option value="">
                                        {loadingSubjects
                                            ? "Loading subjects..."
                                            : "Select subject"}
                                    </option>
                                    {subjects.map((subject) => (
                                        <option
                                            key={subject.id}
                                            value={subject.id}
                                        >
                                            {subject.subjectName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {selectedSubjectData && (
                            <div className="marks-subject-info">
                                <div>
                                    <span>Selected subject</span>
                                    <strong>
                                        {selectedSubjectData.subjectName}
                                    </strong>
                                </div>
                                <div>
                                    <span>Maximum marks</span>
                                    <strong>
                                        {selectedSubjectData.maxMarks}
                                    </strong>
                                </div>
                                <div>
                                    <span>Pass marks</span>
                                    <strong>
                                        {selectedSubjectData.passMarks}
                                    </strong>
                                </div>
                                <div>
                                    <span>Exam date</span>
                                    <strong>
                                        {selectedSubjectData.examDate || "—"}
                                    </strong>
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="marks-table-card">
                        <div className="marks-table-header">
                            <div>
                                <h2>Student marks</h2>
                                <p>
                                    Existing marks are loaded automatically.
                                    Save each student's marks individually.
                                </p>
                            </div>

                            <div className="marks-student-count">
                                {filteredStudents.length} students
                            </div>
                        </div>

                        <div className="marks-search-row">
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by student name or ID..."
                                aria-label="Search students"
                            />
                        </div>

                        {!selectedExamination ||
                        !selectedClass ||
                        !selectedSection ||
                        !selectedSubject ? (
                            <div className="marks-empty-state">
                                <div className="marks-empty-icon">📝</div>
                                <h3>Select all four filters</h3>
                                <p>
                                    Choose an examination, class, section,
                                    and subject to load the student list.
                                </p>
                            </div>
                        ) : loadingMarks ? (
                            <div className="marks-state">
                                Loading existing marks...
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="marks-empty-state">
                                <div className="marks-empty-icon">👥</div>
                                <h3>No enrolled students found</h3>
                                <p>
                                    Check the selected class, section,
                                    and academic-year enrollments.
                                </p>
                            </div>
                        ) : (
                            <div className="marks-table-wrapper">
                                <table className="marks-table">
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            <th>Enrollment ID</th>
                                            <th>Academic year</th>
                                            <th>Maximum</th>
                                            <th>Obtained marks</th>
                                            <th>Status</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredStudents.map((enrollment) => {
                                            const existing =
                                                existingMarksByEnrollment.get(
                                                    Number(enrollment.id)
                                                );

                                            const value =
                                                markInputs[enrollment.id] ?? "";

                                            const unchanged =
                                                existing &&
                                                String(existing.obtainedMarks) ===
                                                    String(value);

                                            return (
                                                <tr key={enrollment.id}>
                                                    <td>
                                                        <div className="marks-student-cell">
                                                            <span className="marks-avatar">
                                                                {getStudentName(
                                                                    enrollment.studentId
                                                                )
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </span>
                                                            <div>
                                                                <strong>
                                                                    {getStudentName(
                                                                        enrollment.studentId
                                                                    )}
                                                                </strong>
                                                                <small>
                                                                    Student ID:{" "}
                                                                    {enrollment.studentId}
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>#{enrollment.id}</td>

                                                    <td>
                                                        {enrollment.academicYear || "—"}
                                                    </td>

                                                    <td>
                                                        {selectedSubjectData?.maxMarks}
                                                    </td>

                                                    <td>
                                                        <input
                                                            className="marks-input"
                                                            type="number"
                                                            min="0"
                                                            max={
                                                                selectedSubjectData?.maxMarks
                                                            }
                                                            step="1"
                                                            value={value}
                                                            onChange={(event) => {
                                                                setMarkInputs(
                                                                    (previous) => ({
                                                                        ...previous,
                                                                        [enrollment.id]:
                                                                            event.target.value
                                                                    })
                                                                );
                                                                setError("");
                                                                setSuccess("");
                                                            }}
                                                            aria-label={`Marks for ${getStudentName(
                                                                enrollment.studentId
                                                            )}`}
                                                            disabled={
                                                                savingEnrollment !== null
                                                            }
                                                        />
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`marks-status ${
                                                                existing
                                                                    ? "marks-status-entered"
                                                                    : "marks-status-pending"
                                                            }`}
                                                        >
                                                            {existing
                                                                ? "Entered"
                                                                : "Pending"}
                                                        </span>
                                                    </td>

                                                   
                                                    <td>
                                                        <button
                                                            type="button"
                                                            className="marks-save-btn"
                                                            onClick={() => handleSaveMarks(enrollment)}
                                                            disabled={
                                                            savingEnrollment !== null || Boolean(unchanged)
                                                            }
                                                        >
                                                            {savingEnrollment === enrollment.id
                                                            ? "Saving..."
                                                            : existing
                                                                ? "Update Marks"
                                                                : "Add Marks"}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default MarksAssignment;