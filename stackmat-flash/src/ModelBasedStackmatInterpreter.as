package {
	import flash.utils.*;

	public class ModelBasedStackmatInterpreter extends StackmatInterpreter {

		public function ModelBasedStackmatInterpreter() {
			super(this);

			realState = new StackmatState();
			realState.on = true;
			state = new StackmatState();
			tick();
		}

		private function appendNTimes(arr:Array, obj:Object, n:int):void {
			for(var i:int = 0; i < n; i++) {
				arr.push(obj);
			}
		}

		private var realState:StackmatState;
		private function getActions():Array {
			var actions:Array = [];
			appendNTimes(actions, toggleLeft, 10);
			appendNTimes(actions, toggleRight, 10);
			appendNTimes(actions, toggleTimerPluggedIn, 10);
			if(realState.centis != 0) {
				appendNTimes(actions, resetTimer, 5);
			}
			if(realState.running) {
				appendNTimes(actions, advanceTimer, 1000);
				appendNTimes(actions, stopTimer, 5);
			} else {
				appendNTimes(actions, noop, 5);
				if(realState.reset) {
					appendNTimes(actions, startTimer, 5);
				}
			}
			return actions;
		}

		private function noop():void {
		}
		private function toggleLeft():void {
			realState.leftHand = !realState.leftHand;
		}
		private function toggleRight():void {
			realState.rightHand = !realState.rightHand;
		}
		private function toggleTimerPluggedIn():void {
			realState.on = !realState.on;
		}
		private function resetTimer():void {
			realState.centis = 0;
			realState.reset = true;
			realState.running = false;
		}
		private function advanceTimer():void {
			realState.centis += 1;
		}
		private function stopTimer():void {
			realState.running = false;
		}
		private function startTimer():void {
			realState.running = true;
			realState.reset = false;
		}

		private function tick():void {
			var actions:Array = getActions();
			var action:Function = actions[Math.floor((Math.random() * actions.length))];
			action();

			if(realState.on) {
				state = realState;
			} else {
				state = new StackmatState();
			}

			fireStateChanged();

			setTimeout(tick, 100);
		}
	}
}
