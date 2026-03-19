# PostgreSQL Setup Guide for Q-Shield

## Option 1: Reset PostgreSQL Password (Recommended)

### Step 1: Stop PostgreSQL
```bash
sudo /Library/PostgreSQL/18/bin/pg_ctl stop -D /Library/PostgreSQL/18/data
```

### Step 2: Edit authentication config
```bash
sudo nano /Library/PostgreSQL/18/data/pg_hba.conf
```

Find lines that look like this:
```
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256
```

**Temporarily** change them to:
```
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
```

Save and exit (Ctrl+X, then Y, then Enter)

### Step 3: Restart PostgreSQL
```bash
sudo /Library/PostgreSQL/18/bin/pg_ctl start -D /Library/PostgreSQL/18/data
```

### Step 4: Connect and set new password
```bash
/Library/PostgreSQL/18/bin/psql -U postgres -h localhost

# Inside psql, run:
ALTER USER postgres PASSWORD 'your_new_password';
\q
```

### Step 5: Revert authentication config
```bash
sudo nano /Library/PostgreSQL/18/data/pg_hba.conf
```

Change `trust` back to `scram-sha-256`, save and exit.

### Step 6: Restart PostgreSQL again
```bash
sudo /Library/PostgreSQL/18/bin/pg_ctl restart -D /Library/PostgreSQL/18/data
```

### Step 7: Update your .env file
Edit `backend/.env` and update:
```
DATABASE_URL=postgresql://postgres:your_new_password@localhost:5432/qshield
```

### Step 8: Create database and run schema
```bash
cd backend
PGPASSWORD=your_new_password psql -U postgres -h localhost -c "CREATE DATABASE qshield;"
PGPASSWORD=your_new_password psql -U postgres -h localhost -d qshield -f src/db/schema.sql
```

---

## Option 2: Use SQLite Instead (Fastest)

If you want to skip PostgreSQL setup for now and just test the app:

### Step 1: Install SQLite package
```bash
cd backend
npm install better-sqlite3
```

### Step 2: Update .env
```
DATABASE_URL=sqlite:./qshield.db
```

### Step 3: Modify database config
This would require modifying `src/config/db.ts` to use SQLite instead of PostgreSQL.

---

## Option 3: Use Docker PostgreSQL (Easiest)

### Step 1: Install Docker Desktop
Download from: https://www.docker.com/products/docker-desktop

### Step 2: Run PostgreSQL in Docker
```bash
docker run --name qshield-postgres \
  -e POSTGRES_PASSWORD=qshield123 \
  -e POSTGRES_DB=qshield \
  -p 5432:5432 \
  -d postgres:16
```

### Step 3: Update .env
```
DATABASE_URL=postgresql://postgres:qshield123@localhost:5432/qshield
```

### Step 4: Run schema
```bash
cd backend
PGPASSWORD=qshield123 psql -U postgres -h localhost -d qshield -f src/db/schema.sql
```

### Step 5: Start backend
```bash
npm run dev
```

---

## Quick Check: Is PostgreSQL Running?

```bash
# Check if PostgreSQL is running
pg_isready

# List all databases
PGPASSWORD=your_password psql -U postgres -h localhost -l

# Connect to database
PGPASSWORD=your_password psql -U postgres -h localhost -d qshield
```

---

## Troubleshooting

### "Permission denied" errors
Use `sudo` for commands that modify PostgreSQL system files.

### "Connection refused"
PostgreSQL is not running. Start it with:
```bash
sudo /Library/PostgreSQL/18/bin/pg_ctl start -D /Library/PostgreSQL/18/data
```

### "Database does not exist"
Create it with:
```bash
PGPASSWORD=your_password psql -U postgres -h localhost -c "CREATE DATABASE qshield;"
```

---

**Recommended**: Use **Option 3 (Docker)** for the fastest setup!
