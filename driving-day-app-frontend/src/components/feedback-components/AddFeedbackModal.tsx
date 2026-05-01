import React, { useEffect, useState, useRef } from "react";
import './AddFeedbackModal.css'
import DatePicker from "react-datepicker";
import { postFeedback } from '../../api/api';
import { Feedback } from "../../types/Feedback";
import { ResponseValue, QType } from "../../types/Feedback";
import { QuestionField, toggleMulti, normalizeDateInput, toISODate } from '../../utils/feedbackHelpers';
import Modal from "../shared/Modal";
import feedbackQuestionsData from '../../constants/feedbackQuestions.json';

export const questionList: {
  key: string;
  label: string;
  type: QType;
  options?: string[];
  placeholder?: string;
}[] = feedbackQuestionsData.questionList as {
  key: string;
  label: string;
  type: QType;
  options?: string[];
  placeholder?: string;
}[];

export const pages: string[][] = feedbackQuestionsData.pages;

export const pageTitles: string[] = feedbackQuestionsData.pageTitles;

interface AddFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (newFeedback: Feedback) => void;
}

export default function AddFeedbackModal({ isOpen, onClose, onSave }: AddFeedbackModalProps) {
  const today = normalizeDateInput(new Date());
  const [feedback, setFeedback] = useState<Omit<Feedback, "id">>({
    feedback_number: -1,
    driver: "",
    date: today,
    responses: questionList.reduce((acc, q) => ({ ...acc, [q.key]: 'n/a' as ResponseValue }), {} as Record<string, ResponseValue>)
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      // reset when modal closes
      setFeedback({
        feedback_number: -1,
        driver: "",
        date: today,
        responses: questionList.reduce((acc, q) => ({ ...acc, [q.key]: 'n/a' as ResponseValue }), {} as Record<string, ResponseValue>)
      });
      setError(null);
      setSuccess(false);
      setCurrentPage(0);
    } else {
      // reset to first page when modal opens
      setCurrentPage(0);
    }
  }, [isOpen, today]);

  const handleResponseChange = (key: string, value: ResponseValue) => {
    setFeedback(prev => ({ ...prev, responses: { ...prev.responses, [key]: value } }));
  }

  const goNext = () => setCurrentPage(p => Math.min(p + 1, pages.length - 1));
  const goPrev = () => setCurrentPage(p => Math.max(p - 1, 0));

  // Ref to the scrollable modal content so we can scroll to top when changing pages
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Whenever the current page changes, scroll the modal content to top so the
  // user doesn't land halfway down the previous page.
  useEffect(() => {
    if (scrollContainerRef.current) {
      // Use smooth scrolling for nicer UX; can change to 'auto' if preferred.
      try { scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' }); }
      catch { scrollContainerRef.current.scrollTop = 0; }
    }
  }, [currentPage]);

  const getQuestion = (key: string) => questionList.find(q => q.key === key)!;

  const handleMultiToggle = (key: string, option: string) => {
    const current = feedback.responses[key] || '';
    const newVal = toggleMulti(current as string, option);
    handleResponseChange(key, newVal as ResponseValue);
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
        date: toISODate(feedback.date),
        responses: feedback.responses,
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
       <div ref={scrollContainerRef} className="w-full max-w-3xl h-[80vh] max-h-[80vh] bg-white rounded shadow overflow-auto">
          <div className="p-6">
            {currentPage === 0 && (<h2 className="text-xl font-bold mb-4">Driver Feedback</h2>)}
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              {currentPage === 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Driver</label>
                    <input
                      type="text"
                      value={feedback.driver}
                      onChange={(e) => setFeedback(prev => ({ ...prev, driver: e.target.value }))}
                      placeholder="Enter driver"
                      className="w-full border rounded p-2"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Driving Day Date</label>
                    <DatePicker
                        className="w-full border rounded p-2"
                        selected={feedback.date ? new Date(feedback.date) : null}
                        onChange={(date: Date | null) => setFeedback(prev => ({ ...prev, date: date ? normalizeDateInput(date) : "" }))}
                        disabled={isLoading}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {/* Page title */}
                <h3 className="text-lg font-bold mb-2">{pageTitles[currentPage]}</h3>
                {/* Progress */}
                <div className="mb-2">
                  <div className="text-sm">Page {currentPage + 1} of {pages.length}</div>
                  <div className="w-full bg-gray-200 rounded h-2 mt-1">
                    <div className="bg-blue-500 h-2 rounded" style={{ width: `${Math.round(((currentPage + 1) / pages.length) * 100)}%` }} />
                  </div>
                </div>

                {pages[currentPage].map(key => {
                  const q = getQuestion(key);
                  const value = feedback.responses[key] as string || '';
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
              
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={goPrev}
                    className="px-4 py-2 border rounded"
                    disabled={isLoading || currentPage === 0}
                  >
                    Prev
                  </button>
                  {currentPage < pages.length - 1 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      className="px-4 py-2 bg-gray-800 text-white rounded"
                      disabled={isLoading}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-blue-300"
                      disabled={isLoading}
                    >
                      {isLoading ? "Submitting..." : "Submit Feedback"}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border rounded"
                  disabled={isLoading}
                >
                  Cancel
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
