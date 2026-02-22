import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye, Trash2, Loader, Grid, List, Download, Table as TableIcon } from 'lucide-react';
import { getSubmissions, approveSubmission, rejectSubmission } from '../lib/api';
import { exportToCSV } from '../lib/utils';
import CompanyCard from './CompanyCard';
import ExpertCard from './ExpertCard';

/**
 * SubmissionReviewer Component
 * 
 * Admin interface for reviewing and managing company/expert submissions
 * from the public registration portals.
 */
const SubmissionReviewer = ({ eventId, entityType = 'company' }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [submissionToReject, setSubmissionToReject] = useState(null);

    useEffect(() => {
        loadSubmissions();
    }, [eventId, entityType, filter]);

    const loadSubmissions = async () => {
        try {
            setLoading(true);
            const data = await getSubmissions(eventId, entityType, filter);
            setSubmissions(data);
        } catch (error) {
            console.error('Error loading submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (submission) => {
        const confirmed = confirm(`Approve this ${entityType} registration?`);
        if (!confirmed) return;

        try {
            setActionLoading(submission.submission_id);
            await approveSubmission(submission.submission_id, entityType);

            // Remove from list if filtering by pending
            if (filter === 'pending') {
                setSubmissions(prev => prev.filter(s => s.submission_id !== submission.submission_id));
            } else {
                await loadSubmissions();
            }

            alert(`${entityType === 'company' ? 'Company' : 'Expert'} approved successfully! ✅`);
        } catch (error) {
            console.error('Error approving submission:', error);
            alert('Failed to approve submission. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = (submission) => {
        setSubmissionToReject(submission);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    const handleConfirmReject = async () => {
        if (!submissionToReject) return;

        try {
            setActionLoading(submissionToReject.submission_id);
            await rejectSubmission(submissionToReject.submission_id, entityType, rejectionReason || 'Not specified');

            if (filter === 'pending') {
                setSubmissions(prev => prev.filter(s => s.submission_id !== submissionToReject.submission_id));
            } else {
                await loadSubmissions();
            }

            setShowRejectModal(false);
            setSubmissionToReject(null);
            alert(`${entityType === 'company' ? 'Company' : 'Expert'} rejected.`);
        } catch (error) {
            console.error('Error rejecting submission:', error);
            alert('Failed to reject submission. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleExport = () => {
        if (!submissions.length) return;

        // Flatten data for export
        const exportData = submissions.map(sub => {
            const base = {
                ID: sub.submission_id,
                Status: sub.status,
                SubmittedAt: new Date(sub.submitted_at).toLocaleString(),
                RejectionReason: sub.rejection_reason || ''
            };

            if (entityType === 'company') {
                return {
                    ...base,
                    Name: sub.startup_name,
                    Industry: sub.industry,
                    Location: sub.location,
                    Website: sub.website,
                    ...sub.additional_data // custom fields
                };
            } else {
                return {
                    ...base,
                    Name: sub.expert_name,
                    Title: sub.title,
                    Company: sub.company,
                    Bio: sub.bio,
                    ...sub.additional_data // custom fields
                };
            }
        });

        const filename = `${entityType}_submissions_${new Date().toISOString().split('T')[0]}.csv`;
        exportToCSV(exportData, filename);
    };

    const formatSubmissionData = (submission) => {
        if (entityType === 'company') {
            return {
                startup_name: submission.startup_name,
                logo_url: submission.logo_url,
                industry: submission.industry,
                location: submission.location,
                ...submission.additional_data
            };
        } else {
            return {
                expert_name: submission.expert_name,
                photo_url: submission.photo_url,
                title: submission.title,
                company: submission.company,
                bio: submission.bio,
                ...submission.additional_data
            };
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-amber-100 text-amber-700 border-amber-200',
            approved: 'bg-green-100 text-green-700 border-green-200',
            rejected: 'bg-red-100 text-red-700 border-red-200'
        };

        const icons = {
            pending: <Clock size={14} />,
            approved: <CheckCircle size={14} />,
            rejected: <XCircle size={14} />
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${styles[status]} flex items-center gap-1 w-fit`}>
                {icons[status]}
                {status}
            </span>
        );
    };

    // Helper to get custom keys from all submissions to build table columns
    const getCustomKeys = () => {
        const keys = new Set();
        submissions.forEach(sub => {
            if (sub.additional_data) {
                Object.keys(sub.additional_data).forEach(k => keys.add(k));
            }
        });
        return Array.from(keys);
    };

    const customKeys = getCustomKeys();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 font-manrope">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                        {entityType === 'company' ? 'Company' : 'Expert'} Submissions
                    </h2>
                    <p className="text-sm text-slate-500 mt-1 font-medium">
                        Review and manage registration requests
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Filter Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        {['all', 'pending', 'approved', 'rejected'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === status
                                    ? 'bg-white text-slate-800 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* View Toggles & Actions */}
                    <div className="flex items-center gap-2 border-l border-slate-200 pl-3 ml-1">
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                title="Grid View"
                            >
                                <Grid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                title="Table View"
                            >
                                <TableIcon size={18} />
                            </button>
                        </div>

                        <button
                            onClick={handleExport}
                            className="p-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition-colors border border-emerald-100"
                            title="Export to Excel/CSV"
                        >
                            <Download size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {submissions.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 bg-slate-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <Clock className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">No Submissions</h3>
                    <p className="text-sm text-slate-500">
                        {filter === 'pending'
                            ? 'No pending submissions at the moment.'
                            : `No ${filter} submissions found.`}
                    </p>
                </div>
            ) : viewMode === 'table' ? (
                // Table View
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs whitespace-nowrap">Status</th>
                                <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs whitespace-nowrap">
                                    {entityType === 'company' ? 'Company Name' : 'Expert Name'}
                                </th>
                                <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs whitespace-nowrap">
                                    {entityType === 'company' ? 'Industry' : 'Title'}
                                </th>
                                {/* Dynamic Columns from Custom Fields */}
                                {customKeys.map(key => (
                                    <th key={key} className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs whitespace-nowrap">
                                        {key.replace(/_/g, ' ')}
                                    </th>
                                ))}
                                <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs whitespace-nowrap">Start Date</th>
                                <th className="px-6 py-4 font-bold text-slate-600 uppercase tracking-wider text-xs whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {submissions.map((sub, idx) => (
                                <tr key={sub.submission_id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">{getStatusBadge(sub.status)}</td>
                                    <td className="px-6 py-4 font-bold text-slate-800">
                                        {entityType === 'company' ? sub.startup_name : sub.expert_name}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {entityType === 'company' ? sub.industry : sub.title}
                                    </td>
                                    {/* Dynamic Fields Data */}
                                    {customKeys.map(key => (
                                        <td key={key} className="px-6 py-4 text-slate-600 max-w-xs truncate">
                                            {sub.additional_data && sub.additional_data[key]
                                                ? (typeof sub.additional_data[key] === 'object' ? JSON.stringify(sub.additional_data[key]) : sub.additional_data[key])
                                                : '-'}
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                        {new Date(sub.submitted_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedSubmission(sub);
                                                    setShowPreview(true);
                                                }}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Preview"
                                            >
                                                <Eye size={18} />
                                            </button>

                                            {sub.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(sub)}
                                                        disabled={actionLoading === sub.submission_id}
                                                        className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(sub)}
                                                        disabled={actionLoading === sub.submission_id}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                // Grid View (Original)
                <div className="space-y-4">
                    {submissions.map((submission) => (
                        <div
                            key={submission.submission_id}
                            className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start justify-between gap-6">
                                {/* Info Section */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="text-xl font-bold text-slate-800">
                                            {entityType === 'company' ? submission.startup_name : submission.expert_name}
                                        </h3>
                                        {getStatusBadge(submission.status)}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                        {entityType === 'company' ? (
                                            <>
                                                <div>
                                                    <span className="text-slate-500 font-semibold">Industry:</span>
                                                    <span className="ml-2 text-slate-700">{submission.industry || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-semibold">Location:</span>
                                                    <span className="ml-2 text-slate-700">{submission.location || 'N/A'}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <span className="text-slate-500 font-semibold">Title:</span>
                                                    <span className="ml-2 text-slate-700">{submission.title || 'N/A'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-500 font-semibold">Company:</span>
                                                    <span className="ml-2 text-slate-700">{submission.company || 'N/A'}</span>
                                                </div>
                                            </>
                                        )}
                                        <div>
                                            <span className="text-slate-500 font-semibold">Submitted:</span>
                                            <span className="ml-2 text-slate-700">
                                                {new Date(submission.submitted_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Show custom fields summary in grid view */}
                                    {submission.additional_data && Object.keys(submission.additional_data).length > 0 && (
                                        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                            {Object.entries(submission.additional_data).slice(0, 4).map(([key, val]) => (
                                                <div key={key} className="truncate">
                                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1">{key.replace(/_/g, ' ')}:</span>
                                                    <span className="text-slate-600 font-medium">
                                                        {typeof val === 'object' ? '...' : val}
                                                    </span>
                                                </div>
                                            ))}
                                            {Object.keys(submission.additional_data).length > 4 && (
                                                <div className="text-slate-400 italic text-[10px] pt-1">
                                                    +{Object.keys(submission.additional_data).length - 4} more fields...
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {submission.status === 'rejected' && submission.rejection_reason && (
                                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-100">
                                            <p className="text-xs font-semibold text-red-700">
                                                Rejection Reason: {submission.rejection_reason}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedSubmission(submission);
                                            setShowPreview(true);
                                        }}
                                        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all flex items-center gap-2"
                                    >
                                        <Eye size={16} />
                                        Preview
                                    </button>

                                    {submission.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(submission)}
                                                disabled={actionLoading === submission.submission_id}
                                                className="px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <CheckCircle size={16} />
                                                Approve
                                            </button>

                                            <button
                                                onClick={() => handleReject(submission)}
                                                disabled={actionLoading === submission.submission_id}
                                                className="px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <XCircle size={16} />
                                                Reject
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Preview Modal */}
            {showPreview && selectedSubmission && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl relative">
                        <div className="flex items-center justify-between mb-8 sticky top-0 bg-white z-10 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Card Preview</h3>
                                <p className="text-slate-500 font-medium">Verify how this submission looks on the public agenda.</p>
                            </div>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="w-12 h-12 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all"
                            >
                                <XCircle className="w-6 h-6 text-slate-600" />
                            </button>
                        </div>

                        <div className="flex flex-col md:flex-row gap-12">
                            {/* Form Data View */}
                            <div className="flex-1 space-y-6">
                                <h4 className="text-lg font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-2">Submission Data</h4>
                                <div className="grid grid-cols-1 gap-4">
                                    {Object.entries(formatSubmissionData(selectedSubmission)).map(([key, value]) => {
                                        // Skip internal fields or complex objects if needed
                                        if (key === 'additional_data') return null;
                                        return (
                                            <div key={key} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                    {key.replace(/_/g, ' ')}
                                                </span>
                                                <span className="text-slate-800 font-medium break-words">
                                                    {typeof value === 'object' ? JSON.stringify(value) : (value || '-')}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Card Visual */}
                            <div className="flex-1 flex flex-col items-center justify-start bg-slate-100/50 rounded-3xl p-8 border border-slate-200 dashed">
                                <div className="scale-90 md:scale-100 origin-top">
                                    {entityType === 'company' ? (
                                        <CompanyCard
                                            company={formatSubmissionData(selectedSubmission)}
                                            viewMode="list"
                                        />
                                    ) : (
                                        <ExpertCard
                                            expert={formatSubmissionData(selectedSubmission)}
                                        />
                                    )}
                                </div>
                                <p className="text-center text-slate-400 text-xs font-bold uppercase tracking-widest mt-8">Live Component Render</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Rejection Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] max-w-lg w-full p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-100">
                                <XCircle size={40} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Reject Submission</h3>
                            <p className="text-slate-500 font-medium">
                                Are you sure you want to reject this {entityType}? You can optionally provide a reason.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 ml-1 block">
                                Rejection Reason (Optional)
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-400 transition-all outline-none font-medium min-h-[120px] resize-none"
                                placeholder="Why is this submission being rejected?"
                            />
                        </div>

                        <div className="flex gap-4 mt-10">
                            <button
                                onClick={() => {
                                    setShowRejectModal(false);
                                    setSubmissionToReject(null);
                                }}
                                className="flex-1 px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmReject}
                                disabled={actionLoading}
                                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl font-black shadow-xl shadow-red-200 hover:bg-red-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:translate-y-0 active:scale-95"
                            >
                                {actionLoading ? <Loader className="animate-spin" /> : 'Confirm Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubmissionReviewer;
