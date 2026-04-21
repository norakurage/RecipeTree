import dagre from 'dagre';
import yaml from 'js-yaml';

export const parseYamlToGraph = (yamlString) => {
  try {
    const data = yaml.load(yamlString);
    if (!data || !data.recipes) {
      throw new Error("Invalid format: 'recipes' key not found.");
    }

    const { recipes } = data;
    const initialNodes = [];
    const initialEdges = [];
    const recipeMap = new Map();
    recipes.forEach(r => recipeMap.set(r.name, r));

    // Map to keep track of added nodes to prevent duplicates
    const addedNodes = new Set();
    
    // We are reading a recipe structure.
    // Each recipe has a "name" (the crafted item), "crafting" (the station), and "recipe" (list of ingredients).
    
    // We want the arrows to point from Requirement -> Result (so, from ingredients to the crafted item)
    // We will create nodes for all items.

    recipes.forEach(r => {
      const resultName = r.name;
      
      if (!addedNodes.has(resultName)) {
        initialNodes.push({
          id: resultName,
          position: { x: 0, y: 0 },
          data: { label: resultName, isResult: true, crafting: r.crafting },
          type: 'customNode', // We will define a custom node type later
        });
        addedNodes.add(resultName);
      } else {
        // If it was already added as an ingredient, let's update it to show it's a result too
        const node = initialNodes.find(n => n.id === resultName);
        if (node) {
          node.data.isResult = true;
          node.data.crafting = r.crafting;
        }
      }

      // Ingredients
      if (r.recipe) {
        r.recipe.forEach(ingredient => {
          const reqName = ingredient.item;
          
          if (!addedNodes.has(reqName)) {
            initialNodes.push({
              id: reqName,
              position: { x: 0, y: 0 },
              data: { label: reqName, isResult: false },
              type: 'customNode',
            });
            addedNodes.add(reqName);
          }

          // Create edge
          initialEdges.push({
            id: `e-${reqName}-${resultName}`,
            source: reqName,
            target: resultName,
            label: `${ingredient.required}個`,
            animated: true,
          });
        });
      }
    });

    return { initialNodes, initialEdges, recipeMap };
  } catch (err) {
    console.error("Error parsing YAML:", err);
    throw err;
  }
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
    if (!recipeObj || !recipeObj.recipe) {
      totals[name] = (totals[name] || 0) + qty;
      return;
    }
    
    // Otherwise calculate ingredients
    recipeObj.recipe.forEach(ingredient => {
      calc(ingredient.item, ingredient.required * qty);
    });
  };
  
  calc(itemName, amount);
  return totals;
};
