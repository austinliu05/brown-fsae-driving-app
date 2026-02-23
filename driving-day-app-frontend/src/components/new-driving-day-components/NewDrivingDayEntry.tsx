import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Issue } from "../../utils/DataTypes";
import { Driver } from "../../utils/DriverType";
import AddIssueModal from "../issues-components/AddIssueModal";

// ── Mock data ───
const MOCK_PACKING_LISTS: PackingList[] = [
  {
    id: "pl1",
    name: "Standard Track Day",
    items: [
      { id: "p1", name: "Fire extinguisher", required: true },
      { id: "p2", name: "First aid kit", required: true },
      { id: "p3", name: "Tool chest", required: true },
      { id: "p4", name: "Tire warmers", required: true },
      { id: "p5", name: "Spare tire set", required: true },
      { id: "p6", name: "Fuel jugs (x2)", required: true },
      { id: "p7", name: "Helmet(s)", required: true },
      { id: "p8", name: "Driver suits", required: true },
      { id: "p9", name: "Data logging laptop", required: true },
      { id: "p10", name: "Pop-up tent", required: false },
      { id: "p11", name: "Folding table & chairs", required: false },
      { id: "p12", name: "Battery charger", required: true },
      { id: "p13", name: "Jack & jack stands", required: true },
      { id: "p14", name: "Rain canopy", required: false },
    ],
  },
  {
    id: "pl2",
    name: "Minimal Shakedown",
    items: [
      { id: "p1", name: "Fire extinguisher", required: true },
      { id: "p2", name: "First aid kit", required: true },
      { id: "p7", name: "Helmet(s)", required: true },
      { id: "p8", name: "Driver suits", required: true },
      { id: "p3", name: "Tool chest", required: false },
      { id: "p12", name: "Battery charger", required: false },
    ],
  },
];

const MOCK_DRIVERS: Driver[] = [
  { driverId: "d1", firstName: "Alex", lastName: "Johnson", height: 72, weight: 165, pedalBoxPos: 3 },
  { driverId: "d2", firstName: "Jordan", lastName: "Smith", height: 68, weight: 150, pedalBoxPos: 2 },
  { driverId: "d3", firstName: "Casey", lastName: "Williams", height: 70, weight: 160, pedalBoxPos: 4 },
  { driverId: "d4", firstName: "Morgan", lastName: "Brown", height: 66, weight: 140, pedalBoxPos: 1 },
];

const MOCK_ISSUES: Issue[] = [
  { id: "i1", issue_number: 1, driver: "Alex Johnson", date: "2026-02-10", synopsis: "Front left brake squealing", subsystems: ["BRK"], description: "Squealing noise under heavy braking.", priority: "HIGH", status: "OPEN" },
  { id: "i2", issue_number: 2, driver: "Jordan Smith", date: "2026-02-12", synopsis: "Coolant temp spikes", subsystems: ["COOL", "ENGN"], description: "Coolant temp exceeds 220°F after 10 laps.", priority: "CRITICAL", status: "OPEN" },
  { id: "i3", issue_number: 3, driver: "Casey Williams", date: "2026-02-14", synopsis: "Loose exhaust heat shield", subsystems: ["EXH"], description: "Heat shield rattling at high RPM.", priority: "MEDIUM", status: "IN PROGRESS" },
  { id: "i4", issue_number: 4, driver: "Alex Johnson", date: "2026-02-15", synopsis: "Steering wheel off-center", subsystems: ["STR"], description: "Wheel slightly misaligned after last session.", priority: "LOW", status: "OPEN" },
];

// ── Types ───

interface PackingItem {
  id: string;
  name: string;
  required: boolean;
}

interface PackingList {
  id: string;
  name: string;
  items: PackingItem[];
}

type PackingStatus = "have" | "dont_need" | "unchecked";

