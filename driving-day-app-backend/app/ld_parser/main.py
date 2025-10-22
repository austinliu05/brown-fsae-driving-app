import os
import math
from django.conf import settings
from .data_containers import ldData
from ..firebase.firestore import upload_csv_to_firestore
from ..firebase.firebase import firebase_app
from firebase_admin import firestore
from django.core.files.storage import default_storage
from datetime import datetime


db = firestore.client()

def process_and_upload_inputted_ld_file(data_file, run_date, run_title, driver_id):
    '''
        Process LD file that is inputted by the user
    '''
    data_path = settings.DATA_DIR

    if data_file.name.endswith('.ld'):
        file_content = data_file.read()
        run_date = datetime.fromisoformat(run_date)

        year = str(run_date.year)
        month = str(run_date.month) if run_date.month > 10 else "0" + str(run_date.month)
        day = str(run_date.day) if run_date.day > 10 else "0" + str(run_date.day)


        file_path = os.path.join(data_path, f'{year}-{month}-{day}-{run_title}.ld')
        
        # Change to account for uploaded metadata
        with default_storage.open(file_path, "wb+") as destination_file:
            destination_file.write(file_content)
        
        # await asyncio.to_thread()
        process_and_upload_ld_files(driver_id)


def process_and_upload_ld_files(driver_id):
    '''
        Process LD (Logical Data) files in the data directory, convert them to CSV format, and upload the CSV files to Firestore.

    This function performs the following steps:
    '''
    try:
        data_path = settings.DATA_DIR
        os.makedirs(data_path, exist_ok=True)

        for filename in os.listdir(data_path):
            print(filename)
            if not filename.endswith('.ld'):
                continue
            file_path = os.path.join(data_path, filename)
            
            # Parsing LD into CSV
            l = ldData.fromfile(file_path)

            df_dict = l.to_dataframe()
            min_length = min(df_dict.keys())

            for length, df in df_dict.items(): 
                csv_filename = os.path.join(data_path, os.path.splitext(filename)[0] + '-' + str(math.ceil(length/min_length)) + '-hz' + '.csv')
                df.to_csv(csv_filename, index=False)
                print(f"Data saved to {csv_filename}")

                # Uploading CSV to Firebase
                upload_csv_to_firestore(csv_filename, driver_id)
                print(f"Data from {csv_filename} uploaded to Firestore")
                

        # Deleting all files in the folder after processing
        for filename in os.listdir(data_path):
            file_path = os.path.join(data_path, filename)
            if filename.endswith('.ld') or filename.endswith('.csv'):
                try:
                    os.remove(file_path)
                    print(f"Deleted {file_path}")
                except Exception as e:
                    print(f"Failed to delete {file_path}: {e}")
    except Exception as e:
        print(e)

