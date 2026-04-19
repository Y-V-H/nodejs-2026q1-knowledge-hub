# Knowledge Hub API

REST API for managing articles, categories, comments and users built with NestJS.

## Requirements

- Node.js >= 22.14.0
- npm

## How to run

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in the values
3. Run `npm install`
4. Run `npx prisma generate`
5. Start the database: `docker compose up -d db`
6. Run migrations: `npx prisma migrate deploy`
7. Seed the database: `npx prisma db seed`
8. Start the app: `docker compose up -d`
9. Open Swagger: `http://localhost:4000/doc`

## Environment Variables

Create `.env` file in root directory:

```
PORT=4000
```

## Running the app

```bash
npm start
```

## API Documentation

Swagger UI is available at:

```
http://localhost:4000/doc
```

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