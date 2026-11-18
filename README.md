# skill-catalog

Katalog statis 87 skill AI agent — cari, filter berdasarkan kategori, baca deskripsi, salin, dan buka file `SKILL.md` tiap skill di GitHub.

Buka `index.html` di browser (atau sajikan folder ini dengan server statis apa pun, misal `python3 -m http.server`). Data skill ada di `skills.json`; isi tiap skill ada di folder `skills/<nama-skill>/`.

## Kategori

| Kategori | Jumlah |
|---|---:|
| Bug Bounty & Audit | 25 |
| Engineering | 47 |
| Mint & NFT | 6 |
| Dokumen | 7 |
| Utilitas | 2 |
| **Total** | **87** |

## Cara pakai

- Ketik di kotak cari untuk memfilter skill secara langsung.
- Klik chip kategori untuk memfilter berdasarkan kategori.
- **Salin deskripsi** menyalin deskripsi skill ke clipboard.
- **Lihat** membuka detail skill.
- **GitHub ↗** membuka file `SKILL.md` skill tersebut di repo ini.

## Catatan keamanan

Semua skill di repo ini sudah melewati secret scan sebelum publikasi (2026-11-18): tidak ada API key, token, private key, seed phrase, alamat wallet pengguna, email pribadi, atau password di dalamnya. Alamat `0x...` yang muncul di beberapa skill adalah alamat kontrak publik atau contoh placeholder. File `launch-curve-audit/roles.example.env` hanya berisi placeholder (`TOKEN=<redacted>`).
