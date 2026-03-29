import React from 'react';
import { BriefcaseBusiness, CalendarDays, MapPin, ShieldCheck, Sparkles, Users } from 'lucide-react';

const formatEnum = (value) => (value ? value.replace(/_/g, ' ') : 'Not specified');

const splitLineItems = (value) =>
    (value || '')
        .split('\n')
        .map((item) => item.replace(/^[-*\s]+/, '').trim())
        .filter(Boolean);

const splitCommaItems = (value) =>
    (value || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

function DetailSection({ title, accentClass = 'text-primary', children }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className={`mb-3 text-xs font-semibold uppercase tracking-[0.18em] ${accentClass}`}>{title}</h3>
            {children}
        </div>
    );
}

export default function JobDetailsPanel({ job }) {
    if (!job) {
        return (
            <div className="glass-panel rounded-[28px] border border-dashed border-white/10 px-6 py-16 text-center">
                <BriefcaseBusiness className="mx-auto mb-4 h-12 w-12 text-white/20" />
                <h2 className="text-lg font-semibold text-white">Select a job to view details</h2>
                <p className="mt-2 text-sm text-text-secondary">
                    Click any job in the table above to open the full hiring brief for that role.
                </p>
            </div>
        );
    }

    const minimumQualifications = splitLineItems(job.minimumQualifications);
    const preferredQualifications = splitLineItems(job.preferredQualifications);
    const requiredSkills = splitCommaItems(job.requiredSkills);
    const preferredSkills = splitCommaItems(job.preferredSkills);
    const assignedOfficers = Array.isArray(job.assignedOfficers) ? job.assignedOfficers : [];
    const rounds = Array.isArray(job.rounds) ? job.rounds : [];

    return (
        <div className="glass-panel space-y-6 rounded-[28px] border border-white/10 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                        <Sparkles className="h-3.5 w-3.5" />
                        Job Brief
                    </div>
                    <h2 className="text-2xl font-bold text-white">{job.title}</h2>
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-secondary">
                        {job.description || 'The company has not added a detailed job summary yet.'}
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[320px]">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-text-secondary">Job Type</p>
                        <p className="mt-2 font-semibold text-white">{formatEnum(job.jobType)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-text-secondary">Work Mode</p>
                        <p className="mt-2 font-semibold text-white">{formatEnum(job.workMode)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-text-secondary">Experience</p>
                        <p className="mt-2 font-semibold text-white">{(!job.experienceRequired || job.experienceRequired === 0) ? 'Fresher' : `${job.experienceRequired}+ years`}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-xs uppercase tracking-[0.16em] text-text-secondary">Salary</p>
                        <p className="mt-2 font-semibold text-white">{job.salaryRange || 'Not shared'}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-primary">
                        <MapPin className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-[0.16em] text-text-secondary">Location</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-white">{job.location || 'Not specified'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-success">
                        <CalendarDays className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-[0.16em] text-text-secondary">Deadline</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-white">
                        {job.applicationDeadline
                            ? new Date(job.applicationDeadline).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                              })
                            : 'Open ended'}
                    </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-warning">
                        <Users className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-[0.16em] text-text-secondary">Max Applicants</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-white">{job.maxApplicants || 'No limit set'}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center gap-2 text-secondary">
                        <ShieldCheck className="h-4 w-4" />
                        <span className="text-xs uppercase tracking-[0.16em] text-text-secondary">Status</span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-white">{job.status || 'OPEN'}</p>
                </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <DetailSection title="Minimum Qualifications" accentClass="text-success">
                    {minimumQualifications.length > 0 ? (
                        <ul className="space-y-2 text-sm leading-6 text-white/75">
                            {minimumQualifications.map((item) => (
                                <li key={item} className="flex gap-2">
                                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-success" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-text-secondary">No minimum qualifications were added.</p>
                    )}
                </DetailSection>

                <DetailSection title="Preferred Qualifications" accentClass="text-secondary">
                    {preferredQualifications.length > 0 ? (
                        <ul className="space-y-2 text-sm leading-6 text-white/75">
                            {preferredQualifications.map((item) => (
                                <li key={item} className="flex gap-2">
                                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-secondary" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-text-secondary">No preferred qualifications were added.</p>
                    )}
                </DetailSection>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <DetailSection title="Required Skills" accentClass="text-primary">
                    {requiredSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {requiredSkills.map((skill) => (
                                <span
                                    key={skill}
                                    className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-text-secondary">No required skills listed.</p>
                    )}
                </DetailSection>

                <DetailSection title="Preferred Skills" accentClass="text-warning">
                    {preferredSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {preferredSkills.map((skill) => (
                                <span
                                    key={skill}
                                    className="rounded-full border border-warning/20 bg-warning/10 px-3 py-1 text-xs font-medium text-warning"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-text-secondary">No preferred skills listed.</p>
                    )}
                </DetailSection>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                <DetailSection title="Assigned Officers" accentClass="text-secondary">
                    {assignedOfficers.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {assignedOfficers.map((officer) => (
                                <div key={officer.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <p className="font-semibold text-white">{officer.name}</p>
                                    <p className="mt-1 text-xs text-text-secondary">{officer.email}</p>
                                    <p className="mt-2 text-xs text-primary">{officer.jobRole || 'Placement Officer'}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-text-secondary">
                            No officer has been assigned yet. The company can assign one or more officers while editing the job.
                        </p>
                    )}
                </DetailSection>

                <DetailSection title="Hiring Rounds" accentClass="text-success">
                    {rounds.length > 0 ? (
                        <div className="space-y-3">
                            {rounds
                                .slice()
                                .sort((first, second) => (first.roundOrder || 0) - (second.roundOrder || 0))
                                .map((round) => (
                                    <div
                                        key={`${round.roundOrder}-${round.roundName}`}
                                        className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                                    >
                                        <span className="text-sm font-medium text-white">
                                            {formatEnum(round.roundName)}
                                        </span>
                                        <span className="text-xs text-text-secondary">Round {round.roundOrder}</span>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className="text-sm text-text-secondary">No interview rounds were configured for this role yet.</p>
                    )}
                </DetailSection>
            </div>
        </div>
    );
}
