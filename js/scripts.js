window.echo = function () {
	console.log.apply(this, arguments);
};

var DANGER = 'danger';
var TASK_TODO = "todo";
var TASK_INPROGRESS = "inprogress";
var TASK_DONE = "done";
var SELECT_INDEX = [TASK_TODO, TASK_INPROGRESS, TASK_DONE]
var STATE = {
	taskList: [/*{
		taskName: " название задачи #1",
		taskDescription: "null, // описание",
		taskDate: "25.02.2019",
		taskUrgent: false,
	}, {
		taskName: "название задачи @2",
		taskDescription: "описание",
		taskDate: "14.05.2019",
		taskUrgent: true,
	}*/], // - список задач
	formState: 'add', // [ add, edit, err ] - состояние формы - редактирование или добавление данных
	editIndex: null, // индекс элемента массива задач для режима редактирования
	calendarVisibility: false, // каледарь отображен/скрыт
	calendarDate: new Date(), // дата, которую отображает календарь
	isOpenedPopup: false, // true / false - флаг открыто / закрыто модальное окно
	formData: { // данные формы
		taskName: null, // название задачи
		taskDescription: null, // описание
		taskDate: null, // дата задачи
		taskUrgent: false, // важность задачи
	},
	dnd: {
		from: null,
		to: null,
		id: null,
	}
};

function collectDataFromForm() {
	STATE.formData.taskName = document.getElementById('taskName').value;
	STATE.formData.taskDescription = document.getElementById('taskDescription').value;
	STATE.formData.taskDate = document.getElementById('taskDate').value;
	STATE.formData.taskStatus = document.getElementById('taskStatus').value;
	STATE.formData.taskUrgent = document.getElementById('taskUrgent').checked;

}

function handleClearForm() {
	document.getElementById('taskName').value = '';
	document.getElementById('taskDescription').value = '';
	document.getElementById('taskDate').value = '';
	document.getElementById("taskStatus").selectedIndex = -1;
	document.getElementById('taskUrgent').checked = false;
	highlightFormField('taskName');
	highlightFormField('taskDate');
	highlightFormField('taskStatus');
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
		taskStatus: null,
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
		case 'taskStatus': htmlId = 'taskStatusHelp'; break;
	}

	var helper = document.getElementById(htmlId);
	helper.classList.remove(dangerClass);
	helper.classList.remove(mutedClass);
	helper.classList.add(type);
	helper.innerText = message;

	var input = document.getElementById(id);
	var label = input.closest('.form-group').getElementsByTagName('label')[0];
	if(tp == DANGER) { // добавляем или удалем бордюр вокруг поля для ввода текста
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
	if(!STATE.formData.taskStatus) {
		retVal.push('taskStatus');
	}
	return retVal;
}



// TASKS FUNCTIONS //////////
function printDnDCards(status) {
	var result = '';

	STATE.taskList.forEach(function (item, index) {
		var localStatus = !item.taskStatus ? TASK_TODO : item.taskStatus;
		if (localStatus !== status) {
			return false;
		}
		result += '<li class="list-group-item dragable-task" draggable="true">' +
			(item.taskUrgent ? '<i class="text-danger fa fa-exclamation-triangle"></i> &nbsp ' : '') +
			'<a href="#" draggable="false" onclick="viewTask(event)" data-id="' + index + '" >' + item.taskName + '</a>' +
			'<br /><span class="text-muted"><small>' +
			item.taskDate + '</small></span>' +
			'</li>';
	});
	return result;
}


