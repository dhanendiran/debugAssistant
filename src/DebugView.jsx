import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";


function DebugView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/debug/${id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (!data) return <p className="empty">Loading...</p>;

  return (
    <div className="app">

      <div className="navbar">
        <h2>🐞 Debug Detail</h2>
        <button className="nav-btn" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="card">

        <h2 className="title">{data.error_type}</h2>
        <p className="meta">Used {data.hitCount} times</p>

        <p className="explanation">{data.explanation}</p>

        <div className="section">
          <h3>⚠️ Causes</h3>
          <ul>
            {data.possible_causes.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>

        <div className="section">
          <h3>✅ Fixes</h3>
          <ul>
            {data.recommended_fixes.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </div>

        {data.fixed_code && (
          <div className="section">
            <h3>🛠 Fixed Code</h3>

            <pre className="code-block">{data.fixed_code}</pre>

            <button
              className="copy-btn"
              onClick={() =>
                navigator.clipboard.writeText(data.fixed_code)
              }
            >
              Copy Code
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default DebugView;