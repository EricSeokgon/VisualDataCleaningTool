import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical } from 'lucide-react';

export const DraggableColumn = ({ column }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: `col-${column}`,
        data: { type: 'column', name: column }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="flex items-center gap-2 p-3 mb-2 bg-slate-800 rounded-md border border-slate-700 cursor-grab hover:border-slate-500 transition-colors"
        >
            <GripVertical size={16} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-200">{column}</span>
        </div>
    );
};
