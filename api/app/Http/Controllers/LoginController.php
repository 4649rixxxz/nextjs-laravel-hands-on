<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;

class LoginController extends Controller
{
    /**
     * ログイン
     * @param LoginRequest $request
     * @return JsonResource
     */
    public function login(LoginRequest $request): JsonResource
    {
        if (Auth::attempt($request->all())) {
            $request->session()->regenerate();
            return new UserResource(Auth::user());
        }

        throw ValidationException::withMessages([
            'loginFailed' => 'IDまたはパスワードが間違っています。'
        ]);
    }
}
