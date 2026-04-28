import React, { useState, useEffect } from "react";
import PackingListModal from "./PackingListModal";
import AddPackingListModal from "./AddPackingListModal";
import { getAllPackingLists, updatePackingList, postPackingList, deletePackingList } from "../../api/api";

export type PackingCategory = "Standard" | "Subsystems";

export interface PackingTemplate {
  id: string;
  name: string;
  description: string;
  items: string[];
  category: PackingCategory;
  order: number;
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
        const lists: PackingTemplate[] = response.data.packing_lists.map((pl: any, idx: number) => ({
          id: pl.id,
          name: pl.name,
          description: pl.description,
          items: pl.items ?? [],
          category: pl.category ?? "Subsystems",
          order: pl.order ?? idx,
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
      category: updated.category,
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
      category: newTemplate.category,
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

  // Reorder a list within its category
  const handleMove = async (id: string, direction: -1 | 1) => {
    const item = templates.find((t) => t.id === id);
    if (!item) return;
    const sameCategory = templates
      .filter((t) => t.category === item.category)
      .sort((a, b) => a.order - b.order);
    const idx = sameCategory.findIndex((t) => t.id === id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= sameCategory.length) return;

    const other = sameCategory[swapIdx];
    const newOrder = other.order;
    const otherNewOrder = item.order;

    const updatedItem = { ...item, order: newOrder };
    const updatedOther = { ...other, order: otherNewOrder };

    setTemplates((prev) =>
      prev.map((t) =>
        t.id === id ? updatedItem : t.id === other.id ? updatedOther : t
      )
    );

    // Persist both order changes
    await Promise.all([
      updatePackingList(id, { order: newOrder }),
      updatePackingList(other.id, { order: otherNewOrder }),
    ]);
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
      <div className="flex items-center justify-end mb-6">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors"
        >
          + New List
        </button>
      </div>

      {isLoading && (
        <p className="text-sm text-gray-400 text-center py-8">Loading packing lists...</p>
      )}

      {!isLoading && (["Standard", "Subsystems"] as PackingCategory[]).map((section) => {
        const sectionItems = templates
          .filter((t) => t.category === section)
          .sort((a, b) => a.order - b.order);

        if (sectionItems.length === 0) return null;

        return (
          <div key={section} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-semibold text-gray-800">{section}</h2>
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">{sectionItems.length} lists</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {sectionItems.map((template, idx) => {
                const isGeneral = template.name.toLowerCase() === "general";
                return (
                  <div
                    key={template.id}
                    className={`relative group rounded-xl p-5 cursor-pointer transition-all duration-200 ${
                      isGeneral
                        ? "bg-green-50 border-2 border-green-400 hover:border-green-500 hover:shadow-lg hover:shadow-green-100"
                        : "bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                    onClick={() => handleOpenModal(template)}
                  >
                    {isGeneral && (
                      <span className="absolute -top-2 left-4 bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Essential
                      </span>
                    )}
                    <h3 className={`text-sm font-semibold mb-2 ${isGeneral ? "text-green-800 mt-1" : "text-gray-800"}`}>
                      {template.name}
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${isGeneral ? "bg-green-400" : "bg-gray-300"}`} />
                      <p className={`text-xs ${isGeneral ? "text-green-600" : "text-gray-400"}`}>
                        {template.items.length} {template.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>

                    {/* Reorder arrows — visible on hover */}
                    <div className="absolute top-2 right-2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMove(template.id, -1); }}
                        disabled={idx === 0}
                        className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-[10px] px-1 py-0.5 rounded hover:bg-gray-100 transition-colors"
                        title="Move left"
                      >
                        ◀
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMove(template.id, 1); }}
                        disabled={idx === sectionItems.length - 1}
                        className="text-gray-300 hover:text-gray-600 disabled:opacity-20 text-[10px] px-1 py-0.5 rounded hover:bg-gray-100 transition-colors"
                        title="Move right"
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

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