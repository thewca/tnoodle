package net.gnehzr.tnoodle.server.webscrambles;

import static net.gnehzr.tnoodle.utils.GsonUtils.GSON;
import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.LinkedHashMap;

import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.Days;

import net.lingala.zip4j.exception.ZipException;
import net.lingala.zip4j.io.ZipOutputStream;
import net.lingala.zip4j.model.ZipParameters;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import com.itextpdf.text.DocumentException;

public class OrderedScrambles {
    
    // TODO we are using Joda-Time for dates, via its .jar file
    // We can update java to java8 and use java.time, which is the same class, as of JSR-310
    // We can dismiss joda-time-2.10.1.jar from /lib

    private static final String wcifIgnorableKey = "other";

    public static void generateOrderedScrambles(String globalTitle, Date generationDate, ZipOutputStream zipOut, ZipParameters parameters, LinkedHashMap<String, String> query) throws DocumentException, IOException, ZipException {
        JsonObject scheduleJson = new JsonParser().parse(query.get("schedule")).getAsJsonObject();

        boolean hasMultipleDays = scheduleJson.get("numberOfDays").getAsInt()>1;
        boolean hasMultipleVenues = scheduleJson.getAsJsonArray("venues").size()>1;
        
        // We consider the competition start date as the earlier activity from the schedule.
        // This prevents miscalculation of dates for multiple timezones.
        String competitionStartString = getEarlierActivityString(scheduleJson);
        
        ScrambleRequest[] allScrambleRequests = GSON.fromJson(query.get("sheets"), ScrambleRequest[].class);
        
        for (JsonElement venue : scheduleJson.getAsJsonArray("venues")) {
            String venueName = parseMarkdown(venue.getAsJsonObject().get("name").getAsString());
                        
            DateTimeZone timezone = DateTimeZone.forID(venue.getAsJsonObject().get("timezone").getAsString());
            DateTime competitionStartDate = new DateTime(competitionStartString, timezone);
            
            boolean hasMultipleRooms = venue.getAsJsonObject().getAsJsonArray("rooms").size()>1;

            for (JsonElement room : venue.getAsJsonObject().getAsJsonArray("rooms")) {

                ArrayList<Integer> dayList = new ArrayList<Integer>();
                ArrayList<ArrayList<ScrambleRequest>> scrambleRequestListByDay = new ArrayList<ArrayList<ScrambleRequest>>();
                
                String roomName = room.getAsJsonObject().get("name").getAsString();
                                
                for (JsonElement activity : room.getAsJsonObject().getAsJsonArray("activities")) {
                    String activityCode = activity.getAsJsonObject().get("activityCode").getAsString();

                    String[] activityList = activityCode.split("-");
                    String eventId = activityList[0];

                    if (!eventId.equals(wcifIgnorableKey)) {

                        DateTime activityStartTime = new DateTime(activity.getAsJsonObject().get("startTime").getAsString(), timezone);

                        int activityDay = Days.daysBetween(competitionStartDate.withTimeAtStartOfDay(), activityStartTime.withTimeAtStartOfDay()).getDays()+1;
                        
                        if (!dayList.contains(activityDay)) {
                            dayList.add(activityDay);
                            scrambleRequestListByDay.add(new ArrayList<ScrambleRequest>());
                        }

                        int round = -1;
                        int group = -1;
                        int attempt = -1;
                        
                        // This part assumes every round, group and attempt is labeled with an integer from competitionJson
                        for (String item : activityList) {
                            if (item.charAt(0) == 'r') {
                                round = Integer.parseInt(item.substring(1));
                            } else if (item.charAt(0) == 'g') {
                                group = Integer.parseInt(item.substring(1));
                            } else if (item.charAt(0) == 'a') {
                                attempt = Integer.parseInt(item.substring(1));
                            }
                        }

                        // first, we add all requests whose events equals what we need
                        ArrayList<ScrambleRequest> scrambleRequestTemp = new ArrayList<ScrambleRequest>();
                        for (ScrambleRequest item : allScrambleRequests) {
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

                                if (compareLettersCharToNumber(scrambleRequest.group, group)) {
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
                        azzert(scrambleRequestTemp.size() > 0, "An activity of the schedule did not match an event.");

                        int index = dayList.indexOf(activityDay);
                        for (ScrambleRequest scrambleRequest : scrambleRequestTemp) {
                            scrambleRequest.roundStartTime = activityStartTime;
                            scrambleRequestListByDay.get(index).add(scrambleRequest);
                        }
                    }
                }

                for (int index = 0; index<dayList.size(); index++) {
                    if (scrambleRequestListByDay.get(index).size()>0) {
                        
                        // Since we are iterating over the schedule, this did not seem necessary,
                        // but it was for some cases (like the order of MBLD for WC2019).
                        Collections.sort(scrambleRequestListByDay.get(index));
                        
                        String pdfFileName = "Printing/Ordered Scrambles/";

                        if (hasMultipleVenues) {
                            pdfFileName += venueName.replace('/', ' ')+"/";
                        }

                        if (hasMultipleDays || dayList.size() > 1) { // Double check, just in case.
                            pdfFileName += "Day "+dayList.get(index)+"/";
                        }

                        pdfFileName += "Ordered Scrambles";
                        
                        // In addition to different folders, we stamp venue, day and room in the PDF's name
                        // to prevent different files with the same name.
                        if (hasMultipleVenues) {
                            pdfFileName += " - " + venueName.replace('/', ' ');
                        }
                        if (hasMultipleDays || dayList.size() > 1) {
                            pdfFileName += " - Day "+dayList.get(index);
                        }
                        
                        if (hasMultipleRooms) {
                            pdfFileName += " - "+roomName.replace('/', ' ');
                        }
                        pdfFileName += ".pdf";
                        
                        // removing slashes may add double+ extra spaces
                        pdfFileName = pdfFileName.replaceAll("\\s+", " ");

                        parameters.setFileNameInZip(pdfFileName);
                        zipOut.putNextEntry(null, parameters);
                        ScrambleRequest[] scrambleRequests = scrambleRequestListByDay.get(index).toArray(new ScrambleRequest[scrambleRequestListByDay.get(index).size()]);
                        ByteArrayOutputStream baos = ScrambleRequest.requestsToPdf(globalTitle, generationDate, scrambleRequests, null);
                        zipOut.write(baos.toByteArray());
                        zipOut.closeEntry();
                    }
                }
            }
        }
    }

    private static boolean compareLettersCharToNumber(String letters, int number) {
        int sum = 0;
        int pow = 1;
        for (int i=letters.length()-1; i >= 0; i--) {
            sum += (letters.charAt(i)-'A'+1)*pow;
            pow *= 26;
        }
        return sum == number;
    }

    // In case venue or room is using markdown
    private static String parseMarkdown(String s) {
        if (s.indexOf('[') >= 0 && s.indexOf(']') >= 0) {
            s = s.substring(s.indexOf('[')+1, s.indexOf(']'));
        }
        return s;
    }

    private static String getEarlierActivityString(JsonObject scheduleJson) {

        DateTime date = null;
        String out = null;
        for (JsonElement venue : scheduleJson.getAsJsonArray("venues")) {
            for (JsonElement room : venue.getAsJsonObject().getAsJsonArray("rooms")) {
                for (JsonElement activity : room.getAsJsonObject().getAsJsonArray("activities")) {
                    String tempString = activity.getAsJsonObject().get("startTime").getAsString();
                    DateTime tempDate = DateTime.parse(tempString);
                    if (date == null || tempDate.isBefore(date)) {
                        date = tempDate;
                        out = tempString;
                    }
                }
            }
        }
        azzert(out != null, "I could not find the earlier activity.");
        return out;
    }
}
