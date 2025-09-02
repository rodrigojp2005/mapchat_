<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'question_text',
        'answer_lat',
        'answer_lng',
        'category',
        'hint',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }


}
