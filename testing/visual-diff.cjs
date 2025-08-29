#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
let pixelmatch;
try {
    pixelmatch = require('pixelmatch').default;
} catch (e) {
    pixelmatch = require('pixelmatch');
}

/**
 * Visual Diff Comparison Tool
 * Compares screenshots between different browsers and generates diff maps
 */

class VisualDiffTool {
    constructor() {
        this.screenshotsDir = path.join(__dirname, 'screenshots');
        this.diffMapsDir = path.join(__dirname, 'screenshots', 'diff-maps');
        this.browsers = ['chrome', 'firefox', 'safari'];
        this.threshold = 0.1; // Threshold for pixel differences (0-1)
    }

    /**
     * Load PNG image and return PNG data
     */
    loadImage(imagePath) {
        if (!fs.existsSync(imagePath)) {
            throw new Error(`Image not found: ${imagePath}`);
        }
        
        const data = fs.readFileSync(imagePath);
        return PNG.sync.read(data);
    }

    /**
     * Compare two images and generate a diff map
     */
    compareImages(img1Path, img2Path, outputPath, comparisonName) {
        console.log(`\n🔍 Comparing: ${comparisonName}`);
        console.log(`   Image 1: ${path.basename(img1Path)}`);
        console.log(`   Image 2: ${path.basename(img2Path)}`);

        try {
            const img1 = this.loadImage(img1Path);
            const img2 = this.loadImage(img2Path);

            // Ensure images have the same dimensions
            if (img1.width !== img2.width || img1.height !== img2.height) {
                console.log(`   ⚠️  Different dimensions: ${img1.width}x${img1.height} vs ${img2.width}x${img2.height}`);
                
                // Use the smaller dimensions for comparison
                const width = Math.min(img1.width, img2.width);
                const height = Math.min(img1.height, img2.height);
                
                // Create cropped versions
                const croppedImg1 = new PNG({ width, height });
                const croppedImg2 = new PNG({ width, height });
                
                PNG.bitblt(img1, croppedImg1, 0, 0, width, height, 0, 0);
                PNG.bitblt(img2, croppedImg2, 0, 0, width, height, 0, 0);
                
                return this.performComparison(croppedImg1, croppedImg2, outputPath, comparisonName, width, height);
            }

            return this.performComparison(img1, img2, outputPath, comparisonName, img1.width, img1.height);

        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
            return null;
        }
    }

    /**
     * Perform the actual pixel comparison
     */
    performComparison(img1, img2, outputPath, comparisonName, width, height) {
        // Create diff image
        const diff = new PNG({ width, height });
        
        // Perform pixel-by-pixel comparison
        const numDiffPixels = pixelmatch(
            img1.data, 
            img2.data, 
            diff.data, 
            width, 
            height, 
            {
                threshold: this.threshold,
                includeAA: false, // Don't consider anti-aliasing differences
                alpha: 0.1,       // Alpha transparency for diff pixels
                aaColor: [255, 255, 0], // Yellow for anti-aliasing differences
                diffColor: [255, 0, 255], // Magenta for pixel differences
                diffColorAlt: [0, 255, 255] // Cyan for alternative diff color
            }
        );

        // Calculate difference percentage
        const totalPixels = width * height;
        const diffPercentage = ((numDiffPixels / totalPixels) * 100).toFixed(2);

        // Save diff image
        const buffer = PNG.sync.write(diff);
        fs.writeFileSync(outputPath, buffer);

        // Log results
        console.log(`   📊 Differences: ${numDiffPixels.toLocaleString()} pixels (${diffPercentage}%)`);
        console.log(`   💾 Diff saved: ${path.basename(outputPath)}`);

        return {
            comparisonName,
            numDiffPixels,
            totalPixels,
            diffPercentage: parseFloat(diffPercentage),
            outputPath,
            width,
            height
        };
    }