export default function NewDrivingDayEntry() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  // Form fields
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(today);
  const [description, setDescription] = useState("");

  // Packing list selection
  // TODO: Replace MOCK_PACKING_LISTS with data from backend
  const availablePackingLists = MOCK_PACKING_LISTS;
  const [selectedPackingListId, setSelectedPackingListId] = useState<string>("");
  const activePackingList = availablePackingLists.find((pl) => pl.id === selectedPackingListId) ?? null;
  const activePackingItems = activePackingList?.items ?? [];

  // Packing list: map of item id → status
  const [packingStatuses, setPackingStatuses] = useState<Record<string, PackingStatus>>({});

  const handlePackingListChange = (listId: string) => {
    setSelectedPackingListId(listId);
    const list = availablePackingLists.find((pl) => pl.id === listId);
    if (list) {
      setPackingStatuses(
        list.items.reduce((acc, item) => ({ ...acc, [item.id]: "unchecked" as PackingStatus }), {} as Record<string, PackingStatus>)
      );
    } else {
      setPackingStatuses({});
    }
  };

  // Drivers
  const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>([]);
  const [isDriverDropdownOpen, setIsDriverDropdownOpen] = useState(false);

  // Issues
  const [linkedIssueIds, setLinkedIssueIds] = useState<string[]>([]);
  const [isIssueDropdownOpen, setIsIssueDropdownOpen] = useState(false);
  const [isAddIssueModalOpen, setIsAddIssueModalOpen] = useState(false);
  const [newlyCreatedIssues, setNewlyCreatedIssues] = useState<Issue[]>([]);

  // ── Handlers ─────

  const cyclePackingStatus = (id: string) => {
    setPackingStatuses((prev) => {
      const current = prev[id];
      const next: PackingStatus = current === "unchecked" ? "have" : current === "have" ? "dont_need" : "unchecked";
      return { ...prev, [id]: next };
    });
  };

  const toggleDriver = (driverId: string) => {
    setSelectedDriverIds((prev) =>
      prev.includes(driverId) ? prev.filter((id) => id !== driverId) : [...prev, driverId]
    );
  };

  const toggleIssue = (issueId: string) => {
    setLinkedIssueIds((prev) =>
      prev.includes(issueId) ? prev.filter((id) => id !== issueId) : [...prev, issueId]
    );
  };

  const handleNewIssueSaved = (newIssue: Issue) => {
    setNewlyCreatedIssues((prev) => [...prev, newIssue]);
    setLinkedIssueIds((prev) => [...prev, newIssue.id]);
  };

  // Combine mock issues + newly created issues for lookups
  const allIssues = [...MOCK_ISSUES, ...newlyCreatedIssues];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: wire to backend
    alert("Driving day saved (mock). Navigating back…");
    navigate("/past-driving-days");
  };

  // ── Helpers ────

  const statusBadge = (s: PackingStatus) => {
    switch (s) {
      case "have":
        return <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-800">Have</span>;
      case "dont_need":
        return <span className="text-xs font-medium px-2 py-0.5 rounded bg-yellow-600 text-white">Don't Need</span>;
      default:
        return <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-500">—</span>;
    }
  };

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
      {/* ── Title, Date & Description ──-- */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Driving Day Info</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Pre-Competition Shakedown, Endurance Practice"
            className="w-full border rounded p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border rounded p-2 md:w-1/2"
          />
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

      {/* ── Packing List ─── */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold">Packing List</h2>
          <p className="text-sm text-gray-500 mt-1">Select a packing list, then click a row to cycle: unchecked → have → don't need</p>
          <select
            value={selectedPackingListId}
            onChange={(e) => handlePackingListChange(e.target.value)}
            className="mt-2 w-full md:w-1/2 border rounded p-2"
          >
            <option value="">— Choose a packing list —</option>
            {availablePackingLists.map((pl) => (
              <option key={pl.id} value={pl.id}>{pl.name}</option>
            ))}
          </select>
        </div>

        {activePackingItems.length > 0 ? (
          <div className="max-h-72 overflow-y-auto">
            <table className="w-full font-face table-fixed">
              <colgroup>
                <col style={{ width: "50%" }} />
                <col style={{ width: "25%" }} />
                <col style={{ width: "25%" }} />
              </colgroup>
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left font-medium">Item</th>
                  <th className="px-6 py-3 text-left font-medium">Required</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {activePackingItems.map((item, idx) => (
                  <tr
                    key={item.id}
                    onClick={() => cyclePackingStatus(item.id)}
                    className={`
                      odd:bg-white even:bg-blue-50
                      hover:bg-gray-200 cursor-pointer
                      ${idx !== activePackingItems.length - 1 ? "border-b border-gray-100" : ""}
                    `}
                  >
                    <td className="px-6 py-3">{item.name}</td>
                    <td className="px-6 py-3">
                      {item.required ? (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-100 text-red-800">Required</span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-600">Optional</span>
                      )}
                    </td>
                    <td className="px-6 py-3">{statusBadge(packingStatuses[item.id])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gray-400">
            {selectedPackingListId ? "This packing list has no items." : "Select a packing list above to get started."}
          </div>
        )}
      </div>

      {/* ── Drivers -- */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Drivers</h2>

        {/* Dropdown selector */}
        <div className="relative mb-3">
          <button
            type="button"
            onClick={() => setIsDriverDropdownOpen(!isDriverDropdownOpen)}
            className="w-full border rounded p-2 text-left flex justify-between items-center"
          >
            <span>
              {selectedDriverIds.length > 0
                ? `Selected (${selectedDriverIds.length})`
                : "Select drivers for this day"}
            </span>
            <span>{isDriverDropdownOpen ? "▲" : "▼"}</span>
          </button>
          {isDriverDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
              {MOCK_DRIVERS.map((d) => (
                <div
                  key={d.driverId}
                  className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => toggleDriver(d.driverId)}
                >
                  <input
                    type="checkbox"
                    checked={selectedDriverIds.includes(d.driverId)}
                    onChange={() => {}}
                    className="mr-2"
                  />
                  {d.firstName} {d.lastName}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected driver chips */}
        <div className="flex gap-2 flex-wrap">
          {selectedDriverIds.map((id) => {
            const d = MOCK_DRIVERS.find((dr) => dr.driverId === id)!;
            return (
              <span
                key={id}
                className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center"
              >
                {d.firstName} {d.lastName}
                <button
                  type="button"
                  className="ml-1.5 text-blue-800 hover:text-blue-900"
                  onClick={() => toggleDriver(id)}
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Associated Issues */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Associated Issues</h2>
          <button
            type="button"
            onClick={() => setIsAddIssueModalOpen(true)}
            className="bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 focus:outline-none"
          >
            + New Issue
          </button>
        </div>

        {/* Dropdown selector */}
        <div className="relative mb-3">
          <button
            type="button"
            onClick={() => setIsIssueDropdownOpen(!isIssueDropdownOpen)}
            className="w-full border rounded p-2 text-left flex justify-between items-center"
          >
            <span>
              {linkedIssueIds.length > 0
                ? `Linked (${linkedIssueIds.length})`
                : "Link existing issues"}
            </span>
            <span>{isIssueDropdownOpen ? "▲" : "▼"}</span>
          </button>
          {isIssueDropdownOpen && (
            <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
              {allIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => toggleIssue(issue.id)}
                >
                  <input
                    type="checkbox"
                    checked={linkedIssueIds.includes(issue.id)}
                    onChange={() => {}}
                    className="mr-2"
                  />
                  <span className="font-medium mr-2">#{issue.issue_number}</span>
                  <span className="text-gray-600 truncate">{issue.synopsis}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Linked issues table */}
        {linkedIssueIds.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mt-3">
            <table className="w-full font-face table-fixed">
              <colgroup>
                <col style={{ width: "10%" }} />
                <col style={{ width: "30%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-4 py-3 text-left font-medium">#</th>
                  <th className="px-4 py-3 text-left font-medium">Synopsis</th>
                  <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Subsystems</th>
                  <th className="px-4 py-3 text-left font-medium">Priority</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {linkedIssueIds.map((id) => {
                  const issue = allIssues.find((i) => i.id === id)!;
                  return (
                    <tr
                      key={issue.id}
                      className="odd:bg-white even:bg-blue-50 border-b border-gray-100"
                    >
                      <td className="px-4 py-3 font-medium">{issue.issue_number}</td>
                      <td className="px-4 py-3 break-words">{issue.synopsis}</td>
                      <td className="hidden sm:table-cell px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {issue.subsystems.map((s) => (
                            <span key={s} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">{s}</span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => toggleIssue(issue.id)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddIssueModal
        isOpen={isAddIssueModalOpen}
        onClose={() => setIsAddIssueModalOpen(false)}
        onSave={handleNewIssueSaved}
      />

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => navigate("/past-driving-days")}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Driving Day
        </button>
      </div>
    </form>
  );
}