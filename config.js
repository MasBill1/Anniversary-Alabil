/* ================= EDIT DI SINI ================= */
const CONFIG = {
  me: "Billie",
  her: "Wulan Nurita",
  startDate: "2025-11-07T00:00:00",   // tanggal jadian
  music: "",                          // kosongkan = otomatis cari lagu.mp3 / musik.mp3 (juga .m4a .wav .ogg) di folder yang sama. Atau isi nama file sendiri.
  timeline: [
    { when: "Awal bertemu", title: "Pertama kali kenal", text: "Aku pertama kali kenal kamu tu, kamu orang nya cuek banget tapi untung aku orang nya gak gampang menyerah jadi aku chat terus sampe kamu mau ngobrol sama dan akhir nya kita bisa jalan ke coffe kucing." },
    { when: "Hari jadian",  title: "Hari kita mulai",    text: "Aku masih inget banget kita jadian di malam kita pertama kali jalan, dan kita ke coffe kucing, ada kejadian lucu juga waktu kita jadian kalo di inget inget selalu bikin aku ketawa, tapi itu tetep jadi kebiasaan mu sampe sekarang. Yaitu Kesandung" },
    { when: "Favorit",      title: "Momen paling seru",  text: "Aku gak bisa ngasih tau kamu apa kenangan paling berkesan dari kita berdua, karena kamu masih mau nemenin aku di kondisi seperti ini aja aku udah seneng banget dan akan jadi kenengan terindah sepanjang hidup ku" },
    { when: "Hari ini",     title: "Satu tahun bersama", text: "Di Anniversary 1 Tahun ini aku cuma pengen ngucapin terima kasih yang banyak ke kamu, aku gak tau lagi harus ngomong apa ke kamu, karena di hari dimana kita harus nya bisa seneng seneng jalan jalan, aku gak bisa ngasih itu semua, aku tau itu semua salah ku dan itu juga yang buat aku sedih sampe aku ngetik, jadi aku bakal selalu sayang ke kamu dan cinta terus ke kamu. I LOVE YOU SAYANGGGGG" }
  ],
  reasons: [
    "Kamu selalu bikin aku ketawa, bahkan di hari terburukku",
    "Kamu sabar banget sama aku",
    "Bareng kamu, semuanya terasa seperti pulang",
    "Kamu apa adanya, dan itu cukup buat aku",
    "Kamu alasan aku mau jadi lebih baik"
  ],
  // Foto/video: kosongkan = otomatis ambil foto1.jpg, foto2.jpg, foto3.mp4 ... (atau 1.jpg, 2.jpg ...) dari folder yang sama, berurutan.
  // Caption opsional, sesuai urutan file:
  captions: [],   // contoh: ["Pertama jalan bareng", "Liburan", "Hari itu"]
  // Atau tulis manual (kalau diisi, deteksi otomatis tidak dipakai):
  media: [
    // { type: "image", src: "foto1.jpg", caption: "Pertama jalan bareng" },
    // { type: "video", src: "video1.mp4", caption: "Hari itu" },
  ],
  letter: "Sayang,\n\n1 Tahun Kita udah sama sama & 1 Tahun Juga kita udah lewatin semua nya, mulai dari susah dan seneng nya di hubungan ini, lewat surat kecil ini aku cuma ngomong Terima kasih yang banyak ke kamu udah mau nerima aku yang apa ada nya seperti ini tanpa nuntut aku ini itu, aku juga mau minta maaf buat masalah yang udah aku lakuin kemarin kemarin itu, lewat surat ini juga aku mau nyampein rasa sesal ku udah bikin kamu nangis berkali kali sama kelakuan sendiri aku janji gak akan ada lagi masalah seperti kemarin, kita harus bikin hubungan yang sehat dan bahagia terus\n\nTerima kasih sudah sabar, sudah ada, dan sudah jadi rumah buat aku.\n\nAku sayang kamu, hari ini dan seterusnya.\n\n— Billie",
  perPhoto: 2600,    // lama tiap foto/video tampil (ms)
  perReason: 2500,   // lama tiap alasan tampil (ms)
  endHold: 9000      // lama adegan penutup (ms)
};
/* ================================================ */
