// Utility functions for converting CST (Concrete Syntax Tree) to Mermaid diagram format

// Type definitions for CST nodes
interface CstNode {
  name?: string;
  children?: Record<string, CstNode[]>;
  image?: string;
  tokenType?: {
    name: string;
  };
}

let nodeCounter = 0;

export function resetNodeCounter() {
  nodeCounter = 0;
}

export function cstToMermaidGraph(cstNode: CstNode | null | undefined): string {
  resetNodeCounter();

  if (!cstNode) {
    return "graph TD\n  A[No Parse Tree Available]";
  }

  const nodes: string[] = [];
  const edges: string[] = [];

  // Generate simplified mathematical tree structure
  generateSimplifiedMermaidNodes(cstNode, nodes, edges);

  // Build the complete Mermaid graph
  const mermaidGraph = [
    "graph TD",
    ...nodes,
    ...edges,
    "",
    // Add styling for better visualization
    "classDef ruleNode fill:#4f46e5,stroke:#312e81,stroke-width:2px,color:#fff",
    "classDef tokenNode fill:#059669,stroke:#065f46,stroke-width:2px,color:#fff",
    "classDef leafNode fill:#dc2626,stroke:#991b1b,stroke-width:2px,color:#fff",
  ].join("\n");

  return mermaidGraph;
}

function generateSimplifiedMermaidNodes(
  node: CstNode,
  nodes: string[],
  edges: string[],
  parentId?: string,
): string {
  const currentId = `node${nodeCounter++}`;

  if (node.name) {
    // Skip unnecessary intermediate nodes like expressionPrime, termPrime
    const skipNodes = ["expressionPrime", "termPrime", "statement"];

    if (skipNodes.includes(node.name)) {
      // Skip this node and process its children directly under the parent
      if (node.children) {
        for (const key of Object.keys(node.children)) {
          const childArray = node.children[key];
          for (const child of childArray) {
            generateSimplifiedMermaidNodes(child, nodes, edges, parentId);
          }
        }
      }
      return currentId;
    }

    // This is a meaningful rule node (non-terminal)
    let nodeName = sanitizeNodeName(node.name);

    // Simplify node names for better readability
    if (node.name === "expression") {
      nodeName = "expr";
    }

    nodes.push(`  ${currentId}["${nodeName}"]:::ruleNode`);

    if (parentId) {
      edges.push(`  ${parentId} --> ${currentId}`);
    }

    // Process children if they exist
    if (node.children) {
      for (const key of Object.keys(node.children)) {
        const childArray = node.children[key];
        for (const child of childArray) {
          generateSimplifiedMermaidNodes(child, nodes, edges, currentId);
        }
      }
    }
  } else if (node.image !== undefined) {
    // This is a terminal node (token) - show only the value for numbers/identifiers
    const tokenType = node.tokenType?.name || "Token";
    const tokenValue = sanitizeNodeName(node.image);

    let displayText = tokenValue;

    // For operators, show just the symbol
    if (["Plus", "Minus", "Multiply", "Divide"].includes(tokenType)) {
      displayText = tokenValue;
    }

    nodes.push(`  ${currentId}["${displayText}"]:::tokenNode`);

    if (parentId) {
      edges.push(`  ${parentId} --> ${currentId}`);
    }
  } else {
    // Unknown node type
    nodes.push(`  ${currentId}["Unknown"]:::leafNode`);
    if (parentId) {
      edges.push(`  ${parentId} --> ${currentId}`);
    }
  }

  return currentId;
}

function sanitizeNodeName(name: string): string {
  // Escape special characters that might break Mermaid syntax
  return name
    .replace(/"/g, '\\"')
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r");
}

export function generateSimpleMermaidTree(treeLines: string[]): string {
  if (!treeLines || treeLines.length === 0) {
    return "graph TD\n  A[No Parse Tree Available]";
  }

  resetNodeCounter();
  const nodes: string[] = [];
  const edges: string[] = [];
  const nodeStack: { id: string; depth: number }[] = [];

  // Skip unnecessary intermediate nodes
  const skipNodes = ["expressionPrime", "termPrime", "statement"];

  for (const line of treeLines) {
    const depth = (line.match(/^ */)?.[0]?.length || 0) / 2; // Assuming 2 spaces per indent level
    const content = line.trim();

    if (!content) continue;

    // Skip unnecessary nodes
    if (skipNodes.some((skipNode) => content === skipNode)) {
      continue;
    }

    const currentId = `node${nodeCounter++}`;
    let displayContent = content;

    // Simplify node names
    if (content === "expression") {
      displayContent = "expr";
    }

    // For terminal nodes, extract just the value
    if (content.includes('": "')) {
      const match = content.match(/: "(.+)"/);
      if (match) {
        displayContent = match[1];
      }
    }

    const sanitizedContent = sanitizeNodeName(displayContent);

    // Determine node type based on content
    let nodeClass = "ruleNode";
    if (content.includes('": "')) {
      nodeClass = "tokenNode";
    }

    nodes.push(`  ${currentId}["${sanitizedContent}"]:::${nodeClass}`);

    // Adjust depth for skipped nodes by looking at actual meaningful parent
    const adjustedDepth = depth;
    while (
      nodeStack.length > 0 &&
      nodeStack[nodeStack.length - 1].depth >= adjustedDepth
    ) {
      nodeStack.pop();
    }

    // Connect to parent if exists
    if (nodeStack.length > 0) {
      const parentId = nodeStack[nodeStack.length - 1].id;
      edges.push(`  ${parentId} --> ${currentId}`);
    }

    // Add current node to stack
    nodeStack.push({ id: currentId, depth: adjustedDepth });
  }

  const mermaidGraph = [
    "graph TD",
    ...nodes,
    ...edges,
    "",
    // Add styling
    "classDef ruleNode fill:#4f46e5,stroke:#312e81,stroke-width:2px,color:#fff",
    "classDef tokenNode fill:#059669,stroke:#065f46,stroke-width:2px,color:#fff",
    "classDef leafNode fill:#dc2626,stroke:#991b1b,stroke-width:2px,color:#fff",
  ].join("\n");

  return mermaidGraph;
}

// Create simplified indented lines from CST, skipping unnecessary nodes
export function cstToSimplifiedIndentedLines(
  cstNode: CstNode | null | undefined,
  depth = 0,
): string[] {
  if (!cstNode) return [];
  const indent = "  ".repeat(depth);
  const lines = [];

  if (cstNode && cstNode.name) {
    // Skip unnecessary intermediate nodes like expressionPrime, termPrime, statement
    const skipNodes = ["expressionPrime", "termPrime", "statement"];

    if (skipNodes.includes(cstNode.name)) {
      // Skip this node and process its children at the same depth
      if (cstNode.children) {
        for (const key of Object.keys(cstNode.children)) {
          const childArray = cstNode.children[key];
          for (const child of childArray) {
            lines.push(...cstToSimplifiedIndentedLines(child, depth));
          }
        }
      }
      return lines;
    }

    // Simplify node names
    let nodeName = cstNode.name;
    if (cstNode.name === "expression") {
      nodeName = "expr";
    }

    lines.push(`${indent}${nodeName}`);

    if (cstNode.children) {
      for (const key of Object.keys(cstNode.children)) {
        const childArray = cstNode.children[key];
        for (const child of childArray) {
          if (child.name) {
            lines.push(...cstToSimplifiedIndentedLines(child, depth + 1));
          } else if (child.image) {
            // For terminals, show only the value for better readability
            const tokenValue = child.image;
            lines.push(`${indent}  ${tokenValue}`);
          }
        }
      }
    }
  }
  return lines;
}
