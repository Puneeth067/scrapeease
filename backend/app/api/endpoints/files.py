# backend/app/api/endpoints/files.py
from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import FileResponse
import os
import mimetypes

router = APIRouter()

@router.get("/download/{scrape_id}/{file_type}")
async def download_file(scrape_id: str, file_type: str):
    """Download scraped data file"""
    if file_type not in ['csv', 'json']:
        raise HTTPException(status_code=400, detail="Invalid file type. Use 'csv' or 'json'")
    
    try:
        # Find the file
        files = [f for f in os.listdir("data/processed") 
                if f.startswith(f"scrape_{scrape_id}") and f.endswith(f".{file_type}")]
        
        if not files:
            raise HTTPException(status_code=404, detail="File not found")
        
        file_path = f"data/processed/{files[0]}"
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found")
        
        # Determine content type
        content_type = "text/csv" if file_type == "csv" else "application/json"
        
        return FileResponse(
            path=file_path,
            media_type=content_type,
            filename=f"scraped_data_{scrape_id}.{file_type}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

@router.get("/preview/{scrape_id}")
async def preview_data(scrape_id: str, limit: int = 10):
    """Preview scraped data"""
    try:
        import json
        import pandas as pd
        
        # Find CSV file
        csv_files = [f for f in os.listdir("data/processed") 
                    if f.startswith(f"scrape_{scrape_id}") and f.endswith(".csv")]
        
        if not csv_files:
            raise HTTPException(status_code=404, detail="Data not found")
        
        df = pd.read_csv(f"data/processed/{csv_files[0]}")
        preview_data = df.head(limit).to_dict('records')
        
        return {
            "total_records": len(df),
            "columns": list(df.columns),
            "preview": preview_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preview failed: {str(e)}")

@router.delete("/data/{scrape_id}")
async def delete_scraped_data(scrape_id: str):
    """Delete scraped data and associated files"""
    try:
        import os
        
        # Find all files for this scrape_id
        files_to_delete = [f for f in os.listdir("data/processed") 
                          if f.startswith(f"scrape_{scrape_id}")]
        
        if not files_to_delete:
            raise HTTPException(status_code=404, detail="Scrape data not found")
        
        deleted_files = []
        for file in files_to_delete:
            file_path = f"data/processed/{file}"
            if os.path.exists(file_path):
                os.remove(file_path)
                deleted_files.append(file)
        
        return {
            "message": f"Deleted {len(deleted_files)} files",
            "deleted_files": deleted_files
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Deletion failed: {str(e)}")
    