import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import SkillSelect from '../../components/shared/SkillSelect';
import AddressFields from '../../components/shared/AddressFields';
import { User, Building2, Mail, Lock, Phone, Calendar, ArrowRight, Upload, X, Eye, EyeOff } from 'lucide-react';

export default function Register() {
    const [tab, setTab] = useState('user');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    // Password visibility
    const [showUserPass, setShowUserPass] = useState(false);
    const [showUserConfirm, setShowUserConfirm] = useState(false);
    const [showCompanyPass, setShowCompanyPass] = useState(false);
    const [showCompanyConfirm, setShowCompanyConfirm] = useState(false);

    // User State
    const [userData, setUserData] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        mobile: '', dob: '', roleType: 'STUDENT', githubLink: ''
    });
    const [userAddress, setUserAddress] = useState({
        doorNumber: '', streetName: '', city: '', state: '', pincode: '', country: '', landmark: ''
    });
    const [skills, setSkills] = useState([]);
    const [resumeFile, setResumeFile] = useState(null);
    const resumeInputRef = useRef(null);

    // Company State
    const [companyData, setCompanyData] = useState({
        name: '', domainEmail: '', password: '', confirmPassword: '', companyType: 'MNC', industrySector: ''
    });
    const [companyAddress, setCompanyAddress] = useState({
        doorNumber: '', streetName: '', city: '', state: '', pincode: '', country: '', landmark: ''
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setError('Only PDF files are allowed for resumes.');
                e.target.value = '';
                return;
            }
            if (file.size > 6 * 1024 * 1024) {
                setError('File size must be less than 6MB.');
                e.target.value = '';
                return;
            }
            setError('');
            setResumeFile(file);
        }
    };

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (userData.password !== userData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            let resumeFileName = '';
            if (resumeFile) {
                const uploadRes = await authApi.uploadFile(resumeFile);
                resumeFileName = uploadRes.data.url;
            }
            const address = Object.values(userAddress).filter(v => v?.trim()).join(', ');
            const payload = {
                ...userData,
                address,
                skills: skills.join(', '),
                resumeFileName
            };
            delete payload.confirmPassword;
            await authApi.registerUser(payload);
            setSuccessMsg('Registration successful! You can now log in.');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCompanySubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (companyData.password !== companyData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setLoading(true);
        try {
            const payload = { ...companyData, ...companyAddress };
            delete payload.confirmPassword;
            if (!payload.industrySector) {
                delete payload.industrySector;
            }
            await authApi.registerCompany(payload);
            setSuccessMsg('Company registered successfully! Wait for Admin approval.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = 'w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm';
    const inputWithRightPadClass = 'w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium text-sm';

    const PasswordField = ({ label, value, onChange, show, setShow, ring = 'primary' }) => (
        <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">{label}</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="w-4 h-4 text-text-secondary" />
                </div>
                <input
                    type={show ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={value}
                    onChange={onChange}
                    className={inputWithRightPadClass.replace('primary', ring)}
                    placeholder="6+ characters"
                />
                <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-white transition-colors"
                >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 py-12 relative overflow-hidden">
            <div className="fixed top-0 left-0 right-0 z-[100] px-6 py-4 bg-background/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_15px_rgba(77,163,255,0.3)]">
                            <span className="font-bold text-white text-xl">B</span>
                        </div>
                        <span className="text-2xl font-bold tracking-wider text-white">BRIDGE</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="px-6 py-2.5 rounded-xl font-bold text-text-primary border border-white/10 hover:bg-white/5 transition-colors">
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>

            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-2xl text-center mt-20 mb-8 relative z-10">
                <Link to="/" className="inline-flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(77,163,255,0.4)]">
                        <span className="font-bold text-white text-xl">B</span>
                    </div>
                    <span className="text-3xl font-black tracking-wider text-text-primary">BRIDGE</span>
                </Link>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent mb-2">
                    Create Your Account
                </h1>
                <p className="text-text-secondary">Join Bridge to connect, hire, and grow.</p>
            </div>

            <div className="glass-panel w-full max-w-2xl p-6 md:p-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">

                {/* Tabs */}
                <div className="flex p-1 bg-white/5 border border-white/10 rounded-xl mb-8">
                    <button
                        type="button"
                        onClick={() => { setTab('user'); setError(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${tab === 'user' ? 'bg-primary text-background shadow-md' : 'text-text-secondary hover:text-white'}`}
                    >
                        <User className="w-4 h-4" /> User (Student/Pro)
                    </button>
                    <button
                        type="button"
                        onClick={() => { setTab('company'); setError(''); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${tab === 'company' ? 'bg-secondary text-background shadow-md' : 'text-text-secondary hover:text-white'}`}
                    >
                        <Building2 className="w-4 h-4" /> Company
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm font-medium text-center flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
                    </div>
                )}
                {successMsg && (
                    <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/30 text-success text-sm font-medium text-center">
                        {successMsg}
                    </div>
                )}

                {/* USER FORM */}
                {tab === 'user' && (
                    <form onSubmit={handleUserSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Full Name</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="w-4 h-4 text-text-secondary" /></div>
                                    <input type="text" required value={userData.name} onChange={e => setUserData({ ...userData, name: e.target.value })} className={inputClass} placeholder="John Doe" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="w-4 h-4 text-text-secondary" /></div>
                                    <input type="email" required value={userData.email} onChange={e => setUserData({ ...userData, email: e.target.value })} className={inputClass} placeholder="john@example.com" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <PasswordField label="Password" value={userData.password} onChange={e => setUserData({ ...userData, password: e.target.value })} show={showUserPass} setShow={setShowUserPass} />
                            <PasswordField label="Confirm Password" value={userData.confirmPassword} onChange={e => setUserData({ ...userData, confirmPassword: e.target.value })} show={showUserConfirm} setShow={setShowUserConfirm} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Mobile</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="w-4 h-4 text-text-secondary" /></div>
                                    <input type="text" value={userData.mobile} onChange={e => setUserData({ ...userData, mobile: e.target.value })} className={inputClass} placeholder="+91 98765 43210" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2">Date of Birth</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Calendar className="w-4 h-4 text-text-secondary" /></div>
                                    <input type="date" required value={userData.dob} onChange={e => setUserData({ ...userData, dob: e.target.value })} className={inputClass} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">I am a</label>
                            <div className="flex gap-6 items-center">
                                {['STUDENT', 'PROFESSIONAL'].map(role => (
                                    <label key={role} className="flex items-center gap-2 cursor-pointer group">
                                        <input type="radio" name="roleType" value={role} checked={userData.roleType === role} onChange={e => setUserData({ ...userData, roleType: e.target.value })} className="text-primary focus:ring-primary" />
                                        <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">{role.charAt(0) + role.slice(1).toLowerCase()}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <SkillSelect selectedSkills={skills} onChange={setSkills} />

                        {/* Address */}
                        <div>
                            <h4 className="text-sm font-semibold text-text-secondary border-b border-white/10 pb-2 mb-4">Address Details</h4>
                            <AddressFields value={userAddress} onChange={setUserAddress} />
                        </div>

                        {/* Resume Upload */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Resume (PDF only, Max 6MB)</label>
                            <input type="file" ref={resumeInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                            {resumeFile ? (
                                <div className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-success/10 border border-success/30 rounded-xl">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Upload className="w-4 h-4 text-success flex-shrink-0" />
                                        <span className="text-sm font-medium text-success truncate">{resumeFile.name}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setResumeFile(null); resumeInputRef.current.value = ''; }}
                                        className="p-1 rounded-lg hover:bg-danger/20 text-danger flex-shrink-0 transition-colors"
                                        title="Remove file"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => resumeInputRef.current?.click()}
                                    className="w-full flex items-center justify-center gap-3 px-4 py-6 bg-white/5 border border-dashed border-white/20 hover:border-primary/50 rounded-xl cursor-pointer transition-colors group"
                                >
                                    <Upload className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                                    <span className="text-sm font-medium text-text-secondary group-hover:text-white transition-colors">Click to Upload Resume</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-2 relative z-50" style={{ position: 'relative', zIndex: 100 }}>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-background font-bold px-4 py-3 rounded-xl flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-50 mt-4 group shadow-[0_0_20px_rgba(77,163,255,0.3)] pointer-events-auto"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" /> : <>Create User Account <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>}
                            </button>
                        </div>
                    </form>
                )}

                {/* COMPANY FORM */}
                {tab === 'company' && (
                    <form onSubmit={handleCompanySubmit} className="space-y-6">
                        <div className="space-y-5">
                            <h3 className="font-semibold text-white border-b border-white/10 pb-2">Company Basics</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Company Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Building2 className="w-4 h-4 text-text-secondary" /></div>
                                        <input type="text" required value={companyData.name} onChange={e => setCompanyData({ ...companyData, name: e.target.value })} className={inputClass} placeholder="Acme Corp" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Domain Email</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="w-4 h-4 text-text-secondary" /></div>
                                        <input type="email" required value={companyData.domainEmail} onChange={e => setCompanyData({ ...companyData, domainEmail: e.target.value })} className={inputClass} placeholder="careers@acme.com" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <PasswordField label="Password" value={companyData.password} onChange={e => setCompanyData({ ...companyData, password: e.target.value })} show={showCompanyPass} setShow={setShowCompanyPass} ring="secondary" />
                                <PasswordField label="Confirm Password" value={companyData.confirmPassword} onChange={e => setCompanyData({ ...companyData, confirmPassword: e.target.value })} show={showCompanyConfirm} setShow={setShowCompanyConfirm} ring="secondary" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Company Type</label>
                                    <select
                                        value={companyData.companyType}
                                        onChange={e => setCompanyData({ ...companyData, companyType: e.target.value })}
                                        className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-medium text-sm"
                                    >
                                        {[
                                            ['MNC', 'MNC'], ['STARTUP', 'Startup'], ['SERVICE_BASED', 'Service Based'],
                                            ['PRODUCT_BASED', 'Product Based'], ['AGENCY', 'Agency'], ['CONSULTING', 'Consulting'],
                                            ['NON_PROFIT', 'Non-Profit'], ['OTHER', 'Other']
                                        ].map(([val, lbl]) => (
                                            <option key={val} value={val} className="bg-background text-white">{lbl}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-2">Industry Sector <span className="text-text-secondary/50 font-normal">(optional)</span></label>
                                    <select
                                        value={companyData.industrySector}
                                        onChange={e => setCompanyData({ ...companyData, industrySector: e.target.value })}
                                        className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all font-medium text-sm"
                                    >
                                        <option value="" className="bg-background text-white">Select Sector...</option>
                                        {[
                                            ['SOFTWARE', 'Software'], ['HARDWARE', 'Hardware'],
                                            ['ELECTRONICS', 'Electronics'], ['CORE_ENGINEERING', 'Core Engineering'],
                                            ['IT_SERVICES', 'IT Services'], ['FINANCE', 'Finance'],
                                            ['HEALTHCARE', 'Healthcare'], ['EDUCATION', 'Education'],
                                            ['MANUFACTURING', 'Manufacturing'], ['RETAIL', 'Retail'],
                                            ['LOGISTICS', 'Logistics'], ['OTHER', 'Other']
                                        ].map(([val, lbl]) => (
                                            <option key={val} value={val} className="bg-background text-white">{lbl}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/[0.02] p-4 rounded-xl border border-white/5">
                            <AddressFields value={companyAddress} onChange={setCompanyAddress} />
                        </div>

                        <div className="pt-2 relative z-50" style={{ position: 'relative', zIndex: 100 }}>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-secondary text-background font-bold px-4 py-3 rounded-xl flex items-center justify-center hover:bg-secondary/90 transition-all disabled:opacity-50 mt-4 group pointer-events-auto"
                            >
                                {loading ? <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" /> : <>Register Company <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></>}
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-8 text-center border-t border-white/10 pt-6 relative z-50">
                    <span className="text-text-secondary text-sm">Already have an account? </span>
                    <Link to="/login" className="text-white font-bold hover:text-primary transition-colors relative z-50 px-4 py-2">Sign In &rarr;</Link>
                </div>
            </div>
        </div>
    );
}
