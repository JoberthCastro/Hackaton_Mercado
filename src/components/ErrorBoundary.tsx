import type { ReactNode } from 'react'
import { Component } from 'react'

type Props = { children: ReactNode }
type State = { error?: Error; info?: { componentStack?: string } }

export class ErrorBoundary extends Component<Props, State> {
  state: State = {}

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    // mantém em state para renderizar
    this.setState({ error, info })
    // log para console (útil no dev)
    // eslint-disable-next-line no-console
    console.error('Runtime error:', error, info)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div style={{ padding: 16, fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Arial' }}>
        <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Erro no app (debug)</div>
        <div style={{ fontSize: 13, whiteSpace: 'pre-wrap' }}>
          {String(this.state.error?.message || this.state.error)}
        </div>
        {this.state.info?.componentStack ? (
          <pre
            style={{
              marginTop: 12,
              padding: 12,
              background: '#f4f4f5',
              borderRadius: 12,
              overflow: 'auto',
              fontSize: 12,
              lineHeight: 1.4,
            }}
          >
            {this.state.info.componentStack}
          </pre>
        ) : null}
      </div>
    )
  }
}

