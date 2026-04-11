import { useState } from "react";
import { api } from "../api.js";
import { saveAuth } from "../auth.js";
import { IconMark } from "../icons.jsx";

export default function EntryPage({ onEnter }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const value = code.trim();
    if (!value || loading) return;
    setLoading(true);
    setErr("");
    try {
      const res = await api.login(value);
      saveAuth(res.token, res.role);
      onEnter(res.role);
    } catch (e) {
      setErr(e.status === 401 ? "口令无效，请检查后重试" : e.detail || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page entry-page">
      <section className="entry">
        <div className="entry-brand" aria-hidden="true">
          <IconMark />
        </div>
        <div className="entry-copy">
          <p className="eyebrow">Matchmaking Wall</p>
          <h1 className="entry-title">相亲墙</h1>
          <p className="entry-sub">输入现场口令，快速查看嘉宾资料与介绍</p>
        </div>

        <div className="entry-panel">
          <label className="field-label" htmlFor="entry-code">入场口令</label>
          <input
            id="entry-code"
            className="entry-input"
            type="text"
            placeholder="请输入口令"
            autoComplete="one-time-code"
            enterKeyHint="go"
            value={code}
            onChange={(e) => { setCode(e.target.value); setErr(""); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            aria-describedby={err ? "entry-error" : "entry-hint"}
          />
          <p className="field-hint" id="entry-hint">支持主办方发放的访问口令</p>
          <button className="entry-btn" onClick={submit} disabled={loading}>
            {loading ? "登录中..." : "进入查看"}
          </button>
          {err && <div className="entry-err" id="entry-error" role="alert">{err}</div>}
        </div>
      </section>
    </main>
  );
}
