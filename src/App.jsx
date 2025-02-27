import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/tickets"; // Указание на локальный сервер

function App() {
  const { tickets, fetchTickets } = useFetchTickets();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);

  // Добавление заявки
  const addTicket = async (ticket) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ticket),
      });
      const result = await res.json();
      if (result.id) fetchTickets();
      setModalOpen(false);
    } catch (error) {
      console.error("Ошибка добавления заявки:", error);
    }
  };

  // Обновление заявки
  const updateTicket = async (updatedTicket) => {
    try {
      const res = await fetch(`${API_URL}/${updatedTicket.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTicket),
      });
      const result = await res.json();
      if (result.updated) fetchTickets();
      setModalOpen(false);
    } catch (error) {
      console.error("Ошибка обновления заявки:", error);
    }
  };

  // Удаление заявки
  const deleteTicket = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (result.deleted) fetchTickets();
      setModalOpen(false);
    } catch (error) {
      console.error("Ошибка удаления заявки:", error);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Контроль заявок</h1>
        <button
          className="add-button"
          onClick={() => {
            setEditingTicket(null);
            setModalOpen(true);
          }}
        >
          +
        </button>
      </header>

      <div className="table-container">
        <TicketTable tickets={tickets} onEdit={setEditingTicket} setModalOpen={setModalOpen} />
      </div>

      {modalOpen && (
        <Modal
          ticket={editingTicket}
          onSave={editingTicket ? updateTicket : addTicket}
          onClose={() => setModalOpen(false)}
          onDelete={editingTicket ? deleteTicket : null}
        />
      )}
    </div>
  );
}

function useFetchTickets() {
  const [tickets, setTickets] = useState([]);

  const fetchTickets = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setTickets(data);
    } catch (error) {
      console.error("Ошибка загрузки заявок:", error);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  return { tickets, fetchTickets };
}

function TicketTable({ tickets, onEdit, setModalOpen }) {
  return (
    <table className="ticket-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Имя</th>
          <th>Телефон</th>
          <th>Адрес</th>
          <th>Задача</th>
          <th>Время</th>
          <th>Статус</th>
        </tr>
      </thead>
      <tbody>
        {tickets.map((ticket) => (
          <tr
            key={ticket.id}
            onClick={() => {
              onEdit(ticket);
              setModalOpen(true);
            }}
          >
            <td>{ticket.id}</td>
            <td>{ticket.name}</td>
            <td>{ticket.phone}</td>
            <td>{ticket.address}</td>
            <td>{ticket.task}</td>
            <td>{ticket.time}</td>
            <td className={ticket.completed ? "status-completed" : "status-pending"}>
              {ticket.completed ? "Выполнено" : "Не выполнено"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Modal({ ticket, onSave, onClose, onDelete }) {
  const [formData, setFormData] = useState(ticket || { name: "", phone: "", address: "", task: "", time: "", completed: false });

  useEffect(() => {
    setFormData(ticket || { name: "", phone: "", address: "", task: "", time: "", completed: false });
  }, [ticket]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{ticket ? "Редактирование заявки" : "Новая заявка"}</h2>
        <input type="text" placeholder="Имя" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        <input type="text" placeholder="Телефон" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
        <input type="text" placeholder="Адрес" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
        <input type="text" placeholder="Задача" value={formData.task} onChange={(e) => setFormData({ ...formData, task: e.target.value })} />
        <input type="text" placeholder="Время" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
        <label className="checkbox-label">
          <input type="checkbox" checked={formData.completed} onChange={(e) => setFormData({ ...formData, completed: e.target.checked })} />
          Выполнено
        </label>
        <div className="modal-buttons">
          {ticket && onDelete && (
            <button className="delete-button" onClick={() => window.confirm("Удалить заявку?") && onDelete(ticket.id)}>
              Удалить
            </button>
          )}
          <button className="cancel-button" onClick={onClose}>
            Отмена
          </button>
          <button className="save-button" onClick={() => onSave(formData)}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
