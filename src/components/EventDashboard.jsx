import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, Rocket, ArrowLeft, ExternalLink, Settings, LayoutGrid, Inbox, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { getEvent, updateEvent } from '../lib/api';
import SyncButton from './SyncButton';

export default function EventDashboard() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);

    // Theme State
    const [expertsColor, setExpertsColor] = useState('#9333ea'); // Default Purple
    const [startupsColor, setStartupsColor] = useState('#059669'); // Default Emerald
    const [themeSaved, setThemeSaved] = useState(false);

    // Sync Metadata State
    const [gsheetsUrl, setGsheetsUrl] = useState('');
    const [isSavingUrl, setIsSavingUrl] = useState(false);

    useEffect(() => {
        loadEventDetails();
    }, [eventId]);

    const saveTheme = async () => {
        try {
            const updates = {
                experts_color: expertsColor,
                startups_color: startupsColor
            };
            await updateEvent(eventId, updates);
            setThemeSaved(true);
            setTimeout(() => setThemeSaved(false), 2000);
        } catch (error) {
            console.error('Error saving theme:', error);
            alert('Failed to save theme settings.');
        }
    };

    const handleSaveGsheetsUrl = async () => {
        try {
            setIsSavingUrl(true);
            await updateEvent(eventId, { gsheets_url: gsheetsUrl });
            setEvent(prev => ({ ...prev, gsheets_url: gsheetsUrl }));
        } catch (error) {
            console.error('Error saving Google Sheets URL:', error);
            alert('Failed to save sync configuration.');
        } finally {
            setIsSavingUrl(false);
        }
    };

    const loadEventDetails = async () => {
        try {
            setLoading(true);
            const data = await getEvent(eventId);
            setEvent(data);
            // Load theme from DB
            if (data.experts_color) setExpertsColor(data.experts_color);
            if (data.startups_color) setStartupsColor(data.startups_color);
            if (data.gsheets_url) setGsheetsUrl(data.gsheets_url);
        } catch (error) {
            console.error('Error loading event:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white font-manrope">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a27c9]"></div>
                <p className="mt-4 text-slate-500 font-bold tracking-tight">Loading Pulse Dashboard...</p>
            </div>
        );
    }

    if (!event || event.error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-white font-manrope">
                <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 text-center max-w-sm">
                    <h2 className="text-3xl font-black text-[#0d0e0e] mb-2 tracking-tight">Event Offline</h2>
                    <p className="text-slate-500 font-medium mb-8">We couldn't find the event pulse you're looking for.</p>
                    <Link to="/" className="inline-block px-8 py-3.5 bg-[#1a27c9] text-white rounded-xl font-bold transition-premium shadow-lg hover:shadow-indigo-200 active:scale-95">
                        Return to Hub
                    </Link>
                </div>
            </div>
        );
    }

    const modules = [
        {
            title: "Agenda Builder",
            description: "Control the rhythm of your event schedule.",
            icon: <Calendar size={32} className="text-[#1a27c9]" />,
            manageLink: `/event/${eventId}/agenda`,
            previewLink: `/agenda/${eventId}`,
            color: "bg-indigo-50/50 border-indigo-100",
            accent: "#1a27c9",
            btnColor: "bg-[#1a27c9] text-white shadow-indigo-100"
        },
        {
            title: "Experts List",
            description: "Curate the thinkers and visionaries of the stage.",
            icon: <Users size={32} style={{ color: expertsColor }} />,
            manageLink: `/event/${eventId}/experts`,
            previewLink: `/view/${eventId}/experts`,
            color: "bg-white border-slate-100",
            accent: expertsColor,
            btnColor: "text-white"
        },
        {
            title: "Companies List",
            description: "Showcase the builders and innovators of tomorrow.",
            icon: <Rocket size={32} style={{ color: startupsColor }} />,
            manageLink: `/event/${eventId}/startups`,
            previewLink: `/view/${eventId}/startups`,
            color: "bg-white border-slate-100",
            accent: startupsColor,
            btnColor: "text-white"
        },
        {
            title: "Registration Form Builder",
            description: "Review and approve incoming registration requests.",
            icon: <Inbox size={32} className="text-orange-600" />,
            manageLink: `/event/${eventId}/submissions`,
            editFormsLink: `/event/${eventId}/forms`,
            previewLink: `/events/${eventId}/register/company`,
            color: "bg-orange-50/50 border-orange-100",
            accent: "#ea580c",
            btnColor: "bg-orange-600 text-white shadow-orange-100"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-200 font-manrope pb-24">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-6">
                            <Link to="/" className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-[#1a27c9] hover:bg-indigo-50 transition-premium group">
                                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-black text-[#0d0e0e] tracking-tight">{event.event_name}</h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Event Master Control</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <SyncButton eventId={eventId} onSyncComplete={() => window.location.reload()} />
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${event.status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                                }`}>
                                • {event.status || 'Active'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-[#1a27c9]/10 p-2 rounded-xl">
                                <LayoutGrid size={20} className="text-[#1a27c9]" />
                            </div>
                            <h2 className="text-3xl font-black text-[#0d0e0e] tracking-tight">Event Modules</h2>
                        </div>
                        <p className="text-slate-500 font-medium">Coordinate the core elements of your event experience.</p>
                    </div>
                </div>

                {/* Cloud Sync Configuration */}
                <div className="mb-12 bg-slate-50 rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-indigo-50 p-2 rounded-xl text-[#1a27c9]">
                                    <RefreshCw size={18} />
                                </div>
                                <h3 className="text-xl font-black text-[#0d0e0e] tracking-tight">Sync With Sheet</h3>
                            </div>
                            <p className="text-slate-500 text-sm font-medium mb-4">Provide a Google Sheets URL to synchronize all modules at once.</p>

                            <div className="flex gap-3">    
                                <input
                                    type="text"
                                    placeholder="Paste Google Sheets URL here..."
                                    value={gsheetsUrl}
                                    onChange={(e) => setGsheetsUrl(e.target.value)}
                                    className="flex-1 px-6 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#1a27c9]/5 focus:border-[#1a27c9] transition-premium"
                                />
                                <button
                                    onClick={handleSaveGsheetsUrl}
                                    disabled={isSavingUrl || gsheetsUrl === event?.gsheets_url}
                                    className="px-6 py-3.5 bg-[#0d0e0e] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1a27c9] transition-premium disabled:opacity-50 disabled:grayscale"
                                >
                                    {isSavingUrl ? 'Saving...' : 'Save Source'}
                                </button>
                                <a
                                    href="https://docs.google.com/spreadsheets/d/15uqLAXYvVwIFGbIp8FjG5IA1oCwjdU72Hs4ONO06WCc/copy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-premium flex items-center gap-2"
                                >
                                    <FileSpreadsheet size={16} />
                                    Sheet Template
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                    {modules.map((module, index) => (
                        <div key={index} className={`rounded-[2.5rem] border p-8 transition-premium hover:shadow-2xl flex flex-col group bg-slate-50 border-slate-100 ${module.color && !module.color.includes('bg-white') ? module.color : ''}`}>
                            <div className="flex items-start justify-between mb-6">
                                <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                    {module.icon}
                                </div>
                                <a
                                    href={`#${module.previewLink}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-[#1a27c9] hover:bg-indigo-50 transition-premium"
                                    title="Open Public Preview"
                                >
                                    <ExternalLink size={20} />
                                </a>
                            </div>

                            <h3 className="text-2xl font-black text-[#0d0e0e] mb-2 tracking-tight">{module.title}</h3>
                            <p className="text-slate-500 font-medium mb-10 leading-relaxed text-sm flex-1">{module.description}</p>

                            <div className="flex flex-col gap-3 mt-auto">
                                <button
                                    onClick={() => navigate(module.manageLink)}
                                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-premium active:scale-95 flex items-center justify-center gap-3 ${module.btnColor}`}
                                    style={module.customStyle || (module.accent ? { backgroundColor: module.accent } : {})}
                                >
                                    <span>Enter Module</span>
                                </button>

                                {module.editFormsLink && (
                                    <button
                                        onClick={() => navigate(module.editFormsLink)}
                                        className="w-full py-3 rounded-2xl font-bold text-xs uppercase tracking-widest text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-premium flex items-center justify-center gap-2"
                                    >
                                        <Settings size={16} />
                                        <span>Customize Forms</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>








            </div>
        </div>
    );
}
