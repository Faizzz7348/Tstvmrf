export type Language = 'en' | 'ms'

export const translations = {
  en: {
    // Common
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    apply: 'Apply',
    reset: 'Reset',
    search: 'Search',
    loading: 'Loading',
    yes: 'Yes',
    no: 'No',
    
    // Navigation
    home: 'Home',
    inbox: 'Inbox',
    calendar: 'Calendar',
    search_nav: 'Search',
    settings: 'Settings',
    
    // Route List
    routeList: 'Route List',
    selangor: 'Selangor',
    kualaLumpur: 'Kuala Lumpur',
    plano: 'Plano',
    standard: 'Standard',
    analytics: 'Analytics',
    
    // Settings
    settingsTitle: 'Settings',
    language: 'Language',
    selectLanguage: 'Select Language',
    english: 'English',
    malay: 'Bahasa Malaysia',
    theme: 'Theme',
    darkMode: 'Dark Mode',
    
    // Table
    code: 'Code',
    location: 'Location',
    delivery: 'Delivery',
    action: 'Action',
    latitude: 'Latitude',
    longitude: 'Longitude',
    
    // Route Actions
    createRoute: 'Create Route',
    editRoute: 'Edit Route',
    deleteRoute: 'Delete Route',
    viewDetails: 'View Details',
    routeDetails: 'Route Details',
    
    // Edit Mode
    editMode: 'Edit Mode',
    viewMode: 'View Mode',
    unsavedChanges: 'Unsaved Changes',
    saveChanges: 'Save Changes',
    discardChanges: 'Discard Changes',
    continueEditing: 'Continue Editing',
    saveAndExit: 'Save & Exit',
    
    // Delivery
    daily: 'Daily',
    alt1: 'Alt 1',
    alt2: 'Alt 2',
    weekday: 'Weekday',
    weekend: 'Weekend',
    deliverySettings: 'Delivery Settings',
    deliveryToday: 'Delivery Today',
    
    // Info Modal
    information: 'Information',
    description: 'Description',
    addDescription: 'Add',
    noDescription: 'No description available.',
    noDescriptionEdit: 'No description. Click "Add" to add one.',
    navigationActions: 'Navigation & Actions',
    googleMaps: 'Google Maps',
    waze: 'Waze',
    qrCode: 'QR Code',
    scanning: 'Scanning...',
    
    // Column Customize
    columnCustomize: 'Column Customize',
    columnCustomizeDesc: 'Show/hide columns and reorder them as you prefer.',
    showHideColumns: 'Show/hide columns',
    required: 'Required',
    
    // Row Customize
    rowCustomize: 'Row Customize',
    rowCustomizeDesc: 'Enter custom order numbers for rows to reorder them as you prefer.',
    customSort: 'Custom Sort',
    myLists: 'My Lists',
    saveCurrentList: 'Save Current as New List',
    noSavedLists: 'No saved lists yet',
    enterListName: 'Enter list name...',
    applySort: 'Apply Sort',
    
    // Confirmations
    openGoogleMaps: 'Open Google Maps?',
    openWaze: 'Open Waze?',
    openQRCode: 'Open QR Code URL?',
    navigateToLocation: 'You will be taken to',
    forNavigation: 'for navigation to this location.',
    coordinates: 'Coordinates',
    platform: 'Platform',
    newTabWillOpen: 'A new tab will be opened in your browser',
    destinationUrl: 'Destination URL',
    
    // Messages
    pleaseEnableEditMode: 'Please enable Edit Mode to change delivery settings',
    allChangesSaved: 'All changes saved successfully!',
    failedToSave: 'Failed to save changes. Please try again.',
    changesDiscarded: 'Changes discarded',
    customSortApplied: 'Custom sort applied!',
    qrCodeUpdated: 'QR Code updated!',
    
    // Delete Confirmations
    confirmDelete: 'Are you sure you want to delete this?',
    deleteWarning: 'This action cannot be undone.',
    unsavedChangesWarning: '⚠️ If you exit without saving, all your changes will be lost.',
    
    // Add Location
    addLocation: 'Add Location',
    addNewLocation: 'Add New Location',
    fillRequiredFields: 'Please fill in all required fields',
    
    // Move Rows
    moveRows: 'Move Rows',
    moveSelectedRows: 'Move Selected Rows',
    selectRegion: 'Select Region',
    selectRoute: 'Select Route',
    
    // Errors
    duplicateCode: 'Duplicate',
    errorLoadingData: 'Failed to load data. Using local data.',
    
    // Time
    lastUpdated: 'Last updated',
    justNow: 'Just now',
    minutesAgo: 'minutes ago',
    hoursAgo: 'hours ago',
    daysAgo: 'days ago',
  },
  ms: {
    // Common
    save: 'Simpan',
    cancel: 'Batal',
    close: 'Tutup',
    delete: 'Padam',
    edit: 'Edit',
    add: 'Tambah',
    apply: 'Guna',
    reset: 'Set Semula',
    search: 'Cari',
    loading: 'Memuatkan',
    yes: 'Ya',
    no: 'Tidak',
    
    // Navigation
    home: 'Utama',
    inbox: 'Peti Masuk',
    calendar: 'Kalendar',
    search_nav: 'Cari',
    settings: 'Tetapan',
    
    // Route List
    routeList: 'Senarai Laluan',
    selangor: 'Selangor',
    kualaLumpur: 'Kuala Lumpur',
    plano: 'Plano',
    standard: 'Standard',
    analytics: 'Analitik',
    
    // Settings
    settingsTitle: 'Tetapan',
    language: 'Bahasa',
    selectLanguage: 'Pilih Bahasa',
    english: 'English',
    malay: 'Bahasa Malaysia',
    theme: 'Tema',
    darkMode: 'Mod Gelap',
    
    // Table
    code: 'Kod',
    location: 'Lokasi',
    delivery: 'Penghantaran',
    action: 'Tindakan',
    latitude: 'Latitud',
    longitude: 'Longitud',
    
    // Route Actions
    createRoute: 'Cipta Laluan',
    editRoute: 'Edit Laluan',
    deleteRoute: 'Padam Laluan',
    viewDetails: 'Lihat Butiran',
    routeDetails: 'Butiran Laluan',
    
    // Edit Mode
    editMode: 'Mod Edit',
    viewMode: 'Mod Lihat',
    unsavedChanges: 'Perubahan Belum Disimpan',
    saveChanges: 'Simpan Perubahan',
    discardChanges: 'Buang Perubahan',
    continueEditing: 'Teruskan Edit',
    saveAndExit: 'Simpan & Keluar',
    
    // Delivery
    daily: 'Harian',
    alt1: 'Alt 1',
    alt2: 'Alt 2',
    weekday: 'Hari Bekerja',
    weekend: 'Hujung Minggu',
    deliverySettings: 'Tetapan Penghantaran',
    deliveryToday: 'Penghantaran Hari Ini',
    
    // Info Modal
    information: 'Maklumat',
    description: 'Penerangan',
    addDescription: 'Tambah',
    noDescription: 'Tiada penerangan tersedia.',
    noDescriptionEdit: 'Tiada penerangan. Klik "Tambah" untuk menambah.',
    navigationActions: 'Navigasi & Aksi',
    googleMaps: 'Google Maps',
    waze: 'Waze',
    qrCode: 'QR Code',
    scanning: 'Mengimbas...',
    
    // Column Customize
    columnCustomize: 'Sesuaikan Lajur',
    columnCustomizeDesc: 'Tunjuk/sembunyikan lajur dan susun semula mengikut pilihan anda.',
    showHideColumns: 'Tunjuk/sembunyikan lajur',
    required: 'Diperlukan',
    
    // Row Customize
    rowCustomize: 'Sesuaikan Baris',
    rowCustomizeDesc: 'Masukkan nombor urutan untuk menyusun semula baris mengikut pilihan anda.',
    customSort: 'Susunan Tersuai',
    myLists: 'Senarai Saya',
    saveCurrentList: 'Simpan Senarai Semasa',
    noSavedLists: 'Tiada senarai tersimpan',
    enterListName: 'Masukkan nama senarai...',
    applySort: 'Guna Susunan',
    
    // Confirmations
    openGoogleMaps: 'Buka Google Maps?',
    openWaze: 'Buka Waze?',
    openQRCode: 'Buka URL QR Code?',
    navigateToLocation: 'Anda akan dibawa ke',
    forNavigation: 'untuk navigasi ke lokasi ini.',
    coordinates: 'Koordinat',
    platform: 'Platform',
    newTabWillOpen: 'Tab baru akan dibuka dalam browser anda',
    destinationUrl: 'URL Destinasi',
    
    // Messages
    pleaseEnableEditMode: 'Sila aktifkan Mod Edit untuk mengubah tetapan penghantaran',
    allChangesSaved: 'Semua perubahan berjaya disimpan!',
    failedToSave: 'Gagal menyimpan perubahan. Sila cuba lagi.',
    changesDiscarded: 'Perubahan dibuang',
    customSortApplied: 'Susunan tersuai diguna!',
    qrCodeUpdated: 'QR Code dikemaskini!',
    
    // Delete Confirmations
    confirmDelete: 'Adakah anda pasti mahu memadam ini?',
    deleteWarning: 'Tindakan ini tidak boleh dibatal.',
    unsavedChangesWarning: '⚠️ Jika anda keluar tanpa menyimpan, semua perubahan akan hilang.',
    
    // Add Location
    addLocation: 'Tambah Lokasi',
    addNewLocation: 'Tambah Lokasi Baru',
    fillRequiredFields: 'Sila isi semua medan yang diperlukan',
    
    // Move Rows
    moveRows: 'Pindah Baris',
    moveSelectedRows: 'Pindah Baris Terpilih',
    selectRegion: 'Pilih Wilayah',
    selectRoute: 'Pilih Laluan',
    
    // Errors
    duplicateCode: 'Pendua',
    errorLoadingData: 'Gagal memuat data. Menggunakan data tempatan.',
    
    // Time
    lastUpdated: 'Dikemaskini',
    justNow: 'Sebentar tadi',
    minutesAgo: 'minit lalu',
    hoursAgo: 'jam lalu',
    daysAgo: 'hari lalu',
  }
}

export type TranslationKey = keyof typeof translations.en
