import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Search,
    Loader2,
    AlertCircle,
    X,
    Eye,
    Check,
    ClipboardList,
    UserCheck,
    PhoneCall,
    PauseCircle,
    Ban,
    Globe,
    ExternalLink,
    RefreshCw
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    getSubmissions,
    updateSubmissionStatus,
    syncSubmissionsFromSheet,
    getEvent,
    updateEvent
} from '../lib/api';

const SelectionProcessManager = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();

    // UI State
    const [activeTab, setActiveTab] = useState('screening');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState(null);
    const [event, setEvent] = useState(null);
    const [sheetUrl, setSheetUrl] = useState('');

    // Data State
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [decisionModal, setDecisionModal] = useState({ show: false, submission: null, newStatus: null, reason: '' });
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const stages = [
        { id: 'screening', name: 'Screening', icon: <ClipboardList size={18} />, color: 'blue' },
        { id: 'interview', name: 'Interviews', icon: <PhoneCall size={18} />, color: 'purple' },
        { id: 'approved', name: 'Approved', icon: <UserCheck size={18} />, color: 'emerald' },
        { id: 'holding', name: 'Holding', icon: <PauseCircle size={18} />, color: 'amber' },
        { id: 'rejected', name: 'Rejected', icon: <Ban size={18} />, color: 'rose' }
    ];

    const loadData = async () => {
        try {
            setLoading(true);
            const [evData, subData] = await Promise.all([
                getEvent(eventId),
                getSubmissions(eventId, 'company')
            ]);
            setEvent(evData);
            setSubmissions(subData || []);
            setSheetUrl(evData.gsheets_url || '');
            setError(null);
        } catch (err) {
            console.error('Error loading selection data:', err);
            setError('Failed to establish connection with the selection grid.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [eventId]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
    };

    const handleSync = async () => {
        if (!sheetUrl) {
            showToast('Please provide a Google Sheets URL', 'error');
            return;
        }

        try {
            setIsSyncing(true);

            // Save the URL to the event first so it persists
            await updateEvent(eventId, { gsheets_url: sheetUrl });

            const result = await syncSubmissionsFromSheet(eventId, sheetUrl);
            await loadData();

            let message = `Sync complete!`;
            if (result.inserted > 0 || result.deleted > 0) {
                message = `Sync complete: Added ${result.inserted}, Removed ${result.deleted}`;
            } else {
                message = `Sync complete: No changes detected.`;
            }

            showToast(message, 'success');
        } catch (err) {
            console.error('Sync failed:', err);
            showToast('Sync failed. Please check the URL and permissions.', 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleStatusUpdate = async (submissionId, newStatus, additionalUpdates = {}) => {
        try {
            const submission = submissions.find(s => s.submission_id === submissionId);

            // If it's a critical status change and no reason provided, show modal
            // Note: Interview now requires "Technology Status"
            const requiresReason = ['rejected', 'holding', 'approved', 'interview'].includes(newStatus);
            if (requiresReason && !additionalUpdates.reason_provided) {
                setDecisionModal({
                    show: true,
                    submission,
                    newStatus,
                    reason: newStatus === 'interview'
                        ? (submission.additional_data?.tech_status || '')
                        : (submission.additional_data?.[`${newStatus}_reason`] || '')
                });
                return;
            }

            const finalAdditionalData = {
                ...(submission.additional_data || {}),
                ...(additionalUpdates.additional_data || {})
            };

            if (additionalUpdates.reason) {
                if (newStatus === 'interview') {
                    finalAdditionalData.tech_status = additionalUpdates.reason;
                } else {
                    finalAdditionalData[`${newStatus}_reason`] = additionalUpdates.reason;
                }
            }

            await updateSubmissionStatus(submissionId, newStatus, {
                additional_data: finalAdditionalData
            });

            setSubmissions(prev => prev.map(s => {
                if (s.submission_id === submissionId) {
                    const updated = {
                        ...s,
                        status: newStatus,
                        additional_data: finalAdditionalData
                    };
                    if (selectedSubmission?.submission_id === submissionId) {
                        setSelectedSubmission(updated);
                    }
                    return updated;
                }
                return s;
            }));

            setDecisionModal({ show: false, submission: null, newStatus: null, reason: '' });
            showToast(`Submission moved to ${newStatus}`, 'success');
        } catch (err) {
            console.error('Status update failed:', err);
            showToast('Failed to update status.', 'error');
        }
    };

    const formatValue = (val) => {
        if (!val) return '-';

        // Check if it's a timestamp-like number (Excel date)
        if (typeof val === 'number' && val > 40000 && val < 60000) {
            const date = new Date((val - 25569) * 86400 * 1000);
            return date.toLocaleDateString();
        }

        // Check if it's a date string
        if (typeof val === 'string') {
            const date = new Date(val);
            if (!isNaN(date.getTime()) && (val.includes('-') || val.includes('/') || val.includes(':'))) {
                // Heuristic: only format if it looks like a date string and parses correctly
                return date.toLocaleDateString();
            }
        }

        return String(val);
    };

    const currentSubmissions = submissions.filter(s => {
        const matchesTab = s.status === activeTab || (activeTab === 'approved' && s.status === 'displayed');
        const matchesSearch = s.startup_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.industry?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    // Get all unique keys from additional_data in the current set, respecting order
    const getColumns = () => {
        // Find the first submission that has column order metadata
        const withOrder = currentSubmissions.find(s => s.additional_data?._column_order);
        if (withOrder) {
            return withOrder.additional_data._column_order;
        }

        // Fallback to dynamic key gathering
        const keys = new Set(['Startup Name', 'Industry', 'Location']);
        currentSubmissions.forEach(s => {
            if (s.additional_data) {
                Object.keys(s.additional_data).forEach(k => {
                    if (k !== '_column_order') keys.add(k);
                });
            }
        });
        return Array.from(keys);
    };

    const columns = getColumns();

    return (
        <div className="min-h-screen bg-gray-200 font-manrope selection:bg-[#1a27c9]/10 selection:text-[#1a27c9]">
            {/* Header */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
                <div className="max-w-[1600px] mx-auto px-6 py-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => navigate(`/event/${eventId}`)}
                                className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#1a27c9] hover:border-[#1a27c9] hover:bg-white transition-premium group"
                            >
                                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-black text-[#0d0e0e] tracking-tight">Selection Process</h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Manage and screen event applicants</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative group">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Google Sheets URL..."
                                    value={sheetUrl}
                                    onChange={(e) => setSheetUrl(e.target.value)}
                                    className="pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold w-full md:w-80 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1a27c9]/5 focus:border-[#1a27c9] transition-premium"
                                />
                            </div>
                            <button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className="flex items-center gap-3 bg-[#1a27c9] text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#0d0e0e] transition-premium disabled:opacity-50"
                            >
                                {isSyncing ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                                <span>Sync Sheet</span>
                            </button>
                        </div>
                    </div>

                    {/* Stage Tabs */}
                    <div className="flex gap-4 mt-8 overflow-x-auto pb-2 scrollbar-hide">
                        {stages.map(stage => (
                            <button
                                key={stage.id}
                                onClick={() => setActiveTab(stage.id)}
                                className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-premium shrink-0 ${activeTab === stage.id
                                    ? `bg-${stage.color}-600 text-white shadow-xl shadow-${stage.color}-100`
                                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                    }`}
                                style={{
                                    backgroundColor: activeTab === stage.id ? undefined : '',
                                    // Inline styles for colors because tailwind JIT might not catch dynamic classes well in some envs
                                    ...(activeTab === stage.id && {
                                        backgroundColor: stage.color === 'blue' ? '#2563eb' :
                                            stage.color === 'purple' ? '#9333ea' :
                                                stage.color === 'emerald' ? '#059669' :
                                                    stage.color === 'amber' ? '#d97706' : '#e11d48'
                                    })
                                }}
                            >
                                {stage.icon}
                                <span>{stage.name}</span>
                                <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === stage.id ? 'bg-white/20' : 'bg-slate-200 text-slate-500'}`}>
                                    {submissions.filter(s => s.status === stage.id || (stage.id === 'approved' && s.status === 'displayed')).length}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-[1600px] mx-auto px-6 py-10">
                <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                    {/* Search inside table */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search in this stage..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold w-full focus:outline-none focus:ring-4 focus:ring-[#1a27c9]/5 focus:border-[#1a27c9] transition-premium"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-16 text-center">View</th>
                                    {columns.slice(0, 5).map((col, idx) => (
                                        <th key={`${col}-${idx}`} className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                            {col}
                                        </th>
                                    ))}
                                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={columns.length + 2} className="py-32 text-center">
                                            <Loader2 size={40} className="animate-spin text-[#1a27c9] mx-auto mb-4" />
                                            <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Loading Grid Data...</p>
                                        </td>
                                    </tr>
                                ) : currentSubmissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={columns.length + 2} className="py-32 text-center">
                                            <AlertCircle size={40} className="text-slate-200 mx-auto mb-4" />
                                            <p className="text-slate-400 font-black text-xs uppercase tracking-widest">No applicants in this stage.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    currentSubmissions.map(sub => {
                                        const stage = stages.find(s => s.id === (sub.status === 'displayed' ? 'approved' : sub.status));
                                        return (
                                            <tr key={sub.submission_id} className="hover:bg-slate-50/80 transition-premium group">
                                                <td className="px-6 py-5 border-b border-slate-50 text-center">
                                                    <button
                                                        onClick={() => setSelectedSubmission(sub)}
                                                        className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-[#1a27c9] hover:text-white transition-premium"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                </td>
                                                {columns.slice(0, 6).map((col, idx) => {
                                                    let val = '';
                                                    // Smart display: check core fields first, then additional_data
                                                    const lowCol = col.toLowerCase();
                                                    if (lowCol.includes('name')) val = sub.startup_name;
                                                    else if (lowCol.includes('industry') || lowCol.includes('sector')) val = sub.industry;
                                                    else if (lowCol.includes('location') || lowCol.includes('city') || lowCol.includes('governorate')) val = sub.location;
                                                    else val = sub.additional_data?.[col];

                                                    return (
                                                        <td key={`${col}-${idx}`} className="px-6 py-5 border-b border-slate-50 text-sm font-bold text-slate-600 truncate max-w-[200px]">
                                                            {formatValue(val)}
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-6 py-5 border-b border-slate-50 text-right space-x-2 whitespace-nowrap">
                                                    {sub.status === 'screening' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(sub.submission_id, 'interview')}
                                                                className="px-4 py-2 rounded-xl bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-premium"
                                                            >
                                                                Interview
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(sub.submission_id, 'holding', {
                                                                    additional_data: { ...sub.additional_data, origin_stage: 'screening' }
                                                                })}
                                                                className="px-4 py-2 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-premium"
                                                            >
                                                                Hold
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(sub.submission_id, 'rejected')}
                                                                className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-premium"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {sub.status === 'interview' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(sub.submission_id, 'approved')}
                                                                className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-premium"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(sub.submission_id, 'rejected')}
                                                                className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-premium"
                                                            >
                                                                Reject
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(sub.submission_id, 'holding', {
                                                                    additional_data: { ...sub.additional_data, origin_stage: 'interview' }
                                                                })}
                                                                className="px-4 py-2 rounded-xl bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 hover:text-white transition-premium"
                                                            >
                                                                Hold
                                                            </button>
                                                        </>
                                                    )}
                                                    {sub.status === 'approved' && (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleStatusUpdate(sub.submission_id, 'displayed')}
                                                                className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-premium"
                                                            >
                                                                Display
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(sub.submission_id, 'rejected')}
                                                                className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-premium"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                    {sub.status === 'displayed' && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest border border-emerald-200">
                                                                Publicly Displayed
                                                            </span>
                                                            <button
                                                                onClick={() => handleStatusUpdate(sub.submission_id, 'rejected')}
                                                                className="px-4 py-2 rounded-xl bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-premium"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    )}
                                                    {sub.status === 'holding' && (
                                                        <button
                                                            onClick={() => {
                                                                const origin = sub.additional_data?.origin_stage || 'screening';
                                                                handleStatusUpdate(sub.submission_id, origin);
                                                            }}
                                                            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-600 hover:text-white transition-premium"
                                                        >
                                                            {sub.additional_data?.origin_stage === 'interview' ? 'Back to Interview' : 'Back to Screening'}
                                                        </button>
                                                    )}
                                                    {sub.status === 'rejected' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(sub.submission_id, 'screening')}
                                                            className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-600 hover:text-white transition-premium"
                                                        >
                                                            Move back to Screening
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            {selectedSubmission && (
                <div key={selectedSubmission.submission_id} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-6">
                    <div className="bg-white rounded-[3rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
                        {/* Modal Header */}
                        <div className="p-10 pb-6 border-b border-slate-100 flex items-start justify-between relative overflow-hidden bg-gradient-to-br from-slate-50 to-white">
                            <div className="flex gap-8 items-center relative z-10">
                                <div className="w-24 h-24 rounded-3xl bg-white border border-slate-200 shadow-xl flex items-center justify-center overflow-hidden p-2">
                                    {selectedSubmission.logo_url ? (
                                        <img src={selectedSubmission.logo_url} alt="Logo" className="w-full h-full object-contain" />
                                    ) : (
                                        <ClipboardList className="text-slate-200" size={40} />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-3 py-1 bg-[#1a27c9]/10 text-[#1a27c9] text-[10px] font-black uppercase tracking-widest rounded-lg">
                                            {selectedSubmission.status}
                                        </span>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            Submitted At: {new Date(selectedSubmission.submitted_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h2 className="text-4xl font-black text-[#0d0e0e] tracking-tight leading-none">
                                        {selectedSubmission.startup_name}
                                    </h2>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-premium relative z-10"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white">
                            <div className="max-w-2xl mx-auto space-y-12">
                                {/* Review Summary Section */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-black text-[#1a27c9] uppercase tracking-[0.2em] flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-[#1a27c9]" />
                                        Review Context
                                    </h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        {/* Technology Status Display */}
                                        {selectedSubmission.additional_data?.tech_status && (
                                            <div className="bg-[#1a27c9]/5 p-8 rounded-[2rem] border border-[#1a27c9]/10">
                                                <p className="text-[10px] font-black text-[#1a27c9] uppercase tracking-widest mb-3">Technology Status</p>
                                                <p className="text-lg font-bold text-slate-700 leading-relaxed">
                                                    {selectedSubmission.additional_data.tech_status}
                                                </p>
                                            </div>
                                        )}

                                        {/* Decision Notes List */}
                                        {['approved', 'rejected', 'holding', 'displayed'].map(status => {
                                            const reason = selectedSubmission.additional_data?.[`${status}_reason`];
                                            if (!reason) return null;
                                            return (
                                                <div key={status} className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{status} Note</p>
                                                    <p className="text-lg font-bold text-slate-600 leading-relaxed">{reason}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Full Metadata Section */}
                                <div className="space-y-8">
                                    <h3 className="text-sm font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-600" />
                                        Complete Submission Data
                                    </h3>
                                    <div className="space-y-6">
                                        {(() => {
                                            const order = selectedSubmission.additional_data?._column_order || Object.keys(selectedSubmission.additional_data || {});
                                            return order
                                                .filter(key => key !== '_column_order' && key !== 'tech_status' && !key.endsWith('_reason') && key !== 'origin_stage')
                                                .map((key, idx) => {
                                                    const value = selectedSubmission.additional_data?.[key];
                                                    if (value === undefined || value === '') return null;
                                                    return (
                                                        <div key={`${key}-${idx}`} className="flex flex-col gap-2 border-b border-slate-50 pb-6 text-left">
                                                            <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">{key}</span>
                                                            <span className="text-lg font-bold text-slate-600 break-words leading-snug">{formatValue(value)}</span>
                                                        </div>
                                                    );
                                                });
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 mt-auto">
                            <div className="flex items-center gap-2 mr-auto">
                                {selectedSubmission.status === 'screening' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(selectedSubmission.submission_id, 'interview')}
                                            className="px-6 py-4 rounded-2xl bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-premium shadow-lg shadow-purple-100"
                                        >
                                            Move to Interview
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(selectedSubmission.submission_id, 'holding', {
                                                additional_data: { ...selectedSubmission.additional_data, origin_stage: 'screening' }
                                            })}
                                            className="px-6 py-4 rounded-2xl bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-premium shadow-lg shadow-amber-100"
                                        >
                                            Hold
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(selectedSubmission.submission_id, 'rejected')}
                                            className="px-6 py-4 rounded-2xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-premium shadow-lg shadow-rose-100"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {selectedSubmission.status === 'interview' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(selectedSubmission.submission_id, 'approved')}
                                            className="px-6 py-4 rounded-2xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-premium shadow-lg shadow-emerald-100"
                                        >
                                            Approve Startup
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(selectedSubmission.submission_id, 'holding', {
                                                additional_data: { ...selectedSubmission.additional_data, origin_stage: 'interview' }
                                            })}
                                            className="px-6 py-4 rounded-2xl bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-premium shadow-lg shadow-amber-100"
                                        >
                                            Move to Hold
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(selectedSubmission.submission_id, 'rejected')}
                                            className="px-6 py-4 rounded-2xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-premium shadow-lg shadow-rose-100"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {selectedSubmission.status === 'approved' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(selectedSubmission.submission_id, 'displayed')}
                                            className="px-6 py-4 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-premium shadow-lg shadow-blue-100"
                                        >
                                            Display Publicly
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(selectedSubmission.submission_id, 'rejected')}
                                            className="px-6 py-4 rounded-2xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-premium shadow-lg shadow-rose-100"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {selectedSubmission.status === 'holding' && (
                                    <button
                                        onClick={() => {
                                            const origin = selectedSubmission.additional_data?.origin_stage || 'screening';
                                            handleStatusUpdate(selectedSubmission.submission_id, origin);
                                        }}
                                        className="px-6 py-4 rounded-2xl bg-slate-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-premium shadow-lg shadow-slate-100"
                                    >
                                        {selectedSubmission.additional_data?.origin_stage === 'interview' ? 'Return to Interview' : 'Return to Screening'}
                                    </button>
                                )}
                                {selectedSubmission.status === 'rejected' && (
                                    <button
                                        onClick={() => handleStatusUpdate(selectedSubmission.submission_id, 'screening')}
                                        className="px-6 py-4 rounded-2xl bg-slate-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-premium shadow-lg shadow-slate-100"
                                    >
                                        Restore to Screening
                                    </button>
                                )}
                                {selectedSubmission.status === 'displayed' && (
                                    <button
                                        onClick={() => handleStatusUpdate(selectedSubmission.submission_id, 'rejected')}
                                        className="px-6 py-4 rounded-2xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-premium shadow-lg shadow-rose-100"
                                    >
                                        Reject Displayed
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-premium"
                            >
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Decision Reason Modal */}
            {decisionModal.show && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 flex flex-col">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-black text-[#0d0e0e] tracking-tight">
                                    Decision Context
                                </h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    Moving {decisionModal.submission.startup_name} to {decisionModal.newStatus}
                                </p>
                            </div>
                            <button
                                onClick={() => setDecisionModal({ show: false, submission: null, newStatus: null, reason: '' })}
                                className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-premium"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    {decisionModal.newStatus === 'interview'
                                        ? "Company Technology Status/Notes"
                                        : `Why is this company being ${decisionModal.newStatus}?`
                                    }
                                    <span className="text-[8px] font-bold text-slate-300 capitalize">(Optional)</span>
                                </label>
                                <textarea
                                    className="w-full bg-slate-50 border border-slate-100 rounded-3xl p-6 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-[#1a27c9]/5 focus:border-[#1a27c9]/30 transition-all resize-none"
                                    placeholder={decisionModal.newStatus === 'interview'
                                        ? "Enter technology orientation, tech stack, or engineering notes..."
                                        : "Enter your notes or reasons here..."
                                    }
                                    rows={4}
                                    value={decisionModal.reason}
                                    onChange={(e) => setDecisionModal(prev => ({ ...prev, reason: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={() => setDecisionModal({ show: false, submission: null, newStatus: null, reason: '' })}
                                className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-premium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleStatusUpdate(decisionModal.submission.submission_id, decisionModal.newStatus, {
                                    reason_provided: true,
                                    reason: decisionModal.reason
                                })}
                                className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white transition-premium shadow-lg ${decisionModal.newStatus === 'rejected' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' :
                                    decisionModal.newStatus === 'holding' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' :
                                        decisionModal.newStatus === 'interview' ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200' :
                                            'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
                                    }`}
                            >
                                {decisionModal.newStatus === 'interview' ? 'Proceed to Interview' : 'Confirm Decision'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast.show && (
                <div className={`fixed bottom-8 right-8 z-[110] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl border animate-slideInRight ${toast.type === 'success' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-rose-600 text-white border-rose-500'}`}>
                    <div className="flex items-center gap-3">
                        {toast.type === 'success' ? <Check size={20} className="shrink-0" /> : <AlertCircle size={20} className="shrink-0" />}
                        <span className="font-extrabold text-sm tracking-tight">{toast.message}</span>
                    </div>
                    <button
                        onClick={() => setToast(prev => ({ ...prev, show: false }))}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default SelectionProcessManager;
