import React, { useEffect, useMemo, useRef, useState } from 'react';
import { companyApi } from '../../api/companyApi';
import { authApi } from '../../api/authApi';
import AddressFields from '../../components/shared/AddressFields';
import {
    AlignLeft,
    Building2,
    Camera,
    Check,
    Edit2,
    Globe,
    Hash,
    Mail,
    MapPin,
    X,
} from 'lucide-react';
import { getAssetUrl } from '../../api/runtime';

const parseBranchAddress = (branchAddress) => {
    const parts = (branchAddress || '')
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);

    return {
        doorNumber: parts[0] || '',
        streetName: parts[1] || '',
        city: parts.length > 3 ? parts[parts.length - 4] : '',
        state: parts.length > 2 ? parts[parts.length - 3] : '',
        pincode: parts.length > 1 ? parts[parts.length - 2] : '',
        country: parts.length > 0 ? parts[parts.length - 1] : '',
    };
};

const buildBranchAddress = (address) =>
    [
        address.doorNumber,
        address.streetName,
        address.city,
        address.state,
        address.pincode,
        address.country,
    ]
        .filter(Boolean)
        .join(', ');

const getAddressItems = (profile, parsedAddress) => [
    { label: 'Door / Block', value: parsedAddress.doorNumber, icon: Hash },
    { label: 'Street', value: parsedAddress.streetName, icon: MapPin },
    { label: 'City', value: parsedAddress.city, icon: Building2 },
    { label: 'State', value: parsedAddress.state, icon: MapPin },
    { label: 'Pincode', value: parsedAddress.pincode, icon: Hash },
    { label: 'Country', value: parsedAddress.country, icon: Globe },
    { label: 'Full Address', value: profile.branchAddress, icon: MapPin, fullWidth: true },
];

