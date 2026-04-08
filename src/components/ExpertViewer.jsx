import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getEvent, getExperts } from '../lib/api';
import { getGoogleDriveDirectLink } from '../lib/utils';
import ExpertCard from './ExpertCard';

export default function ExpertViewer() {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [experts, setExperts] = useState([]);
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
            loading: "Establishing Signal",
            errorTitle: "Event Terminated",
            errorDesc: "We couldn't locate the event blueprint you're looking for.",
            retry: "Return to Base",
            experts: "Expert",
            list: "List"
        },
        ar: {
            loading: "جاري تحميل البيانات...",
            errorTitle: "الفعالية غير متوفرة",
            errorDesc: "لم نتمكن من العثور على بيانات الحدث المطلوب.",
            retry: "العودة للرئيسية",
            experts: "قائمة",
            list: "الخبراء"
        }
    };

    const t = translations[lang];

    useEffect(() => {
        const loadData = async () => {
            try {
                const [eventData, expertsData] = await Promise.all([
                    getEvent(eventId),
                    getExperts(eventId)
                ]);

                setEvent(eventData);
                setExperts(expertsData || []);

                // Load custom theme from Supabase event data
                if (eventData?.experts_color) {
                    setThemeColor(eventData.experts_color);
                }

                // Update Page Title
                if (eventData?.event_name) {
                    document.title = `Athar Events | ${eventData.event_name}`;
                }
            } catch (e) {
                console.error('Failed to sync visionary grid:', e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [eventId]);

    if (loading) return (
        // ... (rest of the component remains similar, but we remove the toggle JSX)
        <div className="min-h-screen bg-white flex flex-col items-center justify-center" dir={isRtl ? 'rtl' : 'ltr'}>
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
        <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6 text-center" dir={isRtl ? 'rtl' : 'ltr'}>
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
            className={`min-h-screen selection:bg-white selection:text-[#1a27c9] ${headerSettings.fontFamily || (isRtl ? 'font-arabic' : 'font-manrope')} pb-32`}
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

            <div className={`mx-auto px-6 pt-8 relative z-10 transition-all duration-700 ${viewMode === 'list' ? 'max-w-7xl' : 'max-w-7xl'}`}>
                {/* Enterprise Header */}
                <div className="mb-2 text-center relative group">
                    <div className="flex flex-col items-center">
                        <h1 className={`text-3xl md:text-5xl font-black text-[#0d0e0e] tracking-tighter mb-1 leading-none ${!isRtl ? 'uppercase' : ''}`}>
                            {t.experts} <span className="text-[#1a27c9]">{t.list}</span>
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                            {event?.event_name}
                        </p>
                    </div>
                </div>
            </div>

            <div className={`mx-auto px-6 relative z-10 transition-all duration-700 ${viewMode === 'list' ? 'max-w-7xl' : 'max-w-7xl'}`}>
                {/* Grid Layout - Dynamic spacing based on viewMode */}
                <div className={`grid gap-12 transition-all duration-700 ${viewMode === 'list'
                    ? 'grid-cols-1 max-w-6xl mx-auto'
                    : 'grid-cols-1 md:grid-cols-2'
                    }`}>
                    {experts.map(expert => (
                        <ExpertCard
                            key={expert.expert_id || expert.id}
                            expert={expert}
                            customColor={themeColor}
                            viewMode={viewMode}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
