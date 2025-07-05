
# Dune: Awakening - Base Build Calculator

## Project Overview

This project is a client-side base building calculator for the game *Dune: Awakening*. It allows users to select various building components (placeables and structures), view a list of their chosen items, and see a dynamically updated, consolidated total of all required raw materials and the net power consumption/generation.

The tool is designed to be immediately useful with currently available community-sourced data and easily expandable as more information (e.g., precise costs for faction-specific pieces) becomes known.

## Features

*   **Dynamic Item Selection**: Users can browse a categorized list of building components.
    *   Categories include "Utilities" (placeables) and various "Structures" (building sets).
    *   Each item displays its name, material costs, and power impact (if applicable).
    *   An "Add" button allows users to add items to their current build.
*   **Current Build Management**:
    *   A central panel displays all items added by the user.
    *   Each item in the current build shows its individual cost details and power.
    *   A "Remove" button allows users to remove items from their build.
*   **Consolidated Material Totals**:
    *   A dedicated panel shows a "shopping list" of all raw materials required for the current build, with quantities summed up.
    *   Displays the net power of the current build, color-coded for positive (green) or negative (red) values.
*   **Handling of Estimated/Unavailable Data**:
    *   **Estimated Costs**: Costs for basic structural pieces (CHOAM, made of Granite Stone) are based on community estimates and are clearly marked as such (e.g., "Granite Stone: 8-10 (est.)"). The calculator uses the minimum cost (`cost_min`) from the range by default. Tooltips provide more detail.
    *   **Unavailable Costs**: Advanced faction-specific (Atreides/Harkonnen Plastone) building sets note their Solari unlock cost and that individual piece material costs are not yet available. These can be noted in the build but won't contribute to material totals until data is updated. Tooltips provide more detail.
*   **Client-Side & Future-Proof**:
    *   Runs entirely in the user's web browser (HTML, CSS, Vanilla JavaScript).
    *   Building data is loaded from an external `data.json` file, making it easy to update item costs, add new components, or fill in data gaps without modifying the core JavaScript code.
*   **Responsive Design**: The layout adapts to different screen sizes, with panels stacking vertically on smaller devices.

## How It Works

1.  **Data Loading**: On page load, `app.js` fetches building component data from `data.json`.
2.  **Item Selection Panel**: The `populateItemSelectionPanel()` function dynamically creates and displays categorized lists of building components from the loaded data. Each item shows its details and an "Add" button.
3.  **Adding Items**: Clicking an "Add" button triggers `handleAddItem()`.
    *   A copy of the item's data (including a unique ID for management and the chosen cost for ranged items) is added to an internal `currentBuild` array.
    *   The "Current Build" panel is updated via `updateCurrentBuildPanel()` to show the newly added item.
    *   Totals are recalculated and displayed.
4.  **Removing Items**: Clicking a "Remove" button in the "Current Build" panel triggers `handleRemoveItem(itemId)`.
    *   The item is removed from the `currentBuild` array using its unique ID.
    *   The "Current Build" panel is updated.
    *   Totals are recalculated and displayed.
5.  **Calculating Totals**: The `calculateAndDisplayTotals()` function iterates through the `currentBuild` array.
    *   It sums up all material quantities, grouping them by material name.
    *   It calculates the total net power.
    *   The `updateTotalsPanel()` function then clears and redraws the "Total Materials" and "Power Overview" sections with the new figures.

## File Structure

*   `index.html`: The main HTML file providing the three-panel page structure.
*   `style.css`: Contains all CSS rules for styling the application, including layout, typography, colors, and responsiveness.
*   `app.js`: The core JavaScript file containing all application logic (data loading, DOM manipulation, event handling, calculations).
*   `data.json`: An external JSON file storing all the data for building components, materials, costs, and categories. This file is designed to be easily updated.
*   `README.md`: This file.

## Usage

