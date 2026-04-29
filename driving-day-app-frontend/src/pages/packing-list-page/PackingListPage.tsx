import React from "react";
import PackingListTable from "../../components/packing-list-components/PackingListTable";
import PageBase from "../../components/base-components/PageBase";

const PackingListPage: React.FC = () => {
  return (
    <PageBase>
      <h1 className="mb-6 text-xl font-semibold sm:text-2xl">Packing Lists</h1>
      <PackingListTable />
    </PageBase>
  );
};

export default PackingListPage;