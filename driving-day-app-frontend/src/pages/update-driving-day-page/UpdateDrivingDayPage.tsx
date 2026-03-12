import React from "react";
import PageBase from "../../components/base-components/PageBase";
import UpdateDrivingDayEntry from "../../components/new-driving-day-components/UpdateDrivingDayEntry";

const UpdateDrivingDayPage: React.FC = () => {
  return (
    <PageBase>
      <h1 className="mb-6 text-2xl font-semibold">Edit Driving Day</h1>
      <UpdateDrivingDayEntry />
    </PageBase>
  );
};

export default UpdateDrivingDayPage;
