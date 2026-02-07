# Setup Prisma Database untuk Routes & Gallery

## ✅ Apa Yang Sudah Dibuat

### 1. **Database Operations File** - `lib/prisma-db.ts`
File ini mengandungi semua functions untuk:
- **Routes & Locations**: Create, Read, Update, Delete routes dan locations
- **Gallery**: Create, Read, Update, Delete gallery rows dan images
- **Delivery Schedule**: Set jadual penghantaran untuk setiap lokasi
- **Reordering**: Susun semula susunan gallery rows dan images

### 2. **API Routes** untuk Client-Server Communication
- **`app/api/routes/route.ts`** - CRUD untuk routes
- **`app/api/locations/route.ts`** - CRUD untuk locations
- **`app/api/gallery/rows/route.ts`** - CRUD untuk gallery rows
- **`app/api/gallery/images/route.ts`** - CRUD untuk gallery images

### 3. **Seed Data** - `prisma/seed.ts`
Data awal untuk populate database dengan:
- 2 gallery rows dengan images
- 2 routes (Selangor & Kuala Lumpur)
- 3 locations dengan delivery schedules

---

## 🚀 Cara Setup Database

### Step 1: Push Schema ke Database
Jalankan command ini untuk buat tables dalam PostgreSQL database:

```bash
npm run db:push
```

Atau:

```bash
npx prisma db push
```

### Step 2: Populate Database dengan Seed Data
Jalankan command ini untuk masukkan data awal:

```bash
npm run db:seed
```

### Step 3: Verify Database (Optional)
Buka Prisma Studio untuk lihat data dalam database:

```bash
npm run db:studio
```

Browser akan buka Prisma Studio di http://localhost:5555

---

## 📊 Database Schema

### Tables Yang Dibuat:

1. **Route** - Laluan penghantaran
   - id, code, name, description, region, active
   - Relation: Has many Locations

2. **Location** - Lokasi dalam setiap route
   - id, code, name, address, contact, notes, position
   - Relation: Belongs to Route, Has many DeliverySchedule

3. **DeliverySchedule** - Jadual penghantaran
   - id, dayOfWeek (0-6), active
   - Relation: Belongs to Location

4. **GalleryRow** - Row untuk gallery images
   - id, title, position, active
   - Relation: Has many GalleryImages

5. **GalleryImage** - Individual images dalam gallery
   - id, url, title, subtitle, position, active
   - Relation: Belongs to GalleryRow

---

## 🔄 Cara Guna API Routes

### Routes API

**Get all routes untuk region:**
```javascript
const response = await fetch('/api/routes?region=selangor')
const routes = await response.json()
```

**Create new route:**
```javascript
const response = await fetch('/api/routes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'SEL-002',
    name: 'Route Name',
    description: 'Description',
    region: 'selangor'
  })
})
```

**Update route:**
```javascript
const response = await fetch('/api/routes', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'route-id',
    name: 'New Name'
  })
})
```

**Delete route:**
```javascript
const response = await fetch('/api/routes?id=route-id', {
  method: 'DELETE'
})
```

### Locations API

**Create location:**
```javascript
const response = await fetch('/api/locations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    routeId: 'route-id',
    code: 'LOC-001',
    name: 'Location Name',
    address: 'Address',
    contact: '03-1234567'
  })
})
```

### Gallery API

**Get all gallery rows:**
```javascript
const response = await fetch('/api/gallery/rows')
const rows = await response.json()
```

**Create gallery row:**
```javascript
const response = await fetch('/api/gallery/rows', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Row Title',
    position: 0
  })
})
```

**Create gallery image:**
```javascript
const response = await fetch('/api/gallery/images', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rowId: 'row-id',
    url: 'https://image-url.com/image.jpg',
    title: 'Image Title',
    subtitle: 'Optional subtitle'
  })
})
```

**Reorder gallery rows:**
```javascript
const response = await fetch('/api/gallery/rows', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    rowIds: ['row-id-1', 'row-id-2', 'row-id-3']
  })
})
```

---

## 📝 Next Steps

### 1. Update Frontend Pages

Anda perlu update pages untuk guna API routes instead of localStorage:

**Contoh untuk Kuala Lumpur page:**

```typescript
// app/kuala-lumpur/page.tsx
"use client"

import { useState, useEffect } from "react"

export default function KualaLumpurPage() {
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRoutes()
  }, [])

  async function loadRoutes() {
    try {
      const response = await fetch('/api/routes?region=kuala-lumpur')
      const data = await response.json()
      setRoutes(data)
    } catch (error) {
      console.error('Error loading routes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveRoute(route) {
    try {
      const response = await fetch('/api/routes', {
        method: route.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(route)
      })
      const data = await response.json()
      await loadRoutes() // Reload data
      return data
    } catch (error) {
      console.error('Error saving route:', error)
      throw error
    }
  }

  // ... rest of component
}
```

**Contoh untuk Standard/Gallery page:**

```typescript
// app/standard/page.tsx
"use client"

import { useState, useEffect } from "react"

export default function StandardPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadGallery()
  }, [])

  async function loadGallery() {
    try {
      const response = await fetch('/api/gallery/rows')
      const data = await response.json()
      setRows(data)
    } catch (error) {
      console.error('Error loading gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveRow(row) {
    try {
      const response = await fetch('/api/gallery/rows', {
        method: row.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row)
      })
      const data = await response.json()
      await loadGallery()
      return data
    } catch (error) {
      console.error('Error saving row:', error)
      throw error
    }
  }

  // ... rest of component
}
```

### 2. Remove localStorage Code

Setelah update ke Prisma, boleh remove kod localStorage dari:
- `lib/database.ts` (optional: keep as backup or migration tool)
- Frontend pages yang masih guna localStorage

---

## 🔧 Troubleshooting

### Error: Cannot connect to database
- Check `.env` file ada DATABASE_URL yang betul
- Verify network connection ke Prisma Cloud
- Try run `npm run db:push` sekali lagi

### Error: Schema not in sync
- Run `npx prisma generate`
- Run `npm run db:push`

### Data tak keluar dalam frontend
- Check browser console untuk errors
- Verify API routes berfungsi dengan baik (check Network tab)
- Verify database ada data (guna Prisma Studio)

---

## ⚠️ Penting

1. **Data Security**: Data sekarang tersimpan dalam PostgreSQL database yang secure dan persistent.

2. **Performance**: Database akan lebih pantas untuk query besar berbanding localStorage.

3. **Multi-device**: Data boleh access dari mana-mana device kerana tersimpan di cloud.

4. **Backup**: Database automatically backup oleh Prisma Cloud.

5. **Migration**: Kalau ada data existing dalam localStorage, perlu buat migration script untuk pindah ke Prisma.

---

## 🎯 Kelebihan Guna Prisma Database

✅ **Persistent** - Data tak hilang bila clear browser cache  
✅ **Secure** - Data encrypted dan tersimpan di PostgreSQL  
✅ **Scalable** - Boleh handle banyak data  
✅ **Relational** - Mudah handle relationships antara data  
✅ **Type-safe** - TypeScript support penuh  
✅ **Multi-user** - Boleh handle concurrent access  

---

Untuk soalan atau masalah, boleh rujuk:
- Prisma Documentation: https://www.prisma.io/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs
