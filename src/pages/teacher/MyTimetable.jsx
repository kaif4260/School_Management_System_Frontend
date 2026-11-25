import { useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import TeacherSidebar from "../../components/TeacherSidebar";
import api from "../../services/api";
import "./MyTimetable.css";

const DAYS = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
];

function getList(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.data)) return getList(data.data);
    return [];
}

function formatTime(time) {
    if (!time) return "--:--";

    const parts = String(time).split(":");
    const hour = Number(parts[0]);
    const minute = parts[1] || "00";

    if (Number.isNaN(hour)) return time;

    const suffix = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;

    return `${displayHour}:${minute} ${suffix}`;
}

function formatDay(day) {
    if (!day) return "Unspecified day";

    return String(day)
        .toLowerCase()
        .replace(/^\w/, (letter) => letter.toUpperCase());
}

function MyTimetable() {
    const [entries, setEntries] = useState([]);
    const [selectedDay, setSelectedDay] = useState("ALL");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadTimetable() {
        setLoading(true);
        setError("");

        try {
            const profileResponse = await api.get("/api/auth/me");
            const profile = profileResponse.data;

            if (profile.role !== "TEACHER") {
                throw new Error(
                    "This timetable is available to teacher accounts only."
                );
            }

            const teacherResponse = await api.get(
                `/api/teachers/email/${encodeURIComponent(profile.email)}`
            );

            const teacher = teacherResponse.data;

            const timetableResponse = await api.get(
                `/api/timetables/teacher/${teacher.id}`
            );

            setEntries(getList(timetableResponse.data));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    (typeof err.response?.data === "string"
                        ? err.response.data
                        : "") ||
                    err.message ||
                    "Unable to load your timetable."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadTimetable();
    }, []);

    const filteredEntries = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return entries
            .filter((entry) => {
                const day = String(entry.dayOfWeek || "").toUpperCase();

                const matchesDay =
                    selectedDay === "ALL" || day === selectedDay;

                const searchableText = [
                    entry.subjectName,
                    entry.className,
                    entry.sectionName,
                    entry.roomNumber,
                    entry.teacherName,
                    entry.dayOfWeek,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                return (
                    matchesDay &&
                    (!keyword || searchableText.includes(keyword))
                );
            })
            .sort((a, b) => {
                const dayDifference =
                    DAYS.indexOf(
                        String(a.dayOfWeek || "").toUpperCase()
                    ) -
                    DAYS.indexOf(
                        String(b.dayOfWeek || "").toUpperCase()
                    );

                if (
                    selectedDay === "ALL" &&
                    dayDifference !== 0
                ) {
                    return dayDifference;
                }

                return String(a.startTime || "").localeCompare(
                    String(b.startTime || "")
                );
            });
    }, [entries, selectedDay, search]);

    const activeDays = new Set(
        entries.map((entry) =>
            String(entry.dayOfWeek || "").toUpperCase()
        )
    );

    const uniqueSubjects = new Set(
        entries.map((entry) => entry.subjectName).filter(Boolean)
    );

    const uniqueClasses = new Set(
        entries
            .map(
                (entry) =>
                    `${entry.className || ""}-${entry.sectionName || ""}`
            )
            .filter((value) => value !== "-")
    );

    const groupedEntries = DAYS.filter((day) =>
        filteredEntries.some(
            (entry) =>
                String(entry.dayOfWeek || "").toUpperCase() === day
        )
    );

    return (
        <div className="teacher-page">
            <Navbar />

            <div className="teacher-content">
                <TeacherSidebar />

                <main className="my-timetable-main">
                    <header className="my-timetable-heading">
                        <div>
                            <span className="my-timetable-eyebrow">
                                TEACHER PORTAL
                            </span>

                            <h1>My Timetable</h1>

                            <p>
                                Keep track of your teaching schedule,
                                classroom, and daily lessons.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="my-timetable-refresh"
                            onClick={loadTimetable}
                            disabled={loading}
                        >
                            {loading ? "Loading..." : "↻ Refresh"}
                        </button>
                    </header>

                    <section className="my-timetable-stats">
                        <article className="my-timetable-stat-card">
                            <span>Total Periods</span>
                            <strong>{entries.length}</strong>
                            <small>Scheduled teaching periods</small>
                        </article>

                        <article className="my-timetable-stat-card">
                            <span>Subjects</span>
                            <strong>{uniqueSubjects.size}</strong>
                            <small>Unique assigned subjects</small>
                        </article>

                        <article className="my-timetable-stat-card">
                            <span>Classes & Sections</span>
                            <strong>{uniqueClasses.size}</strong>
                            <small>Unique teaching groups</small>
                        </article>

                        <article className="my-timetable-stat-card">
                            <span>Scheduled Days</span>
                            <strong>{activeDays.size}</strong>
                            <small>Days with timetable entries</small>
                        </article>
                    </section>

                    {error && (
                        <div className="my-timetable-error" role="alert">
                            <span>{error}</span>

                            <button
                                type="button"
                                onClick={loadTimetable}
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    <section className="my-timetable-panel">
                        <div className="my-timetable-panel-heading">
                            <div>
                                <h2>Weekly Schedule</h2>
                                <p>
                                    Select a day or search your schedule.
                                </p>
                            </div>

                            <span className="my-timetable-result-count">
                                {filteredEntries.length} periods
                            </span>
                        </div>

                        <div className="my-timetable-filters">
                            <input
                                type="search"
                                placeholder="Search subject, class, room..."
                                aria-label="Search timetable"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                            />

                            <select
                                aria-label="Filter timetable by day"
                                value={selectedDay}
                                onChange={(event) =>
                                    setSelectedDay(event.target.value)
                                }
                            >
                                <option value="ALL">All days</option>

                                {DAYS.map((day) => (
                                    <option key={day} value={day}>
                                        {formatDay(day)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {loading ? (
                            <div className="my-timetable-state">
                                Loading your timetable...
                            </div>
                        ) : filteredEntries.length === 0 ? (
                            <div className="my-timetable-state">
                                <div className="my-timetable-empty-icon">
                                    ▦
                                </div>

                                <h3>No timetable entries found</h3>

                                <p>
                                    {entries.length === 0
                                        ? "Your schedule will appear here once the administrator assigns timetable entries to you."
                                        : "Try another day or change your search."}
                                </p>
                            </div>
                        ) : (
                            <div className="my-timetable-schedule">
                                {groupedEntries.map((day) => {
                                    const dayEntries = filteredEntries.filter(
                                        (entry) =>
                                            String(
                                                entry.dayOfWeek || ""
                                            ).toUpperCase() === day
                                    );

                                    return (
                                        <section
                                            className="my-timetable-day"
                                            key={day}
                                        >
                                            <div className="my-timetable-day-heading">
                                                <div className="my-timetable-day-icon">
                                                    ▦
                                                </div>

                                                <div>
                                                    <h3>{formatDay(day)}</h3>
                                                    <span>
                                                        {dayEntries.length}{" "}
                                                        {dayEntries.length === 1
                                                            ? "period"
                                                            : "periods"}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="my-timetable-day-entries">
                                                {dayEntries.map((entry) => (
                                                    <article
                                                        className="my-timetable-entry"
                                                        key={entry.id}
                                                    >
                                                        <div className="my-timetable-time">
                                                            <strong>
                                                                {formatTime(
                                                                    entry.startTime
                                                                )}
                                                            </strong>

                                                            <span>
                                                                to{" "}
                                                                {formatTime(
                                                                    entry.endTime
                                                                )}
                                                            </span>
                                                        </div>

                                                        <div className="my-timetable-entry-details">
                                                            <span className="my-timetable-subject-label">
                                                                SUBJECT
                                                            </span>

                                                            <h4>
                                                                {entry.subjectName ||
                                                                    "Subject not specified"}
                                                            </h4>

                                                            <p>
                                                                {entry.className ||
                                                                    "Class not specified"}
                                                                {" · "}
                                                                {entry.sectionName ||
                                                                    "Section not specified"}
                                                            </p>
                                                        </div>

                                                        <div className="my-timetable-room">
                                                            <span>ROOM</span>
                                                            <strong>
                                                                {entry.roomNumber ||
                                                                    "Not assigned"}
                                                            </strong>
                                                        </div>
                                                    </article>
                                                ))}
                                            </div>
                                        </section>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}

export default MyTimetable;