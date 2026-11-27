

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:3000", { autoConnect: false });

function App() {
const [formInputs, setFormInputs] = useState({
name: "",
age: "",
phone: "",
});
const [crudData, setCrudData] = useState([]);
const [isEdit, setIsEdit] = useState(false);
const [isConnected, setIsConnected] = useState(false);
const [isSubmitting, setIsSubmitting] = useState(false);
const [statusMessage, setStatusMessage] = useState("");

useEffect(() => {
const handleConnect = () => setIsConnected(true);
const handleDisconnect = () => setIsConnected(false);
const handleCrudData = (data) => setCrudData(data);
const handleConnectError = (error) => {
  console.error("Could not connect to the server:", error);
  setStatusMessage("Unable to connect to the server. Make sure the server is running.");
};

socket.on("connect", handleConnect);
socket.on("disconnect", handleDisconnect);
socket.on("crudData", handleCrudData);
socket.on("connect_error", handleConnectError);
socket.connect();

return () => {
  socket.off("connect", handleConnect);
  socket.off("disconnect", handleDisconnect);
  socket.off("crudData", handleCrudData);
  socket.off("connect_error", handleConnectError);
  socket.disconnect();
};
}, []);

const handleInput = (event) => {
const { name, value } = event.target;
setFormInputs((prev) => ({
...prev,
[name]: value,
}));
};

const handleSubmit = (e) => {
e.preventDefault();
if (!formInputs.name || !formInputs.age || !formInputs.phone) return;
if (!socket.connected) {
  setStatusMessage("Not connected to the server. Please wait and try again.");
  return;
}

setIsSubmitting(true);
setStatusMessage("");
socket.timeout(5000).emit("data", formInputs, (error, response) => {
  setIsSubmitting(false);
  if (error || !response?.ok) {
    setStatusMessage("Could not save the data. Check the server and try again.");
    return;
  }
  setFormInputs({ name: "", age: "", phone: "" });
});
};

const getEditData = (item) => {
setFormInputs(item);
setIsEdit(true);
};

const handleEdit = (e) => {
e.preventDefault();
if (!formInputs.name || !formInputs.age || !formInputs.phone) return;

socket.emit("editData", formInputs);
setIsEdit(false);
setFormInputs({ name: "", age: "", phone: "" });
};

const handleDelete = (id) => {
socket.emit("deleteData", id);
};

return (
<div style={{ padding: "2rem", textAlign: "center" }}>
<h1>CRUD Operations</h1>

  <form
    onSubmit={isEdit ? handleEdit : handleSubmit}
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "0.75rem",
    }}
  >
    <input
      type="text"
      name="name"
      placeholder="Enter your name"
      value={formInputs.name}
      onChange={handleInput}
      style={{ padding: "0.4rem", width: "220px" }}
    />
    <input
      type="number"
      name="age"
      placeholder="Enter your age"
      value={formInputs.age}
      onChange={handleInput}
      style={{ padding: "0.4rem", width: "220px" }}
    />
    <input
      type="text"
      name="phone"
      placeholder="Enter your phone number"
      value={formInputs.phone}
      onChange={handleInput}
      style={{ padding: "0.4rem", width: "220px" }}
    />
    <button
      type="submit"
      disabled={isSubmitting}
      style={{ padding: "0.45rem 1rem" }}
    >
      {isEdit ? "Edit Data" : "Add Data"}
    </button>
  </form>

  <p role="status" aria-live="polite">
    {statusMessage || (isConnected ? "Connected to the server." : "Connecting to the server...")}
  </p>

  {crudData.length > 0 && (
    <table
      border="1"
      cellPadding="8"
      style={{ margin: "1.5rem auto", borderCollapse: "collapse" }}
    >
      <thead>
        <tr>
          <th>Name</th>
          <th>Age</th>
          <th>Phone</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {crudData.map((item) => (
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.age}</td>
            <td>{item.phone}</td>
            <td>
              <button
                onClick={() => getEditData(item)}
                style={{ marginRight: "0.4rem" }}
              >
                Edit
              </button>
              <button onClick={() => handleDelete(item.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )}
  {isConnected && crudData.length === 0 && <p>No data yet.</p>}
</div>
);
}

export default App;