# 🧪 手机界面优化 - 本地测试指南

**日期:** 2026-03-20
**版本:** v3.1
**状态:** ✅ 优化完成，可以测试

---

## 🚀 快速开始

### 1. 启动游戏服务器
游戏服务器已运行在：
```
http://localhost:8080
```

### 2. 用浏览器打开游戏
在 Chrome/Firefox/Safari 中打开：
```
http://localhost:8080
```

---

## 📱 手机视图测试方法

### 方法 A：使用浏览器开发者工具（推荐）

#### Chrome 浏览器
1. 打开 http://localhost:8080
2. 按 `Ctrl+Shift+M` (Windows/Linux) 或 `Cmd+Shift+M` (Mac)
3. 在设备选择器中选择 **iPhone 12** (390×844)

#### Firefox 浏览器
1. 打开 http://localhost:8080
2. 按 `Ctrl+Shift+M` (Windows/Linux) 或 `Cmd+Shift+M` (Mac)
3. 在设备选择器中选择 **iPhone 12/13**

#### Safari 浏览器
1. 开启开发菜单：`Safari` → `偏好设置` → `高级` → 勾选"在菜单栏中显示开发菜单"
2. 打开 http://localhost:8080
3. 点击 `开发` → `进入响应式设计模式`
4. 选择 **iPhone** 视图

### 方法 B：使用真实手机
1. 确保手机和电脑在同一 WiFi 网络
2. 在手机上打开浏览器
3. 输入电脑 IP 地址和端口：`http://[你的电脑IP]:8080`
   - Windows：`ipconfig` 查看 IP
   - Mac/Linux：`ifconfig` 查看 IP

---

## ✅ 测试场景 1：英雄选择界面

### 场景流程
1. 打开游戏
2. 点击 **开始游戏** 按钮
3. 选择身份（主公/忠臣/反贼/内奸）
4. 进入英雄选择界面

### 验证项目
```
☐ 四个英雄卡片（英雄1、英雄2、英雄3、英雄4）
  在手机屏幕内完全可见

☐ 无需向下滚动即可看到所有 4 个英雄

☐ 卡片间距适当，不显得拥挤

☐ 卡片高度约为 95px（之前是 110px）

☐ 每行 2 个英雄，共 2 行

☐ 英雄名字清晰可读，不被截断

☐ 技能描述可见，不被隐藏

☐ 点击任意英雄卡片，进入游戏
```

### ❌ 不应该出现的情况
- ✗ 需要向下滚动才能看到全部英雄
- ✗ 英雄卡片被切断或重叠
- ✗ 文字太小或不清晰

---

## ✅ 测试场景 2：战斗界面 - 血格显示

### 场景流程
1. 完成英雄选择
2. 进入游戏战斗界面
3. 观察所有玩家和敌方的血格显示

### 验证项目

#### 玩家血格
```
☐ 显示正确的血值（绿色 ● 表示有血）

☐ 显示正确的失血情况（灰色 ● 表示无血）

☐ 血格数量过多时自动换行显示

☐ 血格不被挤压或变形

☐ 血格清晰可见，间距适当
```

#### 敌方血格
```
☐ 敌方1的血格正常显示

☐ 敌方2的血格正常显示

☐ 敌方3的血格正常显示

☐ 如果血格过多（≥15个），自动换行

☐ 没有重叠或显示异常
```

### 📊 血格尺寸对比
```
优化前：
- 血点大小：16px × 16px
- 不支持换行
- 容易挤压或超出边界

优化后：
- 血点大小：14px × 14px (PC), 13px × 13px (手机)
- 支持 flex-wrap 自动换行
- 最大宽度限制：180px (PC), 160px (手机)
- max-width 确保不会太宽
```

### ❌ 不应该出现的情况
- ✗ 血格显示变形（椭圆、不对称）
- ✗ 血格超出屏幕边界
- ✗ 血格数字与血条重叠
- ✗ 血格显示不完整

---

## ✅ 测试场景 3：战斗日志区域

### 场景流程
1. 在战斗界面进行游戏操作：
   - 点击 **【技能】** 按钮查看技能
   - 点击 **出牌** 按钮出一张卡
   - 点击 **结束** 按钮结束回合
2. 观察日志区域的显示

### 验证项目
```
日志显示
☐ 日志内容紧凑显示，没有多余空白

☐ 右侧没有大的空白区域

☐ 日志行高适当，不显得拥挤也不显得稀疏

☐ 日志文本自动换行（如果行太长）

☐ 日志字体大小合适，易于阅读

☐ 日志区域可以滚动查看历史记录

日志内容示例
☐ 看到"【回合开始】"
☐ 看到"你可以打出牌"
☐ 看到"敌方行动" 等信息

日志区域外观
☐ 日志背景清晰（深色背景）

☐ 日志文本颜色清晰（浅色文本）

☐ 没有与其他区域重叠
```

### 📏 日志区域尺寸对比
```
优化前：
- padding: 12px 18px (左右各 18px 空间)
- min-height: 100px
- font-size: 12px
- line-height: 1.5
- 导致右侧空白较大

优化后：
- padding: 10px 12px (手机: 8px 10px)
- min-height: 85-90px
- font-size: 11px (手机端)
- line-height: 1.4
- 右侧空白消除，内容更紧凑
```

