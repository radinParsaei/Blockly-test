define("ace/snippets/javascript",["require","exports","module"],function(e,t,n){"use strict";t.snippetText=`
# Variable
snippet variable
	var \${1:variable_name} = \${2:value}

snippet setVariable
	\${1?:variable_name} = \${2:value}

snippet declareVariable
	var \${1?:variable_name}

# Print
snippet print
	print \${1:value}

# Function
snippet function
	func \${1:function_name}(\${2:arguments}) {
		\${3:// body...}
	}
# if
snippet if
	if \${1:true} {
		\${0}
	}
# if ... else
snippet ifelse
	if (\${1:true}) {
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
	while (\${1:/* condition */}) {
		\${0:/* code */}
	}
`,t.scope="javascript"});                (function() {
                    window.require(["ace/snippets/javascript"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
