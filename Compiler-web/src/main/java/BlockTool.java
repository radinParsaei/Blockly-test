import org.teavm.jso.JSBody;

public class BlockTool {
    int blockCount = 0;
    private static boolean addXml = true;

    @JSBody(params = { "functionName" }, script = "return functions[functionName] || null")
    public static native String getFunctionBlock(String functionName);

    private String putVals(ValueBase val) {
        if (val instanceof SyntaxTree.Number) {
            return "<block type=\"math_number\"><field name=\"NUM\">" + val + "</field></block>";
        } else if (val instanceof SyntaxTree.Text) {
            return "<block type=\"text\"><field name=\"TEXT\">" + val + "</field></block>";
        } else if (val instanceof SyntaxTree.CallFunction) {
            ((SyntaxTree.CallFunction) val).findFunction();
            StringBuilder tmp = new StringBuilder("<block type=\"");
            tmp.append(getFunctionBlock(((SyntaxTree.CallFunction) val).getFunctionName())).append("\">");
            int counter = 0;
            for (ProgramBase value : ((SyntaxTree.CallFunction) val).getVariableSetters()) {
                if (((SyntaxTree.SetVariable) value).getVariableValue() instanceof SyntaxTree.Lambda) {
                    addXml = false;
                    int pBlockCount = blockCount;
                    blockCount = 0;
                    tmp.append("<statement name=\"ARG").append(counter++).append("\">")
                            .append(syntaxTreeToBlocksXML(((SyntaxTree.Lambda) ((SyntaxTree.SetVariable) value).getVariableValue()).getCreateLambda().getProgram()))
                            .append("</statement>");
                    addXml = true;
                    blockCount = pBlockCount;
                } else {
                    tmp.append("<value name=\"ARG").append(counter++).append("\">")
                            .append(putVals(((SyntaxTree.SetVariable) value).getVariableValue())).append("</value>");
                }
            }
            blockCount++;
            return tmp.toString();
        }
        return "";
    }

    public String syntaxTreeToBlocksXML(ProgramBase program) {
        StringBuilder tmp = new StringBuilder((addXml? "<xml xmlns=\"https://developers.google.com/blockly/xml\">\n" : "") + syntaxTreeToBlocksXML1(program));
        blockCount--;
        for (int i = 0; i < blockCount; i++) {
            tmp.append("</block></next>");
        }
        if (blockCount >= 0) tmp.append("</block>");
        tmp.append(addXml? "</xml>":"");
        return tmp.toString();
    }

    public String syntaxTreeToBlocksXML1(ProgramBase program) {
        StringBuilder result;
        if (blockCount != 0) {
            result = new StringBuilder("<next>");
        } else {
            result = new StringBuilder();
        }
        if (program instanceof SyntaxTree.Programs) {
            for (ProgramBase program1 : ((SyntaxTree.Programs) program).getPrograms()) {
                result.append(syntaxTreeToBlocksXML1(program1));
            }
        } else if (program instanceof SyntaxTree.Print) {
            ValueBase[] args = ((SyntaxTree.Print) program).getArgs();
            for (int i = 0; i < args.length; i++) {
                result.append("<block type=\"text_print\">" + "<value name=\"TEXT\">").append(putVals(args[i]))
                        .append("</value>");
                blockCount++;
                if (i < args.length - 1) {
                    result.append("<next><block type=\"text_print\">" + "<value name=\"TEXT\">").append(putVals(((SyntaxTree.Print) program).getSeparator()))
                            .append("</value>");
                    blockCount++;
                }
            }
        } else if (program instanceof SyntaxTree.ExecuteValue) {
            result.append(putVals(((SyntaxTree.ExecuteValue) program).getValue()));
        }
        return result.toString();
    }
}