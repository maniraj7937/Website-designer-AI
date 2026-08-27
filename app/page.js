"use client";

import { useEffect, useRef, useState } from "react";


const SUGGESTIONS = [
  "Build a calculator website with a dark theme",
  "Build a personal portfolio website",
  "Build a todo list app",
  "Create a luxury landing page",
];

const MODEL_OPTIONS = ["Gemini 3.5 flash lite"];

export default function Home() {
  
  const [projectHistory, setProjectHistory] = useState([]);

const [previewKey, setPreviewKey] = useState(0);
useEffect(() => {
  const saved = localStorage.getItem("websiteProjects");

  if (saved) {
    try {
      setProjectHistory(JSON.parse(saved));
    } catch (error) {
      console.error("Failed to load project history:", error);
    }
  }
}, []);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  

  // Existing files
  const [files, setFiles] = useState([]);

  // Existing file viewer
  const [openFile, setOpenFile] = useState(null);

  // NEW: live preview
  const [preview, setPreview] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [selectedModel, setSelectedModel] =
    useState(MODEL_OPTIONS[0]);

  const [userName, setUserName] = useState("");
  const [signinOpen, setSigninOpen] = useState(false);
  const [signinName, setSigninName] = useState("");

  const bottomRef = useRef(null);

  // ==========================================
  // SCROLL CHAT
  // ==========================================

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // ==========================================
  // INITIAL LOAD
  // ==========================================

  useEffect(() => {
    refreshFiles();

    const savedName =
      window.localStorage.getItem(
        "website-builder-user"
      );

    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  // ==========================================
  // SIGN IN
  // ==========================================

  function signIn(e) {
    e.preventDefault();

    const name = signinName.trim();

    if (!name) return;

    window.localStorage.setItem(
      "website-builder-user",
      name
    );

    setUserName(name);
    setSigninName("");
    setSigninOpen(false);
  }

  // ==========================================
  // SIGN OUT
  // ==========================================

  function signOut() {
    window.localStorage.removeItem(
      "website-builder-user"
    );

    setUserName("");
  }

  // ==========================================
  // GET FILE LIST
  // ==========================================

  async function refreshFiles() {
    try {
      const res = await fetch("/api/files");

      const data = await res.json();

      setFiles(data.files || []);
    } catch {
      // Ignore
    }
  }

  // ==========================================
  // CREATE WEBSITE PREVIEW
  // ==========================================

  function createPreview(generatedFiles) {
    if (!generatedFiles) {
      return "";
    }

    const html =
      generatedFiles["index.html"];

    if (!html) {
      console.log(
        "index.html was not returned"
      );

      return "";
    }

    const css =
      generatedFiles["style.css"] || "";

    const js =
      generatedFiles["script.js"] || "";

    let result = html;

    // ----------------------------------------
    // ADD CSS
    // ----------------------------------------

    if (css) {
      const styleTag = `
<style>
${css}
</style>
`;

      if (result.includes("</head>")) {
        result = result.replace(
          "</head>",
          `${styleTag}</head>`
        );
      } else {
        result =
          styleTag + result;
      }
    }

    // ----------------------------------------
    // ADD JAVASCRIPT
    // ----------------------------------------

    if (js) {
      const scriptTag = `
<script>
${js}
</script>
`;

      if (result.includes("</body>")) {
        result = result.replace(
          "</body>",
          `${scriptTag}</body>`
        );
      } else {
        result += scriptTag;
      }
    }

    return result;
  }

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  async function sendMessage(e) {
    if (e) {
      e.preventDefault();
    }

    const text = input.trim();

    if (!text || loading) {
      return;
    }

    setInput("");

    setMessages((m) => [
      ...m,
      {
        role: "user",
        text,
      },
    ]);

    setLoading(true);

    try {
      // --------------------------------------
      // API REQUEST
      // --------------------------------------

      const res = await fetch(
        "/api/agent",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message: text,
            history,
          }),
        }
      );

      // --------------------------------------
      // READ RESPONSE
      // --------------------------------------

      const responseText =
        await res.text();

      let data;

      try {
        data =
          JSON.parse(responseText);
      } catch {
        throw new Error(
          responseText ||
            "Server returned invalid JSON"
        );
      }

      if (!res.ok) {
        throw new Error(
          data.error ||
            "Request failed"
        );
      }

      // --------------------------------------
      // UPDATE HISTORY
      // --------------------------------------

      setHistory(
        data.history || []
      );

      // --------------------------------------
      // AI MESSAGE
      // --------------------------------------

      setMessages((m) => [
        ...m,
        {
          role: "agent",
          text:
            data.reply ||
            "Website created successfully.",

          toolLogs:
            data.toolLogs || [],
        },
      ]);

      // ======================================
      // LIVE WEBSITE PREVIEW
      // ======================================

      if (data.generatedFiles) {
        console.log(
          "Generated files:",
          data.generatedFiles
        );

        // Get file names
        const generatedFileNames =
          Object.keys(
            data.generatedFiles
          );

        if (
          generatedFileNames.length > 0
        ) {
          setFiles(
            generatedFileNames
          );
        }

        // Create complete HTML
        const website =
          createPreview(
            data.generatedFiles
          );

        if (website) {
          console.log(
            "Website preview created"
          );

          setPreview(
            website
          );

          // Automatically show preview
          setPreviewOpen(true);
        } else {
          console.log(
            "Could not create preview"
          );
        }
      }
    } catch (err) {
      console.error(
        "Agent error:",
        err
      );

      setMessages((m) => [
        ...m,
        {
          role: "agent",
          text:
            `⚠️ ${
              err.message ||
              "Something went wrong"
            }`,
          toolLogs: [],
        },
      ]);
    } finally {
      setLoading(false);

      refreshFiles();
    }
  }

  // ==========================================
  // VIEW FILE
  // ==========================================

  async function viewFile(name) {
    try {
      const res = await fetch(
        `/api/files?file=${encodeURIComponent(
          name
        )}`
      );

      const data =
        await res.json();

      if (res.ok) {
        setOpenFile({
          name,
          content: data.content,
        });
      }
    } catch {
      // Ignore
    }
  }

  // ==========================================
  // NEW CHAT
  // ==========================================

  function newChat() {
    setMessages([]);
    setHistory([]);
    setOpenFile(null);

    // Clear preview for new project
    setPreview("");
    setPreviewOpen(false);
  }

  // ==========================================
  // RETURN UI
  // ==========================================

  return (
    <div
      className={`app-shell ${
        darkMode ? "dark" : "light"
      }`}
    >
      {/* ====================================
          TOP BAR
      ==================================== */}

      <header className="topbar">
        <div className="topbar-left">

          <button
            className="icon-button"
            onClick={() =>
              setSidebarOpen(
                (v) => !v
              )
            }
            aria-label="Toggle sidebar"
          >
            {sidebarOpen
              ? "‹"
              : "☰"}
          </button>

          <div className="brand-wrap">

            <div className="brand-mark">
              ✦
            </div>

            <div className="brand-copy">

              <span className="brand-title">
                Website Builder
              </span>

              <span className="brand-subtitle">
                Personal AI assistant
              </span>

            </div>

          </div>

          {/* MODEL */}

          <div className="model-shell">

            <button
              className="model-pill"
              type="button"
              onClick={() =>
                setModelOpen(
                  (v) => !v
                )
              }
            >
              {selectedModel}

              <span>
                ⌄
              </span>
            </button>

            {modelOpen && (
              <div className="model-dropdown">

                <div className="dropdown-label">
                  Available Models
                </div>

                {MODEL_OPTIONS.map(
                  (model) => (
                    <button
                      key={model}
                      type="button"
                      className={`dropdown-item ${
                        selectedModel ===
                        model
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedModel(
                          model
                        );

                        setModelOpen(
                          false
                        );
                      }}
                    >

                      <span>
                        {model}
                      </span>

                      {selectedModel ===
                        model && (
                        <em>
                          ✓
                        </em>
                      )}

                    </button>
                  )
                )}

              </div>
            )}

          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="topbar-right">

          <button
            className="icon-button"
            type="button"
            aria-label="Toggle theme"
            onClick={() =>
              setDarkMode(
                (v) => !v
              )
            }
          >
            {darkMode
              ? "☀"
              : "☾"}
          </button>

          <button
            className="icon-button"
            type="button"
            aria-label="Settings"
          >
            ⚙
          </button>

          <button
            className="avatar-badge"
            type="button"
            aria-label={
              userName
                ? "Sign out"
                : "Sign in"
            }
            onClick={() =>
              userName
                ? signOut()
                : setSigninOpen(
                    true
                  )
            }
          >
            {userName
              ? userName
                  .slice(0, 1)
                  .toUpperCase()
              : "U"}
          </button>

        </div>
      </header>

      {/* ====================================
          WORKSPACE
      ==================================== */}

      <div className="workspace">

        {/* ==================================
            SIDEBAR
        ================================== */}

        <aside
          className={`sidebar ${
            sidebarOpen
              ? "open"
              : "closed"
          }`}
        >

          <button
            className="new-chat"
            type="button"
            onClick={newChat}
          >
            <span>
              ＋
            </span>

            Start new
          </button>

          <div className="sidebar-section">

            <span className="section-label">
              Workspace
            </span>

            <button
              className="footer-link"
              type="button"
            >
              ▧ &nbsp; Files &
              documents
            </button>

            <button
              className="footer-link"
              type="button"
            >
              ▦ &nbsp; Images
            </button>

            <button
              className="footer-link"
              type="button"
            >
              □ &nbsp; Projects
            </button>

            <button
              className="footer-link"
              type="button"
            >
              ▹ &nbsp; Apps
            </button>

          </div>

          <div className="sidebar-section recent-section">

            <span className="section-label">
              Recent
            </span>

            <div className="recent-list">

              {messages.length >
              0 ? (

                <button
                  className="recent-item active"
                  type="button"
                >
                  {
                    messages[0]
                      .text
                  }
                </button>

              ) : (

                <div className="recent-placeholder">
                  Your recent builder
                  prompts appear here.
                </div>

              )}

            </div>

          </div>

          <div className="sidebar-footer">

            <button
              className="footer-link"
              type="button"
            >
              ⚙ &nbsp; Settings
            </button>

            <button
              className="footer-link"
              type="button"
            >
              ? &nbsp; Help
            </button>

            <div className="sidebar-signin">

              <strong>
                Get responses tailored
                to you
              </strong>

              <span>
                Sign in to save your
                builder history and
                files.
              </span>

              <button
                type="button"
                onClick={() =>
                  setSigninOpen(
                    true
                  )
                }
              >
                {userName
                  ? `Signed in as ${userName}`
                  : "Sign in"}
              </button>

            </div>

            <span className="status-pill">

              <i></i>

              Agent ready

            </span>

          </div>

        </aside>

        {/* ==================================
            CHAT PANEL
        ================================== */}

        <main className="chat-panel">

          {/* WELCOME */}

          {messages.length ===
            0 &&
            !loading && (
              <div className="welcome-screen">

                <div className="welcome-inner">

                  <div className="welcome-kicker">
                    {userName
                      ? `Welcome back, ${userName}`
                      : "Website Builder"}
                  </div>

                  <h1>
                    Build something
                    useful with AI
                  </h1>

                  <div className="suggestion-grid">

                    {SUGGESTIONS.map(
                      (
                        item,
                        index
                      ) => (

                        <button
                          key={item}
                          type="button"
                          className="suggestion-card"
                          onClick={() =>
                            setInput(
                              item
                            )
                          }
                        >

                          <span
                            className={`suggestion-icon tone-${
                              index %
                              3
                            }`}
                          >
                            {index ===
                            0
                              ? "✦"
                              : index ===
                                1
                              ? "◌"
                              : index ===
                                2
                              ? "✓"
                              : "✧"}
                          </span>

                          <span>
                            {item}
                          </span>

                          <b>
                            →
                          </b>

                        </button>

                      )
                    )}

                  </div>

                </div>

              </div>
            )}

          {/* CHAT */}

          {messages.length >
            0 && (
            <div className="chat-stream">

              {messages.map(
                (m, i) => (

                  <div
                    key={i}
                    className={`msg-row ${
                      m.role
                    }`}
                  >

                    <div className="avatar-mark">

                      {m.role ===
                      "user"
                        ? "U"
                        : "✦"}

                    </div>

                    <div className="message-bubble">

                      {/* TOOL LOGS */}

                      {m.toolLogs &&
                        m.toolLogs
                          .length >
                          0 && (

                          <div className="tool-stack">

                            {m.toolLogs.map(
                              (
                                t,
                                j
                              ) => (

                                <div
                                  key={j}
                                  className={`tool-row ${
                                    t
                                      .result
                                      ?.error
                                      ? "fail"
                                      : "ok"
                                  }`}
                                >

                                  <span>
                                    {t.tool ===
                                    "writeFile"
                                      ? `File: ${
                                          t
                                            .args
                                            ?.filepath ||
                                          "file"
                                        }`
                                      : `Run: ${
                                          t
                                            .args
                                            ?.command ||
                                          t.tool
                                        }`}
                                  </span>

                                  <em>
                                    {t
                                      .result
                                      ?.error
                                      ? "failed"
                                      : "done"}
                                  </em>

                                </div>

                              )
                            )}

                          </div>

                        )}

                      <p>
                        {m.text}
                      </p>

                    </div>

                  </div>

                )
              )}

              {/* LOADING */}

              {loading && (

                <div className="msg-row agent">

                  <div className="avatar-mark">
                    ✦
                  </div>

                  <div className="message-bubble typing-bubble">

                    <span className="working-label">
                      Building your website
                    </span>

                    <span className="typing-dots">

                      <i></i>
                      <i></i>
                      <i></i>

                    </span>

                  </div>

                </div>

              )}

              <div ref={bottomRef} />

            </div>
          )}

          {/* =================================
              COMPOSER
          ================================== */}

          <form
            className="composer"
            onSubmit={sendMessage}
          >

            <div className="composer-box">

              <textarea
                value={input}
                onChange={(e) =>
                  setInput(
                    e.target.value
                  )
                }
                placeholder="Ask anything about the website you want to build..."
                rows={1}
                disabled={loading}
              />

              <div className="composer-toolbar">

                <div className="left-tools">

                  <button
                    type="button"
                    className="tool-button"
                    aria-label="Add file"
                  >
                    ＋
                  </button>

                  <button
                    type="button"
                    className="tool-button"
                    aria-label="Voice input"
                  >
                    ◉
                  </button>

                  <button
                    type="button"
                    className="tool-button"
                    aria-label="Web search"
                  >
                    ◎
                  </button>

                </div>

                <button
                  type="submit"
                  className="send-button"
                  disabled={
                    loading ||
                    !input.trim()
                  }
                >
                  ↑
                </button>

              </div>

            </div>

          </form>

        </main>

        {/* ==================================
            OUTPUT / PREVIEW PANEL
        ================================== */}

        <aside className="files-panel">

          {/* --------------------------------
              PREVIEW HEADER
          --------------------------------- */}

          <div className="files-header">

            <div>

              <span className="section-label">
                Preview
              </span>

              <h3>
                Generated Website
              </h3>

            </div>

            {preview && (

              <button
                className="icon-button small"
                type="button"
                onClick={() =>
                  setPreviewOpen(
                    true
                  )
                }
                aria-label="Open preview"
              >
                ↗
              </button>

            )}

          </div>

          {/* --------------------------------
              PREVIEW BOX
          --------------------------------- */}

          <div
            style={{
              width: "100%",
              height: "420px",
              border:
                "1px solid var(--border, #ddd)",
              borderRadius: "12px",
              overflow:
                "hidden",
              background:
                "#ffffff",
              marginBottom:
                "20px",
            }}
          >

            {preview ? (

              <iframe
                key={preview}
                srcDoc={preview}
                title="Generated Website Preview"
                style={{
                  width:
                    "100%",
                  height:
                    "100%",
                  border:
                    "none",
                  display:
                    "block",
                  background:
                    "#ffffff",
                }}
                sandbox="
                  allow-scripts
                  allow-forms
                  allow-same-origin
                  allow-modals
                  allow-popups
                "
              />

            ) : (

              <div
                style={{
                  height:
                    "100%",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  flexDirection:
                    "column",
                  padding:
                    "30px",
                  textAlign:
                    "center",
                  color:
                    "#777",
                }}
              >

                <div
                  style={{
                    fontSize:
                      "36px",
                    marginBottom:
                      "12px",
                  }}
                >
                  ◇
                </div>

                <strong>
                  No preview yet
                </strong>

                <p
                  style={{
                    fontSize:
                      "13px",
                    lineHeight:
                      "1.5",
                    maxWidth:
                      "250px",
                  }}
                >
                  Describe a website
                  and the live preview
                  will appear here
                  automatically.
                </p>

              </div>

            )}

          </div>

          {/* --------------------------------
              FILES HEADER
          --------------------------------- */}

          <div className="files-header">

            <div>

              <span className="section-label">
                Output
              </span>

              <h3>
                Generated files
              </h3>

            </div>

            <button
              className="icon-button small"
              type="button"
              onClick={
                refreshFiles
              }
              aria-label="Refresh files"
            >
              ↻
            </button>

          </div>

          {/* --------------------------------
              FILE LIST
          --------------------------------- */}

          {files.length === 0 ? (

            <p className="files-empty">
              Files created by the agent
              will appear here.
            </p>

          ) : (

            <ul className="file-list">

              {files.map(
                (f) => (

                  <li key={f}>

                    <button
                      type="button"
                      onClick={() =>
                        viewFile(
                          f
                        )
                      }
                    >
                      {f}
                    </button>

                  </li>

                )
              )}

            </ul>

          )}

        </aside>

      </div>

      {/* ====================================
          FULL SCREEN WEBSITE PREVIEW
      ==================================== */}

      {previewOpen &&
        preview && (

          <div
            className="viewer-overlay"
            onClick={() =>
              setPreviewOpen(
                false
              )
            }
          >

            <div
              className="viewer-dialog"
              style={{
                width: "92vw",
                height: "90vh",
                maxWidth:
                  "1400px",
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              <div className="viewer-header">

                <span>
                  Live Website Preview
                </span>

                <button
                  className="icon-button"
                  type="button"
                  onClick={() =>
                    setPreviewOpen(
                      false
                    )
                  }
                  aria-label="Close preview"
                >
                  ×
                </button>

              </div>

              <iframe
                key={preview}
                srcDoc={preview}
                title="Live Website Preview"
                style={{
                  width:
                    "100%",
                  height:
                    "calc(100% - 55px)",
                  border:
                    "none",
                  background:
                    "#ffffff",
                }}
                sandbox="
                  allow-scripts
                  allow-forms
                  allow-modals
                  allow-popups
                "
              />

            </div>

          </div>
        )}

      {/* ====================================
          FILE VIEWER
      ==================================== */}

      {openFile && (

        <div
          className="viewer-overlay"
          onClick={() =>
            setOpenFile(null)
          }
        >

          <div
            className="viewer-dialog"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="viewer-header">

              <span>
                {openFile.name}
              </span>

              <button
                className="icon-button"
                type="button"
                onClick={() =>
                  setOpenFile(null)
                }
                aria-label="Close"
              >
                ×
              </button>

            </div>

            <pre>
              {openFile.content}
            </pre>

          </div>

        </div>

      )}

      {/* ====================================
          SIGN IN
      ==================================== */}

      {signinOpen && (

        <div
          className="signin-overlay"
          onClick={() =>
            setSigninOpen(
              false
            )
          }
        >

          <form
            className="signin-dialog"
            onSubmit={signIn}
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="signin-heading">

              <div className="brand-mark">
                ✦
              </div>

              <div>

                <h2>
                  Sign in locally
                </h2>

                <p>
                  Your name stays on this
                  device.
                </p>

              </div>

            </div>

            <label htmlFor="signin-name">
              Display name
            </label>

            <input
              id="signin-name"
              value={signinName}
              onChange={(e) =>
                setSigninName(
                  e.target.value
                )
              }
              placeholder="Enter your name"
              autoFocus
            />

            <div className="signin-actions">

              <button
                type="button"
                className="signin-cancel"
                onClick={() =>
                  setSigninOpen(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="signin-submit"
              >
                Continue
              </button>

            </div>

          </form>

        </div>

      )}

    </div>
  );
}