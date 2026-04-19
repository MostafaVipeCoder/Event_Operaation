import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, Rocket, ArrowLeft, ExternalLink, Settings, LayoutGrid, Inbox, RefreshCw, FileSpreadsheet, Palette, ClipboardList, BarChart3, Edit2, Check, X, Briefcase } from 'lucide-react';
import { getEvent, updateEvent } from '../lib/api';
import { prefetch } from '../App';
import SyncButton from './SyncButton';
import { usePresence } from '../hooks/usePresence';
import ActiveUsers from './ActiveUsers';

export default function EventDashboard() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const { activeUsers } = usePresence(`event_dashboard_${eventId}`);

    // Theme State
    const [expertsColor, setExpertsColor] = useState('#9333ea'); // Default Purple
    const [startupsColor, setStartupsColor] = useState('#059669'); // Default Emerald
    const [themeSaved, setThemeSaved] = useState(false);

    // Edit Name State
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);

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

    const handleSaveName = async () => {
        if (!editedName.trim() || editedName === event.event_name) {
            setIsEditingName(false);
            return;
        }
        try {
            setIsSavingName(true);
            await updateEvent(eventId, { event_name: editedName });
            setEvent(prev => ({ ...prev, event_name: editedName }));
            setIsEditingName(false);
        } catch (error) {
            console.error('Error saving event name:', error);
            alert('Failed to save event name.');
        } finally {
            setIsSavingName(false);
        }
    };

    const loadEventDetails = async () => {
        try {
            setLoading(true);
            const data = await getEvent(eventId);
            setEvent(data);
            setEditedName(data.event_name || '');
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
            <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground font-manrope relative overflow-hidden animate-in fade-in">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 mix-blend-soft-light pointer-events-none z-0 dark:opacity-10"></div>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary z-10"></div>
                <p className="mt-4 text-muted-foreground font-bold tracking-tight z-10">Loading Pulse Dashboard...</p>
            </div>
        );
    }

    if (!event || event.error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-background font-manrope relative overflow-hidden animate-in fade-in">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-50 mix-blend-soft-light pointer-events-none z-0 dark:opacity-10"></div>
                <div className="absolute top-0 right-0 w-full h-[500px] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-athar-blue/20 via-background to-background pointer-events-none z-0"></div>
                <div className="bg-card p-10 rounded-lg shadow-xl border border-border text-center max-w-sm relative z-10 animate-in zoom-in-95">
                    <h2 className="text-3xl font-extrabold text-foreground mb-2 tracking-tight">Event Offline</h2>
                    <p className="text-muted-foreground font-medium mb-8">We couldn't find the event pulse you're looking for.</p>
                    <Link to="/" className="inline-block px-8 py-3.5 bg-primary text-primary-foreground rounded-lg font-semibold transition-all duration-300 hover:scale-105 active:scale-95">
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
            icon: <Calendar size={32} className="text-primary" />,
            manageLink: `/event/${eventId}/agenda`,
            previewLink: `/agenda/${eventId}`,
            prefetchKey: 'agenda',
            accent: "hsl(var(--primary))",
        },
        {
            title: "Experts List",
            description: "Curate the thinkers and visionaries of the stage.",
            icon: <Users size={32} style={{ color: expertsColor }} />,
            manageLink: `/event/${eventId}/experts`,
            previewLink: `/view/${eventId}/experts`,
            prefetchKey: 'experts',
            accent: expertsColor,
        },
        {
            title: "Companies List",
            description: "Showcase the builders and innovators of tomorrow.",
            icon: <Rocket size={32} style={{ color: startupsColor }} />,
            manageLink: `/event/${eventId}/startups`,
            previewLink: `/view/${eventId}/startups`,
            prefetchKey: 'startups',
            accent: startupsColor,
        },
        {
            title: "Form Builder",
            description: "Customize company and expert registration forms.",
            icon: <Inbox size={32} className="text-primary" />,
            manageLink: `/event/${eventId}/forms`,
            prefetchKey: 'forms',
            accent: "hsl(var(--primary))",
        },
        {
            title: "Event Visuals",
            description: "Customize cover branding, colors, and typography.",
            icon: <Palette size={32} className="text-primary" />,
            manageLink: `/event/${eventId}/visuals`,
            prefetchKey: 'visuals',
            accent: "hsl(var(--primary))",
        },
        {
            title: "Selection Process",
            description: "Manage applicant screening, interviews, and approvals.",
            icon: <ClipboardList size={32} className="text-primary" />,
            manageLink: `/event/${eventId}/selection`,
            prefetchKey: 'selection',
            accent: "hsl(var(--primary))",
        },
        {
            title: "Marketing Analytics",
            description: "Track campaign performance and applicant sources in real-time.",
            icon: <BarChart3 size={32} className="text-primary" />,
            manageLink: `/event/${eventId}/analytics`,
            prefetchKey: 'analytics',
            accent: "hsl(var(--primary))",
        }
    ];

    return (
        <div className="min-h-screen bg-background font-manrope text-foreground pb-24 relative overflow-hidden">
            {/* Background Grain & Glow */}
            <div className="absolute inset-0 z-0 pointer-events-none mix-blend-soft-light opacity-50 dark:opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            <div className="absolute top-0 right-0 w-full h-[500px] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-athar-blue/10 via-background to-background pointer-events-none -z-10"></div>

            {/* Header */}
            <div className="bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-50 animate-in fade-in slide-in-from-top-4">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-6">
                            <Link to="/" className="p-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-300 group">
                                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            </Link>
                            <div>
                                {isEditingName ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={editedName}
                                            onChange={(e) => setEditedName(e.target.value)}
                                            className="text-2xl font-extrabold text-foreground tracking-tight bg-background border border-border rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') handleSaveName();
                                                if (e.key === 'Escape') {
                                                    setEditedName(event.event_name);
                                                    setIsEditingName(false);
                                                }
                                            }}
                                            disabled={isSavingName}
                                        />
                                        <button onClick={handleSaveName} disabled={isSavingName} className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors">
                                            <Check size={18} />
                                        </button>
                                        <button onClick={() => { setEditedName(event.event_name); setIsEditingName(false); }} disabled={isSavingName} className="p-1.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/20 transition-colors">
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-extrabold text-foreground tracking-tight hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-athar-blue hover:to-athar-yellow transition-all duration-300">{event.event_name}</h1>
                                        <button onClick={() => setIsEditingName(true)} className="text-muted-foreground hover:text-primary transition-colors" title="Edit Event Name">
                                            <Edit2 size={16} />
                                        </button>
                                    </div>
                                )}
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] leading-none mt-1">Event Master Control</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            {/* Active Users Present In This Event */}
                            <ActiveUsers users={activeUsers} />
                            
                            <div className="flex items-center gap-4 border-l border-border pl-6">
                                <SyncButton eventId={eventId} onSyncComplete={() => window.location.reload()} />
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm border ${event.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-secondary text-muted-foreground border-border'
                                    }`}>
                                    • {event.status || 'Active'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Public Access Hub - NEW SECTION (Solid Branding) */}
            <div className="bg-gradient-to-br from-athar-blue to-athar-black text-white py-10 relative overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none" />
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight mb-1">Public Access Hub</h2>
                            <p className="text-white/60 text-xs font-medium uppercase tracking-[0.1em] mb-4">Share these links with your guests</p>
                        </div>
                        <div className="flex flex-wrap gap-4 items-center">
                            {/* English Links */}
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] text-center">English Version</span>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <button 
                                        onClick={(e) => {
                                            const link = `${window.location.origin}${window.location.pathname}?agenda=${eventId}&lang=en`;
                                            navigator.clipboard.writeText(link);
                                            e.currentTarget.innerHTML = 'Copied!';
                                            setTimeout(() => { e.currentTarget.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg> Full Link'; }, 2000);
                                        }}
                                        className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <ClipboardList size={16} /> Full Link
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            const link = `${window.location.origin}${window.location.pathname}?agenda=${eventId}&lang=en&mode=agenda_experts`;
                                            navigator.clipboard.writeText(link);
                                            e.currentTarget.innerHTML = 'Copied!';
                                            setTimeout(() => { e.currentTarget.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg> Agenda & Experts'; }, 2000);
                                        }}
                                        className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <ClipboardList size={16} /> Agenda & Experts
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            const link = `${window.location.origin}${window.location.pathname}?agenda=${eventId}&lang=en&mode=agenda_only`;
                                            navigator.clipboard.writeText(link);
                                            e.currentTarget.innerHTML = 'Copied!';
                                            setTimeout(() => { e.currentTarget.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg> Agenda Only'; }, 2000);
                                        }}
                                        className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2"
                                    >
                                        <ClipboardList size={16} /> Agenda Only
                                    </button>
                                    <a 
                                        href={`${window.location.origin}${window.location.pathname}?agenda=${eventId}&lang=en`} 
                                        target="_blank" 
                                        className="px-6 py-3 bg-athar-yellow hover:bg-white text-athar-black rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105"
                                    >
                                        <ExternalLink size={16} /> Open
                                    </a>
                                </div>
                            </div>

                            <div className="w-px h-12 bg-white/20 hidden md:block" />

                            {/* Arabic Links */}
                            <div className="flex flex-col gap-2">
                                <span className="text-[10px] font-bold text-athar-yellow uppercase tracking-[0.2em] text-center">Arabic Version (RTL)</span>
                                <div className="flex flex-wrap gap-2 justify-center">
                                    <button 
                                        onClick={(e) => {
                                            const link = `${window.location.origin}${window.location.pathname}?agenda=${eventId}&lang=ar`;
                                            navigator.clipboard.writeText(link);
                                            e.currentTarget.innerHTML = 'تم النسخ!';
                                            setTimeout(() => { e.currentTarget.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg> المنصة كاملة'; }, 2000);
                                        }}
                                        className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2 font-arabic"
                                    >
                                        <ClipboardList size={16} /> المنصة كاملة
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            const link = `${window.location.origin}${window.location.pathname}?agenda=${eventId}&lang=ar&mode=agenda_experts`;
                                            navigator.clipboard.writeText(link);
                                            e.currentTarget.innerHTML = 'تم النسخ!';
                                            setTimeout(() => { e.currentTarget.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg> الأجندة والخبراء'; }, 2000);
                                        }}
                                        className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2 font-arabic"
                                    >
                                        <ClipboardList size={16} /> الأجندة والخبراء
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            const link = `${window.location.origin}${window.location.pathname}?agenda=${eventId}&lang=ar&mode=agenda_only`;
                                            navigator.clipboard.writeText(link);
                                            e.currentTarget.innerHTML = 'تم النسخ!';
                                            setTimeout(() => { e.currentTarget.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clipboard-list"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/></svg> الأجندة فقط'; }, 2000);
                                        }}
                                        className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-all duration-300 flex items-center justify-center gap-2 font-arabic"
                                    >
                                        <ClipboardList size={16} /> الأجندة فقط
                                    </button>
                                    <a 
                                        href={`${window.location.origin}${window.location.pathname}?agenda=${eventId}&lang=ar`} 
                                        target="_blank" 
                                        className="px-6 py-3 bg-athar-yellow hover:bg-white text-athar-black rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105 font-arabic"
                                    >
                                        <ExternalLink size={16} /> فتح
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-bottom-4">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-primary/10 p-2 rounded-lg">
                                <LayoutGrid size={20} className="text-primary" />
                            </div>
                            <h2 className="text-3xl font-bold text-foreground tracking-tight">Event Modules</h2>
                        </div>
                        <p className="text-muted-foreground font-medium">Coordinate the core elements of your event experience.</p>
                    </div>
                </div>

                {/* Cloud Sync Configuration */}
                <div className="mb-12 bg-card rounded-lg border border-border p-8 shadow-sm relative overflow-hidden group animate-in fade-in slide-in-from-bottom-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-athar-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                    <RefreshCw size={18} />
                                </div>
                                <h3 className="text-xl font-bold text-foreground tracking-tight">Sync With Sheet</h3>
                            </div>
                            <p className="text-muted-foreground text-sm font-medium mb-4">Provide a Google Sheets URL to synchronize all modules at once.</p>

                            <div className="flex flex-wrap gap-3 w-full">
                                <input
                                    type="text"
                                    placeholder="Paste Google Sheets URL here..."
                                    value={gsheetsUrl}
                                    onChange={(e) => setGsheetsUrl(e.target.value)}
                                    className="flex-1 min-w-[300px] px-6 py-3.5 bg-background border border-border rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                                <button
                                    onClick={handleSaveGsheetsUrl}
                                    disabled={isSavingUrl || gsheetsUrl === event?.gsheets_url}
                                    className="px-6 py-3.5 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold uppercase tracking-[0.1em] hover:opacity-90 transition-all duration-300 disabled:opacity-50 flex items-center justify-center shadow-lg"
                                >
                                    {isSavingUrl ? 'Saving...' : 'Save Source'}
                                </button>
                                <a
                                    href="https://docs.google.com/spreadsheets/d/15uqLAXYvVwIFGbIp8FjG5IA1oCwjdU72Hs4ONO06WCc/copy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-3.5 bg-secondary text-secondary-foreground border border-border rounded-lg text-[10px] font-bold uppercase tracking-[0.1em] hover:bg-secondary/80 transition-all duration-300 flex items-center gap-2"
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
                        <div
                            key={index}
                            className="relative rounded-lg border border-border p-8 transition-all duration-300 hover:shadow-xl flex flex-col group bg-card backdrop-blur-sm overflow-hidden animate-in fade-in zoom-in-95 fill-mode-both"
                            style={{ animationDelay: `${index * 50}ms` }}
                            onMouseEnter={() => module.prefetchKey && prefetch[module.prefetchKey]?.()}
                        >
                            {/* Hover Gradient line */}
                            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-athar-blue via-athar-blue/80 to-athar-yellow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className="p-4 rounded-lg shadow-sm border border-border group-hover:scale-110 transition-transform duration-300 bg-background" style={{ color: module.accent, borderColor: `${module.accent}30` }}>
                                    {module.icon}
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-foreground mb-2 tracking-tight relative z-10 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-athar-blue group-hover:to-athar-yellow transition-all duration-300">{module.title}</h3>
                            <p className="text-muted-foreground font-medium mb-10 leading-relaxed text-sm flex-1 relative z-10">{module.description}</p>

                            <div className="flex flex-col gap-3 mt-auto relative z-10">
                                <button
                                    onClick={() => navigate(module.manageLink)}
                                    onMouseEnter={() => module.prefetchKey && prefetch[module.prefetchKey]?.()}
                                    className="w-full py-4 rounded-lg font-bold text-xs uppercase tracking-widest shadow-lg transition-all duration-300 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 bg-primary text-primary-foreground hover:opacity-90"
                                >
                                    <span>Enter Module</span>
                                </button>

                                {module.editFormsLink && (
                                    <button
                                        onClick={() => navigate(module.editFormsLink)}
                                        className="w-full py-3 rounded-lg font-semibold text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-300 flex items-center justify-center gap-2"
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
