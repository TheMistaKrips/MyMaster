import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = "/.netlify/functions/tickets"; // Путь к серверless функции

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
      const res = await fetch(`${API_URL}?id=${updatedTicket.id}`, {
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
      const res = await fetch(`${API_URL}?id=${id}`, {
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

export default App;
