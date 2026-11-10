<?php

namespace App\Http\Controllers;

use App\Documents\PrintToken;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The page the PDF renderer prints. Reachable only with a valid signature
 * (temporary signed route) and the matching print token header.
 */
class PrintController extends Controller
{
    public function __invoke(Request $request, Document $document): Response
    {
        abort_unless(PrintToken::matches($document, $request->header(PrintToken::HEADER)), 403);

        return Inertia::render('documents/print', [
            'document' => DocumentResource::make($document)->resolve(),
        ])->withViewData(['noindex' => true]);
    }
}
