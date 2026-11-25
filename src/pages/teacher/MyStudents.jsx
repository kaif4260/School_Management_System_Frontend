
import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import Navbar from "../../components/Navbar";
import TeacherSidebar from "../../components/TeacherSidebar";
import "./MyStudents.css";

const initialForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  phone: "",
  address: "",
};

function getStudentList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.students)) return data.students;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

export default function MyStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadStudents = useCallback(async (keyword = "") => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("api/students/search", {
        params: {
          keyword: keyword.trim(),
          page: 0,
          size: 10,
        },
      });

      setStudents(getStudentList(response.data));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load students. Please check your login and backend."
      );
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSearch(event) {
    event.preventDefault();
    setSuccess("");
    await loadStudents(search);
  }

  async function handleCreateStudent(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.phone && !/^[0-9+\-\s()]{7,20}$/.test(form.phone)) {
      setError("Please enter a valid phone number.");
      return;
    }

    setSaving(true);

    try {
      await api.post("api/students", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim(),
        address: form.address.trim(),
      });

      setSuccess("Student created successfully.");
      setForm(initialForm);
      setShowPassword(false);
      setShowForm(false);
      setSearch("");
      await loadStudents();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Could not create the student. Please try again.";

      setError(
        err.response?.status === 403
          ? "You do not have permission to create students. Check your teacher login and backend security rules."
          : message
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="teacher-students-page">
      <Navbar />

      <div className="teacher-students-layout">
        <TeacherSidebar />

        <main className="teacher-students-main">
          <div className="teacher-students-heading">
            <div>
              <p className="teacher-students-eyebrow">TEACHER PORTAL</p>
              <h1>My Students</h1>
              <p className="teacher-students-subtitle">
                Create student accounts and view student details.
              </p>
            </div>

            <button
              type="button"
              className="student-primary-btn"
              onClick={() => {
                setShowForm((current) => !current);
                setError("");
                setSuccess("");
              }}
            >
              {showForm ? "Cancel" : "+ Add Student"}
            </button>
          </div>

          {success && (
            <div className="student-alert student-alert-success" role="status">
              {success}
            </div>
          )}

          {error && (
            <div className="student-alert student-alert-error" role="alert">
              {error}
            </div>
          )}

          {showForm && (
            <section className="student-panel student-create-panel">
              <div className="student-panel-heading">
                <div>
                  <h2>Create Student Account</h2>
                  <p>Enter the student's details below.</p>
                </div>
              </div>

              <form onSubmit={handleCreateStudent}>
                <div className="student-form-grid">
                  <div className="student-field">
                    <label htmlFor="firstName">First name *</label>
                    <input
                      id="firstName"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      required
                      maxLength={80}
                      autoComplete="given-name"
                    />
                  </div>

                  <div className="student-field">
                    <label htmlFor="lastName">Last name *</label>
                    <input
                      id="lastName"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      required
                      maxLength={80}
                      autoComplete="family-name"
                    />
                  </div>

                  <div className="student-field">
                    <label htmlFor="email">Email address *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="student@example.com"
                      required
                      maxLength={150}
                      autoComplete="email"
                    />
                  </div>

                  <div className="student-field">
                    <label htmlFor="password">Initial password *</label>
                    <div className="student-password-wrap">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Create an initial password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        className="student-password-toggle"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div className="student-field">
                    <label htmlFor="phone">Phone number</label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      maxLength={20}
                      autoComplete="tel"
                    />
                  </div>

                  <div className="student-field">
                    <label htmlFor="address">Address</label>
                    <input
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Enter address"
                      maxLength={250}
                      autoComplete="street-address"
                    />
                  </div>
                </div>

                <div className="student-form-actions">
                  <button
                    type="button"
                    className="student-secondary-btn"
                    onClick={() => {
                      setShowForm(false);
                      setForm(initialForm);
                      setShowPassword(false);
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="student-primary-btn"
                    disabled={saving}
                  >
                    {saving ? "Creating..." : "Create Student"}
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="student-panel">
            <div className="student-panel-heading student-list-heading">
              <div>
                <h2>Student Directory</h2>
                <p>Search students by name using the student search API.</p>
              </div>

              <span className="student-count">
                {students.length} {students.length === 1 ? "student" : "students"}
              </span>
            </div>

            <form className="student-search-form" onSubmit={handleSearch}>
              <div className="student-search-input-wrap">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by student name..."
                  aria-label="Search students by name"
                />
              </div>

              <button
                type="submit"
                className="student-secondary-btn"
                disabled={loading}
              >
                Search
              </button>

              <button
                type="button"
                className="student-text-btn"
                onClick={() => {
                  setSearch("");
                  loadStudents();
                }}
              >
                Clear
              </button>
            </form>

            {loading ? (
              <div className="student-state">Loading students...</div>
            ) : students.length === 0 ? (
              <div className="student-state">
                <div className="student-empty-icon">◎</div>
                <h3>No students found</h3>
                <p>
                  {search
                    ? "Try another search term."
                    : "Create a student account to get started."}
                </p>
              </div>
            ) : (
              <div className="student-table-wrap">
                <table className="student-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => {
                      const fullName =
                        [student.firstName, student.lastName]
                          .filter(Boolean)
                          .join(" ") || "Unnamed student";

                      return (
                        <tr key={student.id ?? student.email ?? index}>
                          <td>
                            <div className="student-name-cell">
                              <span className="student-avatar">
                                {fullName.charAt(0).toUpperCase()}
                              </span>
                              <div>
                                <strong>{fullName}</strong>
                                {student.id != null && (
                                  <small>Student ID: {student.id}</small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>{student.email || "—"}</td>
                          <td>{student.phone || "—"}</td>
                          <td>{student.address || "—"}</td>
                        </tr>
                      );
                    })}
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