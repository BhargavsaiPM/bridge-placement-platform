import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/authApi';
import SkillSelect from '../../components/shared/SkillSelect';
import AddressFields from '../../components/shared/AddressFields';
import { User, Building2, Mail, Lock, Phone, Calendar, ArrowRight, Upload, X, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Register() {
    const [tab, setTab] = useState('user'); // 'user' or 'company'
    const [step, setStep] = useState(1); // For multi-step user registration
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

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
        collegeCity: '', collegeDistrict: '', collegeCountry: '', collegePincode: '',
        // Professional
        employeeId: '', companyMailId: '', companyName: '', currentPosition: '',
        companyCity: '', companyDistrict: '', companyCountry: '', companyPincode: ''
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
                if (!userData.collegeRollNumber || !userData.collegeMailId || !userData.collegeName) {
                    setError('Please fill all required college fields.');
                    return;
                }
            } else {
                if (!userData.employeeId || !userData.companyMailId || !userData.companyName || !userData.currentPosition) {
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
                country: userAddress.country,
                state: userAddress.state,
                district: userAddress.district,
                city: userAddress.city,
                pincode: userAddress.pincode,
                street: userAddress.streetName,
                doorNumber: userAddress.doorNumber,
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
                proofDocumentUrl: proofUrl
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

    const inputClass = "w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm";

    // ==========================================
    // RENDER
    // ==========================================
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-3xl backdrop-blur-xl bg-surface/50 p-8 rounded-2xl border border-white/10 shadow-2xl relative z-10 transition-all">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2">Create an Account</h2>
                    <p className="text-text-secondary text-sm">Join Bridge Placement Platform today</p>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-white/5 rounded-xl mb-8">
                    <button
                        className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${tab === 'user' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        onClick={() => { setTab('user'); setStep(1); setError(''); }}
                    >
                        <User className="w-4 h-4" /> Professional / Student
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${tab === 'company' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                        onClick={() => { setTab('company'); setError(''); }}
                    >
                        <Building2 className="w-4 h-4" /> Company
                    </button>
                </div>

                {error && (
                    <div className="p-3 mb-6 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm text-center">
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div className="p-3 mb-6 rounded-lg bg-success/10 border border-success/20 text-success text-sm text-center">
                        {successMsg}
                    </div>
                )}

                {/* ======================= USER TAB ======================= */}
                {tab === 'user' && (
                    <form onSubmit={handleUserSubmit}>

                        {/* STEP 1: Personal Details & Auth */}
                        {step === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2 mb-4">Personal Details</h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                        <input type="text" placeholder="First Name *" required className={inputClass}
                                            value={userData.firstName} onChange={e => setUserData({ ...userData, firstName: e.target.value })} />
                                    </div>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                        <input type="text" placeholder="Middle Name (Opt)" className={inputClass}
                                            value={userData.middleName} onChange={e => setUserData({ ...userData, middleName: e.target.value })} />
                                    </div>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                        <input type="text" placeholder="Last Name *" required className={inputClass}
                                            value={userData.lastName} onChange={e => setUserData({ ...userData, lastName: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                        <input type="email" placeholder="Personal Email *" required className={inputClass}
                                            value={userData.email} onChange={e => setUserData({ ...userData, email: e.target.value })} />
                                    </div>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                        <input type="text" placeholder="Mobile Number *" required className={inputClass}
                                            value={userData.mobile} onChange={e => setUserData({ ...userData, mobile: e.target.value })} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                        <input type={showUserPass ? "text" : "password"} placeholder="Password *" required className={inputClass}
                                            value={userData.password} onChange={e => setUserData({ ...userData, password: e.target.value })} />
                                        <button type="button" onClick={() => setShowUserPass(!showUserPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white">
                                            {showUserPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                        <input type={showUserConfirm ? "text" : "password"} placeholder="Confirm Password *" required className={inputClass}
                                            value={userData.confirmPassword} onChange={e => setUserData({ ...userData, confirmPassword: e.target.value })} />
                                        <button type="button" onClick={() => setShowUserConfirm(!showUserConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white">
                                            {showUserConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[10px] text-text-secondary mt-1">Status: {userData.password && validatePassword(userData.password) ? <span className="text-success">Strong</span> : <span className="text-danger">Weak (Needs Uppercase, Lowercase, Number, Symbol, Min 6 chars)</span>}</p>

                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                    <input type="date" required className={inputClass}
                                        value={userData.dob} onChange={e => setUserData({ ...userData, dob: e.target.value })} />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-text-secondary pointer-events-none">Date of Birth</span>
                                </div>

                                <button type="button" onClick={nextStep} className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 mt-6">
                                    Next Step <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* STEP 2: Role Specific Details */}
                        {step === 2 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2 mb-4">Professional Information</h3>

                                <div className="flex gap-4 mb-6">
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer border transition-colors ${userData.roleType === 'STUDENT' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10'}`}>
                                        <input type="radio" name="roleType" value="STUDENT" className="hidden"
                                            checked={userData.roleType === 'STUDENT'} onChange={e => setUserData({ ...userData, roleType: e.target.value })} />
                                        Student
                                    </label>
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer border transition-colors ${userData.roleType === 'WORKING' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-text-secondary hover:bg-white/10'}`}>
                                        <input type="radio" name="roleType" value="WORKING" className="hidden"
                                            checked={userData.roleType === 'WORKING'} onChange={e => setUserData({ ...userData, roleType: e.target.value })} />
                                        Working Professional
                                    </label>
                                </div>

                                {userData.roleType === 'STUDENT' ? (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                                <input type="text" placeholder="College Roll Number *" required className={inputClass}
                                                    value={userData.collegeRollNumber} onChange={e => setUserData({ ...userData, collegeRollNumber: e.target.value })} />
                                            </div>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                                <input type="email" placeholder="College Mail ID *" required className={inputClass}
                                                    value={userData.collegeMailId} onChange={e => setUserData({ ...userData, collegeMailId: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                            <input type="text" placeholder="College Name *" required className={inputClass}
                                                value={userData.collegeName} onChange={e => setUserData({ ...userData, collegeName: e.target.value })} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="text" placeholder="College Country" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm" value={userData.collegeCountry} onChange={e => setUserData({ ...userData, collegeCountry: e.target.value })} />
                                            <input type="text" placeholder="College District" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm" value={userData.collegeDistrict} onChange={e => setUserData({ ...userData, collegeDistrict: e.target.value })} />
                                            <input type="text" placeholder="College City" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm" value={userData.collegeCity} onChange={e => setUserData({ ...userData, collegeCity: e.target.value })} />
                                            <input type="text" placeholder="College Pincode" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm" value={userData.collegePincode} onChange={e => setUserData({ ...userData, collegePincode: e.target.value })} />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                                <input type="text" placeholder="Employee ID *" required className={inputClass}
                                                    value={userData.employeeId} onChange={e => setUserData({ ...userData, employeeId: e.target.value })} />
                                            </div>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                                <input type="email" placeholder="Company Mail ID *" required className={inputClass}
                                                    value={userData.companyMailId} onChange={e => setUserData({ ...userData, companyMailId: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative">
                                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                                <input type="text" placeholder="Company Name *" required className={inputClass}
                                                    value={userData.companyName} onChange={e => setUserData({ ...userData, companyName: e.target.value })} />
                                            </div>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                                <input type="text" placeholder="Current Position *" required className={inputClass}
                                                    value={userData.currentPosition} onChange={e => setUserData({ ...userData, currentPosition: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="text" placeholder="Company Country" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm" value={userData.companyCountry} onChange={e => setUserData({ ...userData, companyCountry: e.target.value })} />
                                            <input type="text" placeholder="Company District" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm" value={userData.companyDistrict} onChange={e => setUserData({ ...userData, companyDistrict: e.target.value })} />
                                            <input type="text" placeholder="Company City" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm" value={userData.companyCity} onChange={e => setUserData({ ...userData, companyCity: e.target.value })} />
                                            <input type="text" placeholder="Company Pincode" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm" value={userData.companyPincode} onChange={e => setUserData({ ...userData, companyPincode: e.target.value })} />
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4 mt-6">
                                    <button type="button" onClick={prevStep} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors">Back</button>
                                    <button type="button" onClick={nextStep} className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors">Next Step</button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: Address & Documents */}
                        {step === 3 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <AddressFields value={userAddress} onChange={setUserAddress} />

                                <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2 mt-6 mb-4">Documents & Skills</h3>

                                <SkillSelect selectedSkills={skills} onChange={setSkills} />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                    {/* ID Card */}
                                    <div>
                                        <label className="block text-xs font-medium text-text-secondary mb-1">
                                            {userData.roleType === 'STUDENT' ? 'Student ID Card' : 'Employee ID Card'} (JPG/PNG) *
                                        </label>
                                        <div
                                            onClick={() => idCardInputRef.current?.click()}
                                            className="w-full p-4 border-2 border-dashed border-white/10 hover:border-primary/50 rounded-xl text-center cursor-pointer transition-colors"
                                        >
                                            <Upload className="w-5 h-5 mx-auto mb-2 text-text-secondary" />
                                            <span className="text-sm text-text-secondary">
                                                {idCardFile ? idCardFile.name : 'Click to select ID Card'}
                                            </span>
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
                                        <label className="block text-xs font-medium text-text-secondary mb-1">
                                            Resume (PDF) - Optional
                                        </label>
                                        <div
                                            onClick={() => resumeInputRef.current?.click()}
                                            className="w-full p-4 border-2 border-dashed border-white/10 hover:border-primary/50 rounded-xl text-center cursor-pointer transition-colors"
                                        >
                                            <Upload className="w-5 h-5 mx-auto mb-2 text-text-secondary" />
                                            <span className="text-sm text-text-secondary">
                                                {resumeFile ? resumeFile.name : 'Click to select Resume'}
                                            </span>
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

                                <div className="flex gap-4 mt-8">
                                    <button type="button" onClick={prevStep} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors">Back</button>
                                    <button type="submit" disabled={loading} className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors flex justify-center items-center">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Registration'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                )}

                {/* ======================= COMPANY TAB ======================= */}
                {tab === 'company' && (
                    <form onSubmit={handleCompanySubmit} className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2 mb-4">Company Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="Company Name *" required className={inputClass}
                                value={companyData.name} onChange={e => setCompanyData({ ...companyData, name: e.target.value })} />

                            <input type="email" placeholder="Domain Email *" required className={inputClass}
                                value={companyData.domainEmail} onChange={e => setCompanyData({ ...companyData, domainEmail: e.target.value })} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                <input type={showCompanyPass ? "text" : "password"} placeholder="Password *" required className={inputClass}
                                    value={companyData.password} onChange={e => setCompanyData({ ...companyData, password: e.target.value })} />
                                <button type="button" onClick={() => setShowCompanyPass(!showCompanyPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white">
                                    {showCompanyPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                <input type={showCompanyConfirm ? "text" : "password"} placeholder="Confirm Password *" required className={inputClass}
                                    value={companyData.confirmPassword} onChange={e => setCompanyData({ ...companyData, confirmPassword: e.target.value })} />
                                <button type="button" onClick={() => setShowCompanyConfirm(!showCompanyConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white">
                                    {showCompanyConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select className={inputClass} value={companyData.companyType} onChange={e => setCompanyData({ ...companyData, companyType: e.target.value })}>
                                <option value="STARTUP">Startup</option>
                                <option value="MNC">MNC</option>
                                <option value="SERVICE_BASED">Service Based</option>
                                <option value="PRODUCT_BASED">Product Based</option>
                            </select>
                            <input type="text" placeholder="Industry Sector (e.g. IT, Finance)" className={inputClass}
                                value={companyData.industrySector} onChange={e => setCompanyData({ ...companyData, industrySector: e.target.value })} />
                        </div>

                        <AddressFields value={companyAddress} onChange={setCompanyAddress} />

                        <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2 mt-6 mb-4">Verification Document</h3>

                        <div>
                            <label className="block text-xs font-medium text-text-secondary mb-1">
                                Company Registration / Proof Document (JPG/PNG/PDF) *
                            </label>
                            <div
                                onClick={() => proofInputRef.current?.click()}
                                className="w-full p-4 border-2 border-dashed border-white/10 hover:border-primary/50 rounded-xl text-center cursor-pointer transition-colors"
                            >
                                <Upload className="w-5 h-5 mx-auto mb-2 text-text-secondary" />
                                <span className="text-sm text-text-secondary">
                                    {proofFile ? proofFile.name : 'Click to select Document'}
                                </span>
                                <input
                                    type="file"
                                    ref={proofInputRef}
                                    className="hidden"
                                    accept="image/jpeg,image/png,application/pdf"
                                    onChange={(e) => handleFileChange(e, setProofFile, 'proof', 5)}
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full py-3 mt-6 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium transition-colors flex justify-center items-center">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register Company'}
                        </button>
                    </form>
                )}

                <p className="mt-8 text-center text-text-secondary text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                        Log in here
                    </Link>
                </p>
            </div>
        </div>
    );
}
