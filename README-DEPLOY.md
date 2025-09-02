# 🗺️ MapChat - Deploy em Produção

## 🚨 Problema Identificado
Conflito entre versões do Monolog e PSR Log Interface na hospedagem.

## 🛠️ Soluções Implementadas

### 1. Scripts de Deploy Automático
- `deploy.sh` - Script completo de deploy
- `fix-monolog.sh` - Script específico para resolver conflitos do Monolog

### 2. Configurações de Produção
- `.env.production` - Configurações otimizadas para produção
- `logging.production.php` - Configuração de logs compatível

## 📋 Instruções de Deploy

### Opção 1: Deploy Completo (Recomendado)
```bash
# 1. Fazer upload dos arquivos para o servidor
# 2. Conectar via SSH
# 3. Navegar até o diretório do projeto
cd /caminho/do/projeto

# 4. Dar permissão e executar o script de deploy
chmod +x deploy.sh
./deploy.sh
```

### Opção 2: Resolver Apenas o Monolog
```bash
# Se quiser apenas resolver o conflito específico
chmod +x fix-monolog.sh
./fix-monolog.sh
```

### Opção 3: Manual (Passo a Passo)
```bash
# 1. Configurar ambiente
cp .env.production .env

# 2. Editar .env com suas configurações:
# - APP_URL=https://seu-dominio.com
# - DB_DATABASE=seu_banco
# - DB_USERNAME=seu_usuario
# - DB_PASSWORD=sua_senha
# - GOOGLE_CLIENT_SECRET=seu_google_secret

# 3. Resolver conflitos de dependências
rm -rf vendor/ composer.lock
php -d "disable_functions=" /usr/local/bin/composer clear-cache
php -d "disable_functions=" /usr/local/bin/composer install --no-dev --optimize-autoloader

# 4. Configurar Laravel
php artisan key:generate --force
php artisan config:clear
php artisan cache:clear

# 5. Banco de dados
php artisan migrate --force
php artisan db:seed --force

# 6. Otimizar para produção
php artisan config:cache
php artisan route:cache
php artisan view:cache

# 7. Permissões
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
```

## ⚙️ Configurações Importantes

### 1. Arquivo .env de Produção
Edite o `.env` com suas configurações reais:
- **APP_URL**: URL do seu domínio
- **APP_DEBUG**: `false` (muito importante!)
- **APP_ENV**: `production`
- **LOG_CHANNEL**: `single` ou `daily`
- **LOG_LEVEL**: `error` (reduz logs desnecessários)
- **Banco de dados**: suas credenciais reais
- **Google OAuth**: suas credenciais reais

### 2. Permissões de Arquivo
```bash
# Diretórios que precisam ser graváveis
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
```

### 3. Configuração do Servidor Web
Certifique-se que o document root aponta para a pasta `public/`

## 🐛 Resolução de Problemas

### Erro "Class Monolog\Logger not found"
Execute:
```bash
./fix-monolog.sh
```

### Erro de Permissões
```bash
chmod -R 755 storage/
chmod -R 755 bootstrap/cache/
```

### Erro de Chave da Aplicação
```bash
php artisan key:generate --force
```

### Cache Corrompido
```bash
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
```

## 🎯 Funcionalidades do MapChat

- ✅ **Jogo de Geografia**: 10 perguntas divertidas sobre o Brasil
- ✅ **Google Maps**: Integração completa com mapas interativos
- ✅ **Timer Animado**: Cronômetro com ampulheta na navegação
- ✅ **Contador de Tentativas**: Sistema de pontuação
- ✅ **Google OAuth**: Login com conta Google
- ✅ **Design Responsivo**: Funciona em mobile e desktop
- ✅ **Base de Dados**: MySQL com seeds automáticos

## 🌐 Pós-Deploy

Após o deploy bem-sucedido:

1. **Teste o site** em seu domínio
2. **Configure Google OAuth** no Google Cloud Console
3. **Teste o login** com Google
4. **Verifique o jogo** de geografia
5. **Monitore os logs** em `storage/logs/`

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs em `storage/logs/laravel.log`
2. Execute `php artisan config:clear`
3. Execute novamente o script de deploy
4. Verifique as permissões dos diretórios

---

🎮 **MapChat está pronto para conquistar o mundo!** 🗺️
