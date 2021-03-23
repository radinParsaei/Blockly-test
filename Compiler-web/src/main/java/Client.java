import org.teavm.jso.dom.html.HTMLDocument;
import org.teavm.jso.dom.html.HTMLElement;

public class Client extends CompilerMain {
//    private static boolean isFirst = true;
    public static void main(String[] args) {
        HTMLDocument document = HTMLDocument.current();
        HTMLElement button = document.getElementById("run");
        button.addEventListener("click", evt -> {
            SyntaxTree.setId(SyntaxTree.getId() + 1);
//            for (int i : Targets.getIntervalCodes()) {
//                Window.clearInterval(i);
//            }
            Compiler compiler = new Compiler(null, true, null, null, null, null);
            CustomCompileStep.used = false;
            REPLReader.setReadCode(false);
            Thread thread = new Thread(() -> {
                try {
                    Thread.sleep(50);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                SyntaxTree.getFunctions().clear();
                SyntaxTree.getVariables().clear();
                SyntaxTree.getClassesParameters().clear();
                SyntaxTree.CreateLambda.setCounter(0);
                SyntaxTree.resetNameSpaces();
                document.getElementById("console2").setInnerHTML("");
                compile(compiler);
                REPLReader.setReadCode(true);
                compile(compiler);
            });
            thread.start();
            new Thread(() -> {
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                CustomCompileStep.used = true;
            }).start();
        });

//        HTMLElement buttonTmp = document.getElementById("callColor");
//        buttonTmp.addEventListener("click", evt -> color());
//        color();
        HTMLElement buttonTmp = document.getElementById("genBlocks");
        buttonTmp.addEventListener("click", evt -> {
            Compiler compiler = new Compiler(null, true, null, null, null, null);
            SyntaxTree.getFunctions().clear();
            SyntaxTree.getVariables().clear();
            SyntaxTree.getClassesParameters().clear();
            SyntaxTree.CreateLambda.setCounter(0);
            Analyzer.clear();
            REPLReader.setReadCode(false);
            compile(compiler);
            REPLReader.setReadCode(true);
            CustomCompileStep.used = true;
            compile(compiler);
            CustomCompileStep.used = false;
        });
    }

//    public static void color() {
//        HTMLDocument document = HTMLDocument.current();
//        REPLReader.setReadCode(true);
//        String text = REPLReader.readLine();
//        REPLReader.setReadCode(false);
//        text = text.replace("<", "&lt;");
//        text = text.replace(">", "&gt;");
//        Compiler compiler = new Compiler(null, true, null, null, null);
//        Lexer lexer = new Lexer(compiler);
//        compiler.initLexer(lexer);
//        lexer.setError(false);
//        StringBuilder coloredText = new StringBuilder();
//        for (Token token : lexer.lex(text)) {
//            switch (token.getName()) {
//                case "TXT":
//                    coloredText.append("<font color=\"#7B986A\">").append(token.getText()).append("</font>");
//                    break;
//                case "NUM":
//                    coloredText.append("<font color=\"#6897BB\">").append(token.getText()).append("</font>");
//                    break;
//                case "PRINT":
//                case "IF":
//                case "ELSE":
//                case "FN":
//                case "VAR":
//                case "BOOL":
//                case "NULL":
//                case "RET":
//                case "WH":
//                    coloredText.append("<font color=\"#dc8842\">").append(token.getText()).append("</font>");
//                    break;
//                case "IGNORE":
//                    if (token.getText().trim().startsWith("//") || token.getText().trim().startsWith("/*"))
//                        coloredText.append("<font color=\"#808080\">").append(token.getText()).append("</font>");
//                    else
//                        coloredText.append(token.getText());
//                    break;
//                default:
//                    coloredText.append(token.getText());
//                    break;
//            }
//        }
//        document.getElementById("editor").setInnerHTML(coloredText.toString());
//        if (isFirst) {
//            isFirst = false;
//            return;
//        }
//        SyntaxTree.getFunctions().clear();
//        SyntaxTree.getVariables().clear();
//        SyntaxTree.getClassesParameters().clear();
//        SyntaxTree.CreateLambda.setCounter(0);
//        REPLReader.setReadCode(false);
//        compile(compiler);
//        REPLReader.setReadCode(true);
//        CustomCompileStep.used = true;
//        compile(compiler);
//        CustomCompileStep.used = false;
//    }
}