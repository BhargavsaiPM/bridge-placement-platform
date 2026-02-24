import React from 'react';
import { Lock, Unlock, AlertCircle } from 'lucide-react';

export default function OfficerTable({ officers, onToggleBlock }) {
    if (officers.length === 0) {
        return (
            <div className="glass-panel p-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-text-secondary">
                    <AlertCircle className="w-8 h-8" />
                </div>
                <p className="text-text-secondary">No placement officers found.</p>
            </div>
        );
    }

    return (
        <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-white/5 text-text-secondary border-b border-white/10">
                            <th className="p-4 font-medium">Officer</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium">Last Login</th>
                            <th className="p-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {officers.map(officer => (
                            <tr key={officer.id} className="group hover:bg-white/5 transition-colors">
                                <td className="p-4">
                                    <div className="font-bold text-text-primary">{officer.name}</div>
                                    <div className="text-xs text-text-secondary mt-1">{officer.email}</div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${officer.blocked
                                            ? 'bg-danger/20 text-danger'
                                            : 'bg-success/20 text-success'
                                        }`}>
                                        {officer.blocked ? 'BLOCKED' : 'ACTIVE'}
                                    </span>
                                </td>
                                <td className="p-4 text-text-secondary">
                                    {officer.lastLogin ? new Date(officer.lastLogin).toLocaleString() : 'Never'}
                                </td>
                                <td className="p-4">
                                    <button
                                        onClick={() => onToggleBlock(officer.id, officer.blocked)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${officer.blocked
                                                ? 'border-success/30 text-success hover:bg-success/10'
                                                : 'border-danger/30 text-danger hover:bg-danger/10'
                                            }`}
                                    >
                                        {officer.blocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                        {officer.blocked ? 'Unblock' : 'Block'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
