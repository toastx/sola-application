/**
 * This handler is responsible for creating users, ensuring authentication and other user related tasks.
 */
import { create } from 'zustand';
import { getAccessToken } from '@privy-io/react-auth';
import { toast } from 'sonner';
import { useSettingsHandler } from './SettingsHandler.ts';

interface UserHandler {
  authToken: string | null; // null represents the auth token has not been set yet
  /**
   * true when the UserHandler has completed its login function and is ready for
   * other stores to begin their setup process
   */
  ready: boolean;

  /**
   * Called when any server retursn that the token has expired. This is called and
   * the request is retried with the new token. Returns false if privy does not return
   * an auth token meaning the user has most likely signed out.
   */
  updateAuthToken: () => Promise<boolean>;

  /**
   * Main function that runs when an authenticated user logs in. This function is called after Privy initiates login
   * but before other stores begin their setup process. Use this function to fetch any user specific data before other
   * stores require it
   * Currently performs the following options:
   * 1. Fetches the latest auth token from privy and sets it internally for user in state
   * 2. Fetches the user settings from the settings handler and applies it to required handlers
   * 3. Initializes chatRooms by fetching the user's chat rooms
   */
  login: () => Promise<boolean>;
}

export const useUserHandler = create<UserHandler>((set) => {
  return {
    currentUser: null,
    authToken: null,
    ready: false,

    updateAuthToken: async (): Promise<boolean> => {
      // get the latest auth token from privy
      const authToken = await getAccessToken();
      if (!authToken) {
        toast.error('Something Went Wrong. Please Login Again');
        return false;
      }
      return true;
    },

    login: async (): Promise<boolean> => {
      // get the latest auth token from privy
      const authToken = await getAccessToken();
      if (!authToken) {
        toast.error('Something Went Wrong. Please Login Again');
        return false;
      }
      set({ authToken });
      // fetch the user settings from the settings handler
      await useSettingsHandler.getState().getSettings();
      set({ ready: true });
      return true;
    },
  };
});
