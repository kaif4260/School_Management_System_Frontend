import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ChangePassword from "./pages/auth/ChangePassword";

import AdminDashboard from "./pages/admin/AdminDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import StudentDashboard from "./pages/student/StudentDashboard";
import Students from "./pages/admin/Students";
import Teachers from "./pages/admin/Teachers";
import Classes from "./pages/admin/Classes";
import Sections from "./pages/admin/Sections";
import Subjects from "./pages/admin/Subjects";
import Examinations from "./pages/admin/Examinations";
import Results from "./pages/admin/Results";
import Fees from "./pages/admin/Fees";
import Timetable from "./pages/admin/Timetable";
import TeachingAssignments from "./pages/admin/TeachingAssignments";
import MarksAssignment from "./pages/admin/MarksAssignment";
import ResultPublication from "./pages/admin/ResultPublication";
import StudentEnrollment from "./pages/admin/StudentEnrollment";
import ExaminationSubjectAssignment from "./pages/admin/ExaminationSubjectAssignment";
import MarksStatus from "./pages/admin/MarksStatus";
import Announcements from "./pages/admin/Announcements";

import MyClasses from "./pages/teacher/MyClasses";
import MySubjects from "./pages/teacher/MySubjects";
import MyTimetable from "./pages/teacher/MyTimetable";
import TeacherResults from "./pages/teacher/TeacherResults";
import TeacherAnnouncements from "./pages/teacher/TeacherAnnouncements";
import MyStudents from "./pages/teacher/MyStudents";

import StudentProfile from "./pages/student/StudentProfile";
import StudentResults from "./pages/student/StudentResults";


import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />

                {/* Login */}
                <Route path="/login" element={<Login />} />

                {/* Admin */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/students"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <Students />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/teachers"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <Teachers />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/classes"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <Classes />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/sections"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <Sections />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/subjects"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <Subjects />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/teaching-assignments"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <TeachingAssignments />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/examinations"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <Examinations />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/results"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <Results />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/fees"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <Fees />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/timetable"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <Timetable />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/marks"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <MarksAssignment />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/result-publication"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <ResultPublication />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/student-enrollment"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <StudentEnrollment />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/examination-subject-assignment"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <ExaminationSubjectAssignment />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/marks-status"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <MarksStatus />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/announcements"
                    element={
                        <ProtectedRoute allowedRole="ADMIN">
                            <Announcements />
                        </ProtectedRoute>
                    }
                />

                {/* Teacher */}
                <Route
                    path="/teacher/dashboard"
                    element={
                        <ProtectedRoute allowedRole="TEACHER">
                            <TeacherDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/teacher/classes"
                    element={
                        <ProtectedRoute allowedRole="TEACHER">
                            <MyClasses />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/teacher/subjects"
                    element={
                        <ProtectedRoute allowedRole="TEACHER">
                            <MySubjects />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/teacher/timetable"
                    element={
                        <ProtectedRoute allowedRole="TEACHER">
                            <MyTimetable />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/teacher/results"
                    element={
                        <ProtectedRoute allowedRole="TEACHER">
                        <TeacherResults />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/teacher/announcements"
                    element={
                        <ProtectedRoute allowedRole="TEACHER">
                            <TeacherAnnouncements />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/teacher/students"
                    element={
                        <ProtectedRoute allowedRole="TEACHER">
                            <MyStudents />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/teacher/marks"
                    element={
                        <ProtectedRoute allowedRole="TEACHER">
                            <MarksAssignment />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/teacher/marks-status"
                    element={
                        <ProtectedRoute allowedRole="TEACHER">
                            <MarksStatus />
                        </ProtectedRoute>
                    }
                />

                {/* Student */}
                <Route
                    path="/student/dashboard"
                    element={
                        <ProtectedRoute allowedRole="STUDENT">
                            <StudentDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student/profile"
                    element={
                        <ProtectedRoute allowedRole="STUDENT">
                            <StudentProfile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/student/results"
                    element={
                        <ProtectedRoute allowedRole="STUDENT">
                            <StudentResults />
                        </ProtectedRoute>
                    }
                />

                {/* Change Password - ADMIN, TEACHER, STUDENT */}
                <Route
                    path="/change-password"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN", "TEACHER", "STUDENT"]}>
                            <ChangePassword />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;