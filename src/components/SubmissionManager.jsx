import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Users, Copy, Check } from 'lucide-react';
import SubmissionReviewer from './SubmissionReviewer';

export default function SubmissionManager() {
    const { eventId } = useParams();
    const [activeTab, setActiveTab] = useState('company'); // 'company' or 'expert'
    const [copied, setCopied] = useState(null); // 'company' or 'expert'

    const copyLink = (type) => {
        const baseUrl = window.location.href.split('#')[0];
        const path = type === 'company'
            ? `#/events/${eventId}/register/company`
            : `#/events/${eventId}/register/expert`;

        navigator.clipboard.writeText(`${baseUrl}${path}`);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-200 font-manrope">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        <div className="flex items-center gap-6">
                            <Link to={`/event/${eventId}`} className="p-3 rounded-2xl bg-slate-50 text-slate-400 hover:text-[#1a27c9] hover:bg-indigo-50 transition-premium group">
                                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-black text-[#0d0e0e] tracking-tight">Registration Portals</h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Submission Management</p>
                            </div>
                        </div>

                        {/* Share Links */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => copyLink('company')}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors group"
                                title="Copy Company Registration Link"
                            >
                                {copied === 'company' ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-slate-400 group-hover:text-[#1a27c9]" />}
                                <span className={`text-xs font-bold uppercase tracking-wider ${copied === 'company' ? 'text-green-600' : 'text-slate-600'}`}>
                                    {copied === 'company' ? 'Copied!' : 'Company Link'}
                                </span>
                            </button>
                            <button
                                onClick={() => copyLink('expert')}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 transition-colors group"
                                title="Copy Expert Registration Link"
                            >
                                {copied === 'expert' ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-slate-400 group-hover:text-[#9333ea]" />}
                                <span className={`text-xs font-bold uppercase tracking-wider ${copied === 'expert' ? 'text-green-600' : 'text-slate-600'}`}>
                                    {copied === 'expert' ? 'Copied!' : 'Expert Link'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Navigation Tabs */}
                <div className="flex p-1 bg-slate-200 rounded-2xl mb-8 w-fit">
                    <button
                        onClick={() => setActiveTab('company')}
                        className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'company'
                            ? 'bg-white text-[#1a27c9] shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Building2 size={18} />
                        Company Registrations
                    </button>
                    <button
                        onClick={() => setActiveTab('expert')}
                        className={`px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'expert'
                            ? 'bg-white text-[#9333ea] shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Users size={18} />
                        Expert Registrations
                    </button>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
                    <SubmissionReviewer
                        key={activeTab} // Force re-mount on tab change to reset state
                        eventId={eventId}
                        entityType={activeTab}
                    />
                </div>

            </div>
        </div>
    );
}
