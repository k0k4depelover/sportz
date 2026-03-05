import  express from 'express';


const app = express();
const port = 8765;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello from sportz server!');
});

app.listen(port, () => {
    console.log(`Server is running and listening at http://localhost:${port}`);
});
