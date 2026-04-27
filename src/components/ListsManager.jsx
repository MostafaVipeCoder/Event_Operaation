import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Users, 
    Rocket, 
    ArrowLeft,
    Search,
    Filter,
    LayoutGrid,
    Settings,
    MoreVertical
} from 'lucide-react';
import ExpertManager from './ExpertManager';
import StartupManager from './StartupManager';

const ListsManager = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [activeList, setActiveList] = useState('mentors'); // 'mentors' or 'ventures'

    return (
        <div className="min-h-screen bg-gray-50/50 font-manrope selection:bg-[#059669]/10 selection:text-[#059669]">
            {/* Main Header */}
            <div className="bg-white border-b border-slate-100 z-30 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex flex-col gap-4 sm:gap-6">
                        {/* Top row: Back + Title + Context */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 sm:gap-5">
                                <button
                                    onClick={() => navigate(`/event/${eventId}`)}
                                    className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-[#059669] hover:border-[#059669] hover:bg-white transition-premium group tap-target shrink-0"
                                >
                                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                </button>
                                <div>
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <h1 className="text-lg sm:text-3xl font-black text-[#0d0e0e] tracking-tight">Lists</h1>
                                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[8px] sm:text-[10px] font-black uppercase tracking-wider border border-emerald-100">Unified</span>
                                    </div>
                                    <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Manage Mentors & Ventures</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="hidden xs:flex flex-col items-end">
                                    <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Module</span>
                                    <span className="text-[10px] sm:text-sm font-bold text-[#0d0e0e]">{activeList === 'mentors' ? 'Mentors' : 'Ventures'}</span>
                                </div>
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                                    <Settings size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex items-center justify-between border-t border-slate-50 pt-3 sm:pt-4">
                            <div className="flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl sm:rounded-2xl w-full sm:w-auto">
                                <button
                                    onClick={() => setActiveList('mentors')}
                                    className={`flex-1 sm:flex-none px-4 sm:px-10 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 ${activeList === 'mentors'
                                        ? 'bg-white text-[#059669] shadow-premium scale-[1.02] ring-1 ring-black/5'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    <Users size={16} className={activeList === 'mentors' ? 'animate-pulse' : ''} />
                                    <span>Mentors</span>
                                </button>
                                <button
                                    onClick={() => setActiveList('ventures')}
                                    className={`flex-1 sm:flex-none px-4 sm:px-10 py-2 sm:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 ${activeList === 'ventures'
                                        ? 'bg-white text-[#059669] shadow-premium scale-[1.02] ring-1 ring-black/5'
                                        : 'text-slate-400 hover:text-slate-600'
                                        }`}
                                >
                                    <Rocket size={16} className={activeList === 'ventures' ? 'animate-bounce' : ''} />
                                    <span>Ventures</span>
                                </button>
                            </div>
                            
                            <div className="hidden lg:flex items-center gap-6 text-slate-400">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Real-time Sync</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Embedded Content Area */}
            <main className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                {activeList === 'mentors' ? (
                    <ExpertManager isEmbedded={true} />
                ) : (
                    <StartupManager isEmbedded={true} />
                )}
            </main>

        </div>
    );
};

export default ListsManager;
