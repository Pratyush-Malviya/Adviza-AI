"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  WorkflowNode,
  WorkflowEdge,
  NodeTemplateDefinition,
  NodePort,
  ExecutionStatus
} from "@/types/workflow";
import { WorkflowNodeComponent } from "./workflow-node";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Sparkles,
  MapPin,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onUpdateNodes: (nodes: WorkflowNode[]) => void;
  onUpdateEdges: (edges: WorkflowEdge[]) => void;
  onAddNodeFromTemplate: (template: NodeTemplateDefinition, position?: { x: number; y: number }) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
}

interface DraggingConnection {
  sourceNodeId: string;
  sourcePortId: string;
  currentX: number;
  currentY: number;
}

export function WorkflowCanvas({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  onUpdateNodes,
  onUpdateEdges,
  onAddNodeFromTemplate,
  onDeleteNode,
  onDuplicateNode,
}: WorkflowCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom state
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 40 });
  const [scale, setScale] = useState<number>(1);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Node Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Edge Connection in progress
  const [connecting, setConnecting] = useState<DraggingConnection | null>(null);

  // Selected edge
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  // Mini-map visibility
  const [showMiniMap, setShowMiniMap] = useState<boolean>(true);

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

  // Keyboard Shortcuts (Delete, Backspace, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedNodeId) {
          onDeleteNode(selectedNodeId);
        } else if (selectedEdgeId) {
          onUpdateEdges(edges.filter((edge) => edge.id !== selectedEdgeId));
          setSelectedEdgeId(null);
        }
      } else if (e.key === "Escape") {
        onSelectNode(null);
        setSelectedEdgeId(null);
        setConnecting(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodeId, selectedEdgeId, edges, onDeleteNode, onUpdateEdges, onSelectNode]);

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

  // Canvas Mouse Down (Panning or Deselection)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      // Left click on background
      onSelectNode(null);
      setSelectedEdgeId(null);
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  // Canvas Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (draggingNodeId) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      onUpdateNodes(
        nodes.map((node) =>
          node.id === draggingNodeId
            ? {
                ...node,
                position: {
                  x: Math.round(pos.x - dragOffset.x),
                  y: Math.round(pos.y - dragOffset.y),
                },
              }
            : node
        )
      );
    } else if (connecting) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      setConnecting((prev) =>
        prev
          ? {
              ...prev,
              currentX: pos.x,
              currentY: pos.y,
            }
          : null
      );
    }
  };

  // Canvas Mouse Up
  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
    setConnecting(null);
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

  // Start Node Dragging
  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectNode(nodeId);
    setSelectedEdgeId(null);
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const mouseCanvasPos = screenToCanvas(e.clientX, e.clientY);
    setDraggingNodeId(nodeId);
    setDragOffset({
      x: mouseCanvasPos.x - node.position.x,
      y: mouseCanvasPos.y - node.position.y,
    });
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
      // Create new Edge
      const newEdgeId = `edge-${connecting.sourceNodeId}-${nodeId}-${Date.now()}`;
      // Prevent duplicate edge between same ports
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
    const topPercent = ((portIndex + 1) / (ports.length + 1));
    const nodeHeight = 160; // approximate rendered height

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

  return (
    <div
      ref={containerRef}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="relative flex-1 h-full w-full bg-[#FAF5F0] overflow-hidden select-none cursor-grab active:cursor-grabbing"
      style={{
        backgroundImage: `radial-gradient(#D8CCC2 1px, transparent 1px)`,
        backgroundSize: `${24 * scale}px ${24 * scale}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* Zoom / View Control Floating Bar */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl border border-[#EADBCE] shadow-md">
        <button
          onClick={() => handleZoom(0.15)}
          title="Zoom In"
          className="p-1.5 text-[#645F5A] hover:text-[#121217] hover:bg-[#FAF5F0] rounded-xl transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono font-medium text-[#8E847C] px-1 min-w-[42px] text-center">
          {Math.round(scale * 100)}%
        </span>
        <button
          onClick={() => handleZoom(-0.15)}
          title="Zoom Out"
          className="p-1.5 text-[#645F5A] hover:text-[#121217] hover:bg-[#FAF5F0] rounded-xl transition"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-[#EADBCE] mx-0.5" />
        <button
          onClick={handleFitView}
          title="Fit View"
          className="p-1.5 text-[#645F5A] hover:text-[#121217] hover:bg-[#FAF5F0] rounded-xl transition"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          title="Reset View"
          className="p-1.5 text-[#645F5A] hover:text-[#121217] hover:bg-[#FAF5F0] rounded-xl transition"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Mini-Map Floating Box */}
      {showMiniMap && nodes.length > 0 && (
        <div className="absolute bottom-4 right-4 z-20 w-44 h-32 bg-white/90 backdrop-blur-md border border-[#EADBCE] rounded-2xl p-2 shadow-lg hidden md:block select-none pointer-events-auto">
          <div className="flex items-center justify-between text-[10px] font-semibold text-[#8E847C] mb-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-rose-500" /> MiniMap
            </span>
            <button
              onClick={() => setShowMiniMap(false)}
              className="text-[#8E847C] hover:text-[#121217]"
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
                  selectedNodeId === node.id ? "bg-rose-500" : "bg-[#8E847C]/60"
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

      {/* Canvas World / SVG Layer */}
      <div
        className="absolute inset-0 origin-top-left pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        }}
      >
        {/* SVG Edges Layer */}
        <svg className="absolute inset-0 w-[5000px] h-[5000px] pointer-events-auto overflow-visible">
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
              <g key={edge.id} className="group cursor-pointer">
                {/* Thick invisible stroke for easy clicking */}
                <path
                  d={path}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="16"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEdgeId(edge.id);
                    onSelectNode(null);
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
                    "transition-all",
                    edge.animated && "animate-[dash_1.5s_linear_infinite]"
                  )}
                  markerEnd={isSelected ? "url(#arrowhead-selected)" : "url(#arrowhead)"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEdgeId(edge.id);
                    onSelectNode(null);
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
        </svg>

        {/* Interactive Node Components Layer */}
        <div className="absolute inset-0 pointer-events-auto">
          {nodes.map((node) => (
            <div
              key={node.id}
              onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
              className="absolute left-0 top-0"
            >
              <WorkflowNodeComponent
                node={node}
                scale={scale}
                isSelected={selectedNodeId === node.id}
                onSelect={(id) => {
                  onSelectNode(id);
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
