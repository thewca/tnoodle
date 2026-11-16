import React, { type ReactNode } from "react";
import { UserManager } from "oidc-client-ts";
import { AuthContext } from "react-oidc-context";

const userManager = new UserManager({
    authority: "testing_uri",
    client_id: "testing_client",
    redirect_uri: "testing_redirect",
});

const MockAuthContext = ({
    children,
    isAuthenticated = false,
    isLoading = false,
}: {
    children: ReactNode;
    isAuthenticated?: boolean;
    isLoading?: boolean;
}) => {
    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                settings: userManager.settings,
                events: userManager.events,
                clearStaleState: userManager.clearStaleState,
                signinPopup: userManager.signinPopup,
                signinSilent: userManager.signinSilent,
                signinRedirect: userManager.signinRedirect,
                signinResourceOwnerCredentials:
                    userManager.signinResourceOwnerCredentials,
                signoutRedirect: userManager.signoutRedirect,
                signoutPopup: userManager.signoutPopup,
                signoutSilent: userManager.signoutSilent,
                querySessionStatus: userManager.querySessionStatus,
                revokeTokens: userManager.revokeTokens,
                startSilentRenew: userManager.startSilentRenew,
                stopSilentRenew: userManager.stopSilentRenew,
                removeUser: userManager.removeUser,
                user: {
                    session_state: null,
                    access_token: "",
                    token_type: "",
                    state: undefined,
                    expires_in: undefined,
                    expired: undefined,
                    scopes: [],
                    profile: {
                        name: "",
                        email: "",
                        sub: "",
                        iss: "",
                        aud: "",
                        exp: 0,
                        iat: 0,
                    },
                    toStorageString: () => "",
                },
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default MockAuthContext;
