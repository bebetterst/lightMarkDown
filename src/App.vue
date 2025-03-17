<template>
  <div class="editor-container" :class="selectedTheme">
    <div class="editor-content">
      <div class="editor-header">
        <div class="toolbar">
          <div class="toolbar-group">
            <div class="group-title">标题</div>
            <button @click="editor?.insertText('#')" title="一级标题"><i class="fas fa-heading"></i>1</button>
            <button @click="editor?.insertText('##')" title="二级标题"><i class="fas fa-heading"></i>2</button>
            <button @click="editor?.insertText('###')" title="三级标题"><i class="fas fa-heading"></i>3</button>
          </div>
          <div class="toolbar-group">
            <div class="group-title">文本样式</div>
            <button @click="editor?.applyStyle('bold')" title="粗体"><i class="fas fa-bold"></i></button>
            <button @click="editor?.applyStyle('italic')" title="斜体"><i class="fas fa-italic"></i></button>
            <button @click="editor?.applyStyle('strike')" title="删除线"><i class="fas fa-strikethrough"></i></button>
            <div class="dropdown">
              <button class="dropdown-toggle color-btn" @click="toggleDropdown($event)" :style="{ borderBottomColor: textColor }">
                <i class="fas fa-font"></i>
              </button>
              <div class="dropdown-menu color-menu">
                <div class="color-picker">
                  <div class="color-presets">
                    <button
                      v-for="color in presetColors"
                      :key="color"
                      :style="{ backgroundColor: color }"
                      @click="applyTextColor(color)"
                      class="color-preset"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="toolbar-group">
            <div class="group-title">插入元素</div>
            <button @click="editor?.insertText('---')" title="分割线"><i class="fas fa-minus"></i></button>
            <button @click="insertTable()" title="插入表格"><i class="fas fa-table"></i></button>
            <button @click="editor?.insertText('```\n代码块\n```')" title="代码块"><i class="fas fa-code"></i></button>
            <button @click="editor?.insertText('> 引用文本')" title="引用"><i class="fas fa-quote-right"></i></button>
            <div class="dropdown">
              <button class="dropdown-toggle" @click="toggleDropdown($event)" title="插入公式">
                <i class="fas fa-square-root-alt"></i>
              </button>
              <div class="dropdown-menu">
                <button @click="insertKatex('inline', '\\frac{分子}{分母}')" title="分数">分数 (a/b)</button>
                <button @click="insertKatex('inline', '\\sqrt{被开方数}')" title="平方根">平方根 (√)</button>
                <button @click="insertKatex('block', '\\sum_{i=1}^n x_i')" title="求和">求和 (Σ)</button>
                <button @click="insertKatex('block', '\\int_{a}^b f(x)dx')" title="积分">积分 (∫)</button>
                <button @click="insertKatex('block', '\\begin{matrix} a & b \\\\ c & d \\end{matrix}')" title="矩阵">矩阵</button>
                <button @click="insertKatex('block', '\\lim_{x \\to \\infty} f(x)')" title="极限">极限</button>
              </div>
            </div>
            <div class="dropdown">
              <button class="dropdown-toggle" @click="toggleDropdown($event)" title="插入图表">
                <i class="fas fa-project-diagram"></i>
              </button>
              <div class="dropdown-menu">
                <button @click="insertMermaid('graph TD', '    A[开始] --> B[步骤1]\n    B --> C[步骤2]\n    C --> D[结束]')" title="流程图">流程图</button>
                <button @click="insertMermaid('sequenceDiagram', '    participant A as 用户\n    participant B as 系统\n    A->>B: 请求\n    B->>A: 响应')" title="时序图">时序图</button>
                <button @click="insertMermaid('gantt', '    title 项目计划\n    section 任务1\n    已完成 :done, des1, 2024-01-01, 2024-01-10\n    进行中 :active, des2, 2024-01-11, 3d\n    计划中 : des3, after des2, 5d')" title="甘特图">甘特图</button>
              </div>
            </div>
          </div>
          <div class="toolbar-group">
            <div class="group-title">文件操作</div>
            <button @click="saveFileAs" title="另存为"><i class="fas fa-save"></i></button>
            <button @click="saveContent" title="保存文档"><i class="fas fa-save"></i> 保存</button>
          </div>
          <div class="toolbar-group">
            <select v-model="selectedTheme" class="theme-selector">
              <option value="theme-default">默认主题</option>
              <option value="theme-dark">暗色主题</option>
              <option value="theme-light">明亮主题</option>
            </select>
          </div>
        </div>
      </div>
      
      <MarkdownEditor ref="editor" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import MarkdownEditor from './components/MarkdownEditor.vue'

const editor = ref(null)
const selectedTheme = ref('theme-default')
const textColor = ref('#000000')
const fontSize = ref('16')
const presetColors = [
  '#000000', '#FF0000', '#00FF00', '#0000FF',
  '#FFA500', '#800080', '#008080', '#FFC0CB'
]

// 初始化主题
onMounted(() => {
  // 初始化主题相关设置
})
const insertTable = () => {
  const tableTemplate = '| 标题1 | 标题2 | 标题3 |\n| --- | --- | --- |\n| 内容1 | 内容2 | 内容3 |'
  editor.value?.insertText(tableTemplate)
}

