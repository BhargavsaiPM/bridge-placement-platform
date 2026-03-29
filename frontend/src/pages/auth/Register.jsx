import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import SkillSelect from '../../components/shared/SkillSelect';
import AddressFields from '../../components/shared/AddressFields';
import { User, Building2, Mail, Lock, Phone, Calendar, ArrowRight, Upload, X, Eye, EyeOff, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoImg from '../../assets/Bridge-logo.png';

export default function Register() {
    const [tab, setTab] = useState('user'); // 'user' or 'company'
    const [step, setStep] = useState(1); // For multi-step user registration
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();
    const prevTabRef = React.useRef('user'); // track direction for animation

    // Password visibility
    const [showUserPass, setShowUserPass] = useState(false);
    const [showUserConfirm, setShowUserConfirm] = useState(false);
    const [showCompanyPass, setShowCompanyPass] = useState(false);
    const [showCompanyConfirm, setShowCompanyConfirm] = useState(false);

    // ==========================================
    // USER REGISTRATION STATE
    // ==========================================
    const [userData, setUserData] = useState({
        firstName: '', middleName: '', lastName: '',
        email: '', password: '', confirmPassword: '',
        mobile: '', dob: '', roleType: 'STUDENT', githubLink: '',
        // Student
        collegeRollNumber: '', collegeMailId: '', collegeName: '',
        // Professional
        employeeId: '', companyMailId: '', companyName: '', currentPosition: '',
        highestQualification: '', cgpa: '', passingYear: '', experienceYears: ''
    });

    const [collegeAddress, setCollegeAddress] = useState({
        doorNumber: '', streetName: '', city: '', district: '', state: '', pincode: '', country: ''
    });

    const [professionalAddress, setProfessionalAddress] = useState({
        doorNumber: '', streetName: '', city: '', district: '', state: '', pincode: '', country: ''
    });

    const [userAddress, setUserAddress] = useState({
        doorNumber: '', streetName: '', city: '', district: '', state: '', pincode: '', country: ''
    });

    const [skills, setSkills] = useState([]);

    // Files
    const [idCardFile, setIdCardFile] = useState(null); // Required
    const [resumeFile, setResumeFile] = useState(null); // Optional
    const idCardInputRef = useRef(null);
    const resumeInputRef = useRef(null);

    // ==========================================
    // COMPANY REGISTRATION STATE
    // ==========================================
    const [companyData, setCompanyData] = useState({
        name: '', domainEmail: '', password: '', confirmPassword: '', companyType: 'MNC', industrySector: ''
    });

    const [companyAddress, setCompanyAddress] = useState({
        doorNumber: '', streetName: '', city: '', district: '', state: '', pincode: '', country: '', landmark: ''
    });

    const [proofFile, setProofFile] = useState(null); // Required
    const proofInputRef = useRef(null);

    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // ==========================================
    // HANDLERS
    // ==========================================

    const validatePassword = (pass) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=])[A-Za-z\d@$!%*?&#^()_+\-=]{6,}$/;
        return regex.test(pass);
    };

    const handleFileChange = (e, setFile, type, maxSizeMB) => {
        const file = e.target.files[0];
        if (file) {
            const validImageTypes = ['image/jpeg', 'image/png'];
            const validPdfTypes = ['application/pdf'];
            const validProofTypes = [...validImageTypes, ...validPdfTypes];

            if (type === 'image' && !validImageTypes.includes(file.type)) {
                setError('Only JPG/PNG images are allowed for ID cards.');
                e.target.value = '';
                return;
            }
            if (type === 'pdf' && !validPdfTypes.includes(file.type)) {
                setError('Only PDF files are allowed for resumes.');
                e.target.value = '';
                return;
            }
            if (type === 'proof' && !validProofTypes.includes(file.type)) {
                setError('Only JPG/PNG/PDF files are allowed for proof documents.');
                e.target.value = '';
                return;
            }

            if (file.size > maxSizeMB * 1024 * 1024) {
                setError(`File size must be less than ${maxSizeMB}MB.`);
                e.target.value = '';
                return;
            }

            setError('');
            setFile(file);
        }
    };

    const nextStep = () => {
        setError('');
        if (step === 1) {
            if (!userData.firstName || !userData.lastName || !userData.email || !userData.password || !userData.confirmPassword || !userData.dob || !userData.mobile) {
                setError('Please fill all required fields in this step.');
                return;
            }
            if (!validatePassword(userData.password)) {
                setError('Password must be at least 6 characters and contain uppercase, lowercase, number, and symbol.');
                return;
            }
            if (userData.password !== userData.confirmPassword) {
                setError('Passwords do not match.');
                return;
            }
        } else if (step === 2) {
            if (userData.roleType === 'STUDENT') {
                if (!userData.collegeRollNumber || !userData.collegeMailId || !userData.collegeName || !userData.highestQualification || !userData.cgpa || !userData.passingYear) {
                    setError('Please fill all required college fields.');
                    return;
                }
            } else {
                if (!userData.employeeId || !userData.companyMailId || !userData.companyName || !userData.currentPosition || !userData.highestQualification || !userData.cgpa || !userData.passingYear) {
                    setError('Please fill all required professional fields.');
                    return;
                }
            }
        }
        setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => s - 1);

    const handleUserSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Final Validation
        if (!idCardFile) {
            setError('ID Card upload is required.');
            return;
        }

        setLoading(true);
        try {
            // 1. Upload ID Card
            const idCardRes = await authApi.uploadFile(idCardFile);
            const idCardUrl = idCardRes.data.url;

            // 2. Upload Resume (if any)
            let resumeUrl = '';
            if (resumeFile) {
                const resRes = await authApi.uploadFile(resumeFile);
                resumeUrl = resRes.data.url;
            }

            // 3. Prepare Payload
            const payload = {
                ...userData,
                cgpa: userData.cgpa === '' ? null : Number(userData.cgpa),
                passingYear: userData.passingYear ? Number(userData.passingYear) : null,
                experienceYears: userData.experienceYears === '' ? null : Number(userData.experienceYears),
                country: userAddress.country,
                state: userAddress.state,
                district: userAddress.district,
                city: userAddress.city,
                pincode: userAddress.pincode,
                street: userAddress.streetName,
                doorNumber: userAddress.doorNumber,
                collegeCity: collegeAddress.city,
                collegeDistrict: collegeAddress.district,
                collegeCountry: collegeAddress.country,
                collegePincode: collegeAddress.pincode,
                companyCity: professionalAddress.city,
                companyDistrict: professionalAddress.district,
                companyCountry: professionalAddress.country,
                companyPincode: professionalAddress.pincode,
                skills: skills.join(', '),
                resumeFileName: resumeUrl,
                [userData.roleType === 'STUDENT' ? 'studentIdCardUrl' : 'employeeIdCardUrl']: idCardUrl
            };
            delete payload.confirmPassword;

            // 4. Submit
            await authApi.registerUser(payload);
            setSuccessMsg('Registration submitted successfully! Please wait for Admin approval.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCompanySubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validatePassword(companyData.password)) {
            setError('Password must be at least 6 characters and contain uppercase, lowercase, number, and symbol.');
            return;
        }
        if (companyData.password !== companyData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!proofFile) {
            setError('Company registration proof document is required.');
            return;
        }

        setLoading(true);
        try {
            // 1. Upload Proof
            const proofRes = await authApi.uploadFile(proofFile);
            const proofUrl = proofRes.data.url;

            // 2. Prepare Payload
            const payload = {
                ...companyData,
                ...companyAddress,
                proofDocumentUrl: proofUrl,
                industrySector: companyData.industrySector || null
            };
            delete payload.confirmPassword;

            // 3. Submit
            await authApi.registerCompany(payload);
            setSuccessMsg('Company registered successfully! Please wait for Admin approval.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // RENDER HELPERS
    // ==========================================

    const inputClassWithIcon = "peer w-full pl-11 pr-4 pt-6 pb-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium text-base";
    const inputClassNoIcon = "peer w-full px-4 pt-6 pb-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium text-base";

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <div className="min-h-screen bg-background text-text-primary overflow-x-hidden font-sans relative flex flex-col items-center justify-center p-4">
            {/* Animated Background Mesh */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-primary/20 blur-[120px] mix-blend-screen animate-blob" />
                <div className="absolute top-[20%] right-[-5%] w-[35vw] h-[35vw] rounded-full bg-secondary/20 blur-[120px] mix-blend-screen animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-accent/15 blur-[150px] mix-blend-screen animate-blob animation-delay-4000" />
            </div>

            {/* Floating Glass Navbar */}
            <motion.nav 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className={`fixed top-4 left-0 right-0 z-50 transition-all duration-300 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`}
            >
                <div className={`flex items-center justify-between rounded-full px-6 py-2 ${isScrolled ? 'glass-nav' : 'bg-transparent'}`}>
                    <div className="flex items-center flex-1 justify-start">
                        <Link to="/" className="inline-block">
                            <img 
                                src={logoImg} 
                                alt="Bridge Logo" 
                                className="h-20 md:h-24 w-auto object-contain cursor-pointer hover:scale-105 transition-transform duration-300 relative z-10 drop-shadow-[0_0_15px_rgba(77,163,255,0.3)]" 
                            />
                        </Link>
                    </div>

                    <div className="flex items-center gap-3 flex-1 justify-end">
                        <Link
                            to="/login"
                            className="px-6 py-2.5 rounded-full font-bold text-white bg-white/10 border border-white/20 hover:bg-white/20 hover:scale-105 transition-all duration-300 text-base shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" /> Sign In
                        </Link>
                    </div>
                </div>
            </motion.nav>

            <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-[800px] relative z-10 mt-32 mb-12"
            >
                <div className="glass-panel p-8 md:p-12 lg:p-14 flex flex-col relative overflow-visible shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl min-h-[600px] justify-center">
                    
                    {/* Floating icon for trust */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary p-[1px] shadow-[0_0_40px_rgba(58,130,246,0.6)]">
                        <div className="w-full h-full rounded-3xl bg-surface-glass backdrop-blur-md flex items-center justify-center">
                            <ShieldCheck className="w-10 h-10 text-white" />
                        </div>
                    </div>

                    <div className="text-center mt-6 mb-8">
                        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Create an Account</h2>
                        <p className="text-sm text-text-muted">Join Bridge Placement Platform today</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1.5 bg-white/5 rounded-2xl mb-8 border border-white/10 shadow-inner">
                        <button
                            className={`flex-1 py-3 text-base font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${tab === 'user' ? 'bg-primary text-white shadow-[0_0_20px_rgba(58,130,246,0.4)]' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                            onClick={() => { prevTabRef.current = tab; setTab('user'); setStep(1); setError(''); }}
                        >
                            <User className="w-5 h-5" /> Professional / Student
                        </button>
                        <button
                            className={`flex-1 py-3 text-base font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${tab === 'company' ? 'bg-primary text-white shadow-[0_0_20px_rgba(58,130,246,0.4)]' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                            onClick={() => { prevTabRef.current = tab; setTab('company'); setError(''); }}
                        >
                            <Building2 className="w-5 h-5" /> Company
                        </button>
                    </div>

                    {error && (
                        <div className="p-3 mb-6 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm text-center font-medium">
                            {error}
                        </div>
                    )}
                    {successMsg && (
                        <div className="p-3 mb-6 rounded-xl bg-success/10 border border-success/30 text-success text-sm text-center font-medium">
                            {successMsg}
                        </div>
                    )}

                    {/* ======================= ANIMATED TAB CONTENT ======================= */}
                    <div className="relative overflow-hidden">
                    <AnimatePresence mode="wait" initial={false}>
                    {/* ======================= USER TAB ======================= */}
                    {tab === 'user' && (
                        <motion.div
                            key="user-tab"
                            initial={{ opacity: 0, x: prevTabRef.current === 'company' ? -60 : 60 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -60 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                        <form onSubmit={handleUserSubmit}>

                            {/* STEP 1: Personal Details & Auth */}
                            {step === 1 && (
                                <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                                    <h3 className="text-xl font-bold text-white border-b border-white/10 pb-3 mb-5 flex items-center gap-2"><User className="w-5 h-5 text-primary"/> Personal Details</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                            <input type="text" id="firstName" placeholder="First Name *" required className={inputClassWithIcon}
                                                value={userData.firstName} onChange={e => setUserData({ ...userData, firstName: e.target.value })} />
                                            <label htmlFor="firstName" className={`absolute left-11 transform transition-all duration-300 pointer-events-none ${userData.firstName ? 'text-xs top-2 text-white/80' : 'text-sm top-1/2 -translate-y-1/2 text-white/50 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-white/80'}`}>
                                                First Name *
                                            </label>
                                        </div>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                            <input type="text" id="middleName" placeholder="Middle Name (Opt)" className={inputClassWithIcon}
                                                value={userData.middleName} onChange={e => setUserData({ ...userData, middleName: e.target.value })} />
                                            <label htmlFor="middleName" className={`absolute left-11 transform transition-all duration-300 pointer-events-none ${userData.middleName ? 'text-xs top-2 text-white/80' : 'text-sm top-1/2 -translate-y-1/2 text-white/50 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-white/80'}`}>
                                                Middle Name (Opt)
                                            </label>
                                        </div>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                            <input type="text" id="lastName" placeholder="Last Name *" required className={inputClassWithIcon}
                                                value={userData.lastName} onChange={e => setUserData({ ...userData, lastName: e.target.value })} />
                                            <label htmlFor="lastName" className={`absolute left-11 transform transition-all duration-300 pointer-events-none ${userData.lastName ? 'text-xs top-2 text-white/80' : 'text-sm top-1/2 -translate-y-1/2 text-white/50 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-white/80'}`}>
                                                Last Name *
                                            </label>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                            <input type="email" id="personalEmail" placeholder="Personal Email *" required className={inputClassWithIcon}
                                                value={userData.email} onChange={e => setUserData({ ...userData, email: e.target.value })} />
                                            <label htmlFor="personalEmail" className={`absolute left-11 transform transition-all duration-300 pointer-events-none ${userData.email ? 'text-xs top-2 text-white/80' : 'text-sm top-1/2 -translate-y-1/2 text-white/50 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-white/80'}`}>
                                                Personal Email *
                                            </label>
                                        </div>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                            <input type="text" id="mobileNumber" placeholder="Mobile Number *" required className={inputClassWithIcon}
                                                value={userData.mobile} onChange={e => setUserData({ ...userData, mobile: e.target.value })} />
                                            <label htmlFor="mobileNumber" className={`absolute left-11 transform transition-all duration-300 pointer-events-none ${userData.mobile ? 'text-xs top-2 text-white/80' : 'text-sm top-1/2 -translate-y-1/2 text-white/50 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-white/80'}`}>
                                                Mobile Number *
                                            </label>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                            <input type={showUserPass ? "text" : "password"} id="userPass" placeholder="Password *" required className={inputClassWithIcon}
                                                value={userData.password} onChange={e => setUserData({ ...userData, password: e.target.value })} />
                                            <label htmlFor="userPass" className={`absolute left-11 transform transition-all duration-300 pointer-events-none ${userData.password ? 'text-xs top-2 text-white/80' : 'text-sm top-1/2 -translate-y-1/2 text-white/50 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-white/80'}`}>
                                                Password *
                                            </label>
                                            <button type="button" onClick={() => setShowUserPass(!showUserPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
                                                {showUserPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                            <input type={showUserConfirm ? "text" : "password"} id="confirmPass" placeholder="Confirm Password *" required className={inputClassWithIcon}
                                                value={userData.confirmPassword} onChange={e => setUserData({ ...userData, confirmPassword: e.target.value })} />
                                            <label htmlFor="confirmPass" className={`absolute left-11 transform transition-all duration-300 pointer-events-none ${userData.confirmPassword ? 'text-xs top-2 text-white/80' : 'text-sm top-1/2 -translate-y-1/2 text-white/50 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-white/80'}`}>
                                                Confirm Password *
                                            </label>
                                            <button type="button" onClick={() => setShowUserConfirm(!showUserConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
                                                {showUserConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-xs text-text-muted mt-1 px-1">Status: {userData.password && validatePassword(userData.password) ? <span className="text-success font-medium">Strong</span> : <span className="text-danger font-medium">Weak (Needs Uppercase, Lowercase, Number, Symbol, Min 6 chars)</span>}</p>

                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                        <input type="date" required className={inputClassWithIcon}
                                            value={userData.dob} onChange={e => setUserData({ ...userData, dob: e.target.value })} />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white/50 pointer-events-none">Date of Birth</span>
                                    </div>

                                    <button type="button" onClick={nextStep} className="w-full py-4 bg-white hover:bg-white/90 text-background rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-8 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98] text-lg">
                                        Next Step <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                        {/* STEP 2: Role Specific Details */}
                        {step === 2 && (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4">
                                <h3 className="text-xl font-bold text-white border-b border-white/10 pb-3 mb-5 flex items-center gap-2"><Building2 className="w-5 h-5 text-primary"/> Professional Information</h3>

                                <div className="flex gap-4 mb-8">
                                    <label className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl cursor-pointer border-2 transition-all font-bold ${userData.roleType === 'STUDENT' ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(58,130,246,0.3)]' : 'bg-white/5 border-white/10 text-text-muted hover:bg-white/10 hover:text-white'}`}>
                                        <input type="radio" name="roleType" value="STUDENT" className="hidden"
                                            checked={userData.roleType === 'STUDENT'} onChange={e => setUserData({ ...userData, roleType: e.target.value })} />
                                        Student
                                    </label>
                                    <label className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl cursor-pointer border-2 transition-all font-bold ${userData.roleType === 'WORKING' ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(58,130,246,0.3)]' : 'bg-white/5 border-white/10 text-text-muted hover:bg-white/10 hover:text-white'}`}>
                                        <input type="radio" name="roleType" value="WORKING" className="hidden"
                                            checked={userData.roleType === 'WORKING'} onChange={e => setUserData({ ...userData, roleType: e.target.value })} />
                                        Working Professional
                                    </label>
                                </div>

                                {userData.roleType === 'STUDENT' ? (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* College Roll Number - Floating Label */}
                                            <div className="relative group">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                                <input
                                                    type="text" id="collegeRollNumber" required
                                                    placeholder="College Roll Number"
                                                    className="peer w-full pl-12 pr-4 pt-6 pb-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium text-base"
                                                    value={userData.collegeRollNumber} onChange={e => setUserData({ ...userData, collegeRollNumber: e.target.value })} />
                                                <label htmlFor="collegeRollNumber" className={`absolute left-12 transform text-text-muted transition-all duration-300 pointer-events-none ${userData.collegeRollNumber ? 'text-xs top-2 text-text-secondary' : 'text-sm top-1/2 -translate-y-1/2 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-text-secondary'}`}>
                                                    College Roll Number *
                                                </label>
                                            </div>
                                            {/* College Mail ID - Floating Label */}
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                                <input
                                                    type="email" id="collegeMailId" required
                                                    placeholder="College Mail ID"
                                                    className="peer w-full pl-12 pr-4 pt-6 pb-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium text-base"
                                                    value={userData.collegeMailId} onChange={e => setUserData({ ...userData, collegeMailId: e.target.value })} />
                                                <label htmlFor="collegeMailId" className={`absolute left-12 transform text-text-muted transition-all duration-300 pointer-events-none ${userData.collegeMailId ? 'text-xs top-2 text-text-secondary' : 'text-sm top-1/2 -translate-y-1/2 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-text-secondary'}`}>
                                                    College Mail ID *
                                                </label>
                                            </div>
                                        </div>
                                        {/* College Name - Floating Label */}
                                        <div className="relative group">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                            <input
                                                type="text" id="collegeName" required
                                                placeholder="College Name"
                                                className="peer w-full pl-12 pr-4 pt-6 pb-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium text-base"
                                                value={userData.collegeName} onChange={e => setUserData({ ...userData, collegeName: e.target.value })} />
                                            <label htmlFor="collegeName" className={`absolute left-12 transform text-text-muted transition-all duration-300 pointer-events-none ${userData.collegeName ? 'text-xs top-2 text-text-secondary' : 'text-sm top-1/2 -translate-y-1/2 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-text-secondary'}`}>
                                                College Name *
                                            </label>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative group">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                                <input
                                                    type="text" id="highestQualificationStudent" required
                                                    placeholder="Highest Education"
                                                    className="peer w-full pl-12 pr-4 pt-6 pb-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium text-base"
                                                    value={userData.highestQualification} onChange={e => setUserData({ ...userData, highestQualification: e.target.value })} />
                                                <label htmlFor="highestQualificationStudent" className={`absolute left-12 transform text-text-muted transition-all duration-300 pointer-events-none ${userData.highestQualification ? 'text-xs top-2 text-text-secondary' : 'text-sm top-1/2 -translate-y-1/2 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-text-secondary'}`}>
                                                    Highest Education *
                                                </label>
                                            </div>
                                            <div className="relative group">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                                <input
                                                    type="number" id="cgpaStudent" required min="0" max="10" step="0.01"
                                                    placeholder="CGPA"
                                                    className="peer w-full pl-12 pr-4 pt-6 pb-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium text-base"
                                                    value={userData.cgpa} onChange={e => setUserData({ ...userData, cgpa: e.target.value })} />
                                                <label htmlFor="cgpaStudent" className={`absolute left-12 transform text-text-muted transition-all duration-300 pointer-events-none ${userData.cgpa ? 'text-xs top-2 text-text-secondary' : 'text-sm top-1/2 -translate-y-1/2 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-text-secondary'}`}>
                                                    CGPA *
                                                </label>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative group">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                                <input
                                                    type="number" id="passingYearStudent" required
                                                    placeholder="Passing Year"
                                                    className="peer w-full pl-12 pr-4 pt-6 pb-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium text-base"
                                                    value={userData.passingYear} onChange={e => setUserData({ ...userData, passingYear: e.target.value, experienceYears: 0 })} />
                                                <label htmlFor="passingYearStudent" className={`absolute left-12 transform text-text-muted transition-all duration-300 pointer-events-none ${userData.passingYear ? 'text-xs top-2 text-text-secondary' : 'text-sm top-1/2 -translate-y-1/2 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-text-secondary'}`}>
                                                    Passing Year *
                                                </label>
                                            </div>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                                <input
                                                    type="number" id="experienceYearsStudent"
                                                    placeholder="Experience Years"
                                                    className="peer w-full pl-12 pr-4 pt-6 pb-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium text-base"
                                                    value={userData.experienceYears} onChange={e => setUserData({ ...userData, experienceYears: e.target.value })} />
                                                <label htmlFor="experienceYearsStudent" className={`absolute left-12 transform text-text-muted transition-all duration-300 pointer-events-none ${userData.experienceYears !== '' ? 'text-xs top-2 text-text-secondary' : 'text-sm top-1/2 -translate-y-1/2 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-text-secondary'}`}>
                                                    Internship Experience
                                                </label>
                                            </div>
                                        </div>

                                        <AddressFields value={collegeAddress} onChange={setCollegeAddress} title="College Address" hideDoorNumber={true} />
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Employee ID - Floating Label */}
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                                <input
                                                    type="text" id="employeeId" required
                                                    placeholder="Employee ID"
                                                    className="peer w-full pl-12 pr-4 pt-6 pb-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium text-base"
                                                    value={userData.employeeId} onChange={e => setUserData({ ...userData, employeeId: e.target.value })} />
                                                <label htmlFor="employeeId" className={`absolute left-12 transform text-text-muted transition-all duration-300 pointer-events-none ${userData.employeeId ? 'text-xs top-2 text-text-secondary' : 'text-sm top-1/2 -translate-y-1/2 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-text-secondary'}`}>
                                                    Employee ID *
                                                </label>
                                            </div>
                                            {/* Company Mail ID - Floating Label */}
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                                <input
                                                    type="email" id="companyMailId" required
                                                    placeholder="Company Mail ID"
                                                    className="peer w-full pl-12 pr-4 pt-6 pb-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium text-base"
                                                    value={userData.companyMailId} onChange={e => setUserData({ ...userData, companyMailId: e.target.value })} />
                                                <label htmlFor="companyMailId" className={`absolute left-12 transform text-text-muted transition-all duration-300 pointer-events-none ${userData.companyMailId ? 'text-xs top-2 text-text-secondary' : 'text-sm top-1/2 -translate-y-1/2 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-text-secondary'}`}>
                                                    Company Mail ID *
                                                </label>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Company Name - Floating Label */}
                                            <div className="relative group">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                                <input
                                                    type="text" id="companyName" required
                                                    placeholder="Company Name"
                                                    className="peer w-full pl-12 pr-4 pt-6 pb-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium text-base"
                                                    value={userData.companyName} onChange={e => setUserData({ ...userData, companyName: e.target.value })} />
                                                <label htmlFor="companyName" className={`absolute left-12 transform text-text-muted transition-all duration-300 pointer-events-none ${userData.companyName ? 'text-xs top-2 text-text-secondary' : 'text-sm top-1/2 -translate-y-1/2 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-text-secondary'}`}>
                                                    Company Name *
                                                </label>
                                            </div>
                                            {/* Current Position - Floating Label */}
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                                <input
                                                    type="text" id="currentPosition" required
                                                    placeholder="Current Position"
                                                    className="peer w-full pl-12 pr-4 pt-6 pb-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium text-base"
                                                    value={userData.currentPosition} onChange={e => setUserData({ ...userData, currentPosition: e.target.value })} />
                                                <label htmlFor="currentPosition" className={`absolute left-12 transform text-text-muted transition-all duration-300 pointer-events-none ${userData.currentPosition ? 'text-xs top-2 text-text-secondary' : 'text-sm top-1/2 -translate-y-1/2 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-text-secondary'}`}>
                                                    Current Position *
                                                </label>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative group">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                                <input
                                                    type="text" id="highestQualificationWorking" required
                                                    placeholder="Highest Education"
                                                    className="peer w-full pl-12 pr-4 pt-6 pb-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium text-base"
                                                    value={userData.highestQualification} onChange={e => setUserData({ ...userData, highestQualification: e.target.value })} />
                                                <label htmlFor="highestQualificationWorking" className={`absolute left-12 transform text-text-muted transition-all duration-300 pointer-events-none ${userData.highestQualification ? 'text-xs top-2 text-text-secondary' : 'text-sm top-1/2 -translate-y-1/2 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-text-secondary'}`}>
                                                    Highest Education *
                                                </label>
                                            </div>
                                            <div className="relative group">
                                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                                <input
                                                    type="number" id="cgpaWorking" required min="0" max="10" step="0.01"
                                                    placeholder="CGPA"
                                                    className="peer w-full pl-12 pr-4 pt-6 pb-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium text-base"
                                                    value={userData.cgpa} onChange={e => setUserData({ ...userData, cgpa: e.target.value })} />
                                                <label htmlFor="cgpaWorking" className={`absolute left-12 transform text-text-muted transition-all duration-300 pointer-events-none ${userData.cgpa ? 'text-xs top-2 text-text-secondary' : 'text-sm top-1/2 -translate-y-1/2 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-text-secondary'}`}>
                                                    CGPA *
                                                </label>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative group">
                                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                                <input
                                                    type="number" id="passingYearWorking" required
                                                    placeholder="Passing Year"
                                                    className="peer w-full pl-12 pr-4 pt-6 pb-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium text-base"
                                                    value={userData.passingYear} onChange={e => setUserData({ ...userData, passingYear: e.target.value })} />
                                                <label htmlFor="passingYearWorking" className={`absolute left-12 transform text-text-muted transition-all duration-300 pointer-events-none ${userData.passingYear ? 'text-xs top-2 text-text-secondary' : 'text-sm top-1/2 -translate-y-1/2 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-text-secondary'}`}>
                                                    Passing Year *
                                                </label>
                                            </div>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                                <input
                                                    type="number" id="experienceYearsWorking"
                                                    placeholder="Experience Years"
                                                    className="peer w-full pl-12 pr-4 pt-6 pb-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-transparent focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all font-medium text-base"
                                                    value={userData.experienceYears} onChange={e => setUserData({ ...userData, experienceYears: e.target.value })} />
                                                <label htmlFor="experienceYearsWorking" className={`absolute left-12 transform text-text-muted transition-all duration-300 pointer-events-none ${userData.experienceYears !== '' ? 'text-xs top-2 text-text-secondary' : 'text-sm top-1/2 -translate-y-1/2 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-text-secondary'}`}>
                                                    Experience Years
                                                </label>
                                            </div>
                                        </div>
                                        <AddressFields value={professionalAddress} onChange={setProfessionalAddress} title="Company Address" hideDoorNumber={true} />
                                    </div>
                                )}

                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={prevStep} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors">Back</button>
                                    <button type="button" onClick={nextStep} className="flex-1 py-4 bg-white hover:bg-white/90 text-background rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98]">Next Step</button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Address & Documents */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <AddressFields value={userAddress} onChange={setUserAddress} />

                                <h3 className="text-xl font-bold text-white border-b border-white/10 pb-3 mt-8 mb-5">Documents & Skills</h3>

                                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                    <SkillSelect selectedSkills={skills} onChange={setSkills} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {/* ID Card */}
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2 px-1">
                                            {userData.roleType === 'STUDENT' ? 'Student ID Card' : 'Employee ID Card'} (JPG/PNG) *
                                        </label>
                                        <div
                                            onClick={() => idCardInputRef.current?.click()}
                                            className="w-full p-6 bg-white/5 border-2 border-dashed border-white/20 hover:border-primary/50 hover:bg-white/10 rounded-xl text-center cursor-pointer transition-all group"
                                        >
                                            <Upload className="w-8 h-8 mx-auto mb-3 text-text-muted group-hover:text-primary transition-colors" />
                                            <span className="text-base text-white font-medium block mb-1">
                                                {idCardFile ? idCardFile.name : 'Upload ID Card'}
                                            </span>
                                            <span className="text-xs text-text-muted">Max size: 5MB</span>
                                            <input
                                                type="file"
                                                ref={idCardInputRef}
                                                className="hidden"
                                                accept="image/jpeg,image/png"
                                                onChange={(e) => handleFileChange(e, setIdCardFile, 'image', 5)}
                                            />
                                        </div>
                                    </div>

                                    {/* Resume */}
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-2 px-1">
                                            Resume (PDF) - Optional
                                        </label>
                                        <div
                                            onClick={() => resumeInputRef.current?.click()}
                                            className="w-full p-6 bg-white/5 border-2 border-dashed border-white/20 hover:border-primary/50 hover:bg-white/10 rounded-xl text-center cursor-pointer transition-all group"
                                        >
                                            <Upload className="w-8 h-8 mx-auto mb-3 text-text-muted group-hover:text-primary transition-colors" />
                                            <span className="text-base text-white font-medium block mb-1">
                                                {resumeFile ? resumeFile.name : 'Upload Resume'}
                                            </span>
                                            <span className="text-xs text-text-muted">Max size: 5MB</span>
                                            <input
                                                type="file"
                                                ref={resumeInputRef}
                                                className="hidden"
                                                accept="application/pdf"
                                                onChange={(e) => handleFileChange(e, setResumeFile, 'pdf', 5)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 mt-10">
                                    <button type="button" onClick={prevStep} className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors">Back</button>
                                    <button type="submit" disabled={loading} className="flex-1 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(58,130,246,0.3)] hover:shadow-[0_0_30px_rgba(58,130,246,0.5)] flex justify-center items-center">
                                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Submit Registration'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                    </motion.div>
                    )}

                    {/* ======================= COMPANY TAB ======================= */}
                    {tab === 'company' && (
                        <motion.div
                            key="company-tab"
                            initial={{ opacity: 0, x: prevTabRef.current === 'user' ? 60 : -60 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 60 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                        <form onSubmit={handleCompanySubmit} className="space-y-5">
                            <h3 className="text-xl font-bold text-white border-b border-white/10 pb-3 mb-5 flex items-center gap-2"><Building2 className="w-5 h-5 text-primary"/> Company Details</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative group">
                                    <input type="text" id="companyName" placeholder="Company Name *" required className={inputClassNoIcon}
                                        value={companyData.name} onChange={e => setCompanyData({ ...companyData, name: e.target.value })} />
                                    <label htmlFor="companyName" className={`absolute left-4 transform transition-all duration-300 pointer-events-none ${companyData.name ? 'text-xs top-2 text-white/80' : 'text-sm top-1/2 -translate-y-1/2 text-white/50 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-white/80'}`}>
                                        Company Name *
                                    </label>
                                </div>
                                <div className="relative group">
                                    <input type="email" id="domainEmail" placeholder="Domain Email *" required className={inputClassNoIcon}
                                        value={companyData.domainEmail} onChange={e => setCompanyData({ ...companyData, domainEmail: e.target.value })} />
                                    <label htmlFor="domainEmail" className={`absolute left-4 transform transition-all duration-300 pointer-events-none ${companyData.domainEmail ? 'text-xs top-2 text-white/80' : 'text-sm top-1/2 -translate-y-1/2 text-white/50 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-white/80'}`}>
                                        Domain Email *
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                    <input type={showCompanyPass ? "text" : "password"} id="companyPass" placeholder="Password *" required className={inputClassWithIcon}
                                        value={companyData.password} onChange={e => setCompanyData({ ...companyData, password: e.target.value })} />
                                    <label htmlFor="companyPass" className={`absolute left-11 transform transition-all duration-300 pointer-events-none ${companyData.password ? 'text-xs top-2 text-white/80' : 'text-sm top-1/2 -translate-y-1/2 text-white/50 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-white/80'}`}>
                                        Password *
                                    </label>
                                    <button type="button" onClick={() => setShowCompanyPass(!showCompanyPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
                                        {showCompanyPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-primary transition-colors pointer-events-none z-10" />
                                    <input type={showCompanyConfirm ? "text" : "password"} id="companyConfirmPass" placeholder="Confirm Password *" required className={inputClassWithIcon}
                                        value={companyData.confirmPassword} onChange={e => setCompanyData({ ...companyData, confirmPassword: e.target.value })} />
                                    <label htmlFor="companyConfirmPass" className={`absolute left-11 transform transition-all duration-300 pointer-events-none ${companyData.confirmPassword ? 'text-xs top-2 text-white/80' : 'text-sm top-1/2 -translate-y-1/2 text-white/50 peer-focus:text-xs peer-focus:top-2 peer-focus:-translate-y-0 peer-focus:text-white/80'}`}>
                                        Confirm Password *
                                    </label>
                                    <button type="button" onClick={() => setShowCompanyConfirm(!showCompanyConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
                                        {showCompanyConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select className={inputClassNoIcon + ' pb-2 pt-6'} style={{paddingTop: '1.5rem', paddingBottom: '0.5rem'}} value={companyData.companyType} onChange={e => setCompanyData({ ...companyData, companyType: e.target.value })}>
                                    <option value="STARTUP" className="bg-background">Startup</option>
                                    <option value="MNC" className="bg-background">MNC</option>
                                    <option value="SERVICE_BASED" className="bg-background">Service Based</option>
                                    <option value="PRODUCT_BASED" className="bg-background">Product Based</option>
                                </select>
                                <select className={inputClassNoIcon + ' pb-2 pt-6'} style={{paddingTop: '1.5rem', paddingBottom: '0.5rem'}} value={companyData.industrySector} onChange={e => setCompanyData({ ...companyData, industrySector: e.target.value })}>
                                    <option value="" className="bg-background">Industry Sector (Optional)</option>
                                    <option value="SOFTWARE" className="bg-background">Software</option>
                                    <option value="HARDWARE" className="bg-background">Hardware</option>
                                    <option value="ELECTRONICS" className="bg-background">Electronics</option>
                                    <option value="CORE_ENGINEERING" className="bg-background">Core Engineering</option>
                                    <option value="IT_SERVICES" className="bg-background">IT Services</option>
                                    <option value="FINANCE" className="bg-background">Finance</option>
                                    <option value="HEALTHCARE" className="bg-background">Healthcare</option>
                                    <option value="EDUCATION" className="bg-background">Education</option>
                                    <option value="MANUFACTURING" className="bg-background">Manufacturing</option>
                                    <option value="RETAIL" className="bg-background">Retail</option>
                                    <option value="LOGISTICS" className="bg-background">Logistics</option>
                                    <option value="OTHER" className="bg-background">Other</option>
                                </select>
                            </div>

                            <div className="pt-2">
                                <AddressFields value={companyAddress} onChange={setCompanyAddress} title="Company Address" />
                            </div>

                            <h3 className="text-xl font-bold text-white border-b border-white/10 pb-3 mt-8 mb-5">Verification Document</h3>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-2 px-1">
                                    Company Registration / Proof Document (JPG/PNG/PDF) *
                                </label>
                                <div
                                    onClick={() => proofInputRef.current?.click()}
                                    className="w-full p-6 bg-white/5 border-2 border-dashed border-white/20 hover:border-primary/50 hover:bg-white/10 rounded-xl text-center cursor-pointer transition-all group"
                                >
                                    <Upload className="w-8 h-8 mx-auto mb-3 text-text-muted group-hover:text-primary transition-colors" />
                                    <span className="text-base text-white font-medium block mb-1">
                                        {proofFile ? proofFile.name : 'Upload Registration Document'}
                                    </span>
                                    <span className="text-xs text-text-muted">Max size: 5MB</span>
                                    <input
                                        type="file"
                                        ref={proofInputRef}
                                        className="hidden"
                                        accept="image/jpeg,image/png,application/pdf"
                                        onChange={(e) => handleFileChange(e, setProofFile, 'proof', 5)}
                                    />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-full py-4 mt-8 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(58,130,246,0.3)] hover:shadow-[0_0_30px_rgba(58,130,246,0.5)] flex justify-center items-center text-lg">
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Register Company'}
                            </button>
                        </form>
                        </motion.div>
                    )}
                    </AnimatePresence>
                    </div>

                <p className="mt-10 text-center text-text-muted text-sm font-medium">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:text-white font-bold transition-colors">
                        Log in here
                    </Link>
                </p>
            </div>
            </motion.div>
        </div>
    );
}
