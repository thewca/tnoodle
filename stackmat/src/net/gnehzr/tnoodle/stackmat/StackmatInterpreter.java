package net.gnehzr.tnoodle.stackmat;

import java.util.ArrayList;

import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.DataLine;
import javax.sound.sampled.LineUnavailableException;
import javax.sound.sampled.Mixer;
import javax.sound.sampled.TargetDataLine;
import javax.swing.SwingWorker;

public class StackmatInterpreter extends SwingWorker<String, StackmatState> {
	private static final int BYTES_PER_SAMPLE = 2;
	private static final int FRAMES = 64;
	
	private int stackmatValue;
	private int samplingRate;
	private boolean invertedMinutes, invertedSeconds, invertedCentis;
	
	private DataLine.Info info;
	private TargetDataLine line;
	public StackmatInterpreter(int samplingRate, int mixerNumber, int stackmatValue) throws LineUnavailableException, SecurityException {
		if(stackmatValue <= 0)
			stackmatValue = 50;
		if(samplingRate <= 0)
			samplingRate = 44100;
		
		this.samplingRate = samplingRate;
		this.stackmatValue = stackmatValue;
		AudioFormat format = new AudioFormat(samplingRate, BYTES_PER_SAMPLE * 8, 2, true, false);
		info = new DataLine.Info(TargetDataLine.class, format);

		Mixer.Info[] aInfos = AudioSystem.getMixerInfo();
		if(mixerNumber <= 0 || mixerNumber >= aInfos.length) {
			// use the default mixer
			line = (TargetDataLine) AudioSystem.getLine(info);
		} else {
			Mixer mixer = AudioSystem.getMixer(aInfos[mixerNumber]);
			if(mixer.isLineSupported(info)) {
				line = (TargetDataLine) mixer.getLine(info);
			} else {
				// might as well try to use an intelligent default
				line = (TargetDataLine) AudioSystem.getLine(info);
			}
		}

		line.open(format);
		line.start();
	}

	public int getStackmatValue() {
		return stackmatValue;
	}
	public void setStackmatValue(int value) {
		this.stackmatValue = value;
	}
	
	public boolean isInvertedMinutes() {
		return invertedMinutes;
	}
	public boolean isInvertedSeconds() {
		return invertedSeconds;
	}
	public boolean isInvertedCentis() {
		return invertedCentis;
	}
	public void setInverted(boolean minutes, boolean seconds, boolean centis) {
		invertedMinutes = minutes;
		invertedSeconds = seconds;
		invertedCentis = centis;
	}

	public String[] getMixerChoices() {
		ArrayList<String> items = new ArrayList<String>();
		items.add("Default Device");
		Mixer.Info[] aInfos = AudioSystem.getMixerInfo();
		for(int i = 0; i < aInfos.length; i++) {
			if(AudioSystem.getMixer(aInfos[i]).isLineSupported(info))
				items.add(aInfos[i].getName()); // + aInfos[i].getDescription());
		}
		return items.toArray(new String[items.size()]);
	}

	//this method only works if the stackmat is enabled
	private boolean on = false;
	public boolean isOn() {
		return on;
	}

