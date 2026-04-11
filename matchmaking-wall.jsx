import { useState, useEffect, useCallback, useRef } from "react";

const ADMIN_PWD = "admin888";

// ─── Helpers ───
const uid = () => Math.random().toString(36).slice(2, 10);
const S = window.storage;

async function loadData() {
  try {
    const g = await S.get("mm_guests");
    const c = await S.get("mm_codes");
    return {
      guests: g ? JSON.parse(g.value) : [],
      codes: c ? JSON.parse(c.value) : [],
    };
  } catch {
    return { guests: [], codes: [] };
  }
}
async function saveGuests(guests) {
  try { await S.set("mm_guests", JSON.stringify(guests)); return true; } catch(e) { console.error("saveGuests failed", e); return false; }
}
async function saveCodes(codes) {
  try { await S.set("mm_codes", JSON.stringify(codes)); return true; } catch(e) { console.error("saveCodes failed", e); return false; }
}

// ─── Icons ───
const IconBack = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10H5M5 10l5-5M5 10l5 5"/></svg>
);
const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 3v12M3 9h12"/></svg>
);
const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M2 4h12M5.33 4V2.67a1.33 1.33 0 011.34-1.34h2.66a1.33 1.33 0 011.34 1.34V4M13 4v9.33a1.33 1.33 0 01-1.33 1.34H4.33A1.33 1.33 0 013 13.33V4"/></svg>
);
const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11.33 2a1.89 1.89 0 012.67 2.67l-8.67 8.66L2 14l.67-3.33z"/></svg>
);
const IconMale = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="9.5" r="4"/><path d="M10 6l4-4M14 2h-3.5M14 2v3.5"/></svg>
);
const IconFemale = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="6" r="4"/><path d="M8 10v4.5M6 13h4"/></svg>
);
const IconKey = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M10 1l4 4-2 2-4-4"/><circle cx="5" cy="11" r="3.5"/></svg>
);
const IconUser = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="20" fill="var(--c-border)"/><circle cx="20" cy="15" r="6" fill="var(--c-muted)"/><path d="M8 34c0-6.63 5.37-12 12-12s12 5.37 12 12" fill="var(--c-muted)"/></svg>
);

// ─── Styles ───
const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap');

:root {
  --c-bg: #faf9f7;
  --c-card: #ffffff;
  --c-text: #1a1a1a;
  --c-text2: #666;
  --c-muted: #bbb;
  --c-border: #e8e6e3;
  --c-accent: #d4603a;
  --c-accent2: #c7553a;
  --c-male: #4a7fb5;
  --c-female: #c75a8a;
  --c-tag-bg: #f3f1ee;
  --radius: 12px;
  --shadow: 0 1px 3px rgba(0,0,0,.06), 0 4px 12px rgba(0,0,0,.04);
}

* { margin:0; padding:0; box-sizing:border-box; }
body { font-family:'Noto Sans SC',sans-serif; background:var(--c-bg); color:var(--c-text); -webkit-font-smoothing:antialiased; }

.app { max-width:480px; margin:0 auto; min-height:100vh; padding-bottom: env(safe-area-inset-bottom, 20px); }

