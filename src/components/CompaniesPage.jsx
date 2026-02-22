import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Search, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CompanyCard from './CompanyCard';
import { getStartups } from '../lib/api';

const CompaniesPage = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
        <div className="min-h-screen bg-gray-200 font-['Manrope']">
            {/* Header */}
            <div className="bg-gray-200 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/')}
                                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                            >
                                <ArrowLeft size={24} />
                            </button>
                            <div>
                                <h1 className="text-2xl font-extrabold text-[#0d0e0e]">Accepted Companies</h1>
                                <p className="text-sm text-slate-500">Manage and view the startup cohort</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 bg-[#1a27c9] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#1a27c9]/90 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-0.5 duration-300">
                            <Plus size={18} />
                            <span>Add Company</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Search / Filter Toolbar */}
                <div className="mb-8">
                    <div className="relative max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:placeholder-slate-300 focus:ring-2 focus:ring-[#1a27c9] focus:border-transparent sm:text-sm shadow-sm transition-shadow"
                            placeholder="Search companies by name or industry..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <Loader className="h-12 w-12 text-[#1a27c9] animate-spin" />
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center">
                        <p className="text-rose-600 font-bold">{error}</p>
                        <button
                            onClick={loadCompanies}
                            className="mt-4 px-6 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors"
                        >
                            إعادة المحاولة
                        </button>
                    </div>
                )}

                {/* Grid */}
                {!loading && !error && filteredCompanies.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCompanies.map(company => (
                            <CompanyCard key={company.startup_id} company={company} />
                        ))}
                    </div>
                )}

                {!loading && !error && filteredCompanies.length === 0 && (
                    <div className="text-center py-20">
                        <div className="bg-slate-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <Search size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-[#0d0e0e]">No companies found</h3>
                        <p className="text-slate-500">Try adjusting your search terms.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompaniesPage;
