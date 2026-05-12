# 🤖 Telegram Bot — Backend Development Learning Project

Bot Telegram modular dengan Node.js untuk belajar backend development. Fitur lengkap termasuk user management, limit system, premium features, dan media downloader.

## 📋 Fitur Utama

### 👤 User Management

- **Free/Premium/Owner** roles dengan system berbeda
- **Daily limit** — 10x per hari (auto reset tengah malam)
- **Premium unlimited** — tanpa batasan penggunaan
- **Ban system** — owner bisa ban user yang tidak patuh

### 📥 Media Downloader

- **YouTube** — download video (720p max) atau audio (MP3)
- **TikTok** — download tanpa watermark
- **Instagram** — download foto/video & Reels

### 📊 Commands

- `/start` — pesan selamat datang
- `/help` — daftar semua command
- `/info` — profil & status akun
- `/cuaca` — simulasi info cuaca
- `/kalkulator` — hitung simple
- `/catat` — simpan catatan
- `/catatan` — lihat catatan
- `/hapus` — hapus semua catatan
- `/random` — quote/joke acak
- `/cari` — cari definisi kata (English dictionary)
- `/konversi` — konversi mata uang, suhu, jarak, berat
- `/yt` — download YouTube video
- `/ytmp3` — download YouTube audio
- `/tt` — download TikTok
- `/ig` — download Instagram

### 👑 Owner Commands

- `/users` — lihat semua user
- `/setpremium <id>` — jadikan premium
- `/removepremium <id>` — cabut premium
- `/setlimit <id> <n>` — set limit harian
- `/ban <id>` — ban user
- `/unban <id>` — unban user
- `/broadcast <pesan>` — kirim ke semua user
- `/stats` — statistik bot

## 🚀 Setup

### 1. Clone & Install Dependencies

```bash
git clone <repo-url>
cd telegram-bot-v2
npm install
```

### 2. Buat Telegram Bot

