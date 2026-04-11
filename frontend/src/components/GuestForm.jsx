import { useRef, useState } from "react";
import { api } from "../api.js";
import { IconBack } from "../icons.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";

const EMPTY = {
  gender: "male",
  name: "",
  age: "",
  height: "",
  education: "",
  job: "",
  city: "",
  intro: "",
  photo_url: "",
};

export default function GuestForm({ initial, onBack, onSaved, onDeleted, showToast }) {
  const isEdit = !!initial?.id;
  const [form, setForm] = useState(() => ({ ...EMPTY, ...(initial || {}) }));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const fileRef = useRef(null);

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadPhoto(file);
      f("photo_url", res.url);
    } catch (err) {
      showToast(err.detail || "上传失败");
    } finally {
      setUploading(false);
    }
  };

  const toPayload = () => ({
    name: form.name.trim(),
    gender: form.gender,
    age: form.age === "" ? null : Number(form.age),
    height: form.height === "" ? null : Number(form.height),
    education: form.education || null,
    job: form.job || null,
    city: form.city || null,
    intro: form.intro || null,
    photo_url: form.photo_url || null,
  });

  const save = async () => {
    if (!form.name.trim()) { showToast("请填写昵称"); return; }
    setSaving(true);
    try {
      const payload = toPayload();
      const res = isEdit
        ? await api.updateGuest(form.id, payload)
        : await api.createGuest(payload);
      showToast(isEdit ? "已更新" : "已添加");
      onSaved(res);
    } catch (err) {
      showToast(err.detail || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setRemoving(true);
    try {
      await api.deleteGuest(form.id);
      setConfirmOpen(false);
      showToast("已删除");
      onDeleted(form.id);
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
          <h1 className="header-title">{isEdit ? "编辑嘉宾" : "添加嘉宾"}</h1>
        </header>
        <section className="form-shell">
          <section className="form-section">
            <p className="section-title">基础资料</p>
            <div className="field">
              <label htmlFor="guest-gender">性别</label>
              <select id="guest-gender" value={form.gender} onChange={(e) => f("gender", e.target.value)}>
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="guest-name">昵称 / 代号 *</label>
              <input id="guest-name" value={form.name} onChange={(e) => f("name", e.target.value)} placeholder="例：小明" />
            </div>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="guest-age">年龄</label>
                <input id="guest-age" type="number" inputMode="numeric" value={form.age ?? ""} onChange={(e) => f("age", e.target.value)} placeholder="例：28" />
              </div>
              <div className="field">
                <label htmlFor="guest-height">身高（cm）</label>
                <input id="guest-height" type="number" inputMode="numeric" value={form.height ?? ""} onChange={(e) => f("height", e.target.value)} placeholder="例：175" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="guest-education">学历</label>
              <select id="guest-education" value={form.education || ""} onChange={(e) => f("education", e.target.value)}>
                <option value="">请选择</option>
                <option value="高中及以下">高中及以下</option>
                <option value="大专">大专</option>
                <option value="本科">本科</option>
                <option value="硕士">硕士</option>
                <option value="博士">博士</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="guest-job">职业</label>
              <input id="guest-job" value={form.job || ""} onChange={(e) => f("job", e.target.value)} placeholder="例：软件工程师" />
            </div>
            <div className="field">
              <label htmlFor="guest-city">城市</label>
              <input id="guest-city" value={form.city || ""} onChange={(e) => f("city", e.target.value)} placeholder="例：上海" />
            </div>
          </section>

          <section className="form-section">
            <p className="section-title">个人介绍</p>
            <div className="field">
              <label htmlFor="guest-intro">自我介绍</label>
              <textarea id="guest-intro" value={form.intro || ""} onChange={(e) => f("intro", e.target.value)} placeholder="写几句话介绍自己..." />
            </div>
          </section>

          <section className="form-section">
            <p className="section-title">照片</p>
            <div className="field">
              <label>照片（可选）</label>
              {form.photo_url ? (
                <div className="photo-preview">
                  <img src={form.photo_url} alt="嘉宾照片预览" />
                  <button className="photo-preview-remove" type="button" aria-label="移除已上传照片" onClick={() => f("photo_url", "")}>×</button>
                </div>
              ) : (
                <button className="photo-upload-area" type="button" onClick={() => fileRef.current?.click()}>
                  {uploading ? "上传中..." : "点击上传照片"}
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handlePhoto} />
            </div>
          </section>

          <div className="form-footer">
            <button className="form-btn" type="button" onClick={save} disabled={saving || uploading}>
              {saving ? "保存中..." : "保存资料"}
            </button>
            {isEdit && <button className="form-btn danger" type="button" onClick={() => setConfirmOpen(true)}>删除该嘉宾</button>}
          </div>
        </section>
      </main>
      <ConfirmDialog
        open={confirmOpen}
        title="删除该嘉宾？"
        message={`删除后「${form.name || "该嘉宾"}」的资料将无法恢复，相关口令的绑定也会同步失效。`}
        confirmText={removing ? "删除中..." : "确认删除"}
        cancelText="再想想"
        tone="danger"
        onConfirm={removing ? undefined : remove}
        onCancel={removing ? undefined : () => setConfirmOpen(false)}
      />
    </>
  );
}
