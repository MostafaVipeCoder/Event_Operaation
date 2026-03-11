import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, TrendingUp, Filter, Calendar } from 'lucide-react';
import SubmissionAnalytics from './SubmissionAnalytics';

export default function MarketingAnalytics() {
    const { eventId } = useParams();

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
                                <h1 className="text-2xl font-black text-[#0d0e0e] tracking-tight">Marketing Analytics</h1>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Campaign Performance & Channel Tracking</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
                                <TrendingUp size={16} className="text-emerald-600" />
                                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Live Tracking</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Information Alert */}
                <div className="bg-indigo-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                    <div className="relative z-10 max-w-2xl">
                        <h2 className="text-3xl font-black mb-4 tracking-tight leading-tight italic">
                            Optimize Your Campaign Strategy with Data
                        </h2>
                        <p className="text-indigo-100 text-lg font-medium mb-0 leading-relaxed">
                            Track where your applicants are coming from in real-time. Use these insights to reallocate budget to the highest performing channels like Facebook or LinkedIn.
                        </p>
                    </div>
                    <BarChart3 size={200} className="absolute -right-10 -bottom-10 text-white/10 rotate-12" />
                </div>

                {/* Analytics Dashboard */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-8 mb-8">
                    <SubmissionAnalytics eventId={eventId} />
                </div>
            </div>
        </div>
    );
}
