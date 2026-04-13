import React, { useState } from 'react';
import './DirectoryTree.css';

export interface DirNode {
  name: string;
  path: string;
  hasChildren?: boolean;
}

interface TreeNodeProps {
  node: DirNode;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  onLoadChildren: (path: string) => Promise<DirNode[]>;
  depth: number;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, selectedPath, onSelect, onLoadChildren, depth }) => {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<DirNode[] | null>(null);
  const [childrenLoading, setChildrenLoading] = useState(false);
  const isSelected = selectedPath === node.path;

  // Show toggle if server says hasChildren, or it's unknown (undefined); hide only if explicitly false
  // After a successful load with 0 results, also hide
  const showToggle =
    (node.hasChildren !== false) || (children !== null && children.length > 0);

  const handleClick = async () => {
    onSelect(node.path);
    if (!showToggle) return;

    if (expanded) {
      setExpanded(false);
      return;
    }

    let kids = children;
    if (kids === null) {
      setChildrenLoading(true);
      kids = await onLoadChildren(node.path);
      setChildren(kids);
      setChildrenLoading(false);
    }
    if (kids.length > 0) setExpanded(true);
  };

  return (
    <div className="tree-node">
      <div
        className={`tree-node-label${isSelected ? ' selected' : ''}`}
        style={{ paddingLeft: `${depth * 14 + 10}px` }}
        onClick={handleClick}
        title={node.path}
      >
        <span className="tree-toggle">
          {childrenLoading
            ? <span className="tree-loading">…</span>
            : showToggle
              ? (expanded ? '▾' : '▸')
              : <span className="tree-toggle-placeholder" />}
        </span>
        <span className="tree-folder-icon">📁</span>
        <span className="tree-node-name">{node.name}</span>
      </div>
      {expanded && children && children.length > 0 && (
        <div className="tree-children">
          {children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              selectedPath={selectedPath}
              onSelect={onSelect}
              onLoadChildren={onLoadChildren}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface DirectoryTreeProps {
  nodes: DirNode[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
  onLoadChildren: (path: string) => Promise<DirNode[]>;
}

const DirectoryTree: React.FC<DirectoryTreeProps> = ({ nodes, selectedPath, onSelect, onLoadChildren }) => {
  if (nodes.length === 0) {
    return <div className="dir-tree-empty">No directories found</div>;
  }
  return (
    <div className="dir-tree">
      {nodes.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          selectedPath={selectedPath}
          onSelect={onSelect}
          onLoadChildren={onLoadChildren}
          depth={0}
        />
      ))}
    </div>
  );
};

export default DirectoryTree;
