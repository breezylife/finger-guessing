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
  Backdrop,
  CircularProgress,
} from "@mui/material";
import {
  faHandScissors,
  faHandRock,
  faHandPaper,
  faHandFist,
  faUsersLine,
} from "@fortawesome/free-solid-svg-icons";
import { firestore } from "firebaseConfig";
import { IUserInfo, UserContext } from "App";
import { useCookies } from "react-cookie";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { handleRandomColor } from "function";
import ConfirmationDialog from "components/ConfirmationDialog";

const GuessingRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const [cookies] = useCookies();
  const { roomId } = useParams();
  const userContext = useContext(UserContext);
  const [players, setPlayers] = useState<any[]>([]);
  const [roomInfo, setRoomInfo] = useState<any>({});
  const [isGameProcessing, setIsGameProcessing] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<IUserInfo>({
    userName: "",
    userId: "",
    selectedRoomId: "",
    playerId: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  // const [isBackDropOpen, setIsBackDropOpen] = useState<boolean>(false);
  const [rpsResult, setRpsResult] = useState<string>("");

  useEffect(() => {
    if (!cookies.idToken) {
      navigate("/signin");
    }

    // room info listen
    handleRoomInfo();

    // room player listen
    handlePlayers();
  }, [userInfo]);

  useEffect(() => {
    if (userContext?.userInfo.userId) {
      setUserInfo({
        userName: userContext?.userInfo.userName as string,
        userId: userContext?.userInfo.userId as string,
        selectedRoomId: userContext?.userInfo.selectedRoomId as string,
        playerId: userContext?.userInfo.playerId as string,
      });
    }
  }, [userContext]);

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
    onSnapshot(playersQuery, async (querySnapshot) => {
      const playersData: any[] = querySnapshot.docs.map((doc) => {
        if (
          roomInfo &&
          roomInfo.isGameProcessing &&
          doc.data().userId === userInfo.userId &&
          doc.data().rpsResult
        ) {
          // console.log(doc.data().rpsResult);
          // setIsBackDropOpen(true);
        }
        return {
          ...doc.data(),
          playerId: doc.id,
          avatarColor: handleRandomColor(),
        };
      });

      setPlayers(playersData);

      if (
        playersData.length ===
        playersData.filter((player) => player.rpsResult).length
      ) {
        // const rpsMap = new Map<string, number>();

        // playersData.forEach((player) => {
        //   if (player.rpsResult === "scissors") {
        //     let currentCount = rpsMap.get("scissors") || 0;
        //     rpsMap.set("scissors", ++currentCount);
        //   } else if (player.rpsResult === "paper") {
        //     let currentCount = rpsMap.get("paper") || 0;
        //     rpsMap.set("paper", ++currentCount);
        //   } else if (player.rpsResult === "rock") {
        //     let currentCount = rpsMap.get("rock") || 0;
        //     rpsMap.set("rock", ++currentCount);
        //   }
        // });

        if (
          roomInfo &&
          roomInfo.isGameProcessing
          // &&
          // (rpsMap.size === 1 || rpsMap.size === 3)
        ) {
          setIsGameProcessing(false);
          // setIsBackDropOpen(false);

          const roomRef = doc(firestore, "rooms", roomId as string);
          const roomDocSnap = await getDoc(roomRef);
          updateDoc(roomRef, {
            isShowResult: !roomDocSnap.data()?.isShowResult,
            isGameProcessing: !roomDocSnap.data()?.isGameProcessing,
          });
        }
        // else {
        //   if (rpsMap.get("paper") && rpsMap.get("rock")) {
        //   }
        // }
      }
    });
  };

  const handleTask = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement, Element>
  ) => {
    const roomRef = doc(firestore, "rooms", roomId as string);
    updateDoc(roomRef, { taskName: e.target.value });
  };

  const handleIsGameProcessing = async () => {
    if (players.length < 2) {
      alert("Number of people is less than 2");
      return;
    }
    const roomRef = doc(firestore, "rooms", roomId as string);
    const roomDocSnap = await getDoc(roomRef);
    updateDoc(roomRef, {
      isGameProcessing: !roomDocSnap.data()?.isGameProcessing,
      isShowResult: !roomDocSnap.data()?.isShowResult,
    });

    const playersQuery = query(
      collection(firestore, "rooms", roomId as string, "players")
    );

    const querySnapshot = await getDocs(playersQuery);

    querySnapshot.forEach((doc) => {
      updateDoc(doc.ref, {
        rpsResult: "",
      });
    });
  };

  const handleRpsResults = async () => {
    const playerRef = doc(
      firestore,
      "rooms",
      roomId as string,
      "players",
      userInfo.playerId as string
    );

    updateDoc(playerRef, {
      rpsResult,
    });
    setIsDialogOpen(false);
    // setIsBackDropOpen(true);
  };

  // const handleRenderHandIcon = (player: { userId: string }) => {
  //   if (player.userId !== userContext?.userInfo.userId) {
  //     return (
  //       <FontAwesomeIcon
  //         icon={faHandFist}
  //         size="3x"
  //         shake={isGameProcessing}
  //         style={{ color: "#000000" }}
  //       />
  //     );
  //   }
  // };
  return (
    <>
      <Container>
        <Box component="div" textAlign={"center"}>
          <h1>Room : {roomInfo?.roomName}</h1>
          <h2>Room owner : {roomInfo?.creator}</h2>
          {roomInfo?.creator !== userInfo.userName ? (
            <>
              <h3>Current Guessing Task : {roomInfo?.taskName}</h3>
              <Divider sx={{ margin: "20px 0" }} />
              {isGameProcessing && (
                <Typography textAlign={"center"}>
                  Let's RPS！ Please make a Deep Thinking{" "}
                </Typography>
              )}
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
              <Grid
                key={player.playerId}
                item
                xs={2}
                sx={{ margin: "15px 35px" }}
              >
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
                    {player.userId !== userInfo.userId ? player.userName : "Me"}
                  </Avatar>
                  {!roomInfo.isShowResult &&
                  player.userId !== userInfo.userId ? (
                    <></>
                  ) : player.rpsResult === "paper" ? (
                    <FontAwesomeIcon
                      icon={faHandPaper}
                      size="3x"
                      style={{ color: "#fbd723" }}
                    />
                  ) : player.rpsResult === "scissors" ? (
                    <FontAwesomeIcon
                      icon={faHandScissors}
                      size="3x"
                      style={{ color: "#fbd723" }}
                    />
                  ) : player.rpsResult === "rock" ? (
                    <FontAwesomeIcon
                      icon={faHandRock}
                      size="3x"
                      style={{ color: "#fbd723" }}
                    />
                  ) : (
                    <></>
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
              onClick={() => {
                setIsDialogOpen(true);
                setRpsResult("paper");
              }}
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
              onClick={() => {
                setIsDialogOpen(true);
                setRpsResult("scissors");
              }}
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
              onClick={() => {
                setIsDialogOpen(true);
                setRpsResult("rock");
              }}
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
            height: "100px",
            width: "100px",
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
      <ConfirmationDialog
        open={isDialogOpen}
        dialogContent={`Are you going to threw ${rpsResult}?`}
        handleClose={() => setIsDialogOpen(false)}
        hanldeConfirm={handleRpsResults}
      />
      {/* <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isBackDropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop> */}
    </>
  );
};

export default GuessingRoomPage;
