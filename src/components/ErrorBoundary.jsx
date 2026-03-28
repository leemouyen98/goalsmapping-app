import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, maxWidth: 600, margin: '40px auto' }}>
          <div style={{
            background: '#FFF5F5', border: '1px solid #FF3B30', borderRadius: 12, padding: 24,
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#FF3B30', marginBottom: 12 }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: 14, color: '#3C3C43', marginBottom: 16 }}>
              An error occurred rendering this page. Try going back and retrying.
            </p>
            <details style={{ fontSize: 12, color: '#8E8E93' }}>
              <summary style={{ cursor: 'pointer', marginBottom: 8 }}>Error details</summary>
              <pre style={{
                background: '#F2F2F7', padding: 12, borderRadius: 8,
                overflow: 'auto', maxHeight: 200, whiteSpace: 'pre-wrap', fontSize: 11,
              }}>
                {this.state.error && this.state.error.toString()}
                {'\n\n'}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              style={{
                marginTop: 16, padding: '10px 20px', background: '#2E96FF', color: 'white',
                border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
