import React, { useState, useEffect } from 'react';
import { 
    Users, Search, Filter, Plus, ArrowLeft, 
    Edit2, Trash2, ExternalLink, Linkedin, 
    Briefcase, User, Info, Check, X, AlertCircle,
    LayoutGrid, List
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMasterExperts, updateMasterExpert, deleteMasterExpert } from '../lib/api';
import { getGoogleDriveFallbackUrls } from '../lib/utils';
import LazyImage from './LazyImage';

export default function MasterExpertsList() {
    const navigate = useNavigate();
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [editingExpert, setEditingExpert] = useState(null);
    const [_error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const [showMobileSearch, setShowMobileSearch] = useState(false);

    useEffect(() => {
        loadExperts();
    }, []);

    const loadExperts = async () => {
        try {
            setLoading(true);
            const data = await getMasterExperts();
            setExperts(data || []);
        } catch (err) {
            console.error('Error loading master experts:', err);
            setError('Failed to load experts library.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateExpert = async (id, data) => {
        try {
            await updateMasterExpert(id, data);
            setSuccessMessage('تم تحديث بيانات الخبير بنجاح المزامنة جارية...');
            loadExperts();
            setEditingExpert(null);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            console.error('Error updating expert:', err);
            alert('Error updating expert');
        }
    };

    const handleDeleteExpert = async (id) => {
        if (!confirm('Are you sure? This will remove the expert from the library (existing event data will remain).')) return;
        try {
            await deleteMasterExpert(id);
            setExperts(prev => prev.filter(e => e.id !== id));
        } catch (_err) {
            alert('Error deleting expert');
        }
    };

    const filteredExperts = experts.filter(e => 
        e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.company?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background text-foreground font-manrope font-semibold">
            {/* Background Decoration */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-athar-blue/5 rounded-full blur-[100px] -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-athar-blue/5 rounded-full blur-[100px] -ml-64 -mb-64" />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-6 font-manrope font-semibold">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <button 
                                onClick={() => navigate('/')}
                                className="p-2 sm:p-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-premium"
                            >
                                <ArrowLeft size={18} className="sm:size-5" />
                            </button>
                            <div>
                                <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                                    <div className="bg-athar-blue p-1 rounded-lg sm:p-1.5">
                                        <Users className="text-white sm:size-[18px]" size={14} />
                                    </div>
                                    <h1 className="text-lg sm:text-2xl font-black tracking-tight">Athar Expert Networks</h1>
                                </div>
                                <p className="text-[10px] sm:text-sm text-muted-foreground font-semibold">Global Expert Library</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Desktop Search */}
                            <div className="hidden md:relative md:group md:block md:min-w-[300px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-athar-blue transition-colors" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Search experts..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-2.5 bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-athar-blue/20 focus:border-athar-blue transition-premium font-semibold"
                                />
                            </div>

                            {/* Mobile Search Toggle */}
                            <button 
                                onClick={() => setShowMobileSearch(!showMobileSearch)}
                                className={`md:hidden p-2.5 rounded-xl transition-all ${showMobileSearch ? 'bg-athar-blue text-white shadow-lg shadow-athar-blue/20' : 'bg-muted text-muted-foreground'}`}
                            >
                                <Search size={20} />
                            </button>
                            
                            <div className="h-8 w-px bg-border/50 mx-1 sm:mx-2" />
                            
                            <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50">
                                <button 
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 sm:p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-background text-athar-blue shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <LayoutGrid size={16} className="sm:size-[18px]" />
                                </button>
                                <button 
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 sm:p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-background text-athar-blue shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    <List size={16} className="sm:size-[18px]" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Expandable Mobile Search Bar */}
                    <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${showMobileSearch ? 'max-h-20 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input 
                                type="text"
                                placeholder="Search by name, title, or company..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-muted/80 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-athar-blue/20 focus:border-athar-blue transition-premium font-semibold text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <main className="relative z-10 max-w-[1600px] mx-auto px-6 py-10 font-manrope">
                {successMessage && (
                    <div className="mb-8 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 font-bold animate-in slide-in-from-top-4">
                        <Check size={20} />
                        {successMessage}
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-96 py-20">
                        <div className="relative mb-6">
                            <div className="h-16 w-16 border-4 border-athar-blue/10 border-t-athar-blue rounded-full animate-spin"></div>
                            <Users className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-athar-blue animate-pulse" size={24} />
                        </div>
                        <p className="text-xl font-bold text-muted-foreground">Synchronizing with library...</p>
                    </div>
                ) : filteredExperts.length === 0 ? (
                    <div className="text-center py-24 bg-muted/30 rounded-[2.5rem] border-2 border-dashed border-border/50">
                        <div className="bg-muted p-6 rounded-3xl w-fit mx-auto mb-6">
                            <Users size={48} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-black mb-2">No Experts Found</h3>
                        <p className="text-muted-foreground max-w-md mx-auto font-medium">
                            {searchTerm ? `No results for "${searchTerm}". Try different keywords.` : "Your global library is empty. Experts added to events will automatically appear here."}
                        </p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
                        {filteredExperts.map(expert => (
                            <ExpertCard 
                                key={expert.id} 
                                expert={expert} 
                                onEdit={() => setEditingExpert(expert)}
                                onDelete={() => handleDeleteExpert(expert.id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-card border border-border/50 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-muted/50 border-b border-border/50">
                                <tr>
                                    <th className="px-6 py-4 font-black">Expert</th>
                                    <th className="px-6 py-4 font-black">Professional Info</th>
                                    <th className="px-6 py-4 font-black">Bio</th>
                                    <th className="px-6 py-4 text-right font-black">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50 font-semibold">
                                {filteredExperts.map(expert => (
                                    <ExpertRow 
                                        key={expert.id} 
                                        expert={expert} 
                                        onEdit={() => setEditingExpert(expert)}
                                        onDelete={() => handleDeleteExpert(expert.id)}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Edit Modal */}
            {editingExpert && (
                <ExpertEditModal 
                    expert={editingExpert} 
                    onClose={() => setEditingExpert(null)} 
                    onSave={(data) => handleUpdateExpert(editingExpert.id, data)}
                />
            )}
        </div>
    );
}

function ExpertCard({ expert, onEdit, onDelete }) {
    return (
        <div className="group bg-card hover:bg-muted/40 border border-border/50 hover:border-athar-blue/30 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-premium relative flex flex-col h-full">
            <div className="p-3 sm:p-6 flex flex-col items-center text-center h-full">
                <div className="relative mb-3 sm:mb-4">
                    <div className="absolute inset-0 bg-athar-blue/20 blur-xl opacity-0 group-hover:opacity-100 rounded-full transition-opacity" />
                    <div className="h-16 w-16 sm:h-24 sm:w-24 relative">
                        <LazyImage
                            src={expert.photo_url ? getGoogleDriveFallbackUrls(expert.photo_url)[0] : null}
                            urls={expert.photo_url ? getGoogleDriveFallbackUrls(expert.photo_url) : []}
                            alt={expert.name}
                            objectFit="cover"
                            className="rounded-xl sm:rounded-2xl border-2 border-background shadow-md group-hover:scale-105 transition-transform"
                            fallback={
                                <div className="h-full w-full rounded-xl sm:rounded-2xl bg-muted border-2 border-background flex items-center justify-center text-muted-foreground shadow-sm">
                                    <User size={24} className="sm:size-8" />
                                </div>
                            }
                        />
                    </div>
                </div>
                
                <h3 className="text-sm sm:text-xl font-black tracking-tight mb-0.5 sm:mb-1 line-clamp-1">{expert.name}</h3>
                <p className="text-[10px] sm:text-sm font-bold text-athar-blue mb-2 sm:mb-3 line-clamp-1">{expert.title || 'Expert'}</p>
                <div className="flex items-center gap-1 sm:gap-1.5 text-[8px] sm:text-xs font-bold text-muted-foreground bg-muted/50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-border/50 mb-3 sm:mb-4 max-w-full">
                    <Briefcase size={10} className="sm:size-3" />
                    <span className="line-clamp-1">{expert.company || 'Private'}</span>
                </div>
                
                <p className="hidden sm:block text-sm text-center text-muted-foreground line-clamp-2 mb-6 flex-grow leading-relaxed font-semibold">
                    {expert.bio || 'No biography available.'}
                </p>
                
                <div className="w-full pt-3 sm:pt-4 border-t border-border/50 flex items-center justify-between mt-auto">
                    <div className="flex gap-1 sm:gap-2">
                        {expert.linkedin_url && (
                            <a 
                                href={expert.linkedin_url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="p-1.5 sm:p-2 text-muted-foreground hover:text-[#0077b5] hover:bg-[#0077b5]/10 rounded-lg transition-colors border border-transparent hover:border-[#0077b5]/20"
                            >
                                <Linkedin size={14} className="sm:size-[18px]" />
                            </a>
                        )}
                        <button className="hidden sm:block p-2 text-muted-foreground hover:text-athar-blue hover:bg-athar-blue/10 rounded-lg transition-colors border border-transparent hover:border-athar-blue/20">
                            <Info size={18} />
                        </button>
                    </div>
                    <div className="flex gap-1 sm:gap-2">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="p-1.5 sm:p-2 text-muted-foreground hover:text-athar-blue hover:bg-athar-blue/10 rounded-lg transition-colors border border-transparent hover:border-athar-blue/20"
                        >
                            <Edit2 size={14} className="sm:size-[18px]" />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="p-1.5 sm:p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors border border-transparent hover:border-destructive/20"
                        >
                            <Trash2 size={14} className="sm:size-[18px]" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ExpertRow({ expert, onEdit, onDelete }) {
    return (
        <tr className="hover:bg-muted/30 transition-colors group">
            <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 relative shrink-0">
                        <LazyImage
                            src={expert.photo_url ? getGoogleDriveFallbackUrls(expert.photo_url)[0] : null}
                            urls={expert.photo_url ? getGoogleDriveFallbackUrls(expert.photo_url) : []}
                            alt=""
                            objectFit="cover"
                            className="rounded-xl shadow-sm group-hover:scale-105 transition-transform"
                            fallback={
                                <div className="h-full w-full rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                                    <User size={20} />
                                </div>
                            }
                        />
                    </div>
                    <div>
                        <div className="font-black text-sm tracking-tight">{expert.name}</div>
                        {expert.linkedin_url && (
                            <a href={expert.linkedin_url} target="_blank" rel="noreferrer" className="text-xs text-athar-blue font-bold flex items-center gap-1 mt-1 hover:underline">
                                <Linkedin size={10} /> LinkedIn Profile
                            </a>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="text-sm font-bold">{expert.title}</div>
                <div className="text-xs text-muted-foreground font-semibold mt-1 flex items-center gap-1">
                    <Briefcase size={10} /> {expert.company}
                </div>
            </td>
            <td className="px-6 py-4 max-w-md">
                <p className="text-sm text-muted-foreground line-clamp-1 italic leading-relaxed font-semibold">
                    {expert.bio || '---'}
                </p>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                    <button onClick={onEdit} className="p-2 text-muted-foreground hover:text-athar-blue hover:bg-athar-blue/10 rounded-lg border border-transparent hover:border-athar-blue/20 transition-all">
                        <Edit2 size={18} />
                    </button>
                    <button onClick={onDelete} className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg border border-transparent hover:border-destructive/20 transition-all">
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
}

function ExpertEditModal({ expert, onClose, onSave }) {
    const [formData, setFormData] = useState({ ...expert });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-athar-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
            
            <div className="relative bg-card text-card-foreground w-full max-w-2xl rounded-[2.5rem] border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="px-8 pt-8 pb-4 flex items-center justify-between border-b border-border/50 font-manrope">
                    <h3 className="text-2xl font-black flex items-center gap-2">
                        <Edit2 className="text-athar-blue" size={24} />
                        Update Global Profile
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors"><X size={24} /></button>
                </div>
                
                <div className="p-8 max-h-[70vh] overflow-y-auto no-scrollbar grid grid-cols-1 md:grid-cols-2 gap-6 font-manrope">
                    <div className="col-span-full bg-athar-blue/5 p-4 rounded-2xl border border-athar-blue/10 flex items-start gap-4 mb-2">
                        <Info className="text-athar-blue mt-1 shrink-0" size={20} />
                        <p className="text-sm font-bold text-athar-blue leading-relaxed">
                            تنبيه: التعديلات هنا ستؤثر فوراً على جميع الايفنتات المرتبطة بهذا الخبير. استخدم هذا لتحديث المعلومات المهنية الدائمة.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Expert Name</label>
                        <input 
                            type="text" 
                            className="w-full px-5 py-4 bg-muted border border-transparent rounded-2xl focus:border-athar-blue focus:ring-4 focus:ring-athar-blue/5 outline-none transition-all font-bold"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 font-arabic">اسم الخبير (بالعربية)</label>
                        <input 
                            type="text" 
                            dir="rtl"
                            className="w-full px-5 py-4 bg-muted border border-transparent rounded-2xl focus:border-athar-blue focus:ring-4 focus:ring-athar-blue/5 outline-none transition-all font-bold font-arabic"
                            value={formData.name_ar}
                            onChange={(e) => setFormData({...formData, name_ar: e.target.value})}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Photo URL</label>
                        <input 
                            type="text" 
                            className="w-full px-5 py-4 bg-muted border border-transparent rounded-2xl focus:border-athar-blue focus:ring-4 focus:ring-athar-blue/5 outline-none transition-all font-bold"
                            value={formData.photo_url}
                            onChange={(e) => setFormData({...formData, photo_url: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2 hidden md:block">
                        {/* Spacer for alignment */}
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Job Title</label>
                        <input 
                            type="text" 
                            className="w-full px-5 py-4 bg-muted border border-transparent rounded-2xl focus:border-athar-blue focus:ring-4 focus:ring-athar-blue/5 outline-none transition-all font-bold"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 font-arabic">المسمى الوظيفي (بالعربية)</label>
                        <input 
                            type="text" 
                            dir="rtl"
                            className="w-full px-5 py-4 bg-muted border border-transparent rounded-2xl focus:border-athar-blue focus:ring-4 focus:ring-athar-blue/5 outline-none transition-all font-bold font-arabic"
                            value={formData.title_ar}
                            onChange={(e) => setFormData({...formData, title_ar: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Company</label>
                        <input 
                            type="text" 
                            className="w-full px-5 py-4 bg-muted border border-transparent rounded-2xl focus:border-athar-blue focus:ring-4 focus:ring-athar-blue/5 outline-none transition-all font-bold"
                            value={formData.company}
                            onChange={(e) => setFormData({...formData, company: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 font-arabic">الشركة (بالعربية)</label>
                        <input 
                            type="text" 
                            dir="rtl"
                            className="w-full px-5 py-4 bg-muted border border-transparent rounded-2xl focus:border-athar-blue focus:ring-4 focus:ring-athar-blue/5 outline-none transition-all font-bold font-arabic"
                            value={formData.company_ar}
                            onChange={(e) => setFormData({...formData, company_ar: e.target.value})}
                        />
                    </div>

                    <div className="col-span-full space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">LinkedIn Profile</label>
                        <input 
                            type="text" 
                            className="w-full px-5 py-4 bg-muted border border-transparent rounded-2xl focus:border-athar-blue focus:ring-4 focus:ring-athar-blue/5 outline-none transition-all font-bold"
                            value={formData.linkedin_url}
                            onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Biography</label>
                        <textarea 
                            rows={4}
                            className="w-full px-5 py-4 bg-muted border border-transparent rounded-2xl focus:border-athar-blue focus:ring-4 focus:ring-athar-blue/5 outline-none transition-all font-bold resize-none"
                            value={formData.bio}
                            onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1 font-arabic">السيرة الذاتية (بالعربية)</label>
                        <textarea 
                            dir="rtl"
                            rows={4}
                            className="w-full px-5 py-4 bg-muted border border-transparent rounded-2xl focus:border-athar-blue focus:ring-4 focus:ring-athar-blue/5 outline-none transition-all font-bold resize-none font-arabic"
                            value={formData.bio_ar}
                            onChange={(e) => setFormData({...formData, bio_ar: e.target.value})}
                        />
                    </div>
                </div>

                <div className="p-8 border-t border-border/50 bg-muted/30 flex gap-4 font-manrope">
                    <button onClick={onClose} className="flex-1 px-6 py-4 rounded-2xl font-bold bg-white text-foreground hover:bg-muted border border-border/50 shadow-sm transition-premium">Cancel</button>
                    <button 
                        onClick={() => onSave(formData)}
                        className="flex-[2] bg-athar-blue text-white px-6 py-4 rounded-2xl font-bold hover:bg-athar-blue/90 shadow-lg shadow-athar-blue/20 transition-premium"
                    >
                        Save & Sync Everywhere
                    </button>
                </div>
            </div>
        </div>
    );
}
