import { useDispatch, useSelector } from 'react-redux';
// Use throughout your app instead of plain `useDispatch` and `useSelector`
export * from './hooks/useMenu';
export * from './hooks/useSession';
export const useAppDispatch = () => useDispatch();
export const useAppSelector = useSelector;
