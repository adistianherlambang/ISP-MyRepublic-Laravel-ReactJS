<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Product;

class ProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index()
    {
        $products = Product::all();
        return response()->json($products);
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'nama_paket' => 'required|string|max:100',
            'kecepatan' => 'required|string|max:50',
            'harga' => 'required|integer',
            'deskripsi' => 'string',
        ]);

        $product = Product::create($request->all());

        return response()->json([
            'message' => 'Paket berhasil ditambahkan',
            'product' => $product
        ], 201);
    }

    /**
     * Display the specified product.
     */
    public function show($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Paket tidak ditemukan'], 404);
        }

        return response()->json($product);
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, $id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Paket tidak ditemukan'], 404);
        }

        $this->validate($request, [
            'nama_paket' => 'required|string|max:100',
            'kecepatan' => 'required|string|max:50',
            'harga' => 'required|integer',
            'deskripsi' => 'string',
        ]);

        $product->update($request->all());

        return response()->json([
            'message' => 'Paket berhasil diupdate',
            'product' => $product
        ]);
    }

    /**
     * Remove the specified product.
     */
    public function destroy($id)
    {
        $product = Product::find($id);

        if (!$product) {
            return response()->json(['message' => 'Paket tidak ditemukan'], 404);
        }

        $product->delete();

        return response()->json(['message' => 'Paket berhasil dihapus']);
    }
}
