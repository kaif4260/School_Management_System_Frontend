import { useEffect, useMemo, useState } from "react";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
    getTimetables,
    createTimetable,
    updateTimetable,
    deleteTimetable
} from "../../services/timetableService";

import { getClasses } from "../../services/classService";
import { getSectionsByClass } from "../../services/sectionService";
import { getSubjects } from "../../services/subjectService";
import { getTeachers } from "../../services/teacherService";

import "./timetable.css";

const DAYS = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY"
];

const emptyForm = {
    classId: "",
    sectionId: "",
    subjectId: "",
    teacherId: "",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    roomNumber: ""
};

const formatDay = (day) => {
    if (!day) return "";

    return day.charAt(0) + day.slice(1).toLowerCase();
};

const formatTime = (time) => {
    if (!time) return "";

    const [hours, minutes] = time.split(":");
    const date = new Date();

    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });
};

const getErrorMessage = (error) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data ||
        error?.message ||
        "Something went wrong. Please try again."
    );
};

function Timetable() {

    const [timetables, setTimetables] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [classFilter, setClassFilter] = useState("");
    const [sectionFilter, setSectionFilter] = useState("");
    const [dayFilter, setDayFilter] = useState("");

    const [activeModal, setActiveModal] = useState(null);

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState(emptyForm);

    // ---------------------------------------
    // LOAD DATA
    // ---------------------------------------

    const loadData = async () => {

        try {
            setLoading(true);
            setError("");

            const [
                timetableData,
                classData,
                subjectData,
                teacherData
            ] = await Promise.all([
                getTimetables(),
                getClasses(),
                getSubjects(),
                getTeachers()
            ]);

            setTimetables(timetableData || []);
            setClasses(classData || []);
            setSubjects(subjectData || []);
            setTeachers(teacherData || []);

        } catch (err) {

            console.error(err);

            setError(
                getErrorMessage(err)
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // ---------------------------------------
    // LOAD SECTIONS WHEN CLASS CHANGES
    // ---------------------------------------

    useEffect(() => {

        const loadSections = async () => {

            if (!form.classId) {
                setSections([]);
                return;
            }

            try {

                const data =
                    await getSectionsByClass(
                        form.classId
                    );

                setSections(data || []);

            } catch (err) {

                console.error(err);

                setSections([]);

                setError(
                    getErrorMessage(err)
                );
            }
        };

        loadSections();

    }, [form.classId]);

    // ---------------------------------------
    // FILTER SECTIONS
    // ---------------------------------------

    useEffect(() => {

        const loadFilterSections = async () => {

            if (!classFilter) {
                setSectionFilter("");
                return;
            }

            try {

                const data =
                    await getSectionsByClass(
                        classFilter
                    );

                setFilterSections(
                    data || []
                );

            } catch (err) {

                console.error(err);

                setFilterSections([]);
            }
        };

        loadFilterSections();

    }, [classFilter]);

    const [filterSections, setFilterSections] = useState([]);

    // ---------------------------------------
    // FORM CHANGE
    // ---------------------------------------

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));

        if (name === "classId") {

            setForm((previous) => ({
                ...previous,
                classId: value,
                sectionId: ""
            }));
        }
    };

    // ---------------------------------------
    // FILTERED TIMETABLES
    // ---------------------------------------

    const filteredTimetables = useMemo(() => {

        const keyword =
            search.trim().toLowerCase();

        return timetables
            .filter((item) => {

                if (
                    classFilter &&
                    String(item.classId) !==
                    String(classFilter)
                ) {
                    return false;
                }

                if (
                    sectionFilter &&
                    String(item.sectionId) !==
                    String(sectionFilter)
                ) {
                    return false;
                }

                if (
                    dayFilter &&
                    item.dayOfWeek !== dayFilter
                ) {
                    return false;
                }

                if (!keyword) {
                    return true;
                }

                return [
                    item.className,
                    item.sectionName,
                    item.subjectName,
                    item.teacherName,
                    item.roomNumber,
                    item.dayOfWeek
                ]
                    .filter(Boolean)
                    .some((value) =>
                        String(value)
                            .toLowerCase()
                            .includes(keyword)
                    );
            })
            .sort((a, b) => {

                const dayDifference =
                    DAYS.indexOf(a.dayOfWeek) -
                    DAYS.indexOf(b.dayOfWeek);

                if (dayDifference !== 0) {
                    return dayDifference;
                }

                return (
                    a.startTime || ""
                ).localeCompare(
                    b.startTime || ""
                );
            });

    }, [
        timetables,
        search,
        classFilter,
        sectionFilter,
        dayFilter
    ]);

    // ---------------------------------------
    // OPEN CREATE MODAL
    // ---------------------------------------

    const openCreateModal = () => {

        setEditingId(null);

        setForm(emptyForm);

        setSections([]);

        setError("");

        setActiveModal("form");
    };

    // ---------------------------------------
    // OPEN EDIT MODAL
    // ---------------------------------------

    const openEditModal = (item) => {

        setEditingId(item.id);

        setForm({
            classId: item.classId || "",
            sectionId: item.sectionId || "",
            subjectId: item.subjectId || "",
            teacherId: item.teacherId || "",
            dayOfWeek: item.dayOfWeek || "",
            startTime: item.startTime || "",
            endTime: item.endTime || "",
            roomNumber: item.roomNumber || ""
        });

        setError("");

        setActiveModal("form");
    };

    // ---------------------------------------
    // CLOSE MODAL
    // ---------------------------------------

    const closeModal = () => {

        if (submitting) return;

        setActiveModal(null);

        setEditingId(null);

        setForm(emptyForm);

        setSections([]);
    };

    // ---------------------------------------
    // SUBMIT
    // ---------------------------------------

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");

        if (!form.classId) {
            setError("Please select a class.");
            return;
        }

        if (!form.sectionId) {
            setError("Please select a section.");
            return;
        }

        if (!form.subjectId) {
            setError("Please select a subject.");
            return;
        }

        if (!form.teacherId) {
            setError("Please select a teacher.");
            return;
        }

        if (!form.dayOfWeek) {
            setError("Please select a day.");
            return;
        }

        if (!form.startTime || !form.endTime) {
            setError(
                "Please select start and end time."
            );
            return;
        }

        if (
            form.startTime >=
            form.endTime
        ) {
            setError(
                "Start time must be before end time."
            );
            return;
        }

        try {

            setSubmitting(true);

            const payload = {
                classId: Number(form.classId),
                sectionId: Number(form.sectionId),
                subjectId: Number(form.subjectId),
                teacherId: Number(form.teacherId),
                dayOfWeek: form.dayOfWeek,
                startTime: form.startTime,
                endTime: form.endTime,
                roomNumber:
                    form.roomNumber.trim() ||
                    null
            };

            if (editingId) {

                await updateTimetable(
                    editingId,
                    payload
                );

            } else {

                await createTimetable(
                    payload
                );
            }

            closeModal();

            await loadData();

        } catch (err) {

            console.error(err);

            setError(
                getErrorMessage(err)
            );

        } finally {

            setSubmitting(false);
        }
    };

    // ---------------------------------------
    // DELETE
    // ---------------------------------------

    const handleDelete = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this timetable entry?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setError("");

            await deleteTimetable(id);

            setTimetables((previous) =>
                previous.filter(
                    (item) =>
                        item.id !== id
                )
            );

        } catch (err) {

            console.error(err);

            setError(
                getErrorMessage(err)
            );
        }
    };

    // ---------------------------------------
    // RESET FILTERS
    // ---------------------------------------

    const resetFilters = () => {

        setSearch("");
        setClassFilter("");
        setSectionFilter("");
        setDayFilter("");
        setFilterSections([]);
    };

    // ---------------------------------------
    // RENDER
    // ---------------------------------------

    return (
        <div className="admin-page">

            <Navbar />

            <div className="admin-content">

                <Sidebar />

                <main className="timetable-main">

                    {loading ? (

                        <div className="timetable-loading">
                            <div className="loading-spinner"></div>
                            <p>
                                Loading timetable...
                            </p>
                        </div>

                    ) : (

                        <>

                            {/* HEADER */}

                            <div className="timetable-header">

                                <div>
                                    <h1>
                                        Timetable Management
                                    </h1>

                                    <p>
                                        Manage class schedules,
                                        teachers, subjects and
                                        rooms.
                                    </p>
                                </div>

                                <button
                                    className="primary-btn"
                                    onClick={
                                        openCreateModal
                                    }
                                >
                                    + Add Timetable
                                </button>

                            </div>

                            {/* ERROR */}

                            {error && (
                                <div className="error-banner">
                                    <span>
                                        {error}
                                    </span>

                                    <button
                                        onClick={() =>
                                            setError("")
                                        }
                                    >
                                        ×
                                    </button>
                                </div>
                            )}

                            {/* SUMMARY */}

                            <div className="timetable-summary">

                                <div className="summary-card">
                                    <span>
                                        Total Entries
                                    </span>

                                    <strong>
                                        {timetables.length}
                                    </strong>
                                </div>

                                <div className="summary-card">
                                    <span>
                                        Classes
                                    </span>

                                    <strong>
                                        {
                                            new Set(
                                                timetables.map(
                                                    (item) =>
                                                        item.classId
                                                )
                                            ).size
                                        }
                                    </strong>
                                </div>

                                <div className="summary-card">
                                    <span>
                                        Teachers
                                    </span>

                                    <strong>
                                        {
                                            new Set(
                                                timetables.map(
                                                    (item) =>
                                                        item.teacherId
                                                )
                                            ).size
                                        }
                                    </strong>
                                </div>

                                <div className="summary-card">
                                    <span>
                                        Rooms
                                    </span>

                                    <strong>
                                        {
                                            new Set(
                                                timetables
                                                    .map(
                                                        (item) =>
                                                            item.roomNumber
                                                    )
                                                    .filter(Boolean)
                                            ).size
                                        }
                                    </strong>
                                </div>

                            </div>

                            {/* TOOLBAR */}

                            <div className="timetable-toolbar">

                                <div className="search-box">

                                    <span>
                                        🔍
                                    </span>

                                    <input
                                        type="text"
                                        placeholder="Search class, subject, teacher or room..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>

                                <select
                                    value={classFilter}
                                    onChange={(e) => {
                                        setClassFilter(
                                            e.target.value
                                        );
                                        setSectionFilter("");
                                    }}
                                >
                                    <option value="">
                                        All Classes
                                    </option>

                                    {classes.map(
                                        (item) => (
                                            <option
                                                key={
                                                    item.id
                                                }
                                                value={
                                                    item.id
                                                }
                                            >
                                                {item.name}
                                            </option>
                                        )
                                    )}

                                </select>

                                <select
                                    value={sectionFilter}
                                    onChange={(e) =>
                                        setSectionFilter(
                                            e.target.value
                                        )
                                    }
                                    disabled={
                                        !classFilter
                                    }
                                >

                                    <option value="">
                                        All Sections
                                    </option>

                                    {filterSections.map(
                                        (item) => (
                                            <option
                                                key={
                                                    item.id
                                                }
                                                value={
                                                    item.id
                                                }
                                            >
                                                {item.name}
                                            </option>
                                        )
                                    )}

                                </select>

                                <select
                                    value={dayFilter}
                                    onChange={(e) =>
                                        setDayFilter(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="">
                                        All Days
                                    </option>

                                    {DAYS.map(
                                        (day) => (
                                            <option
                                                key={day}
                                                value={day}
                                            >
                                                {formatDay(
                                                    day
                                                )}
                                            </option>
                                        )
                                    )}

                                </select>

                                {(search ||
                                    classFilter ||
                                    sectionFilter ||
                                    dayFilter) && (

                                    <button
                                        className="reset-btn"
                                        onClick={
                                            resetFilters
                                        }
                                    >
                                        Reset
                                    </button>

                                )}

                            </div>

                            {/* TABLE */}

                            <div className="timetable-table-container">

                                {filteredTimetables.length === 0 ? (

                                    <div className="empty-state">

                                        <div className="empty-icon">
                                            📅
                                        </div>

                                        <h3>
                                            No timetable entries
                                        </h3>

                                        <p>
                                            Add a timetable
                                            entry to get
                                            started.
                                        </p>

                                        <button
                                            className="primary-btn"
                                            onClick={
                                                openCreateModal
                                            }
                                        >
                                            + Add Timetable
                                        </button>

                                    </div>

                                ) : (

                                    <table className="timetable-table">

                                        <thead>

                                            <tr>
                                                <th>Class</th>
                                                <th>Section</th>
                                                <th>Subject</th>
                                                <th>Teacher</th>
                                                <th>Day</th>
                                                <th>Time</th>
                                                <th>Room</th>
                                                <th>Actions</th>
                                            </tr>

                                        </thead>

                                        <tbody>

                                            {filteredTimetables.map(
                                                (item) => (

                                                    <tr
                                                        key={
                                                            item.id
                                                        }
                                                    >

                                                        <td>
                                                            <strong>
                                                                {
                                                                    item.className
                                                                }
                                                            </strong>
                                                        </td>

                                                        <td>
                                                            <span className="section-badge">
                                                                {
                                                                    item.sectionName
                                                                }
                                                            </span>
                                                        </td>

                                                        <td>
                                                            {
                                                                item.subjectName
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                item.teacherName
                                                            }
                                                        </td>

                                                        <td>
                                                            <span className="day-badge">
                                                                {
                                                                    formatDay(
                                                                        item.dayOfWeek
                                                                    )
                                                                }
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <div className="time-cell">
                                                                <strong>
                                                                    {
                                                                        formatTime(
                                                                            item.startTime
                                                                        )
                                                                    }
                                                                </strong>

                                                                <span>
                                                                    -
                                                                </span>

                                                                <strong>
                                                                    {
                                                                        formatTime(
                                                                            item.endTime
                                                                        )
                                                                    }
                                                                </strong>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            {
                                                                item.roomNumber ||
                                                                "—"
                                                            }
                                                        </td>

                                                        <td>

                                                            <div className="action-buttons">

                                                                <button
                                                                    className="edit-btn"
                                                                    onClick={() =>
                                                                        openEditModal(
                                                                            item
                                                                        )
                                                                    }
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    className="delete-btn"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            item.id
                                                                        )
                                                                    }
                                                                >
                                                                    Delete
                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>

                                                )
                                            )}

                                        </tbody>

                                    </table>

                                )}

                            </div>

                        </>
                    )}

                </main>

            </div>

            {/* ADD / EDIT MODAL */}

            {activeModal === "form" && (

                <div
                    className="modal-overlay"
                    onMouseDown={(e) => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            closeModal();
                        }

                    }}
                >

                    <div className="timetable-modal">

                        <div className="modal-header">

                            <div>
                                <h2>
                                    {editingId
                                        ? "Edit Timetable"
                                        : "Add Timetable"}
                                </h2>

                                <p>
                                    Create a class schedule
                                    entry.
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={
                                    closeModal
                                }
                            >
                                ×
                            </button>

                        </div>

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >

                            <div className="form-grid">

                                {/* CLASS */}

                                <div className="form-group">

                                    <label>
                                        Class *
                                    </label>

                                    <select
                                        name="classId"
                                        value={
                                            form.classId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select Class
                                        </option>

                                        {classes.map(
                                            (item) => (
                                                <option
                                                    key={
                                                        item.id
                                                    }
                                                    value={
                                                        item.id
                                                    }
                                                >
                                                    {
                                                        item.name
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                                {/* SECTION */}

                                <div className="form-group">

                                    <label>
                                        Section *
                                    </label>

                                    <select
                                        name="sectionId"
                                        value={
                                            form.sectionId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={
                                            !form.classId
                                        }
                                        required
                                    >

                                        <option value="">
                                            {form.classId
                                                ? "Select Section"
                                                : "Select Class First"}
                                        </option>

                                        {sections.map(
                                            (item) => (
                                                <option
                                                    key={
                                                        item.id
                                                    }
                                                    value={
                                                        item.id
                                                    }
                                                >
                                                    {
                                                        item.name
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                                {/* SUBJECT */}

                                <div className="form-group">

                                    <label>
                                        Subject *
                                    </label>

                                    <select
                                        name="subjectId"
                                        value={
                                            form.subjectId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select Subject
                                        </option>

                                        {subjects.map(
                                            (item) => (
                                                <option
                                                    key={
                                                        item.id
                                                    }
                                                    value={
                                                        item.id
                                                    }
                                                >
                                                    {
                                                        item.name
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                                {/* TEACHER */}

                                <div className="form-group">

                                    <label>
                                        Teacher *
                                    </label>

                                    <select
                                        name="teacherId"
                                        value={
                                            form.teacherId
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select Teacher
                                        </option>

                                        {teachers.map(
                                            (item) => (
                                                <option
                                                    key={
                                                        item.id
                                                    }
                                                    value={
                                                        item.id
                                                    }
                                                >
                                                    {
                                                        item.firstName
                                                    }{" "}
                                                    {
                                                        item.lastName
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                                {/* DAY */}

                                <div className="form-group">

                                    <label>
                                        Day *
                                    </label>

                                    <select
                                        name="dayOfWeek"
                                        value={
                                            form.dayOfWeek
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    >

                                        <option value="">
                                            Select Day
                                        </option>

                                        {DAYS.map(
                                            (day) => (
                                                <option
                                                    key={day}
                                                    value={day}
                                                >
                                                    {formatDay(
                                                        day
                                                    )}
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                                {/* START TIME */}

                                <div className="form-group">

                                    <label>
                                        Start Time *
                                    </label>

                                    <input
                                        type="time"
                                        name="startTime"
                                        value={
                                            form.startTime
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>

                                {/* END TIME */}

                                <div className="form-group">

                                    <label>
                                        End Time *
                                    </label>

                                    <input
                                        type="time"
                                        name="endTime"
                                        value={
                                            form.endTime
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        required
                                    />

                                </div>

                                {/* ROOM */}

                                <div className="form-group">

                                    <label>
                                        Room Number
                                    </label>

                                    <input
                                        type="text"
                                        name="roomNumber"
                                        value={
                                            form.roomNumber
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="e.g. Room 101"
                                        maxLength="30"
                                    />

                                </div>

                            </div>

                            {error && (
                                <div className="modal-error">
                                    {error}
                                </div>
                            )}

                            <div className="modal-footer">

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        submitting
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={
                                        submitting
                                    }
                                >

                                    {submitting
                                        ? "Saving..."
                                        : editingId
                                            ? "Update Timetable"
                                            : "Save Timetable"}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Timetable;