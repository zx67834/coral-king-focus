# GitHub Pages 上线（只需点一次）

代码已推送到仓库，并准备了 **`gh-pages`** 分支用于发布。

## 请你完成这一处设置（约 30 秒）

1. 打开：https://github.com/zx67834/coral-king-focus/settings/pages  
2. **Build and deployment** → **Source** 选 **Deploy from a branch**  
3. **Branch** 选 **`gh-pages`**，文件夹选 **`/ (root)`**  
4. 点击 **Save**  
5. 等待 1～3 分钟，访问：

**https://zx67834.github.io/coral-king-focus/**

---

## 已完成的自动化

- `main` 分支：完整源码 + Actions 工作流  
- `gh-pages` 分支：仅网站文件（`index.html`、`css/`、`js/` 等）

## 以后更新网站

在项目目录执行：

```powershell
git checkout main
# 改完代码后
git add -A
git commit -m "更新"
git push

# 同步发布分支（或告诉我帮你执行）
git push origin main:gh-pages --force
```

更简单：只改 `main` 并 push，然后执行上面最后一行，把 `main` 的静态文件同步到 `gh-pages`。
