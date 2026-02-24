import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, DollarSign } from 'lucide-react';

const COLUMNS = [
    { id: 'APPLIED', title: 'Applied', color: 'bg-white/5' },
    { id: 'SHORTLISTED', title: 'Shortlisted', color: 'bg-warning/20 text-warning' },
    { id: 'INTERVIEW', title: 'Interview', color: 'bg-primary/20 text-primary' },
    { id: 'SELECTED', title: 'Selected', color: 'bg-success/20 text-success' },
    { id: 'REJECTED', title: 'Rejected', color: 'bg-danger/20 text-danger' }
];

export default function ApplicantKanban({ applications, onUpdateStatus }) {
    const [draggedApp, setDraggedApp] = useState(null);
    const [salaryDialogApp, setSalaryDialogApp] = useState(null);
    const [salaryInput, setSalaryInput] = useState('');

    const getAppsByStatus = (status) => {
        return applications.filter(app => (app.status || 'APPLIED').toUpperCase() === status);
    };

    const handleDragStart = (app) => {
        setDraggedApp(app);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (statusId) => {
        if (!draggedApp) return;

        // If dropping into SELECTED, open salary dialog instead of immediate update
        if (statusId === 'SELECTED' && draggedApp.status !== 'SELECTED') {
            setSalaryDialogApp({ ...draggedApp, targetStatus: statusId });
        } else if (draggedApp.status !== statusId) {
            onUpdateStatus(draggedApp.id, { status: statusId });
        }

        setDraggedApp(null);
    };

    const handleSalarySubmit = (e) => {
        e.preventDefault();
        if (salaryDialogApp) {
            onUpdateStatus(salaryDialogApp.id, {
                status: salaryDialogApp.targetStatus,
                packageOffered: parseFloat(salaryInput)
            });
            setSalaryDialogApp(null);
            setSalaryInput('');
        }
    };

    return (
        <>
            <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-250px)]">
                {COLUMNS.map(col => (
                    <div
                        key={col.id}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(col.id)}
                        className="flex-shrink-0 w-80 flex flex-col glass-panel bg-white/5"
                    >
                        <div className={`p-4 border-b border-white/10 font-bold flex justify-between items-center ${col.color.includes('bg-') && !col.color.includes('white/5') ? col.color : 'text-text-primary'}`}>
                            <span>{col.title}</span>
                            <span className="bg-background/50 px-2 py-0.5 rounded-full text-xs">
                                {getAppsByStatus(col.id).length}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            <AnimatePresence>
                                {getAppsByStatus(col.id).map(app => (
                                    <motion.div
                                        key={app.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        draggable
                                        onDragStart={() => handleDragStart(app)}
                                        className="p-4 rounded-xl bg-surface border border-white/10 shadow-lg cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
                                    >
                                        <div className="font-bold text-text-primary mb-1">
                                            {app.studentName}
                                        </div>

                                        <div className="space-y-1 text-xs text-text-secondary">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-3 h-3" />
                                                <span className="truncate">{app.studentEmail}</span>
                                            </div>
                                            {app.studentMobile && (
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-3 h-3" />
                                                    <span>{app.studentMobile}</span>
                                                </div>
                                            )}

                                            {app.packageOffered && col.id === 'SELECTED' && (
                                                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10 text-success font-medium">
                                                    <DollarSign className="w-3 h-3" />
                                                    <span>₹{(app.packageOffered).toLocaleString()} LPA</span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                ))}
            </div>

            {/* Salary Input Dialog for Selected Status */}
            <AnimatePresence>
                {salaryDialogApp && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
                    >
                        <div className="glass-panel w-full max-w-sm p-6 relative">
                            <h2 className="text-xl font-bold mb-4">Offer Details</h2>
                            <p className="text-sm text-text-secondary mb-4">
                                Enter the salary package offered to <span className="text-white font-medium">{salaryDialogApp.studentName}</span>.
                            </p>

                            <form onSubmit={handleSalarySubmit}>
                                <div className="relative mb-6">
                                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-text-secondary" />
                                    <input
                                        required
                                        type="number"
                                        step="0.1"
                                        placeholder="Package (LPA)"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-success/50"
                                        value={salaryInput}
                                        onChange={e => setSalaryInput(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSalaryDialogApp(null)}
                                        className="flex-1 py-2 rounded-xl border border-white/10 hover:bg-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 rounded-xl bg-success text-background font-bold hover:bg-success/90"
                                    >
                                        Confirm Selection
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
