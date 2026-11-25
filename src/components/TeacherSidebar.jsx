import { Link, useLocation } from "react-router-dom";

function TeacherSidebar() {
const location = useLocation();

const links = [
    { label: "Dashboard", path: "/teacher/dashboard" },
    { label: "My Students", path: "/teacher/students" },
    { label: "My Classes", path: "/teacher/classes" },
    { label: "My Subjects", path: "/teacher/subjects" },
    { label: "My Timetable", path: "/teacher/timetable" },
    { label: "Marks Assignment", path: "/teacher/marks" },
    { label: "Marks Status", path: "/teacher/marks-status" },
    { label: "Results", path: "/teacher/results" },
    { label: "Announcements", path: "/teacher/announcements" },
    { label: "Change Password", path: "/change-password" }
];

return (
    <aside className="sidebar teacher-sidebar">
        <h3>Teacher Panel</h3>

        <nav>
            {links.map((link) => (
                <Link
                    key={link.path}
                    to={link.path}
                    className={
                        location.pathname === link.path
                            ? "active"
                            : ""
                    }
                >
                    {link.label}
                </Link>
            ))}
        </nav>
    </aside>
);


}

export default TeacherSidebar;
