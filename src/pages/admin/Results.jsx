
import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
    getAllEnrollments,
    getAllStudents,
    getAllClasses,
    getAllSections,
    getAllExaminations,
    getStudentResult
} from "../../services/resultService";

import "./results.css";

const Results = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [examinations, setExaminations] = useState([]);

    const [selectedEnrollment, setSelectedEnrollment] = useState("");
    const [selectedExamination, setSelectedExamination] = useState("");

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingResult, setLoadingResult] = useState(false);
    const [error, setError] = useState("");
    const [resultError, setResultError] = useState("");

    useEffect(() => {
        loadInitialData();
    }, []);

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
                getAllEnrollments(),
                getAllStudents(),
                getAllClasses(),
                getAllSections(),
                getAllExaminations()
            ]);

            setEnrollments(
                Array.isArray(enrollmentData)
                    ? enrollmentData
                    : enrollmentData?.content || []
            );

            setStudents(
                Array.isArray(studentData)
                    ? studentData
                    : studentData?.content || []
            );

            setClasses(
                Array.isArray(classData)
                    ? classData
                    : classData?.content || []
            );

            setSections(
                Array.isArray(sectionData)
                    ? sectionData
                    : sectionData?.content || []
            );

            setExaminations(
                Array.isArray(examinationData)
                    ? examinationData
                    : examinationData?.content || []
            );
        } catch (err) {
            console.error("Failed to load result data:", err);

            setError(
                err?.response?.data?.message ||
                "Failed to load result data."
            );
        } finally {
            setLoading(false);
        }
    };

    const annualExaminations = useMemo(
        () => examinations.filter(
            (exam) =>
                (exam.name || "").trim().toLowerCase() ===
                "annual examination"
        ),
        [examinations]
    );

    const getStudentName = (studentId) => {
        const student = students.find(
            (item) => Number(item.id) === Number(studentId)
        );

        return student
            ? `${student.firstName || ""} ${student.lastName || ""}`.trim()
            : `Student #${studentId}`;
    };

    const getClassName = (classId) => {
        const schoolClass = classes.find(
            (item) => Number(item.id) === Number(classId)
        );

        return schoolClass?.name || `Class #${classId}`;
    };

    const getSectionName = (sectionId) => {
        const section = sections.find(
            (item) => Number(item.id) === Number(sectionId)
        );

        return section?.name || `Section #${sectionId}`;
    };

    const availableAnnualExaminations = useMemo(() => {
        const enrollment = enrollments.find(
            (item) => String(item.id) === String(selectedEnrollment)
        );

        if (!enrollment?.academicYear) {
            return annualExaminations;
        }

        return annualExaminations.filter(
            (exam) =>
                !exam.academicYear ||
                String(exam.academicYear) ===
                    String(enrollment.academicYear)
        );
    }, [annualExaminations, enrollments, selectedEnrollment]);

    const handleEnrollmentChange = (value) => {
        setSelectedEnrollment(value);
        setSelectedExamination("");
        setResult(null);
        setResultError("");
    };

    const handleViewResult = async () => {
        if (!selectedEnrollment || !selectedExamination) {
            setResultError(
                "Please select a student enrollment and Annual Examination."
            );
            return;
        }

        try {
            setLoadingResult(true);
            setResultError("");
            setResult(null);

            const resultData = await getStudentResult(
                selectedEnrollment,
                selectedExamination
            );

            setResult(resultData);
        } catch (err) {
            console.error("Failed to load published result:", err);

            setResultError(
                err?.response?.data?.message ||
                "Unable to load the published final result."
            );
        } finally {
            setLoadingResult(false);
        }
    };

    const getResultClass = (value) => {
        if (!value) return "";

        return value.toUpperCase() === "PASS"
            ? "result-pass"
            : "result-fail";
    };

    const formatPercentage = (value) =>
        Number(value ?? 0).toFixed(2);

    if (loading) {
        return (
            <div className="admin-page">
                <Navbar />
                <div className="admin-content">
                    <Sidebar />
                    <main className="results-main">
                        <div className="results-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading results...</p>
                        </div>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <Navbar />

            <div className="admin-content">
                <Sidebar />

                <main className="results-main">
                    <div className="results-header">
                        <div>
                            <h1>Results</h1>
                            <p>
                                View published Mid Term, Annual, and final results
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="results-error">{error}</div>
                    )}

                    <section className="result-selector-card">
                        <div className="selector-header">
                            <div>
                                <h2>View Published Result</h2>
                                <p>
                                    Select a student and the Annual Examination
                                    to view the complete final result.
                                </p>
                            </div>
                        </div>

                        <div className="selector-grid">
                            <div className="form-group">
                                <label>Student Enrollment</label>

                                <select
                                    value={selectedEnrollment}
                                    onChange={(e) =>
                                        handleEnrollmentChange(e.target.value)
                                    }
                                >
                                    <option value="">Select Student</option>

                                    {enrollments.map((enrollment) => (
                                        <option
                                            key={enrollment.id}
                                            value={enrollment.id}
                                        >
                                            {getStudentName(enrollment.studentId)}
                                            {" - "}
                                            {getClassName(enrollment.classId)}
                                            {" / "}
                                            {getSectionName(enrollment.sectionId)}
                                            {" - "}
                                            {enrollment.academicYear}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Final Result Examination</label>

                                <select
                                    value={selectedExamination}
                                    onChange={(e) => {
                                        setSelectedExamination(e.target.value);
                                        setResult(null);
                                        setResultError("");
                                    }}
                                >
                                    <option value="">
                                        Select Annual Examination
                                    </option>

                                    {availableAnnualExaminations.map((exam) => (
                                        <option key={exam.id} value={exam.id}>
                                            {exam.name} - {exam.academicYear}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {resultError && (
                            <div className="result-inline-error">
                                {resultError}
                            </div>
                        )}

                        <div className="selector-actions">
                            <button
                                className="view-result-btn"
                                onClick={handleViewResult}
                                disabled={
                                    loadingResult ||
                                    !selectedEnrollment ||
                                    !selectedExamination
                                }
                            >
                                {loadingResult ? "Loading..." : "View Result"}
                            </button>
                        </div>
                    </section>

                    {!result && !loadingResult && !resultError && (
                        <div className="result-empty-state">
                            <div className="empty-icon">📊</div>
                            <h3>No Result Selected</h3>
                            <p>
                                Select a student enrollment and Annual Examination
                                to view the published result.
                            </p>
                        </div>
                    )}

                    {result && (
                        <div className="result-container">
                            <section className="student-result-card">
                                <div className="student-result-info">
                                    <div>
                                        <span className="info-label">Student</span>
                                        <h2>{result.studentName}</h2>
                                    </div>

                                    <div>
                                        <span className="info-label">
                                            Academic Year
                                        </span>
                                        <strong>{result.academicYear}</strong>
                                    </div>

                                    <div>
                                        <span className="info-label">Class</span>
                                        <strong>
                                            {result.className} - {result.sectionName}
                                        </strong>
                                    </div>

                                    <div>
                                        <span className="info-label">
                                            Publication
                                        </span>
                                        <strong>Final Result Published</strong>
                                    </div>
                                </div>
                            </section>

                            {/* COMBINED FINAL RESULT */}
                            <section className="subject-results-card">
                                <div className="subject-results-header">
                                    <div>
                                        <h2>Combined Final Result</h2>
                                        <p>
                                            Mid Term contributes 20%; Annual
                                            Examination contributes 80%.
                                        </p>
                                    </div>
                                </div>

                                <div className="result-summary-grid">
                                    <div className="result-summary-card">
                                        <span>Mid Term Weight</span>
                                        <strong>20%</strong>
                                    </div>

                                    <div className="result-summary-card">
                                        <span>Annual Weight</span>
                                        <strong>80%</strong>
                                    </div>

                                    <div className="result-summary-card">
                                        <span>Final Percentage</span>
                                        <strong>
                                            {formatPercentage(result.finalPercentage)}%
                                        </strong>
                                    </div>

                                    <div className="result-summary-card">
                                        <span>Final Grade</span>
                                        <strong>{result.finalGrade || "—"}</strong>
                                    </div>

                                    <div className="result-summary-card">
                                        <span>Final Result</span>
                                        <strong
                                            className={getResultClass(
                                                result.finalResult
                                            )}
                                        >
                                            {result.finalResult || "—"}
                                        </strong>
                                    </div>
                                </div>

                                <div className="subject-results-header">
                                    <div>
                                        <h2>Final Subject Results</h2>
                                        <p>
                                            Each subject is calculated using
                                            the configured maximum marks for
                                            both examinations.
                                        </p>
                                    </div>
                                </div>

                                {result.finalSubjects?.length > 0 ? (
                                    <div className="result-table-wrapper">
                                        <table className="result-table">
                                            <thead>
                                                <tr>
                                                    <th>Subject</th>
                                                    <th>Mid Term %</th>
                                                    <th>Annual %</th>
                                                    <th>Final %</th>
                                                    <th>Required to Pass %</th>
                                                    <th>Grade</th>
                                                    <th>Result</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {result.finalSubjects.map((subject) => (
                                                    <tr key={subject.subjectId}>
                                                        <td>
                                                            <strong>
                                                                {subject.subjectName}
                                                            </strong>
                                                        </td>
                                                        <td>
                                                            {formatPercentage(
                                                                subject.midTermPercentage
                                                            )}%
                                                        </td>
                                                        <td>
                                                            {formatPercentage(
                                                                subject.annualPercentage
                                                            )}%
                                                        </td>
                                                        <td>
                                                            <strong>
                                                                {formatPercentage(
                                                                    subject.finalPercentage
                                                                )}%
                                                            </strong>
                                                        </td>
                                                        <td>
                                                            {formatPercentage(
                                                                subject.requiredPassPercentage
                                                            )}%
                                                        </td>
                                                        <td>
                                                            <span className="grade-badge">
                                                                {subject.grade}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span
                                                                className={`status-badge ${getResultClass(
                                                                    subject.result
                                                                )}`}
                                                            >
                                                                {subject.result}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="no-subject-results">
                                        No final subject results available.
                                    </div>
                                )}
                            </section>

                            {/* INDIVIDUAL EXAMINATION RESULTS */}
                            {(result.examinationResults || []).map((exam) => (
                                <section
                                    className="subject-results-card"
                                    key={exam.examinationId}
                                >
                                    <div className="subject-results-header">
                                        <div>
                                            <h2>{exam.examinationName}</h2>
                                            <p>
                                                Individual examination performance
                                            </p>
                                        </div>
                                    </div>

                                    <div className="result-summary-grid">
                                        <div className="result-summary-card">
                                            <span>Total Marks</span>
                                            <strong>
                                                {exam.totalObtainedMarks}
                                                {" / "}
                                                {exam.totalMaxMarks}
                                            </strong>
                                        </div>

                                        <div className="result-summary-card">
                                            <span>Percentage</span>
                                            <strong>
                                                {formatPercentage(exam.percentage)}%
                                            </strong>
                                        </div>

                                        <div className="result-summary-card">
                                            <span>Grade</span>
                                            <strong>{exam.grade}</strong>
                                        </div>

                                        <div className="result-summary-card">
                                            <span>Result</span>
                                            <strong
                                                className={getResultClass(exam.result)}
                                            >
                                                {exam.result}
                                            </strong>
                                        </div>
                                    </div>

                                    {exam.subjects?.length > 0 ? (
                                        <div className="result-table-wrapper">
                                            <table className="result-table">
                                                <thead>
                                                    <tr>
                                                        <th>Subject</th>
                                                        <th>Max Marks</th>
                                                        <th>Pass Marks</th>
                                                        <th>Obtained</th>
                                                        <th>Percentage</th>
                                                        <th>Grade</th>
                                                        <th>Result</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    {exam.subjects.map((subject) => (
                                                        <tr key={subject.subjectId}>
                                                            <td>
                                                                <strong>
                                                                    {subject.subjectName}
                                                                </strong>
                                                            </td>
                                                            <td>{subject.maxMarks}</td>
                                                            <td>{subject.passMarks}</td>
                                                            <td>
                                                                {subject.obtainedMarks}
                                                            </td>
                                                            <td>
                                                                {formatPercentage(
                                                                    subject.percentage
                                                                )}%
                                                            </td>
                                                            <td>
                                                                <span className="grade-badge">
                                                                    {subject.grade}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span
                                                                    className={`status-badge ${getResultClass(
                                                                        subject.result
                                                                    )}`}
                                                                >
                                                                    {subject.result}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="no-subject-results">
                                            No subject results available.
                                        </div>
                                    )}
                                </section>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Results;