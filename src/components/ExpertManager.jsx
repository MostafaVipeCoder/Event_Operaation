import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Loader2, AlertCircle, X, Pencil, Upload, Check, Inbox, Users, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ExpertCard from './ExpertCard';
import SyncButton from './SyncButton';
import { getExperts, createExpert, updateExpert, deleteExpert, uploadImage, getSubmissions, approveSubmission, rejectSubmission } from '../lib/api';

const ExpertManager = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [editingExpert, setEditingExpert] = useState(null);
    const [activeTab, setActiveTab] = useState('curated'); // 'curated' | 'review'
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        company: '',
        bio: '',
        linkedin_url: '',
        photo_url: ''
    });

    const loadData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'curated') {
                const data = await getExperts(eventId);
                setExperts(data || []);
            } else {
                const data = await getSubmissions(eventId, 'expert', 'pending');
                setSubmissions(data || []);
            }
            setError(null);
        } catch (err) {
            console.error('Error loading data:', err);
            setError(`Failed to establish link with ${activeTab === 'curated' ? 'Expert Grid' : 'Review Pulse'}.`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [eventId, activeTab]);

    const handleEdit = (expert) => {
        setEditingExpert(expert);
        setFormData({
            name: expert.name || '',
            title: expert.title || '',
            company: expert.company || '',
            bio: expert.bio || '',
            linkedin_url: expert.linkedin_url || '',
            photo_url: expert.photo_url || ''
        });
        setShowAddModal(true);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const publicUrl = await uploadImage(file, `experts/${eventId}`);
            setFormData(prev => ({ ...prev, photo_url: publicUrl }));
        } catch (err) {
            console.error('Error uploading image:', err);
            alert('Failed to upload image. Signal lost.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteExpert = async (expertId) => {
        try {
            await deleteExpert(expertId);
            loadExperts();
        } catch (err) {
            console.error('Error deleting expert:', err);
            alert('Failed to delete expert from the grid.');
        }
    };

    const handleApproveExpert = async (submission) => {
        try {
            setActionLoading(submission.submission_id);
            await approveSubmission(submission.submission_id, 'expert');
            setSubmissions(prev => prev.filter(s => s.submission_id !== submission.submission_id));
            alert('Expert approved and added to roster! ✅');
        } catch (error) {
            console.error('Error approving expert:', error);
            alert('Failed to approve registration pulse.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectExpert = async (submission) => {
        const reason = prompt('Reason for rejection? (Optional)');
        if (reason === null) return;

        try {
            setActionLoading(submission.submission_id);
            await rejectSubmission(submission.submission_id, 'expert', reason || 'Not specified');
            setSubmissions(prev => prev.filter(s => s.submission_id !== submission.submission_id));
            alert('Registration request rejected.');
        } catch (error) {
            console.error('Error rejecting expert:', error);
            alert('Failed to block registration signal.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            if (editingExpert) {
                await updateExpert(editingExpert.expert_id || editingExpert.id, {
                    ...formData,
                    event_id: eventId
                });
            } else {
                await createExpert({
                    ...formData,
                    event_id: eventId
                });
            }
            setShowAddModal(false);
            setEditingExpert(null);
            setFormData({ name: '', title: '', company: '', bio: '', linkedin_url: '', photo_url: '' });
            loadData();
        } catch (err) {
            console.error('Error saving expert:', err);
            alert('Failed to save expert vision.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredExperts = experts.filter(expert =>
        expert.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expert.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-200 font-manrope selection:bg-[#1a27c9]/10 selection:text-[#1a27c9]">
            {/* Header Area */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => navigate(`/event/${eventId}`)}
                                className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#1a27c9] hover:border-[#1a27c9] hover:bg-white transition-premium group"
                            >
                                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-black text-[#0d0e0e] tracking-tight">Mentors Hub</h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Curate your events visionaries & speakers</p>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
                            <button
                                onClick={() => setActiveTab('curated')}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'curated'
                                    ? 'bg-white text-[#1a27c9] shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <Users size={16} />
                                Expert Roster
                            </button>
                            <button
                                onClick={() => setActiveTab('review')}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'review'
                                    ? 'bg-white text-[#1a27c9] shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <Inbox size={16} />
                                Review Desk
                                {submissions.filter(s => s.status === 'pending').length > 0 && (
                                    <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                )}
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1a27c9] transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search experts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1a27c9]/5 focus:border-[#1a27c9] transition-premium w-full md:w-64"
                                />
                            </div>
                            <SyncButton
                                eventId={eventId}
                                onSyncComplete={loadData}
                                className="md:w-auto h-[54px]"
                            />
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-3 bg-[#1a27c9] text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#0d0e0e] hover:shadow-2xl hover:shadow-indigo-200 transition-premium group active:scale-95"
                            >
                                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                                <span>Add Expert</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-700">
                        <div className="w-20 h-20 border-4 border-slate-100 border-t-[#1a27c9] rounded-full animate-spin mb-8"></div>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">Establishing Visionary Signal...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center animate-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 mb-8 border border-rose-100 shadow-xl shadow-rose-100/20">
                            <AlertCircle size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-[#0d0e0e] tracking-tight mb-2 uppercase">Sync Interrupt</h2>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{error}</p>
                        <button onClick={() => window.location.reload()} className="mt-8 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-premium">Retry Initialization</button>
                    </div>
                ) : activeTab === 'curated' && filteredExperts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredExperts.map(expert => (
                            <ExpertCard
                                key={expert.expert_id || expert.id}
                                expert={expert}
                                onEdit={handleEdit}
                                onDelete={handleDeleteExpert}
                            />
                        ))}
                    </div>
                ) : activeTab === 'review' && (submissions.length > 0) ? (
                    <div className="space-y-4">
                        {submissions.filter(s => s.status === 'pending').map((submission) => (
                            <div key={submission.submission_id} className="bg-white rounded-[2rem] border border-slate-100 p-8 hover:shadow-xl transition-premium group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-1 h-full bg-[#1a27c9] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center justify-between gap-8">
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="relative w-20 h-20 rounded-[1.5rem] overflow-hidden bg-slate-100 border border-slate-100 group-hover:scale-105 transition-transform">
                                            {submission.photo_url ? (
                                                <img src={submission.photo_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Users size={32} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-xl font-black text-[#0d0e0e] tracking-tight">{submission.expert_name}</h3>
                                                <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-1.5">
                                                    <Clock size={12} />
                                                    Pending Review
                                                </span>
                                            </div>
                                            <p className="text-sm font-bold text-slate-500">{submission.title} @ <span className="text-[#1a27c9]">{submission.company}</span></p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                setSelectedSubmission(submission);
                                                setShowPreview(true);
                                            }}
                                            className="px-6 py-3 bg-slate-50 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-premium flex items-center gap-2"
                                        >
                                            <Eye size={16} />
                                            Preview
                                        </button>
                                        <button
                                            disabled={actionLoading === submission.submission_id}
                                            onClick={() => handleApproveExpert(submission)}
                                            className="px-6 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-premium flex items-center gap-2 shadow-sm"
                                        >
                                            <CheckCircle size={16} />
                                            Approve
                                        </button>
                                        <button
                                            disabled={actionLoading === submission.submission_id}
                                            onClick={() => handleRejectExpert(submission)}
                                            className="px-6 py-3 bg-rose-50 text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-premium flex items-center gap-2 shadow-sm"
                                        >
                                            <XCircle size={16} />
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-24 h-24 bg-white border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center text-slate-300 mb-8 animate-pulse">
                            {activeTab === 'curated' ? <Search size={40} /> : <Inbox size={40} />}
                        </div>
                        <h2 className="text-2xl font-black text-[#0d0e0e] tracking-tight mb-2">
                            {activeTab === 'curated' ? 'No Visionaries Detected' : 'Clear Workspace'}
                        </h2>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
                            {activeTab === 'curated' ? 'The signal is clear but your roster is empty.' : 'All incoming expert signals have been processed.'}
                        </p>
                    </div>
                )}
            </div>

            {/* Deploy Expert Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
                        <button
                            onClick={() => {
                                setShowAddModal(false);
                                setEditingExpert(null);
                                setFormData({ name: '', title: '', company: '', bio: '', linkedin_url: '', photo_url: '' });
                            }}
                            className="absolute top-8 right-8 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="mb-10">
                            <div className="flex items-center gap-3 mb-2">
                                {editingExpert ? <Pencil size={16} className="text-[#1a27c9]" /> : <Plus size={16} className="text-[#1a27c9]" />}
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                                    {editingExpert ? 'Roster Modification' : 'Roster Expansion'}
                                </span>
                            </div>
                            <h2 className="text-4xl font-black text-[#0d0e0e] tracking-tight leading-none">
                                {editingExpert ? 'Edit' : 'Deploy'} <span className="text-[#1a27c9]">Expert</span>
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Name of visionary"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1a27c9]/5 focus:border-[#1a27c9] transition-premium"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Title / Role</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. CEO of Growth"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1a27c9]/5 focus:border-[#1a27c9] transition-premium"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Company / Organization</label>
                                <input
                                    type="text"
                                    placeholder="Entity representing"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1a27c9]/5 focus:border-[#1a27c9] transition-premium"
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Biography</label>
                                <textarea
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1a27c9]/5 focus:border-[#1a27c9] transition-premium min-h-[120px]"
                                    placeholder="Write a brief brief pulse on their history..."
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">LinkedIn URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://linkedin.com/in/..."
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1a27c9]/5 focus:border-[#1a27c9] transition-premium"
                                        value={formData.linkedin_url}
                                        onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Profile Photograph</label>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                placeholder="Upload photo or paste URL"
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1a27c9]/5 focus:border-[#1a27c9] transition-premium pr-12"
                                                value={formData.photo_url}
                                                onChange={e => setFormData({ ...formData, photo_url: e.target.value })}
                                            />
                                            {formData.photo_url && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                                    <Check size={12} />
                                                </div>
                                            )}
                                        </div>
                                        <label className="shrink-0 flex items-center justify-center w-14 h-14 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#1a27c9] hover:border-[#1a27c9] cursor-pointer transition-premium">
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                disabled={isUploading}
                                            />
                                            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-8 py-5 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-premium"
                                >
                                    Abort
                                </button>
                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="flex-[2] px-8 py-5 bg-[#1a27c9] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0d0e0e] shadow-2xl shadow-indigo-100 transition-premium flex items-center justify-center gap-3 active:scale-95"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>{editingExpert ? 'Synchronizing...' : 'Establishing Link...'}</span>
                                        </>
                                    ) : (
                                        <span>{editingExpert ? 'Update Expert' : 'Deploy to Roster'}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Preview Modal */}
            {showPreview && selectedSubmission && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[3rem] w-full max-w-4xl p-12 shadow-3xl relative overflow-hidden animate-in zoom-in duration-300">
                        <button
                            onClick={() => setShowPreview(false)}
                            className="absolute top-10 right-10 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Data Side */}
                            <div className="space-y-8">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1a27c9]">Data Verification</span>
                                    <h3 className="text-3xl font-black text-[#0d0e0e] tracking-tight mt-1">Submission Profile</h3>
                                </div>

                                <div className="space-y-4">
                                    {Object.entries({
                                        Name: selectedSubmission.expert_name,
                                        Title: selectedSubmission.title,
                                        Company: selectedSubmission.company,
                                        LinkedIn: selectedSubmission.linkedin_url,
                                        Bio: selectedSubmission.bio,
                                        ...selectedSubmission.additional_data
                                    }).map(([key, value]) => {
                                        if (!value || key === '_column_order') return null;
                                        return (
                                            <div key={key} className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">{key.replace(/_/g, ' ')}</span>
                                                <span className="text-sm font-bold text-slate-700 leading-relaxed block break-words">
                                                    {typeof value === 'object' ? JSON.stringify(value) : value}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Visual Side */}
                            <div className="bg-slate-50 rounded-[2.5rem] border border-slate-100 p-8 flex flex-col items-center justify-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">Component Preview</span>
                                <div className="scale-110">
                                    <ExpertCard
                                        expert={{
                                            name: selectedSubmission.expert_name,
                                            title: selectedSubmission.title,
                                            company: selectedSubmission.company,
                                            bio: selectedSubmission.bio,
                                            photo_url: selectedSubmission.photo_url
                                        }}
                                        previewMode={true}
                                    />
                                </div>
                                <p className="mt-8 text-[10px] font-black text-slate-300 uppercase tracking-widest">Live Agenda Mockup</p>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-slate-100 flex gap-4">
                            <button
                                disabled={actionLoading}
                                onClick={() => handleApproveExpert(selectedSubmission)}
                                className="flex-1 py-5 bg-[#1a27c9] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#0d0e0e] shadow-2xl shadow-indigo-100 transition-premium"
                            >
                                Confirm Roster Entry
                            </button>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="px-10 py-5 bg-white border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-premium text-slate-500"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpertManager;
