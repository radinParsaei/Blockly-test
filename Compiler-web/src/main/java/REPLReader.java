import org.teavm.jso.JSBody;

public class REPLReader {
	@JSBody(script = "return document.getElementsByClassName(\"editor\")[0].innerText")
	public static native String readLine();
}
