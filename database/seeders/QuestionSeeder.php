<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Question;
use App\Models\User;

class QuestionSeeder extends Seeder
{
    public function run(): void
    {
        // Criar um usuário padrão se não existir
        $user = User::firstOrCreate(
            ['email' => 'admin@mapchat.com'],
            [
                'name' => 'Admin MapChat',
                'password' => bcrypt('password'),
            ]
        );

        // Limpar perguntas existentes
        Question::truncate();

        $questions = [
            [
                'question_text' => 'Qual cidade ficou mundialmente conhecida por um "visitante" extraterrestre em 1996?',
                'answer_lat' => -21.5554,
                'answer_lng' => -45.4297,
                'category' => 'UFO',
                'hint' => 'ET Bilu mandou buscar conhecimento aqui!'
            ],
            [
                'question_text' => 'Em qual cidade você encontraria o famoso "Pão de Açúcar"?',
                'answer_lat' => -22.9068,
                'answer_lng' => -43.1729,
                'category' => 'Turismo',
                'hint' => 'Cidade maravilhosa, cheia de encantos mil!'
            ],
            [
                'question_text' => 'Onde fica o "umbigo do mundo" segundo os paulistanos?',
                'answer_lat' => -23.5505,
                'answer_lng' => -46.6333,
                'category' => 'Humor',
                'hint' => 'Terra da garoa e do trânsito infinito!'
            ],
            [
                'question_text' => 'Em qual cidade você pode visitar as famosas Cataratas e ainda ouvir "Iguaçu Falls" em três idiomas?',
                'answer_lat' => -25.5163,
                'answer_lng' => -54.5854,
                'category' => 'Natureza',
                'hint' => 'Tríplice fronteira com muito barulho de água!'
            ],
            [
                'question_text' => 'Qual cidade é famosa por ter mais bois que gente e ser a capital do agronegócio?',
                'answer_lat' => -15.6014,
                'answer_lng' => -56.0979,
                'category' => 'Agronegócio',
                'hint' => 'No coração do Pantanal, onde o boi é rei!'
            ],
            [
                'question_text' => 'Em que cidade você pode "voar" de asa delta e depois tomar uma caipirinha na praia?',
                'answer_lat' => -22.9068,
                'answer_lng' => -43.1729,
                'category' => 'Aventura',
                'hint' => 'Do alto da Pedra Bonita se vê o mar!'
            ],
            [
                'question_text' => 'Qual cidade tem o maior carnaval fora de época do Brasil e todo mundo vira "axé music"?',
                'answer_lat' => -12.9714,
                'answer_lng' => -38.5014,
                'category' => 'Festa',
                'hint' => 'Terra da música baiana e do acarajé!'
            ],
            [
                'question_text' => 'Em qual cidade você pode almoçar no Brasil e jantar no Uruguai no mesmo dia?',
                'answer_lat' => -32.0346,
                'answer_lng' => -52.0985,
                'category' => 'Fronteira',
                'hint' => 'Cidade gêmea onde se fala "portunhol"!'
            ],
            [
                'question_text' => 'Qual cidade é conhecida como a "Suíça brasileira" mas tem mais montanha-russa que neve?',
                'answer_lat' => -22.7386,
                'answer_lng' => -45.5908,
                'category' => 'Turismo',
                'hint' => 'No inverno fica cheio de paulista tentando ver neve!'
            ],
            [
                'question_text' => 'Em que cidade você pode tomar banho de rio e ainda ver um encontro das águas que parece mágica?',
                'answer_lat' => -3.1190,
                'answer_lng' => -60.0217,
                'category' => 'Natureza',
                'hint' => 'Portal da Amazônia, onde rios se abraçam!'
            ]
        ];

        foreach ($questions as $questionData) {
            Question::create(array_merge($questionData, ['user_id' => $user->id]));
        }
    }
}
