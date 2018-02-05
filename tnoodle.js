// The next line will get replaced with the contents of the
// gwt-generated tnoodlejs.nocache.js. So don't mess with it unless
// you know what you're doing!
function TNOODLEJS_GWT() {
function tnoodlejs(){
  var $wnd_0 = window, $doc_0 = document, gwtOnLoad, bodyDone, base = '', metaProps = {}, values = [], providers = [], answers = [], softPermutationId = 0, onLoadErrorFunc, propertyErrorFunc;
  if (!$wnd_0.__gwt_stylesLoaded) {
    $wnd_0.__gwt_stylesLoaded = {};
  }
  if (!$wnd_0.__gwt_scriptsLoaded) {
    $wnd_0.__gwt_scriptsLoaded = {};
  }
  function isHostedMode(){
    var result = false;
    try {
      var query = $wnd_0.location.search;
      return (query.indexOf('gwt.codesvr=') != -1 || (query.indexOf('gwt.hosted=') != -1 || $wnd_0.external && $wnd_0.external.gwtOnLoad)) && query.indexOf('gwt.hybrid') == -1;
    }
     catch (e) {
    }
    isHostedMode = function(){
      return result;
    }
    ;
    return result;
  }

  function maybeStartModule(){
    if (gwtOnLoad && bodyDone) {
      gwtOnLoad(onLoadErrorFunc, 'tnoodlejs', base, softPermutationId);
    }
  }

  function computeScriptBase(){
    var thisScript, markerId = '__gwt_marker_tnoodlejs', markerScript;
    $doc_0.write('<script id="' + markerId + '"><\/script>');
    markerScript = $doc_0.getElementById(markerId);
    thisScript = markerScript && markerScript.previousSibling;
    while (thisScript && thisScript.tagName != 'SCRIPT') {
      thisScript = thisScript.previousSibling;
    }
    function getDirectoryOfFile(path){
      var hashIndex = path.lastIndexOf('#');
      if (hashIndex == -1) {
        hashIndex = path.length;
      }
      var queryIndex = path.indexOf('?');
      if (queryIndex == -1) {
        queryIndex = path.length;
      }
      var slashIndex = path.lastIndexOf('/', Math.min(queryIndex, hashIndex));
      return slashIndex >= 0?path.substring(0, slashIndex + 1):'';
    }

    ;
    if (thisScript && thisScript.src) {
      base = getDirectoryOfFile(thisScript.src);
    }
    if (base == '') {
      var baseElements = $doc_0.getElementsByTagName('base');
      if (baseElements.length > 0) {
        base = baseElements[baseElements.length - 1].href;
      }
       else {
        base = getDirectoryOfFile($doc_0.location.href);
      }
    }
     else if (base.match(/^\w+:\/\//)) {
    }
     else {
      var img = $doc_0.createElement('img');
      img.src = base + 'clear.cache.gif';
      base = getDirectoryOfFile(img.src);
    }
    if (markerScript) {
      markerScript.parentNode.removeChild(markerScript);
    }
  }

  function processMetas(){
    var metas = document.getElementsByTagName('meta');
    for (var i = 0, n = metas.length; i < n; ++i) {
      var meta = metas[i], name_0 = meta.getAttribute('name'), content_0;
      if (name_0) {
        if (name_0 == 'gwt:property') {
          content_0 = meta.getAttribute('content');
          if (content_0) {
            var value, eq = content_0.indexOf('=');
            if (eq >= 0) {
              name_0 = content_0.substring(0, eq);
              value = content_0.substring(eq + 1);
            }
             else {
              name_0 = content_0;
              value = '';
            }
            metaProps[name_0] = value;
          }
        }
         else if (name_0 == 'gwt:onPropertyErrorFn') {
          content_0 = meta.getAttribute('content');
          if (content_0) {
            try {
              propertyErrorFunc = eval(content_0);
            }
             catch (e) {
              alert('Bad handler "' + content_0 + '" for "gwt:onPropertyErrorFn"');
            }
          }
        }
         else if (name_0 == 'gwt:onLoadErrorFn') {
          content_0 = meta.getAttribute('content');
          if (content_0) {
            try {
              onLoadErrorFunc = eval(content_0);
            }
             catch (e) {
              alert('Bad handler "' + content_0 + '" for "gwt:onLoadErrorFn"');
            }
          }
        }
      }
    }
  }

  function unflattenKeylistIntoAnswers(propValArray, value){
    var answer = answers;
    for (var i = 0, n = propValArray.length - 1; i < n; ++i) {
      answer = answer[propValArray[i]] || (answer[propValArray[i]] = []);
    }
    answer[propValArray[n]] = value;
  }

  function computePropValue(propName){
    var value = providers[propName](), allowedValuesMap = values[propName];
    if (value in allowedValuesMap) {
      return value;
    }
    var allowedValuesList = [];
    for (var k in allowedValuesMap) {
      allowedValuesList[allowedValuesMap[k]] = k;
    }
    if (propertyErrorFunc) {
      propertyErrorFunc(propName, allowedValuesList, value);
    }
    throw null;
  }

  providers['user.agent'] = function(){
    var ua = navigator.userAgent.toLowerCase();
    var makeVersion = function(result){
      return parseInt(result[1]) * 1000 + parseInt(result[2]);
    }
    ;
    if (function(){
      return ua.indexOf('opera') != -1;
    }
    ())
      return 'opera';
    if (function(){
      return ua.indexOf('webkit') != -1;
    }
    ())
      return 'safari';
    if (function(){
      return ua.indexOf('msie') != -1 && $doc_0.documentMode >= 9;
    }
    ())
      return 'ie9';
    if (function(){
      return ua.indexOf('msie') != -1 && $doc_0.documentMode >= 8;
    }
    ())
      return 'ie8';
    if (function(){
      var result = /msie ([0-9]+)\.([0-9]+)/.exec(ua);
      if (result && result.length == 3)
        return makeVersion(result) >= 6000;
    }
    ())
      return 'ie6';
    if (function(){
      return ua.indexOf('gecko') != -1;
    }
    ())
      return 'gecko1_8';
    return 'unknown';
  }
  ;
  values['user.agent'] = {gecko1_8:0, ie6:1, ie8:2, ie9:3, opera:4, safari:5};
  tnoodlejs.onScriptLoad = function(gwtOnLoadFunc){
    tnoodlejs = null;
    gwtOnLoad = gwtOnLoadFunc;
    maybeStartModule();
  }
  ;
  if (isHostedMode()) {
    alert('Single-script hosted mode not yet implemented. See issue ' + 'http://code.google.com/p/google-web-toolkit/issues/detail?id=2079');
    return;
  }
  computeScriptBase();
  processMetas();
  try {
    var strongName;
    unflattenKeylistIntoAnswers(['gecko1_8'], '72E40D8B5458DBA4C27B7E4974145DE4');
    unflattenKeylistIntoAnswers(['ie6'], '72E40D8B5458DBA4C27B7E4974145DE4' + ':1');
    unflattenKeylistIntoAnswers(['ie8'], '72E40D8B5458DBA4C27B7E4974145DE4' + ':2');
    unflattenKeylistIntoAnswers(['ie9'], '72E40D8B5458DBA4C27B7E4974145DE4' + ':3');
    unflattenKeylistIntoAnswers(['opera'], '72E40D8B5458DBA4C27B7E4974145DE4' + ':4');
    unflattenKeylistIntoAnswers(['safari'], '72E40D8B5458DBA4C27B7E4974145DE4' + ':5');
    strongName = answers[computePropValue('user.agent')];
    var idx = strongName.indexOf(':');
    if (idx != -1) {
      softPermutationId = Number(strongName.substring(idx + 1));
    }
  }
   catch (e) {
    return;
  }
  var onBodyDoneTimerId;
  function onBodyDone(){
    if (!bodyDone) {
      bodyDone = true;
      maybeStartModule();
      if ($doc_0.removeEventListener) {
        $doc_0.removeEventListener('DOMContentLoaded', onBodyDone, false);
      }
      if (onBodyDoneTimerId) {
        clearInterval(onBodyDoneTimerId);
      }
    }
  }

  if ($doc_0.addEventListener) {
    $doc_0.addEventListener('DOMContentLoaded', function(){
      onBodyDone();
    }
    , false);
  }
  var onBodyDoneTimerId = setInterval(function(){
    if (/loaded|complete/.test($doc_0.readyState)) {
      onBodyDone();
    }
  }
  , 50);
}

tnoodlejs();
(function () {var $gwt_version = "2.5.1";var $wnd = window;var $doc = $wnd.document;var $moduleName, $moduleBase;var $stats = $wnd.__gwtStatsEvent ? function(a) {$wnd.__gwtStatsEvent(a)} : null;var $strongName = '72E40D8B5458DBA4C27B7E4974145DE4';var _, P0_longLit = {l:0, m:0, h:0}, P1_longLit = {l:1, m:0, h:0}, Pf_longLit = {l:15, m:0, h:0}, P1e_longLit = {l:30, m:0, h:0}, P32_longLit = {l:50, m:0, h:0}, P64_longLit = {l:100, m:0, h:0}, Pc8_longLit = {l:200, m:0, h:0}, P3e8_longLit = {l:1000, m:0, h:0}, Pea60_longLit = {l:60000, m:0, h:0}, Pf4240_longLit = {l:1000000, m:0, h:0}, P111110_longLit = {l:1118480, m:0, h:0}, Pffffff_longLit = {l:4194303, m:3, h:0}, P111111111110_longLit = {l:1118480, m:279620, h:1}, Pba9876543210_longLit = {l:1323536, m:2777561, h:11}, seedTable = {}, Q$Object = 0, Q$String = 1, Q$boolean_$1 = 2, Q$byte_$1 = 3, Q$char_$1 = 4, Q$Style$HasCssName = 5, Q$Style$TextAlign = 6, Q$HasDirection$Direction = 7, Q$JSONArray = 8, Q$JSONNumber = 9, Q$JSONObject = 10, Q$JSONString = 11, Q$LongLibBase$LongEmul = 12, Q$HtmlLogFormatter = 13, Q$SafeUri = 14, Q$SafeUriString = 15, Q$EventListener = 16, Q$UserAgentAsserter$UserAgentProperty = 17, Q$CubieCube = 18, Q$Search = 19, Q$FullCube = 20, Q$Center1 = 21, Q$CornerCube = 22, Q$Edge3 = 23, Q$FullCube_0 = 24, Q$FullCube_$1 = 25, Q$Search_0 = 26, Q$double_$1 = 27, Q$int_$1 = 28, Q$int_$2 = 29, Q$Serializable = 30, Q$Boolean = 31, Q$CharSequence = 32, Q$Class = 33, Q$Comparable = 34, Q$Double = 35, Q$Enum = 36, Q$Exception = 37, Q$Integer = 38, Q$Number = 39, Q$Object_$1 = 40, Q$StackTraceElement = 41, Q$String_$1 = 42, Q$Throwable = 43, Q$Date = 44, Q$HashMap = 45, Q$LinkedHashMap$ChainEntry = 46, Q$List = 47, Q$Map = 48, Q$Map$Entry = 49, Q$NoSuchElementException = 50, Q$RandomAccess = 51, Q$Set = 52, Q$TreeMap$Node = 53, Q$TreeMap$SubMapType = 54, Q$Handler = 55, Q$Handler_$1 = 56, Q$Logger = 57, Q$InvalidMoveException = 58, Q$InvalidScrambleException = 59, Q$Puzzle = 60, Q$Puzzle$Bucket = 61, Q$Puzzle$PuzzleState = 62, Q$Color = 63, Q$Element = 64, Q$InvalidHexColorException = 65, Q$Path = 66, Q$Path$Command = 67, Q$Point2D$Double = 68, Q$Transform = 69, Q$Exportable = 70, Q$ClockPuzzle = 71, Q$ClockPuzzle$ClockState = 72, Q$CubePuzzle = 73, Q$CubePuzzle$CubeMove = 74, Q$CubePuzzle$CubeMove_$1 = 75, Q$CubePuzzle$CubeState = 76, Q$CubePuzzle$Face = 77, Q$FourByFourCubePuzzle = 78, Q$FourByFourRandomTurnsCubePuzzle = 79, Q$MegaminxPuzzle = 80, Q$MegaminxPuzzle$Face = 81, Q$MegaminxPuzzle$MegaminxState = 82, Q$NoInspectionFiveByFiveCubePuzzle = 83, Q$NoInspectionFourByFourCubePuzzle = 84, Q$NoInspectionThreeByThreeCubePuzzle = 85, Q$PyraminxPuzzle = 86, Q$PyraminxPuzzle$PyraminxState = 87, Q$SkewbPuzzle = 88, Q$SkewbPuzzle$SkewbState = 89, Q$SquareOnePuzzle = 90, Q$SquareOnePuzzle$SquareOneState = 91, Q$SquareOneUnfilteredPuzzle = 92, Q$ThreeByThreeCubeFewestMovesPuzzle = 93, Q$ThreeByThreeCubePuzzle = 94, Q$TwoByTwoCubePuzzle = 95, CM$ = {};
function newSeed(id){
  return new seedTable[id];
}

function defineSeed(id, superSeed, castableTypeMap){
  var seed = seedTable[id];
  if (seed && !seed.___clazz$) {
    _ = seed.prototype;
  }
   else {
    !seed && (seed = seedTable[id] = function(){
    }
    );
    _ = seed.prototype = superSeed < 0?{}:newSeed(superSeed);
    _.castableTypeMap$ = castableTypeMap;
  }
  for (var i_0 = 3; i_0 < arguments.length; ++i_0) {
    arguments[i_0].prototype = _;
  }
  if (seed.___clazz$) {
    _.___clazz$ = seed.___clazz$;
    seed.___clazz$ = null;
  }
}

function makeCastMap(a){
  var result = {};
  for (var i_0 = 0, c = a.length; i_0 < c; ++i_0) {
    result[a[i_0]] = 1;
  }
  return result;
}

function nullMethod(){
}

defineSeed(1, -1, CM$);
_.equals$ = function equals(other){
  return this === other;
}
;
_.getClass$ = function getClass_0(){
  return this.___clazz$;
}
;
_.hashCode$ = function hashCode_0(){
  return getHashCode(this);
}
;
_.toString$ = function toString_0(){
  return this.___clazz$.typeName + '@' + toPowerOfTwoString(this.hashCode$());
}
;
_.toString = function(){
  return this.toString$();
}
;
_.typeMarker$ = nullMethod;
function setUncaughtExceptionHandler(handler){
  sUncaughtExceptionHandler = handler;
}

var sUncaughtExceptionHandler = null;
function $getStackTrace(this$static){
  if (this$static.stackTrace == null) {
    return initDim(_3Ljava_lang_StackTraceElement_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$StackTraceElement, 0, 0);
  }
  return this$static.stackTrace;
}

function $setStackTrace(this$static, stackTrace){
  var c, copy, i_0;
  copy = initDim(_3Ljava_lang_StackTraceElement_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$StackTraceElement, stackTrace.length, 0);
  for (i_0 = 0 , c = stackTrace.length; i_0 < c; ++i_0) {
    if (!stackTrace[i_0]) {
      throw new NullPointerException_0;
    }
    copy[i_0] = stackTrace[i_0];
  }
  this$static.stackTrace = copy;
}

function Throwable_0(){
  com_google_gwt_core_client_impl_StackTraceCreator_Collector().fillInStackTrace(this);
}

function Throwable_1(message, cause){
  com_google_gwt_core_client_impl_StackTraceCreator_Collector().fillInStackTrace(this);
  this.cause = cause;
  this.detailMessage = message;
}

defineSeed(8, 1, makeCastMap([Q$Serializable, Q$Throwable]));
_.getMessage = function getMessage(){
  return this.detailMessage;
}
;
_.toString$ = function toString_1(){
  var className, msg;
  className = this.___clazz$.typeName;
  msg = this.getMessage();
  return msg != null?className + ': ' + msg:className;
}
;
_.cause = null;
_.detailMessage = null;
_.stackTrace = null;
function Exception_0(message){
  com_google_gwt_core_client_impl_StackTraceCreator_Collector().fillInStackTrace(this);
  this.detailMessage = message;
}

defineSeed(7, 8, makeCastMap([Q$Serializable, Q$Exception, Q$Throwable]));
function RuntimeException_0(){
  Throwable_0.call(this);
}

function RuntimeException_1(message){
  Exception_0.call(this, message);
}

defineSeed(6, 7, makeCastMap([Q$Serializable, Q$Exception, Q$Throwable]), RuntimeException_0, RuntimeException_1);
function JavaScriptException_0(e){
  RuntimeException_0.call(this);
  this.e = e;
  this.description = '';
  com_google_gwt_core_client_impl_StackTraceCreator_Collector().createStackTrace(this);
}

function getExceptionDescription(e){
  return instanceOfJso(e)?getExceptionDescription0(dynamicCastJso(e)):e + '';
}

function getExceptionDescription0(e){
  return e == null?null:e.message;
}

function getExceptionName(e){
  return e == null?'null':instanceOfJso(e)?getExceptionName0(dynamicCastJso(e)):instanceOf(e, Q$String)?'String':getClass__devirtual$(e).typeName;
}

function getExceptionName0(e){
  return e == null?null:e.name;
}

function getExceptionProperties(e){
  return instanceOfJso(e)?getProperties(dynamicCastJso(e)):'';
}

defineSeed(5, 6, makeCastMap([Q$Serializable, Q$Exception, Q$Throwable]), JavaScriptException_0);
_.getMessage = function getMessage_0(){
  this.message_0 == null && (this.name_0 = getExceptionName(this.e) , this.description = this.description + ': ' + getExceptionDescription(this.e) , this.message_0 = '(' + this.name_0 + ') ' + getExceptionProperties(this.e) + this.description , undefined);
  return this.message_0;
}
;
_.description = '';
_.e = null;
_.message_0 = null;
_.name_0 = null;
function equals__devirtual$(this$static, other){
  var maybeJsoInvocation;
  return maybeJsoInvocation = this$static , isJavaObject(maybeJsoInvocation)?maybeJsoInvocation.equals$(other):maybeJsoInvocation === other;
}

function getClass__devirtual$(this$static){
  var maybeJsoInvocation;
  return maybeJsoInvocation = this$static , isJavaObject(maybeJsoInvocation)?maybeJsoInvocation.___clazz$:Lcom_google_gwt_core_client_JavaScriptObject_2_classLit;
}

function hashCode__devirtual$(this$static){
  var maybeJsoInvocation;
  return maybeJsoInvocation = this$static , isJavaObject(maybeJsoInvocation)?maybeJsoInvocation.hashCode$():getHashCode(maybeJsoInvocation);
}

function create(milliseconds){
  return new Date(milliseconds);
}

function $clinit_JsonUtils(){
  var out;
  $clinit_JsonUtils = nullMethod;
  escapeTable = (out = ['\\u0000', '\\u0001', '\\u0002', '\\u0003', '\\u0004', '\\u0005', '\\u0006', '\\u0007', '\\b', '\\t', '\\n', '\\u000B', '\\f', '\\r', '\\u000E', '\\u000F', '\\u0010', '\\u0011', '\\u0012', '\\u0013', '\\u0014', '\\u0015', '\\u0016', '\\u0017', '\\u0018', '\\u0019', '\\u001A', '\\u001B', '\\u001C', '\\u001D', '\\u001E', '\\u001F'] , out[34] = '\\"' , out[92] = '\\\\' , out[173] = '\\u00ad' , out[1536] = '\\u0600' , out[1537] = '\\u0601' , out[1538] = '\\u0602' , out[1539] = '\\u0603' , out[1757] = '\\u06dd' , out[1807] = '\\u070f' , out[6068] = '\\u17b4' , out[6069] = '\\u17b5' , out[8203] = '\\u200b' , out[8204] = '\\u200c' , out[8205] = '\\u200d' , out[8206] = '\\u200e' , out[8207] = '\\u200f' , out[8232] = '\\u2028' , out[8233] = '\\u2029' , out[8234] = '\\u202a' , out[8235] = '\\u202b' , out[8236] = '\\u202c' , out[8237] = '\\u202d' , out[8238] = '\\u202e' , out[8288] = '\\u2060' , out[8289] = '\\u2061' , out[8290] = '\\u2062' , out[8291] = '\\u2063' , out[8292] = '\\u2064' , out[8298] = '\\u206a' , out[8299] = '\\u206b' , out[8300] = '\\u206c' , out[8301] = '\\u206d' , out[8302] = '\\u206e' , out[8303] = '\\u206f' , out[65279] = '\\ufeff' , out[65529] = '\\ufff9' , out[65530] = '\\ufffa' , out[65531] = '\\ufffb' , out);
  typeof JSON == 'object' && typeof JSON.parse == 'function';
}

function escapeValue(toEscape){
  $clinit_JsonUtils();
  var s = toEscape.replace(/[\x00-\x1f\xad\u0600-\u0603\u06dd\u070f\u17b4\u17b5\u200b-\u200f\u2028-\u202e\u2060-\u2064\u206a-\u206f\ufeff\ufff9-\ufffb"\\]/g, function(x){
    var lookedUp;
    return lookedUp = escapeTable[x.charCodeAt(0)] , lookedUp == null?x:lookedUp;
  }
  );
  return '"' + s + '"';
}

var escapeTable;
defineSeed(14, 1, {});
function apply(jsFunction, thisObj, args){
  return jsFunction.apply(thisObj, args);
  var __0;
}

function enter(){
  var now;
  if (entryDepth != 0) {
    now = (new Date).getTime();
    if (now - watchdogEntryDepthLastScheduled > 2000) {
      watchdogEntryDepthLastScheduled = now;
      watchdogEntryDepthTimerId = watchdogEntryDepthSchedule();
    }
  }
  if (entryDepth++ == 0) {
    $flushEntryCommands(($clinit_SchedulerImpl() , INSTANCE));
    return true;
  }
  return false;
}

function entry_0(jsFunction){
  return function(){
    try {
      return entry0(jsFunction, this, arguments);
    }
     catch (e) {
      throw e;
    }
  }
  ;
}

function entry0(jsFunction, thisObj, args){
  var initialEntry, t;
  initialEntry = enter();
  try {
    if (sUncaughtExceptionHandler) {
      try {
        return apply(jsFunction, thisObj, args);
      }
       catch ($e0) {
        $e0 = caught($e0);
        if (instanceOf($e0, Q$Throwable)) {
          t = $e0;
          $onUncaughtException(sUncaughtExceptionHandler, t);
          return undefined;
        }
         else 
          throw $e0;
      }
    }
     else {
      return apply(jsFunction, thisObj, args);
    }
  }
   finally {
    exit(initialEntry);
  }
}

function exit(initialEntry){
  initialEntry && $flushFinallyCommands(($clinit_SchedulerImpl() , INSTANCE));
  --entryDepth;
  if (initialEntry) {
    if (watchdogEntryDepthTimerId != -1) {
      watchdogEntryDepthCancel(watchdogEntryDepthTimerId);
      watchdogEntryDepthTimerId = -1;
    }
  }
}

function getHashCode(o){
  return o.$H || (o.$H = ++sNextHashId);
}

function watchdogEntryDepthCancel(timerId){
  $wnd.clearTimeout(timerId);
}

function watchdogEntryDepthSchedule(){
  return $wnd.setTimeout(function(){
    entryDepth != 0 && (entryDepth = 0);
    watchdogEntryDepthTimerId = -1;
  }
  , 10);
}

var entryDepth = 0, sNextHashId = 0, watchdogEntryDepthLastScheduled = 0, watchdogEntryDepthTimerId = -1;
function $clinit_SchedulerImpl(){
  $clinit_SchedulerImpl = nullMethod;
  INSTANCE = new SchedulerImpl_0;
}

function $flushEntryCommands(this$static){
  var oldQueue, rescheduled;
  if (this$static.entryCommands) {
    rescheduled = null;
    do {
      oldQueue = this$static.entryCommands;
      this$static.entryCommands = null;
      rescheduled = runScheduledTasks(oldQueue, rescheduled);
    }
     while (this$static.entryCommands);
    this$static.entryCommands = rescheduled;
  }
}

function $flushFinallyCommands(this$static){
  var oldQueue, rescheduled;
  if (this$static.finallyCommands) {
    rescheduled = null;
    do {
      oldQueue = this$static.finallyCommands;
      this$static.finallyCommands = null;
      rescheduled = runScheduledTasks(oldQueue, rescheduled);
    }
     while (this$static.finallyCommands);
    this$static.finallyCommands = rescheduled;
  }
}

function SchedulerImpl_0(){
}

function push(queue, task){
  !queue && (queue = []);
  queue[queue.length] = task;
  return queue;
}

function runScheduledTasks(tasks, rescheduled){
  var e, i_0, j, t;
  for (i_0 = 0 , j = tasks.length; i_0 < j; ++i_0) {
    t = tasks[i_0];
    try {
      t[1]?t[0].nullMethod() && (rescheduled = push(rescheduled, t)):t[0].nullMethod();
    }
     catch ($e0) {
      $e0 = caught($e0);
      if (instanceOf($e0, Q$Throwable)) {
        e = $e0;
        !!sUncaughtExceptionHandler && $onUncaughtException(sUncaughtExceptionHandler, e);
      }
       else 
        throw $e0;
    }
  }
  return rescheduled;
}

defineSeed(16, 14, {}, SchedulerImpl_0);
_.entryCommands = null;
_.finallyCommands = null;
var INSTANCE;
function extractNameFromToString(fnToString){
  var index, start, toReturn;
  toReturn = '';
  fnToString = $trim(fnToString);
  index = fnToString.indexOf('(');
  start = fnToString.indexOf('function') == 0?8:0;
  if (index == -1) {
    index = $indexOf(fnToString, fromCodePoint(64));
    start = fnToString.indexOf('function ') == 0?9:0;
  }
  index != -1 && (toReturn = $trim(fnToString.substr(start, index - start)));
  return toReturn.length > 0?toReturn:'anonymous';
}

function getProperties(e){
  return $getProperties((com_google_gwt_core_client_impl_StackTraceCreator_Collector() , e));
}

function parseInt_0(number){
  return parseInt(number) || -1;
}

function splice(arr, length_0){
  arr.length >= length_0 && arr.splice(0, length_0);
  return arr;
}

function $getProperties(e){
  var result = '';
  try {
    for (var prop in e) {
      if (prop != 'name' && prop != 'message' && prop != 'toString') {
        try {
          result += '\n ' + prop + ': ' + e[prop];
        }
         catch (ignored) {
        }
      }
    }
  }
   catch (ignored) {
  }
  return result;
}

function $makeException(){
  try {
    null.a();
  }
   catch (e) {
    return e;
  }
}

function StackTraceCreator$Collector_0(){
}

defineSeed(19, 1, {}, StackTraceCreator$Collector_0);
_.collect = function collect(){
  var seen = {};
  var toReturn = [];
  var callee = arguments.callee.caller.caller;
  while (callee) {
    var name_0 = this.extractName(callee.toString());
    toReturn.push(name_0);
    var keyName = ':' + name_0;
    var withThisName = seen[keyName];
    if (withThisName) {
      var i_0, j;
      for (i_0 = 0 , j = withThisName.length; i_0 < j; i_0++) {
        if (withThisName[i_0] === callee) {
          return toReturn;
        }
      }
    }
    (withThisName || (seen[keyName] = [])).push(callee);
    callee = callee.caller;
  }
  return toReturn;
}
;
_.createStackTrace = function createStackTrace(e){
  var i_0, j, stack, stackTrace;
  stack = this.inferFrom(instanceOfJso(e.e)?dynamicCastJso(e.e):null);
  stackTrace = initDim(_3Ljava_lang_StackTraceElement_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$StackTraceElement, stack.length, 0);
  for (i_0 = 0 , j = stackTrace.length; i_0 < j; ++i_0) {
    stackTrace[i_0] = new StackTraceElement_0(stack[i_0], null, -1);
  }
  $setStackTrace(e, stackTrace);
}
;
_.extractName = function extractName(fnToString){
  return extractNameFromToString(fnToString);
}
;
_.fillInStackTrace = function fillInStackTrace(t){
  var i_0, j, stack, stackTrace;
  stack = com_google_gwt_core_client_impl_StackTraceCreator_Collector().collect();
  stackTrace = initDim(_3Ljava_lang_StackTraceElement_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$StackTraceElement, stack.length, 0);
  for (i_0 = 0 , j = stackTrace.length; i_0 < j; ++i_0) {
    stackTrace[i_0] = new StackTraceElement_0(stack[i_0], null, -1);
  }
  $setStackTrace(t, stackTrace);
}
;
_.inferFrom = function inferFrom(e){
  return [];
}
;
function $inferFrom(this$static, e){
  var i_0, j, stack;
  stack = this$static.getStack(e);
  for (i_0 = 0 , j = stack.length; i_0 < j; ++i_0) {
    stack[i_0] = this$static.extractName(stack[i_0]);
  }
  return stack;
}

function StackTraceCreator$CollectorMoz_0(){
}

defineSeed(21, 19, {}, StackTraceCreator$CollectorMoz_0);
_.collect = function collect_0(){
  return splice(this.inferFrom($makeException()), this.toSplice());
}
;
_.getStack = function getStack(e){
  return e && e.stack?e.stack.split('\n'):[];
}
;
_.inferFrom = function inferFrom_0(e){
  return $inferFrom(this, e);
}
;
_.toSplice = function toSplice(){
  return 2;
}
;
function $clinit_StackTraceCreator$CollectorChrome(){
  $clinit_StackTraceCreator$CollectorChrome = nullMethod;
  Error.stackTraceLimit = 128;
}

function $inferFrom_0(this$static, e){
  var stack;
  stack = $inferFrom(this$static, e);
  return stack.length == 0?(new StackTraceCreator$Collector_0).inferFrom(e):splice(stack, 1);
}

function $parseStackTrace(this$static, e, stack){
  var col, endFileUrl, fileName, i_0, j, lastColon, line, location_0, stackElements, stackTrace;
  stackTrace = initDim(_3Ljava_lang_StackTraceElement_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$StackTraceElement, stack.length, 0);
  for (i_0 = 0 , j = stackTrace.length; i_0 < j; ++i_0) {
    stackElements = $split(stack[i_0], '@@', 0);
    line = -1;
    col = -1;
    fileName = 'Unknown';
    if (stackElements.length == 2 && stackElements[1] != null) {
      location_0 = stackElements[1];
      lastColon = $lastIndexOf(location_0, fromCodePoint(58));
      endFileUrl = $lastIndexOf_0(location_0, fromCodePoint(58), lastColon - 1);
      fileName = location_0.substr(0, endFileUrl - 0);
      if (lastColon != -1 && endFileUrl != -1) {
        line = parseInt_0(location_0.substr(endFileUrl + 1, lastColon - (endFileUrl + 1)));
        col = parseInt_0($substring(location_0, lastColon + 1));
      }
    }
    stackTrace[i_0] = new StackTraceElement_0(stackElements[0], fileName + '@' + col, this$static.replaceIfNoSourceMap(line < 0?-1:line));
  }
  $setStackTrace(e, stackTrace);
}

defineSeed(20, 21, {});
_.collect = function collect_1(){
  var res;
  res = splice($inferFrom_0(this, $makeException()), 3);
  res.length == 0 && (res = splice((new StackTraceCreator$Collector_0).collect(), 1));
  return res;
}
;
_.createStackTrace = function createStackTrace_0(e){
  var stack;
  stack = $inferFrom_0(this, instanceOfJso(e.e)?dynamicCastJso(e.e):null);
  $parseStackTrace(this, e, stack);
}
;
_.extractName = function extractName_0(fnToString){
  var closeParen, index, location_0, toReturn;
  if (fnToString.length == 0) {
    return 'anonymous';
  }
  toReturn = $trim(fnToString);
  toReturn.indexOf('at ') == 0 && (toReturn = $substring(toReturn, 3));
  index = toReturn.indexOf('[');
  index != -1 && (toReturn = $trim(toReturn.substr(0, index - 0)) + $trim($substring(toReturn, toReturn.indexOf(']', index) + 1)));
  index = toReturn.indexOf('(');
  if (index == -1) {
    index = toReturn.indexOf('@');
    if (index == -1) {
      location_0 = toReturn;
      toReturn = '';
    }
     else {
      location_0 = $trim($substring(toReturn, index + 1));
      toReturn = $trim(toReturn.substr(0, index - 0));
    }
  }
   else {
    closeParen = toReturn.indexOf(')', index);
    location_0 = toReturn.substr(index + 1, closeParen - (index + 1));
    toReturn = $trim(toReturn.substr(0, index - 0));
  }
  index = $indexOf(toReturn, fromCodePoint(46));
  index != -1 && (toReturn = $substring(toReturn, index + 1));
  return (toReturn.length > 0?toReturn:'anonymous') + '@@' + location_0;
}
;
_.fillInStackTrace = function fillInStackTrace_0(t){
  var stack;
  stack = com_google_gwt_core_client_impl_StackTraceCreator_Collector().collect();
  $parseStackTrace(this, t, stack);
}
;
_.inferFrom = function inferFrom_1(e){
  return $inferFrom_0(this, e);
}
;
_.replaceIfNoSourceMap = function replaceIfNoSourceMap(line){
  return line;
}
;
_.toSplice = function toSplice_0(){
  return 3;
}
;
function StackTraceCreator$CollectorChromeNoSourceMap_0(){
  $clinit_StackTraceCreator$CollectorChrome();
}

defineSeed(22, 20, {}, StackTraceCreator$CollectorChromeNoSourceMap_0);
_.replaceIfNoSourceMap = function replaceIfNoSourceMap_0(line){
  return -1;
}
;
function StackTraceCreator$CollectorOpera_0(){
}

defineSeed(23, 21, {}, StackTraceCreator$CollectorOpera_0);
_.extractName = function extractName_1(fnToString){
  return fnToString.length == 0?'anonymous':fnToString;
}
;
_.getStack = function getStack_0(e){
  var i_0, i2, idx, j, toReturn;
  toReturn = e && e.message?e.message.split('\n'):[];
  for (i_0 = 0 , i2 = 0 , j = toReturn.length; i2 < j; ++i_0 , i2 += 2) {
    idx = toReturn[i2].lastIndexOf('function ');
    idx == -1?(toReturn[i_0] = '' , undefined):(toReturn[i_0] = $trim($substring(toReturn[i2], idx + 9)) , undefined);
  }
  toReturn.length = i_0;
  return toReturn;
}
;
_.toSplice = function toSplice_1(){
  return 3;
}
;
defineSeed(24, 1, {});
function StringBufferImplAppend_0(){
}

defineSeed(25, 24, {}, StringBufferImplAppend_0);
_.append = function append(data, x){
  this.string += x;
}
;
_.append_0 = function append_0(data, x){
  this.string += x;
}
;
_.append_1 = function append_1(data, x){
  this.string += x;
}
;
_.append_2 = function append_2(data, x){
  this.string += x;
}
;
_.appendNonNull = function appendNonNull(data, x){
  this.string += x;
}
;
_.createData = function createData(){
  return null;
}
;
_.length_0 = function length_1(data){
  return this.string.length;
}
;
_.replace_0 = function replace_0(data, start, end, toInsert){
  this.string = $substring_0(this.string, 0, start) + toInsert + $substring(this.string, end);
}
;
_.toString_0 = function toString_2(data){
  return this.string;
}
;
_.string = '';
function $appendNonNull(a, x){
  a[a.explicitLength++] = x;
}

function $takeString(a){
  var s = a.join('');
  a.length = a.explicitLength = 0;
  return s;
}

function $toString(this$static, a){
  var s;
  s = $takeString(a);
  $appendNonNull(a, s);
  return s;
}

defineSeed(27, 24, {});
_.append = function append_3(a, x){
  a[a.explicitLength++] = x;
}
;
_.append_0 = function append_4(a, x){
  a[a.explicitLength++] = x;
}
;
_.append_1 = function append_5(a, x){
  $appendNonNull(a, '' + x);
}
;
_.append_2 = function append_6(a, x){
  a[a.explicitLength++] = x == null?'null':x;
}
;
_.appendNonNull = function appendNonNull_0(a, x){
  $appendNonNull(a, x);
}
;
_.createData = function createData_0(){
  var array = [];
  array.explicitLength = 0;
  return array;
}
;
_.length_0 = function length_2(a){
  return $toString(this, a).length;
}
;
_.replace_0 = function replace_1(a, start, end, toInsert){
  var s;
  s = $takeString(a);
  $appendNonNull(a, s.substr(0, start - 0));
  a[a.explicitLength++] = toInsert == null?'null':toInsert;
  $appendNonNull(a, $substring(s, end));
}
;
_.toString_0 = function toString_3(a){
  return $toString(this, a);
}
;
function StringBufferImplArray_0(){
}

defineSeed(26, 27, {}, StringBufferImplArray_0);
function $clinit_DOMImpl(){
  $clinit_DOMImpl = nullMethod;
  impl_0 = com_google_gwt_dom_client_DOMImpl();
}

function $getFirstChildElement(elem){
  var child = elem.firstChild;
  while (child && child.nodeType != 1)
    child = child.nextSibling;
  return child;
}

defineSeed(28, 1, {});
_.createElement_0 = function createElement(doc, tag){
  return doc.createElement(tag);
}
;
_.getTagName = function getTagName(elem){
  return elem.tagName;
}
;
_.imgSetSrc = function imgSetSrc(img, src){
  img.src = src;
}
;
_.setInnerText = function setInnerText(elem, text){
  while (elem.firstChild) {
    elem.removeChild(elem.firstChild);
  }
  text != null && elem.appendChild(elem.ownerDocument.createTextNode(text));
}
;
_.toString_1 = function toString_4(elem){
  return elem.outerHTML;
}
;
var impl_0;
function isOrHasChildImpl(parent_0, child){
  if (parent_0.nodeType != 1 && parent_0.nodeType != 9) {
    return parent_0 == child;
  }
  if (child.nodeType != 1) {
    child = child.parentNode;
    if (!child) {
      return false;
    }
  }
  if (parent_0.nodeType == 9) {
    return parent_0 === child || parent_0.body && parent_0.body.contains(child);
  }
   else {
    return parent_0 === child || parent_0.contains(child);
  }
}

defineSeed(30, 28, {});
_.createElement_0 = function createElement_0(doc, tagName){
  var container, elem;
  if (tagName.indexOf(':') != -1) {
    container = (!doc.__gwt_container && (doc.__gwt_container = doc.createElement('div')) , doc.__gwt_container);
    container.innerHTML = '<' + tagName + '/>' || '';
    elem = $getFirstChildElement(($clinit_DOMImpl() , container));
    container.removeChild(elem);
    return elem;
  }
  return doc.createElement(tagName);
}
;
_.eventGetRelatedTarget = function eventGetRelatedTarget(evt){
  return evt.relatedTarget || (evt.type == 'mouseout'?evt.toElement:evt.fromElement);
}
;
_.getTagName = function getTagName_0(elem){
  var scopeName, tagName;
  tagName = elem.tagName;
  scopeName = elem.scopeName;
  if (scopeName == null || $equalsIgnoreCase('html', scopeName)) {
    return tagName;
  }
  return scopeName + ':' + tagName;
}
;
_.isOrHasChild = function isOrHasChild(parent_0, child){
  return isOrHasChildImpl(parent_0, child);
}
;
_.setInnerText = function setInnerText_0(elem, text){
  elem.innerText = text || '';
}
;
var currentEventTarget = null;
function DOMImplIE6_0(){
  $clinit_DOMImpl();
}

function isIE6_0(){
  if (!isIE6Detected) {
    isIE6 = isIE6Impl();
    isIE6Detected = true;
  }
  return isIE6;
}

function isIE6Impl(){
  function makeVersion(result){
    return parseInt(result[1]) * 1000 + parseInt(result[2]);
  }

  var ua = navigator.userAgent.toLowerCase();
  if (ua.indexOf('msie') != -1) {
    var result_0 = /msie ([0-9]+)\.([0-9]+)/.exec(ua);
    if (result_0 && result_0.length == 3) {
      var v = makeVersion(result_0);
      if (v < 7000) {
        return true;
      }
    }
  }
  return false;
}

defineSeed(29, 30, {}, DOMImplIE6_0);
_.imgSetSrc = function imgSetSrc_0(img, src){
  isIE6_0()?setImgSrc(img, src):(img.src = src , undefined);
}
;
var isIE6 = false, isIE6Detected = false;
function DOMImplIE8_0(){
  $clinit_DOMImpl();
}

defineSeed(31, 30, {}, DOMImplIE8_0);
defineSeed(34, 28, {});
_.eventGetRelatedTarget = function eventGetRelatedTarget_0(evt){
  return evt.relatedTarget;
}
;
_.isOrHasChild = function isOrHasChild_0(parent_0, child){
  return parent_0.contains(child);
}
;
_.setInnerText = function setInnerText_1(elem, text){
  elem.textContent = text || '';
}
;
defineSeed(33, 34, {});
function DOMImplIE9_0(){
  $clinit_DOMImpl();
}

defineSeed(32, 33, {}, DOMImplIE9_0);
_.isOrHasChild = function isOrHasChild_1(parent_0, child){
  return isOrHasChildImpl(parent_0, child);
}
;
function DOMImplMozilla_0(){
  $clinit_DOMImpl();
}

defineSeed(35, 34, {}, DOMImplMozilla_0);
_.eventGetRelatedTarget = function eventGetRelatedTarget_1(evt){
  var relatedTarget = evt.relatedTarget;
  if (!relatedTarget) {
    return null;
  }
  try {
    var nodeName = relatedTarget.nodeName;
    return relatedTarget;
  }
   catch (e) {
    return null;
  }
}
;
_.isOrHasChild = function isOrHasChild_2(parent_0, child){
  return parent_0 === child || !!(parent_0.compareDocumentPosition(child) & 16);
}
;
_.toString_1 = function toString_5(elem){
  var doc = elem.ownerDocument;
  var temp = elem.cloneNode(true);
  var tempDiv = doc.createElement('DIV');
  tempDiv.appendChild(temp);
  outer = tempDiv.innerHTML;
  temp.innerHTML = '';
  return outer;
}
;
function DOMImplOpera_0(){
  $clinit_DOMImpl();
}

defineSeed(36, 34, {}, DOMImplOpera_0);
function DOMImplWebkit_0(){
  $clinit_DOMImpl();
}

defineSeed(37, 33, {}, DOMImplWebkit_0);
function $isOrHasChild(this$static, child){
  return ($clinit_DOMImpl() , impl_0).isOrHasChild(this$static, child);
}

function $createDivElement(this$static){
  return ($clinit_DOMImpl() , impl_0).createElement_0(this$static, 'div');
}

function $createImageElement(this$static){
  return ($clinit_DOMImpl() , impl_0).createElement_0(this$static, 'img');
}

function $getString(this$static){
  return ($clinit_DOMImpl() , impl_0).toString_1(this$static);
}

function $setInnerHTML(this$static, html){
  this$static.innerHTML = html || '';
}

function $setInnerText(this$static, text){
  ($clinit_DOMImpl() , impl_0).setInnerText(this$static, text);
}

function $setSrc(this$static, src){
  ($clinit_DOMImpl() , impl_0).imgSetSrc(this$static, src);
}

function $clinit_ImageSrcIE6(){
  $clinit_ImageSrcIE6 = nullMethod;
  executeBackgroundImageCacheCommand();
}

function addTop(srcImgMap, img, src){
  img.src = src;
  if (img.complete) {
    return;
  }
  img.__kids = [];
  img.__pendingSrc = src;
  srcImgMap[src] = img;
  var _onload = img.onload, _onerror = img.onerror, _onabort = img.onabort;
  function finish(_originalHandler){
    var kids = img.__kids;
    img.__cleanup();
    window.setTimeout(function(){
      for (var i_0 = 0; i_0 < kids.length; ++i_0) {
        var kid = kids[i_0];
        if (kid.__pendingSrc == src) {
          kid.src = src;
          kid.__pendingSrc = null;
        }
      }
    }
    , 0);
    _originalHandler && _originalHandler.call(img);
  }

  img.onload = function(){
    finish(_onload);
  }
  ;
  img.onerror = function(){
    finish(_onerror);
  }
  ;
  img.onabort = function(){
    finish(_onabort);
  }
  ;
  img.__cleanup = function(){
    img.onload = _onload;
    img.onerror = _onerror;
    img.onabort = _onabort;
    img.__cleanup = img.__pendingSrc = img.__kids = null;
    delete srcImgMap[src];
  }
  ;
}

function cleanupExpandos(img){
  img.__cleanup = img.__pendingSrc = img.__kids = null;
}

function executeBackgroundImageCacheCommand(){
  try {
    $doc.execCommand('BackgroundImageCache', false, true);
  }
   catch (e) {
  }
}

function removeChild(parent_0, child, checkOnly){
  var kids = parent_0.__kids;
  for (var i_0 = 0, c = kids.length; i_0 < c; ++i_0) {
    if (kids[i_0] === child) {
      if (!checkOnly) {
        kids.splice(i_0, 1);
        child.__pendingSrc = null;
      }
      return true;
    }
  }
  return false;
}

function removeTop(srcImgMap, img){
  var src = img.__pendingSrc;
  var kids = img.__kids;
  img.__cleanup();
  if (img = kids[0]) {
    img.__pendingSrc = null;
    addTop(srcImgMap, img, src);
    if (img.__pendingSrc) {
      kids.splice(0, 1);
      img.__kids = kids;
    }
     else {
      for (var i_0 = 1, c = kids.length; i_0 < c; ++i_0) {
        kids[i_0].src = src;
        kids[i_0].__pendingSrc = null;
      }
    }
  }
}

function setImgSrc(img, src){
  $clinit_ImageSrcIE6();
  var isSameSource, oldSrc, top_0;
  isSameSource = $equals_0(img.__pendingSrc || img.src, src);
  !srcImgMap_0 && (srcImgMap_0 = {});
  oldSrc = img.__pendingSrc;
  if (oldSrc != null) {
    top_0 = srcImgMap_0[oldSrc];
    if (!top_0) {
      cleanupExpandos(img);
    }
     else if (top_0 == img) {
      if (isSameSource) {
        return;
      }
      removeTop(srcImgMap_0, top_0);
    }
     else if (removeChild(top_0, img, isSameSource)) {
      if (isSameSource) {
        return;
      }
    }
     else {
      cleanupExpandos(img);
    }
  }
  top_0 = srcImgMap_0[src];
  !top_0?addTop(srcImgMap_0, img, src):(top_0.__kids.push(img) , img.__pendingSrc = top_0.__pendingSrc , undefined);
}

var srcImgMap_0 = null;
function $compareTo(this$static, other){
  return this$static.ordinal - other.ordinal;
}

function Enum_0(name_0, ordinal){
  this.name_0 = name_0;
  this.ordinal = ordinal;
}

function createValueOfMap(enumConstants){
  var result, value, value$index, value$max;
  result = {};
  for (value$index = 0 , value$max = enumConstants.length; value$index < value$max; ++value$index) {
    value = enumConstants[value$index];
    result[':' + value.name_0] = value;
  }
  return result;
}

function valueOf(map, name_0){
  var result;
  result = map[':' + name_0];
  if (result) {
    return result;
  }
  if (name_0 == null) {
    throw new NullPointerException_0;
  }
  throw new IllegalArgumentException_0;
}

defineSeed(46, 1, makeCastMap([Q$Serializable, Q$Comparable, Q$Enum]));
_.compareTo$ = function compareTo(other){
  return $compareTo(this, dynamicCast(other, Q$Enum));
}
;
_.equals$ = function equals_0(other){
  return this === other;
}
;
_.hashCode$ = function hashCode_1(){
  return getHashCode(this);
}
;
_.toString$ = function toString_6(){
  return this.name_0;
}
;
_.name_0 = null;
_.ordinal = 0;
function $clinit_Style$TextAlign(){
  $clinit_Style$TextAlign = nullMethod;
  CENTER = new Style$TextAlign$1_0;
  JUSTIFY = new Style$TextAlign$2_0;
  LEFT = new Style$TextAlign$3_0;
  RIGHT = new Style$TextAlign$4_0;
  $VALUES = initValues(_3Lcom_google_gwt_dom_client_Style$TextAlign_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$Style$TextAlign, [CENTER, JUSTIFY, LEFT, RIGHT]);
}

function values_0(){
  $clinit_Style$TextAlign();
  return $VALUES;
}

defineSeed(45, 46, makeCastMap([Q$Style$HasCssName, Q$Style$TextAlign, Q$Serializable, Q$Comparable, Q$Enum]));
var $VALUES, CENTER, JUSTIFY, LEFT, RIGHT;
function Style$TextAlign$1_0(){
  Enum_0.call(this, 'CENTER', 0);
}

defineSeed(47, 45, makeCastMap([Q$Style$HasCssName, Q$Style$TextAlign, Q$Serializable, Q$Comparable, Q$Enum]), Style$TextAlign$1_0);
function Style$TextAlign$2_0(){
  Enum_0.call(this, 'JUSTIFY', 1);
}

defineSeed(48, 45, makeCastMap([Q$Style$HasCssName, Q$Style$TextAlign, Q$Serializable, Q$Comparable, Q$Enum]), Style$TextAlign$2_0);
function Style$TextAlign$3_0(){
  Enum_0.call(this, 'LEFT', 2);
}

defineSeed(49, 45, makeCastMap([Q$Style$HasCssName, Q$Style$TextAlign, Q$Serializable, Q$Comparable, Q$Enum]), Style$TextAlign$3_0);
function Style$TextAlign$4_0(){
  Enum_0.call(this, 'RIGHT', 3);
}

defineSeed(50, 45, makeCastMap([Q$Style$HasCssName, Q$Style$TextAlign, Q$Serializable, Q$Comparable, Q$Enum]), Style$TextAlign$4_0);
function fireNativeEvent(){
}

function throwIfNull(value){
  if (null == value) {
    throw new NullPointerException_1('encodedURLComponent cannot be null');
  }
}

function getDirectionOnElement(elem){
  var dirPropertyValue;
  dirPropertyValue = elem['dir'] == null?null:String(elem['dir']);
  if ($equalsIgnoreCase('rtl', dirPropertyValue)) {
    return $clinit_HasDirection$Direction() , RTL;
  }
   else if ($equalsIgnoreCase('ltr', dirPropertyValue)) {
    return $clinit_HasDirection$Direction() , LTR;
  }
  return $clinit_HasDirection$Direction() , DEFAULT;
}

function setDirectionOnElement(elem, direction){
  switch (direction.ordinal) {
    case 0:
      {
        elem['dir'] = 'rtl';
        break;
      }

    case 1:
      {
        elem['dir'] = 'ltr';
        break;
      }

    case 2:
      {
        getDirectionOnElement(elem) != ($clinit_HasDirection$Direction() , DEFAULT) && (elem['dir'] = '' , undefined);
        break;
      }

  }
}

function $clinit_HasDirection$Direction(){
  $clinit_HasDirection$Direction = nullMethod;
  RTL = new HasDirection$Direction_0('RTL', 0);
  LTR = new HasDirection$Direction_0('LTR', 1);
  DEFAULT = new HasDirection$Direction_0('DEFAULT', 2);
  $VALUES_0 = initValues(_3Lcom_google_gwt_i18n_client_HasDirection$Direction_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$HasDirection$Direction, [RTL, LTR, DEFAULT]);
}

function HasDirection$Direction_0(enum$name, enum$ordinal){
  Enum_0.call(this, enum$name, enum$ordinal);
}

function values_1(){
  $clinit_HasDirection$Direction();
  return $VALUES_0;
}

defineSeed(59, 46, makeCastMap([Q$HasDirection$Direction, Q$Serializable, Q$Comparable, Q$Enum]), HasDirection$Direction_0);
var $VALUES_0, DEFAULT, LTR, RTL;
function $clinit_LocaleInfo(){
  $clinit_LocaleInfo = nullMethod;
  instance_0 = new LocaleInfo_0;
}

function $getNumberConstants(this$static){
  !this$static.numberConstants && (this$static.numberConstants = new NumberConstantsImpl__0);
  return this$static.numberConstants;
}

function LocaleInfo_0(){
}

defineSeed(60, 1, {}, LocaleInfo_0);
_.numberConstants = null;
var instance_0;
function $clinit_NumberFormat(){
  $clinit_NumberFormat = nullMethod;
  $getNumberConstants(($clinit_LocaleInfo() , $clinit_LocaleInfo() , instance_0));
}

function $addExponent(this$static, digits){
  var exponentDigits, i_0;
  digits.impl.append_2(digits.data, 'E');
  if (this$static.exponent < 0) {
    this$static.exponent = -this$static.exponent;
    digits.impl.append_2(digits.data, '-');
  }
  exponentDigits = '' + this$static.exponent;
  for (i_0 = exponentDigits.length; i_0 < this$static.minExponentDigits; ++i_0) {
    digits.impl.appendNonNull(digits.data, '0');
  }
  digits.impl.append_2(digits.data, exponentDigits);
}

function $addZeroAndDecimal(this$static, digits){
  if (this$static.digitsLength == 0) {
    digits.impl.replace_0(digits.data, 0, 0, '0');
    ++this$static.decimalPosition;
    ++this$static.digitsLength;
  }
  if (this$static.decimalPosition < this$static.digitsLength || this$static.decimalSeparatorAlwaysShown) {
    $insert(digits, this$static.decimalPosition, '.');
    ++this$static.digitsLength;
  }
}

function $adjustFractionDigits(this$static, digits){
  var requiredDigits, toRemove;
  requiredDigits = this$static.decimalPosition + this$static.minimumFractionDigits;
  if (this$static.digitsLength < requiredDigits) {
    while (this$static.digitsLength < requiredDigits) {
      digits.impl.appendNonNull(digits.data, '0');
      ++this$static.digitsLength;
    }
  }
   else {
    toRemove = this$static.decimalPosition + this$static.maximumFractionDigits;
    toRemove > this$static.digitsLength && (toRemove = this$static.digitsLength);
    while (toRemove > requiredDigits && $charAt(digits.impl.toString_0(digits.data), toRemove - 1) == 48) {
      --toRemove;
    }
    if (toRemove < this$static.digitsLength) {
      $delete_0(digits, toRemove, this$static.digitsLength);
      this$static.digitsLength = toRemove;
    }
  }
}

function $computeExponent(this$static, digits){
  var remainder, strip;
  strip = 0;
  while (strip < this$static.digitsLength - 1 && $charAt(digits.impl.toString_0(digits.data), strip) == 48) {
    ++strip;
  }
  if (strip > 0) {
    digits.impl.replace_0(digits.data, 0, strip, '');
    this$static.digitsLength -= strip;
    this$static.exponent -= strip;
  }
  if (this$static.maximumIntegerDigits > this$static.minimumIntegerDigits && this$static.maximumIntegerDigits > 0) {
    this$static.exponent += this$static.decimalPosition - 1;
    remainder = this$static.exponent % this$static.maximumIntegerDigits;
    remainder < 0 && (remainder += this$static.maximumIntegerDigits);
    this$static.decimalPosition = remainder + 1;
    this$static.exponent -= remainder;
  }
   else {
    this$static.exponent += this$static.decimalPosition - this$static.minimumIntegerDigits;
    this$static.decimalPosition = this$static.minimumIntegerDigits;
  }
  if (this$static.digitsLength == 1 && digits.impl.toString_0(digits.data).charCodeAt(0) == 48) {
    this$static.exponent = 0;
    this$static.decimalPosition = this$static.minimumIntegerDigits;
  }
}

function $format(this$static, number){
  var buf, isNegative, preRound, scale, useExponent, currentGroupingSize;
  if (isNaN(number)) {
    return 'NaN';
  }
  isNegative = number < 0 || number == 0 && 1 / number < 0;
  isNegative && (number = -number);
  buf = new StringBuilder_0;
  if (!isFinite(number)) {
    $append_5(buf, isNegative?this$static.negativePrefix:this$static.positivePrefix);
    buf.impl.append_2(buf.data, '\u221E');
    $append_5(buf, isNegative?this$static.negativeSuffix:this$static.positiveSuffix);
    return buf.impl.toString_0(buf.data);
  }
  number *= this$static.multiplier;
  scale = toScaledString(buf, number);
  preRound = buf.impl.length_0(buf.data) + scale + this$static.maximumFractionDigits + 3;
  if (preRound > 0 && preRound < buf.impl.length_0(buf.data) && $charAt(buf.impl.toString_0(buf.data), preRound) == 57) {
    $propagateCarry(this$static, buf, preRound - 1);
    scale += buf.impl.length_0(buf.data) - preRound;
    $delete_0(buf, preRound, buf.impl.length_0(buf.data));
  }
  this$static.exponent = 0;
  this$static.digitsLength = buf.impl.length_0(buf.data);
  this$static.decimalPosition = this$static.digitsLength + scale;
  useExponent = this$static.useExponentialNotation;
  currentGroupingSize = this$static.groupingSize;
  this$static.decimalPosition > 1024 && (useExponent = true);
  useExponent && $computeExponent(this$static, buf);
  $processLeadingZeros(this$static, buf);
  $roundValue(this$static, buf);
  $insertGroupingSeparators(this$static, buf, currentGroupingSize);
  $adjustFractionDigits(this$static, buf);
  $addZeroAndDecimal(this$static, buf);
  useExponent && $addExponent(this$static, buf);
  $insert(buf, 0, isNegative?this$static.negativePrefix:this$static.positivePrefix);
  $append_5(buf, isNegative?this$static.negativeSuffix:this$static.positiveSuffix);
  return buf.impl.toString_0(buf.data);
}

function $insertGroupingSeparators(this$static, digits, g){
  var i_0;
  if (g > 0) {
    for (i_0 = g; i_0 < this$static.decimalPosition; i_0 += g + 1) {
      $insert(digits, this$static.decimalPosition - i_0, ',');
      ++this$static.decimalPosition;
      ++this$static.digitsLength;
    }
  }
}

function $parseAffix(this$static, pattern, start, affix, inNegativePattern){
  var ch, inQuote, len, pos;
  $delete(affix, affix.impl.length_0(affix.data));
  inQuote = false;
  len = pattern.length;
  for (pos = start; pos < len; ++pos) {
    ch = pattern.charCodeAt(pos);
    if (ch == 39) {
      if (pos + 1 < len && pattern.charCodeAt(pos + 1) == 39) {
        ++pos;
        affix.impl.append_2(affix.data, "'");
      }
       else {
        inQuote = !inQuote;
      }
      continue;
    }
    if (inQuote) {
      affix.impl.appendNonNull(affix.data, String.fromCharCode(ch));
    }
     else {
      switch (ch) {
        case 35:
        case 48:
        case 44:
        case 46:
        case 59:
          return pos - start;
        case 164:
          this$static.isCurrencyFormat = true;
          if (pos + 1 < len && pattern.charCodeAt(pos + 1) == 164) {
            ++pos;
            if (pos < len - 3 && pattern.charCodeAt(pos + 1) == 164 && pattern.charCodeAt(pos + 2) == 164) {
              pos += 2;
              $append_2(affix, $getSimpleCurrencySymbol(this$static.currencyData));
            }
             else {
              $append_2(affix, this$static.currencyData[0]);
            }
          }
           else {
            $append_2(affix, this$static.currencyData[1]);
          }

          break;
        case 37:
          if (!inNegativePattern) {
            if (this$static.multiplier != 1) {
              throw new IllegalArgumentException_1('Too many percent/per mille characters in pattern "' + pattern + '"');
            }
            this$static.multiplier = 100;
          }

          affix.impl.append_2(affix.data, '%');
          break;
        case 8240:
          if (!inNegativePattern) {
            if (this$static.multiplier != 1) {
              throw new IllegalArgumentException_1('Too many percent/per mille characters in pattern "' + pattern + '"');
            }
            this$static.multiplier = 1000;
          }

          affix.impl.append_2(affix.data, '\u2030');
          break;
        case 45:
          affix.impl.append_2(affix.data, '-');
          break;
        default:affix.impl.appendNonNull(affix.data, String.fromCharCode(ch));
      }
    }
  }
  return len - start;
}

function $parsePattern(this$static, pattern){
  var affix, pos;
  pos = 0;
  affix = new StringBuffer_0;
  pos += $parseAffix(this$static, pattern, 0, affix, false);
  this$static.positivePrefix = affix.impl.toString_0(affix.data);
  pos += $parseTrunk(this$static, pattern, pos, false);
  pos += $parseAffix(this$static, pattern, pos, affix, false);
  this$static.positiveSuffix = affix.impl.toString_0(affix.data);
  if (pos < pattern.length && pattern.charCodeAt(pos) == 59) {
    ++pos;
    pos += $parseAffix(this$static, pattern, pos, affix, true);
    this$static.negativePrefix = affix.impl.toString_0(affix.data);
    pos += $parseTrunk(this$static, pattern, pos, true);
    pos += $parseAffix(this$static, pattern, pos, affix, true);
    this$static.negativeSuffix = affix.impl.toString_0(affix.data);
  }
   else {
    this$static.negativePrefix = '-' + this$static.positivePrefix;
    this$static.negativeSuffix = this$static.positiveSuffix;
  }
}

function $parseTrunk(this$static, pattern, start, ignorePattern){
  var ch, decimalPos, digitLeftCount, digitRightCount, effectiveDecimalPos, groupingCount, len, loop, n, pos, totalDigits, zeroDigitCount;
  decimalPos = -1;
  digitLeftCount = 0;
  zeroDigitCount = 0;
  digitRightCount = 0;
  groupingCount = -1;
  len = pattern.length;
  pos = start;
  loop = true;
  for (; pos < len && loop; ++pos) {
    ch = pattern.charCodeAt(pos);
    switch (ch) {
      case 35:
        zeroDigitCount > 0?++digitRightCount:++digitLeftCount;
        groupingCount >= 0 && decimalPos < 0 && ++groupingCount;
        break;
      case 48:
        if (digitRightCount > 0) {
          throw new IllegalArgumentException_1("Unexpected '0' in pattern \"" + pattern + '"');
        }

        ++zeroDigitCount;
        groupingCount >= 0 && decimalPos < 0 && ++groupingCount;
        break;
      case 44:
        groupingCount = 0;
        break;
      case 46:
        if (decimalPos >= 0) {
          throw new IllegalArgumentException_1('Multiple decimal separators in pattern "' + pattern + '"');
        }

        decimalPos = digitLeftCount + zeroDigitCount + digitRightCount;
        break;
      case 69:
        if (!ignorePattern) {
          if (this$static.useExponentialNotation) {
            throw new IllegalArgumentException_1('Multiple exponential symbols in pattern "' + pattern + '"');
          }
          this$static.useExponentialNotation = true;
          this$static.minExponentDigits = 0;
        }

        while (pos + 1 < len && pattern.charCodeAt(pos + 1) == 48) {
          ++pos;
          ignorePattern || ++this$static.minExponentDigits;
        }

        if (!ignorePattern && digitLeftCount + zeroDigitCount < 1 || this$static.minExponentDigits < 1) {
          throw new IllegalArgumentException_1('Malformed exponential pattern "' + pattern + '"');
        }

        loop = false;
        break;
      default:--pos;
        loop = false;
    }
  }
  if (zeroDigitCount == 0 && digitLeftCount > 0 && decimalPos >= 0) {
    n = decimalPos;
    decimalPos == 0 && ++n;
    digitRightCount = digitLeftCount - n;
    digitLeftCount = n - 1;
    zeroDigitCount = 1;
  }
  if (decimalPos < 0 && digitRightCount > 0 || decimalPos >= 0 && (decimalPos < digitLeftCount || decimalPos > digitLeftCount + zeroDigitCount) || groupingCount == 0) {
    throw new IllegalArgumentException_1('Malformed pattern "' + pattern + '"');
  }
  if (ignorePattern) {
    return pos - start;
  }
  totalDigits = digitLeftCount + zeroDigitCount + digitRightCount;
  this$static.maximumFractionDigits = decimalPos >= 0?totalDigits - decimalPos:0;
  if (decimalPos >= 0) {
    this$static.minimumFractionDigits = digitLeftCount + zeroDigitCount - decimalPos;
    this$static.minimumFractionDigits < 0 && (this$static.minimumFractionDigits = 0);
  }
  effectiveDecimalPos = decimalPos >= 0?decimalPos:totalDigits;
  this$static.minimumIntegerDigits = effectiveDecimalPos - digitLeftCount;
  if (this$static.useExponentialNotation) {
    this$static.maximumIntegerDigits = digitLeftCount + this$static.minimumIntegerDigits;
    this$static.maximumFractionDigits == 0 && this$static.minimumIntegerDigits == 0 && (this$static.minimumIntegerDigits = 1);
  }
  this$static.groupingSize = groupingCount > 0?groupingCount:0;
  this$static.decimalSeparatorAlwaysShown = decimalPos == 0 || decimalPos == totalDigits;
  return pos - start;
}

function $processLeadingZeros(this$static, digits){
  var i_0, prefix, strip;
  if (this$static.decimalPosition > this$static.digitsLength) {
    while (this$static.digitsLength < this$static.decimalPosition) {
      digits.impl.appendNonNull(digits.data, '0');
      ++this$static.digitsLength;
    }
  }
  if (!this$static.useExponentialNotation) {
    if (this$static.decimalPosition < this$static.minimumIntegerDigits) {
      prefix = new StringBuilder_0;
      while (this$static.decimalPosition < this$static.minimumIntegerDigits) {
        prefix.impl.appendNonNull(prefix.data, '0');
        ++this$static.decimalPosition;
        ++this$static.digitsLength;
      }
      $insert(digits, 0, prefix.impl.toString_0(prefix.data));
    }
     else if (this$static.decimalPosition > this$static.minimumIntegerDigits) {
      strip = this$static.decimalPosition - this$static.minimumIntegerDigits;
      for (i_0 = 0; i_0 < strip; ++i_0) {
        if ($charAt(digits.impl.toString_0(digits.data), i_0) != 48) {
          strip = i_0;
          break;
        }
      }
      if (strip > 0) {
        digits.impl.replace_0(digits.data, 0, strip, '');
        this$static.digitsLength -= strip;
        this$static.decimalPosition -= strip;
      }
    }
  }
}

function $propagateCarry(this$static, digits, i_0){
  var carry, digit;
  carry = true;
  while (carry && i_0 >= 0) {
    digit = $charAt(digits.impl.toString_0(digits.data), i_0);
    if (digit == 57) {
      $setCharAt(digits, i_0--, 48);
    }
     else {
      $setCharAt(digits, i_0, digit + 1 & 65535);
      carry = false;
    }
  }
  if (carry) {
    digits.impl.replace_0(digits.data, 0, 0, '1');
    ++this$static.decimalPosition;
    ++this$static.digitsLength;
  }
}

function $roundValue(this$static, digits){
  var i_0;
  if (this$static.digitsLength > this$static.decimalPosition + this$static.maximumFractionDigits && $charAt_0(digits, this$static.decimalPosition + this$static.maximumFractionDigits) >= 53) {
    i_0 = this$static.decimalPosition + this$static.maximumFractionDigits - 1;
    $propagateCarry(this$static, digits, i_0);
  }
}

function NumberFormat_0(cdata, userSuppliedPattern){
  if (!cdata) {
    throw new IllegalArgumentException_1('Unknown currency code');
  }
  this.pattern = '0.00';
  this.currencyData = cdata;
  $parsePattern(this, this.pattern);
  if (!userSuppliedPattern && this.isCurrencyFormat) {
    this.minimumFractionDigits = this.currencyData[2] & 7;
    this.maximumFractionDigits = this.minimumFractionDigits;
  }
}

function NumberFormat_1(cdata){
  $clinit_NumberFormat();
  NumberFormat_0.call(this, cdata, true);
}

function toScaledString(buf, val){
  var dot, expDigits, expIdx, scale, startLen;
  startLen = buf.impl.length_0(buf.data);
  $append_5(buf, val.toPrecision(20));
  scale = 0;
  expIdx = $indexOf_0(buf.impl.toString_0(buf.data), 'e', startLen);
  expIdx < 0 && (expIdx = $indexOf_0(buf.impl.toString_0(buf.data), 'E', startLen));
  if (expIdx >= 0) {
    expDigits = expIdx + 1;
    expDigits < buf.impl.length_0(buf.data) && $charAt(buf.impl.toString_0(buf.data), expDigits) == 43 && ++expDigits;
    expDigits < buf.impl.length_0(buf.data) && (scale = __parseAndValidateInt($substring(buf.impl.toString_0(buf.data), expDigits), 10));
    $delete_0(buf, expIdx, buf.impl.length_0(buf.data));
  }
  dot = $indexOf_0(buf.impl.toString_0(buf.data), '.', startLen);
  if (dot >= 0) {
    buf.impl.replace_0(buf.data, dot, dot + 1, '');
    scale -= buf.impl.length_0(buf.data) - dot;
  }
  return scale;
}

defineSeed(61, 1, {}, NumberFormat_1);
_.currencyData = null;
_.decimalPosition = 0;
_.decimalSeparatorAlwaysShown = false;
_.digitsLength = 0;
_.exponent = 0;
_.groupingSize = 3;
_.isCurrencyFormat = false;
_.maximumFractionDigits = 3;
_.maximumIntegerDigits = 40;
_.minExponentDigits = 0;
_.minimumFractionDigits = 0;
_.minimumIntegerDigits = 1;
_.multiplier = 1;
_.negativePrefix = '-';
_.negativeSuffix = '';
_.pattern = null;
_.positivePrefix = '';
_.positiveSuffix = '';
_.useExponentialNotation = false;
function NumberConstantsImpl__0(){
}

defineSeed(62, 1, {}, NumberConstantsImpl__0);
function $getSimpleCurrencySymbol(this$static){
  return this$static[4] || this$static[1];
}

defineSeed(65, 1, {});
function $get(this$static, index){
  var v = this$static.jsArray[index];
  var func = ($clinit_JSONParser() , typeMap)[typeof v];
  return func?func(v):throwUnknownTypeException(typeof v);
}

function $set(this$static, index, value){
  var previous;
  previous = $get(this$static, index);
  $set0(this$static, index, value);
  return previous;
}

function $set0(this$static, index, value){
  if (value) {
    var func = value.getUnwrapper();
    value = func(value);
  }
   else {
    value = undefined;
  }
  this$static.jsArray[index] = value;
}

function JSONArray_0(){
  this.jsArray = [];
}

function JSONArray_1(arr){
  this.jsArray = arr;
}

function unwrap(value){
  return value.jsArray;
}

defineSeed(64, 65, makeCastMap([Q$JSONArray]), JSONArray_0, JSONArray_1);
_.equals$ = function equals_1(other){
  if (!instanceOf(other, Q$JSONArray)) {
    return false;
  }
  return this.jsArray == dynamicCast(other, Q$JSONArray).jsArray;
}
;
_.getUnwrapper = function getUnwrapper(){
  return unwrap;
}
;
_.hashCode$ = function hashCode_2(){
  return getHashCode(this.jsArray);
}
;
_.toString$ = function toString_7(){
  var c, i_0, sb;
  sb = new StringBuffer_0;
  sb.impl.append_2(sb.data, '[');
  for (i_0 = 0 , c = this.jsArray.length; i_0 < c; ++i_0) {
    i_0 > 0 && (sb.impl.append_2(sb.data, ',') , sb);
    $append_1(sb, $get(this, i_0));
  }
  sb.impl.append_2(sb.data, ']');
  return sb.impl.toString_0(sb.data);
}
;
_.jsArray = null;
function $clinit_JSONBoolean(){
  $clinit_JSONBoolean = nullMethod;
  FALSE = new JSONBoolean_0(false);
  TRUE = new JSONBoolean_0(true);
}

function JSONBoolean_0(value){
  this.value = value;
}

function unwrap_0(value){
  return value.value;
}

defineSeed(66, 65, {}, JSONBoolean_0);
_.getUnwrapper = function getUnwrapper_0(){
  return unwrap_0;
}
;
_.toString$ = function toString_8(){
  return $clinit_Boolean() , '' + this.value;
}
;
_.value = false;
var FALSE, TRUE;
function JSONException_0(message){
  RuntimeException_1.call(this, message);
}

defineSeed(67, 6, makeCastMap([Q$Serializable, Q$Exception, Q$Throwable]), JSONException_0);
function $clinit_JSONNull(){
  $clinit_JSONNull = nullMethod;
  instance_1 = new JSONNull_0;
}

function JSONNull_0(){
}

function unwrap_1(){
  return null;
}

defineSeed(68, 65, {}, JSONNull_0);
_.getUnwrapper = function getUnwrapper_1(){
  return unwrap_1;
}
;
_.toString$ = function toString_9(){
  return 'null';
}
;
var instance_1;
function JSONNumber_0(value){
  this.value = value;
}

function unwrap_2(value){
  return value.value;
}

defineSeed(69, 65, makeCastMap([Q$JSONNumber]), JSONNumber_0);
_.equals$ = function equals_2(other){
  if (!instanceOf(other, Q$JSONNumber)) {
    return false;
  }
  return this.value == dynamicCast(other, Q$JSONNumber).value;
}
;
_.getUnwrapper = function getUnwrapper_2(){
  return unwrap_2;
}
;
_.hashCode$ = function hashCode_3(){
  return round_int((new Double_0(this.value)).value);
}
;
_.toString$ = function toString_10(){
  return this.value + '';
}
;
_.value = 0;
function $computeKeys0(this$static, result){
  var jsObject = this$static.jsObject;
  var i_0 = 0;
  for (var key in jsObject) {
    jsObject.hasOwnProperty(key) && (result[i_0++] = key);
  }
  return result;
}

function $get_0(this$static, key){
  if (key == null) {
    throw new NullPointerException_0;
  }
  return $get0(this$static, key);
}

function $get0(this$static, key){
  var jsObject = this$static.jsObject;
  var v;
  key = String(key);
  jsObject.hasOwnProperty(key) && (v = jsObject[key]);
  var func = ($clinit_JSONParser() , typeMap)[typeof v];
  var ret = func?func(v):throwUnknownTypeException(typeof v);
  return ret;
}

function $put(this$static, key, jsonValue){
  var previous;
  if (key == null) {
    throw new NullPointerException_0;
  }
  previous = $get_0(this$static, key);
  $put0(this$static, key, jsonValue);
  return previous;
}

function $put0(this$static, key, value){
  if (value) {
    var func = value.getUnwrapper();
    this$static.jsObject[key] = func(value);
  }
   else {
    delete this$static.jsObject[key];
  }
}

function JSONObject_0(){
  JSONObject_1.call(this, {});
}

function JSONObject_1(jsValue){
  this.jsObject = jsValue;
}

function unwrap_3(value){
  return value.jsObject;
}

defineSeed(70, 65, makeCastMap([Q$JSONObject]), JSONObject_0, JSONObject_1);
_.equals$ = function equals_3(other){
  if (!instanceOf(other, Q$JSONObject)) {
    return false;
  }
  return this.jsObject == dynamicCast(other, Q$JSONObject).jsObject;
}
;
_.getUnwrapper = function getUnwrapper_3(){
  return unwrap_3;
}
;
_.hashCode$ = function hashCode_4(){
  return getHashCode(this.jsObject);
}
;
_.toString$ = function toString_11(){
  var first, key, key$index, key$max, keys, sb;
  sb = new StringBuffer_0;
  sb.impl.append_2(sb.data, '{');
  first = true;
  keys = $computeKeys0(this, initDim(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, 0, 0));
  for (key$index = 0 , key$max = keys.length; key$index < key$max; ++key$index) {
    key = keys[key$index];
    first?(first = false):(sb.impl.append_2(sb.data, ', ') , sb);
    $append_2(sb, escapeValue(key));
    sb.impl.append_2(sb.data, ':');
    $append_1(sb, $get_0(this, key));
  }
  sb.impl.append_2(sb.data, '}');
  return sb.impl.toString_0(sb.data);
}
;
_.jsObject = null;
function $clinit_JSONParser(){
  $clinit_JSONParser = nullMethod;
  typeMap = {'boolean':createBoolean, number:createNumber, string:createString, object:createObject, 'function':createObject, undefined:createUndefined};
}

function createBoolean(v){
  return $clinit_JSONBoolean() , v?TRUE:FALSE;
}

function createNumber(v){
  return new JSONNumber_0(v);
}

function createObject(o){
  if (!o) {
    return $clinit_JSONNull() , instance_1;
  }
  var v = o.valueOf?o.valueOf():o;
  if (v !== o) {
    var func = typeMap[typeof v];
    return func?func(v):throwUnknownTypeException(typeof v);
  }
   else if (o instanceof Array || o instanceof $wnd.Array) {
    return new JSONArray_1(o);
  }
   else {
    return new JSONObject_1(o);
  }
}

function createString(v){
  return new JSONString_0(v);
}

function createUndefined(){
  return null;
}

function throwUnknownTypeException(typeString){
  $clinit_JSONParser();
  throw new JSONException_0("Unexpected typeof result '" + typeString + "'; please report this bug to the GWT team");
}

var typeMap;
function JSONString_0(value){
  if (value == null) {
    throw new NullPointerException_0;
  }
  this.value = value;
}

function unwrap_4(value){
  return value.value;
}

defineSeed(72, 65, makeCastMap([Q$JSONString]), JSONString_0);
_.equals$ = function equals_4(other){
  if (!instanceOf(other, Q$JSONString)) {
    return false;
  }
  return $equals_0(this.value, dynamicCast(other, Q$JSONString).value);
}
;
_.getUnwrapper = function getUnwrapper_4(){
  return unwrap_4;
}
;
_.hashCode$ = function hashCode_5(){
  return getHashCode_0(this.value);
}
;
_.toString$ = function toString_12(){
  return escapeValue(this.value);
}
;
_.value = null;
function Array_0(){
}

function cloneSubrange(array, fromIndex, toIndex){
  var a, result;
  a = array;
  result = a.slice(fromIndex, toIndex);
  initValues(a.___clazz$, a.castableTypeMap$, a.queryId$, result);
  return result;
}

function createFrom(array, length_0){
  var a, result;
  a = array;
  result = createFromSeed(0, length_0);
  initValues(a.___clazz$, a.castableTypeMap$, a.queryId$, result);
  return result;
}

function createFromSeed(seedType, length_0){
  var array = new Array(length_0);
  if (seedType == 3) {
    for (var i_0 = 0; i_0 < length_0; ++i_0) {
      var value = new Object;
      value.l = value.m = value.h = 0;
      array[i_0] = value;
    }
  }
   else if (seedType > 0) {
    var value = [null, 0, false][seedType];
    for (var i_0 = 0; i_0 < length_0; ++i_0) {
      array[i_0] = value;
    }
  }
  return array;
}

function initDim(arrayClass, castableTypeMap, queryId, length_0, seedType){
  var result;
  result = createFromSeed(seedType, length_0);
  initValues(arrayClass, castableTypeMap, queryId, result);
  return result;
}

function initDims(arrayClasses, castableTypeMapExprs, queryIdExprs, dimExprs, count, seedType){
  return initDims_0(arrayClasses, castableTypeMapExprs, queryIdExprs, dimExprs, 0, count, seedType);
}

function initDims_0(arrayClasses, castableTypeMapExprs, queryIdExprs, dimExprs, index, count, seedType){
  var i_0, isLastDim, length_0, result;
  length_0 = dimExprs[index];
  isLastDim = index == count - 1;
  result = createFromSeed(isLastDim?seedType:0, length_0);
  initValues(arrayClasses[index], castableTypeMapExprs[index], queryIdExprs[index], result);
  if (!isLastDim) {
    ++index;
    for (i_0 = 0; i_0 < length_0; ++i_0) {
      result[i_0] = initDims_0(arrayClasses, castableTypeMapExprs, queryIdExprs, dimExprs, index, count, seedType);
    }
  }
  return result;
}

function initValues(arrayClass, castableTypeMap, queryId, array){
  $clinit_Array$ExpandoWrapper();
  wrapArray(array, expandoNames_0, expandoValues_0);
  array.___clazz$ = arrayClass;
  array.castableTypeMap$ = castableTypeMap;
  array.queryId$ = queryId;
  return array;
}

function setCheck(array, index, value){
  if (value != null) {
    if (array.queryId$ > 0 && !canCastUnsafe(value, array.queryId$)) {
      throw new ArrayStoreException_0;
    }
     else if (array.queryId$ == -1 && (value.typeMarker$ == nullMethod || canCast(value, 1))) {
      throw new ArrayStoreException_0;
    }
     else if (array.queryId$ < -1 && !(value.typeMarker$ != nullMethod && !canCast(value, 1)) && !canCastUnsafe(value, -array.queryId$)) {
      throw new ArrayStoreException_0;
    }
  }
  return array[index] = value;
}

defineSeed(73, 1, {}, Array_0);
_.queryId$ = 0;
function $clinit_Array$ExpandoWrapper(){
  $clinit_Array$ExpandoWrapper = nullMethod;
  expandoNames_0 = [];
  expandoValues_0 = [];
  initExpandos(new Array_0, expandoNames_0, expandoValues_0);
}

function initExpandos(protoType, expandoNames, expandoValues){
  var i_0 = 0, value;
  for (var name_0 in protoType) {
    if (value = protoType[name_0]) {
      expandoNames[i_0] = name_0;
      expandoValues[i_0] = value;
      ++i_0;
    }
  }
}

function wrapArray(array, expandoNames, expandoValues){
  $clinit_Array$ExpandoWrapper();
  for (var i_0 = 0, c = expandoNames.length; i_0 < c; ++i_0) {
    array[expandoNames[i_0]] = expandoValues[i_0];
  }
}

var expandoNames_0, expandoValues_0;
function canCast(src, dstId){
  return src.castableTypeMap$ && !!src.castableTypeMap$[dstId];
}

function canCastUnsafe(src, dstId){
  return src.castableTypeMap$ && src.castableTypeMap$[dstId];
}

function charToString(x){
  return String.fromCharCode(x);
}

function dynamicCast(src, dstId){
  if (src != null && !canCastUnsafe(src, dstId)) {
    throw new ClassCastException_0;
  }
  return src;
}

function dynamicCastJso(src){
  if (src != null && (src.typeMarker$ == nullMethod || canCast(src, 1))) {
    throw new ClassCastException_0;
  }
  return src;
}

function instanceOf(src, dstId){
  return src != null && canCast(src, dstId);
}

function instanceOfJso(src){
  return src != null && src.typeMarker$ != nullMethod && !canCast(src, 1);
}

function isJavaObject(src){
  return src.typeMarker$ == nullMethod || canCast(src, 1);
}

function maskUndefined(src){
  return src == null?null:src;
}

function round_int(x){
  return ~~Math.max(Math.min(x, 2147483647), -2147483648);
}

function com_google_gwt_core_client_impl_StackTraceCreator_Collector(){
  switch (permutationId) {
    case 0:
      return new StackTraceCreator$CollectorMoz_0;
    case 4:
      return new StackTraceCreator$CollectorOpera_0;
    case 5:
      return new StackTraceCreator$CollectorChromeNoSourceMap_0;
  }
  return new StackTraceCreator$Collector_0;
}

function com_google_gwt_core_client_impl_StringBufferImpl(){
  switch (permutationId) {
    case 1:
    case 2:
    case 3:
      return new StringBufferImplArray_0;
  }
  return new StringBufferImplAppend_0;
}

function com_google_gwt_dom_client_DOMImpl(){
  switch (permutationId) {
    case 2:
      return new DOMImplIE8_0;
    case 3:
      return new DOMImplIE9_0;
    case 4:
      return new DOMImplOpera_0;
    case 5:
      return new DOMImplWebkit_0;
    case 1:
      return new DOMImplIE6_0;
  }
  return new DOMImplMozilla_0;
}

function com_google_gwt_user_client_impl_DOMImpl(){
  switch (permutationId) {
    case 2:
      return new DOMImplIE8_2;
    case 3:
      return new DOMImplIE9_2;
    case 1:
      return new DOMImplIE6_2;
    case 4:
      return new DOMImplOpera_2;
    case 5:
      return new DOMImplWebkit_2;
  }
  return new DOMImplMozilla_2;
}

function com_google_gwt_user_client_impl_WindowImpl(){
  switch (permutationId) {
    case 0:
      return new WindowImplMozilla_0;
    case 4:
    case 5:
      return new WindowImpl_0;
  }
  return new WindowImplIE_0;
}

function com_google_gwt_useragent_client_UserAgentAsserter_UserAgentProperty(){
  switch (permutationId) {
    case 1:
      return new UserAgentAsserter_UserAgentPropertyImplIe6_0;
    case 2:
      return new UserAgentAsserter_UserAgentPropertyImplIe8_0;
    case 3:
      return new UserAgentAsserter_UserAgentPropertyImplIe9_0;
    case 4:
      return new UserAgentAsserter_UserAgentPropertyImplOpera_0;
    case 5:
      return new UserAgentAsserter_UserAgentPropertyImplSafari_0;
  }
  return new UserAgentAsserter_UserAgentPropertyImplGecko1_8_0;
}

var permutationId = -1;
function init(){
  !!$stats && onModuleStart('com.google.gwt.useragent.client.UserAgentAsserter');
  $onModuleLoad_1();
  !!$stats && onModuleStart('com.google.gwt.user.client.DocumentModeAsserter');
  $onModuleLoad_0();
  !!$stats && onModuleStart('com.google.gwt.logging.client.LogConfiguration');
  $onModuleLoad($clinit_LogConfiguration());
  !!$stats && onModuleStart('net.gnehzr.tnoodle.js.ScrambleJsEntryPoint');
  $onModuleLoad_2($clinit_ScrambleJsEntryPoint());
}

function caught(e){
  if (instanceOf(e, Q$Throwable)) {
    return e;
  }
  return new JavaScriptException_0(e);
}

function create_0(value){
  var a0, a1, a2;
  a0 = value & 4194303;
  a1 = ~~value >> 22 & 4194303;
  a2 = value < 0?1048575:0;
  return create0(a0, a1, a2);
}

function create_1(a){
  return create0(a.l, a.m, a.h);
}

function create0(l_0, m_0, h_0){
  return _ = new LongLibBase$LongEmul_0 , _.l = l_0 , _.m = m_0 , _.h = h_0 , _;
}

function divMod(a, b, computeRemainder){
  var aIsCopy, aIsMinValue, aIsNegative, bpower, c, negative;
  if (b.l == 0 && b.m == 0 && b.h == 0) {
    throw new ArithmeticException_0;
  }
  if (a.l == 0 && a.m == 0 && a.h == 0) {
    computeRemainder && (remainder_0 = create0(0, 0, 0));
    return create0(0, 0, 0);
  }
  if (b.h == 524288 && b.m == 0 && b.l == 0) {
    return divModByMinValue(a, computeRemainder);
  }
  negative = false;
  if (~~b.h >> 19 != 0) {
    b = neg(b);
    negative = true;
  }
  bpower = powerOfTwo(b);
  aIsNegative = false;
  aIsMinValue = false;
  aIsCopy = false;
  if (a.h == 524288 && a.m == 0 && a.l == 0) {
    aIsMinValue = true;
    aIsNegative = true;
    if (bpower == -1) {
      a = create_1(($clinit_LongLib$Const() , MAX_VALUE));
      aIsCopy = true;
      negative = !negative;
    }
     else {
      c = shr(a, bpower);
      negative && negate(c);
      computeRemainder && (remainder_0 = create0(0, 0, 0));
      return c;
    }
  }
   else if (~~a.h >> 19 != 0) {
    aIsNegative = true;
    a = neg(a);
    aIsCopy = true;
    negative = !negative;
  }
  if (bpower != -1) {
    return divModByShift(a, bpower, negative, aIsNegative, computeRemainder);
  }
  if (!gte_0(a, b)) {
    computeRemainder && (aIsNegative?(remainder_0 = neg(a)):(remainder_0 = create0(a.l, a.m, a.h)));
    return create0(0, 0, 0);
  }
  return divModHelper(aIsCopy?a:create0(a.l, a.m, a.h), b, negative, aIsNegative, aIsMinValue, computeRemainder);
}

function divModByMinValue(a, computeRemainder){
  if (a.h == 524288 && a.m == 0 && a.l == 0) {
    computeRemainder && (remainder_0 = create0(0, 0, 0));
    return create_1(($clinit_LongLib$Const() , ONE));
  }
  computeRemainder && (remainder_0 = create0(a.l, a.m, a.h));
  return create0(0, 0, 0);
}

function divModByShift(a, bpower, negative, aIsNegative, computeRemainder){
  var c;
  c = shr(a, bpower);
  negative && negate(c);
  if (computeRemainder) {
    a = maskRight(a, bpower);
    aIsNegative?(remainder_0 = neg(a)):(remainder_0 = create0(a.l, a.m, a.h));
  }
  return c;
}

function divModHelper(a, b, negative, aIsNegative, aIsMinValue, computeRemainder){
  var bshift, gte, quotient, shift, a1, a2, a0;
  shift = numberOfLeadingZeros(b) - numberOfLeadingZeros(a);
  bshift = shl(b, shift);
  quotient = create0(0, 0, 0);
  while (shift >= 0) {
    gte = trialSubtract(a, bshift);
    if (gte) {
      shift < 22?(quotient.l |= 1 << shift , undefined):shift < 44?(quotient.m |= 1 << shift - 22 , undefined):(quotient.h |= 1 << shift - 44 , undefined);
      if (a.l == 0 && a.m == 0 && a.h == 0) {
        break;
      }
    }
    a1 = bshift.m;
    a2 = bshift.h;
    a0 = bshift.l;
    bshift.h = ~~a2 >>> 1;
    bshift.m = ~~a1 >>> 1 | (a2 & 1) << 21;
    bshift.l = ~~a0 >>> 1 | (a1 & 1) << 21;
    --shift;
  }
  negative && negate(quotient);
  if (computeRemainder) {
    if (aIsNegative) {
      remainder_0 = neg(a);
      aIsMinValue && (remainder_0 = sub(remainder_0, ($clinit_LongLib$Const() , ONE)));
    }
     else {
      remainder_0 = create0(a.l, a.m, a.h);
    }
  }
  return quotient;
}

function maskRight(a, bits){
  var b0, b1, b2;
  if (bits <= 22) {
    b0 = a.l & (1 << bits) - 1;
    b1 = b2 = 0;
  }
   else if (bits <= 44) {
    b0 = a.l;
    b1 = a.m & (1 << bits - 22) - 1;
    b2 = 0;
  }
   else {
    b0 = a.l;
    b1 = a.m;
    b2 = a.h & (1 << bits - 44) - 1;
  }
  return create0(b0, b1, b2);
}

function negate(a){
  var neg0, neg1, neg2;
  neg0 = ~a.l + 1 & 4194303;
  neg1 = ~a.m + (neg0 == 0?1:0) & 4194303;
  neg2 = ~a.h + (neg0 == 0 && neg1 == 0?1:0) & 1048575;
  a.l = neg0;
  a.m = neg1;
  a.h = neg2;
}

function numberOfLeadingZeros(a){
  var b1, b2;
  b2 = numberOfLeadingZeros_0(a.h);
  if (b2 == 32) {
    b1 = numberOfLeadingZeros_0(a.m);
    return b1 == 32?numberOfLeadingZeros_0(a.l) + 32:b1 + 20 - 10;
  }
   else {
    return b2 - 12;
  }
}

function powerOfTwo(a){
  var h_0, l_0, m_0;
  l_0 = a.l;
  if ((l_0 & l_0 - 1) != 0) {
    return -1;
  }
  m_0 = a.m;
  if ((m_0 & m_0 - 1) != 0) {
    return -1;
  }
  h_0 = a.h;
  if ((h_0 & h_0 - 1) != 0) {
    return -1;
  }
  if (h_0 == 0 && m_0 == 0 && l_0 == 0) {
    return -1;
  }
  if (h_0 == 0 && m_0 == 0 && l_0 != 0) {
    return numberOfTrailingZeros(l_0);
  }
  if (h_0 == 0 && m_0 != 0 && l_0 == 0) {
    return numberOfTrailingZeros(m_0) + 22;
  }
  if (h_0 != 0 && m_0 == 0 && l_0 == 0) {
    return numberOfTrailingZeros(h_0) + 44;
  }
  return -1;
}

function toDoubleHelper(a){
  return a.l + a.m * 4194304 + a.h * 17592186044416;
}

function trialSubtract(a, b){
  var sum0, sum1, sum2;
  sum2 = a.h - b.h;
  if (sum2 < 0) {
    return false;
  }
  sum0 = a.l - b.l;
  sum1 = a.m - b.m + (~~sum0 >> 22);
  sum2 += ~~sum1 >> 22;
  if (sum2 < 0) {
    return false;
  }
  a.l = sum0 & 4194303;
  a.m = sum1 & 4194303;
  a.h = sum2 & 1048575;
  return true;
}

var remainder_0 = null;
function add(a, b){
  var sum0, sum1, sum2;
  sum0 = a.l + b.l;
  sum1 = a.m + b.m + (~~sum0 >> 22);
  sum2 = a.h + b.h + (~~sum1 >> 22);
  return create0(sum0 & 4194303, sum1 & 4194303, sum2 & 1048575);
}

function and(a, b){
  return create0(a.l & b.l, a.m & b.m, a.h & b.h);
}

function div(a, b){
  return divMod(a, b, false);
}

function eq(a, b){
  return a.l == b.l && a.m == b.m && a.h == b.h;
}

function fromDouble(value){
  var a0, a1, a2, negative, result;
  if (isNaN(value)) {
    return $clinit_LongLib$Const() , ZERO;
  }
  if (value < -9223372036854775808) {
    return $clinit_LongLib$Const() , MIN_VALUE;
  }
  if (value >= 9223372036854775807) {
    return $clinit_LongLib$Const() , MAX_VALUE;
  }
  negative = false;
  if (value < 0) {
    negative = true;
    value = -value;
  }
  a2 = 0;
  if (value >= 17592186044416) {
    a2 = round_int(value / 17592186044416);
    value -= a2 * 17592186044416;
  }
  a1 = 0;
  if (value >= 4194304) {
    a1 = round_int(value / 4194304);
    value -= a1 * 4194304;
  }
  a0 = round_int(value);
  result = create0(a0, a1, a2);
  negative && negate(result);
  return result;
}

function fromInt(value){
  var rebase, result;
  if (value > -129 && value < 128) {
    rebase = value + 128;
    boxedValues == null && (boxedValues = initDim(_3Lcom_google_gwt_lang_LongLibBase$LongEmul_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$LongLibBase$LongEmul, 256, 0));
    result = boxedValues[rebase];
    !result && (result = boxedValues[rebase] = create_0(value));
    return result;
  }
  return create_0(value);
}

function gte_0(a, b){
  var signa, signb;
  signa = ~~a.h >> 19;
  signb = ~~b.h >> 19;
  return signa == 0?signb != 0 || a.h > b.h || a.h == b.h && a.m > b.m || a.h == b.h && a.m == b.m && a.l >= b.l:!(signb == 0 || a.h < b.h || a.h == b.h && a.m < b.m || a.h == b.h && a.m == b.m && a.l < b.l);
}

function lt(a, b){
  return !gte_0(a, b);
}

function neg(a){
  var neg0, neg1, neg2;
  neg0 = ~a.l + 1 & 4194303;
  neg1 = ~a.m + (neg0 == 0?1:0) & 4194303;
  neg2 = ~a.h + (neg0 == 0 && neg1 == 0?1:0) & 1048575;
  return create0(neg0, neg1, neg2);
}

function or(a, b){
  return create0(a.l | b.l, a.m | b.m, a.h | b.h);
}

function shl(a, n){
  var res0, res1, res2;
  n &= 63;
  if (n < 22) {
    res0 = a.l << n;
    res1 = a.m << n | ~~a.l >> 22 - n;
    res2 = a.h << n | ~~a.m >> 22 - n;
  }
   else if (n < 44) {
    res0 = 0;
    res1 = a.l << n - 22;
    res2 = a.m << n - 22 | ~~a.l >> 44 - n;
  }
   else {
    res0 = 0;
    res1 = 0;
    res2 = a.l << n - 44;
  }
  return create0(res0 & 4194303, res1 & 4194303, res2 & 1048575);
}

function shr(a, n){
  var a2, negative, res0, res1, res2;
  n &= 63;
  a2 = a.h;
  negative = (a2 & 524288) != 0;
  negative && (a2 |= -1048576);
  if (n < 22) {
    res2 = ~~a2 >> n;
    res1 = ~~a.m >> n | a2 << 22 - n;
    res0 = ~~a.l >> n | a.m << 22 - n;
  }
   else if (n < 44) {
    res2 = negative?1048575:0;
    res1 = ~~a2 >> n - 22;
    res0 = ~~a.m >> n - 22 | a2 << 44 - n;
  }
   else {
    res2 = negative?1048575:0;
    res1 = negative?4194303:0;
    res0 = ~~a2 >> n - 44;
  }
  return create0(res0 & 4194303, res1 & 4194303, res2 & 1048575);
}

function shru(a, n){
  var a2, res0, res1, res2;
  n &= 63;
  a2 = a.h & 1048575;
  if (n < 22) {
    res2 = ~~a2 >>> n;
    res1 = ~~a.m >> n | a2 << 22 - n;
    res0 = ~~a.l >> n | a.m << 22 - n;
  }
   else if (n < 44) {
    res2 = 0;
    res1 = ~~a2 >>> n - 22;
    res0 = ~~a.m >> n - 22 | a.h << 44 - n;
  }
   else {
    res2 = 0;
    res1 = 0;
    res0 = ~~a2 >>> n - 44;
  }
  return create0(res0 & 4194303, res1 & 4194303, res2 & 1048575);
}

function sub(a, b){
  var sum0, sum1, sum2;
  sum0 = a.l - b.l;
  sum1 = a.m - b.m + (~~sum0 >> 22);
  sum2 = a.h - b.h + (~~sum1 >> 22);
  return create0(sum0 & 4194303, sum1 & 4194303, sum2 & 1048575);
}

function toDouble(a){
  if (eq(a, ($clinit_LongLib$Const() , MIN_VALUE))) {
    return -9223372036854775808;
  }
  if (!gte_0(a, ZERO)) {
    return -toDoubleHelper(neg(a));
  }
  return a.l + a.m * 4194304 + a.h * 17592186044416;
}

function toInt(a){
  return a.l | a.m << 22;
}

function xor(a, b){
  return create0(a.l ^ b.l, a.m ^ b.m, a.h ^ b.h);
}

var boxedValues = null;
function $clinit_LongLib$Const(){
  $clinit_LongLib$Const = nullMethod;
  MAX_VALUE = create0(4194303, 4194303, 524287);
  MIN_VALUE = create0(0, 0, 524288);
  ONE = fromInt(1);
  fromInt(2);
  ZERO = fromInt(0);
}

var MAX_VALUE, MIN_VALUE, ONE, ZERO;
function LongLibBase$LongEmul_0(){
}

defineSeed(83, 1, makeCastMap([Q$LongLibBase$LongEmul]), LongLibBase$LongEmul_0);
function onModuleStart(mainClassName){
  return $stats({moduleName:$moduleName, sessionId:$sessionId, subSystem:'startup', evtGroup:'moduleStartup', millis:(new Date).getTime(), type:'onModuleLoadStart', className:mainClassName});
}

function $getLevel(this$static){
  if (this$static.level) {
    return this$static.level;
  }
  return $clinit_Level() , ALL;
}

function $setFormatter(this$static, newFormatter){
  this$static.formatter = newFormatter;
}

function $setLevel(this$static, newLevel){
  this$static.level = newLevel;
}

defineSeed(88, 1, makeCastMap([Q$Handler]));
_.formatter = null;
_.level = null;
function ConsoleLogHandler_0(){
  $setFormatter(this, new TextLogFormatter_0(true));
  $setLevel(this, ($clinit_Level() , ALL));
}

defineSeed(87, 88, makeCastMap([Q$Handler]), ConsoleLogHandler_0);
_.publish = function publish(record){
  var msg;
  if (!(window.console != null && window.console.firebug == null && window.console.log != null && typeof window.console.log == 'function') || ($getLevel(this) , -2147483648) > record.level.intValue()) {
    return;
  }
  msg = this.formatter.format(record);
  window.console.log(msg);
}
;
function DevelopmentModeLogHandler_0(){
  $setFormatter(this, new TextLogFormatter_0(false));
  $setLevel(this, ($clinit_Level() , ALL));
}

defineSeed(89, 88, makeCastMap([Q$Handler]), DevelopmentModeLogHandler_0);
_.publish = function publish_0(record){
  return;
}
;
function FirebugLogHandler_0(){
  $setFormatter(this, new TextLogFormatter_0(true));
  $setLevel(this, ($clinit_Level() , ALL));
}

defineSeed(90, 88, makeCastMap([Q$Handler]), FirebugLogHandler_0);
_.publish = function publish_1(record){
  var msg, val;
  if (!(window.console && window.console.firebug) || ($getLevel(this) , -2147483648) > record.level.intValue()) {
    return;
  }
  msg = this.formatter.format(record);
  val = record.level.intValue();
  val <= ($clinit_Level() , 500)?(window.console.debug(msg) , undefined):val < 900?(window.console.info(msg) , undefined):val < 1000?(window.console.warn(msg) , undefined):(window.console.error(msg) , undefined);
}
;
function HasWidgetsLogHandler_0(){
  $setFormatter(this, new HtmlLogFormatter_0);
  $setLevel(this, ($clinit_Level() , ALL));
}

defineSeed(91, 88, makeCastMap([Q$Handler]), HasWidgetsLogHandler_0);
_.publish = function publish_2(record){
  var formatter, msg;
  if (($getLevel(this) , -2147483648) > record.level.intValue()) {
    return;
  }
  formatter = this.formatter;
  msg = formatter.format(record);
  instanceOf(formatter, Q$HtmlLogFormatter)?(new HTML_0(msg) , undefined):(new Label_1(msg) , undefined);
}
;
defineSeed(94, 1, {});
function $getRecordInfo(event_0, newline){
  var date, s;
  date = new Date_2(event_0.millis);
  s = new StringBuilder_0;
  $append_5(s, $toString_3(date));
  s.impl.append_2(s.data, ' ');
  $append_5(s, event_0.loggerName);
  s.impl.append_2(s.data, newline);
  $append_5(s, event_0.level.getName());
  s.impl.append_2(s.data, ': ');
  return s.impl.toString_0(s.data);
}

function $getStackTraceAsString(e, newline, indent){
  var causedBy, currentCause, i_0, s, seenCauses, stackElems;
  if (!e) {
    return '';
  }
  s = new StringBuffer_1(newline);
  currentCause = e;
  causedBy = '';
  seenCauses = new HashSet_0;
  while (!!currentCause && !seenCauses.map.containsKey(currentCause)) {
    $add_1(seenCauses, currentCause);
    s.impl.append_2(s.data, causedBy);
    causedBy = newline + 'Caused by: ';
    $append_2(s, currentCause.___clazz$.typeName);
    $append_2(s, ': ' + currentCause.getMessage());
    stackElems = $getStackTrace(currentCause);
    if (stackElems != null) {
      for (i_0 = 0; i_0 < stackElems.length; ++i_0) {
        s.impl.append_2(s.data, newline + indent + 'at ');
        $append_2(s, $toString_0(stackElems[i_0]));
      }
    }
    currentCause = currentCause.cause;
  }
  return s.impl.toString_0(s.data);
}

defineSeed(93, 94, {});
function $getColor(logLevel){
  if (logLevel == ($clinit_Level() , 2147483647)) {
    return '#000';
  }
  if (logLevel >= 1000) {
    return '#F00';
  }
  if (logLevel >= 900) {
    return '#E56717';
  }
  if (logLevel >= 800) {
    return '#20b000';
  }
  if (logLevel >= 700) {
    return '#2B60DE';
  }
  if (logLevel >= 500) {
    return '#F0F';
  }
  if (logLevel >= 400) {
    return '#F0F';
  }
  if (logLevel >= 300) {
    return '#F0F';
  }
  return '#000';
}

function $getEscaped(text){
  text = $replaceAll(text, '<', '&lt;');
  text = $replaceAll(text, '>', '&gt;');
  text = $replaceAll(text, '__GWT_LOG_FORMATTER_BR__', '<br>');
  return text;
}

function $getHtmlPrefix(event_0){
  var prefix;
  prefix = new StringBuilder_0;
  prefix.impl.append_2(prefix.data, "<span style='color:");
  $append_5(prefix, $getColor(event_0.level.intValue()));
  prefix.impl.append_2(prefix.data, "'>");
  prefix.impl.append_2(prefix.data, '<code>');
  return prefix.impl.toString_0(prefix.data);
}

function HtmlLogFormatter_0(){
  this.showStackTraces = true;
}

defineSeed(92, 93, makeCastMap([Q$HtmlLogFormatter]), HtmlLogFormatter_0);
_.format = function format(event_0){
  var html;
  html = new StringBuilder_2($getHtmlPrefix(event_0));
  $append_5(html, $getHtmlPrefix(event_0));
  $append_5(html, $getRecordInfo(event_0, ' '));
  $append_5(html, $getEscaped(event_0.msg_0));
  this.showStackTraces && $append_5(html, $getEscaped($getStackTraceAsString(event_0.thrown, '__GWT_LOG_FORMATTER_BR__', '&nbsp;&nbsp;&nbsp;')));
  html.impl.append_2(html.data, '<\/code><\/span>');
  return html.impl.toString_0(html.data);
}
;
_.showStackTraces = false;
function $clinit_LogConfiguration(){
  $clinit_LogConfiguration = nullMethod;
  impl_1 = new LogConfiguration$LogConfigurationImplRegular_0;
}

function $onModuleLoad(){
  var log;
  $configureClientSideLogging(impl_1);
  if (!sUncaughtExceptionHandler) {
    log = ($clinit_Logger() , $getLoggerHelper(Lcom_google_gwt_logging_client_LogConfiguration_2_classLit.typeName));
    setUncaughtExceptionHandler(new LogConfiguration$1_0(log));
  }
}

var impl_1;
function $onUncaughtException(this$static, e){
  $log_1(this$static.val$log, ($clinit_Level() , SEVERE), e.getMessage(), e);
}

function LogConfiguration$1_0(val$log){
  this.val$log = val$log;
}

defineSeed(96, 1, {}, LogConfiguration$1_0);
_.val$log = null;
function $addHandlerIfNotNull(l_0, h_0){
  $addHandler(l_0.impl, h_0);
}

function $configureClientSideLogging(this$static){
  this$static.root = ($clinit_Logger() , $getLoggerHelper(''));
  this$static.root.impl.useParentHandlers = false;
  $setLevels(this$static.root);
  $setDefaultHandlers(this$static.root);
}

function $parseLevel(s){
  if (s == null) {
    return null;
  }
  if ($equals_0(s, ($clinit_Level() , 'OFF'))) {
    return OFF;
  }
   else if ($equals_0(s, 'SEVERE')) {
    return SEVERE;
  }
   else if ($equals_0(s, 'WARNING')) {
    return WARNING;
  }
   else if ($equals_0(s, 'INFO')) {
    return INFO;
  }
   else if ($equals_0(s, 'CONFIG')) {
    return CONFIG;
  }
   else if ($equals_0(s, 'FINE')) {
    return FINE;
  }
   else if ($equals_0(s, 'FINER')) {
    return FINER;
  }
   else if ($equals_0(s, 'FINEST')) {
    return FINEST;
  }
   else if ($equals_0(s, 'ALL')) {
    return ALL;
  }
  return null;
}

function $setDefaultHandlers(l_0){
  var console, dev, firebug, loggingWidget, remote, system;
  console = new ConsoleLogHandler_0;
  $addHandler(l_0.impl, console);
  dev = new DevelopmentModeLogHandler_0;
  $addHandler(l_0.impl, dev);
  firebug = new FirebugLogHandler_0;
  $addHandler(l_0.impl, firebug);
  system = new SystemLogHandler_0;
  $addHandler(l_0.impl, system);
  remote = new NullLogHandler_0;
  !!remote || $addHandler(l_0.impl, null);
  loggingWidget = new NullLoggingPopup_0;
  !loggingWidget && $addHandlerIfNotNull(l_0, new HasWidgetsLogHandler_0);
}

function $setLevels(l_0){
  var paramLevel, paramsForName;
  paramLevel = $parseLevel((ensureListParameterMap() , paramsForName = dynamicCast(listParamMap.get('logLevel'), Q$List) , !paramsForName?null:dynamicCast(paramsForName.get_0(paramsForName.size_0() - 1), Q$String)));
  paramLevel?$setLevel_0(l_0.impl, paramLevel):$setLevel_1(l_0, ($clinit_Level() , INFO));
}

function LogConfiguration$LogConfigurationImplRegular_0(){
}

defineSeed(97, 1, {}, LogConfiguration$LogConfigurationImplRegular_0);
_.root = null;
function NullLogHandler_0(){
}

defineSeed(98, 88, makeCastMap([Q$Handler]), NullLogHandler_0);
_.publish = function publish_3(record){
}
;
function NullLoggingPopup_0(){
}

defineSeed(99, 1, {}, NullLoggingPopup_0);
_.iterator = function iterator(){
  return null;
}
;
function SystemLogHandler_0(){
  $setFormatter(this, new TextLogFormatter_0(true));
  $setLevel(this, ($clinit_Level() , ALL));
}

defineSeed(100, 88, makeCastMap([Q$Handler]), SystemLogHandler_0);
_.publish = function publish_4(record){
  return;
}
;
function TextLogFormatter_0(showStackTraces){
  this.showStackTraces = showStackTraces;
}

defineSeed(101, 93, {}, TextLogFormatter_0);
_.format = function format_0(event_0){
  var message;
  message = new StringBuilder_0;
  $append_5(message, $getRecordInfo(event_0, '\n'));
  $append_5(message, event_0.msg_0);
  this.showStackTraces && $append_5(message, $getStackTraceAsString(event_0.thrown, '\n', '\t'));
  return message.impl.toString_0(message.data);
}
;
_.showStackTraces = false;
function $parse(name_0){
  if ($equalsIgnoreCase(name_0, 'ALL')) {
    return $clinit_Level() , ALL;
  }
   else if ($equalsIgnoreCase(name_0, 'CONFIG')) {
    return $clinit_Level() , CONFIG;
  }
   else if ($equalsIgnoreCase(name_0, 'FINE')) {
    return $clinit_Level() , FINE;
  }
   else if ($equalsIgnoreCase(name_0, 'FINER')) {
    return $clinit_Level() , FINER;
  }
   else if ($equalsIgnoreCase(name_0, 'FINEST')) {
    return $clinit_Level() , FINEST;
  }
   else if ($equalsIgnoreCase(name_0, 'INFO')) {
    return $clinit_Level() , INFO;
  }
   else if ($equalsIgnoreCase(name_0, 'OFF')) {
    return $clinit_Level() , OFF;
  }
   else if ($equalsIgnoreCase(name_0, 'SEVERE')) {
    return $clinit_Level() , SEVERE;
  }
   else if ($equalsIgnoreCase(name_0, 'WARNING')) {
    return $clinit_Level() , WARNING;
  }
  return null;
}

function $addHandler(this$static, handler){
  $add_0(this$static.handlers, handler);
}

function $fine(this$static, msg){
  $log(this$static, ($clinit_Level() , FINE), msg, null);
}

function $getEffectiveLevel(this$static){
  var effectiveLevel, logger;
  if (this$static.level) {
    return this$static.level;
  }
  logger = this$static.parent_0;
  while (logger) {
    effectiveLevel = logger.impl.level;
    if (effectiveLevel) {
      return effectiveLevel;
    }
    logger = logger.impl.parent_0;
  }
  return $clinit_Level() , INFO;
}

function $getHandlers(this$static){
  return dynamicCast($toArray_0(this$static.handlers, initDim(_3Ljava_util_logging_Handler_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$Handler_$1]), Q$Handler, this$static.handlers.size, 0)), Q$Handler_$1);
}

function $getLoggerHelper(name_0){
  var logger, manager, newLogger;
  manager = (!singleton && (singleton = new LogManager_0) , singleton);
  logger = dynamicCast(manager.loggerList.get(name_0), Q$Logger);
  if (!logger) {
    newLogger = new LoggerWithExposedConstructor_0(name_0);
    $addLogger(manager, newLogger);
    return newLogger;
  }
  return logger;
}

function $isLoggable(this$static, messageLevel){
  return $getEffectiveLevel(this$static).intValue() <= messageLevel.intValue();
}

function $log(this$static, level, msg, thrown){
  var record;
  if ($getEffectiveLevel(this$static).intValue() <= level.intValue()) {
    record = new LogRecord_0(level, msg);
    record.thrown = thrown;
    $setLoggerName(record, this$static.name_0);
    $log_0(this$static, record);
  }
}

function $log_0(this$static, record){
  var handler, handler$array, handler$index, handler$max, logger;
  if ($isLoggable(this$static, record.level)) {
    for (handler$array = dynamicCast($toArray_0(this$static.handlers, initDim(_3Ljava_util_logging_Handler_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$Handler_$1]), Q$Handler, this$static.handlers.size, 0)), Q$Handler_$1) , handler$index = 0 , handler$max = handler$array.length; handler$index < handler$max; ++handler$index) {
      handler = handler$array[handler$index];
      handler.publish(record);
    }
    logger = this$static.useParentHandlers?this$static.parent_0:null;
    while (logger) {
      for (handler$array = $getHandlers(logger.impl) , handler$index = 0 , handler$max = handler$array.length; handler$index < handler$max; ++handler$index) {
        handler = handler$array[handler$index];
        handler.publish(record);
      }
      logger = logger.impl.useParentHandlers?logger.impl.parent_0:null;
    }
  }
}

function $setLevel_0(this$static, newLevel){
  this$static.level = newLevel;
}

function $setName(this$static, newName){
  this$static.name_0 = newName;
}

function $setParent(this$static, newParent){
  !!newParent && (this$static.parent_0 = newParent);
}

function $severe(this$static, msg){
  $log(this$static, ($clinit_Level() , SEVERE), msg, null);
}

function LoggerImplRegular_0(){
  this.useParentHandlers = true;
  this.handlers = new ArrayList_0;
}

defineSeed(103, 1, {}, LoggerImplRegular_0);
_.handlers = null;
_.level = null;
_.name_0 = null;
_.parent_0 = null;
_.useParentHandlers = false;
function $clinit_Logger(){
  $clinit_Logger = nullMethod;
  new LoggerImplRegular_0;
}

function $fine_0(this$static, msg){
  $fine(this$static.impl, msg);
}

function $log_1(this$static, level, msg, thrown){
  $log(this$static.impl, level, msg, thrown);
}

function $log_2(this$static, record){
  $log_0(this$static.impl, record);
}

function $setLevel_1(this$static, newLevel){
  $setLevel_0(this$static.impl, newLevel);
}

function $severe_0(this$static, msg){
  $severe(this$static.impl, msg);
}

function Logger_0(name_0){
  $clinit_Logger();
  this.impl = new LoggerImplRegular_0;
  $setName(this.impl, name_0);
}

defineSeed(105, 1, makeCastMap([Q$Logger]), Logger_0);
_.impl = null;
function LoggerWithExposedConstructor_0(name_0){
  $clinit_Logger();
  Logger_0.call(this, name_0);
}

defineSeed(104, 105, makeCastMap([Q$Logger]), LoggerWithExposedConstructor_0);
function SafeUriString_0(uri){
  if (uri == null) {
    throw new NullPointerException_1('uri is null');
  }
  this.uri = uri;
}

defineSeed(107, 1, makeCastMap([Q$SafeUri, Q$SafeUriString]), SafeUriString_0);
_.equals$ = function equals_5(obj){
  if (!instanceOf(obj, Q$SafeUri)) {
    return false;
  }
  return $equals_0(this.uri, dynamicCast(dynamicCast(obj, Q$SafeUri), Q$SafeUriString).uri);
}
;
_.hashCode$ = function hashCode_6(){
  return getHashCode_0(this.uri);
}
;
_.uri = null;
function $clinit_UriUtils(){
  $clinit_UriUtils = nullMethod;
  new RegExp('%5B', 'g');
  new RegExp('%5D', 'g');
}

function $clinit_DOM(){
  $clinit_DOM = nullMethod;
  impl_2 = com_google_gwt_user_client_impl_DOMImpl();
}

function dispatchEvent_1(evt, elem, listener){
  $clinit_DOM();
  var prevCurrentEvent;
  prevCurrentEvent = currentEvent;
  currentEvent = evt;
  elem == sCaptureElem && $eventGetTypeInt(($clinit_DOMImpl() , evt).type) == 8192 && (sCaptureElem = null);
  listener.onBrowserEvent(evt);
  currentEvent = prevCurrentEvent;
}

function previewEvent(evt){
  $clinit_DOM();
  return true;
}

function sinkEvents(elem, eventBits){
  $clinit_DOM();
  impl_2.sinkEvents(elem, eventBits);
}

var currentEvent = null, impl_2, sCaptureElem = null;
function $onModuleLoad_0(){
  var allowedModes, currentMode, i_0;
  currentMode = $doc.compatMode;
  allowedModes = initValues(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, ['CSS1Compat']);
  for (i_0 = 0; i_0 < allowedModes.length; ++i_0) {
    if ($equals_0(allowedModes[i_0], currentMode)) {
      return;
    }
  }
  allowedModes.length == 1 && $equals_0('CSS1Compat', allowedModes[0]) && $equals_0('BackCompat', currentMode)?"GWT no longer supports Quirks Mode (document.compatMode=' BackCompat').<br>Make sure your application's host HTML page has a Standards Mode (document.compatMode=' CSS1Compat') doctype,<br>e.g. by using &lt;!doctype html&gt; at the start of your application's HTML page.<br><br>To continue using this unsupported rendering mode and risk layout problems, suppress this message by adding<br>the following line to your*.gwt.xml module file:<br>&nbsp;&nbsp;&lt;extend-configuration-property name=\"document.compatMode\" value=\"" + currentMode + '"/&gt;':"Your *.gwt.xml module configuration prohibits the use of the current doucment rendering mode (document.compatMode=' " + currentMode + "').<br>Modify your application's host HTML page doctype, or update your custom 'document.compatMode' configuration property settings.";
}

function $clinit_Window(){
  $clinit_Window = nullMethod;
  impl_3 = com_google_gwt_user_client_impl_WindowImpl();
}

var impl_3;
function buildListParamMap(queryString){
  var entry, entry$iterator, kv, kvPair, kvPair$array, kvPair$index, kvPair$max, out, qs, values, regexp;
  out = new HashMap_0;
  if (queryString != null && queryString.length > 1) {
    qs = $substring(queryString, 1);
    for (kvPair$array = $split(qs, '&', 0) , kvPair$index = 0 , kvPair$max = kvPair$array.length; kvPair$index < kvPair$max; ++kvPair$index) {
      kvPair = kvPair$array[kvPair$index];
      kv = $split(kvPair, '=', 2);
      if (kv[0].length == 0) {
        continue;
      }
      values = dynamicCast(out.get(kv[0]), Q$List);
      if (!values) {
        values = new ArrayList_0;
        out.put(kv[0], values);
      }
      values.add(kv.length > 1?(throwIfNull(kv[1]) , regexp = /\+/g , decodeURIComponent(kv[1].replace(regexp, '%20'))):'');
    }
  }
  for (entry$iterator = out.entrySet_0().iterator(); entry$iterator.hasNext();) {
    entry = dynamicCast(entry$iterator.next_0(), Q$Map$Entry);
    entry.setValue(unmodifiableList(dynamicCast(entry.getValue(), Q$List)));
  }
  out = new Collections$UnmodifiableMap_0(out);
  return out;
}

function ensureListParameterMap(){
  var currentQueryString;
  currentQueryString = ($clinit_Window() , impl_3).getQueryString();
  if (!listParamMap || !$equals_0(cachedQueryString, currentQueryString)) {
    listParamMap = buildListParamMap(currentQueryString);
    cachedQueryString = currentQueryString;
  }
}

var cachedQueryString = '', listParamMap = null;
function $eventGetTypeInt(eventType){
  switch (eventType) {
    case 'blur':
      return 4096;
    case 'change':
      return 1024;
    case 'click':
      return 1;
    case 'dblclick':
      return 2;
    case 'focus':
      return 2048;
    case 'keydown':
      return 128;
    case 'keypress':
      return 256;
    case 'keyup':
      return 512;
    case 'load':
      return 32768;
    case 'losecapture':
      return 8192;
    case 'mousedown':
      return 4;
    case 'mousemove':
      return 64;
    case 'mouseout':
      return 32;
    case 'mouseover':
      return 16;
    case 'mouseup':
      return 8;
    case 'scroll':
      return 16384;
    case 'error':
      return 65536;
    case 'DOMMouseScroll':
    case 'mousewheel':
      return 131072;
    case 'contextmenu':
      return 262144;
    case 'paste':
      return 524288;
    case 'touchstart':
      return 1048576;
    case 'touchmove':
      return 2097152;
    case 'touchend':
      return 4194304;
    case 'touchcancel':
      return 8388608;
    case 'gesturestart':
      return 16777216;
    case 'gesturechange':
      return 33554432;
    case 'gestureend':
      return 67108864;
    default:return -1;
  }
}

function $maybeInitializeEventSystem(this$static){
  if (!eventSystemIsInitialized) {
    this$static.initEventSystem();
    eventSystemIsInitialized = true;
  }
}

function $setEventListener(elem, listener){
  elem.__listener = listener;
}

function isMyListener(object){
  return !instanceOfJso(object) && instanceOf(object, Q$EventListener);
}

defineSeed(115, 1, {});
var eventSystemIsInitialized = false;
function $sinkEventsImpl(elem, bits){
  var chMask = (elem.__eventBits || 0) ^ bits;
  elem.__eventBits = bits;
  if (!chMask)
    return;
  chMask & 1 && (elem.onclick = bits & 1?callDispatchEvent:null);
  chMask & 3 && (elem.ondblclick = bits & 3?callDispatchDblClickEvent:null);
  chMask & 4 && (elem.onmousedown = bits & 4?callDispatchEvent:null);
  chMask & 8 && (elem.onmouseup = bits & 8?callDispatchEvent:null);
  chMask & 16 && (elem.onmouseover = bits & 16?callDispatchEvent:null);
  chMask & 32 && (elem.onmouseout = bits & 32?callDispatchEvent:null);
  chMask & 64 && (elem.onmousemove = bits & 64?callDispatchEvent:null);
  chMask & 128 && (elem.onkeydown = bits & 128?callDispatchEvent:null);
  chMask & 256 && (elem.onkeypress = bits & 256?callDispatchEvent:null);
  chMask & 512 && (elem.onkeyup = bits & 512?callDispatchEvent:null);
  chMask & 1024 && (elem.onchange = bits & 1024?callDispatchEvent:null);
  chMask & 2048 && (elem.onfocus = bits & 2048?callDispatchEvent:null);
  chMask & 4096 && (elem.onblur = bits & 4096?callDispatchEvent:null);
  chMask & 8192 && (elem.onlosecapture = bits & 8192?callDispatchEvent:null);
  chMask & 16384 && (elem.onscroll = bits & 16384?callDispatchEvent:null);
  chMask & 32768 && (elem.nodeName == 'IFRAME'?bits & 32768?elem.attachEvent('onload', callDispatchOnLoadEvent):elem.detachEvent('onload', callDispatchOnLoadEvent):(elem.onload = bits & 32768?callDispatchUnhandledEvent:null));
  chMask & 65536 && (elem.onerror = bits & 65536?callDispatchEvent:null);
  chMask & 131072 && (elem.onmousewheel = bits & 131072?callDispatchEvent:null);
  chMask & 262144 && (elem.oncontextmenu = bits & 262144?callDispatchEvent:null);
  chMask & 524288 && (elem.onpaste = bits & 524288?callDispatchEvent:null);
}

function previewEventImpl(){
  var isCancelled = false;
  for (var i_0 = 0; i_0 < $wnd.__gwt_globalEventArray.length; i_0++) {
    !$wnd.__gwt_globalEventArray[i_0]() && (isCancelled = true);
  }
  return !isCancelled;
}

defineSeed(117, 115, {});
_.initEventSystem = function initEventSystem(){
  $wnd.__gwt_globalEventArray == null && ($wnd.__gwt_globalEventArray = new Array);
  $wnd.__gwt_globalEventArray[$wnd.__gwt_globalEventArray.length] = $entry(function(){
    return previewEvent($wnd.event);
  }
  );
  var dispatchEvent_0 = $entry(function(){
    var oldEventTarget = ($clinit_DOMImpl() , currentEventTarget);
    currentEventTarget = this;
    if ($wnd.event.returnValue == null) {
      $wnd.event.returnValue = true;
      if (!previewEventImpl()) {
        currentEventTarget = oldEventTarget;
        return;
      }
    }
    var listener, curElem = this;
    while (curElem && !(listener = curElem.__listener)) {
      curElem = curElem.parentElement;
    }
    listener && isMyListener(listener) && dispatchEvent_1($wnd.event, curElem, listener);
    currentEventTarget = oldEventTarget;
  }
  );
  var dispatchDblClickEvent = $entry(function(){
    var newEvent = $doc.createEventObject();
    $wnd.event.returnValue == null && $wnd.event.srcElement.fireEvent && $wnd.event.srcElement.fireEvent('onclick', newEvent);
    if (this.__eventBits & 2) {
      dispatchEvent_0.call(this);
    }
     else if ($wnd.event.returnValue == null) {
      $wnd.event.returnValue = true;
      previewEventImpl();
    }
  }
  );
  var dispatchUnhandledEvent = $entry(function(){
    this.__gwtLastUnhandledEvent = $wnd.event.type;
    dispatchEvent_0.call(this);
  }
  );
  var moduleName = $moduleName.replace(/\./g, '_');
  $wnd['__gwt_dispatchEvent_' + moduleName] = dispatchEvent_0;
  callDispatchEvent = (new Function('w', 'return function() { w.__gwt_dispatchEvent_' + moduleName + '.call(this) }'))($wnd);
  $wnd['__gwt_dispatchDblClickEvent_' + moduleName] = dispatchDblClickEvent;
  callDispatchDblClickEvent = (new Function('w', 'return function() { w.__gwt_dispatchDblClickEvent_' + moduleName + '.call(this)}'))($wnd);
  $wnd['__gwt_dispatchUnhandledEvent_' + moduleName] = dispatchUnhandledEvent;
  callDispatchUnhandledEvent = (new Function('w', 'return function() { w.__gwt_dispatchUnhandledEvent_' + moduleName + '.call(this)}'))($wnd);
  callDispatchOnLoadEvent = (new Function('w', 'return function() { w.__gwt_dispatchUnhandledEvent_' + moduleName + '.call(w.event.srcElement)}'))($wnd);
  var bodyDispatcher = $entry(function(){
    dispatchEvent_0.call($doc.body);
  }
  );
  var bodyDblClickDispatcher = $entry(function(){
    dispatchDblClickEvent.call($doc.body);
  }
  );
  $doc.body.attachEvent('onclick', bodyDispatcher);
  $doc.body.attachEvent('onmousedown', bodyDispatcher);
  $doc.body.attachEvent('onmouseup', bodyDispatcher);
  $doc.body.attachEvent('onmousemove', bodyDispatcher);
  $doc.body.attachEvent('onmousewheel', bodyDispatcher);
  $doc.body.attachEvent('onkeydown', bodyDispatcher);
  $doc.body.attachEvent('onkeypress', bodyDispatcher);
  $doc.body.attachEvent('onkeyup', bodyDispatcher);
  $doc.body.attachEvent('onfocus', bodyDispatcher);
  $doc.body.attachEvent('onblur', bodyDispatcher);
  $doc.body.attachEvent('ondblclick', bodyDblClickDispatcher);
  $doc.body.attachEvent('oncontextmenu', bodyDispatcher);
}
;
_.sinkEvents = function sinkEvents_0(elem, bits){
  $maybeInitializeEventSystem(this);
  $sinkEventsImpl(elem, bits);
}
;
var callDispatchDblClickEvent = null, callDispatchEvent = null, callDispatchOnLoadEvent = null, callDispatchUnhandledEvent = null;
function DOMImplIE6_2(){
}

defineSeed(116, 117, {}, DOMImplIE6_2);
function DOMImplIE8_2(){
}

defineSeed(118, 117, {}, DOMImplIE8_2);
function $initEventSystem(){
  dispatchCapturedEvent = $entry(function(evt){
    if (!($clinit_DOM() , true)) {
      evt.stopPropagation();
      evt.preventDefault();
      return false;
    }
    return true;
  }
  );
  dispatchEvent_2 = $entry(function(evt){
    var listener, curElem = this;
    while (curElem && !(listener = curElem.__listener)) {
      curElem = curElem.parentNode;
    }
    curElem && curElem.nodeType != 1 && (curElem = null);
    listener && isMyListener(listener) && dispatchEvent_1(evt, curElem, listener);
  }
  );
  dispatchDragEvent = $entry(function(evt){
    evt.preventDefault();
    dispatchEvent_2.call(this, evt);
  }
  );
  dispatchUnhandledEvent_0 = $entry(function(evt){
    this.__gwtLastUnhandledEvent = evt.type;
    dispatchEvent_2.call(this, evt);
  }
  );
  dispatchCapturedMouseEvent = $entry(function(evt){
    var dispatchCapturedEventFn = dispatchCapturedEvent;
    if (dispatchCapturedEventFn(evt)) {
      var cap = captureElem;
      if (cap && cap.__listener) {
        if (isMyListener(cap.__listener)) {
          dispatchEvent_1(evt, cap, cap.__listener);
          evt.stopPropagation();
        }
      }
    }
  }
  );
  $wnd.addEventListener('click', dispatchCapturedMouseEvent, true);
  $wnd.addEventListener('dblclick', dispatchCapturedMouseEvent, true);
  $wnd.addEventListener('mousedown', dispatchCapturedMouseEvent, true);
  $wnd.addEventListener('mouseup', dispatchCapturedMouseEvent, true);
  $wnd.addEventListener('mousemove', dispatchCapturedMouseEvent, true);
  $wnd.addEventListener('mouseover', dispatchCapturedMouseEvent, true);
  $wnd.addEventListener('mouseout', dispatchCapturedMouseEvent, true);
  $wnd.addEventListener('mousewheel', dispatchCapturedMouseEvent, true);
  $wnd.addEventListener('keydown', dispatchCapturedEvent, true);
  $wnd.addEventListener('keyup', dispatchCapturedEvent, true);
  $wnd.addEventListener('keypress', dispatchCapturedEvent, true);
  $wnd.addEventListener('touchstart', dispatchCapturedMouseEvent, true);
  $wnd.addEventListener('touchmove', dispatchCapturedMouseEvent, true);
  $wnd.addEventListener('touchend', dispatchCapturedMouseEvent, true);
  $wnd.addEventListener('touchcancel', dispatchCapturedMouseEvent, true);
  $wnd.addEventListener('gesturestart', dispatchCapturedMouseEvent, true);
  $wnd.addEventListener('gesturechange', dispatchCapturedMouseEvent, true);
  $wnd.addEventListener('gestureend', dispatchCapturedMouseEvent, true);
}

function $sinkEventsImpl_0(elem, bits){
  var chMask = (elem.__eventBits || 0) ^ bits;
  elem.__eventBits = bits;
  if (!chMask)
    return;
  chMask & 1 && (elem.onclick = bits & 1?dispatchEvent_2:null);
  chMask & 2 && (elem.ondblclick = bits & 2?dispatchEvent_2:null);
  chMask & 4 && (elem.onmousedown = bits & 4?dispatchEvent_2:null);
  chMask & 8 && (elem.onmouseup = bits & 8?dispatchEvent_2:null);
  chMask & 16 && (elem.onmouseover = bits & 16?dispatchEvent_2:null);
  chMask & 32 && (elem.onmouseout = bits & 32?dispatchEvent_2:null);
  chMask & 64 && (elem.onmousemove = bits & 64?dispatchEvent_2:null);
  chMask & 128 && (elem.onkeydown = bits & 128?dispatchEvent_2:null);
  chMask & 256 && (elem.onkeypress = bits & 256?dispatchEvent_2:null);
  chMask & 512 && (elem.onkeyup = bits & 512?dispatchEvent_2:null);
  chMask & 1024 && (elem.onchange = bits & 1024?dispatchEvent_2:null);
  chMask & 2048 && (elem.onfocus = bits & 2048?dispatchEvent_2:null);
  chMask & 4096 && (elem.onblur = bits & 4096?dispatchEvent_2:null);
  chMask & 8192 && (elem.onlosecapture = bits & 8192?dispatchEvent_2:null);
  chMask & 16384 && (elem.onscroll = bits & 16384?dispatchEvent_2:null);
  chMask & 32768 && (elem.onload = bits & 32768?dispatchUnhandledEvent_0:null);
  chMask & 65536 && (elem.onerror = bits & 65536?dispatchEvent_2:null);
  chMask & 131072 && (elem.onmousewheel = bits & 131072?dispatchEvent_2:null);
  chMask & 262144 && (elem.oncontextmenu = bits & 262144?dispatchEvent_2:null);
  chMask & 524288 && (elem.onpaste = bits & 524288?dispatchEvent_2:null);
  chMask & 1048576 && (elem.ontouchstart = bits & 1048576?dispatchEvent_2:null);
  chMask & 2097152 && (elem.ontouchmove = bits & 2097152?dispatchEvent_2:null);
  chMask & 4194304 && (elem.ontouchend = bits & 4194304?dispatchEvent_2:null);
  chMask & 8388608 && (elem.ontouchcancel = bits & 8388608?dispatchEvent_2:null);
  chMask & 16777216 && (elem.ongesturestart = bits & 16777216?dispatchEvent_2:null);
  chMask & 33554432 && (elem.ongesturechange = bits & 33554432?dispatchEvent_2:null);
  chMask & 67108864 && (elem.ongestureend = bits & 67108864?dispatchEvent_2:null);
}

defineSeed(121, 115, {});
_.initEventSystem = function initEventSystem_0(){
  $initEventSystem();
}
;
_.sinkEvents = function sinkEvents_1(elem, bits){
  $maybeInitializeEventSystem(this);
  this.sinkEventsImpl(elem, bits);
}
;
_.sinkEventsImpl = function sinkEventsImpl(elem, bits){
  $sinkEventsImpl_0(elem, bits);
}
;
var captureElem = null, dispatchCapturedEvent = null, dispatchCapturedMouseEvent = null, dispatchDragEvent = null, dispatchEvent_2 = null, dispatchUnhandledEvent_0 = null;
defineSeed(120, 121, {});
function $initEventSystemIE(){
  dispatchDragEvent = $entry(function(evt){
    dispatchEvent_2.call(this, evt);
    return false;
  }
  );
}

function DOMImplIE9_2(){
}

defineSeed(119, 120, {}, DOMImplIE9_2);
_.initEventSystem = function initEventSystem_1(){
  $initEventSystem();
  $initEventSystemIE();
}
;
function $initSyntheticMouseUpEvents(){
  $wnd.addEventListener('mouseout', $entry(function(evt){
    var cap = captureElem;
    if (cap && !evt.relatedTarget) {
      if ('html' == evt.target.tagName.toLowerCase()) {
        var muEvent = $doc.createEvent('MouseEvents');
        muEvent.initMouseEvent('mouseup', true, true, $wnd, 0, evt.screenX, evt.screenY, evt.clientX, evt.clientY, evt.ctrlKey, evt.altKey, evt.shiftKey, evt.metaKey, evt.button, null);
        cap.dispatchEvent(muEvent);
      }
    }
  }
  ), true);
  $wnd.addEventListener('DOMMouseScroll', dispatchCapturedMouseEvent, true);
}

function DOMImplMozilla_2(){
}

defineSeed(122, 121, {}, DOMImplMozilla_2);
_.initEventSystem = function initEventSystem_2(){
  $initEventSystem();
  $initSyntheticMouseUpEvents();
}
;
_.sinkEvents = function sinkEvents_2(elem, bits){
  $maybeInitializeEventSystem(this);
  $sinkEventsImpl_0(elem, bits);
  bits & 131072 && elem.addEventListener('DOMMouseScroll', dispatchEvent_2, false);
}
;
function DOMImplOpera_2(){
}

defineSeed(123, 121, {}, DOMImplOpera_2);
_.sinkEventsImpl = function sinkEventsImpl_0(elem, bits){
  elem.__eventBits = bits;
  elem.onclick = bits & 1?dispatchEvent_2:null;
  elem.ondblclick = bits & 2?dispatchEvent_2:null;
  elem.onmousedown = bits & 4?dispatchEvent_2:null;
  elem.onmouseup = bits & 8?dispatchEvent_2:null;
  elem.onmouseover = bits & 16?dispatchEvent_2:null;
  elem.onmouseout = bits & 32?dispatchEvent_2:null;
  elem.onmousemove = bits & 64?dispatchEvent_2:null;
  elem.onkeydown = bits & 128?dispatchEvent_2:null;
  elem.onkeypress = bits & 256?dispatchEvent_2:null;
  elem.onkeyup = bits & 512?dispatchEvent_2:null;
  elem.onchange = bits & 1024?dispatchEvent_2:null;
  elem.onfocus = bits & 2048?dispatchEvent_2:null;
  elem.onblur = bits & 4096?dispatchEvent_2:null;
  elem.onlosecapture = bits & 8192?dispatchEvent_2:null;
  elem.onscroll = bits & 16384?dispatchEvent_2:null;
  elem.onload = bits & 32768?dispatchUnhandledEvent_0:null;
  elem.onerror = bits & 65536?dispatchEvent_2:null;
  elem.onmousewheel = bits & 131072?dispatchEvent_2:null;
  elem.oncontextmenu = bits & 262144?dispatchEvent_2:null;
  elem.onpaste = bits & 524288?dispatchEvent_2:null;
}
;
function DOMImplWebkit_2(){
}

defineSeed(124, 120, {}, DOMImplWebkit_2);
function WindowImpl_0(){
}

defineSeed(125, 1, {}, WindowImpl_0);
_.getQueryString = function getQueryString(){
  return $wnd.location.search;
}
;
function WindowImplIE_0(){
}

defineSeed(126, 125, {}, WindowImplIE_0);
_.getQueryString = function getQueryString_0(){
  var href = $wnd.location.href;
  var hashLoc = href.indexOf('#');
  hashLoc >= 0 && (href = href.substring(0, hashLoc));
  var questionLoc = href.indexOf('?');
  return questionLoc > 0?href.substring(questionLoc):'';
}
;
function WindowImplMozilla_0(){
}

defineSeed(127, 125, {}, WindowImplMozilla_0);
function $setTextOrHtml(this$static, content_0, isHtml){
  isHtml?$setInnerHTML(this$static.element, content_0):$setInnerText(this$static.element, content_0);
  if (this$static.textDir != this$static.initialElementDir) {
    this$static.textDir = this$static.initialElementDir;
    setDirectionOnElement(this$static.element, this$static.initialElementDir);
  }
}

function DirectionalTextHelper_0(element){
  this.element = element;
  this.initialElementDir = getDirectionOnElement(element);
  this.textDir = this.initialElementDir;
}

defineSeed(128, 1, {}, DirectionalTextHelper_0);
_.element = null;
_.initialElementDir = null;
_.textDir = null;
function $replaceNode(node, newNode){
  var p_0 = node.parentNode;
  if (!p_0) {
    return;
  }
  p_0.insertBefore(newNode, node);
  p_0.removeChild(node);
}

function setStyleName(elem, styleName){
  $clinit_DOM();
  elem['className'] = styleName;
}

defineSeed(133, 1, {});
_.toString$ = function toString_13(){
  if (!this.element) {
    return '(null handle)';
  }
  return $clinit_DOM() , $getString(this.element);
}
;
_.element = null;
function $onBrowserEvent(this$static, event_0){
  var related;
  switch ($clinit_DOM() , $eventGetTypeInt(($clinit_DOMImpl() , event_0).type)) {
    case 16:
    case 32:
      related = impl_0.eventGetRelatedTarget(event_0);
      if (!!related && $isOrHasChild(this$static.element, related)) {
        return;
      }

  }
  fireNativeEvent(this$static.element);
}

function $replaceElement(this$static, elem){
  this$static.attached && ($clinit_DOM() , this$static.element.__listener = null , undefined);
  !!this$static.element && $replaceNode(this$static.element, elem);
  this$static.element = elem;
  this$static.attached && ($clinit_DOM() , $setEventListener(this$static.element, this$static));
}

defineSeed(132, 133, makeCastMap([Q$EventListener]));
_.onBrowserEvent = function onBrowserEvent(event_0){
  $onBrowserEvent(this, event_0);
}
;
_.attached = false;
_.eventsToSink = 0;
function LabelBase_0(element){
  this.element = element;
  this.directionalTextHelper = new DirectionalTextHelper_0(this.element);
}

defineSeed(131, 132, makeCastMap([Q$EventListener]));
_.directionalTextHelper = null;
function Label_0(element){
  LabelBase_0.call(this, element, $equalsIgnoreCase('span', ($clinit_DOMImpl() , impl_0).getTagName(element)));
}

function Label_1(text){
  LabelBase_0.call(this, $createDivElement($doc));
  setStyleName(this.element, 'gwt-Label');
  $setTextOrHtml(this.directionalTextHelper, text, false);
}

defineSeed(130, 131, makeCastMap([Q$EventListener]), Label_1);
function HTML_0(html){
  Label_0.call(this, $createDivElement($doc));
  setStyleName(this.element, 'gwt-HTML');
  $setTextOrHtml(this.directionalTextHelper, html, true);
}

defineSeed(129, 130, makeCastMap([Q$EventListener]), HTML_0);
function $clinit_HasHorizontalAlignment(){
  $clinit_HasHorizontalAlignment = nullMethod;
  $clinit_Style$TextAlign();
  $clinit_LocaleInfo();
}

function $clinit_Image(){
  $clinit_Image = nullMethod;
  new HashMap_0;
}

function $changeState(this$static, newState){
  this$static.state = newState;
}

function Image_1(){
  $clinit_Image();
  $changeState(this, new Image$UnclippedState_0(this));
  setStyleName(this.element, 'gwt-Image');
}

defineSeed(134, 132, makeCastMap([Q$EventListener]), Image_1);
_.onBrowserEvent = function onBrowserEvent_0(event_0){
  ($clinit_DOM() , $eventGetTypeInt(($clinit_DOMImpl() , event_0).type)) == 32768 && !!this.state && (this.element['__gwtLastUnhandledEvent'] = '' , undefined);
  $onBrowserEvent(this, event_0);
}
;
_.state = null;
defineSeed(135, 1, {});
function $setUrl(image, url){
  !!image.state && (image.element['__gwtLastUnhandledEvent'] = '' , undefined);
  $setSrc(image.element, url.uri);
}

function Image$UnclippedState_0(image){
  $replaceElement(image, $createImageElement($doc));
  sinkEvents(image.element, 32768);
  image.eventsToSink == -1?sinkEvents(image.element, 133398655 | ($clinit_DOM() , image.element.__eventBits || 0)):(image.eventsToSink |= 133398655);
}

defineSeed(136, 135, {}, Image$UnclippedState_0);
function $onModuleLoad_1(){
  var compileTimeValue, impl, runtimeValue;
  impl = dynamicCast(com_google_gwt_useragent_client_UserAgentAsserter_UserAgentProperty(), Q$UserAgentAsserter$UserAgentProperty);
  if (!impl.getUserAgentRuntimeWarning()) {
    return;
  }
  compileTimeValue = impl.getCompileTimeValue();
  runtimeValue = impl.getRuntimeValue();
  $equals_0(compileTimeValue, runtimeValue) || ($wnd.alert('ERROR: Possible problem with your *.gwt.xml module file.\nThe compile time user.agent value (' + compileTimeValue + ') does not match the runtime user.agent value (' + runtimeValue + '). Expect more errors.\n') , undefined);
}

function UserAgentAsserter_UserAgentPropertyImplGecko1_8_0(){
}

defineSeed(138, 1, makeCastMap([Q$UserAgentAsserter$UserAgentProperty]), UserAgentAsserter_UserAgentPropertyImplGecko1_8_0);
_.getCompileTimeValue = function getCompileTimeValue(){
  return 'gecko1_8';
}
;
_.getRuntimeValue = function getRuntimeValue(){
  var ua = navigator.userAgent.toLowerCase();
  var makeVersion = function(result){
    return parseInt(result[1]) * 1000 + parseInt(result[2]);
  }
  ;
  if (function(){
    return ua.indexOf('opera') != -1;
  }
  ())
    return 'opera';
  if (function(){
    return ua.indexOf('webkit') != -1;
  }
  ())
    return 'safari';
  if (function(){
    return ua.indexOf('msie') != -1 && $doc.documentMode >= 9;
  }
  ())
    return 'ie9';
  if (function(){
    return ua.indexOf('msie') != -1 && $doc.documentMode >= 8;
  }
  ())
    return 'ie8';
  if (function(){
    var result = /msie ([0-9]+)\.([0-9]+)/.exec(ua);
    if (result && result.length == 3)
      return makeVersion(result) >= 6000;
  }
  ())
    return 'ie6';
  if (function(){
    return ua.indexOf('gecko') != -1;
  }
  ())
    return 'gecko1_8';
  return 'unknown';
}
;
_.getUserAgentRuntimeWarning = function getUserAgentRuntimeWarning(){
  return true;
}
;
function UserAgentAsserter_UserAgentPropertyImplIe6_0(){
}

defineSeed(139, 1, makeCastMap([Q$UserAgentAsserter$UserAgentProperty]), UserAgentAsserter_UserAgentPropertyImplIe6_0);
_.getCompileTimeValue = function getCompileTimeValue_0(){
  return 'ie6';
}
;
_.getRuntimeValue = function getRuntimeValue_0(){
  var ua = navigator.userAgent.toLowerCase();
  var makeVersion = function(result){
    return parseInt(result[1]) * 1000 + parseInt(result[2]);
  }
  ;
  if (function(){
    return ua.indexOf('opera') != -1;
  }
  ())
    return 'opera';
  if (function(){
    return ua.indexOf('webkit') != -1;
  }
  ())
    return 'safari';
  if (function(){
    return ua.indexOf('msie') != -1 && $doc.documentMode >= 9;
  }
  ())
    return 'ie9';
  if (function(){
    return ua.indexOf('msie') != -1 && $doc.documentMode >= 8;
  }
  ())
    return 'ie8';
  if (function(){
    var result = /msie ([0-9]+)\.([0-9]+)/.exec(ua);
    if (result && result.length == 3)
      return makeVersion(result) >= 6000;
  }
  ())
    return 'ie6';
  if (function(){
    return ua.indexOf('gecko') != -1;
  }
  ())
    return 'gecko1_8';
  return 'unknown';
}
;
_.getUserAgentRuntimeWarning = function getUserAgentRuntimeWarning_0(){
  return true;
}
;
function UserAgentAsserter_UserAgentPropertyImplIe8_0(){
}

defineSeed(140, 1, makeCastMap([Q$UserAgentAsserter$UserAgentProperty]), UserAgentAsserter_UserAgentPropertyImplIe8_0);
_.getCompileTimeValue = function getCompileTimeValue_1(){
  return 'ie8';
}
;
_.getRuntimeValue = function getRuntimeValue_1(){
  var ua = navigator.userAgent.toLowerCase();
  var makeVersion = function(result){
    return parseInt(result[1]) * 1000 + parseInt(result[2]);
  }
  ;
  if (function(){
    return ua.indexOf('opera') != -1;
  }
  ())
    return 'opera';
  if (function(){
    return ua.indexOf('webkit') != -1;
  }
  ())
    return 'safari';
  if (function(){
    return ua.indexOf('msie') != -1 && $doc.documentMode >= 9;
  }
  ())
    return 'ie9';
  if (function(){
    return ua.indexOf('msie') != -1 && $doc.documentMode >= 8;
  }
  ())
    return 'ie8';
  if (function(){
    var result = /msie ([0-9]+)\.([0-9]+)/.exec(ua);
    if (result && result.length == 3)
      return makeVersion(result) >= 6000;
  }
  ())
    return 'ie6';
  if (function(){
    return ua.indexOf('gecko') != -1;
  }
  ())
    return 'gecko1_8';
  return 'unknown';
}
;
_.getUserAgentRuntimeWarning = function getUserAgentRuntimeWarning_1(){
  return true;
}
;
function UserAgentAsserter_UserAgentPropertyImplIe9_0(){
}

defineSeed(141, 1, makeCastMap([Q$UserAgentAsserter$UserAgentProperty]), UserAgentAsserter_UserAgentPropertyImplIe9_0);
_.getCompileTimeValue = function getCompileTimeValue_2(){
  return 'ie9';
}
;
_.getRuntimeValue = function getRuntimeValue_2(){
  var ua = navigator.userAgent.toLowerCase();
  var makeVersion = function(result){
    return parseInt(result[1]) * 1000 + parseInt(result[2]);
  }
  ;
  if (function(){
    return ua.indexOf('opera') != -1;
  }
  ())
    return 'opera';
  if (function(){
    return ua.indexOf('webkit') != -1;
  }
  ())
    return 'safari';
  if (function(){
    return ua.indexOf('msie') != -1 && $doc.documentMode >= 9;
  }
  ())
    return 'ie9';
  if (function(){
    return ua.indexOf('msie') != -1 && $doc.documentMode >= 8;
  }
  ())
    return 'ie8';
  if (function(){
    var result = /msie ([0-9]+)\.([0-9]+)/.exec(ua);
    if (result && result.length == 3)
      return makeVersion(result) >= 6000;
  }
  ())
    return 'ie6';
  if (function(){
    return ua.indexOf('gecko') != -1;
  }
  ())
    return 'gecko1_8';
  return 'unknown';
}
;
_.getUserAgentRuntimeWarning = function getUserAgentRuntimeWarning_2(){
  return true;
}
;
function UserAgentAsserter_UserAgentPropertyImplOpera_0(){
}

defineSeed(142, 1, makeCastMap([Q$UserAgentAsserter$UserAgentProperty]), UserAgentAsserter_UserAgentPropertyImplOpera_0);
_.getCompileTimeValue = function getCompileTimeValue_3(){
  return 'opera';
}
;
_.getRuntimeValue = function getRuntimeValue_3(){
  var ua = navigator.userAgent.toLowerCase();
  var makeVersion = function(result){
    return parseInt(result[1]) * 1000 + parseInt(result[2]);
  }
  ;
  if (function(){
    return ua.indexOf('opera') != -1;
  }
  ())
    return 'opera';
  if (function(){
    return ua.indexOf('webkit') != -1;
  }
  ())
    return 'safari';
  if (function(){
    return ua.indexOf('msie') != -1 && $doc.documentMode >= 9;
  }
  ())
    return 'ie9';
  if (function(){
    return ua.indexOf('msie') != -1 && $doc.documentMode >= 8;
  }
  ())
    return 'ie8';
  if (function(){
    var result = /msie ([0-9]+)\.([0-9]+)/.exec(ua);
    if (result && result.length == 3)
      return makeVersion(result) >= 6000;
  }
  ())
    return 'ie6';
  if (function(){
    return ua.indexOf('gecko') != -1;
  }
  ())
    return 'gecko1_8';
  return 'unknown';
}
;
_.getUserAgentRuntimeWarning = function getUserAgentRuntimeWarning_3(){
  return true;
}
;
function UserAgentAsserter_UserAgentPropertyImplSafari_0(){
}

defineSeed(143, 1, makeCastMap([Q$UserAgentAsserter$UserAgentProperty]), UserAgentAsserter_UserAgentPropertyImplSafari_0);
_.getCompileTimeValue = function getCompileTimeValue_4(){
  return 'safari';
}
;
_.getRuntimeValue = function getRuntimeValue_4(){
  var ua = navigator.userAgent.toLowerCase();
  var makeVersion = function(result){
    return parseInt(result[1]) * 1000 + parseInt(result[2]);
  }
  ;
  if (function(){
    return ua.indexOf('opera') != -1;
  }
  ())
    return 'opera';
  if (function(){
    return ua.indexOf('webkit') != -1;
  }
  ())
    return 'safari';
  if (function(){
    return ua.indexOf('msie') != -1 && $doc.documentMode >= 9;
  }
  ())
    return 'ie9';
  if (function(){
    return ua.indexOf('msie') != -1 && $doc.documentMode >= 8;
  }
  ())
    return 'ie8';
  if (function(){
    var result = /msie ([0-9]+)\.([0-9]+)/.exec(ua);
    if (result && result.length == 3)
      return makeVersion(result) >= 6000;
  }
  ())
    return 'ie6';
  if (function(){
    return ua.indexOf('gecko') != -1;
  }
  ())
    return 'gecko1_8';
  return 'unknown';
}
;
_.getUserAgentRuntimeWarning = function getUserAgentRuntimeWarning_4(){
  return true;
}
;
function $clinit_CoordCube(){
  $clinit_CoordCube = nullMethod;
  UDSliceMove = initDims([_3_3C_classLit, _3C_classLit], [makeCastMap([Q$Serializable, Q$Object_$1]), makeCastMap([Q$char_$1, Q$Serializable])], [Q$char_$1, -1], [495, 18], 2, 1);
  TwistMove = initDims([_3_3C_classLit, _3C_classLit], [makeCastMap([Q$Serializable, Q$Object_$1]), makeCastMap([Q$char_$1, Q$Serializable])], [Q$char_$1, -1], [324, 18], 2, 1);
  FlipMove = initDims([_3_3C_classLit, _3C_classLit], [makeCastMap([Q$Serializable, Q$Object_$1]), makeCastMap([Q$char_$1, Q$Serializable])], [Q$char_$1, -1], [336, 18], 2, 1);
  UDSliceConj = initDims([_3_3C_classLit, _3C_classLit], [makeCastMap([Q$Serializable, Q$Object_$1]), makeCastMap([Q$char_$1, Q$Serializable])], [Q$char_$1, -1], [495, 8], 2, 1);
  UDSliceTwistPrun = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 20048, 1);
  UDSliceFlipPrun = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 20790, 1);
  TwistFlipPrun = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 108864, 1);
  CPermMove = initDims([_3_3C_classLit, _3C_classLit], [makeCastMap([Q$Serializable, Q$Object_$1]), makeCastMap([Q$char_$1, Q$Serializable])], [Q$char_$1, -1], [2768, 18], 2, 1);
  EPermMove = initDims([_3_3C_classLit, _3C_classLit], [makeCastMap([Q$Serializable, Q$Object_$1]), makeCastMap([Q$char_$1, Q$Serializable])], [Q$char_$1, -1], [2768, 10], 2, 1);
  MPermMove = initDims([_3_3C_classLit, _3C_classLit], [makeCastMap([Q$Serializable, Q$Object_$1]), makeCastMap([Q$char_$1, Q$Serializable])], [Q$char_$1, -1], [24, 10], 2, 1);
  MPermConj = initDims([_3_3C_classLit, _3C_classLit], [makeCastMap([Q$Serializable, Q$Object_$1]), makeCastMap([Q$char_$1, Q$Serializable])], [Q$char_$1, -1], [24, 16], 2, 1);
  MCPermPrun = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 8304, 1);
  MEPermPrun = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 8304, 1);
}

function getPruning(table, index){
  $clinit_CoordCube();
  return ~~table[~~index >> 3] >> ((index & 7) << 2) & 15;
}

function initCPermMove(){
  $clinit_CoordCube();
  var c, d, i_0, j;
  c = new CubieCube_0;
  d = new CubieCube_0;
  for (i_0 = 0; i_0 < 2768; ++i_0) {
    $setCPerm(c, ($clinit_CubieCube() , EPermS2R)[i_0]);
    for (j = 0; j < 18; ++j) {
      CornMult(c, moveCube[j], d);
      CPermMove[i_0][j] = $getCPermSym(d) & 65535;
    }
  }
}

function initEPermMove(){
  $clinit_CoordCube();
  var c, d, i_0, j;
  c = new CubieCube_0;
  d = new CubieCube_0;
  for (i_0 = 0; i_0 < 2768; ++i_0) {
    $setEPerm(c, ($clinit_CubieCube() , EPermS2R)[i_0]);
    for (j = 0; j < 10; ++j) {
      EdgeMult(c, moveCube[($clinit_Util() , ud2std)[j]], d);
      EPermMove[i_0][j] = $getEPermSym(d) & 65535;
    }
  }
}

function initFlipMove(){
  $clinit_CoordCube();
  var c, d, i_0, j;
  c = new CubieCube_0;
  d = new CubieCube_0;
  for (i_0 = 0; i_0 < 336; ++i_0) {
    $setFlip(c, ($clinit_CubieCube() , FlipS2R)[i_0]);
    for (j = 0; j < 18; ++j) {
      EdgeMult(c, moveCube[j], d);
      FlipMove[i_0][j] = $getFlipSym(d) & 65535;
    }
  }
}

function initMPermMoveConj(){
  $clinit_CoordCube();
  var c, d, i_0, j;
  c = new CubieCube_0;
  d = new CubieCube_0;
  for (i_0 = 0; i_0 < 24; ++i_0) {
    setComb(c.ep, i_0 << 9);
    for (j = 0; j < 10; ++j) {
      EdgeMult(c, ($clinit_CubieCube() , moveCube)[($clinit_Util() , ud2std)[j]], d);
      MPermMove[i_0][j] = ~~getComb(d.ep, 8) >> 9 & 65535;
    }
    for (j = 0; j < 16; ++j) {
      EdgeConjugate(c, ($clinit_CubieCube() , SymInv)[j], d);
      MPermConj[i_0][j] = ~~getComb(d.ep, 8) >> 9 & 65535;
    }
  }
}

function initRawSymPrun(PrunTable, INV_DEPTH, RawMove, RawConj, SymMove, SymState, SymSwitch, moveMap, SYM_SHIFT){
  $clinit_CoordCube();
  var N_MOVES, N_RAW, N_SIZE, N_SYM, SYM_MASK, check, depth, done, end, i_0, idx, idxx, inv, j, m_0, raw, rawx, select, sym, symState, symx, val;
  SYM_MASK = (1 << SYM_SHIFT) - 1;
  N_RAW = RawMove.length;
  N_SYM = SymMove.length;
  N_SIZE = N_RAW * N_SYM;
  N_MOVES = RawMove[0].length;
  for (i_0 = 0; i_0 < ~~((N_RAW * N_SYM + 7) / 8); ++i_0) {
    PrunTable[i_0] = -1;
  }
  PrunTable[0] ^= 15;
  depth = 0;
  done = 1;
  while (done < N_SIZE) {
    inv = depth > INV_DEPTH;
    select = inv?15:depth;
    check = inv?depth:15;
    ++depth;
    for (i_0 = 0; i_0 < N_SIZE;) {
      val = PrunTable[~~i_0 >> 3];
      if (!inv && val == -1) {
        i_0 += 8;
        continue;
      }
      for (end = i_0 + 8 < N_SIZE?i_0 + 8:N_SIZE; i_0 < end; ++i_0 , val >>= 4) {
        if ((val & 15) == select) {
          raw = i_0 % N_RAW;
          sym = ~~(i_0 / N_RAW);
          for (m_0 = 0; m_0 < N_MOVES; ++m_0) {
            symx = SymMove[sym][moveMap == null?m_0:moveMap[m_0]];
            rawx = RawConj[RawMove[raw][m_0] & 511][symx & SYM_MASK];
            symx >>>= SYM_SHIFT;
            idx = symx * N_RAW + rawx;
            if ((~~PrunTable[~~idx >> 3] >> ((idx & 7) << 2) & 15) == check) {
              ++done;
              if (inv) {
                PrunTable[~~i_0 >> 3] ^= (15 ^ depth) << ((i_0 & 7) << 2);
                break;
              }
               else {
                PrunTable[~~idx >> 3] ^= (15 ^ depth) << ((idx & 7) << 2);
                for (j = 1 , symState = SymState[symx]; (symState >>= 1) != 0; ++j) {
                  if ((symState & 1) == 1) {
                    idxx = symx * N_RAW + RawConj[rawx][j ^ (SymSwitch == null?0:SymSwitch[j])];
                    if ((~~PrunTable[~~idxx >> 3] >> ((idxx & 7) << 2) & 15) == 15) {
                      PrunTable[~~idxx >> 3] ^= (15 ^ depth) << ((idxx & 7) << 2);
                      ++done;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

function initTwistFlipPrun(){
  $clinit_CoordCube();
  var check, depth, done, flip, flipx, fsym, fsymx, fsymxx, i_0, idx, idxx, inv, j, k_0, m_0, select, sym, symF, tsymx, twist, twistx;
  depth = 0;
  done = 8;
  for (i_0 = 0; i_0 < 108864; ++i_0) {
    TwistFlipPrun[i_0] = -1;
  }
  for (i_0 = 0; i_0 < 8; ++i_0) {
    setPruning(TwistFlipPrun, i_0, 0);
  }
  while (done < 870912) {
    inv = depth > 6;
    select = inv?15:depth;
    check = inv?depth:15;
    ++depth;
    for (i_0 = 0; i_0 < 870912; ++i_0) {
      if (getPruning(TwistFlipPrun, i_0) == select) {
        twist = ~~(i_0 / 2688);
        flip = i_0 % 2688;
        fsym = i_0 & 7;
        flip >>>= 3;
        for (m_0 = 0; m_0 < 18; ++m_0) {
          twistx = TwistMove[twist][m_0];
          tsymx = twistx & 7;
          twistx >>>= 3;
          flipx = FlipMove[flip][($clinit_CubieCube() , Sym8Move)[fsym][m_0]];
          fsymx = Sym8MultInv[Sym8Mult[flipx & 7][fsym]][tsymx];
          flipx >>>= 3;
          idx = twistx * 336 + flipx << 3 | fsymx;
          if (getPruning(TwistFlipPrun, idx) == check) {
            ++done;
            if (inv) {
              setPruning(TwistFlipPrun, i_0, depth);
              break;
            }
             else {
              setPruning(TwistFlipPrun, idx, depth);
              sym = SymStateTwist[twistx];
              symF = SymStateFlip[flipx];
              if (sym != 1 || symF != 1) {
                for (j = 0; j < 8; ++j , symF = ~~symF >> 1 & 65535) {
                  if ((symF & 1) == 1) {
                    fsymxx = Sym8MultInv[fsymx][j];
                    for (k_0 = 0; k_0 < 8; ++k_0) {
                      if ((sym & 1 << k_0) != 0) {
                        idxx = twistx * 2688 + (flipx << 3 | Sym8MultInv[fsymxx][k_0]);
                        if (getPruning(TwistFlipPrun, idxx) == 15) {
                          setPruning(TwistFlipPrun, idxx, depth);
                          ++done;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

function initTwistMove(){
  $clinit_CoordCube();
  var c, d, i_0, j;
  c = new CubieCube_0;
  d = new CubieCube_0;
  for (i_0 = 0; i_0 < 324; ++i_0) {
    $setTwist(c, ($clinit_CubieCube() , TwistS2R)[i_0]);
    for (j = 0; j < 18; ++j) {
      CornMult(c, moveCube[j], d);
      TwistMove[i_0][j] = $getTwistSym(d) & 65535;
    }
  }
}

function initUDSliceMoveConj(){
  $clinit_CoordCube();
  var c, cx, d, i_0, j, k_0, udslice;
  c = new CubieCube_0;
  d = new CubieCube_0;
  for (i_0 = 0; i_0 < 495; ++i_0) {
    setComb(c.ep, i_0);
    for (j = 0; j < 18; j += 3) {
      EdgeMult(c, ($clinit_CubieCube() , moveCube)[j], d);
      UDSliceMove[i_0][j] = getComb(d.ep, 8) & 65535;
    }
    for (j = 0; j < 16; j += 2) {
      EdgeConjugate(c, ($clinit_CubieCube() , SymInv)[j], d);
      UDSliceConj[i_0][~~j >>> 1] = getComb(d.ep, 8) & 511 & 65535;
    }
  }
  for (i_0 = 0; i_0 < 495; ++i_0) {
    for (j = 0; j < 18; j += 3) {
      udslice = UDSliceMove[i_0][j];
      for (k_0 = 1; k_0 < 3; ++k_0) {
        cx = UDSliceMove[udslice & 511][j];
        udslice = ($clinit_Util() , permMult)[~~udslice >>> 9][~~cx >>> 9] << 9 | cx & 511;
        UDSliceMove[i_0][j + k_0] = udslice & 65535;
      }
    }
  }
}

function setPruning(table, index, value){
  table[~~index >> 3] ^= (15 ^ value) << ((index & 7) << 2);
}

var CPermMove, EPermMove, FlipMove, MCPermPrun, MEPermPrun, MPermConj, MPermMove, TwistFlipPrun, TwistMove, UDSliceConj, UDSliceFlipPrun, UDSliceMove, UDSliceTwistPrun;
function $clinit_CubieCube(){
  $clinit_CubieCube = nullMethod;
  var m_0, urfIdx, urfMoveArr, urfMoveArrInv;
  CubeSym = initDim(_3Lcs_min2phase_CubieCube_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$CubieCube, 16, 0);
  moveCube = initDim(_3Lcs_min2phase_CubieCube_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$CubieCube, 18, 0);
  SymInv = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 16, 1);
  SymMult = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [16, 16], 2, 1);
  SymMove_0 = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [16, 18], 2, 1);
  Sym8Mult = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [8, 8], 2, 1);
  Sym8Move = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [8, 18], 2, 1);
  Sym8MultInv = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [8, 8], 2, 1);
  SymMoveUD = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [16, 10], 2, 1);
  FlipS2R = initDim(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, 336, 1);
  TwistS2R = initDim(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, 324, 1);
  EPermS2R = initDim(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, 2768, 1);
  e2c = initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [0, 0, 0, 0, 1, 3, 1, 3, 1, 3, 1, 3, 0, 0, 0, 0]);
  MtoEPerm = initDim(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, 40320, 1);
  SymStateTwist = initDim(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, 324, 1);
  SymStateFlip = initDim(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, 336, 1);
  SymStatePerm = initDim(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, 2768, 1);
  urf1 = new CubieCube_1(2531, 1373, 67026819, 1367);
  urf2 = new CubieCube_1(2089, 1906, 322752913, 2040);
  urfMove = initValues(_3_3B_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$byte_$1, [initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [6, 7, 8, 0, 1, 2, 3, 4, 5, 15, 16, 17, 9, 10, 11, 12, 13, 14]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [3, 4, 5, 6, 7, 8, 0, 1, 2, 12, 13, 14, 15, 16, 17, 9, 10, 11]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [2, 1, 0, 5, 4, 3, 8, 7, 6, 11, 10, 9, 14, 13, 12, 17, 16, 15]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [8, 7, 6, 2, 1, 0, 5, 4, 3, 17, 16, 15, 11, 10, 9, 14, 13, 12]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [5, 4, 3, 8, 7, 6, 2, 1, 0, 14, 13, 12, 17, 16, 15, 11, 10, 9])]);
  urfMoveInv = initDim(_3_3B_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$byte_$1, urfMove.length, 0);
  for (urfIdx = 0; urfIdx < urfMove.length; ++urfIdx) {
    urfMoveArr = urfMove[urfIdx];
    urfMoveArrInv = initDim(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, urfMoveArr.length, 1);
    urfMoveInv[urfIdx] = urfMoveArrInv;
    for (m_0 = 0; m_0 < urfMoveArr.length; ++m_0) {
      urfMoveArrInv[urfMoveArr[m_0]] = m_0;
    }
  }
}

function $$init(this$static){
  this$static.cp = initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [0, 1, 2, 3, 4, 5, 6, 7]);
  this$static.co = initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [0, 0, 0, 0, 0, 0, 0, 0]);
  this$static.ep = initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  this$static.eo = initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
}

function $copy(this$static, c){
  var i_0;
  for (i_0 = 0; i_0 < 8; ++i_0) {
    this$static.cp[i_0] = c.cp[i_0];
    this$static.co[i_0] = c.co[i_0];
  }
  for (i_0 = 0; i_0 < 12; ++i_0) {
    this$static.ep[i_0] = c.ep[i_0];
    this$static.eo[i_0] = c.eo[i_0];
  }
}

function $getCPermSym(this$static){
  var idx, k_0;
  if (EPermR2S != null) {
    idx = EPermR2S[get8Perm(this$static.cp)];
    idx ^= e2c[idx & 15];
    return idx;
  }
  !this$static.temps && (this$static.temps = new CubieCube_0);
  for (k_0 = 0; k_0 < 16; ++k_0) {
    CornConjugate(this$static, SymInv[k_0], this$static.temps);
    idx = binarySearch(EPermS2R, get8Perm(this$static.temps.cp));
    if (idx != 65535) {
      return idx << 4 | k_0;
    }
  }
  return 0;
}

function $getEPermSym(this$static){
  var idx, k_0;
  if (EPermR2S != null) {
    return EPermR2S[get8Perm(this$static.ep)];
  }
  !this$static.temps && (this$static.temps = new CubieCube_0);
  for (k_0 = 0; k_0 < 16; ++k_0) {
    EdgeConjugate(this$static, SymInv[k_0], this$static.temps);
    idx = binarySearch(EPermS2R, get8Perm(this$static.temps.ep));
    if (idx != 65535) {
      return idx << 4 | k_0;
    }
  }
  return 0;
}

function $getFlip(this$static){
  var i_0, idx;
  idx = 0;
  for (i_0 = 0; i_0 < 11; ++i_0) {
    idx <<= 1;
    idx |= this$static.eo[i_0];
  }
  return idx;
}

function $getFlipSym(this$static){
  var idx, k_0;
  if (FlipR2S != null) {
    return FlipR2S[$getFlip(this$static)];
  }
  !this$static.temps && (this$static.temps = new CubieCube_0);
  for (k_0 = 0; k_0 < 16; k_0 += 2) {
    EdgeConjugate(this$static, SymInv[k_0], this$static.temps);
    idx = binarySearch(FlipS2R, $getFlip(this$static.temps));
    if (idx != 65535) {
      return idx << 3 | ~~k_0 >> 1;
    }
  }
  return 0;
}

function $getTwist(this$static){
  var i_0, idx;
  idx = 0;
  for (i_0 = 0; i_0 < 7; ++i_0) {
    idx *= 3;
    idx += this$static.co[i_0];
  }
  return idx;
}

function $getTwistSym(this$static){
  var idx, k_0;
  if (TwistR2S != null) {
    return TwistR2S[$getTwist(this$static)];
  }
  !this$static.temps && (this$static.temps = new CubieCube_0);
  for (k_0 = 0; k_0 < 16; k_0 += 2) {
    CornConjugate(this$static, SymInv[k_0], this$static.temps);
    idx = binarySearch(TwistS2R, $getTwist(this$static.temps));
    if (idx != 65535) {
      return idx << 3 | ~~k_0 >> 1;
    }
  }
  return 0;
}

function $invCubieCube(this$static){
  var corn, edge, ori;
  for (edge = 0; edge < 12; ++edge)
    this$static.temps.ep[this$static.ep[edge]] = edge;
  for (edge = 0; edge < 12; ++edge)
    this$static.temps.eo[edge] = this$static.eo[this$static.temps.ep[edge]];
  for (corn = 0; corn < 8; ++corn)
    this$static.temps.cp[this$static.cp[corn]] = corn;
  for (corn = 0; corn < 8; ++corn) {
    ori = this$static.co[this$static.temps.cp[corn]];
    this$static.temps.co[corn] = -ori;
    this$static.temps.co[corn] < 0 && (this$static.temps.co[corn] = ~~(this$static.temps.co[corn] + 3 << 24) >> 24);
  }
  $copy(this$static, this$static.temps);
}

function $setCPerm(this$static, idx){
  set8Perm(this$static.cp, idx);
}

function $setEPerm(this$static, idx){
  set8Perm(this$static.ep, idx);
}

function $setFlip(this$static, idx){
  var i_0, parity;
  parity = 0;
  for (i_0 = 10; i_0 >= 0; --i_0) {
    parity ^= this$static.eo[i_0] = ~~((idx & 1) << 24) >> 24;
    idx >>= 1;
  }
  this$static.eo[11] = ~~(parity << 24) >> 24;
}

function $setTwist(this$static, idx){
  var i_0, twst;
  twst = 0;
  for (i_0 = 6; i_0 >= 0; --i_0) {
    twst += this$static.co[i_0] = ~~(idx % 3 << 24) >> 24;
    idx = ~~(idx / 3);
  }
  this$static.co[7] = ~~((15 - twst) % 3 << 24) >> 24;
}

function $verify(this$static){
  var c, cornMask, e, edgeMask, i_0, sum;
  sum = 0;
  edgeMask = 0;
  for (e = 0; e < 12; ++e)
    edgeMask |= 1 << this$static.ep[e];
  if (edgeMask != 4095)
    return -2;
  for (i_0 = 0; i_0 < 12; ++i_0)
    sum ^= this$static.eo[i_0];
  if (sum % 2 != 0)
    return -3;
  cornMask = 0;
  for (c = 0; c < 8; ++c)
    cornMask |= 1 << this$static.cp[c];
  if (cornMask != 255)
    return -4;
  sum = 0;
  for (i_0 = 0; i_0 < 8; ++i_0)
    sum += this$static.co[i_0];
  if (sum % 3 != 0)
    return -5;
  if ((getNParity(getNPerm(this$static.ep, 12), 12) ^ getNParity(get8Perm(this$static.cp), 8)) != 0)
    return -6;
  return 0;
}

function CornConjugate(a, idx, b){
  var corn, oriA, oriB, s, sinv;
  sinv = CubeSym[SymInv[idx]];
  s = CubeSym[idx];
  for (corn = 0; corn < 8; ++corn) {
    b.cp[corn] = sinv.cp[a.cp[s.cp[corn]]];
    oriA = sinv.co[a.cp[s.cp[corn]]];
    oriB = a.co[s.cp[corn]];
    b.co[corn] = ~~((oriA < 3?oriB:(3 - oriB) % 3) << 24) >> 24;
  }
}

function CornMult(a, b, prod){
  $clinit_CubieCube();
  var corn, ori, oriA, oriB;
  for (corn = 0; corn < 8; ++corn) {
    prod.cp[corn] = a.cp[b.cp[corn]];
    oriA = a.co[b.cp[corn]];
    oriB = b.co[corn];
    ori = oriA;
    ori = ~~(ori + (oriA < 3?oriB:6 - oriB) << 24) >> 24;
    ori = ~~(ori % 3 << 24) >> 24;
    oriA >= 3 ^ oriB >= 3 && (ori = ~~(ori + 3 << 24) >> 24);
    prod.co[corn] = ori;
  }
}

function CubieCube_0(){
  $clinit_CubieCube();
  $$init(this);
}

function CubieCube_1(cperm, twist, eperm, flip){
  $clinit_CubieCube();
  $$init(this);
  set8Perm(this.cp, cperm);
  $setTwist(this, twist);
  setNPerm(this.ep, eperm, 12);
  $setFlip(this, flip);
}

function CubieCube_2(c){
  $$init(this);
  $copy(this, c);
}

function EdgeConjugate(a, idx, b){
  $clinit_CubieCube();
  var ed, s, sinv;
  sinv = CubeSym[SymInv[idx]];
  s = CubeSym[idx];
  for (ed = 0; ed < 12; ++ed) {
    b.ep[ed] = sinv.ep[a.ep[s.ep[ed]]];
    b.eo[ed] = ~~((s.eo[ed] ^ a.eo[s.ep[ed]] ^ sinv.eo[a.ep[s.ep[ed]]]) << 24) >> 24;
  }
}

function EdgeMult(a, b, prod){
  $clinit_CubieCube();
  var ed;
  for (ed = 0; ed < 12; ++ed) {
    prod.ep[ed] = a.ep[b.ep[ed]];
    prod.eo[ed] = ~~((b.eo[ed] ^ a.eo[b.ep[ed]]) << 24) >> 24;
  }
}

function initFlipSym2Raw(){
  $clinit_CubieCube();
  var c, count, d, i_0, idx, occ, s;
  c = new CubieCube_0;
  d = new CubieCube_0;
  occ = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 64, 1);
  count = 0;
  for (i_0 = 0; i_0 < 64; occ[i_0++] = 0)
  ;
  FlipR2S = initDim(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, 2048, 1);
  for (i_0 = 0; i_0 < 2048; ++i_0) {
    if ((occ[~~i_0 >> 5] & 1 << (i_0 & 31)) == 0) {
      $setFlip(c, i_0);
      for (s = 0; s < 16; s += 2) {
        EdgeConjugate(c, s, d);
        idx = $getFlip(d);
        idx == i_0 && (SymStateFlip[count] = (SymStateFlip[count] | 1 << (~~s >> 1)) & 65535);
        occ[~~idx >> 5] |= 1 << (idx & 31);
        FlipR2S[idx] = (count << 3 | ~~s >> 1) & 65535;
      }
      FlipS2R[count++] = i_0 & 65535;
    }
  }
}

function initMove(){
  $clinit_CubieCube();
  var a, p_0;
  moveCube[0] = new CubieCube_1(15120, 0, 119750400, 0);
  moveCube[3] = new CubieCube_1(21021, 1494, 323403417, 0);
  moveCube[6] = new CubieCube_1(8064, 1236, 29441808, 550);
  moveCube[9] = new CubieCube_1(9, 0, 5880, 0);
  moveCube[12] = new CubieCube_1(1230, 412, 2949660, 0);
  moveCube[15] = new CubieCube_1(224, 137, 328552, 137);
  for (a = 0; a < 18; a += 3) {
    for (p_0 = 0; p_0 < 2; ++p_0) {
      moveCube[a + p_0 + 1] = new CubieCube_0;
      EdgeMult(moveCube[a + p_0], moveCube[a], moveCube[a + p_0 + 1]);
      CornMult(moveCube[a + p_0], moveCube[a], moveCube[a + p_0 + 1]);
    }
  }
}

function initPermSym2Raw(){
  $clinit_CubieCube();
  var a, b, c, count, d, i_0, idx, m_0, occ, s;
  c = new CubieCube_0;
  d = new CubieCube_0;
  occ = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 1260, 1);
  count = 0;
  for (i_0 = 0; i_0 < 1260; occ[i_0++] = 0)
  ;
  EPermR2S = initDim(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, 40320, 1);
  for (i_0 = 0; i_0 < 40320; ++i_0) {
    if ((occ[~~i_0 >> 5] & 1 << (i_0 & 31)) == 0) {
      set8Perm(c.ep, i_0);
      for (s = 0; s < 16; ++s) {
        EdgeConjugate(c, s, d);
        idx = get8Perm(d.ep);
        idx == i_0 && (SymStatePerm[count] = (SymStatePerm[count] | 1 << s) & 65535);
        occ[~~idx >> 5] |= 1 << (idx & 31);
        a = getComb(d.ep, 0);
        b = ~~getComb(d.ep, 4) >> 9;
        m_0 = 494 - (a & 511) + (~~a >> 9) * 70 + b * 1680;
        MtoEPerm[m_0] = EPermR2S[idx] = (count << 4 | s) & 65535;
      }
      EPermS2R[count++] = i_0 & 65535;
    }
  }
}

function initSym(){
  $clinit_CubieCube();
  var c, d, f2, i_0, j, k_0, lr2, m_0, s, t, u4;
  c = new CubieCube_0;
  d = new CubieCube_0;
  f2 = new CubieCube_1(28783, 0, 259268407, 0);
  u4 = new CubieCube_1(15138, 0, 119765538, 7);
  lr2 = new CubieCube_1(5167, 0, 83473207, 0);
  lr2.co = initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [3, 3, 3, 3, 3, 3, 3, 3]);
  for (i_0 = 0; i_0 < 16; ++i_0) {
    CubeSym[i_0] = new CubieCube_2(c);
    CornMult(c, u4, d);
    EdgeMult(c, u4, d);
    t = d;
    d = c;
    c = t;
    if (i_0 % 4 == 3) {
      CornMult(t, lr2, d);
      EdgeMult(t, lr2, d);
      t = d;
      d = c;
      c = t;
    }
    if (i_0 % 8 == 7) {
      CornMult(t, f2, d);
      EdgeMult(t, f2, d);
      t = d;
      d = c;
      c = t;
    }
  }
  for (i_0 = 0; i_0 < 16; ++i_0) {
    for (j = 0; j < 16; ++j) {
      CornMult(CubeSym[i_0], CubeSym[j], c);
      for (k_0 = 0; k_0 < 16; ++k_0) {
        if (CubeSym[k_0].cp[0] == c.cp[0] && CubeSym[k_0].cp[1] == c.cp[1] && CubeSym[k_0].cp[2] == c.cp[2]) {
          SymMult[i_0][j] = k_0;
          k_0 == 0 && (SymInv[i_0] = j);
          break;
        }
      }
    }
  }
  for (j = 0; j < 18; ++j) {
    for (s = 0; s < 16; ++s) {
      CornConjugate(moveCube[j], SymInv[s], c);
      CONTINUE: for (m_0 = 0; m_0 < 18; ++m_0) {
        for (i_0 = 0; i_0 < 8; i_0 += 2) {
          if (c.cp[i_0] != moveCube[m_0].cp[i_0]) {
            continue CONTINUE;
          }
        }
        SymMove_0[s][j] = m_0;
        break;
      }
    }
  }
  for (j = 0; j < 10; ++j) {
    for (s = 0; s < 16; ++s) {
      SymMoveUD[s][j] = ($clinit_Util() , std2ud)[SymMove_0[s][ud2std[j]]];
    }
  }
  for (j = 0; j < 8; ++j) {
    for (s = 0; s < 8; ++s) {
      Sym8Mult[j][s] = ~~SymMult[j << 1][s << 1] >> 1;
      Sym8MultInv[j][s] = ~~SymMult[j << 1][SymInv[s << 1]] >> 1;
    }
  }
  for (j = 0; j < 18; ++j) {
    for (s = 0; s < 8; ++s) {
      Sym8Move[s][j] = SymMove_0[s << 1][j];
    }
  }
}

function initTwistSym2Raw(){
  $clinit_CubieCube();
  var c, count, d, i_0, idx, occ, s;
  c = new CubieCube_0;
  d = new CubieCube_0;
  occ = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 69, 1);
  count = 0;
  for (i_0 = 0; i_0 < 69; occ[i_0++] = 0)
  ;
  TwistR2S = initDim(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, 2187, 1);
  for (i_0 = 0; i_0 < 2187; ++i_0) {
    if ((occ[~~i_0 >> 5] & 1 << (i_0 & 31)) == 0) {
      $setTwist(c, i_0);
      for (s = 0; s < 16; s += 2) {
        CornConjugate(c, s, d);
        idx = $getTwist(d);
        idx == i_0 && (SymStateTwist[count] = (SymStateTwist[count] | 1 << (~~s >> 1)) & 65535);
        occ[~~idx >> 5] |= 1 << (idx & 31);
        TwistR2S[idx] = (count << 3 | ~~s >> 1) & 65535;
      }
      TwistS2R[count++] = i_0 & 65535;
    }
  }
}

defineSeed(145, 1, makeCastMap([Q$CubieCube]), CubieCube_0, CubieCube_1, CubieCube_2);
_.temps = null;
var CubeSym, EPermR2S = null, EPermS2R, FlipR2S = null, FlipS2R, MtoEPerm, Sym8Move, Sym8Mult, Sym8MultInv, SymInv, SymMove_0, SymMoveUD, SymMult, SymStateFlip, SymStatePerm, SymStateTwist, TwistR2S = null, TwistS2R, e2c, moveCube, urf1, urf2, urfMove, urfMoveInv;
function $initPhase2(this$static){
  var cidx, csym, cx, d4e, depth2, edge, esym, firstAxisRestrictionUd, i_0, lm, m_0, mid, prun, u4e;
  if (gte_0(($clinit_System() , fromDouble(currentTimeMillis0())), this$static.solution == null?this$static.timeOut:this$static.timeMin)) {
    return 0;
  }
  this$static.valid2 = min(this$static.valid2, this$static.valid1);
  cidx = ~~this$static.corn[this$static.valid1] >>> 4;
  csym = this$static.corn[this$static.valid1] & 15;
  for (i_0 = this$static.valid1; i_0 < this$static.depth1; ++i_0) {
    m_0 = this$static.move[i_0];
    cidx = ($clinit_CoordCube() , CPermMove)[cidx][($clinit_CubieCube() , SymMove_0)[csym][m_0]];
    csym = SymMult[cidx & 15][csym];
    cidx >>>= 4;
    this$static.corn[i_0 + 1] = cidx << 4 | csym;
    cx = UDSliceMove[this$static.mid4[i_0] & 511][m_0];
    this$static.mid4[i_0 + 1] = ($clinit_Util() , permMult)[~~this$static.mid4[i_0] >>> 9][~~cx >>> 9] << 9 | cx & 511;
  }
  this$static.valid1 = this$static.depth1;
  mid = ~~this$static.mid4[this$static.depth1] >>> 9;
  prun = getPruning(($clinit_CoordCube() , MCPermPrun), cidx * 24 + MPermConj[mid][csym]);
  if (prun >= this$static.maxDep2) {
    return prun > this$static.maxDep2?2:1;
  }
  u4e = ~~this$static.ud8e[this$static.valid2] >>> 16;
  d4e = this$static.ud8e[this$static.valid2] & 65535;
  for (i_0 = this$static.valid2; i_0 < this$static.depth1; ++i_0) {
    m_0 = this$static.move[i_0];
    cx = UDSliceMove[u4e & 511][m_0];
    u4e = ($clinit_Util() , permMult)[~~u4e >>> 9][~~cx >>> 9] << 9 | cx & 511;
    cx = UDSliceMove[d4e & 511][m_0];
    d4e = permMult[~~d4e >>> 9][~~cx >>> 9] << 9 | cx & 511;
    this$static.ud8e[i_0 + 1] = u4e << 16 | d4e;
  }
  this$static.valid2 = this$static.depth1;
  edge = ($clinit_CubieCube() , MtoEPerm)[494 - (u4e & 511) + (~~u4e >>> 9) * 70 + (~~d4e >>> 9) * 1680];
  esym = edge & 15;
  edge >>>= 4;
  prun = max(getPruning(MEPermPrun, edge * 24 + MPermConj[mid][esym]), prun);
  if (prun >= this$static.maxDep2) {
    return prun > this$static.maxDep2?2:1;
  }
  firstAxisRestrictionUd = this$static.firstAxisRestriction == -1?10:($clinit_Util() , std2ud)[~~(urfMoveInv[this$static.urfIdx][this$static.firstAxisRestriction] / 3) * 3 + 1];
  lm = this$static.depth1 == 0?firstAxisRestrictionUd:($clinit_Util() , std2ud)[~~(this$static.move[this$static.depth1 - 1] / 3) * 3 + 1];
  for (depth2 = prun; depth2 < this$static.maxDep2; ++depth2) {
    if ($phase2(this$static, edge, esym, cidx, csym, mid, depth2, this$static.depth1, lm)) {
      this$static.sol = this$static.depth1 + depth2;
      this$static.maxDep2 = min(12, this$static.sol - this$static.depth1);
      this$static.solution = $solutionToString(this$static);
      return gte_0(fromDouble(currentTimeMillis0()), this$static.timeMin)?0:1;
    }
  }
  return 1;
}

function $phase1(this$static, twist, tsym, flip, fsym, slice, maxl, lastAxis){
  var axis, flipx, fsymx, m_0, power, prun, ret, slicex, tsymx, twistx;
  if (twist == 0 && flip == 0 && slice == 0 && maxl < 5) {
    return maxl == 0?$initPhase2(this$static):1;
  }
  for (axis = 0; axis < 18; axis += 3) {
    if (axis == lastAxis || axis == lastAxis - 9) {
      continue;
    }
    for (power = 0; power < 3; ++power) {
      m_0 = axis + power;
      slicex = ($clinit_CoordCube() , UDSliceMove)[slice][m_0] & 511;
      twistx = TwistMove[twist][($clinit_CubieCube() , Sym8Move)[tsym][m_0]];
      tsymx = Sym8Mult[twistx & 7][tsym];
      twistx >>>= 3;
      prun = getPruning(UDSliceTwistPrun, twistx * 495 + UDSliceConj[slicex][tsymx]);
      if (prun > maxl) {
        break;
      }
       else if (prun == maxl) {
        continue;
      }
      flipx = FlipMove[flip][Sym8Move[fsym][m_0]];
      fsymx = Sym8Mult[flipx & 7][fsym];
      flipx >>>= 3;
      prun = getPruning(TwistFlipPrun, twistx * 336 + flipx << 3 | Sym8MultInv[fsymx][tsymx]);
      if (prun > maxl) {
        break;
      }
       else if (prun == maxl) {
        continue;
      }
      prun = getPruning(UDSliceFlipPrun, flipx * 495 + UDSliceConj[slicex][fsymx]);
      if (prun > maxl) {
        break;
      }
       else if (prun == maxl) {
        continue;
      }
      this$static.move[this$static.depth1 - maxl] = m_0;
      this$static.valid1 = min(this$static.valid1, this$static.depth1 - maxl);
      ret = $phase1(this$static, twistx, tsymx, flipx, fsymx, slicex, maxl - 1, axis);
      if (ret != 1) {
        return ~~ret >> 1;
      }
    }
  }
  return 1;
}

function $phase2(this$static, eidx, esym, cidx, csym, mid, maxl, depth, lm){
  var cidxx, csymx, eidxx, esymx, lastAxis, m_0, midx, stdLm;
  if (maxl == 0) {
    if (this$static.lastAxisRestriction != -1) {
      stdLm = ($clinit_CubieCube() , urfMove)[this$static.urfIdx][($clinit_Util() , ud2std)[lm]];
      lastAxis = ~~(stdLm / 3) * 3;
      if (this$static.lastAxisRestriction == lastAxis || this$static.lastAxisRestriction == lastAxis + 9) {
        return false;
      }
    }
    return eidx == 0 && cidx == 0 && mid == 0;
  }
  for (m_0 = 0; m_0 < 10; ++m_0) {
    if (($clinit_Util() , ckmv2)[lm][m_0]) {
      continue;
    }
    midx = ($clinit_CoordCube() , MPermMove)[mid][m_0];
    cidxx = CPermMove[cidx][($clinit_CubieCube() , SymMove_0)[csym][ud2std[m_0]]];
    csymx = SymMult[cidxx & 15][csym];
    cidxx >>>= 4;
    if (getPruning(MCPermPrun, cidxx * 24 + MPermConj[midx][csymx]) >= maxl) {
      continue;
    }
    eidxx = EPermMove[eidx][SymMoveUD[esym][m_0]];
    esymx = SymMult[eidxx & 15][esym];
    eidxx >>>= 4;
    if (getPruning(MEPermPrun, eidxx * 24 + MPermConj[midx][esymx]) >= maxl) {
      continue;
    }
    if ($phase2(this$static, eidxx, esymx, cidxx, csymx, midx, maxl - 1, depth + 1, m_0)) {
      this$static.move[depth] = ud2std[m_0];
      return true;
    }
  }
  return false;
}

function $solution(this$static, facelets, maxDepth, timeOut, timeMin, verbose, firstAxisRestrictionStr, lastAxisRestrictionStr){
  var check;
  check = $verify_0(this$static, facelets);
  if (check != 0) {
    return 'Error ' + (check < 0?-check:check);
  }
  this$static.sol = maxDepth + 1;
  this$static.timeOut = add(($clinit_System() , fromDouble(currentTimeMillis0())), timeOut);
  this$static.timeMin = add(this$static.timeOut, lt(sub(timeMin, timeOut), P0_longLit)?sub(timeMin, timeOut):P0_longLit);
  this$static.verbose = verbose;
  this$static.solution = null;
  this$static.firstAxisRestriction = -1;
  this$static.lastAxisRestriction = -1;
  if (firstAxisRestrictionStr != null) {
    if (!($clinit_Util() , str2move).containsKey(firstAxisRestrictionStr)) {
      return 'Error 9';
    }
    this$static.firstAxisRestriction = dynamicCast(str2move.get(firstAxisRestrictionStr), Q$Integer).value;
    if (this$static.firstAxisRestriction % 3 != 0) {
      return 'Error 9';
    }
    this$static.firstAxisRestriction - 9 < 0 && (this$static.firstAxisRestriction += 9);
  }
  if (lastAxisRestrictionStr != null) {
    if (!($clinit_Util() , str2move).containsKey(lastAxisRestrictionStr)) {
      return 'Error 9';
    }
    this$static.lastAxisRestriction = dynamicCast(str2move.get(lastAxisRestrictionStr), Q$Integer).value;
    if (this$static.lastAxisRestriction % 3 != 0) {
      return 'Error 9';
    }
    this$static.lastAxisRestriction - 9 < 0 && (this$static.lastAxisRestriction += 9);
  }
  return $solve(this$static, this$static.cc);
}

function $solutionToString(this$static){
  var s, sb, urf;
  sb = new StringBuffer_0;
  urf = (this$static.verbose & 2) != 0?(this$static.urfIdx + 3) % 6:this$static.urfIdx;
  if (urf < 3) {
    for (s = 0; s < this$static.depth1; ++s) {
      $append($append_2(sb, ($clinit_Util() , move2str_0)[($clinit_CubieCube() , urfMove)[urf][this$static.move[s]]]));
    }
    (this$static.verbose & 1) != 0 && (sb.impl.append_2(sb.data, '.  ') , sb);
    for (s = this$static.depth1; s < this$static.sol; ++s) {
      $append($append_2(sb, ($clinit_Util() , move2str_0)[($clinit_CubieCube() , urfMove)[urf][this$static.move[s]]]));
    }
  }
   else {
    for (s = this$static.sol - 1; s >= this$static.depth1; --s) {
      $append($append_2(sb, ($clinit_Util() , move2str_0)[($clinit_CubieCube() , urfMove)[urf][this$static.move[s]]]));
    }
    (this$static.verbose & 1) != 0 && (sb.impl.append_2(sb.data, '.  ') , sb);
    for (s = this$static.depth1 - 1; s >= 0; --s) {
      $append($append_2(sb, ($clinit_Util() , move2str_0)[($clinit_CubieCube() , urfMove)[urf][this$static.move[s]]]));
    }
  }
  (this$static.verbose & 4) != 0 && $append_2($append_0((sb.impl.append_2(sb.data, '(') , sb), this$static.sol), 'f)');
  return sb.impl.toString_0(sb.data);
}

function $solve(this$static, c){
  var conjMask, i_0, j, lm;
  init_0();
  conjMask = 0;
  for (i_0 = 0; i_0 < 6; ++i_0) {
    this$static.twist[i_0] = $getTwistSym(c);
    this$static.flip[i_0] = $getFlipSym(c);
    this$static.slice_0[i_0] = getComb(c.ep, 8);
    this$static.corn0[i_0] = $getCPermSym(c);
    this$static.ud8e0[i_0] = getComb(c.ep, 0) << 16 | getComb(c.ep, 4);
    for (j = 0; j < i_0; ++j) {
      if (this$static.twist[i_0] == this$static.twist[j] && this$static.flip[i_0] == this$static.flip[j] && this$static.slice_0[i_0] == this$static.slice_0[j] && this$static.corn0[i_0] == this$static.corn0[j] && this$static.ud8e0[i_0] == this$static.ud8e0[j]) {
        conjMask |= 1 << i_0;
        break;
      }
    }
    (conjMask & 1 << i_0) == 0 && (this$static.prun[i_0] = max(max(getPruning(($clinit_CoordCube() , UDSliceTwistPrun), (~~this$static.twist[i_0] >>> 3) * 495 + UDSliceConj[this$static.slice_0[i_0] & 511][this$static.twist[i_0] & 7]), getPruning(UDSliceFlipPrun, (~~this$static.flip[i_0] >>> 3) * 495 + UDSliceConj[this$static.slice_0[i_0] & 511][this$static.flip[i_0] & 7])), getPruning(TwistFlipPrun, (~~this$static.twist[i_0] >>> 3) * 2688 + (this$static.flip[i_0] & 65528 | ($clinit_CubieCube() , Sym8MultInv)[this$static.flip[i_0] & 7][this$static.twist[i_0] & 7]))));
    !c.temps && (c.temps = new CubieCube_0);
    CornMult(urf2, c, c.temps);
    CornMult(c.temps, urf1, c);
    EdgeMult(urf2, c, c.temps);
    EdgeMult(c.temps, urf1, c);
    i_0 == 2 && $invCubieCube(c);
  }
  for (this$static.depth1 = 0; this$static.depth1 < this$static.sol; ++this$static.depth1) {
    this$static.maxDep2 = min(12, this$static.sol - this$static.depth1);
    for (this$static.urfIdx = 0; this$static.urfIdx < 6; ++this$static.urfIdx) {
      if ((this$static.firstAxisRestriction != -1 || this$static.lastAxisRestriction != -1) && this$static.urfIdx >= 3) {
        continue;
      }
      if ((conjMask & 1 << this$static.urfIdx) != 0) {
        continue;
      }
      this$static.corn[0] = this$static.corn0[this$static.urfIdx];
      this$static.mid4[0] = this$static.slice_0[this$static.urfIdx];
      this$static.ud8e[0] = this$static.ud8e0[this$static.urfIdx];
      this$static.valid1 = 0;
      lm = this$static.firstAxisRestriction == -1?-1:~~(($clinit_CubieCube() , urfMoveInv)[this$static.urfIdx][this$static.firstAxisRestriction] / 3) * 3;
      if (this$static.prun[this$static.urfIdx] <= this$static.depth1 && $phase1(this$static, ~~this$static.twist[this$static.urfIdx] >>> 3, this$static.twist[this$static.urfIdx] & 7, ~~this$static.flip[this$static.urfIdx] >>> 3, this$static.flip[this$static.urfIdx] & 7, this$static.slice_0[this$static.urfIdx] & 511, this$static.depth1, lm) == 0) {
        return this$static.solution == null?'Error 8':this$static.solution;
      }
    }
  }
  return this$static.solution == null?'Error 7':this$static.solution;
}

function $verify_0(this$static, facelets){
  var center, count, i_0;
  count = 0;
  try {
    center = valueOf_1(initValues(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, [facelets.charCodeAt(4), facelets.charCodeAt(13), facelets.charCodeAt(22), facelets.charCodeAt(31), facelets.charCodeAt(40), facelets.charCodeAt(49)]));
    for (i_0 = 0; i_0 < 54; ++i_0) {
      this$static.f[i_0] = ~~($indexOf(center, fromCodePoint(facelets.charCodeAt(i_0))) << 24) >> 24;
      if (this$static.f[i_0] == -1) {
        return -1;
      }
      count += 1 << (this$static.f[i_0] << 2);
    }
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, Q$Exception)) {
      return -1;
    }
     else 
      throw $e0;
  }
  if (count != 10066329) {
    return -1;
  }
  toCubieCube(this$static.f, this$static.cc);
  return $verify(this$static.cc);
}

function Search_0(){
  this.move = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 31, 1);
  this.corn = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 20, 1);
  this.mid4 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 20, 1);
  this.ud8e = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 20, 1);
  this.twist = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 6, 1);
  this.flip = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 6, 1);
  this.slice_0 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 6, 1);
  this.corn0 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 6, 1);
  this.ud8e0 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 6, 1);
  this.prun = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 6, 1);
  this.f = initDim(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, 54, 1);
  this.cc = new CubieCube_0;
}

defineSeed(146, 1, makeCastMap([Q$Search]), Search_0);
_.depth1 = 0;
_.firstAxisRestriction = 0;
_.lastAxisRestriction = 0;
_.maxDep2 = 0;
_.sol = 0;
_.solution = null;
_.timeMin = P0_longLit;
_.timeOut = P0_longLit;
_.urfIdx = 0;
_.valid1 = 0;
_.valid2 = 0;
_.verbose = 0;
function $clinit_Tools(){
  $clinit_Tools = nullMethod;
  new Random_0;
  STATE_SOLVED = initDim(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, 0, 1);
}

function init_0(){
  $clinit_Tools();
  var i_0;
  if (inited) {
    return;
  }
  for (i_0 = 0; i_0 <= 15; ++i_0) {
    initIdx(i_0);
  }
  inited = true;
}

function initIdx(idx){
  switch (idx) {
    case 0:
      initMove();
      break;
    case 1:
      initSym();
      break;
    case 2:
      initFlipSym2Raw();
      break;
    case 3:
      initTwistSym2Raw();
      break;
    case 4:
      initPermSym2Raw();
      break;
    case 5:
      initFlipMove();
      break;
    case 6:
      initTwistMove();
      break;
    case 7:
      initUDSliceMoveConj();
      break;
    case 8:
      initCPermMove();
      break;
    case 9:
      initEPermMove();
      break;
    case 10:
      initMPermMoveConj();
      break;
    case 11:
      {
        initTwistFlipPrun();
      }

      break;
    case 12:
      $clinit_CoordCube();
      initRawSymPrun(UDSliceTwistPrun, 6, UDSliceMove, UDSliceConj, TwistMove, ($clinit_CubieCube() , SymStateTwist), null, null, 3);
      break;
    case 13:
      $clinit_CoordCube();
      initRawSymPrun(UDSliceFlipPrun, 6, UDSliceMove, UDSliceConj, FlipMove, ($clinit_CubieCube() , SymStateFlip), null, null, 3);
      break;
    case 14:
      $clinit_CoordCube();
      initRawSymPrun(MEPermPrun, 7, MPermMove, MPermConj, EPermMove, ($clinit_CubieCube() , SymStatePerm), null, null, 4);
      break;
    case 15:
      $clinit_CoordCube();
      initRawSymPrun(MCPermPrun, 10, MPermMove, MPermConj, CPermMove, ($clinit_CubieCube() , SymStatePerm), e2c, ($clinit_Util() , ud2std), 4);
  }
}

function randomState_0(gen){
  $clinit_Tools();
  var cpVal, epVal, parity;
  if (null == STATE_SOLVED) {
    cpVal = parity = 0;
  }
   else {
    cpVal = $nextInt(gen, 40320);
    parity = getNParity(cpVal, 8);
  }
  do {
    epVal = $nextInt(gen, 479001600);
  }
   while (getNParity(epVal, 12) != parity);
  return toFaceCube(new CubieCube_1(cpVal, $nextInt(gen, 2187), epVal, $nextInt(gen, 2048)));
}

var STATE_SOLVED, inited = false;
function $clinit_Util(){
  $clinit_Util = nullMethod;
  var arr1, arr2, arr3, i_0, ix, j, jx, k_0;
  cornerFacelet = initValues(_3_3B_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$byte_$1, [initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [8, 9, 20]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [6, 18, 38]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [0, 36, 47]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [2, 45, 11]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [29, 26, 15]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [27, 44, 24]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [33, 53, 42]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [35, 17, 51])]);
  edgeFacelet = initValues(_3_3B_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$byte_$1, [initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [5, 10]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [7, 19]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [3, 37]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [1, 46]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [32, 16]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [28, 25]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [30, 43]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [34, 52]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [23, 12]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [21, 41]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [50, 39]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [48, 14])]);
  Cnk = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [12, 12], 2, 1);
  fact = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 13, 1);
  permMult = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [24, 24], 2, 1);
  move2str_0 = initValues(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, ['U', 'U2', "U'", 'R', 'R2', "R'", 'F', 'F2', "F'", 'D', 'D2', "D'", 'L', 'L2', "L'", 'B', 'B2', "B'"]);
  str2move = new HashMap_0;
  for (i_0 = 0; i_0 < move2str_0.length; ++i_0) {
    str2move.put(move2str_0[i_0], valueOf_0(i_0));
  }
  ud2std = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [0, 1, 2, 4, 7, 9, 10, 11, 13, 16]);
  std2ud = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 18, 1);
  ckmv2 = initDims([_3_3Z_classLit, _3Z_classLit], [makeCastMap([Q$Serializable, Q$Object_$1]), makeCastMap([Q$boolean_$1, Q$Serializable])], [Q$boolean_$1, -1], [11, 10], 2, 2);
  for (i_0 = 0; i_0 < 10; ++i_0) {
    std2ud[ud2std[i_0]] = i_0;
  }
  for (i_0 = 0; i_0 < 10; ++i_0) {
    for (j = 0; j < 10; ++j) {
      ix = ud2std[i_0];
      jx = ud2std[j];
      ckmv2[i_0][j] = ~~(ix / 3) == ~~(jx / 3) || ~~(ix / 3) % 3 == ~~(jx / 3) % 3 && ix >= jx;
    }
    ckmv2[10][i_0] = false;
  }
  fact[0] = 1;
  for (i_0 = 0; i_0 < 12; ++i_0) {
    Cnk[i_0][0] = Cnk[i_0][i_0] = 1;
    fact[i_0 + 1] = fact[i_0] * (i_0 + 1);
    for (j = 1; j < i_0; ++j) {
      Cnk[i_0][j] = Cnk[i_0 - 1][j - 1] + Cnk[i_0 - 1][j];
    }
  }
  arr1 = initDim(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, 4, 1);
  arr2 = initDim(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, 4, 1);
  arr3 = initDim(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, 4, 1);
  for (i_0 = 0; i_0 < 24; ++i_0) {
    for (j = 0; j < 24; ++j) {
      setNPerm(arr1, i_0, 4);
      setNPerm(arr2, j, 4);
      for (k_0 = 0; k_0 < 4; ++k_0) {
        arr3[k_0] = arr1[arr2[k_0]];
      }
      permMult[i_0][j] = getNPerm(arr3, 4);
    }
  }
}

function binarySearch(arr, key){
  $clinit_Util();
  var l_0, length_0, mid, r, val;
  length_0 = arr.length;
  if (key <= arr[length_0 - 1]) {
    l_0 = 0;
    r = length_0 - 1;
    while (l_0 <= r) {
      mid = ~~(l_0 + r) >>> 1;
      val = arr[mid];
      if (key > val) {
        l_0 = mid + 1;
      }
       else if (key < val) {
        r = mid - 1;
      }
       else {
        return mid;
      }
    }
  }
  return 65535;
}

function get8Perm(arr){
  $clinit_Util();
  var i_0, idx, v, val;
  idx = 0;
  val = 1985229328;
  for (i_0 = 0; i_0 < 7; ++i_0) {
    v = arr[i_0] << 2;
    idx = (8 - i_0) * idx + (~~val >> v & 7);
    val -= 286331152 << v;
  }
  return idx;
}

function getComb(arr, mask){
  $clinit_Util();
  var i_0, idxC, idxP, r, v, val;
  idxC = 0;
  idxP = 0;
  r = 4;
  val = 291;
  for (i_0 = 11; i_0 >= 0; --i_0) {
    if ((arr[i_0] & 12) == mask) {
      v = (arr[i_0] & 3) << 2;
      idxP = r * idxP + (~~val >> v & 15);
      val -= ~~273 >> 12 - v;
      idxC += Cnk[i_0][r--];
    }
  }
  return idxP << 9 | 494 - idxC;
}

function getNParity(idx, n){
  $clinit_Util();
  var i_0, p_0;
  p_0 = 0;
  for (i_0 = n - 2; i_0 >= 0; --i_0) {
    p_0 ^= idx % (n - i_0);
    idx = ~~(idx / (n - i_0));
  }
  return p_0 & 1;
}

function getNPerm(arr, n){
  $clinit_Util();
  var i_0, idx, j;
  idx = 0;
  for (i_0 = 0; i_0 < n; ++i_0) {
    idx *= n - i_0;
    for (j = i_0 + 1; j < n; ++j) {
      arr[j] < arr[i_0] && ++idx;
    }
  }
  return idx;
}

function set8Perm(arr, idx){
  $clinit_Util();
  var i_0, m_0, p_0, v, val;
  val = 1985229328;
  for (i_0 = 0; i_0 < 7; ++i_0) {
    p_0 = fact[7 - i_0];
    v = ~~(idx / p_0);
    idx -= v * p_0;
    v <<= 2;
    arr[i_0] = ~~((~~val >> v & 7) << 24) >> 24;
    m_0 = (1 << v) - 1;
    val = (val & m_0) + (~~val >> 4 & ~m_0);
  }
  arr[7] = ~~(val << 24) >> 24;
}

function setComb(arr, idx){
  $clinit_Util();
  var fill, i_0, idxC, idxP, m_0, p_0, r, v, val;
  r = 4;
  fill = 11;
  val = 291;
  idxC = 494 - (idx & 511);
  idxP = ~~idx >>> 9;
  for (i_0 = 11; i_0 >= 0; --i_0) {
    if (idxC >= Cnk[i_0][r]) {
      idxC -= Cnk[i_0][r--];
      p_0 = fact[r & 3];
      v = ~~(idxP / p_0) << 2;
      idxP %= p_0;
      arr[i_0] = ~~((~~val >> v & 3 | 8) << 24) >> 24;
      m_0 = (1 << v) - 1;
      val = (val & m_0) + (~~val >> 4 & ~m_0);
    }
     else {
      (fill & 12) == 8 && (fill -= 4);
      arr[i_0] = ~~(fill-- << 24) >> 24;
    }
  }
}

function setNPerm(arr, idx, n){
  $clinit_Util();
  var i_0, j;
  arr[n - 1] = 0;
  for (i_0 = n - 2; i_0 >= 0; --i_0) {
    arr[i_0] = ~~(idx % (n - i_0) << 24) >> 24;
    idx = ~~(idx / (n - i_0));
    for (j = i_0 + 1; j < n; ++j) {
      arr[j] >= arr[i_0] && ++arr[j];
    }
  }
}

function toCubieCube(f, ccRet){
  $clinit_Util();
  var col1, col2, i_0, j, ori;
  for (i_0 = 0; i_0 < 8; ++i_0)
    ccRet.cp[i_0] = 0;
  for (i_0 = 0; i_0 < 12; ++i_0)
    ccRet.ep[i_0] = 0;
  for (i_0 = 0; i_0 < 8; ++i_0) {
    for (ori = 0; ori < 3; ++ori)
      if (f[cornerFacelet[i_0][ori]] == 0 || f[cornerFacelet[i_0][ori]] == 3)
        break;
    col1 = f[cornerFacelet[i_0][(ori + 1) % 3]];
    col2 = f[cornerFacelet[i_0][(ori + 2) % 3]];
    for (j = 0; j < 8; ++j) {
      if (col1 == ~~(cornerFacelet[j][1] / 9) && col2 == ~~(cornerFacelet[j][2] / 9)) {
        ccRet.cp[i_0] = j;
        ccRet.co[i_0] = ~~(ori % 3 << 24) >> 24;
        break;
      }
    }
  }
  for (i_0 = 0; i_0 < 12; ++i_0) {
    for (j = 0; j < 12; ++j) {
      if (f[edgeFacelet[i_0][0]] == ~~(edgeFacelet[j][0] / 9) && f[edgeFacelet[i_0][1]] == ~~(edgeFacelet[j][1] / 9)) {
        ccRet.ep[i_0] = j;
        ccRet.eo[i_0] = 0;
        break;
      }
      if (f[edgeFacelet[i_0][0]] == ~~(edgeFacelet[j][1] / 9) && f[edgeFacelet[i_0][1]] == ~~(edgeFacelet[j][0] / 9)) {
        ccRet.ep[i_0] = j;
        ccRet.eo[i_0] = 1;
        break;
      }
    }
  }
}

function toFaceCube(cc){
  $clinit_Util();
  var c, e, f, i_0, j, n, ori, ts;
  f = initDim(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, 54, 1);
  ts = initValues(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, [85, 82, 70, 68, 76, 66]);
  for (i_0 = 0; i_0 < 54; ++i_0) {
    f[i_0] = ts[~~(i_0 / 9)];
  }
  for (c = 0; c < 8; ++c) {
    j = cc.cp[c];
    ori = cc.co[c];
    for (n = 0; n < 3; ++n)
      f[cornerFacelet[c][(n + ori) % 3]] = ts[~~(cornerFacelet[j][n] / 9)];
  }
  for (e = 0; e < 12; ++e) {
    j = cc.ep[e];
    ori = cc.eo[e];
    for (n = 0; n < 2; ++n)
      f[edgeFacelet[e][(n + ori) % 2]] = ts[~~(edgeFacelet[j][n] / 9)];
  }
  return valueOf_1(f);
}

var Cnk, ckmv2, cornerFacelet, edgeFacelet, fact, move2str_0, permMult, std2ud, str2move, ud2std;
function $clinit_FullCube(){
  $clinit_FullCube = nullMethod;
  new Random_0;
}

function $$init_0(this$static){
  this$static.arr = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 16, 1);
  this$static.prm = initDim(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, 8, 1);
}

function $compareTo_0(this$static, f){
  if (this$static.ul != f.ul) {
    return this$static.ul - f.ul;
  }
  if (this$static.ur != f.ur) {
    return this$static.ur - f.ur;
  }
  if (this$static.dl != f.dl) {
    return this$static.dl - f.dl;
  }
  if (this$static.dr != f.dr) {
    return this$static.dr - f.dr;
  }
  return this$static.ml - f.ml;
}

function $copy_0(this$static, c){
  this$static.ul = c.ul;
  this$static.ur = c.ur;
  this$static.dl = c.dl;
  this$static.dr = c.dr;
  this$static.ml = c.ml;
}

function $doMove(this$static, move){
  var temp;
  move <<= 2;
  if (move > 24) {
    move = 48 - move;
    temp = this$static.ul;
    this$static.ul = (~~this$static.ul >> move | this$static.ur << 24 - move) & 16777215;
    this$static.ur = (~~this$static.ur >> move | temp << 24 - move) & 16777215;
  }
   else if (move > 0) {
    temp = this$static.ul;
    this$static.ul = (this$static.ul << move | ~~this$static.ur >> 24 - move) & 16777215;
    this$static.ur = (this$static.ur << move | ~~temp >> 24 - move) & 16777215;
  }
   else if (move == 0) {
    temp = this$static.ur;
    this$static.ur = this$static.dl;
    this$static.dl = temp;
    this$static.ml = 1 - this$static.ml;
  }
   else if (move >= -24) {
    move = -move;
    temp = this$static.dl;
    this$static.dl = (this$static.dl << move | ~~this$static.dr >> 24 - move) & 16777215;
    this$static.dr = (this$static.dr << move | ~~temp >> 24 - move) & 16777215;
  }
   else if (move < -24) {
    move = 48 + move;
    temp = this$static.dl;
    this$static.dl = (~~this$static.dl >> move | this$static.dr << 24 - move) & 16777215;
    this$static.dr = (~~this$static.dr >> move | temp << 24 - move) & 16777215;
  }
}

function $getParity(this$static){
  var a, b, cnt, i_0, p_0;
  cnt = 0;
  this$static.arr[0] = $pieceAt(this$static, 0);
  for (i_0 = 1; i_0 < 24; ++i_0) {
    $pieceAt(this$static, i_0) != this$static.arr[cnt] && (this$static.arr[++cnt] = $pieceAt(this$static, i_0));
  }
  p_0 = 0;
  for (a = 0; a < 16; ++a) {
    for (b = a + 1; b < 16; ++b) {
      this$static.arr[a] > this$static.arr[b] && (p_0 ^= 1);
    }
  }
  return p_0;
}

function $getShapeIdx(this$static){
  var dlx, drx, ulx, urx;
  urx = this$static.ur & 1118481;
  urx |= ~~urx >> 3;
  urx |= ~~urx >> 6;
  urx = urx & 15 | ~~urx >> 12 & 48;
  ulx = this$static.ul & 1118481;
  ulx |= ~~ulx >> 3;
  ulx |= ~~ulx >> 6;
  ulx = ulx & 15 | ~~ulx >> 12 & 48;
  drx = this$static.dr & 1118481;
  drx |= ~~drx >> 3;
  drx |= ~~drx >> 6;
  drx = drx & 15 | ~~drx >> 12 & 48;
  dlx = this$static.dl & 1118481;
  dlx |= ~~dlx >> 3;
  dlx |= ~~dlx >> 6;
  dlx = dlx & 15 | ~~dlx >> 12 & 48;
  return getShape2Idx($getParity(this$static) << 24 | ulx << 18 | urx << 12 | dlx << 6 | drx);
}

function $getSquare(this$static, sq){
  var a, b;
  for (a = 0; a < 8; ++a) {
    this$static.prm[a] = ~~(~~$pieceAt(this$static, a * 3 + 1) >> 1 << 24) >> 24;
  }
  sq.cornperm = get8Perm_0(this$static.prm);
  sq.topEdgeFirst = $pieceAt(this$static, 0) == $pieceAt(this$static, 1);
  a = sq.topEdgeFirst?2:0;
  for (b = 0; b < 4; a += 3 , ++b) {
    this$static.prm[b] = ~~(~~$pieceAt(this$static, a) >> 1 << 24) >> 24;
  }
  sq.botEdgeFirst = $pieceAt(this$static, 12) == $pieceAt(this$static, 13);
  a = sq.botEdgeFirst?14:12;
  for (; b < 8; a += 3 , ++b) {
    this$static.prm[b] = ~~(~~$pieceAt(this$static, a) >> 1 << 24) >> 24;
  }
  sq.edgeperm = get8Perm_0(this$static.prm);
  sq.ml = this$static.ml;
}

function $pieceAt(this$static, idx){
  var ret;
  idx < 6?(ret = ~~this$static.ul >> (5 - idx << 2)):idx < 12?(ret = ~~this$static.ur >> (11 - idx << 2)):idx < 18?(ret = ~~this$static.dl >> (17 - idx << 2)):(ret = ~~this$static.dr >> (23 - idx << 2));
  return ~~((ret & 15) << 24) >> 24;
}

function $setPiece(this$static, idx, value){
  if (idx < 6) {
    this$static.ul &= ~(15 << (5 - idx << 2));
    this$static.ul |= value << (5 - idx << 2);
  }
   else if (idx < 12) {
    this$static.ur &= ~(15 << (11 - idx << 2));
    this$static.ur |= value << (11 - idx << 2);
  }
   else if (idx < 18) {
    this$static.dl &= ~(15 << (17 - idx << 2));
    this$static.dl |= value << (17 - idx << 2);
  }
   else if (idx < 24) {
    this$static.dr &= ~(15 << (23 - idx << 2));
    this$static.dr |= value << (23 - idx << 2);
  }
   else {
    this$static.ml = value;
  }
}

function FullCube_0(){
  $clinit_FullCube();
  $$init_0(this);
}

function FullCube_1(){
  $clinit_FullCube();
  $$init_0(this);
}

function randomCube(r){
  $clinit_FullCube();
  var corner, edge, f, i_0, m_0, n_corner, n_edge, rnd, shape;
  shape = ($clinit_Shape() , ShapeIdx)[$nextInt(r, 3678)];
  f = new FullCube_0;
  corner = 324508639;
  edge = 38177486;
  n_corner = 8;
  n_edge = 8;
  for (i_0 = 0; i_0 < 24; ++i_0) {
    if ((~~shape >> i_0 & 1) == 0) {
      rnd = $nextInt(r, n_edge) << 2;
      $setPiece(f, 23 - i_0, ~~edge >> rnd & 15);
      m_0 = (1 << rnd) - 1;
      edge = (edge & m_0) + (~~edge >> 4 & ~m_0);
      --n_edge;
    }
     else {
      rnd = $nextInt(r, n_corner) << 2;
      $setPiece(f, 23 - i_0, ~~corner >> rnd & 15);
      $setPiece(f, 22 - i_0, ~~corner >> rnd & 15);
      m_0 = (1 << rnd) - 1;
      corner = (corner & m_0) + (~~corner >> 4 & ~m_0);
      --n_corner;
      ++i_0;
    }
  }
  f.ml = $nextInt(r, 2);
  return f;
}

defineSeed(149, 1, makeCastMap([Q$FullCube, Q$Comparable]), FullCube_0, FullCube_1);
_.compareTo$ = function compareTo_0(f){
  return $compareTo_0(this, dynamicCast(f, Q$FullCube));
}
;
_.dl = 10062778;
_.dr = 14536702;
_.ml = 0;
_.ul = 70195;
_.ur = 4544119;
function $clinit_Search(){
  $clinit_Search = nullMethod;
  init_1();
  init_2();
}

function $init2(this$static){
  var corner, edge, i_0, ml, prun;
  $copy_0(this$static.d, this$static.c);
  for (i_0 = 0; i_0 < this$static.length1; ++i_0) {
    $doMove(this$static.d, this$static.move[i_0]);
  }
  $getSquare(this$static.d, this$static.sq);
  edge = this$static.sq.edgeperm;
  corner = this$static.sq.cornperm;
  ml = this$static.sq.ml;
  prun = max(($clinit_Square() , SquarePrun)[this$static.sq.edgeperm << 1 | ml], SquarePrun[this$static.sq.cornperm << 1 | ml]);
  for (i_0 = prun; i_0 < this$static.maxlen2; ++i_0) {
    if ($phase2_0(this$static, edge, corner, this$static.sq.topEdgeFirst, this$static.sq.botEdgeFirst, ml, i_0, this$static.length1, 0)) {
      this$static.sol_string = $move2string(this$static, i_0 + this$static.length1);
      return true;
    }
  }
  return false;
}

function $move2string(this$static, len){
  var bottom, i_0, s, top_0, val;
  s = new StringBuffer_0;
  top_0 = 0;
  bottom = 0;
  for (i_0 = len - 1; i_0 >= 0; --i_0) {
    val = this$static.move[i_0];
    if (val > 0) {
      val = 12 - val;
      top_0 = val > 6?val - 12:val;
    }
     else if (val < 0) {
      val = 12 + val;
      bottom = val > 6?val - 12:val;
    }
     else {
      top_0 == 0 && bottom == 0?(s.impl.append_2(s.data, ' / ') , s):$append_2($append_0($append_2($append_0((s.impl.appendNonNull(s.data, '(') , s), top_0), ','), bottom), ') / ');
      top_0 = 0;
      bottom = 0;
    }
  }
  if (top_0 == 0 && bottom == 0)
  ;
  else {
    $append_2($append_0($append_2($append_0((s.impl.appendNonNull(s.data, '(') , s), top_0), ','), bottom), ')');
  }
  return s.impl.toString_0(s.data);
}

function $phase1_0(this$static, shape, prunvalue, maxl, depth, lm){
  var m_0, prunx, shapex;
  if (prunvalue == 0 && maxl < 4) {
    return maxl == 0 && $init2(this$static);
  }
  if (lm != 0) {
    shapex = ($clinit_Shape() , TwistMove_0)[shape];
    prunx = ShapePrun[shapex];
    if (prunx < maxl) {
      this$static.move[depth] = 0;
      if ($phase1_0(this$static, shapex, prunx, maxl - 1, depth + 1, 0)) {
        return true;
      }
    }
  }
  shapex = shape;
  if (lm <= 0) {
    m_0 = 0;
    while (true) {
      m_0 += ($clinit_Shape() , TopMove)[shapex];
      shapex = ~~m_0 >> 4;
      m_0 &= 15;
      if (m_0 >= 12) {
        break;
      }
      prunx = ShapePrun[shapex];
      if (prunx > maxl) {
        break;
      }
       else if (prunx < maxl) {
        this$static.move[depth] = m_0;
        if ($phase1_0(this$static, shapex, prunx, maxl - 1, depth + 1, 1)) {
          return true;
        }
      }
    }
  }
  shapex = shape;
  if (lm <= 1) {
    m_0 = 0;
    while (true) {
      m_0 += ($clinit_Shape() , BottomMove)[shapex];
      shapex = ~~m_0 >> 4;
      m_0 &= 15;
      if (m_0 >= 6) {
        break;
      }
      prunx = ShapePrun[shapex];
      if (prunx > maxl) {
        break;
      }
       else if (prunx < maxl) {
        this$static.move[depth] = -m_0;
        if ($phase1_0(this$static, shapex, prunx, maxl - 1, depth + 1, 2)) {
          return true;
        }
      }
    }
  }
  return false;
}

function $phase2_0(this$static, edge, corner, topEdgeFirst, botEdgeFirst, ml, maxl, depth, lm){
  var botEdgeFirstx, cornerx, edgex, m_0, prun1, prun2, topEdgeFirstx;
  if (maxl == 0 && !topEdgeFirst && botEdgeFirst) {
    return true;
  }
  if (lm != 0 && topEdgeFirst == botEdgeFirst) {
    edgex = ($clinit_Square() , TwistMove_1)[edge];
    cornerx = TwistMove_1[corner];
    if (SquarePrun[edgex << 1 | 1 - ml] < maxl && SquarePrun[cornerx << 1 | 1 - ml] < maxl) {
      this$static.move[depth] = 0;
      if ($phase2_0(this$static, edgex, cornerx, topEdgeFirst, botEdgeFirst, 1 - ml, maxl - 1, depth + 1, 0)) {
        return true;
      }
    }
  }
  if (lm <= 0) {
    topEdgeFirstx = !topEdgeFirst;
    edgex = topEdgeFirstx?($clinit_Square() , TopMove_0)[edge]:edge;
    cornerx = topEdgeFirstx?corner:($clinit_Square() , TopMove_0)[corner];
    m_0 = topEdgeFirstx?1:2;
    prun1 = ($clinit_Square() , SquarePrun)[edgex << 1 | ml];
    prun2 = SquarePrun[cornerx << 1 | ml];
    while (m_0 < 12 && prun1 <= maxl && prun1 <= maxl) {
      if (prun1 < maxl && prun2 < maxl) {
        this$static.move[depth] = m_0;
        if ($phase2_0(this$static, edgex, cornerx, topEdgeFirstx, botEdgeFirst, ml, maxl - 1, depth + 1, 1)) {
          return true;
        }
      }
      topEdgeFirstx = !topEdgeFirstx;
      if (topEdgeFirstx) {
        edgex = TopMove_0[edgex];
        prun1 = SquarePrun[edgex << 1 | ml];
        m_0 += 1;
      }
       else {
        cornerx = TopMove_0[cornerx];
        prun2 = SquarePrun[cornerx << 1 | ml];
        m_0 += 2;
      }
    }
  }
  if (lm <= 1) {
    botEdgeFirstx = !botEdgeFirst;
    edgex = botEdgeFirstx?($clinit_Square() , BottomMove_0)[edge]:edge;
    cornerx = botEdgeFirstx?corner:($clinit_Square() , BottomMove_0)[corner];
    m_0 = botEdgeFirstx?1:2;
    prun1 = ($clinit_Square() , SquarePrun)[edgex << 1 | ml];
    prun2 = SquarePrun[cornerx << 1 | ml];
    while (m_0 < (maxl > 6?6:12) && prun1 <= maxl && prun1 <= maxl) {
      if (prun1 < maxl && prun2 < maxl) {
        this$static.move[depth] = -m_0;
        if ($phase2_0(this$static, edgex, cornerx, topEdgeFirst, botEdgeFirstx, ml, maxl - 1, depth + 1, 2)) {
          return true;
        }
      }
      botEdgeFirstx = !botEdgeFirstx;
      if (botEdgeFirstx) {
        edgex = BottomMove_0[edgex];
        prun1 = SquarePrun[edgex << 1 | ml];
        m_0 += 1;
      }
       else {
        cornerx = BottomMove_0[cornerx];
        prun2 = SquarePrun[cornerx << 1 | ml];
        m_0 += 2;
      }
    }
  }
  return false;
}

function $solution_0(this$static, c){
  var shape;
  this$static.c = c;
  this$static.sol_string = null;
  shape = $getShapeIdx(c);
  for (this$static.length1 = ($clinit_Shape() , ShapePrun)[shape]; this$static.length1 < 100; ++this$static.length1) {
    this$static.maxlen2 = min(31 - this$static.length1, 17);
    if ($phase1_0(this$static, shape, ShapePrun[shape], this$static.length1, 0, -1)) {
      break;
    }
  }
  return this$static.sol_string;
}

function Search_2(){
  $clinit_Search();
  this.move = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 100, 1);
  this.d = new FullCube_1;
  this.sq = new Square_0;
}

defineSeed(150, 1, {}, Search_2);
_.c = null;
_.length1 = 0;
_.maxlen2 = 0;
_.sol_string = null;
function $clinit_Shape(){
  $clinit_Shape = nullMethod;
  halflayer = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [0, 3, 6, 12, 15, 24, 27, 30, 48, 51, 54, 60, 63]);
  ShapeIdx = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 3678, 1);
  ShapePrun = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 7536, 1);
  ShapePrunOpt = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 7536, 1);
  TopMove = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 7356, 1);
  BottomMove = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 7356, 1);
  TwistMove_0 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 7356, 1);
}

function $bottomMove(this$static){
  var move, moveParity;
  move = 0;
  moveParity = 0;
  do {
    if ((this$static.bottom & 2048) == 0) {
      move += 1;
      this$static.bottom = this$static.bottom << 1;
    }
     else {
      move += 2;
      this$static.bottom = this$static.bottom << 2 ^ 12291;
    }
    moveParity = 1 - moveParity;
  }
   while ((bitCount(this$static.bottom & 63) & 1) != 0);
  (bitCount(this$static.bottom) & 2) == 0 && (this$static.parity ^= moveParity);
  return move;
}

function $getIdx(this$static){
  var ret;
  ret = binarySearch_0(ShapeIdx, this$static.top_0 << 12 | this$static.bottom) << 1 | this$static.parity;
  return ret;
}

function $setIdx(this$static, idx){
  this$static.parity = idx & 1;
  this$static.top_0 = ShapeIdx[~~idx >> 1];
  this$static.bottom = this$static.top_0 & 4095;
  this$static.top_0 >>= 12;
}

function $topMove(this$static){
  var move, moveParity;
  move = 0;
  moveParity = 0;
  do {
    if ((this$static.top_0 & 2048) == 0) {
      move += 1;
      this$static.top_0 = this$static.top_0 << 1;
    }
     else {
      move += 2;
      this$static.top_0 = this$static.top_0 << 2 ^ 12291;
    }
    moveParity = 1 - moveParity;
  }
   while ((bitCount(this$static.top_0 & 63) & 1) != 0);
  (bitCount(this$static.top_0) & 2) == 0 && (this$static.parity ^= moveParity);
  return move;
}

function Shape_0(){
}

function getShape2Idx(shp){
  $clinit_Shape();
  var ret;
  ret = binarySearch_0(ShapeIdx, shp & 16777215) << 1 | ~~shp >> 24;
  return ret;
}

function init_1(){
  var temp, p1, p3;
  $clinit_Shape();
  var count, depth, dl, done, done0, dr, i_0, idx, m_0, s, ul, ur, value;
  if (inited_0) {
    return;
  }
  count = 0;
  for (i_0 = 0; i_0 < 28561; ++i_0) {
    dr = halflayer[i_0 % 13];
    dl = halflayer[~~(i_0 / 13) % 13];
    ur = halflayer[~~(~~(i_0 / 13) / 13) % 13];
    ul = halflayer[~~(~~(~~(i_0 / 13) / 13) / 13)];
    value = ul << 18 | ur << 12 | dl << 6 | dr;
    bitCount(value) == 16 && (ShapeIdx[count++] = value);
  }
  $clinit_System();
  s = new Shape_0;
  for (i_0 = 0; i_0 < 7356; ++i_0) {
    $setIdx(s, i_0);
    TopMove[i_0] = $topMove(s);
    TopMove[i_0] |= $getIdx(s) << 4;
    $setIdx(s, i_0);
    BottomMove[i_0] = $bottomMove(s);
    BottomMove[i_0] |= $getIdx(s) << 4;
    $setIdx(s, i_0);
    temp = s.top_0 & 63;
    p1 = bitCount(temp);
    p3 = bitCount(s.bottom & 4032);
    s.parity ^= 1 & ~~(p1 & p3) >> 1;
    s.top_0 = s.top_0 & 4032 | ~~s.bottom >> 6 & 63;
    s.bottom = s.bottom & 63 | temp << 6;
    TwistMove_0[i_0] = $getIdx(s);
  }
  for (i_0 = 0; i_0 < 7536; ++i_0) {
    ShapePrun[i_0] = -1;
    ShapePrunOpt[i_0] = -1;
  }
  ShapePrun[getShape2Idx(14378715)] = 0;
  ShapePrun[getShape2Idx(31157686)] = 0;
  ShapePrun[getShape2Idx(23967451)] = 0;
  ShapePrun[getShape2Idx(7191990)] = 0;
  ShapePrunOpt[$getShapeIdx(new FullCube_0)] = 0;
  done = 4;
  done0 = 0;
  depth = -1;
  while (done != done0) {
    done0 = done;
    ++depth;
    for (i_0 = 0; i_0 < 7536; ++i_0) {
      if (ShapePrun[i_0] == depth) {
        m_0 = 0;
        idx = i_0;
        do {
          idx = TopMove[idx];
          m_0 += idx & 15;
          idx >>= 4;
          if (ShapePrun[idx] == -1) {
            ++done;
            ShapePrun[idx] = depth + 1;
          }
        }
         while (m_0 != 12);
        m_0 = 0;
        idx = i_0;
        do {
          idx = BottomMove[idx];
          m_0 += idx & 15;
          idx >>= 4;
          if (ShapePrun[idx] == -1) {
            ++done;
            ShapePrun[idx] = depth + 1;
          }
        }
         while (m_0 != 12);
        idx = TwistMove_0[i_0];
        if (ShapePrun[idx] == -1) {
          ++done;
          ShapePrun[idx] = depth + 1;
        }
      }
    }
  }
  done = 1;
  done0 = 0;
  depth = -1;
  while (done != done0) {
    done0 = done;
    ++depth;
    for (i_0 = 0; i_0 < 7536; ++i_0) {
      if (ShapePrunOpt[i_0] == depth) {
        m_0 = 0;
        idx = i_0;
        do {
          idx = TopMove[idx];
          m_0 += idx & 15;
          idx >>= 4;
          if (ShapePrunOpt[idx] == -1) {
            ++done;
            ShapePrunOpt[idx] = depth + 1;
          }
        }
         while (m_0 != 12);
        m_0 = 0;
        idx = i_0;
        do {
          idx = BottomMove[idx];
          m_0 += idx & 15;
          idx >>= 4;
          if (ShapePrunOpt[idx] == -1) {
            ++done;
            ShapePrunOpt[idx] = depth + 1;
          }
        }
         while (m_0 != 12);
        idx = TwistMove_0[i_0];
        if (ShapePrunOpt[idx] == -1) {
          ++done;
          ShapePrunOpt[idx] = depth + 1;
        }
      }
    }
  }
  inited_0 = true;
}

defineSeed(151, 1, {}, Shape_0);
_.bottom = 0;
_.parity = 0;
_.top_0 = 0;
var BottomMove, ShapeIdx, ShapePrun, ShapePrunOpt, TopMove, TwistMove_0, halflayer, inited_0 = false;
function $clinit_Square(){
  $clinit_Square = nullMethod;
  SquarePrun = initDim(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, 80640, 1);
  TwistMove_1 = initDim(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, 40320, 1);
  TopMove_0 = initDim(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, 40320, 1);
  BottomMove_0 = initDim(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, 40320, 1);
  fact_0 = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [1, 1, 2, 6, 24, 120, 720, 5040]);
  Cnk_0 = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [12, 12], 2, 1);
}

function Square_0(){
  $clinit_Square();
}

function get8Perm_0(arr){
  $clinit_Square();
  var i_0, idx, v, val;
  idx = 0;
  val = 1985229328;
  for (i_0 = 0; i_0 < 7; ++i_0) {
    v = arr[i_0] << 2;
    idx = (8 - i_0) * idx + (~~val >> v & 7);
    val -= 286331152 << v;
  }
  return idx & 65535;
}

function init_2(){
  $clinit_Square();
  var check, depth, done, find_0, i_0, idx, idxx, inv, j, m_0, ml, pos, temp;
  if (inited_1) {
    return;
  }
  for (i_0 = 0; i_0 < 12; ++i_0) {
    Cnk_0[i_0][0] = 1;
    Cnk_0[i_0][i_0] = 1;
    for (j = 1; j < i_0; ++j) {
      Cnk_0[i_0][j] = Cnk_0[i_0 - 1][j - 1] + Cnk_0[i_0 - 1][j];
    }
  }
  pos = initDim(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, 8, 1);
  for (i_0 = 0; i_0 < 40320; ++i_0) {
    set8Perm_0(pos, i_0);
    temp = pos[2];
    pos[2] = pos[4];
    pos[4] = temp;
    temp = pos[3];
    pos[3] = pos[5];
    pos[5] = temp;
    TwistMove_1[i_0] = get8Perm_0(pos);
    set8Perm_0(pos, i_0);
    temp = pos[0];
    pos[0] = pos[1];
    pos[1] = pos[2];
    pos[2] = pos[3];
    pos[3] = temp;
    TopMove_0[i_0] = get8Perm_0(pos);
    set8Perm_0(pos, i_0);
    temp = pos[4];
    pos[4] = pos[5];
    pos[5] = pos[6];
    pos[6] = pos[7];
    pos[7] = temp;
    BottomMove_0[i_0] = get8Perm_0(pos);
  }
  for (i_0 = 0; i_0 < 80640; ++i_0) {
    SquarePrun[i_0] = -1;
  }
  SquarePrun[0] = 0;
  depth = 0;
  done = 1;
  while (done < 80640) {
    inv = depth >= 11;
    find_0 = inv?-1:depth;
    check = inv?depth:-1;
    ++depth;
    OUT: for (i_0 = 0; i_0 < 80640; ++i_0) {
      if (SquarePrun[i_0] == find_0) {
        idx = ~~i_0 >> 1;
        ml = i_0 & 1;
        idxx = TwistMove_1[idx] << 1 | 1 - ml;
        if (SquarePrun[idxx] == check) {
          ++done;
          SquarePrun[inv?i_0:idxx] = ~~(depth << 24) >> 24;
          if (inv) {
            continue OUT;
          }
        }
        idxx = idx;
        for (m_0 = 0; m_0 < 4; ++m_0) {
          idxx = TopMove_0[idxx];
          if (SquarePrun[idxx << 1 | ml] == check) {
            ++done;
            SquarePrun[inv?i_0:idxx << 1 | ml] = ~~(depth << 24) >> 24;
            if (inv) {
              continue OUT;
            }
          }
        }
        for (m_0 = 0; m_0 < 4; ++m_0) {
          idxx = BottomMove_0[idxx];
          if (SquarePrun[idxx << 1 | ml] == check) {
            ++done;
            SquarePrun[inv?i_0:idxx << 1 | ml] = ~~(depth << 24) >> 24;
            if (inv) {
              continue OUT;
            }
          }
        }
      }
    }
    $clinit_System();
    out_0.print_0(9);
  }
  inited_1 = true;
}

function set8Perm_0(arr, idx){
  var i_0, m_0, p_0, v, val;
  val = 1985229328;
  for (i_0 = 0; i_0 < 7; ++i_0) {
    p_0 = fact_0[7 - i_0];
    v = ~~(idx / p_0);
    idx -= v * p_0;
    v <<= 2;
    arr[i_0] = ~~((~~val >> v & 7) << 24) >> 24;
    m_0 = (1 << v) - 1;
    val = (val & m_0) + (~~val >> 4 & ~m_0);
  }
  arr[7] = ~~(val << 24) >> 24;
}

defineSeed(152, 1, {}, Square_0);
_.botEdgeFirst = false;
_.cornperm = 0;
_.edgeperm = 0;
_.ml = 0;
_.topEdgeFirst = false;
var BottomMove_0, Cnk_0, SquarePrun, TopMove_0, TwistMove_1, fact_0, inited_1 = false;
function $clinit_Center1(){
  $clinit_Center1 = nullMethod;
  ctsmv = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [15582, 36], 2, 1);
  sym2raw = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 15582, 1);
  csprun = initDim(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, 15582, 1);
  symmult = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [48, 48], 2, 1);
  symmove = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [48, 36], 2, 1);
  syminv = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 48, 1);
  finish_0 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 48, 1);
}

function $$init_1(this$static){
  this$static.ct = initDim(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, 24, 1);
}

function $equals(this$static, obj){
  var c, i_0;
  if (instanceOf(obj, Q$Center1)) {
    c = dynamicCast(obj, Q$Center1);
    for (i_0 = 0; i_0 < 24; ++i_0) {
      if (this$static.ct[i_0] != c.ct[i_0]) {
        return false;
      }
    }
    return true;
  }
  return false;
}

function $get_1(this$static){
  var i_0, idx, r;
  idx = 0;
  r = 8;
  for (i_0 = 23; i_0 >= 0; --i_0) {
    this$static.ct[i_0] == 1 && (idx += ($clinit_Util_0() , Cnk_1)[i_0][r--]);
  }
  return idx;
}

function $getsym(this$static){
  var cord, j;
  if (raw2sym != null) {
    return raw2sym[$get_1(this$static)];
  }
  for (j = 0; j < 48; ++j) {
    cord = raw2sym_0($get_1(this$static));
    if (cord != -1)
      return cord * 64 + j;
    $rot(this$static, 0);
    j % 2 == 1 && $rot(this$static, 1);
    j % 8 == 7 && $rot(this$static, 2);
    j % 16 == 15 && $rot(this$static, 3);
  }
  ($clinit_System() , out_0).print_0(101);
  return -1;
}

function $move(this$static, m_0){
  var key;
  key = m_0 % 3;
  m_0 = ~~(m_0 / 3);
  switch (m_0) {
    case 0:
      swap(this$static.ct, 0, 1, 2, 3, key);
      break;
    case 1:
      swap(this$static.ct, 16, 17, 18, 19, key);
      break;
    case 2:
      swap(this$static.ct, 8, 9, 10, 11, key);
      break;
    case 3:
      swap(this$static.ct, 4, 5, 6, 7, key);
      break;
    case 4:
      swap(this$static.ct, 20, 21, 22, 23, key);
      break;
    case 5:
      swap(this$static.ct, 12, 13, 14, 15, key);
      break;
    case 6:
      swap(this$static.ct, 0, 1, 2, 3, key);
      swap(this$static.ct, 8, 20, 12, 16, key);
      swap(this$static.ct, 9, 21, 13, 17, key);
      break;
    case 7:
      swap(this$static.ct, 16, 17, 18, 19, key);
      swap(this$static.ct, 1, 15, 5, 9, key);
      swap(this$static.ct, 2, 12, 6, 10, key);
      break;
    case 8:
      swap(this$static.ct, 8, 9, 10, 11, key);
      swap(this$static.ct, 2, 19, 4, 21, key);
      swap(this$static.ct, 3, 16, 5, 22, key);
      break;
    case 9:
      swap(this$static.ct, 4, 5, 6, 7, key);
      swap(this$static.ct, 10, 18, 14, 22, key);
      swap(this$static.ct, 11, 19, 15, 23, key);
      break;
    case 10:
      swap(this$static.ct, 20, 21, 22, 23, key);
      swap(this$static.ct, 0, 8, 4, 14, key);
      swap(this$static.ct, 3, 11, 7, 13, key);
      break;
    case 11:
      swap(this$static.ct, 12, 13, 14, 15, key);
      swap(this$static.ct, 1, 20, 7, 18, key);
      swap(this$static.ct, 0, 23, 6, 17, key);
  }
}

function $rot(this$static, r){
  switch (r) {
    case 0:
      $move(this$static, 19);
      $move(this$static, 28);
      break;
    case 1:
      $move(this$static, 21);
      $move(this$static, 32);
      break;
    case 2:
      swap(this$static.ct, 0, 3, 1, 2, 1);
      swap(this$static.ct, 8, 11, 9, 10, 1);
      swap(this$static.ct, 4, 7, 5, 6, 1);
      swap(this$static.ct, 12, 15, 13, 14, 1);
      swap(this$static.ct, 16, 19, 21, 22, 1);
      swap(this$static.ct, 17, 18, 20, 23, 1);
      break;
    case 3:
      $move(this$static, 18);
      $move(this$static, 29);
      $move(this$static, 24);
      $move(this$static, 35);
  }
}

function $rotate(this$static, r){
  var j;
  for (j = 0; j < r; ++j) {
    $rot(this$static, 0);
    j % 2 == 1 && $rot(this$static, 1);
    j % 8 == 7 && $rot(this$static, 2);
    j % 16 == 15 && $rot(this$static, 3);
  }
}

function $set_0(this$static, idx){
  var i_0, r;
  r = 8;
  for (i_0 = 23; i_0 >= 0; --i_0) {
    this$static.ct[i_0] = 0;
    if (idx >= ($clinit_Util_0() , Cnk_1)[i_0][r]) {
      idx -= Cnk_1[i_0][r--];
      this$static.ct[i_0] = 1;
    }
  }
}

function $set_1(this$static, c){
  var i_0;
  for (i_0 = 0; i_0 < 24; ++i_0) {
    this$static.ct[i_0] = c.ct[i_0];
  }
}

function Center1_0(){
  var i_0;
  $$init_1(this);
  for (i_0 = 0; i_0 < 8; ++i_0) {
    this.ct[i_0] = 1;
  }
  for (i_0 = 8; i_0 < 24; ++i_0) {
    this.ct[i_0] = 0;
  }
}

function Center1_1(c, urf){
  $clinit_Center1();
  var i_0;
  $$init_1(this);
  for (i_0 = 0; i_0 < 24; ++i_0) {
    this.ct[i_0] = ~~((~~(c.ct[i_0] / 2) == urf?1:0) << 24) >> 24;
  }
}

function Center1_2(ct){
  var i_0;
  $$init_1(this);
  for (i_0 = 0; i_0 < 24; ++i_0) {
    this.ct[i_0] = ct[i_0];
  }
}

function createMoveTable(){
  $clinit_Center1();
  var c, d, i_0, m_0;
  ($clinit_System() , out_0).println('Create Phase1 Center Move Table...');
  c = new Center1_0;
  d = new Center1_0;
  for (i_0 = 0; i_0 < 15582; ++i_0) {
    $set_0(d, sym2raw[i_0]);
    for (m_0 = 0; m_0 < 36; ++m_0) {
      $set_1(c, d);
      $move(c, m_0);
      ctsmv[i_0][m_0] = $getsym(c);
    }
  }
}

function createPrun(){
  $clinit_Center1();
  var check, depth, done, i_0, idx, inv, m_0, select;
  fill_0(csprun);
  csprun[0] = 0;
  depth = 0;
  done = 1;
  while (done != 15582) {
    inv = depth > 4;
    select = inv?-1:depth;
    check = inv?depth:-1;
    ++depth;
    for (i_0 = 0; i_0 < 15582; ++i_0) {
      if (csprun[i_0] != select) {
        continue;
      }
      for (m_0 = 0; m_0 < 27; ++m_0) {
        idx = ~~ctsmv[i_0][m_0] >>> 6;
        if (csprun[idx] != check) {
          continue;
        }
        ++done;
        if (inv) {
          csprun[i_0] = ~~(depth << 24) >> 24;
          break;
        }
         else {
          csprun[idx] = ~~(depth << 24) >> 24;
        }
      }
    }
  }
}

function getSolvedSym(cube){
  $clinit_Center1();
  var c, check, i_0, j;
  c = new Center1_2(cube.ct);
  for (j = 0; j < 48; ++j) {
    check = true;
    for (i_0 = 0; i_0 < 24; ++i_0) {
      if (c.ct[i_0] != ~~(i_0 / 4)) {
        check = false;
        break;
      }
    }
    if (check) {
      return j;
    }
    $rot(c, 0);
    j % 2 == 1 && $rot(c, 1);
    j % 8 == 7 && $rot(c, 2);
    j % 16 == 15 && $rot(c, 3);
  }
  return -1;
}

function initSym_0(){
  $clinit_Center1();
  var c, d, e, f, i_0, j, k_0;
  c = new Center1_0;
  for (i_0 = 0; i_0 < 24; ++i_0) {
    c.ct[i_0] = i_0;
  }
  d = new Center1_2(c.ct);
  e = new Center1_2(c.ct);
  f = new Center1_2(c.ct);
  for (i_0 = 0; i_0 < 48; ++i_0) {
    for (j = 0; j < 48; ++j) {
      for (k_0 = 0; k_0 < 48; ++k_0) {
        if ($equals(c, d)) {
          symmult[i_0][j] = k_0;
          k_0 == 0 && (syminv[i_0] = j);
        }
        $rot(d, 0);
        k_0 % 2 == 1 && $rot(d, 1);
        k_0 % 8 == 7 && $rot(d, 2);
        k_0 % 16 == 15 && $rot(d, 3);
      }
      $rot(c, 0);
      j % 2 == 1 && $rot(c, 1);
      j % 8 == 7 && $rot(c, 2);
      j % 16 == 15 && $rot(c, 3);
    }
    $rot(c, 0);
    i_0 % 2 == 1 && $rot(c, 1);
    i_0 % 8 == 7 && $rot(c, 2);
    i_0 % 16 == 15 && $rot(c, 3);
  }
  for (i_0 = 0; i_0 < 48; ++i_0) {
    $set_1(c, e);
    $rotate(c, syminv[i_0]);
    for (j = 0; j < 36; ++j) {
      $set_1(d, c);
      $move(d, j);
      $rotate(d, i_0);
      for (k_0 = 0; k_0 < 36; ++k_0) {
        $set_1(f, e);
        $move(f, k_0);
        if ($equals(f, d)) {
          symmove[i_0][j] = k_0;
          break;
        }
      }
    }
  }
  $set_0(c, 0);
  for (i_0 = 0; i_0 < 48; ++i_0) {
    finish_0[syminv[i_0]] = $get_1(c);
    $rot(c, 0);
    i_0 % 2 == 1 && $rot(c, 1);
    i_0 % 8 == 7 && $rot(c, 2);
    i_0 % 16 == 15 && $rot(c, 3);
  }
}

function initSym2Raw(){
  $clinit_Center1();
  var c, count, i_0, idx, j, occ;
  c = new Center1_0;
  occ = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 22984, 1);
  count = 0;
  for (i_0 = 0; i_0 < 735471; ++i_0) {
    if ((occ[~~i_0 >>> 5] & 1 << (i_0 & 31)) == 0) {
      $set_0(c, i_0);
      for (j = 0; j < 48; ++j) {
        idx = $get_1(c);
        occ[~~idx >>> 5] |= 1 << (idx & 31);
        raw2sym != null && (raw2sym[idx] = count << 6 | syminv[j]);
        $rot(c, 0);
        j % 2 == 1 && $rot(c, 1);
        j % 8 == 7 && $rot(c, 2);
        j % 16 == 15 && $rot(c, 3);
      }
      sym2raw[count++] = i_0;
    }
  }
}

function raw2sym_0(n){
  var m_0;
  m_0 = binarySearch_0(sym2raw, n);
  return m_0 >= 0?m_0:-1;
}

defineSeed(153, 1, makeCastMap([Q$Center1]), Center1_0, Center1_1, Center1_2);
_.equals$ = function equals_6(obj){
  return $equals(this, obj);
}
;
_.hashCode$ = function hashCode_7(){
  throw new UnsupportedOperationException_0;
}
;
var csprun, ctsmv, finish_0, raw2sym = null, sym2raw, syminv, symmove, symmult;
function $clinit_Center2(){
  $clinit_Center2 = nullMethod;
  rlmv = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [70, 28], 2, 1);
  ctmv = initDims([_3_3C_classLit, _3C_classLit], [makeCastMap([Q$Serializable, Q$Object_$1]), makeCastMap([Q$char_$1, Q$Serializable])], [Q$char_$1, -1], [6435, 28], 2, 1);
  rlrot = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [70, 16], 2, 1);
  ctrot = initDims([_3_3C_classLit, _3C_classLit], [makeCastMap([Q$Serializable, Q$Object_$1]), makeCastMap([Q$char_$1, Q$Serializable])], [Q$char_$1, -1], [6435, 16], 2, 1);
  ctprun = initDim(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, 450450, 1);
  pmv = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0]);
}

function $getct(this$static){
  var i_0, idx, r;
  idx = 0;
  r = 8;
  for (i_0 = 14; i_0 >= 0; --i_0) {
    this$static.ct[i_0] != this$static.ct[15] && (idx += ($clinit_Util_0() , Cnk_1)[i_0][r--]);
  }
  return idx;
}

function $getrl(this$static){
  var i_0, idx, r;
  idx = 0;
  r = 4;
  for (i_0 = 6; i_0 >= 0; --i_0) {
    this$static.rl[i_0] != this$static.rl[7] && (idx += ($clinit_Util_0() , Cnk_1)[i_0][r--]);
  }
  return idx * 2 + this$static.parity;
}

function $move_0(this$static, m_0){
  var key;
  this$static.parity ^= pmv[m_0];
  key = m_0 % 3;
  m_0 = ~~(m_0 / 3);
  switch (m_0) {
    case 0:
      swap_0(this$static.ct, 0, 1, 2, 3, key);
      break;
    case 1:
      swap_0(this$static.rl, 0, 1, 2, 3, key);
      break;
    case 2:
      swap_0(this$static.ct, 8, 9, 10, 11, key);
      break;
    case 3:
      swap_0(this$static.ct, 4, 5, 6, 7, key);
      break;
    case 4:
      swap_0(this$static.rl, 4, 5, 6, 7, key);
      break;
    case 5:
      swap_0(this$static.ct, 12, 13, 14, 15, key);
      break;
    case 6:
      swap_0(this$static.ct, 0, 1, 2, 3, key);
      swap_0(this$static.rl, 0, 5, 4, 1, key);
      swap_0(this$static.ct, 8, 9, 12, 13, key);
      break;
    case 7:
      swap_0(this$static.rl, 0, 1, 2, 3, key);
      swap_0(this$static.ct, 1, 15, 5, 9, key);
      swap_0(this$static.ct, 2, 12, 6, 10, key);
      break;
    case 8:
      swap_0(this$static.ct, 8, 9, 10, 11, key);
      swap_0(this$static.rl, 0, 3, 6, 5, key);
      swap_0(this$static.ct, 3, 2, 5, 4, key);
      break;
    case 9:
      swap_0(this$static.ct, 4, 5, 6, 7, key);
      swap_0(this$static.rl, 3, 2, 7, 6, key);
      swap_0(this$static.ct, 11, 10, 15, 14, key);
      break;
    case 10:
      swap_0(this$static.rl, 4, 5, 6, 7, key);
      swap_0(this$static.ct, 0, 8, 4, 14, key);
      swap_0(this$static.ct, 3, 11, 7, 13, key);
      break;
    case 11:
      swap_0(this$static.ct, 12, 13, 14, 15, key);
      swap_0(this$static.rl, 1, 4, 7, 2, key);
      swap_0(this$static.ct, 1, 0, 7, 6, key);
  }
}

function $rot_0(this$static, r){
  switch (r) {
    case 0:
      $move_0(this$static, 19);
      $move_0(this$static, 28);
      break;
    case 1:
      $move_0(this$static, 21);
      $move_0(this$static, 32);
      break;
    case 2:
      swap_0(this$static.ct, 0, 3, 1, 2, 1);
      swap_0(this$static.ct, 8, 11, 9, 10, 1);
      swap_0(this$static.ct, 4, 7, 5, 6, 1);
      swap_0(this$static.ct, 12, 15, 13, 14, 1);
      swap_0(this$static.rl, 0, 3, 5, 6, 1);
      swap_0(this$static.rl, 1, 2, 4, 7, 1);
  }
}

function $set_2(this$static, c, edgeParity){
  var i_0;
  for (i_0 = 0; i_0 < 16; ++i_0) {
    this$static.ct[i_0] = ~~(c.ct[i_0] / 2);
  }
  for (i_0 = 0; i_0 < 8; ++i_0) {
    this$static.rl[i_0] = c.ct[i_0 + 16];
  }
  this$static.parity = edgeParity;
}

function $setct(this$static, idx){
  var i_0, r;
  r = 8;
  this$static.ct[15] = 0;
  for (i_0 = 14; i_0 >= 0; --i_0) {
    if (idx >= ($clinit_Util_0() , Cnk_1)[i_0][r]) {
      idx -= Cnk_1[i_0][r--];
      this$static.ct[i_0] = 1;
    }
     else {
      this$static.ct[i_0] = 0;
    }
  }
}

function $setrl(this$static, idx){
  var i_0, r;
  this$static.parity = idx & 1;
  idx >>>= 1;
  r = 4;
  this$static.rl[7] = 0;
  for (i_0 = 6; i_0 >= 0; --i_0) {
    if (idx >= ($clinit_Util_0() , Cnk_1)[i_0][r]) {
      idx -= Cnk_1[i_0][r--];
      this$static.rl[i_0] = 1;
    }
     else {
      this$static.rl[i_0] = 0;
    }
  }
}

function Center2_0(){
  $clinit_Center2();
  this.rl = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 8, 1);
  this.ct = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 16, 1);
}

function init_3(){
  $clinit_Center2();
  var c, ct, ctx, depth, done, i_0, idx, j, m_0, rl, rlx;
  c = new Center2_0;
  for (i_0 = 0; i_0 < 70; ++i_0) {
    for (m_0 = 0; m_0 < 28; ++m_0) {
      $setrl(c, i_0);
      $move_0(c, ($clinit_Moves() , move2std)[m_0]);
      rlmv[i_0][m_0] = $getrl(c);
    }
  }
  for (i_0 = 0; i_0 < 70; ++i_0) {
    $setrl(c, i_0);
    for (j = 0; j < 16; ++j) {
      rlrot[i_0][j] = $getrl(c);
      $rot_0(c, 0);
      j % 2 == 1 && $rot_0(c, 1);
      j % 8 == 7 && $rot_0(c, 2);
    }
  }
  for (i_0 = 0; i_0 < 6435; ++i_0) {
    $setct(c, i_0);
    for (j = 0; j < 16; ++j) {
      ctrot[i_0][j] = $getct(c) & 65535;
      $rot_0(c, 0);
      j % 2 == 1 && $rot_0(c, 1);
      j % 8 == 7 && $rot_0(c, 2);
    }
  }
  for (i_0 = 0; i_0 < 6435; ++i_0) {
    for (m_0 = 0; m_0 < 28; ++m_0) {
      $setct(c, i_0);
      $move_0(c, ($clinit_Moves() , move2std)[m_0]);
      ctmv[i_0][m_0] = $getct(c) & 65535;
    }
  }
  fill_0(ctprun);
  ctprun[0] = ctprun[18] = ctprun[28] = ctprun[46] = ctprun[54] = ctprun[56] = 0;
  depth = 0;
  done = 6;
  while (done != 450450) {
    for (i_0 = 0; i_0 < 450450; ++i_0) {
      if (ctprun[i_0] != depth) {
        continue;
      }
      ct = ~~(i_0 / 70);
      rl = i_0 % 70;
      for (m_0 = 0; m_0 < 23; ++m_0) {
        ctx = ctmv[ct][m_0];
        rlx = rlmv[rl][m_0];
        idx = ctx * 70 + rlx;
        if (ctprun[idx] == -1) {
          ctprun[idx] = ~~(depth + 1 << 24) >> 24;
          ++done;
        }
      }
    }
    ++depth;
  }
}

defineSeed(154, 1, {}, Center2_0);
_.parity = 0;
var ctmv, ctprun, ctrot, pmv, rlmv, rlrot;
function $clinit_Center3(){
  $clinit_Center3 = nullMethod;
  ctmove = initDims([_3_3C_classLit, _3C_classLit], [makeCastMap([Q$Serializable, Q$Object_$1]), makeCastMap([Q$char_$1, Q$Serializable])], [Q$char_$1, -1], [29400, 20], 2, 1);
  pmove = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]);
  prun_0 = initDim(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, 29400, 1);
  rl2std = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [0, 9, 14, 23, 27, 28, 41, 42, 46, 55, 60, 69]);
  std2rl = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 70, 1);
}

function $getct_0(this$static){
  var check, i_0, idx, idxrl, r;
  idx = 0;
  r = 4;
  for (i_0 = 6; i_0 >= 0; --i_0) {
    this$static.ud[i_0] != this$static.ud[7] && (idx += ($clinit_Util_0() , Cnk_1)[i_0][r--]);
  }
  idx *= 35;
  r = 4;
  for (i_0 = 6; i_0 >= 0; --i_0) {
    this$static.fb[i_0] != this$static.fb[7] && (idx += ($clinit_Util_0() , Cnk_1)[i_0][r--]);
  }
  idx *= 12;
  check = this$static.fb[7] ^ this$static.ud[7];
  idxrl = 0;
  r = 4;
  for (i_0 = 7; i_0 >= 0; --i_0) {
    this$static.rl[i_0] != check && (idxrl += ($clinit_Util_0() , Cnk_1)[i_0][r--]);
  }
  return this$static.parity + 2 * (idx + std2rl[idxrl]);
}

function $move_1(this$static, i_0){
  this$static.parity ^= pmove[i_0];
  switch (i_0) {
    case 0:
    case 1:
    case 2:
      swap_0(this$static.ud, 0, 1, 2, 3, i_0 % 3);
      break;
    case 3:
      swap_0(this$static.rl, 0, 1, 2, 3, 1);
      break;
    case 4:
    case 5:
    case 6:
      swap_0(this$static.fb, 0, 1, 2, 3, (i_0 - 1) % 3);
      break;
    case 7:
    case 8:
    case 9:
      swap_0(this$static.ud, 4, 5, 6, 7, (i_0 - 1) % 3);
      break;
    case 10:
      swap_0(this$static.rl, 4, 5, 6, 7, 1);
      break;
    case 11:
    case 12:
    case 13:
      swap_0(this$static.fb, 4, 5, 6, 7, (i_0 + 1) % 3);
      break;
    case 14:
      swap_0(this$static.ud, 0, 1, 2, 3, 1);
      swap_0(this$static.rl, 0, 5, 4, 1, 1);
      swap_0(this$static.fb, 0, 5, 4, 1, 1);
      break;
    case 15:
      swap_0(this$static.rl, 0, 1, 2, 3, 1);
      swap_0(this$static.fb, 1, 4, 7, 2, 1);
      swap_0(this$static.ud, 1, 6, 5, 2, 1);
      break;
    case 16:
      swap_0(this$static.fb, 0, 1, 2, 3, 1);
      swap_0(this$static.ud, 3, 2, 5, 4, 1);
      swap_0(this$static.rl, 0, 3, 6, 5, 1);
      break;
    case 17:
      swap_0(this$static.ud, 4, 5, 6, 7, 1);
      swap_0(this$static.rl, 3, 2, 7, 6, 1);
      swap_0(this$static.fb, 3, 2, 7, 6, 1);
      break;
    case 18:
      swap_0(this$static.rl, 4, 5, 6, 7, 1);
      swap_0(this$static.fb, 0, 3, 6, 5, 1);
      swap_0(this$static.ud, 0, 3, 4, 7, 1);
      break;
    case 19:
      swap_0(this$static.fb, 4, 5, 6, 7, 1);
      swap_0(this$static.ud, 0, 7, 6, 1, 1);
      swap_0(this$static.rl, 1, 4, 7, 2, 1);
  }
}

function $set_3(this$static, c, eXc_parity){
  var i_0, parity;
  parity = c.ct[0] > c.ct[8] ^ c.ct[8] > c.ct[16] ^ c.ct[0] > c.ct[16]?1:0;
  for (i_0 = 0; i_0 < 8; ++i_0) {
    this$static.ud[i_0] = c.ct[i_0] & 1 ^ 1;
    this$static.fb[i_0] = c.ct[i_0 + 8] & 1 ^ 1;
    this$static.rl[i_0] = c.ct[i_0 + 16] & 1 ^ 1 ^ parity;
  }
  this$static.parity = parity ^ eXc_parity;
}

function $setct_0(this$static, idx){
  var i_0, idxfb, idxrl, r;
  this$static.parity = idx & 1;
  idx >>>= 1;
  idxrl = rl2std[idx % 12];
  idx = ~~(idx / 12);
  r = 4;
  for (i_0 = 7; i_0 >= 0; --i_0) {
    this$static.rl[i_0] = 0;
    if (idxrl >= ($clinit_Util_0() , Cnk_1)[i_0][r]) {
      idxrl -= Cnk_1[i_0][r--];
      this$static.rl[i_0] = 1;
    }
  }
  idxfb = idx % 35;
  idx = ~~(idx / 35);
  r = 4;
  this$static.fb[7] = 0;
  for (i_0 = 6; i_0 >= 0; --i_0) {
    if (idxfb >= ($clinit_Util_0() , Cnk_1)[i_0][r]) {
      idxfb -= Cnk_1[i_0][r--];
      this$static.fb[i_0] = 1;
    }
     else {
      this$static.fb[i_0] = 0;
    }
  }
  r = 4;
  this$static.ud[7] = 0;
  for (i_0 = 6; i_0 >= 0; --i_0) {
    if (idx >= ($clinit_Util_0() , Cnk_1)[i_0][r]) {
      idx -= Cnk_1[i_0][r--];
      this$static.ud[i_0] = 1;
    }
     else {
      this$static.ud[i_0] = 0;
    }
  }
}

function Center3_0(){
  $clinit_Center3();
  this.ud = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 8, 1);
  this.rl = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 8, 1);
  this.fb = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 8, 1);
}

function init_4(){
  $clinit_Center3();
  var c, depth, done, i_0, m_0;
  for (i_0 = 0; i_0 < 12; ++i_0) {
    std2rl[rl2std[i_0]] = i_0;
  }
  c = new Center3_0;
  for (i_0 = 0; i_0 < 29400; ++i_0) {
    for (m_0 = 0; m_0 < 20; ++m_0) {
      $setct_0(c, i_0);
      $move_1(c, m_0);
      ctmove[i_0][m_0] = $getct_0(c) & 65535;
    }
  }
  fill_0(prun_0);
  prun_0[0] = 0;
  depth = 0;
  done = 1;
  while (done != 29400) {
    for (i_0 = 0; i_0 < 29400; ++i_0) {
      if (prun_0[i_0] != depth) {
        continue;
      }
      for (m_0 = 0; m_0 < 17; ++m_0) {
        if (prun_0[ctmove[i_0][m_0]] == -1) {
          prun_0[ctmove[i_0][m_0]] = ~~(depth + 1 << 24) >> 24;
          ++done;
        }
      }
    }
    ++depth;
  }
}

defineSeed(155, 1, {}, Center3_0);
_.parity = 0;
var ctmove, pmove, prun_0, rl2std, std2rl;
function $clinit_CenterCube(){
  $clinit_CenterCube = nullMethod;
  center333Map = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [0, 4, 2, 1, 5, 3]);
}

function $copy_1(this$static, c){
  var i_0;
  for (i_0 = 0; i_0 < 24; ++i_0) {
    this$static.ct[i_0] = c.ct[i_0];
  }
}

function $fill333Facelet(this$static, facelet){
  var i_0, idx;
  for (i_0 = 0; i_0 < 6; ++i_0) {
    idx = center333Map[i_0] << 2;
    if (this$static.ct[idx] != this$static.ct[idx + 1] || this$static.ct[idx + 1] != this$static.ct[idx + 2] || this$static.ct[idx + 2] != this$static.ct[idx + 3]) {
      throw new RuntimeException_1('Unsolved Center');
    }
    facelet[4 + i_0 * 9] = ($clinit_Util_0() , colorMap4to3)[this$static.ct[idx]];
  }
}

function $move_2(this$static, m_0){
  var key;
  key = m_0 % 3;
  m_0 = ~~(m_0 / 3);
  switch (m_0) {
    case 0:
      swap(this$static.ct, 0, 1, 2, 3, key);
      break;
    case 1:
      swap(this$static.ct, 16, 17, 18, 19, key);
      break;
    case 2:
      swap(this$static.ct, 8, 9, 10, 11, key);
      break;
    case 3:
      swap(this$static.ct, 4, 5, 6, 7, key);
      break;
    case 4:
      swap(this$static.ct, 20, 21, 22, 23, key);
      break;
    case 5:
      swap(this$static.ct, 12, 13, 14, 15, key);
      break;
    case 6:
      swap(this$static.ct, 0, 1, 2, 3, key);
      swap(this$static.ct, 8, 20, 12, 16, key);
      swap(this$static.ct, 9, 21, 13, 17, key);
      break;
    case 7:
      swap(this$static.ct, 16, 17, 18, 19, key);
      swap(this$static.ct, 1, 15, 5, 9, key);
      swap(this$static.ct, 2, 12, 6, 10, key);
      break;
    case 8:
      swap(this$static.ct, 8, 9, 10, 11, key);
      swap(this$static.ct, 2, 19, 4, 21, key);
      swap(this$static.ct, 3, 16, 5, 22, key);
      break;
    case 9:
      swap(this$static.ct, 4, 5, 6, 7, key);
      swap(this$static.ct, 10, 18, 14, 22, key);
      swap(this$static.ct, 11, 19, 15, 23, key);
      break;
    case 10:
      swap(this$static.ct, 20, 21, 22, 23, key);
      swap(this$static.ct, 0, 8, 4, 14, key);
      swap(this$static.ct, 3, 11, 7, 13, key);
      break;
    case 11:
      swap(this$static.ct, 12, 13, 14, 15, key);
      swap(this$static.ct, 1, 20, 7, 18, key);
      swap(this$static.ct, 0, 23, 6, 17, key);
  }
}

function CenterCube_0(){
  $clinit_CenterCube();
  var i_0;
  this.ct = initDim(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, 24, 1);
  for (i_0 = 0; i_0 < 24; ++i_0) {
    this.ct[i_0] = ~~(~~(i_0 / 4) << 24) >> 24;
  }
}

function CenterCube_1(r){
  $clinit_CenterCube();
  var i_0, m_0, t;
  CenterCube_0.call(this);
  for (i_0 = 0; i_0 < 23; ++i_0) {
    t = i_0 + $nextInt(r, 24 - i_0);
    if (this.ct[t] != this.ct[i_0]) {
      m_0 = this.ct[i_0];
      this.ct[i_0] = this.ct[t];
      this.ct[t] = m_0;
    }
  }
}

defineSeed(156, 1, {}, CenterCube_0, CenterCube_1);
var center333Map;
function $clinit_CornerCube(){
  $clinit_CornerCube = nullMethod;
  moveCube_0 = initDim(_3Lcs_threephase_CornerCube_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$CornerCube, 18, 0);
  cornerFacelet_0 = initValues(_3_3B_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$byte_$1, [initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [8, 9, 20]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [6, 18, 38]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [0, 36, 47]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [2, 45, 11]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [29, 26, 15]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [27, 44, 24]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [33, 53, 42]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [35, 17, 51])]);
  initMove_0();
}

function $$init_2(this$static){
  this$static.cp = initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [0, 1, 2, 3, 4, 5, 6, 7]);
  this$static.co = initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [0, 0, 0, 0, 0, 0, 0, 0]);
}

function $copy_2(this$static, c){
  var i_0;
  for (i_0 = 0; i_0 < 8; ++i_0) {
    this$static.cp[i_0] = c.cp[i_0];
    this$static.co[i_0] = c.co[i_0];
  }
}

function $fill333Facelet_0(this$static, facelet){
  var corn, j, n, ori;
  for (corn = 0; corn < 8; ++corn) {
    j = this$static.cp[corn];
    ori = this$static.co[corn];
    for (n = 0; n < 3; ++n) {
      facelet[cornerFacelet_0[corn][(n + ori) % 3]] = $charAt('URFDLB', ~~(cornerFacelet_0[j][n] / 9));
    }
  }
}

function $move_3(this$static, idx){
  !this$static.temps && (this$static.temps = new CornerCube_0);
  CornMult_0(this$static, moveCube_0[idx], this$static.temps);
  $copy_2(this$static, this$static.temps);
}

function $setTwist_0(this$static, idx){
  var i_0, twst;
  twst = 0;
  for (i_0 = 6; i_0 >= 0; --i_0) {
    twst += this$static.co[i_0] = ~~(idx % 3 << 24) >> 24;
    idx = ~~(idx / 3);
  }
  this$static.co[7] = ~~((15 - twst) % 3 << 24) >> 24;
}

function CornMult_0(a, b, prod){
  var corn, ori, oriA, oriB;
  for (corn = 0; corn < 8; ++corn) {
    prod.cp[corn] = a.cp[b.cp[corn]];
    oriA = a.co[b.cp[corn]];
    oriB = b.co[corn];
    ori = oriA;
    ori = ~~(ori + (oriA < 3?oriB:6 - oriB) << 24) >> 24;
    ori = ~~(ori % 3 << 24) >> 24;
    oriA >= 3 ^ oriB >= 3 && (ori = ~~(ori + 3 << 24) >> 24);
    prod.co[corn] = ori;
  }
}

function CornerCube_0(){
  $clinit_CornerCube();
  $$init_2(this);
}

function CornerCube_1(cperm, twist){
  $$init_2(this);
  set8Perm_1(this.cp, cperm);
  $setTwist_0(this, twist);
}

function CornerCube_2(r){
  $clinit_CornerCube();
  CornerCube_1.call(this, $nextInt(r, 40320), $nextInt(r, 2187));
}

function initMove_0(){
  var a, p_0;
  moveCube_0[0] = new CornerCube_1(15120, 0);
  moveCube_0[3] = new CornerCube_1(21021, 1494);
  moveCube_0[6] = new CornerCube_1(8064, 1236);
  moveCube_0[9] = new CornerCube_1(9, 0);
  moveCube_0[12] = new CornerCube_1(1230, 412);
  moveCube_0[15] = new CornerCube_1(224, 137);
  for (a = 0; a < 18; a += 3) {
    for (p_0 = 0; p_0 < 2; ++p_0) {
      moveCube_0[a + p_0 + 1] = new CornerCube_0;
      CornMult_0(moveCube_0[a + p_0], moveCube_0[a], moveCube_0[a + p_0 + 1]);
    }
  }
}

defineSeed(157, 1, makeCastMap([Q$CornerCube]), CornerCube_0, CornerCube_1, CornerCube_2);
_.temps = null;
var cornerFacelet_0, moveCube_0;
function $clinit_Edge3(){
  $clinit_Edge3 = nullMethod;
  prunValues = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [1, 4, 16, 55, 324, 1922, 12275, 77640, 485359, 2778197, 11742425, 27492416, 31002941, 31006080]);
  eprun = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 1937880, 1);
  sym2raw_0 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 1538, 1);
  symstate = initDim(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, 1538, 1);
  raw2sym_1 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 11880, 1);
  syminv_0 = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [0, 1, 6, 3, 4, 5, 2, 7]);
  mvrot = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [160, 12], 2, 1);
  mvroto = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [160, 12], 2, 1);
  factX = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [1, 1, 1, 3, 12, 60, 360, 2520, 20160, 181440, 1814400, 19958400, 239500800]);
  FullEdgeMap = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [0, 2, 4, 6, 1, 3, 7, 5, 8, 9, 10, 11]);
}

function $circle(arr, a, b, c, d){
  var temp;
  temp = arr[d];
  arr[d] = arr[c];
  arr[c] = arr[b];
  arr[b] = arr[a];
  arr[a] = temp;
}

function $circlex(this$static, a, b, c, d){
  var temp;
  temp = this$static.edgeo[d];
  this$static.edgeo[d] = this$static.edge[c];
  this$static.edge[c] = this$static.edgeo[b];
  this$static.edgeo[b] = this$static.edge[a];
  this$static.edge[a] = temp;
}

function $get_2(this$static, end){
  var i_0, idx, v, val;
  this$static.isStd || $std(this$static);
  idx = 0;
  val = Pba9876543210_longLit;
  for (i_0 = 0; i_0 < end; ++i_0) {
    v = this$static.edge[i_0] << 2;
    idx *= 12 - i_0;
    idx = toInt(add(fromInt(idx), and(shr(val, v), Pf_longLit)));
    val = sub(val, shl(P111111111110_longLit, v));
  }
  return idx;
}

function $getsym_0(this$static){
  var cord1x, cord2x, symcord1x, symx;
  cord1x = $get_2(this$static, 4);
  symcord1x = raw2sym_1[cord1x];
  symx = symcord1x & 7;
  symcord1x >>= 3;
  $rotate_0(this$static, symx);
  cord2x = $get_2(this$static, 10) % 20160;
  return symcord1x * 20160 + cord2x;
}

function $move_4(this$static, i_0){
  this$static.isStd = false;
  switch (i_0) {
    case 0:
      $circle(this$static.edge, 0, 4, 1, 5);
      $circle(this$static.edgeo, 0, 4, 1, 5);
      break;
    case 1:
      $swap_0(this$static.edge, 0, 4, 1, 5);
      $swap_0(this$static.edgeo, 0, 4, 1, 5);
      break;
    case 2:
      $circle(this$static.edge, 0, 5, 1, 4);
      $circle(this$static.edgeo, 0, 5, 1, 4);
      break;
    case 3:
      $swap_0(this$static.edge, 5, 10, 6, 11);
      $swap_0(this$static.edgeo, 5, 10, 6, 11);
      break;
    case 4:
      $circle(this$static.edge, 0, 11, 3, 8);
      $circle(this$static.edgeo, 0, 11, 3, 8);
      break;
    case 5:
      $swap_0(this$static.edge, 0, 11, 3, 8);
      $swap_0(this$static.edgeo, 0, 11, 3, 8);
      break;
    case 6:
      $circle(this$static.edge, 0, 8, 3, 11);
      $circle(this$static.edgeo, 0, 8, 3, 11);
      break;
    case 7:
      $circle(this$static.edge, 2, 7, 3, 6);
      $circle(this$static.edgeo, 2, 7, 3, 6);
      break;
    case 8:
      $swap_0(this$static.edge, 2, 7, 3, 6);
      $swap_0(this$static.edgeo, 2, 7, 3, 6);
      break;
    case 9:
      $circle(this$static.edge, 2, 6, 3, 7);
      $circle(this$static.edgeo, 2, 6, 3, 7);
      break;
    case 10:
      $swap_0(this$static.edge, 4, 8, 7, 9);
      $swap_0(this$static.edgeo, 4, 8, 7, 9);
      break;
    case 11:
      $circle(this$static.edge, 1, 9, 2, 10);
      $circle(this$static.edgeo, 1, 9, 2, 10);
      break;
    case 12:
      $swap_0(this$static.edge, 1, 9, 2, 10);
      $swap_0(this$static.edgeo, 1, 9, 2, 10);
      break;
    case 13:
      $circle(this$static.edge, 1, 10, 2, 9);
      $circle(this$static.edgeo, 1, 10, 2, 9);
      break;
    case 14:
      $swap_0(this$static.edge, 0, 4, 1, 5);
      $swap_0(this$static.edgeo, 0, 4, 1, 5);
      $swap(this$static.edge, 9, 11);
      $swap(this$static.edgeo, 8, 10);
      break;
    case 15:
      $swap_0(this$static.edge, 5, 10, 6, 11);
      $swap_0(this$static.edgeo, 5, 10, 6, 11);
      $swap(this$static.edge, 1, 3);
      $swap(this$static.edgeo, 0, 2);
      break;
    case 16:
      $swap_0(this$static.edge, 0, 11, 3, 8);
      $swap_0(this$static.edgeo, 0, 11, 3, 8);
      $swap(this$static.edge, 5, 7);
      $swap(this$static.edgeo, 4, 6);
      break;
    case 17:
      $swap_0(this$static.edge, 2, 7, 3, 6);
      $swap_0(this$static.edgeo, 2, 7, 3, 6);
      $swap(this$static.edge, 8, 10);
      $swap(this$static.edgeo, 9, 11);
      break;
    case 18:
      $swap_0(this$static.edge, 4, 8, 7, 9);
      $swap_0(this$static.edgeo, 4, 8, 7, 9);
      $swap(this$static.edge, 0, 2);
      $swap(this$static.edgeo, 1, 3);
      break;
    case 19:
      $swap_0(this$static.edge, 1, 9, 2, 10);
      $swap_0(this$static.edgeo, 1, 9, 2, 10);
      $swap(this$static.edge, 4, 6);
      $swap(this$static.edgeo, 5, 7);
  }
}

function $rot_1(this$static, r){
  this$static.isStd = false;
  switch (r) {
    case 0:
      $move_4(this$static, 14);
      $move_4(this$static, 17);
      break;
    case 1:
      $circlex(this$static, 11, 5, 10, 6);
      $circlex(this$static, 5, 10, 6, 11);
      $circlex(this$static, 1, 2, 3, 0);
      $circlex(this$static, 4, 9, 7, 8);
      $circlex(this$static, 8, 4, 9, 7);
      $circlex(this$static, 0, 1, 2, 3);
      break;
    case 2:
      $swapx(this$static, 4, 5);
      $swapx(this$static, 5, 4);
      $swapx(this$static, 11, 8);
      $swapx(this$static, 8, 11);
      $swapx(this$static, 7, 6);
      $swapx(this$static, 6, 7);
      $swapx(this$static, 9, 10);
      $swapx(this$static, 10, 9);
      $swapx(this$static, 1, 1);
      $swapx(this$static, 0, 0);
      $swapx(this$static, 3, 3);
      $swapx(this$static, 2, 2);
  }
}

function $rotate_0(this$static, r){
  while (r >= 2) {
    r -= 2;
    $rot_1(this$static, 1);
    $rot_1(this$static, 2);
  }
  r != 0 && $rot_1(this$static, 0);
}

function $set_4(this$static, idx){
  var i_0, m_0, p_0, parity, v, val;
  val = Pba9876543210_longLit;
  parity = 0;
  for (i_0 = 0; i_0 < 11; ++i_0) {
    p_0 = factX[11 - i_0];
    v = ~~(idx / p_0);
    idx = idx % p_0;
    parity ^= v;
    v <<= 2;
    this$static.edge[i_0] = toInt(and(shr(val, v), Pf_longLit));
    m_0 = sub(shl(P1_longLit, v), P1_longLit);
    val = add(and(val, m_0), and(shr(val, 4), create0(~m_0.l & 4194303, ~m_0.m & 4194303, ~m_0.h & 1048575)));
  }
  if ((parity & 1) == 0) {
    this$static.edge[11] = toInt(val);
  }
   else {
    this$static.edge[11] = this$static.edge[10];
    this$static.edge[10] = toInt(val);
  }
  for (i_0 = 0; i_0 < 12; ++i_0) {
    this$static.edgeo[i_0] = i_0;
  }
  this$static.isStd = true;
}

function $set_5(this$static, e){
  var i_0;
  for (i_0 = 0; i_0 < 12; ++i_0) {
    this$static.edge[i_0] = e.edge[i_0];
    this$static.edgeo[i_0] = e.edgeo[i_0];
  }
  this$static.isStd = e.isStd;
}

function $set_6(this$static, c){
  var i_0, parity, s, t;
  this$static.temp == null && (this$static.temp = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 12, 1));
  for (i_0 = 0; i_0 < 12; ++i_0) {
    this$static.temp[i_0] = i_0;
    this$static.edge[i_0] = c.ep[FullEdgeMap[i_0] + 12] % 12;
  }
  parity = 1;
  for (i_0 = 0; i_0 < 12; ++i_0) {
    while (this$static.edge[i_0] != i_0) {
      t = this$static.edge[i_0];
      this$static.edge[i_0] = this$static.edge[t];
      this$static.edge[t] = t;
      s = this$static.temp[i_0];
      this$static.temp[i_0] = this$static.temp[t];
      this$static.temp[t] = s;
      parity ^= 1;
    }
  }
  for (i_0 = 0; i_0 < 12; ++i_0) {
    this$static.edge[i_0] = this$static.temp[c.ep[FullEdgeMap[i_0]] % 12];
  }
  return parity;
}

function $std(this$static){
  var i_0;
  this$static.temp == null && (this$static.temp = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 12, 1));
  for (i_0 = 0; i_0 < 12; ++i_0) {
    this$static.temp[this$static.edgeo[i_0]] = i_0;
  }
  for (i_0 = 0; i_0 < 12; ++i_0) {
    this$static.edge[i_0] = this$static.temp[this$static.edge[i_0]];
    this$static.edgeo[i_0] = i_0;
  }
  this$static.isStd = true;
}

function $swap(arr, x, y){
  var temp;
  temp = arr[x];
  arr[x] = arr[y];
  arr[y] = temp;
}

function $swap_0(arr, a, b, c, d){
  var temp;
  temp = arr[a];
  arr[a] = arr[c];
  arr[c] = temp;
  temp = arr[b];
  arr[b] = arr[d];
  arr[d] = temp;
}

function $swapx(this$static, x, y){
  var temp;
  temp = this$static.edge[x];
  this$static.edge[x] = this$static.edgeo[y];
  this$static.edgeo[y] = temp;
}

function Edge3_0(){
  $clinit_Edge3();
  this.edge = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 12, 1);
  this.edgeo = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 12, 1);
}

function createPrun_0(){
  $clinit_Edge3();
  var chk, cord1, cord1x, cord2, cord2x, dep1m3, depm3, depth, e, end, f, find_0, g, i_0, i_, idx, idxx, inv, j, m_0, symState, symcord1, symcord1x, symx, val;
  e = new Edge3_0;
  f = new Edge3_0;
  g = new Edge3_0;
  fill_2(eprun);
  depth = 0;
  done_0 = 1;
  setPruning_0(eprun, 0, 0);
  while (done_0 != 31006080) {
    inv = depth > 9;
    depm3 = depth % 3;
    dep1m3 = (depth + 1) % 3;
    find_0 = inv?3:depm3;
    chk = inv?depm3:3;
    if (depth >= 9) {
      break;
    }
    for (i_ = 0; i_ < 31006080; i_ += 16) {
      val = eprun[~~i_ >> 4];
      if (!inv && val == -1) {
        continue;
      }
      for (i_0 = i_ , end = i_ + 16; i_0 < end; ++i_0 , val >>= 2) {
        if ((val & 3) != find_0) {
          continue;
        }
        symcord1 = ~~(i_0 / 20160);
        cord1 = sym2raw_0[symcord1];
        cord2 = i_0 % 20160;
        $set_4(e, cord1 * 20160 + cord2);
        for (m_0 = 0; m_0 < 17; ++m_0) {
          cord1x = getmvrot(e.edge, m_0 << 3, 4);
          symcord1x = raw2sym_1[cord1x];
          symx = symcord1x & 7;
          symcord1x >>= 3;
          cord2x = getmvrot(e.edge, m_0 << 3 | symx, 10) % 20160;
          idx = symcord1x * 20160 + cord2x;
          if (getPruning_0(eprun, idx) != chk) {
            continue;
          }
          setPruning_0(eprun, inv?i_0:idx, dep1m3);
          ++done_0;
          if (inv) {
            break;
          }
          symState = symstate[symcord1x];
          if (symState == 1) {
            continue;
          }
          $set_5(f, e);
          $move_4(f, m_0);
          $rotate_0(f, symx);
          for (j = 1; (symState = ~~symState >> 1 & 65535) != 0; ++j) {
            if ((symState & 1) != 1) {
              continue;
            }
            $set_5(g, f);
            $rotate_0(g, j);
            idxx = symcord1x * 20160 + $get_2(g, 10) % 20160;
            if (getPruning_0(eprun, idxx) == chk) {
              setPruning_0(eprun, idxx, dep1m3);
              ++done_0;
            }
          }
        }
      }
    }
    ++depth;
    ($clinit_System() , out_0).println(depth + '\t' + done_0);
  }
}

function getPruning_0(table, index){
  return ~~table[~~index >> 4] >> ((index & 15) << 1) & 3;
}

function getmvrot(ep, mrIdx, end){
  $clinit_Edge3();
  var i_0, idx, mov, movo, v, valh, vall;
  movo = mvroto[mrIdx];
  mov = mvrot[mrIdx];
  idx = 0;
  vall = 1985229328;
  valh = 47768;
  for (i_0 = 0; i_0 < end; ++i_0) {
    v = movo[ep[mov[i_0]]] << 2;
    idx *= 12 - i_0;
    if (v >= 32) {
      idx += ~~valh >> v - 32 & 15;
      valh -= 4368 << v - 32;
    }
     else {
      idx += ~~vall >> v & 15;
      valh -= 4369;
      vall -= 286331152 << v;
    }
  }
  return idx;
}

function getprun(edge){
  $clinit_Edge3();
  var cord1, cord1x, cord2, cord2x, depm3, depth, e, idx, m_0, symcord1, symcord1x, symx;
  e = new Edge3_0;
  depth = 0;
  depm3 = getPruning_0(eprun, edge);
  if (depm3 == 3) {
    return 10;
  }
  while (edge != 0) {
    depm3 == 0?(depm3 = 2):--depm3;
    symcord1 = ~~(edge / 20160);
    cord1 = sym2raw_0[symcord1];
    cord2 = edge % 20160;
    $set_4(e, cord1 * 20160 + cord2);
    for (m_0 = 0; m_0 < 17; ++m_0) {
      cord1x = getmvrot(e.edge, m_0 << 3, 4);
      symcord1x = raw2sym_1[cord1x];
      symx = symcord1x & 7;
      symcord1x >>= 3;
      cord2x = getmvrot(e.edge, m_0 << 3 | symx, 10) % 20160;
      idx = symcord1x * 20160 + cord2x;
      if (getPruning_0(eprun, idx) == depm3) {
        ++depth;
        edge = idx;
        break;
      }
    }
  }
  return depth;
}

function getprun_0(edge, prun){
  $clinit_Edge3();
  var depm3;
  depm3 = getPruning_0(eprun, edge);
  if (depm3 == 3) {
    return 10;
  }
  return (depm3 - prun + 16) % 3 + prun - 1;
}

function initMvrot(){
  $clinit_Edge3();
  var e, i_0, m_0, r;
  e = new Edge3_0;
  for (m_0 = 0; m_0 < 20; ++m_0) {
    for (r = 0; r < 8; ++r) {
      $set_4(e, 0);
      $move_4(e, m_0);
      $rotate_0(e, r);
      for (i_0 = 0; i_0 < 12; ++i_0) {
        mvrot[m_0 << 3 | r][i_0] = e.edge[i_0];
      }
      $std(e);
      for (i_0 = 0; i_0 < 12; ++i_0) {
        mvroto[m_0 << 3 | r][i_0] = e.temp[i_0];
      }
    }
  }
}

function initRaw2Sym(){
  $clinit_Edge3();
  var count, e, i_0, idx, j, occ;
  e = new Edge3_0;
  occ = initDim(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, 1485, 1);
  count = 0;
  for (i_0 = 0; i_0 < 11880; ++i_0) {
    if ((occ[~~i_0 >>> 3] & 1 << (i_0 & 7)) == 0) {
      $set_4(e, i_0 * factX[8]);
      for (j = 0; j < 8; ++j) {
        idx = $get_2(e, 4);
        idx == i_0 && (symstate[count] = (symstate[count] | 1 << j) & 65535);
        occ[~~idx >> 3] = ~~((occ[~~idx >> 3] | 1 << (idx & 7)) << 24) >> 24;
        raw2sym_1[idx] = count << 3 | syminv_0[j];
        $rot_1(e, 0);
        if (j % 2 == 1) {
          $rot_1(e, 1);
          $rot_1(e, 2);
        }
      }
      sym2raw_0[count++] = i_0;
    }
  }
}

function setPruning_0(table, index, value){
  table[~~index >> 4] ^= (3 ^ value) << ((index & 15) << 1);
}

defineSeed(158, 1, makeCastMap([Q$Edge3]), Edge3_0);
_.isStd = true;
_.temp = null;
var FullEdgeMap, done_0 = 0, eprun, factX, mvrot, mvroto, prunValues, raw2sym_1, sym2raw_0, syminv_0, symstate;
function $clinit_EdgeCube(){
  $clinit_EdgeCube = nullMethod;
  EdgeColor = initValues(_3_3I_classLit, makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), Q$int_$1, [initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [2, 0]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [5, 0]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [3, 0]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [4, 0]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [3, 1]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [5, 1]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [2, 1]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [4, 1]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [2, 5]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [3, 5]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [3, 4]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [2, 4])]);
  EdgeMap = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [19, 37, 46, 10, 52, 43, 25, 16, 21, 50, 48, 23, 7, 3, 1, 5, 34, 30, 28, 32, 41, 39, 14, 12]);
}

function $checkEdge(this$static){
  var ck, i_0, parity;
  ck = 0;
  parity = false;
  for (i_0 = 0; i_0 < 12; ++i_0) {
    ck |= 1 << this$static.ep[i_0];
    parity = parity != this$static.ep[i_0] >= 12;
  }
  ck &= ~~ck >> 12;
  return ck == 0 && !parity;
}

function $copy_3(this$static, c){
  var i_0;
  for (i_0 = 0; i_0 < 24; ++i_0) {
    this$static.ep[i_0] = c.ep[i_0];
  }
}

function $fill333Facelet_1(this$static, facelet){
  var i_0;
  for (i_0 = 0; i_0 < 24; ++i_0) {
    facelet[EdgeMap[i_0]] = ($clinit_Util_0() , colorMap4to3)[EdgeColor[this$static.ep[i_0] % 12][~~(this$static.ep[i_0] / 12)]];
  }
}

function $move_5(this$static, m_0){
  var key;
  key = m_0 % 3;
  m_0 = ~~(m_0 / 3);
  switch (m_0) {
    case 0:
      swap(this$static.ep, 0, 1, 2, 3, key);
      swap(this$static.ep, 12, 13, 14, 15, key);
      break;
    case 1:
      swap(this$static.ep, 11, 15, 10, 19, key);
      swap(this$static.ep, 23, 3, 22, 7, key);
      break;
    case 2:
      swap(this$static.ep, 0, 11, 6, 8, key);
      swap(this$static.ep, 12, 23, 18, 20, key);
      break;
    case 3:
      swap(this$static.ep, 4, 5, 6, 7, key);
      swap(this$static.ep, 16, 17, 18, 19, key);
      break;
    case 4:
      swap(this$static.ep, 1, 20, 5, 21, key);
      swap(this$static.ep, 13, 8, 17, 9, key);
      break;
    case 5:
      swap(this$static.ep, 2, 9, 4, 10, key);
      swap(this$static.ep, 14, 21, 16, 22, key);
      break;
    case 6:
      swap(this$static.ep, 0, 1, 2, 3, key);
      swap(this$static.ep, 12, 13, 14, 15, key);
      swap(this$static.ep, 9, 22, 11, 20, key);
      break;
    case 7:
      swap(this$static.ep, 11, 15, 10, 19, key);
      swap(this$static.ep, 23, 3, 22, 7, key);
      swap(this$static.ep, 2, 16, 6, 12, key);
      break;
    case 8:
      swap(this$static.ep, 0, 11, 6, 8, key);
      swap(this$static.ep, 12, 23, 18, 20, key);
      swap(this$static.ep, 3, 19, 5, 13, key);
      break;
    case 9:
      swap(this$static.ep, 4, 5, 6, 7, key);
      swap(this$static.ep, 16, 17, 18, 19, key);
      swap(this$static.ep, 8, 23, 10, 21, key);
      break;
    case 10:
      swap(this$static.ep, 1, 20, 5, 21, key);
      swap(this$static.ep, 13, 8, 17, 9, key);
      swap(this$static.ep, 14, 0, 18, 4, key);
      break;
    case 11:
      swap(this$static.ep, 2, 9, 4, 10, key);
      swap(this$static.ep, 14, 21, 16, 22, key);
      swap(this$static.ep, 7, 15, 1, 17, key);
  }
}

function EdgeCube_0(){
  $clinit_EdgeCube();
  var i_0;
  this.ep = initDim(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, 24, 1);
  for (i_0 = 0; i_0 < 24; ++i_0) {
    this.ep[i_0] = i_0;
  }
}

function EdgeCube_1(r){
  $clinit_EdgeCube();
  var i_0, m_0, t;
  EdgeCube_0.call(this);
  for (i_0 = 0; i_0 < 23; ++i_0) {
    t = i_0 + $nextInt(r, 24 - i_0);
    if (t != i_0) {
      m_0 = this.ep[i_0];
      this.ep[i_0] = this.ep[t];
      this.ep[t] = m_0;
    }
  }
}

defineSeed(159, 1, {}, EdgeCube_0, EdgeCube_1);
var EdgeColor, EdgeMap;
function $clinit_FullCube_0(){
  $clinit_FullCube_0 = nullMethod;
  move2rot = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [35, 1, 34, 2, 4, 6, 22, 5, 19]);
}

function $$init_3(this$static){
  this$static.moveBuffer = initDim(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, 60, 1);
}

function $compareTo_1(this$static, c){
  return this$static.value - c.value;
}

function $copy_4(this$static, c){
  var i_0;
  $copy_3(this$static.edge, c.edge);
  $copy_1(this$static.center, c.center);
  $copy_2(this$static.corner, c.corner);
  this$static.value = c.value;
  this$static.add1 = c.add1;
  this$static.length1 = c.length1;
  this$static.length2 = c.length2;
  this$static.length3 = c.length3;
  this$static.sym = c.sym;
  for (i_0 = 0; i_0 < 60; ++i_0) {
    this$static.moveBuffer[i_0] = c.moveBuffer[i_0];
  }
  this$static.moveLength = c.moveLength;
  this$static.edgeAvail = c.edgeAvail;
  this$static.centerAvail = c.centerAvail;
  this$static.cornerAvail = c.cornerAvail;
}

function $getCenter(this$static){
  while (this$static.centerAvail < this$static.moveLength) {
    $move_2(this$static.center, this$static.moveBuffer[this$static.centerAvail++]);
  }
  return this$static.center;
}

function $getCorner(this$static){
  while (this$static.cornerAvail < this$static.moveLength) {
    $move_3(this$static.corner, this$static.moveBuffer[this$static.cornerAvail++] % 18);
  }
  return this$static.corner;
}

function $getEdge(this$static){
  while (this$static.edgeAvail < this$static.moveLength) {
    $move_5(this$static.edge, this$static.moveBuffer[this$static.edgeAvail++]);
  }
  return this$static.edge;
}

function $getMoveString(this$static){
  var finishSym, fixedMoves, i_0, idx, move, rot, sb, sym;
  fixedMoves = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, this$static.moveLength - (this$static.add1?2:0), 1);
  idx = 0;
  for (i_0 = 0; i_0 < this$static.length1; ++i_0) {
    fixedMoves[idx++] = this$static.moveBuffer[i_0];
  }
  sym = this$static.sym;
  for (i_0 = this$static.length1 + (this$static.add1?2:0); i_0 < this$static.moveLength; ++i_0) {
    if (($clinit_Center1() , symmove)[sym][this$static.moveBuffer[i_0]] >= 27) {
      fixedMoves[idx++] = symmove[sym][this$static.moveBuffer[i_0]] - 9;
      rot = move2rot[symmove[sym][this$static.moveBuffer[i_0]] - 27];
      sym = symmult[sym][rot];
    }
     else {
      fixedMoves[idx++] = symmove[sym][this$static.moveBuffer[i_0]];
    }
  }
  finishSym = ($clinit_Center1() , symmult)[syminv[sym]][getSolvedSym($getCenter(this$static))];
  sb = new StringBuffer_0;
  sym = finishSym;
  for (i_0 = idx - 1; i_0 >= 0; --i_0) {
    move = fixedMoves[i_0];
    move = ~~(move / 3) * 3 + (2 - move % 3);
    if (symmove[sym][move] >= 27) {
      $append($append_2(sb, ($clinit_Moves() , move2str_1)[symmove[sym][move] - 9]));
      rot = move2rot[symmove[sym][move] - 27];
      sym = symmult[sym][rot];
    }
     else {
      $append($append_2(sb, ($clinit_Moves() , move2str_1)[symmove[sym][move]]));
    }
  }
  return sb.impl.toString_0(sb.data);
}

function $move_6(this$static, m_0){
  this$static.moveBuffer[this$static.moveLength++] = ~~(m_0 << 24) >> 24;
  return;
}

function FullCube_3(){
  $clinit_FullCube_0();
  $$init_3(this);
  this.edge = new EdgeCube_0;
  this.center = new CenterCube_0;
  this.corner = new CornerCube_0;
}

function FullCube_4(c){
  $clinit_FullCube_0();
  FullCube_3.call(this);
  $copy_4(this, c);
}

function FullCube_5(r){
  $clinit_FullCube_0();
  $$init_3(this);
  this.edge = new EdgeCube_1(r);
  this.center = new CenterCube_1(r);
  this.corner = new CornerCube_2(r);
}

defineSeed(160, 1, makeCastMap([Q$FullCube_0, Q$Comparable]), FullCube_3, FullCube_4, FullCube_5);
_.compareTo$ = function compareTo_1(c){
  return $compareTo_1(this, dynamicCast(c, Q$FullCube_0));
}
;
_.add1 = false;
_.center = null;
_.centerAvail = 0;
_.corner = null;
_.cornerAvail = 0;
_.edge = null;
_.edgeAvail = 0;
_.length1 = 0;
_.length2 = 0;
_.length3 = 0;
_.moveLength = 0;
_.sym = 0;
_.value = 0;
var move2rot;
function $compare(c1, c2){
  return c2.value - c1.value;
}

function $compare_0(c1, c2){
  return $compare(dynamicCast(c1, Q$FullCube_0), dynamicCast(c2, Q$FullCube_0));
}

function FullCube$ValueComparator_0(){
}

defineSeed(161, 1, {}, FullCube$ValueComparator_0);
_.compare = function compare(c1, c2){
  return $compare_0(c1, c2);
}
;
function $clinit_Moves(){
  $clinit_Moves = nullMethod;
  var i_0, j;
  move2str_1 = initValues(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, ['U  ', 'U2 ', "U' ", 'R  ', 'R2 ', "R' ", 'F  ', 'F2 ', "F' ", 'D  ', 'D2 ', "D' ", 'L  ', 'L2 ', "L' ", 'B  ', 'B2 ', "B' ", 'Uw ', 'Uw2', "Uw'", 'Rw ', 'Rw2', "Rw'", 'Fw ', 'Fw2', "Fw'", 'Dw ', 'Dw2', "Dw'", 'Lw ', 'Lw2', "Lw'", 'Bw ', 'Bw2', "Bw'"]);
  move2std = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 21, 22, 23, 25, 28, 30, 31, 32, 34, 36]);
  move3std = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [0, 1, 2, 4, 6, 7, 8, 9, 10, 11, 13, 15, 16, 17, 19, 22, 25, 28, 31, 34, 36]);
  std2move = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 37, 1);
  std3move = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 37, 1);
  ckmv = initDims([_3_3Z_classLit, _3Z_classLit], [makeCastMap([Q$Serializable, Q$Object_$1]), makeCastMap([Q$boolean_$1, Q$Serializable])], [Q$boolean_$1, -1], [37, 36], 2, 2);
  ckmv2_0 = initDims([_3_3Z_classLit, _3Z_classLit], [makeCastMap([Q$Serializable, Q$Object_$1]), makeCastMap([Q$boolean_$1, Q$Serializable])], [Q$boolean_$1, -1], [29, 28], 2, 2);
  ckmv3 = initDims([_3_3Z_classLit, _3Z_classLit], [makeCastMap([Q$Serializable, Q$Object_$1]), makeCastMap([Q$boolean_$1, Q$Serializable])], [Q$boolean_$1, -1], [21, 20], 2, 2);
  skipAxis = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 36, 1);
  skipAxis2 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 28, 1);
  skipAxis3 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 20, 1);
  for (i_0 = 0; i_0 < 29; ++i_0) {
    std2move[move2std[i_0]] = i_0;
  }
  for (i_0 = 0; i_0 < 21; ++i_0) {
    std3move[move3std[i_0]] = i_0;
  }
  for (i_0 = 0; i_0 < 36; ++i_0) {
    for (j = 0; j < 36; ++j) {
      ckmv[i_0][j] = ~~(i_0 / 3) == ~~(j / 3) || ~~(i_0 / 3) % 3 == ~~(j / 3) % 3 && i_0 > j;
    }
    ckmv[36][i_0] = false;
  }
  for (i_0 = 0; i_0 < 29; ++i_0) {
    for (j = 0; j < 28; ++j) {
      ckmv2_0[i_0][j] = ckmv[move2std[i_0]][move2std[j]];
    }
  }
  for (i_0 = 0; i_0 < 21; ++i_0) {
    for (j = 0; j < 20; ++j) {
      ckmv3[i_0][j] = ckmv[move3std[i_0]][move3std[j]];
    }
  }
  for (i_0 = 0; i_0 < 36; ++i_0) {
    skipAxis[i_0] = 36;
    for (j = i_0; j < 36; ++j) {
      if (!ckmv[i_0][j]) {
        skipAxis[i_0] = j - 1;
        break;
      }
    }
  }
  for (i_0 = 0; i_0 < 28; ++i_0) {
    skipAxis2[i_0] = 28;
    for (j = i_0; j < 28; ++j) {
      if (!ckmv2_0[i_0][j]) {
        skipAxis2[i_0] = j - 1;
        break;
      }
    }
  }
  for (i_0 = 0; i_0 < 20; ++i_0) {
    skipAxis3[i_0] = 20;
    for (j = i_0; j < 20; ++j) {
      if (!ckmv3[i_0][j]) {
        skipAxis3[i_0] = j - 1;
        break;
      }
    }
  }
}

var ckmv, ckmv2_0, ckmv3, move2std, move2str_1, move3std, skipAxis, skipAxis2, skipAxis3, std2move, std3move;
function $doSearch(this$static){
  var MAX_LENGTH2, MAX_LENGTH3, ct, edge, eparity, facelet, fb, fbprun, i_0, index, length_0, length12, length123, p1SolsArr, prun, rl, rlprun, s2ct, s2rl, sol, sol333, solcnt, solcube, str, ud, udprun, ret;
  init_5();
  this$static.solution = '';
  ud = $getsym(new Center1_1($getCenter(this$static.c), 0));
  fb = $getsym(new Center1_1($getCenter(this$static.c), 1));
  rl = $getsym(new Center1_1($getCenter(this$static.c), 2));
  udprun = ($clinit_Center1() , csprun)[~~ud >> 6];
  fbprun = csprun[~~fb >> 6];
  rlprun = csprun[~~rl >> 6];
  this$static.p1SolsCnt = 0;
  this$static.arr2idx = 0;
  $clear(this$static.p1sols.heap);
  for (this$static.length1 = (udprun < fbprun?udprun:fbprun) < rlprun?udprun < fbprun?udprun:fbprun:rlprun; this$static.length1 < 100; ++this$static.length1) {
    if (rlprun <= this$static.length1 && $search1(this$static, ~~rl >>> 6, rl & 63, this$static.length1, -1, 0) || udprun <= this$static.length1 && $search1(this$static, ~~ud >>> 6, ud & 63, this$static.length1, -1, 0) || fbprun <= this$static.length1 && $search1(this$static, ~~fb >>> 6, fb & 63, this$static.length1, -1, 0)) {
      break;
    }
  }
  p1SolsArr = dynamicCast($toArray_1(this$static.p1sols, initDim(_3Lcs_threephase_FullCube_2_classLit, makeCastMap([Q$FullCube_$1, Q$Serializable, Q$Object_$1]), Q$FullCube_0, 0, 0)), Q$FullCube_$1);
  mergeSort(p1SolsArr, 0, p1SolsArr.length, ($clinit_Comparators() , $clinit_Comparators() , NATURAL));
  MAX_LENGTH2 = 9;
  do {
    OUT: for (length12 = p1SolsArr[0].value; length12 < 100; ++length12) {
      for (i_0 = 0; i_0 < p1SolsArr.length; ++i_0) {
        if (p1SolsArr[i_0].value > length12) {
          break;
        }
        if (length12 - p1SolsArr[i_0].length1 > MAX_LENGTH2) {
          continue;
        }
        $copy_4(this$static.c1, p1SolsArr[i_0]);
        $set_2(this$static.ct2, $getCenter(this$static.c1), parity_0($getEdge(this$static.c1).ep));
        s2ct = $getct(this$static.ct2);
        s2rl = $getrl(this$static.ct2);
        this$static.length1 = p1SolsArr[i_0].length1;
        this$static.length2 = length12 - p1SolsArr[i_0].length1;
        if ($search2(this$static, s2ct, s2rl, this$static.length2, 28, 0)) {
          break OUT;
        }
      }
    }
    ++MAX_LENGTH2;
  }
   while (length12 == 100);
  mergeSort(this$static.arr2, 0, this$static.arr2idx, NATURAL);
  index = 0;
  solcnt = 0;
  MAX_LENGTH3 = 13;
  do {
    OUT2: for (length123 = this$static.arr2[0].value; length123 < 100; ++length123) {
      for (i_0 = 0; i_0 < min(this$static.arr2idx, 100); ++i_0) {
        if (this$static.arr2[i_0].value > length123) {
          break;
        }
        if (length123 - this$static.arr2[i_0].length1 - this$static.arr2[i_0].length2 > MAX_LENGTH3) {
          continue;
        }
        eparity = $set_6(this$static.e12, $getEdge(this$static.arr2[i_0]));
        $set_3(this$static.ct3, $getCenter(this$static.arr2[i_0]), eparity ^ parity_0($getCorner(this$static.arr2[i_0]).cp));
        ct = $getct_0(this$static.ct3);
        edge = $get_2(this$static.e12, 10);
        prun = getprun($getsym_0(this$static.e12));
        if (prun <= length123 - this$static.arr2[i_0].length1 - this$static.arr2[i_0].length2 && $search3(this$static, edge, ct, prun, length123 - this$static.arr2[i_0].length1 - this$static.arr2[i_0].length2, 20, 0)) {
          ++solcnt;
          index = i_0;
          break OUT2;
        }
      }
    }
    ++MAX_LENGTH3;
  }
   while (length123 == 100);
  solcube = new FullCube_4(this$static.arr2[index]);
  this$static.length1 = solcube.length1;
  this$static.length2 = solcube.length2;
  length_0 = length123 - this$static.length1 - this$static.length2;
  for (i_0 = 0; i_0 < length_0; ++i_0) {
    $move_6(solcube, ($clinit_Moves() , move3std)[this$static.move3[i_0]]);
  }
  facelet = (ret = initDim(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, 54, 1) , $fill333Facelet_1($getEdge(solcube), ret) , $fill333Facelet($getCenter(solcube), ret) , $fill333Facelet_0($getCorner(solcube), ret) , valueOf_1(ret));
  sol = $solution(this$static.search333, facelet, 20, P64_longLit, P32_longLit, 0, null, null);
  sol.indexOf('Error 8') == 0 && (sol = $solution(this$static.search333, facelet, 21, Pf4240_longLit, P1e_longLit, 0, null, null));
  ~~(sol.length / 3);
  if (sol.indexOf('Error') == 0) {
    ($clinit_System() , out_0).println(sol);
    throw new RuntimeException_0;
  }
  sol333 = tomove(sol);
  for (i_0 = 0; i_0 < sol333.length; ++i_0) {
    $move_6(solcube, sol333[i_0]);
  }
  str = new StringBuffer_0;
  $append_2(str, $getMoveString(solcube));
  this$static.solution = str.impl.toString_0(str.data);
}

function $init2_0(this$static, sym){
  var ctp, i_0, next, s2ct, s2rl;
  $copy_4(this$static.c1, this$static.c);
  for (i_0 = 0; i_0 < this$static.length1; ++i_0) {
    $move_6(this$static.c1, this$static.move1[i_0]);
  }
  switch (($clinit_Center1() , finish_0)[sym]) {
    case 0:
      $move_6(this$static.c1, 24);
      $move_6(this$static.c1, 35);
      this$static.move1[this$static.length1] = 24;
      this$static.move1[this$static.length1 + 1] = 35;
      this$static.add1 = true;
      sym = 19;
      break;
    case 12869:
      $move_6(this$static.c1, 18);
      $move_6(this$static.c1, 29);
      this$static.move1[this$static.length1] = 18;
      this$static.move1[this$static.length1 + 1] = 29;
      this$static.add1 = true;
      sym = 34;
      break;
    case 735470:
      this$static.add1 = false;
      sym = 0;
  }
  $set_2(this$static.ct2, $getCenter(this$static.c1), parity_0($getEdge(this$static.c1).ep));
  s2ct = $getct(this$static.ct2);
  s2rl = $getrl(this$static.ct2);
  ctp = ($clinit_Center2() , ctprun)[s2ct * 70 + s2rl];
  this$static.c1.value = ctp + this$static.length1;
  this$static.c1.length1 = this$static.length1;
  this$static.c1.add1 = this$static.add1;
  this$static.c1.sym = sym;
  ++this$static.p1SolsCnt;
  if (this$static.p1sols.heap.size < 500) {
    next = new FullCube_4(this$static.c1);
  }
   else {
    next = dynamicCast($poll(this$static.p1sols), Q$FullCube_0);
    next.value > this$static.c1.value && $copy_4(next, this$static.c1);
  }
  $add(this$static.p1sols, next);
  return this$static.p1SolsCnt == 10000;
}

function $init3(this$static){
  var ct, eparity, i_0, prun;
  $copy_4(this$static.c2, this$static.c1);
  for (i_0 = 0; i_0 < this$static.length2; ++i_0) {
    $move_6(this$static.c2, this$static.move2[i_0]);
  }
  if (!$checkEdge($getEdge(this$static.c2))) {
    return false;
  }
  eparity = $set_6(this$static.e12, $getEdge(this$static.c2));
  $set_3(this$static.ct3, $getCenter(this$static.c2), eparity ^ parity_0($getCorner(this$static.c2).cp));
  ct = $getct_0(this$static.ct3);
  $get_2(this$static.e12, 10);
  prun = getprun($getsym_0(this$static.e12));
  !this$static.arr2[this$static.arr2idx]?(this$static.arr2[this$static.arr2idx] = new FullCube_4(this$static.c2)):$copy_4(this$static.arr2[this$static.arr2idx], this$static.c2);
  this$static.arr2[this$static.arr2idx].value = this$static.length1 + this$static.length2 + max(prun, ($clinit_Center3() , prun_0)[ct]);
  this$static.arr2[this$static.arr2idx].length2 = this$static.length2;
  ++this$static.arr2idx;
  return this$static.arr2idx == this$static.arr2.length;
}

function $randomState(this$static, r){
  this$static.c = new FullCube_5(r);
  $doSearch(this$static);
  return this$static.solution;
}

function $search1(this$static, ct, sym, maxl, lm, depth){
  var axis, ctx, m_0, power, prun, symx;
  if (ct == 0) {
    return maxl == 0 && $init2_0(this$static, sym);
  }
  for (axis = 0; axis < 27; axis += 3) {
    if (axis == lm || axis == lm - 9 || axis == lm - 18) {
      continue;
    }
    for (power = 0; power < 3; ++power) {
      m_0 = axis + power;
      ctx = ($clinit_Center1() , ctsmv)[ct][symmove[sym][m_0]];
      prun = csprun[~~ctx >>> 6];
      if (prun >= maxl) {
        if (prun > maxl) {
          break;
        }
        continue;
      }
      symx = symmult[sym][ctx & 63];
      ctx >>>= 6;
      this$static.move1[depth] = m_0;
      if ($search1(this$static, ctx, symx, maxl - 1, axis, depth + 1)) {
        return true;
      }
    }
  }
  return false;
}

function $search2(this$static, ct, rl, maxl, lm, depth){
  var ctx, m_0, prun, rlx;
  if (ct == 0 && ($clinit_Center2() , ctprun)[rl] == 0) {
    return maxl == 0 && $init3(this$static);
  }
  for (m_0 = 0; m_0 < 23; ++m_0) {
    if (($clinit_Moves() , ckmv2_0)[lm][m_0]) {
      m_0 = skipAxis2[m_0];
      continue;
    }
    ctx = ($clinit_Center2() , ctmv)[ct][m_0];
    rlx = rlmv[rl][m_0];
    prun = ctprun[ctx * 70 + rlx];
    if (prun >= maxl) {
      prun > maxl && (m_0 = skipAxis2[m_0]);
      continue;
    }
    this$static.move2[depth] = move2std[m_0];
    if ($search2(this$static, ctx, rlx, maxl - 1, m_0, depth + 1)) {
      return true;
    }
  }
  return false;
}

function $search3(this$static, edge, ct, prun, maxl, lm, depth){
  var cord1x, cord2x, ctx, edgex, m_0, prun1, prunx, symcord1x, symx;
  if (maxl == 0) {
    return edge == 0 && ct == 0;
  }
  $set_4(this$static.tempe[depth], edge);
  for (m_0 = 0; m_0 < 17; ++m_0) {
    if (($clinit_Moves() , ckmv3)[lm][m_0]) {
      m_0 = skipAxis3[m_0];
      continue;
    }
    ctx = ($clinit_Center3() , ctmove)[ct][m_0];
    prun1 = prun_0[ctx];
    if (prun1 >= maxl) {
      prun1 > maxl && m_0 < 14 && (m_0 = skipAxis3[m_0]);
      continue;
    }
    edgex = getmvrot(this$static.tempe[depth].edge, m_0 << 3, 10);
    cord1x = ~~(edgex / 20160);
    symcord1x = ($clinit_Edge3() , raw2sym_1)[cord1x];
    symx = symcord1x & 7;
    symcord1x >>= 3;
    cord2x = getmvrot(this$static.tempe[depth].edge, m_0 << 3 | symx, 10) % 20160;
    prunx = getprun_0(symcord1x * 20160 + cord2x, prun);
    if (prunx >= maxl) {
      prunx > maxl && m_0 < 14 && (m_0 = skipAxis3[m_0]);
      continue;
    }
    if ($search3(this$static, edgex, ctx, prunx, maxl - 1, m_0, depth + 1)) {
      this$static.move3[depth] = m_0;
      return true;
    }
  }
  return false;
}

function Search_4(){
  var i_0;
  this.p1sols = new PriorityQueue_0(new FullCube$ValueComparator_0);
  this.move1 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 15, 1);
  this.move2 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 20, 1);
  this.move3 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 20, 1);
  this.c1 = new FullCube_3;
  this.c2 = new FullCube_3;
  this.ct2 = new Center2_0;
  this.ct3 = new Center3_0;
  this.e12 = new Edge3_0;
  this.tempe = initDim(_3Lcs_threephase_Edge3_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$Edge3, 20, 0);
  this.search333 = new Search_0;
  this.arr2 = initDim(_3Lcs_threephase_FullCube_2_classLit, makeCastMap([Q$FullCube_$1, Q$Serializable, Q$Object_$1]), Q$FullCube_0, 100, 0);
  for (i_0 = 0; i_0 < 20; ++i_0) {
    this.tempe[i_0] = new Edge3_0;
  }
}

function init_5(){
  if (inited_2) {
    return;
  }
  init_0();
  ($clinit_System() , out_0).println('Initialize Center1 Solver...');
  initSym_0();
  $clinit_Center1();
  raw2sym = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 735471, 1);
  initSym2Raw();
  createMoveTable();
  raw2sym = null;
  createPrun();
  out_0.println('Initialize Center2 Solver...');
  init_3();
  out_0.println('Initialize Center3 Solver...');
  init_4();
  out_0.println('Initialize Edge3 Solver...');
  initMvrot();
  initRaw2Sym();
  createPrun_0();
  out_0.println('OK');
  inited_2 = true;
}

defineSeed(163, 1, makeCastMap([Q$Search_0]), Search_4);
_.add1 = false;
_.arr2idx = 0;
_.c = null;
_.length1 = 0;
_.length2 = 0;
_.p1SolsCnt = 0;
_.solution = '';
var inited_2 = false;
function $clinit_Util_0(){
  $clinit_Util_0 = nullMethod;
  var i_0, j;
  Cnk_1 = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [25, 25], 2, 1);
  fact_1 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 13, 1);
  colorMap4to3 = initValues(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, [85, 68, 70, 66, 82, 76]);
  for (i_0 = 0; i_0 < 25; ++i_0) {
    Cnk_1[i_0][i_0] = 1;
    Cnk_1[i_0][0] = 1;
  }
  for (i_0 = 1; i_0 < 25; ++i_0) {
    for (j = 1; j <= i_0; ++j) {
      Cnk_1[i_0][j] = Cnk_1[i_0 - 1][j] + Cnk_1[i_0 - 1][j - 1];
    }
  }
  fact_1[0] = 1;
  for (i_0 = 0; i_0 < 12; ++i_0) {
    fact_1[i_0 + 1] = fact_1[i_0] * (i_0 + 1);
  }
}

function parity_0(arr){
  $clinit_Util_0();
  var i_0, j, len, parity;
  parity = 0;
  for (i_0 = 0 , len = arr.length; i_0 < len; ++i_0) {
    for (j = i_0; j < len; ++j) {
      arr[i_0] > arr[j] && (parity ^= 1);
    }
  }
  return parity;
}

function set8Perm_1(arr, idx){
  $clinit_Util_0();
  var i_0, m_0, p_0, v, val;
  val = 1985229328;
  for (i_0 = 0; i_0 < 7; ++i_0) {
    p_0 = fact_1[7 - i_0];
    v = ~~(idx / p_0);
    idx -= v * p_0;
    v <<= 2;
    arr[i_0] = ~~((~~val >> v & 15) << 24) >> 24;
    m_0 = (1 << v) - 1;
    val = (val & m_0) + (~~val >> 4 & ~m_0);
  }
  arr[7] = ~~(val << 24) >> 24;
}

function swap(arr, a, b, c, d, key){
  $clinit_Util_0();
  var temp;
  switch (key) {
    case 0:
      temp = arr[d];
      arr[d] = arr[c];
      arr[c] = arr[b];
      arr[b] = arr[a];
      arr[a] = temp;
      return;
    case 1:
      temp = arr[a];
      arr[a] = arr[c];
      arr[c] = temp;
      temp = arr[b];
      arr[b] = arr[d];
      arr[d] = temp;
      return;
    case 2:
      temp = arr[a];
      arr[a] = arr[b];
      arr[b] = arr[c];
      arr[c] = arr[d];
      arr[d] = temp;
      return;
  }
}

function swap_0(arr, a, b, c, d, key){
  $clinit_Util_0();
  var temp;
  switch (key) {
    case 0:
      temp = arr[d];
      arr[d] = arr[c];
      arr[c] = arr[b];
      arr[b] = arr[a];
      arr[a] = temp;
      return;
    case 1:
      temp = arr[a];
      arr[a] = arr[c];
      arr[c] = temp;
      temp = arr[b];
      arr[b] = arr[d];
      arr[d] = temp;
      return;
    case 2:
      temp = arr[a];
      arr[a] = arr[b];
      arr[b] = arr[c];
      arr[c] = arr[d];
      arr[d] = temp;
      return;
  }
}

function tomove(s){
  $clinit_Util_0();
  var arr, axis, i_0, j, length_0, ret;
  s = $replaceAll(s, '\\s', '');
  arr = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, s.length, 1);
  j = 0;
  for (i_0 = 0 , length_0 = s.length; i_0 < length_0; ++i_0) {
    switch (s.charCodeAt(i_0)) {
      case 85:
        axis = 0;
        break;
      case 82:
        axis = 1;
        break;
      case 70:
        axis = 2;
        break;
      case 68:
        axis = 3;
        break;
      case 76:
        axis = 4;
        break;
      case 66:
        axis = 5;
        break;
      case 117:
        axis = 6;
        break;
      case 114:
        axis = 7;
        break;
      case 102:
        axis = 8;
        break;
      case 100:
        axis = 9;
        break;
      case 108:
        axis = 10;
        break;
      case 98:
        axis = 11;
        break;
      default:continue;
    }
    axis *= 3;
    if (++i_0 < length_0) {
      switch (s.charCodeAt(i_0)) {
        case 50:
          ++axis;
          break;
        case 39:
          axis += 2;
          break;
        default:--i_0;
      }
    }
    arr[j++] = axis;
  }
  ret = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, j, 1);
  while (--j >= 0) {
    ret[j] = arr[j];
  }
  return ret;
}

var Cnk_1, colorMap4to3, fact_1;
defineSeed(166, 1, {});
defineSeed(165, 166, {});
function PrintStream_0(){
}

defineSeed(167, 165, {}, PrintStream_0);
_.print_0 = function print_0(x){
}
;
_.println = function println(s){
}
;
function ArithmeticException_0(){
  RuntimeException_1.call(this, 'divide by zero');
}

defineSeed(168, 6, makeCastMap([Q$Serializable, Q$Exception, Q$Throwable]), ArithmeticException_0);
function ArrayStoreException_0(){
  RuntimeException_0.call(this);
}

function ArrayStoreException_1(message){
  RuntimeException_1.call(this, message);
}

defineSeed(169, 6, makeCastMap([Q$Serializable, Q$Exception, Q$Throwable]), ArrayStoreException_0, ArrayStoreException_1);
function Error_1(message, cause){
  Throwable_1.call(this, message, cause);
}

defineSeed(171, 8, makeCastMap([Q$Serializable, Q$Throwable]));
function AssertionError_0(){
  Throwable_0.call(this);
}

function AssertionError_1(message){
  Error_1.call(this, '' + message, instanceOf(message, Q$Throwable)?dynamicCast(message, Q$Throwable):null);
}

defineSeed(170, 171, makeCastMap([Q$Serializable, Q$Throwable]), AssertionError_0, AssertionError_1);
function $clinit_Boolean(){
  $clinit_Boolean = nullMethod;
  FALSE_0 = new Boolean_1(false);
  TRUE_0 = new Boolean_1(true);
}

function $compareTo_2(this$static, other){
  return this$static.value == other.value?0:this$static.value?1:-1;
}

function Boolean_1(value){
  this.value = value;
}

defineSeed(172, 1, makeCastMap([Q$Serializable, Q$Boolean, Q$Comparable]), Boolean_1);
_.compareTo$ = function compareTo_2(other){
  return $compareTo_2(this, dynamicCast(other, Q$Boolean));
}
;
_.equals$ = function equals_7(o){
  return instanceOf(o, Q$Boolean) && dynamicCast(o, Q$Boolean).value == this.value;
}
;
_.hashCode$ = function hashCode_8(){
  return this.value?1231:1237;
}
;
_.toString$ = function toString_14(){
  return this.value?'true':'false';
}
;
_.value = false;
var FALSE_0, TRUE_0;
function codePointAt(cs, index, limit){
  var hiSurrogate, loSurrogate;
  hiSurrogate = $charAt(cs, index++);
  if (hiSurrogate >= 55296 && hiSurrogate <= 56319 && index < limit && isLowSurrogate(loSurrogate = cs.charCodeAt(index))) {
    return 65536 + ((hiSurrogate & 1023) << 10) + (loSurrogate & 1023);
  }
  return hiSurrogate;
}

function digit_0(c, radix){
  if (radix < 2 || radix > 36) {
    return -1;
  }
  if (c >= 48 && c < 48 + (radix < 10?radix:10)) {
    return c - 48;
  }
  if (c >= 97 && c < radix + 97 - 10) {
    return c - 97 + 10;
  }
  if (c >= 65 && c < radix + 65 - 10) {
    return c - 65 + 10;
  }
  return -1;
}

function isLowSurrogate(ch){
  return ch >= 56320 && ch <= 57343;
}

function Class_0(){
}

function createForArray(packageName, className, seedId, componentType){
  var clazz;
  clazz = new Class_0;
  clazz.typeName = packageName + className;
  isInstantiable(seedId != 0?-seedId:0) && setClassLiteral(seedId != 0?-seedId:0, clazz);
  clazz.modifiers = 4;
  clazz.superclass = Ljava_lang_Object_2_classLit;
  clazz.componentType = componentType;
  return clazz;
}

function createForClass(packageName, className, seedId, superclass){
  var clazz;
  clazz = new Class_0;
  clazz.typeName = packageName + className;
  isInstantiable(seedId) && setClassLiteral(seedId, clazz);
  clazz.superclass = superclass;
  return clazz;
}

function createForEnum(packageName, className, seedId, superclass, enumConstantsFunc){
  var clazz;
  clazz = new Class_0;
  clazz.typeName = packageName + className;
  isInstantiable(seedId) && setClassLiteral(seedId, clazz);
  clazz.modifiers = enumConstantsFunc?8:0;
  clazz.superclass = superclass;
  return clazz;
}

function createForInterface(packageName, className){
  var clazz;
  clazz = new Class_0;
  clazz.typeName = packageName + className;
  isInstantiable(0) && setClassLiteral(0, clazz);
  clazz.modifiers = 2;
  return clazz;
}

function createForPrimitive(className, seedId){
  var clazz;
  clazz = new Class_0;
  clazz.typeName = '' + className;
  isInstantiable(seedId) && setClassLiteral(seedId, clazz);
  clazz.modifiers = 1;
  return clazz;
}

function getSeedFunction(clazz){
  var func = seedTable[clazz.seedId];
  clazz = null;
  return func;
}

function isInstantiable(seedId){
  return typeof seedId == 'number' && seedId > 0;
}

function setClassLiteral(seedId, clazz){
  var proto;
  clazz.seedId = seedId;
  if (seedId == 2) {
    proto = String.prototype;
  }
   else {
    if (seedId > 0) {
      var seed = getSeedFunction(clazz);
      if (seed) {
        proto = seed.prototype;
      }
       else {
        seed = seedTable[seedId] = function(){
        }
        ;
        seed.___clazz$ = clazz;
        return;
      }
    }
     else {
      return;
    }
  }
  proto.___clazz$ = clazz;
}

defineSeed(174, 1, makeCastMap([Q$Class]), Class_0);
_.toString$ = function toString_15(){
  return ((this.modifiers & 2) != 0?'interface ':(this.modifiers & 1) != 0?'':'class ') + this.typeName;
}
;
_.componentType = null;
_.modifiers = 0;
_.seedId = 0;
_.superclass = null;
_.typeName = null;
function ClassCastException_0(){
  RuntimeException_0.call(this);
}

defineSeed(175, 6, makeCastMap([Q$Serializable, Q$Exception, Q$Throwable]), ClassCastException_0);
function __parseAndValidateInt(s, radix){
  var i_0, length_0, startIndex, toReturn;
  if (s == null) {
    throw new NumberFormatException_0('null');
  }
  if (radix < 2 || radix > 36) {
    throw new NumberFormatException_0('radix ' + radix + ' out of range');
  }
  length_0 = s.length;
  startIndex = length_0 > 0 && s.charCodeAt(0) == 45?1:0;
  for (i_0 = startIndex; i_0 < length_0; ++i_0) {
    if (digit_0(s.charCodeAt(i_0), radix) == -1) {
      throw new NumberFormatException_0('For input string: "' + s + '"');
    }
  }
  toReturn = parseInt(s, radix);
  if (isNaN(toReturn)) {
    throw new NumberFormatException_0('For input string: "' + s + '"');
  }
   else if (toReturn < -2147483648 || toReturn > 2147483647) {
    throw new NumberFormatException_0('For input string: "' + s + '"');
  }
  return toReturn;
}

defineSeed(177, 1, makeCastMap([Q$Serializable, Q$Number]));
function $compareTo_3(this$static, b){
  return compare_0(this$static.value, b.value);
}

function Double_0(value){
  this.value = value;
}

function compare_0(x, y){
  if (isNaN(x)) {
    return isNaN(y)?0:1;
  }
   else if (isNaN(y)) {
    return -1;
  }
  return x < y?-1:x > y?1:0;
}

defineSeed(176, 177, makeCastMap([Q$Serializable, Q$Comparable, Q$Double, Q$Number]), Double_0);
_.compareTo$ = function compareTo_3(b){
  return $compareTo_3(this, dynamicCast(b, Q$Double));
}
;
_.equals$ = function equals_8(o){
  return instanceOf(o, Q$Double) && dynamicCast(o, Q$Double).value == this.value;
}
;
_.hashCode$ = function hashCode_9(){
  return round_int(this.value);
}
;
_.toString$ = function toString_16(){
  return '' + this.value;
}
;
_.value = 0;
function IllegalArgumentException_0(){
  RuntimeException_0.call(this);
}

function IllegalArgumentException_1(message){
  RuntimeException_1.call(this, message);
}

defineSeed(178, 6, makeCastMap([Q$Serializable, Q$Exception, Q$Throwable]), IllegalArgumentException_0, IllegalArgumentException_1);
function IllegalStateException_0(){
  RuntimeException_0.call(this);
}

function IllegalStateException_1(s){
  RuntimeException_1.call(this, s);
}

defineSeed(179, 6, makeCastMap([Q$Serializable, Q$Exception, Q$Throwable]), IllegalStateException_0, IllegalStateException_1);
function IndexOutOfBoundsException_0(){
  RuntimeException_0.call(this);
}

function IndexOutOfBoundsException_1(message){
  RuntimeException_1.call(this, message);
}

defineSeed(180, 6, makeCastMap([Q$Serializable, Q$Exception, Q$Throwable]), IndexOutOfBoundsException_0, IndexOutOfBoundsException_1);
function $compareTo_4(this$static, b){
  return this$static.value < b.value?-1:this$static.value > b.value?1:0;
}

function Integer_0(value){
  this.value = value;
}

function bitCount(x){
  x -= ~~x >> 1 & 1431655765;
  x = (~~x >> 2 & 858993459) + (x & 858993459);
  x = (~~x >> 4) + x & 252645135;
  x += ~~x >> 8;
  x += ~~x >> 16;
  return x & 63;
}

function numberOfLeadingZeros_0(i_0){
  var m_0, n, y;
  if (i_0 < 0) {
    return 0;
  }
   else if (i_0 == 0) {
    return 32;
  }
   else {
    y = -(~~i_0 >> 16);
    m_0 = ~~y >> 16 & 16;
    n = 16 - m_0;
    i_0 = ~~i_0 >> m_0;
    y = i_0 - 256;
    m_0 = ~~y >> 16 & 8;
    n += m_0;
    i_0 <<= m_0;
    y = i_0 - 4096;
    m_0 = ~~y >> 16 & 4;
    n += m_0;
    i_0 <<= m_0;
    y = i_0 - 16384;
    m_0 = ~~y >> 16 & 2;
    n += m_0;
    i_0 <<= m_0;
    y = ~~i_0 >> 14;
    m_0 = y & ~(~~y >> 1);
    return n + 2 - m_0;
  }
}

function numberOfTrailingZeros(i_0){
  var r, rtn;
  if (i_0 == 0) {
    return 32;
  }
   else {
    rtn = 0;
    for (r = 1; (r & i_0) == 0; r <<= 1) {
      ++rtn;
    }
    return rtn;
  }
}

function toPowerOfTwoString(value){
  var buf, digits, pos;
  buf = initDim(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, 8, 1);
  digits = ($clinit_Number$__Digits() , digits_0);
  pos = 7;
  if (value >= 0) {
    while (value > 15) {
      buf[pos--] = digits[value & 15];
      value >>= 4;
    }
  }
   else {
    while (pos > 0) {
      buf[pos--] = digits[value & 15];
      value >>= 4;
    }
  }
  buf[pos] = digits[value & 15];
  return __valueOf(buf, pos, 8);
}

function valueOf_0(i_0){
  var rebase, result;
  if (i_0 > -129 && i_0 < 128) {
    rebase = i_0 + 128;
    result = ($clinit_Integer$BoxedValues() , boxedValues_0)[rebase];
    !result && (result = boxedValues_0[rebase] = new Integer_0(i_0));
    return result;
  }
  return new Integer_0(i_0);
}

defineSeed(181, 177, makeCastMap([Q$Serializable, Q$Comparable, Q$Integer, Q$Number]), Integer_0);
_.compareTo$ = function compareTo_4(b){
  return $compareTo_4(this, dynamicCast(b, Q$Integer));
}
;
_.equals$ = function equals_9(o){
  return instanceOf(o, Q$Integer) && dynamicCast(o, Q$Integer).value == this.value;
}
;
_.hashCode$ = function hashCode_10(){
  return this.value;
}
;
_.toString$ = function toString_17(){
  return '' + this.value;
}
;
_.value = 0;
function $clinit_Integer$BoxedValues(){
  $clinit_Integer$BoxedValues = nullMethod;
  boxedValues_0 = initDim(_3Ljava_lang_Integer_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$Integer, 256, 0);
}

var boxedValues_0;
function signum(i_0){
  return eq(i_0, P0_longLit)?0:lt(i_0, P0_longLit)?-1:1;
}

function ceil(x){
  return Math.ceil(x);
}

function cos_0(x){
  return Math.cos(x);
}

function floor(x){
  return Math.floor(x);
}

function max(x, y){
  return x > y?x:y;
}

function min(x, y){
  return x < y?x:y;
}

function sin_0(x){
  return Math.sin(x);
}

function sqrt(x){
  return Math.sqrt(x);
}

function NullPointerException_0(){
  RuntimeException_0.call(this);
}

function NullPointerException_1(message){
  RuntimeException_1.call(this, message);
}

defineSeed(185, 6, makeCastMap([Q$Serializable, Q$Exception, Q$Throwable]), NullPointerException_0, NullPointerException_1);
function $clinit_Number$__Digits(){
  $clinit_Number$__Digits = nullMethod;
  digits_0 = initValues(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, [48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122]);
}

var digits_0;
function NumberFormatException_0(message){
  IllegalArgumentException_1.call(this, message);
}

defineSeed(187, 178, makeCastMap([Q$Serializable, Q$Exception, Q$Throwable]), NumberFormatException_0);
function $toString_0(this$static){
  return this$static.className + '.' + this$static.methodName + '(' + (this$static.fileName != null?this$static.fileName:'Unknown Source') + (this$static.lineNumber >= 0?':' + this$static.lineNumber:'') + ')';
}

function StackTraceElement_0(methodName, fileName, lineNumber){
  this.className = 'Unknown';
  this.methodName = methodName;
  this.fileName = fileName;
  this.lineNumber = lineNumber;
}

defineSeed(188, 1, makeCastMap([Q$Serializable, Q$StackTraceElement]), StackTraceElement_0);
_.toString$ = function toString_18(){
  return $toString_0(this);
}
;
_.className = null;
_.fileName = null;
_.lineNumber = 0;
_.methodName = null;
function $charAt(this$static, index){
  return this$static.charCodeAt(index);
}

function $equals_0(this$static, other){
  if (!instanceOf(other, Q$String)) {
    return false;
  }
  return String(this$static) == other;
}

function $equalsIgnoreCase(this$static, other){
  if (other == null)
    return false;
  return this$static == other || this$static.toLowerCase() == other.toLowerCase();
}

function $getChars(this$static, srcEnd, dst, dstBegin){
  var srcIdx;
  for (srcIdx = 0; srcIdx < srcEnd; ++srcIdx) {
    dst[dstBegin++] = this$static.charCodeAt(srcIdx);
  }
}

function $indexOf(this$static, str){
  return this$static.indexOf(str);
}

function $indexOf_0(this$static, str, startIndex){
  return this$static.indexOf(str, startIndex);
}

function $lastIndexOf(this$static, str){
  return this$static.lastIndexOf(str);
}

function $lastIndexOf_0(this$static, str, start){
  return this$static.lastIndexOf(str, start);
}

function $replaceAll(this$static, regex, replace){
  replace = __translateReplaceString(replace);
  return this$static.replace(RegExp(regex, 'g'), replace);
}

function $split(this$static, regex, maxMatch){
  var compiled = new RegExp(regex, 'g');
  var out = [];
  var count = 0;
  var trail = this$static;
  var lastTrail = null;
  while (true) {
    var matchObj = compiled.exec(trail);
    if (matchObj == null || trail == '' || count == maxMatch - 1 && maxMatch > 0) {
      out[count] = trail;
      break;
    }
     else {
      out[count] = trail.substring(0, matchObj.index);
      trail = trail.substring(matchObj.index + matchObj[0].length, trail.length);
      compiled.lastIndex = 0;
      if (lastTrail == trail) {
        out[count] = trail.substring(0, 1);
        trail = trail.substring(1);
      }
      lastTrail = trail;
      count++;
    }
  }
  if (maxMatch == 0 && this$static.length > 0) {
    var lastNonEmpty = out.length;
    while (lastNonEmpty > 0 && out[lastNonEmpty - 1] == '') {
      --lastNonEmpty;
    }
    lastNonEmpty < out.length && out.splice(lastNonEmpty, out.length - lastNonEmpty);
  }
  var jr = __createArray(out.length);
  for (var i_0 = 0; i_0 < out.length; ++i_0) {
    jr[i_0] = out[i_0];
  }
  return jr;
}

function $substring(this$static, beginIndex){
  return this$static.substr(beginIndex, this$static.length - beginIndex);
}

function $substring_0(this$static, beginIndex, endIndex){
  return this$static.substr(beginIndex, endIndex - beginIndex);
}

function $toCharArray(this$static){
  var charArr, n;
  n = this$static.length;
  charArr = initDim(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, n, 1);
  $getChars(this$static, n, charArr, 0);
  return charArr;
}

function $trim(this$static){
  if (this$static.length == 0 || this$static[0] > ' ' && this$static[this$static.length - 1] > ' ') {
    return this$static;
  }
  var r1 = this$static.replace(/^(\s*)/, '');
  var r2 = r1.replace(/\s*$/, '');
  return r2;
}

function __createArray(numElements){
  return initDim(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, numElements, 0);
}

function __translateReplaceString(replaceStr){
  var pos;
  pos = 0;
  while (0 <= (pos = replaceStr.indexOf('\\', pos))) {
    replaceStr.charCodeAt(pos + 1) == 36?(replaceStr = replaceStr.substr(0, pos - 0) + '$' + $substring(replaceStr, ++pos)):(replaceStr = replaceStr.substr(0, pos - 0) + $substring(replaceStr, ++pos));
  }
  return replaceStr;
}

function __valueOf(x, start, end){
  x = x.slice(start, end);
  return String.fromCharCode.apply(null, x);
}

function compareTo_6(thisStr, otherStr){
  thisStr = String(thisStr);
  if (thisStr == otherStr) {
    return 0;
  }
  return thisStr < otherStr?-1:1;
}

function encodeUtf8(bytes, ofs, codePoint){
  if (codePoint < 128) {
    bytes[ofs] = ~~((codePoint & 127) << 24) >> 24;
    return 1;
  }
   else if (codePoint < 2048) {
    bytes[ofs++] = ~~((~~codePoint >> 6 & 31 | 192) << 24) >> 24;
    bytes[ofs] = ~~((codePoint & 63 | 128) << 24) >> 24;
    return 2;
  }
   else if (codePoint < 65536) {
    bytes[ofs++] = ~~((~~codePoint >> 12 & 15 | 224) << 24) >> 24;
    bytes[ofs++] = ~~((~~codePoint >> 6 & 63 | 128) << 24) >> 24;
    bytes[ofs] = ~~((codePoint & 63 | 128) << 24) >> 24;
    return 3;
  }
   else if (codePoint < 2097152) {
    bytes[ofs++] = ~~((~~codePoint >> 18 & 7 | 240) << 24) >> 24;
    bytes[ofs++] = ~~((~~codePoint >> 12 & 63 | 128) << 24) >> 24;
    bytes[ofs++] = ~~((~~codePoint >> 6 & 63 | 128) << 24) >> 24;
    bytes[ofs] = ~~((codePoint & 63 | 128) << 24) >> 24;
    return 4;
  }
   else if (codePoint < 67108864) {
    bytes[ofs++] = ~~((~~codePoint >> 24 & 3 | 248) << 24) >> 24;
    bytes[ofs++] = ~~((~~codePoint >> 18 & 63 | 128) << 24) >> 24;
    bytes[ofs++] = ~~((~~codePoint >> 12 & 63 | 128) << 24) >> 24;
    bytes[ofs++] = ~~((~~codePoint >> 6 & 63 | 128) << 24) >> 24;
    bytes[ofs] = ~~((codePoint & 63 | 128) << 24) >> 24;
    return 5;
  }
  throw new IllegalArgumentException_1('Character out of range: ' + codePoint);
}

function fromCodePoint(codePoint){
  var hiSurrogate, loSurrogate;
  if (codePoint >= 65536) {
    hiSurrogate = 55296 + (~~(codePoint - 65536) >> 10 & 1023) & 65535;
    loSurrogate = 56320 + (codePoint - 65536 & 1023) & 65535;
    return String.fromCharCode(hiSurrogate) + String.fromCharCode(loSurrogate);
  }
   else {
    return String.fromCharCode(codePoint & 65535);
  }
}

function getBytesUtf8(str){
  var byteCount, bytes, ch, i_0, n, out;
  n = str.length;
  byteCount = 0;
  for (i_0 = 0; i_0 < n;) {
    ch = codePointAt(str, i_0, str.length);
    i_0 += ch >= 65536?2:1;
    ch < 128?++byteCount:ch < 2048?(byteCount += 2):ch < 65536?(byteCount += 3):ch < 2097152?(byteCount += 4):ch < 67108864 && (byteCount += 5);
  }
  bytes = initDim(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, byteCount, 1);
  out = 0;
  for (i_0 = 0; i_0 < n;) {
    ch = codePointAt(str, i_0, str.length);
    i_0 += ch >= 65536?2:1;
    out += encodeUtf8(bytes, out, ch);
  }
  return bytes;
}

function valueOf_1(x){
  return String.fromCharCode.apply(null, x);
}

_ = String.prototype;
_.castableTypeMap$ = makeCastMap([Q$String, Q$Serializable, Q$CharSequence, Q$Comparable]);
_.compareTo$ = function compareTo_5(other){
  return compareTo_6(this, dynamicCast(other, Q$String));
}
;
_.equals$ = function equals_10(other){
  return $equals_0(this, other);
}
;
_.hashCode$ = function hashCode_11(){
  return getHashCode_0(this);
}
;
_.toString$ = _.toString;
function $clinit_String$HashCache(){
  $clinit_String$HashCache = nullMethod;
  back_0 = {};
  front = {};
}

function compute(str){
  var hashCode, i_0, n, nBatch;
  hashCode = 0;
  n = str.length;
  nBatch = n - 4;
  i_0 = 0;
  while (i_0 < nBatch) {
    hashCode = str.charCodeAt(i_0 + 3) + 31 * (str.charCodeAt(i_0 + 2) + 31 * (str.charCodeAt(i_0 + 1) + 31 * (str.charCodeAt(i_0) + 31 * hashCode))) | 0;
    i_0 += 4;
  }
  while (i_0 < n) {
    hashCode = hashCode * 31 + $charAt(str, i_0++);
  }
  return hashCode | 0;
}

function getHashCode_0(str){
  $clinit_String$HashCache();
  var key = ':' + str;
  var result = front[key];
  if (result != null) {
    return result;
  }
  result = back_0[key];
  result == null && (result = compute(str));
  increment();
  return front[key] = result;
}

function increment(){
  if (count_0 == 256) {
    back_0 = front;
    front = {};
    count_0 = 0;
  }
  ++count_0;
}

var back_0, count_0 = 0, front;
function $$init_4(this$static){
  this$static.impl = com_google_gwt_core_client_impl_StringBufferImpl();
  this$static.data = this$static.impl.createData();
}

function $append(this$static){
  this$static.impl.appendNonNull(this$static.data, ' ');
  return this$static;
}

function $append_0(this$static, x){
  this$static.impl.append_0(this$static.data, x);
  return this$static;
}

function $append_1(this$static, x){
  this$static.impl.append_1(this$static.data, x);
  return this$static;
}

function $append_2(this$static, x){
  this$static.impl.append_2(this$static.data, x);
  return this$static;
}

function $delete(this$static, end){
  return this$static.impl.replace_0(this$static.data, 0, end, '') , this$static;
}

function StringBuffer_0(){
  $$init_4(this);
}

function StringBuffer_1(s){
  $$init_4(this);
  this.impl.append_2(this.data, s);
}

defineSeed(190, 1, makeCastMap([Q$CharSequence]), StringBuffer_0, StringBuffer_1);
_.toString$ = function toString_19(){
  return this.impl.toString_0(this.data);
}
;
function $$init_5(this$static){
  this$static.impl = com_google_gwt_core_client_impl_StringBufferImpl();
  this$static.data = this$static.impl.createData();
}

function $append_3(this$static, x){
  this$static.impl.appendNonNull(this$static.data, String.fromCharCode(x));
  return this$static;
}

function $append_4(this$static, x){
  this$static.impl.append(this$static.data, x);
  return this$static;
}

function $append_5(this$static, x){
  this$static.impl.append_2(this$static.data, x);
  return this$static;
}

function $append_6(this$static, x){
  this$static.impl.appendNonNull(this$static.data, valueOf_1(x));
  return this$static;
}

function $charAt_0(this$static, index){
  return $charAt(this$static.impl.toString_0(this$static.data), index);
}

function $delete_0(this$static, start, end){
  return this$static.impl.replace_0(this$static.data, start, end, '') , this$static;
}

function $insert(this$static, index, x){
  return this$static.impl.replace_0(this$static.data, index, index, x) , this$static;
}

function $replace(this$static, start, end, toInsert){
  this$static.impl.replace_0(this$static.data, start, end, toInsert);
  return this$static;
}

function $setCharAt(this$static, index, x){
  $replace(this$static, index, index + 1, String.fromCharCode(x));
}

function $setLength(this$static){
  var oldLength;
  oldLength = this$static.impl.length_0(this$static.data);
  0 < oldLength?(this$static.impl.replace_0(this$static.data, 0, oldLength, '') , this$static):0 > oldLength && $append_6(this$static, initDim(_3C_classLit, makeCastMap([Q$char_$1, Q$Serializable]), -1, -oldLength, 1));
}

function $toString_1(this$static){
  return this$static.impl.toString_0(this$static.data);
}

function StringBuilder_0(){
  $$init_5(this);
}

function StringBuilder_1(){
  $$init_5(this);
}

function StringBuilder_2(s){
  $$init_5(this);
  this.impl.append_2(this.data, s);
}

defineSeed(191, 1, makeCastMap([Q$CharSequence]), StringBuilder_0, StringBuilder_1, StringBuilder_2);
_.toString$ = function toString_20(){
  return $toString_1(this);
}
;
function $clinit_System(){
  $clinit_System = nullMethod;
  err = new PrintStream_0;
  out_0 = new PrintStream_0;
}

function arraycopy(src, srcOfs, dest, destOfs, len){
  $clinit_System();
  var destArray, destComp, destEnd, destType, destlen, srcArray, srcComp, srcType, srclen;
  if (src == null || dest == null) {
    throw new NullPointerException_0;
  }
  srcType = getClass__devirtual$(src);
  destType = getClass__devirtual$(dest);
  if ((srcType.modifiers & 4) == 0 || (destType.modifiers & 4) == 0) {
    throw new ArrayStoreException_1('Must be array types');
  }
  srcComp = srcType.componentType;
  destComp = destType.componentType;
  if (!((srcComp.modifiers & 1) != 0?srcComp == destComp:(destComp.modifiers & 1) == 0)) {
    throw new ArrayStoreException_1('Array types must match');
  }
  srclen = src.length;
  destlen = dest.length;
  if (srcOfs < 0 || destOfs < 0 || len < 0 || srcOfs + len > srclen || destOfs + len > destlen) {
    throw new IndexOutOfBoundsException_0;
  }
  if (((srcComp.modifiers & 1) == 0 || (srcComp.modifiers & 4) != 0) && srcType != destType) {
    srcArray = dynamicCast(src, Q$Object_$1);
    destArray = dynamicCast(dest, Q$Object_$1);
    if (maskUndefined(src) === maskUndefined(dest) && srcOfs < destOfs) {
      srcOfs += len;
      for (destEnd = destOfs + len; destEnd-- > destOfs;) {
        setCheck(destArray, destEnd, srcArray[--srcOfs]);
      }
    }
     else {
      for (destEnd = destOfs + len; destOfs < destEnd;) {
        setCheck(destArray, destOfs++, srcArray[srcOfs++]);
      }
    }
  }
   else {
    Array.prototype.splice.apply(dest, [destOfs, len].concat(src.slice(srcOfs, srcOfs + len)));
  }
}

function currentTimeMillis0(){
  $clinit_System();
  return (new Date).getTime();
}

var err, out_0;
function $get_3(this$static){
  if (!this$static.initialized) {
    this$static.value = this$static.initialValue();
    this$static.initialized = true;
  }
  return this$static.value;
}

defineSeed(193, 1, {});
_.initialValue = function initialValue(){
  return null;
}
;
_.initialized = false;
_.value = null;
function UnsupportedOperationException_0(){
  RuntimeException_0.call(this);
}

function UnsupportedOperationException_1(message){
  RuntimeException_1.call(this, message);
}

defineSeed(194, 6, makeCastMap([Q$Serializable, Q$Exception, Q$Throwable]), UnsupportedOperationException_0, UnsupportedOperationException_1);
function $clinit_Random(){
  $clinit_Random = nullMethod;
  var i_0, twoToTheXMinus24Tmp, twoToTheXMinus48Tmp;
  twoToTheXMinus24 = initDim(_3D_classLit, makeCastMap([Q$double_$1, Q$Serializable]), -1, 25, 1);
  twoToTheXMinus48 = initDim(_3D_classLit, makeCastMap([Q$double_$1, Q$Serializable]), -1, 33, 1);
  twoToTheXMinus48Tmp = 1.52587890625E-5;
  for (i_0 = 32; i_0 >= 0; --i_0) {
    twoToTheXMinus48[i_0] = twoToTheXMinus48Tmp;
    twoToTheXMinus48Tmp *= 0.5;
  }
  twoToTheXMinus24Tmp = 1;
  for (i_0 = 24; i_0 >= 0; --i_0) {
    twoToTheXMinus24[i_0] = twoToTheXMinus24Tmp;
    twoToTheXMinus24Tmp *= 0.5;
  }
}

function $nextInt(this$static, n){
  var bits, val;
  if (n > 0) {
    if ((n & -n) == n) {
      return round_int(n * $nextInternal(this$static) * 4.6566128730773926E-10);
    }
    do {
      bits = $nextInternal(this$static);
      val = bits % n;
    }
     while (bits - val + (n - 1) < 0);
    return round_int(val);
  }
  throw new IllegalArgumentException_0;
}

function $nextInternal(this$static){
  var carry, dval, h_0, hi, l_0, lo;
  hi = this$static.seedhi * 15525485 + this$static.seedlo * 1502;
  lo = this$static.seedlo * 15525485 + 11;
  carry = Math.floor(lo * 5.9604644775390625E-8);
  hi += carry;
  lo -= carry * 16777216;
  hi %= 16777216;
  this$static.seedhi = hi;
  this$static.seedlo = lo;
  h_0 = this$static.seedhi * 128;
  l_0 = floor(this$static.seedlo * twoToTheXMinus48[31]);
  dval = h_0 + l_0;
  dval >= 2147483648 && (dval -= 4294967296);
  return dval;
}

function $setSeed(this$static, seedhi, seedlo){
  this$static.seedhi = seedhi ^ 1502;
  this$static.seedlo = seedlo ^ 15525485;
}

function Random_0(){
  $clinit_Random();
  var hi, lo, seed;
  seed = uniqueSeed++ + (new Date).getTime();
  hi = round_int(Math.floor(seed * 5.9604644775390625E-8)) & 16777215;
  lo = round_int(seed - hi * 16777216);
  this.seedhi = hi ^ 1502;
  this.seedlo = lo ^ 15525485;
}

defineSeed(196, 1, {}, Random_0);
_.seedhi = 0;
_.seedlo = 0;
var twoToTheXMinus24, twoToTheXMinus48, uniqueSeed = 0;
function $setSeed_0(this$static, seed){
  var i_0, longSeed, offset, piece;
  longSeed = P0_longLit;
  for (i_0 = 0; i_0 < seed.length; i_0 += 8) {
    piece = P0_longLit;
    for (offset = 0; offset < 8 && i_0 + offset < seed.length; ++offset) {
      piece = or(piece, fromInt(seed[i_0 + offset] << offset * 8));
    }
    longSeed = xor(longSeed, piece);
  }
  $setSeed(this$static, toInt(and(shr(longSeed, 24), Pffffff_longLit)), toInt(and(longSeed, Pffffff_longLit)));
}

function SecureRandom_0(){
  $clinit_Random();
  Random_0.call(this);
}

defineSeed(195, 196, {}, SecureRandom_0);
function $advanceToFind(iter, o){
  var t;
  while (iter.hasNext()) {
    t = iter.next_0();
    if (o == null?t == null:equals__devirtual$(o, t)) {
      return iter;
    }
  }
  return null;
}

function $toString_2(this$static){
  var comma, iter, sb, value;
  sb = new StringBuffer_0;
  comma = null;
  sb.impl.append_2(sb.data, '[');
  iter = this$static.iterator();
  while (iter.hasNext()) {
    comma != null?(sb.impl.append_2(sb.data, comma) , sb):(comma = ', ');
    value = iter.next_0();
    sb.impl.append_2(sb.data, value === this$static?'(this Collection)':'' + value);
  }
  sb.impl.append_2(sb.data, ']');
  return sb.impl.toString_0(sb.data);
}

defineSeed(197, 1, {});
_.add = function add_0(o){
  throw new UnsupportedOperationException_1('Add not supported on this collection');
}
;
_.contains_0 = function contains(o){
  var iter;
  iter = $advanceToFind(this.iterator(), o);
  return !!iter;
}
;
_.toArray = function toArray(){
  return this.toArray_0(initDim(_3Ljava_lang_Object_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$Object, this.size_0(), 0));
}
;
_.toArray_0 = function toArray_0(a){
  var i_0, it, size;
  size = this.size_0();
  a.length < size && (a = createFrom(a, size));
  it = this.iterator();
  for (i_0 = 0; i_0 < size; ++i_0) {
    setCheck(a, i_0, it.next_0());
  }
  a.length > size && setCheck(a, size, null);
  return a;
}
;
_.toString$ = function toString_21(){
  return $toString_2(this);
}
;
function $implFindEntry(this$static, key, remove){
  var entry, iter, k_0;
  for (iter = this$static.entrySet_0().iterator(); iter.hasNext();) {
    entry = dynamicCast(iter.next_0(), Q$Map$Entry);
    k_0 = entry.getKey();
    if (key == null?k_0 == null:equals__devirtual$(key, k_0)) {
      if (remove) {
        entry = new MapEntryImpl_0(entry.getKey(), entry.getValue());
        iter.remove_0();
      }
      return entry;
    }
  }
  return null;
}

function $keySet(this$static){
  var entrySet;
  entrySet = this$static.entrySet_0();
  return new AbstractMap$1_0(this$static, entrySet);
}

function $putAll(this$static, t){
  var e, iter;
  for (iter = t.entrySet_0().iterator(); iter.hasNext();) {
    e = dynamicCast(iter.next_0(), Q$Map$Entry);
    this$static.put(e.getKey(), e.getValue());
  }
}

defineSeed(199, 1, makeCastMap([Q$Map]));
_.containsKey = function containsKey(key){
  return !!$implFindEntry(this, key, false);
}
;
_.equals$ = function equals_11(obj){
  var entry, entry$iterator, otherKey, otherMap, otherValue;
  if (obj === this) {
    return true;
  }
  if (!instanceOf(obj, Q$Map)) {
    return false;
  }
  otherMap = dynamicCast(obj, Q$Map);
  if (this.size_0() != otherMap.size_0()) {
    return false;
  }
  for (entry$iterator = otherMap.entrySet_0().iterator(); entry$iterator.hasNext();) {
    entry = dynamicCast(entry$iterator.next_0(), Q$Map$Entry);
    otherKey = entry.getKey();
    otherValue = entry.getValue();
    if (!this.containsKey(otherKey)) {
      return false;
    }
    if (!equalsWithNullCheck(otherValue, this.get(otherKey))) {
      return false;
    }
  }
  return true;
}
;
_.get = function get(key){
  var entry;
  entry = $implFindEntry(this, key, false);
  return !entry?null:entry.getValue();
}
;
_.hashCode$ = function hashCode_12(){
  var entry, entry$iterator, hashCode;
  hashCode = 0;
  for (entry$iterator = this.entrySet_0().iterator(); entry$iterator.hasNext();) {
    entry = dynamicCast(entry$iterator.next_0(), Q$Map$Entry);
    hashCode += entry.hashCode$();
    hashCode = ~~hashCode;
  }
  return hashCode;
}
;
_.keySet_0 = function keySet_0(){
  return $keySet(this);
}
;
_.put = function put(key, value){
  throw new UnsupportedOperationException_1('Put not supported on this map');
}
;
_.remove = function remove_0(key){
  var entry;
  entry = $implFindEntry(this, key, true);
  return !entry?null:entry.getValue();
}
;
_.size_0 = function size_0(){
  return this.entrySet_0().size_0();
}
;
_.toString$ = function toString_22(){
  var comma, entry, iter, s;
  s = '{';
  comma = false;
  for (iter = this.entrySet_0().iterator(); iter.hasNext();) {
    entry = dynamicCast(iter.next_0(), Q$Map$Entry);
    comma?(s += ', '):(comma = true);
    s += '' + entry.getKey();
    s += '=';
    s += '' + entry.getValue();
  }
  return s + '}';
}
;
function $addAllHashEntries(this$static, dest){
  var hashCodeMap = this$static.hashCodeMap;
  for (var hashCode in hashCodeMap) {
    var hashCodeInt = parseInt(hashCode, 10);
    if (hashCode == hashCodeInt) {
      var array = hashCodeMap[hashCodeInt];
      for (var i_0 = 0, c = array.length; i_0 < c; ++i_0) {
        dest.add(array[i_0]);
      }
    }
  }
}

function $addAllStringEntries(this$static, dest){
  var stringMap = this$static.stringMap;
  for (var key in stringMap) {
    if (key.charCodeAt(0) == 58) {
      var entry = new AbstractHashMap$MapEntryString_0(this$static, key.substring(1));
      dest.add(entry);
    }
  }
}

function $clearImpl(this$static){
  this$static.hashCodeMap = [];
  this$static.stringMap = {};
  this$static.nullSlotLive = false;
  this$static.nullSlot = null;
  this$static.size = 0;
}

function $getHashValue(this$static, key, hashCode){
  var array = this$static.hashCodeMap[hashCode];
  if (array) {
    for (var i_0 = 0, c = array.length; i_0 < c; ++i_0) {
      var entry = array[i_0];
      var entryKey = entry.getKey();
      if (this$static.equalsBridge(key, entryKey)) {
        return entry.getValue();
      }
    }
  }
  return null;
}

function $getStringValue(this$static, key){
  return this$static.stringMap[':' + key];
}

function $hasHashValue(this$static, key, hashCode){
  var array = this$static.hashCodeMap[hashCode];
  if (array) {
    for (var i_0 = 0, c = array.length; i_0 < c; ++i_0) {
      var entry = array[i_0];
      var entryKey = entry.getKey();
      if (this$static.equalsBridge(key, entryKey)) {
        return true;
      }
    }
  }
  return false;
}

function $putHashValue(this$static, key, value, hashCode){
  var array = this$static.hashCodeMap[hashCode];
  if (array) {
    for (var i_0 = 0, c = array.length; i_0 < c; ++i_0) {
      var entry = array[i_0];
      var entryKey = entry.getKey();
      if (this$static.equalsBridge(key, entryKey)) {
        var previous = entry.getValue();
        entry.setValue(value);
        return previous;
      }
    }
  }
   else {
    array = this$static.hashCodeMap[hashCode] = [];
  }
  var entry = new MapEntryImpl_0(key, value);
  array.push(entry);
  ++this$static.size;
  return null;
}

function $putNullSlot(this$static, value){
  var result;
  result = this$static.nullSlot;
  this$static.nullSlot = value;
  if (!this$static.nullSlotLive) {
    this$static.nullSlotLive = true;
    ++this$static.size;
  }
  return result;
}

function $putStringValue(this$static, key, value){
  var result, stringMap = this$static.stringMap;
  key = ':' + key;
  key in stringMap?(result = stringMap[key]):++this$static.size;
  stringMap[key] = value;
  return result;
}

function $removeHashValue(this$static, key, hashCode){
  var array = this$static.hashCodeMap[hashCode];
  if (array) {
    for (var i_0 = 0, c = array.length; i_0 < c; ++i_0) {
      var entry = array[i_0];
      var entryKey = entry.getKey();
      if (this$static.equalsBridge(key, entryKey)) {
        array.length == 1?delete this$static.hashCodeMap[hashCode]:array.splice(i_0, 1);
        --this$static.size;
        return entry.getValue();
      }
    }
  }
  return null;
}

function $removeNullSlot(this$static){
  var result;
  result = this$static.nullSlot;
  this$static.nullSlot = null;
  if (this$static.nullSlotLive) {
    this$static.nullSlotLive = false;
    --this$static.size;
  }
  return result;
}

function $removeStringValue(this$static, key){
  var result, stringMap = this$static.stringMap;
  key = ':' + key;
  if (key in stringMap) {
    result = stringMap[key];
    --this$static.size;
    delete stringMap[key];
  }
  return result;
}

defineSeed(198, 199, makeCastMap([Q$Map]));
_.containsKey = function containsKey_0(key){
  return key == null?this.nullSlotLive:instanceOf(key, Q$String)?':' + dynamicCast(key, Q$String) in this.stringMap:$hasHashValue(this, key, this.getHashCode(key));
}
;
_.entrySet_0 = function entrySet_0(){
  return new AbstractHashMap$EntrySet_0(this);
}
;
_.equalsBridge = function equalsBridge(value1, value2){
  return this.equals(value1, value2);
}
;
_.get = function get_0(key){
  return key == null?this.nullSlot:instanceOf(key, Q$String)?$getStringValue(this, dynamicCast(key, Q$String)):$getHashValue(this, key, this.getHashCode(key));
}
;
_.put = function put_0(key, value){
  return key == null?$putNullSlot(this, value):instanceOf(key, Q$String)?$putStringValue(this, dynamicCast(key, Q$String), value):$putHashValue(this, key, value, this.getHashCode(key));
}
;
_.remove = function remove_1(key){
  return key == null?$removeNullSlot(this):instanceOf(key, Q$String)?$removeStringValue(this, dynamicCast(key, Q$String)):$removeHashValue(this, key, this.getHashCode(key));
}
;
_.size_0 = function size_1(){
  return this.size;
}
;
_.hashCodeMap = null;
_.nullSlot = null;
_.nullSlotLive = false;
_.size = 0;
_.stringMap = null;
defineSeed(201, 197, makeCastMap([Q$Set]));
_.equals$ = function equals_12(o){
  var iter, other, otherItem;
  if (o === this) {
    return true;
  }
  if (!instanceOf(o, Q$Set)) {
    return false;
  }
  other = dynamicCast(o, Q$Set);
  if (other.size_0() != this.size_0()) {
    return false;
  }
  for (iter = other.iterator(); iter.hasNext();) {
    otherItem = iter.next_0();
    if (!this.contains_0(otherItem)) {
      return false;
    }
  }
  return true;
}
;
_.hashCode$ = function hashCode_13(){
  var hashCode, iter, next;
  hashCode = 0;
  for (iter = this.iterator(); iter.hasNext();) {
    next = iter.next_0();
    if (next != null) {
      hashCode += hashCode__devirtual$(next);
      hashCode = ~~hashCode;
    }
  }
  return hashCode;
}
;
function AbstractHashMap$EntrySet_0(this$0){
  this.this$0 = this$0;
}

defineSeed(200, 201, makeCastMap([Q$Set]), AbstractHashMap$EntrySet_0);
_.contains_0 = function contains_0(o){
  var entry, key, value;
  if (instanceOf(o, Q$Map$Entry)) {
    entry = dynamicCast(o, Q$Map$Entry);
    key = entry.getKey();
    if (this.this$0.containsKey(key)) {
      value = this.this$0.get(key);
      return this.this$0.equals(entry.getValue(), value);
    }
  }
  return false;
}
;
_.iterator = function iterator_0(){
  return new AbstractHashMap$EntrySetIterator_0(this.this$0);
}
;
_.size_0 = function size_2(){
  return this.this$0.size_0();
}
;
_.this$0 = null;
function AbstractHashMap$EntrySetIterator_0(this$0){
  var list;
  this.this$0 = this$0;
  list = new ArrayList_0;
  this$0.nullSlotLive && $add_0(list, new AbstractHashMap$MapEntryNull_0(this$0));
  $addAllStringEntries(this$0, list);
  $addAllHashEntries(this$0, list);
  this.iter = new AbstractList$IteratorImpl_0(list);
}

defineSeed(202, 1, {}, AbstractHashMap$EntrySetIterator_0);
_.hasNext = function hasNext(){
  return $hasNext(this.iter);
}
;
_.next_0 = function next_0(){
  return this.last = dynamicCast($next(this.iter), Q$Map$Entry);
}
;
_.remove_0 = function remove_2(){
  if (!this.last) {
    throw new IllegalStateException_1('Must call next() before remove().');
  }
   else {
    $remove(this.iter);
    this.this$0.remove(this.last.getKey());
    this.last = null;
  }
}
;
_.iter = null;
_.last = null;
_.this$0 = null;
defineSeed(204, 1, makeCastMap([Q$Map$Entry]));
_.equals$ = function equals_13(other){
  var entry;
  if (instanceOf(other, Q$Map$Entry)) {
    entry = dynamicCast(other, Q$Map$Entry);
    if (equalsWithNullCheck(this.getKey(), entry.getKey()) && equalsWithNullCheck(this.getValue(), entry.getValue())) {
      return true;
    }
  }
  return false;
}
;
_.hashCode$ = function hashCode_14(){
  var keyHash, valueHash;
  keyHash = 0;
  valueHash = 0;
  this.getKey() != null && (keyHash = hashCode__devirtual$(this.getKey()));
  this.getValue() != null && (valueHash = hashCode__devirtual$(this.getValue()));
  return keyHash ^ valueHash;
}
;
_.toString$ = function toString_23(){
  return this.getKey() + '=' + this.getValue();
}
;
function AbstractHashMap$MapEntryNull_0(this$0){
  this.this$0 = this$0;
}

defineSeed(203, 204, makeCastMap([Q$Map$Entry]), AbstractHashMap$MapEntryNull_0);
_.getKey = function getKey(){
  return null;
}
;
_.getValue = function getValue(){
  return this.this$0.nullSlot;
}
;
_.setValue = function setValue(object){
  return $putNullSlot(this.this$0, object);
}
;
_.this$0 = null;
function AbstractHashMap$MapEntryString_0(this$0, key){
  this.this$0 = this$0;
  this.key = key;
}

defineSeed(205, 204, makeCastMap([Q$Map$Entry]), AbstractHashMap$MapEntryString_0);
_.getKey = function getKey_0(){
  return this.key;
}
;
_.getValue = function getValue_0(){
  return $getStringValue(this.this$0, this.key);
}
;
_.setValue = function setValue_0(object){
  return $putStringValue(this.this$0, this.key, object);
}
;
_.key = null;
_.this$0 = null;
function checkIndex(index, size){
  (index < 0 || index >= size) && indexOutOfBounds(index, size);
}

function indexOutOfBounds(index, size){
  throw new IndexOutOfBoundsException_1('Index: ' + index + ', Size: ' + size);
}

defineSeed(206, 197, makeCastMap([Q$List]));
_.add_0 = function add_1(index, element){
  throw new UnsupportedOperationException_1('Add not supported on this list');
}
;
_.add = function add_2(obj){
  this.add_0(this.size_0(), obj);
  return true;
}
;
_.equals$ = function equals_14(o){
  var elem, elemOther, iter, iterOther, other;
  if (o === this) {
    return true;
  }
  if (!instanceOf(o, Q$List)) {
    return false;
  }
  other = dynamicCast(o, Q$List);
  if (this.size_0() != other.size_0()) {
    return false;
  }
  iter = this.iterator();
  iterOther = other.iterator();
  while (iter.hasNext()) {
    elem = iter.next_0();
    elemOther = iterOther.next_0();
    if (!(elem == null?elemOther == null:equals__devirtual$(elem, elemOther))) {
      return false;
    }
  }
  return true;
}
;
_.hashCode$ = function hashCode_15(){
  var iter, k_0, obj;
  k_0 = 1;
  iter = this.iterator();
  while (iter.hasNext()) {
    obj = iter.next_0();
    k_0 = 31 * k_0 + (obj == null?0:hashCode__devirtual$(obj));
    k_0 = ~~k_0;
  }
  return k_0;
}
;
_.iterator = function iterator_1(){
  return new AbstractList$IteratorImpl_0(this);
}
;
_.remove_1 = function remove_3(index){
  throw new UnsupportedOperationException_1('Remove not supported on this list');
}
;
function $hasNext(this$static){
  return this$static.i < this$static.this$0.size_0();
}

function $next(this$static){
  if (this$static.i >= this$static.this$0.size_0()) {
    throw new NoSuchElementException_0;
  }
  return this$static.this$0.get_0(this$static.last = this$static.i++);
}

function $remove(this$static){
  if (this$static.last < 0) {
    throw new IllegalStateException_0;
  }
  this$static.this$0.remove_1(this$static.last);
  this$static.i = this$static.last;
  this$static.last = -1;
}

function AbstractList$IteratorImpl_0(this$0){
  this.this$0 = this$0;
}

defineSeed(207, 1, {}, AbstractList$IteratorImpl_0);
_.hasNext = function hasNext_0(){
  return $hasNext(this);
}
;
_.next_0 = function next_1(){
  return $next(this);
}
;
_.remove_0 = function remove_4(){
  $remove(this);
}
;
_.i = 0;
_.last = -1;
_.this$0 = null;
function $iterator(this$static){
  var outerIter;
  outerIter = this$static.val$entrySet.iterator();
  return new AbstractMap$1$1_0(outerIter);
}

function AbstractMap$1_0(this$0, val$entrySet){
  this.this$0 = this$0;
  this.val$entrySet = val$entrySet;
}

defineSeed(208, 201, makeCastMap([Q$Set]), AbstractMap$1_0);
_.contains_0 = function contains_1(key){
  return this.this$0.containsKey(key);
}
;
_.iterator = function iterator_2(){
  return $iterator(this);
}
;
_.size_0 = function size_3(){
  return this.val$entrySet.size_0();
}
;
_.this$0 = null;
_.val$entrySet = null;
function $next_0(this$static){
  var entry;
  entry = dynamicCast(this$static.val$outerIter.next_0(), Q$Map$Entry);
  return entry.getKey();
}

function AbstractMap$1$1_0(val$outerIter){
  this.val$outerIter = val$outerIter;
}

defineSeed(209, 1, {}, AbstractMap$1$1_0);
_.hasNext = function hasNext_1(){
  return this.val$outerIter.hasNext();
}
;
_.next_0 = function next_2(){
  return $next_0(this);
}
;
_.remove_0 = function remove_5(){
  this.val$outerIter.remove_0();
}
;
_.val$outerIter = null;
function $add(this$static, o){
  if ($offer(this$static, o)) {
    return true;
  }
  throw new IllegalStateException_1('Unable to add element to queue');
}

defineSeed(210, 197, {});
_.add = function add_3(o){
  return $add(this, o);
}
;
defineSeed(211, 206, makeCastMap([Q$List]));
_.add_0 = function add_4(index, element){
  var iter;
  iter = $listIterator(this, index);
  $addBefore(iter.this$0, element, iter.currentNode);
  ++iter.currentIndex;
  iter.lastNode = null;
}
;
_.get_0 = function get_1(index){
  var iter;
  iter = $listIterator(this, index);
  try {
    return $next_2(iter);
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, Q$NoSuchElementException)) {
      throw new IndexOutOfBoundsException_1("Can't get element " + index);
    }
     else 
      throw $e0;
  }
}
;
_.iterator = function iterator_3(){
  return $listIterator(this, 0);
}
;
_.remove_1 = function remove_6(index){
  var iter, old;
  iter = $listIterator(this, index);
  try {
    old = $next_2(iter);
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, Q$NoSuchElementException)) {
      throw new IndexOutOfBoundsException_1("Can't remove element " + index);
    }
     else 
      throw $e0;
  }
  $remove_2(iter);
  return old;
}
;
function $$init_6(this$static){
  this$static.array = initDim(_3Ljava_lang_Object_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$Object, 0, 0);
}

function $add_0(this$static, o){
  setCheck(this$static.array, this$static.size++, o);
  return true;
}

function $clear(this$static){
  this$static.array = initDim(_3Ljava_lang_Object_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$Object, 0, 0);
  this$static.size = 0;
}

function $get_4(this$static, index){
  checkIndex(index, this$static.size);
  return this$static.array[index];
}

function $indexOf_1(this$static, o, index){
  for (; index < this$static.size; ++index) {
    if (equalsWithNullCheck(o, this$static.array[index])) {
      return index;
    }
  }
  return -1;
}

function $remove_0(this$static, index){
  var previous;
  previous = (checkIndex(index, this$static.size) , this$static.array[index]);
  splice_0(this$static.array, index, 1);
  --this$static.size;
  return previous;
}

function $set_7(this$static, index, o){
  var previous;
  previous = (checkIndex(index, this$static.size) , this$static.array[index]);
  setCheck(this$static.array, index, o);
  return previous;
}

function $toArray(this$static){
  return cloneSubrange(this$static.array, 0, this$static.size);
}

function $toArray_0(this$static, out){
  var i_0;
  out.length < this$static.size && (out = createFrom(out, this$static.size));
  for (i_0 = 0; i_0 < this$static.size; ++i_0) {
    setCheck(out, i_0, this$static.array[i_0]);
  }
  out.length > this$static.size && setCheck(out, this$static.size, null);
  return out;
}

function ArrayList_0(){
  $$init_6(this);
}

function ArrayList_1(){
  $$init_6(this);
  this.array.length = 500;
}

function ArrayList_2(c){
  $$init_6(this);
  spliceArray(this.array, 0, 0, c.toArray());
  this.size = this.array.length;
}

function splice_0(array, index, deleteCount){
  array.splice(index, deleteCount);
}

function splice_1(array, index, deleteCount, value){
  array.splice(index, deleteCount, value);
}

function spliceArray(array, index, deleteCount, values){
  Array.prototype.splice.apply(array, [index, deleteCount].concat(values));
}

defineSeed(212, 206, makeCastMap([Q$Serializable, Q$List, Q$RandomAccess]), ArrayList_0, ArrayList_1, ArrayList_2);
_.add_0 = function add_5(index, o){
  (index < 0 || index > this.size) && indexOutOfBounds(index, this.size);
  splice_1(this.array, index, 0, o);
  ++this.size;
}
;
_.add = function add_6(o){
  return $add_0(this, o);
}
;
_.contains_0 = function contains_2(o){
  return $indexOf_1(this, o, 0) != -1;
}
;
_.get_0 = function get_2(index){
  return $get_4(this, index);
}
;
_.remove_1 = function remove_7(index){
  return $remove_0(this, index);
}
;
_.size_0 = function size_4(){
  return this.size;
}
;
_.toArray = function toArray_1(){
  return $toArray(this);
}
;
_.toArray_0 = function toArray_2(out){
  return $toArray_0(this, out);
}
;
_.size = 0;
function binarySearch_0(sortedArray, key){
  var high, low, mid, midVal;
  low = 0;
  high = sortedArray.length - 1;
  while (low <= high) {
    mid = low + (~~(high - low) >> 1);
    midVal = sortedArray[mid];
    if (midVal < key) {
      low = mid + 1;
    }
     else if (midVal > key) {
      high = mid - 1;
    }
     else {
      return mid;
    }
  }
  return -low - 1;
}

function deepEquals(a1, a2){
  var class1, class2, i_0, n, obj1, obj2;
  if (maskUndefined(a1) === maskUndefined(a2)) {
    return true;
  }
  if (a1 == null || a2 == null) {
    return false;
  }
  if (a1.length != a2.length) {
    return false;
  }
  for (i_0 = 0 , n = a1.length; i_0 < n; ++i_0) {
    obj1 = a1[i_0];
    obj2 = a2[i_0];
    if (maskUndefined(obj1) === maskUndefined(obj2)) {
      continue;
    }
    if (obj1 == null || obj2 == null) {
      return false;
    }
    if (equals__devirtual$(obj1, obj2)) {
      continue;
    }
    class1 = getClass__devirtual$(obj1);
    class2 = getClass__devirtual$(obj2);
    if ((class1.modifiers & 4) == 0 || class1 != class2) {
      return false;
    }
    if (instanceOf(obj1, Q$Object_$1)) {
      if (!deepEquals(dynamicCast(obj1, Q$Object_$1), dynamicCast(obj2, Q$Object_$1))) {
        return false;
      }
    }
     else if (instanceOf(obj1, Q$boolean_$1)) {
      if (!equals_19(dynamicCast(obj1, Q$boolean_$1), dynamicCast(obj2, Q$boolean_$1))) {
        return false;
      }
    }
     else if (instanceOf(obj1, Q$byte_$1)) {
      if (!equals_15(dynamicCast(obj1, Q$byte_$1), dynamicCast(obj2, Q$byte_$1))) {
        return false;
      }
    }
     else if (instanceOf(obj1, Q$char_$1)) {
      if (!equals_16(dynamicCast(obj1, Q$char_$1), dynamicCast(obj2, Q$char_$1))) {
        return false;
      }
    }
     else if (instanceOf(obj1, Q$int_$1)) {
      if (!equals_18(dynamicCast(obj1, Q$int_$1), dynamicCast(obj2, Q$int_$1))) {
        return false;
      }
    }
     else if (instanceOf(obj1, Q$double_$1)) {
      if (!equals_17(dynamicCast(obj1, Q$double_$1), dynamicCast(obj2, Q$double_$1))) {
        return false;
      }
    }
  }
  return true;
}

function deepHashCode(a){
  var hash, hashCode, i_0, n, obj;
  if (a == null) {
    return 0;
  }
  hashCode = 1;
  for (i_0 = 0 , n = a.length; i_0 < n; ++i_0) {
    obj = a[i_0];
    instanceOf(obj, Q$Object_$1)?(hash = deepHashCode(dynamicCast(obj, Q$Object_$1))):instanceOf(obj, Q$boolean_$1)?(hash = hashCode_20(dynamicCast(obj, Q$boolean_$1))):instanceOf(obj, Q$byte_$1)?(hash = hashCode_16(dynamicCast(obj, Q$byte_$1))):instanceOf(obj, Q$char_$1)?(hash = hashCode_17(dynamicCast(obj, Q$char_$1))):instanceOf(obj, Q$int_$1)?(hash = hashCode_19(dynamicCast(obj, Q$int_$1))):instanceOf(obj, Q$double_$1)?(hash = hashCode_18(dynamicCast(obj, Q$double_$1))):obj != null?(hash = hashCode__devirtual$(obj)):(hash = 0);
    hashCode = 31 * hashCode + hash | 0;
  }
  return hashCode;
}

function equals_15(array1, array2){
  var i_0;
  if (maskUndefined(array1) === maskUndefined(array2)) {
    return true;
  }
  if (array1 == null || array2 == null) {
    return false;
  }
  if (array1.length != array2.length) {
    return false;
  }
  for (i_0 = 0; i_0 < array1.length; ++i_0) {
    if (array1[i_0] != array2[i_0]) {
      return false;
    }
  }
  return true;
}

function equals_16(array1, array2){
  var i_0;
  if (maskUndefined(array1) === maskUndefined(array2)) {
    return true;
  }
  if (array1 == null || array2 == null) {
    return false;
  }
  if (array1.length != array2.length) {
    return false;
  }
  for (i_0 = 0; i_0 < array1.length; ++i_0) {
    if (array1[i_0] != array2[i_0]) {
      return false;
    }
  }
  return true;
}

function equals_17(array1, array2){
  var i_0;
  if (maskUndefined(array1) === maskUndefined(array2)) {
    return true;
  }
  if (array1 == null || array2 == null) {
    return false;
  }
  if (array1.length != array2.length) {
    return false;
  }
  for (i_0 = 0; i_0 < array1.length; ++i_0) {
    if (array1[i_0] != array2[i_0]) {
      return false;
    }
  }
  return true;
}

function equals_18(array1, array2){
  var i_0;
  if (maskUndefined(array1) === maskUndefined(array2)) {
    return true;
  }
  if (array1 == null || array2 == null) {
    return false;
  }
  if (array1.length != array2.length) {
    return false;
  }
  for (i_0 = 0; i_0 < array1.length; ++i_0) {
    if (array1[i_0] != array2[i_0]) {
      return false;
    }
  }
  return true;
}

function equals_19(array1, array2){
  var i_0;
  if (maskUndefined(array1) === maskUndefined(array2)) {
    return true;
  }
  if (array1 == null || array2 == null) {
    return false;
  }
  if (array1.length != array2.length) {
    return false;
  }
  for (i_0 = 0; i_0 < array1.length; ++i_0) {
    if (array1[i_0] != array2[i_0]) {
      return false;
    }
  }
  return true;
}

function fill_0(a){
  fill_1(a, a.length);
}

function fill_1(a, toIndex){
  var i_0;
  for (i_0 = 0; i_0 < toIndex; ++i_0) {
    a[i_0] = -1;
  }
}

function fill_2(a){
  fill_3(a, a.length);
}

function fill_3(a, toIndex){
  var i_0;
  for (i_0 = 0; i_0 < toIndex; ++i_0) {
    a[i_0] = -1;
  }
}

function hashCode_16(a){
  var hashCode, i_0, n;
  if (a == null) {
    return 0;
  }
  hashCode = 1;
  for (i_0 = 0 , n = a.length; i_0 < n; ++i_0) {
    hashCode = 31 * hashCode + a[i_0] | 0;
  }
  return hashCode;
}

function hashCode_17(a){
  var hashCode, i_0, n;
  if (a == null) {
    return 0;
  }
  hashCode = 1;
  for (i_0 = 0 , n = a.length; i_0 < n; ++i_0) {
    hashCode = 31 * hashCode + a[i_0] | 0;
  }
  return hashCode;
}

function hashCode_18(a){
  var hashCode, i_0, n;
  if (a == null) {
    return 0;
  }
  hashCode = 1;
  for (i_0 = 0 , n = a.length; i_0 < n; ++i_0) {
    hashCode = 31 * hashCode + round_int(a[i_0]) | 0;
  }
  return hashCode;
}

function hashCode_19(a){
  var hashCode, i_0, n;
  if (a == null) {
    return 0;
  }
  hashCode = 1;
  for (i_0 = 0 , n = a.length; i_0 < n; ++i_0) {
    hashCode = 31 * hashCode + a[i_0] | 0;
  }
  return hashCode;
}

function hashCode_20(a){
  var hashCode, i_0, n;
  if (a == null) {
    return 0;
  }
  hashCode = 1;
  for (i_0 = 0 , n = a.length; i_0 < n; ++i_0) {
    hashCode = 31 * hashCode + (($clinit_Boolean() , a[i_0]?TRUE_0:FALSE_0).value?1231:1237) | 0;
  }
  return hashCode;
}

function insertionSort(array, low, high, comp){
  var i_0, j, t;
  for (i_0 = low + 1; i_0 < high; ++i_0) {
    for (j = i_0; j > low && comp.compare(array[j - 1], array[j]) > 0; --j) {
      t = array[j];
      setCheck(array, j, array[j - 1]);
      setCheck(array, j - 1, t);
    }
  }
}

function merge(src, srcLow, srcMid, srcHigh, dest, destLow, destHigh, comp){
  var topIdx;
  topIdx = srcMid;
  while (destLow < destHigh) {
    topIdx >= srcHigh || srcLow < srcMid && comp.compare(src[srcLow], src[topIdx]) <= 0?setCheck(dest, destLow++, src[srcLow++]):setCheck(dest, destLow++, src[topIdx++]);
  }
}

function mergeSort(x, fromIndex, toIndex, comp){
  var temp;
  temp = cloneSubrange(x, fromIndex, toIndex);
  mergeSort_0(temp, x, fromIndex, toIndex, -fromIndex, comp);
}

function mergeSort_0(temp, array, low, high, ofs, comp){
  var length_0, tempHigh, tempLow, tempMid;
  length_0 = high - low;
  if (length_0 < 7) {
    insertionSort(array, low, high, comp);
    return;
  }
  tempLow = low + ofs;
  tempHigh = high + ofs;
  tempMid = tempLow + (~~(tempHigh - tempLow) >> 1);
  mergeSort_0(array, temp, tempLow, tempMid, -ofs, comp);
  mergeSort_0(array, temp, tempMid, tempHigh, -ofs, comp);
  if (comp.compare(temp[tempMid - 1], temp[tempMid]) <= 0) {
    while (low < high) {
      setCheck(array, low++, temp[tempLow++]);
    }
    return;
  }
  merge(temp, tempLow, tempMid, tempHigh, array, low, high, comp);
}

function toString_24(a){
  var b, i_0;
  if (a == null) {
    return 'null';
  }
  b = new StringBuffer_1('[');
  for (i_0 = 0; i_0 < a.length; ++i_0) {
    i_0 != 0 && (b.impl.append_2(b.data, ', ') , b);
    b.impl.append_2(b.data, '' + a[i_0]);
  }
  b.impl.append_2(b.data, ']');
  return b.impl.toString_0(b.data);
}

function replaceContents(target, x){
  var i_0, size;
  size = target.size;
  for (i_0 = 0; i_0 < size; ++i_0) {
    $set_7(target, i_0, x[i_0]);
  }
}

function unmodifiableList(list){
  return instanceOf(list, Q$RandomAccess)?new Collections$UnmodifiableRandomAccessList_0(list):new Collections$UnmodifiableList_0(list);
}

defineSeed(215, 1, {});
_.add = function add_7(o){
  throw new UnsupportedOperationException_0;
}
;
_.iterator = function iterator_4(){
  return new Collections$UnmodifiableCollectionIterator_0(this.coll.iterator());
}
;
_.size_0 = function size_5(){
  return this.coll.size_0();
}
;
_.toString$ = function toString_25(){
  return this.coll.toString$();
}
;
_.coll = null;
function Collections$UnmodifiableCollectionIterator_0(it){
  this.it = it;
}

defineSeed(216, 1, {}, Collections$UnmodifiableCollectionIterator_0);
_.hasNext = function hasNext_2(){
  return this.it.hasNext();
}
;
_.next_0 = function next_3(){
  return this.it.next_0();
}
;
_.remove_0 = function remove_8(){
  throw new UnsupportedOperationException_0;
}
;
_.it = null;
function Collections$UnmodifiableList_0(list){
  this.coll = list;
  this.list = list;
}

defineSeed(217, 215, makeCastMap([Q$List]), Collections$UnmodifiableList_0);
_.equals$ = function equals_20(o){
  return this.list.equals$(o);
}
;
_.get_0 = function get_3(index){
  return this.list.get_0(index);
}
;
_.hashCode$ = function hashCode_21(){
  return this.list.hashCode$();
}
;
_.list = null;
function Collections$UnmodifiableMap_0(map){
  this.map = map;
}

defineSeed(218, 1, makeCastMap([Q$Map]), Collections$UnmodifiableMap_0);
_.containsKey = function containsKey_1(key){
  return this.map.containsKey(key);
}
;
_.entrySet_0 = function entrySet_1(){
  !this.entrySet && (this.entrySet = new Collections$UnmodifiableMap$UnmodifiableEntrySet_0(this.map.entrySet_0()));
  return this.entrySet;
}
;
_.equals$ = function equals_21(o){
  return this.map.equals$(o);
}
;
_.get = function get_4(key){
  return this.map.get(key);
}
;
_.hashCode$ = function hashCode_22(){
  return this.map.hashCode$();
}
;
_.keySet_0 = function keySet_1(){
  !this.keySet && (this.keySet = new Collections$UnmodifiableSet_0(this.map.keySet_0()));
  return this.keySet;
}
;
_.put = function put_1(key, value){
  throw new UnsupportedOperationException_0;
}
;
_.remove = function remove_9(key){
  throw new UnsupportedOperationException_0;
}
;
_.size_0 = function size_6(){
  return this.map.size_0();
}
;
_.toString$ = function toString_26(){
  return this.map.toString$();
}
;
_.entrySet = null;
_.keySet = null;
_.map = null;
function Collections$UnmodifiableSet_0(set){
  this.coll = set;
}

defineSeed(220, 215, makeCastMap([Q$Set]), Collections$UnmodifiableSet_0);
_.equals$ = function equals_22(o){
  return this.coll.equals$(o);
}
;
_.hashCode$ = function hashCode_23(){
  return this.coll.hashCode$();
}
;
function Collections$UnmodifiableMap$UnmodifiableEntrySet_0(s){
  this.coll = s;
}

defineSeed(219, 220, makeCastMap([Q$Set]), Collections$UnmodifiableMap$UnmodifiableEntrySet_0);
_.iterator = function iterator_5(){
  var it;
  it = this.coll.iterator();
  return new Collections$UnmodifiableMap$UnmodifiableEntrySet$1_0(it);
}
;
function Collections$UnmodifiableMap$UnmodifiableEntrySet$1_0(val$it){
  this.val$it = val$it;
}

defineSeed(221, 1, {}, Collections$UnmodifiableMap$UnmodifiableEntrySet$1_0);
_.hasNext = function hasNext_3(){
  return this.val$it.hasNext();
}
;
_.next_0 = function next_4(){
  return new Collections$UnmodifiableMap$UnmodifiableEntrySet$UnmodifiableEntry_0(dynamicCast(this.val$it.next_0(), Q$Map$Entry));
}
;
_.remove_0 = function remove_10(){
  throw new UnsupportedOperationException_0;
}
;
_.val$it = null;
function Collections$UnmodifiableMap$UnmodifiableEntrySet$UnmodifiableEntry_0(entry){
  this.entry = entry;
}

defineSeed(222, 1, makeCastMap([Q$Map$Entry]), Collections$UnmodifiableMap$UnmodifiableEntrySet$UnmodifiableEntry_0);
_.equals$ = function equals_23(o){
  return this.entry.equals$(o);
}
;
_.getKey = function getKey_1(){
  return this.entry.getKey();
}
;
_.getValue = function getValue_1(){
  return this.entry.getValue();
}
;
_.hashCode$ = function hashCode_24(){
  return this.entry.hashCode$();
}
;
_.setValue = function setValue_1(value){
  throw new UnsupportedOperationException_0;
}
;
_.toString$ = function toString_27(){
  return this.entry.toString$();
}
;
_.entry = null;
function Collections$UnmodifiableRandomAccessList_0(list){
  Collections$UnmodifiableList_0.call(this, list);
}

defineSeed(223, 217, makeCastMap([Q$List, Q$RandomAccess]), Collections$UnmodifiableRandomAccessList_0);
function $clinit_Comparators(){
  $clinit_Comparators = nullMethod;
  NATURAL = new Comparators$1_0;
}

var NATURAL;
function Comparators$1_0(){
}

defineSeed(225, 1, {}, Comparators$1_0);
_.compare = function compare_1(o1, o2){
  return dynamicCast(o1, Q$Comparable).compareTo$(o2);
}
;
function $compareTo_5(this$static, other){
  return signum(sub(fromDouble(this$static.jsdate.getTime()), fromDouble(other.jsdate.getTime())));
}

function $toString_3(this$static){
  var hourOffset, minuteOffset, offset;
  offset = -this$static.jsdate.getTimezoneOffset();
  hourOffset = (offset >= 0?'+':'') + ~~(offset / 60);
  minuteOffset = (offset < 0?-offset:offset) % 60 < 10?'0' + (offset < 0?-offset:offset) % 60:'' + (offset < 0?-offset:offset) % 60;
  return ($clinit_Date$StringData() , DAYS)[this$static.jsdate.getDay()] + ' ' + MONTHS[this$static.jsdate.getMonth()] + ' ' + padTwo(this$static.jsdate.getDate()) + ' ' + padTwo(this$static.jsdate.getHours()) + ':' + padTwo(this$static.jsdate.getMinutes()) + ':' + padTwo(this$static.jsdate.getSeconds()) + ' GMT' + hourOffset + minuteOffset + ' ' + this$static.jsdate.getFullYear();
}

function Date_1(){
  this.jsdate = new Date;
}

function Date_2(date){
  this.jsdate = create(toDouble(date));
}

function padTwo(number){
  return number < 10?'0' + number:'' + number;
}

defineSeed(226, 1, makeCastMap([Q$Serializable, Q$Comparable, Q$Date]), Date_1, Date_2);
_.compareTo$ = function compareTo_7(other){
  return $compareTo_5(this, dynamicCast(other, Q$Date));
}
;
_.equals$ = function equals_24(obj){
  return instanceOf(obj, Q$Date) && eq(fromDouble(this.jsdate.getTime()), fromDouble(dynamicCast(obj, Q$Date).jsdate.getTime()));
}
;
_.hashCode$ = function hashCode_25(){
  var time;
  time = fromDouble(this.jsdate.getTime());
  return toInt(xor(time, shru(time, 32)));
}
;
_.toString$ = function toString_28(){
  return $toString_3(this);
}
;
_.jsdate = null;
function $clinit_Date$StringData(){
  $clinit_Date$StringData = nullMethod;
  DAYS = initValues(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  MONTHS = initValues(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
}

var DAYS, MONTHS;
function HashMap_0(){
  $clearImpl(this);
}

function HashMap_1(toBeCopied){
  $clearImpl(this);
  $putAll(this, toBeCopied);
}

defineSeed(228, 198, makeCastMap([Q$Serializable, Q$HashMap, Q$Map]), HashMap_0, HashMap_1);
_.equals = function equals_25(value1, value2){
  return maskUndefined(value1) === maskUndefined(value2) || value1 != null && equals__devirtual$(value1, value2);
}
;
_.getHashCode = function getHashCode_1(key){
  return ~~hashCode__devirtual$(key);
}
;
function $add_1(this$static, o){
  var old;
  old = this$static.map.put(o, this$static);
  return old == null;
}

function HashSet_0(){
  this.map = new HashMap_0;
}

defineSeed(229, 201, makeCastMap([Q$Serializable, Q$Set]), HashSet_0);
_.add = function add_8(o){
  return $add_1(this, o);
}
;
_.contains_0 = function contains_3(o){
  return this.map.containsKey(o);
}
;
_.iterator = function iterator_6(){
  return $iterator($keySet(this.map));
}
;
_.size_0 = function size_7(){
  return this.map.size_0();
}
;
_.toString$ = function toString_29(){
  return $toString_2($keySet(this.map));
}
;
_.map = null;
function $containsKey(this$static, key){
  return this$static.map.containsKey(key);
}

function $get_5(this$static, key){
  var entry;
  entry = dynamicCast(this$static.map.get(key), Q$LinkedHashMap$ChainEntry);
  if (entry) {
    $recordAccess(this$static, entry);
    return entry.value;
  }
  return null;
}

function $put_0(this$static, key, value){
  var newEntry, old, oldValue;
  old = dynamicCast(this$static.map.get(key), Q$LinkedHashMap$ChainEntry);
  if (!old) {
    newEntry = new LinkedHashMap$ChainEntry_1(this$static, key, value);
    this$static.map.put(key, newEntry);
    $addToEnd(newEntry);
    return null;
  }
   else {
    oldValue = old.value;
    $setValue(old, value);
    $recordAccess(this$static, old);
    return oldValue;
  }
}

function $recordAccess(this$static, entry){
  if (this$static.accessOrder) {
    $remove_1(entry);
    $addToEnd(entry);
  }
}

function LinkedHashMap_0(){
  $clearImpl(this);
  this.head = new LinkedHashMap$ChainEntry_0(this);
  this.map = new HashMap_0;
  this.head.prev = this.head;
  this.head.next = this.head;
}

defineSeed(230, 228, makeCastMap([Q$Serializable, Q$HashMap, Q$Map]), LinkedHashMap_0);
_.containsKey = function containsKey_2(key){
  return this.map.containsKey(key);
}
;
_.entrySet_0 = function entrySet_2(){
  return new LinkedHashMap$EntrySet_0(this);
}
;
_.get = function get_5(key){
  return $get_5(this, key);
}
;
_.put = function put_2(key, value){
  return $put_0(this, key, value);
}
;
_.remove = function remove_11(key){
  var entry;
  entry = dynamicCast(this.map.remove(key), Q$LinkedHashMap$ChainEntry);
  if (entry) {
    $remove_1(entry);
    return entry.value;
  }
  return null;
}
;
_.size_0 = function size_8(){
  return this.map.size_0();
}
;
_.accessOrder = false;
function $setValue(this$static, value){
  var old;
  old = this$static.value;
  this$static.value = value;
  return old;
}

function MapEntryImpl_0(key, value){
  this.key = key;
  this.value = value;
}

defineSeed(232, 204, makeCastMap([Q$Map$Entry]), MapEntryImpl_0);
_.getKey = function getKey_2(){
  return this.key;
}
;
_.getValue = function getValue_2(){
  return this.value;
}
;
_.setValue = function setValue_2(value){
  return $setValue(this, value);
}
;
_.key = null;
_.value = null;
function $addToEnd(this$static){
  var tail;
  tail = this$static.this$0.head.prev;
  this$static.prev = tail;
  this$static.next = this$static.this$0.head;
  tail.next = this$static.this$0.head.prev = this$static;
}

function $remove_1(this$static){
  this$static.next.prev = this$static.prev;
  this$static.prev.next = this$static.next;
  this$static.next = this$static.prev = null;
}

function LinkedHashMap$ChainEntry_0(this$0){
  LinkedHashMap$ChainEntry_1.call(this, this$0, null, null);
}

function LinkedHashMap$ChainEntry_1(this$0, key, value){
  this.this$0 = this$0;
  MapEntryImpl_0.call(this, key, value);
  this.next = this.prev = null;
}

defineSeed(231, 232, makeCastMap([Q$LinkedHashMap$ChainEntry, Q$Map$Entry]), LinkedHashMap$ChainEntry_0, LinkedHashMap$ChainEntry_1);
_.next = null;
_.prev = null;
_.this$0 = null;
function LinkedHashMap$EntrySet_0(this$0){
  this.this$0 = this$0;
}

defineSeed(233, 201, makeCastMap([Q$Set]), LinkedHashMap$EntrySet_0);
_.contains_0 = function contains_4(o){
  var entry, key, value;
  if (!instanceOf(o, Q$Map$Entry)) {
    return false;
  }
  entry = dynamicCast(o, Q$Map$Entry);
  key = entry.getKey();
  if ($containsKey(this.this$0, key)) {
    value = $get_5(this.this$0, key);
    return equalsWithNullCheck(entry.getValue(), value);
  }
  return false;
}
;
_.iterator = function iterator_7(){
  return new LinkedHashMap$EntrySet$EntryIterator_0(this);
}
;
_.size_0 = function size_9(){
  return this.this$0.map.size_0();
}
;
_.this$0 = null;
function $next_1(this$static){
  if (this$static.next == this$static.this$1.this$0.head) {
    throw new NoSuchElementException_0;
  }
  this$static.last = this$static.next;
  this$static.next = this$static.next.next;
  return this$static.last;
}

function LinkedHashMap$EntrySet$EntryIterator_0(this$1){
  this.this$1 = this$1;
  this.next = this$1.this$0.head.next;
}

defineSeed(234, 1, {}, LinkedHashMap$EntrySet$EntryIterator_0);
_.hasNext = function hasNext_4(){
  return this.next != this.this$1.this$0.head;
}
;
_.next_0 = function next_5(){
  return $next_1(this);
}
;
_.remove_0 = function remove_12(){
  if (!this.last) {
    throw new IllegalStateException_1('No current entry');
  }
  $remove_1(this.last);
  this.this$1.this$0.map.remove(this.last.key);
  this.last = null;
}
;
_.last = null;
_.next = null;
_.this$1 = null;
function $addBefore(this$static, o, target){
  new LinkedList$Node_1(o, target);
  ++this$static.size;
}

function $addLast(this$static, o){
  new LinkedList$Node_1(o, this$static.header);
  ++this$static.size;
}

function $listIterator(this$static, index){
  var i_0, node;
  (index < 0 || index > this$static.size) && indexOutOfBounds(index, this$static.size);
  if (index >= ~~this$static.size >> 1) {
    node = this$static.header;
    for (i_0 = this$static.size; i_0 > index; --i_0) {
      node = node.prev;
    }
  }
   else {
    node = this$static.header.next;
    for (i_0 = 0; i_0 < index; ++i_0) {
      node = node.next;
    }
  }
  return new LinkedList$ListIteratorImpl_0(this$static, index, node);
}

function $removeLast(this$static){
  var node;
  $throwEmptyException(this$static);
  --this$static.size;
  node = this$static.header.prev;
  $remove_3(node);
  return node.value;
}

function $throwEmptyException(this$static){
  if (this$static.size == 0) {
    throw new NoSuchElementException_0;
  }
}

function LinkedList_0(){
  this.header = new LinkedList$Node_0;
  this.size = 0;
}

defineSeed(235, 211, makeCastMap([Q$Serializable, Q$List]), LinkedList_0);
_.add = function add_9(o){
  new LinkedList$Node_1(o, this.header);
  ++this.size;
  return true;
}
;
_.size_0 = function size_10(){
  return this.size;
}
;
_.header = null;
_.size = 0;
function $next_2(this$static){
  if (this$static.currentNode == this$static.this$0.header) {
    throw new NoSuchElementException_0;
  }
  this$static.lastNode = this$static.currentNode;
  this$static.currentNode = this$static.currentNode.next;
  ++this$static.currentIndex;
  return this$static.lastNode.value;
}

function $remove_2(this$static){
  $verifyCurrentElement(this$static);
  this$static.currentNode == this$static.lastNode?(this$static.currentNode = this$static.lastNode.next):--this$static.currentIndex;
  $remove_3(this$static.lastNode);
  this$static.lastNode = null;
  --this$static.this$0.size;
}

function $verifyCurrentElement(this$static){
  if (!this$static.lastNode) {
    throw new IllegalStateException_0;
  }
}

function LinkedList$ListIteratorImpl_0(this$0, index, startNode){
  this.this$0 = this$0;
  this.currentNode = startNode;
  this.currentIndex = index;
}

defineSeed(236, 1, {}, LinkedList$ListIteratorImpl_0);
_.hasNext = function hasNext_5(){
  return this.currentNode != this.this$0.header;
}
;
_.next_0 = function next_6(){
  return $next_2(this);
}
;
_.remove_0 = function remove_13(){
  $remove_2(this);
}
;
_.currentIndex = 0;
_.currentNode = null;
_.lastNode = null;
_.this$0 = null;
function $remove_3(this$static){
  this$static.next.prev = this$static.prev;
  this$static.prev.next = this$static.next;
  this$static.next = this$static.prev = this$static;
}

function LinkedList$Node_0(){
  this.next = this.prev = this;
}

function LinkedList$Node_1(value, nextNode){
  this.value = value;
  this.next = nextNode;
  this.prev = nextNode.prev;
  nextNode.prev.next = this;
  nextNode.prev = this;
}

defineSeed(237, 1, {}, LinkedList$Node_0, LinkedList$Node_1);
_.next = null;
_.prev = null;
_.value = null;
function NoSuchElementException_0(){
  RuntimeException_0.call(this);
}

defineSeed(238, 6, makeCastMap([Q$Serializable, Q$Exception, Q$Throwable, Q$NoSuchElementException]), NoSuchElementException_0);
function $mergeHeaps(this$static, node){
  var heapSize, smallestChild, value, leftChild, rightChild, smallestChild_0;
  heapSize = this$static.heap.size;
  value = $get_4(this$static.heap, node);
  while (node * 2 + 1 < heapSize) {
    smallestChild = (leftChild = 2 * node + 1 , rightChild = leftChild + 1 , smallestChild_0 = leftChild , rightChild < heapSize && $compare_0($get_4(this$static.heap, rightChild), $get_4(this$static.heap, leftChild)) < 0 && (smallestChild_0 = rightChild) , smallestChild_0);
    if ($compare_0(value, $get_4(this$static.heap, smallestChild)) < 0) {
      break;
    }
    $set_7(this$static.heap, node, $get_4(this$static.heap, smallestChild));
    node = smallestChild;
  }
  $set_7(this$static.heap, node, value);
}

function $offer(this$static, e){
  var childNode, node;
  node = this$static.heap.size;
  $add_0(this$static.heap, e);
  while (node > 0) {
    childNode = node;
    node = ~~((node - 1) / 2);
    if ($compare_0($get_4(this$static.heap, node), e) <= 0) {
      $set_7(this$static.heap, childNode, e);
      return true;
    }
    $set_7(this$static.heap, childNode, $get_4(this$static.heap, node));
  }
  $set_7(this$static.heap, node, e);
  return true;
}

function $poll(this$static){
  var value;
  if (this$static.heap.size == 0) {
    return null;
  }
  value = $get_4(this$static.heap, 0);
  $removeAtIndex(this$static);
  return value;
}

function $removeAtIndex(this$static){
  var lastValue;
  lastValue = $remove_0(this$static.heap, this$static.heap.size - 1);
  if (0 < this$static.heap.size) {
    $set_7(this$static.heap, 0, lastValue);
    $mergeHeaps(this$static, 0);
  }
}

function $toArray_1(this$static, a){
  return $toArray_0(this$static.heap, a);
}

function PriorityQueue_0(cmp){
  this.heap = new ArrayList_1;
  this.cmp = cmp;
}

defineSeed(239, 210, {}, PriorityQueue_0);
_.contains_0 = function contains_5(o){
  return $indexOf_1(this.heap, o, 0) != -1;
}
;
_.iterator = function iterator_8(){
  return new Collections$UnmodifiableCollectionIterator_0(unmodifiableList(this.heap).coll.iterator());
}
;
_.size_0 = function size_11(){
  return this.heap.size;
}
;
_.toArray = function toArray_3(){
  return $toArray(this.heap);
}
;
_.toArray_0 = function toArray_4(a){
  return $toArray_0(this.heap, a);
}
;
_.toString$ = function toString_30(){
  return $toString_2(this.heap);
}
;
_.cmp = null;
_.heap = null;
function $clinit_TreeMap(){
  $clinit_TreeMap = nullMethod;
  DEFAULT_COMPARATOR = new TreeMap$1_0;
}

function $get_6(this$static, k_0){
  var entry;
  entry = $getEntry(this$static, k_0);
  return entry?entry.value:null;
}

function $getEntry(this$static, key){
  var c, tree;
  tree = this$static.root;
  while (tree) {
    c = $compare_2(key, tree.key);
    if (c == 0) {
      return tree;
    }
    c < 0?(tree = tree.child[0]):(tree = tree.child[1]);
  }
  return null;
}

function $getFirstNode(this$static){
  var node;
  if (!this$static.root) {
    return null;
  }
  node = this$static.root;
  while (node.child[0]) {
    node = node.child[0];
  }
  return node;
}

function $getNodeAtOrAfter(this$static, key){
  var c, foundNode, node;
  foundNode = null;
  node = this$static.root;
  while (node) {
    c = $compare_2(key, node.key);
    if (c == 0) {
      return node;
    }
     else if (c > 0) {
      node = node.child[1];
    }
     else {
      foundNode = node;
      node = node.child[0];
    }
  }
  return foundNode;
}

function $insert_0(this$static, tree, newNode, state){
  var c, childNum;
  if (!tree) {
    return newNode;
  }
   else {
    c = $compare_2(tree.key, newNode.key);
    if (c == 0) {
      state.value = tree.value;
      state.found = true;
      tree.value = newNode.value;
      return tree;
    }
    childNum = c > 0?0:1;
    tree.child[childNum] = $insert_0(this$static, tree.child[childNum], newNode, state);
    if ($isRed(tree.child[childNum])) {
      if ($isRed(tree.child[1 - childNum])) {
        tree.isRed = true;
        tree.child[0].isRed = false;
        tree.child[1].isRed = false;
      }
       else {
        $isRed(tree.child[childNum].child[childNum])?(tree = $rotateSingle(tree, 1 - childNum)):$isRed(tree.child[childNum].child[1 - childNum]) && (tree = (tree.child[1 - (1 - childNum)] = $rotateSingle(tree.child[1 - (1 - childNum)], 1 - (1 - childNum)) , $rotateSingle(tree, 1 - childNum)));
      }
    }
  }
  return tree;
}

function $isRed(node){
  return !!node && node.isRed;
}

function $put_1(this$static, key, value){
  var node, state;
  node = new TreeMap$Node_0(key, value);
  state = new TreeMap$State_0;
  this$static.root = $insert_0(this$static, this$static.root, node, state);
  state.found || ++this$static.size;
  this$static.root.isRed = false;
  return state.value;
}

function $remove_4(this$static, keyObj){
  var state;
  state = new TreeMap$State_0;
  $removeWithState(this$static, keyObj, state);
  return state.value;
}

function $removeWithState(this$static, key, state){
  var c, dir, dir2, found, grandparent, head, last, newNode, node, parent_0, sibling;
  if (!this$static.root) {
    return false;
  }
  found = null;
  parent_0 = null;
  head = new TreeMap$Node_0(null, null);
  dir = 1;
  head.child[1] = this$static.root;
  node = head;
  while (node.child[dir]) {
    last = dir;
    grandparent = parent_0;
    parent_0 = node;
    node = node.child[dir];
    c = $compare_2(node.key, key);
    dir = c < 0?1:0;
    c == 0 && (!state.matchValue || equals__devirtual$(node.value, state.value)) && (found = node);
    if (!(!!node && node.isRed) && !$isRed(node.child[dir])) {
      if ($isRed(node.child[1 - dir])) {
        parent_0 = parent_0.child[last] = $rotateSingle(node, dir);
      }
       else if (!$isRed(node.child[1 - dir])) {
        sibling = parent_0.child[1 - last];
        if (sibling) {
          if (!$isRed(sibling.child[1 - last]) && !$isRed(sibling.child[last])) {
            parent_0.isRed = false;
            sibling.isRed = true;
            node.isRed = true;
          }
           else {
            dir2 = grandparent.child[1] == parent_0?1:0;
            $isRed(sibling.child[last])?(grandparent.child[dir2] = (parent_0.child[1 - last] = $rotateSingle(parent_0.child[1 - last], 1 - last) , $rotateSingle(parent_0, last))):$isRed(sibling.child[1 - last]) && (grandparent.child[dir2] = $rotateSingle(parent_0, last));
            node.isRed = grandparent.child[dir2].isRed = true;
            grandparent.child[dir2].child[0].isRed = false;
            grandparent.child[dir2].child[1].isRed = false;
          }
        }
      }
    }
  }
  if (found) {
    state.found = true;
    state.value = found.value;
    if (node != found) {
      newNode = new TreeMap$Node_0(node.key, node.value);
      $replaceNode_0(this$static, head, found, newNode);
      parent_0 == found && (parent_0 = newNode);
    }
    parent_0.child[parent_0.child[1] == node?1:0] = node.child[!node.child[0]?1:0];
    --this$static.size;
  }
  this$static.root = head.child[1];
  !!this$static.root && (this$static.root.isRed = false);
  return state.found;
}

function $replaceNode_0(this$static, head, node, newNode){
  var direction, parent_0;
  parent_0 = head;
  direction = parent_0.key == null || $compare_2(node.key, parent_0.key) > 0?1:0;
  while (parent_0.child[direction] != node) {
    parent_0 = parent_0.child[direction];
    direction = $compare_2(node.key, parent_0.key) > 0?1:0;
  }
  parent_0.child[direction] = newNode;
  newNode.isRed = node.isRed;
  newNode.child[0] = node.child[0];
  newNode.child[1] = node.child[1];
  node.child[0] = null;
  node.child[1] = null;
}

function $rotateSingle(tree, rotateDirection){
  var save;
  save = tree.child[1 - rotateDirection];
  tree.child[1 - rotateDirection] = save.child[rotateDirection];
  save.child[rotateDirection] = tree;
  tree.isRed = true;
  save.isRed = false;
  return save;
}

function $subMap(this$static, fromKey, toKey){
  return new TreeMap$SubMap_0(this$static, ($clinit_TreeMap$SubMapType() , Range_0), fromKey, toKey);
}

function $tailMap(this$static, fromKey){
  return new TreeMap$SubMap_0(this$static, ($clinit_TreeMap$SubMapType() , Tail), fromKey, null);
}

function TreeMap_0(){
  $clinit_TreeMap();
  TreeMap_1.call(this, null);
}

function TreeMap_1(c){
  this.root = null;
  !c && (c = DEFAULT_COMPARATOR);
  this.cmp = c;
}

function throwNSE(node){
  $clinit_TreeMap();
  if (!node) {
    throw new NoSuchElementException_0;
  }
  return node;
}

defineSeed(240, 199, makeCastMap([Q$Serializable, Q$Map]), TreeMap_0);
_.containsKey = function containsKey_3(key){
  return !!$getEntry(this, key);
}
;
_.entrySet_0 = function entrySet_3(){
  return new TreeMap$EntrySet_0(this);
}
;
_.firstKey = function firstKey(){
  return throwNSE($getFirstNode(this)).key;
}
;
_.get = function get_6(k_0){
  return $get_6(this, k_0);
}
;
_.put = function put_3(key, value){
  return $put_1(this, key, value);
}
;
_.remove = function remove_14(keyObj){
  return $remove_4(this, keyObj);
}
;
_.size_0 = function size_12(){
  return this.size;
}
;
_.tailMap = function tailMap(fromKey){
  return $tailMap(this, fromKey);
}
;
_.cmp = null;
_.root = null;
_.size = 0;
var DEFAULT_COMPARATOR;
function $compare_1(a, b){
  if (a == null || b == null) {
    throw new NullPointerException_0;
  }
  return a.compareTo$(b);
}

function $compare_2(a, b){
  return $compare_1(dynamicCast(a, Q$Comparable), dynamicCast(b, Q$Comparable));
}

function TreeMap$1_0(){
}

defineSeed(241, 1, {}, TreeMap$1_0);
_.compare = function compare_2(a, b){
  return $compare_2(a, b);
}
;
function $inOrderAdd(this$static, list, type, current, fromKey, toKey){
  if (!current) {
    return;
  }
  !!current.child[0] && $inOrderAdd(this$static, list, type, current.child[0], fromKey, toKey);
  $inRange(this$static, type, current.key, fromKey, toKey) && list.add(current);
  !!current.child[1] && $inOrderAdd(this$static, list, type, current.child[1], fromKey, toKey);
}

function $inRange(this$static, type, key, fromKey, toKey){
  if (type.toKeyValid()) {
    if ($compare_2(key, toKey) >= 0) {
      return false;
    }
  }
  if (type.fromKeyValid()) {
    if ($compare_2(key, fromKey) < 0) {
      return false;
    }
  }
  return true;
}

function TreeMap$EntryIterator_0(this$0){
  TreeMap$EntryIterator_1.call(this, this$0, ($clinit_TreeMap$SubMapType() , All), null, null);
}

function TreeMap$EntryIterator_1(this$0, type, fromKey, toKey){
  var list;
  this.this$0 = this$0;
  list = new ArrayList_0;
  $inOrderAdd(this, list, type, this$0.root, fromKey, toKey);
  this.iter = new AbstractList$IteratorImpl_0(list);
}

defineSeed(242, 1, {}, TreeMap$EntryIterator_0, TreeMap$EntryIterator_1);
_.hasNext = function hasNext_6(){
  return $hasNext(this.iter);
}
;
_.next_0 = function next_7(){
  return this.last = dynamicCast($next(this.iter), Q$Map$Entry);
}
;
_.remove_0 = function remove_15(){
  $remove(this.iter);
  $remove_4(this.this$0, this.last.getKey());
}
;
_.iter = null;
_.last = null;
_.this$0 = null;
function TreeMap$EntrySet_0(this$0){
  this.this$0 = this$0;
}

defineSeed(243, 201, makeCastMap([Q$Set]), TreeMap$EntrySet_0);
_.contains_0 = function contains_6(o){
  var entry, lookupEntry;
  if (!instanceOf(o, Q$Map$Entry)) {
    return false;
  }
  entry = dynamicCast(o, Q$Map$Entry);
  lookupEntry = $getEntry(this.this$0, entry.getKey());
  return !!lookupEntry && equalsWithNullCheck(lookupEntry.value, entry.getValue());
}
;
_.iterator = function iterator_9(){
  return new TreeMap$EntryIterator_0(this.this$0);
}
;
_.size_0 = function size_13(){
  return this.this$0.size;
}
;
_.this$0 = null;
function TreeMap$Node_0(key, value){
  this.key = key;
  this.value = value;
  this.child = initDim(_3Ljava_util_TreeMap$Node_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$TreeMap$Node, 2, 0);
  this.isRed = true;
}

defineSeed(244, 1, makeCastMap([Q$Map$Entry, Q$TreeMap$Node]), TreeMap$Node_0);
_.equals$ = function equals_26(o){
  var other;
  if (!instanceOf(o, Q$Map$Entry)) {
    return false;
  }
  other = dynamicCast(o, Q$Map$Entry);
  return equalsWithNullCheck(this.key, other.getKey()) && equalsWithNullCheck(this.value, other.getValue());
}
;
_.getKey = function getKey_3(){
  return this.key;
}
;
_.getValue = function getValue_3(){
  return this.value;
}
;
_.hashCode$ = function hashCode_26(){
  var keyHash, valueHash;
  keyHash = this.key != null?hashCode__devirtual$(this.key):0;
  valueHash = this.value != null?hashCode__devirtual$(this.value):0;
  return keyHash ^ valueHash;
}
;
_.setValue = function setValue_3(value){
  var old;
  old = this.value;
  this.value = value;
  return old;
}
;
_.toString$ = function toString_31(){
  return this.key + '=' + this.value;
}
;
_.child = null;
_.isRed = false;
_.key = null;
_.value = null;
function TreeMap$State_0(){
}

defineSeed(245, 1, {}, TreeMap$State_0);
_.toString$ = function toString_32(){
  return 'State: mv=' + this.matchValue + ' value=' + this.value + ' done=' + this.done + ' found=' + this.found;
}
;
_.done = false;
_.found = false;
_.matchValue = false;
_.value = null;
function $inRange_0(this$static, key){
  if (this$static.type_0.toKeyValid()) {
    if ($compare_2(key, this$static.toKey) >= 0) {
      return false;
    }
  }
  if (this$static.type_0.fromKeyValid()) {
    if ($compare_2(key, this$static.fromKey) < 0) {
      return false;
    }
  }
  return true;
}

function TreeMap$SubMap_0(this$0, type, fromKey, toKey){
  this.this$0 = this$0;
  switch (type.ordinal) {
    case 2:
      if ($compare_2(toKey, fromKey) < 0) {
        throw new IllegalArgumentException_1('subMap: ' + toKey + ' less than ' + fromKey);
      }

      break;
    case 1:
      $compare_2(toKey, toKey);
      break;
    case 3:
      $compare_2(fromKey, fromKey);
  }
  this.type_0 = type;
  this.fromKey = fromKey;
  this.toKey = toKey;
}

defineSeed(246, 199, makeCastMap([Q$Map]), TreeMap$SubMap_0);
_.containsKey = function containsKey_4(k_0){
  if (!$inRange_0(this, k_0)) {
    return false;
  }
  return !!$getEntry(this.this$0, k_0);
}
;
_.entrySet_0 = function entrySet_4(){
  return new TreeMap$SubMap$1_0(this);
}
;
_.firstKey = function firstKey_0(){
  var node, node_0;
  node = throwNSE((this.type_0.fromKeyValid()?(node_0 = $getNodeAtOrAfter(this.this$0, this.fromKey)):(node_0 = $getFirstNode(this.this$0)) , !!node_0 && $inRange_0(this, node_0.key)?node_0:null));
  if (this.type_0.toKeyValid() && $compare_2(node.key, this.toKey) > 0) {
    throw new NoSuchElementException_0;
  }
  return node.key;
}
;
_.get = function get_7(k_0){
  if (!$inRange_0(this, k_0)) {
    return null;
  }
  return $get_6(this.this$0, k_0);
}
;
_.put = function put_4(key, value){
  if (!$inRange_0(this, key)) {
    throw new IllegalArgumentException_1(key + ' outside the range ' + this.fromKey + ' to ' + this.toKey);
  }
  return $put_1(this.this$0, key, value);
}
;
_.remove = function remove_16(k_0){
  if (!$inRange_0(this, k_0)) {
    return null;
  }
  return $remove_4(this.this$0, k_0);
}
;
_.tailMap = function tailMap_0(fromKey){
  if (this.type_0.fromKeyValid() && $compare_2(fromKey, this.fromKey) < 0) {
    throw new IllegalArgumentException_1('subMap: ' + fromKey + ' less than ' + this.fromKey);
  }
  return this.type_0.toKeyValid()?$subMap(this.this$0, fromKey, this.toKey):$tailMap(this.this$0, fromKey);
}
;
_.fromKey = null;
_.this$0 = null;
_.toKey = null;
_.type_0 = null;
function TreeMap$SubMap$1_0(this$1){
  this.this$1 = this$1;
}

defineSeed(247, 201, makeCastMap([Q$Set]), TreeMap$SubMap$1_0);
_.contains_0 = function contains_7(o){
  var entry, key, lookupEntry;
  if (!instanceOf(o, Q$Map$Entry)) {
    return false;
  }
  entry = dynamicCast(o, Q$Map$Entry);
  key = entry.getKey();
  if (!$inRange_0(this.this$1, key)) {
    return false;
  }
  lookupEntry = $getEntry(this.this$1.this$0, key);
  return !!lookupEntry && equalsWithNullCheck(lookupEntry.value, entry.getValue());
}
;
_.iterator = function iterator_10(){
  return new TreeMap$EntryIterator_1(this.this$1.this$0, this.this$1.type_0, this.this$1.fromKey, this.this$1.toKey);
}
;
_.size_0 = function size_14(){
  var it, n;
  n = 0;
  it = new TreeMap$EntryIterator_1(this.this$1.this$0, this.this$1.type_0, this.this$1.fromKey, this.this$1.toKey);
  while ($hasNext(it.iter)) {
    it.last = dynamicCast($next(it.iter), Q$Map$Entry);
    ++n;
  }
  return n;
}
;
_.this$1 = null;
function $clinit_TreeMap$SubMapType(){
  $clinit_TreeMap$SubMapType = nullMethod;
  All = new TreeMap$SubMapType_0('All', 0);
  Head = new TreeMap$SubMapType$1_0;
  Range_0 = new TreeMap$SubMapType$2_0;
  Tail = new TreeMap$SubMapType$3_0;
  $VALUES_1 = initValues(_3Ljava_util_TreeMap$SubMapType_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$TreeMap$SubMapType, [All, Head, Range_0, Tail]);
}

function TreeMap$SubMapType_0(enum$name, enum$ordinal){
  Enum_0.call(this, enum$name, enum$ordinal);
}

function values_2(){
  $clinit_TreeMap$SubMapType();
  return $VALUES_1;
}

defineSeed(248, 46, makeCastMap([Q$Serializable, Q$Comparable, Q$Enum, Q$TreeMap$SubMapType]), TreeMap$SubMapType_0);
_.fromKeyValid = function fromKeyValid(){
  return false;
}
;
_.toKeyValid = function toKeyValid(){
  return false;
}
;
var $VALUES_1, All, Head, Range_0, Tail;
function TreeMap$SubMapType$1_0(){
  Enum_0.call(this, 'Head', 1);
}

defineSeed(249, 248, makeCastMap([Q$Serializable, Q$Comparable, Q$Enum, Q$TreeMap$SubMapType]), TreeMap$SubMapType$1_0);
_.toKeyValid = function toKeyValid_0(){
  return true;
}
;
function TreeMap$SubMapType$2_0(){
  Enum_0.call(this, 'Range', 2);
}

defineSeed(250, 248, makeCastMap([Q$Serializable, Q$Comparable, Q$Enum, Q$TreeMap$SubMapType]), TreeMap$SubMapType$2_0);
_.fromKeyValid = function fromKeyValid_0(){
  return true;
}
;
_.toKeyValid = function toKeyValid_1(){
  return true;
}
;
function TreeMap$SubMapType$3_0(){
  Enum_0.call(this, 'Tail', 3);
}

defineSeed(251, 248, makeCastMap([Q$Serializable, Q$Comparable, Q$Enum, Q$TreeMap$SubMapType]), TreeMap$SubMapType$3_0);
_.fromKeyValid = function fromKeyValid_1(){
  return true;
}
;
function $add_2(this$static, o){
  return this$static.map.put(o, ($clinit_Boolean() , FALSE_0)) == null;
}

function $contains(this$static, o){
  return this$static.map.containsKey(o);
}

function $remove_5(this$static, o){
  return this$static.map.remove(o) != null;
}

function $tailSet(this$static, fromElement){
  return new TreeSet_1(this$static.map.tailMap(fromElement));
}

function TreeSet_0(){
  this.map = new TreeMap_0;
}

function TreeSet_1(map){
  this.map = map;
}

defineSeed(252, 201, makeCastMap([Q$Serializable, Q$Set]), TreeSet_0, TreeSet_1);
_.add = function add_10(o){
  return $add_2(this, o);
}
;
_.contains_0 = function contains_8(o){
  return this.map.containsKey(o);
}
;
_.iterator = function iterator_11(){
  return this.map.keySet_0().iterator();
}
;
_.size_0 = function size_15(){
  return this.map.size_0();
}
;
_.map = null;
function equalsWithNullCheck(a, b){
  return maskUndefined(a) === maskUndefined(b) || a != null && equals__devirtual$(a, b);
}

function $clinit_Level(){
  $clinit_Level = nullMethod;
  ALL = new Level$LevelAll_0;
  CONFIG = new Level$LevelConfig_0;
  FINE = new Level$LevelFine_0;
  FINER = new Level$LevelFiner_0;
  FINEST = new Level$LevelFinest_0;
  INFO = new Level$LevelInfo_0;
  OFF = new Level$LevelOff_0;
  SEVERE = new Level$LevelSevere_0;
  WARNING = new Level$LevelWarning_0;
}

defineSeed(254, 1, makeCastMap([Q$Serializable]));
_.getName = function getName(){
  return 'DUMMY';
}
;
_.intValue = function intValue(){
  return -1;
}
;
_.toString$ = function toString_33(){
  return this.getName();
}
;
var ALL, CONFIG, FINE, FINER, FINEST, INFO, OFF, SEVERE, WARNING;
function Level$LevelAll_0(){
}

defineSeed(255, 254, makeCastMap([Q$Serializable]), Level$LevelAll_0);
_.getName = function getName_0(){
  return 'ALL';
}
;
_.intValue = function intValue_0(){
  return -2147483648;
}
;
function Level$LevelConfig_0(){
}

defineSeed(256, 254, makeCastMap([Q$Serializable]), Level$LevelConfig_0);
_.getName = function getName_1(){
  return 'CONFIG';
}
;
_.intValue = function intValue_1(){
  return 700;
}
;
function Level$LevelFine_0(){
}

defineSeed(257, 254, makeCastMap([Q$Serializable]), Level$LevelFine_0);
_.getName = function getName_2(){
  return 'FINE';
}
;
_.intValue = function intValue_2(){
  return 500;
}
;
function Level$LevelFiner_0(){
}

defineSeed(258, 254, makeCastMap([Q$Serializable]), Level$LevelFiner_0);
_.getName = function getName_3(){
  return 'FINER';
}
;
_.intValue = function intValue_3(){
  return 400;
}
;
function Level$LevelFinest_0(){
}

defineSeed(259, 254, makeCastMap([Q$Serializable]), Level$LevelFinest_0);
_.getName = function getName_4(){
  return 'FINEST';
}
;
_.intValue = function intValue_4(){
  return 300;
}
;
function Level$LevelInfo_0(){
}

defineSeed(260, 254, makeCastMap([Q$Serializable]), Level$LevelInfo_0);
_.getName = function getName_5(){
  return 'INFO';
}
;
_.intValue = function intValue_5(){
  return 800;
}
;
function Level$LevelOff_0(){
}

defineSeed(261, 254, makeCastMap([Q$Serializable]), Level$LevelOff_0);
_.getName = function getName_6(){
  return 'OFF';
}
;
_.intValue = function intValue_6(){
  return 2147483647;
}
;
function Level$LevelSevere_0(){
}

defineSeed(262, 254, makeCastMap([Q$Serializable]), Level$LevelSevere_0);
_.getName = function getName_7(){
  return 'SEVERE';
}
;
_.intValue = function intValue_7(){
  return 1000;
}
;
function Level$LevelWarning_0(){
}

defineSeed(263, 254, makeCastMap([Q$Serializable]), Level$LevelWarning_0);
_.getName = function getName_8(){
  return 'WARNING';
}
;
_.intValue = function intValue_8(){
  return 900;
}
;
function $addLogger(this$static, logger){
  if ($getLogger(this$static, logger.impl.name_0)) {
    return false;
  }
  $addLoggerWithoutDuplicationChecking(this$static, logger);
  return true;
}

function $addLoggerWithoutDuplicationChecking(this$static, logger){
  var name_0, parent_0, parentName;
  name_0 = logger.impl.name_0;
  parentName = $substring_0(name_0, 0, max(0, $lastIndexOf(name_0, fromCodePoint(46))));
  parent_0 = $getOrAddLogger(this$static, parentName);
  this$static.loggerList.put(logger.impl.name_0, logger);
  $setParent(logger.impl, parent_0);
}

function $getLogger(this$static, name_0){
  return dynamicCast(this$static.loggerList.get(name_0), Q$Logger);
}

function $getOrAddLogger(this$static, name_0){
  var logger, newLogger;
  logger = dynamicCast(this$static.loggerList.get(name_0), Q$Logger);
  if (!logger) {
    newLogger = new Logger_0(name_0);
    $addLoggerWithoutDuplicationChecking(this$static, newLogger);
    return newLogger;
  }
  return logger;
}

function LogManager_0(){
  this.loggerList = new HashMap_0;
  this.rootLogger = new LogManager$RootLogger_0;
  this.loggerList.put('', this.rootLogger);
}

defineSeed(264, 1, {}, LogManager_0);
_.loggerList = null;
_.rootLogger = null;
var singleton = null;
function LogManager$RootLogger_0(){
  $clinit_Logger();
  Logger_0.call(this, '');
  $setLevel_1(this, ($clinit_Level() , ALL));
}

defineSeed(265, 105, makeCastMap([Q$Logger]), LogManager$RootLogger_0);
function $setLoggerName(this$static, newName){
  this$static.loggerName = newName;
}

function LogRecord_0(level, msg){
  this.level = level;
  this.msg_0 = msg;
  this.millis = fromDouble((new Date_1).jsdate.getTime());
}

defineSeed(266, 1, makeCastMap([Q$Serializable]), LogRecord_0);
_.level = null;
_.loggerName = '';
_.millis = P0_longLit;
_.msg_0 = null;
_.thrown = null;
function $consoleLog(msg){
  window.console?window.console.log(msg):(document.title = 'LOG:' + msg);
}

function $println(this$static, s){
  $append_5(this$static.buf, s);
  $consoleLog($toString_1(this$static.buf));
  $setLength(this$static.buf);
}

function ConsolePrintStream_0(){
  this.buf = new StringBuilder_0;
}

defineSeed(267, 167, {}, ConsolePrintStream_0);
_.print_0 = function print_1(c){
  c == 10?$println(this, ''):$append_3(this.buf, c);
}
;
_.println = function println_0(s){
  $println(this, s);
}
;
function $clinit_ScrambleJsEntryPoint(){
  $clinit_ScrambleJsEntryPoint = nullMethod;
  resources = new HashMap_0;
  resources.put('puzzle/222.png', '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');
  resources.put('puzzle/333.png', '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');
  resources.put('puzzle/444.png', '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');
  resources.put('puzzle/444fast.png', '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');
  resources.put('puzzle/555.png', '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');
  resources.put('puzzle/clock.png', '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');
  resources.put('puzzle/mega.png', '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');
  resources.put('puzzle/puzzles', 'IyBDb21tZW50cyBpbW1lZGlhdGVseSBwcmVjZWRpbmcgYSBwbHVnaW4gZGVmaW5pdGlvbiBhcmUgYSBkZXRhaWxlZCBkZXNjcmlwdGlvbgojIG9mIHRoYXQgcGx1Z2luLgoKIzJ4MngyCjIyMiBwdXp6bGUuVHdvQnlUd29DdWJlUHV6emxlKCkKIzN4M3gzCjMzMyBwdXp6bGUuVGhyZWVCeVRocmVlQ3ViZVB1enpsZSgpCiM0eDR4NAo0NDQgcHV6emxlLkZvdXJCeUZvdXJDdWJlUHV6emxlKCkKIzR4NHg0IChmYXN0LCB1bm9mZmljaWFsKQo0NDRmYXN0IHB1enpsZS5Gb3VyQnlGb3VyUmFuZG9tVHVybnNDdWJlUHV6emxlKCkKIzV4NXg1CjU1NSBwdXp6bGUuQ3ViZVB1enpsZSg1KQojNng2eDYKNjY2IHB1enpsZS5DdWJlUHV6emxlKDYpCiM3eDd4Nwo3NzcgcHV6emxlLkN1YmVQdXp6bGUoNykKCiMzeDN4MyBubyBpbnNwZWN0aW9uCjMzM25pIHB1enpsZS5Ob0luc3BlY3Rpb25UaHJlZUJ5VGhyZWVDdWJlUHV6emxlKCkKIzR4NHg0IG5vIGluc3BlY3Rpb24KNDQ0bmkgcHV6emxlLk5vSW5zcGVjdGlvbkZvdXJCeUZvdXJDdWJlUHV6emxlKCkKIzV4NXg1IG5vIGluc3BlY3Rpb24KNTU1bmkgcHV6emxlLk5vSW5zcGVjdGlvbkZpdmVCeUZpdmVDdWJlUHV6emxlKCkKCiMzeDN4MyBGZXdlc3QgTW92ZXMKMzMzZm0gcHV6emxlLlRocmVlQnlUaHJlZUN1YmVGZXdlc3RNb3Zlc1B1enpsZSgpCgojUHlyYW1pbngKcHlyYW0gcHV6emxlLlB5cmFtaW54UHV6emxlKCkKCiNTcXVhcmUtMQpzcTEgcHV6emxlLlNxdWFyZU9uZVB1enpsZSgpCiNTcXVhcmUtMSAoZmFzdCwgdW5vZmZpY2lhbCkKc3ExZmFzdCBwdXp6bGUuU3F1YXJlT25lVW5maWx0ZXJlZFB1enpsZSgpCgojTWVnYW1pbngKbWlueCBwdXp6bGUuTWVnYW1pbnhQdXp6bGUoKQoKI0Nsb2NrCmNsb2NrIHB1enpsZS5DbG9ja1B1enpsZSgpCgojU2tld2IKc2tld2IgcHV6emxlLlNrZXdiUHV6emxlKCkK');
  resources.put('puzzle/pyram.png', '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');
  resources.put('puzzle/sq1.png', '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');
}

function $onLoadImpl(){
  var scramblers = '# Comments immediately preceding a plugin definition are a detailed description\n# of that plugin.\n\n#2x2x2\n222 puzzle.TwoByTwoCubePuzzle()\n#3x3x3\n333 puzzle.ThreeByThreeCubePuzzle()\n#4x4x4\n444 puzzle.FourByFourCubePuzzle()\n#4x4x4 (fast, unofficial)\n444fast puzzle.FourByFourRandomTurnsCubePuzzle()\n#5x5x5\n555 puzzle.CubePuzzle(5)\n#6x6x6\n666 puzzle.CubePuzzle(6)\n#7x7x7\n777 puzzle.CubePuzzle(7)\n\n#3x3x3 no inspection\n333ni puzzle.NoInspectionThreeByThreeCubePuzzle()\n#4x4x4 no inspection\n444ni puzzle.NoInspectionFourByFourCubePuzzle()\n#5x5x5 no inspection\n555ni puzzle.NoInspectionFiveByFiveCubePuzzle()\n\n#3x3x3 Fewest Moves\n333fm puzzle.ThreeByThreeCubeFewestMovesPuzzle()\n\n#Pyraminx\npyram puzzle.PyraminxPuzzle()\n\n#Square-1\nsq1 puzzle.SquareOnePuzzle()\n#Square-1 (fast, unofficial)\nsq1fast puzzle.SquareOneUnfilteredPuzzle()\n\n#Megaminx\nminx puzzle.MegaminxPuzzle()\n\n#Clock\nclock puzzle.ClockPuzzle()\n\n#Skewb\nskewb puzzle.SkewbPuzzle()\n';
  var puzzles = {};
  var lines = scramblers.split('\n');
  var lastComment = null;
  for (var i_0 = 0; i_0 < lines.length; i_0++) {
    var line = lines[i_0].trim();
    if (line.length == 0) {
      lastComment = null;
      continue;
    }
    if (line[0] == '#') {
      lastComment = line.substring(1);
      continue;
    }
    var name_def = line.match(/([^\s]*)(.*)/);
    var name_0 = name_def[1];
    var definition = name_def[2];
    puzzles[name_0] = eval('new ' + definition);
  }
  $wnd.puzzlesLoaded && typeof $wnd.puzzlesLoaded == 'function' && $wnd.puzzlesLoaded(puzzles);
}

function $onModuleLoad_2(){
  var cps;
  sUncaughtExceptionHandler = null;
  $clinit_ExporterUtil();
  new PuzzleExporterImpl_0;
  new CubePuzzleExporterImpl_0;
  new TNoodleJsUtilsExporterImpl_0;
  new ClockPuzzleExporterImpl_0;
  new FourByFourCubePuzzleExporterImpl_0;
  new FourByFourRandomTurnsCubePuzzleExporterImpl_0;
  new MegaminxPuzzleExporterImpl_0;
  new NoInspectionFiveByFiveCubePuzzleExporterImpl_0;
  new NoInspectionFourByFourCubePuzzleExporterImpl_0;
  new NoInspectionThreeByThreeCubePuzzleExporterImpl_0;
  new PyraminxPuzzleExporterImpl_0;
  new SkewbPuzzleExporterImpl_0;
  new SquareOnePuzzleExporterImpl_0;
  new SquareOneUnfilteredPuzzleExporterImpl_0;
  new ThreeByThreeCubeFewestMovesPuzzleExporterImpl_0;
  new ThreeByThreeCubePuzzleExporterImpl_0;
  new TwoByTwoCubePuzzleExporterImpl_0;
  $onLoadImpl();
  cps = new ConsolePrintStream_0;
  $clinit_System();
  out_0 = cps;
  err = cps;
}

var resources;
function getLogLevel(){
  var level;
  return level = ($clinit_Logger() , $getLoggerHelper('')).impl.level , !level?null:level.getName();
}

function getLogLevel_0(loggerStr){
  var level;
  level = ($clinit_Logger() , $getLoggerHelper(loggerStr)).impl.level;
  return !level?null:level.getName();
}

function getPuzzleIcon(puzzle){
  var filename, image;
  filename = 'puzzle/' + puzzle.getShortName_0() + '.png';
  if (($clinit_ScrambleJsEntryPoint() , resources).containsKey(filename)) {
    image = new Image_1;
    $setUrl(image, ($clinit_UriUtils() , new SafeUriString_0('data:image/png;base64,' + dynamicCast(resources.get(filename), Q$String))));
    return image.element;
  }
  return null;
}

function getPuzzleImageInfo(puzzle){
  var jso, pii;
  pii = $toJsonable(new PuzzleImageInfo_0(puzzle));
  jso = dynamicCast(toJSONValue(pii), Q$JSONObject);
  return jso.jsObject;
}

function scrambleToSvg(scramble, puzzle, scheme){
  var colorScheme, svg;
  colorScheme = $parseColorScheme(puzzle, scheme);
  svg = $drawScramble(puzzle, scramble, colorScheme);
  return $toString_4(svg);
}

function setLogLevel(levelStr){
  var level, logger;
  level = ($clinit_Level() , $parse(levelStr));
  azzert_1(!!level);
  logger = ($clinit_Logger() , $getLoggerHelper(''));
  $setLevel_0(logger.impl, level);
}

function setLogLevel_0(levelStr, loggerStr){
  var level, logger;
  level = ($clinit_Level() , $parse(levelStr));
  azzert_1(!!level);
  logger = ($clinit_Logger() , $getLoggerHelper(loggerStr));
  $setLevel_0(logger.impl, level);
}

function toJSONValue(obj){
  var arr, i_0, jsonArr, jsonObj, key, key$iterator, map;
  if (instanceOf(obj, Q$HashMap)) {
    map = dynamicCast(obj, Q$HashMap);
    jsonObj = new JSONObject_0;
    for (key$iterator = $iterator($keySet(map)); key$iterator.val$outerIter.hasNext();) {
      key = dynamicCast($next_0(key$iterator), Q$String);
      $put(jsonObj, key, toJSONValue(map.get(key)));
    }
    return jsonObj;
  }
   else if (instanceOf(obj, Q$String)) {
    return new JSONString_0(dynamicCast(obj, Q$String));
  }
   else if (instanceOf(obj, Q$Integer)) {
    return new JSONNumber_0(dynamicCast(obj, Q$Integer).value);
  }
   else if (instanceOf(obj, Q$double_$1)) {
    jsonArr = new JSONArray_0;
    arr = dynamicCast(obj, Q$double_$1);
    for (i_0 = 0; i_0 < arr.length; ++i_0) {
      $set(jsonArr, i_0, new JSONNumber_0(arr[i_0]));
    }
    return jsonArr;
  }
   else if (instanceOf(obj, Q$Object_$1)) {
    jsonArr = new JSONArray_0;
    arr = dynamicCast(obj, Q$Object_$1);
    for (i_0 = 0; i_0 < arr.length; ++i_0) {
      $set(jsonArr, i_0, toJSONValue(arr[i_0]));
    }
    return jsonArr;
  }
   else {
    azzert_2(false, 'Unrecognized type ' + getClass__devirtual$(obj));
    return null;
  }
}

function $export(this$static){
  if (!exported) {
    exported = true;
    $clinit_ExporterUtil();
    $addExporter(impl_4, Lnet_gnehzr_tnoodle_js_TNoodleJsUtils_2_classLit, this$static);
    new PuzzleExporterImpl_0;
    $export0(this$static);
  }
}

function $export0(this$static){
  var pkg = declarePackage('tnoodlejs');
  var __0, __ = this$static;
  $wnd.tnoodlejs = $entry(function(){
    var g, j = this, a = arguments;
    a.length == 1 && __.isAssignable(a[0]) && (g = a[0]);
    j.g = g;
    setWrapper(g, j);
    return j;
  }
  );
  __0 = $wnd.tnoodlejs.prototype = new Object;
  $wnd.tnoodlejs.getLogLevel = $entry(function(a0){
    return runDispatch(null, Lnet_gnehzr_tnoodle_js_TNoodleJsUtils_2_classLit, 1, arguments, true, false)[0];
  }
  );
  $wnd.tnoodlejs.getPuzzleIcon = $entry(function(a0){
    return getPuzzleIcon(gwtInstance(a0));
  }
  );
  $wnd.tnoodlejs.getPuzzleImageInfo = $entry(function(a0){
    return getPuzzleImageInfo(gwtInstance(a0));
  }
  );
  $wnd.tnoodlejs.getVersion = $entry(function(){
    return '0.13.3';
  }
  );
  $wnd.tnoodlejs.scrambleToSvg = $entry(function(a0, a1, a2){
    return scrambleToSvg(a0, gwtInstance(a1), a2);
  }
  );
  $wnd.tnoodlejs.setLogLevel = $entry(function(a0, a1){
    runDispatch(null, Lnet_gnehzr_tnoodle_js_TNoodleJsUtils_2_classLit, 0, arguments, true, false)[0];
  }
  );
  registerDispatchMap(Lnet_gnehzr_tnoodle_js_TNoodleJsUtils_2_classLit, {0:{1:[[setLogLevel, null, undefined, 'string']], 2:[[setLogLevel_0, null, undefined, 'string', 'string']]}, 1:{0:[[getLogLevel, null, undefined]], 1:[[getLogLevel_0, null, undefined, 'string']]}}, true);
  if (pkg)
    for (p in pkg)
      $wnd.tnoodlejs[p] === undefined && ($wnd.tnoodlejs[p] = pkg[p]);
}

function TNoodleJsUtilsExporterImpl_0(){
  $export(this);
}

defineSeed(270, 1, {}, TNoodleJsUtilsExporterImpl_0);
_.isAssignable = function isAssignable(o){
  return false;
}
;
var exported = false;
function $clinit_AlgorithmBuilder(){
  $clinit_AlgorithmBuilder = nullMethod;
  l_1 = ($clinit_Logger() , $getLoggerHelper(Lnet_gnehzr_tnoodle_scrambles_AlgorithmBuilder_2_classLit.typeName));
}

function $appendAlgorithm(this$static, algorithm){
  var move, move$array, move$index, move$max;
  for (move$array = splitAlgorithm(algorithm) , move$index = 0 , move$max = move$array.length; move$index < move$max; ++move$index) {
    move = move$array[move$index];
    $appendMove(this$static, move);
  }
}

function $appendAlgorithms(this$static, algorithms){
  var algorithm, algorithm$index, algorithm$max;
  for (algorithm$index = 0 , algorithm$max = algorithms.length; algorithm$index < algorithm$max; ++algorithm$index) {
    algorithm = algorithms[algorithm$index];
    $appendAlgorithm(this$static, algorithm);
  }
}

function $appendMove(this$static, newMove){
  var i_0, indexAndMove, newCostMove, oldCostMove;
  $fine_0(l_1, 'appendMove(' + newMove + ')');
  indexAndMove = $findBestIndexForMove(this$static, newMove, this$static.mergingMode);
  if (indexAndMove.index_0 < this$static.moves.size) {
    azzert_1(this$static.mergingMode != 0);
    oldCostMove = dynamicCast($get_4(this$static.states, indexAndMove.index_0), Q$Puzzle$PuzzleState).getMoveCost(dynamicCast($get_4(this$static.moves, indexAndMove.index_0), Q$String));
    if (indexAndMove.move == null) {
      $remove_0(this$static.moves, indexAndMove.index_0);
      $remove_0(this$static.states, indexAndMove.index_0 + 1);
      newCostMove = 0;
    }
     else {
      $set_7(this$static.moves, indexAndMove.index_0, indexAndMove.move);
      newCostMove = dynamicCast($get_4(this$static.states, indexAndMove.index_0), Q$Puzzle$PuzzleState).getMoveCost(indexAndMove.move);
    }
  }
   else {
    oldCostMove = 0;
    newCostMove = dynamicCast($get_4(this$static.states, this$static.states.size - 1), Q$Puzzle$PuzzleState).getMoveCost(indexAndMove.move);
    $add_0(this$static.moves, indexAndMove.move);
    $add_0(this$static.states, null);
  }
  this$static.totalCost += newCostMove - oldCostMove;
  for (i_0 = indexAndMove.index_0 + 1; i_0 < this$static.states.size; ++i_0) {
    $set_7(this$static.states, i_0, $apply(dynamicCast($get_4(this$static.states, i_0 - 1), Q$Puzzle$PuzzleState), dynamicCast($get_4(this$static.moves, i_0 - 1), Q$String)));
  }
  this$static.unNormalizedState = $apply(this$static.unNormalizedState, newMove);
  azzert_1(this$static.states.size == this$static.moves.size + 1);
  azzert_1($equalsNormalized(this$static.unNormalizedState, (azzert_1(this$static.states.size == this$static.moves.size + 1) , dynamicCast($get_4(this$static.states, this$static.states.size - 1), Q$Puzzle$PuzzleState))));
}

function $findBestIndexForMove(this$static, move, mergingMode){
  var alternateLastMove, lastMove, lastMoveIndex, newNormalizedState, newUnNormalizedState, ps, ps$iterator, stateAfterLastMove, stateAfterLastMoveAndNewMove, stateBeforeLastMove, successors;
  if (mergingMode == 0) {
    return new AlgorithmBuilder$IndexAndMove_0(this$static.moves.size, move);
  }
  newUnNormalizedState = $apply(this$static.unNormalizedState, move);
  if ($equalsNormalized(newUnNormalizedState, this$static.unNormalizedState)) {
    if (mergingMode == 1) {
      return new AlgorithmBuilder$IndexAndMove_0(0, null);
    }
  }
  newNormalizedState = newUnNormalizedState.getNormalized();
  successors = (azzert_1(this$static.states.size == this$static.moves.size + 1) , dynamicCast($get_4(this$static.states, this$static.states.size - 1), Q$Puzzle$PuzzleState)).getCanonicalMovesByState();
  move = null;
  for (ps$iterator = $iterator($keySet(successors)); ps$iterator.val$outerIter.hasNext();) {
    ps = dynamicCast($next_0(ps$iterator), Q$Puzzle$PuzzleState);
    if (ps.getNormalized().equals$(newNormalizedState.getNormalized())) {
      move = dynamicCast(successors.get(ps), Q$String);
      break;
    }
  }
  azzert_1(move != null);
  if (mergingMode == 1) {
    for (lastMoveIndex = this$static.moves.size - 1; lastMoveIndex >= 0; --lastMoveIndex) {
      lastMove = dynamicCast($get_4(this$static.moves, lastMoveIndex), Q$String);
      stateBeforeLastMove = dynamicCast($get_4(this$static.states, lastMoveIndex), Q$Puzzle$PuzzleState);
      if (!$movesCommute(stateBeforeLastMove, lastMove, move)) {
        break;
      }
      stateAfterLastMove = dynamicCast($get_4(this$static.states, lastMoveIndex + 1), Q$Puzzle$PuzzleState);
      stateAfterLastMoveAndNewMove = $apply(stateAfterLastMove, move);
      if (stateBeforeLastMove.getNormalized().equals$(stateAfterLastMoveAndNewMove.getNormalized())) {
        return new AlgorithmBuilder$IndexAndMove_0(lastMoveIndex, null);
      }
       else {
        successors = stateBeforeLastMove.getCanonicalMovesByState();
        for (ps$iterator = $iterator($keySet(successors)); ps$iterator.val$outerIter.hasNext();) {
          ps = dynamicCast($next_0(ps$iterator), Q$Puzzle$PuzzleState);
          if (ps.getNormalized().equals$(stateAfterLastMoveAndNewMove.getNormalized())) {
            alternateLastMove = dynamicCast(successors.get(ps), Q$String);
            return new AlgorithmBuilder$IndexAndMove_0(lastMoveIndex, alternateLastMove);
          }
        }
      }
    }
  }
  return new AlgorithmBuilder$IndexAndMove_0(this$static.moves.size, move);
}

function $isRedundant(this$static, move){
  var indexAndMove;
  indexAndMove = $findBestIndexForMove(this$static, move, 1);
  return indexAndMove.index_0 < this$static.moves.size || indexAndMove.move == null;
}

function $popMove(this$static, index){
  var e, move, move$iterator, movesCopy, poppedMove;
  movesCopy = new ArrayList_2(this$static.moves);
  poppedMove = dynamicCast($remove_0(movesCopy, index), Q$String);
  $resetToState(this$static, this$static.originalState);
  for (move$iterator = new AbstractList$IteratorImpl_0(movesCopy); move$iterator.i < move$iterator.this$0.size_0();) {
    move = dynamicCast($next(move$iterator), Q$String);
    try {
      $appendMove(this$static, move);
    }
     catch ($e0) {
      $e0 = caught($e0);
      if (instanceOf($e0, Q$InvalidMoveException)) {
        e = $e0;
        azzert_3(false, e);
      }
       else 
        throw $e0;
    }
  }
  return poppedMove;
}

function $resetToState(this$static, originalState){
  this$static.totalCost = 0;
  this$static.originalState = originalState;
  this$static.unNormalizedState = originalState;
  $clear(this$static.moves);
  $clear(this$static.states);
  $add_0(this$static.states, this$static.unNormalizedState);
}

function AlgorithmBuilder_0(puzzle, mergingMode){
  $clinit_AlgorithmBuilder();
  AlgorithmBuilder_1.call(this, mergingMode, puzzle.getSolvedState_0());
}

function AlgorithmBuilder_1(mergingMode, originalState){
  $clinit_AlgorithmBuilder();
  this.moves = new ArrayList_0;
  this.states = new ArrayList_0;
  this.mergingMode = mergingMode;
  $resetToState(this, originalState);
}

function splitAlgorithm(algorithm){
  $clinit_AlgorithmBuilder();
  if (!$trim(algorithm).length) {
    return initDim(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, 0, 0);
  }
  return $split(algorithm, '\\s+', 0);
}

defineSeed(271, 1, {}, AlgorithmBuilder_0, AlgorithmBuilder_1);
_.toString$ = function toString_34(){
  return join(this.moves, ' ');
}
;
_.mergingMode = 0;
_.originalState = null;
_.totalCost = 0;
_.unNormalizedState = null;
var l_1;
function AlgorithmBuilder$IndexAndMove_0(index, move){
  this.index_0 = index;
  this.move = move;
}

defineSeed(272, 1, {}, AlgorithmBuilder$IndexAndMove_0);
_.toString$ = function toString_35(){
  return '{ index: ' + this.index_0 + ' move: ' + this.move + ' }';
}
;
_.index_0 = 0;
_.move = null;
function InvalidMoveException_0(move){
  Exception_0.call(this, 'Invalid move: ' + move);
}

defineSeed(273, 7, makeCastMap([Q$Serializable, Q$Exception, Q$Throwable, Q$InvalidMoveException]), InvalidMoveException_0);
function InvalidScrambleException_0(scramble, t){
  Throwable_1.call(this, 'Invalid scramble: ' + scramble, t);
}

defineSeed(274, 7, makeCastMap([Q$Serializable, Q$Exception, Q$Throwable, Q$InvalidScrambleException]), InvalidScrambleException_0);
function $clinit_Puzzle(){
  $clinit_Puzzle = nullMethod;
  l_2 = ($clinit_Logger() , $getLoggerHelper(Lnet_gnehzr_tnoodle_scrambles_Puzzle_2_classLit.typeName));
}

function $drawScramble(this$static, scramble, colorScheme){
  var children, colorSchemeCopy, g, state, svg;
  scramble == null && (scramble = '');
  colorSchemeCopy = colorScheme;
  colorScheme = this$static.getDefaultColorScheme_0();
  !!colorSchemeCopy && $putAll(colorScheme, colorSchemeCopy);
  state = this$static.getSolvedState_0();
  state = $applyAlgorithm(state, scramble);
  svg = state.drawScramble(colorScheme);
  g = new Group_0;
  children = svg.children;
  while (children.size != 0) {
    $appendChild(g, dynamicCast($remove_0(children, 0), Q$Element));
  }
  $concatenate(g.transform, new Transform_1(1, 0, 0, 1, 0.5, 0.5));
  $add_0(svg.children, g);
  return svg;
}

function $generateRandomMoves(this$static, r){
  var ab, e, move, successors;
  ab = new AlgorithmBuilder_0(this$static, 0);
  while (ab.totalCost < this$static.getRandomMoveCount()) {
    successors = (azzert_1(ab.states.size == ab.moves.size + 1) , dynamicCast($get_4(ab.states, ab.states.size - 1), Q$Puzzle$PuzzleState)).getScrambleSuccessors();
    try {
      do {
        move = dynamicCast(choose(r, $keySet(successors)), Q$String);
        successors.remove(move);
      }
       while ($isRedundant(ab, move));
      $appendMove(ab, move);
    }
     catch ($e0) {
      $e0 = caught($e0);
      if (instanceOf($e0, Q$InvalidMoveException)) {
        e = $e0;
        $log_1(l_2, ($clinit_Level() , SEVERE), '', e);
        azzert_3(false, e);
        return null;
      }
       else 
        throw $e0;
    }
  }
  return new PuzzleStateAndGenerator_0((azzert_1(ab.states.size == ab.moves.size + 1) , dynamicCast($get_4(ab.states, ab.states.size - 1), Q$Puzzle$PuzzleState)), join(ab.moves, ' '));
}

function $generateScrambles(this$static, r, count){
  var i_0, scrambles;
  scrambles = initDim(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, count, 0);
  for (i_0 = 0; i_0 < count; ++i_0) {
    scrambles[i_0] = $generateWcaScramble(this$static, r);
  }
  return scrambles;
}

function $generateSeededScramble(this$static, seed){
  var r;
  r = ($clinit_Random() , new SecureRandom_0);
  $setSeed_0(r, seed);
  return $generateWcaScramble(this$static, r);
}

function $generateSeededScrambles(this$static, seed, count){
  var r;
  r = ($clinit_Random() , new SecureRandom_0);
  $setSeed_0(r, seed);
  return $generateScrambles(this$static, r, count);
}

function $generateWcaScramble(this$static, r){
  var psag;
  do {
    psag = this$static.generateRandomMoves_0(r);
  }
   while (psag.state.solveIn_1(this$static.wcaMinScrambleDistance - 1) != null);
  return psag.generator;
}

function $getFaceNames(this$static){
  var faces, x;
  faces = new ArrayList_2($keySet(this$static.getDefaultColorScheme_0()));
  x = cloneSubrange(faces.array, 0, faces.size);
  mergeSort(x, 0, x.length, ($clinit_Comparators() , $clinit_Comparators() , NATURAL));
  replaceContents(faces, x);
  return dynamicCast($toArray_0(faces, initDim(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, faces.size, 0)), Q$String_$1);
}

function $parseColorScheme(this$static, scheme){
  var c, colorScheme, colors, cols, faces, i_0;
  colorScheme = this$static.getDefaultColorScheme_0();
  if (scheme != null && !!scheme.length) {
    faces = $getFaceNames(this$static);
    if ($indexOf(scheme, fromCodePoint(44)) > 0) {
      colors = $split(scheme, ',', 0);
    }
     else {
      cols = $toCharArray(scheme);
      colors = initDim(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, cols.length, 0);
      for (i_0 = 0; i_0 < cols.length; ++i_0) {
        colors[i_0] = String.fromCharCode(cols[i_0]) + '';
      }
    }
    if (colors.length != faces.length) {
      return null;
    }
    for (i_0 = 0; i_0 < colors.length; ++i_0) {
      try {
        c = new Color_2(colors[i_0]);
        colorScheme.put(faces[i_0], c);
      }
       catch ($e0) {
        $e0 = caught($e0);
        if (instanceOf($e0, Q$InvalidHexColorException)) {
          return null;
        }
         else 
          throw $e0;
      }
    }
  }
  return colorScheme;
}

function Puzzle_0(){
  $clinit_Puzzle();
  this.r = ($clinit_Random() , new SecureRandom_0);
}

defineSeed(275, 1, makeCastMap([Q$Puzzle, Q$Exportable]));
_.generateRandomMoves_0 = function generateRandomMoves(r){
  return $generateRandomMoves(this, r);
}
;
_.generateScramble_0 = function generateScramble(){
  return $generateWcaScramble(this, this.r);
}
;
_.generateScrambles_0 = function generateScrambles(count){
  return $generateScrambles(this, this.r, count);
}
;
_.generateSeededScramble_0 = function generateSeededScramble(seed){
  return $generateSeededScramble(this, getBytesUtf8(seed));
}
;
_.generateSeededScrambles_0 = function generateSeededScrambles(seed, count){
  return $generateSeededScrambles(this, getBytesUtf8(seed), count);
}
;
_.getFaceNames_0 = function getFaceNames(){
  return $getFaceNames(this);
}
;
_.getPreferredSize_1 = function getPreferredSize(maxWidth, maxHeight){
  var ratio, resultHeight, resultWidth;
  if (maxWidth == 0 && maxHeight == 0) {
    return this.getPreferredSize_0();
  }
  maxWidth == 0?(maxWidth = 2147483647):maxHeight == 0 && (maxHeight = 2147483647);
  ratio = this.getPreferredSize_0().width / this.getPreferredSize_0().height;
  resultWidth = min(maxWidth, ($clinit_GwtSafeUtils() , round_int(Math.ceil(maxHeight * ratio))));
  resultHeight = min(maxHeight, round_int(Math.ceil(maxWidth / ratio)));
  return new Dimension_0(resultWidth, resultHeight);
}
;
_.solveIn_0 = function solveIn(ps, n){
  var bestIntersection, bestIntersectionCost, bestPossibleSolution, cost, distance, distanceFromScrambled, distanceFromSolved, e, extendSolved, fringeExtending, fringeScrambled, fringeSolved, fringeTies, linkedStates, minComparingFringe, minFringeScrambled, minFringeSolved, moveCost, moveName, movesByState, newDistanceFromScrambled, newDistanceFromSolved, next, next$iterator, nextDistance, nextState, nextStateNormalized, node, seenComparing, seenExtending, seenScrambled, seenSolved, solution, solvedNormalized, start, state, bucket, h_0;
  if ($equalsNormalized(ps, ps.this$0_0.getSolvedState_0())) {
    return '';
  }
  seenSolved = new HashMap_0;
  fringeSolved = new Puzzle$SortedBuckets_0;
  seenScrambled = new HashMap_0;
  fringeScrambled = new Puzzle$SortedBuckets_0;
  bestIntersectionCost = n + 1;
  bestIntersection = null;
  solvedNormalized = this.getSolvedState_0().getNormalized();
  $add_3(fringeSolved, solvedNormalized, 0);
  seenSolved.put(solvedNormalized, valueOf_0(0));
  $add_3(fringeScrambled, ps.getNormalized(), 0);
  seenScrambled.put(ps.getNormalized(), valueOf_0(0));
  start = new TimedLogRecordStart_0(($clinit_Level() , FINER), 'Searching for solution in ' + n + ' moves.');
  $log_2(l_2, start);
  fringeTies = 0;
  minFringeScrambled = -1;
  minFringeSolved = -1;
  while (fringeSolved.buckets.map.size_0() != 0 || fringeScrambled.buckets.map.size_0() != 0) {
    fringeScrambled.buckets.map.size_0() == 0 || (minFringeScrambled = dynamicCast(fringeScrambled.buckets.map.firstKey(), Q$Puzzle$Bucket).value);
    fringeSolved.buckets.map.size_0() == 0 || (minFringeSolved = dynamicCast(fringeSolved.buckets.map.firstKey(), Q$Puzzle$Bucket).value);
    fringeSolved.buckets.map.size_0() == 0 || fringeScrambled.buckets.map.size_0() == 0?(extendSolved = fringeSolved.buckets.map.size_0() != 0):minFringeSolved < minFringeScrambled?(extendSolved = true):minFringeSolved > minFringeScrambled?(extendSolved = false):(extendSolved = fringeTies++ % 2 == 0);
    if (extendSolved) {
      seenExtending = seenSolved;
      fringeExtending = fringeSolved;
      seenComparing = seenScrambled;
      minComparingFringe = minFringeScrambled;
    }
     else {
      seenExtending = seenScrambled;
      fringeExtending = fringeScrambled;
      seenComparing = seenSolved;
      minComparingFringe = minFringeSolved;
    }
    node = dynamicCast((bucket = dynamicCast(fringeExtending.buckets.map.firstKey(), Q$Puzzle$Bucket) , h_0 = $removeLast(bucket.contents) , bucket.contents.size == 0 && $remove_5(fringeExtending.buckets, bucket) , h_0), Q$Puzzle$PuzzleState);
    distance = dynamicCast(seenExtending.get(node), Q$Integer).value;
    if (seenComparing.containsKey(node)) {
      cost = dynamicCast(seenComparing.get(node), Q$Integer).value + distance;
      if (cost < bestIntersectionCost) {
        bestIntersection = node;
        bestIntersectionCost = cost;
      }
      continue;
    }
    bestPossibleSolution = distance + minComparingFringe;
    if (bestPossibleSolution >= bestIntersectionCost) {
      continue;
    }
    if (distance >= ~~((n + 1) / 2)) {
      continue;
    }
    movesByState = node.getCanonicalMovesByState();
    for (next$iterator = $iterator($keySet(movesByState)); next$iterator.val$outerIter.hasNext();) {
      next = dynamicCast($next_0(next$iterator), Q$Puzzle$PuzzleState);
      moveCost = node.getMoveCost(dynamicCast(movesByState.get(next), Q$String));
      nextDistance = distance + moveCost;
      next = next.getNormalized();
      if (seenExtending.containsKey(next)) {
        if (nextDistance >= dynamicCast(seenExtending.get(next), Q$Integer).value) {
          continue;
        }
      }
      $add_3(fringeExtending, next, nextDistance);
      seenExtending.put(next, valueOf_0(nextDistance));
    }
  }
  $log_2(l_2, $finishedNow(start, 'expanded ' + (seenSolved.size_0() + seenScrambled.size_0()) + ' nodes'));
  if (!bestIntersection) {
    return null;
  }
  azzert_1(bestIntersection.isNormalized());
  state = bestIntersection;
  distanceFromScrambled = dynamicCast(seenScrambled.get(bestIntersection), Q$Integer).value;
  linkedStates = initDim(_3Lnet_gnehzr_tnoodle_scrambles_Puzzle$PuzzleState_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$Puzzle$PuzzleState, distanceFromScrambled + 1, 0);
  setCheck(linkedStates, distanceFromScrambled, bestIntersection);
  outer_0: while (distanceFromScrambled > 0) {
    for (next$iterator = $iterator($keySet(state.getCanonicalMovesByState())); next$iterator.val$outerIter.hasNext();) {
      next = dynamicCast($next_0(next$iterator), Q$Puzzle$PuzzleState);
      next = next.getNormalized();
      if (seenScrambled.containsKey(next)) {
        newDistanceFromScrambled = dynamicCast(seenScrambled.get(next), Q$Integer).value;
        if (newDistanceFromScrambled < distanceFromScrambled) {
          state = next;
          distanceFromScrambled = newDistanceFromScrambled;
          setCheck(linkedStates, newDistanceFromScrambled, next);
          continue outer_0;
        }
      }
    }
    azzert_1(false);
  }
  solution = new AlgorithmBuilder_1(1, ps);
  state = ps;
  distanceFromScrambled = 0;
  outer_0: while (!state.getNormalized().equals$(bestIntersection.getNormalized())) {
    for (next$iterator = state.getCanonicalMovesByState().entrySet_0().iterator(); next$iterator.hasNext();) {
      next = dynamicCast(next$iterator.next_0(), Q$Map$Entry);
      nextState = dynamicCast(next.getKey(), Q$Puzzle$PuzzleState);
      moveName = dynamicCast(next.getValue(), Q$String);
      if (nextState.getNormalized().equals$(linkedStates[distanceFromScrambled + 1].getNormalized())) {
        state = nextState;
        try {
          $appendMove(solution, moveName);
        }
         catch ($e0) {
          $e0 = caught($e0);
          if (instanceOf($e0, Q$InvalidMoveException)) {
            e = $e0;
            azzert_3(false, e);
          }
           else 
            throw $e0;
        }
        distanceFromScrambled = dynamicCast(seenScrambled.get(nextState.getNormalized()), Q$Integer).value;
        continue outer_0;
      }
    }
    azzert_1(false);
  }
  distanceFromSolved = dynamicCast(seenSolved.get(state.getNormalized()), Q$Integer).value;
  outer_0: while (distanceFromSolved > 0) {
    for (next$iterator = state.getCanonicalMovesByState().entrySet_0().iterator(); next$iterator.hasNext();) {
      next = dynamicCast(next$iterator.next_0(), Q$Map$Entry);
      nextState = dynamicCast(next.getKey(), Q$Puzzle$PuzzleState);
      nextStateNormalized = nextState.getNormalized();
      moveName = dynamicCast(next.getValue(), Q$String);
      if (seenSolved.containsKey(nextStateNormalized)) {
        newDistanceFromSolved = dynamicCast(seenSolved.get(nextStateNormalized), Q$Integer).value;
        if (newDistanceFromSolved < distanceFromSolved) {
          state = nextState;
          distanceFromSolved = newDistanceFromSolved;
          try {
            $appendMove(solution, moveName);
          }
           catch ($e0) {
            $e0 = caught($e0);
            if (instanceOf($e0, Q$InvalidMoveException)) {
              e = $e0;
              azzert_3(false, e);
            }
             else 
              throw $e0;
          }
          continue outer_0;
        }
      }
    }
    azzert_1(false);
  }
  return join(solution.moves, ' ');
}
;
_.toString$ = function toString_36(){
  return this.getLongName_0();
}
;
_.wcaMinScrambleDistance = 2;
var l_2;
function $compareTo_6(this$static, other){
  return this$static.value - other.value;
}

function Puzzle$Bucket_0(value){
  this.value = value;
  this.contents = new LinkedList_0;
}

defineSeed(276, 1, makeCastMap([Q$Comparable, Q$Puzzle$Bucket]), Puzzle$Bucket_0);
_.compareTo$ = function compareTo_8(other){
  return $compareTo_6(this, dynamicCast(other, Q$Puzzle$Bucket));
}
;
_.equals$ = function equals_27(o){
  var other;
  other = dynamicCast(o, Q$Puzzle$Bucket);
  return this.value == other.value;
}
;
_.hashCode$ = function hashCode_27(){
  return this.value;
}
;
_.toString$ = function toString_37(){
  return '#: ' + this.value + ': ' + $toString_2(this.contents);
}
;
_.contents = null;
_.value = 0;
function $apply(this$static, move){
  var successors;
  successors = this$static.getSuccessorsByName();
  if (!successors.map.containsKey(move)) {
    throw new InvalidMoveException_0('Unrecognized turn ' + move);
  }
  return dynamicCast($get_5(successors, move), Q$Puzzle$PuzzleState);
}

function $applyAlgorithm(this$static, algorithm){
  var e, move, move$array, move$index, move$max, state;
  state = this$static;
  for (move$array = splitAlgorithm(algorithm) , move$index = 0 , move$max = move$array.length; move$index < move$max; ++move$index) {
    move = move$array[move$index];
    try {
      state = $apply(state, move);
    }
     catch ($e0) {
      $e0 = caught($e0);
      if (instanceOf($e0, Q$InvalidMoveException)) {
        e = $e0;
        throw new InvalidScrambleException_0(algorithm, e);
      }
       else 
        throw $e0;
    }
  }
  return state;
}

function $equalsNormalized(this$static, other){
  return this$static.getNormalized().equals$(other.getNormalized());
}

function $movesCommute(this$static, move1, move2){
  var state1, state2;
  try {
    state1 = $apply($apply(this$static, move1), move2);
    state2 = $apply($apply(this$static, move2), move1);
    return state1.equals$(state2);
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, Q$InvalidMoveException)) {
      return false;
    }
     else 
      throw $e0;
  }
}

defineSeed(277, 1, makeCastMap([Q$Puzzle$PuzzleState]));
_.getCanonicalMovesByState = function getCanonicalMovesByState(){
  var moveName, next, next$iterator, nextState, nextStateNormalized, statesSeenNormalized, successorsByName, uniqueSuccessors;
  successorsByName = this.getSuccessorsByName();
  uniqueSuccessors = new HashMap_0;
  statesSeenNormalized = new HashSet_0;
  $add_1(statesSeenNormalized, this.getNormalized());
  for (next$iterator = new LinkedHashMap$EntrySet$EntryIterator_0(new LinkedHashMap$EntrySet_0(successorsByName)); next$iterator.next != next$iterator.this$1.this$0.head;) {
    next = $next_1(next$iterator);
    nextState = dynamicCast(next.value, Q$Puzzle$PuzzleState);
    nextStateNormalized = nextState.getNormalized();
    moveName = dynamicCast(next.key, Q$String);
    if (!statesSeenNormalized.map.containsKey(nextStateNormalized)) {
      uniqueSuccessors.put(nextState, moveName);
      $add_1(statesSeenNormalized, nextStateNormalized);
    }
  }
  return uniqueSuccessors;
}
;
_.getMoveCost = function getMoveCost(move){
  return 1;
}
;
_.getNormalized = function getNormalized(){
  return this;
}
;
_.getScrambleSuccessors = function getScrambleSuccessors(){
  return reverseHashMap(this.getCanonicalMovesByState());
}
;
_.isNormalized = function isNormalized(){
  return this.equals$(this.getNormalized());
}
;
_.solveIn_1 = function solveIn_0(n){
  return this.this$0_0.solveIn_0(this, n);
}
;
_.this$0_0 = null;
function $add_3(this$static, element, value){
  var bucket, searchBucket;
  searchBucket = new Puzzle$Bucket_0(value);
  if ($contains(this$static.buckets, searchBucket)) {
    bucket = dynamicCast($tailSet(this$static.buckets, searchBucket).map.firstKey(), Q$Puzzle$Bucket);
  }
   else {
    bucket = searchBucket;
    $add_2(this$static.buckets, bucket);
  }
  $addLast(bucket.contents, element);
}

function Puzzle$SortedBuckets_0(){
  this.buckets = new TreeSet_0;
}

defineSeed(278, 1, {}, Puzzle$SortedBuckets_0);
_.hashCode$ = function hashCode_28(){
  throw new UnsupportedOperationException_0;
}
;
_.toString$ = function toString_38(){
  return $toString_2(this.buckets);
}
;
_.buckets = null;
function $export_0(this$static){
  if (!exported_0) {
    exported_0 = true;
    $clinit_ExporterUtil();
    $addExporter(impl_4, Lnet_gnehzr_tnoodle_scrambles_Puzzle_2_classLit, this$static);
    $export0_0(this$static);
  }
}

function $export0_0(this$static){
  var pkg = declarePackage('net.gnehzr.tnoodle.scrambles.Puzzle');
  var __0, __ = this$static;
  $wnd.net.gnehzr.tnoodle.scrambles.Puzzle = $entry(function(){
    var g, j = this, a = arguments;
    a.length == 1 && __.isAssignable(a[0]) && (g = a[0]);
    j.g = g;
    setWrapper(g, j);
    return j;
  }
  );
  __0 = $wnd.net.gnehzr.tnoodle.scrambles.Puzzle.prototype = new Object;
  __0.generateScramble = $entry(function(){
    return this.g.generateScramble_0();
  }
  );
  __0.generateScrambles = $entry(function(a0){
    return wrap(this.g.generateScrambles_0(a0));
  }
  );
  __0.generateSeededScramble = $entry(function(a0){
    return this.g.generateSeededScramble_0(a0);
  }
  );
  __0.generateSeededScrambles = $entry(function(a0, a1){
    return wrap(this.g.generateSeededScrambles_0(a0, a1));
  }
  );
  __0.getFaceNames = $entry(function(){
    return wrap(this.g.getFaceNames_0());
  }
  );
  __0.getLongName = $entry(function(){
    return this.g.getLongName_0();
  }
  );
  __0.getPreferredSize = $entry(function(a0, a1){
    return this.g.getPreferredSize_1(a0, a1);
  }
  );
  __0.getShortName = $entry(function(){
    return this.g.getShortName_0();
  }
  );
  __0.toString = $entry(function(){
    return this.g.toString$();
  }
  );
  if (pkg)
    for (p in pkg)
      $wnd.net.gnehzr.tnoodle.scrambles.Puzzle[p] === undefined && ($wnd.net.gnehzr.tnoodle.scrambles.Puzzle[p] = pkg[p]);
}

function PuzzleExporterImpl_0(){
  $export_0(this);
}

defineSeed(279, 1, {}, PuzzleExporterImpl_0);
_.isAssignable = function isAssignable_0(o){
  return o != null && instanceOf(o, Q$Puzzle);
}
;
var exported_0 = false;
function $toJsonable(this$static){
  var dim, jsonColorScheme, jsonable, key, key$iterator;
  jsonable = new HashMap_0;
  dim = new HashMap_0;
  dim.put('width', valueOf_0(this$static.size.width));
  dim.put('height', valueOf_0(this$static.size.height));
  jsonable.put('size', dim);
  jsonColorScheme = new HashMap_0;
  for (key$iterator = $iterator($keySet(this$static.colorScheme)); key$iterator.val$outerIter.hasNext();) {
    key = dynamicCast($next_0(key$iterator), Q$String);
    jsonColorScheme.put(key, $substring(toPowerOfTwoString(16777216 | $getRGB(dynamicCast(this$static.colorScheme.get(key), Q$Color)) & 16777215), 1));
  }
  jsonable.put('colorScheme', jsonColorScheme);
  return jsonable;
}

function PuzzleImageInfo_0(p_0){
  this.colorScheme = p_0.getDefaultColorScheme_0();
  this.size = p_0.getPreferredSize_0();
}

defineSeed(280, 1, {}, PuzzleImageInfo_0);
_.colorScheme = null;
_.size = null;
function PuzzleStateAndGenerator_0(state, generator){
  this.state = state;
  this.generator = generator;
}

defineSeed(281, 1, {}, PuzzleStateAndGenerator_0);
_.generator = null;
_.state = null;
function $$init_7(this$static){
  this$static.transform = new Transform_0;
}

function $addIndentation(sb, level){
  var i_0;
  for (i_0 = 0; i_0 < level; ++i_0) {
    sb.impl.append_2(sb.data, '\t');
  }
}

function $appendChild(this$static, child){
  $add_0(this$static.children, child);
}

function $buildString(this$static, sb, level){
  var child, child$iterator, key, key$iterator, value;
  $addIndentation(sb, level);
  $append_5((sb.impl.append_2(sb.data, '<') , sb), this$static.tag);
  for (key$iterator = $iterator($keySet(this$static.attributes)); key$iterator.val$outerIter.hasNext();) {
    key = dynamicCast($next_0(key$iterator), Q$String);
    value = dynamicCast(this$static.attributes.get(key), Q$String);
    sb.impl.append_2(sb.data, ' ');
    $append_3($append_5($append_3($append_5((sb.impl.append_2(sb.data, key) , sb), '='), 34), value), 34);
  }
  this$static.style.size_0() > 0 && $append_3($append_5((sb.impl.append_2(sb.data, ' style="') , sb), $toStyleStr(this$static)), 34);
  $isIdentity(this$static.transform) || $append_3($append_5((sb.impl.append_2(sb.data, ' transform="') , sb), $toSvgTransform(this$static.transform)), 34);
  sb.impl.append_2(sb.data, '>');
  this$static.content_0 != null && $append_5(sb, this$static.content_0);
  for (child$iterator = new AbstractList$IteratorImpl_0(this$static.children); child$iterator.i < child$iterator.this$0.size_0();) {
    child = dynamicCast($next(child$iterator), Q$Element);
    sb.impl.append_2(sb.data, '\n');
    child.buildString(sb, level + 1);
  }
  sb.impl.append_2(sb.data, '\n');
  $addIndentation(sb, level);
  $append_5($append_5((sb.impl.append_2(sb.data, '<\/') , sb), this$static.tag), '>');
}

function $copyChildren(this$static){
  var child, child$iterator, childrenCopy;
  childrenCopy = new ArrayList_0;
  for (child$iterator = new AbstractList$IteratorImpl_0(this$static.children); child$iterator.i < child$iterator.this$0.size_0();) {
    child = dynamicCast($next(child$iterator), Q$Element);
    $add_0(childrenCopy, new Element_2(child));
  }
  return childrenCopy;
}

function $setAttribute(this$static, key, value){
  azzert(key != 'style');
  this$static.attributes.put(key, value);
}

function $setFill(this$static, c){
  $setAttribute(this$static, 'fill', !c?'none':'#' + $substring(toPowerOfTwoString(16777216 | $getRGB(c) & 16777215), 1));
}

function $setStroke(this$static){
  this$static.style.put('stroke-width', '2px');
  this$static.style.put('stroke-miterlimit', '10');
  this$static.style.put('stroke-linejoin', 'round');
}

function $setStroke_0(this$static, c){
  $setAttribute(this$static, 'stroke', !c?'none':'#' + $substring(toPowerOfTwoString(16777216 | $getRGB(c) & 16777215), 1));
}

function $toString_4(this$static){
  var sb;
  sb = new StringBuilder_0;
  this$static.buildString(sb, 0);
  return sb.impl.toString_0(sb.data);
}

function $toStyleStr(this$static){
  var key, key$iterator, sb, value;
  sb = new StringBuilder_0;
  for (key$iterator = $iterator($keySet(this$static.style)); key$iterator.val$outerIter.hasNext();) {
    key = dynamicCast($next_0(key$iterator), Q$String);
    value = dynamicCast(this$static.style.get(key), Q$String);
    $append_5($append_5($append_5($append_5((sb.impl.append_2(sb.data, ' ') , sb), key), ':'), value), ';');
  }
  if (sb.impl.length_0(sb.data) == 0) {
    return '';
  }
  return $substring(sb.impl.toString_0(sb.data), 1);
}

function Element_1(tag){
  $$init_7(this);
  this.tag = tag;
  this.children = new ArrayList_0;
  this.attributes = new HashMap_0;
  this.style = new HashMap_0;
  this.content_0 = null;
}

function Element_2(e){
  $$init_7(this);
  this.tag = e.tag;
  this.attributes = new HashMap_1(e.attributes);
  this.style = new HashMap_1(e.style);
  this.children = $copyChildren(e);
  this.content_0 = this.content_0;
}

defineSeed(284, 1, makeCastMap([Q$Element]), Element_2);
_.buildString = function buildString(sb, level){
  $buildString(this, sb, level);
}
;
_.toString$ = function toString_39(){
  return $toString_4(this);
}
;
_.attributes = null;
_.children = null;
_.content_0 = null;
_.style = null;
_.tag = null;
defineSeed(283, 284, makeCastMap([Q$Element]));
function Circle_0(cx, cy, r){
  Element_1.call(this, 'ellipse');
  azzert('cx' != 'style');
  this.attributes.put('cx', '' + cx);
  azzert('cy' != 'style');
  this.attributes.put('cy', '' + cy);
  azzert('rx' != 'style');
  this.attributes.put('rx', '' + r);
  azzert('ry' != 'style');
  this.attributes.put('ry', '' + r);
}

function Circle_1(c){
  Element_2.call(this, c);
}

defineSeed(282, 283, makeCastMap([Q$Element]), Circle_0, Circle_1);
function $clinit_Color(){
  $clinit_Color = nullMethod;
  RED = new Color_1(255, 0, 0);
  GREEN = new Color_1(0, 255, 0);
  BLUE = new Color_1(0, 0, 255);
  WHITE = new Color_1(255, 255, 255);
  BLACK = new Color_1(0, 0, 0);
  GRAY = new Color_1(128, 128, 128);
  YELLOW = new Color_1(255, 255, 0);
}

function $getRGB(this$static){
  return this$static.a_0 << 24 | this$static.r << 16 | this$static.g_0 << 8 | this$static.b;
}

function Color_0(rgba){
  $clinit_Color();
  this.r = ~~rgba >>> 16 & 255;
  this.g_0 = ~~rgba >>> 8 & 255;
  this.b = rgba & 255;
  this.a_0 = ~~rgba >>> 24 & 255;
}

function Color_1(r, g, b){
  $clinit_Color();
  this.r = r;
  this.g_0 = g;
  this.b = b;
  this.a_0 = 255;
}

function Color_2(htmlHex){
  $clinit_Color();
  Color_0.call(this, hexToRGB(htmlHex));
}

function hexToRGB(htmlHex){
  var c0, c1, c2;
  htmlHex.indexOf('#') == 0 && (htmlHex = $substring(htmlHex, 1));
  switch (htmlHex.length) {
    case 3:
      c0 = htmlHex.charCodeAt(0);
      c1 = htmlHex.charCodeAt(1);
      c2 = htmlHex.charCodeAt(2);
      htmlHex = '' + String.fromCharCode(c0) + String.fromCharCode(c0) + String.fromCharCode(c1) + String.fromCharCode(c1) + String.fromCharCode(c2) + String.fromCharCode(c2);
    case 6:
      return __parseAndValidateInt(htmlHex, 16);
    default:throw new InvalidHexColorException_0(htmlHex);
  }
}

defineSeed(285, 1, makeCastMap([Q$Color]), Color_0, Color_1, Color_2);
_.toString$ = function toString_40(){
  return '<color #' + $substring(toPowerOfTwoString(16777216 | (this.a_0 << 24 | this.r << 16 | this.g_0 << 8 | this.b) & 16777215), 1) + '>';
}
;
_.a_0 = 0;
_.b = 0;
_.g_0 = 0;
_.r = 0;
var BLACK, BLUE, GRAY, GREEN, RED, WHITE, YELLOW;
function Dimension_0(width, height){
  this.width = width;
  this.height = height;
}

defineSeed(286, 1, {}, Dimension_0);
_.toString$ = function toString_41(){
  return '<' + Lnet_gnehzr_tnoodle_svglite_Dimension_2_classLit.typeName + ' width=' + this.width + ' height=' + this.height + '>';
}
;
_.height = 0;
_.width = 0;
function Group_0(){
  Element_1.call(this, 'g');
}

defineSeed(287, 284, makeCastMap([Q$Element]), Group_0);
function InvalidHexColorException_0(invalidHex){
  Exception_0.call(this, invalidHex);
}

defineSeed(288, 7, makeCastMap([Q$Serializable, Q$Exception, Q$Throwable, Q$InvalidHexColorException]), InvalidHexColorException_0);
function $closePath(this$static){
  azzert_0(!!this$static.commands);
  $add_0(this$static.commands, new Path$Command_0(4, null));
}

function $getD(this$static){
  var c, c$iterator, sb;
  sb = new StringBuilder_0;
  for (c$iterator = new AbstractList$IteratorImpl_0(this$static.commands); c$iterator.i < c$iterator.this$0.size_0();) {
    c = dynamicCast($next(c$iterator), Q$Path$Command);
    $append_5(sb, ' ' + $toString_5(c));
  }
  if (sb.impl.length_0(sb.data) == 0) {
    return '';
  }
  return $substring(sb.impl.toString_0(sb.data), 1);
}

function $lineTo(this$static, x, y){
  var coords;
  azzert_0(!!this$static.commands);
  coords = initValues(_3D_classLit, makeCastMap([Q$double_$1, Q$Serializable]), -1, [x, y]);
  $add_0(this$static.commands, new Path$Command_0(1, coords));
}

function $moveTo(this$static, x, y){
  var coords;
  !this$static.commands && (this$static.commands = new ArrayList_0);
  coords = initValues(_3D_classLit, makeCastMap([Q$double_$1, Q$Serializable]), -1, [x, y]);
  $add_0(this$static.commands, new Path$Command_0(0, coords));
}

function $translate(this$static, x, y){
  var c, c$iterator;
  for (c$iterator = new AbstractList$IteratorImpl_0(this$static.commands); c$iterator.i < c$iterator.this$0.size_0();) {
    c = dynamicCast($next(c$iterator), Q$Path$Command);
    switch (c.type_0) {
      case 0:
      case 1:
        c.coords[0] += x;
        c.coords[1] += y;
        break;
      case 4:
        break;
      default:azzert(false);
    }
  }
}

function Path_0(){
  Element_1.call(this, 'path');
}

function Path_1(p_0){
  Element_2.call(this, p_0);
  !!p_0.commands && (this.commands = new ArrayList_2(p_0.commands));
}

defineSeed(289, 284, makeCastMap([Q$Element, Q$Path]), Path_0, Path_1);
_.buildString = function buildString_0(sb, level){
  $setAttribute(this, 'd', $getD(this));
  $buildString(this, sb, level);
}
;
_.commands = null;
function $toString_5(this$static){
  var i_0, sb;
  sb = new StringBuilder_0;
  $append_3(sb, $charAt('MLTCZ', this$static.type_0));
  for (i_0 = 0; this$static.coords != null && i_0 < this$static.coords.length; ++i_0) {
    sb.impl.append_2(sb.data, ' ');
    $append_4(sb, this$static.coords[i_0]);
  }
  return sb.impl.toString_0(sb.data);
}

function Path$Command_0(type, coords){
  this.type_0 = type;
  this.coords = coords;
}

defineSeed(290, 1, makeCastMap([Q$Path$Command]), Path$Command_0);
_.toString$ = function toString_42(){
  return $toString_5(this);
}
;
_.coords = null;
_.type_0 = 0;
function $currentSegment(this$static, coords){
  var command, i_0;
  command = dynamicCast($get_4(this$static.commands, this$static.index_0), Q$Path$Command);
  azzert(coords.length >= command.coords.length);
  for (i_0 = 0; i_0 < command.coords.length; ++i_0) {
    coords[i_0] = command.coords[i_0];
  }
  return command.type_0;
}

function PathIterator_0(p_0){
  this.index_0 = 0;
  this.commands = p_0.commands;
}

defineSeed(291, 1, {}, PathIterator_0);
_.commands = null;
_.index_0 = 0;
function Point2D$Double_0(x, y){
  this.x = x;
  this.y = y;
}

defineSeed(292, 1, makeCastMap([Q$Point2D$Double]), Point2D$Double_0);
_.x = 0;
_.y = 0;
function Rectangle_0(x, y, width, height){
  Element_1.call(this, 'rect');
  azzert('x' != 'style');
  this.attributes.put('x', '' + x);
  azzert('y' != 'style');
  this.attributes.put('y', '' + y);
  azzert('width' != 'style');
  this.attributes.put('width', '' + width);
  azzert('height' != 'style');
  this.attributes.put('height', '' + height);
}

function Rectangle_1(r){
  Element_2.call(this, r);
}

defineSeed(293, 284, makeCastMap([Q$Element]), Rectangle_0, Rectangle_1);
function Svg_0(size){
  Element_1.call(this, 'svg');
  $setAttribute(this, 'width', '' + size.width + 'px');
  $setAttribute(this, 'height', '' + size.height + 'px');
  $setAttribute(this, 'viewBox', '0 0 ' + size.width + ' ' + size.height);
  azzert('version' != 'style');
  this.attributes.put('version', '1.1');
  azzert('xmlns' != 'style');
  this.attributes.put('xmlns', 'http://www.w3.org/2000/svg');
}

defineSeed(294, 284, makeCastMap([Q$Element]), Svg_0);
function Text_1(text, x, y){
  Element_1.call(this, 'text');
  this.content_0 = text;
  azzert('x' != 'style');
  this.attributes.put('x', '' + x);
  azzert('y' != 'style');
  this.attributes.put('y', '' + y);
}

defineSeed(295, 284, makeCastMap([Q$Element]), Text_1);
function $concatenate(this$static, that){
  var a, b, c, d, e, f;
  a = that.a_0 * this$static.a_0 + that.c * this$static.b;
  c = that.a_0 * this$static.c + that.c * this$static.d;
  e = that.a_0 * this$static.e + that.c * this$static.f + that.e;
  b = that.b * this$static.a_0 + that.d * this$static.b;
  d = that.b * this$static.c + that.d * this$static.d;
  f = that.b * this$static.e + that.d * this$static.f + that.f;
  this$static.a_0 = a;
  this$static.b = b;
  this$static.c = c;
  this$static.d = d;
  this$static.e = e;
  this$static.f = f;
}

function $isIdentity(this$static){
  return isNear(this$static.a_0, 1) && isNear(this$static.d, 1) && isNear(this$static.c, 0) && isNear(this$static.e, 0) && isNear(this$static.b, 0) && isNear(this$static.f, 0);
}

function $setToIdentity(this$static){
  this$static.a_0 = this$static.d = 1;
  this$static.c = this$static.e = this$static.b = this$static.f = 0;
}

function $setTransform(this$static, t){
  this$static.a_0 = t.a_0;
  this$static.b = t.b;
  this$static.c = t.c;
  this$static.d = t.d;
  this$static.e = t.e;
  this$static.f = t.f;
}

function $toSvgTransform(this$static){
  return 'matrix(' + this$static.a_0 + ',' + this$static.b + ',' + this$static.c + ',' + this$static.d + ',' + this$static.e + ',' + this$static.f + ')';
}

function Transform_0(){
  this.a_0 = this.d = 1;
  this.c = this.e = this.b = this.f = 0;
}

function Transform_1(a, b, c, d, e, f){
  this.a_0 = a;
  this.b = b;
  this.c = c;
  this.d = d;
  this.e = e;
  this.f = f;
}

function Transform_2(t){
  $setTransform(this, t);
}

function getRotateInstance(radians){
  var cos, sin;
  sin = Math.sin(radians);
  cos = Math.cos(radians);
  return new Transform_1(cos, sin, -sin, cos, 0, 0);
}

function getRotateInstance_0(radians, anchorx, anchory){
  var trans;
  trans = new Transform_0;
  $concatenate(trans, new Transform_1(1, 0, 0, 1, -anchorx, -anchory));
  $concatenate(trans, getRotateInstance(radians));
  $concatenate(trans, new Transform_1(1, 0, 0, 1, anchorx, anchory));
  return trans;
}

function isNear(a, b){
  return -1.0E-6 <= a - b && a - b <= 1.0E-6;
}

defineSeed(296, 1, makeCastMap([Q$Transform]), Transform_0, Transform_1, Transform_2);
_.a_0 = 0;
_.b = 0;
_.c = 0;
_.d = 0;
_.e = 0;
_.f = 0;
function azzert(expr){
  if (!expr) {
    throw new AssertionError_0;
  }
}

function azzert_0(expr){
  if (!expr) {
    throw new AssertionError_1('First command must be moveTo');
  }
}

function getenv(key){
  var val = null;
  if ($wnd.TNOODLE_ENV) {
    val = $wnd.TNOODLE_ENV[key];
    val === undefined && (val = null);
  }
  return val;
}

function $clinit_GwtSafeUtils(){
  $clinit_GwtSafeUtils = nullMethod;
  var orangeHeraldicTincture, timPurple;
  WCA_COLORS = new HashMap_0;
  timPurple = new Color_1(98, 50, 122);
  orangeHeraldicTincture = new Color_1(255, 128, 0);
  WCA_COLORS.put('y', ($clinit_Color() , YELLOW));
  WCA_COLORS.put('yellow', YELLOW);
  WCA_COLORS.put('b', BLUE);
  WCA_COLORS.put('blue', BLUE);
  WCA_COLORS.put('r', RED);
  WCA_COLORS.put('red', RED);
  WCA_COLORS.put('w', WHITE);
  WCA_COLORS.put('white', WHITE);
  WCA_COLORS.put('g', GREEN);
  WCA_COLORS.put('green', GREEN);
  WCA_COLORS.put('o', orangeHeraldicTincture);
  WCA_COLORS.put('orange', orangeHeraldicTincture);
  WCA_COLORS.put('p', timPurple);
  WCA_COLORS.put('purple', timPurple);
  WCA_COLORS.put('0', GRAY);
  WCA_COLORS.put('grey', GRAY);
  WCA_COLORS.put('gray', GRAY);
}

function azzert_1(expr){
  $clinit_GwtSafeUtils();
  if (!expr) {
    throw new AssertionError_0;
  }
}

function azzert_2(expr, message){
  $clinit_GwtSafeUtils();
  if (!expr) {
    throw new AssertionError_1(message);
  }
}

function azzert_3(expr, t){
  $clinit_GwtSafeUtils();
  if (!expr) {
    throw new AssertionError_1(t);
  }
}

function azzertEquals(a, b){
  $clinit_GwtSafeUtils();
  var equal;
  !a?(equal = !b):(equal = !!b && b.value == a.value);
  azzert_2(equal, a + ' should be equal to ' + b);
}

function choose(r, keySet){
  $clinit_GwtSafeUtils();
  var chosen, count, element, element$iterator;
  chosen = null;
  count = 0;
  for (element$iterator = $iterator(keySet); element$iterator.val$outerIter.hasNext();) {
    element = $next_0(element$iterator);
    $nextInt(r, ++count) == 0 && (chosen = element);
  }
  azzert_1(count > 0);
  return chosen;
}

function clone(src){
  $clinit_GwtSafeUtils();
  var dest;
  dest = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, src.length, 1);
  arraycopy(src, 0, dest, 0, src.length);
  return dest;
}

function copyOfRange(src, to){
  $clinit_GwtSafeUtils();
  var dest;
  dest = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, to - 12, 1);
  arraycopy(src, 12, dest, 0, dest.length);
  return dest;
}

function deepCopy(src, dest){
  $clinit_GwtSafeUtils();
  var i_0;
  for (i_0 = 0; i_0 < src.length; ++i_0) {
    arraycopy(src[i_0], 0, dest[i_0], 0, src[i_0].length);
  }
}

function deepCopy_0(src, dest){
  $clinit_GwtSafeUtils();
  var i_0;
  for (i_0 = 0; i_0 < src.length; ++i_0) {
    deepCopy(src[i_0], dest[i_0]);
  }
}

function join(arr, separator){
  var maybeJsoInvocation;
  $clinit_GwtSafeUtils();
  var i_0, sb;
  separator == null && (separator = ',');
  sb = new StringBuilder_0;
  for (i_0 = 0; i_0 < arr.size; ++i_0) {
    i_0 > 0 && (sb.impl.append_2(sb.data, separator) , sb);
    $append_5(sb, (checkIndex(i_0, arr.size) , maybeJsoInvocation = arr.array[i_0] , isJavaObject(maybeJsoInvocation)?maybeJsoInvocation.toString$():maybeJsoInvocation.toString?maybeJsoInvocation.toString():'[JavaScriptObject]'));
  }
  return sb.impl.toString_0(sb.data);
}

function modulo(x, m_0){
  $clinit_GwtSafeUtils();
  var y;
  azzert_2(m_0 > 0, 'm must be > 0');
  y = x % m_0;
  y < 0 && (y += m_0);
  return y;
}

function reverseHashMap(map){
  $clinit_GwtSafeUtils();
  var a, a$iterator, b, reverseMap;
  reverseMap = new HashMap_0;
  for (a$iterator = $iterator($keySet(map)); a$iterator.val$outerIter.hasNext();) {
    a = $next_0(a$iterator);
    b = map.get(a);
    reverseMap.put(b, a);
  }
  return reverseMap;
}

var WCA_COLORS;
function $clinit_TimedLogRecordEnd(){
  $clinit_TimedLogRecordEnd = nullMethod;
  nf = ($clinit_NumberFormat() , new NumberFormat_1(['USD', 'US$', 2, 'US$', '$']));
}

function TimedLogRecordEnd_0(level, msg, extraMsg, startMillis, endMillis){
  var str;
  $clinit_TimedLogRecordEnd();
  LogRecord_0.call(this, level, (str = 'FINISHED ' + msg + ' (took ' + $format(nf, toDouble(div(sub(endMillis, startMillis), P3e8_longLit))) + ' seconds' , extraMsg != null && (str += ', ' + extraMsg) , str += ')' , str));
}

defineSeed(300, 266, makeCastMap([Q$Serializable]), TimedLogRecordEnd_0);
var nf;
function $finishedAt(this$static, endMillis, extraMsg){
  return new TimedLogRecordEnd_0(this$static.level, this$static.msg, extraMsg, this$static.startMillis, endMillis);
}

function $finishedNow(this$static, extraMsg){
  return $finishedAt(this$static, ($clinit_System() , fromDouble(currentTimeMillis0())), extraMsg);
}

function TimedLogRecordStart_0(level, msg){
  TimedLogRecordStart_1.call(this, level, msg, ($clinit_System() , fromDouble(currentTimeMillis0())));
}

function TimedLogRecordStart_1(level, msg, startMillis){
  LogRecord_0.call(this, level, 'STARTED ' + msg);
  this.startMillis = startMillis;
  this.msg = msg;
}

defineSeed(301, 266, makeCastMap([Q$Serializable]), TimedLogRecordStart_0);
_.msg = null;
_.startMillis = P0_longLit;
defineSeed(305, 1, {});
function $addExporter(this$static, c, o){
  this$static.exporterMap.put(c, o);
}

function $computeVarArguments(len, args){
  var ret = [];
  for (i = 0; i < len - 1; i++)
    ret.push(args[i]);
  var alen = args.length;
  var p_0 = len - 1;
  if (alen >= len && Object.prototype.toString.apply(args[p_0]) === '[object Array]') {
    ret.push(args[p_0]);
  }
   else {
    var a = [];
    for (i = p_0; i < alen; i++)
      a.push(args[i]);
    ret.push(a);
  }
  return ret;
}

function $declarePackage(qualifiedExportName){
  var i_0, l_0, o, prefix, superPackages;
  superPackages = $split(qualifiedExportName, '\\.', 0);
  prefix = $wnd;
  i_0 = 0;
  for (l_0 = superPackages.length - 1; i_0 < l_0; ++i_0) {
    if (!$equals_0(superPackages[i_0], 'client')) {
      prefix[superPackages[i_0]] || (prefix[superPackages[i_0]] = {});
      prefix = prefix != null?prefix[superPackages[i_0]]:null;
    }
  }
  o = prefix != null?prefix[superPackages[i_0]]:null;
  return o;
}

function $getMaxArity(jsoMap, meth){
  var o = jsoMap[meth];
  var r = 0;
  for (k in o)
    r = Math.max(r, k);
  return r;
}

function $registerDispatchMap(this$static, clazz, dispMap, isStatic){
  var jso, map;
  map = isStatic?this$static.staticDispatchMap:this$static.dispatchMap;
  jso = dynamicCastJso(map.get(clazz));
  !jso?(jso = dispMap):mergeJso(jso, dispMap);
  map.put(clazz, jso);
}

function $runDispatch(this$static, instance, clazz, meth, arguments_0, isStatic, isVarArgs){
  var args, dmap, i_0, l_0, ret;
  dmap = isStatic?this$static.staticDispatchMap:this$static.dispatchMap;
  if (isVarArgs) {
    for (l_0 = $getMaxArity(dynamicCastJso(dmap.get(clazz)), meth) , i_0 = l_0; i_0 >= 1; --i_0) {
      args = $computeVarArguments(i_0, arguments_0);
      ret = $runDispatch_0(instance, dmap, clazz, meth, args);
      if (!ret) {
        args = $unshift(instance, args);
        ret = $runDispatch_0(instance, dmap, clazz, meth, args);
      }
      if (ret) {
        return ret;
      }
    }
  }
   else {
    ret = $runDispatch_0(instance, dmap, clazz, meth, arguments_0);
    if (!ret) {
      arguments_0 = $unshift(instance, arguments_0);
      ret = $runDispatch_0(instance, dmap, clazz, meth, arguments_0);
    }
    if (ret) {
      return ret;
    }
  }
  throw new RuntimeException_1("Can't find exported method for given arguments: " + meth + ':' + arguments_0.length + '\n');
}

function $runDispatch_0(instance, dmap, clazz, meth, arguments_0){
  var aFunc, i_0, jFunc, l_0, r, sig, sigs, wFunc, x;
  sigs = dynamicCastJso(dmap.get(clazz))[meth][arguments_0.length];
  jFunc = null;
  wFunc = null;
  aFunc = null;
  for (i_0 = 0 , l_0 = !sigs?0:sigs.length; i_0 < l_0; ++i_0) {
    sig = sigs[i_0];
    if ($matches(sig, arguments_0)) {
      jFunc = sig[0];
      wFunc = sig[1];
      aFunc = sig[2];
      break;
    }
  }
  if (!jFunc) {
    return null;
  }
   else {
    arguments_0 = aFunc?aFunc(instance, arguments_0):arguments_0;
    r = (x = jFunc.apply(instance, arguments_0) , [wFunc?wFunc(x):x]);
    return r;
  }
}

function $toArrObject(j, ret){
  var i_0, l_0, o, s;
  s = j;
  l_0 = s.length;
  for (i_0 = 0; i_0 < l_0; ++i_0) {
    o = s[i_0];
    instanceOfJso(o) && getGwtInstance(dynamicCastJso(o)) != null && (o = getGwtInstance(dynamicCastJso(o)));
    setCheck(ret, i_0, o);
  }
  return ret;
}

function $unshift(o, arr){
  var ret = [o];
  for (i = 0; i < arr.length; i++)
    ret.push(arr[i]);
  return ret;
}

function ExporterBaseActual_0(){
  this.exporterMap = new HashMap_0;
  this.dispatchMap = new HashMap_0;
  this.staticDispatchMap = new HashMap_0;
}

function getGwtInstance(o){
  return o && o.g?o.g:null;
}

function isAssignableToClass(o, clazz){
  var sup;
  if (Ljava_lang_Object_2_classLit == clazz) {
    return true;
  }
  if (Lorg_timepedia_exporter_client_Exportable_2_classLit == clazz && instanceOf(o, Q$Exportable)) {
    return true;
  }
  if (o != null) {
    for (sup = getClass__devirtual$(o); !!sup && sup != Ljava_lang_Object_2_classLit; sup = sup.superclass) {
      if (sup == clazz) {
        return true;
      }
    }
  }
  return false;
}

function mergeJso(o1, o2){
  for (p in o2) {
    o1[p] = o2[p];
  }
}

defineSeed(304, 305, {}, ExporterBaseActual_0);
function $matches(this$static, arguments_0){
  var argJsType, gwt, i_0, isBoolean, isClass, isNumber, isPrimitive, jsType, l_0, o;
  for (i_0 = 0 , l_0 = arguments_0.length; i_0 < l_0; ++i_0) {
    jsType = this$static[i_0 + 3];
    argJsType = typeof_$(arguments_0, i_0);
    if ($equals_0(argJsType, jsType)) {
      continue;
    }
    if ($equals_0('string', jsType) && $equals_0('null', argJsType)) {
      continue;
    }
    isNumber = $equals_0('number', argJsType);
    isBoolean = $equals_0('boolean', argJsType);
    if (Ljava_lang_Object_2_classLit === jsType) {
      isNumber && (arguments_0[i_0] = new Double_0(arguments_0[i_0]) , undefined);
      isBoolean && (arguments_0[i_0] = ($clinit_Boolean() , arguments_0[i_0]?TRUE_0:FALSE_0) , undefined);
      continue;
    }
    isPrimitive = isNumber || isBoolean;
    isClass = !isPrimitive && jsType != null && getClass__devirtual$(jsType) == Ljava_lang_Class_2_classLit;
    if (isClass) {
      o = arguments_0[i_0];
      if (o == null || isAssignableToClass(o, dynamicCast(jsType, Q$Class))) {
        continue;
      }
      if (instanceOfJso(o)) {
        gwt = getGwtInstance(dynamicCastJso(o));
        if (gwt != null) {
          if (isAssignableToClass(gwt, dynamicCast(jsType, Q$Class))) {
            arguments_0[i_0] = gwt;
            continue;
          }
        }
      }
    }
    if ($equals_0('object', jsType) && !isNumber && !isBoolean) {
      continue;
    }
    return false;
  }
  return true;
}

function typeof_$(args, i_0){
  var o = args[i_0];
  var t = o == null?'null':typeof o;
  if (t == 'object') {
    return Object.prototype.toString.call(o) == '[object Array]' || typeof o.length == 'number'?'array':t;
  }
  return t;
}

function $clinit_ExporterUtil(){
  $clinit_ExporterUtil = nullMethod;
  impl_4 = new ExporterBaseActual_0;
}

function declarePackage(qualifiedExportName){
  $clinit_ExporterUtil();
  return $declarePackage(qualifiedExportName);
}

function gwtInstance(o){
  var g;
  $clinit_ExporterUtil();
  return o != null && instanceOfJso(o) && (g = getGwtInstance(dynamicCastJso(o))) != null?g:o;
}

function registerDispatchMap(clazz, dispMap, isStatic){
  $clinit_ExporterUtil();
  $registerDispatchMap(impl_4, clazz, dispMap, isStatic);
}

function runDispatch(instance, clazz, meth, arguments_0, isStatic, isVarArgs){
  $clinit_ExporterUtil();
  return $runDispatch(impl_4, instance, clazz, meth, arguments_0, isStatic, isVarArgs);
}

function setWrapper(instance, wrapper){
  $clinit_ExporterUtil();
  instance['__gwtex_wrap'] = wrapper;
}

function wrap(type){
  $clinit_ExporterUtil();
  return type;
}

var impl_4;
function $clinit_ClockPuzzle(){
  $clinit_ClockPuzzle = nullMethod;
  $clinit_Puzzle();
  $clinit_Logger();
  $getLoggerHelper(Lpuzzle_ClockPuzzle_2_classLit.typeName);
  turns = initValues(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, ['UR', 'DR', 'DL', 'UL', 'U', 'R', 'D', 'L', 'ALL']);
  arrowAngle = 1.5707963267948966 - Math.acos(0.2);
  moves_0 = initValues(_3_3I_classLit, makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), Q$int_$1, [initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [0, 1, 1, 0, 1, 1, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0, 0, 0]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, -1, 0, 0]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, -1, 0, 0, 0, 0, 0, 0]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [1, 1, 1, 1, 1, 1, 0, 0, 0, -1, 0, -1, 0, 0, 0, 0, 0, 0]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [0, 1, 1, 0, 1, 1, 0, 1, 1, -1, 0, 0, 0, 0, 0, -1, 0, 0]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, -1, 0, -1]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, -1, 0, 0, 0, 0, 0, -1]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [1, 1, 1, 1, 1, 1, 1, 1, 1, -1, 0, -1, 0, 0, 0, -1, 0, -1])]);
  defaultColorScheme = new HashMap_0;
  defaultColorScheme.put('Front', new Color_0(3372466));
  defaultColorScheme.put('Back', new Color_0(5623039));
  defaultColorScheme.put('FrontClock', new Color_0(5623039));
  defaultColorScheme.put('BackClock', new Color_0(3372466));
  defaultColorScheme.put('Hand', ($clinit_Color() , YELLOW));
  defaultColorScheme.put('HandBorder', RED);
  defaultColorScheme.put('PinUp', YELLOW);
  defaultColorScheme.put('PinDown', new Color_0(8934656));
}

function ClockPuzzle_0(){
  $clinit_ClockPuzzle();
  Puzzle_0.call(this);
}

defineSeed(309, 275, makeCastMap([Q$Puzzle, Q$Exportable, Q$ClockPuzzle]), ClockPuzzle_0);
_.generateRandomMoves_0 = function generateRandomMoves_0(r){
  var clockwise, e, isFirst, scramble, scrambleStr, state, turn, x;
  scramble = new StringBuilder_0;
  for (x = 0; x < 9; ++x) {
    turn = $nextInt(r, 12) - 5;
    clockwise = turn >= 0;
    turn = turn < 0?-turn:turn;
    $append_5(scramble, turns[x] + turn + (clockwise?'+':'-') + ' ');
  }
  scramble.impl.append_2(scramble.data, 'y2 ');
  for (x = 4; x < 9; ++x) {
    turn = $nextInt(r, 12) - 5;
    clockwise = turn >= 0;
    turn = turn < 0?-turn:turn;
    $append_5(scramble, turns[x] + turn + (clockwise?'+':'-') + ' ');
  }
  isFirst = true;
  for (x = 0; x < 4; ++x) {
    if ($nextInt(r, 2) == 1) {
      $append_5(scramble, (isFirst?'':' ') + turns[x]);
      isFirst = false;
    }
  }
  scrambleStr = $trim(scramble.impl.toString_0(scramble.data));
  state = new ClockPuzzle$ClockState_0(this);
  try {
    state = $applyAlgorithm(state, scrambleStr);
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, Q$InvalidScrambleException)) {
      e = $e0;
      azzert_3(false, e);
      return null;
    }
     else 
      throw $e0;
  }
  return new PuzzleStateAndGenerator_0(state, scrambleStr);
}
;
_.getDefaultColorScheme_0 = function getDefaultColorScheme(){
  return new HashMap_1(defaultColorScheme);
}
;
_.getLongName_0 = function getLongName(){
  return 'Clock';
}
;
_.getPreferredSize_0 = function getPreferredSize_0(){
  return new Dimension_0(300, 150);
}
;
_.getRandomMoveCount = function getRandomMoveCount(){
  return 19;
}
;
_.getShortName_0 = function getShortName(){
  return 'clock';
}
;
_.getSolvedState_0 = function getSolvedState(){
  return new ClockPuzzle$ClockState_0(this);
}
;
var arrowAngle, defaultColorScheme, moves_0, turns;
function $drawBackground(this$static, g, colorScheme){
  var c, centerX, centerX$array, centerX$index, centerX$max, centerY, centerY$array, centerY$index, centerY$max, clockFace, colorString, i_0, j, k_0, outerCircle, s, t, tCopy, tickMark;
  this$static.rightSideUp?(colorString = initValues(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, ['Front', 'Back'])):(colorString = initValues(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, ['Back', 'Front']));
  for (s = 0; s < 2; ++s) {
    t = new Transform_1(1, 0, 0, 1, (s * 2 + 1) * 75, 75);
    for (centerX$array = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [-40, 40]) , centerX$index = 0 , centerX$max = centerX$array.length; centerX$index < centerX$max; ++centerX$index) {
      centerX = centerX$array[centerX$index];
      for (centerY$array = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [-40, 40]) , centerY$index = 0 , centerY$max = centerY$array.length; centerY$index < centerY$max; ++centerY$index) {
        centerY = centerY$array[centerY$index];
        c = new Circle_0(centerX, centerY, 20);
        !t?$setToIdentity(c.transform):$setTransform(c.transform, t);
        $setStroke_0(c, ($clinit_Color() , BLACK));
        $add_0(g.children, c);
      }
    }
    outerCircle = new Circle_0(0, 0, 70);
    !t?$setToIdentity(outerCircle.transform):$setTransform(outerCircle.transform, t);
    $setStroke_0(outerCircle, ($clinit_Color() , BLACK));
    $setFill(outerCircle, dynamicCast(colorScheme.get(colorString[s]), Q$Color));
    $add_0(g.children, outerCircle);
    for (centerX$array = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [-40, 40]) , centerX$index = 0 , centerX$max = centerX$array.length; centerX$index < centerX$max; ++centerX$index) {
      centerX = centerX$array[centerX$index];
      for (centerY$array = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [-40, 40]) , centerY$index = 0 , centerY$max = centerY$array.length; centerY$index < centerY$max; ++centerY$index) {
        centerY = centerY$array[centerY$index];
        c = new Circle_0(centerX, centerY, 19);
        !t?$setToIdentity(c.transform):$setTransform(c.transform, t);
        $setFill(c, dynamicCast(colorScheme.get(colorString[s]), Q$Color));
        $add_0(g.children, c);
      }
    }
    for (i_0 = -1; i_0 <= 1; ++i_0) {
      for (j = -1; j <= 1; ++j) {
        tCopy = new Transform_2(t);
        $concatenate(tCopy, new Transform_1(1, 0, 0, 1, 2 * i_0 * 20, 2 * j * 20));
        clockFace = new Circle_0(0, 0, 14);
        $setStroke_0(clockFace, BLACK);
        $setFill(clockFace, dynamicCast(colorScheme.get(colorString[s] + 'Clock'), Q$Color));
        !tCopy?$setToIdentity(clockFace.transform):$setTransform(clockFace.transform, tCopy);
        $add_0(g.children, clockFace);
        for (k_0 = 0; k_0 < 12; ++k_0) {
          tickMark = new Circle_0(0, -17, 1);
          $setFill(tickMark, dynamicCast(colorScheme.get(colorString[s] + 'Clock'), Q$Color));
          $concatenate(tickMark.transform, getRotateInstance(30 * k_0 * 0.017453292519943295));
          $concatenate(tickMark.transform, tCopy);
          $add_0(g.children, tickMark);
        }
      }
    }
  }
}

function $drawClock(g, clock, position, colorScheme){
  var arrow, deltaX, deltaY, handBase, netX, netY, t;
  t = new Transform_0;
  $concatenate(t, getRotateInstance(position * 30 * 0.017453292519943295));
  netX = 0;
  netY = 0;
  if (clock < 9) {
    $concatenate(t, new Transform_1(1, 0, 0, 1, 75, 75));
    netX += 75;
    netY += 75;
  }
   else {
    $concatenate(t, new Transform_1(1, 0, 0, 1, 225, 75));
    netX += 225;
    netY += 75;
    clock -= 9;
  }
  deltaX = 2 * (clock % 3 - 1) * 20;
  deltaY = 2 * (~~(clock / 3) - 1) * 20;
  $concatenate(t, new Transform_1(1, 0, 0, 1, deltaX, deltaY));
  netX += deltaX;
  netY += deltaY;
  arrow = new Path_0;
  $moveTo(arrow, 0, 0);
  $lineTo(arrow, 2 * cos_0(($clinit_ClockPuzzle() , arrowAngle)), -2 * sin_0(arrowAngle));
  $lineTo(arrow, 0, -10);
  $lineTo(arrow, -2 * cos_0(arrowAngle), -2 * sin_0(arrowAngle));
  azzert_0(!!arrow.commands);
  $add_0(arrow.commands, new Path$Command_0(4, null));
  $setStroke_0(arrow, dynamicCast(colorScheme.get('HandBorder'), Q$Color));
  !t?$setToIdentity(arrow.transform):$setTransform(arrow.transform, t);
  $add_0(g.children, arrow);
  handBase = new Circle_0(0, 0, 2);
  $setStroke_0(handBase, dynamicCast(colorScheme.get('HandBorder'), Q$Color));
  !t?$setToIdentity(handBase.transform):$setTransform(handBase.transform, t);
  $add_0(g.children, handBase);
  arrow = new Path_1(arrow);
  $setFill(arrow, dynamicCast(colorScheme.get('Hand'), Q$Color));
  azzert('stroke' != 'style');
  arrow.attributes.put('stroke', 'none');
  !t?$setToIdentity(arrow.transform):$setTransform(arrow.transform, t);
  $add_0(g.children, arrow);
  handBase = new Circle_1(handBase);
  $setFill(handBase, dynamicCast(colorScheme.get('Hand'), Q$Color));
  azzert('stroke' != 'style');
  handBase.attributes.put('stroke', 'none');
  !t?$setToIdentity(handBase.transform):$setTransform(handBase.transform, t);
  $add_0(g.children, handBase);
}

function $drawPin(g, t, pinUp, colorScheme){
  var pin;
  pin = new Circle_0(0, 0, 4);
  !t?$setToIdentity(pin.transform):$setTransform(pin.transform, t);
  $setStroke_0(pin, ($clinit_Color() , BLACK));
  $setFill(pin, dynamicCast(colorScheme.get(pinUp?'PinUp':'PinDown'), Q$Color));
  $add_0(g.children, pin);
}

function $drawPins(g, pins, colorScheme){
  var i_0, j, k_0, t, tt;
  t = new Transform_0;
  $concatenate(t, new Transform_1(1, 0, 0, 1, 75, 75));
  k_0 = 0;
  for (i_0 = -1; i_0 <= 1; i_0 += 2) {
    for (j = -1; j <= 1; j += 2) {
      tt = new Transform_2(t);
      $concatenate(tt, new Transform_1(1, 0, 0, 1, j * 20, i_0 * 20));
      $drawPin(g, tt, pins[k_0++], colorScheme);
    }
  }
  $concatenate(t, new Transform_1(1, 0, 0, 1, 150, 0));
  k_0 = 1;
  for (i_0 = -1; i_0 <= 1; i_0 += 2) {
    for (j = -1; j <= 1; j += 2) {
      tt = new Transform_2(t);
      $concatenate(tt, new Transform_1(1, 0, 0, 1, j * 20, i_0 * 20));
      $drawPin(g, tt, !pins[k_0--], colorScheme);
    }
    k_0 = 3;
  }
}

function ClockPuzzle$ClockState_0(this$0){
  this.this$0 = this$0;
  this.this$0_0 = this$0;
  this.pins = initValues(_3Z_classLit, makeCastMap([Q$boolean_$1, Q$Serializable]), -1, [false, false, false, false]);
  this.posit = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  this.rightSideUp = true;
}

function ClockPuzzle$ClockState_1(this$0, pins, posit, rightSideUp){
  this.this$0 = this$0;
  this.this$0_0 = this$0;
  this.pins = pins;
  this.posit = posit;
  this.rightSideUp = rightSideUp;
}

defineSeed(310, 277, makeCastMap([Q$Puzzle$PuzzleState, Q$ClockPuzzle$ClockState]), ClockPuzzle$ClockState_0, ClockPuzzle$ClockState_1);
_.drawScramble = function drawScramble(colorScheme){
  var i_0, svg;
  svg = new Svg_0(new Dimension_0(300, 150));
  $setStroke(svg);
  $drawBackground(this, svg, colorScheme);
  for (i_0 = 0; i_0 < 18; ++i_0) {
    $drawClock(svg, i_0, this.posit[i_0], colorScheme);
  }
  $drawPins(svg, this.pins, colorScheme);
  return svg;
}
;
_.equals$ = function equals_28(other){
  var o;
  o = dynamicCast(other, Q$ClockPuzzle$ClockState);
  return equals_18(this.posit, o.posit);
}
;
_.getSuccessorsByName = function getSuccessorsByName(){
  var clockwise, move, p_0, pin, pinI, pinsC, pinsCopy, positC, positCopy, rot, successors, turn;
  successors = new LinkedHashMap_0;
  for (turn = 0; turn < ($clinit_ClockPuzzle() , turns).length; ++turn) {
    for (rot = 0; rot < 12; ++rot) {
      positCopy = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 18, 1);
      pinsCopy = initDim(_3Z_classLit, makeCastMap([Q$boolean_$1, Q$Serializable]), -1, 4, 2);
      for (p_0 = 0; p_0 < 18; ++p_0) {
        positCopy[p_0] = (this.posit[p_0] + rot * moves_0[turn][p_0] + 12) % 12;
      }
      arraycopy(this.pins, 0, pinsCopy, 0, 4);
      clockwise = rot < 7;
      move = turns[turn] + (clockwise?rot + '+':12 - rot + '-');
      $put_0(successors, move, new ClockPuzzle$ClockState_1(this.this$0, pinsCopy, positCopy, this.rightSideUp));
    }
  }
  positCopy = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 18, 1);
  pinsCopy = initDim(_3Z_classLit, makeCastMap([Q$boolean_$1, Q$Serializable]), -1, 4, 2);
  arraycopy(this.posit, 0, positCopy, 9, 9);
  arraycopy(this.posit, 9, positCopy, 0, 9);
  arraycopy(this.pins, 0, pinsCopy, 0, 4);
  $put_0(successors, 'y2', new ClockPuzzle$ClockState_1(this.this$0, pinsCopy, positCopy, !this.rightSideUp));
  for (pin = 0; pin < 4; ++pin) {
    positC = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 18, 1);
    pinsC = initDim(_3Z_classLit, makeCastMap([Q$boolean_$1, Q$Serializable]), -1, 4, 2);
    arraycopy(this.posit, 0, positC, 0, 18);
    arraycopy(this.pins, 0, pinsC, 0, 4);
    pinI = pin == 0?1:pin == 1?3:pin == 2?2:0;
    pinsC[pinI] = true;
    $put_0(successors, turns[pin], new ClockPuzzle$ClockState_1(this.this$0, pinsC, positC, this.rightSideUp));
  }
  return successors;
}
;
_.hashCode$ = function hashCode_29(){
  return hashCode_19(this.posit);
}
;
_.pins = null;
_.posit = null;
_.rightSideUp = false;
_.this$0 = null;
function $export_1(this$static){
  if (!exported_1) {
    exported_1 = true;
    $clinit_ExporterUtil();
    $addExporter(impl_4, Lpuzzle_ClockPuzzle_2_classLit, this$static);
    $export0_1(this$static);
  }
}

function $export0_1(this$static){
  var pkg = declarePackage('puzzle.ClockPuzzle');
  var __0, __ = this$static;
  $wnd.puzzle.ClockPuzzle = $entry(function(){
    var g, j = this, a = arguments;
    a.length == 1 && __.isAssignable(a[0])?(g = a[0]):a.length == 0 && (g = new ClockPuzzle_0);
    j.g = g;
    setWrapper(g, j);
    return j;
  }
  );
  __0 = $wnd.puzzle.ClockPuzzle.prototype = new Object;
  __0.generateRandomMoves = $entry(function(a0){
    return this.g.generateRandomMoves_0(gwtInstance(a0));
  }
  );
  __0.generateScramble = $entry(function(){
    return this.g.generateScramble_0();
  }
  );
  __0.generateScrambles = $entry(function(a0){
    return wrap(this.g.generateScrambles_0(a0));
  }
  );
  __0.generateSeededScramble = $entry(function(a0){
    return this.g.generateSeededScramble_0(a0);
  }
  );
  __0.generateSeededScrambles = $entry(function(a0, a1){
    return wrap(this.g.generateSeededScrambles_0(a0, a1));
  }
  );
  __0.getDefaultColorScheme = $entry(function(){
    return this.g.getDefaultColorScheme_0();
  }
  );
  __0.getFaceNames = $entry(function(){
    return wrap(this.g.getFaceNames_0());
  }
  );
  __0.getLongName = $entry(function(){
    return this.g.getLongName_0();
  }
  );
  __0.getPreferredSize = $entry(function(a0, a1){
    return runDispatch(this.g, Lpuzzle_ClockPuzzle_2_classLit, 0, arguments, false, false)[0];
  }
  );
  __0.getShortName = $entry(function(){
    return this.g.getShortName_0();
  }
  );
  __0.getSolvedState = $entry(function(){
    return this.g.getSolvedState_0();
  }
  );
  __0.toString = $entry(function(){
    return this.g.toString$();
  }
  );
  registerDispatchMap(Lpuzzle_ClockPuzzle_2_classLit, {0:{0:[[function(){
    return this.getPreferredSize_0.apply(this, arguments);
  }
  , null, undefined]], 2:[[function(){
    return this.getPreferredSize_1.apply(this, arguments);
  }
  , null, undefined, 'number', 'number']]}}, false);
  if (pkg)
    for (p in pkg)
      $wnd.puzzle.ClockPuzzle[p] === undefined && ($wnd.puzzle.ClockPuzzle[p] = pkg[p]);
}

function ClockPuzzleExporterImpl_0(){
  $export_1(this);
}

defineSeed(311, 1, {}, ClockPuzzleExporterImpl_0);
_.isAssignable = function isAssignable_1(o){
  return o != null && instanceOf(o, Q$ClockPuzzle);
}
;
var exported_1 = false;
function $clinit_CubePuzzle(){
  $clinit_CubePuzzle = nullMethod;
  $clinit_Puzzle();
  DIR_TO_STR = initValues(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, [null, '', '2', "'"]);
  faceRotationsByName = new HashMap_0;
  faceRotationsByName.put(($clinit_CubePuzzle$Face() , R), 'x');
  faceRotationsByName.put(U, 'y');
  faceRotationsByName.put(F, 'z');
  DEFAULT_LENGTHS = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [0, 0, 25, 25, 40, 60, 80, 100, 120, 140, 160, 180]);
  defaultColorScheme_0 = new HashMap_0;
  defaultColorScheme_0.put('B', ($clinit_Color() , BLUE));
  defaultColorScheme_0.put('D', YELLOW);
  defaultColorScheme_0.put('F', GREEN);
  defaultColorScheme_0.put('L', new Color_1(255, 128, 0));
  defaultColorScheme_0.put('R', RED);
  defaultColorScheme_0.put('U', WHITE);
}

function $cloneImage(image){
  var imageCopy;
  imageCopy = initDims([_3_3_3I_classLit, _3_3I_classLit, _3I_classLit], [makeCastMap([Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$2, Q$int_$1, -1], [image.length, image[0].length, image[0][0].length], 3, 1);
  deepCopy_0(image, imageCopy);
  return imageCopy;
}

function $drawCube(this$static, g, state, colorScheme){
  $paintCubeFace(g, 2, 4 + this$static.size * 10, this$static.size, state[($clinit_CubePuzzle$Face() , L).ordinal], colorScheme);
  $paintCubeFace(g, 4 + this$static.size * 10, 6 + 2 * this$static.size * 10, this$static.size, state[D.ordinal], colorScheme);
  $paintCubeFace(g, 8 + 3 * this$static.size * 10, 4 + this$static.size * 10, this$static.size, state[B.ordinal], colorScheme);
  $paintCubeFace(g, 6 + 2 * this$static.size * 10, 4 + this$static.size * 10, this$static.size, state[R.ordinal], colorScheme);
  $paintCubeFace(g, 4 + this$static.size * 10, 2, this$static.size, state[U.ordinal], colorScheme);
  $paintCubeFace(g, 4 + this$static.size * 10, 4 + this$static.size * 10, this$static.size, state[F.ordinal], colorScheme);
}

function $getRandomOrientationMoves(this$static, thickness){
  var i_0, moves, movesArr, randomFFaceMove, randomFFaceMove$index, randomFFaceMove$max, randomFFaceMoves, randomOrientationMoves, randomUFaceMove, randomUFaceMove$index, randomUFaceMove$max, randomUFaceMoves;
  randomUFaceMoves = initValues(_3Lpuzzle_CubePuzzle$CubeMove_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$CubePuzzle$CubeMove_$1]), Q$CubePuzzle$CubeMove, [null, new CubePuzzle$CubeMove_0(this$static, ($clinit_CubePuzzle$Face() , R), 1, thickness), new CubePuzzle$CubeMove_0(this$static, R, 2, thickness), new CubePuzzle$CubeMove_0(this$static, R, 3, thickness), new CubePuzzle$CubeMove_0(this$static, F, 1, thickness), new CubePuzzle$CubeMove_0(this$static, F, 3, thickness)]);
  randomFFaceMoves = initValues(_3Lpuzzle_CubePuzzle$CubeMove_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$CubePuzzle$CubeMove_$1]), Q$CubePuzzle$CubeMove, [null, new CubePuzzle$CubeMove_0(this$static, U, 1, thickness), new CubePuzzle$CubeMove_0(this$static, U, 2, thickness), new CubePuzzle$CubeMove_0(this$static, U, 3, thickness)]);
  randomOrientationMoves = initDim(_3_3Lpuzzle_CubePuzzle$CubeMove_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$CubePuzzle$CubeMove_$1, randomUFaceMoves.length * randomFFaceMoves.length, 0);
  i_0 = 0;
  for (randomUFaceMove$index = 0 , randomUFaceMove$max = randomUFaceMoves.length; randomUFaceMove$index < randomUFaceMove$max; ++randomUFaceMove$index) {
    randomUFaceMove = randomUFaceMoves[randomUFaceMove$index];
    for (randomFFaceMove$index = 0 , randomFFaceMove$max = randomFFaceMoves.length; randomFFaceMove$index < randomFFaceMove$max; ++randomFFaceMove$index) {
      randomFFaceMove = randomFFaceMoves[randomFFaceMove$index];
      moves = new ArrayList_0;
      !!randomUFaceMove && (setCheck(moves.array, moves.size++, randomUFaceMove) , true);
      !!randomFFaceMove && (setCheck(moves.array, moves.size++, randomFFaceMove) , true);
      movesArr = dynamicCast($toArray_0(moves, initDim(_3Lpuzzle_CubePuzzle$CubeMove_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$CubePuzzle$CubeMove_$1]), Q$CubePuzzle$CubeMove, moves.size, 0)), Q$CubePuzzle$CubeMove_$1);
      randomOrientationMoves[i_0++] = movesArr;
    }
  }
  return randomOrientationMoves;
}

function $isNormalized(this$static, image){
  return image[($clinit_CubePuzzle$Face() , B).ordinal][this$static.size - 1][this$static.size - 1] == B.ordinal && image[L.ordinal][this$static.size - 1][0] == L.ordinal && image[D.ordinal][this$static.size - 1][0] == D.ordinal;
}

function $normalize(this$static, image){
  var dir, f, goal, i_0, idx, j, spins, stickersByPiece, t;
  image = $cloneImage(image);
  spins = 0;
  while (!(image[($clinit_CubePuzzle$Face() , B).ordinal][this$static.size - 1][this$static.size - 1] == B.ordinal && image[L.ordinal][this$static.size - 1][0] == L.ordinal && image[D.ordinal][this$static.size - 1][0] == D.ordinal)) {
    azzert_1(spins < 2);
    stickersByPiece = getStickersByPiece(image);
    goal = 0;
    goal |= 1 << B.ordinal;
    goal |= 1 << L.ordinal;
    goal |= 1 << D.ordinal;
    idx = -1;
    for (i_0 = 0; i_0 < stickersByPiece.length; ++i_0) {
      t = 0;
      for (j = 0; j < stickersByPiece[i_0].length; ++j) {
        t |= 1 << stickersByPiece[i_0][j];
      }
      if (t == goal) {
        idx = i_0;
        break;
      }
    }
    azzert_1(idx >= 0);
    f = null;
    dir = 1;
    if (stickersByPiece[idx][0] == D.ordinal) {
      if (idx < 4) {
        f = F;
        dir = 2;
      }
       else {
        f = U;
        switch (idx) {
          case 4:
            dir = 2;
            break;
          case 5:
            dir = 1;
            break;
          case 6:
            dir = 3;
            break;
          default:azzert_1(false);
        }
      }
    }
     else if (stickersByPiece[idx][1] == D.ordinal) {
      switch (idx) {
        case 0:
        case 6:
          f = F;
          break;
        case 1:
        case 4:
          f = L;
          break;
        case 2:
        case 7:
          f = R;
          break;
        case 3:
        case 5:
          f = B;
          break;
        default:azzert_1(false);
      }
    }
     else {
      switch (idx) {
        case 2:
        case 4:
          f = F;
          break;
        case 0:
        case 5:
          f = L;
          break;
        case 3:
        case 6:
          f = R;
          break;
        case 1:
        case 7:
          f = B;
          break;
        default:azzert_1(false);
      }
    }
    $spinCube(this$static, image, f, dir);
    ++spins;
  }
  return image;
}

function $paintCubeFace(g, x, y, size, faceColors, colorScheme){
  var col, rect, row, tempx, tempy;
  for (row = 0; row < size; ++row) {
    for (col = 0; col < size; ++col) {
      tempx = x + col * 10;
      tempy = y + row * 10;
      rect = new Rectangle_0(tempx, tempy, 10, 10);
      $setFill(rect, dynamicCast(colorScheme.get(($clinit_CubePuzzle$Face() , $clinit_CubePuzzle$Face() , $VALUES_2)[faceColors[row][col]].name_0), Q$Color));
      $setStroke_0(rect, ($clinit_Color() , BLACK));
      $add_0(g.children, rect);
    }
  }
}

function $spinCube(this$static, image, face, dir){
  var slice;
  for (slice = 0; slice < this$static.size; ++slice) {
    slice_0(face, slice, dir, image);
  }
}

function CubePuzzle_0(size){
  $clinit_CubePuzzle();
  Puzzle_0.call(this);
  azzert_2(size >= 0 && size < DEFAULT_LENGTHS.length, 'Invalid cube size');
  this.size = size;
}

function getImageSize(size){
  $clinit_CubePuzzle();
  return new Dimension_0((size * 10 + 2) * 4 + 2, (size * 10 + 2) * 3 + 2);
}

function getStickersByPiece(img){
  $clinit_CubePuzzle();
  var s;
  s = img[0].length - 1;
  return initValues(_3_3I_classLit, makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), Q$int_$1, [initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [img[($clinit_CubePuzzle$Face() , U).ordinal][s][s], img[R.ordinal][0][0], img[F.ordinal][0][s]]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [img[U.ordinal][s][0], img[F.ordinal][0][0], img[L.ordinal][0][s]]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [img[U.ordinal][0][s], img[B.ordinal][0][0], img[R.ordinal][0][s]]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [img[U.ordinal][0][0], img[L.ordinal][0][0], img[B.ordinal][0][s]]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [img[D.ordinal][0][s], img[F.ordinal][s][s], img[R.ordinal][s][0]]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [img[D.ordinal][0][0], img[L.ordinal][s][s], img[F.ordinal][s][0]]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [img[D.ordinal][s][s], img[R.ordinal][s][s], img[B.ordinal][s][0]]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [img[D.ordinal][s][0], img[B.ordinal][s][s], img[L.ordinal][s][0]])]);
}

function slice_0(face, slice, dir, image){
  $clinit_CubePuzzle();
  var f, j, k_0, sdir, sface, size, sslice;
  size = image[0].length;
  azzert_1(slice >= 0 && slice < size);
  sface = face;
  sslice = slice;
  sdir = dir;
  if (face != ($clinit_CubePuzzle$Face() , L) && face != D && face != B) {
    sface = $VALUES_2[(face.ordinal + 3) % 6];
    sslice = size - 1 - slice;
    sdir = 4 - dir;
  }
  for (j = 0; j < size; ++j) {
    sface == L?swap_1(image, U.ordinal, j, sslice, B.ordinal, size - 1 - j, size - 1 - sslice, D.ordinal, j, sslice, F.ordinal, j, sslice, sdir):sface == D?swap_1(image, L.ordinal, size - 1 - sslice, j, B.ordinal, size - 1 - sslice, j, R.ordinal, size - 1 - sslice, j, F.ordinal, size - 1 - sslice, j, sdir):sface == B?swap_1(image, U.ordinal, sslice, j, R.ordinal, j, size - 1 - sslice, D.ordinal, size - 1 - sslice, size - 1 - j, L.ordinal, size - 1 - j, sslice, sdir):azzert_1(false);
  }
  if (slice == 0 || slice == size - 1) {
    if (slice == 0) {
      f = face.ordinal;
      sdir = 4 - dir;
    }
     else if (slice == size - 1) {
      f = $VALUES_2[(face.ordinal + 3) % 6].ordinal;
      sdir = dir;
    }
     else {
      azzert_1(false);
      return;
    }
    for (j = 0; j < ~~((size + 1) / 2); ++j) {
      for (k_0 = 0; k_0 < ~~(size / 2); ++k_0) {
        swap_1(image, f, j, k_0, f, k_0, size - 1 - j, f, size - 1 - j, size - 1 - k_0, f, size - 1 - k_0, j, sdir);
      }
    }
  }
}

function swap_1(image, f1, x1, y1, f2, x2, y2, f3, x3, y3, f4, x4, y4, dir){
  var temp;
  if (dir == 1) {
    temp = image[f1][x1][y1];
    image[f1][x1][y1] = image[f2][x2][y2];
    image[f2][x2][y2] = image[f3][x3][y3];
    image[f3][x3][y3] = image[f4][x4][y4];
    image[f4][x4][y4] = temp;
  }
   else if (dir == 2) {
    temp = image[f1][x1][y1];
    image[f1][x1][y1] = image[f3][x3][y3];
    image[f3][x3][y3] = temp;
    temp = image[f2][x2][y2];
    image[f2][x2][y2] = image[f4][x4][y4];
    image[f4][x4][y4] = temp;
  }
   else if (dir == 3) {
    temp = image[f4][x4][y4];
    image[f4][x4][y4] = image[f3][x3][y3];
    image[f3][x3][y3] = image[f2][x2][y2];
    image[f2][x2][y2] = image[f1][x1][y1];
    image[f1][x1][y1] = temp;
  }
   else {
    azzert_1(false);
  }
}

defineSeed(312, 275, makeCastMap([Q$Puzzle, Q$Exportable, Q$CubePuzzle]), CubePuzzle_0);
_.getDefaultColorScheme_0 = function getDefaultColorScheme_0(){
  return new HashMap_1(defaultColorScheme_0);
}
;
_.getLongName_0 = function getLongName_0(){
  return this.size + 'x' + this.size + 'x' + this.size;
}
;
_.getPreferredSize_0 = function getPreferredSize_1(){
  return getImageSize(this.size);
}
;
_.getRandomMoveCount = function getRandomMoveCount_0(){
  return DEFAULT_LENGTHS[this.size];
}
;
_.getShortName_0 = function getShortName_0(){
  return this.size + '' + this.size + '' + this.size;
}
;
_.getSolvedState_0 = function getSolvedState_0(){
  return new CubePuzzle$CubeState_0(this);
}
;
_.getSolvedState_1 = function getSolvedState_1(){
  return new CubePuzzle$CubeState_0(this);
}
;
_.size = 0;
var DEFAULT_LENGTHS, DIR_TO_STR, defaultColorScheme_0, faceRotationsByName;
function $toString_6(this$static){
  var f, move, rotationName;
  f = this$static.face.name_0;
  if (this$static.innerSlice == 0) {
    move = f;
  }
   else if (this$static.innerSlice == 1) {
    move = f + 'w';
  }
   else if (this$static.innerSlice == this$static.this$0.size - 1) {
    rotationName = dynamicCast(($clinit_CubePuzzle() , faceRotationsByName).get(this$static.face), Q$String);
    if (rotationName == null) {
      return null;
    }
    move = rotationName;
  }
   else {
    move = this$static.innerSlice + 1 + f + 'w';
  }
  move += ($clinit_CubePuzzle() , DIR_TO_STR)[this$static.dir];
  return move;
}

function CubePuzzle$CubeMove_0(this$0, face, dir, innerSlice){
  CubePuzzle$CubeMove_1.call(this, this$0, face, dir, innerSlice);
}

function CubePuzzle$CubeMove_1(this$0, face, dir, innerSlice){
  this.this$0 = this$0;
  this.face = face;
  this.dir = dir;
  this.innerSlice = innerSlice;
  azzert_1(true);
}

defineSeed(313, 1, makeCastMap([Q$CubePuzzle$CubeMove]), CubePuzzle$CubeMove_0, CubePuzzle$CubeMove_1);
_.toString$ = function toString_43(){
  return $toString_6(this);
}
;
_.dir = 0;
_.face = null;
_.innerSlice = 0;
_.this$0 = null;
function $getNormalized(this$static){
  var normalizedImage;
  if (!this$static.normalizedState) {
    normalizedImage = $normalize(this$static.this$0, this$static.image);
    this$static.normalizedState = new CubePuzzle$CubeState_1(this$static.this$0, normalizedImage);
  }
  return this$static.normalizedState;
}

function $getSuccessorsWithinSlice(this$static, maxSlice, includeRedundant){
  var dir, face, face$array, face$index, face$max, halfOfEvenCube, imageCopy, innerSlice, move, moveStr, slice, successors;
  successors = new LinkedHashMap_0;
  for (innerSlice = 0; innerSlice <= maxSlice; ++innerSlice) {
    for (face$array = ($clinit_CubePuzzle$Face() , $clinit_CubePuzzle$Face() , $VALUES_2) , face$index = 0 , face$max = face$array.length; face$index < face$max; ++face$index) {
      face = face$array[face$index];
      halfOfEvenCube = this$static.this$0.size % 2 == 0 && innerSlice == ~~(this$static.this$0.size / 2) - 1;
      if (!includeRedundant && face.ordinal >= 3 && halfOfEvenCube) {
        continue;
      }
      for (dir = 1; dir <= 3; ++dir) {
        move = new CubePuzzle$CubeMove_1(this$static.this$0, face, dir, innerSlice);
        moveStr = $toString_6(move);
        if (moveStr == null) {
          continue;
        }
        imageCopy = $cloneImage(this$static.image);
        for (slice = 0; slice <= innerSlice; ++slice) {
          slice_0(face, slice, dir, imageCopy);
        }
        $put_0(successors, moveStr, new CubePuzzle$CubeState_1(this$static.this$0, imageCopy));
      }
    }
  }
  return successors;
}

function $toFaceCube(this$static){
  var f, f$array, f$index, f$max, face, faceArr, i_0, j, state;
  azzert_1(this$static.this$0.size == 3);
  state = '';
  for (f$array = $toCharArray('URFDLB') , f$index = 0 , f$max = f$array.length; f$index < f$max; ++f$index) {
    f = f$array[f$index];
    face = ($clinit_CubePuzzle$Face() , dynamicCast(valueOf(($clinit_CubePuzzle$Face$Map() , $MAP), '' + String.fromCharCode(f)), Q$CubePuzzle$Face));
    faceArr = this$static.image[face.ordinal];
    for (i_0 = 0; i_0 < faceArr.length; ++i_0) {
      for (j = 0; j < faceArr[i_0].length; ++j) {
        state += $VALUES_2[faceArr[i_0][j]].name_0;
      }
    }
  }
  return state;
}

function $toTwoByTwoState(this$static){
  var bColor, clockwiseTurnsToGetToPrimaryColor, colorToVal, dColor, fColor, i_0, lColor, piece, pieceVal, pieces, rColor, state, stickers, stickersByPiece, uColor;
  state = new TwoByTwoSolver$TwoByTwoState_0;
  stickersByPiece = getStickersByPiece(this$static.image);
  dColor = stickersByPiece[7][0];
  bColor = stickersByPiece[7][1];
  lColor = stickersByPiece[7][2];
  uColor = $oppositeFace(($clinit_CubePuzzle$Face() , $clinit_CubePuzzle$Face() , $VALUES_2)[dColor]).ordinal;
  fColor = $oppositeFace($VALUES_2[bColor]).ordinal;
  rColor = $oppositeFace($VALUES_2[lColor]).ordinal;
  colorToVal = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 8, 1);
  colorToVal[uColor] = 0;
  colorToVal[fColor] = 0;
  colorToVal[rColor] = 0;
  colorToVal[lColor] = 1;
  colorToVal[bColor] = 2;
  colorToVal[dColor] = 4;
  pieces = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 7, 1);
  for (i_0 = 0; i_0 < pieces.length; ++i_0) {
    stickers = stickersByPiece[i_0];
    pieceVal = colorToVal[stickers[0]] + colorToVal[stickers[1]] + colorToVal[stickers[2]];
    clockwiseTurnsToGetToPrimaryColor = 0;
    while (stickers[clockwiseTurnsToGetToPrimaryColor] != uColor && stickers[clockwiseTurnsToGetToPrimaryColor] != dColor) {
      ++clockwiseTurnsToGetToPrimaryColor;
      azzert_1(clockwiseTurnsToGetToPrimaryColor < 3);
    }
    piece = (clockwiseTurnsToGetToPrimaryColor << 3) + pieceVal;
    pieces[i_0] = piece;
  }
  state.permutation = packPerm(pieces);
  state.orientation = packOrient(pieces);
  return state;
}

function CubePuzzle$CubeState_0(this$0){
  var face, j, k_0;
  this.this$0 = this$0;
  this.this$0_0 = this$0;
  this.image = initDims([_3_3_3I_classLit, _3_3I_classLit, _3I_classLit], [makeCastMap([Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$2, Q$int_$1, -1], [6, this$0.size, this$0.size], 3, 1);
  for (face = 0; face < this.image.length; ++face) {
    for (j = 0; j < this$0.size; ++j) {
      for (k_0 = 0; k_0 < this$0.size; ++k_0) {
        this.image[face][j][k_0] = face;
      }
    }
  }
  this.normalizedState = this;
}

function CubePuzzle$CubeState_1(this$0, image){
  this.this$0 = this$0;
  this.this$0_0 = this$0;
  this.image = image;
}

defineSeed(314, 277, makeCastMap([Q$Puzzle$PuzzleState, Q$CubePuzzle$CubeState]), CubePuzzle$CubeState_0, CubePuzzle$CubeState_1);
_.drawScramble = function drawScramble_0(colorScheme){
  var svg;
  svg = new Svg_0(getImageSize(this.this$0.size));
  $drawCube(this.this$0, svg, this.image, colorScheme);
  return svg;
}
;
_.equals$ = function equals_29(other){
  return deepEquals(this.image, dynamicCast(other, Q$CubePuzzle$CubeState).image);
}
;
_.getCanonicalMovesByState = function getCanonicalMovesByState_0(){
  return reverseHashMap($getSuccessorsWithinSlice(this, ~~(this.this$0.size / 2) - 1, false));
}
;
_.getNormalized = function getNormalized_0(){
  return $getNormalized(this);
}
;
_.getScrambleSuccessors = function getScrambleSuccessors_0(){
  return $getSuccessorsWithinSlice(this, ~~(this.this$0.size / 2) - 1, false);
}
;
_.getSuccessorsByName = function getSuccessorsByName_0(){
  return $getSuccessorsWithinSlice(this, this.this$0.size - 1, true);
}
;
_.hashCode$ = function hashCode_30(){
  return deepHashCode(this.image);
}
;
_.isNormalized = function isNormalized_0(){
  return $isNormalized(this.this$0, this.image);
}
;
_.image = null;
_.normalizedState = null;
_.this$0 = null;
function $clinit_CubePuzzle$Face(){
  $clinit_CubePuzzle$Face = nullMethod;
  R = new CubePuzzle$Face_0('R', 0);
  U = new CubePuzzle$Face_0('U', 1);
  F = new CubePuzzle$Face_0('F', 2);
  L = new CubePuzzle$Face_0('L', 3);
  D = new CubePuzzle$Face_0('D', 4);
  B = new CubePuzzle$Face_0('B', 5);
  $VALUES_2 = initValues(_3Lpuzzle_CubePuzzle$Face_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$CubePuzzle$Face, [R, U, F, L, D, B]);
}

function $oppositeFace(this$static){
  return $VALUES_2[(this$static.ordinal + 3) % 6];
}

function CubePuzzle$Face_0(enum$name, enum$ordinal){
  Enum_0.call(this, enum$name, enum$ordinal);
}

function values_3(){
  $clinit_CubePuzzle$Face();
  return $VALUES_2;
}

defineSeed(315, 46, makeCastMap([Q$Serializable, Q$Comparable, Q$Enum, Q$CubePuzzle$Face]), CubePuzzle$Face_0);
var $VALUES_2, B, D, F, L, R, U;
function $clinit_CubePuzzle$Face$Map(){
  $clinit_CubePuzzle$Face$Map = nullMethod;
  $MAP = createValueOfMap(($clinit_CubePuzzle$Face() , $VALUES_2));
}

var $MAP;
function $export_2(this$static){
  if (!exported_2) {
    exported_2 = true;
    $clinit_ExporterUtil();
    $addExporter(impl_4, Lpuzzle_CubePuzzle_2_classLit, this$static);
    $export0_2(this$static);
  }
}

function $export0_2(this$static){
  var pkg = declarePackage('puzzle.CubePuzzle');
  var __0, __ = this$static;
  $wnd.puzzle.CubePuzzle = $entry(function(){
    var g, j = this, a = arguments;
    a.length == 1 && __.isAssignable(a[0])?(g = a[0]):a.length == 1 && (g = new CubePuzzle_0(a[0]));
    j.g = g;
    setWrapper(g, j);
    return j;
  }
  );
  __0 = $wnd.puzzle.CubePuzzle.prototype = new Object;
  __0.generateScramble = $entry(function(){
    return this.g.generateScramble_0();
  }
  );
  __0.generateScrambles = $entry(function(a0){
    return wrap(this.g.generateScrambles_0(a0));
  }
  );
  __0.generateSeededScramble = $entry(function(a0){
    return this.g.generateSeededScramble_0(a0);
  }
  );
  __0.generateSeededScrambles = $entry(function(a0, a1){
    return wrap(this.g.generateSeededScrambles_0(a0, a1));
  }
  );
  __0.getDefaultColorScheme = $entry(function(){
    return this.g.getDefaultColorScheme_0();
  }
  );
  __0.getFaceNames = $entry(function(){
    return wrap(this.g.getFaceNames_0());
  }
  );
  __0.getLongName = $entry(function(){
    return this.g.getLongName_0();
  }
  );
  __0.getPreferredSize = $entry(function(a0, a1){
    return runDispatch(this.g, Lpuzzle_CubePuzzle_2_classLit, 0, arguments, false, false)[0];
  }
  );
  __0.getShortName = $entry(function(){
    return this.g.getShortName_0();
  }
  );
  __0.getSolvedState = $entry(function(){
    return this.g.getSolvedState_1();
  }
  );
  __0.toString = $entry(function(){
    return this.g.toString$();
  }
  );
  registerDispatchMap(Lpuzzle_CubePuzzle_2_classLit, {0:{0:[[function(){
    return this.getPreferredSize_0.apply(this, arguments);
  }
  , null, undefined]], 2:[[function(){
    return this.getPreferredSize_1.apply(this, arguments);
  }
  , null, undefined, 'number', 'number']]}}, false);
  if (pkg)
    for (p in pkg)
      $wnd.puzzle.CubePuzzle[p] === undefined && ($wnd.puzzle.CubePuzzle[p] = pkg[p]);
}

function CubePuzzleExporterImpl_0(){
  $export_2(this);
}

defineSeed(317, 1, {}, CubePuzzleExporterImpl_0);
_.isAssignable = function isAssignable_2(o){
  return o != null && instanceOf(o, Q$CubePuzzle);
}
;
var exported_2 = false;
function $generateRandomMoves_0(this$static, r){
  var ab, e, scramble;
  scramble = $randomState(dynamicCast($get_3(this$static.threePhaseSearcher), Q$Search_0), r);
  ab = new AlgorithmBuilder_0(this$static, 1);
  try {
    $appendAlgorithm(ab, scramble);
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, Q$InvalidMoveException)) {
      e = $e0;
      azzert_3(false, new InvalidScrambleException_0(scramble, e));
    }
     else 
      throw $e0;
  }
  return new PuzzleStateAndGenerator_0((azzert_1(ab.states.size == ab.moves.size + 1) , dynamicCast($get_4(ab.states, ab.states.size - 1), Q$Puzzle$PuzzleState)), join(ab.moves, ' '));
}

function FourByFourCubePuzzle_0(){
  $clinit_CubePuzzle();
  CubePuzzle_0.call(this, 4);
  this.threePhaseSearcher = new FourByFourCubePuzzle$1_0;
}

defineSeed(318, 312, makeCastMap([Q$Puzzle, Q$Exportable, Q$CubePuzzle, Q$FourByFourCubePuzzle]), FourByFourCubePuzzle_0);
_.generateRandomMoves_0 = function generateRandomMoves_1(r){
  return $generateRandomMoves_0(this, r);
}
;
_.getInitializationStatus_0 = function getInitializationStatus(){
  return $clinit_Edge3() , done_0 / prunValues[9];
}
;
_.threePhaseSearcher = null;
function FourByFourCubePuzzle$1_0(){
}

defineSeed(319, 193, {}, FourByFourCubePuzzle$1_0);
_.initialValue = function initialValue_0(){
  return new Search_4;
}
;
function $export_3(this$static){
  if (!exported_3) {
    exported_3 = true;
    $clinit_ExporterUtil();
    $addExporter(impl_4, Lpuzzle_FourByFourCubePuzzle_2_classLit, this$static);
    $export0_3(this$static);
  }
}

function $export0_3(this$static){
  var pkg = declarePackage('puzzle.FourByFourCubePuzzle');
  var __0, __ = this$static;
  $wnd.puzzle.FourByFourCubePuzzle = $entry(function(){
    var g, j = this, a = arguments;
    a.length == 1 && __.isAssignable(a[0])?(g = a[0]):a.length == 0 && (g = new FourByFourCubePuzzle_0);
    j.g = g;
    setWrapper(g, j);
    return j;
  }
  );
  __0 = $wnd.puzzle.FourByFourCubePuzzle.prototype = new Object;
  __0.generateRandomMoves = $entry(function(a0){
    return this.g.generateRandomMoves_0(gwtInstance(a0));
  }
  );
  __0.generateScramble = $entry(function(){
    return this.g.generateScramble_0();
  }
  );
  __0.generateScrambles = $entry(function(a0){
    return wrap(this.g.generateScrambles_0(a0));
  }
  );
  __0.generateSeededScramble = $entry(function(a0){
    return this.g.generateSeededScramble_0(a0);
  }
  );
  __0.generateSeededScrambles = $entry(function(a0, a1){
    return wrap(this.g.generateSeededScrambles_0(a0, a1));
  }
  );
  __0.getDefaultColorScheme = $entry(function(){
    return this.g.getDefaultColorScheme_0();
  }
  );
  __0.getFaceNames = $entry(function(){
    return wrap(this.g.getFaceNames_0());
  }
  );
  __0.getInitializationStatus = $entry(function(){
    return this.g.getInitializationStatus_0();
  }
  );
  __0.getLongName = $entry(function(){
    return this.g.getLongName_0();
  }
  );
  __0.getPreferredSize = $entry(function(a0, a1){
    return runDispatch(this.g, Lpuzzle_FourByFourCubePuzzle_2_classLit, 0, arguments, false, false)[0];
  }
  );
  __0.getShortName = $entry(function(){
    return this.g.getShortName_0();
  }
  );
  __0.getSolvedState = $entry(function(){
    return this.g.getSolvedState_1();
  }
  );
  __0.toString = $entry(function(){
    return this.g.toString$();
  }
  );
  registerDispatchMap(Lpuzzle_FourByFourCubePuzzle_2_classLit, {0:{0:[[function(){
    return this.getPreferredSize_0.apply(this, arguments);
  }
  , null, undefined]], 2:[[function(){
    return this.getPreferredSize_1.apply(this, arguments);
  }
  , null, undefined, 'number', 'number']]}}, false);
  if (pkg)
    for (p in pkg)
      $wnd.puzzle.FourByFourCubePuzzle[p] === undefined && ($wnd.puzzle.FourByFourCubePuzzle[p] = pkg[p]);
}

function FourByFourCubePuzzleExporterImpl_0(){
  $export_3(this);
}

defineSeed(320, 1, {}, FourByFourCubePuzzleExporterImpl_0);
_.isAssignable = function isAssignable_3(o){
  return o != null && instanceOf(o, Q$FourByFourCubePuzzle);
}
;
var exported_3 = false;
function FourByFourRandomTurnsCubePuzzle_0(){
  $clinit_CubePuzzle();
  CubePuzzle_0.call(this, 4);
}

defineSeed(321, 312, makeCastMap([Q$Puzzle, Q$Exportable, Q$CubePuzzle, Q$FourByFourRandomTurnsCubePuzzle]), FourByFourRandomTurnsCubePuzzle_0);
_.getLongName_0 = function getLongName_1(){
  return '4x4x4 (fast, unofficial)';
}
;
_.getShortName_0 = function getShortName_1(){
  return '444fast';
}
;
function $export_4(this$static){
  if (!exported_4) {
    exported_4 = true;
    $clinit_ExporterUtil();
    $addExporter(impl_4, Lpuzzle_FourByFourRandomTurnsCubePuzzle_2_classLit, this$static);
    $export0_4(this$static);
  }
}

function $export0_4(this$static){
  var pkg = declarePackage('puzzle.FourByFourRandomTurnsCubePuzzle');
  var __0, __ = this$static;
  $wnd.puzzle.FourByFourRandomTurnsCubePuzzle = $entry(function(){
    var g, j = this, a = arguments;
    a.length == 1 && __.isAssignable(a[0])?(g = a[0]):a.length == 0 && (g = new FourByFourRandomTurnsCubePuzzle_0);
    j.g = g;
    setWrapper(g, j);
    return j;
  }
  );
  __0 = $wnd.puzzle.FourByFourRandomTurnsCubePuzzle.prototype = new Object;
  __0.generateScramble = $entry(function(){
    return this.g.generateScramble_0();
  }
  );
  __0.generateScrambles = $entry(function(a0){
    return wrap(this.g.generateScrambles_0(a0));
  }
  );
  __0.generateSeededScramble = $entry(function(a0){
    return this.g.generateSeededScramble_0(a0);
  }
  );
  __0.generateSeededScrambles = $entry(function(a0, a1){
    return wrap(this.g.generateSeededScrambles_0(a0, a1));
  }
  );
  __0.getDefaultColorScheme = $entry(function(){
    return this.g.getDefaultColorScheme_0();
  }
  );
  __0.getFaceNames = $entry(function(){
    return wrap(this.g.getFaceNames_0());
  }
  );
  __0.getLongName = $entry(function(){
    return this.g.getLongName_0();
  }
  );
  __0.getPreferredSize = $entry(function(a0, a1){
    return runDispatch(this.g, Lpuzzle_FourByFourRandomTurnsCubePuzzle_2_classLit, 0, arguments, false, false)[0];
  }
  );
  __0.getShortName = $entry(function(){
    return this.g.getShortName_0();
  }
  );
  __0.getSolvedState = $entry(function(){
    return this.g.getSolvedState_1();
  }
  );
  __0.toString = $entry(function(){
    return this.g.toString$();
  }
  );
  registerDispatchMap(Lpuzzle_FourByFourRandomTurnsCubePuzzle_2_classLit, {0:{0:[[function(){
    return this.getPreferredSize_0.apply(this, arguments);
  }
  , null, undefined]], 2:[[function(){
    return this.getPreferredSize_1.apply(this, arguments);
  }
  , null, undefined, 'number', 'number']]}}, false);
  if (pkg)
    for (p in pkg)
      $wnd.puzzle.FourByFourRandomTurnsCubePuzzle[p] === undefined && ($wnd.puzzle.FourByFourRandomTurnsCubePuzzle[p] = pkg[p]);
}

function FourByFourRandomTurnsCubePuzzleExporterImpl_0(){
  $export_4(this);
}

defineSeed(322, 1, {}, FourByFourRandomTurnsCubePuzzleExporterImpl_0);
_.isAssignable = function isAssignable_4(o){
  return o != null && instanceOf(o, Q$FourByFourRandomTurnsCubePuzzle);
}
;
var exported_4 = false;
function $clinit_MegaminxPuzzle(){
  $clinit_MegaminxPuzzle = nullMethod;
  $clinit_Puzzle();
  UNFOLDHEIGHT = 2 + 3 * Math.sin(0.9424777960769379) + Math.sin(0.3141592653589793);
  UNFOLDWIDTH = 4 * Math.cos(0.3141592653589793) + 2 * Math.cos(0.9424777960769379);
}

function $cloneImage_0(image){
  var imageCopy;
  imageCopy = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [image.length, image[0].length], 2, 1);
  deepCopy(image, imageCopy);
  return imageCopy;
}

function $getFaceBoundaries(this$static){
  var faces;
  faces = new HashMap_0;
  faces.put(($clinit_MegaminxPuzzle$Face() , U_0), getPentagon(this$static.leftCenterX, this$static.leftCenterY, true));
  faces.put(BL, getPentagon(this$static.leftCenterX - this$static.c, this$static.leftCenterY - this$static.e, false));
  faces.put(BR, getPentagon(this$static.leftCenterX + this$static.c, this$static.leftCenterY - this$static.e, false));
  faces.put(R_0, getPentagon(this$static.leftCenterX + this$static.b, this$static.leftCenterY + this$static.d, false));
  faces.put(F_0, getPentagon(this$static.leftCenterX, this$static.leftCenterY + this$static.x, false));
  faces.put(L_0, getPentagon(this$static.leftCenterX - this$static.b, this$static.leftCenterY + this$static.d, false));
  faces.put(D_0, getPentagon(this$static.shift + 2 + this$static.a_0 + this$static.b, 2 + this$static.x + 30, false));
  faces.put(DR, getPentagon(this$static.shift + 2 + this$static.a_0 + this$static.b - this$static.c, 2 + this$static.x + this$static.e + 30, true));
  faces.put(DBR, getPentagon(this$static.shift + 2 + this$static.a_0, 2 + this$static.x - this$static.d + 30, true));
  faces.put(B_0, getPentagon(this$static.shift + 2 + this$static.a_0 + this$static.b, 32, true));
  faces.put(DBL, getPentagon(this$static.shift + 2 + this$static.a_0 + 2 * this$static.b, 2 + this$static.x - this$static.d + 30, true));
  faces.put(DL, getPentagon(this$static.shift + 2 + this$static.a_0 + this$static.b + this$static.c, 2 + this$static.x + this$static.e + 30, true));
  return faces;
}

function $isNormalized_0(image){
  return image[($clinit_MegaminxPuzzle$Face() , U_0).ordinal][10] == U_0.ordinal && image[F_0.ordinal][10] == F_0.ordinal;
}

function $normalize_0(this$static, image){
  var chooseF, face, face$array, face$index, face$max;
  if (image[($clinit_MegaminxPuzzle$Face() , U_0).ordinal][10] == U_0.ordinal && image[F_0.ordinal][10] == F_0.ordinal) {
    return image;
  }
  image = $cloneImage_0(image);
  for (face$array = $VALUES_3 , face$index = 0 , face$max = face$array.length; face$index < face$max; ++face$index) {
    face = face$array[face$index];
    if (image[face.ordinal][10] == U_0.ordinal) {
      $spinToTop(this$static, image, face);
      azzert_1(image[U_0.ordinal][10] == U_0.ordinal);
      for (chooseF = 0; chooseF < 5; ++chooseF) {
        $spinMinx(image, U_0, 1);
        if (image[U_0.ordinal][10] == U_0.ordinal && image[F_0.ordinal][10] == F_0.ordinal) {
          return image;
        }
      }
      azzert_1(false);
    }
  }
  azzert_1(false);
  return null;
}

function $spinMinx(image, face, dir){
  turn_1(image, face, dir);
  bigTurn_0(image, $oppositeFace_0(face), 5 - dir);
}

function $spinToTop(this$static, image, face){
  switch (face.ordinal) {
    case 0:
      break;
    case 1:
      $spinMinx(image, ($clinit_MegaminxPuzzle$Face() , L_0), 1);
      break;
    case 2:
      $spinMinx(image, ($clinit_MegaminxPuzzle$Face() , U_0), 1);
      $spinToTop(this$static, image, R_0);
      break;
    case 3:
      $spinMinx(image, ($clinit_MegaminxPuzzle$Face() , U_0), 1);
      $spinToTop(this$static, image, F_0);
      break;
    case 4:
      $spinMinx(image, ($clinit_MegaminxPuzzle$Face() , L_0), -1);
      break;
    case 5:
      $spinMinx(image, ($clinit_MegaminxPuzzle$Face() , U_0), 1);
      $spinToTop(this$static, image, BL);
      break;
    case 6:
      $spinMinx(image, ($clinit_MegaminxPuzzle$Face() , L_0), -2);
      $spinToTop(this$static, image, R_0);
      break;
    case 7:
      $spinMinx(image, ($clinit_MegaminxPuzzle$Face() , L_0), -1);
      $spinToTop(this$static, image, R_0);
      break;
    case 8:
      $spinMinx(image, ($clinit_MegaminxPuzzle$Face() , U_0), 1);
      $spinMinx(image, L_0, -1);
      $spinToTop(this$static, image, R_0);
      break;
    case 9:
      $spinMinx(image, ($clinit_MegaminxPuzzle$Face() , L_0), -3);
      $spinToTop(this$static, image, R_0);
      break;
    case 10:
      $spinMinx(image, ($clinit_MegaminxPuzzle$Face() , L_0), 2);
      break;
    case 11:
      $spinMinx(image, ($clinit_MegaminxPuzzle$Face() , L_0), -2);
      break;
    default:azzert_1(false);
  }
}

function MegaminxPuzzle_0(){
  $clinit_MegaminxPuzzle();
  Puzzle_0.call(this);
  this.x = 30 * sqrt(2 * (1 - Math.cos(1.8849555921538759)));
  this.a_0 = 30 * Math.cos(0.3141592653589793);
  this.b = this.x * Math.cos(0.3141592653589793);
  this.c = this.x * Math.cos(0.9424777960769379);
  this.d = this.x * Math.sin(0.3141592653589793);
  this.e = this.x * Math.sin(0.9424777960769379);
  this.leftCenterX = 2 + this.a_0 + this.b + this.d / 2;
  this.leftCenterY = 2 + this.x + 30 - this.d;
  this.f = Math.cos(0.3141592653589793);
  this.gg = Math.cos(0.6283185307179586);
  this.magicShiftNumber = this.d * 0.6 + 30 * (this.f + this.gg);
  this.shift = this.leftCenterX + this.magicShiftNumber;
}

function bigTurn(image, f){
  var i_0;
  if (f == ($clinit_MegaminxPuzzle$Face() , DBR)) {
    for (i_0 = 0; i_0 < 7; ++i_0) {
      swap_2(image, 0, (1 + i_0) % 10, 4, (3 + i_0) % 10, 11, (1 + i_0) % 10, 10, (1 + i_0) % 10, 1, (1 + i_0) % 10);
    }
    swap_2(image, 0, 10, 4, 10, 11, 10, 10, 10, 1, 10);
    swapWholeFace(image, 2, 3, 0, 7, 0, 6, 8, 9, 8);
    rotateFace(image, DBR);
  }
   else {
    azzert_1(f == D_0);
    for (i_0 = 0; i_0 < 7; ++i_0) {
      swap_2(image, 1, (9 + i_0) % 10, 2, (1 + i_0) % 10, 3, (3 + i_0) % 10, 4, (5 + i_0) % 10, 5, (7 + i_0) % 10);
    }
    swap_2(image, 1, 10, 2, 10, 3, 10, 4, 10, 5, 10);
    swapWholeFace(image, 11, 10, 8, 9, 6, 8, 4, 7, 2);
    rotateFace(image, D_0);
  }
}

function bigTurn_0(image, side, dir){
  $clinit_MegaminxPuzzle();
  var i_0;
  dir = modulo(dir, 5);
  for (i_0 = 0; i_0 < dir; ++i_0) {
    bigTurn(image, side);
  }
}

function getPentagon(x, y, up){
  var p_0;
  p_0 = pentagon(up);
  $translate(p_0, x, y);
  return p_0;
}

function pentagon(pointup){
  var angs, ch, i_0, p_0, x, y;
  angs = initValues(_3D_classLit, makeCastMap([Q$double_$1, Q$Serializable]), -1, [1.3, 1.7, 0.1, 0.5, 0.9]);
  for (i_0 = 0; i_0 < angs.length; ++i_0) {
    pointup && (angs[i_0] -= 0.2);
    angs[i_0] *= 3.141592653589793;
  }
  x = initDim(_3D_classLit, makeCastMap([Q$double_$1, Q$Serializable]), -1, angs.length, 1);
  y = initDim(_3D_classLit, makeCastMap([Q$double_$1, Q$Serializable]), -1, angs.length, 1);
  for (i_0 = 0; i_0 < x.length; ++i_0) {
    x[i_0] = 30 * Math.cos(angs[i_0]);
    y[i_0] = 30 * Math.sin(angs[i_0]);
  }
  p_0 = new Path_0;
  $moveTo(p_0, x[0], y[0]);
  for (ch = 1; ch < x.length; ++ch) {
    $lineTo(p_0, x[ch], y[ch]);
  }
  $lineTo(p_0, x[0], y[0]);
  azzert_0(!!p_0.commands);
  $add_0(p_0.commands, new Path$Command_0(4, null));
  return p_0;
}

function rotateFace(image, f){
  swapOnFace(image, f, 0, 8, 6, 4, 2);
  swapOnFace(image, f, 1, 9, 7, 5, 3);
}

function swap_2(image, f1, s1, f2, s2, f3, s3, f4, s4, f5, s5){
  var temp;
  temp = image[f1][s1];
  image[f1][s1] = image[f2][s2];
  image[f2][s2] = image[f3][s3];
  image[f3][s3] = image[f4][s4];
  image[f4][s4] = image[f5][s5];
  image[f5][s5] = temp;
}

function swapOnFace(image, face, s1, s2, s3, s4, s5){
  var f, temp;
  f = face.ordinal;
  temp = image[f][s1];
  image[f][s1] = image[f][s2];
  image[f][s2] = image[f][s3];
  image[f][s3] = image[f][s4];
  image[f][s4] = image[f][s5];
  image[f][s5] = temp;
}

function swapOnSide(image, b, f1, s1, f2, s2, f3, s3, f4, s4, f5, s5){
  var i_0, temp;
  for (i_0 = 0; i_0 < 3; ++i_0) {
    temp = image[(f1 + b) % 12][(s1 + i_0) % 10];
    image[(f1 + b) % 12][(s1 + i_0) % 10] = image[(f2 + b) % 12][(s2 + i_0) % 10];
    image[(f2 + b) % 12][(s2 + i_0) % 10] = image[(f3 + b) % 12][(s3 + i_0) % 10];
    image[(f3 + b) % 12][(s3 + i_0) % 10] = image[(f4 + b) % 12][(s4 + i_0) % 10];
    image[(f4 + b) % 12][(s4 + i_0) % 10] = image[(f5 + b) % 12][(s5 + i_0) % 10];
    image[(f5 + b) % 12][(s5 + i_0) % 10] = temp;
  }
}

function swapWholeFace(image, f1, f2, s2, f3, s3, f4, s4, f5, s5){
  var i_0, temp;
  for (i_0 = 0; i_0 < 10; ++i_0) {
    temp = image[f1 % 12][i_0 % 10];
    image[f1 % 12][i_0 % 10] = image[f2 % 12][(s2 + i_0) % 10];
    image[f2 % 12][(s2 + i_0) % 10] = image[f3 % 12][(s3 + i_0) % 10];
    image[f3 % 12][(s3 + i_0) % 10] = image[f4 % 12][(s4 + i_0) % 10];
    image[f4 % 12][(s4 + i_0) % 10] = image[f5 % 12][(s5 + i_0) % 10];
    image[f5 % 12][(s5 + i_0) % 10] = temp;
  }
  swap_2(image, f1, 10, f2, 10, f3, 10, f4, 10, f5, 10);
}

function turn_0(image, face){
  var b, s;
  s = face.ordinal;
  b = s >= 6?6:0;
  switch (s % 6) {
    case 0:
      swapOnSide(image, b, 1, 6, 5, 4, 4, 2, 3, 0, 2, 8);
      break;
    case 1:
      swapOnSide(image, b, 0, 0, 2, 0, 9, 6, 10, 6, 5, 2);
      break;
    case 2:
      swapOnSide(image, b, 0, 2, 3, 2, 8, 4, 9, 4, 1, 4);
      break;
    case 3:
      swapOnSide(image, b, 0, 4, 4, 4, 7, 2, 8, 2, 2, 6);
      break;
    case 4:
      swapOnSide(image, b, 0, 6, 5, 6, 11, 0, 7, 0, 3, 8);
      break;
    case 5:
      swapOnSide(image, b, 0, 8, 1, 8, 10, 8, 11, 8, 4, 0);
      break;
    default:azzert_1(false);
  }
  swapOnFace(image, face, 0, 8, 6, 4, 2);
  swapOnFace(image, face, 1, 9, 7, 5, 3);
}

function turn_1(image, side, dir){
  $clinit_MegaminxPuzzle();
  var i_0;
  dir = modulo(dir, 5);
  for (i_0 = 0; i_0 < dir; ++i_0) {
    turn_0(image, side);
  }
}

defineSeed(323, 275, makeCastMap([Q$Puzzle, Q$Exportable, Q$MegaminxPuzzle]), MegaminxPuzzle_0);
_.generateRandomMoves_0 = function generateRandomMoves_2(r){
  var dir, e, i_0, j, scramble, scrambleStr, side, state;
  scramble = new StringBuilder_0;
  for (i_0 = 0; i_0 < 7; ++i_0) {
    i_0 > 0 && (scramble.impl.append_2(scramble.data, '\n') , scramble);
    dir = 0;
    for (j = 0; j < 10; ++j) {
      j > 0 && (scramble.impl.append_2(scramble.data, ' ') , scramble);
      side = j % 2 == 0?82:68;
      dir = $nextInt(r, 2);
      scramble.impl.append_2(scramble.data, String.fromCharCode(side) + (dir == 0?'++':'--'));
    }
    scramble.impl.append_2(scramble.data, ' U');
    dir != 0 && (scramble.impl.append_2(scramble.data, "'") , scramble);
  }
  scrambleStr = scramble.impl.toString_0(scramble.data);
  state = new MegaminxPuzzle$MegaminxState_0(this);
  try {
    state = $applyAlgorithm(state, scrambleStr);
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, Q$InvalidScrambleException)) {
      e = $e0;
      azzert_3(false, e);
      return null;
    }
     else 
      throw $e0;
  }
  return new PuzzleStateAndGenerator_0(state, scrambleStr);
}
;
_.getDefaultColorScheme_0 = function getDefaultColorScheme_1(){
  var colors;
  colors = new HashMap_0;
  colors.put('U', new Color_0(16777215));
  colors.put('BL', new Color_0(16763904));
  colors.put('BR', new Color_0(179));
  colors.put('R', new Color_0(14483456));
  colors.put('F', new Color_0(26112));
  colors.put('L', new Color_0(9050879));
  colors.put('D', new Color_0(10066329));
  colors.put('DR', new Color_0(16777139));
  colors.put('DBR', new Color_0(16751103));
  colors.put('B', new Color_0(7464448));
  colors.put('DBL', new Color_0(16745523));
  colors.put('DL', new Color_0(8969727));
  return colors;
}
;
_.getFaceBoundaries_0 = function getFaceBoundaries(){
  return $getFaceBoundaries(this);
}
;
_.getLongName_0 = function getLongName_2(){
  return 'Megaminx';
}
;
_.getPreferredSize_0 = function getPreferredSize_2(){
  return new Dimension_0(round_int(UNFOLDWIDTH * 2 * 30 + 6), round_int(UNFOLDHEIGHT * 30 + 4));
}
;
_.getRandomMoveCount = function getRandomMoveCount_1(){
  return 77;
}
;
_.getShortName_0 = function getShortName_2(){
  return 'minx';
}
;
_.getSolvedState_0 = function getSolvedState_2(){
  return new MegaminxPuzzle$MegaminxState_0(this);
}
;
var UNFOLDHEIGHT, UNFOLDWIDTH;
function $clinit_MegaminxPuzzle$Face(){
  $clinit_MegaminxPuzzle$Face = nullMethod;
  U_0 = new MegaminxPuzzle$Face_0('U', 0);
  BL = new MegaminxPuzzle$Face_0('BL', 1);
  BR = new MegaminxPuzzle$Face_0('BR', 2);
  R_0 = new MegaminxPuzzle$Face_0('R', 3);
  F_0 = new MegaminxPuzzle$Face_0('F', 4);
  L_0 = new MegaminxPuzzle$Face_0('L', 5);
  D_0 = new MegaminxPuzzle$Face_0('D', 6);
  DR = new MegaminxPuzzle$Face_0('DR', 7);
  DBR = new MegaminxPuzzle$Face_0('DBR', 8);
  B_0 = new MegaminxPuzzle$Face_0('B', 9);
  DBL = new MegaminxPuzzle$Face_0('DBL', 10);
  DL = new MegaminxPuzzle$Face_0('DL', 11);
  $VALUES_3 = initValues(_3Lpuzzle_MegaminxPuzzle$Face_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$MegaminxPuzzle$Face, [U_0, BL, BR, R_0, F_0, L_0, D_0, DR, DBR, B_0, DBL, DL]);
}

function $oppositeFace_0(this$static){
  switch (this$static.ordinal) {
    case 0:
      return D_0;
    case 1:
      return DR;
    case 2:
      return DL;
    case 3:
      return DBL;
    case 4:
      return B_0;
    case 5:
      return DBR;
    case 6:
      return U_0;
    case 7:
      return BL;
    case 8:
      return L_0;
    case 9:
      return F_0;
    case 10:
      return R_0;
    case 11:
      return BR;
    default:azzert_1(false);
      return null;
  }
}

function MegaminxPuzzle$Face_0(enum$name, enum$ordinal){
  Enum_0.call(this, enum$name, enum$ordinal);
}

function values_4(){
  $clinit_MegaminxPuzzle$Face();
  return $VALUES_3;
}

defineSeed(324, 46, makeCastMap([Q$Serializable, Q$Comparable, Q$Enum, Q$MegaminxPuzzle$Face]), MegaminxPuzzle$Face_0);
var $VALUES_3, B_0, BL, BR, D_0, DBL, DBR, DL, DR, F_0, L_0, R_0, U_0;
function $drawMinx(this$static, g, colorScheme){
  var f, face, face$iterator, label, pentagons, rotateCounterClockwise;
  pentagons = $getFaceBoundaries(this$static.this$0);
  for (face$iterator = $iterator($keySet(pentagons)); face$iterator.val$outerIter.hasNext();) {
    face = dynamicCast($next_0(face$iterator), Q$MegaminxPuzzle$Face);
    f = face.ordinal;
    if (face == ($clinit_MegaminxPuzzle$Face() , U_0)) {
      rotateCounterClockwise = 0;
    }
     else if (f >= 1 && f <= 5) {
      rotateCounterClockwise = 1;
    }
     else if (f >= 6 && f <= 11) {
      rotateCounterClockwise = 2;
    }
     else {
      azzert_1(false);
      return;
    }
    label = null;
    (face == U_0 || face == F_0) && (label = face.name_0);
    $drawPentagon(g, dynamicCast(pentagons.get(face), Q$Path), this$static.image[f], rotateCounterClockwise, label, colorScheme);
  }
}

function $drawPentagon(g, p_0, state, rotateCounterClockwise, label, colorScheme){
  var centerX, centerY, ch, coords, i_0, intpent, iter, j, labelText, ps, pt, pt$index, pt$max, type, xpoints, xs, ypoints, ys;
  xpoints = initDim(_3D_classLit, makeCastMap([Q$double_$1, Q$Serializable]), -1, 5, 1);
  ypoints = initDim(_3D_classLit, makeCastMap([Q$double_$1, Q$Serializable]), -1, 5, 1);
  iter = new PathIterator_0(p_0);
  for (ch = 0; ch < 5; ++ch) {
    coords = initDim(_3D_classLit, makeCastMap([Q$double_$1, Q$Serializable]), -1, 6, 1);
    type = $currentSegment(iter, coords);
    if (type == 0 || type == 1) {
      xpoints[ch] = coords[0];
      ypoints[ch] = coords[1];
    }
    ++iter.index_0;
  }
  xs = initDim(_3D_classLit, makeCastMap([Q$double_$1, Q$Serializable]), -1, 10, 1);
  ys = initDim(_3D_classLit, makeCastMap([Q$double_$1, Q$Serializable]), -1, 10, 1);
  for (i_0 = 0; i_0 < 5; ++i_0) {
    xs[i_0] = 0.4 * xpoints[(i_0 + 1) % 5] + 0.6 * xpoints[i_0];
    ys[i_0] = 0.4 * ypoints[(i_0 + 1) % 5] + 0.6 * ypoints[i_0];
    xs[i_0 + 5] = 0.6 * xpoints[(i_0 + 1) % 5] + 0.4 * xpoints[i_0];
    ys[i_0 + 5] = 0.6 * ypoints[(i_0 + 1) % 5] + 0.4 * ypoints[i_0];
  }
  ps = initDim(_3Lnet_gnehzr_tnoodle_svglite_Path_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$Path, 11, 0);
  for (i_0 = 0; i_0 < ps.length; ++i_0) {
    ps[i_0] = new Path_0;
  }
  intpent = initDim(_3Lnet_gnehzr_tnoodle_svglite_Point2D$Double_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$Point2D$Double, 5, 0);
  for (i_0 = 0; i_0 < intpent.length; ++i_0) {
    intpent[i_0] = ($clinit_MegaminxPuzzle() , new Point2D$Double_0(((xs[i_0] * ys[5 + (3 + i_0) % 5] - ys[i_0] * xs[5 + (3 + i_0) % 5]) * (xs[(i_0 + 1) % 5] - xs[5 + (4 + i_0) % 5]) - (xs[i_0] - xs[5 + (3 + i_0) % 5]) * (xs[(i_0 + 1) % 5] * ys[5 + (4 + i_0) % 5] - ys[(i_0 + 1) % 5] * xs[5 + (4 + i_0) % 5])) / ((xs[i_0] - xs[5 + (3 + i_0) % 5]) * (ys[(i_0 + 1) % 5] - ys[5 + (4 + i_0) % 5]) - (ys[i_0] - ys[5 + (3 + i_0) % 5]) * (xs[(i_0 + 1) % 5] - xs[5 + (4 + i_0) % 5])), ((xs[i_0] * ys[5 + (3 + i_0) % 5] - ys[i_0] * xs[5 + (3 + i_0) % 5]) * (ys[(i_0 + 1) % 5] - ys[5 + (4 + i_0) % 5]) - (ys[i_0] - ys[5 + (3 + i_0) % 5]) * (xs[(i_0 + 1) % 5] * ys[5 + (4 + i_0) % 5] - ys[(i_0 + 1) % 5] * xs[5 + (4 + i_0) % 5])) / ((xs[i_0] - xs[5 + (3 + i_0) % 5]) * (ys[(i_0 + 1) % 5] - ys[5 + (4 + i_0) % 5]) - (ys[i_0] - ys[5 + (3 + i_0) % 5]) * (xs[(i_0 + 1) % 5] - xs[5 + (4 + i_0) % 5]))));
    i_0 == 0?$moveTo(ps[10], intpent[0].x, intpent[0].y):$lineTo(ps[10], intpent[i_0].x, intpent[i_0].y);
  }
  $closePath(ps[10]);
  for (i_0 = 0; i_0 < 5; ++i_0) {
    $moveTo(ps[2 * i_0], xpoints[i_0], ypoints[i_0]);
    $lineTo(ps[2 * i_0], xs[i_0], ys[i_0]);
    $lineTo(ps[2 * i_0], intpent[i_0].x, intpent[i_0].y);
    $lineTo(ps[2 * i_0], xs[5 + (4 + i_0) % 5], ys[5 + (4 + i_0) % 5]);
    $closePath(ps[2 * i_0]);
    $moveTo(ps[2 * i_0 + 1], xs[i_0], ys[i_0]);
    $lineTo(ps[2 * i_0 + 1], xs[i_0 + 5], ys[i_0 + 5]);
    $lineTo(ps[2 * i_0 + 1], intpent[(i_0 + 1) % 5].x, intpent[(i_0 + 1) % 5].y);
    $lineTo(ps[2 * i_0 + 1], intpent[i_0].x, intpent[i_0].y);
    $closePath(ps[2 * i_0 + 1]);
  }
  for (i_0 = 0; i_0 < ps.length; ++i_0) {
    j = i_0;
    i_0 < 10 && (j = (i_0 + 2 * rotateCounterClockwise) % 10);
    $setStroke_0(ps[i_0], ($clinit_Color() , BLACK));
    $setFill(ps[i_0], dynamicCast(colorScheme.get('' + ($clinit_MegaminxPuzzle$Face() , $clinit_MegaminxPuzzle$Face() , $VALUES_3)[state[j]]), Q$Color));
    $add_0(g.children, ps[i_0]);
  }
  if (label != null) {
    centerX = 0;
    centerY = 0;
    for (pt$index = 0 , pt$max = intpent.length; pt$index < pt$max; ++pt$index) {
      pt = intpent[pt$index];
      centerX += pt.x;
      centerY += pt.y;
    }
    centerX /= intpent.length;
    centerY /= intpent.length;
    labelText = new Text_1(label, centerX, centerY);
    azzert('text-anchor' != 'style');
    labelText.attributes.put('text-anchor', 'middle');
    azzert('dy' != 'style');
    labelText.attributes.put('dy', '0.7ex');
    $add_0(g.children, labelText);
  }
}

function $getSuccessorsByName(this$static){
  var dir, face, face$array, face$index, face$max, imageCopy, move, pochmannFaceName, pochmannFaceName$iterator, pochmannFaceNames, prettyDir, prettyPochmannDir, successors;
  successors = new LinkedHashMap_0;
  prettyDir = initValues(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, [null, '', '2', "2'", "'"]);
  for (face$array = ($clinit_MegaminxPuzzle$Face() , $clinit_MegaminxPuzzle$Face() , $VALUES_3) , face$index = 0 , face$max = face$array.length; face$index < face$max; ++face$index) {
    face = face$array[face$index];
    for (dir = 1; dir <= 4; ++dir) {
      move = face.name_0;
      move += prettyDir[dir];
      imageCopy = $cloneImage_0(this$static.image);
      turn_1(imageCopy, face, dir);
      $put_0(successors, move, new MegaminxPuzzle$MegaminxState_1(this$static.this$0, imageCopy));
    }
  }
  pochmannFaceNames = new HashMap_0;
  pochmannFaceNames.put('R', DBR);
  pochmannFaceNames.put('D', D_0);
  prettyPochmannDir = initValues(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, [null, '+', '++', '--', '-']);
  for (pochmannFaceName$iterator = $iterator($keySet(pochmannFaceNames)); pochmannFaceName$iterator.val$outerIter.hasNext();) {
    pochmannFaceName = dynamicCast($next_0(pochmannFaceName$iterator), Q$String);
    for (dir = 1; dir < 5; ++dir) {
      move = pochmannFaceName + prettyPochmannDir[dir];
      imageCopy = $cloneImage_0(this$static.image);
      bigTurn_0(imageCopy, dynamicCast(pochmannFaceNames.get(pochmannFaceName), Q$MegaminxPuzzle$Face), dir);
      $put_0(successors, move, new MegaminxPuzzle$MegaminxState_1(this$static.this$0, imageCopy));
    }
  }
  return successors;
}

function MegaminxPuzzle$MegaminxState_0(this$0){
  var i_0, j;
  this.this$0 = this$0;
  this.this$0_0 = this$0;
  this.image = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [12, 11], 2, 1);
  for (i_0 = 0; i_0 < this.image.length; ++i_0) {
    for (j = 0; j < this.image[0].length; ++j) {
      this.image[i_0][j] = i_0;
    }
  }
  this.normalizedState = this;
}

function MegaminxPuzzle$MegaminxState_1(this$0, image){
  this.this$0 = this$0;
  this.this$0_0 = this$0;
  this.image = image;
}

defineSeed(325, 277, makeCastMap([Q$Puzzle$PuzzleState, Q$MegaminxPuzzle$MegaminxState]), MegaminxPuzzle$MegaminxState_0, MegaminxPuzzle$MegaminxState_1);
_.drawScramble = function drawScramble_1(colorScheme){
  var svg;
  svg = new Svg_0(new Dimension_0(($clinit_MegaminxPuzzle() , round_int(UNFOLDWIDTH * 2 * 30 + 6)), round_int(UNFOLDHEIGHT * 30 + 4)));
  $drawMinx(this, svg, colorScheme);
  return svg;
}
;
_.equals$ = function equals_30(other){
  var o;
  o = dynamicCast(other, Q$MegaminxPuzzle$MegaminxState);
  return deepEquals(this.image, o.image);
}
;
_.getNormalized = function getNormalized_1(){
  if (!this.normalizedState) {
    $normalize_0(this.this$0, this.image);
    this.normalizedState = new MegaminxPuzzle$MegaminxState_1(this.this$0, $normalize_0(this.this$0, this.image));
  }
  return this.normalizedState;
}
;
_.getScrambleSuccessors = function getScrambleSuccessors_1(){
  var scrambleSuccessors, successors, turn, turn$array, turn$index, turn$max;
  successors = $getSuccessorsByName(this);
  scrambleSuccessors = new HashMap_0;
  for (turn$array = initValues(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, ['R++', 'R--', 'D++', 'D--', 'U', 'U2', "U2'", "U'"]) , turn$index = 0 , turn$max = turn$array.length; turn$index < turn$max; ++turn$index) {
    turn = turn$array[turn$index];
    scrambleSuccessors.put(turn, dynamicCast($get_5(successors, turn), Q$MegaminxPuzzle$MegaminxState));
  }
  return scrambleSuccessors;
}
;
_.getSuccessorsByName = function getSuccessorsByName_1(){
  return $getSuccessorsByName(this);
}
;
_.hashCode$ = function hashCode_31(){
  return deepHashCode(this.image);
}
;
_.isNormalized = function isNormalized_1(){
  return $isNormalized_0(this.image);
}
;
_.image = null;
_.normalizedState = null;
_.this$0 = null;
function $export_5(this$static){
  if (!exported_5) {
    exported_5 = true;
    $clinit_ExporterUtil();
    $addExporter(impl_4, Lpuzzle_MegaminxPuzzle_2_classLit, this$static);
    $export0_5(this$static);
  }
}

function $export0_5(this$static){
  var pkg = declarePackage('puzzle.MegaminxPuzzle');
  var __0, __ = this$static;
  $wnd.puzzle.MegaminxPuzzle = $entry(function(){
    var g, j = this, a = arguments;
    a.length == 1 && __.isAssignable(a[0])?(g = a[0]):a.length == 0 && (g = new MegaminxPuzzle_0);
    j.g = g;
    setWrapper(g, j);
    return j;
  }
  );
  __0 = $wnd.puzzle.MegaminxPuzzle.prototype = new Object;
  __0.generateRandomMoves = $entry(function(a0){
    return this.g.generateRandomMoves_0(gwtInstance(a0));
  }
  );
  __0.generateScramble = $entry(function(){
    return this.g.generateScramble_0();
  }
  );
  __0.generateScrambles = $entry(function(a0){
    return wrap(this.g.generateScrambles_0(a0));
  }
  );
  __0.generateSeededScramble = $entry(function(a0){
    return this.g.generateSeededScramble_0(a0);
  }
  );
  __0.generateSeededScrambles = $entry(function(a0, a1){
    return wrap(this.g.generateSeededScrambles_0(a0, a1));
  }
  );
  __0.getDefaultColorScheme = $entry(function(){
    return this.g.getDefaultColorScheme_0();
  }
  );
  __0.getFaceBoundaries = $entry(function(){
    return this.g.getFaceBoundaries_0();
  }
  );
  __0.getFaceNames = $entry(function(){
    return wrap(this.g.getFaceNames_0());
  }
  );
  __0.getLongName = $entry(function(){
    return this.g.getLongName_0();
  }
  );
  __0.getPreferredSize = $entry(function(a0, a1){
    return runDispatch(this.g, Lpuzzle_MegaminxPuzzle_2_classLit, 0, arguments, false, false)[0];
  }
  );
  __0.getShortName = $entry(function(){
    return this.g.getShortName_0();
  }
  );
  __0.getSolvedState = $entry(function(){
    return this.g.getSolvedState_0();
  }
  );
  __0.toString = $entry(function(){
    return this.g.toString$();
  }
  );
  registerDispatchMap(Lpuzzle_MegaminxPuzzle_2_classLit, {0:{0:[[function(){
    return this.getPreferredSize_0.apply(this, arguments);
  }
  , null, undefined]], 2:[[function(){
    return this.getPreferredSize_1.apply(this, arguments);
  }
  , null, undefined, 'number', 'number']]}}, false);
  if (pkg)
    for (p in pkg)
      $wnd.puzzle.MegaminxPuzzle[p] === undefined && ($wnd.puzzle.MegaminxPuzzle[p] = pkg[p]);
}

function MegaminxPuzzleExporterImpl_0(){
  $export_5(this);
}

defineSeed(326, 1, {}, MegaminxPuzzleExporterImpl_0);
_.isAssignable = function isAssignable_5(o){
  return o != null && instanceOf(o, Q$MegaminxPuzzle);
}
;
var exported_5 = false;
function NoInspectionFiveByFiveCubePuzzle_0(){
  $clinit_CubePuzzle();
  CubePuzzle_0.call(this, 5);
}

function applyOrientation(puzzle, randomOrientation, psag, discardRedundantMoves){
  $clinit_CubePuzzle();
  var ab, cm, cm$index, cm$max, e, firstReorientMove, im;
  if (randomOrientation.length == 0) {
    return psag;
  }
  try {
    ab = new AlgorithmBuilder_0(puzzle, 0);
    $appendAlgorithm(ab, psag.generator);
    firstReorientMove = $toString_6(randomOrientation[0]);
    while ($isRedundant(ab, firstReorientMove)) {
      azzert_1(discardRedundantMoves);
      im = $findBestIndexForMove(ab, firstReorientMove, 1);
      $popMove(ab, im.index_0);
    }
    for (cm$index = 0 , cm$max = randomOrientation.length; cm$index < cm$max; ++cm$index) {
      cm = randomOrientation[cm$index];
      $appendMove(ab, $toString_6(cm));
    }
    psag = new PuzzleStateAndGenerator_0((azzert_1(ab.states.size == ab.moves.size + 1) , dynamicCast($get_4(ab.states, ab.states.size - 1), Q$Puzzle$PuzzleState)), join(ab.moves, ' '));
    return psag;
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, Q$InvalidMoveException)) {
      e = $e0;
      azzert_3(false, e);
      return null;
    }
     else 
      throw $e0;
  }
}

defineSeed(327, 312, makeCastMap([Q$Puzzle, Q$Exportable, Q$CubePuzzle, Q$NoInspectionFiveByFiveCubePuzzle]), NoInspectionFiveByFiveCubePuzzle_0);
_.generateRandomMoves_0 = function generateRandomMoves_3(r){
  var psag, randomOrientation, randomOrientationMoves;
  randomOrientationMoves = $getRandomOrientationMoves(this, ~~(this.size / 2));
  randomOrientation = randomOrientationMoves[$nextInt(r, randomOrientationMoves.length)];
  psag = $generateRandomMoves(this, r);
  psag = applyOrientation(this, randomOrientation, psag, true);
  return psag;
}
;
_.getLongName_0 = function getLongName_3(){
  return '5x5x5 no inspection';
}
;
_.getShortName_0 = function getShortName_3(){
  return '555ni';
}
;
function $export_6(this$static){
  if (!exported_6) {
    exported_6 = true;
    $clinit_ExporterUtil();
    $addExporter(impl_4, Lpuzzle_NoInspectionFiveByFiveCubePuzzle_2_classLit, this$static);
    new CubePuzzleExporterImpl_0;
    $export0_6(this$static);
  }
}

function $export0_6(this$static){
  var pkg = declarePackage('puzzle.NoInspectionFiveByFiveCubePuzzle');
  var __0, __ = this$static;
  $wnd.puzzle.NoInspectionFiveByFiveCubePuzzle = $entry(function(){
    var g, j = this, a = arguments;
    a.length == 1 && __.isAssignable(a[0])?(g = a[0]):a.length == 0 && (g = new NoInspectionFiveByFiveCubePuzzle_0);
    j.g = g;
    setWrapper(g, j);
    return j;
  }
  );
  __0 = $wnd.puzzle.NoInspectionFiveByFiveCubePuzzle.prototype = new Object;
  $wnd.puzzle.NoInspectionFiveByFiveCubePuzzle.applyOrientation = $entry(function(a0, a1, a2, a3){
    return __static_wrapper_applyOrientation(a0.g, a1, gwtInstance(a2), a3);
  }
  );
  __0.generateRandomMoves = $entry(function(a0){
    return this.g.generateRandomMoves_0(gwtInstance(a0));
  }
  );
  __0.generateScramble = $entry(function(){
    return this.g.generateScramble_0();
  }
  );
  __0.generateScrambles = $entry(function(a0){
    return wrap(this.g.generateScrambles_0(a0));
  }
  );
  __0.generateSeededScramble = $entry(function(a0){
    return this.g.generateSeededScramble_0(a0);
  }
  );
  __0.generateSeededScrambles = $entry(function(a0, a1){
    return wrap(this.g.generateSeededScrambles_0(a0, a1));
  }
  );
  __0.getDefaultColorScheme = $entry(function(){
    return this.g.getDefaultColorScheme_0();
  }
  );
  __0.getFaceNames = $entry(function(){
    return wrap(this.g.getFaceNames_0());
  }
  );
  __0.getLongName = $entry(function(){
    return this.g.getLongName_0();
  }
  );
  __0.getPreferredSize = $entry(function(a0, a1){
    return runDispatch(this.g, Lpuzzle_NoInspectionFiveByFiveCubePuzzle_2_classLit, 0, arguments, false, false)[0];
  }
  );
  __0.getShortName = $entry(function(){
    return this.g.getShortName_0();
  }
  );
  __0.getSolvedState = $entry(function(){
    return this.g.getSolvedState_1();
  }
  );
  __0.toString = $entry(function(){
    return this.g.toString$();
  }
  );
  registerDispatchMap(Lpuzzle_NoInspectionFiveByFiveCubePuzzle_2_classLit, {0:{0:[[function(){
    return this.getPreferredSize_0.apply(this, arguments);
  }
  , null, undefined]], 2:[[function(){
    return this.getPreferredSize_1.apply(this, arguments);
  }
  , null, undefined, 'number', 'number']]}}, false);
  if (pkg)
    for (p in pkg)
      $wnd.puzzle.NoInspectionFiveByFiveCubePuzzle[p] === undefined && ($wnd.puzzle.NoInspectionFiveByFiveCubePuzzle[p] = pkg[p]);
}

function NoInspectionFiveByFiveCubePuzzleExporterImpl_0(){
  $export_6(this);
}

function __static_wrapper_applyOrientation(a0, a1, a2, a3){
  return applyOrientation(a0, ($clinit_ExporterUtil() , $toArrObject(a1, initDim(_3Lpuzzle_CubePuzzle$CubeMove_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$CubePuzzle$CubeMove_$1]), Q$CubePuzzle$CubeMove, a1.length, 0))), a2, a3);
}

defineSeed(328, 1, {}, NoInspectionFiveByFiveCubePuzzleExporterImpl_0);
_.isAssignable = function isAssignable_6(o){
  return o != null && instanceOf(o, Q$NoInspectionFiveByFiveCubePuzzle);
}
;
var exported_6 = false;
function NoInspectionFourByFourCubePuzzle_0(){
  $clinit_CubePuzzle();
  FourByFourCubePuzzle_0.call(this);
}

function applyOrientation_0(puzzle, randomOrientation, psag){
  $clinit_CubePuzzle();
  var ab, cm, cm$index, cm$max, e;
  if (randomOrientation.length == 0) {
    return psag;
  }
  try {
    ab = new AlgorithmBuilder_0(puzzle, 0);
    $appendAlgorithm(ab, psag.generator);
    for (cm$index = 0 , cm$max = randomOrientation.length; cm$index < cm$max; ++cm$index) {
      cm = randomOrientation[cm$index];
      $appendMove(ab, $toString_6(cm));
    }
    psag = new PuzzleStateAndGenerator_0((azzert_1(ab.states.size == ab.moves.size + 1) , dynamicCast($get_4(ab.states, ab.states.size - 1), Q$Puzzle$PuzzleState)), join(ab.moves, ' '));
    return psag;
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, Q$InvalidMoveException)) {
      e = $e0;
      azzert_3(false, e);
      return null;
    }
     else 
      throw $e0;
  }
}

defineSeed(329, 318, makeCastMap([Q$Puzzle, Q$Exportable, Q$CubePuzzle, Q$FourByFourCubePuzzle, Q$NoInspectionFourByFourCubePuzzle]), NoInspectionFourByFourCubePuzzle_0);
_.generateRandomMoves_0 = function generateRandomMoves_4(r){
  var psag, randomOrientation, randomOrientationMoves;
  randomOrientationMoves = $getRandomOrientationMoves(this, this.size - 1);
  randomOrientation = randomOrientationMoves[$nextInt(r, randomOrientationMoves.length)];
  psag = $generateRandomMoves_0(this, r);
  psag = applyOrientation_0(this, randomOrientation, psag);
  return psag;
}
;
_.getLongName_0 = function getLongName_4(){
  return '4x4x4 no inspection';
}
;
_.getShortName_0 = function getShortName_4(){
  return '444ni';
}
;
function $export_7(this$static){
  if (!exported_7) {
    exported_7 = true;
    $clinit_ExporterUtil();
    $addExporter(impl_4, Lpuzzle_NoInspectionFourByFourCubePuzzle_2_classLit, this$static);
    new CubePuzzleExporterImpl_0;
    $export0_7(this$static);
  }
}

function $export0_7(this$static){
  var pkg = declarePackage('puzzle.NoInspectionFourByFourCubePuzzle');
  var __0, __ = this$static;
  $wnd.puzzle.NoInspectionFourByFourCubePuzzle = $entry(function(){
    var g, j = this, a = arguments;
    a.length == 1 && __.isAssignable(a[0])?(g = a[0]):a.length == 0 && (g = new NoInspectionFourByFourCubePuzzle_0);
    j.g = g;
    setWrapper(g, j);
    return j;
  }
  );
  __0 = $wnd.puzzle.NoInspectionFourByFourCubePuzzle.prototype = new Object;
  $wnd.puzzle.NoInspectionFourByFourCubePuzzle.applyOrientation = $entry(function(a0, a1, a2, a3){
    return __static_wrapper_applyOrientation_0(a0.g, a1, gwtInstance(a2), a3);
  }
  );
  __0.generateRandomMoves = $entry(function(a0){
    return this.g.generateRandomMoves_0(gwtInstance(a0));
  }
  );
  __0.generateScramble = $entry(function(){
    return this.g.generateScramble_0();
  }
  );
  __0.generateScrambles = $entry(function(a0){
    return wrap(this.g.generateScrambles_0(a0));
  }
  );
  __0.generateSeededScramble = $entry(function(a0){
    return this.g.generateSeededScramble_0(a0);
  }
  );
  __0.generateSeededScrambles = $entry(function(a0, a1){
    return wrap(this.g.generateSeededScrambles_0(a0, a1));
  }
  );
  __0.getDefaultColorScheme = $entry(function(){
    return this.g.getDefaultColorScheme_0();
  }
  );
  __0.getFaceNames = $entry(function(){
    return wrap(this.g.getFaceNames_0());
  }
  );
  __0.getInitializationStatus = $entry(function(){
    return this.g.getInitializationStatus_0();
  }
  );
  __0.getLongName = $entry(function(){
    return this.g.getLongName_0();
  }
  );
  __0.getPreferredSize = $entry(function(a0, a1){
    return runDispatch(this.g, Lpuzzle_NoInspectionFourByFourCubePuzzle_2_classLit, 0, arguments, false, false)[0];
  }
  );
  __0.getShortName = $entry(function(){
    return this.g.getShortName_0();
  }
  );
  __0.getSolvedState = $entry(function(){
    return this.g.getSolvedState_1();
  }
  );
  __0.toString = $entry(function(){
    return this.g.toString$();
  }
  );
  registerDispatchMap(Lpuzzle_NoInspectionFourByFourCubePuzzle_2_classLit, {0:{0:[[function(){
    return this.getPreferredSize_0.apply(this, arguments);
  }
  , null, undefined]], 2:[[function(){
    return this.getPreferredSize_1.apply(this, arguments);
  }
  , null, undefined, 'number', 'number']]}}, false);
  if (pkg)
    for (p in pkg)
      $wnd.puzzle.NoInspectionFourByFourCubePuzzle[p] === undefined && ($wnd.puzzle.NoInspectionFourByFourCubePuzzle[p] = pkg[p]);
}

function NoInspectionFourByFourCubePuzzleExporterImpl_0(){
  $export_7(this);
}

function __static_wrapper_applyOrientation_0(a0, a1, a2, a3){
  return applyOrientation_0(a0, ($clinit_ExporterUtil() , $toArrObject(a1, initDim(_3Lpuzzle_CubePuzzle$CubeMove_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$CubePuzzle$CubeMove_$1]), Q$CubePuzzle$CubeMove, a1.length, 0))), a2);
}

defineSeed(330, 1, {}, NoInspectionFourByFourCubePuzzleExporterImpl_0);
_.isAssignable = function isAssignable_7(o){
  return o != null && instanceOf(o, Q$NoInspectionFourByFourCubePuzzle);
}
;
var exported_7 = false;
function $clinit_ThreeByThreeCubePuzzle(){
  $clinit_ThreeByThreeCubePuzzle = nullMethod;
  $clinit_CubePuzzle();
  l_3 = ($clinit_Logger() , $getLoggerHelper(Lpuzzle_ThreeByThreeCubePuzzle_2_classLit.typeName));
}

function $generateRandomMoves_1(this$static, r, firstAxisRestriction, lastAxisRestriction){
  var ab, e, randomState, scramble;
  randomState = ($clinit_Tools() , randomState_0(r));
  scramble = $trim($solution(dynamicCast($get_3(this$static.twoPhaseSearcher), Q$Search), randomState, 21, Pea60_longLit, Pc8_longLit, 2, firstAxisRestriction, lastAxisRestriction));
  ab = new AlgorithmBuilder_0(this$static, 1);
  try {
    $appendAlgorithm(ab, scramble);
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, Q$InvalidMoveException)) {
      e = $e0;
      azzert_3(false, new InvalidScrambleException_0(scramble, e));
    }
     else 
      throw $e0;
  }
  return new PuzzleStateAndGenerator_0((azzert_1(ab.states.size == ab.moves.size + 1) , dynamicCast($get_4(ab.states, ab.states.size - 1), Q$Puzzle$PuzzleState)), join(ab.moves, ' '));
}

function $solveIn(this$static, ps, n, firstAxisRestriction, lastAxisRestriction){
  var cs, solution;
  cs = dynamicCast(ps, Q$CubePuzzle$CubeState);
  if (this$static == new CubePuzzle$CubeState_0(this$static)) {
    return '';
  }
  solution = $trim($solution(dynamicCast($get_3(this$static.twoPhaseSearcher), Q$Search), $toFaceCube(cs), n, Pea60_longLit, P0_longLit, 0, firstAxisRestriction, lastAxisRestriction));
  if ($equals_0('Error 7', solution)) {
    return null;
  }
   else if (solution.indexOf('Error') == 0) {
    $severe_0(l_3, solution + ' while searching for solution to ' + $toFaceCube(cs));
    azzert_1(false);
    return null;
  }
  return solution;
}

function ThreeByThreeCubePuzzle_0(){
  $clinit_ThreeByThreeCubePuzzle();
  var newMinDistance;
  CubePuzzle_0.call(this, 3);
  newMinDistance = getenv('TNOODLE_333_MIN_DISTANCE');
  newMinDistance != null && (this.wcaMinScrambleDistance = __parseAndValidateInt(newMinDistance, 10));
  this.twoPhaseSearcher = new ThreeByThreeCubePuzzle$1_0;
}

defineSeed(332, 312, makeCastMap([Q$Puzzle, Q$Exportable, Q$CubePuzzle, Q$ThreeByThreeCubePuzzle]), ThreeByThreeCubePuzzle_0);
_.generateRandomMoves_0 = function generateRandomMoves_5(r){
  return $generateRandomMoves_1(this, r, null, null);
}
;
_.generateRandomMoves_1 = function generateRandomMoves_6(r, firstAxisRestriction, lastAxisRestriction){
  return $generateRandomMoves_1(this, r, firstAxisRestriction, lastAxisRestriction);
}
;
_.solveIn_0 = function solveIn_1(ps, n){
  return $solveIn(this, ps, n, null, null);
}
;
_.solveIn_2 = function solveIn_2(ps, n, firstAxisRestriction, lastAxisRestriction){
  return $solveIn(this, ps, n, firstAxisRestriction, lastAxisRestriction);
}
;
_.twoPhaseSearcher = null;
var l_3;
function NoInspectionThreeByThreeCubePuzzle_0(){
  $clinit_ThreeByThreeCubePuzzle();
  ThreeByThreeCubePuzzle_0.call(this);
}

defineSeed(331, 332, makeCastMap([Q$Puzzle, Q$Exportable, Q$CubePuzzle, Q$NoInspectionThreeByThreeCubePuzzle, Q$ThreeByThreeCubePuzzle]), NoInspectionThreeByThreeCubePuzzle_0);
_.generateRandomMoves_0 = function generateRandomMoves_7(r){
  var firstAxisRestriction, psag, randomOrientation, randomOrientationMoves, restrictedFace;
  randomOrientationMoves = $getRandomOrientationMoves(this, ~~(this.size / 2));
  randomOrientation = randomOrientationMoves[$nextInt(r, randomOrientationMoves.length)];
  if (randomOrientation.length > 0) {
    restrictedFace = randomOrientation[0].face;
    firstAxisRestriction = restrictedFace.name_0;
  }
   else {
    firstAxisRestriction = null;
  }
  psag = $generateRandomMoves_1(this, r, firstAxisRestriction, null);
  psag = applyOrientation(this, randomOrientation, psag, false);
  return psag;
}
;
_.getLongName_0 = function getLongName_5(){
  return '3x3x3 no inspection';
}
;
_.getShortName_0 = function getShortName_5(){
  return '333ni';
}
;
function $export_8(this$static){
  if (!exported_8) {
    exported_8 = true;
    $clinit_ExporterUtil();
    $addExporter(impl_4, Lpuzzle_NoInspectionThreeByThreeCubePuzzle_2_classLit, this$static);
    $export0_8(this$static);
  }
}

function $export0_8(this$static){
  var pkg = declarePackage('puzzle.NoInspectionThreeByThreeCubePuzzle');
  var __0, __ = this$static;
  $wnd.puzzle.NoInspectionThreeByThreeCubePuzzle = $entry(function(){
    var g, j = this, a = arguments;
    a.length == 1 && __.isAssignable(a[0])?(g = a[0]):a.length == 0 && (g = new NoInspectionThreeByThreeCubePuzzle_0);
    j.g = g;
    setWrapper(g, j);
    return j;
  }
  );
  __0 = $wnd.puzzle.NoInspectionThreeByThreeCubePuzzle.prototype = new Object;
  __0.generateRandomMoves = $entry(function(a0, a1, a2){
    return runDispatch(this.g, Lpuzzle_NoInspectionThreeByThreeCubePuzzle_2_classLit, 1, arguments, false, false)[0];
  }
  );
  __0.generateScramble = $entry(function(){
    return this.g.generateScramble_0();
  }
  );
  __0.generateScrambles = $entry(function(a0){
    return wrap(this.g.generateScrambles_0(a0));
  }
  );
  __0.generateSeededScramble = $entry(function(a0){
    return this.g.generateSeededScramble_0(a0);
  }
  );
  __0.generateSeededScrambles = $entry(function(a0, a1){
    return wrap(this.g.generateSeededScrambles_0(a0, a1));
  }
  );
  __0.getDefaultColorScheme = $entry(function(){
    return this.g.getDefaultColorScheme_0();
  }
  );
  __0.getFaceNames = $entry(function(){
    return wrap(this.g.getFaceNames_0());
  }
  );
  __0.getLongName = $entry(function(){
    return this.g.getLongName_0();
  }
  );
  __0.getPreferredSize = $entry(function(a0, a1){
    return runDispatch(this.g, Lpuzzle_NoInspectionThreeByThreeCubePuzzle_2_classLit, 0, arguments, false, false)[0];
  }
  );
  __0.getShortName = $entry(function(){
    return this.g.getShortName_0();
  }
  );
  __0.getSolvedState = $entry(function(){
    return this.g.getSolvedState_1();
  }
  );
  __0.solveIn = $entry(function(a0, a1, a2, a3){
    return this.g.solveIn_2(gwtInstance(a0), a1, a2, a3);
  }
  );
  __0.toString = $entry(function(){
    return this.g.toString$();
  }
  );
  registerDispatchMap(Lpuzzle_NoInspectionThreeByThreeCubePuzzle_2_classLit, {0:{0:[[function(){
    return this.getPreferredSize_0.apply(this, arguments);
  }
  , null, undefined]], 2:[[function(){
    return this.getPreferredSize_1.apply(this, arguments);
  }
  , null, undefined, 'number', 'number']]}, 1:{1:[[function(){
    return this.generateRandomMoves_0.apply(this, arguments);
  }
  , null, undefined, Ljava_util_Random_2_classLit]], 3:[[function(){
    return this.generateRandomMoves_1.apply(this, arguments);
  }
  , null, undefined, Ljava_util_Random_2_classLit, 'string', 'string']]}}, false);
  if (pkg)
    for (p in pkg)
      $wnd.puzzle.NoInspectionThreeByThreeCubePuzzle[p] === undefined && ($wnd.puzzle.NoInspectionThreeByThreeCubePuzzle[p] = pkg[p]);
}

function NoInspectionThreeByThreeCubePuzzleExporterImpl_0(){
  $export_8(this);
}

defineSeed(333, 1, {}, NoInspectionThreeByThreeCubePuzzleExporterImpl_0);
_.isAssignable = function isAssignable_8(o){
  return o != null && instanceOf(o, Q$NoInspectionThreeByThreeCubePuzzle);
}
;
var exported_8 = false;
function $clinit_PyraminxPuzzle(){
  $clinit_PyraminxPuzzle = nullMethod;
  $clinit_Puzzle();
  $clinit_Logger();
  $getLoggerHelper(Lpuzzle_PyraminxPuzzle_2_classLit.typeName);
  defaultColorScheme_1 = new HashMap_0;
  defaultColorScheme_1.put('F', new Color_0(65280));
  defaultColorScheme_1.put('D', new Color_0(16776960));
  defaultColorScheme_1.put('L', new Color_0(16711680));
  defaultColorScheme_1.put('R', new Color_0(255));
}

function $drawMinx_0(g, colorScheme, image){
  $drawTriangle(g, 100, 5 + Math.sqrt(3) * 30, true, image[0], colorScheme);
  $drawTriangle(g, 100, 10 + 2 * Math.sqrt(3) * 30, false, image[1], colorScheme);
  $drawTriangle(g, 50, 5 + Math.sqrt(3) / 2 * 30, false, image[2], colorScheme);
  $drawTriangle(g, 150, 5 + Math.sqrt(3) / 2 * 30, false, image[3], colorScheme);
}

function $drawTriangle(g, x, y, up, state, colorScheme){
  var center, ch, coords, i_0, iter, p_0, ps, sticker, type, xpoints, xs, ypoints, ys;
  p_0 = triangle(up);
  $translate(p_0, x, y);
  xpoints = initDim(_3D_classLit, makeCastMap([Q$double_$1, Q$Serializable]), -1, 3, 1);
  ypoints = initDim(_3D_classLit, makeCastMap([Q$double_$1, Q$Serializable]), -1, 3, 1);
  iter = new PathIterator_0(p_0);
  for (ch = 0; ch < 3; ++ch) {
    coords = initDim(_3D_classLit, makeCastMap([Q$double_$1, Q$Serializable]), -1, 6, 1);
    type = $currentSegment(iter, coords);
    if (type == 0 || type == 1) {
      xpoints[ch] = coords[0];
      ypoints[ch] = coords[1];
    }
    ++iter.index_0;
  }
  xs = initDim(_3D_classLit, makeCastMap([Q$double_$1, Q$Serializable]), -1, 6, 1);
  ys = initDim(_3D_classLit, makeCastMap([Q$double_$1, Q$Serializable]), -1, 6, 1);
  for (i_0 = 0; i_0 < 3; ++i_0) {
    xs[i_0] = 0.3333333333333333 * xpoints[(i_0 + 1) % 3] + 0.6666666666666666 * xpoints[i_0];
    ys[i_0] = 0.3333333333333333 * ypoints[(i_0 + 1) % 3] + 0.6666666666666666 * ypoints[i_0];
    xs[i_0 + 3] = 0.6666666666666666 * xpoints[(i_0 + 1) % 3] + 0.3333333333333333 * xpoints[i_0];
    ys[i_0 + 3] = 0.6666666666666666 * ypoints[(i_0 + 1) % 3] + 0.3333333333333333 * ypoints[i_0];
  }
  ps = initDim(_3Lnet_gnehzr_tnoodle_svglite_Path_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$Path, 9, 0);
  for (i_0 = 0; i_0 < ps.length; ++i_0) {
    ps[i_0] = new Path_0;
  }
  center = new Point2D$Double_0(((xs[0] * ys[4] - ys[0] * xs[4]) * (xs[2] - xs[3]) - (xs[0] - xs[4]) * (xs[2] * ys[3] - ys[2] * xs[3])) / ((xs[0] - xs[4]) * (ys[2] - ys[3]) - (ys[0] - ys[4]) * (xs[2] - xs[3])), ((xs[0] * ys[4] - ys[0] * xs[4]) * (ys[2] - ys[3]) - (ys[0] - ys[4]) * (xs[2] * ys[3] - ys[2] * xs[3])) / ((xs[0] - xs[4]) * (ys[2] - ys[3]) - (ys[0] - ys[4]) * (xs[2] - xs[3])));
  for (i_0 = 0; i_0 < 3; ++i_0) {
    $moveTo(ps[3 * i_0], xpoints[i_0], ypoints[i_0]);
    $lineTo(ps[3 * i_0], xs[i_0], ys[i_0]);
    $lineTo(ps[3 * i_0], xs[3 + (2 + i_0) % 3], ys[3 + (2 + i_0) % 3]);
    $closePath(ps[3 * i_0]);
    $moveTo(ps[3 * i_0 + 1], xs[i_0], ys[i_0]);
    $lineTo(ps[3 * i_0 + 1], xs[3 + (i_0 + 2) % 3], ys[3 + (i_0 + 2) % 3]);
    $lineTo(ps[3 * i_0 + 1], center.x, center.y);
    $closePath(ps[3 * i_0 + 1]);
    $moveTo(ps[3 * i_0 + 2], xs[i_0], ys[i_0]);
    $lineTo(ps[3 * i_0 + 2], xs[i_0 + 3], ys[i_0 + 3]);
    $lineTo(ps[3 * i_0 + 2], center.x, center.y);
    $closePath(ps[3 * i_0 + 2]);
  }
  for (i_0 = 0; i_0 < ps.length; ++i_0) {
    sticker = ps[i_0];
    $setFill(sticker, colorScheme[state[i_0]]);
    $setStroke_0(sticker, ($clinit_Color() , BLACK));
    $add_0(g.children, sticker);
  }
}

function PyraminxPuzzle_0(){
  $clinit_PyraminxPuzzle();
  Puzzle_0.call(this);
  this.pyraminxSolver = new PyraminxSolver_0;
  this.wcaMinScrambleDistance = 6;
}

function triangle(pointup){
  var angs, ch, i_0, p_0, rad, x, y;
  rad = round_int(Math.sqrt(3) * 30);
  angs = initValues(_3D_classLit, makeCastMap([Q$double_$1, Q$Serializable]), -1, [1.1666666666666667, 1.8333333333333333, 0.5]);
  for (i_0 = 0; i_0 < angs.length; ++i_0) {
    pointup && (angs[i_0] += 0.3333333333333333);
    angs[i_0] *= 3.141592653589793;
  }
  x = initDim(_3D_classLit, makeCastMap([Q$double_$1, Q$Serializable]), -1, angs.length, 1);
  y = initDim(_3D_classLit, makeCastMap([Q$double_$1, Q$Serializable]), -1, angs.length, 1);
  for (i_0 = 0; i_0 < x.length; ++i_0) {
    x[i_0] = rad * Math.cos(angs[i_0]);
    y[i_0] = rad * Math.sin(angs[i_0]);
  }
  p_0 = new Path_0;
  $moveTo(p_0, x[0], y[0]);
  for (ch = 1; ch < x.length; ++ch) {
    $lineTo(p_0, x[ch], y[ch]);
  }
  azzert_0(!!p_0.commands);
  $add_0(p_0.commands, new Path$Command_0(4, null));
  return p_0;
}

defineSeed(334, 275, makeCastMap([Q$Puzzle, Q$Exportable, Q$PyraminxPuzzle]), PyraminxPuzzle_0);
_.generateRandomMoves_0 = function generateRandomMoves_8(r){
  var e, pState, scramble, state;
  state = $randomState_0(r);
  scramble = $solve_0(this.pyraminxSolver, state, 11, true, true, false);
  try {
    pState = $applyAlgorithm(new PyraminxPuzzle$PyraminxState_0(this), scramble);
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, Q$InvalidScrambleException)) {
      e = $e0;
      azzert_3(false, e);
      return null;
    }
     else 
      throw $e0;
  }
  return new PuzzleStateAndGenerator_0(pState, scramble);
}
;
_.getDefaultColorScheme_0 = function getDefaultColorScheme_2(){
  return new HashMap_1(defaultColorScheme_1);
}
;
_.getLongName_0 = function getLongName_6(){
  return 'Pyraminx';
}
;
_.getPreferredSize_0 = function getPreferredSize_3(){
  return new Dimension_0(200, round_int(3 * Math.sqrt(3) * 30 + 15));
}
;
_.getRandomMoveCount = function getRandomMoveCount_2(){
  return 15;
}
;
_.getShortName_0 = function getShortName_6(){
  return 'pyram';
}
;
_.getSolvedState_0 = function getSolvedState_3(){
  return new PyraminxPuzzle$PyraminxState_0(this);
}
;
_.pyraminxSolver = null;
var defaultColorScheme_1;
function $swap_1(f1, s1, f2, s2, f3, s3, image){
  var temp;
  temp = image[f1][s1];
  image[f1][s1] = image[f2][s2];
  image[f2][s2] = image[f3][s3];
  image[f3][s3] = temp;
}

function $toPyraminxSolverState(this$static){
  var clockwiseTurnsToMatchCorner, colorToValue, cornerPrimaryColor, corners, correctSum, edges, i_0, state, stickers, stickersToCorners, stickersToEdges, stickersToTips, tips;
  state = new PyraminxSolver$PyraminxSolverState_0;
  stickersToEdges = initValues(_3_3I_classLit, makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), Q$int_$1, [initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [this$static.image[0][5], this$static.image[1][2]]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [this$static.image[0][8], this$static.image[2][5]]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [this$static.image[1][8], this$static.image[2][8]]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [this$static.image[0][2], this$static.image[3][8]]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [this$static.image[1][5], this$static.image[3][5]]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [this$static.image[2][2], this$static.image[3][2]])]);
  colorToValue = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [0, 1, 2, 4]);
  edges = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 6, 1);
  for (i_0 = 0; i_0 < edges.length; ++i_0) {
    edges[i_0] = colorToValue[stickersToEdges[i_0][0]] + colorToValue[stickersToEdges[i_0][1]] - 1;
    stickersToEdges[i_0][0] > stickersToEdges[i_0][1] && (edges[i_0] += 8);
  }
  state.edgePerm = packEdgePerm(edges);
  state.edgeOrient = packEdgeOrient(edges);
  stickersToCorners = initValues(_3_3I_classLit, makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), Q$int_$1, [initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [this$static.image[0][1], this$static.image[2][4], this$static.image[3][1]]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [this$static.image[0][7], this$static.image[1][1], this$static.image[2][7]]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [this$static.image[0][4], this$static.image[3][7], this$static.image[1][4]]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [this$static.image[1][7], this$static.image[3][4], this$static.image[2][1]])]);
  correctSum = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [5, 3, 4, 6]);
  corners = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 4, 1);
  for (i_0 = 0; i_0 < corners.length; ++i_0) {
    $clinit_GwtSafeUtils();
    azzertEquals(valueOf_0(stickersToCorners[i_0][0] + stickersToCorners[i_0][1] + stickersToCorners[i_0][2]), valueOf_0(correctSum[i_0]));
    stickersToCorners[i_0][0] < stickersToCorners[i_0][1] && stickersToCorners[i_0][0] < stickersToCorners[i_0][2] && (corners[i_0] = 0);
    stickersToCorners[i_0][1] < stickersToCorners[i_0][0] && stickersToCorners[i_0][1] < stickersToCorners[i_0][2] && (corners[i_0] = 1);
    stickersToCorners[i_0][2] < stickersToCorners[i_0][1] && stickersToCorners[i_0][2] < stickersToCorners[i_0][0] && (corners[i_0] = 2);
  }
  state.cornerOrient = packCornerOrient(corners);
  stickersToTips = initValues(_3_3I_classLit, makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), Q$int_$1, [initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [this$static.image[0][0], this$static.image[2][3], this$static.image[3][0]]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [this$static.image[0][6], this$static.image[1][0], this$static.image[2][6]]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [this$static.image[0][3], this$static.image[3][6], this$static.image[1][3]]), initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [this$static.image[1][6], this$static.image[3][3], this$static.image[2][0]])]);
  tips = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 4, 1);
  for (i_0 = 0; i_0 < tips.length; ++i_0) {
    stickers = stickersToTips[i_0];
    $clinit_GwtSafeUtils();
    azzertEquals(valueOf_0(stickers[0] + stickers[1] + stickers[2]), valueOf_0(correctSum[i_0]));
    cornerPrimaryColor = stickersToCorners[i_0][0];
    clockwiseTurnsToMatchCorner = 0;
    while (stickers[clockwiseTurnsToMatchCorner] != cornerPrimaryColor) {
      ++clockwiseTurnsToMatchCorner;
      azzert_1(clockwiseTurnsToMatchCorner < 3);
    }
    tips[i_0] = clockwiseTurnsToMatchCorner;
  }
  state.tips = packCornerOrient(tips);
  return state;
}

function $turn(side, dir, image){
  var i_0;
  for (i_0 = 0; i_0 < dir; ++i_0) {
    $turn_0(side, image);
  }
}

function $turn_0(s, image){
  switch (s) {
    case 0:
      $swap_1(0, 8, 3, 8, 2, 2, image);
      $swap_1(0, 1, 3, 1, 2, 4, image);
      $swap_1(0, 2, 3, 2, 2, 5, image);
      break;
    case 1:
      $swap_1(2, 8, 1, 2, 0, 8, image);
      $swap_1(2, 7, 1, 1, 0, 7, image);
      $swap_1(2, 5, 1, 8, 0, 5, image);
      break;
    case 2:
      $swap_1(3, 8, 0, 5, 1, 5, image);
      $swap_1(3, 7, 0, 4, 1, 4, image);
      $swap_1(3, 5, 0, 2, 1, 2, image);
      break;
    case 3:
      $swap_1(1, 8, 2, 2, 3, 5, image);
      $swap_1(1, 7, 2, 1, 3, 4, image);
      $swap_1(1, 5, 2, 8, 3, 2, image);
      break;
    default:azzert_1(false);
  }
  $turnTip_0(s, image);
}

function $turnTip(side, dir, image){
  var i_0;
  for (i_0 = 0; i_0 < dir; ++i_0) {
    $turnTip_0(side, image);
  }
}

function $turnTip_0(s, image){
  switch (s) {
    case 0:
      $swap_1(0, 0, 3, 0, 2, 3, image);
      break;
    case 1:
      $swap_1(0, 6, 2, 6, 1, 0, image);
      break;
    case 2:
      $swap_1(0, 3, 1, 3, 3, 6, image);
      break;
    case 3:
      $swap_1(1, 6, 2, 0, 3, 3, image);
      break;
    default:azzert_1(false);
  }
}

function PyraminxPuzzle$PyraminxState_0(this$0){
  var i_0, j;
  this.this$0 = this$0;
  this.this$0_0 = this$0;
  this.image = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [4, 9], 2, 1);
  for (i_0 = 0; i_0 < this.image.length; ++i_0) {
    for (j = 0; j < this.image[0].length; ++j) {
      this.image[i_0][j] = i_0;
    }
  }
}

function PyraminxPuzzle$PyraminxState_1(this$0, image){
  this.this$0 = this$0;
  this.this$0_0 = this$0;
  this.image = image;
}

defineSeed(335, 277, makeCastMap([Q$Puzzle$PuzzleState, Q$PyraminxPuzzle$PyraminxState]), PyraminxPuzzle$PyraminxState_0, PyraminxPuzzle$PyraminxState_1);
_.drawScramble = function drawScramble_2(colorScheme){
  var i_0, preferredSize, scheme, svg;
  preferredSize = new Dimension_0(($clinit_PyraminxPuzzle() , 200), round_int(3 * Math.sqrt(3) * 30 + 15));
  svg = new Svg_0(preferredSize);
  $setStroke(svg);
  scheme = initDim(_3Lnet_gnehzr_tnoodle_svglite_Color_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$Color, 4, 0);
  for (i_0 = 0; i_0 < scheme.length; ++i_0) {
    scheme[i_0] = dynamicCast(colorScheme.get(charToString('FDLR'.charCodeAt(i_0)) + ''), Q$Color);
  }
  $drawMinx_0(svg, scheme, this.image);
  return svg;
}
;
_.equals$ = function equals_31(other){
  return deepEquals(this.image, dynamicCast(other, Q$PyraminxPuzzle$PyraminxState).image);
}
;
_.getSuccessorsByName = function getSuccessorsByName_2(){
  var axis, dir, face, imageCopy, successors, tip, tip$array, tip$index, tip$max, turn;
  successors = new LinkedHashMap_0;
  for (axis = 0; axis < 4; ++axis) {
    for (tip$array = initValues(_3Z_classLit, makeCastMap([Q$boolean_$1, Q$Serializable]), -1, [true, false]) , tip$index = 0 , tip$max = tip$array.length; tip$index < tip$max; ++tip$index) {
      tip = tip$array[tip$index];
      face = 'ulrb'.charCodeAt(axis);
      face = tip?String.fromCharCode(face).toLowerCase().charCodeAt(0):String.fromCharCode(face).toUpperCase().charCodeAt(0);
      for (dir = 1; dir <= 2; ++dir) {
        turn = '' + String.fromCharCode(face);
        dir == 2 && (turn += "'");
        imageCopy = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [this.image.length, this.image[0].length], 2, 1);
        deepCopy(this.image, imageCopy);
        tip?$turnTip(axis, dir, imageCopy):$turn(axis, dir, imageCopy);
        $put_0(successors, turn, new PyraminxPuzzle$PyraminxState_1(this.this$0, imageCopy));
      }
    }
  }
  return successors;
}
;
_.hashCode$ = function hashCode_32(){
  return deepHashCode(this.image);
}
;
_.solveIn_1 = function solveIn_3(n){
  return $solve_0(this.this$0.pyraminxSolver, $toPyraminxSolverState(this), n, false, false, true);
}
;
_.image = null;
_.this$0 = null;
function $export_9(this$static){
  if (!exported_9) {
    exported_9 = true;
    $clinit_ExporterUtil();
    $addExporter(impl_4, Lpuzzle_PyraminxPuzzle_2_classLit, this$static);
    $export0_9(this$static);
  }
}

function $export0_9(this$static){
  var pkg = declarePackage('puzzle.PyraminxPuzzle');
  var __0, __ = this$static;
  $wnd.puzzle.PyraminxPuzzle = $entry(function(){
    var g, j = this, a = arguments;
    a.length == 1 && __.isAssignable(a[0])?(g = a[0]):a.length == 0 && (g = new PyraminxPuzzle_0);
    j.g = g;
    setWrapper(g, j);
    return j;
  }
  );
  __0 = $wnd.puzzle.PyraminxPuzzle.prototype = new Object;
  __0.generateRandomMoves = $entry(function(a0){
    return this.g.generateRandomMoves_0(gwtInstance(a0));
  }
  );
  __0.generateScramble = $entry(function(){
    return this.g.generateScramble_0();
  }
  );
  __0.generateScrambles = $entry(function(a0){
    return wrap(this.g.generateScrambles_0(a0));
  }
  );
  __0.generateSeededScramble = $entry(function(a0){
    return this.g.generateSeededScramble_0(a0);
  }
  );
  __0.generateSeededScrambles = $entry(function(a0, a1){
    return wrap(this.g.generateSeededScrambles_0(a0, a1));
  }
  );
  __0.getDefaultColorScheme = $entry(function(){
    return this.g.getDefaultColorScheme_0();
  }
  );
  __0.getFaceNames = $entry(function(){
    return wrap(this.g.getFaceNames_0());
  }
  );
  __0.getLongName = $entry(function(){
    return this.g.getLongName_0();
  }
  );
  __0.getPreferredSize = $entry(function(a0, a1){
    return runDispatch(this.g, Lpuzzle_PyraminxPuzzle_2_classLit, 0, arguments, false, false)[0];
  }
  );
  __0.getShortName = $entry(function(){
    return this.g.getShortName_0();
  }
  );
  __0.getSolvedState = $entry(function(){
    return this.g.getSolvedState_0();
  }
  );
  __0.toString = $entry(function(){
    return this.g.toString$();
  }
  );
  registerDispatchMap(Lpuzzle_PyraminxPuzzle_2_classLit, {0:{0:[[function(){
    return this.getPreferredSize_0.apply(this, arguments);
  }
  , null, undefined]], 2:[[function(){
    return this.getPreferredSize_1.apply(this, arguments);
  }
  , null, undefined, 'number', 'number']]}}, false);
  if (pkg)
    for (p in pkg)
      $wnd.puzzle.PyraminxPuzzle[p] === undefined && ($wnd.puzzle.PyraminxPuzzle[p] = pkg[p]);
}

function PyraminxPuzzleExporterImpl_0(){
  $export_9(this);
}

defineSeed(336, 1, {}, PyraminxPuzzleExporterImpl_0);
_.isAssignable = function isAssignable_9(o){
  return o != null && instanceOf(o, Q$PyraminxPuzzle);
}
;
var exported_9 = false;
function $clinit_PyraminxSolver(){
  $clinit_PyraminxSolver = nullMethod;
  moveToString = initValues(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, ['U', "U'", 'L', "L'", 'R', "R'", 'B', "B'"]);
  inverseMoveToString = initValues(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, ["U'", 'U', "L'", 'L', "R'", 'R', "B'", 'B']);
  tipToString = initValues(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, ['u', "u'", 'l', "l'", 'r', "r'", 'b', "b'"]);
  inverseTipToString = initValues(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, ["u'", 'u', "l'", 'l', "r'", 'r', "b'", 'b']);
  fact_2 = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [1, 1, 2, 6, 24, 120, 720]);
  moveEdgePerm = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [720, 8], 2, 1);
  moveEdgeOrient = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [32, 8], 2, 1);
  moveCornerOrient = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [81, 8], 2, 1);
  prunPerm = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 720, 1);
  prunOrient = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 2592, 1);
  initMoves();
  initPrun();
}

function $randomState_0(r){
  var state;
  state = new PyraminxSolver$PyraminxSolverState_0;
  do {
    state.edgePerm = $nextInt(r, 720);
  }
   while (prunPerm[state.edgePerm] == -1);
  state.edgeOrient = $nextInt(r, 32);
  state.cornerOrient = $nextInt(r, 81);
  state.tips = $nextInt(r, 81);
  return state;
}

function $search(this$static, edgePerm, edgeOrient, cornerOrient, depth, length_0, last_move, solution, randomiseMoves){
  var move, newCornerOrient, newEdgeOrient, newEdgePerm, randomMove, randomOffset;
  if (length_0 == 0) {
    return edgePerm == 0 && edgeOrient == 0 && cornerOrient == 0;
  }
  if (prunPerm[edgePerm] > length_0 || prunOrient[cornerOrient * 32 + edgeOrient] > length_0) {
    return false;
  }
  randomOffset = $nextInt(randomiseMoves, 8);
  for (move = 0; move < 8; ++move) {
    randomMove = (move + randomOffset) % 8;
    if (~~(randomMove / 2) == ~~(last_move / 2)) {
      continue;
    }
    newEdgePerm = moveEdgePerm[edgePerm][randomMove];
    newEdgeOrient = moveEdgeOrient[edgeOrient][randomMove];
    newCornerOrient = moveCornerOrient[cornerOrient][randomMove];
    if ($search(this$static, newEdgePerm, newEdgeOrient, newCornerOrient, depth + 1, length_0 - 1, randomMove, solution, randomiseMoves)) {
      solution[depth] = randomMove;
      return true;
    }
  }
  return false;
}

function $solve_0(this$static, state, desiredLength, exactLength, inverse, includingTips){
  var arrayTips, dir, foundSolution, i_0, length_0, r, scramble, solution, tip;
  r = new Random_0;
  solution = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 20, 1);
  foundSolution = false;
  includingTips && (desiredLength -= $unsolvedTips(state));
  length_0 = exactLength?desiredLength:0;
  while (length_0 <= desiredLength) {
    if ($search(this$static, state.edgePerm, state.edgeOrient, state.cornerOrient, 0, length_0, 42, solution, r)) {
      foundSolution = true;
      break;
    }
    ++length_0;
  }
  if (!foundSolution) {
    return null;
  }
  scramble = new StringBuilder_1;
  if (inverse) {
    for (i_0 = length_0 - 1; i_0 >= 0; --i_0) {
      $append_5((scramble.impl.append_2(scramble.data, ' ') , scramble), inverseMoveToString[solution[i_0]]);
    }
  }
   else {
    for (i_0 = 0; i_0 < length_0; ++i_0) {
      $append_5((scramble.impl.append_2(scramble.data, ' ') , scramble), moveToString[solution[i_0]]);
    }
  }
  arrayTips = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 4, 1);
  unpackCornerOrient(state.tips, arrayTips);
  for (tip = 0; tip < 4; ++tip) {
    dir = arrayTips[tip];
    dir > 0 && (inverse?$append_5((scramble.impl.append_2(scramble.data, ' ') , scramble), tipToString[tip * 2 + dir - 1]):$append_5((scramble.impl.append_2(scramble.data, ' ') , scramble), inverseTipToString[tip * 2 + dir - 1]));
  }
  return $trim(scramble.impl.toString_0(scramble.data));
}

function PyraminxSolver_0(){
  $clinit_PyraminxSolver();
}

function cycleAndOrient(edges, a, b, c, times){
  var temp;
  temp = edges[c];
  edges[c] = (edges[b] + 8) % 16;
  edges[b] = (edges[a] + 8) % 16;
  edges[a] = temp;
  times > 1 && cycleAndOrient(edges, a, b, c, times - 1);
}

function initMoves(){
  var corners1, corners2, edges1, edges2, move, newOrient, newPerm, orient, perm, face, times;
  edges1 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 6, 1);
  edges2 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 6, 1);
  for (perm = 0; perm < 720; ++perm) {
    unpackEdgePerm(perm, edges1);
    for (move = 0; move < 8; ++move) {
      arraycopy(edges1, 0, edges2, 0, 6);
      moveEdges(edges2, move);
      newPerm = packEdgePerm(edges2);
      moveEdgePerm[perm][move] = newPerm;
    }
  }
  for (orient = 0; orient < 32; ++orient) {
    unpackEdgeOrient(orient, edges1);
    for (move = 0; move < 8; ++move) {
      arraycopy(edges1, 0, edges2, 0, 6);
      moveEdges(edges2, move);
      newOrient = packEdgeOrient(edges2);
      moveEdgeOrient[orient][move] = newOrient;
    }
  }
  corners1 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 4, 1);
  corners2 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 4, 1);
  for (orient = 0; orient < 81; ++orient) {
    unpackCornerOrient(orient, corners1);
    for (move = 0; move < 8; ++move) {
      arraycopy(corners1, 0, corners2, 0, 4);
      face = ~~(move / 2);
      times = move % 2 + 1;
      corners2[face] = (corners2[face] + times) % 3;
      newOrient = packCornerOrient(corners2);
      moveCornerOrient[orient][move] = newOrient;
    }
  }
}

function initPrun(){
  var done, length_0, move, newCornerOrient, newEdgeOrient, newOrient, newPerm, orient, perm;
  for (perm = 0; perm < 720; ++perm) {
    prunPerm[perm] = -1;
  }
  prunPerm[0] = 0;
  done = 1;
  for (length_0 = 0; done < 360; ++length_0) {
    for (perm = 0; perm < 720; ++perm) {
      if (prunPerm[perm] == length_0) {
        for (move = 0; move < 8; ++move) {
          newPerm = moveEdgePerm[perm][move];
          if (prunPerm[newPerm] == -1) {
            prunPerm[newPerm] = length_0 + 1;
            ++done;
          }
        }
      }
    }
  }
  for (orient = 0; orient < 2592; ++orient) {
    prunOrient[orient] = -1;
  }
  prunOrient[0] = 0;
  done = 1;
  for (length_0 = 0; done < 2592; ++length_0) {
    for (orient = 0; orient < 2592; ++orient) {
      if (prunOrient[orient] == length_0) {
        for (move = 0; move < 8; ++move) {
          newEdgeOrient = moveEdgeOrient[orient % 32][move];
          newCornerOrient = moveCornerOrient[~~(orient / 32)][move];
          newOrient = newCornerOrient * 32 + newEdgeOrient;
          if (prunOrient[newOrient] == -1) {
            prunOrient[newOrient] = length_0 + 1;
            ++done;
          }
        }
      }
    }
  }
}

function moveEdges(edges, move){
  var face, times;
  face = ~~(move / 2);
  times = move % 2 + 1;
  switch (face) {
    case 0:
      cycleAndOrient(edges, 5, 3, 1, times);
      break;
    case 1:
      cycleAndOrient(edges, 2, 1, 0, times);
      break;
    case 2:
      cycleAndOrient(edges, 0, 3, 4, times);
      break;
    case 3:
      cycleAndOrient(edges, 2, 4, 5, times);
      break;
    default:azzert_1(false);
  }
}

function packCornerOrient(corners){
  $clinit_PyraminxSolver();
  var i_0, ori;
  ori = 0;
  for (i_0 = 0; i_0 < 4; ++i_0) {
    ori = 3 * ori + corners[i_0];
  }
  return ori;
}

function packEdgeOrient(edges){
  $clinit_PyraminxSolver();
  var i_0, ori;
  ori = 0;
  for (i_0 = 0; i_0 < 5; ++i_0) {
    ori = 2 * ori + (~~edges[i_0] >> 3);
  }
  return ori;
}

function packEdgePerm(edges){
  $clinit_PyraminxSolver();
  var i_0, idx, v, val;
  idx = 0;
  val = 5517840;
  for (i_0 = 0; i_0 < 5; ++i_0) {
    v = (edges[i_0] & 7) << 2;
    idx = (6 - i_0) * idx + (~~val >> v & 7);
    val -= 1118480 << v;
  }
  return idx;
}

function unpackCornerOrient(ori, corners){
  var i_0;
  for (i_0 = 3; i_0 >= 0; --i_0) {
    corners[i_0] = ori % 3;
    ori = ~~(ori / 3);
  }
}

function unpackEdgeOrient(ori, edges){
  var i_0, sum_ori;
  sum_ori = 0;
  for (i_0 = 4; i_0 >= 0; --i_0) {
    edges[i_0] = (ori & 1) << 3;
    sum_ori ^= ori & 1;
    ori >>= 1;
  }
  edges[5] = sum_ori << 3;
}

function unpackEdgePerm(perm, edges){
  var i_0, m_0, p_0, v, val;
  val = 5517840;
  for (i_0 = 0; i_0 < 5; ++i_0) {
    p_0 = fact_2[5 - i_0];
    v = ~~(perm / p_0);
    perm -= v * p_0;
    v <<= 2;
    edges[i_0] = ~~val >> v & 7;
    m_0 = (1 << v) - 1;
    val = (val & m_0) + (~~val >> 4 & ~m_0);
  }
  edges[5] = val;
}

defineSeed(337, 1, {}, PyraminxSolver_0);
var fact_2, inverseMoveToString, inverseTipToString, moveCornerOrient, moveEdgeOrient, moveEdgePerm, moveToString, prunOrient, prunPerm, tipToString;
function $unsolvedTips(this$static){
  var numberUnsolved, tempTips;
  numberUnsolved = 0;
  tempTips = this$static.tips;
  while (tempTips != 0) {
    tempTips % 3 > 0 && ++numberUnsolved;
    tempTips = ~~(tempTips / 3);
  }
  azzert_1(numberUnsolved <= 4);
  return numberUnsolved;
}

function PyraminxSolver$PyraminxSolverState_0(){
}

defineSeed(338, 1, {}, PyraminxSolver$PyraminxSolverState_0);
_.cornerOrient = 0;
_.edgeOrient = 0;
_.edgePerm = 0;
_.tips = 0;
function $clinit_SkewbPuzzle(){
  $clinit_SkewbPuzzle = nullMethod;
  $clinit_Puzzle();
  $clinit_Logger();
  $getLoggerHelper(Lpuzzle_SkewbPuzzle_2_classLit.typeName);
  sq3d2 = Math.sqrt(3) / 2;
  defaultColorScheme_2 = new HashMap_0;
  defaultColorScheme_2.put('U', ($clinit_Color() , WHITE));
  defaultColorScheme_2.put('R', BLUE);
  defaultColorScheme_2.put('F', RED);
  defaultColorScheme_2.put('D', YELLOW);
  defaultColorScheme_2.put('L', GREEN);
  defaultColorScheme_2.put('B', new Color_0(16744448));
}

function SkewbPuzzle_0(){
  $clinit_SkewbPuzzle();
  Puzzle_0.call(this);
  this.skewbSolver = new SkewbSolver_0;
  this.wcaMinScrambleDistance = 7;
}

defineSeed(339, 275, makeCastMap([Q$Puzzle, Q$Exportable, Q$SkewbPuzzle]), SkewbPuzzle_0);
_.generateRandomMoves_0 = function generateRandomMoves_9(r){
  var e, pState, scramble, state;
  state = $randomState_1(r);
  scramble = $generateExactly(this.skewbSolver, state, r);
  try {
    pState = $applyAlgorithm(new SkewbPuzzle$SkewbState_0(this), scramble);
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, Q$InvalidScrambleException)) {
      e = $e0;
      azzert_3(false, e);
      return null;
    }
     else 
      throw $e0;
  }
  return new PuzzleStateAndGenerator_0(pState, scramble);
}
;
_.getDefaultColorScheme_0 = function getDefaultColorScheme_3(){
  return new HashMap_1(defaultColorScheme_2);
}
;
_.getLongName_0 = function getLongName_7(){
  return 'Skewb';
}
;
_.getPreferredSize_0 = function getPreferredSize_4(){
  return new Dimension_0(round_int(ceil(250 * sq3d2)), round_int(Math.ceil(187)));
}
;
_.getRandomMoveCount = function getRandomMoveCount_3(){
  return 15;
}
;
_.getShortName_0 = function getShortName_7(){
  return 'skewb';
}
;
_.getSolvedState_0 = function getSolvedState_4(){
  return new SkewbPuzzle$SkewbState_0(this);
}
;
_.skewbSolver = null;
var defaultColorScheme_2, sq3d2;
function $$init_8(this$static){
  this$static.image = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [6, 5], 2, 1);
}

function $getFacePaths(){
  var i_0, p_0;
  p_0 = initDim(_3Lnet_gnehzr_tnoodle_svglite_Path_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$Path, 5, 0);
  for (i_0 = 0; i_0 < 5; ++i_0) {
    p_0[i_0] = new Path_0;
    $setAttribute(p_0[i_0], 'stroke-width', '0.03333333333333333px');
  }
  $moveTo(p_0[0], -1, 0);
  $lineTo(p_0[0], 0, 1);
  $lineTo(p_0[0], 1, 0);
  $lineTo(p_0[0], 0, -1);
  $closePath(p_0[0]);
  $moveTo(p_0[1], -1, 0);
  $lineTo(p_0[1], -1, -1);
  $lineTo(p_0[1], 0, -1);
  $closePath(p_0[1]);
  $moveTo(p_0[2], 0, -1);
  $lineTo(p_0[2], 1, -1);
  $lineTo(p_0[2], 1, 0);
  $closePath(p_0[2]);
  $moveTo(p_0[3], -1, 0);
  $lineTo(p_0[3], -1, 1);
  $lineTo(p_0[3], 0, 1);
  $closePath(p_0[3]);
  $moveTo(p_0[4], 0, 1);
  $lineTo(p_0[4], 1, 1);
  $lineTo(p_0[4], 1, 0);
  $closePath(p_0[4]);
  return p_0;
}

function $swap_2(f1, s1, f2, s2, f3, s3, image){
  var temp;
  temp = image[f1][s1];
  image[f1][s1] = image[f2][s2];
  image[f2][s2] = image[f3][s3];
  image[f3][s3] = temp;
}

function $turn_1(axis, pow, image){
  var p_0;
  for (p_0 = 0; p_0 < pow; ++p_0) {
    switch (axis) {
      case 0:
        $swap_2(2, 0, 3, 0, 1, 0, image);
        $swap_2(2, 4, 3, 2, 1, 3, image);
        $swap_2(2, 2, 3, 1, 1, 4, image);
        $swap_2(2, 3, 3, 4, 1, 1, image);
        $swap_2(4, 4, 5, 3, 0, 4, image);
        break;
      case 1:
        $swap_2(0, 0, 1, 0, 5, 0, image);
        $swap_2(0, 2, 1, 2, 5, 1, image);
        $swap_2(0, 4, 1, 4, 5, 2, image);
        $swap_2(0, 1, 1, 1, 5, 3, image);
        $swap_2(4, 1, 2, 2, 3, 4, image);
        break;
      case 2:
        $swap_2(4, 0, 5, 0, 3, 0, image);
        $swap_2(4, 3, 5, 4, 3, 3, image);
        $swap_2(4, 1, 5, 3, 3, 1, image);
        $swap_2(4, 4, 5, 2, 3, 4, image);
        $swap_2(2, 3, 0, 1, 1, 4, image);
        break;
      case 3:
        $swap_2(1, 0, 3, 0, 5, 0, image);
        $swap_2(1, 4, 3, 4, 5, 3, image);
        $swap_2(1, 3, 3, 3, 5, 1, image);
        $swap_2(1, 2, 3, 2, 5, 4, image);
        $swap_2(0, 2, 2, 4, 4, 3, image);
        break;
      default:azzert_1(false);
    }
  }
}

function SkewbPuzzle$SkewbState_0(this$0){
  var i_0, j;
  this.this$0 = this$0;
  this.this$0_0 = this$0;
  $$init_8(this);
  for (i_0 = 0; i_0 < 6; ++i_0) {
    for (j = 0; j < 5; ++j) {
      this.image[i_0][j] = i_0;
    }
  }
}

function SkewbPuzzle$SkewbState_1(this$0, _image){
  var i_0, j;
  this.this$0 = this$0;
  this.this$0_0 = this$0;
  $$init_8(this);
  for (i_0 = 0; i_0 < 6; ++i_0) {
    for (j = 0; j < 5; ++j) {
      this.image[i_0][j] = _image[i_0][j];
    }
  }
}

defineSeed(340, 277, makeCastMap([Q$Puzzle$PuzzleState, Q$SkewbPuzzle$SkewbState]), SkewbPuzzle$SkewbState_0, SkewbPuzzle$SkewbState_1);
_.drawScramble = function drawScramble_3(colorScheme){
  var face, g, i_0, p_0, position, scheme;
  g = new Svg_0(new Dimension_0(round_int(ceil(250 * ($clinit_SkewbPuzzle() , sq3d2))), round_int(Math.ceil(187))));
  scheme = initDim(_3Lnet_gnehzr_tnoodle_svglite_Color_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$Color, 6, 0);
  for (i_0 = 0; i_0 < scheme.length; ++i_0) {
    scheme[i_0] = dynamicCast(colorScheme.get(charToString('URFDLB'.charCodeAt(i_0)) + ''), Q$Color);
  }
  position = initValues(_3Lnet_gnehzr_tnoodle_svglite_Transform_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$Transform, [new Transform_1(30 * sq3d2, -15, 30 * sq3d2, 15, 124.5 * sq3d2, 30), new Transform_1(30 * sq3d2, -15, 0, 30, 219 * sq3d2, 45), new Transform_1(30 * sq3d2, -15, 0, 30, 156 * sq3d2, 76.5), new Transform_1(0, 30, -30 * sq3d2, -15, 93 * sq3d2, 139.5), new Transform_1(30 * sq3d2, 15, 0, 30, 93 * sq3d2, 76.5), new Transform_1(30 * sq3d2, 15, 0, 30, 30 * sq3d2, 45)]);
  for (face = 0; face < 6; ++face) {
    p_0 = $getFacePaths();
    for (i_0 = 0; i_0 < 5; ++i_0) {
      $concatenate(p_0[i_0].transform, position[face]);
      $setFill(p_0[i_0], scheme[this.image[face][i_0]]);
      $setStroke_0(p_0[i_0], ($clinit_Color() , BLACK));
      $add_0(g.children, p_0[i_0]);
    }
  }
  return g;
}
;
_.equals$ = function equals_32(other){
  return deepEquals(this.image, dynamicCast(other, Q$SkewbPuzzle$SkewbState).image);
}
;
_.getSuccessorsByName = function getSuccessorsByName_3(){
  var axis, face, imageCopy, pow, successors, turn;
  successors = new LinkedHashMap_0;
  for (axis = 0; axis < 4; ++axis) {
    face = 'RULB'.charCodeAt(axis);
    for (pow = 1; pow <= 2; ++pow) {
      turn = '' + String.fromCharCode(face);
      pow == 2 && (turn += "'");
      imageCopy = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [this.image.length, this.image[0].length], 2, 1);
      deepCopy(this.image, imageCopy);
      $turn_1(axis, pow, imageCopy);
      $put_0(successors, turn, new SkewbPuzzle$SkewbState_1(this.this$0, imageCopy));
    }
  }
  return successors;
}
;
_.hashCode$ = function hashCode_33(){
  return deepHashCode(this.image);
}
;
_.this$0 = null;
function $export_10(this$static){
  if (!exported_10) {
    exported_10 = true;
    $clinit_ExporterUtil();
    $addExporter(impl_4, Lpuzzle_SkewbPuzzle_2_classLit, this$static);
    $export0_10(this$static);
  }
}

function $export0_10(this$static){
  var pkg = declarePackage('puzzle.SkewbPuzzle');
  var __0, __ = this$static;
  $wnd.puzzle.SkewbPuzzle = $entry(function(){
    var g, j = this, a = arguments;
    a.length == 1 && __.isAssignable(a[0])?(g = a[0]):a.length == 0 && (g = new SkewbPuzzle_0);
    j.g = g;
    setWrapper(g, j);
    return j;
  }
  );
  __0 = $wnd.puzzle.SkewbPuzzle.prototype = new Object;
  __0.generateRandomMoves = $entry(function(a0){
    return this.g.generateRandomMoves_0(gwtInstance(a0));
  }
  );
  __0.generateScramble = $entry(function(){
    return this.g.generateScramble_0();
  }
  );
  __0.generateScrambles = $entry(function(a0){
    return wrap(this.g.generateScrambles_0(a0));
  }
  );
  __0.generateSeededScramble = $entry(function(a0){
    return this.g.generateSeededScramble_0(a0);
  }
  );
  __0.generateSeededScrambles = $entry(function(a0, a1){
    return wrap(this.g.generateSeededScrambles_0(a0, a1));
  }
  );
  __0.getDefaultColorScheme = $entry(function(){
    return this.g.getDefaultColorScheme_0();
  }
  );
  __0.getFaceNames = $entry(function(){
    return wrap(this.g.getFaceNames_0());
  }
  );
  __0.getLongName = $entry(function(){
    return this.g.getLongName_0();
  }
  );
  __0.getPreferredSize = $entry(function(a0, a1){
    return runDispatch(this.g, Lpuzzle_SkewbPuzzle_2_classLit, 0, arguments, false, false)[0];
  }
  );
  __0.getShortName = $entry(function(){
    return this.g.getShortName_0();
  }
  );
  __0.getSolvedState = $entry(function(){
    return this.g.getSolvedState_0();
  }
  );
  __0.toString = $entry(function(){
    return this.g.toString$();
  }
  );
  registerDispatchMap(Lpuzzle_SkewbPuzzle_2_classLit, {0:{0:[[function(){
    return this.getPreferredSize_0.apply(this, arguments);
  }
  , null, undefined]], 2:[[function(){
    return this.getPreferredSize_1.apply(this, arguments);
  }
  , null, undefined, 'number', 'number']]}}, false);
  if (pkg)
    for (p in pkg)
      $wnd.puzzle.SkewbPuzzle[p] === undefined && ($wnd.puzzle.SkewbPuzzle[p] = pkg[p]);
}

function SkewbPuzzleExporterImpl_0(){
  $export_10(this);
}

defineSeed(341, 1, {}, SkewbPuzzleExporterImpl_0);
_.isAssignable = function isAssignable_10(o){
  return o != null && instanceOf(o, Q$SkewbPuzzle);
}
;
var exported_10 = false;
function $clinit_SkewbSolver(){
  $clinit_SkewbSolver = nullMethod;
  fact_3 = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [1, 1, 1, 3, 12, 60, 360]);
  permmv = initDims([_3_3C_classLit, _3C_classLit], [makeCastMap([Q$Serializable, Q$Object_$1]), makeCastMap([Q$char_$1, Q$Serializable])], [Q$char_$1, -1], [4320, 4], 2, 1);
  twstmv = initDims([_3_3C_classLit, _3C_classLit], [makeCastMap([Q$Serializable, Q$Object_$1]), makeCastMap([Q$char_$1, Q$Serializable])], [Q$char_$1, -1], [2187, 4], 2, 1);
  permprun = initDim(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, 4320, 1);
  twstprun = initDim(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, 2187, 1);
  cornerpermmv = initValues(_3_3B_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$byte_$1, [initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [6, 5, 10, 1]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [9, 7, 4, 2]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [3, 11, 8, 0]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [10, 1, 6, 5]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [0, 8, 11, 3]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [7, 9, 2, 4]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [4, 2, 9, 7]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [11, 3, 0, 8]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [1, 10, 5, 6]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [8, 0, 3, 11]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [2, 4, 7, 9]), initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [5, 6, 1, 10])]);
  ori_0 = initValues(_3B_classLit, makeCastMap([Q$byte_$1, Q$Serializable]), -1, [0, 1, 2, 0, 2, 1, 1, 2, 0, 2, 1, 0]);
  init_6();
}

function $generateExactly(this$static, state, randomizeMoves){
  var sol;
  sol = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 12, 1);
  $search_0(this$static, 0, state.perm, state.twst, 11, -1, sol, randomizeMoves);
  return $getSolution(this$static, sol);
}

function $getSolution(this$static, sol){
  var axis, i_0, move2str, p_0, pow, sb, scrambleSequence, temp;
  sb = new StringBuffer_0;
  move2str = initValues(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, ['L', 'R', 'B', 'U']);
  for (i_0 = 0; i_0 < this$static.solution_length; ++i_0) {
    axis = ~~sol[i_0] >> 1;
    pow = sol[i_0] & 1;
    if (axis == 2) {
      for (p_0 = 0; p_0 <= pow; ++p_0) {
        temp = move2str[0];
        move2str[0] = move2str[1];
        move2str[1] = move2str[3];
        move2str[3] = temp;
      }
    }
    sb.impl.append_2(sb.data, move2str[axis] + (pow == 1?"'":''));
    sb.impl.append_2(sb.data, ' ');
  }
  scrambleSequence = $trim(sb.impl.toString_0(sb.data));
  return scrambleSequence;
}

function $randomState_1(r){
  var state;
  state = new SkewbSolver$SkewbSolverState_0;
  state.perm = $nextInt(r, 4320);
  do {
    state.twst = $nextInt(r, 2187);
  }
   while (ori_0[state.perm % 12] != (state.twst + ~~(state.twst / 3) + ~~(state.twst / 9) + ~~(state.twst / 27)) % 3);
  return state;
}

function $search_0(this$static, depth, perm, twst, maxl, lm, sol, randomizeMoves){
  var a, m_0, p_0, randomMove, randomOffset, s;
  if (maxl == 0) {
    this$static.solution_length = depth;
    return perm == 0 && twst == 0;
  }
  this$static.solution_length = -1;
  if (permprun[perm] > maxl || twstprun[twst] > maxl) {
    return false;
  }
  randomOffset = $nextInt(randomizeMoves, 4);
  for (m_0 = 0; m_0 < 4; ++m_0) {
    randomMove = (m_0 + randomOffset) % 4;
    if (randomMove != lm) {
      p_0 = perm;
      s = twst;
      for (a = 0; a < 2; ++a) {
        p_0 = permmv[p_0][randomMove];
        s = twstmv[s][randomMove];
        if ($search_0(this$static, depth + 1, p_0, s, maxl - 1, randomMove, sol, randomizeMoves)) {
          sol[depth] = randomMove * 2 + a;
          return true;
        }
      }
    }
  }
  return false;
}

function SkewbSolver_0(){
  $clinit_SkewbSolver();
}

function getpermmv(idx, move){
  var centerindex, centerperm, cornerindex, i_0, m_0, p_0, parity, t, v, val;
  centerindex = ~~(idx / 12);
  cornerindex = idx % 12;
  val = 5517840;
  parity = 0;
  centerperm = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 6, 1);
  for (i_0 = 0; i_0 < 5; ++i_0) {
    p_0 = fact_3[5 - i_0];
    v = ~~(centerindex / p_0);
    centerindex -= v * p_0;
    parity ^= v;
    v <<= 2;
    centerperm[i_0] = ~~val >> v & 15;
    m_0 = (1 << v) - 1;
    val = (val & m_0) + (~~val >> 4 & ~m_0);
  }
  if ((parity & 1) == 0) {
    centerperm[5] = val;
  }
   else {
    centerperm[5] = centerperm[4];
    centerperm[4] = val;
  }
  if (move == 0) {
    t = centerperm[0];
    centerperm[0] = centerperm[1];
    centerperm[1] = centerperm[3];
    centerperm[3] = t;
  }
   else if (move == 1) {
    t = centerperm[0];
    centerperm[0] = centerperm[4];
    centerperm[4] = centerperm[2];
    centerperm[2] = t;
  }
   else if (move == 2) {
    t = centerperm[1];
    centerperm[1] = centerperm[2];
    centerperm[2] = centerperm[5];
    centerperm[5] = t;
  }
   else if (move == 3) {
    t = centerperm[3];
    centerperm[3] = centerperm[5];
    centerperm[5] = centerperm[4];
    centerperm[4] = t;
  }
  val = 5517840;
  for (i_0 = 0; i_0 < 4; ++i_0) {
    v = centerperm[i_0] << 2;
    centerindex *= 6 - i_0;
    centerindex += ~~val >> v & 15;
    val = toInt(sub(fromInt(val), shl(P111110_longLit, v)));
  }
  return centerindex * 12 + cornerpermmv[cornerindex][move];
}

function gettwstmv(idx, move){
  var fixedtwst, i_0, t, twst;
  fixedtwst = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 4, 1);
  twst = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 4, 1);
  for (i_0 = 0; i_0 < 4; ++i_0) {
    fixedtwst[i_0] = idx % 3;
    idx = ~~(idx / 3);
  }
  for (i_0 = 0; i_0 < 3; ++i_0) {
    twst[i_0] = idx % 3;
    idx = ~~(idx / 3);
  }
  twst[3] = (6 - twst[0] - twst[1] - twst[2]) % 3;
  fixedtwst[move] = (fixedtwst[move] + 1) % 3;
  switch (move) {
    case 0:
      t = twst[0];
      twst[0] = twst[2] + 2;
      twst[2] = twst[1] + 2;
      twst[1] = t + 2;
      break;
    case 1:
      t = twst[0];
      twst[0] = twst[1] + 2;
      twst[1] = twst[3] + 2;
      twst[3] = t + 2;
      break;
    case 2:
      t = twst[0];
      twst[0] = twst[3] + 2;
      twst[3] = twst[2] + 2;
      twst[2] = t + 2;
      break;
    case 3:
      t = twst[1];
      twst[1] = twst[2] + 2;
      twst[2] = twst[3] + 2;
      twst[3] = t + 2;
  }
  for (i_0 = 2; i_0 >= 0; --i_0) {
    idx = idx * 3 + twst[i_0] % 3;
  }
  for (i_0 = 3; i_0 >= 0; --i_0) {
    idx = idx * 3 + fixedtwst[i_0];
  }
  return idx;
}

function init_6(){
  var c, i_0, j, l_0, m_0, p_0, q;
  for (i_0 = 0; i_0 < 4320; ++i_0) {
    permprun[i_0] = -1;
    for (j = 0; j < 4; ++j) {
      permmv[i_0][j] = getpermmv(i_0, j) & 65535;
    }
  }
  for (i_0 = 0; i_0 < 2187; ++i_0) {
    twstprun[i_0] = -1;
    for (j = 0; j < 4; ++j) {
      twstmv[i_0][j] = gettwstmv(i_0, j) & 65535;
    }
  }
  permprun[0] = 0;
  for (l_0 = 0; l_0 < 6; ++l_0) {
    for (p_0 = 0; p_0 < 4320; ++p_0) {
      if (permprun[p_0] == l_0) {
        for (m_0 = 0; m_0 < 4; ++m_0) {
          q = p_0;
          for (c = 0; c < 2; ++c) {
            q = permmv[q][m_0];
            permprun[q] == -1 && (permprun[q] = ~~(l_0 + 1 << 24) >> 24);
          }
        }
      }
    }
  }
  twstprun[0] = 0;
  for (l_0 = 0; l_0 < 6; ++l_0) {
    for (p_0 = 0; p_0 < 2187; ++p_0) {
      if (twstprun[p_0] == l_0) {
        for (m_0 = 0; m_0 < 4; ++m_0) {
          q = p_0;
          for (c = 0; c < 2; ++c) {
            q = twstmv[q][m_0];
            twstprun[q] == -1 && (twstprun[q] = ~~(l_0 + 1 << 24) >> 24);
          }
        }
      }
    }
  }
}

defineSeed(342, 1, {}, SkewbSolver_0);
_.solution_length = -1;
var cornerpermmv, fact_3, ori_0, permmv, permprun, twstmv, twstprun;
function SkewbSolver$SkewbSolverState_0(){
}

defineSeed(343, 1, {}, SkewbSolver$SkewbSolverState_0);
_.perm = 0;
_.twst = 0;
function $clinit_SquareOnePuzzle(){
  $clinit_SquareOnePuzzle = nullMethod;
  var bottom, top_0, turn;
  $clinit_Puzzle();
  defaultColorScheme_3 = new HashMap_0;
  defaultColorScheme_3.put('B', new Color_1(255, 128, 0));
  defaultColorScheme_3.put('D', ($clinit_Color() , WHITE));
  defaultColorScheme_3.put('F', RED);
  defaultColorScheme_3.put('L', BLUE);
  defaultColorScheme_3.put('R', GREEN);
  defaultColorScheme_3.put('U', YELLOW);
  RADIUS_MULTIPLIER = Math.sqrt(2) * Math.cos(0.2617993877991494);
  costsByMove = new HashMap_0;
  for (top_0 = -5; top_0 <= 6; ++top_0) {
    for (bottom = -5; bottom <= 6; ++bottom) {
      if (top_0 == 0 && bottom == 0) {
        continue;
      }
      turn = '(' + top_0 + ',' + bottom + ')';
      costsByMove.put(turn, valueOf_0(1));
    }
  }
  costsByMove.put('/', valueOf_0(1));
}

function $drawFace(g, transform, face, x, y, colorScheme){
  var ch;
  for (ch = 0; ch < 12; ++ch) {
    ch < 11 && face[ch] == face[ch + 1] && ++ch;
    $drawPiece(g, transform, face[ch], x, y, colorScheme);
  }
}

function $drawPiece(g, transform, piece, x, y, colorScheme){
  var ch, cls, corner, degree, p_0, p_1, tempx, tempy, tempY, side1, side2, p_2, tempx_0, side;
  corner = (piece + (piece <= 7?0:1)) % 2 == 0;
  degree = 30 * (corner?2:1);
  p_0 = corner?(p_1 = new Path_0 , $moveTo(p_1, 0, 0) , $lineTo(p_1, 32, 0) , tempx = 32 * (1 + Math.cos(1.3089969389957472) / Math.sqrt(2)) , tempy = 32 * Math.sin(1.3089969389957472) / Math.sqrt(2) , $lineTo(p_1, tempx, tempy) , tempY = Math.sqrt(3) * 32 / 2 , $lineTo(p_1, 16, tempY) , azzert_0(!!p_1.commands) , $add_0(p_1.commands, new Path$Command_0(4, null)) , $translate(p_1, x, y) , side1 = new Path_0 , $moveTo(side1, 32, 0) , $lineTo(side1, 44.8, 0) , $lineTo(side1, 1.4 * tempx, 1.4 * tempy) , $lineTo(side1, tempx, tempy) , azzert_0(!!side1.commands) , $add_0(side1.commands, new Path$Command_0(4, null)) , $translate(side1, x, y) , side2 = new Path_0 , $moveTo(side2, 1.4 * tempx, 1.4 * tempy) , $lineTo(side2, tempx, tempy) , $lineTo(side2, 16, tempY) , $lineTo(side2, 22.4, 1.4 * tempY) , azzert_0(!!side2.commands) , $add_0(side2.commands, new Path$Command_0(4, null)) , $translate(side2, x, y) , initValues(_3Lnet_gnehzr_tnoodle_svglite_Path_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$Path, [p_1, side1, side2])):(p_2 = new Path_0 , $moveTo(p_2, 0, 0) , $lineTo(p_2, 32, 0) , tempx_0 = Math.sqrt(3) * 32 / 2 , $lineTo(p_2, tempx_0, 16) , azzert_0(!!p_2.commands) , $add_0(p_2.commands, new Path$Command_0(4, null)) , $translate(p_2, x, y) , side = new Path_0 , $moveTo(side, 32, 0) , $lineTo(side, 44.8, 0) , $lineTo(side, 1.4 * tempx_0, 22.4) , $lineTo(side, tempx_0, 16) , azzert_0(!!side.commands) , $add_0(side.commands, new Path$Command_0(4, null)) , $translate(side, x, y) , initValues(_3Lnet_gnehzr_tnoodle_svglite_Path_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$Path, [p_2, side]));
  cls = $getPieceColors(piece, colorScheme);
  for (ch = cls.length - 1; ch >= 0; --ch) {
    $setFill(p_0[ch], cls[ch]);
    $setStroke_0(p_0[ch], ($clinit_Color() , BLACK));
    !transform?$setToIdentity(p_0[ch].transform):$setTransform(p_0[ch].transform, transform);
    $add_0(g.children, p_0[ch]);
  }
  $concatenate(transform, getRotateInstance_0(degree * 0.017453292519943295, x, y));
  return degree;
}

function $getPieceColors(piece, colorScheme){
  var a, b, t, top_0, up;
  up = piece <= 7;
  top_0 = up?colorScheme[4]:colorScheme[5];
  if ((piece + (piece <= 7?0:1)) % 2 == 0) {
    up || (piece = 15 - piece);
    a = colorScheme[(~~(piece / 2) + 3) % 4];
    b = colorScheme[~~(piece / 2)];
    if (!up) {
      t = a;
      a = b;
      b = t;
    }
    return initValues(_3Lnet_gnehzr_tnoodle_svglite_Color_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$Color, [top_0, a, b]);
  }
   else {
    up || (piece = 14 - piece);
    return initValues(_3Lnet_gnehzr_tnoodle_svglite_Color_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$Color, [top_0, colorScheme[~~(piece / 2)]]);
  }
}

function SquareOnePuzzle_0(){
  $clinit_SquareOnePuzzle();
  Puzzle_0.call(this);
  this.wcaMinScrambleDistance = 11;
}

defineSeed(344, 275, makeCastMap([Q$Puzzle, Q$Exportable, Q$SquareOnePuzzle]), SquareOnePuzzle_0);
_.generateRandomMoves_0 = function generateRandomMoves_10(r){
  var e, s, scramble, state;
  s = new Search_2;
  scramble = $trim($solution_0(s, randomCube(r)));
  try {
    state = $applyAlgorithm(new SquareOnePuzzle$SquareOneState_0(this), scramble);
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, Q$InvalidScrambleException)) {
      e = $e0;
      azzert_3(false, e);
      return null;
    }
     else 
      throw $e0;
  }
  return new PuzzleStateAndGenerator_0(state, scramble);
}
;
_.getDefaultColorScheme_0 = function getDefaultColorScheme_4(){
  return new HashMap_1(defaultColorScheme_3);
}
;
_.getLongName_0 = function getLongName_8(){
  return 'Square-1';
}
;
_.getPreferredSize_0 = function getPreferredSize_5(){
  return new Dimension_0(round_int(2 * RADIUS_MULTIPLIER * 1.4 * 32), round_int(4 * RADIUS_MULTIPLIER * 1.4 * 32));
}
;
_.getRandomMoveCount = function getRandomMoveCount_4(){
  return 40;
}
;
_.getShortName_0 = function getShortName_8(){
  return 'sq1';
}
;
_.getSolvedState_0 = function getSolvedState_5(){
  return new SquareOnePuzzle$SquareOneState_0(this);
}
;
var RADIUS_MULTIPLIER, costsByMove, defaultColorScheme_3;
function $canSlash(this$static){
  if (this$static.pieces[0] == this$static.pieces[11]) {
    return false;
  }
  if (this$static.pieces[6] == this$static.pieces[5]) {
    return false;
  }
  if (this$static.pieces[12] == this$static.pieces[23]) {
    return false;
  }
  if (this$static.pieces[18] == this$static.pieces[17]) {
    return false;
  }
  return true;
}

function $doRotateTopAndBottom(this$static, top_0, bottom){
  var i_0, newPieces, t;
  top_0 = modulo(-top_0, 12);
  newPieces = clone(this$static.pieces);
  t = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 12, 1);
  for (i_0 = 0; i_0 < 12; ++i_0) {
    t[i_0] = newPieces[i_0];
  }
  for (i_0 = 0; i_0 < 12; ++i_0) {
    newPieces[i_0] = t[(top_0 + i_0) % 12];
  }
  bottom = modulo(-bottom, 12);
  for (i_0 = 0; i_0 < 12; ++i_0) {
    t[i_0] = newPieces[i_0 + 12];
  }
  for (i_0 = 0; i_0 < 12; ++i_0) {
    newPieces[i_0 + 12] = t[(bottom + i_0) % 12];
  }
  return newPieces;
}

function $doSlash(this$static){
  var c, i_0, newPieces;
  newPieces = clone(this$static.pieces);
  for (i_0 = 0; i_0 < 6; ++i_0) {
    c = newPieces[i_0 + 12];
    newPieces[i_0 + 12] = newPieces[i_0 + 6];
    newPieces[i_0 + 6] = c;
  }
  return newPieces;
}

function $getSuccessorsByName_0(this$static){
  var bottom, newPieces, successors, top_0, turn;
  successors = new LinkedHashMap_0;
  for (top_0 = -5; top_0 <= 6; ++top_0) {
    for (bottom = -5; bottom <= 6; ++bottom) {
      if (top_0 == 0 && bottom == 0) {
        continue;
      }
      newPieces = $doRotateTopAndBottom(this$static, top_0, bottom);
      turn = '(' + top_0 + ',' + bottom + ')';
      $put_0(successors, turn, new SquareOnePuzzle$SquareOneState_1(this$static.this$0, this$static.sliceSolved, newPieces));
    }
  }
  $canSlash(this$static) && $put_0(successors, '/', new SquareOnePuzzle$SquareOneState_1(this$static.this$0, !this$static.sliceSolved, $doSlash(this$static)));
  return successors;
}

function SquareOnePuzzle$SquareOneState_0(this$0){
  this.this$0 = this$0;
  this.this$0_0 = this$0;
  this.sliceSolved = true;
  this.pieces = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [0, 0, 1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 8, 9, 9, 10, 11, 11, 12, 13, 13, 14, 15, 15]);
}

function SquareOnePuzzle$SquareOneState_1(this$0, sliceSolved, pieces){
  this.this$0 = this$0;
  this.this$0_0 = this$0;
  this.sliceSolved = sliceSolved;
  this.pieces = pieces;
}

defineSeed(345, 277, makeCastMap([Q$Puzzle$PuzzleState, Q$SquareOnePuzzle$SquareOneState]), SquareOnePuzzle$SquareOneState_0, SquareOnePuzzle$SquareOneState_1);
_.drawScramble = function drawScramble_4(colorSchemeMap){
  var colorScheme, corner_width, dim, edge_width, g, half_square_width, height, i_0, left_mid, right_mid, transform, width, x, y;
  g = new Svg_0(new Dimension_0(($clinit_SquareOnePuzzle() , round_int(2 * RADIUS_MULTIPLIER * 1.4 * 32)), round_int(4 * RADIUS_MULTIPLIER * 1.4 * 32)));
  $setStroke(g);
  colorScheme = initDim(_3Lnet_gnehzr_tnoodle_svglite_Color_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1]), Q$Color, 6, 0);
  for (i_0 = 0; i_0 < colorScheme.length; ++i_0) {
    colorScheme[i_0] = dynamicCast(colorSchemeMap.get(charToString('LBRFUD'.charCodeAt(i_0)) + ''), Q$Color);
  }
  dim = new Dimension_0(round_int(2 * RADIUS_MULTIPLIER * 1.4 * 32), round_int(4 * RADIUS_MULTIPLIER * 1.4 * 32));
  width = dim.width;
  height = dim.height;
  half_square_width = 32 * RADIUS_MULTIPLIER * 1.4 / Math.sqrt(2);
  edge_width = 89.6 * Math.sin(0.2617993877991494);
  corner_width = half_square_width - edge_width / 2;
  left_mid = new Rectangle_0(width / 2 - half_square_width, height / 2 - 6.399999999999999, corner_width, 12.799999999999997);
  $setFill(left_mid, colorScheme[3]);
  if (this.sliceSolved) {
    right_mid = new Rectangle_0(width / 2 - half_square_width, height / 2 - 6.399999999999999, 2 * corner_width + edge_width, 12.799999999999997);
    $setFill(right_mid, colorScheme[3]);
  }
   else {
    right_mid = new Rectangle_0(width / 2 - half_square_width, height / 2 - 6.399999999999999, corner_width + edge_width, 12.799999999999997);
    $setFill(right_mid, colorScheme[1]);
  }
  $add_0(g.children, right_mid);
  $add_0(g.children, left_mid);
  right_mid = new Rectangle_1(right_mid);
  $setStroke_0(right_mid, ($clinit_Color() , BLACK));
  azzert('fill' != 'style');
  right_mid.attributes.put('fill', 'none');
  left_mid = new Rectangle_1(left_mid);
  $setStroke_0(left_mid, BLACK);
  azzert('fill' != 'style');
  left_mid.attributes.put('fill', 'none');
  $add_0(g.children, right_mid);
  $add_0(g.children, left_mid);
  x = width / 2;
  y = height / 4;
  transform = getRotateInstance_0(1.8325957145940461, x, y);
  $drawFace(g, transform, this.pieces, x, y, colorScheme);
  y *= 3;
  transform = getRotateInstance_0(-1.8325957145940461, x, y);
  $drawFace(g, transform, copyOfRange(this.pieces, this.pieces.length), x, y, colorScheme);
  return g;
}
;
_.equals$ = function equals_33(other){
  var o;
  o = dynamicCast(other, Q$SquareOnePuzzle$SquareOneState);
  return equals_18(this.pieces, o.pieces) && this.sliceSolved == o.sliceSolved;
}
;
_.getMoveCost = function getMoveCost_0(move){
  return dynamicCast(($clinit_SquareOnePuzzle() , costsByMove).get(move), Q$Integer).value;
}
;
_.getScrambleSuccessors = function getScrambleSuccessors_2(){
  var iter, key, state, successors;
  successors = $getSuccessorsByName_0(this);
  iter = $iterator($keySet(successors));
  while (iter.val$outerIter.hasNext()) {
    key = dynamicCast($next_0(iter), Q$String);
    state = dynamicCast($get_5(successors, key), Q$SquareOnePuzzle$SquareOneState);
    $canSlash(state) || iter.val$outerIter.remove_0();
  }
  return successors;
}
;
_.getSuccessorsByName = function getSuccessorsByName_4(){
  return $getSuccessorsByName_0(this);
}
;
_.hashCode$ = function hashCode_34(){
  return hashCode_19(this.pieces) ^ (this.sliceSolved?1:0);
}
;
_.toString$ = function toString_44(){
  return 'sliceSolved: ' + this.sliceSolved + ' ' + toString_24(this.pieces);
}
;
_.pieces = null;
_.sliceSolved = false;
_.this$0 = null;
function $export_11(this$static){
  if (!exported_11) {
    exported_11 = true;
    $clinit_ExporterUtil();
    $addExporter(impl_4, Lpuzzle_SquareOnePuzzle_2_classLit, this$static);
    $export0_11(this$static);
  }
}

function $export0_11(this$static){
  var pkg = declarePackage('puzzle.SquareOnePuzzle');
  var __0, __ = this$static;
  $wnd.puzzle.SquareOnePuzzle = $entry(function(){
    var g, j = this, a = arguments;
    a.length == 1 && __.isAssignable(a[0])?(g = a[0]):a.length == 0 && (g = new SquareOnePuzzle_0);
    j.g = g;
    setWrapper(g, j);
    return j;
  }
  );
  __0 = $wnd.puzzle.SquareOnePuzzle.prototype = new Object;
  __0.generateRandomMoves = $entry(function(a0){
    return this.g.generateRandomMoves_0(gwtInstance(a0));
  }
  );
  __0.generateScramble = $entry(function(){
    return this.g.generateScramble_0();
  }
  );
  __0.generateScrambles = $entry(function(a0){
    return wrap(this.g.generateScrambles_0(a0));
  }
  );
  __0.generateSeededScramble = $entry(function(a0){
    return this.g.generateSeededScramble_0(a0);
  }
  );
  __0.generateSeededScrambles = $entry(function(a0, a1){
    return wrap(this.g.generateSeededScrambles_0(a0, a1));
  }
  );
  __0.getDefaultColorScheme = $entry(function(){
    return this.g.getDefaultColorScheme_0();
  }
  );
  __0.getFaceNames = $entry(function(){
    return wrap(this.g.getFaceNames_0());
  }
  );
  __0.getLongName = $entry(function(){
    return this.g.getLongName_0();
  }
  );
  __0.getPreferredSize = $entry(function(a0, a1){
    return runDispatch(this.g, Lpuzzle_SquareOnePuzzle_2_classLit, 0, arguments, false, false)[0];
  }
  );
  __0.getShortName = $entry(function(){
    return this.g.getShortName_0();
  }
  );
  __0.getSolvedState = $entry(function(){
    return this.g.getSolvedState_0();
  }
  );
  __0.toString = $entry(function(){
    return this.g.toString$();
  }
  );
  registerDispatchMap(Lpuzzle_SquareOnePuzzle_2_classLit, {0:{0:[[function(){
    return this.getPreferredSize_0.apply(this, arguments);
  }
  , null, undefined]], 2:[[function(){
    return this.getPreferredSize_1.apply(this, arguments);
  }
  , null, undefined, 'number', 'number']]}}, false);
  if (pkg)
    for (p in pkg)
      $wnd.puzzle.SquareOnePuzzle[p] === undefined && ($wnd.puzzle.SquareOnePuzzle[p] = pkg[p]);
}

function SquareOnePuzzleExporterImpl_0(){
  $export_11(this);
}

defineSeed(346, 1, {}, SquareOnePuzzleExporterImpl_0);
_.isAssignable = function isAssignable_11(o){
  return o != null && instanceOf(o, Q$SquareOnePuzzle);
}
;
var exported_11 = false;
function SquareOneUnfilteredPuzzle_0(){
  $clinit_SquareOnePuzzle();
  SquareOnePuzzle_0.call(this);
  this.wcaMinScrambleDistance = 0;
}

defineSeed(347, 344, makeCastMap([Q$Puzzle, Q$Exportable, Q$SquareOnePuzzle, Q$SquareOneUnfilteredPuzzle]), SquareOneUnfilteredPuzzle_0);
_.getLongName_0 = function getLongName_9(){
  return 'Square-1 (fast, unofficial)';
}
;
_.getShortName_0 = function getShortName_9(){
  return 'sq1fast';
}
;
function $export_12(this$static){
  if (!exported_12) {
    exported_12 = true;
    $clinit_ExporterUtil();
    $addExporter(impl_4, Lpuzzle_SquareOneUnfilteredPuzzle_2_classLit, this$static);
    $export0_12(this$static);
  }
}

function $export0_12(this$static){
  var pkg = declarePackage('puzzle.SquareOneUnfilteredPuzzle');
  var __0, __ = this$static;
  $wnd.puzzle.SquareOneUnfilteredPuzzle = $entry(function(){
    var g, j = this, a = arguments;
    a.length == 1 && __.isAssignable(a[0])?(g = a[0]):a.length == 0 && (g = new SquareOneUnfilteredPuzzle_0);
    j.g = g;
    setWrapper(g, j);
    return j;
  }
  );
  __0 = $wnd.puzzle.SquareOneUnfilteredPuzzle.prototype = new Object;
  __0.generateRandomMoves = $entry(function(a0){
    return this.g.generateRandomMoves_0(gwtInstance(a0));
  }
  );
  __0.generateScramble = $entry(function(){
    return this.g.generateScramble_0();
  }
  );
  __0.generateScrambles = $entry(function(a0){
    return wrap(this.g.generateScrambles_0(a0));
  }
  );
  __0.generateSeededScramble = $entry(function(a0){
    return this.g.generateSeededScramble_0(a0);
  }
  );
  __0.generateSeededScrambles = $entry(function(a0, a1){
    return wrap(this.g.generateSeededScrambles_0(a0, a1));
  }
  );
  __0.getDefaultColorScheme = $entry(function(){
    return this.g.getDefaultColorScheme_0();
  }
  );
  __0.getFaceNames = $entry(function(){
    return wrap(this.g.getFaceNames_0());
  }
  );
  __0.getLongName = $entry(function(){
    return this.g.getLongName_0();
  }
  );
  __0.getPreferredSize = $entry(function(a0, a1){
    return runDispatch(this.g, Lpuzzle_SquareOneUnfilteredPuzzle_2_classLit, 0, arguments, false, false)[0];
  }
  );
  __0.getShortName = $entry(function(){
    return this.g.getShortName_0();
  }
  );
  __0.getSolvedState = $entry(function(){
    return this.g.getSolvedState_0();
  }
  );
  __0.toString = $entry(function(){
    return this.g.toString$();
  }
  );
  registerDispatchMap(Lpuzzle_SquareOneUnfilteredPuzzle_2_classLit, {0:{0:[[function(){
    return this.getPreferredSize_0.apply(this, arguments);
  }
  , null, undefined]], 2:[[function(){
    return this.getPreferredSize_1.apply(this, arguments);
  }
  , null, undefined, 'number', 'number']]}}, false);
  if (pkg)
    for (p in pkg)
      $wnd.puzzle.SquareOneUnfilteredPuzzle[p] === undefined && ($wnd.puzzle.SquareOneUnfilteredPuzzle[p] = pkg[p]);
}

function SquareOneUnfilteredPuzzleExporterImpl_0(){
  $export_12(this);
}

defineSeed(348, 1, {}, SquareOneUnfilteredPuzzleExporterImpl_0);
_.isAssignable = function isAssignable_12(o){
  return o != null && instanceOf(o, Q$SquareOneUnfilteredPuzzle);
}
;
var exported_12 = false;
function ThreeByThreeCubeFewestMovesPuzzle_0(){
  $clinit_ThreeByThreeCubePuzzle();
  ThreeByThreeCubePuzzle_0.call(this);
}

defineSeed(349, 332, makeCastMap([Q$Puzzle, Q$Exportable, Q$CubePuzzle, Q$ThreeByThreeCubeFewestMovesPuzzle, Q$ThreeByThreeCubePuzzle]), ThreeByThreeCubeFewestMovesPuzzle_0);
_.generateRandomMoves_0 = function generateRandomMoves_11(r){
  var ab, e, psag, scramblePrefix, scrambleSuffix, solutionFirstAxisRestriction, solutionLastAxisRestriction;
  scramblePrefix = splitAlgorithm("R' U' F");
  scrambleSuffix = splitAlgorithm("R' U' F");
  solutionLastAxisRestriction = scramblePrefix[scramblePrefix.length - 1].substr(0, 1 - 0);
  solutionFirstAxisRestriction = scrambleSuffix[0].substr(0, 1 - 0);
  psag = $generateRandomMoves_1(this, r, solutionFirstAxisRestriction, solutionLastAxisRestriction);
  ab = new AlgorithmBuilder_0(this, 0);
  try {
    $appendAlgorithms(ab, scramblePrefix);
    $appendAlgorithm(ab, psag.generator);
    $appendAlgorithms(ab, scrambleSuffix);
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, Q$InvalidMoveException)) {
      e = $e0;
      azzert_3(false, e);
      return null;
    }
     else 
      throw $e0;
  }
  return new PuzzleStateAndGenerator_0((azzert_1(ab.states.size == ab.moves.size + 1) , dynamicCast($get_4(ab.states, ab.states.size - 1), Q$Puzzle$PuzzleState)), join(ab.moves, ' '));
}
;
_.getLongName_0 = function getLongName_10(){
  return '3x3x3 Fewest Moves';
}
;
_.getShortName_0 = function getShortName_10(){
  return '333fm';
}
;
function $export_13(this$static){
  if (!exported_13) {
    exported_13 = true;
    $clinit_ExporterUtil();
    $addExporter(impl_4, Lpuzzle_ThreeByThreeCubeFewestMovesPuzzle_2_classLit, this$static);
    $export0_13(this$static);
  }
}

function $export0_13(this$static){
  var pkg = declarePackage('puzzle.ThreeByThreeCubeFewestMovesPuzzle');
  var __0, __ = this$static;
  $wnd.puzzle.ThreeByThreeCubeFewestMovesPuzzle = $entry(function(){
    var g, j = this, a = arguments;
    a.length == 1 && __.isAssignable(a[0])?(g = a[0]):a.length == 0 && (g = new ThreeByThreeCubeFewestMovesPuzzle_0);
    j.g = g;
    setWrapper(g, j);
    return j;
  }
  );
  __0 = $wnd.puzzle.ThreeByThreeCubeFewestMovesPuzzle.prototype = new Object;
  __0.generateRandomMoves = $entry(function(a0, a1, a2){
    return runDispatch(this.g, Lpuzzle_ThreeByThreeCubeFewestMovesPuzzle_2_classLit, 1, arguments, false, false)[0];
  }
  );
  __0.generateScramble = $entry(function(){
    return this.g.generateScramble_0();
  }
  );
  __0.generateScrambles = $entry(function(a0){
    return wrap(this.g.generateScrambles_0(a0));
  }
  );
  __0.generateSeededScramble = $entry(function(a0){
    return this.g.generateSeededScramble_0(a0);
  }
  );
  __0.generateSeededScrambles = $entry(function(a0, a1){
    return wrap(this.g.generateSeededScrambles_0(a0, a1));
  }
  );
  __0.getDefaultColorScheme = $entry(function(){
    return this.g.getDefaultColorScheme_0();
  }
  );
  __0.getFaceNames = $entry(function(){
    return wrap(this.g.getFaceNames_0());
  }
  );
  __0.getLongName = $entry(function(){
    return this.g.getLongName_0();
  }
  );
  __0.getPreferredSize = $entry(function(a0, a1){
    return runDispatch(this.g, Lpuzzle_ThreeByThreeCubeFewestMovesPuzzle_2_classLit, 0, arguments, false, false)[0];
  }
  );
  __0.getShortName = $entry(function(){
    return this.g.getShortName_0();
  }
  );
  __0.getSolvedState = $entry(function(){
    return this.g.getSolvedState_1();
  }
  );
  __0.solveIn = $entry(function(a0, a1, a2, a3){
    return this.g.solveIn_2(gwtInstance(a0), a1, a2, a3);
  }
  );
  __0.toString = $entry(function(){
    return this.g.toString$();
  }
  );
  registerDispatchMap(Lpuzzle_ThreeByThreeCubeFewestMovesPuzzle_2_classLit, {0:{0:[[function(){
    return this.getPreferredSize_0.apply(this, arguments);
  }
  , null, undefined]], 2:[[function(){
    return this.getPreferredSize_1.apply(this, arguments);
  }
  , null, undefined, 'number', 'number']]}, 1:{1:[[function(){
    return this.generateRandomMoves_0.apply(this, arguments);
  }
  , null, undefined, Ljava_util_Random_2_classLit]], 3:[[function(){
    return this.generateRandomMoves_1.apply(this, arguments);
  }
  , null, undefined, Ljava_util_Random_2_classLit, 'string', 'string']]}}, false);
  if (pkg)
    for (p in pkg)
      $wnd.puzzle.ThreeByThreeCubeFewestMovesPuzzle[p] === undefined && ($wnd.puzzle.ThreeByThreeCubeFewestMovesPuzzle[p] = pkg[p]);
}

function ThreeByThreeCubeFewestMovesPuzzleExporterImpl_0(){
  $export_13(this);
}

defineSeed(350, 1, {}, ThreeByThreeCubeFewestMovesPuzzleExporterImpl_0);
_.isAssignable = function isAssignable_13(o){
  return o != null && instanceOf(o, Q$ThreeByThreeCubeFewestMovesPuzzle);
}
;
var exported_13 = false;
function ThreeByThreeCubePuzzle$1_0(){
}

defineSeed(351, 193, {}, ThreeByThreeCubePuzzle$1_0);
_.initialValue = function initialValue_1(){
  return new Search_0;
}
;
function $export_14(this$static){
  if (!exported_14) {
    exported_14 = true;
    $clinit_ExporterUtil();
    $addExporter(impl_4, Lpuzzle_ThreeByThreeCubePuzzle_2_classLit, this$static);
    $export0_14(this$static);
  }
}

function $export0_14(this$static){
  var pkg = declarePackage('puzzle.ThreeByThreeCubePuzzle');
  var __0, __ = this$static;
  $wnd.puzzle.ThreeByThreeCubePuzzle = $entry(function(){
    var g, j = this, a = arguments;
    a.length == 1 && __.isAssignable(a[0])?(g = a[0]):a.length == 0 && (g = new ThreeByThreeCubePuzzle_0);
    j.g = g;
    setWrapper(g, j);
    return j;
  }
  );
  __0 = $wnd.puzzle.ThreeByThreeCubePuzzle.prototype = new Object;
  __0.generateRandomMoves = $entry(function(a0, a1, a2){
    return runDispatch(this.g, Lpuzzle_ThreeByThreeCubePuzzle_2_classLit, 1, arguments, false, false)[0];
  }
  );
  __0.generateScramble = $entry(function(){
    return this.g.generateScramble_0();
  }
  );
  __0.generateScrambles = $entry(function(a0){
    return wrap(this.g.generateScrambles_0(a0));
  }
  );
  __0.generateSeededScramble = $entry(function(a0){
    return this.g.generateSeededScramble_0(a0);
  }
  );
  __0.generateSeededScrambles = $entry(function(a0, a1){
    return wrap(this.g.generateSeededScrambles_0(a0, a1));
  }
  );
  __0.getDefaultColorScheme = $entry(function(){
    return this.g.getDefaultColorScheme_0();
  }
  );
  __0.getFaceNames = $entry(function(){
    return wrap(this.g.getFaceNames_0());
  }
  );
  __0.getLongName = $entry(function(){
    return this.g.getLongName_0();
  }
  );
  __0.getPreferredSize = $entry(function(a0, a1){
    return runDispatch(this.g, Lpuzzle_ThreeByThreeCubePuzzle_2_classLit, 0, arguments, false, false)[0];
  }
  );
  __0.getShortName = $entry(function(){
    return this.g.getShortName_0();
  }
  );
  __0.getSolvedState = $entry(function(){
    return this.g.getSolvedState_1();
  }
  );
  __0.solveIn = $entry(function(a0, a1, a2, a3){
    return this.g.solveIn_2(gwtInstance(a0), a1, a2, a3);
  }
  );
  __0.toString = $entry(function(){
    return this.g.toString$();
  }
  );
  registerDispatchMap(Lpuzzle_ThreeByThreeCubePuzzle_2_classLit, {0:{0:[[function(){
    return this.getPreferredSize_0.apply(this, arguments);
  }
  , null, undefined]], 2:[[function(){
    return this.getPreferredSize_1.apply(this, arguments);
  }
  , null, undefined, 'number', 'number']]}, 1:{1:[[function(){
    return this.generateRandomMoves_0.apply(this, arguments);
  }
  , null, undefined, Ljava_util_Random_2_classLit]], 3:[[function(){
    return this.generateRandomMoves_1.apply(this, arguments);
  }
  , null, undefined, Ljava_util_Random_2_classLit, 'string', 'string']]}}, false);
  if (pkg)
    for (p in pkg)
      $wnd.puzzle.ThreeByThreeCubePuzzle[p] === undefined && ($wnd.puzzle.ThreeByThreeCubePuzzle[p] = pkg[p]);
}

function ThreeByThreeCubePuzzleExporterImpl_0(){
  $export_14(this);
}

defineSeed(352, 1, {}, ThreeByThreeCubePuzzleExporterImpl_0);
_.isAssignable = function isAssignable_14(o){
  return o != null && instanceOf(o, Q$ThreeByThreeCubePuzzle);
}
;
var exported_14 = false;
function TwoByTwoCubePuzzle_0(){
  $clinit_CubePuzzle();
  CubePuzzle_0.call(this, 2);
  this.wcaMinScrambleDistance = 4;
  this.twoSolver = new TwoByTwoSolver_0;
}

defineSeed(353, 312, makeCastMap([Q$Puzzle, Q$Exportable, Q$CubePuzzle, Q$TwoByTwoCubePuzzle]), TwoByTwoCubePuzzle_0);
_.generateRandomMoves_0 = function generateRandomMoves_12(r){
  var ab, e, scramble, state, state_0;
  state = (state_0 = new TwoByTwoSolver$TwoByTwoState_0 , state_0.permutation = $nextInt(r, 5040) , state_0.orientation = $nextInt(r, 729) , state_0);
  scramble = $solve_1(this.twoSolver, state, 11, true, true);
  ab = new AlgorithmBuilder_0(this, 1);
  try {
    $appendAlgorithm(ab, scramble);
  }
   catch ($e0) {
    $e0 = caught($e0);
    if (instanceOf($e0, Q$InvalidMoveException)) {
      e = $e0;
      azzert_3(false, new InvalidScrambleException_0(scramble, e));
    }
     else 
      throw $e0;
  }
  return new PuzzleStateAndGenerator_0((azzert_1(ab.states.size == ab.moves.size + 1) , dynamicCast($get_4(ab.states, ab.states.size - 1), Q$Puzzle$PuzzleState)), join(ab.moves, ' '));
}
;
_.solveIn_0 = function solveIn_4(ps, n){
  var cs, solution;
  cs = dynamicCast(ps, Q$CubePuzzle$CubeState);
  solution = $solve_1(this.twoSolver, $toTwoByTwoState(cs), n, false, false);
  return solution;
}
;
_.twoSolver = null;
function $export_15(this$static){
  if (!exported_15) {
    exported_15 = true;
    $clinit_ExporterUtil();
    $addExporter(impl_4, Lpuzzle_TwoByTwoCubePuzzle_2_classLit, this$static);
    $export0_15(this$static);
  }
}

function $export0_15(this$static){
  var pkg = declarePackage('puzzle.TwoByTwoCubePuzzle');
  var __0, __ = this$static;
  $wnd.puzzle.TwoByTwoCubePuzzle = $entry(function(){
    var g, j = this, a = arguments;
    a.length == 1 && __.isAssignable(a[0])?(g = a[0]):a.length == 0 && (g = new TwoByTwoCubePuzzle_0);
    j.g = g;
    setWrapper(g, j);
    return j;
  }
  );
  __0 = $wnd.puzzle.TwoByTwoCubePuzzle.prototype = new Object;
  __0.generateRandomMoves = $entry(function(a0){
    return this.g.generateRandomMoves_0(gwtInstance(a0));
  }
  );
  __0.generateScramble = $entry(function(){
    return this.g.generateScramble_0();
  }
  );
  __0.generateScrambles = $entry(function(a0){
    return wrap(this.g.generateScrambles_0(a0));
  }
  );
  __0.generateSeededScramble = $entry(function(a0){
    return this.g.generateSeededScramble_0(a0);
  }
  );
  __0.generateSeededScrambles = $entry(function(a0, a1){
    return wrap(this.g.generateSeededScrambles_0(a0, a1));
  }
  );
  __0.getDefaultColorScheme = $entry(function(){
    return this.g.getDefaultColorScheme_0();
  }
  );
  __0.getFaceNames = $entry(function(){
    return wrap(this.g.getFaceNames_0());
  }
  );
  __0.getLongName = $entry(function(){
    return this.g.getLongName_0();
  }
  );
  __0.getPreferredSize = $entry(function(a0, a1){
    return runDispatch(this.g, Lpuzzle_TwoByTwoCubePuzzle_2_classLit, 0, arguments, false, false)[0];
  }
  );
  __0.getShortName = $entry(function(){
    return this.g.getShortName_0();
  }
  );
  __0.getSolvedState = $entry(function(){
    return this.g.getSolvedState_1();
  }
  );
  __0.toString = $entry(function(){
    return this.g.toString$();
  }
  );
  registerDispatchMap(Lpuzzle_TwoByTwoCubePuzzle_2_classLit, {0:{0:[[function(){
    return this.getPreferredSize_0.apply(this, arguments);
  }
  , null, undefined]], 2:[[function(){
    return this.getPreferredSize_1.apply(this, arguments);
  }
  , null, undefined, 'number', 'number']]}}, false);
  if (pkg)
    for (p in pkg)
      $wnd.puzzle.TwoByTwoCubePuzzle[p] === undefined && ($wnd.puzzle.TwoByTwoCubePuzzle[p] = pkg[p]);
}

function TwoByTwoCubePuzzleExporterImpl_0(){
  $export_15(this);
}

defineSeed(354, 1, {}, TwoByTwoCubePuzzleExporterImpl_0);
_.isAssignable = function isAssignable_15(o){
  return o != null && instanceOf(o, Q$TwoByTwoCubePuzzle);
}
;
var exported_15 = false;
function $clinit_TwoByTwoSolver(){
  $clinit_TwoByTwoSolver = nullMethod;
  moveToString_0 = initValues(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, ['U', 'U2', "U'", 'R', 'R2', "R'", 'F', 'F2', "F'"]);
  inverseMoveToString_0 = initValues(_3Ljava_lang_String_2_classLit, makeCastMap([Q$Serializable, Q$Object_$1, Q$String_$1]), Q$String, ["U'", 'U2', 'U', "R'", 'R2', 'R', "F'", 'F2', 'F']);
  fact_4 = initValues(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, [1, 1, 2, 6, 24, 120, 720]);
  movePerm = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [5040, 9], 2, 1);
  moveOrient = initDims([_3_3I_classLit, _3I_classLit], [makeCastMap([Q$int_$2, Q$Serializable, Q$Object_$1]), makeCastMap([Q$int_$1, Q$Serializable])], [Q$int_$1, -1], [729, 9], 2, 1);
  prunPerm_0 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 5040, 1);
  prunOrient_0 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 729, 1);
  initMoves_0();
  initPrun_0();
}

function $computeCost(this$static, solution, index, current_cost, grip){
  if (index < 0) {
    return current_cost;
  }
  switch (solution[index]) {
    case 0:
      return $computeCost(this$static, solution, index - 1, current_cost + 7, grip);
    case 1:
      return $computeCost(this$static, solution, index - 1, current_cost + 10, grip);
    case 2:
      return grip == 0?$computeCost(this$static, solution, index - 1, current_cost + 8, 0):grip == -1?min($computeCost(this$static, solution, index - 1, current_cost + 20 + 8, 0), $computeCost(this$static, solution, index - 1, current_cost + 20, -1)):$computeCost(this$static, solution, index - 1, current_cost + 20 + 8, 0);
    case 3:
      return grip > -1?$computeCost(this$static, solution, index - 1, current_cost + 6, grip - 1):$computeCost(this$static, solution, index - 1, current_cost + 20 + 6, -1);
    case 4:
      return grip != 0?$computeCost(this$static, solution, index - 1, current_cost + 10, -grip):min($computeCost(this$static, solution, index - 1, current_cost + 20 + 10, -1), $computeCost(this$static, solution, index - 1, current_cost + 20 + 10, 1));
    case 5:
      return grip < 1?$computeCost(this$static, solution, index - 1, current_cost + 6, grip + 1):$computeCost(this$static, solution, index - 1, current_cost + 20 + 6, 1);
    case 6:
      return grip != 0?$computeCost(this$static, solution, index - 1, current_cost + 19, grip):min($computeCost(this$static, solution, index - 1, current_cost + 20 + 19, -1), $computeCost(this$static, solution, index - 1, current_cost + 20 + 19, 1));
    case 7:
      return grip == -1?$computeCost(this$static, solution, index - 1, current_cost + 30, -1):$computeCost(this$static, solution, index - 1, current_cost + 20 + 30, -1);
    case 8:
      return grip == -1?$computeCost(this$static, solution, index - 1, current_cost + 10, -1):$computeCost(this$static, solution, index - 1, current_cost + 20 + 10, -1);
    default:azzert_1(false);
  }
  return -1;
}

function $search_1(this$static, perm, orient, depth, length_0, last_move, solution, best_solution){
  var cost, move, newOrient, newPerm, solutionFound;
  if (length_0 == 0) {
    if (perm == 0 && orient == 0) {
      cost = $computeCost(this$static, solution, depth, 0, 0);
      if (cost < best_solution[depth]) {
        arraycopy(solution, 0, best_solution, 0, depth);
        best_solution[depth] = cost;
      }
      return true;
    }
    return false;
  }
  if (prunPerm_0[perm] > length_0 || prunOrient_0[orient] > length_0) {
    return false;
  }
  solutionFound = false;
  for (move = 0; move < 9; ++move) {
    if (~~(move / 3) == ~~(last_move / 3)) {
      continue;
    }
    newPerm = movePerm[perm][move];
    newOrient = moveOrient[orient][move];
    solution[depth] = move;
    solutionFound = solutionFound | $search_1(this$static, newPerm, newOrient, depth + 1, length_0 - 1, move, solution, best_solution);
  }
  return solutionFound;
}

function $solve_1(this$static, state, desiredLength, exactLength, inverse){
  var best_solution, foundSolution, l_0, length_0, scramble, solution;
  solution = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 20, 1);
  best_solution = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 21, 1);
  foundSolution = false;
  length_0 = exactLength?desiredLength:0;
  while (length_0 <= desiredLength) {
    best_solution[length_0] = 42424242;
    if ($search_1(this$static, state.permutation, state.orientation, 0, length_0, 42, solution, best_solution)) {
      foundSolution = true;
      break;
    }
    ++length_0;
  }
  if (!foundSolution) {
    return null;
  }
  if (length_0 == 0) {
    return '';
  }
  scramble = new StringBuilder_1;
  if (inverse) {
    $append_5(scramble, inverseMoveToString_0[best_solution[length_0 - 1]]);
    for (l_0 = length_0 - 2; l_0 >= 0; --l_0) {
      $append_5((scramble.impl.append_2(scramble.data, ' ') , scramble), inverseMoveToString_0[best_solution[l_0]]);
    }
  }
   else {
    $append_5(scramble, moveToString_0[best_solution[0]]);
    for (l_0 = 1; l_0 < length_0; ++l_0) {
      $append_5((scramble.impl.append_2(scramble.data, ' ') , scramble), moveToString_0[best_solution[l_0]]);
    }
  }
  return scramble.impl.toString_0(scramble.data);
}

function TwoByTwoSolver_0(){
  $clinit_TwoByTwoSolver();
}

function cycle(cubies, a, b, c, d, times){
  var temp;
  temp = cubies[d];
  cubies[d] = cubies[c];
  cubies[c] = cubies[b];
  cubies[b] = cubies[a];
  cubies[a] = temp;
  times > 1 && cycle(cubies, a, b, c, d, times - 1);
}

function cycleAndOrient_0(cubies, a, b, c, d, times){
  var temp;
  temp = cubies[d];
  cubies[d] = (cubies[c] + 8) % 24;
  cubies[c] = (cubies[b] + 16) % 24;
  cubies[b] = (cubies[a] + 8) % 24;
  cubies[a] = (temp + 16) % 24;
  times > 1 && cycleAndOrient_0(cubies, a, b, c, d, times - 1);
}

function initMoves_0(){
  var cubies1, cubies2, move, newOrient, newPerm, orient, perm;
  cubies1 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 7, 1);
  cubies2 = initDim(_3I_classLit, makeCastMap([Q$int_$1, Q$Serializable]), -1, 7, 1);
  for (perm = 0; perm < 5040; ++perm) {
    unpackPerm(perm, cubies1);
    for (move = 0; move < 9; ++move) {
      arraycopy(cubies1, 0, cubies2, 0, 7);
      moveCubies(cubies2, move);
      newPerm = packPerm(cubies2);
      movePerm[perm][move] = newPerm;
    }
  }
  for (orient = 0; orient < 729; ++orient) {
    unpackOrient(orient, cubies1);
    for (move = 0; move < 9; ++move) {
      arraycopy(cubies1, 0, cubies2, 0, 7);
      moveCubies(cubies2, move);
      newOrient = packOrient(cubies2);
      moveOrient[orient][move] = newOrient;
    }
  }
}

function initPrun_0(){
  var done, length_0, move, newOrient, newPerm, orient, perm;
  for (perm = 0; perm < 5040; ++perm) {
    prunPerm_0[perm] = -1;
  }
  prunPerm_0[0] = 0;
  done = 1;
  for (length_0 = 0; done < 5040; ++length_0) {
    for (perm = 0; perm < 5040; ++perm) {
      if (prunPerm_0[perm] == length_0) {
        for (move = 0; move < 9; ++move) {
          newPerm = movePerm[perm][move];
          if (prunPerm_0[newPerm] == -1) {
            prunPerm_0[newPerm] = length_0 + 1;
            ++done;
          }
        }
      }
    }
  }
  for (orient = 0; orient < 729; ++orient) {
    prunOrient_0[orient] = -1;
  }
  prunOrient_0[0] = 0;
  done = 1;
  for (length_0 = 0; done < 729; ++length_0) {
    for (orient = 0; orient < 729; ++orient) {
      if (prunOrient_0[orient] == length_0) {
        for (move = 0; move < 9; ++move) {
          newOrient = moveOrient[orient][move];
          if (prunOrient_0[newOrient] == -1) {
            prunOrient_0[newOrient] = length_0 + 1;
            ++done;
          }
        }
      }
    }
  }
}

function moveCubies(cubies, move){
  var face, times;
  face = ~~(move / 3);
  times = move % 3 + 1;
  switch (face) {
    case 0:
      cycle(cubies, 1, 3, 2, 0, times);
      break;
    case 1:
      cycleAndOrient_0(cubies, 0, 2, 6, 4, times);
      break;
    case 2:
      cycleAndOrient_0(cubies, 1, 0, 4, 5, times);
      break;
    default:azzert_1(false);
  }
}

function packOrient(cubies){
  $clinit_TwoByTwoSolver();
  var i_0, ori;
  ori = 0;
  for (i_0 = 0; i_0 < 6; ++i_0) {
    ori = 3 * ori + (~~cubies[i_0] >> 3);
  }
  return ori;
}

function packPerm(cubies){
  $clinit_TwoByTwoSolver();
  var i_0, idx, v, val;
  idx = 0;
  val = 106181136;
  for (i_0 = 0; i_0 < 6; ++i_0) {
    v = (cubies[i_0] & 7) << 2;
    idx = (7 - i_0) * idx + (~~val >> v & 7);
    val -= 17895696 << v;
  }
  return idx;
}

function unpackOrient(ori, cubies){
  var i_0, sum_ori;
  sum_ori = 0;
  for (i_0 = 5; i_0 >= 0; --i_0) {
    cubies[i_0] = ori % 3 << 3;
    sum_ori += ori % 3;
    ori = ~~(ori / 3);
  }
  cubies[6] = (42424242 - sum_ori) % 3 << 3;
}

function unpackPerm(perm, cubies){
  var i_0, m_0, p_0, v, val;
  val = 106181136;
  for (i_0 = 0; i_0 < 6; ++i_0) {
    p_0 = fact_4[6 - i_0];
    v = ~~(perm / p_0);
    perm -= v * p_0;
    v <<= 2;
    cubies[i_0] = ~~val >> v & 7;
    m_0 = (1 << v) - 1;
    val = (val & m_0) + (~~val >> 4 & ~m_0);
  }
  cubies[6] = val;
}

defineSeed(355, 1, {}, TwoByTwoSolver_0);
var fact_4, inverseMoveToString_0, moveOrient, movePerm, moveToString_0, prunOrient_0, prunPerm_0;
function TwoByTwoSolver$TwoByTwoState_0(){
}

defineSeed(356, 1, {}, TwoByTwoSolver$TwoByTwoState_0);
_.orientation = 0;
_.permutation = 0;
var $entry = entry_0;
function gwtOnLoad(errFn, modName, modBase, softPermutationId){
  $moduleName = modName;
  $moduleBase = modBase;
  permutationId = softPermutationId;
  if (errFn)
    try {
      $entry(init)();
    }
     catch (e) {
      errFn(modName);
    }
   else {
    $entry(init)();
  }
}

var Ljava_lang_Object_2_classLit = createForClass('java.lang.', 'Object', 1, null), Lcom_google_gwt_core_client_JavaScriptObject_2_classLit = createForClass('com.google.gwt.core.client.', 'JavaScriptObject$', 9, Ljava_lang_Object_2_classLit), I_classLit = createForPrimitive('int', ' I'), _3I_classLit = createForArray('', '[I', 362, I_classLit), _3Ljava_lang_Object_2_classLit = createForArray('[Ljava.lang.', 'Object;', 360, Ljava_lang_Object_2_classLit), Z_classLit = createForPrimitive('boolean', ' Z'), _3Z_classLit = createForArray('', '[Z', 363, Z_classLit), Ljava_lang_Throwable_2_classLit = createForClass('java.lang.', 'Throwable', 8, Ljava_lang_Object_2_classLit), Ljava_lang_Exception_2_classLit = createForClass('java.lang.', 'Exception', 7, Ljava_lang_Throwable_2_classLit), Ljava_lang_RuntimeException_2_classLit = createForClass('java.lang.', 'RuntimeException', 6, Ljava_lang_Exception_2_classLit), Ljava_lang_StackTraceElement_2_classLit = createForClass('java.lang.', 'StackTraceElement', 188, Ljava_lang_Object_2_classLit), _3Ljava_lang_StackTraceElement_2_classLit = createForArray('[Ljava.lang.', 'StackTraceElement;', 364, Ljava_lang_StackTraceElement_2_classLit), Lcom_google_gwt_lang_LongLibBase$LongEmul_2_classLit = createForClass('com.google.gwt.lang.', 'LongLibBase$LongEmul', 83, Ljava_lang_Object_2_classLit), _3Lcom_google_gwt_lang_LongLibBase$LongEmul_2_classLit = createForArray('[Lcom.google.gwt.lang.', 'LongLibBase$LongEmul;', 365, Lcom_google_gwt_lang_LongLibBase$LongEmul_2_classLit), Lcom_google_gwt_lang_SeedUtil_2_classLit = createForClass('com.google.gwt.lang.', 'SeedUtil', 84, Ljava_lang_Object_2_classLit), Lcom_google_gwt_logging_client_LogConfiguration_2_classLit = createForClass('com.google.gwt.logging.client.', 'LogConfiguration', null, Ljava_lang_Object_2_classLit), Lcom_google_gwt_logging_client_LogConfiguration$LogConfigurationImplRegular_2_classLit = createForClass('com.google.gwt.logging.client.', 'LogConfiguration$LogConfigurationImplRegular', 97, Ljava_lang_Object_2_classLit), Lcom_google_gwt_logging_client_LogConfiguration$1_2_classLit = createForClass('com.google.gwt.logging.client.', 'LogConfiguration$1', 96, Ljava_lang_Object_2_classLit), Ljava_lang_Enum_2_classLit = createForClass('java.lang.', 'Enum', 46, Ljava_lang_Object_2_classLit), Ljava_lang_Error_2_classLit = createForClass('java.lang.', 'Error', 171, Ljava_lang_Throwable_2_classLit), Ljava_lang_AssertionError_2_classLit = createForClass('java.lang.', 'AssertionError', 170, Ljava_lang_Error_2_classLit), Ljava_lang_Boolean_2_classLit = createForClass('java.lang.', 'Boolean', 172, Ljava_lang_Object_2_classLit), B_classLit = createForPrimitive('byte', ' B'), Ljava_lang_Number_2_classLit = createForClass('java.lang.', 'Number', 177, Ljava_lang_Object_2_classLit), C_classLit = createForPrimitive('char', ' C'), _3C_classLit = createForArray('', '[C', 366, C_classLit), Ljava_lang_Class_2_classLit = createForClass('java.lang.', 'Class', 174, Ljava_lang_Object_2_classLit), D_classLit = createForPrimitive('double', ' D'), _3D_classLit = createForArray('', '[D', 367, D_classLit), Ljava_lang_Double_2_classLit = createForClass('java.lang.', 'Double', 176, Ljava_lang_Number_2_classLit), Ljava_lang_Integer_2_classLit = createForClass('java.lang.', 'Integer', 181, Ljava_lang_Number_2_classLit), _3Ljava_lang_Integer_2_classLit = createForArray('[Ljava.lang.', 'Integer;', 368, Ljava_lang_Integer_2_classLit), Ljava_lang_String_2_classLit = createForClass('java.lang.', 'String', 2, Ljava_lang_Object_2_classLit), _3Ljava_lang_String_2_classLit = createForArray('[Ljava.lang.', 'String;', 361, Ljava_lang_String_2_classLit), _3B_classLit = createForArray('', '[B', 369, B_classLit), Ljava_lang_ClassCastException_2_classLit = createForClass('java.lang.', 'ClassCastException', 175, Ljava_lang_RuntimeException_2_classLit), Ljava_lang_StringBuilder_2_classLit = createForClass('java.lang.', 'StringBuilder', 191, Ljava_lang_Object_2_classLit), Ljava_lang_ArrayStoreException_2_classLit = createForClass('java.lang.', 'ArrayStoreException', 169, Ljava_lang_RuntimeException_2_classLit), Lcom_google_gwt_core_client_JavaScriptException_2_classLit = createForClass('com.google.gwt.core.client.', 'JavaScriptException', 5, Ljava_lang_RuntimeException_2_classLit), Lcom_google_gwt_useragent_client_UserAgentAsserter_1UserAgentPropertyImplIe6_2_classLit = createForClass('com.google.gwt.useragent.client.', 'UserAgentAsserter_UserAgentPropertyImplIe6', 139, Ljava_lang_Object_2_classLit), Lcom_google_gwt_useragent_client_UserAgentAsserter_1UserAgentPropertyImplIe8_2_classLit = createForClass('com.google.gwt.useragent.client.', 'UserAgentAsserter_UserAgentPropertyImplIe8', 140, Ljava_lang_Object_2_classLit), Lcom_google_gwt_useragent_client_UserAgentAsserter_1UserAgentPropertyImplGecko1_18_2_classLit = createForClass('com.google.gwt.useragent.client.', 'UserAgentAsserter_UserAgentPropertyImplGecko1_8', 138, Ljava_lang_Object_2_classLit), Lcom_google_gwt_useragent_client_UserAgentAsserter_1UserAgentPropertyImplIe9_2_classLit = createForClass('com.google.gwt.useragent.client.', 'UserAgentAsserter_UserAgentPropertyImplIe9', 141, Ljava_lang_Object_2_classLit), Lcom_google_gwt_useragent_client_UserAgentAsserter_1UserAgentPropertyImplOpera_2_classLit = createForClass('com.google.gwt.useragent.client.', 'UserAgentAsserter_UserAgentPropertyImplOpera', 142, Ljava_lang_Object_2_classLit), Lcom_google_gwt_useragent_client_UserAgentAsserter_1UserAgentPropertyImplSafari_2_classLit = createForClass('com.google.gwt.useragent.client.', 'UserAgentAsserter_UserAgentPropertyImplSafari', 143, Ljava_lang_Object_2_classLit), Ljava_util_logging_Logger_2_classLit = createForClass('java.util.logging.', 'Logger', 105, Ljava_lang_Object_2_classLit), Ljava_io_OutputStream_2_classLit = createForClass('java.io.', 'OutputStream', 166, Ljava_lang_Object_2_classLit), Ljava_io_FilterOutputStream_2_classLit = createForClass('java.io.', 'FilterOutputStream', 165, Ljava_io_OutputStream_2_classLit), Ljava_io_PrintStream_2_classLit = createForClass('java.io.', 'PrintStream', 167, Ljava_io_FilterOutputStream_2_classLit), Lnet_gnehzr_tnoodle_js_ConsolePrintStream_2_classLit = createForClass('net.gnehzr.tnoodle.js.', 'ConsolePrintStream', 267, Ljava_io_PrintStream_2_classLit), Ljava_lang_ArithmeticException_2_classLit = createForClass('java.lang.', 'ArithmeticException', 168, Ljava_lang_RuntimeException_2_classLit), Lcom_google_gwt_core_client_impl_StringBufferImpl_2_classLit = createForClass('com.google.gwt.core.client.impl.', 'StringBufferImpl', 24, Ljava_lang_Object_2_classLit), Lcom_google_gwt_logging_impl_LoggerImplRegular_2_classLit = createForClass('com.google.gwt.logging.impl.', 'LoggerImplRegular', 103, Ljava_lang_Object_2_classLit), Ljava_util_logging_Handler_2_classLit = createForClass('java.util.logging.', 'Handler', 88, Ljava_lang_Object_2_classLit), _3Ljava_util_logging_Handler_2_classLit = createForArray('[Ljava.util.logging.', 'Handler;', 370, Ljava_util_logging_Handler_2_classLit), Ljava_util_AbstractMap_2_classLit = createForClass('java.util.', 'AbstractMap', 199, Ljava_lang_Object_2_classLit), Ljava_util_AbstractHashMap_2_classLit = createForClass('java.util.', 'AbstractHashMap', 198, Ljava_util_AbstractMap_2_classLit), Ljava_util_HashMap_2_classLit = createForClass('java.util.', 'HashMap', 228, Ljava_util_AbstractHashMap_2_classLit), Ljava_util_AbstractCollection_2_classLit = createForClass('java.util.', 'AbstractCollection', 197, Ljava_lang_Object_2_classLit), Ljava_util_AbstractSet_2_classLit = createForClass('java.util.', 'AbstractSet', 201, Ljava_util_AbstractCollection_2_classLit), Ljava_util_AbstractHashMap$EntrySet_2_classLit = createForClass('java.util.', 'AbstractHashMap$EntrySet', 200, Ljava_util_AbstractSet_2_classLit), Ljava_util_AbstractHashMap$EntrySetIterator_2_classLit = createForClass('java.util.', 'AbstractHashMap$EntrySetIterator', 202, Ljava_lang_Object_2_classLit), Ljava_util_AbstractMapEntry_2_classLit = createForClass('java.util.', 'AbstractMapEntry', 204, Ljava_lang_Object_2_classLit), Ljava_util_AbstractHashMap$MapEntryNull_2_classLit = createForClass('java.util.', 'AbstractHashMap$MapEntryNull', 203, Ljava_util_AbstractMapEntry_2_classLit), Ljava_util_AbstractHashMap$MapEntryString_2_classLit = createForClass('java.util.', 'AbstractHashMap$MapEntryString', 205, Ljava_util_AbstractMapEntry_2_classLit), Ljava_util_AbstractMap$1_2_classLit = createForClass('java.util.', 'AbstractMap$1', 208, Ljava_util_AbstractSet_2_classLit), Ljava_util_AbstractMap$1$1_2_classLit = createForClass('java.util.', 'AbstractMap$1$1', 209, Ljava_lang_Object_2_classLit), Lorg_timepedia_exporter_client_ExporterBaseImpl_2_classLit = createForClass('org.timepedia.exporter.client.', 'ExporterBaseImpl', 305, Ljava_lang_Object_2_classLit), Lorg_timepedia_exporter_client_ExporterBaseActual_2_classLit = createForClass('org.timepedia.exporter.client.', 'ExporterBaseActual', 304, Lorg_timepedia_exporter_client_ExporterBaseImpl_2_classLit), Lorg_timepedia_exporter_client_Exportable_2_classLit = createForInterface('org.timepedia.exporter.client.', 'Exportable'), Lcom_google_gwt_core_client_impl_StackTraceCreator$Collector_2_classLit = createForClass('com.google.gwt.core.client.impl.', 'StackTraceCreator$Collector', 19, Ljava_lang_Object_2_classLit), Lcom_google_gwt_core_client_impl_StackTraceCreator$CollectorMoz_2_classLit = createForClass('com.google.gwt.core.client.impl.', 'StackTraceCreator$CollectorMoz', 21, Lcom_google_gwt_core_client_impl_StackTraceCreator$Collector_2_classLit), Lcom_google_gwt_core_client_impl_StackTraceCreator$CollectorChrome_2_classLit = createForClass('com.google.gwt.core.client.impl.', 'StackTraceCreator$CollectorChrome', 20, Lcom_google_gwt_core_client_impl_StackTraceCreator$CollectorMoz_2_classLit), Lcom_google_gwt_core_client_impl_StackTraceCreator$CollectorChromeNoSourceMap_2_classLit = createForClass('com.google.gwt.core.client.impl.', 'StackTraceCreator$CollectorChromeNoSourceMap', 22, Lcom_google_gwt_core_client_impl_StackTraceCreator$CollectorChrome_2_classLit), Lcom_google_gwt_core_client_impl_StackTraceCreator$CollectorOpera_2_classLit = createForClass('com.google.gwt.core.client.impl.', 'StackTraceCreator$CollectorOpera', 23, Lcom_google_gwt_core_client_impl_StackTraceCreator$CollectorMoz_2_classLit), Lcom_google_gwt_core_client_impl_StringBufferImplArrayBase_2_classLit = createForClass('com.google.gwt.core.client.impl.', 'StringBufferImplArrayBase', 27, Lcom_google_gwt_core_client_impl_StringBufferImpl_2_classLit), Lcom_google_gwt_core_client_impl_StringBufferImplArray_2_classLit = createForClass('com.google.gwt.core.client.impl.', 'StringBufferImplArray', 26, Lcom_google_gwt_core_client_impl_StringBufferImplArrayBase_2_classLit), Lcom_google_gwt_core_client_impl_StringBufferImplAppend_2_classLit = createForClass('com.google.gwt.core.client.impl.', 'StringBufferImplAppend', 25, Lcom_google_gwt_core_client_impl_StringBufferImpl_2_classLit), Lcom_google_gwt_core_client_Scheduler_2_classLit = createForClass('com.google.gwt.core.client.', 'Scheduler', 14, Ljava_lang_Object_2_classLit), Lcom_google_gwt_core_client_impl_SchedulerImpl_2_classLit = createForClass('com.google.gwt.core.client.impl.', 'SchedulerImpl', 16, Lcom_google_gwt_core_client_Scheduler_2_classLit), Ljava_util_AbstractList_2_classLit = createForClass('java.util.', 'AbstractList', 206, Ljava_util_AbstractCollection_2_classLit), Ljava_util_ArrayList_2_classLit = createForClass('java.util.', 'ArrayList', 212, Ljava_util_AbstractList_2_classLit), Ljava_util_AbstractList$IteratorImpl_2_classLit = createForClass('java.util.', 'AbstractList$IteratorImpl', 207, Ljava_lang_Object_2_classLit), Ljava_util_logging_Level_2_classLit = createForClass('java.util.logging.', 'Level', 254, Ljava_lang_Object_2_classLit), Ljava_util_logging_Level$LevelAll_2_classLit = createForClass('java.util.logging.', 'Level$LevelAll', 255, Ljava_util_logging_Level_2_classLit), Ljava_util_logging_Level$LevelConfig_2_classLit = createForClass('java.util.logging.', 'Level$LevelConfig', 256, Ljava_util_logging_Level_2_classLit), Ljava_util_logging_Level$LevelFine_2_classLit = createForClass('java.util.logging.', 'Level$LevelFine', 257, Ljava_util_logging_Level_2_classLit), Ljava_util_logging_Level$LevelFiner_2_classLit = createForClass('java.util.logging.', 'Level$LevelFiner', 258, Ljava_util_logging_Level_2_classLit), Ljava_util_logging_Level$LevelFinest_2_classLit = createForClass('java.util.logging.', 'Level$LevelFinest', 259, Ljava_util_logging_Level_2_classLit), Ljava_util_logging_Level$LevelInfo_2_classLit = createForClass('java.util.logging.', 'Level$LevelInfo', 260, Ljava_util_logging_Level_2_classLit), Ljava_util_logging_Level$LevelOff_2_classLit = createForClass('java.util.logging.', 'Level$LevelOff', 261, Ljava_util_logging_Level_2_classLit), Ljava_util_logging_Level$LevelSevere_2_classLit = createForClass('java.util.logging.', 'Level$LevelSevere', 262, Ljava_util_logging_Level_2_classLit), Ljava_util_logging_Level$LevelWarning_2_classLit = createForClass('java.util.logging.', 'Level$LevelWarning', 263, Ljava_util_logging_Level_2_classLit), Ljava_lang_NullPointerException_2_classLit = createForClass('java.lang.', 'NullPointerException', 185, Ljava_lang_RuntimeException_2_classLit), Ljava_lang_IllegalArgumentException_2_classLit = createForClass('java.lang.', 'IllegalArgumentException', 178, Ljava_lang_RuntimeException_2_classLit), Ljava_util_logging_LogManager_2_classLit = createForClass('java.util.logging.', 'LogManager', 264, Ljava_lang_Object_2_classLit), Ljava_util_logging_LogManager$RootLogger_2_classLit = createForClass('java.util.logging.', 'LogManager$RootLogger', 265, Ljava_util_logging_Logger_2_classLit), Lcom_google_gwt_logging_impl_LoggerWithExposedConstructor_2_classLit = createForClass('com.google.gwt.logging.impl.', 'LoggerWithExposedConstructor', 104, Ljava_util_logging_Logger_2_classLit), Ljava_util_logging_LogRecord_2_classLit = createForClass('java.util.logging.', 'LogRecord', 266, Ljava_lang_Object_2_classLit), Ljava_lang_UnsupportedOperationException_2_classLit = createForClass('java.lang.', 'UnsupportedOperationException', 194, Ljava_lang_RuntimeException_2_classLit), Ljava_util_MapEntryImpl_2_classLit = createForClass('java.util.', 'MapEntryImpl', 232, Ljava_util_AbstractMapEntry_2_classLit), Lcom_google_gwt_logging_client_ConsoleLogHandler_2_classLit = createForClass('com.google.gwt.logging.client.', 'ConsoleLogHandler', 87, Ljava_util_logging_Handler_2_classLit), Lcom_google_gwt_logging_client_DevelopmentModeLogHandler_2_classLit = createForClass('com.google.gwt.logging.client.', 'DevelopmentModeLogHandler', 89, Ljava_util_logging_Handler_2_classLit), Lcom_google_gwt_logging_client_FirebugLogHandler_2_classLit = createForClass('com.google.gwt.logging.client.', 'FirebugLogHandler', 90, Ljava_util_logging_Handler_2_classLit), Lcom_google_gwt_logging_client_SystemLogHandler_2_classLit = createForClass('com.google.gwt.logging.client.', 'SystemLogHandler', 100, Ljava_util_logging_Handler_2_classLit), Lcom_google_gwt_logging_client_NullLogHandler_2_classLit = createForClass('com.google.gwt.logging.client.', 'NullLogHandler', 98, Ljava_util_logging_Handler_2_classLit), Lcom_google_gwt_logging_client_NullLoggingPopup_2_classLit = createForClass('com.google.gwt.logging.client.', 'NullLoggingPopup', 99, Ljava_lang_Object_2_classLit), Lcom_google_gwt_logging_client_HasWidgetsLogHandler_2_classLit = createForClass('com.google.gwt.logging.client.', 'HasWidgetsLogHandler', 91, Ljava_util_logging_Handler_2_classLit), Ljava_lang_StringBuffer_2_classLit = createForClass('java.lang.', 'StringBuffer', 190, Ljava_lang_Object_2_classLit), Ljava_util_Date_2_classLit = createForClass('java.util.', 'Date', 226, Ljava_lang_Object_2_classLit), Lnet_gnehzr_tnoodle_scrambles_PuzzleExporterImpl_2_classLit = createForClass('net.gnehzr.tnoodle.scrambles.', 'PuzzleExporterImpl', 279, Ljava_lang_Object_2_classLit), Lnet_gnehzr_tnoodle_scrambles_Puzzle_2_classLit = createForClass('net.gnehzr.tnoodle.scrambles.', 'Puzzle', 275, Ljava_lang_Object_2_classLit), Lpuzzle_CubePuzzleExporterImpl_2_classLit = createForClass('puzzle.', 'CubePuzzleExporterImpl', 317, Ljava_lang_Object_2_classLit), Lpuzzle_CubePuzzle_2_classLit = createForClass('puzzle.', 'CubePuzzle', 312, Lnet_gnehzr_tnoodle_scrambles_Puzzle_2_classLit), Lnet_gnehzr_tnoodle_js_TNoodleJsUtilsExporterImpl_2_classLit = createForClass('net.gnehzr.tnoodle.js.', 'TNoodleJsUtilsExporterImpl', 270, Ljava_lang_Object_2_classLit), Lnet_gnehzr_tnoodle_js_TNoodleJsUtils_2_classLit = createForClass('net.gnehzr.tnoodle.js.', 'TNoodleJsUtils', null, Ljava_lang_Object_2_classLit), Lpuzzle_ClockPuzzleExporterImpl_2_classLit = createForClass('puzzle.', 'ClockPuzzleExporterImpl', 311, Ljava_lang_Object_2_classLit), Lpuzzle_ClockPuzzle_2_classLit = createForClass('puzzle.', 'ClockPuzzle', 309, Lnet_gnehzr_tnoodle_scrambles_Puzzle_2_classLit), Lpuzzle_FourByFourCubePuzzleExporterImpl_2_classLit = createForClass('puzzle.', 'FourByFourCubePuzzleExporterImpl', 320, Ljava_lang_Object_2_classLit), Lpuzzle_FourByFourCubePuzzle_2_classLit = createForClass('puzzle.', 'FourByFourCubePuzzle', 318, Lpuzzle_CubePuzzle_2_classLit), Lpuzzle_FourByFourRandomTurnsCubePuzzleExporterImpl_2_classLit = createForClass('puzzle.', 'FourByFourRandomTurnsCubePuzzleExporterImpl', 322, Ljava_lang_Object_2_classLit), Lpuzzle_FourByFourRandomTurnsCubePuzzle_2_classLit = createForClass('puzzle.', 'FourByFourRandomTurnsCubePuzzle', 321, Lpuzzle_CubePuzzle_2_classLit), Lpuzzle_MegaminxPuzzleExporterImpl_2_classLit = createForClass('puzzle.', 'MegaminxPuzzleExporterImpl', 326, Ljava_lang_Object_2_classLit), Lpuzzle_MegaminxPuzzle_2_classLit = createForClass('puzzle.', 'MegaminxPuzzle', 323, Lnet_gnehzr_tnoodle_scrambles_Puzzle_2_classLit), Lpuzzle_NoInspectionFiveByFiveCubePuzzleExporterImpl_2_classLit = createForClass('puzzle.', 'NoInspectionFiveByFiveCubePuzzleExporterImpl', 328, Ljava_lang_Object_2_classLit), Lpuzzle_CubePuzzle$CubeMove_2_classLit = createForClass('puzzle.', 'CubePuzzle$CubeMove', 313, Ljava_lang_Object_2_classLit), _3Lpuzzle_CubePuzzle$CubeMove_2_classLit = createForArray('[Lpuzzle.', 'CubePuzzle$CubeMove;', 371, Lpuzzle_CubePuzzle$CubeMove_2_classLit), Lpuzzle_NoInspectionFiveByFiveCubePuzzle_2_classLit = createForClass('puzzle.', 'NoInspectionFiveByFiveCubePuzzle', 327, Lpuzzle_CubePuzzle_2_classLit), Lpuzzle_NoInspectionFourByFourCubePuzzleExporterImpl_2_classLit = createForClass('puzzle.', 'NoInspectionFourByFourCubePuzzleExporterImpl', 330, Ljava_lang_Object_2_classLit), Lpuzzle_NoInspectionFourByFourCubePuzzle_2_classLit = createForClass('puzzle.', 'NoInspectionFourByFourCubePuzzle', 329, Lpuzzle_FourByFourCubePuzzle_2_classLit), Lpuzzle_NoInspectionThreeByThreeCubePuzzleExporterImpl_2_classLit = createForClass('puzzle.', 'NoInspectionThreeByThreeCubePuzzleExporterImpl', 333, Ljava_lang_Object_2_classLit), Lpuzzle_ThreeByThreeCubePuzzle_2_classLit = createForClass('puzzle.', 'ThreeByThreeCubePuzzle', 332, Lpuzzle_CubePuzzle_2_classLit), Lpuzzle_NoInspectionThreeByThreeCubePuzzle_2_classLit = createForClass('puzzle.', 'NoInspectionThreeByThreeCubePuzzle', 331, Lpuzzle_ThreeByThreeCubePuzzle_2_classLit), Ljava_util_Random_2_classLit = createForClass('java.util.', 'Random', 196, Ljava_lang_Object_2_classLit), Lpuzzle_PyraminxPuzzleExporterImpl_2_classLit = createForClass('puzzle.', 'PyraminxPuzzleExporterImpl', 336, Ljava_lang_Object_2_classLit), Lpuzzle_PyraminxPuzzle_2_classLit = createForClass('puzzle.', 'PyraminxPuzzle', 334, Lnet_gnehzr_tnoodle_scrambles_Puzzle_2_classLit), Lpuzzle_SkewbPuzzleExporterImpl_2_classLit = createForClass('puzzle.', 'SkewbPuzzleExporterImpl', 341, Ljava_lang_Object_2_classLit), Lpuzzle_SkewbPuzzle_2_classLit = createForClass('puzzle.', 'SkewbPuzzle', 339, Lnet_gnehzr_tnoodle_scrambles_Puzzle_2_classLit), Lpuzzle_SquareOnePuzzleExporterImpl_2_classLit = createForClass('puzzle.', 'SquareOnePuzzleExporterImpl', 346, Ljava_lang_Object_2_classLit), Lpuzzle_SquareOnePuzzle_2_classLit = createForClass('puzzle.', 'SquareOnePuzzle', 344, Lnet_gnehzr_tnoodle_scrambles_Puzzle_2_classLit), Lpuzzle_SquareOneUnfilteredPuzzleExporterImpl_2_classLit = createForClass('puzzle.', 'SquareOneUnfilteredPuzzleExporterImpl', 348, Ljava_lang_Object_2_classLit), Lpuzzle_SquareOneUnfilteredPuzzle_2_classLit = createForClass('puzzle.', 'SquareOneUnfilteredPuzzle', 347, Lpuzzle_SquareOnePuzzle_2_classLit), Lpuzzle_ThreeByThreeCubeFewestMovesPuzzleExporterImpl_2_classLit = createForClass('puzzle.', 'ThreeByThreeCubeFewestMovesPuzzleExporterImpl', 350, Ljava_lang_Object_2_classLit), Lpuzzle_ThreeByThreeCubeFewestMovesPuzzle_2_classLit = createForClass('puzzle.', 'ThreeByThreeCubeFewestMovesPuzzle', 349, Lpuzzle_ThreeByThreeCubePuzzle_2_classLit), Lpuzzle_ThreeByThreeCubePuzzleExporterImpl_2_classLit = createForClass('puzzle.', 'ThreeByThreeCubePuzzleExporterImpl', 352, Ljava_lang_Object_2_classLit), Lpuzzle_TwoByTwoCubePuzzleExporterImpl_2_classLit = createForClass('puzzle.', 'TwoByTwoCubePuzzleExporterImpl', 354, Ljava_lang_Object_2_classLit), Lpuzzle_TwoByTwoCubePuzzle_2_classLit = createForClass('puzzle.', 'TwoByTwoCubePuzzle', 353, Lpuzzle_CubePuzzle_2_classLit), Ljava_util_logging_Formatter_2_classLit = createForClass('java.util.logging.', 'Formatter', 94, Ljava_lang_Object_2_classLit), Lcom_google_gwt_logging_impl_FormatterImpl_2_classLit = createForClass('com.google.gwt.logging.impl.', 'FormatterImpl', 93, Ljava_util_logging_Formatter_2_classLit), Lcom_google_gwt_logging_client_TextLogFormatter_2_classLit = createForClass('com.google.gwt.logging.client.', 'TextLogFormatter', 101, Lcom_google_gwt_logging_impl_FormatterImpl_2_classLit), Lcom_google_gwt_logging_client_HtmlLogFormatter_2_classLit = createForClass('com.google.gwt.logging.client.', 'HtmlLogFormatter', 92, Lcom_google_gwt_logging_impl_FormatterImpl_2_classLit), Lcom_google_gwt_user_client_ui_UIObject_2_classLit = createForClass('com.google.gwt.user.client.ui.', 'UIObject', 133, Ljava_lang_Object_2_classLit), Lcom_google_gwt_user_client_ui_Widget_2_classLit = createForClass('com.google.gwt.user.client.ui.', 'Widget', 132, Lcom_google_gwt_user_client_ui_UIObject_2_classLit), Lcom_google_gwt_user_client_ui_LabelBase_2_classLit = createForClass('com.google.gwt.user.client.ui.', 'LabelBase', 131, Lcom_google_gwt_user_client_ui_Widget_2_classLit), Lcom_google_gwt_user_client_ui_Label_2_classLit = createForClass('com.google.gwt.user.client.ui.', 'Label', 130, Lcom_google_gwt_user_client_ui_LabelBase_2_classLit), Lcom_google_gwt_user_client_ui_HTML_2_classLit = createForClass('com.google.gwt.user.client.ui.', 'HTML', 129, Lcom_google_gwt_user_client_ui_Label_2_classLit), Lcom_google_gwt_i18n_client_HasDirection$Direction_2_classLit = createForEnum('com.google.gwt.i18n.client.', 'HasDirection$Direction', 59, Ljava_lang_Enum_2_classLit, values_1), _3Lcom_google_gwt_i18n_client_HasDirection$Direction_2_classLit = createForArray('[Lcom.google.gwt.i18n.client.', 'HasDirection$Direction;', 372, Lcom_google_gwt_i18n_client_HasDirection$Direction_2_classLit), Ljava_util_NoSuchElementException_2_classLit = createForClass('java.util.', 'NoSuchElementException', 238, Ljava_lang_RuntimeException_2_classLit), Ljava_lang_IllegalStateException_2_classLit = createForClass('java.lang.', 'IllegalStateException', 179, Ljava_lang_RuntimeException_2_classLit), Lnet_gnehzr_tnoodle_scrambles_Puzzle$PuzzleState_2_classLit = createForClass('net.gnehzr.tnoodle.scrambles.', 'Puzzle$PuzzleState', 277, Ljava_lang_Object_2_classLit), _3Lnet_gnehzr_tnoodle_scrambles_Puzzle$PuzzleState_2_classLit = createForArray('[Lnet.gnehzr.tnoodle.scrambles.', 'Puzzle$PuzzleState;', 373, Lnet_gnehzr_tnoodle_scrambles_Puzzle$PuzzleState_2_classLit), Lnet_gnehzr_tnoodle_scrambles_Puzzle$Bucket_2_classLit = createForClass('net.gnehzr.tnoodle.scrambles.', 'Puzzle$Bucket', 276, Ljava_lang_Object_2_classLit), Lnet_gnehzr_tnoodle_scrambles_Puzzle$SortedBuckets_2_classLit = createForClass('net.gnehzr.tnoodle.scrambles.', 'Puzzle$SortedBuckets', 278, Ljava_lang_Object_2_classLit), _3_3Lpuzzle_CubePuzzle$CubeMove_2_classLit = createForArray('[[Lpuzzle.', 'CubePuzzle$CubeMove;', 374, _3Lpuzzle_CubePuzzle$CubeMove_2_classLit), _3_3I_classLit = createForArray('', '[[I', 375, _3I_classLit), _3_3_3I_classLit = createForArray('', '[[[I', 376, _3_3I_classLit), Lpuzzle_CubePuzzle$Face_2_classLit = createForEnum('puzzle.', 'CubePuzzle$Face', 315, Ljava_lang_Enum_2_classLit, values_3), _3Lpuzzle_CubePuzzle$Face_2_classLit = createForArray('[Lpuzzle.', 'CubePuzzle$Face;', 377, Lpuzzle_CubePuzzle$Face_2_classLit), Lpuzzle_CubePuzzle$CubeState_2_classLit = createForClass('puzzle.', 'CubePuzzle$CubeState', 314, Lnet_gnehzr_tnoodle_scrambles_Puzzle$PuzzleState_2_classLit), Lpuzzle_ClockPuzzle$ClockState_2_classLit = createForClass('puzzle.', 'ClockPuzzle$ClockState', 310, Lnet_gnehzr_tnoodle_scrambles_Puzzle$PuzzleState_2_classLit), Ljava_lang_ThreadLocal_2_classLit = createForClass('java.lang.', 'ThreadLocal', 193, Ljava_lang_Object_2_classLit), Lpuzzle_FourByFourCubePuzzle$1_2_classLit = createForClass('puzzle.', 'FourByFourCubePuzzle$1', 319, Ljava_lang_ThreadLocal_2_classLit), Lpuzzle_MegaminxPuzzle$Face_2_classLit = createForEnum('puzzle.', 'MegaminxPuzzle$Face', 324, Ljava_lang_Enum_2_classLit, values_4), _3Lpuzzle_MegaminxPuzzle$Face_2_classLit = createForArray('[Lpuzzle.', 'MegaminxPuzzle$Face;', 378, Lpuzzle_MegaminxPuzzle$Face_2_classLit), Lpuzzle_MegaminxPuzzle$MegaminxState_2_classLit = createForClass('puzzle.', 'MegaminxPuzzle$MegaminxState', 325, Lnet_gnehzr_tnoodle_scrambles_Puzzle$PuzzleState_2_classLit), Lnet_gnehzr_tnoodle_svglite_Element_2_classLit = createForClass('net.gnehzr.tnoodle.svglite.', 'Element', 284, Ljava_lang_Object_2_classLit), Lnet_gnehzr_tnoodle_svglite_Path_2_classLit = createForClass('net.gnehzr.tnoodle.svglite.', 'Path', 289, Lnet_gnehzr_tnoodle_svglite_Element_2_classLit), _3Lnet_gnehzr_tnoodle_svglite_Path_2_classLit = createForArray('[Lnet.gnehzr.tnoodle.svglite.', 'Path;', 379, Lnet_gnehzr_tnoodle_svglite_Path_2_classLit), Lnet_gnehzr_tnoodle_svglite_Point2D$Double_2_classLit = createForClass('net.gnehzr.tnoodle.svglite.', 'Point2D$Double', 292, Ljava_lang_Object_2_classLit), _3Lnet_gnehzr_tnoodle_svglite_Point2D$Double_2_classLit = createForArray('[Lnet.gnehzr.tnoodle.svglite.', 'Point2D$Double;', 380, Lnet_gnehzr_tnoodle_svglite_Point2D$Double_2_classLit), Lpuzzle_ThreeByThreeCubePuzzle$1_2_classLit = createForClass('puzzle.', 'ThreeByThreeCubePuzzle$1', 351, Ljava_lang_ThreadLocal_2_classLit), Lpuzzle_PyraminxPuzzle$PyraminxState_2_classLit = createForClass('puzzle.', 'PyraminxPuzzle$PyraminxState', 335, Lnet_gnehzr_tnoodle_scrambles_Puzzle$PuzzleState_2_classLit), Lnet_gnehzr_tnoodle_svglite_Color_2_classLit = createForClass('net.gnehzr.tnoodle.svglite.', 'Color', 285, Ljava_lang_Object_2_classLit), _3Lnet_gnehzr_tnoodle_svglite_Color_2_classLit = createForArray('[Lnet.gnehzr.tnoodle.svglite.', 'Color;', 381, Lnet_gnehzr_tnoodle_svglite_Color_2_classLit), Lnet_gnehzr_tnoodle_svglite_Transform_2_classLit = createForClass('net.gnehzr.tnoodle.svglite.', 'Transform', 296, Ljava_lang_Object_2_classLit), _3Lnet_gnehzr_tnoodle_svglite_Transform_2_classLit = createForArray('[Lnet.gnehzr.tnoodle.svglite.', 'Transform;', 382, Lnet_gnehzr_tnoodle_svglite_Transform_2_classLit), Lpuzzle_SkewbPuzzle$SkewbState_2_classLit = createForClass('puzzle.', 'SkewbPuzzle$SkewbState', 340, Lnet_gnehzr_tnoodle_scrambles_Puzzle$PuzzleState_2_classLit), Lpuzzle_SquareOnePuzzle$SquareOneState_2_classLit = createForClass('puzzle.', 'SquareOnePuzzle$SquareOneState', 345, Lnet_gnehzr_tnoodle_scrambles_Puzzle$PuzzleState_2_classLit), Lcom_google_gwt_user_client_impl_WindowImpl_2_classLit = createForClass('com.google.gwt.user.client.impl.', 'WindowImpl', 125, Ljava_lang_Object_2_classLit), Ljava_util_Collections$UnmodifiableCollection_2_classLit = createForClass('java.util.', 'Collections$UnmodifiableCollection', 215, Ljava_lang_Object_2_classLit), Ljava_util_Collections$UnmodifiableList_2_classLit = createForClass('java.util.', 'Collections$UnmodifiableList', 217, Ljava_util_Collections$UnmodifiableCollection_2_classLit), Ljava_util_Collections$UnmodifiableMap_2_classLit = createForClass('java.util.', 'Collections$UnmodifiableMap', 218, Ljava_lang_Object_2_classLit), Ljava_util_Collections$UnmodifiableSet_2_classLit = createForClass('java.util.', 'Collections$UnmodifiableSet', 220, Ljava_util_Collections$UnmodifiableCollection_2_classLit), Ljava_util_Collections$UnmodifiableMap$UnmodifiableEntrySet_2_classLit = createForClass('java.util.', 'Collections$UnmodifiableMap$UnmodifiableEntrySet', 219, Ljava_util_Collections$UnmodifiableSet_2_classLit), Ljava_util_Collections$UnmodifiableMap$UnmodifiableEntrySet$UnmodifiableEntry_2_classLit = createForClass('java.util.', 'Collections$UnmodifiableMap$UnmodifiableEntrySet$UnmodifiableEntry', 222, Ljava_lang_Object_2_classLit), Ljava_util_Collections$UnmodifiableRandomAccessList_2_classLit = createForClass('java.util.', 'Collections$UnmodifiableRandomAccessList', 223, Ljava_util_Collections$UnmodifiableList_2_classLit), Ljava_util_Collections$UnmodifiableCollectionIterator_2_classLit = createForClass('java.util.', 'Collections$UnmodifiableCollectionIterator', 216, Ljava_lang_Object_2_classLit), Ljava_util_Collections$UnmodifiableMap$UnmodifiableEntrySet$1_2_classLit = createForClass('java.util.', 'Collections$UnmodifiableMap$UnmodifiableEntrySet$1', 221, Ljava_lang_Object_2_classLit), Lnet_gnehzr_tnoodle_svglite_Dimension_2_classLit = createForClass('net.gnehzr.tnoodle.svglite.', 'Dimension', 286, Ljava_lang_Object_2_classLit), Lnet_gnehzr_tnoodle_scrambles_InvalidScrambleException_2_classLit = createForClass('net.gnehzr.tnoodle.scrambles.', 'InvalidScrambleException', 274, Ljava_lang_Exception_2_classLit), Lnet_gnehzr_tnoodle_scrambles_PuzzleStateAndGenerator_2_classLit = createForClass('net.gnehzr.tnoodle.scrambles.', 'PuzzleStateAndGenerator', 281, Ljava_lang_Object_2_classLit), Lcom_google_gwt_user_client_impl_WindowImplIE_2_classLit = createForClass('com.google.gwt.user.client.impl.', 'WindowImplIE', 126, Lcom_google_gwt_user_client_impl_WindowImpl_2_classLit), Lcom_google_gwt_user_client_impl_WindowImplMozilla_2_classLit = createForClass('com.google.gwt.user.client.impl.', 'WindowImplMozilla', 127, Lcom_google_gwt_user_client_impl_WindowImpl_2_classLit), Ljava_lang_IndexOutOfBoundsException_2_classLit = createForClass('java.lang.', 'IndexOutOfBoundsException', 180, Ljava_lang_RuntimeException_2_classLit), Ljava_util_HashSet_2_classLit = createForClass('java.util.', 'HashSet', 229, Ljava_util_AbstractSet_2_classLit), Lcom_google_gwt_user_client_ui_DirectionalTextHelper_2_classLit = createForClass('com.google.gwt.user.client.ui.', 'DirectionalTextHelper', 128, Ljava_lang_Object_2_classLit), Lcom_google_gwt_dom_client_Style$TextAlign_2_classLit = createForEnum('com.google.gwt.dom.client.', 'Style$TextAlign', 45, Ljava_lang_Enum_2_classLit, values_0), _3Lcom_google_gwt_dom_client_Style$TextAlign_2_classLit = createForArray('[Lcom.google.gwt.dom.client.', 'Style$TextAlign;', 383, Lcom_google_gwt_dom_client_Style$TextAlign_2_classLit), Lcom_google_gwt_dom_client_Style$TextAlign$1_2_classLit = createForEnum('com.google.gwt.dom.client.', 'Style$TextAlign$1', 47, Lcom_google_gwt_dom_client_Style$TextAlign_2_classLit, null), Lcom_google_gwt_dom_client_Style$TextAlign$2_2_classLit = createForEnum('com.google.gwt.dom.client.', 'Style$TextAlign$2', 48, Lcom_google_gwt_dom_client_Style$TextAlign_2_classLit, null), Lcom_google_gwt_dom_client_Style$TextAlign$3_2_classLit = createForEnum('com.google.gwt.dom.client.', 'Style$TextAlign$3', 49, Lcom_google_gwt_dom_client_Style$TextAlign_2_classLit, null), Lcom_google_gwt_dom_client_Style$TextAlign$4_2_classLit = createForEnum('com.google.gwt.dom.client.', 'Style$TextAlign$4', 50, Lcom_google_gwt_dom_client_Style$TextAlign_2_classLit, null), Lcom_google_gwt_i18n_client_LocaleInfo_2_classLit = createForClass('com.google.gwt.i18n.client.', 'LocaleInfo', 60, Ljava_lang_Object_2_classLit), Ljava_security_SecureRandom_2_classLit = createForClass('java.security.', 'SecureRandom', 195, Ljava_util_Random_2_classLit), Lcom_google_gwt_user_client_ui_Image_2_classLit = createForClass('com.google.gwt.user.client.ui.', 'Image', 134, Lcom_google_gwt_user_client_ui_Widget_2_classLit), Lcom_google_gwt_user_client_ui_Image$State_2_classLit = createForClass('com.google.gwt.user.client.ui.', 'Image$State', 135, Ljava_lang_Object_2_classLit), Lcom_google_gwt_user_client_ui_Image$UnclippedState_2_classLit = createForClass('com.google.gwt.user.client.ui.', 'Image$UnclippedState', 136, Lcom_google_gwt_user_client_ui_Image$State_2_classLit), Lcom_google_gwt_json_client_JSONValue_2_classLit = createForClass('com.google.gwt.json.client.', 'JSONValue', 65, Ljava_lang_Object_2_classLit), Lcom_google_gwt_json_client_JSONObject_2_classLit = createForClass('com.google.gwt.json.client.', 'JSONObject', 70, Lcom_google_gwt_json_client_JSONValue_2_classLit), Lnet_gnehzr_tnoodle_scrambles_PuzzleImageInfo_2_classLit = createForClass('net.gnehzr.tnoodle.scrambles.', 'PuzzleImageInfo', 280, Ljava_lang_Object_2_classLit), Lnet_gnehzr_tnoodle_svglite_Svg_2_classLit = createForClass('net.gnehzr.tnoodle.svglite.', 'Svg', 294, Lnet_gnehzr_tnoodle_svglite_Element_2_classLit), Lnet_gnehzr_tnoodle_scrambles_AlgorithmBuilder_2_classLit = createForClass('net.gnehzr.tnoodle.scrambles.', 'AlgorithmBuilder', 271, Ljava_lang_Object_2_classLit), Lnet_gnehzr_tnoodle_scrambles_AlgorithmBuilder$IndexAndMove_2_classLit = createForClass('net.gnehzr.tnoodle.scrambles.', 'AlgorithmBuilder$IndexAndMove', 272, Ljava_lang_Object_2_classLit), Lnet_gnehzr_tnoodle_scrambles_InvalidMoveException_2_classLit = createForClass('net.gnehzr.tnoodle.scrambles.', 'InvalidMoveException', 273, Ljava_lang_Exception_2_classLit), Lcs_threephase_Edge3_2_classLit = createForClass('cs.threephase.', 'Edge3', 158, Ljava_lang_Object_2_classLit), _3Lcs_threephase_Edge3_2_classLit = createForArray('[Lcs.threephase.', 'Edge3;', 384, Lcs_threephase_Edge3_2_classLit), Lcs_threephase_FullCube_2_classLit = createForClass('cs.threephase.', 'FullCube', 160, Ljava_lang_Object_2_classLit), _3Lcs_threephase_FullCube_2_classLit = createForArray('[Lcs.threephase.', 'FullCube;', 385, Lcs_threephase_FullCube_2_classLit), Lcs_threephase_Search_2_classLit = createForClass('cs.threephase.', 'Search', 163, Ljava_lang_Object_2_classLit), Lnet_gnehzr_tnoodle_svglite_Path$Command_2_classLit = createForClass('net.gnehzr.tnoodle.svglite.', 'Path$Command', 290, Ljava_lang_Object_2_classLit), Lcs_min2phase_Search_2_classLit = createForClass('cs.min2phase.', 'Search', 146, Ljava_lang_Object_2_classLit), Lpuzzle_PyraminxSolver_2_classLit = createForClass('puzzle.', 'PyraminxSolver', 337, Ljava_lang_Object_2_classLit), Lpuzzle_PyraminxSolver$PyraminxSolverState_2_classLit = createForClass('puzzle.', 'PyraminxSolver$PyraminxSolverState', 338, Ljava_lang_Object_2_classLit), _3_3C_classLit = createForArray('', '[[C', 386, _3C_classLit), _3_3B_classLit = createForArray('', '[[B', 387, _3B_classLit), Lpuzzle_SkewbSolver_2_classLit = createForClass('puzzle.', 'SkewbSolver', 342, Ljava_lang_Object_2_classLit), Lpuzzle_SkewbSolver$SkewbSolverState_2_classLit = createForClass('puzzle.', 'SkewbSolver$SkewbSolverState', 343, Ljava_lang_Object_2_classLit), Lcs_sq12phase_Search_2_classLit = createForClass('cs.sq12phase.', 'Search', 150, Ljava_lang_Object_2_classLit), Lcs_sq12phase_FullCube_2_classLit = createForClass('cs.sq12phase.', 'FullCube', 149, Ljava_lang_Object_2_classLit), Lpuzzle_TwoByTwoSolver_2_classLit = createForClass('puzzle.', 'TwoByTwoSolver', 355, Ljava_lang_Object_2_classLit), Lpuzzle_TwoByTwoSolver$TwoByTwoState_2_classLit = createForClass('puzzle.', 'TwoByTwoSolver$TwoByTwoState', 356, Ljava_lang_Object_2_classLit), Lcom_google_gwt_dom_client_DOMImpl_2_classLit = createForClass('com.google.gwt.dom.client.', 'DOMImpl', 28, Ljava_lang_Object_2_classLit), Lcom_google_gwt_user_client_impl_DOMImpl_2_classLit = createForClass('com.google.gwt.user.client.impl.', 'DOMImpl', 115, Ljava_lang_Object_2_classLit), Lcom_google_gwt_user_client_impl_DOMImplTrident_2_classLit = createForClass('com.google.gwt.user.client.impl.', 'DOMImplTrident', 117, Lcom_google_gwt_user_client_impl_DOMImpl_2_classLit), Lcom_google_gwt_user_client_impl_DOMImplIE8_2_classLit = createForClass('com.google.gwt.user.client.impl.', 'DOMImplIE8', 118, Lcom_google_gwt_user_client_impl_DOMImplTrident_2_classLit), Lcom_google_gwt_user_client_impl_DOMImplStandard_2_classLit = createForClass('com.google.gwt.user.client.impl.', 'DOMImplStandard', 121, Lcom_google_gwt_user_client_impl_DOMImpl_2_classLit), Lcom_google_gwt_user_client_impl_DOMImplMozilla_2_classLit = createForClass('com.google.gwt.user.client.impl.', 'DOMImplMozilla', 122, Lcom_google_gwt_user_client_impl_DOMImplStandard_2_classLit), Lcom_google_gwt_user_client_impl_DOMImplStandardBase_2_classLit = createForClass('com.google.gwt.user.client.impl.', 'DOMImplStandardBase', 120, Lcom_google_gwt_user_client_impl_DOMImplStandard_2_classLit), Lcom_google_gwt_user_client_impl_DOMImplIE9_2_classLit = createForClass('com.google.gwt.user.client.impl.', 'DOMImplIE9', 119, Lcom_google_gwt_user_client_impl_DOMImplStandardBase_2_classLit), Lcom_google_gwt_user_client_impl_DOMImplIE6_2_classLit = createForClass('com.google.gwt.user.client.impl.', 'DOMImplIE6', 116, Lcom_google_gwt_user_client_impl_DOMImplTrident_2_classLit), Lcom_google_gwt_user_client_impl_DOMImplOpera_2_classLit = createForClass('com.google.gwt.user.client.impl.', 'DOMImplOpera', 123, Lcom_google_gwt_user_client_impl_DOMImplStandard_2_classLit), Lcom_google_gwt_user_client_impl_DOMImplWebkit_2_classLit = createForClass('com.google.gwt.user.client.impl.', 'DOMImplWebkit', 124, Lcom_google_gwt_user_client_impl_DOMImplStandardBase_2_classLit), Lcom_google_gwt_json_client_JSONArray_2_classLit = createForClass('com.google.gwt.json.client.', 'JSONArray', 64, Lcom_google_gwt_json_client_JSONValue_2_classLit), Lcom_google_gwt_json_client_JSONString_2_classLit = createForClass('com.google.gwt.json.client.', 'JSONString', 72, Lcom_google_gwt_json_client_JSONValue_2_classLit), Lcom_google_gwt_json_client_JSONNumber_2_classLit = createForClass('com.google.gwt.json.client.', 'JSONNumber', 69, Lcom_google_gwt_json_client_JSONValue_2_classLit), Lnet_gnehzr_tnoodle_svglite_InvalidHexColorException_2_classLit = createForClass('net.gnehzr.tnoodle.svglite.', 'InvalidHexColorException', 288, Ljava_lang_Exception_2_classLit), Lnet_gnehzr_tnoodle_svglite_Group_2_classLit = createForClass('net.gnehzr.tnoodle.svglite.', 'Group', 287, Lnet_gnehzr_tnoodle_svglite_Element_2_classLit), Lcs_threephase_FullCube$ValueComparator_2_classLit = createForClass('cs.threephase.', 'FullCube$ValueComparator', 161, Ljava_lang_Object_2_classLit), _3_3Z_classLit = createForArray('', '[[Z', 388, _3Z_classLit), Lcs_min2phase_CubieCube_2_classLit = createForClass('cs.min2phase.', 'CubieCube', 145, Ljava_lang_Object_2_classLit), _3Lcs_min2phase_CubieCube_2_classLit = createForArray('[Lcs.min2phase.', 'CubieCube;', 389, Lcs_min2phase_CubieCube_2_classLit), Lcs_sq12phase_Shape_2_classLit = createForClass('cs.sq12phase.', 'Shape', 151, Ljava_lang_Object_2_classLit), Ljava_lang_NumberFormatException_2_classLit = createForClass('java.lang.', 'NumberFormatException', 187, Ljava_lang_IllegalArgumentException_2_classLit), Lcom_google_gwt_dom_client_DOMImplTrident_2_classLit = createForClass('com.google.gwt.dom.client.', 'DOMImplTrident', 30, Lcom_google_gwt_dom_client_DOMImpl_2_classLit), Lcom_google_gwt_dom_client_DOMImplIE8_2_classLit = createForClass('com.google.gwt.dom.client.', 'DOMImplIE8', 31, Lcom_google_gwt_dom_client_DOMImplTrident_2_classLit), Lcom_google_gwt_dom_client_DOMImplStandard_2_classLit = createForClass('com.google.gwt.dom.client.', 'DOMImplStandard', 34, Lcom_google_gwt_dom_client_DOMImpl_2_classLit), Lcom_google_gwt_dom_client_DOMImplMozilla_2_classLit = createForClass('com.google.gwt.dom.client.', 'DOMImplMozilla', 35, Lcom_google_gwt_dom_client_DOMImplStandard_2_classLit), Lcom_google_gwt_dom_client_DOMImplStandardBase_2_classLit = createForClass('com.google.gwt.dom.client.', 'DOMImplStandardBase', 33, Lcom_google_gwt_dom_client_DOMImplStandard_2_classLit), Lcom_google_gwt_dom_client_DOMImplIE9_2_classLit = createForClass('com.google.gwt.dom.client.', 'DOMImplIE9', 32, Lcom_google_gwt_dom_client_DOMImplStandardBase_2_classLit), Lcom_google_gwt_dom_client_DOMImplOpera_2_classLit = createForClass('com.google.gwt.dom.client.', 'DOMImplOpera', 36, Lcom_google_gwt_dom_client_DOMImplStandard_2_classLit), Lcom_google_gwt_dom_client_DOMImplWebkit_2_classLit = createForClass('com.google.gwt.dom.client.', 'DOMImplWebkit', 37, Lcom_google_gwt_dom_client_DOMImplStandardBase_2_classLit), Lcom_google_gwt_dom_client_DOMImplIE6_2_classLit = createForClass('com.google.gwt.dom.client.', 'DOMImplIE6', 29, Lcom_google_gwt_dom_client_DOMImplTrident_2_classLit), Ljava_util_Comparators$1_2_classLit = createForClass('java.util.', 'Comparators$1', 225, Ljava_lang_Object_2_classLit), Lcom_google_gwt_safehtml_shared_SafeUriString_2_classLit = createForClass('com.google.gwt.safehtml.shared.', 'SafeUriString', 107, Ljava_lang_Object_2_classLit), Ljava_util_LinkedHashMap_2_classLit = createForClass('java.util.', 'LinkedHashMap', 230, Ljava_util_HashMap_2_classLit), Ljava_util_LinkedHashMap$ChainEntry_2_classLit = createForClass('java.util.', 'LinkedHashMap$ChainEntry', 231, Ljava_util_MapEntryImpl_2_classLit), Ljava_util_LinkedHashMap$EntrySet_2_classLit = createForClass('java.util.', 'LinkedHashMap$EntrySet', 233, Ljava_util_AbstractSet_2_classLit), Ljava_util_LinkedHashMap$EntrySet$EntryIterator_2_classLit = createForClass('java.util.', 'LinkedHashMap$EntrySet$EntryIterator', 234, Ljava_lang_Object_2_classLit), Lcs_threephase_EdgeCube_2_classLit = createForClass('cs.threephase.', 'EdgeCube', 159, Ljava_lang_Object_2_classLit), Lcs_threephase_CenterCube_2_classLit = createForClass('cs.threephase.', 'CenterCube', 156, Ljava_lang_Object_2_classLit), Lcs_threephase_CornerCube_2_classLit = createForClass('cs.threephase.', 'CornerCube', 157, Ljava_lang_Object_2_classLit), _3Lcs_threephase_CornerCube_2_classLit = createForArray('[Lcs.threephase.', 'CornerCube;', 390, Lcs_threephase_CornerCube_2_classLit), Lcs_threephase_Center1_2_classLit = createForClass('cs.threephase.', 'Center1', 153, Ljava_lang_Object_2_classLit), Ljava_util_AbstractQueue_2_classLit = createForClass('java.util.', 'AbstractQueue', 210, Ljava_util_AbstractCollection_2_classLit), Ljava_util_PriorityQueue_2_classLit = createForClass('java.util.', 'PriorityQueue', 239, Ljava_util_AbstractQueue_2_classLit), Lcs_threephase_Center2_2_classLit = createForClass('cs.threephase.', 'Center2', 154, Ljava_lang_Object_2_classLit), Lcs_threephase_Center3_2_classLit = createForClass('cs.threephase.', 'Center3', 155, Ljava_lang_Object_2_classLit), Lcs_sq12phase_Square_2_classLit = createForClass('cs.sq12phase.', 'Square', 152, Ljava_lang_Object_2_classLit), Lnet_gnehzr_tnoodle_svglite_Rectangle_2_classLit = createForClass('net.gnehzr.tnoodle.svglite.', 'Rectangle', 293, Lnet_gnehzr_tnoodle_svglite_Element_2_classLit), Lnet_gnehzr_tnoodle_utils_TimedLogRecordStart_2_classLit = createForClass('net.gnehzr.tnoodle.utils.', 'TimedLogRecordStart', 301, Ljava_util_logging_LogRecord_2_classLit), Lnet_gnehzr_tnoodle_utils_TimedLogRecordEnd_2_classLit = createForClass('net.gnehzr.tnoodle.utils.', 'TimedLogRecordEnd', 300, Ljava_util_logging_LogRecord_2_classLit), Lnet_gnehzr_tnoodle_svglite_Ellipse_2_classLit = createForClass('net.gnehzr.tnoodle.svglite.', 'Ellipse', 283, Lnet_gnehzr_tnoodle_svglite_Element_2_classLit), Lnet_gnehzr_tnoodle_svglite_Circle_2_classLit = createForClass('net.gnehzr.tnoodle.svglite.', 'Circle', 282, Lnet_gnehzr_tnoodle_svglite_Ellipse_2_classLit), Ljava_util_TreeSet_2_classLit = createForClass('java.util.', 'TreeSet', 252, Ljava_util_AbstractSet_2_classLit), Lcom_google_gwt_json_client_JSONException_2_classLit = createForClass('com.google.gwt.json.client.', 'JSONException', 67, Ljava_lang_RuntimeException_2_classLit), Lnet_gnehzr_tnoodle_svglite_PathIterator_2_classLit = createForClass('net.gnehzr.tnoodle.svglite.', 'PathIterator', 291, Ljava_lang_Object_2_classLit), Lnet_gnehzr_tnoodle_svglite_Text_2_classLit = createForClass('net.gnehzr.tnoodle.svglite.', 'Text', 295, Lnet_gnehzr_tnoodle_svglite_Element_2_classLit), Ljava_util_TreeMap_2_classLit = createForClass('java.util.', 'TreeMap', 240, Ljava_util_AbstractMap_2_classLit), Ljava_util_TreeMap$EntryIterator_2_classLit = createForClass('java.util.', 'TreeMap$EntryIterator', 242, Ljava_lang_Object_2_classLit), Ljava_util_TreeMap$EntrySet_2_classLit = createForClass('java.util.', 'TreeMap$EntrySet', 243, Ljava_util_AbstractSet_2_classLit), Ljava_util_TreeMap$Node_2_classLit = createForClass('java.util.', 'TreeMap$Node', 244, Ljava_lang_Object_2_classLit), _3Ljava_util_TreeMap$Node_2_classLit = createForArray('[Ljava.util.', 'TreeMap$Node;', 391, Ljava_util_TreeMap$Node_2_classLit), Ljava_util_TreeMap$State_2_classLit = createForClass('java.util.', 'TreeMap$State', 245, Ljava_lang_Object_2_classLit), Ljava_util_TreeMap$SubMap_2_classLit = createForClass('java.util.', 'TreeMap$SubMap', 246, Ljava_util_AbstractMap_2_classLit), Ljava_util_TreeMap$SubMapType_2_classLit = createForEnum('java.util.', 'TreeMap$SubMapType', 248, Ljava_lang_Enum_2_classLit, values_2), _3Ljava_util_TreeMap$SubMapType_2_classLit = createForArray('[Ljava.util.', 'TreeMap$SubMapType;', 392, Ljava_util_TreeMap$SubMapType_2_classLit), Ljava_util_TreeMap$SubMap$1_2_classLit = createForClass('java.util.', 'TreeMap$SubMap$1', 247, Ljava_util_AbstractSet_2_classLit), Ljava_util_TreeMap$SubMapType$1_2_classLit = createForEnum('java.util.', 'TreeMap$SubMapType$1', 249, Ljava_util_TreeMap$SubMapType_2_classLit, null), Ljava_util_TreeMap$SubMapType$2_2_classLit = createForEnum('java.util.', 'TreeMap$SubMapType$2', 250, Ljava_util_TreeMap$SubMapType_2_classLit, null), Ljava_util_TreeMap$SubMapType$3_2_classLit = createForEnum('java.util.', 'TreeMap$SubMapType$3', 251, Ljava_util_TreeMap$SubMapType_2_classLit, null), Ljava_util_TreeMap$1_2_classLit = createForClass('java.util.', 'TreeMap$1', 241, Ljava_lang_Object_2_classLit), Ljava_util_AbstractSequentialList_2_classLit = createForClass('java.util.', 'AbstractSequentialList', 211, Ljava_util_AbstractList_2_classLit), Ljava_util_LinkedList_2_classLit = createForClass('java.util.', 'LinkedList', 235, Ljava_util_AbstractSequentialList_2_classLit), Ljava_util_LinkedList$ListIteratorImpl_2_classLit = createForClass('java.util.', 'LinkedList$ListIteratorImpl', 236, Ljava_lang_Object_2_classLit), Ljava_util_LinkedList$Node_2_classLit = createForClass('java.util.', 'LinkedList$Node', 237, Ljava_lang_Object_2_classLit), Lcom_google_gwt_json_client_JSONBoolean_2_classLit = createForClass('com.google.gwt.json.client.', 'JSONBoolean', 66, Lcom_google_gwt_json_client_JSONValue_2_classLit), Lcom_google_gwt_json_client_JSONNull_2_classLit = createForClass('com.google.gwt.json.client.', 'JSONNull', 68, Lcom_google_gwt_json_client_JSONValue_2_classLit), Lcom_google_gwt_i18n_client_NumberFormat_2_classLit = createForClass('com.google.gwt.i18n.client.', 'NumberFormat', 61, Ljava_lang_Object_2_classLit), Lcom_google_gwt_i18n_client_constants_NumberConstantsImpl_1_2_classLit = createForClass('com.google.gwt.i18n.client.constants.', 'NumberConstantsImpl_', 62, Ljava_lang_Object_2_classLit);
if (tnoodlejs) tnoodlejs.onScriptLoad(gwtOnLoad);})();
}
TNOODLEJS_GWT();

var tnoodle = tnoodle || {};

(function() {

    function workerCodeFunction() {
        function assert(expr) {
            if(!expr) {
                throw "";
            }
        }

        // Natural sort stolen from http://www.davekoelle.com/files/alphanum.js and made lint happy
        /* alphanum.js (C) Brian Huisman
         * Based on the Alphanum Algorithm by David Koelle
         * The Alphanum Algorithm is discussed at http://www.DaveKoelle.com
         *
         * Distributed under same license as original
         *
         * This library is free software; you can redistribute it and/or
         * modify it under the terms of the GNU Lesser General Public
         * License as published by the Free Software Foundation; either
         * version 2.1 of the License, or any later version.
         *
         * This library is distributed in the hope that it will be useful,
         * but WITHOUT ANY WARRANTY; without even the implied warranty of
         * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
         * Lesser General Public License for more details.
         *
         * You should have received a copy of the GNU Lesser General Public
         * License along with this library; if not, write to the Free Software
         * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
         */

        /* ********************************************************************
         * Alphanum sort() function version - case sensitive
         *  - Slower, but easier to modify for arrays of objects which contain
         *    string properties
         *
         */
        function alphanum(a, b) {
            function chunkify(t) {
                var tz = [];
                var x = 0, y = -1, n = 0, i, j;

                while (true) {
                    j = t.charAt(x++);
                    i = j.charCodeAt(0);
                    if(!i) {
                        break;
                    }
                    var m = (i == 46 || (i >=48 && i <= 57));
                    if (m !== n) {
                        tz[++y] = "";
                        n = m;
                    }
                    tz[y] += j;
                }
                return tz;
            }

            var aa = chunkify(a);
            var bb = chunkify(b);

            for (var x = 0; aa[x] && bb[x]; x++) {
                if (aa[x] !== bb[x]) {
                    var c = Number(aa[x]), d = Number(bb[x]);
                    if (c == aa[x] && d == bb[x]) {
                        return c - d;
                    } else return (aa[x] > bb[x]) ? 1 : -1;
                }
            }
            return aa.length - bb.length;
        }

        // Simulating window referring to the global scope.

        /*jshint -W079 */
        var window = self;
        var document = {};

        window.document = document;
        document['write'] = function() {};
        window.write = document['write'];
        document.getElementById = function() {};
        document.getElementsByTagName = function() {return [];};
        document.readyState = 'loaded';
        if(window.location) {
            // Firefox actually does set self.location for webworkers
            document.location = window.location;
        } else {
            window.location = { href: "", search: "" };
            document.location = window.location;
        }

        var msg_from_parent = function(e) {
            if(!e.data.shortName) {
                assert(false);
                return;
            }
            var shortName = e.data.shortName;
            var puzzle = puzzles[shortName];
            if(e.data.pii) {
                var pii = tnoodlejs.getPuzzleImageInfo(puzzle);
                self.postMessage({ shortName: shortName, pii: pii });
            } else if(e.data.drawSvg) {
                var colorScheme = e.data.scheme;
                var scramble = e.data.scramble;
                var svg = tnoodlejs.scrambleToSvg(scramble, puzzle, colorScheme);
                self.postMessage({ scrambleSvg: svg });
            } else if(e.data.scramble) {
                var seed = e.data.seed;
                var count = e.data.count || 1;
                var scrambles;
                if(seed) {
                    scrambles = puzzle.generateSeededScrambles(seed, count);
                } else {
                    scrambles = puzzle.generateScrambles(count);
                }
                // Something about the array gwt returns us isn't something we
                // can pass around in a webworker.
                scrambles = scrambles.slice();
                self.postMessage({ shortName: shortName, scrambles: scrambles });
            } else {
                assert(false, "Unrecognized message from parent: " + e.data);
            }
        };
        self.addEventListener('message', msg_from_parent, false);

        var puzzles = null;
        window.puzzlesLoaded = function(puzzles_) {
            puzzles = puzzles_;
            var expectedPuzzles = [];
            for(var shortName in puzzles) {
                if(shortName == "444") {
                    // 444 is a random state scrambler, and is too resource
                    // intensive for a browser. People should use 444fast
                    // (a random turn scrambler) instead.
                    continue;
                }
                var puzzle = puzzles[shortName];
                expectedPuzzles.push({
                    shortName: shortName,
                    longName: puzzle.getLongName()
                });
            }

            expectedPuzzles.sort(function(a, b) {
                return alphanum(a.shortName, b.shortName);
            });
            self.postMessage({ puzzles: expectedPuzzles });
        };
    }

    tnoodle.Scrambler = function() {
        var puzzles = null;
        var puzzlesCallbacks = [];
        var scramblesCallbacks = [];
        var scrambleImageCallbacks = [];
        var piiCallbacks = [];
        function msg_from_worker(e) {
            if(e.data.puzzles) {
                puzzles = e.data.puzzles;
                for(var i = 0; i < puzzlesCallbacks.length; i++) {
                    var puzzlesCallback = puzzlesCallbacks[i];
                    puzzlesCallback(puzzles);
                    puzzlesCallback = null;
                }
                puzzlesCallbacks = null;

                maybeCallPendingFunctions();
            } else if(e.data.scrambles) {
                var scramblesCallback = scramblesCallbacks.shift();
                scramblesCallback(e.data.scrambles);
            } else if(e.data.pii) {
                var piiCallback = piiCallbacks.shift();
                piiCallback(e.data.pii);
            } else if(e.data.scrambleSvg) {
                var scrambleImageCallback = scrambleImageCallbacks.shift();
                scrambleImageCallback(e.data.scrambleSvg);
            } else {
                assert(false);
            }
        }
        function on_worker_error(e) {
            throw e;
        }

        // Inspired by http://blog.garron.us/2013/introducing-magicworker-js/
        function getFunctionSource(func) {
            var src = func.toString();
            var openCode = src.indexOf("{") + 1;
            var closeCode = src.lastIndexOf("}");
            return src.substring(openCode, closeCode);
        }
        var workerCode = getFunctionSource(workerCodeFunction);
        var gwtCode = getFunctionSource(TNOODLEJS_GWT);
        var blob = new Blob([workerCode + "\n" + gwtCode]);
        var url = window.URL.createObjectURL(blob);
        var w = new Worker(url);
        w.addEventListener('message', msg_from_worker, false);
        w.addEventListener('error', on_worker_error, false);

        var gwtPuzzles = null;
        window.puzzlesLoaded = function(puzzles_) {
            gwtPuzzles = puzzles_;
            maybeCallPendingFunctions();
        };

        function assert(expr) {
            if(!expr) {
                throw "";
            }
        }
        var that = this;

        this.loadPuzzles = function(callback, includeStatus) {
            if(puzzles) {
                callback(puzzles);
            } else {
                puzzlesCallbacks.push(callback);
            }
        };

        this.loadScramble = function(callback, puzzle, seed) {
            return this.loadScrambles(function(scrambles) {
                callback(scrambles[0]);
            }, puzzle, seed, 1);
        };
        var requestCount = 0;
        this.loadScrambles = function(callback, shortName, seed, count) {
            w.postMessage({ shortName: shortName, scramble: true, seed: seed, count: count });
            scramblesCallbacks.push(callback);
        };
        this.loadPuzzleImageInfo = function(callback, shortName) {
            // callback must be a function(defaultPuzzleInfo)
            // where defaultPuzzleInfo.faces is a {} mapping face names to arrays of points
            // defaultPuzzleInfo.size is the size of the scramble image
            // defaultPuzzleInfo.colorScheme is a {} mapping facenames to hex color strings
            w.postMessage({ shortName: shortName, pii: true });
            piiCallbacks.push(callback);
        };
        this.loadScrambleSvg = function(callback, shortName, scramble, colorScheme) {
            var scheme = null;
            if(colorScheme) {
                scheme = this.flattenColorScheme(colorScheme);
            }
            w.postMessage({ drawSvg: true, shortName: shortName, scramble: scramble, scheme: scheme });
            scrambleImageCallbacks.push(function(svgStr) {
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = svgStr;
                var svg = tempDiv.firstElementChild;
                callback(svg);
            });
        };

        var pendingFunctions = [];
        function maybeCallPendingFunctions() {
            if(!gwtPuzzles || !puzzles) {
                // We wait for both our webworker to load (puzzles),
                // and for the main thread to load (gwtPuzzles).
                return;
            }
            for(var i = 0; i < pendingFunctions.length; i++) {
                var func_args = pendingFunctions[i];
                var func = func_args[0];
                var args = func_args[1];
                func_args[0].apply(that, args);
            }
            pendingFunctions.length = 0;
        }
        function waitForLoadWrapper(func) {
            return function() {
                if(puzzles === null) {
                    pendingFunctions.push([func, arguments]);
                } else {
                    func.apply(this, arguments);
                }
            };
        }
        for(var method in this) {
            this[method] = waitForLoadWrapper(this[method]);
        }

        // Note that these functions don't get wrapped

        this.toString = function() {
            return "tnoodlejs";
        };
        this.getPuzzleIcon = function(shortName) {
            var puzzle = gwtPuzzles[shortName];
            return tnoodlejs.getPuzzleIcon(puzzle);
        };

        var uploadForm = null;
        this.getUploadForm = function(onsubmit, onload) {
            // TODO onsubmit and onload are only used the first time this method is called
            if(uploadForm === null) {
                uploadForm = document.createElement('div');

                var fileInput = document.createElement("input");
                fileInput.setAttribute('type', 'file');
                fileInput.addEventListener('change', function(e) {
                    var files = e.target.files;
                    submit.disabled = files.length === 0;
                }, false);

                var submit = document.createElement('input');
                submit.type = 'button';
                submit.value = 'Load Scrambles';
                submit.disabled = true;
                submit.addEventListener('click', function(e) {
                    var files = fileInput.files;
                    assert(files.length == 1);
                    var file = files[0];
                    var fileReader = new FileReader();
                    fileReader.onload = function(e) {
                        onload(e.target.result.split("\n"));
                    };
                    fileReader.readAsText(file);
                    onsubmit(file.name, submit, fileReader);
                });

                uploadForm.appendChild(fileInput);
                uploadForm.appendChild(submit);
            }
            return uploadForm;
        };

        this.flattenColorScheme = function(colorScheme) {
            var faces = [];
            for(var face in colorScheme) {
                if(colorScheme.hasOwnProperty(face)) {
                    faces.push(face);
                }
            }
            faces.sort();
            var scheme = '';
            for(var i = 0; i < faces.length; i++) {
                if(i > 0) { scheme += ','; }
                scheme += colorScheme[faces[i]];
            }
            return scheme;
        };
    };
})();
