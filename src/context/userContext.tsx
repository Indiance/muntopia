import React, { createContext, useState, ReactNode, FC } from 'react';

// Define the types for the context value
interface UserContextType {
    contextEmail: string | null;
    setContextEmail: React.Dispatch<React.SetStateAction<string | null>>;
    contextOrgName: string | null;
    setContextOrgName: React.Dispatch<React.SetStateAction<string | null>>;
}

// Create the context with the defined type
const UserContext = createContext<UserContextType | undefined>(undefined);

// Define the types for the provider props
interface UserProviderProps {
    children: ReactNode;
}

const UserProvider: FC<UserProviderProps> = ({ children }) => {
    const [contextEmail, setContextEmail] = useState<string | null>(null);
    const [contextOrgName, setContextOrgName] = useState<string | null>(null);

    return (
        <UserContext.Provider value={{ contextEmail, setContextEmail, contextOrgName, setContextOrgName }}>
            {children}
        </UserContext.Provider>
    );
};

export { UserContext, UserProvider };
