package {
	import flash.system.Security;
	import flash.system.SecurityPanel;

	import flash.events.StatusEvent;
	import flash.events.SampleDataEvent;
	import flash.external.*;
	import flash.media.*;
	import mx.core.*;
	import flash.utils.ByteArray;

	public class LineInStackmatInterpreter extends StackmatInterpreter {
	
		/*** BEGIN MAGIC NUMBERS ***/

		private var samplingRate:int = 44100;
		private var stackmatValue:Number = 0.7;
		private var invertedMinutes:Boolean = true;
		private var invertedSeconds:Boolean = true;
		private var invertedCentis:Boolean = true;

		// the stackmat signal is basically a series of repeated sawtooth periods with some silence between them
		// we need the following magic numbers to help interpret this signal

		// noiseSpikeThreshold represents the minimum length (in # of samples) of a peak
		// or trough in our sawtooth signal

		private var noiseSpikeThreshold:int = (25 * samplingRate) / 44100;

		// newPeriod is the # of flat samples after which we determine we've attempt to
		// interpret the most recent period, it basically identifies the end of a period
		private var newPeriod:int = samplingRate / 44;

		// after we see this many flat samples, we determine that the stackmat is off
		private var offThreshold:int = newPeriod * 4;

		// this is the # of samples that go into one bit of the stackmat signal
		// as you can see, this is slightly larger than our noiseSpikeThreshold, which makes sense
		private var samplesPerBit:Number = 38 * (samplingRate / 44100.);

		// this is the number of processed 1's and 0's (stackmat bits) that comprise 1 period
		private var bitsPerPeriod:int = 89;

		/*** END MAGIC NUMBERS ***/

		private var samplesSinceLastFlip:int = 0;
		private var lastSample:Number = 0;
		private var lastBit:int = 0;
		private var currentPeriod:Array = [];

		private var mic:Microphone;
		public function isMicMuted():Boolean {
			return mic.muted;
		}
		public function getSelectedLine():String {
			return mic.name;
		}

		public function LineInStackmatInterpreter() {
			super(this);
			
			mic = Microphone.getMicrophone();
			mic.gain = 100;
			mic.rate = 44;
			mic.addEventListener(SampleDataEvent.SAMPLE_DATA, micSampleDataHandler);
			mic.addEventListener(StatusEvent.STATUS, function(event:StatusEvent):void {
				fireStateChanged();
			});
			// TODO - STATUS events don't fire when the default microphone is changed
			// need to do some polling or something instead =(


			//for(var i:int = 0; i < Microphone.names.length; i++) {
				//StackApplet.log("\n" + i + ": " + Microphone.names[i]);
			//}

			if(mic.muted) {
				StackApplet.handleError(this, new Error("muted"));
				Security.showSettings(SecurityPanel.PRIVACY);
				fireStateChanged();
			} else {
				state = new StackmatState();
				fireStateChanged();
			}
		}

		private function micSampleDataHandler(event:SampleDataEvent):void {
			try {
			
			var micBytes:ByteArray = event.data;

			for(var i:int = 0; i < 8192 && micBytes.bytesAvailable > 0; i++) {
				var currentSample:Number = micBytes.readFloat();

				// currentSample now represents the height of our signal at this moment in time
				
				samplesSinceLastFlip++;
				if(samplesSinceLastFlip == offThreshold) {
					// after this length of inactivity, we determine that the stackmat is off
					state = new StackmatState();
					state.on = false;
					fireStateChanged();
				}

				var switchThreshold:Number = stackmatValue;
				if(samplesSinceLastFlip > noiseSpikeThreshold) {
					// switchThreshold is the distance for a rise or fall that will indicate a switch in the
					// sawtooth signal (so long as the distance since our last switch is greater than noiseSpikeThreshold)
					if(Math.abs(currentSample - lastSample) > switchThreshold) {
						// a flip in a our sawtooth signal has occurred!

						if(samplesSinceLastFlip > newPeriod) {
							// inbetween each sawtooth is a long flat line
							// once this line is greater than newPeriod,
							// we fire a new time and clear our current period info
							// to start collecting the next period

							if(currentPeriod.length == 0) {
								// still waiting for our next period to start
							} else {
								if(currentPeriod.length == bitsPerPeriod) { //all data present
									var newState:StackmatState = parseTime(currentPeriod);
									newState.running = newState.centis > state.centis;
									newState.corrupted = false;
									state = newState;
								} else {
									// if the signal was corrupt, we might as well use the previous period 
									newState = state;
									newState.corrupted = true;
								}
								state.on = true;
								currentPeriod.length = 0; // this is so we know that we're looking for the start of a new period
								fireStateChanged();
							}
						} else {
							// we're in the middle of a period or we've just entered a period, so we
							// add the appropriate # of 1's or 0's to our current period
							for(var j:int = 0; j < Math.round(samplesSinceLastFlip / samplesPerBit); j++) {
								currentPeriod.push(lastBit);
							}
						}
						lastBit = (currentSample - lastSample > 0) ? 1 : 0;
						samplesSinceLastFlip = 0;
					}
					lastSample = currentSample;
				}
			}

			} catch(e:Error) {
				StackApplet.handleError(this, e);
			}
		}

		private function parseTime(periodData:Array):StackmatState {
			var state:StackmatState = new StackmatState();
			parseHeader(state, periodData);
			var minutes:int = parseDigit(periodData, 1, invertedMinutes);
			var seconds:int = parseDigit(periodData, 2, invertedSeconds) * 10 + parseDigit(periodData, 3, invertedSeconds);
			var hundredths:int = parseDigit(periodData, 4, invertedCentis) * 10 + parseDigit(periodData, 5, invertedCentis);
			state.centis = 6000 * minutes + 100 * seconds + hundredths;
			return state;
		}

		private function parseHeader(state:StackmatState, periodData:Array):void {
			var temp:int = 0;
			for(var i:int = 1; i <= 5; i++) {
				temp |= periodData[i] << (5 - i);
			}

			// TODO - detecting left/right hands is broken with gen3 timers?!!
			state.leftHand = (temp == 6);
			state.rightHand = (temp == 9);
			state.greenLight = (temp == 16);
			if(temp == 24 || state.greenLight) {
				state.rightHand = true;
				state.leftHand = true;
			}
		}

		private function parseDigit(periodData:Array, pos:int, invert:Boolean):int {
			var temp:int = 0;
			for(var i:int = 1; i <= 4; i++) {
				temp |= periodData[pos * 10 + i] << (i - 1);
			}

			return invert ? 0xF ^ temp : temp;
		}
	}
}
