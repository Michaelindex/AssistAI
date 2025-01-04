let draggedTask = null;

// Função para buscar e exibir tarefas
async function fetchTasks() {
    try {
        const response = await fetch('http://localhost:3000/tasks');
        const tasks = await response.json();

        const pendingTasks = document.getElementById('pendingTasks');
        const completedTasks = document.getElementById('completedTasks');
        pendingTasks.innerHTML = '';
        completedTasks.innerHTML = '';

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

// Função para criar um card de tarefa
function createTaskCard(task) {
    const listItem = document.createElement('li');
    listItem.textContent = task.title;
    listItem.draggable = true;

    const description = document.createElement('p');
    description.textContent = task.description;

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

    // Eventos de Drag
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

// Adiciona os eventos de dragover e drop nas colunas
const pendingTasks = document.getElementById('pendingTasks');
const completedTasks = document.getElementById('completedTasks');

pendingTasks.addEventListener('dragover', (e) => {
    e.preventDefault();  // Permite que o item seja arrastado
    const afterElement = getDragAfterElement(pendingTasks, e.clientY);
    const dragging = document.querySelector('.dragging');
    if (afterElement == null) {
        pendingTasks.appendChild(dragging);
    } else {
        pendingTasks.insertBefore(dragging, afterElement);
    }
});

completedTasks.addEventListener('dragover', (e) => {
    e.preventDefault();  // Permite que o item seja arrastado
    const afterElement = getDragAfterElement(completedTasks, e.clientY);
    const dragging = document.querySelector('.dragging');
    if (afterElement == null) {
        completedTasks.appendChild(dragging);
    } else {
        completedTasks.insertBefore(dragging, afterElement);
    }
});

pendingTasks.addEventListener('drop', (e) => {
    updateTaskCompletion(draggedTask, false);
});

completedTasks.addEventListener('drop', (e) => {
    updateTaskCompletion(draggedTask, true);
});

// Função para atualizar o status da tarefa
// Função para atualizar o status da tarefa
async function updateTaskCompletion(task, completed) {
    if (task) {
        try {
            // Verifica se o status da tarefa mudou
            if (task.completed !== completed) {
                const response = await fetch(`http://localhost:3000/tasks/${task._id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ completed }),
                });

                if (response.ok) {
                    console.log(`Tarefa ${task._id} marcada como ${completed ? 'concluída' : 'pendente'}`);
                    fetchTasks(); // Atualiza a lista de tarefas após mover
                } else {
                    console.error('Erro ao atualizar tarefa.');
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar tarefa:', error);
        }
    }
}


// Função para identificar onde o item deve ser inserido dentro da lista
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

// Evento para adicionar tarefas
document.getElementById('taskForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;

    try {
        const response = await fetch('http://localhost:3000/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, completed: false }),
        });

        if (response.ok) {
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

// Busca as tarefas ao carregar a página
document.addEventListener('DOMContentLoaded', fetchTasks);

// Evento de drop na lista de "Tarefas"
pendingTasks.addEventListener('drop', (e) => {
    e.preventDefault(); // Impede o comportamento padrão de soltar
    updateTaskCompletion(draggedTask, false); // Move a tarefa de volta para 'pendente'
});

// Evento de drop na lista de "Concluídas"
completedTasks.addEventListener('drop', (e) => {
    e.preventDefault(); // Impede o comportamento padrão de soltar
    updateTaskCompletion(draggedTask, true); // Marca a tarefa como 'concluída'
});