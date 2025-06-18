export function useTextEditor() {
  const editorRef = ref<HTMLDivElement | null>(null)
  const isUpdatingFromEditor = ref(false)

  function convertToHtml(text: string): string {
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
  }

  function convertFromHtml(html: string): string {
    // Create a temporary div to parse HTML
    const temp = document.createElement('div')
    temp.innerHTML = html

    // Replace <strong> and <b> tags with <b> tags
    temp.querySelectorAll('strong, b').forEach((el) => {
      el.outerHTML = `<b>${el.textContent}</b>`
    })

    // Replace <br> tags with newlines and get text content
    let text = temp.innerHTML
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<div>/gi, '\n')
      .replace(/<\/div>/gi, '')
      .replace(/<p>/gi, '')
      .replace(/<\/p>/gi, '\n')

    // Clean up extra newlines
    text = text.replace(/\n+/g, '\n').trim()

    return text
  }

  function updateValueFromEditor(value: Ref<string>) {
    if (!editorRef.value) return
    const html = editorRef.value.innerHTML
    isUpdatingFromEditor.value = true
    value.value = convertFromHtml(html)
    nextTick(() => {
      isUpdatingFromEditor.value = false
    })
  }

  function updateEditorFromValue(value: string) {
    if (!editorRef.value) return
    const html = convertToHtml(value)
    if (editorRef.value.innerHTML !== html) {
      editorRef.value.innerHTML = html
    }
  }

  function toggleBold(value: Ref<string>) {
    document.execCommand('bold', false)
    updateValueFromEditor(value)
  }

  function handleEditorInput(value: Ref<string>) {
    updateValueFromEditor(value)
  }

  function handleEditorKeydown(event: KeyboardEvent, value: Ref<string>) {
    // Handle Ctrl+B for bold
    if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
      event.preventDefault()
      toggleBold(value)
    }
  }

  // Character and line count utilities
  function getCharacterCount(text: string): number {
    return text.replace(/<b>(.*?)<\/b>/g, '$1').length
  }

  function getLineCount(text: string): number {
    return text.split('\n').length
  }

  return {
    editorRef,
    isUpdatingFromEditor: readonly(isUpdatingFromEditor),
    convertToHtml,
    convertFromHtml,
    updateValueFromEditor,
    updateEditorFromValue,
    toggleBold,
    handleEditorInput,
    handleEditorKeydown,
    getCharacterCount,
    getLineCount,
  }
}
