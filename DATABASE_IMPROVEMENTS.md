# Database Connection Improvements

## Overview
Enhanced database connection management with better error handling, connection pooling, retry logic, and health monitoring.

## Key Improvements

### 1. **Enhanced Connection Management** (`lib/prisma.ts`)
- ✅ Connection pooling with configurable limits (2-10 connections)
- ✅ Automatic retry logic with exponential backoff
- ✅ Connection health checks
- ✅ Graceful shutdown handlers (SIGINT, SIGTERM)
- ✅ Singleton pattern to prevent duplicate connections

### 2. **Error Handling** (`lib/prisma-db.ts`)
- ✅ Custom `DatabaseError` class for better error tracking
- ✅ Comprehensive Prisma error handling with specific error codes:
  - `P2002`: Duplicate entry
  - `P2003`: Foreign key constraint failed
  - `P2025`: Record not found
  - `P1001`: Cannot reach database server
  - `P1008`: Operations timed out
- ✅ Retry mechanism for transient failures
- ✅ Smart retry logic (skips retrying validation errors)

### 3. **Health Monitoring** (`app/api/health/route.ts`)
- ✅ Database health check endpoint: `GET /api/health`
- ✅ Response time monitoring
- ✅ Connection status verification
- ✅ Database timestamp validation

### 4. **Connection Pooling**
Configured in `DATABASE_URL` with query parameters:
```
postgresql://user:password@host:5432/database?connection_limit=10&pool_timeout=20&connect_timeout=10&socket_timeout=10
```

## Usage

### Testing Database Connection
```typescript
import { connectDatabase, isDatabaseConnected } from '@/lib/prisma'

// Connect to database
const connected = await connectDatabase()

// Check if connected
const isConnected = await isDatabaseConnected()
```

### Using Enhanced Database Operations
All database functions now automatically include:
- Connection validation
- Retry logic (up to 3 attempts)
- Proper error handling

```typescript
import { getRoutesByRegion } from '@/lib/prisma-db'

try {
  const routes = await getRoutesByRegion('kuala-lumpur')
} catch (error) {
  // Properly typed DatabaseError
  console.error(error.message)
}
```

### Health Check API
```bash
# Check database health
curl http://localhost:3000/api/health

# Response (healthy):
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-02-08T10:30:00.000Z",
  "responseTime": 45,
  "databaseTime": [{"current_time": "2026-02-08T10:30:00.000Z"}]
}

# Response (unhealthy):
{
  "status": "unhealthy",
  "database": "error",
  "error": "Cannot reach database server",
  "timestamp": "2026-02-08T10:30:00.000Z",
  "responseTime": 5000
}
```

## Configuration

### Environment Variables
Update your `.env` file:

```env
# Primary database URL with connection pooling
DATABASE_URL="postgresql://user:password@host:5432/database?connection_limit=10&pool_timeout=20&connect_timeout=10&socket_timeout=10"

# Direct URL for migrations (non-pooled)
DATABASE_POSTGRES_URL="postgresql://user:password@host:5432/database"
```

### Connection Pool Parameters
- `connection_limit`: Max connections (default: 10)
- `pool_timeout`: Wait time for connection from pool in seconds (default: 20)
- `connect_timeout`: Wait time for new connection in seconds (default: 10)
- `socket_timeout`: Wait time for query response in seconds (default: 10)

## Retry Configuration
Default retry settings (configurable in `lib/prisma-db.ts`):
- Max retries: 3 attempts
- Initial delay: 1000ms
- Backoff: Exponential (1s, 2s, 4s)

## Error Handling Examples

### Handle Specific Errors
```typescript
import { DatabaseError } from '@/lib/prisma-db'

try {
  await createRoute({ code: 'R001', name: 'Route 1', region: 'kl' })
} catch (error) {
  if (error instanceof DatabaseError) {
    if (error.code === 'P2002') {
      console.error('Route code already exists')
    } else if (error.code === 'NOT_CONNECTED') {
      console.error('Database connection unavailable')
    }
  }
}
```

## Monitoring & Debugging

### Enable Query Logging
In development, queries are automatically logged. To enable in production:

```typescript
// lib/prisma.ts
log: ['query', 'error', 'warn']
```

### Monitor Health Endpoint
Set up monitoring tools to check `/api/health` regularly:
- Uptime monitoring (Uptime Robot, Better Uptime)
- APM tools (New Relic, Datadog)
- Custom monitoring scripts

## Commands

```bash
# Test database connection
npx prisma studio

# Generate Prisma Client with new settings
npx prisma generate

# Apply schema changes
npx prisma db push

# Run migrations
npx prisma migrate dev

# Check connection from command line
curl http://localhost:3000/api/health
```

## Performance Tips

1. **Use Connection Pooling**: Always include connection params in DATABASE_URL
2. **Monitor Response Times**: Check `/api/health` response times regularly
3. **Adjust Pool Size**: Increase `connection_limit` for high-traffic apps
4. **Use Read Replicas**: For read-heavy workloads, configure read replicas
5. **Index Optimization**: Ensure proper indexes on frequently queried fields

## Troubleshooting

### Connection Timeout Issues
- Increase `connect_timeout` and `socket_timeout`
- Check network connectivity
- Verify database server is running

### Too Many Connections
- Decrease `connection_limit`
- Check for connection leaks
- Ensure proper connection cleanup

### Slow Queries
- Enable query logging
- Check database indexes
- Use Prisma Studio to analyze query performance

## Next Steps

1. ✅ Test health endpoint: `/api/health`
2. ✅ Update `.env` with connection pool parameters
3. ✅ Run `npx prisma generate` to update Prisma Client
4. ✅ Monitor logs for connection issues
5. ✅ Set up automated health checks in production

## Resources

- [Prisma Connection Pooling](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [PostgreSQL Connection Pooling](https://www.postgresql.org/docs/current/runtime-config-connection.html)
- [Error Handling Best Practices](https://www.prisma.io/docs/guides/database/troubleshooting-orm)
