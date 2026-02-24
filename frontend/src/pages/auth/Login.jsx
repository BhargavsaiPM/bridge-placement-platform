import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await authApi.login({ email, password });
            const token = res.data.token || res.data; // Handle both {token: '...'} and raw token string cases

            if (token && typeof token === 'string') {
                localStorage.setItem('token', token);

                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const rolesStr = JSON.stringify(payload);

                    if (rolesStr.includes('SUPER_ADMIN')) {
                        navigate('/admin/dashboard');
                    } else if (rolesStr.includes('COMPANY')) {
                        navigate('/company/dashboard');
                    } else if (rolesStr.includes('PLACEMENT_OFFICER')) {
                        navigate('/officer/dashboard');
                    } else {
                        navigate('/user/dashboard'); // Student/Professional
                    }
                } catch (e) {
                    navigate('/jobs');
                }
            } else {
                throw new Error("Invalid token format received");
            }
        } catch (err) {
            console.error("Login failed", err);
            setError("Invalid credentials or server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="mb-12 text-center relative z-10">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_30px_rgba(77,163,255,0.4)]">
                        <span className="font-bold text-white text-2xl">B</span>
                    </div>
                    <span className="text-4xl font-black tracking-wider text-text-primary">BRIDGE</span>
                </div>
                <p className="text-text-secondary text-lg">Sign in to your account</p>

                <div className="mt-4">
                    <Link to="/" className="text-primary hover:text-white transition-colors font-medium">
                        &larr; Back to Home
                    </Link>
                </div>
            </div>

            <div className="glass-panel w-full max-w-md p-8 relative z-50 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

                <form onSubmit={handleLogin} className="space-y-5 relative z-50">
                    {error && (
                        <div className="p-3 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="relative z-50">
                        <label className="block text-sm font-medium text-text-secondary mb-2">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-text-secondary" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium relative z-50 pointer-events-auto"
                                style={{ position: 'relative', zIndex: 100 }}
                                placeholder="admin@bridge.com"
                            />
                        </div>
                    </div>

                    <div className="relative z-50">
                        <label className="block text-sm font-medium text-text-secondary mb-2">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-text-secondary" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium relative z-50 pointer-events-auto"
                                style={{ position: 'relative', zIndex: 100 }}
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="pt-2 relative z-50 pointer-events-auto" style={{ position: 'relative', zIndex: 100 }}>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-background font-bold px-4 py-3 rounded-xl flex items-center justify-center hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 mt-4 group shadow-[0_0_20px_rgba(77,163,255,0.3)] hover:shadow-[0_0_25px_rgba(77,163,255,0.5)] cursor-pointer"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-background border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    Continue securely
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>

                    <div className="flex flex-col space-y-3 pt-4 text-center relative z-50 pointer-events-auto" style={{ position: 'relative', zIndex: 100 }}>
                        <Link to="/forgot-password" className="text-primary hover:text-white transition-colors text-sm font-medium px-2 py-1">
                            Forgot Password?
                        </Link>
                        <div className="text-text-secondary text-sm">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-primary hover:text-white transition-colors font-bold px-2 py-1">
                                Create new user &rarr;
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
