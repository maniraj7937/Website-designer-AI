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
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [openFile, setOpenFile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [modelOpen, setModelOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0]);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    refreshFiles();
  }, []);

  async function refreshFiles() {
    try {
      const res = await fetch("/api/files");
      const data = await res.json();
      setFiles(data.files || []);
    } catch {
      // ignore
    }
  }

  async function sendMessage(e) {
    if (e) e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setLoading(true);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");

      setHistory(data.history || []);
      setMessages((m) => [
        ...m,
        { role: "agent", text: data.reply, toolLogs: data.toolLogs || [] },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "agent", text: `⚠️ ${err.message}`, toolLogs: [] },
      ]);
    } finally {
      setLoading(false);
      refreshFiles();
    }
  }

  async function viewFile(name) {
    try {
      const res = await fetch(`/api/files?file=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (res.ok) setOpenFile({ name, content: data.content });
    } catch {
      // ignore
    }
  }

  function newChat() {
    setMessages([]);
    setHistory([]);
    setOpenFile(null);
  }

  return (
    <div className={`app-shell ${darkMode ? "dark" : "light"}`}>
      <header className="topbar">
        <div className="topbar-left">
          <button className="icon-button" onClick={() => setSidebarOpen((v) => !v)} aria-label="Toggle sidebar">
            {sidebarOpen ? "‹" : "☰"}
          </button>

          <div className="brand-wrap">
            <div className="brand-mark">✦</div>
            <div className="brand-copy">
              <span className="brand-title">Website</span>
              <span className="brand-subtitle">Builder</span>
            </div>
          </div>

          <div className="model-shell">
            <button className="model-pill" type="button" onClick={() => setModelOpen((v) => !v)}>
              {selectedModel} <span>⌄</span>
            </button>

            {modelOpen && (
              <div className="model-dropdown">
                <div className="dropdown-label">Available Models</div>
                {MODEL_OPTIONS.map((model) => (
                  <button
                    key={model}
                    type="button"
                    className={`dropdown-item ${selectedModel === model ? "selected" : ""}`}
                    onClick={() => {
                      setSelectedModel(model);
                      setModelOpen(false);
                    }}
                  >
                    <span>{model}</span>
                    {selectedModel === model && <em>✓</em>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="topbar-right">
          <button className="icon-button" type="button" aria-label="Toggle theme" onClick={() => setDarkMode((v) => !v)}>
            {darkMode ? "☀" : "☾"}
          </button>
          <button className="icon-button" type="button" aria-label="Settings">⚙</button>
          <button className="avatar-badge" type="button" aria-label="Profile">U</button>
        </div>
      </header>

      <div className="workspace">
        <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <button className="new-chat" type="button" onClick={newChat}>
            <span>＋</span> New chat
          </button>

          <div className="sidebar-section">
            <span className="section-label">Recent</span>
            <div className="recent-list">
              {messages.length > 0 ? (
                <button className="recent-item active" type="button">
                  {messages[0].text}
                </button>
              ) : (
                <div className="recent-placeholder">Your recent builder prompts appear here.</div>
              )}
            </div>
          </div>

          <div className="sidebar-footer">
            <button className="footer-link" type="button">Help & FAQ</button>
            <button className="footer-link" type="button">Activity</button>
            <button className="footer-link" type="button">Settings</button>
            <span className="status-pill"><i></i> Agent ready</span>
          </div>
        </aside>

        <main className="chat-panel">
          {messages.length === 0 && !loading && (
            <div className="welcome-screen">
              <div className="welcome-inner">
                <div className="welcome-kicker">Hello, User</div>
                <h1>How can I help you today?</h1>

                <div className="suggestion-grid">
                  {SUGGESTIONS.map((item, index) => (
                    <button key={item} type="button" className="suggestion-card" onClick={() => setInput(item)}>
                      <span className={`suggestion-icon tone-${index % 3}`}>{index === 0 ? "✦" : index === 1 ? "◌" : index === 2 ? "✓" : "✧"}</span>
                      <span>{item}</span>
                      <b>→</b>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.length > 0 && (
            <div className="chat-stream">
              {messages.map((m, i) => (
                <div key={i} className={`msg-row ${m.role}`}>
                  <div className="avatar-mark">{m.role === "user" ? "U" : "✦"}</div>
                  <div className="message-bubble">
                    {m.toolLogs && m.toolLogs.length > 0 && (
                      <div className="tool-stack">
                        {m.toolLogs.map((t, j) => (
                          <div key={j} className={`tool-row ${t.result?.error ? "fail" : "ok"}`}>
                            <span>{t.tool === "writeFile" ? `File: ${t.args?.filepath || "file"}` : `Run: ${t.args?.command || t.tool}`}</span>
                            <em>{t.result?.error ? "failed" : "done"}</em>
                          </div>
                        ))}
                      </div>
                    )}
                    <p>{m.text}</p>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="msg-row agent">
                  <div className="avatar-mark">✦</div>
                  <div className="message-bubble typing-bubble">
                    <span className="working-label">Building your website</span>
                    <span className="typing-dots"><i></i><i></i><i></i></span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          <form className="composer" onSubmit={sendMessage}>
            <div className="composer-box">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter a prompt here..."
                rows={1}
                disabled={loading}
              />
              <div className="composer-toolbar">
                <div className="left-tools">
                  <button type="button" className="tool-button" aria-label="Add file">＋</button>
                  <button type="button" className="tool-button" aria-label="Voice input">◉</button>
                  <button type="button" className="tool-button" aria-label="Web search">◎</button>
                </div>
                <button type="submit" className="send-button" disabled={loading || !input.trim()}>
                  ↑
                </button>
              </div>
            </div>
          </form>
        </main>

        <aside className="files-panel">
          <div className="files-header">
            <span className="section-label">Output</span>
            <h3>Generated files</h3>
            <button className="icon-button small" type="button" onClick={refreshFiles} aria-label="Refresh files">↻</button>
          </div>

          {files.length === 0 ? (
            <p className="files-empty">Files created by the agent will appear here.</p>
          ) : (
            <ul className="file-list">
              {files.map((f) => (
                <li key={f}><button type="button" onClick={() => viewFile(f)}>{f}</button></li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      {openFile && (
        <div className="viewer-overlay" onClick={() => setOpenFile(null)}>
          <div className="viewer-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="viewer-header">
              <span>{openFile.name}</span>
              <button className="icon-button" type="button" onClick={() => setOpenFile(null)} aria-label="Close">×</button>
            </div>
            <pre>{openFile.content}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
