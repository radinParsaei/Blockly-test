import org.teavm.jso.JSBody;
import org.teavm.jso.JSObject;
import org.teavm.jso.dom.html.HTMLDocument;

import java.util.ArrayList;
import java.util.Arrays;

public class Client extends CompilerMain {
    @JSBody(params = { "name", "value" }, script = "functionsInImportedFiles[name]=value")
    public static native void addImportedFunction(String name, boolean value);

    @JSBody(params = { "name" }, script = "variablesInImportedFiles.push(name)")
    public static native void addImportedVariable(String name);

    public interface CompileExport extends JSObject {
        void run();
        void clearImports();
        void parseImport(String fileName);
        void genBlocks();
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
                SyntaxTree.getClassesParameters().clear();
                SyntaxTree.getFunctions().clear();
                SyntaxTree.getVariables().clear();
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
        public void genBlocks() {
            Compiler compiler = new Compiler(null, true, null, null, null, null);
            SyntaxTree.getFunctions().clear();
            SyntaxTree.getVariables().clear();
            SyntaxTree.getClassesParameters().clear();
            SyntaxTree.CreateLambda.setCounter(0);
            CustomCompileStep.used = false;
            REPLReader.setReadCode(false);
            compile(compiler);
            SyntaxTree.getClassesParameters().clear();
            SyntaxTree.getFunctions().clear();
            SyntaxTree.getVariables().clear();
            REPLReader.setReadCode(true);
            CustomCompileStep.used = true;
            compile(compiler);
            CustomCompileStep.used = false;
        }

        @Override
        public void clearImports() {
            BlockTool.importedFunctionParameters.clear();
        }

        static void exportFunctionsAndVariables(Object object) {
            if (object instanceof SyntaxTree.SetVariable && ((SyntaxTree.SetVariable) object).getIsDeclaration()) {
                addImportedVariable(((SyntaxTree.SetVariable) object).getVariableName());
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
    }
}