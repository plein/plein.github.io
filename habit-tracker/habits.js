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
        li.className = 'list-group-item';
        li.textContent = name;
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

    loadHabits();
})();
