import org.teavm.jso.JSBody;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;

public class BlockTool {
    int blockCount = 0;
    private final ArrayList<String> variables = new ArrayList<>();
    private final StringBuilder functions = new StringBuilder();
    private static boolean parentIsExecuteValue = false;
    private final HashMap<String, ArrayList<String>> functionParameters = new HashMap<>();
    private final LinkedHashMap<String, String> variables1 = new LinkedHashMap<>();
    private String lastFunctionName = null;

//    private String getVariableName(String name) {
//        String[] tmp = name.split(":");
//        if ((name.startsWith("#C") || name.startsWith("#F")) && lastFunctionName != null &&
//                functionParameters.get(lastFunctionName.split(":")[0]) != null &&
//                functionParameters.get(lastFunctionName.split(":")[0]).contains(tmp[tmp.length - 1])) {
//            return tmp[tmp.length - 1];
//        }
//        if (variables1.containsKey(name)) return variables1.get(name);
//        String name1 = tmp[tmp.length - 1];
//        String name2 = name1;
//        int counter = 0;
//        for (Map.Entry<String, String> entry : variables1.entrySet()) {
//            if (entry.getValue().equals(name2)) {
//                counter++;
//                name2 = name1 + counter;
//            }
//        }
//        if (counter != 0) {
//            name1 += counter;
//        }
//        variables1.put(name, name1);
//        return name1;
//    }

    @JSBody(params = { "functionName" }, script = "return functions[functionName] || null")
    public static native String getFunctionBlock(String functionName);

    @JSBody(params = { "variableName" }, script = "allVariables.push([variableName, variableName])")
    public static native String addVariableName(String variableName);

