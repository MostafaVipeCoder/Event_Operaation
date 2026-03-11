import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Trash2, Edit2, Layout, Database, AlertCircle, ExternalLink, Users, Inbox, Clock, Eye, CheckCircle, XCircle, Loader2, Pencil, Upload, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import CompanyCard from './CompanyCard';
import SyncButton from './SyncButton';
import { getCompanies, createCompany, updateCompany, deleteCompany, uploadImage, getSubmissions, approveSubmission, rejectSubmission } from '../lib/api';

const StartupManager = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [editingCompany, setEditingCompany] = useState(null);
    const [activeTab, setActiveTab] = useState('curated'); // 'curated' | 'review'
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        description: '',
        website_url: '',
        logo_url: ''
    });

    const loadData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'curated') {
                const data = await getCompanies(eventId);
                setCompanies(data || []);
            } else {
                const data = await getSubmissions(eventId, 'company', 'pending');
                setSubmissions(data || []);
            }
            setError(null);
        } catch (err) {
            console.error('Error loading data:', err);
            setError(`Failed to fetch ${activeTab === 'curated' ? 'Company Grid' : 'Review Pulse'}.`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [eventId, activeTab]);

    const handleEdit = (company) => {
        setEditingCompany(company);
        setFormData({
            name: company.name || '',
            industry: company.industry || '',
            description: company.description || '',
            website_url: company.website_url || '',
            logo_url: company.logo_url || ''
        });
        setShowAddModal(true);
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const publicUrl = await uploadImage(file, `companies/${eventId}`);
            setFormData(prev => ({ ...prev, logo_url: publicUrl }));
        } catch (err) {
            console.error('Error uploading logo:', err);
            alert('Failed to upload logo. Signal lost.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleApproveCompany = async (submission) => {
        try {
            setActionLoading(submission.submission_id);
            await approveSubmission(submission.submission_id, 'company');
            setSubmissions(prev => prev.filter(s => s.submission_id !== submission.submission_id));
            loadData(); // Reload companies to show the newly approved one
            alert('Company approved and added to ecosystem! ✅');
        } catch (error) {
            console.error('Error approving company:', error);
            alert('Failed to approve registration pulse.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectCompany = async (submission) => {
        const reason = prompt('Reason for rejection? (Optional)');
        if (reason === null) return;

        try {
            setActionLoading(submission.submission_id);
            await rejectSubmission(submission.submission_id, 'company', reason || 'Not specified');
            setSubmissions(prev => prev.filter(s => s.submission_id !== submission.submission_id));
            alert('Registration request rejected.');
        } catch (error) {
            console.error('Error rejecting company:', error);
            alert('Failed to block registration signal.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteCompany = async (companyId) => {
        try {
            await deleteCompany(companyId);
            loadData();
        } catch (err) {
            console.error('Error deleting company:', err);
            alert('Failed to delete venture from the grid.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            if (editingCompany) {
                await updateCompany(editingCompany.company_id || editingCompany.id, {
                    ...formData,
                    event_id: eventId
                });
            } else {
                await createCompany({
                    ...formData,
                    event_id: eventId
                });
            }
            setShowAddModal(false);
            setEditingCompany(null);
            setFormData({ name: '', industry: '', description: '', website_url: '', logo_url: '' });
            loadData();
        } catch (err) {
            console.error('Error saving startup:', err);
            alert('Failed to save venture.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredCompanies = companies.filter(company =>
        company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100 font-manrope selection:bg-[#059669]/10 selection:text-[#059669]">
            {/* Header Area */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => navigate(`/event/${eventId}`)}
                                className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#059669] hover:border-[#059669] hover:bg-white transition-premium group"
                            >
                                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-black text-[#0d0e0e] tracking-tight">Venture Grid</h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Populate your events ecosystem</p>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
                            <button
                                onClick={() => setActiveTab('curated')}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'curated'
                                    ? 'bg-white text-[#059669] shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                <Layout size={16} />
                                Company Grid
                            </button>
                            <button
                                onClick={() => setActiveTab('review')}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'review'
                                    ? 'bg-white text-[#059669] shadow-sm'
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
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#059669] transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Find ventures..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:border-[#059669] transition-premium w-full md:w-64"
                                />
                            </div>
                            <SyncButton
                                eventId={eventId}
                                onSyncComplete={loadData}
                                className="md:w-auto h-[54px]"
                            />
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-3 bg-[#059669] text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#0d0e0e] hover:shadow-2xl hover:shadow-emerald-200 transition-premium group active:scale-95"
                            >
                                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                                <span>Add Venture</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-700">
                        <div className="w-20 h-20 border-4 border-slate-100 border-t-[#059669] rounded-full animate-spin mb-8"></div>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">Scanning Ecosystem...</p>
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
                ) : activeTab === 'curated' ? (
                    filteredCompanies.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCompanies.map(company => (
                                <CompanyCard
                                    key={company.company_id || company.id}
                                    company={company}
                                    onEdit={handleEdit}
                                    onDelete={handleDeleteCompany}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 mb-6 border border-slate-100">
                                <Database size={32} />
                            </div>
                            <h3 className="text-xl font-black text-[#0d0e0e] tracking-tight mb-2 uppercase">Zero Signal</h3>
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No ventures detected in this quadrant.</p>
                        </div>
                    )
                ) : (
                    /* Review Desk View */
                    <div className="space-y-6">
                        {submissions.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {submissions.map((submission) => (
                                    <div key={submission.submission_id} className="bg-white rounded-[2rem] border border-slate-100 p-8 hover:shadow-xl transition-premium group relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#059669] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                            <div className="flex items-center gap-6 flex-1">
                                                <div className="relative w-24 h-24 rounded-[1.5rem] overflow-hidden bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform flex-shrink-0">
                                                    {submission.logo_url ? (
                                                        <img src={submission.logo_url} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                            <Database size={40} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                                        <h3 className="text-2xl font-black text-[#0d0e0e] tracking-tight">{submission.startup_name}</h3>
                                                        <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-1.5">
                                                            <Clock size={12} />
                                                            Pending Pulse
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-slate-400 uppercase tracking-widest">
                                                        <span>{submission.industry || 'Tech'}</span>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                                        <span>{submission.location || 'Remote'}</span>
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                                        <span className="text-[#059669]">{new Date(submission.submitted_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3">
                                                <button
                                                    onClick={() => {
                                                        setSelectedSubmission(submission);
                                                        setShowPreview(true);
                                                    }}
                                                    className="px-6 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-premium flex items-center gap-2 border border-transparent hover:border-slate-200"
                                                >
                                                    <Eye size={16} />
                                                    Inspect
                                                </button>
                                                <button
                                                    onClick={() => handleApproveCompany(submission)}
                                                    disabled={actionLoading === submission.submission_id}
                                                    className="px-6 py-4 bg-[#059669] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#0d0e0e] hover:shadow-lg hover:shadow-emerald-200 transition-premium flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    {actionLoading === submission.submission_id ? (
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <CheckCircle size={16} />
                                                    )}
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRejectCompany(submission)}
                                                    disabled={actionLoading === submission.submission_id}
                                                    className="px-6 py-4 bg-white text-rose-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 border border-slate-100 hover:border-rose-100 transition-premium flex items-center gap-2 disabled:opacity-50"
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
                            <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[3rem] border border-slate-100 border-dashed">
                                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mb-6">
                                    <Inbox size={32} />
                                </div>
                                <h3 className="text-xl font-black text-[#0d0e0e] tracking-tight mb-2 uppercase">Inbox Balanced</h3>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No pending ventures awaiting your signal.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Deploy Startup Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
                        <button
                            onClick={() => {
                                setShowAddModal(false);
                                setEditingCompany(null);
                                setFormData({ name: '', industry: '', description: '', website_url: '', logo_url: '' });
                            }}
                            className="absolute top-8 right-8 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <div className="mb-10">
                            <div className="flex items-center gap-3 mb-2">
                                {editingCompany ? <Pencil size={16} className="text-[#059669]" /> : <Plus size={16} className="text-[#059669]" />}
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                                    {editingCompany ? 'Venture Modification' : 'Venture Deployment'}
                                </span>
                            </div>
                            <h2 className="text-4xl font-black text-[#0d0e0e] tracking-tight leading-none">
                                {editingCompany ? 'Edit' : 'Deploy'} <span className="text-[#059669]">Startup</span>
                            </h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Startup Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Name of venture"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:border-[#059669] transition-premium"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Industry / Sector</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Fintech, AI"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:border-[#059669] transition-premium"
                                        value={formData.industry}
                                        onChange={e => setFormData({ ...formData, industry: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                                <textarea
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:border-[#059669] transition-premium min-h-[120px]"
                                    placeholder="Describe the disruptive potential..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Website URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://startup.io"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:border-[#059669] transition-premium"
                                        value={formData.website_url}
                                        onChange={e => setFormData({ ...formData, website_url: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Company Logo</label>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                placeholder="Upload logo or paste URL"
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#059669]/5 focus:border-[#059669] transition-premium pr-12"
                                                value={formData.logo_url}
                                                onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                                            />
                                            {formData.logo_url && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                                    <Check size={12} />
                                                </div>
                                            )}
                                        </div>
                                        <label className="shrink-0 flex items-center justify-center w-14 h-14 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-[#059669] hover:border-[#059669] cursor-pointer transition-premium">
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
                                    className="flex-[2] px-8 py-5 bg-[#059669] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#0d0e0e] shadow-2xl shadow-emerald-100 transition-premium flex items-center justify-center gap-3 active:scale-95"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>{editingCompany ? 'Synchronizing...' : 'Deploying Venture...'}</span>
                                        </>
                                    ) : (
                                        <span>{editingCompany ? 'Update Startup' : 'Deploy to Ecosystem'}</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Submission Details Preview Modal */}
            {showPreview && selectedSubmission && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#0d0e0e]/40 backdrop-blur-md" onClick={() => setShowPreview(false)} />
                    <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl relative overflow-hidden animate-in zoom-in duration-300">
                        <div className="h-24 bg-gradient-to-r from-[#059669] to-[#10b981]" />
                        <div className="p-12 -mt-12">
                            <div className="flex justify-between items-start mb-10">
                                <div className="p-2 bg-white rounded-[2rem] shadow-xl">
                                    <div className="w-24 h-24 rounded-[1.5rem] bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                                        {selectedSubmission.logo_url ? (
                                            <img src={selectedSubmission.logo_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Database size={40} className="text-slate-200" />
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-premium"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <div className="mb-8">
                                <h2 className="text-3xl font-black text-[#0d0e0e] tracking-tight mb-2">{selectedSubmission.startup_name}</h2>
                                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                    <Clock size={14} /> Submitting Pulse from Form Link
                                </p>
                            </div>

                            <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-4 custom-scrollbar mb-10">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 bg-slate-50 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Industry</p>
                                        <p className="font-bold text-[#0d0e0e]">{selectedSubmission.industry || 'Not Specified'}</p>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-2xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Location</p>
                                        <p className="font-bold text-[#0d0e0e]">{selectedSubmission.location || 'Not Specified'}</p>
                                    </div>
                                </div>
                                {selectedSubmission.additional_data && (
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black text-[#059669] uppercase tracking-[0.2em]">Transmission Payload</p>
                                        <div className="grid grid-cols-1 gap-3">
                                            {Object.entries(selectedSubmission.additional_data).map(([key, value]) => {
                                                if (key === '_column_order' || typeof value === 'object') return null;
                                                return (
                                                    <div key={key} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{key.replace(/_/g, ' ')}</p>
                                                        <p className="font-bold text-[#0d0e0e] break-words">{String(value)}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        handleApproveCompany(selectedSubmission);
                                        setShowPreview(false);
                                    }}
                                    className="flex-1 py-5 bg-[#059669] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#0d0e0e] transition-premium shadow-xl shadow-emerald-200/50"
                                >
                                    Authorize Entry
                                </button>
                                <button
                                    onClick={() => {
                                        handleRejectCompany(selectedSubmission);
                                        setShowPreview(false);
                                    }}
                                    className="px-10 py-5 bg-white text-rose-500 border border-slate-100 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-50 transition-premium"
                                >
                                    Block
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StartupManager;
