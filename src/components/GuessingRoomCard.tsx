import React from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export const GuessingRoomCard = ({
  roomName,
  roomId,
  handleJoinGuessingRoom,
}: {
  roomName: string;
  roomId: string;
  handleJoinGuessingRoom: (roomId: string) => void;
}) => {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        component="img"
        alt="green iguana"
        height="140"
        image="https://picsum.photos/400"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {roomName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {""}
        </Typography>
      </CardContent>
      <CardActions sx={{ textAlign: "center" }}>
        <Button size="small" onClick={() => handleJoinGuessingRoom(roomId)}>
          Enter
        </Button>
      </CardActions>
    </Card>
  );
};
