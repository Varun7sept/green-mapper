import json
import matplotlib.pyplot as plt
import os

# Define the path to save the visualization
output_dir = os.path.join("static", "visuals")
os.makedirs(output_dir, exist_ok=True)

INPUT_FILE = "assets/footprints_output/property_category_metrics.json"

try:
    with open(INPUT_FILE, 'r') as file:
        data = json.load(file)
        print("Data read from JSON:", data)  # Add this to debug
except Exception as e:
    print("Error reading the JSON file:", e)

# Load metrics data (assuming it's saved as a JSON file)
def load_metrics(file_path):
    try:
        with open(file_path, "r") as file:
            metrics = json.load(file)
        return metrics
    except FileNotFoundError:
        print(f"Error: File {file_path} not found.")
        return None
    except json.JSONDecodeError:
        print(f"Error: Failed to parse JSON file {file_path}.")
        return None

# Generate the pie chart
def generate_pie_chart(metrics, output_path):
    labels = []
    sizes = []
    
    # Extract non-zero metric values for visualization
    for category, count in metrics.items():
        if isinstance(count, (int, float)) and count > 0:
            labels.append(category.capitalize())
            sizes.append(count)

    # Check if there are valid metrics to display
    if not labels:
        print("No valid data to display in the pie chart.")
        return

    # Plot the pie chart
    plt.figure(figsize=(8, 8))
    plt.pie(
        sizes,
        labels=labels,
        autopct="%1.1f%%",
        startangle=140
    )
    plt.title("Metrics Distribution")
    plt.axis("equal")  # Equal aspect ratio ensures the pie chart is circular
    plt.tight_layout()
    
    # Save the chart
    plt.savefig(output_path)
    print(f"Pie chart saved at {output_path}")

# Main execution
if __name__ == "__main__":
    metrics_file = os.path.join("assets", "footprints_output", "property_category_metrics.json")  # Path to metrics file
    output_file = os.path.join(output_dir, "pie.png")

    # Load metrics and generate the pie chart
    metrics_data = load_metrics(metrics_file)
    if metrics_data:
        generate_pie_chart(metrics_data, output_file)
