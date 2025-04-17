"""
firestore.py

This module is strictly for all Firestore database interactions in the project. 
It provides functions to interact with the Firestore database, such as adding, 
retrieving, and managing user data or other collections. 

Any logic or operations related to Firestore must be placed in this module to 
maintain separation of concerns and ensure a modular codebase.
"""
import csv
import os
from .firebase import firebase_app
from firebase_admin import firestore

db = firestore.client()
# Declares the MAX number of entries to read into Firebase
# 1200 seconds = 20 minutes
max_entries_counter = 1200

def add_driver(data):
    """
    Adds a driver document to the 'driver-profiles' collection in Firestore.

    Args:
        data (dict): A dictionary containing user information to be stored.
                     Example: {"name": "John Doe", "email": "john@example.com"}

    Raises:
        ValueError: If the input is not a dictionary or if it's empty.

    Returns:
        dict: A reference to the added Firestore document on success.
        None: If an error occurs during the operation.
    """
    try:
        if not isinstance(data, dict):
            raise ValueError("Input must be a dictionary.")

        if not data:
            raise ValueError("Input dictionary cannot be empty.")

        main_db = db.collection('driver-profiles')
        existing_driver_query = main_db.where('firstName', '==', data['firstName']).where('lastName', '==', data['lastName']).stream()
        driver_exists = any(existing_driver_query)
        if not driver_exists:
            main_db.add(data)
            print(f"Driver profile for {data['firstName']} {data['lastName']} added.")
        else:
            print(f"Driver profile for {data['firstName']} {data['lastName']} already exists.")


    except ValueError as ve:
        print(f"ValueError: {ve}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

def get_all_drivers(filters=None):
    """
    Retrieves all users from the 'driver-profiles' collection with optional filtering.
    
    Args:
        filters (dict, optional): Dictionary of filter conditions.
    
    Returns:
        list: List of dictionaries containing user data
    """
    try:
        main_db = db.collection('driver-profiles')
        query = main_db
        
        if filters:
            for key, value in filters.items():
                if value is not None:
                    query = query.where(key, '==', value)
        
        docs = query.stream()
        
        drivers = []
        for doc in docs:
            driver_data = doc.to_dict()
            driver_data['driverId'] = doc.id
            drivers.append(driver_data)
                        
        return drivers
    
    except Exception as e:
        print(f"An error occurred while retrieving users: {e}")
        return []

def upload_csv_to_firestore(csv_file_path, driver_id):
    """
    Uploads data from a CSV file to a Firestore subcollection within a document named after the CSV file.

    Args:
        csv_file_path (str): The path to the CSV file to be uploaded.

    Returns:
        None

    Example:
        upload_csv_to_firestore('/path/to/data.csv')
    """
    # Document referencing to correctly insert into Firebase hierarchy
    # ecu-data/`file_name`/`data`/(actual data)
    main_collection = 'ecu-data'
    subcollection = 'data'

    file_name = os.path.splitext(os.path.basename(csv_file_path))[0]
    main_document = file_name
    frequency = int(file_name.split("-")[-2])
    
    main_doc_ref = db.collection(main_collection).document(main_document)

    main_doc_ref.set({
        "run-date": file_name[0:10],
        "driver-id": driver_id
    })

    subcollection_ref = main_doc_ref.collection(subcollection)
    
    try:
        # Opening and iterating through CSV file
        with open(csv_file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            document_counter = 0
            
            for row_number, row in enumerate(reader):
                if document_counter % frequency != 0:
                    document_counter += 1
                    continue    # Proceed if frequency does not represent a SINGLE SECOND ==> ensures that each data entry corresponds to a discrete second

                # If the number of rows EXCEEDS the max_entries_counter
                if document_counter >= (frequency * max_entries_counter):
                    print(f"Reached the max entry number: {document_counter}")
                    break

                # When the CSV file stops giving complete values
                if any(value == '' for value in row.values()):
                    print(f"Stopping processing at row {row_number}.")
                    break
                
                doc_id = f'data_{(document_counter // frequency):06}'
                subcollection_ref.document(doc_id).set(row)

                document_counter += 1

        print(f"All data from {csv_file_path} has been successfully uploaded to Firestore under document '{main_document}'.")
    
    except FileNotFoundError:
        print(f"Error: The file {csv_file_path} does not exist.")
    
    except Exception as e:
        print(f"An error occurred while uploading CSV to Firestore: {e}")
        
def upload_csv_columns_as_documents(csv_file_path):
    """
    Uploads data from a CSV file to Firestore where each column in the CSV is a document, and each
    row is stored as a field within that document.

    Args:
        csv_file_path (str): The path to the CSV file to be uploaded.

    Returns:
        None

    Example:
        upload_csv_columns_as_documents('/path/to/data.csv')
    """
    # Define the main collection and subcollection structure
    main_collection = 'ecu-data'
    subcollection = 'columns'

    file_name = os.path.splitext(os.path.basename(csv_file_path))[0]
    main_document = file_name
    
    main_doc_ref = db.collection(main_collection).document(main_document)
    subcollection_ref = main_doc_ref.collection(subcollection)
    
    try:
        with open(csv_file_path, mode='r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            headers = reader.fieldnames
                        
            for row_number, row in enumerate(reader):
                for header in headers:
                    field_name = f'second_{row_number:04}'
                    subcollection_ref.document(header).set({field_name: row[header]}, merge=True)
                if row_number % 100 == 0:
                    print(f"Processed row {row_number}")

        print(f"All data from {csv_file_path} has been successfully uploaded to Firestore under document '{main_document}' with each column as a document.")
    
    except FileNotFoundError:
        print(f"Error: The file {csv_file_path} does not exist.")
    
    except Exception as e:
        print(f"An error occurred while uploading CSV to Firestore: {e}")


def get_specific_run_data(run_title, categories_list=[]):
    try:
        # Access the 'ecu-data' collection and the 'sample_test' document
        document_query = db.collection('ecu-data')\
            .document(run_title)\
            .collection('data')
                    
        if len(categories_list) > 0:
            categories_formatted = [f'`{c}`' for c in categories_list]
            document_query = document_query.select(categories_formatted)

        # Stream all documents in the 'data' sub-collection
        document_data = document_query.stream()
        
        data_list = []
        for doc in document_data:
            # Append the document data along with the document ID
            doc_data = doc.to_dict()
            doc_data['id'] = doc.id  # Include the document ID if needed
            data_list.append(doc_data)
                
        return data_list

    except Exception as e:
        print(f"An unexpected error occurred when pulling specific document data: {e}")
        return None 


def get_specific_run_data_paginated(run_title, page_size, start_after_doc="", end_before_doc="", categories_list=[]):
    try:
        document_query = db.collection('ecu-data')\
            .document(run_title)\
            .collection('data')
        
        if len(categories_list) > 0:
            categories_formatted = [f'`{c}`' for c in categories_list]
            document_query = document_query.select(categories_formatted)

        if len(start_after_doc) > 0:
            previous_doc_snapshot = db.collection('ecu-data')\
                .document(run_title)\
                .collection('data')\
                .document(start_after_doc)\
                .get()

            document_query = document_query.start_after(previous_doc_snapshot)

        elif len(end_before_doc) > 0:
            last_doc_snapshot = db.collection('ecu-data')\
                .document(run_title)\
                .collection('data')\
                .document(end_before_doc)\
                .get()

            document_query = document_query.end_before(last_doc_snapshot)


        document_data = document_query\
            .order_by('__name__')\
            .limit(int(page_size)).stream()

        data_list = []
        for doc in document_data:
            # Append the document data along with the document ID
            doc_data = doc.to_dict()
            doc_data['id'] = doc.id  # Include the document ID if needed
            data_list.append(doc_data)
                
        return data_list
    except Exception as e:
        print(f"An unexpected error occurred when pulling specific document data (paginated): {e}")
        return None


def get_general_run_data(filter_limit=10, filtered_date=None, filtered_driver=None):
    """
    Retrieves run-relevant data in a simplified format from the Firestore database,
    as demonstrated in the /run-data path. To support pagination, the 10 most recent entries are taken

    Args:
        filtered_date (datetime): Corresponds to the datetime to filter the run data by
        filtered_driver (str): Corresponds the str to filter the run data by

    Returns:
        List of all simplified results

    """
    try:
        # Access the 'ecu-data' collection and the 'sample_test' document
        filtered_docs_query = db.collection('ecu-data')\
            .order_by('`run-date`', direction=firestore.Query.DESCENDING)\
            .limit(filter_limit)

        filtered_docs = filtered_docs_query.stream()

        data_list = []
        for doc in filtered_docs:
            doc_data = doc.to_dict()
            doc_data['id'] = doc.id
            data_list.append(doc_data)
            # data_list.append(get_specific_document_data(doc.id))
        
        return data_list
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

def check_issue_number_unique(issue_number, exclude_issue_id=None):
    """
    Checks if the issue_number is unique in the 'issues' collection.
    Excludes the issue with exclude_issue_id from the check (used during updates).
    """
    try:
        query = db.collection('issues').where('issue_number', '==', issue_number)
        docs = query.stream()
        for doc in docs:
            if exclude_issue_id is None or doc.id != exclude_issue_id:
                return False
        return True
    except Exception as e:
        print(f"Error checking issue number uniqueness: {e}")
        return False

def get_next_issue_number():
    """
    Retrieves the next available issue number by finding the highest existing number.
    """
    try:
        query = db.collection('issues').order_by('issue_number', direction=firestore.Query.DESCENDING).limit(1)
        docs = query.stream()
        max_number = 0
        for doc in docs:
            issue_data = doc.to_dict()
            max_number = max(max_number, issue_data.get('issue_number', 0))
        return max_number + 1
    except Exception as e:
        print(f"Error retrieving next issue number: {e}")
        return 1

def add_issue(data):
    """
    Adds an issue document to the 'issues' collection in Firestore with an issue_number.
    """
    try:
        if not isinstance(data, dict):
            raise ValueError("Input must be a dictionary.")
        required_fields = ['driver', 'date', 'synopsis', 'subsystems', 'description']
        for field in required_fields:
            if field not in data or not data[field]:
                raise ValueError(f"Missing or empty required field: {field}")
        issue_number = data.get('issue_number')
        if issue_number is None:
            issue_number = get_next_issue_number()
        else:
            issue_number = int(issue_number)
            if not check_issue_number_unique(issue_number):
                raise ValueError(f"Issue number {issue_number} is already in use.")
        issue_data = {
            'issue_number': issue_number,
            'driver': data['driver'],
            'date': data['date'],
            'synopsis': data['synopsis'],
            'subsystems': data['subsystems'],
            'description': data['description'],
            'priority': data.get('priority', 'Medium'),
            'status': data.get('status', 'Open'),
            'created_at': firestore.SERVER_TIMESTAMP
        }
        main_db = db.collection('issues')
        doc_ref = main_db.document()
        doc_ref.set(issue_data)
        print(f"Issue '{data['synopsis']}' added with ID: {doc_ref.id} and number: {issue_number}")
        return {"issue_id": doc_ref.id, "issue_number": issue_number}
    except ValueError as ve:
        print(f"ValueError: {ve}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred while adding issue: {e}")
        return None
    
def get_all_issues(filters=None):
    """
    Retrieves all issues from the 'issues' collection with optional filtering, including priority and status.

    Args:
        filters (dict, optional): Dictionary of filter conditions (e.g., driver, subsystem, priority, status).

    Returns:
        list: List of dictionaries containing issue data, including priority and status.
        None: If an error occurs.
    """
    try:
        main_db = db.collection('issues')
        query = main_db.order_by('created_at', direction=firestore.Query.DESCENDING)

        # for future filtering
        if filters:
            if 'driver' in filters and filters['driver']:
                query = query.where('driver', '==', filters['driver'])
            if 'priority' in filters and filters['priority']:
                query = query.where('priority', '==', filters['priority'])
            if 'status' in filters and filters['status']:
                query = query.where('status', '==', filters['status'])
        
        docs = query.stream()
        
        issues = []
        for doc in docs:
            issue_data = doc.to_dict()
            issue_data['id'] = doc.id
            
            if filters and 'subsystem' in filters and filters['subsystem']:
                if filters['subsystem'] in issue_data['subsystems']:
                    issues.append(issue_data)
            else:
                issues.append(issue_data)
                        
        return issues
    
    except Exception as e:
        print(f"An error occurred while retrieving issues: {e}")
        return None
    
def update_issue(issue_id: str, data: dict):
    """
    Updates an issue document in the 'issues' collection.
    """
    try:
        if not isinstance(data, dict):
            raise ValueError("Input must be a dictionary.")
        if not issue_id:
            raise ValueError("Issue ID must be provided.")

        issue_data = {
            'driver': data.get('driver'),
            'date': data.get('date'),
            'synopsis': data.get('synopsis'),
            'subsystems': data.get('subsystems'),
            'description': data.get('description'),
            'priority': data.get('priority'),
            'status': data.get('status'),
            'updated_at': firestore.SERVER_TIMESTAMP
        }
        if 'issue_number' in data:
            issue_number = int(data['issue_number'])
            if not check_issue_number_unique(issue_number, exclude_issue_id=issue_id):
                raise ValueError(f"Issue number {issue_number} is already in use.")
            issue_data['issue_number'] = issue_number
        issue_data = {k: v for k, v in issue_data.items() if v is not None}

        main_db = db.collection('issues')
        doc_ref = main_db.document(issue_id)
        
        # Check if document exists
        if not doc_ref.get().exists:
            raise ValueError(f"Issue with ID {issue_id} not found.")

        doc_ref.update(issue_data)
        print(f"Issue {issue_id} updated successfully")
        return {"issue_id": issue_id}

    except ValueError as ve:
        print(f"ValueError: {ve}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred while updating issue: {e}")
        return None

def delete_issue(issue_id: str):
    try:
        if not issue_id:
            raise ValueError("Issue ID must be provided.")

        main_db = db.collection('issues')
        doc_ref = main_db.document(issue_id)
        
        if not doc_ref.get().exists:
            print(f"Issue with ID {issue_id} not found.")
            return None
        
        doc_ref.delete()
        print(f"Issue {issue_id} deleted successfully")
        return {"issue_id": issue_id}

    except ValueError as ve:
        print(f"ValueError: {ve}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred while deleting issue: {e}")
        return None