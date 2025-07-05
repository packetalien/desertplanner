// Dune: Awakening Base Build Calculator
// Main JavaScript file

let buildingData = null; // To store the loaded JSON data
let currentBuild = []; // Array to store items added by the user
let nextItemId = 0; // Simple ID generator for items in currentBuild

// DOM Elements (cache them for performance)
let componentListDiv, selectedItemsListDiv, materialsSummaryListDiv, netPowerSpan;

document.addEventListener('DOMContentLoaded', () => {
    console.log("Calculator Initializing...");

    // Cache DOM elements
    componentListDiv = document.getElementById('component-list');
    selectedItemsListDiv = document.getElementById('selected-items-list');
    materialsSummaryListDiv = document.getElementById('materials-summary-list');
    netPowerSpan = document.getElementById('net-power');

    if (!componentListDiv || !selectedItemsListDiv || !materialsSummaryListDiv || !netPowerSpan) {
        console.error("Critical DOM elements not found! Check your HTML IDs.");
        return;
    }

    loadBuildingData();
    // Initial render of empty states (will be refined)
    updateCurrentBuildPanel();
    updateTotalsPanel();
});

async function loadBuildingData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        buildingData = await response.json();
        console.log("Building data loaded successfully:", buildingData);
        populateItemSelectionPanel(); // Populate items once data is loaded
    } catch (error) {
        console.error("Could not load building data:", error);
        if (componentListDiv) {
            componentListDiv.innerHTML = '<p class="error-message">Error loading building components. Please try again later.</p>';
        }
    }
}

function populateItemSelectionPanel() {
    if (!buildingData || !componentListDiv) {
        console.error("Data or component list DIV not available for populating.");
        return;
    }
    console.log("Populating item selection panel...");
    componentListDiv.innerHTML = ''; // Clear previous items

    // Helper function to create item element
    const createItemElement = (item, categoryName, itemType) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'component-item';

        const nameEl = document.createElement('p');
        nameEl.className = 'item-name';
        nameEl.textContent = item.name;
        itemDiv.appendChild(nameEl);

        const costDetails = [];
        let chosenCostForAddition = null; // For items with a range, this will be cost_min

        if (itemType === 'placeable' && item.cost) {
            item.cost.forEach(c => costDetails.push(`${c.name}: ${c.quantity}`));
            if (item.power !== undefined) {
                 costDetails.push(`Power: ${item.power > 0 ? '+' : ''}${item.power}`);
            }
        } else if (itemType === 'building_set_item' && item.material) { // CHOAM
            costDetails.push(`${item.material}: ${item.cost_min} - ${item.cost_max}`);
            costDetails.push(`${item.material}: ${item.cost_min} - ${item.cost_max}`);
            // costDetails.push(`(Estimated)`); // This is now handled by CSS ::after
            chosenCostForAddition = item.cost_min; // Default to min_cost
            itemDiv.classList.add('cost-estimated-item');
            itemDiv.title = `Estimated Cost: ${item.material} ${item.cost_min}-${item.cost_max}. Defaulting to ${item.cost_min}.`;
        } else if (itemType === 'building_set_faction') { // Faction sets (category level) - these are category headers mostly
            let factionNote = "";
            if (categoryName.unlock_cost) factionNote += `Unlock: ${categoryName.unlock_cost}. `;
            if (categoryName.note) factionNote += `${categoryName.note}`;
            costDetails.push(factionNote.trim());
            itemDiv.classList.add('cost-unavailable-item');
            if(factionNote.trim()) itemDiv.title = factionNote.trim();
        }


        if (costDetails.length > 0) {
            const costEl = document.createElement('p');
            costEl.className = 'item-cost';
            costEl.innerHTML = costDetails.join('<br>');
            itemDiv.appendChild(costEl);
        }

        // Add button, unless it's a faction set with no items yet
        if (!(itemType === 'building_set_faction' && (!item.items || item.items.length === 0))) {
            const addButton = document.createElement('button');
            addButton.className = 'add-item-btn';
            addButton.textContent = 'Add';
            addButton.onclick = () => {
                // For building_set_item, we pass the specific item and its chosen cost
                // For placeable, chosenCostForAddition is null, handleAddItem can derive cost from item.cost
                // We need to pass a copy of the item to avoid modifications to original buildingData
                const itemDataCopy = JSON.parse(JSON.stringify(item));
                handleAddItem(itemDataCopy, itemType, chosenCostForAddition);
            };
            itemDiv.appendChild(addButton);
        }

        return itemDiv;
    };

    // Populate Placeables
    if (buildingData.placeables) {
        buildingData.placeables.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'component-category';
            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = category.category;
            categoryDiv.appendChild(categoryTitle);

            category.items.forEach(item => {
                categoryDiv.appendChild(createItemElement(item, category, 'placeable'));
            });
            componentListDiv.appendChild(categoryDiv);
        });
    }

    // Populate Building Sets
    if (buildingData.building_sets) {
        buildingData.building_sets.forEach(set => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'component-category';
            const categoryTitle = document.createElement('h3');
            categoryTitle.textContent = set.category;
            categoryDiv.appendChild(categoryTitle);

            if (set.items && set.items.length > 0) {
                set.items.forEach(item => {
                    categoryDiv.appendChild(createItemElement(item, set, 'building_set_item'));
                });
            } else {
                // Handle faction sets with no individual items listed yet (display note from category)
                 const itemDiv = document.createElement('div');
                itemDiv.className = 'component-item cost-unavailable-item'; // Apply styling for unavailable
                if(set.unlock_cost) {
                    const unlockEl = document.createElement('p');
                    unlockEl.className = 'item-note';
                    unlockEl.textContent = `Unlock Cost: ${set.unlock_cost}`;
                    itemDiv.appendChild(unlockEl);
                }
                if(set.note) {
                    const noteEl = document.createElement('p');
                    noteEl.className = 'item-note cost-unavailable';
                    noteEl.textContent = set.note;
                    itemDiv.appendChild(noteEl);
                }
                 // No "Add" button for these parent categories if no items
                categoryDiv.appendChild(itemDiv);
            }
            componentListDiv.appendChild(categoryDiv);
        });
    }
}

