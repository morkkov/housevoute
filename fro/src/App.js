import React, { useState, useEffect } from "react";
import "./App.css";
import Footer from "./Footer"; // Импортируем футер

function App() {
  const [role, setRole] = useState(null); // Роль пользователя: "житель" или "администратор"
  const [polls, setPolls] = useState([]); // Список опросов
  const [newPoll, setNewPoll] = useState({ question: "", options: [""] }); // Для создания нового опроса
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Статус аутентификации пользователя
  const [responseMessage, setResponseMessage] = useState(""); // Сообщение для пользователя после голосования
  const [hasVoted, setHasVoted] = useState(false); // Статус того, проголосовал ли пользователь

  // Функция для выбора роли
  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setIsAuthenticated(true); // Устанавливаем, что пользователь вошел в систему
  };

  // Функция для выхода из аккаунта
  const handleLogout = () => {
    setRole(null); // Очищаем роль
    setIsAuthenticated(false); // Очищаем статус аутентификации
    setHasVoted(false); // Очищаем статус голосования
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
    setPolls([...polls, data]); // Добавляем новый опрос в список
  };

  // Функция для голосования в опросе
  const handleVote = async (pollId, optionId) => {
    // Если пользователь уже проголосовал, не позволяем проголосовать снова
    if (hasVoted) {
      setResponseMessage("Вы уже проголосовали в этом опросе.");
      return;
    }

    const response = await fetch(`http://localhost:3000/polls/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId }),
    });
    const data = await response.json();
    setResponseMessage("Ваш ответ записан!"); // Сообщение для пользователя
    setHasVoted(true); // Обновляем статус, что пользователь проголосовал
    fetchPolls(); // Обновляем список опросов после голосования
  };

  // Функция для закрытия опроса
  const handleClosePoll = async (pollId) => {
    const response = await fetch(
      `http://localhost:3000/polls/${pollId}/close`,
      {
        method: "PATCH",
      }
    );
    const data = await response.json();
    fetchPolls(); // Обновляем список опросов после закрытия
  };

  // Функция для удаления опроса
  const handleDeletePoll = async (pollId) => {
    const response = await fetch(`http://localhost:3000/polls/${pollId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      setPolls(polls.filter((poll) => poll.id !== pollId)); // Обновляем список после удаления
    } else {
      setResponseMessage("Ошибка при удалении опроса.");
    }
  };

  // Рендер компонентов для создания опросов и голосования
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
                  disabled={hasVoted} // Отключаем кнопку после голосования
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
            {/* Сообщение о том, что ответ записан */}
            {responseMessage && <p>{responseMessage}</p>}
          </div>
        ) : (
          <p>Опрос завершен</p>
        )}
      </div>
    ));
  };

  // Рендеринг для создания нового опроса
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

  // Рендер в зависимости от выбранной роли
  const renderMainContent = () => {
    if (role === null) {
      return renderRoleSelection();
    }

    if (role === "администратор") {
      return (
        <div className="z3">
          {renderCreatePoll()}
          <h2>Список опросов</h2>
          <div className="list_of_polls">{renderPolls()}</div>
        </div>
      );
    }

    if (role === "житель") {
      return (
        <div className="vote">
          <h2>Список опросов</h2>
          {renderPolls()}
        </div>
      );
    }
  };

  // Загружаем опросы при изменении роли или при первой загрузке
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
        </div>
      </header>
      <div className="c">
        {/* Main Content */}
        {renderMainContent()}
      </div>

      {/* Footer только если роль выбрана */}
      {role !== null && <Footer />}
    </div>
  );
}

export default App;
