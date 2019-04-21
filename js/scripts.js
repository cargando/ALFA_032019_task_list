window.echo = function () {
	console.log.apply(this, arguments);
};

var DANGER = 'danger';

var STATE = {
	taskList: [{
		taskName: " название задачи #1",
		taskDescription: "null, // описание",
		taskDate: "25.02.2019",
		taskUrgent: false,
	}, {
		taskName: "название задачи @2",
		taskDescription: "описание",
		taskDate: "14.05.2019",
		taskUrgent: true,
	}], // - список задач
	formState: 'add', // [ add, edit, err ] - состояние формы - редактирование или добавление данных
	editIndex: null, // индекс элемента массива задач для режима редактирования

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

function handleClearForm() {
	document.getElementById('taskName').value = '';
	document.getElementById('taskDescription').value = '';
	document.getElementById('taskDate').value = '';
	document.getElementById('taskUrgent').checked = false;
	highlightFormField('taskName');
	highlightFormField('taskDate');
	updateFormText();
}

function handleClearAllTasks() {
	STATE.taskList = [];
	updateLocalStorage();
	renderTaskList();
}

function pushDataToList() {

	if (STATE.formState === "edit") {
		STATE.taskList[(STATE.editIndex)] = STATE.formData;
	} else {
		STATE.taskList.push(STATE.formData);
	}
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
	handleClearForm();
	updateLocalStorage();
	renderTaskList();

	if (STATE.formState === "edit") {
		STATE.editIndex = null;
		STATE.formState = "add";
		updateFormText();
	}
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



// TASKS FUNCTIONS //////////
function renderTaskList() {
	var listContainer = document.getElementById('tasksList');
	listContainer.innerHTML = '';
	var strResult = '';
	STATE.taskList.forEach(function (item, index){
/* Вариант №1
		var newElement = document.createElement('li');

		newElement.innerHTML = (item.taskUrgent ? '<i class="text-danger fa fa-exclamation-triangle"></i> &nbsp ' : '') +
			item.taskName + '<br /><span class="text-muted"><small>' +
			item.taskDate + '</small></span>' +
			'<span data-id="' + index + '" class="delete_ico" onclick="deleteNode(event)"><i class="fa fa-times"></i></span>';

		newElement.classList.add('list-group-item');
		listContainer.appendChild(newElement);


		 */
	// Вариант №2
		strResult += '<li class="list-group-item">' +
			(item.taskUrgent ? '<i class="text-danger fa fa-exclamation-triangle"></i> &nbsp ' : '') +
			'<a href="#">' + item.taskName + '</a><br /><span class="text-muted"><small>' +
			item.taskDate + '</small></span>' +
			'<span data-id="' + index + '" class="delete_ico" onclick="deleteNode(event)"><i class="fa fa-times"></i></span>' +
			'<span data-id="' + index + '" class="edit_ico" onclick="editNode(event)"><i class="fas fa-edit"></i></span>' +
		'</li>';

		/*
		taskName: null,
		taskDescription: null,
		taskDate: null,
		taskUrgent: false,
		*/
		// ....
		// 1) listContainer.innerHTML += '<li>......'; - если через строку
		// 2) listContainer.appendChild(newElement) - если через createElement


	})
	var emprtyList = '<li class="list-group-item"><span class="text-secondary">Список задач пуст</span></li>';
	listContainer.innerHTML = strResult || emprtyList;
	if (strResult) {
		document.getElementById('clrearListButton').style.display = "block";
	} else {
		document.getElementById('clrearListButton').style.display = "none";
	}
}

function deleteNode(event) {
	var node = event.target;
	var index = node.parentNode.getAttribute("data-id");
	STATE.taskList.splice(index, 1);
	updateLocalStorage();
	renderTaskList();
}

function editNode(event) {
	var node = event.target;
	var index = node.parentNode.getAttribute("data-id");
	STATE.formState = "edit";
	STATE.editIndex = index;
	updateFormText();

	document.getElementById("taskName").value = STATE.taskList[index].taskName;
	document.getElementById("taskDescription").value = STATE.taskList[index].taskDescription;
	document.getElementById("taskDate").value = STATE.taskList[index].taskDate;
	document.getElementById("taskUrgent").value = STATE.taskList[index].taskUrgent;
}

function updateFormText() {
	if (STATE.formState === "edit") {
		document.getElementById("formHeader").innerText = "Edit task";
		document.getElementById("actionButton").innerText = "Save task";
		document.getElementById("cancelButton").innerText = "Cancel";
	} else {
		document.getElementById("formHeader").innerText = "Add new task";
		document.getElementById("actionButton").innerText = "Add task";
		document.getElementById("cancelButton").innerText = "Clear form";
	}
}


///////// LOCAL STORAGE
function updateLocalStorage() {
	var tmp = JSON.stringify(STATE.taskList);
	localStorage.setItem("TASKS", tmp);
	return true;
}

function initPage() {
	var tmp;
	try {
		tmp = JSON.parse(localStorage.getItem("TASKS"));
	} catch (e) {
		echo("Couldn't init JSON from Local Storage: ", e.message);
	}
	STATE.taskList = tmp || [];

	renderTaskList();
}