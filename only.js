function jsToPython(jsCode) {
    const ast = esprima.parseScript(jsCode);
    let pythonCode = '';
    let indent = 0;

    const tab = () => '    '.repeat(indent);

    const convertNode = (node) => {
        if (!node) return '';

        switch (node.type) {
            case 'Program':
                return node.body.map(convertNode).join('');

            case 'VariableDeclaration':
                return node.declarations.map(decl => {
                    return tab() + `${decl.id.name} = ${convertNode(decl.init)}\n`;
                }).join('');

            case 'Literal':
                return JSON.stringify(node.value);

            case 'Identifier':
                return node.name;

            case 'BinaryExpression':
                return `${convertNode(node.left)} ${node.operator} ${convertNode(node.right)}`;

            case 'FunctionDeclaration':
                let header = tab() + `def ${node.id.name}(${node.params.map(p => p.name).join(', ')}):\n`;
                indent++;
                let body = node.body.body.map(convertNode).join('');
                indent--;
                return header + body;

            case 'ReturnStatement':
                return tab() + `return ${convertNode(node.argument)}\n`;

            case 'ExpressionStatement':
                return tab() + convertNode(node.expression) + '\n';

            case 'CallExpression':
                if (node.callee.type === 'MemberExpression' && node.callee.object.name === 'console' && node.callee.property.name === 'log') {
                    return `print(${node.arguments.map(convertNode).join(', ')})`;
                }
                return `${convertNode(node.callee)}(${node.arguments.map(convertNode).join(', ')})`;

            case 'IfStatement':
                let test = convertNode(node.test);
                let ifBlock = tab() + `if ${test}:\n`;
                indent++;
                let consequent = convertNode(node.consequent);
                indent--;
                let alternate = node.alternate ? tab() + 'else:\n' + (indent++, convertNode(node.alternate), indent--) : '';
                return ifBlock + consequent + alternate;

            case 'BlockStatement':
                return node.body.map(convertNode).join('');

            case 'WhileStatement':
                let whileTest = convertNode(node.test);
                let whileHead = tab() + `while ${whileTest}:\n`;
                indent++;
                let whileBody = convertNode(node.body);
                indent--;
                return whileHead + whileBody;

            case 'ForStatement':
                let init = node.init.declarations[0];
                let varName = init.id.name;
                let start = convertNode(init.init);
                let end = convertNode(node.test.right);
                let forCode = tab() + `for ${varName} in range(${start}, ${end}):\n`;
                indent++;
                let forBody = convertNode(node.body);
                indent--;
                return forCode + forBody;

            default:
                return tab() + `# Unsupported: ${node.type}\n`;
        }
    };

    pythonCode = convertNode(ast);
    return pythonCode;
}

// Example usage:
const jsCode = `
function multiply(a, b) {
    return a * b;
}
var x = 10;
var y = 20;
console.log(multiply(x, y));

if (x < y) {
    console.log("x is less");
} else {
    console.log("x is not less");
}

for (var i = 0; i < 3; i++) {
    console.log(i);
}
`;

console.log(jsToPython(jsCode));
