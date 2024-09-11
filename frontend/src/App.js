import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { TailSpin } from "react-loader-spinner";
import ToggleButton from "react-toggle-button";
import { FaSun, FaCloudMoon } from "react-icons/fa";

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
  const [darkMode, setDarkMode] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFileProcessed(false);
    setQuery("");
    setResponse("");
    setError("");
    setUploadMessage("");
    setUploadDisabled(false);
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

  const toggleDarkMode = (value) => {
    setDarkMode(!value);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className={`h-screen ${darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"} flex flex-col items-center py-4`}>

      <div className="w-full max-w-3xl p-4 flex flex-col h-full">
        
      <div className="w-full max-w-3xl flex justify-end">
        <FaSun className={`mx-2 ${!darkMode ? "text-gray-900": "text-white"}`} />
        <ToggleButton
          inactiveLabel=""
          activeLabel=""
          value={darkMode}
          onToggle={toggleDarkMode}
        />
        <FaCloudMoon className={`mx-2 ${!darkMode ? "text-gray-900": "text-white"}`} />
      </div>
        <h1 className="text-3xl font-bold mb-6 text-center">
          SAP Test Case Generator
        </h1>
        <div className="upload-section mb-6">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className={`${
              darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-100 text-gray-900"
            } border border-gray-300 rounded p-2 mb-2 w-full`}
          />
          <button
            onClick={handleFileUpload}
            disabled={fileUploadLoading || uploadDisabled}
            className={`px-4 py-2 rounded ${
              fileUploadLoading || uploadDisabled
                ? "bg-gray-400 cursor-not-allowed"
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
              className={`${
                darkMode
                  ? "bg-gray-800 text-gray-100 border-gray-700"
                  : "bg-gray-100 text-gray-900 border-gray-300"
              } border rounded p-2 mb-2 w-full`}
            />
            <button
              onClick={handleQuerySubmit}
              disabled={queryLoading}
              className={`px-4 py-2 rounded ${
                queryLoading
                  ? "bg-gray-400 cursor-not-allowed"
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
              <div
                className={`response-section mt-6 text-left overflow-y-auto max-h-[calc(100vh-400px)] custom-scrollbar ${
                  darkMode ? "bg-slate-800" : "bg-gray-100"
                } p-4 rounded-lg`}
              >
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
          background-color: ${darkMode ? "#1f51ff" : "#9ca3af"}; /* Tailwind Gray-600 for dark mode and Gray-400 for light mode */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: ${darkMode ? "#4b5563" : "#6b7280"}; /* Tailwind Gray-700 for dark mode and Gray-500 for light mode */
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background-color: ${darkMode ? "#1f2937" : "#d1d5db"}; /* Tailwind Gray-800 for dark mode and Gray-300 for light mode */
        }
      `}</style>
    </div>
  );
}

export default App;