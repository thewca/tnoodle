package {
	import flash.text.TextField;
	import flash.external.*;
	import flash.text.TextFieldAutoSize;
	import mx.core.*;
	import mx.utils.*;
	import mx.events.*;
	import flash.utils.Timer;
	import flash.events.*;
	import flash.display.Sprite;
	import flash.display.LoaderInfo;
	import flash.system.Security;
	import flash.system.SecurityPanel;

	public class StackApplet extends Sprite {

		public static function log(msg:String):void {
			ExternalInterface.call("console.log", msg);
		}
		public function assert(expression:Boolean):void {
			if(!expression) {
				throw new Error("Assertion failed!");
			}
		}

		private var updateCallback:String;
		private var errorCallback:String;
		private var settingsHiddenCallback:String;

		private var interpreter:StackmatInterpreter;
		public function StackApplet() {
			try {
				var params:Object = LoaderInfo(this.root.loaderInfo).parameters;
				updateCallback = params.updateCallback;
				errorCallback = params.errorCallback;
				settingsHiddenCallback = params.settingsHiddenCallback;
				var simulateStackmat:Boolean = !!(params.simulateStackmat);

				if(simulateStackmat) {
					interpreter = new ModelBasedStackmatInterpreter();
				} else {
					interpreter = new LineInStackmatInterpreter();
				}
				interpreter.addListener(function(interpreter:StackmatInterpreter):void {
					ExternalInterface.call(updateCallback, interpreter.getState());
				});

				ExternalInterface.addCallback("getState", interpreter.getState);


				var settingsShowing:Boolean = false;
				function onMouseOrKeyboardEvent(e:Event):void { 
					if(!settingsShowing) { return; }
					
					// It appears that keyboard and mouse events are hidden from us
					// when the security dialog box is opened. So if we get any keyboard
					// or mouse events, we know the security dialog box is gone.
					// Unfortunately, clicking the close button on the security dialog
					// doesn't fire any events we can detect. We will however notice that the
					// dialog is gone just as soon as the mouse moves.
					// Apparently we are notified of key events while the security dialog
					// is showing, so we can't use them to detect that the security dialog
					// is gone.
					ExternalInterface.call(settingsHiddenCallback, interpreter.getState());
					stage.removeEventListener(MouseEvent.MOUSE_MOVE, onMouseOrKeyboardEvent);
					stage.removeEventListener(MouseEvent.MOUSE_DOWN, onMouseOrKeyboardEvent);
					stage.removeEventListener(MouseEvent.MOUSE_UP, onMouseOrKeyboardEvent);
					settingsShowing = false;
				}
				ExternalInterface.addCallback("showMicrophoneSettings", function():void {
					Security.showSettings(SecurityPanel.MICROPHONE);
					stage.addEventListener(MouseEvent.MOUSE_MOVE, onMouseOrKeyboardEvent);
					stage.addEventListener(MouseEvent.MOUSE_DOWN, onMouseOrKeyboardEvent);
					stage.addEventListener(MouseEvent.MOUSE_UP, onMouseOrKeyboardEvent);
					settingsShowing = true;
				});

			} catch(e:Error) {
				log("Unhandled exception: " + e.message);
				ExternalInterface.call(errorCallback, e.message);
			}
		}
	}
}
