import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

export default function SearchableDropdown({
    options,
    value,
    onChange,
    placeholder,
    disabled = false,
    labelKey = 'name',
    valueKey = 'name'
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter options based on search query
    const filteredOptions = options.filter(option =>
        (option[labelKey] || option).toString().toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedOption = options.find(opt => (opt[valueKey] || opt) === value);
    const displayValue = selectedOption ? (selectedOption[labelKey] || selectedOption) : '';

    return (
        <div className="relative" ref={dropdownRef}>
            <div
                className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-left flex items-center justify-between transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50 focus:ring-2 focus:ring-primary/50'
                    }`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={`block truncate ${!value ? 'text-text-secondary text-sm' : 'text-white text-sm'}`}>
                    {value ? displayValue : placeholder}
                </span>
                <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-background border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {/* Search Input */}
                    <div className="p-2 border-b border-white/5">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                            <input
                                type="text"
                                className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/5 rounded-lg text-sm text-white placeholder:text-text-secondary focus:outline-none focus:border-primary/50"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => {
                                const optValue = option[valueKey] || option;
                                const optLabel = option[labelKey] || option;
                                const isSelected = optValue === value;

                                return (
                                    <div
                                        key={index}
                                        className={`flex items-center justify-between px-3 py-2 cursor-pointer rounded-lg text-sm transition-colors ${isSelected ? 'bg-primary/20 text-primary font-medium' : 'text-text-secondary hover:bg-white/5 hover:text-white'
                                            }`}
                                        onClick={() => {
                                            onChange(optValue, option);
                                            setIsOpen(false);
                                            setSearchQuery('');
                                        }}
                                    >
                                        <span className="truncate">{optLabel}</span>
                                        {isSelected && <Check className="w-4 h-4" />}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="px-3 py-4 text-center text-sm text-text-secondary">
                                No results found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
