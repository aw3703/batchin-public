<div align="center">

# BatchIn 公共开发者资源

BatchIn API 的 SDK、CLI、MCP 连接器和 VaaS 收据验证工具。

[![Stars](https://img.shields.io/github/stars/aw3703/batchin-public?style=for-the-badge&logo=github&color=gold)](https://github.com/aw3703/batchin-public/stargazers)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue?style=for-the-badge)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/aw3703/batchin-public/ci.yml?branch=main&label=CI&style=for-the-badge)](https://github.com/aw3703/batchin-public/actions/workflows/ci.yml)
[![安全策略](https://img.shields.io/badge/security-policy-2f855a?style=for-the-badge)](SECURITY.md)

[官网](https://batchin.tech) · [API 参考](https://api.batchin.tech/openapi.json) · [讨论区](https://github.com/aw3703/batchin-public/discussions) · [贡献指南](CONTRIBUTING.md) · [English README](README.md)

</div>

---

## 仓库内容

本仓库提供 BatchIn 的公共客户端，不包含私有控制平面、提供商密钥、客户数据，也不对某个模型、路由、价格、支付方式或链上锚定状态做静态保证。

托管 API 才是可用性的事实来源。只有账号具备权限，并且 API 目录提供提供商、价格、用量和计费证据时，模型才可使用。SDK 会保留上游错误和不可用状态，不会把目录记录伪造成成功响应。

## 快速开始

```bash
npm install @batchin/sdk
pip install batchin
```

先读取 API Key 当前可用的模型，再使用返回的 ID。不要复制旧 README 或缓存示例中的模型 ID：

```bash
curl https://api.batchin.tech/v1/models \
  -H "Authorization: Bearer $BATCHIN_API_KEY"
```

```python
from batchin import BatchIn

client = BatchIn(api_key="your_batchin_api_key")
models = client.models.list()
model_id = models["data"][0]["id"]
response = client.chat.completions.create(
    model=model_id,
    messages=[{"role": "user", "content": "你好，BatchIn"}],
)
print(response)
```

OpenAI 兼容客户端使用 `https://api.batchin.tech/v1` 作为 Base URL，具体路由和参数以 API 参考为准。多模态和异步媒体任务需要单独的请求契约及已启用的路由。

## 包列表

| 包 | 生态 | 范围 |
| --- | --- | --- |
| [`@batchin/sdk`](packages/sdk-ts) | npm | TypeScript 请求、流式响应、模型发现和用量元数据 |
| [`batchin`](packages/sdk-python) | PyPI | Python 客户端和框架适配器 |
| [`@batchin/ai-sdk`](packages/ai-sdk) | npm | Vercel AI SDK 适配器 |
| [`batchin-mcp-server`](packages/mcp-server) | PyPI | 目录、推理、价格、追踪和收据工作流的 MCP 工具 |
| [`@batchin/cli`](packages/cli-ts) | npm | API 检查和模型发现 CLI |
| [`@batchin/vaas`](packages/vaas-sdk-ts) | npm | 收据与证据验证客户端 |
| [`batchin-vaas`](packages/vaas-sdk-python) | PyPI | Python 收据验证客户端 |
| [`@batchin/contracts`](packages/contracts) | npm / Solidity | VaaS 合约接口，使用前必须验证部署状态 |

包测试使用确定性 fixture 和 mock transport，不需要真实密钥。测试通过只代表客户端行为正确，不代表提供商、支付、模型或链上 smoke 已通过。

## VaaS 与支付就绪状态

提供真实收据包时，可以在本地验证 VaaS 收据。链上锚定、x402、USDC 和支付结算受账号和环境控制。把这些能力展示给客户前，请读取 API 就绪端点并核对账本记录。

```bash
npx @batchin/vaas verify <receipt-file-or-record-id> \
  --endpoint https://api.batchin.tech
```

测试 fixture、合约源文件、HTTP 200 或模型目录记录都不能单独作为生产推理或结算证据。

## 本地开发

```bash
git clone https://github.com/aw3703/batchin-public.git
cd batchin-public
npm install
npm run typecheck
npm run build
npm run test:ts
npm run test:py
npm run compliance
```

Python 包需要 Python 3.10+，Node 包需要 Node 20+。发布或使用构建产物前请阅读对应包的 README。不要提交 `.env`、API Key、提供商密钥、支付密钥或客户提示词。

## 问题与安全报告

运行问题请包含包名和版本、路由、模型 ID、请求 ID 或 trace ID 以及脱敏错误。模型接入请使用 model request 模板。漏洞请按 [SECURITY.md](SECURITY.md) 私下报告，不要发到公开 Issue。

## 路线图

公共仓库维护客户端契约和适配器。托管模型可用性、价格、提供商路由、多模态执行、计费、VaaS 锚定和 Agent 支付结算只会在私有控制平面完成 live smoke 与账本证据后发布。请关注 Releases 和 Discussions 的已验证变更。

## 许可证

使用 [Apache License 2.0](LICENSE) 授权。
