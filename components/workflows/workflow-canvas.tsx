"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  WorkflowNode,
  WorkflowEdge,
  NodeTemplateDefinition,
  NodePort,
  ExecutionStatus,
} from "@/types/workflow";
import { WorkflowNodeComponent } from "./workflow-node";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Sparkles,
  MapPin,
  X,
  Copy,
  Trash2,
  AlignHorizontalDistributeCenter,
  Layers,
  MousePointer,
  Hand,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  selectedNodeIds?: string[];
  onSelectNode: (nodeId: string | null) => void;
  onSelectNodes?: (nodeIds: string[]) => void;
  onUpdateNodes: (nodes: WorkflowNode[]) => void;
  onUpdateEdges: (edges: WorkflowEdge[]) => void;
  onAddNodeFromTemplate: (template: NodeTemplateDefinition, position?: { x: number; y: number }) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteNodes?: (nodeIds: string[]) => void;
  onDuplicateNode: (nodeId: string) => void;
  onDuplicateNodes?: (nodeIds: string[]) => void;
}

interface DraggingConnection {
  sourceNodeId: string;
  sourcePortId: string;
  currentX: number;
  currentY: number;
}

interface SelectionBox {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export function WorkflowCanvas({
  nodes,
  edges,
  selectedNodeId,
  selectedNodeIds = [],
  onSelectNode,
  onSelectNodes,
  onUpdateNodes,
  onUpdateEdges,
  onAddNodeFromTemplate,
  onDeleteNode,
  onDeleteNodes,
  onDuplicateNode,
  onDuplicateNodes,
}: WorkflowCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom state
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 40 });
  const [scale, setScale] = useState<number>(1);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [spacePressed, setSpacePressed] = useState<boolean>(false);
  const [toolMode, setToolMode] = useState<"select" | "pan">("select");

  // Selection state
  const activeSelectedIds = selectedNodeIds.length > 0
    ? selectedNodeIds
    : selectedNodeId
    ? [selectedNodeId]
    : [];

  const [selectionBox, setSelectionBox] = useState<SelectionBox | null>(null);

  // Multi-node Dragging state
  const [isDraggingNodes, setIsDraggingNodes] = useState<boolean>(false);
  const dragStartMousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragStartNodePositions = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Edge Connection in progress
  const [connecting, setConnecting] = useState<DraggingConnection | null>(null);

  // Selected edge
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Mini-map visibility
  const [showMiniMap, setShowMiniMap] = useState<boolean>(true);

  // Synchronize selection changes
  const updateSelection = useCallback(
    (newIds: string[]) => {
      if (onSelectNodes) {
        onSelectNodes(newIds);
      }
      onSelectNode(newIds.length > 0 ? newIds[newIds.length - 1] : null);
    },
    [onSelectNodes, onSelectNode]
  );

  // Handle Zoom
  const handleZoom = (delta: number) => {
    setScale((prev) => Math.min(Math.max(prev + delta, 0.4), 2.0));
  };

  const handleResetView = () => {
    setPan({ x: 40, y: 40 });
    setScale(1);
  };

  const handleFitView = () => {
    if (nodes.length === 0) return;
    const minX = Math.min(...nodes.map((n) => n.position.x));
    const maxX = Math.max(...nodes.map((n) => n.position.x + 280));
    const minY = Math.min(...nodes.map((n) => n.position.y));
    const maxY = Math.max(...nodes.map((n) => n.position.y + 180));

    const width = maxX - minX;
    const height = maxY - minY;

    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const fitScale = Math.min((clientWidth - 100) / width, (clientHeight - 100) / height, 1.2);
      setScale(Math.max(fitScale, 0.5));
      setPan({
        x: (clientWidth - width * fitScale) / 2 - minX * fitScale,
        y: (clientHeight - height * fitScale) / 2 - minY * fitScale,
      });
    }
  };

  // Convert screen coordinates to canvas space
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      return {
        x: (screenX - rect.left - pan.x) / scale,
        y: (screenY - rect.top - pan.y) / scale,
      };
    },
    [pan, scale]
  );

  // Bulk Delete
  const handleBulkDelete = useCallback(() => {
    if (activeSelectedIds.length === 0) {
      if (selectedEdgeId) {
        onUpdateEdges(edges.filter((e) => e.id !== selectedEdgeId));
        setSelectedEdgeId(null);
      }
      return;
    }

    if (onDeleteNodes) {
      onDeleteNodes(activeSelectedIds);
    } else {
      activeSelectedIds.forEach((id) => onDeleteNode(id));
    }
    updateSelection([]);
    setSelectedEdgeId(null);
  }, [activeSelectedIds, selectedEdgeId, onDeleteNodes, onDeleteNode, onUpdateEdges, edges, updateSelection]);

  // Bulk Duplicate
  const handleBulkDuplicate = useCallback(() => {
    if (activeSelectedIds.length === 0) return;

    if (onDuplicateNodes) {
      onDuplicateNodes(activeSelectedIds);
    } else {
      const selectedNodes = nodes.filter((n) => activeSelectedIds.includes(n.id));
      const idMap = new Map<string, string>();
      const newNodes: WorkflowNode[] = [];

      selectedNodes.forEach((node) => {
        const newId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
        idMap.set(node.id, newId);
        newNodes.push({
          ...node,
          id: newId,
          position: { x: node.position.x + 40, y: node.position.y + 40 },
          inputs: node.inputs.map((p) => ({ ...p, id: `${newId}-${p.id.split("-").pop()}` })),
          outputs: node.outputs.map((p) => ({ ...p, id: `${newId}-${p.id.split("-").pop()}` })),
        });
      });

      // Also duplicate edges internal to the selection
      const internalEdges = edges.filter(
        (e) => activeSelectedIds.includes(e.sourceNodeId) && activeSelectedIds.includes(e.targetNodeId)
      );

      const newEdges: WorkflowEdge[] = internalEdges.map((e) => {
        const newSource = idMap.get(e.sourceNodeId)!;
        const newTarget = idMap.get(e.targetNodeId)!;
        return {
          ...e,
          id: `edge-${newSource}-${newTarget}-${Date.now()}`,
          sourceNodeId: newSource,
          targetNodeId: newTarget,
        };
      });

      onUpdateNodes([...nodes, ...newNodes]);
      onUpdateEdges([...edges, ...newEdges]);
      updateSelection(newNodes.map((n) => n.id));
    }
  }, [activeSelectedIds, onDuplicateNodes, nodes, edges, onUpdateNodes, onUpdateEdges, updateSelection]);

  // Align selected nodes horizontally
  const handleAlignHorizontal = () => {
    if (activeSelectedIds.length < 2) return;
    const selectedNodes = nodes.filter((n) => activeSelectedIds.includes(n.id));
    const avgY = Math.round(selectedNodes.reduce((sum, n) => sum + n.position.y, 0) / selectedNodes.length);

    // Sort by X position and arrange evenly
    const sorted = [...selectedNodes].sort((a, b) => a.position.x - b.position.x);
    const startX = sorted[0].position.x;
    const spacing = 320;

    const updated = nodes.map((node) => {
      const idx = sorted.findIndex((s) => s.id === node.id);
      if (idx !== -1) {
        return {
          ...node,
          position: {
            x: startX + idx * spacing,
            y: avgY,
          },
        };
      }
      return node;
    });

    onUpdateNodes(updated);
  };

  // Keyboard Shortcuts (Delete, Space, Select All, Duplicate)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.code === "Space" && !spacePressed) {
        setSpacePressed(true);
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        handleBulkDelete();
      } else if (e.key === "Escape") {
        updateSelection([]);
        setSelectedEdgeId(null);
        setConnecting(null);
        setSelectionBox(null);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "a") {
        e.preventDefault();
        updateSelection(nodes.map((n) => n.id));
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        handleBulkDuplicate();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setSpacePressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleBulkDelete, handleBulkDuplicate, nodes, spacePressed, updateSelection]);

  // Canvas Mouse Down
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Middle click OR spacebar OR pan tool mode -> Pan
    if (e.button === 1 || spacePressed || toolMode === "pan") {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    // Left click on background
    if (e.button === 0) {
      const canvasPos = screenToCanvas(e.clientX, e.clientY);

      if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
        updateSelection([]);
      }
      setSelectedEdgeId(null);

      // Start drag-to-select marquee box
      setSelectionBox({
        startX: canvasPos.x,
        startY: canvasPos.y,
        currentX: canvasPos.x,
        currentY: canvasPos.y,
      });
    }
  };

  // Canvas Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    const canvasPos = screenToCanvas(e.clientX, e.clientY);

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (selectionBox) {
      // Update drag-to-select marquee box
      const nextBox: SelectionBox = {
        ...selectionBox,
        currentX: canvasPos.x,
        currentY: canvasPos.y,
      };
      setSelectionBox(nextBox);

      // Calculate bounding box in canvas coordinates
      const boxMinX = Math.min(nextBox.startX, nextBox.currentX);
      const boxMaxX = Math.max(nextBox.startX, nextBox.currentX);
      const boxMinY = Math.min(nextBox.startY, nextBox.currentY);
      const boxMaxY = Math.max(nextBox.startY, nextBox.currentY);

      // Select nodes whose bounding boxes intersect with marquee
      const intersectedIds = nodes
        .filter((node) => {
          const nodeLeft = node.position.x;
          const nodeRight = node.position.x + 280;
          const nodeTop = node.position.y;
          const nodeBottom = node.position.y + 160;

          return (
            nodeRight >= boxMinX &&
            nodeLeft <= boxMaxX &&
            nodeBottom >= boxMinY &&
            nodeTop <= boxMaxY
          );
        })
        .map((n) => n.id);

      if (e.shiftKey || e.ctrlKey || e.metaKey) {
        const combined = Array.from(new Set([...activeSelectedIds, ...intersectedIds]));
        updateSelection(combined);
      } else {
        updateSelection(intersectedIds);
      }
    } else if (isDraggingNodes) {
      // Move all selected nodes in unison
      const deltaX = Math.round(canvasPos.x - dragStartMousePos.current.x);
      const deltaY = Math.round(canvasPos.y - dragStartMousePos.current.y);

      onUpdateNodes(
        nodes.map((node) => {
          const startPos = dragStartNodePositions.current.get(node.id);
          if (startPos) {
            return {
              ...node,
              position: {
                x: startPos.x + deltaX,
                y: startPos.y + deltaY,
              },
            };
          }
          return node;
        })
      );
    } else if (connecting) {
      setConnecting((prev) =>
        prev
          ? {
              ...prev,
              currentX: canvasPos.x,
              currentY: canvasPos.y,
            }
          : null
      );
    }
  };

  // Canvas Mouse Up
  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingNodes(false);
    setConnecting(null);
    setSelectionBox(null);
  };

  // Start Node Dragging / Selection
  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.button !== 0) return; // Only left click

    const isMultiModifier = e.shiftKey || e.metaKey || e.ctrlKey;
    let nextSelected = [...activeSelectedIds];

    if (isMultiModifier) {
      if (nextSelected.includes(nodeId)) {
        nextSelected = nextSelected.filter((id) => id !== nodeId);
      } else {
        nextSelected.push(nodeId);
      }
      updateSelection(nextSelected);
    } else {
      if (!nextSelected.includes(nodeId)) {
        nextSelected = [nodeId];
        updateSelection(nextSelected);
      }
    }

    setSelectedEdgeId(null);

    // Prepare multi-node drag
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    dragStartMousePos.current = canvasPos;

    const initialPositions = new Map<string, { x: number; y: number }>();
    nodes.forEach((n) => {
      if (nextSelected.includes(n.id)) {
        initialPositions.set(n.id, { ...n.position });
      }
    });
    dragStartNodePositions.current = initialPositions;
    setIsDraggingNodes(true);
  };

  // Drag-and-drop from Palette handler
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData("application/json");
    if (!dataStr) return;
    try {
      const template = JSON.parse(dataStr) as NodeTemplateDefinition;
      const dropPos = screenToCanvas(e.clientX, e.clientY);
      onAddNodeFromTemplate(template, {
        x: Math.max(dropPos.x - 140, 20),
        y: Math.max(dropPos.y - 40, 20),
      });
    } catch {
      // ignore
    }
  };

  // Port Connections
  const handlePortMouseDown = (
    nodeId: string,
    portId: string,
    portType: "in" | "out",
    e: React.MouseEvent
  ) => {
    if (portType === "out") {
      const pos = screenToCanvas(e.clientX, e.clientY);
      setConnecting({
        sourceNodeId: nodeId,
        sourcePortId: portId,
        currentX: pos.x,
        currentY: pos.y,
      });
    }
  };

  const handlePortMouseUp = (
    nodeId: string,
    portId: string,
    portType: "in" | "out",
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    if (connecting && portType === "in" && connecting.sourceNodeId !== nodeId) {
      const newEdgeId = `edge-${connecting.sourceNodeId}-${nodeId}-${Date.now()}`;
      const exists = edges.some(
        (ed) =>
          ed.sourceNodeId === connecting.sourceNodeId &&
          ed.targetNodeId === nodeId &&
          ed.sourcePortId === connecting.sourcePortId &&
          ed.targetPortId === portId
      );

      if (!exists) {
        onUpdateEdges([
          ...edges,
          {
            id: newEdgeId,
            sourceNodeId: connecting.sourceNodeId,
            sourcePortId: connecting.sourcePortId,
            targetNodeId: nodeId,
            targetPortId: portId,
            animated: true,
          },
        ]);
      }
    }
    setConnecting(null);
  };

  // Helper to calculate exact handle anchor coordinates
  const getNodePortPosition = (nodeId: string, portId: string, portType: "in" | "out") => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };

    const ports = portType === "in" ? node.inputs : node.outputs;
    const portIndex = ports.findIndex((p) => p.id === portId);
    const topPercent = (portIndex + 1) / (ports.length + 1);
    const nodeHeight = 160;

    return {
      x: portType === "in" ? node.position.x : node.position.x + 280,
      y: node.position.y + nodeHeight * topPercent,
    };
  };

  // Generate cubic Bezier path
  const createBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.abs(x2 - x1) * 0.55;
    const controlPoint1X = x1 + Math.max(dx, 40);
    const controlPoint2X = x2 - Math.max(dx, 40);
    return `M ${x1} ${y1} C ${controlPoint1X} ${y1}, ${controlPoint2X} ${y2}, ${x2} ${y2}`;
  };

  const isGrabbing = isPanning || spacePressed || toolMode === "pan";

  return (
    <div
      ref={containerRef}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        "relative flex-1 h-full w-full bg-[#FAF5F0] overflow-hidden select-none",
        isGrabbing ? "cursor-grab active:cursor-grabbing" : "cursor-default"
      )}
      style={{
        backgroundImage: `radial-gradient(#D8CCC2 1px, transparent 1px)`,
        backgroundSize: `${24 * scale}px ${24 * scale}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* ── Tool Mode & View Control Floating Bar ────────────────────────── */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl border border-[#EADBCE] shadow-md pointer-events-auto">
        {/* Pointer vs Hand tool */}
        <div className="flex items-center bg-[#FAF5F0] p-0.5 rounded-xl border border-[#EADBCE] mr-1">
          <button
            onClick={() => setToolMode("select")}
            title="Select & Marquee Tool (V)"
            className={cn(
              "p-1.5 rounded-lg transition cursor-pointer",
              toolMode === "select" ? "bg-white shadow-xs text-violet-600 font-semibold" : "text-[#8E847C] hover:text-[#121217]"
            )}
          >
            <MousePointer className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setToolMode("pan")}
            title="Pan Hand Tool (H / Space)"
            className={cn(
              "p-1.5 rounded-lg transition cursor-pointer",
              toolMode === "pan" ? "bg-white shadow-xs text-violet-600 font-semibold" : "text-[#8E847C] hover:text-[#121217]"
            )}
          >
            <Hand className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => handleZoom(0.15)}
          title="Zoom In"
          className="p-1.5 text-[#645F5A] hover:text-[#121217] hover:bg-[#FAF5F0] rounded-xl transition cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono font-medium text-[#8E847C] px-1 min-w-[42px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => handleZoom(-0.15)}
          title="Zoom Out"
          className="p-1.5 text-[#645F5A] hover:text-[#121217] hover:bg-[#FAF5F0] rounded-xl transition cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-[#EADBCE] mx-0.5" />
        <button
          onClick={handleFitView}
          title="Fit View"
          className="p-1.5 text-[#645F5A] hover:text-[#121217] hover:bg-[#FAF5F0] rounded-xl transition cursor-pointer"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          title="Reset View"
          className="p-1.5 text-[#645F5A] hover:text-[#121217] hover:bg-[#FAF5F0] rounded-xl transition cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* ── Multi-Selection Floating Action Bar ──────────────────────────── */}
      {activeSelectedIds.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-[#121217] text-white px-4 py-2 rounded-2xl shadow-2xl border border-white/10 animate-fade-in pointer-events-auto">
          <div className="flex items-center gap-2 pr-3 border-r border-white/20 text-xs font-semibold">
            <span className="w-5 h-5 rounded-full bg-violet-500 text-white flex items-center justify-center text-[10px]">
              {activeSelectedIds.length}
            </span>
            <span>nodes selected</span>
          </div>

          <button
            onClick={handleBulkDuplicate}
            title="Duplicate Selected (Ctrl+D)"
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer font-medium"
          >
            <Copy className="w-3.5 h-3.5" />
            Duplicate
          </button>

          <button
            onClick={handleAlignHorizontal}
            title="Align Selected Nodes Horizontally"
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer font-medium"
          >
            <AlignHorizontalDistributeCenter className="w-3.5 h-3.5" />
            Align
          </button>

          <button
            onClick={handleBulkDelete}
            title="Delete Selected (Delete / Backspace)"
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white transition cursor-pointer font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}

      {/* ── Mini-Map Floating Box ─────────────────────────────────────────── */}
      {showMiniMap && nodes.length > 0 && (
        <div className="absolute bottom-4 right-4 z-20 w-44 h-32 bg-white/90 backdrop-blur-md border border-[#EADBCE] rounded-2xl p-2 shadow-lg hidden md:block select-none pointer-events-auto">
          <div className="flex items-center justify-between text-[10px] font-semibold text-[#8E847C] mb-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-500" /> MiniMap
            </span>
            <button
              onClick={() => setShowMiniMap(false)}
              className="text-[#8E847C] hover:text-[#121217] cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="w-full h-24 bg-[#FAF5F0] rounded-lg relative overflow-hidden border border-[#EADBCE]">
            {nodes.map((node) => (
              <div
                key={node.id}
                className={cn(
                  "absolute rounded-xs shadow-xs transition-colors",
                  activeSelectedIds.includes(node.id) ? "bg-violet-600" : "bg-[#8E847C]/60"
                )}
                style={{
                  left: `${Math.max(Math.min((node.position.x / 1400) * 100, 85), 5)}%`,
                  top: `${Math.max(Math.min((node.position.y / 800) * 100, 75), 10)}%`,
                  width: "18px",
                  height: "10px",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Canvas World / SVG Layer ───────────────────────────────────────── */}
      <div
        className="absolute inset-0 origin-top-left pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        }}
      >
        {/* SVG Edges & Marquee Selection Layer */}
        <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-none overflow-visible">
          <defs>
            <linearGradient id="edge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#F43F5E" />
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>

            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#F43F5E" />
            </marker>

            <marker
              id="arrowhead-selected"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#E11D48" />
            </marker>
          </defs>

          {/* Render Active Edges */}
          {edges.map((edge) => {
            const start = getNodePortPosition(edge.sourceNodeId, edge.sourcePortId, "out");
            const end = getNodePortPosition(edge.targetNodeId, edge.targetPortId, "in");
            const path = createBezierPath(start.x, start.y, end.x, end.y);
            const isSelected = selectedEdgeId === edge.id;

            return (
              <g key={edge.id} className="group pointer-events-auto cursor-pointer">
                {/* Thick invisible stroke for easy clicking */}
                <path
                  d={path}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="16"
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEdgeId(edge.id);
                    updateSelection([]);
                  }}
                />

                {/* Visible Glow Edge */}
                <path
                  d={path}
                  fill="none"
                  stroke={isSelected ? "#E11D48" : "url(#edge-gradient)"}
                  strokeWidth={isSelected ? "3.5" : "2.5"}
                  strokeDasharray={edge.animated ? "6 4" : undefined}
                  className={cn(
                    "transition-all cursor-pointer",
                    edge.animated && "animate-[dash_1.5s_linear_infinite]"
                  )}
                  markerEnd={isSelected ? "url(#arrowhead-selected)" : "url(#arrowhead)"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEdgeId(edge.id);
                    updateSelection([]);
                  }}
                />

                {/* Optional Edge Label */}
                {edge.label && (
                  <text
                    x={(start.x + end.x) / 2}
                    y={(start.y + end.y) / 2 - 8}
                    textAnchor="middle"
                    className="text-[10px] font-semibold fill-[#645F5A] select-none pointer-events-none bg-white px-1"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Render in-progress dragging connection */}
          {connecting && (
            <path
              d={createBezierPath(
                getNodePortPosition(connecting.sourceNodeId, connecting.sourcePortId, "out").x,
                getNodePortPosition(connecting.sourceNodeId, connecting.sourcePortId, "out").y,
                connecting.currentX,
                connecting.currentY
              )}
              fill="none"
              stroke="#F43F5E"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              className="animate-pulse pointer-events-none"
            />
          )}

          {/* ── Drag-to-Select Marquee Rectangle ───────────────────────────── */}
          {selectionBox && (
            <rect
              x={Math.min(selectionBox.startX, selectionBox.currentX)}
              y={Math.min(selectionBox.startY, selectionBox.currentY)}
              width={Math.abs(selectionBox.currentX - selectionBox.startX)}
              height={Math.abs(selectionBox.currentY - selectionBox.startY)}
              fill="rgba(139, 92, 246, 0.12)"
              stroke="#8B5CF6"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              rx="6"
              className="pointer-events-none"
            />
          )}
        </svg>

        {/* Interactive Node Components Layer */}
        <div className="absolute inset-0 pointer-events-none">
          {nodes.map((node) => (
            <div
              key={node.id}
              onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
              className="absolute left-0 top-0 pointer-events-auto"
            >
              <WorkflowNodeComponent
                node={node}
                scale={scale}
                isSelected={activeSelectedIds.includes(node.id)}
                onSelect={(id) => {
                  updateSelection([id]);
                  setSelectedEdgeId(null);
                }}
                onDelete={onDeleteNode}
                onDuplicate={onDuplicateNode}
                onPortMouseDown={handlePortMouseDown}
                onPortMouseUp={handlePortMouseUp}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
