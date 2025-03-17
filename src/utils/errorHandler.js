/**
 * 错误处理工具
 * 提供统一的错误处理机制，增强用户体验
 */

/**
 * 错误类型枚举
 */
export const ErrorType = {
  FILE_OPERATION: 'file_operation',
  MARKDOWN_PARSING: 'markdown_parsing',
  NETWORK: 'network',
  UNKNOWN: 'unknown'
};

/**
 * 处理错误并返回用户友好的错误信息
 * @param {Error} error 错误对象
 * @param {string} type 错误类型，使用ErrorType枚举
 * @param {string} customMessage 自定义错误信息
 * @returns {string} 用户友好的错误信息
 */
export function handleError(error, type = ErrorType.UNKNOWN, customMessage = '') {
  // 记录错误到控制台
  console.error(`[${type}] Error:`, error);
  
  // 根据错误类型返回友好的错误信息
  let userMessage = customMessage || '发生了未知错误';
  
  switch (type) {
    case ErrorType.FILE_OPERATION:
      userMessage = customMessage || '文件操作失败，请检查文件权限或重试';
      break;
    case ErrorType.MARKDOWN_PARSING:
      userMessage = customMessage || 'Markdown解析错误，请检查您的Markdown语法';
      break;
    case ErrorType.NETWORK:
      userMessage = customMessage || '网络连接错误，请检查您的网络连接';
      break;
  }
  
  return userMessage;
}

/**
 * 显示错误提示
 * @param {string} message 错误信息
 * @param {string} type 提示类型: 'alert' 或 'console'
 */
export function showErrorMessage(message, type = 'alert') {
  if (type === 'alert') {
    alert(message);
  } else {
    console.error(message);
  }
}

/**
 * 安全地执行函数，捕获并处理可能的错误
 * @param {Function} fn 要执行的函数
 * @param {Object} options 选项
 * @param {string} options.errorType 错误类型
 * @param {string} options.errorMessage 自定义错误信息
 * @param {boolean} options.showError 是否显示错误
 * @param {string} options.displayType 错误显示类型
 * @returns {Promise<any>} 函数执行结果或null（如果发生错误）
 */
export async function safeExecute(fn, options = {}) {
  const {
    errorType = ErrorType.UNKNOWN,
    errorMessage = '',
    showError = true,
    displayType = 'alert'
  } = options;
  
  try {
    return await fn();
  } catch (error) {
    const message = handleError(error, errorType, errorMessage);
    
    if (showError) {
      showErrorMessage(message, displayType);
    }
    
    return null;
  }
}