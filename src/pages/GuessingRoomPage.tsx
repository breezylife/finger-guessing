import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHandScissors,
  faHandRock,
  faHandPaper,
  faHandFist,
} from "@fortawesome/free-solid-svg-icons";
import { firestore } from "firebaseConfig";
import { UserContext } from "App";
import { useCookies } from "react-cookie";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import { handleRandomColor } from "function";

const GuessingRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const [cookies] = useCookies();
  const { roomId } = useParams();
  const userContext = useContext(UserContext);
  const [players, setPlayers] = useState<any[]>([]);
  const [roomInfo, setRoomInfo] = useState<any>({});
  const userName = userContext?.userInfo.userName;
  useEffect(() => {
    if (!cookies.idToken) {
      navigate("/signin");
    }

    // room info listen
    handleRoomInfo();

    // room player listen
    handlePlayers();
  }, []);

  const handleRoomInfo = async () => {
    onSnapshot(doc(firestore, "rooms", roomId as string), (doc) => {
      setRoomInfo(doc.data());
    });
  };

  const handlePlayers = async () => {
    const playersQuery = query(
      collection(firestore, "rooms", roomId as string, "players")
    );
    onSnapshot(playersQuery, (querySnapshot) => {
      const playersData: any[] = querySnapshot.docs.map((doc) => {
        return { ...doc.data(), playerId: doc.id };
      });
      setPlayers(playersData);
    });
  };

  const handleTask = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
  ) => {
    const id = roomId as string;
    const roomRef = doc(firestore, "rooms", id);
    updateDoc(roomRef, { taskName: e.target.value });
  };
  return (
    <>
      <Container>
        <Box component="div" textAlign={"center"}>
          <h1>Room : {roomInfo?.roomName}</h1>
          <h2>Room owner : {roomInfo?.creator}</h2>
          {roomInfo?.creator !== userName ? (
            <h3>Current Guessing Task : {roomInfo?.taskName}</h3>
          ) : (
            <>
              <TextField
                id="standard-basic"
                label="Current Guessing Task"
                variant="standard"
                onBlur={(e) => handleTask(e)}
              />
              <br />
              <br />
              <Button variant="contained">Start!</Button>
            </>
          )}
        </Box>
        <Box
          component="div"
          sx={{
            margin: "50px 0",
          }}
        >
          <Grid container spacing={2}>
            {players.map((player) => (
              <Grid item xs={2} sx={{ margin: "15px 35px" }}>
                <Stack sx={{ height: "150px", width: "150px" }}>
                  <Avatar
                    sx={{
                      height: "100%",
                      width: "100%",
                      marginBottom: "10px",
                      backgroundColor: handleRandomColor(),
                    }}
                    src="/broken-image.jpg"
                  >
                    {player.userId !== userContext?.userInfo.userId
                      ? player.userName
                      : "Me"}
                  </Avatar>
                  {player.userId !== userContext?.userInfo.userId && (
                    <FontAwesomeIcon
                      icon={faHandFist}
                      size="3x"
                      shake={false}
                      style={{ color: "#000000" }}
                    />
                  )}
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>
        <Divider />
        <Box sx={{ "& button": { m: 2 }, marginTop: "20px" }}>
          <Stack direction="row" justifyContent="center">
            <Button
              variant="outlined"
              sx={{ width: "200px", height: "200px", borderRadius: "200px" }}
            >
              <FontAwesomeIcon
                icon={faHandPaper}
                size="6x"
                style={{ color: "#346fd5" }}
              />
            </Button>
            <Button
              variant="outlined"
              sx={{ width: "200px", height: "200px", borderRadius: "200px" }}
            >
              <FontAwesomeIcon
                icon={faHandScissors}
                size="6x"
                style={{ color: "#f5d538" }}
              />
            </Button>
            <Button
              variant="outlined"
              sx={{ width: "200px", height: "200px", borderRadius: "200px" }}
            >
              <FontAwesomeIcon
                icon={faHandRock}
                size="6x"
                style={{ color: "#ff0000" }}
              />
            </Button>
          </Stack>
        </Box>
      </Container>
    </>
  );
};

export default GuessingRoomPage;
