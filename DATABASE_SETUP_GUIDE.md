# 🚀 Database Setup Guide

## Quick Start (5 minutes)

### Step 1: Get a Free PostgreSQL Database

Choose one option:

#### 🟢 **Option A: Supabase** (Recommended)
1. Go to [supabase.com](https://supabase.com)
2. Sign up and create a new project
3. Wait 2 minutes for database to provision
4. Go to **Project Settings** → **Database**
5. Scroll to **Connection string** → **URI**
6. Click **Connection pooling**
7. Change mode to **Session** mode
8. Copy the connection string

#### 🔵 **Option B: Neon**
1. Go to [neon.tech](https://neon.tech)
2. Sign up and create a new project
3. Copy the connection string shown

#### 🟣 **Option C: Railway**
1. Go to [railway.app](https://railway.app)
2. Create a new project
3. Add **PostgreSQL**
4. Copy the **DATABASE_URL** from variables

### Step 2: Configure Your Project

1. **Edit the `.env` file:**
   ```bash
   # Open .env and replace this line:
   DATABASE_URL="your-database-url-here"
   
   # With your actual database URL:
   DATABASE_URL="postgresql://user:password@host:5432/database"
   ```

2. **For connection pooling, add these parameters:**
   ```
   DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20&connect_timeout=10"
   ```

### Step 3: Run Setup Script

```bash
chmod +x quick-db-setup.sh
./quick-db-setup.sh
```

Or manually:

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma db push

# Test connection
npm run db:test

# (Optional) Add sample data
npm run db:seed
```

### Step 4: Verify Setup

```bash
# Test the connection
npm run db:test

# Open Prisma Studio to view data
npm run db:studio
```

## Troubleshooting

### Error: "Unable to process `count` query undefined"

**Cause:** Database tables don't exist yet.

**Fix:**
```bash
npx prisma db push
```

### Error: "Can't reach database server"

**Causes & Fixes:**
- ✅ Check DATABASE_URL is correct
- ✅ Verify internet connection
- ✅ Ensure database server is running
- ✅ Check firewall/VPN settings
- ✅ For Supabase: Use **pooling URL** with **Session mode**

### Error: "Password authentication failed"

**Fix:**
- Check username and password in DATABASE_URL
- Verify you copied the complete connection string
- For Supabase: Use the password from project creation

### Database is empty

**Fix:**  
Add sample data:
```bash
npm run db:seed
```

## Database URL Format

### Supabase
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

### Neon
```
postgresql://user:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require
```

### Railway
```
postgresql://postgres:password@containers-us-west-xx.railway.app:7408/railway
```

### Local PostgreSQL
```
postgresql://postgres:password@localhost:5432/myapp
```

## Connection Pooling (Important!)

For production, always add connection pooling parameters:

```
?connection_limit=10&pool_timeout=20&connect_timeout=10&socket_timeout=10
```

Full example:
```
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20&connect_timeout=10&socket_timeout=10"
```

## Useful Commands

```bash
# Database management
npm run db:studio      # Open Prisma Studio (GUI)
npm run db:push        # Push schema changes
npm run db:migrate     # Run migrations
npm run db:seed        # Add sample data
npm run db:test        # Test connection

# Development
npm run dev            # Start dev server

# Check health
curl http://localhost:3000/api/health
```

## Next Steps

After successful setup:

1. ✅ Start the development server:
   ```bash
   npm run dev
   ```

2. ✅ Open Prisma Studio to manage data:
   ```bash
   npm run db:studio
   ```

3. ✅ Check the health endpoint:
   ```
   http://localhost:3000/api/health
   ```

4. ✅ View your app:
   ```
   http://localhost:3000
   ```

## Need Help?

Common issues and solutions:

1. **Cannot connect to database**
   - Verify DATABASE_URL in .env
   - Test with: `npm run db:test`
   - Check database provider dashboard

2. **Tables don't exist**
   - Run: `npx prisma db push`
   - Or: `npx prisma migrate dev`

3. **Prisma Client errors**
   - Run: `npx prisma generate`
   - Restart dev server

4. **Database is empty**
   - Run: `npm run db:seed`

## Security Notes

- ✅ Never commit `.env` file to git
- ✅ Use different databases for development and production
- ✅ Enable SSL for production databases
- ✅ Use connection pooling for better performance
- ✅ Rotate database passwords regularly

## Support

See the [Database Improvements documentation](./DATABASE_IMPROVEMENTS.md) for advanced features:
- Connection pooling
- Retry logic
- Error handling
- Health monitoring
- Rate limiting
