package net.gnehzr.tnoodle.android;

import android.graphics.drawable.PictureDrawable;
import android.graphics.drawable.Drawable;
import android.app.Activity;
import android.content.res.Resources;
import android.os.AsyncTask;
import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBar;
import android.support.v7.app.ActionBarActivity;
import android.util.Log;
import android.util.DisplayMetrics;
import android.view.Display;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewGroup.LayoutParams;
import android.view.WindowManager;
import android.widget.TextView;
import android.widget.ImageView;

import com.caverock.androidsvg.SVG;
import com.caverock.androidsvg.SVGParseException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.SortedMap;
import java.util.TreeMap;

import net.gnehzr.tnoodle.svglite.Svg;
import net.gnehzr.tnoodle.svglite.Dimension;
import net.gnehzr.tnoodle.scrambles.Puzzle;
import net.gnehzr.tnoodle.scrambles.PuzzlePlugins;
import net.gnehzr.tnoodle.utils.BadLazyClassDescriptionException;
import net.gnehzr.tnoodle.utils.LazyInstantiator;
import net.gnehzr.tnoodle.utils.LazyInstantiatorException;

public class SessionActivity extends ActionBarActivity
        implements NavigationDrawerFragment.NavigationDrawerCallbacks {
    private static final String TAG = SessionActivity.class.getName();

    /**
     * Fragment managing the behaviors, interactions and presentation of the navigation drawer.
     */
    private NavigationDrawerFragment mNavigationDrawerFragment;

    /**
     * Used to store the last screen title. For use in {@link #restoreActionBar()}.
     */
    private CharSequence mTitle;

    private PlaceholderFragment currentPlaceholderFragment;

    private static SortedMap<String, LazyInstantiator<Puzzle>> puzzles;
    private static ArrayList<String> shortNames;
    static {
        try {
            puzzles = new TreeMap<String, LazyInstantiator<Puzzle>>(PuzzlePlugins.getScramblers());

            shortNames = new ArrayList<String>(puzzles.keySet());
        } catch(IOException e) {
            Log.wtf(TAG, e);
        } catch(BadLazyClassDescriptionException e) {
            Log.wtf(TAG, e);
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_session);

        mNavigationDrawerFragment = (NavigationDrawerFragment)
            getSupportFragmentManager().findFragmentById(R.id.navigation_drawer);
        mTitle = getTitle();

        mNavigationDrawerFragment.setPuzzles(puzzles);

        // Set up the drawer.
        mNavigationDrawerFragment.setUp(
                R.id.navigation_drawer,
                (DrawerLayout) findViewById(R.id.drawer_layout));
    }


    @Override
    public void onNavigationDrawerItemSelected(int position) {
        // update the main content by replacing fragments
        FragmentManager fragmentManager = getSupportFragmentManager();
        String shortName = shortNames.get(position);
        currentPlaceholderFragment = PlaceholderFragment.newInstance(shortName);
        fragmentManager.beginTransaction()
                .replace(R.id.container, currentPlaceholderFragment)
                .commit();
    }

    private void doScramble() {
        if(currentPlaceholderFragment != null) {
            currentPlaceholderFragment.doScramble();
        }
    }

    public void onSectionAttached(String shortName) {
        mTitle = PuzzlePlugins.getScramblerLongName(shortName);
    }

    public void restoreActionBar() {
        ActionBar actionBar = getSupportActionBar();
        actionBar.setNavigationMode(ActionBar.NAVIGATION_MODE_STANDARD);
        actionBar.setDisplayShowTitleEnabled(true);
        actionBar.setTitle(mTitle);
    }


    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        if (!mNavigationDrawerFragment.isDrawerOpen()) {
            // Only show items in the action bar relevant to this screen
            // if the drawer is not showing. Otherwise, let the drawer
            // decide what to show in the action bar.
            getMenuInflater().inflate(R.menu.session, menu);
            restoreActionBar();
            return true;
        }
        return super.onCreateOptionsMenu(menu);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        switch (item.getItemId()) {
            case R.id.action_scramble:
                doScramble();
                return true;
            default:
                return super.onOptionsItemSelected(item);
        }
    }

    /**
     * A placeholder fragment containing a simple view.
     */
    public static class PlaceholderFragment extends Fragment {
        private static final String ARG_SHORT_NAME = "short_name";

        private Resources res;

        // Views
        private View rootView;
        private TextView scrambleView;
        private ImageView scrambleImageView;

        /**
         * Returns a new instance of this fragment for the given section
         * number.
         */
        public static PlaceholderFragment newInstance(String shortName) {
            PlaceholderFragment fragment = new PlaceholderFragment();
            Bundle args = new Bundle();
            args.putString(ARG_SHORT_NAME, shortName);
            fragment.setArguments(args);
            return fragment;
        }

        public PlaceholderFragment() {
        }


        private Puzzle puzzle;
        @Override
        public View onCreateView(LayoutInflater inflater, ViewGroup container,
                                 Bundle savedInstanceState) {

            res = getResources();
            rootView = inflater.inflate(R.layout.fragment_session, container, false);
            scrambleView = (TextView) rootView.findViewById(R.id.scramble);
            scrambleImageView = (ImageView) rootView.findViewById(R.id.scrambleImageView);

            String shortName = getShortName();
            LazyInstantiator<Puzzle> lazyPuzzle = puzzles.get(shortName);
            try {
                puzzle = lazyPuzzle.cachedInstance();
            } catch(LazyInstantiatorException e) {
                Log.wtf(TAG, e);
            }

            doScramble();
            return rootView;
        }

        private class ScrambleAndSvg {
            String scramble;
            Svg svg;
            public ScrambleAndSvg(String scramble, Svg svg) {
                this.scramble = scramble;
                this.svg = svg;
            }
        }

        private class ScrambleTask extends AsyncTask<Puzzle, Void, ScrambleAndSvg> {

            public ScrambleTask() { }

            private Exception exception;
            protected ScrambleAndSvg doInBackground(Puzzle... puzzles) {
                try {
                    assert puzzles.length == 1;
                    Puzzle puzzle = puzzles[0];
                    String scramble = puzzle.generateScramble();
                    Svg svg = puzzle.drawScramble(scramble, null);
                    return new ScrambleAndSvg(scramble, svg);
                } catch(Exception e) {
                    this.exception = e;
                    return null;
                }
            }

            private void handleException() {
                Log.w(TAG, exception);
            }

            protected void onCancelled(ScrambleAndSvg scrambleAndSvg) {
                if(exception != null) {
                    handleException();
                    return;
                }
            }

            protected void onPostExecute(ScrambleAndSvg scrambleAndSvg) {
                if(exception != null) {
                    handleException();
                    return;
                }
                String scramble = scrambleAndSvg.scramble;
                Svg svgLite = scrambleAndSvg.svg;
                Dimension size = svgLite.getSize();

                scrambleView.setText(scramble);

                try {
                    SVG svg = SVG.getFromString(svgLite.toString());
                    Drawable drawable = new PictureDrawable(svg.renderToPicture());
                    // See https://code.google.com/p/svg-android/wiki/Tutorial
                    // for why we must disable hw rendering.
                    scrambleImageView.setLayerType(View.LAYER_TYPE_SOFTWARE, null);
                    scrambleImageView.setImageDrawable(drawable);
                    LayoutParams params = (LayoutParams) scrambleImageView.getLayoutParams();

                    DisplayMetrics metrics = new DisplayMetrics();

                    Activity activity = PlaceholderFragment.this.getActivity();
                    WindowManager wm = activity.getWindowManager();
                    Display display = wm.getDefaultDisplay();

                    display.getMetrics(metrics);

                    params.width = (int) (size.width * metrics.density);
                    params.height = (int) (size.height * metrics.density);
                    scrambleImageView.setLayoutParams(params);
                } catch(SVGParseException e) {
                    Log.wtf(TAG, e);
                }
            }
        }

        private ScrambleTask scrambleTask;
        private void doScramble() {
            scrambleView.setText("Scrambling...");

            cancelScrambleIfScrambling();
            scrambleTask = new ScrambleTask();
            scrambleTask.execute(puzzle);
        }

        private void cancelScrambleIfScrambling() {
            if(scrambleTask != null && scrambleTask.getStatus() == AsyncTask.Status.RUNNING) {
                scrambleTask.cancel(true);
            }
        }

        @Override
        public void onStop() {
            super.onStop();
            cancelScrambleIfScrambling();
        }

        private String getShortName() {
            return getArguments().getString(ARG_SHORT_NAME);
        }

        @Override
        public void onAttach(Activity activity) {
            super.onAttach(activity);
            ((SessionActivity) activity).onSectionAttached(getShortName());
        }
    }

}
