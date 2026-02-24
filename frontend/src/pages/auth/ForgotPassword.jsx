import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import { Mail, KeyRound, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await authApi.forgotPassword({ email });
            setSuccessMsg(res.data?.message || "OTP sent successfully!");
            setTimeout(() => {
                setSuccessMsg('');
                setStep(2);
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to send OTP. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndReset = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await authApi.resetPassword({ email, otp, newPassword });
            setSuccessMsg(res.data?.message || "Password reset successfully!");
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid OTP or request failed.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium";

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Decors */}
            <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="mb-8 text-center relative z-10 w-full max-w-md">
                <Link to="/login" className="mb-6 inline-block text-text-secondary hover:text-white transition-colors text-sm font-medium">
                    &larr; Back to Login
                </Link>
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_30px_rgba(77,163,255,0.4)]">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Password Recovery</h2>
                <p className="text-text-secondary">
                    {step === 1 ? "Enter your email to receive an OTP." : "Verify OTP and set a new password."}
                </p>
            </div>

            <div className="glass-panel w-full max-w-md p-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
                {/* Stepper Indicator */}
                <div className="flex items-center justify-between mb-8 relative">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 rounded-full z-0"></div>
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full z-0 transition-all duration-500" style={{ width: step === 1 ? '50%' : '100%' }}></div>

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-colors ${step >= 1 ? 'bg-primary text-background' : 'bg-background border-2 border-white/20 text-white'}`}>
                        <span className="font-bold text-sm">1</span>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 transition-colors ${step >= 2 ? 'bg-primary text-background' : 'bg-background border-2 border-white/20 text-text-secondary'}`}>
                        {step === 2 && !successMsg ? <span className="font-bold text-sm">2</span> : <ShieldCheck className="w-4 h-4" />}
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm font-medium text-center">
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/30 text-success text-sm font-medium text-center">
                        {successMsg}
                    </div>
                )}

                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                        <div>
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
                                    className={inputClass}
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full bg-primary text-background font-bold px-4 py-3 rounded-xl flex items-center justify-center hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 mt-4 group"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" /> : <>Send OTP <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></>}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleVerifyAndReset} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Enter 6-digit OTP</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-text-secondary" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className={inputClass + " tracking-widest font-bold"}
                                    placeholder="------"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">New Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-text-secondary" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    minLength="6"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={inputClass}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !otp || !newPassword}
                            className="w-full bg-primary text-background font-bold px-4 py-3 rounded-xl flex items-center justify-center hover:bg-primary/90 transition-all duration-300 disabled:opacity-50 mt-4 group"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" /> : <>Reset Password <ShieldCheck className="w-5 h-5 ml-2" /></>}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
