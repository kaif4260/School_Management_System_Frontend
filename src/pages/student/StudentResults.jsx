import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import StudentSidebar from "../../components/StudentSidebar";
import api from "../../services/api";
import { getMyEnrollments, getStudentResult } from "../../services/resultService";
import "./StudentResults.css";

const formatPercentage = (value) =>
typeof value === "number" ? `${value.toFixed(2)}%` : "—";

const formatMarks = (obtained, maximum) =>
obtained != null && maximum != null ? `${obtained} / ${maximum}` : "—";

const statusClass = (status) => {
const normalized = String(status || "").toUpperCase();
if (normalized === "PASS" || normalized === "PUBLISHED") return "success";
if (normalized === "FAIL") return "danger";
return "neutral";
};

function StudentResults() {
const [enrollments, setEnrollments] = useState([]);
const [selectedEnrollmentId, setSelectedEnrollmentId] = useState("");
const [examinations, setExaminations] = useState([]);
const [selectedExaminationId, setSelectedExaminationId] = useState("");
const [result, setResult] = useState(null);
const [loading, setLoading] = useState(true);
const [resultLoading, setResultLoading] = useState(false);
const [error, setError] = useState("");
const [resultMessage, setResultMessage] = useState("");

useEffect(() => {
    let active = true;

    const loadInitialData = async () => {
        setLoading(true);
        setError("");

        try {
            const [enrollmentData, examinationResponse] = await Promise.all([
                getMyEnrollments(),
                api.get("/api/examinations"),
            ]);

            if (!active) return;

            const activeEnrollments = (enrollmentData || []).filter(
                (enrollment) => enrollment.status === "ACTIVE"
            );

            const examinationData = examinationResponse.data || [];

            setEnrollments(enrollmentData || []);
            setExaminations(examinationData);

            if (activeEnrollments.length > 0) {
                setSelectedEnrollmentId(String(activeEnrollments[0].id));
            } else if (enrollmentData?.length > 0) {
                setSelectedEnrollmentId(String(enrollmentData[0].id));
            }

            if (examinationData.length > 0) {
                setSelectedExaminationId(String(examinationData[0].id));
            }
        } catch (err) {
            if (active) {
                setError(
                    err.response?.status === 401
                        ? "Your session has expired. Please log in again."
                        : err.response?.status === 403
                            ? "You don't have permission to view this information."
                            : "Unable to load your enrollments and examinations. Please try again."
                );
            }
        } finally {
            if (active) setLoading(false);
        }
    };

    loadInitialData();

    return () => {
        active = false;
    };
}, []);

const selectedEnrollment = useMemo(
    () => enrollments.find(
        (item) => String(item.id) === selectedEnrollmentId
    ),
    [enrollments, selectedEnrollmentId]
);

const availableExaminations = useMemo(() => {
    if (!selectedEnrollment) return [];

    return examinations.filter(
        (exam) => exam.academicYear === selectedEnrollment.academicYear
    );
}, [examinations, selectedEnrollment]);

useEffect(() => {
    if (availableExaminations.length === 0) {
        setSelectedExaminationId("");
        return;
    }

    const currentExists = availableExaminations.some(
        (exam) => String(exam.id) === selectedExaminationId
    );

    if (!currentExists) {
        setSelectedExaminationId(String(availableExaminations[0].id));
    }
}, [availableExaminations, selectedExaminationId]);

useEffect(() => {
    if (!selectedEnrollmentId || !selectedExaminationId) {
        setResult(null);
        setResultMessage("");
        return;
    }

    let active = true;

    const loadResult = async () => {
        setResultLoading(true);
        setResult(null);
        setResultMessage("");

        try {
            const data = await getStudentResult(
                selectedEnrollmentId,
                selectedExaminationId
            );

            if (active) setResult(data);
        } catch (err) {
            if (!active) return;

            const status = err.response?.status;
            const message = err.response?.data?.message || "";

            if (
                status === 403 &&
                /not been published|not published|publication/i.test(message)
            ) {
                setResultMessage(
                    "This result has not been published yet. Please check again later."
                );
            } else if (status === 404) {
                setResultMessage(
                    "No result is available for this examination yet."
                );
            } else if (status === 401) {
                setResultMessage(
                    "Your session has expired. Please log in again."
                );
            } else if (status === 403) {
                setResultMessage(
                    "You don't have permission to view this result."
                );
            } else {
                setResultMessage(
                    "We couldn't load this result. Please try again."
                );
            }
        } finally {
            if (active) setResultLoading(false);
        }
    };

    loadResult();

    return () => {
        active = false;
    };
}, [selectedEnrollmentId, selectedExaminationId]);

const examinationResult = result?.examinationResults?.find(
    (item) => String(item.examinationId) === selectedExaminationId
);

const subjects =
    result?.finalSubjects?.length > 0
        ? result.finalSubjects
        : examinationResult?.subjects || result?.subjects || [];

return (
    <div className="student-results-page">
        <Navbar />

        <div className="student-results-layout">
            <StudentSidebar />

            <main className="student-results-content">
                <header className="results-page-header">
                    <div>
                        <p className="results-eyebrow">ACADEMIC PERFORMANCE</p>
                        <h1>My Results</h1>
                        <p>
                            Review your examination performance and subject-wise grades.
                        </p>
                    </div>
                </header>

                {error && (
                    <div className="results-alert error-alert">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="results-state">
                        <div className="results-spinner" />
                        <p>Loading your academic records...</p>
                    </div>
                ) : enrollments.length === 0 ? (
                    <div className="results-empty">
                        <div className="results-empty-icon">▤</div>
                        <h2>No enrollment records found</h2>
                        <p>Your academic results will appear here once your enrollment is available.</p>
                    </div>
                ) : (
                    <>
                        <section className="results-filters">
                            <div className="results-filter-field">
                                <label htmlFor="results-enrollment">Academic year</label>
                                <select
                                    id="results-enrollment"
                                    value={selectedEnrollmentId}
                                    onChange={(event) =>
                                        setSelectedEnrollmentId(event.target.value)
                                    }
                                >
                                    {enrollments.map((enrollment) => (
                                        <option key={enrollment.id} value={enrollment.id}>
                                            {enrollment.academicYear}
                                            {enrollment.status !== "ACTIVE"
                                                ? ` (${enrollment.status})`
                                                : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="results-filter-field">
                                <label htmlFor="results-examination">Examination</label>
                                <select
                                    id="results-examination"
                                    value={selectedExaminationId}
                                    onChange={(event) =>
                                        setSelectedExaminationId(event.target.value)
                                    }
                                    disabled={availableExaminations.length === 0}
                                >
                                    {availableExaminations.map((exam) => (
                                        <option key={exam.id} value={exam.id}>
                                            {exam.name || exam.examinationName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </section>

                        {availableExaminations.length === 0 ? (
                            <div className="results-alert info-alert">
                                No examinations are configured for this academic year yet.
                            </div>
                        ) : resultLoading ? (
                            <div className="results-state">
                                <div className="results-spinner" />
                                <p>Loading examination results...</p>
                            </div>
                        ) : resultMessage ? (
                            <div className="results-empty">
                                <div className="results-empty-icon">▤</div>
                                <h2>Result unavailable</h2>
                                <p>{resultMessage}</p>
                            </div>
                        ) : result ? (
                            <>
                                <section className="results-student-card">
                                    <div className="results-student-avatar">
                                        {(result.studentName || "S")
                                            .trim()
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                    <div className="results-student-details">
                                        <h2>{result.studentName || "Student"}</h2>
                                        <p>
                                            {result.className || "Class"} ·{" "}
                                            {result.sectionName || "Section"}
                                        </p>
                                        <span>Academic Year: {result.academicYear}</span>
                                    </div>
                                </section>

                                <section className="results-summary-grid">
                                    <article className="results-summary-card">
                                        <span>Final Percentage</span>
                                        <strong>
                                            {formatPercentage(result.finalPercentage)}
                                        </strong>
                                        <small>Combined academic result</small>
                                    </article>

                                    <article className="results-summary-card">
                                        <span>Final Grade</span>
                                        <strong>{result.finalGrade || "—"}</strong>
                                        <small>Overall grade</small>
                                    </article>

                                    <article className="results-summary-card">
                                        <span>Final Status</span>
                                        <strong className={`result-status ${statusClass(result.finalResult)}`}>
                                            {result.finalResult || "Pending"}
                                        </strong>
                                        <small>Publication status is controlled by the school</small>
                                    </article>
                                </section>

                                {result.finalSubjects?.length > 0 && (
                                    <section className="results-panel">
                                        <div className="results-panel-header">
                                            <div>
                                                <h2>Combined Subject Results</h2>
                                                <p>Mid Term 20% + Annual 80%</p>
                                            </div>
                                        </div>

                                        <div className="results-table-wrapper">
                                            <table className="results-table">
                                                <thead>
                                                    <tr>
                                                        <th>Subject</th>
                                                        <th>Mid Term</th>
                                                        <th>Annual</th>
                                                        <th>Final</th>
                                                        <th>Grade</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {result.finalSubjects.map((subject) => (
                                                        <tr key={subject.subjectId}>
                                                            <td className="subject-name">
                                                                {subject.subjectName}
                                                            </td>
                                                            <td>{formatPercentage(subject.midTermPercentage)}</td>
                                                            <td>{formatPercentage(subject.annualPercentage)}</td>
                                                            <td>{formatPercentage(subject.finalPercentage)}</td>
                                                            <td>
                                                                <span className="grade-pill">
                                                                    {subject.grade || "—"}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`result-status ${statusClass(subject.result)}`}>
                                                                    {subject.result || "—"}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                )}

                                {result.examinationResults?.map((exam) => (
                                    <section className="results-panel" key={exam.examinationId}>
                                        <div className="results-panel-header">
                                            <div>
                                                <h2>{exam.examinationName}</h2>
                                                <p>Individual examination performance</p>
                                            </div>
                                            <span className={`result-status ${statusClass(exam.result)}`}>
                                                {exam.result || "—"}
                                            </span>
                                        </div>

                                        <div className="exam-metrics">
                                            <div>
                                                <span>Marks Obtained</span>
                                                <strong>
                                                    {formatMarks(
                                                        exam.totalObtainedMarks,
                                                        exam.totalMaxMarks
                                                    )}
                                                </strong>
                                            </div>
                                            <div>
                                                <span>Percentage</span>
                                                <strong>{formatPercentage(exam.percentage)}</strong>
                                            </div>
                                            <div>
                                                <span>Grade</span>
                                                <strong>{exam.grade || "—"}</strong>
                                            </div>
                                        </div>

                                        <div className="results-table-wrapper">
                                            <table className="results-table">
                                                <thead>
                                                    <tr>
                                                        <th>Subject</th>
                                                        <th>Marks Obtained</th>
                                                        <th>Percentage</th>
                                                        <th>Grade</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(exam.subjects || []).map((subject, index) => (
                                                        <tr key={subject.subjectId ?? `${exam.examinationId}-${index}`}>
                                                            <td className="subject-name">
                                                                {subject.subjectName}
                                                            </td>
                                                            <td>
                                                                {formatMarks(
                                                                    subject.obtainedMarks,
                                                                    subject.maxMarks
                                                                )}
                                                            </td>
                                                            <td>{formatPercentage(subject.percentage)}</td>
                                                            <td>
                                                                <span className="grade-pill">
                                                                    {subject.grade || "—"}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`result-status ${statusClass(subject.result)}`}>
                                                                    {subject.result || "—"}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </section>
                                ))}
                            </>
                        ) : null}
                    </>
                )}
            </main>
        </div>
    </div>
);

}

export default StudentResults;
