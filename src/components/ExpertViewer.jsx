import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutGrid, List } from 'lucide-react';
import { getEvent, getExperts } from '../lib/api';
import { getGoogleDriveDirectLink } from '../lib/utils';
import ExpertCard from './ExpertCard';

export default function ExpertViewer() {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [themeColor, setThemeColor] = useState('#1a27c9'); // Default indigo
    const [viewMode] = useState('list'); // Forced Immersive Layout
    const navigate = useNavigate();

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
        <div className="min-h-screen bg-white flex flex-col items-center justify-center font-manrope">
            <div className="relative mb-8">
                <div className="w-16 h-16 border-4 border-slate-50 border-t-[#1a27c9] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-[#1a27c9]/10 rounded-full animate-pulse"></div>
                </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Establishing Signal</p>
        </div>
    );

    if (!event || event.error) return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center font-manrope p-6 text-center">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-rose-500 mb-8 border border-rose-50">
                <ArrowLeft size={32} />
            </div>
            <h2 className="text-2xl font-black text-[#0d0e0e] tracking-tight mb-2">Event Terminated</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-xs">We couldn't locate the event blueprint you're looking for.</p>
            <button onClick={() => navigate('/')} className="mt-8 text-[#1a27c9] font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-70 transition-premium">Return to Base</button>
        </div>
    );

    const isHeaderVisible = event?.header_settings?.visible ?? !!event?.header_image_url;
    const headerHeight = event?.header_height || '16rem';
    const headerSettings = event?.header_settings || { fontFamily: 'font-manrope' };

    return (
        <div
            className={`min-h-screen selection:bg-[#1a27c9]/10 selection:text-[#1a27c9] ${headerSettings.fontFamily} pb-32`}
            style={{
                backgroundImage: event?.background_image_url
                    ? `url(${getGoogleDriveDirectLink(event.background_image_url)})`
                    : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                backgroundColor: '#ffffff'
            }}
        >
            {/* Premium Header */}
            {isHeaderVisible && (
                <div
                    className="relative w-full z-10 shadow-sm flex items-center justify-center transition-all duration-700 overflow-hidden mb-12"
                    style={{
                        height: headerHeight,
                        backgroundColor: headerSettings.type === 'color' ? (headerSettings.color || '#ffffff') : '#f8fafc'
                    }}
                >
                    {/* Show image if type is image OR if type is not set but image exists */}
                    {(headerSettings.type === 'image' || (!headerSettings.type && event.header_image_url)) && event.header_image_url && (
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

                    {headerSettings.showTitle ? (
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
                                <p
                                    className="text-lg md:text-2xl opacity-90 font-bold leading-relaxed tracking-wide"
                                    style={{ color: headerSettings.titleColor || '#0d0e0e' }}
                                >
                                    {headerSettings.titleDescription}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="relative z-10 text-center">
                            <h1 className="text-6xl md:text-8xl font-black text-[#0d0e0e] tracking-tighter mb-6 leading-none uppercase">
                                Expert <span className="text-[#1a27c9]">Insights</span>
                            </h1>
                            <p className="text-lg text-slate-600 font-bold">{event?.event_name}</p>
                        </div>
                    )}
                </div>
            )}

            {!isHeaderVisible && (
                <div className={`mx-auto px-6 pt-8 relative z-10 transition-all duration-700 ${viewMode === 'list' ? 'max-w-7xl' : 'max-w-7xl'}`}>
                    {/* Enterprise Header */}
                    <div className="mb-20 text-center relative group">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="w-12 h-1 bg-[#1a27c9] rounded-full" />
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Visionary Ecosystem</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black text-[#0d0e0e] tracking-tighter mb-6 leading-none uppercase">
                                Expert <span className="text-[#1a27c9]">Insights</span>
                            </h1>
                            <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                                {event?.event_name}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className={`mx-auto px-6 relative z-10 transition-all duration-700 ${viewMode === 'list' ? 'max-w-7xl' : 'max-w-7xl'}`}>
                {/* Grid Layout - Dynamic spacing based on viewMode */}
                <div className={`grid gap-12 transition-all duration-700 ${viewMode === 'list'
                    ? 'grid-cols-1 max-w-6xl mx-auto'
                    : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
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
