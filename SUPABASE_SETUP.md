# Supabase Setup

## Environment Variables
File `.env.local` telah dikonfigurasi dengan kredensial Supabase Anda.

## Installation
Jalankan command berikut untuk install dependencies:
```bash
npm install @supabase/supabase-js @supabase/ssr
```

## Supabase Clients

### 1. Client Component (Browser)
Untuk digunakan di Client Components:
```typescript
import { createClient } from '@/lib/supabase-browser'

const supabase = createClient()
```

### 2. Server Component
Untuk digunakan di Server Components:
```typescript
import { createClient } from '@/lib/supabase-server'

const supabase = await createClient()
```

### 3. Simple Client
Untuk penggunaan sederhana:
```typescript
import { supabase } from '@/lib/supabase'
```

## Contoh Penggunaan

### Fetch Data (Server Component)
```typescript
import { createClient } from '@/lib/supabase-server'

export default async function Page() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('your_table')
    .select('*')
    
  if (error) {
    console.error('Error:', error)
    return <div>Error loading data</div>
  }
  
  return <div>{/* render your data */}</div>
}
```

### Insert Data (Client Component)
```typescript
'use client'

import { createClient } from '@/lib/supabase-browser'

export default function Form() {
  const supabase = createClient()
  
  async function handleSubmit(formData: FormData) {
    const { error } = await supabase
      .from('your_table')
      .insert({
        column: formData.get('field')
      })
      
    if (error) {
      console.error('Error:', error)
    }
  }
  
  return <form action={handleSubmit}>...</form>
}
```

## Middleware
Middleware telah dikonfigurasi di `middleware.ts` untuk menangani authentication sessions secara otomatis.

## Database Connection
Connection strings untuk Postgres tersedia di `.env.local`:
- `POSTGRES_URL` - Untuk connection pooling
- `POSTGRES_URL_NON_POOLING` - Untuk direct connection
- `POSTGRES_PRISMA_URL` - Untuk Prisma ORM

## Next Steps
1. Jalankan `npm install @supabase/supabase-js @supabase/ssr`
2. Restart development server
3. Mulai menggunakan Supabase di aplikasi Anda
