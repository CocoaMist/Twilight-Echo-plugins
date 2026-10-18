# Wallpaper Engine 动态背景

在 Twilight Echo 的 `设置 → 外观 → 动态壁纸` 里选择本机 Wallpaper Engine 壁纸，作为界面最底层播放。

作者：**Matsuki**  
插件 ID：`com.twilightecho.tool.wallpaper-engine`  
版本：`2.1.0` · 许可证：MIT

## 功能

- 壁纸列表：扫描 Steam 工坊 `431960`、`projects/myprojects` 和自定义目录，按真实路径去重。
- 播放：视频、网页、场景壁纸在界面底层播放。
- 场景：WebWallGL（MIT）实时渲染 `scene.pkg`，支持图层、粒子、模型、puppet、SceneScript 与常见效果。
- 画质：原画 / 1080P / 720P；场景按画质限制内部渲染分辨率。
- 位置：X / Y / Z 轴移动。
- 缩放：50%–200%。
- 填充：裁切铺满 / 完整显示 / 拉伸；暗化 0–50%。
- 静音：视频自动静音；网页壁纸同样静音。
- Web 资源：兼容 Spine / WebGL 画布和 `../assets` 这类项目根相对路径。
- 壁纸属性：应用壁纸后读取 `project.json` 的用户属性，在外观页生成开关/滑杆/颜色/下拉/文件控件；按条件显隐，修改实时作用于当前壁纸，覆盖值按壁纸记住，可恢复默认。
- 网页交互：点“交互”后网页层移到最上方，可直接点击；右上角“退出交互”恢复界面。
- 暂停 / 关闭：在同一个设置块内操作。

## 安装

使用已集成 Wallpaper Engine 渲染桥的 Twilight Echo，在「设置 → 插件 → 本地安装」
选择 `com.twilightecho.tool.wallpaper-engine-2.1.0.tep`，启用插件后完整退出并重启应用。
插件安装位置：

```text
%APPDATA%\TwilightEcho\plugins\com.twilightecho.tool.wallpaper-engine\2.1.0\
```

仅安装插件不能为未集成渲染桥的宿主增加画面。宿主接入方式见
[本体接入说明](docs/TE-PATCH.md)；当前适配目标为 Twilight Echo 1.3.1。
应用更新后如出现黑屏，请完整退出（包括托盘进程）再启动，避免旧主进程 CSP 继续拦截媒体。

## 使用

1. 启动 Twilight Echo，打开 `设置 → 外观`。
2. 在“动态壁纸”里选择壁纸、画质、填充/暗化。
3. 点“应用”；网页壁纸需要点击时点“交互”。

## 源码与打包

本目录由 `te-we-plugin.zip` 迁入，保留原来的插件服务、场景引擎、属性解析器、
渲染桥参考文件和开发工具。`bridge/we-background.js` 保留压缩包中的版本；
已集成宿主的适配桥由应用仓库维护，不应直接用此参考文件覆盖。

在插件仓库根目录执行：

```powershell
$env:TWILIGHT_ECHO_ROOT="D:\Project\Twilight_Echo"
pnpm run pack:wallpaper-engine
pnpm run test:wallpaper-engine
pnpm run validate:index
```

安装包输出到 `packages/com.twilightecho.tool.wallpaper-engine-2.1.0.tep`，
随后刷新本地 `plugins.json`。安装包包含 `index.mjs`、`lib/`、模块配置、
README、本体接入说明和渲染桥参考文件；不会运行参考桥或修改宿主 `app.asar`。

## 开发资料

- 先读 `AGENTS.md`
- 数据流与模块：`docs/ARCHITECTURE.md`
- 旧版宿主的手工适配资料：`docs/ADAPTING.md`、`COMPATIBILITY.json`
- 旧版已安装应用的只读检查（需要可用的 `@electron/asar`）：
  ```powershell
  node scripts/check-compat.mjs "D:\TwilightEcho"
  ```

`bridge/install.mjs` 是压缩包附带的旧安装器，会修改已安装应用及插件目录。
它仅作为历史开发工具保留，不随 TEP 打包，也不是已集成宿主的安装或升级步骤。

第三方库的原始署名与许可证保留在对应目录；参见 [第三方说明](THIRD_PARTY_NOTICES.md)。
