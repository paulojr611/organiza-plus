<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
/*
Route::get('/', function () {
    return view('welcome');
});
*/
// lembrar de apagar ou comentar o test-mail
Route::get('/test-mail', function () {
    try {
        Mail::raw('Teste de envio via rota', function ($m) {
            $m->to('phj611@hotmail.com') //suporte@organizamais.com         phj611@hotmail.com
              ->subject('Teste de Rota');
        });

        Log::info('✅ E-mail disparado pela rota!');
        return '✅ E-mail disparado sem exceção!';
    } catch (\Throwable $e) {
        Log::error('🚨 Erro ao enviar e-mail: ' . $e->getMessage());
        return '🚨 Exceção ao enviar e-mail: ' . $e->getMessage();
    }
});
Route::view('/{any}', 'app')->where('any', '.*');
