import boto3
from botocore.exceptions import BotoCoreError, ClientError
from django.conf import settings

_s3_client = boto3.client(
    "s3",
    aws_access_key_id     = settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key = settings.AWS_SECRET_ACCESS_KEY,
    region_name           = getattr(settings, "AWS_S3_REGION_NAME", None),
)

def get_s3_client():
    """
    Return the shared S3 client.
    """
    return _s3_client


def upload_to_s3(file_obj, s3_key, bucket_name=None):
    """
    Upload a file-like object to S3 under the given key.

    Args:
        file_obj: A file-like object (e.g. Django InMemoryUploadedFile).
        s3_key:   The key (path) in the S3 bucket where the file will be stored.
        bucket_name: Optional override for the bucket name. If None, uses settings.AWS_STORAGE_BUCKET_NAME.

    Raises:
        RuntimeError: If upload fails.
    """
    bucket = bucket_name or settings.AWS_STORAGE_BUCKET_NAME
    client = get_s3_client()

    # ensure we read from the start of the file
    try:
        file_obj.seek(0)
    except Exception:
        pass

    try:
        client.upload_fileobj(file_obj, bucket, s3_key)
    except (BotoCoreError, ClientError) as exc:
        raise RuntimeError(f"S3 upload failed for key={s3_key}: {exc}")


def fetch_from_s3(s3_key, bucket_name=None):
    """
    Retrieve an object from S3 and return its bytes.

    Args:
        s3_key: The key (path) in the S3 bucket.
        bucket_name: Optional override for the bucket name. If None, uses settings.AWS_STORAGE_BUCKET_NAME.

    Returns:
        bytes: The content of the object.

    Raises:
        RuntimeError: If the fetch fails or object not found.
    """
    bucket = bucket_name or settings.AWS_STORAGE_BUCKET_NAME
    client = get_s3_client()

    try:
        response = client.get_object(Bucket=bucket, Key=s3_key)
        body = response['Body'].read()
        return body
    except ClientError as e:
        code = e.response.get('Error', {}).get('Code')
        if code in ('NoSuchKey', '404'):
            raise RuntimeError(f"S3 object not found: {s3_key}")
        raise RuntimeError(f"Error fetching S3 object {s3_key}: {e}")


def generate_presigned_url(s3_key, bucket_name=None, expires_in=3600):
    """
    Generate a presigned URL for a GET request to an S3 object.

    Args:
        s3_key: The key (path) in the S3 bucket.
        bucket_name: Optional bucket override, defaults to settings.AWS_STORAGE_BUCKET_NAME.
        expires_in: Expiration time in seconds for the presigned URL.

    Returns:
        str: The presigned URL.

    Raises:
        RuntimeError: If URL generation fails.
    """
    bucket = bucket_name or settings.AWS_STORAGE_BUCKET_NAME
    client = get_s3_client()

    try:
        url = client.generate_presigned_url(
            'get_object',
            Params={'Bucket': bucket, 'Key': s3_key},
            ExpiresIn=expires_in
        )
        return url
    except ClientError as e:
        raise RuntimeError(f"Failed to generate presigned URL for {s3_key}: {e}")


def delete_s3_folder(prefix, bucket_name=None):
    """
    Delete all objects under the given prefix ("folder") in the S3 bucket.

    Args:
        prefix: The key prefix (e.g. "issues/<issue_id>/").
        bucket_name: Optional override for the bucket name. Defaults to settings.AWS_STORAGE_BUCKET_NAME.

    Raises:
        RuntimeError: If deletion fails.
    """
    bucket = bucket_name or settings.AWS_STORAGE_BUCKET_NAME
    client = get_s3_client()

    paginator = client.get_paginator('list_objects_v2')
    delete_batch = {'Objects': []}

    try:
        for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
            for obj in page.get('Contents', []):
                delete_batch['Objects'].append({'Key': obj['Key']})
                # delete in batches of 10
                if len(delete_batch['Objects']) >= 10:
                    client.delete_objects(Bucket=bucket, Delete=delete_batch)
                    delete_batch = {'Objects': []}
        # delete any remaining
        if delete_batch['Objects']:
            client.delete_objects(Bucket=bucket, Delete=delete_batch)
    except ClientError as e:
        raise RuntimeError(f"Failed to delete S3 folder {prefix}: {e}")