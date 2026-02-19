import React, { useState, useEffect } from 'react';
import { Plus, Calendar, ChevronRight, Layout, Trash2, X, AlertCircle, Edit2, ExternalLink, Check, Copy } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { getEvents, createEvent, deleteEvent } from '../lib/api';
import { formatDate } from '../lib/utils';

export default function Dashboard() {
    const navigate = useNavigate();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newEventName, setNewEventName] = useState('');
    const [createStatus, setCreateStatus] = useState('idle'); // idle, loading, success
    const [error, setError] = useState(null);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getEvents();
            setEvents(data || []);
        } catch (error) {
            console.error('Error loading events:', error);
            setError('فشل الاتصال بـ Supabase. تأكد من إعدادات المشروع ومفاتيح الـ API.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEvent = async () => {
        if (!newEventName.trim()) return;

        try {
            setCreateStatus('loading');
            const data = await createEvent({ event_name: newEventName });

            setCreateStatus('success');
            // Wait a bit to show success message
            setTimeout(() => {
                setNewEventName('');
                setShowCreateModal(false);
                setCreateStatus('idle');
                if (data && data.event_id) {
                    navigate(`/event/${data.event_id}`);
                } else {
                    loadEvents();
                }
            }, 1500);
        } catch (error) {
            console.error('Error creating event:', error);
            setCreateStatus('idle');
            alert('حصل خطأ أثناء الإنشاء');
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!confirm('متأكد إنك عايز تمسح الـ Event ده؟')) return;

        try {
            await deleteEvent(eventId);
            loadEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const handleEditEvent = (eventId) => {
        navigate(`/event/${eventId}`);
    };

    const [copiedId, setCopiedId] = useState(null);
    const handleCopyLink = (eventId) => {
        const url = `${window.location.origin}/#/agenda/${eventId}`;
        navigator.clipboard.writeText(url);
        setCopiedId(eventId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-manrope">
            {/* Premium Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-[#1a27c9] p-2 rounded-xl">
                                <Calendar className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-xl font-extrabold text-[#0d0e0e] tracking-tight">Athar event magments tool</h1>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Professional Event Ecosystem</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 bg-[#1a27c9] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#1a27c9]/90 transition-premium shadow-md active:scale-95"
                        >
                            <Plus size={18} />
                            <span>Create Event</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Stats / Welcome Section */}
                <div className="mb-10">
                    <h2 className="text-3xl font-extrabold text-[#0d0e0e] mb-2">Welcome Back</h2>
                    <p className="text-slate-500">You have {events.length} active event under your management.</p>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a27c9] mb-4"></div>
                        <p className="text-slate-500 font-medium">Syncing with Supabase...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 rounded-3xl border border-red-200 p-12 text-center shadow-sm">
                        <div className="mx-auto h-16 w-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                            <AlertCircle size={32} />
                        </div>
                        <h3 className="text-xl font-extrabold text-red-900 mb-2 font-manrope">Connection Error</h3>
                        <p className="text-red-700 max-w-md mx-auto mb-8 font-medium">
                            {error}
                        </p>
                        <button
                            onClick={loadEvents}
                            className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl text-white bg-red-600 hover:bg-red-700 transition-premium font-bold shadow-lg shadow-red-200"
                        >
                            Retry Connection
                        </button>
                    </div>
                ) : events.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
                        <div className="mx-auto h-20 w-20 bg-indigo-50 text-[#1a27c9] rounded-2xl flex items-center justify-center mb-6">
                            <Calendar size={40} />
                        </div>
                        <h3 className="text-2xl font-extrabold text-slate-900 mb-3">Your Event List is Empty</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-10 text-lg">
                            Get started by creating your first event agenda. It only takes a few seconds to sync.
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-2xl text-white bg-[#1a27c9] hover:bg-[#1a27c9]/90 transition-premium font-extrabold shadow-xl shadow-indigo-100"
                        >
                            <Plus size={24} />
                            Create First Event
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event) => (
                            <div
                                key={event.event_id}
                                onClick={() => navigate(`/event/${event.event_id}`)}
                                className="group bg-white rounded-3xl border border-slate-200 p-6 hover:border-[#1a27c9] hover:shadow-2xl hover:shadow-indigo-100 transition-premium cursor-pointer relative overflow-hidden flex flex-col h-full"
                            >
                                <div className="absolute top-0 left-0 w-2 h-full bg-[#1a27c9] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex justify-between items-start mb-6">
                                    <div className="bg-indigo-50 p-3 rounded-2xl group-hover:bg-[#1a27c9] transition-colors">
                                        <Calendar className="text-[#1a27c9] group-hover:text-white" size={24} />
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${event.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {event.status || 'Active'}
                                    </span>
                                </div>

                                <h3 className="text-xl font-extrabold text-[#0d0e0e] mb-2 group-hover:text-[#1a27c9] transition-colors line-clamp-2">
                                    {event.event_name}
                                </h3>

                                <div className="h-px w-full bg-slate-100 my-4" />

                                <div className="flex items-center gap-2 mt-auto">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/event/${event.event_id}`); }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#0d0e0e] text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-colors"
                                    >
                                        <Edit2 size={16} />
                                        <span>Manage</span>
                                    </button>

                                    <div className="flex gap-1">
                                        <a
                                            href={`#/agenda/${event.event_id}`}
                                            target="_blank"
                                            onClick={(e) => e.stopPropagation()}
                                            className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-[#1a27c9] hover:bg-indigo-50 hover:border-indigo-100 transition-all"
                                            title="View Public Page"
                                        >
                                            <ExternalLink size={18} />
                                        </a>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleCopyLink(event.event_id); }}
                                            className={`h-10 w-10 flex items-center justify-center rounded-xl border transition-all ${copiedId === event.event_id
                                                ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                                : 'border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                                                }`}
                                            title="Copy Link"
                                        >
                                            {copiedId === event.event_id ? <Check size={18} /> : <Copy size={18} />}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.event_id); }}
                                            className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all"
                                            title="Delete Event"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Event Modal */}
            {
                showCreateModal && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl scale-in-center">
                            {createStatus === 'idle' ? (
                                <>
                                    <div className="text-center mb-8">
                                        <div className="h-16 w-16 bg-indigo-50 text-[#1a27c9] rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Calendar size={32} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900">Create New Event</h3>
                                        <p className="text-slate-500 mt-2">Give your event a name to get started.</p>
                                    </div>
                                    <input
                                        type="text"
                                        autoFocus
                                        value={newEventName}
                                        onChange={(e) => setNewEventName(e.target.value)}
                                        placeholder="e.g. Q4 Marketing Summit"
                                        className="w-full px-4 py-4 border border-slate-200 rounded-xl mb-6 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a27c9] focus:border-transparent transition-all"
                                    />
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowCreateModal(false)}
                                            className="flex-1 bg-white border border-slate-200 text-slate-700 px-6 py-3.5 rounded-xl hover:bg-slate-50 transition font-bold"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleCreateEvent}
                                            className="flex-1 bg-[#1a27c9] text-white px-6 py-3.5 rounded-xl hover:bg-[#1a27c9]/90 transition font-bold shadow-lg shadow-indigo-500/20"
                                        >
                                            Create Event
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col items-center py-8">
                                    {createStatus === 'loading' ? (
                                        <>
                                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-100 border-t-[#1a27c9] mb-6"></div>
                                            <p className="text-lg font-bold text-slate-900">Creating your event...</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
                                                <Check size={40} />
                                            </div>
                                            <p className="text-xl font-bold text-slate-900">Event Created!</p>
                                            <p className="text-slate-500 mt-2">Redirecting you to the dashboard...</p>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </div >
    );
}
