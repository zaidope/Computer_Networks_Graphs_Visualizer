let graph = [];
let numVertices = 0;
let canvas, ctx;
let nodePositions = [];
let nodeRadius = 30;
let draggingNode = null;
let sourceNode = null;
let isSelectingSource = false;
let shortestPaths = [];
let isCustomizingWeights = false; // Track weight customization mode

function generateGraph() {
    numVertices = parseInt(document.getElementById('vertices').value);
    if (numVertices < 2 || numVertices > 10) {
        alert('Please enter a number between 2 and 10 for the number of vertices.');
        return;
    }

    graph = [];
    nodePositions = [];
    draggingNode = null;
    sourceNode = null;
    isSelectingSource = false;
    shortestPaths = [];
    document.getElementById('result').innerHTML = "";

    const radius = 200;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const angleStep = (2 * Math.PI) / numVertices;

    for (let i = 0; i < numVertices; i++) {
        const angle = i * angleStep;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        nodePositions.push({ x, y });
    }

    for (let i = 0; i < numVertices; i++) {
        graph[i] = [];
        for (let j = 0; j < numVertices; j++) {
            graph[i][j] = 0;
        }
    }

    for (let i = 0; i < numVertices - 1; i++) {
        let j = i + 1;
        const distance = Math.floor(Math.random() * 10) + 1;
        graph[i][j] = distance;
        graph[j][i] = distance;
    }

    for (let i = 0; i < numVertices; i++) {
        for (let j = i + 2; j < numVertices; j++) {
            if (Math.random() > 0.7) {
                const distance = Math.floor(Math.random() * 10) + 1;
                graph[i][j] = distance;
                graph[j][i] = distance;
            }
        }
    }

    drawGraph();
}

function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < numVertices; i++) {
        for (let j = i + 1; j < numVertices; j++) {
            if (graph[i][j] !== 0) {
                drawEdge(i, j);
            }
        }
    }

    if (shortestPaths.length > 0) {
        for (let i = 0; i < numVertices; i++) {
            for (let j = 0; j < numVertices; j++) {
                if (shortestPaths[i][j] === true) {
                    drawEdge(i, j, true);
                }
            }
        }
    }

    for (let i = 0; i < numVertices; i++) {
        drawNode(i);
    }
}

function drawEdge(i, j, isHighlighted = false) {
    const startX = nodePositions[i].x;
    const startY = nodePositions[i].y;
    const endX = nodePositions[j].x;
    const endY = nodePositions[j].y;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);

    if (isHighlighted) {
        ctx.strokeStyle = '#FF5733';
        ctx.lineWidth = 4;
    } else {
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
    }
    ctx.stroke();

    const weight = graph[i][j];
    const midX = (startX + endX) / 2;
    const midY = (startY + endY) / 2;

    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.fillText(weight, midX, midY);
}

function drawNode(i) {
    const { x, y } = nodePositions[i];

    ctx.beginPath();
    ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
    ctx.fillStyle = sourceNode === i ? '#FF5733' : '#4CAF50';
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.font = '18px Arial';
    ctx.fillText(i, x - 7, y + 7);
}

canvas = document.getElementById('graphCanvas');
ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 600;

