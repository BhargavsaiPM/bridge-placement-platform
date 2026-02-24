import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { Building2, Mail, Phone, MapPin, Globe, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PasswordModal from '../../components/modals/PasswordModal';

export default function Approvals() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [actionReq, setActionReq] = useState(null); // { id, action: 'approve' | 'reject' | 'block' }

    const fetchCompanies = () => {
        setLoading(true);
        adminApi.getPendingCompanies()
            .then(res => setCompanies(res.data || []))
            .catch(err => {
                console.error("Failed to load pending companies", err);
                setError("Could not load pending companies.");
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const handleActionClick = (id, action) => {
        setActionReq({ id, action });
        setModalOpen(true);
    };

    const executeAction = async () => {
        if (!actionReq) return;
        const { id, action } = actionReq;

        try {
            if (action === 'approve') await adminApi.approveCompany(id);
            if (action === 'reject') await adminApi.rejectCompany(id);
            if (action === 'block') await adminApi.blockCompany(id);

            // Remove from list or refetch
            setCompanies(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            console.error(`Failed to ${action} company`, err);
        } finally {
            setModalOpen(false);
            setActionReq(null);
        }
    };

    if (loading && companies.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
                    Company Approvals
                </h1>
                <p className="text-text-secondary mt-1 text-sm">Review and manage pending company registrations.</p>
            </div>

            {error && (
                <div className="glass-panel p-4 bg-danger/10 border-danger/50">
                    <p className="text-danger">{error}</p>
                </div>
            )}

            {companies.length === 0 && !loading && !error && (
                <div className="glass-panel p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">All Caught Up!</h3>
                    <p className="text-text-secondary">There are no pending company approvals at this time.</p>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <AnimatePresence>
                    {companies.map(company => (
                        <motion.div
                            key={company.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, height: 0 }}
                            layout
                            className="glass-panel p-6 flex flex-col h-full"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                                        <Building2 className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{company.name}</h3>
                                        <span className="text-xs px-2 py-1 rounded-full bg-warning/20 text-warning font-medium uppercase mt-1 inline-block">
                                            Pending
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-3 text-sm text-text-secondary mb-6">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> <span>{company.email || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" /> <span>{company.phone || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span className="truncate">
                                        {[company.city, company.state, company.country].filter(Boolean).join(', ') || 'Address not provided'}
                                    </span>
                                </div>
                                {company.website && (
                                    <div className="flex items-center gap-2">
                                        <Globe className="w-4 h-4" />
                                        <a href={company.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                            {company.website}
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-3 mt-auto">
                                <button
                                    onClick={() => handleActionClick(company.id, 'approve')}
                                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-success/10 text-success hover:bg-success/20 transition-colors font-medium border border-success/20"
                                >
                                    <CheckCircle className="w-4 h-4" /> Approve
                                </button>
                                <button
                                    onClick={() => handleActionClick(company.id, 'reject')}
                                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 transition-colors font-medium border border-danger/20"
                                >
                                    <XCircle className="w-4 h-4" /> Reject
                                </button>
                                <button
                                    onClick={() => handleActionClick(company.id, 'block')}
                                    className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-text-secondary/10 text-text-secondary hover:bg-text-secondary/20 transition-colors font-medium border border-white/10"
                                >
                                    <ShieldAlert className="w-4 h-4" /> Block
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <PasswordModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={executeAction}
                actionLabel={actionReq ? actionReq.action : ''}
            />
        </motion.div>
    );
}
