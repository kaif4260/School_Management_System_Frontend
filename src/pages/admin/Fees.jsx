import { useEffect, useMemo, useState } from "react";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

import {
    getFeeAssignments,
    getFeePayments,
    createFeeAssignment,
    createFeePayment,
    getFeeSummary,
} from "../../services/feeService";

import {
    getAllEnrollments,
    getAllStudents,
} from "../../services/resultService";

import "./fees.css";

const FEE_TYPES = [
    "TUITION",
    "ADMISSION",
    "EXAMINATION",
    "TRANSPORT",
    "LIBRARY",
    "SPORTS",
    "OTHER",
];

const PAYMENT_METHODS = [
    "CASH",
    "UPI",
    "CARD",
    "BANK_TRANSFER",
    "CHEQUE",
];

const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const formatLabel = (value) => {
    if (!value) return "-";

    return value
        .replaceAll("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const getStatusClass = (status) => {
    switch (status) {
        case "PAID":
            return "fee-status paid";

        case "PARTIAL":
            return "fee-status partial";

        case "PENDING":
            return "fee-status pending";

        default:
            return "fee-status";
    }
};

function Fees() {
    const [assignments, setAssignments] = useState([]);
    const [payments, setPayments] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [feeTypeFilter, setFeeTypeFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    const [activeModal, setActiveModal] = useState(null);

    const [assignmentForm, setAssignmentForm] = useState({
        enrollmentId: "",
        feeType: "TUITION",
        amount: "",
        dueDate: "",
        description: "",
    });

    const [paymentForm, setPaymentForm] = useState({
        feeAssignmentId: "",
        amountPaid: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "CASH",
        transactionReference: "",
        remarks: "",
    });

    const [selectedSummary, setSelectedSummary] = useState(null);

    useEffect(() => {
        loadFees();
    }, []);

    const loadFees = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                assignmentData,
                paymentData,
                enrollmentData,
                studentData,
            ] = await Promise.all([
                getFeeAssignments(),
                getFeePayments(),
                getAllEnrollments(),
                getAllStudents(),
            ]);

            setAssignments(assignmentData || []);
            setPayments(paymentData || []);
            setEnrollments(enrollmentData || []);
            setStudents(studentData || []);
        } catch (err) {
            console.error("Failed to load fee data:", err);

            setError(
                err?.response?.data?.message ||
                    "Failed to load fee information."
            );
        } finally {
            setLoading(false);
        }
    };

    const filteredAssignments = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return assignments.filter((fee) => {
            const matchesSearch =
                !keyword ||
                fee.studentName?.toLowerCase().includes(keyword) ||
                fee.className?.toLowerCase().includes(keyword) ||
                fee.sectionName?.toLowerCase().includes(keyword) ||
                fee.academicYear?.toLowerCase().includes(keyword) ||
                fee.description?.toLowerCase().includes(keyword);

            const matchesType =
                !feeTypeFilter ||
                fee.feeType === feeTypeFilter;

            return matchesSearch && matchesType;
        });
    }, [assignments, search, feeTypeFilter]);

    const filteredPayments = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return payments.filter((payment) => {
            const matchesSearch =
                !keyword ||
                payment.studentName
                    ?.toLowerCase()
                    .includes(keyword) ||
                payment.academicYear
                    ?.toLowerCase()
                    .includes(keyword) ||
                payment.transactionReference
                    ?.toLowerCase()
                    .includes(keyword);

            const matchesStatus =
                !statusFilter ||
                payment.feeStatus === statusFilter;

            const matchesType =
                !feeTypeFilter ||
                payment.feeType === feeTypeFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesType
            );
        });
    }, [
        payments,
        search,
        statusFilter,
        feeTypeFilter,
    ]);

    const totals = useMemo(() => {
        const assigned = assignments.reduce(
            (sum, fee) => sum + Number(fee.amount || 0),
            0
        );

        const paid = payments.reduce(
            (sum, payment) =>
                sum + Number(payment.amountPaid || 0),
            0
        );

        return {
            assigned,
            paid,
            pending: Math.max(assigned - paid, 0),
        };
    }, [assignments, payments]);

    const handleAssignmentChange = (e) => {
        const { name, value } = e.target;

        setAssignmentForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handlePaymentChange = (e) => {
        const { name, value } = e.target;

        setPaymentForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            setError("");

            await createFeeAssignment({
                enrollmentId: Number(
                    assignmentForm.enrollmentId
                ),
                feeType: assignmentForm.feeType,
                amount: Number(assignmentForm.amount),
                dueDate: assignmentForm.dueDate,
                description:
                    assignmentForm.description.trim(),
            });

            setActiveModal(null);

            setAssignmentForm({
                enrollmentId: "",
                feeType: "TUITION",
                amount: "",
                dueDate: "",
                description: "",
            });

            await loadFees();
        } catch (err) {
            console.error(
                "Failed to create fee assignment:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Failed to create fee assignment."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleCreatePayment = async (e) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            setError("");

            await createFeePayment({
                feeAssignmentId: Number(
                    paymentForm.feeAssignmentId
                ),
                amountPaid: Number(
                    paymentForm.amountPaid
                ),
                paymentDate: paymentForm.paymentDate,
                paymentMethod:
                    paymentForm.paymentMethod,
                transactionReference:
                    paymentForm.transactionReference.trim(),
                remarks:
                    paymentForm.remarks.trim(),
            });

            setActiveModal(null);

            setPaymentForm({
                feeAssignmentId: "",
                amountPaid: "",
                paymentDate: new Date()
                    .toISOString()
                    .split("T")[0],
                paymentMethod: "CASH",
                transactionReference: "",
                remarks: "",
            });

            await loadFees();
        } catch (err) {
            console.error(
                "Failed to record payment:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Failed to record payment."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewSummary = async (enrollmentId) => {
        try {
            setError("");

            const summary =
                await getFeeSummary(enrollmentId);

            setSelectedSummary(summary);
            setActiveModal("summary");
        } catch (err) {
            console.error(
                "Failed to load fee summary:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Failed to load fee summary."
            );
        }
    };

    const getEnrollmentLabel = (enrollment) => {
        const student = students.find(
            (item) =>
                item.id === enrollment.studentId
        );

        const studentName = student
            ? `${student.firstName} ${student.lastName}`
            : `Student #${enrollment.studentId}`;

        return `${studentName} • Class ${enrollment.classId} • Section ${enrollment.sectionId} • ${enrollment.academicYear}`;
    };

    return (
        <div className="admin-page">

            {/* NAVBAR */}
            <Navbar />

            <div className="admin-content">

                {/* SIDEBAR */}
                <Sidebar />

                {/* MAIN CONTENT */}
                <main className="fees-main">

                    {loading ? (
                        <div className="fees-loading">
                            <div className="fees-spinner"></div>
                            <p>
                                Loading fee information...
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* PAGE HEADER */}
                            <div className="fees-header">

                                <div>
                                    <h1>
                                        Fees Management
                                    </h1>

                                    <p>
                                        Manage fee
                                        assignments,
                                        payments and
                                        student fee
                                        summaries.
                                    </p>
                                </div>

                                <div className="fees-header-actions">

                                    <button
                                        className="fees-primary-btn"
                                        onClick={() =>
                                            setActiveModal(
                                                "assignment"
                                            )
                                        }
                                    >
                                        <span>＋</span>
                                        Assign Fee
                                    </button>

                                    <button
                                        className="fees-secondary-btn"
                                        onClick={() =>
                                            setActiveModal(
                                                "payment"
                                            )
                                        }
                                    >
                                        <span>＋</span>
                                        Record Payment
                                    </button>

                                </div>

                            </div>

                            {/* ERROR */}
                            {error && (
                                <div className="fees-error">

                                    <span>!</span>

                                    <p>{error}</p>

                                    <button
                                        onClick={() =>
                                            setError("")
                                        }
                                    >
                                        ×
                                    </button>

                                </div>
                            )}

                            {/* SUMMARY CARDS */}
                            <div className="fees-summary-grid">

                                <div className="fee-summary-card">
                                    <div className="fee-summary-icon assigned">
                                        ₹
                                    </div>

                                    <div>
                                        <p>
                                            Total Assigned
                                        </p>

                                        <h2>
                                            {formatCurrency(
                                                totals.assigned
                                            )}
                                        </h2>
                                    </div>
                                </div>

                                <div className="fee-summary-card">
                                    <div className="fee-summary-icon paid">
                                        ✓
                                    </div>

                                    <div>
                                        <p>
                                            Total Paid
                                        </p>

                                        <h2>
                                            {formatCurrency(
                                                totals.paid
                                            )}
                                        </h2>
                                    </div>
                                </div>

                                <div className="fee-summary-card">
                                    <div className="fee-summary-icon pending">
                                        !
                                    </div>

                                    <div>
                                        <p>
                                            Total Pending
                                        </p>

                                        <h2>
                                            {formatCurrency(
                                                totals.pending
                                            )}
                                        </h2>
                                    </div>
                                </div>

                                <div className="fee-summary-card">
                                    <div className="fee-summary-icon records">
                                        #
                                    </div>

                                    <div>
                                        <p>
                                            Fee Assignments
                                        </p>

                                        <h2>
                                            {assignments.length}
                                        </h2>
                                    </div>
                                </div>

                            </div>

                            {/* TOOLBAR */}
                            <div className="fees-toolbar">

                                <div className="fees-search">

                                    <span>⌕</span>

                                    <input
                                        type="text"
                                        placeholder="Search student, class, year..."
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(
                                                e.target.value
                                            )
                                        }
                                    />

                                </div>

                                <select
                                    value={
                                        feeTypeFilter
                                    }
                                    onChange={(e) =>
                                        setFeeTypeFilter(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        All Fee Types
                                    </option>

                                    {FEE_TYPES.map(
                                        (type) => (
                                            <option
                                                key={type}
                                                value={type}
                                            >
                                                {formatLabel(
                                                    type
                                                )}
                                            </option>
                                        )
                                    )}
                                </select>

                                <select
                                    value={statusFilter}
                                    onChange={(e) =>
                                        setStatusFilter(
                                            e.target.value
                                        )
                                    }
                                >
                                    <option value="">
                                        All Statuses
                                    </option>

                                    <option value="PENDING">
                                        Pending
                                    </option>

                                    <option value="PARTIAL">
                                        Partial
                                    </option>

                                    <option value="PAID">
                                        Paid
                                    </option>
                                </select>

                            </div>

                            {/* FEE ASSIGNMENTS */}
                            <section className="fees-section">

                                <div className="fees-section-header">

                                    <div>
                                        <h2>
                                            Fee Assignments
                                        </h2>

                                        <p>
                                            Fees assigned to
                                            enrolled students.
                                        </p>
                                    </div>

                                    <span className="fees-count">
                                        {
                                            filteredAssignments.length
                                        }{" "}
                                        records
                                    </span>

                                </div>

                                {filteredAssignments.length ===
                                0 ? (
                                    <div className="fees-empty">

                                        <div>₹</div>

                                        <h3>
                                            No fee
                                            assignments found
                                        </h3>

                                        <p>
                                            Try changing your
                                            search or filters,
                                            or assign a new
                                            fee.
                                        </p>

                                    </div>
                                ) : (
                                    <div className="fees-table-wrapper">

                                        <table className="fees-table">

                                            <thead>
                                                <tr>
                                                    <th>
                                                        Student
                                                    </th>
                                                    <th>
                                                        Class /
                                                        Section
                                                    </th>
                                                    <th>
                                                        Academic
                                                        Year
                                                    </th>
                                                    <th>
                                                        Fee Type
                                                    </th>
                                                    <th>
                                                        Amount
                                                    </th>
                                                    <th>
                                                        Due Date
                                                    </th>
                                                    <th>
                                                        Description
                                                    </th>
                                                    <th>
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {filteredAssignments.map(
                                                    (fee) => (
                                                        <tr
                                                            key={
                                                                fee.id
                                                            }
                                                        >

                                                            <td>
                                                                <div className="student-cell">

                                                                    <div className="student-avatar">
                                                                        {fee.studentName
                                                                            ?.charAt(
                                                                                0
                                                                            )
                                                                            ?.toUpperCase() ||
                                                                            "S"}
                                                                    </div>

                                                                    <div>
                                                                        <strong>
                                                                            {
                                                                                fee.studentName
                                                                            }
                                                                        </strong>

                                                                        <span>
                                                                            Student #
                                                                            {
                                                                                fee.studentId
                                                                            }
                                                                        </span>
                                                                    </div>

                                                                </div>
                                                            </td>

                                                            <td>
                                                                <strong>
                                                                    {fee.className ||
                                                                        `Class #${fee.classId}`}
                                                                </strong>

                                                                <span className="table-subtext">
                                                                    {fee.sectionName ||
                                                                        `Section #${fee.sectionId}`}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                {
                                                                    fee.academicYear
                                                                }
                                                            </td>

                                                            <td>
                                                                <span className="fee-type-badge">
                                                                    {formatLabel(
                                                                        fee.feeType
                                                                    )}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <strong>
                                                                    {formatCurrency(
                                                                        fee.amount
                                                                    )}
                                                                </strong>
                                                            </td>

                                                            <td>
                                                                {formatDate(
                                                                    fee.dueDate
                                                                )}
                                                            </td>

                                                            <td>
                                                                <span className="description-cell">
                                                                    {fee.description ||
                                                                        "-"}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                <div className="table-actions">

                                                                    <button
                                                                        className="view-btn"
                                                                        onClick={() =>
                                                                            handleViewSummary(
                                                                                fee.enrollmentId
                                                                            )
                                                                        }
                                                                    >
                                                                        View
                                                                    </button>

                                                                    <button
                                                                        className="pay-btn"
                                                                        onClick={() => {
                                                                            setPaymentForm(
                                                                                (
                                                                                    previous
                                                                                ) => ({
                                                                                    ...previous,
                                                                                    feeAssignmentId:
                                                                                        fee.id,
                                                                                })
                                                                            );

                                                                            setActiveModal(
                                                                                "payment"
                                                                            );
                                                                        }}
                                                                    >
                                                                        Pay
                                                                    </button>

                                                                </div>
                                                            </td>

                                                        </tr>
                                                    )
                                                )}
                                            </tbody>

                                        </table>

                                    </div>
                                )}

                            </section>

                            {/* PAYMENT HISTORY */}
                            <section className="fees-section">

                                <div className="fees-section-header">

                                    <div>
                                        <h2>
                                            Payment History
                                        </h2>

                                        <p>
                                            Recorded payments
                                            and current fee
                                            balances.
                                        </p>
                                    </div>

                                    <span className="fees-count">
                                        {
                                            filteredPayments.length
                                        }{" "}
                                        records
                                    </span>

                                </div>

                                {filteredPayments.length ===
                                0 ? (
                                    <div className="fees-empty">

                                        <div>✓</div>

                                        <h3>
                                            No payment records
                                            found
                                        </h3>

                                        <p>
                                            Recorded payments
                                            will appear here.
                                        </p>

                                    </div>
                                ) : (
                                    <div className="fees-table-wrapper">

                                        <table className="fees-table">

                                            <thead>
                                                <tr>
                                                    <th>
                                                        Student
                                                    </th>
                                                    <th>
                                                        Fee Type
                                                    </th>
                                                    <th>
                                                        Assigned
                                                    </th>
                                                    <th>
                                                        Payment
                                                    </th>
                                                    <th>
                                                        Total Paid
                                                    </th>
                                                    <th>
                                                        Remaining
                                                    </th>
                                                    <th>
                                                        Status
                                                    </th>
                                                    <th>
                                                        Payment Date
                                                    </th>
                                                    <th>
                                                        Method
                                                    </th>
                                                    <th>
                                                        Reference
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {filteredPayments.map(
                                                    (
                                                        payment
                                                    ) => (
                                                        <tr
                                                            key={
                                                                payment.id
                                                            }
                                                        >

                                                            <td>
                                                                <div className="student-cell">

                                                                    <div className="student-avatar">
                                                                        {payment.studentName
                                                                            ?.charAt(
                                                                                0
                                                                            )
                                                                            ?.toUpperCase() ||
                                                                            "S"}
                                                                    </div>

                                                                    <div>
                                                                        <strong>
                                                                            {
                                                                                payment.studentName
                                                                            }
                                                                        </strong>

                                                                        <span>
                                                                            {
                                                                                payment.academicYear
                                                                            }
                                                                        </span>
                                                                    </div>

                                                                </div>
                                                            </td>

                                                            <td>
                                                                <span className="fee-type-badge">
                                                                    {formatLabel(
                                                                        payment.feeType
                                                                    )}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                {formatCurrency(
                                                                    payment.assignedAmount
                                                                )}
                                                            </td>

                                                            <td>
                                                                <strong className="payment-amount">
                                                                    +
                                                                    {formatCurrency(
                                                                        payment.amountPaid
                                                                    )}
                                                                </strong>
                                                            </td>

                                                            <td>
                                                                {formatCurrency(
                                                                    payment.totalPaid
                                                                )}
                                                            </td>

                                                            <td>
                                                                {formatCurrency(
                                                                    payment.remainingAmount
                                                                )}
                                                            </td>

                                                            <td>
                                                                <span
                                                                    className={getStatusClass(
                                                                        payment.feeStatus
                                                                    )}
                                                                >
                                                                    {formatLabel(
                                                                        payment.feeStatus
                                                                    )}
                                                                </span>
                                                            </td>

                                                            <td>
                                                                {formatDate(
                                                                    payment.paymentDate
                                                                )}
                                                            </td>

                                                            <td>
                                                                {formatLabel(
                                                                    payment.paymentMethod
                                                                )}
                                                            </td>

                                                            <td>
                                                                <span className="reference-cell">
                                                                    {payment.transactionReference ||
                                                                        "-"}
                                                                </span>
                                                            </td>

                                                        </tr>
                                                    )
                                                )}
                                            </tbody>

                                        </table>

                                    </div>
                                )}

                            </section>

                            {/* ASSIGN FEE MODAL */}
                            {activeModal ===
                                "assignment" && (
                                <div
                                    className="fee-modal-overlay"
                                    onClick={() =>
                                        !submitting &&
                                        setActiveModal(
                                            null
                                        )
                                    }
                                >

                                    <div
                                        className="fee-modal"
                                        onClick={(e) =>
                                            e.stopPropagation()
                                        }
                                    >

                                        <div className="fee-modal-header">

                                            <div>
                                                <h2>
                                                    Assign Fee
                                                </h2>

                                                <p>
                                                    Assign a new
                                                    fee to an
                                                    enrolled
                                                    student.
                                                </p>
                                            </div>

                                            <button
                                                className="modal-close"
                                                onClick={() =>
                                                    !submitting &&
                                                    setActiveModal(
                                                        null
                                                    )
                                                }
                                            >
                                                ×
                                            </button>

                                        </div>

                                        <form
                                            onSubmit={
                                                handleCreateAssignment
                                            }
                                        >

                                            <div className="fee-form-grid">

                                                <div className="fee-form-group full">

                                                    <label>
                                                        Student
                                                        Enrollment
                                                    </label>

                                                    <select
                                                        name="enrollmentId"
                                                        value={
                                                            assignmentForm.enrollmentId
                                                        }
                                                        onChange={
                                                            handleAssignmentChange
                                                        }
                                                        required
                                                    >

                                                        <option value="">
                                                            Select
                                                            enrollment
                                                        </option>

                                                        {enrollments.map(
                                                            (
                                                                enrollment
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        enrollment.id
                                                                    }
                                                                    value={
                                                                        enrollment.id
                                                                    }
                                                                >
                                                                    {getEnrollmentLabel(
                                                                        enrollment
                                                                    )}
                                                                </option>
                                                            )
                                                        )}

                                                    </select>

                                                </div>

                                                <div className="fee-form-group">

                                                    <label>
                                                        Fee Type
                                                    </label>

                                                    <select
                                                        name="feeType"
                                                        value={
                                                            assignmentForm.feeType
                                                        }
                                                        onChange={
                                                            handleAssignmentChange
                                                        }
                                                        required
                                                    >

                                                        {FEE_TYPES.map(
                                                            (
                                                                type
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        type
                                                                    }
                                                                    value={
                                                                        type
                                                                    }
                                                                >
                                                                    {formatLabel(
                                                                        type
                                                                    )}
                                                                </option>
                                                            )
                                                        )}

                                                    </select>

                                                </div>

                                                <div className="fee-form-group">

                                                    <label>
                                                        Amount
                                                    </label>

                                                    <input
                                                        type="number"
                                                        name="amount"
                                                        min="0.01"
                                                        step="0.01"
                                                        placeholder="Enter amount"
                                                        value={
                                                            assignmentForm.amount
                                                        }
                                                        onChange={
                                                            handleAssignmentChange
                                                        }
                                                        required
                                                    />

                                                </div>

                                                <div className="fee-form-group">

                                                    <label>
                                                        Due Date
                                                    </label>

                                                    <input
                                                        type="date"
                                                        name="dueDate"
                                                        value={
                                                            assignmentForm.dueDate
                                                        }
                                                        onChange={
                                                            handleAssignmentChange
                                                        }
                                                        required
                                                    />

                                                </div>

                                                <div className="fee-form-group full">

                                                    <label>
                                                        Description
                                                    </label>

                                                    <textarea
                                                        name="description"
                                                        rows="3"
                                                        placeholder="Optional description"
                                                        value={
                                                            assignmentForm.description
                                                        }
                                                        onChange={
                                                            handleAssignmentChange
                                                        }
                                                    />

                                                </div>

                                            </div>

                                            <div className="fee-modal-footer">

                                                <button
                                                    type="button"
                                                    className="modal-cancel"
                                                    onClick={() =>
                                                        setActiveModal(
                                                            null
                                                        )
                                                    }
                                                    disabled={
                                                        submitting
                                                    }
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    type="submit"
                                                    className="fees-primary-btn"
                                                    disabled={
                                                        submitting
                                                    }
                                                >
                                                    {submitting
                                                        ? "Assigning..."
                                                        : "Assign Fee"}
                                                </button>

                                            </div>

                                        </form>

                                    </div>

                                </div>
                            )}

                            {/* PAYMENT MODAL */}
                            {activeModal ===
                                "payment" && (
                                <div
                                    className="fee-modal-overlay"
                                    onClick={() =>
                                        !submitting &&
                                        setActiveModal(
                                            null
                                        )
                                    }
                                >

                                    <div
                                        className="fee-modal"
                                        onClick={(e) =>
                                            e.stopPropagation()
                                        }
                                    >

                                        <div className="fee-modal-header">

                                            <div>
                                                <h2>
                                                    Record Payment
                                                </h2>

                                                <p>
                                                    Record a
                                                    payment
                                                    against an
                                                    assigned fee.
                                                </p>
                                            </div>

                                            <button
                                                className="modal-close"
                                                onClick={() =>
                                                    !submitting &&
                                                    setActiveModal(
                                                        null
                                                    )
                                                }
                                            >
                                                ×
                                            </button>

                                        </div>

                                        <form
                                            onSubmit={
                                                handleCreatePayment
                                            }
                                        >

                                            <div className="fee-form-grid">

                                                <div className="fee-form-group full">

                                                    <label>
                                                        Fee
                                                        Assignment
                                                    </label>

                                                    <select
                                                        name="feeAssignmentId"
                                                        value={
                                                            paymentForm.feeAssignmentId
                                                        }
                                                        onChange={
                                                            handlePaymentChange
                                                        }
                                                        required
                                                    >

                                                        <option value="">
                                                            Select
                                                            fee
                                                            assignment
                                                        </option>

                                                        {assignments.map(
                                                            (
                                                                fee
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        fee.id
                                                                    }
                                                                    value={
                                                                        fee.id
                                                                    }
                                                                >
                                                                    #
                                                                    {
                                                                        fee.id
                                                                    }{" "}
                                                                    —
                                                                    {
                                                                        fee.studentName
                                                                    }{" "}
                                                                    —
                                                                    {formatLabel(
                                                                        fee.feeType
                                                                    )}{" "}
                                                                    —
                                                                    {formatCurrency(
                                                                        fee.amount
                                                                    )}
                                                                </option>
                                                            )
                                                        )}

                                                    </select>

                                                </div>

                                                <div className="fee-form-group">

                                                    <label>
                                                        Amount
                                                        Paid
                                                    </label>

                                                    <input
                                                        type="number"
                                                        name="amountPaid"
                                                        min="0.01"
                                                        step="0.01"
                                                        placeholder="Enter payment"
                                                        value={
                                                            paymentForm.amountPaid
                                                        }
                                                        onChange={
                                                            handlePaymentChange
                                                        }
                                                        required
                                                    />

                                                </div>

                                                <div className="fee-form-group">

                                                    <label>
                                                        Payment
                                                        Date
                                                    </label>

                                                    <input
                                                        type="date"
                                                        name="paymentDate"
                                                        value={
                                                            paymentForm.paymentDate
                                                        }
                                                        onChange={
                                                            handlePaymentChange
                                                        }
                                                        required
                                                    />

                                                </div>

                                                <div className="fee-form-group">

                                                    <label>
                                                        Payment
                                                        Method
                                                    </label>

                                                    <select
                                                        name="paymentMethod"
                                                        value={
                                                            paymentForm.paymentMethod
                                                        }
                                                        onChange={
                                                            handlePaymentChange
                                                        }
                                                        required
                                                    >

                                                        {PAYMENT_METHODS.map(
                                                            (
                                                                method
                                                            ) => (
                                                                <option
                                                                    key={
                                                                        method
                                                                    }
                                                                    value={
                                                                        method
                                                                    }
                                                                >
                                                                    {formatLabel(
                                                                        method
                                                                    )}
                                                                </option>
                                                            )
                                                        )}

                                                    </select>

                                                </div>

                                                <div className="fee-form-group">

                                                    <label>
                                                        Transaction
                                                        Reference
                                                    </label>

                                                    <input
                                                        type="text"
                                                        name="transactionReference"
                                                        placeholder="Optional reference"
                                                        value={
                                                            paymentForm.transactionReference
                                                        }
                                                        onChange={
                                                            handlePaymentChange
                                                        }
                                                    />

                                                </div>

                                                <div className="fee-form-group full">

                                                    <label>
                                                        Remarks
                                                    </label>

                                                    <textarea
                                                        name="remarks"
                                                        rows="3"
                                                        placeholder="Optional remarks"
                                                        value={
                                                            paymentForm.remarks
                                                        }
                                                        onChange={
                                                            handlePaymentChange
                                                        }
                                                    />

                                                </div>

                                            </div>

                                            <div className="fee-modal-footer">

                                                <button
                                                    type="button"
                                                    className="modal-cancel"
                                                    onClick={() =>
                                                        setActiveModal(
                                                            null
                                                        )
                                                    }
                                                    disabled={
                                                        submitting
                                                    }
                                                >
                                                    Cancel
                                                </button>

                                                <button
                                                    type="submit"
                                                    className="fees-primary-btn"
                                                    disabled={
                                                        submitting
                                                    }
                                                >
                                                    {submitting
                                                        ? "Saving..."
                                                        : "Record Payment"}
                                                </button>

                                            </div>

                                        </form>

                                    </div>

                                </div>
                            )}

                            {/* SUMMARY MODAL */}
                            {activeModal ===
                                "summary" &&
                                selectedSummary && (
                                    <div
                                        className="fee-modal-overlay"
                                        onClick={() =>
                                            setActiveModal(
                                                null
                                            )
                                        }
                                    >

                                        <div
                                            className="fee-modal summary-modal"
                                            onClick={(e) =>
                                                e.stopPropagation()
                                            }
                                        >

                                            <div className="fee-modal-header">

                                                <div>
                                                    <h2>
                                                        Fee Summary
                                                    </h2>

                                                    <p>
                                                        {
                                                            selectedSummary.studentName
                                                        }
                                                        {" • "}
                                                        {
                                                            selectedSummary.academicYear
                                                        }
                                                    </p>
                                                </div>

                                                <button
                                                    className="modal-close"
                                                    onClick={() =>
                                                        setActiveModal(
                                                            null
                                                        )
                                                    }
                                                >
                                                    ×
                                                </button>

                                            </div>

                                            <div className="individual-summary-grid">

                                                <div>
                                                    <span>
                                                        Total
                                                        Assigned
                                                    </span>

                                                    <strong>
                                                        {formatCurrency(
                                                            selectedSummary.totalAssigned
                                                        )}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Total
                                                        Paid
                                                    </span>

                                                    <strong className="summary-paid">
                                                        {formatCurrency(
                                                            selectedSummary.totalPaid
                                                        )}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Total
                                                        Pending
                                                    </span>

                                                    <strong className="summary-pending">
                                                        {formatCurrency(
                                                            selectedSummary.totalPending
                                                        )}
                                                    </strong>
                                                </div>

                                                <div>
                                                    <span>
                                                        Status
                                                    </span>

                                                    <strong>
                                                        <span
                                                            className={getStatusClass(
                                                                selectedSummary.status
                                                            )}
                                                        >
                                                            {formatLabel(
                                                                selectedSummary.status
                                                            )}
                                                        </span>
                                                    </strong>
                                                </div>

                                            </div>

                                            <div className="fee-modal-footer">

                                                <button
                                                    className="modal-cancel"
                                                    onClick={() =>
                                                        setActiveModal(
                                                            null
                                                        )
                                                    }
                                                >
                                                    Close
                                                </button>

                                            </div>

                                        </div>

                                    </div>
                                )}

                        </>
                    )}

                </main>

            </div>

        </div>
    );
};

export default Fees;