const express = require('express');
const app = express();
const PORT = 3000;

const { insertar, consultar, editar, eliminar, nuevaTransferencia, consultaTransferencia } = require("./consultas");

app.listen(PORT, () => {
    console.log(`El servidor está inicializado en el puerto ${PORT}`)
});

// Middlewares to parse POST request data
app.use(express.json()); 

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

app.post("/usuario", async (req, res) => {
    try {
        const datos = req.body;
        const respuesta = await insertar(datos);
        res.send(respuesta);
    }
    catch {
        res.status(500).send("Algo salió mal")
    }
});

app.get("/usuarios", async (req, res) => {
    try {
        const respuesta = await consultar();
        res.json(respuesta);
    }
    catch {
        res.status(500).send("Algo salió mal")
    }
})

app.put("/usuario", async (req, res) => {
    try {
        const { id } = req.query;
        const datos = Object.values(req.body);
        const respuesta = await editar(id, datos);
        res.json(respuesta);
    }
    catch {
        res.status(500).send("Algo salió mal")
    }
});

app.delete("/usuario", async (req, res) => {
    try {
        const { id } = req.query;
        const respuesta = await eliminar(id);
        res.json(respuesta);
    }
    catch {
        res.status(500).send("Algo salió mal")
    }
});

app.post("/transferencia", async (req, res) => {
    try {
        const datos = req.body;
        const respuesta = await nuevaTransferencia(datos);
        res.json(respuesta);
    }
    catch {
        res.status(500).send("Algo salió mal")
    }
});

app.get("/transferencias", async (req, res) => {
    try {
        const respuesta = await consultaTransferencia();
        res.json(respuesta);
    }
    catch {
        res.status(500).send("Algo salió mal")
    }
})