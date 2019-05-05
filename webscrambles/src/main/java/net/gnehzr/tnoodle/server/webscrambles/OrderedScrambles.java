package net.gnehzr.tnoodle.server.webscrambles;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;

import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.Days;

import net.lingala.zip4j.exception.ZipException;
import net.lingala.zip4j.io.ZipOutputStream;
import net.lingala.zip4j.model.ZipParameters;

import com.google.gson.JsonElement;

import com.itextpdf.text.DocumentException;

import static net.gnehzr.tnoodle.server.webscrambles.Utils.toFileSafeString;
import static net.gnehzr.tnoodle.utils.GwtSafeUtils.azzert;

public class OrderedScrambles {
    
    // TODO see https://github.com/thewca/tnoodle/issues/400

    public static void generateOrderedScrambles(String globalTitle, Date generationDate, ZipOutputStream zipOut, ZipParameters parameters, WCIFHelper wcifHelper) throws DocumentException, IOException, ZipException {
        
        if (wcifHelper == null || wcifHelper.getSchedule() == null) {
            return;
        }
        
        azzert(wcifHelper.getAllScrambleRequests() != null, "There should be scramble requests.");
        
        // allActivities hold activities without repetition.
        // A ScrambleRequest is added to AllScramblesOrdered if its activity is not on allActivities.
        // This is needed because the same activity may happen on different rooms.
        ArrayList<ScrambleRequest> allScramblesOrdered = new ArrayList<ScrambleRequest>();
        ArrayList<String> allActivities = new ArrayList<String>();

        boolean hasMultipleDays = wcifHelper.hasMultipleDays();
        boolean hasMultipleVenues = wcifHelper.hasMultipleVenues();
        
        // We consider the competition start date as the earlier activity from the schedule.
        // This prevents miscalculation of dates for multiple timezones.
        String competitionStartString = wcifHelper.getEarlierActivityString();
        
        for (JsonElement venue : wcifHelper.getVenues()) {
            String venueName = wcifHelper.getSafeVenueName(venue);
                        
            DateTimeZone timezone = wcifHelper.getTimeZone(venue);
            DateTime competitionStartDate = new DateTime(competitionStartString, timezone);
            
            boolean hasMultipleRooms = wcifHelper.hasMultipleRooms(venue);

            for (JsonElement room : wcifHelper.getRooms(venue)) {

                ArrayList<Integer> dayList = new ArrayList<Integer>();
                ArrayList<ArrayList<ScrambleRequest>> scrambleRequestListByDay = new ArrayList<ArrayList<ScrambleRequest>>();
                
                String roomName = wcifHelper.getSafeRoomName(room);
                                
                for (JsonElement activity : wcifHelper.getActivities(room)) {
                    String activityCode = wcifHelper.getActivityCode(activity);
                    
                    int indexAllActivities = allActivities.indexOf(activityCode);
                    if (indexAllActivities < 0) {
                        allActivities.add(activityCode);
                    }

                    for (ScrambleRequest scrambleRequest : wcifHelper.getScrambleRequests(activityCode)) {

                        DateTime activityStartTime = wcifHelper.getActivityStartTime(activity, timezone);

                        int activityDay = Days.daysBetween(competitionStartDate.withTimeAtStartOfDay(), activityStartTime.withTimeAtStartOfDay()).getDays()+1;
                        
                        if (!dayList.contains(activityDay)) {
                            dayList.add(activityDay);
                            scrambleRequestListByDay.add(new ArrayList<ScrambleRequest>());
                        }

                        int index = dayList.indexOf(activityDay);
                        scrambleRequest.roundStartTime = activityStartTime;
                        scrambleRequestListByDay.get(index).add(scrambleRequest);
                        
                        // A case to be considered here is the scenario where the competition
                        // for whatever reason, has the same activity happening on different start time
                        // If this is true, we currently have no control on which one is going to be considered.
                        // This is not serious because it makes no sense to repeat activity on the schedule.
                        if (indexAllActivities < 0) {
                            allScramblesOrdered.add(scrambleRequest);
                        }
                    }
                }

                // hasMultipleDays gets a variable assigned on the competition creation using the website's form.
                // Online schedule fit to it and the user should not be able to put events outside it, but we double check here.
                // The next assignment fix possible mistakes (eg. a competition is assigned with 1 day, but events are spread among 2 days).
                hasMultipleDays = hasMultipleDays || dayList.size() > 1;

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
                        
                        // In addition to different folders, we stamp venue, day and room in the PDF's name
                        // to prevent different files with the same name.
                        if (hasMultipleVenues) {
                            pdfFileName += " - " + venueName;
                        }
                        
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
        }
        
        // Generate all scrambles ordered
        Collections.sort(allScramblesOrdered);
        String safeGlobalTitle = toFileSafeString(globalTitle);
        String pdfFileName = "Printing/Ordered Scrambles/Ordered "+safeGlobalTitle+" - All Scrambles.pdf";

        parameters.setFileNameInZip(pdfFileName);
        zipOut.putNextEntry(null, parameters);
        ScrambleRequest[] scrambleRequests = allScramblesOrdered.toArray(new ScrambleRequest[allScramblesOrdered.size()]);
        ByteArrayOutputStream baos = ScrambleRequest.requestsToPdf(globalTitle, generationDate, scrambleRequests, null);
        zipOut.write(baos.toByteArray());
        zipOut.closeEntry();
    }
}
