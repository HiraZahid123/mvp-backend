<?php

namespace App\Http\Controllers;

use App\Models\Mission;
use App\Models\MissionQuestion;
use App\Events\QuestionPosted;
use App\Events\AnswerPosted;
use App\Notifications\NewQuestionNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MissionQuestionController extends Controller
{
    public function askQuestion(Request $request, Mission $mission)
    {
        if (Auth::id() == $mission->user_id) {
            return back()->withErrors(['question' => 'Mission owners cannot ask questions on their own missions.']);
        }

        if (!Auth::user()->isProvider()) {
            return back()->withErrors(['question' => 'Only providers can ask questions about missions.']);
        }

        $request->validate([
            'question' => 'required|string',
        ]);

        $question = $mission->questions()->create([
            'user_id' => Auth::id(),
            'question' => $request->question,
        ]);

        $mission->user->notify(new NewQuestionNotification($question));

        event(new QuestionPosted($question));

        return back()->with('success', 'Question posted successfully!');
    }

    public function answerQuestion(Request $request, Mission $mission, MissionQuestion $question)
    {
        if (Auth::id() != $mission->user_id) {
            abort(403);
        }

        $request->validate([
            'answer' => 'required|string',
        ]);

        $question->update([
            'answer' => $request->answer,
        ]);

        event(new AnswerPosted($question));

        return back()->with('success', 'Answer posted successfully!');
    }
}
