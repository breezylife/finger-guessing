import React, { createContext, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  LobbyPage,
  SigninPage,
  SignupPage,
  GuessingRoomPage,
  EntrancePage,
} from "pages";
import { useCookies } from "react-cookie";

export interface IUserInfo {
  userName: string;
  userId: string;
  selectedRoomId?: string;
  playerId?: string;
}

interface AuthContextInterface {
  userInfo: IUserInfo;
  setUserInfo: React.Dispatch<React.SetStateAction<IUserInfo>>;
}

export const UserContext = createContext<AuthContextInterface>({
  userInfo: {
    userName: "",
    userId: "",
    selectedRoomId: "",
    playerId: "",
  },
  setUserInfo: () => {},
});

const App: React.FC = () => {
  const [cookies, setCookie, removeCookie] = useCookies();
  const [userInfo, setUserInfo] = useState<IUserInfo>({
    userName: "",
    userId: "",
    selectedRoomId: "",
    playerId: "",
  });

  useEffect(() => {
    setUserInfo({
      userName: cookies.username,
      userId: cookies.userid,
      selectedRoomId: cookies.selectedRoomId,
      playerId: cookies.playerId,
    });
    // removeCookie("id");
  }, []);

  return (
    <UserContext.Provider value={{ userInfo, setUserInfo }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" Component={LobbyPage} />
          <Route path="/entry" Component={EntrancePage} />
          {/* <Route path="/signup" Component={SignupPage} />
          <Route path="/signin" Component={SigninPage} /> */}
          <Route path="/guessingRoom/:roomId" Component={GuessingRoomPage} />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
};

export default App;
