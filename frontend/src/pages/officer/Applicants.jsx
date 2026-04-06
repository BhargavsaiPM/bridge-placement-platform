import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowRight,
    Briefcase,
    CalendarClock,
    FileText,
    Filter,
    Layers3,
    Mail,
    Search,
    Users,
} from 'lucide-react';
import { officerApi } from '../../api/officerApi';
import {
    SORT_OPTIONS,
    STATUS_CONFIG,
    STATUS_FILTER_CARDS,
    formatAppliedDate,
    formatExperience,
    formatJobType,
    getApplicantEmail,
    getApplicantName,
    getApplicantQualification,
    getApplicationStatus,
    getResumeUrl,
    sortApplications,
    splitTextList,
} from './applicantHelpers';

const enrichApplications = (jobs, applicationGroups) =>
    jobs.flatMap((job, index) => {
        const items = applicationGroups[index] || [];
        return items.map((application) => ({
            ...application,
            jobId: job.id,
            jobTitle: job.title,
            jobType: job.jobType,
            jobLocation: job.location,
            salaryRange: job.salaryRange,
            requiredSkills: job.requiredSkills,
            preferredSkills: job.preferredSkills,
        }));
    });

export default function OfficerApplicants() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [jobFilter, setJobFilter] = useState(searchParams.get('jobId') || 'ALL');
    const [jobTypeFilter, setJobTypeFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('APPLIED_ASC');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchJobsAndApplications = async () => {
            setLoading(true);
            setError('');

            try {
                const jobsResponse = await officerApi.getJobs();
                const jobsData = Array.isArray(jobsResponse.data) ? jobsResponse.data : [];
                setJobs(jobsData);

                const applicationResponses = await Promise.all(
                    jobsData.map(async (job) => {
                        const response = await officerApi.getApplicationsForJob(job.id);
                        return Array.isArray(response.data?.applications) ? response.data.applications : [];
                    })
                );

                setApplications(enrichApplications(jobsData, applicationResponses));
            } catch (fetchError) {
                console.error('Failed to load officer applicants', fetchError);
                setError(fetchError.response?.data?.message || 'Unable to load applicants right now.');
            } finally {
                setLoading(false);
            }
        };

        fetchJobsAndApplications();
    }, []);

    const visibleApplications = applications.filter(
        (application) => getApplicationStatus(application) !== 'SHORTLISTED'
    );

    const filteredApplications = sortApplications(
        visibleApplications.filter((application) => {
            const currentStatus = getApplicationStatus(application);
            const searchableText = [
                getApplicantName(application),
                getApplicantEmail(application),
                application.jobTitle,
                application.jobType,
                application.user?.skills,
                application.user?.specialization,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            const matchesStatus = statusFilter === 'ALL' || currentStatus === statusFilter;
            const matchesJob = jobFilter === 'ALL' || String(application.jobId) === jobFilter;
            const matchesJobType = jobTypeFilter === 'ALL' || application.jobType === jobTypeFilter;
            const matchesSearch = searchableText.includes(searchTerm.trim().toLowerCase());

            return matchesStatus && matchesJob && matchesJobType && matchesSearch;
        }),
        sortBy,
    );

    const jobTypeOptions = [...new Set(jobs.map((job) => job.jobType).filter(Boolean))];

    const counts = {
        ALL: visibleApplications.length,
        INTERVIEW: visibleApplications.filter((application) => getApplicationStatus(application) === 'INTERVIEW').length,
        TECHNICAL_ROUND: visibleApplications.filter((application) => getApplicationStatus(application) === 'TECHNICAL_ROUND').length,
        REJECTED: visibleApplications.filter((application) => getApplicationStatus(application) === 'REJECTED').length,
    };

    if (loading) {
        return (
            <div className="flex min-h-[420px] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-panel border border-danger/30 bg-danger/10 p-8 text-center">
                <h2 className="text-xl font-bold text-danger">Unable to load applicants</h2>
                <p className="mt-2 text-sm text-danger/80">{error}</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <section className="glass-panel overflow-hidden rounded-[30px] border border-white/10 p-6 lg:p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(77,163,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.14),transparent_35%)]" />
                <div className="relative space-y-6">
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">Applications</p>
                        <h1 className="mt-3 text-3xl font-bold text-white lg:text-4xl">
                            Applicants selection
                        </h1>
                        <p className="mt-3 text-sm leading-7 text-white/70">
                            {/* Status card click cheste aa stage lo unna applicants maatrame kanipistaru. Default ga andarini chupistundi. Job name, job type, search, and sort anni okesaari use cheyochu. */}
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        {STATUS_FILTER_CARDS.map((card) => {
                            const isActive = statusFilter === card.key;
                            const cardConfig = STATUS_CONFIG[card.key] || null;

                            return (
                                <button
                                    type="button"
                                    key={card.key}
                                    onClick={() => setStatusFilter(card.key)}
                                    className={`rounded-[28px] border p-4 text-left transition-all ${
                                        isActive
                                            ? 'border-primary/40 bg-primary/10 shadow-[0_12px_32px_rgba(77,163,255,0.14)]'
                                            : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]'
                                    }`}
                                >
                                    <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${cardConfig?.color || 'text-text-secondary'}`}>
                                        {card.label}
                                    </p>
                                    <p className="mt-3 text-3xl font-bold text-white">{counts[card.key] || 0}</p>
                                    <p className="mt-2 text-xs leading-6 text-text-secondary">{card.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="glass-panel rounded-[30px] border border-white/10 p-5 lg:p-6">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.2fr)_220px_220px_220px]">
                    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-background/40 px-4 py-3">
                        <Search className="h-4 w-4 text-text-secondary" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Search applicant, email, job name, or skill"
                            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-text-secondary"
                        />
                    </label>

                    <select
                        value={jobFilter}
                        onChange={(event) => setJobFilter(event.target.value)}
                        className="rounded-2xl border border-white/10 bg-background/40 px-4 py-3 text-sm text-white outline-none"
                    >
                        <option value="ALL">All job names</option>
                        {jobs.map((job) => (
                            <option key={job.id} value={job.id}>
                                {job.title}
                            </option>
                        ))}
                    </select>

                    <select
                        value={jobTypeFilter}
                        onChange={(event) => setJobTypeFilter(event.target.value)}
                        className="rounded-2xl border border-white/10 bg-background/40 px-4 py-3 text-sm text-white outline-none"
                    >
                        <option value="ALL">All job types</option>
                        {jobTypeOptions.map((jobType) => (
                            <option key={jobType} value={jobType}>
                                {formatJobType(jobType)}
                            </option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value)}
                        className="rounded-2xl border border-white/10 bg-background/40 px-4 py-3 text-sm text-white outline-none"
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.key} value={option.key}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </section>

            <section className="glass-panel overflow-hidden rounded-[30px] border border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-white">Applicants</h2>
                        <p className="text-xs uppercase tracking-[0.18em] text-text-secondary">
                            {filteredApplications.length} records in current view
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                            <Filter className="h-3.5 w-3.5" />
                            {statusFilter === 'ALL' ? 'All statuses' : STATUS_CONFIG[statusFilter]?.label || statusFilter}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                            <Layers3 className="h-3.5 w-3.5" />
                            Default sort: oldest apply first
                        </span>
                    </div>
                </div>

                {filteredApplications.length === 0 ? (
                    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
                        <Users className="h-12 w-12 text-white/20" />
                        <h3 className="mt-4 text-xl font-bold text-white">No applicants in this view</h3>
                        <p className="mt-2 max-w-md text-sm leading-7 text-text-secondary">
                            Filter clear chesi or vere status/job type select chesi try cheyandi.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {filteredApplications.map((application, index) => {
                            const status = getApplicationStatus(application);
                            const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.APPLIED;
                            const skills = splitTextList(application.user?.skills).slice(0, 4);
                            const resumeUrl = getResumeUrl(application.user?.resumeUrl);

                            return (
                                <motion.div
                                    key={application.id || index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    onClick={() => navigate(`/officer/applicants/${application.id}`, { state: { application } })}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' || event.key === ' ') {
                                            event.preventDefault();
                                            navigate(`/officer/applicants/${application.id}`, { state: { application } });
                                        }
                                    }}
                                    role="button"
                                    tabIndex={0}
                                    className="w-full cursor-pointer px-5 py-5 text-left transition-colors hover:bg-white/[0.03]"
                                >
                                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_220px_200px_220px]">
                                        <div className="min-w-0">
                                            <div className="flex items-start gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/15 text-lg font-bold text-secondary">
                                                    {getApplicantName(application).charAt(0)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="truncate text-lg font-semibold text-white">{getApplicantName(application)}</p>
                                                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                                                            {statusConfig.label}
                                                        </span>
                                                    </div>
                                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                                                        <span className="inline-flex items-center gap-1">
                                                            <Mail className="h-3.5 w-3.5" />
                                                            {getApplicantEmail(application)}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <Briefcase className="h-3.5 w-3.5" />
                                                            {application.jobTitle}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <CalendarClock className="h-3.5 w-3.5" />
                                                            Applied {formatAppliedDate(application.appliedAt)}
                                                        </span>
                                                    </div>
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {skills.map((skill) => (
                                                            <span key={`${application.id}-${skill}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/80">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                                            <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Profile</p>
                                            <p className="mt-2 text-sm font-medium text-white">{getApplicantQualification(application)}</p>
                                            <p className="mt-1 text-xs text-text-secondary">{formatExperience(application.user?.experienceYears)}</p>
                                        </div>

                                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                                            <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Job type</p>
                                            <p className="mt-2 text-sm font-medium text-white">{formatJobType(application.jobType)}</p>
                                            <p className="mt-1 text-xs text-text-secondary">{application.jobLocation || 'Location not set'}</p>
                                        </div>

                                        <div className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Quick access</p>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {resumeUrl && (
                                                        <a
                                                            href={resumeUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            onClick={(event) => event.stopPropagation()}
                                                            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-primary/30 hover:text-primary"
                                                        >
                                                            <FileText className="h-3.5 w-3.5" />
                                                            Resume
                                                        </a>
                                                    )}
                                                    <Link
                                                        to={`/officer/applicants/${application.id}`}
                                                        state={{ application }}
                                                        onClick={(event) => event.stopPropagation()}
                                                        className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                                                    >
                                                        Review
                                                        <ArrowRight className="h-3.5 w-3.5" />
                                                    </Link>
                                                </div>
                                            </div>
                                            <p className="text-xs text-text-secondary">Click row to open applicant profile + job details page.</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </section>
        </motion.div>
    );
}
