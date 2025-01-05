// script.js

let draggedTask = null;        // Qual tarefa do BD estamos arrastando
let draggedItemElement = null; // Qual <li> corresponde a essa tarefa

const pendingTasks = document.getElementById('pendingTasks');
const completedTasks = document.getElementById('completedTasks');

// ============== BUSCAR TAREFAS DO BACK-END ==============
async function fetchTasks() {
  try {
    const response = await fetch('http://localhost:3000/tasks');
    const tasks = await response.json();

    // Limpa as listas
    pendingTasks.innerHTML = '';
    completedTasks.innerHTML = '';

    // Cria e insere cards
    tasks.forEach(task => {
      const cardElement = createTaskCard(task);
      if (task.completed) {
        completedTasks.appendChild(cardElement);
      } else {
        pendingTasks.appendChild(cardElement);
      }
    });
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
  }
}

// ============== CRIAR O CARD DE TAREFA ==============
function createTaskCard(task) {
  // <li> container do card
  const li = document.createElement('li');
  li.classList.add('task-card');

  // Converter hex para RGBA com opacidade 0.7
  const cardColor = hexToRgba(task.color || '#ffffff', 0.7);
  li.style.backgroundColor = cardColor;

  // Área esquerda (65%): título e descrição
  const infoDiv = document.createElement('div');
  infoDiv.classList.add('task-info');

  // Título (1 linha, truncado)
  const titleEl = document.createElement('p');
  titleEl.classList.add('task-title');
  titleEl.textContent = task.title;

  // Descrição (2 linhas, truncado)
  const descEl = document.createElement('p');
  descEl.classList.add('task-desc');
  descEl.textContent = task.description;

  infoDiv.appendChild(titleEl);
  infoDiv.appendChild(descEl);

  // Área direita (35%): handle + botão deletar
  const actionsDiv = document.createElement('div');
  actionsDiv.classList.add('task-actions');

  // Handle (arrastável)
  const dragHandle = document.createElement('div');
  dragHandle.classList.add('drag-handle');
  dragHandle.draggable = true; // SÓ a handle é arrastável

  // Eventos de drag na handle
  dragHandle.addEventListener('dragstart', e => {
    draggedTask = task;
    draggedItemElement = li; 
    li.classList.add('dragging');
  });
  dragHandle.addEventListener('dragend', e => {
    draggedTask = null;
    draggedItemElement = null;
    li.classList.remove('dragging');
  });

  // Botão Deletar
  const deleteBtn = document.createElement('button');
  deleteBtn.classList.add('delete-btn');
  deleteBtn.textContent = 'DELETAR';
  deleteBtn.addEventListener('click', async () => {
    try {
      await fetch(`http://localhost:3000/tasks/${task._id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
    }
  });

  actionsDiv.appendChild(dragHandle);
  actionsDiv.appendChild(deleteBtn);

  // Monta o card
  li.appendChild(infoDiv);
  li.appendChild(actionsDiv);

  return li;
}

// ============== FUNÇÃO DE HEX => RGBA COM OPACIDADE ==============
function hexToRgba(hex, alpha = 1) {
  // Remove '#' se tiver
  hex = hex.replace('#', '');
  // parse r,g,b
  let r = parseInt(hex.substring(0,2), 16);
  let g = parseInt(hex.substring(2,4), 16);
  let b = parseInt(hex.substring(4,6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============== DRAG & DROP NAS LISTAS ==============
[pendingTasks, completedTasks].forEach(list => {
  list.addEventListener('dragover', e => {
    e.preventDefault();
    const afterElement = getDragAfterElement(list, e.clientY);
    if (!afterElement) {
      list.appendChild(draggedItemElement);
    } else {
      list.insertBefore(draggedItemElement, afterElement);
    }
  });

  list.addEventListener('drop', e => {
    e.preventDefault();
    if (draggedTask) {
      const isCompleted = (list === completedTasks);
      updateTaskCompletion(draggedTask, isCompleted);
    }
  });
});

// Função para inserir o card na posição correta (reordenar)
function getDragAfterElement(container, y) {
  const cards = [...container.querySelectorAll('.task-card:not(.dragging)')];
  return cards.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height/2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ============== ATUALIZAR TAREFA (COMPLETED) NO BACKEND ==============
async function updateTaskCompletion(task, completed) {
  if (!task) return;
  try {
    if (task.completed !== completed) {
      await fetch(`http://localhost:3000/tasks/${task._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
      fetchTasks();
    }
  } catch (err) {
    console.error('Erro ao atualizar tarefa:', err);
  }
}

// ============== CRIAR NOVA TAREFA (FORM) ==============
document.getElementById('taskForm').addEventListener('submit', async e => {
  e.preventDefault();

  const title = document.getElementById('taskTitle').value;
  const description = document.getElementById('taskDescription').value;
  const color = document.getElementById('taskColor').value;

  try {
    const res = await fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, color, completed: false })
    });
    if (res.ok) {
      // Limpa o form
      document.getElementById('taskTitle').value = '';
      document.getElementById('taskDescription').value = '';
      document.getElementById('taskColor').value = '#ffffff';

      fetchTasks();
    } else {
      console.error('Erro ao adicionar tarefa.');
    }
  } catch (error) {
    console.error('Erro:', error);
  }
});

// ============== AO CARREGAR A PÁGINA ==============
document.addEventListener('DOMContentLoaded', fetchTasks);
