const mongoose = require('mongoose');

// Esquema do Modelo de Tarefas
const taskSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Título da tarefa (obrigatório)
    description: { type: String },          // Descrição opcional
    completed: { type: Boolean, default: false }, // Status de conclusão
    createdAt: { type: Date, default: Date.now }, // Data de criação
});

// Exportar o Modelo
module.exports = mongoose.model('Task', taskSchema);
