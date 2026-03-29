import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Briefcase,
    Building2,
    CheckCircle,
    ChevronDown,
    ChevronUp,
    MapPin,
    Search,
    X,
} from 'lucide-react';
import { publicApi } from '../../api/publicApi';
import TopNav from '../../layout/TopNav';

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

function FilterSection({ title, open, onToggle, children }) {
    return (
        <div className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between py-3 text-sm font-semibold text-white"
            >
                {title}
                {open ? (
                    <ChevronUp className="h-4 w-4 text-text-secondary" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-text-secondary" />
                )}
            </button>
            {open && <div className="mt-1 space-y-2">{children}</div>}
        </div>
    );
}

function CheckboxOption({ checked, onChange, label }) {
    return (
        <label className="group flex cursor-pointer items-center gap-2.5">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
            />
            <span className="text-sm text-text-secondary transition-colors group-hover:text-white">{label}</span>
        </label>
    );
}

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

export default function JobSearch() {
    const [jobs, setJobs] = useState([]);
    const [allJobs, setAllJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [keyword, setKeyword] = useState('');
    const [location, setLocation] = useState('');
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedExp, setSelectedExp] = useState([]);
    const [selectedSalary, setSelectedSalary] = useState([]);
    const [openSections, setOpenSections] = useState({ type: true, exp: true, salary: true });

    const navigate = useNavigate();
    const routerLocation = useLocation();
    const isUserView = routerLocation.pathname.startsWith('/user');
    const isPublic = !isUserView;

    const toggleSection = (key) => {
        setOpenSections((current) => ({ ...current, [key]: !current[key] }));
    };

    const toggleFilter = (value, list, setList) => {
        setList(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
    };

    const clearAll = () => {
        setKeyword('');
        setLocation('');
        setSelectedTypes([]);
        setSelectedExp([]);
        setSelectedSalary([]);
    };

    const hasFilters =
        keyword.trim() ||
        location.trim() ||
        selectedTypes.length ||
        selectedExp.length ||
        selectedSalary.length;

    const activeFilterCount =
        selectedTypes.length +
        selectedExp.length +
        selectedSalary.length +
        (keyword.trim() ? 1 : 0) +
        (location.trim() ? 1 : 0);

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

    const filterPanelClassName = isUserView
        ? 'glass-panel rounded-[28px] border border-white/10 bg-surface/70 p-5 xl:sticky xl:top-6'
        : 'glass-panel sticky top-24 rounded-[28px] border border-white/10 bg-surface/60 p-5';

    const resultsShellClassName = isUserView
        ? 'glass-panel rounded-[32px] border border-white/10 bg-surface/65 p-6'
        : '';

    const jobCardClassName = isUserView
        ? 'rounded-[28px] border border-white/10 bg-white/[0.04] p-6 transition-all duration-300 hover:border-primary/30 hover:bg-white/[0.06]'
        : 'glass-panel rounded-2xl p-6 transition-colors hover:border-primary/30';

    const emptyStateClassName = isUserView
        ? 'rounded-[28px] border border-white/10 bg-background/40 px-6 py-16 text-center'
        : 'glass-panel rounded-[28px] border border-white/10 bg-surface/55 p-12 text-center';

    const searchBar = (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={`glass-panel border border-white/10 p-3 ${
                isUserView
                    ? 'rounded-[28px] bg-surface/70'
                    : 'mx-auto max-w-4xl rounded-2xl bg-surface/60 md:rounded-full'
            }`}
        >
            <div className="flex flex-col gap-3 md:flex-row">
                <div className="flex flex-1 items-center gap-3 px-4 py-2">
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
                <div className="flex flex-1 items-center gap-3 px-4 py-2">
                    <MapPin className="h-5 w-5 flex-shrink-0 text-secondary" />
                    <input
                        type="text"
                        placeholder="City or location..."
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                    />
                </div>
            </div>
        </motion.div>
    );

    const resultsContent = (
        <>
            <div className={`flex items-center justify-between ${isUserView ? 'mb-5' : 'mb-4 border-b border-white/10 pb-4'}`}>
                <div>
                    <h2 className="text-xl font-bold text-white">Search Results</h2>
                    {isUserView && (
                        <p className="mt-1 text-sm text-text-secondary">
                            Explore roles that match your skills, interests, and preferred location.
                        </p>
                    )}
                </div>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-text-secondary">
                    {loading ? '...' : `${jobs.length} Jobs Found`}
                </span>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            ) : jobs.length === 0 ? (
                <div className={emptyStateClassName}>
                    <Briefcase className="mx-auto mb-4 h-12 w-12 text-text-secondary/50" />
                    <h3 className="mb-2 text-lg font-medium text-white">No jobs matched your search.</h3>
                    <p className="text-text-secondary">Try adjusting filters or keywords.</p>
                </div>
            ) : (
                <div className="space-y-4">
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
                                            className="cursor-pointer text-lg font-bold text-white transition-colors hover:text-primary"
                                        >
                                            {job.title}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                                            <div className="flex items-center gap-1">
                                                <Building2 className="h-3.5 w-3.5" />
                                                {job.company?.name || job.companyName || 'Company'}
                                            </div>
                                            {job.location && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {job.location}
                                                </div>
                                            )}
                                            {job.jobType && (
                                                <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                                                    {formatJobType(job.jobType)}
                                                </span>
                                            )}
                                            {job.salaryRange ? (
                                                <div className="flex items-center gap-1 text-success">
                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                    {job.salaryRange}
                                                </div>
                                            ) : job.ctcFixed > 0 ? (
                                                <div className="flex items-center gap-1 text-success">
                                                    <CheckCircle className="h-3.5 w-3.5" />
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
                                        className="w-full rounded-xl bg-primary px-5 py-2 text-sm font-bold text-background shadow-[0_0_12px_rgba(77,163,255,0.3)] transition-colors hover:bg-primary/90 md:w-auto"
                                    >
                                        View Details
                                    </button>
                                    <p className="text-right text-xs text-text-secondary">
                                        {formatClosingDate(job.applicationDeadline)}
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,1fr)]">
                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                                        About The Job
                                    </p>
                                    <p className="text-sm leading-7 text-white/70">
                                        {job.description || 'Role summary will be shared by the company soon.'}
                                    </p>
                                </div>

                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-success">
                                        Minimum Qualifications
                                    </p>
                                    {splitLineItems(job.minimumQualifications).length > 0 ? (
                                        <ul className="space-y-2 text-sm text-white/70">
                                            {splitLineItems(job.minimumQualifications)
                                                .slice(0, 4)
                                                .map((qualification, qualificationIndex) => (
                                                    <li key={qualificationIndex} className="flex gap-2">
                                                        <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-success" />
                                                        <span>{qualification}</span>
                                                    </li>
                                                ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm leading-7 text-white/55">
                                            Qualification details will be updated by the hiring team.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {(job.requiredSkills || job.preferredQualifications) && (
                                <div className="grid gap-4 lg:grid-cols-2">
                                    {job.requiredSkills && (
                                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-text-secondary">
                                                Skills
                                            </p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {splitCommaItems(job.requiredSkills)
                                                    .slice(0, 8)
                                                    .map((skill, skillIndex) => (
                                                        <span
                                                            key={skillIndex}
                                                            className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-text-secondary"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                            </div>
                                        </div>
                                    )}

                                    {job.preferredQualifications && (
                                        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                                                Preferred Qualifications
                                            </p>
                                            <ul className="space-y-2 text-sm text-white/70">
                                                {splitLineItems(job.preferredQualifications)
                                                    .slice(0, 3)
                                                    .map((qualification, qualificationIndex) => (
                                                        <li key={qualificationIndex} className="flex gap-2">
                                                            <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-secondary" />
                                                            <span>{qualification}</span>
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
        </>
    );

    if (isPublic) {
        return (
            <div className="relative min-h-screen overflow-hidden bg-background">
                <div className="pointer-events-none absolute left-[-10%] top-[-20%] h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px]" />
                <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-secondary/20 blur-[150px]" />

                <TopNav />

                <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-32 sm:px-6 lg:px-8">
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

                    {searchBar}

                    <div className="mt-8 flex flex-col gap-8 lg:flex-row">
                        <aside className="lg:w-64 lg:flex-shrink-0">
                            <div className={filterPanelClassName}>
                                <div className="mb-4 flex items-center justify-between">
                                    <h3 className="font-bold text-white">Filters</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-text-secondary">{activeFilterCount}</span>
                                        {hasFilters && (
                                            <button
                                                type="button"
                                                onClick={clearAll}
                                                className="text-xs text-primary transition-colors hover:underline"
                                            >
                                                Clear All
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <FilterSection
                                        title="Job Type"
                                        open={openSections.type}
                                        onToggle={() => toggleSection('type')}
                                    >
                                        {JOB_TYPES.map((type) => (
                                            <CheckboxOption
                                                key={type.value}
                                                label={type.label}
                                                checked={selectedTypes.includes(type.value)}
                                                onChange={() => toggleFilter(type.value, selectedTypes, setSelectedTypes)}
                                            />
                                        ))}
                                    </FilterSection>

                                    <FilterSection
                                        title="Experience Level"
                                        open={openSections.exp}
                                        onToggle={() => toggleSection('exp')}
                                    >
                                        {EXPERIENCE_LEVELS.map((level) => (
                                            <CheckboxOption
                                                key={level.value}
                                                label={level.label}
                                                checked={selectedExp.includes(level.value)}
                                                onChange={() => toggleFilter(level.value, selectedExp, setSelectedExp)}
                                            />
                                        ))}
                                    </FilterSection>

                                    <FilterSection
                                        title="Package / Salary"
                                        open={openSections.salary}
                                        onToggle={() => toggleSection('salary')}
                                    >
                                        {SALARY_RANGES.map((range) => (
                                            <CheckboxOption
                                                key={range.value}
                                                label={range.label}
                                                checked={selectedSalary.includes(range.value)}
                                                onChange={() => toggleFilter(range.value, selectedSalary, setSelectedSalary)}
                                            />
                                        ))}
                                    </FilterSection>
                                </div>
                            </div>
                        </aside>

                        <div className="flex-1">{resultsContent}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 p-4 md:p-6">
            <div>
                <h1 className="text-3xl font-bold text-white mb-1">Browse Jobs</h1>
                <p className="text-text-secondary">Discover opportunities without leaving your student dashboard.</p>
            </div>

            {searchBar}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
                <aside>
                    <div className={filterPanelClassName}>
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-white">Filters</h3>
                                <p className="mt-1 text-xs text-text-secondary">Refine by role, experience, and package.</p>
                            </div>
                            <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-xs font-medium text-text-secondary">
                                {activeFilterCount}
                            </span>
                        </div>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearAll}
                                className="mb-4 text-xs font-medium text-primary transition-colors hover:underline"
                            >
                                Clear all filters
                            </button>
                        )}

                        <div className="space-y-1">
                            <FilterSection title="Job Type" open={openSections.type} onToggle={() => toggleSection('type')}>
                                {JOB_TYPES.map((type) => (
                                    <CheckboxOption
                                        key={type.value}
                                        label={type.label}
                                        checked={selectedTypes.includes(type.value)}
                                        onChange={() => toggleFilter(type.value, selectedTypes, setSelectedTypes)}
                                    />
                                ))}
                            </FilterSection>

                            <FilterSection
                                title="Experience Level"
                                open={openSections.exp}
                                onToggle={() => toggleSection('exp')}
                            >
                                {EXPERIENCE_LEVELS.map((level) => (
                                    <CheckboxOption
                                        key={level.value}
                                        label={level.label}
                                        checked={selectedExp.includes(level.value)}
                                        onChange={() => toggleFilter(level.value, selectedExp, setSelectedExp)}
                                    />
                                ))}
                            </FilterSection>

                            <FilterSection
                                title="Package / Salary"
                                open={openSections.salary}
                                onToggle={() => toggleSection('salary')}
                            >
                                {SALARY_RANGES.map((range) => (
                                    <CheckboxOption
                                        key={range.value}
                                        label={range.label}
                                        checked={selectedSalary.includes(range.value)}
                                        onChange={() => toggleFilter(range.value, selectedSalary, setSelectedSalary)}
                                    />
                                ))}
                            </FilterSection>
                        </div>
                    </div>
                </aside>

                <section className={resultsShellClassName}>{resultsContent}</section>
            </div>
        </motion.div>
    );
}
