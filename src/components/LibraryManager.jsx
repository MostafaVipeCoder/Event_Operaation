import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, Plus, Search, Trash2, Edit2, Layout, Database, 
    AlertCircle, ExternalLink, BookOpen, Headphones, Video, 
    Link as LinkIcon, FileText, Upload, Check, X, Loader2, 
    MoreVertical, ChevronRight, Globe, Lock
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    getLibrarySections, createLibrarySection, updateLibrarySection, deleteLibrarySection,
    getLibraryResources, createLibraryResource, updateLibraryResource, deleteLibraryResource,
    uploadImage
} from '../lib/api';

const LibraryManager = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [sections, setSections] = useState([]);
    const [resources, setResources] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [showSectionModal, setShowSectionModal] = useState(false);
    const [showResourceModal, setShowResourceModal] = useState(false);
    const [showGlobalPool, setShowGlobalPool] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    
    const [editingSection, setEditingSection] = useState(null);
    const [editingResource, setEditingResource] = useState(null);
    
    const [sectionForm, setSectionForm] = useState({
        title_en: '',
        title_ar: '',
        sort_order: 0,
        is_central: !eventId
    });
    
    const [resourceForm, setResourceForm] = useState({
        section_id: '',
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
            const [sectionsData, resourcesData] = await Promise.all([
                getLibrarySections(eventId),
                getLibraryResources(eventId)
            ]);
            setSections(sectionsData || []);
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
    }, [eventId]);

    const handleSectionSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const isCentral = !eventId ? true : sectionForm.is_central;
            const payload = { 
                ...sectionForm, 
                is_central: isCentral,
                event_id: isCentral ? null : eventId 
            };
            
            if (editingSection) {
                await updateLibrarySection(editingSection.section_id, payload);
            } else {
                await createLibrarySection(payload);
            }
            setShowSectionModal(false);
            setEditingSection(null);
            setSectionForm({ title_en: '', title_ar: '', sort_order: 0, is_central: !eventId });
            loadData();
        } catch (err) {
            console.error('Error saving section:', err);
            alert('Failed to save section signal.');
        } finally {
            setIsSubmitting(false);
        }
    };

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
                section_id: '',
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
            const publicUrl = await uploadImage(file, `library/${eventId}/${typePath}`);
            setResourceForm(prev => ({ ...prev, url: publicUrl }));
        } catch (err) {
            console.error('Error uploading file:', err);
            alert('Failed to upload resource. Signal lost.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteSection = async (section) => {
        const isCentral = section.is_central;
        const msg = isCentral 
            ? 'WARNING: This is a CENTRAL SECTION. Deleting it will remove it from ALL events. Are you absolutely sure?' 
            : 'Are you sure? This will delete all resources in this section.';
        
        if (!confirm(msg)) return;

        // Optimistic update — remove from UI immediately
        const prevSections = sections;
        const prevResources = resources;
        setSections(prev => prev.filter(s => s.section_id !== section.section_id));
        setResources(prev => prev.filter(r => r.section_id !== section.section_id));

        try {
            await deleteLibrarySection(section.section_id);
            // Sync with server to ensure consistency
            loadData();
        } catch (err) {
            console.error('Error deleting section:', err);
            // Rollback on failure
            setSections(prevSections);
            setResources(prevResources);
            alert('Failed to delete section. Please try again.');
        }
    };

    const handleDeleteResource = async (resource) => {
        const isCentral = resource.is_central;
        const msg = isCentral 
            ? 'WARNING: This is a CENTRAL RESOURCE. Deleting it will remove it from ALL events. Are you absolutely sure?' 
            : 'Delete this resource?';
            
        if (!confirm(msg)) return;

        // Optimistic update — remove from UI immediately
        const prevResources = resources;
        setResources(prev => prev.filter(r => r.resource_id !== resource.resource_id));

        try {
            await deleteLibraryResource(resource.resource_id);
            // Sync with server to ensure consistency
            loadData();
        } catch (err) {
            console.error('Error deleting resource:', err);
            // Rollback on failure
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
                                    onClick={() => setShowSectionModal(true)}
                                    className="flex items-center gap-2 bg-white text-athar-blue border border-athar-blue/20 px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-athar-blue/5 transition-all shadow-sm active:scale-95"
                                >
                                    <Plus size={16} />
                                    <span>Add Section</span>
                                </button>
                                <button
                                    onClick={() => setShowResourceModal(true)}
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
                        {/* Sections & Resources */}
                        {sections.length === 0 && resources.length === 0 ? (
                            <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-slate-300">
                                <BookOpen size={64} className="mx-auto text-slate-200 mb-6" />
                                <h3 className="text-2xl font-black text-[#0d0e0e] uppercase mb-2">Empty Repository</h3>
                                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Start by adding a section or uploading resources.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-8">
                                {sections.map(section => (
                                    <div key={section.section_id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-premium">
                                        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-black text-[#0d0e0e] flex items-center gap-3">
                                                    <Layout size={18} className="text-[#1a27c9]" />
                                                    {section.title_en} / {section.title_ar}
                                                    {section.is_central && (
                                                        <span className="flex items-center gap-1 px-2 py-0.5 bg-athar-blue/10 text-athar-blue text-[8px] uppercase tracking-widest rounded-full border border-athar-blue/20">
                                                            <Globe size={10} />
                                                            Central Hub
                                                        </span>
                                                    )}
                                                </h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                    {section.is_central ? 'Global Repository Section' : 'Event Section Hub'}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingSection(section);
                                                        setSectionForm({
                                                            title_en: section.title_en,
                                                            title_ar: section.title_ar,
                                                            sort_order: section.sort_order,
                                                            is_central: section.is_central
                                                        });
                                                        setShowSectionModal(true);
                                                    }}
                                                    className="p-2.5 text-slate-400 hover:text-[#1a27c9] hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteSection(section)}
                                                    className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-white rounded-xl transition-all border border-transparent hover:border-slate-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4 sm:p-8">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {resources.filter(r => r.section_id === section.section_id).map(resource => (
                                                    <ResourceCard 
                                                        key={resource.resource_id} 
                                                        resource={resource}
                                                        onEdit={() => {
                                                            setEditingResource(resource);
                                                            setResourceForm(resource);
                                                            setShowResourceModal(true);
                                                        }}
                                                        onDelete={() => handleDeleteResource(resource)}
                                                        getIcon={getResourceIcon}
                                                    />
                                                ))}
                                                <button
                                                    onClick={() => {
                                                        setResourceForm(prev => ({ ...prev, section_id: section.section_id }));
                                                        setShowResourceModal(true);
                                                    }}
                                                    className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 hover:text-[#1a27c9] hover:border-[#1a27c9] hover:bg-[#1a27c9]/5 transition-all group"
                                                >
                                                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                                                    <span className="font-black text-[10px] uppercase tracking-widest">Add to Section</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Standalone/Central Resources */}
                                <div className="mt-8">
                                    <div className="flex items-center gap-4 mb-6 px-4">
                                        <div className="h-px flex-1 bg-slate-200" />
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Standalone & Central Resources</h4>
                                        <div className="h-px flex-1 bg-slate-200" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {resources.filter(r => !r.section_id).map(resource => (
                                            <ResourceCard 
                                                key={resource.resource_id} 
                                                resource={resource}
                                                onEdit={() => {
                                                    setEditingResource(resource);
                                                    setResourceForm(resource);
                                                    setShowResourceModal(true);
                                                }}
                                                onDelete={() => handleDeleteResource(resource)}
                                                getIcon={getResourceIcon}
                                            />
                                        ))}
                                    </div>
                                </div>
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
                                        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                            <button 
                                                onClick={() => {
                                                    setEditingResource(resource);
                                                    setResourceForm(resource);
                                                    setShowResourceModal(true);
                                                }}
                                                className="text-xs font-black text-athar-blue uppercase tracking-widest hover:underline flex items-center gap-2"
                                            >
                                                <Layout size={14} />
                                                Assign Section
                                            </button>
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
                                Total Global Assets: {resources.filter(r => r.is_central).length}
                            </p>
                            <button 
                                onClick={() => {
                                    setResourceForm(prev => ({ ...prev, is_central: true }));
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

            {/* Section Modal */}
            {showSectionModal && (
                <div className="fixed inset-0 bg-[#0d0e0e]/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl relative animate-in zoom-in duration-300">
                        <button onClick={() => setShowSectionModal(false)} className="absolute top-8 right-8 p-2 text-slate-400 hover:text-rose-500 transition-all">
                            <X size={20} />
                        </button>
                        <h2 className="text-2xl font-black text-[#0d0e0e] mb-8 uppercase tracking-tight">
                            {editingSection ? 'Edit' : 'Create'} <span className="text-[#1a27c9]">Section</span>
                        </h2>
                        <form onSubmit={handleSectionSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Title (English)</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1a27c9]/5 focus:border-[#1a27c9] transition-all"
                                    value={sectionForm.title_en}
                                    onChange={e => setSectionForm({...sectionForm, title_en: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2 text-right">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1">العنوان (عربي)</label>
                                <input
                                    required
                                    dir="rtl"
                                    type="text"
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1a27c9]/5 focus:border-[#1a27c9] transition-all"
                                    value={sectionForm.title_ar}
                                    onChange={e => setSectionForm({...sectionForm, title_ar: e.target.value})}
                                />
                            </div>

                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-athar-blue">
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#0d0e0e]">Central Hub Section</h4>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Appear across all programs</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    disabled={!eventId}
                                    onClick={() => setSectionForm({...sectionForm, is_central: !sectionForm.is_central})}
                                    className={`w-12 h-6 rounded-full transition-all relative ${sectionForm.is_central ? 'bg-[#1a27c9]' : 'bg-slate-200'} ${!eventId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${sectionForm.is_central ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>
                            <button
                                disabled={isSubmitting}
                                className="w-full py-4 bg-[#1a27c9] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-50"
                            >
                                {isSubmitting ? 'Syncing...' : 'Save Section'}
                            </button>
                        </form>
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
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Section</label>
                                    <select
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1a27c9]/5 focus:border-[#1a27c9] transition-all appearance-none"
                                        value={resourceForm.section_id}
                                        onChange={e => setResourceForm({...resourceForm, section_id: e.target.value})}
                                    >
                                        <option value="">No Section (Standalone)</option>
                                        {sections.map(s => <option key={s.section_id} value={s.section_id}>{s.title_en}</option>)}
                                    </select>
                                </div>
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

const ResourceCard = ({ resource, onEdit, onDelete, getIcon }) => (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-lg transition-all group relative">
        <div className="flex items-start justify-between gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                resource.resource_type === 'readable' ? 'bg-blue-50 text-blue-500' :
                resource.resource_type === 'audible' ? 'bg-purple-50 text-purple-500' :
                resource.resource_type === 'visual' ? 'bg-rose-50 text-rose-500' :
                'bg-emerald-50 text-emerald-500'
            }`}>
                {getIcon(resource.resource_type)}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onEdit} className="p-2 text-slate-400 hover:text-[#1a27c9] hover:bg-slate-50 rounded-lg transition-all">
                    <Edit2 size={14} />
                </button>
                <button onClick={onDelete} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-50 rounded-lg transition-all">
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
        <div className="mt-4">
            <h4 className="font-black text-[#0d0e0e] text-sm leading-tight line-clamp-2">{resource.title_en}</h4>
            <h4 className="font-bold text-slate-400 text-[10px] mt-1 line-clamp-1" dir="rtl">{resource.title_ar}</h4>
        </div>
        <div className="mt-4 flex items-center justify-between">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-1">
                {resource.is_central ? <Globe size={10} /> : <Lock size={10} />}
                {resource.is_central ? 'Central' : 'Local'}
            </span>
            <a 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#1a27c9] hover:underline flex items-center gap-1 text-[10px] font-black uppercase tracking-widest"
            >
                View <ExternalLink size={12} />
            </a>
        </div>
    </div>
);

export default LibraryManager;
