# Gitee（码云）部署说明

**可以实现。** 你的项目是纯静态页面，适合 Gitee Pages；国内访问通常比 GitHub 快。

## 前提（必做）

1. 注册 [https://gitee.com](https://gitee.com)
2. 完成 **实名认证**（未认证无法开 Pages）
3. 在 Gitee 新建仓库 **`coral-king-focus`**（与 GitHub 同名即可）
   - 不要勾选「使用 Readme 初始化仓库」（保持空仓库）

## 第一次：推送代码

在项目目录执行（把 `zx67834` 换成你的 Gitee 用户名）：

```powershell
cd "C:\Users\zxmk7\Desktop\在线数独生成器"

# 添加 Gitee 远程（只需一次）
git remote add gitee git@gitee.com:zx67834/coral-king-focus.git

# 推送 main 分支
git push -u gitee main
```

若尚未配置 Gitee SSH：Gitee → 设置 → SSH 公钥，添加与 GitHub 相同或新的公钥。

## 开启 Gitee Pages

1. 打开仓库 → 上方 **服务** → **Gitee Pages**
2. 若看不到该项：说明账号未实名，或当前账号/仓库类型不支持（见文末说明）
3. 配置：
   - **部署分支**：`main`
   - **部署目录**：`/`（根目录，因为 `index.html` 在仓库根下）
4. 勾选 **强制 HTTPS**（可选）
5. 点击 **启动** 或 **更新**

访问地址一般为：

**https://zx67834.gitee.io/coral-king-focus/**

（用户名、仓库名以你实际为准。）

## 以后更新网站

```powershell
git add -A
git commit -m "更新"
git push gitee main
```

**重要：** Gitee 免费版 Pages **不会**像 GitHub 那样自动发布。每次 push 后，要到仓库 **服务 → Gitee Pages → 点击「更新」**，等 1～2 分钟再访问。

可同时保留 GitHub 备份：

```powershell
git push origin main
git push gitee main
```

## 和 GitHub 对比

| 项目 | GitHub Pages | Gitee Pages |
|------|--------------|-------------|
| 国内访问 | 较慢、不稳定 | 一般较快 |
| 自动发布 | 可自动 | 多数需手动点「更新」 |
| 实名 | 不需要 | **需要** |
| 你的项目 | 已上线 | 按本文再部署一份 |

## 若仓库里没有「Gitee Pages」

Gitee 曾对 Pages 政策做过调整，部分新仓库可能看不到该服务。可选：

1. 仍用 **Gitee 存代码**，网站继续用已上线的 GitHub 地址（对象网络好时可用）
2. 改用 **腾讯云 COS / 阿里云 OSS** 静态托管（国内最稳，需注册云账号）

---

把 Gitee 仓库建好后，执行上面的 `git push gitee main`，再在 Pages 里点启动即可。
