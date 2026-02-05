# Sidebar Demo dengan shadcn/ui

Project ini adalah implementasi sidebar menggunakan shadcn/ui dengan Radix UI primitives dengan **Overlay Mode & Backdrop Blur**.

## 🚀 Fitur

- ✅ **Overlay Mode** - Sidebar muncul di atas konten (floating)
- ✅ **Backdrop Blur** - Background blur saat sidebar dibuka
- ✅ Sidebar yang responsif (mobile & desktop)
- ✅ Keyboard shortcut (Ctrl/Cmd + B untuk toggle)
- ✅ Menu dengan sub-menu
- ✅ Dark mode support
- ✅ Smooth animations
- ✅ Menggunakan Tailwind CSS
- ✅ TypeScript support
- ✅ Routing lengkap untuk setiap menu

## ✨ Behavior Sidebar

Ketika sidebar dibuka:
- 🎯 Sidebar muncul dari kiri dengan animasi slide
- 🌫️ Background menjadi gelap dengan efek blur (backdrop-blur)
- 👆 Klik di luar sidebar atau backdrop untuk menutup
- ⌨️ Tekan Ctrl/Cmd + B untuk toggle
- 📱 Di mobile, menggunakan sheet native

## 📦 Instalasi

1. Install dependencies:
```bash
npm install
```

## 🏃 Menjalankan Project

Jalankan development server:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

## 📁 Struktur Halaman

- `/` - Halaman Welcome (landing page)
- `/home` - Halaman Home dengan dashboard cards
- `/inbox` - Halaman Inbox dengan daftar pesan
- `/calendar` - Halaman Calendar dengan jadwal event
- `/search` - Halaman Search dengan fitur pencarian
- `/settings` - Halaman Settings untuk konfigurasi

Setiap halaman memiliki:
- Sidebar yang konsisten
- Header dengan breadcrumb
- Konten yang sesuai dengan fungsinya

## 🎨 Struktur Komponen

- `components/ui/sidebar.tsx` - Komponen sidebar utama dari shadcn/ui
- `components/app-sidebar.tsx` - Implementasi sidebar dengan menu items
- `app/page.tsx` - Halaman welcome/landing
- `app/home/page.tsx` - Halaman Home
- `app/inbox/page.tsx` - Halaman Inbox
- `app/calendar/page.tsx` - Halaman Calendar
- `app/search/page.tsx` - Halaman Search
- `app/settings/page.tsx` - Halaman Settings

## 🔧 Kustomisasi

### Menambah Menu Items

Edit file `components/app-sidebar.tsx`:

```typescript
const items = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  // Tambahkan menu baru di sini
]
```

### Membuat Halaman Baru

1. Buat folder baru di `app/nama-halaman/`
2. Tambahkan file `page.tsx` dengan struktur yang sama
3. Update link di `app-sidebar.tsx`

### Mengubah Tema

Edit file `app/globals.css` untuk mengubah color scheme.

## 📚 Referensi

- [shadcn/ui Sidebar Documentation](https://ui.shadcn.com/docs/components/radix/sidebar)
- [Radix UI](https://www.radix-ui.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)