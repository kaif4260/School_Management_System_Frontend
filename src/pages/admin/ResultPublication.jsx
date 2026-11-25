
import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import {
    getAllEnrollments,
    getAllStudents,
    getAllClasses,
    getAllSections,
    getAllExaminations,
    publishStudentResult,
} from "../../services/resultService";
import "./result-publication.css";

function getList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.data)) return data.data;
    return [];
}

function getErrorMessage(error) {
    const data = error?.response?.data;

    if (typeof data === "string") return data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;

    return error?.response?.status === 403
        ? "You do not have permission to publish results."
        : "Unable to complete the request. Please try again.";
}

function ResultPublication() {
    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [examinations, setExaminations] = useState([]);

    const [classId, setClassId] = useState("");
    const [sectionId, setSectionId] = useState("");
    const [examinationId, setExaminationId] = useState("");
    const [enrollmentId, setEnrollmentId] = useState("");

    const [loading, setLoading] = useState(true);
    const [publishing, setPublishing] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let active = true;

        async function loadData() {
            setLoading(true);
            setError("");

            try {
                const [
                    enrollmentData,
                    studentData,
                    classData,
                    sectionData,
                    examinationData,
                ] = await Promise.all([
                    getAllEnrollments(),
                    getAllStudents(),
                    getAllClasses(),
                    getAllSections(),
                    getAllExaminations(),
                ]);

                if (!active) return;

                setEnrollments(getList(enrollmentData));
                setStudents(getList(studentData));
                setClasses(getList(classData));
                setSections(getList(sectionData));
                setExaminations(getList(examinationData));
            } catch (err) {
                if (active) {
                    setError(
                        getErrorMessage(err) +
                        " Check that the backend is running and you are logged in as ADMIN."
                    );
                }
            } finally {
                if (active) setLoading(false);
            }
        }

        loadData();

        return () => {
            active = false;
        };
    }, []);

    const filteredSections = useMemo(
        () =>
            sections.filter(
                (section) =>
                    !classId ||
                    String(
                        section.schoolClassId ??
                        section.classId ??
                        section.schoolClass?.id ??
                        ""
                    ) === String(classId)
            ),
        [sections, classId]
    );

    const filteredEnrollments = useMemo(
        () =>
            enrollments.filter((enrollment) => {
                const matchesClass =
                    !classId ||
                    String(
                        enrollment.classId ??
                        enrollment.schoolClass?.id ??
                        ""
                    ) === String(classId);

                const matchesSection =
                    !sectionId ||
                    String(
                        enrollment.sectionId ??
                        enrollment.section?.id ??
                        ""
                    ) === String(sectionId);

                return matchesClass && matchesSection;
            }),
        [enrollments, classId, sectionId]
    );

    const selectedEnrollment = enrollments.find(
        (item) => String(item.id) === String(enrollmentId)
    );

    // Only Annual Exam is used as the final publication reference.
    const publicationExaminations = useMemo(() => {
        return examinations.filter((exam) => {
            const name = (
                exam.name ||
                exam.examinationName ||
                exam.title ||
                ""
            ).trim();

            if (name.toLowerCase() !== "annual examination") {
                return false;
            }

            // Match the student's academic year when both are available.
            if (
                selectedEnrollment?.academicYear &&
                exam.academicYear
            ) {
                return (
                    String(selectedEnrollment.academicYear) ===
                    String(exam.academicYear)
                );
            }

            return true;
        });
    }, [examinations, selectedEnrollment]);

    const getStudentName = (id) => {
        const student = students.find(
            (item) => String(item.id) === String(id)
        );

        if (!student) return `Student #${id}`;

        const fullName = [student.firstName, student.lastName]
            .filter(Boolean)
            .join(" ");

        return (
            fullName ||
            student.name ||
            student.email ||
            `Student #${id}`
        );
    };

    const getClassName = (id) => {
        const item = classes.find(
            (value) => String(value.id) === String(id)
        );

        return item?.name || item?.className || `Class #${id}`;
    };

    const getSectionName = (id) => {
        const item = sections.find(
            (value) => String(value.id) === String(id)
        );

        return item?.name || item?.sectionName || `Section #${id}`;
    };

    const getExaminationName = (item) =>
        item?.name ||
        item?.examinationName ||
        item?.title ||
        `Examination #${item?.id}`;

    const handleClassChange = (value) => {
        setClassId(value);
        setSectionId("");
        setEnrollmentId("");
        setExaminationId("");
        setSuccess("");
        setError("");
    };

    const handleSectionChange = (value) => {
        setSectionId(value);
        setEnrollmentId("");
        setExaminationId("");
        setSuccess("");
        setError("");
    };

    const handlePublish = async () => {
        if (!enrollmentId || !examinationId) {
            setError("Please select an Annual Exam and a student.");
            return;
        }

        const selectedExam = publicationExaminations.find(
            (exam) => String(exam.id) === String(examinationId)
        );

        if (!selectedExam) {
            setError(
                "Please select a valid Annual Exam for the student's academic year."
            );
            return;
        }

        const confirmed = window.confirm(
            "Publish this student's final result? The server will verify that all required subjects have marks in both Mid Term and Annual Exam."
        );

        if (!confirmed) return;

        setPublishing(true);
        setError("");
        setSuccess("");

        try {
            const response = await publishStudentResult(
                enrollmentId,
                examinationId
            );

            setSuccess(
                typeof response === "string"
                    ? response
                    : response?.message ||
                      "Final result published successfully."
            );
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="result-publication-page">
            <Navbar />

            <div className="result-publication-layout">
                <Sidebar />

                <main className="result-publication-content">
                    <div className="publication-heading">
                        <div>
                            <span className="publication-eyebrow">
                                ACADEMIC MANAGEMENT
                            </span>

                            <h1>Result Publication</h1>

                            <p>
                                Review the selection and publish an
                                individual student's final examination result.
                            </p>
                        </div>

                        <div className="publication-admin-label">
                            <span className="publication-status-dot" />
                            Admin access
                        </div>
                    </div>

                    {error && (
                        <div
                            className="publication-alert publication-alert-error"
                            role="alert"
                        >
                            <strong>Unable to publish</strong>
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div
                            className="publication-alert publication-alert-success"
                            role="status"
                        >
                            <strong>Success</strong>
                            <span>{success}</span>
                        </div>
                    )}

                    <section className="publication-card">
                        <div className="publication-card-heading">
                            <div>
                                <h2>Select result</h2>
                                <p>
                                    Select a student's enrollment and the
                                    Annual Exam for final publication.
                                </p>
                            </div>

                            <span className="publication-step">
                                STEP 01
                            </span>
                        </div>

                        {loading ? (
                            <div className="publication-loading">
                                Loading examinations and student enrollments…
                            </div>
                        ) : (
                            <>
                                <div className="publication-form-grid">
                                    <div className="publication-field">
                                        <label htmlFor="publication-examination">
                                            Final examination <span>*</span>
                                        </label>

                                        <select
                                            id="publication-examination"
                                            value={examinationId}
                                            onChange={(event) => {
                                                setExaminationId(
                                                    event.target.value
                                                );
                                                setSuccess("");
                                                setError("");
                                            }}
                                        >
                                            <option value="">
                                                Select Annual Exam
                                            </option>

                                            {publicationExaminations.map(
                                                (item) => (
                                                    <option
                                                        key={item.id}
                                                        value={item.id}
                                                    >
                                                        {getExaminationName(item)}
                                                        {item.academicYear
                                                            ? ` — ${item.academicYear}`
                                                            : ""}
                                                    </option>
                                                )
                                            )}
                                        </select>

                                        {publicationExaminations.length ===
                                            0 && (
                                            <small>
                                                No matching Annual Exam was
                                                found for the selected
                                                academic year.
                                            </small>
                                        )}
                                    </div>

                                    <div className="publication-field">
                                        <label htmlFor="publication-class">
                                            Class
                                        </label>

                                        <select
                                            id="publication-class"
                                            value={classId}
                                            onChange={(event) =>
                                                handleClassChange(
                                                    event.target.value
                                                )
                                            }
                                        >
                                            <option value="">
                                                All classes
                                            </option>

                                            {classes.map((item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {getClassName(item.id)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="publication-field">
                                        <label htmlFor="publication-section">
                                            Section
                                        </label>

                                        <select
                                            id="publication-section"
                                            value={sectionId}
                                            onChange={(event) =>
                                                handleSectionChange(
                                                    event.target.value
                                                )
                                            }
                                        >
                                            <option value="">
                                                All sections
                                            </option>

                                            {filteredSections.map((item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {getSectionName(item.id)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="publication-field">
                                        <label htmlFor="publication-student">
                                            Student enrollment <span>*</span>
                                        </label>

                                        <select
                                            id="publication-student"
                                            value={enrollmentId}
                                            onChange={(event) => {
                                                setEnrollmentId(
                                                    event.target.value
                                                );
                                                setExaminationId("");
                                                setSuccess("");
                                                setError("");
                                            }}
                                        >
                                            <option value="">
                                                Select student
                                            </option>

                                            {filteredEnrollments.map((item) => (
                                                <option
                                                    key={item.id}
                                                    value={item.id}
                                                >
                                                    {getStudentName(
                                                        item.studentId ??
                                                        item.student?.id
                                                    )}
                                                    {" — "}
                                                    {getClassName(
                                                        item.classId ??
                                                        item.schoolClass?.id
                                                    )}
                                                    {" / "}
                                                    {getSectionName(
                                                        item.sectionId ??
                                                        item.section?.id
                                                    )}
                                                    {" — Enrollment #"}
                                                    {item.id}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="publication-selection-summary">
                                    <div className="publication-summary-icon">
                                        R
                                    </div>

                                    <div className="publication-summary-details">
                                        <span>Selected student</span>

                                        <strong>
                                            {selectedEnrollment
                                                ? getStudentName(
                                                      selectedEnrollment.studentId ??
                                                      selectedEnrollment.student?.id
                                                  )
                                                : "No student selected"}
                                        </strong>

                                        <p>
                                            {selectedEnrollment
                                                ? `${getClassName(
                                                      selectedEnrollment.classId ??
                                                      selectedEnrollment.schoolClass?.id
                                                  )} · ${getSectionName(
                                                      selectedEnrollment.sectionId ??
                                                      selectedEnrollment.section?.id
                                                  )} · ${
                                                      selectedEnrollment.academicYear ||
                                                      "Academic year not specified"
                                                  }`
                                                : "Choose an enrollment to review the publication request."}
                                        </p>
                                    </div>
                                </div>

                                <div className="publication-actions">
                                    <p>
                                        Final publication requires marks for
                                        every required subject in both Mid Term
                                        and Annual Exam.
                                    </p>

                                    <button
                                        type="button"
                                        className="publication-button"
                                        onClick={handlePublish}
                                        disabled={
                                            publishing ||
                                            !examinationId ||
                                            !enrollmentId ||
                                            publicationExaminations.every(
                                                (exam) =>
                                                    String(exam.id) !==
                                                    String(examinationId)
                                            )
                                        }
                                    >
                                        {publishing
                                            ? "Publishing…"
                                            : "Publish final result"}
                                    </button>
                                </div>
                            </>
                        )}
                    </section>

                    <section className="publication-note">
                        <strong>Publication rules</strong>

                        <ul>
                            <li>
                                Only administrators can publish results.
                            </li>
                            <li>
                                Annual Exam is used as the final publication
                                reference.
                            </li>
                            <li>
                                Every required subject must have marks in both
                                Mid Term and Annual Exam.
                            </li>
                            <li>
                                A final result cannot be published twice for
                                the same enrollment.
                            </li>
                        </ul>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default ResultPublication;