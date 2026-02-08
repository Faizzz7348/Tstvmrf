# Deployment Guide for Vercel

## Masalah: Data Tidak Tersimpan di Vercel

Aplikasi ini sebelumnya hanya menggunakan `useState` untuk menyimpan data di memori browser. Bila page di-refresh atau deploy baru, semua data akan hilang.

**Penyelesaian:** Data sekarang disimpan ke Supabase database untuk persistence yang sebenar.

---

## Langkah-Langkah Deployment

### 1. Setup Supabase Database

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project anda atau create project baru
3. Pergi ke **SQL Editor**
4. Copy dan paste kandungan file `supabase-schema.sql`
5. Klik **Run** untuk create tables dan setup

### 2. Dapatkan Supabase Credentials

1. Dalam Supabase Dashboard, pergi ke **Settings** → **API**
2. Copy nilai berikut:
   - `Project URL` → untuk `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → untuk `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Configure Environment Variables di Vercel

1. Login ke [Vercel Dashboard](https://vercel.com)
2. Pilih project anda
3. Pergi ke **Settings** → **Environment Variables**
4. Tambah environment variables berikut:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**PENTING:** 
- Pastikan nama variable TEPAT seperti di atas
- Kedua-dua variable MESTI ada prefix `NEXT_PUBLIC_` untuk accessible di browser
- Set untuk **Production**, **Preview**, dan **Development** environments

### 4. Deploy ke Vercel

#### Option A: Auto-deploy (Recommended)
1. Push code ke GitHub repository anda
2. Vercel akan auto-detect changes dan deploy

#### Option B: Manual deploy
```bash
# Install Vercel CLI jika belum
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 5. Verify Deployment

1. Buka app di Vercel URL
2. Cuba create/edit data
3. Refresh page - data sepatutnya masih ada
4. Check Supabase Dashboard → **Table Editor** untuk verify data tersimpan

---

## Struktur Database

### Tables

#### `routes`
- `id` (UUID) - Primary key
- `code` (TEXT) - Route code (e.g., "KL-001")
- `location` (TEXT) - Location name
- `delivery` (TEXT) - Delivery type
- `shift` (TEXT) - "AM" atau "PM"
- `region` (TEXT) - "kuala-lumpur" atau "selangor"
- `delivery_mode` (TEXT) - "daily", "alt1", "alt2", "weekday", "weekend"
- `last_update_time` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### `locations`
- `id` (UUID) - Primary key
- `route_id` (UUID) - Foreign key ke `routes`
- `no` (INTEGER) - Sequence number
- `code` (TEXT) - Location code
- `location` (TEXT) - Location name
- `delivery` (TEXT) - Delivery type
- `delivery_mode` (TEXT) - Delivery mode
- `lat` (TEXT) - Latitude (optional)
- `lng` (TEXT) - Longitude (optional)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

---

## Features

### ✅ Database Persistence
- Data disimpan di Supabase PostgreSQL
- Auto-sync bila save changes
- Data kekal selepas refresh/redeploy

### ✅ Auto-initialization
- First time load: Auto-populate dengan sample data
- Next load: Load dari database

### ✅ Error Handling
- Fallback ke local data jika database fail
- Toast notifications untuk errors
- Loading states untuk better UX

---

## Troubleshooting

### Data masih tidak tersimpan?

1. **Check Environment Variables**
   ```bash
   # Di local, verify .env.local ada:
   cat .env.local
   
   # Di Vercel, check Settings → Environment Variables
   ```

2. **Verify Supabase Setup**
   - Tables created successfully?
   - RLS policies enabled?
   - Network connection OK?

3. **Check Browser Console**
   ```javascript
   // Should see database operations
   // Look for errors in console
   ```

4. **Test Supabase Connection**
   - Open Supabase Dashboard
   - Go to Table Editor
   - Check if `routes` and `locations` tables exist
   - Try adding data manually

### Common Issues

#### Issue: "Failed to load data"
**Solution:** Check Supabase credentials dalam environment variables

#### Issue: "Permission denied"
**Solution:** Verify RLS policies dalam Supabase - pastikan policies allow operations

#### Issue: Data hilang selepas refresh
**Solution:** 
1. Check browser console untuk errors
2. Verify `handleSaveChanges` dipanggil
3. Check Supabase Table Editor untuk data

#### Issue: Slow loading
**Solution:** 
- Check Supabase region (pastikan dekat dengan users)
- Consider adding indexes (already included in schema)
- Enable caching jika perlu

---

## Local Development

```bash
# 1. Clone repository
git clone <your-repo>
cd Tstvmrf

# 2. Install dependencies
npm install

# 3. Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EOF

# 4. Run development server
npm run dev

# 5. Open browser
# Visit http://localhost:3000
```

---

## Files Modified

1. **`/lib/database.ts`** - Database operations layer
2. **`/hooks/use-routes.ts`** - Custom hook untuk data management
3. **`/app/kuala-lumpur/page.tsx`** - Updated dengan DB persistence
4. **`/app/selangor/page.tsx`** - Updated dengan DB persistence
5. **`/supabase-schema.sql`** - Database schema

---

## Next Steps

### Optional Improvements

1. **Authentication**
   - Add Supabase Auth untuk user login
   - Restrict data access by user

2. **Real-time Updates**
   - Use Supabase Realtime subscriptions
   - Multiple users can see changes instantly

3. **Backup & Export**
   - Add export to CSV/Excel
   - Scheduled backups

4. **Performance**
   - Add pagination untuk large datasets
   - Implement search optimization

---

## Support

Jika masih ada masalah:
1. Check Supabase logs: Dashboard → Logs
2. Check Vercel logs: Project → Deployments → View logs
3. Enable debug mode dengan add `console.log` dalam `lib/database.ts`

---

**Status:** ✅ Data sekarang tersimpan secara persistent di Supabase database!
