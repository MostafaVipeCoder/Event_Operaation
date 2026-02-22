import { MapPin, Users, Plus, Banknote, Briefcase, Pencil, Trash2 } from 'lucide-react';
import { getGoogleDriveDirectLink } from '../lib/utils';

const CompanyCard = ({ company, customColor = '#1a27c9', viewMode = 'grid', onEdit, onDelete }) => {
  const getLightColor = (hex, opacity = '1a') => `${hex}${opacity}`;

  // Support both database schema and legacy mock data
  const name = company.startup_name || company.name || 'Unknown Builder';
  const logo = company.logo_url || company.logoUrl;
  const industry = company.industry || company.sector || 'Ecosystem';
  const location = company.location || 'Global';

  if (viewMode === 'list') {
    return (
      <div className="group relative w-full bg-slate-50 rounded-[4rem] border border-slate-100 p-12 md:p-16 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col md:flex-row gap-12 md:gap-20 overflow-hidden ring-1 ring-slate-100/50 items-center md:items-start text-center md:text-left">
        {/* Immersive Background Accent */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-[0.04] blur-[100px] -mr-32 -mt-32 pointer-events-none transition-transform duration-1000 group-hover:scale-110"
          style={{ backgroundColor: customColor }}
        />

        {/* Large Identity Section */}
        <div className="relative shrink-0">
          <div
            className="absolute inset-6 rounded-[4rem] blur-3xl opacity-30 transition-opacity group-hover:opacity-50"
            style={{ backgroundColor: customColor }}
          />
          <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-[3.5rem] md:rounded-[4.5rem] overflow-hidden border-8 border-white shadow-2xl bg-white flex items-center justify-center transition-all duration-700  group-hover:scale-105">
            {logo ? (
              <img src={getGoogleDriveDirectLink(logo)} alt={name} className="w-full h-full object-contain p-12 grayscale-[0.2] group-hover:grayscale-0 transition-all" />
            ) : (
              <span className="text-8xl font-black opacity-20" style={{ color: customColor }}>{name.charAt(0)}</span>
            )}
          </div>
        </div>

        {/* Info Container */}
        <div className="flex-1 z-10 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: customColor }} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Companies List</span>
              </div>
              <h3 className="text-6xl md:text-8xl font-black text-[#0d0e0e] tracking-tighter mb-4 leading-[0.85] group-hover:text-[#1a27c9] transition-colors duration-500 uppercase">
                {name}
              </h3>
              <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                <span className="px-5 py-2.5 rounded-2xl bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-100/50">
                  {industry}
                </span>
                {company.status && (
                  <span className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${company.status === 'Profitable' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'
                    }`}>
                    {company.status}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="h-px w-20 bg-slate-100 mb-10 mx-auto md:mx-0" />

          <div className="mb-12">
            <div className="flex items-center gap-4 text-slate-400 mb-4 justify-center md:justify-start">
              <Briefcase size={24} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Operational Domain</span>
            </div>
            <p className="text-2xl md:text-4xl font-black text-slate-800 leading-tight uppercase tracking-tight">
              {industry} & Advanced Industrial Infrastructure Solutions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
            <div className="flex items-center gap-6 bg-slate-50/50 px-10 py-6 rounded-[2.5rem] border border-slate-100/50 group-hover:bg-white group-hover:border-slate-200 transition-all">
              <MapPin size={24} className="text-slate-400" />
              <div>
                <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Governorate</span>
                <span className="text-lg font-black text-[#0d0e0e] uppercase">{location}</span>
              </div>
            </div>
            <div className="flex items-center gap-6 bg-slate-50/50 px-10 py-6 rounded-[2.5rem] border border-slate-100/50 group-hover:bg-white group-hover:border-slate-200 transition-all">
              <Users size={24} className="text-slate-400" />
              <div>
                <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Growth Index</span>
                <span className="text-lg font-black text-[#0d0e0e] uppercase">{company.employees || 'Expanding'}</span>
              </div>
            </div>
          </div>

          {/* Founder Section */}
          <div className="flex items-center gap-6 pt-10 border-t border-slate-100 justify-center md:justify-start">
            <div className="w-16 h-16 rounded-3xl bg-slate-900 border-2 border-slate-200 flex items-center justify-center text-white text-lg font-black shadow-xl">
              {company.founder ? company.founder.split(' ')[1]?.charAt(0) || company.founder.charAt(0) : 'E'}
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1.5">Executive Founder</p>
              <p className="text-xl font-black text-[#0d0e0e] tracking-tight">{company.founder || 'Ecosystem Architect'}</p>
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
                onEdit(company);
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
                if (window.confirm('Are you sure you want to remove this company?')) {
                  onDelete(company.company_id || company.id);
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

  // Optimized Compact View
  return (
    <div className="group relative w-full bg-slate-50 rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col font-manrope overflow-hidden ring-1 ring-slate-100/50 min-h-[480px]">
      {/* Design Accent */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.02]"
        style={{ backgroundColor: customColor }}
      />

      {/* Status Area */}
      <div className="flex items-center justify-between mb-8 z-10">
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100/50 max-w-[150px]">
          <span className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ backgroundColor: customColor }} />
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider truncate">{industry}</span>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(company);
              }}
              className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#1a27c9] hover:border-[#1a27c9] hover:shadow-lg transition-all group/edit"
            >
              <Pencil size={14} className="group-hover/edit:rotate-12 transition-transform" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to remove this company?')) {
                  onDelete(company.company_id || company.id);
                }
              }}
              className="w-8 h-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:shadow-lg transition-all group/delete"
            >
              <Trash2 size={14} className="group-hover/delete:scale-110 transition-transform" />
            </button>
          )}
          {company.status && (
            <div
              className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border shrink-0 ${company.status === 'Profitable'
                ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                : 'text-amber-600 bg-amber-50 border-amber-100'
                }`}
            >
              {company.status}
            </div>
          )}
        </div>
      </div>

      {/* Identity */}
      <div className="flex items-center gap-6 mb-10 px-2 z-10 overflow-hidden">
        <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-slate-50 shadow-xl bg-slate-50 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          {logo ? (
            <img src={getGoogleDriveDirectLink(logo)} alt={name} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all" />
          ) : (
            <span className="text-4xl font-black opacity-20" style={{ color: customColor }}>{name.charAt(0)}</span>
          )}
        </div>
        <div className="overflow-hidden">
          <h3 className="text-3xl font-black text-[#0d0e0e] tracking-tighter group-hover:text-[#1a27c9] transition-colors mb-2 leading-none truncate">
            {name}
          </h3>
          <p className="text-[#1a27c9] text-[10px] font-black uppercase tracking-[0.2em] opacity-70 truncate">Strategic Builder</p>
        </div>
      </div>

      {/* Vitals Grid */}
      <div className="grid grid-cols-2 gap-4 mb-10 z-10">
        <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100/50 group-hover:bg-white transition-all overflow-hidden">
          <div className="flex items-center gap-3 mb-2 text-slate-400">
            <MapPin size={16} className="shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest truncate">Gov.</span>
          </div>
          <p className="text-sm font-black text-[#0d0e0e] uppercase truncate">{location}</p>
        </div>
        <div className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100/50 group-hover:bg-white transition-all overflow-hidden">
          <div className="flex items-center gap-3 mb-2 text-slate-400">
            <Users size={16} className="shrink-0" />
            <span className="text-[10px] font-black uppercase tracking-widest truncate">Growth</span>
          </div>
          <p className="text-sm font-black text-[#0d0e0e] uppercase truncate">{company.employees || 'Expanding'}</p>
        </div>
      </div>

      {/* Detailed Info */}
      <div className="mb-10 px-2 z-10 flex-1 overflow-hidden">
        <div className="flex items-center gap-3 mb-2 text-slate-400">
          <Briefcase size={16} className="shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-widest">Field of Work</span>
        </div>
        <p className="text-sm font-bold text-slate-600 leading-relaxed uppercase tracking-tight line-clamp-2">{industry}</p>
      </div>

      {/* Founder Area - Enhanced Precision */}
      <div className="flex items-center justify-between pt-8 border-t border-slate-50 group-hover:border-slate-100 transition-colors z-10">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border-2 border-slate-200 flex items-center justify-center text-white text-xs font-black shadow-lg shrink-0">
            {company.founder ? company.founder.split(' ')[1]?.charAt(0) || company.founder.charAt(0) : 'E'}
          </div>
          <div className="overflow-hidden">
            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1.5">Executive Founder</p>
            <p className="text-sm font-black text-[#0d0e0e] leading-none tracking-tight truncate">{company.founder || 'Ecosystem Architect'}</p>
          </div>
        </div>
      </div>

      {/* Dynamic Interaction Overlay */}
      <div
        className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-700 opacity-50"
        style={{ backgroundColor: customColor }}
      />
    </div>
  );
};


export default CompanyCard;
