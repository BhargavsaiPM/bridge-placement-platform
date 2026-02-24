import React, { useEffect, useState } from 'react';
import { companyApi } from '../../api/companyApi';
import { motion } from 'framer-motion';
import { DownloadCloud, FileText, LayoutGrid } from 'lucide-react';

export default function SelectedStudents() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        companyApi.getSelectedStudents()
            .then(res => setStudents(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error("Failed to load selected students", err))
            .finally(() => setLoading(false));
    }, []);

    const handleExport = async (format) => {
        try {
            const apiCall = format === 'pdf' ? companyApi.exportPdf : companyApi.exportExcel;
            const response = await apiCall();

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `selected_students.${format === 'excel' ? 'xlsx' : 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert(`Failed to export ${format.toUpperCase()}`);
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
                        Selected Candidates
                    </h1>
                    <p className="text-text-secondary mt-1 text-sm">Full database of all students who accepted offers.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => handleExport('pdf')}
                        className="flex items-center gap-2 px-4 py-2 border border-white/10 bg-white/5 rounded-xl text-text-primary hover:bg-white/10 transition"
                    >
                        <FileText className="w-4 h-4 text-warning" /> Export PDF
                    </button>
                    <button
                        onClick={() => handleExport('excel')}
                        className="flex items-center gap-2 px-4 py-2 border border-white/10 bg-white/5 rounded-xl text-text-primary hover:bg-white/10 transition"
                    >
                        <LayoutGrid className="w-4 h-4 text-success" /> Export Excel
                    </button>
                </div>
            </div>

            <div className="glass-panel overflow-hidden">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="w-8 h-8 border-2 border-success border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : students.length === 0 ? (
                    <div className="text-center py-12 text-text-secondary">No selected candidates found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-white/5 text-text-secondary border-b border-white/10">
                                    <th className="p-4 font-medium">Candidate</th>
                                    <th className="p-4 font-medium">Contact</th>
                                    <th className="p-4 font-medium">Role Info</th>
                                    <th className="p-4 font-medium">Package</th>
                                    <th className="p-4 font-medium">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {students.map(s => (
                                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-bold text-text-primary">{s.name}</td>
                                        <td className="p-4 text-text-secondary">
                                            <div>{s.email}</div>
                                            <div className="text-xs">{s.mobile}</div>
                                        </td>
                                        <td className="p-4 text-text-secondary">{s.role || 'SDE'}</td>
                                        <td className="p-4 text-success font-bold">
                                            ₹{s.salary ? s.salary.toLocaleString() : '0'} LPA
                                        </td>
                                        <td className="p-4 text-text-secondary">
                                            {s.joiningDate ? new Date(s.joiningDate).toLocaleDateString() : 'Pending'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
