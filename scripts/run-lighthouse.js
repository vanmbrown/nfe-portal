/**
 * Run Lighthouse audit on key pages
 * Usage: node scripts/run-lighthouse.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Helper to wait
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const REPORTS_DIR = path.join(process.cwd(), 'lighthouse-reports');
const PAGES = [
  { url: 'http://localhost:3000', name: 'home' },
  { url: 'http://localhost:3000/products', name: 'products' },
  { url: 'http://localhost:3000/our-story', name: 'our-story' },
  { url: 'http://localhost:3000/science', name: 'science' },
  { url: 'http://localhost:3000/learn', name: 'learn' },
];

// Ensure reports directory exists
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

console.log('🚀 Starting Lighthouse audit...\n');
console.log('⚠️  Make sure the dev server is running: npm run dev\n');

const results = [];

for (const page of PAGES) {
  try {
    console.log(`📊 Auditing ${page.name}...`);
    
    const jsonPath = path.join(REPORTS_DIR, `${page.name}.json`);
    const htmlPath = path.join(REPORTS_DIR, `${page.name}.html`);
    
    // Run Lighthouse - output JSON and HTML separately
    execSync(
      `npx lighthouse "${page.url}" --output=json --output-path="${jsonPath}" --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility,best-practices,seo`,
      { stdio: 'pipe', encoding: 'utf8' }
    );
    
    // Also generate HTML report
    execSync(
      `npx lighthouse "${page.url}" --output=html --output-path="${htmlPath}" --chrome-flags="--headless --no-sandbox" --only-categories=performance,accessibility,best-practices,seo`,
      { stdio: 'pipe', encoding: 'utf8' }
    );
    
    // Wait a moment for file to be written
    wait(500);
    
    // Read and parse results
    const report = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const categories = report.categories;
    
    const scores = {
      performance: Math.round(categories.performance.score * 100),
      accessibility: Math.round(categories.accessibility.score * 100),
      bestPractices: Math.round(categories['best-practices'].score * 100),
      seo: Math.round(categories.seo.score * 100),
    };
    
    results.push({
      page: page.name,
      url: page.url,
      scores,
      metrics: {
        fcp: report.audits['first-contentful-paint']?.numericValue,
        lcp: report.audits['largest-contentful-paint']?.numericValue,
        cls: report.audits['cumulative-layout-shift']?.numericValue,
        tti: report.audits['interactive']?.numericValue,
      },
    });
    
    console.log(`✅ ${page.name}: P${scores.performance} A${scores.accessibility} BP${scores.bestPractices} SEO${scores.seo}\n`);
  } catch (error) {
    console.error(`❌ Error auditing ${page.name}:`, error.message);
  }
}

// Generate summary report
const summaryPath = path.join(REPORTS_DIR, 'summary.md');
const summary = `# Lighthouse Audit Summary

Generated: ${new Date().toISOString()}

## Overall Scores

${results.map(r => `### ${r.page.toUpperCase()}
- **Performance**: ${r.scores.performance}/100
- **Accessibility**: ${r.scores.accessibility}/100
- **Best Practices**: ${r.scores.bestPractices}/100
- **SEO**: ${r.scores.seo}/100

**Metrics**:
- First Contentful Paint: ${r.metrics.fcp ? Math.round(r.metrics.fcp) + 'ms' : 'N/A'}
- Largest Contentful Paint: ${r.metrics.lcp ? Math.round(r.metrics.lcp) + 'ms' : 'N/A'}
- Cumulative Layout Shift: ${r.metrics.cls ? r.metrics.cls.toFixed(3) : 'N/A'}
- Time to Interactive: ${r.metrics.tti ? Math.round(r.metrics.tti) + 'ms' : 'N/A'}

`).join('\n')}

## Recommendations

See individual HTML reports in this directory for detailed recommendations.

`;

fs.writeFileSync(summaryPath, summary);
console.log(`\n📄 Summary report saved to: ${summaryPath}`);
console.log(`\n📊 Individual reports:`);
results.forEach(r => {
  console.log(`   - ${r.page}: lighthouse-reports/${r.page}.html`);
});

