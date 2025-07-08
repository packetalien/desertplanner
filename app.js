// Dune: Awakening Base Build Calculator
// Main JavaScript file

let buildingData = null; // To store the loaded JSON data
let currentBuild = []; // Array to store items added by the user
let nextItemId = 0; // Simple ID generator for items in currentBuild

// DOM Elements (cache them for performance)
let componentListDiv, selectedItemsListDiv, materialsSummaryListDiv, materialsSummaryDiscountedListDiv, netPowerSpan;
// buildingData will be an array directly now
// let buildingData = null; // To store the loaded JSON data - Now directly an array

document.addEventListener('DOMContentLoaded', () => {
    console.log("Calculator Initializing...");

    // Cache DOM elements
    componentListDiv = document.getElementById('component-list');
    selectedItemsListDiv = document.getElementById('selected-items-list');
    materialsSummaryListDiv = document.getElementById('materials-summary-list');
    materialsSummaryDiscountedListDiv = document.getElementById('materials-summary-discounted-list'); // Added
    netPowerSpan = document.getElementById('net-power');

    if (!componentListDiv || !selectedItemsListDiv || !materialsSummaryListDiv || !materialsSummaryDiscountedListDiv || !netPowerSpan) {
        console.error("Critical DOM elements not found! Check your HTML IDs.");
        return;
    }

    loadBuildingData();
    // Initial render of empty states
    updateCurrentBuildPanel();
    updateTotalsPanel({}, {}, 0); // Pass empty objects and 0 power initially
});

async function loadBuildingData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        buildingData = await response.json(); // This will now be an array of items
        console.log("Building data loaded successfully (now an array):", buildingData);
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
    const createItemElement = (item) => { // Removed categoryName and itemType as direct params, derive from item
        const itemDiv = document.createElement('div');
        itemDiv.className = 'component-item';
        if (item.tier) {
            itemDiv.classList.add(`tier-${item.tier.toLowerCase().replace(/\s+/g, '-')}`);
        }

        const nameEl = document.createElement('p');
        nameEl.className = 'item-name';
        nameEl.textContent = item.name;
        if (item.tier) {
            nameEl.textContent += ` (T${item.tier.match(/\d+/)?.[0] || item.tier})`; // Append Tier e.g. (T1)
        }
        itemDiv.appendChild(nameEl);

        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'item-details-container';

        // Crafting Materials
        if (item.crafting_materials && item.crafting_materials.length > 0) {
            const costEl = document.createElement('p');
            costEl.className = 'item-crafting-materials';
            costEl.innerHTML = `<strong>Cost:</strong> ${item.crafting_materials.map(c => `${c.item_id.replace(/_/g, ' ')}: ${c.quantity}`).join(', ')}`;
            detailsContainer.appendChild(costEl);
        } else {
            const costEl = document.createElement('p');
            costEl.className = 'item-crafting-materials';
            costEl.innerHTML = `<strong>Cost:</strong> N/A`;
            detailsContainer.appendChild(costEl);
        }

        // Power Consumption
        if (item.power_consumption_w !== null && item.power_consumption_w !== undefined) {
            const powerConsumptionEl = document.createElement('p');
            powerConsumptionEl.className = 'item-power-consumption';
            powerConsumptionEl.innerHTML = `<strong>Power Drain:</strong> ${item.power_consumption_w} W`;
            detailsContainer.appendChild(powerConsumptionEl);
        }

        // Output Production
        if (item.output_production && item.output_production.length > 0) {
            item.output_production.forEach(op => {
                const outputEl = document.createElement('p');
                outputEl.className = 'item-output';
                let outputText = `<strong>Output:</strong> ${op.item_id.replace(/_/g, ' ')}: ${op.quantity}`;
                if (op.rate_per_hour) {
                    outputText += ` ${op.rate_per_hour}`;
                }
                outputEl.innerHTML = outputText;
                detailsContainer.appendChild(outputEl);
            });
        }

        // Fuel Type
        if (item.fuel_type) {
            const fuelEl = document.createElement('p');
            fuelEl.className = 'item-fuel';
            fuelEl.innerHTML = `<strong>Fuel:</strong> ${item.fuel_type}`;
            detailsContainer.appendChild(fuelEl);
        }

        // Crafting Station
        if (item.crafting_station) {
            const stationEl = document.createElement('p');
            stationEl.className = 'item-station';
            stationEl.innerHTML = `<strong>Crafted at:</strong> ${item.crafting_station}`;
            detailsContainer.appendChild(stationEl);
        }

        itemDiv.appendChild(detailsContainer);

        // Operational Notes (Tooltip or expandable)
        if (item.operational_notes) {
            itemDiv.title = item.operational_notes; // Simple tooltip for now for the whole item
            const notesEl = document.createElement('p');
            notesEl.className = 'item-operational-notes';
            notesEl.innerHTML = `<strong>Notes:</strong> ${item.operational_notes}`;
            detailsContainer.appendChild(notesEl); // Add to details container

            // Optional: Keep indicator next to name if desired, but ensure it doesn't duplicate info badly
            // const notesIndicator = document.createElement('span');
            // notesIndicator.className = 'notes-indicator';
            // notesIndicator.textContent = ' ℹ️'; // Info icon with space
            // notesIndicator.title = item.operational_notes;
            // nameEl.appendChild(notesIndicator);
        }

        const addButton = document.createElement('button');
        addButton.className = 'add-item-btn';
        addButton.textContent = 'Add';
        addButton.onclick = () => {
            const itemDataCopy = JSON.parse(JSON.stringify(item));
            handleAddItem(itemDataCopy); // Pass the whole item, handleAddItem will parse it
        };
        itemDiv.appendChild(addButton);

        return itemDiv;
    };

    // Group items by type for categorization
    const itemsByType = buildingData.reduce((acc, item) => {
        const type = item.type || "Unknown"; // Default to "Unknown" if type is missing
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push(item);
        return acc;
    }, {});

    // Sort categories by name (optional, but good for UX)
    const sortedCategories = Object.keys(itemsByType).sort();

    sortedCategories.forEach(type => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'component-category';
        const categoryTitle = document.createElement('h3');
        categoryTitle.textContent = type.replace(/_/g, ' '); // Display type as category title
        categoryDiv.appendChild(categoryTitle);

        itemsByType[type].sort((a,b) => a.name.localeCompare(b.name)).forEach(item => { // Sort items within category
            categoryDiv.appendChild(createItemElement(item));
        });
        componentListDiv.appendChild(categoryDiv);
    });
}


