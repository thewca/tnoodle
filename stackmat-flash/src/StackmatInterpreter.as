package {
	import flash.external.*;
	import flash.system.Security;
	import flash.errors.IllegalOperationError

	public class StackmatInterpreter {

		public function StackmatInterpreter(self:StackmatInterpreter) {
			if(self != this) {
				// Only a subclass can pass a valid reference to self.
				throw new IllegalOperationError("Abstract class did not receive reference to self. StackmatInterpreter cannot be instantiated directly.");
			}

			Security.allowDomain('*');
			ExternalInterface.marshallExceptions = true;
			ExternalInterface.addCallback("getState", getState);
		}

		private var listeners:Array = new Array();
		public function addListener(func:Function):void {
			listeners.push(func);
			func(this);
		}
		protected function fireStateChanged():void {
			for each(var func:Function in listeners) {
				try {
					func(this);
				} catch(e:Error) {
					StackApplet.log("Error calling " + func);
					StackApplet.log(e.message);
				}
			}
		}

		protected var state:StackmatState = null;
		public function getState():StackmatState {
			return state;
		}
	}
}