    private String putVales(ValueBase val) {
        if (val instanceof SyntaxTree.Number) {
            return "<block type=\"math_number\"><field name=\"NUM\">" + val + "</field></block>";
        } else if (val instanceof SyntaxTree.Null) {
            return "<block type=\"logic_null\"></block>";
        } else if (val instanceof SyntaxTree.Text) {
            return "<block type=\"text\"><field name=\"TEXT\">" + ("" + val).replace("\n", "\\n")
                    .replace("\f", "\\f").replace("\t", "\\t").replace("\r", "\\r")
                    .replace("\b", "\\b").replace("\"", "\\") + "</field></block>";
        } else if (val instanceof SyntaxTree.Boolean) {
            return "<block type=\"logic_boolean\"><field name=\"BOOL\">" + (((Boolean)val.getData())? "TRUE":"FALSE") + "</field></block>";
        } else if (val instanceof SyntaxTree.Add) {
            return "<block type=\"math_arithmetic\"><field name=\"OP\">ADD</field><value name=\"A\">" +
                    putVales(((SyntaxTree.Add) val).getV1()) + "</value><value name=\"B\">" +
                    putVales(((SyntaxTree.Add) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.Sub) {
            return "<block type=\"math_arithmetic\"><field name=\"OP\">MINUS</field><value name=\"A\">" +
                    putVales(((SyntaxTree.Sub) val).getV1()) + "</value><value name=\"B\">" +
                    putVales(((SyntaxTree.Sub) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.Mul) {
            return "<block type=\"math_arithmetic\"><field name=\"OP\">MULTIPLY</field><value name=\"A\">" +
                    putVales(((SyntaxTree.Mul) val).getV1()) + "</value><value name=\"B\">" +
                    putVales(((SyntaxTree.Mul) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.Div) {
            return "<block type=\"math_arithmetic\"><field name=\"OP\">DIVIDE</field><value name=\"A\">" +
                    putVales(((SyntaxTree.Div) val).getV1()) + "</value><value name=\"B\">" +
                    putVales(((SyntaxTree.Div) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.Mod) {
            return "<block type=\"math_modulo\"><value name=\"DIVIDEND\">" +
                    putVales(((SyntaxTree.Mod) val).getV1()) + "</value><value name=\"DIVISOR\">" +
                    putVales(((SyntaxTree.Mod) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.Pow) {
            return "<block type=\"math_arithmetic\"><field name=\"OP\">POWER</field><value name=\"A\">" +
                    putVales(((SyntaxTree.Pow) val).getV1()) + "</value><value name=\"B\">" +
                    putVales(((SyntaxTree.Pow) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.Variable) {
            String[] variableName = ((SyntaxTree.Variable) val).getVariableName().split(":");
            addVariableName(variableName[variableName.length - 1]);
            return "<block type=\"variable_get\"><field name=\"NAME\">" + variableName[variableName.length - 1] + "</field></block>";
        } else if (val instanceof SyntaxTree.Equals) {
            if (((SyntaxTree.Equals) val).getV1() instanceof SyntaxTree.Text && ((SyntaxTree.Equals) val).getV1().toString().equals("") &&
                    !(((SyntaxTree.Equals) val).getV2() instanceof SyntaxTree.Number || ((SyntaxTree.Equals) val).getV2() instanceof SyntaxTree.Boolean)) {
                return "<block type=\"text_isEmpty\"><value name=\"VALUE\">" +
                        putVales(((SyntaxTree.Equals) val).getV2()) + "</value></block>";
            } else if (((SyntaxTree.Equals) val).getV2() instanceof SyntaxTree.Text && ((SyntaxTree.Equals) val).getV2().toString().equals("") &&
                    !(((SyntaxTree.Equals) val).getV1() instanceof SyntaxTree.Number || ((SyntaxTree.Equals) val).getV1() instanceof SyntaxTree.Boolean)) {
                return "<block type=\"text_isEmpty\"><value name=\"VALUE\">" +
                        putVales(((SyntaxTree.Equals) val).getV1()) + "</value></block>";
            } else {
                return "<block type=\"logic_compare\"><field name=\"OP\">EQ</field><value name=\"A\">" +
                        putVales(((SyntaxTree.Equals) val).getV1()) + "</value><value name=\"B\">" +
                        putVales(((SyntaxTree.Equals) val).getV2()) + "</value></block>";
            }
        } else if (val instanceof SyntaxTree.GreaterThan) {
            return "<block type=\"logic_compare\"><field name=\"OP\">GT</field><value name=\"A\">" +
                    putVales(((SyntaxTree.GreaterThan) val).getV1()) + "</value><value name=\"B\">" +
                    putVales(((SyntaxTree.GreaterThan) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.LesserThan) {
            return "<block type=\"logic_compare\"><field name=\"OP\">LT</field><value name=\"A\">" +
                    putVales(((SyntaxTree.LesserThan) val).getV1()) + "</value><value name=\"B\">" +
                    putVales(((SyntaxTree.LesserThan) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.GreaterThanOrEqual) {
            return "<block type=\"logic_compare\"><field name=\"OP\">GTE</field><value name=\"A\">" +
                    putVales(((SyntaxTree.GreaterThanOrEqual) val).getV1()) + "</value><value name=\"B\">" +
                    putVales(((SyntaxTree.GreaterThanOrEqual) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.LesserThanOrEqual) {
            return "<block type=\"logic_compare\"><field name=\"OP\">LTE</field><value name=\"A\">" +
                    putVales(((SyntaxTree.LesserThanOrEqual) val).getV1()) + "</value><value name=\"B\">" +
                    putVales(((SyntaxTree.LesserThanOrEqual) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.Not) {
            if (((SyntaxTree.Not) val).getValue() instanceof SyntaxTree.Equals) {
                return "<block type=\"logic_compare\"><field name=\"OP\">NEQ</field><value name=\"A\">" +
                        putVales(((SyntaxTree.Equals) ((SyntaxTree.Not) val).getValue()).getV1()) + "</value><value name=\"B\">" +
                        putVales(((SyntaxTree.Equals) ((SyntaxTree.Not) val).getValue()).getV2()) + "</value></block>";
            }
        } else if (val instanceof SyntaxTree.CallFunction) {
            String functionName = ((SyntaxTree.CallFunction) val).getFunctionName().split(":")[0];
            ((SyntaxTree.CallFunction) val).findFunction();
            StringBuilder tmp = new StringBuilder("<block type=\"");
            if (getFunctionBlock(((SyntaxTree.CallFunction) val).getFunctionName()) == null) {
                if (parentIsExecuteValue)
                    tmp.append("procedures_callnoreturn");
                else
                    tmp.append("procedures_callreturn");
                tmp.append("\"><mutation name=\"").append(functionName).append("\">");
                StringBuilder args = new StringBuilder();
                int counter = 0;
                for (String i : functionParameters.get(functionName)) {
                    args.append("<value name=\"ARG").append(counter).append("\">")
                            .append(putVales(((SyntaxTree.SetVariable)((SyntaxTree.CallFunction) val).getVariableSetters()[counter]).getVariableValue()))
                            .append("</value>");
                    tmp.append("<arg name=\"").append(i).append("\"></arg>");
                    counter++;
                }
                tmp.append("</mutation>").append(args);
                if (parentIsExecuteValue) blockCount++;
                else tmp.append("</block>");
            } else {
                tmp.append(getFunctionBlock(((SyntaxTree.CallFunction) val).getFunctionName())).append("\">");
                int counter = 0;
                for (ProgramBase value : ((SyntaxTree.CallFunction) val).getVariableSetters()) {
                    if (((SyntaxTree.SetVariable) value).getVariableValue() instanceof SyntaxTree.Lambda) {
                        int pBlockCount = blockCount;
                        tmp.append("<statement name=\"ARG").append(counter++).append("\">")
                                .append(syntaxTreeToBlocksXML(((SyntaxTree.Lambda) ((SyntaxTree.SetVariable) value).getVariableValue()).getCreateLambda().getProgram(), false))
                                .append("</statement>");
                        blockCount = pBlockCount;
                    } else {
                        tmp.append("<value name=\"ARG").append(counter++).append("\">")
                                .append(putVales(((SyntaxTree.SetVariable) value).getVariableValue())).append("</value>");
                    }
                }
                if (parentIsExecuteValue)
                    blockCount++;
                else
                    tmp.append("</block>");
            }
            return tmp.toString();
        }
        return "";
    }

    public String syntaxTreeToBlocksXML(ProgramBase program, boolean addXml) {
        StringBuilder tmp = new StringBuilder((addXml? "<xml xmlns=\"https://developers.google.com/blockly/xml\">" : ""));
        String xml = syntaxTreeToBlocksXML1(program);
        if (addXml) tmp.append(functions.toString());
        tmp.append(xml);
        blockCount--;
        for (int i = 0; i < blockCount; i++) {
            tmp.append("</block></next>");
        }
        if (blockCount >= 0) tmp.append("</block>");
        tmp.append(addXml? "</xml>":"");
        return tmp.toString().replace("<next><next>", "<next>");
    }

    public String syntaxTreeToBlocksXML(ProgramBase program) {
        StringBuilder tmp = new StringBuilder("<xml xmlns=\"https://developers.google.com/blockly/xml\">");
        String xml = syntaxTreeToBlocksXML1(program);
        tmp.append(functions.toString());
        tmp.append(xml);
        blockCount--;
        for (int i = 0; i < blockCount; i++) {
            tmp.append("</block></next>");
        }
        if (blockCount >= 0) tmp.append("</block>");
        tmp.append("</xml>");
        return tmp.toString().replace("<next><next>", "<next>");
    }

    public String syntaxTreeToBlocksXML1(ProgramBase program) {
        StringBuilder result;
        if (blockCount != 0 && !(program instanceof SyntaxTree.Function) && !(program instanceof SyntaxTree.ExecuteValue)) {
            result = new StringBuilder("<next>");
        } else {
            result = new StringBuilder();
        }
        if (program instanceof SyntaxTree.Programs) {
            for (ProgramBase program1 : ((SyntaxTree.Programs) program).getPrograms()) {
                result.append(syntaxTreeToBlocksXML1(program1));
                if (program1 instanceof SyntaxTree.Return || program1 instanceof SyntaxTree.Break || program1 instanceof SyntaxTree.Continue) break;
            }
        } else if (program instanceof SyntaxTree.Print) {
            ValueBase[] args = ((SyntaxTree.Print) program).getArgs();
            for (int i = 0; i < args.length; i++) {
                result.append("<block type=\"text_print\">" + "<value name=\"TEXT\">").append(putVales(args[i]))
                        .append("</value>");
                blockCount++;
                if (i < args.length - 1) {
                    result.append("<next><block type=\"text_print\">" + "<value name=\"TEXT\">").append(putVales(((SyntaxTree.Print) program).getSeparator()))
                            .append("</value>");
                    blockCount++;
                }
            }
        } else if (program instanceof SyntaxTree.SetVariable) {
            String[] variableName = ((SyntaxTree.SetVariable) program).getVariableName().split(":");
            if (((SyntaxTree.SetVariable) program).getIsDeclaration()) {
                addVariableName(variableName[variableName.length - 1]);
                result.append("<block type=\"variable_declare\"><field name=\"NAME\">").append(variableName[variableName.length - 1])
                        .append("</field>");
                if (!(((SyntaxTree.SetVariable) program).getVariableValue() instanceof SyntaxTree.Null)) {
                    result.append("<mutation hasValue=\"1\"></mutation>").append("<value name=\"VALUE\">")
                            .append(putVales(((SyntaxTree.SetVariable) program).getVariableValue())).append("</value>");
                }
            } else {
                result.append("<block type=\"variable_set\"><field name=\"NAME\">").append(variableName[variableName.length - 1])
                        .append("</field><value name=\"DATA\">").append(putVales(((SyntaxTree.SetVariable) program).getVariableValue()))
                        .append("</value>");
            }
            blockCount++;
        } else if (program instanceof SyntaxTree.ExecuteValue) {
            parentIsExecuteValue = true;
            if (blockCount != 0) {
                blockCount--;
                for (int i = 0; i < blockCount; i++) {
                    result.append("</block></next>");
                }
                result.append("</block>");
            }
            result.append(putVales(((SyntaxTree.ExecuteValue) program).getValue()));
            parentIsExecuteValue = false;
        } else if (program instanceof SyntaxTree.Return) {
            result.append("<block type=\"return_statement\"><value name=\"VALUE\">")
                    .append(putVales(((SyntaxTree.Return) program).getValue())).append("</value>");
            blockCount++;
        } else if (program instanceof SyntaxTree.Break) {
            result.append("<block type=\"control_break\">");
            blockCount++;
        } else if (program instanceof SyntaxTree.Continue) {
            result.append("<block type=\"control_continue\">");
            blockCount++;
        } else if (program instanceof SyntaxTree.If) {
            int pBlockCount = blockCount;
            blockCount = 0;
            int blocks = 1;
            result.append("<block type=\"logic_if\"><value name=\"ARG0\">")
                    .append(putVales(((SyntaxTree.If) program).getCondition())).append("</value>")
                    .append("<statement name=\"ARG1\">").append(syntaxTreeToBlocksXML(((SyntaxTree.If) program).getProgram(), false))
                    .append("</statement>");
            if (((SyntaxTree.If) program).getElseProgram() != null) {
                if (((SyntaxTree.If) program).getElseProgram() instanceof SyntaxTree.If) {
                    SyntaxTree.If tmp = (SyntaxTree.If) program;
                    while (tmp.getElseProgram() instanceof SyntaxTree.If) {
                        blockCount = 0;
                        tmp = (SyntaxTree.If) tmp.getElseProgram();
                        result.append("<next><block type=\"logic_elseif\"><value name=\"ARG0\">")
                                .append(putVales(tmp.getCondition())).append("</value>")
                                .append("<statement name=\"ARG1\">").append(syntaxTreeToBlocksXML(tmp.getProgram(), false))
                                .append("</statement>");
                        blocks++;
                    }
                    if (tmp.getElseProgram() != null) {
                        blockCount = 0;
                        result.append("<next>").append("<block type=\"logic_else\">").append("<statement name=\"ARG0\">")
                                .append(syntaxTreeToBlocksXML(tmp.getElseProgram(), false)).append("</statement>");
                        blocks++;
                    }
                } else {
                    blockCount = 0;
                    result.append("<next>").append("<block type=\"logic_else\">").append("<statement name=\"ARG0\">")
                            .append(syntaxTreeToBlocksXML(((SyntaxTree.If) program).getElseProgram(), false)).append("</statement>");
                    blocks++;
                }
            }
            blockCount = pBlockCount + blocks;
        } else if (program instanceof SyntaxTree.While) {
            int pBlockCount = blockCount;
            blockCount = 0;
            result.append("<block type=\"loops_while\"><value name=\"ARG0\">").append(putVales(((SyntaxTree.While) program).getCondition()))
                    .append("</value><statement name=\"ARG1\">").append(syntaxTreeToBlocksXML(((SyntaxTree.While) program).getProgram(), false))
                    .append("</statement>");
            blockCount = pBlockCount + 1;
        } else if (program instanceof SyntaxTree.Function) {
            if (getFunctionBlock((((SyntaxTree.Function) program).getFunctionName())) == null) {
                lastFunctionName = ((SyntaxTree.Function) program).getFunctionName();
                boolean hasReturn = hasReturn(((SyntaxTree.Function) program).getProgram());
                if (!functionParameters.containsKey(((SyntaxTree.Function) program).getFunctionName())) {
                    functionParameters.put(((SyntaxTree.Function) program).getFunctionName().split(":")[0], new ArrayList<>());
                }
                if (hasReturn) {
                    functions.append("<block type=\"procedures_defreturn\"><mutation>");
                    for (String i : ((SyntaxTree.Function) program).getArgs()) {
                        functionParameters.get(((SyntaxTree.Function) program).getFunctionName().split(":")[0]).add(i);
                        functions.append("<arg name=\"").append(i).append("\"></arg>");
                        addVariableName(i);
                    }
                    int pBlockCount = blockCount;
                    blockCount = 0;
                    functions.append("</mutation>").append("<field name=\"NAME\">").append(((SyntaxTree.Function) program)
                            .getFunctionName().split(":")[0]).append("</field><statement name=\"STACK\">")
                            .append(syntaxTreeToBlocksXML(((SyntaxTree.Function) program).getProgram(), false)).append("</statement></block>");
                    blockCount = pBlockCount;
                } else {
                    functions.append("<block type=\"procedures_defnoreturn\"><mutation>");
                    for (String i : ((SyntaxTree.Function) program).getArgs()) {
                        functionParameters.get(((SyntaxTree.Function) program).getFunctionName().split(":")[0]).add(i);
                        functions.append("<arg name=\"").append(i).append("\"></arg>");
                        addVariableName(i);
                    }
                    int pBlockCount = blockCount;
                    blockCount = 0;
                    functions.append("</mutation><field name=\"NAME\">").append(((SyntaxTree.Function) program).getFunctionName().split(":")[0])
                            .append("</field><statement name=\"STACK\">").append(syntaxTreeToBlocksXML(((SyntaxTree.Function) program).getProgram(), false))
                            .append("</statement></block>");
                    blockCount = pBlockCount;
                }
                lastFunctionName = null;
            }
        }
        return result.toString();
    }

    private boolean hasReturn(ProgramBase program) {
        boolean hasReturn = false;
        if (program instanceof SyntaxTree.Programs) {
            for (ProgramBase program1 : ((SyntaxTree.Programs) program).getPrograms()) {
                hasReturn |= hasReturn(program1);
            }
        } else return program instanceof SyntaxTree.Return;
        return hasReturn;
    }
}