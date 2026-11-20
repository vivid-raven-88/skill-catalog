---
name: clip-sound-design
description: Pakai skill ini setiap kali bikin klip/video pendek yang pakai musik atau suara — tambah lagu ke video, mix musik di bawah suara game, atur level audio buat Shorts/TikTok/Reels, atau waktu user bilang "tambahin musik", "clip pake sound", "lagu asli game", "musiknya nggak kedengeran", "video bisu". Berisi aturan level (voice-first vs music-first), perintah ffmpeg buat mix + verifikasi, dan checklist supaya musiknya benar-benar terdengar. Selalu pakai skill ini sebelum kirim video bermusik ke user, bukan sesudah user komplain.
---

# Clip Sound Design — klip pendek pakai musik/suara

Adaptasi dari OpenMontage `sound-design.md` (sumber: W3C, BBC, spek YouTube/TikTok)
+ pelajaran nyata 20 Nov 2026 (gta6-clipper-01: mix pertama terlalu pelan, user
bilang "ga ada musicnya", video bisu di pemutar chat HP).

## 0. Tentukan mode dulu — ini yang paling sering salah

Ada dua mode. Salah pilih mode = musik tidak terdengar atau dialog ketutup.

| | voice-first | music-first |
|---|---|---|
| Kapan | Ada narasi/voiceover/dialog yang harus jelas | User mau LAGUNYA kedengeran (klip game, montase, aksi) |
| Yang utama | Suara/narasi | Musik |
| Musik | 18–20 dB DI BAWAH dialog (aturan W3C/BBC) | Setara atau LEBIH KERAS dari suara game |
| Target mix | −14 LUFS, dialog −16 s/d −14 LUFS | −14 s/d −12 LUFS (konten gaming), mean ≈ −15 dB |

**Kesalahan 20 Nov 2026:** aturan voice-first (musik −28 dB, 6 dB di bawah suara game)
dipakai ke klip game yang user-nya mau lagunya kedengeran → musik hilang total.
Kalau user bilang "lagunya kedengeran" / "pake lagu asli game" → itu music-first.
Jangan pakai angka voice-first di klip music-first.

## 1. Target angka (Shorts / TikTok / Reels)

- Loudness akhir: **−14 LUFS** (Shorts, TikTok, Reels, YouTube). Gaming: −14 s/d −12 LUFS.
- True peak: jangan lewat **−1,5 dBTP** (praktis: max volume di bawah 0 dBFS).
- Format kirim: **AAC LC, 48 kHz, stereo, bitrate ≥192 kbps**.
- Video stream jangan di-encode ulang (`-c:v copy`) — hanya audio yang di-mix.
- Headroom: sisakan minimal −6 dB di mix akhir sebelum limiter.

## 2. Pilih musik yang cocok sama adegan

- Cocokkan mood/energi dengan adegan, bukan asal lagu yang terkenal.
- BPM kasar (OpenMontage): tenang 60–80, standar 90–110, upbeat 120–140,
  aksi/cepat **140–200**.
- Kalau ada narasi/voiceover: pakai trek **instrumental** — lirik berebut sama suara.
- Pilih trek yang levelnya rata (hindari crescendo/d Beat drop mendadak).
- **Copyright:** musik berlisensi (termasuk score game) bisa kena klaim Content ID
  di YouTube — klaim itu bukan strike, video tetap tayang dan views tetap dihitung,
  tapi pendapatan iklan bisa dialihkan ke pemegang hak. Sampaikan ini ke user apa adanya.
  Jangan pakai musik klaim di Shorts lebih dari 60 detik (Shorts >60 dtk dengan klaim
  aktif bisa diblokir).

## 3. Mix dengan ffmpeg

Ukuran dulu level kedua sumber sebelum mix (jangan tebak):

```bash
ffmpeg -v info -i clip.mp4 -af volumedetect -f null - 2>&1 | grep -E "mean_volume|max_volume"
ffmpeg -v info -i musik.m4a -af volumedetect -f null - 2>&1 | grep -E "mean_volume|max_volume"
```

### Music-first (musik harus kedengeran)

```bash
ffmpeg -y -v error -i clip.mp4 -i musik.m4a -filter_complex \
"[0:a]aformat=sample_fmts=fltp:channel_layouts=stereo[game]; \
 [1:a]aformat=sample_fmts=fltp:channel_layouts=stereo,volume=1.3,afade=t=in:st=0:d=1.5,afade=t=out:st=26.97:d=3[music]; \
 [game][music]amix=inputs=2:normalize=0,alimiter=limit=0.9[aout]" \
-map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k -shortest hasil-musik.mp4
```

- `volume=1.3` = gain musik supaya mean-nya ≈ −16 dB (musik mentah −18,3 dB → −16 dB).
  Kalau musik mentahnya lebih pelan, naikkan gain sampai mean musik di mix ≈ −16 dB.
- `afade=t=out:st=<durasi-3>:d=3` = fade-out 3 detik terakhir (di bawah kartu pitch).
  Sesuaikan `st` dengan durasi klip (durasi − 3).
- `alimiter=limit=0.9` = pengaman clipping. Jangan pernah kirim mix yang max-nya 0 dBFS.

