import React, { useEffect, useState } from 'react';
import { companyApi } from '../../api/companyApi';
import { motion, AnimatePresence } from 'framer-motion';
import OfficerTable from '../../components/company/OfficerTable';
import { Plus, X, Mail, User } from 'lucide-react';

export default function Officers() {
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchOfficers = async () => {
        try {
            const res = await companyApi.getOfficers();
            setOfficers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Failed to load officers", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOfficers();
        const intervalId = setInterval(fetchOfficers, 15000);
        return () => clearInterval(intervalId);
    }, []);

    const handleToggleBlock = async (id, currentlyBlocked) => {
        try {
            // Optimistic Update
            setOfficers(prev => prev.map(o => o.id === id ? { ...o, blocked: !currentlyBlocked } : o));
            if (currentlyBlocked) {
                await companyApi.unblockOfficer(id);
            } else {
                await companyApi.blockOfficer(id);
            }
        } catch (err) {
            // Revert optimism
            setOfficers(prev => prev.map(o => o.id === id ? { ...o, blocked: currentlyBlocked } : o));
            alert("Failed to change officer status");
        }
    };

    const handleCreateOfficer = async (e) => {
        e.preventDefault();
        setFormError('');
        setSubmitting(true);

        try {
            // Example rudimentary check - normally domain is fetched from jwt or profile context
            // Allowing to fail server-side if domain logic is purely backend bound

            const res = await companyApi.createOfficer(formData);

            // Assume success object returned
            setOfficers(prev => [...prev, res.data.officer || res.data]);
            setIsModalOpen(false);
            setFormData({ name: '', email: '', password: '' });
        } catch (err) {
            console.error(err);
            setFormError(err.response?.data?.message || err.response?.data || "Failed to create officer. Verify email domain matches.");
        } finally {
            setSubmitting(false);
        }
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
                    <p className="text-text-secondary mt-1 text-sm">Manage access for your company's recruitment delegates.</p>
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
                <OfficerTable officers={officers} onToggleBlock={handleToggleBlock} />
            )}

            {/* Add Officer Modal */}
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
                            className="glass-panel w-full max-w-md p-6 relative"
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
                                    <div className="p-3 bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg">
                                        {typeof formError === 'string' ? formError : JSON.stringify(formError)}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
                                        <input
                                            required
                                            type="text"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-success/50"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Company Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
                                        <input
                                            required
                                            type="email"
                                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-success/50"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Temporary Password</label>
                                    <input
                                        required
                                        type="password"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-success/50"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
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
