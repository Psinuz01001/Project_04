// Массив, в котором будут храниться данные о студентах
const students = [];

// Функция, создающая HTML-элемент строки таблицы для студента
function createStudentElement(student) {
  const row = document.createElement("tr");

  // Ячейка для полного имени студента
  const fullNameCell = document.createElement("td");
  fullNameCell.textContent = `${student.surname} ${student.name} ${student.lastname}`;
  row.appendChild(fullNameCell);

  // Ячейка для даты рождения и возраста студента
  const birthDateCell = document.createElement("td");
  const age = calculateAge(student.birthday);
  birthDateCell.textContent = `${
    student.birthday
      ? new Date(student.birthday).toLocaleDateString("eu-EU")
      : "N/A"
  } (${age} лет)`;
  row.appendChild(birthDateCell);

  // Ячейка для периода обучения студента
  const studyYearsCell = document.createElement("td");
  const studyRange = calculateStudyRange(parseInt(student.studyStart, 10));
  studyYearsCell.textContent = studyRange;
  row.appendChild(studyYearsCell);

  // Ячейка для факультета студента
  const facultyCell = document.createElement("td");
  facultyCell.textContent = student.faculty;
  row.appendChild(facultyCell);

   // Ячейка для кнопки удаления
   const deleteCell = document.createElement("td");
   const deleteButton = document.createElement("button");
   deleteButton.classList.add('btn', 'btn-danger')
   deleteButton.textContent = "Удалить";
   deleteButton.addEventListener("click", () => removeStudent(student));
   deleteCell.appendChild(deleteButton);
   row.appendChild(deleteCell);

  return row;
}

// Получаем ссылку на тело таблицы, куда будем добавлять студентов
const tableBody = document.getElementById("students-table-body");

// Функция для добавления студента в таблицу
function appendStudentToTable(student) {
  const studentElement = createStudentElement(student);
  tableBody.appendChild(studentElement);
}

// Функция для расчета возраста по дате рождения
function calculateAge(birthDate) {
  const currentDate = new Date();
  const birthDateObj = new Date(birthDate);

  if (isNaN(birthDateObj.getTime())) {
    console.error("Invalid birth date");
    return null;
  }

  const age = currentDate.getFullYear() - birthDateObj.getFullYear();
  return age;
}

// Функция для расчета периода обучения студента
function calculateStudyRange(startYear) {
  const currentYear = new Date().getFullYear();
  const endYear = startYear + 4;

  if (
    endYear < currentYear ||
    (endYear === currentYear && new Date().getMonth() > 8)
  ) {
    return `закончил`;
  } else {
    const course = currentYear - startYear + 1;
    return `${startYear}-${endYear} (${course} курс)`;
  }
}

// Асинхронная функция для добавления студента
async function addStudent() {
  // Получаем значения полей из формы
  let firstName = document.getElementById("firstName").value.trim();
  let lastName = document.getElementById("lastName").value.trim();
  let patronymic = document.getElementById("patronymic").value.trim();
  let birthDateInput = document.getElementById("birthDate");
  let startYearInput = document.getElementById("startYear");
  let faculty = document.getElementById("faculty").value.trim();

  // Проверяем наличие необходимых данных
  if (!firstName || !lastName || isNaN(startYearInput.value) || !faculty) {
    alert("Please fill all required fields!");
    return;
  }

  // Парсим дату рождения и год начала обучения
  let birthDate = new Date(birthDateInput.value);
  if (
    isNaN(birthDate.getTime()) ||
    birthDate < new Date("1900-01-01") ||
    birthDate > new Date()
  ) {
    alert("Invalid birth date. It should be between 01.01.1900 and today.");
    return;
  }

  let startYear = parseInt(startYearInput.value, 10);
  const currentYear = new Date().getFullYear();
  if (isNaN(startYear) || startYear < 2000 || startYear > currentYear) {
    alert(
      "Invalid start year. It should be between 2000 and the current year."
    );
    return;
  }

  // Создаем объект с данными нового студента
  const newStudent = {
    name: firstName,
    surname: lastName,
    lastname: patronymic,
    birthday: birthDate.toISOString(),
    studyStart: startYear.toString(),
    faculty,
  };

  try {
    // Отправляем данные на сервер
    const response = await fetch("http://localhost:3000/api/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newStudent),
    });

    // Обрабатываем ответ
    if (!response.ok) {
      throw new Error("Failed to add student");
    }

    const newStud = await response.json();
    students.push(newStud);
    // Добавляем студента в таблицу
    appendStudentToTable(newStud);

    // Очищаем поля формы
    document.getElementById("firstName").value = "";
    document.getElementById("lastName").value = "";
    document.getElementById("patronymic").value = "";
    birthDateInput.value = "";
    startYearInput.value = "";
    document.getElementById("faculty").value = "";
  } catch (error) {
    console.error("Error adding student:", error);
  }
}

