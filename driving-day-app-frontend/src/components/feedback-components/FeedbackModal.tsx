import React, { useState, useEffect, useRef } from "react";
import Modal from "../shared/Modal";
import DatePicker from "react-datepicker";
import { updateFeedback, deleteFeedback } from "../../api/api";
import { Feedback, ResponseValue } from "../../utils/DataTypes";
import { questionList, pages, pageTitles } from "./AddFeedbackModal";
import { QuestionField, toggleMulti, normalizeDateInput, formatMultiDisplay, toISODate } from '../../utils/feedbackHelpers';

interface FeedbackModalProps {
  feedback: Feedback;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newFeedback?: Feedback) => void;
}

export default function FeedbackModal({
  feedback,
  isOpen,
  onClose,
  onSave,
}: FeedbackModalProps) {
  const [editMode, setEditMode] = useState(false);
  const [editedFeedback, setEditedFeedback] = useState<Feedback>(feedback);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const normalizedDate = normalizeDateInput(feedback?.date);
    setEditedFeedback({ ...feedback, date: normalizedDate, responses: { ...(feedback.responses || {}) } } as Feedback);
  }, [feedback]);

  useEffect(() => {
    if (isOpen) {
      // reset to first page when modal opens or edit mode changes
      setCurrentPage(0);
    }
  }, [isOpen, editMode]);

  // scroll to top when page changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      try { scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' }); }
      catch { scrollContainerRef.current.scrollTop = 0; }
    }
  }, [currentPage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await updateFeedback(editedFeedback.id, {
        driver: editedFeedback.driver,
        date: toISODate(editedFeedback.date),
        responses: editedFeedback.responses,
      });

      if (response.status !== 200) {
        throw new Error("Failed to update feedback");
      }
      setEditMode(false);
      onSave();
    } catch (err) {
      setError("Failed to update feedback. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await deleteFeedback(editedFeedback.id);
      if (response.status !== 200) {
        throw new Error("Failed to delete feedback");
      }
      onSave();
      onClose();
    } catch (err) {
      setError("Failed to delete feedback. Please try again.");
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleResponseChange = (key: string, value: ResponseValue) => {
    setEditedFeedback(prev => ({ ...prev, responses: { ...(prev.responses || {}), [key]: value } } as Feedback));
  }

  const handleMultiToggle = (key: string, option: string) => {
    const current = (editedFeedback.responses && (editedFeedback.responses as any)[key]) || '';
    const newVal = toggleMulti(current as string, option);
    handleResponseChange(key, newVal as ResponseValue);
  }

  const goNext = () => setCurrentPage(p => Math.min(p + 1, pages.length - 1));
  const goPrev = () => setCurrentPage(p => Math.max(p - 1, 0));

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setEditMode(false);
        setEditedFeedback({ ...feedback, responses: { ...(feedback.responses || {}) } } as Feedback);
        setShowDeleteConfirm(false);
        setCurrentPage(0);
        onClose();
      }}
    >
      <div className="flex items-center justify-center p-4">
        <div ref={scrollContainerRef} className="w-full max-w-3xl max-h-[90vh] sm:max-h-[80vh] bg-white rounded shadow overflow-auto">
          <div className="p-6">
            {editMode ? (
              <>
                {showDeleteConfirm ? (
                  <div className="space-y-4">
                    <p>Are you sure you want to delete this feedback?</p>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 border rounded"
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleDeleteConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-red-300"
                        disabled={isLoading}
                      >
                        {isLoading ? "Deleting..." : "Confirm Delete"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={(e) => e.preventDefault()}>
                    {error && <p className="text-red-500 mb-4">{error}</p>}

                    <div className="space-y-4">
                      {/* Driver + Date */}
                      {currentPage === 0 && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium mb-1">Driver</label>
                            <input
                              type="text"
                              value={editedFeedback.driver || ""}
                              onChange={(e) => setEditedFeedback(prev => ({ ...prev, driver: e.target.value } as Feedback))}
                              className="w-full border p-2 rounded"
                              disabled={isLoading}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Driving Day Date</label>
                            <DatePicker
                              className="w-full border rounded p-2"
                              selected={editedFeedback.date ? new Date(editedFeedback.date) : null}
                              onChange={(date: Date | null) => setEditedFeedback(prev => ({ ...prev, date: date ? normalizeDateInput(date) : '' } as Feedback))}
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      )}

                      {/* Page content */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-bold mb-2">{pageTitles[currentPage]}</h3>
                        <div className="mb-2">
                          <div className="text-sm">Page {currentPage + 1} of {pages.length}</div>
                          <div className="w-full bg-gray-200 rounded h-2 mt-1">
                            <div className="bg-blue-500 h-2 rounded" style={{ width: `${Math.round(((currentPage + 1) / pages.length) * 100)}%` }} />
                          </div>
                        </div>

                        {pages[currentPage].map(key => {
                          const q = questionList.find(qi => qi.key === key)!;
                          const value = (editedFeedback.responses && (editedFeedback.responses as any)[key]) as string || '';
                          return (
                            <QuestionField
                              key={q.key}
                              q={q}
                              value={value}
                              onChange={(v) => handleResponseChange(q.key, v)}
                              onMultiToggle={(opt) => handleMultiToggle(q.key, opt)}
                              isLoading={isLoading}
                            />
                          )
                        })}
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex w-full gap-2 sm:w-auto">
                          <button
                            type="button"
                            onClick={goPrev}
                            className="flex-1 px-4 py-2 border rounded sm:flex-none"
                            disabled={isLoading || currentPage === 0}
                          >
                            Prev
                          </button>
                          {currentPage < pages.length - 1 ? (
                            <button
                              type="button"
                              onClick={goNext}
                              className="flex-1 px-4 py-2 bg-gray-800 text-white rounded sm:flex-none"
                              disabled={isLoading}
                            >
                              Next
                            </button>
                          ) : (
                            <button
                              type="submit"
                              onClick={handleSubmit}
                              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300 sm:flex-none"
                              disabled={isLoading}
                            >
                              {isLoading ? "Saving..." : "Save"}
                            </button>
                          )}
                        </div>

                        <div className="flex w-full gap-2 sm:w-auto">
                          <button
                            type="button"
                            onClick={() => {
                              setEditMode(false);
                              setEditedFeedback({ ...feedback, responses: { ...(feedback.responses || {}) } } as Feedback);
                            }}
                            className="flex-1 px-4 py-2 border rounded sm:flex-none"
                            disabled={isLoading}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex-1 px-4 py-2 bg-red-500 text-white rounded disabled:bg-red-300 sm:flex-none"
                            disabled={isLoading}
                          >
                            {isLoading ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </>
            ) : (
              <div>
                <div className="flex justify-between mb-4">
                  <h2 className="text-xl font-bold">Feedback #{editedFeedback.feedback_number}</h2>
                </div>

                <div className="space-y-4">
                  <p className="break-words"><strong>Driver:</strong> {editedFeedback.driver || "—"}</p>
                  <p><strong>Driving Day Date:</strong> {editedFeedback.date ? (editedFeedback.date.toString().slice(0,10)) : '—'}</p>

                  <div>
                    <strong>Responses:</strong>
                      <div className="mt-2 space-y-3">
                        {editedFeedback.responses ? (
                          pages.map((pageKeys, pageIdx) => {
                            const items = pageKeys.map((key) => {
                              const q = questionList.find(qi => qi.key === key);
                              if (!q) return null;
                              const raw = (editedFeedback.responses as Record<string, any>)[q.key];
                              let display: React.ReactNode = 'N/A';

                              if (q.type === 'multi') {
                                display = formatMultiDisplay(typeof raw === 'string' ? raw : undefined);
                              } else if (q.type === 'yesOther' || q.type === 'noOther') {
                                if (raw === 'yes' || raw === 'no') display = raw;
                                else if (raw && raw !== 'n/a') display = raw;
                                else display = 'N/A';
                              } else { // text
                                display = raw && raw !== 'n/a' ? raw : 'N/A';
                              }

                              const answered = typeof display === 'string' ? display !== 'N/A' && display !== '' : !!display;
                              return answered ? { q, display } : null;
                            }).filter(Boolean) as Array<{ q: any, display: React.ReactNode }>;

                            if (items.length === 0) return null;

                            return (
                              <details key={pageIdx} className="p-3 border rounded" open>
                                <summary className="font-semibold cursor-pointer">{pageTitles[pageIdx]} <span className="text-sm text-gray-500">({items.length})</span></summary>
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                  {items.map(it => (
                                    <li key={it.q.key} className="break-words"><strong>{it.q.label}</strong>: {it.display}</li>
                                  ))}
                                </ul>
                              </details>
                            );
                          })
                        ) : (
                          <div className="text-gray-500 italic">No responses</div>
                        )}
                      </div>
                  </div>

                  <div className="flex justify-end mb-4">
                    <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-gray-100 rounded">Edit</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
