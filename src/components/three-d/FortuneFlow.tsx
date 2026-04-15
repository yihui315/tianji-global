'use client';

/**
 * FortuneFlow — 命运流动数据可视化
 *
 * 基于 AI_Animation 的数据流动动画
 * 展示运势在不同维度间的流动
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface FlowNode {
  id: string;
  label: string;
  labelEn: string;
  value: number;
  x: number;
  y: number;
  color: string;
}

interface FlowEdge {
  from: string;
  to: string;
  value: number;
}

interface FortuneFlowProps {
  nodes: FlowNode[];
  edges?: FlowEdge[];
  language?: 'zh' | 'en';
  animated?: boolean;
  width?: number;
  height?: number;
}

export default function FortuneFlow({
  nodes,
  edges = [],
  language = 'zh',
  animated = true,
  width = 800,
  height = 400
}: FortuneFlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Array<{ x: number; y: number; progress: number; from: string; to: string }>>([]);

  // Default nodes for demo
  const defaultNodes: FlowNode[] = nodes.length > 0 ? nodes : [
    { id: 'career', label: '事业', labelEn: 'Career', value: 85, x: 100, y: 200, color: '#F59E0B' },
    { id: 'love', label: '感情', labelEn: 'Love', value: 72, x: 300, y: 100, color: '#EC4899' },
    { id: 'wealth', label: '财富', labelEn: 'Wealth', value: 68, x: 500, y: 200, color: '#10B981' },
    { id: 'health', label: '健康', labelEn: 'Health', value: 90, x: 400, y: 300, color: '#6366F1' }
  ];

  const defaultEdges: FlowEdge[] = edges.length > 0 ? edges : [
    { from: 'career', to: 'wealth', value: 30 },
    { from: 'love', to: 'career', value: 20 },
    { from: 'health', to: 'career', value: 15 },
    { from: 'wealth', to: 'love', value: 25 }
  ];

  // Generate particles along edges
  useEffect(() => {
    if (!animated) return;

    const interval = setInterval(() => {
      const edge = defaultEdges[Math.floor(Math.random() * defaultEdges.length)];
      const fromNode = defaultNodes.find(n => n.id === edge.from);
      const toNode = defaultNodes.find(n => n.id === edge.to);

      if (fromNode && toNode) {
        setParticles(prev => [
          ...prev.slice(-20),
          {
            x: fromNode.x,
            y: fromNode.y,
            progress: 0,
            from: edge.from,
            to: edge.to
          }
        ]);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [animated, defaultEdges, defaultNodes]);

  // Animate particles
  useEffect(() => {
    if (!animated) return;

    const interval = setInterval(() => {
      setParticles(prev =>
        prev
          .map(p => {
            const fromNode = defaultNodes.find(n => n.id === p.from);
            const toNode = defaultNodes.find(n => n.id === p.to);
            if (!fromNode || !toNode) return p;

            const newProgress = p.progress + 0.02;
            if (newProgress >= 1) return null;

            const x = fromNode.x + (toNode.x - fromNode.x) * newProgress;
            const y = fromNode.y + (toNode.y - fromNode.y) * newProgress;

            return { ...p, x, y, progress: newProgress };
          })
          .filter(Boolean) as typeof prev
      );
    }, 16);

    return () => clearInterval(interval);
  }, [animated, defaultNodes]);

  return (
    <div className="fortune-flow" style={{ width, height }}>
      <canvas ref={canvasRef} width={width} height={height} />

      {/* SVG overlay for better rendering */}
      <svg width={width} height={height} className="flow-svg">
        {/* Connection lines */}
        {defaultEdges.map((edge, i) => {
          const fromNode = defaultNodes.find(n => n.id === edge.from);
          const toNode = defaultNodes.find(n => n.id === edge.to);
          if (!fromNode || !toNode) return null;

          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2 - 20;

          return (
            <g key={i}>
              {/* Dashed line */}
              <motion.path
                d={`M ${fromNode.x} ${fromNode.y} Q ${midX} ${midY} ${toNode.x} ${toNode.y}`}
                fill="none"
                stroke="rgba(168,130,255,0.2)"
                strokeWidth="2"
                strokeDasharray="8,4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </g>
          );
        })}

        {/* Animated particles */}
        {particles.map((particle, i) => {
          const toNode = defaultNodes.find(n => n.id === particle.to);
          if (!toNode) return null;

          return (
            <motion.circle
              key={i}
              cx={particle.x}
              cy={particle.y}
              r={4}
              fill={toNode.color}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      <div className="flow-nodes" style={{ position: 'absolute', inset: 0 }}>
        {defaultNodes.map((node, i) => (
          <motion.div
            key={node.id}
            className="flow-node"
            style={{
              left: node.x,
              top: node.y,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.2 }}
          >
            <div
              className="node-circle"
              style={{
                width: `${40 + node.value / 5}px`,
                height: `${40 + node.value / 5}px`,
                background: `linear-gradient(135deg, ${node.color}40, ${node.color}20)`,
                border: `2px solid ${node.color}`,
                boxShadow: `0 0 20px ${node.color}50`
              }}
            >
              <span className="node-icon" style={{ fontSize: 20 }}>✨</span>
            </div>
            <div className="node-label">
              <span className="node-name" style={{ color: node.color }}>
                {language === 'zh' ? node.label : node.labelEn}
              </span>
              <span className="node-value">{node.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <style jsx>{`
        .fortune-flow {
          position: relative;
          background: linear-gradient(180deg, #030014 0%, #0a0a1e 100%);
          border-radius: 16px;
          border: 1px solid rgba(168,130,255,0.2);
          overflow: hidden;
        }
        .fortune-flow canvas, .flow-svg {
          position: absolute;
          top: 0;
          left: 0;
        }
        .flow-nodes {
          z-index: 1;
        }
        .flow-node {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .node-circle {
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }
        .node-circle:hover {
          transform: scale(1.1);
        }
        .node-label {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
        }
        .node-name {
          font-size: 12px;
          font-weight: 600;
        }
        .node-value {
          font-size: 10px;
          color: rgba(255,255,255,0.4);
        }
      `}</style>
    </div>
  );
}