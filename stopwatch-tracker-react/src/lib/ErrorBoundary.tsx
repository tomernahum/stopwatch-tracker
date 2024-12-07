//@ts-ignore
import React from "react";

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        // Example "componentStack":
        //   in ComponentThatThrows (created by App)
        //   in ErrorBoundary (created by App)
        //   in div (created by App)
        //   in App
        // logErrorToMyService(error, info.componentStack);

        // todo maybe: log to an error monitoring service. or maybe the error monitoring service will just watch the console
        console.error("Error Boundary caught an error:", error, info);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }
            else {
                return <div className="text-red-500">Something went wrong</div>
            }
        }

        return this.props.children;
    }
}

// not sure why we can't just import something like this from react directly


