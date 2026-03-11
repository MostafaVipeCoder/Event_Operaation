import { useState, useEffect } from 'react';
import { Loader, BarChart3, TrendingUp, Users, Share2, Calendar } from 'lucide-react';
import { getSubmissions } from '../lib/api';

/**
 * SubmissionAnalytics Component
 * 
 * Provides insights into recruitment channels and submission trends.
 */
export default function SubmissionAnalytics({ eventId }) {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        byChannel: {},
        byDate: {},
        recentGrowth: 0
    });

    useEffect(() => {
        loadAnalytics();
    }, [eventId]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);

            // Fetch both company and expert submissions
            const [companies, experts] = await Promise.all([
                getSubmissions(eventId, 'company', 'all'),
                getSubmissions(eventId, 'expert', 'all')
            ]);

            const allSubmissions = [...companies, ...experts];

            // Process Data
            const channelCounts = {};
            const dateCounts = {};

            allSubmissions.forEach(sub => {
                // 1. Identify Source/Channel
                // Check common keys in additional_data
                const additional = sub.additional_data || {};
                const sourceKeys = ['source', 'utm_source', 'channel', 'ref', 'from'];
                let source = 'Direct / Unknown';

                for (const key of sourceKeys) {
                    if (additional[key]) {
                        source = additional[key];
                        break;
                    }
                }

                // Normalization
                const normSource = source.charAt(0).toUpperCase() + source.slice(1).toLowerCase();
                channelCounts[normSource] = (channelCounts[normSource] || 0) + 1;

                // 2. Process Dates
                const date = new Date(sub.submitted_at).toLocaleDateString();
                dateCounts[date] = (dateCounts[date] || 0) + 1;
            });

            // Calculate Growth (simple comparison of last 7 days vs previous 7 if data exists)
            // For now, just set basic stats
            setStats({
                total: allSubmissions.length,
                byChannel: channelCounts,
                byDate: dateCounts,
                recentGrowth: allSubmissions.filter(s => {
                    const diff = new Date() - new Date(s.submitted_at);
                    return diff < (7 * 24 * 60 * 60 * 1000);
                }).length
            });

        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24">
                <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Generating Insights...</p>
            </div>
        );
    }

    if (stats.total === 0) {
        return (
            <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-black text-slate-800 tracking-tight">No Data Yet</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-2">
                    Marketing analytics will appear here once you start receiving submissions through your forms.
                </p>
            </div>
        );
    }

    const channels = Object.entries(stats.byChannel).sort((a, b) => b[1] - a[1]);
    const maxCount = Math.max(...Object.values(stats.byChannel));

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Reach</p>
                        <h4 className="text-4xl font-black text-slate-900 tracking-tight">{stats.total}</h4>
                        <p className="text-xs text-slate-500 font-bold mt-2 flex items-center gap-1">
                            <Users size={14} className="text-blue-500" /> All-time submissions
                        </p>
                    </div>
                    <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <Users size={28} />
                    </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Recent Activity</p>
                        <h4 className="text-4xl font-black text-slate-900 tracking-tight">+{stats.recentGrowth}</h4>
                        <p className="text-xs text-slate-500 font-bold mt-2 flex items-center gap-1">
                            <TrendingUp size={14} className="text-green-500" /> New this week
                        </p>
                    </div>
                    <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200">
                        <TrendingUp size={28} />
                    </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Top Channel</p>
                        <h4 className="text-2xl font-black text-slate-900 tracking-tight truncate max-w-[150px]">
                            {channels[0]?.[0] || 'N/A'}
                        </h4>
                        <p className="text-xs text-slate-500 font-bold mt-2 flex items-center gap-1">
                            <Share2 size={14} className="text-indigo-500" /> Most effective source
                        </p>
                    </div>
                    <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <Share2 size={28} />
                    </div>
                </div>
            </div>

            {/* Main Visuals Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Channel Distribution */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <BarChart3 className="text-blue-600" size={24} />
                            Source Distribution
                        </h3>
                        <p className="text-slate-500 text-sm mt-1">Which channels are bringing in the most applicants?</p>
                    </div>

                    <div className="space-y-4 pt-4">
                        {channels.map(([name, count]) => (
                            <div key={name} className="group">
                                <div className="flex justify-between text-sm font-bold mb-2">
                                    <span className="text-slate-700">{name}</span>
                                    <span className="text-slate-900">{count} <span className="text-slate-400 font-medium ml-1">({Math.round(count / stats.total * 100)}%)</span></span>
                                </div>
                                <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200/50">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-1000 group-hover:from-blue-500 group-hover:to-indigo-500"
                                        style={{ width: `${(count / maxCount) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submissions Timeline List */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <Calendar className="text-indigo-600" size={24} />
                            Daily Registration Trend
                        </h3>
                        <p className="text-slate-500 text-sm mt-1">A quick look at the submission volume over time.</p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 max-h-[350px] overflow-y-auto">
                        <div className="space-y-3">
                            {Object.entries(stats.byDate).sort((a, b) => new Date(b[0]) - new Date(a[0])).map(([date, count]) => (
                                <div key={date} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                                    <span className="text-sm font-bold text-slate-700">{date}</span>
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-1">
                                            {[...Array(Math.min(count, 5))].map((_, i) => (
                                                <div key={i} className="w-2 h-2 rounded-full bg-blue-400 ring-2 ring-white" />
                                            ))}
                                            {count > 5 && <span className="text-[10px] font-black text-slate-400 ml-2">+{count - 5}</span>}
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pro Tip */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                        <Share2 size={40} className="text-blue-400" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-2xl font-black tracking-tight mb-2">Track more sources!</h4>
                        <p className="text-indigo-100/70 leading-relaxed font-medium">
                            Add <code className="bg-black/30 px-2 py-0.5 rounded text-blue-300">?source=TWITTER</code> or similar parameters to your registration links.
                            Our system will automatically capture and categorize these new sources in this dashboard.
                        </p>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
            </div>
        </div>
    );
}
