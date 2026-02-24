import { useState, useEffect } from 'react';
import { Clock, User, Calendar as CalendarIcon } from 'lucide-react';
import { getFullAgenda } from '../lib/api';
import { formatDate, formatTime, getGoogleDriveDirectLink } from '../lib/utils';
import { getExperts } from '../lib/api';
import { Linkedin } from 'lucide-react';

export default function AgendaViewer({ eventId }) {
    const [agenda, setAgenda] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(0);
    const [experts, setExperts] = useState([]);
    const [error, setError] = useState(null);
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

            // Update Page Title
            if (agendaData?.event?.event_name) {
                document.title = `Athar Events | ${agendaData.event.event_name}`;
            }
        } catch (err) {
            console.error('Error loading agenda/experts:', err);
            setError('تعذر تحميل الأجندة. يرجى التأكد من اتصال الإنترنت أو من أن رابط الحدث صحيح.');
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-manrope">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a27c9]"></div>
                <p className="mt-4 text-slate-500 font-bold tracking-tight">Syncing Event Pulse...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-manrope">
                <div className="text-center max-w-sm bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
                    <div className="bg-red-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
                        <CalendarIcon size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-[#0d0e0e] mb-3">Sync Error</h2>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-4 bg-[#0d0e0e] text-white rounded-xl font-black transition-premium shadow-lg active:scale-95"
                    >
                        Retry Pulse
                    </button>
                </div>
            </div>
        );
    }

    if (!agenda || !agenda.event) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <CalendarIcon size={64} className="mx-auto text-gray-300 mb-4" />
                    <h2 className="text-2xl text-gray-600">Agenda not found</h2>
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
            className={`min-h-screen selection:bg-indigo-100 antialiased ${headerSettings?.fontFamily || 'font-manrope'}`}
            style={{
                backgroundImage: event.background_image_url
                    ? `url(${getGoogleDriveDirectLink(event.background_image_url)})`
                    : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Premium Header - Now Relative to Flow with PublicLayout */}
            {isHeaderVisible && (
                <div
                    className="relative w-full z-10 shadow-sm flex items-center justify-center transition-all duration-700 overflow-hidden"
                    style={{
                        height: headerHeight,
                        backgroundColor: headerSettings?.type === 'color' ? (headerSettings.color || '#ffffff') : '#f8fafc'
                    }}
                >
                    {/* Show image if type is image OR if type is not set but image exists */}
                    {(headerSettings?.type === 'image' || (!headerSettings?.type && event.header_image_url)) && event.header_image_url && (
                        <div className="absolute inset-0">
                            <img
                                src={getGoogleDriveDirectLink(event.header_image_url)}
                                alt="Event Cover"
                                className="w-full h-full object-cover scale-105"
                                referrerPolicy="no-referrer"
                            />
                            <div
                                className="absolute inset-0 transition-opacity duration-700"
                                style={{
                                    backgroundColor: headerSettings.overlayColor || '#000000',
                                    opacity: headerSettings.overlayOpacity || 0
                                }}
                            />
                        </div>
                    )}

                    {headerSettings?.showTitle && (
                        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
                            <h1
                                className="font-black leading-[1.1] tracking-tight mb-4 drop-shadow-sm"
                                style={{
                                    color: headerSettings.titleColor || '#0d0e0e',
                                    fontSize: headerSettings.titleSize || '3.5rem',
                                    fontWeight: headerSettings.titleWeight || '900',
                                }}
                            >
                                {event.event_name}
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
                className={`max-w-4xl mx-auto px-6 ${!paddingTop.startsWith('calc') ? paddingTop : ''} ${paddingBottom}`}
                style={{ paddingTop: paddingTop.startsWith('calc') ? paddingTop : undefined }}
            >
                {/* Day Navigation Tabs */}
                {days.length > 1 && (
                    <div className="flex justify-center gap-3 mb-16 flex-wrap animate-fadeIn">
                        {days.map((day, index) => (
                            <button
                                key={day.day_id}
                                onClick={() => setSelectedDay(index)}
                                className={`px-8 py-4 rounded-2xl transition-premium group flex flex-col items-center gap-0.5 min-w-[120px] ${selectedDay === index
                                    ? 'bg-[#1a27c9] text-white shadow-xl shadow-indigo-200 -translate-y-1'
                                    : 'bg-white border-2 border-slate-100 text-slate-400 hover:border-[#1a27c9]/30 hover:bg-slate-50'
                                    }`}
                            >
                                <span className={`text-xs font-black uppercase tracking-[0.2em] ${selectedDay === index ? 'opacity-70' : 'text-slate-300'}`}>Day {index + 1}</span>
                                <span className="font-black text-lg tracking-tight leading-tight">{day.day_name}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Single Day Hero Label */}
                {days.length === 1 && (
                    <div className="text-center mb-16 animate-fadeIn">
                        <div className="inline-flex flex-col items-center">
                            <h2 className="text-4xl font-black text-[#0d0e0e] tracking-tight leading-none mb-3">{currentDay.day_name}</h2>
                            <div className="flex items-center gap-2">
                                <span className="h-1 w-1 rounded-full bg-indigo-200" />
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">{formatDate(currentDay.day_date)}</p>
                                <span className="h-1 w-1 rounded-full bg-indigo-200" />
                            </div>
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
                                <div className="flex flex-col md:flex-row md:items-center gap-8">
                                    {/* Timeline Pin */}
                                    <div className="flex flex-col items-start md:w-44 flex-shrink-0">
                                        <div className="flex items-center gap-3 text-[#1a27c9] mb-1">
                                            <div className="bg-indigo-50 p-2 rounded-xl group-hover:scale-110 transition-transform">
                                                <Clock size={16} />
                                            </div>
                                            <span className="font-black text-sm tracking-tighter uppercase whitespace-nowrap">
                                                {formatTime(slot.start_time)}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest pl-11">UNTIL {formatTime(slot.end_time)}</p>
                                    </div>

                                    {/* Slot Narrator & Core */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col gap-3">
                                            <h3
                                                className="text-[#0d0e0e] tracking-tight pr-4 leading-snug"
                                                style={{
                                                    fontSize: headerSettings.contentSize || '1.35rem',
                                                    fontWeight: headerSettings.contentWeight || '900'
                                                }}
                                            >
                                                {slot.slot_title}
                                            </h3>
                                            {slot.presenter_name && slot.show_presenter && (
                                                <div className="flex items-center gap-2 animate-fadeIn">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                                                    <span className="flex items-center gap-2 text-slate-400 text-xs font-black uppercase tracking-widest">
                                                        <User size={12} className="text-slate-300" />
                                                        {slot.presenter_name}
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
                            <p className="text-slate-400 font-bold uppercase tracking-[0.25em] text-xs">No Scheduled Pulses</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Image - Fixed Bottom */}
            {event.footer_image_url && (
                <div className="fixed bottom-0 left-0 w-full h-32 md:h-48 bg-gray-100 overflow-hidden z-20 shadow-inner-lg">
                    <img
                        src={getGoogleDriveDirectLink(event.footer_image_url)}
                        alt="Footer"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>
            )}
        </div>
    );
}
