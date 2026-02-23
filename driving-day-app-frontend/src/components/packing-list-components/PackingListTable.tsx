import React, { useState, useEffect } from "react";
import PackingListModal from "./PackingListModal";
import AddPackingListModal from "./AddPackingListModal";
import { getAllPackingLists, updatePackingList, postPackingList, deletePackingList } from "../../api/api";

export interface PackingTemplate {
  id: string;
  name: string;
  description: string;
  items: string[];   
}

export default function PackingListTable() {
  const [templates, setTemplates] = useState<PackingTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PackingTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all packing list templates from the backend on mount
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await getAllPackingLists();
      if (response.status === 200 && response.data) {
        const lists: PackingTemplate[] = response.data.packing_lists.map((pl: any) => ({
          id: pl.id,
          name: pl.name,
          description: pl.description,
          items: pl.items ?? [],
        }));
        setTemplates(lists);
      }
    } catch (error) {
      console.error("Failed to fetch packing lists:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleOpenModal = (template: PackingTemplate) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  // Save edits to the current list via PUT
  const handleSaveAsCurrent = async (updated: PackingTemplate) => {
    const response = await updatePackingList(updated.id, {
      name: updated.name,
      description: updated.description,
      items: updated.items,
    });
    if (response.status === 200) {
      setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setSelectedTemplate(updated);
    } else {
      console.error("Failed to update packing list");
    }
  };

  // Save as a brand-new list via POST
  const handleSaveAsNew = async (newTemplate: PackingTemplate) => {
    const response = await postPackingList({
      name: newTemplate.name,
      description: newTemplate.description,
      items: newTemplate.items,
    });
    if (response.status === 201 && "data" in response && response.data) {
      const created: PackingTemplate = {
        ...newTemplate,
        id: response.data.packing_list_id,
      };
      setTemplates((prev) => [...prev, created]);
    } else {
      console.error("Failed to create packing list");
    }
  };

  // Delete a list via DELETE
  const handleDeleteTemplate = async (id: string) => {
    const response = await deletePackingList(id);
    if (response.status === 200) {
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } else {
      console.error("Failed to delete packing list");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{isLoading ? "Loading..." : ""}</p>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 focus:outline-none"
        >
          Add
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => handleOpenModal(template)}
            className="bg-white rounded-lg border border-gray-200 p-5 cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all"
            tabIndex={0}
          >
            <h2 className="text-lg font-semibold mb-1">{template.name}</h2>
            <p className="text-sm text-gray-500 mb-3">{template.description}</p>
            <p className="text-xs text-gray-400">{template.items.length} items</p>
          </div>
        ))}
      </div>

      {selectedTemplate && (
        <PackingListModal
          template={selectedTemplate}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSaveAsCurrent={handleSaveAsCurrent}
          onSaveAsNew={handleSaveAsNew}
          onDelete={handleDeleteTemplate}
        />
      )}

      <AddPackingListModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveAsNew}
      />
    </>
  );
}