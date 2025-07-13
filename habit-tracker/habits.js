(function() {
    const form = document.getElementById('habit-form');
    const input = document.getElementById('habit-input');
    const list = document.getElementById('habit-list');

    let habits = [];

    function saveHabits() {
        localStorage.setItem('habits', JSON.stringify(habits));
    }

    function addHabit(name) {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.dataset.name = name;

        const span = document.createElement('span');
        span.textContent = name;
        li.appendChild(span);

        const btn = document.createElement('button');
        btn.className = 'btn btn-sm btn-danger remove-habit';
        btn.textContent = 'Remove';
        li.appendChild(btn);

        list.appendChild(li);
    }

    function loadHabits() {
        const stored = localStorage.getItem('habits');
        if (stored) {
            try {
                habits = JSON.parse(stored);
                habits.forEach(addHabit);
            } catch(e) {
                console.error('Failed to parse habits from localStorage');
            }
        }
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = input.value.trim();
        if (!name) return;
        const exists = habits.some(h => h.toLowerCase() === name.toLowerCase());
        if (exists) {
            alert('Habit with this name already exists');
            return;
        }
        habits.push(name);
        addHabit(name);
        saveHabits();
        input.value = '';
    });

    list.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-habit')) {
            const li = e.target.closest('li');
            const name = li.dataset.name;
            const confirmDelete = confirm(`Delete habit "${name}"?`);
            if (confirmDelete) {
                habits = habits.filter(h => h !== name);
                li.remove();
                saveHabits();
            }
        }
    });

    document.getElementById('clear-storage').addEventListener('click', function() {
        const msg = 'This will permanently delete all your habits and cannot be undone. Continue?';
        if (confirm(msg)) {
            localStorage.removeItem('habits');
            habits = [];
            list.innerHTML = '';
        }
    });

    loadHabits();
})();
