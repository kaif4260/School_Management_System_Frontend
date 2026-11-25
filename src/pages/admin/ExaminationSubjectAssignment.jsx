import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import {
getExaminationSubjects,
getExaminationOptions,
getSubjectOptions,
getClassOptions,
createExaminationSubject,
deleteExaminationSubject,
} from "../../services/examinationSubjectService";
import "./ExaminationSubjectAssignment.css";

const getArray = (data) => {
if (Array.isArray(data)) return data;
if (Array.isArray(data?.content)) return data.content;
if (Array.isArray(data?.data)) return data.data;
return [];
};

const getExaminationName = (exam) =>
exam?.name ?? exam?.examinationName ?? "";

const getSubjectName = (subject) =>
subject?.name ?? subject?.subjectName ?? "";

const getClassName = (schoolClass) =>
schoolClass?.name ?? schoolClass?.className ?? "";

const getExamLimit = (examName) => {
const name = examName.toLowerCase();

if (name.includes("mid")) return 20;
if (name.includes("annual")) return 80;

return null;

};

function ExaminationSubjectAssignment() {
const [examinations, setExaminations] = useState([]);
const [subjects, setSubjects] = useState([]);
const [classes, setClasses] = useState([]);
const [assignments, setAssignments] = useState([]);

const [form, setForm] = useState({
    examinationId: "",
    classId: "",
    subjectId: "",
    maxMarks: "",
    passMarks: "",
    examDate: "",
});

const [search, setSearch] = useState("");
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");

const selectedExam = examinations.find(
    (exam) => String(exam.id) === String(form.examinationId)
);

const examLimit = selectedExam
    ? getExamLimit(getExaminationName(selectedExam))
    : null;

const loadData = async () => {
    setLoading(true);
    setError("");

    try {
        const [examData, subjectData, classData, assignmentData] =
            await Promise.all([
                getExaminationOptions(),
                getSubjectOptions(),
                getClassOptions(),
                getExaminationSubjects(),
            ]);

        setExaminations(getArray(examData));
        setSubjects(getArray(subjectData));
        setClasses(getArray(classData));
        setAssignments(getArray(assignmentData));
    } catch (err) {
        setError(
            err.response?.data?.message ||
            "Unable to load examination assignment data."
        );
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    loadData();
}, []);

const updateField = (event) => {
    const { name, value } = event.target;

    setForm((previous) => {
        const next = { ...previous, [name]: value };

        if (name === "examinationId") {
            const selected = examinations.find(
                (exam) => String(exam.id) === String(value)
            );

            const limit = selected
                ? getExamLimit(getExaminationName(selected))
                : null;

            next.maxMarks = limit ? String(limit) : "";
            next.passMarks = "";
            next.examDate = "";
            next.subjectId = "";
        }

        if (name === "classId") {
            next.subjectId = "";
        }

        if (name === "maxMarks") {
            const max = Number(value);
            if (next.passMarks !== "" && Number(next.passMarks) > max) {
                next.passMarks = "";
            }
        }

        return next;
    });

    setError("");
    setSuccess("");
};

const filteredAssignments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return assignments;

    return assignments.filter((item) =>
        [
            item.examinationName,
            item.subjectName,
            item.className,
            item.examDate,
        ].some((value) =>
            String(value ?? "").toLowerCase().includes(keyword)
        )
    );
}, [assignments, search]);

const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const max = Number(form.maxMarks);
    const pass = Number(form.passMarks);

    if (!form.examinationId || !form.classId || !form.subjectId ||
        !form.examDate || form.maxMarks === "" || form.passMarks === "") {
        setError("Please complete all fields.");
        return;
    }

    if (!Number.isInteger(max) || max < 1) {
        setError("Maximum marks must be a positive whole number.");
        return;
    }

    if (examLimit !== null && max !== examLimit) {
        setError(
            `${getExaminationName(selectedExam)} must have exactly ${examLimit} maximum marks per subject.`
        );
        return;
    }

    if (!Number.isInteger(pass) || pass < 0 || pass > max) {
        setError("Pass marks must be between 0 and maximum marks.");
        return;
    }

    const duplicate = assignments.some(
        (item) =>
            String(item.examinationId) === String(form.examinationId) &&
            String(item.classId) === String(form.classId) &&
            String(item.subjectId) === String(form.subjectId)
    );

    if (duplicate) {
        setError("This subject is already assigned to that examination and class.");
        return;
    }

    const request = {
        examinationId: Number(form.examinationId),
        classId: Number(form.classId),
        subjectId: Number(form.subjectId),
        maxMarks: max,
        passMarks: pass,
        examDate: form.examDate,
    };

    setSaving(true);

    try {
        await createExaminationSubject(request);
        setSuccess("Subject assigned to examination successfully.");

        setForm((previous) => ({
            ...previous,
            subjectId: "",
            passMarks: "",
            examDate: "",
        }));

        await loadData();
    } catch (err) {
        setError(
            err.response?.data?.message ||
            "Failed to assign subject. Check the selected examination, class, and date."
        );
    } finally {
        setSaving(false);
    }
};

