import React, { useEffect, useState } from 'react';
import { companyApi } from '../../api/companyApi';
import { motion, AnimatePresence } from 'framer-motion';
import OfficerTable from '../../components/company/OfficerTable';
import { Plus, X, Mail, User, Building2, Lock } from 'lucide-react';

const getOfficerName = ({ surname, middleName, lastName }) =>
    [surname, middleName, lastName].filter((value) => value?.trim()).join(' ');

export default function Officers() {
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [companyName, setCompanyName] = useState('');

    const [formData, setFormData] = useState({
        surname: '',
        middleName: '',
        lastName: '',
        email: '',
        password: '',
    });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const inputClass =
        'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none transition-colors focus:ring-2 focus:ring-success/50';

    const fetchOfficers = async () => {
        try {
            const res = await companyApi.getOfficers();
            setOfficers(
                Array.isArray(res.data)
                    ? res.data.map((officer) => ({
                          ...officer,
                          blocked: officer.active === false,
                          approvalState: officer.approved === false ? 'PENDING' : officer.active === false ? 'INACTIVE' : 'ACTIVE',
                      }))
                    : []
            );
        } catch (err) {
            console.error('Failed to load officers', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCompanyProfile = async () => {
        try {
            const res = await companyApi.getProfile();
            setCompanyName(res.data?.name || '');
        } catch (err) {
            console.error('Failed to load company profile', err);
        }
    };

    useEffect(() => {
        fetchOfficers();
        fetchCompanyProfile();
        const intervalId = setInterval(fetchOfficers, 15000);
        return () => clearInterval(intervalId);
    }, []);

    const handleToggleBlock = async (id, currentlyBlocked) => {
        try {
            setOfficers((prev) => prev.map((officer) => (officer.id === id ? { ...officer, blocked: !currentlyBlocked } : officer)));
            if (currentlyBlocked) {
                await companyApi.unblockOfficer(id);
            } else {
                await companyApi.blockOfficer(id);
            }
        } catch (err) {
            setOfficers((prev) => prev.map((officer) => (officer.id === id ? { ...officer, blocked: currentlyBlocked } : officer)));
            alert('Failed to change officer status');
        }
    };

    const handleCreateOfficer = async (e) => {
        e.preventDefault();
        setFormError('');
        setSubmitting(true);

        try {
            const payload = {
                name: getOfficerName(formData),
                email: formData.email,
                password: formData.password,
            };

            await companyApi.createOfficer(payload);
            await fetchOfficers();
            setIsModalOpen(false);
            setFormData({ surname: '', middleName: '', lastName: '', email: '', password: '' });
        } catch (err) {
            console.error(err);
            setFormError(err.response?.data?.message || err.response?.data || 'Failed to create officer. Verify email domain matches.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResetPassword = async (officerId, newPassword) => {
        await companyApi.resetOfficerPassword(officerId, { newPassword });
        await fetchOfficers();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
                        Placement Officers
                    </h1>
                    <p className="text-text-secondary mt-1 text-sm">Manage access for your company&apos;s recruitment delegates and track admin approval status.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-success text-background font-bold rounded-xl hover:bg-success/90 transition-colors shadow-[0_0_15px_rgba(44,230,179,0.3)]"
                >
                    <Plus className="w-5 h-5" /> Add Officer
                </button>
            </div>

            {loading && officers.length === 0 ? (
                <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-2 border-success border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : (
                <OfficerTable officers={officers} onToggleBlock={handleToggleBlock} onResetPassword={handleResetPassword} />
            )}

            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="glass-panel w-full max-w-xl p-6 relative"
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-text-secondary hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-bold mb-6">Create Placement Officer</h2>

                            <form onSubmit={handleCreateOfficer} className="space-y-4">
                                {formError && (
                                    <div className="p-3 rounded-lg border border-danger/30 bg-danger/10 text-sm text-danger">
                                        {typeof formError === 'string' ? formError : JSON.stringify(formError)}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-text-secondary">Surname</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
                                            <input
                                                required
                                                type="text"
                                                className={`${inputClass} pl-10`}
                                                value={formData.surname}
                                                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-text-secondary">Last Name</label>
                                        <input
                                            required
                                            type="text"
                                            className={inputClass}
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-text-secondary">Middle Name (Optional)</label>
                                    <input
                                        type="text"
                                        className={inputClass}
                                        value={formData.middleName}
                                        onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-text-secondary">Company</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
                                        <input
                                            type="text"
                                            readOnly
                                            className={`${inputClass} pl-10 cursor-not-allowed opacity-75`}
                                            value={companyName}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-text-secondary">Company Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
                                        <input
                                            required
                                            type="email"
                                            className={`${inputClass} pl-10`}
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-text-secondary">Temporary Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
                                        <input
                                            required
                                            type="password"
                                            className={`${inputClass} pl-10`}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-2 rounded-xl border border-white/10 hover:bg-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 py-2 rounded-xl bg-success text-background font-bold hover:bg-success/90 disabled:opacity-50"
                                    >
                                        {submitting ? 'Creating...' : 'Create Officer'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
