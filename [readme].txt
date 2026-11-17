- Tema : Estimasi pengeluaran data liburan 
(berdasarkan data tempat wisata, promo voucher dan data harga sewa mobil)

- tampilkan daftar tempat wisata dinamis sesuai data dalam array, 
- sort tmpat wisata( A - Z, berdasarkan lowest 14days price, highest 14days price, lowest 28 days price, highest 28 days price) 
- filter tmpat wisata ( berdasarkan Benua, Asia, Africa, Eropa, America, Australia )
- search tempat wisata
- terdapat Preview Gambar dan detil Tempat Wisata sesuai yang di click user 
- tampilkan daftar mobil dinamis sesuai data dalam array, 
- fitur sort mobil  berdasarkan A - Z , Tahun tua -> Muda, tahun muda -> tua , lowest price, highest price,  
- fitur search nama mobil, 
- fitur filter mobil, (Berdasarkan Brand : Toyota, mitsibishi, honda )
- terdapat Preview Gambar Mobil sesuai yang di click user


- Menggabungkan kedua data dalam satu fitur keranjang (Booking Cart), di mana pengguna memilih satu destinasi (14 atau 28 hari) 
lalu memilih mobil pendamping yang harganya dikalikan dengan jumlah hari sewa untuk mendapatkan total estimasi anggaran liburan

- Saat pengguna memilih destinasi wisata di benua atau negara tertentu, 
halaman pemesanan otomatis hanya menampilkan daftar mobil yang beroperasi di wilayah tersebut.

- pengguna memasukkan jumlah anggota keluarga yang ikut berlibur, 
dan otomatis menyaring mobil yang muat (misal: Brio untuk 4 orang, Avanza/Innova untuk 7 orang, 
atau Hiace untuk rombongan >10 orang)

- pengguna dapat menggunakan voucher promo yang berlaku untuk setiap mobil dan/atau tempat wisata yang dipilih

keterangan kondisi (conditions) pada promos.json:
minTransaction: Syarat minimum total belanja (gabungan harga destinasi dan sewa mobil) agar voucher dapat digunakan.
targetContinent: Mengecek apakah destination.continent termasuk di dalam array ini. Jika null, berlaku untuk semua benua.
targetCarBrand: Mengecek apakah car.Brand termasuk di dalam array ini.
minCarCapacity: Mengecek apakah car.capacity lebih besar atau sama dengan nilai angka ini.
requiredDuration: Mengecek apakah pengguna memilih "days14" atau "days28" pada destination.price.
requiredCarService: Mengecek apakah pengguna memilih opsi "single" (lepas kunci) atau "driver" (dengan sopir) pada car.Price.
requireBundling: Jika bernilai true, pengguna wajib memilih destinasi sekaligus mobil agar kode promo valid


- Styling halaman web menggunakan tailwind
- Tulis kode secara modular (Modules)
- Handle semua proses async dengan baik serta lakukan validasi dan 
			error handling pada setiap proses async (try/catch)

		
- ada fitur utk memasukkan kombinasi item liburan yang diinginkan ke keranjang dan disimpan pada local storage
dan cek/ambil data pada localstorage setiap halaman dibuka/kembali

