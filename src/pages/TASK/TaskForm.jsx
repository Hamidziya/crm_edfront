// TaskForm.js
import React, { useState, useRef } from "react";
import AxiosService from "../../components/utils/ApiService";
import { Modal, Button, Table } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./task.module.css";
import Spinner from "../../components/utils/Sipnners";
import readXlsxFile from "read-excel-file";

const TaskForm = ({ refreshTasks }) => {
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importData, setImportData] = useState([]);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef(null);

  const handleShow = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    setError("");
  };

  const handleImportShow = () => setShowImportModal(true);
  const handleImportClose = () => {
    setShowImportModal(false);
    setImportData([]);
    setImportError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split(".").pop().toLowerCase();

    if (!["xlsx", "xls", "csv"].includes(fileExtension)) {
      setImportError("Please upload a valid Excel or CSV file");
      return;
    }

    setImportError("");

    try {
      let rows = [];

      if (fileExtension === "csv") {
        // Parse CSV file
        const text = await file.text();
        rows = parseCSV(text);
      } else {
        // Parse Excel file
        rows = await readXlsxFile(file);
      }

      if (rows.length < 2) {
        setImportError("File doesn't contain enough data");
        return;
      }

      // Extract headers and data rows
      const headers = rows[0].map((header) =>
        header ? header.toString().toLowerCase().trim() : ""
      );
      const dataRows = rows.slice(1);

      // Check if required columns exist
      const hasTitle = headers.includes("title");
      const hasDescription = headers.includes("description");
      const hasName = headers.includes("name");
      const hasEmail = headers.includes("email");
      const hasMobile = headers.includes("mobile");

      if (!hasTitle || !hasDescription || !hasName || !hasEmail || !hasMobile) {
        setImportError(
          "File must contain 'title', 'description', 'name', 'email', and 'mobile' columns"
        );
        return;
      }

      // Map data to our format
      const mappedData = dataRows
        .map((row) => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] ? row[index].toString().trim() : "";
          });

          return {
            title: obj.title || "",
            description: obj.description || "",
            name: obj.name || "",
            email: obj.email || "",
            mobile: obj.mobile || "",
          };
        })
        .filter(
          (item) =>
            item.title && item.description && item.name && item.email && item.mobile
        );

      if (mappedData.length === 0) {
        setImportError("No valid data found in the file");
        return;
      }

      setImportData(mappedData);
    } catch (error) {
      console.error("Error parsing file:", error);
      setImportError("Error parsing file. Please check the format.");
    }
  };

  // Simple CSV parser
  const parseCSV = (text) => {
    const rows = [];
    const lines = text.split("\n");

    for (const line of lines) {
      if (line.trim()) {
        // Simple CSV parsing
        const cells = line
          .split(",")
          .map((cell) => cell.trim().replace(/^"|"$/g, ""));
        rows.push(cells);
      }
    }

    return rows;
  };

  const handleImportSubmit = async () => {
    if (importData.length === 0) {
      setImportError("No data to import");
      return;
    }

    setImportLoading(true);
    try {
      await AxiosService.post("/task/bulk-create", {
        tasks: importData,
      });

      toast.success(`Successfully imported ${importData.length} leads`);
      refreshTasks();
      handleImportClose();
    } catch (error) {
      console.error("Error importing tasks:", error.message);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(`Error importing leads: ${error.response.data.message}`);
      } else {
        toast.error("An error occurred while importing leads.");
      }
    } finally {
      setImportLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!title || !description) {
        setError("Title And Description Are Required");
        return;
      }
      setLoading(true);
      const response = await AxiosService.post("/task/create", {
        title,
        description,
        assignedTo,
      });
      toast.success(response.data.message);

      refreshTasks();

      setTitle("");
      setDescription("");
      setAssignedTo("");
      setError("");

      handleClose();
    } catch (error) {
      console.error("Error creating task:", error.message);

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(`Error creating task: ${error.response.data.message}`);
      } else {
        toast.error("An error occurred while creating the task.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.taskForm}>
      <div className="d-flex gap-2">
        <Button variant="primary" onClick={handleShow} disabled={loading}>
          {loading ? <Spinner /> : "Add Lead"}
        </Button>

        <Button
          variant="success"
          onClick={handleImportShow}
          disabled={importLoading}
        >
          {importLoading ? <Spinner /> : "Import Leads"}
        </Button>
      </div>

      {/* Add Lead Modal (manual entry) */}
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Lead</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">
                Title
              </label>
              <input
                type="text"
                className="form-control"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <textarea
                className="form-control"
                id="description"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
            <div className="mb-3">
              <label htmlFor="assignedTo" className="form-label">
                Assigned To (User ID)
              </label>
              <input
                type="text"
                className="form-control"
                id="assignedTo"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              />
            </div>
            {error && <div className="alert alert-danger">{error}</div>}
            <Button variant="primary" type="submit">
              Add Lead
            </Button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Import Leads Modal */}
      <Modal show={showImportModal} onHide={handleImportClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Import Leads from Excel/CSV</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="fileUpload" className="form-label">
              Upload File (Excel or CSV)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              className="form-control"
              id="fileUpload"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
            />
            <div className="form-text">
              Your file must include columns for:{" "}
              <strong>title, description, name, email, mobile</strong>
            </div>
          </div>

          {importError && (
            <div className="alert alert-danger">{importError}</div>
          )}

          {importData.length > 0 && (
            <div>
              <h6>Preview ({importData.length} records found):</h6>
              <div
                className="table-responsive"
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
                <Table striped bordered size="sm">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Mobile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importData.slice(0, 5).map((item, index) => (
                      <tr key={index}>
                        <td>{item.title}</td>
                        <td>{item.description}</td>
                        <td>{item.name}</td>
                        <td>{item.email}</td>
                        <td>{item.mobile}</td>
                      </tr>
                    ))}
                    {importData.length > 5 && (
                      <tr>
                        <td colSpan="5" className="text-center">
                          ... and {importData.length - 5} more records
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              <Button
                variant="success"
                onClick={handleImportSubmit}
                disabled={importLoading}
                className="mt-3"
              >
                {importLoading ? (
                  <Spinner />
                ) : (
                  `Import ${importData.length} Leads`
                )}
              </Button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TaskForm;
