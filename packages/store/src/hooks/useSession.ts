import { useAppSelector } from '../hooks';

export const useSession = () => {
    // const dispatch = useAppDispatch();
    const session = useAppSelector((state) => state.auth?.user); // Assuming user info is in auth slice for now

    const switchEntity = async (entityId: string) => {
        // Call API
        // const data = await sessionService.switchEntity(entityId);
        // Dispatch updates
        // dispatch(setEntity(data.entity));
        // dispatch(setEntityPreferences(data.preferences));
        console.log('Switching to entity', entityId);
    };

    return {
        session: { user: session }, // Wrap to match expected structure in Header
        switchEntity
    };
};
