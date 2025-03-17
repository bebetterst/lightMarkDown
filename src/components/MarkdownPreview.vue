<template>
  <div class="editor-preview" v-html="renderedContent"></div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js/lib/core'
import mermaid from 'mermaid'
import katex from 'katex'
import 'katex/dist/katex.min.css'

// 接收props
const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

const renderedContent = ref('')

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

// 初始化mermaid配置
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose'
})

// 配置marked选项
marked.setOptions({
  highlight: function (code, lang) {
    if (lang === 'mermaid') {
      try {
        mermaid.parse(code)
        return `<div class="mermaid">${code}</div>`
      } catch (e) {
        return `<pre>${e.message}</pre>`
      }
    } else if (lang === 'math' || lang === 'latex') {
      try {
        return katex.renderToString(code, {
          displayMode: true,
          throwOnError: false
        })
      } catch (e) {
        return `<pre>${e.message}</pre>`
      }
    } else if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  }
})

// 预加载常用语言
onMounted(async () => {
  const commonLanguages = ['javascript', 'html', 'css', 'markdown', 'json', 'python']
  for (const lang of commonLanguages) {
    await registerLanguage(lang)
  }
})

// 渲染Markdown内容
const renderMarkdown = async (markdown) => {
  try {
    renderedContent.value = marked(markdown || '')
    // 渲染完成后初始化mermaid图表
    await nextTick()
    const mermaidDivs = document.querySelectorAll('.mermaid')
    mermaidDivs.forEach(div => {
      try {
        mermaid.render(`mermaid-${Date.now()}`, div.textContent, (svgCode) => {
          div.innerHTML = svgCode
        })
      } catch (e) {
        console.error('Mermaid rendering error:', e)
      }
    })
  } catch (error) {
    console.error('Markdown parsing error:', error)
    renderedContent.value = '<div class="error-message">Markdown解析错误，请检查您的Markdown语法</div>'
  }
}

// 监听content变化
watch(() => props.content, (newContent) => {
  renderMarkdown(newContent)
}, { immediate: true })
</script>

<style scoped>
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

:deep(.error-message) {
  color: #d32f2f;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
  margin-bottom: 10px;
}

:deep(.mermaid) {
  text-align: center;
  margin: 1em 0;
}

:deep(.katex-display) {
  margin: 1em 0;
  overflow-x: auto;
  overflow-y: hidden;
}
</style>