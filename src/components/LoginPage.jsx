import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error: signInError } = await signIn({ email, password });
            if (signInError) throw signInError;
            navigate(from, { replace: true });
        } catch (err) {
            setError(err.message || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-200 font-manrope flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[120px] -mr-96 -mt-96 opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[100px] -ml-64 -mb-64 opacity-50"></div>

            <div className="w-full max-w-md relative">
                {/* Logo/Brand Area */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-[#1a27c9] rounded-[2rem] shadow-2xl shadow-indigo-200 mb-6 group transition-all duration-500 hover:rotate-12">
                        <Lock className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-black text-[#0d0e0e] tracking-tight mb-3">
                        Project Manager
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">
                        سجل دخولك لإدارة مشاريعك
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-slate-50 border border-slate-100 rounded-[3rem] p-10 shadow-2xl shadow-indigo-100/50 backdrop-blur-xl relative z-10">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-semibold border border-red-100 animate-shake">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-2 block">
                                البريد الإلكتروني
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1a27c9] transition-colors">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-[#1a27c9] transition-all outline-none font-medium placeholder:text-slate-300"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 ml-2 block">
                                كلمة المرور
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#1a27c9] transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-[#1a27c9] transition-all outline-none font-medium placeholder:text-slate-300"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1a27c9] text-white py-4 px-6 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-[#151eb0] hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:translate-y-0 active:scale-95"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    تسجيل الدخول
                                    <ArrowRight size={22} className="ml-1" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Info */}
                <p className="text-center mt-8 text-slate-400 text-sm font-medium">
                    &copy; 2026 Athar Accelerator. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
