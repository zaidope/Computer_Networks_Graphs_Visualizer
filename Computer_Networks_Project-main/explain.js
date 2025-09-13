function calculateShortestPaths() { 
    // Calculate shortest paths using Dijkstra, Bellman-Ford, and Floyd-Warshall algorithms
    const dijkstraResults = runDijkstra();
    const bellmanFordResults = runBellmanFord();
    const floydWarshallResults = runFloydWarshall();

    // Display the results of all algorithms
    displayResults(dijkstraResults, bellmanFordResults, floydWarshallResults);
}

function runDijkstra() {
    // Initialize distances to all nodes as Infinity, except the source node
    const distances = Array(numVertices).fill(Infinity);
    distances[sourceNode] = 0;
    const visited = Array(numVertices).fill(false); // Track visited nodes
    const prev = Array(numVertices).fill(null); // Store the previous node in the path

    let operationCount = 0; // Count the number of operations performed

    // Calculate theoretical time complexity for Dijkstra's algorithm
    const theoreticalTimeComplexity = Math.round(numVertices ** 2 * Math.log2(numVertices));

    for (let i = 0; i < numVertices; i++) {
        let minDist = Infinity;
        let u = -1;

        // Find the unvisited node with the smallest distance
        for (let j = 0; j < numVertices; j++) {
            operationCount++; // Count each comparison operation
            if (!visited[j] && distances[j] < minDist) {
                minDist = distances[j];
                u = j;
            }
        }

        // If no node is found, break the loop
        if (u === -1) break;

        visited[u] = true; // Mark the node as visited

        // Relax neighbors by updating the shortest path
        for (let v = 0; v < numVertices; v++) {
            operationCount++; // Count the check for edge and visit status
            if (!visited[v] && graph[u][v] > 0) {
                const alt = distances[u] + graph[u][v]; // Calculate alternative path
                operationCount++; // Count comparison and calculation
                if (alt < distances[v]) {
                    distances[v] = alt; // Update the shortest distance
                    prev[v] = u; // Store the previous node
                    operationCount++; // Count assignment
                }
            }
        }
    }

    return { distances, prev, operationCount, theoreticalTimeComplexity, algorithm: 'Dijkstra' };
}

function runBellmanFord() {
    // Initialize distances to all nodes as Infinity, except the source node
    const distances = Array(numVertices).fill(Infinity);
    distances[sourceNode] = 0;
    const prev = Array(numVertices).fill(null); // Store the previous node in the path

    let operationCount = 0; // Count the number of operations performed

    // Calculate theoretical time complexity for Bellman-Ford algorithm
    const theoreticalTimeComplexity = numVertices * numVertices; // O(V * E)

    // Relax all edges V-1 times
    for (let i = 1; i < numVertices; i++) {
        for (let u = 0; u < numVertices; u++) {
            for (let v = 0; v < numVertices; v++) {
                if (graph[u][v] > 0) {
                    operationCount++; // Count edge existence check
                    const alt = distances[u] + graph[u][v];
                    operationCount++; // Count calculation and comparison
                    if (alt < distances[v]) {
                        distances[v] = alt; // Update the shortest distance
                        prev[v] = u; // Store the previous node
                        operationCount++; // Count assignment
                    }
                }
            }
        }
    }

    return { distances, prev, operationCount, theoreticalTimeComplexity, algorithm: 'Bellman-Ford' };
}

function runFloydWarshall() {
    // Initialize the distance matrix with Infinity and 0 for diagonal elements
    const dist = Array(numVertices).fill().map(() => Array(numVertices).fill(Infinity));
    for (let i = 0; i < numVertices; i++) {
        dist[i][i] = 0; // Distance to self is 0
    }

    // Fill initial distances from the graph
    for (let u = 0; u < numVertices; u++) {
        for (let v = 0; v < numVertices; v++) {
            if (graph[u][v] > 0) {
                dist[u][v] = graph[u][v];
            }
        }
    }

    let operationCount = 0; // Count the number of operations performed

    // Calculate theoretical time complexity for Floyd-Warshall algorithm
    const theoreticalTimeComplexity = Math.pow(numVertices, 3); // O(V^3)

    // Core of Floyd-Warshall algorithm - update paths
    for (let k = 0; k < numVertices; k++) {
        for (let i = 0; i < numVertices; i++) {
            for (let j = 0; j < numVertices; j++) {
                operationCount++; // Count comparison and calculation
                if (dist[i][j] > dist[i][k] + dist[k][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j]; // Update shortest path
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

    // Display results in a side-by-side layout
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

    document.getElementById('result').innerHTML = resultHTML;
    drawGraph(); // Re-draw graph to highlight shortest paths
}
