import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { TailSpin } from "react-loader-spinner";

function App() {
  const [file, setFile] = useState(null);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [fileUploadLoading, setFileUploadLoading] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileProcessed, setFileProcessed] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadDisabled, setUploadDisabled] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFileProcessed(false);
    setQuery("");
    setResponse("");
    setError("");
    setUploadMessage("");
    setUploadDisabled(false); // Allow new file upload
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError("Please upload a file first.");
      return;
    }
    setFileUploadLoading(true);
    setError("");
    setUploadMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUploadMessage(res.data.message);
      setFileProcessed(true);
      setUploadDisabled(true); // Disable upload after file is processed
    } catch (err) {
      setError(
        err.response ? err.response.data.error : "Error uploading file."
      );
    }

    setFileUploadLoading(false);
  };

  const handleQuerySubmit = async () => {
    if (!query) {
      setError("Please enter a query.");
      return;
    }

    setQueryLoading(true);
    setError("");

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/query`, {
        query,
      });
      setResponse(res.data.response);
    } catch (err) {
      setError(
        err.response ? err.response.data.error : "Error querying the database."
      );
    }

    setQueryLoading(false);
  };

  return (
    <div className="h-screen bg-gray-900 text-gray-100 flex flex-col items-center py-4">
      <div className="w-full max-w-3xl p-4 flex flex-col h-full">
        <h1 className="text-3xl font-bold mb-6 text-center">
          SAP Test Case Generator
        </h1>
        <div className="upload-section mb-6">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="bg-gray-800 text-gray-100 border border-gray-700 rounded p-2 mb-2 w-full"
          />
          <button
            onClick={handleFileUpload}
            disabled={fileUploadLoading || uploadDisabled}
            className={`px-4 py-2 rounded ${
              fileUploadLoading || uploadDisabled
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            {fileUploadLoading ? (
              <TailSpin height={24} width={24} color="#fff" />
            ) : (
              "Upload File"
            )}
          </button>
          {uploadMessage && (
            <div className="mt-4 text-green-500 text-center">
              {uploadMessage}
            </div>
          )}
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
              disabled={queryLoading}
              className={`px-4 py-2 rounded ${
                queryLoading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              {queryLoading ? (
                <TailSpin height={24} width={24} color="#fff" />
              ) : (
                "Submit Query"
              )}
            </button>
            {response && (
              <div className="response-section mt-6 text-left overflow-y-auto max-h-[calc(100vh-400px)] custom-scrollbar bg-slate-800 p-4 rounded-lg">
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
        {error && (
          <div className="error-message text-red-500 mt-6 text-center">
            {error}
          </div>
        )}
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #1f51ff; /* Tailwind Gray-600 */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #4b5563; /* Tailwind Gray-700 */
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background-color: #1f2937; /* Tailwind Gray-800 */
        }
      `}</style>
    </div>
  );
}

export default App;
