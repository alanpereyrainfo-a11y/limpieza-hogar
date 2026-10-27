import { Component, type ReactNode } from "react";
import { Button } from "./components/ui/button.tsx";
import { STORAGE_KEY } from "./domain/types.ts";
import { Shell } from "./Shell.tsx";
import { StoreProvider } from "./state/store.tsx";

type BoundaryState = { error: Error | null };

class ErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): BoundaryState {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="grid min-h-dvh place-items-center px-6 text-center">
        <div className="max-w-sm">
          <h1 className="font-display text-3xl font-extrabold">Se trabó la app</h1>
          <p className="mt-2 text-sm text-muted">
            Podés reintentar. Si sigue fallando, borramos los datos de este dispositivo y arrancamos de nuevo.
          </p>
          <div className="mt-5 flex justify-center gap-2">
            <Button variant="ghost" onClick={() => this.setState({ error: null })}>
              Reintentar
            </Button>
            <Button
              onClick={() => {
                localStorage.removeItem(STORAGE_KEY);
                window.location.reload();
              }}
            >
              Empezar de cero
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default function App() {
  return (
    <StoreProvider>
      <div className="scene" aria-hidden="true" />
      <ErrorBoundary>
        <Shell />
      </ErrorBoundary>
    </StoreProvider>
  );
}
