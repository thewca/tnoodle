package tnoodleServerHandler;

public class FileHandler extends DirectoryHandler {

	// There's probably no reason to have this class separate from DirectoryHandler,
	// but it exists for historical reasons, and I see no benefit in removing it.
	public FileHandler(String path) {
		super(path);
	}
	
}
