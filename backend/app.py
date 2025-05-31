from flask import Flask, request, jsonify
from flask_cors import CORS
import GEOparse
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO
import base64
import json
import os
import tempfile

app = Flask(__name__)
CORS(app)

# Helper function to clean data
def clean_value(val):
    try:
        if pd.isna(val) or val == "NA" or val == "NaN" or val == "":
            return 0.0
        return float(val)
    except (ValueError, TypeError):
        return 0.0

@app.route('/api/search_dataset', methods=['GET'])
def search_dataset():
    try:
        dataset_id = request.args.get('gse_id', '')
        if not dataset_id:
            return jsonify({'error': 'Dataset ID is required'}), 400

        with tempfile.TemporaryDirectory() as tmp_dir:
            gse = GEOparse.get_GEO(geo=dataset_id, destdir=tmp_dir)
            
            metadata = {
                'title': str(gse.metadata.get('title', [''])[0]),
                'platform': str(gse.metadata.get('platform_id', [''])[0]),
                'organism': str(gse.metadata.get('organism_ch1', [''])[0]),
                'submission_date': str(gse.metadata.get('submission_date', [''])[0])
            }

            gpls = list(gse.gpls.keys())
            genes = []
            if gpls:
                gpl = gse.gpls[gpls[0]]
                if 'Gene Symbol' in gpl.table:
                    genes = [str(symbol) for symbol in gpl.table['Gene Symbol'].unique() if pd.notna(symbol)]
                elif 'ID' in gpl.table:
                    genes = [str(id_) for id_ in gpl.table['ID'].unique() if pd.notna(id_)]

            samples = list(gse.gsms.keys())
            expression_data = []
            
            for sample in samples:
                gsm = gse.gsms[sample]
                values = [clean_value(val) for val in gsm.table['VALUE']]
                expression_data.append(values[:len(genes)])

            min_length = min(len(row) for row in expression_data)
            expression_data = [row[:min_length] for row in expression_data]
            genes = genes[:min_length]

            return jsonify({
                'metadata': metadata,
                'samples': samples,
                'genes': genes[:100],
                'expression_data': expression_data
            })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_data():
    try:
        data = request.json
        if not data or 'expression_data' not in data:
            return jsonify({'error': 'No expression data provided'}), 400

        expression_data = np.array(data['expression_data'])
        expression_data = np.nan_to_num(expression_data, nan=0.0)

        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(expression_data)
        pca = PCA(n_components=2)
        pca_result = pca.fit_transform(scaled_data)

        plt.figure(figsize=(10, 6))
        plt.scatter(pca_result[:, 0], pca_result[:, 1])
        plt.xlabel('PC1')
        plt.ylabel('PC2')
        plt.title('PCA of Gene Expression Data')

        buffer = BytesIO()
        plt.savefig(buffer, format='png')
        buffer.seek(0)
        image_png = buffer.getvalue()
        buffer.close()
        plt.close()

        graphic = base64.b64encode(image_png).decode('utf-8')

        return jsonify({
            'pca_plot': graphic,
            'variance_explained': pca.explained_variance_ratio_.tolist()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'Message is required'}), 400

        # Simple response system
        responses = {
            'gene expression': 'Gene expression is the process by which information from a gene is used in the synthesis of a functional gene product.',
            'dna': 'DNA (deoxyribonucleic acid) is a molecule that carries genetic instructions for development and functioning of living organisms.',
            'rna': 'RNA (ribonucleic acid) is a molecule essential in various biological roles including coding, decoding, regulation and expression of genes.',
            'protein': 'Proteins are large biomolecules that are essential for all living organisms. They are made up of amino acids and perform various functions.',
            'pcr': 'PCR (Polymerase Chain Reaction) is a method widely used to rapidly make millions of copies of a specific DNA sample.',
        }

        # Find matching response
        response = "I'm sorry, I don't have specific information about that topic. Please try asking about gene expression, DNA, RNA, proteins, or PCR."
        for key in responses:
            if key in user_message.lower():
                response = responses[key]
                break

        return jsonify({
            'response': response,
            'timestamp': pd.Timestamp.now().isoformat()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)