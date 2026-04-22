import dagre from 'dagre';

export const parseDataToStore = (data) => {
  try {
    const recipes = typeof data === 'string' ? JSON.parse(data) : data;
    if (!Array.isArray(recipes)) {
      throw new Error("Invalid format: Expected an array of recipes.");
    }

    const recipeMap = new Map();
    const availableItems = new Set();
    
    recipes.forEach(r => {
      recipeMap.set(r.name, r);
      availableItems.add(r.name);
      
      if (r.inputs) {
        r.inputs.forEach(ingredient => {
          availableItems.add(ingredient.item);
        });
      }
    });

    return { 
      recipeMap, 
      availableItems: Array.from(availableItems).sort() 
    };
  } catch (err) {
    console.error("Error parsing JSON:", err);
    throw err;
  }
};

export const buildSubGraph = (rootItemName, recipeMap) => {
  const initialNodes = [];
  const initialEdges = [];
  const addedNodes = new Set();
  
  // Use a queue to trace dependencies (BFS)
  const queue = [rootItemName];
  
  while (queue.length > 0) {
    const currentItem = queue.shift();
    
    // Don't process duplicates
    if (addedNodes.has(currentItem)) {
      continue;
    }
    
    addedNodes.add(currentItem);
    
    const recipe = recipeMap.get(currentItem);
    const craftingLabel = recipe && Array.isArray(recipe.craft_station) 
        ? recipe.craft_station.join(', ') 
        : (recipe?.craft_station || '');
    
    // Determine if it tells us how to craft it
    const isResult = !!recipe;

    initialNodes.push({
      id: currentItem,
      position: { x: 0, y: 0 },
      data: { label: currentItem, isResult, crafting: craftingLabel },
      type: 'customNode',
    });
    
    if (recipe && recipe.inputs) {
      recipe.inputs.forEach(ingredient => {
        const reqName = ingredient.item;
        
        // Add to queue for exploration
        queue.push(reqName);
        
        // Create edge from ingredient -> currentItem
        initialEdges.push({
          id: `e-${reqName}-${currentItem}`,
          source: reqName,
          target: currentItem,
          label: `${ingredient.count}個`,
          animated: true,
        });
      });
    }
  }

  return { initialNodes, initialEdges };
};

export const getLayoutedElements = (nodes, edges, direction = 'BT') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Increase spacing for better aesthetics
  const nodeWidth = 220;
  const nodeHeight = 80;

  dagreGraph.setGraph({ 
    rankdir: direction,
    nodesep: 80, // Horizontal separation
    ranksep: 120  // Vertical separation (rank)
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches React Flow node anchor point (top left)
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

export const calculateTotalMaterials = (itemName, recipeMap, amount = 1, completedItems = new Set()) => {
  if (!recipeMap) return {};
  
  const totals = {};
  
  const calc = (name, qty) => {
    if (completedItems.has(name)) {
      return;
    }

    const recipeObj = recipeMap.get(name);
    // If there is no recipe list, it's a base material
    if (!recipeObj || !recipeObj.inputs) {
      totals[name] = (totals[name] || 0) + qty;
      return;
    }
    
    // Otherwise calculate ingredients
    recipeObj.inputs.forEach(ingredient => {
      calc(ingredient.item, ingredient.count * qty);
    });
  };
  
  calc(itemName, amount);
  return totals;
};