function handleAddItem(itemData, itemType, chosenCostOverride) {
    console.log("Adding item:", itemData, "Type:", itemType, "Chosen Cost Override:", chosenCostOverride);

    const buildItem = {
        id: nextItemId++,
        name: itemData.name,
        type: itemType,
        originalData: itemData, // Keep original for display details if needed
        costs: [],
        power: itemData.power // Store power directly if it exists
    };

    if (itemType === 'placeable' && itemData.cost) {
        buildItem.costs = JSON.parse(JSON.stringify(itemData.cost)); // Deep copy
    } else if (itemType === 'building_set_item' && itemData.material && chosenCostOverride !== null) {
        buildItem.costs = [{ name: itemData.material, quantity: chosenCostOverride }];
        // Store the chosen cost for display
        buildItem.displayCost = `${itemData.material}: ${chosenCostOverride} (Chosen from ${itemData.cost_min}-${itemData.cost_max} est.)`;
    } else if (itemType === 'building_set_faction') {
        // Faction items might not have direct costs but notes or unlock costs
        buildItem.note = itemData.note || (itemData.unlock_cost ? `Unlock: ${itemData.unlock_cost}` : "Details TBD");
    }
    // else: item might have no cost, e.g. a category header if mistakenly added

    currentBuild.push(buildItem);
    updateCurrentBuildPanel();
    calculateAndDisplayTotals();
}

function updateCurrentBuildPanel() {
    if (!selectedItemsListDiv) return;
    console.log("Updating current build panel...");
    selectedItemsListDiv.innerHTML = ''; // Clear previous items

    if (currentBuild.length === 0) {
        selectedItemsListDiv.innerHTML = '<p class="empty-build-message">Your build is currently empty. Add components from the left panel.</p>';
        return;
    }

    currentBuild.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'selected-item';
        itemDiv.dataset.buildId = item.id;

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'selected-item-details';

        const nameEl = document.createElement('p');
        nameEl.textContent = item.name;
        detailsDiv.appendChild(nameEl);

        const costEl = document.createElement('p');
        costEl.style.fontSize = '0.85em'; // Smaller font for cost details
        if (item.displayCost) { // For CHOAM items with chosen cost
            costEl.textContent = item.displayCost;
        } else if (item.costs && item.costs.length > 0) {
            costEl.textContent = item.costs.map(c => `${c.name}: ${c.quantity}`).join(', ');
        } else if (item.note) {
            costEl.textContent = item.note;
            costEl.classList.add('cost-unavailable');
        } else {
            costEl.textContent = "No direct material cost.";
            costEl.classList.add('cost-unavailable');
        }
        detailsDiv.appendChild(costEl);

        if (item.power !== undefined) {
            const powerEl = document.createElement('p');
            powerEl.style.fontSize = '0.85em';
            powerEl.textContent = `Power: ${item.power > 0 ? '+' : ''}${item.power}`;
            detailsDiv.appendChild(powerEl);
        }

        itemDiv.appendChild(detailsDiv);

        const removeButton = document.createElement('button');
        removeButton.className = 'remove-item-btn';
        removeButton.textContent = 'Remove';
        removeButton.onclick = () => handleRemoveItem(item.id);
        itemDiv.appendChild(removeButton);

        selectedItemsListDiv.appendChild(itemDiv);
    });
}

function calculateAndDisplayTotals() {
    console.log("Calculating and displaying totals...");
    const totalMaterials = {};
    let totalNetPower = 0;

    currentBuild.forEach(item => {
        if (item.costs) {
            item.costs.forEach(cost => {
                totalMaterials[cost.name] = (totalMaterials[cost.name] || 0) + cost.quantity;
            });
        }
        if (item.power !== undefined) {
            totalNetPower += item.power;
        }
    });

    updateTotalsPanel(totalMaterials, totalNetPower);
}

function updateTotalsPanel(calculatedMaterials, calculatedNetPower) {
    if (!materialsSummaryListDiv || !netPowerSpan) return;

    materialsSummaryListDiv.innerHTML = ''; // Clear previous materials

    if (Object.keys(calculatedMaterials).length === 0) {
        materialsSummaryListDiv.innerHTML = '<ul><li class="empty-totals-message">No materials required yet.</li></ul>';
    } else {
        const ul = document.createElement('ul');
        for (const materialName in calculatedMaterials) {
            const li = document.createElement('li');
            li.textContent = `${materialName}: ${calculatedMaterials[materialName]}`;
            ul.appendChild(li);
        }
        materialsSummaryListDiv.appendChild(ul);
    }

    netPowerSpan.textContent = calculatedNetPower;
    // Optional: Add color coding for net power if desired (e.g., red for negative)
    if (calculatedNetPower < 0) {
        netPowerSpan.style.color = 'red';
    } else if (calculatedNetPower > 0) {
        netPowerSpan.style.color = 'green';
    } else {
        netPowerSpan.style.color = ''; // Default color
    }
}


function handleRemoveItem(itemIdToRemove) {
    console.log("Removing item with ID:", itemIdToRemove);
    currentBuild = currentBuild.filter(item => item.id !== itemIdToRemove);
    updateCurrentBuildPanel();
    calculateAndDisplayTotals();
}
