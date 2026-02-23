import React from "react";
import { useNavigate } from "react-router-dom";

interface DrivingDay {
  id: string;
  day_number: number;
  title: string;
  date: string;
  description: string;
  drivers: string[];
  packingLists: string[];
  issueCount: number;
}

// Placeholder data until backend is connected
const MOCK_DRIVING_DAYS: DrivingDay[] = [
  { id: "1", day_number: 1, title: "Pre-Season Shakedown", date: "2026-01-10", description: "Initial test of all systems", drivers: ["Alex Johnson", "Jordan Smith"], packingLists: ["Standard Track Day"], issueCount: 2 },
  { id: "2", day_number: 2, title: "Brake Tuning Session", date: "2026-01-17", description: "Focus on brake bias adjustment", drivers: ["Casey Williams"], packingLists: ["Minimal Shakedown"], issueCount: 1 },
  { id: "3", day_number: 3, title: "Endurance Practice", date: "2026-01-24", description: "Full endurance simulation", drivers: ["Alex Johnson", "Morgan Brown", "Jordan Smith"], packingLists: ["Standard Track Day", "Minimal Shakedown"], issueCount: 3 },
  { id: "4", day_number: 4, title: "Suspension Setup", date: "2026-02-01", description: "Damper and spring tuning", drivers: ["Morgan Brown"], packingLists: ["Minimal Shakedown"], issueCount: 0 },
  { id: "5", day_number: 5, title: "Full Dress Rehearsal", date: "2026-02-08", description: "Competition-day simulation", drivers: ["Alex Johnson", "Jordan Smith", "Casey Williams", "Morgan Brown"], packingLists: ["Standard Track Day"], issueCount: 4 },
];

export default function DrivingDaysTable() {
  const navigate = useNavigate();
  const drivingDays = MOCK_DRIVING_DAYS;

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full font-face table-fixed">
          <colgroup>
            <col style={{ width: "8%" }} />
            <col style={{ width: "22%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "22%" }} />
            <col style={{ width: "22%" }} />
            <col style={{ width: "14%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4 text-left font-medium text-lg">#</th>
              <th className="px-6 py-4 text-left font-medium">Title</th>
              <th className="px-6 py-4 text-left font-medium">Date</th>
              <th className="px-6 py-4 text-left font-medium hidden sm:table-cell">Drivers</th>
              <th className="px-6 py-4 text-left font-medium hidden md:table-cell">Packing Lists</th>
              <th className="px-6 py-4 text-left font-medium">
                <div className="flex items-center justify-between">
                  <span className="hidden sm:inline">Issues</span>
                  <button
                    onClick={() => navigate("/new-driving-day")}
                    className="ml-4 bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 focus:outline-none"
                  >
                    Add
                  </button>
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {drivingDays.map((day, index) => (
              <tr
                key={day.id}
                className={`
                  odd:bg-white even:bg-blue-50
                  hover:bg-gray-200
                  cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
                  ${index !== drivingDays.length - 1 ? "border-b border-gray-100" : ""}
                `}
                tabIndex={0}
              >
                <td className="px-6 py-4 sm:py-3 text-lg font-medium">
                  {day.day_number}
                </td>
                <td className="px-6 py-4 sm:py-3">
                  <div className="font-medium">{day.title}</div>
                  <div className="text-xs text-gray-500 truncate">{day.description}</div>
                </td>
                <td className="px-6 py-4 sm:py-3 text-gray-600 whitespace-nowrap">
                  {day.date}
                </td>
                <td className="hidden sm:table-cell px-6 py-4 sm:py-3">
                  <div className="flex flex-wrap gap-1">
                    {day.drivers.map((driver) => (
                      <span
                        key={driver}
                        className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded"
                      >
                        {driver}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="hidden md:table-cell px-6 py-4 sm:py-3">
                  <div className="flex flex-wrap gap-1">
                    {day.packingLists.map((pl) => (
                      <span
                        key={pl}
                        className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded"
                      >
                        {pl}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 sm:py-3 text-gray-600">
                  {day.issueCount > 0 ? (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">
                      {day.issueCount}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
            {drivingDays.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No driving days found. Click "Add" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
