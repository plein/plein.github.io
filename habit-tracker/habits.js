(function() {
    const form = document.getElementById('habit-form');
    const input = document.getElementById('habit-input');
    const list = document.getElementById('habit-list');
    const toggleEdit = document.getElementById('toggle-edit');

    let editMode = false;

    function updateEditVisibility() {
        toggleEdit.textContent = editMode ? 'Done' : 'Edit Mode';
        document.querySelectorAll('.edit-only').forEach(el => {
            el.classList.toggle('d-none', !editMode);
        });
    }

    let habits = [];

    function normalizeStored(data) {
        return data.map(h => {
            if (typeof h === 'string') {
                return { name: h, history: [] };
            }
            if (!h.history) h.history = [];
            if (!h.goal) h.goal = null;
            return h;
        });
    }

    function saveHabits() {
        localStorage.setItem('habits', JSON.stringify(habits));
    }

    function localInputValue(date) {
        const pad = n => String(n).padStart(2, '0');
        const y = date.getFullYear();
        const m = pad(date.getMonth() + 1);
        const d = pad(date.getDate());
        const h = pad(date.getHours());
        const min = pad(date.getMinutes());
        return `${y}-${m}-${d}T${h}:${min}`;
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

        const goalBtn = document.createElement('button');
        goalBtn.className = 'btn btn-sm btn-outline-primary me-2 set-goal edit-only';
        goalBtn.textContent = 'Goal';
        btnGroup.appendChild(goalBtn);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn btn-sm btn-danger remove-habit edit-only';
        removeBtn.textContent = 'Remove';
        btnGroup.appendChild(removeBtn);

        header.appendChild(btnGroup);
        li.appendChild(header);

        const count = document.createElement('small');
        count.className = 'text-muted habit-count';
        li.appendChild(count);

        const goalInfo = document.createElement('div');
        goalInfo.className = 'text-muted small habit-goal';
        li.appendChild(goalInfo);

        const progressInfo = document.createElement('div');
        progressInfo.className = 'text-muted small habit-progress';
        li.appendChild(progressInfo);

        const editor = document.createElement('div');
        editor.className = 'goal-editor border rounded p-2 mt-2 d-none';
        editor.innerHTML = `
            <div class="mb-2">
                <label class="form-label mb-1">Period</label>
                <select class="form-select form-select-sm goal-period">
                    <option value="day">Day</option>
                    <option value="week">Week</option>
                </select>
            </div>
            <div class="mb-2">
                <label class="form-label mb-1">Comparison</label>
                <select class="form-select form-select-sm goal-comparator">
                    <option value="<">Less than</option>
                    <option value="=">Exactly</option>
                    <option value=">">More than</option>
                </select>
            </div>
            <div class="mb-2">
                <label class="form-label mb-1">Times</label>
                <input type="number" min="1" value="1" class="form-control form-control-sm goal-times">
            </div>
            <div class="mt-2">
                <button class="btn btn-sm btn-primary me-2 save-goal">Save</button>
                <button class="btn btn-sm btn-secondary cancel-goal">Cancel</button>
            </div>`;
        li.appendChild(editor);

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
        updateEditVisibility();
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

    function countInPeriod(habit) {
        if (!habit.goal) return 0;
        const now = new Date();
        let start;
        if (habit.goal.period === 'day') {
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        } else {
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        }
        return habit.history.filter(ts => new Date(ts) >= start).length;
    }

    function goalMet(habit, count) {
        if (!habit.goal) return false;
        const cmp = habit.goal.comparator;
        const t = habit.goal.times;
        if (cmp === '<') return count < t;
        if (cmp === '=') return count === t;
        return count > t;
    }

    function goalText(habit) {
        if (!habit.goal) return 'No goal set';
        const map = { '<': 'Less than', '>': 'More than', '=': 'Exactly' };
        return `Goal: ${map[habit.goal.comparator]} ${habit.goal.times} per ${habit.goal.period}`;
    }

    function updateHabitDisplay(li, habit) {
        const countEl = li.querySelector('.habit-count');
        countEl.textContent = `Tracked ${habit.history.length} times`;
        li.querySelector('.habit-goal').textContent = goalText(habit);
        if (habit.goal) {
            const c = countInPeriod(habit);
            const met = goalMet(habit, c);
            li.querySelector('.habit-progress').textContent = `This ${habit.goal.period}: ${c} (${met ? 'goal met' : 'goal not met'})`;
        } else {
            li.querySelector('.habit-progress').textContent = '';
        }

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
            editBtn.className = 'btn btn-sm btn-outline-secondary me-1 edit-entry edit-only';
            editBtn.textContent = 'Edit';
            editBtn.dataset.ts = ts;
            btnWrap.appendChild(editBtn);

            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn btn-sm btn-outline-danger remove-entry edit-only';
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
        updateEditVisibility();
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
                const defaultVal = localInputValue(new Date(oldTs));
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
        } else if (e.target.classList.contains('set-goal')) {
            const editor = habitLi.querySelector('.goal-editor');
            editor.classList.toggle('d-none');
            editor.querySelector('.goal-period').value = habit.goal ? habit.goal.period : 'day';
            editor.querySelector('.goal-comparator').value = habit.goal ? habit.goal.comparator : '<';
            editor.querySelector('.goal-times').value = habit.goal ? habit.goal.times : 1;
        } else if (e.target.classList.contains('save-goal')) {
            const editor = e.target.closest('.goal-editor');
            const period = editor.querySelector('.goal-period').value;
            const cmp = editor.querySelector('.goal-comparator').value;
            const t = parseInt(editor.querySelector('.goal-times').value, 10);
            if (isNaN(t) || t <= 0) {
                alert('Invalid times');
                return;
            }
            habit.goal = { period, comparator: cmp, times: t };
            saveHabits();
            updateHabitDisplay(habitLi, habit);
            editor.classList.add('d-none');
        } else if (e.target.classList.contains('cancel-goal')) {
            const editor = e.target.closest('.goal-editor');
            editor.classList.add('d-none');
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

    toggleEdit.addEventListener('click', function() {
        editMode = !editMode;
        updateEditVisibility();
    });

    loadHabits();
    updateEditVisibility();
})();
