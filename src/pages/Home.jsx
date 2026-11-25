import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublishedAnnouncements } from "../services/announcementService";
import api from "../services/api";
import "./home.css";

function Home() {
const [announcements, setAnnouncements] = useState([]);
const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
const [announcementError, setAnnouncementError] = useState("");
const [menuOpen, setMenuOpen] = useState(false);
const [showAbout, setShowAbout] = useState(false);

useEffect(() => {
    let isMounted = true;

    const loadAnnouncements = async () => {
        try {
            setLoadingAnnouncements(true);
            setAnnouncementError("");

            const data = await getPublishedAnnouncements();

            if (isMounted) {
                setAnnouncements(data || []);
            }
        } catch (error) {
            console.error("Failed to load announcements:", error);

            if (isMounted) {
                setAnnouncementError(
                    "Unable to load announcements right now. Please try again later."
                );
            }
        } finally {
            if (isMounted) {
                setLoadingAnnouncements(false);
            }
        }
    };

    loadAnnouncements();

    return () => {
        isMounted = false;
    };
}, []);

const formatDate = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return "";
    }

    return parsedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const getAttachmentHref = (attachmentUrl) => {
    if (!attachmentUrl) return "";

    if (/^https?:\/\//i.test(attachmentUrl)) {
        return attachmentUrl;
    }

    const baseUrl = (api.defaults.baseURL || "").replace(/\/+$/, "");
    const path = attachmentUrl.startsWith("/")
        ? attachmentUrl
        : `/${attachmentUrl}`;

    return `${baseUrl}${path}`;
};

const closeMenu = () => {
    setMenuOpen(false);
};

const hideAboutAndCloseMenu = () => {
    setShowAbout(false);
    setMenuOpen(false);
};

