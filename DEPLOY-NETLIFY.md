# Netlify 部署（方案 3 · 国内访问通常比 GitHub 快）

项目是纯静态页，**不用构建**，连上 GitHub 后每次 `git push` 会自动发布。

## 方式 A：连接 GitHub（推荐）

1. 打开 [https://app.netlify.com](https://app.netlify.com) 并注册 / 登录  
2. 选 **Sign up with GitHub**（用 GitHub 账号登录最省事）  
3. 点击 **Add new site** → **Import an existing project**  
4. 选 **GitHub**，授权后选择仓库 **`coral-king-focus`**  
5. 构建设置（很重要）：

   | 项 | 填什么 |
   |----|--------|
   | Branch to deploy | `main` |
   | Build command | **留空** |
   | Publish directory | **`.`** 或留空（根目录） |

6. 点 **Deploy site**  
7. 等 1～2 分钟，会得到地址，例如：

   `https://随机名.netlify.app`

8. （可选）**Site configuration** → **Domain management** → **Options** → 改站点名为 `coral-king-focus` 等，地址会变成：

   `https://coral-king-focus.netlify.app`

### 以后更新

```powershell
cd "C:\Users\zxmk7\Desktop\在线数独生成器"
git add -A
git commit -m "更新"
git push origin main
```

Netlify 会自动重新部署（约 1 分钟）。

---

## 方式 B：拖拽上传（不用连 GitHub）

1. 打开 [https://app.netlify.com/drop](https://app.netlify.com/drop)  
2. 把下面这些**拖进页面**（或打 zip 再拖）：

   - `index.html`
   - `sudoku.html`
   - 整个 `css` 文件夹
   - 整个 `js` 文件夹

3. 立刻得到临时网址  

缺点：每次改代码要重新拖一遍，不如方式 A。

---

## 和 GitHub / Gitee 的关系

| 平台 | 作用 |
|------|------|
| **GitHub** | 代码主仓库，可保留 Pages 备份 |
| **Gitee** | 国内代码备份 |
| **Netlify** | **给对象玩的正式链接**（国内一般更顺） |

发给对象的链接用 **Netlify 的 `.netlify.app` 地址**即可。

---

## 常见问题

**部署后 404？**  
确认 Publish directory 是根目录 `.`，且仓库根目录有 `index.html`。

**想换自定义域名？**  
Netlify 后台可绑自己的域名（`.com` 等需在域名商做 DNS 解析）。

**Cloudflare Pages**  
若 Netlify 不满意，可用同样方式在 [Cloudflare Pages](https://pages.cloudflare.com) 连接同一 GitHub 仓库，构建设置相同（无 build，输出目录 `/`）。
