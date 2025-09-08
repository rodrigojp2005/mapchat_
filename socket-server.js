// Servidor básico Socket.io para MapChat
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer();
const io = socketIo(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Armazena posições dos visitantes em memória
let visitors = {};

io.on('connection', (socket) => {
    console.log('Novo visitante conectado:', socket.id);

    // Recebe posição do visitante
    socket.on('visitorPosition', (data) => {
        visitors[socket.id] = data;
        // Envia lista de todos visitantes para todos conectados
        io.emit('visitorsUpdate', Object.values(visitors));
    });

    // Remove visitante ao desconectar
    socket.on('disconnect', () => {
        delete visitors[socket.id];
        io.emit('visitorsUpdate', Object.values(visitors));
    });
});

const PORT = 3001;
const HOST = '0.0.0.0';
server.listen(PORT, HOST, () => {
    console.log(`Socket.io server rodando em ${HOST}:${PORT}`);
});
