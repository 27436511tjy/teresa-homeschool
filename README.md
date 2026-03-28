# Teresa Homeschool 测试前完整存档

**存档时间**：2026-03-23 22:17
**存档目的**：开始测试前的系统状态备份

---

## 一、系统架构总览

```
Teresa Homeschool (teresa-homeschool.top)
├── 前端 (index.html) — 交互界面
├── 后端服务 (Node.js) — API + 生成逻辑
├── 内容生成器 (豆包API) — 数学/语文/PBL内容自动生成
├── 定时任务 (LaunchAgent + OpenClaw cron)
│   ├── 自动部署：每5分钟检查 Git 更新
│   ├── 日报发送：每天 21:00 → 飞书
│   ├── 周报发送：每周六 22:00 → 飞书
│   └── 月报发送：每月最后一天 19:00 → 飞书
└── 飞书通知 → 陶静远 (ou_4696b60c009c37025c8e747ca058048c)
```

## 二、文件清单

### 前端
- `index.html` — 主站入口
- `index_基础版.html` — 基础版备份
- `index_基础版2.0.html` — 基础版2.0备份
- `index_护眼前备份.html` — 护眼模式备份
- `plan.html` — 学习计划页面
- `teresa-pbl-18weeks.html` — PBL 18周页面

### 后端脚本
- `daily-report-v2.js` — 日报生成（v2）
- `daily-report.js` — 日报生成（v1）
- `math-daily-generator.js` — 数学内容每日生成
- `math-scheduler.js` — 数学定时调度
- `math-v2-api.js` — 数学API服务
- `dumbledore-proxy.js` — 邓布利多AI（流式对话）
- `voice-proxy.js` — 语音服务（TTS + ASR）
- `server-combined.js` — 合并服务
- `api-server.js` — API服务

### 定时脚本
- `scripts/send_reports.py` — 飞书报告发送
- `scripts/install_cron.sh` — 定时任务安装脚本
- `scripts/auto-deploy.sh` — 自动部署检查
- `scripts/auto-deploy-watch.sh` — 自动部署监控
- `scripts/generate-daily-content.sh` — 每日内容生成入口
- `scripts/daily-content-generator.sh` — 每日内容生成

### 内容生成器
- `teresa-math-generator/` — 数学内容生成器
- `teresa-chinese-generator/` — 语文内容生成器

### 数据文件
- `data/student_data.json` — 学生数据
- `data/learning_log.json` — 学习记录
- `data/daily_tasks/` — 每日任务数据
- `data/math/` — 数学数据

### 配置文件
- `config/system.yaml` — 系统配置
- `config/system.json` — 系统配置（JSON）
- `config/18week_plan.json` — 18周计划
- `config/interaction_rules.json` — 交互规则
- `config/pbl_*.json` — PBL相关配置
- `config/teresa_profile.json` — 学生画像

### 系统状态
- `system/crontab_snapshot.txt` — crontab 快照
- `system/com.teresa.homeschool.autodeploy.plist` — LaunchAgent

## 三、AI模型配置

| 任务 | 模型 | API |
|------|------|-----|
| 数学内容生成 | 豆包 doubao-seed-2-0-pro-260215 | 豆包 API |
| 语文内容生成 | 豆包 doubao-seed-2-0-pro-260215 | 豆包 API |
| 日报生成 | 豆包 doubao-seed-2-0-pro-260215 | 豆包 API |
| 邓布利多AI | 豆包 doubao-seed-2-0-pro-260215 | 豆包 API |
| 备用 | 讯飞星火 | 讯飞 API |

豆包API Key: `12ded337-7298-4ae7-8eff-5b5ebde935e2`

## 四、定时任务配置

### LaunchAgent（自动部署）
- 文件：`com.teresa.homeschool.autodeploy.plist`
- 触发：每5分钟检查 Git 仓库更新
- 行为：检测到更新 → git pull → 验证网站 → 发送飞书通知

### OpenClaw Cron（报告发送）
- 日报：每天 21:00 → 飞书 → 陶静远
- 周报：每周六 22:00 → 飞书 → 陶静远
- 月报：每月最后一天 19:00 → 飞书 → 陶静远

## 五、飞书配置

- APP ID: `cli_a9389539ceb81bd8`
- 目标用户: `ou_4696b60c009c37025c8e747ca058048c`（陶静远）
- 方式：tenant_access_token → IM API → open_id 私信

## 六、服务端口

| 端口 | 服务 |
|------|------|
| 8000 | 邓布利多AI |
| 8010 | 语音服务（TTS/ASR） |
| 8888 | Web前端 |
| 3000 | 豆包API服务 |
| 3001 | 数学API（讯飞星火） |
| 3002 | 数学V2 API（豆包） |
| 8889 | 日报/数学生成服务 |

## 七、Git仓库

- 仓库目录：`~/teresa-homeschool/`
- 远程：origin/main
- 部署平台：Vercel
- 网站地址：https://teresa-homeschool.top
