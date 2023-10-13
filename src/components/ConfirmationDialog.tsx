import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

const ConfirmationDialog = ({
  open,
  dialogContent,
  handleClose,
  hanldeConfirm,
}: {
  open: boolean;
  dialogContent: string;
  handleClose: () => void;
  hanldeConfirm: () => void;
}) => {
  //   const [open, setOpen] = React.useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <div>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogContent}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose}>
            No
          </Button>
          <Button autoFocus onClick={hanldeConfirm}>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ConfirmationDialog;
