document.addEventListener('DOMContentLoaded', () => {
    const rawCsvData = `Item,Salvaged Metal,Copper Ingot,Iron Ingot,Steel Ingot,Aluminum Ingot,Duraluminium,Plastinium,Spice Melange,Cobalt Paste,Calibrated Servok,Silicon Block,Complex Machinery,Advanced Machinery,Power Generated,Power Cost,,
WInd Turbine OmniDirectional,,,,45,,,,,65,20,,,,150,,,
Fuel-Powered Plant,45,,,,,,,,,,,,,75,,,
WInd Turbine Directional,,,,,,120,,3,160,50,,,,350,,,
Spice Powered Generator,,,,,,,430,270,300,,180,100,40,1000,,,
Repair Station,,,40,,,,,,,,,,,,20,,
Recycler,,30,,,,,,,,,,,,,15,,
Windtrap,,,,90,,,,,,20,30,,,,75,,
Large Windtrap,,,,,,240,,5,,70,250,,,,135,,
Pentashield Surface Vertical,,,,2,,,,,20,6,,,,,3,,,per block,Create block calculator
Fabricator,75,,,,,,,,,,,,,,10,,
Survival Fabricator,,,,40,,,,,,,,30,,,35,,
Medium Ore Refinery,,,,125,,,,,60,,,50,,,45,,
Large Ore Refinery,,,,,,,,,,,,,,,350,,
Medium Chemical Refinery,,,,,,,150,35,,,90,50,,,350,,
Spice Refinery,,,,,,160,,,80,,130,70,,,200,,
Medium Spice Refinery,,,,,,,285,135,190,,225,100,,,350,,
Large Spice Refinery,,,,,,,950,1000,1110,,,350,55,,500,,
Advanced Fremen Death Stills,,,,,,240,,,,,170,70,,,350,,
Storage Container,,,,,45,,,,,,8,,,,,,,
`; // Note: Removed duplicate Pentashield, ensured trailing commas for consistent parsing

    const manualItems = [
        {
            name: "Medium Water Cistern",
            materials: { "Steel Ingot": 60, "Silicon Block": 30 },
            powerGenerated: 0,
            powerCost: 0
        },
        {
            name: "Large Water Cistern",
            materials: { "Duraluminium": 150, "Silicon Block": 160, "Industrial Pump": 25 },
            powerGenerated: 0,
            powerCost: 0
        }
    ];

    let allItems = [];

    function parseCSVData(csvString) {
        const lines = csvString.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const items = [];

        const nameHeader = "Item";
        const powerGenHeader = "Power Generated";
        const powerCostHeader = "Power Cost";

        // Identify material headers dynamically, excluding known non-material columns
        const nonMaterialHeaders = [nameHeader, powerGenHeader, powerCostHeader, "", undefined];

        const materialHeaders = headers.filter(h => !nonMaterialHeaders.includes(h) && h.length > 0);

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            const itemData = {};
            const materials = {};
            let itemName = "";
            let powerGenerated = 0;
            let powerCost = 0;

            headers.forEach((header, index) => {
                const value = values[index] ? values[index].trim() : "";
                if (header === nameHeader) {
                    itemName = value;
                } else if (materialHeaders.includes(header)) {
                    const quantity = parseInt(value, 10);
                    if (!isNaN(quantity) && quantity > 0) {
                        materials[header] = quantity;
                    }
                } else if (header === powerGenHeader) {
                    powerGenerated = parseInt(value, 10) || 0;
                } else if (header === powerCostHeader) {
                    powerCost = parseInt(value, 10) || 0;
                }
            });

            // Ensure item name is present before adding
            if (itemName) {
                 // Prevent duplicates by name (e.g. Pentashield)
                if (!items.find(existingItem => existingItem.name === itemName)) {
                    items.push({
                        name: itemName,
                        materials: materials,
                        powerGenerated: powerGenerated,
                        powerCost: powerCost
                    });
                }
            }
        }
        return items;
    }

    function populateItems() {
        const itemListDiv = document.getElementById('item-list');
        if (!itemListDiv) return;
        itemListDiv.innerHTML = ''; // Clear existing items

        allItems.forEach((item, index) => {
            const itemEntryDiv = document.createElement('div');
            itemEntryDiv.classList.add('item-entry');

            const label = document.createElement('label');
            label.htmlFor = `item-qty-${index}`;
            label.textContent = item.name;

            const numberInput = document.createElement('input');
            numberInput.type = 'number';
            numberInput.id = `item-qty-${index}`;
            numberInput.value = 0; // Default to 0, meaning not selected
            numberInput.min = 0;
            numberInput.max = 10;
            numberInput.dataset.itemName = item.name; // Store item name for easy retrieval
            numberInput.addEventListener('input', calculateTotals); // 'input' for more responsive updates

            itemEntryDiv.appendChild(label); // Label first for better layout with number input
            itemEntryDiv.appendChild(numberInput);
            itemListDiv.appendChild(itemEntryDiv);
        });
    }

    function calculateTotals() {
        const totalMaterials = {};
        let totalPowerGenerated = 0;
        let totalPowerConsumed = 0;

        document.querySelectorAll('#item-list input[type="number"]').forEach(numberInput => {
            const quantity = parseInt(numberInput.value, 10);
            const itemName = numberInput.dataset.itemName;

            if (quantity > 0 && itemName) {
                const item = allItems.find(i => i.name === itemName);
                if (item) {
                    for (const material in item.materials) {
                        totalMaterials[material] = (totalMaterials[material] || 0) + (item.materials[material] * quantity);
                    }
                    totalPowerGenerated += (item.powerGenerated || 0) * quantity;
                    totalPowerConsumed += (item.powerCost || 0) * quantity;
                }
            }
        });

        displayTotals(totalMaterials, totalPowerGenerated, totalPowerConsumed);

        // Calculate discounted totals
        const discountedTotalMaterials = {};
        for (const material in totalMaterials) {
            discountedTotalMaterials[material] = Math.ceil(totalMaterials[material] / 2);
        }
        displayDiscountedTotals(discountedTotalMaterials);
    }

    function displayTotals(materials, powerGenerated, powerConsumed) {
        const materialsListUl = document.getElementById('materials-list-original'); // Changed ID
        if (materialsListUl) {
            materialsListUl.innerHTML = ''; // Clear previous list
            if (Object.keys(materials).length === 0) {
                materialsListUl.innerHTML = '<li>No materials required for selected items.</li>';
            } else {
                for (const material in materials) {
                    const li = document.createElement('li');
                    li.textContent = `${material}: ${materials[material]}`;
                    materialsListUl.appendChild(li);
                }
            }
        }

        const totalPowerGeneratedSpan = document.getElementById('total-power-generated');
        const totalPowerConsumedSpan = document.getElementById('total-power-consumed');
        const netPowerSpan = document.getElementById('net-power');

        if (totalPowerGeneratedSpan) totalPowerGeneratedSpan.textContent = powerGenerated;
        if (totalPowerConsumedSpan) totalPowerConsumedSpan.textContent = powerConsumed;
        if (netPowerSpan) {
            const net = powerGenerated - powerConsumed;
            netPowerSpan.textContent = net;
            if (net >= 0) {
                netPowerSpan.style.color = '#77dd77'; // Green for positive or zero net
            } else {
                netPowerSpan.style.color = '#ff6961'; // Red for negative net
            }
        }
    }

    function displayDiscountedTotals(discountedMaterials) {
        const materialsListDiscountedUl = document.getElementById('materials-list-discounted');
        if (materialsListDiscountedUl) {
            materialsListDiscountedUl.innerHTML = ''; // Clear previous list
            if (Object.keys(discountedMaterials).length === 0) {
                materialsListDiscountedUl.innerHTML = '<li>No materials to discount.</li>';
            } else {
                for (const material in discountedMaterials) {
                    const li = document.createElement('li');
                    li.textContent = `${material}: ${discountedMaterials[material]}`;
                    materialsListDiscountedUl.appendChild(li);
                }
            }
        }
    }

    // Initialization
    const parsedCsvItems = parseCSVData(rawCsvData);
    allItems = [...parsedCsvItems, ...manualItems];

    // Sort items alphabetically for better UX
    allItems.sort((a, b) => a.name.localeCompare(b.name));

    populateItems();
    calculateTotals(); // Initial calculation (should be all zeros)
});
