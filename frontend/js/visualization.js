let currentData = null;

async function loadDataset() {
    const datasetId = document.getElementById('datasetId').value;
    if (!datasetId) {
        alert('Please enter a dataset ID');
        return;
    }

    try {
        // Show loading state
        document.getElementById('plotContainer').innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading dataset...</p>
            </div>
        `;

        const response = await fetch(`http://localhost:5000/api/search_dataset?gse_id=${datasetId}`);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        currentData = data;
        
        // Populate gene select
        const geneSelect = document.getElementById('geneSelect');
        geneSelect.innerHTML = data.genes.map(gene => 
            `<option value="${gene}">${gene}</option>`
        ).join('');

        // Create initial visualization
        updateVisualization();

    } catch (error) {
        document.getElementById('plotContainer').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error: ${error.message}</p>
            </div>
        `;
    }
}

function updatePlotType() {
    if (currentData) {
        updateVisualization();
    }
}

function updateVisualization() {
    if (!currentData) {
        alert('Please load a dataset first');
        return;
    }

    const plotType = document.getElementById('plotType').value;
    const plotContainer = document.getElementById('plotContainer');

    switch (plotType) {
        case 'heatmap':
            createHeatmap();
            break;
        case 'pca':
            createPCAPlot();
            break;
        case 'boxplot':
            createBoxPlot();
            break;
        case 'volcano':
            createVolcanoPlot();
            break;
    }
}

function createHeatmap() {
    const data = [{
        z: currentData.expression_data,
        x: currentData.samples,
        y: currentData.genes.slice(0, 50), // Show first 50 genes for better visibility
        type: 'heatmap',
        colorscale: 'RdBu'
    }];

    const layout = {
        title: 'Gene Expression Heatmap',
        xaxis: {
            title: 'Samples',
            tickangle: 45
        },
        yaxis: {
            title: 'Genes'
        }
    };

    Plotly.newPlot('plotContainer', data, layout);
}

function createPCAPlot() {
    // Use the backend for PCA calculation
    fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            expression_data: currentData.expression_data
        })
    })
    .then(response => response.json())
    .then(data => {
        // Display the PCA plot image
        document.getElementById('plotContainer').innerHTML = `
            <img src="data:image/png;base64,${data.pca_plot}" alt="PCA Plot">
            <div class="plot-info">
                <p>Variance Explained:</p>
                <p>PC1: ${(data.variance_explained[0] * 100).toFixed(2)}%</p>
                <p>PC2: ${(data.variance_explained[1] * 100).toFixed(2)}%</p>
            </div>
        `;
    })
    .catch(error => {
        document.getElementById('plotContainer').innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error: ${error.message}</p>
            </div>
        `;
    });
}

function createBoxPlot() {
    // Prepare data for box plot
    const traces = currentData.genes.slice(0, 10).map((gene, i) => ({
        y: currentData.expression_data.map(sample => sample[i]),
        type: 'box',
        name: gene
    }));

    const layout = {
        title: 'Gene Expression Distribution',
        yaxis: {
            title: 'Expression Level'
        },
        boxmode: 'group'
    };

    Plotly.newPlot('plotContainer', traces, layout);
}

function createVolcanoPlot() {
    // Simulate log fold change and p-values for demonstration
    const logFC = Array.from({length: currentData.genes.length}, () => (Math.random() * 4) - 2);
    const pValues = Array.from({length: currentData.genes.length}, () => Math.random() * 0.1);

    const data = [{
        x: logFC,
        y: pValues.map(p => -Math.log10(p)),
        mode: 'markers',
        type: 'scatter',
        marker: {
            size: 8,
            color: logFC.map(fc => Math.abs(fc) > 1 && -Math.log10(pValues[logFC.indexOf(fc)]) > 2 ? 'red' : 'blue')
        },
        text: currentData.genes
    }];

    const layout = {
        title: 'Volcano Plot',
        xaxis: {
            title: 'Log2 Fold Change'
        },
        yaxis: {
            title: '-log10(p-value)'
        }
    };

    Plotly.newPlot('plotContainer', data, layout);
}

function downloadPlot() {
    const plotContainer = document.getElementById('plotContainer');
    
    html2canvas(plotContainer).then(canvas => {
        const link = document.createElement('a');
        link.download = 'gene_expression_plot.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

function downloadData() {
    if (!currentData) return;

    const csvContent = "data:text/csv;charset=utf-8," + 
        currentData.genes.join(",") + "\n" +
        currentData.expression_data.map(row => row.join(",")).join("\n");

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = 'gene_expression_data.csv';
    link.click();
}
