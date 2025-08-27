import React, { useState, useEffect } from "react";
import {
  Button,
  Pagination,
  Row,
  Col,
  Spinner as BootstrapSpinner,
  Modal,
  Form,
} from "react-bootstrap";
import AxiosService from "../../components/utils/ApiService";
import { toast } from "react-toastify";

import styles from "../../components/Dashboard/AdminDashboard/Dashboard.module.css";
import SearchIcon from "@mui/icons-material/Search";

const Spinner = () => (
  <div className="d-flex justify-content-center mt-5">
    <BootstrapSpinner animation="border" variant="light" role="status">
      <span className="sr-only">Loading...</span>
    </BootstrapSpinner>
  </div>
);

const TaskListPage = () => {
  const [tasks, setTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // follow-up fields
  const [updateType, setUpdateType] = useState("note");
  const [oldStatus, setOldStatus] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");
  const [priority, setPriority] = useState("medium");

  const tasksPerPage = 10;

  const fetchTasks = async () => {
    try {
      const response = await AxiosService.get("/task/user");
      setTasks(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleOpenModal = (task) => {
    setSelectedTask(task);
    setUpdateType("note");
    setOldStatus(task.status || "Pending");
    setNewStatus(task.status || "Pending");
    setNotes("");
    setNextFollowUp("");
    setPriority("medium");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTask(null);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await AxiosService.post(`/task/addLeadUpdate`, {
        taskId: selectedTask._id,
        updateType,
        oldStatus,
        newStatus,
        notes,
        nextFollowUp,
        priority,
      });
      toast.success("Follow-up added successfully!");
      fetchTasks();
      handleCloseModal();
    } catch (err) {
      console.error("Error adding follow-up:", err);
      toast.error("Failed to add follow-up");
    }
  };

  const handleStatusFilterChange = (e) => {
    setCurrentPage(1);
    setStatusFilter(e.target.value);
  };

  const handleSortOrderChange = (e) => {
    setCurrentPage(1);
    setSortOrder(e.target.value);
  };

  const filteredTasks = tasks
    .filter(
      (task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((task) => (statusFilter ? task.status === statusFilter : true));

  const sortedTasks = filteredTasks.sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = sortedTasks.slice(indexOfFirstTask, indexOfLastTask);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="container ">
      {loading ? (
        <Spinner />
      ) : (
        <div className={`card mb-4 ${styles.userTable}`}>
          <div className="card-header">
            <i className="fas fa-table me-1"></i>
            Task List
          </div>

          <div className="card-body">
            <Row className="mt-2">
              <Col sm={4} className="mb-3">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setCurrentPage(1);
                      setSearchTerm(e.target.value);
                    }}
                    className="form-control"
                  />
                  <span className="input-group-text">
                    <SearchIcon />
                  </span>
                </div>
              </Col>

              <Col sm={4} className="justify-content-end">
                <select
                  value={sortOrder}
                  onChange={handleSortOrderChange}
                  className="form-select"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </Col>

              <Col sm={4} className="justify-content-end">
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="form-select"
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Submitted">Submitted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </Col>
            </Row>

            <div
              className="table-responsive"
              style={{ maxHeight: "400px", overflowY: "auto" }}
            >
              <table
                id="datatablesSimple"
                className={`table ${styles.userTable}`}
              >
                <thead className="thead-dark">
                  <tr>
                    <th>Id</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Created Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTasks.map((task, id) => (
                    <tr key={task._id}>
                      <td>{id + 1}</td>
                      <td>{task.title}</td>
                      <td>{task.description}</td>
                      <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                      <td>{task.status}</td>
                      <td>
                        <Button
                          variant="primary"
                          onClick={() => handleOpenModal(task)}
                        >
                          Update Task/Lead
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="d-flex justify-content-center">
              <Pagination>
                {[
                  ...Array(Math.ceil(sortedTasks.length / tasksPerPage)).keys(),
                ].map((number) => (
                  <Pagination.Item
                    key={number + 1}
                    active={number + 1 === currentPage}
                    onClick={() => paginate(number + 1)}
                  >
                    {number + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </div>
          </div>
        </div>
      )}

      {/* Modal for updating task / follow-up */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Task / Add Follow-up</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTask && (
            <Form onSubmit={handleUpdateTask}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control type="text" value={selectedTask.title} disabled />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={selectedTask.description}
                  disabled
                />
              </Form.Group>

              {/* Always show old/new status */}
              <Form.Group className="mb-3">
                <Form.Label>Old Status</Form.Label>
                <Form.Control type="text" value={oldStatus} disabled />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>New Status</Form.Label>
                <Form.Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Submitted">Submitted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter follow-up details..."
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Next Follow-up</Form.Label>
                <Form.Control
                  type="date"
                  value={nextFollowUp}
                  onChange={(e) => setNextFollowUp(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Form.Select>
              </Form.Group>

              <Button variant="success" type="submit">
                Save Follow-up
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TaskListPage;
