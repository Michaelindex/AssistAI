// const express = require('express');
// const cors = require('cors');
// const app = express();

// const mongoose = require('mongoose');

// const Task = require('./models/Task');

// // URL de conexão com o MongoDB (ajuste conforme necessário)
// const mongoURI = 'mongodb://127.0.0.1:27017/assistente_produtividade';

// // Conectar ao MongoDB
// mongoose.connect(mongoURI)
//     .then(() => console.log('Conectado ao MongoDB!'))
//     .catch((error) => console.error('Erro ao conectar ao MongoDB:', error));

// // Configurar CORS
// app.use(cors());

// app.get('/', (req, res) => {
//     res.send('Hello, World!');
// });

// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Servidor rodando na porta ${PORT}`);
// });

// app.use(express.json());

// app.post('/tasks', async (req, res) => {
//     try {
//         const { title, description } = req.body;
//         const newTask = new Task({ title, description });
//         await newTask.save();
//         res.status(201).json({ message: 'Tarefa criada com sucesso!' });
//     } catch (error) {
//         res.status(500).json({ error: 'Erro ao criar tarefa.' });
//     }
// });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Configuração inicial do servidor
const app = express();
const PORT = 3000;
const mongoURI = 'mongodb://127.0.0.1:27017/assistente_produtividade';
// Inicializar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Middleware
app.use(express.json()); // Para lidar com JSON
app.use(cors()); // Permitir requisições do front-end

// Conexão com o MongoDB
mongoose.connect(mongoURI)
    .then(() => console.log('Conectado ao MongoDB!'))
    .catch((error) => console.error('Erro ao conectar ao MongoDB:', error));

// Modelo de Tarefa
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
});

const Task = mongoose.model('Task', taskSchema);

// Endpoint para adicionar tarefas
app.post('/tasks', async (req, res) => {
    try {
        const { title, description } = req.body;

        const newTask = new Task({ title, description });
        await newTask.save();

        res.status(201).json({ message: 'Tarefa adicionada com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar tarefa:', error);
        res.status(500).json({ error: 'Erro ao salvar tarefa.' });
    }
});

// Endpoint para listar tarefas
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find(); // Recupera todas as tarefas do banco de dados
        res.status(200).json(tasks); // Retorna as tarefas em formato JSON
    } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        res.status(500).json({ error: 'Erro ao buscar tarefas.' });
    }
});

app.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Task.findByIdAndDelete(id);
        res.status(200).json({ message: 'Tarefa excluída com sucesso!' });
    } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
        res.status(500).json({ error: 'Erro ao excluir tarefa.' });
    }
});

app.patch('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { completed } = req.body; // Obtém o status atualizado (concluído ou não)
        const task = await Task.findByIdAndUpdate(id, { completed }, { new: true }); // Atualiza a tarefa

        if (!task) {
            return res.status(404).json({ error: 'Tarefa não encontrada' });
        }

        res.status(200).json(task); // Retorna a tarefa atualizada
    } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
        res.status(500).json({ error: 'Erro ao atualizar tarefa.' });
    }
});
