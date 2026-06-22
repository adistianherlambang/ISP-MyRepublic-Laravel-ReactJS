<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Registration;

class RegistrationController extends Controller
{
    /**
     * Display a listing of registrations (admin only).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Registration::query()->with('product');

        // Optional status filter
        if ($request->has('status') && $request->input('status') !== '') {
            $query->where('status', $request->input('status'));
        }

        // Order by newest first
        $registrations = $query->orderBy('created_at', 'desc')->get();

        return response()->json($registrations);
    }

    /**
     * Store a new registration from a potential customer (public).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'nama'       => 'required|string|max:100',
            'telepon'    => 'required|string|max:20',
            'alamat'     => 'required|string',
            'kabupaten'  => 'required|string|max:100',
            'kecamatan'  => 'required|string|max:100',
            'paket_id'   => 'integer|exists:products,id',
            'foto_rumah' => 'image|max:5120',
            'foto_ktp'   => 'image|max:5120',
        ]);

        $fotoRumahPath = null;
        if ($request->hasFile('foto_rumah')) {
            $file = $request->file('foto_rumah');
            $filename = time() . '_rumah_' . str_replace(' ', '_', $file->getClientOriginalName());
            $file->move(public_path('uploads/registrations'), $filename);
            $fotoRumahPath = 'uploads/registrations/' . $filename;
        }

        $fotoKtpPath = null;
        if ($request->hasFile('foto_ktp')) {
            $file = $request->file('foto_ktp');
            $filename = time() . '_ktp_' . str_replace(' ', '_', $file->getClientOriginalName());
            $file->move(public_path('uploads/registrations'), $filename);
            $fotoKtpPath = 'uploads/registrations/' . $filename;
        }

        $registration = Registration::create([
            'nama'       => $request->input('nama'),
            'telepon'    => $request->input('telepon'),
            'alamat'     => $request->input('alamat'),
            'kabupaten'  => $request->input('kabupaten'),
            'kecamatan'  => $request->input('kecamatan'),
            'paket_id'   => $request->input('paket_id') ?: null,
            'foto_rumah' => $fotoRumahPath,
            'foto_ktp'   => $fotoKtpPath,
            'status'     => 'Baru',
        ]);

        // Eager load the product relation for the response
        $registration->load('product');

        return response()->json([
            'message'      => 'Pendaftaran berhasil dikirim! Tim kami akan segera menghubungi Anda.',
            'registration' => $registration,
        ], 201);
    }

    /**
     * Display the specified registration (admin only).
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $registration = Registration::query()->with('product')->find($id);

        if (!$registration) {
            return response()->json(['message' => 'Pendaftaran tidak ditemukan'], 404);
        }

        return response()->json($registration);
    }

    /**
     * Update registration status and notes (admin only).
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $registration = Registration::query()->find($id);

        if (!$registration) {
            return response()->json(['message' => 'Pendaftaran tidak ditemukan'], 404);
        }

        $this->validate($request, [
            'status'  => 'required|in:Baru,Diproses,Selesai,Ditolak',
            'catatan' => 'string|max:500',
        ]);

        $registration->status = $request->input('status');

        if ($request->has('catatan')) {
            $registration->catatan = $request->input('catatan');
        }

        $registration->save();

        $registration->load('product');

        return response()->json([
            'message'      => 'Status pendaftaran berhasil diupdate',
            'registration' => $registration,
        ]);
    }

    /**
     * Remove the specified registration (admin only).
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $registration = Registration::query()->find($id);

        if (!$registration) {
            return response()->json(['message' => 'Pendaftaran tidak ditemukan'], 404);
        }

        $registration->delete();

        return response()->json(['message' => 'Data pendaftaran berhasil dihapus']);
    }
}
