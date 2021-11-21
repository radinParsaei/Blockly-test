import org.teavm.jso.JSBody;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
//import java.util.LinkedHashMap;

public class BlockTool {
    int blockCount = 0;
//    private final ArrayList<String> variables = new ArrayList<>();
    private final StringBuilder functions = new StringBuilder();
    private static boolean parentIsExecuteValue = false;
    private final HashMap<String, ArrayList<String>> functionParameters = new HashMap<>();
//    private final LinkedHashMap<String, String> variables1 = new LinkedHashMap<>();
    private String lastFunctionName = null;
    private String parentClassName = null;
    private final StringBuilder nakedValues = new StringBuilder();
    static final HashMap<String, ArrayList<String>> importedFunctionParameters = new HashMap<>();
    private Analyzer analyzer;

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

    private String putValue(ValueBase val) {
        if (val instanceof SyntaxTree.Number) {
            return "<block type=\"math_number\"><field name=\"NUM\">" + val + "</field></block>";
        } else if (val instanceof SyntaxTree.Null) {
            return "<block type=\"logic_null\"></block>";
        } else if (val instanceof SyntaxTree.Text) {
            return "<block type=\"text\"><field name=\"TEXT\">" + ("" + val).replace("\n", "\\n")
                    .replace("\f", "\\f").replace("\t", "\\t").replace("\r", "\\r")
                    .replace("\b", "\\b").replace("\"", "\\").replace("\\", "\\\\") + "</field></block>";
        } else if (val instanceof SyntaxTree.Increase) {
            if (parentIsExecuteValue) {
                SyntaxTree.SetVariable setVariable = ((SyntaxTree.Increase) val).getVariableSetter();
                setVariable.setVariableValue(new SyntaxTree.Add(((SyntaxTree.Increase) val).getVariable(), new SyntaxTree.Number(1)));
                return syntaxTreeToBlocksXML1(setVariable);
            }
            if (((SyntaxTree.Increase) val).isPostfix()) {
                return "<block type=\"math_increase\"><field name=\"ARG1\">++</field><value name=\"ARG0\">" +
                        putValue(((SyntaxTree.Increase) val).getVariable()) + "</value></block>";
            } else {
                return "<block type=\"math_increase_prefix\"><field name=\"ARG1\">++</field><value name=\"ARG0\">" +
                        putValue(((SyntaxTree.Increase) val).getVariable()) + "</value></block>";
            }
        } else if (val instanceof SyntaxTree.Decrease) {
            if (parentIsExecuteValue) {
                SyntaxTree.SetVariable setVariable = ((SyntaxTree.Decrease) val).getVariableSetter();
                setVariable.setVariableValue(new SyntaxTree.Sub(((SyntaxTree.Decrease) val).getVariable(), new SyntaxTree.Number(1)));
                return syntaxTreeToBlocksXML1(setVariable);
            }
            if (((SyntaxTree.Decrease) val).isPostfix()) {
                return "<block type=\"math_increase\"><field name=\"ARG1\">--</field><value name=\"ARG0\">" +
                        putValue(((SyntaxTree.Decrease) val).getVariable()) + "</value></block>";
            } else {
                return "<block type=\"math_increase_prefix\"><field name=\"ARG1\">--</field><value name=\"ARG0\">" +
                        putValue(((SyntaxTree.Decrease) val).getVariable()) + "</value></block>";
            }
        } else if (val instanceof SyntaxTree.CreateInstance) {
            if (analyzer.matches(val, Analyzer.INSTANCE) &&
                    analyzer.getPossibleInstanceNames(val).size() == 1 && analyzer.getPossibleInstanceNames(val).get(0).matches("%Array")) {
                ArrayList<ValueBase> values = (ArrayList<ValueBase>) ((SyntaxTree.CreateInstance) val).getArgs()[0].getData();
                StringBuilder stringBuilder = new StringBuilder("<block type=\"lists_create_with\"><mutation items=\"").append(values.size()).append("\"></mutation>");
                for (int i = 0; i < values.size(); i++) {
                    stringBuilder.append("<value name=\"ADD").append(i).append("\">").append(putValue(values.get(i))).append("</value>");
                }
                return stringBuilder.append("</block>").toString();
            } else {
                StringBuilder tmp = new StringBuilder("<block type=\"create_instance\"><field name=\"NAME\">")
                        .append(((SyntaxTree.CreateInstance) val).getClassName()).append("</field><mutation items=\"")
                        .append(((SyntaxTree.CreateInstance) val).getArgs().length).append("\"></mutation>");
                int i = 0;
                for (ValueBase value : ((SyntaxTree.CreateInstance) val).getArgs()) {
                    tmp.append("<value name=\"ARG").append(i++).append("\">").append(putValue(value)).append("</value>");
                }
                return tmp.append("</block>").toString();
            }
        } else if (val instanceof SyntaxTree.Boolean) {
            return "<block type=\"logic_boolean\"><field name=\"BOOL\">" + (((Boolean)val.getData())? "TRUE":"FALSE") + "</field></block>";
        } else if (val instanceof SyntaxTree.Add) {
            return "<block type=\"math_arithmetic\"><field name=\"OP\">ADD</field><value name=\"A\">" +
                    putValue(((SyntaxTree.Add) val).getV1()) + "</value><value name=\"B\">" +
                    putValue(((SyntaxTree.Add) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.Sub) {
            return "<block type=\"math_arithmetic\"><field name=\"OP\">MINUS</field><value name=\"A\">" +
                    putValue(((SyntaxTree.Sub) val).getV1()) + "</value><value name=\"B\">" +
                    putValue(((SyntaxTree.Sub) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.Mul) {
            return "<block type=\"math_arithmetic\"><field name=\"OP\">MULTIPLY</field><value name=\"A\">" +
                    putValue(((SyntaxTree.Mul) val).getV1()) + "</value><value name=\"B\">" +
                    putValue(((SyntaxTree.Mul) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.Div) {
            return "<block type=\"math_arithmetic\"><field name=\"OP\">DIVIDE</field><value name=\"A\">" +
                    putValue(((SyntaxTree.Div) val).getV1()) + "</value><value name=\"B\">" +
                    putValue(((SyntaxTree.Div) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.Mod) {
            return "<block type=\"math_modulo\"><value name=\"DIVIDEND\">" +
                    putValue(((SyntaxTree.Mod) val).getV1()) + "</value><value name=\"DIVISOR\">" +
                    putValue(((SyntaxTree.Mod) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.Pow) {
            return "<block type=\"math_arithmetic\"><field name=\"OP\">POWER</field><value name=\"A\">" +
                    putValue(((SyntaxTree.Pow) val).getV1()) + "</value><value name=\"B\">" +
                    putValue(((SyntaxTree.Pow) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.Negative) {
            if (((SyntaxTree.Negative) val).getValue() instanceof SyntaxTree.Text) {
                return "<block type=\"text_reverse\"><value name=\"ARG0\">" +
                        putValue(((SyntaxTree.Negative) val).getValue()) + "</value></block>";
            }
            return "<block type=\"math_negative\"><value name=\"ARG0\">" + putValue(((SyntaxTree.Negative) val).getValue())
                    + "</value></block>";
        } else if (val instanceof SyntaxTree.PrintFunction) {
            parentIsExecuteValue = false;
            return syntaxTreeToBlocksXML1(((SyntaxTree.PrintFunction) val).getProgram());
        } else if (val instanceof SyntaxTree.Variable) {
            String[] varName = ((SyntaxTree.Variable) val).getVariableName().replace("#C", "").split("#");
            if (((SyntaxTree.Variable) val).getVariableName().startsWith("#C") && SyntaxTree.staticParameters.contains(((SyntaxTree.Variable) val).getVariableName())) {
                return "<block type=\"class_get_static_property\"><field name=\"CLASS\">" + varName[0] +
                        "</field><field name=\"NAME\">" + varName[1] + "</field></block>";
            }
            if (((SyntaxTree.Variable) val).getInstance() != null) {
                return "<block type=\"class_get_property\"><field name=\"NAME\">" + ((SyntaxTree.Variable) val).getVariableName() +
                        "</field><value name=\"INSTANCE\">" + putValue(((SyntaxTree.Variable) val).getInstance()) + "</value></block>";
            }
            String[] variableName = ((SyntaxTree.Variable) val).getVariableName().split(":");
            addVariableName(variableName[variableName.length - 1]);
            return "<block type=\"variable_get\"><field name=\"NAME\">" + variableName[variableName.length - 1] + "</field></block>";
        } else if (val instanceof SyntaxTree.Equals) {
            return "<block type=\"logic_compare_advanced\"><field name=\"OP\">EQ</field><value name=\"ARG0\">" +
                    putValue(((SyntaxTree.Equals) val).getV1()) + "</value><value name=\"ARG1\">" +
                    putValue(((SyntaxTree.Equals) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.StrictEquals) {
            return "<block type=\"logic_compare\"><field name=\"OP\">EQ</field><value name=\"A\">" +
                    putValue(((SyntaxTree.StrictEquals) val).getV1()) + "</value><value name=\"B\">" +
                    putValue(((SyntaxTree.StrictEquals) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.GreaterThan) {
            return "<block type=\"logic_compare\"><field name=\"OP\">GT</field><value name=\"A\">" +
                    putValue(((SyntaxTree.GreaterThan) val).getV1()) + "</value><value name=\"B\">" +
                    putValue(((SyntaxTree.GreaterThan) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.LesserThan) {
            return "<block type=\"logic_compare\"><field name=\"OP\">LT</field><value name=\"A\">" +
                    putValue(((SyntaxTree.LesserThan) val).getV1()) + "</value><value name=\"B\">" +
                    putValue(((SyntaxTree.LesserThan) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.GreaterThanOrEqual) {
            return "<block type=\"logic_compare\"><field name=\"OP\">GTE</field><value name=\"A\">" +
                    putValue(((SyntaxTree.GreaterThanOrEqual) val).getV1()) + "</value><value name=\"B\">" +
                    putValue(((SyntaxTree.GreaterThanOrEqual) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.LesserThanOrEqual) {
            return "<block type=\"logic_compare\"><field name=\"OP\">LTE</field><value name=\"A\">" +
                    putValue(((SyntaxTree.LesserThanOrEqual) val).getV1()) + "</value><value name=\"B\">" +
                    putValue(((SyntaxTree.LesserThanOrEqual) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.And) {
            return "<block type=\"logic_operation\"><field name=\"OP\">AND</field><value name=\"A\">" +
                    putValue(((SyntaxTree.And) val).getV1()) + "</value><value name=\"B\">" +
                    putValue(((SyntaxTree.And) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.Or) {
            return "<block type=\"logic_operation\"><field name=\"OP\">OR</field><value name=\"A\">" +
                    putValue(((SyntaxTree.Or) val).getV1()) + "</value><value name=\"B\">" +
                    putValue(((SyntaxTree.Or) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.BitwiseAnd) {
            return "<block type=\"logic_operation_advanced\"><field name=\"OP\">AND</field><value name=\"ARG0\">" +
                    putValue(((SyntaxTree.BitwiseAnd) val).getV1()) + "</value><value name=\"ARG1\">" +
                    putValue(((SyntaxTree.BitwiseAnd) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.BitwiseOr) {
            return "<block type=\"logic_operation_advanced\"><field name=\"OP\">OR</field><value name=\"ARG0\">" +
                    putValue(((SyntaxTree.BitwiseOr) val).getV1()) + "</value><value name=\"ARG1\">" +
                    putValue(((SyntaxTree.BitwiseOr) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.BitwiseNot) {
            return "<block type=\"logic_bitwise_not\"><value name=\"ARG0\">" +
                    putValue(((SyntaxTree.BitwiseNot) val).getValue()) + "</value></block>";
        } else if (val instanceof SyntaxTree.LeftShift) {
            return "<block type=\"math_shift\"><field name=\"ARG1\">LEFT</field><value name=\"ARG0\">" +
                    putValue(((SyntaxTree.LeftShift) val).getV1()) + "</value><value name=\"ARG2\">" +
                    putValue(((SyntaxTree.LeftShift) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.RightShift) {
            return "<block type=\"math_shift\"><field name=\"ARG1\">RIGHT</field><value name=\"ARG0\">" +
                    putValue(((SyntaxTree.RightShift) val).getV1()) + "</value><value name=\"ARG2\">" +
                    putValue(((SyntaxTree.RightShift) val).getV2()) + "</value></block>";
        } else if (val instanceof SyntaxTree.Not) {
            if (((SyntaxTree.Not) val).getValue() instanceof SyntaxTree.StrictEquals) {
                return "<block type=\"logic_compare\"><field name=\"OP\">NEQ</field><value name=\"A\">" +
                        putValue(((SyntaxTree.StrictEquals) ((SyntaxTree.Not) val).getValue()).getV1()) + "</value><value name=\"B\">" +
                        putValue(((SyntaxTree.StrictEquals) ((SyntaxTree.Not) val).getValue()).getV2()) + "</value></block>";
            } else if (((SyntaxTree.Not) val).getValue() instanceof SyntaxTree.Equals) {
                return "<block type=\"logic_compare_advanced\"><field name=\"OP\">NEQ</field><value name=\"ARG0\">" +
                        putValue(((SyntaxTree.Equals) ((SyntaxTree.Not) val).getValue()).getV1()) + "</value><value name=\"ARG1\">" +
                        putValue(((SyntaxTree.Equals) ((SyntaxTree.Not) val).getValue()).getV2()) + "</value></block>";
            } else {
                return "<block type=\"logic_negate\"><value name=\"BOOL\">" +
                        putValue(((SyntaxTree.Not) val).getValue()) + "</value></block>";
            }
        } else if (val instanceof SyntaxTree.CallFunction) {
            if (((SyntaxTree.CallFunction) val).getInstance() != null) {
                if (analyzer.matches(((SyntaxTree.CallFunction) val).getInstance(), Analyzer.TEXT)) {
                    if (((SyntaxTree.CallFunction) val).getFunctionName().equals("replace") && ((SyntaxTree.CallFunction) val).getArgs().length == 2) {
                            return "<block type=\"text_replace\"><value name=\"ARG2\">" +
                                    putValue(((SyntaxTree.CallFunction) val).getInstance()) + "</value><value name=\"ARG1\">" +
                                    putValue(((SyntaxTree.CallFunction) val).getArgs()[1]) + "</value><value name=\"ARG0\">" +
                                    putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) + "</value></block>";
                    } else if (((SyntaxTree.CallFunction) val).getFunctionName().equals("length") && ((SyntaxTree.CallFunction) val).getArgs().length == 0) {
                        return "<block type=\"text_length\"><value name=\"VALUE\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) + "</value></block>";
                    }  else if (((SyntaxTree.CallFunction) val).getFunctionName().equals("isEmpty") && ((SyntaxTree.CallFunction) val).getArgs().length == 0) {
                        return "<block type=\"text_isEmpty\"><value name=\"VALUE\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) + "</value></block>";
                    }  else if (((SyntaxTree.CallFunction) val).getFunctionName().equals("reverse") && ((SyntaxTree.CallFunction) val).getArgs().length == 0) {
                        return "<block type=\"text_reverse\"><value name=\"ARG0\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) + "</value></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("toUpper") ||
                            ((SyntaxTree.CallFunction) val).getFunctionName().equals("toUpperCase")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 0) {
                        return "<block type=\"text_changeCase\"><value name=\"TEXT\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                "</value><field name=\"CASE\">UPPERCASE</field></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("toLower") ||
                            ((SyntaxTree.CallFunction) val).getFunctionName().equals("toLowerCase")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 0) {
                        return "<block type=\"text_changeCase\"><value name=\"TEXT\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                "</value><field name=\"CASE\">LOWERCASE</field></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("toTitleCase")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 0) {
                        return "<block type=\"text_changeCase\"><value name=\"TEXT\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                "</value><field name=\"CASE\">TITLECASE</field></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("trim")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 0) {
                        return "<block type=\"text_trim\"><value name=\"TEXT\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                "</value><field name=\"MODE\">BOTH</field></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("trimLeft")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 0) {
                        return "<block type=\"text_trim\"><value name=\"TEXT\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                "</value><field name=\"MODE\">LEFT</field></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("trimRight")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 0) {
                        return "<block type=\"text_trim\"><value name=\"TEXT\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                "</value><field name=\"MODE\">RIGHT</field></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("substring")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 2) {
                        return "<block type=\"text_substring\"><value name=\"ARG0\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                "</value><value name=\"ARG1\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) +
                                "</value><value name=\"ARG2\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[1]) + "</value></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("substring")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 1) {
                        return "<block type=\"text_substring1\"><value name=\"ARG0\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                "</value><value name=\"ARG1\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) +
                                "</value></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("startsWith")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 1) {
                        return "<block type=\"text_startsWith\"><value name=\"ARG0\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                "</value><value name=\"ARG1\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) +
                                "</value></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("endsWith")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 1) {
                        return "<block type=\"text_endsWith\"><value name=\"ARG0\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                "</value><value name=\"ARG1\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) +
                                "</value></block>";
                    } else if (((((SyntaxTree.CallFunction) val).getFunctionName().equals("getLastCharacter")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 0)||
                            ((((SyntaxTree.CallFunction) val).getFunctionName().equals("charAtFromEnd")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 1 &&
                            ((SyntaxTree.CallFunction) val).getArgs()[0] instanceof SyntaxTree.Number &&
                            ((BigDecimal) ((SyntaxTree.CallFunction) val).getArgs()[0].getData()).intValue() == 0)) {
                        return "<block type=\"text_charAt\"><mutation at=\"false\"></mutation><field name=\"WHERE\">LAST</field><value name=\"VALUE\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) + "</value></block>";
                    } else if (((((SyntaxTree.CallFunction) val).getFunctionName().equals("getFirstCharacter")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 0) ||
                            ((((SyntaxTree.CallFunction) val).getFunctionName().equals("charAt")) &&
                                    ((SyntaxTree.CallFunction) val).getArgs().length == 1 &&
                                    ((SyntaxTree.CallFunction) val).getArgs()[0] instanceof SyntaxTree.Number &&
                                    ((BigDecimal) ((SyntaxTree.CallFunction) val).getArgs()[0].getData()).intValue() == 0)) {
                        return "<block type=\"text_charAt\"><mutation at=\"false\"></mutation><field name=\"WHERE\">FIRST</field><value name=\"VALUE\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) + "</value></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("getRandomCharacter")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 0) {
                        return "<block type=\"text_charAt\"><mutation at=\"false\"></mutation><field name=\"WHERE\">RANDOM</field><value name=\"VALUE\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) + "</value></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("charAt")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 1) {
                        return "<block type=\"text_charAt\"><mutation at=\"true\"></mutation><field name=\"WHERE\">FROM_START</field><value name=\"VALUE\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                "</value><value name=\"AT\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) +
                                "</value></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("charAtFromEnd")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 1) {
                        return "<block type=\"text_charAt\"><mutation at=\"true\"></mutation><field name=\"WHERE\">FROM_END</field><value name=\"VALUE\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                "</value><value name=\"AT\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) +
                                "</value></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("codePointAt")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 1) {
                        return "<block type=\"text_codePointAt\"><value name=\"ARG1\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                "</value><value name=\"ARG0\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) +
                                "</value></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("equalsIgnoreCase")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 1) {
                        return "<block type=\"text_equalsIgnoreCase\"><value name=\"ARG1\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                "</value><value name=\"ARG0\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) +
                                "</value></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("matches")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 1) {
                        return "<block type=\"text_matches\"><value name=\"ARG0\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                "</value><value name=\"ARG1\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) +
                                "</value></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("contains") || (((SyntaxTree.CallFunction) val).getFunctionName().equals("includes"))) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 1) {
                        return "<block type=\"text_contains\"><value name=\"ARG0\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                "</value><value name=\"ARG1\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) +
                                "</value></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("indexOf")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 1) {
                        return "<block type=\"text_indexOf\"><field name=\"END\">FIRST</field><value name=\"VALUE\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                "</value><value name=\"FIND\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) +
                                "</value></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("indexOf")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 2) {
                        return "<block type=\"text_indexOf\"><mutation hasFromIndex=\"1\"></mutation><field name=\"END\">FIRST</field><value name=\"VALUE\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                "</value><value name=\"FIND\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) +
                                "</value><value name=\"INDEX\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[1]) + "</value></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("lastIndexOf")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 1) {
                        return "<block type=\"text_indexOf\"><field name=\"END\">LAST</field><value name=\"VALUE\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                "</value><value name=\"FIND\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) +
                                "</value></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("lastIndexOf")) &&
                            ((SyntaxTree.CallFunction) val).getArgs().length == 2) {
                        return "<block type=\"text_indexOf\"><mutation hasFromIndex=\"1\"></mutation><field name=\"END\">LAST</field><value name=\"VALUE\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                "</value><value name=\"FIND\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) +
                                "</value><value name=\"INDEX\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[1]) + "</value></block>";
                    }
                } else if (analyzer.matches(((SyntaxTree.CallFunction) val).getInstance(), Analyzer.INSTANCE) &&
                        analyzer.getPossibleInstanceNames(((SyntaxTree.CallFunction) val).getInstance()).size() == 1 &&
                        analyzer.getPossibleInstanceNames(((SyntaxTree.CallFunction) val).getInstance()).get(0).equals("%Array")) {
                     if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("getFirstItem") && ((SyntaxTree.CallFunction) val).getArgs().length == 0) ||
                             ((SyntaxTree.CallFunction) val).getFunctionName().equals("get") && ((SyntaxTree.CallFunction) val).getArgs().length == 1 &&
                             ((SyntaxTree.CallFunction) val).getArgs()[0] instanceof SyntaxTree.Number &&
                             ((SyntaxTree.CallFunction) val).getArgs()[0].toString().equals("0")) {
                        return "<block type=\"lists_getIndex\"><mutation statement=\"false\" at=\"false\"></mutation><field name=\"WHERE\">FIRST</field><value name=\"VALUE\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) + "</value></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("getLastItem") && ((SyntaxTree.CallFunction) val).getArgs().length == 0) ||
                             ((SyntaxTree.CallFunction) val).getFunctionName().equals("getFromEnd") && ((SyntaxTree.CallFunction) val).getArgs().length == 1 &&
                             ((SyntaxTree.CallFunction) val).getArgs()[0] instanceof SyntaxTree.Number &&
                             ((SyntaxTree.CallFunction) val).getArgs()[0].toString().equals("0")) {
                        return "<block type=\"lists_getIndex\"><mutation statement=\"false\" at=\"false\"></mutation><field name=\"WHERE\">LAST</field><value name=\"VALUE\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) + "</value></block>";
                    } else if (((SyntaxTree.CallFunction) val).getFunctionName().equals("get") && ((SyntaxTree.CallFunction) val).getArgs().length == 1) {
                        return "<block type=\"lists_getIndex\"><mutation statement=\"false\" at=\"true\"></mutation><field name=\"WHERE\">FROM_START</field><value name=\"VALUE\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) + "</value><value name=\"AT\">" +
                                putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) + "</value></block>";
                    } else if (((SyntaxTree.CallFunction) val).getFunctionName().equals("getFromEnd") && ((SyntaxTree.CallFunction) val).getArgs().length == 1) {
                        return "<block type=\"lists_getIndex\"><mutation statement=\"false\" at=\"true\"></mutation><field name=\"WHERE\">FROM_END</field><value name=\"VALUE\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) + "</value><value name=\"AT\">" +
                                putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) + "</value></block>";
                    } else if (((SyntaxTree.CallFunction) val).getFunctionName().equals("getRandomItem") && ((SyntaxTree.CallFunction) val).getArgs().length == 0) {
                         return "<block type=\"lists_getIndex\"><mutation statement=\"false\" at=\"false\"></mutation><field name=\"WHERE\">RANDOM</field><value name=\"VALUE\">" +
                                 putValue(((SyntaxTree.CallFunction) val).getInstance()) + "</value></block>";
                    } else if (((SyntaxTree.CallFunction) val).getFunctionName().equals("append") && ((SyntaxTree.CallFunction) val).getArgs().length == 1) {
                         blockCount++;
                         return "<block type=\"lists_append\"><value name=\"ARG1\">" +
                                 putValue(((SyntaxTree.CallFunction) val).getInstance()) + "</value><value name=\"ARG0\">" +
                                 putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) + "</value>";
                    } else if (((SyntaxTree.CallFunction) val).getFunctionName().equals("insert") && ((SyntaxTree.CallFunction) val).getArgs().length == 2) {
                         blockCount++;
                         return "<block type=\"lists_insert\"><value name=\"ARG2\">" +
                                 putValue(((SyntaxTree.CallFunction) val).getInstance()) + "</value><value name=\"ARG1\">" +
                                 putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) + "</value><value name=\"ARG0\">" +
                                 putValue(((SyntaxTree.CallFunction) val).getArgs()[1]) + "</value>";
                    } else if (((SyntaxTree.CallFunction) val).getFunctionName().equals("length") && ((SyntaxTree.CallFunction) val).getArgs().length == 0) {
                         return "<block type=\"lists_length\"><value name=\"VALUE\">" +
                                 putValue(((SyntaxTree.CallFunction) val).getInstance()) + "</value></block>";
                    } else if (((SyntaxTree.CallFunction) val).getFunctionName().equals("reverse") && ((SyntaxTree.CallFunction) val).getArgs().length == 0) {
                         blockCount++;
                         return "<block type=\"lists_reverse\"><value name=\"ARG0\">" +
                                 putValue(((SyntaxTree.CallFunction) val).getInstance()) + "</value>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("indexOf")) &&
                             ((SyntaxTree.CallFunction) val).getArgs().length == 1) {
                         return "<block type=\"lists_indexOf\"><field name=\"END\">FIRST</field><value name=\"VALUE\">" +
                                 putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                 "</value><value name=\"FIND\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) +
                                 "</value></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("indexOf")) &&
                             ((SyntaxTree.CallFunction) val).getArgs().length == 2) {
                         return "<block type=\"lists_indexOf\"><mutation hasFromIndex=\"1\"></mutation><field name=\"END\">FIRST</field><value name=\"VALUE\">" +
                                 putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                 "</value><value name=\"FIND\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) +
                                 "</value><value name=\"INDEX\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[1]) + "</value></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("lastIndexOf")) &&
                             ((SyntaxTree.CallFunction) val).getArgs().length == 1) {
                         return "<block type=\"lists_indexOf\"><field name=\"END\">LAST</field><value name=\"VALUE\">" +
                                 putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                 "</value><value name=\"FIND\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) +
                                 "</value></block>";
                    } else if ((((SyntaxTree.CallFunction) val).getFunctionName().equals("lastIndexOf")) &&
                             ((SyntaxTree.CallFunction) val).getArgs().length == 2) {
                         return "<block type=\"lists_indexOf\"><mutation hasFromIndex=\"1\"></mutation><field name=\"END\">LAST</field><value name=\"VALUE\">" +
                                 putValue(((SyntaxTree.CallFunction) val).getInstance()) +
                                 "</value><value name=\"FIND\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) +
                                 "</value><value name=\"INDEX\">" + putValue(((SyntaxTree.CallFunction) val).getArgs()[1]) + "</value></block>";
                    } else if (((SyntaxTree.CallFunction) val).getFunctionName().equals("sort") && ((SyntaxTree.CallFunction) val).getArgs().length == 0) {
                         blockCount++;
                         return "<block type=\"lists_sort\"><value name=\"ARG0\">" +
                                 putValue(((SyntaxTree.CallFunction) val).getInstance()) + "</value>";
                     } else if (((SyntaxTree.CallFunction) val).getFunctionName().equals("numericSort") && ((SyntaxTree.CallFunction) val).getArgs().length == 0) {
                         blockCount++;
                         return "<block type=\"lists_sort_numeric\"><value name=\"ARG0\">" +
                                 putValue(((SyntaxTree.CallFunction) val).getInstance()) + "</value>";
                     } else if (((SyntaxTree.CallFunction) val).getFunctionName().equals("isEmpty") && ((SyntaxTree.CallFunction) val).getArgs().length == 0) {
                         return "<block type=\"lists_isEmpty\"><value name=\"VALUE\">" +
                                 putValue(((SyntaxTree.CallFunction) val).getInstance()) + "</value></block>";
                    } else if (((SyntaxTree.CallFunction) val).getFunctionName().equals("set") && ((SyntaxTree.CallFunction) val).getArgs().length == 2) {
                        blockCount++;
                        return "<block type=\"lists_setIndex\"><mutation at=\"true\"></mutation><value name=\"LIST\">" +
                                putValue(((SyntaxTree.CallFunction) val).getInstance()) + "</value><value name=\"AT\">" +
                                putValue(((SyntaxTree.CallFunction) val).getArgs()[0]) + "</value><value name=\"TO\">" +
                                putValue(((SyntaxTree.CallFunction) val).getArgs()[1]) + "</value>";
                    }
                } else {
                    if (parentIsExecuteValue) {
                        StringBuilder stringBuilder = new StringBuilder("<block type=\"class_call_method_statement\"><mutation items=\"")
                                .append(((SyntaxTree.CallFunction) val).getArgs().length).append("\"></mutation><field name=\"NAME\">")
                                .append(((SyntaxTree.CallFunction) val).getFunctionName()).append("</field><value name=\"INSTANCE\">")
                                .append(putValue(((SyntaxTree.CallFunction) val).getInstance())).append("</value>");
                        for (int i = 0; i < ((SyntaxTree.CallFunction) val).getArgs().length; i++) {
                            stringBuilder.append("<value name=\"ARG").append(i).append("\">")
                                    .append(putValue(((SyntaxTree.CallFunction) val).getArgs()[i])).append("</value>");
                        }
                        blockCount++;
                        return stringBuilder.toString();
                    } else {
                        StringBuilder stringBuilder = new StringBuilder("<block type=\"class_call_method\"><mutation items=\"")
                                .append(((SyntaxTree.CallFunction) val).getArgs().length).append("\"></mutation><field name=\"NAME\">")
                                .append(((SyntaxTree.CallFunction) val).getFunctionName()).append("</field><value name=\"INSTANCE\">")
                                .append(putValue(((SyntaxTree.CallFunction) val).getInstance())).append("</value>");
                        for (int i = 0; i < ((SyntaxTree.CallFunction) val).getArgs().length; i++) {
                            stringBuilder.append("<value name=\"ARG").append(i).append("\">")
                                    .append(putValue(((SyntaxTree.CallFunction) val).getArgs()[i])).append("</value>");
                        }
                        return stringBuilder.append("</block>").toString();
                    }
                }
            }
            String functionName = ((SyntaxTree.CallFunction) val).getFunctionName().split(":")[0];
            if (!analyzer.functionExists(functionName, ((SyntaxTree.CallFunction) val).getArgs().length)) {
                functionParameters.put(functionName + ((SyntaxTree.CallFunction) val).getArgs().length, new ArrayList<>());
                String[] a = new String[((SyntaxTree.CallFunction) val).getArgs().length];
                for (int i = 0; i < a.length; i++) {
                    a[i] = ((char) ('a' + i)) + "";
                    functionParameters.get(functionName + ((SyntaxTree.CallFunction) val).getArgs().length).add(a[i]);
                }
                // TODO: Ensure the function won't be created on other lines
                SyntaxTree.Function func = new SyntaxTree.Function(((SyntaxTree.CallFunction) val).getFunctionName(), new SyntaxTree.Programs(), a);
                func.eval();
                syntaxTreeToBlocksXML1(func);
            }
            ((SyntaxTree.CallFunction) val).findFunction();
            StringBuilder tmp = new StringBuilder("<block type=\"");
            if (((SyntaxTree.CallFunction) val).getFunctionName().startsWith("#C") && SyntaxTree.staticFunctions.contains(((SyntaxTree.CallFunction) val).getFunctionName()) && getFunctionBlock(((SyntaxTree.CallFunction) val).getFunctionName()) == null) {
                if (parentIsExecuteValue) {
                    StringBuilder stringBuilder = new StringBuilder("<block type=\"class_call_static_method_statement\"><mutation items=\"")
                            .append(((SyntaxTree.CallFunction) val).getArgs().length).append("\"></mutation><field name=\"NAME\">")
                            .append(((SyntaxTree.CallFunction) val).getFunctionName().replace("#C", "").split("#")[1].split(":")[0])
                            .append("</field><field name=\"CLASS\">")
                            .append(((SyntaxTree.CallFunction) val).getFunctionName().replace("#C", "").split("#")[0])
                            .append("</field>");
                    for (int i = 0; i < ((SyntaxTree.CallFunction) val).getArgs().length; i++) {
                        stringBuilder.append("<value name=\"ARG").append(i).append("\">")
                                .append(putValue(((SyntaxTree.CallFunction) val).getArgs()[i])).append("</value>");
                    }
                    blockCount++;
                    return stringBuilder.toString();
                } else {
                    StringBuilder stringBuilder = new StringBuilder("<block type=\"class_call_static_method\"><mutation items=\"")
                            .append(((SyntaxTree.CallFunction) val).getArgs().length).append("\"></mutation><field name=\"NAME\">")
                            .append(((SyntaxTree.CallFunction) val).getFunctionName().replace("#C", "").split("#")[1].split(":")[0])
                            .append("</field><field name=\"CLASS\">")
                            .append(((SyntaxTree.CallFunction) val).getFunctionName().replace("#C", "").split("#")[0])
                            .append("</field>");
                    for (int i = 0; i < ((SyntaxTree.CallFunction) val).getArgs().length; i++) {
                        stringBuilder.append("<value name=\"ARG").append(i).append("\">")
                                .append(putValue(((SyntaxTree.CallFunction) val).getArgs()[i])).append("</value>");
                    }
                    return stringBuilder.append("</block>").toString();
                }
            }
            if (((SyntaxTree.CallFunction) val).isNativeFunction() && ((SyntaxTree.CallFunction) val).getFunctionName().equals("input:N#0#input")) {
                return tmp.append("text_input\"></block>").toString();
            } else if (((SyntaxTree.CallFunction) val).isNativeFunction() && ((SyntaxTree.CallFunction) val).getFunctionName().equals("input:N#0#input")) {
                return tmp.append("text_input\"></block>").toString();
            }
            if (getFunctionBlock(((SyntaxTree.CallFunction) val).getFunctionName()) == null) {
                if (parentIsExecuteValue)
                    tmp.append("procedures_callnoreturn");
                else
                    tmp.append("procedures_callreturn");
                tmp.append("\"><mutation name=\"").append(functionName).append("\">");
                StringBuilder args = new StringBuilder();
                int counter = 0;
                if (((SyntaxTree.CallFunction) val).getFunctionName().contains(",")) {
                    for (String i : ((SyntaxTree.CallFunction) val).getFunctionName().split(":")[1].split(",")) {
                        if (i.equals("")) continue;
                        args.append("<value name=\"ARG").append(counter).append("\">")
                                .append(putValue(((SyntaxTree.SetVariable) ((SyntaxTree.CallFunction) val).getVariableSetters()[counter]).getVariableValue()))
                                .append("</value>");
                        tmp.append("<arg name=\"").append(i).append("\"></arg>");
                        counter++;
                    }
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
                                .append(putValue(((SyntaxTree.SetVariable) value).getVariableValue())).append("</value>");
                    }
                }
                if (parentIsExecuteValue)
                    blockCount++;
                else
                    tmp.append("</block>");
            }
            return tmp.toString();
        } else if (val instanceof SyntaxTree.AwaitedValue) {
            return putValue(((SyntaxTree.AwaitedValue) val).fetchValue());
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
        if (addXml) tmp.append(nakedValues);
        tmp.append(addXml? "</xml>":"");
        return tmp.toString().replace("<next><next>", "<next>");
    }

    public String syntaxTreeToBlocksXML(ProgramBase program) {
        analyzer = new Analyzer(program);
        for (Map.Entry<String, ArrayList<String>> entry : importedFunctionParameters.entrySet())
            functionParameters.put(entry.getKey(), entry.getValue());
        StringBuilder tmp = new StringBuilder("<xml xmlns=\"https://developers.google.com/blockly/xml\">");
        String xml = "<block type=\"main_entry\"><statement name=\"STACK\">" + syntaxTreeToBlocksXML1(program);
        tmp.append(functions.toString());
        tmp.append(xml);
        blockCount--;
        for (int i = 0; i < blockCount; i++) {
            tmp.append("</block></next>");
        }
        if (blockCount >= 0) tmp.append("</block>");
        tmp.append("</statement></block>").append(nakedValues.toString()).append("</xml>");
        return tmp.toString().replace("<next><next>", "<next>");
    }

    public String syntaxTreeToBlocksXML1(ProgramBase program) {
        StringBuilder result;
        if (blockCount != 0 && (!(program instanceof SyntaxTree.Function) || parentClassName != null) &&
                (!(program instanceof SyntaxTree.CreateClass)) && (!(program instanceof SyntaxTree.ExecuteValue) ||
                executeValueNeedsNext((SyntaxTree.ExecuteValue) program)) && !(program instanceof SyntaxTree.AwaitedProgram)) {
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
                result.append("<block type=\"text_print\">" + "<value name=\"TEXT\">").append(putValue(args[i]))
                        .append("</value>");
                blockCount++;
                if (i < args.length - 1) {
                    result.append("<next><block type=\"text_print\">" + "<value name=\"TEXT\">").append(putValue(((SyntaxTree.Print) program).getSeparator()))
                            .append("</value>");
                    blockCount++;
                }
            }
        } else if (program instanceof SyntaxTree.AwaitedProgram) {
            return syntaxTreeToBlocksXML1(((SyntaxTree.AwaitedProgram) program).fetchProgram());
        } else if (program instanceof SyntaxTree.SetVariable) {
            if (((SyntaxTree.SetVariable) program).getInstance() != null) {
                result.append("<block type=\"class_set_property\"><field name=\"NAME\">")
                        .append(((SyntaxTree.SetVariable) program).getVariableName())
                        .append("</field><value name=\"INSTANCE\">")
                        .append(putValue(((SyntaxTree.SetVariable) program).getInstance()))
                        .append("</value><value name=\"VALUE\">")
                        .append(putValue(((SyntaxTree.SetVariable) program).getVariableValue())).append("</value>");
            } else {
                String[] varName = ((SyntaxTree.SetVariable) program).getVariableName().replace("#C", "").split("#");
                if (((SyntaxTree.SetVariable) program).getVariableName().startsWith("#C") &&
                        SyntaxTree.staticParameters.contains(((SyntaxTree.SetVariable) program).getVariableName()) &&
                        !((SyntaxTree.SetVariable) program).isStatic()) {
                    result.append("<block type=\"class_set_static_property\"><field name=\"CLASS\">").append(varName[0])
                            .append("</field><field name=\"NAME\">").append(varName[1]).append("</field><value name=\"VALUE\">")
                            .append(putValue(((SyntaxTree.SetVariable) program).getVariableValue())).append("</value>");
                } else {
                    String[] variableName = ((SyntaxTree.SetVariable) program).getVariableName().split(":");
                    if (parentClassName != null)
                        variableName[variableName.length - 1] = variableName[variableName.length - 1].replace("#C" + parentClassName + "#", "");
                    if (((SyntaxTree.SetVariable) program).getIsDeclaration()) {
                        addVariableName(variableName[variableName.length - 1]);
                        result.append("<block type=\"").append(((SyntaxTree.SetVariable) program).isStatic() ? "class_declare_static_property" : "variable_declare").append("\"><field name=\"NAME\">").append(variableName[variableName.length - 1])
                                .append("</field>");
                        if (!(((SyntaxTree.SetVariable) program).getVariableValue() instanceof SyntaxTree.Null)) {
                            result.append("<mutation hasValue=\"1\"></mutation>").append("<value name=\"VALUE\">")
                                    .append(putValue(((SyntaxTree.SetVariable) program).getVariableValue())).append("</value>");
                        }
                    } else {
                        result.append("<block type=\"variable_set\"><field name=\"NAME\">").append(variableName[variableName.length - 1])
                                .append("</field><value name=\"DATA\">").append(putValue(((SyntaxTree.SetVariable) program).getVariableValue()))
                                .append("</value>");
                    }
                }
            }
            blockCount++;
        } else if (program instanceof SyntaxTree.ExecuteValue) {
            parentIsExecuteValue = true;
            if (((SyntaxTree.ExecuteValue) program).getValue() instanceof SyntaxTree.Increase ||
                    ((SyntaxTree.ExecuteValue) program).getValue() instanceof SyntaxTree.Decrease) {
                result.append(putValue(((SyntaxTree.ExecuteValue) program).getValue()));
            } else {
                boolean isInstanceOfArray = (((SyntaxTree.ExecuteValue) program).getValue() instanceof SyntaxTree.CallFunction &&
                        (((SyntaxTree.CallFunction) ((SyntaxTree.ExecuteValue) program).getValue()).getInstance() != null) &&
                        analyzer.matches(((SyntaxTree.CallFunction) ((SyntaxTree.ExecuteValue) program).getValue()).getInstance(), Analyzer.INSTANCE) &&
                        analyzer.getPossibleInstanceNames(((SyntaxTree.CallFunction) ((SyntaxTree.ExecuteValue) program).getValue()).getInstance()).size() == 1 &&
                        analyzer.getPossibleInstanceNames(((SyntaxTree.CallFunction) ((SyntaxTree.ExecuteValue) program).getValue()).getInstance()).get(0).equals("%Array"));
                if (isInstanceOfArray || !(((SyntaxTree.ExecuteValue) program).getValue() instanceof SyntaxTree.CallFunction ||
                        ((SyntaxTree.ExecuteValue) program).getValue() instanceof SyntaxTree.PrintFunction ||
                        ((SyntaxTree.ExecuteValue) program).getValue() instanceof SyntaxTree.ExitFunction ||
                        ((SyntaxTree.ExecuteValue) program).getValue() instanceof SyntaxTree.AwaitedValue) ||
                        (((SyntaxTree.ExecuteValue) program).getValue() instanceof SyntaxTree.CallFunction &&
                                analyzer.matches(((SyntaxTree.CallFunction) ((SyntaxTree.ExecuteValue) program).getValue()).getInstance(), Analyzer.TEXT))) {
                    if (isInstanceOfArray && !((SyntaxTree.CallFunction) ((SyntaxTree.ExecuteValue) program).getValue()).getFunctionName().matches("get|length|indexOf|getFromEnd|getRandomItem|getFirstItem|getLastItem|isEmpty")) {
                        result.append(putValue(((SyntaxTree.ExecuteValue) program).getValue()));
                    } else {
                        nakedValues.append(putValue(((SyntaxTree.ExecuteValue) program).getValue()));
                    }
                } else {
                    result.append(putValue(((SyntaxTree.ExecuteValue) program).getValue()));
                }
            }
            parentIsExecuteValue = false;
        } else if (program instanceof SyntaxTree.Return) {
            result.append("<block type=\"return_statement\"><value name=\"VALUE\">")
                    .append(putValue(((SyntaxTree.Return) program).getValue())).append("</value>");
            blockCount++;
        } else if (program instanceof SyntaxTree.Break) {
            result.append("<block type=\"control_break\">");
            blockCount++;
        } else if (program instanceof SyntaxTree.Continue) {
            result.append("<block type=\"control_continue\">");
            blockCount++;
        } else if (program instanceof SyntaxTree.Import) {
            Client.Compile.exportFunctionsAndVariables(((SyntaxTree.Import) program).getProgram());
            result.append("<block type=\"import\"><field name=\"NAME\">").append(((SyntaxTree.Import) program).getFileName()).append("</field>");
            blockCount++;
            for (Map.Entry<String, ArrayList<String>> entry : importedFunctionParameters.entrySet()) {
                functionParameters.put(entry.getKey(), entry.getValue());
            }
        } else if (program instanceof SyntaxTree.If) {
            int pBlockCount = blockCount;
            blockCount = 0;
            int blocks = 1;
            result.append("<block type=\"logic_if\"><value name=\"ARG0\">")
                    .append(putValue(((SyntaxTree.If) program).getCondition())).append("</value>")
                    .append("<statement name=\"ARG1\">").append(syntaxTreeToBlocksXML(((SyntaxTree.If) program).getProgram(), false))
                    .append("</statement>");
            if (((SyntaxTree.If) program).getElseProgram() != null) {
                if (((SyntaxTree.If) program).getElseProgram() instanceof SyntaxTree.If) {
                    SyntaxTree.If tmp = (SyntaxTree.If) program;
                    while (tmp.getElseProgram() instanceof SyntaxTree.If) {
                        blockCount = 0;
                        tmp = (SyntaxTree.If) tmp.getElseProgram();
                        result.append("<next><block type=\"logic_elseif\"><value name=\"ARG0\">")
                                .append(putValue(tmp.getCondition())).append("</value>")
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
            result.append("<block type=\"loops_while\"><value name=\"ARG0\">").append(putValue(((SyntaxTree.While) program).getCondition()))
                    .append("</value><statement name=\"ARG1\">").append(syntaxTreeToBlocksXML(((SyntaxTree.While) program).getProgram(), false))
                    .append("</statement>");
            blockCount = pBlockCount + 1;
        } else if (program instanceof SyntaxTree.CreateClass && !((SyntaxTree.CreateClass) program).getClassName().startsWith("%")) {
            parentClassName = ((SyntaxTree.CreateClass) program).getClassName();
            int pBlockCount = blockCount;
            blockCount = 0;
            functions.append("<block type=\"create_class\"><field name=\"NAME\">").append(((SyntaxTree.CreateClass) program).getClassName())
                    .append("</field>").append("<statement name=\"ARG0\">").append(syntaxTreeToBlocksXML(((SyntaxTree.CreateClass) program).getPrograms(), false))
                    .append("</statement></block>");
            blockCount = pBlockCount;
            parentClassName = null;
        } else if (program instanceof SyntaxTree.Function) {
            if (getFunctionBlock((((SyntaxTree.Function) program).getFunctionName())) == null) {
                lastFunctionName = ((SyntaxTree.Function) program).getFunctionName();
//                boolean hasReturn = hasReturn(((SyntaxTree.Function) program).getProgram());
                if (!functionParameters.containsKey(((SyntaxTree.Function) program).getFunctionName() + ((SyntaxTree.Function) program).getArgs().length)) {
                    functionParameters.put(((SyntaxTree.Function) program).getFunctionName().split(":")[0] + ((SyntaxTree.Function) program).getArgs().length, new ArrayList<>());
                }
                StringBuilder functions;
                if (parentClassName == null) {
                    functions = this.functions;
                } else {
                    functions = result;
                }
//                if (hasReturn) {
                    functions.append("<block type=\"procedures_defreturn").append(((SyntaxTree.Function) program).isStatic()? "_static":"").append(parentClassName != null? "_method" : "").append("\"><mutation>");
                    for (String i : ((SyntaxTree.Function) program).getArgs()) {
                        functionParameters.get(((SyntaxTree.Function) program).getFunctionName().split(":")[0] + ((SyntaxTree.Function) program).getArgs().length).add(i);
                        functions.append("<arg name=\"").append(i).append("\"></arg>");
                        addVariableName(i);
                    }
                    int pBlockCount = blockCount;
                    blockCount = 0;
                    String functionName = ((SyntaxTree.Function) program).getFunctionName().split(":")[0];
                    if (parentClassName != null) functionName = functionName.replace("#C" + parentClassName + "#", "");
                    functions.append("</mutation>").append("<field name=\"NAME\">").append(functionName).append("</field><statement name=\"STACK\">")
                            .append(syntaxTreeToBlocksXML(((SyntaxTree.Function) program).getProgram(), false)).append("</statement>").append(parentClassName == null? "</block>":"");
                    blockCount = pBlockCount;
                    if (parentClassName != null) blockCount++;
//                } else {
//                    functions.append("<block type=\"procedures_defnoreturn").append(parentClassName != null? "_method" : "").append("\"><mutation>");
//                    for (String i : ((SyntaxTree.Function) program).getArgs()) {
//                        functionParameters.get(((SyntaxTree.Function) program).getFunctionName().split(":")[0]).add(i);
//                        functions.append("<arg name=\"").append(i).append("\"></arg>");
//                        addVariableName(i);
//                    }
//                    int pBlockCount = blockCount;
//                    blockCount = 0;
//                    String functionName = ((SyntaxTree.Function) program).getFunctionName().split(":")[0];
//                    if (parentClassName != null) functionName = functionName.replace("#C" + parentClassName, "");
//                    functions.append("</mutation><field name=\"NAME\">").append(functionName)
//                            .append("</field><statement name=\"STACK\">").append(syntaxTreeToBlocksXML(((SyntaxTree.Function) program).getProgram(), false))
//                            .append("</statement>").append(parentClassName == null? "</block>":"");
//                    blockCount = pBlockCount;
//                    if (parentClassName != null) blockCount++;
//                }
                lastFunctionName = null;
            }
        }
        return result.toString();
    }

    private boolean executeValueNeedsNext(SyntaxTree.ExecuteValue program) {
        boolean isInstanceOfArray = (program.getValue() instanceof SyntaxTree.CallFunction &&
                analyzer.matches(((SyntaxTree.CallFunction) program.getValue()).getInstance(), Analyzer.INSTANCE) &&
                analyzer.getPossibleInstanceNames(((SyntaxTree.CallFunction) program.getValue()).getInstance()).size() == 1 &&
                analyzer.getPossibleInstanceNames(((SyntaxTree.CallFunction) program.getValue()).getInstance()).get(0).equals("%Array"));
        if (isInstanceOfArray || !(program.getValue() instanceof SyntaxTree.CallFunction ||
                program.getValue() instanceof SyntaxTree.PrintFunction ||
                program.getValue() instanceof SyntaxTree.ExitFunction ||
                program.getValue() instanceof SyntaxTree.AwaitedValue) ||
                (program.getValue() instanceof SyntaxTree.CallFunction &&
                        analyzer.matches(((SyntaxTree.CallFunction) program.getValue()).getInstance(), Analyzer.TEXT))) {
            return isInstanceOfArray && !((SyntaxTree.CallFunction) program.getValue()).getFunctionName().matches("get|length|indexOf|getFromEnd|getRandomItem|getFirstItem|getLastItem|isEmpty");
        } else {
            return true;
        }
    }

    static boolean hasReturn(ProgramBase program) {
        boolean hasReturn = false;
        if (program instanceof SyntaxTree.Programs) {
            for (ProgramBase program1 : ((SyntaxTree.Programs) program).getPrograms()) {
                hasReturn |= hasReturn(program1);
            }
        } else return program instanceof SyntaxTree.Return;
        return hasReturn;
    }
}