function handleAddItem(itemData) { // itemData is now the full new item structure
    console.log("Adding item to build:", itemData);

    // Calculate net power for this specific item
    let itemNetPower = 0;
    if (itemData.power_consumption_w !== null && itemData.power_consumption_w !== undefined) {
        itemNetPower -= itemData.power_consumption_w;
    }
    if (itemData.output_production) {
        itemData.output_production.forEach(op => {
            if (op.item_id === "power" && op.quantity) {
                itemNetPower += op.quantity;
            }
        });
    }

    const buildItem = {
        id: nextItemId++,
        name: itemData.name,
        tier: itemData.tier,
        item_type: itemData.type,
        crafting_materials: itemData.crafting_materials ? JSON.parse(JSON.stringify(itemData.crafting_materials)) : [],
        power_consumption_w: itemData.power_consumption_w, // Keep original for display if needed
        output_production: itemData.output_production ? JSON.parse(JSON.stringify(itemData.output_production)) : [], // Keep original
        fuel_type: itemData.fuel_type,
        operational_notes: itemData.operational_notes,
        net_power: itemNetPower // Store the calculated net power for this item
        // originalData: JSON.parse(JSON.stringify(itemData)) // Optional: for deep reference
    };

    currentBuild.push(buildItem);
    updateCurrentBuildPanel();
    calculateAndDisplayTotals();
}

function updateCurrentBuildPanel() {
    if (!selectedItemsListDiv) return;
    // console.log("Updating current build panel with new item structure...");
    selectedItemsListDiv.innerHTML = '';

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
    // console.log("Calculating and displaying totals with new structure...");
    const totalMaterials = {};
    let totalNetPower = 0;

    currentBuild.forEach(item => {
        // Aggregate crafting materials
        if (item.crafting_materials) {
            item.crafting_materials.forEach(material => {
                totalMaterials[material.item_id] = (totalMaterials[material.item_id] || 0) + material.quantity;
            });
        }

        // Aggregate net power
        if (item.net_power !== undefined) {
            totalNetPower += item.net_power;
        }
    });

    const discountedTotalMaterials = {};
    for (const material in totalMaterials) {
        discountedTotalMaterials[material] = Math.ceil(totalMaterials[material] / 2);
    }
    updateTotalsPanel(totalMaterials, discountedTotalMaterials, totalNetPower);
}

function updateTotalsPanel(calculatedMaterials, calculatedDiscountedMaterials, calculatedNetPower) {
    if (!materialsSummaryListDiv || !materialsSummaryDiscountedListDiv || !netPowerSpan) {
        console.error("One or more summary DOM elements not found in updateTotalsPanel.");
        return;
    }

    // Update Original Materials
    materialsSummaryListDiv.innerHTML = '';
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

    // Update Discounted Materials
    materialsSummaryDiscountedListDiv.innerHTML = '';
    if (Object.keys(calculatedDiscountedMaterials).length === 0) {
         materialsSummaryDiscountedListDiv.innerHTML = '<ul><li class="empty-totals-message">No materials to discount.</li></ul>';
    } else {
        const ulDiscounted = document.createElement('ul');
        for (const materialName in calculatedDiscountedMaterials) {
            const li = document.createElement('li');
            li.textContent = `${materialName}: ${calculatedDiscountedMaterials[materialName]}`;
            ulDiscounted.appendChild(li);
        }
        materialsSummaryDiscountedListDiv.appendChild(ulDiscounted);
    }

    netPowerSpan.textContent = calculatedNetPower;
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
