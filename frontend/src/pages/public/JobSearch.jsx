import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Briefcase,
    Building2,
    CheckCircle,
    MapPin,
    Search,
    X,
    Filter, // Add Filter icon
} from 'lucide-react';
import { publicApi } from '../../api/publicApi';
import TopNav from '../../layout/TopNav';

// ====== Constants ======

const JOB_TYPES = [
    { value: 'FULLTIME', label: 'Full Time' },
    { value: 'PART_TIME', label: 'Part Time' },
    { value: 'INTERNSHIP', label: 'Internship' },
    { value: 'WORK_FROM_HOME', label: 'Work From Home' },
];

const EXPERIENCE_LEVELS = [
    { value: 'FRESHER', label: 'Fresher (0-1 yr)', min: 0, max: 1 },
    { value: 'JUNIOR', label: 'Junior (1-3 yr)', min: 1, max: 3 },
    { value: 'SENIOR', label: 'Senior (3-5 yr)', min: 3, max: 5 },
    { value: 'LEAD', label: 'Lead (5+ yr)', min: 5, max: 99 },
];

const SALARY_RANGES = [
    { value: '0-3', label: '0 - 3 LPA', min: 0, max: 3 },
    { value: '3-6', label: '3 - 6 LPA', min: 3, max: 6 },
    { value: '6-10', label: '6 - 10 LPA', min: 6, max: 10 },
    { value: '10-20', label: '10 - 20 LPA', min: 10, max: 20 },
    { value: '20+', label: '20+ LPA', min: 20, max: Infinity },
];

// ====== Helper Functions ======

function formatJobType(jobType) {
    return jobType ? jobType.replace(/_/g, ' ') : '';
}

function splitLineItems(value) {
    if (!value) return [];
    return value
        .split('\n')
        .map((item) => item.replace(/^[-*•\s]+/, '').trim())
        .filter(Boolean);
}

