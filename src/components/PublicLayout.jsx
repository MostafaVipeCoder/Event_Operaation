import React from 'react';
import { NavLink, Outlet, useParams, useSearchParams } from 'react-router-dom';
import { Calendar, Users, Briefcase } from 'lucide-react';

export default function PublicLayout() {
    const { eventId } = useParams();

    const [searchParams] = useSearchParams();
    const lang = searchParams.get('lang') === 'ar' ? 'ar' : 'en';
    const isRtl = lang === 'ar';

    const translations = {
        en: {
            agenda: "Agenda",
            experts: "Experts",
            companies: "Companies"
        },
        ar: {
            agenda: "الأجندة",
            experts: "الخبراء",
            companies: "الشركات"
        }
    };

    const t = translations[lang];
    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';

    const navItems = [
        { path: `/agenda/${eventId}${queryStr}`, label: t.agenda, icon: <Calendar size={20} /> },
        { path: `/view/${eventId}/experts${queryStr}`, label: t.experts, icon: <Users size={20} /> },
        { path: `/view/${eventId}/startups${queryStr}`, label: t.companies, icon: <Briefcase size={20} /> },
    ];

    return (
        <div 
            dir={isRtl ? 'rtl' : 'ltr'} 
            className={`min-h-screen bg-slate-50 ${isRtl ? 'font-arabic' : 'font-manrope'}`}
        >
            {/* Desktop Header */}
            <header className="hidden md:block sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-center">
                    
                    <nav className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isActive
                                        ? 'bg-white text-[#1a27c9] shadow-sm shadow-indigo-100 ring-1 ring-indigo-50'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`
                                }
                            >
                                {item.icon}
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="pb-24 md:pb-12">
                <Outlet />
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-6 inset-x-6 z-50 bg-white/90 backdrop-blur-2xl border border-slate-100 shadow-2xl shadow-indigo-200/40 rounded-[2.5rem] p-2 flex items-center justify-around">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 px-4 py-3 rounded-3xl transition-all ${isActive
                                ? 'bg-indigo-50 text-[#1a27c9]'
                                : 'text-slate-400'
                            }`
                        }
                    >
                        {item.icon}
                        <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
