import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const FamilyTree = ({ 
  data,
  onNodeClick,
  relationshipTypes = ['biological', 'adopted', 'step'],
  theme = {
    nodeSize: 40,
    linkColor: '#94a3b8',
    adoptedLink: 'url(#adopted-pattern)',
    stepLink: 'url(#step-pattern)'
  }
}) => {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [tooltip, setTooltip] = useState({ visible: false, content: null });

  // Convert flat data to hierarchical structure
  const convertToHierarchy = (rootId, members) => {
    const memberMap = new Map(members.map(m => [m.id, m]));
    const buildTree = (id) => {
      const member = memberMap.get(id);
      if (!member) return null;
      
      return {
        ...member,
        children: [
          ...(member.children || []).map(childId => buildTree(childId)),
          ...(member.spouse ? [buildTree(member.spouse)] : [])
        ].filter(Boolean)
      };
    };

    return buildTree(rootId);
  };

  useEffect(() => {
    if (!data?.root || !data.members?.length) return;

    const hierarchyData = convertToHierarchy(data.root.id, data.members);
    const root = d3.hierarchy(hierarchyData);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const container = svg.append('g')
      .attr('transform', `translate(50, 50)`);

    // Define custom link patterns
    const defs = svg.append('defs');
    
    // Adopted relationship pattern
    defs.append('pattern')
      .attr('id', 'adopted-pattern')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', 8)
      .attr('height', 8)
      .append('path')
      .attr('d', 'M0,8 l8,-8 M-2,2 l4,-4 M6,10 l4,-4')
      .attr('stroke', theme.linkColor)
      .attr('stroke-width', 1);

    // Step relationship pattern
    defs.append('pattern')
      .attr('id', 'step-pattern')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', 6)
      .attr('height', 6)
      .append('path')
      .attr('d', 'M0,6 l6,-6')
      .attr('stroke', theme.linkColor)
      .attr('stroke-width', 1);

    const treeLayout = d3.tree()
      .size([dimensions.height - 100, dimensions.width - 100]);

    treeLayout(root);

    // Links with relationship styling
    container.selectAll('.link')
      .data(root.links())
      .enter().append('path')
      .attr('class', 'family-link')
      .attr('d', d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x))
      .attr('fill', 'none')
      .attr('stroke', d => {
        if (d.target.data.relation === 'adopted') return theme.adoptedLink;
        if (d.target.data.relation === 'step') return theme.stepLink;
        return theme.linkColor;
      })
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', d => {
        if (d.target.data.relation === 'step') return '5,5';
        return 'none';
      });

    // Nodes with interactive features
    const nodes = container.selectAll('.node')
      .data(root.descendants())
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .on('mouseover', (event, d) => {
        setTooltip({
          visible: true,
          content: `${d.data.name}\n${d.data.birthYear} - ${d.data.deathYear || 'Present'}`,
          x: event.pageX,
          y: event.pageY
        });
      })
      .on('mouseout', () => setTooltip({ visible: false }))
      .on('click', (event, d) => onNodeClick?.(d.data));

    // Node circles with gender styling
    nodes.append('circle')
      .attr('r', theme.nodeSize / 2)
      .attr('fill', d => {
        if (d.data.relation === 'adopted') return '#f0fdf4';
        if (d.data.relation === 'step') return '#fffbeb';
        return d.data.gender === 'male' ? '#bfdbfe' : '#fbcfe8';
      })
      .attr('stroke', d => d.data.relation === 'step' ? '#f59e0b' : '#64748b')
      .attr('stroke-width', 1.5);

    // Node labels
    nodes.append('text')
      .attr('dy', 4)
      .attr('x', d => d.children ? -theme.nodeSize/1.5 : theme.nodeSize/1.5)
      .attr('text-anchor', d => d.children ? 'end' : 'start')
      .text(d => d.data.name)
      .attr('font-size', '12px')
      .attr('fill', '#1e293b');

    // Relationship indicators
    nodes.append('text')
      .attr('dy', 20)
      .attr('x', 0)
      .attr('text-anchor', 'middle')
      .text(d => {
        if (d.data.relation === 'adopted') return 'Ⓐ';
        if (d.data.relation === 'step') return 'Ⓢ';
        return '';
      })
      .attr('font-size', '10px')
      .attr('fill', '#64748b');

  }, [data, dimensions, theme]);

  // Responsive handling
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height: Math.max(400, height) });
    });

    if (svgRef.current?.parentElement) {
      resizeObserver.observe(svgRef.current.parentElement);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="family-tree-container relative">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}>
        {tooltip.visible && (
          <foreignObject x={tooltip.x} y={tooltip.y} width="200" height="100">
            <div className="family-tree-tooltip bg-white p-3 rounded-lg shadow-lg border border-gray-200">
              <pre className="text-sm whitespace-pre-wrap">{tooltip.content}</pre>
            </div>
          </foreignObject>
        )}
      </svg>
    </div>
  );
};

export default FamilyTree;