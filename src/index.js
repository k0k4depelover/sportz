import express from 'express';
import http from 'http';
import { matchRouter } from './routes/matches.js'
import { attachWebSocketServer } from './ws/server.js';

const app = express();
const PORT = Number(process.env.PORT || 8765);
const HOST = process.env.HOST || '0.0.0.0';
app.use(express.json());

const server = http.createServer(app);

app.get('/', (req, res) => {
    res.send('Hello from sportz server!');
});

app.use('/matches', matchRouter)

const { broadcastMatchCreated } = attachWebSocketServer(server);

app.locals.broadcastMatchCreated = broadcastMatchCreated;

server.listen(PORT, HOST, () => {
    const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}/:${PORT}`;
    console.log(`SERVER IS RUNNING ON ${baseUrl}`);
    console.log(`WEBSOCKET SERVER IS RUNNING ON ${baseUrl.replace('http', 'ws')}/ws`);
});

