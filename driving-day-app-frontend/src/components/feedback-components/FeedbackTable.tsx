import React, { useState, useEffect, useMemo } from "react";
import FeedbackModal from "./FeedbackModal";
import AddFeedbackModal from "./AddFeedbackModal";
import { getFeedbackPaginated, getAllFeedback } from "../../api/api";
import Pagination from "../pagination-components/Pagination";
import { Feedback } from "../../utils/DataTypes";
import { Stack } from "../../utils/CustomDataStructs";
import FiltersBase from "../base-components/FiltersBase";

const globalPageSize = 20
// Use a STACK to keep track of all (startAfterDoc) entries
const pageStartStack = new Stack<string>()

export default function FeedbackTable() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [groupByDate, setGroupByDate] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<string>("");
  const [allFeedback, setAllFeedback] = useState<Feedback[] | null>(null);

  // Auto-enable groupByDate when a date filter is applied
  useEffect(() => {
    if (dateFilter && !groupByDate) {
      setGroupByDate(true);
    }
  }, [dateFilter, groupByDate]);
  const [isFullLoading, setIsFullLoading] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * useState hook that stores filter options
   */
  const [driverNameFilter, setDriverNameFilter] = useState<string>("");
    
  /**
   * useState hook that stores current page number (for pagination)
   */
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [isUpdating, setUpdating] = useState<boolean>(false)

  const updatePageNumber = (newPageNumber: number) => {
    let currFirstDoc : string = ""
    let currLastDoc : string = ""
    if(feedback.length > 0){
      currFirstDoc = feedback[0]['id']
      currLastDoc = feedback[feedback.length-1]['id']
    }

    // Need to fetch previous set of entries
    if(newPageNumber < pageNumber){
      const prevFirstDoc = pageStartStack.pop() || ""
      fetchFeedbackPaginated(prevFirstDoc, "")
    }
    else if(newPageNumber > pageNumber){
      pageStartStack.push(currFirstDoc)
      fetchFeedbackPaginated("", currLastDoc)
    }
    else{
      fetchFeedbackPaginated(currFirstDoc, "")
    }
    setPageNumber(newPageNumber)
  }

  const fetchFeedbackPaginated = async (startAtDoc: string, startAfterDoc: string) => {
    setUpdating(true)
    setIsLoading(true);
    setError(null);
    
    // Make request to paginated version of fetchIssues call
    const response = await getFeedbackPaginated({
      pageSize: globalPageSize,
      startAtDoc: startAtDoc,
      startAfterDoc: startAfterDoc
    })

    if(response.status === 200){
      setFeedback(response.data.feedbackPaginated)
    }
    else{
      setError("Failed to load feedback. Please try again.");
    }

    setUpdating(false)
    setIsLoading(false);
  }

  // Fetch first page when component mounts
  useEffect(() => {
    fetchFeedbackPaginated("", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Normalize date to YYYY-MM-DD
  const dayFor = (f: Feedback) => f.date ? f.date.toString().slice(0, 10) : "Unknown";

  const groupedFeedback = useMemo(() => {
    const map = {} as Record<string, Feedback[]>;
    const source = groupByDate && allFeedback ? allFeedback : feedback;
    source.forEach(f => {
      const d = dayFor(f);
      if (dateFilter && d !== dateFilter) return; // apply date filter
      if (driverNameFilter && !f.driver.toLowerCase().includes(driverNameFilter.toLowerCase())) return; // apply driver name filter
      if (!map[d]) map[d] = [];
      map[d].push(f);
    });
    return map;
  }, [feedback, dateFilter, groupByDate, allFeedback, driverNameFilter]);

  // Fetch full dataset when grouping is enabled and we haven't loaded it yet
  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      if (!groupByDate) return;
      if (allFeedback !== null) return; // already loaded
      setIsFullLoading(true);
      setError(null);
      try {
        const resp = await getAllFeedback();
        if (resp.status === 200) {
          const items = resp.data?.feedback
          if (mounted) setAllFeedback(Array.isArray(items) ? items : []);
        } else {
          if (mounted) setError("Failed to load full feedback for grouping.");
        }
      } catch (err) {
        if (mounted) setError("Failed to load full feedback for grouping.");
      } finally {
        if (mounted) setIsFullLoading(false);
      }
    }

    fetchAll();
    return () => { mounted = false; }
  }, [groupByDate, allFeedback]);

  const handleSave = (newFeedback?: Feedback) => {
    // Need to re-clear the Stack:
    pageStartStack.clear()
    setPageNumber(1)
    fetchFeedbackPaginated("", "")
  };

  return (
    <>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {isLoading && <p>Loading feedback...</p>}
      
      <div className="mb-4">
        <FiltersBase>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Driver</label>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={driverNameFilter} 
                onChange={(e) => setDriverNameFilter(e.target.value)} 
                placeholder="Search by name..."
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
              />
              {driverNameFilter && (
                <button 
                  onClick={() => setDriverNameFilter("")} 
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Date Filter</label>
            <div className="flex items-center gap-2">
              <input 
                type="date" 
                value={dateFilter} 
                onChange={(e) => setDateFilter(e.target.value)} 
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[150px]"
              />
              {dateFilter && (
                <button 
                  onClick={() => setDateFilter("")} 
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Display Options</label>
            <label className="flex items-center gap-2 cursor-pointer px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              <input 
                type="checkbox" 
                checked={groupByDate} 
                onChange={(e) => setGroupByDate(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700">Group by date</span>
            </label>
          </div>
        </FiltersBase>
      </div>

      {groupByDate ? (
        // Grouped view
        <div className="space-y-3">
          {isFullLoading && (
            <div className="text-sm text-gray-600">Loading full dataset for grouping...</div>
          )}
          {Object.keys(groupedFeedback).length === 0 && (
            <div className="text-gray-500 italic">No feedback found for the selected filter.</div>
          )}

          {Object.entries(groupedFeedback)
            .sort((a, b) => (a[0] < b[0] ? 1 : -1)) // sort desc by date string
            .map(([date, items]) => {
              const uniqueDrivers = new Set(items.map(i => i.driver)).size;
              return (
                <details key={date} className="p-3 border rounded" open>
                  <summary className="flex items-center justify-between font-semibold cursor-pointer">
                    <span>{date}</span>
                    <span className="text-sm text-gray-500">{uniqueDrivers} drivers</span>
                  </summary>

                  <div className="mt-2">
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden w-full">
                      <table className="w-full min-w-full font-face table-auto">
                        <colgroup>
                          <col style={{ width: "25%" }} />
                          <col style={{ width: "25%" }} />
                          <col style={{ width: "50%" }} />
                        </colgroup>
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="px-6 py-4 text-left font-medium text-lg">Feedback #</th>
                            <th className="px-6 py-4 text-left font-medium hidden sm:table-cell">Driver</th>
                            <th className="px-6 py-4 text-left font-medium">Driving Day Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((feed, index) => (
                            <tr
                              key={feed.id}
                              onClick={() => { setSelectedFeedback(feed); setIsModalOpen(true); }}
                              className={`odd:bg-white even:bg-blue-50 hover:bg-gray-200 cursor-pointer ${index !== items.length - 1 ? "border-b border-gray-100" : ""}`}
                              tabIndex={0}
                            >
                              <td className="px-6 py-4 sm:py-3 text-lg font-medium">{feed.feedback_number}</td>
                              <td className="hidden sm:table-cell px-6 py-4 sm:py-3 text-gray-600"><div className="break-words">{feed.driver}</div></td>
                              <td className="px-6 py-4 sm:py-3 text-gray-600 whitespace-nowrap">{feed.date ? feed.date.toString().slice(0,10) : ""}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </details>
              )
            })}
        </div>
      ) : (
        // Flat table view (existing)
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden w-full">
          <table className="w-full min-w-full font-face table-auto">
            <colgroup>
              <col style={{ width: "25%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "25%" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-4 text-left font-medium text-lg">Feedback #</th>
                <th className="px-6 py-4 text-left font-medium hidden sm:table-cell">Driver</th>
                <th className="px-6 py-4 text-left font-medium">
                  <div className="flex items-center justify-between">
                    <span>Driving Day Date</span>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="ml-4 bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600 focus:outline-none"
                    >
                      Add
                    </button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {feedback
                .filter(feed => !driverNameFilter || feed.driver.toLowerCase().includes(driverNameFilter.toLowerCase()))
                .map((feed, index) => (
                <tr
                  key={feed.id}
                  onClick={() => {
                    setSelectedFeedback(feed);
                    setIsModalOpen(true);
                  }}
                  className={`odd:bg-white even:bg-blue-50 hover:bg-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${index !== feedback.length - 1 ? "border-b border-gray-100" : ""}`}
                  tabIndex={0}
                >
                  {/* Feedback # */}
                  <td className="px-6 py-4 sm:py-3 text-lg font-medium">{feed.feedback_number}</td>

                  {/* Driver (hidden on xs) */}
                  <td className="hidden sm:table-cell px-6 py-4 sm:py-3 text-gray-600"><div className="break-words">{feed.driver}</div></td>

                  {/* Date */}
                  <td className="px-6 py-4 sm:py-3 text-gray-600 whitespace-nowrap">{feed.date ? feed.date.toString().slice(0, 10) : ""}</td>
                </tr>
              ))}
              {feedback.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">No feedback found. Click "Add Feedback" to create one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!isUpdating && 
        <Pagination
          pageSize={globalPageSize}
          pageNumber={pageNumber}
          pageQuantity={feedback.length}
          updatePageNumber={updatePageNumber}
          />
          }
          
        {selectedFeedback && (
            <FeedbackModal
              feedback={selectedFeedback}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSave={handleSave}
        />
    )}

      <AddFeedbackModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSave}
      />
    </>
  );
}
