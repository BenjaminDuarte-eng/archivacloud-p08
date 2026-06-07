from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from models.upload import UploadRequest
from services.s3_service import s3

import os

app = FastAPI(
    title="ArchivaCloud P-08"
)

# CORS para React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = [
    ".docx",
    ".pptx"
]


@app.get("/")
def inicio():
    return {
        "mensaje": "ArchivaCloud funcionando"
    }


@app.get("/healthz")
def health():
    return {
        "status": "ok"
    }


@app.get("/test-s3")
def test_s3():

    buckets = s3.list_buckets()

    return {
        "buckets": [
            bucket["Name"]
            for bucket in buckets["Buckets"]
        ]
    }


@app.post("/api/upload/presigned-url")
def get_presigned_url(data: UploadRequest):

    extension = "." + data.fileName.split(".")[-1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Tipo de archivo no permitido"
        )

    safe_name = data.fileName.strip()

    key = f"uploads/{safe_name}"

    presigned_url = s3.generate_presigned_url(
        "put_object",
        Params={
            "Bucket": os.getenv("S3_BUCKET"),
            "Key": key,
            "ContentType": data.fileType
        },
        ExpiresIn=300
    )

    return {
        "presignedUrl": presigned_url,
        "key": key
    }


@app.get("/api/files")
def list_files():

    response = s3.list_objects_v2(
        Bucket=os.getenv("S3_BUCKET"),
        Prefix="uploads/"
    )

    files = []

    for obj in response.get("Contents", []):

        url = s3.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": os.getenv("S3_BUCKET"),
                "Key": obj["Key"]
            },
            ExpiresIn=3600
        )

        files.append({
            "key": obj["Key"],
            "size": obj["Size"],
            "lastModified": obj["LastModified"],
            "url": url
        })

    return files


@app.delete("/api/files/{file_key:path}")
def delete_file(file_key: str):

    s3.delete_object(
        Bucket=os.getenv("S3_BUCKET"),
        Key=file_key
    )

    return {
        "message": "Archivo eliminado"
    }