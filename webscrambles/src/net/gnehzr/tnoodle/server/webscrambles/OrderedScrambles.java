package net.gnehzr.tnoodle.server.webscrambles;

import static net.gnehzr.tnoodle.utils.GsonUtils.GSON;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.concurrent.TimeUnit;

import net.lingala.zip4j.exception.ZipException;
import net.lingala.zip4j.io.ZipOutputStream;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.itextpdf.text.DocumentException;

import net.lingala.zip4j.model.ZipParameters;

public class OrderedScrambles {
    
    private static final String wcifIgnorableKey = "other";

    public static void generateOrderedScrambles(String globalTitle, Date generationDate, ZipOutputStream zipOut, ZipParameters parameters, String schedule, String json) throws DocumentException, IOException, ZipException {
        JsonObject scheduleJson = new JsonParser().parse(schedule).getAsJsonObject();
        
        boolean hasMultipleVenues = scheduleJson.getAsJsonArray("venues").size()>1;
        
        for (JsonElement venue : scheduleJson.getAsJsonArray("venues")) {
            String venueName = parseMarkdown(removeQuotation(venue.getAsJsonObject().get("name").toString()));
            String timezone = removeQuotation(venue.getAsJsonObject().get("timezone").toString());
            
            boolean hasMultipleRooms = venue.getAsJsonObject().getAsJsonArray("rooms").size()>1;
            
            for (JsonElement room : venue.getAsJsonObject().getAsJsonArray("rooms")) {
                ArrayList<ScrambleRequest> scrambleRequestList = new ArrayList<ScrambleRequest>();
                
                String roomName = removeQuotation(room.getAsJsonObject().get("name").toString());
                
                for (JsonElement activity : room.getAsJsonObject().getAsJsonArray("activities")) {
                    String activityCode = removeQuotation(activity.getAsJsonObject().get("activityCode").toString());
                    
                    String[] activityList = activityCode.split("-");
                    String eventId = activityList[0];
                    
                    if (!eventId.equals(wcifIgnorableKey)) {

                        System.out.println(activityCode+" "+roomName);
                        
                        ScrambleRequest[] scrambleRequests = GSON.fromJson(json, ScrambleRequest[].class);
                        
                        int round = -1;
                        int group = -1;
                        int attempt = -1;
                        
                        for (String item : activityList) {
                            if (item.charAt(0) == 'r') {
                                round = Integer.parseInt(item.substring(1));
                            } else if (item.charAt(0) == 'g') {
                                group = Integer.parseInt(item.substring(1));
                            } else if (item.charAt(0) == 'a') {
                                attempt = Integer.parseInt(item.substring(1));
                            }
                        }
                        
                        ArrayList<ScrambleRequest> scrambleRequestTemp = new ArrayList<ScrambleRequest>();
                        // first, we add all requests whose events equals what we need
                        for (ScrambleRequest item : scrambleRequests) {
                            if ((item.event).equals(eventId)) {
                                scrambleRequestTemp.add(item);
                            }
                        }
                        
                        // then, we start removing
                        if (round > 0) {
                            ArrayList<ScrambleRequest> temp = new ArrayList<ScrambleRequest>();
                            for (ScrambleRequest scrambleRequest : scrambleRequestTemp) {
                                if (scrambleRequest.round == round) {
                                    temp.add(scrambleRequest);
                                }
                            }
                            scrambleRequestTemp = new ArrayList<ScrambleRequest>(temp);
                        }
                        
                        if (group > 0) {
                            ArrayList<ScrambleRequest> temp = new ArrayList<ScrambleRequest>();
                            for (ScrambleRequest scrambleRequest : scrambleRequestTemp) {
                                
                                if (compareFirstCharToNumber(scrambleRequest.group, group)) {
                                    temp.add(scrambleRequest);
                                }
                            }
                            scrambleRequestTemp = new ArrayList<ScrambleRequest>(temp);
                        }
                        
                        if (attempt > 0) {
                            
                            ArrayList<ScrambleRequest> temp = new ArrayList<ScrambleRequest>();
                            
                            for (ScrambleRequest scrambleRequest : scrambleRequestTemp) {
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
                            scrambleRequestTemp = new ArrayList<ScrambleRequest>(temp);
                        }
                        for (ScrambleRequest scrambleRequest : scrambleRequestTemp) {
                            scrambleRequestList.add(scrambleRequest);
                        }
                    }
                }

                String pdfFileName = "Printing/Ordered Scrambles/";
                if (hasMultipleVenues) {
                    pdfFileName += venueName+"/";
                }
                
                // Add day
                // Day logic goes here
                
                pdfFileName += "Ordered Scrambles";
                if (hasMultipleRooms) {
                    pdfFileName += " - "+roomName;
                }
                pdfFileName += ".pdf";
                
                parameters.setFileNameInZip(pdfFileName);
                zipOut.putNextEntry(null, parameters);
                ScrambleRequest[] scrambleRequests = scrambleRequestList.toArray(new ScrambleRequest[scrambleRequestList.size()]);
                ByteArrayOutputStream baos = ScrambleRequest.requestsToPdf(globalTitle, generationDate, scrambleRequests, null);
                zipOut.write(baos.toByteArray());
                zipOut.closeEntry();
            }
            
            // 333 and 333bf are swapped for WC2019
            // possible solution: add ScrambleRequest.roundStartDate make ScrambleRequest comparable by date
            // add scrambleRequestList
            
            // FMC sheets are generated wrongly in case of multiple attempts
            // this is due how the scrambleXofY boolean is assigned
            // possible solution: add ScrambleRequest.total attempt. If > 1, then use scrambleXofY
            // another is to check if scramble title has attempt on it, but we would lose the total number
        }
    }
    
    private static boolean compareFirstCharToNumber(String letter, int number) {
        return letter.charAt(0)-'A' == number-1;
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
    
    // https://stackoverflow.com/a/30184795/2697796
    private static long dayDifferente(Date date1, Date date2) {
        long diff = date2.getTime() - date1.getTime();
        return TimeUnit.DAYS.convert(diff, TimeUnit.MILLISECONDS);
    }
    
}
