import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, Plus, Search, Trash2, Edit2, Layout, Database, 
    AlertCircle, ExternalLink, BookOpen, Headphones, Video, 
    Link as LinkIcon, FileText, Upload, Check, X, Loader2, 
    MoreVertical, ChevronRight, Globe, Lock
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    getLibraryResources, createLibraryResource, updateLibraryResource, deleteLibraryResource,
    uploadImage
} from '../lib/api';

const LibraryManager = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [resources, setResources] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [showResourceModal, setShowResourceModal] = useState(false);
    const [showGlobalPool, setShowGlobalPool] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    const [editingResource, setEditingResource] = useState(null);
    
    const [resourceForm, setResourceForm] = useState({
        title_en: '',
        title_ar: '',
        resource_type: 'readable', // readable, audible, visual, link
        url: '',
        is_central: !eventId,
        sort_order: 0
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const resourcesData = await getLibraryResources(eventId);
            setResources(resourcesData || []);
            setError(null);
        } catch (err) {
            console.error('Error loading library data:', err);
            setError('Failed to establish link with the Library Hub.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [eventId]);

    const handleResourceSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const isCentral = !eventId ? true : resourceForm.is_central;
            const payload = { 
                ...resourceForm, 
                is_central: isCentral,
                event_id: isCentral ? null : eventId
            };
            
            if (editingResource) {
                await updateLibraryResource(editingResource.resource_id, payload);
            } else {
                await createLibraryResource(payload);
            }
            setShowResourceModal(false);
            setEditingResource(null);
            setResourceForm({
                title_en: '',
                title_ar: '',
                resource_type: 'readable',
                url: '',
                is_central: !eventId,
                sort_order: 0
            });
            loadData();
        } catch (err) {
            console.error('Error saving resource:', err);
            alert('Failed to save resource vision.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setIsUploading(true);
            const typePath = resourceForm.resource_type === 'readable' ? 'docs' : 
                             resourceForm.resource_type === 'audible' ? 'audio' : 'videos';
            const publicUrl = await uploadImage(file, `library/${eventId || 'global'}/${typePath}`);
            setResourceForm(prev => ({ ...prev, url: publicUrl }));
        } catch (err) {
            console.error('Error uploading file:', err);
            alert('Failed to upload resource. Signal lost.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteResource = async (resource) => {
        const isCentral = resource.is_central;
        const msg = isCentral 
            ? 'WARNING: This is a CENTRAL RESOURCE. Deleting it will remove it from ALL events. Are you absolutely sure?' 
            : 'Delete this resource?';
            
        if (!confirm(msg)) return;

        const prevResources = resources;
        setResources(prev => prev.filter(r => r.resource_id !== resource.resource_id));

        try {
            await deleteLibraryResource(resource.resource_id);
            loadData();
        } catch (err) {
            console.error('Error deleting resource:', err);
            setResources(prevResources);
            alert('Failed to delete resource. Please try again.');
        }
    };

    const getResourceIcon = (type) => {
        switch (type) {
            case 'readable': return <FileText size={18} />;
            case 'audible': return <Headphones size={18} />;
            case 'visual': return <Video size={18} />;
            case 'link': return <LinkIcon size={18} />;
            default: return <BookOpen size={18} />;
        }
    };

    const filteredResources = resources.filter(r => 
        r.title_en.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.title_ar.includes(searchTerm)
    );

    const groupedResources = {
        readable: filteredResources.filter(r => r.resource_type === 'readable'),
        audible: filteredResources.filter(r => r.resource_type === 'audible'),
        visual: filteredResources.filter(r => r.resource_type === 'visual'),
        link: filteredResources.filter(r => r.resource_type === 'link'),
    };

    const renderResourceTable = (type, title, items) => {
        if (items.length === 0) return null;

        return (
            <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        type === 'readable' ? 'bg-blue-50 text-blue-500' :
                        type === 'audible' ? 'bg-purple-50 text-purple-500' :
                        type === 'visual' ? 'bg-rose-50 text-rose-500' :
                        'bg-emerald-50 text-emerald-500'
                    }`}>
                        {getResourceIcon(type)}
                    </div>
                    <h3 className="text-xl font-black text-[#0d0e0e] uppercase tracking-tight">
                        {title}
                    </h3>
                    <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {items.length} items
                    </span>
                </div>
                
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resource</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Scope</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">URL</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {items.map((resource) => (
                                <tr key={resource.resource_id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                                type === 'readable' ? 'bg-blue-50 text-blue-500' :
                                                type === 'audible' ? 'bg-purple-50 text-purple-500' :
                                                type === 'visual' ? 'bg-rose-50 text-rose-500' :
                                                'bg-emerald-50 text-emerald-500'
                                            }`}>
                                                {getResourceIcon(type)}
                                            </div>
                                            <div>
                                                <div className="font-black text-[#0d0e0e] text-sm group-hover:text-athar-blue transition-colors">
                                                    {resource.title_en}
                                                </div>
                                                <div className="text-[11px] font-bold text-slate-400 font-arabic mt-0.5" dir="rtl">
                                                    {resource.title_ar}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                            resource.is_central 
                                                ? 'bg-athar-blue/5 text-athar-blue border-athar-blue/10' 
                                                : 'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}>
                                            {resource.is_central ? <Globe size={10} /> : <Lock size={10} />}
                                            {resource.is_central ? 'Central' : 'Local'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="text-[10px] font-bold text-slate-400 font-mono truncate max-w-[200px]">
                                            {resource.url}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center justify-end gap-1">
                                            <a 
                                                href={resource.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="p-2 text-slate-400 hover:text-athar-black hover:bg-slate-100 rounded-lg transition-all"
                                                title="Open Resource"
                                            >
                                                <ExternalLink size={16} />
                                            </a>
                                            <button 
                                                onClick={() => {
                                                    setEditingResource(resource);
                                                    setResourceForm({
                                                        title_en: resource.title_en,
                                                        title_ar: resource.title_ar,
                                                        resource_type: resource.resource_type,
                                                        url: resource.url,
                                                        is_central: resource.is_central,
                                                        sort_order: resource.sort_order || 0
                                                    });
                                                    setShowResourceModal(true);
                                                }} 
                                                className="p-2 text-slate-400 hover:text-athar-blue hover:bg-blue-50 rounded-lg transition-all"
                                                title="Edit"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteResource(resource)} 
                                                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };


    return (
        <div className="min-h-screen bg-gray-200 font-manrope selection:bg-[#1a27c9]/10 selection:text-[#1a27c9]">
            {/* Header Area */}
            <div className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => navigate(eventId ? `/event/${eventId}` : '/')}
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#1a27c9] hover:border-[#1a27c9] hover:bg-white transition-premium group tap-target shrink-0"
                                >
                                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                </button>
                                <div>
                                    <h1 className="text-xl sm:text-3xl font-black text-[#0d0e0e] tracking-tight">Library Manager</h1>
                                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Resource Hub & Content Repository</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setShowGlobalPool(true)}
                                    className="flex items-center gap-2 bg-athar-yellow text-athar-black px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm active:scale-95"
                                >
                                    <Database size={16} />
                                    <span>Global Pool</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingResource(null);
                                        setResourceForm({
                                            title_en: '',
                                            title_ar: '',
                                            resource_type: 'readable',
                                            url: '',
                                            is_central: !eventId,
                                            sort_order: 0
                                        });
                                        setShowResourceModal(true);
                                    }}
                                    className="flex items-center gap-2 bg-[#1a27c9] text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl active:scale-95"
                                >
                                    <Plus size={16} />
                                    <span>Add Resource</span>
                                </button>
                            </div>
                        </div>

                        <div className="relative group w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1a27c9] transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search resources..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1a27c9]/5 focus:border-[#1a27c9] transition-premium w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-16 h-16 border-4 border-slate-100 border-t-[#1a27c9] rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Sourcing Repository Data...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xl">
                        <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
                        <h2 className="text-xl font-black text-[#0d0e0e] uppercase mb-2">Sync Error</h2>
                        <p className="text-slate-400 font-bold">{error}</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {resources.length === 0 ? (
                            <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-slate-300">
                                <BookOpen size={64} className="mx-auto text-slate-200 mb-6" />
                                <h3 className="text-2xl font-black text-[#0d0e0e] uppercase mb-2">Empty Repository</h3>
                                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Start by uploading resources.</p>
                            </div>
                        ) : (
                                <div>
                                    {renderResourceTable('readable', 'Readable Resources', groupedResources.readable)}
                                    {renderResourceTable('audible', 'Audible Resources', groupedResources.audible)}
                                    {renderResourceTable('visual', 'Visual Resources', groupedResources.visual)}
                                    {renderResourceTable('link', 'External Links', groupedResources.link)}
                                </div>
                        )}
                    </div>
                )}
            </div>

            {/* Global Pool Modal */}
            {showGlobalPool && (
                <div className="fixed inset-0 bg-[#0d0e0e]/60 backdrop-blur-xl flex items-center justify-center z-[150] p-4 sm:p-8">
                    <div className="bg-slate-50 rounded-[3rem] w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl relative animate-in slide-in-from-bottom duration-500 overflow-hidden border border-white/20">
                        <div className="p-8 sm:p-12 border-b border-slate-200 bg-white">
                            <button onClick={() => setShowGlobalPool(false)} className="absolute top-8 right-8 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all z-10">
                                <X size={24} />
                            </button>
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-athar-yellow rounded-[2rem] flex items-center justify-center text-athar-black shadow-lg shadow-athar-yellow/20">
                                    <Globe size={40} />
                                </div>
                                <div>
                                    <h2 className="text-3xl sm:text-4xl font-black text-[#0d0e0e] tracking-tighter uppercase">Central Hub <span className="text-athar-blue">Library</span></h2>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                                        <Database size={12} className="text-athar-blue" />
                                        Managing global assets across all programs
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-white/50">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {resources.filter(r => r.is_central).map(resource => (
                                    <div key={resource.resource_id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => {
                                                    setEditingResource(resource);
                                                    setResourceForm(resource);
                                                    setShowResourceModal(true);
                                                }}
                                                className="p-2 bg-slate-50 text-slate-400 hover:text-athar-blue rounded-lg transition-all"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        </div>
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-500 ${
                                            resource.resource_type === 'readable' ? 'bg-blue-50 text-blue-500' :
                                            resource.resource_type === 'audible' ? 'bg-purple-50 text-purple-500' :
                                            resource.resource_type === 'visual' ? 'bg-rose-50 text-rose-500' :
                                            'bg-emerald-50 text-emerald-500'
                                        }`}>
                                            {getResourceIcon(resource.resource_type)}
                                        </div>
                                        <h4 className="font-black text-[#0d0e0e] text-lg leading-tight line-clamp-2 min-h-[3.5rem]">{resource.title_en}</h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">
                                            Type: {resource.resource_type}
                                        </p>
                                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-end">
                                            <a href={resource.url} target="_blank" className="p-3 bg-slate-50 text-slate-400 hover:text-athar-black rounded-xl transition-all">
                                                <ExternalLink size={18} />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                                {resources.filter(r => r.is_central).length === 0 && (
                                    <div className="col-span-full py-20 text-center opacity-40">
                                        <Globe size={48} className="mx-auto mb-4" />
                                        <p className="font-black text-xs uppercase tracking-widest">No central resources deployed yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="p-8 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                Managing Global Knowledge Base
                            </p>
                            <button 
                                onClick={() => {
                                    setResourceForm({
                                        title_en: '',
                                        title_ar: '',
                                        resource_type: 'readable',
                                        url: '',
                                        is_central: true,
                                        sort_order: 0
                                    });
                                    setShowResourceModal(true);
                                }}
                                className="px-8 py-4 bg-athar-black text-athar-yellow rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1a27c9] hover:text-white transition-all shadow-xl"
                            >
                                Add Global Resource
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Resource Modal */}
            {showResourceModal && (
                <div className="fixed inset-0 bg-[#0d0e0e]/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-10 shadow-2xl relative animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowResourceModal(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-rose-500 transition-all">
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-black text-[#0d0e0e] mb-8 uppercase tracking-tight">
                            {editingResource ? 'Edit' : 'Deploy'} <span className="text-[#1a27c9]">Resource</span>
                        </h2>
                        <form onSubmit={handleResourceSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Media Type</label>
                                    <div className="flex gap-2 bg-slate-50 p-1 rounded-2xl border border-slate-100">
                                        {['readable', 'audible', 'visual', 'link'].map(type => (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => setResourceForm({...resourceForm, resource_type: type})}
                                                className={`flex-1 py-3 rounded-xl flex items-center justify-center transition-all ${resourceForm.resource_type === type ? 'bg-white text-[#1a27c9] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                title={type}
                                            >
                                                {getResourceIcon(type)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Title (EN)</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white transition-all"
                                        value={resourceForm.title_en}
                                        onChange={e => setResourceForm({...resourceForm, title_en: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2 text-right">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1">العنوان (AR)</label>
                                    <input
                                        required
                                        dir="rtl"
                                        type="text"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white transition-all"
                                        value={resourceForm.title_ar}
                                        onChange={e => setResourceForm({...resourceForm, title_ar: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    {resourceForm.resource_type === 'link' ? 'External Link URL' : 'File Source'}
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        required
                                        type="text"
                                        placeholder="https://..."
                                        className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white transition-all"
                                        value={resourceForm.url}
                                        onChange={e => setResourceForm({...resourceForm, url: e.target.value})}
                                    />
                                    {resourceForm.resource_type !== 'link' && (
                                        <div className="relative">
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={handleFileUpload}
                                                accept={
                                                    resourceForm.resource_type === 'readable' ? '.pdf,.doc,.docx,.txt' :
                                                    resourceForm.resource_type === 'audible' ? 'audio/*' : 'video/*'
                                                }
                                            />
                                            <button type="button" className="h-full px-6 bg-slate-100 text-[#1a27c9] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center gap-2">
                                                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                                Upload
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-athar-blue">
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#0d0e0e]">Central Resource</h4>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Available across all events</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    disabled={!eventId}
                                    onClick={() => setResourceForm({...resourceForm, is_central: !resourceForm.is_central})}
                                    className={`w-12 h-6 rounded-full transition-all relative ${resourceForm.is_central ? 'bg-[#1a27c9]' : 'bg-slate-200'} ${!eventId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${resourceForm.is_central ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            <button
                                disabled={isSubmitting || isUploading}
                                className="w-full py-4 bg-[#1a27c9] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-50"
                            >
                                {isSubmitting ? 'Syncing...' : 'Deploy Resource'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LibraryManager;

