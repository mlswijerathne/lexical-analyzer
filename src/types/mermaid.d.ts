declare module "mermaid" {
  interface MermaidConfig {
    startOnLoad?: boolean;
    theme?: string;
    themeVariables?: {
      darkMode?: boolean;
      background?: string;
      primaryColor?: string;
      primaryTextColor?: string;
      primaryBorderColor?: string;
      lineColor?: string;
      secondaryColor?: string;
      tertiaryColor?: string;
      fontSize?: string;
      fontFamily?: string;
    };
    flowchart?: {
      useMaxWidth?: boolean;
      htmlLabels?: boolean;
      curve?: string;
      nodeSpacing?: number;
      rankSpacing?: number;
      padding?: number;
    };
    securityLevel?: string;
  }

  interface RenderResult {
    svg: string;
    bindFunctions?: (element: Element) => void;
  }

  interface Mermaid {
    initialize(config: MermaidConfig): void;
    render(id: string, definition: string): Promise<RenderResult>;
    parse(definition: string): boolean;
    mermaidAPI: {
      initialize(config: MermaidConfig): void;
      render(
        id: string,
        definition: string,
        callback?: (svgCode: string) => void,
      ): string;
    };
  }

  const mermaid: Mermaid;
  export default mermaid;
}
