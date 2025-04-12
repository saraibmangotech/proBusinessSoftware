import { useContext } from 'react';
import { AuthContext } from './CreateContext';

export const useAuth = () => useContext(AuthContext)
