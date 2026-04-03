# Database Migrations

Run the initial schema locally from the `backend/` directory:

```bash
cp .env.example .env
alembic upgrade head
```

Create a new migration after model changes:

```bash
alembic revision --autogenerate -m "describe change"
```

Apply the latest migrations:

```bash
alembic upgrade head
```

Rollback one revision if needed:

```bash
alembic downgrade -1
```
