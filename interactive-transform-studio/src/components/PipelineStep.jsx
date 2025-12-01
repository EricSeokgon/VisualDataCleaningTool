import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, Settings, GripVertical } from 'lucide-react';

export const PipelineStep = ({ step, onRemove, onUpdate }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: step.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative group flex items-center gap-4 p-4 mb-3 bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-700 shadow-sm hover:shadow-md transition-all"
        >
            <div {...attributes} {...listeners} className="cursor-grab text-slate-500 hover:text-slate-300">
                <GripVertical size={20} />
            </div>

            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
                        {step.type}
                    </span>
                    <span className="text-sm font-semibold text-slate-200">{step.column}</span>
                </div>
                <div className="text-xs text-slate-400">
                    Applied transformation
                </div>
            </div>

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onRemove(step.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};
