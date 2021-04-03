import { useCallback, useEffect, useState } from "react";
import { Collapse } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchBestMbldAttempt,
    fetchSuggestedFmcTranslations,
} from "../api/tnoodle.api";
import {
    fetchMe,
    getCompetitionJson,
    getUpcomingManageableCompetitions,
    isLogged,
    logIn,
    logOut,
} from "../api/wca.api";
import logo from "../assets/tnoodle_logo.svg";
import RootState from "../model/RootState";
import {
    addCachedObject,
    addSuggestedFmcTranslations,
    setBestMbldAttempt,
    updateCompetitionId,
    updateCompetitionName,
    updateCompetitions,
    updateEditingStatus,
    updateFileZipBlob,
    updateMe,
    updateWcif,
} from "../redux/ActionCreators";
import { getDefaultCompetitionName } from "../util/competition.name.util";
import {
    deleteParameter,
    getQueryParameter,
    setQueryParameter,
} from "../util/query.param.util";
import { defaultWcif } from "../util/wcif.util";
import Loading from "./Loading";
import "./SideBar.css";

const SideBar = () => {
    const [loadingUser, setLoadingUser] = useState(false);
    const [loadingCompetitions, setLoadingCompetitions] = useState(false);
    const [loadingCompetitionInfo, setLoadingCompetitionInfo] = useState(false);

    const me = useSelector((state: RootState) => state.me);
    const competitions = useSelector((state: RootState) => state.competitions);
    const cachedObjects = useSelector(
        (state: RootState) => state.cachedObjects
    );
    const generatingScrambles = useSelector(
        (state: RootState) => state.generatingScrambles
    );
    const [isOpen, setIsOpen] = useState(true);

    const dispatch = useDispatch();

    const handleIsOpen = () => setIsOpen(window.innerWidth > 992);

    const init = () => {
        window.addEventListener("resize", handleIsOpen);

        if (!isLogged()) {
            return;
        }
        if (!me) {
            setLoadingUser(true);
            fetchMe()
                .then((me) => {
                    dispatch(updateMe(me));
                })
                .finally(() => setLoadingUser(false));
        }

        if (!competitions) {
            setLoadingCompetitions(true);
            getUpcomingManageableCompetitions()
                .then((competitions) =>
                    dispatch(updateCompetitions(competitions))
                )
                .finally(() => setLoadingCompetitions(false));
        }

        let competitionId = getQueryParameter("competitionId");
        if (!!competitionId) {
            handleCompetitionSelection(competitionId);
        }
    };

    const pluralize = (string: string, number: number) =>
        string + (number > 1 ? "s" : "");

    const handleManualSelection = () => {
        dispatch(updateEditingStatus(false));
        dispatch(updateCompetitionId());
        dispatch(updateWcif({ ...defaultWcif }));
        dispatch(setBestMbldAttempt());
        dispatch(updateCompetitionName(getDefaultCompetitionName()));
        dispatch(updateFileZipBlob());
        dispatch(addSuggestedFmcTranslations());

        deleteParameter("competitionId");
    };

    const getAndCacheBestMbldAttempt = useCallback(
        (wcif) => {
            fetchBestMbldAttempt(wcif).then((bestAttempt) => {
                if (!bestAttempt) {
                    return;
                }
                let attempted = bestAttempt.attempted;
                dispatch(
                    addCachedObject(wcif.id, "bestMbldAttempt", attempted)
                );
                dispatch(setBestMbldAttempt(attempted));
            });
        },
        [dispatch]
    );

    const getAndCacheSuggestedFmcTranslations = useCallback(
        (wcif) => {
            fetchSuggestedFmcTranslations(wcif).then((translations) => {
                dispatch(
                    addCachedObject(
                        wcif.id,
                        "suggestedFmcTranslations",
                        translations
                    )
                );
                dispatch(addSuggestedFmcTranslations(translations));
            });
        },
        [dispatch]
    );

    // In case we use competitionId from query params, it's not fetched.
    // We add it to the list.
    const maybeAddCompetition = useCallback(
        (competitionId, competitionName) => {
            if (!competitions) {
                return;
            }
            if (
                !competitions.find(
                    (competition) => competition.name === competitionName
                )
            ) {
                dispatch(
                    updateCompetitions([
                        ...competitions,
                        { id: competitionId, name: competitionName },
                    ])
                );
            }
        },
        [dispatch, competitions]
    );

    const setWcif = useCallback(
        (wcif) => {
            dispatch(updateEditingStatus(true));
            dispatch(updateWcif(wcif));
            dispatch(updateCompetitionId(wcif.id));
            dispatch(updateCompetitionName(wcif.name));
            dispatch(updateFileZipBlob());
        },
        [dispatch]
    );

    const handleCompetitionSelection = useCallback(
        (competitionId) => {
            setQueryParameter("competitionId", competitionId);

            // For quick switching between competitions.
            let cachedObject = cachedObjects[competitionId];
            if (!!cachedObject) {
                let cachedWcif = cachedObject.wcif;
                setWcif(cachedWcif);
                maybeAddCompetition(cachedWcif.id, cachedWcif.name);

                let cachedSuggestedFmcTranslations =
                    cachedObject.suggestedFmcTranslations;
                dispatch(
                    addSuggestedFmcTranslations(cachedSuggestedFmcTranslations)
                );

                let cachedBestMbldAttempt = cachedObject.bestMbldAttempt;
                dispatch(setBestMbldAttempt(cachedBestMbldAttempt));
            } else {
                setLoadingCompetitionInfo(true);

                getCompetitionJson(competitionId)
                    .then((wcif) => {
                        setWcif(wcif);
                        dispatch(addCachedObject(competitionId, "wcif", wcif));
                        maybeAddCompetition(wcif.id, wcif.name);
                        getAndCacheSuggestedFmcTranslations(wcif);
                        getAndCacheBestMbldAttempt(wcif);
                    })
                    .finally(() => setLoadingCompetitionInfo(false));
            }
        },
        [
            cachedObjects,
            dispatch,
            getAndCacheBestMbldAttempt,
            getAndCacheSuggestedFmcTranslations,
            maybeAddCompetition,
            setWcif,
        ]
    );

    useEffect(init, [competitions, dispatch, handleCompetitionSelection, me]);

    const logInButton = () => {
        return (
            <div id="login-area" className="w-100 mt-1">
                <button
                    type="button"
                    className="btn btn-primary btn-lg btn-block"
                    onClick={isLogged() ? logOut : logIn}
                    disabled={generatingScrambles}
                >
                    {isLogged() ? "Log Out" : "Log In"}
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
                                            onClick={() =>
                                                handleCompetitionSelection(
                                                    competition.id
                                                )
                                            }
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
