import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const NODE_WIDTH = 120;
const NODE_HEIGHT = 130;
const SPOUSE_GAP = 160; // Increased gap for side-by-side positioning
const GENERATION_GAP = 120; // Increased for partnership connection lines
const MARRIAGE_LINE_HEIGHT = 20; // Height of horizontal marriage connection line

const TreeComponent = ({ initialData, zoom = 0.8, onNodeClick }) => {
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [tooltip, setTooltip] = useState({ visible: false, content: '', x: 0, y: 0 });

  const processNode = (node, depth = 0, partnerOffset = 0) => {
    if (!node) return null;
    
    console.log('Processing node:', node);
    
    // Map the backend data format to the format needed for the tree
    const processedNode = {
      ...node,
      // Use provided fields or extract from name as fallback
      firstName: node.firstName || (node.name ? node.name.split(' ')[0] : '?'),
      lastName: node.lastName || (node.name && node.name.split(' ').length > 1 
        ? node.name.split(' ').slice(1).join(' ') 
        : ''),
      // Use provided dates or extract from attributes as fallback
      dateOfBirth: node.dateOfBirth || (node.attributes?.birth_date || ''),
      dateOfDeath: node.dateOfDeath || (node.attributes?.death_date || ''),
      // Use provided fields or extract from attributes as fallback
      gender: node.gender || (node.attributes?.gender || 'other'),
      relationshipToUser: node.relationshipToUser || (node.attributes?.relationship_to_user || ''),
      isCreator: node.isCreator || node.attributes?.isCreator || false,
      roleInTree: node.roleInTree || node.attributes?.roleInTree || '',
      depth,
      partnerOffset, // Track horizontal offset for partner positioning
      // Store raw partners and children data for custom positioning
      rawPartners: node.partners || [],
      rawChildren: node.children || [],
      // For D3 hierarchy, we'll handle partners and children separately
      children: (node.children || []).map(child => processNode(child, depth + 1))
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
      .attr("transform", `translate(${dimensions.width / 2}, 50) scale(${zoom})`);

    // Build custom node positioning for partners structure
    const allNodes = [];
    const allLinks = [];
    const partnershipLinks = [];
    const sharedChildrenLinks = [];

    const buildCustomTree = (node, x = 0, y = 0, depth = 0) => {
      const nodeData = {
        ...node,
        x,
        y,
        depth
      };
      allNodes.push(nodeData);

      // Handle partners (spouses) - position them side by side
      if (node.rawPartners && node.rawPartners.length > 0) {
        node.rawPartners.forEach((partner, index) => {
          const partnerX = x + SPOUSE_GAP; // Position partner to the right
          const partnerY = y; // Same vertical level as main person
          
          const partnerData = {
            ...processNode(partner, depth, 1),
            x: partnerX,
            y: partnerY,
            depth,
            isPartner: true,
            partnerId: node.id,
            partnershipIndex: index
          };
          allNodes.push(partnerData);

          // Create partnership connection line
          partnershipLinks.push({
            source: { x, y: y + NODE_HEIGHT / 2 },
            target: { x: partnerX, y: partnerY + NODE_HEIGHT / 2 },
            type: 'partnership'
          });

          // Handle shared children from this partnership
          if (partner.children && partner.children.length > 0) {
            const partnershipCenterX = (x + partnerX) / 2; // Middle point between partners
            const childrenStartY = y + NODE_HEIGHT + GENERATION_GAP;

            // Create vertical line from partnership to children level
            const partnershipChildConnector = {
              source: { x: partnershipCenterX, y: y + NODE_HEIGHT / 2 + MARRIAGE_LINE_HEIGHT },
              target: { x: partnershipCenterX, y: childrenStartY - 20 },
              type: 'partnership-to-children'
            };
            sharedChildrenLinks.push(partnershipChildConnector);

            // Create horizontal connector line for all children
            if (partner.children.length > 1) {
              const leftmostChildX = partnershipCenterX - ((partner.children.length - 1) / 2) * (NODE_WIDTH + 40);
              const rightmostChildX = partnershipCenterX + ((partner.children.length - 1) / 2) * (NODE_WIDTH + 40);
              
              sharedChildrenLinks.push({
                source: { x: leftmostChildX, y: childrenStartY - 10 },
                target: { x: rightmostChildX, y: childrenStartY - 10 },
                type: 'children-horizontal-connector'
              });
            }

            // Position shared children horizontally distributed
            partner.children.forEach((child, childIndex) => {
              const childX = partnershipCenterX + (childIndex - (partner.children.length - 1) / 2) * (NODE_WIDTH + 40);
              const childY = childrenStartY;

              // Create vertical connector from main horizontal line to child
              sharedChildrenLinks.push({
                source: { x: childX, y: childrenStartY - 10 },
                target: { x: childX, y: childrenStartY },
                type: 'child-vertical-connector'
              });

              // Connect partnership center to horizontal line
              sharedChildrenLinks.push({
                source: { x: partnershipCenterX, y: childrenStartY - 20 },
                target: { x: partnershipCenterX, y: childrenStartY - 10 },
                type: 'partnership-vertical-connector'
              });

              // Recursively build subtree for child
              buildCustomTree(processNode(child, depth + 1), childX, childY, depth + 1);
            });
          }
        });
      }

      // Handle individual children (not shared with partners)
      if (node.rawChildren && node.rawChildren.length > 0) {
        const individualChildrenStartY = y + NODE_HEIGHT + GENERATION_GAP;
        
        node.rawChildren.forEach((child, childIndex) => {
          const childX = x + (childIndex - (node.rawChildren.length - 1) / 2) * (NODE_WIDTH + 40);
          const childY = individualChildrenStartY;

          // Create link from parent to individual child
          allLinks.push({
            source: { x, y: y + NODE_HEIGHT },
            target: { x: childX, y: childY },
            type: 'parent-child'
          });

          // Recursively build subtree for child
          buildCustomTree(processNode(child, depth + 1), childX, childY, depth + 1);
        });
      }
    };

    // Start building the tree from root
    buildCustomTree(processNode(initialData), 0, 0, 0);

    console.log('Generated nodes:', allNodes);
    console.log('Generated links:', allLinks);
    console.log('Partnership links:', partnershipLinks);
    console.log('Shared children links:', sharedChildrenLinks);

    // Draw all link types
    
    // Regular parent-child links
    g.selectAll('.link')
      .data(allLinks)
      .enter().append('path')
      .attr('class', 'link')
      .attr('d', d => `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`)
      .attr('fill', 'none')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 2);

    // Partnership connection lines (horizontal between spouses)
    g.selectAll('.partnership-link')
      .data(partnershipLinks)
      .enter().append('path')
      .attr('class', 'partnership-link')
      .attr('d', d => {
        const midY = d.source.y;
        return `M${d.source.x},${midY} L${d.target.x},${midY}`;
      })
      .attr('fill', 'none')
      .attr('stroke', '#dc2626') // Red color for marriage lines
      .attr('stroke-width', 3);

    // Shared children connection lines
    g.selectAll('.shared-children-link')
      .data(sharedChildrenLinks)
      .enter().append('path')
      .attr('class', 'shared-children-link')
      .attr('d', d => `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`)
      .attr('fill', 'none')
      .attr('stroke', '#059669') // Green color for shared children lines
      .attr('stroke-width', 2);

    // Draw nodes
    const nodes = g.selectAll('.node')
      .data(allNodes)
      .enter().append('foreignObject')
      .attr('class', d => `node ${d.isPartner ? 'partner' : 'primary'}`)
      .attr('x', d => d.x - NODE_WIDTH/2)
      .attr('y', d => d.y)
      .attr('width', NODE_WIDTH)
      .attr('height', NODE_HEIGHT)
      .on('mouseover', (event, d) => {
        const firstName = d.firstName || '?';
        const lastName = d.lastName || '';
        const birthDate = d.dateOfBirth || 'Unknown';
        const deathDate = d.dateOfDeath || 'Present';
        
        setTooltip({
          visible: true,
          content: `${firstName} ${lastName}\n${birthDate} - ${deathDate}`,
          x: event.pageX,
          y: event.pageY
        });
      })
      .on('mouseout', () => setTooltip({ visible: false }))
      .on('click', (event, d) => onNodeClick?.(d));

    nodes.html(d => {
      // Format dates properly
      let birthYear = '';
      let deathYear = '';
      let dateDisplay = '';
      
      // Use either direct field or from attributes
      const birthDate = d.dateOfBirth || (d.attributes && d.attributes.birth_date);
      const deathDate = d.dateOfDeath || (d.attributes && d.attributes.death_date);
      
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
      const firstName = d.firstName || (d.name ? d.name.split(' ')[0] : '?');
      const lastName = d.lastName || (d.name && d.name.split(' ').length > 1 
        ? d.name.split(' ').slice(1).join(' ') 
        : '');
        
      // Generate initials for avatar placeholder
      const firstInitial = firstName ? firstName[0].toUpperCase() : '?';
      const lastInitial = lastName ? lastName[0].toUpperCase() : '';
      
      // Determine gender class - check both direct field and attributes
      const gender = d.gender || (d.attributes && d.attributes.gender) || 'other';
      const isCurrentUser = d.isCurrentUser || d.id === d.userId;
      
      // Get relationship info
      const relationship = d.relationshipToUser || 
        (d.attributes && d.attributes.relationship_to_user) || '';
      
      // Determine if this is a partner node
      const isPartnerNode = d.isPartner || false;
      
      console.log('Rendering node:', {
        name: d.name,
        firstName,
        lastName,
        birthDate,
        deathDate,
        gender,
        isCurrentUser,
        isPartner: isPartnerNode
      });
      
      return `
        <div class="flex flex-col items-center p-2 h-full w-full bg-white rounded-lg border-2 ${
          isCurrentUser ? 'border-2 border-purple-500 ' : 
          isPartnerNode ? 'border-red-200 ' : 
          gender === 'male' ? 'border-blue-200 ' : 'border-pink-200 '
        }shadow-md hover:shadow-lg transition-all cursor-pointer">
          <div class="w-16 h-16 rounded-full my-2 ${
            gender === 'male' ? 'bg-blue-100 ' : 'bg-pink-100 '
          }flex items-center justify-center overflow-hidden">
            ${
              d.profilePhoto 
                ? `<img src="${d.profilePhoto}" alt="${firstName || '?'}" class="w-full h-full object-cover" />`
                : `<span class="text-xl font-medium">${firstInitial}${lastInitial}</span>`
            }
          </div>
          <div class="text-center mt-1">
            <div class="font-medium text-sm">${firstName || '?'} ${lastName || ''}</div>
            <div class="text-xs text-gray-600">
              ${dateDisplay}
            </div>
            ${
              relationship && !isPartnerNode 
                ? `<div class="text-xs text-gray-500 mt-1">${relationship}</div>`
                : isPartnerNode 
                ? `<div class="text-xs text-red-500 mt-1">Partner</div>`
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
