import React, { useState, useEffect } from "react";
import "./App.css";
import Footer from "./Footer";
import Register from "./Register";
import RegistrationModal from "./RegistrationModal";
import MainContent from "./MainContent"; // Импорт вашего основного компонента

function App() {
  const [role, setRole] = useState(null);
  const [polls, setPolls] = useState([]);
  const [newPoll, setNewPoll] = useState({ question: "", options: [""] });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [hasVoted, setHasVoted] = useState(false);

  const [showModal, setShowModal] = useState(true);
  const [userData, setUserData] = useState(null);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setIsAuthenticated(true);
  };

  const handleRegister = async (formData) => {
    const response = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Ошибка регистрации");
    }

    setIsAuthenticated(true);
  };

  const renderMainSite = () => (
    <div className="main-site">
      <h1>Добро пожаловать в систему голосования!</h1>
      <p>Здесь будет ваш основной функционал сайта.</p>
      {/* Оставьте всю логику и компоненты, которые были в вашем сайте */}
    </div>
  );

  const handleLogout = () => {
    setRole(null);
    setIsAuthenticated(false);
    setHasVoted(false);
  };

  const fetchPolls = async () => {
    const response = await fetch("http://localhost:3000/polls");
    const data = await response.json();
    setPolls(data);
  };

  const handleCreatePoll = async () => {
    const response = await fetch("http://localhost:3000/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPoll),
    });
    const data = await response.json();
    setPolls([...polls, data]);
  };

  const handleVote = async (pollId, optionId) => {
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
    setResponseMessage("Ваш ответ записан!");
    setHasVoted(true);
    fetchPolls();
  };

  const handleClosePoll = async (pollId) => {
    const response = await fetch(
      `http://localhost:3000/polls/${pollId}/close`,
      {
        method: "PATCH",
      }
    );
    const data = await response.json();
    fetchPolls();
  };

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
            {/* Сообщение о том, что ответ записан */}
            {responseMessage && <p>{responseMessage}</p>}
          </div>
        ) : (
          <p>Опрос завершен</p>
        )}
      </div>
    ));
  };

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

  useEffect(() => {
    if (role !== null) {
      fetchPolls();
    }
  }, [role]);

  return (
    <div className="App">
      {showModal && (
        <RegistrationModal
          onClose={() => setShowModal(false)}
          onRegister={handleRegister}
        />
      )}
      {!showModal && <MainContent userData={userData} />}
    </div>
  );
}

export default App;
