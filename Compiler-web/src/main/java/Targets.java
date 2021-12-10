import org.teavm.jso.JSBody;
import org.teavm.jso.dom.html.HTMLDocument;
import org.teavm.jso.dom.html.HTMLElement;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class Targets {
    public static boolean awaitedInput = true;

    @JSBody(params = { "fileName" }, script = "if(!fileName.startsWith('/')){fileName=localStorage.getItem('currentDir')+fileName} try{return fs.readFileSync(fileName)+'\\n'}catch(e){if(document.getElementById('console2'))document.getElementById('console2').innerHTML+='<div style=\"color: #f55; position: relative\"><img src=\"test/error.png\" height=\"20\" style=\"padding-right: 10px\"><span style=\"position: absolute\">file ' + fileName + ' does not exist' + '</span></div>';return '\\n'}")
    public static native String readFile(String fileName);

//    private static final ArrayList<Integer> intervalCodes = new ArrayList<>();
    public static final boolean isWeb = true;
    public static final boolean isInThread = true;
    public static final boolean systemPrint = false;
    public static int count = 0;

//    public static ArrayList<Integer> getIntervalCodes() {
//        return intervalCodes;
//    }

    public static void print(ValueBase value) {
        HTMLDocument document = HTMLDocument.current();
        HTMLElement htmlParagraphElement = document.createElement("span");
        htmlParagraphElement.setInnerHTML(value.toString().replace("\n", "<br>").replace(" ", "&nbsp;"));
        document.getElementById("console2").appendChild(htmlParagraphElement);
    }

    public static void error(String error) {
        HTMLDocument document = HTMLDocument.current();
        HTMLElement htmlElement = document.getElementById("console2");
        if (htmlElement != null) {
            HTMLElement htmlParagraphElement = document.createElement("div");
            htmlParagraphElement.setInnerHTML("<img src=\"test/error.png\" height=\"20\"/><span style=\"position: absolute\">&nbsp;" + error.replace("\n", "<br>").replace("\t", "&nbsp;&nbsp;&nbsp;&nbsp;") + "</span>");
            htmlParagraphElement.setAttribute("style", "color: #f55; position: relative");
            htmlElement.appendChild(htmlParagraphElement);
        }
    }

    public static void tokenizerError(int errorChar, String line) { // just for Web(teaVM)
        StringBuilder error = new StringBuilder("error at line: ");
        int lineStart = line.lastIndexOf("\n", errorChar) + 1;
        line = line.substring(0, line.indexOf("\n", errorChar));
        Pattern pattern = Pattern.compile("\n");
        Matcher matcher = pattern.matcher(line);
        int lineNumber = 0;
        while (matcher.find()) {
            lineNumber++;
        }
        line = line.substring(lineStart);
        error.append(lineNumber + 1).append("<br/>").append(line).append("<br/>");
        errorChar -= lineStart;
        for(; errorChar > 0; errorChar--) {
            error.append("&nbsp;");
        }
        error.append("^");

        HTMLDocument document = HTMLDocument.current();
        HTMLElement htmlParagraphElement = document.createElement("div");
        htmlParagraphElement.setInnerHTML("<img src=\"test/error.png\" height=\"20\" style=\"padding-right: 10px\"/><span style=\"position: absolute\">" + error + "</span>");
        htmlParagraphElement.setAttribute("style", "color: #f55; position: relative");
        document.getElementById("console2").appendChild(htmlParagraphElement);
    }

    public static final boolean customWhile = false;

    public static boolean fileExists(String fileName) {
        return false;
    }

    public interface CustomWhileInterface {
        boolean run();
    }

    public static void _while(CustomWhileInterface customWhileInterface) {
//        final int intervalCount = count++;
//        intervalCodes.add(Window.setInterval(() -> {
//            if (!customWhileInterface.run()) {
//                Window.clearInterval(intervalCodes.get(intervalCount));
//            }
//        }, 1));
    }
}