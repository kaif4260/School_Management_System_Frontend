import { useCallback, useEffect, useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import TeacherSidebar from "../../components/TeacherSidebar";
import api from "../../services/api";
import "./TeacherAnnouncements.css";

function getTitle(item) {
  return item.title ?? "Untitled announcement";
}

function getMessage(item) {
  return item.description ?? "";
}

function getAudience(item) {
  return item.targetAudience ?? "ALL";
}

function getDate(item) {
  return item.publishedAt ?? item.createdAt ?? null;
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function TeacherAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [teachersResponse, allResponse] = await Promise.all([
        api.get(
          "/api/announcements/published/audience/TEACHERS"
        ),
        api.get(
          "/api/announcements/published/audience/ALL"
        ),
      ]);

      const teacherAnnouncements = Array.isArray(teachersResponse.data)
        ? teachersResponse.data
        : [];

      const allAnnouncements = Array.isArray(allResponse.data)
        ? allResponse.data
        : [];

      // Merge both audiences and avoid duplicate announcements.
      const uniqueAnnouncements = new Map();

      [...allAnnouncements, ...teacherAnnouncements].forEach(
        (item, index) => {
          const key = item.id ?? `${getTitle(item)}-${index}`;
          uniqueAnnouncements.set(key, item);
        }
      );

      setAnnouncements([...uniqueAnnouncements.values()]);
    } catch (err) {
      console.error("Failed to load announcements:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load announcements. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const audiences = useMemo(
    () => ["ALL", "TEACHERS"],
    []
  );

  const filteredAnnouncements = useMemo(() => {
    const term = search.trim().toLowerCase();

    return announcements
      .filter((item) => {
        const searchableText = [
          getTitle(item),
          getMessage(item),
          getAudience(item),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !term || searchableText.includes(term);

        const matchesAudience =
          audienceFilter === "ALL" ||
          getAudience(item).toUpperCase() ===
            audienceFilter.toUpperCase();

        return matchesSearch && matchesAudience;
      })
      .sort((a, b) => {
        const dateA = new Date(getDate(a) || 0).getTime();
        const dateB = new Date(getDate(b) || 0).getTime();

        return dateB - dateA;
      });
  }, [announcements, search, audienceFilter]);

  return (
    <div className="teacher-announcements-page">
      <Navbar />

      <div className="teacher-announcements-layout">
        <TeacherSidebar />

        <main className="teacher-announcements-main">
          <section className="teacher-announcements-header">
            <div>
              <span className="teacher-announcements-eyebrow">
                TEACHER PORTAL
              </span>

              <h1>Announcements</h1>

              <p>
                Stay updated with school notices, important dates,
                and announcements.
              </p>
            </div>

            <button
              type="button"
              className="teacher-announcements-refresh"
              onClick={fetchAnnouncements}
              disabled={loading}
            >
              <span aria-hidden="true">↻</span>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </section>

          <section className="teacher-announcements-stats">
            <div className="teacher-announcements-stat-card">
              <div className="teacher-announcements-stat-icon">
                📢
              </div>

              <div>
                <span>Total published</span>
                <strong>{announcements.length}</strong>
              </div>
            </div>

            <div className="teacher-announcements-stat-card">
              <div className="teacher-announcements-stat-icon">
                🔎
              </div>

              <div>
                <span>Matching results</span>
                <strong>{filteredAnnouncements.length}</strong>
              </div>
            </div>
          </section>

          <section className="teacher-announcements-content">
            <div className="teacher-announcements-toolbar">
              <div className="teacher-announcements-search">
                <span aria-hidden="true">⌕</span>

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search announcements..."
                  aria-label="Search announcements"
                />
              </div>

              <select
                value={audienceFilter}
                onChange={(event) =>
                  setAudienceFilter(event.target.value)
                }
                aria-label="Filter by audience"
              >
                <option value="ALL">All relevant announcements</option>

                {audiences.map((audience) => (
                  <option key={audience} value={audience}>
                    {audience === "ALL"
                      ? "School-wide"
                      : "Teachers"}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div
                className="teacher-announcements-error"
                role="alert"
              >
                <div>
                  <strong>Couldn't load announcements</strong>
                  <p>{error}</p>
                </div>

                <button
                  type="button"
                  onClick={fetchAnnouncements}
                >
                  Try again
                </button>
              </div>
            )}

            {loading ? (
              <div className="teacher-announcements-state">
                <div className="teacher-announcements-spinner" />
                <p>Loading announcements...</p>
              </div>
            ) : !error && filteredAnnouncements.length === 0 ? (
              <div className="teacher-announcements-state">
                <div className="teacher-announcements-empty-icon">
                  📭
                </div>

                <h3>
                  {announcements.length === 0
                    ? "No published announcements"
                    : "No announcements found"}
                </h3>

                <p>
                  {announcements.length === 0
                    ? "Published school announcements will appear here."
                    : "Try changing your search or audience filter."}
                </p>

                {(search || audienceFilter !== "ALL") && (
                  <button
                    type="button"
                    className="teacher-announcements-clear"
                    onClick={() => {
                      setSearch("");
                      setAudienceFilter("ALL");
                    }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              !error && (
                <div className="teacher-announcements-list">
                  {filteredAnnouncements.map((item, index) => (
                    <article
                      className="teacher-announcement-card"
                      key={item.id ?? `${getTitle(item)}-${index}`}
                    >
                      <div className="teacher-announcement-card-top">
                        <div className="teacher-announcement-icon">
                          📣
                        </div>

                        <div className="teacher-announcement-heading">
                          <h2>{getTitle(item)}</h2>

                          <div className="teacher-announcement-meta">
                            <span>
                              <span aria-hidden="true">◷</span>{" "}
                              {formatDate(getDate(item))}
                            </span>
                          </div>
                        </div>

                        <span className="teacher-announcement-audience">
                          {getAudience(item) === "ALL"
                            ? "School-wide"
                            : "Teachers"}
                        </span>
                      </div>

                      {getMessage(item) ? (
                        <p className="teacher-announcement-message">
                          {getMessage(item)}
                        </p>
                      ) : (
                        <p className="teacher-announcement-message teacher-announcement-no-message">
                          No additional details provided.
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default TeacherAnnouncements;