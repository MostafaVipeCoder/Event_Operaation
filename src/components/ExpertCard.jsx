import { MapPin, Briefcase, Linkedin, Twitter, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { getGoogleDriveDirectLink } from '../lib/utils';

const ExpertCard = ({ expert, customColor = '#1a27c9', viewMode = 'grid', onEdit, onDelete }) => {
    const getLightColor = (hex, opacity = '1a') => `${hex}${opacity}`;

    // Language Handling
    const [searchParams] = useSearchParams();
    const lang = searchParams.get('lang') === 'ar' ? 'ar' : 'en';
    const isRtl = lang === 'ar';

    const translations = {
        en: {
            organization: "Organization",
            location: "Location",
            baseLocation: "Base / Location",
            notSpecified: "Not Specified",
            fallbackBio: "Architecting the future through strategic visionary leadership and sector-defining disruption."
        },
        ar: {
            organization: "المؤسسة",
            location: "الموقع",
            baseLocation: "المقر / الموقع",
            notSpecified: "غير محدد",
            fallbackBio: "بناء المستقبل من خلال القيادة الاستراتيجية المبتكرة وإحداث تغيير جذري في القطاع."
        }
    };

    const t = translations[lang];

    const name = expert.name || 'Unknown Expert';
    const photo = expert.photo_url || expert.photoUrl;
    const linkedin = expert.linkedin_url || expert.linkedin;
    const twitter = expert.twitter_url || expert.twitter;

    if (viewMode === 'list') {
        return (
            <div className={`group relative w-full bg-slate-50 rounded-[4rem] border border-slate-100 p-12 md:p-16 hover:shadow-2xl transition-all duration-700 flex flex-col md:flex-row gap-12 md:gap-20 overflow-hidden ring-1 ring-slate-100/50 items-center md:items-start text-center md:text-start ${isRtl ? 'font-arabic' : 'font-manrope'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                {/* Immersive Background Accent */}
                <div
                    className="absolute top-0 end-0 w-[500px] h-[500px] rounded-full opacity-[0.04] blur-[100px] -me-32 -mt-32 pointer-events-none transition-transform duration-1000 group-hover:scale-110"
                    style={{ backgroundColor: customColor }}
                />

                {/* Large Profile Section */}
                <div className="relative shrink-0">
                    <div
                        className="absolute inset-6 rounded-[4rem] blur-3xl opacity-30 transition-opacity group-hover:opacity-50"
                        style={{ backgroundColor: customColor }}
                    />
                    <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-[3.5rem] md:rounded-[4.5rem] overflow-hidden border-8 border-white shadow-2xl bg-slate-50 transition-all duration-700 group-hover:scale-[1.02]">
                        {photo ? (
                            <img
                                src={getGoogleDriveDirectLink(photo)}
                                alt={name}
                                className="w-full h-full object-cover grayscale-[0.1] contrast-[1.05] group-hover:grayscale-0 transition-all duration-700"
                            />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center text-8xl font-black"
                                style={{ backgroundColor: getLightColor(customColor, '10'), color: customColor }}
                            >
                                {name.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Container */}
                <div className="flex-1 z-10 py-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                        <div>
                            <h3 className="text-6xl md:text-8xl font-black text-[#0d0e0e] tracking-tighter mb-4 leading-[0.85] group-hover:text-[#1a27c9] transition-colors duration-500 uppercase">
                                {name}
                            </h3>
                            <p className="text-[#1a27c9] text-sm md:text-lg font-black uppercase tracking-[0.3em] opacity-80 drop-shadow-sm">
                                {expert.title}
                            </p>
                        </div>
                        {linkedin && (
                            <a
                                href={linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center text-slate-400 hover:text-[#0077b5] hover:border-[#0077b5] hover:shadow-2xl transition-all group/link"
                            >
                                <Linkedin size={40} className="group-hover/link:scale-110 transition-transform" />
                            </a>
                        )}
                    </div>

                    <div className="h-px w-20 bg-slate-100 mb-10 mx-auto md:mx-0" />

                    <p className="text-slate-500 text-xl md:text-2xl leading-relaxed font-medium mb-12 transition-colors group-hover:text-slate-800">
                        "{expert.bio || t.fallbackBio}"
                    </p>

                    <div className="flex flex-wrap justify-center md:justify-start gap-6">
                        <div className="flex items-center gap-4 bg-slate-50/50 px-8 py-5 rounded-[2rem] border border-slate-100/50 group-hover:bg-white group-hover:border-slate-200 transition-all">
                            <Briefcase size={20} className="text-slate-400" />
                            <div className={isRtl ? 'text-right' : 'text-left'}>
                                <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{t.organization}</span>
                                <span className="text-sm font-black text-[#0d0e0e] uppercase">{expert.company || t.notSpecified}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-50/50 px-8 py-5 rounded-[2rem] border border-slate-100/50 group-hover:bg-white group-hover:border-slate-200 transition-all">
                            <MapPin size={20} className="text-slate-400" />
                            <div className={isRtl ? 'text-right' : 'text-left'}>
                                <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">{t.baseLocation}</span>
                                <span className="text-sm font-black text-[#0d0e0e] uppercase">{expert.location || t.notSpecified}</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Side Accent */}
                <div
                    className="absolute bottom-0 left-0 w-2 h-0 group-hover:h-full transition-all duration-1000 opacity-60"
                    style={{ backgroundColor: customColor }}
                />

                {/* Action Buttons */}
                <div className="absolute top-8 right-8 flex gap-2 z-20">
                    {onEdit && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(expert);
                            }}
                            className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#1a27c9] hover:border-[#1a27c9] hover:shadow-xl transition-all group/edit"
                        >
                            <Pencil size={18} className="group-hover/edit:rotate-12 transition-transform" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to remove this expert?')) {
                                    onDelete(expert.expert_id || expert.id);
                                }
                            }}
                            className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:shadow-xl transition-all group/delete"
                        >
                            <Trash2 size={18} className="group-hover/delete:scale-110 transition-transform" />
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // Default Grid/Compact View (Enhanced for 2-column)
    return (
        <div className="group relative w-full bg-white rounded-[4rem] border border-slate-100 p-8 md:p-12 hover:shadow-2xl transition-all duration-700 flex flex-col overflow-hidden ring-1 ring-slate-100/50 min-h-[550px] items-center text-center" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Professional Background Accents */}
            <div
                className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[80px] -mr-32 -mt-32 pointer-events-none transition-transform duration-1000 group-hover:scale-110"
                style={{ backgroundColor: customColor }}
            />
            <div
                className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full opacity-[0.03] blur-[60px] -ml-20 -mb-20 pointer-events-none transition-transform duration-1000 group-hover:scale-110"
                style={{ backgroundColor: customColor }}
            />

            {/* Top Bar with Badge & Social */}
            <div className="flex justify-between items-center w-full mb-10 z-10">
                
                
                <div className="flex items-center gap-2">
                    {onEdit && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(expert);
                            }}
                            className="w-11 h-11 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#1a27c9] hover:border-[#1a27c9] hover:shadow-xl transition-all group/edit"
                        >
                            <Pencil size={18} className="group-hover/edit:rotate-12 transition-transform" />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Are you sure you want to remove this expert?')) {
                                    onDelete(expert.expert_id || expert.id);
                                }
                            }}
                            className="w-11 h-11 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:shadow-xl transition-all group/delete"
                        >
                            <Trash2 size={18} className="group-hover/delete:scale-110 transition-transform" />
                        </button>
                    )}
                    {linkedin && (
                        <a
                            href={linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#0077b5] hover:border-[#0077b5] hover:shadow-xl transition-all group/link"
                        >
                            <Linkedin size={28} className="group-hover/link:scale-110 transition-transform" />
                        </a>
                    )}
                </div>
            </div>

            {/* Profile Section */}
            <div className="flex flex-col items-center mb-8 z-10 w-full">
                <div className="relative w-56 h-56 mb-10">
                    {/* Shadow Layer */}
                    <div
                        className="absolute inset-4 rounded-[3.5rem] blur-3xl opacity-20 transition-opacity group-hover:opacity-40"
                        style={{ backgroundColor: customColor }}
                    />
                    {/* Image Container */}
                    <div className="relative w-full h-full rounded-[3.5rem] overflow-hidden border-4 border-white shadow-2xl bg-slate-50 transition-transform duration-1000 group-hover:scale-[1.05]">
                        {photo ? (
                            <img
                                src={getGoogleDriveDirectLink(photo)}
                                alt={name}
                                className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1] group-hover:grayscale-0 transition-all duration-1000"
                            />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center text-6xl font-black"
                                style={{ backgroundColor: getLightColor(customColor, '10'), color: customColor }}
                            >
                                {name.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-4 w-full">
                    <h3 className="text-4xl font-black text-[#0d0e0e] tracking-tight mb-4 leading-none group-hover:text-[#1a27c9] transition-colors duration-500 uppercase">
                        {name}
                    </h3>
                    <p className="text-[#1a27c9] text-xs font-black uppercase tracking-[0.3em] opacity-80 mb-8 drop-shadow-sm">
                        {expert.title}
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 px-4 z-10 w-full flex flex-col justify-between">
                <p className="text-slate-500 text-lg leading-relaxed font-medium mb-10 transition-colors group-hover:text-slate-800 line-clamp-4">
                    "{expert.bio || t.fallbackBio}"
                </p>

                <div className="grid grid-cols-2 gap-4 mt-auto">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 transition-all group-hover:bg-white group-hover:border-slate-200">
                        <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
                            <Briefcase size={16} />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t.organization}</span>
                        </div>
                        <p className="text-xs font-black text-[#0d0e0e] uppercase truncate">{expert.company || t.notSpecified}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 transition-all group-hover:bg-white group-hover:border-slate-200">
                        <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
                            <MapPin size={16} />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t.location}</span>
                        </div>
                        <p className="text-xs font-black text-[#0d0e0e] uppercase truncate">{expert.location || t.notSpecified}</p>
                    </div>
                </div>
            </div>

            {/* Bottom Accent Line */}
            <div
                className="absolute bottom-0 left-0 h-1.5 transition-all duration-1000 w-0 group-hover:w-full opacity-60"
                style={{ backgroundColor: customColor }}
            />
        </div>
    );
};


export default ExpertCard;