1. Chat dengan [@BotFather](https://t.me/BotFather) di Telegram
2. Ketik `/newbot`
3. Ikuti instruksi, salin **token** yang diberikan

### 3. Setup Environment

```bash
cp .env.example .env
```

Edit `.env`:

```
BOT_TOKEN=123456789:AAFxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OWNER_ID=987654321
```

**Cara dapat OWNER_ID:** Chat dengan [@userinfobot](https://t.me/userinfobot)

### 4. Setup Media Downloader

#### yt-dlp (YouTube, TikTok, Instagram)

```bash
# Windows (via winget)
winget install yt-dlp

# Linux
sudo apt install yt-dlp

# atau pip
pip install yt-dlp

# Manual: download & taruh di folder bin/
# https://github.com/yt-dlp/yt-dlp/releases
```

#### FFmpeg (untuk audio conversion)

```bash
# Windows
winget install ffmpeg

# Linux
sudo apt install ffmpeg

# Manual: https://ffmpeg.org/download.html
```

### 5. Jalankan Bot

```bash
npm start          # production
npm run dev        # development (auto-restart dengan nodemon)
```

## 📁 Struktur Folder

```
telegram-bot-v2/
├── index.js                    ← entry point
├── package.json
├── .env.example
│
├── commands/                   ← semua command
│   ├── commands.js             ← auto-loader
│   ├── public/                 ← command biasa
│   │   ├── start.js
│   │   ├── help.js
│   │   ├── info.js
│   │   ├── cuaca.js
│   │   ├── kalkulator.js
│   │   ├── catat.js
│   │   ├── catatan.js
│   │   ├── hapus.js
│   │   ├── random.js
│   │   ├── cari.js
│   │   ├── konversi.js
│   │   ├── youtube.js
│   │   ├── tiktok.js
│   │   └── instagram.js
│   ├── owner/                  ← owner only
│   │   ├── users.js
│   │   ├── setpremium.js
│   │   ├── removepremium.js
│   │   ├── setlimit.js
│   │   ├── ban.js
│   │   ├── unban.js
│   │   ├── broadcast.js
│   │   ├── stats.js
│   │   └── ownerhelp.js
│   └── premium/                ← premium only
│       └── vip.js
│
├── handlers/                   ← event handlers
│   ├── handlers.js             ← index
│   └── messageHandler.js       ← handle pesan biasa
│
├── middleware/                 ← guards & checks
│   └── guards.js               ← banGuard, limitGuard, ownerGuard
│
├── database/                   ← data persistence
│   ├── db.js                   ← in-memory store
│   └── db.json                 ← user data
│
├── utils/                      ← utilities
│   ├── ytdlp.js                ← YouTube/TikTok/Instagram downloader
│   ├── helpers.js              ← randomPick(), sleep()
│   └── store.js                ← note storage
│
├── scripts/                    ← setup scripts
│   ├── install-ytdlp.js        ← auto-install yt-dlp
│   ├── install-ffmpeg.js       ← auto-install ffmpeg
│   └── export-cookies.js       ← export YouTube cookies (optional)
│
└── bin/                        ← local binaries (optional)
    ├── yt-dlp.exe              ← atau yt-dlp (Linux)
    └── ffmpeg.exe              ← atau ffmpeg (Linux)
```

## 🎓 Konsep Backend yang Dipelajari

### Async/Promise/Callbacks

- Command execution dengan `async/await`
- Promise handling di `cuaca.js`, `random.js`, `cari.js`

### Modular Architecture

- Plugin system — command auto-load dari folder
- Separation of concerns — commands, handlers, middleware, database

### Middleware & Guards

- `banGuard` — cek user tidak di-ban
- `limitGuard` — cek limit harian
- `ownerGuard` — cek hanya owner yang boleh akses

### Database (JSON)

- In-memory store untuk user data
- Auto-reset limit setiap hari
- Simple CRUD operations

### External APIs

- Weather API (simulasi)
- Quote API (zenquotes.io)
- Joke API (jokeapi.dev)
- Dictionary API (dictionaryapi.dev)
- Exchange Rate API (open.er-api.com)
- YouTube/TikTok downloader (yt-dlp)

### Error Handling

- Try-catch untuk async operations
- User-friendly error messages
- Graceful fallback untuk format selection

## 🔄 Workflow Limit System

1. User ketik command (misal `/cuaca`)
2. `commands.js` cek `useLimit: true`
3. Jalankan `banGuard` — cek tidak di-ban
4. Jalankan `limitGuard` — cek limit & kurangi usage
5. Execute command jika semua pass
6. Limit auto-reset tengah malam

## 🎬 Download Media

### YouTube

```
/yt https://youtu.be/xxxx           → download video
/ytmp3 https://youtu.be/xxxx        → download audio MP3
```

### TikTok

```
/tt https://vt.tiktok.com/xxxx      → download tanpa watermark
```

### Instagram

```
/ig https://www.instagram.com/p/xxx  → download foto/video
/ig https://www.instagram.com/reel/xxx → download reels
```

**Batasan:**

- Video max 50MB (limit Telegram)
- YouTube: max 10 menit
- Video age-restricted/private: butuh cookies

### Setup Cookies (Optional)

Untuk video age-restricted atau private:

```bash
node scripts/export-cookies.js
```

Ini akan export cookies dari Chrome, simpan ke `cookies.txt`. Bot otomatis pakai file ini.

## 📊 Owner Panel

Owner bisa manage seluruh bot:

```
/users              → lihat semua user + status
/setpremium 123     → jadikan user 123 premium
/setlimit 123 20    → set limit user 123 jadi 20x/hari
/ban 123            → ban user 123
/broadcast Halo     → kirim pesan ke semua user
/stats              → lihat statistik bot
```

## 🛠️ Development Tips

### Tambah Command Baru

1. Buat file di `commands/public/` (atau `owner/`, `premium/`)
2. Contoh struktur:
   ```javascript
   module.exports = {
     name: "ping",
     alias: ["p"],
     category: "public",
     description: "Ping pong",
     useLimit: false, // set true kalau perlu kurangi limit

     async run({ bot, chatId, msg, fullArgs }) {
       await bot.sendMessage(chatId, "🏓 Pong!");
     },
   };
   ```
3. Auto-load otomatis — tidak perlu edit file lain!

### Debug

```bash
# Lihat error message di console
npm run dev

# Test download
node -e "const yt = require('./utils/ytdlp'); yt.getInfo('https://youtu.be/xxxx').then(console.log).catch(console.error)"
```

### Deploy

Untuk production di Linux/VPS:

1. Install Node.js LTS
2. Install yt-dlp & FFmpeg via package manager
3. Clone project, `npm install`, `npm start`
4. Gunakan PM2 untuk keep alive: `pm2 start index.js`

## 📝 Notes

- Database hanya in-memory — data hilang saat bot restart. Untuk persist, ganti dengan MongoDB/PostgreSQL
- API gratis untuk semua external services
- Cookies untuk YouTube bersifat optional (yt-dlp akan auto-bypass jika bisa)
- Bot menggunakan polling (long-polling) — untuk production pertimbangkan webhook

## 📄 License

Free to use untuk learning purpose.

## 🤝 Contributing

Saran & improvement welcome! File an issue atau fork & PR.

---

**Happy Coding! 🚀**

Untuk pertanyaan lebih lanjut tentang backend development, lihat dokumentasi resmi:

- Telegram Bot API: https://core.telegram.org/bots/api
- yt-dlp: https://github.com/yt-dlp/yt-dlp
- Node.js: https://nodejs.org/docs/
