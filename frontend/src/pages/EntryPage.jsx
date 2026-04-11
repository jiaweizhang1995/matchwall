import { useState } from "react";
import { api } from "../api.js";
import { saveAuth } from "../auth.js";

const titleChars = ["有", "缘", "簿"];

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
        <div className="entry-copy">
          <div className="entry-copy-frame">
            <blockquote className="entry-poem" aria-label="秦观 鹊桥仙">
              <p className="entry-poem-line">金风玉露一相逢，</p>
              <p className="entry-poem-line">便胜却人间无数。</p>
              <cite className="entry-poem-cite">——秦观《鹊桥仙·纤云弄巧》</cite>
            </blockquote>
            <h1 className="entry-title" aria-label="有缘簿">
              {titleChars.map((char) => (
                <span key={char}>{char}</span>
              ))}
            </h1>
          </div>
        </div>

        <div className="entry-panel">
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
            aria-label="入场口令"
            aria-describedby={err ? "entry-error" : undefined}
          />
          <button className="entry-btn" onClick={submit} disabled={loading}>
            {loading ? "登录中..." : "进入查看"}
          </button>
          {err && <div className="entry-err" id="entry-error" role="alert">{err}</div>}
        </div>
      </section>
    </main>
  );
}
