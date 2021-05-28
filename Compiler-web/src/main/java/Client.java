import org.teavm.jso.JSBody;
import org.teavm.jso.JSObject;
import org.teavm.jso.dom.html.HTMLDocument;
import org.teavm.jso.dom.html.HTMLElement;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;

public class Client extends CompilerMain {
//    private static boolean isFirst = true;

    @JSBody(params = { "name", "value" }, script = "functionsInImportedFiles[name]=value")
    public static native String addImportedFunction(String name, boolean value);

    public interface CompileExport extends JSObject {
        void run();
        void clearImports();
        void parseImport(String fileName);
    }
    public static class Compile implements CompileExport {
        @Override
        public void run() {
            HTMLDocument document = HTMLDocument.current();
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
        }

        @Override
        public void parseImport(String fileName) {
            Compiler.parsingImportedFile = true;
            Compiler compiler = new Compiler(fileName, false, null, null, null, null);
            exportFunctionsAndVariables(compile(compiler).getTokens().get(0).getObject());
            Compiler.parsingImportedFile = false;
        }

        @Override
        public void clearImports() {
            BlockTool.importedFunctionParameters.clear();
        }

        static void exportFunctionsAndVariables(Object object) {
            if (object instanceof SyntaxTree.SetVariable && ((SyntaxTree.SetVariable) object).getIsDeclaration()) {

            } else if (object instanceof SyntaxTree.Function) {
                addImportedFunction(((SyntaxTree.Function) object).getFunctionName(), BlockTool.hasReturn(((SyntaxTree.Function) object).getProgram()));
                BlockTool.importedFunctionParameters.put(((SyntaxTree.Function) object).getFunctionName().split(":")[0], new ArrayList<>(Arrays.asList(((SyntaxTree.Function) object).getArgs())));
            } else if (object instanceof SyntaxTree.Programs) {
                for (ProgramBase program : ((SyntaxTree.Programs) object).getPrograms()) {
                    exportFunctionsAndVariables(program);
                }
            }
        }
    }

    @JSBody(params = { "name", "service" }, script = "window[name] = service;")
    private static native void export(String name, JSObject service);

    public static void main(String[] args) {
        export("Compiler", new Compile());
        HTMLDocument document = HTMLDocument.current();
//        HTMLElement button = document.getElementById("run");
//        button.addEventListener("click", evt -> {
//            SyntaxTree.setId(SyntaxTree.getId() + 1);
////            for (int i : Targets.getIntervalCodes()) {
////                Window.clearInterval(i);
////            }
//            Compiler compiler = new Compiler(null, true, null, null, null, null);
//            CustomCompileStep.used = false;
//            REPLReader.setReadCode(false);
//            Thread thread = new Thread(() -> {
//                try {
//                    Thread.sleep(50);
//                } catch (InterruptedException e) {
//                    e.printStackTrace();
//                }
//                SyntaxTree.getFunctions().clear();
//                SyntaxTree.getVariables().clear();
//                SyntaxTree.getClassesParameters().clear();
//                SyntaxTree.CreateLambda.setCounter(0);
//                SyntaxTree.resetNameSpaces();
//                document.getElementById("console2").setInnerHTML("");
//                compile(compiler);
//                REPLReader.setReadCode(true);
//                compile(compiler);
//            });
//            thread.start();
//            new Thread(() -> {
//                try {
//                    Thread.sleep(100);
//                } catch (InterruptedException e) {
//                    e.printStackTrace();
//                }
//                CustomCompileStep.used = true;
//            }).start();
//        });

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