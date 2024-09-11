import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { TailSpin } from 'react-loader-spinner';

function App() {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fileProcessed, setFileProcessed] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

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
    setUploadMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setUploadMessage(res.data.message);
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
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-10">
      <div className="w-full max-w-3xl p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">SAP Test Case Generator</h1>
        <div className="upload-section mb-6">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={fileProcessed}
            className="bg-gray-800 text-gray-100 border border-gray-700 rounded p-2 mb-2 w-full"
          />
          <button
            onClick={handleFileUpload}
            disabled={loading || fileProcessed}
            className={`px-4 py-2 rounded ${loading || fileProcessed ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
          >
            {loading ? <TailSpin height={24} width={24} color="#fff" /> : fileProcessed ? 'File Processed' : 'Upload File'}
          </button>
          {uploadMessage && <div className="mt-4 text-green-500 text-center">{uploadMessage}</div>}
        </div>
        {fileProcessed && (
          <div className="query-section mb-6">
            <input
              type="text"
              placeholder="Enter your query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-gray-800 text-gray-100 border border-gray-700 rounded p-2 mb-2 w-full"
            />
            <button
              onClick={handleQuerySubmit}
              disabled={loading}
              className={`px-4 py-2 rounded ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
            >
              {loading ? <TailSpin height={24} width={24} color="#fff" /> : 'Submit Query'}
            </button>
            {response && (
              <div className="response-section mt-6 text-left">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
        {error && <div className="error-message text-red-500 mt-6 text-center">{error}</div>}
      </div>
    </div>
  );
}

export default App;