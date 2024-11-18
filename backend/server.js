const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Путь к файлу данных
const DATA_FILE = path.join(__dirname, "data.json");

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Проверка существования файла данных
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ polls: [] }, null, 2), "utf-8");
}

// Чтение данных из файла
function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Ошибка чтения файла данных:", error);
    return { polls: [] };
  }
}

// Запись данных в файл
function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Ошибка записи файла данных:", error);
  }
}

// API маршруты

// Корневой маршрут
app.get("/", (req, res) => {
  res.send("Добро пожаловать на сервер голосования!");
});

// Получение всех опросов
app.get("/polls", (req, res) => {
  const data = readData();
  res.json(data.polls);
});

// Создание нового опроса
app.post("/polls", (req, res) => {
  const { question, options } = req.body;

  if (!question || !options || options.length === 0) {
    return res
      .status(400)
      .json({ error: "Вопрос и варианты ответа обязательны" });
  }

  const data = readData();
  const newPoll = {
    id: data.polls.length + 1,
    question,
    options: options.map((option, index) => ({
      id: index + 1,
      text: option,
      votes: 0,
    })),
    active: true,
  };

  data.polls.push(newPoll);
  writeData(data);

  res.status(201).json(newPoll);
});

// Завершение опроса
app.patch("/polls/:id/close", (req, res) => {
  const pollId = parseInt(req.params.id, 10);
  const data = readData();
  const poll = data.polls.find((p) => p.id === pollId);

  if (!poll) {
    return res.status(404).json({ error: "Опрос не найден" });
  }

  poll.active = false;
  writeData(data);

  res.json({ message: "Опрос завершен", poll });
});

// Голосование в опросе
app.post("/polls/:id/vote", (req, res) => {
  const pollId = parseInt(req.params.id, 10);
  const { optionId } = req.body;

  const data = readData();
  const poll = data.polls.find((p) => p.id === pollId);

  if (!poll || !poll.active) {
    return res.status(400).json({ error: "Опрос не найден или завершен" });
  }

  const option = poll.options.find((o) => o.id === optionId);

  if (!option) {
    return res.status(400).json({ error: "Вариант ответа не найден" });
  }

  option.votes += 1;
  writeData(data);

  res.json({ message: "Голос засчитан", poll });
});

// Получение статистики опросов
app.get("/polls/:id/stats", (req, res) => {
  const pollId = parseInt(req.params.id, 10);
  const data = readData();
  const poll = data.polls.find((p) => p.id === pollId);

  if (!poll) {
    return res.status(404).json({ error: "Опрос не найден" });
  }

  res.json(poll);
});

// Удаление опроса
app.delete("/polls/:id", (req, res) => {
  const pollId = parseInt(req.params.id, 10);
  const data = readData();
  const pollIndex = data.polls.findIndex((p) => p.id === pollId);

  if (pollIndex === -1) {
    return res.status(404).json({ error: "Опрос не найден" });
  }

  // Удаляем опрос из массива
  data.polls.splice(pollIndex, 1);
  writeData(data);

  res.json({ message: "Опрос удален" });
});

// Обработка ошибок для несуществующих маршрутов
app.use((req, res) => {
  res.status(404).json({ error: "Маршрут не найден" });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
