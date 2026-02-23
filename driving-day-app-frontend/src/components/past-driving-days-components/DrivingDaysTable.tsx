import React from "react";
import { useNavigate } from "react-router-dom";

interface DrivingDay {
  id: string;
  day_number: number;
  title: string;
  date: string;
  drivers: string[];
  packingList: string;
}

// Placeholder data until backend is connected
const MOCK_DRIVING_DAYS: DrivingDay[] = [
  { id: "1", day_number: 1, title: "Pre-Season Shakedown", date: "2026-01-10", drivers: ["Alex Johnson", "Jordan Smith"], packingList: "Standard Track Day" },
  { id: "2", day_number: 2, title: "Brake Tuning Session", date: "2026-01-17", drivers: ["Casey Williams"], packingList: "Minimal Shakedown" },
  { id: "3", day_number: 3, title: "Endurance Practice", date: "2026-01-24", drivers: ["Alex Johnson", "Morgan Brown", "Jordan Smith"], packingList: "Standard Track Day" },
  { id: "4", day_number: 4, title: "Suspension Setup", date: "2026-02-01", drivers: ["Morgan Brown"], packingList: "Minimal Shakedown" },
  { id: "5", day_number: 5, title: "Full Dress Rehearsal", date: "2026-02-08", drivers: ["Alex Johnson", "Jordan Smith", "Casey Williams", "Morgan Brown"], packingList: "Standard Track Day" },
];

export default function DrivingDaysTable() {
  const navigate = useNavigate();
  const drivingDays = MOCK_DRIVING_DAYS;

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full font-face table-fixed">
          <colgroup>
            <col style={{ width: "10%" }} />
            <col style={{ width: "25%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4 text-left font-medium text-lg">
                #
              </th>
              <th className="px-6 py-4 text-left font-medium">Title</th>
              <th className="px-6 py-4 text-left font-medium">Date</th>
              <th className="px-6 py-4 text-left font-medium hidden sm:table-cell">Drivers</th>
              <th className="px-6 py-4 text-left font-medium">
                <div className="flex items-center justify-between">
                  <span className="hidden sm:inline">Packing List</span>
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
                <td className="px-6 py-4 sm:py-3 font-medium">
                  {day.title}
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
                <td className="px-6 py-4 sm:py-3 text-gray-600">
                  <span className="hidden sm:inline">{day.packingList}</span>
                </td>
              </tr>
            ))}
            {drivingDays.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
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
