# Project Overview
A naive clone of StackOverflow to learn more about NextJs and FastAPI.

This is a full-stack web application with a Next.js frontend and a FastAPI backend. The project is structured as a monorepo with a `frontend` and `backend` directory.

## Frontend

The frontend is a Next.js application located in the `frontend` directory. It uses `npm` for package management.

### Building and Running the Frontend

To run the frontend in development mode, navigate to the `frontend` directory and run:

```bash
npm run dev
```

To build the frontend for production, run:

```bash
npm run build
```

To start the frontend in production mode, run:

```bash
npm run start
```

## Backend

The backend is a FastAPI application located in the `backend` directory. It uses `poetry` for dependency management.

### Building and Running the Backend

To run the backend, you will need to have Python and Poetry installed. Navigate to the `backend` directory and run the following commands:

```bash
poetry install
poetry run uvicorn app.main:app --reload
```

## Development Conventions

### Frontend

The frontend code is written in TypeScript and uses ESLint for linting. The code style is enforced by Prettier.

### Backend

The backend code is written in Python and follows the standard FastAPI project structure. It uses `alembic` for database migrations.
