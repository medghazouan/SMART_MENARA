<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function count(Request $request)
    {
        $count = Notification::where('superviseur_id', $request->user()->matricule)
            ->where('is_read', false)
            ->count();

        return response()->json(['unread_count' => $count]);
    }

    public function index(Request $request)
    {
        $notifications = Notification::where('superviseur_id', $request->user()->matricule)
            ->where('is_read', false)
            ->with('panne.materiel')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = Notification::findOrFail($id);

        if ($notification->superviseur_id !== $request->user()->matricule) {
            return response()->json([
                'message' => 'Non autorisé.'
            ], 403);
        }

        $notification->update(['is_read' => true]);

        return response()->json([
            'message' => 'Notification marquée comme lue',
            'notification' => $notification
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        Notification::where('superviseur_id', $request->user()->matricule)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->json([
            'message' => 'Toutes les notifications marquées comme lues'
        ]);
    }
}
