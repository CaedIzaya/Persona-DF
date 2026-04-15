# Persona DF (Delta Force 人格测试 MVP)

一个基于 **Next.js 15 + TypeScript + Tailwind CSS** 的轻量人格测试项目。  
当前版本聚焦：题目流程、六维匹配、彩蛋触发、结果页可传播展示。

## 技术栈

- Next.js 15（App Router）
- TypeScript
- Tailwind CSS
- 本地数据文件（无数据库、无鉴权、无支付）

## 目录结构

```text
app/                     路由页面（首页/答题/结果/人格预览）
src/components/          页面组件
src/lib/quiz/            核心逻辑（题库、人格、彩蛋、评分、类型）
content/                 文案与规则 md 文件（会被部署）
public/images/           静态图片资源
```

## 本地启动

```bash
npm install
npm run dev
```

默认地址：`http://localhost:3000`

## 构建校验

```bash
npm run typecheck
npm run build
```

## 数据与文案更新

- 题库：`src/lib/quiz/questions.ts`
- 人格池与六维预设：`src/lib/quiz/personas.ts`
- 彩蛋规则与展示：`src/lib/quiz/easterEggs.ts`、`src/lib/quiz/scoring.ts`
- 结果页解析文案：`content/analysis.md`

## `analysis.md` 读取规则

默认读取：`content/analysis.md`  
也可通过环境变量覆盖：

```bash
ANALYSIS_MD_PATH=/absolute/path/to/analysis.md
```

## 部署到 Vercel

1. 把本项目推到 Git 仓库（GitHub/GitLab/Bitbucket）。
2. 在 Vercel 导入仓库。
3. Build Command：`npm run build`（默认即可）。
4. Output 设置保持 Next.js 默认。
5. 如需外部文案路径，再配置 `ANALYSIS_MD_PATH` 环境变量。

## 备注

- 为避免开发态编码问题，静态资源路径统一使用英文文件名。
- `content/` 目录属于运行时依赖，必须提交到 Git。
