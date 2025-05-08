function markdownToHtml(markdown) {
    const rules = [
        { regex: /^###### (.*$)/gim, replacement: '<h6>$1</h6>' },
        { regex: /^##### (.*$)/gim, replacement: '<h5>$1</h5>' },
        { regex: /^#### (.*$)/gim, replacement: '<h4>$1</h4>' },
        { regex: /^### (.*$)/gim, replacement: '<h3>$1</h3>' },
        { regex: /^## (.*$)/gim, replacement: '<h2>$1</h2>' },
        { regex: /^# (.*$)/gim, replacement: '<h1>$1</h1>' },
        { regex: /\*\*(.*?)\*\*/gim, replacement: '<strong>$1</strong>' },
        { regex: /\*(.*?)\*/gim, replacement: '<em>$1</em>' },
        { regex: /!(.*?)(.*?)/gim, replacement: '<img alt="$1" src="$2">' },
        { regex: /(.*?)(.*?)/gim, replacement: '<a href="$2">$1</a>' },
        { regex: /`{3}([\s\S]*?)`{3}/gim, replacement: '<pre><code>$1</code></pre>' },
        { regex: /`(.*?)`/gim, replacement: '<code>$1</code>' },
        { regex: /^> (.*$)/gim, replacement: '<blockquote>$1</blockquote>' },
        { regex: /^- (.*$)/gim, replacement: '<li>$1</li>' },
        { regex: /^\d+\. (.*$)/gim, replacement: '<li>$1</li>' },
        { regex: /\n\*\*\*/gim, replacement: '<hr>' },
        { regex: /\n-{3,}/gim, replacement: '<hr>' },
    ];

    // Apply all rules
    let html = markdown;

    for (const { regex, replacement } of rules) {
        html = html.replace(regex, replacement);
    }

    // Wrap list items with <ul> or <ol>
    html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>');
    html = html.replace(/(<ul>(<li>.*<\/li>)+<\/ul>)/gim, '$1');

    // Remove extra newlines
    html = html.replace(/\n{2,}/g, '<br><br>');

    return html.trim();
}

// Usage example
document.getElementById('convertBtn').addEventListener('click', () => {
    const input = document.getElementById('markdownInput').value;
    const output = markdownToHtml(input);
    document.getElementById('output').innerHTML = output;
});
