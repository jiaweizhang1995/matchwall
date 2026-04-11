# 相亲墙 H5

移动端 H5 相亲墙：管理员后台管理嘉宾和访问口令，访客输入口令只能看到对应范围的嘉宾。

- 后端：FastAPI + SQLite
- 前端：React + Vite（单文件原型 `matchmaking-wall.jsx` 拆分而来）
- 单进程部署：FastAPI 托管前端静态产物 + 上传文件
- 生产部署：Docker Compose + Caddy（自动 HTTPS）

## 本地开发

### 后端
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
ADMIN_PASSWORD=admin888 JWT_SECRET=dev uvicorn app.main:app --reload
```
后端监听 `http://localhost:8000`。首次启动会在 `backend/data/` 下建 `app.db` 和 `uploads/`。

### 前端
```bash
cd frontend
npm install
npm run dev
```
Vite dev server 监听 `http://localhost:5173`，`/api` 和 `/uploads` 会代理到后端。

### 单进程联调
```bash
cd frontend && npm run build
# 把 dist 拷到 backend/static，或直接走 Docker
```

## 生产部署（阿里云 ECS 香港）

1. DNS：`wall.dscenter.work` A 记录指向 ECS 公网 IP
2. ECS 安全组放通 80 / 443
3. 服务器装 Docker + Compose
4. 上传/拉取代码，然后：
   ```bash
   cp .env.example .env
   # 编辑 .env 修改 ADMIN_PASSWORD 和 JWT_SECRET（openssl rand -hex 32）
   docker compose up -d --build
   ```
5. 首次启动 Caddy 自动向 Let's Encrypt 申请证书
6. 浏览器访问 `https://wall.dscenter.work`

### 数据位置
- SQLite：`./data/app.db`
- 照片：`./data/uploads/`
- Caddy 证书：`caddy_data` volume

备份只需打包 `./data/` 目录。

## API 总览

| 方法 | 路径 | 鉴权 | 说明 |
|---|---|---|---|
| POST | `/api/auth/login` | — | 统一入口，admin 密码或访客口令 |
| GET/POST/PUT/DELETE | `/api/admin/guests[/{id}]` | admin | 嘉宾 CRUD |
| GET/POST/PUT/DELETE | `/api/admin/tokens[/{id}]` | admin | 口令 CRUD |
| POST | `/api/admin/uploads` | admin | 照片上传（multipart） |
| GET | `/api/visitor/guests` | visitor | 按 token scope 返回 |
| GET | `/api/visitor/guests/{id}` | visitor | 不在 scope 返 403 |
| GET | `/api/health` | — | 健康检查 |
