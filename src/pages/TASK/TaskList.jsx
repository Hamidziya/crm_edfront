import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import Pagination from "react-bootstrap/Pagination";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Badge from "react-bootstrap/Badge";
import styles from "../../components/Dashboard/AdminDashboard/Dashboard.module.css";
import AxiosService from "../../components/utils/ApiService";
import Spinner from "../../components/Spiner/Spiner";
import EditTaskForm from "./EditTaskForm";
import TaskForm from "./TaskForm";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CreateIcon from "@mui/icons-material/Create";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { FaSort } from "react-icons/fa6";
import SearchIcon from "@mui/icons-material/Search";
import HistoryIcon from "@mui/icons-material/History";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [userDetails, setUserDetails] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskUpdates, setTaskUpdates] = useState([]);
  const [updatesLoading, setUpdatesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState("desc");
  const tasksPerPage = 9;

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await AxiosService.get("/task/tasks");
      setTasks(response.data.tasks);

      const userIds = response.data.tasks.map((task) => task.assignedTo);
      const usersDetails = await Promise.all(
        userIds.map(async (userId) => {
          try {
            const userResponse = await AxiosService.get(`/user/getuser/${userId}`);
            return userResponse.data;
          } catch (error) {
            console.error(`Error fetching user details for user ${userId}:`, error.message);
            return { _id: userId, email: 'N/A' };
          }
        })
      );

      const usersMap = {};
      usersDetails.forEach((user) => {
        usersMap[user._id] = user;
      });

      setUserDetails(usersMap);

      const updatedTotalPageCount = Math.ceil(response.data.tasks.length / tasksPerPage);
      if (currentPage > updatedTotalPageCount) {
        setCurrentPage(updatedTotalPageCount);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error.message);
    } finally {
      setLoading(false);
    }
  };

