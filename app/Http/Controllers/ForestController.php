<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ForestController extends Controller
{
    public function index()
    {
        return Inertia::render('Forest/Index');
    }
}
