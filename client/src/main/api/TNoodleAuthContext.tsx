import React, { type ReactNode } from "react";
import { AuthProvider } from "react-oidc-context";
import oidcConfig, { gotoPreLoginPath } from "./wca.oidc";

const TNoodleAuthContext = ({ children }: { children: ReactNode }) => {
    return (
        <AuthProvider {...oidcConfig} onSigninCallback={gotoPreLoginPath}>
            {children}
        </AuthProvider>
    );
};

export default TNoodleAuthContext;
