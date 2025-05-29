import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const NODE_WIDTH = 120;
const NODE_HEIGHT = 130;
const SPOUSE_GAP = 20;
const GENERATION_GAP = 60;

const TreeComponent = ({ initialData, zoom = 0.8, onNodeClick }) => {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });

  const processNode = (node, depth = 0) => {
    if (!node) return null;
    
    console.log('Processing node:', node);
    
    // Map the backend data format to the format needed for the tree
    // Extract data from name and attributes fields if firstName/lastName aren't available
    const processedNode = {
      ...node,
      // Extract first name and last name from the name field if available
      firstName: node.firstName || (node.name ? node.name.split(' ')[0] : '?'),
      lastName: node.lastName || (node.name && node.name.split(' ').length > 1 
        ? node.name.split(' ').slice(1).join(' ') 
        : ''),
      // Extract dates from attributes if available
      dateOfBirth: node.dateOfBirth || (node.attributes?.birth_date || ''),
      dateOfDeath: node.dateOfDeath || (node.attributes?.death_date || ''),
      // Use default values for other fields if not available
      gender: node.gender || (node.attributes?.gender || 'other'),
      relationshipToUser: node.relationshipToUser || (node.attributes?.relationship_to_user || ''),
      depth,
      // Process children and partners if available
      children: [
        ...(node.partners?.flatMap(partner => partner ? [
          { 
            ...(partner || {}), 
            firstName: partner.firstName || (partner.name ? partner.name.split(' ')[0] : '?'), 
            lastName: partner.lastName || (partner.name && partner.name.split(' ').length > 1 
              ? partner.name.split(' ').slice(1).join(' ') 
              : ''), 
            dateOfBirth: partner.dateOfBirth || (partner.attributes?.birth_date || ''),
            dateOfDeath: partner.dateOfDeath || (partner.attributes?.death_date || ''),
            gender: partner.gender || (partner.attributes?.gender || 'other'),
            relationshipToUser: partner.relationshipToUser || (partner.attributes?.relationship_to_user || ''),
            isPartner: true 
          },
          ...(partner.children?.map(child => processNode(child, depth + 1)).filter(Boolean) || [])
        ] : []) || []),
        ...(node.children?.map(child => processNode(child, depth + 1)).filter(Boolean) || [])
      ]
    };

    console.log('Processed node:', processedNode);
    return processedNode;
  };

  useEffect(() => {
    if (!initialData) return;
    
    console.log('Initial tree data:', JSON.stringify(initialData, null, 2));
    console.log('Rendering tree with data:', initialData);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create a group for the entire tree that will be centered and scaled
    const g = svg.append("g")
      .attr("transform", `translate(${dimensions.width / 2}, 10) scale(${zoom})`);

    const root = d3.hierarchy(processNode(initialData));
    const treeLayout = d3.tree().nodeSize([NODE_WIDTH, GENERATION_GAP]);
    
    treeLayout(root);

    // Adjust coordinates for vertical layout with balanced spacing
    root.descendants().forEach(d => {
      d.y = d.depth * (NODE_HEIGHT + GENERATION_GAP);
      // Use moderate horizontal spacing to accommodate grandchildren
      d.x = d.x * 1.0;
    });

    // Draw links
    g.selectAll('.link')
      .data(root.links())
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', d3.linkVertical()
        .x(d => d.x)
        .y(d => d.y))
      .attr('fill', 'none')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 2);

    // Draw spouse connections
    root.descendants().forEach(node => {
      if (node.data.partners?.length) {
        node.data.partners.forEach(partner => {
          g.append('path')
            .attr('class', 'spouse-link')
            .attr('d', `M${node.x},${node.y + NODE_HEIGHT} L${node.x},${node.y + NODE_HEIGHT + 25} L${partner.x},${partner.y + NODE_HEIGHT + 25} L${partner.x},${partner.y + NODE_HEIGHT}`)
            .attr('stroke', '#94a3b8')
            .attr('stroke-width', 2)
            .attr('fill', 'none');
        });
      }
    });

    // Draw nodes
    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .enter().append('foreignObject')
      .attr('class', d => `node ${d.data.isPartner ? 'partner' : ''}`)
      .attr('x', d => d.x - NODE_WIDTH/2)
      .attr('y', d => d.y)
      .attr('width', NODE_WIDTH)
      .attr('height', NODE_HEIGHT)
      .on('mouseover', (event, d) => {
        // Extract name from either firstName/lastName or from name property
        const firstName = d.data.firstName || (d.data.name ? d.data.name.split(' ')[0] : '?');
        const lastName = d.data.lastName || (d.data.name && d.data.name.split(' ').length > 1 
          ? d.data.name.split(' ').slice(1).join(' ') 
          : '');
        
        // Extract dates from direct fields or attributes
        const birthDate = d.data.dateOfBirth || (d.data.attributes && d.data.attributes.birth_date) || 'Unknown';
        const deathDate = d.data.dateOfDeath || (d.data.attributes && d.data.attributes.death_date) || 'Present';
        
        setTooltip({
          visible: true,
          content: `${firstName || '?'} ${lastName || ''}\n${birthDate} - ${deathDate}`,
          x: event.pageX,
          y: event.pageY
        });
      })
      .on('mouseout', () => setTooltip({ visible: false }))
      .on('click', (event, d) => onNodeClick?.(d.data));

    nodes.html(d => {
      // Format dates properly
      let birthYear = '';
      let deathYear = '';
      let dateDisplay = '';
      
      // Use either direct field or from attributes
      const birthDate = d.data.dateOfBirth || (d.data.attributes && d.data.attributes.birth_date);
      const deathDate = d.data.dateOfDeath || (d.data.attributes && d.data.attributes.death_date);
      
      if (birthDate) {
        try {
          birthYear = birthDate.split('-')[0] || '';
        } catch (e) {
          birthYear = '';
        }
      }
      
      if (deathDate) {
        try {
          deathYear = deathDate.split('-')[0] || '';
        } catch (e) {
          deathYear = '';
        }
      }
      
      if (birthYear && deathYear) {
        dateDisplay = `${birthYear} - ${deathYear}`;
      } else if (birthYear) {
        dateDisplay = `${birthYear} -`;
      } else if (deathYear) {
        dateDisplay = `? - ${deathYear}`;
      }

      // Extract name from either direct fields or from name field
      const firstName = d.data.firstName || (d.data.name ? d.data.name.split(' ')[0] : '?');
      const lastName = d.data.lastName || (d.data.name && d.data.name.split(' ').length > 1 
        ? d.data.name.split(' ').slice(1).join(' ') 
        : '');
        
      // Generate initials for avatar placeholder
      const firstInitial = firstName ? firstName[0].toUpperCase() : '?';
      const lastInitial = lastName ? lastName[0].toUpperCase() : '';
      
      // Determine gender class - check both direct field and attributes
      const gender = d.data.gender || (d.data.attributes && d.data.attributes.gender) || 'other';
      const isCurrentUser = d.data.isCurrentUser || d.data.id === d.data.userId;
      
      // Get relationship info
      const relationship = d.data.relationshipToUser || 
        (d.data.attributes && d.data.attributes.relationship_to_user) || '';
      
      console.log('Rendering node:', {
        name: d.data.name,
        firstName,
        lastName,
        birthDate,
        deathDate,
        gender,
        isCurrentUser
      });
      
      return `
        <div class="flex flex-col items-center p-2 h-full w-full bg-white rounded-lg border-2 ${
          isCurrentUser ? 'border-2 border-purple-500 ' : 
          gender === 'male' ? 'border-blue-200 ' : 'border-pink-200 '
        }shadow-md hover:shadow-lg transition-all cursor-pointer">
          <div class="w-16 h-16 rounded-full my-2 ${
            gender === 'male' ? 'bg-blue-100 ' : 'bg-pink-100 '
          }flex items-center justify-center overflow-hidden">
            ${
              d.data.profilePhoto 
                ? `<img src="${d.data.profilePhoto}" alt="${firstName || '?'}" class="w-full h-full object-cover" />`
                : `<span class="text-xl font-medium">${firstInitial}${lastInitial}</span>`
            }
          </div>
          <div class="text-center mt-1">
            <div class="font-medium text-sm">${firstName || '?'} ${lastName || ''}</div>
            <div class="text-xs text-gray-600">
              ${dateDisplay}
            </div>
            ${
              relationship && !d.data.isPartner 
                ? `<div class="text-xs text-gray-500 mt-1">${relationship}</div>`
                : ''
            }
          </div>
        </div>
      `;
    });

  }, [initialData, dimensions, zoom, onNodeClick]);

  useEffect(() => {
    const handleResize = () => {
      const container = svgRef.current?.parentElement;
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight
        });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}>
        {tooltip.visible && (
          <foreignObject x={tooltip.x + 10} y={tooltip.y + 10} width="150" height="150">
            <div className="p-2 bg-white rounded shadow-lg border border-gray-200 text-sm">
              {tooltip.content}
            </div>
          </foreignObject>
        )}
      </svg>

      <style>{`
        .spouse-link {
          stroke-dasharray: 4;
          stroke-width: 2px;
        }
        .partner .node-content {
          background-color: #f8fafc;
        }
      `}</style>
    </div>
  );
};

export default TreeComponent;
