# 珊瑚王的专注游戏

在线数独 & 舒尔特方格 · 纯静态页面，可部署到 GitHub Pages / Netlify。

## 本地运行

1. 双击 `index.html`，或
2. `npx serve .` 后访问终端提示的地址

## 部署到 GitHub Pages（推荐）

### 第一次

1. 在 GitHub 新建仓库（例如 `coral-king-focus`），**不要**勾选 README
2. 在本项目目录执行：

```bash
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

3. 打开仓库 **Settings → Pages**
4. **Build and deployment** 选 **GitHub Actions**（已包含 `.github/workflows/pages.yml`）
5. 等 Actions 跑绿后，访问：`https://你的用户名.github.io/仓库名/`

### 之后更新

```bash
git add -A
git commit -m "更新站点"
git push
```

推送后 Actions 会自动重新发布。

## 部署到 Netlify（拖拽）

1. 打开 [https://app.netlify.com/drop](https://app.netlify.com/drop)
2. 把整个项目文件夹拖进去
3. 获得 `xxx.netlify.app` 地址

## 功能摘要

- **数独**：难度选择、笔记、提交答案、按日期本地提交记录、导出/清空
- **独立模式**：无提示，填满后点提交判定
- **舒尔特方格**：3×3～6×6，本地最佳成绩
- **主题**：深色 / 浅色 / 护眼绿 / 暖色

## 文件结构

```
├── index.html
├── sudoku.html
├── css/style.css
├── js/
│   ├── app.js
│   ├── sudoku.js
│   ├── sudoku-history.js
│   └── schulte.js
└── .github/workflows/pages.yml
```