/* ─ Entry ─ */
.entry { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; padding:40px 24px; }
.entry-logo { font-size:48px; margin-bottom:8px; }
.entry-title { font-size:22px; font-weight:700; letter-spacing:2px; margin-bottom:4px; }
.entry-sub { font-size:13px; color:var(--c-text2); margin-bottom:36px; }
.entry-input { width:100%; max-width:280px; padding:14px 16px; border:1.5px solid var(--c-border); border-radius:var(--radius); font-size:16px; text-align:center; background:var(--c-card); font-family:inherit; outline:none; transition:border .2s; letter-spacing:4px; }
.entry-input:focus { border-color:var(--c-accent); }
.entry-input::placeholder { letter-spacing:1px; color:var(--c-muted); }
.entry-btn { margin-top:16px; width:100%; max-width:280px; padding:14px; border:none; border-radius:var(--radius); background:var(--c-accent); color:#fff; font-size:15px; font-weight:600; font-family:inherit; cursor:pointer; transition:background .2s; }
.entry-btn:active { background:var(--c-accent2); }
.entry-err { margin-top:12px; font-size:13px; color:#d44; }

/* ─ Header ─ */
.header { position:sticky; top:0; z-index:100; background:rgba(250,249,247,.92); backdrop-filter:blur(12px); padding:12px 16px; display:flex; align-items:center; gap:12px; border-bottom:1px solid var(--c-border); }
.header-back { background:none; border:none; color:var(--c-text); cursor:pointer; padding:4px; display:flex; }
.header-title { font-size:16px; font-weight:600; flex:1; }
.header-action { background:none; border:none; color:var(--c-accent); cursor:pointer; padding:4px; display:flex; align-items:center; gap:4px; font-size:13px; font-weight:500; font-family:inherit; }

/* ─ Tabs ─ */
.tabs { display:flex; padding:8px 16px 0; gap:0; background:rgba(250,249,247,.92); backdrop-filter:blur(12px); position:sticky; top:49px; z-index:99; }
.tab { flex:1; padding:10px 0; text-align:center; font-size:14px; font-weight:500; color:var(--c-text2); border:none; background:none; cursor:pointer; border-bottom:2px solid transparent; font-family:inherit; transition:all .2s; }
.tab.active { color:var(--c-accent); border-bottom-color:var(--c-accent); }

/* ─ Lists ─ */
.list { padding:12px 16px; display:flex; flex-direction:column; gap:10px; }
.card { background:var(--c-card); border-radius:var(--radius); padding:14px; display:flex; align-items:center; gap:14px; box-shadow:var(--shadow); cursor:pointer; transition:transform .15s; border:1px solid var(--c-border); }
.card:active { transform:scale(.98); }
.card-avatar { width:52px; height:52px; border-radius:50%; overflow:hidden; flex-shrink:0; background:var(--c-tag-bg); display:flex; align-items:center; justify-content:center; }
.card-avatar img { width:100%; height:100%; object-fit:cover; }
.card-info { flex:1; min-width:0; }
.card-name { font-size:15px; font-weight:600; display:flex; align-items:center; gap:6px; }
.card-tags { display:flex; flex-wrap:wrap; gap:6px; margin-top:6px; }
.card-tag { font-size:11px; color:var(--c-text2); background:var(--c-tag-bg); padding:3px 8px; border-radius:20px; }
.card-actions { display:flex; gap:6px; }
.card-actions button { background:var(--c-tag-bg); border:none; border-radius:8px; padding:8px; cursor:pointer; color:var(--c-text2); display:flex; transition:background .2s; }
.card-actions button:active { background:var(--c-border); }

.gender-dot { display:inline-flex; }
.gender-dot.male { color:var(--c-male); }
.gender-dot.female { color:var(--c-female); }

/* ─ Detail ─ */
.detail { padding:0 0 24px; }
.detail-photo { width:100%; aspect-ratio:1; background:var(--c-tag-bg); display:flex; align-items:center; justify-content:center; overflow:hidden; }
.detail-photo img { width:100%; height:100%; object-fit:cover; }
.detail-photo-placeholder { color:var(--c-muted); font-size:14px; }
.detail-body { padding:20px 16px; }
.detail-name { font-size:22px; font-weight:700; display:flex; align-items:center; gap:8px; }
.detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:16px; }
.detail-item { }
.detail-label { font-size:11px; color:var(--c-muted); text-transform:uppercase; letter-spacing:1px; margin-bottom:2px; }
.detail-value { font-size:14px; font-weight:500; }
.detail-intro { margin-top:20px; padding-top:16px; border-top:1px solid var(--c-border); }
.detail-intro-title { font-size:13px; font-weight:600; margin-bottom:8px; }
.detail-intro-text { font-size:14px; line-height:1.7; color:var(--c-text2); white-space:pre-wrap; }

/* ─ Form ─ */
.form { padding:16px; display:flex; flex-direction:column; gap:16px; }
.field { display:flex; flex-direction:column; gap:4px; }
.field label { font-size:12px; font-weight:500; color:var(--c-text2); }
.field input, .field textarea, .field select { padding:12px; border:1.5px solid var(--c-border); border-radius:var(--radius); font-size:15px; font-family:inherit; background:var(--c-card); outline:none; transition:border .2s; }
.field input:focus, .field textarea:focus, .field select:focus { border-color:var(--c-accent); }
.field textarea { min-height:100px; resize:vertical; line-height:1.6; }
.form-btn { padding:14px; border:none; border-radius:var(--radius); background:var(--c-accent); color:#fff; font-size:15px; font-weight:600; font-family:inherit; cursor:pointer; margin-top:8px; }
.form-btn:active { background:var(--c-accent2); }
.form-btn.danger { background:#fff; color:#d44; border:1.5px solid #fcc; }
.form-btn.danger:active { background:#fee; }

/* ─ Code mgmt ─ */
.code-card { background:var(--c-card); border-radius:var(--radius); padding:14px; box-shadow:var(--shadow); border:1px solid var(--c-border); margin-bottom:10px; }
.code-header { display:flex; justify-content:space-between; align-items:center; }
.code-value { font-size:20px; font-weight:700; letter-spacing:3px; font-variant-numeric:tabular-nums; }
.code-meta { font-size:12px; color:var(--c-text2); margin-top:6px; }
.code-guests { display:flex; flex-wrap:wrap; gap:4px; margin-top:8px; }
.code-guest-tag { font-size:11px; background:var(--c-tag-bg); padding:2px 8px; border-radius:12px; color:var(--c-text2); }

.empty { text-align:center; padding:60px 24px; color:var(--c-muted); font-size:14px; }

/* ─ Checkbox list ─ */
.check-list { max-height:200px; overflow-y:auto; border:1.5px solid var(--c-border); border-radius:var(--radius); background:var(--c-card); }
.check-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-bottom:1px solid var(--c-border); font-size:14px; cursor:pointer; }
.check-item:last-child { border-bottom:none; }
.check-item input { accent-color:var(--c-accent); width:16px; height:16px; }

/* ─ Toast ─ */
.toast { position:fixed; bottom:80px; left:50%; transform:translateX(-50%); background:var(--c-text); color:#fff; padding:10px 24px; border-radius:20px; font-size:13px; z-index:999; animation:fadeUp .3s ease; }
@keyframes fadeUp { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }

.photo-upload-area { border:2px dashed var(--c-border); border-radius:var(--radius); padding:24px; text-align:center; cursor:pointer; color:var(--c-muted); font-size:13px; transition:border-color .2s; }
.photo-upload-area:active { border-color:var(--c-accent); }
.photo-preview { position:relative; }
.photo-preview img { width:100%; border-radius:var(--radius); max-height:200px; object-fit:cover; }
.photo-preview-remove { position:absolute; top:8px; right:8px; background:rgba(0,0,0,.5); color:#fff; border:none; border-radius:50%; width:28px; height:28px; cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px; }
`;

// ─── Components ───

function Toast({ msg }) {
  if (!msg) return null;
  return <div className="toast">{msg}</div>;
}

function EntryPage({ onEnter }) {
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!code.trim()) return;
    if (code.trim() === ADMIN_PWD) {
      onEnter("admin", null);
      return;
    }
    const data = await loadData();
    const found = data.codes.find((c) => c.value === code.trim());
    if (found) {
      onEnter("guest", found);
    } else {
      setErr("口令无效，请检查后重试");
    }
  };

  return (
    <div className="entry">
      <div className="entry-logo">💘</div>
      <div className="entry-title">相亲墙</div>
      <div className="entry-sub">输入口令查看嘉宾资料</div>
      <input
        className="entry-input"
        type="text"
        placeholder="请输入口令"
        value={code}
        onChange={(e) => { setCode(e.target.value); setErr(""); }}
        onKeyDown={(e) => e.key === "Enter" && submit()}
      />
      <button className="entry-btn" onClick={submit}>进 入</button>
      {err && <div className="entry-err">{err}</div>}
    </div>
  );
}

function GuestWall({ codeObj, onBack }) {
  const [guests, setGuests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData().then((d) => {
      let visible;
      if (codeObj.guestIds === "all_male") {
        visible = d.guests.filter((g) => g.gender === "male");
      } else if (codeObj.guestIds === "all_female") {
        visible = d.guests.filter((g) => g.gender === "female");
      } else {
        visible = d.guests.filter((g) => codeObj.guestIds.includes(g.id));
      }
      setGuests(visible);
      setLoading(false);
    });
  }, [codeObj]);

  if (selected) {
    const g = selected;
    return (
      <div className="detail">
        <div className="header">
          <button className="header-back" onClick={() => setSelected(null)}><IconBack /></button>
          <div className="header-title">嘉宾详情</div>
        </div>
        <div className="detail-photo">
          {g.photo ? <img src={g.photo} alt="" /> : <div className="detail-photo-placeholder">暂无照片</div>}
        </div>
        <div className="detail-body">
          <div className="detail-name">
            {g.name}
            <span className={`gender-dot ${g.gender}`}>{g.gender === "male" ? <IconMale /> : <IconFemale />}</span>
          </div>
          <div className="detail-grid">
            <div className="detail-item"><div className="detail-label">年龄</div><div className="detail-value">{g.age || "—"}</div></div>
            <div className="detail-item"><div className="detail-label">身高</div><div className="detail-value">{g.height ? g.height + "cm" : "—"}</div></div>
            <div className="detail-item"><div className="detail-label">学历</div><div className="detail-value">{g.education || "—"}</div></div>
            <div className="detail-item"><div className="detail-label">职业</div><div className="detail-value">{g.job || "—"}</div></div>
            <div className="detail-item"><div className="detail-label">城市</div><div className="detail-value">{g.city || "—"}</div></div>
          </div>
          {g.intro && (
            <div className="detail-intro">
              <div className="detail-intro-title">自我介绍</div>
              <div className="detail-intro-text">{g.intro}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const genderLabel = guests.length > 0 ? (guests[0]?.gender === "male" ? "男" : "女") : "";

  return (
    <div>
      <div className="header">
        <button className="header-back" onClick={onBack}><IconBack /></button>
        <div className="header-title">{genderLabel}嘉宾墙</div>
      </div>
      {loading ? (
        <div className="empty">加载中...</div>
      ) : guests.length === 0 ? (
        <div className="empty">暂无嘉宾</div>
      ) : (
        <div className="list">
          {guests.map((g) => (
            <div className="card" key={g.id} onClick={() => setSelected(g)}>
              <div className="card-avatar">
                {g.photo ? <img src={g.photo} alt="" /> : <IconUser />}
              </div>
              <div className="card-info">
                <div className="card-name">
                  {g.name}
                  <span className={`gender-dot ${g.gender}`}>{g.gender === "male" ? <IconMale /> : <IconFemale />}</span>
                </div>
                <div className="card-tags">
                  {g.age && <span className="card-tag">{g.age}岁</span>}
                  {g.city && <span className="card-tag">{g.city}</span>}
                  {g.job && <span className="card-tag">{g.job}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Admin ───
function AdminPanel({ onLogout }) {
  const [tab, setTab] = useState("guests");
  const [guests, setGuests] = useState([]);
  const [codes, setCodes] = useState([]);
  const [view, setView] = useState("list"); // list | form | detail
  const [editGuest, setEditGuest] = useState(null);
  const [editCode, setEditCode] = useState(null);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2000); };

  const refresh = useCallback(async () => {
    const d = await loadData();
    setGuests(d.guests);
    setCodes(d.codes);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // ── Guest form ──
  const GuestForm = () => {
    const isEdit = !!editGuest?.id;
    const [form, setForm] = useState(editGuest || { gender: "male", name: "", age: "", height: "", education: "", job: "", city: "", intro: "", photo: "" });
    const fileRef = useRef();

    const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

    const handlePhoto = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => f("photo", ev.target.result);
      reader.readAsDataURL(file);
    };

    const save = async () => {
      if (!form.name.trim()) { showToast("请填写昵称"); return; }
      let updated;
      if (isEdit) {
        updated = guests.map((g) => (g.id === form.id ? { ...form } : g));
      } else {
        updated = [...guests, { ...form, id: uid() }];
      }
      const ok = await saveGuests(updated);
      if (!ok) { showToast("保存失败，请重试"); return; }
      setGuests(updated);
      setView("list");
      setEditGuest(null);
      showToast(isEdit ? "已更新" : "已添加");
    };

    const remove = async () => {
      if (!confirm("确定删除该嘉宾？")) return;
      const updated = guests.filter((g) => g.id !== form.id);
      await saveGuests(updated);
      // also remove from codes
      const updCodes = codes.map((c) => {
        if (Array.isArray(c.guestIds)) {
          return { ...c, guestIds: c.guestIds.filter((id) => id !== form.id) };
        }
        return c;
      });
      await saveCodes(updCodes);
      setGuests(updated);
      setCodes(updCodes);
      setView("list");
      setEditGuest(null);
      showToast("已删除");
    };

    return (
      <>
        <div className="header">
          <button className="header-back" onClick={() => { setView("list"); setEditGuest(null); }}><IconBack /></button>
          <div className="header-title">{isEdit ? "编辑嘉宾" : "添加嘉宾"}</div>
        </div>
        <div className="form">
          <div className="field">
            <label>性别</label>
            <select value={form.gender} onChange={(e) => f("gender", e.target.value)}>
              <option value="male">男</option>
              <option value="female">女</option>
            </select>
          </div>
          <div className="field"><label>昵称 / 代号 *</label><input value={form.name} onChange={(e) => f("name", e.target.value)} placeholder="例：小明" /></div>
          <div className="field"><label>年龄</label><input type="number" value={form.age} onChange={(e) => f("age", e.target.value)} placeholder="例：28" /></div>
          <div className="field"><label>身高（cm）</label><input type="number" value={form.height} onChange={(e) => f("height", e.target.value)} placeholder="例：175" /></div>
          <div className="field">
            <label>学历</label>
            <select value={form.education} onChange={(e) => f("education", e.target.value)}>
              <option value="">请选择</option>
              <option value="高中及以下">高中及以下</option>
              <option value="大专">大专</option>
              <option value="本科">本科</option>
              <option value="硕士">硕士</option>
              <option value="博士">博士</option>
            </select>
          </div>
          <div className="field"><label>职业</label><input value={form.job} onChange={(e) => f("job", e.target.value)} placeholder="例：软件工程师" /></div>
          <div className="field"><label>城市</label><input value={form.city} onChange={(e) => f("city", e.target.value)} placeholder="例：上海" /></div>
          <div className="field"><label>自我介绍</label><textarea value={form.intro} onChange={(e) => f("intro", e.target.value)} placeholder="写几句话介绍自己..." /></div>
          <div className="field">
            <label>照片（可选）</label>
            {form.photo ? (
              <div className="photo-preview">
                <img src={form.photo} alt="" />
                <button className="photo-preview-remove" onClick={() => f("photo", "")}>×</button>
              </div>
            ) : (
              <div className="photo-upload-area" onClick={() => fileRef.current?.click()}>
                点击上传照片
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
          </div>
          <button className="form-btn" onClick={save}>保 存</button>
          {isEdit && <button className="form-btn danger" onClick={remove}>删除该嘉宾</button>}
        </div>
      </>
    );
  };

  // ── Code form ──
  const CodeForm = () => {
    const isEdit = !!editCode?.id;
    const [codeVal, setCodeVal] = useState(editCode?.value || Math.random().toString().slice(2, 6));
    const [scope, setScope] = useState(
      editCode ? (editCode.guestIds === "all_male" ? "all_male" : editCode.guestIds === "all_female" ? "all_female" : "custom") : "all_male"
    );
    const [selected, setSelected] = useState(
      editCode && Array.isArray(editCode.guestIds) ? editCode.guestIds : []
    );

    const toggle = (id) => setSelected((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

    const save = async () => {
      if (!codeVal.trim()) { showToast("请填写口令"); return; }
      if (scope === "custom" && selected.length === 0) { showToast("请选择至少一位嘉宾"); return; }
      const guestIds = scope === "custom" ? selected : scope;
      const obj = { id: editCode?.id || uid(), value: codeVal.trim(), guestIds, createdAt: editCode?.createdAt || Date.now() };
      let updated;
      if (isEdit) {
        updated = codes.map((c) => (c.id === obj.id ? obj : c));
      } else {
        // check duplicate
        if (codes.some((c) => c.value === codeVal.trim())) { showToast("口令已存在"); return; }
        updated = [...codes, obj];
      }
      await saveCodes(updated);
      setCodes(updated);
      setView("list");
      setEditCode(null);
      showToast(isEdit ? "已更新" : "已创建");
    };

    const remove = async () => {
      if (!confirm("确定删除该口令？")) return;
      const updated = codes.filter((c) => c.id !== editCode.id);
      await saveCodes(updated);
      setCodes(updated);
      setView("list");
      setEditCode(null);
      showToast("已删除");
    };

    return (
      <>
        <div className="header">
          <button className="header-back" onClick={() => { setView("list"); setEditCode(null); }}><IconBack /></button>
          <div className="header-title">{isEdit ? "编辑口令" : "创建口令"}</div>
        </div>
        <div className="form">
          <div className="field"><label>口令</label><input value={codeVal} onChange={(e) => setCodeVal(e.target.value)} placeholder="例：8866" style={{ letterSpacing: "3px", fontWeight: 600 }} /></div>
          <div className="field">
            <label>可见范围</label>
            <select value={scope} onChange={(e) => setScope(e.target.value)}>
              <option value="all_male">全部男嘉宾</option>
              <option value="all_female">全部女嘉宾</option>
              <option value="custom">指定嘉宾</option>
            </select>
          </div>
          {scope === "custom" && (
            <div className="field">
              <label>选择嘉宾</label>
              <div className="check-list">
                {guests.length === 0 && <div style={{ padding: 16, color: "var(--c-muted)", fontSize: 13, textAlign: "center" }}>暂无嘉宾，请先添加</div>}
                {guests.map((g) => (
                  <label className="check-item" key={g.id}>
                    <input type="checkbox" checked={selected.includes(g.id)} onChange={() => toggle(g.id)} />
                    <span className={`gender-dot ${g.gender}`}>{g.gender === "male" ? <IconMale /> : <IconFemale />}</span>
                    {g.name}
                  </label>
                ))}
              </div>
            </div>
          )}
          <button className="form-btn" onClick={save}>保 存</button>
          {isEdit && <button className="form-btn danger" onClick={remove}>删除该口令</button>}
        </div>
      </>
    );
  };

  // ── Main render ──
  if (view === "form" && tab === "guests") return <><GuestForm /><Toast msg={toast} /></>;
  if (view === "form" && tab === "codes") return <><CodeForm /><Toast msg={toast} /></>;

  const guestNameMap = {};
  guests.forEach((g) => { guestNameMap[g.id] = g.name; });

  return (
    <>
      <div className="header">
        <div className="header-title">管理后台</div>
        <button className="header-action" onClick={onLogout} style={{ color: "var(--c-text2)" }}>退出</button>
      </div>
      <div className="tabs">
        <button className={`tab ${tab === "guests" ? "active" : ""}`} onClick={() => setTab("guests")}>嘉宾管理</button>
        <button className={`tab ${tab === "codes" ? "active" : ""}`} onClick={() => setTab("codes")}>口令管理</button>
      </div>

      {tab === "guests" && (
        <>
          <div style={{ padding: "12px 16px 0", display: "flex", justifyContent: "flex-end" }}>
            <button className="header-action" onClick={() => { setEditGuest(null); setView("form"); }}><IconPlus /> 添加嘉宾</button>
          </div>
          {guests.length === 0 ? (
            <div className="empty">还没有嘉宾，点击右上角添加</div>
          ) : (
            <div className="list">
              {guests.map((g) => (
                <div className="card" key={g.id} onClick={() => { setEditGuest(g); setView("form"); }}>
                  <div className="card-avatar">
                    {g.photo ? <img src={g.photo} alt="" /> : <IconUser />}
                  </div>
                  <div className="card-info">
                    <div className="card-name">
                      {g.name}
                      <span className={`gender-dot ${g.gender}`}>{g.gender === "male" ? <IconMale /> : <IconFemale />}</span>
                    </div>
                    <div className="card-tags">
                      {g.age && <span className="card-tag">{g.age}岁</span>}
                      {g.city && <span className="card-tag">{g.city}</span>}
                      {g.job && <span className="card-tag">{g.job}</span>}
                    </div>
                  </div>
                  <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => { setEditGuest(g); setView("form"); }}><IconEdit /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === "codes" && (
        <>
          <div style={{ padding: "12px 16px 0", display: "flex", justifyContent: "flex-end" }}>
            <button className="header-action" onClick={() => { setEditCode(null); setView("form"); }}><IconPlus /> 创建口令</button>
          </div>
          {codes.length === 0 ? (
            <div className="empty">还没有口令，点击右上角创建</div>
          ) : (
            <div className="list">
              {codes.map((c) => (
                <div className="code-card" key={c.id} onClick={() => { setEditCode(c); setView("form"); }}>
                  <div className="code-header">
                    <div className="code-value">{c.value}</div>
                    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => { setEditCode(c); setView("form"); }}><IconEdit /></button>
                    </div>
                  </div>
                  <div className="code-meta">
                    {c.guestIds === "all_male" ? "全部男嘉宾" : c.guestIds === "all_female" ? "全部女嘉宾" : `指定 ${c.guestIds.length} 位嘉宾`}
                  </div>
                  {Array.isArray(c.guestIds) && (
                    <div className="code-guests">
                      {c.guestIds.map((id) => (
                        <span className="code-guest-tag" key={id}>{guestNameMap[id] || "已删除"}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <Toast msg={toast} />
    </>
  );
}

// ─── App ───
export default function App() {
  const [mode, setMode] = useState(null); // null | admin | guest
  const [codeObj, setCodeObj] = useState(null);

  const handleEnter = (m, c) => {
    setMode(m);
    setCodeObj(c);
  };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        {!mode && <EntryPage onEnter={handleEnter} />}
        {mode === "admin" && <AdminPanel onLogout={() => setMode(null)} />}
        {mode === "guest" && <GuestWall codeObj={codeObj} onBack={() => setMode(null)} />}
      </div>
    </>
  );
}
