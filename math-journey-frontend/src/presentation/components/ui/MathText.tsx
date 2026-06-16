import katex from 'katex'

interface Part {
  type: 'text' | 'math'
  content: string
  display: boolean
}

function parseMath(text: string): Part[] {
  const parts: Part[] = []
  // Matches $$...$$ (display) first, then $...$ (inline).
  // Opening $ must not follow a letter or backslash (prevents R$ and \$ false triggers).
  // Content allows \$ sequences (escaped dollar inside math, e.g. R\$ 28.900,00).
  // Closing $ must not be preceded by backslash.
  const regex = /\$\$([^$]*?)\$\$|(?<![A-Za-z\\])\$((?:[^$\n]|\\\$)+?)(?<!\\)\$/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index), display: false })
    }
    if (match[1] !== undefined) {
      parts.push({ type: 'math', content: match[1], display: true })
    } else {
      parts.push({ type: 'math', content: match[2], display: false })
    }
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex), display: false })
  }

  return parts
}

/** Renders text that may contain $inline$ and $$display$$ LaTeX math. */
export function MathText({ children, className }: { children: string; className?: string }) {
  const parts = parseMath(children)

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.type === 'text') return <span key={i}>{part.content}</span>
        try {
          const html = katex.renderToString(part.content, {
            displayMode: part.display,
            throwOnError: false,
            output: 'html',
            trust: false,
          })
          return (
            <span
              key={i}
              className={part.display ? 'block my-3 overflow-x-auto text-center' : 'inline'}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )
        } catch {
          return <span key={i}>{part.content}</span>
        }
      })}
    </span>
  )
}
