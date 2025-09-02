#!/bin/bash

# Script de Deploy para MapChat
echo "🚀 Iniciando deploy do MapChat..."

# 1. Backup do .env se existir
if [ -f .env ]; then
    echo "📋 Fazendo backup do .env atual..."
    cp .env .env.backup
fi

# 2. Copiar configuração de produção
echo "⚙️ Configurando ambiente de produção..."
cp .env.production .env

# 3. Limpar cache do composer
echo "🧹 Limpando caches..."
php -d "disable_functions=" /usr/local/bin/composer clear-cache

# 4. Remover vendor e reinstalar
echo "📦 Removendo dependências antigas..."
rm -rf vendor/
rm composer.lock

# 5. Instalar dependências com versões fixas
echo "📥 Instalando dependências compatíveis..."
php -d "disable_functions=" /usr/local/bin/composer install --no-dev --optimize-autoloader --no-interaction

# 6. Gerar chave da aplicação
echo "🔑 Gerando chave da aplicação..."
php artisan key:generate --force

# 7. Limpar todos os caches
echo "🧽 Limpando caches da aplicação..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear

# 8. Executar migrações
echo "🗄️ Executando migrações..."
php artisan migrate --force

# 9. Executar seeders
echo "🌱 Populando banco de dados..."
php artisan db:seed --force

# 10. Otimizar para produção
echo "⚡ Otimizando para produção..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 11. Definir permissões
echo "🔒 Configurando permissões..."
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/

echo "✅ Deploy concluído com sucesso!"
echo "🌐 Sua aplicação MapChat está pronta para uso!"
