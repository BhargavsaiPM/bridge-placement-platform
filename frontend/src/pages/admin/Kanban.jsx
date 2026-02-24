import React, { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';

const COLUMNS = [
    { id: 'APPLIED', title: 'Applied', color: 'border-text-secondary' },
    { id: 'SHORTLISTED', title: 'Shortlisted', color: 'border-primary' },
    { id: 'INTERVIEW', title: 'Interview', color: 'border-warning' },
    { id: 'SELECTED', title: 'Selected', color: 'border-success' },
    { id: 'REJECTED', title: 'Rejected', color: 'border-danger' },
];

export default function Kanban() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [draggedItem, setDraggedItem] = useState(null);

    useEffect(() => {
        adminApi.getStudentProgress()
            .then(res => setStudents(Array.isArray(res.data) ? res.data : []))
            .catch(err => console.error("Failed to load kanban", err))
            .finally(() => setLoading(false));
    }, []);

    const handleDragStart = (e, student) => {
        setDraggedItem(student);
        e.dataTransfer.effectAllowed = 'move';
        // Small delay to prevent the dragged image from capturing the hidden state
        setTimeout(() => {
            e.target.style.opacity = '0.5';
        }, 0);
    };

    const handleDragEnd = (e) => {
        e.target.style.opacity = '1';
        setDraggedItem(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e, columnId) => {
        e.preventDefault();
        if (!draggedItem || draggedItem.status === columnId) return;

        // Optimistic UI update
        const previousStatus = draggedItem.status;
        setStudents(prev => prev.map(s => s.id === draggedItem.id ? { ...s, status: columnId } : s));

        try {
            await adminApi.updateStudentProgress(draggedItem.id, { status: columnId });
        } catch (err) {
            console.error("Failed to map progress", err);
            // Revert on failure
            setStudents(prev => prev.map(s => s.id === draggedItem.id ? { ...s, status: previousStatus } : s));
        }
        setDraggedItem(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            </div>
        );
    }

    // Group students by status
    const groupedStudents = COLUMNS.reduce((acc, col) => {
        acc[col.id] = students.filter(s => s.status === col.id || (!s.status && col.id === 'APPLIED'));
        return acc;
    }, {});

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 h-full flex flex-col"
        >
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">
                    Student Progress
                </h1>
                <p className="text-text-secondary mt-1 text-sm">Drag and drop to update candidate pipeline stages.</p>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 flex-1 items-start min-h-[500px]">
                {COLUMNS.map(column => (
                    <div
                        key={column.id}
                        className={`glass-panel min-w-[300px] flex-1 border-t-4 flex flex-col ${column.color}`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, column.id)}
                    >
                        <div className="p-4 border-b border-white/5 bg-white/5 rounded-t-xl flex justify-between items-center">
                            <h3 className="font-bold flex items-center gap-2">
                                {column.title}
                            </h3>
                            <span className="text-xs bg-black/20 px-2 py-1 rounded-full font-medium">
                                {groupedStudents[column.id]?.length || 0}
                            </span>
                        </div>

                        <div className="flex-1 p-3 space-y-3 min-h-[150px]">
                            {groupedStudents[column.id]?.map(student => (
                                <div
                                    key={student.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, student)}
                                    onDragEnd={handleDragEnd}
                                    className="bg-surface border border-white/10 p-4 rounded-xl shadow-lg cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors group relative"
                                >
                                    <GripVertical className="absolute right-2 top-4 w-4 h-4 text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="font-bold text-sm text-text-primary mb-1 pr-6">{student.name}</div>
                                    <div className="text-xs text-text-secondary mb-2">{student.company || 'Unknown Company'}</div>
                                    <div className="text-xs bg-white/5 px-2 py-1 inline-block rounded text-primary">
                                        {student.role || 'SDE'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
