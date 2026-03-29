import React, { useState } from 'react';
import { Lock, Unlock, AlertCircle, KeyRound } from 'lucide-react';

export default function OfficerTable({ officers, onToggleBlock, onResetPassword }) {
    const [resetOfficerId, setResetOfficerId] = useState(null);
    const [tempPassword, setTempPassword] = useState('');
    const [resetting, setResetting] = useState(false);

    const handleResetSubmit = async () => {
        if (!tempPassword.trim() || tempPassword.length < 6) {
            alert('Password must be at least 6 characters.');
            return;
        }
        setResetting(true);
        try {
            await onResetPassword(resetOfficerId, tempPassword);
            setResetOfficerId(null);
            setTempPassword('');
        } catch {
            alert('Failed to reset password.');
        } finally {
            setResetting(false);
        }
    };

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
        <>
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
                            {officers.map(officer => {
                                const loginTime = officer.lastLogin || officer.lastSeen;
                                const isPending = officer.approved === false;
                                const isBlocked = officer.blocked;
                                const badgeClass = isPending
                                    ? 'bg-warning/20 text-warning'
                                    : isBlocked
                                        ? 'bg-danger/20 text-danger'
                                        : 'bg-success/20 text-success';
                                const badgeLabel = isPending ? 'PENDING APPROVAL' : isBlocked ? 'INACTIVE' : 'ACTIVE';

                                return (
                                    <tr key={officer.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div className="font-bold text-text-primary">{officer.name}</div>
                                            <div className="text-xs text-text-secondary mt-1">{officer.email}</div>
                                            {officer.requiresPasswordChange && (
                                                <span className="mt-1 inline-block rounded-full border border-warning/20 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning">
                                                    Temp Password
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${badgeClass}`}>
                                                {badgeLabel}
                                            </span>
                                        </td>
                                        <td className="p-4 text-text-secondary">
                                            {isPending ? 'Awaiting approval' : loginTime ? new Date(loginTime).toLocaleString('en-IN') : 'Never'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => onToggleBlock(officer.id, officer.blocked)}
                                                    disabled={isPending}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${officer.blocked
                                                            ? 'border-success/30 text-success hover:bg-success/10'
                                                            : 'border-danger/30 text-danger hover:bg-danger/10'
                                                        } ${isPending ? 'cursor-not-allowed opacity-50 hover:bg-transparent' : ''}`}
                                                >
                                                    {officer.blocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                                    {officer.blocked ? 'Activate' : 'Deactivate'}
                                                </button>
                                                {onResetPassword && !isPending && (
                                                    <button
                                                        onClick={() => { setResetOfficerId(officer.id); setTempPassword(''); }}
                                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-warning/30 text-warning hover:bg-warning/10 transition-colors"
                                                        title="Reset officer's password with a new temporary password"
                                                    >
                                                        <KeyRound className="w-4 h-4" />
                                                        Reset Password
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reset Password Modal */}
            {resetOfficerId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                    <div className="glass-panel w-full max-w-md p-6 space-y-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <KeyRound className="h-5 w-5 text-warning" />
                            Reset Officer Password
                        </h3>
                        <p className="text-sm text-text-secondary">
                            Set a new temporary password for <span className="font-medium text-white">{officers.find(o => o.id === resetOfficerId)?.name}</span>.
                            They will be required to change it on their next login.
                        </p>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-text-secondary">New Temporary Password</label>
                            <input
                                type="password"
                                value={tempPassword}
                                onChange={(e) => setTempPassword(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none transition-colors focus:ring-2 focus:ring-warning/50"
                                placeholder="Min 6 characters"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => { setResetOfficerId(null); setTempPassword(''); }}
                                className="flex-1 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResetSubmit}
                                disabled={resetting || tempPassword.length < 6}
                                className="flex-1 py-2 rounded-xl bg-warning text-background font-bold hover:bg-warning/90 disabled:opacity-50 transition-colors"
                            >
                                {resetting ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
