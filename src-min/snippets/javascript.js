define("ace/snippets/javascript",["require","exports","module"],function(e,t,n){"use strict";t.snippetText=`
# Variable
snippet variable
	var \${variable_name} = \${value}

snippet set variable
	variable = \${0:value}

snippet declare variable
	var \${0:variable_name}

# Print
snippet print
	print(\${0:value})

# Function
snippet function
	func \${1:function_name}(\${2:arguments}) {
		\${0:// body...}
	}
# if
snippet if
	if \${1:true} {
		\${0}
	}
# if ... else
snippet ifelse
	if \${1:true} {
		\${2}
	} else {
		\${0}
	}
# switch
#snippet switch
#	switch (\${1:expression}) {
#		case '\${3:case}':
#			\${4:// code}
#			break;
#		\${5}
#		default:
#			\${2:// code}
#	}
# case
#snippet case
#	case '\${1:case}':
#		\${2:// code}
#		break;
#	\${3}

# while (...) {...}
snippet while
	while \${1:true} {
		\${0}
	}

snippet break out of loop
	break
`,t.scope="javascript"});                (function() {
                    window.require(["ace/snippets/javascript"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
