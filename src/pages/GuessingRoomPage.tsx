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
import { ref, push, update, onValue, child, get } from "firebase/database";
import { fireDatabase } from "firebaseConfig";
import { UserContext } from "App";

const GuessingRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const userContext = useContext(UserContext);
  const [players, setPlayers] = useState<any[]>([]);
  const [roomInfo, setRoomInfo] = useState<{
    roomName: string;
    creator: string;
    taskName: string;
  }>({ roomName: "", creator: "", taskName: "" });
  const userName = userContext?.userInfo.userName;
  useEffect(() => {
    // room info listen
    const roomRef = ref(fireDatabase, `rooms/${roomId}`);
    onValue(roomRef, (snapshot) => {
      setRoomInfo(snapshot.val());
    });

    // room player listen
    const playerListRef = ref(fireDatabase, `rooms/${roomId}/players`);
    onValue(playerListRef, (snapshot) => {
      if (snapshot) {
        const playerData = [];
        for (let key in snapshot.val()) {
          playerData.push({ ...snapshot.val()[key], roomId: key });
        }

        setPlayers(playerData);
      }
    });
  }, []);

  // const isRoomExisting = (roomId: string | undefined) => {
  //   get(child(ref(fireDatabase), `rooms/${roomId}`))
  //     .then((snapshot) => {
  //       if (!snapshot.exists()) {
  //         navigate("/");
  //       }
  //       setRoomInfo(snapshot.val());
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  // };

  const handleTask = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
  ) => {
    const roomRef = ref(fireDatabase, `rooms/${roomId}`);
    update(roomRef, { taskName: e.target.value });
  };
  return (
    <>
      <Container>
        <Box component="div" textAlign={"center"}>
          <h1>Room : {roomInfo.roomName}</h1>
          <h2>Room owner : {roomInfo.creator}</h2>
          {roomInfo.creator !== userName ? (
            <h3>Current Guessing Task : {roomInfo.taskName}</h3>
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
                    sx={{ height: "100%", width: "100%", marginBottom: "10px" }}
                    src="/broken-image.jpg"
                  >
                    {player.userName}
                  </Avatar>
                  <FontAwesomeIcon
                    icon={faHandFist}
                    size="3x"
                    shake={false}
                    style={{ color: "#000000" }}
                  />
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
