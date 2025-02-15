// Backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Task = require('./models/Task'); // Importa o modelo já pronto

const app = express();
const PORT = 3000;
const mongoURI = 'mongodb://127.0.0.1:27017/assistente_produtividade';

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

app.use(express.json());
app.use(cors());

// Conecta ao MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('Conectado ao MongoDB!'))
  .catch((error) => console.error('Erro ao conectar ao MongoDB:', error));

// [POST] Criar tarefa
app.post('/tasks', async (req, res) => {
  try {
    const { title, description, color } = req.body;
    const newTask = new Task({ 
      title, 
      description,
      color
    });
    await newTask.save();

    res.status(201).json({ message: 'Tarefa adicionada com sucesso!' });
  } catch (error) {
    console.error('Erro ao salvar tarefa:', error);
    res.status(500).json({ error: 'Erro ao salvar tarefa.' });
  }
});

// [GET] Listar tarefas
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
    res.status(500).json({ error: 'Erro ao buscar tarefas.' });
  }
});

// [DELETE] Excluir tarefa
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

// [PATCH] Atualizar 'completed'
app.patch('/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    const task = await Task.findByIdAndUpdate(
      id,
      { completed },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ error: 'Tarefa não encontrada' });
    }
    res.status(200).json(task);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({ error: 'Erro ao atualizar tarefa.' });
  }
});