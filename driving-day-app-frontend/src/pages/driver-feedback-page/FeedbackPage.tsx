import React from "react";
import PageBase from "../../components/base-components/PageBase";
import FeedbackTable from "../../components/feedback-components/FeedbackTable";

const FeedbackPage: React.FC = () => {
  return (
    <PageBase>
      <h1 className="mb-6 text-2xl font-semibold">Feedback</h1>
        <FeedbackTable/>
    </PageBase>
  );
};

export default FeedbackPage;
