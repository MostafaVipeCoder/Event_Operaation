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
        <div 
            className="min-h-screen font-manrope flex items-center justify-center p-6 relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-athar-blue/10 via-white to-white"
            dir="rtl"
        >
            {/* Noise Texture Overlay - Uses inline SVG to avoid 404s */}
            <div 
                className="absolute inset-0 opacity-20 mix-blend-soft-light pointer-events-none" 
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
                {/* Logo/Brand Area */}
                <div className="text-center mb-10 flex flex-col items-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-athar-blue to-athar-black rounded-lg shadow-2xl shadow-athar-blue/20 mb-6 group transition-all duration-500 hover:scale-105 hover:rotate-3">
                        <Lock className="text-white w-8 h-8" />
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-3">
                        <span className="text-athar-black">Project</span>{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-athar-blue to-athar-yellow">
                            Manager
                        </span>
                    </h1>
                    <p className="text-slate-500 font-medium text-lg">
                        سجل دخولك لإدارة مشاريعك
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-white border border-slate-200/60 rounded-lg p-8 sm:p-10 shadow-2xl relative">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-athar-yellow/10 text-athar-black p-4 rounded-lg text-sm font-semibold border border-athar-yellow/30 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                <div className="w-2 h-2 rounded-full bg-athar-yellow animate-pulse" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-athar-black block">
                                البريد الإلكتروني
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-athar-blue transition-colors z-10">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pr-12 pl-4 py-3.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-athar-blue/20 focus:border-athar-blue transition-all outline-none font-medium placeholder:text-slate-300 text-athar-black"
                                    placeholder="your@email.com"
                                    required
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-athar-black block">
                                كلمة المرور
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-athar-blue transition-colors z-10">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pr-12 pl-4 py-3.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-athar-blue/20 focus:border-athar-blue transition-all outline-none font-medium placeholder:text-slate-300 text-athar-black"
                                    placeholder="••••••••"
                                    required
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full overflow-hidden bg-athar-blue text-white py-4 px-6 rounded-lg font-semibold text-lg shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:translate-y-0 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-athar-yellow"
                        >
                            {/* Hover Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-athar-blue via-athar-blue/80 to-athar-yellow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            
                            <span className="relative z-10 flex items-center gap-3">
                                {loading ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <>
                                        تسجيل الدخول
                                        <ArrowRight size={20} className="mr-1 rotate-180" />
                                    </>
                                )}
                            </span>
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
