import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PackingList, getDefaultPackingListIds, sortPackingListsForDisplay } from "../../utils/DataTypes";
import { getAllPackingLists, postDrivingDay } from "../../api/api";

function mapPackingList(raw: any): PackingList {
  return {
    id: raw.id,
    name: raw.name ?? "",
    description: raw.description ?? "",
    items: raw.items ?? [],
    category: raw.category ?? "Subsystems",
    order: raw.order ?? 0,
  };
}

export default function NewDrivingDayEntry() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  // Form fields
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Packing lists 
  const [availablePackingLists, setAvailablePackingLists] = useState<PackingList[]>([]);
  const [addedPackingListIds, setAddedPackingListIds] = useState<string[]>([]);

  // Track which accordions are expanded (by packing list id)
  const [expandedListIds, setExpandedListIds] = useState<Set<string>>(new Set());

  // Track checked items per packing list: { listId: Set<itemIndex> }
  const [checkedItems, setCheckedItems] = useState<Record<string, Set<number>>>({});

  const handleAddPackingList = (listId: string) => {
    if (!listId || addedPackingListIds.includes(listId)) return;
    setAddedPackingListIds((prev) => [...prev, listId]);
    setExpandedListIds((prev) => new Set(prev).add(listId));
    setCheckedItems((prev) => ({ ...prev, [listId]: new Set<number>() }));
  };

  const handleRemovePackingList = (listId: string) => {
    setAddedPackingListIds((prev) => prev.filter((id) => id !== listId));
    setExpandedListIds((prev) => { const s = new Set(prev); s.delete(listId); return s; });
    setCheckedItems((prev) => { const c = { ...prev }; delete c[listId]; return c; });
  };

  const toggleAccordion = (listId: string) => {
    setExpandedListIds((prev) => {
      const s = new Set(prev);
      s.has(listId) ? s.delete(listId) : s.add(listId);
      return s;
    });
  };

  const toggleCheckItem = (listId: string, itemIdx: number) => {
    setCheckedItems((prev) => {
      const s = new Set(prev[listId] ?? []);
      s.has(itemIdx) ? s.delete(itemIdx) : s.add(itemIdx);
      return { ...prev, [listId]: s };
    });
  };

  // Drivers
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [newDriverName, setNewDriverName] = useState("");

  useEffect(() => {
    const fetchPackingLists = async () => {
      try {
        const response = await getAllPackingLists();
        if (response.data?.packing_lists) {
          setAvailablePackingLists(sortPackingListsForDisplay(response.data.packing_lists.map(mapPackingList)));
        }
      } catch (err) {
        console.error("Failed to fetch packing lists:", err);
      }
    };

    fetchPackingLists();
  }, []);

  useEffect(() => {
    if (availablePackingLists.length === 0) return;

    const defaultPackingListIds = getDefaultPackingListIds(availablePackingLists);
    if (defaultPackingListIds.length === 0) return;

    setAddedPackingListIds((prev) => Array.from(new Set([...prev, ...defaultPackingListIds])));
    setExpandedListIds((prev) => {
      const next = new Set(prev);
      defaultPackingListIds.forEach((listId) => next.add(listId));
      return next;
    });
    setCheckedItems((prev) => {
      const next = { ...prev };
      defaultPackingListIds.forEach((listId) => {
        if (!next[listId]) {
          next[listId] = new Set<number>();
        }
      });
      return next;
    });
  }, [availablePackingLists]);

  // ── Handlers ─────

  const removeDriver = (driverName: string) => {
    setSelectedDrivers((prev) => prev.filter((name) => name !== driverName));
  };

  const addDriver = () => {
    const name = newDriverName.trim();
    if (!name || selectedDrivers.includes(name)) return;
    setSelectedDrivers((prev) => [...prev, name]);
    setNewDriverName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const packingListEntries = addedPackingListIds.map((listId) => ({
        packingListId: listId,
        checkedItems: Array.from(checkedItems[listId] ?? []),
      }));

      const response = await postDrivingDay({
        title,
        date,
        description,
        drivers: selectedDrivers,
        packingLists: packingListEntries,
        feedback: [],
      });

      if (response.status !== 200 && response.status !== 201) {
        throw new Error("Failed to create driving day");
      }

      navigate("/past-driving-days");
    } catch (err) {
      setError("Error saving driving day. Please make sure all required fields are filled.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── Helpers ────
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-600 text-white";
      case "high": return "bg-red-100 text-red-800";
      case "critical": return "bg-red-800 text-white";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "closed": return "bg-green-100 text-green-800";
      case "in progress": return "bg-yellow-600 text-white";
      case "open": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // ── Render ───

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {/* ── Title, Date & Description ──-- */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Driving Day Info</h2>
        <div className="md:flex md:gap-4">
          <div className="md:flex-1 mb-4">
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Pre-Competition Shakedown, Endurance Practice"
              className="w-full border rounded p-2"
            />
          </div>
          <div className="md:w-1/3 mb-4">
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the goals, conditions, or notes for this driving day…"
            className="w-full border rounded p-2 h-32 resize-y"
          />
        </div>
      </div>

      {/* ── Packing Lists ─── */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-2">Packing Lists</h2>
        <p className="text-sm text-gray-500 mb-4">Add one or more packing lists and check off items as you pack.</p>

        {/* Selector to add a packing list */}
        <div className="flex gap-2 mb-4">
          <select
            id="packing-list-selector"
            defaultValue=""
            className="flex-1 border rounded p-2"
          >
            <option value="" disabled>— Choose a packing list to add —</option>
            {availablePackingLists
              .filter((pl) => !addedPackingListIds.includes(pl.id))
              .map((pl) => (
                <option key={pl.id} value={pl.id}>{pl.name}</option>
              ))}
          </select>
          <button
            type="button"
            onClick={() => {
              const sel = document.getElementById("packing-list-selector") as HTMLSelectElement;
              if (sel.value) {
                handleAddPackingList(sel.value);
                sel.value = "";
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Add
          </button>
        </div>

        {/* Accordion list */}
        {addedPackingListIds.length === 0 ? (
          <div className="py-8 text-center text-gray-400">No packing lists added yet.</div>
        ) : (
          <div className="space-y-3">
            {addedPackingListIds.map((listId) => {
              const pl = availablePackingLists.find((p) => p.id === listId);
              if (!pl) return null;
              const isExpanded = expandedListIds.has(listId);
              const checked = checkedItems[listId] ?? new Set<number>();
              const checkedCount = checked.size;
              const totalCount = pl.items.length;

              return (
                <div key={listId} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Accordion header */}
                  <button
                    type="button"
                    onClick={() => toggleAccordion(listId)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}>▶</span>
                      <div className="text-left">
                        <span className="font-medium">{pl.name}</span>
                        {pl.description && (
                          <span className="text-sm text-gray-500 ml-2">— {pl.description}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">
                        {checkedCount}/{totalCount} packed
                      </span>
                      <span
                        onClick={(e) => { e.stopPropagation(); handleRemovePackingList(listId); }}
                        className="text-red-400 hover:text-red-600 text-sm cursor-pointer"
                      >
                        ✕
                      </span>
                    </div>
                  </button>

                  {/* Accordion body */}
                  {isExpanded && (
                    <div className="px-4 py-2 divide-y divide-gray-100">
                      {pl.items.map((item, idx) => {
                        const isChecked = checked.has(idx);
                        return (
                          <label
                            key={idx}
                            className="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-50 rounded px-1"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCheckItem(listId, idx)}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className={`text-sm ${isChecked ? "line-through text-gray-400" : ""}`}>
                              {item}
                            </span>
                          </label>
                        );
                      })}
                      {totalCount === 0 && (
                        <p className="text-sm italic text-gray-400 py-2 text-center">This list has no items.</p>
                      )}
                    </div>
                  )}

                  {/* Progress bar */}
                  {totalCount > 0 && (
                    <div className="h-1 bg-gray-100">
                      <div
                        className="h-1 bg-green-500 transition-all"
                        style={{ width: `${(checkedCount / totalCount) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Drivers -- */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Drivers</h2>

        {/* Add driver input */}
        <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={newDriverName}
              onChange={(e) => setNewDriverName(e.target.value)}
              placeholder="Add driver name"
              className="flex-1 border rounded p-2 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addDriver();
                }
              }}
            />
            <button
              type="button"
              onClick={addDriver}
              className="px-3 py-2 bg-green-500 text-white rounded text-sm hover:bg-green-600"
            >
              Add
            </button>
        </div>

        {/* Selected driver chips */}
        <div className="flex gap-2 flex-wrap">
          {selectedDrivers.map((name) => {
            return (
              <span
                key={name}
                className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center"
              >
                {name}
                <button
                  type="button"
                  className="ml-1.5 text-blue-800 hover:text-blue-900"
                  onClick={() => removeDriver(name)}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate("/past-driving-days")}
          className="px-4 py-2 border rounded hover:bg-gray-50"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Driving Day"}
        </button>
      </div>
    </form>
  );
}