import { useEffect } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { setAuthToken } from '../services/api';

export const useAuth = () => {
    const { state, getAccessToken } = useAuthContext();

    useEffect(() => {
        const setupAuth = async () => {
            if (state.isAuthenticated) {
                try {
                    const token = await getAccessToken();
                    setAuthToken(token);
                } catch (error) {
                    setAuthToken(null);
                }
            } else {
                setAuthToken(null);
            }
        };

        setupAuth();
    }, [state.isAuthenticated, getAccessToken]);

    return { isAuthenticated: state.isAuthenticated };
};