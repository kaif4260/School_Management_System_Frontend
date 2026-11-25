import { NavLink, useNavigate } from "react-router-dom";
import "./StudentSidebar.css";

const StudentSidebar = () => {
const navigate = useNavigate();

const links = [
    { label: "Dashboard", path: "/student/dashboard", icon: "▦", end: true },
    { label: "My Profile", path: "/student/profile", icon: "♙" },
    { label: "My Results", path: "/student/results", icon: "▤" },
    { label: "My Fees", path: "/student/fees", icon: "₹" },
    { label: "Announcements", path: "/student/announcements", icon: "♢" },
    { label: "Change Password", path: "/change-password", icon: "⚙" }
];

const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
};

return (
    <aside className="student-sidebar">
        <div className="student-sidebar-brand">
            <div className="student-sidebar-logo">S</div>
            <div>
                <h2>Student Portal</h2>
                <p>School Management</p>
            </div>
        </div>

        <div className="student-sidebar-section-label">
            STUDENT MENU
        </div>

        <nav className="student-sidebar-nav">
            {links.map((link) => (
                <NavLink
                    key={link.path}
                    to={link.path}
                    end={link.end}
                    className={({ isActive }) =>
                        `student-sidebar-link${isActive ? " active" : ""}`
                    }
                >
                    <span className="student-sidebar-icon">{link.icon}</span>
                    <span>{link.label}</span>
                </NavLink>
            ))}
        </nav>

        <div className="student-sidebar-bottom">
            <div className="student-sidebar-help">
                <strong>Student Portal</strong>
                <p>Access your academic information in one place.</p>
            </div>

            <button
                type="button"
                className="student-sidebar-logout"
                onClick={handleLogout}
            >
                <span className="student-sidebar-icon">↪</span>
                Logout
            </button>
        </div>
    </aside>
);

};

export default StudentSidebar;