// Load Esprima parser
// Assumes Esprima is included via CDN in HTML

function convertJsToPython(jsCode) {
  let ast;
  try {
    ast = esprima.parseScript(jsCode);
  } catch (e) {
    return `Error parsing JavaScript: ${e.message}`;
  }

  let pythonCode = "";

  function walk(node, indent = "") {
    switch (node.type) {
      case "Program":
        node.body.forEach(statement => {
          pythonCode += walk(statement, indent) + "\n";
        });
        break;

      case "VariableDeclaration":
        node.declarations.forEach(decl => {
          pythonCode += indent + decl.id.name + " = " + walk(decl.init, indent);
        });
        break;

      case "Literal":
        return JSON.stringify(node.value);

      case "Identifier":
        return node.name;

      case "ExpressionStatement":
        return indent + walk(node.expression, indent);

      case "BinaryExpression":
        return `${walk(node.left)} ${node.operator} ${walk(node.right)}`;

      case "FunctionDeclaration":
        let params = node.params.map(p => p.name).join(", ");
        pythonCode += indent + `def ${node.id.name}(${params}):\n`;
        node.body.body.forEach(stmt => {
          pythonCode += walk(stmt, indent + "    ") + "\n";
        });
        break;

      case "ReturnStatement":
        return indent + "return " + walk(node.argument, indent);

      case "IfStatement":
        pythonCode += indent + "if " + walk(node.test) + ":\n";
        pythonCode += walk(node.consequent, indent + "   ") + "\n";
        if (node.alternate) {
          pythonCode += indent + "else:\n";
          pythonCode += walk(node.alternate, indent + "   ") + "\n";
        }
        break;

      case "BlockStatement":
        return node.body.map(stmt => walk(stmt, indent)).join("\n");

      case "WhileStatement":
        pythonCode += indent + "while " + walk(node.test) + ":\n";
        pythonCode += walk(node.body, indent + "   ") + "\n";
        break;

      case "ForStatement":
        // Simplified version - only handles numeric for-loops like for (let i = 0; i < 10; i++)
        let init = walk(node.init.declarations[0].init);
        let name = node.init.declarations[0].id.name;
        let end = walk(node.test.right);
        pythonCode += indent + `for ${name} in range(${init}, ${end}):\n`;
        pythonCode += walk(node.body, indent + "   ") + "\n";
        break;

      case "CallExpression":
        let args = node.arguments.map(a => walk(a)).join(", ");
        return `${walk(node.callee)}(${args})`;

      default:
        return indent + `# Unsupported node type: ${node.type}`;
    }
    return "";
  }

  walk(ast);
  return pythonCode.trim();
}

// UI Hook
document.querySelector('.convert-btn').addEventListener('click', async function () {
  const jsCode = document.querySelector('#js-input').value;
  const pyCode = convertJsToPython(jsCode);
  document.querySelector('#output').innerText = pyCode;

  // Optional Pyodide execution (if loaded and enabled)
  if (window.runPyodide === true) {
    try {
      const pyodide = await loadPyodide();
      const result = await pyodide.runPythonAsync(pyCode);
      document.querySelector('#py-output').innerText = "Execution Result:\n" + result;
    } catch (e) {
      document.querySelector('#py-output').innerText = "Error running Python:\n" + e.message;
    }
  }
});
