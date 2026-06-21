<?php

use Illuminate\Database\Seeder;
use App\Coverage;

class GeoreferenceSeeder extends Seeder
{
    public function run()
    {
        $coordinates = [
            'Bandar Lampung' => ['lat' => -5.3971, 'lon' => 105.2668],
            'Metro' => ['lat' => -5.1121, 'lon' => 105.3068],
            'Lampung Timur' => ['lat' => -5.0487, 'lon' => 105.5492],
            'Lampung Tengah' => ['lat' => -4.8690, 'lon' => 105.2014],
            'Lampung Selatan' => ['lat' => -5.7130, 'lon' => 105.5908],
            'Lampung Utara' => ['lat' => -4.8239, 'lon' => 104.8872],
            'Tanggamus' => ['lat' => -5.4988, 'lon' => 104.6226],
            'Pesawaran' => ['lat' => -5.3900, 'lon' => 105.1054],
            'Pringsewu' => ['lat' => -5.3524, 'lon' => 104.9744],
            'Tulang Bawang' => ['lat' => -4.4628, 'lon' => 105.2635],
            'Way Kanan' => ['lat' => -4.4379, 'lon' => 104.5303],
            'Mesuji' => ['lat' => -3.9859, 'lon' => 105.4190],
            'Pesisir Barat' => ['lat' => -5.1919, 'lon' => 103.9422],
            'Lampung Barat' => ['lat' => -5.0116, 'lon' => 104.0934]
        ];

        $coverages = Coverage::all();

        foreach ($coverages as $cov) {
            $kab = $cov->kabupaten;
            
            if (isset($coordinates[$kab])) {
                // Add slight random offset to prevent markers from stacking on top of each other
                // This is a premium touch for rendering multiple kecamatan within the same kabupaten!
                $offsetLat = (mt_rand(-100, 100) / 5000.0);
                $offsetLon = (mt_rand(-100, 100) / 5000.0);
                
                $cov->latitude = $coordinates[$kab]['lat'] + $offsetLat;
                $cov->longitude = $coordinates[$kab]['lon'] + $offsetLon;
                $cov->save();
            }
        }

        echo "Statically georeferenced all coverages in database successfully!\n";
    }
}
