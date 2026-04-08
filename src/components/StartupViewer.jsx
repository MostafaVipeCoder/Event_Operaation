import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getEvent, getCompanies } from '../lib/api';
import { getGoogleDriveDirectLink } from '../lib/utils';
import CompanyCard from './CompanyCard';

export default function StartupViewer() {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [themeColor, setThemeColor] = useState('#1a27c9'); // Default indigo
    const [viewMode] = useState('grid'); // Optimized Grid Layout
    const navigate = useNavigate();

    // Language Handling
    const [searchParams] = useSearchParams();
    const lang = searchParams.get('lang') === 'ar' ? 'ar' : 'en';
    const isRtl = lang === 'ar';

    const translations = {
        en: {
            loading: "Scanning Ecosystem",
            errorTitle: "Engine Offline",
            errorDesc: "The startup data stream for this event could not be found.",
            retry: "Return to Base",
            startup: "Startup",
            list: "List"
        },
        ar: {
            loading: "جاري فحص الشركات...",
            errorTitle: "النظام غير متاح",
            errorDesc: "تعذر العثور على قائمة الشركات لهذا الحدث.",
            retry: "العودة للرئيسية",
            startup: "قائمة",
            list: "الشركات"
        }
    };

    const t = translations[lang];

    useEffect(() => {
        const loadData = async () => {
            try {
                const [eventData, companiesData] = await Promise.all([
                    getEvent(eventId),
                    getCompanies(eventId)
                ]);

                setEvent(eventData);
                setCompanies(companiesData || []);

                // Load custom theme from Supabase event data
                if (eventData?.startups_color) {
                    setThemeColor(eventData.startups_color);
                }

                // Update Page Title
                if (eventData?.event_name) {
                    document.title = `Athar Events | ${eventData.event_name}`;
                }
            } catch (e) {
                console.error('Failed to sync Companies List:', e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [eventId]);



    if (loading) return (
        <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center font-manrope" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="relative mb-8">
                <div className="w-16 h-16 border-4 border-slate-50 border-t-[#1a27c9] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-[#1a27c9]/10 rounded-full animate-pulse"></div>
                </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">{t.loading}</p>
        </div>
    );

    if (!event || event.error) return (
        <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-6 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-rose-500 mb-8 border border-rose-50">
                <ArrowLeft size={32} />
            </div>
            <h2 className="text-2xl font-black text-[#0d0e0e] tracking-tight mb-2">{t.errorTitle}</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-xs">{t.errorDesc}</p>
            <button onClick={() => navigate('/')} className="mt-8 text-[#1a27c9] font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-70 transition-premium">{t.retry}</button>
        </div>
    );

    const headerSettings = event?.header_settings || { fontFamily: 'font-manrope' };

    return (
        <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className={`min-h-screen selection:bg-[#1a27c9]/10 selection:text-[#1a27c9] ${headerSettings.fontFamily || (isRtl ? 'font-arabic' : 'font-manrope')} pb-32`}
            style={{
                backgroundImage: event?.background_image_url
                    ? `url(${getGoogleDriveDirectLink(event.background_image_url)})`
                    : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundColor: '#f5f1f1ff'
            }}
        >

            <div className="max-w-7xl mx-auto px-6 pt-8 relative z-10 transition-all duration-700">
                {/* Enterprise Header */}
                <div className="mb-20 text-center relative group">
                    <div className="flex flex-col items-center">

                        <h1 className="text-3xl md:text-5xl font-black text-[#0d0e0e] tracking-tighter mb-6 leading-none uppercase">
                            {t.startup} <span className="text-[#1a27c9]">{t.list}</span>
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                            {event?.event_name}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 transition-all duration-700">
                {/* Grid Layout - Dynamic spacing based on viewMode */}
                <div className={`grid gap-12 transition-all duration-700 ${viewMode === 'list'
                    ? 'grid-cols-1 max-w-6xl mx-auto'
                    : 'grid-cols-1 md:grid-cols-2'
                    }`}>
                    {companies.map(company => (
                        <CompanyCard
                            key={company.company_id || company.id}
                            company={company}
                            customColor={themeColor}
                            viewMode={viewMode}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
