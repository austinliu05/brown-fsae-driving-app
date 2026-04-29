import React, { useEffect } from "react";


interface SpecificRunBubbleProps {
  runTitle: string,
  runDate: string,
  driverId: string
    // Implicily a JSON type
  keyPoints: any,
  keyCategories: string[],
}

export default function SpecificRunBubble({
  runTitle,
  runDate,
  driverId,
  keyPoints,
  keyCategories,
}: SpecificRunBubbleProps) {


    useEffect(() => {
        // TODO: Pull driver
    }, [])

  return (
    <div
      className="font-face bg-white rounded-lg border border-gray-200 p-4 focus:outline-none"
      role="button"
      tabIndex={0}
    >
      <div className="mb-4 flex flex-col gap-2 border-b border-gray-100 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-lg font-medium">
          <p>Title: {runTitle}</p>
        </span>
        <div className="text-sm text-gray-600 break-words">
          <span className="mr-2">Driver: {driverId}</span>
          <span>Date: {runDate}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {keyCategories.map((category, index) => (
          <div
            key={`${category}-${index}`}
            className="flex justify-between items-center"
          >
            <span className="text-gray-600">{category}</span>
            <span className="font-medium">{keyPoints[category]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};