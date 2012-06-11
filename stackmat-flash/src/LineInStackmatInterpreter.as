package {
	import flash.system.Security;
	import flash.system.SecurityPanel;

	import flash.events.StatusEvent;
	import flash.events.SampleDataEvent;
	import flash.external.*;
	import flash.media.*;
	import flash.utils.*;
	import mx.core.*;

	public class LineInStackmatInterpreter extends StackmatInterpreter {
	
		/*** BEGIN MAGIC NUMBERS ***/

		private var samplingRate:int = 44100;
		private var stackmatValue:Number = 0.7;

		// The stackmat signal is basically a series of repeated sawtooth
		// periods with some silence between them.
		// We need the following magic numbers to help interpret this signal.

		// noiseSpikeThreshold represents the minimum length (in # of samples) of a peak
		// or trough in our sawtooth signal.
		private var noiseSpikeThreshold:int = (25 * samplingRate) / 44100;

		// After we see this many flat samples, we determine that the stackmat is off.
		private var offThreshold:int = (samplingRate / 44) * 4;

		// This is the # of samples that go into one bit of the stackmat signal.
		// As you can see, this is slightly larger than our
		// noiseSpikeThreshold, which makes sense.
		private var samplesPerBit:Number = 38 * (samplingRate / 44100.);

		// This is the number of rs232 processed bytes that comprise 1 period.
		private var bytesPerGen2Period:int = 9;
		private var bytesPerGen3Period:int = 10;

		private var rs232BitsPerGen2Period:int = bytesPerGen2Period*10-1;
		private var rs232BitsPerGen3Period:int = bytesPerGen3Period*10-1;

		/*** END MAGIC NUMBERS ***/

		private var samplesSinceLastFlip:int;
		private var lastBitVoltage:Number;
		private var currentPeriod:Array;

		private var mic:Microphone;
		public function isMicMuted():Boolean {
			return mic.muted;
		}
		public function getSelectedLine():String {
			return mic.name;
		}

		private function reset():void {
			samplesSinceLastFlip = 0;
			lastBitVoltage = 0;
			currentPeriod = null;
			state = new StackmatState();
			fireStateChanged();
		}

		public function LineInStackmatInterpreter() {
			super(this);
			
			reset();

			mic = Microphone.getMicrophone();
			mic.gain = 100;
			mic.rate = 44;
			mic.addEventListener(SampleDataEvent.SAMPLE_DATA, micSampleDataHandler);
			mic.addEventListener(StatusEvent.STATUS, fireStateChanged);
			oldMicIndex = mic.index;

			if(mic.muted) {
				StackApplet.handleError(this, new Error("muted"));
				Security.showSettings(SecurityPanel.PRIVACY);
			}

			pollDefaultMicrophone();
		}

		private var oldMicIndex:int;
		private function pollDefaultMicrophone():void {
			if(oldMicIndex != mic.index) {
				oldMicIndex = mic.index;
				fireStateChanged();
			}

			setTimeout(pollDefaultMicrophone, 1000);
		}

		private var samplesToCaptureCount:int = 0;
		private var capturedSamples:Array = null;
		private var capturedSamplesCallback:Function = null;
		public function captureNSamples(n:int, callback:Function):void {
			StackApplet.assert(n > 0)
			samplesToCaptureCount = n;
			capturedSamplesCallback = callback;
			capturedSamples = [];
		}
		private function sendDebugInfo(status:String):void {
			if(samplesToCaptureCount) {
				capturedSamplesCallback(capturedSamples, status + ' ' + currentPeriod.join(""));
			}
		}

		private function micSampleDataHandler(event:SampleDataEvent):void {
			try {
			
				var micBytes:ByteArray = event.data;

				for(var i:int = 0; i < 8192 && micBytes.bytesAvailable > 0; i++) {
					var currentSample:Number = micBytes.readFloat();
					newSample(currentSample);
				}
			} catch(e:Error) {
				StackApplet.handleError(this, e);
			}
		}

		public function parseSamples(samples:Array):void {
			// Note that we permanently disable microphone input here.
			mic.removeEventListener(SampleDataEvent.SAMPLE_DATA, micSampleDataHandler);
			mic.removeEventListener(StatusEvent.STATUS, fireStateChanged);

			reset();
			for(var i:int = 0; i < samples.length; i++) {
				newSample(samples[i]);
			}
		}

		private function newSample(currentSample:Number):void {
			if(currentPeriod === null) {
				currentPeriod = [];
				lastBitVoltage = (currentSample > 0) ? 1 : -1;
				return;
			}
			if(samplesToCaptureCount) {
				capturedSamples.push(currentSample);
				if(capturedSamples.length == samplesToCaptureCount) {
					sendDebugInfo('incomplete');
					capturedSamplesCallback = null;
					capturedSamples = null;
					samplesToCaptureCount = 0;
				}
			}

			// currentSample is the height of our signal at this moment in time
			
			samplesSinceLastFlip++;
			if(samplesSinceLastFlip == offThreshold) {
				// after this length of inactivity, we determine that the
				// stackmat is off
				currentPeriod.length = 0;
				state.on = false;
				fireStateChanged();
			}

			var switchThreshold:Number = stackmatValue;
			if(samplesSinceLastFlip <= noiseSpikeThreshold) {
				return;
			}

			// switchThreshold is the distance for a rise or fall that will
			// indicate a switch in the sawtooth signal (so long as the
			// distance since our last switch is greater than
			// noiseSpikeThreshold)
			var flipOccured:Boolean = Math.abs(currentSample - lastBitVoltage) > switchThreshold;
			if(!flipOccured) {
				return;
			}

			var lastBit:int = lastBitVoltage > 0 ? 1 : 0;
			var bitLength:int = Math.round(samplesSinceLastFlip / samplesPerBit);
			samplesSinceLastFlip = 0;
			lastBitVoltage = currentSample > lastBitVoltage ? 1 : -1;
			// A flip in a our sawtooth signal has occurred!

			// We're in the middle of a period or we've just
			// entered a period, so we add the appropriate # of 1's
			// or 0's to our current period.
			for(var j:int = 0; j < bitLength; j++) {
				currentPeriod.push(lastBit);
			}

			var newState:StackmatState = new StackmatState();
			try {
				if(currentPeriod.length == rs232BitsPerGen2Period) {
					// Attempt to parse currentPeriod. If we fail, that's fine.
					// Maybe we're dealing with a gen3 signal.
					parseTime(currentPeriod, newState);
				} else if(currentPeriod.length == rs232BitsPerGen3Period) {
					// Attempt to parse currentPeriod. If we fail, then this signal
					// is corrupted.
					parseTime(currentPeriod, newState);
				} else if(currentPeriod.length > Math.max(rs232BitsPerGen2Period, rs232BitsPerGen3Period)) {
					// This period is longer than the longest possible
					// period, we therefore give up on it and start over.
					throw new InvalidRS232PeriodError("too long", -1, currentPeriod);
				} else {
					// This period isn't long enough yet, we'll deal with it later.
					return;
				}
			} catch(e:InvalidRS232PeriodError) {
				if(currentPeriod.length >= Math.max(rs232BitsPerGen2Period, rs232BitsPerGen3Period)) {
					// We don't give up on this period until we've gone past the
					// maximum length for a period.
					sendDebugInfo('corrupt');
					currentPeriod.length = 0;
				}
				return;
			}
				
			if(state.on) {
				// We can only mark the state as running if the
				// previous state was actually on.
				// We want to check if:
				// newState.units / newState.unitsPerSecond > state.units / state.unitsPerSecond
				// which is the same as checking if
				// newState.units * state.unitsPerSecond > state.units * newState.unitsPerSecond
				newState.running = newState.units * state.unitsPerSecond > state.units * newState.unitsPerSecond;
			}

			if(newState.running) {
				// TODO - this is a hack for the gen3
				// i really need metadata info for all the timers...
				newState.greenLight = false;
				newState.leftHand = false;
				newState.rightHand = false;
			}

			var oldState:StackmatState = state;
			state = newState;
			state.on = true;

			sendDebugInfo('' + state.units*(1.0/state.unitsPerSecond));
			if(!oldState.on) {
				// We can't fire the first signal we read from the
				// previously off timer, because we don't know if
				// the timer is running or stopped. Instead, we
				// wait for the next signal, and decide then.
				state.unknownRunning = true;
			}
			fireStateChanged();
			currentPeriod.length = 0; // this is so we know that we're looking for the start of a new period
		}

		private function parseTime(periodData:Array, state:StackmatState):void {
			if(periodData.length != rs232BitsPerGen2Period && periodData.length != rs232BitsPerGen3Period) {
				throw new InvalidRS232PeriodError(periodData.length + " is not " + rs232BitsPerGen2Period + " or " + rs232BitsPerGen3Period, -1, periodData);
			}

			// We don't want to mutate our existing periodData array, so we make a
			// copy of it herez.
			// TODO - is there a better way of doing this that avoids making a copy
			// of period data?
			periodData = periodData.slice(0);

			var inverted:Boolean = (periodData[0] != 0);
			if(inverted) {
				flipPeriod(periodData);
			}

			var bytes:Array = parseRS232Period(periodData);
			
			function byteToInt(b:int):int {
				return b - 48;
			}
			var byteN:int = 0;
			state.signalHeader = bytes[byteN++];
			var seconds:int = byteToInt(bytes[byteN++])*60 + byteToInt(bytes[byteN++])*10 + byteToInt(bytes[byteN++]);
			if(bytes.length == bytesPerGen2Period) {
				var centis:int = seconds*100 + byteToInt(bytes[byteN++])*10 + byteToInt(bytes[byteN++]);
				state.units = centis;
				state.unitsPerSecond = 100;
			} else if(bytes.length == bytesPerGen3Period) {
				var millis:int = seconds*1000 + byteToInt(bytes[byteN++])*100 + byteToInt(bytes[byteN++])*10 + byteToInt(bytes[byteN++]);
				state.units = millis;
				state.unitsPerSecond = 1000;
			} else {
				StackApplet.assert(false);
			}

			var checksum:int = byteN++;
			// I don't know how to validate the checksum, so we just ignore it.

			var check1Index:int = byteN++;
			var check2Index:int = byteN++;
			if(bytes[check1Index] != 10) {
				throw new InvalidRS232PeriodError('check 1:' + bytes[check1Index] + " != " + 10, check1Index, periodData);
			}
			if(bytes[check2Index] != 13) {
				throw new InvalidRS232PeriodError('check 2:' + bytes[check2Index] + " != " + 13, check2Index, periodData);
			}
		}

		private static function flipPeriod(periodData:Array):void {
			for(var i:int = 0; i < periodData.length; i++) {
				periodData[i] = 1-periodData[i];
			}
		}

		private static function parseReverseBinary(periodData:Array, start:int, bits:int):int {
			var temp:int = 0;
			for(var i:int = 0; i < bits; i++) {
				temp |= periodData[start + i] << i;
			}
			return temp;
		}

		private static function parseRS232Period(periodData:Array):Array {
			var bytes:Array = [];

			var i:int = 0
			while(i < periodData.length) {
				if(periodData[i] != 0) {
					throw new InvalidRS232PeriodError("expected start signal (0)", i, periodData);
				}
				i++;
				if(i + 8 > periodData.length) {
					throw new InvalidRS232PeriodError("signal ended in the middle of a byte", i, periodData);
				}
				bytes.push(parseReverseBinary(periodData, i, 8));
				i += 8;

				if(i < periodData.length && periodData[i] != 1) {
					throw new InvalidRS232PeriodError("expected stop signal (1)", i, periodData);
				}
				i++;
			}

			return bytes;
		}
	}
}
