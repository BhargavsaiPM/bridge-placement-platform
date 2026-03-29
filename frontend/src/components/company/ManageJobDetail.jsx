import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    BriefcaseBusiness,
    CalendarDays,
    Edit2,
    Eye,
    MapPin,
    ShieldCheck,
    Sparkles,
    Users,
} from 'lucide-react';
import { companyApi } from '../../api/companyApi';
import { officerApi } from '../../api/officerApi';
import JobModal from './JobModal';

const formatEnum = (value) => (value ? value.replace(/_/g, ' ') : 'Not specified');

const splitLineItems = (value) =>
    (value || '')
        .split('\n')
        .map((item) => item.replace(/^[-*•\s]+/, '').trim())
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

export default function ManageJobDetail({ role = 'company' }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const isCompany = role === 'company';
    const isOfficer = role === 'officer';

    const [job, setJob] = useState(null);
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchJob = async () => {
        setLoading(true);
        try {
            let jobsRes;
            if (isCompany) {
                [jobsRes] = await Promise.all([companyApi.getJobs()]);
            } else {
                [jobsRes] = await Promise.all([officerApi.getJobs()]);
            }
            const jobs = Array.isArray(jobsRes.data) ? jobsRes.data : [];
            const found = jobs.find((j) => j.id === Number(id));
            if (found) {
                setJob(found);
            } else {
                setError('Job not found.');
            }

            if (isCompany) {
                const officersRes = await companyApi.getOfficers();
                setOfficers(Array.isArray(officersRes.data) ? officersRes.data : []);
            }
        } catch (err) {
            console.error('Failed to load job', err);
            setError('Failed to load job details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJob();
    }, [id]);

    const handleSaveJob = async (jobData, jobId) => {
        if (jobId) {
            const res = await companyApi.updateJob(jobId, jobData);
            if (res?.data) setJob(res.data);
        }
        setIsModalOpen(false);
    };

    const backPath = isCompany ? '/company/jobs' : '/officer/jobs';
    const applicantsPath = isCompany ? `/company/applicants?jobId=${id}` : `/officer/applicants?jobId=${id}`;

    const minimumQualifications = splitLineItems(job?.minimumQualifications);
    const preferredQualifications = splitLineItems(job?.preferredQualifications);
    const requiredSkills = splitCommaItems(job?.requiredSkills);
    const preferredSkills = splitCommaItems(job?.preferredSkills);
    const assignedOfficers = Array.isArray(job?.assignedOfficers) ? job.assignedOfficers : [];
    const rounds = Array.isArray(job?.rounds) ? job.rounds : [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Back + Actions Bar */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <button
                    onClick={() => navigate(backPath)}
                    className="group flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-white"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Jobs
                </button>

                {!loading && job && (
                    <div className="flex items-center gap-3">
                        {isCompany && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 rounded-xl border border-warning/30 bg-warning/10 px-4 py-2 text-sm font-medium text-warning transition-colors hover:bg-warning/20"
                            >
                                <Edit2 className="h-4 w-4" />
                                Edit Job
                            </button>
                        )}
                        <button
                            onClick={() => navigate(applicantsPath)}
                            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-background transition-colors hover:bg-primary/90 shadow-[0_0_12px_rgba(77,163,255,0.3)]"
                        >
                            <Eye className="h-4 w-4" />
                            View Applicants
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            ) : error ? (
                <div className="glass-panel rounded-[28px] border border-danger/30 bg-danger/10 px-6 py-16 text-center">
                    <h2 className="text-xl font-semibold text-danger">{error}</h2>
                </div>
            ) : job ? (
                <>
                    {/* Header */}
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
                                    <p className="mt-2 font-semibold text-white">
                                        {(!job.experienceRequired || job.experienceRequired === 0) ? 'Fresher' : `${job.experienceRequired}+ years`}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs uppercase tracking-[0.16em] text-text-secondary">Salary</p>
                                    <p className="mt-2 font-semibold text-white">{job.salaryRange || 'Not shared'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info Cards */}
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
                                    ? new Date(job.applicationDeadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
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

                    {/* Qualifications */}
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

                    {/* Skills */}
                    <div className="grid gap-4 xl:grid-cols-2">
                        <DetailSection title="Required Skills" accentClass="text-primary">
                            {requiredSkills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {requiredSkills.map((skill) => (
                                        <span key={skill} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
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
                                        <span key={skill} className="rounded-full border border-warning/20 bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-text-secondary">No preferred skills listed.</p>
                            )}
                        </DetailSection>
                    </div>

                    {/* Officers & Rounds */}
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
                                <p className="text-sm text-text-secondary">No officer has been assigned yet.</p>
                            )}
                        </DetailSection>

                        <DetailSection title="Hiring Rounds" accentClass="text-success">
                            {rounds.length > 0 ? (
                                <div className="space-y-3">
                                    {rounds
                                        .slice()
                                        .sort((a, b) => (a.roundOrder || 0) - (b.roundOrder || 0))
                                        .map((round) => (
                                            <div
                                                key={`${round.roundOrder}-${round.roundName}`}
                                                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                                            >
                                                <span className="text-sm font-medium text-white">{formatEnum(round.roundName)}</span>
                                                <span className="text-xs text-text-secondary">Round {round.roundOrder}</span>
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <p className="text-sm text-text-secondary">No interview rounds were configured yet.</p>
                            )}
                        </DetailSection>
                    </div>

                    {/* Applicants Quick Action */}
                    <div className="glass-panel rounded-[28px] border border-white/10 p-6">
                        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                            <div>
                                <h3 className="text-lg font-bold text-white">Candidate Pipeline</h3>
                                <p className="text-sm text-text-secondary">
                                    Review, shortlist, and manage all applicants who have applied for this role.
                                </p>
                            </div>
                            <button
                                onClick={() => navigate(applicantsPath)}
                                className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-background shadow-[0_0_20px_rgba(77,163,255,0.35)] transition-all hover:bg-primary/90"
                            >
                                <Users className="h-4 w-4" />
                                View Applicants
                            </button>
                        </div>
                    </div>
                </>
            ) : null}

            {/* Edit Modal (Company only) */}
            {isCompany && (
                <JobModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveJob}
                    jobToEdit={job}
                    officers={officers}
                />
            )}
        </motion.div>
    );
}
