import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, LayoutGrid, List } from 'lucide-react';
import { getEvent, getCompanies } from '../lib/api';
import CompanyCard from './CompanyCard';

export default function StartupViewer() {
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [themeColor, setThemeColor] = useState('#1a27c9'); // Default indigo
    const [viewMode] = useState('list'); // Forced Immersive Layout
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [eventData, companiesData] = await Promise.all([
                    getEvent(eventId),
                    getCompanies(eventId)
                ]);

                setEvent(eventData);
                setCompanies(companiesData || []);

                // Load custom theme from Supabase event data
                if (eventData?.startups_color) {
                    setThemeColor(eventData.startups_color);
                }

                // Update Page Title
                if (eventData?.event_name) {
                    document.title = `Athar Events | ${eventData.event_name}`;
                }
            } catch (e) {
                console.error('Failed to sync Companies List:', e);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [eventId]);

    const toggleLayout = (mode) => {
        // Obsolete but kept helper if needed
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center font-manrope">
            <div className="relative mb-8">
                <div className="w-16 h-16 border-4 border-slate-50 border-t-[#1a27c9] rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 bg-[#1a27c9]/10 rounded-full animate-pulse"></div>
                </div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Scanning Ecosystem</p>
        </div>
    );

    if (!event || event.error) return (
        <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center font-manrope p-6 text-center">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center text-rose-500 mb-8 border border-rose-50">
                <ArrowLeft size={32} />
            </div>
            <h2 className="text-2xl font-black text-[#0d0e0e] tracking-tight mb-2">Engine Offline</h2>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-xs">The startup data stream for this event could not be found.</p>
            <button onClick={() => navigate('/')} className="mt-8 text-[#1a27c9] font-black text-[10px] uppercase tracking-[0.2em] hover:opacity-70 transition-premium">Return to Base</button>
        </div>
    );

    return (
        <div className="min-h-screen pb-32 pt-8 selection:bg-[#1a27c9]/10 selection:text-[#1a27c9]">
            {/* Professional Background Accent */}
            <div
                className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.03] -mr-64 -mt-64 pointer-events-none"
                style={{ backgroundColor: themeColor }}
            />

            <div className="max-w-7xl mx-auto px-6 relative z-10 transition-all duration-700">
                {/* Enterprise Header */}
                <div className="mb-20 text-center relative group">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="w-12 h-1 bg-[#1a27c9] rounded-full" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Companies List</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-[#0d0e0e] tracking-tighter mb-6 leading-none uppercase">
                            Startup <span className="text-[#1a27c9]">Directory</span>
                        </h1>
                        <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl leading-relaxed">
                            A curated showcase of the high-growth industrial and tech startups revolutionizing the ecosystem.
                        </p>
                    </div>
                </div>

                {/* Grid Layout - Dynamic spacing based on viewMode */}
                <div className={`grid gap-12 transition-all duration-700 ${viewMode === 'list'
                    ? 'grid-cols-1 max-w-6xl mx-auto'
                    : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
                    }`}>
                    {companies.map(company => (
                        <CompanyCard
                            key={company.company_id || company.id}
                            company={company}
                            customColor={themeColor}
                            viewMode={viewMode}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
