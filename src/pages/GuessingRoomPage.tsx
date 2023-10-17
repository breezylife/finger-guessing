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
  CircularProgress,
} from "@mui/material";
import {
  faHandScissors,
  faHandRock,
  faHandPaper,
  faCircleChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import { firestore } from "firebaseConfig";
import { UserContext } from "App";
import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useCookies } from "react-cookie";

const GuessingRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const [cookies, setCookie, removeCookie] = useCookies();
  const { userInfo } = useContext(UserContext);
  const [players, setPlayers] = useState<any[]>([]);
  const [roomInfo, setRoomInfo] = useState<any>({});
  const [isGameProcessing, setIsGameProcessing] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  // const [isBackDropOpen, setIsBackDropOpen] = useState<boolean>(false);
  const [rpsResult, setRpsResult] = useState<string>("");

  useEffect(() => {
    if (!cookies.userid) {
      navigate("/entry");
    }
  }, []);

  useEffect(() => {
    handleRoomInfo(false);
    handlePlayers(false);
  }, []);

  const handleRoomInfo = async (isUnsubscribe: boolean) => {
    const unsubscribe = onSnapshot(
      doc(firestore, "rooms", roomId as string),
      (doc) => {
        if (isUnsubscribe) {
          unsubscribe();
        }
        setRoomInfo(doc.data());
        setIsGameProcessing(doc.data()?.isGameProcessing);
      }
    );
  };

  const handlePlayers = async (isUnsubscribe: boolean) => {
    const playersQuery = query(
      collection(firestore, "rooms", roomId as string, "players")
    );

    const unsubscribe = onSnapshot(playersQuery, async (querySnapshot) => {
      if (isUnsubscribe) {
        unsubscribe();
      }
      const playersData: any[] = querySnapshot.docs.map((doc) => {
        return {
          ...doc.data(),
          playerId: doc.id,
        };
      });

      if (playersData.length === 0) {
        await deleteDoc(doc(firestore, "rooms", roomId as string));
      }
      setPlayers(playersData);

      const roomRef = doc(firestore, "rooms", roomId as string);
      const roomSnap: any = (await getDoc(roomRef)).data();
      if (
        playersData.length > 0 &&
        playersData.length ===
          playersData.filter((player) => player.rpsResult).length &&
        roomSnap?.isGameProcessing &&
        !roomSnap?.isShowResult
      ) {
        setIsGameProcessing(false);
        const roomRef = doc(firestore, "rooms", roomId as string);
        updateDoc(roomRef, {
          isShowResult: true,
          isGameProcessing: false,
        });
      }
    });
  };

  const handleTask = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
    updateDoc(roomRef, {
      isGameProcessing: true,
      isShowResult: false,
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

  const handleRpsResults = async (rpsResult: string) => {
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
  };

  const handleLeaveRoom = async () => {
    removeCookie("selectedRoomId");
    removeCookie("playerId");
    navigate("/");

    await handlePlayers(true);
    await handleRoomInfo(true);

    await deleteDoc(
      doc(
        firestore,
        "rooms",
        roomId as string,
        "players",
        userInfo.playerId as string
      )
    );

    // const userRef = doc(firestore, "users", userInfo.userId);
    // await updateDoc(userRef, {
    //   playerId: deleteField(),
    //   selectedRoomId: deleteField(),
    // });
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
        <Box
          sx={{ float: "left", cursor: "pointer" }}
          onClick={handleLeaveRoom}
        >
          <FontAwesomeIcon icon={faCircleChevronLeft} size="3x" />
        </Box>
        <Box component="div" sx={{ marginLeft: "100px" }}>
          <h1>Room : {roomInfo?.roomName}</h1>
          {/* <h2>Room owner : {roomInfo?.creator}</h2> */}
          <div>
            <b>Things You Should Know</b>
            <ul>
              <li>Please name your task to begin. </li>
              <li>
                Once started, please choose your hand signal - either rock,
                paper or scissors. Results will be displayed after all
                participants have thrown their choices.{" "}
              </li>
            </ul>
            <b> Rules to Follow </b>
            <br />
            Rock beats scissors, scissors beat paper, and paper beats rock.
          </div>
          {/* {roomInfo?.creator !== userInfo.userName ? (
            <>
              <h3>Current Task Name: {roomInfo?.taskName}</h3>
              <Divider sx={{ margin: "20px 0" }} />
              {isGameProcessing && (
                <Typography textAlign={"center"}>Please threw !</Typography>
              )}
            </>
          ) : (
            <> */}
          <br />
          <h2> Current Task : {roomInfo?.taskName}</h2>

          {!isGameProcessing && (
            <>
              <TextField
                id="standard-basic"
                variant="standard"
                onChange={(e) => handleTask(e)}
                placeholder="Current Task"
                disabled={isGameProcessing}
              />
              <br />
              <br />
              <Button
                variant="contained"
                onClick={() => handleIsGameProcessing()}
              >
                Start!
              </Button>
            </>
          )}
          <br />
          <br />
        </Box>
        <Box>
          {isGameProcessing ? (
            <>
              <Divider sx={{ margin: "20px 0" }} />
              <CircularProgress />
              {/* <Typography textAlign={"center"}>Please threw !</Typography> */}
            </>
          ) : (
            <>
              <Divider sx={{ margin: "20px 0" }} />
            </>
          )}
          {/* </>
          )} */}
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
                <Stack
                  sx={{
                    width: "120px",
                    height: "120px",
                  }}
                >
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
                  {!roomInfo?.isShowResult &&
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
              sx={{ width: "120px", height: "120px", borderRadius: "120px" }}
              disabled={!isGameProcessing}
              onClick={() => {
                handleRpsResults("paper");
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
              sx={{ width: "120px", height: "120px", borderRadius: "120px" }}
              disabled={!isGameProcessing}
              onClick={() => {
                handleRpsResults("scissors");
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
              sx={{ width: "120px", height: "120px", borderRadius: "120px" }}
              disabled={!isGameProcessing}
              onClick={() => {
                handleRpsResults("rock");
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

      {/* <Box sx={{ position: "absolute", top: 30, right: 20 }}>
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
      </Box> */}
      {/* <ConfirmationDialog
        open={isDialogOpen}
        dialogContent={`Are you going to threw ${rpsResult}?`}
        handleClose={() => setIsDialogOpen(false)}
        hanldeConfirm={handleRpsResults}
      /> */}
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
