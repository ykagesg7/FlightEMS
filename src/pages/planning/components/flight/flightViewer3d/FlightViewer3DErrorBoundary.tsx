import { Component, type ErrorInfo, type ReactNode } from 'react';
import { setFlightViewer3dErrorFlag, setFlightViewer3dReadyFlag } from './flightViewer3dDebug';

type Props = {
  children: ReactNode;
  onReset?: () => void;
};

type State = {
  error: Error | null;
};

/** Planning 全体を落とさず 3D パネル内だけエラー表示 */
export class FlightViewer3DErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('FlightViewer3D error boundary:', error, info.componentStack);
    setFlightViewer3dErrorFlag(error.message);
    setFlightViewer3dReadyFlag(false);
  }

  private retry = (): void => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div
          className="flex min-h-[12rem] flex-col items-center justify-center gap-3 px-4 text-center"
          role="alert"
        >
          <p className="text-sm text-red-200">{this.state.error.message}</p>
          <button
            type="button"
            onClick={this.retry}
            className="min-h-[44px] rounded border border-brand-primary/50 px-4 py-2 text-sm text-brand-primary hover:bg-brand-primary/10"
          >
            再試行
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
