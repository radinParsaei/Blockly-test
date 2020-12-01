import org.teavm.jso.JSBody;

public class REPLReader {
	private static boolean readCode = true;
	@JSBody(script = "return document.getElementsByClassName(\"editor\")[0].innerText")
	public static native String readCode();

	@JSBody(script = "return functionCodes")
	public static native String getFunctions();

	public static String readLine() {
		if (readCode) return readCode();
		else return getFunctions();
	}

	public static void setReadCode(boolean readCode) {
		REPLReader.readCode = readCode;
	}
}
