import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    Briefcase,
    Building2,
    CalendarDays,
    CheckCircle,
    MapPin,
    ShieldCheck,
    Sparkles,
    Users,
    X,
} from 'lucide-react';
import { publicApi } from '../../api/publicApi';
import { userApi } from '../../api/userApi';
import TopNav from '../../layout/TopNav';

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

export default function JobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const isUserView = location.pathname.startsWith('/user');

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [applyLoading, setApplyLoading] = useState(false);
    const [applyMessage, setApplyMessage] = useState('');
    const [applyError, setApplyError] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [resumeConfirmed, setResumeConfirmed] = useState(false);
    const [userProfile, setUserProfile] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            setLoading(true);
            try {
                const res = await publicApi.getJobDetails(id);
                setJob(res.data);
            } catch (err) {
                console.error('Failed to load job', err);
                setError('Job not found or failed to load.');
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    const getDocumentUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `http://localhost:9092${url}`;
    };

    const handleApply = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        setProfileLoading(true);
        setApplyError('');

        try {
            const res = await userApi.getProfile();
            const profile = res.data;

            if (!profile?.resumeUrl) {
                setApplyMessage('');
                setApplyError('Please upload your resume in My Profile before applying.');
                return;
            }

            setUserProfile(profile);
            setResumeConfirmed(false);
            setShowApplyModal(true);
        } catch (err) {
            const message = err.response?.data?.message || 'Unable to load your profile right now.';
            setApplyError(message.replace(/^Error:\s*/i, ''));
        } finally {
            setProfileLoading(false);
        }
    };

    const submitApplication = async () => {
        setApplyLoading(true);
        setApplyMessage('');
        setApplyError('');

        try {
            const res = await userApi.applyToJob(id);
            setApplyMessage(res.data?.message || 'Application submitted successfully.');
            setShowApplyModal(false);
            setResumeConfirmed(false);
        } catch (err) {
            const message = err.response?.data?.message || 'Unable to apply for this job right now.';
            setApplyError(message.replace(/^Error:\s*/i, ''));
        } finally {
            setApplyLoading(false);
        }
    };

    const handleBack = () => {
        navigate(isUserView ? '/user/jobs' : '/jobs');
    };

    const minimumQualifications = splitLineItems(job?.minimumQualifications);
    const preferredQualifications = splitLineItems(job?.preferredQualifications);
    const requiredSkills = splitCommaItems(job?.requiredSkills);
    const preferredSkills = splitCommaItems(job?.preferredSkills);
    const rounds = Array.isArray(job?.rounds) ? job.rounds : [];

    const content = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl space-y-8"
        >
            {/* Back Button */}
            <button
                onClick={handleBack}
                className="group flex items-center gap-2 text-sm text-text-secondary transition-colors hover:text-white"
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Jobs
            </button>

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
                    {/* Hero Section */}
                    <div className="glass-panel space-y-6 rounded-[28px] border border-white/10 p-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex gap-5">
                                <div className="hidden h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 md:flex">
                                    <Building2 className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-success">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        {job.status === 'CLOSED' ? 'Closed' : 'Open Position'}
                                    </div>
                                    <h1 className="text-3xl font-bold text-white">{job.title}</h1>
                                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-text-secondary">
                                        <div className="flex items-center gap-1.5">
                                            <Building2 className="h-4 w-4" />
                                            {job.company?.name || job.companyName || 'Company'}
                                        </div>
                                        {job.location && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-4 w-4" />
                                                {job.location}
                                            </div>
                                        )}
                                        <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                            {formatEnum(job.jobType)}
                                        </span>
                                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs">
                                            {formatEnum(job.workMode)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Key Info Grid */}
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center gap-2 text-primary">
                                    <Briefcase className="h-4 w-4" />
                                    <span className="text-xs uppercase tracking-[0.16em] text-text-secondary">Experience</span>
                                </div>
                                <p className="mt-2 font-semibold text-white">
                                    {(!job.experienceRequired || job.experienceRequired === 0) ? 'Fresher' : `${job.experienceRequired}+ years`}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center gap-2 text-success">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-xs uppercase tracking-[0.16em] text-text-secondary">Compensation</span>
                                </div>
                                <p className="mt-2 font-semibold text-white">{job.salaryRange || 'Not shared'}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center gap-2 text-warning">
                                    <CalendarDays className="h-4 w-4" />
                                    <span className="text-xs uppercase tracking-[0.16em] text-text-secondary">Deadline</span>
                                </div>
                                <p className="mt-2 font-semibold text-white">
                                    {job.applicationDeadline
                                        ? new Date(job.applicationDeadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                        : 'Open Ended'}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="flex items-center gap-2 text-secondary">
                                    <Users className="h-4 w-4" />
                                    <span className="text-xs uppercase tracking-[0.16em] text-text-secondary">Max Applicants</span>
                                </div>
                                <p className="mt-2 font-semibold text-white">{job.maxApplicants || 'No limit'}</p>
                            </div>
                        </div>
                    </div>

                    {/* About The Job */}
                    <div className="glass-panel rounded-[28px] border border-white/10 p-8">
                        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">About The Job</h2>
                        <p className="whitespace-pre-line text-sm leading-8 text-white/75">
                            {job.description || 'The company has not added a detailed job summary yet.'}
                        </p>
                    </div>

                    {/* Qualifications */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="glass-panel rounded-[28px] border border-white/10 p-6">
                            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-success">Minimum Qualifications</h3>
                            {minimumQualifications.length > 0 ? (
                                <ul className="space-y-3 text-sm leading-6 text-white/75">
                                    {minimumQualifications.map((item, idx) => (
                                        <li key={idx} className="flex gap-2">
                                            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-success" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-text-secondary">No minimum qualifications listed.</p>
                            )}
                        </div>

                        <div className="glass-panel rounded-[28px] border border-white/10 p-6">
                            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Preferred Qualifications</h3>
                            {preferredQualifications.length > 0 ? (
                                <ul className="space-y-3 text-sm leading-6 text-white/75">
                                    {preferredQualifications.map((item, idx) => (
                                        <li key={idx} className="flex gap-2">
                                            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-secondary" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-text-secondary">No preferred qualifications listed.</p>
                            )}
                        </div>
                    </div>

                    {/* Skills */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        <div className="glass-panel rounded-[28px] border border-white/10 p-6">
                            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Required Skills</h3>
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
                        </div>

                        <div className="glass-panel rounded-[28px] border border-white/10 p-6">
                            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-warning">Preferred Skills</h3>
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
                        </div>
                    </div>

                    {/* Hiring Rounds */}
                    {rounds.length > 0 && (
                        <div className="glass-panel rounded-[28px] border border-white/10 p-6">
                            <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-success">Hiring Rounds</h3>
                            <div className="flex flex-wrap gap-3">
                                {rounds
                                    .slice()
                                    .sort((a, b) => (a.roundOrder || 0) - (b.roundOrder || 0))
                                    .map((round) => (
                                        <div
                                            key={`${round.roundOrder}-${round.roundName}`}
                                            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-3"
                                        >
                                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success/20 text-xs font-bold text-success">
                                                {round.roundOrder}
                                            </span>
                                            <span className="text-sm font-medium text-white">{formatEnum(round.roundName)}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Apply Button */}
                    {job.status !== 'CLOSED' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-panel sticky bottom-4 rounded-[28px] border border-white/10 p-6"
                        >
                            {(applyMessage || applyError) && (
                                <div
                                    className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
                                        applyError
                                            ? 'border-danger/30 bg-danger/10 text-danger'
                                            : 'border-success/30 bg-success/10 text-success'
                                    }`}
                                >
                                    {applyError || applyMessage}
                                </div>
                            )}
                            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                                <div>
                                    <h3 className="text-lg font-bold text-white">Interested in this role?</h3>
                                    <p className="text-sm text-text-secondary">
                                        Review your resume and submit your application for recruiter review.
                                    </p>
                                </div>
                                <button
                                    onClick={handleApply}
                                    disabled={profileLoading}
                                    className="w-full rounded-xl bg-primary px-10 py-3 text-sm font-bold text-background shadow-[0_0_20px_rgba(77,163,255,0.35)] transition-all hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(77,163,255,0.5)] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                                >
                                    {profileLoading ? 'Checking Resume...' : 'Apply Now'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </>
            ) : null}

            <AnimatePresence>
                {showApplyModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 16, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 16, scale: 0.98 }}
                            className="glass-panel w-full max-w-xl rounded-[28px] border border-white/10 p-6"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Review Resume Before Applying</h3>
                                    <p className="mt-2 text-sm text-text-secondary">
                                        Open your resume once and confirm that you want to apply with it.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowApplyModal(false);
                                        setResumeConfirmed(false);
                                    }}
                                    className="rounded-full border border-white/10 p-2 text-text-secondary transition-colors hover:text-white"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Resume</p>
                                <a
                                    href={getDocumentUrl(userProfile?.resumeUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white underline decoration-primary/60 underline-offset-4 transition-colors hover:text-primary"
                                >
                                    Resume
                                </a>
                            </div>

                            {applyError && (
                                <div className="mt-4 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                                    {applyError}
                                </div>
                            )}

                            <label className="mt-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                <input
                                    type="checkbox"
                                    checked={resumeConfirmed}
                                    onChange={(event) => setResumeConfirmed(event.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
                                />
                                <span className="text-sm text-white">
                                    <strong>I want to apply with this resume.</strong>
                                </span>
                            </label>

                            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowApplyModal(false);
                                        setResumeConfirmed(false);
                                    }}
                                    className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={submitApplication}
                                    disabled={!resumeConfirmed || applyLoading}
                                    className="rounded-xl bg-primary px-5 py-3 text-sm font-bold text-background transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {applyLoading ? 'Applying...' : 'Apply With This Resume'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );

    if (isUserView) {
        return <div className="p-4 md:p-6">{content}</div>;
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-background">
            <div className="pointer-events-none absolute left-[-10%] top-[-20%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
            <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-secondary/20 blur-[150px]" />
            <TopNav />
            <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-28 sm:px-6 lg:px-8">
                {content}
            </div>
        </div>
    );
}
