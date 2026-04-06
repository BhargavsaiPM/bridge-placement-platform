import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, FileSpreadsheet, FileText } from 'lucide-react';

export default function Reports() {
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
                <p className="text-text-secondary mt-1 text-sm">Report exports are parked until matching backend endpoints are implemented.</p>
            </div>

            <div className="rounded-2xl border border-warning/30 bg-warning/10 p-4 text-sm text-warning flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>
                    This page now avoids broken downloads. Keep it as a roadmap card until `/admin/export/pdf` and `/admin/export/excel`
                    are added on the backend.
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-8 text-center flex flex-col items-center justify-center relative overflow-hidden group hover:border-danger/30 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-br from-danger/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mb-6 relative z-10">
                        <FileText className="w-8 h-8 text-danger" />
                    </div>

                    <h3 className="text-xl font-bold mb-2 relative z-10">Monthly Summary (PDF)</h3>
                    <p className="text-text-secondary text-sm mb-8 relative z-10">
                        A comprehensive, neatly formatted document detailing student placements, approval metrics, and platform usage.
                    </p>

                    <div className="w-full relative z-10 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm text-text-secondary">
                        Awaiting backend export endpoint
                    </div>
                </div>

                <div className="glass-panel p-8 text-center flex flex-col items-center justify-center relative overflow-hidden group hover:border-success/30 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mb-6 relative z-10">
                        <FileSpreadsheet className="w-8 h-8 text-success" />
                    </div>

                    <h3 className="text-xl font-bold mb-2 relative z-10">Raw Dataset (Excel)</h3>
                    <p className="text-text-secondary text-sm mb-8 relative z-10">
                        Full data dump of all system entities, structured for pivot tables, manual analysis, and external ingestion.
                    </p>

                    <div className="w-full relative z-10 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm text-text-secondary">
                        Awaiting backend export endpoint
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
