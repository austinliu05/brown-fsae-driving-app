import React, {useState, useEffect} from "react";
import GeneralRunBubble from "../../components/run-components/GeneralRunBubble";
import PageBase from "../../components/base-components/PageBase";
import { useNavigate } from "react-router-dom";
import { getGeneralRunData } from "../../api/api";

/**
 * 
 * @returns A React component
 */
const RunSummaryPage: React.FC = () => {

  const navigate = useNavigate();

  // JSON array of general run data
  const [generalRuns, setGeneralRuns] = useState<any[]>([])
  
  const handleRunClick = (runTitle: string, runDate: string, driverId: string) => {
    navigate(`/run/${runTitle}`, {
      state: {
        "run-date": runDate,
        "driver-id": driverId
      }
    });
  };

  const fetchGeneralRunData = async () => {
    const response = await getGeneralRunData({
      // TOOO: Detect filters
    })
    if (response.status === 200){
      setGeneralRuns(response.data.recentRuns)
    }

  }

  useEffect(() => {
    fetchGeneralRunData()
  }, [])

  return (
    <PageBase>
      <h1 className="mb-6 text-2xl font-semibold">Summary of Runs</h1>

        {/** Create Actual Filtering System */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <select className="px-4 py-2 border border-gray-200 rounded-md bg-white min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent">
            <option value="10/15/2024">Date: 10/15/2024</option>
          </select>

          <select className="px-4 py-2 border border-gray-200 rounded-md bg-white min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent">
            <option value="all">Driver: All</option>
          </select>

          <select className="px-4 py-2 border border-gray-200 rounded-md bg-white min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent">
            <option value="engine">Filter by: Engine</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-min">
          {generalRuns.map((generalRun, index) => (
            <GeneralRunBubble
              key={index}
              runTitle={generalRun['id']}
              runDate={generalRun['run-date']}
              driverId={generalRun['driver-id']}
              onClick={() => 
                handleRunClick(generalRun['id'], generalRun['run-date'], generalRun['driver-id'])
              }
            />
          ))}
        </div>
    </PageBase>
  );
};

export default RunSummaryPage;
