# Knowledge Hub API

REST API for managing articles, categories, comments and users built with NestJS.

## Requirements

- Node.js >= 22.14.0
- npm

## Installation

```bash
npm install
```

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