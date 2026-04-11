import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import Toast from "../components/Toast.jsx";
import GuestForm from "../components/GuestForm.jsx";
import TokenForm from "../components/TokenForm.jsx";
import { IconEdit, IconFemale, IconMale, IconPlus, IconUser } from "../icons.jsx";

export default function AdminPanel({ onLogout }) {
  const [tab, setTab] = useState("guests");
  const [guests, setGuests] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [view, setView] = useState("list"); // list | form
  const [editGuest, setEditGuest] = useState(null);
  const [editToken, setEditToken] = useState(null);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  };

  const refresh = useCallback(async () => {
    try {
      const [g, t] = await Promise.all([api.listGuests(), api.listTokens()]);
      setGuests(g || []);
      setTokens(t || []);
    } catch (e) {
      showToast(e.detail || "加载失败");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleGuestSaved = async (saved) => {
    setGuests((prev) => {
      const exists = prev.some((g) => g.id === saved.id);
      return exists ? prev.map((g) => (g.id === saved.id ? saved : g)) : [saved, ...prev];
    });
    setView("list");
    setEditGuest(null);
  };

  const handleGuestDeleted = async (id) => {
    setGuests((prev) => prev.filter((g) => g.id !== id));
    // refresh tokens — cascade may have changed custom token links
    try {
      const t = await api.listTokens();
      setTokens(t || []);
    } catch {}
    setView("list");
    setEditGuest(null);
  };

  const handleTokenSaved = (saved) => {
    setTokens((prev) => {
      const exists = prev.some((t) => t.id === saved.id);
      return exists ? prev.map((t) => (t.id === saved.id ? saved : t)) : [saved, ...prev];
    });
    setView("list");
    setEditToken(null);
  };

  const handleTokenDeleted = (id) => {
    setTokens((prev) => prev.filter((t) => t.id !== id));
    setView("list");
    setEditToken(null);
  };

  const openGuest = (guest) => {
    setEditGuest(guest);
    setView("form");
  };

  const openToken = (token) => {
    setEditToken(token);
    setView("form");
  };

  if (view === "form" && tab === "guests") {
    return (
      <>
        <GuestForm
          initial={editGuest}
          onBack={() => { setView("list"); setEditGuest(null); }}
          onSaved={handleGuestSaved}
          onDeleted={handleGuestDeleted}
          showToast={showToast}
        />
        <Toast msg={toast} />
      </>
    );
  }

  if (view === "form" && tab === "tokens") {
    return (
      <>
        <TokenForm
          initial={editToken}
          guests={guests}
          onBack={() => { setView("list"); setEditToken(null); }}
          onSaved={handleTokenSaved}
          onDeleted={handleTokenDeleted}
          showToast={showToast}
        />
        <Toast msg={toast} />
      </>
    );
  }

  const guestNameMap = {};
  guests.forEach((g) => { guestNameMap[g.id] = g.name; });

  return (
    <>
      <main className="page">
        <header className="header">
          <div>
            <p className="header-eyebrow">移动端管理</p>
            <h1 className="header-title">管理后台</h1>
          </div>
          <button className="header-action header-action--muted" onClick={onLogout}>退出</button>
        </header>
        <section className="content">
          <section className="stats-grid" aria-label="后台统计">
            <div className="stat-card">
              <span className="stat-value">{guests.length}</span>
              <span className="stat-label">嘉宾</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{tokens.length}</span>
              <span className="stat-label">口令</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{tokens.filter((t) => t.scope === "custom").length}</span>
              <span className="stat-label">定向口令</span>
            </div>
          </section>

          <div className="tabs" role="tablist" aria-label="后台功能切换">
            <button
              className={`tab ${tab === "guests" ? "active" : ""}`}
              onClick={() => setTab("guests")}
              role="tab"
              aria-selected={tab === "guests"}
              aria-controls="admin-guests-panel"
              id="admin-guests-tab"
            >
              嘉宾管理
            </button>
            <button
              className={`tab ${tab === "tokens" ? "active" : ""}`}
              onClick={() => setTab("tokens")}
              role="tab"
              aria-selected={tab === "tokens"}
              aria-controls="admin-tokens-panel"
              id="admin-tokens-tab"
            >
              口令管理
            </button>
          </div>

          {loading && <div className="empty">加载中...</div>}

          {!loading && tab === "guests" && (
            <section role="tabpanel" id="admin-guests-panel" aria-labelledby="admin-guests-tab">
              <div className="section-head">
                <div>
                  <p className="section-title">嘉宾列表</p>
                  <p className="section-sub">共 {guests.length} 位，可点进编辑资料</p>
                </div>
                <button className="primary-action" type="button" onClick={() => { setEditGuest(null); setView("form"); }}>
                  <IconPlus /> 添加嘉宾
                </button>
              </div>
              {guests.length === 0 ? (
                <div className="empty">还没有嘉宾，先添加第一位</div>
              ) : (
                <div className="list">
                  {guests.map((g) => (
                    <div
                      className="card"
                      role="button"
                      tabIndex={0}
                      key={g.id}
                      onClick={() => openGuest(g)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openGuest(g);
                        }
                      }}
                    >
                      <div className="card-avatar">
                        {g.photo_url ? <img src={g.photo_url} alt={`${g.name}的头像`} /> : <IconUser />}
                      </div>
                      <div className="card-info">
                        <div className="card-name">
                          {g.name}
                          <span className={`gender-dot ${g.gender}`} aria-label={g.gender === "male" ? "男嘉宾" : "女嘉宾"}>
                            {g.gender === "male" ? <IconMale /> : <IconFemale />}
                          </span>
                        </div>
                        <div className="card-tags">
                          {g.age && <span className="card-tag">{g.age}岁</span>}
                          {g.city && <span className="card-tag">{g.city}</span>}
                          {g.job && <span className="card-tag">{g.job}</span>}
                        </div>
                      </div>
                      <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                        <button type="button" aria-label={`编辑${g.name}`} onClick={() => openGuest(g)}><IconEdit /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {!loading && tab === "tokens" && (
            <section role="tabpanel" id="admin-tokens-panel" aria-labelledby="admin-tokens-tab">
              <div className="section-head">
                <div>
                  <p className="section-title">口令列表</p>
                  <p className="section-sub">共 {tokens.length} 条，适合手机现场快速核发</p>
                </div>
                <button className="primary-action" type="button" onClick={() => { setEditToken(null); setView("form"); }}>
                  <IconPlus /> 创建口令
                </button>
              </div>
              {tokens.length === 0 ? (
                <div className="empty">还没有口令，先创建第一条</div>
              ) : (
                <div className="list">
                  {tokens.map((t) => (
                    <div
                      className="code-card"
                      role="button"
                      tabIndex={0}
                      key={t.id}
                      onClick={() => openToken(t)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openToken(t);
                        }
                      }}
                    >
                      <div className="code-header">
                        <div>
                          <div className="code-label">访问口令</div>
                          <div className="code-value">{t.value}</div>
                        </div>
                        <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                          <button type="button" aria-label={`编辑口令${t.value}`} onClick={() => openToken(t)}><IconEdit /></button>
                        </div>
                      </div>
                      <div className="code-meta">
                        {t.scope === "all_male"
                          ? "全部男嘉宾"
                          : t.scope === "all_female"
                          ? "全部女嘉宾"
                          : `指定 ${t.guest_ids.length} 位嘉宾`}
                      </div>
                      {t.scope === "custom" && (
                        <div className="code-guests">
                          {t.guest_ids.map((id) => (
                            <span className="code-guest-tag" key={id}>{guestNameMap[id] || "已删除"}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </section>
      </main>
      <Toast msg={toast} />
    </>
  );
}
