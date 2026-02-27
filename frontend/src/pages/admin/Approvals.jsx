import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { Building2, Mail, Phone, MapPin, Globe, CheckCircle, XCircle, ShieldAlert, User, Briefcase, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PasswordModal from '../../components/modals/PasswordModal';

export default function Approvals() {
    const [activeTab, setActiveTab] = useState('students'); // 'students', 'professionals', 'companies'

    // Data states
    const [companies, setCompanies] = useState([]);
    const [students, setStudents] = useState([]);
    const [professionals, setProfessionals] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [actionReq, setActionReq] = useState(null); // { id, type: 'user'|'company', action: 'approve' | 'reject' | 'block' }

    const fetchAllPending = async () => {
        setLoading(true);
        setError(null);
        try {
            const [compRes, studRes, profRes] = await Promise.all([
                adminApi.getPendingCompanies(),
                adminApi.getPendingUsers('STUDENT'),
                adminApi.getPendingUsers('WORKING')
            ]);
            setCompanies(compRes.data || []);
            setStudents(studRes.data || []);
            setProfessionals(profRes.data || []);
        } catch (err) {
            console.error("Failed to load pending approvals", err);
            setError("Could not load pending approvals.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllPending();
    }, []);

    const handleActionClick = (id, type, action) => {
        setActionReq({ id, type, action });
        setModalOpen(true);
    };

    const executeAction = async () => {
        if (!actionReq) return;
        const { id, type, action } = actionReq;

        try {
            if (type === 'company') {
                if (action === 'approve') await adminApi.approveCompany(id);
                if (action === 'reject') await adminApi.rejectCompany(id);
                if (action === 'block') await adminApi.blockCompany(id);
                setCompanies(prev => prev.filter(c => c.id !== id));
            } else {
                if (action === 'approve') await adminApi.approveUser(id);
                if (action === 'reject') await adminApi.rejectUser(id);
                if (action === 'block') await adminApi.blockUser(id);

                if (activeTab === 'students') {
                    setStudents(prev => prev.filter(s => s.id !== id));
                } else {
                    setProfessionals(prev => prev.filter(p => p.id !== id));
                }
            }
        } catch (err) {
            console.error(`Failed to ${action} ${type}`, err);
        } finally {
            setModalOpen(false);
            setActionReq(null);
        }
    };

    // Helper to get the correct URL for absolute or relative paths returned by S3/FileController
    const getDocumentUrl = (path) => {
        if (!path) return '#';
        if (path.startsWith('http')) return path;
        // Adjust this depending on how FileController serves files. 
        // Assuming it's serving statically from the backend root or configured path.
        return `http://localhost:8080/files/view/${path}`;
    };

    const renderActionButtons = (id, type) => (
        <div className="grid grid-cols-3 gap-3 mt-auto pt-4">
            <button
                onClick={() => handleActionClick(id, type, 'approve')}
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-success/10 text-success hover:bg-success/20 transition-colors font-medium border border-success/20 text-sm"
            >
                <CheckCircle className="w-4 h-4" /> Approve
            </button>
            <button
                onClick={() => handleActionClick(id, type, 'reject')}
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-danger/10 text-danger hover:bg-danger/20 transition-colors font-medium border border-danger/20 text-sm"
            >
                <XCircle className="w-4 h-4" /> Reject
            </button>
            <button
                onClick={() => handleActionClick(id, type, 'block')}
                className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-text-secondary/10 text-text-secondary hover:bg-text-secondary/20 transition-colors font-medium border border-white/10 text-sm"
            >
                <ShieldAlert className="w-4 h-4" /> Block
            </button>
        </div>
    );

    if (loading && companies.length === 0 && students.length === 0 && professionals.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    const currentDataList = activeTab === 'students' ? students : activeTab === 'professionals' ? professionals : companies;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
                    Registration Approvals
                </h1>
                <p className="text-text-secondary mt-1 text-sm">Review and manage pending user and company registrations.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-px">
                <button
                    className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'students' ? 'text-primary' : 'text-text-secondary hover:text-white'}`}
                    onClick={() => setActiveTab('students')}
                >
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Student Requests
                        {students.length > 0 && (
                            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">{students.length}</span>
                        )}
                    </div>
                    {activeTab === 'students' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"></div>}
                </button>
                <button
                    className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'professionals' ? 'text-primary' : 'text-text-secondary hover:text-white'}`}
                    onClick={() => setActiveTab('professionals')}
                >
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Professional Requests
                        {professionals.length > 0 && (
                            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">{professionals.length}</span>
                        )}
                    </div>
                    {activeTab === 'professionals' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"></div>}
                </button>
                <button
                    className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'companies' ? 'text-primary' : 'text-text-secondary hover:text-white'}`}
                    onClick={() => setActiveTab('companies')}
                >
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Company Requests
                        {companies.length > 0 && (
                            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">{companies.length}</span>
                        )}
                    </div>
                    {activeTab === 'companies' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"></div>}
                </button>
            </div>

            {error && (
                <div className="glass-panel p-4 bg-danger/10 border-danger/50">
                    <p className="text-danger">{error}</p>
                </div>
            )}

            {currentDataList.length === 0 && !loading && !error && (
                <div className="glass-panel p-12 flex flex-col items-center justify-center text-center mt-6">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">All Caught Up!</h3>
                    <p className="text-text-secondary">There are no pending requests in this category.</p>
                </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
                <AnimatePresence mode='popLayout'>
                    {currentDataList.map(item => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95, height: 0 }}
                            layout
                            className="glass-panel p-6 flex flex-col h-full"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                                        {activeTab === 'companies' ? (
                                            <Building2 className="w-6 h-6 text-primary" />
                                        ) : (
                                            item.profilePhoto ? <img src={getDocumentUrl(item.profilePhoto)} alt={item.firstName} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{item.name || item.fullName || `${item.firstName} ${item.lastName}`}</h3>
                                        <span className="text-xs px-2 py-1 rounded-full bg-warning/20 text-warning font-medium uppercase mt-1 inline-block">
                                            Pending
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 space-y-3 text-sm text-text-secondary mb-6">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" /> <span>{item.email || item.domainEmail || 'N/A'}</span>
                                </div>
                                {(item.phone || item.mobile) && (
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" /> <span>{item.phone || item.mobile}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span className="truncate">
                                        {[item.city, item.district, item.state, item.country, item.pincode].filter(Boolean).join(', ') || 'Address not provided'}
                                    </span>
                                </div>

                                {/* Specific Fields based on Tab */}
                                {activeTab === 'students' && (
                                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                                        <p><strong className="text-white">College:</strong> {item.collegeName || 'N/A'}</p>
                                        <p><strong className="text-white">Roll No:</strong> {item.collegeRollNumber || 'N/A'}</p>
                                        <p><strong className="text-white">College Mail:</strong> {item.collegeMailId || 'N/A'}</p>
                                    </div>
                                )}

                                {activeTab === 'professionals' && (
                                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                                        <p><strong className="text-white">Company:</strong> {item.companyName || 'N/A'}</p>
                                        <p><strong className="text-white">Position:</strong> {item.currentPosition || 'N/A'}</p>
                                        <p><strong className="text-white">Employee ID:</strong> {item.employeeId || 'N/A'}</p>
                                        <p><strong className="text-white">Company Mail:</strong> {item.companyMailId || 'N/A'}</p>
                                    </div>
                                )}

                                {activeTab === 'companies' && (
                                    <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                                        <p><strong className="text-white">Type:</strong> {item.companyType || 'N/A'}</p>
                                        <p><strong className="text-white">Industry:</strong> {item.industrySector || 'N/A'}</p>
                                        {item.website && (
                                            <div className="flex items-center gap-2">
                                                <Globe className="w-4 h-4" />
                                                <a href={item.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                                                    {item.website}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Documents Previews */}
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <strong className="text-white block mb-2">Attached Documents:</strong>
                                    <div className="flex gap-2 flex-wrap">
                                        {activeTab === 'students' && item.studentIdCardUrl && (
                                            <a href={getDocumentUrl(item.studentIdCardUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-primary transition-colors">
                                                <FileText className="w-4 h-4" /> View ID Card
                                            </a>
                                        )}
                                        {activeTab === 'professionals' && item.employeeIdCardUrl && (
                                            <a href={getDocumentUrl(item.employeeIdCardUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-primary transition-colors">
                                                <FileText className="w-4 h-4" /> View ID Card
                                            </a>
                                        )}
                                        {activeTab === 'companies' && item.proofDocumentUrl && (
                                            <a href={getDocumentUrl(item.proofDocumentUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-primary transition-colors">
                                                <FileText className="w-4 h-4" /> View Proof Document
                                            </a>
                                        )}
                                        {activeTab !== 'companies' && item.resumeUrl && (
                                            <a href={getDocumentUrl(item.resumeUrl)} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-white transition-colors">
                                                <FileText className="w-4 h-4 text-text-secondary" /> Resume
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {renderActionButtons(item.id, activeTab === 'companies' ? 'company' : 'user')}
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
