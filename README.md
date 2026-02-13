# Car Sticker QR Generator

## 1) Setup

```bash
npm install
cp .env.example .env
npm run dev
```

## 2) Firebase setup

1. Create a Firebase project.
2. Enable Cloud Firestore.
3. Create a Web App in Firebase console.
4. Copy credentials into `.env` using Vite variable names.
5. Deploy Firestore rules:

```bash
firebase init firestore
firebase deploy --only firestore:rules
```

## 3) Firestore schema

- `metadata/sequence`
  - `lastSequence: number`
- `stickers/{docId}`
  - `code: string`
  - `createdAt: timestamp`
  - `printed: boolean`

## 4) Available scripts

```bash
npm run dev
npm run build
npm run preview
```

## 5) Optional deployment (Firebase Hosting)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```