function splitCommaItems(value) {
    if (!value) return [];
    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function formatClosingDate(date) {
    if (!date) return 'Open Ended';
    return `Closes ${new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
    })}`;
}

// ====== Utility Components ======

function AnimatedFilterPill({ checked, onChange, label }) {
    return (
        <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={onChange}
            className={`flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                checked
                    ? 'bg-primary text-background shadow-[0_0_12px_rgba(77,163,255,0.4)]'
                    : 'bg-white/5 text-text-secondary hover:bg-white/10 hover:text-white'
            }`}
        >
            {label}
        </motion.button>
    );
}

function FilterSection({ title, children }) {
    return (
        <div className="mb-6 last:mb-0">
            <h4 className="mb-3 text-sm font-semibold tracking-wider text-white/50">{title}</h4>
            <div className="flex flex-wrap gap-2">
                {children}
            </div>
        </div>
    );
}

export default function JobSearch() {
    const [jobs, setJobs] = useState([]);
    const [allJobs, setAllJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [keyword, setKeyword] = useState('');
    const [location, setLocation] = useState('');

    // Applied Filters
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedExp, setSelectedExp] = useState([]);
    const [selectedSalary, setSelectedSalary] = useState([]);

    // Modal & Pending Filters State
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [pendingTypes, setPendingTypes] = useState([]);
    const [pendingExp, setPendingExp] = useState([]);
    const [pendingSalary, setPendingSalary] = useState([]);

    const navigate = useNavigate();
    const routerLocation = useLocation();
    const isUserView = routerLocation.pathname.startsWith('/user');
    const isPublic = !isUserView;

    const togglePendingFilter = (value, list, setList) => {
        setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
    };

    const openFilterModal = () => {
        setPendingTypes([...selectedTypes]);
        setPendingExp([...selectedExp]);
        setPendingSalary([...selectedSalary]);
        setIsFilterModalOpen(true);
    };

    const applyFilters = () => {
        setSelectedTypes([...pendingTypes]);
        setSelectedExp([...pendingExp]);
        setSelectedSalary([...pendingSalary]);
        setIsFilterModalOpen(false);
    };

    const clearFilters = () => {
        setPendingTypes([]);
        setPendingExp([]);
        setPendingSalary([]);
    };

    const activeFilterCount = selectedTypes.length + selectedExp.length + selectedSalary.length;

    useEffect(() => {
        const fetchJobs = async () => {
            setLoading(true);
            try {
                const res = await publicApi.searchJobs('', '');
                setAllJobs(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('Failed to load jobs', err);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    useEffect(() => {
        let filtered = [...allJobs];

        if (keyword.trim()) {
            const loweredKeyword = keyword.toLowerCase();
            filtered = filtered.filter(
                (job) =>
                    job.title?.toLowerCase().includes(loweredKeyword) ||
                    job.description?.toLowerCase().includes(loweredKeyword) ||
                    job.requiredSkills?.toLowerCase().includes(loweredKeyword) ||
                    job.minimumQualifications?.toLowerCase().includes(loweredKeyword) ||
                    job.preferredQualifications?.toLowerCase().includes(loweredKeyword) ||
                    job.preferredSkills?.toLowerCase().includes(loweredKeyword)
            );
        }

        if (location.trim()) {
            const loweredLocation = location.toLowerCase();
            filtered = filtered.filter((job) => job.location?.toLowerCase().includes(loweredLocation));
        }

        if (selectedTypes.length > 0) {
            filtered = filtered.filter((job) => selectedTypes.includes(job.jobType));
        }

        if (selectedExp.length > 0) {
            const experienceFilters = EXPERIENCE_LEVELS.filter((level) => selectedExp.includes(level.value));
            filtered = filtered.filter((job) => {
                const experience = job.experienceRequired ?? 0;
                return experienceFilters.some((level) => experience >= level.min && experience < level.max);
            });
        }

        if (selectedSalary.length > 0) {
            const salaryFilters = SALARY_RANGES.filter((range) => selectedSalary.includes(range.value));
            filtered = filtered.filter((job) => {
                const ctc = job.ctcFixed ?? 0;
                return salaryFilters.some(
                    (range) => ctc >= range.min && (range.max === Infinity || ctc <= range.max)
                );
            });
        }

        setJobs(filtered);
    }, [allJobs, keyword, location, selectedTypes, selectedExp, selectedSalary]);

    // Styles based on view
    const resultsShellClassName = isUserView
        ? 'glass-panel w-full rounded-[32px] border border-white/10 bg-surface/65 p-6'
        : 'w-full';

    const jobCardClassName = isUserView
        ? 'rounded-[28px] border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:border-primary/30 hover:bg-white/[0.06]'
        : 'glass-panel rounded-2xl p-6 transition-colors hover:border-primary/30';

    const emptyStateClassName = isUserView
        ? 'mx-auto max-w-2xl rounded-[28px] border border-white/10 bg-background/40 px-6 py-16 text-center'
        : 'mx-auto max-w-2xl glass-panel rounded-[28px] border border-white/10 bg-surface/55 p-12 text-center';

    const searchBar = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`glass-panel border border-white/10 p-3 flex flex-col md:flex-row items-center gap-3 ${
                isUserView
                    ? 'rounded-[28px] bg-surface/70 w-full'
                    : 'mx-auto max-w-5xl rounded-2xl md:rounded-full bg-surface/60 w-full'
            }`}
        >
            {/* Keyword Input */}
            <div className="flex flex-1 w-full items-center gap-3 px-4 py-2">
                <Search className="h-5 w-5 flex-shrink-0 text-primary" />
                <input
                    type="text"
                    placeholder="Job title, skills, or keywords..."
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                />
                {keyword && (
                    <button
                        type="button"
                        onClick={() => setKeyword('')}
                        className="text-text-secondary transition-colors hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>
            
            <div className="hidden h-10 w-px self-center bg-white/10 md:block" />
            
            {/* Location Input - Shorter Space */}
            <div className="flex w-full md:w-[220px] items-center gap-3 px-4 py-2 border-t md:border-t-0 border-white/10">
                <MapPin className="h-5 w-5 flex-shrink-0 text-secondary" />
                <input
                    type="text"
                    placeholder="Location..."
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                />
            </div>

            {/* Filter Button */}
            <div className="flex w-full md:w-auto items-center justify-end px-2 pb-2 md:pb-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={openFilterModal}
                    className="relative flex items-center justify-center gap-2 w-full md:w-auto rounded-[18px] md:rounded-full bg-white/5 md:bg-transparent hover:bg-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors"
                >
                    <Filter className="h-4 w-4 text-text-secondary" />
                    Filters
                    {activeFilterCount > 0 && (
                        <span className="absolute top-1 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-background">
                            {activeFilterCount}
                        </span>
                    )}
                </motion.button>
            </div>
        </motion.div>
    );

    const FilterModal = (
        <AnimatePresence>
            {isFilterModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsFilterModalOpen(false)}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 15 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 15 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-white/10 bg-[#121826] shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/10 p-6 bg-white/[0.02]">
                            <h2 className="text-xl font-bold text-white">Filters</h2>
                            <button
                                onClick={() => setIsFilterModalOpen(false)}
                                className="rounded-full bg-white/5 p-2 text-text-secondary transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                            <FilterSection title="Job Type">
                                {JOB_TYPES.map((type) => (
                                    <AnimatedFilterPill
                                        key={type.value}
                                        label={type.label}
                                        checked={pendingTypes.includes(type.value)}
                                        onChange={() => togglePendingFilter(type.value, pendingTypes, setPendingTypes)}
                                    />
                                ))}
                            </FilterSection>

                            <FilterSection title="Experience Level">
                                {EXPERIENCE_LEVELS.map((level) => (
                                    <AnimatedFilterPill
                                        key={level.value}
                                        label={level.label}
                                        checked={pendingExp.includes(level.value)}
                                        onChange={() => togglePendingFilter(level.value, pendingExp, setPendingExp)}
                                    />
                                ))}
                            </FilterSection>

                            <FilterSection title="Package / Salary">
                                {SALARY_RANGES.map((range) => (
                                    <AnimatedFilterPill
                                        key={range.value}
                                        label={range.label}
                                        checked={pendingSalary.includes(range.value)}
                                        onChange={() => togglePendingFilter(range.value, pendingSalary, setPendingSalary)}
                                    />
                                ))}
                            </FilterSection>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between border-t border-white/10 p-6 bg-white/[0.02]">
                            <button
                                onClick={clearFilters}
                                className="text-sm font-medium text-text-secondary hover:text-white transition-colors"
                            >
                                Clear All
                            </button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={applyFilters}
                                className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-background shadow-[0_4px_14px_rgba(77,163,255,0.39)] transition-colors hover:bg-primary/90"
                            >
                                Apply Filters
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    const isSearching = keyword.trim() || location.trim() || activeFilterCount > 0;

    const resultsContent = (
        <div className="w-full">
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isUserView ? 'mb-5' : 'mb-6 md:mb-8 border-b border-white/10 pb-4'}`}>
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">
                        {isSearching ? 'Search Results' : 'Active Job Postings'}
                    </h2>
                    {isUserView && (
                        <p className="mt-1 text-sm text-text-secondary">
                            {isSearching 
                                ? 'Showing roles that match your search criteria.'
                                : 'Explore the latest opportunities available.'}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-4 py-1.5 text-sm font-medium text-white shadow-sm">
                        <span className="relative flex h-2 w-2">
                           <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                           <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                        </span>
                        {loading ? '...' : `${jobs.length} Active`}
                    </span>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            ) : jobs.length === 0 ? (
                <div className={emptyStateClassName}>
                    <Briefcase className="mx-auto mb-4 h-14 w-14 text-text-secondary/30" />
                    <h3 className="mb-2 text-xl font-medium text-white">No jobs found</h3>
                    <p className="text-text-secondary text-sm">Try adjusting your filters, location, or search keywords to find what you're looking for.</p>
                </div>
            ) : (
                <div className="space-y-4 md:space-y-5">
                    {jobs.map((job, index) => (
                        <motion.div
                            key={job.id || index}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.04 }}
                            className={`${jobCardClassName} space-y-5`}
                        >
                            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                                <div className="flex gap-4">
                                    <div className="hidden h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 md:flex">
                                        <Building2 className="h-7 w-7 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3
                                            onClick={() => navigate(isUserView ? `/user/jobs/${job.id}` : `/jobs/${job.id}`)}
                                            className="cursor-pointer text-lg md:text-xl font-bold text-white transition-colors hover:text-primary"
                                        >
                                            {job.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                                            <div className="flex items-center gap-1 font-medium text-white/90">
                                                <Building2 className="h-4 w-4 text-text-secondary" />
                                                {job.company?.name || job.companyName || 'Company'}
                                            </div>
                                            {job.location && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    {job.location}
                                                </div>
                                            )}
                                            {job.jobType && (
                                                <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
                                                    {formatJobType(job.jobType)}
                                                </span>
                                            )}
                                            {job.salaryRange ? (
                                                <div className="flex items-center gap-1 text-success font-medium">
                                                    <CheckCircle className="h-4 w-4" />
                                                    {job.salaryRange}
                                                </div>
                                            ) : job.ctcFixed > 0 ? (
                                                <div className="flex items-center gap-1 text-success font-medium">
                                                    <CheckCircle className="h-4 w-4" />
                                                    {job.ctcFixed} LPA
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex w-full flex-shrink-0 flex-col gap-2 self-start md:w-auto md:items-end">
                                    <button
                                        type="button"
                                        onClick={() => navigate(isUserView ? `/user/jobs/${job.id}` : `/jobs/${job.id}`)}
                                        className="w-full rounded-xl bg-primary/10 border border-primary/30 px-6 py-2.5 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-background hover:shadow-[0_0_15px_rgba(77,163,255,0.4)] md:w-auto"
                                    >
                                        View Details
                                    </button>
                                    <p className="text-right text-xs font-medium text-text-secondary">
                                        {formatClosingDate(job.applicationDeadline)}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,1fr)]">
                                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:p-5">
                                    <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                                        About The Job
                                    </p>
                                    <p className="text-sm leading-relaxed text-white/70 line-clamp-3">
                                        {job.description || 'Role summary will be shared by the company soon.'}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:p-5">
                                    <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-success">
                                        Minimum Qualifications
                                    </p>
                                    {splitLineItems(job.minimumQualifications).length > 0 ? (
                                        <ul className="space-y-2 text-sm text-white/70">
                                            {splitLineItems(job.minimumQualifications)
                                                .slice(0, 3)
                                                .map((qualification, qualificationIndex) => (
                                                    <li key={qualificationIndex} className="flex gap-2.5">
                                                        <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-success" />
                                                        <span className="line-clamp-1">{qualification}</span>
                                                    </li>
                                                ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm leading-relaxed text-white/55">
                                            Qualification details will be updated by the hiring team.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {(job.requiredSkills || job.preferredQualifications) && (
                                <div className="grid gap-4 lg:grid-cols-2">
                                    {job.requiredSkills && (
                                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:p-5">
                                            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary">
                                                Skills
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {splitCommaItems(job.requiredSkills)
                                                    .slice(0, 8)
                                                    .map((skill, skillIndex) => (
                                                        <span
                                                            key={skillIndex}
                                                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {job.preferredQualifications && (
                                        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:p-5">
                                            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-secondary">
                                                Preferred Qualifications
                                            </p>
                                            <ul className="space-y-2 text-sm text-white/70">
                                                {splitLineItems(job.preferredQualifications)
                                                    .slice(0, 2)
                                                    .map((qualification, qualificationIndex) => (
                                                        <li key={qualificationIndex} className="flex gap-2.5">
                                                            <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-secondary" />
                                                            <span className="line-clamp-1">{qualification}</span>
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );

    if (isPublic) {
        return (
            <div className="relative min-h-screen overflow-hidden bg-background">
                {FilterModal}
                <div className="pointer-events-none absolute left-[-10%] top-[-20%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
                <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-secondary/20 blur-[150px]" />

                <TopNav />

                <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-32 sm:px-6 lg:px-8">
                    <div className="mx-auto mb-10 max-w-3xl text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-4 bg-gradient-to-r from-white to-white/70 bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
                        >
                            Find Your Next Big Opportunity
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-text-secondary"
                        >
                            Search by job title, skills, or keywords across hundreds of openings.
                        </motion.p>
                    </div>

                    <div className="mb-10 lg:mb-14">
                        {searchBar}
                    </div>

                    <div className="mx-auto w-full max-w-5xl">
                        {resultsContent}
                    </div>
                </div>
            </div>
        );
    }

    // User dashboard view
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8 p-4 md:p-6 lg:p-8 w-full max-w-7xl mx-auto">
            {FilterModal}
            
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Browse Jobs</h1>
                <p className="text-text-secondary">Discover opportunities without leaving your dashboard.</p>
            </div>

            <div className="w-full">
                {searchBar}
            </div>

            <section className={resultsShellClassName}>
                {resultsContent}
            </section>
        </motion.div>
    );
}
