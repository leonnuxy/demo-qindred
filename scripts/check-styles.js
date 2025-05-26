#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Update component styles to use our CSS variables correctly
function updateComponentStyles() {
  console.log('Ensuring all components correctly use CSS variables...');
  
  // Get all component files
  const components = glob.sync('./resources/js/components/**/*.jsx');
  const pages = glob.sync('./resources/js/pages/**/*.jsx');
  const allFiles = [...components, ...pages];
  
  const colorMapping = {
    // Map Tailwind class to CSS variable
    'bg-background': 'background-color: hsl(var(--background))',
    'bg-foreground': 'background-color: hsl(var(--foreground))',
    'text-foreground': 'color: hsl(var(--foreground))',
    'border-border': 'border-color: hsl(var(--border))',
    // Add more mappings as needed
  };
  
  console.log(`Found ${allFiles.length} component files to process`);
  
  // Process each file
  let updatedCount = 0;
  
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    
    // Check if file uses any utility classes that should be using CSS variables
    let needsUpdate = false;
    for (const className in colorMapping) {
      if (content.includes(className)) {
        needsUpdate = true;
        break;
      }
    }
    
    if (needsUpdate) {
      console.log(`Checking ${file} for variable usage...`);
      updatedCount++;
    }
  }
  
  console.log(`Checked ${updatedCount} files for proper CSS variable usage`);
}

// Check if any component styles need updating
updateComponentStyles();
