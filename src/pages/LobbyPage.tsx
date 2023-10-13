import React, { useContext, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { ref, push, set, onValue, onChildAdded } from "firebase/database";
import { fireDatabase } from "firebaseConfig";
import { GuessingRoomCard } from "components/GuessingRoomCard";
import { UserContext } from "App";

interface Props {
  roomName: string;
  creator: string;
  content?: string;
  roomId: string;
}

const LobbyPage: React.FC = () => {
  const navigate = useNavigate();
  const [cookies, setCookie] = useCookies();
  const userContext = useContext(UserContext);
  const [newGuessingRoom, setNewGuessingRoom] = useState({
    roomName: "",
  });
  const [guessingRooms, setGuessingRooms] = useState<any[]>([]);
  const userName = userContext?.userInfo.userName;

  useEffect(() => {
    if (!cookies.idToken) {
      navigate("/signin");
    }

    if (cookies.idToken?.selectedRoomId) {
      navigate(`/guessingRoom/${cookies.idToken.selectedRoomId}`);
    }

    // read rooms data
    const roomListRef = ref(fireDatabase, "rooms");
    onValue(roomListRef, (snapshot) => {
      if (snapshot) {
        const roomData = [];
        for (let key in snapshot.val()) {
          roomData.push({ ...snapshot.val()[key], roomId: key });
        }

        setGuessingRooms(roomData);
      }
    });
  }, []);

  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCreateRoom = async () => {
    await handleCreateGuessingRoom({ ...newGuessingRoom, creator: userName });
    setOpen(false);
  };

  const handleCreateGuessingRoom = (roomInfo: {
    roomName: string;
    creator: string | undefined;
  }) => {
    // create new room
    const roomListRef = ref(fireDatabase, "rooms");
    const newRoomRef = push(roomListRef);
    set(newRoomRef, roomInfo);

    const roomId = newRoomRef.key as string;
    handleJoinGuessingRoom(roomId);
  };

  const handleJoinGuessingRoom = (roomId: string) => {
    const userListRef = ref(fireDatabase, `rooms/${roomId}/players`);
    const newUserRef = push(userListRef);

    userContext?.setUserInfo({
      ...userContext.userInfo,
      selectedRoomId: roomId,
    });
    setCookie("idToken", { ...cookies.idToken, selectedRoomId: roomId });

    set(newUserRef, { userName });
    navigate(`/guessingRoom/${roomId}`);
  };

  return (
    <>
      <Box
        component="form"
        sx={{
          margin: "30px",
        }}
        noValidate
        autoComplete="off"
      >
        <div>
          Wellcome {userName} to this game, please try to entry a guessing room
        </div>
        <br />
        <br />
        <Button
          sx={{ float: "right" }}
          variant="outlined"
          onClick={handleClickOpen}
        >
          Create New Guessing Room
        </Button>
        <Grid container spacing={2}>
          {guessingRooms.map((room: Props) => (
            <Grid item xs={4}>
              <GuessingRoomCard
                creator={room.creator}
                content={""}
                roomId={room.roomId}
                handleJoinGuessingRoom={handleJoinGuessingRoom}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create New Room</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Note: You will be this room master and host the finger guessing
            game.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="roomName"
            label="Room Name"
            type="text"
            fullWidth
            variant="standard"
            onChange={(e) =>
              setNewGuessingRoom({
                ...newGuessingRoom,
                roomName: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleCreateRoom}>Create</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LobbyPage;
