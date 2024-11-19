import React, { useState } from "react";
import "./RegistrationModal.css";

const RegistrationModal = ({ onClose, onRegister }) => {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    name: "",
    apartment: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Object.values(formData).some((field) => field.trim() === "")) {
      alert("Все поля должны быть заполнены!");
      return;
    }
    onRegister(formData); // Передаём данные в основной компонент
    onClose(); // Закрываем модальное окно
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Регистрация</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Имя:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Номер квартиры:
            <input
              type="text"
              name="apartment"
              value={formData.apartment}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Телефон:
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Пароль:
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit">Зарегистрироваться</button>
          <button type="button" onClick={onClose}>
            Закрыть
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationModal;
