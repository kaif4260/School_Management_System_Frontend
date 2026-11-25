import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import StudentSidebar from "../../components/StudentSidebar";
import "./StudentDashboard.css";

const StudentDashboard = () => {
const features = [
{
title: "My Profile",
description: "View your personal and academic information.",
icon: "♙",
path: "/student/profile",
className: "student-card-blue",
},
{
title: "My Results",
description: "View your published examination results.",
icon: "▤",
path: "/student/results",
className: "student-card-purple",
},
{
title: "My Fees",
description: "Review your fees and payment information.",
icon: "₹",
path: "/student/fees",
className: "student-card-green",
},
{
title: "Announcements",
description: "Stay informed about school updates.",
icon: "♢",
path: "/student/announcements",
className: "student-card-orange",
},
];

return (
    <div className="student-page">
        <Navbar />

        <div className="student-layout">
            <StudentSidebar />

            <main className="student-main">
                <section className="student-welcome">
                    <div>
                        <span className="student-eyebrow">
                            STUDENT PORTAL
                        </span>

                        <h1>Welcome to Your Dashboard</h1>

                        <p>
                            Access your academic information, published
                            results, fee details, and school announcements.
                        </p>
                    </div>

                    <div className="student-welcome-icon" aria-hidden="true">
                        🎓
                    </div>
                </section>

                <section className="student-section">
                    <div className="student-section-heading">
                        <div>
                            <h2>Your Portal</h2>
                            <p>Choose a section to get started.</p>
                        </div>
                    </div>

                    <div className="student-feature-grid">
                        {features.map((feature) => (
                            <Link
                                to={feature.path}
                                className="student-feature-card"
                                key={feature.path}
                            >
                                <div
                                    className={`student-feature-icon ${feature.className}`}
                                >
                                    {feature.icon}
                                </div>

                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>

                                <span className="student-feature-action">
                                    Open section <span>→</span>
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="student-info-panel">
                    <div className="student-info-icon">ℹ</div>
                    <div>
                        <h3>Your academic information</h3>
                        <p>
                            Examination results will be available here
                            after they have been published by the school
                            administrator.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    </div>
);

};

export default StudentDashboard;