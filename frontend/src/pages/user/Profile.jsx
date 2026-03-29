import React, { useState, useEffect, useRef } from 'react';
import { userApi } from '../../api/userApi';
import { authApi } from '../../api/authApi';
import SkillSelect from '../../components/shared/SkillSelect';
import AddressFields from '../../components/shared/AddressFields';
import {
    User, Mail, Phone, Calendar, Link as LinkIcon,
    Edit2, Check, X, Upload, Camera, FileText,
    Award, Briefcase, MapPin, Github, ExternalLink,
    Loader2, ShieldCheck, Star, BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const getFullName = (profile) => {
    if (!profile) return '';
    const parts = [profile.firstName, profile.middleName, profile.lastName].filter(Boolean);
    return parts.join(' ');
};

const getInitials = (profile) => {
    if (!profile) return '?';
    const first = profile.firstName?.[0] || '';
    const last = profile.lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
};

const getAddressData = (source) => ({
    country: source?.country || '',
    state: source?.state || '',
    district: source?.district || '',
    pincode: source?.pincode || '',
    city: source?.city || '',
    streetName: source?.street || '',
    doorNumber: source?.doorNumber || '',
});

const formatAddress = (source) =>
    [
        source?.doorNumber,
        source?.street,
        source?.city,
        source?.district,
        source?.state,
        source?.pincode,
        source?.country,
    ]
        .filter(Boolean)
        .join(', ');

const getAssetUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:9092${url}`;
};

export default function UserProfile() {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [activeTab, setActiveTab] = useState('personal');

    const [editData, setEditData] = useState({
        firstName: '', middleName: '', lastName: '',
        mobile: '', dob: '', githubLink: '', achievements: '',
        country: '', state: '', district: '', pincode: '', city: '', streetName: '', doorNumber: '',
        highestQualification: '', cgpa: '', passingYear: '', specialization: '', experienceYears: ''
    });
    const [skills, setSkills] = useState([]);

    const [resumeFile, setResumeFile] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
    const resumeInputRef = useRef(null);
    const photoInputRef = useRef(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await userApi.getProfile();
            setProfile(res.data);
            setEditData({
                firstName: res.data.firstName || '',
                middleName: res.data.middleName || '',
                lastName: res.data.lastName || '',
                mobile: res.data.mobile || '',
                dob: res.data.dob || '',
                githubLink: res.data.githubLink || '',
                achievements: res.data.achievements || '',
                highestQualification: res.data.highestQualification || '',
                cgpa: res.data.cgpa ?? '',
                specialization: res.data.specialization || '',
                passingYear: res.data.passingYear || '',
                experienceYears: res.data.experienceYears ?? '',
                ...getAddressData(res.data)
            });
            const parsedSkills = res.data.skills
                ? res.data.skills.split(',').map(s => s.trim()).filter(Boolean)
                : [];
            setSkills(parsedSkills);
        } catch (err) {
            setError('Failed to load profile.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProfile(); }, []);

    useEffect(() => {
        if (!photoFile) {
            setPhotoPreviewUrl('');
            return;
        }

        const objectUrl = URL.createObjectURL(photoFile);
        setPhotoPreviewUrl(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [photoFile]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setError('Only PDF files are allowed for resumes.');
                return;
            }
            if (file.size > 6 * 1024 * 1024) {
                setError('File size must be less than 6MB.');
                return;
            }
            setError('');
            setResumeFile(file);
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Only image files are allowed for profile photos.');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Profile photo size must be less than 5MB.');
                return;
            }
            setError('');
            setPhotoFile(file);
        }
    };

    const handleSave = async () => {
        if (!editData.firstName.trim() || !editData.lastName.trim()) {
            setError('First Name and Last Name are required.');
            return;
        }
        setError('');
        setSaving(true);
        try {
            let resumeFileName = '';
            let profilePhotoUrl = '';
            if (resumeFile) {
                const uploadRes = await authApi.uploadFile(resumeFile);
                resumeFileName = uploadRes.data.url;
            }
            if (photoFile) {
                const uploadRes = await authApi.uploadFile(photoFile);
                profilePhotoUrl = uploadRes.data.url;
            }

            const payload = {
                firstName: editData.firstName.trim(),
                middleName: editData.middleName.trim() || null,
                lastName: editData.lastName.trim(),
                mobile: editData.mobile,
                dob: editData.dob || null,
                country: editData.country,
                state: editData.state,
                district: editData.district,
                pincode: editData.pincode,
                city: editData.city,
                street: editData.streetName,
                doorNumber: editData.doorNumber,
                githubLink: editData.githubLink,
                achievements: editData.achievements,
                highestQualification: editData.highestQualification,
                cgpa: editData.cgpa === '' ? null : Number(editData.cgpa),
                specialization: editData.specialization,
                passingYear: editData.passingYear ? Number(editData.passingYear) : null,
                experienceYears: editData.experienceYears === '' ? null : Number(editData.experienceYears),
                skills: skills.join(', '),
                resumeFileName: resumeFileName || undefined,
                profilePhoto: profilePhotoUrl || undefined
            };

            await userApi.updateProfile(payload);
            setSuccessMsg('Profile updated successfully!');
            setIsEditing(false);
            setResumeFile(null);
            setPhotoFile(null);
            fetchProfile();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError('');
        setResumeFile(null);
        setPhotoFile(null);
        // reset edit data
        if (profile) {
            setEditData({
                firstName: profile.firstName || '',
                middleName: profile.middleName || '',
                lastName: profile.lastName || '',
                mobile: profile.mobile || '',
                dob: profile.dob || '',
                githubLink: profile.githubLink || '',
                achievements: profile.achievements || '',
                highestQualification: profile.highestQualification || '',
                cgpa: profile.cgpa ?? '',
                specialization: profile.specialization || '',
                passingYear: profile.passingYear || '',
                experienceYears: profile.experienceYears ?? '',
                ...getAddressData(profile)
            });
            const parsedSkills = profile.skills
                ? profile.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
            setSkills(parsedSkills);
        }
    };

    // Fix resume URL - if it's already a full URL (Cloudinary), use as-is
    const getResumeUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `http://localhost:9092${url}`;
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="text-text-secondary text-sm">Loading your profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <p className="text-white text-lg font-semibold mb-2">Failed to load profile</p>
                    <button onClick={fetchProfile} className="text-primary hover:underline text-sm">Try again</button>
                </div>
            </div>
        );
    }

    const fullName = getFullName(profile);
    const initials = getInitials(profile);
    const personalAddress = formatAddress(profile);
    const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-primary/60 focus:bg-white/8 transition-all text-sm placeholder-white/30";
    const profilePhotoPreview = photoPreviewUrl || getAssetUrl(profile.profilePhoto);

    const tabs = [
        { id: 'personal', label: 'Personal', icon: User },
        { id: 'education', label: 'Education', icon: BookOpen },
        { id: 'skills', label: 'Skills', icon: Star },
        { id: 'achievements', label: 'Achievements', icon: Award },
        { id: 'resume', label: 'Resume', icon: FileText },
    ];

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 relative overflow-hidden">

            {/* Background glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] right-[-5%] w-[35vw] h-[35vw] rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[30vw] h-[30vw] rounded-full bg-secondary/10 blur-[100px]" />
            </div>

            <div className="max-w-5xl mx-auto relative z-10 space-y-6">

                {/* ── Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">My Profile</h1>
                        <p className="text-text-secondary text-sm mt-1">Manage your personal information, skills, and resume.</p>
                    </div>
                    <div className="flex gap-3">
                        {!isEditing ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm shadow-[0_0_20px_rgba(77,163,255,0.3)] hover:shadow-[0_0_30px_rgba(77,163,255,0.5)] transition-all"
                            >
                                <Edit2 className="w-4 h-4" /> Edit Profile
                            </motion.button>
                        ) : (
                            <>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm shadow-[0_0_20px_rgba(77,163,255,0.3)] hover:shadow-[0_0_30px_rgba(77,163,255,0.5)] transition-all disabled:opacity-60"
                                >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    {saving ? 'Saving...' : 'Save'}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white border border-white/15 rounded-xl font-semibold text-sm hover:bg-white/20 transition-all"
                                >
                                    <X className="w-4 h-4" /> Cancel
                                </motion.button>
                            </>
                        )}
                    </div>
                </motion.div>

                {/* ── Alerts ── */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium flex items-center gap-3"
                        >
                            <X className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}
                    {successMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium flex items-center gap-3"
                        >
                            <Check className="w-4 h-4 flex-shrink-0" />
                            {successMsg}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

                    {/* ── Left: Avatar Card ── */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-panel p-6 flex flex-col items-center text-center"
                    >
                        {/* Avatar */}
                        <div className="relative group mb-5">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 border-2 border-primary/30 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(77,163,255,0.25)]">
                                {profilePhotoPreview ? (
                                    <img src={profilePhotoPreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-white">{initials}</span>
                                )}
                            </div>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={() => photoInputRef.current?.click()}
                                    className="absolute inset-0 bg-background/70 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all rounded-full cursor-pointer"
                                >
                                    <Camera className="w-7 h-7 text-primary" />
                                    <span className="text-xs text-white mt-1 font-medium">Change</span>
                                </button>
                            )}
                            <input
                                type="file"
                                ref={photoInputRef}
                                onChange={handlePhotoChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        <h2 className="text-xl font-bold text-white mb-1 leading-tight">{fullName || 'Your Name'}</h2>
                        <span className="px-3 py-1 bg-primary/20 text-primary border border-primary/25 rounded-full text-xs font-bold mb-5 tracking-wide">
                            {profile.roleType || 'USER'}
                        </span>

                        {/* Contact Info */}
                        <div className="w-full space-y-3 text-left">
                            <div className="flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/5">
                                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                                <span className="text-text-secondary text-xs truncate">{profile.email}</span>
                            </div>
                            {profile.mobile && (
                                <div className="flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/5">
                                    <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                                    <span className="text-text-secondary text-xs">{profile.mobile}</span>
                                </div>
                            )}
                            {profile.dob && (
                                <div className="flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/5">
                                    <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                                    <span className="text-text-secondary text-xs">{new Date(profile.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                            )}
                            {profile.highestQualification && (
                                <div className="flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/5">
                                    <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                                    <span className="text-text-secondary text-xs">{profile.highestQualification}</span>
                                </div>
                            )}
                            {profile.passingYear && (
                                <div className="flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/5">
                                    <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                                    <span className="text-text-secondary text-xs">Passed out in {profile.passingYear}</span>
                                </div>
                            )}
                            {(profile.experienceYears || profile.experienceYears === 0) && (
                                <div className="flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/5">
                                    <Briefcase className="w-4 h-4 text-primary flex-shrink-0" />
                                    <span className="text-text-secondary text-xs">{profile.experienceYears} year(s) experience</span>
                                </div>
                            )}
                            {profile.cgpa !== null && profile.cgpa !== undefined && (
                                <div className="flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/5">
                                    <Award className="w-4 h-4 text-primary flex-shrink-0" />
                                    <span className="text-text-secondary text-xs">CGPA {profile.cgpa}</span>
                                </div>
                            )}
                            {profile.githubLink && (
                                <a
                                    href={profile.githubLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/15 hover:bg-primary/10 transition-colors group"
                                >
                                    <Github className="w-4 h-4 text-primary flex-shrink-0" />
                                    <span className="text-primary text-xs font-medium group-hover:underline">GitHub Profile</span>
                                    <ExternalLink className="w-3 h-3 text-primary ml-auto" />
                                </a>
                            )}
                            {personalAddress && (
                                <div className="flex items-start gap-3 p-3 bg-white/3 rounded-xl border border-white/5">
                                    <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                    <span className="text-text-secondary text-xs leading-relaxed">{personalAddress}</span>
                                </div>
                            )}
                        </div>

                        {/* Role badge */}
                        {(profile.collegeName || profile.companyName) && (
                            <div className="w-full mt-4 p-3 bg-white/3 rounded-xl border border-white/5 flex items-center gap-3">
                                {profile.roleType === 'STUDENT' ? (
                                    <BookOpen className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                ) : (
                                    <Briefcase className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                )}
                                <span className="text-text-secondary text-xs truncate">
                                    {profile.collegeName || profile.companyName}
                                </span>
                            </div>
                        )}
                    </motion.div>

                    {/* ── Right: Tabbed Content ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="glass-panel overflow-hidden"
                    >
                        {/* Tabs */}
                        <div className="flex border-b border-white/8 px-2 pt-2 gap-1 bg-white/2">
                            {tabs.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-sm font-semibold transition-all relative ${
                                        activeTab === id
                                            ? 'text-primary bg-primary/10 border border-primary/20 border-b-0'
                                            : 'text-text-secondary hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {label}
                                    {activeTab === id && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="p-6 sm:p-8">
                            <AnimatePresence mode="wait">

                                {/* PERSONAL TAB */}
                                {activeTab === 'personal' && (
                                    <motion.div
                                        key="personal"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="space-y-5"
                                    >
                                        <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-6">
                                            <User className="w-4 h-4 text-primary" />
                                            Personal Details
                                        </h3>

                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-text-secondary mb-2">First Name *</label>
                                                        <input
                                                            type="text"
                                                            value={editData.firstName}
                                                            onChange={e => setEditData({ ...editData, firstName: e.target.value })}
                                                            className={inputClass}
                                                            placeholder="First Name"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-text-secondary mb-2">Middle Name</label>
                                                        <input
                                                            type="text"
                                                            value={editData.middleName}
                                                            onChange={e => setEditData({ ...editData, middleName: e.target.value })}
                                                            className={inputClass}
                                                            placeholder="Middle Name (Optional)"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-text-secondary mb-2">Last Name *</label>
                                                        <input
                                                            type="text"
                                                            value={editData.lastName}
                                                            onChange={e => setEditData({ ...editData, lastName: e.target.value })}
                                                            className={inputClass}
                                                            placeholder="Last Name"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-text-secondary mb-2">Mobile</label>
                                                        <input
                                                            type="text"
                                                            value={editData.mobile}
                                                            onChange={e => setEditData({ ...editData, mobile: e.target.value })}
                                                            className={inputClass}
                                                            placeholder="+91 XXXXX XXXXX"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-text-secondary mb-2">Date of Birth</label>
                                                        <input
                                                            type="date"
                                                            value={editData.dob}
                                                            onChange={e => setEditData({ ...editData, dob: e.target.value })}
                                                            className={inputClass}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-text-secondary mb-2">GitHub Link</label>
                                                    <input
                                                        type="url"
                                                        value={editData.githubLink}
                                                        onChange={e => setEditData({ ...editData, githubLink: e.target.value })}
                                                        className={inputClass}
                                                        placeholder="https://github.com/username"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-text-secondary mb-2">Experience Years</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={editData.experienceYears}
                                                            onChange={e => setEditData({ ...editData, experienceYears: e.target.value })}
                                                            className={inputClass}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                                <AddressFields
                                                    title="Personal Address"
                                                    value={editData}
                                                    onChange={setEditData}
                                                />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                {[
                                                    { label: 'Full Name', value: fullName, icon: User },
                                                    { label: 'Mobile', value: profile.mobile, icon: Phone },
                                                    { label: 'Date of Birth', value: profile.dob ? new Date(profile.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : null, icon: Calendar },
                                                    { label: 'GitHub Link', value: profile.githubLink, icon: Github, isLink: true },
                                                    { label: 'Experience Years', value: profile.experienceYears ?? null, icon: Briefcase },
                                                    { label: 'Country', value: profile.country, icon: MapPin },
                                                    { label: 'State', value: profile.state, icon: MapPin },
                                                    { label: 'District', value: profile.district, icon: MapPin },
                                                    { label: 'City', value: profile.city, icon: MapPin },
                                                    { label: 'Pincode', value: profile.pincode, icon: MapPin },
                                                    { label: 'Street', value: profile.street, icon: MapPin },
                                                    { label: 'Door / Flat No.', value: profile.doorNumber, icon: MapPin },
                                                ].map(({ label, value, icon: Icon, isLink }) => (
                                                    <div key={label} className="p-4 bg-white/3 rounded-xl border border-white/6 hover:border-white/12 transition-colors">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Icon className="w-3.5 h-3.5 text-primary" />
                                                            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</span>
                                                        </div>
                                                        {value ? (
                                                            isLink ? (
                                                                <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                                                                    {value} <ExternalLink className="w-3 h-3" />
                                                                </a>
                                                            ) : (
                                                                <p className="text-white font-semibold text-sm">{value}</p>
                                                            )
                                                        ) : (
                                                            <p className="text-text-secondary/50 text-sm italic">Not provided</p>
                                                        )}
                                                    </div>
                                                ))}
                                                <div className="sm:col-span-2 p-4 bg-white/3 rounded-xl border border-white/6 hover:border-white/12 transition-colors">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <MapPin className="w-3.5 h-3.5 text-primary" />
                                                        <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Full Address</span>
                                                    </div>
                                                    {personalAddress ? (
                                                        <p className="text-white font-semibold text-sm leading-relaxed">{personalAddress}</p>
                                                    ) : (
                                                        <p className="text-text-secondary/50 text-sm italic">Address not provided</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* EDUCATION TAB */}
                                {activeTab === 'education' && (
                                    <motion.div
                                        key="education"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-6">
                                            <BookOpen className="w-4 h-4 text-primary" />
                                            Educational Details
                                        </h3>
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-text-secondary mb-2">Highest Education</label>
                                                        <input
                                                            type="text"
                                                            value={editData.highestQualification}
                                                            onChange={e => setEditData({ ...editData, highestQualification: e.target.value })}
                                                            className={inputClass}
                                                            placeholder="B.Tech / MCA / MBA / Degree"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-text-secondary mb-2">CGPA</label>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="10"
                                                            step="0.01"
                                                            value={editData.cgpa}
                                                            onChange={e => setEditData({ ...editData, cgpa: e.target.value })}
                                                            className={inputClass}
                                                            placeholder="8.25"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-text-secondary mb-2">Year of Passing</label>
                                                        <input
                                                            type="number"
                                                            value={editData.passingYear}
                                                            onChange={e => setEditData({ ...editData, passingYear: e.target.value })}
                                                            className={inputClass}
                                                            placeholder="2025"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                {[
                                                    { label: 'Highest Education', value: profile.highestQualification, icon: BookOpen },
                                                    { label: 'CGPA', value: profile.cgpa ?? null, icon: Award },
                                                    { label: 'Year of Passing', value: profile.passingYear, icon: Calendar },
                                                ].map(({ label, value, icon: Icon }) => (
                                                    <div key={label} className="p-4 bg-white/3 rounded-xl border border-white/6 hover:border-white/12 transition-colors">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Icon className="w-3.5 h-3.5 text-primary" />
                                                            <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</span>
                                                        </div>
                                                        {value || value === 0 ? (
                                                            <p className="text-white font-semibold text-sm">{value}</p>
                                                        ) : (
                                                            <p className="text-text-secondary/50 text-sm italic">Not provided</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}

                                {/* SKILLS TAB */}
                                {activeTab === 'skills' && (
                                    <motion.div
                                        key="skills"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-6">
                                            <Star className="w-4 h-4 text-primary" />
                                            Skills & Technologies
                                        </h3>
                                        {isEditing ? (
                                            <SkillSelect selectedSkills={skills} onChange={setSkills} />
                                        ) : (
                                            skills.length > 0 ? (
                                                <div className="flex flex-wrap gap-3">
                                                    {skills.map((s, i) => (
                                                        <motion.span
                                                            key={i}
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            transition={{ delay: i * 0.05 }}
                                                            className="px-4 py-2 bg-primary/10 text-primary border border-primary/25 rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors cursor-default"
                                                        >
                                                            {s}
                                                        </motion.span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <Star className="w-10 h-10 text-text-secondary/30 mx-auto mb-3" />
                                                    <p className="text-text-secondary text-sm">No skills added yet.</p>
                                                    <button onClick={() => setIsEditing(true)} className="mt-3 text-primary text-sm hover:underline">Add skills now</button>
                                                </div>
                                            )
                                        )}
                                    </motion.div>
                                )}

                                {/* ACHIEVEMENTS TAB */}
                                {activeTab === 'achievements' && (
                                    <motion.div
                                        key="achievements"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-6">
                                            <Award className="w-4 h-4 text-primary" />
                                            Achievements
                                        </h3>
                                        {isEditing ? (
                                            <textarea
                                                value={editData.achievements}
                                                onChange={e => setEditData({ ...editData, achievements: e.target.value })}
                                                className={`${inputClass} min-h-[180px] resize-y leading-relaxed`}
                                                placeholder="List your major achievements, certifications, awards..."
                                            />
                                        ) : (
                                            profile.achievements ? (
                                                <div className="p-5 bg-white/3 rounded-xl border border-white/6">
                                                    <p className="text-text-secondary leading-relaxed whitespace-pre-wrap text-sm">{profile.achievements}</p>
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <Award className="w-10 h-10 text-text-secondary/30 mx-auto mb-3" />
                                                    <p className="text-text-secondary text-sm">No achievements added yet.</p>
                                                    <button onClick={() => setIsEditing(true)} className="mt-3 text-primary text-sm hover:underline">Add achievements</button>
                                                </div>
                                            )
                                        )}
                                    </motion.div>
                                )}

                                {/* RESUME TAB */}
                                {activeTab === 'resume' && (
                                    <motion.div
                                        key="resume"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-6">
                                            <FileText className="w-4 h-4 text-primary" />
                                            Resume
                                        </h3>
                                        {isEditing ? (
                                            <div className="space-y-3">
                                                <input
                                                    type="file"
                                                    ref={resumeInputRef}
                                                    onChange={handleFileChange}
                                                    accept=".pdf"
                                                    className="hidden"
                                                />
                                                <div
                                                    onClick={() => resumeInputRef.current?.click()}
                                                    className="w-full flex flex-col items-center justify-center gap-3 px-6 py-10 bg-white/3 border-2 border-dashed border-white/15 hover:border-primary/50 hover:bg-primary/3 rounded-xl cursor-pointer transition-all group"
                                                >
                                                    <Upload className="w-8 h-8 text-text-secondary group-hover:text-primary transition-colors" />
                                                    <div className="text-center">
                                                        <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                                                            {resumeFile ? resumeFile.name : 'Upload New Resume'}
                                                        </p>
                                                        <p className="text-xs text-text-secondary mt-1">PDF only · Max 6MB</p>
                                                        {profile.resumeUrl && !resumeFile && (
                                                            <p className="text-xs text-yellow-400/70 mt-2">Will replace your existing resume</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            getResumeUrl(profile.resumeUrl) ? (
                                                <div className="space-y-4">
                                                    <div className="p-5 bg-white/3 rounded-xl border border-white/8 flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                                                                <FileText className="w-6 h-6 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-semibold text-sm">Resume.pdf</p>
                                                                <p className="text-text-secondary text-xs mt-0.5">Click to view or download</p>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={getResumeUrl(profile.resumeUrl)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-all shadow-[0_0_15px_rgba(77,163,255,0.3)] hover:shadow-[0_0_25px_rgba(77,163,255,0.5)]"
                                                        >
                                                            <ExternalLink className="w-4 h-4" /> View Resume
                                                        </a>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <FileText className="w-10 h-10 text-text-secondary/30 mx-auto mb-3" />
                                                    <p className="text-text-secondary text-sm">No resume uploaded yet.</p>
                                                    <button onClick={() => setIsEditing(true)} className="mt-3 text-primary text-sm hover:underline">Upload your resume</button>
                                                </div>
                                            )
                                        )}
                                    </motion.div>
                                )}

                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
