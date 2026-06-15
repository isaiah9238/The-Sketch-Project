# To run this code you need to install the following dependencies:
# pip install google-genai

import os
from google import genai
from google.genai import types


def generate():
    client = genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY"),
    )

    model = "gemini-3-flash-preview"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""coordinate calculator that will do last pen to first pen. require AZimuth or bearing and Distance"""),
            ],
        ),
        types.Content(
            role="model",
            parts=[
                types.Part.from_text(text="""**Initiating Calculation Searches**

I'm currently focused on identifying appropriate calculation tools. I've started searching for coordinate calculators and resources that are specifically designed to address \"last pen to first pen\" or \"closing a traverse\" calculations. I'm using search terms like \"surveying traverse calculator,\" \"bearing and distance coordinate calculator,\" and \"closed traverse\" to narrow down the most relevant resources.


**Analyzing Traverse Closure**

I've been examining the initial search results, which offer several coordinate calculators. My focus is on tools that specifically handle \"last pen to first pen\" calculations. This is commonly known as \"closing a traverse\" or calculating \"traverse closure error\" within the surveying field, and I am finding some key tools!


"""),
                types.Part.from_text(text="""The term \"last pen to first pen\" refers to **Traverse Closure** in surveying. This is the process of calculating the coordinates for a series of connected points and then determining the \"misclosure\"—the difference between where your last point ended up and where it was supposed to be (the starting point).

Here are the best tools and methods to calculate this using Azimuth/Bearing and Distance.

### 1. Recommended Online Calculators
These tools are specifically built for surveying traverses and will automatically show you the distance and bearing \"back to start\" (the closing error).

*   **[Survey Traverse Calculator (Firgelli Automations)](https://www.firgelliauto.com/blogs/calculators/survey-traverse-calculator):** A highly interactive tool that allows you to input starting coordinates, followed by a series of bearings and distances. It automatically calculates the **Linear Closure Error** and the **Precision Ratio**.
*   **[Learn Surveying Traverse Calculator](https://learnsurveying.com/traverse-calculator/):** This tool allows you to add multiple \"legs.\" You enter the bearing and distance for each, and it provides a visual plot and a coordinate list. It also features an \"Adjust for Closure Error\" option to fix the traverse using the Bowditch rule.
*   **[Q-Cogo](https://q-cogo.com/):** A free, web-based coordinate geometry (COGO) tool used by professionals. It is excellent for entering \"last pen\" to \"first pen\" data to find exactly where a boundary fails to close.
*   **[Survey Calcs](https://www.surveycalcs.com/):** A simple, no-frills site that lets you enter bearing/distance lines (up to 7 for free) to see the closure results.

### 2. How to Do It Yourself (Excel/Manual)
If you prefer to build your own calculator in a spreadsheet, you use the **Latitude** (change in North/South) and **Departure** (change in East/West) formulas.

**Required Inputs:**
*   **Starting Point:** Northing ($N_1$), Easting ($E_1$)
*   **For each leg:** Distance ($L$) and Azimuth ($\\theta$)

**The Formulas:**
*   **Latitude ($\\Delta N$):** $L \\times \\cos(\\theta)$
*   **Departure ($\\Delta E$):** $L \\times \\sin(\\theta)$
*   **New Coordinates:** $N_{new} = N_{old} + \\Delta N$; $E_{new} = E_{old} + \\Delta E$

**To find the \"Last Pen to First Pen\" Error:**
1.  Sum all Latitudes and all Departures.
2.  If the traverse is a closed loop, both sums should ideally be **zero**.
3.  **Linear Error of Closure** = $\\sqrt{(\\sum \\text{Latitudes})^2 + (\\sum \\text{Departures})^2}$
4.  **Direction of Error** = $\\arctan\\left(\\frac{\\sum \\text{Departures}}{\\sum \\text{Latitudes}}\\right)$

### 3. Key Tips for Your Calculation
*   **Azimuth vs. Bearing:** Ensure your calculator is set to the right mode. An azimuth is $0$–$360^\\circ$ (clockwise from North), while a bearing uses quadrants (e.g., $N\\ 45^\\circ\\ E$).
*   **Degrees to Radians:** If using Excel, remember that the `SIN()` and `COS()` functions require angles in **radians**. Use `RADIANS(degrees)` inside the formula.
*   **The \"Compass Rule\" (Bowditch):** If your traverse doesn't close perfectly, professional calculators use this rule to distribute the error proportionally across all your \"pens\" based on their distance, forcing the last point to land exactly on the first."""),
            ],
        ),
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""INSERT_INPUT_HERE"""),
            ],
        ),
    ]
    tools = [
        types.Tool(googleSearch=types.GoogleSearch(
        )),
    ]
    generate_content_config = types.GenerateContentConfig(
        thinking_config=types.ThinkingConfig(
            thinking_level="HIGH",
        ),
        tools=tools,
    )

    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        if text := chunk.text:
            print(text, end="")

if __name__ == "__main__":
    generate()


