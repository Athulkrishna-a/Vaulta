# ExpenseTrack — Native Android Expense & Money Tracker App

ExpenseTrack is a **modern, Android-first personal finance application** built with **React, TypeScript, Vite, Material UI (M3), Framer Motion, IndexedDB, and Capacitor**.

It is designed to deliver a smooth native Android experience with dynamic light/dark mode support, glassmorphism surface cards, ultra-fast transaction entry, interactive analytics, offline data persistence, and zero account requirements.

---

## 🌟 Key Features

* **⚡ Ultra-Fast Expense Entry:** Prominent Floating Action Button (+) opens a numeric keyboard bottom sheet for lightning-fast transaction logging.
* **📱 Material Design 3 UI:** Fluid glass surfaces, 24px rounded containers, subtle elevation, and responsive bottom navigation.
* **🎨 Dynamic System Themes:** Adapts to Android Light/Dark mode with Material 3 semantic color tokens.
* **📊 Interactive Charts:** Circular/donut monthly spending chart with category breakdown and 6-month comparative cash flow trends.
* **💼 Multi-Wallet & Account Management:** Track Cash, Bank Accounts, UPI Wallets, and Credit Cards with account transfers (`SBI Bank -> Cash`).
* **📦 Complete Backup & Restore:** Export data to standard JSON or CSV files; restore backups with automated validation and count summaries.
* **🔒 App Lock Security:** Optional 4-digit PIN lock screen protecting your financial privacy.
* **📴 100% Offline & Private:** Built on local IndexedDB storage. No user accounts, cloud dependencies, or tracking.

---

## 🛠 Technology Stack

* **Frontend:** React 19, TypeScript, Vite
* **UI Components & Styling:** Material UI (MUI v6), Material Design 3 tokens, Emotion
* **Animations:** Framer Motion
* **Routing:** React Router DOM v7
* **Charts:** Recharts
* **Icons:** Lucide React
* **Data Storage:** IndexedDB (`idb` promise library) with localStorage fallback
* **Native Android Wrapper:** Capacitor 7 (`@capacitor/core`, `@capacitor/android`, `@capacitor/haptics`, `@capacitor/status-bar`, `@capacitor/app`)

---

## 🚀 Getting Started

### Prerequisites

* Node.js `v18+` or `v22+`
* npm `v9+`
* Android Studio (for native Android builds)

### 1. Installation

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

### 3. Build Production Bundle

```bash
npm run build
```

---

## 🤖 Android Setup & Packaging (Capacitor)

To build and run ExpenseTrack as a native Android APK:

### 1. Add Android Platform

```bash
npx cap add android
```

### 2. Build Web Assets & Sync to Android Studio

```bash
npm run build
npx cap sync android
```

### 3. Open Project in Android Studio

```bash
npx cap open android
```

From Android Studio, connect your physical Android device or emulator and click **Run** (or `Build > Build APK`).

---

## 📂 Architecture & Directory Structure

```text
src/
├── app/
│   ├── App.tsx                  # Root app & Capacitor back button handler
│   ├── router.tsx               # React Router & global transaction bottom sheet
│   └── providers/               # AppData, Theme, and Security providers
├── components/
│   ├── common/                  # GlassCard, CategoryIcon, CurrencyText, AppLockScreen
│   ├── dashboard/               # MonthSummaryCard, ExpenseDonutChart, BudgetProgressBar
│   ├── transactions/            # TransactionItem, TransactionFormSheet, FilterBar
│   ├── statistics/              # CategoryBreakdown, MonthlyComparisonChart, Insights
│   └── settings/                # BackupRestoreDialog
├── pages/
│   ├── HomePage.tsx             # Home Dashboard
│   ├── TransactionsPage.tsx     # Transaction History
│   ├── StatisticsPage.tsx       # Analytics & Charts
│   ├── CategoriesPage.tsx       # Custom Category Manager
│   ├── AccountsPage.tsx         # Account/Wallet Manager
│   └── SettingsPage.tsx         # Preferences & Backup/Restore
├── data/
│   ├── db.ts                    # IndexedDB schema & initialization
│   └── repositories/            # Transaction, Category, Account, Budget, Recurring repositories
├── hooks/                       # Custom hooks (useAppData, useAppTheme, useHaptics)
├── utils/                       # Financial calculations, date formatting, CSV/JSON backup
└── theme/                       # Material 3 light/dark palette definitions
```

---

## 🔒 Security & Data Privacy

ExpenseTrack is strictly **privacy-first**:
* All transactions, custom categories, and wallet balances remain exclusively inside your device's IndexedDB.
* Data backups are created locally as standard `.json` files.
* PIN hashes are computed locally. No data ever leaves your device.
