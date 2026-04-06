import { getAssetUrl } from '../../api/runtime';

export const STATUS_CONFIG = {
    APPLIED: {
        label: 'Applied',
        color: 'text-warning',
        bg: 'bg-warning/10',
        border: 'border-warning/30',
        description: 'Fresh applications waiting for first review.',
    },
    SHORTLISTED: {
        label: 'Shortlisted',
        color: 'text-primary',
        bg: 'bg-primary/10',
        border: 'border-primary/30',
        description: 'Strong profiles kept for the next step.',
    },
    INTERVIEW: {
        label: 'Interview',
        color: 'text-secondary',
        bg: 'bg-secondary/10',
        border: 'border-secondary/30',
        description: 'Candidate moved into interview coordination.',
    },
    TECHNICAL_ROUND: {
        label: 'Technical Round',
        color: 'text-cyan-300',
        bg: 'bg-cyan-400/10',
        border: 'border-cyan-300/30',
        description: 'Candidate is ready for technical screening.',
    },
    REJECTED: {
        label: 'Rejected',
        color: 'text-danger',
        bg: 'bg-danger/10',
        border: 'border-danger/30',
        description: 'Candidate is not moving forward.',
    },
    SELECTED: {
        label: 'Selected',
        color: 'text-success',
        bg: 'bg-success/10',
        border: 'border-success/30',
        description: 'Candidate was marked as selected.',
    },
};

export const STATUS_FILTER_CARDS = [
    { key: 'ALL', label: 'All Applicants', description: 'See every application together' },
    { key: 'INTERVIEW', label: 'Interview', description: 'Interview stage' },
    { key: 'TECHNICAL_ROUND', label: 'Technical Round', description: 'Technical screening queue' },
    { key: 'REJECTED', label: 'Rejected', description: 'Closed applications' },
];

export const DETAIL_ACTIONS = [
    { status: 'SHORTLISTED', label: 'Shortlist', helper: 'Keep this candidate in the next pool' },
    { status: 'INTERVIEW', label: 'Move to Interview', helper: 'Ready for the interview stage' },
    { status: 'TECHNICAL_ROUND', label: 'Send to Technical Round', helper: 'Move into technical assessment' },
    { status: 'REJECTED', label: 'Reject', helper: 'Close this application' },
];

export const SORT_OPTIONS = [
    { key: 'APPLIED_ASC', label: 'Applied first -> latest' },
    { key: 'APPLIED_DESC', label: 'Latest apply first' },
    { key: 'NAME_ASC', label: 'Name A -> Z' },
];

export const splitTextList = (value) =>
    (value || '')
        .split(/[\n,]/)
        .map((item) => item.trim())
        .filter(Boolean);

export const normaliseValue = (value) => (value || '').toLowerCase().trim();

export const skillMatches = (left, right) => {
    const first = normaliseValue(left);
    const second = normaliseValue(right);
    return Boolean(first && second && (first.includes(second) || second.includes(first)));
};

export const getApplicationStatus = (application) =>
    (application?.status || application?.applicationStatus || 'APPLIED').toUpperCase();

export const getApplicantName = (application) =>
    application?.studentName
    || application?.user?.fullName
    || [application?.user?.firstName, application?.user?.lastName].filter(Boolean).join(' ')
    || 'Applicant';

export const getApplicantEmail = (application) =>
    application?.studentEmail || application?.user?.email || 'No email shared';

export const getApplicantPhone = (application) =>
    application?.studentMobile || application?.user?.mobile || application?.user?.mobileNumber || '';

export const getApplicantLocation = (application) =>
    [application?.user?.city, application?.user?.state].filter(Boolean).join(', ') || 'Location not shared';

export const getApplicantQualification = (application) => {
    const qualification = application?.user?.highestQualification;
    const specialization = application?.user?.specialization;
    if (qualification && specialization) {
        return `${qualification} in ${specialization}`;
    }
    return qualification || specialization || 'Qualification not shared';
};

export const formatAppliedDate = (value) =>
    value
        ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        : 'Not available';

export const formatAppliedTime = (value) =>
    value
        ? new Date(value).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
        : 'Not available';

export const formatExperience = (value) => {
    if (value === null || value === undefined) {
        return 'Not shared';
    }
    if (Number(value) === 0) {
        return 'Fresher';
    }
    return `${value}+ years`;
};

export const formatJobType = (value) => {
    if (!value) {
        return 'Not specified';
    }
    return value.replace(/_/g, ' ');
};

export const getResumeUrl = (resumePath) => {
    return getAssetUrl(resumePath);
};

export const getFitInsights = (application, scoreDetails) => {
    const applicantSkills = splitTextList(application?.user?.skills);
    const requiredSkills = splitTextList(application?.requiredSkills || application?.job?.requiredSkills);
    const preferredSkills = splitTextList(application?.preferredSkills || application?.job?.preferredSkills);

    const matchedRequired = requiredSkills.filter((requiredSkill) =>
        applicantSkills.some((skill) => skillMatches(skill, requiredSkill)));
    const missingRequired = requiredSkills.filter((requiredSkill) =>
        !matchedRequired.some((skill) => skillMatches(skill, requiredSkill)));
    const matchedPreferred = preferredSkills.filter((preferredSkill) =>
        applicantSkills.some((skill) => skillMatches(skill, preferredSkill)));

    const fallbackScore = requiredSkills.length > 0
        ? Math.round((matchedRequired.length / requiredSkills.length) * 100)
        : applicantSkills.length > 0
            ? 72
            : 0;

    const fitScore = scoreDetails?.ailsScore !== null && scoreDetails?.ailsScore !== undefined
        ? Math.round(scoreDetails.ailsScore)
        : fallbackScore;

    let recommendation = 'Needs closer manual review';
    if (fitScore >= 75) {
        recommendation = 'Strong fit for the next round';
    } else if (fitScore >= 50) {
        recommendation = 'Good fit worth shortlisting';
    }

    return {
        applicantSkills,
        requiredSkills,
        preferredSkills,
        matchedRequired,
        missingRequired,
        matchedPreferred,
        fitScore,
        recommendation,
        matchLevel: scoreDetails?.matchLevel || null,
        explanation: scoreDetails?.explanation || '',
        improvementSuggestions: Array.isArray(scoreDetails?.improvementSuggestions)
            ? scoreDetails.improvementSuggestions.filter(Boolean)
            : [],
    };
};

export const sortApplications = (applications, sortKey) => {
    const sortedApplications = [...applications];

    sortedApplications.sort((left, right) => {
        if (sortKey === 'NAME_ASC') {
            return getApplicantName(left).localeCompare(getApplicantName(right));
        }

        const leftTime = new Date(left.appliedAt || 0).getTime();
        const rightTime = new Date(right.appliedAt || 0).getTime();

        if (sortKey === 'APPLIED_DESC') {
            return rightTime - leftTime;
        }

        return leftTime - rightTime;
    });

    return sortedApplications;
};
