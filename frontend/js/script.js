const API_BASE_URL = 'http://127.0.0.1:5000/api';
let currentDataset = null;
let selectedControlSamples = new Set();
let selectedDiseaseSamples = new Set();

// Initialize tooltips
document.addEventListener('DOMContentLoaded', function() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });

    // Initialize the application
    initializeApp();
});

function initializeApp() {
    // Add event listeners for the analysis form
    const analysisForm = document.getElementById('analysisForm');
    if (analysisForm) {
        analysisForm.addEventListener('submit', handleAnalysisSubmit);
    }

    // Add event listeners for visualization controls
    const updatePlotButton = document.getElementById('updatePlot');
    if (updatePlotButton) {
        updatePlotButton.addEventListener('click', handlePlotUpdate);
    }
}

async function handleAnalysisSubmit(event) {
    event.preventDefault();

    // Show loading spinner
    const loadingSpinner = document.getElementById('loadingSpinner');
    const resultsSection = document.getElementById('resultsSection');
    const resultsContent = document.getElementById('resultsContent');

    loadingSpinner.style.display = 'block';
    resultsSection.style.display = 'block';
    resultsContent.innerHTML = '';

    try {
        // Get form data
        const gseId = document.getElementById('gseId').value;
        
        // Fetch dataset information
        const response = await fetch(`${API_BASE_URL}/search_dataset?gse_id=${gseId}`);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error);
        }

        // Display results
        displayResults(data);

        // Analyze data
        const analysisResponse = await fetch(`${API_BASE_URL}/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                expression_data: data.expression_data
            })
        });

        const analysisData = await analysisResponse.json();
        displayAnalysis(analysisData);

    } catch (error) {
        resultsContent.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Error: ${error.message}</p>
            </div>
        `;
    } finally {
        loadingSpinner.style.display = 'none';
    }
}

function displayResults(data) {
    const resultsContent = document.getElementById('resultsContent');
    
    resultsContent.innerHTML = `
        <div class="results-header">
            <h3>${data.metadata.title}</h3>
            <p><strong>Platform:</strong> ${data.metadata.platform}</p>
            <p><strong>Organism:</strong> ${data.metadata.organism}</p>
            <p><strong>Submission Date:</strong> ${data.metadata.submission_date}</p>
        </div>
        <div class="results-body">
            <div class="samples-section">
                <h4>Samples (${data.samples.length})</h4>
                <ul class="samples-list">
                    ${data.samples.map(sample => `<li>${sample}</li>`).join('')}
                </ul>
            </div>
            <div class="genes-section">
                <h4>Top Genes (${data.genes.length})</h4>
                <ul class="genes-list">
                    ${data.genes.slice(0, 10).map(gene => `<li>${gene}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;
}

function displayAnalysis(data) {
    const resultsContent = document.getElementById('resultsContent');
    
    // Create PCA plot
    const plotDiv = document.createElement('div');
    plotDiv.className = 'analysis-plot';
    plotDiv.innerHTML = `
        <h4>Principal Component Analysis</h4>
        <img src="data:image/png;base64,${data.pca_plot}" alt="PCA Plot">
        <p>Variance Explained: ${(data.variance_explained[0] * 100).toFixed(2)}% (PC1), 
           ${(data.variance_explained[1] * 100).toFixed(2)}% (PC2)</p>
    `;
    
    resultsContent.appendChild(plotDiv);
}

function handlePlotUpdate() {
    const plotType = document.getElementById('plotType').value;
    const geneList = document.getElementById('geneList').value.split('\n').filter(gene => gene.trim());
    
    // Update plot based on selection
    updateVisualization(plotType, geneList);
}

function updateVisualization(plotType, genes) {
    const plotContainer = document.getElementById('plotContainer');
    
    // Example: Create a simple plot using Plotly
    const trace = {
        x: Array.from({length: 10}, (_, i) => i),
        y: Array.from({length: 10}, () => Math.random() * 10),
        type: 'scatter'
    };

    const layout = {
        title: `${plotType} for Selected Genes`,
        xaxis: {title: 'Sample'},
        yaxis: {title: 'Expression Level'}
    };

    Plotly.newPlot(plotContainer, [trace], layout);
}

function showAlert(message, type = 'error') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type === 'error' ? 'danger' : 'warning'} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('.container').insertBefore(alertDiv, document.querySelector('.container').firstChild);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = '<div class="loading"></div>';
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element.querySelector('.loading')) {
        element.querySelector('.loading').remove();
    }
}