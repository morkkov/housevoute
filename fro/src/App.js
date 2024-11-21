import React, { useState, useEffect } from "react";
import "./App.css";
import Footer from "./Footer";
import img from "./img/images.jpg";

function App() {
  const [role, setRole] = useState(null);
  const [polls, setPolls] = useState([]);
  const [newPoll, setNewPoll] = useState({ question: "", options: [""] });
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [otherOption, setOtherOption] = useState("");

  const [showInputIndex, setShowInputIndex] = useState(null);
  const [customInput, setCustomInput] = useState("");

  const handleRoleSelect = (selectedRole) => {
    if (selectedRole === "администратор") {
      setRole("adminPassword");
    } else {
      setRole("житель");
    }
  };

  const handleOptionChange = (e, optionIndex) => {
    if (e.target.value === "other") {
      setOtherOption("");
    }
  };

  const handleClosePoll = async (pollId) => {
    const response = await fetch(
      `http://localhost:3000/polls/${pollId}/close`,
      {
        method: "PATCH",
      }
    );

    if (response.ok) {
      fetchPolls();
    } else {
      setResponseMessage("Ошибка при закрытии опроса.");
    }
  };

  function handleLogin() {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
  }

  // Функция для создания нового опроса
  const renderCreatePoll = () => {
    return (
      <div className="create-poll-container">
        <h3>Создать новый опрос</h3>
        <input
          type="text"
          value={newPoll.question}
          onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
          placeholder="Вопрос"
          className="input-field"
        />
        <div>
          {newPoll.options.map((option, index) => (
            <div key={index}>
              <input
                type="text"
                value={option}
                onChange={(e) =>
                  setNewPoll({
                    ...newPoll,
                    options: newPoll.options.map((opt, i) =>
                      i === index ? e.target.value : opt
                    ),
                  })
                }
                placeholder={`Ответ ${index + 1}`}
                className="input-field"
              />
            </div>
          ))}
        </div>
        <button
          className="add-option-button"
          onClick={() =>
            setNewPoll({ ...newPoll, options: [...newPoll.options, ""] })
          }
        >
          Добавить вариант ответа
        </button>
        <button className="create-poll-button" onClick={handleCreatePoll}>
          Создать опрос
        </button>
      </div>
    );
  };

  // Функция для удаления опроса
  const handleDeletePoll = async (pollId) => {
    const response = await fetch(`http://localhost:3000/polls/${pollId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setPolls(polls.filter((poll) => poll.id !== pollId));
    } else {
      setResponseMessage("Ошибка при удалении опроса.");
    }
  };

  // Функция для подтверждения пароля администратора
  const handlePasswordSubmit = () => {
    if (password === "admin") {
      setRole("администратор");
      setPassword(""); // Очищаем поле пароля
    } else {
      setResponseMessage("Неверный пароль для администратора");
    }
  };

  // Функция для выхода из аккаунта
  const handleLogout = () => {
    setRole(null);
    setIsAuthenticated(false);
    setHasVoted(false);
  };

  // Функция для получения всех опросов
  const fetchPolls = async () => {
    const response = await fetch("http://localhost:3000/polls");
    const data = await response.json();
    setPolls(data);
  };

  // Функция для создания нового опроса
  const handleCreatePoll = async () => {
    const response = await fetch("http://localhost:3000/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPoll),
    });
    const data = await response.json();
    setPolls([...polls, data]);
  };

  // Функция для голосования в опросе
  const handleVote = async (pollId, optionId) => {
    if (hasVoted) {
      setResponseMessage("Вы уже проголосовали.");
      return;
    }

    const response = await fetch(`http://localhost:3000/polls/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId }),
    });

    if (response.ok) {
      setResponseMessage("Ваш голос учтен!");
      setHasVoted(true);
      fetchPolls();
    } else {
      setResponseMessage("Ошибка при голосовании.");
    }
  };

  const renderPolls = () => {
    return polls.map((poll) => (
      <div key={poll.id} className="poll-container">
        <h3>{poll.question}</h3>
        {poll.active ? (
          <div>
            <h4>Варианты:</h4>
            {poll.options.map((option) => (
              <div key={option.id} className="option-container">
                <button
                  className="vote-button"
                  onClick={() => handleVote(poll.id, option.id)}
                  disabled={hasVoted}
                >
                  {option.text}
                </button>
                {role === "администратор" && (
                  <span className="vote-count">({option.votes} голосов)</span>
                )}
              </div>
            ))}
            {role === "администратор" && (
              <div>
                <button
                  className="close-poll-button"
                  onClick={() => handleClosePoll(poll.id)}
                >
                  Закрыть опрос
                </button>
                <button
                  className="delete-poll-button"
                  onClick={() => handleDeletePoll(poll.id)}
                >
                  Удалить опрос
                </button>
              </div>
            )}
          </div>
        ) : (
          <p>Опрос завершен</p>
        )}
      </div>
    ));
  };

  // Рендер выбора роли
  const renderRoleSelection = () => {
    return (
      <div className="role-selection-container">
        <h2>Выберите вашу роль</h2>
        <button
          className="role-button"
          onClick={() => handleRoleSelect("житель")}
        >
          Жилец
        </button>
        <button
          className="role-button"
          onClick={() => handleRoleSelect("администратор")}
        >
          Администратор
        </button>
      </div>
    );
  };

  // Рендер ввода пароля администратора
  const renderAdminPasswordInput = () => {
    return (
      <div>
        <h3>Введите пароль администратора</h3>
        <input
          className="inpp"
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
        />
        <button onClick={handlePasswordSubmit}>Подтвердить</button>
        {responseMessage && <p>{responseMessage}</p>}
      </div>
    );
  };

  // Рендер в зависимости от выбранной роли
  const renderMainContent = () => {
    if (role === null) {
      return renderRoleSelection();
    }

    if (role === "adminPassword") {
      return renderAdminPasswordInput();
    }

    if (role === "администратор") {
      return (
        <div className="z3">
          {renderCreatePoll()}
          <h2 className="hq">СПИСОК ОПРОСОВ</h2>
          <div className="list_of_polls">{renderPolls()}</div>
        </div>
      );
    }

    if (role === "житель") {
      return (
        <div className="vote">
          <h2 className="hq">СПИСОК ОПРОСОВ</h2>
          {renderPolls()}
        </div>
      );
    }
  };

  useEffect(() => {
    if (role !== null) {
      fetchPolls();
    }
  }, [role]);

  return (
    <div className="App">
      {/* Header */}
      <header className="App-header">
        <div className="header-content">
          <h1>Голосование в жилом доме</h1>
          {isAuthenticated && (
            <button className="logout-button" onClick={handleLogout}>
              Выйти
            </button>
          )}
          <div>
            <button className="news">
              <a className="news1" href="news.html">
                Новости
              </a>
            </button>
            <button className="news">
              <a
                target="blank"
                className="news1"
                href="https://gymnasium.rooglub.gov.by/"
              >
                Соц. Сети
              </a>
            </button>
          </div>
        </div>
      </header>

      <div className="img">
        <img className="img1" src={img} alt="..." />
      </div>

      <div className="c">
        {/* Main Content */}
        {renderMainContent()}
      </div>

      {/* Footer только если роль выбрана */}
      {<Footer />}
    </div>
  );
}

export default App;
