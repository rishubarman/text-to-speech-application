import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Login from "./Login";
import Register from "./Register";

const API_BASE_URL = "http://localhost:8080";
const MAX_CHARACTERS = 500;

const voiceOptions = {
  English: [
    { name: "English Female", voice: "Samantha" },
    { name: "English Male", voice: "Daniel" }
  ],
  Hindi: [{ name: "Hindi Female", voice: "Lekha" }],
  Spanish: [{ name: "Spanish Female", voice: "Mónica" }],
  French: [{ name: "French Female", voice: "Amélie" }],
  German: [{ name: "German Female", voice: "Anna" }],
  Italian: [{ name: "Italian Female", voice: "Alice" }],
  Japanese: [{ name: "Japanese Female", voice: "Kyoko" }],
  Chinese: [{ name: "Chinese Female", voice: "Tingting" }]
};

const defaultSettings = {
  defaultLanguage: "English",
  defaultVoice: "Samantha",
  autoLoadHistory: true,
  confirmDelete: true
};

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showRegister, setShowRegister] = useState(false);
  const [activePage, setActivePage] = useState("home");
  const [user, setUser] = useState(() => readStorage("user", null));
  const [text, setText] = useState("");
  const [language, setLanguage] = useState(() => readStorage("voiceflowSettings", defaultSettings).defaultLanguage || "English");
  const [voice, setVoice] = useState(() => readStorage("voiceflowSettings", defaultSettings).defaultVoice || "Samantha");
  const [audioUrl, setAudioUrl] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [favorites, setFavorites] = useState(() => readStorage("voiceflowFavorites", []));
  const [settings, setSettings] = useState(() => readStorage("voiceflowSettings", defaultSettings));
  const [profileName, setProfileName] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const handleLogin = (userData) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setProfileName(userData?.name || "");
    setIsLoggedIn(true);
    setShowRegister(false);
    setActivePage("home");
    setError("");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
    setShowRegister(false);
    setActivePage("home");
    setText("");
    setAudioUrl("");
    setTranslatedText("");
    setHistory([]);
    setFavorites([]);
    setError("");
  };

  const handleShowRegister = () => {
    setError("");
    setShowRegister(true);
  };

  const handleBackToLogin = () => {
    setError("");
    setShowRegister(false);
  };

  const handleRegistered = () => {
    setShowRegister(false);
    setError("");
    showToast("Account created successfully. Please login.");
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await fetch(`${API_BASE_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
      });
      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }
      if (!response.ok) throw new Error("Failed to load speech history.");
      const data = await response.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("History error:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      setProfileName(user?.name || "");
      if (settings.autoLoadHistory) loadHistory();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem("voiceflowFavorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("voiceflowSettings", JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (key === "defaultLanguage") {
      const first = voiceOptions[value]?.[0]?.voice || "Samantha";
      setLanguage(value);
      setVoice(first);
      setSettings((prev) => ({ ...prev, defaultLanguage: value, defaultVoice: first }));
    }
    if (key === "defaultVoice") setVoice(value);
    showToast("Settings saved");
  };

  const handleLanguageChange = (event) => {
    const selectedLanguage = event.target.value;
    setLanguage(selectedLanguage);
    setVoice(voiceOptions[selectedLanguage][0].voice);
    setAudioUrl("");
    setTranslatedText("");
    setError("");
  };

  const handleVoiceChange = (event) => {
    setVoice(event.target.value);
    setAudioUrl("");
    setError("");
  };

  const deleteHistory = async (id) => {
    if (settings.confirmDelete && !window.confirm("Delete this speech from your history?")) return;
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/history/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const message = await response.text();
      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }
      if (!response.ok) throw new Error(message || "Failed to delete history.");
      setHistory((prev) => prev.filter((item) => item.id !== id));
      setFavorites((prev) => prev.filter((favoriteId) => favoriteId !== id));
      showToast("Speech deleted");
    } catch (err) {
      setError(err.message || "Failed to delete history.");
    }
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      showToast(exists ? "Removed from favorites" : "Added to favorites");
      return next;
    });
  };

  const generateSpeech = async () => {
    if (!text.trim()) return setError("Please enter some text.");
    if (text.length > MAX_CHARACTERS) return setError(`Text cannot exceed ${MAX_CHARACTERS} characters.`);
    setError("");
    setAudioUrl("");
    setTranslatedText("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login before generating speech.");
        setIsLoggedIn(false);
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text, language, voice })
      });
      const responseText = await response.text();
      let data = null;
      try { data = JSON.parse(responseText); } catch { data = null; }
      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }
      if (!response.ok) throw new Error(data?.message || data?.error || responseText || "Speech generation failed.");
      if (!data?.audioUrl) throw new Error("Audio file was not returned by the server.");
      setTranslatedText(data.translatedText || text);
      setAudioUrl(`${API_BASE_URL}/api/audio/${data.audioUrl}`);
      await loadHistory();
      showToast("Speech generated successfully");
    } catch (err) {
      setAudioUrl("");
      setTranslatedText("");
      setError(err.message || "Unable to generate speech.");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = () => {
    const updatedUser = { ...(user || {}), name: profileName.trim() || user?.name || "User" };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setProfileSaved(true);
    showToast("Profile updated");
    window.setTimeout(() => setProfileSaved(false), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? "Unknown date" : date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  };

  const currentVoices = voiceOptions[language] || voiceOptions.English;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const favoriteHistory = useMemo(() => history.filter((item) => favorites.includes(item.id)), [history, favorites]);

  if (!isLoggedIn && showRegister) return <Register onBackToLogin={handleBackToLogin} onRegistered={handleRegistered} />;
  if (!isLoggedIn) return <Login onLogin={handleLogin} onShowRegister={handleShowRegister} />;

  const navigate = (page) => {
    setActivePage(page);
    setError("");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand" onClick={() => navigate("home")}>
          <span className="brand-wave">◉</span>
          <span>Voice<span>Flow</span></span>
        </div>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="side-nav">
          <button className={activePage === "home" ? "nav-item active" : "nav-item"} onClick={() => navigate("home")}><span>⌂</span> Home</button>
          <button className={activePage === "history" ? "nav-item active" : "nav-item"} onClick={() => navigate("history")}><span>◷</span> History</button>
          <button className={activePage === "favorites" ? "nav-item active" : "nav-item"} onClick={() => navigate("favorites")}><span>♡</span> Favorites <b>{favorites.length}</b></button>
          <button className={activePage === "profile" ? "nav-item active" : "nav-item"} onClick={() => navigate("profile")}><span>♙</span> Profile</button>
          <button className={activePage === "settings" ? "nav-item active" : "nav-item"} onClick={() => navigate("settings")}><span>⚙</span> Settings</button>
        </nav>
        <div className="sidebar-spacer" />
        <div className="upgrade-card"><div className="upgrade-icon">✦</div><strong>VoiceFlow</strong><p>Your personal space for natural speech.</p></div>
        <button className="logout-side" onClick={handleLogout}><span>↪</span> Logout</button>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="mobile-brand">🔊 VoiceFlow</div>
          <div className="search-box">⌕ <input placeholder="Search voices, history..." onChange={(e) => { if (activePage !== "history") return; setHistory((prev) => prev); }} /></div>
          <div className="top-actions"><span className="notification">♧</span><button className="profile-mini" onClick={() => navigate("profile")}><span className="avatar">{(user?.name || user?.email || "U").charAt(0).toUpperCase()}</span><span><strong>{user?.name || "User"}</strong><small>VoiceFlow User</small></span><i>⌄</i></button></div>
        </header>

        <main className="content">
          {activePage === "home" && (
            <HomePage
              text={text} setText={setText} language={language} voice={voice} currentVoices={currentVoices}
              handleLanguageChange={handleLanguageChange} handleVoiceChange={handleVoiceChange} wordCount={wordCount}
              loading={loading} error={error} generateSpeech={generateSpeech} translatedText={translatedText} audioUrl={audioUrl}
              history={history} historyLoading={historyLoading} loadHistory={loadHistory} deleteHistory={deleteHistory}
              favorites={favorites} toggleFavorite={toggleFavorite} formatDate={formatDate}
            />
          )}
          {activePage === "history" && <HistoryPage history={history} loading={historyLoading} loadHistory={loadHistory} deleteHistory={deleteHistory} favorites={favorites} toggleFavorite={toggleFavorite} formatDate={formatDate} />}
          {activePage === "favorites" && <FavoritesPage history={favoriteHistory} deleteHistory={deleteHistory} favorites={favorites} toggleFavorite={toggleFavorite} formatDate={formatDate} navigate={navigate} />}
          {activePage === "profile" && <ProfilePage user={user} profileName={profileName} setProfileName={setProfileName} saveProfile={saveProfile} profileSaved={profileSaved} historyCount={history.length} favoriteCount={favorites.length} />}
          {activePage === "settings" && <SettingsPage settings={settings} updateSetting={updateSetting} languageOptions={Object.keys(voiceOptions)} voiceOptions={voiceOptions} />}
        </main>
        <footer className="app-footer">VOICEFLOW <span>•</span> More than text, a better way to listen.</footer>
      </div>
      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  );
}

function HomePage({ text, setText, language, voice, currentVoices, handleLanguageChange, handleVoiceChange, wordCount, loading, error, generateSpeech, translatedText, audioUrl, history, historyLoading, loadHistory, deleteHistory, favorites, toggleFavorite, formatDate }) {
  return (
    <>
      <section className="hero"><div><span className="eyebrow">TEXT TO SPEECH</span><h1>Turn your words<br />into <em>sound.</em></h1><p>Convert written text into clear, natural-sounding speech with multiple languages and voices.</p></div><div className="hero-art"><div className="orb">〰</div><span>Listen<br />Learn<br />Create</span></div></section>
      <section className="workspace-grid">
        <div className="composer panel">
          <div className="panel-title"><div><h2>Enter your text</h2><p>Write something you want VoiceFlow to speak.</p></div><span className="counter">{text.length}/{MAX_CHARACTERS}</span></div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={MAX_CHARACTERS} placeholder="Type or paste your text here..." />
          <div className="text-info"><span>Characters: {text.length}</span><span>Words: {wordCount}</span><button onClick={() => setText("")} disabled={!text}>Clear</button></div>
          <div className="selectors three">
            <div className="field"><label>Language</label><select value={language} onChange={handleLanguageChange}>{Object.keys(voiceOptions).map((lang) => <option key={lang}>{lang}</option>)}</select></div>
            <div className="field"><label>Voice</label><select value={voice} onChange={handleVoiceChange}>{currentVoices.map((item) => <option key={item.voice} value={item.voice}>{item.name}</option>)}</select></div>
            <div className="field"><label>Speed</label><select defaultValue="Normal"><option>Slow</option><option>Normal</option><option>Fast</option></select></div>
          </div>
          {error && <div className="error-message">⚠ {error}</div>}
          <button className="generate-button" onClick={generateSpeech} disabled={loading}>{loading ? <><span className="spinner" /> Generating Speech...</> : <>◉ Generate Speech</>}</button>
        </div>

        <div className="audio-panel panel">
          <div className="panel-title"><div><h2>Generated Audio</h2><p>{audioUrl ? `${voice} voice • ${language}` : "Your generated audio will appear here."}</p></div><span className={audioUrl ? "ready-badge" : "soft-badge"}>{audioUrl ? "✓ Ready" : "Waiting"}</span></div>
          {audioUrl ? <><div className="wave-card"><div className="waveform">▁▃▆▂▇▅▃▇▂▆▃▅▁▇▃▆▂▅▇▃</div></div><audio controls preload="metadata" src={audioUrl} className="audio-player" /><a href={audioUrl} download="generated-speech.wav" className="download-button">↓ Download Audio</a></> : <div className="audio-placeholder"><div>〰</div><strong>No audio yet</strong><span>Generate speech to preview it here.</span></div>}
          {translatedText && <div className="translation-box"><strong>Translated Text</strong><span>{language}</span><p>{translatedText}</p></div>}
        </div>
      </section>
      <section className="feature-row"><div><b>ϟ</b><strong>Fast & Reliable</strong><small>Generate speech in seconds</small></div><div><b>◎</b><strong>Multiple Languages</strong><small>8+ language options</small></div><div><b>♬</b><strong>Natural Voices</strong><small>Clear voice output</small></div><div><b>✓</b><strong>Secure & Private</strong><small>Your data stays yours</small></div></section>
      <section className="recent-section"><div className="section-heading"><div><span className="eyebrow">YOUR ACTIVITY</span><h2>Recent speeches</h2></div><button onClick={loadHistory}>{historyLoading ? "Loading..." : "View all →"}</button></div>{history.length === 0 ? <div className="empty-mini">🎙️ <span>No speeches yet. Generate your first one above.</span></div> : <div className="recent-list">{history.slice(0, 3).map((item) => <SpeechRow key={item.id} item={item} favorite={favorites.includes(item.id)} toggleFavorite={toggleFavorite} deleteHistory={deleteHistory} formatDate={formatDate} />)}</div>}</section>
    </>
  );
}

function HistoryPage({ history, loading, loadHistory, deleteHistory, favorites, toggleFavorite, formatDate }) {
  return <section className="page-card"><div className="page-heading"><div><span className="eyebrow">YOUR LIBRARY</span><h1>Speech History</h1><p>All of your previously generated speeches.</p></div><button className="secondary-button" onClick={loadHistory} disabled={loading}>↻ {loading ? "Loading..." : "Refresh"}</button></div>{history.length === 0 ? <EmptyState icon="◷" title="No speech history yet" text="Generate speech from the Home page and it will appear here." /> : <div className="history-table">{history.map((item) => <SpeechRow key={item.id} item={item} favorite={favorites.includes(item.id)} toggleFavorite={toggleFavorite} deleteHistory={deleteHistory} formatDate={formatDate} />)}</div>}</section>;
}

function FavoritesPage({ history, deleteHistory, favorites, toggleFavorite, formatDate, navigate }) {
  return <section className="page-card"><div className="page-heading"><div><span className="eyebrow">SAVED FOR YOU</span><h1>Favorites</h1><p>Quick access to speeches you marked as favorites.</p></div><span className="count-pill">{favorites.length} saved</span></div>{history.length === 0 ? <EmptyState icon="♡" title="No favorites yet" text="Star a speech from History or Home to save it here." action={<button className="primary-small" onClick={() => navigate("history")}>Go to History</button>} /> : <div className="history-table">{history.map((item) => <SpeechRow key={item.id} item={item} favorite toggleFavorite={toggleFavorite} deleteHistory={deleteHistory} formatDate={formatDate} />)}</div>}</section>;
}

function SpeechRow({ item, favorite, toggleFavorite, deleteHistory, formatDate }) {
  const audioUrl = `${API_BASE_URL}/api/audio/${item.audioUrl}`;
  return <article className="speech-row"><div className="speech-index">#{item.id}</div><div className="speech-content"><div className="speech-tags"><span>🌐 {item.language}</span><span>♬ {item.voice}</span><time>{formatDate(item.createdAt)}</time></div><p>{item.text}</p><audio controls preload="none" src={audioUrl} className="history-audio" /></div><div className="speech-actions"><button className={favorite ? "icon-button favorite" : "icon-button"} onClick={() => toggleFavorite(item.id)} title="Favorite">{favorite ? "★" : "☆"}</button><a href={audioUrl} download={item.audioUrl} className="icon-button" title="Download">↓</a><button className="icon-button danger" onClick={() => deleteHistory(item.id)} title="Delete">⌫</button></div></article>;
}

function ProfilePage({ user, profileName, setProfileName, saveProfile, profileSaved, historyCount, favoriteCount }) {
  const email = user?.email || "Not available";
  return <section className="page-card profile-page"><div className="profile-banner"><div className="large-avatar">{(profileName || email || "U").charAt(0).toUpperCase()}</div><div><span className="eyebrow">YOUR ACCOUNT</span><h1>{profileName || "VoiceFlow User"}</h1><p>{email}</p></div></div><div className="profile-grid"><div className="profile-form"><h2>Profile information</h2><p>Update the name displayed across your VoiceFlow workspace.</p><label>Full Name<input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Enter your name" /></label><label>Email<input value={email} disabled /></label><button className="generate-button profile-save" onClick={saveProfile}>{profileSaved ? "✓ Saved" : "Save Changes"}</button></div><div className="stats-card"><div><strong>{historyCount}</strong><span>Total speeches</span></div><div><strong>{favoriteCount}</strong><span>Favorites</span></div><div><strong>8</strong><span>Languages</span></div></div></div></section>;
}

function SettingsPage({ settings, updateSetting, languageOptions, voiceOptions }) {
  const voices = voiceOptions[settings.defaultLanguage] || voiceOptions.English;
  return <section className="page-card settings-page"><div className="page-heading"><div><span className="eyebrow">PREFERENCES</span><h1>Settings</h1><p>Customize how VoiceFlow behaves for you.</p></div><span className="settings-status">✓ Saved automatically</span></div><div className="settings-list"><SettingSelect title="Default language" description="Choose the language used when you start a new speech." value={settings.defaultLanguage} options={languageOptions} onChange={(e) => updateSetting("defaultLanguage", e.target.value)} /><SettingSelect title="Default voice" description="Choose your preferred voice for new speech requests." value={settings.defaultVoice} options={voices.map((v) => v.voice)} labels={voices.map((v) => v.name)} onChange={(e) => updateSetting("defaultVoice", e.target.value)} /><SettingToggle title="Load history automatically" description="Refresh your speech history when you sign in." value={settings.autoLoadHistory} onChange={(value) => updateSetting("autoLoadHistory", value)} /><SettingToggle title="Confirm before deleting" description="Ask for confirmation before removing a saved speech." value={settings.confirmDelete} onChange={(value) => updateSetting("confirmDelete", value)} /></div></section>;
}

function SettingSelect({ title, description, value, options, labels, onChange }) { return <div className="setting-item"><div><strong>{title}</strong><p>{description}</p></div><select value={value} onChange={onChange}>{options.map((option, i) => <option key={option} value={option}>{labels ? labels[i] : option}</option>)}</select></div>; }
function SettingToggle({ title, description, value, onChange }) { return <div className="setting-item"><div><strong>{title}</strong><p>{description}</p></div><button className={value ? "toggle on" : "toggle"} onClick={() => onChange(!value)} aria-pressed={value}><span /></button></div>; }
function EmptyState({ icon, title, text, action }) { return <div className="empty-state"><div className="empty-state-icon">{icon}</div><h2>{title}</h2><p>{text}</p>{action}</div>; }

export default App;
