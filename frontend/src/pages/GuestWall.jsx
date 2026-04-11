import { useEffect, useState } from "react";
import { api } from "../api.js";
import { IconBack, IconMale, IconFemale, IconUser } from "../icons.jsx";

function GenderIcon({ gender }) {
  return (
    <span className={`gender-dot ${gender}`} aria-label={gender === "male" ? "男嘉宾" : "女嘉宾"}>
      {gender === "male" ? <IconMale /> : <IconFemale />}
    </span>
  );
}

function GuestMetaTags({ guest }) {
  return (
    <div className="card-tags">
      {guest.age && <span className="card-tag">{guest.age}岁</span>}
      {guest.city && <span className="card-tag">{guest.city}</span>}
      {guest.job && <span className="card-tag">{guest.job}</span>}
    </div>
  );
}

export default function GuestWall({ onLogout }) {
  const [guests, setGuests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.visitorGuests()
      .then((list) => setGuests(list || []))
      .catch((e) => setError(e.detail || "加载失败"))
      .finally(() => setLoading(false));
  }, []);

  if (selected) {
    const g = selected;
    return (
      <main className="page detail-page">
        <header className="header">
          <button className="header-back" onClick={() => setSelected(null)} aria-label="返回嘉宾列表"><IconBack /></button>
          <h1 className="header-title">嘉宾详情</h1>
        </header>

        <section className={`detail-hero ${g.photo_url ? "detail-hero--photo" : "detail-hero--empty"}`}>
          {g.photo_url ? (
            <img src={g.photo_url} alt={`${g.name}的照片`} />
          ) : (
            <div className="detail-photo-placeholder">
              <div className="detail-avatar-placeholder"><IconUser /></div>
              <span>暂无照片</span>
            </div>
          )}
        </section>

        <section className="detail-body" aria-label={`${g.name}的详细资料`}>
          <section className="detail-summary">
            <div className="detail-name-row">
              <h2 className="detail-name">{g.name}</h2>
              <GenderIcon gender={g.gender} />
            </div>
            <GuestMetaTags guest={g} />
          </section>

          <section className="detail-card">
            <h3 className="section-title">基础信息</h3>
            <dl className="detail-grid">
              <div className="detail-item"><dt className="detail-label">年龄</dt><dd className="detail-value">{g.age || "—"}</dd></div>
              <div className="detail-item"><dt className="detail-label">身高</dt><dd className="detail-value">{g.height ? `${g.height}cm` : "—"}</dd></div>
              <div className="detail-item"><dt className="detail-label">学历</dt><dd className="detail-value">{g.education || "—"}</dd></div>
              <div className="detail-item"><dt className="detail-label">职业</dt><dd className="detail-value">{g.job || "—"}</dd></div>
              <div className="detail-item"><dt className="detail-label">城市</dt><dd className="detail-value">{g.city || "—"}</dd></div>
            </dl>
          </section>

          {g.intro && (
            <section className="detail-card detail-intro">
              <h3 className="section-title">自我介绍</h3>
              <p className="detail-intro-text">{g.intro}</p>
            </section>
          )}
        </section>
      </main>
    );
  }

  const hasMale = guests.some((g) => g.gender === "male");
  const hasFemale = guests.some((g) => g.gender === "female");
  const genderLabel = hasMale && !hasFemale ? "男" : !hasMale && hasFemale ? "女" : "";

  return (
    <main className="page">
      <header className="header">
        <div>
          <p className="header-eyebrow">嘉宾浏览</p>
          <h1 className="header-title">{genderLabel}嘉宾墙</h1>
        </div>
        <button className="header-action header-action--muted" onClick={onLogout}>退出</button>
      </header>
      {loading ? (
        <div className="empty">加载中...</div>
      ) : error ? (
        <div className="empty">{error}</div>
      ) : guests.length === 0 ? (
        <div className="empty">暂无嘉宾</div>
      ) : (
        <section className="content">
          <section className="section-intro">
            <p className="section-title">已开放 {guests.length} 位嘉宾资料</p>
            <p className="section-sub">点击卡片查看完整资料与自我介绍</p>
          </section>
          <div className="list">
          {guests.map((g) => (
            <button className="card" type="button" key={g.id} onClick={() => setSelected(g)} aria-label={`查看${g.name}的嘉宾详情`}>
              <div className="card-avatar">
                {g.photo_url ? <img src={g.photo_url} alt={`${g.name}的头像`} /> : <IconUser />}
              </div>
              <div className="card-info">
                <div className="card-name">
                  {g.name}
                  <GenderIcon gender={g.gender} />
                </div>
                <GuestMetaTags guest={g} />
              </div>
              <span className="card-cta">查看</span>
            </button>
          ))}
          </div>
        </section>
      )}
    </main>
  );
}
