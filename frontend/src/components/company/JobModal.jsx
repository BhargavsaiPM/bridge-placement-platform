import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function JobModal({ isOpen, onClose, onSave, jobToEdit }) {
    const isEditMode = !!jobToEdit;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        requiredSkills: '',
        experienceRequired: '',
        salaryRange: '',
        location: '',
        workMode: 'ONSITE',
        jobType: 'FULLTIME',
        applicationDeadline: '',
        maxApplicants: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (jobToEdit) {
            setFormData({
                title: jobToEdit.title || '',
                description: jobToEdit.description || '',
                requiredSkills: jobToEdit.requiredSkills || '',
                experienceRequired: jobToEdit.experienceRequired?.toString() || '',
                salaryRange: jobToEdit.salaryRange || '',
                location: jobToEdit.location || '',
                workMode: jobToEdit.workMode || 'ONSITE',
                jobType: jobToEdit.jobType || 'FULLTIME',
                applicationDeadline: jobToEdit.applicationDeadline ? new Date(jobToEdit.applicationDeadline).toISOString().split('T')[0] : '',
                maxApplicants: jobToEdit.maxApplicants?.toString() || ''
            });
        } else {
            setFormData({
                title: '', description: '', requiredSkills: '', experienceRequired: '',
                salaryRange: '', location: '', workMode: 'ONSITE', jobType: 'FULLTIME',
                applicationDeadline: '', maxApplicants: ''
            });
        }
        setError('');
    }, [jobToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                requiredSkills: formData.requiredSkills,
                experienceRequired: parseInt(formData.experienceRequired) || 0,
                salaryRange: formData.salaryRange,
                location: formData.location,
                workMode: formData.workMode,
                jobType: formData.jobType,
                applicationDeadline: formData.applicationDeadline,
                maxApplicants: formData.maxApplicants ? parseInt(formData.maxApplicants) : null
            };

            await onSave(payload, isEditMode ? jobToEdit.id : null);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message || "An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-success/50 transition-colors text-sm";
    const labelClass = "block text-xs font-medium text-text-secondary mb-1";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-background border border-white/10 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 mt-24 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            {isEditMode ? 'Edit Job Requisition' : 'Post New Job'}
                        </h2>
                        <p className="text-sm text-text-secondary">
                            {isEditMode ? 'Update the details for this position.' : 'Fill out the details to create a new job posting.'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-secondary hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <form id="jobForm" onSubmit={handleSubmit} className="space-y-6">

                        <div className="space-y-4">
                            <h3 className="font-semibold text-white border-b border-white/10 pb-2">Basic Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Job Title *</label>
                                    <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className={inputClass} placeholder="e.g. Software Engineer" />
                                </div>
                                <div>
                                    <label className={labelClass}>Job Type *</label>
                                    <select required value={formData.jobType} onChange={e => setFormData({ ...formData, jobType: e.target.value })} className={inputClass} >
                                        <option className="bg-background text-white" value="FULLTIME">Full Time</option>
                                        <option className="bg-background text-white" value="PART_TIME">Part Time</option>
                                        <option className="bg-background text-white" value="INTERNSHIP">Internship</option>
                                        <option className="bg-background text-white" value="WORK_FROM_HOME">Work From Home</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Description *</label>
                                    <textarea required rows={4} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className={inputClass} placeholder="Job description, requirements, responsibilities..." />
                                </div>
                                <div>
                                    <label className={labelClass}>Location *</label>
                                    <input required type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className={inputClass} placeholder="e.g. Bangalore, India" />
                                </div>
                                <div>
                                    <label className={labelClass}>Work Mode *</label>
                                    <select required value={formData.workMode} onChange={e => setFormData({ ...formData, workMode: e.target.value })} className={inputClass}>
                                        <option className="bg-background text-white" value="ONSITE">Onsite</option>
                                        <option className="bg-background text-white" value="REMOTE">Remote</option>
                                        <option className="bg-background text-white" value="HYBRID">Hybrid</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Application Deadline *</label>
                                    <input required type="date" value={formData.applicationDeadline} onChange={e => setFormData({ ...formData, applicationDeadline: e.target.value })} className={inputClass} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-white border-b border-white/10 pb-2">Skills & Compensation</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className={labelClass}>Required Skills *</label>
                                    <input required type="text" value={formData.requiredSkills} onChange={e => setFormData({ ...formData, requiredSkills: e.target.value })} className={inputClass} placeholder="e.g. Java, Spring Boot, React" />
                                </div>
                                <div>
                                    <label className={labelClass}>Experience Required (Years) *</label>
                                    <input required type="number" min="0" value={formData.experienceRequired} onChange={e => setFormData({ ...formData, experienceRequired: e.target.value })} className={inputClass} placeholder="e.g. 2" />
                                </div>
                                <div>
                                    <label className={labelClass}>Salary Range *</label>
                                    <input required type="text" value={formData.salaryRange} onChange={e => setFormData({ ...formData, salaryRange: e.target.value })} className={inputClass} placeholder="e.g. 8-12 LPA" />
                                </div>
                                <div>
                                    <label className={labelClass}>Max Applicants</label>
                                    <input type="number" min="1" value={formData.maxApplicants} onChange={e => setFormData({ ...formData, maxApplicants: e.target.value })} className={inputClass} placeholder="e.g. 100" />
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium text-sm border border-white/10"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="jobForm"
                        disabled={loading}
                        className="px-8 py-2 bg-success text-background font-bold hover:bg-success/90 rounded-xl transition-colors flex items-center justify-center min-w-[120px]"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                            isEditMode ? 'Save Changes' : 'Post Job'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
