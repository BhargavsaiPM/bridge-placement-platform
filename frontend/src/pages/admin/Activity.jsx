import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Building2, Briefcase, Trash2, ShieldAlert, CheckCircle, Search, ShieldX } from 'lucide-react';
import PasswordModal from '../../components/modals/PasswordModal';

export default function Activity() {
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get('tab') || 'users';
    
    // Validate Tab Param to prevent invalid states
    const validTabs = ['users', 'companies', 'jobs'];
    const [activeTab, setActiveTab] = useState(validTabs.includes(tabParam) ? tabParam : 'users');
    
    const [searchTerm, setSearchTerm] = useState('');

    // Lists Data
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [jobs, setJobs] = useState([]);

    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [actionReq, setActionReq] = useState(null);

    useEffect(() => {
        // Sync activeTab if URL param changes
        if (validTabs.includes(tabParam)) setActiveTab(tabParam);
    }, [tabParam]);

    useEffect(() => {
        Promise.all([
            adminApi.getAllUsers().catch(() => ({ data: [] })),
            adminApi.getAllCompanies().catch(() => ({ data: [] })),
            adminApi.getAllJobs().catch(() => ({ data: [] }))
        ]).then(([usersRes, companiesRes, jobsRes]) => {
            setUsers(usersRes.data || []);
            setCompanies(companiesRes.data || []);
            setJobs(jobsRes.data || []);
            setLoading(false);
        });
    }, []);

    const handleActionClick = (id, type, action) => {
        setActionReq({ id, type, action });
        setModalOpen(true);
    };

    const executeAction = async () => {
        if (!actionReq) return;
        const { id, type, action } = actionReq;

        try {
            if (type === 'user') {
                if (action === 'block') await adminApi.blockUser(id);
                if (action === 'unblock') await adminApi.approveUser(id);
                if (action === 'delete') await adminApi.deleteUser(id);
                
                if (action === 'delete') setUsers(prev => prev.filter(u => u.id !== id));
                else setUsers(prev => prev.map(u => u.id === id ? { ...u, blocked: action === 'block' } : u));
            } else if (type === 'company') {
                if (action === 'block') await adminApi.blockCompany(id);
                if (action === 'unblock') await adminApi.approveCompany(id);
                if (action === 'delete') await adminApi.deleteCompany(id);

                if (action === 'delete') setCompanies(prev => prev.filter(c => c.id !== id));
                else setCompanies(prev => prev.map(c => c.id === id ? { ...c, blocked: action === 'block', approved: action === 'unblock' } : c));
            } else if (type === 'job') {
                if (action === 'block') await adminApi.blockJob(id);
                if (action === 'unblock') await adminApi.unblockJob(id);
                if (action === 'delete') await adminApi.deleteJob(id);

                if (action === 'delete') setJobs(prev => prev.filter(j => j.id !== id));
                else setJobs(prev => prev.map(j => j.id === id ? { ...j, blockedByAdmin: action === 'block', status: action === 'block' ? 'CLOSED' : 'OPEN' } : j));
            }
        } catch (err) {
            console.error(`Failed to ${action} ${type}`, err);
        } finally {
            setModalOpen(false);
            setActionReq(null);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    const renderActionButtons = (item, type) => {
        const isBlocked = type === 'job' ? item.blockedByAdmin : item.blocked;
        return (
            <div className="flex items-center gap-2">
                {isBlocked ? (
                    <button onClick={() => handleActionClick(item.id, type, 'unblock')} className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors text-xs font-medium border border-success/20 w-24">
                        <CheckCircle className="w-3.5 h-3.5" /> Unblock
                    </button>
                ) : (
                    <button onClick={() => handleActionClick(item.id, type, 'block')} className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/10 text-warning hover:bg-warning/20 transition-colors text-xs font-medium border border-warning/20 w-24">
                        <ShieldAlert className="w-3.5 h-3.5" /> Block
                    </button>
                )}
                <button onClick={() => handleActionClick(item.id, type, 'delete')} className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition-colors text-xs font-medium border border-danger/20 w-24">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
            </div>
        );
    };

    // Filter helpers
    const filterData = (data, keys) => {
        if (!searchTerm) return data;
        const lowerTerm = searchTerm.toLowerCase();
        return data.filter(item => 
            keys.some(key => {
                const val = typeof key === 'function' ? key(item) : item[key];
                return val && val.toString().toLowerCase().includes(lowerTerm);
            })
        );
    };

    const filteredUsers = filterData(users, ['firstName', 'lastName', 'email', 'roleType']);
    const filteredCompanies = filterData(companies, ['name', 'domainEmail', 'industrySector']);
    const filteredJobs = filterData(jobs, ['title', 'location', j => j.company?.name]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
                    Platform Management
                </h1>
                <p className="text-text-secondary mt-1 text-sm">Manage users, companies, and job postings.</p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-px overflow-x-auto no-scrollbar">
                <button
                    className={`pb-4 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'users' ? 'text-primary' : 'text-text-secondary hover:text-white'}`}
                    onClick={() => setActiveTab('users')}
                >
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" /> Users Management
                        <span className="bg-white/10 text-text-secondary px-2 py-0.5 rounded-full text-xs">{users.length}</span>
                    </div>
                    {activeTab === 'users' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"></div>}
                </button>
                <button
                    className={`pb-4 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'companies' ? 'text-primary' : 'text-text-secondary hover:text-white'}`}
                    onClick={() => setActiveTab('companies')}
                >
                    <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" /> Companies Management
                        <span className="bg-white/10 text-text-secondary px-2 py-0.5 rounded-full text-xs">{companies.length}</span>
                    </div>
                    {activeTab === 'companies' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"></div>}
                </button>
                <button
                    className={`pb-4 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeTab === 'jobs' ? 'text-primary' : 'text-text-secondary hover:text-white'}`}
                    onClick={() => setActiveTab('jobs')}
                >
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" /> Job Postings
                        <span className="bg-white/10 text-text-secondary px-2 py-0.5 rounded-full text-xs">{jobs.length}</span>
                    </div>
                    {activeTab === 'jobs' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"></div>}
                </button>
            </div>

            {/* Content Area */}
            <div className="mt-6">
                <AnimatePresence mode="wait">
                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <div className="relative w-72">
                                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                                    <input 
                                        type="text" 
                                        placeholder="Search users..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="glass-panel overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-text-secondary">
                                                <th className="p-4 font-medium">Name</th>
                                                <th className="p-4 font-medium">Email</th>
                                                <th className="p-4 font-medium">Role</th>
                                                <th className="p-4 font-medium">Status</th>
                                                <th className="p-4 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-sm">
                                            {filteredUsers.map(u => (
                                                <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-4 font-medium">{u.firstName} {u.lastName}</td>
                                                    <td className="p-4 text-text-secondary">{u.email}</td>
                                                    <td className="p-4"><span className="px-2 py-1 rounded-full bg-white/10 text-xs">{u.roleType}</span></td>
                                                    <td className="p-4">
                                                        {u.blocked ? <span className="text-danger flex items-center gap-1.5"><ShieldX className="w-3.5 h-3.5"/> Blocked</span> 
                                                        : !u.approved ? <span className="text-warning">Pending</span>
                                                        : <span className="text-success flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5"/> Active</span>}
                                                    </td>
                                                    <td className="p-4 flex justify-end">
                                                        {renderActionButtons(u, 'user')}
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredUsers.length === 0 && (
                                                <tr><td colSpan={5} className="p-8 text-center text-text-secondary">No users found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* COMPANIES TAB */}
                    {activeTab === 'companies' && (
                        <motion.div key="companies" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <div className="relative w-72">
                                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                                    <input 
                                        type="text" 
                                        placeholder="Search companies..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="glass-panel overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-text-secondary">
                                                <th className="p-4 font-medium">Company Name</th>
                                                <th className="p-4 font-medium">Domain Email</th>
                                                <th className="p-4 font-medium">Industry</th>
                                                <th className="p-4 font-medium">Status</th>
                                                <th className="p-4 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-sm">
                                            {filteredCompanies.map(c => (
                                                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-4 font-medium flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><Building2 className="w-4 h-4"/></div>
                                                        {c.name}
                                                    </td>
                                                    <td className="p-4 text-text-secondary">{c.domainEmail}</td>
                                                    <td className="p-4 text-text-secondary">{c.industrySector || 'N/A'}</td>
                                                    <td className="p-4">
                                                        {c.blocked ? <span className="text-danger flex items-center gap-1.5"><ShieldX className="w-3.5 h-3.5"/> Blocked</span> 
                                                        : !c.approved ? <span className="text-warning">Pending</span>
                                                        : <span className="text-success flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5"/> Active</span>}
                                                    </td>
                                                    <td className="p-4 flex justify-end">
                                                        {renderActionButtons(c, 'company')}
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredCompanies.length === 0 && (
                                                <tr><td colSpan={5} className="p-8 text-center text-text-secondary">No companies found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* JOBS TAB */}
                    {activeTab === 'jobs' && (
                        <motion.div key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-4">
                            <div className="flex justify-between items-center mb-6">
                                <div className="relative w-72">
                                    <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
                                    <input 
                                        type="text" 
                                        placeholder="Search jobs..." 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary/50 text-sm"
                                    />
                                </div>
                            </div>
                            <div className="glass-panel overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-text-secondary">
                                                <th className="p-4 font-medium">Job Title</th>
                                                <th className="p-4 font-medium">Company</th>
                                                <th className="p-4 font-medium">Location</th>
                                                <th className="p-4 font-medium">Status</th>
                                                <th className="p-4 font-medium text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5 text-sm">
                                            {filteredJobs.map(j => (
                                                <tr key={j.id} className="hover:bg-white/5 transition-colors">
                                                    <td className="p-4 font-medium">{j.title}</td>
                                                    <td className="p-4 text-text-secondary">{j.company?.name || 'N/A'}</td>
                                                    <td className="p-4 text-text-secondary">{j.location}</td>
                                                    <td className="p-4">
                                                        {j.blockedByAdmin ? <span className="text-danger flex items-center gap-1.5"><ShieldX className="w-3.5 h-3.5"/> Blocked (Closed)</span> 
                                                        : j.status === 'OPEN' ? <span className="text-success flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5"/> Open</span>
                                                        : <span className="text-warning">{j.status}</span>}
                                                    </td>
                                                    <td className="p-4 flex justify-end">
                                                        {renderActionButtons(j, 'job')}
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredJobs.length === 0 && (
                                                <tr><td colSpan={5} className="p-8 text-center text-text-secondary">No job postings found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}
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
