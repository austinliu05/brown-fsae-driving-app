import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import { FilePond, registerPlugin } from 'react-filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type";
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import "react-datepicker/dist/react-datepicker.css";
import { postFiles } from '../../api/api';
import './UploadComponent.css';
import AppDataContext from '../contexts/AppDataContext';

registerPlugin(FilePondPluginImagePreview);
registerPlugin(FilePondPluginFileValidateType);
registerPlugin(FilePondPluginFileValidateSize);

export default function UploadComponent() {

    // Data-related states
    const { drivers } = useContext(AppDataContext)

    const navigate = useNavigate()

    const [uploadedData, setUploadedData] = useState<File>()
    const [uploadedMedia, setUploadedMedia] = useState<File[]>([])

    const [runDate, setRunDate] = useState<Date | null>(new Date());
    const [runTitle, setRunTitle] = useState<string>("")
    const [driverId, setDriverId] = useState<string>("")

    // Status-related states
    const [uploading, setUploading] = useState<boolean>(false)
    // const [showAlert, setShowAlert] = useState<boolean>(true)

    const handleDataFile = (newFiles: any) => {
        if (newFiles.length > 0) {
            setUploadedData(newFiles[0].file as File)
        }
    }

    const handleMediaFiles = (newFiles: any) => {
        let mediaFiles: File[] = []
        for (var i = 0; i < newFiles.length; i++) {
            mediaFiles.push(newFiles[i].file as File)
        }
        setUploadedMedia(mediaFiles)
    }

    const submitUpload = async () => {
        if (!uploadedData || !runTitle || !runDate || !driverId) {
            return;
        }
        setUploading(true)

        const formData = new FormData();
        formData.append("driverId", driverId)
        formData.append("runDate", runDate.toISOString())
        formData.append("runTitle", runTitle)

        formData.append('dataFile', uploadedData);
        for (var i = 0; i < uploadedMedia.length; i++) {
            formData.append(`mediaFile${i}`, uploadedMedia[i])
        }

        const result = await postFiles(formData)
        setUploading(false)

        if (result.status === 200) {
            navigate("/run-data");
        }
        else {
            // Set error pop-up
        }
    }

    return (
        <>
            <div className="flex justify-center flex-col items-center">
                <div className="grid grid-cols-1 gap-6 w-full items-start lg:grid-cols-2">
                    <div className="flex flex-col justify-center items-center">
                        <div className="w-11/12 py-4 justify-center">
                            <div className="text-center p-2">
                                <p>Upload CSV or LD File</p>
                            </div>
                            <FilePond
                                allowMultiple={true}
                                onupdatefiles={handleDataFile}
                                maxFiles={1}
                                name="files"
                                server={null} />
                        </div>

                        <div className="w-11/12 py-4 justify-center">
                            <div className="text-center p-2">
                                <p>Upload Media Files</p>
                            </div>
                            <FilePond
                                allowMultiple={true}
                                onupdatefiles={handleMediaFiles}
                                maxFiles={5}
                                name="files"
                                maxFileSize={"10MB"}
                                imagePreviewHeight={192}
                                imagePreviewMaxHeight={228}
                                acceptedFileTypes={["image/*", "video/*"]} />
                        </div>
                    </div>

                    <div className="upload-metadata flex flex-col items-stretch w-full max-w-xl mx-auto lg:items-center">
                        <input
                            className="w-full max-w-md"
                            value={runTitle}
                            placeholder='Enter run title...'
                            onKeyDown={(event) => {
                                if (event.key === " ") {
                                    event.preventDefault()
                                    setRunTitle(runTitle + "-")
                                }
                            }}
                            onChange={(event) => setRunTitle(event.target.value.toLocaleLowerCase())}>
                        </input>

                        <DatePicker
                            className="w-full max-w-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                            selected={runDate}
                            onChange={(date) => setRunDate(date)}
                        />
                        <select className="w-full max-w-md" onChange={(event) => setDriverId(event.target.value)}>
                            {drivers && drivers.map(currentDriver => {
                                return (
                                    <option
                                        value={currentDriver.driverId}
                                        className="driver-option"
                                        key={currentDriver.driverId}>
                                        {currentDriver.firstName} {currentDriver.lastName}
                                    </option>
                                )
                            })}
                        </select>
                    </div>
                </div>


                <div className="flex justify-center py-10">
                    {uploading
                        ? <button disabled={true} className="disabled-upload-button opacity-70 bg-blue-600">
                            <p>Uploading...</p>
                        </button>
                        : <button onClick={submitUpload} className="upload-button bg-blue-500">
                            <p>Upload Data</p>
                        </button>
                    }
                </div>
            </div >
        </>
    )
}