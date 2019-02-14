package net.gnehzr.tnoodle.server.webscrambles;

import static net.gnehzr.tnoodle.utils.GsonUtils.GSON;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

public class OrderedScrambles {
    
    private static final String wcifIgnorableKey = "other";

    public static void generateOrderedScrambles(ByteArrayOutputStream zipOutput, String schedule, String json) {
        System.out.println(schedule);
        JsonObject scheduleJson = new JsonParser().parse(schedule).getAsJsonObject();
        
        for (JsonElement venue : scheduleJson.getAsJsonArray("venues")) {
            String venueName = parseMarkdown(removeQuotation(venue.getAsJsonObject().get("name").toString()));
            String timezone = removeQuotation(venue.getAsJsonObject().get("timezone").toString());
            
            for (JsonElement room : venue.getAsJsonObject().getAsJsonArray("rooms")) {
                ArrayList<ScrambleRequest> scrambleRequestList = new ArrayList<ScrambleRequest>(); 
                
                String roomName = removeQuotation(room.getAsJsonObject().get("name").toString());
                
                for (JsonElement activity : room.getAsJsonObject().getAsJsonArray("activities")) {
                    String activityCode = removeQuotation(activity.getAsJsonObject().get("activityCode").toString());
                    
                    String[] activityList = activityCode.split("-");
                    String eventId = activityList[0];
                    
                    if (!eventId.equals(wcifIgnorableKey)) {

                        System.out.println(activityCode);
                        
                        ScrambleRequest[] scrambleRequests = GSON.fromJson(json, ScrambleRequest[].class);
                        
                        int round = -1;
                        int group = -1;
                        int attempt = -1;
                        
                        for (String item : activityList) {
                            if (item.charAt(0) == 'r') {
                                round = Integer.parseInt(""+item.charAt(1));
                            }
                            else if (item.charAt(0) == 'g') {
                                group = Integer.parseInt(""+item.charAt(1));
                            }
                            else if (item.charAt(0) == 'a') {
                                attempt = Integer.parseInt(""+item.charAt(1));
                            }
                        }
                        
                        // first, we add all requests whose events equals what we need
                        for (ScrambleRequest item : scrambleRequests) {
                            if ((item.event).equals(eventId)) {
                                scrambleRequestList.add(item);
                            }
                        }
                        /*
                        // then, we start removing                        
                        if (round > 0) {
                            ArrayList<ScrambleRequest> temp = new ArrayList<ScrambleRequest>();
                            for (ScrambleRequest scrambleRequest : scrambleRequestList) {
                                if (scrambleRequest.round == round) {
                                    temp.add(scrambleRequest);
                                }
                            }
                            scrambleRequestList = new ArrayList<ScrambleRequest>(temp);
                        }
                        if (group > 0) {
                            for (ScrambleRequest scrambleRequest : scrambleRequestList) {
                                if (scrambleRequest.group != group) {
                                    scrambleRequestList.remove(scrambleRequest);
                                }
                            }
                        }
                        if (attempt > 0) {
                            
                            for (ScrambleRequest scrambleRequest : scrambleRequestList) {
                                scrambleRequest.scrambles = new String[]{scrambleRequest.scrambles[attempt-1]};
                                System.out.println("Attempt: "+attempt);
                                for (String scramble : scrambleRequest.scrambles) {
                                    System.out.println(scramble);
                                }
                            }
                        }*/
                    }
                    System.out.println("");
                }
            }
        }
    }
    
    private static String removeQuotation(String s) {
        if (s.charAt(0) == '"') {
            s = s.substring(1, s.length());
        }
        if (s.charAt(s.length()-1) == '"') {
            s = s.substring(0, s.length()-1);
        }
        return s;
    }
    
    private static String parseMarkdown(String s) {
        if (s.indexOf('[') >= 0 && s.indexOf(']') >= 0) {
            s = s.substring(s.indexOf('[')+1, s.indexOf(']'));
        }
        return s;
    }
    
}