1.  Open `index.html` in a web browser (locally or from a web server).
2.  Browse available components in the left "Available Components" panel.
3.  Click the "Add" button for items you want to include in your base plan.
4.  View your selected items and their individual costs in the central "Current Build" panel.
5.  Observe the automatically updated "Total Materials Required" and "Power Overview" in the right panel.
6.  Remove items from your build using the "Remove" button next to each item in the "Current Build" panel.

## Deployment

This is a client-side application consisting of static files (`index.html`, `style.css`, `app.js`, `data.json`). It can be deployed using any static web server. Here are instructions for deploying with Nginx:

**Deploying with Nginx:**

1.  **Prerequisites**:
    *   An operational server with Nginx installed and configured.
    *   Access to the server to copy files and modify Nginx configuration.

2.  **Copy Project Files**:
    *   Transfer the project files (`index.html`, `style.css`, `app.js`, `data.json`, and any other assets) to your server. A common location is a subdirectory within Nginx's web root, for example, `/var/www/html/dune-calculator/` or a specific directory configured for your site `kitbox.pedantictheory.com`.

3.  **Nginx Configuration**:
    *   You'll need to configure an Nginx server block (often called a virtual host) for the site or update an existing one. The configuration tells Nginx where to find the files and how to serve them.
    *   Open your Nginx configuration file for the site (e.g., `/etc/nginx/sites-available/kitbox.pedantictheory.com` or a new file if it's a new subdomain).
    *   A basic configuration for serving these static files might look like this:

        ```nginx
        server {
            listen 80; # Or listen 443 ssl; if using HTTPS
            server_name kitbox.pedantictheory.com; # Or a specific subdomain like calculator.kitbox.pedantictheory.com

            # Path to your project's root directory on the server
            root /var/www/kitbox.pedantictheory.com/html/dune-calculator; # Adjust this path

            index index.html;

            location / {
                try_files $uri $uri/ /index.html =404; # Standard for static sites, ensures index.html is served
            }

            # If using HTTPS, include SSL certificate and key paths:
            # ssl_certificate /path/to/your/fullchain.pem;
            # ssl_certificate_key /path/to/your/privkey.pem;
            # include /etc/letsencrypt/options-ssl-nginx.conf; # Optional: Let's Encrypt options
            # ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # Optional: Let's Encrypt DH params
        }
        ```
    *   **Important**:
              location /calculator/ {
                alias /var/www/kitbox.pedantictheory.com/html/dune-calculator/; # Note the trailing slash on alias
                index index.html;
                try_files $uri $uri/ /calculator/index.html =404;
            }
            ```

4.  **Test Nginx Configuration**:
    *   After saving your changes, always test the Nginx configuration before reloading:
        ```bash
        sudo nginx -t
        ```
    *   If the test is successful, you'll see a message like `nginx: configuration file /etc/nginx/nginx.conf test is successful`.

5.  **Reload Nginx**:
    *   If the configuration test passes, reload Nginx to apply the changes:
        ```bash
        sudo systemctl reload nginx
        ```
        Or, on older systems:
        ```bash
        sudo service nginx reload
        ```

6.  **Verify**:
    *   Open your web browser and navigate to the configured domain or path (e.g., `http://kitbox.pedantictheory.com/dune-calculator/` or your specific URL).

**File Permissions**:
Ensure that the Nginx user (commonly `www-data` on Debian/Ubuntu systems) has read permissions for your project files and execute permissions for directories in the path.

## Future Enhancements / Updating Data

*   **Updating Data**: To update item costs, add new items, or provide data for faction pieces, simply edit the `data.json` file according to its existing structure. Re-upload the updated `data.json` to your server. No changes to HTML, CSS, or JS are needed for data updates.
*   **Cost Range Selection**: For items with `cost_min` and `cost_max`, implement a way for the user to select the specific cost they want to use.
*   **Multi-Level Crafting**: The `materials.plastone.crafting_recipe` in `data.json` is currently not used. Future versions could implement multi-level crafting.
*   **Saving/Loading Builds**: Allow users to save their current build configuration (e.g., using browser localStorage).
*   **Advanced Filtering/Sorting**: Add options to filter or sort the item selection list.

This tool aims to be a valuable asset for Dune: Awakening players planning their bases on Arrakis.
=======
# Dune Awakening - Desert Planner

## Project Overview

This web application serves as a "Desert Planner" for the game *Dune Awakening*. It allows users to select various craftable items, structures, and equipment they might want to take or build for expeditions into the deep desert of Arrakis. Based on these selections, the tool calculates and displays the total raw materials required and provides a summary of power generation and consumption.

The primary goal is to help players efficiently plan their resource gathering and crafting efforts before embarking on dangerous journeys or establishing outposts. The visual design and color scheme are inspired by the official Dune Awakening website to provide a thematic user experience.

## Features

*   **Dynamic Item Selection**: Users can browse a comprehensive list of in-game items (sourced from provided data and manual additions) and select desired quantities using checkboxes. The list is sorted alphabetically for ease of use.
*   **Material Calculation**: Automatically calculates the sum of all raw materials needed to craft the selected items. This includes materials like Steel Ingots, Silicon Blocks, Duraluminium, Spice Melange, etc.
*   **Power Management Summary**:
    *   Calculates total power generated by selected items (e.g., Wind Turbines, Spice Generators).
    *   Calculates total power consumed by selected items (e.g., Refineries, Fabricators).
    *   Displays the net power balance, helping players ensure they have sufficient power for their setup. The net power is color-coded for immediate visual feedback.
*   **Thematic UI**: Styled with a dark theme and color accents (sandy golds, oranges) reminiscent of the Dune universe and the official game website.
*   **Client-Side Operation**: Runs entirely in the user's web browser using HTML, CSS, and JavaScript. No server-side backend is required for its core functionality.
*   **Data Source**: Item data, including material costs and power attributes, is primarily sourced from a CSV-like string embedded within the JavaScript. This data is supplemented by manually added items as per the initial requirements. Duplicate items in the source data (like "Pentashield Surface Vertical") are handled by only including one instance.

## File Structure

The project consists of the following core files:

*   `index.html`: The main HTML file that provides the structural backbone for the web application. It defines the layout, including sections for item selection, material summary, and power overview.
*   `style.css`: The Cascading Style Sheet (CSS) file responsible for all visual aspects of the application. This includes layout, colors, fonts, and spacing, aiming to evoke the aesthetic of Dune Awakening.
*   `script.js`: The JavaScript file that contains all the application's interactive logic:
    *   Parsing the embedded CSV item data and merging it with manually defined items.
    *   Dynamically populating the item selection list in the HTML.
    *   Handling user interactions, specifically checkbox selections.
    *   Performing real-time calculations for total materials and power statistics.
    *   Updating the summary display dynamically as users make selections.
*   `README.md`: This file, providing a comprehensive description of the project, its features, how it works, and deployment instructions.

## How It Works

The application operates based on a straightforward client-side workflow:

1.  **Page Initialization (`DOMContentLoaded`)**:
    *   Once the HTML document is fully loaded and parsed, the `script.js` begins execution.
    *   **Data Preparation**: An array of item data is constructed. This involves:
            {
              name: "Item Name",
              materials: { "Material1": quantity, "Material2": quantity, ... },
              powerGenerated: value,
              powerCost: value
            }
            ```

2.  **Populating the Item List (`populateItems()` function)**:
    *   This function iterates through the `allItems` array.
    *   For each item, it dynamically creates the necessary HTML elements:
    *   An event listener is attached to each checkbox. This listener triggers the `calculateTotals()` function whenever the checkbox's state (checked/unchecked) changes.
    *   These dynamically created elements are appended to the `#item-list` div in `index.html`.

3.  **User Interaction and Calculation (`calculateTotals()` function)**:
    *   This function is called whenever an item checkbox is toggled.
    *   It first identifies all currently selected (checked) items by querying the DOM for checked checkboxes within the `#item-list`.
    *   It initializes variables to store `totalMaterials` (as an object), `totalPowerGenerated`, and `totalPowerConsumed`.
    *   It then iterates through each selected item:

4.  **Displaying the Summarized Results (`displayTotals()` function)**:
    *   This function receives the calculated `totalMaterials`, `totalPowerGenerated`, and `totalPowerConsumed` as arguments.
    *   **Materials Update**: It clears any previous entries in the `#materials-list` unordered list. Then, it iterates through the `totalMaterials` object. For each material with a quantity greater than zero, it creates an `<li>` element displaying the material name and its total quantity, and appends it to the list. If no materials are required, a placeholder message is shown.
    *   **Power Update**: It updates the text content of the appropriate `<span>` elements within the `#power-summary` section to display the new totals for power generated, power consumed, and the net power (calculated as `totalPowerGenerated - totalPowerConsumed`).
    *   The color of the net power display is dynamically changed: green if the net power is zero or positive, and red if it's negative.

5.  **Initial State**:
    *   Upon initial page load, `populateItems()` is called to display all available items, and `calculateTotals()` is called to ensure the summary sections display initial zero/empty states correctly.

## Deployment Guide

This web application is a client-side project, meaning it consists only of static files (HTML, CSS, JavaScript) and does not require a complex backend or database. It can be deployed easily using various methods:

**1. Simple Local File Access (for personal use/testing):**

*   **How**: Simply open the `index.html` file directly in your web browser.
*   **Steps**:
    1.  Ensure all three files (`index.html`, `style.css`, `script.js`) are in the same directory.
    2.  Navigate to this directory in your file explorer.
    3.  Double-click `index.html`, or right-click and choose "Open with" your preferred web browser.
*   **Limitations**: This method is fine for local use but not for sharing with others over the internet. Some browser features or security policies might behave differently with `file:///` URLs compared to `http://` or `https://`.

**2. Using a Simple HTTP Server (for local development/testing):**

*   **How**: Use a lightweight local HTTP server to serve the files. This better simulates a real web server environment.
*   **Python's Built-in Server (Python 3)**:
    1.  Open your terminal or command prompt.
    2.  Navigate to the directory containing the project files: `cd path/to/your/project_directory`
    3.  Run the command: `python -m http.server`
    4.  Open your web browser and go to `http://localhost:8000` (or the port number shown in the terminal).
*   **Node.js `http-server` package**:
    1.  Ensure you have Node.js and npm installed.
    2.  Install `http-server` globally (if you haven't already): `npm install -g http-server`
    3.  Open your terminal or command prompt.
    4.  Navigate to the project directory: `cd path/to/your/project_directory`
    5.  Run the command: `http-server`
    6.  Open your browser and go to `http://localhost:8080` (or the address shown in the terminal).
*   **VS Code Live Server Extension**:
    1.  If you are using Visual Studio Code, install the "Live Server" extension from the Marketplace.
    2.  Open the project folder in VS Code.
    3.  Right-click on `index.html` in the explorer panel and select "Open with Live Server." This will automatically open the page in your browser and reload it on changes.

**3. Deploying to a Static Web Host (for sharing online):**

Numerous platforms offer free or paid hosting for static websites. These services are ideal for deploying this type of application.

*   **GitHub Pages**:
    1.  Ensure your project is a GitHub repository. If not, create one and push your files (`index.html`, `style.css`, `script.js`).
    2.  Go to your repository's page on GitHub.
    3.  Click on the "Settings" tab.
    4.  In the left sidebar, navigate to "Pages."
    5.  Under "Build and deployment," choose your source (typically "Deploy from a branch").
    6.  Select the branch you want to deploy (e.g., `main` or `master`). For the folder, usually select `/ (root)`.
    7.  Click "Save." GitHub Actions will build and deploy your site.
    8.  After a few minutes, your site will be available at a URL like `https://your-username.github.io/your-repository-name/`.
*   **Netlify**:
    1.  Sign up for a free Netlify account.
    2.  **Option A (Drag and Drop)**: Simply drag the folder containing your project files (`index.html`, `style.css`, `script.js`) onto the "Sites" page in your Netlify dashboard.
    3.  **Option B (Git Integration - Recommended)**:
*   **Vercel**:
    1.  Sign up for a Vercel account.
    2.  Click "Add New..." -> "Project."
    3.  Import your Git repository.
    4.  Vercel will typically auto-detect it as a static site. No special build settings are required.
    5.  Click "Deploy." Vercel will deploy your site and provide a URL.
*   **Cloudflare Pages**:
    1.  Sign up for a Cloudflare account.
    2.  Go to "Workers & Pages" -> "Create application" -> "Pages" -> "Connect to Git."
    3.  Select your repository and begin setup.
    4.  For "Build settings," choose "None" or leave build command empty, and set the output directory to the root if your files are there.
    5.  Deploy the site.
*   **Amazon S3 (with CloudFront - More Advanced)**:
    1.  Create an S3 bucket in AWS.
    2.  Upload your `index.html`, `style.css`, and `script.js` files.
    3.  Configure the S3 bucket for static website hosting (set `index.html` as the index document).
    4.  Optionally (but recommended for production), create an AWS CloudFront distribution that points to your S3 bucket. This provides HTTPS, caching, and global content delivery.
*   **Firebase Hosting**:
    1.  Create a Firebase project at the [Firebase Console](https://console.firebase.google.com/).
    2.  Install the Firebase CLI: `npm install -g firebase-tools`
    3.  Log in to Firebase: `firebase login`
    4.  In your project's root directory (where `index.html` is), run: `firebase init hosting`
    5.  Deploy your site: `firebase deploy`
    6.  Firebase will provide hosting URLs.

**General Tips for Static Hosting:**

*   **Root Directory**: Most platforms expect `index.html` to be at the root of what you deploy.
*   **No Build Step**: Since this project is plain HTML, CSS, and JS, no "build command" is necessary in the hosting platform's settings. The "publish directory" or "output directory" will just be the root of your project files.
*   **Custom Domains**: All these platforms support configuring a custom domain for your deployed site.

## Potential Future Enhancements

This planner serves as a functional base. Here are some ideas for future improvements:

*   **Item Quantities**: Allow users to input a specific number for each item they want to craft (e.g., 5 Windtraps), rather than just a binary selection.
*   **"Per Block" Calculator**: Implement the "Create block calculator" functionality for items like "Pentashield Surface Vertical," where costs might scale based on user input for the number of blocks or segments.
*   **External Data Source**: Load item data from an external JSON or CSV file fetched at runtime, making it easier to update game data without modifying the `script.js` directly.
*   **Filtering and Searching**: Add controls to filter the item list by category (e.g., power, structures, crafting stations) or search by item name, especially if the list grows extensive.
*   **Save/Load Loadouts**: Implement functionality for users to save their current selection of items (e.g., using browser `localStorage`) and load it back in a future session.
*   **Advanced Styling & UI/UX**:
    *   Further refine CSS to more closely match specific UI elements, icons, or textures from the Dune Awakening game as more visual references become available.
    *   Improve layout for smaller screens (responsive design).
*   **Framework Integration**: For more complex features or better state management, consider migrating the application to a modern JavaScript framework/library like React, Vue, Svelte, or Angular.
*   **Sharing Loadouts**: Allow users to generate a shareable link that pre-selects items based on the link's parameters.

This Dune Awakening Desert Planner provides a solid foundation for players to strategize their resource management and construction efforts on the harsh desert planet of Arrakis.
Remember, "The Spice Must Flow!" and careful planning is key to survival and dominance.
