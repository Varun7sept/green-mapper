/**
 * Calculates green space accessibility, updates the UI, and adds a progress bar visualization.
 * @param {number} totalGreenSpaceArea - Total area of green space in square meters.
 * @param {number} totalFootprintArea - Total footprint area in square meters.
 */
function calculateGreenSpaceAccessibility(totalGreenSpaceArea, totalFootprintArea) {
    try {
        if (totalFootprintArea === 0) {
            console.error("Total footprint area is zero. Cannot calculate accessibility index.");
            return;
        }

        const greenSpaceAccessibilityIndex = (totalGreenSpaceArea / totalFootprintArea) * 100;

        // Determine the label based on the green space accessibility index
        let accessibilityLabel = "";
        if (greenSpaceAccessibilityIndex > 20) {
            accessibilityLabel = "(Very Good)";
        } else if (greenSpaceAccessibilityIndex >= 15) {
            accessibilityLabel = "(Good)";
        } else if (greenSpaceAccessibilityIndex >= 10) {
            accessibilityLabel = "(Moderate)";
        } else {
            accessibilityLabel = "(Lacking)";
        }

        const greenSpaceContainer = document.getElementById("right-display-greenspace");
        if (greenSpaceContainer) {
            greenSpaceContainer.innerHTML = `
                <h1>${greenSpaceAccessibilityIndex.toFixed(0)}% ${accessibilityLabel}</h1>
                <div style="background-color: lightgrey; border: 1px solid #A9A9A9; border-radius: 5px; width: 100%; height: 30px; position: relative; margin-top: 10px;">
                    <div style="background-color: green; height: 100%; width: ${Math.min(greenSpaceAccessibilityIndex, 100)}%; border-radius: 5px;"></div>
                </div>
                <h3>Green Space Accessibility Index</h3>
                <h5 style="margin-bottom: 5px;">The UN recommends a 15-20% metric</h5>
                <p>Total Green Space Area: ${totalGreenSpaceArea.toFixed(2)} m²</p>
                <p>Total Footprint Area: ${totalFootprintArea.toFixed(2)} m²</p>
                <p>Green Space in Properties: ${greenSpaceAccessibilityIndex.toFixed(2)}%</p>
                <p> </p>
                <p> </p>
            `;
            console.log("Green Space Accessibility Index displayed with progress bar and label:", greenSpaceAccessibilityIndex, accessibilityLabel);
        } else {
            console.error("Green space display container not found.");
        }
    } catch (error) {
        console.error("Error calculating green space accessibility:", error);
    }
}

// Attach function to the global `window` object for testing in non-module environments.
window.calculateGreenSpaceAccessibility = calculateGreenSpaceAccessibility;
