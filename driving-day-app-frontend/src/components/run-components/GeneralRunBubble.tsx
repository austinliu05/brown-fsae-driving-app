import React, { useEffect } from "react";

interface GeneralRunBubbleProps {
  runTitle: string,
  runDate: string,
  driverId: string
  onClick?: () => void;
}

export default function GeneralRunBubble({
  runTitle,
  runDate,
  driverId,
  onClick,
}: GeneralRunBubbleProps) {


    useEffect(() => {
        // TODO: Replace with a fetch call to retrieve driver
    }, [])

    return (
        <div
            className="font-face bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            onClick={onClick}
            role="button"
            tabIndex={0}
            >
        <div className="flex justify-between mb-4 pb-2 border-b border-gray-100 flex-col">
            <span className="text-lg font-bold">
                <p>{runTitle}</p>
            </span>
            <div className="text-sm text-gray-600 flex flex-col">
                <span className="mr-2">Driver: {driverId}</span>
                <span>Date: {runDate}</span>
            </div>
        </div>
        {/**Replace with description of RUN "Test Coolant " */}
        <div className="flex flex-col">
            <div>
                <span className="text-gray-600">Desc: </span>
                <span className="font-medium">Coolant Test</span>
            </div>
        </div>
        </div>
    );
};