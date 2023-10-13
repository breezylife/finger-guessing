import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Divider,
  Typography,
  Grid,
  Stack,
  Avatar,
  Container,
  Button,
  TextField,
  Box,
} from "@mui/material";
import {
  faHandScissors,
  faHandRock,
  faHandPaper,
  faHandFist,
  faUsersLine,
} from "@fortawesome/free-solid-svg-icons";
import { firestore } from "firebaseConfig";
import { UserContext } from "App";
import { useCookies } from "react-cookie";
import {
  collection,
  doc,
  getDoc,
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
  const [isGameProcessing, setIsGameProcessing] = useState<boolean>(false);
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
      setIsGameProcessing(doc.data()?.isGameProcessing);
    });
  };

  const handlePlayers = async () => {
    const playersQuery = query(
      collection(firestore, "rooms", roomId as string, "players")
    );
    onSnapshot(playersQuery, (querySnapshot) => {
      const playersData: any[] = querySnapshot.docs.map((doc) => {
        return {
          ...doc.data(),
          playerId: doc.id,
          avatarColor: handleRandomColor(),
        };
      });
      setPlayers(playersData);
    });
  };

  const handleTask = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
  ) => {
    const roomRef = doc(firestore, "rooms", roomId as string);
    updateDoc(roomRef, { taskName: e.target.value });
  };

  const handleIsGameProcessing = async () => {
    const roomRef = doc(firestore, "rooms", roomId as string);
    const roomDocSnap = await getDoc(roomRef);
    updateDoc(roomRef, {
      isGameProcessing: !roomDocSnap.data()?.isGameProcessing,
    });
  };
  return (
    <>
      <Container>
        <Box component="div" textAlign={"center"}>
          <h1>Room : {roomInfo?.roomName}</h1>
          <h2>Room owner : {roomInfo?.creator}</h2>
          {roomInfo?.creator !== userName ? (
            <>
              <h3>Current Guessing Task : {roomInfo?.taskName}</h3>
              <Divider sx={{ margin: "20px 0" }} />
            </>
          ) : (
            <>
              <TextField
                id="standard-basic"
                label="Current Guessing Task"
                variant="standard"
                onBlur={(e) => handleTask(e)}
                disabled={isGameProcessing}
              />
              <br />
              <br />
              {isGameProcessing ? (
                <>
                  <Button
                    variant="contained"
                    onClick={() => handleIsGameProcessing()}
                  >
                    Cancel!
                  </Button>
                  <Divider sx={{ margin: "20px 0" }} />
                  <Typography textAlign={"center"}>
                    Let's RPS！ Please make a Deep Thinking{" "}
                  </Typography>
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    onClick={() => handleIsGameProcessing()}
                  >
                    Start!
                  </Button>
                  <Divider sx={{ margin: "20px 0" }} />
                </>
              )}
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
                      backgroundColor: player.avatarColor,
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
                      shake={isGameProcessing}
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
              variant="contained"
              sx={{ width: "200px", height: "200px", borderRadius: "200px" }}
              disabled={!isGameProcessing}
            >
              <FontAwesomeIcon
                icon={faHandPaper}
                size="6x"
                style={{ color: "#ffffff" }}
              />
            </Button>
            <Button
              variant="contained"
              sx={{ width: "200px", height: "200px", borderRadius: "200px" }}
              disabled={!isGameProcessing}
            >
              <FontAwesomeIcon
                icon={faHandScissors}
                size="6x"
                style={{ color: "#f5d538" }}
              />
            </Button>
            <Button
              variant="contained"
              sx={{ width: "200px", height: "200px", borderRadius: "200px" }}
              disabled={!isGameProcessing}
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

      <Box sx={{ position: "absolute", top: 30, right: 20 }}>
        <Avatar
          sx={{
            height: "150px",
            width: "150px",
            marginBottom: "10px",
          }}
          src="/broken-image.jpg"
        >
          <FontAwesomeIcon
            icon={faUsersLine}
            size="3x"
            style={{ color: "#ffffff" }}
          />
        </Avatar>
        <Typography textAlign="center">Audiences : {}</Typography>
      </Box>
    </>
  );
};

export default GuessingRoomPage;
