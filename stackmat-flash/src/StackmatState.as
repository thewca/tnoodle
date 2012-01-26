package {
	public class StackmatState {
		public var centis:int = 0;
		public var on:Boolean;
		public var greenLight:Boolean;
		public var leftHand:Boolean;
		public var rightHand:Boolean;
		public var running:Boolean;

		public function StackmatState(state:StackmatState=null) {
			if(!state) {
				return;
			}
			this.centis = state.centis;
			this.on = state.on;
			this.greenLight = state.greenLight;
			this.leftHand = state.leftHand;
			this.rightHand = state.rightHand;
			this.running = state.running;
		}
	}
}