// Получаем кнопку и назначаем обработчик события
const addStudentButton = document.getElementById("addStudentButton");
addStudentButton.addEventListener("click", addStudent);

// Получаем заголовок таблицы и назначаем обработчик события
const tableHeader = document.getElementById("students-table-header");
tableHeader.addEventListener("click", function (event) {
  // При клике по заголовку сортируем студентов
  if (event.target.tagName === "TH") {
    const columnType = event.target.dataset.columnType;
    sortStudents(columnType);
  }
});

// Получаем элементы для фильтрации и назначаем обработчики событий
const nameFilterInput = document.getElementById("nameFilter");
const facultyFilterInput = document.getElementById("facultyFilter");
const startYearFilterInput = document.getElementById("startYearFilter");
const endYearFilterInput = document.getElementById("endYearFilter");

nameFilterInput.addEventListener("input", redrawTable);
facultyFilterInput.addEventListener("input", redrawTable);
startYearFilterInput.addEventListener("input", redrawTable);
endYearFilterInput.addEventListener("input", redrawTable);

// Функция для сортировки студентов
function sortStudents(columnType) {
  students.sort((a, b) => {
    if (columnType === "fullName") {
      const fullNameA = `${a.surname} ${a.name} ${a.lastname}`;
      const fullNameB = `${b.surname} ${b.name} ${b.lastname}`;
      return fullNameA.localeCompare(fullNameB);
    } else if (columnType === "faculty") {
      return a.faculty.localeCompare(b.faculty);
    } else if (columnType === "birthDate") {
      return new Date(a.birthday) - new Date(b.birthday);
    } else if (columnType === "startYear") {
      return parseInt(a.studyStart, 10) - parseInt(b.studyStart, 10);
    }
  });

  // Перерисовываем таблицу
  redrawTable();
}

// Функция для перерисовки таблицы с учетом фильтров
function redrawTable() {
  // Получаем значения фильтров
  const nameFilter = nameFilterInput.value.trim().toLowerCase();
  const facultyFilter = facultyFilterInput.value.trim().toLowerCase();
  const startYearFilter = parseInt(startYearFilterInput.value, 10);
  const endYearFilter = parseInt(endYearFilterInput.value, 10);

  // Фильтруем студентов
  const filteredStudents = students.filter((student) => {
    const fullName =
      `${student.surname} ${student.name} ${student.lastname}`.toLowerCase();
    const nameMatch = nameFilter === "" || fullName.includes(nameFilter);
    const facultyMatch =
      facultyFilter === "" ||
      student.faculty.toLowerCase().includes(facultyFilter);
    const startYearMatch =
      isNaN(startYearFilter) ||
      parseInt(student.studyStart, 10) === startYearFilter;
    const endYearMatch =
      isNaN(endYearFilter) ||
      parseInt(student.studyStart, 10) + 4 === endYearFilter;

    return nameMatch && facultyMatch && startYearMatch && endYearMatch;
  });

  // Отображаем отфильтрованных студентов в таблице
  renderTable(filteredStudents);
}

// Функция для отображения студентов в таблице
function renderTable(filteredStudents) {
  const tableBody = document.getElementById("students-table-body");
  tableBody.innerHTML = "";

  // Добавляем каждого студента в таблицу
  filteredStudents.forEach((student) => {
    const studentElement = createStudentElement(student);
    tableBody.appendChild(studentElement);
  });
}

function removeStudent(student) {
  // Отправляем запрос на сервер для удаления студента
  fetch(`http://localhost:3000/api/students/${student.id}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to delete student");
      }
      // Удаляем студента из массива и перерисовываем таблицу
      const index = students.findIndex((s) => s.id === student.id);
      if (index !== -1) {
        students.splice(index, 1);
        redrawTable();
      }
    })
    .catch((error) => {
      console.error("Error deleting student:", error);
    });
}


// Асинхронная функция для загрузки студентов с сервера и отображения их в таблице
async function loadAndDisplayStudents() {
  try {
    // Отправляем запрос на сервер для получения списка студентов
    const response = await fetch("http://localhost:3000/api/students");

    // Проверяем успешность запроса
    if (!response.ok) {
      throw new Error("Failed to fetch students");
    }

    // Получаем данные о студентах
    const loadedStudents = await response.json();

    // Проверяем наличие данных
    if (loadedStudents && loadedStudents.length > 0) {
      // Очищаем массив students и добавляем загруженных студентов
      students.length = 0;
      students.push(...loadedStudents);

      // Отображаем студентов в таблице
      renderTable(students);
    } else {
      console.log("No students found on the server.");
    }
  } catch (error) {
    console.error("Error loading students:", error);
  }
}

// Вызываем функцию при загрузке страницы
document.addEventListener("DOMContentLoaded", loadAndDisplayStudents);
