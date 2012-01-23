package {
	import flash.events.StatusEvent;
	import flash.events.SampleDataEvent;
	import flash.external.*;
	import flash.media.*;
	import mx.core.*;
	import flash.utils.ByteArray;

	public class LineInStackmatInterpreter extends StackmatInterpreter {
		public function LineInStackmatInterpreter() {
			super(this);
			
			var mic:Microphone = Microphone.getMicrophone();
			//mic.setUseEchoSuppression(true);

			//var mic:Microphone = Microphone.getEnhancedMicrophone();

			//mic.setLoopBack();
			mic.gain = 100;
			mic.rate = 44;
			mic.addEventListener(SampleDataEvent.SAMPLE_DATA, micSampleDataHandler);

			for(var i:int = 0; i < Microphone.names.length; i++) {
				StackApplet.log("\n" + i + ": " + Microphone.names[i]);
			}

			if(mic.muted) {
				StackApplet.log("User denied access to microphone! =(");//<<<
			} else {
				state = new StackmatState();
				state.centis = 4031;
				fireStateChanged();
			}
		}

		private var sampling:Boolean = true;//<<<
		public function enableSampling(newSampling:Boolean):void {
			sampling = newSampling;
		}

		private function micSampleDataHandler(event:SampleDataEvent):void {
			/*var bytes:ByteArray = new ByteArray();
			const PLOT_HEIGHT:int = 200;
			const CHANNEL_LENGTH:int = 256;
			SoundMixer.computeSpectrum(bytes, false, 0);
			var micBytes:ByteArray = bytes;*/
			if(!sampling) { return; }

			var micBytes:ByteArray = event.data;
			for(var i:int = 0; i < 8192 && micBytes.bytesAvailable > 0; i++) {
				var sample:Number = micBytes.readFloat();
				ExternalInterface.call('sample', sample);//<<<
				//StackApplet.log("" + sample + " " + micBytes.bytesAvailable);
			}
		}
	}
}