### ❌ 不应该出现的情况
- ✗ 右侧有大量空白区域
- ✗ 日志文本过小难以阅读
- ✗ 日志行距过大显得稀疏
- ✗ 日志被其他元素遮挡

---

## 🎮 测试场景 4：完整游戏流程

### 完整流程测试
```
1. 打开游戏 → 显示欢迎页
   ☐ 欢迎页在手机上一屏显示
   ☐ "开始游戏"按钮清晰可点击

2. 点击"开始游戏" → 进入身份选择
   ☐ 4 个身份卡片在手机上清晰显示
   ☐ 2×2 网格布局

3. 选择身份 → 进入英雄选择
   ☐ 4 个英雄一屏显示（之前需要滚动）
   ☐ 英雄卡片高度优化到 95px

4. 选择英雄 → 进入游戏战斗
   ☐ 敌方区域高度合理（≤22vh）
   ☐ 日志区域紧凑显示
   ☐ 玩家区域（状态 + 手牌 + 按钮）合理排列

5. 游戏过程中：
   ☐ 血格正常显示且支持换行
   ☐ 日志持续更新，右侧无空白
   ☐ 所有按钮可正常点击
   ☐ 没有横向滚动条

6. 点击"出牌" → 执行操作
   ☐ 卡片选择正常
   ☐ 效果显示正常
   ☐ 日志更新正常

7. 游戏结束 → 显示结算界面
   ☐ 结算界面在手机上完整显示
   ☐ 表格内容清晰可读
```

---

## 🔍 开发者工具检查

### 使用 F12 开发者工具验证

#### 1. 检查 CSS 是否应用
```javascript
// 在 Console 中运行以下代码

// 检查英雄选择高度
getComputedStyle(document.querySelector('.hero-option')).height
// 预期输出: "95px"

// 检查日志 padding
getComputedStyle(document.getElementById('log-zone')).padding
// 预期输出: "8px 10px" (手机) 或 "10px 12px" (PC)

// 检查血格 flex-wrap
getComputedStyle(document.querySelector('.hp-bar')).flexWrap
// 预期输出: "wrap"

// 检查血格 max-width
getComputedStyle(document.querySelector('.hp-bar')).maxWidth
// 预期输出: "160px" (手机) 或 "180px" (PC)
```

#### 2. 检查 HTML 结构
```javascript
// 验证血格是否能正确换行
const hpBar = document.querySelector('.hp-bar');
console.log('HP Bar children:', hpBar.children.length);
console.log('HP Bar width:', hpBar.offsetWidth);
console.log('HP Bar computed max-width:',
            getComputedStyle(hpBar).maxWidth);
```

#### 3. 检查元素大小
```javascript
// 检查各区域高度
console.log('敌方区域高度:',
            document.getElementById('enemy-zone').offsetHeight);
console.log('日志区域高度:',
            document.getElementById('log-zone').offsetHeight);
console.log('玩家区域高度:',
            document.getElementById('player-zone').offsetHeight);

// 总高度应该接近 100vh
const totalHeight = 40 +
                   document.getElementById('enemy-zone').offsetHeight +
                   document.getElementById('log-zone').offsetHeight +
                   document.getElementById('player-zone').offsetHeight;
console.log('总高度:', totalHeight, 'px');
```

---

## 📊 性能检查

### 没有性能问题
- ✅ CSS 只修改了样式值，没有添加复杂的动画
- ✅ 没有添加 JavaScript 运算，纯 CSS 优化
- ✅ 布局重排次数不增加
- ✅ 加载时间不会受到影响

### 检查方法
```
在浏览器 F12 → Performance 标签中：
1. 点击录制按钮
2. 进行游戏操作（出牌、移动等）
3. 停止录制

预期：
- 帧率保持在 60fps
- 没有长时间的任务（>50ms）
```

---

## 📝 问题报告模板

如果发现任何问题，请报告以下信息：

```
问题标题：
[请填写问题标题]

问题描述：
[详细描述遇到的问题]

重现步骤：
1. [第一步]
2. [第二步]
3. [第三步]

预期行为：
[应该看到什么]

实际行为：
[实际看到什么]

浏览器信息：
- 浏览器：[Chrome/Firefox/Safari 等]
- 版本：[版本号]
- 操作系统：[Windows/Mac/Linux]
- 设备类型：[真实手机/浏览器模拟/其他]

截图/视频：
[如果有截图或录屏，请上传]
```

---

## ✨ 关键改动总结

| 项目 | 优化前 | 优化后 | 效果 |
|------|--------|--------|------|
| **英雄选择** | 需要滚动 | 一屏显示 | ✅ 解决 |
| **血格显示** | 变形混乱 | 正常+换行 | ✅ 解决 |
| **日志空白** | 右侧空白 | 紧凑显示 | ✅ 解决 |
| **整体布局** | 松散 | 紧凑高效 | ✅ 优化 |

---

## 🔗 相关文档

- 📄 `MOBILE_UI_OPTIMIZATION_FIX.md` - 详细的技术优化报告
- 📄 `OPTIMIZATION_VISUAL_GUIDE.md` - 可视化对比指南
- 🔗 GitHub 提交：[abfeb90](https://github.com/leeking001/Sanguosha-mini/commit/abfeb90)

---

**准备好测试了吗？** 🚀

在 http://localhost:8080 打开游戏，按照上面的场景进行测试！

有任何问题或发现，请随时反馈。

**最后更新:** 2026-03-20 | **状态:** ✅ 完成
