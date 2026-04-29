import React, { useState, useEffect } from 'react';
import { 
    FileText, ExternalLink, Search, Layout, 
    Globe, Lock, ArrowRight, Headphones, Video,
    Database, BookOpen, Link as LinkIcon
} from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getLibraryData } from '../lib/api';
import { translations } from '../lib/translations';

const LibraryViewer = () => {
    const { eventId } = useParams();
    const [searchParams] = useSearchParams();
    const lang = searchParams.get('lang') === 'ar' ? 'ar' : 'en';
    const isRtl = lang === 'ar';

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ resources: [] });
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const t = translations.LibraryViewer[lang];

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const result = await getLibraryData(eventId);
                setData(result);
            } catch (error) {
                console.error('Error loading library:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [eventId]);

    const filteredResources = data.resources.filter(r => {
        const matchesSearch = (r.title_en?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                             (r.title_ar || '').includes(searchTerm);
        const matchesTab = activeTab === 'all' || r.resource_type === activeTab;
        return matchesSearch && matchesTab;
    });

    const getIcon = (type, size = 20) => {
        switch (type) {
            case 'readable': return <FileText size={size} />;
            case 'audible': return <Headphones size={size} />;
            case 'visual': return <Video size={size} />;
            case 'link': return <LinkIcon size={size} />;
            default: return <BookOpen size={size} />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'readable': return 'text-blue-500 bg-blue-50';
            case 'audible': return 'text-purple-500 bg-purple-50';
            case 'visual': return 'text-rose-500 bg-rose-50';
            case 'link': return 'text-emerald-500 bg-emerald-50';
            default: return 'text-slate-500 bg-slate-50';
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-athar-blue rounded-full animate-spin mb-4"></div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">{t.loading}</p>
            </div>
        );
    }

    const renderResourceTable = (resources) => (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead>
                        <tr className={isRtl ? 'text-right' : 'text-left'}>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.table.title}</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">{t.table.source}</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{t.table.access}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 bg-white/50">
                        {resources.map((resource) => (
                            <tr key={resource.resource_id} className="group hover:bg-white transition-colors">
                                <td className="px-6 py-5">
                                    <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getTypeColor(resource.resource_type)}`}>
                                            {getIcon(resource.resource_type, 18)}
                                        </div>
                                        <div className={isRtl ? 'text-right' : 'text-left'}>
                                            <div className="text-sm font-black text-[#0d0e0e] group-hover:text-athar-blue transition-colors">
                                                {isRtl ? (resource.title_ar || resource.title_en) : (resource.title_en || resource.title_ar)}
                                            </div>
                                            {isRtl && resource.title_en && resource.title_en !== resource.title_ar && (
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{resource.title_en}</div>
                                            )}
                                            {!isRtl && resource.title_ar && resource.title_ar !== resource.title_en && (
                                                <div className="text-[10px] font-bold text-slate-400 font-arabic">{resource.title_ar}</div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5 hidden sm:table-cell">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                        resource.is_central 
                                            ? 'bg-athar-blue/5 text-athar-blue border border-athar-blue/10' 
                                            : 'bg-emerald-50 text-emerald-500 border border-emerald-100'
                                    }`}>
                                        {resource.is_central ? <Globe size={10} /> : <Lock size={10} />}
                                        {resource.is_central ? t.global : t.eventSpecific}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <a 
                                        href={resource.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-athar-blue hover:text-white transition-all shadow-sm"
                                        title={t.access}
                                    >
                                        <ExternalLink size={16} />
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen bg-slate-50 relative overflow-hidden font-manrope ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Background Texture & Glow */}
            <div 
                className="absolute inset-0 z-0 pointer-events-none mix-blend-soft-light opacity-20 dark:opacity-10"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            ></div>
            <div className={`absolute top-0 ${isRtl ? 'left-0' : 'right-0'} w-full h-[500px] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-athar-blue/10 via-slate-50 to-slate-50 pointer-events-none -z-10`}></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 relative z-10 animate-in fade-in duration-700">
                {/* Library Header */}
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-athar-blue/5 rounded-full mb-6 border border-athar-blue/10 shadow-sm">
                        <BookOpen size={16} className="text-athar-blue" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-athar-blue">{t.badge}</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black text-[#0d0e0e] tracking-tight mb-4 uppercase">
                        {t.title} <span className="text-athar-blue">{t.hub}</span>
                    </h2>
                    <p className="text-slate-400 font-bold max-w-2xl mx-auto text-sm sm:text-base px-4">
                        {t.subtitle}
                    </p>
                </div>

                {/* Controls */}
                <div className={`flex flex-col md:flex-row gap-6 mb-12 items-center justify-between bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm ${isRtl ? 'flex-row-reverse' : ''}`}>
                    {/* Search */}
                    <div className="relative w-full md:max-w-md group">
                        <Search className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-athar-blue transition-colors`} size={18} />
                        <input
                            type="text"
                            placeholder={t.search}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full ${isRtl ? 'pr-12 pl-6' : 'pl-12 pr-6'} py-3.5 bg-slate-50 border border-transparent rounded-[1.5rem] text-sm font-bold focus:bg-white focus:ring-4 focus:ring-athar-blue/5 focus:border-athar-blue/20 transition-all`}
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex p-1.5 bg-slate-100/50 backdrop-blur-md rounded-[1.5rem] w-full md:w-auto overflow-x-auto no-scrollbar border border-slate-200/50">
                        {[
                            { id: 'all', label: t.tabs.all, icon: <Layout size={14} /> },
                            { id: 'readable', label: t.tabs.readable, icon: <FileText size={14} /> },
                            { id: 'audible', label: t.tabs.audible, icon: <Headphones size={14} /> },
                            { id: 'visual', label: t.tabs.visual, icon: <Video size={14} /> },
                            { id: 'link', label: t.tabs.link, icon: <LinkIcon size={14} /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-white text-athar-blue shadow-sm ring-1 ring-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Resources Content */}
                <div className="space-y-12">
                    {['readable', 'audible', 'visual', 'link'].map(type => {
                        const sectionResources = filteredResources.filter(r => r.resource_type === type);
                        if (sectionResources.length === 0) return null;
                        
                        return (
                            <div key={type} className="animate-in slide-in-from-bottom-4 duration-500">
                                <div className={`flex items-center gap-4 mb-6 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${getTypeColor(type)}`}>
                                            {getIcon(type, 16)}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-black text-[#0d0e0e] uppercase tracking-tight flex items-center gap-2">
                                                {t.tabs[type]}
                                                <span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full">{sectionResources.length}</span>
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                                </div>

                                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                                    {renderResourceTable(sectionResources)}
                                </div>
                            </div>
                        );
                    })}

                {filteredResources.length === 0 && (
                    <div className="py-24 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mx-auto mb-6 border border-slate-100 shadow-inner">
                            <Search size={32} />
                        </div>
                        <h3 className="text-xl font-black text-[#0d0e0e] uppercase tracking-tight">{t.noResults}</h3>
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">{t.noResultsSub}</p>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};



export default LibraryViewer;
