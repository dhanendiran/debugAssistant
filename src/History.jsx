import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


function History() {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/history");
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this item?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/history/${id}`);
      setHistory((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const clearAll = async () => {
    if (!window.confirm("Clear all history?")) return;

    try {
      await axios.delete("http://localhost:8080/api/history");
      setHistory([]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="app">

      <div className="navbar">
        <h2>📜 History</h2>
        <button className="nav-btn" onClick={() => navigate("/")}>
          ← Back
        </button>
      </div>

      <div className="card">

        <div className="top-actions">
          <button className="danger-btn" onClick={clearAll}>
            🗑 Clear All
          </button>
        </div>

        {history.length === 0 ? (
          <p className="empty">No history found</p>
        ) : (
          history.map((item) => (
            <div
              key={item._id}
              className="history-item"
              onClick={() => navigate(`/debug/${item._id}`)}
            >
              <div className="history-header">
                <p className="history-error">
                  {item.error.length > 60
                    ? item.error.substring(0, 60) + "..."
                    : item.error}
                </p>

                <span className="badge">{item.error_type}</span>
              </div>

              <p className="preview">
                {item.explanation
                  ? item.explanation.substring(0, 80) + "..."
                  : "No explanation"}
              </p>

              <div className="meta">
                used {item.hitCount || 0} •{" "}
                {new Date(item.createdAt).toLocaleString()}
              </div>

              <button
                className="danger-btn small"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteItem(item._id);
                }}
              >
                Delete
              </button>
            </div>
          ))
        )}

      </div>
    </div>
  );
}

export default History;