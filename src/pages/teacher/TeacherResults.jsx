import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import TeacherSidebar from "../../components/TeacherSidebar";
import api from "../../services/api";
import "./TeacherResults.css";

const TeacherResults = () => {
const [results, setResults] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
const [search, setSearch] = useState("");
const [selectedExam, setSelectedExam] = useState("ALL");
const [selectedClass, setSelectedClass] = useState("ALL");
const [selectedSubject, setSelectedSubject] = useState("ALL");

const loadResults = async () => {
try {
setLoading(true);
setError("");

  const response = await api.get("/api/student-marks");
  const data = Array.isArray(response.data) ? response.data : [];

  setResults(data);
} catch (err) {
  console.error("Failed to load results:", err);
  setError(
    err.response?.data?.message ||
      "Unable to load results. Please try again."
  );
} finally {
  setLoading(false);
}


};

useEffect(() => {
loadResults();
}, []);

const exams = useMemo(
() => [...new Set(results.map((r) => r.examinationName).filter(Boolean))],
[results]
);

const classes = useMemo(
() => [...new Set(results.map((r) => r.className).filter(Boolean))],
[results]
);

const subjects = useMemo(
() => [...new Set(results.map((r) => r.subjectName).filter(Boolean))],
[results]
);

const filteredResults = useMemo(() => {
const query = search.trim().toLowerCase();


return results.filter((r) => {
  const matchesSearch = [
    r.studentName,
    r.examinationName,
    r.subjectName,
    r.className,
    r.sectionName,
    r.academicYear,
    r.grade,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(query));

  return (
    (!query || matchesSearch) &&
    (selectedExam === "ALL" || r.examinationName === selectedExam) &&
    (selectedClass === "ALL" || r.className === selectedClass) &&
    (selectedSubject === "ALL" || r.subjectName === selectedSubject)
  );
});

}, [results, search, selectedExam, selectedClass, selectedSubject]);

const averagePercentage = useMemo(() => {
const values = filteredResults
.map((r) => Number(r.percentage))
.filter(Number.isFinite);


return values.length
  ? values.reduce((sum, value) => sum + value, 0) / values.length
  : null;

}, [filteredResults]);

const passCount = filteredResults.filter(
(r) =>
r.obtainedMarks != null &&
r.passMarks != null &&
Number(r.obtainedMarks) >= Number(r.passMarks)
).length;

const formatPercentage = (value) =>
value == null || !Number.isFinite(Number(value))
? "—"
: `${Number(value).toFixed(1)}%`;

const getOutcome = (result) => {
if (result.obtainedMarks == null || result.passMarks == null) {
return "Unknown";
}

return Number(result.obtainedMarks) >= Number(result.passMarks)
  ? "Pass"
  : "Fail";
};

return ( <div className="teacher-results-page"> <Navbar />


  <div className="teacher-results-layout">
    <TeacherSidebar />

    <main className="teacher-results-main">
      <div className="teacher-results-heading">
        <div>
          <span className="teacher-results-eyebrow">
            TEACHER PORTAL
          </span>
          <h1>Results &amp; Marks</h1>
          <p>
            Review examination performance and marks for your students.
          </p>
        </div>

        <button
          className="tr-refresh-btn"
          onClick={loadResults}
          disabled={loading}
        >
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      {error && (
        <div className="tr-error">
          <span>{error}</span>
          <button onClick={loadResults}>Try again</button>
        </div>
      )}

      <section className="tr-stats">
        <article className="tr-stat-card">
          <div className="tr-stat-icon tr-icon-blue">▤</div>
          <div>
            <span>Result Records</span>
            <strong>{filteredResults.length}</strong>
            <small>Matching your filters</small>
          </div>
        </article>

        <article className="tr-stat-card">
          <div className="tr-stat-icon tr-icon-green">%</div>
          <div>
            <span>Average Percentage</span>
            <strong>
              {averagePercentage == null
                ? "—"
                : `${averagePercentage.toFixed(1)}%`}
            </strong>
            <small>Across matching records</small>
          </div>
        </article>

        <article className="tr-stat-card">
          <div className="tr-stat-icon tr-icon-purple">✓</div>
          <div>
            <span>Passed Records</span>
            <strong>{passCount}</strong>
            <small>Based on pass marks</small>
          </div>
        </article>

        <article className="tr-stat-card">
          <div className="tr-stat-icon tr-icon-orange">!</div>
          <div>
            <span>Failed Records</span>
            <strong>
              {
                filteredResults.filter(
                  (r) => getOutcome(r) === "Fail"
                ).length
              }
            </strong>
            <small>Below pass marks</small>
          </div>
        </article>
      </section>

      <section className="tr-results-card">
        <div className="tr-card-heading">
          <div>
            <h2>Examination Results</h2>
            <p>Search and filter the available marks records.</p>
          </div>
          <span className="tr-record-count">
            {filteredResults.length} records
          </span>
        </div>

        <div className="tr-filters">
          <input
            type="search"
            placeholder="Search student, exam, subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search examination results"
          />

          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            aria-label="Filter by examination"
          >
            <option value="ALL">All examinations</option>
            {exams.map((exam) => (
              <option key={exam} value={exam}>
                {exam}
              </option>
            ))}
          </select>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            aria-label="Filter by class"
          >
            <option value="ALL">All classes</option>
            {classes.map((className) => (
              <option key={className} value={className}>
                {className}
              </option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            aria-label="Filter by subject"
          >
            <option value="ALL">All subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>

          <button
            className="tr-clear-btn"
            onClick={() => {
              setSearch("");
              setSelectedExam("ALL");
              setSelectedClass("ALL");
              setSelectedSubject("ALL");
            }}
          >
            Clear
          </button>
        </div>

        {loading ? (
          <div className="tr-state">
            <div className="tr-spinner" />
            <p>Loading examination results...</p>
          </div>
        ) : error ? (
          <div className="tr-state">
            <p>Results could not be loaded.</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="tr-state">
            <div className="tr-empty-icon">▤</div>
            <h3>No results found</h3>
            <p>
              {results.length === 0
                ? "No marks records are available yet."
                : "Try changing your search or filters."}
            </p>
          </div>
        ) : (
          <div className="tr-table-wrapper">
            <table className="tr-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class / Section</th>
                  <th>Examination</th>
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Percentage</th>
                  <th>Grade</th>
                  <th>Outcome</th>
                  <th>Exam Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredResults.map((result) => {
                  const outcome = getOutcome(result);

                  return (
                    <tr key={result.id}>
                      <td>
                        <div className="tr-student-cell">
                          <span className="tr-avatar">
                            {(result.studentName || "?")
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                          <div>
                            <strong>
                              {result.studentName || "Unknown student"}
                            </strong>
                            <small>
                              {result.academicYear || "—"}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <strong>{result.className || "—"}</strong>
                        <small className="tr-subline">
                          Section {result.sectionName || "—"}
                        </small>
                      </td>

                      <td>{result.examinationName || "—"}</td>
                      <td>{result.subjectName || "—"}</td>

                      <td>
                        <strong>
                          {result.obtainedMarks ?? "—"}
                        </strong>
                        <span className="tr-max-marks">
                          {" "}
                          / {result.maxMarks ?? "—"}
                        </span>
                      </td>

                      <td>
                        <strong>
                          {formatPercentage(result.percentage)}
                        </strong>
                      </td>

                      <td>
                        <span className="tr-grade">
                          {result.grade || "—"}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`tr-outcome ${
                            outcome === "Pass"
                              ? "tr-pass"
                              : outcome === "Fail"
                              ? "tr-fail"
                              : "tr-unknown"
                          }`}
                        >
                          {outcome}
                        </span>
                      </td>

                      <td>{result.examDate || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="tr-card-footer">
          <span>
            Showing {filteredResults.length} of {results.length} records
          </span>
          <span>Read-only teacher view</span>
        </div>
      </section>
    </main>
  </div>
</div>

)
};

export default TeacherResults;
