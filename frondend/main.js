// Количество курсов
const maxEducation = 4;
// Направление сортировки
let sortDirection = true;

async function getStudents() {
  const response = await fetch('http://localhost:3000/api/students');
  return await response.json();
}

async function createStudentItem(studentObject) {
  const response = await fetch('http://localhost:3000/api/students', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      name: studentObject.name,
      surname: studentObject.sureName,
      lastname: studentObject.lastName,
      birthday: studentObject.borneDate,
      studyStart: studentObject.startEducation,
      faculty: studentObject.facultet
    })
  });
  const data = await response.json();
  return data;
}

async function removeStudent(idStudent) {
  const response = await fetch(`http://localhost:3000/api/students/${idStudent}`, {
    method: 'DELETE'
  });

  return response.ok;
}

// Получить ФИО студента
const getFio = student => {
  return student.surname + ' ' + student.name + ' ' + student.lastname;
}

// Получить возраст студента
const getAge = student => {
  const currentDate = new Date();
  let age = currentDate.getFullYear() - new Date(student.birthday).getFullYear();
  let m = currentDate.getMonth() - new Date(student.birthday).getMonth();
  if (m < 0 || (m === 0 && currentDate.getDate() < new Date(student.birthday).getDate())) {
    age--;
  }
  return age;
}

// Получить дату рождения и возраст студента в текстовом виде
const getBirthDateString = student => {
  const yyyy = new Date(student.birthday).getFullYear();
  let mm = new Date(student.birthday).getMonth() + 1;
  let dd = new Date(student.birthday).getDate();
  if (dd < 10) dd = '0' + dd;
  if (mm < 10) mm = '0' + mm;
  return dd + '.' + mm + '.' + yyyy + ' (' + getAge(student) + ' лет)';
}

// Получить номер курса студента и слово "закончил" если он учится больше 4 лет
const getCountEducation = student => {
  const currentDate = new Date();
  const totalEducation = currentDate.getFullYear() - student.studyStart;
  if (totalEducation > maxEducation)
    return 'закончил';

  return (totalEducation + ' курс');
}

const showStudent = studentItem => {
  // Получить контейнер со студентами
  let $studentList = document.getElementById('students-list');

  // Создание контейнера для размещения студента
  const $student = document.createElement('tr');

  // Создание ячейки для данных о студенте
  const $fio = document.createElement('th');
  const $facultet = document.createElement('th');
  const $borneDate = document.createElement('th');
  const $startEducation = document.createElement('th');
  const $deleteColumn = document.createElement('th');

  // Создание кнопки удаления студента
  const $buttonDelete = document.createElement('button');
  $buttonDelete.setAttribute('id', studentItem.id);
  $buttonDelete.style = "background-image: url(delete-icon.svg); width: 36px; height: 42px; background-repeat: no-repeat; background-size: cover; border: none;";
  $deleteColumn.append($buttonDelete);

  // Назначить обработчик на кнопку "Удалить"
  $buttonDelete.addEventListener('click', async function() {
    const idStudent = $buttonDelete.getAttribute('id');
    const isRemove = await removeStudent(idStudent);
    if (isRemove) {
      let $buttonDelete = document.getElementById(idStudent);
      let $row = $buttonDelete.parentElement.parentElement;
      $row.parentElement.removeChild($row);
    }
  });

  // Установить значения о студенте в ячейки
  $fio.textContent = getFio(studentItem);
  $facultet.textContent = studentItem.faculty;
  $borneDate.textContent = getBirthDateString(studentItem);
  $startEducation.textContent = studentItem.studyStart + ' (' + getCountEducation(studentItem) + ')';

  // Добавить ячейки с данными в строку
  $student.append($fio);
  $student.append($facultet);
  $student.append($borneDate);
  $student.append($startEducation);
  $student.append($deleteColumn);

  // Добавить строку с данными в контейнер
  $studentList.append($student);
}

// Отобразить на фронте список студентов из массива
const showStudents = students => {
  let $studentList = document.getElementById('students-list');
  $studentList.innerHTML = '';

  for (const student of students) {
    showStudent(student);
  }
}

// Получить отсортированный массив студентов по заданной колонке и направлению
async function getSortArrayStudents(column, direction) {
  const arrayStudents = await getStudents();
  const copyArray = [...arrayStudents];

  return copyArray.sort(function(a, b) {
    if (column === 'fio') {
      if (direction ? getFio(a) < getFio(b) : getFio(a) > getFio(b))
          return -1;
    } else {
      if (direction ? a[column] < b[column] : a[column] > b[column])
          return -1;
    }
  });
}

// Очистить форму
const clearForm = () => {
  document.getElementById('facultet').value = '';
  document.getElementById('name').value = '';
  document.getElementById('last-name').value = '';
  document.getElementById('sure-name').value = '';
  document.getElementById('borne-date').value = '';
  document.getElementById('start-education').value = '';
}

