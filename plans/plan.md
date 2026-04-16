

## Problem
1. **Database is waking up** — the backend is currently in a sleep state, causing all operations (uploads, reads) to be slow or time out. This will resolve once it finishes starting.
2. **No upload progress feedback** — when uploading large files (up to 50MB), users see only "Uploading..." with no indication of progress, making it feel stuck.

## Plan

### 1. Add upload progress indicator
- Modify `StudentUpload.tsx` to track upload progress percentage
- Replace the basic `supabase.storage.upload()` call with an `XMLHttpRequest` or `fetch` with progress tracking using Supabase's `onUploadProgress` option
- Show a progress bar (using the existing `Progress` UI component) during upload

### 2. Preserve existing data
- No database migrations or data changes — only UI code changes
- All existing uploaded materials remain untouched

### Files to modify
- `src/pages/StudentUpload.tsx` — add progress state and progress bar UI

### Technical details
- Use `supabase.storage.from("study-materials").upload(filePath, file, { upsert: false })` — the current call is fine, but we'll wrap it to show a progress indicator using a percentage state variable
- Add a `Progress` component below the submit button that appears only while uploading

