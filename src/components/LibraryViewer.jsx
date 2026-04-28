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
    const [data, setData] = useState({ sections: [], resources: [] });
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

                {/* Library Stats / Quick Access */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-12 max-w-4xl mx-auto">
                    {[
                        { label: t.stats.central, value: data.resources.filter(r => r.is_central).length, icon: <Globe size={14} />, color: 'text-athar-blue' },
                        { label: t.stats.event, value: data.resources.filter(r => !r.is_central).length, icon: <Lock size={14} />, color: 'text-emerald-500' },
                        { label: t.stats.base, value: data.sections.length, icon: <Database size={14} />, color: 'text-purple-500' },
                        { label: t.stats.total, value: data.resources.length, icon: <Layout size={14} />, color: 'text-rose-500' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/60 backdrop-blur-sm border border-white p-3 sm:p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                            <div className={`${stat.color} mb-1 flex items-center gap-1.5 sm:gap-2 font-black text-[8px] sm:text-[10px] uppercase tracking-widest`}>
                                {stat.icon}
                                <span className="truncate">{stat.label}</span>
                            </div>
                            <div className="text-xl sm:text-2xl font-black text-[#0d0e0e] tracking-tighter">
                                {stat.value.toString().padStart(2, '0')}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
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

            {/* Sections Content */}
            <div className="space-y-16">
                {data.sections.map(section => {
                    const sectionResources = filteredResources.filter(r => r.section_id === section.section_id);
                    if (sectionResources.length === 0 && searchTerm) return null;
                    
                    return (
                        <div key={section.section_id} className="animate-in slide-in-from-bottom-4 duration-500">
                            <div className={`flex items-center gap-4 mb-8 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse text-right' : 'text-left'}`}>
                                    {section.is_central && (
                                        <div className="w-8 h-8 rounded-full bg-athar-blue/10 flex items-center justify-center text-athar-blue border border-athar-blue/20">
                                            <Globe size={14} />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="text-xl font-black text-[#0d0e0e] uppercase tracking-tight flex items-center gap-2">
                                            {isRtl ? section.title_ar : section.title_en}
                                            {section.is_central && <span className="text-[8px] font-black bg-athar-blue text-white px-2 py-0.5 rounded-full uppercase tracking-widest">{t.global}</span>}
                                        </h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                                            {isRtl ? section.title_en : section.title_ar}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {sectionResources.map((resource, idx) => (
                                    <div key={resource.resource_id} className="animate-in fade-in zoom-in-95 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
                                        <ResourceTile resource={resource} getIcon={getIcon} getColor={getTypeColor} t={t} isRtl={isRtl} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Standalone Resources */}
                {filteredResources.some(r => !r.section_id) && (
                    <div className="animate-in slide-in-from-bottom-4 duration-500">
                        <div className={`flex items-center gap-4 mb-8 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <div className={isRtl ? 'text-right' : 'text-left'}>
                                <h3 className="text-xl font-black text-[#0d0e0e] uppercase tracking-tight">{t.essential}</h3>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{t.sourced}</p>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {filteredResources.filter(r => !r.section_id).map((resource, idx) => (
                                <div key={resource.resource_id} className="animate-in fade-in zoom-in-95 duration-500 fill-mode-both" style={{ animationDelay: `${idx * 100}ms` }}>
                                    <ResourceTile resource={resource} getIcon={getIcon} getColor={getTypeColor} t={t} isRtl={isRtl} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

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
    );
};

const ResourceTile = ({ resource, getIcon, getColor, t, isRtl }) => (
    <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`group bg-white rounded-[2rem] p-6 border border-slate-100 hover:border-athar-blue/30 hover:shadow-2xl hover:shadow-athar-blue/5 transition-premium relative overflow-hidden flex flex-col h-full ${isRtl ? 'text-right' : 'text-left'}`}
    >
        <div className={`flex items-start justify-between mb-6 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${getColor(resource.resource_type)}`}>
                {getIcon(resource.resource_type, 24)}
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-athar-blue group-hover:text-white transition-all">
                <ExternalLink size={16} />
            </div>
        </div>
        
        <div className="flex-1">
            <h4 className="text-lg font-black text-[#0d0e0e] tracking-tight mb-1 group-hover:text-athar-blue transition-colors">
                {isRtl ? (resource.title_ar || resource.title_en) : (resource.title_en || resource.title_ar)}
            </h4>
            <p className="text-sm font-bold text-slate-400 leading-relaxed line-clamp-2 opacity-60">
                {isRtl ? resource.title_en : resource.title_ar}
            </p>
        </div>

        <div className={`mt-8 pt-6 border-t border-slate-50 flex items-center justify-between ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className={`text-[9px] font-black uppercase tracking-widest text-slate-300 flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                {t.tabs[resource.resource_type] || t.tabs.all}
                <div className="w-1 h-1 rounded-full bg-slate-200" />
                {resource.is_central ? t.global : t.eventSpecific}
            </span>
            <span className={`text-[10px] font-black uppercase tracking-widest text-athar-blue opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                {t.access} <ArrowRight size={12} className={isRtl ? 'rotate-180' : ''} />
            </span>
        </div>
        
        {/* Subtle Background Pattern */}
        <div className={`absolute -bottom-4 ${isRtl ? '-left-4' : '-right-4'} w-24 h-24 bg-athar-blue/5 rounded-full blur-2xl group-hover:bg-athar-blue/10 transition-all`} />
    </a>
);

export default LibraryViewer;
