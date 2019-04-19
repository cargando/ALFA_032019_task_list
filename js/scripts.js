window.echo = function () {
	console.log.apply(this, arguments);
};

var DANGER = 'danger';

var STATE = {
	taskList: [], // - список задач
	formState: 'add', // [ add, edit, err ] - состояние формы - редактирование или добавление данных
	isOpenedPopup: false, // true / false - флаг открыто / закрыто модальное окно
	formData: { // данные формы
		taskName: null, // название задачи
		taskDescription: null, // описание
		taskDate: null, // дата задачи
		taskUrgent: false, // важность задачи
	}
};

function collectDataFromForm() {
	STATE.formData.taskName = document.getElementById('taskName').value;
	STATE.formData.taskDescription = document.getElementById('taskDescription').value;
	STATE.formData.taskDate = document.getElementById('taskDate').value;
	STATE.formData.taskUrgent = document.getElementById('taskUrgent').checked;

}

function clearForm() {
	document.getElementById('taskName').value = '';
	document.getElementById('taskDescription').value = '';
	document.getElementById('taskDate').value = '';
	document.getElementById('taskUrgent').checked = false;
	highlightFormField('taskName');
	highlightFormField('taskDate');
}

function pushDataToList() {
	STATE.taskList.push(STATE.formData);
	STATE.formData = {
		taskName: null,
		taskDescription: null,
		taskDate: null,
		taskUrgent: false,
	}
}

function handleAddTask() {
	collectDataFromForm();
	var checkResult = validateDateFromForm();
	if(checkResult.length) {
		checkResult.forEach(function (item) {
			highlightFormField(item, DANGER, 'Это поле обязательно для заполнения');
		});
		return false;
	}
	pushDataToList();
	clearForm();
	echo('handleAddTask: done, new STATE = ', STATE);

}

function highlightFormField(id, tp, msg) {
	var message = msg || '';
	var dangerClass = 'text-danger';
	var mutedClass = 'text-muted';
	var formDangerClass = 'is-invalid';
	var type = tp == DANGER ? dangerClass : mutedClass;

	var htmlId = '';
	switch (id) {
		case 'taskName': htmlId = 'taskHelp'; break;
		case 'taskDescription': htmlId = 'descriptionHelp'; break;
		case 'taskDate': htmlId = 'helpTaskDate'; break;
	}
	var helper = document.getElementById(htmlId);
	helper.classList.remove(dangerClass);
	helper.classList.remove(mutedClass);
	helper.classList.add(type);
	helper.innerText = message;

	var input = document.getElementById(id);
	var label = input.closest('.form-group').getElementsByTagName('label')[0];
	if(tp == 'danger') { // добавляем или удалем бордюр вокруг поля для ввода текста
		input.classList.add(formDangerClass);
		label.classList.add(dangerClass);
	} else {
		input.classList.remove(formDangerClass);
		label.classList.remove(dangerClass);
	}
}

function validateDateFromForm() {
	var retVal = [];
	if(!STATE.formData.taskName.length) {
		retVal.push('taskName');
	}
	if(!STATE.formData.taskDate.length) {
		retVal.push('taskDate');
	}
	return retVal;
}