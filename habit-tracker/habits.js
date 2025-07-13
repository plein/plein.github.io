(function() {
    const form = document.getElementById('habit-form');
    const input = document.getElementById('habit-input');
    const list = document.getElementById('habit-list');

    let habits = [];

    function normalizeStored(data) {
        return data.map(h => {
            if (typeof h === 'string') {
                return { name: h, history: [] };
            }
            if (!h.history) h.history = [];
            return h;
        });
    }

    function saveHabits() {
        localStorage.setItem('habits', JSON.stringify(habits));
    }

    function renderHabit(habit) {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.dataset.name = habit.name;

        const header = document.createElement('div');
        header.className = 'd-flex justify-content-between align-items-center';

        const span = document.createElement('span');
        span.textContent = habit.name;
        header.appendChild(span);

        const btnGroup = document.createElement('div');

        const trackBtn = document.createElement('button');
        trackBtn.className = 'btn btn-sm btn-success me-2 track-habit';
        trackBtn.textContent = 'Track';
        btnGroup.appendChild(trackBtn);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-sm btn-danger remove-habit';
        removeBtn.textContent = 'Remove';
        btnGroup.appendChild(removeBtn);

        header.appendChild(btnGroup);
        li.appendChild(header);

        const count = document.createElement('small');
        count.className = 'text-muted habit-count';
        li.appendChild(count);

        const historyList = document.createElement('ul');
        historyList.className = 'history-list list-group mt-2';
        li.appendChild(historyList);

        const loadMore = document.createElement('button');
        loadMore.className = 'btn btn-link p-0 load-more';
        loadMore.textContent = 'Load More';
        loadMore.style.display = 'none';
        li.appendChild(loadMore);

        list.appendChild(li);
        updateHabitDisplay(li, habit);
    }

    function formatHistoryDate(ts) {
        const d = new Date(ts);
        if (isNaN(d)) return ts;
        const now = new Date();
        const withYear = d.getFullYear() !== now.getFullYear();
        const month = d.toLocaleString(undefined, { month: 'short' });
        const day = d.getDate();
        const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
        return `${month} ${day}, ${time}${withYear ? ' ' + d.getFullYear() : ''}`;
    }

    function updateHabitDisplay(li, habit) {
        const countEl = li.querySelector('.habit-count');
        countEl.textContent = `Tracked ${habit.history.length} times`;

        const limit = parseInt(li.dataset.limit || '10', 10);
        const historyList = li.querySelector('.history-list');
        historyList.innerHTML = '';
        const start = Math.max(habit.history.length - limit, 0);
        const items = habit.history.slice(start).reverse();
        items.forEach(ts => {
            const item = document.createElement('li');
            item.className = 'list-group-item py-1 d-flex justify-content-between align-items-center';

            const span = document.createElement('span');
            span.textContent = formatHistoryDate(ts);
            item.appendChild(span);

            const btnWrap = document.createElement('div');

            const editBtn = document.createElement('button');
            editBtn.className = 'btn btn-sm btn-outline-secondary me-1 edit-entry';
            editBtn.textContent = 'Edit';
            editBtn.dataset.ts = ts;
            btnWrap.appendChild(editBtn);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn btn-sm btn-outline-danger remove-entry';
            removeBtn.textContent = 'Remove';
            removeBtn.dataset.ts = ts;
            btnWrap.appendChild(removeBtn);

            item.appendChild(btnWrap);
            historyList.appendChild(item);
        });

        const loadMoreBtn = li.querySelector('.load-more');
        if (habit.history.length > limit) {
            loadMoreBtn.style.display = '';
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }

    function loadHabits() {
        const stored = localStorage.getItem('habits');
        if (stored) {
            try {
                habits = normalizeStored(JSON.parse(stored));
                habits.forEach(renderHabit);
            } catch(e) {
                console.error('Failed to parse habits from localStorage');
            }
        }
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const name = input.value.trim();
        if (!name) return;
        const exists = habits.some(h => h.name.toLowerCase() === name.toLowerCase());
        if (exists) {
            alert('Habit with this name already exists');
            return;
        }
        const habit = { name, history: [] };
        habits.push(habit);
        renderHabit(habit);
        saveHabits();
        input.value = '';
    });

    list.addEventListener('click', function(e) {
        const habitLi = e.target.closest('#habit-list > li');
        if (!habitLi) return;
        const name = habitLi.dataset.name;
        const habit = habits.find(h => h.name === name);
        if (!habit) return;

        if (e.target.classList.contains('remove-entry')) {
            const ts = e.target.dataset.ts;
            const idx = habit.history.indexOf(ts);
            if (idx !== -1) {
                habit.history.splice(idx, 1);
                saveHabits();
                updateHabitDisplay(habitLi, habit);
            }
        } else if (e.target.classList.contains('edit-entry')) {
            const oldTs = e.target.dataset.ts;
            const idx = habit.history.indexOf(oldTs);
            if (idx !== -1) {
                const defaultVal = new Date(oldTs).toISOString().slice(0,16);
                const inputVal = prompt('Enter new date/time (YYYY-MM-DDTHH:MM):', defaultVal);
                if (inputVal === null) return;
                const parsed = new Date(inputVal);
                if (isNaN(parsed)) {
                    alert('Invalid date/time');
                    return;
                }
                habit.history[idx] = parsed.toISOString();
                saveHabits();
                updateHabitDisplay(habitLi, habit);
            }
        } else if (e.target.classList.contains('remove-habit')) {
            const confirmDelete = confirm(`Delete habit "${name}"?`);
            if (confirmDelete) {
                habits = habits.filter(h => h.name !== name);
                habitLi.remove();
                saveHabits();
            }
        } else if (e.target.classList.contains('track-habit')) {
            const now = new Date();
            habit.history.push(now.toISOString());
            saveHabits();
            updateHabitDisplay(habitLi, habit);
        } else if (e.target.classList.contains('load-more')) {
            const current = parseInt(habitLi.dataset.limit || '10', 10);
            habitLi.dataset.limit = (current + 10).toString();
            updateHabitDisplay(habitLi, habit);
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
