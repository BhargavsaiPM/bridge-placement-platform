import React, { useState, useEffect, useRef } from 'react';
import { companyApi } from '../../api/companyApi';
import { authApi } from '../../api/authApi';
import AddressFields from '../../components/shared/AddressFields';
import { Building2, Mail, Edit2, Check, X, Upload, Camera } from 'lucide-react';

export default function CompanyProfile() {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [editData, setEditData] = useState({
        name: '', companyType: ''
    });
    const [editAddress, setEditAddress] = useState({
        doorNumber: '', streetName: '', city: '', state: '', pincode: '', country: '', landmark: ''
    });

    const fileInputRef = useRef(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await companyApi.getProfile();
            setProfile(res.data);

            // Map the single comma-separated branchAddress back to individual fields for editing
            // Assumption: Address format is "Door, Street, Landmark, City, State, Pincode, Country"
            // If the user hasn't edited via new UI, it might just be a random string. We try our best.
            const parts = (res.data.branchAddress || '').split(',').map(s => s.trim());

            // Basic mapping fallback
            setEditData({
                name: res.data.name || '',
                companyType: res.data.companyType || 'MNC'
            });

            // If they registered with the new UI, there should be ~6-7 parts. We just dump them as best effort if we can't reliably map, but for now user will just re-fill if format is weird.
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
            // Address logic happens in backend string stream format, wait the updateProfile backend endpoint probably uses UpdateCompanyProfileRequest.
            // Let's check what UpdateCompanyProfileRequest expects. It likely expects 'name', 'branchAddress', 'companyType'.
            // Because we didn't update UpdateCompanyProfileRequest in Phase 1 tasks! We only updated RegisterCompanyRequest!

            // Wait, we need to send branchAddress as a single string for update, since we didn't update the DTO.
            const branchAddress = [
                editAddress.doorNumber, editAddress.streetName, editAddress.landmark,
                editAddress.city, editAddress.state, editAddress.pincode, editAddress.country
            ].filter(Boolean).join(', ');

            const payload = {
                name: editData.name,
                companyType: editData.companyType,
                branchAddress
            };

            await companyApi.updateProfile(payload);
            setSuccessMsg("Profile updated successfully!");
            setIsEditing(false);
            fetchProfile(); // refresh
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

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Company Profile</h1>
                    <p className="text-text-secondary">Manage your company details and address.</p>
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
                        <div className="w-32 h-32 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                            <Building2 className="w-16 h-16 text-text-secondary/50" />
                        </div>
                        {isEditing && (
                            <button
                                onClick={() => alert('Logo upload coming soon...')}
                                className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl cursor-pointer"
                            >
                                <Camera className="w-8 h-8 text-primary mb-2" />
                                <span className="text-xs font-semibold text-primary">Upload Logo</span>
                            </button>
                        )}
                    </div>

                    <h2 className="text-xl font-bold text-white mb-1">{profile.name}</h2>
                    <div className="flex items-center justify-center gap-2 text-text-secondary text-sm mb-4">
                        <Mail className="w-4 h-4" />
                        {profile.domainEmail}
                    </div>

                    <div className="w-full pt-4 mt-2 border-t border-white/5 grid grid-cols-2 gap-4 text-left">
                        <div>
                            <p className="text-xs text-text-secondary mb-1">Status</p>
                            <span className="px-2 py-1 bg-success/20 text-success rounded-md text-xs font-bold border border-success/20">
                                {profile.approved ? 'APPROVED' : 'PENDING'}
                            </span>
                        </div>
                        <div>
                            <p className="text-xs text-text-secondary mb-1">Created</p>
                            <p className="text-sm font-medium text-white">
                                {new Date(profile.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Details Form Card */}
                <div className="lg:col-span-2 glass-panel p-8 space-y-8">

                    <div className="space-y-4">
                        <h3 className="font-semibold text-white border-b border-white/10 pb-2">Company Overview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Company Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-primary/50 transition-colors text-sm"
                                    />
                                ) : (
                                    <p className="text-white font-medium py-2">{profile.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-text-secondary mb-1">Company Type</label>
                                {isEditing ? (
                                    <select
                                        value={editData.companyType}
                                        onChange={e => setEditData({ ...editData, companyType: e.target.value })}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-primary/50 transition-colors text-sm appearance-none"
                                    >
                                        <option value="MNC" className="bg-background">MNC</option>
                                        <option value="STARTUP" className="bg-background">Startup</option>
                                        <option value="SERVICE_BASED" className="bg-background">Service Based</option>
                                        <option value="PRODUCT_BASED" className="bg-background">Product Based</option>
                                        <option value="AGENCY" className="bg-background">Agency</option>
                                    </select>
                                ) : (
                                    <p className="text-white font-medium py-2">{profile.companyType}</p>
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
                                        {profile.branchAddress || "No address provided."}
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
