// frontend/script.js

let draggedTask = null;

const pendingTasks = document.getElementById('pendingTasks');
const completedTasks = document.getElementById('completedTasks');

// Carrega tarefas do backend
async function fetchTasks() {
  try {
    const response = await fetch('http://localhost:3000/tasks');
    const tasks = await response.json();

    // Limpa as listas
    pendingTasks.innerHTML = '';
    completedTasks.innerHTML = '';

    // Insere cada tarefa em pending ou completed
    tasks.forEach(task => {
      const listItem = createTaskCard(task);
      if (task.completed) {
        completedTasks.appendChild(listItem);
      } else {
        pendingTasks.appendChild(listItem);
      }
    });
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
  }
}

// Cria o card <li> para cada tarefa
function createTaskCard(task) {
  const listItem = document.createElement('li');
  listItem.textContent = task.title;
  listItem.draggable = true;

  // Se existir 'color' no task, aplica ao li
  listItem.style.backgroundColor = task.color || '#f5f5f5';

  // Descrição
  const desc = document.createElement('p');
  desc.textContent = task.description;
  desc.style.marginTop = '10px';

  // Botão Excluir
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Excluir';
  deleteButton.classList.add('delete-btn');
  deleteButton.addEventListener('click', async () => {
    try {
      await fetch(`http://localhost:3000/tasks/${task._id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
    }
  });

  listItem.appendChild(desc);
  listItem.appendChild(deleteButton);

  // Eventos de drag
  listItem.addEventListener('dragstart', () => {
    draggedTask = task;
    listItem.classList.add('dragging');
  });

  listItem.addEventListener('dragend', () => {
    draggedTask = null;
    listItem.classList.remove('dragging');
  });

  return listItem;
}

// Para cada lista (pending e completed), adicionamos dragover e drop
[pendingTasks, completedTasks].forEach(list => {
  // Permite soltar dentro da lista
  list.addEventListener('dragover', e => {
    e.preventDefault();

    const afterElement = getDragAfterElement(list, e.clientY);
    const draggingItem = document.querySelector('.dragging');

    // Se não houver elemento após, anexa no final
    if (!afterElement) {
      list.appendChild(draggingItem);
    } else {
      list.insertBefore(draggingItem, afterElement);
    }
  });

  list.addEventListener('drop', e => {
    e.preventDefault();
    // Se for a lista 'completedTasks', definimos completed = true
    const isCompleted = (list === completedTasks);
    updateTaskCompletion(draggedTask, isCompleted);
  });
});

// Função para obter posição do item na lista
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - (box.height / 2);

    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Atualiza a tarefa no banco (muda 'completed')
async function updateTaskCompletion(task, completed) {
  if (!task) return;

  try {
    if (task.completed !== completed) {
      const response = await fetch(`http://localhost:3000/tasks/${task._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      });

      if (response.ok) {
        fetchTasks();
      } else {
        console.error('Erro ao atualizar tarefa.');
      }
    }
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
  }
}

// Cria uma nova tarefa com cor, título e descrição
document.getElementById('taskForm').addEventListener('submit', async e => {
  e.preventDefault();

  const title = document.getElementById('taskTitle').value;
  const description = document.getElementById('taskDescription').value;
  const color = document.getElementById('taskColor').value;

  try {
    const response = await fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title, 
        description,
        color,
        completed: false 
      }),
    });

    if (response.ok) {
      // Limpa o formulário
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

// Ao carregar a página, busca as tarefas
document.addEventListener('DOMContentLoaded', fetchTasks);
