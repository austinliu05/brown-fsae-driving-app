import React from "react";
import DrivingDaysTable from "../../components/past-driving-days-components/DrivingDaysTable";
import PageBase from "../../components/base-components/PageBase";

const PastDrivingDaysPage: React.FC = () => {
  return (
    <PageBase>
        <h1 className="mb-6 text-2xl font-semibold">Driving Days</h1>
        <DrivingDaysTable />
    </PageBase>
  );
};

export default PastDrivingDaysPage;