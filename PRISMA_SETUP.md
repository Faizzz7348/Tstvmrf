# Prisma Database Setup

## Overview
Prisma ORM sudah disetup dengan database PostgreSQL (menggunakan Prisma Accelerate).

## File Structure
```
prisma/
  ├── schema.prisma    # Database schema definition
  └── seed.ts          # Seed data script
prisma.config.ts       # Prisma 7 configuration
lib/
  └── prisma.ts        # Prisma client singleton
```

## Database Models

### Route Management
- **Route** - Routes untuk setiap region (selangor, kuala-lumpur, etc)
- **Location** - Locations dalam setiap route
- **DeliverySchedule** - Jadwal delivery untuk setiap location

### Gallery (Standard Page)
- **GalleryRow** - Rows untuk horizontal scrolling gallery
- **GalleryImage** - Images dalam setiap row

### User Management
- **User** - User accounts (optional)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client
```bash
npm run db:generate
```

### 3. Push Schema to Database
```bash
npm run db:push
```
Ini akan membuat tables di database tanpa migrations (bagus untuk development).

ATAU gunakan migrations (recommended untuk production):
```bash
npm run db:migrate
```

### 4. Seed Database (Optional)
```bash
npm run db:seed
```
Ini akan populate database dengan sample data.

### 5. Open Prisma Studio (Optional)
```bash
npm run db:studio
```
Visual editor untuk database - buka di browser.

## Using Prisma in Your Code

### Import Prisma Client
```typescript
import { prisma } from '@/lib/prisma'
```

### Example Queries

#### Get All Routes
```typescript
const routes = await prisma.route.findMany({
  where: { region: 'selangor' },
  include: {
    locations: {
      include: {
        deliverySchedule: true
      }
    }
  }
})
```

#### Create New Gallery Image
```typescript
const image = await prisma.galleryImage.create({
  data: {
    rowId: 'row-id-here',
    url: 'https://example.com/image.jpg',
    title: 'Image Title',
    subtitle: 'Image Subtitle',
    position: 0
  }
})
```

#### Update Location
```typescript
const updated = await prisma.location.update({
  where: { id: 'location-id' },
  data: { 
    name: 'New Name',
    active: true
  }
})
```

#### Delete Route with Cascade
```typescript
await prisma.route.delete({
  where: { id: 'route-id' }
})
// Locations and DeliverySchedules akan automatically deleted (cascade)
```

## Environment Variables

Make sure `.env` contains:
```env
DATABASE_URL="your-database-connection-string"
```

## Commands Reference

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema to DB (no migrations) |
| `npm run db:migrate` | Create and run migrations |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run db:seed` | Seed database with sample data |

## Additional Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

## Troubleshooting

### Error: Prisma Client not generated
```bash
npm run db:generate
```

### Error: Database connection failed
Check `.env` file and make sure `DATABASE_URL` is correct.

### Want to reset database?
```bash
npx prisma db push --force-reset
npm run db:seed
```

⚠️ **Warning**: This will delete all data!
