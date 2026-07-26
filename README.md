# ITRA Throughput Tracker

R2v3 compliance tool for IT Recycling Answers (ITRA).

Mobile-friendly web application for tracking inbound loads, outbound shipments, and document control.

---

## What this first version includes

- Login system with roles (Admin / Warehouse / Viewer)
- Inbound load recording (Date, Client, Approximate size) + History
- Outbound shipment recording (Date, Category dropdown, Vendor, Note) + History
- Full approved category list pre-loaded
- Automatic recording of who entered each record and when
- Activity logging
- Clean mobile-first design for iPhone
- PDF upload + weight extraction (next)
- Document Control module (next)

---

## How to run this on your Mac

### 1. Prerequisites
- Install **Node.js** (version 18 or newer) from https://nodejs.org
- (Optional but recommended) Install **VS Code**

### 2. Open the project
```bash
cd path/to/itra-tracker
```

### 3. Install dependencies
```bash
npm install
```

### 4. Set up the environment file
```bash
cp .env.example .env
```

Then open the `.env` file and set a secret:
```
NEXTAUTH_SECRET=any-long-random-string-you-like
```

### 5. Create the database
```bash
npx prisma db push
npx prisma generate
```

### 6. Create the first admin user
We will add a simple script for this in the next step. For now you can use Prisma Studio:
```bash
npx prisma studio
```

### 7. Start the development server
```bash
npm run dev
```

Open http://localhost:3000 in your browser (or on your iPhone on the same Wi-Fi).

---

## Project Structure (important folders)

```
itra-tracker/
├── prisma/
│   └── schema.prisma          ← Database structure
├── src/
│   ├── app/
│   │   ├── login/             ← Login page
│   │   ├── page.tsx           ← Home / Dashboard
│   │   └── api/auth/          ← Authentication
│   ├── lib/
│   │   ├── prisma.ts          ← Database connection
│   │   ├── auth.ts            ← Login logic
│   │   └── utils.ts
│   └── components/            ← Reusable UI pieces (coming)
├── .env.example
└── package.json
```

---

## Next steps we will build together

1. Finish authentication + create first users (William = Admin, Avery = Warehouse)
2. New Inbound form (working)
3. New Outbound form + Category dropdown
4. Outbound history + PDF upload
5. Document Control screens
6. Basic reports
7. Activity log view

---

## Notes for later Mac hosting

Because we are using SQLite + Next.js, you will be able to run this on a Mac that stays on at the warehouse or office. We can also move it to a simple cloud host later if desired.
