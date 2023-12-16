const toggleTheme = () => {
  const body = document.body;
  body.classList.toggle("dark_mode");

  const isDarkMode = body.classList.contains("dark_mode");
  document.querySelector('.theme-toggle').textContent = isDarkMode ? "☀️" : "🌙";
}

const addEditDeleteButtons = (task_elem) => {
    const editBtn = $('<span>')
        .addClass('edit-btn')
        .text('edit/')
        .on('click', () => {
            const updatedTask = prompt('Редактировать задание:', task_elem.find('span.task-text').text());
            if (updatedTask !== null) {
                task_elem.find('span.task-text').text(updatedTask);
            }
        });

    const deleteBtn = $('<span>')
        .addClass('edit-btn')
        .text('delete')
        .on('click', () => {
            if (task_elem.hasClass('important')) {
                $('#deleteModal').show();
                $('#confirmDelete').on('click', () => {
                    task_elem.remove();
                    $('#deleteModal').hide();
                });
                $('#cancelDelete').on('click', () => {
                    $('#deleteModal').hide();
                });
            } else {
                task_elem.remove();
            }
        });

    task_elem.append(editBtn).append(deleteBtn);
}

const fetchUserData = async (userId) => {
    const userUrl = `https://jsonplaceholder.typicode.com/users/${userId}`;
    try {
        const response = await fetch(userUrl);
        const user = await response.json();
        return user.name;
    } catch (error) {
        return 'Unknown User';
    }
}

const showError = (message) => {
    $('#userIdError').text(message);
}

$('#taskForm').on('submit', async function(e) {
    e.preventDefault();

    const title = $('#title').val();
    const body = $('#body').val();
    const userId = $('#userId').val();
    const isImportant = $('#important').prop('checked');

    if (userId > 0 || userId < 11) {
        showError('');
    } else {
        showError('Введите корректный ID пользователя (1-10).');
        return;
    }

    const task_elem = $('<div>')
        .addClass('task')
        .append('<input type="checkbox">')
        .append(`<span class="task-text">${title}</span>`)
        .append('<div class="creator"></div>');

    if (isImportant) {
        task_elem.addClass('important');
    }

    addEditDeleteButtons(task_elem);

    if (isImportant) {
        $('#tasks').prepend(task_elem);
    } else {
        $('#tasks').append(task_elem);
    }

    const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: title,
            body: body,
            userId: userId,
            completed: false
        })
    });

    const data = await response.json();
    const creatorName = await fetchUserData(userId);
    task_elem.find('.creator').text(`Created by: ${creatorName}`);
    console.log(data);
    console.log(JSON.stringify(data));
});

$('body').on('click', 'input[type="checkbox"]', function() {
    const task = $(this).parents('.task');
    if(task.hasClass('strikeout')) {
        task.removeClass('strikeout');
        if (task.hasClass('important')) {
            task.prependTo($('#tasks'));
        } else {
            task.appendTo($('#tasks'));
        }
    } else {
        task.addClass('strikeout');
        task.appendTo($('#done'));
    }
});

$('#tasks, #done').on('mouseenter', '.task', function() {
    $(this).find('.edit-btn').show();
});

$('#tasks, #done').on('mouseleave', '.task', function() {
    $(this).find('.edit-btn').hide();
});

let savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    $('body').addClass(`${savedTheme}-mod`);
    if (savedTheme === 'dark') {
        $('#modal-btn.cancel, #taskForm button, #title, #body, #userId, #important').css('background-color', '#333');
        $('#modal-btn.cancel, #taskForm button, #title, #body, #userId, #important').css('color', '#fff');
    }
}
