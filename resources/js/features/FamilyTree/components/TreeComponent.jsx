import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

/**
 * Family Tree Visualization Component
 * 
 * @param {Object} props
 * @param {Object} props.initialData - Hierarchical data for the tree
 * @param {Function} props.onNodeClick - Optional callback when a node is clicked
 */
export default function TreeComponent({ initialData, onNodeClick }) {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // Set up the tree visualization
  useEffect(() => {
    if (!initialData || !svgRef.current) return;
    
    // Clear previous rendering
    d3.select(svgRef.current).selectAll("*").remove();
    
    const svg = d3.select(svgRef.current);
    const width = dimensions.width;
    const height = dimensions.height;
    
    // Create a tree layout
    const treeLayout = d3.tree()
      .size([width - 100, height - 100]);
    
    // Convert the initialData to a d3 hierarchy
    const root = d3.hierarchy(initialData);
    
    // Assign the x and y positions to each node
    treeLayout(root);
    
    // Create a container for the tree with a smoother translation
    const g = svg.append("g")
      .attr("transform", `translate(50, 50)`)
      .attr("class", "tree-container");
    
    // Create links between nodes with enhanced styling
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x(d => d.y)  // Swap x and y for a horizontal tree
        .y(d => d.x))
      .attr("fill", "none")
      .attr("stroke", "var(--qindred-green-500)")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.8)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round");
    
    // Create node groups with interactive features
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", d => `node ${d.children ? "node--internal" : "node--leaf"}`)
      .attr("transform", d => `translate(${d.y}, ${d.x})`)
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
        if (onNodeClick) {
          onNodeClick(d.data);
        }
      })
      .on("mouseover", function() {
        // Highlight node on hover
        d3.select(this).select("circle")
          .attr("stroke-width", d => d.data.currentUser ? 3.5 : 2)
          .attr("filter", "drop-shadow(0 2px 3px rgba(0,0,0,0.2))");
      })
      .on("mouseout", function() {
        // Reset styling on mouseout
        d3.select(this).select("circle")
          .attr("stroke-width", d => d.data.currentUser ? 3 : 1)
          .attr("filter", "none");
      });
    
    // Add circles for the nodes with enhanced styling
    node.append("circle")
      .attr("r", 10)
      .attr("fill", d => d.data.deceased ? "#f3f4f6" : 
        d.data.gender === "male" ? "var(--qindred-green-400)" : 
        d.data.gender === "female" ? "var(--qindred-green-500)" : "var(--qindred-green-100)")
      .attr("stroke", d => d.data.currentUser ? "var(--qindred-green-900)" : "var(--qindred-green-700)")
      .attr("stroke-width", d => d.data.currentUser ? 3 : 1)
      .attr("transition", "all 0.2s ease-in-out");
    
    // Add name labels to nodes with improved styling
    node.append("text")
      .attr("dy", 3)
      .attr("x", d => d.children ? -15 : 15)
      .style("text-anchor", d => d.children ? "end" : "start")
      .text(d => `${d.data.firstName || ''} ${d.data.lastName || ''}`)
      .attr("font-size", "12px")
      .attr("font-weight", d => d.data.currentUser ? "bold" : "normal")
      .attr("fill", d => d.data.currentUser ? "var(--qindred-green-900)" : "var(--qindred-green-800)")
      .attr("filter", d => d.data.currentUser ? "drop-shadow(0 1px 1px rgba(0,0,0,0.1))" : "none");
    
    // Add date labels to nodes with subtle styling
    node.append("text")
      .attr("dy", 18)
      .attr("x", d => d.children ? -15 : 15)
      .style("text-anchor", d => d.children ? "end" : "start")
      .text(d => {
        const birth = d.data.dateOfBirth ? new Date(d.data.dateOfBirth).getFullYear() : null;
        const death = d.data.dateOfDeath ? new Date(d.data.dateOfDeath).getFullYear() : null;
        
        if (birth && death) return `${birth} - ${death}`;
        if (birth) return `b. ${birth}`;
        return '';
      })
      .attr("font-size", "10px")
      .attr("fill", "var(--qindred-green-600)")
      .attr("opacity", 0.8);
    
  }, [initialData, dimensions, onNodeClick]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const container = svgRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: Math.max(500, container.clientHeight),
        });
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="w-full h-full min-h-[400px] overflow-auto bg-qindred-green-50/30 dark:bg-qindred-green-900/5 rounded-lg p-4">
      <svg 
        ref={svgRef} 
        width={dimensions.width} 
        height={dimensions.height} 
        className="family-tree-svg"
      />
    </div>
  );
}
