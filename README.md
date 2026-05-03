# Knowledge Hub API

REST API for managing articles, categories, comments and users built with NestJS.

## Requirements

- Node.js >= 22.14.0
- npm


## Getting a Gemini API Key

1. Go to https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click "Create API key"
4. Copy the generated key — you'll need it in the next step

### AI (powered by Google Gemini)

All AI endpoints are protected by JWT and rate-limited (configurable via `AI_RATE_LIMIT_RPM`, default 20 RPM).

- `POST /ai/articles/:articleId/summarize` - generate article summary
- `POST /ai/articles/:articleId/translate` - translate article content
- `POST /ai/articles/:articleId/analyze` - analyze article (review/bugs/optimize/explain)
- `POST /ai/generate` - free-form prompt generation
- `GET /ai/usage` - usage statistics (total requests, by endpoint, token counters)

**Model used:** `gemini-2.5-flash` (configurable via `GEMINI_MODEL`)

## How to run Docker Compose 
1. Clone the repository
2. Copy `.env.example` to `.env` and fill in the values
3. Open `.env` and paste your Gemini API key:
4. Start the application:
```bash
   docker compose up --build
```
5. Open Swagger: `http://localhost:4000/doc`


## Endpoints

### Users
- `GET /user` — get all users
- `POST /user` — create user
- `GET /user/:id` — get user by id
- `PUT /user/:id` — update user password
- `DELETE /user/:id` — delete user

### Articles
- `GET /article` — get all articles (supports `?status=`, `?categoryId=`, `?tag=` filters)
- `POST /article` — create article
- `GET /article/:id` — get article by id
- `PUT /article/:id` — update article
- `DELETE /article/:id` — delete article

### Categories
- `GET /category` — get all categories
- `POST /category` — create category
- `GET /category/:id` — get category by id
- `PUT /category/:id` — update category
- `DELETE /category/:id` — delete category

### Comments
- `GET /comment?articleId={id}` — get comments for article
- `POST /comment` — create comment
- `GET /comment/:id` — get comment by id
- `DELETE /comment/:id` — delete comment


## Authentication API — curl examples
Note: Swagger UI may have caching issues with authorization headers. If you notice that database state is not updated after Swagger requests, use the curl commands provided below, they are more reliable for testing.
### Sign Up
```bash
curl -X POST http://localhost:4000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"login": "testuser", "password": "secret123"}'
```

### Login
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login": "testuser", "password": "secret123"}'
```

### Refresh tokens
```bash
curl -X POST http://localhost:4000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<your_refresh_token>"}'
```

### Logout
```bash
curl -X POST http://localhost:4000/auth/logout \
  -H "Authorization: Bearer <your_access_token>"
```

### Access protected route (example)
```bash
curl http://localhost:4000/user \
  -H "Authorization: Bearer <your_access_token>"
```

### Access protected route without token (returns 401)
```bash
curl http://localhost:4000/user
```