export default function CompanyProfile() {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const [editData, setEditData] = useState({
        name: '',
        companyType: 'MNC',
        aboutCompany: '',
        profilePhoto: '',
    });
    const [editAddress, setEditAddress] = useState({
        doorNumber: '',
        streetName: '',
        city: '',
        state: '',
        pincode: '',
        country: '',
    });

    const fileInputRef = useRef(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await companyApi.getProfile();
            const data = res.data;
            setProfile(data);

            setEditData({
                name: data.name || '',
                companyType: data.companyType || 'MNC',
                aboutCompany: data.description || '',
                profilePhoto: data.profilePhoto || '',
            });
            setEditAddress(parseBranchAddress(data.branchAddress));
        } catch (err) {
            setError('Failed to load profile.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleLogoChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Only image files are allowed for company profile photo.');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError('Image size must be less than 2MB.');
            return;
        }

        setError('');
        setLogoFile(file);

        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setError('');
        setSaving(true);
        try {
            let profilePhoto = editData.profilePhoto;

            if (logoFile) {
                const uploadRes = await authApi.uploadFile(logoFile);
                profilePhoto = uploadRes.data.url;
            }

            const payload = {
                name: editData.name,
                companyType: editData.companyType,
                description: editData.aboutCompany,
                profilePhoto,
                branchAddress: buildBranchAddress(editAddress),
            };

            await companyApi.updateProfile(payload);
            setSuccessMsg('Profile updated successfully!');
            setIsEditing(false);
            setLogoFile(null);
            setPreviewUrl(null);
            window.dispatchEvent(new Event('company-profile-updated'));
            fetchProfile();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError('Failed to update profile.');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setEditData({
                name: profile.name || '',
                companyType: profile.companyType || 'MNC',
                aboutCompany: profile.description || '',
                profilePhoto: profile.profilePhoto || '',
            });
            setEditAddress(parseBranchAddress(profile.branchAddress));
        }
        setLogoFile(null);
        setPreviewUrl(null);
        setIsEditing(false);
        setError('');
    };

    const parsedAddress = useMemo(() => parseBranchAddress(profile?.branchAddress), [profile?.branchAddress]);
    const addressItems = useMemo(() => getAddressItems(profile || {}, parsedAddress), [profile, parsedAddress]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!profile) return <div className="p-6 text-center text-white">Failed to load profile data.</div>;

    const inputClass =
        'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-primary/50';

    const logoSrc = previewUrl || getAssetUrl(profile.profilePhoto);

    return (
        <div className="mx-auto max-w-5xl space-y-6 p-6">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="mb-2 text-3xl font-bold text-white">Company Profile</h1>
                    <p className="text-text-secondary">Manage your company details, address, logo, and about section.</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/20 px-4 py-2 font-medium text-primary transition-colors hover:bg-primary/30"
                    >
                        <Edit2 className="h-4 w-4" /> Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2 font-bold text-background shadow-[0_0_15px_rgba(77,163,255,0.3)] transition-colors hover:bg-primary/90"
                        >
                            {saving ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                            ) : (
                                <Check className="h-4 w-4" />
                            )}
                            Save
                        </button>
                        <button
                            onClick={handleCancel}
                            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2 font-medium text-white transition-colors hover:bg-white/20"
                        >
                            <X className="h-4 w-4" /> Cancel
                        </button>
                    </div>
                )}
            </div>

            {error && <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm font-medium text-danger">{error}</div>}
            {successMsg && (
                <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm font-medium text-success">
                    {successMsg}
                </div>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="glass-panel flex flex-col items-center p-6 text-center lg:col-span-1">
                    <div className="relative mb-6 group">
                        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                            {logoSrc ? (
                                <img src={logoSrc} alt="Company Logo" className="h-full w-full object-cover" />
                            ) : (
                                <Building2 className="h-16 w-16 text-text-secondary/50" />
                            )}
                        </div>
                        {isEditing && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl bg-background/80 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"
                                >
                                    <Camera className="mb-2 h-8 w-8 text-primary" />
                                    <span className="text-xs font-semibold text-primary">Change Photo</span>
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="hidden"
                                />
                            </>
                        )}
                    </div>

                    <h2 className="mb-1 text-xl font-bold text-white">{profile.name}</h2>
                    <div className="mb-4 flex items-center justify-center gap-2 text-sm text-text-secondary">
                        <Mail className="h-4 w-4" />
                        {profile.domainEmail}
                    </div>
                    <div className="mt-2 grid w-full grid-cols-2 gap-4 border-t border-white/5 pt-4 text-left">
                        <div>
                            <p className="mb-1 text-xs text-text-secondary">Status</p>
                            <span className="rounded-md border border-success/20 bg-success/20 px-2 py-1 text-xs font-bold text-success">
                                {profile.approved ? 'APPROVED' : 'PENDING'}
                            </span>
                        </div>
                        <div>
                            <p className="mb-1 text-xs text-text-secondary">Created</p>
                            <p className="text-sm font-medium text-white">
                                {new Date(profile.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="glass-panel space-y-8 p-8 lg:col-span-2">
                    <div className="space-y-4">
                        <h3 className="border-b border-white/10 pb-2 font-semibold text-white">Company Overview</h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-text-secondary">Company Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        className={inputClass}
                                    />
                                ) : (
                                    <p className="py-2 font-medium text-white">{profile.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-medium text-text-secondary">Company Type</label>
                                {isEditing ? (
                                    <select
                                        value={editData.companyType}
                                        onChange={(e) => setEditData({ ...editData, companyType: e.target.value })}
                                        className={`${inputClass} appearance-none`}
                                    >
                                        <option value="MNC" className="bg-background">MNC</option>
                                        <option value="STARTUP" className="bg-background">Startup</option>
                                        <option value="SERVICE_BASED" className="bg-background">Service Based</option>
                                        <option value="PRODUCT_BASED" className="bg-background">Product Based</option>
                                        <option value="AGENCY" className="bg-background">Agency</option>
                                    </select>
                                ) : (
                                    <p className="py-2 font-medium text-white">{profile.companyType}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 flex items-center gap-2 text-xs font-medium text-text-secondary">
                                <AlignLeft className="h-3.5 w-3.5 text-primary" />
                                About Company
                            </label>
                            {isEditing ? (
                                <textarea
                                    value={editData.aboutCompany}
                                    onChange={(e) => setEditData({ ...editData, aboutCompany: e.target.value })}
                                    className={`${inputClass} min-h-[140px] resize-y leading-relaxed`}
                                    placeholder="Write about your company, culture, domain, services, and key strengths."
                                />
                            ) : (
                                <div className="rounded-xl border border-white/8 bg-white/[0.03] p-4">
                                    <p className="text-sm leading-relaxed text-text-secondary">
                                        {profile.description || 'No company overview added yet.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {isEditing ? (
                            <AddressFields title="Branch Address" value={editAddress} onChange={setEditAddress} />
                        ) : (
                            <>
                                <h3 className="border-b border-white/10 pb-2 font-semibold text-white">Detailed Address</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {addressItems.map(({ label, value, icon: Icon, fullWidth }) => (
                                        <div
                                            key={label}
                                            className={`rounded-xl border border-white/8 bg-white/[0.03] p-4 ${
                                                fullWidth ? 'md:col-span-2' : ''
                                            }`}
                                        >
                                            <div className="mb-2 flex items-center gap-2">
                                                <Icon className="h-3.5 w-3.5 text-primary" />
                                                <span className="text-xs font-medium uppercase tracking-[0.18em] text-text-secondary">
                                                    {label}
                                                </span>
                                            </div>
                                            {value ? (
                                                <p className="text-sm font-medium leading-relaxed text-white">{value}</p>
                                            ) : (
                                                <p className="text-sm italic text-text-secondary/50">Not provided</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
