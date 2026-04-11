import { useState } from "react";
import { api } from "../api.js";
import { IconBack, IconMale, IconFemale } from "../icons.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";

function randomValue() {
  return Math.random().toString().slice(2, 6);
}

export default function TokenForm({ initial, guests, onBack, onSaved, onDeleted, showToast }) {
  const isEdit = !!initial?.id;
  const [value, setValue] = useState(initial?.value || randomValue());
  const [scope, setScope] = useState(initial?.scope || "all_male");
  const [selected, setSelected] = useState(initial?.guest_ids || []);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);

  const toggle = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const save = async () => {
    if (!value.trim()) { showToast("请填写口令"); return; }
    if (scope === "custom" && selected.length === 0) { showToast("请选择至少一位嘉宾"); return; }
    setSaving(true);
    try {
      const payload = {
        value: value.trim(),
        scope,
        guest_ids: scope === "custom" ? selected : [],
      };
      const res = isEdit
        ? await api.updateToken(initial.id, payload)
        : await api.createToken(payload);
      showToast(isEdit ? "已更新" : "已创建");
      onSaved(res);
    } catch (err) {
      if (err.status === 409) showToast("口令已存在");
      else showToast(err.detail || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setRemoving(true);
    try {
      await api.deleteToken(initial.id);
      setConfirmOpen(false);
      showToast("已删除");
      onDeleted(initial.id);
    } catch (err) {
      showToast(err.detail || "删除失败");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <main className="page form-page">
        <header className="header">
          <button className="header-back" onClick={onBack} aria-label="返回管理后台"><IconBack /></button>
          <h1 className="header-title">{isEdit ? "编辑口令" : "创建口令"}</h1>
        </header>
        <section className="form-shell">
          <section className="form-section">
            <p className="section-title">口令设置</p>
            <div className="field">
              <label htmlFor="token-value">口令</label>
              <input
                id="token-value"
                value={value}
                inputMode="numeric"
                onChange={(e) => setValue(e.target.value)}
                placeholder="例：8866"
                style={{ letterSpacing: "3px", fontWeight: 600 }}
              />
            </div>
            <div className="field">
              <label htmlFor="token-scope">可见范围</label>
              <select id="token-scope" value={scope} onChange={(e) => setScope(e.target.value)}>
                <option value="all_male">全部男嘉宾</option>
                <option value="all_female">全部女嘉宾</option>
                <option value="custom">指定嘉宾</option>
              </select>
            </div>
          </section>

          {scope === "custom" && (
            <section className="form-section">
              <p className="section-title">选择嘉宾</p>
              <div className="check-list">
                {guests.length === 0 && (
                  <div className="check-empty">
                    暂无嘉宾，请先添加
                  </div>
                )}
                {guests.map((g) => (
                  <label className="check-item" key={g.id}>
                    <input
                      type="checkbox"
                      checked={selected.includes(g.id)}
                      onChange={() => toggle(g.id)}
                    />
                    <span className={`gender-dot ${g.gender}`} aria-hidden="true">
                      {g.gender === "male" ? <IconMale /> : <IconFemale />}
                    </span>
                    <span>{g.name}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          <div className="form-footer">
            <button className="form-btn" type="button" onClick={save} disabled={saving}>
              {saving ? "保存中..." : "保存口令"}
            </button>
            {isEdit && <button className="form-btn danger" type="button" onClick={() => setConfirmOpen(true)}>删除该口令</button>}
          </div>
        </section>
      </main>
      <ConfirmDialog
        open={confirmOpen}
        title="删除该口令？"
        message={`删除后口令「${value || "该口令"}」将立即失效，使用该口令的访客将无法再进入。`}
        confirmText={removing ? "删除中..." : "确认删除"}
        cancelText="再想想"
        tone="danger"
        onConfirm={removing ? undefined : remove}
        onCancel={removing ? undefined : () => setConfirmOpen(false)}
      />
    </>
  );
}
