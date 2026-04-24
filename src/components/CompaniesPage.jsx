import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Loader, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CompanyCard from './CompanyCard';
import { getStartups } from '../lib/api';

const CompaniesPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await getStartups();
            setCompanies(data || []);
        } catch (err) {
            console.error('Error loading companies:', err);
            setError('فشل تحميل الشركات. يرجى المحاولة مرة أخرى.');
        } finally {
            setLoading(false);
        }
    };

    const filteredCompanies = companies.filter(company =>
        company.startup_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
    return (
        <div className="min-h-screen bg-background text-foreground font-manrope font-semibold relative overflow-x-hidden">
            {/* Page Background Gradients and Noise */}
            <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-athar-blue/5 via-background to-background" />
            <div 
                className="pointer-events-none fixed inset-0 z-0 opacity-10 mix-blend-soft-light" 
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            {/* Header */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <button
                                onClick={() => navigate('/')}
                                className="p-2 sm:p-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-premium"
                            >
                                <ArrowLeft size={18} className="sm:size-5" />
                            </button>
                            <div>
                                <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                                    <div className="bg-athar-blue p-1 rounded-lg sm:p-1.5">
                                        <Layout className="text-white" size={14} className="sm:size-[18px]" />
                                    </div>
                                    <h1 className="text-lg sm:text-2xl font-black tracking-tight">Companies Hub</h1>
                                </div>
                                <p className="text-[10px] sm:text-sm text-muted-foreground font-semibold">Startup cohort management</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3">
                            {/* Desktop Search */}
                            <div className="hidden md:relative md:group md:block md:min-w-[300px]">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-athar-blue transition-colors" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Search companies..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-2.5 bg-muted/50 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-athar-blue/20 focus:border-athar-blue transition-premium font-semibold"
                                />
                            </div>

                            {/* Mobile Search Toggle */}
                            <button 
                                onClick={() => setShowMobileSearch(!showMobileSearch)}
                                className={`md:hidden p-2.5 rounded-xl transition-all ${showMobileSearch ? 'bg-athar-blue text-white shadow-lg shadow-athar-blue/20' : 'bg-muted text-muted-foreground'}`}
                            >
                                <Search size={20} />
                            </button>

                            <button className="flex items-center gap-2 bg-athar-blue text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold hover:bg-athar-blue/90 transition-all shadow-lg shadow-athar-blue/20 hover:-translate-y-0.5 duration-300">
                                <Plus size={18} />
                                <span className="hidden sm:inline">Add Company</span>
                            </button>
                        </div>
                    </div>

                    {/* Expandable Mobile Search Bar */}
                    <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${showMobileSearch ? 'max-h-20 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input 
                                type="text"
                                placeholder="Search by name or industry..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-muted/80 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-athar-blue/20 focus:border-athar-blue transition-premium font-semibold text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="relative z-10 max-w-[1600px] mx-auto px-6 py-10">
                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center h-96 py-20">
                        <div className="relative mb-6">
                            <div className="h-16 w-16 border-4 border-athar-blue/10 border-t-athar-blue rounded-full animate-spin"></div>
                            <Layout className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-athar-blue animate-pulse" size={24} />
                        </div>
                        <p className="text-xl font-bold text-muted-foreground">Loading companies...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-destructive/5 border border-destructive/20 rounded-[2.5rem] p-12 text-center backdrop-blur-sm">
                        <div className="bg-destructive/10 p-6 rounded-3xl w-fit mx-auto mb-6 text-destructive">
                            <AlertCircle size={48} />
                        </div>
                        <p className="text-destructive font-black text-xl mb-6">{error}</p>
                        <button
                            onClick={loadCompanies}
                            className="px-8 py-3 bg-destructive text-white rounded-2xl font-bold hover:bg-destructive/90 transition-premium shadow-lg shadow-destructive/20"
                        >
                            إعادة المحاولة
                        </button>
                    </div>
                )}

                {/* Grid */}
                {!loading && !error && filteredCompanies.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-8">
                        {filteredCompanies.map(company => (
                            <CompanyCard key={company.startup_id} company={company} customColor="#1a27c9" />
                        ))}
                    </div>
                )}

                {!loading && !error && filteredCompanies.length === 0 && (
                    <div className="text-center py-24 bg-muted/30 rounded-[2.5rem] border-2 border-dashed border-border/50">
                        <div className="bg-muted p-6 rounded-3xl w-fit mx-auto mb-6">
                            <Search size={48} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-black mb-2">No companies found</h3>
                        <p className="text-muted-foreground font-medium">Try adjusting your search terms.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CompaniesPage;