### Voice-first (ada narasi — ducking)

- Musik −18 s/d −20 dB di bawah narasi saat orang bicara; naik lagi di jeda.
- Trik EQ: potong 2–4 kHz di musik supaya suara tetap jelas.
- Atur naik 1 dB sekali dari baseline −20 dB sampai pas — jangan lompat besar.

## 4. Verifikasi wajib — JANGAN kirim sebelum semua lolos

### 4a. Level mix (volumedetect)

```bash
ffmpeg -v info -i hasil-musik.mp4 -af volumedetect -f null - 2>&1 | grep -E "mean_volume|max_volume"
```

- Music-first: mean mix harus ≈ **−15 dB** dan **≥ +5 dB** lebih keras dari game saja.
  Contoh benar: game saja −22,5 dB → mix −14,9 dB (selisih +7,6 dB).
  Kalau selisih cuma +1–2 dB → musik ketutup, naikkan gain dan mix ulang.
- Max volume harus **< 0 dBFS** (tidak clipping). Contoh benar: −0,2 dB.

### 4b. Tes pisah (WAJIB — ini yang membuktikan musiknya ada)

Kurangi audio asli dari mix; sisanya = musik. Sisa harus KERAS:

```bash
ffmpeg -y -v error -i hasil-musik.mp4 -i clip.mp4 -filter_complex \
"[1:a]volume=-1[neg];[0:a][neg]amix=inputs=2:normalize=0[diff]" \
-map "[diff]" -c:a pcm_s16le /tmp/tes-pisah.wav
ffmpeg -v info -i /tmp/tes-pisah.wav -af volumedetect -f null - 2>&1 | grep -E "mean_volume|max_volume"
```

- Lolos kalau sisa musik mean **≥ −16 dB**. Contoh benar: −14,2 dB.
- Kalau sisa pelan/sunyi → mix gagal, JANGAN kirim. Angka volumedetect saja
  TIDAK cukup — tes pisah yang menentukan.

### 4c. Spektrogram

```bash
ffmpeg -y -v error -i hasil-musik.mp4 -lavfi showspectrumpic=s=1080x400:legend=0 -frames:v 1 /tmp/spec.png
```

- Harus ada pita energi musik yang sustained sepanjang klip + mengecil di fade-out.
- Bandingkan dengan spektrogram klip tanpa musik: bedanya harus jelas.

### 4d. Video + format

- Durasi output sama dengan aslinya (±0,1 dtk).
- Cek 1 frame: gambar harus identik dengan aslinya (`-c:v copy`).
- Decode penuh tanpa error: `ffmpeg -v error -i hasil-musik.mp4 -map 0:a -f null -`
  harus selesai tanpa pesan error.
- Catat kalau durasi audio < durasi video (mis. audio 27 dtk, video 30 dtk —
  3 dtk akhir kartu pitch memang tanpa suara) dan sampaikan ke user.

## 5. Kirim ke user

- Kirim **SATU** file final dengan nama yang jelas dan beda dari file lain
  (mis. `latihan-v3-musik.mp4`). Jangan kirim banyak versi mirip
  (`clip.mp4`, `clip-v3-music.mp4`, `clip-v3-music-loud.mp4`) — user ketukar
  dan membuka file lama.
- **Ingatkan duluan soal pemutar chat yang bisu:** video di chat mulai dalam
  keadaan bisu, jadi user harus ketuk ikon speaker atau buka di Galeri HP.
  Sampaikan ini SEBELUM user komplain "bisu".
- Jangan berdebat "file-nya benar" kalau user bilang tidak ada suara — user yang
  nonton yang menentukan. Cek ulang dengan tes pisah, lalu pandu user buka di Galeri.

## 6. Troubleshooting

| Gejala | Penyebab paling mungkin | Perbaiki |
|---|---|---|
| Musik tidak terdengar | Gain musik terlalu pelan (mode salah) | Naikkan gain, ulangi §3–§4 |
| Suara pecah/clipping | Max ≥ 0 dBFS | Turunkan gain musik, pastikan limiter 0,9 |
| Bisu total di HP user | Pemutar chat mulai bisu / volume media 0 | Bukan salah file: pandu buka di Galeri, ketuk speaker |
| Audio lebih pendek dari video | Trek audio asli memang pendek | Sampaikan ke user, bukan error |
| Klaim Content ID | Musik berlisensi | Bukan strike; sampaikan apa adanya, tawarkan versi tanpa musik |

## Sumber

- OpenMontage `sound-design.md` (github.com/OpenMontageInc/OpenMontage) —
  sumber: W3C, BBC, spek YouTube/TikTok, Sweetwater, ElevenLabs.
  Copy review ada di `~/workspace/skill-review/openmontage-sound-design/`
  (scan SkillSpector 20 Nov 2026: skor 0, 0 temuan, verdict AMAN).
- Pelajaran lokal 20 Nov 2026: `~/workspace/makefun/gta6-clipper-01/LATIHAN-MUSIK-CHECKLIST.md`
- File latihan terverifikasi: `latihan-v3-musik.mp4` (mean −14,9 dB, tes pisah −14,2 dB).
