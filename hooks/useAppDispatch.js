import { useDispatch, useSelector } from 'react-redux';

// Typed dispatch hook
export const useAppDispatch = () => useDispatch();

// Typed selector hook
export const useAppSelector = (selector) => useSelector(selector);
