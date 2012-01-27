package {
	public class StackmatState {
		public var units:int = 0;
		public var unitsPerSecond:int = 0;
		public var on:Boolean;
		public var greenLight:Boolean;
		public var leftHand:Boolean;
		public var rightHand:Boolean;
		public var running:Boolean;
		public var unknownRunning:Boolean;

		public function StackmatState(state:StackmatState=null) {
			if(!state) {
				return;
			}
			this.units = state.units;
			this.unitsPerSecond = state.unitsPerSecond;
			this.on = state.on;
			this.greenLight = state.greenLight;
			this.leftHand = state.leftHand;
			this.rightHand = state.rightHand;
			this.running = state.running;
		}

	}
}
