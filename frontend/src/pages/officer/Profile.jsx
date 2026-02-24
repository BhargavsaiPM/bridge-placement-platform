import React, { useState, useEffect, useRef } from 'react';
import { officerApi } from '../../api/officerApi';
import AddressFields from '../../components/shared/AddressFields';
import { User, Mail, Edit2, Check, X, Camera } from 'lucide-react';

export default function OfficerProfile() {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [editData, setEditData] = useState({
        name: '', age: '', jobRole: '', workingSince: '', department: '', bloodGroup: ''
    });
    const [editAddress, setEditAddress] = useState({
        doorNumber: '', streetName: '', city: '', state: '', pincode: '', country: '', landmark: ''
    });

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await officerApi.getProfile();
            setProfile(res.data);

            setEditData({
                name: res.data.name || '',
                age: res.data.age || '',
                jobRole: res.data.jobRole || '',
                workingSince: res.data.workingSince || '',
                department: res.data.department || '',
                bloodGroup: res.data.bloodGroup || ''
            });

            const parts = (res.data.address || '').split(',').map(s => s.trim());

            setEditAddress({
                doorNumber: parts[0] || '',
                streetName: parts[1] || '',
                city: parts.length > 3 ? parts[parts.length - 4] : '',
                state: parts.length > 2 ? parts[parts.length - 3] : '',
                pincode: parts.length > 1 ? parts[parts.length - 2] : '',
                country: parts.length > 0 ? parts[parts.length - 1] : '',
                landmark: parts.length > 6 ? parts[2] : ''
            });

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

    const handleSave = async () => {
        setError('');
        setSaving(true);
        try {
            const payload = {
                ...editData,
                ...editAddress
            };

            await officerApi.updateProfile(payload);
            setSuccessMsg("Profile updated successfully!");
            setIsEditing(false);
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
            <div className="flex h-64 items-center justify-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!profile) return <div className="p-6 text-white text-center">Failed to load profile data.</div>;

    const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-primary/50 transition-colors text-sm";

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Officer Profile</h1>
                    <p className="text-text-secondary">Manage your professional details as a Placement Officer.</p>
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
                            onClick={() => { setIsEditing(false); setError(''); }}
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

                {/* Visual Identity Profile Card */}
                <div className="lg:col-span-1 glass-panel p-6 flex flex-col items-center text-center">
                    <div className="relative group mb-6">
                        <div className="w-32 h-32 rounded-full bg-white/5 border-4 border-primary/20 flex items-center justify-center overflow-hidden">
                            {profile.profilePhoto ? (
                                <img src={profile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-16 h-16 text-text-secondary/50" />
                            )}
                        </div>
                        {isEditing && (
                            <button
                                onClick={() => alert('Photo upload coming soon...')}
                                className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                            >
                                <Camera className="w-8 h-8 text-primary mb-2" />
                            </button>
                        )}
                    </div>

                    <h2 className="text-xl font-bold text-white mb-1">{profile.name}</h2>
                    <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-xs font-bold mb-4 border border-primary/20">
                        {profile.role}
                    </span>

                    <div className="w-full text-left space-y-3 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-3 text-text-secondary text-sm">
                            <Mail className="w-4 h-4" />
                            <span className="truncate">{profile.email}</span>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <p className="text-xs text-text-secondary mb-1">Status</p>
                            <span className={`px-2 py-1 rounded-md text-xs font-bold border ${profile.isActive ? 'bg-success/20 text-success border-success/20' : 'bg-danger/20 text-danger border-danger/20'}`}>
                                {profile.isActive ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Details Form Card */}
                <div className="lg:col-span-2 glass-panel p-8 space-y-8">

                    <div className="space-y-4">
                        <h3 className="font-semibold text-white border-b border-white/10 pb-2">Professional Info</h3>
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
                                <label className="block text-xs font-medium text-text-secondary mb-1">Department</label>
                                {isEditing ? (
                                    <input type="text" value={editData.department} onChange={e => setEditData({ ...editData, department: e.target.value })} className={inputClass} />
                                ) : (
                                    <p className="text-white font-medium py-2">{profile.department || '—'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Job Role</label>
                                {isEditing ? (
                                    <input type="text" value={editData.jobRole} onChange={e => setEditData({ ...editData, jobRole: e.target.value })} className={inputClass} />
                                ) : (
                                    <p className="text-white font-medium py-2">{profile.jobRole || '—'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Working Since</label>
                                {isEditing ? (
                                    <input type="date" value={editData.workingSince} onChange={e => setEditData({ ...editData, workingSince: e.target.value })} className={inputClass} />
                                ) : (
                                    <p className="text-white font-medium py-2">{profile.workingSince ? new Date(profile.workingSince).toLocaleDateString() : '—'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-semibold text-white border-b border-white/10 pb-2">Personal Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Age</label>
                                {isEditing ? (
                                    <input type="number" value={editData.age} onChange={e => setEditData({ ...editData, age: e.target.value })} className={inputClass} />
                                ) : (
                                    <p className="text-white font-medium py-2">{profile.age || '—'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Blood Group</label>
                                {isEditing ? (
                                    <input type="text" value={editData.bloodGroup} onChange={e => setEditData({ ...editData, bloodGroup: e.target.value })} className={inputClass} />
                                ) : (
                                    <p className="text-white font-medium py-2">{profile.bloodGroup || '—'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {isEditing ? (
                            <AddressFields value={editAddress} onChange={setEditAddress} />
                        ) : (
                            <>
                                <h3 className="font-semibold text-white border-b border-white/10 pb-2">Address</h3>
                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-text-secondary leading-relaxed">
                                        {profile.address || "No address provided."}
                                    </p>
                                </div>
                            </>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
