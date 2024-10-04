import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { TailSpin } from "react-loader-spinner";
import ToggleButton from "react-toggle-button";
import { FaSun, FaCloudMoon, FaHeadset, FaCode, FaTools } from "react-icons/fa";
import img from "./assets/upload.webp"; // Import your image

const options = [
  { label: "SAP Test Case Generator", api: "query", icon: <FaHeadset /> },
  { label: "ABAP Code Generator", api: "query", icon: <FaCode /> },
  { label: "Smart Connector", api: "query", icon: <FaTools /> }, // SAP Support option
];

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
  const [showResponse, setShowResponse] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(options[0].label);

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
    formData.append("files", file);  // Changed from "file" to "files" to match backend

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
      setUploadDisabled(true);
    } catch (err) {
      setError(
        err.response ? err.response.data.error : "Error uploading file."
      );
    }

    setFileUploadLoading(false);
  };

  const handleQuerySubmit = async () => {
    if (!fileProcessed) {
      setError("Please upload and process a file first.");
      return;
    }

    if (!query) {
      setError("Please enter a query.");
      return;
    }

    setQueryLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/query`,
        { query },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setResponse(res.data.test_cases.join('\n'));  // Join test cases into a single string
      setShowImage(false);
      setTimeout(() => {
        setShowResponse(true);
      }, 400);
    } catch (err) {
      setError(
        err.response ? err.response.data.error : "Error generating test cases."
      );
    }

    setQueryLoading(false);
  };

  const handleOptionClick = (api, label) => {
    setSelectedLabel(label);
    setQuery("");
    setResponse("");
    setShowResponse(false);
    setShowImage(true);
    setFileProcessed(false);
    setFile(null); // Clear the file input
    setUploadMessage("");
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
      className={`min-h-screen w-full ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
      } flex flex-col items-center justify-start py-6 overflow-hidden`}
    >
      {/* Header Section */}
      <div className="w-full flex justify-between items-center px-6 py-4 shadow-lg fixed top-0 z-10">
        <h1 className="text-3xl font-bold">{selectedLabel}</h1>
        <div className="flex items-center">
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
      <div className="w-full flex flex-col md:flex-row pt-16 h-calc(100vh - 10px)">
        {/* Sidebar */}
        <div
          className={`md:w-1/4 p-6 h-[580px] ${
            darkMode ? " text-gray-100 " : " text-gray-900"
          } overflow-auto shadow`}
        >
          <ul className="space-y-4">
            {options.map((option, index) => (
              <li
                key={index}
                onClick={() => handleOptionClick(option.api, option.label)}
                className={`flex items-center text-sm font-bold cursor-pointer p-3 rounded-lg transition duration-300 ${
                  selectedLabel === option.label
                    ? "bg-gray-500 dark:bg-gray-700 text-gray-100"
                    : ""
                } hover:bg-gray-500 hover:text-gray-100  dark:hover:bg-gray-700`}
              >
                {option.icon}
                <span className="ml-2">{option.label}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Main Content */}
        <div
          className={`w-3/4 flex items-center justify-center py-8 px-8 overflow-auto max-h-screen `}
        >
          {selectedLabel === "SAP Test Case Generator" ? (
            showResponse ? (
              <div
                className={`w-3/4 p-6 rounded-lg shadow-md overflow-auto max-h-96 ${
                  darkMode
                    ? "bg-gray-800 text-gray-100"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <h1 className="font-bold text-lg mb-4">Response:</h1>
                <ReactMarkdown>{response}</ReactMarkdown>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                <p
                  className={`text-gray-400 mb-4 ${
                    darkMode ? "text-gray-300" : "text-gray-800"
                  }`}
                >
                  Upload a file to get response for your query.
                </p>
                <div className="w-full max-w-md px-4">
                  <input
                    type="file"
                    accept=".pdf,.txt,.docx"
                    onChange={handleFileChange}
                    className={`w-full p-2 border ${
                      darkMode
                        ? "bg-gray-800 text-gray-100"
                        : "bg-gray-100 text-gray-900"
                    } rounded mb-4`}
                  />
                  <button
                    onClick={handleFileUpload}
                    disabled={fileUploadLoading || uploadDisabled}
                    className={`w-full py-2 mb-4 rounded ${
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
                    <div className="text-green-500 text-center">
                      {uploadMessage}
                    </div>
                  )}
                </div>

                {fileProcessed && (
                  <div className="w-full max-w-md px-4">
                    <input
                      type="text"
                      placeholder="Enter your query..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className={`w-full p-2 border ${
                        darkMode
                          ? "bg-gray-800 text-gray-100"
                          : "bg-gray-100 text-gray-900"
                      } rounded mb-4`}
                    />
                    <button
                      onClick={handleQuerySubmit}
                      disabled={queryLoading}
                      className={`w-full py-2 rounded ${
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
              </div>
            )
          ) : (
            <div className="w-full flex justify-center">
              {/* <img src={img} alt="Illustration" className="h-[480px]" /> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;