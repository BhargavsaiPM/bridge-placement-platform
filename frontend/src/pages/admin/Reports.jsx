import React, { useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { motion } from 'framer-motion';
import { FileText, Download, FileSpreadsheet } from 'lucide-react';

export default function Reports() {
    const [loadingType, setLoadingType] = useState(null); // 'pdf' | 'excel' | null

    const handleDownload = async (type) => {
        setLoadingType(type);
        try {
            const response = type === 'pdf' ? await adminApi.exportPdf() : await adminApi.exportExcel();

            // Create a blob and trigger download
            const blob = new Blob([response.data], {
                type: type === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bridge-report-${new Date().toISOString().split('T')[0]}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error(`Failed to download ${type}`, err);
            alert(`Error downloading ${type} report. Assuming endpoint is unavailable.`);
        } finally {
            setLoadingType(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 max-w-4xl"
        >
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
                    System Reports
                </h1>
                <p className="text-text-secondary mt-1 text-sm">Generate and export comprehensive data reports.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* PDF Export */}
                <div className="glass-panel p-8 text-center flex flex-col items-center justify-center relative overflow-hidden group hover:border-danger/30 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-br from-danger/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mb-6 relative z-10">
                        <FileText className="w-8 h-8 text-danger" />
                    </div>

                    <h3 className="text-xl font-bold mb-2 relative z-10">Monthly Summary (PDF)</h3>
                    <p className="text-text-secondary text-sm mb-8 relative z-10">
                        A comprehensive, neatly formatted document detailing student placements, approval metrics, and platform usage.
                    </p>

                    <button
                        onClick={() => handleDownload('pdf')}
                        disabled={loadingType !== null}
                        className="w-full relative z-10 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-danger text-white font-bold hover:bg-danger/90 transition-colors disabled:opacity-50"
                    >
                        {loadingType === 'pdf' ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Download className="w-5 h-5" /> Download PDF
                            </>
                        )}
                    </button>
                </div>

                {/* Excel Export */}
                <div className="glass-panel p-8 text-center flex flex-col items-center justify-center relative overflow-hidden group hover:border-success/30 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mb-6 relative z-10">
                        <FileSpreadsheet className="w-8 h-8 text-success" />
                    </div>

                    <h3 className="text-xl font-bold mb-2 relative z-10">Raw Dataset (Excel)</h3>
                    <p className="text-text-secondary text-sm mb-8 relative z-10">
                        Full data dump of all system entities, structured for pivot tables, manual analysis, and external ingestion.
                    </p>

                    <button
                        onClick={() => handleDownload('excel')}
                        disabled={loadingType !== null}
                        className="w-full relative z-10 flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-success text-white font-bold hover:bg-success/90 transition-colors disabled:opacity-50"
                    >
                        {loadingType === 'excel' ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Download className="w-5 h-5" /> Download Excel
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
