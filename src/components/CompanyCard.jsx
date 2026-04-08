import { MapPin, Users, Plus, Banknote, Briefcase, Pencil, Trash2, ExternalLink, Globe, Linkedin, Facebook, Twitter, Instagram, Youtube, Github } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { getGoogleDriveDirectLink } from '../lib/utils';

const LinkIcon = ({ type, ...props }) => {
  switch (type) {
    case 'linkedin': return <Linkedin {...props} />;
    case 'facebook': return <Facebook {...props} />;
    case 'twitter': return <Twitter {...props} />;
    case 'instagram': return <Instagram {...props} />;
    case 'youtube': return <Youtube {...props} />;
    case 'github': return <Github {...props} />;
    case 'globe': return <Globe {...props} />;
    default: return <ExternalLink {...props} />;
  }
};

const CompanyCard = ({ company, customColor = '#1a27c9', viewMode = 'grid', onEdit, onDelete }) => {
  const getLightColor = (hex, opacity = '1a') => `${hex}${opacity}`;

  // Language Handling
  const [searchParams] = useSearchParams();
  const lang = searchParams.get('lang') === 'ar' ? 'ar' : 'en';
  const isRtl = lang === 'ar';

  const translations = {
    en: {
      sector: "Sector",
      location: "Location",
      identity: "Identity",
      stage: "Stage",
      connection: "Connection",
      growth: "Growth",
      strategic: "Strategic Builder",
      link: "Link",
      notSpecified: "Not Specified"
    },
    ar: {
      sector: "المجال",
      location: "الموقع",
      identity: "الهوية",
      stage: "المرحلة",
      connection: "روابط التواصل",
      growth: "نمو",
      strategic: "بناء استراتيجي",
      link: "رابط",
      notSpecified: "غير محدد"
    }
  };

  const t = translations[lang];
  // Support both database schema and legacy mock data
  const name = company.startup_name || company.name || 'Unknown Builder';
  const logo = company.logo_url || company.logoUrl;
  const industry = company.industry || company.sector || 'Ecosystem';
  const location = company.location || company.governorate || 'Global';
  const governorate = company.governorate || company.location || '';
  const description = company.description || company.bio || '';
  const stage = company.stage ? company.stage.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '';
  // Normalize links: support new links[] array and legacy website_url
  const links = (() => {
    let parsedLinks = company.links;
    if (typeof parsedLinks === 'string') {
        try { parsedLinks = JSON.parse(parsedLinks); } catch(e) { parsedLinks = []; }
    }
    if (Array.isArray(parsedLinks) && parsedLinks.length > 0) return parsedLinks;
    if (company.website_url) return [{ label: 'Website', url: company.website_url, icon: 'globe' }];
    return [];
  })();

  if (viewMode === 'list') {
    return (
      <div className={`group relative w-full bg-slate-50 rounded-[4rem] border border-slate-100 p-12 md:p-16 shadow-sm hover:shadow-2xl transition-all duration-700 flex flex-col md:flex-row gap-12 md:gap-20 overflow-hidden ring-1 ring-slate-100/50 items-center md:items-start text-center md:text-start ${isRtl ? 'font-arabic' : 'font-manrope'}`} dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Immersive Background Accent */}
        <div
          className="absolute top-0 end-0 w-[500px] h-[500px] rounded-full opacity-[0.04] blur-[100px] -me-32 -mt-32 pointer-events-none transition-transform duration-1000 group-hover:scale-110"
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
              <h3 className="text-6xl md:text-8xl font-black text-[#0d0e0e] tracking-tighter mb-4 leading-[0.85] group-hover:text-[#1a27c9] transition-colors duration-500 uppercase">
                {name}
              </h3>
              <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                {/* Removed redundant industry badge */}
                {stage && (
                  <span className="px-5 py-2.5 rounded-2xl bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-100/50">
                    {stage}
                  </span>
                )}
                {governorate && (
                  <span className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-100/50">
                    <MapPin size={12} /> {governorate}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="h-px w-20 bg-slate-100 mb-10 mx-auto md:mx-0" />

          <div className="mb-12">
            <div className={`flex items-center gap-4 text-slate-400 mb-4 justify-center md:justify-start ${isRtl ? 'flex-row-reverse' : ''}`}>
              <Briefcase size={24} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t.sector}</span>
            </div>
            <p className="text-2xl md:text-3xl font-black text-slate-800 leading-tight uppercase tracking-tight mb-8">
              {industry}
            </p>
            {description && (
              <p className="text-lg md:text-xl font-medium text-slate-500 leading-relaxed max-w-2xl mt-6">{description}</p>
            )}

            {/* Links */}
            {links.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-6 justify-center md:justify-start">
                {links.filter(l => l.url).map((link, i) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-100 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-[#1a27c9] hover:border-[#1a27c9] transition-all shadow-sm hover:shadow-md"
                  >
                    <LinkIcon type={link.icon} size={14} />
                    {link.label || t.link}
                  </a>
                ))}
              </div>
            )}
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

  // Premium Vertical Grid View (Matching Expert Style)
  return (
    <div className="group relative w-full bg-white rounded-[4rem] border border-slate-100 p-6 md:p-8 hover:shadow-2xl transition-all duration-700 flex flex-col overflow-hidden ring-1 ring-slate-100/50 items-center text-center" dir={isRtl ? 'rtl' : 'ltr'}>
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
      <div className="flex justify-between items-center w-full mb-4 z-10">
        <div className="flex items-center gap-2">
          {company.status && (
            <div
              className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border ${company.status === 'Profitable'
                ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                : 'text-amber-600 bg-amber-50 border-amber-100'
                }`}
            >
              {company.status}
            </div>
          )}
          <span className="text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2.5 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-500 whitespace-nowrap">
            {t.stage}: {stage || t.growth}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(company);
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
                if (window.confirm('Are you sure you want to remove this company?')) {
                  onDelete(company.company_id || company.id);
                }
              }}
              className="w-11 h-11 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:shadow-xl transition-all group/delete"
            >
              <Trash2 size={18} className="group-hover/delete:scale-110 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Identity Profile Section */}
      <div className="flex flex-col items-center mb-2 z-10 w-full">
        <div className="relative w-44 h-44 mb-4">
          {/* Shadow Layer */}
          <div
            className="absolute inset-4 rounded-[3rem] blur-3xl opacity-20 transition-opacity group-hover:opacity-40"
            style={{ backgroundColor: customColor }}
          />
          {/* Image Container */}
          <div className="relative w-full h-full rounded-[3rem] overflow-hidden border-4 border-white shadow-2xl bg-white flex items-center justify-center transition-transform duration-1000 group-hover:scale-[1.05]">
            {logo ? (
              <img
                src={getGoogleDriveDirectLink(logo)}
                alt={name}
                className="w-full h-full object-contain p-8 grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000"
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
          <h3 className="text-3xl font-black text-[#0d0e0e] tracking-tight mb-1 leading-none group-hover:text-[#1a27c9] transition-colors duration-500 uppercase">
            {name}
          </h3>
          <p className="text-[#1a27c9] text-xs font-black uppercase tracking-[0.3em] opacity-80 mb-2 drop-shadow-sm">
            {industry}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 px-4 z-10 w-full flex flex-col justify-between">
        {description && (
          <p className="text-slate-500 text-base leading-relaxed font-medium mb-4 transition-colors group-hover:text-slate-800 line-clamp-4 italic">
            "{description}"
          </p>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 transition-all group-hover:bg-white group-hover:border-slate-200">
            <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
              <MapPin size={14} />
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{t.location}</span>
            </div>
            <p className="text-[10px] font-black text-[#0d0e0e] uppercase truncate">{governorate || location || t.notSpecified}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 transition-all group-hover:bg-white group-hover:border-slate-200">
            <div className="flex items-center justify-center gap-2 text-slate-400 mb-1">
              <Users size={14} />
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{t.identity}</span>
            </div>
            <p className="text-[10px] font-black text-[#0d0e0e] uppercase truncate">{t.strategic}</p>
          </div>
        </div>

        {/* Links */}
        {links.length > 0 && (
          <div className="mt-4 border-t border-slate-50 pt-4 w-full">
            <div className="flex items-center justify-center gap-2 text-slate-400 mb-2 opacity-60">
                <span className="h-px w-8 bg-slate-200" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em]">{t.connection}</span>
                <span className="h-px w-8 bg-slate-200" />
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {links.filter(l => l.url).slice(0, 3).map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-[#1a27c9] hover:border-[#1a27c9] hover:shadow-lg transition-all"
                title={link.label}
              >
                <LinkIcon type={link.icon} size={18} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>

      {/* Dynamic Interaction Overlay */}
      <div
        className="absolute bottom-0 left-0 h-1.5 w-0 group-hover:w-full transition-all duration-1000 opacity-60"
        style={{ backgroundColor: customColor }}
      />
    </div>
  );
};


export default CompanyCard;
