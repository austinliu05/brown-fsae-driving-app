import React, { useState, useEffect, useContext } from "react";
import FeedbackModal from "./FeedbackModal";
import AddFeedbackModal from "./AddFeedbackModal";
import { getFeedbackPaginated } from "../../api/api";
import AppDataContext from '../contexts/AppDataContext';
import Pagination from "../pagination-components/Pagination";
import { Feedback } from "../../utils/DataTypes";
import { Stack } from "../../utils/CustomDataStructs";

const globalPageSize = 20
// Use a STACK to keep track of all (startAfterDoc) entries
const pageStartStack = new Stack<string>()

export default function FeedbackTable() {
  const { drivers } = useContext(AppDataContext)

  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    
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
      setError("Failed to load issues. Please try again.");
    }

    setUpdating(false)
    setIsLoading(false);
  }

  // Fetch first page when component mounts
  useEffect(() => {
    fetchFeedbackPaginated("", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = (newFeedback?: Feedback) => {
    // Need to re-clear the Stack:
    pageStartStack.clear()
    setPageNumber(1)
    fetchFeedbackPaginated("", "")
  };

  return (
    <>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {isLoading && <p>Loading issues...</p>}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden w-full">
        <table className="w-full min-w-full font-face table-auto">
          <colgroup>
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "20%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-100">
              <th className="px-6 py-4 text-left font-medium text-lg">
                Feedback #
              </th>
              <th className="px-6 py-4 text-left font-medium hidden sm:table-cell">Driver</th>
              <th className="px-6 py-4 text-left font-medium">Date</th>
              <th className="px-6 py-4 text-left font-medium">
                <div className="flex items-center justify-between">
                  <span>Synopsis</span>
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
            {feedback.map((feed, index) => (
              <tr
                key={feed.id}
                onClick={() => {
                  setSelectedFeedback(feed);
                  setIsModalOpen(true);
                }}
                className={`
        odd:bg-white even:bg-blue-50
        hover:bg-gray-200
        cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
        ${index !== feedback.length - 1 ? "border-b border-gray-100" : ""}
      `}
                tabIndex={0}
              >
                {/* Feedback # */}
                <td className="px-6 py-4 sm:py-3 text-lg font-medium">
                  {feed.feedback_number}
                </td>

                {/* Driver (hidden on xs) */}
                <td className="hidden sm:table-cell px-6 py-4 sm:py-3 text-gray-600">
                  <div className="break-words">{feed.driver}</div>
                </td>

                {/* Date */}
                <td className="px-6 py-4 sm:py-3 text-gray-600 whitespace-nowrap">
                  {feed.date ? feed.date.toString().slice(0, 10) : ""}
                </td>

                {/* Synopsis */}
                <td className="px-6 py-4 sm:py-3">
                  <div className="font-medium break-words">
                    {feed.synopsis}
                  </div>
                    </td>
                    
              </tr>
            ))}
            {feedback.length === 0 && !isLoading && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No feedback found. Click "Add Feedback" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
