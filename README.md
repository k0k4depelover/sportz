# ⚽ Sportz

**Sportz** es un servidor de eventos deportivos en tiempo real que combina una API REST con WebSocket, permitiendo que los clientes conectados reciban notificaciones instantáneas cuando se crea un nuevo partido.

---

## ✨ Características

- ⚡ **WebSocket en tiempo real** — Los clientes suscritos reciben eventos `match_created` al instante, sin polling.
- 🛡️ **Validación con Zod** — Todos los payloads se validan con esquemas tipados antes de tocar la BD.
- 🗄️ **Drizzle ORM + PostgreSQL** — Consultas type-safe con migraciones versionadas.
- 🔌 **Arquitectura compartida** — HTTP y WebSocket comparten el mismo puerto TCP.
- 📋 **Estado automático** — El estado del partido (`scheduled`, `live`, `finished`) se calcula según `startTime` y `endTime`.

---

## 🛠️ Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | v5.2.1 | Framework HTTP |
| ws | v8.19.0 | Servidor WebSocket |
| Drizzle ORM | v0.45.1 | ORM type-safe PostgreSQL |
| Zod | v4.3.6 | Validación de schemas |
| PostgreSQL | — | Base de datos |

---

## 🏗️ Arquitectura

```
src/
├── index.js           # Entry point — Express + WebSocket
├── routes/matches.js  # GET /matches, POST /matches
├── ws/server.js       # WebSocket server + broadcast
├── db/schema.js       # Schema de Drizzle ORM
├── validation/matches.js  # Schemas Zod
└── utils/match-status.js  # Cálculo de estado del partido
```

---

## 💻 Ejemplo de Uso

### Flujo POST /matches con broadcast WebSocket

```javascript
matchRouter.post('/', async (req, res) => {
    // 1. Validar body con Zod
    const parsed = createMatchSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: "Invalid payload", details: parsed.error });
    }

    // 2. Insertar en PostgreSQL vía Drizzle ORM
    const [event] = await db.insert(matches).values({
        ...parsed.data,
        status: getMatchStatus(startTime, endTime), // auto-calculado
    }).returning();

    // 3. Broadcast a todos los clientes WebSocket conectados
    res.app.locals.broadcastMatchCreated(event);

    return res.status(201).json({ data: event });
});
```

### Servidor WebSocket (mismo puerto HTTP)

```javascript
export function attachWebSocketServer(server) {
    const wss = new WebSocketServer({
        server,       // mismo listener TCP que Express
        path: '/ws',  // ws://localhost:8765/ws
        maxPayload: 1024 * 1024,
    });

    wss.on('connection', (socket) => {
        sendJson(socket, { type: 'welcome' }); // mensaje de bienvenida
    });

    function broadcastMatchCreated(match) {
        for (const client of wss.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ type: 'match_created', data: match }));
            }
        }
    }

    return { broadcastMatchCreated };
}
```

---

## 📡 Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/matches?limit=N` | Listar partidos (desc por fecha) |
| `POST` | `/matches` | Crear partido + broadcast WS |
| `WS` | `/ws` | Suscribirse a eventos en tiempo real |

### Payload para crear partido

```json
{
  "homeTeam": "Real Madrid",
  "awayTeam": "Barcelona",
  "startTime": "2026-03-15T20:00:00Z",
  "endTime": "2026-03-15T22:00:00Z"
}
```

### Evento WebSocket recibido

```json
{ "type": "match_created", "data": { "id": 1, "homeTeam": "Real Madrid", "status": "scheduled" } }
```

---

## 📦 Instalación

```bash
git clone https://github.com/k0k4depelover/sportz.git
cd sportz && npm install
cp .env.example .env  # configurar DATABASE_URL
npm run db:migrate
npm run dev
```

Servidor en `http://localhost:8765` — WebSocket en `ws://localhost:8765/ws`

---

## 📄 Licencia

ISC