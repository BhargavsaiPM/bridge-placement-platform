import React, { useState, useEffect, useRef } from 'react';
import { userApi } from '../../api/userApi';
import { authApi } from '../../api/authApi';
import SkillSelect from '../../components/shared/SkillSelect';
import { User, Mail, Phone, Calendar, Link as LinkIcon, Edit2, Check, X, Upload, Camera, FileText } from 'lucide-react';

export default function UserProfile() {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Edit Form State
    const [editData, setEditData] = useState({
        name: '', mobile: '', dob: '', githubLink: '', achievements: ''
    });
    const [skills, setSkills] = useState([]);

    // File State
    const [resumeFile, setResumeFile] = useState(null);
    const resumeInputRef = useRef(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await userApi.getProfile();
            setProfile(res.data);

            setEditData({
                name: res.data.name || '',
                mobile: res.data.mobile || '',
                dob: res.data.dob || '',
                githubLink: res.data.githubLink || '',
                achievements: res.data.achievements || ''
            });

            const parsedSkills = res.data.skills ? res.data.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
            setSkills(parsedSkills);

        } catch (err) {
            setError("Failed to load profile.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

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

    const handleSave = async () => {
        setError('');
        setSaving(true);
        try {
            let resumeFileName = '';
            if (resumeFile) {
                const uploadRes = await authApi.uploadFile(resumeFile);
                resumeFileName = uploadRes.data.url;
            }

            const payload = {
                ...editData,
                skills: skills.join(', '),
                resumeFileName
            };

            await userApi.updateProfile(payload);
            setSuccessMsg("Profile updated successfully!");
            setIsEditing(false);
            setResumeFile(null);
            fetchProfile(); // Refresh
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError("Failed to update profile.");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) return <div className="p-6 text-white text-center bg-background min-h-screen">Failed to load profile data.</div>;

    const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-primary/50 transition-colors text-sm";

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
                        <p className="text-text-secondary">Manage your personal information, skills, and resume.</p>
                    </div>
                    {!isEditing ? (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-xl transition-colors font-medium border border-primary/20"
                        >
                            <Edit2 className="w-4 h-4" /> Edit Profile
                        </button>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-6 py-2 bg-primary text-background font-bold hover:bg-primary/90 rounded-xl transition-colors shadow-[0_0_15px_rgba(77,163,255,0.3)]"
                            >
                                {saving ? <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                                Save
                            </button>
                            <button
                                onClick={() => { setIsEditing(false); setError(''); setResumeFile(null); }}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-xl transition-colors font-medium border border-white/10"
                            >
                                <X className="w-4 h-4" /> Cancel
                            </button>
                        </div>
                    )}
                </div>

                {error && <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm font-medium">{error}</div>}
                {successMsg && <div className="p-4 rounded-xl bg-success/10 border border-success/30 text-success text-sm font-medium">{successMsg}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Visual Profile Card */}
                    <div className="lg:col-span-1 glass-panel p-6 flex flex-col items-center text-center">
                        <div className="relative group mb-6">
                            <div className="w-32 h-32 rounded-full border-4 border-primary/20 bg-white/5 flex items-center justify-center overflow-hidden">
                                {profile.profilePhoto ? (
                                    <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-16 h-16 text-text-secondary/50" />
                                )}
                            </div>
                            {isEditing && (
                                <button
                                    onClick={() => alert('Photo upload functionality coming soon...')}
                                    className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                                >
                                    <Camera className="w-8 h-8 text-primary mb-2" />
                                </button>
                            )}
                        </div>

                        <h2 className="text-xl font-bold text-white mb-1">{profile.name}</h2>
                        <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold mb-4 border border-primary/20">
                            {profile.roleType}
                        </span>

                        <div className="w-full space-y-3 text-left border-t border-white/5 pt-4">
                            <div className="flex items-center gap-3 text-text-secondary text-sm">
                                <Mail className="w-4 h-4" />
                                <span className="truncate">{profile.email}</span>
                            </div>
                            {profile.mobile && (
                                <div className="flex items-center gap-3 text-text-secondary text-sm">
                                    <Phone className="w-4 h-4" />
                                    <span>{profile.mobile}</span>
                                </div>
                            )}
                            {profile.dob && (
                                <div className="flex items-center gap-3 text-text-secondary text-sm">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(profile.dob).toLocaleDateString()}</span>
                                </div>
                            )}
                            {profile.githubLink && (
                                <div className="flex items-center gap-3 text-primary text-sm hover:underline cursor-pointer">
                                    <LinkIcon className="w-4 h-4" />
                                    <a href={profile.githubLink} target="_blank" rel="noopener noreferrer">GitHub Profile</a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details Form Card */}
                    <div className="lg:col-span-2 glass-panel p-8 space-y-8">

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-white border-b border-white/10 pb-2">Personal Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">Full Name</label>
                                    {isEditing ? (
                                        <input type="text" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className={inputClass} />
                                    ) : (
                                        <p className="text-white font-medium py-2">{profile.name}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">Mobile</label>
                                    {isEditing ? (
                                        <input type="text" value={editData.mobile} onChange={e => setEditData({ ...editData, mobile: e.target.value })} className={inputClass} />
                                    ) : (
                                        <p className="text-white font-medium py-2">{profile.mobile || '—'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">Date of Birth</label>
                                    {isEditing ? (
                                        <input type="date" value={editData.dob} onChange={e => setEditData({ ...editData, dob: e.target.value })} className={inputClass} />
                                    ) : (
                                        <p className="text-white font-medium py-2">{profile.dob ? new Date(profile.dob).toLocaleDateString() : '—'}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1">GitHub Link</label>
                                    {isEditing ? (
                                        <input type="url" value={editData.githubLink} onChange={e => setEditData({ ...editData, githubLink: e.target.value })} className={inputClass} placeholder="https://github.com/username" />
                                    ) : (
                                        <p className="text-white font-medium py-2 break-all">{profile.githubLink || '—'}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-white border-b border-white/10 pb-2">Skills</h3>
                            {isEditing ? (
                                <SkillSelect selectedSkills={skills} onChange={setSkills} />
                            ) : (
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {skills.length > 0 ? skills.map((s, i) => (
                                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-medium">
                                            {s}
                                        </span>
                                    )) : (
                                        <p className="text-text-secondary text-sm">No skills added yet.</p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Achievements */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-white border-b border-white/10 pb-2">Achievements</h3>
                            {isEditing ? (
                                <textarea
                                    value={editData.achievements}
                                    onChange={e => setEditData({ ...editData, achievements: e.target.value })}
                                    className={`${inputClass} min-h-[100px] resize-y`}
                                    placeholder="List your major achievements..."
                                />
                            ) : (
                                <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
                                    {profile.achievements || "No achievements provided."}
                                </p>
                            )}
                        </div>

                        {/* Resume */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-white border-b border-white/10 pb-2">Resume</h3>
                            {isEditing ? (
                                <div>
                                    <input type="file" ref={resumeInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
                                    <div
                                        onClick={() => resumeInputRef.current?.click()}
                                        className="w-full flex items-center justify-center gap-3 px-4 py-6 bg-white/5 border border-dashed border-white/20 hover:border-primary/50 rounded-xl cursor-pointer transition-colors group"
                                    >
                                        <Upload className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
                                        <div className="text-center">
                                            <p className="text-sm font-medium text-text-secondary group-hover:text-white transition-colors">
                                                {resumeFile ? resumeFile.name : 'Update Resume (PDF)'}
                                            </p>
                                            <p className="text-xs text-text-secondary mt-1">
                                                {profile.resumeUrl ? 'Will replace existing resume' : 'No resume uploaded yet'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="pt-2">
                                    {profile.resumeUrl ? (
                                        <a
                                            href={`http://localhost:9092${profile.resumeUrl}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors"
                                        >
                                            <FileText className="w-5 h-5 text-primary" />
                                            <span className="font-medium text-sm">View Current Resume</span>
                                        </a>
                                    ) : (
                                        <p className="text-text-secondary text-sm">No resume uploaded.</p>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
