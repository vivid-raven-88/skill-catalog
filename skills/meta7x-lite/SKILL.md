---
name: meta7x-lite
description: Pola kerja aman yang diadaptasi dari meta7x (r17x): batas input antar-tahap, review adversarial, pelacakan gap eksplisit, state terverifikasi untuk pekerjaan panjang, dan checklist gate 5 dimensi. Dipakai untuk pekerjaan bertahap yang besar (riset → desain → implementasi, audit, ronde bounty). Bukan meta7x itu sendiri.
---

# Meta7x Lite

Adaptasi aman dari pola-pola meta7x (gist r17x, studi lengkap di `~/workspace/notes/meta7x-study.md`). Yang diambil hanya pola yang tidak bentrok dengan aturan workspace ini. **On-Chain Safety Rails di `~/AGENTS.md` selalu menang.** Skill ini tidak pernah menghapus kewajiban konfirmasi pengguna, tidak pernah mengabaikan perintah berhenti/batal dari pengguna, dan tidak pernah me-retry transaksi secara otomatis.

## Kapan dipakai

Pekerjaan bertahap yang besar, di mana satu tahap bisa mengotori tahap berikutnya, atau pekerjaan yang melewati beberapa sesi:

- Riset → desain → implementasi (misalnya membangun tool, audit kontrak, sistem baru).
- Audit atau perburuan ber-ronde (misalnya ronde bounty XE).
- Pekerjaan panjang yang harus bisa dilanjutkan persis dari titik terakhir.

Untuk tugas pendek satu langkah, skill ini tidak perlu — langsung kerjakan saja.

## Pola 1 — Batas input antar-tahap

Setiap tahap hanya boleh membaca **output tahap sebelumnya yang sudah terverifikasi**, bukan data mentah.

- Tahap riset boleh membaca sumber mentah (halaman, repo, postingan).
- Tahap analisis/desain hanya membaca ringkasan riset yang sudah dicek, bukan sumber mentah.
- Tahap eksekusi hanya membaca hasil analisis, bukan klaim promosi.

Contoh yang sudah berlaku di sini: analis mint hanya percaya data on-chain (harga `getPublicDrop`, `totalSupply`), bukan angka di halaman koleksi atau screenshot. Kalau sebuah kesimpulan bersandar pada sumber yang belum terverifikasi, kesimpulan itu dicatat sebagai UNVERIFIED, bukan fakta.

## Pola 2 — Review adversarial

Tugaskan satu peran penantang (bisa diri sendiri di giliran terpisah, atau subagent) yang tugasnya **membantah klaim**, bukan mengiyakan.

- Inventarisasi setiap klaim faktual dari tahap sebelumnya.
- Klasifikasikan: VERIFIED (ada bukti + sumber) / UNVERIFIED (belum ada bukti) / DISPUTED (ada bukti yang berlawanan, sertakan koreksi + sumber).
- Satu klaim yang salah pada pertanyaan yang menentukan = temuan itu gugur (prinsip yang sama dengan 7-Question Gate di skill `xe_bounty_reporting`).

Contoh yang sudah berlaku di sini: F-10 gugur setelah dicek silang (`finalized: false`, bukan di canonical chain) — klaim "dana hilang" tidak bertahan.

## Pola 3 — Pelacakan gap eksplisit

Setiap pertanyaan terbuka menjadi **gap yang tercatat**, bukan hilang diam-diam.

- Tiap gap dicatat dengan: apa yang belum diketahui, kenapa penting, dan siapa/apa yang menanganinya.
- Pekerjaan belum "selesai" selama masih ada gap yang belum tercatat.
- Gap boleh ditutup dengan dua cara saja: ditangani (ada jawaban + bukti), atau ditunda secara eksplisit dengan alasan yang ditulis.

## Pola 4 — State terverifikasi untuk pekerjaan panjang

Untuk pekerjaan multi-sesi, tulis progres ke **state file** setelah setiap langkah: apa yang selesai, apa yang tertunda, apa yang terverifikasi. Sebelum mengklaim "sudah selesai" atau "sudah dijadwalkan", **baca kembali state-nya dan verifikasi**.

Pelajaran nyata: pengingat mint 13 Nov 2026 sempat hilang dari sistem (item + 7 cron lenyap tanpa jejak) dan baru ketahuan saat dicek manual. State yang tidak pernah diverifikasi sama dengan tidak ada state.

Bentuk state-nya sederhana saja (JSON/Markdown di workspace) — tidak perlu format FBP DSL ala meta7x.

## Pola 5 — Checklist gate 5 dimensi (untuk implementasi kode)

Sebelum menyelesaikan pekerjaan implementasi, lewati lima pemeriksaan ringan ini — sebagai checklist, bukan lima agen paralel:

1. **Perf** — ukuran, waktu compile/eksekusi, resource yang dipakai masuk akal?
2. **Behavior** — test lolos, tidak ada stub, tidak ada TODO/FIXME, tidak ada kode mati?
3. **Run** — program benar-benar dijalankan (bukan cuma dibaca): `--help` jalan, error path diuji, shutdown bersih?
4. **Security** — tidak ada secret di log/kode, tidak ada injeksi, dependensi tidak bermasalah?
5. **Docs** — dokumentasi akurat dan tidak membocorkan proses internal (tidak menyebut wave/agen/subagent)?

Satu saja gagal = pekerjaan belum selesai. Perbaiki dulu, baru lanjut.

## Pola 6 — Filosofi kode & tes

- **Tanpa beban mati:** tanpa stub, tanpa TODO/FIXME/HACK, tanpa komentar naratif ("apa yang dilakukan kode"), tanpa import/field tak terpakai. Nama harus cukup presisi sehingga pembaca tak butuh komentar.
- **Tes dengan membalik kontrak domain:** uji bukan dengan membuktikan invarian berlaku saat semua benar, melainkan dengan membuktikan ia **gagal** saat prasyarat dilanggar — termasuk oleh input adversarial.
- Prioritas tes: behavioral → critical → core. Tidak ada test tanpa konten perilaku.

## Guardrail — yang tidak pernah dilakukan skill ini

- Konfirmasi eksplisit pengguna tetap wajib sebelum tindakan yang berakibat (mint, transaksi, penghapusan, commit, pengiriman). Tidak ada eksekusi tanpa preview + konfirmasi.
- Perintah berhenti/batal dari pengguna dipatuhi segera, kapan saja.
- Gagal = berhenti dan laporkan (fail-closed). Tidak ada retry otomatis atas broadcast/transaksi, tidak ada commit otomatis.
- Tidak ada biaya tanpa persetujuan pengguna (preferensi gratis tetap berlaku).
- Balasan ke pengguna tetap bahasa Indonesia.

## Kriteria selesai

Pekerjaan selesai ketika: semua tahap lolos gate-nya, semua gap sudah ditangani atau ditunda secara eksplisit, dan state file cocok dengan kenyataan (terverifikasi dengan dibaca ulang, bukan diingat-ingat).
