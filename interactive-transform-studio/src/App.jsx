import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { usePipeline } from './hooks/usePipeline';
import { DraggableColumn } from './components/DraggableColumn';
import { PipelineStep } from './components/PipelineStep';
import { ChartView } from './components/ChartView';
import { Upload, Download, Play, Plus, Trash2 } from 'lucide-react';
import Papa from 'papaparse';

// Dummy Data Generation
const generateDummyData = (rows = 100) => {
  return Array.from({ length: rows }, (_, i) => ({
    id: i,
    age: Math.floor(Math.random() * 60) + 18,
    income: Math.floor(Math.random() * 100000) + 20000,
    score: Math.random() * 100,
    category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
  }));
};

function App() {
  const {
    originalData,
    setOriginalData,
    transformedData,
    pipeline,
    addStep,
    removeStep,
    reorderPipeline
  } = usePipeline(generateDummyData());

  const [activeId, setActiveId] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [columns, setColumns] = useState([]);

  useEffect(() => {
    if (originalData.length > 0) {
      setColumns(Object.keys(originalData[0]).filter(k => k !== 'id'));
      if (!selectedColumn) setSelectedColumn(Object.keys(originalData[0])[1]); // Default to age or income
    }
  }, [originalData]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    // Dropped a column into the pipeline area
    if (active.data.current?.type === 'column' && over.id === 'pipeline-area') {
      const column = active.data.current.name;
      // Default to normalize, user can change later (simplified for now)
      addStep({ type: 'normalize', column });
    }

    // Reordering pipeline steps
    if (active.id !== over.id && pipeline.find(p => p.id === active.id)) {
      const oldIndex = pipeline.findIndex((item) => item.id === active.id);
      const newIndex = pipeline.findIndex((item) => item.id === over.id);
      reorderPipeline(arrayMove(pipeline, oldIndex, newIndex));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          setOriginalData(results.data);
        }
      });
    }
  };

  const handleExport = () => {
    const json = JSON.stringify(transformedData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transformed_data.json';
    a.click();
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">

        {/* Sidebar: Data Source */}
        <div className="w-64 border-r border-[var(--border-color)] flex flex-col bg-[var(--bg-secondary)]">
          <div className="p-4 border-b border-[var(--border-color)]">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
              Data Source
            </h2>
            <label className="flex items-center justify-center w-full p-2 bg-[var(--bg-tertiary)] rounded-md cursor-pointer hover:bg-slate-600 transition">
              <Upload size={16} className="mr-2" />
              <span className="text-sm">Upload CSV</span>
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase mb-3">Available Columns</h3>
            {columns.map(col => (
              <DraggableColumn key={col} column={col} />
            ))}
          </div>
        </div>

        {/* Main: Pipeline Builder */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-6 bg-[var(--bg-primary)]/50 backdrop-blur">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
              Transformation Pipeline
            </h1>
            <div className="flex gap-2">
              <button onClick={handleExport} className="btn-secondary flex items-center gap-2">
                <Download size={16} /> Export Data
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto bg-[var(--bg-primary)] relative">
            <div
              id="pipeline-area"
              className="max-w-3xl mx-auto min-h-[500px] border-2 border-dashed border-[var(--border-color)] rounded-xl p-8 transition-colors hover:border-blue-500/50"
            >
              {pipeline.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Plus size={32} />
                  </div>
                  <p className="text-lg font-medium">Drag columns here to start</p>
                  <p className="text-sm">Drop a column to apply a transformation</p>
                </div>
              ) : (
                <SortableContext items={pipeline} strategy={verticalListSortingStrategy}>
                  {pipeline.map(step => (
                    <PipelineStep
                      key={step.id}
                      step={step}
                      onRemove={removeStep}
                    />
                  ))}
                </SortableContext>
              )}
            </div>
          </div>
        </div>

        {/* Right: Visualization */}
        <div className="w-96 border-l border-[var(--border-color)] bg-[var(--bg-secondary)] flex flex-col">
          <div className="p-4 border-b border-[var(--border-color)]">
            <h2 className="font-bold text-lg">Live Preview</h2>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="mb-6">
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-2">Select Column to View</label>
              <select
                className="w-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] rounded p-2 text-sm text-white focus:outline-none focus:border-blue-500"
                value={selectedColumn || ''}
                onChange={(e) => setSelectedColumn(e.target.value)}
              >
                {columns.map(col => <option key={col} value={col}>{col}</option>)}
              </select>
            </div>

            <div className="glass-panel p-4 rounded-xl mb-6">
              <h3 className="text-sm font-medium mb-4 text-slate-300">Original Distribution</h3>
              <ChartView data={originalData} column={selectedColumn} />
            </div>

            <div className="glass-panel p-4 rounded-xl">
              <h3 className="text-sm font-medium mb-4 text-blue-300">Transformed Distribution</h3>
              <ChartView data={transformedData} column={selectedColumn} />
            </div>
          </div>
        </div>

      </div>
      <DragOverlay>
        {activeId ? (
          <div className="p-3 bg-slate-700 rounded shadow-xl text-white opacity-80 cursor-grabbing">
            Dragging...
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

export default App;
