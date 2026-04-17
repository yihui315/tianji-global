# TimesFM API — TianJi Global 集成指南

## 架构概览

```
TianJi Global (Vercel)          TimesFM API (Modal.com)
┌─────────────────────┐        ┌─────────────────────────┐
│  /api/fortune       │───────▶│  POST /forecast         │
│  (FortuneEngine)     │        │  TimesFM 2.5 (200M)     │
│                      │◀───────│  GPU T4 / CPU           │
│  Planetary Signal    │        │  Cold start: ~30s       │
│  Generator          │        └─────────────────────────┘
└─────────────────────┘
```

## 部署步骤

### 1. 安装 Modal CLI 并登录

```bash
pip install modal
modal auth login
```

### 2. 部署 TimesFM API

```bash
cd timesfm-api
modal deploy deploy.py
```

首次部署会触发模型下载（约 800MB），需要 2-5 分钟。

部署成功后会输出 API URL，例如：
```
https://tianji---timesfm-fastapi-app.modal.run
```

### 3. 配置环境变量

```bash
# .env.local (本地开发)
TIMESFM_API_URL=https://tianji---timesfm-fastapi-app.modal.run
TIMESFM_API_KEY=your-modal-api-key  # 可选：Modal 支持 API Key 认证

# Vercel Environment Variables
TIMESFM_API_URL=https://tianji---timesfm-fastapi-app.modal.run
```

### 4. 本地开发测试

```bash
# 先检查系统资源
cd timesfm-api
modal run deploy.py  # 本地运行 FastAPI

# 测试 health 端点
curl https://your-app.modal.app/health
```

## API 端点

### POST /forecast

输入行星周期信号，返回预测运势。

**请求：**
```json
{
  "signal": [0.5, 0.3, -0.2, 0.8, 0.1, -0.4, ...],
  "context_len": 128,
  "horizon": 12,
  "series_id": "career_1990_male"
}
```

**响应：**
```json
{
  "point_forecast": [0.62, 0.71, 0.55, 0.48, ...],
  "quantile_forecast": [
    [0.3, 0.4, 0.2, ...],
    ...
  ],
  "model_version": "timesfm-2.5-200m-pytorch",
  "inference_time_ms": 142.3,
  "series_id": "career_1990_male",
  "context_used": 128,
  "horizon": 12
}
```

### GET /ready

检查模型是否已加载（冷启动后）。

## 行星信号说明

TimesFM 预测的信号来源是**行星周期特征**：

| 信号类型 | 来源 | 用途 |
|---|---|---|
| 速度异常 | 行星公转速度变化（快=膨胀期，慢=收缩期） | 判断时机好坏 |
| 黄经位置 | 行星在黄道带的精确位置（0-360°） | 判断领域强度 |
| 相位角度 | 行星间相位（合/冲/拱/刑） | 判断事件类型 |

每个信号是一个浮点数数组，索引是时间步（可按天/周/月）。

## 费用估算

| 环境 | 配置 | 费用 |
|---|---|---|
| Modal T4 GPU | 0.5 hr/day | ~$7/月 |
| Modal CPU | 24/7 运行 | ~$15/月（不推荐） |
| Vercel | Serverless | $0（调用 Modal） |

**优化建议**：Modal 的冷启动按调用计费，星座运势场景不需要实时，用 CPU 模式 + 缓存结果更划算。

## 本地开发（无 GPU）

```bash
# 用 CPU 模式运行（慢但不花钱）
modal run deploy.py --gpu=false
```

## 备用方案

如果不想用 Modal.com，可以：

1. **HuggingFace Inference Endpoints** — 托管的 S3 桶，按时计费
2. **AWS SageMaker** — 更贵但支持自定义容器
3. **本地预计算** — 将行星周期信号预先生成，API 只做简单映射

---

## 目录结构

```
timesfm-api/
├── deploy.py          # Modal.com 部署脚本
└── README.md          # 本文件
```
