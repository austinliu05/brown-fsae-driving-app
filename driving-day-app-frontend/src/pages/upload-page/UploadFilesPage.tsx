import React from "react";
import UploadComponent from "../../components/upload-components/UploadComponent";
import PageBase from "../../components/base-components/PageBase";

export default function UploadFilesPage() {

    return (
        <PageBase>
            <h1>Upload Data</h1>
            <UploadComponent />
        </PageBase>
    )
}