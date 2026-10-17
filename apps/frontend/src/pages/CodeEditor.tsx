import React, { useState, useEffect, useRef } from "react";
import MonacoEditor from '@monaco-editor/react';
import { userAtom } from "../atoms/userAtom";
import { useRecoilState } from "recoil";
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // Import spinner icon
import { socketAtom } from "../atoms/socketAtom";
import { useNavigate, useParams } from "react-router-dom";
import { connectedUsersAtom } from "../atoms/connectedUsersAtom";
import { EXPRESS_SERVER_URL } from "../Globle";

const CodeEditor: React.FC = () => {
  const [code, setCode] = useState<any>("// Write your code here...");
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState<string[]>([]); // Output logs
  const [socket, setSocket] = useRecoilState<WebSocket | null>(socketAtom);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [currentButtonState, setCurrentButtonState] = useState("Submit Code");
  const [input, setInput] = useState<string>(""); // Input for code
  const [user, setUser] = useRecoilState(userAtom);
  const navigate = useNavigate();

  // Editor and remote change synchronization refs
  const editorRef = useRef<any>(null);
  const isRemoteChange = useRef<boolean>(false);
  const lastReceivedCode = useRef<string>("// Write your code here...");

  // State refs to keep WebSocket handlers stable without re-binding on each keystroke
  const codeRef = useRef(code);
  const inputRef = useRef(input);
  const languageRef = useRef(language);
  const currentButtonStateRef = useRef(currentButtonState);
  const isLoadingRef = useRef(isLoading);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    inputRef.current = input;
  }, [input]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    currentButtonStateRef.current = currentButtonState;
  }, [currentButtonState]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // multiplayer state
  const [connectedUsers, setConnectedUsers] = useRecoilState<any[]>(connectedUsersAtom);
  const parms = useParams();

  // WebSocket connection logic
  useEffect(() => {
    if (!socket) {
      navigate("/" + parms.roomId);
    } else {
      if (socket.readyState === WebSocket.OPEN) {
        // request to get all users on start
        socket.send(
          JSON.stringify({
            type: "requestToGetUsers",
            userId: user.id
          })
        );

        // request to get all data on start
        socket.send(
          JSON.stringify({
            type: "requestForAllData",
          })
        );
      }

      socket.onclose = () => {
        console.log("Connection closed");
        setUser({
          id: "",
          name: "",
          roomId: "",
        });
        setSocket(null);
      };
    }
    return () => {
      socket?.close();
    };
  }, []);

  useEffect(() => {
    if (!socket) {
      navigate("/" + parms.roomId);
    } else {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // on change of user
        if (data.type === "users") {
          setConnectedUsers(data.users);
        }

        // on change of code from another user
        if (data.type === "code") {
          if (editorRef.current && editorRef.current.getValue() === data.code) {
            return;
          }
          lastReceivedCode.current = data.code;
          isRemoteChange.current = true;
          setCode(data.code);
          if (editorRef.current) {
            const position = editorRef.current.getPosition();
            editorRef.current.setValue(data.code);
            if (position) {
              editorRef.current.setPosition(position);
            }
          }
          setTimeout(() => {
            isRemoteChange.current = false;
          }, 0);
        }

        // on change of input
        if (data.type === "input") {
          setInput(data.input);
        }

        // on change of language
        if (data.type === "language") {
          setLanguage(data.language);
        }

        // on change of Submit Button Status
        if (data.type === "submitBtnStatus") {
          setCurrentButtonState(data.value);
          setIsLoading(data.isLoading);
        }

        // on change of output
        if (data.type === "output") {
          setOutput((prevOutput) => [...prevOutput, data.message]);
          handleButtonStatus("Submit Code", false);
        }

        // on receive cursor position
        if (data.type === "cursorPosition") {
          setConnectedUsers((prevUsers) =>
            prevUsers.map((u) => {
              if (u.id === data.userId) {
                return { ...u, cursorPosition: data.cursorPosition };
              }
              return u;
            })
          );
        }

        // send all data to new user on join  
        if (data.type === "requestForAllData") {
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(
              JSON.stringify({
                type: "allData",
                code: editorRef.current ? editorRef.current.getValue() : codeRef.current,
                input: inputRef.current,
                language: languageRef.current,
                currentButtonState: currentButtonStateRef.current,
                isLoading: isLoadingRef.current,
                userId: data.userId
              })
            );
          }
        }

        // on receive all data
        if (data.type === "allData") {
          lastReceivedCode.current = data.code;
          isRemoteChange.current = true;
          setCode(data.code);
          setInput(data.input);
          setLanguage(data.language);
          setCurrentButtonState(data.currentButtonState);
          setIsLoading(data.isLoading);
          if (editorRef.current && editorRef.current.getValue() !== data.code) {
            editorRef.current.setValue(data.code);
          }
          setTimeout(() => {
            isRemoteChange.current = false;
          }, 0);
        }
      };
    }
  }, [socket]);

  const handleSubmit = async () => {
    handleButtonStatus("Submitting...", true);
    const submission = {
      code,
      language,
      roomId: user.roomId,
      input
    };

    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(user?.id ? user.id : "");
    }

    const res = await fetch(`${EXPRESS_SERVER_URL}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submission),
    });

    handleButtonStatus("Compiling...", true);

    if (!res.ok) {
      setOutput((prevOutput) => [
        ...prevOutput,
        "Error submitting code. Please try again.",
      ]);
      handleButtonStatus("Submit Code", false);
    }
  };

  // handle input change multiple user
  const handleInputChange = (e: any) => {
    setInput(e.target.value);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "input",
          input: e.target.value,
          roomId: user.roomId
        })
      );
    }
  };

  // handle language change multiple user
  const handleLanguageChange = (value: any) => {
    setLanguage(value);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "language",
          language: value,
          roomId: user.roomId
        })
      );
    }
  };

  // handle submit button status multiple user
  const handleButtonStatus = (value: any, isLoading: any) => {
    setCurrentButtonState(value);
    setIsLoading(isLoading);
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: "submitBtnStatus",
          value: value,
          isLoading: isLoading,
          roomId: user.roomId
        })
      );
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;

    if (editor) {
      // handle code change multiple user
      editor.onDidChangeModelContent(() => {
        // If this update was applied remotely from another user, do not echo back
        if (isRemoteChange.current) {
          return;
        }
        const currentVal = editor.getValue();
        // If content is identical to last received remote code, skip sending
        if (currentVal === lastReceivedCode.current) {
          return;
        }

        setCode(currentVal);
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: "code",
              code: currentVal,
              roomId: user.roomId
            })
          );
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white px-4 pt-4">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Left Side: Code Editor */}
          <div className="w-full lg:w-3/4">
            <div className="flex justify-between mb-4 lg:px-3">
              <label className="text-white text-2xl lg:text-3xl">CollabSpace</label>
              <div className="flex gap-3">
                {/* Submit Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleSubmit}
                    className={`bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 lg:px-4 py-2 rounded-lg shadow-lg transition-transform duration-300 transform ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLoading}
                  >
                    <span className="flex items-center space-x-2">
                      {isLoading && <AiOutlineLoading3Quarters className="animate-spin" />}
                      <span>{currentButtonState}</span>
                    </span>
                  </button>
                </div>
                {/* Language Selector */}
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-gray-800 h-10 text-white px-3 lg:px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg transition duration-300"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="rust">Rust</option>
                  <option value="go">Go</option>
                </select>
              </div>
            </div>

            {/* Code Editor */}
            <div className="border border-gray-700 rounded-lg overflow-hidden shadow-lg">
              <MonacoEditor
                value={code}
                language={language}
                theme="vs-dark"
                className="lg:h-[90vh] h-[60vh]"
                onMount={handleEditorDidMount}
              />
            </div>
          </div>

          {/* Right Side: Input and Output */}
          <div className="w-full lg:w-1/4 flex flex-col space-y-4">
            {/* User Connected and Invitation Code */}
            <div className="flex flex-col lg:flex-row justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* User Connected */}
              <div className="w-full lg:w-1/2">
                <h2 className="text-lg lg:text-xl font-bold text-gray-400">Users:</h2>
                <div className="bg-gray-800 text-green-400 p-4 rounded-lg mt-2 overflow-y-auto shadow-lg max-h-40 lg:max-h-60">
                  {connectedUsers.length > 0 ? (
                    connectedUsers.map((user: any, index: any) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <pre className="whitespace-pre-wrap text-sm lg:text-base">{user.name}</pre>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No user connected yet.</p>
                  )}
                </div>
              </div>
              {/* Invitation Code */}
              <div className="w-full lg:w-1/2">
                <h2 className="text-lg lg:text-xl font-bold text-gray-400">Invitation Code:</h2>
                <div className="bg-gray-800 text-green-400 p-4 rounded-lg mt-2 overflow-y-auto shadow-lg max-h-40 lg:max-h-60">
                  {user.roomId.length > 0 ? (
                    <pre className="whitespace-pre-wrap text-sm lg:text-base">{user.roomId}</pre>
                  ) : (
                    <p className="text-gray-500">No invitation code yet.</p>
                  )}
                </div>
              </div>
            </div>
            {/* Input Section */}
            <div>
              <h2 className="text-lg lg:text-xl font-bold text-gray-400">Input:</h2>
              <textarea
                value={input}
                style={{ height: "120px" }}
                onChange={(e) => handleInputChange(e)}
                placeholder={`Enter input for your code like... \n5 \n10`}
                className="bg-gray-800 text-white w-full p-4 rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2 text-sm lg:text-base"
              />
            </div>

            {/* Output Section */}
            <div className="flex-1 pb-8">
              <div className="flex justify-between px-2">
                <h2 className="text-lg lg:text-xl font-bold text-gray-400">Output:</h2>
                <button
                  onClick={() => setOutput([])}
                  className="text-red-500 hover:text-red-600"
                >
                  Clear
                </button>
              </div>

              <div className="bg-gray-800 text-green-400 p-4 max-h-[60vh] rounded-lg mt-2 h-full overflow-y-auto shadow-lg space-y-2 text-sm lg:text-base">
                {output.length > 0 ? (
                  output.map((line, index) => (
                    <pre key={index} className="whitespace-pre-wrap">{line}</pre>
                  ))
                ) : (
                  <p className="text-gray-500">No output yet. Submit your code to see results.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
