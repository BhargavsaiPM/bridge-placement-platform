import React from 'react';

export default function ActivityTimeline({ activities }) {
    if (!activities || activities.length === 0) {
        return (
            <div className="text-center py-8 text-text-secondary text-sm">
                No recent activity.
            </div>
        );
    }

    return (
        <div className="relative border-l border-white/10 ml-3 space-y-6 pb-4">
            {activities.map((activity, idx) => (
                <div key={idx} className="relative pl-6">
                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-background"></div>
                    <div className="text-sm">
                        <span className="font-bold text-text-primary mr-1">
                            {activity.actor || 'System'}
                        </span>
                        <span className="text-text-secondary">
                            {activity.action}
                        </span>
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                        {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Just now'}
                    </div>
                </div>
            ))}
        </div>
    );
}
