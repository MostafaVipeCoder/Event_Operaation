import React, { useState, useEffect } from 'react';
import { Clock, User, Calendar as CalendarIcon, Download } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { getFullAgenda } from '../lib/api';
import { formatDate, formatTime, getGoogleDriveDirectLink } from '../lib/utils';
import { getExperts } from '../lib/api';
import { Linkedin } from 'lucide-react';
import { translations } from '../lib/translations';

export default function AgendaViewer({ eventId }) {
    const [agenda, setAgenda] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(0);
    const [experts, setExperts] = useState([]);
    const [error, setError] = useState(null);

    // Language Handling
    const [searchParams] = useSearchParams();
    const lang = searchParams.get('lang') === 'ar' ? 'ar' : 'en';
    const isRtl = lang === 'ar';

    

    const t = translations.AgendaViewer[lang];
    const [headerSettings, setHeaderSettings] = useState({
        visible: true,
        type: 'image',
        color: '#ffffff',
        showTitle: false,
        titleColor: '#000000',
        titleSize: '3rem',
        titleWeight: '700',
        titleDescription: '',
        fontFamily: 'font-manrope',
        contentSize: '1rem',
        contentWeight: '400',
        overlayColor: '#000000',
        overlayOpacity: '0'
    });

    useEffect(() => {
        // Load header settings immediately
        const savedSettings = localStorage.getItem(`event_header_settings_${eventId}`);
        if (savedSettings) {
            setHeaderSettings(JSON.parse(savedSettings));
        }

        loadAgenda();
        // Reload every 30 seconds for real-time updates
        const interval = setInterval(loadAgenda, 30000);
        return () => clearInterval(interval);
    }, [eventId]);

    const loadAgenda = async () => {
        try {
            setError(null);
            const [agendaData, expertsData] = await Promise.all([
                getFullAgenda(eventId),
                getExperts(eventId)
            ]);
            setAgenda(agendaData);
            setExperts(expertsData || []);

            // Sync header settings from database if they exist
            if (agendaData?.event?.header_settings) {
                setHeaderSettings(agendaData.event.header_settings);
            }

            setLoading(false);

            // Update Page Title and Meta Tags
            if (agendaData?.event) {
                const eventName = agendaData.event.event_name || 'Event';
                const pageTitle = agendaData.event.seo_title || `Athar Programs | ${eventName}`;
                document.title = pageTitle;

                // Helper to update or create meta tags
                const setMetaTag = (selector, attribute, value) => {
                    let element = document.querySelector(selector);
                    if (element) {
                        element.setAttribute(attribute, value);
                    }
                };

                setMetaTag('meta[property="og:title"]', 'content', pageTitle);
                setMetaTag('meta[property="twitter:title"]', 'content', pageTitle);

                const desc = agendaData.event.seo_description || agendaData.event.description || 'احجز مقعدك الآن وتعرف على أحدث الأجندات والمتحدثين في هذا الحدث.';
                setMetaTag('meta[name="description"]', 'content', desc);
                setMetaTag('meta[property="og:description"]', 'content', desc);
                setMetaTag('meta[property="twitter:description"]', 'content', desc);

                const seoImageRaw = agendaData.event.seo_image_url || agendaData.event.header_image_url;
                if (seoImageRaw) {
                    const imageUrl = getGoogleDriveDirectLink(seoImageRaw);
                    setMetaTag('meta[property="og:image"]', 'content', imageUrl);
                    setMetaTag('meta[property="twitter:image"]', 'content', imageUrl);
                }
            }
        } catch (err) {
            console.error('Error loading agenda/experts:', err);
            setError('تعذر تحميل الأجندة. يرجى التأكد من اتصال الإنترنت أو من أن رابط الحدث صحيح.');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen bg-slate-50 flex flex-col items-center justify-center ${isRtl ? 'font-arabic' : 'font-manrope'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a27c9]"></div>
                <p className="mt-4 text-slate-500 font-bold tracking-tight">{t.loading}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen bg-slate-50 flex items-center justify-center p-6 ${isRtl ? 'font-arabic' : 'font-manrope'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="text-center max-w-sm bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
                    <div className="bg-red-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                        <CalendarIcon size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-[#0d0e0e] mb-3">{t.errorTitle}</h2>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-4 bg-[#0d0e0e] text-white rounded-xl font-black transition-premium shadow-lg active:scale-95"
                    >
                        {t.retry}
                    </button>
                </div>
            </div>
        );
    }

    if (!agenda || !agenda.event) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="text-center">
                    <CalendarIcon size={64} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl text-gray-600 font-bold">{t.notFound}</h2>
                </div>
            </div>
        );
    }

    const { event, days } = agenda;
    const currentDay = days[selectedDay];

    // Determine Header Visibility and Properties
    const isHeaderVisible = headerSettings?.visible ?? !!event.header_image_url;
    const headerHeight = event.header_height || '16rem'; // Default 16rem/256px if not set

    // Dynamic padding to prevent content from hiding behind fixed header/footer
    const paddingTop = isHeaderVisible ? 'pt-8' : 'pt-12';
    const paddingBottom = event.footer_image_url ? 'pb-40 md:pb-56' : 'pb-12';

    return (
        <div
            dir={isRtl ? 'rtl' : 'ltr'}
            className={`min-h-screen selection:bg-indigo-100 antialiased ${headerSettings?.fontFamily || (isRtl ? 'font-arabic' : 'font-manrope')}`}
            style={{
                backgroundImage: event.background_image_url
                    ? `url(${getGoogleDriveDirectLink(event.background_image_url)})`
                    : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundColor: '#f5f1f1ff'
            }}
        >
            {isHeaderVisible && (
                <div
                    className="relative w-full z-10 shadow-sm flex items-center justify-center transition-all duration-700 overflow-hidden print:hidden"
                    style={{
                        height: headerSettings?.type === 'color' || (!event.header_image_url && headerSettings?.type !== 'image') ? headerHeight : undefined,
                        backgroundColor: headerSettings?.type === 'color' ? (headerSettings.color || '#ffffff') : '#f8fafc'
                    }}
                >
                    {/* Show image if type is image OR if type is not set but image exists */}
                    {(headerSettings?.type === 'image' || (!headerSettings?.type && event.header_image_url)) && event.header_image_url && (
                        <div className="w-full relative">
                            <img
                                src={getGoogleDriveDirectLink(event.header_image_url)}
                                alt="Event Cover"
                                className="w-full h-auto block"
                                referrerPolicy="no-referrer"
                            />
                            <div
                                className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
                                style={{
                                    backgroundColor: headerSettings.overlayColor || '#000000',
                                    opacity: headerSettings.overlayOpacity || 0
                                }}
                            />
                        </div>
                    )}

                    {headerSettings?.showTitle && (
                        <div className="absolute inset-0 z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center justify-center pointer-events-none">
                            <h1
                                className="font-black leading-[1.1] tracking-tight mb-4 drop-shadow-sm"
                                style={{
                                    color: headerSettings.titleColor || '#0d0e0e',
                                    fontSize: headerSettings.titleSize || '3.5rem',
                                    fontWeight: headerSettings.titleWeight || '900',
                                }}
                            >
                                {isRtl && event.event_name_ar ? event.event_name_ar : event.event_name}
                            </h1>
                            {headerSettings.titleDescription && (
                                <div className="h-0.5 w-12 bg-current opacity-30 mb-6" />
                            )}
                            {headerSettings.titleDescription && (
                                <p
                                    className="text-lg md:text-2xl opacity-90 font-bold leading-relaxed tracking-wide"
                                    style={{ color: headerSettings.titleColor || '#0d0e0e' }}
                                >
                                    {headerSettings.titleDescription}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Main Content Area */}
            <div
                className={`max-w-4xl mx-auto px-6 print:hidden ${!paddingTop.startsWith('calc') ? paddingTop : ''} ${paddingBottom}`}
                style={{ paddingTop: paddingTop.startsWith('calc') ? paddingTop : undefined }}
            >
                {/* Day Navigation Tabs */}
                {days.length > 1 && (
                    <div className="sticky top-0 md:top-[50px] z-40 backdrop-blur-xl -mx-6 px-4 flex justify-center sm:justify-center overflow-x-auto sm:overflow-visible flex-nowrap sm:flex-wrap gap-1 sm:gap-3 mb-2 pb-6 pt-6 animate-fadeIn scrollbar-hide">
                        {days.map((day, index) => (
                            <button
                                key={day.day_id}
                                onClick={() => setSelectedDay(index)}
                                className={`px-1 sm:px-6 py-1.5 sm:py-3 rounded sm:rounded-xl transition-premium group flex flex-col items-center justify-center gap-0.5 min-w-[45px] sm:min-w-[105px] flex-1 sm:flex-none shrink-0 ${selectedDay === index
                                    ? 'bg-[#1a27c9] text-white shadow-lg shadow-indigo-100'
                                    : 'bg-white border border-slate-200 text-slate-400 hover:border-[#1a27c9]/30 hover:bg-slate-50'
                                    } ${event.show_day_names === false ? 'h-[22px] sm:h-[44px]' : ''}`}
                            >
                                <span className={`font-black uppercase tracking-tighter sm:tracking-[0.2em] mb-0.5 ${selectedDay === index ? 'opacity-70' : 'text-slate-400'} ${event.show_day_names === false ? 'text-[7px] sm:text-[11px]' : 'text-[7px] sm:text-[9px]'}`}>
                                    {t.day} {index + 1}
                                </span>
                                {event.show_day_names !== false && (
                                    <span className="font-black text-[9px] sm:text-base tracking-tighter sm:tracking-tight leading-tight whitespace-nowrap">{isRtl && day.day_name_ar ? day.day_name_ar : day.day_name}</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Single Day Hero Label */}
                {days.length === 1 && (
                    <div className="text-center mb-16 animate-fadeIn">
                        <div className="inline-flex flex-col items-center">
                            <h2 className="text-3xl sm:text-4xl font-black text-[#0d0e0e] tracking-tight leading-none mb-3">
                                {event.show_day_names !== false ? (isRtl && currentDay.day_name_ar ? currentDay.day_name_ar : currentDay.day_name) : `${t.day} ${selectedDay + 1}`}
                            </h2>
                            {currentDay.day_date && (
                                <div className="flex items-center gap-2">
                                    <span className="h-1 w-1 rounded-full bg-indigo-200" />
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">{formatDate(currentDay.day_date, lang === 'ar' ? { locale: 'ar-EG' } : {})}</p>
                                    <span className="h-1 w-1 rounded-full bg-indigo-200" />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Pulse Agenda Stream */}
                <div className="space-y-6 relative">
                    {currentDay?.slots?.length > 0 ? (
                        currentDay.slots.map((slot, index) => (
                            <div
                                key={slot.slot_id}
                                className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-premium hover:-translate-y-0.5 group"
                            >
                                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                                    {/* Timeline Pin */}
                                    <div className="flex items-center gap-2 text-[#1a27c9] md:w-56 flex-shrink-0">
                                        <div className="bg-indigo-50 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                                            <Clock size={14} />
                                        </div>
                                        <div className="flex items-center gap-1.5 font-black text-[11px] sm:text-sm tracking-tighter uppercase whitespace-nowrap">
                                            <span>{formatTime(slot.start_time, lang)}</span>
                                            <span className="opacity-30 text-[10px]">—</span>
                                            <span>{formatTime(slot.end_time, lang)}</span>
                                        </div>
                                    </div>

                                    {/* Slot Narrator & Core */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col gap-2">
                                            <h3
                                                className={`text-[#0d0e0e] tracking-tight leading-snug ${isRtl ? 'pl-4' : 'pr-4'} text-[1.1rem] sm:text-[1.35rem]`}
                                                style={{
                                                    fontWeight: headerSettings.contentWeight || '900'
                                                }}
                                            >
                                                {isRtl && slot.slot_title_ar ? slot.slot_title_ar : slot.slot_title}
                                            </h3>
                                            {slot.bullet_points?.length > 0 && (
                                                <ul className={`space-y-1.5 ${isRtl ? 'pr-1' : 'pl-1'}`}>
                                                    {((isRtl && slot.bullet_points_ar?.length > 0) ? slot.bullet_points_ar : slot.bullet_points)?.map((point, i) => (
                                                        <li key={i} className="flex items-start gap-2.5 animate-fadeIn">
                                                            <div className="mt-[7px] h-1.5 w-1.5 rounded-full bg-indigo-300 shrink-0" />
                                                            <span className="text-slate-500 font-medium leading-relaxed" style={{ fontSize: '0.88rem' }}>
                                                                {point}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {slot.presenter_name && slot.show_presenter && (
                                                <div className="flex items-center gap-2 animate-fadeIn">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                                                    <span className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest">
                                                        <User size={12} className="text-slate-300" />
                                                        {isRtl && slot.presenter_name_ar ? slot.presenter_name_ar : slot.presenter_name}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Status Accent */}
                                    <div className="hidden md:flex h-12 w-1.5 bg-slate-50 rounded-full group-hover:bg-[#1a27c9] transition-colors" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
                            <CalendarIcon size={48} className="mx-auto mb-4 text-slate-200" />
                            <p className="text-slate-400 font-bold uppercase tracking-[0.25em] text-xs">{t.noSessions}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Image - Fixed Bottom */}
            {event.footer_image_url && (
                <div className="fixed bottom-0 left-0 w-full h-32 md:h-48 bg-gray-100 overflow-hidden z-20 shadow-inner-lg print:hidden">
                    <img
                        src={getGoogleDriveDirectLink(event.footer_image_url)}
                        alt="Footer"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>
            )}

            {/* ---------------- Print View ---------------- */}
            <div className="hidden print:block w-full bg-white text-black">
                {days.map((day, index) => (
                    <div key={`print-${day.day_id}`} className="print-page w-full bg-white relative">
                        {/* Print Header for each page */}
                        {isHeaderVisible && (
                            <div
                                className="relative w-full flex items-center justify-center overflow-hidden"
                                style={{
                                    height: headerSettings?.type === 'color' || (!event.header_image_url && headerSettings?.type !== 'image') ? headerHeight : undefined,
                                    backgroundColor: headerSettings?.type === 'color' ? (headerSettings.color || '#ffffff') : '#f8fafc'
                                }}
                            >
                                {(headerSettings?.type === 'image' || (!headerSettings?.type && event.header_image_url)) && event.header_image_url && (
                                    <div className="w-full relative">
                                        <img src={getGoogleDriveDirectLink(event.header_image_url)} alt="Cover" className="w-full h-auto block" referrerPolicy="no-referrer" />
                                        <div className="absolute inset-0" style={{ backgroundColor: headerSettings.overlayColor || '#000000', opacity: headerSettings.overlayOpacity || 0 }} />
                                    </div>
                                )}
                                {headerSettings?.showTitle && (
                                    <div className="absolute inset-0 z-10 text-center px-6 mx-auto flex flex-col items-center justify-center">
                                        <h1 className="font-black pt-4 mb-2 drop-shadow-sm" style={{ color: headerSettings.titleColor || '#0d0e0e', fontSize: headerSettings.titleSize || '3rem', fontWeight: headerSettings.titleWeight || '900' }}>
                                            {isRtl && event.event_name_ar ? event.event_name_ar : event.event_name}
                                        </h1>
                                        {headerSettings.titleDescription && (
                                            <p className="text-xl opacity-90 font-bold" style={{ color: headerSettings.titleColor || '#0d0e0e' }}>
                                                {headerSettings.titleDescription}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Print Content for the Day */}
                        <div className="max-w-4xl mx-auto px-8 pt-8 pb-12 print-content-scale">
                            <div className="mb-8 border-b-2 border-slate-100 pb-4">
                                <h2 className="text-4xl font-black text-[#0d0e0e] tracking-tight mb-2">
                                    {event.show_day_names !== false ? (isRtl && day.day_name_ar ? day.day_name_ar : day.day_name) : `${t.day} ${index + 1}`}
                                </h2>
                                {day.day_date && (
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
                                        {formatDate(day.day_date, lang === 'ar' ? { locale: 'ar-EG' } : {})}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-6">
                                {day.slots?.map((slot) => (
                                    <div key={`print-slot-${slot.slot_id}`} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-row items-center gap-6" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                                        <div className="flex items-center gap-2 text-[#1a27c9] w-48 flex-shrink-0">
                                            <Clock size={16} />
                                            <div className="font-black text-sm tracking-tighter uppercase whitespace-nowrap">
                                                <span>{formatTime(slot.start_time, lang)}</span>
                                                <span className="opacity-30 mx-1">—</span>
                                                <span>{formatTime(slot.end_time, lang)}</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl text-[#0d0e0e] font-black tracking-tight mb-1">{isRtl && slot.slot_title_ar ? slot.slot_title_ar : slot.slot_title}</h3>
                                            {slot.bullet_points?.length > 0 && (
                                                <ul className="space-y-1 mt-2">
                                                    {((isRtl && slot.bullet_points_ar?.length > 0) ? slot.bullet_points_ar : slot.bullet_points)?.map((point, i) => (
                                                        <li key={`p-${i}`} className="flex flex-row items-start gap-2">
                                                            <div className="mt-2 h-1 w-1 rounded-full bg-slate-400 shrink-0" />
                                                            <span className="text-slate-600 font-medium text-sm">{point}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            {slot.presenter_name && slot.show_presenter && (
                                                <div className="flex items-center gap-2 mt-3 text-slate-500 text-xs font-black uppercase tracking-widest">
                                                    <User size={14} />
                                                    {isRtl && slot.presenter_name_ar ? slot.presenter_name_ar : slot.presenter_name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Optional Print Footer */}
                        {event.footer_image_url && (
                            <div className="absolute bottom-0 left-0 w-full h-24 bg-gray-100 overflow-hidden">
                                <img src={getGoogleDriveDirectLink(event.footer_image_url)} alt="Footer" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Download PDF Button */}
            <button
                onClick={() => window.print()}
                className={`fixed bottom-8 ${isRtl ? 'left-8' : 'right-8'} z-50 bg-[#1a27c9] text-white p-4 rounded-full shadow-2xl hover:bg-[#121c99] hover:scale-105 active:scale-95 transition-premium print:hidden flex items-center justify-center`}
                title="Download PDF"
            >
                <Download size={24} />
            </button>
        </div>
    );
}
