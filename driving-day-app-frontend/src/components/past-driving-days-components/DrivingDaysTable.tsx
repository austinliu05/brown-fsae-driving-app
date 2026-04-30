import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DrivingDay, PackingListEntry} from "../../utils/DataTypes";
import { getAllDrivingDays, getAllPackingLists } from "../../api/api";

function mapDrivingDay(raw: any): DrivingDay {
  return {
    id: raw.id,
    dayNumber: raw.day_number ?? 0,
    title: raw.title ?? "",
    date: raw.date ?? "",
    description: raw.description ?? "",
    driverIds: raw.driver_ids ?? [],
    packingLists: (raw.packing_lists ?? []).map((pl: any): PackingListEntry => ({
      packingListId: pl.packingListId ?? pl.packing_list_id ?? "",
      checkedItems: pl.checkedItems ?? pl.checked_items ?? [],
    })),
    issueIds: raw.issue_ids ?? [],
    feedback: raw.feedback ?? [],
    
  };
}

export default function DrivingDaysTable() {
  const navigate = useNavigate();
  const [drivingDays, setDrivingDays] = useState<DrivingDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [packingLists, setPackingLists] = useState<any[]>([]);

  
  useEffect(() => {
    const fetchPackingLists = async () => {
      try {
        const response = await getAllPackingLists();
        if (response.data?.packing_lists) {
          setPackingLists(response.data.packing_lists);
        }
      } catch (err) {
        console.error("Failed to fetch packing lists:", err);
      }
    };
  
    fetchPackingLists();
  }, []);

  useEffect(() => {
    const fetchDrivingDays = async () => {
      try {
        const response = await getAllDrivingDays();
        if (response.data?.driving_days) {
          setDrivingDays(response.data.driving_days.map(mapDrivingDay));
        }
      } catch (error) {
        console.error("Failed to fetch driving days:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDrivingDays();
  }, []);

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
                onClick={() => navigate("/update-driving-day", { state: { drivingDay: day } })}
              >
                <td className="px-6 py-4 sm:py-3 text-lg font-medium">
                  {day.dayNumber}
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
                    {day.driverIds.map((driverId) => (
                      <span
                        key={driverId}
                        className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded"
                      >
                        {driverId}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="hidden md:table-cell px-6 py-4 sm:py-3">
                  <div className="flex flex-wrap gap-1">
                    {day.packingLists.map((entry) => {
                      const pl = packingLists.find((p) => p.id === entry.packingListId);
                      const totalItems = pl?.items.length ?? 0;
                      const checkedCount = entry.checkedItems.length;
                      return (
                        <span
                          key={entry.packingListId}
                          className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded"
                        >
                          {pl?.name ?? entry.packingListId} ({checkedCount}/{totalItems})
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-6 py-4 sm:py-3 text-gray-600">
                  {day.issueIds.length > 0 ? (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">
                      {day.issueIds.length}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Loading driving days…
                </td>
              </tr>
            )}
            {!isLoading && drivingDays.length === 0 && (
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