    /**
     * Generate HTML report
     */
    generateHTMLReport(results) {
        const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GENUX 2025 - Cross-Browser Visual Comparison Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #041D1D;
            border-bottom: 3px solid #95E208;
            padding-bottom: 10px;
            margin-bottom: 30px;
        }
        h2 {
            color: #0A6E6E;
            margin: 30px 0 15px 0;
        }
        .summary {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin-bottom: 30px;
            border-left: 4px solid #95E208;
        }
        .comparison {
            margin-bottom: 40px;
            border: 1px solid #ddd;
            border-radius: 6px;
            overflow: hidden;
        }
        .comparison-header {
            background: #041D1D;
            color: white;
            padding: 15px 20px;
            font-weight: 600;
        }
        .comparison-content {
            padding: 20px;
        }
        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .metric {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 4px;
            text-align: center;
        }
        .metric-value {
            font-size: 24px;
            font-weight: bold;
            color: #0A6E6E;
        }
        .metric-label {
            font-size: 12px;
            text-transform: uppercase;
            color: #666;
            margin-top: 5px;
        }
        .images {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            margin-top: 20px;
        }
        .image-container {
            text-align: center;
        }
        .image-container h4 {
            margin: 0 0 10px 0;
            padding: 10px;
            background: #f8f9fa;
            border-radius: 4px;
            font-size: 14px;
        }
        .image-container img {
            width: 100%;
            height: auto;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        .status-excellent { background: #d4edda; color: #155724; }
        .status-good { background: #d1ecf1; color: #0c5460; }
        .status-fair { background: #fff3cd; color: #856404; }
        .status-poor { background: #f8d7da; color: #721c24; }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🌐 Cross-Browser Visual Comparison Report</h1>
        <div class="summary">
            <h2>📊 Summary</h2>
            <p><strong>Project:</strong> GENUX Conference 2025 Website</p>
            <p><strong>Test Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Browsers Tested:</strong> Chrome, Firefox, Safari</p>
            <p><strong>Viewport:</strong> 1920x1080 (Desktop)</p>
        </div>

        ${results.map(result => {
            if (!result) return '';
            
            const getStatusBadge = (percentage) => {
                if (percentage < 0.1) return '<span class="status-badge status-excellent">Excellent</span>';
                if (percentage < 1.0) return '<span class="status-badge status-good">Good</span>';
                if (percentage < 5.0) return '<span class="status-badge status-fair">Fair</span>';
                return '<span class="status-badge status-poor">Poor</span>';
            };

            const browsers = result.comparisonName.split(' vs ');
            
            return `
        <div class="comparison">
            <div class="comparison-header">
                ${result.comparisonName} ${getStatusBadge(result.diffPercentage)}
            </div>
            <div class="comparison-content">
                <div class="metrics">
                    <div class="metric">
                        <div class="metric-value">${result.diffPercentage}%</div>
                        <div class="metric-label">Visual Difference</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${result.numDiffPixels.toLocaleString()}</div>
                        <div class="metric-label">Different Pixels</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${result.width}×${result.height}</div>
                        <div class="metric-label">Resolution</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${result.totalPixels.toLocaleString()}</div>
                        <div class="metric-label">Total Pixels</div>
                    </div>
                </div>
                <div class="images">
                    <div class="image-container">
                        <h4>${browsers[0]} Screenshot</h4>
                        <img src="../${browsers[0].toLowerCase()}/homepage.png" alt="${browsers[0]} screenshot">
                    </div>
                    <div class="image-container">
                        <h4>${browsers[1]} Screenshot</h4>
                        <img src="../${browsers[1].toLowerCase()}/homepage.png" alt="${browsers[1]} screenshot">
                    </div>
                    <div class="image-container">
                        <h4>Visual Differences</h4>
                        <img src="${path.basename(result.outputPath)}" alt="Diff map">
                    </div>
                </div>
            </div>
        </div>`;
        }).join('')}

        <div class="footer">
            <p>Generated by Visual Diff Tool using <a href="https://github.com/mapbox/pixelmatch">pixelmatch</a> and <a href="https://github.com/arian/pngjs">pngjs</a></p>
            <p>Threshold: ${this.threshold} | Magenta = Pixel Differences | Cyan = Alternative Differences</p>
        </div>
    </div>
</body>
</html>`;

        const reportPath = path.join(this.diffMapsDir, 'comparison-report.html');
        fs.writeFileSync(reportPath, htmlContent);
        console.log(`\n📄 HTML Report generated: ${reportPath}`);
        
        return reportPath;
    }

    /**
     * Run all browser comparisons
     */
    runComparisons() {
        console.log('🚀 Starting cross-browser visual comparison...');
        console.log(`📁 Screenshots directory: ${this.screenshotsDir}`);
        console.log(`📁 Diff maps directory: ${this.diffMapsDir}`);
        
        // Ensure diff maps directory exists
        if (!fs.existsSync(this.diffMapsDir)) {
            fs.mkdirSync(this.diffMapsDir, { recursive: true });
        }

        const results = [];
        const comparisons = [
            { browser1: 'chrome', browser2: 'firefox', name: 'Chrome vs Firefox' },
            { browser1: 'chrome', browser2: 'safari', name: 'Chrome vs Safari' },
            { browser1: 'firefox', browser2: 'safari', name: 'Firefox vs Safari' }
        ];

        for (const comparison of comparisons) {
            const img1Path = path.join(this.screenshotsDir, comparison.browser1, 'homepage.png');
            const img2Path = path.join(this.screenshotsDir, comparison.browser2, 'homepage.png');
            const outputPath = path.join(this.diffMapsDir, `${comparison.browser1}-vs-${comparison.browser2}-diff.png`);

            const result = this.compareImages(img1Path, img2Path, outputPath, comparison.name);
            results.push(result);
        }

        // Generate HTML report
        this.generateHTMLReport(results);

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📋 COMPARISON SUMMARY');
        console.log('='.repeat(60));
        
        results.forEach(result => {
            if (result) {
                const status = result.diffPercentage < 0.1 ? '✅ Excellent' : 
                              result.diffPercentage < 1.0 ? '🟡 Good' : 
                              result.diffPercentage < 5.0 ? '🟠 Fair' : '❌ Poor';
                console.log(`${result.comparisonName}: ${result.diffPercentage}% difference ${status}`);
            }
        });
        
        console.log('\n🎉 Visual comparison complete! Check the HTML report for detailed results.');
    }
}

// Run the tool
if (require.main === module) {
    const tool = new VisualDiffTool();
    tool.runComparisons();
}

module.exports = VisualDiffTool;