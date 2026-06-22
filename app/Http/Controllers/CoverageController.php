<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Coverage;

class CoverageController extends Controller
{
    /**
     * Display a listing of coverages.
     */
    public function index()
    {
        $coverages = Coverage::all();
        return response()->json($coverages);
    }

    /**
     * Store a newly created coverage.
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'provinsi' => 'required|string|max:100',
            'kabupaten' => 'required|string|max:100',
            'kecamatan' => 'required|string|max:100',
            'status' => 'required|in:Tersedia,Belum Tersedia',
        ]);

        $provinsi = $request->input('provinsi');
        $kabupaten = $request->input('kabupaten');
        $kecamatan = $request->input('kecamatan');
        $status = $request->input('status');

        $latitude = $request->input('latitude');
        $longitude = $request->input('longitude');

        if ($latitude !== '' && $latitude !== null && !is_numeric($latitude)) {
            return response()->json(['message' => 'Latitude harus berupa angka'], 422);
        }
        if ($longitude !== '' && $longitude !== null && !is_numeric($longitude)) {
            return response()->json(['message' => 'Longitude harus berupa angka'], 422);
        }

        $coverage = new Coverage([
            'provinsi' => $provinsi,
            'kabupaten' => $kabupaten,
            'kecamatan' => $kecamatan,
            'status' => $status,
        ]);

        if ($latitude !== '' && $latitude !== null && $longitude !== '' && $longitude !== null) {
            $coverage->latitude = (double) $latitude;
            $coverage->longitude = (double) $longitude;
            $coverage->geojson = null;
        } else {
            // Fetch coordinates and boundary geojson from OpenStreetMap Nominatim
            $osmData = $this->fetchOsmBoundary($provinsi, $kabupaten, $kecamatan);
            if ($osmData) {
                $coverage->latitude = $osmData['lat'];
                $coverage->longitude = $osmData['lon'];
                $coverage->geojson = $osmData['geojson'];
            }
        }

        $coverage->save();

        return response()->json([
            'message' => 'Wilayah coverage berhasil ditambahkan',
            'coverage' => $coverage
        ], 201);
    }

    /**
     * Display the specified coverage.
     */
    public function show($id)
    {
        $coverage = Coverage::find($id);

        if (!$coverage) {
            return response()->json(['message' => 'Wilayah tidak ditemukan'], 404);
        }

        return response()->json($coverage);
    }

    /**
     * Update the specified coverage.
     */
    public function update(Request $request, $id)
    {
        $coverage = Coverage::find($id);

        if (!$coverage) {
            return response()->json(['message' => 'Wilayah tidak ditemukan'], 404);
        }

        $this->validate($request, [
            'provinsi' => 'required|string|max:100',
            'kabupaten' => 'required|string|max:100',
            'kecamatan' => 'required|string|max:100',
            'status' => 'required|in:Tersedia,Belum Tersedia',
        ]);

        $provinsi = $request->input('provinsi');
        $kabupaten = $request->input('kabupaten');
        $kecamatan = $request->input('kecamatan');
        $status = $request->input('status');

        $latitude = $request->input('latitude');
        $longitude = $request->input('longitude');

        if ($latitude !== '' && $latitude !== null && !is_numeric($latitude)) {
            return response()->json(['message' => 'Latitude harus berupa angka'], 422);
        }
        if ($longitude !== '' && $longitude !== null && !is_numeric($longitude)) {
            return response()->json(['message' => 'Longitude harus berupa angka'], 422);
        }

        $isLocationChanged = ($coverage->provinsi !== $provinsi || $coverage->kabupaten !== $kabupaten || $coverage->kecamatan !== $kecamatan);

        $coverage->provinsi = $provinsi;
        $coverage->kabupaten = $kabupaten;
        $coverage->kecamatan = $kecamatan;
        $coverage->status = $status;

        if ($latitude !== '' && $latitude !== null && $longitude !== '' && $longitude !== null) {
            $coverage->latitude = (double) $latitude;
            $coverage->longitude = (double) $longitude;
            $coverage->geojson = null;
        } else if ($isLocationChanged) {
            // Re-fetch coordinates and geojson
            $osmData = $this->fetchOsmBoundary($provinsi, $kabupaten, $kecamatan);
            if ($osmData) {
                $coverage->latitude = $osmData['lat'];
                $coverage->longitude = $osmData['lon'];
                $coverage->geojson = $osmData['geojson'];
            } else {
                $coverage->latitude = null;
                $coverage->longitude = null;
                $coverage->geojson = null;
            }
        }

        $coverage->save();

        return response()->json([
            'message' => 'Wilayah coverage berhasil diupdate',
            'coverage' => $coverage
        ]);
    }

