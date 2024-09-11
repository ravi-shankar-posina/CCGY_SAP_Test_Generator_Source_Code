import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './App.css';
import { Spinner } from 'react-bootstrap';

function App() {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileProcessed, setFileProcessed] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError('Please upload a file first.');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert(res.data.message);
      setFileProcessed(true);
    } catch (err) {
      setError(err.response ? err.response.data.error : 'Error uploading file.');
    }

    setLoading(false);
  };

  const handleQuerySubmit = async () => {
    if (!query) {
      setError('Please enter a query.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/query`, { query });
      setResponse(res.data.response);
    } catch (err) {
      setError(err.response ? err.response.data.error : 'Error querying the database.');
    }

    setLoading(false);
  };

  return (
    <div className="App">
      <h1>SAP Test Case Generator</h1>
      <div className="upload-section">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={fileProcessed}
        />
        <button onClick={handleFileUpload} disabled={loading || fileProcessed}>
          {loading ? <Spinner animation="border" /> : fileProcessed ? 'File Processed' : 'Upload File'}
        </button>
      </div>
      {fileProcessed && (
        <div className="query-section">
          <input
            type="text"
            placeholder="Enter your query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={handleQuerySubmit} disabled={loading}>
            {loading ? <Spinner animation="border" /> : 'Submit Query'}
          </button>
        </div>
      )}
      {response && <div className="response-section"><ReactMarkdown>{response}</ReactMarkdown></div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default App;