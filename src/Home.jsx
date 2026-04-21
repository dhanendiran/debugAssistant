import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


function Home() {
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
const API = import.meta.env.VITE_API_URL;


  const handleSubmit = async () => {
    if (!error || !code) {
      alert("Please enter error and code");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(`${API}/api/debug`, {
        error,
        code,
        language
      });
      setResult(res.data);
    } catch (err) {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">

      <div className="navbar">
        <h2>🚀 IntelliDebug</h2>
        <button className="nav-btn" onClick={() => navigate("/history")}>
          History
        </button>
      </div>

      <div className="card">
        <h3>Error</h3>
        <textarea
          placeholder="TypeError: Cannot read property 'map' of undefined"
          value={error}
          onChange={(e) => setError(e.target.value)}
        />

        <h3>Code</h3>
        <textarea
          placeholder="users.map(user => user.name)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>javascript</option>
          <option>python</option>
          <option>java</option>
        </select>

        <button className="primary-btn" onClick={handleSubmit}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {(loading || result) && (
        <div className="card result-card fade-in">

          {loading && <p className="loading">⚡ Analyzing your error...</p>}

          {result && (
            <>
              <div className="badge">
                {result.source === "cache" ? "Cached Result" : "AI Result"}
              </div>

              <h2 className="error-title">
                {result.data.error_type}
              </h2>

              <p className="confidence">
                Confidence: {(result.data.confidence * 100).toFixed(0)}%
              </p>

              <p className="explanation">
                {result.data.explanation}
              </p>

              <div className="section">
                <h3>✅ Fix Suggestions</h3>
                <ul>
                  {result.data.recommended_fixes.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              
              <div className="section">
                <h3>⚠️ Possible Causes</h3>
                <ul>
                  {result.data.possible_causes.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>

          
              {result.data.fixed_code && (
                <div className="section">
                  <h3>🛠 Fixed Code</h3>

                  <pre className="code-block">
                    {result.data.fixed_code}
                  </pre>

                  <button
                    className="copy-btn"
                    onClick={() =>
                      navigator.clipboard.writeText(result.data.fixed_code)
                    }
                  >
                    Copy Code
                  </button>

                  <p className="warning">
                    ⚠️ Review before using
                  </p>
                </div>
              )}
            </>
          )}

        </div>
      )}

    </div>
  );
}

export default Home;