const fetchTaskUpdates = async (taskId) => {
  try {
    setUpdatesLoading(true);
    const response = await AxiosService.get(`/task/${taskId}/updates`);
    console.log("Updates response:", response.data);
    setTaskUpdates(response.data.updates);
  } catch (error) {
    console.error("Error details:", error.response?.data || error.message);
    toast.error("Failed to fetch task updates");
  } finally {
    setUpdatesLoading(false);
  }
};

  useEffect(() => {
    fetchTasks();
  }, []);

  const deleteTask = async (taskId) => {
    try {
      await AxiosService.delete(`/task/delete/${taskId}`);
      toast.success("Task Deleted Successfully");
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error.message);
    }
  };

  const handleShowEditModal = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  const handleShowHistoryModal = async (task) => {
    setSelectedTask(task);
    setShowHistoryModal(true);
    await fetchTaskUpdates(task._id);
  };

  const handleShowCreateTaskModal = () => {
    setSelectedTask(null);
    setShowEditModal(true);
  };

  const handleUpdateTask = async (updatedData) => {
    try {
      await AxiosService.put(`/task/edit/${selectedTask._id}`, updatedData);
      toast.success("Task Updated Successfully");
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === selectedTask._id ? { ...task, ...updatedData } : task
        )
      );
      setShowEditModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error updating task:", error.message);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Error updating task: ${error.response.data.message}`);
      } else {
        toast.error("An error occurred while updating the task.");
      }
    }
  };

  const handleHideEditModal = () => {
    setShowEditModal(false);
    setSelectedTask(null);
  };

  const handleHideHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedTask(null);
    setTaskUpdates([]);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = () => {
    setSortDirection((prevDirection) => (prevDirection === "asc" ? "desc" : "asc"));
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
  });

  const filteredTasks = sortedTasks.filter((task) =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userDetails[task.assignedTo]?.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const refreshTasks = () => {
    fetchTasks();
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const reversedTasks = Array.isArray(filteredTasks) ? filteredTasks.slice().reverse() : [];
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = reversedTasks.slice(indexOfFirstTask, indexOfLastTask);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'In Progress': return 'primary';
      case 'Completed': return 'success';
      case 'On Hold': return 'secondary';
      case 'Cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getUpdateTypeIcon = (type) => {
    switch (type) {
      case 'call': return '📞';
      case 'meeting': return '📅';
      case 'email': return '✉️';
      case 'status_change': return '🔄';
      case 'note': return '📝';
      default: return '📋';
    }
  };

  return (
    <div className="container">
      <div className={`card mb-2 ${styles.userTable}`}>
        <div className="card-header">
          <i className="fas fa-table me-1"></i>
          Tasks Data
        </div>
        <div className=" mt-4 mb-1 d-flex justify-content-around col-sm-12">
          <div className="mb-3  col-sm-auto">
            <TaskForm refreshTasks={refreshTasks} />
          </div>
          <div className="mb-3  col-sm-auto">
            <div className="input-group">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={handleSearch}
                className="form-control"
              />
              <span className="input-group-text">
                <SearchIcon />
              </span>
            </div>
          </div>
          <div className="mb-3  col-sm-auto">
            <FaSort 
              onClick={handleSort}
              className={`ms-2 ${styles.sortIcon}`} 
            />
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive" style={{ maxHeight: "400px", overflowY: "auto" }}>
            {loading && <Spinner />}
            <Table id="datatablesSimple" className={`table ${styles.userTable}`}>
              <thead className="thead-dark">
                <tr>
                  <th>Id</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Mobile</th>   {/* ✅ changed from User ID */}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentTasks.map((task, index) => (
                  <tr key={task._id}>
                    <td>{index + 1}</td>
                    <td>{task.title}</td>
                    <td>{task.description}</td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(task.status)}>
                        {task.status}
                      </Badge>
                    </td>
                    <td>{userDetails[task.assignedTo]?.email || "N/A"}</td>
                    <td>{task.mobile || "N/A"}</td> {/* ✅ show mobile instead of assignedTo */}
                    <td>
                      <Button 
                        variant="info" 
                        size="sm" 
                        onClick={() => handleShowHistoryModal(task)}
                        className="me-1"
                        title="View Followups"
                      >
                        <HistoryIcon />
                      </Button>
                      <Button 
                        variant="primary" 
                        size="sm" 
                        onClick={() => handleShowEditModal(task)}
                        className="me-1"
                        title="Edit"
                      >
                        <CreateIcon />
                      </Button>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => deleteTask(task._id)}
                        title="Delete"
                      >
                        <DeleteOutlineIcon />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>

            </Table>
          </div>

          <div className="d-flex justify-content-center">
            <Pagination>
              {[...Array(Math.ceil(reversedTasks.length / tasksPerPage)).keys()].map((number) => (
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

      {/* Edit Task Modal */}
      {selectedTask && (
        <Modal show={showEditModal} onHide={handleHideEditModal}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Lead</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <EditTaskForm task={selectedTask} onUpdate={handleUpdateTask} />
          </Modal.Body>
        </Modal>
      )}

{/* Task History/Updates Modal */}
<Modal show={showHistoryModal} onHide={handleHideHistoryModal} size="lg">
  <Modal.Header closeButton>
    <Modal.Title>
      <HistoryIcon className="me-2" /> Followup History - {selectedTask?.title}
    </Modal.Title>
  </Modal.Header>

  <Modal.Body>
    {updatesLoading ? (
      <div className="text-center">
        <Spinner />
        <p>Loading updates...</p>
      </div>
    ) : taskUpdates.length === 0 ? (
      <div className="text-center text-muted">
        <p>No followup updates found for this task.</p>
      </div>
    ) : (
      <div className="timeline">
        {taskUpdates.map((update) => (
          <div key={update._id} className="timeline-item mb-3">
            <div className="d-flex">
              <div className="timeline-icon me-3">
                <span style={{ fontSize: "1.5rem" }}>
                  {getUpdateTypeIcon(update.updateType)}
                </span>
              </div>
              <div className="timeline-content flex-grow-1">
                <div className="d-flex justify-content-between align-items-start">
                  <h6 className="mb-1 text-capitalize">
                    {update.updateType.replace("_", " ")}
                  </h6>
                  <small className="text-muted">
                    {new Date(update.createdAt).toLocaleDateString()} at{" "}
                    {new Date(update.createdAt).toLocaleTimeString()}
                  </small>
                </div>

                {update.updateType === "status_change" && (
                  <div className="mb-1">
                    <Badge bg="secondary" className="me-1">
                      {update.oldStatus}
                    </Badge>
                    <ArrowDownwardIcon fontSize="small" />
                    <Badge
                      bg={getStatusBadgeVariant(update.newStatus)}
                      className="ms-1"
                    >
                      {update.newStatus}
                    </Badge>
                  </div>
                )}

                {update.notes && <p className="mb-1">{update.notes}</p>}

                {update.nextFollowUp && (
                  <div className="mb-1">
                    <small className="text-muted">
                      Next follow-up:{" "}
                      {new Date(update.nextFollowUp).toLocaleString()}
                    </small>
                  </div>
                )}

                {update.priority && update.priority !== "medium" && (
                  <Badge
                    bg={update.priority === "high" ? "danger" : "warning"}
                    className="text-capitalize"
                  >
                    {update.priority} priority
                  </Badge>
                )}
                <hr className="my-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </Modal.Body>

  {/* Add Follow-up Form */}
  <Modal.Footer className="flex-column align-items-start">
    <Form
      className="w-100"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.target;
        const payload = {
          taskId: selectedTask._id,
          updateType: form.updateType.value,
          notes: form.notes.value,
          newStatus: form.newStatus.value || undefined,
          nextFollowUp: form.nextFollowUp.value || undefined,
          priority: form.priority.value,
        };

        try {
          await AxiosService.post("task/addLeadUpdate", payload);
          toast.success("Follow-up added successfully!");
          form.reset();
          fetchTaskUpdates(selectedTask._id);
        } catch (err) {
          toast.error("Failed to add follow-up");
          console.error(err);
        }
      }}
    >
      <div className="d-flex gap-2 mb-2">
        <Form.Select name="updateType" required>
          <option value="note">📝 Note</option>
          <option value="call">📞 Call</option>
          <option value="meeting">📅 Meeting</option>
          <option value="email">✉️ Email</option>
          <option value="status_change">🔄 Status Change</option>
          <option value="other">📋 Other</option>
        </Form.Select>

        <Form.Control
          type="text"
          name="notes"
          placeholder="Add notes..."
          required
        />

        <Form.Select name="newStatus">
          <option value="">-- Status --</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
          <option value="Cancelled">Cancelled</option>
        </Form.Select>

        <Form.Control type="datetime-local" name="nextFollowUp" />

        <Form.Select name="priority">
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="high">High</option>
        </Form.Select>

        <Button type="submit" variant="success">
          ➕ Add
        </Button>
      </div>
    </Form>

    <Button variant="secondary" onClick={handleHideHistoryModal}>
      Close
    </Button>
  </Modal.Footer>
</Modal>


      {/* Create Task Modal */}
      {!selectedTask && (
        <Modal show={showEditModal} onHide={handleHideEditModal}>
          <Modal.Header closeButton>
            <Modal.Title>Add Lead</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <TaskForm refreshTasks={refreshTasks} />
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default TaskList;