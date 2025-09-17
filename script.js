// ======= Max Heap Implementation =======
class MaxHeap {
  constructor() {
    this.heap = [];
  }

  insert(task) {
    this.heap.push(task);
    this.bubbleUp();
  }

  bubbleUp() {
    let index = this.heap.length - 1;
    while (index > 0) {
      let parent = Math.floor((index - 1) / 2);
      if (this.heap[index].priority <= this.heap[parent].priority) break;
      [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
      index = parent;
    }
  }

  extractMax() {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop();
    const max = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown(0);
    return max;
  }

  bubbleDown(index) {
    const length = this.heap.length;
    const element = this.heap[index];

    while (true) {
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let swap = null;

      if (left < length && this.heap[left].priority > element.priority) swap = left;
      if (right < length && this.heap[right].priority > (swap === null ? element.priority : this.heap[left].priority)) swap = right;

      if (swap === null) break;

      [this.heap[index], this.heap[swap]] = [this.heap[swap], this.heap[index]];
      index = swap;
    }
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  getTasks() {
    return [...this.heap]; // Return a copy
  }
}

// ======= Main Scheduler Logic =======
const taskHeap = new MaxHeap();

// Add Task
document.getElementById("taskForm").addEventListener("submit", function(e){
  e.preventDefault();

  const name = document.getElementById("taskName").value;
  const priority = parseInt(document.getElementById("taskPriority").value);
  const time = parseInt(document.getElementById("taskTime").value);
  const deadline = parseInt(document.getElementById("taskDeadline").value) || Infinity;

  taskHeap.insert({name, priority, time, deadline});
  renderTasks();
  renderGanttChart();

  this.reset();
});

// Render Task List
function renderTasks() {
  const taskList = document.getElementById("taskList");
  const tasks = taskHeap.getTasks();
  taskList.innerHTML = "<h3>Task List</h3>";

  // Calculate cumulative turnaround time for remaining time
  let cumulativeTime = 0;
  tasks.forEach((task, index) => {
    task.waitingTime = cumulativeTime;
    cumulativeTime += task.time;
    task.turnaroundTime = cumulativeTime;

    task.remainingTime = task.deadline - task.turnaroundTime;

    taskList.innerHTML += `<div class="taskItem">
      ${index + 1}. ${task.name} | Priority: ${task.priority} | Time: ${task.time} min | Deadline: ${task.deadline === Infinity ? "N/A" : task.deadline} min
      | Remaining: ${task.remainingTime > 0 ? task.remainingTime + " min" : "⚠️ Missed"}
    </div>`;
  });
}

// Render Gantt Chart
function renderGanttChart() {
  const gantt = document.getElementById("ganttChart");
  gantt.innerHTML = "";

  let heapCopy = taskHeap.getTasks().sort((a, b) => b.priority - a.priority);

  let cumulativeTime = 0;
  heapCopy.forEach((task, index) => {
    task.waitingTime = cumulativeTime;
    cumulativeTime += task.time;
    task.turnaroundTime = cumulativeTime;

    task.skipped = (task.turnaroundTime > task.deadline);
    task.remainingTime = task.deadline - task.turnaroundTime;

    const bar = document.createElement("div");
    bar.classList.add("ganttBar");
    bar.style.width = `${task.time * 20}px`;

    // Skipped/missed
    if(task.skipped) {
      bar.classList.add('skipped');
      bar.innerText = task.name + " ⚠️";
    } else {
      bar.style.backgroundColor = getRandomColor();
      bar.innerText = task.name;
    }

    // Current running
    if(index === 0 && !task.skipped) bar.classList.add("current");

    // Near deadline warning (<=10 min)
    if(!task.skipped && task.remainingTime <= 10) {
      bar.classList.add("nearDeadline");
      alert(`⚠️ Task "${task.name}" is nearing its deadline! Only ${task.remainingTime} min left.`);
    }

    // Tooltip
    bar.title = `Task: ${task.name}
Priority: ${task.priority}
Execution Time: ${task.time} min
Deadline: ${task.deadline === Infinity ? "N/A" : task.deadline} min
Remaining Time: ${task.remainingTime > 0 ? task.remainingTime + " min" : "Missed"}`;

    gantt.appendChild(bar);
  });

  console.table(heapCopy.map(t => ({
    Task: t.name,
    Priority: t.priority,
    ExecutionTime: t.time,
    WaitingTime: t.waitingTime,
    TurnaroundTime: t.turnaroundTime,
    RemainingTime: t.remainingTime,
    Skipped: t.skipped
  })));
}

// Random Color Generator
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for(let i = 0; i < 6; i++){
    color += letters[Math.floor(Math.random()*16)];
  }
  return color;
}

