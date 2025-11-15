import React, { useState, useEffect } from "react";
import Modal from "../issues-components/Modal";
import { updateFeedback, deleteFeedback } from "../../api/api";
import { Feedback, Likert } from "../../utils/DataTypes";

const questionList = [
  { key: 'understeer', label: 'Did the car seem to understeer?' },
  { key: 'oversteer', label: 'Did the car seem to oversteer?' },
  { key: 'brakes', label: 'Were the brakes feeling consistent?' },
  { key: 'balance', label: 'Was the car balance acceptable?' },
  { key: 'suspension', label: 'Was the suspension compliant and predictable?' },
];

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

  useEffect(() => {
    setEditedFeedback(feedback);
  }, [feedback]);

  // Convert responses to a readable string (supports both array and object forms)
  const responsesToString = (responses?: any) => {
    if (!responses) return "";
    if (Array.isArray(responses)) return (responses as string[]).join("\n");
    // assume object map: show label: value lines
    return questionList.map(q => `${q.label}: ${(responses as Record<string, string>)[q.key] ?? 'n/a'}`).join("\n");
  };

  // We won't convert freeform textarea back into the object shape anymore;
  // in edit mode we'll present per-question selects so stringToResponses is unused.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await updateFeedback(editedFeedback.id, {
        driver: editedFeedback.driver,
        date: editedFeedback.date,
        synopsis: editedFeedback.synopsis,
        responses: editedFeedback.responses,
        comments: editedFeedback.comments,
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setEditMode(false);
        setEditedFeedback(feedback);
        setShowDeleteConfirm(false);
        onClose();
      }}
    >
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
              <form onSubmit={handleSubmit}>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Driver
                      </label>
                      <input
                        type="text"
                        value={editedFeedback.driver || ""}
                        onChange={(e) =>
                          setEditedFeedback({
                            ...editedFeedback,
                            driver: e.target.value,
                          })
                        }
                        className="w-full border p-2 rounded"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={editedFeedback.date || ""}
                        onChange={(e) =>
                          setEditedFeedback({
                            ...editedFeedback,
                            date: e.target.value,
                          })
                        }
                        className="w-full border p-2 rounded"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Synopsis
                    </label>
                    <input
                      type="text"
                      value={editedFeedback.synopsis || ""}
                      onChange={(e) =>
                        setEditedFeedback({
                          ...editedFeedback,
                          synopsis: e.target.value,
                        })
                      }
                      className="w-full border p-2 rounded"
                      disabled={isLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Responses</label>
                    <div className="space-y-2">
                      {questionList.map((q) => (
                        <div key={q.key} className="flex items-center gap-3">
                          <div className="w-1/2 text-sm">{q.label}</div>
                          <select
                            value={(editedFeedback.responses && (editedFeedback.responses as any)[q.key]) || 'n/a'}
                            onChange={(e) =>
                                setEditedFeedback({
                                  ...editedFeedback,
                                  responses: {
                                    ...(editedFeedback.responses || {}),
                                    [q.key]: e.target.value as Likert,
                                  },
                                })
                              }
                            className="border p-2 rounded"
                            disabled={isLoading}
                          >
                            <option value="no">No</option>
                            <option value="somewhat">Somewhat</option>
                            <option value="yes">Yes</option>
                            <option value="n/a">N/A</option>
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Comments
                    </label>
                    <textarea
                      value={editedFeedback.comments || ""}
                      onChange={(e) =>
                        setEditedFeedback({
                          ...editedFeedback,
                          comments: e.target.value,
                        })
                      }
                      className="w-full border p-2 rounded h-24"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setEditedFeedback(feedback);
                      }}
                      className="px-4 py-2 border rounded"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-red-300"
                      disabled={isLoading}
                    >
                      {isLoading ? "Deleting..." : "Delete"}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
                      disabled={isLoading}
                    >
                      {isLoading ? "Saving..." : "Save"}
                    </button>
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
              <p className="break-words">
                <strong>Driver:</strong> {editedFeedback.driver || "—"}
              </p>
              <p>
                <strong>Date:</strong> {editedFeedback.date.toString().slice(0, 10) || "—"}
              </p>
              <p className="break-words">
                <strong>Synopsis:</strong> {editedFeedback.synopsis || "—"}
              </p>

              <div>
                <strong>Responses:</strong>
                <ul className="list-disc list-inside mt-2">
                  {editedFeedback.responses ? (
                    Array.isArray(editedFeedback.responses) ? (
                      (editedFeedback.responses as string[]).length > 0 ? (
                        (editedFeedback.responses as string[]).map((r, i) => (
                          <li key={i} className="break-words">{r}</li>
                        ))
                      ) : (
                        <li className="text-gray-500 italic">No responses</li>
                      )
                    ) : (
                      // responses as object map: show each question label and selected value
                      questionList.map((q) => (
                        <li key={q.key} className="break-words">
                          <strong>{q.label}</strong>: {(editedFeedback.responses as Record<string, any>)[q.key] ?? 'N/A'}
                        </li>
                      ))
                    )
                  ) : (
                    <li className="text-gray-500 italic">No responses</li>
                  )}
                </ul>
              </div>

              <div>
                <strong>Comments:</strong>
                <p className="mt-2 whitespace-pre-wrap break-words">
                  {editedFeedback.comments || <span className="text-gray-500 italic">No comments</span>}
                </p>
              </div>

              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-gray-100 rounded"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
