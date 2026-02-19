import { MapPin, Briefcase, Linkedin, Twitter, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { getGoogleDriveDirectLink } from '../lib/utils';

const ExpertCard = ({ expert, customColor = '#1a27c9', viewMode = 'grid', onEdit, onDelete }) => {
    const getLightColor = (hex, opacity = '1a') => `${hex}${opacity}`;

    const name = expert.name || 'Unknown Expert';
    const photo = expert.photo_url || expert.photoUrl;
    const linkedin = expert.linkedin_url || expert.linkedin;
    const twitter = expert.twitter_url || expert.twitter;

    if (viewMode === 'list') {
        return (
            <div className="group relative w-full bg-white rounded-[4rem] border border-slate-100 p-12 md:p-16  hover:shadow-2xl transition-all duration-700 flex flex-col md:flex-row gap-12 md:gap-20 overflow-hidden ring-1 ring-slate-100/50 items-center md:items-start text-center md:text-left">
                {/* Immersive Background Accent */}
                <div
                    className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.04] blur-[100px] -mr-32 -mt-32 pointer-events-none transition-transform duration-1000 group-hover:scale-110"
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
                            <span className="inline-block text-[10px] font-black uppercase tracking-[0.4em] px-5 py-2.5 rounded-2xl bg-slate-50 text-slate-400 border border-slate-100/50 mb-6">
                                {expert.role || 'Sector Disruptor'}
                            </span>
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
                                className="w-20 h-20 bg-white border border-slate-100 rounded-[2rem] flex items-center justify-center text-slate-400 hover:text-[#0077b5] hover:border-[#0077b5] hover:shadow-2xl transition-all group/link"
                            >
                                <Linkedin size={32} className="group-hover/link:scale-110 transition-transform" />
                            </a>
                        )}
                    </div>

                    <div className="h-px w-20 bg-slate-100 mb-10 mx-auto md:mx-0" />

                    <p className="text-slate-500 text-xl md:text-2xl leading-relaxed font-medium mb-12 transition-colors group-hover:text-slate-800">
                        "{expert.bio || 'Reimagining industrial paradigms through vertical integration and algorithmic-driven ecosystem scaling. Bridging the gap between legacy infrastructure and futuristic autonomy.'}"
                    </p>

                    <div className="flex flex-wrap justify-center md:justify-start gap-6">
                        <div className="flex items-center gap-4 bg-slate-50/50 px-8 py-5 rounded-[2rem] border border-slate-100/50 group-hover:bg-white group-hover:border-slate-200 transition-all">
                            <Briefcase size={20} className="text-slate-400" />
                            <div>
                                <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Organization</span>
                                <span className="text-sm font-black text-[#0d0e0e] uppercase">{expert.company || 'Pioneer Group'}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-50/50 px-8 py-5 rounded-[2rem] border border-slate-100/50 group-hover:bg-white group-hover:border-slate-200 transition-all">
                            <MapPin size={20} className="text-slate-400" />
                            <div>
                                <span className="block text-[8px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Strategic Base</span>
                                <span className="text-sm font-black text-[#0d0e0e] uppercase">{expert.location || 'Global Expansion'}</span>
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

    // Default Grid/Compact View (Enhanced)
    return (
        <div className="group relative w-full bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col overflow-hidden ring-1 ring-slate-100/50 min-h-[500px]">
            {/* Professional Background Accent */}
            <div
                className="absolute top-0 right-0 w-64 h-64 -mr-32 -mt-32 rounded-full opacity-[0.03] transition-transform duration-1000 group-hover:scale-110"
                style={{ backgroundColor: customColor }}
            />

            {/* Top Badge */}
            <div className="flex justify-between items-start mb-10 z-10">
                <span
                    className="text-[9px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-xl bg-slate-50 text-slate-500 border border-slate-100/50 truncate max-w-[150px]"
                >
                    {expert.role || 'Sector Leader'}
                </span>
                <div className="flex items-center gap-2">
                    {onEdit && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(expert);
                            }}
                            className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#1a27c9] hover:border-[#1a27c9] hover:shadow-lg transition-all group/edit"
                        >
                            <Pencil size={16} className="group-hover/edit:rotate-12 transition-transform" />
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
                            className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:shadow-lg transition-all group/delete"
                        >
                            <Trash2 size={16} className="group-hover/delete:scale-110 transition-transform" />
                        </button>
                    )}
                    {linkedin && (
                        <a
                            href={linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-[#0077b5] hover:border-[#0077b5] hover:shadow-lg transition-all"
                        >
                            <Linkedin size={20} />
                        </a>
                    )}
                </div>
            </div>

            {/* Profile Section */}
            <div className="flex flex-col items-center mb-10 z-10">
                <div className="relative w-48 h-48 mb-8">
                    {/* Shadow Layer */}
                    <div
                        className="absolute inset-4 rounded-[2.5rem] blur-2xl opacity-20 transition-opacity group-hover:opacity-40"
                        style={{ backgroundColor: customColor }}
                    />
                    {/* Image Container */}
                    <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden border-2 border-slate-50 shadow-inner bg-slate-50 transition-transform duration-700 group-hover:scale-[1.02]">
                        {photo ? (
                            <img
                                src={getGoogleDriveDirectLink(photo)}
                                alt={name}
                                className="w-full h-full object-cover grayscale-[0.2] contrast-[1.1] group-hover:grayscale-0 transition-all duration-700"
                            />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center text-5xl font-black"
                                style={{ backgroundColor: getLightColor(customColor, '10'), color: customColor }}
                            >
                                {name.charAt(0)}
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center px-4 w-full">
                    <h3 className="text-3xl font-black text-[#0d0e0e] tracking-tight mb-3 leading-tight group-hover:text-[#1a27c9] transition-colors duration-300 truncate">
                        {name}
                    </h3>
                    <p className="text-[#1a27c9] text-[10px] font-black uppercase tracking-[0.25em] opacity-80 mb-6 drop-shadow-sm truncate">
                        {expert.title}
                    </p>
                </div>
            </div>

            {/* Content Section */}
            <div className="flex-1 px-2 border-t border-slate-50 pt-10 overflow-hidden">
                <p className="text-slate-500 text-sm leading-[1.8] font-medium text-center mb-10 transition-colors group-hover:text-slate-700 line-clamp-3">
                    "{expert.bio || 'Architecting the future through strategic visionary leadership and sector-defining disruption.'}"
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 transition-all group-hover:bg-white group-hover:border-slate-200 overflow-hidden">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                            <Briefcase size={14} />
                            <span className="text-[8px] font-black uppercase tracking-widest">Organization</span>
                        </div>
                        <p className="text-[10px] font-black text-[#0d0e0e] uppercase truncate">{expert.company || 'Pioneer Group'}</p>
                    </div>
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 transition-all group-hover:bg-white group-hover:border-slate-200 overflow-hidden">
                        <div className="flex items-center gap-2 text-slate-400 mb-1">
                            <MapPin size={14} />
                            <span className="text-[8px] font-black uppercase tracking-widest">Base</span>
                        </div>
                        <p className="text-[10px] font-black text-[#0d0e0e] uppercase truncate">{expert.location || 'Global Expansion'}</p>
                    </div>
                </div>
            </div>

            {/* Bottom Accent Line */}
            <div
                className="absolute bottom-0 left-0 h-1 transition-all duration-700 w-0 group-hover:w-full opacity-50"
                style={{ backgroundColor: customColor }}
            />
        </div>
    );
};


export default ExpertCard;
