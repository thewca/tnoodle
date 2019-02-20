package net.gnehzr.tnoodle.server.webscrambles;

import static net.gnehzr.tnoodle.utils.GsonUtils.GSON;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.TimeZone;
import java.util.concurrent.TimeUnit;

import net.lingala.zip4j.exception.ZipException;
import net.lingala.zip4j.io.ZipOutputStream;

import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.itextpdf.text.DocumentException;

import net.lingala.zip4j.model.ZipParameters;

import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;;

public class OrderedScrambles {

    private static final String wcifIgnorableKey = "other";

    public static void generateOrderedScrambles(String globalTitle, Date generationDate, ZipOutputStream zipOut, ZipParameters parameters, String schedule, String json) throws DocumentException, IOException, ZipException {
        JsonObject scheduleJson = new JsonParser().parse(schedule).getAsJsonObject();

        boolean hasMultipleDays = Integer.parseInt(scheduleJson.get("numberOfDays").toString())>1;
        boolean hasMultipleVenues = scheduleJson.getAsJsonArray("venues").size()>1;
        
        for (JsonElement venue : scheduleJson.getAsJsonArray("venues")) {
            String venueName = parseMarkdown(removeQuotation(venue.getAsJsonObject().get("name").toString()));
            TimeZone timezone = TimeZone.getTimeZone(removeQuotation(venue.getAsJsonObject().get("timezone").toString()));
            
            Date competitionStartDate = getEarlierActivityTime(scheduleJson, timezone);
            
            DateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
            sdf.setTimeZone(timezone);

            boolean hasMultipleRooms = venue.getAsJsonObject().getAsJsonArray("rooms").size()>1;

            for (JsonElement room : venue.getAsJsonObject().getAsJsonArray("rooms")) {

                ArrayList<Long> dayList = new ArrayList<Long>();
                ArrayList<ArrayList<ScrambleRequest>> scrambleRequestListByDay = new ArrayList<ArrayList<ScrambleRequest>>();
                
                String roomName = removeQuotation(room.getAsJsonObject().get("name").toString());

                for (JsonElement activity : room.getAsJsonObject().getAsJsonArray("activities")) {
                    String activityCode = removeQuotation(activity.getAsJsonObject().get("activityCode").toString());

                    String[] activityList = activityCode.split("-");
                    String eventId = activityList[0];

                    if (!eventId.equals(wcifIgnorableKey)) {

                        Date activityStartTime;

                        try {
                            activityStartTime = sdf.parse(removeQuotation(activity.getAsJsonObject().get("startTime").toString()));
                        } catch (ParseException e) {
                            // log: activity with invalid startTime
                            return;
                        }
                        long activityDay = dayDifferente(competitionStartDate, activityStartTime, timezone)+1;

                        if (!dayList.contains(activityDay)) {
                            dayList.add(activityDay);
                            scrambleRequestListByDay.add(new ArrayList<ScrambleRequest>());
                        }

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
                        Collections.sort(scrambleRequestListByDay.get(index));
                        
                        String pdfFileName = "Printing/Ordered Scrambles/";

                        if (hasMultipleVenues) {
                            pdfFileName += venueName+"/";
                        }

                        if (hasMultipleDays) {
                            pdfFileName += "Day "+dayList.get(index)+"/";
                        }

                        pdfFileName += "Ordered Scrambles";
                        
                        if (hasMultipleDays) {
                            pdfFileName += " - Day "+dayList.get(index);
                        }
                        
                        if (hasMultipleRooms) {
                            pdfFileName += " - "+roomName;
                        }
                        pdfFileName += ".pdf";

                        parameters.setFileNameInZip(pdfFileName);
                        zipOut.putNextEntry(null, parameters);
                        ScrambleRequest[] scrambleRequests = scrambleRequestListByDay.get(index).toArray(new ScrambleRequest[scrambleRequestListByDay.get(index).size()]);
                        ByteArrayOutputStream baos = ScrambleRequest.requestsToPdf(globalTitle, generationDate, scrambleRequests, null);
                        zipOut.write(baos.toByteArray());
                        zipOut.closeEntry();
                    }
                }
            }
            
            // TODO: there's an issue with the first event of some days in WC2019
            // Java is very annoying with dates
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

    private static long dayDifferente(Date date1, Date date2, TimeZone timezone) {
        
        Calendar cal1 = Calendar.getInstance();
        cal1.setTime(date1);
        cal1.set(Calendar.HOUR_OF_DAY, 0);
        cal1.set(Calendar.MINUTE, 0);
        cal1.set(Calendar.SECOND, 0);
        cal1.set(Calendar.MILLISECOND, 0);
        
        Calendar cal2 = Calendar.getInstance();
        cal2.setTime(date2);
        cal2.set(Calendar.HOUR_OF_DAY, 0);
        cal2.set(Calendar.MINUTE, 0);
        cal2.set(Calendar.SECOND, 0);
        cal2.set(Calendar.MILLISECOND, 0);
        
        long diff = Math.abs(cal1.getTimeInMillis() - cal2.getTimeInMillis());
        return TimeUnit.MILLISECONDS.toDays(diff);
    }

    private static Date getEarlierActivityTime(JsonObject scheduleJson, TimeZone timezone) {

        DateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'");
        sdf.setTimeZone(timezone);
        Date date = null;

        for (JsonElement venue : scheduleJson.getAsJsonArray("venues")) {
            for (JsonElement room : venue.getAsJsonObject().getAsJsonArray("rooms")) {
                for (JsonElement activity : room.getAsJsonObject().getAsJsonArray("activities")) {

                    try {
                        Date activityStartTime = sdf.parse(removeQuotation(activity.getAsJsonObject().get("startTime").toString()));
                        if (date == null || activityStartTime.before(date)) {
                            date = activityStartTime;
                        }
                    } catch (ParseException e) {

                    }
                }
            }
        }
        return date;
    }
}
