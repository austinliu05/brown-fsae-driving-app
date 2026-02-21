import React, { useState } from "react";
import Modal from "../issues-components/Modal";
import { PackingTemplate, PackingItem } from "../../constants/PackingListConstants";

interface AddPackingListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newTemplate: PackingTemplate) => void;
}

export default function AddPackingListModal({ isOpen, onClose, onSave }: AddPackingListModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<PackingItem[]>([]);
  const [newItemLabel, setNewItemLabel] = useState("");

  const handleAddItem = () => {
    const label = newItemLabel.trim();
    if (!label) return;
    setItems((prev) => [...prev, { label, checked: false }]);
    setNewItemLabel("");
  };

  const handleDeleteItem = (label: string) => {
    setItems((prev) => prev.filter((i) => i.label !== label));
  };

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: Math.random().toString(36).slice(2, 9),
      name: name.trim(),
      description: description.trim(),
      items,
    });
    // Reset form
    setName("");
    setDescription("");
    setItems([]);
    setNewItemLabel("");
    onClose();
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setItems([]);
    setNewItemLabel("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6 w-full" style={{ minWidth: "520px" }}>

        {/* Header */}
        <h2 className="text-xl font-bold mb-4">New Packing List</h2>

        {/* Name */}
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Items list */}
        <div className="mb-2">
          <label className="block text-sm font-medium mb-2">Items</label>
          <div className="space-y-1 mb-3" style={{ maxHeight: "240px", overflowY: "auto" }}>
            {items.length === 0 && (
              <p className="text-sm italic text-gray-400 py-2 text-center">No items yet</p>
            )}
            {items.map((item) => (
              <div key={item.label} className="flex items-center gap-3 py-2 px-2 rounded hover:bg-gray-50 group">
                <span className="flex-1 text-sm">{item.label}</span>
                <button
                  onClick={() => handleDeleteItem(item.label)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 text-xs transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add item input */}
          <div className="flex gap-2">
            <input
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
        </div>

        {/* Footer buttons */}
        <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={handleClose}
            className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:bg-blue-200"
          >
            Save
          </button>
        </div>

      </div>
    </Modal>
  );
}