package net.gnehzr.tnoodle.server.webscrambles;

import static net.gnehzr.tnoodle.utils.GsonUtils.GSON;
import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;

import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class WCIFHelper {
    
    // Currently, we mark not cubing related activities as other-lunch or other-speech, for example.
    // If we ever accept any other such ignorable key, it should be added here.
    private static final String[] wcifIgnorableKeys = new String[]{"other"};

    private ArrayList<ScrambleRequest> allScrambleRequests;
    private JsonObject schedule;
    private JsonParser parser;

    public WCIFHelper(LinkedHashMap<String, String> query) {
        parser = new JsonParser();
        schedule = parser.parse(query.get("schedule")).getAsJsonObject();
        
        allScrambleRequests = new ArrayList<ScrambleRequest>(Arrays.asList(GSON.fromJson(query.get("sheets"), ScrambleRequest[].class)));
    }
    
    public boolean hasMultipleDays() {
        return schedule.get("numberOfDays").getAsInt()>1;
    }
    
    public boolean hasMultipleVenues() {
        return schedule.getAsJsonArray("venues").size()>1;
    }
    
    public JsonArray getVenues() {
        return schedule.getAsJsonArray("venues");
    }
    
    public JsonArray getRooms(JsonElement venue) {
        return venue.getAsJsonObject().getAsJsonArray("rooms");
    }
    
    public JsonArray getActivities(JsonElement room) {
        return room.getAsJsonObject().getAsJsonArray("activities");
    }
    
    public String getActivityStartTime(JsonElement activity) {
        return activity.getAsJsonObject().get("startTime").getAsString();
    }
    
    public String getSafeVenueName(JsonElement venue) {
        return ScrambleRequest.toFileSafeString(parseMarkdown(venue.getAsJsonObject().get("name").getAsString()));
    }
    
    public boolean hasMultipleRooms(JsonElement venue) {
        return venue.getAsJsonObject().getAsJsonArray("rooms").size()>1;
    }
    
    public String getSafeRoomName(JsonElement room) {
        return ScrambleRequest.toFileSafeString(parseMarkdown(room.getAsJsonObject().get("name").getAsString()));
    }
    
    public String getActivityCode(JsonElement activity) {
        return activity.getAsJsonObject().get("activityCode").getAsString();
    }
    
    public String getEarlierActivityString() {

        DateTime date = null;
        String out = null;
        for (JsonElement venue : getVenues()) {
            for (JsonElement room : getRooms(venue)) {
                for (JsonElement activity : getActivities(room)) {
                    String startTime = getActivityStartTime(activity);
                    DateTime tempDate = DateTime.parse(startTime);
                    if (date == null || tempDate.isBefore(date)) {
                        date = tempDate;
                        out = startTime;
                    }
                }
            }
        }
        azzert(out != null, "I could not find the earlier activity.");
        return out;
    }
    
    // In case venue or room is using markdown
    private String parseMarkdown(String s) {
        if (s.indexOf('[') >= 0 && s.indexOf(']') >= 0) {
            s = s.substring(s.indexOf('[')+1, s.indexOf(']'));
        }
        return s;
    }
    
    public DateTime getActivityStartTime(JsonElement activity, DateTimeZone timezone) {
        return new DateTime(activity.getAsJsonObject().get("startTime").getAsString(), timezone);
    }
    
    public DateTimeZone getTimeZone(JsonElement venue) {
        return DateTimeZone.forID(venue.getAsJsonObject().get("timezone").getAsString());
    }
    
    public ArrayList<ScrambleRequest> getScrambleRequests(String activityCode) {
        
        ArrayList<ScrambleRequest> scrambleRequests = new ArrayList<ScrambleRequest>();
        
        int round = 0;
        int group = 0;
        int attempt = 0;
        
        String[] activitySplit = activityCode.split("-");
        String event = activitySplit[0];
        
        if (Arrays.asList(wcifIgnorableKeys).indexOf(event) >= 0) {
            return scrambleRequests;
        }
        
        // This part assumes every round, group and attempt is labeled with an integer from competitionJson
        for (String item : activityCode.split("-")) {
            if (item.charAt(0) == 'r') {
                round = Integer.parseInt(item.substring(1));
            } else if (item.charAt(0) == 'g') {
                group = Integer.parseInt(item.substring(1));
            } else if (item.charAt(0) == 'a') {
                attempt = Integer.parseInt(item.substring(1));
            }
        }

        // First, we add all requests whose events equals what we need
        for (ScrambleRequest item : allScrambleRequests) {
            if ((item.event).equals(event)) {
                scrambleRequests.add(item);
            }
        }

        // Then, we start removing, iterating over a copy, removing from original.
        if (round > 0) {
            for (ScrambleRequest scrambleRequest : new ArrayList<ScrambleRequest>(scrambleRequests)) {
                if (scrambleRequest.round != round) {
                    scrambleRequests.remove(scrambleRequest);
                }
            }
        }

        if (group > 0) {
            for (ScrambleRequest scrambleRequest : new ArrayList<ScrambleRequest>(scrambleRequests)) {
                if (!compareLettersCharToNumber(scrambleRequest.group, group)) {
                    scrambleRequests.remove(scrambleRequest);
                }
            }
        }

        if (attempt > 0) {
            ArrayList<ScrambleRequest> temp = new ArrayList<ScrambleRequest>();
            for (ScrambleRequest scrambleRequest : scrambleRequests) {
                ScrambleRequest attemptRequest = new ScrambleRequest();
                attemptRequest.scrambles = new String[]{scrambleRequest.scrambles[attempt-1]};
                attemptRequest.extraScrambles = scrambleRequest.extraScrambles;
                attemptRequest.scrambler = scrambleRequest.scrambler;
                attemptRequest.copies = scrambleRequest.copies;

                attemptRequest.title = scrambleRequest.title;

                attemptRequest.fmc = scrambleRequest.fmc;
                attemptRequest.event = scrambleRequest.event;
                attemptRequest.colorScheme = scrambleRequest.colorScheme;
                attemptRequest.attempt = attempt;
                attemptRequest.totalAttempt = scrambleRequest.scrambles.length; // useful for fmc

                temp.add(attemptRequest);
            }
            scrambleRequests = new ArrayList<ScrambleRequest>(temp);
        }
        azzert(scrambleRequests.size() > 0, "An activity of the schedule did not match an event.");
        return scrambleRequests;
    }
    
    private boolean compareLettersCharToNumber(String letters, int number) {
        int sum = 0;
        int pow = 1;
        for (int i=letters.length()-1; i >= 0; i--) {
            sum += (letters.charAt(i)-'A'+1)*pow;
            pow *= 26;
        }
        return sum == number;
    }
}
