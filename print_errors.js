const fs = require('fs');
let content = fs.readFileSync('eslint_errors_utf8.json', 'utf8');
if (content.charCodeAt(0) === 0xFEFF) {
  content = content.slice(1);
}
const data = JSON.parse(content);
const errors = data.filter(d => d.errorCount > 0 || d.warningCount > 0);
errors.forEach(e => {
  console.log('\n---', e.filePath, '---');
  e.messages.forEach(m => console.log(`Line ${m.line}: [${m.severity === 2 ? 'Error' : 'Warning'}] ${m.message} (${m.ruleId})`));
});
