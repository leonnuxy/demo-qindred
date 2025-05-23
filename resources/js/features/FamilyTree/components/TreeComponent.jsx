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
    
    // Create a container for the tree
    const g = svg.append("g")
      .attr("transform", `translate(50, 50)`);
    
    // Create links between nodes
    g.selectAll(".link")
      .data(root.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x(d => d.y)  // Swap x and y for a horizontal tree
        .y(d => d.x))
      .attr("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1.5);
    
    // Create node groups
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter()
      .append("g")
      .attr("class", d => `node ${d.children ? "node--internal" : "node--leaf"}`)
      .attr("transform", d => `translate(${d.y}, ${d.x})`)
      .on("click", (event, d) => {
        if (onNodeClick) {
          onNodeClick(d.data);
        }
      });
    
    // Add circles for the nodes
    node.append("circle")
      .attr("r", 10)
      .attr("fill", d => d.data.deceased ? "#ccc" : 
        d.data.gender === "male" ? "#c0e3f2" : 
        d.data.gender === "female" ? "#ffc0cb" : "#f8f8f8")
      .attr("stroke", d => d.data.currentUser ? "#ff7700" : "#999")
      .attr("stroke-width", d => d.data.currentUser ? 3 : 1);
    
    // Add name labels to nodes
    node.append("text")
      .attr("dy", 3)
      .attr("x", d => d.children ? -15 : 15)
      .style("text-anchor", d => d.children ? "end" : "start")
      .text(d => `${d.data.firstName || ''} ${d.data.lastName || ''}`)
      .attr("font-size", "12px")
      .attr("font-weight", d => d.data.currentUser ? "bold" : "normal");
    
    // Add date labels to nodes
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
      .attr("fill", "#777");
    
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
    <div className="w-full h-full min-h-[400px] overflow-auto">
      <svg 
        ref={svgRef} 
        width={dimensions.width} 
        height={dimensions.height} 
        className="family-tree-svg"
      />
    </div>
  );
}
