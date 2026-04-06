import React, { useState, useEffect, useRef } from 'react';
import { adminApi } from '../../api/adminApi';
import { authApi } from '../../api/authApi';
import { User, Mail, Shield, Edit2, Check, X, Camera } from 'lucide-react';
import { getAssetUrl } from '../../api/runtime';

export default function AdminProfile() {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Edit Form State
    const [editData, setEditData] = useState({ name: '' });
    
    // File State
    const [photoFile, setPhotoFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const photoInputRef = useRef(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getProfile();
            setProfile(res.data);
            setEditData({ name: res.data.name || '' });
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

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Only image files are allowed for profile photos.');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                setError('Image size must be less than 2MB.');
                return;
            }
            setError('');
            setPhotoFile(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        setError('');
        setSaving(true);
        try {
            let photoUrl = profile.profilePhoto;
            
            // Upload new photo if selected
            if (photoFile) {
                const uploadRes = await authApi.uploadFile(photoFile);
                photoUrl = uploadRes.data.url;
            }

            const payload = {
                name: editData.name,
                profilePhoto: photoUrl
            };

            await adminApi.updateProfile(payload);
            setSuccessMsg("Profile updated successfully!");
            setIsEditing(false);
            setPhotoFile(null);
            setPreviewUrl(null);
            fetchProfile(); // Refresh page to get latest changes
            
            // Reload window to update TopNav 'A' or Image immediately
            setTimeout(() => {
                window.location.reload();
            }, 1000);
            
        } catch (err) {
            setError("Failed to update profile.");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        setError('');
        setPhotoFile(null);
        setPreviewUrl(null);
        setEditData({ name: profile.name });
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) return <div className="text-white text-center mt-10">Failed to load profile data.</div>;

    const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-primary/50 transition-colors text-sm";
    const readOnlyClass = "w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl text-text-secondary outline-none cursor-not-allowed text-sm opacity-75";

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Admin Profile</h1>
                    <p className="text-text-secondary">Manage your administrator account details.</p>
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
                            onClick={handleCancel}
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
                        <div className="w-40 h-40 rounded-full border-4 border-primary/30 bg-white/5 flex items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(77,163,255,0.15)] relative z-10">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : profile.profilePhoto ? (
                                <img src={getAssetUrl(profile.profilePhoto)} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-6xl font-black text-primary/80 tracking-tighter">A</span>
                            )}
                        </div>
                        
                        {isEditing && (
                            <div 
                                onClick={() => photoInputRef.current?.click()}
                                className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer border-4 border-transparent z-20 backdrop-blur-sm"
                            >
                                <Camera className="w-8 h-8 text-primary mb-2 shadow-sm" />
                                <span className="text-xs text-white font-medium">Change Photo</span>
                            </div>
                        )}
                        <input type="file" ref={photoInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
                    </div>

                    <h2 className="text-xl font-bold text-white mb-1">{profile.name}</h2>
                    <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold mb-4 flex items-center gap-1.5 focus:outline-none">
                        <Shield className="w-3 h-3" /> {profile.roleType}
                    </span>

                    <div className="w-full space-y-3 text-left border-t border-white/5 pt-4">
                        <div className="flex items-center gap-3 text-text-secondary text-sm">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{profile.email}</span>
                        </div>
                    </div>
                </div>

                {/* Details Form Card */}
                <div className="lg:col-span-2 glass-panel p-8 space-y-8">
                    
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-white border-b border-white/10 pb-2">Admin Identity</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Display Name</label>
                                {isEditing ? (
                                    <input type="text" value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} className={inputClass} placeholder="Enter your display name" />
                                ) : (
                                    <p className="text-white font-medium py-2">{profile.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Email ID (Read Only)</label>
                                <div className="relative">
                                    <input type="email" value={profile.email} readOnly className={readOnlyClass} />
                                    <span className="absolute right-3 top-3 text-[10px] text-text-secondary">SYSTEM</span>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Role (Read Only)</label>
                                <div className="relative">
                                    <input type="text" value={profile.roleType} readOnly className={readOnlyClass} />
                                    <span className="absolute right-3 top-3 text-[10px] text-text-secondary">SYSTEM</span>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Password</label>
                                <div className="relative">
                                    <input type="password" value="••••••••" readOnly className={readOnlyClass} />
                                    <span className="absolute right-3 top-3 text-[10px] text-text-secondary">Protected</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    );
}
