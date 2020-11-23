import org.teavm.jso.JSBody;

public class CustomCompileStep {
    @JSBody(params = {"xml"}, script = "Blockly.getMainWorkspace().clear();Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xml), Blockly.getMainWorkspace());Blockly.getMainWorkspace().trashcan.emptyContents()")
    private static native void setBlocks(String xml);
    public static boolean used = true;
    public static boolean run(ProgramBase program) {
        BlockTool blockTool = new BlockTool();
        setBlocks(blockTool.syntaxTreeToBlocksXML(program));
        return true;
    }
}