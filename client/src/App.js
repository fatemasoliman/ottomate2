import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css'; // Make sure to create this CSS file

const API_URL = 'http://3.28.123.146:3000';
const WS_URL = 'ws://3.28.123.146:3002';

function App() {
  const [url, setUrl] = useState('https://ops.trella.app/loadboard/shp7ac748256d2b60a4');
  const [actions, setActions] = useState(JSON.stringify([
    {
      "target": "div#addComment > div:nth-of-type(2) > div > div:nth-of-type(2) > div",
      "type": "click"
    },
    {
      "target": "div#addComment > div:nth-of-type(2) > div > div:nth-of-type(2) > div",
      "type": "input",
      "value": "a"
    },
    {
      "target": "div#addComment > div:nth-of-type(2) > div > div:nth-of-type(2) > div",
      "type": "input",
      "value": "a"
    },
    {
      "target": "div#addComment > div:nth-of-type(2) > div:nth-of-type(2) > button > span",
      "type": "click"
    }
  ], null, 2));
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [skipLogin, setSkipLogin] = useState(false);
  const [automationSpeed, setAutomationSpeed] = useState(1);
  const serverPort = 3000;
  const [logs, setLogs] = useState([]);
  const wsRef = useRef(null);
  const iframeRef = useRef(null);

  useEffect(() => {
    wsRef.current = new WebSocket(WS_URL);
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLogs(prevLogs => [...prevLogs, data]);
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleManualLogin = async () => {
    try {
      // Load the URL in an iframe
      if (iframeRef.current) {
        iframeRef.current.src = url;
      }
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error during manual login:', error);
      setError(`Manual login error: ${error.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult('');
    setLogs([]);
    try {
      let parsedActions = JSON.parse(actions);
      console.log('Sending automation request with actions:', parsedActions);
      // Implement client-side automation here
      // You'll need to inject a script into the iframe to perform the actions
      // This is a complex task and may require additional libraries or custom implementation
      setResult('Client-side automation not implemented in this example');
    } catch (error) {
      console.error('Error:', error);
      setError(`Error: ${error.message}`);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setActions(e.target.result);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>OttoMate</h1>
      </header>
      <main className="App-main">
        {!isLoggedIn ? (
          <div className="login-section">
            <h2>Login</h2>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter portal URL"
              className="input-field"
            />
            <button onClick={handleManualLogin} className="button">
              Load Page
            </button>
          </div>
        ) : (
          <>
            <iframe
              ref={iframeRef}
              src={url}
              style={{width: '100%', height: '500px', border: '1px solid #ccc'}}
              title="Login Page"
            />
            <form onSubmit={handleSubmit} className="automation-form">
              <div className="form-group">
                <label htmlFor="url">URL:</label>
                <input
                  type="text"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label htmlFor="actions">Actions (JSON):</label>
                <textarea
                  id="actions"
                  value={actions}
                  onChange={(e) => setActions(e.target.value)}
                  required
                  className="textarea-field"
                />
              </div>
              <div className="form-group">
                <label htmlFor="file-upload">Or upload JSON file:</label>
                <input
                  type="file"
                  id="file-upload"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="file-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="speed-slider">Automation Speed:</label>
                <div className="slider-container">
                  <input
                    type="range"
                    id="speed-slider"
                    min="1"
                    max="4"
                    step="0.1"
                    value={automationSpeed}
                    onChange={(e) => setAutomationSpeed(parseFloat(e.target.value))}
                    className="slider"
                  />
                  <span className="slider-value">{automationSpeed.toFixed(1)}x</span>
                </div>
              </div>
              <button type="submit" className="button">Run Automation</button>
            </form>
          </>
        )}
        {error && (
          <div className="error-section">
            <h2>Error:</h2>
            <pre>{error}</pre>
          </div>
        )}
        {result && (
          <div className="result-section">
            <h2>Result:</h2>
            <pre>{result}</pre>
            <div id="screenshot" className="screenshot-container"></div>
          </div>
        )}
        <div className="logs-section">
          <h2>Automation Logs:</h2>
          <div className="logs-container">
            {logs.map((log, index) => (
              <div key={index} className={`log-entry ${log.status}`}>
                {log.status === 'success' ? '✅' : '❌'} {log.action.type}: {log.action.target}
                {log.action.value && ` (Value: ${log.action.value})`}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
