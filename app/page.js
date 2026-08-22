"use client";

import { useEffect, useRef, useState } from "react";

const SUGGESTIONS = [
  "Build a calculator website with a dark theme",
  "Build a personal portfolio website",
  "Build a todo list app",
];

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [openFile, setOpenFile] = useState(null);
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
      /* ignore */
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
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
      /* ignore */
    }
  }

  function newChat() {
    setMessages([]);
    setHistory([]);
  }

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="logo">◆</span>
          <div>
            <h1>AI Website Builder</h1>
            <p>Describe a website — the agent creates the files for you</p>
          </div>
        </div>
        <button className="ghost" onClick={newChat}>
          New chat
        </button>
      </header>

      <main className="layout">
        <section className="chat">
          <div className="messages">
            {messages.length === 0 && !loading && (
              <div className="empty">
                <h2>What should we build today?</h2>
                <div className="chips">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => setInput(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.role}`}>
                <div className="avatar">{m.role === "user" ? "You" : "AI"}</div>
                <div className="bubble">
                  {m.toolLogs && m.toolLogs.length > 0 && (
                    <div className="tools">
                      {m.toolLogs.map((t, j) => (
                        <div key={j} className={`tool ${t.result?.error ? "fail" : "ok"}`}>
                          <span className="tool-name">
                            {t.tool === "writeFile"
                              ? `📝 ${t.args?.filepath || "file"}`
                              : `⚡ ${t.args?.command || t.tool}`}
                          </span>
                          <span className="tool-status">
                            {t.result?.error ? "failed" : "done"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <p>{m.text}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="msg agent">
                <div className="avatar">AI</div>
                <div className="bubble">
                  <span className="typing">
                    <i></i>
                    <i></i>
                    <i></i>
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form className="composer" onSubmit={sendMessage}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Build a calculator website with a dark theme"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              {loading ? "Working…" : "Send"}
            </button>
          </form>
        </section>

        <aside className="sidebar">
          <div className="sidebar-head">
            <h3>Generated files</h3>
            <button className="ghost" onClick={refreshFiles}>
              ↻
            </button>
          </div>
          {files.length === 0 ? (
            <p className="hint">
              Files created by the agent will appear here. Click one to view its code.
            </p>
          ) : (
            <ul className="file-list">
              {files.map((f) => (
                <li key={f}>
                  <button onClick={() => viewFile(f)}>{f}</button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </main>

      {openFile && (
        <div className="overlay" onClick={() => setOpenFile(null)}>
          <div className="viewer" onClick={(e) => e.stopPropagation()}>
            <div className="viewer-head">
              <span>{openFile.name}</span>
              <button className="ghost" onClick={() => setOpenFile(null)}>
                ✕
              </button>
            </div>
            <pre>{openFile.content}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
