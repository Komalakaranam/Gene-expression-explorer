document.addEventListener('DOMContentLoaded', function() {
    const analysisForm = document.getElementById('analysisForm');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const resultsSection = document.getElementById('resultsSection');
    const resultsContent = document.getElementById('resultsContent');

    analysisForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Show loading state
        resultsSection.style.display = 'block';
        loadingSpinner.style.display = 'block';
        resultsContent.innerHTML = '';

        try {
            const gseId = document.getElementById('gseId').value;
            const analysisType = document.getElementById('analysisType').value;
            const controlGroup = document.getElementById('controlGroup').value;
            const experimentalGroup = document.getElementById('experimentalGroup').value;

            // First, fetch the dataset
            const response = await fetch(`http://localhost:5000/api/search_dataset?gse_id=${gseId}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Display dataset information
            resultsContent.innerHTML = `
                <div class="dataset-info">
                    <h3>Dataset Information</h3>
                    <p><strong>Title:</strong> ${data.metadata.title}</p>
                    <p><strong>Platform:</strong> ${data.metadata.platform}</p>
                    <p><strong>Organism:</strong> ${data.metadata.organism}</p>
                    <p><strong>Submission Date:</strong> ${data.metadata.submission_date}</p>
                </div>
                <div class="analysis-info">
                    <h3>Analysis Details</h3>
                    <p><strong>Analysis Type:</strong> ${analysisType}</p>
                    <p><strong>Number of Samples:</strong> ${data.samples.length}</p>
                    <p><strong>Number of Genes:</strong> ${data.genes.length}</p>
                </div>
            `;

            // Perform analysis
            const analysisResponse = await fetch('http://localhost:5000/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    expression_data: data.expression_data,
                    analysis_type: analysisType,
                    control_group: controlGroup,
                    experimental_group: experimentalGroup
                })
            });

            const analysisResult = await analysisResponse.json();

            if (analysisResult.error) {
                throw new Error(analysisResult.error);
            }

            // Display analysis results
            const analysisDiv = document.createElement('div');
            analysisDiv.className = 'analysis-results';
            analysisDiv.innerHTML = `
                <h3>Analysis Results</h3>
                <div class="plot-container">
                    <img src="data:image/png;base64,${analysisResult.pca_plot}" alt="Analysis Plot">
                </div>
                <div class="variance-explained">
                    <p><strong>Variance Explained:</strong></p>
                    <p>PC1: ${(analysisResult.variance_explained[0] * 100).toFixed(2)}%</p>
                    <p>PC2: ${(analysisResult.variance_explained[1] * 100).toFixed(2)}%</p>
                </div>
            `;
            resultsContent.appendChild(analysisDiv);

        } catch (error) {
            resultsContent.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${error.message}</p>
                    <p>Please try another dataset ID or check your input.</p>
                </div>
            `;
        } finally {
            loadingSpinner.style.display = 'none';
        }
    });
});
