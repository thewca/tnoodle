package tnoodleServerHandler;

@SuppressWarnings("serial")
class InvalidScrambleRequestException extends Exception {

	public InvalidScrambleRequestException(String string) {
		super(string);
	}

	public InvalidScrambleRequestException(Throwable cause) {
		super(cause);
	}
	
}
