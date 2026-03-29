import React, { useEffect, useMemo, useState } from 'react';
import {
    BriefcaseBusiness,
    ClipboardList,
    Plus,
    Search,
    ShieldCheck,
    Sparkles,
    UserCheck,
    X,
} from 'lucide-react';

const SKILL_OPTIONS = [
    'Java',
    'Spring Boot',
    'React',
    'Node.js',
    'JavaScript',
    'TypeScript',
    'Python',
    'C++',
    'SQL',
    'MySQL',
    'PostgreSQL',
    'MongoDB',
    'AWS',
    'Azure',
    'Docker',
    'Kubernetes',
    'Microservices',
    'REST APIs',
    'GraphQL',
    'Git',
    'CI/CD',
    'System Design',
    'Data Structures',
    'Algorithms',
    'Machine Learning',
    'Power BI',
    'Excel',
    'Tableau',
    'Figma',
    'UI/UX',
    'Manual Testing',
    'Automation Testing',
    'Selenium',
    'DevOps',
    'Linux',
    'Networking',
    'Communication',
    'Problem Solving',
    'Leadership',
];

const ROUND_OPTIONS = [
    { value: 'APTITUDE', label: 'Aptitude' },
    { value: 'TECHNICAL', label: 'Technical' },
    { value: 'HR', label: 'HR' },
    { value: 'OTHER', label: 'Other' },
];

const emptyForm = {
    title: '',
    description: '',
    minimumQualifications: '',
    preferredQualifications: '',
    requiredSkills: [],
    preferredSkills: [],
    experienceRequired: '',
    salaryRange: '',
    location: '',
    workMode: 'ONSITE',
    jobType: 'FULLTIME',
    applicationDeadline: '',
    maxApplicants: '',
    assignedOfficerIds: [],
    rounds: [],
};

const parseSkillString = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (!value) return [];
    return value
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);
};

const parseAssignedOfficers = (jobToEdit) =>
    Array.isArray(jobToEdit?.assignedOfficers)
        ? jobToEdit.assignedOfficers
              .map((officer) => officer?.id)
              .filter((id) => id !== null && id !== undefined)
        : [];

