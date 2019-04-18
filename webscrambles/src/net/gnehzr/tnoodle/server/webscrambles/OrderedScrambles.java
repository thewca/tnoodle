package net.gnehzr.tnoodle.server.webscrambles;

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

import com.itextpdf.text.DocumentException;

public class OrderedScrambles {
    
    // TODO we are using Joda-Time for dates, via its .jar file
    // We can update java to java8 and use java.time, which is the same class, as of JSR-310
    // We can dismiss joda-time-2.10.1.jar from /lib

    public static void generateOrderedScrambles(String globalTitle, Date generationDate, ZipOutputStream zipOut, ZipParameters parameters, LinkedHashMap<String, String> query) throws DocumentException, IOException, ZipException {
        WCIFHandler wh = new WCIFHandler(query);

        boolean hasMultipleDays = wh.hasMultipleDays();
        boolean hasMultipleVenues = wh.hasMultipleVenues();
        
        // We consider the competition start date as the earlier activity from the schedule.
        // This prevents miscalculation of dates for multiple timezones.
        String competitionStartString = wh.getEarlierActivityString();
        
        for (JsonElement venue : wh.getVenues()) {
            String venueName = wh.getVenueName(venue);
                        
            DateTimeZone timezone = wh.getTimeZone(venue);
            DateTime competitionStartDate = new DateTime(competitionStartString, timezone);
            
            boolean hasMultipleRooms = wh.hasMultipleRooms(venue);

            for (JsonElement room : wh.getRooms(venue)) {

                ArrayList<Integer> dayList = new ArrayList<Integer>();
                ArrayList<ArrayList<ScrambleRequest>> scrambleRequestListByDay = new ArrayList<ArrayList<ScrambleRequest>>();
                
                String roomName = wh.getRoomName(room);
                                
                for (JsonElement activity : wh.getActivities(room)) {
                    String activityCode = wh.getActivityCode(activity);

                    for (ScrambleRequest scrambleRequest : wh.getScrambleRequests(activityCode)) {

                        DateTime activityStartTime = wh.getActivityStartTime(activity, timezone);

                        int activityDay = Days.daysBetween(competitionStartDate.withTimeAtStartOfDay(), activityStartTime.withTimeAtStartOfDay()).getDays()+1;
                        
                        if (!dayList.contains(activityDay)) {
                            dayList.add(activityDay);
                            scrambleRequestListByDay.add(new ArrayList<ScrambleRequest>());
                        }

                        int index = dayList.indexOf(activityDay);
                        scrambleRequest.roundStartTime = activityStartTime;
                        scrambleRequestListByDay.get(index).add(scrambleRequest);
                    }
                }

                for (int index = 0; index<dayList.size(); index++) {
                    if (scrambleRequestListByDay.get(index).size()>0) {
                        
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
}
