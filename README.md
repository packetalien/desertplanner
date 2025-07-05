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
        *   Adjust `server_name` to match the domain/subdomain you are using.
        *   Adjust the `root` directive to the exact path where you placed the `index.html` and other project files on your server.
        *   If you're integrating into an existing site under a sub-path (e.g., `kitbox.pedantictheory.com/calculator/`), you might use a `location` block within your existing server configuration:
            ```nginx
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
