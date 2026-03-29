import React, { useState, useRef, useEffect } from 'react';
import { X, Search } from 'lucide-react';

const PREDEFINED_SKILLS = [
    "JavaScript", "TypeScript", "Python", "Java", "C", "C++", "C#", "Ruby", "PHP", "Swift", "Kotlin", "Go", "Rust",
    "React", "Angular", "Vue.js", "Next.js", "Node.js", "Express", "NestJS", "Django", "Flask", "FastAPI", "Spring Boot",
    "HTML", "CSS", "SASS", "Tailwind CSS", "Bootstrap", "Material UI",
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "Oracle", "Firebase",
    "REST APIs", "GraphQL", "Microservices", "JWT", "OAuth", "Postman",
    "Git", "GitHub", "GitLab", "CI/CD", "Jenkins", "Docker", "Kubernetes", "AWS", "Azure", "GCP", "Linux",
    "Data Structures", "Algorithms", "OOP", "DBMS", "Operating Systems", "Computer Networks",
    "Testing", "Manual Testing", "Automation Testing", "Selenium", "JUnit", "Cypress",
    "Machine Learning", "Deep Learning", "Data Science", "Data Analysis", "Power BI", "Tableau", "Excel",
    "AI", "DevOps", "Figma", "UI/UX Design", "Project Management", "Agile", "Scrum",
    "Communication", "Leadership", "Problem Solving", "Teamwork", "Critical Thinking"
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
            <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-sm font-medium text-text-secondary">Skills</label>
                <span className="text-xs text-text-secondary/80">
                    Search and add from suggestions or type your own
                </span>
            </div>

            <div
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-primary/50 transition-all cursor-text text-sm"
                onClick={() => setIsOpen(true)}
            >
                {/* Selected Skill Chips */}
                {selectedSkills.map((skill, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-1 bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-medium"
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
                    <Search className="mr-2 h-4 w-4 flex-shrink-0 text-text-secondary" />
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => {
                            setInputValue(e.target.value);
                            setIsOpen(true);
                        }}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsOpen(true)}
                        className="w-full bg-transparent border-none outline-none text-white placeholder:text-text-secondary p-0"
                        placeholder="Search skills like REST APIs, React, SQL..."
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