canvas.addEventListener('mousedown', (event) => {
    const { offsetX, offsetY } = event;

    for (let i = 0; i < numVertices; i++) {
        const { x, y } = nodePositions[i];
        const distance = Math.sqrt((offsetX - x) ** 2 + (offsetY - y) ** 2);

        if (distance <= nodeRadius) {
            draggingNode = i;
            break;
        }
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (draggingNode !== null) {
        const { offsetX, offsetY } = event;
        nodePositions[draggingNode].x = offsetX;
        nodePositions[draggingNode].y = offsetY;
        drawGraph();
    }
});

canvas.addEventListener('mouseup', () => {
    draggingNode = null;
});

canvas.addEventListener('click', (event) => {
    if (isSelectingSource) {
        const { offsetX, offsetY } = event;

        for (let i = 0; i < numVertices; i++) {
            const { x, y } = nodePositions[i];
            const distance = Math.sqrt((offsetX - x) ** 2 + (offsetY - y) ** 2);

            if (distance <= nodeRadius) {
                sourceNode = i;
                document.getElementById('result').innerHTML = `Source node set to: ${sourceNode}`;
                isSelectingSource = false;
                calculateShortestPaths();
                return;
            }
        }
    }
});

canvas.addEventListener('click', (event) => {
    if (isSelectingSource) {
        const { offsetX, offsetY } = event;

        for (let i = 0; i < numVertices; i++) {
            const { x, y } = nodePositions[i];
            const distance = Math.sqrt((offsetX - x) ** 2 + (offsetY - y) ** 2);

            if (distance <= nodeRadius) {
                sourceNode = i;
                document.getElementById('result').innerHTML = `Source node set to: ${sourceNode}`;
                isSelectingSource = false;
                calculateShortestPaths();
                return;
            }
        }
    }

    // Prevent weight customization if source node selection is active
    if (isSelectingSource) {
        return;
    }

    if (isCustomizingWeights) {
        const { offsetX, offsetY } = event;

        for (let i = 0; i < numVertices; i++) {
            for (let j = i + 1; j < numVertices; j++) {
                if (graph[i][j] !== 0) {
                    const startX = nodePositions[i].x;
                    const startY = nodePositions[i].y;
                    const endX = nodePositions[j].x;
                    const endY = nodePositions[j].y;

                    const dist = pointToSegmentDistance(offsetX, offsetY, startX, startY, endX, endY);

                    if (dist <= 10) {
                        const newWeight = parseInt(prompt(`Enter new weight for edge (${i} -> ${j}):`, graph[i][j]));
                        if (!isNaN(newWeight) && newWeight > 0) {
                            graph[i][j] = newWeight;
                            graph[j][i] = newWeight;
                            drawGraph();
                        } else {
                            alert("Invalid weight. Please enter a positive number.");
                        }
                        return;
                    }
                }
            }
        }
    }
});


function selectSourceNode() {
    const resultBox = document.getElementById('result');
    resultBox.classList.add('hide-placeholder');
    if (sourceNode !== null) {
        alert('Source node is already set.');
        return;
    }
    isSelectingSource = true;
    document.getElementById('result').innerHTML = "Please click on a node to set as the source node.";
}

function enableWeightCustomization() {
    const resultBox = document.getElementById('result');
    resultBox.classList.add('hide-placeholder');
    isCustomizingWeights = true;
    document.getElementById('result').innerHTML = "Click on an edge to customize its weight.";
}

function calculateShortestPaths() {
    // Dijkstra's Algorithm
    const dijkstraResults = runDijkstra();

    // Bellman-Ford Algorithm
    const bellmanFordResults = runBellmanFord();

    // Floyd-Warshall Algorithm
    const floydWarshallResults = runFloydWarshall();

    // Display all results
    displayResults(dijkstraResults, bellmanFordResults, floydWarshallResults);
}

function runDijkstra() {
    const distances = Array(numVertices).fill(Infinity);
    distances[sourceNode] = 0;
    const visited = Array(numVertices).fill(false);
    const prev = Array(numVertices).fill(null);

    let operationCount = 0; // Counter for actual operations

    // Theoretical time complexity (Dijkstra's algorithm with adjacency matrix)
    const theoreticalTimeComplexity = Math.round(numVertices ** 2 * Math.log2(numVertices));

    for (let i = 0; i < numVertices; i++) {
        let minDist = Infinity;
        let u = -1;

        // Find the unvisited node with the smallest distance
        for (let j = 0; j < numVertices; j++) {
            operationCount++; // Count comparison in the loop
            if (!visited[j] && distances[j] < minDist) {
                minDist = distances[j];
                u = j;
            }
        }

        if (u === -1) break;

        visited[u] = true;

        // Relax neighbors
        for (let v = 0; v < numVertices; v++) {
            operationCount++; // Count check for edge existence and visited status
            if (!visited[v] && graph[u][v] > 0) {
                const alt = distances[u] + graph[u][v];
                operationCount++; // Count calculation and comparison
                if (alt < distances[v]) {
                    distances[v] = alt;
                    prev[v] = u;
                    operationCount++; // Count assignment
                }
            }
        }
    }

    return { distances, prev, operationCount, theoreticalTimeComplexity, algorithm: 'Dijkstra' };
}

function runBellmanFord() {
    const distances = Array(numVertices).fill(Infinity);
    distances[sourceNode] = 0;
    const prev = Array(numVertices).fill(null);

    let operationCount = 0; // Counter for actual operations

    // Theoretical time complexity (Bellman-Ford algorithm with adjacency matrix)
    const theoreticalTimeComplexity = numVertices * numVertices; // O(V * E)

    // Relax all edges V-1 times
    for (let i = 1; i < numVertices; i++) {
        for (let u = 0; u < numVertices; u++) {
            for (let v = 0; v < numVertices; v++) {
                if (graph[u][v] > 0) {
                    operationCount++; // Count check for edge existence
                    const alt = distances[u] + graph[u][v];
                    operationCount++; // Count calculation and comparison
                    if (alt < distances[v]) {
                        distances[v] = alt;
                        prev[v] = u;
                        operationCount++; // Count assignment
                    }
                }
            }
        }
    }

    return { distances, prev, operationCount, theoreticalTimeComplexity, algorithm: 'Bellman-Ford' };
}

function runFloydWarshall() {
    // Initialize distance matrix
    const dist = Array(numVertices).fill().map(() => Array(numVertices).fill(Infinity));
    for (let i = 0; i < numVertices; i++) {
        dist[i][i] = 0;
    }

    // Fill the initial distances from the graph
    for (let u = 0; u < numVertices; u++) {
        for (let v = 0; v < numVertices; v++) {
            if (graph[u][v] > 0) {
                dist[u][v] = graph[u][v];
            }
        }
    }

    let operationCount = 0; // Counter for actual operations

    // Theoretical time complexity (Floyd-Warshall algorithm)
    const theoreticalTimeComplexity = Math.pow(numVertices, 3); // O(V^3)

    // Floyd-Warshall core algorithm
    for (let k = 0; k < numVertices; k++) {
        for (let i = 0; i < numVertices; i++) {
            for (let j = 0; j < numVertices; j++) {
                operationCount++; // Count comparison and calculation
                if (dist[i][j] > dist[i][k] + dist[k][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                    operationCount++; // Count assignment
                }
            }
        }
    }

    return { dist, operationCount, theoreticalTimeComplexity, algorithm: 'Floyd-Warshall' };
}

function displayResults(dijkstraResults, bellmanFordResults, floydWarshallResults) {
    let resultHTML = `<h3>Shortest Paths from Node ${sourceNode}:</h3>`;

    shortestPaths = Array(numVertices).fill().map(() => Array(numVertices).fill(false));

    // Wrapper div for side-by-side results
    resultHTML += `
        <div style="display: flex; justify-content: space-between; gap: 20px;">
            <div style="flex: 1; border: 1px solid #000; padding: 10px; border-radius: 8px;">
                <h4>Results from Dijkstra's Algorithm:</h4>
                ${getAlgorithmResults(dijkstraResults)}
            </div>

            <div style="flex: 1; border: 1px solid #000; padding: 10px; border-radius: 8px;">
                <h4>Results from Bellman-Ford Algorithm:</h4>
                ${getAlgorithmResults(bellmanFordResults)}
            </div>

            <div style="flex: 1; border: 1px solid #000; padding: 10px; border-radius: 8px;">
                <h4>Results from Floyd-Warshall Algorithm:</h4>
                ${getFloydWarshallResults(floydWarshallResults)}
            </div>
        </div>
    `;

    // Time Complexity Comparison Table
    resultHTML += `
        <h4>Time Complexity Comparison:</h4>
        <table border="1" style="border-collapse: collapse; width: 100%;">
            <tr>
                <th>Algorithm</th>
                <th>Theoretical Time Complexity</th>
                <th>Actual Operations</th>
                <th>Execution Time (seconds)</th>
            </tr>
            <tr>
                <td>Dijkstra's Algorithm</td>
                <td>O(V^2 log V)</td>
                <td>${dijkstraResults.operationCount}</td>
                <td>${(dijkstraResults.operationCount * 1e-7).toFixed(6)}</td>
            </tr>
            <tr>
                <td>Bellman-Ford Algorithm</td>
                <td>O(V * E)</td>
                <td>${bellmanFordResults.operationCount}</td>
                <td>${(bellmanFordResults.operationCount * 1e-7).toFixed(6)}</td>
            </tr>
            <tr>
                <td>Floyd-Warshall Algorithm</td>
                <td>O(V^3)</td>
                <td>${floydWarshallResults.operationCount}</td>
                <td>${(floydWarshallResults.operationCount * 1e-7).toFixed(6)}</td>
            </tr>
        </table>
    `;

    document.getElementById('result').innerHTML = resultHTML;
    drawGraph();
}


function getAlgorithmResults({ distances, prev, operationCount, theoreticalTimeComplexity, algorithm }) {
    let html = `<h4>${algorithm} Algorithm:</h4>`;
    for (let i = 0; i < numVertices; i++) {
        if (i !== sourceNode) {
            if (distances[i] === Infinity) {
                html += `<li>Node ${i}: No path</li>`;
            } else {
                let path = [];
                for (let at = i; at !== null; at = prev[at]) {
                    path.push(at);
                }
                path.reverse();

                html += `<li>Node ${i}: Distance = ${distances[i]}, Path = ${path.join(' -> ')}</li>`;

                for (let j = 0; j < path.length - 1; j++) {
                    shortestPaths[path[j]][path[j + 1]] = true;
                }
            }
        }
    }

    // Calculate time in seconds for both algorithms
    const timePerOperation = 1e-7; // Adjust this constant as needed
    const actualTimeInSeconds = operationCount * timePerOperation;

    html += `<h4>Actual Operations: ${operationCount}</h4>`;
    html += `<h4>Theoretical Time Complexity: O(${theoreticalTimeComplexity} operations)</h4>`;
    html += `<h4>Execution Time: ${actualTimeInSeconds.toFixed(6)} seconds</h4>`;
    
    return html;
}

function getFloydWarshallResults({ dist, operationCount, theoreticalTimeComplexity, algorithm }) {
    let html = `<h4>${algorithm} Algorithm:</h4>`;
    for (let i = 0; i < numVertices; i++) {
        for (let j = 0; j < numVertices; j++) {
            if (i !== j) {
                if (dist[i][j] === Infinity) {
                    html += `<li>From Node ${i} to Node ${j}: No path</li>`;
                } else {
                    html += `<li>From Node ${i} to Node ${j}: Distance = ${dist[i][j]}</li>`;
                }
            }
        }
    }

    // Calculate time in seconds for Floyd-Warshall
    const timePerOperation = 1e-7; // Adjust this constant as needed
    const actualTimeInSeconds = operationCount * timePerOperation;

    html += `<h4>Actual Operations: ${operationCount}</h4>`;
    html += `<h4>Theoretical Time Complexity: O(${theoreticalTimeComplexity} operations)</h4>`;
    html += `<h4>Execution Time: ${actualTimeInSeconds.toFixed(6)} seconds</h4>`;

    return html;
}






function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    const param = lenSq !== 0 ? dot / lenSq : -1;

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;

    return Math.sqrt(dx * dx + dy * dy);
}

