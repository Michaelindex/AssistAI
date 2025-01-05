// frontend/script.js

/* Referências Globais */
let draggedTask = null;

// Listas desktop
const pendingTasks = document.getElementById('pendingTasks');   // "Tarefas"
const completedTasks = document.getElementById('completedTasks'); // "Concluídas"

// Popups e overlay
const addTaskPopup = document.getElementById('addTaskPopup');
const concludedTasksPopup = document.getElementById('concludedTasksPopup');
const overlay = document.getElementById('overlay');

// Botões de abrir/fechar popup
const btnMobileAddTask = document.getElementById('btnMobileAddTask');
const closeAddPopup = document.getElementById('closeAddPopup');

const btnShowConcluded = document.getElementById('btnShowConcluded');
const closeConcludedPopup = document.getElementById('closeConcludedPopup');

/* --- EVENTOS DE POPUP (MOBILE) --- */
btnMobileAddTask.addEventListener('click', () => {
  addTaskPopup.classList.add('show');
  overlay.classList.add('show');
});
closeAddPopup.addEventListener('click', () => {
  addTaskPopup.classList.remove('show');
  overlay.classList.remove('show');
});

btnShowConcluded.addEventListener('click', () => {
  concludedTasksPopup.classList.add('show');
  overlay.classList.add('show');
  fillMobileConcludedList(); // Monta a lista de concluidos no popup
});
closeConcludedPopup.addEventListener('click', () => {
  concludedTasksPopup.classList.remove('show');
  overlay.classList.remove('show');
});

/* --- FUNÇÃO DE LISTAR TAREFAS --- */
async function fetchTasks() {
  try {
    const response = await fetch('http://localhost:3000/tasks');
    const tasks = await response.json();

    // Limpa as listas do desktop
    pendingTasks.innerHTML = '';
    completedTasks.innerHTML = '';

    // Preenche
    tasks.forEach(task => {
      const li = createTaskCard(task);
      if (task.completed) {
        completedTasks.appendChild(li);
      } else {
        pendingTasks.appendChild(li);
      }
    });
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
  }
}

/* --- CRIA UM CARD <li> --- */
function createTaskCard(task) {
  const li = document.createElement('li');
  li.draggable = true;
  
  // Se tiver cor, aplica
  li.style.backgroundColor = task.color || '#f5f5f5';

  // Conteúdo
  // EX: Título e Descrição
  const contentDiv = document.createElement('div');
  contentDiv.style.flex = '1';

  const titleEl = document.createElement('p');
  titleEl.textContent = task.title;
  const descEl = document.createElement('p');
  descEl.textContent = task.description;

  contentDiv.appendChild(titleEl);
  contentDiv.appendChild(descEl);

  // Botão Excluir
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Excluir';
  deleteBtn.classList.add('delete-btn');
  deleteBtn.addEventListener('click', async () => {
    try {
      await fetch(`http://localhost:3000/tasks/${task._id}`, { method: 'DELETE' });
      fetchTasks();
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
    }
  });

  li.appendChild(contentDiv);
  li.appendChild(deleteBtn);

  // Eventos de drag
  li.addEventListener('dragstart', () => {
    draggedTask = task;
    li.classList.add('dragging');
  });
  li.addEventListener('dragend', () => {
    draggedTask = null;
    li.classList.remove('dragging');
  });

  return li;
}

/* --- DRAG & DROP nas listas do Desktop --- */
[pendingTasks, completedTasks].forEach(list => {
  list.addEventListener('dragover', e => {
    e.preventDefault();
    const afterElement = getDragAfterElement(list, e.clientY);
    const draggingItem = document.querySelector('.dragging');
    
    if (!afterElement) {
      list.appendChild(draggingItem);
    } else {
      list.insertBefore(draggingItem, afterElement);
    }
  });

  list.addEventListener('drop', e => {
    e.preventDefault();
    const isCompleted = (list === completedTasks);
    updateTaskCompletion(draggedTask, isCompleted);
  });
});

/* --- FUNÇÃO QUE CALCULA A POSIÇÃO DE INSERIR O CARD --- */
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/* --- ATUALIZA 'completed' NO BACKEND --- */
async function updateTaskCompletion(task, completed) {
  if (!task) return;
  try {
    if (task.completed !== completed) {
      const res = await fetch(`http://localhost:3000/tasks/${task._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
      if (res.ok) {
        fetchTasks();
      } else {
        console.error('Erro ao atualizar tarefa.');
      }
    }
  } catch (err) {
    console.error('Erro ao atualizar tarefa:', err);
  }
}

/* --- FORMULÁRIOS DESKTOP E MOBILE --- */

// Desktop
const taskFormDesktop = document.getElementById('taskFormDesktop');
taskFormDesktop.addEventListener('submit', async e => {
  e.preventDefault();
  const title = document.getElementById('taskTitleDesktop').value;
  const description = document.getElementById('taskDescriptionDesktop').value;
  const color = document.getElementById('taskColorDesktop').value;

  try {
    const res = await fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, color, completed: false })
    });
    if (res.ok) {
      taskFormDesktop.reset();
      fetchTasks();
    } else {
      console.error('Erro ao criar tarefa.');
    }
  } catch (error) {
    console.error('Erro no fetch:', error);
  }
});

// Mobile
const taskFormMobile = document.getElementById('taskFormMobile');
taskFormMobile.addEventListener('submit', async e => {
  e.preventDefault();
  const title = document.getElementById('taskTitleMobile').value;
  const description = document.getElementById('taskDescriptionMobile').value;
  const color = document.getElementById('taskColorMobile').value;

  try {
    const res = await fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, color, completed: false })
    });
    if (res.ok) {
      taskFormMobile.reset();
      // continua com o popup aberto para inserir mais tarefas,
      // conforme você pediu.  Se quiser fechar automaticamente, basta fechar aqui.
      fetchTasks();
    } else {
      console.error('Erro ao criar tarefa (mobile).');
    }
  } catch (error) {
    console.error('Erro no fetch (mobile):', error);
  }
});

/* --- LISTA DE CONCLUÍDOS NO POPUP (MOBILE) --- */
async function fillMobileConcludedList() {
  try {
    const res = await fetch('http://localhost:3000/tasks');
    const tasks = await res.json();
    const mobileCompletedList = document.getElementById('mobileCompletedList');
    mobileCompletedList.innerHTML = '';

    // Filtra só as completadas
    const concluded = tasks.filter(t => t.completed);
    concluded.forEach(task => {
      const li = document.createElement('li');
      li.textContent = task.title;
      // se quiser a cor e descrição, acrescente
      mobileCompletedList.appendChild(li);
    });
  } catch (err) {
    console.error('Erro ao buscar tarefas concluídas:', err);
  }
}

/* --- Ao carregar a página --- */
document.addEventListener('DOMContentLoaded', fetchTasks);
