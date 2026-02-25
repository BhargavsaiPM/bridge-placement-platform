import React from 'react';
import { Edit2, Ban, Eye, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function JobTable({ jobs, onCloseJob, onEditJob }) {
    const navigate = useNavigate();

    return (
        <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-white/5 text-text-secondary border-b border-white/10">
                            <th className="p-4 font-medium">Job Title</th>
                            <th className="p-4 font-medium">Deadline</th>
                            <th className="p-4 font-medium text-center">Pipeline</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {jobs.map(job => (
                            <tr key={job.id} className="group hover:bg-white/5 transition-colors">
                                <td className="p-4 font-bold text-text-primary">
                                    {job.title}
                                </td>
                                <td className="p-4 text-text-secondary">
                                    {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-4 text-xs">
                                        <span className="flex items-center gap-1 text-text-secondary" title="Applications">
                                            <Users className="w-3 h-3" /> {job.applicationsCount || 0}
                                        </span>
                                        <span className="text-warning" title="Shortlisted">
                                            {job.shortlistedCount || 0}
                                        </span>
                                        <span className="text-success" title="Hired">
                                            {job.hiredCount || 0}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${job.status === 'CLOSED'
                                        ? 'bg-danger/20 text-danger'
                                        : 'bg-primary/20 text-primary'
                                        }`}>
                                        {job.status || 'OPEN'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => navigate(`/company/applicants?jobId=${job.id}`)}
                                            className="p-1.5 text-text-secondary hover:text-primary transition-colors hover:bg-white/10 rounded-md"
                                            title="View Applicants"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onEditJob(job)}
                                            className="p-1.5 text-text-secondary hover:text-warning transition-colors hover:bg-white/10 rounded-md"
                                            title="Edit Job"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        {job.status !== 'CLOSED' && (
                                            <button
                                                onClick={() => onCloseJob(job.id)}
                                                className="p-1.5 text-text-secondary hover:text-danger transition-colors hover:bg-white/10 rounded-md"
                                                title="Close Job"
                                            >
                                                <Ban className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
