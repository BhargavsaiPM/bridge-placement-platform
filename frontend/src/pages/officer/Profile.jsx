import React, { useEffect, useMemo, useState } from 'react';
import { Camera, Check, Edit2, KeyRound, Mail, Phone, User, X } from 'lucide-react';
import { officerApi } from '../../api/officerApi';
import AddressFields from '../../components/shared/AddressFields';

const getAssetUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:9092${url}`;
};

const parseAddress = (address) => {
    const parts = (address || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

    if (parts.length === 0) {
        return {
            doorNumber: '',
            streetName: '',
            landmark: '',
            city: '',
            district: '',
            state: '',
            pincode: '',
            country: '',
        };
    }

    const doorNumber = parts[0] || '';
    const streetName = parts[1] || '';
    const country = parts.length >= 1 ? parts[parts.length - 1] : '';
    const pincode = parts.length >= 2 ? parts[parts.length - 2] : '';
    const state = parts.length >= 3 ? parts[parts.length - 3] : '';
    const middleParts = parts.slice(2, Math.max(parts.length - 3, 2));

    if (parts.length <= 6) {
        return {
            doorNumber,
            streetName,
            landmark: '',
            city: middleParts[0] || '',
            district: '',
            state,
            pincode,
            country,
        };
    }

    return {
        doorNumber,
        streetName,
        landmark: middleParts[0] || '',
        city: middleParts[1] || '',
        district: middleParts[2] || '',
        state,
        pincode,
        country,
    };
};

const getMobileNumber = (profile) =>
    profile?.mobileNumber || profile?.mobile || profile?.phoneNumber || profile?.phone || '';

const getDateOfBirth = (profile) =>
    profile?.dateOfBirth || profile?.dob || profile?.birthDate || '';

const getDetailedAddress = (profile) => {
    const parsedAddress = parseAddress(profile?.address);

    return {
        doorNumber: profile?.doorNumber || parsedAddress.doorNumber || '',
        streetName: profile?.streetName || parsedAddress.streetName || '',
        landmark: profile?.landmark || parsedAddress.landmark || '',
        city: profile?.city || parsedAddress.city || '',
        district: profile?.district || parsedAddress.district || '',
        state: profile?.state || parsedAddress.state || '',
        pincode: profile?.pincode || parsedAddress.pincode || '',
        country: profile?.country || parsedAddress.country || '',
    };
};

const formatAddress = (address) =>
    [
        address.doorNumber,
        address.streetName,
        address.landmark,
        address.city,
        address.district,
        address.state,
        address.pincode,
        address.country,
    ]
        .filter(Boolean)
        .join(', ');

const getOfficerStatus = (profile) => profile?.active ?? profile?.isActive ?? false;
const getWorkingSinceDate = (profile) => profile?.workingSince || profile?.createdAt || '';

export default function OfficerProfile() {
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [editData, setEditData] = useState({
        name: '',
        age: '',
        dateOfBirth: '',
        mobileNumber: '',
        jobRole: '',
        workingSince: '',
        department: '',
        bloodGroup: '',
    });
    const [editAddress, setEditAddress] = useState(parseAddress(''));
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: '',
    });

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await officerApi.getProfile();
            const profileData = res.data;

            setProfile(profileData);
            setEditData({
                name: profileData.name || '',
                age: profileData.age || '',
                dateOfBirth: getDateOfBirth(profileData) || '',
                mobileNumber: getMobileNumber(profileData),
                jobRole: profileData.jobRole || '',
                workingSince: getWorkingSinceDate(profileData)
                    ? new Date(getWorkingSinceDate(profileData)).toISOString().split('T')[0]
                    : '',
                department: profileData.department || '',
                bloodGroup: profileData.bloodGroup || '',
            });
            setEditAddress(getDetailedAddress(profileData));
            setPasswordData({ newPassword: '', confirmPassword: '' });
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

    const handleCancel = () => {
        if (!profile) {
            setIsEditing(false);
            return;
        }

        setEditData({
            name: profile.name || '',
            age: profile.age || '',
            dateOfBirth: getDateOfBirth(profile) || '',
            mobileNumber: getMobileNumber(profile),
            jobRole: profile.jobRole || '',
            workingSince: getWorkingSinceDate(profile)
                ? new Date(getWorkingSinceDate(profile)).toISOString().split('T')[0]
                    : '',
            department: profile.department || '',
            bloodGroup: profile.bloodGroup || '',
        });
        setEditAddress(getDetailedAddress(profile));
        setPasswordData({ newPassword: '', confirmPassword: '' });
        setError('');
        setSuccessMsg('');
        setIsEditing(false);
    };

    const handleSave = async () => {
        setError('');
        setSuccessMsg('');

        if (passwordData.newPassword || passwordData.confirmPassword) {
            if (!passwordData.newPassword.trim()) {
                setError('Please enter a new password to update it.');
                return;
            }
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                setError('New password and confirm password do not match.');
                return;
            }
            if (passwordData.newPassword.length < 6) {
                setError('Password must be at least 6 characters long.');
                return;
            }
        }

        setSaving(true);

        try {
            const payload = {
                ...editData,
                age: editData.age ? Number(editData.age) : null,
                dateOfBirth: editData.dateOfBirth || null,
                mobileNumber: editData.mobileNumber.trim(),
                workingSince: editData.workingSince || null,
                ...editAddress,
            };

            await officerApi.updateProfile(payload);

            if (passwordData.newPassword) {
                await officerApi.changePassword({ newPassword: passwordData.newPassword });
            }

            setSuccessMsg(
                passwordData.newPassword
                    ? 'Profile and password updated successfully.'
                    : 'Profile updated successfully.'
            );
            setIsEditing(false);
            await fetchProfile();
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile.');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const officerStatus = useMemo(() => getOfficerStatus(profile), [profile]);
    const detailedAddress = useMemo(() => getDetailedAddress(profile), [profile]);
    const formattedAddress = useMemo(() => formatAddress(detailedAddress), [detailedAddress]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (!profile) return <div className="p-6 text-center text-white">Failed to load profile data.</div>;

    const inputClass =
        'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-primary/50';

    return (
        <div className="mx-auto max-w-5xl space-y-6 p-6">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="mb-2 text-3xl font-bold text-white">Officer Profile</h1>
                    <p className="text-text-secondary">
                        Manage your professional details, personal information, and password as a Placement Officer.
                    </p>
                </div>

                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/20 px-4 py-2 font-medium text-primary transition-colors hover:bg-primary/30"
                    >
                        <Edit2 className="h-4 w-4" />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2 font-bold text-background transition-colors hover:bg-primary/90"
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
                            <X className="h-4 w-4" />
                            Cancel
                        </button>
                    </div>
                )}
            </div>

            {error && <div className="rounded-xl border border-danger/30 bg-danger/10 p-4 text-sm font-medium text-danger">{error}</div>}
            {successMsg && <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm font-medium text-success">{successMsg}</div>}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="glass-panel flex flex-col items-center p-6 text-center lg:col-span-1">
                    <div className="group relative mb-6">
                        <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-primary/20 bg-white/5">
                            {profile.profilePhoto ? (
                                <img src={getAssetUrl(profile.profilePhoto)} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-16 w-16 text-text-secondary/50" />
                            )}
                        </div>
                        {isEditing && (
                            <button
                                onClick={() => alert('Profile photo upload is not connected yet.')}
                                className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-background/80 opacity-0 transition-opacity group-hover:opacity-100"
                            >
                                <Camera className="mb-2 h-8 w-8 text-primary" />
                            </button>
                        )}
                    </div>

                    <h2 className="mb-1 text-xl font-bold text-white">{profile.name}</h2>
                    <span className="mb-4 rounded-full border border-primary/20 bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
                        {profile.role}
                    </span>

                    <div className="w-full space-y-4 border-t border-white/5 pt-4 text-left">
                        <div className="flex items-center gap-3 text-sm text-text-secondary">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{profile.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-text-secondary">
                            <Phone className="h-4 w-4" />
                            <span>{getMobileNumber(profile) || 'Add mobile number'}</span>
                        </div>
                        <div className="border-t border-white/5 pt-4">
                            <p className="mb-1 text-xs text-text-secondary">Status</p>
                            <span
                                className={`rounded-md border px-2 py-1 text-xs font-bold ${
                                    officerStatus
                                        ? 'border-success/20 bg-success/20 text-success'
                                        : 'border-danger/20 bg-danger/20 text-danger'
                                }`}
                            >
                                {officerStatus ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                        </div>
                        {profile.requiresPasswordChange && (
                            <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs leading-relaxed text-warning">
                                Temporary password is still active. Open edit mode and set a new password once.
                            </div>
                        )}
                    </div>
                </div>

                <div className="glass-panel space-y-8 p-8 lg:col-span-2">
                    <div className="space-y-4">
                        <h3 className="border-b border-white/10 pb-2 font-semibold text-white">Professional Info</h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-text-secondary">Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={(event) => setEditData({ ...editData, name: event.target.value })}
                                        className={inputClass}
                                    />
                                ) : (
                                    <p className="py-2 font-medium text-white">{profile.name}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-text-secondary">Department</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editData.department}
                                        onChange={(event) => setEditData({ ...editData, department: event.target.value })}
                                        className={inputClass}
                                    />
                                ) : (
                                    <p className="py-2 font-medium text-white">{profile.department || '-'}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-text-secondary">Job Role</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editData.jobRole}
                                        onChange={(event) => setEditData({ ...editData, jobRole: event.target.value })}
                                        className={inputClass}
                                    />
                                ) : (
                                    <p className="py-2 font-medium text-white">{profile.jobRole || '-'}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-text-secondary">Working Since</label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={editData.workingSince}
                                        readOnly
                                        disabled
                                        className={`${inputClass} cursor-not-allowed opacity-70`}
                                    />
                                ) : (
                                    <p className="py-2 font-medium text-white">
                                        {getWorkingSinceDate(profile)
                                            ? new Date(getWorkingSinceDate(profile)).toLocaleDateString('en-IN')
                                            : '-'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="border-b border-white/10 pb-2 font-semibold text-white">Personal Details</h3>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-text-secondary">Age</label>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={editData.age}
                                        onChange={(event) => setEditData({ ...editData, age: event.target.value })}
                                        className={inputClass}
                                    />
                                ) : (
                                    <p className="py-2 font-medium text-white">{profile.age || '-'}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-text-secondary">Blood Group</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editData.bloodGroup}
                                        onChange={(event) => setEditData({ ...editData, bloodGroup: event.target.value })}
                                        className={inputClass}
                                    />
                                ) : (
                                    <p className="py-2 font-medium text-white">{profile.bloodGroup || '-'}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-text-secondary">Mobile Number</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={editData.mobileNumber}
                                        onChange={(event) => setEditData({ ...editData, mobileNumber: event.target.value })}
                                        className={inputClass}
                                        placeholder="e.g. 9876543210"
                                    />
                                ) : (
                                    <p className="py-2 font-medium text-white">{getMobileNumber(profile) || '-'}</p>
                                )}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-text-secondary">Date Of Birth</label>
                                {isEditing ? (
                                    <input
                                        type="date"
                                        value={editData.dateOfBirth}
                                        onChange={(event) => setEditData({ ...editData, dateOfBirth: event.target.value })}
                                        className={inputClass}
                                    />
                                ) : (
                                    <p className="py-2 font-medium text-white">
                                        {getDateOfBirth(profile)
                                            ? new Date(getDateOfBirth(profile)).toLocaleDateString('en-IN')
                                            : '-'}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {isEditing ? (
                            <AddressFields value={editAddress} onChange={setEditAddress} />
                        ) : (
                            <>
                                <h3 className="border-b border-white/10 pb-2 font-semibold text-white">Address</h3>
                                <div className="grid grid-cols-1 gap-4 rounded-xl border border-white/5 bg-white/5 p-4 md:grid-cols-2">
                                    {[
                                        { label: 'Door / Flat No.', value: detailedAddress.doorNumber },
                                        { label: 'Street', value: detailedAddress.streetName },
                                        { label: 'Landmark', value: detailedAddress.landmark },
                                        { label: 'City', value: detailedAddress.city },
                                        { label: 'District', value: detailedAddress.district },
                                        { label: 'State', value: detailedAddress.state },
                                        { label: 'Pincode', value: detailedAddress.pincode },
                                        { label: 'Country', value: detailedAddress.country },
                                    ].map((item) => (
                                        <div key={item.label}>
                                            <p className="text-xs font-medium text-text-secondary">{item.label}</p>
                                            <p className="mt-1 text-sm font-medium text-white">{item.value || '-'}</p>
                                        </div>
                                    ))}
                                    <div className="md:col-span-2">
                                        <p className="text-xs font-medium text-text-secondary">Full Address</p>
                                        <p className="mt-1 leading-relaxed text-white">{formattedAddress || 'No address provided.'}</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {isEditing && profile.requiresPasswordChange && (
                        <div className="space-y-4">
                            <h3 className="flex items-center gap-2 border-b border-white/10 pb-2 font-semibold text-white">
                                <KeyRound className="h-4 w-4 text-primary" />
                                Set Your Password
                            </h3>
                            <div className="rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs leading-relaxed text-warning">
                                You are currently using a temporary password. Please set a personal password below. You can only do this once — after setting it, only your company admin can reset it.
                            </div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-text-secondary">New Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(event) =>
                                            setPasswordData({ ...passwordData, newPassword: event.target.value })
                                        }
                                        className={inputClass}
                                        placeholder="Enter a new password"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-text-secondary">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(event) =>
                                            setPasswordData({ ...passwordData, confirmPassword: event.target.value })
                                        }
                                        className={inputClass}
                                        placeholder="Re-enter new password"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    {isEditing && !profile.requiresPasswordChange && (
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-text-secondary">
                            <span className="font-medium text-white">Password is locked.</span>{' '}
                            Your password has already been set. To reset it, contact your company admin — they can assign a new temporary password for you.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
