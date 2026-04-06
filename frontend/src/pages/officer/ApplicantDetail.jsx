import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    ArrowRightCircle,
    Briefcase,
    CalendarClock,
    CheckCircle2,
    ExternalLink,
    FileText,
    GraduationCap,
    Mail,
    MapPin,
    Phone,
    Sparkles,
    UserCircle2,
} from 'lucide-react';
import { officerApi } from '../../api/officerApi';
import {
    DETAIL_ACTIONS,
    STATUS_CONFIG,
    formatAppliedTime,
    formatExperience,
    formatJobType,
    getApplicantEmail,
    getApplicantLocation,
    getApplicantName,
    getApplicantPhone,
    getApplicantQualification,
    getApplicationStatus,
    getFitInsights,
    getResumeUrl,
    splitTextList,
} from './applicantHelpers';

export default function ApplicantDetail() {
    const { applicationId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const seededApplication = location.state?.application || null;

    const [application, setApplication] = useState(null);
    const [scoreDetails, setScoreDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState(null);
    const [pendingStatus, setPendingStatus] = useState('');
    const [selectedStage, setSelectedStage] = useState('');
    const [interviewSlots, setInterviewSlots] = useState([]);
    const [scheduling, setScheduling] = useState(false);
    const [interviewForm, setInterviewForm] = useState({
        scheduledAt: '',
        mode: 'ONLINE',
        meetingLink: '',
        venue: '',
        additionalNotes: '',
    });

    useEffect(() => {
        const fetchApplication = async () => {
            setLoading(true);
            setError('');

            try {
                let resolvedApplication = seededApplication;

                if (!resolvedApplication || String(resolvedApplication.id) !== String(applicationId)) {
                    const jobsResponse = await officerApi.getJobs();
                    const jobsData = Array.isArray(jobsResponse.data) ? jobsResponse.data : [];
                    const applicationResponses = await Promise.all(
                        jobsData.map(async (job) => {
                            const response = await officerApi.getApplicationsForJob(job.id);
                            const items = Array.isArray(response.data?.applications) ? response.data.applications : [];
                            return items.map((item) => ({
                                ...item,
                                jobId: job.id,
                                jobTitle: job.title,
                                jobType: job.jobType,
                                jobLocation: job.location,
                                salaryRange: job.salaryRange,
                                requiredSkills: job.requiredSkills,
                                preferredSkills: job.preferredSkills,
                            }));
                        })
                    );

                    resolvedApplication = applicationResponses.flat().find(
                        (item) => String(item.id) === String(applicationId)
                    );
                }

                if (!resolvedApplication) {
                    throw new Error('Applicant not found');
                }

                setApplication(resolvedApplication);
                setSelectedStage(getApplicationStatus(resolvedApplication));

                try {
                    const scoreResponse = await officerApi.getApplicationScore(applicationId);
                    setScoreDetails(scoreResponse.data || null);
                } catch (scoreError) {
                    console.error('Unable to fetch applicant score', scoreError);
                    setScoreDetails(null);
                }

                try {
                    const interviewResponse = await officerApi.getInterviewSlots(applicationId);
                    setInterviewSlots(Array.isArray(interviewResponse.data) ? interviewResponse.data : []);
                } catch (interviewError) {
                    console.error('Unable to fetch interview slots', interviewError);
                    setInterviewSlots([]);
                }
            } catch (fetchError) {
                console.error('Failed to load applicant detail', fetchError);
                setError(fetchError.response?.data?.message || 'Unable to open this applicant right now.');
            } finally {
                setLoading(false);
            }
        };

        fetchApplication();
    }, [applicationId, seededApplication]);

    const currentStatus = application ? getApplicationStatus(application) : 'APPLIED';
    const statusConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.APPLIED;
    const resumeUrl = getResumeUrl(application?.user?.resumeUrl);
    const fitInsights = application ? getFitInsights(application, scoreDetails) : null;

    const handleStatusSubmit = async () => {
        if (!application || pendingStatus || !selectedStage || selectedStage === currentStatus) {
            return;
        }

        const previousStatus = getApplicationStatus(application);
        const nextStatus = selectedStage;
        setPendingStatus(nextStatus);
        setFeedback(null);
        setApplication((currentApplication) => ({
            ...currentApplication,
            applicationStatus: nextStatus,
            status: nextStatus,
        }));

        try {
            await officerApi.updateApplicationStatus(application.id, nextStatus);
            setFeedback({
                type: 'success',
                message: `${getApplicantName(application)} moved to ${STATUS_CONFIG[nextStatus]?.label || nextStatus}.`,
            });
        } catch (statusError) {
            console.error('Failed to update status', statusError);
            setApplication((currentApplication) => ({
                ...currentApplication,
                applicationStatus: previousStatus,
                status: previousStatus,
            }));
            setFeedback({
                type: 'error',
                message: statusError.response?.data?.message || 'Unable to update applicant status.',
            });
        } finally {
            setPendingStatus('');
        }
    };

    const handleScheduleInterview = async () => {
        if (!application || scheduling || !interviewForm.scheduledAt) {
            return;
        }

        if (interviewForm.mode === 'ONLINE' && !interviewForm.meetingLink.trim()) {
            setFeedback({ type: 'error', message: 'Add a meeting link for online interviews.' });
            return;
        }

        if (interviewForm.mode === 'OFFLINE' && !interviewForm.venue.trim()) {
            setFeedback({ type: 'error', message: 'Add a venue for offline interviews.' });
            return;
        }

        setScheduling(true);
        setFeedback(null);

        try {
            const payload = {
                scheduledAt: interviewForm.scheduledAt,
                mode: interviewForm.mode,
                meetingLink: interviewForm.mode === 'ONLINE' ? interviewForm.meetingLink.trim() : '',
                venue: interviewForm.mode === 'OFFLINE' ? interviewForm.venue.trim() : '',
                additionalNotes: interviewForm.additionalNotes.trim(),
            };

            const response = await officerApi.scheduleInterview(application.id, payload);
            const scheduledInterview = response.data;

            if (!['INTERVIEW', 'TECHNICAL_ROUND'].includes(currentStatus)) {
                await officerApi.updateApplicationStatus(application.id, 'INTERVIEW');
                setApplication((currentApplication) => ({
                    ...currentApplication,
                    applicationStatus: 'INTERVIEW',
                    status: 'INTERVIEW',
                }));
            }

            setInterviewSlots((currentSlots) =>
                [...currentSlots, scheduledInterview].sort(
                    (left, right) => new Date(left.scheduledAt).getTime() - new Date(right.scheduledAt).getTime()
                )
            );
            setInterviewForm({
                scheduledAt: '',
                mode: 'ONLINE',
                meetingLink: '',
                venue: '',
                additionalNotes: '',
            });
            setSelectedStage('INTERVIEW');
            setFeedback({
                type: 'success',
                message: `Interview scheduled for ${getApplicantName(application)}.`,
            });
        } catch (scheduleError) {
            console.error('Failed to schedule interview', scheduleError);
            setFeedback({
                type: 'error',
                message: scheduleError.response?.data?.message || 'Unable to schedule the interview.',
            });
        } finally {
            setScheduling(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[420px] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className="glass-panel border border-danger/30 bg-danger/10 p-8 text-center">
                <h2 className="text-xl font-bold text-danger">Unable to load applicant page</h2>
                <p className="mt-2 text-sm text-danger/80">{error || 'Applicant not found.'}</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={() => navigate('/officer/applicants')}
                    className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to applicants
                </button>
                <a href="#profile" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80">Profile</a>
                <a href="#job-details" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80">Job Details</a>
                <a href="#stage-actions" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80">Stage Actions</a>
            </div>

            {feedback && (
                <div
                    className={`rounded-2xl border px-4 py-3 text-sm ${
                        feedback.type === 'error'
                            ? 'border-danger/30 bg-danger/10 text-danger'
                            : 'border-success/30 bg-success/10 text-success'
                    }`}
                >
                    {feedback.message}
                </div>
            )}

            <section className="glass-panel overflow-hidden rounded-[30px] border border-white/10 p-6 lg:p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(77,163,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.14),transparent_35%)]" />
                <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/15 text-2xl font-bold text-primary">
                            {getApplicantName(application).charAt(0)}
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Applicant Detail</p>
                            <h1 className="mt-2 text-3xl font-bold text-white">{getApplicantName(application)}</h1>
                            <p className="mt-2 text-sm text-white/70">{application.job?.title || 'Applied job'}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                                <span className="inline-flex items-center gap-1">
                                    <Mail className="h-3.5 w-3.5" />
                                    {getApplicantEmail(application)}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <CalendarClock className="h-3.5 w-3.5" />
                                    Applied {formatAppliedTime(application.appliedAt)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                            {statusConfig.label}
                        </span>
                        {resumeUrl && (
                            <a
                                href={resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-background transition-colors hover:bg-primary/90"
                            >
                                <FileText className="h-4 w-4" />
                                Open Resume
                            </a>
                        )}
                        {application.job?.id && (
                            <Link
                                to={`/officer/jobs/${application.job.id}`}
                                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                            >
                                <Briefcase className="h-4 w-4" />
                                Open Job Details
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="space-y-6">
                    <section id="profile" className="glass-panel rounded-[30px] border border-white/10 p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Applicant Profile</p>
                                <h2 className="mt-1 text-xl font-bold text-white">Candidate overview</h2>
                            </div>
                            <UserCircle2 className="h-5 w-5 text-primary" />
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Qualification</p>
                                <p className="mt-2 text-sm text-white">{getApplicantQualification(application)}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Experience</p>
                                <p className="mt-2 text-sm text-white">{formatExperience(application.user?.experienceYears)}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Phone</p>
                                <p className="mt-2 inline-flex items-center gap-2 text-sm text-white">
                                    <Phone className="h-4 w-4 text-secondary" />
                                    {getApplicantPhone(application) || 'Not shared'}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Location</p>
                                <p className="mt-2 inline-flex items-center gap-2 text-sm text-white">
                                    <MapPin className="h-4 w-4 text-success" />
                                    {getApplicantLocation(application)}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <p className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-text-secondary">
                                <GraduationCap className="h-4 w-4 text-primary" />
                                Skills in profile
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {splitTextList(application.user?.skills).slice(0, 12).map((skill) => (
                                    <span key={skill} className="rounded-full border border-white/10 bg-background/40 px-3 py-1 text-xs text-white/80">
                                        {skill}
                                    </span>
                                ))}
                                {splitTextList(application.user?.skills).length === 0 && (
                                    <span className="text-sm text-text-secondary">No skills listed in profile.</span>
                                )}
                            </div>
                        </div>
                    </section>

                    <section id="job-details" className="glass-panel rounded-[30px] border border-white/10 p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Applied Job</p>
                        <h2 className="mt-1 text-xl font-bold text-white">{application.job?.title || 'Job details not available'}</h2>
                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Job type</p>
                                <p className="mt-2 text-sm text-white">{formatJobType(application.job?.jobType)}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Location</p>
                                <p className="mt-2 text-sm text-white">{application.job?.location || 'Not specified'}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Salary range</p>
                                <p className="mt-2 text-sm text-white">{application.job?.salaryRange || 'Not shared'}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Deadline</p>
                                <p className="mt-2 text-sm text-white">
                                    {application.job?.applicationDeadline
                                        ? new Date(application.job.applicationDeadline).toLocaleDateString('en-IN')
                                        : 'Open ended'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <p className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">Job description</p>
                            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-white/75">
                                {application.job?.description || 'No description shared for this job.'}
                            </p>
                        </div>
                    </section>
                </div>

                <div id="stage-actions" className="space-y-6 xl:sticky xl:top-6 xl:h-fit">
                    <section className="glass-panel rounded-[30px] border border-white/10 p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-success">Fit Signal</p>
                                <h3 className="mt-1 text-lg font-bold text-white">Resume review support</h3>
                            </div>
                            <div className="rounded-2xl border border-success/20 bg-success/10 px-4 py-3">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-success">Fit score</p>
                                <p className="mt-1 text-2xl font-bold text-white">{fitInsights?.fitScore || 0}%</p>
                            </div>
                        </div>

                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                            <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                                <Sparkles className="h-4 w-4 text-success" />
                                {fitInsights?.recommendation}
                            </p>
                            <p className="mt-2 text-sm leading-7 text-text-secondary">
                                {fitInsights?.matchLevel
                                    ? `Match level: ${fitInsights.matchLevel}`
                                    : 'Skill overlap and resume signal used for quick officer review.'}
                            </p>
                        </div>

                        <div className="mt-4 space-y-3">
                            <div className="rounded-2xl border border-success/20 bg-success/10 p-4">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-success">Matched skills</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {(fitInsights?.matchedRequired.length ? fitInsights.matchedRequired : fitInsights?.matchedPreferred || []).slice(0, 6).map((skill) => (
                                        <span key={skill} className="rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-warning/20 bg-warning/10 p-4">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-warning">Missing required</p>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {fitInsights?.missingRequired.slice(0, 6).map((skill) => (
                                        <span key={skill} className="rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                                            {skill}
                                        </span>
                                    ))}
                                    {!fitInsights?.missingRequired.length && (
                                        <span className="text-sm text-warning/80">No major missing skills detected.</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="glass-panel rounded-[30px] border border-white/10 p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Set Applicant Stage</p>
                        <div className="mt-4 grid gap-3">
                            {DETAIL_ACTIONS.map((action) => {
                                const isCurrent = currentStatus === action.status;
                                const isSelected = selectedStage === action.status;

                                return (
                                    <button
                                        type="button"
                                        key={action.status}
                                        onClick={() => setSelectedStage(action.status)}
                                        disabled={Boolean(pendingStatus)}
                                        className={`flex items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left transition-all ${
                                            isSelected || isCurrent
                                                ? 'border-primary/30 bg-primary/10'
                                                : 'border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06] disabled:opacity-60'
                                        }`}
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-white">
                                                {action.label}
                                            </p>
                                            <p className="mt-1 text-xs text-text-secondary">{action.helper}</p>
                                        </div>
                                        {isCurrent || isSelected ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <ArrowRightCircle className="h-4 w-4 text-white/40" />}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={handleStatusSubmit}
                            disabled={!selectedStage || selectedStage === currentStatus || Boolean(pendingStatus)}
                            className="mt-4 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-background transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {pendingStatus ? 'Submitting...' : 'Submit Stage Update'}
                        </button>
                    </section>

                    <section className="glass-panel rounded-[30px] border border-white/10 p-6">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Interview Schedule</p>
                        <div className="mt-4 space-y-3">
                            {interviewSlots.length === 0 ? (
                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-text-secondary">
                                    No interview has been scheduled for this applicant yet.
                                </div>
                            ) : (
                                interviewSlots.map((slot) => (
                                    <div key={slot.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                        <p className="text-sm font-semibold text-white">
                                            {new Date(slot.scheduledAt).toLocaleString('en-IN', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-text-secondary">
                                            {String(slot.mode || '').replace('_', ' ')}
                                        </p>
                                        {slot.meetingLink && (
                                            <a
                                                href={slot.meetingLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-white transition-colors"
                                            >
                                                Open meeting link
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        )}
                                        {slot.venue && (
                                            <p className="mt-3 text-sm text-white/80">Venue: {slot.venue}</p>
                                        )}
                                        {slot.additionalNotes && (
                                            <p className="mt-2 text-sm text-text-secondary">{slot.additionalNotes}</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-4 grid gap-3">
                            <input
                                type="datetime-local"
                                value={interviewForm.scheduledAt}
                                onChange={(event) =>
                                    setInterviewForm((currentForm) => ({ ...currentForm, scheduledAt: event.target.value }))
                                }
                                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-secondary/40"
                            />
                            <select
                                value={interviewForm.mode}
                                onChange={(event) =>
                                    setInterviewForm((currentForm) => ({ ...currentForm, mode: event.target.value }))
                                }
                                className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-secondary/40"
                            >
                                <option value="ONLINE" className="bg-background">Online</option>
                                <option value="OFFLINE" className="bg-background">Offline</option>
                            </select>

                            {interviewForm.mode === 'ONLINE' ? (
                                <input
                                    type="url"
                                    value={interviewForm.meetingLink}
                                    onChange={(event) =>
                                        setInterviewForm((currentForm) => ({ ...currentForm, meetingLink: event.target.value }))
                                    }
                                    placeholder="Meeting link"
                                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-text-secondary focus:border-secondary/40"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={interviewForm.venue}
                                    onChange={(event) =>
                                        setInterviewForm((currentForm) => ({ ...currentForm, venue: event.target.value }))
                                    }
                                    placeholder="Venue / room details"
                                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-text-secondary focus:border-secondary/40"
                                />
                            )}

                            <textarea
                                value={interviewForm.additionalNotes}
                                onChange={(event) =>
                                    setInterviewForm((currentForm) => ({ ...currentForm, additionalNotes: event.target.value }))
                                }
                                placeholder="Additional notes for the candidate"
                                className="min-h-[96px] rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-text-secondary focus:border-secondary/40"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleScheduleInterview}
                            disabled={scheduling}
                            className="mt-4 w-full rounded-2xl bg-secondary px-4 py-3 text-sm font-semibold text-background transition-colors hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {scheduling ? 'Scheduling...' : 'Schedule Interview'}
                        </button>
                    </section>
                </div>
            </div>
        </motion.div>
    );
}
