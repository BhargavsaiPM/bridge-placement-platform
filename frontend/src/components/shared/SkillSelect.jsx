import React, { useState, useRef, useEffect } from 'react';
import { X, Search } from 'lucide-react';

const PREDEFINED_SKILLS = [
    "JavaScript", "Python", "Java", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin", "Go",
    "React", "Angular", "Vue.js", "Node.js", "Express", "Django", "Flask", "Spring Boot",
    "HTML", "CSS", "Tailwind CSS", "Bootstrap", "SQL", "MySQL", "PostgreSQL", "MongoDB",
    "Redis", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Git", "GitHub", "GitLab",
    "Agile", "Scrum", "Machine Learning", "Data Science", "AI", "DevOps", "Figma",
    "UI/UX Design", "Project Management", "Communication", "Leadership", "Problem Solving"
];

export default function SkillSelect({ selectedSkills, onChange }) {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Filter suggestions based on input
    useEffect(() => {
        if (!inputValue.trim()) {
            setSuggestions(PREDEFINED_SKILLS.filter(s => !selectedSkills.includes(s)));
            return;
        }

        const filtered = PREDEFINED_SKILLS.filter(skill =>
            skill.toLowerCase().includes(inputValue.toLowerCase()) &&
            !selectedSkills.includes(skill)
        );
        setSuggestions(filtered);
    }, [inputValue, selectedSkills]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const addSkill = (skill) => {
        if (!skill.trim()) return;

        // Prevent duplicates
        const formattedSkill = skill.trim();
        const lowerCaseSkills = selectedSkills.map(s => s.toLowerCase());

        if (!lowerCaseSkills.includes(formattedSkill.toLowerCase())) {
            onChange([...selectedSkills, formattedSkill]);
        }

        setInputValue('');
        setIsOpen(false);
    };

    const removeSkill = (skillToRemove) => {
        onChange(selectedSkills.filter(skill => skill !== skillToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addSkill(inputValue);
        } else if (e.key === 'Backspace' && inputValue === '' && selectedSkills.length > 0) {
            // Remove last skill on backspace if input is empty
            removeSkill(selectedSkills[selectedSkills.length - 1]);
        }
    };

    return (
        <div className="w-full relative" ref={wrapperRef}>
            <label className="block text-sm font-medium text-text-secondary mb-2">Skills</label>

            <div
                className="min-h-[50px] p-2 bg-white/5 border border-white/10 rounded-xl flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-primary/50 transition-all cursor-text"
                onClick={() => setIsOpen(true)}
            >
                {/* Selected Skill Chips */}
                {selectedSkills.map((skill, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-1 bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium"
                    >
                        <span>{skill}</span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                removeSkill(skill);
                            }}
                            className="hover:text-white transition-colors p-0.5"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {/* Input Field */}
                <div className="flex-1 min-w-[120px] flex items-center">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setIsOpen(true);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsOpen(true)}
                        className="w-full bg-transparent border-none outline-none text-white placeholder:text-text-secondary text-sm p-1"
                        placeholder={selectedSkills.length === 0 ? "Search or type skills..." : ""}
                    />
                </div>
            </div>

            {/* Dropdown Suggestions */}
            {isOpen && (suggestions.length > 0 || inputValue.trim()) && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-white/10 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.length > 0 ? (
                        <ul className="py-2">
                            {suggestions.map((skill, index) => (
                                <li
                                    key={index}
                                    onClick={() => addSkill(skill)}
                                    className="px-4 py-2 hover:bg-white/5 cursor-pointer text-text-primary text-sm transition-colors"
                                >
                                    {skill}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        inputValue.trim() && (
                            <div
                                className="px-4 py-3 text-sm text-text-secondary cursor-pointer hover:bg-white/5 transition-colors"
                                onClick={() => addSkill(inputValue)}
                            >
                                Press Enter to add "<span className="text-white font-medium">{inputValue}</span>"
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}
