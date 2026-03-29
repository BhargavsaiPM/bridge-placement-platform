import React from 'react';
import { Ban, Edit2, Eye, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formatEnum = (value) => (value ? value.replace(/_/g, ' ') : '');

export default function JobTable({
    jobs,
    onCloseJob,
    onEditJob,
    applicantsBasePath = '/company/applicants',
    detailBasePath,
    canEdit = true,
    canClose = true,
    onSelectJob,
    selectedJobId,
}) {
    const navigate = useNavigate();

    return (
        <div className="glass-panel overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5 text-text-secondary">
                            <th className="p-4 font-medium">Job</th>
                            <th className="p-4 font-medium">Deadline</th>
                            <th className="p-4 text-center font-medium">Pipeline</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {jobs.map((job) => (
                            <tr
                                key={job.id}
                                onClick={() => {
                                    if (detailBasePath) {
                                        navigate(`${detailBasePath}/${job.id}`);
                                    } else if (onSelectJob) {
                                        onSelectJob(selectedJobId === job.id ? { id: null } : job);
                                    }
                                }}
                                className={`group transition-colors hover:bg-white/5 ${
                                    detailBasePath || onSelectJob ? 'cursor-pointer' : ''
                                } ${
                                    selectedJobId === job.id ? 'bg-white/[0.06]' : ''
                                }`}
                            >
                                <td className="p-4">
                                    <button
                                        type="button"
                                        onClick={() => onSelectJob?.(job)}
                                        className="text-left"
                                    >
                                        <div className="font-bold text-text-primary transition-colors hover:text-primary">
                                            {job.title}
                                        </div>
                                        {onSelectJob && (
                                            <div className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-primary/80">
                                                View details
                                            </div>
                                        )}
                                    </button>
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                                        {job.jobType && (
                                            <span className="rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-success">
                                                {formatEnum(job.jobType)}
                                            </span>
                                        )}
                                        {job.workMode && (
                                            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5">
                                                {formatEnum(job.workMode)}
                                            </span>
                                        )}
                                        {job.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {job.location}
                                            </span>
                                        )}
                                        <span>{(!job.experienceRequired || job.experienceRequired === 0) ? 'Fresher' : `${job.experienceRequired}+ yrs`}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-text-secondary">
                                    {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-4 text-xs">
                                        <span className="flex items-center gap-1 text-text-secondary" title="Applications">
                                            <Users className="h-3 w-3" /> {job.applicationsCount || 0}
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
                                    {job.blockedByAdmin ? (
                                        <div className="flex flex-col items-start gap-1">
                                            <span className="rounded-md border border-danger/30 bg-danger/20 px-2 py-1 text-xs font-bold text-danger">
                                                CLOSED BY ADMIN
                                            </span>
                                            <span className="text-[10px] text-danger/80">This application is closed by admin.</span>
                                        </div>
                                    ) : (
                                        <span
                                            className={`rounded-md px-2 py-1 text-xs font-bold ${
                                                job.status === 'CLOSED'
                                                    ? 'bg-text-secondary/20 text-text-secondary'
                                                    : 'bg-primary/20 text-primary'
                                            }`}
                                        >
                                            {job.status || 'OPEN'}
                                        </span>
                                    )}
                                </td>
                                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => navigate(`${applicantsBasePath}?jobId=${job.id}`)}
                                            className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-white/10 hover:text-primary"
                                            title="View Applicants"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        {canEdit && !job.blockedByAdmin && (
                                            <button
                                                onClick={() => onEditJob(job)}
                                                className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-white/10 hover:text-warning"
                                                title="Edit Job"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                        )}
                                        {canClose && job.status !== 'CLOSED' && !job.blockedByAdmin && (
                                            <button
                                                onClick={() => onCloseJob(job.id)}
                                                className="rounded-md p-1.5 text-text-secondary transition-colors hover:bg-white/10 hover:text-danger"
                                                title="Close Job"
                                            >
                                                <Ban className="h-4 w-4" />
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
