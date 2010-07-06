import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.DataLine;
import javax.sound.sampled.LineUnavailableException;
import javax.sound.sampled.Mixer;
import javax.sound.sampled.TargetDataLine;


public class MicCheck {
	private static final int SAMPLING_RATE = 44100;
	private static final int BYTES_PER_SAMPLE = 2;
	public static void main(String[] args) throws LineUnavailableException, InterruptedException {
//		AudioFormat format = new AudioFormat(SAMPLING_RATE, BYTES_PER_SAMPLE * 8, 2, true, false);
//		DataLine.Info info = new DataLine.Info(TargetDataLine.class, format);
//		TargetDataLine line = (TargetDataLine) AudioSystem.getLine(info);
//		line.open(format);
//		line.start();
//		Thread t = new Thread(new Runnable() {
//			
//			@Override
//			public void run() {
				for(;;) {
					Thread.sleep(5000);
					// this doesn't seem to be changes when new mixers are introduced... =(
					Mixer.Info[] mixers = AudioSystem.getMixerInfo();
					for(int i = 0; i < mixers.length; i++) {
						Mixer.Info m = mixers[i];
						System.out.println(i + ": " + m.getName());
					}
					System.out.println();

					Thread.sleep(1000);
				}
//			}
//		});
//		t.start();
//		
//		for(;;) {
////			System.out.println(line.available());
//		}
	}
}
