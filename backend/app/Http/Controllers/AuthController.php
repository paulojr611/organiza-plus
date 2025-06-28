<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\Registered;
use App\Models\User;

class AuthController extends Controller
{
    /**
     * Faz o login e retorna um token de API.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciais inválidas'], 401);
        }

        // Emite um token de API (Sanctum)
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 200);
    }

    /**
     * Registra um novo usuário, dispara verificação de e-mail e retorna um token de API.
     */
    public function register(Request $request)
    {
        // Validação dos campos
        $request->validate([
            'name'     => 'required|string|max:50',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6'
        ]);

        // Cria o usuário (inserindo na tabela users)
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Dispara o evento de Registered, que envia o e-mail de verificação
        event(new Registered($user));

        // Gera o token de API (Sanctum)
        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'user'    => $user,
            'token'   => $token,
            'message' => 'Cadastro realizado! Verifique seu e-mail para ativar a conta.'
        ], 201);
    }

    /**
     * Faz logout, revogando todos os tokens do usuário.
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Logout realizado com sucesso'], 200);
    }
}
