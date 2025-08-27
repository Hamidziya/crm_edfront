// EditTaskForm.js
import React, { useState, useEffect } from "react";
import AxiosService from "../../components/utils/ApiService";

const EditTaskForm = ({ task, onUpdate, onHide }) => {
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    assignedTo: task.assignedTo, // should hold userId (_id)
  });

  const [users, setUsers] = useState([]);

  // Fetch users with role "user"
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await AxiosService.get("/user/getData"); 
        const data = res.data?.userData || []; // ✅ Fix: get data from res.data.userData
        const filtered = data.filter((u) => u.role === "user");
        setUsers(filtered);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData); // send updated data with userId in assignedTo
    onHide(); // Close the modal
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Title */}
      <div className="mb-3">
        <label htmlFor="title" className="form-label">Title</label>
        <input
          type="text"
          className="form-control"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
        />
      </div>

      {/* Description */}
      <div className="mb-3">
        <label htmlFor="description" className="form-label">Description</label>
        <textarea
          className="form-control"
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        ></textarea>
      </div>

      {/* Assigned To (Dropdown) */}
      <div className="mb-3">
        <label htmlFor="assignedTo" className="form-label">Assigned To</label>
        <select
          className="form-select"
          id="assignedTo"
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
        >
          <option value="">-- Select User --</option>
          {users.map((user) => (
            <option key={user._id} value={user._id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="btn btn-primary">
        Update Task
      </button>
    </form>
  );
};

export default EditTaskForm;
