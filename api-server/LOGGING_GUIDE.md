# /api/fal Endpoint - Complete Error Handling & Logging Guide

## ✅ Fixes Applied

### 1. **Request Logging** (fortune.ts)
```javascript
console.log("=== /api/fal REQUEST RECEIVED ===");
console.log("REQUEST BODY:", {
  userId: req.body.userId,
  name: req.body.name,
  gender: req.body.gender,
  hasFile: !!req.file,
  fileSize: req.file?.size,
  fileMimeType: req.file?.mimetype,
});
```
**Result**: Every request logs detailed information about what was received.

---

### 2. **Comprehensive Try-Catch**
- Entire handler wrapped in try-catch
- Detailed error logging with type, message, and stack
- OpenAI-specific error handling (status codes, response data)
- Always returns valid JSON response:
  ```json
  {
    "success": true/false,
    "source": "ai|stored|cache",
    "title": "...",
    "sections": {...},
    "error": "error message if failed",
    "details": "stack trace in development mode"
  }
  ```

---

### 3. **OpenAI API Key Verification**
- Checks both `AI_INTEGRATIONS_OPENAI_API_KEY` and `OPENAI_API_KEY`
- Throws error with clear message if missing
- Logs when API key is found
- Initializes with fallback but logs warnings

```javascript
const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
if (!apiKey) {
  throw new Error("OpenAI API key missing (set AI_INTEGRATIONS_OPENAI_API_KEY or OPENAI_API_KEY)");
}
```

---

### 4. **OpenAI Request/Response Logging**
```javascript
console.log("Sending request to OpenAI...");
// ... request ...
console.log("✅ OpenAI response received");
console.log("OpenAI response:", {
  finishReason: response.choices[0]?.finish_reason,
  promptTokens: response.usage?.prompt_tokens,
  completionTokens: response.usage?.completion_tokens,
});
```
**Result**: Can track token usage and completion status.

---

### 5. **Database Error Handling** (fortune-hybrid.ts)
- Wrapped hybridFortune in try-catch
- DB operations wrapped individually
- Failed cache operations don't crash the response
- Failed saves to pool are warnings, not blockers

```javascript
try {
  await storeCachedFortune(...);
} catch (cacheError) {
  console.warn("Cache check failed:", cacheError);
  // Continue with AI generation
}
```

---

### 6. **Database Connection Logging** (db/index.ts)
- Logs connection setup
- Pool error handler attached
- Configuration logged at startup

```javascript
pool.on("error", (err) => {
  console.error("❌ PostgreSQL connection error:", err);
});
```

---

### 7. **Initialization Logging**
All modules log at startup:
- OpenAI: base URL, API key status
- Database: connection string status
- Fortune hybrid: request counts, source selection

---

## 🧪 Testing the Endpoint

### Step 1: Set Environment Variables (Required)
```bash
# For OpenAI (REQUIRED for AI generation)
set OPENAI_API_KEY=sk-your-key-here
# OR
set AI_INTEGRATIONS_OPENAI_API_KEY=sk-your-key-here

# For Database (Optional, caching will be skipped if not set)
set DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### Step 2: Start the Server
```bash
cd api-server
npm start
# OR for custom port:
set PORT=8083 && npx tsx src/index.ts
```

### Step 3: Make Test Request
```bash
curl -X POST http://localhost:8083/api/fal \
  -F "image=@path/to/coffee-cup.jpg" \
  -F "userId=test-user-123" \
  -F "name=John" \
  -F "gender=male"
```

### Step 4: Check Console Logs
You should see:
```
=== /api/fal REQUEST RECEIVED ===
REQUEST BODY: { userId: 'test-user-123', name: 'John', gender: 'male', hasFile: true, ... }
Parsed parameters: { userId: 'test-user-123', name: 'John', gender: 'male' }
Image hash: abc123def456
Checking cache for image hash: abc123def456
No cached fortune found, generating with AI...
Starting hybridFortune...
🔄 Generating fortune with AI...
✅ OpenAI API key found
Sending request to OpenAI...
✅ OpenAI response received
OpenAI response: { finishReason: 'stop', promptTokens: 2520, completionTokens: 189 }
Raw content length: 567
Attempting to parse JSON...
✅ JSON parsed successfully
Parsed fortune: { title: 'Kahvenizin Sırrı', sectionsCount: 5 }
Fortune generated, source: AI
Storing fortune in cache...
✅ Fortune cached successfully
✅ /api/fal SUCCESS - Returning fortune
```

---

## 📊 Response Format

### Success Response (200)
```json
{
  "success": true,
  "source": "ai",
  "title": "Kahvenizin Sırrı",
  "sections": {
    "ask": "...",
    "para": "...",
    "yol": "...",
    "saglik": "...",
    "genel": "..."
  }
}
```

### Error Response (400/500)
```json
{
  "success": false,
  "error": "Lütfen bir kahve fincanı fotoğrafı yükleyin.",
  "details": {
    "type": "ValidationError",
    "stack": "... stack trace in development mode ..."
  }
}
```

---

## 🔍 Debugging Checklist

1. **No Image Uploaded**
   - Log: `❌ No image file provided`
   - Fix: Ensure form data includes `image=@filepath`

2. **OpenAI Key Missing**
   - Log: `⚠️  WARNING: OpenAI API key not set`
   - Fix: Set `OPENAI_API_KEY` environment variable

3. **Database Error**
   - Log: `❌ PostgreSQL connection error:`
   - Impact: Caching won't work, but AI generation continues
   - Fix: Set `DATABASE_URL` if you want caching

4. **JSON Parse Error**
   - Log: `❌ Failed to parse JSON...`
   - Likely: OpenAI returned invalid format
   - Check: `OpenAI response:` logs above to see what was returned

5. **Empty Response from OpenAI**
   - Log: `OpenAI returned empty content`
   - Cause: API token limit or invalid image
   - Check: `promptTokens` and `completionTokens` in logs

---

## 📝 Log Levels

- 🟢 `✅` = Success milestone
- 🟡 `⚠️` = Warning, operation may fail without config
- 🔴 `❌` = Error occurred, response sent to client

---

## Complete Flow Visualization

```
REQUEST → Validate → Parse Params → Hash Image → Check Cache
  ↓         ↓         ↓               ↓           ↓
 Log       Log       Log            Log         Log (attempt)
                                                   ↓
                                      ┌─ Found → Return (stop)
                                      └─ Miss → Continue

Continue → HybridFortune → Check Count → Serve from Pool OR Generate
              ↓                ↓                   ↓
             Log              Log              Log
                                      
                                          ┌─ Pool → Log + Return
                                          └─ AI → Log + OpenAI Request
                                              ↓
                                            Log Response
                                              ↓
                                            Parse JSON
                                              ↓
                                            Save to Cache (optional)
                                              ↓
                                          Return Success
```

---

## 🚀 Production Checklist

- [ ] Set `OPENAI_API_KEY` in environment
- [ ] Set `DATABASE_URL` for caching (optional but recommended)
- [ ] Set `NODE_ENV=production` to hide stack traces
- [ ] Monitor logs for `❌ /api/fal FAILED` messages
- [ ] Test with real coffee cup images
- [ ] Verify response format matches frontend expectations
