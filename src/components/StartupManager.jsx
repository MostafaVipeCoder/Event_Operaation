import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Loader2, AlertCircle, X, Pencil, Upload, Check } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import CompanyCard from './CompanyCard';
import SyncButton from './SyncButton';
import { getCompanies, createCompany, updateCompany, deleteCompany, uploadImage } from '../lib/api';

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

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        industry: '',
        description: '',
        website_url: '',
        logo_url: ''
    });

    const loadCompanies = async () => {
        try {
            setLoading(true);
            const data = await getCompanies(eventId);
            setCompanies(data || []);
            setError(null);
        } catch (err) {
            console.error('Error loading companies:', err);
            setError('Failed to establish link with Ecosystem Grid.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCompanies();
    }, [eventId]);

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

    const handleDeleteCompany = async (companyId) => {
        try {
            await deleteCompany(companyId);
            loadCompanies();
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
            loadCompanies();
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
        <div className="min-h-screen bg-gray-200 font-manrope selection:bg-[#1a27c9]/10 selection:text-[#1a27c9]">
            {/* Header Area */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-30">
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
                                <h1 className="text-3xl font-black text-[#0d0e0e] tracking-tight">Companies List</h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Nurturing the next wave of disruption</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1a27c9] transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search startups..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1a27c9]/5 focus:border-[#1a27c9] transition-premium w-full md:w-64"
                                />
                            </div>
                            <SyncButton
                                eventId={eventId}
                                onSyncComplete={loadCompanies}
                                className="md:w-auto h-[54px]"
                            />
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-3 bg-[#1a27c9] text-white px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-[#0d0e0e] hover:shadow-2xl hover:shadow-indigo-200 transition-premium group active:scale-95"
                            >
                                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                                <span>Add Company  </span>
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
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">Establishing Ecosystem Signal...</p>
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
                ) : filteredCompanies.length > 0 ? (
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
                        <div className="w-24 h-24 bg-white border-2 border-dashed border-slate-200 rounded-[2rem] flex items-center justify-center text-slate-300 mb-8 animate-pulse">
                            <Search size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-[#0d0e0e] tracking-tight mb-2">No Ventures Detected</h2>
                        <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">The ecosystem is fertile but your roadmap is empty.</p>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="mt-8 text-[#1a27c9] font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-70 transition-premium"
                        >
                            Reset Ecosystem Search
                        </button>
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
                                {editingCompany ? <Pencil size={16} className="text-[#1a27c9]" /> : <Plus size={16} className="text-[#1a27c9]" />}
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                                    {editingCompany ? 'Venture Modification' : 'Venture Deployment'}
                                </span>
                            </div>
                            <h2 className="text-4xl font-black text-[#0d0e0e] tracking-tight leading-none">
                                {editingCompany ? 'Edit' : 'Deploy'} <span className="text-[#1a27c9]">Startup</span>
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
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1a27c9]/5 focus:border-[#1a27c9] transition-premium"
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
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1a27c9]/5 focus:border-[#1a27c9] transition-premium"
                                        value={formData.industry}
                                        onChange={e => setFormData({ ...formData, industry: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
                                <textarea
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1a27c9]/5 focus:border-[#1a27c9] transition-premium min-h-[120px]"
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
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1a27c9]/5 focus:border-[#1a27c9] transition-premium"
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
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1a27c9]/5 focus:border-[#1a27c9] transition-premium pr-12"
                                                value={formData.logo_url}
                                                onChange={e => setFormData({ ...formData, logo_url: e.target.value })}
                                            />
                                            {formData.logo_url && (
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
        </div>
    );
};

export default StartupManager;
