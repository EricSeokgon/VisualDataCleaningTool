import { useState, useMemo, useCallback } from 'react';
import { applyTransformation } from '../utils/transformations';

export const usePipeline = (initialData = []) => {
    const [originalData, setOriginalData] = useState(initialData);
    const [pipeline, setPipeline] = useState([]);

    // Compute transformed data whenever pipeline or originalData changes
    const transformedData = useMemo(() => {
        let data = [...originalData];
        for (const step of pipeline) {
            data = applyTransformation(data, step.type, step.column);
        }
        return data;
    }, [originalData, pipeline]);

    const addStep = useCallback((step) => {
        setPipeline(prev => [...prev, { ...step, id: crypto.randomUUID() }]);
    }, []);

    const removeStep = useCallback((id) => {
        setPipeline(prev => prev.filter(step => step.id !== id));
    }, []);

    const updateStep = useCallback((id, newParams) => {
        setPipeline(prev => prev.map(step => step.id === id ? { ...step, ...newParams } : step));
    }, []);

    const reorderPipeline = useCallback((newPipeline) => {
        setPipeline(newPipeline);
    }, []);

    const loadRecipe = useCallback((recipe) => {
        setPipeline(recipe);
    }, []);

    return {
        originalData,
        setOriginalData,
        transformedData,
        pipeline,
        addStep,
        removeStep,
        updateStep,
        reorderPipeline,
        loadRecipe
    };
};
