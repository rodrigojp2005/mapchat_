#!/bin/bash

echo "🔧 Resolvendo conflitos de dependências do Monolog..."

# 1. Remover arquivos de lock
rm -f composer.lock

# 2. Limpar cache do composer
php -d "disable_functions=" /usr/local/bin/composer clear-cache

# 3. Atualizar composer.json com versões específicas
cat > composer.temp.json << 'EOF'
{
    "require": {
        "monolog/monolog": "^3.0",
        "psr/log": "^3.0"
    }
}
EOF

# 4. Forçar atualização das dependências específicas
php -d "disable_functions=" /usr/local/bin/composer require monolog/monolog:^3.0 --with-all-dependencies --no-interaction

# 5. Forçar atualização do PSR Log
php -d "disable_functions=" /usr/local/bin/composer require psr/log:^3.0 --with-all-dependencies --no-interaction

# 6. Reinstalar todas as dependências
php -d "disable_functions=" /usr/local/bin/composer install --no-dev --optimize-autoloader --no-interaction

# 7. Limpar arquivos temporários
rm -f composer.temp.json

echo "✅ Conflitos resolvidos!"
