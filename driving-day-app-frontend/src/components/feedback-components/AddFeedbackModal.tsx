import React, { useEffect, useState } from "react";
import './AddFeedbackModal.css'
import DatePicker from "react-datepicker";
import { postFeedback } from '../../api/api';
import { Likert, Feedback } from "../../utils/DataTypes";
import Modal from "../issues-components/Modal";

const questionList = [
  { key: 'understeer', label: 'Did the car seem to understeer?' },
  { key: 'oversteer', label: 'Did the car seem to oversteer?' },
  { key: 'brakes', label: 'Were the brakes feeling consistent?' },
  { key: 'balance', label: 'Was the car balance acceptable?' },
  { key: 'suspension', label: 'Was the suspension compliant and predictable?' },
]

interface AddFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newFeedback: Feedback) => void;
}

export default function AddFeedbackModal({ isOpen, onClose, onSave }: AddFeedbackModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [feedback, setFeedback] = useState<Omit<Feedback, "id">>({
    feedback_number: -1,
    driver: "",
    synopsis: "",
    date: today,
    responses: questionList.reduce((acc, q) => ({ ...acc, [q.key]: 'n/a' as Likert }), {} as Record<string, Likert>),
    comments: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // reset when modal closes
      setFeedback({
        feedback_number: -1,
        driver: "",
        synopsis: "",
        date: today,
        responses: questionList.reduce((acc, q) => ({ ...acc, [q.key]: 'n/a' as Likert }), {} as Record<string, Likert>),
        comments: "",
      });
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, today]);

  const handleResponseChange = (key: string, value: Likert) => {
    setFeedback(prev => ({ ...prev, responses: { ...prev.responses, [key]: value } }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!feedback.driver || !feedback.date) {
      setError("Driver and date are required.");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        driver: feedback.driver,
        synopsis: feedback.synopsis || "",
        date: new Date(feedback.date).toISOString(),
        responses: feedback.responses,
        comments: feedback.comments || ""
      };

      const result = await postFeedback(payload);

      if (result && "data" in result) {
        const feedbackId = result.data?.feedback_id ?? result.data?.id ?? "";
        setSuccess(true);
        onSave({ ...feedback, id: feedbackId });
        onClose();
      } else {
        throw new Error("Failed to submit feedback");
      }
    } catch (err) {
      setError("Error submitting feedback. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Centered, scrollable modal card that takes ~80% of viewport height */}
      <div className="flex items-center justify-center p-4">
        <div className="w-full max-w-3xl h-[80vh] max-h-[80vh] bg-white rounded shadow overflow-auto">
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Driver Feedback</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div>
                <label className="block text-sm font-medium mb-1">Driver</label>
                <input
                  type="text"
                  value={feedback.driver}
                  onChange={(e) => setFeedback(prev => ({ ...prev, driver: e.target.value }))}
                  placeholder="Enter driver:"
                  className="w-full border rounded p-2"
                  disabled={isLoading}
                />
              </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Synopsis</label>
                  <input
                    value={feedback.synopsis}
                    placeholder="Enter run title..."
                    onKeyDown={(event) => {
                      if (event.key === " ") {
                        event.preventDefault()
                        setFeedback(prev => ({ ...prev, synopsis: prev.synopsis + "-" }))
                      }
                    }}
                    onChange={(e) => setFeedback(prev => ({ ...prev, synopsis: e.target.value.toLocaleLowerCase() }))}
                    className="w-full border rounded p-2"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <DatePicker
                      className="w-full border rounded p-2"
                      selected={feedback.date ? new Date(feedback.date) : null}
                      onChange={(date: Date | null) => setFeedback(prev => ({ ...prev, date: date ? date.toISOString().split("T")[0] : "" }))}
                      disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-3">
                {questionList.map(q => (
                  <div key={q.key} className="p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className="w-1/2 text-sm font-medium">{q.label}</div>
                      <select
                        value={feedback.responses[q.key]}
                        onChange={(e) => handleResponseChange(q.key, e.target.value as Likert)}
                        className="border p-2 rounded"
                        disabled={isLoading}
                      >
                        <option value="n/a">N/A</option>
                        <option value="no">No</option>
                        <option value="somewhat">Somewhat</option>
                        <option value="yes">Yes</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Additional comments</label>
                <textarea value={feedback.comments} onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))} rows={4} className="w-full border rounded p-2" disabled={isLoading} />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border rounded"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>

              {success && (
                <div className="p-3 bg-green-100 border border-green-200 rounded text-green-800">Thank you — feedback submitted.</div>
              )}
            </form>
          </div>
        </div>
      </div>
    </Modal>
  );
}
