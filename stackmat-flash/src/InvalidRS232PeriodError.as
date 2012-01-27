package {
	public class InvalidRS232PeriodError extends Error {
		public function InvalidRS232PeriodError(msg:String, i:int, periodData:Array) {
			super(msg + " at index " + i + " " + periodData.join(""));
		}
	}
}
