import React, { useState, useEffect, useRef } from "react";
import Modal from "../shared/Modal";
import { PackingTemplate, PackingCategory } from "./PackingListTable";

interface PackingListModalProps {
  template: PackingTemplate;
  isOpen: boolean;
  onClose: () => void;
  onSaveAsCurrent: (updated: PackingTemplate) => Promise<void> | void;
  onSaveAsNew: (updated: PackingTemplate) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
}

export default function PackingListModal({
  template,
  isOpen,
  onClose,
  onSaveAsCurrent,
  onSaveAsNew,
  onDelete,
}: PackingListModalProps) {
  const [items, setItems] = useState<string[]>(template.items);
  const [newItemLabel, setNewItemLabel] = useState("");
  const [listName, setListName] = useState(template.name);
  const [listDescription, setListDescription] = useState(template.description);
  const [listCategory, setListCategory] = useState<PackingCategory>(template.category);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(template.items);
    setListName(template.name);
    setListDescription(template.description);
    setListCategory(template.category);
  }, [template.id]);

  /* ── Item management ── */
  const handleAddItem = () => {
    const label = newItemLabel.trim();
    if (!label) return;
    setItems((prev) => [...prev, label]);
    setNewItemLabel("");
    inputRef.current?.focus();
  };

  const handleDeleteItem = (label: string) => {
    setItems((prev) => prev.filter((i) => i !== label));
  };

  const handleMoveItem = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;
    setItems((prev) => {
      const updated = [...prev];
      [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
      return updated;
    });
  };

  /* ── Save handlers ── */
  const handleSaveAsCurrent = async () => {
    await onSaveAsCurrent({ ...template, name: listName, description: listDescription, items, category: listCategory });
    onClose();
  };

  const handleSaveAsNew = async () => {
    await onSaveAsNew({
      ...template,
      id: Math.random().toString(36).slice(2, 9),
      name: listName,
      description: listDescription,
      items,
      category: listCategory,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex max-h-[90vh] w-full flex-col overflow-y-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-3">
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            className="w-full border-b border-transparent bg-transparent text-lg font-bold focus:border-blue-400 focus:outline-none hover:border-gray-300 sm:text-xl"
          />
          <input
            type="text"
            value={listDescription}
            onChange={(e) => setListDescription(e.target.value)}
            className="mt-1 w-full border-b border-transparent bg-transparent text-sm text-gray-500 focus:border-blue-400 focus:outline-none hover:border-gray-300"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {(["Standard", "Subsystems"] as PackingCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setListCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  listCategory === cat
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Item list  */}
        <div className="mb-2 max-h-[42vh] space-y-1 overflow-y-auto pr-1 sm:max-h-[320px]">
          {items.map((label, idx) => (
            <div key={`${label}-${idx}`} className="group flex items-start gap-2 rounded px-2 py-2 hover:bg-gray-50 sm:items-center">
              <div className="flex flex-col gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                <button
                  onClick={() => handleMoveItem(idx, -1)}
                  disabled={idx === 0}
                  className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-[10px] leading-none"
                  title="Move up"
                >
                  ▲
                </button>
                <button
                  onClick={() => handleMoveItem(idx, 1)}
                  disabled={idx === items.length - 1}
                  className="text-gray-400 hover:text-gray-700 disabled:opacity-20 text-[10px] leading-none"
                  title="Move down"
                >
                  ▼
                </button>
              </div>
              <span className="flex-1 text-sm">{label}</span>
              <button
                onClick={() => handleDeleteItem(label)}
                className="text-xs text-red-400 transition-opacity hover:text-red-600 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm italic text-gray-400 py-4 text-center">No items yet. Add one below!</p>
          )}
        </div>

        {/* Add new item */}
        <div className="mt-4 flex flex-col gap-2 border-t border-gray-100 pt-3 sm:flex-row">
          <input
            ref={inputRef}
            type="text"
            value={newItemLabel}
            onChange={(e) => setNewItemLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            placeholder="New item..."
            className="w-full flex-1 rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleAddItem}
            disabled={!newItemLabel.trim()}
            className="rounded bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:bg-blue-200 sm:w-auto"
          >
            Add
          </button>
        </div>

        {/* Footer buttons */}
        <div className="mt-4 flex flex-col-reverse gap-2 border-t border-gray-100 pt-3 sm:flex-row sm:justify-between">
          <button
            onClick={async () => { await onDelete(template.id); onClose(); }}
            className="rounded bg-red-500 px-3 py-2 text-sm text-white hover:bg-red-600"
          >
            Delete
          </button>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button onClick={handleSaveAsCurrent} className="rounded bg-green-500 px-3 py-2 text-sm text-white hover:bg-green-600">
              Save
            </button>
            <button onClick={handleSaveAsNew} className="rounded bg-blue-500 px-3 py-2 text-sm text-white hover:bg-blue-600">
              Save as New
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}