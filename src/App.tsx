import React, { createContext, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LobbyPage, SigninPage, SignupPage, GuessingRoomPage } from "pages";
import { useCookies } from "react-cookie";

interface IUserInfo {
  userName: string;
  selectedRoomId?: string;
}

export const UserContext = createContext<{
  userInfo: IUserInfo;
  setUserInfo: React.Dispatch<React.SetStateAction<IUserInfo>>;
} | null>(null);

const App: React.FC = () => {
  const [cookies] = useCookies();
  const [userInfo, setUserInfo] = useState<IUserInfo>({
    userName: "",
    selectedRoomId: "",
  });

  useEffect(() => {
    // read user info from cookie
    setUserInfo({
      userName: cookies?.idToken?.userName,
      selectedRoomId: cookies?.idToken?.selectedRoomId,
    });
  }, []);

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" Component={LobbyPage} />
          <Route path="/signup" Component={SignupPage} />
          <Route path="/signin" Component={SigninPage} />
          <Route path="/guessingRoom/:roomId" Component={GuessingRoomPage} />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
};

export default App;