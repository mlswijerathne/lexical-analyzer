import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidTreeProps {
  mermaidDefinition: string;
  className?: string;
}

export default function MermaidTree({
  mermaidDefinition,
  className = "",
}: MermaidTreeProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Mermaid once
    if (!isInitialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        themeVariables: {
          darkMode: true,
          background: "#1f2937",
          primaryColor: "#4f46e5",
          primaryTextColor: "#ffffff",
          primaryBorderColor: "#312e81",
          lineColor: "#6b7280",
          secondaryColor: "#059669",
          tertiaryColor: "#dc2626",
          fontSize: "12px",
          fontFamily:
            'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
        },
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: "basis",
          nodeSpacing: 50,
          rankSpacing: 50,
          padding: 20,
        },
        securityLevel: "loose",
      });
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (!isInitialized || !elementRef.current || !mermaidDefinition) {
      return;
    }

    const renderDiagram = async () => {
      try {
        setError(null);

        // Clear previous content
        if (elementRef.current) {
          elementRef.current.innerHTML = "";
        }

        // Generate unique ID for this diagram
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Validate and render the diagram
        const { svg } = await mermaid.render(id, mermaidDefinition);

        if (elementRef.current) {
          elementRef.current.innerHTML = svg;

          // Apply additional styling to the SVG
          const svgElement = elementRef.current.querySelector("svg");
          if (svgElement) {
            svgElement.style.maxWidth = "100%";
            svgElement.style.height = "auto";
            svgElement.style.background = "transparent";

            // Make the diagram responsive
            svgElement.setAttribute(
              "viewBox",
              svgElement.getAttribute("viewBox") || "0 0 800 600",
            );
            svgElement.removeAttribute("width");
            svgElement.removeAttribute("height");
            svgElement.style.width = "100%";
            svgElement.style.maxHeight = "500px";
          }
        }
      } catch (err) {
        console.error("Error rendering Mermaid diagram:", err);
        setError(
          err instanceof Error ? err.message : "Failed to render diagram",
        );

        // Fallback to text representation
        if (elementRef.current) {
          elementRef.current.innerHTML = `
            <div class="text-red-400 text-sm p-4 bg-red-900/20 border border-red-500/30 rounded">
              <div class="font-semibold mb-2">Failed to render diagram</div>
              <div class="text-xs">${err instanceof Error ? err.message : "Unknown error"}</div>
            </div>
          `;
        }
      }
    };

    renderDiagram();
  }, [mermaidDefinition, isInitialized]);

  if (!mermaidDefinition) {
    return (
      <div className={`text-gray-500 text-sm text-center p-8 ${className}`}>
        No diagram data available
      </div>
    );
  }

  return (
    <div className={`mermaid-container ${className}`}>
      <div
        ref={elementRef}
        className="w-full overflow-auto bg-gray-900/30 rounded-lg border border-gray-600/30 p-4"
        style={{ minHeight: "200px" }}
      />
      {error && (
        <div className="mt-2 text-xs text-red-400">
          Diagram rendering error. Falling back to text view.
        </div>
      )}
    </div>
  );
}

// Export a simpler version for basic use cases
export function SimpleMermaidTree({ definition }: { definition: string }) {
  return <MermaidTree mermaidDefinition={definition} />;
}
