import { type Metric } from "web-vitals";

const reportWebVitals = (onPerfEntry?: (metric: Metric) => void) => {
    if (onPerfEntry !== undefined) {
        import("web-vitals").then(
            ({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
                onCLS(onPerfEntry);
                onINP(onPerfEntry);
                onFCP(onPerfEntry);
                onLCP(onPerfEntry);
                onTTFB(onPerfEntry);
            }
        );
    }
};

export default reportWebVitals;