const applyTextColor = (color) => {
  textColor.value = color
  editor.value?.applyStyle('color', color)
}

const toggleDropdown = (event) => {
  const dropdown = event.target.closest('.dropdown');
  if (!dropdown) return;
  const wasActive = dropdown.classList.contains('active');
  
  // 关闭所有下拉菜单
  document.querySelectorAll('.dropdown').forEach(el => {
    el.classList.remove('active')
  })
  
  // 切换当前下拉菜单的状态
  if (!wasActive) {
    dropdown.classList.add('active')
  }
}

const insertKatex = (type, formula) => {
  const wrapper = type === 'inline' ? '$' : '$$'
  editor.value?.insertText(`${wrapper}${formula}${wrapper}`)
}

const insertMermaid = (type, content) => {
  const template = ```mermaid
${type}
${content}
```
  editor.value?.insertText(template)
}

// 保存最后编辑的文件ID到localStorage




// 删除currentFile变量声明（第217行）


// 删除重复的handleFileSelect函数（第216-220行）
// const handleFileSelect = (file) => {
//   currentFile.value = file;
//   editor.value?.loadFile(file);
//   fileName.value = file?.name || '';
//   saveLastEditedFileId(file.id)
// }

// 删除重复的saveContent方法（第224-241行）
// const saveContent = async () => {
//   try {
//     if (!currentFile.value) return false
//     await editor.value.saveContent()
//     lastEditedFileId.value = currentFile.value.id
//     localStorage.setItem('lastEditedFileId', currentFile.value.id)
//     return true
//   } catch (error) {
//     console.error('保存失败:', error)
//     alert(`保存失败：${error.message || '未知错误'}`)
//     return false
//   }
// }



</script>

<style>
.folder-selector:focus,
.file-name-input:focus {
  outline: none;
  border-color: #4a9eff;
  box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2);
}

.editor-container {
  display: flex;
  max-width: 100%;
  margin: 0;
  padding: 0;
  height: 100vh;
}

.editor-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  /* 总高度减去padding */
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
}

.editor-header {
  margin-bottom: 10px;
}

.editor-header h1 {
  margin: 0 0 15px 0;
  text-align: center;
  font-size: 24px;
  color: #333;
}

.toolbar {
  display: flex;
  gap: 16px;
  padding: 16px;
  background-color: #ffffff;
  border-radius: 8px;
  align-items: flex-end;
  flex-wrap: wrap;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.toolbar-group {
  display: flex;
  gap: 4px;
  padding-right: 16px;
  border-right: 2px solid #aaa;
  position: relative;
  align-items: center;
  margin-top: 20px;
}

.toolbar-group:last-child {
  border-right: none;
  padding-right: 0;
}

.group-title {
  position: absolute;
  top: -20px;
  left: 0;
  font-size: 12px;
  color: #666;
  white-space: nowrap;
  font-weight: 500;
}

.toolbar button {
  padding: 4px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  font-size: 13px;
  min-width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.toolbar button i {
  font-size: 13px;
}

.toolbar button:hover {
  background-color: #f8f9fa;
  border-color: #d0d0d0;
}

.editor-main {
  display: flex;
  gap: 20px;
  margin-top: 20px;
  flex: 1;
  min-height: 0;
}

.editor-input,
.editor-preview {
  flex: 1;
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  overflow-y: auto;
}

.editor-input textarea {
  width: 100%;
  height: 100%;
  border: none;
  resize: none;
  outline: none;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  background: transparent;
}

.editor-preview {
  overflow-y: auto;
}

.dropdown {
  position: relative;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  padding: 12px;
  margin-top: 4px;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.dropdown.active .dropdown-menu {
  display: block;
}

.color-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-presets {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
}

.color-preset {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
  cursor: pointer;
  padding: 0;
}

.color-btn {
  border-bottom-width: 3px !important;
}

.theme-selector {
  padding: 4px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: white;
  font-size: 13px;
  cursor: pointer;
}

.theme-dark {
  background-color: #1e1e1e;
  color: #fff;
}

.theme-dark .toolbar {
  background-color: #2d2d2d;
  border-color: #444;
}

.theme-dark .toolbar button {
  background-color: #383838;
  border-color: #444;
  color: #fff;
}

.theme-dark .toolbar button:hover {
  background-color: #404040;
}

.theme-dark .editor-input,
.theme-dark .editor-preview {
  background-color: #2d2d2d;
  border-color: #444;
  color: #fff;
}

.theme-dark .editor-input textarea {
  background-color: #2d2d2d;
  color: #fff;
}

.theme-light {
  background-color: #f8f9fa;
  color: #333;
}

.theme-light .toolbar {
  background-color: #fff;
}

.theme-light .editor-input,
.theme-light .editor-preview {
  background-color: #fff;
  border-color: #e9ecef;
}

.editor-preview :deep(pre) {
  background-color: #f6f8fa;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
}

.editor-preview :deep(code) {
  font-family: monospace;
}

.editor-preview :deep(p) {
  line-height: 1.6;
}

.editor-preview :deep(img) {
  max-width: 100%;
}

/* 文本对齐样式 */
.editor-preview :deep(.left) {
  text-align: left;
}

.editor-preview :deep(.center) {
  text-align: center;
}

.editor-preview :deep(.right) {
  text-align: right;
}
</style>