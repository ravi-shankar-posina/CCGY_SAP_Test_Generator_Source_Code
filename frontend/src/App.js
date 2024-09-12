import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { TailSpin } from "react-loader-spinner";
import ToggleButton from "react-toggle-button";
import { FaSun, FaCloudMoon } from "react-icons/fa";
import img from "./assets/upload.webp"; // Import your image

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
  const [showImage, setShowImage] = useState(true);
  const [showResponse, setShowResponse] = useState(false); // Control response visibility

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFileProcessed(false);
    setQuery("");
    setResponse("");
    setError("");
    setUploadMessage("");
    setUploadDisabled(false);
    setShowImage(true);
    setShowResponse(false);
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
      setShowImage(false); 
      setTimeout(() => {
        setShowResponse(true); 
      }, 400); 
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
    <div
      className={`h-screen ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      } flex flex-col items-center justify-center py-4 `}
    >
      <div className="w-full flex justify-between items-center shadow-lg">
        <div className="flex-1 text-center">
          <h1 className="text-3xl font-bold mb-6">SAP Test Case Generator</h1>
        </div>
        <div className="flex items-center justify-end">
          <FaSun
            className={`mx-2 ${!darkMode ? "text-gray-900" : "text-white"}`}
          />
          <ToggleButton
            inactiveLabel=""
            activeLabel=""
            value={darkMode}
            onToggle={toggleDarkMode}
          />
          <FaCloudMoon
            className={`mx-2 ${!darkMode ? "text-gray-900" : "text-white"}`}
          />
        </div>
      </div>

      <div className="w-full h-[calc(100vh-100px)] flex ">
        <div className="w-1/4 px-10 py-4 flex flex-col justify-center shadow-md">
          <div className="upload-section mb-6">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className={`${
                darkMode
                  ? "bg-gray-800 text-gray-100"
                  : "bg-gray-100 text-gray-900"
              } border border-gray-300 rounded p-2 mb-2 w-full cursor-pointer`}
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
                className={`px-4 py-2 rounded  ${
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
            </div>
          )}
          {error && (
            <div className="error-message text-red-500 mt-6 text-center">
              {error}
            </div>
          )}
        </div>
        <div
          className={`w-3/4 py-4 flex flex-col justify-center${
            darkMode ? "bg-slate-800" : "bg-gray-200"
          }`}
        >
          {showResponse ? (
            <div
              className={`response-section text-left overflow-y-auto custom-scrollbar p-6 rounded-lg w-full fade-in`}
            >
              <h1 className="font-bold text-lg py-4">Response:</h1>
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          ) : (
            <div
              className={`w-full h-full flex flex-col justify-center items-center ${
                showImage ? "fade-in" : "fade-out"
              }`}
            >
              <img
                src={img}
                alt="Upload or query image"
                className="mb-4 w-52 h-48"
              />
              <p className="text-lg text-center font-semibold">
                Please upload a file and submit your query to see the response.
              </p>
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .fade-in {
          opacity: 1;
          transition: opacity 1s ease-in;
        }
        .fade-out {
          opacity: 0;
          transition: opacity 1s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: ${darkMode ? "#1f51ff" : "#9ca3af"};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: ${darkMode ? "#4b5563" : "#6b7280"};
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background-color: ${darkMode ? "#1f2937" : "#d1d5db"};
        }
      `}</style>
    </div>
  );
}

export default App;