    /**
     * Remove the specified coverage.
     */
    public function destroy($id)
    {
        $coverage = Coverage::find($id);

        if (!$coverage) {
            return response()->json(['message' => 'Wilayah tidak ditemukan'], 404);
        }

        $coverage->delete();

        return response()->json(['message' => 'Wilayah coverage berhasil dihapus']);
    }

    /**
     * Check coverage compatibility for coordinates/names.
     */
    public function check(Request $request)
    {
        $this->validate($request, [
            'kabupaten' => 'required|string',
            'kecamatan' => 'required|string',
        ]);

        $kab = trim($request->input('kabupaten'));
        $kec = trim($request->input('kecamatan'));
        $lat = $request->input('latitude');
        $lon = $request->input('longitude');

        // Normalize keywords
        $kabClean = preg_replace('/^(kabupaten|kota|kab\.|kotamadya)\s+/i', '', $kab);
        $kecClean = preg_replace('/^(kecamatan|kec\.)\s+/i', '', $kec);

        // Database search with fuzzy check
        $coverage = Coverage::where('kabupaten', 'LIKE', '%' . $kabClean . '%')
                            ->where('kecamatan', 'LIKE', '%' . $kecClean . '%')
                            ->first();

        // Spatial fallback if name search fails and coordinates are provided
        if (!$coverage && is_numeric($lat) && is_numeric($lon)) {
            $coverages = Coverage::all();
            $nearest = null;
            $minDistance = 999999;

            foreach ($coverages as $cov) {
                if ($cov->latitude !== null && $cov->longitude !== null) {
                    $dist = sqrt(pow($cov->latitude - $lat, 2) + pow($cov->longitude - $lon, 2));
                    if ($dist < $minDistance) {
                        $minDistance = $dist;
                        $nearest = $cov;
                    }
                }
            }

            // If the closest coverage area center is within 0.15 degrees (~15 km)
            if ($nearest && $minDistance < 0.15) {
                $coverage = $nearest;
            }
        }

        if ($coverage) {
            return response()->json([
                'status' => $coverage->status,
                'coverage' => $coverage,
            ]);
        }

        return response()->json([
            'status' => 'Belum Tersedia',
            'message' => 'Area belum terdaftar dalam jangkauan kami',
        ]);
    }

    /**
     * Fetch boundary coordinates and polygon from OpenStreetMap Nominatim API.
     */
    private function fetchOsmBoundary($provinsi, $kabupaten, $kecamatan)
    {
        // Normalize terms for OSM query
        $query = "Kecamatan " . $kecamatan . ", " . $kabupaten . ", " . $provinsi . ", Indonesia";
        $url = "https://nominatim.openstreetmap.org/search?q=" . urlencode($query) . "&format=json&polygon_geojson=1&limit=1";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        // Nominatim requests require a contact user agent
        curl_setopt($ch, CURLOPT_USERAGENT, 'AndriyanISPCoverageTracker/1.0 (contact: andriyan@example.com)');
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($ch);
        curl_close($ch);

        if ($response) {
            $data = json_decode($response, true);
            if (!empty($data) && isset($data[0])) {
                return [
                    'lat' => (float) $data[0]['lat'],
                    'lon' => (float) $data[0]['lon'],
                    'geojson' => json_encode($data[0]['geojson']),
                ];
            }
        }

        // Simpler fallback (without "Kecamatan" prefix or province details)
        $queryFallback = $kecamatan . ", " . $kabupaten . ", Indonesia";
        $urlFallback = "https://nominatim.openstreetmap.org/search?q=" . urlencode($queryFallback) . "&format=json&polygon_geojson=1&limit=1";

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $urlFallback);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_USERAGENT, 'AndriyanISPCoverageTracker/1.0 (contact: andriyan@example.com)');
        curl_setopt($ch, CURLOPT_TIMEOUT, 15);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        
        $response = curl_exec($ch);
        curl_close($ch);

        if ($response) {
            $data = json_decode($response, true);
            if (!empty($data) && isset($data[0])) {
                return [
                    'lat' => (float) $data[0]['lat'],
                    'lon' => (float) $data[0]['lon'],
                    'geojson' => json_encode($data[0]['geojson']),
                ];
            }
        }

        return null;
    }
}