return (
    <div className="home-page">
        {/* Navbar */}
        <header className="home-navbar">
            <div className="home-logo">
                <div className="home-logo-icon">S</div>

                <div>
                    <h2>School Management System</h2>
                    <span>Learn • Grow • Succeed</span>
                </div>
            </div>

            <button
                type="button"
                className={`home-menu-toggle ${menuOpen ? "active" : ""}`}
                aria-label={
                    menuOpen ? "Close navigation menu" : "Open navigation menu"
                }
                aria-expanded={menuOpen}
                aria-controls="home-navigation-menu"
                onClick={() => setMenuOpen((previous) => !previous)}
            >
                <span></span>
                <span></span>
                <span></span>
            </button>

            <nav
                id="home-navigation-menu"
                className={`home-nav-links ${menuOpen ? "menu-open" : ""}`}
            >
                <a
                    href="#home"
                    onClick={(event) => {
                        event.preventDefault();
                        hideAboutAndCloseMenu();
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                >
                    Home
                </a>

                <a
                    href="#about"
                    onClick={(event) => {
                        event.preventDefault();
                        setShowAbout(true);
                        setMenuOpen(false);

                        setTimeout(() => {
                            document.getElementById("about")?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                            });
                        }, 100);
                    }}
                >
                    About
                </a>

                <a
                    href="#announcements"
                    onClick={hideAboutAndCloseMenu}
                >
                    Announcements
                </a>

                <a
                    href="#contact"
                    onClick={hideAboutAndCloseMenu}
                >
                    Contact
                </a>

                <div className="nav-auth">
                    <Link
                        to="/login"
                        className="nav-login"
                        onClick={hideAboutAndCloseMenu}
                    >
                        Login
                    </Link>

                    <Link
                        to="/register"
                        className="nav-register"
                        onClick={hideAboutAndCloseMenu}
                    >
                        Register
                    </Link>
                </div>
            </nav>
        </header>

        {/* Hero */}
        {/* Hero */}

        <section id="home" className="home-hero home-hero-compact">
            <div className="hero-content">
                    <span className="hero-badge">
                        Welcome to our school
                    </span>

            
                <h1>
                    Building Knowledge,
                    <br />
                    Character &amp; Future
                </h1>

                <p>
                    A modern learning environment where students,
                    teachers, and administrators work together to create
                    a better educational experience.
                </p>

                <div className="hero-buttons">
                    <Link to="/login" className="hero-primary-btn">
                        Student Login
                    </Link>

                    <a
                        href="#announcements"
                        className="hero-secondary-btn"
                    >
                        View Announcements
                    </a>
                </div>
            </div>

            {/* Announcement Window in Hero */}
            <div className="hero-announcement-window">
                <div className="announcement-ticker-header">
                    <span className="ticker-bell">📢</span>

                    <div>
                        <h3>Latest Announcements</h3>
                        <p>Stay updated with school notices</p>
                    </div>

                    <a
                        href="#announcements"
                        className="ticker-view-all"
                    >
                        View All →
                    </a>
                </div>

                {loadingAnnouncements && (
                    <div className="announcement-state">
                        <div className="home-spinner"></div>
                        <p>Loading announcements...</p>
                    </div>
                )}

                {!loadingAnnouncements && announcementError && (
                    <div className="announcement-state announcement-error">
                        <p>{announcementError}</p>
                    </div>
                )}

                {!loadingAnnouncements &&
                    !announcementError &&
                    announcements.length === 0 && (
                        <div className="announcement-state">
                            <span>📢</span>
                            <p>No announcements available yet.</p>
                        </div>
                    )}

                {!loadingAnnouncements &&
                    !announcementError &&
                    announcements.length > 0 && (
                        <div
                            className="announcement-ticker-window"
                            aria-label="Scrolling school announcements"
                        >
                            <div className="announcement-ticker-track">
                                {[0, 1].map((copyIndex) => (
                                    <div
                                        className="announcement-ticker-group"
                                        key={copyIndex}
                                        aria-hidden={copyIndex === 1}
                                    >
                                        {announcements.map((announcement) => (
                                            <article
                                                className="announcement-ticker-item"
                                                key={announcement.id}
                                            >
                                                <div className="ticker-item-dot" />

                                                <div className="ticker-item-content">
                                                    <a
                                                        href="#announcements"
                                                        className="ticker-item-title"
                                                        tabIndex={copyIndex === 1 ? -1 : 0}
                                                    >
                                                        {announcement.title}
                                                    </a>

                                                    <p>
                                                        {announcement.description}
                                                    </p>

                                                    <div className="ticker-item-meta">
                                                        <span>
                                                            {formatDate(
                                                                announcement.publishedAt ||
                                                                announcement.createdAt
                                                            )}
                                                        </span>

                                                        {announcement.attachmentUrl && (
                                                            <a
                                                                className="ticker-pdf-link"
                                                                href={getAttachmentHref(
                                                                    announcement.attachmentUrl
                                                                )}
                                                                download
                                                                tabIndex={copyIndex === 1 ? -1 : 0}
                                                            >
                                                                📥 Download PDF
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
            </div>

        </section>


            {/* <div className="hero-visual">
                <div className="hero-circle">
                    <span>🎓</span>
                </div>

                <div className="hero-floating-card hero-card-one">
                    <strong>Quality</strong>
                    <span>Education</span>
                </div>

                <div className="hero-floating-card hero-card-two">
                    <strong>Smart</strong>
                    <span>Management</span>
                </div>
            </div> */}
        {/* </section> */}

        {/* Quick Links */}
        <section className="quick-links-section">
            <div className="section-heading">
                <span>Quick Access</span>
                <h2>Everything You Need</h2>
                <p>
                    Quickly access important school information and services.
                </p>
            </div>

            <div className="quick-links-grid">
                <a href="#announcements" className="quick-link-card">
                    <div className="quick-link-icon">📢</div>
                    <div>
                        <h3>Announcements</h3>
                        <p>Latest school notices</p>
                    </div>
                </a>

                <Link to="/login" className="quick-link-card">
                    <div className="quick-link-icon">📊</div>
                    <div>
                        <h3>Results</h3>
                        <p>View academic results</p>
                    </div>
                </Link>

                <Link to="/login" className="quick-link-card">
                    <div className="quick-link-icon">📅</div>
                    <div>
                        <h3>Timetable</h3>
                        <p>Check class schedules</p>
                    </div>
                </Link>

                <Link to="/login" className="quick-link-card">
                    <div className="quick-link-icon">💳</div>
                    <div>
                        <h3>Fees</h3>
                        <p>Manage fee information</p>
                    </div>
                </Link>
            </div>
        </section>

        {/* Published Announcements */}
        <section
            id="announcements"
            className="announcements-section"
        >
            <div className="section-heading">
                <span>Stay Updated</span>
                <h2>Latest Announcements</h2>
                <p>
                    Important updates, admission notices, and documents
                    published by the school.
                </p>
            </div>

            {loadingAnnouncements && (
                <div className="announcement-state">
                    <div className="home-spinner"></div>
                    <p>Loading announcements...</p>
                </div>
            )}

            {!loadingAnnouncements && announcementError && (
                <div className="announcement-state announcement-error">
                    <span>⚠️</span>
                    <h3>Announcements Unavailable</h3>
                    <p>{announcementError}</p>
                </div>
            )}

            {!loadingAnnouncements &&
                !announcementError &&
                announcements.length === 0 && (
                    <div className="announcement-state">
                        <span>📢</span>
                        <h3>No Announcements Yet</h3>
                        <p>
                            There are no published school announcements
                            at the moment. Please check back later for
                            the latest updates and notices.
                        </p>
                    </div>
                )}

            {!loadingAnnouncements &&
                !announcementError &&
                announcements.length > 0 && (
                    <div className="announcements-grid">
                        {announcements.map((announcement) => (
                            <article
                                className="announcement-card"
                                key={announcement.id}
                            >
                                <div className="announcement-top">
                                    <span className="announcement-icon">
                                        📢
                                    </span>

                                    <span className="announcement-date">
                                        {formatDate(
                                            announcement.publishedAt ||
                                                announcement.createdAt
                                        )}
                                    </span>
                                </div>

                                <h3>{announcement.title}</h3>

                                <p className="announcement-description">
                                    {announcement.description}
                                </p>

                                {announcement.attachmentUrl && (
                                    <a
                                        className="announcement-attachment"
                                        href={getAttachmentHref(
                                            announcement.attachmentUrl
                                        )}
                                        download
                                    >
                                        📥 Download PDF
                                    </a>
                                )}

                                <div className="announcement-footer">
                                    <span>
                                        {announcement.targetAudience}
                                    </span>

                                    <span>Published</span>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
        </section>

        {/* About */}
        {showAbout && (
            <section id="about" className="about-section">
                <div className="about-content">
                    <span className="section-label">
                        About Our School
                    </span>

                    <h2>
                        Creating an environment where every student can grow.
                    </h2>

                    <p>
                        Our school is committed to providing students with a
                        supportive, disciplined, and engaging learning
                        environment. We believe education is not only about
                        academic achievement, but also about developing
                        confidence, responsibility, creativity, and character.
                    </p>

                    <p>
                        Through collaboration between students, teachers,
                        administrators, and families, we aim to create a
                        community where every learner receives the guidance
                        and opportunities needed to reach their potential.
                    </p>
                </div>

                <div className="about-highlights">
                    <div className="highlight-card">
                        <span>🎓</span>
                        <h3>Quality Education</h3>
                        <p>
                            Focused on strong academic foundations and
                            continuous learning.
                        </p>
                    </div>

                    <div className="highlight-card">
                        <span>👨‍🏫</span>
                        <h3>Dedicated Teachers</h3>
                        <p>
                            Supporting students through guidance,
                            mentorship, and knowledge.
                        </p>
                    </div>

                    <div className="highlight-card">
                        <span>🌱</span>
                        <h3>Student Growth</h3>
                        <p>
                            Encouraging confidence, creativity, and
                            responsible development.
                        </p>
                    </div>
                </div>
            </section>
        )}

        {/* Contact */}
        <section id="contact" className="contact-section">
            <div className="section-heading">
                <span>Get In Touch</span>
                <h2>Contact Our School</h2>
                <p>Have a question? We're here to help.</p>
            </div>

            <div className="contact-grid">
                <div className="contact-card">
                    <span>📍</span>
                    <h3>Address</h3>
                    <p>
                        School Address
                        <br />
                        Noida, UP, India
                    </p>
                </div>

                <div className="contact-card">
                    <span>📞</span>
                    <h3>Phone</h3>
                    <p>+91 XXXXX 12345</p>
                </div>

                <div className="contact-card">
                    <span>✉️</span>
                    <h3>Email</h3>
                    <p>newschool@example.com</p>
                </div>
            </div>
        </section>

        {/* Footer */}
        {/* Footer */}

        <footer className="home-footer">
            <div>
                <h3>School Management System</h3>
                <p>
                    Empowering education through better management
                    and connected learning.
                </p>
            </div>

            <div className="footer-links">
                <a
                    href="#home"
                    onClick={(event) => {
                        event.preventDefault();
                        hideAboutAndCloseMenu();

                        window.scrollTo({
                            top: 0,
                            behavior: "smooth",
                        });
                    }}
                >
                    Home
                </a>

                <a
                    href="#about"
                    onClick={(event) => {
                        event.preventDefault();
                        setShowAbout(true);
                        setMenuOpen(false);

                        setTimeout(() => {
                            document.getElementById("about")?.scrollIntoView({
                                behavior: "smooth",
                                block: "start",
                            });
                        }, 100);
                    }}
                >
                    About
                </a>

                <a
                    href="#announcements"
                    onClick={(event) => {
                        event.preventDefault();
                        hideAboutAndCloseMenu();

                        document.getElementById("announcements")?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                        });
                    }}
                >
                    Announcements
                </a>

                <a
                    href="#contact"
                    onClick={(event) => {
                        event.preventDefault();
                        hideAboutAndCloseMenu();

                        document.getElementById("contact")?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                        });
                    }}
                >
                    Contact
                </a>
            </div>

            <div className="footer-bottom">
                © {new Date().getFullYear()} School Management System.
                All rights reserved.
            </div>

        </footer>

    </div>
);

}

export default Home;
