// frontend/script.js

let draggedTask = null;

// Referência para os UL
const pendingTasks = document.getElementById('pendingTasks');
const completedTasks = document.getElementById('completedTasks');

// Buscar tarefas do servidor
async function fetchTasks() {
  try {
    const response = await fetch('http://localhost:3000/tasks');
    const tasks = await response.json();

    // Limpar as listas
    pendingTasks.innerHTML = '';
    completedTasks.innerHTML = '';

    // Inserir tarefas
    tasks.forEach((task) => {
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

// Cria um <li> para cada tarefa
function createTaskCard(task) {
  const listItem = document.createElement('li');
  listItem.textContent = task.title;
  listItem.draggable = true;

  // Descrição
  const description = document.createElement('p');
  description.textContent = task.description;

  // Botão de excluir
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

  listItem.appendChild(description);
  listItem.appendChild(deleteButton);

  // Eventos de arrastar
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

// Adicionar dragover e drop em ambas as listas
[pendingTasks, completedTasks].forEach((list) => {
  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(list, e.clientY);
    const draggingItem = document.querySelector('.dragging');
    if (!afterElement) {
      list.appendChild(draggingItem);
    } else {
      list.insertBefore(draggingItem, afterElement);
    }
  });

  list.addEventListener('drop', (e) => {
    e.preventDefault();
    // Se a coluna for a de concluídas, completed = true, senão = false
    const isCompletedColumn = list === completedTasks;
    updateTaskCompletion(draggedTask, isCompletedColumn);
  });
});

// Função para calcular posição do item enquanto arrasta
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

// Atualiza "completed" no banco via PATCH
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

// Criação de novas tarefas
document.getElementById('taskForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('taskTitle').value;
  const description = document.getElementById('taskDescription').value;

  try {
    const response = await fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title, 
        description,
        completed: false, 
      }),
    });

    if (response.ok) {
      // Limpar os campos
      document.getElementById('taskTitle').value = '';
      document.getElementById('taskDescription').value = '';
      fetchTasks();
    } else {
      console.error('Erro ao adicionar tarefa.');
    }
  } catch (error) {
    console.error('Erro:', error);
  }
});

// Buscar tarefas quando a página carrega
document.addEventListener('DOMContentLoaded', fetchTasks);
