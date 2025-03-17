<template>
  <div class="editor-main">
    <div class="editor-input">
      <textarea
        v-model="markdownContent"
        placeholder="请输入Markdown内容..."
        @input="handleInput"
        @select="handleTextSelection"
        ref="textarea"
      ></textarea>
    </div>
    <div class="editor-preview" v-html="htmlContent"></div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js/lib/core'

// 语言模块的懒加载注册
const registerLanguage = async (lang) => {
  if (!hljs.getLanguage(lang)) {
    try {
      const module = await import(`highlight.js/lib/languages/${lang}`)
      hljs.registerLanguage(lang, module.default)
    } catch (e) {
      console.warn(`Failed to load language module: ${lang}`, e)
    }
  }
}

// 配置marked选项
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  }
})

const markdownContent = ref('')
const htmlContent = ref('')
const textarea = ref(null)
const selectedText = ref('')
const currentFile = ref(null)
let autoSaveTimeout = null

// 删除loadFile方法
const loadFile = async (file) => {
  if (!file) return
  currentFile.value = file
  const content = await window.electronAPI.loadFile(file.id)
  markdownContent.value = content || ''
  htmlContent.value = marked(markdownContent.value)
}

// 删除saveContent方法
const saveContent = async () => {
  if (currentFile.value) {
    try {
      const result = await window.electronAPI.saveFile(currentFile.value.id, markdownContent.value)
      if (!result) {
        console.error('保存文件失败')
        return false
      }
      console.log('文件自动保存成功')
      return true
    } catch (error) {
      console.error('保存文件时发生错误:', error)
      return false
    }
  }
  return false
}

const insertText = (text) => {
  const textArea = textarea.value
  const start = textArea.selectionStart
  const end = textArea.selectionEnd
  const content = markdownContent.value
  
  markdownContent.value = content.substring(0, start) + text + ' ' + content.substring(end)
  
  setTimeout(() => {
    textArea.focus()
    textArea.setSelectionRange(start + text.length + 1, start + text.length + 1)
  }, 0)
}

const applyStyle = (style, value = '') => {
  const textArea = textarea.value
  const start = textArea.selectionStart
  const end = textArea.selectionEnd
  const content = markdownContent.value
  let newText = ''

  if (selectedText.value) {
    switch (style) {
      case 'bold':
        newText = `**${selectedText.value}**`
        break
      case 'italic':
        newText = `*${selectedText.value}*`
        break
      case 'strike':
        newText = `~~${selectedText.value}~~`
        break
      case 'color':
        newText = `<font color="${value}">${selectedText.value}</font>`
        break
      case 'size':
        newText = `<font size="${value}px">${selectedText.value}</font>`
        break
      default:
        newText = selectedText.value
    }

    markdownContent.value = content.substring(0, start) + newText + content.substring(end)
    setTimeout(() => {
      textArea.focus()
      textArea.setSelectionRange(start + newText.length, start + newText.length)
    }, 0)
  } else {
    let text = ''
    switch (style) {
      case 'bold':
        text = '**文本**'
        break
      case 'italic':
        text = '*文本*'
        break
      case 'strike':
        text = '~~文本~~'
        break
      case 'color':
        text = `<font color="${value}">文本</font>`
        break
      case 'size':
        text = `<font size="${value}px">文本</font>`
        break
      default:
        text = '文本'
    }
    insertText(text)
  }
}

// 导出方法供父组件使用
defineExpose({
  insertText,
  applyStyle,
  markdownContent
})

const handleInput = () => {
  htmlContent.value = marked(markdownContent.value)
}

// 监听markdown内容变化
watch(markdownContent, handleInput)

const handleTextSelection = () => {
  selectedText.value = textarea.value.value.substring(
    textarea.value.selectionStart,
    textarea.value.selectionEnd
  )
}
</script>

<style scoped>
.editor-main {
  display: flex;
  flex-direction: row;
  gap: 20px;
  margin-top: 20px;
  flex: 1;
  min-height: calc(100vh - 200px);
}



.editor-input,
.editor-preview {
  flex: 1;
  padding: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  overflow-y: auto;
  height: 100%;
  max-height: calc(100vh - 200px);
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

:deep(.editor-preview pre) {
  background-color: #f6f8fa;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
}

:deep(.editor-preview code) {
  font-family: monospace;
}

:deep(.editor-preview p) {
  line-height: 1.6;
}

:deep(.editor-preview img) {
  max-width: 100%;
}

:deep(.editor-preview .left) {
  text-align: left;
}

:deep(.editor-preview .center) {
  text-align: center;
}

:deep(.editor-preview .right) {
  text-align: right;
}
</style>