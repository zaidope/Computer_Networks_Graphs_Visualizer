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
    if (sourceNode !== null) {
        alert('Source node is already set.');
        return;
    }
    isSelectingSource = true;
    document.getElementById('result').innerHTML = "Please click on a node to set as the source node.";
}

function enableWeightCustomization() {
    isCustomizingWeights = true;
    document.getElementById('result').innerHTML = "Click on an edge to customize its weight.";
}

function calculateShortestPaths() {
    const distances = Array(numVertices).fill(Infinity);
    distances[sourceNode] = 0;
    const visited = Array(numVertices).fill(false);
    const prev = Array(numVertices).fill(null);

    for (let i = 0; i < numVertices; i++) {
        let minDist = Infinity;
        let u = -1;

        for (let j = 0; j < numVertices; j++) {
            if (!visited[j] && distances[j] < minDist) {
                minDist = distances[j];
                u = j;
            }
        }

        if (u === -1) break;

        visited[u] = true;

        for (let v = 0; v < numVertices; v++) {
            if (!visited[v] && graph[u][v] > 0) {
                const alt = distances[u] + graph[u][v];
                if (alt < distances[v]) {
                    distances[v] = alt;
                    prev[v] = u;
                }
            }
        }
    }

    displayShortestPaths(distances, prev);
}

function displayShortestPaths(distances, prev) {
    let resultHTML = `<h3>Shortest Paths from Node ${sourceNode}:</h3><ul>`;
    shortestPaths = Array(numVertices).fill().map(() => Array(numVertices).fill(false));

    for (let i = 0; i < numVertices; i++) {
        if (i !== sourceNode) {
            if (distances[i] === Infinity) {
                resultHTML += `<li>Node ${i}: No path</li>`;
            } else {
                let path = [];
                for (let at = i; at !== null; at = prev[at]) {
                    path.push(at);
                }
                path.reverse();

                resultHTML += `<li>Node ${i}: Distance = ${distances[i]}, Path = ${path.join(' -> ')}</li>`;

                for (let j = 0; j < path.length - 1; j++) {
                    shortestPaths[path[j]][path[j + 1]] = true;
                }
            }
        }
    }

    resultHTML += "</ul>";
    document.getElementById('result').innerHTML = resultHTML;
    drawGraph();
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

