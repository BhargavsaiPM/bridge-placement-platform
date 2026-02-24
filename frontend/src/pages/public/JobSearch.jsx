import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { publicApi } from '../../api/publicApi';
import TopNav from '../../layout/TopNav';
import { Search, MapPin, Briefcase, Building2, CheckCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
    { value: '0-3', label: '0 – 3 LPA', min: 0, max: 3 },
    { value: '3-6', label: '3 – 6 LPA', min: 3, max: 6 },
    { value: '6-10', label: '6 – 10 LPA', min: 6, max: 10 },
    { value: '10-20', label: '10 – 20 LPA', min: 10, max: 20 },
    { value: '20+', label: '20+ LPA', min: 20, max: Infinity },
];

function FilterSection({ title, open, onToggle, children }) {
    return (
        <div className="border-b border-white/10 pb-4">
            <button
                type="button"
                onClick={onToggle}
                className="flex items-center justify-between w-full py-3 text-sm font-semibold text-white"
            >
                {title}
                {open ? <ChevronUp className="w-4 h-4 text-text-secondary" /> : <ChevronDown className="w-4 h-4 text-text-secondary" />}
            </button>
            {open && <div className="space-y-2 mt-1">{children}</div>}
        </div>
    );
}

function CheckboxOption({ checked, onChange, label }) {
    return (
        <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary/50"
            />
            <span className="text-sm text-text-secondary group-hover:text-white transition-colors">{label}</span>
        </label>
    );
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

    const toggleSection = (key) => setOpenSections(s => ({ ...s, [key]: !s[key] }));

    const toggleFilter = (val, list, setList) => {
        setList(list.includes(val) ? list.filter(v => v !== val) : [...list, val]);
    };

    const clearAll = () => {
        setKeyword(''); setLocation('');
        setSelectedTypes([]); setSelectedExp([]); setSelectedSalary([]);
    };

    const hasFilters = keyword || location || selectedTypes.length || selectedExp.length || selectedSalary.length;

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

    // Client-side filter whenever deps change
    useEffect(() => {
        let filtered = [...allJobs];

        // Keyword: search title, description, required skills
        if (keyword.trim()) {
            const kw = keyword.toLowerCase();
            filtered = filtered.filter(j =>
                j.title?.toLowerCase().includes(kw) ||
                j.description?.toLowerCase().includes(kw) ||
                j.requiredSkills?.toLowerCase().includes(kw)
            );
        }

        // Location
        if (location.trim()) {
            const loc = location.toLowerCase();
            filtered = filtered.filter(j => j.location?.toLowerCase().includes(loc));
        }

        // Job Type
        if (selectedTypes.length > 0) {
            filtered = filtered.filter(j => selectedTypes.includes(j.jobType));
        }

        // Experience Level — client-side using experienceRequired field
        if (selectedExp.length > 0) {
            const expFilters = EXPERIENCE_LEVELS.filter(e => selectedExp.includes(e.value));
            filtered = filtered.filter(j => {
                const exp = j.experienceRequired ?? 0;
                return expFilters.some(e => exp >= e.min && exp < e.max);
            });
        }

        // Salary Range
        if (selectedSalary.length > 0) {
            const salFilters = SALARY_RANGES.filter(s => selectedSalary.includes(s.value));
            filtered = filtered.filter(j => {
                const ctc = j.ctcFixed ?? 0;
                return salFilters.some(s => ctc >= s.min && (s.max === Infinity || ctc <= s.max));
            });
        }

        setJobs(filtered);
    }, [allJobs, keyword, location, selectedTypes, selectedExp, selectedSalary]);

    const handleApply = (jobId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        alert(`Application flow for job ${jobId} — coming soon!`);
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[150px] pointer-events-none"></div>

            <TopNav />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32 relative z-10">

                {/* Hero */}
                <div className="text-center max-w-3xl mx-auto mb-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-4"
                    >
                        Find Your Next Big Opportunity
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-text-secondary"
                    >
                        Search by job title, skills, or keywords across hundreds of openings.
                    </motion.p>
                </div>

                {/* Keyword Search Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="glass-panel p-3 mb-8 rounded-2xl md:rounded-full max-w-4xl mx-auto border border-white/10"
                >
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 flex items-center gap-3 px-4 py-2">
                            <Search className="text-primary w-5 h-5 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="Job title, skills, or keywords..."
                                className="bg-transparent border-none outline-none text-white w-full placeholder:text-white/30 text-sm"
                                value={keyword}
                                onChange={e => setKeyword(e.target.value)}
                            />
                            {keyword && (
                                <button onClick={() => setKeyword('')} className="text-text-secondary hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="hidden md:block w-px h-10 bg-white/10 self-center" />
                        <div className="flex-1 flex items-center gap-3 px-4 py-2">
                            <MapPin className="text-secondary w-5 h-5 flex-shrink-0" />
                            <input
                                type="text"
                                placeholder="City or location..."
                                className="bg-transparent border-none outline-none text-white w-full placeholder:text-white/30 text-sm"
                                value={location}
                                onChange={e => setLocation(e.target.value)}
                            />
                        </div>
                    </div>
                </motion.div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar Filters */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="glass-panel p-5 sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white">Filters</h3>
                                {hasFilters && (
                                    <button onClick={clearAll} className="text-xs text-primary hover:underline">Clear All</button>
                                )}
                            </div>

                            <div className="space-y-1">
                                <FilterSection title="Job Type" open={openSections.type} onToggle={() => toggleSection('type')}>
                                    {JOB_TYPES.map(t => (
                                        <CheckboxOption
                                            key={t.value}
                                            label={t.label}
                                            checked={selectedTypes.includes(t.value)}
                                            onChange={() => toggleFilter(t.value, selectedTypes, setSelectedTypes)}
                                        />
                                    ))}
                                </FilterSection>

                                <FilterSection title="Experience Level" open={openSections.exp} onToggle={() => toggleSection('exp')}>
                                    {EXPERIENCE_LEVELS.map(e => (
                                        <CheckboxOption
                                            key={e.value}
                                            label={e.label}
                                            checked={selectedExp.includes(e.value)}
                                            onChange={() => toggleFilter(e.value, selectedExp, setSelectedExp)}
                                        />
                                    ))}
                                </FilterSection>

                                <FilterSection title="Package / Salary" open={openSections.salary} onToggle={() => toggleSection('salary')}>
                                    {SALARY_RANGES.map(s => (
                                        <CheckboxOption
                                            key={s.value}
                                            label={s.label}
                                            checked={selectedSalary.includes(s.value)}
                                            onChange={() => toggleFilter(s.value, selectedSalary, setSelectedSalary)}
                                        />
                                    ))}
                                </FilterSection>
                            </div>
                        </div>
                    </aside>

                    {/* Job Listings */}
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
                            <h2 className="text-xl font-bold text-white">Search Results</h2>
                            <span className="text-sm bg-white/10 px-3 py-1 rounded-full text-text-secondary border border-white/10">
                                {loading ? '...' : `${jobs.length} Jobs Found`}
                            </span>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="glass-panel p-12 text-center">
                                <Briefcase className="w-12 h-12 text-text-secondary/50 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-white mb-2">No jobs matched your search.</h3>
                                <p className="text-text-secondary">Try adjusting filters or keywords.</p>
                            </div>
                        ) : (
                            jobs.map((job, idx) => (
                                <motion.div
                                    key={job.id || idx}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.04 }}
                                    className="glass-panel p-6 rounded-2xl group hover:border-primary/30 transition-colors flex flex-col md:flex-row gap-6 items-start"
                                >
                                    <div className="hidden md:flex w-14 h-14 rounded-xl bg-white/5 border border-white/10 items-center justify-center flex-shrink-0">
                                        <Building2 className="w-7 h-7 text-primary" />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{job.title}</h3>
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                                            <div className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> {job.company?.name || job.companyName || 'Company'}</div>
                                            {job.location && <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</div>}
                                            {job.jobType && <span className="px-2.5 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-medium">{job.jobType.replace(/_/g, ' ')}</span>}
                                            {job.ctcFixed > 0 && <div className="flex items-center gap-1 text-success"><CheckCircle className="w-3.5 h-3.5" /> {job.ctcFixed} LPA</div>}
                                        </div>
                                        {job.description && (
                                            <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">{job.description}</p>
                                        )}
                                        {job.requiredSkills && (
                                            <div className="flex flex-wrap gap-1.5 pt-1">
                                                {job.requiredSkills.split(',').slice(0, 5).map((sk, i) => sk.trim() && (
                                                    <span key={i} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-xs text-text-secondary">{sk.trim()}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2 self-center w-full md:w-auto flex-shrink-0">
                                        <button
                                            onClick={() => handleApply(job.id)}
                                            className="w-full md:w-auto px-5 py-2 bg-primary text-background font-bold hover:bg-primary/90 rounded-xl transition-colors text-sm shadow-[0_0_12px_rgba(77,163,255,0.3)]"
                                        >
                                            Apply Now
                                        </button>
                                        <p className="text-xs text-text-secondary text-right">
                                            {job.applicationDeadline
                                                ? `Closes ${new Date(job.applicationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`
                                                : 'Open Ended'}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
