"use client";

import { getBezierPath, type EdgeProps } from "@xyflow/react";

// ─── FlowThreadEdge — jitter-free SVG SMIL animation ─────────────────────────
//
// Previous approach: CSS `stroke-dashoffset` animation with an inline <style>
// tag. React Flow re-renders the edge on every pan/zoom, which re-created the
// <style> tag and reset the CSS animation — causing visible jitter.
//
// This version uses pure SVG SMIL <animateMotion> + <mpath>:
//   • Handled by the SVG engine, completely independent of React render cycles
//   • calcMode="spline" with ease-in-out keySplines = dot accelerates out of
//     source nail and decelerates into target nail — organic, rope-like feel
//   • At the end of each cycle the dot is nearly stationary (speed ≈ 0), so
//     the loop reset is nearly invisible — no flash, no jump
//   • No CSS, no <style> tags, no animation-restart jitter
//
// Two elements only:
//   1. A quiet 1px base wire (barely visible — just marks the path)
//   2. A 2px circle that rides the bezier curve via <animateMotion>

export function FlowThreadEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    selected,
}: EdgeProps) {
    const [edgePath] = getBezierPath({
        sourceX, sourceY, sourcePosition,
        targetX, targetY, targetPosition,
    });

    // Unique ID for the <defs> reference path so mpath can find it
    const refId = `flow-thread-${id}`;

    return (
        <g>
            {/*
              Reference path in <defs> — invisible, used only by <animateMotion>.
              Must be declared before the <animateMotion> that references it.
            */}
            <defs>
                <path id={refId} d={edgePath} />
            </defs>

            {/* 1 — Quiet base wire */}
            <path
                d={edgePath}
                fill="none"
                stroke={selected ? "rgba(113,113,122,0.42)" : "rgba(161,161,170,0.22)"}
                strokeWidth={1}
            />

            {/* 2 — Travelling dot: pure SVG SMIL, zero CSS, zero jitter */}
            <circle
                r={2}
                fill={selected ? "rgba(100,100,108,0.85)" : "rgba(130,130,138,0.65)"}
            >
                <animateMotion
                    dur="2.5s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    keyTimes="0;1"
                    keySplines="0.25 0 0.75 1"
                    rotate="none"
                >
                    {/* mpath follows the bezier curve exactly */}
                    <mpath href={`#${refId}`} />
                </animateMotion>
            </circle>
        </g>
    );
}
