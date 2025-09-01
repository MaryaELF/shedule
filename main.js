class StudentSchedule {
    constructor() {
        // Начальная дата (можно изменить на нужную)
        this.startDate = new Date('2025-08-25');
        this.currentWeek = this.loadCurrentWeek() || 1;
        this.isEditMode = false;
        this.selectedCells = new Set();
        this.scheduleData = this.loadScheduleData();
        this.academicYear = this.getAcademicYear();
        this.init();
    }

    init() {
        this.generateSchedule();
        this.setupEventListeners();
        this.addQuickActions();
    }

    // Метод для получения дат недели
    getWeekDates(weekNumber) {
        const start = new Date(this.startDate);
        start.setDate(start.getDate() + (weekNumber - 1) * 7);
        
        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        
        return {
            start: start,
            end: end,
            formatted: this.formatDateRange(start, end)
        };
    }

    // Форматирование даты в формате DD.MM
    formatDate(date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}.${month}`;
    }

    // Форматирование диапазона дат
    formatDateRange(start, end) {
        return `${this.formatDate(start)} - ${this.formatDate(end)}`;
    }

    // Получение названия дня недели с датой
    getDayWithDate(dayIndex, weekNumber) {
        const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        const weekDates = this.getWeekDates(weekNumber);
        
        const dayDate = new Date(weekDates.start);
        dayDate.setDate(dayDate.getDate() + dayIndex);
        
        return `${daysOfWeek[dayIndex]} (${this.formatDate(dayDate)})`;
    }

    // Метод для получения учебного года
    getAcademicYear() {
        const startYear = this.startDate.getFullYear();
        const endYear = this.startDate.getMonth() >= 8 ? startYear + 1 : startYear;
        return `${startYear}-${endYear}`;
    }

    generateSchedule() {
        const times = [
            '08:30-10:00', '10:10-11:40', '11:50-13:20',
            '13:50-15:20', '15:30-17:00', '17:10-18:40',
            '18:50-20:20'
        ];
        
        const scheduleBody = document.getElementById('scheduleBody');
        scheduleBody.innerHTML = '';

        // Получаем даты текущей недели
        const weekDates = this.getWeekDates(this.currentWeek);
        
        // Обновляем заголовок с датами
        document.getElementById('currentWeek').textContent = weekDates.formatted;
        document.getElementById('currentWeek').dataset.weekNumber = this.currentWeek;

        // Создаем секции для каждого дня
        for (let dayIndex = 0; dayIndex < 6; dayIndex++) {
            // Создаем секцию для дня
            const daySection = document.createElement('div');
            daySection.className = 'day-section';
            
            // Заголовок дня с датой
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = this.getDayWithDate(dayIndex, this.currentWeek);
            daySection.appendChild(dayHeader);
            
            // Контейнер для занятий
            const dayLessons = document.createElement('div');
            dayLessons.className = 'day-lessons';
            
            // Добавляем занятия для каждого времени
            times.forEach((time, timeIndex) => {
                const lessonRow = document.createElement('div');
                lessonRow.className = 'lesson-row';
                
                // Ячейка времени
                const timeCell = document.createElement('div');
                timeCell.className = 'lesson-time';
                timeCell.textContent = time;
                lessonRow.appendChild(timeCell);
                
                // Ячейка с содержанием занятия
                const contentCell = document.createElement('div');
                contentCell.className = 'lesson-content';
                contentCell.dataset.time = timeIndex;
                contentCell.dataset.day = dayIndex;
                contentCell.dataset.week = this.currentWeek;
                contentCell.onclick = () => this.handleCellClick(contentCell);
                
                const lesson = this.scheduleData[this.currentWeek]?.[dayIndex]?.[timeIndex];
                
                if (lesson) {
                    contentCell.classList.add('has-lesson');
                    const lessonDetails = document.createElement('div');
                    lessonDetails.className = 'lesson-details';
                    lessonDetails.style.setProperty('--lesson-color', lesson.color);
                    
                    lessonDetails.innerHTML = `
                        <h4>${lesson.name}</h4>
                        <p>${lesson.teacher}</p>
                        <p>${lesson.room}</p>
                        <small>${this.getTypeText(lesson.type)}</small>
                    `;
                    
                    contentCell.appendChild(lessonDetails);
                } else {
                    const emptyText = document.createElement('div');
                    emptyText.className = 'empty-lesson';
                    contentCell.appendChild(emptyText);
                }
                
                lessonRow.appendChild(contentCell);
                dayLessons.appendChild(lessonRow);
            });
            
            daySection.appendChild(dayLessons);
            scheduleBody.appendChild(daySection);
        }
    }

    handleCellClick(cell) {
        if (!this.isEditMode) return;

        const modal = document.getElementById('editModal');
        const form = document.getElementById('lessonForm');
        const deleteBtn = document.getElementById('deleteLesson');

        const [week, day, time] = [cell.dataset.week, cell.dataset.day, cell.dataset.time];
        const lesson = this.scheduleData[week]?.[day]?.[time];

        document.getElementById('editCellId').value = `${week}-${day}-${time}`;
        document.getElementById('lessonName').value = lesson?.name || '';
        document.getElementById('lessonTeacher').value = lesson?.teacher || '';
        document.getElementById('lessonRoom').value = lesson?.room || '';
        document.getElementById('lessonType').value = lesson?.type || 'lecture';
        document.getElementById('lessonColor').value = lesson?.color || '#8E89A7';

        deleteBtn.style.display = lesson ? 'block' : 'none';
        modal.style.display = 'block';

        form.onsubmit = (e) => {
            e.preventDefault();
            this.saveLesson();
        };
    }

    saveLesson() {
        const cellId = document.getElementById('editCellId').value;
        const [week, day, time] = cellId.split('-').map(Number);

        if (!this.scheduleData[week]) this.scheduleData[week] = {};
        if (!this.scheduleData[week][day]) this.scheduleData[week][day] = {};

        this.scheduleData[week][day][time] = {
            name: document.getElementById('lessonName').value,
            teacher: document.getElementById('lessonTeacher').value,
            room: document.getElementById('lessonRoom').value,
            type: document.getElementById('lessonType').value,
            color: document.getElementById('lessonColor').value
        };

        this.saveScheduleData();
        this.saveCurrentWeek();
        this.generateSchedule();
        this.closeModal();
    }

    deleteLesson() {
        const cellId = document.getElementById('editCellId').value;
        const [week, day, time] = cellId.split('-').map(Number);

        if (this.scheduleData[week]?.[day]?.[time]) {
            delete this.scheduleData[week][day][time];
            this.saveScheduleData();
            this.saveCurrentWeek();
            this.generateSchedule();
            this.closeModal();
        }
    }

    closeModal() {
        document.getElementById('editModal').style.display = 'none';
    }

    setupEventListeners() {
        document.getElementById('prevWeek').addEventListener('click', () => {
            if (this.currentWeek > 1) {
                this.currentWeek--;
                this.saveCurrentWeek();
                this.generateSchedule();
            }
        });

        document.getElementById('nextWeek').addEventListener('click', () => {
            this.currentWeek++;
            this.saveCurrentWeek();
            this.generateSchedule();
        });

        document.getElementById('editMode').addEventListener('click', () => {
            this.isEditMode = !this.isEditMode;
            this.toggleEditMode();
        });

        document.getElementById('duplicateBtn').addEventListener('click', () => {
            this.openDuplicateModal();
        });

        document.getElementById('currentWeekBtn').addEventListener('click', () => {
            this.goToCurrentWeek();
        });

        document.getElementById('confirmClearYes').addEventListener('click', () => {
            this.handleClearConfirmation(true);
        });

        document.getElementById('confirmClearNo').addEventListener('click', () => {
            this.handleClearConfirmation(false);
        });

        document.getElementById('duplicateType').addEventListener('change', (e) => {
            document.getElementById('daysSelection').style.display = 
                e.target.value === 'selected' ? 'block' : 'none';
        });

        document.getElementById('duplicateForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.duplicateLessons();
        });

        document.getElementById('cancelDuplicate').addEventListener('click', () => {
            this.closeDuplicateModal();
        });

        document.getElementById('cancelEdit').addEventListener('click', () => this.closeModal());
        document.getElementById('deleteLesson').addEventListener('click', () => this.deleteLesson());

        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('editModal')) {
                this.closeModal();
            }
            if (e.target === document.getElementById('duplicateModal')) {
                this.closeDuplicateModal();
            }
            if (e.target === document.getElementById('confirmClearModal')) {
                this.handleClearConfirmation();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (this.isEditMode && e.ctrlKey) {
                this.enableMultiSelect();
            }
        });

        document.addEventListener('keyup', (e) => {
            if (!e.ctrlKey) {
                this.disableMultiSelect();
            }
        });
    }

    toggleEditMode() {
        const btn = document.getElementById('editMode');
        const cells = document.querySelectorAll('.lesson-content');
        
        if (this.isEditMode) {
            btn.textContent = 'Завершить редактирование';
            btn.style.background = '#f44336';
            cells.forEach(cell => cell.style.cursor = 'pointer');
        } else {
            btn.textContent = 'Редактировать';
            btn.style.background = '#8E89A7';
            cells.forEach(cell => cell.style.cursor = 'default');
            this.disableMultiSelect();
        }
    }

    getTypeText(type) {
        const types = {
            'lecture': 'Лекция',
            'lecture online': 'Лекция онлайн',
            'practice': 'Практика',
            'lab': 'Лаб. работа'
        };
        return types[type] || type;
    }

    loadScheduleData() {
        const saved = localStorage.getItem('studentSchedule');
        return saved ? JSON.parse(saved) : {};
    }

    saveScheduleData() {
        localStorage.setItem('studentSchedule', JSON.stringify(this.scheduleData));
    }

    loadCurrentWeek() {
        const savedWeek = localStorage.getItem('currentWeek');
        return savedWeek ? parseInt(savedWeek) : null;
    }

    saveCurrentWeek() {
        localStorage.setItem('currentWeek', this.currentWeek.toString());
    }

    openDuplicateModal() {
        const sourceWeek = this.currentWeek;
        const sourceDates = this.getWeekDates(sourceWeek);
        
        document.getElementById('sourceWeek').value = sourceWeek;
        document.getElementById('sourceWeek').dataset.dates = sourceDates.formatted;
        
        const label = document.querySelector('label[for="sourceWeek"]');
        if (label) {
            label.textContent = `С недели: ${sourceDates.formatted}`;
        }
        
        document.getElementById('duplicateModal').style.display = 'block';
    }

    closeDuplicateModal() {
        document.getElementById('duplicateModal').style.display = 'none';
    }

    duplicateLessons() {
        const sourceWeek = parseInt(document.getElementById('sourceWeek').value);
        const targetWeeksInput = document.getElementById('targetWeeks').value;
        const duplicateType = document.getElementById('duplicateType').value;
        
        const targetWeeks = targetWeeksInput.split(',')
            .map(w => parseInt(w.trim()))
            .filter(w => !isNaN(w) && w > 0);

        if (targetWeeks.length === 0) {
            this.showNotification('Укажите целевые недели!', 'error');
            return;
        }

        let daysToDuplicate = [];
        if (duplicateType === 'selected') {
            daysToDuplicate = Array.from(document.querySelectorAll('input[name="day"]:checked'))
                .map(checkbox => parseInt(checkbox.value));
        } else {
            daysToDuplicate = [0, 1, 2, 3, 4, 5];
        }

        const sourceData = this.scheduleData[sourceWeek];
        if (!sourceData) {
            this.showNotification('Нет данных для выбранной недели!', 'error');
            return;
        }

        let duplicatedCount = 0;

        targetWeeks.forEach(targetWeek => {
            if (!this.scheduleData[targetWeek]) {
                this.scheduleData[targetWeek] = {};
            }

            daysToDuplicate.forEach(day => {
                if (sourceData[day]) {
                    this.scheduleData[targetWeek][day] = { ...sourceData[day] };
                    duplicatedCount += Object.keys(sourceData[day]).length;
                }
            });
        });

        this.saveScheduleData();
        this.saveCurrentWeek();
        this.closeDuplicateModal();
        this.showNotification(`Дублировано ${duplicatedCount} занятий на ${targetWeeks.length} недель!`);
        
        if (targetWeeks.includes(this.currentWeek)) {
            this.generateSchedule();
        }
    }

    enableMultiSelect() {
        const cells = document.querySelectorAll('.lesson-content.has-lesson');
        cells.forEach(cell => {
            cell.style.cursor = 'cell';
            cell.onclick = () => this.toggleCellSelection(cell);
        });
    }

    disableMultiSelect() {
        const cells = document.querySelectorAll('.lesson-content');
        cells.forEach(cell => {
            cell.style.cursor = this.isEditMode ? 'pointer' : 'default';
            cell.onclick = () => this.handleCellClick(cell);
            cell.style.border = '';
        });
        this.selectedCells.clear();
    }

    toggleCellSelection(cell) {
        const cellId = `${cell.dataset.week}-${cell.dataset.day}-${cell.dataset.time}`;
        
        if (this.selectedCells.has(cellId)) {
            this.selectedCells.delete(cellId);
            cell.style.border = '';
        } else {
            this.selectedCells.add(cellId);
            cell.style.border = '2px solid #ff5722';
        }
    }

    duplicateSelectedLessons(targetWeek) {
        if (this.selectedCells.size === 0) {
            this.showNotification('Выберите занятия для дублирования!', 'error');
            return;
        }

        if (!this.scheduleData[targetWeek]) {
            this.scheduleData[targetWeek] = {};
        }

        let duplicatedCount = 0;

        this.selectedCells.forEach(cellId => {
            const [sourceWeek, day, time] = cellId.split('-').map(Number);
            const lesson = this.scheduleData[sourceWeek]?.[day]?.[time];
            
            if (lesson) {
                if (!this.scheduleData[targetWeek][day]) {
                    this.scheduleData[targetWeek][day] = {};
                }
                
                this.scheduleData[targetWeek][day][time] = { ...lesson };
                duplicatedCount++;
            }
        });

        this.saveScheduleData();
        this.saveCurrentWeek();
        this.showNotification(`Дублировано ${duplicatedCount} занятий на неделю ${targetWeek}!`);
        this.disableMultiSelect();
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    addQuickActions() {
        const quickActions = `
            <div class="bulk-actions">
                <button onclick="studentSchedule.duplicateToNextWeek()">Дублировать на след. неделю</button>
                <button onclick="studentSchedule.clearCurrentWeek()">Очистить текущую неделю</button>
            </div>
        `;
        
        document.getElementById('quickActions').innerHTML = quickActions;
    }

    duplicateToNextWeek() {
        const targetWeek = this.currentWeek + 1;
        this.duplicateLessonsToWeek(this.currentWeek, targetWeek);
        this.saveCurrentWeek();
        this.showNotification(`Расписание дублировано на неделю ${targetWeek}!`);
    }

    duplicateLessonsToWeek(sourceWeek, targetWeek) {
        if (!this.scheduleData[sourceWeek]) return;

        this.scheduleData[targetWeek] = JSON.parse(JSON.stringify(this.scheduleData[sourceWeek]));
        this.saveScheduleData();
        this.saveCurrentWeek();
        
        if (targetWeek === this.currentWeek) {
            this.generateSchedule();
        }
    }

    clearCurrentWeek() {
    // Показываем кастомное модальное окно вместо браузерного confirm
        document.getElementById('confirmClearModal').style.display = 'block';
    }

    // Добавьте этот метод для обработки подтверждения очистки
    handleClearConfirmation(confirmed) {
        document.getElementById('confirmClearModal').style.display = 'none';
        
        if (confirmed) {
            // Полностью очищаем данные для текущей недели
            this.scheduleData[this.currentWeek] = {};
            this.saveScheduleData();
            this.generateSchedule();
            this.showNotification('Неделя очищена!');
        }
    }

    goToCurrentWeek() {
        const today = new Date();
        const start = new Date(this.startDate);
        
        const diffTime = today - start;
        const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;
        
        this.currentWeek = Math.max(1, diffWeeks);
        this.saveCurrentWeek();
        this.generateSchedule();
        this.showNotification('Переход к текущей неделе');
    }

    getCurrentWeekNumber() {
        const today = new Date();
        const start = new Date(this.startDate);
        const diffTime = today - start;
        return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7)) + 1;
    }
}

// Инициализация
let studentSchedule;

document.addEventListener('DOMContentLoaded', () => {
    studentSchedule = new StudentSchedule();
});