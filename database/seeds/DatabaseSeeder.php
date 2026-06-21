<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        // 1. Seed Admin
        DB::table('admins')->truncate();
        DB::table('admins')->insert([
            'id' => 1,
            'username' => 'admin',
            // MD5 of admin123 is 0192023a7bbd73250516f069df18b500
            'password' => '0192023a7bbd73250516f069df18b500',
            'created_at' => date('Y-m-d H:i:s'),
            'updated_at' => date('Y-m-d H:i:s'),
        ]);

        // 2. Seed Products (Produk)
        DB::table('products')->truncate();
        DB::table('products')->insert([
            [
                'id' => 1,
                'nama_paket' => 'Value 30',
                'kecepatan' => '30 Mbps',
                'harga' => 329000,
                'deskripsi' => 'Cocok untuk browsing, streaming HD dan sosial media',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'id' => 2,
                'nama_paket' => 'Fast 50',
                'kecepatan' => '50 Mbps',
                'harga' => 389000,
                'deskripsi' => 'Ideal untuk streaming 4K dan work from home',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'id' => 3,
                'nama_paket' => 'Nova 100',
                'kecepatan' => '100 Mbps',
                'harga' => 479000,
                'deskripsi' => 'Gaming online tanpa lag dan streaming ultra HD',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'id' => 4,
                'nama_paket' => 'Gamer 150',
                'kecepatan' => '150 Mbps',
                'harga' => 599000,
                'deskripsi' => 'Dirancang khusus untuk gamer dan heavy user',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'id' => 5,
                'nama_paket' => 'Supreme 300',
                'kecepatan' => '300 Mbps',
                'harga' => 899000,
                'deskripsi' => 'Kecepatan tinggi untuk keluarga besar dan smart home',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]
        ]);

        // 3. Seed Coverage Area
        DB::table('coverages')->truncate();
        
        $coverages = [
            ['kabupaten' => 'Bandar Lampung', 'kecamatan' => 'Bumi Waras', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Bandar Lampung', 'kecamatan' => 'Enggal', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Bandar Lampung', 'kecamatan' => 'Kedamaian', 'status' => 'Tersedia'],
            ['kabupaten' => 'Bandar Lampung', 'kecamatan' => 'Kemiling', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Bandar Lampung', 'kecamatan' => 'Labuhan Ratu', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Bandar Lampung', 'kecamatan' => 'Langkapura', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Bandar Lampung', 'kecamatan' => 'Panjang', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Bandar Lampung', 'kecamatan' => 'Rajabasa', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Bandar Lampung', 'kecamatan' => 'Sukabumi', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Bandar Lampung', 'kecamatan' => 'Sukarame', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Bandar Lampung', 'kecamatan' => 'Tanjung Karang Barat', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Bandar Lampung', 'kecamatan' => 'Tanjung Karang Pusat', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Bandar Lampung', 'kecamatan' => 'Tanjung Karang Timur', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Bandar Lampung', 'kecamatan' => 'Teluk Betung Barat', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Bandar Lampung', 'kecamatan' => 'Teluk Betung Selatan', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Bandar Lampung', 'kecamatan' => 'Teluk Betung Timur', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Bandar Lampung', 'kecamatan' => 'Teluk Betung Utara', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Bandar Lampung', 'kecamatan' => 'Way Halim', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Bandar Lampung', 'kecamatan' => 'Sukabumi Indah', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Bandar Lampung', 'kecamatan' => 'Labuhan Ratu Raya', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Metro', 'kecamatan' => 'Metro Pusat', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Metro', 'kecamatan' => 'Metro Barat', 'status' => 'Tersedia'],
            ['kabupaten' => 'Metro', 'kecamatan' => 'Metro Timur', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Metro', 'kecamatan' => 'Metro Selatan', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Metro', 'kecamatan' => 'Metro Utara', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Terbanggi Besar', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Gunung Sugih', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Seputih Agung', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Seputih Banyak', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Seputih Raman', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Seputih Surabaya', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Trimurjo', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Bangunrejo', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Kalirejo', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Padang Ratu', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Pubian', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Selagai Lingga', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Sendang Agung', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Terusan Nunyai', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Anak Tuha', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Bandar Mataram', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Bandar Surabaya', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Bekri', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Bumi Ratu Nuban', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Putra Rumbia', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Rumbia', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Tengah', 'kecamatan' => 'Way Pengubuan', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Selatan', 'kecamatan' => 'Kalianda', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Selatan', 'kecamatan' => 'Natar', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Selatan', 'kecamatan' => 'Jati Agung', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Selatan', 'kecamatan' => 'Tanjung Bintang', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Selatan', 'kecamatan' => 'Katibung', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Selatan', 'kecamatan' => 'Palas', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Selatan', 'kecamatan' => 'Penengahan', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Selatan', 'kecamatan' => 'Rajabasa', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Selatan', 'kecamatan' => 'Sidomulyo', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Selatan', 'kecamatan' => 'Sragi', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Selatan', 'kecamatan' => 'Way Panji', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Selatan', 'kecamatan' => 'Way Sulan', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Timur', 'kecamatan' => 'Sukadana', 'status' => 'Tersedia'],
            ['kabupaten' => 'Lampung Timur', 'kecamatan' => 'Way Jepara', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Timur', 'kecamatan' => 'Batanghari', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Timur', 'kecamatan' => 'Sekampung', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Timur', 'kecamatan' => 'Labuhan Maringgai', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Timur', 'kecamatan' => 'Pasir Sakti', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Timur', 'kecamatan' => 'Raman Utara', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Timur', 'kecamatan' => 'Waway Karya', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Timur', 'kecamatan' => 'Marga Tiga', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Timur', 'kecamatan' => 'Melinting', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Utara', 'kecamatan' => 'Kotabumi', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Utara', 'kecamatan' => 'Abung Selatan', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Utara', 'kecamatan' => 'Abung Timur', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Utara', 'kecamatan' => 'Abung Barat', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Utara', 'kecamatan' => 'Bukit Kemuning', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Utara', 'kecamatan' => 'Sungkai Selatan', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Utara', 'kecamatan' => 'Sungkai Utara', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Utara', 'kecamatan' => 'Muara Sungkai', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Pesawaran', 'kecamatan' => 'Gedong Tataan', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Pesawaran', 'kecamatan' => 'Negeri Katon', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Pesawaran', 'kecamatan' => 'Tegineneng', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Pesawaran', 'kecamatan' => 'Way Lima', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Pesawaran', 'kecamatan' => 'Padang Cermin', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Pringsewu', 'kecamatan' => 'Pringsewu', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Pringsewu', 'kecamatan' => 'Gading Rejo', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Pringsewu', 'kecamatan' => 'Pagelaran', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Pringsewu', 'kecamatan' => 'Sukoharjo', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Pringsewu', 'kecamatan' => 'Banyumas', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Tulang Bawang', 'kecamatan' => 'Menggala', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Tulang Bawang', 'kecamatan' => 'Banjar Agung', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Tulang Bawang', 'kecamatan' => 'Banjar Baru', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Tulang Bawang', 'kecamatan' => 'Gedung Aji', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Tulang Bawang', 'kecamatan' => 'Penawar Tama', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Way Kanan', 'kecamatan' => 'Blambangan Umpu', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Way Kanan', 'kecamatan' => 'Baradatu', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Way Kanan', 'kecamatan' => 'Kasui', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Way Kanan', 'kecamatan' => 'Rebang Tangkas', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Way Kanan', 'kecamatan' => 'Gunung Labuhan', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Mesuji', 'kecamatan' => 'Mesuji', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Mesuji', 'kecamatan' => 'Simpang Pematang', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Mesuji', 'kecamatan' => 'Tanjung Raya', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Pesisir Barat', 'kecamatan' => 'Krui', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Pesisir Barat', 'kecamatan' => 'Pesisir Tengah', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Pesisir Barat', 'kecamatan' => 'Pesisir Selatan', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Barat', 'kecamatan' => 'Liwa', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Barat', 'kecamatan' => 'Balik Bukit', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Lampung Barat', 'kecamatan' => 'Sumber Jaya', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Tanggamus', 'kecamatan' => 'Kota Agung', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Tanggamus', 'kecamatan' => 'Gisting', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Tanggamus', 'kecamatan' => 'Talang Padang', 'status' => 'Belum Tersedia'],
            ['kabupaten' => 'Tanggamus', 'kecamatan' => 'Pulau Panggung', 'status' => 'Belum Tersedia']
        ];

        foreach ($coverages as $item) {
            DB::table('coverages')->insert([
                'provinsi' => 'Lampung',
                'kabupaten' => $item['kabupaten'],
                'kecamatan' => $item['kecamatan'],
                'status' => $item['status'],
                // Set default coordinates for standard Lampung locations if known, or resolve dynamically.
                // For the seeder, we can leave coordinates null, and they will be fetched when edited or loaded.
                // We'll set a standard latitude/longitude for known areas to make the initial map look good.
                'latitude' => null,
                'longitude' => null,
                'geojson' => null,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
        }
    }
}
