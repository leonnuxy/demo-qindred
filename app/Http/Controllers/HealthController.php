<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $health = [
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
            'services' => [
                'database' => $this->checkDatabase(),
                'storage' => $this->checkStorage(),
            ]
        ];

        return response()->json($health);
    }

    private function checkDatabase(): string
    {
        try {
            DB::connection()->getPdo();
            return 'ok';
        } catch (\Exception $e) {
            return 'error';
        }
    }

    private function checkStorage(): string
    {
        return is_writable(storage_path()) ? 'ok' : 'error';
    }
}
