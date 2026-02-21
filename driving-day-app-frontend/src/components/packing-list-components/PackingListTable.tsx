import React, { useState } from "react";
import PackingListModal from "./PackingListModal";
import AddPackingListModal from "./AddPackingListModal";
import { defaultTemplates, PackingTemplate } from "../../constants/PackingListConstants";


export default function PackingListTable() {
  const [templates, setTemplates] = useState<PackingTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<PackingTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleOpenModal = (template: PackingTemplate) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  // Called when checking/unchecking — updates the original in place
  const handleUpdateProgress = (updated: PackingTemplate) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === updated.id ? updated : t))
    );
    setSelectedTemplate(updated);
  };

  // Called when adding/deleting items — appends as a new card
  const handleSaveAsNew = (updated: PackingTemplate) => {
    setTemplates((prev) => [...prev, updated]);
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  };

  const getProgress = (template: PackingTemplate) => {
    const total = template.items.length;
    const done = template.items.filter((i) => i.checked).length;
    return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500"></p>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 focus:outline-none"
        >
          Add
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const { done, total, pct } = getProgress(template);
          const allDone = done === total && total > 0;

          return (
            <div
              key={template.id}
              onClick={() => handleOpenModal(template)}
              className="bg-white rounded-lg border border-gray-200 p-5 cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all"
              tabIndex={0}
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-lg font-semibold">{template.name}</h2>
                {allDone && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-800">
                    Complete
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-4">{template.description}</p>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-1">
                <div
                  className={`h-2 rounded-full transition-all ${allDone ? "bg-green-500" : "bg-blue-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400">{done}/{total} items packed</p>
            </div>
          );
        })}
      </div>

      {selectedTemplate && (
        <PackingListModal
          template={selectedTemplate}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onUpdateProgress={handleUpdateProgress}
          onSaveAsNew={handleSaveAsNew}
          onDelete={handleDeleteTemplate}
        />
      )}

      <AddPackingListModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={(newTemplate) => setTemplates((prev) => [...prev, newTemplate])}
      />
    </>
  );
}