package {
	import flash.text.*;
	import flash.external.*;
	import mx.core.*;
	import mx.utils.*;
	import mx.events.*;
	import flash.utils.Timer;
	import flash.ui.*;
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

		private static var updateCallback:String;
		private static var errorCallback:String;
		private static var settingsHiddenCallback:String;

		private var interpreter:LineInStackmatInterpreter;
		public function StackApplet() {
			try {
				var font:TextFormat = new TextFormat();
				font.font = "Arial";
				font.size = 40;

				var micState:UITextField = new UITextField();
				micState.y += 20;
				micState.width = 500; // TODO - magic number
				micState.wordWrap = true;
				micState.autoSize = TextFieldAutoSize.LEFT;
				micState.setTextFormat(font);
				addChild(micState);

				var params:Object = LoaderInfo(this.root.loaderInfo).parameters;
				updateCallback = params.updateCallback;
				errorCallback = params.errorCallback;
				settingsHiddenCallback = params.settingsHiddenCallback;

				ExternalInterface.addCallback("getState", function():StackmatState {
					if(!interpreter) {
						return null;
					}
					return interpreter.getState();
				});
				ExternalInterface.addCallback("ping", function():Boolean {
					return true;
				});

				stage.addEventListener(MouseEvent.CLICK, function():void {
					if(interpreter.isMicMuted()) {
						Security.showSettings(SecurityPanel.PRIVACY);
					} else {
						Security.showSettings(SecurityPanel.MICROPHONE);
					}
				});

				interpreter = new LineInStackmatInterpreter();
				interpreter.addListener(function(interpreter:LineInStackmatInterpreter):void {
					// For some reason, trying to set micState.text is giving
					// me a #1009 error (something about rereferencing a null pointer).
					// This weirdness works, so whatever.
					micState.replaceText(0, micState.text.length, "");
					if(interpreter.isMicMuted()) {
						micState.appendText("Click to grant mic access");
					} else {
						micState.appendText("Mixer: " + interpreter.getSelectedLine());
						micState.appendText("\n\nClick to change mixer");
					}
					micState.setTextFormat(font);

					ExternalInterface.call(updateCallback, interpreter.getState());
				});
			} catch(e:Error) {
				handleError(this, e);
			}
		}

		public static function handleError(source:Object, e:Error):void {
			try {
				var objError:Object = {};
				objError.message = e.message;
				objError.stackTrace = e.getStackTrace();
				objError.source = source.toString();
				ExternalInterface.call(errorCallback, objError);
			} catch(ee:Error) {
				var msg:String = "Error calling " + errorCallback + ".";
				msg += " " + e.message;
				log(msg);
				log('    ' + ee.message);
			}
		}
	}
}
