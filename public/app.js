const list = document.getElementById('list');
const form = document.getElementById('form');
const titleInput = document.getElementById('title');
const errorEl = document.getElementById('error');
const emptyEl = document.getElementById('empty');
const statsEl = document.getElementById('stats');

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'حدث خطأ');
  }
  return res.status === 204 ? null : res.json();
}

function render(tasks) {
  list.innerHTML = '';
  for (const task of tasks) {
    const li = document.createElement('li');
    li.className = task.done ? 'done' : '';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.done;
    checkbox.setAttribute('aria-label', task.title);
    checkbox.addEventListener('change', () => run(() =>
      api(`/api/tasks/${task.id}`, { method: 'PATCH', body: JSON.stringify({ done: checkbox.checked }) })
    ));

    const span = document.createElement('span');
    span.textContent = task.title;

    const del = document.createElement('button');
    del.className = 'delete';
    del.textContent = 'حذف';
    del.addEventListener('click', () => run(() => api(`/api/tasks/${task.id}`, { method: 'DELETE' })));

    li.append(checkbox, span, del);
    list.append(li);
  }
  const done = tasks.filter((t) => t.done).length;
  statsEl.textContent = tasks.length ? `${done} من ${tasks.length} مكتملة` : '';
  emptyEl.hidden = tasks.length > 0;
}

async function refresh() {
  render(await api('/api/tasks'));
}

async function run(action) {
  errorEl.textContent = '';
  try {
    await action();
    await refresh();
  } catch (err) {
    errorEl.textContent = err.message;
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = titleInput.value;
  run(async () => {
    await api('/api/tasks', { method: 'POST', body: JSON.stringify({ title }) });
    titleInput.value = '';
  });
});

run(() => Promise.resolve());
