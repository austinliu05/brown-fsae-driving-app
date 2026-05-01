import React from "react";
import PageBase from "../../components/base-components/PageBase";
import NewDrivingDayEntry from "../../components/new-driving-day-components/NewDrivingDayEntry";

const NewDrivingDayPage: React.FC = () => {
  return (
    <PageBase>
        <h1 className="mb-6 text-2xl font-semibold">New Driving Day</h1>
        <NewDrivingDayEntry />
    </PageBase>
  );
};

export default NewDrivingDayPage;