const handleDelete = async (item) => {
    const confirmed = window.confirm(
        `Remove ${item.subjectName} from ${item.examinationName}?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
        await deleteExaminationSubject(item.id);
        setAssignments((previous) =>
            previous.filter((assignment) => assignment.id !== item.id)
        );
        setSuccess("Examination subject assignment removed.");
    } catch (err) {
        setError(
            err.response?.data?.message ||
            "Unable to delete this assignment."
        );
    }
};

return (
    <div className="esa-layout">
        <Navbar />

        <div className="esa-body">
            <Sidebar />

            <main className="esa-main">
                <div className="esa-heading">
                    <div>
                        <span className="esa-eyebrow">ACADEMIC MANAGEMENT</span>
                        <h1>Assign Subjects to Examination</h1>
                        <p>
                            Configure subjects, marks, and exam dates for each class.
                        </p>
                    </div>

                    <div className="esa-total-card">
                        <span>Final result</span>
                        <strong>100 marks</strong>
                        <small>Mid Term 20 + Annual 80</small>
                    </div>
                </div>

                {error && <div className="esa-alert esa-error">{error}</div>}
                {success && <div className="esa-alert esa-success">{success}</div>}

                <section className="esa-card">
                    <div className="esa-card-heading">
                        <div>
                            <h2>New subject assignment</h2>
                            <p>Select the examination and configure its subject.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="esa-form-grid">
                            <label>
                                Examination *
                                <select
                                    name="examinationId"
                                    value={form.examinationId}
                                    onChange={updateField}
                                    required
                                >
                                    <option value="">Select examination</option>
                                    {examinations.map((exam) => (
                                        <option key={exam.id} value={exam.id}>
                                            {getExaminationName(exam)}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label>
                                Class *
                                <select
                                    name="classId"
                                    value={form.classId}
                                    onChange={updateField}
                                    required
                                >
                                    <option value="">Select class</option>
                                    {classes
                                        .filter((item) => item.status !== "INACTIVE")
                                        .map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {getClassName(item)}
                                            </option>
                                        ))}
                                </select>
                            </label>

                            <label>
                                Subject *
                                <select
                                    name="subjectId"
                                    value={form.subjectId}
                                    onChange={updateField}
                                    required
                                >
                                    <option value="">Select subject</option>
                                    {subjects
                                        .filter((item) => item.status !== "INACTIVE")
                                        .map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {getSubjectName(item)}
                                            </option>
                                        ))}
                                </select>
                            </label>

                            <label>
                                Maximum marks *
                                <input
                                    type="number"
                                    name="maxMarks"
                                    value={form.maxMarks}
                                    onChange={updateField}
                                    min="1"
                                    max={examLimit ?? undefined}
                                    readOnly={examLimit !== null}
                                    required
                                />
                                {examLimit !== null && (
                                    <small className="esa-hint">
                                        Fixed for this examination: {examLimit} marks.
                                    </small>
                                )}
                            </label>

                            <label>
                                Passing marks *
                                <input
                                    type="number"
                                    name="passMarks"
                                    value={form.passMarks}
                                    onChange={updateField}
                                    min="0"
                                    max={form.maxMarks || undefined}
                                    required
                                />
                            </label>

                            <label>
                                Examination date *
                                <input
                                    type="date"
                                    name="examDate"
                                    value={form.examDate}
                                    onChange={updateField}
                                    required
                                />
                            </label>
                        </div>

                        <div className="esa-form-footer">
                            <p>
                                {examLimit !== null
                                    ? `This subject contributes up to ${examLimit} marks toward the final result.`
                                    : "Choose Mid Term or Annual Exam to apply the configured marks limit."}
                            </p>

                            <button type="submit" disabled={saving || loading}>
                                {saving ? "Saving..." : "Assign Subject"}
                            </button>
                        </div>
                    </form>
                </section>

                <section className="esa-card">
                    <div className="esa-list-heading">
                        <div>
                            <h2>Assigned subjects</h2>
                            <p>{assignments.length} assignment(s) configured</p>
                        </div>

                        <input
                            type="search"
                            placeholder="Search exam, class, subject..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            aria-label="Search assigned subjects"
                        />
                    </div>

                    {loading ? (
                        <div className="esa-empty">Loading assignments...</div>
                    ) : filteredAssignments.length === 0 ? (
                        <div className="esa-empty">
                            No assignments found. Assign a subject above to get started.
                        </div>
                    ) : (
                        <div className="esa-table-wrapper">
                            <table className="esa-table">
                                <thead>
                                    <tr>
                                        <th>Examination</th>
                                        <th>Class</th>
                                        <th>Subject</th>
                                        <th>Maximum</th>
                                        <th>Pass marks</th>
                                        <th>Exam date</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredAssignments.map((item) => (
                                        <tr key={item.id}>
                                            <td>{item.examinationName}</td>
                                            <td>{item.className}</td>
                                            <td>{item.subjectName}</td>
                                            <td>{item.maxMarks}</td>
                                            <td>{item.passMarks}</td>
                                            <td>{item.examDate}</td>
                                            <td>
                                                <button
                                                    type="button"
                                                    className="esa-delete"
                                                    onClick={() => handleDelete(item)}
                                                >
                                                    Remove
                                                </button>
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

export default ExaminationSubjectAssignment;