function SkillSelector({
    label,
    selectedSkills,
    onChange,
    required = false,
    helperText,
    placeholder,
}) {
    const [query, setQuery] = useState('');

    const suggestions = useMemo(() => {
        const selected = new Set(selectedSkills.map((skill) => skill.toLowerCase()));
        return SKILL_OPTIONS.filter((skill) => {
            if (selected.has(skill.toLowerCase())) return false;
            if (!query.trim()) return true;
            return skill.toLowerCase().includes(query.trim().toLowerCase());
        }).slice(0, 10);
    }, [query, selectedSkills]);

    const addSkill = (rawSkill) => {
        const skill = rawSkill.trim();
        if (!skill) return;

        const alreadyAdded = selectedSkills.some(
            (selectedSkill) => selectedSkill.toLowerCase() === skill.toLowerCase()
        );

        if (alreadyAdded) {
            setQuery('');
            return;
        }

        onChange([...selectedSkills, skill]);
        setQuery('');
    };

    const removeSkill = (skillToRemove) => {
        onChange(selectedSkills.filter((skill) => skill !== skillToRemove));
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            if (query.trim()) {
                addSkill(query);
            }
        }
    };

    return (
        <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-text-secondary">
                {label}
                {required ? ' *' : ''}
            </label>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/10 bg-background/40 px-3 py-2">
                    <Search className="h-4 w-4 text-text-secondary" />
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/30"
                        placeholder={placeholder}
                    />
                    {query.trim() && (
                        <button
                            type="button"
                            onClick={() => addSkill(query)}
                            className="inline-flex items-center gap-1 rounded-full border border-success/25 bg-success/15 px-2.5 py-1 text-xs font-medium text-success transition-colors hover:bg-success/20"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add
                        </button>
                    )}
                </div>

                <div className="mb-3 flex flex-wrap gap-2">
                    {selectedSkills.length > 0 ? (
                        selectedSkills.map((skill) => (
                            <span
                                key={skill}
                                className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                            >
                                {skill}
                                <button
                                    type="button"
                                    onClick={() => removeSkill(skill)}
                                    className="text-primary/80 transition-colors hover:text-white"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </span>
                        ))
                    ) : (
                        <p className="text-xs text-text-secondary/70">No skills selected yet.</p>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    {suggestions.map((skill) => (
                        <button
                            key={skill}
                            type="button"
                            onClick={() => addSkill(skill)}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-text-secondary transition-colors hover:border-primary/25 hover:bg-primary/10 hover:text-primary"
                        >
                            {skill}
                        </button>
                    ))}
                </div>
            </div>

            {helperText && <p className="mt-2 text-xs leading-relaxed text-text-secondary/80">{helperText}</p>}
        </div>
    );
}

function OfficerAssignmentSelector({ officers, selectedOfficerIds, onChange }) {
    const toggleOfficer = (officerId) => {
        const isSelected = selectedOfficerIds.includes(officerId);
        onChange(
            isSelected
                ? selectedOfficerIds.filter((id) => id !== officerId)
                : [...selectedOfficerIds, officerId]
        );
    };

    return (
        <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-text-secondary">
                Assigned Placement Officers
            </label>

            {officers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-warning/30 bg-warning/10 px-4 py-4 text-sm text-warning">
                    Add placement officers and get them approved by admin first. Then you can assign one or more officers to manage this job.
                </div>
            ) : (
                <div className="grid gap-3 md:grid-cols-2">
                    {officers.map((officer) => {
                        const selected = selectedOfficerIds.includes(officer.id);
                        return (
                            <button
                                key={officer.id}
                                type="button"
                                onClick={() => toggleOfficer(officer.id)}
                                className={`rounded-2xl border p-4 text-left transition-all ${
                                    selected
                                        ? 'border-success/40 bg-success/10 shadow-[0_0_18px_rgba(44,230,179,0.12)]'
                                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="font-semibold text-white">{officer.name}</p>
                                        <p className="mt-1 text-xs text-text-secondary">{officer.email}</p>
                                        {officer.jobRole && (
                                            <p className="mt-2 text-xs text-primary">{officer.jobRole}</p>
                                        )}
                                    </div>
                                    <div
                                        className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                                            selected
                                                ? 'border-success bg-success text-background'
                                                : 'border-white/15 text-text-secondary'
                                        }`}
                                    >
                                        <ShieldCheck className="h-3.5 w-3.5" />
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}

            <p className="mt-2 text-xs leading-relaxed text-text-secondary/80">
                Selected officers will see this role in their Manage Jobs section and can work on applicant handling together.
            </p>
        </div>
    );
}

export default function JobModal({ isOpen, onClose, onSave, jobToEdit, officers = [] }) {
    const isEditMode = Boolean(jobToEdit);
    const [formData, setFormData] = useState(emptyForm);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const activeOfficers = useMemo(
        () => officers.filter((officer) => officer.active !== false && officer.blocked !== true && officer.approved !== false),
        [officers]
    );

    useEffect(() => {
        if (!isOpen) return;

        if (jobToEdit) {
            setFormData({
                title: jobToEdit.title || '',
                description: jobToEdit.description || '',
                minimumQualifications: jobToEdit.minimumQualifications || '',
                preferredQualifications: jobToEdit.preferredQualifications || '',
                requiredSkills: parseSkillString(jobToEdit.requiredSkills),
                preferredSkills: parseSkillString(jobToEdit.preferredSkills),
                experienceRequired: jobToEdit.experienceRequired?.toString() || '',
                salaryRange: jobToEdit.salaryRange || '',
                location: jobToEdit.location || '',
                workMode: jobToEdit.workMode || 'ONSITE',
                jobType: jobToEdit.jobType || 'FULLTIME',
                applicationDeadline: jobToEdit.applicationDeadline
                    ? new Date(jobToEdit.applicationDeadline).toISOString().split('T')[0]
                    : '',
                maxApplicants: jobToEdit.maxApplicants?.toString() || '',
                assignedOfficerIds: parseAssignedOfficers(jobToEdit),
                rounds: Array.isArray(jobToEdit.rounds)
                    ? jobToEdit.rounds
                          .slice()
                          .sort((a, b) => (a.roundOrder || 0) - (b.roundOrder || 0))
                          .map((r) => r.roundName)
                    : [],
            });
        } else {
            setFormData({ ...emptyForm, requiredSkills: [], preferredSkills: [], assignedOfficerIds: [], rounds: [] });
        }

        setError('');
    }, [jobToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');

        if (formData.requiredSkills.length === 0) {
            setError('Please select at least one required skill.');
            return;
        }

        if (activeOfficers.length > 0 && formData.assignedOfficerIds.length === 0) {
            setError('Please assign this job to at least one active placement officer.');
            return;
        }

        setLoading(true);

        try {
            const payload = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                minimumQualifications: formData.minimumQualifications.trim(),
                preferredQualifications: formData.preferredQualifications.trim(),
                requiredSkills: formData.requiredSkills.join(', '),
                preferredSkills: formData.preferredSkills.join(', '),
                experienceRequired: parseInt(formData.experienceRequired, 10) || 0,
                salaryRange: formData.salaryRange.trim(),
                location: formData.location.trim(),
                workMode: formData.workMode,
                jobType: formData.jobType,
                applicationDeadline: formData.applicationDeadline,
                maxApplicants: formData.maxApplicants ? parseInt(formData.maxApplicants, 10) : null,
                assignedOfficerIds: formData.assignedOfficerIds,
                rounds: formData.rounds,
            };

            await onSave(payload, isEditMode ? jobToEdit.id : null);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-success/50';
    const labelClass = 'mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-text-secondary';
    const helperClass = 'mt-2 text-xs leading-relaxed text-text-secondary/80';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/80 p-4 backdrop-blur-sm">
            <div className="my-8 flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-[30px] border border-white/10 bg-background shadow-2xl">
                <div className="shrink-0 border-b border-white/10 p-6">
                    <div className="flex items-start justify-between gap-6">
                        <div>
                            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-success">
                                <Sparkles className="h-3.5 w-3.5" />
                                Company Careers
                            </div>
                            <h2 className="text-2xl font-bold text-white">
                                {isEditMode ? 'Edit Job Posting' : 'Post A New Role'}
                            </h2>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">
                                Create a polished job post, then assign one or more placement officers who will manage the hiring workflow.
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-full p-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="custom-scrollbar overflow-y-auto p-6">
                    {error && (
                        <div className="mb-6 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm font-medium text-danger">
                            {error}
                        </div>
                    )}

                    <form id="jobForm" onSubmit={handleSubmit} className="space-y-8">
                        <section className="space-y-5">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-success/10 text-success">
                                    <BriefcaseBusiness className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Role Basics</h3>
                                    <p className="text-xs text-text-secondary">
                                        Define the role, format, and core hiring details.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Job Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className={inputClass}
                                        placeholder="e.g. Software Engineer, Data Analyst Intern"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Type Of Job</label>
                                    <select
                                        required
                                        value={formData.jobType}
                                        onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                                        className={inputClass}
                                    >
                                        <option className="bg-background text-white" value="FULLTIME">Full Time</option>
                                        <option className="bg-background text-white" value="PART_TIME">Part Time</option>
                                        <option className="bg-background text-white" value="INTERNSHIP">Internship</option>
                                        <option className="bg-background text-white" value="WORK_FROM_HOME">Work From Home</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>Location</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className={inputClass}
                                        placeholder="e.g. Bengaluru, India"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Work Mode</label>
                                    <select
                                        required
                                        value={formData.workMode}
                                        onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                                        className={inputClass}
                                    >
                                        <option className="bg-background text-white" value="ONSITE">Onsite</option>
                                        <option className="bg-background text-white" value="REMOTE">Remote</option>
                                        <option className="bg-background text-white" value="HYBRID">Hybrid</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>Experience Required</label>
                                    <input
                                        required
                                        type="number"
                                        min="0"
                                        value={formData.experienceRequired}
                                        onChange={(e) => setFormData({ ...formData, experienceRequired: e.target.value })}
                                        className={inputClass}
                                        placeholder="e.g. 0, 2, 5"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Application Deadline</label>
                                    <input
                                        required
                                        type="date"
                                        value={formData.applicationDeadline}
                                        onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Compensation</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.salaryRange}
                                        onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                                        className={inputClass}
                                        placeholder="e.g. 12-18 LPA or Stipend 45,000 / month"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Max Applicants</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.maxApplicants}
                                        onChange={(e) => setFormData({ ...formData, maxApplicants: e.target.value })}
                                        className={inputClass}
                                        placeholder="e.g. 200"
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-5">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                                    <UserCheck className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Officer Assignment</h3>
                                    <p className="text-xs text-text-secondary">
                                        Choose the officers who will own screening and job coordination for this role.
                                    </p>
                                </div>
                            </div>

                            <OfficerAssignmentSelector
                                officers={activeOfficers}
                                selectedOfficerIds={formData.assignedOfficerIds}
                                onChange={(assignedOfficerIds) => setFormData({ ...formData, assignedOfficerIds })}
                            />
                        </section>

                        <section className="space-y-5">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-warning/10 text-warning">
                                    <ClipboardList className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Hiring Rounds</h3>
                                    <p className="text-xs text-text-secondary">
                                        Select the interview rounds candidates will go through. The order follows your selection.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                {ROUND_OPTIONS.map((round) => {
                                    const isSelected = formData.rounds.includes(round.value);
                                    return (
                                        <button
                                            key={round.value}
                                            type="button"
                                            onClick={() => {
                                                if (isSelected) {
                                                    setFormData({ ...formData, rounds: formData.rounds.filter((r) => r !== round.value) });
                                                } else {
                                                    setFormData({ ...formData, rounds: [...formData.rounds, round.value] });
                                                }
                                            }}
                                            className={`rounded-2xl border px-4 py-3 text-sm font-medium transition-all ${
                                                isSelected
                                                    ? 'border-warning/40 bg-warning/15 text-warning shadow-[0_0_12px_rgba(255,193,7,0.12)]'
                                                    : 'border-white/10 bg-white/5 text-text-secondary hover:border-white/20 hover:bg-white/10'
                                            }`}
                                        >
                                            {isSelected && <span className="mr-1">✓</span>}
                                            {round.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {formData.rounds.length > 0 && (
                                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                                    <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-text-secondary">Round Order</p>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.rounds.map((roundValue, index) => (
                                            <span
                                                key={roundValue}
                                                className="inline-flex items-center gap-2 rounded-full border border-warning/20 bg-warning/10 px-3 py-1 text-xs font-medium text-warning"
                                            >
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-warning/20 text-[10px] font-bold">
                                                    {index + 1}
                                                </span>
                                                {ROUND_OPTIONS.find((r) => r.value === roundValue)?.label || roundValue}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="space-y-5">
                            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                                    <ClipboardList className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Role Overview</h3>
                                    <p className="text-xs text-text-secondary">
                                        Write this like a careers page summary a candidate can scan quickly.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>About The Job</label>
                                <textarea
                                    required
                                    rows={5}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className={`${inputClass} min-h-[150px] resize-y leading-relaxed`}
                                    placeholder="Describe the role, team, impact, and what the candidate will work on."
                                />
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Minimum Qualifications</label>
                                    <textarea
                                        required
                                        rows={6}
                                        value={formData.minimumQualifications}
                                        onChange={(e) =>
                                            setFormData({ ...formData, minimumQualifications: e.target.value })
                                        }
                                        className={`${inputClass} min-h-[180px] resize-y leading-relaxed`}
                                        placeholder={`Mention one point per line:\nBachelor's degree in Computer Science or related field\n0-2 years of software development experience\nStrong problem-solving and communication skills`}
                                    />
                                    <p className={helperClass}>Add each qualification on a new line for a careers-style format.</p>
                                </div>

                                <div>
                                    <label className={labelClass}>Preferred Qualifications</label>
                                    <textarea
                                        rows={6}
                                        value={formData.preferredQualifications}
                                        onChange={(e) =>
                                            setFormData({ ...formData, preferredQualifications: e.target.value })
                                        }
                                        className={`${inputClass} min-h-[180px] resize-y leading-relaxed`}
                                        placeholder={`Optional points:\nExperience building cloud-native products\nInternship or project work in large-scale systems\nFamiliarity with Git, CI/CD, or testing practices`}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <SkillSelector
                                    label="Required Skills"
                                    required
                                    selectedSkills={formData.requiredSkills}
                                    onChange={(skills) => setFormData({ ...formData, requiredSkills: skills })}
                                    placeholder="Search or add a required skill"
                                    helperText="Select skills like LinkedIn tags. You can also type a custom skill and press Enter."
                                />

                                <SkillSelector
                                    label="Preferred Skills"
                                    selectedSkills={formData.preferredSkills}
                                    onChange={(skills) => setFormData({ ...formData, preferredSkills: skills })}
                                    placeholder="Search or add a preferred skill"
                                    helperText="Optional bonus skills that give candidates an extra edge."
                                />
                            </div>
                        </section>
                    </form>
                </div>

                <div className="flex shrink-0 justify-end gap-3 border-t border-white/10 p-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-white/10 bg-white/5 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="jobForm"
                        disabled={loading}
                        className="flex min-w-[140px] items-center justify-center rounded-xl bg-success px-8 py-2 text-sm font-bold text-background transition-colors hover:bg-success/90"
                    >
                        {loading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        ) : isEditMode ? (
                            'Save Changes'
                        ) : (
                            'Post Job'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