function renderTaskList(outpuMode = 'homeTab') {
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
		var editIcons = (outpuMode === 'homeTab') ?
			'<span data-id="' + index + '" class="delete_ico" onclick="deleteNode(event)"><i class="fa fa-times"></i></span>' +
			'<span data-id="' + index + '" class="edit_ico" onclick="editNode(event)"><i class="fas fa-edit"></i></span>'
			: '';

			strResult += '<li class="list-group-item">' +
			(item.taskUrgent ? '<i class="text-danger fa fa-exclamation-triangle"></i> &nbsp ' : '') +
			'<a href="#" onclick="viewTask(event)" data-id="' + index + '" >' + item.taskName + '</a><br /><span class="text-muted"><small>' +
			item.taskDate + '</small></span>' +
				editIcons +
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
	document.getElementById("taskStatus").selectedIndex = SELECT_INDEX.indexOf(STATE.taskList[index].taskStatus);
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

function viewTask(e) {
	e.preventDefault();
	var index = e.target.getAttribute("data-id");
	var modal = document.getElementById("modal1");
	modal.style.display = "block";
	var modalContent = document.getElementById("modalContent");
	modalContent.innerHTML =
		'<small class="text-muted">task name</small><br>' +
		STATE.taskList[index].taskName +
		'<br><small class="text-muted">task status</small><br>' +
		STATE.taskList[index].taskStatus +
		'<br><small class="text-muted">task date</small><br>' +
		STATE.taskList[index].taskDate +
		'<br><small class="text-muted">task description</small><br>' +
		STATE.taskList[index].taskDescription +
		'<br><small class="text-muted">urgent</small><br>' +
		(STATE.taskList[index].taskUrgent ? 'Важно' : "Обычная задача");// */
	// echo(modalContent.innerHTML)
}

function handleCloseModal(e) {
	var modal = document.getElementById("modal1");
	modal.style.display = "none";

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
	initCalendar();
	renderDnnColums();
}

function renderDnnColums() {
	var todoListContainer = document.getElementById("todoList");
	var progressListContainer = document.getElementById("inprogressList");
	var doneListContainer = document.getElementById("doneList");

	todoListContainer.innerHTML = printDnDCards(TASK_TODO);
	progressListContainer.innerHTML = printDnDCards(TASK_INPROGRESS);
	doneListContainer.innerHTML = printDnDCards(TASK_DONE);

}

//////////// CALENDAR
function initCalendar() {
	var calendarArrowLeft = document.getElementById('prevButton'); // получаем html элемент, который является дивом под иконкой стрелки "назад"
	var calendarArrowRight = document.getElementById('nextButton');  // получаем html элемент, который является дивом под иконкой стрелки "вперед"

	calendarArrowLeft.addEventListener('click', handleClickCalendarArrows);

	calendarArrowRight.addEventListener('click', handleClickCalendarArrows);

	document.body.addEventListener('click', function(event) {
		if (STATE.calendarVisibility && !closeCalendarHelper(event.target)) {
			handleCloseCalendar(event);
		}
	});
	renderCalendar(STATE.calendarDate.getFullYear(), STATE.calendarDate.getMonth());

	initDnD();
}

// определяет нужно ли закрывать календарь по клику на документ
function closeCalendarHelper(target){
	if (target.closest('.micalendar')) {
		return true;
	}
	return false;
}

function handleShowCalendar(e) {
	if (STATE.calendarVisibility) {
		return false;
	}
	var calendar = document.getElementById('calendar');
	var clickedIcon = e.target;
	var coords = clickedIcon.closest('.input-group-prepend').getBoundingClientRect();
	// e.target.parentElement.parentElement;
	echo("coords", coords);
	calendar.style.top = coords.bottom + "px";
	calendar.style.left = coords.left + "px";
	calendar.style.display = 'block';
	STATE.calendarVisibility = true;
	e.stopPropagation();
}

function handleCloseCalendar(e) {
	var calendar = document.getElementById('calendar');
	calendar.style.display = 'none';
	STATE.calendarVisibility = false;
}

function renderCalendar(yearToOperate, monthToOperate) {
	var dateToOperate = new Date(yearToOperate, monthToOperate);
	var year = dateToOperate.getFullYear();
	var month = dateToOperate.getMonth(); // месяц от 0 до 11, нужно прибавлять 1
	var dayMonth = new Date().getDate(); // какое число месяца
	var dayWeek = dateToOperate.getDay(); // от 0 до 6, причем 0 - это воскресение
	var maximumDaysInPrevMonth = getLastDay(year, month-1);
	dayWeek = dayWeek === 0 ? 7 : dayWeek;
	var firstDay = getFirstDayOfMonth(year, month);
	var j = 1; // это счетчик недель, которые выводятся в календарь
	var dayCounter = 1;
	var dayCounterAfter = 1;
	var str_out_week = '';
	var toMuchWeeksFlag = false;

	while(j < 7) {
		var str_out = '';
		for(var i = 1; i < 8; i++) {
			var tmpCellObject = {};
			if ((firstDay.dayWeek > i && j == 1) ) { // если меньше чем 1е число текущего месяца - ячейки для предыдущего месяца
				var tmpDayMonth = (maximumDaysInPrevMonth + i + 1 - firstDay.dayWeek);
				tmpCellObject = {
					className: ' class="not_current"',
					dataFullDate: (tmpDayMonth + '.' + (month === 0 ? 12 : month) + '.' + (month === 0 ? yearToOperate - 1 : yearToOperate)),
					dataDaymonth: tmpDayMonth,
				};
			} else if (dayCounter > firstDay.maxDays )  { // ячейки для следующего месяца
				tmpCellObject = {
					className: ' class="not_current"',
					dataFullDate: (dayCounterAfter + '.' + (month === 11 ? 1 : month + 2) + '.' + (month == 11 ? yearToOperate + 1 : yearToOperate)),
					dataDaymonth: dayCounterAfter++,
				};
				toMuchWeeksFlag = true;
			} else { // ЯЧЕЙКИ для ТЕКУЩЕГО МЕСЯЦА
				var todayClass = '';
				var currrentDt = new Date();

				if(yearToOperate == currrentDt.getFullYear() && monthToOperate == currrentDt.getMonth()) {
					todayClass = dayCounter == dayMonth ? ' class="today"' : '';
				}

				tmpCellObject = {
					className: todayClass,
					dataFullDate: (dayCounter + '.' + (month + 1) + '.' + yearToOperate),
					dataDaymonth: dayCounter++,
				};
			}
			str_out += renderOneCalendarCell(tmpCellObject);
		}
		str_out_week += '<tr>' + str_out + '</tr>';
		if (toMuchWeeksFlag) {
			break;
		}
		j++;
	}

	renderCalendarMonthHeader(yearToOperate, monthToOperate);
	document.getElementById('calendar_table').children[1].innerHTML = str_out_week;
}

function renderCalendarMonthHeader(year, month) {
	var text = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декаабрь'];
	document.getElementById("monthHeader").innerHTML = text[month] + ' ' + year;

}

// формирует содержимое одной ячейки календаря и возвращает строку содержащую тег TD и все его содержимое
function renderOneCalendarCell({ className = null, dataFullDate = null, dataDaymonth = null, cellText = null }) {
	// if (! (className && dataWeek && dataDaymonth) )
	if (!className && !dataFullDate && !dataDaymonth ) {
		return '<td>&nbsp;</td>';
	}
	return '<td onclick="handleClickCalendarCell(event)" ' + className + ' data-fulldate="'+ dataFullDate +'" data-daymonth="' + dataDaymonth + '">' +
		(cellText === null ? dataDaymonth : cellText ) + '</td>';
}

/* возвращает объект с 2 полями: на какой день недели выпадает первое число месяца и сколько всего в месяце дней*/
function getFirstDayOfMonth(yy, mm) {
	var firstDayOfCurrentMonth = new Date(yy, mm, 1); // дата на момент первого числа текущего месяца
	var month = firstDayOfCurrentMonth.getMonth(); // месяц от 0 до 11, нужно прибавлять 1
	// var dayMonth = firstDayOfCurrentMonth.getDate();
	var dayWeek = firstDayOfCurrentMonth.getDay(); // от 0 до 6, причем 0 - это воскресение
	dayWeek = (dayWeek === 0) ? 7 : dayWeek;
	return {
		dayWeek, // номер дня недели первого числа текущего месяца
		maxDays: getLastDay(yy, mm), // максимальное количество дней  в текуще месяце (который был передан в качестве параметре )
	}
}

function getLastDay(yy, mm) {
	return  new Date(yy, mm +1, 0).getDate();
}

function handleClickCalendarArrows(e) {
	e.stopPropagation();
	echo(event)
	var target = e.target.closest('.arrows_left,.arrows_right');
	var curMonth = STATE.calendarDate.getMonth(); // получаем номер месяца: который отображается в календаре
	var curYear = STATE.calendarDate.getFullYear(); // получаем год: который отображается в календаре
	var classes = target.classList;
	var monthForSate = 0;
	var yearForState = curYear;
	if (classes[0] == 'arrows_right') { // если нажали кнопку следующий месяц
		monthForSate = curMonth === 11 ? 0 : curMonth + 1; // если месяц декабрь, тогда должны месяц скинуть на январь
		yearForState = curMonth === 11 ? yearForState + 1 : yearForState; // если месяц декабрь, тогда год увеличиваем на 1
	} else {
		monthForSate = curMonth === 0 ? 11 : curMonth - 1; // если месяц январь, тогда должны месяц скинуть на декабрь
		yearForState = curMonth === 0 ? yearForState - 1 : yearForState; // если месяц январь, тогда должны год уменьшить
	}
	renderCalendar(yearForState, monthForSate);
	STATE.calendarDate = new Date(yearForState, monthForSate);
}


///////////////////////
function handleSwitchTab(e) {
	e.stopPropagation();
	var id = e.target.getAttribute('id');

	var homeTab = document.getElementById('home-tab');
	var dndTab = document.getElementById('dnd-tab');

	var homeHref = document.getElementById('nav-home-tab');
	var dndHref = document.getElementById('nav-dnd-tab');

	if (id.includes('home')) {  // clicked TAB HOME
		dndTab.style.display = 'none';
		homeTab.style.display = 'block';
	} else {
		// clicked TAB DND
		homeTab.style.display = 'none';
		dndTab.style.display = 'block';
		renderDnnColums();
	}
	dndHref.classList.toggle('active');
	homeHref.classList.toggle('active');

}




////////////// DRAG and DROP
function handleResetCardBlock(e) { // убирает пунктирную-рамку вокруг блока "карточки"
	e && e.stopPropagation();

	var todoListCard = document.getElementById("todoListCard")
	var inprogressListCard = document.getElementById("inprogressListCard")
	var doneListCard = document.getElementById("doneListCard")

	todoListCard.classList.remove("active-dnd", "inactive-dnd", "card-body-dnd-accept", "card-body-dnd-decline");
	inprogressListCard.classList.remove("active-dnd", "inactive-dnd", "card-body-dnd-accept", "card-body-dnd-decline");
	doneListCard.classList.remove("active-dnd", "inactive-dnd", "card-body-dnd-accept", "card-body-dnd-decline");
	todoListCard.querySelector(".card-body").classList.remove("card-body-dnd-accept", "card-body-dnd-decline");
	inprogressListCard.querySelector(".card-body").classList.remove("card-body-dnd-accept", "card-body-dnd-decline");
	doneListCard.querySelector(".card-body").classList.remove("card-body-dnd-accept", "card-body-dnd-decline");
}

function handleDragStartTask(e) {
	e.stopPropagation();
	var optionTarget = e.target;
	var optionDataId = e.target.querySelector('a').getAttribute("data-id");
	var parent = e.target.parentElement.parentElement.parentElement;
	var parentId = parent.getAttribute("id");
	var todoListCard = document.getElementById("todoListCard");
	var inprogressListCard = document.getElementById("inprogressListCard");
	var doneListCard = document.getElementById("doneListCard");

	if(parentId.includes(TASK_TODO)) {
		todoListCard.classList.add("inactive-dnd");
		inprogressListCard.classList.add("active-dnd");
		doneListCard.classList.add("active-dnd");
		STATE.dnd.from = TASK_TODO;
	} else if(parentId.includes(TASK_INPROGRESS)) {
		inprogressListCard.classList.add("inactive-dnd");
		todoListCard.classList.add("active-dnd");
		doneListCard.classList.add("active-dnd");
		STATE.dnd.from = TASK_INPROGRESS;
	} else if(parentId.includes(TASK_DONE)) {
		doneListCard.classList.add("inactive-dnd");
		todoListCard.classList.add("active-dnd");
		inprogressListCard.classList.add("active-dnd");
		STATE.dnd.from = TASK_DONE;
	}

	const el = e.target.parentNode.parentNode;
	e.dataTransfer.setData("text/plain", optionDataId);
	STATE.dnd.id = optionDataId;

}

function handleDragOver(e) { // обработчик события - перетаскиваемый элемент перемещается над областью, куда можно сделать drop
	e.preventDefault();
	var cardContainer = e.currentTarget;
	var cardBody = cardContainer.querySelector(".card-body");

	if( (cardContainer.id.includes(TASK_TODO) && STATE.dnd.from === TASK_TODO) ||
		(cardContainer.id.includes(TASK_INPROGRESS)  && STATE.dnd.from === TASK_INPROGRESS) ||
		(cardContainer.id.includes(TASK_DONE)  && STATE.dnd.from === TASK_DONE)) {
		cardBody.classList.add("card-body-dnd-decline")
	} else {
		cardBody.classList.add("card-body-dnd-accept")
	}
	return null;
}

function handleDragEnter(e) { // обработчик события - перетаскиваемый элемент "вошел" в зону, куда можно сделать drop
	e.preventDefault();

	return null;
}

function handleDragLeave(e) { // обработчик события - перетаскиваемый элемент "ушел" из зоны, куда можно было сделать drop
	var cardContainer = e.currentTarget;

	var cardBody = cardContainer.querySelector(".card-body");
	cardBody.classList.remove("card-body-dnd-accept", "card-body-dnd-decline");
}

function handleDrop(e) { // обработчик события - объект "бросили/отпустили" в зону, куда можно сделать drop
	e.preventDefault();
	var cardContainer = e.currentTarget;
	// var ulContainer = cardContainer.querySelector('.list-group');

	var optionDataId = e.dataTransfer.getData("text");
	// var optionInnerHtml = e.dataTransfer.getData('htmlData');
	// var optionDom = document.createElement('li');
	// optionDom.setAttribute('draggable', 'true');
	// optionDom.setAttribute('class', 'list-group-item dnd_hand');
	// optionDom.innerHTML = optionInnerHtml;
	var isChanged = false;

	if(cardContainer.id.includes(TASK_TODO) && STATE.taskList[optionDataId].taskStatus !== TASK_TODO) {
		STATE.taskList[optionDataId].taskStatus = TASK_TODO;
		isChanged = true;
	} else if(cardContainer.id.includes(TASK_INPROGRESS) && STATE.taskList[optionDataId].taskStatus !== TASK_INPROGRESS) {
		STATE.taskList[optionDataId].taskStatus = TASK_INPROGRESS;
		isChanged = true;
	} else if(cardContainer.id.includes(TASK_DONE) && STATE.taskList[optionDataId].taskStatus !== TASK_DONE) {
		STATE.taskList[optionDataId].taskStatus = TASK_DONE;
		isChanged = true;
	}
	if (isChanged) {
		renderDnnColums();
		updateLocalStorage();
	}
	handleResetCardBlock();
}


function initDnD() {
	var todoListCard = document.getElementById("todoListCard");
	var inprogressListCard = document.getElementById("inprogressListCard");
	var doneListCard = document.getElementById("doneListCard");

	var ms = [todoListCard, inprogressListCard, doneListCard];

	for (var i = 0; i < ms.length; i++) {
		ms[i].addEventListener("dragstart", handleDragStartTask); // назначить события "начало перемещения"
		ms[i].addEventListener("dragenter", handleDragEnter); // назначить события "вход в зону"
		ms[i].addEventListener("dragleave", handleDragLeave); // назначить события "выход из зоны"
		ms[i].addEventListener("dragover", handleDragOver); // назначить события "перемещение над зоной"
		ms[i].addEventListener("drop", handleDrop); // назначить события "перемещение над зоной"
	}

	document.addEventListener("dragend", handleResetCardBlock)

}