	public String doInBackground() {
		/*** BEGIN MAGIC NUMBERS ***/
		
		// the stackmat signal is basically a series of repeated sawtooth periods with some silence between them
		// we need the following magic numbers to help interpret this signal
		
		// noiseSpikeThreshold represents the minimum length (in # of samples) of a peak
		// or trough in our sawtooth signal
		int noiseSpikeThreshold = (25 * samplingRate) / 44100;
		
		// newPeriod is the # of flat samples after which we determine we've attempt to
		// interpret the most recent period, it basically identifies the end of a period
		int newPeriod = samplingRate / 44;
		
		// after we see this many flat samples, we determine that the stackmat is off
		int offThreshold = newPeriod * 4;
		
		// this is the # of samples that go into one bit of the stackmat signal
		// as you can see, this is slightly larger than our noiseSpikeThreshold, which makes sense
		double samplesPerBit = 38 * (samplingRate / 44100.);
		
		// this is the number of processed 1's and 0's (stackmat bits) that comprise 1 period
		int bitsPerPeriod = 89;
		
		/*** END MAGIC NUMBERS ***/
		
		int timeSinceLastFlip = 0;
		int lastSample = 0;
		int lastBit = 0;
		byte[] buffer = new byte[BYTES_PER_SAMPLE*FRAMES];

		ArrayList<Integer> currentPeriod = new ArrayList<Integer>();
		StackmatState state = new StackmatState();
		while(!isCancelled()) {	
			int bytes = line.read(buffer, 0, buffer.length);
			if(bytes > 0) {
				for(int c = 0; c < bytes / BYTES_PER_SAMPLE; c+=2) { //we increment by 2 to mask out 1 channel
					//little-endian encoding, bytes are in increasing order
					int currentSample = 0;
					int j;
					for(j = 0; j < BYTES_PER_SAMPLE - 1; j++) {
						currentSample |= (255 & buffer[BYTES_PER_SAMPLE*c+j]) << (j * 8);
					}
					currentSample |= buffer[BYTES_PER_SAMPLE*c+j] << (j * 8); //we don't mask with 255 so we don't lost the sign
					// currentSample now represents the height of our signal at this moment in time
					
					timeSinceLastFlip++;
					if(timeSinceLastFlip == offThreshold) {
						// after this length of inactivity, we determine that the stackmat is off
						state = new StackmatState();
						on = false;
						firePropertyChange("Off", null, null);
					}

					// switchThreshold is the distance for a rise or fall that will indicate a switch in the
					// sawtooth signal (so long as the distance since our last switch is greater than noiseSpikeThreshold)
					int switchThreshold = stackmatValue << (BYTES_PER_SAMPLE * 4);
					if(Math.abs(currentSample - lastSample) > switchThreshold && timeSinceLastFlip > noiseSpikeThreshold) {
						// a flip in a our sawtooth signal has occurred!
						
						if(timeSinceLastFlip > newPeriod) {
							// inbetween each sawtooth is a long flat line
							// once this line is greater than newPeriod,
							// we fire a new time and clear our current period info
							// to start collecting the next period

							if(currentPeriod.isEmpty()) {
								// still waiting for our next period to start
							} else {
								StackmatState newState;
								if(currentPeriod.size() == bitsPerPeriod) { //all data present
									newState = parseTime(currentPeriod);
									newState.running = newState.centis > state.centis;
									state = newState;
								} else {
									// if the signal was corrupt, we might as well use the previous period 
									newState = state;
								}
								on = true;
								currentPeriod.clear(); // this is so we know that we're looking for the start of a new period
								firePropertyChange(null, null, state);
							}
						} else {
							// we're in the middle of a period, so we
							// add the appropriate # of 1's and 0's to our current period
							for(int i = 0; i < Math.round(timeSinceLastFlip / samplesPerBit); i++) currentPeriod.add(lastBit);
						}
						lastBit = (currentSample - lastSample > 0) ? 1 : 0;
						timeSinceLastFlip = 0;
					}
					lastSample = currentSample;
				}
			}
		}
		line.stop();
		line.close();
		return null;
	}

	private StackmatState parseTime(ArrayList<Integer> periodData) {
		StackmatState state = new StackmatState();
		parseHeader(state, periodData);
		int minutes = parseDigit(periodData, 1, invertedMinutes);
		int seconds = parseDigit(periodData, 2, invertedSeconds) * 10 + parseDigit(periodData, 3, invertedSeconds);
		int hundredths = parseDigit(periodData, 4, invertedCentis) * 10 + parseDigit(periodData, 5, invertedCentis);
		state.centis = 6000 * minutes + 100 * seconds + hundredths;
		return state;
	}

	private void parseHeader(StackmatState state, ArrayList<Integer> periodData) {
		int temp = 0;
		for(int i = 1; i <= 5; i++) temp += periodData.get(i) << (5 - i);

		state.leftHand = temp == 6;
		state.rightHand = temp == 9;
		if(temp == 24 || temp == 16) state.rightHand = state.leftHand = true;
		state.greenLight = temp == 16;
	}

	private int parseDigit(ArrayList<Integer> periodData, int pos, boolean invert) {
		int temp = 0;
		for(int i = 1; i <= 4; i++) temp += periodData.get(pos * 10 + i) << (i - 1);

		return invert ? 15 - temp : temp;
	}
}
