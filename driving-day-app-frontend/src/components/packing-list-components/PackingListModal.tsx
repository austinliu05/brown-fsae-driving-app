import React, { useState, useEffect, useRef } from "react";
import Modal from "../issues-components/Modal";
import { PackingTemplate } from "./PackingListTable";

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setItems(template.items);
    setListName(template.name);
    setListDescription(template.description);
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

  /* ── Save handlers ── */
  const handleSaveAsCurrent = async () => {
    await onSaveAsCurrent({ ...template, name: listName, description: listDescription, items });
    onClose();
  };

  const handleSaveAsNew = async () => {
    await onSaveAsNew({
      ...template,
      id: Math.random().toString(36).slice(2, 9),
      name: listName,
      description: listDescription,
      items,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 w-full" style={{ minWidth: "520px" }}>
        {/* Header */}
        <div className="mb-1">
          <input
            type="text"
            value={listName}
            onChange={(e) => setListName(e.target.value)}
            className="text-xl font-bold border-b border-transparent hover:border-gray-300 focus:border-blue-400 focus:outline-none bg-transparent w-full"
          />
          <input
            type="text"
            value={listDescription}
            onChange={(e) => setListDescription(e.target.value)}
            className="text-sm text-gray-500 border-b border-transparent hover:border-gray-300 focus:border-blue-400 focus:outline-none bg-transparent w-full mt-1"
          />
        </div>

        {/* Item list (no checkboxes — these are blueprint labels) */}
        <div className="space-y-1 mb-2" style={{ maxHeight: "320px", overflowY: "auto" }}>
          {items.map((label) => (
            <div key={label} className="flex items-center gap-3 py-2 px-2 rounded hover:bg-gray-50 group">
              <span className="flex-1 text-sm">{label}</span>
              <button
                onClick={() => handleDeleteItem(label)}
                className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs transition-opacity"
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
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <input
            ref={inputRef}
            type="text"
            value={newItemLabel}
            onChange={(e) => setNewItemLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            placeholder="New item..."
            className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleAddItem}
            disabled={!newItemLabel.trim()}
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 disabled:bg-blue-200"
          >
            Add
          </button>
        </div>

        {/* Footer buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={async () => { await onDelete(template.id); onClose(); }}
            className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Delete
          </button>
          <div className="flex gap-2">
            <button onClick={handleSaveAsCurrent} className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600">
              Save
            </button>
            <button onClick={handleSaveAsNew} className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
              Save as New
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}