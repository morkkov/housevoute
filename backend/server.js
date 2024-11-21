const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = 3000;

const DATA_FILE = path.join(__dirname, "data.json");

let users = [
  { email: "admin@admin.com", password: "123", role: "администратор" },
];

app.use(cors());
app.use(bodyParser.json());

if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ polls: [] }, null, 2), "utf-8");
}

function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Ошибка чтения файла данных:", error);
    return { polls: [] };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Ошибка записи файла данных:", error);
  }
}

app.get("/", (req, res) => {
  res.send("Добро пожаловать на сервер голосования!");
});

app.get("/polls", (req, res) => {
  const data = readData();
  res.json(data.polls);
});

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

app.get("/polls/:id/stats", (req, res) => {
  const pollId = parseInt(req.params.id, 10);
  const data = readData();
  const poll = data.polls.find((p) => p.id === pollId);

  if (!poll) {
    return res.status(404).json({ error: "Опрос не найден" });
  }

  res.json(poll);
});

app.delete("/polls/:id", (req, res) => {
  const pollId = parseInt(req.params.id, 10);
  const data = readData();
  const pollIndex = data.polls.findIndex((p) => p.id === pollId);

  if (pollIndex === -1) {
    return res.status(404).json({ error: "Опрос не найден" });
  }

  data.polls.splice(pollIndex, 1);
  writeData(data);

  res.json({ message: "Опрос удален" });
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email и пароль обязательны" });
  }

  const userExists = users.find((user) => user.email === email);
  if (userExists) {
    return res
      .status(400)
      .json({ error: "Пользователь с таким email уже существует" });
  }

  const newUser = { email, password, role: "житель" };
  users.push(newUser);

  res.status(201).json({
    message: "Регистрация успешна",
    user: { email, role: newUser.role },
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: "Неверный email или пароль" });
  }

  res.json({
    message: "Авторизация успешна",
    user: { email, role: user.role },
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Маршрут не найден" });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
