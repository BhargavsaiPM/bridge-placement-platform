import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { motion } from 'framer-motion';
import { Activity as ActivityIcon, UserCheck, LogIn, Server, Trash2 } from 'lucide-react';

export default function Activity() {
    const [activeUsers, setActiveUsers] = useState([]);
    const [loginLogs, setLoginLogs] = useState([]);
    const [serverLoad, setServerLoad] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            adminApi.getActiveUsers().catch(() => ({ data: [] })),
            adminApi.getLoginLogs().catch(() => ({ data: [] })),
            adminApi.getServerLoad().catch(() => ({ data: {} }))
        ]).then(([users, logs, load]) => {
            setActiveUsers(Array.isArray(users.data) ? users.data : []);
            setLoginLogs(Array.isArray(logs.data) ? logs.data : []);
            setServerLoad(load.data || {});
            setLoading(false);
        });
    }, []);

    const handleDeleteUser = async (id, type) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
        try {
            if (type === 'user') await adminApi.deleteUser(id);
            if (type === 'company') await adminApi.deleteCompany(id);
            if (type === 'officer') await adminApi.deleteOfficer(id);

            // Update UI optimistically
            setActiveUsers(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            console.error(`Failed to delete ${type}`, err);
        }
    };

    if (loading) {
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
                    System Activity
                </h1>
                <p className="text-text-secondary mt-1 text-sm">Monitor live active users and server health.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Server Load */}
                <div className="glass-panel p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 relative z-10 text-primary">
                        <Server className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold">Server Load</h3>
                    <div className="text-4xl font-black mt-2 tracking-tighter">
                        {serverLoad.cpuUsage || '12'}%
                    </div>
                    <span className="text-text-secondary text-sm mt-2">CPU Usage</span>

                    <div className="w-full bg-white/10 rounded-full h-2 mt-6">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${serverLoad.cpuUsage || 12}%` }}
                        ></div>
                    </div>
                </div>

                {/* Active Users Table */}
                <div className="glass-panel p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-success" /> Active Users
                        </h3>
                        <span className="px-3 py-1 bg-success/10 text-success text-xs font-bold rounded-full">
                            {activeUsers.length} ONLINE
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-text-secondary">
                                    <th className="pb-3 font-medium">Name</th>
                                    <th className="pb-3 font-medium">Role</th>
                                    <th className="pb-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {activeUsers.length > 0 ? activeUsers.map(user => (
                                    <tr key={user.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="py-3 px-2 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                                {user.name ? user.name.charAt(0) : 'U'}
                                            </div>
                                            {user.name || user.email}
                                        </td>
                                        <td className="py-3 px-2">
                                            <span className="text-xs bg-white/10 px-2 py-1 rounded-md">{user.role || 'USER'}</span>
                                        </td>
                                        <td className="py-3 px-2 text-right">
                                            <button
                                                onClick={() => handleDeleteUser(user.id, user.role?.toLowerCase() || 'user')}
                                                className="p-2 hover:bg-danger/20 rounded-lg text-text-secondary hover:text-danger transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="3" className="py-8 text-center text-text-secondary">No active users found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Login Logs */}
                <div className="glass-panel p-6 lg:col-span-3">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <LogIn className="w-5 h-5 text-secondary" /> Recent Login Logs
                    </h3>
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {loginLogs.length > 0 ? loginLogs.map((log, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                                <div>
                                    <div className="font-medium text-sm">{log.email || 'Unknown User'}</div>
                                    <div className="text-xs text-text-secondary flex items-center gap-2 mt-1">
                                        <span>IP: {log.ipAddress || '127.0.0.1'}</span>
                                        <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                        <span>{log.status || 'SUCCESS'}</span>
                                    </div>
                                </div>
                                <div className="text-xs text-text-secondary">
                                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'Just now'}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-text-secondary text-sm">No recent login logs available.</div>
                        )}
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
