import { useCallback, useEffect, useMemo, useState } from "react";
import { Collapse } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import tnoodleApi from "../api/tnoodle.api";
import wcaApi from "../api/wca.api";
import logo from "../assets/tnoodle_logo.svg";
import RootState from "../model/RootState";
import { addCachedObject, setIsManualSelection } from "../redux/slice/InformationSlice";
import {
    setBestMbldAttempt,
    setSuggestedFmcTranslations,
} from "../redux/slice/EventDataSlice";
import { setFileZip } from "../redux/slice/ScramblingSlice";
import {
    setCompetitionName,
    setWcif,
} from "../redux/slice/WcifSlice";
import { getDefaultCompetitionName } from "../util/competition.name.util";
import {
    deleteParameter,
    getQueryParameter,
    setQueryParameter,
} from "../util/query.param.util";
import { defaultWcif } from "../util/wcif.util";
import Loading from "./Loading";
import "./SideBar.css";
import Wcif from "../model/Wcif";
import { setShowColorPicker } from "../redux/slice/SettingsSlice";
import Competition from "../model/Competition";
import Person from "../model/Person";

const SideBar = () => {
    const [loadingUser, setLoadingUser] = useState(false);
    const [loadingCompetitions, setLoadingCompetitions] = useState(false);
    const [loadingCompetitionInfo, setLoadingCompetitionInfo] = useState(false);

    const cachedObjects = useSelector(
        (state: RootState) => state.informationSlice.cachedObjects
    );
    const wcif = useSelector(
        (state: RootState) => state.wcifSlice.wcif
    );
    const generatingScrambles = useSelector(
        (state: RootState) => state.scramblingSlice.generatingScrambles
    );
    const showColorPicker = useSelector(
        (state: RootState) => state.settingsSlice.showColorPicker
    );

    const [me, setMe] = useState<Person>();
    const [upcomingCompetitions, setUpcomingCompetitions] = useState<Competition[]>();

    const [isOpen, setIsOpen] = useState(true);

    const handleIsOpen = useCallback(() => setIsOpen(window.innerWidth > 992), [setIsOpen]);

    useEffect(() => {
        window.addEventListener("resize", handleIsOpen);

        return () => window.removeEventListener("resize", handleIsOpen)
    }, [handleIsOpen]);

    useEffect(() => {
        if (!wcaApi.isLogged()) {
            return;
        }

        if (!me) {
            setLoadingUser(true);

            wcaApi
                .fetchMe()
                .then((response) => setMe(response.data.me))
                .finally(() => setLoadingUser(false));
        }

        if (!upcomingCompetitions) {
            setLoadingCompetitions(true);

            wcaApi
                .getUpcomingManageableCompetitions()
                .then((response) => setUpcomingCompetitions(response.data))
                .finally(() => setLoadingCompetitions(false));
        }
    }, [upcomingCompetitions, me]);

    const competitions = useMemo(() => {
        if (wcif.id === defaultWcif.id || wcif.name === getDefaultCompetitionName()) {
            return upcomingCompetitions || [];
        }

        if (upcomingCompetitions === undefined) {
            return [{ id: wcif.id, name: wcif.name }];
        }

        const queryParamId = getQueryParameter("competitionId");
        const isUpcoming = upcomingCompetitions.some((comp) => comp.id === queryParamId);

        if (isUpcoming) {
            return upcomingCompetitions;
        } else {
            return [
                ...upcomingCompetitions,
                { id: wcif.id, name: wcif.name }
            ]
        }
    }, [wcif, upcomingCompetitions]);

    const dispatch = useDispatch();

    const pluralize = (string: string, number: number) =>
        string + (number > 1 ? "s" : "");

    const handleManualSelection = () => {
        dispatch(setIsManualSelection(true));
        dispatch(setWcif({ ...defaultWcif }));
        dispatch(setBestMbldAttempt());
        dispatch(setCompetitionName(getDefaultCompetitionName()));
        dispatch(setFileZip());
        dispatch(setSuggestedFmcTranslations());

        deleteParameter("competitionId");
    };

    const getAndCacheBestMbldAttempt = useCallback(
        (wcif: Wcif) => {
            tnoodleApi.fetchBestMbldAttempt(wcif).then((response) => {
                const attempted = response.data?.attempted;

                if (!!attempted) {
                    dispatch(
                        addCachedObject({
                            competitionId: wcif.id,
                            identifier: "bestMbldAttempt",
                            object: attempted,
                        })
                    );
                    dispatch(setBestMbldAttempt(attempted));
                }
            });
        },
        [dispatch]
    );

    const getAndCacheSuggestedFmcTranslations = useCallback(
        (wcif: Wcif) => {
            tnoodleApi.fetchSuggestedFmcTranslations(wcif).then((response) => {
                dispatch(
                    addCachedObject({
                        competitionId: wcif.id,
                        identifier: "suggestedFmcTranslations",
                        object: response.data,
                    })
                );
                dispatch(setSuggestedFmcTranslations(response.data));
            });
        },
        [dispatch]
    );

    const updateWcif = useCallback(
        (wcif: Wcif) => {
            dispatch(setIsManualSelection(false));
            dispatch(setWcif(wcif));
            dispatch(setCompetitionName(wcif.name));
            dispatch(setFileZip());
        },
        [dispatch]
    );

    const loadCompetition = useCallback(
        (competitionId: string | null) => {
            if (competitionId === null) {
                return;
            }

            if (wcif.id === competitionId) {
                return;
            }

            // For quick switching between competitions.
            let cachedObject = cachedObjects[competitionId];

            if (!!cachedObject) {
                updateWcif(cachedObject.wcif);

                let cachedSuggestedFmcTranslations = cachedObject.suggestedFmcTranslations;
                dispatch(setSuggestedFmcTranslations(cachedSuggestedFmcTranslations));

                let cachedBestMbldAttempt = cachedObject.bestMbldAttempt;
                dispatch(setBestMbldAttempt(cachedBestMbldAttempt));
            } else {
                setLoadingCompetitionInfo(true);

                wcaApi
                    .getCompetitionJson(competitionId)
                    .then((response) => {
                        updateWcif(response.data);
                        dispatch(
                            addCachedObject({
                                competitionId,
                                identifier: "wcif",
                                object: response.data,
                            })
                        );
                        getAndCacheSuggestedFmcTranslations(response.data);
                        getAndCacheBestMbldAttempt(response.data);
                    })
                    .finally(() => setLoadingCompetitionInfo(false));
            }
        },
        [
            dispatch,
            wcif.id,
            cachedObjects,
            getAndCacheBestMbldAttempt,
            getAndCacheSuggestedFmcTranslations,
            updateWcif,
        ]
    );

    useEffect(() => {
        const queryParamId = getQueryParameter("competitionId");

        if (wcif.id !== queryParamId) {
            loadCompetition(queryParamId);
        }
    }, [loadCompetition, wcif.id]);

    const handleCompetitionSelection = useCallback((competitionId: string) => {
        setQueryParameter("competitionId", competitionId);
        loadCompetition(competitionId);
    }, [loadCompetition]);

    const logInButton = () => {
        return (
            <div id="login-area" className="w-100 mt-1">
                <button
                    type="button"
                    className="btn btn-primary btn-lg btn-block"
                    onClick={wcaApi.isLogged() ? wcaApi.logOut : wcaApi.logIn}
                    disabled={generatingScrambles}
                >
                    {wcaApi.isLogged() ? "Log Out" : "Log In"}
                </button>
                {!!me && (
                    <p className="text-white mt-2">
                        Welcome, {me.name}.
                        {!!competitions &&
                            ` You have ${
                                competitions.length
                            } manageable ${pluralize(
                                " competition",
                                competitions.length
                            )} upcoming.`}
                    </p>
                )}
            </div>
        );
    };

    const loadingElement = (text: string) => (
        <div className="text-white">
            <Loading />
            <p>{text}...</p>
        </div>
    );

    const loadingArea = () => {
        if (loadingUser) {
            return loadingElement("Loading user");
        }

        if (loadingCompetitions) {
            return loadingElement("Loading competitions");
        }

        if (loadingCompetitionInfo) {
            return loadingElement("Loading competition information");
        }
    };

    const settingsArea = () => (
        <div className="custom-control custom-switch text-white">
            <input
                type="checkbox"
                className="custom-control-input"
                id="colorPicker"
                disabled={generatingScrambles}
                checked={showColorPicker}
                onChange={(e) => dispatch(setShowColorPicker(e.target.checked))}
            />
            <label className="custom-control-label" htmlFor="colorPicker">
                Show color scheme pickers
            </label>
        </div>
    );

    return (
        <div className="h-100 pb-2">
            <div className="d-flex flex-lg-column align-items-center overflow-hidden">
                <img
                    className="tnoodle-logo mt-2"
                    src={logo}
                    alt="TNoodle logo"
                />
                <h1 className="display-3" id="title">
                    TNoodle
                </h1>
                <button
                    type="button"
                    className="btn btn-primary btn-lg btn-outline-light ml-auto d-lg-none"
                    onClick={() => setIsOpen(!isOpen)}
                    disabled={generatingScrambles}
                    aria-label="Toggle menu"
                    aria-expanded={isOpen}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 30 30"
                        width={30}
                        height={30}
                    >
                        <path
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeMiterlimit={10}
                            d="M4 7h22M4 15h22M4 23h22"
                        />
                    </svg>
                </button>
            </div>
            <Collapse in={isOpen}>
                <div className="pt-2">
                    {settingsArea()}
                    <div>
                        <ul className="list-group">
                            <li>
                                {!!competitions && competitions.length > 0 && (
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-lg btn-block btn-outline-light mb-1"
                                        onClick={handleManualSelection}
                                        disabled={generatingScrambles}
                                    >
                                        Manual Selection
                                    </button>
                                )}
                            </li>
                            {!!competitions &&
                                competitions.map((competition) => (
                                    <li key={competition.id}>
                                        <button
                                            type="button"
                                            className="btn btn-primary btn-lg btn-block m-1"
                                            disabled={generatingScrambles}
                                            onClick={() => handleCompetitionSelection(competition.id)}
                                        >
                                            {competition.name}
                                        </button>
                                    </li>
                                ))}
                        </ul>
                        {loadingArea()}
                    </div>
                    {logInButton()}
                </div>
            </Collapse>
        </div>
    );
};

export default SideBar;