// Получить отфильтрованный массив
let getFilterArray = (students, property, value) => {
  let resStudents = [];

  if (students.lenght < 1) {
    return resStudents;
  }

  for (const student of students) {
    if (property === 'fio') {
      if (getFio(student).includes(value) === true) {
        resStudents.push(student);
      }
    } else if (property === 'faculty') {
      if (student[property].includes(value) === true) {
        resStudents.push(student);
      }
    } else if (property === 'startEducation') {
      if (parseInt(student.studyStart) === value) {
        resStudents.push(student);
      }
    } else if (property === 'endEducation') {
      if ((parseInt(student.studyStart) + maxEducation) === value) {
        resStudents.push(student);
      }
    }
  }
  return resStudents;
}

// Отфильтровать массив по всем введенным параметрам
const filterArray = (students) => {
  const fio = document.getElementById('fio-filter').value;
  const facultet = document.getElementById('facultet-filter').value;
  const startEducation = document.getElementById('start-education__filter').value;
  const endEducation = document.getElementById('end-education__filter').value;

  let resStudents = [];

  let isFiltering = false;
  // Фильтровать если указано фио
  if (fio) {
    resStudents = getFilterArray(students, 'fio', String(fio));
    isFiltering = true;
  }

  // Фильтровать если указан факультет
  if (facultet) {
    resStudents = getFilterArray(isFiltering ? resStudents : students, 'faculty', String(facultet));
    isFiltering = true;
  }

  // Фильтровать если указано начало обучения
  if (startEducation) {
    resStudents = getFilterArray(isFiltering ? resStudents : students, 'startEducation', parseInt(startEducation));
    isFiltering = true;
  }

  // Фильтровать если указан конец обучения
  if (endEducation) {
    resStudents = getFilterArray(isFiltering ? resStudents : students, 'endEducation', parseInt(endEducation));
    isFiltering = true;
  }

  if (isFiltering) {
    return resStudents;
  }

  return students;
}

document.addEventListener('DOMContentLoaded', async () => {

  // Установить сортировку по клину по заголоку таблицы
  $thHeaderTableList = document.querySelectorAll('#headTableElements th');
  $thHeaderTableList.forEach(element => {
    element.addEventListener('click', async function() {
      const sortArray = await getSortArrayStudents(this.dataset.column, sortDirection);
      sortDirection = !sortDirection;
      showStudents(sortArray);
    });
  });

  // Установить отбработчики на фильтры
  $inputFilterList = document.querySelectorAll('#filter-form input');
  $inputFilterList.forEach(element => {
    element.addEventListener('input', async function() {
      const arrayStudents = await getStudents();
      const filteringArray = filterArray(arrayStudents);
      showStudents(filteringArray);
    })
  });

  // Очистить фильтры
  document.getElementById('filter-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    $inputList = document.querySelectorAll('#filter-form input');
    $inputFilterList.forEach(element => {
      element.value = '';
    });

    const arrayStudents = await getStudents();
    showStudents(arrayStudents);
  });

  // Добавление студента
  document.getElementById('add-student').addEventListener('submit', async function(event) {
    event.preventDefault();

    let $errorMessage = document.getElementById('error-message');

    // Получить DOM элементы формы (инпуты)
    const $name = document.getElementById('name');
    const $lastName = document.getElementById('last-name');
    const $sureName = document.getElementById('sure-name');
    const $borneDate = document.getElementById('borne-date');
    const $startEducation = document.getElementById('start-education');
    const $facultet = document.getElementById('facultet');

    // Сбросить ошибки
    $errorMessage.textContent = '';
    $name.classList.remove('error');
    $lastName.classList.remove('error');
    $sureName.classList.remove('error');
    $borneDate.classList.remove('error');
    $startEducation.classList.remove('error');
    $facultet.classList.remove('error');

    // Получить значения из инпутов
    const item = {
      name: $name.value.trim(),
      lastName: $lastName.value.trim(),
      sureName: $sureName.value.trim(),
      borneDate: new Date($borneDate.value.trim()),
      startEducation: Number($startEducation.value),
      facultet: $facultet.value.trim()
    }

    // Проверить на корректность полученные значения
    if (!item.name) {
      $errorMessage.textContent = 'Укажите имя студента';
      $name.classList.add('error');
    } else if (!item.lastName) {
      $errorMessage.textContent = 'Укажите отчество студента';
      $lastName.classList.add('error');
    } else if (!item.sureName) {
      $errorMessage.textContent = 'Укажите фамилию студента';
      $sureName.classList.add('error');
    } else if (isNaN(item.borneDate)) {
      $errorMessage.textContent = 'Укажите дату рождения студента';
      $borneDate.classList.add('error');
    } else if (!item.startEducation) {
      $errorMessage.textContent = 'Укажите год начала обучения';
      $startEducation.classList.add('error');
    } else if (!item.facultet) {
      $errorMessage.textContent = 'Укажите факультет';
      $facultet.classList.add('error');

    // Если данные введены корректно, тогда добавить в массив нового студента
    } else {
      // Добавить студента в базу
      const studentItem = await createStudentItem(item);

      // Показать добавленного студента
      showStudent(studentItem);

      // Очистить форму
      clearForm();
    }
  });

  const arrayStudents = await getStudents();
  // Показать список студентов
  showStudents(arrayStudents);
});
